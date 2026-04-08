'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useConcepts, useUpdateConceptField, useUpdateConceptContent, useIncrementReview, useDecrementReview, useDeleteConcept } from '@/hooks/useConcepts'
import { useSubjects, useTopics, useTags, useSubjectSortMode, useSetSubjectSortMode, useSubjectConceptOrder, useMoveConceptInSubject } from '@/hooks/useSubjects'
import { useSidebarState } from '@/components/providers/SidebarStateProvider'
import FilterSortBar from '@/components/ui/FilterSortBar'
import ShortcutsHintBar from '@/components/ui/ShortcutsHintBar'
import { StateSelector, PriorityBadge, ReviewCounter, PinButton, PinIcon } from '@/components/ui/StatusBadge'
import InlineEditor from '@/components/ui/InlineEditor'
import { MVK_PLACEHOLDER, MVK_EXAMPLE_HINT, MVK_EDIT_PLACEHOLDER } from '@/components/ui/MarkdownEditor'
import type { FilterState } from '@/hooks/useFilterSort'
import type { Concept, ConceptState, ConceptPriority } from '@/lib/types'

const SUBJECT_SORT_LABELS = { alpha: 'A → Z', date: 'Date added', custom: 'Custom' }
const SCROLL_KEY  = (sid: string) => `scroll-subject-${sid}`
const LAST_ID_KEY = (sid: string) => `subject-last-id-${sid}`
const STATE_KEY   = (sid: string) => `subject-state-${sid}`
const getMain = () => document.getElementById('main-content')

const EMPTY_FILTERS: FilterState = { topics: [], tags: [], states: [], priorities: [], pinned: false }

function isEditableTarget(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.contentEditable === 'true'
}

export default function SubjectView() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const router = useRouter()
  const { collapsed } = useSidebarState()

  const { data: allConcepts = [] } = useConcepts()
  const { data: subjects = [] } = useSubjects()
  const { data: topics = [] } = useTopics()
  const { data: tags = [] } = useTags()
  const { data: sortMode = 'alpha' } = useSubjectSortMode(subjectId)
  const { data: subjectOrder = [] } = useSubjectConceptOrder(subjectId)
  const setSortModeMut = useSetSubjectSortMode(subjectId)
  const moveMut = useMoveConceptInSubject(subjectId)
  const updateFieldMut = useUpdateConceptField()
  const updateContentMut = useUpdateConceptContent()
  const incrementMut = useIncrementReview()
  const decrementMut = useDecrementReview()
  const deleteMut = useDeleteConcept()

  const subject = subjects.find((s) => s.id === subjectId) ?? null

  // Restore filter state if returning from ConceptView (read before first render)
  const [savedState] = useState<{ filters: FilterState } | null>(() => {
    if (typeof window === 'undefined') return null
    if (!sessionStorage.getItem('cv-back')) return null
    try { return JSON.parse(sessionStorage.getItem(STATE_KEY(subjectId)) || 'null') } catch { return null }
  })

  const [filters, setFiltersState] = useState<FilterState>(() => savedState?.filters ?? EMPTY_FILTERS)
  const [focusedIdx, setFocusedIdx] = useState(0)
  const [panelOpen, setPanelOpen] = useState(false)

  function setFilter(key: keyof FilterState, value: string[] | boolean) {
    setFiltersState((f) => ({ ...f, [key]: value }))
  }
  function clearFilters() { setFiltersState(EMPTY_FILTERS) }

  const hasActiveFilters = Boolean(
    filters.topics?.length || filters.tags?.length || filters.states?.length ||
    filters.priorities?.length || filters.pinned
  )

  const suppressScroll = useRef(false)

  const subjectConcepts = allConcepts.filter((c) => c.subjectIds.includes(subjectId))

  const displayed = useMemo(() => {
    const filtered = subjectConcepts.filter((c) => {
      if (filters.topics?.length && !filters.topics.some((id) => c.topicIds.includes(id))) return false
      if (filters.tags?.length && !filters.tags.some((id) => c.tagIds.includes(id))) return false
      if (filters.states?.length && !filters.states.includes(c.state ?? 'NEW')) return false
      if (filters.priorities?.length && !filters.priorities.includes(c.priority ?? 'MEDIUM')) return false
      if (filters.pinned && !c.pinned) return false
      return true
    })
    if (sortMode === 'alpha') return [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    if (sortMode === 'date') return [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    if (sortMode === 'custom') {
      return [...filtered].sort((a, b) => {
        const ia = subjectOrder.indexOf(a.id), ib = subjectOrder.indexOf(b.id)
        if (ia === -1 && ib === -1) return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        if (ia === -1) return 1; if (ib === -1) return -1
        return ia - ib
      })
    }
    return filtered
  }, [subjectConcepts, filters, sortMode, subjectOrder, subjectId])

  // Scroll to top on mount; restore scroll/focus if returning from ConceptView
  useEffect(() => {
    const el = getMain()
    if (el) el.scrollTop = 0

    if (sessionStorage.getItem('cv-back')) {
      sessionStorage.removeItem('cv-back')
      sessionStorage.removeItem(STATE_KEY(subjectId))
      const saved = sessionStorage.getItem(SCROLL_KEY(subjectId))
      sessionStorage.removeItem(SCROLL_KEY(subjectId))
      const lastId = sessionStorage.getItem(LAST_ID_KEY(subjectId))
      sessionStorage.removeItem(LAST_ID_KEY(subjectId))

      const idx = lastId ? displayed.findIndex((c) => c.id === lastId) : -1
      if (idx >= 0) setFocusedIdx(idx)

      if (saved) {
        suppressScroll.current = true
        const pos = parseInt(saved, 10)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const el2 = getMain()
            if (el2) el2.scrollTop = pos
            suppressScroll.current = false
          })
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])

  // Reset focus when sort changes (skip first render)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setFocusedIdx(0)
  }, [sortMode])

  // Scroll focused row into view
  useEffect(() => {
    if (suppressScroll.current) return
    const concept = displayed[focusedIdx]
    if (!concept) return
    const el = document.getElementById(`sub-${concept.id}`)
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [focusedIdx, displayed])

  const focusedConcept = displayed[focusedIdx] ?? null

  // Keyboard navigation
  const stateRef = useRef({ displayed, focusedIdx, filters })
  stateRef.current = { displayed, focusedIdx, filters }
  const lastNavTime = useRef(0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isEditableTarget(e)) return
      const { displayed, focusedIdx, filters } = stateRef.current
      if (!displayed.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const now = Date.now()
        if (e.repeat && now - lastNavTime.current < 180) return
        lastNavTime.current = now
        setFocusedIdx((i) => Math.min(i + 1, displayed.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const now = Date.now()
        if (e.repeat && now - lastNavTime.current < 180) return
        lastNavTime.current = now
        setFocusedIdx((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const concept = displayed[focusedIdx]
        if (concept) {
          sessionStorage.setItem(STATE_KEY(subjectId), JSON.stringify({ filters }))
          const el = getMain()
          if (el) sessionStorage.setItem(SCROLL_KEY(subjectId), String(el.scrollTop))
          sessionStorage.setItem(LAST_ID_KEY(subjectId), concept.id)
          router.push(`/app/concepts/${concept.id}`)
        }
      } else if (e.key === ' ') {
        e.preventDefault()
        setPanelOpen((p) => !p)
      } else if (e.key === '+' || e.key === '=') {
        const concept = displayed[focusedIdx]
        if (concept) incrementMut.mutate(concept.id)
      } else if (e.key === '-') {
        const concept = displayed[focusedIdx]
        if (concept) decrementMut.mutate(concept.id)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        router.back()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, subjectId])

  if (!subject && subjects.length > 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Subject not found.</p>
      </div>
    )
  }

  function handleDelete(e: React.MouseEvent, concept: Concept) {
    e.preventDefault()
    if (window.confirm(`Delete "${concept.name}"?`)) deleteMut.mutate(concept.id)
  }

  function saveState(conceptId: string) {
    sessionStorage.setItem(STATE_KEY(subjectId), JSON.stringify({ filters }))
    const el = getMain()
    if (el) sessionStorage.setItem(SCROLL_KEY(subjectId), String(el.scrollTop))
    sessionStorage.setItem(LAST_ID_KEY(subjectId), conceptId)
  }

  function canMoveUp(conceptId: string) {
    if (sortMode !== 'custom' || hasActiveFilters) return false
    return subjectOrder.indexOf(conceptId) > 0
  }
  function canMoveDown(conceptId: string) {
    if (sortMode !== 'custom' || hasActiveFilters) return false
    const idx = subjectOrder.indexOf(conceptId)
    return idx >= 0 && idx < subjectOrder.length - 1
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 pb-44">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{subject?.name ?? '…'}</h1>
        <span className="text-sm text-gray-400">{subjectConcepts.length} total</span>
      </div>

      <FilterSortBar
        filters={filters}
        sort={sortMode}
        setFilter={setFilter}
        setSort={(mode) => setSortModeMut.mutate(mode as 'alpha' | 'date' | 'custom')}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        topics={topics}
        tags={tags}
        availableSorts={['alpha', 'date', 'custom']}
        availableFilters={['topic', 'tag', 'state', 'priority', 'pinned']}
        sortLabels={SUBJECT_SORT_LABELS}
        resultCount={displayed.length}
      />

      <ShortcutsHintBar items={[
        { keyLabel: '↑ ↓', actionLabel: 'Navigate' },
        { keyLabel: 'Space', actionLabel: 'MVK' },
        { keyLabel: 'Enter', actionLabel: 'Open' },
        { keyLabel: '⌫', actionLabel: 'Back' },
        { keyLabel: '+ / −', actionLabel: 'Review Count' },
      ]} />

      {sortMode === 'custom' && hasActiveFilters && (
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-3">
          Move controls are disabled while filters are active.
        </p>
      )}

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {subjectConcepts.length === 0 ? 'No concepts in this subject yet.' : 'No concepts match the current filters.'}
        </div>
      ) : (
        <div className="space-y-1.5">
          {displayed.map((concept, idx) => (
            <ConceptRow
              key={concept.id}
              concept={concept}
              focused={idx === focusedIdx}
              onFocus={() => setFocusedIdx(idx)}
              isCustom={sortMode === 'custom' && !hasActiveFilters}
              canUp={canMoveUp(concept.id)}
              canDown={canMoveDown(concept.id)}
              onMoveUp={(e) => { e.preventDefault(); moveMut.mutate({ conceptId: concept.id, direction: 'up' }) }}
              onMoveDown={(e) => { e.preventDefault(); moveMut.mutate({ conceptId: concept.id, direction: 'down' }) }}
              onDelete={(e) => handleDelete(e, concept)}
              onSaveState={() => saveState(concept.id)}
              onUpdateField={(f, v) => updateFieldMut.mutate({ id: concept.id, field: f as 'state' | 'priority' | 'pinned', value: v as ConceptState | ConceptPriority | boolean })}
              onIncrementReview={() => incrementMut.mutate(concept.id)}
              onDecrementReview={() => decrementMut.mutate(concept.id)}
            />
          ))}
        </div>
      )}

      {/* MVK Drawer */}
      <div className={`fixed bottom-0 right-0 z-20 bg-gray-900 transition-all duration-200 max-md:left-0 ${collapsed ? 'md:left-16' : 'md:left-60'}`}>
        {panelOpen && (
          <div className="bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
            {focusedConcept && (
              <InlineEditor
                key={focusedConcept.id}
                content={focusedConcept.mvkNotes ?? ''}
                placeholder={MVK_PLACEHOLDER}
                hint={MVK_EXAMPLE_HINT}
                editPlaceholder={MVK_EDIT_PLACEHOLDER}
                onSave={(value) => updateContentMut.mutate({ id: focusedConcept.id, field: 'mvkNotes', value })}
              />
            )}
          </div>
        )}
        <button
          onClick={() => setPanelOpen((p) => !p)}
          className="w-full flex items-center justify-between px-6 py-2.5 bg-gray-900 hover:bg-gray-800 transition-colors group outline-none focus:outline-none"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest">MVK</span>
            <span className="text-[10px] text-gray-600 group-hover:text-gray-500 transition-colors hidden sm:inline">
              Minimum Viable Knowledge
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-gray-700 text-[10px] text-gray-600 group-hover:text-gray-400 group-hover:border-gray-600 transition-colors font-mono leading-none select-none">
              Space
            </kbd>
            <svg
              className={`w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-all duration-200 ${panelOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  )
}

interface ConceptRowProps {
  concept: Concept
  focused: boolean
  onFocus: () => void
  isCustom: boolean
  canUp: boolean
  canDown: boolean
  onMoveUp: (e: React.MouseEvent) => void
  onMoveDown: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  onSaveState: () => void
  onUpdateField: (field: string, value: unknown) => void
  onIncrementReview: () => void
  onDecrementReview: () => void
}

function ConceptRow({ concept, focused, onFocus, isCustom, canUp, canDown, onMoveUp, onMoveDown, onDelete, onSaveState, onUpdateField, onIncrementReview, onDecrementReview }: ConceptRowProps) {
  return (
    <div
      id={`sub-${concept.id}`}
      className={`border rounded-md transition-all ${
        focused ? 'bg-gray-100/80 border-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
      onClick={onFocus}
    >
      <div className="flex flex-col gap-1.5 px-4 py-2 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex-1 min-w-0 break-words">
          <Link
            href={`/app/concepts/${concept.id}`}
            onClick={onSaveState}
            className="font-inter text-sm font-semibold text-gray-900 tracking-normal hover:text-blue-700 transition-colors"
          >
            {concept.pinned && <PinIcon size={10} className="inline text-amber-400 mr-1.5 -mt-px" />}
            {concept.name}
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <StateSelector value={concept.state} onChange={(v) => onUpdateField('state', v)} />
          <PriorityBadge value={concept.priority} onChange={(v) => onUpdateField('priority', v)} />
          <ReviewCounter count={concept.reviewCount} onIncrement={onIncrementReview} onDecrement={onDecrementReview} />
          <PinButton pinned={concept.pinned} onToggle={() => onUpdateField('pinned', !concept.pinned)} />
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-500 transition-colors text-sm leading-none focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
            aria-label={`Delete concept: ${concept.name}`}
          >
            <span aria-hidden="true">✕</span>
          </button>

          {isCustom && (
            <div className="flex flex-col gap-0 flex-shrink-0 ml-1">
              <button
                onClick={onMoveUp}
                disabled={!canUp}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-tight text-xs px-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                aria-label={`Move ${concept.name} up`}
              >
                <span aria-hidden="true">↑</span>
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canDown}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-tight text-xs px-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                aria-label={`Move ${concept.name} down`}
              >
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
