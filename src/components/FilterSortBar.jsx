import { useState, useRef, useEffect } from 'react'
import { SORT_LABELS } from '../hooks/useFilterSort'

const STATES = ['NEW', 'LEARNING', 'REVIEWING', 'MEMORIZING', 'STORED']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

const STATE_DOT = {
  NEW:        'bg-gray-400',
  LEARNING:   'bg-blue-400',
  REVIEWING:  'bg-yellow-400',
  MEMORIZING: 'bg-orange-400',
  STORED:     'bg-green-400',
}
const PRIORITY_DOT = {
  LOW:    'bg-gray-300',
  MEDIUM: 'bg-blue-400',
  HIGH:   'bg-red-400',
}

function Checkmark() {
  return (
    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDown({ open }) {
  return (
    <svg
      className={`w-3 h-3 opacity-40 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"
    >
      <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MultiSelectFilter({ label, options, selected, onToggle, onClear }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const listId = useRef(`msf-${label.toLowerCase()}-list`).current

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isActive = selected.length > 0
  const btnLabel = isActive ? `${label} · ${selected.length}` : label

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={isActive ? `Filter by ${label}, ${selected.length} selected` : `Filter by ${label}`}
        className={`text-xs border rounded-md px-2.5 py-1 cursor-pointer flex items-center gap-1.5 transition-all select-none focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
          isActive
            ? 'border-indigo-300 text-indigo-700 bg-indigo-50 font-medium'
            : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300 hover:bg-gray-50/80'
        }`}
      >
        {btnLabel}
        <ChevronDown open={open} />
      </button>

      {open && (
        <div id={listId} role="listbox" aria-label={`${label} options`} aria-multiselectable="true" className="absolute top-full left-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 min-w-[152px] overflow-hidden">
          {/* All */}
          <button
            onClick={onClear}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left transition-colors ${
              !isActive ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
              !isActive ? 'border-indigo-400 bg-indigo-500' : 'border-gray-300'
            }`}>
              {!isActive && <Checkmark />}
            </span>
            All
          </button>

          <div className="h-px bg-gray-100 my-1 mx-2" />

          {options.map(opt => {
            const checked = selected.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => onToggle(opt.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left transition-colors ${
                  checked ? 'text-indigo-700 bg-indigo-50/60' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                  checked ? 'border-indigo-400 bg-indigo-500' : 'border-gray-300'
                }`}>
                  {checked && <Checkmark />}
                </span>
                {opt.dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />}
                <span className="truncate">{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const SEL = 'text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer'

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

  function toggle(key, value) {
    const cur = filters[key] || []
    setFilter(key, cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value])
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center py-2.5 border-b border-gray-100 mb-4">
      {/* Sort */}
      <label htmlFor="filter-sort-select" className="text-xs text-gray-400 font-medium mr-0.5">Sort</label>
      <select
        id="filter-sort-select"
        value={sort}
        onChange={e => setSort(e.target.value)}
        aria-label="Sort concepts"
        className={SEL}
      >
        {availableSorts.map(s => (
          <option key={s} value={s}>{sortLabels[s] || s}</option>
        ))}
      </select>

      <span className="w-px h-3.5 bg-gray-200 mx-1" />

      {/* Subject filter */}
      {availableFilters.includes('subject') && ss.length > 0 && (
        <MultiSelectFilter
          label="Subjects"
          options={ss.map(s => ({ value: s.id, label: s.name }))}
          selected={filters.subjects || []}
          onToggle={v => toggle('subjects', v)}
          onClear={() => setFilter('subjects', [])}
        />
      )}

      {/* Topic filter */}
      {availableFilters.includes('topic') && st.length > 0 && (
        <MultiSelectFilter
          label="Topics"
          options={st.map(t => ({ value: t.id, label: t.name }))}
          selected={filters.topics || []}
          onToggle={v => toggle('topics', v)}
          onClear={() => setFilter('topics', [])}
        />
      )}

      {/* Tag filter */}
      {availableFilters.includes('tag') && sg.length > 0 && (
        <MultiSelectFilter
          label="Tags"
          options={sg.map(t => ({ value: t.id, label: `#${t.name}` }))}
          selected={filters.tags || []}
          onToggle={v => toggle('tags', v)}
          onClear={() => setFilter('tags', [])}
        />
      )}

      {/* State filter */}
      {availableFilters.includes('state') && (
        <MultiSelectFilter
          label="States"
          options={STATES.map(s => ({ value: s, label: s, dot: STATE_DOT[s] }))}
          selected={filters.states || []}
          onToggle={v => toggle('states', v)}
          onClear={() => setFilter('states', [])}
        />
      )}

      {/* Priority filter */}
      {availableFilters.includes('priority') && (
        <MultiSelectFilter
          label="Priorities"
          options={PRIORITIES.map(p => ({ value: p, label: p, dot: PRIORITY_DOT[p] }))}
          selected={filters.priorities || []}
          onToggle={v => toggle('priorities', v)}
          onClear={() => setFilter('priorities', [])}
        />
      )}

      {/* Pinned filter */}
      {availableFilters.includes('pinned') && (
        <button
          onClick={() => setFilter('pinned', !filters.pinned)}
          aria-pressed={!!filters.pinned}
          aria-label={filters.pinned ? 'Show all concepts (pinned filter active)' : 'Show only pinned concepts'}
          className={`text-xs px-2.5 py-1 rounded-md border transition-all select-none focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            filters.pinned
              ? 'border-amber-300 bg-amber-50 text-amber-600 font-medium'
              : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50/80'
          }`}
        >
          <span aria-hidden="true">★</span> Pinned
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
        <span className="ml-auto text-xs text-gray-400" aria-live="polite" aria-atomic="true">{resultCount} concept{resultCount !== 1 ? 's' : ''}</span>
      )}
    </div>
  )
}
