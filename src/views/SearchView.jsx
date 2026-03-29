import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useFilterSort } from '../hooks/useFilterSort'
import FilterSortBar from '../components/FilterSortBar'
import { STATE_STYLES, PRIORITY_STYLES } from '../components/StatusBadge'

export default function SearchView() {
  const concepts = useStore(s => s.concepts)
  const { filtered, filters, sort, setFilter, setSort, clearFilters, hasActiveFilters, subjects, topics, tags } =
    useFilterSort(concepts)

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search</h1>

      {/* Name search — wired as a special text filter */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="7.5" r="5" />
            <line x1="11.5" y1="11.5" x2="16" y2="16" />
          </svg>
        </span>
        <input
          type="text"
          value={filters._nameQuery || ''}
          onChange={e => setFilter('_nameQuery', e.target.value)}
          placeholder="Search concept names..."
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          autoFocus
        />
      </div>

      <FilterSortBar
        filters={filters} sort={sort}
        setFilter={setFilter} setSort={setSort}
        clearFilters={clearFilters} hasActiveFilters={hasActiveFilters}
        subjects={subjects} topics={topics} tags={tags}
        availableFilters={['subject', 'topic', 'tag', 'state', 'priority', 'pinned']}
        resultCount={nameFiltered(filtered, filters._nameQuery).length}
      />

      <Results concepts={nameFiltered(filtered, filters._nameQuery)} />
    </div>
  )
}

function nameFiltered(concepts, query) {
  if (!query) return concepts
  const q = query.toLowerCase()
  return concepts.filter(c => c.name.toLowerCase().includes(q))
}

function Results({ concepts }) {
  const subjects = useStore(s => s.subjects)
  const topics   = useStore(s => s.topics)
  const tags     = useStore(s => s.tags)

  if (concepts.length === 0) {
    return <p className="text-center py-12 text-gray-400 text-sm">No concepts match your search.</p>
  }

  return (
    <div className="space-y-2">
      {concepts.map(c => {
        const cSubjects  = subjects.filter(s => c.subjectIds.includes(s.id))
        const cTopics    = topics.filter(t => c.topicIds.includes(t.id))
        const cTags      = tags.filter(t => c.tagIds.includes(t.id))
        return (
          <Link
            key={c.id}
            to={`/concepts/${c.id}`}
            className="block bg-white border border-gray-100 rounded-xl px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                {c.pinned && <span className="text-amber-400 mr-1.5 text-xs">★</span>}
                {c.name}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATE_STYLES[c.state ?? 'NEW']}`}>{c.state ?? 'NEW'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLES[c.priority ?? 'MEDIUM']}`}>{c.priority ?? 'MEDIUM'}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cSubjects.map(s => <span key={s.id} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{s.name}</span>)}
              {cTopics.map(t => <span key={t.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{t.name}</span>)}
              {cTags.map(t => <span key={t.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#{t.name}</span>)}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
