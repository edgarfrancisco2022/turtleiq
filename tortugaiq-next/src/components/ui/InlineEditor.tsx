'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import MarkdownHelpPanel from './MarkdownHelpPanel'

const MD_PLUGINS = {
  remark: [remarkGfm, remarkMath],
  rehype: [rehypeKatex],
}

interface Props {
  content?: string
  placeholder?: string
  hint?: React.ReactNode
  editPlaceholder?: string
  onSave: (value: string) => void
}

/**
 * Compact inline editor for the MVK panel — matches MarkdownEditor visual style.
 * Toolbar lives outside the scrollable content area so it is always visible.
 */
export default function InlineEditor({
  content = '',
  placeholder = '',
  hint = null,
  editPlaceholder,
  onSave,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(content)
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code')
  const [showHelp, setShowHelp] = useState(false)

  function startEdit() {
    setDraft(content)
    setViewMode('code')
    setIsEditing(true)
  }

  function handleSave() {
    onSave(draft)
    setIsEditing(false)
  }

  function handleCancel() {
    setDraft(content)
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
      <div className="bg-white overflow-hidden">
        <div className="flex justify-end px-4 py-2 border-b border-gray-100 bg-gray-50">
          <button
            onClick={startEdit}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="px-4 py-3 max-h-32 overflow-y-auto overscroll-none">
          {content ? (
            <div className="prose prose-xs prose-neutral max-w-none text-sm">
              <ReactMarkdown
                remarkPlugins={MD_PLUGINS.remark}
                rehypePlugins={MD_PLUGINS.rehype}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-400 italic m-0">
                {placeholder || 'No MVK notes. Click Edit to add.'}
              </p>
              {hint}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden">
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
          className="w-full px-4 py-3 text-sm font-mono text-gray-800 focus:outline-none resize-none leading-relaxed max-h-32 overflow-y-auto overscroll-none"
          rows={4}
          placeholder={editPlaceholder ?? placeholder}
          autoFocus
        />
      ) : (
        <div className="px-4 py-3 max-h-32 overflow-y-auto overscroll-none prose prose-xs prose-neutral max-w-none text-sm">
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
