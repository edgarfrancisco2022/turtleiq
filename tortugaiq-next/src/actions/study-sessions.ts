'use server'

import { and, desc, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/db'
import { studySessions } from '@/db/schema'
import { addStudySessionSchema, updateStudySessionSchema } from '@/lib/validations'
import type { StudySession, StudySessionInput } from '@/lib/types'

async function requireAuth(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

export async function getStudySessions(): Promise<StudySession[]> {
  const userId = await requireAuth()

  return db
    .select()
    .from(studySessions)
    .where(eq(studySessions.userId, userId))
    .orderBy(desc(studySessions.createdAt))
}

export async function addStudySession(input: StudySessionInput): Promise<StudySession> {
  const userId = await requireAuth()
  const parsed = addStudySessionSchema.parse(input)

  const [session] = await db
    .insert(studySessions)
    .values({
      userId,
      minutes: parsed.minutes,
      subjectId: parsed.subjectId ?? null,
    })
    .returning()

  return session
}

export async function deleteStudySession(id: string): Promise<void> {
  const userId = await requireAuth()
  await db
    .delete(studySessions)
    .where(and(eq(studySessions.id, id), eq(studySessions.userId, userId)))
}

export async function updateStudySession(
  id: string,
  input: { minutes: number; subjectId: string | null }
): Promise<void> {
  const userId = await requireAuth()
  const parsed = updateStudySessionSchema.parse(input)

  await db
    .update(studySessions)
    .set({ minutes: parsed.minutes, subjectId: parsed.subjectId ?? null })
    .where(and(eq(studySessions.id, id), eq(studySessions.userId, userId)))
}
