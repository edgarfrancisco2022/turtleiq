'use client'

import { useState, useMemo } from 'react'
import type { Concept, ConceptState, ConceptPriority } from '@/lib/types'

export const SORT_LABELS: Record<string, string> = {
  alpha: 'A → Z',
  alpha_desc: 'Z → A',
  date_new: 'Newest first',
  date_old: 'Oldest first',
  reviews_high: 'Most reviewed',
  reviews_low: 'Least reviewed',
  priority_high: 'Priority high',
  pinned_first: 'Pinned first',
}

const PRIORITY_ORDER: Record<ConceptPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

export function sortConcepts(concepts: Concept[], sort: string): Concept[] {
  const arr = [...concepts]
  switch (sort) {
    case 'alpha':
      return arr.sort((a, b) => a.name.localeCompare(b.name))
    case 'alpha_desc':
      return arr.sort((a, b) => b.name.localeCompare(a.name))
    case 'date_new':
      return arr.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    case 'date_old':
      return arr.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    case 'reviews_high':
      return arr.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    case 'reviews_low':
      return arr.sort((a, b) => (a.reviewCount ?? 0) - (b.reviewCount ?? 0))
    case 'priority_high':
      return arr.sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority ?? 'MEDIUM'] ?? 1) -
          (PRIORITY_ORDER[b.priority ?? 'MEDIUM'] ?? 1)
      )
    case 'pinned_first':
      return arr.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return a.name.localeCompare(b.name)
      })
    default:
      return arr
  }
}

export interface FilterState {
  subjects?: string[]
  topics?: string[]
  tags?: string[]
  states?: ConceptState[]
  priorities?: ConceptPriority[]
  pinned?: boolean
}

function filterConcepts(concepts: Concept[], filters: FilterState): Concept[] {
  return concepts.filter((c) => {
    if (filters.subjects?.length && !filters.subjects.some((id) => c.subjectIds.includes(id)))
      return false
    if (filters.topics?.length && !filters.topics.some((id) => c.topicIds.includes(id)))
      return false
    if (filters.tags?.length && !filters.tags.some((id) => c.tagIds.includes(id)))
      return false
    if (filters.states?.length && !filters.states.includes(c.state ?? 'NEW')) return false
    if (filters.priorities?.length && !filters.priorities.includes(c.priority ?? 'MEDIUM'))
      return false
    if (filters.pinned && !c.pinned) return false
    return true
  })
}

const EMPTY_FILTERS: FilterState = {
  subjects: [],
  topics: [],
  tags: [],
  states: [],
  priorities: [],
  pinned: false,
}

interface UseFilterSortOptions {
  defaultSort?: string
  initialFilters?: FilterState
  initialSort?: string
}

export function useFilterSort(
  concepts: Concept[],
  { defaultSort = 'alpha', initialFilters, initialSort }: UseFilterSortOptions = {}
) {
  const [filters, setFiltersState] = useState<FilterState>(
    () => initialFilters ?? EMPTY_FILTERS
  )
  const [sort, setSort] = useState(() => initialSort ?? defaultSort)

  function setFilter(key: keyof FilterState, value: string[] | boolean) {
    setFiltersState((f) => ({ ...f, [key]: value }))
  }

  function clearFilters() {
    setFiltersState(EMPTY_FILTERS)
  }

  const hasActiveFilters = Boolean(
    filters.subjects?.length ||
      filters.topics?.length ||
      filters.tags?.length ||
      filters.states?.length ||
      filters.priorities?.length ||
      filters.pinned
  )

  const filtered = useMemo(
    () => sortConcepts(filterConcepts(concepts, filters), sort),
    [concepts, filters, sort]
  )

  return { filtered, filters, sort, setFilter, setSort, clearFilters, hasActiveFilters }
}
