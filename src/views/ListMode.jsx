import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useFilterSort } from '../hooks/useFilterSort'
import FilterSortBar from '../components/FilterSortBar'
import { StateSelector, PriorityBadge, ReviewCounter, PinButton } from '../components/StatusBadge'
import { InlineEditor } from '../components/MarkdownEditor'

const SCROLL_KEY = 'scroll-list'
const getMain = () => document.getElementById('main-content')

export default function ListMode() {
  const concepts = useStore(s => s.concepts)
  const { filtered, filters, sort, setFilter, setSort, clearFilters, hasActiveFilters, subjects, topics, tags } =
    useFilterSort(concepts)

  // Restore scroll only when navigating back from ConceptView
  useEffect(() => {
    if (!sessionStorage.getItem('cv-back')) return
    sessionStorage.removeItem('cv-back')
    const saved = sessionStorage.getItem(SCROLL_KEY)
    if (!saved) return
    const el = getMain()
    if (el) {
      el.scrollTop = parseInt(saved, 10)
      sessionStorage.removeItem(SCROLL_KEY)
    }
  }, [])

  function saveScroll() {
    const el = getMain()
    if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop))
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Library</h1>
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
        <div className="text-center py-16 text-gray-400 text-sm">
          {concepts.length === 0 ? 'No concepts yet. Create your first concept to get started.' : 'No concepts match the current filters.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(concept => (
            <ListConceptRow key={concept.id} concept={concept} onSaveScroll={saveScroll} />
          ))}
        </div>
      )}
    </div>
  )
}

function ListConceptRow({ concept, onSaveScroll }) {
  const [expanded, setExpanded] = useState(false)
  const updateConceptField = useStore(s => s.updateConceptField)
  const incrementReview    = useStore(s => s.incrementReview)
  const subjects = useStore(s => s.subjects)

  const conceptSubjects = subjects.filter(s => concept.subjectIds.includes(s.id))

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <Link
            to={`/concepts/${concept.id}`}
            onClick={onSaveScroll}
            className="font-medium text-gray-900 hover:text-indigo-700 transition-colors"
          >
            {concept.pinned && <span className="text-amber-400 mr-1.5 text-xs">★</span>}
            {concept.name}
          </Link>
          {conceptSubjects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {conceptSubjects.map(s => (
                <span key={s.id} className="text-xs bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full">{s.name}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <StateSelector value={concept.state} onChange={v => updateConceptField(concept.id, 'state', v)} />
          <PriorityBadge value={concept.priority} onChange={v => updateConceptField(concept.id, 'priority', v)} />
          <ReviewCounter count={concept.reviewCount} onIncrement={() => incrementReview(concept.id)} />
          <PinButton pinned={concept.pinned} onToggle={() => updateConceptField(concept.id, 'pinned', !concept.pinned)} />
          <button
            onClick={() => setExpanded(x => !x)}
            className="text-gray-400 hover:text-gray-700 text-xs w-5 text-center transition-colors"
            title={expanded ? 'Collapse' : 'Expand MVK'}
          >
            {expanded ? '▲' : '▼'}
          </button>
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
