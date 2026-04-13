'use client'

import { useEffect } from 'react'

interface Props {
  onKeepEditing: () => void
  onDiscard: () => void
}

export default function UnsavedChangesDialog({ onKeepEditing, onDiscard }: Props) {
  // ESC key closes the dialog (same as Keep Editing)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onKeepEditing()
      }
    }
    document.addEventListener('keydown', onKey, { capture: true })
    return () => document.removeEventListener('keydown', onKey, { capture: true })
  }, [onKeepEditing])

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={(e) => {
        // Clicking the backdrop is treated as Keep Editing (safe default)
        if (e.target === e.currentTarget) onKeepEditing()
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="unsaved-dialog-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h2
          id="unsaved-dialog-title"
          className="text-base font-semibold text-gray-900 mb-2"
        >
          Unsaved Changes
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          You have unsaved content in the editor. Leaving now will discard your changes.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onKeepEditing}
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            autoFocus
          >
            Keep Editing
          </button>
          <button
            onClick={onDiscard}
            className="text-sm font-medium border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  )
}
