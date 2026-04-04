import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useFilterSort } from '../hooks/useFilterSort'
import FilterSortBar from '../components/FilterSortBar'
import { ReviewCounter } from '../components/StatusBadge'

const SCROLL_KEY  = 'scroll-index'
const LAST_ID_KEY = 'index-last-id'
const STATE_KEY   = 'index-view-state'
const getMain = () => document.getElementById('main-content')

function isEditableTarget(e) {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
    e.target.contentEditable === 'true'
}

export default function IndexMode() {
  const concepts = useStore(s => s.concepts)
  const incrementReview = useStore(s => s.incrementReview)
  const decrementReview = useStore(s => s.decrementReview)

  // Restore filter/sort state if returning from ConceptView (read before first render)
  const [savedState] = useState(() => {
    if (!sessionStorage.getItem('cv-back')) return null
    try { return JSON.parse(sessionStorage.getItem(STATE_KEY) || 'null') } catch { return null }
  })

  const { filtered, filters, sort, setFilter, setSort, clearFilters, hasActiveFilters, subjects, topics, tags } =
    useFilterSort(concepts, { initialFilters: savedState?.filters, initialSort: savedState?.sort })

  const [focusedIdx, setFocusedIdx] = useState(0)
  const navigate = useNavigate()

  // suppressScroll: true while we're restoring scroll from a back-navigation
  const suppressScroll = useRef(false)

  // Scroll to top on mount; restore scroll/focus if returning from ConceptView
  useEffect(() => {
    const el = getMain()
    if (el) el.scrollTop = 0

    if (sessionStorage.getItem('cv-back')) {
      sessionStorage.removeItem('cv-back')
      sessionStorage.removeItem(STATE_KEY)
      const savedScroll = sessionStorage.getItem(SCROLL_KEY)
      sessionStorage.removeItem(SCROLL_KEY)
      const lastId = sessionStorage.getItem(LAST_ID_KEY)
      sessionStorage.removeItem(LAST_ID_KEY)

      const idx = lastId ? filtered.findIndex(c => c.id === lastId) : -1
      if (idx >= 0) setFocusedIdx(idx)

      if (savedScroll) {
        suppressScroll.current = true
        const pos = parseInt(savedScroll, 10)
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

  // Reset focus to first item when sort changes (skip on first render)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setFocusedIdx(0)
  }, [sort])

  // Scroll focused row into view (suppressed during back-navigation restoration)
  useEffect(() => {
    if (suppressScroll.current) return
    const concept = filtered[focusedIdx]
    if (!concept) return
    const el = document.getElementById(`idx-${concept.id}`)
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [focusedIdx, filtered])

  // Keyboard navigation
  const stateRef = useRef({})
  stateRef.current = { filtered, focusedIdx, filters, sort }

  useEffect(() => {
    function onKey(e) {
      if (isEditableTarget(e)) return
      const { filtered, focusedIdx, filters, sort } = stateRef.current
      if (!filtered.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIdx(i => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIdx(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const concept = filtered[focusedIdx]
        if (concept) {
          sessionStorage.setItem(STATE_KEY, JSON.stringify({ filters, sort }))
          const el = getMain()
          if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop))
          sessionStorage.setItem(LAST_ID_KEY, concept.id)
          navigate(`/app/concepts/${concept.id}`)
        }
      } else if (e.key === '+' || e.key === '=') {
        const concept = filtered[focusedIdx]
        if (concept) incrementReview(concept.id)
      } else if (e.key === '-') {
        const concept = filtered[focusedIdx]
        if (concept) decrementReview(concept.id)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navigate, incrementReview, decrementReview])

  function handleConceptClick(id) {
    sessionStorage.setItem(STATE_KEY, JSON.stringify({ filters, sort }))
    const el = getMain()
    if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop))
    sessionStorage.setItem(LAST_ID_KEY, id)
  }

  const isAlpha = sort === 'alpha' || sort === 'alpha_desc'

  const grouped = useMemo(() => {
    if (!isAlpha) return [{ letter: null, concepts: filtered }]
    const map = {}
    filtered.forEach(c => {
      const letter = c.name?.[0]?.toUpperCase() || '#'
      if (!map[letter]) map[letter] = []
      map[letter].push(c)
    })
    const entries = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
    if (sort === 'alpha_desc') entries.reverse()
    return entries.map(([letter, concepts]) => ({ letter, concepts }))
  }, [filtered, isAlpha, sort])

  // Flat list for focus index computation
  const flatList = useMemo(() => grouped.flatMap(g => g.concepts), [grouped])

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Index</h1>
        <span className="text-sm text-gray-400">{concepts.length} total</span>
      </div>

      <FilterSortBar
        filters={filters} sort={sort}
        setFilter={setFilter} setSort={setSort}
        clearFilters={clearFilters} hasActiveFilters={hasActiveFilters}
        subjects={subjects} topics={topics} tags={tags}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          {concepts.length === 0 ? 'No concepts yet.' : 'No concepts match the current filters.'}
        </div>
      ) : (
        <div>
          {grouped.map(({ letter, concepts: group }) => (
            <div key={letter ?? 'all'} className="mb-6">
              {letter && (
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest w-5">{letter}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )}
              {group.map(c => {
                const globalIdx = flatList.findIndex(fc => fc.id === c.id)
                const isFocused = globalIdx === focusedIdx
                return (
                  <div
                    key={c.id}
                    id={`idx-${c.id}`}
                    className={`flex items-center group py-1 border-b border-gray-50 last:border-0 rounded transition-colors ${
                      isFocused ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => setFocusedIdx(globalIdx)}
                  >
                    <div className="flex-1 min-w-0 py-0.5 pl-1">
                      <Link
                        to={`/app/concepts/${c.id}`}
                        onClick={() => handleConceptClick(c.id)}
                        className="text-sm text-gray-800 hover:text-indigo-700 transition-colors"
                      >
                        {c.pinned && <span className="text-amber-400 mr-1.5 text-[11px]">★</span>}
                        {c.name}
                      </Link>
                    </div>
                    <ReviewCounter
                      count={c.reviewCount}
                      onIncrement={() => incrementReview(c.id)}
                      onDecrement={() => decrementReview(c.id)}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
