'use client'

import { useEffect } from 'react'

interface Props {
  sessionLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteSessionDialog({ sessionLabel, onConfirm, onCancel }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    document.addEventListener('keydown', onKey, { capture: true })
    return () => document.removeEventListener('keydown', onKey, { capture: true })
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="delete-session-dialog-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h2
          id="delete-session-dialog-title"
          className="text-base font-semibold text-gray-900 mb-1"
        >
          Remove Session?
        </h2>
        <p className="text-sm font-medium text-gray-700 bg-gray-100 rounded px-2 py-1 inline-block mb-4 truncate max-w-full">
          {sessionLabel}
        </p>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          This session will be permanently removed from your study history. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            autoFocus
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-sm font-medium border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
