import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useApp } from '../context/AppContext'
import FilterSortBar from '../components/FilterSortBar'
import ShortcutsHintBar from '../components/ShortcutsHintBar'
import { StateSelector, PriorityBadge, ReviewCounter, PinButton, PinIcon } from '../components/StatusBadge'
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
  const { collapsed } = useApp()
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
  const [focusedIdx, setFocusedIdx] = useState(0)
  const [panelOpen, setPanelOpen]   = useState(false)
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

  const focusedConcept = displayed[focusedIdx] ?? null

  // Keyboard navigation
  const stateRef = useRef({})
  stateRef.current = { displayed, focusedIdx, filters }

  useEffect(() => {
    function onKey(e) {
      if (isEditableTarget(e)) return
      const { displayed, focusedIdx, filters } = stateRef.current
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
        setPanelOpen(p => !p)
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
    <div className="max-w-3xl mx-auto px-8 py-10 pb-44">
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

      {/* MVK Drawer — always present, collapsed by default */}
      <div className={`fixed bottom-0 right-0 z-20 bg-gray-900 transition-all duration-200 ${collapsed ? 'left-16' : 'left-60'}`}>
        {panelOpen && (
          <div className="bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
            {focusedConcept && (
              <InlineEditor
                key={focusedConcept.id}
                conceptId={focusedConcept.id}
                field="mvkNotes"
                content={focusedConcept.mvkNotes ?? ''}
                placeholder="Write the smallest useful representation of this concept in your own words. Keep it tiny, intuitive and easy to remember: a simple example, a couple keywords, a micro synthesis, a mini diagram, an image..."
              />
            )}
          </div>
        )}
        <button
          onClick={() => setPanelOpen(p => !p)}
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

function ConceptRow({ concept, focused, onFocus, isCustom, canUp, canDown, onMoveUp, onMoveDown, onDelete, onSaveState, onUpdateField, onIncrementReview, onDecrementReview }) {
  return (
    <div
      id={`sub-${concept.id}`}
      className={`border rounded-md transition-all ${
        focused ? 'bg-gray-100/80 border-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
      onClick={onFocus}
    >
      <div className="flex items-center gap-2 px-4 py-2">
        {/* Concept name */}
        <div className="flex-1 min-w-0 break-words">
          <Link
            to={`/app/concepts/${concept.id}`}
            onClick={onSaveState}
            className="text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors"
          >
            {concept.pinned && <PinIcon size={10} className="inline text-amber-400 mr-1.5 -mt-px" />}
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
                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-tight text-xs px-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                aria-label={`Move ${concept.name} up`}
                aria-disabled={!canUp}
              >
                <span aria-hidden="true">↑</span>
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canDown}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-tight text-xs px-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                aria-label={`Move ${concept.name} down`}
                aria-disabled={!canDown}
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
