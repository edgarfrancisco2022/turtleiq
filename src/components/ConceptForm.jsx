import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import CreatableMultiSelect from './CreatableMultiSelect'

/**
 * Handles both Add (concept=null) and Edit (concept=existing) modes.
 * Pre-population of IDs→names is done by the caller (App.jsx).
 */
export default function ConceptForm({ onClose, onDone, concept = null }) {
  const isEdit = Boolean(concept)

  const subjects  = useStore(s => s.subjects)
  const topics    = useStore(s => s.topics)
  const tags      = useStore(s => s.tags)
  const addConcept    = useStore(s => s.addConcept)
  const updateConcept = useStore(s => s.updateConcept)

  // Convert IDs → names for pre-population in edit mode
  const initSubjects = isEdit ? subjects.filter(s => concept.subjectIds.includes(s.id)).map(s => s.name) : []
  const initTopics   = isEdit ? topics.filter(t => concept.topicIds.includes(t.id)).map(t => t.name) : []
  const initTags     = isEdit ? tags.filter(t => concept.tagIds.includes(t.id)).map(t => t.name) : []

  const [name, setName]         = useState(isEdit ? concept.name : '')
  const [selSubjects, setSelSubjects] = useState(initSubjects)
  const [selTopics,   setSelTopics]   = useState(initTopics)
  const [selTags,     setSelTags]     = useState(initTags)
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Concept name is required.'); return }
    if (selSubjects.length === 0) { setError('At least one subject is required.'); return }

    if (isEdit) {
      updateConcept(concept.id, { name, subjects: selSubjects, topics: selTopics, tags: selTags })
      onDone(concept.id)
    } else {
      const id = addConcept({ name, subjects: selSubjects, topics: selTopics, tags: selTags })
      onDone(id)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header — never scrolls */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
            {isEdit ? 'Edit Concept' : 'New Concept'}
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* Body — only scrolls on very small viewports; dropdowns escape via portal */}
        <div className="px-5 py-4 overflow-y-auto overscroll-none">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Concept Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Photosynthesis"
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white transition-colors hover:border-gray-400 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <CreatableMultiSelect
              label="Subject" required
              options={subjects.map(s => s.name)}
              selected={selSubjects}
              onChange={setSelSubjects}
              placeholder="Select or create subject..."
            />

            <CreatableMultiSelect
              label="Topic"
              options={topics.map(t => t.name)}
              selected={selTopics}
              onChange={setSelTopics}
              placeholder="Select or create topic..."
            />

            <CreatableMultiSelect
              label="Tags"
              options={tags.map(t => t.name)}
              selected={selTags}
              onChange={setSelTags}
              placeholder="Select or create tag..."
            />

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button" onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 rounded-md py-1.5 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white rounded-md py-1.5 text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {isEdit ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
