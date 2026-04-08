'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getConcepts,
  getConcept,
  createConcept,
  updateConcept,
  deleteConcept,
  updateConceptField,
  updateConceptContent,
  incrementReview,
  decrementReview,
} from '@/actions/concepts'
import type {
  Concept,
  ConceptInput,
  ConceptState,
  ConceptPriority,
} from '@/lib/types'

export function useConcepts() {
  return useQuery<Concept[]>({
    queryKey: ['concepts'],
    queryFn: () => getConcepts(),
  })
}

export function useConcept(id: string) {
  return useQuery<Concept | null>({
    queryKey: ['concepts', id],
    queryFn: () => getConcept(id),
    enabled: !!id,
  })
}

export function useCreateConcept() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ConceptInput) => createConcept(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['concepts'] })
      qc.invalidateQueries({ queryKey: ['subjects'] })
      qc.invalidateQueries({ queryKey: ['topics'] })
      qc.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

export function useUpdateConcept() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ConceptInput }) =>
      updateConcept(id, input),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['concepts'] })
      qc.invalidateQueries({ queryKey: ['concepts', id] })
      qc.invalidateQueries({ queryKey: ['subjects'] })
      qc.invalidateQueries({ queryKey: ['topics'] })
      qc.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

export function useDeleteConcept() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteConcept(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['concepts'] })
      qc.invalidateQueries({ queryKey: ['subjects'] })
      qc.invalidateQueries({ queryKey: ['topics'] })
      qc.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

// Optimistic update for field changes (state, priority, pinned)
export function useUpdateConceptField() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      field,
      value,
    }: {
      id: string
      field: 'state' | 'priority' | 'pinned'
      value: ConceptState | ConceptPriority | boolean
    }) => updateConceptField(id, field, value),
    onMutate: async ({ id, field, value }) => {
      await qc.cancelQueries({ queryKey: ['concepts'] })
      const prev = qc.getQueryData<Concept[]>(['concepts'])
      qc.setQueryData<Concept[]>(['concepts'], (old) =>
        old?.map((c) => (c.id === id ? { ...c, [field]: value } : c)) ?? []
      )
      return { prev }
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(['concepts'], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['concepts'] })
    },
  })
}

export function useUpdateConceptContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      field,
      value,
    }: {
      id: string
      field: 'mvkNotes' | 'markdownNotes' | 'referencesMarkdown'
      value: string
    }) => updateConceptContent(id, field, value),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['concepts'] })
      qc.invalidateQueries({ queryKey: ['concepts', id] })
    },
  })
}

// Optimistic update for review increment
export function useIncrementReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => incrementReview(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['concepts'] })
      const prev = qc.getQueryData<Concept[]>(['concepts'])
      qc.setQueryData<Concept[]>(['concepts'], (old) =>
        old?.map((c) => (c.id === id ? { ...c, reviewCount: (c.reviewCount ?? 0) + 1 } : c)) ?? []
      )
      return { prev }
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(['concepts'], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['concepts'] })
    },
  })
}

// Optimistic update for review decrement
export function useDecrementReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => decrementReview(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['concepts'] })
      const prev = qc.getQueryData<Concept[]>(['concepts'])
      qc.setQueryData<Concept[]>(['concepts'], (old) =>
        old?.map((c) =>
          c.id === id ? { ...c, reviewCount: Math.max(0, (c.reviewCount ?? 0) - 1) } : c
        ) ?? []
      )
      return { prev }
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(['concepts'], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['concepts'] })
    },
  })
}
