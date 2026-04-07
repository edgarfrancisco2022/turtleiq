import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useApp } from '../context/AppContext'
import MarkdownEditor, { MVK_EXAMPLE_HINT, MVK_PLACEHOLDER, MVK_EDIT_PLACEHOLDER } from '../components/MarkdownEditor'
import ImageSection from '../components/ImageSection'
import { StateSelector, PriorityBadge, ReviewCounter, PinButton } from '../components/StatusBadge'
import ShortcutsHintBar from '../components/ShortcutsHintBar'

const getMain = () => document.getElementById('main-content')

export default function ConceptView() {
  const { conceptId } = useParams()
  const navigate = useNavigate()
  const { openEditForm } = useApp()

  const concept          = useStore(s => s.concepts.find(c => c.id === conceptId))
  const subjects         = useStore(s => s.subjects)
  const topics           = useStore(s => s.topics)
  const tags             = useStore(s => s.tags)
  const updateConceptField = useStore(s => s.updateConceptField)
  const incrementReview  = useStore(s => s.incrementReview)
  const decrementReview  = useStore(s => s.decrementReview)

  // Always scroll to top when navigating to a concept
  useEffect(() => {
    const el = getMain()
    if (el) el.scrollTop = 0
  }, [conceptId])

  // Keyboard shortcuts: Backspace = back, +/- = review counter
  useEffect(() => {
    function onKey(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.contentEditable === 'true') return
      if (e.key === 'Backspace') {
        e.preventDefault()
        sessionStorage.setItem('cv-back', '1')
        navigate(-1)
      } else if (e.key === '+' || e.key === '=') {
        useStore.getState().incrementReview(conceptId)
      } else if (e.key === '-') {
        useStore.getState().decrementReview(conceptId)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [conceptId, navigate])

  if (!concept) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Concept not found.</p>
      </div>
    )
  }

  const conceptSubjects = subjects.filter(s => concept.subjectIds.includes(s.id))
  const conceptTopics   = topics.filter(t => concept.topicIds.includes(t.id))
  const conceptTags     = tags.filter(t => concept.tagIds.includes(t.id))

  function handleBack() {
    sessionStorage.setItem('cv-back', '1')
    navigate(-1)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
          Back
        </button>
        <button
          onClick={() => openEditForm(concept)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors"
        >
          <span>✎</span> Edit
        </button>
      </div>

      <h1 className="font-inter text-3xl font-bold text-gray-900 mb-6 tracking-tight">{concept.name}</h1>

      {/* Metadata */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-3">
        <div className="space-y-2 mb-4">
          {conceptSubjects.length > 0 && (
            <MetaRow label="Subjects">
              {conceptSubjects.map(s => (
                <Chip key={s.id} cls="bg-blue-100 text-blue-700">{s.name}</Chip>
              ))}
            </MetaRow>
          )}
          <MetaRow label="Topics">
            {conceptTopics.length > 0
              ? conceptTopics.map(t => (
                  <Chip key={t.id} cls="bg-blue-50 text-blue-700">{t.name}</Chip>
                ))
              : <span className="text-xs text-gray-300 italic">None</span>
            }
          </MetaRow>
          <MetaRow label="Tags">
            {conceptTags.length > 0
              ? conceptTags.map(t => (
                  <Chip key={t.id} cls="bg-gray-200 text-gray-600">#{t.name}</Chip>
                ))
              : <span className="text-xs text-gray-300 italic">None</span>
            }
          </MetaRow>
        </div>

        <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">State</span>
            <StateSelector
              value={concept.state}
              onChange={v => updateConceptField(conceptId, 'state', v)}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Priority</span>
            <PriorityBadge
              value={concept.priority}
              onChange={v => updateConceptField(conceptId, 'priority', v)}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Reviews</span>
            <ReviewCounter
              count={concept.reviewCount}
              onIncrement={() => incrementReview(conceptId)}
              onDecrement={() => decrementReview(conceptId)}
            />
          </div>
          <PinButton
            pinned={concept.pinned}
            onToggle={() => updateConceptField(conceptId, 'pinned', !concept.pinned)}
          />
        </div>
      </div>

      <ShortcutsHintBar items={[
        { keyLabel: '⌫', actionLabel: 'Back' },
        { keyLabel: '+ / −', actionLabel: 'Review Count' },
      ]} className="mb-8" />

      {/* Content sections */}
      <section className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">MVK — Minimum Viable Knowledge</h2>
        <MarkdownEditor
          conceptId={conceptId}
          field="mvkNotes"
          content={concept.mvkNotes ?? ''}
          placeholder={MVK_PLACEHOLDER}
          hint={MVK_EXAMPLE_HINT}
          editPlaceholder={MVK_EDIT_PLACEHOLDER}
        />
      </section>

      <Section title="Notes">
        <MarkdownEditor
          conceptId={conceptId}
          field="markdownNotes"
          content={concept.markdownNotes ?? ''}
          placeholder="Add meaningful notes, interesting intuitions, or hard-won insights you may want to revisit later..."
        />
      </Section>

      <Section title="Images">
        <ImageSection conceptId={conceptId} images={concept.images ?? []} />
      </Section>

      <Section title="References">
        <MarkdownEditor
          conceptId={conceptId}
          field="referencesMarkdown"
          content={concept.referencesMarkdown ?? ''}
          placeholder="Add URLs, book references, page numbers, or any source material..."
        />
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </section>
  )
}

function MetaRow({ label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-14 pt-0.5 flex-shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({ children, cls }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{children}</span>
}
