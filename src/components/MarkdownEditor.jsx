import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { useStore } from '../store/useStore'
import { getImageUrl } from '../store/imageStore'
import MarkdownHelpPanel from './MarkdownHelpPanel'

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

export const MVK_PLACEHOLDER = `Write the smallest useful representation of this concept in your own words. Keep it tiny, intuitive and easy to remember: a simple example, a couple keywords, a micro synthesis, a mini diagram, an image...`

export const MVK_EDIT_PLACEHOLDER = `Write the smallest useful representation of this concept in your own words. Keep it tiny, intuitive and easy to remember: a simple example, a couple keywords, a micro synthesis, a mini diagram, an image...

Example — Concept Name: "Photosynthesis"  →  MVK: "sunlight + water + CO₂ = sugar + oxygen"`

export const MVK_EXAMPLE_HINT = (
  <p className="text-xs m-0 mt-2 not-italic">
    <span className="text-gray-400">Example — Concept Name: "Photosynthesis" →</span>{' '}
    <span className="text-gray-500 font-medium">MVK:</span>{' '}
    <span className="text-gray-600 font-medium">"sunlight + water + CO₂ = sugar + oxygen"</span>
  </p>
)

/**
 * Full markdown editor with Code/Preview toggle.
 */
export default function MarkdownEditor({ conceptId, field, content = '', placeholder = '', hint = null, editPlaceholder }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [viewMode, setViewMode] = useState('code')
  const [showHelp, setShowHelp] = useState(false)
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
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="p-4 prose prose-sm prose-neutral max-w-none min-h-[64px]">
          {content ? (
            <ReactMarkdown remarkPlugins={MD_PLUGINS.remark} rehypePlugins={MD_PLUGINS.rehype} components={mdComponents} urlTransform={urlTransform}>{content}</ReactMarkdown>
          ) : (
            <div>
              <p className="text-gray-400 italic text-sm m-0">{placeholder || 'No content yet. Click Edit to add.'}</p>
              {hint}
            </div>
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            Markdown Help
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-1 border border-gray-200 rounded-md bg-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-xs bg-blue-600 text-white font-medium px-3 py-1 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {showHelp && <MarkdownHelpPanel onClose={() => setShowHelp(false)} />}

      {viewMode === 'code' ? (
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-4 text-sm font-mono text-gray-800 focus:outline-none resize-none leading-relaxed"
          rows={14}
          placeholder={editPlaceholder ?? placeholder}
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
 * Compact inline editor for the MVK panel — matches MarkdownEditor visual style.
 * Toolbar lives outside the scrollable content area so it is always visible.
 */
export function InlineEditor({ conceptId, field, content = '', placeholder = '', hint = null, editPlaceholder }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft]         = useState(content)
  const [viewMode, setViewMode]   = useState('code')
  const [showHelp, setShowHelp]   = useState(false)
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
      <div className="bg-white overflow-hidden">
        {/* Toolbar — never scrolls */}
        <div className="flex justify-end px-4 py-2 border-b border-gray-100 bg-gray-50">
          <button
            onClick={startEdit}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Edit
          </button>
        </div>
        {/* Scrollable content */}
        <div className="px-4 py-3 max-h-32 overflow-y-auto overscroll-none">
          {content ? (
            <div className="prose prose-xs prose-neutral max-w-none text-sm">
              <ReactMarkdown remarkPlugins={MD_PLUGINS.remark} rehypePlugins={MD_PLUGINS.rehype} components={mdComponents} urlTransform={urlTransform}>{content}</ReactMarkdown>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-400 italic m-0">{placeholder || 'No MVK notes. Click Edit to add.'}</p>
              {hint}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden">
      {/* Toolbar — never scrolls */}
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelp(true)}
            className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            Markdown Help
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-1 border border-gray-200 rounded-md bg-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-xs bg-blue-600 text-white font-medium px-3 py-1 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      {showHelp && <MarkdownHelpPanel onClose={() => setShowHelp(false)} />}
      {/* Scrollable edit area */}
      {viewMode === 'code' ? (
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 text-sm font-mono text-gray-800 focus:outline-none resize-none leading-relaxed max-h-32 overflow-y-auto overscroll-none"
          rows={4}
          placeholder={editPlaceholder ?? placeholder}
          autoFocus
        />
      ) : (
        <div className="px-4 py-3 max-h-32 overflow-y-auto overscroll-none prose prose-xs prose-neutral max-w-none text-sm">
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
