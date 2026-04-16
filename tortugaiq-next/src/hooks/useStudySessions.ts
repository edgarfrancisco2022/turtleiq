'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStudySessions, addStudySession, deleteStudySession, updateStudySession } from '@/actions/study-sessions'
import type { StudySession, StudySessionInput } from '@/lib/types'

export function useStudySessions() {
  return useQuery<StudySession[]>({
    queryKey: ['study-sessions'],
    queryFn: () => getStudySessions(),
  })
}

export function useAddStudySession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: StudySessionInput) => addStudySession(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['study-sessions'] })
    },
  })
}

export function useDeleteStudySession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteStudySession(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['study-sessions'] })
      const prev = qc.getQueryData<StudySession[]>(['study-sessions'])
      qc.setQueryData<StudySession[]>(['study-sessions'], (old) =>
        old?.filter((s) => s.id !== id) ?? []
      )
      return { prev }
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(['study-sessions'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['study-sessions'] }),
  })
}

export function useUpdateStudySession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, minutes, subjectId }: { id: string; minutes: number; subjectId: string | null }) =>
      updateStudySession(id, { minutes, subjectId }),
    onMutate: async ({ id, minutes, subjectId }) => {
      await qc.cancelQueries({ queryKey: ['study-sessions'] })
      const prev = qc.getQueryData<StudySession[]>(['study-sessions'])
      qc.setQueryData<StudySession[]>(['study-sessions'], (old) =>
        old?.map((s) => (s.id === id ? { ...s, minutes, subjectId } : s)) ?? []
      )
      return { prev }
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(['study-sessions'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['study-sessions'] }),
  })
}
