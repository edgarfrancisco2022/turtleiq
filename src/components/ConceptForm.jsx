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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Edit Concept' : 'New Concept'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Concept Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Photosynthesis"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button" onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
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
