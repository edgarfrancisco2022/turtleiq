import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useApp } from '../context/AppContext'
import { useFilterSort } from '../hooks/useFilterSort'
import FilterSortBar from '../components/FilterSortBar'
import ShortcutsHintBar from '../components/ShortcutsHintBar'
import { StateSelector, PriorityBadge, ReviewCounter, PinButton, PinIcon } from '../components/StatusBadge'
import { InlineEditor, MVK_EXAMPLE_HINT, MVK_PLACEHOLDER, MVK_EDIT_PLACEHOLDER } from '../components/MarkdownEditor'

function nameFiltered(concepts, query) {
  if (!query) return concepts
  const q = query.toLowerCase()
  return concepts.filter(c => c.name.toLowerCase().includes(q))
}

const SCROLL_KEY  = 'scroll-list'
const LAST_ID_KEY = 'list-last-id'
const STATE_KEY   = 'list-view-state'
const getMain = () => document.getElementById('main-content')

function isEditableTarget(e) {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
    e.target.contentEditable === 'true'
}

export default function ListMode() {
  const { collapsed } = useApp()
  const concepts = useStore(s => s.concepts)

  // Restore filter/sort state if returning from ConceptView (read before first render)
  const [savedState] = useState(() => {
    if (!sessionStorage.getItem('cv-back')) return null
    try { return JSON.parse(sessionStorage.getItem(STATE_KEY) || 'null') } catch { return null }
  })

  const { filtered, filters, sort, setFilter, setSort, clearFilters, hasActiveFilters, subjects, topics, tags } =
    useFilterSort(concepts, { initialFilters: savedState?.filters, initialSort: savedState?.sort })

  const results = useMemo(
    () => nameFiltered(filtered, filters._nameQuery),
    [filtered, filters._nameQuery]
  )

  const [focusedIdx, setFocusedIdx] = useState(0)
  const [panelOpen, setPanelOpen]   = useState(false)
  const navigate = useNavigate()

  const focusedConcept = results[focusedIdx] ?? null

  // suppressScroll: true while restoring scroll from back-navigation
  const suppressScroll = useRef(false)
  // backRestoring: true while restoring from back-navigation, prevents focus reset
  const backRestoring = useRef(false)

  // Scroll to top on mount; restore scroll/focus if returning from ConceptView
  useEffect(() => {
    const el = getMain()
    if (el) el.scrollTop = 0

    if (sessionStorage.getItem('cv-back')) {
      sessionStorage.removeItem('cv-back')
      sessionStorage.removeItem(STATE_KEY)
      const saved = sessionStorage.getItem(SCROLL_KEY)
      sessionStorage.removeItem(SCROLL_KEY)
      const lastId = sessionStorage.getItem(LAST_ID_KEY)
      sessionStorage.removeItem(LAST_ID_KEY)

      backRestoring.current = true
      const idx = lastId ? results.findIndex(c => c.id === lastId) : -1
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
  }, [])

  // Reset focus to first item when filtered list changes or sort changes (skip during back-navigation restoration)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (backRestoring.current) { backRestoring.current = false; return }
    setFocusedIdx(0)
  }, [results.length, sort])

  // Scroll focused row into view (suppressed during back-navigation restoration)
  useEffect(() => {
    if (suppressScroll.current) return
    const concept = results[focusedIdx]
    if (!concept) return
    const el = document.getElementById(`lib-${concept.id}`)
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [focusedIdx, filtered])

  // Keyboard navigation
  const stateRef = useRef({})
  stateRef.current = { results, focusedIdx, filters, sort }
  const lastNavTime = useRef(0)

  useEffect(() => {
    function onKey(e) {
      if (isEditableTarget(e)) return
      const { results, focusedIdx, filters, sort } = stateRef.current
      if (!results.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const now = Date.now()
        if (e.repeat && now - lastNavTime.current < 180) return
        lastNavTime.current = now
        setFocusedIdx(i => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const now = Date.now()
        if (e.repeat && now - lastNavTime.current < 180) return
        lastNavTime.current = now
        setFocusedIdx(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const concept = results[focusedIdx]
        if (concept) {
          sessionStorage.setItem(STATE_KEY, JSON.stringify({ filters, sort }))
          const el = getMain()
          if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop))
          sessionStorage.setItem(LAST_ID_KEY, concept.id)
          navigate(`/app/concepts/${concept.id}`)
        }
      } else if (e.key === ' ') {
        e.preventDefault()
        setPanelOpen(p => !p)
      } else if (e.key === '+' || e.key === '=') {
        const concept = results[focusedIdx]
        if (concept) useStore.getState().incrementReview(concept.id)
      } else if (e.key === '-') {
        const concept = results[focusedIdx]
        if (concept) useStore.getState().decrementReview(concept.id)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navigate])

  function saveState(conceptId) {
    sessionStorage.setItem(STATE_KEY, JSON.stringify({ filters, sort }))
    const el = getMain()
    if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop))
    sessionStorage.setItem(LAST_ID_KEY, conceptId)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 pb-44">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Library</h1>
        <span className="text-sm text-gray-400">{results.length} total</span>
      </div>

      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
          <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="7.5" r="5" />
            <line x1="11.5" y1="11.5" x2="16" y2="16" />
          </svg>
        </span>
        <label htmlFor="library-search-input" className="sr-only">Search concept names</label>
        <input
          id="library-search-input"
          type="search"
          value={filters._nameQuery || ''}
          onChange={e => setFilter('_nameQuery', e.target.value)}
          placeholder="Search concept names..."
          aria-label="Search concept names"
          className="w-full border border-gray-200 rounded pl-9 pr-4 py-1 text-sm bg-white transition-colors hover:border-blue-200 hover:bg-blue-50/30 focus:outline-none focus:border-blue-400 focus:bg-blue-50/40"
        />
      </div>

      <FilterSortBar
        filters={filters} sort={sort}
        setFilter={setFilter} setSort={setSort}
        clearFilters={clearFilters} hasActiveFilters={hasActiveFilters}
        subjects={subjects} topics={topics} tags={tags}
        resultCount={filtered.length}
      />

      <ShortcutsHintBar items={[
        { keyLabel: '↑ ↓', actionLabel: 'Navigate' },
        { keyLabel: 'Space', actionLabel: 'MVK' },
        { keyLabel: 'Enter', actionLabel: 'Open' },
        { keyLabel: '⌫', actionLabel: 'Back' },
        { keyLabel: '+ / −', actionLabel: 'Review Count' },
      ]} />

      {results.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {concepts.length === 0 ? 'No concepts yet. Create your first concept to get started.' : 'No concepts match the current filters.'}
        </div>
      ) : (
        <div className="space-y-1.5">
          {results.map((concept, idx) => (
            <ListConceptRow
              key={concept.id}
              concept={concept}
              focused={idx === focusedIdx}
              onFocus={() => setFocusedIdx(idx)}
              onSaveState={() => saveState(concept.id)}
            />
          ))}
        </div>
      )}

      {/* MVK Drawer — always present, collapsed by default */}
      <div className={`fixed bottom-0 right-0 z-20 bg-gray-900 transition-all duration-200 max-md:left-0 ${collapsed ? 'md:left-16' : 'md:left-60'}`}>
        {panelOpen && (
          <div className="bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
            {focusedConcept && (
              <InlineEditor
                key={focusedConcept.id}
                conceptId={focusedConcept.id}
                field="mvkNotes"
                content={focusedConcept.mvkNotes ?? ''}
                placeholder={MVK_PLACEHOLDER}
                hint={MVK_EXAMPLE_HINT}
                editPlaceholder={MVK_EDIT_PLACEHOLDER}
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

function ListConceptRow({ concept, focused, onFocus, onSaveState }) {
  const updateConceptField = useStore(s => s.updateConceptField)
  const incrementReview    = useStore(s => s.incrementReview)
  const decrementReview    = useStore(s => s.decrementReview)
  const subjects = useStore(s => s.subjects)
  const conceptSubjects = subjects.filter(s => concept.subjectIds.includes(s.id))

  return (
    <div
      id={`lib-${concept.id}`}
      className={`border rounded-md transition-all ${
        focused ? 'bg-gray-100/80 border-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
      onClick={onFocus}
    >
      <div className="flex flex-col gap-1.5 px-4 py-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex-1 min-w-0 break-words">
          <Link
            to={`/app/concepts/${concept.id}`}
            onClick={onSaveState}
            className="font-inter text-sm font-semibold text-gray-900 tracking-normal hover:text-blue-700 transition-colors"
          >
            {concept.pinned && <PinIcon size={10} className="inline text-amber-400 mr-1.5 -mt-px" />}
            {concept.name}
          </Link>
          {conceptSubjects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {conceptSubjects.map(s => (
                <span key={s.id} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">{s.name}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <StateSelector value={concept.state} onChange={v => updateConceptField(concept.id, 'state', v)} />
          <PriorityBadge value={concept.priority} onChange={v => updateConceptField(concept.id, 'priority', v)} />
          <ReviewCounter
            count={concept.reviewCount}
            onIncrement={() => incrementReview(concept.id)}
            onDecrement={() => decrementReview(concept.id)}
          />
          <PinButton pinned={concept.pinned} onToggle={() => updateConceptField(concept.id, 'pinned', !concept.pinned)} />
        </div>
      </div>
    </div>
  )
}
