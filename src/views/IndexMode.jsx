import { useState, useEffect, useRef, Fragment } from 'react'
import { PinIcon } from '../components/StatusBadge'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useApp } from '../context/AppContext'
import { useFilterSort } from '../hooks/useFilterSort'
import FilterSortBar from '../components/FilterSortBar'
import ShortcutsHintBar from '../components/ShortcutsHintBar'
import { InlineEditor, MVK_EXAMPLE_HINT, MVK_PLACEHOLDER, MVK_EDIT_PLACEHOLDER } from '../components/MarkdownEditor'

const SCROLL_KEY  = 'scroll-index'
const LAST_ID_KEY = 'index-last-id'
const STATE_KEY   = 'index-view-state'
const getMain = () => document.getElementById('main-content')

/**
 * Groups a flat concept list (already sorted) into alphabetical sections.
 * Non A–Z names go under '#' (numbers first, then symbols, lexicographic).
 * Returns [{ letter, items: [{ concept, globalIdx }] }]
 */
function groupByLetter(concepts) {
  const map = {}
  concepts.forEach((c, globalIdx) => {
    const first = (c.name?.trim()[0] ?? '').toUpperCase()
    const key = /^[A-Z]$/.test(first) ? first : '#'
    if (!map[key]) map[key] = []
    map[key].push({ concept: c, globalIdx })
  })

  if (map['#']) {
    map['#'].sort((a, b) => {
      const na = a.concept.name, nb = b.concept.name
      const aNum = /^\d/.test(na), bNum = /^\d/.test(nb)
      if (aNum && bNum) return parseFloat(na) - parseFloat(nb)
      if (aNum) return -1
      if (bNum) return 1
      return na.localeCompare(nb)
    })
  }

  const keys = Object.keys(map).sort((a, b) => {
    if (a === '#') return -1
    if (b === '#') return 1
    return a.localeCompare(b)
  })

  return keys.map(letter => ({ letter, items: map[letter] }))
}

function isEditableTarget(e) {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
    e.target.contentEditable === 'true'
}

/**
 * Visual up/down navigation for a flex-wrap pill list.
 *
 * DOWN: find the nearest row below the current element, then among those
 *       that share any horizontal overlap with it pick the leftmost.
 * UP:   find the nearest row above the current element, then among those
 *       that share any horizontal overlap with it pick the rightmost.
 *
 * Falls back to the leftmost/rightmost element of that row when nothing
 * overlaps (e.g. the current pill is very narrow and hangs at the end of
 * a long row).
 */
function getVisualNavIndex(direction, currentIdx, filtered) {
  const els = filtered.map((c, i) => {
    const el = document.getElementById(`idx-${c.id}`)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { idx: i, left: r.left, right: r.right, top: r.top, bottom: r.bottom }
  }).filter(Boolean)

  const cur = els.find(e => e.idx === currentIdx)
  if (!cur) return currentIdx

  if (direction === 'down') {
    // Elements whose top starts at or below the bottom of the current element
    const below = els.filter(e => e.top >= cur.bottom - 2)
    if (!below.length) return currentIdx
    // Identify the immediate next row (smallest top)
    const minTop = Math.min(...below.map(e => e.top))
    const row = below.filter(e => e.top <= minTop + 4)
    // Prefer candidates that overlap horizontally
    const overlapping = row.filter(e => e.left < cur.right && e.right > cur.left)
    const candidates = overlapping.length ? overlapping : row
    return candidates.reduce((best, e) => e.left < best.left ? e : best).idx
  } else {
    // Elements whose bottom ends at or above the top of the current element
    const above = els.filter(e => e.bottom <= cur.top + 2)
    if (!above.length) return currentIdx
    // Identify the immediate previous row (largest bottom)
    const maxBottom = Math.max(...above.map(e => e.bottom))
    const row = above.filter(e => e.bottom >= maxBottom - 4)
    // Prefer candidates that overlap horizontally
    const overlapping = row.filter(e => e.left < cur.right && e.right > cur.left)
    const candidates = overlapping.length ? overlapping : row
    return candidates.reduce((best, e) => e.right > best.right ? e : best).idx
  }
}

export default function IndexMode() {
  const { collapsed } = useApp()
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
  const [panelOpen, setPanelOpen] = useState(false)
  const navigate = useNavigate()

  const focusedConcept = filtered[focusedIdx] ?? null

  const suppressScroll = useRef(false)
  // backRestoring: true while a back-navigation restore is in flight;
  // prevents the sort-change effect (which StrictMode double-invokes) from
  // resetting focusedIdx to 0 after we just set it to the restored index.
  const backRestoring  = useRef(false)
  // pendingFocusId: fallback for when filtered is empty on first render
  const pendingFocusId = useRef(null)

  // Restore scroll/focus when returning from ConceptView
  useEffect(() => {
    const el = getMain()
    if (el) el.scrollTop = 0

    if (!sessionStorage.getItem('cv-back')) return
    sessionStorage.removeItem('cv-back')
    sessionStorage.removeItem(STATE_KEY)
    const savedScroll = sessionStorage.getItem(SCROLL_KEY)
    sessionStorage.removeItem(SCROLL_KEY)
    const lastId = sessionStorage.getItem(LAST_ID_KEY)
    sessionStorage.removeItem(LAST_ID_KEY)

    if (!lastId) return

    const idx = filtered.findIndex(c => c.id === lastId)
    if (idx >= 0) {
      backRestoring.current = true
      setFocusedIdx(idx)
    } else {
      // Deferred: filtered may be empty if Zustand hydrates asynchronously
      pendingFocusId.current = lastId
    }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Deferred focus restoration — only needed if filtered was empty on first render
  useEffect(() => {
    if (!pendingFocusId.current || !filtered.length) return
    const idx = filtered.findIndex(c => c.id === pendingFocusId.current)
    if (idx < 0) return
    pendingFocusId.current = null
    backRestoring.current = true
    setFocusedIdx(idx)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered])

  // Reset focus to first item when sort changes (skip on first render and back-navigation)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (backRestoring.current) { backRestoring.current = false; return }
    setFocusedIdx(0)
  }, [sort])

  // Scroll focused pill into view (suppressed during back-navigation restoration)
  useEffect(() => {
    if (suppressScroll.current) return
    const concept = filtered[focusedIdx]
    if (!concept) return
    const el = document.getElementById(`idx-${concept.id}`)
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [focusedIdx, filtered])

  // Keyboard navigation
  const stateRef = useRef({})
  stateRef.current = { filtered, focusedIdx, filters, sort }
  const lastNavTime = useRef(0)

  useEffect(() => {
    function onKey(e) {
      if (isEditableTarget(e)) return
      const { filtered, focusedIdx, filters, sort } = stateRef.current
      if (!filtered.length) return

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const now = Date.now()
        if (e.repeat && now - lastNavTime.current < 180) return
        lastNavTime.current = now
        setFocusedIdx(i => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const now = Date.now()
        if (e.repeat && now - lastNavTime.current < 180) return
        lastNavTime.current = now
        setFocusedIdx(i => Math.max(i - 1, 0))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const now = Date.now()
        if (e.repeat && now - lastNavTime.current < 180) return
        lastNavTime.current = now
        const next = getVisualNavIndex('down', focusedIdx, filtered)
        setFocusedIdx(next)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const now = Date.now()
        if (e.repeat && now - lastNavTime.current < 180) return
        lastNavTime.current = now
        const next = getVisualNavIndex('up', focusedIdx, filtered)
        setFocusedIdx(next)
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
      } else if (e.key === ' ') {
        // Space toggles the MVK panel
        e.preventDefault()
        setPanelOpen(p => !p)
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

  function saveNavState(id) {
    sessionStorage.setItem(STATE_KEY, JSON.stringify({ filters, sort }))
    const el = getMain()
    if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop))
    sessionStorage.setItem(LAST_ID_KEY, id)
  }

  function handlePillClick(e, c, globalIdx) {
    if (focusedIdx === globalIdx) {
      // Already focused → navigate to concept view
      saveNavState(c.id)
      navigate(`/app/concepts/${c.id}`)
    } else {
      // Not focused → just focus, no navigation
      e.preventDefault()
      setFocusedIdx(globalIdx)
    }
  }

  const groups = groupByLetter(filtered)

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 pb-44">
      <div className="flex items-baseline justify-between mb-4">
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

      <ShortcutsHintBar items={[
        { keyLabel: '← → ↑ ↓', actionLabel: 'Navigate' },
        { keyLabel: 'Space', actionLabel: 'MVK' },
        { keyLabel: 'Enter', actionLabel: 'Open' },
        { keyLabel: '⌫', actionLabel: 'Back' },
        { keyLabel: '+ / −', actionLabel: 'Review Count' },
      ]} />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          {concepts.length === 0 ? 'No concepts yet. Create your first concept to get started.' : 'No concepts match the current filters.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-x-1 gap-y-0">
          {groups.map(({ letter, items }, groupIdx) => (
            <Fragment key={letter}>
              {/* Letter anchor — spans full grid width */}
              <div
                className={`col-span-full flex items-center gap-3 ${groupIdx === 0 ? 'mb-1' : 'mt-7 mb-1'}`}
              >
                <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase w-4 text-center flex-shrink-0">
                  {letter}
                </span>
                <div className="flex-1 border-t border-gray-100" />
              </div>

              {/* Concept entries */}
              {items.map(({ concept: c, globalIdx }) => {
                const isFocused = globalIdx === focusedIdx
                return (
                  <div
                    key={c.id}
                    id={`idx-${c.id}`}
                    onClick={e => handlePillClick(e, c, globalIdx)}
                    className={`group flex items-baseline gap-1.5 px-2 py-[5px] rounded select-none transition-colors ${
                      isFocused
                        ? 'bg-blue-50 cursor-pointer'
                        : 'hover:bg-blue-50 cursor-default'
                    }`}
                  >
                    {c.pinned && (
                      <PinIcon size={8} className={`flex-shrink-0 self-center -mt-px ${isFocused ? 'text-amber-400' : 'text-amber-300'}`} />
                    )}
                    <span className={`text-sm leading-snug truncate min-w-0 transition-colors ${
                      isFocused ? 'text-blue-700 font-medium' : 'text-gray-700'
                    }`}>
                      {c.name}
                    </span>
                    {(c.reviewCount !== undefined && c.reviewCount !== null) && (
                      <span className={`text-[10px] tabular-nums flex-shrink-0 leading-none ml-2 transition-colors ${
                        isFocused ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {c.reviewCount}
                      </span>
                    )}
                  </div>
                )
              })}
            </Fragment>
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
