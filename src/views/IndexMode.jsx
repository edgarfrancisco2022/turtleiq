import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useFilterSort } from '../hooks/useFilterSort'
import FilterSortBar from '../components/FilterSortBar'
import { ReviewCounter } from '../components/StatusBadge'

const SCROLL_KEY = 'scroll-index'
const LAST_ID_KEY = 'index-last-id'
const getMain = () => document.getElementById('main-content')

export default function IndexMode() {
  const concepts = useStore(s => s.concepts)
  const incrementReview = useStore(s => s.incrementReview)
  const { filtered, filters, sort, setFilter, setSort, clearFilters, hasActiveFilters, subjects, topics, tags } =
    useFilterSort(concepts)

  // Restore scroll only when navigating back from ConceptView
  useEffect(() => {
    const lastId = sessionStorage.getItem(LAST_ID_KEY)

    if (sessionStorage.getItem('cv-back')) {
      sessionStorage.removeItem('cv-back')
      const savedScroll = sessionStorage.getItem(SCROLL_KEY)
      if (savedScroll) {
        const el = getMain()
        if (el) {
          el.scrollTop = parseInt(savedScroll, 10)
          sessionStorage.removeItem(SCROLL_KEY)
        }
      }
    }

    // Briefly highlight the last-visited concept
    if (lastId) {
      sessionStorage.removeItem(LAST_ID_KEY)
      setTimeout(() => {
        const el = document.getElementById(`idx-${lastId}`)
        if (el) {
          el.classList.add('bg-indigo-50')
          setTimeout(() => el.classList.remove('bg-indigo-50'), 1200)
        }
      }, 100)
    }
  }, [])

  function handleConceptClick(id) {
    const el = getMain()
    if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop))
    sessionStorage.setItem(LAST_ID_KEY, id)
  }

  // Group alphabetically when sort is alpha/alpha_desc
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
              {group.map(c => (
                <div
                  key={c.id}
                  id={`idx-${c.id}`}
                  className="flex items-center group py-1 border-b border-gray-50 last:border-0 transition-colors rounded"
                >
                  <Link
                    to={`/concepts/${c.id}`}
                    onClick={() => handleConceptClick(c.id)}
                    className="flex-1 text-sm text-gray-800 hover:text-indigo-700 transition-colors py-0.5 pl-1"
                  >
                    {c.pinned && <span className="text-amber-400 mr-1.5 text-[11px]">★</span>}
                    {c.name}
                  </Link>
                  <ReviewCounter count={c.reviewCount} onIncrement={() => incrementReview(c.id)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
