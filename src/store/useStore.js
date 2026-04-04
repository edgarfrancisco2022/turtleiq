import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const uid = () => crypto.randomUUID()

const CONTENT_FIELDS = new Set(['referencesMarkdown', 'mvkNotes', 'markdownNotes'])

const DEFAULT_CONCEPT_EXTRAS = {
  referencesMarkdown: '',
  mvkNotes: '',
  markdownNotes: '',
  state: 'NEW',       // NEW | LEARNING | REVIEWING | MEMORIZING | STORED
  priority: 'MEDIUM', // LOW | MEDIUM | HIGH
  reviewCount: 0,
  pinned: false,
  images: [],         // [{ imageId, fileName }]
}

function resolveNames(names, collection) {
  const result = [...collection]
  const ids = names
    .map(n => (typeof n === 'string' ? n.trim() : ''))
    .filter(Boolean)
    .map(name => {
      const existing = result.find(i => i.name.toLowerCase() === name.toLowerCase())
      if (existing) return existing.id
      const item = { id: uid(), name }
      result.push(item)
      return item.id
    })
  return { collection: result, ids }
}

function pruneCollections(concepts, subjects, topics, tags) {
  const usedSids = new Set(concepts.flatMap(c => c.subjectIds || []))
  const usedTids = new Set(concepts.flatMap(c => c.topicIds || []))
  const usedTagids = new Set(concepts.flatMap(c => c.tagIds || []))
  return {
    subjects: subjects.filter(s => usedSids.has(s.id)),
    topics: topics.filter(t => usedTids.has(t.id)),
    tags: tags.filter(t => usedTagids.has(t.id)),
  }
}

export const useStore = create(
  persist(
    (set, get) => ({
      concepts: [],
      subjects: [],
      topics: [],
      tags: [],
      subjectOrders: {},     // { [subjectId]: conceptId[] }
      subjectSortModes: {},  // { [subjectId]: 'alpha' | 'date' | 'custom' }
      studySessions: [],     // [{ id, minutes, subjectId: null | string, createdAt }]

      addConcept({ name, subjects, topics, tags }) {
        const state = get()
        const r1 = resolveNames(subjects, state.subjects)
        const r2 = resolveNames(topics, state.topics)
        const r3 = resolveNames(tags, state.tags)

        const concept = {
          id: uid(),
          name: name.trim(),
          subjectIds: r1.ids,
          topicIds: r2.ids,
          tagIds: r3.ids,
          ...DEFAULT_CONCEPT_EXTRAS,
          createdAt: new Date().toISOString(),
        }

        const subjectOrders = { ...state.subjectOrders }
        r1.ids.forEach(sid => {
          if (subjectOrders[sid]) subjectOrders[sid] = [...subjectOrders[sid], concept.id]
        })

        set({
          subjects: r1.collection,
          topics: r2.collection,
          tags: r3.collection,
          concepts: [...state.concepts, concept],
          subjectOrders,
        })
        return concept.id
      },

      updateConcept(id, { name, subjects, topics, tags }) {
        const state = get()
        const existing = state.concepts.find(c => c.id === id)
        if (!existing) return

        const r1 = resolveNames(subjects, state.subjects)
        const r2 = resolveNames(topics, state.topics)
        const r3 = resolveNames(tags, state.tags)

        const updated = { ...existing, name: name.trim(), subjectIds: r1.ids, topicIds: r2.ids, tagIds: r3.ids }
        const newConcepts = state.concepts.map(c => c.id === id ? updated : c)

        const oldSids = new Set(existing.subjectIds)
        const newSids = new Set(r1.ids)
        const subjectOrders = { ...state.subjectOrders }
        oldSids.forEach(sid => {
          if (!newSids.has(sid) && subjectOrders[sid]) {
            subjectOrders[sid] = subjectOrders[sid].filter(cid => cid !== id)
          }
        })
        newSids.forEach(sid => {
          if (!oldSids.has(sid) && subjectOrders[sid]) {
            subjectOrders[sid] = [...subjectOrders[sid], id]
          }
        })

        const pruned = pruneCollections(newConcepts, r1.collection, r2.collection, r3.collection)
        set({ ...pruned, concepts: newConcepts, subjectOrders })
      },

      deleteConcept(id) {
        set(state => {
          const concept = state.concepts.find(c => c.id === id)
          const concepts = state.concepts.filter(c => c.id !== id)
          const pruned = pruneCollections(concepts, state.subjects, state.topics, state.tags)

          const subjectOrders = { ...state.subjectOrders }
          if (concept) {
            concept.subjectIds.forEach(sid => {
              if (subjectOrders[sid]) subjectOrders[sid] = subjectOrders[sid].filter(cid => cid !== id)
            })
          }
          const remainingSids = new Set(pruned.subjects.map(s => s.id))
          Object.keys(subjectOrders).forEach(sid => {
            if (!remainingSids.has(sid)) delete subjectOrders[sid]
          })

          return { ...pruned, concepts, subjectOrders }
        })
      },

      updateConceptField(id, field, value) {
        set(state => ({
          concepts: state.concepts.map(c => c.id === id ? { ...c, [field]: value } : c),
        }))
      },

      incrementReview(id) {
        set(state => ({
          concepts: state.concepts.map(c =>
            c.id === id ? { ...c, reviewCount: (c.reviewCount ?? 0) + 1 } : c
          ),
        }))
      },

      decrementReview(id) {
        set(state => ({
          concepts: state.concepts.map(c =>
            c.id === id ? { ...c, reviewCount: Math.max(0, (c.reviewCount ?? 0) - 1) } : c
          ),
        }))
      },

      saveContent(conceptId, field, value) {
        if (!CONTENT_FIELDS.has(field)) {
          console.warn(`saveContent: unknown field "${field}"`)
          return
        }
        set(state => ({
          concepts: state.concepts.map(c => c.id === conceptId ? { ...c, [field]: value } : c),
        }))
      },

      addConceptImage(conceptId, imageId, fileName) {
        set(state => ({
          concepts: state.concepts.map(c =>
            c.id === conceptId
              ? { ...c, images: [...(c.images || []), { imageId, fileName }] }
              : c
          ),
        }))
      },

      removeConceptImage(conceptId, imageId) {
        set(state => ({
          concepts: state.concepts.map(c =>
            c.id === conceptId
              ? { ...c, images: (c.images || []).filter(img => img.imageId !== imageId) }
              : c
          ),
        }))
      },

      setSubjectSortMode(subjectId, mode) {
        set(state => {
          const subjectOrders = { ...state.subjectOrders }
          if (mode === 'custom' && !subjectOrders[subjectId]) {
            subjectOrders[subjectId] = state.concepts
              .filter(c => c.subjectIds.includes(subjectId))
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map(c => c.id)
          }
          return {
            subjectOrders,
            subjectSortModes: { ...state.subjectSortModes, [subjectId]: mode },
          }
        })
      },

      moveConceptInSubject(subjectId, conceptId, direction) {
        set(state => {
          const order = [...(state.subjectOrders[subjectId] || [])]
          const idx = order.indexOf(conceptId)
          if (idx === -1) return state
          const newIdx = direction === 'up' ? idx - 1 : idx + 1
          if (newIdx < 0 || newIdx >= order.length) return state
          ;[order[idx], order[newIdx]] = [order[newIdx], order[idx]]
          return { subjectOrders: { ...state.subjectOrders, [subjectId]: order } }
        })
      },

      addStudySession({ minutes, subjectId }) {
        set(state => ({
          studySessions: [
            ...state.studySessions,
            { id: uid(), minutes, subjectId: subjectId || null, createdAt: new Date().toISOString() },
          ],
        }))
      },
    }),
    {
      name: 'turtleiq-storage',
      version: 3,
      migrate(persistedState, version) {
        if (!persistedState) {
          return { concepts: [], subjects: [], topics: [], tags: [], subjectOrders: {}, subjectSortModes: {}, studySessions: [] }
        }
        let state = persistedState
        if (version < 2) {
          state = {
            subjects: state.subjects || [],
            topics: state.topics || [],
            tags: state.tags || [],
            subjectOrders: {},
            subjectSortModes: {},
            studySessions: [],
            concepts: (state.concepts || []).map(c => ({
              subjectIds: [],
              topicIds: [],
              tagIds: [],
              ...DEFAULT_CONCEPT_EXTRAS,
              ...c,
              referencesMarkdown: (c.references || []).map(r => r.text || '').filter(Boolean).join('\n\n'),
              markdownNotes: c.markdownNotes || '',
              references: undefined,
              subtopicIds: undefined,
            })),
          }
        }
        if (version < 3) {
          state = {
            ...state,
            studySessions: state.studySessions || [],
            concepts: (state.concepts || []).map(c => ({
              ...c,
              images: c.images || [],
            })),
          }
        }
        return state
      },
    }
  )
)
