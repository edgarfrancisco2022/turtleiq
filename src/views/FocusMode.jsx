import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useFilterSort } from '../hooks/useFilterSort'
import FilterSortBar from '../components/FilterSortBar'
import ShortcutsHintBar from '../components/ShortcutsHintBar'
import { StateSelector, PriorityBadge, ReviewCounter, PinButton, PinIcon } from '../components/StatusBadge'
import MarkdownEditor, { MVK_EXAMPLE_HINT, MVK_PLACEHOLDER, MVK_EDIT_PLACEHOLDER } from '../components/MarkdownEditor'
// DISABLED: Pro Plan feature — image hosting (re-enable when Pro Plan is active)
// import ImageSection from '../components/ImageSection'

function isEditableTarget(e) {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
    e.target.contentEditable === 'true'
}

export default function FocusMode() {
  const concepts = useStore(s => s.concepts)
  const allSubjects = useStore(s => s.subjects)
  const { filtered, filters, sort, setFilter, setSort, clearFilters, hasActiveFilters, subjects, topics, tags } =
    useFilterSort(concepts)

  const [searchParams, setSearchParams] = useSearchParams()
  // Only one section active at a time: null | 'mvk' | 'notes' | 'references'
  const [activeSection, setActiveSection] = useState(null)

  const currentId = searchParams.get('id')
  const currentIndex = useMemo(() => {
    if (!currentId) return 0
    const idx = filtered.findIndex(c => c.id === currentId)
    return idx >= 0 ? idx : 0
  }, [filtered, currentId])

  const concept = filtered[currentIndex] || null
  const conceptSubjects = concept ? allSubjects.filter(s => concept.subjectIds.includes(s.id)) : []

  function goTo(idx) {
    const c = filtered[idx]
    if (!c) return
    setActiveSection(null)
    setSearchParams({ id: c.id }, { replace: true })
  }

  function toggleSection(section) {
    setActiveSection(prev => prev === section ? null : section)
  }

  const updateConceptField = useStore(s => s.updateConceptField)
  const incrementReview    = useStore(s => s.incrementReview)
  const decrementReview    = useStore(s => s.decrementReview)

  // Keyboard navigation: ←/→ for prev/next, +/- for review counter
  const navigate = useNavigate()
  const stateRef = useRef({})
  stateRef.current = { filtered, currentIndex }

  useEffect(() => {
    function onKey(e) {
      if (isEditableTarget(e)) return
      const { filtered, currentIndex } = stateRef.current
      if (!filtered.length) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentIndex > 0) goTo(currentIndex - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (currentIndex < filtered.length - 1) goTo(currentIndex + 1)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const c = filtered[currentIndex]
        if (c) navigate(`/app/concepts/${c.id}`)
      } else if (e.key === '+' || e.key === '=') {
        const c = filtered[currentIndex]
        if (c) useStore.getState().incrementReview(c.id)
      } else if (e.key === '-') {
        const c = filtered[currentIndex]
        if (c) useStore.getState().decrementReview(c.id)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Focus</h1>
        <span className="text-sm text-gray-400">{filtered.length} total</span>
      </div>

      <FilterSortBar
        filters={filters} sort={sort}
        setFilter={setFilter} setSort={setSort}
        clearFilters={clearFilters} hasActiveFilters={hasActiveFilters}
        subjects={subjects} topics={topics} tags={tags}
        resultCount={filtered.length}
      />

      <ShortcutsHintBar items={[
        { keyLabel: '← →', actionLabel: 'Navigate' },
        { keyLabel: 'Enter', actionLabel: 'Open' },
        { keyLabel: '⌫', actionLabel: 'Back' },
        { keyLabel: '+ / −', actionLabel: 'Review Count' },
      ]} />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          {concepts.length === 0 ? 'No concepts yet. Create your first concept to get started.' : 'No concepts match the current filters.'}
        </div>
      ) : (
        <>
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-400">
              {currentIndex + 1} / {filtered.length}
            </span>
            <button
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === filtered.length - 1}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Next →
            </button>
          </div>

          {concept && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8 shadow-sm">
              {/* Concept name + link */}
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-inter flex-1 min-w-0 text-2xl font-bold text-gray-900 leading-tight tracking-tight break-words">
                  {concept.pinned && <PinIcon size={14} className="inline text-amber-400 mr-2 -mt-0.5" />}
                  {concept.name}
                </h2>
                <Link
                  to={`/app/concepts/${concept.id}`}
                  className="text-xs text-gray-400 hover:text-blue-600 ml-4 flex-shrink-0 mt-1"
                  title="Open full concept page"
                >
                  Open →
                </Link>
              </div>

              {/* Subject badges */}
              {conceptSubjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {conceptSubjects.map(s => (
                    <span key={s.id} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 pb-5 border-b border-gray-100 mb-5">
                <StateSelector value={concept.state} onChange={v => updateConceptField(concept.id, 'state', v)} />
                <PriorityBadge value={concept.priority} onChange={v => updateConceptField(concept.id, 'priority', v)} />
                <ReviewCounter count={concept.reviewCount} onIncrement={() => incrementReview(concept.id)} onDecrement={() => decrementReview(concept.id)} />
                <PinButton pinned={concept.pinned} onToggle={() => updateConceptField(concept.id, 'pinned', !concept.pinned)} />
              </div>

              {/* Reveal buttons */}
              <div className="flex flex-wrap gap-3">
                <RevealButton
                  label="Show MVK"
                  hideLabel="Hide MVK"
                  visible={activeSection === 'mvk'}
                  onToggle={() => toggleSection('mvk')}
                />
                <RevealButton
                  label="Show Notes"
                  hideLabel="Hide Notes"
                  visible={activeSection === 'notes'}
                  onToggle={() => toggleSection('notes')}
                />
                {/* DISABLED: Pro Plan feature — image hosting (re-enable when Pro Plan is active)
                <RevealButton
                  label="Show Images"
                  hideLabel="Hide Images"
                  visible={activeSection === 'images'}
                  onToggle={() => toggleSection('images')}
                />
                */}
                <RevealButton
                  label="Show References"
                  hideLabel="Hide References"
                  visible={activeSection === 'references'}
                  onToggle={() => toggleSection('references')}
                />
              </div>

              {/* MVK */}
              {activeSection === 'mvk' && (
                <RevealSection title="MVK">
                  <MarkdownEditor
                    conceptId={concept.id}
                    field="mvkNotes"
                    content={concept.mvkNotes ?? ''}
                    placeholder={MVK_PLACEHOLDER}
                    hint={MVK_EXAMPLE_HINT}
                    editPlaceholder={MVK_EDIT_PLACEHOLDER}
                  />
                </RevealSection>
              )}

              {/* Notes */}
              {activeSection === 'notes' && (
                <RevealSection title="Notes">
                  <MarkdownEditor
                    conceptId={concept.id}
                    field="markdownNotes"
                    content={concept.markdownNotes ?? ''}
                    placeholder="Add meaningful notes, interesting intuitions, or hard-won insights you may want to revisit later..."
                  />
                </RevealSection>
              )}

              {/* References */}
              {activeSection === 'references' && (
                <RevealSection title="References">
                  <MarkdownEditor
                    conceptId={concept.id}
                    field="referencesMarkdown"
                    content={concept.referencesMarkdown ?? ''}
                    placeholder="Add URLs, book references, page numbers, or any source material..."
                  />
                </RevealSection>
              )}

              {/* DISABLED: Pro Plan feature — image hosting (re-enable when Pro Plan is active)
              {activeSection === 'images' && (
                <RevealSection title="Images">
                  <ImageSection conceptId={concept.id} images={concept.images ?? []} />
                </RevealSection>
              )}
              */}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function RevealButton({ label, hideLabel, visible, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`text-sm px-4 py-1.5 rounded-lg border font-medium transition-colors ${
        visible
          ? 'bg-blue-50 border-blue-200 text-blue-700'
          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800'
      }`}
    >
      {visible ? hideLabel : label}
    </button>
  )
}

function RevealSection({ title, children }) {
  return (
    <div className="mt-5 pt-5 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</p>
      <div>{children}</div>
    </div>
  )
}
