'use server'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/db'
import {
  concepts,
  conceptSubjects,
  conceptTags,
  conceptTopics,
  subjects,
  subjectConceptOrders,
  tags,
  topics,
} from '@/db/schema'
import { conceptInputSchema, updateConceptContentSchema } from '@/lib/validations'
import type { Concept, ConceptInput, ConceptPriority, ConceptState } from '@/lib/types'

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function requireAuth(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

// ---------------------------------------------------------------------------
// Resolve-or-create helper: given a list of names + table, return their IDs.
// Creates any that don't already exist for this user.
// ---------------------------------------------------------------------------

async function resolveOrCreate(
  userId: string,
  names: string[],
  table: typeof subjects | typeof topics | typeof tags
): Promise<string[]> {
  if (names.length === 0) return []

  const trimmed = names.map((n) => n.trim()).filter(Boolean)
  if (trimmed.length === 0) return []

  // Fetch existing rows for this user
  const existing = await db
    .select({ id: table.id, name: table.name })
    .from(table)
    .where(eq(table.userId, userId))

  const existingMap = new Map(existing.map((r) => [r.name.toLowerCase(), r.id]))
  const ids: string[] = []
  const toInsert: { userId: string; name: string }[] = []

  for (const name of trimmed) {
    const key = name.toLowerCase()
    if (existingMap.has(key)) {
      ids.push(existingMap.get(key)!)
    } else {
      const tempId = crypto.randomUUID()
      existingMap.set(key, tempId)
      toInsert.push({ userId, name })
      ids.push(tempId)
    }
  }

  if (toInsert.length > 0) {
    const inserted = await db
      .insert(table)
      .values(toInsert)
      .onConflictDoNothing()
      .returning({ id: table.id, name: table.name })

    // Re-fetch to get correct IDs (onConflictDoNothing may skip inserts)
    const refetched = await db
      .select({ id: table.id, name: table.name })
      .from(table)
      .where(
        and(
          eq(table.userId, userId),
          inArray(
            table.name,
            toInsert.map((r) => r.name)
          )
        )
      )

    const refetchedMap = new Map(refetched.map((r) => [r.name.toLowerCase(), r.id]))

    // Replace temp IDs with real IDs
    return trimmed.map((name) => {
      const key = name.toLowerCase()
      return refetchedMap.get(key) ?? existingMap.get(key)!
    })
  }

  return ids
}

// ---------------------------------------------------------------------------
// Prune orphaned subjects/topics/tags for a user
// (rows no longer referenced by any concept)
// ---------------------------------------------------------------------------

async function pruneOrphans(userId: string): Promise<void> {
  // Subjects with no concepts
  const usedSubjectIds = db
    .select({ subjectId: conceptSubjects.subjectId })
    .from(conceptSubjects)
    .innerJoin(concepts, eq(concepts.id, conceptSubjects.conceptId))
    .where(eq(concepts.userId, userId))

  await db
    .delete(subjects)
    .where(
      and(
        eq(subjects.userId, userId),
        sql`${subjects.id} NOT IN (${usedSubjectIds})`
      )
    )

  // Topics
  const usedTopicIds = db
    .select({ topicId: conceptTopics.topicId })
    .from(conceptTopics)
    .innerJoin(concepts, eq(concepts.id, conceptTopics.conceptId))
    .where(eq(concepts.userId, userId))

  await db
    .delete(topics)
    .where(
      and(
        eq(topics.userId, userId),
        sql`${topics.id} NOT IN (${usedTopicIds})`
      )
    )

  // Tags
  const usedTagIds = db
    .select({ tagId: conceptTags.tagId })
    .from(conceptTags)
    .innerJoin(concepts, eq(concepts.id, conceptTags.conceptId))
    .where(eq(concepts.userId, userId))

  await db
    .delete(tags)
    .where(
      and(
        eq(tags.userId, userId),
        sql`${tags.id} NOT IN (${usedTagIds})`
      )
    )
}

// ---------------------------------------------------------------------------
// Shape raw DB rows into Concept interface
// ---------------------------------------------------------------------------

async function attachJunctions(
  userId: string,
  conceptIds: string[]
): Promise<
  Map<
    string,
    { subjectIds: string[]; topicIds: string[]; tagIds: string[] }
  >
> {
  if (conceptIds.length === 0) return new Map()

  const [cs, ct, ctg] = await Promise.all([
    db
      .select({ conceptId: conceptSubjects.conceptId, subjectId: conceptSubjects.subjectId })
      .from(conceptSubjects)
      .where(inArray(conceptSubjects.conceptId, conceptIds)),
    db
      .select({ conceptId: conceptTopics.conceptId, topicId: conceptTopics.topicId })
      .from(conceptTopics)
      .where(inArray(conceptTopics.conceptId, conceptIds)),
    db
      .select({ conceptId: conceptTags.conceptId, tagId: conceptTags.tagId })
      .from(conceptTags)
      .where(inArray(conceptTags.conceptId, conceptIds)),
  ])

  const map = new Map<
    string,
    { subjectIds: string[]; topicIds: string[]; tagIds: string[] }
  >()

  for (const id of conceptIds) {
    map.set(id, { subjectIds: [], topicIds: [], tagIds: [] })
  }

  for (const row of cs) map.get(row.conceptId)?.subjectIds.push(row.subjectId)
  for (const row of ct) map.get(row.conceptId)?.topicIds.push(row.topicId)
  for (const row of ctg) map.get(row.conceptId)?.tagIds.push(row.tagId)

  return map
}

// ---------------------------------------------------------------------------
// Public actions
// ---------------------------------------------------------------------------

export async function getConcepts(): Promise<Concept[]> {
  const userId = await requireAuth()

  const rows = await db
    .select()
    .from(concepts)
    .where(eq(concepts.userId, userId))
    .orderBy(concepts.name)

  const ids = rows.map((r) => r.id)
  const junctions = await attachJunctions(userId, ids)

  return rows.map((row) => ({
    ...row,
    ...(junctions.get(row.id) ?? { subjectIds: [], topicIds: [], tagIds: [] }),
  }))
}

export async function getConcept(id: string): Promise<Concept | null> {
  const userId = await requireAuth()

  const row = await db
    .select()
    .from(concepts)
    .where(and(eq(concepts.id, id), eq(concepts.userId, userId)))
    .then((rows) => rows[0] ?? null)

  if (!row) return null

  const junctions = await attachJunctions(userId, [id])
  const junction = junctions.get(id) ?? { subjectIds: [], topicIds: [], tagIds: [] }

  // Also fetch names for the concept view
  const [subjectRows, topicRows, tagRows] = await Promise.all([
    junction.subjectIds.length > 0
      ? db
          .select({ id: subjects.id, name: subjects.name })
          .from(subjects)
          .where(inArray(subjects.id, junction.subjectIds))
      : Promise.resolve([]),
    junction.topicIds.length > 0
      ? db
          .select({ id: topics.id, name: topics.name })
          .from(topics)
          .where(inArray(topics.id, junction.topicIds))
      : Promise.resolve([]),
    junction.tagIds.length > 0
      ? db
          .select({ id: tags.id, name: tags.name })
          .from(tags)
          .where(inArray(tags.id, junction.tagIds))
      : Promise.resolve([]),
  ])

  return {
    ...row,
    ...junction,
    subjectNames: subjectRows.map((r) => r.name),
    topicNames: topicRows.map((r) => r.name),
    tagNames: tagRows.map((r) => r.name),
  }
}

export async function createConcept(input: ConceptInput): Promise<string> {
  const userId = await requireAuth()
  const parsed = conceptInputSchema.parse(input)

  const [subjectIds, topicIds, tagIds] = await Promise.all([
    resolveOrCreate(userId, parsed.subjectNames, subjects),
    resolveOrCreate(userId, parsed.topicNames, topics),
    resolveOrCreate(userId, parsed.tagNames, tags),
  ])

  const [concept] = await db
    .insert(concepts)
    .values({
      userId,
      name: parsed.name,
      mvkNotes: parsed.mvkNotes,
      markdownNotes: parsed.markdownNotes,
      referencesMarkdown: parsed.referencesMarkdown,
      state: parsed.state,
      priority: parsed.priority,
      pinned: parsed.pinned,
    })
    .returning({ id: concepts.id })

  const conceptId = concept.id

  await Promise.all([
    subjectIds.length > 0
      ? db
          .insert(conceptSubjects)
          .values(subjectIds.map((subjectId) => ({ conceptId, subjectId })))
          .onConflictDoNothing()
      : Promise.resolve(),
    topicIds.length > 0
      ? db
          .insert(conceptTopics)
          .values(topicIds.map((topicId) => ({ conceptId, topicId })))
          .onConflictDoNothing()
      : Promise.resolve(),
    tagIds.length > 0
      ? db
          .insert(conceptTags)
          .values(tagIds.map((tagId) => ({ conceptId, tagId })))
          .onConflictDoNothing()
      : Promise.resolve(),
  ])

  // Initialize subject_concept_orders for subjects that have custom sort mode
  if (subjectIds.length > 0) {
    // Get max position per subject for custom-sorted subjects
    for (const subjectId of subjectIds) {
      const maxPos = await db
        .select({ pos: subjectConceptOrders.position })
        .from(subjectConceptOrders)
        .where(
          and(
            eq(subjectConceptOrders.userId, userId),
            eq(subjectConceptOrders.subjectId, subjectId)
          )
        )
        .orderBy(sql`${subjectConceptOrders.position} DESC`)
        .limit(1)

      // Only insert if there are existing order rows (i.e., subject is in custom mode)
      if (maxPos.length > 0) {
        await db
          .insert(subjectConceptOrders)
          .values({
            userId,
            subjectId,
            conceptId,
            position: maxPos[0].pos + 1,
          })
          .onConflictDoNothing()
      }
    }
  }

  return conceptId
}

export async function updateConcept(id: string, input: ConceptInput): Promise<void> {
  const userId = await requireAuth()
  const parsed = conceptInputSchema.parse(input)

  // Verify ownership
  const existing = await db
    .select({ id: concepts.id })
    .from(concepts)
    .where(and(eq(concepts.id, id), eq(concepts.userId, userId)))
    .then((rows) => rows[0] ?? null)

  if (!existing) throw new Error('Not found')

  // Get current junctions
  const junctions = await attachJunctions(userId, [id])
  const current = junctions.get(id) ?? { subjectIds: [], topicIds: [], tagIds: [] }

  const [newSubjectIds, newTopicIds, newTagIds] = await Promise.all([
    resolveOrCreate(userId, parsed.subjectNames, subjects),
    resolveOrCreate(userId, parsed.topicNames, topics),
    resolveOrCreate(userId, parsed.tagNames, tags),
  ])

  // Update concept row
  await db
    .update(concepts)
    .set({
      name: parsed.name,
      mvkNotes: parsed.mvkNotes,
      markdownNotes: parsed.markdownNotes,
      referencesMarkdown: parsed.referencesMarkdown,
      state: parsed.state,
      priority: parsed.priority,
      pinned: parsed.pinned,
      updatedAt: new Date(),
    })
    .where(and(eq(concepts.id, id), eq(concepts.userId, userId)))

  // Diff and update junction tables
  const oldSubjectSet = new Set(current.subjectIds)
  const newSubjectSet = new Set(newSubjectIds)
  const oldTopicSet = new Set(current.topicIds)
  const newTopicSet = new Set(newTopicIds)
  const oldTagSet = new Set(current.tagIds)
  const newTagSet = new Set(newTagIds)

  const toAddSubjects = newSubjectIds.filter((sid) => !oldSubjectSet.has(sid))
  const toRemoveSubjects = current.subjectIds.filter((sid) => !newSubjectSet.has(sid))
  const toAddTopics = newTopicIds.filter((tid) => !oldTopicSet.has(tid))
  const toRemoveTopics = current.topicIds.filter((tid) => !newTopicSet.has(tid))
  const toAddTags = newTagIds.filter((tid) => !oldTagSet.has(tid))
  const toRemoveTags = current.tagIds.filter((tid) => !newTagSet.has(tid))

  await Promise.all([
    toAddSubjects.length > 0
      ? db
          .insert(conceptSubjects)
          .values(toAddSubjects.map((subjectId) => ({ conceptId: id, subjectId })))
          .onConflictDoNothing()
      : Promise.resolve(),
    toRemoveSubjects.length > 0
      ? db
          .delete(conceptSubjects)
          .where(
            and(
              eq(conceptSubjects.conceptId, id),
              inArray(conceptSubjects.subjectId, toRemoveSubjects)
            )
          )
      : Promise.resolve(),
    toAddTopics.length > 0
      ? db
          .insert(conceptTopics)
          .values(toAddTopics.map((topicId) => ({ conceptId: id, topicId })))
          .onConflictDoNothing()
      : Promise.resolve(),
    toRemoveTopics.length > 0
      ? db
          .delete(conceptTopics)
          .where(
            and(
              eq(conceptTopics.conceptId, id),
              inArray(conceptTopics.topicId, toRemoveTopics)
            )
          )
      : Promise.resolve(),
    toAddTags.length > 0
      ? db
          .insert(conceptTags)
          .values(toAddTags.map((tagId) => ({ conceptId: id, tagId })))
          .onConflictDoNothing()
      : Promise.resolve(),
    toRemoveTags.length > 0
      ? db
          .delete(conceptTags)
          .where(
            and(
              eq(conceptTags.conceptId, id),
              inArray(conceptTags.tagId, toRemoveTags)
            )
          )
      : Promise.resolve(),
  ])

  // Remove concept from subject_concept_orders for removed subjects
  if (toRemoveSubjects.length > 0) {
    await db
      .delete(subjectConceptOrders)
      .where(
        and(
          eq(subjectConceptOrders.userId, userId),
          eq(subjectConceptOrders.conceptId, id),
          inArray(subjectConceptOrders.subjectId, toRemoveSubjects)
        )
      )
  }

  // Add to subject_concept_orders for new subjects that are in custom mode
  for (const subjectId of toAddSubjects) {
    const maxPos = await db
      .select({ pos: subjectConceptOrders.position })
      .from(subjectConceptOrders)
      .where(
        and(
          eq(subjectConceptOrders.userId, userId),
          eq(subjectConceptOrders.subjectId, subjectId)
        )
      )
      .orderBy(sql`${subjectConceptOrders.position} DESC`)
      .limit(1)

    if (maxPos.length > 0) {
      await db
        .insert(subjectConceptOrders)
        .values({ userId, subjectId, conceptId: id, position: maxPos[0].pos + 1 })
        .onConflictDoNothing()
    }
  }

  await pruneOrphans(userId)
}

export async function deleteConcept(id: string): Promise<void> {
  const userId = await requireAuth()

  await db
    .delete(concepts)
    .where(and(eq(concepts.id, id), eq(concepts.userId, userId)))

  await pruneOrphans(userId)
}

export async function updateConceptField(
  id: string,
  field: 'state' | 'priority' | 'pinned',
  value: ConceptState | ConceptPriority | boolean
): Promise<void> {
  const userId = await requireAuth()

  await db
    .update(concepts)
    .set({ [field]: value, updatedAt: new Date() })
    .where(and(eq(concepts.id, id), eq(concepts.userId, userId)))
}

export async function updateConceptContent(
  id: string,
  field: 'mvkNotes' | 'markdownNotes' | 'referencesMarkdown',
  value: string
): Promise<void> {
  const userId = await requireAuth()
  const parsed = updateConceptContentSchema.parse({ id, field, value })

  await db
    .update(concepts)
    .set({ [parsed.field]: parsed.value, updatedAt: new Date() })
    .where(and(eq(concepts.id, id), eq(concepts.userId, userId)))
}

export async function incrementReview(id: string): Promise<void> {
  const userId = await requireAuth()

  await db
    .update(concepts)
    .set({
      reviewCount: sql`${concepts.reviewCount} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(concepts.id, id), eq(concepts.userId, userId)))
}

export async function decrementReview(id: string): Promise<void> {
  const userId = await requireAuth()

  await db
    .update(concepts)
    .set({
      reviewCount: sql`GREATEST(0, ${concepts.reviewCount} - 1)`,
      updatedAt: new Date(),
    })
    .where(and(eq(concepts.id, id), eq(concepts.userId, userId)))
}
