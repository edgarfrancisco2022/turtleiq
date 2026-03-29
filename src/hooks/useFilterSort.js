import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'

export const SORT_LABELS = {
  alpha: 'A → Z',
  alpha_desc: 'Z → A',
  date_new: 'Newest first',
  date_old: 'Oldest first',
  reviews_high: 'Most reviewed',
  reviews_low: 'Least reviewed',
}

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }

export function sortConcepts(concepts, sort) {
  const arr = [...concepts]
  switch (sort) {
    case 'alpha':         return arr.sort((a, b) => a.name.localeCompare(b.name))
    case 'alpha_desc':    return arr.sort((a, b) => b.name.localeCompare(a.name))
    case 'date_new':      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'date_old':      return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'reviews_high':  return arr.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    case 'reviews_low':   return arr.sort((a, b) => (a.reviewCount ?? 0) - (b.reviewCount ?? 0))
    case 'priority_high': return arr.sort((a, b) =>
      (PRIORITY_ORDER[a.priority ?? 'MEDIUM'] ?? 1) - (PRIORITY_ORDER[b.priority ?? 'MEDIUM'] ?? 1)
    )
    case 'pinned_first':  return arr.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return a.name.localeCompare(b.name)
    })
    default: return arr
  }
}

function filterConcepts(concepts, filters) {
  return concepts.filter(c => {
    if (filters.subject && !(c.subjectIds || []).includes(filters.subject)) return false
    if (filters.topic   && !(c.topicIds  || []).includes(filters.topic))   return false
    if (filters.tag     && !(c.tagIds    || []).includes(filters.tag))     return false
    if (filters.state   && (c.state    ?? 'NEW')    !== filters.state)    return false
    if (filters.priority && (c.priority ?? 'MEDIUM') !== filters.priority) return false
    if (filters.pinned  && !c.pinned) return false
    return true
  })
}

const EMPTY_FILTERS = { subject: '', topic: '', tag: '', state: '', priority: '', pinned: false }

export function useFilterSort(concepts, { defaultSort = 'alpha' } = {}) {
  const subjects = useStore(s => s.subjects)
  const topics   = useStore(s => s.topics)
  const tags     = useStore(s => s.tags)

  const [filters, setFiltersState] = useState(EMPTY_FILTERS)
  const [sort, setSort] = useState(defaultSort)

  function setFilter(key, value) {
    setFiltersState(f => ({ ...f, [key]: value }))
  }

  function clearFilters() {
    setFiltersState(EMPTY_FILTERS)
  }

  const hasActiveFilters = Boolean(
    filters.subject || filters.topic || filters.tag ||
    filters.state   || filters.priority || filters.pinned
  )

  const filtered = useMemo(() => {
    return sortConcepts(filterConcepts(concepts, filters), sort)
  }, [concepts, filters, sort])

  return { filtered, filters, sort, setFilter, setSort, clearFilters, hasActiveFilters, subjects, topics, tags }
}
