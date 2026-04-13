'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import MarkdownHelpPanel from './MarkdownHelpPanel'
import { useDirtyState } from '@/components/providers/DirtyStateProvider'

const MD_PLUGINS = {
  remark: [remarkGfm, remarkMath],
  rehype: [rehypeKatex],
}

export const MVK_PLACEHOLDER = `Write the smallest useful representation of this concept in your own words. Keep it tiny, intuitive and easy to remember: a simple example, a couple keywords, a micro synthesis, a mini diagram, an image...`

export const MVK_EDIT_PLACEHOLDER = `Write the smallest useful representation of this concept in your own words. Keep it tiny, intuitive and easy to remember: a simple example, a couple keywords, a micro synthesis, a mini diagram, an image...

Example — Concept Name: "Photosynthesis"  →  MVK: "sunlight + water + CO₂ = sugar + oxygen"`

export const MVK_EXAMPLE_HINT = (
  <p className="text-xs m-0 mt-2 not-italic">
    <span className="text-gray-400">
      Example — Concept Name: &quot;Photosynthesis&quot; →
    </span>{' '}
    <span className="text-gray-500 font-medium">MVK:</span>{' '}
    <span className="text-gray-600 font-medium">
      &quot;sunlight + water + CO₂ = sugar + oxygen&quot;
    </span>
  </p>
)

interface Props {
  content?: string
  placeholder?: string
  hint?: React.ReactNode
  editPlaceholder?: string
  onSave: (value: string) => void
}

/**
 * Full markdown editor with Code/Preview toggle.
 * Instead of calling a store action directly, calls onSave(value) so callers
 * can wire it to a TanStack Query mutation.
 */
export default function MarkdownEditor({
  content = '',
  placeholder = '',
  hint = null,
  editPlaceholder,
  onSave,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code')
  const [showHelp, setShowHelp] = useState(false)
  const { setDirty } = useDirtyState()

  // Report dirty state whenever draft diverges from saved content while editing
  useEffect(() => {
    if (isEditing) {
      setDirty(draft !== content)
    }
  }, [draft, isEditing, content, setDirty])

  // Clear dirty state on unmount (safety net for navigation that bypasses guards)
  useEffect(() => {
    return () => setDirty(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startEdit() {
    setDraft(content)
    setViewMode('code')
    setIsEditing(true)
  }

  function handleSave() {
    setDirty(false)
    onSave(draft)
    setIsEditing(false)
  }

  function handleCancel() {
    setDirty(false)
    setIsEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newVal = draft.substring(0, start) + '  ' + draft.substring(end)
      setDraft(newVal)
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      }, 0)
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
            <ReactMarkdown
              remarkPlugins={MD_PLUGINS.remark}
              rehypePlugins={MD_PLUGINS.rehype}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <div>
              <p className="text-gray-400 italic text-sm m-0">
                {placeholder || 'No content yet. Click Edit to add.'}
              </p>
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
          {(['code', 'preview'] as const).map((mode) => (
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
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-4 text-sm font-mono text-gray-800 focus:outline-none resize-none leading-relaxed"
          rows={14}
          placeholder={editPlaceholder ?? placeholder}
          autoFocus
        />
      ) : (
        <div className="p-4 prose prose-sm prose-neutral max-w-none min-h-[80px]">
          {draft ? (
            <ReactMarkdown
              remarkPlugins={MD_PLUGINS.remark}
              rehypePlugins={MD_PLUGINS.rehype}
            >
              {draft}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic text-sm m-0">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  )
}
