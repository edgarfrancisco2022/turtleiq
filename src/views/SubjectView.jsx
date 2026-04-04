import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import FilterSortBar from '../components/FilterSortBar'
import { StateSelector, PriorityBadge, ReviewCounter, PinButton } from '../components/StatusBadge'
import { InlineEditor } from '../components/MarkdownEditor'

const SUBJECT_SORT_LABELS = { alpha: 'A → Z', date: 'Date added', custom: 'Custom' }
const SCROLL_KEY  = sid => `scroll-subject-${sid}`
const LAST_ID_KEY = sid => `subject-last-id-${sid}`
const STATE_KEY   = sid => `subject-state-${sid}`
const getMain = () => document.getElementById('main-content')

const EMPTY_FILTERS = { topics: [], tags: [], states: [], priorities: [], pinned: false }

function isEditableTarget(e) {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
    e.target.contentEditable === 'true'
}

export default function SubjectView() {
  const { subjectId } = useParams()
  const navigate = useNavigate()

  const subject              = useStore(s => s.subjects.find(x => x.id === subjectId))
  const allConcepts          = useStore(s => s.concepts)
  const topics               = useStore(s => s.topics)
  const tags                 = useStore(s => s.tags)
  const subjectOrders        = useStore(s => s.subjectOrders)
  const sortMode             = useStore(s => s.subjectSortModes[subjectId] ?? 'alpha')
  const setSubjectSortMode   = useStore(s => s.setSubjectSortMode)
  const moveConceptInSubject = useStore(s => s.moveConceptInSubject)
  const deleteConcept        = useStore(s => s.deleteConcept)
  const updateConceptField   = useStore(s => s.updateConceptField)
  const incrementReview      = useStore(s => s.incrementReview)
  const decrementReview      = useStore(s => s.decrementReview)

  // Restore filter state if returning from ConceptView (read before first render)
  const [savedState] = useState(() => {
    if (!sessionStorage.getItem('cv-back')) return null
    try { return JSON.parse(sessionStorage.getItem(STATE_KEY(subjectId)) || 'null') } catch { return null }
  })

  const [filters, setFiltersState] = useState(() => savedState?.filters ?? EMPTY_FILTERS)
  const [focusedIdx, setFocusedIdx]   = useState(0)
  const [expandedIds, setExpandedIds] = useState(new Set())

  function setFilter(key, value) { setFiltersState(f => ({ ...f, [key]: value })) }
  function clearFilters() { setFiltersState(EMPTY_FILTERS) }
  const hasActiveFilters = Boolean(
    filters.topics?.length || filters.tags?.length || filters.states?.length ||
    filters.priorities?.length || filters.pinned
  )

  // suppressScroll: true while we're restoring scroll from a back-navigation
  const suppressScroll = useRef(false)

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

      const idx = lastId ? displayed.findIndex(c => c.id === lastId) : -1
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

  const subjectConcepts = allConcepts.filter(c => c.subjectIds.includes(subjectId))

  const displayed = useMemo(() => {
    const filtered = subjectConcepts.filter(c => {
      if (filters.topics?.length     && !filters.topics.some(id => c.topicIds.includes(id)))           return false
      if (filters.tags?.length       && !filters.tags.some(id => c.tagIds.includes(id)))               return false
      if (filters.states?.length     && !filters.states.includes(c.state ?? 'NEW'))                    return false
      if (filters.priorities?.length && !filters.priorities.includes(c.priority ?? 'MEDIUM'))          return false
      if (filters.pinned             && !c.pinned)                                                      return false
      return true
    })
    if (sortMode === 'alpha') return [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    if (sortMode === 'date')  return [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    if (sortMode === 'custom') {
      const order = subjectOrders[subjectId] || []
      return [...filtered].sort((a, b) => {
        const ia = order.indexOf(a.id), ib = order.indexOf(b.id)
        if (ia === -1 && ib === -1) return new Date(a.createdAt) - new Date(b.createdAt)
        if (ia === -1) return 1; if (ib === -1) return -1
        return ia - ib
      })
    }
    return filtered
  }, [subjectConcepts, filters, sortMode, subjectOrders, subjectId])

  // Reset focus to first item when sort changes (skip on first render)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setFocusedIdx(0)
  }, [sortMode])

  // Scroll focused row into view (suppressed during back-navigation restoration)
  useEffect(() => {
    if (suppressScroll.current) return
    const concept = displayed[focusedIdx]
    if (!concept) return
    const el = document.getElementById(`sub-${concept.id}`)
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [focusedIdx, displayed])

  // Keyboard navigation
  const stateRef = useRef({})
  stateRef.current = { displayed, focusedIdx, expandedIds, filters }

  useEffect(() => {
    function onKey(e) {
      if (isEditableTarget(e)) return
      const { displayed, focusedIdx, expandedIds, filters } = stateRef.current
      if (!displayed.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIdx(i => Math.min(i + 1, displayed.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIdx(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const concept = displayed[focusedIdx]
        if (concept) {
          sessionStorage.setItem(STATE_KEY(subjectId), JSON.stringify({ filters }))
          const el = getMain()
          if (el) sessionStorage.setItem(SCROLL_KEY(subjectId), String(el.scrollTop))
          sessionStorage.setItem(LAST_ID_KEY(subjectId), concept.id)
          navigate(`/app/concepts/${concept.id}`)
        }
      } else if (e.key === ' ') {
        e.preventDefault()
        const concept = displayed[focusedIdx]
        if (concept) {
          setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(concept.id)) next.delete(concept.id)
            else next.add(concept.id)
            return next
          })
        }
      } else if (e.key === '+' || e.key === '=') {
        const concept = displayed[focusedIdx]
        if (concept) useStore.getState().incrementReview(concept.id)
      } else if (e.key === '-') {
        const concept = displayed[focusedIdx]
        if (concept) useStore.getState().decrementReview(concept.id)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navigate, subjectId])

  if (!subject) {
    return <div className="flex items-center justify-center h-full"><p className="text-gray-400">Subject not found.</p></div>
  }

  function handleDelete(e, concept) {
    e.preventDefault()
    if (window.confirm(`Delete "${concept.name}"?`)) deleteConcept(concept.id)
  }

  function saveState(conceptId) {
    sessionStorage.setItem(STATE_KEY(subjectId), JSON.stringify({ filters }))
    const el = getMain()
    if (el) sessionStorage.setItem(SCROLL_KEY(subjectId), String(el.scrollTop))
    sessionStorage.setItem(LAST_ID_KEY(subjectId), conceptId)
  }

  function canMoveUp(conceptId) {
    if (sortMode !== 'custom' || hasActiveFilters) return false
    const order = subjectOrders[subjectId] || []
    return order.indexOf(conceptId) > 0
  }
  function canMoveDown(conceptId) {
    if (sortMode !== 'custom' || hasActiveFilters) return false
    const order = subjectOrders[subjectId] || []
    const idx = order.indexOf(conceptId)
    return idx >= 0 && idx < order.length - 1
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
        <span className="text-sm text-gray-400">{subjectConcepts.length} total</span>
      </div>

      <FilterSortBar
        filters={filters} sort={sortMode}
        setFilter={setFilter}
        setSort={mode => setSubjectSortMode(subjectId, mode)}
        clearFilters={clearFilters} hasActiveFilters={hasActiveFilters}
        topics={topics} tags={tags}
        availableSorts={['alpha', 'date', 'custom']}
        availableFilters={['topic', 'tag', 'state', 'priority', 'pinned']}
        sortLabels={SUBJECT_SORT_LABELS}
        resultCount={displayed.length}
      />

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
        <div className="space-y-2">
          {displayed.map((concept, idx) => (
            <ConceptRow
              key={concept.id}
              concept={concept}
              focused={idx === focusedIdx}
              expanded={expandedIds.has(concept.id)}
              onToggleExpand={() => {
                setExpandedIds(prev => {
                  const next = new Set(prev)
                  if (next.has(concept.id)) next.delete(concept.id)
                  else next.add(concept.id)
                  return next
                })
              }}
              onFocus={() => setFocusedIdx(idx)}
              isCustom={sortMode === 'custom' && !hasActiveFilters}
              canUp={canMoveUp(concept.id)}
              canDown={canMoveDown(concept.id)}
              onMoveUp={e => { e.preventDefault(); moveConceptInSubject(subjectId, concept.id, 'up') }}
              onMoveDown={e => { e.preventDefault(); moveConceptInSubject(subjectId, concept.id, 'down') }}
              onDelete={e => handleDelete(e, concept)}
              onSaveState={() => saveState(concept.id)}
              onUpdateField={(f, v) => updateConceptField(concept.id, f, v)}
              onIncrementReview={() => incrementReview(concept.id)}
              onDecrementReview={() => decrementReview(concept.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ConceptRow({ concept, focused, expanded, onToggleExpand, onFocus, isCustom, canUp, canDown, onMoveUp, onMoveDown, onDelete, onSaveState, onUpdateField, onIncrementReview, onDecrementReview }) {
  return (
    <div
      id={`sub-${concept.id}`}
      className={`bg-white border rounded-xl shadow-sm transition-all ${
        focused ? 'border-indigo-300 ring-2 ring-indigo-200 ring-inset' : 'border-gray-100'
      }`}
      onClick={onFocus}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Concept name */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/app/concepts/${concept.id}`}
            onClick={onSaveState}
            className="font-medium text-gray-900 hover:text-indigo-700 transition-colors"
          >
            {concept.pinned && <span className="text-amber-400 mr-1.5 text-xs">★</span>}
            {concept.name}
          </Link>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <StateSelector value={concept.state} onChange={v => onUpdateField('state', v)} />
          <PriorityBadge value={concept.priority} onChange={v => onUpdateField('priority', v)} />
          <ReviewCounter count={concept.reviewCount} onIncrement={onIncrementReview} onDecrement={onDecrementReview} />
          <PinButton pinned={concept.pinned} onToggle={() => onUpdateField('pinned', !concept.pinned)} />
          <button
            onClick={e => { e.preventDefault(); onToggleExpand() }}
            className="text-gray-400 hover:text-gray-700 text-xs w-5 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
            aria-expanded={expanded}
            aria-label={expanded ? `Collapse notes for ${concept.name}` : `Expand notes for ${concept.name}`}
          >
            <span aria-hidden="true">{expanded ? '▲' : '▼'}</span>
          </button>
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-500 transition-colors text-sm leading-none focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
            aria-label={`Delete concept: ${concept.name}`}
          >
            <span aria-hidden="true">✕</span>
          </button>

          {/* Custom sort arrows — far right */}
          {isCustom && (
            <div className="flex flex-col gap-0 flex-shrink-0 ml-1">
              <button
                onClick={onMoveUp}
                disabled={!canUp}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-tight text-xs px-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                aria-label={`Move ${concept.name} up`}
                aria-disabled={!canUp}
              >
                <span aria-hidden="true">↑</span>
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canDown}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-tight text-xs px-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                aria-label={`Move ${concept.name} down`}
                aria-disabled={!canDown}
              >
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3 rounded-b-xl">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">MVK</p>
          <InlineEditor
            conceptId={concept.id}
            field="mvkNotes"
            content={concept.mvkNotes ?? ''}
            placeholder="Write the smallest useful representation of this concept in your own words. Keep it concise, intuitive and easy to remember: a simple example, a few keywords, a short synthesis, a picture, or a mini diagram."
          />
        </div>
      )}
    </div>
  )
}
