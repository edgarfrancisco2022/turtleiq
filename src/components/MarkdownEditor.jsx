import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { useStore } from '../store/useStore'
import { getImageUrl } from '../store/imageStore'

// Cache of imageId → objectURL to avoid redundant IndexedDB lookups
const urlCache = new Map()

function TiqImage({ src, alt }) {
  const [url, setUrl] = useState(null)
  const imageId = src?.replace('tiq-img://', '')

  useEffect(() => {
    if (!imageId) return
    if (urlCache.has(imageId)) { setUrl(urlCache.get(imageId)); return }
    getImageUrl(imageId).then(objectUrl => {
      if (objectUrl) { urlCache.set(imageId, objectUrl); setUrl(objectUrl) }
    })
  }, [imageId])

  if (!url) return <span className="text-xs text-gray-400 italic">[image loading…]</span>
  return <img src={url} alt={alt || ''} style={{ maxWidth: '100%', height: 'auto' }} />
}

const mdComponents = {
  img({ src, alt }) {
    if (src?.startsWith('tiq-img://')) return <TiqImage src={src} alt={alt} />
    return <img src={src} alt={alt || ''} style={{ maxWidth: '100%', height: 'auto' }} />
  },
}

const MD_PLUGINS = {
  remark: [remarkGfm, remarkMath],
  rehype: [rehypeKatex],
}

// Pass URLs through unchanged so tiq-img:// scheme reaches the custom img renderer
const urlTransform = url => url

/**
 * Full markdown editor with Code/Preview toggle.
 */
export default function MarkdownEditor({ conceptId, field, content = '', placeholder = '' }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [viewMode, setViewMode] = useState('code')
  const saveContent = useStore(s => s.saveContent)

  function startEdit() {
    setDraft(content)
    setViewMode('code')
    setIsEditing(true)
  }

  function handleSave() {
    saveContent(conceptId, field, draft)
    setIsEditing(false)
  }

  function handleCancel() {
    setIsEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.target
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newVal = draft.substring(0, start) + '  ' + draft.substring(end)
      setDraft(newVal)
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2 }, 0)
    }
  }

  if (!isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex justify-end px-4 py-2 border-b border-gray-100">
          <button
            onClick={startEdit}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="p-4 prose prose-sm prose-neutral max-w-none min-h-[64px]">
          {content ? (
            <ReactMarkdown remarkPlugins={MD_PLUGINS.remark} rehypePlugins={MD_PLUGINS.rehype} components={mdComponents} urlTransform={urlTransform}>{content}</ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic text-sm m-0">{placeholder || 'No content yet. Click Edit to add.'}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-1">
          {['code', 'preview'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`text-xs px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-1 border border-gray-200 rounded-md bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-xs bg-indigo-600 text-white font-medium px-3 py-1 rounded-md hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>

      {viewMode === 'code' ? (
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-4 text-sm font-mono text-gray-800 focus:outline-none resize-none leading-relaxed"
          rows={14}
          placeholder={placeholder}
          autoFocus
        />
      ) : (
        <div className="p-4 prose prose-sm prose-neutral max-w-none min-h-[80px]">
          {draft ? (
            <ReactMarkdown remarkPlugins={MD_PLUGINS.remark} rehypePlugins={MD_PLUGINS.rehype} components={mdComponents} urlTransform={urlTransform}>{draft}</ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic text-sm m-0">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact inline editor — no Code/Preview toggle.
 */
export function InlineEditor({ conceptId, field, content = '', placeholder = '' }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(content)
  const saveContent = useStore(s => s.saveContent)

  function handleSave() {
    saveContent(conceptId, field, draft)
    setIsEditing(false)
  }

  function handleCancel() {
    setDraft(content)
    setIsEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.target
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newVal = draft.substring(0, start) + '  ' + draft.substring(end)
      setDraft(newVal)
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2 }, 0)
    }
  }

  if (!isEditing) {
    return (
      <div>
        {content ? (
          <div className="prose prose-xs prose-neutral max-w-none text-sm">
            <ReactMarkdown remarkPlugins={MD_PLUGINS.remark} rehypePlugins={MD_PLUGINS.rehype} components={mdComponents} urlTransform={urlTransform}>{content}</ReactMarkdown>
          </div>
        ) : null}
        <button
          onClick={() => { setDraft(content); setIsEditing(true) }}
          className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-medium"
        >
          Edit MVK
        </button>
      </div>
    )
  }

  return (
    <div>
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full p-2 text-sm text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none leading-relaxed bg-white"
        rows={4}
        placeholder={placeholder}
        autoFocus
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleCancel}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </div>
  )
}
