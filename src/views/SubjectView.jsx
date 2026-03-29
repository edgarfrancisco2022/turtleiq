import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import FilterSortBar from '../components/FilterSortBar'
import { StateSelector, PriorityBadge, ReviewCounter, PinButton } from '../components/StatusBadge'
import { InlineEditor } from '../components/MarkdownEditor'

const SUBJECT_SORT_LABELS = { alpha: 'A → Z', date: 'Date added', custom: 'Custom' }
const SCROLL_KEY = sid => `scroll-subject-${sid}`
const getMain = () => document.getElementById('main-content')

export default function SubjectView() {
  const { subjectId } = useParams()

  const subject          = useStore(s => s.subjects.find(x => x.id === subjectId))
  const allConcepts      = useStore(s => s.concepts)
  const topics           = useStore(s => s.topics)
  const tags             = useStore(s => s.tags)
  const subjectOrders    = useStore(s => s.subjectOrders)
  const sortMode         = useStore(s => s.subjectSortModes[subjectId] ?? 'alpha')
  const setSubjectSortMode    = useStore(s => s.setSubjectSortMode)
  const moveConceptInSubject  = useStore(s => s.moveConceptInSubject)
  const deleteConcept         = useStore(s => s.deleteConcept)
  const updateConceptField    = useStore(s => s.updateConceptField)
  const incrementReview       = useStore(s => s.incrementReview)

  const [filters, setFiltersState] = useState({
    topic: '', tag: '', state: '', priority: '', pinned: false,
  })

  function setFilter(key, value) { setFiltersState(f => ({ ...f, [key]: value })) }
  function clearFilters() { setFiltersState({ topic: '', tag: '', state: '', priority: '', pinned: false }) }
  const hasActiveFilters = Boolean(filters.topic || filters.tag || filters.state || filters.priority || filters.pinned)

  // Restore scroll only when navigating back from ConceptView
  useEffect(() => {
    if (!sessionStorage.getItem('cv-back')) return
    sessionStorage.removeItem('cv-back')
    const saved = sessionStorage.getItem(SCROLL_KEY(subjectId))
    if (!saved) return
    const el = getMain()
    if (el) {
      el.scrollTop = parseInt(saved, 10)
      sessionStorage.removeItem(SCROLL_KEY(subjectId))
    }
  }, [subjectId])

  const subjectConcepts = allConcepts.filter(c => c.subjectIds.includes(subjectId))

  const displayed = useMemo(() => {
    const filtered = subjectConcepts.filter(c => {
      if (filters.topic    && !c.topicIds.includes(filters.topic))        return false
      if (filters.tag      && !c.tagIds.includes(filters.tag))            return false
      if (filters.state    && (c.state ?? 'NEW') !== filters.state)       return false
      if (filters.priority && (c.priority ?? 'MEDIUM') !== filters.priority) return false
      if (filters.pinned   && !c.pinned)                                  return false
      return true
    })

    if (sortMode === 'alpha') return [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    if (sortMode === 'date')  return [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    if (sortMode === 'custom') {
      const order = subjectOrders[subjectId] || []
      return [...filtered].sort((a, b) => {
        const ia = order.indexOf(a.id), ib = order.indexOf(b.id)
        if (ia === -1 && ib === -1) return new Date(a.createdAt) - new Date(b.createdAt)
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      })
    }
    return filtered
  }, [subjectConcepts, filters, sortMode, subjectOrders, subjectId])

  if (!subject) {
    return <div className="flex items-center justify-center h-full"><p className="text-gray-400">Subject not found.</p></div>
  }

  function handleDelete(e, concept) {
    e.preventDefault()
    if (window.confirm(`Delete "${concept.name}"?`)) deleteConcept(concept.id)
  }

  function saveScroll() {
    const el = getMain()
    if (el) sessionStorage.setItem(SCROLL_KEY(subjectId), String(el.scrollTop))
  }

  // Only show up/down arrows for concepts that appear in the filtered list
  function canMoveUp(conceptId) {
    if (sortMode !== 'custom' || hasActiveFilters) return false
    const order = subjectOrders[subjectId] || []
    const idx = order.indexOf(conceptId)
    return idx > 0
  }
  function canMoveDown(conceptId) {
    if (sortMode !== 'custom' || hasActiveFilters) return false
    const order = subjectOrders[subjectId] || []
    const idx = order.indexOf(conceptId)
    return idx >= 0 && idx < order.length - 1
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">{subject.name}</h1>
      <p className="text-sm text-gray-400 mb-6">
        {subjectConcepts.length} concept{subjectConcepts.length !== 1 ? 's' : ''}
      </p>

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
        <div className="space-y-2">
          {displayed.map(concept => (
            <ConceptRow
              key={concept.id}
              concept={concept}
              isCustom={sortMode === 'custom' && !hasActiveFilters}
              canUp={canMoveUp(concept.id)}
              canDown={canMoveDown(concept.id)}
              onMoveUp={e => { e.preventDefault(); moveConceptInSubject(subjectId, concept.id, 'up') }}
              onMoveDown={e => { e.preventDefault(); moveConceptInSubject(subjectId, concept.id, 'down') }}
              onDelete={e => handleDelete(e, concept)}
              onSaveScroll={saveScroll}
              onUpdateField={(f, v) => updateConceptField(concept.id, f, v)}
              onIncrementReview={() => incrementReview(concept.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ConceptRow({ concept, isCustom, canUp, canDown, onMoveUp, onMoveDown, onDelete, onSaveScroll, onUpdateField, onIncrementReview }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Custom sort arrows */}
        {isCustom && (
          <div className="flex flex-col gap-0 flex-shrink-0">
            <button
              onClick={onMoveUp}
              disabled={!canUp}
              className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-tight text-xs px-0.5"
              title="Move up"
            >↑</button>
            <button
              onClick={onMoveDown}
              disabled={!canDown}
              className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-tight text-xs px-0.5"
              title="Move down"
            >↓</button>
          </div>
        )}

        {/* Concept name */}
        <Link
          to={`/concepts/${concept.id}`}
          onClick={onSaveScroll}
          className="flex-1 font-medium text-gray-900 hover:text-indigo-700 transition-colors truncate min-w-0"
        >
          {concept.pinned && <span className="text-amber-400 mr-1.5 text-xs">★</span>}
          {concept.name}
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <StateSelector value={concept.state} onChange={v => onUpdateField('state', v)} />
          <PriorityBadge value={concept.priority} onChange={v => onUpdateField('priority', v)} />
          <ReviewCounter count={concept.reviewCount} onIncrement={onIncrementReview} />
          <PinButton pinned={concept.pinned} onToggle={() => onUpdateField('pinned', !concept.pinned)} />
          <button
            onClick={e => { e.preventDefault(); setExpanded(x => !x) }}
            className="text-gray-400 hover:text-gray-700 text-xs w-5 text-center transition-colors"
            title={expanded ? 'Collapse' : 'Expand MVK'}
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-500 transition-colors text-sm leading-none"
            title="Delete concept"
          >✕</button>
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
