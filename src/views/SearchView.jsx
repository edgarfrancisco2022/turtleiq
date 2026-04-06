import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useFilterSort } from '../hooks/useFilterSort'
import FilterSortBar from '../components/FilterSortBar'
import { STATE_STYLES, PRIORITY_STYLES, PinIcon } from '../components/StatusBadge'

const SCROLL_KEY  = 'scroll-search'
const LAST_ID_KEY = 'search-last-id'
const STATE_KEY   = 'search-view-state'
const getMain = () => document.getElementById('main-content')

function nameFiltered(concepts, query) {
  if (!query) return concepts
  const q = query.toLowerCase()
  return concepts.filter(c => c.name.toLowerCase().includes(q))
}

export default function SearchView() {
  const concepts = useStore(s => s.concepts)

  // Restore filter/sort state if returning from ConceptView (read before first render)
  const [savedState] = useState(() => {
    if (!sessionStorage.getItem('cv-back')) return null
    try { return JSON.parse(sessionStorage.getItem(STATE_KEY) || 'null') } catch { return null }
  })

  const { filtered, filters, sort, setFilter, setSort, clearFilters, hasActiveFilters, subjects, topics, tags } =
    useFilterSort(concepts, { initialFilters: savedState?.filters, initialSort: savedState?.sort })

  const [focusedIdx, setFocusedIdx] = useState(0)
  const navigate = useNavigate()

  const results = useMemo(
    () => nameFiltered(filtered, filters._nameQuery),
    [filtered, filters._nameQuery]
  )

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

  // Reset focus to first item when results change (skip during back-navigation restoration)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (backRestoring.current) { backRestoring.current = false; return }
    setFocusedIdx(0)
  }, [results.length])

  // Scroll focused item into view (suppressed during back-navigation restoration)
  useEffect(() => {
    if (suppressScroll.current) return
    const c = results[focusedIdx]
    if (!c) return
    const el = document.getElementById(`search-${c.id}`)
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [focusedIdx, results])

  // Keyboard navigation
  const stateRef = useRef({})
  stateRef.current = { results, focusedIdx, filters, sort }

  useEffect(() => {
    function onKey(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.contentEditable === 'true') return
      const { results, focusedIdx, filters, sort } = stateRef.current
      if (!results.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIdx(i => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIdx(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const c = results[focusedIdx]
        if (c) {
          sessionStorage.setItem(STATE_KEY, JSON.stringify({ filters, sort }))
          const el = getMain()
          if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop))
          sessionStorage.setItem(LAST_ID_KEY, c.id)
          navigate(`/app/concepts/${c.id}`)
        }
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
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <span className="text-sm text-gray-400">{results.length} total</span>
      </div>

      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
          <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="7.5" r="5" />
            <line x1="11.5" y1="11.5" x2="16" y2="16" />
          </svg>
        </span>
        <label htmlFor="search-concepts-input" className="sr-only">Search concept names</label>
        <input
          id="search-concepts-input"
          type="search"
          value={filters._nameQuery || ''}
          onChange={e => setFilter('_nameQuery', e.target.value)}
          placeholder="Search concept names..."
          aria-label="Search concept names"
          className="w-full border border-gray-200 rounded pl-9 pr-4 py-1 text-sm bg-white transition-colors hover:border-blue-200 hover:bg-blue-50/30 focus:outline-none focus:border-blue-400 focus:bg-blue-50/40"
          autoFocus={savedState === null}
        />
      </div>

      <FilterSortBar
        filters={filters} sort={sort}
        setFilter={setFilter} setSort={setSort}
        clearFilters={clearFilters} hasActiveFilters={hasActiveFilters}
        subjects={subjects} topics={topics} tags={tags}
        availableFilters={['subject', 'topic', 'tag', 'state', 'priority', 'pinned']}
        resultCount={results.length}
      />

      <Results concepts={results} focusedIdx={focusedIdx} setFocusedIdx={setFocusedIdx} saveState={saveState} />
    </div>
  )
}

function Results({ concepts, focusedIdx, setFocusedIdx, saveState }) {
  const subjects = useStore(s => s.subjects)
  const topics   = useStore(s => s.topics)
  const tags     = useStore(s => s.tags)

  if (concepts.length === 0) {
    return <p className="text-center py-12 text-gray-400 text-sm">No concepts match your search.</p>
  }

  return (
    <div className="space-y-1.5">
      {concepts.map((c, idx) => {
        const cSubjects = subjects.filter(s => c.subjectIds.includes(s.id))
        const cTopics   = topics.filter(t => c.topicIds.includes(t.id))
        const cTags     = tags.filter(t => c.tagIds.includes(t.id))
        const isFocused = idx === focusedIdx
        return (
          <div
            key={c.id}
            id={`search-${c.id}`}
            onClick={() => setFocusedIdx(idx)}
            className={`border rounded-md px-4 py-2 transition-all group ${
              isFocused
                ? 'bg-gray-100/80 border-gray-300'
                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <Link
                  to={`/app/concepts/${c.id}`}
                  onClick={() => saveState(c.id)}
                  className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors break-words"
                >
                  {c.pinned && <PinIcon size={10} className="inline text-amber-400 mr-1.5 -mt-px" />}
                  {c.name}
                </Link>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATE_STYLES[c.state ?? 'NEW']}`}>{c.state ?? 'NEW'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLES[c.priority ?? 'MEDIUM']}`}>{c.priority ?? 'MEDIUM'}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cSubjects.map(s => <span key={s.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{s.name}</span>)}
              {cTopics.map(t => <span key={t.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{t.name}</span>)}
              {cTags.map(t => <span key={t.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#{t.name}</span>)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
