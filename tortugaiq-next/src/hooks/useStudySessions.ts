'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStudySessions, addStudySession } from '@/actions/study-sessions'
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
