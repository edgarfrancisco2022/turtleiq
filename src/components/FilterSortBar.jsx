import { SORT_LABELS } from '../hooks/useFilterSort'

const STATES = ['NEW', 'LEARNING', 'REVIEWING', 'MEMORIZING', 'STORED']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

const SEL = 'text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer'
const SEL_ACTIVE = 'border-indigo-300 text-indigo-700 bg-indigo-50'

export default function FilterSortBar({
  filters,
  sort,
  setFilter,
  setSort,
  clearFilters,
  hasActiveFilters,
  subjects = [],
  topics = [],
  tags = [],
  availableSorts = Object.keys(SORT_LABELS),
  availableFilters = ['subject', 'topic', 'tag', 'state', 'priority', 'pinned'],
  sortLabels = SORT_LABELS,
  resultCount,
}) {
  const ss = [...subjects].sort((a, b) => a.name.localeCompare(b.name))
  const st = [...topics].sort((a, b) => a.name.localeCompare(b.name))
  const sg = [...tags].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="flex flex-wrap gap-1.5 items-center py-2.5 border-b border-gray-100 mb-4">
      {/* Sort */}
      <span className="text-xs text-gray-400 font-medium mr-0.5">Sort</span>
      <select
        value={sort}
        onChange={e => setSort(e.target.value)}
        className={SEL}
      >
        {availableSorts.map(s => (
          <option key={s} value={s}>{sortLabels[s] || s}</option>
        ))}
      </select>

      <span className="w-px h-3.5 bg-gray-200 mx-1" />

      {/* Subject filter */}
      {availableFilters.includes('subject') && ss.length > 0 && (
        <select
          value={filters.subject || ''}
          onChange={e => setFilter('subject', e.target.value)}
          className={`${SEL} ${filters.subject ? SEL_ACTIVE : ''}`}
        >
          <option value="">All Subjects</option>
          {ss.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      )}

      {/* Topic filter */}
      {availableFilters.includes('topic') && st.length > 0 && (
        <select
          value={filters.topic || ''}
          onChange={e => setFilter('topic', e.target.value)}
          className={`${SEL} ${filters.topic ? SEL_ACTIVE : ''}`}
        >
          <option value="">All Topics</option>
          {st.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      )}

      {/* Tag filter */}
      {availableFilters.includes('tag') && sg.length > 0 && (
        <select
          value={filters.tag || ''}
          onChange={e => setFilter('tag', e.target.value)}
          className={`${SEL} ${filters.tag ? SEL_ACTIVE : ''}`}
        >
          <option value="">All Tags</option>
          {sg.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      )}

      {/* State filter */}
      {availableFilters.includes('state') && (
        <select
          value={filters.state || ''}
          onChange={e => setFilter('state', e.target.value)}
          className={`${SEL} ${filters.state ? SEL_ACTIVE : ''}`}
        >
          <option value="">All States</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      )}

      {/* Priority filter */}
      {availableFilters.includes('priority') && (
        <select
          value={filters.priority || ''}
          onChange={e => setFilter('priority', e.target.value)}
          className={`${SEL} ${filters.priority ? SEL_ACTIVE : ''}`}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      )}

      {/* Pinned filter */}
      {availableFilters.includes('pinned') && (
        <button
          onClick={() => setFilter('pinned', !filters.pinned)}
          className={`text-xs px-2 py-1 rounded-md border transition-colors ${
            filters.pinned
              ? 'border-amber-300 bg-amber-50 text-amber-600'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          ★ Pinned
        </button>
      )}

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-gray-400 hover:text-gray-700 ml-1 underline"
        >
          Clear
        </button>
      )}

      {resultCount !== undefined && (
        <span className="ml-auto text-xs text-gray-400">{resultCount} concept{resultCount !== 1 ? 's' : ''}</span>
      )}
    </div>
  )
}
