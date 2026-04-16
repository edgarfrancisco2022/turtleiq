'use client'

import { useEffect, useState } from 'react'
import type { StudySession, Subject } from '@/lib/types'

const TIME_OPTIONS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h',  minutes: 60 },
  { label: '2h',  minutes: 120 },
]

function decomposeMinutes(minutes: number): Set<number> {
  const options = [120, 60, 30, 15]
  const selected = new Set<number>()
  let remaining = minutes
  for (const opt of options) {
    if (remaining >= opt) {
      selected.add(opt)
      remaining -= opt
    }
  }
  return remaining === 0 ? selected : new Set()
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

interface Props {
  session: StudySession
  subjects: Subject[]
  onSave: (data: { minutes: number; subjectId: string | null }) => void
  onCancel: () => void
}

export default function EditSessionModal({ session, subjects, onSave, onCancel }: Props) {
  const [selected, setSelected] = useState<Set<number>>(() => decomposeMinutes(session.minutes))
  const [subjectId, setSubjectId] = useState(session.subjectId ?? '')

  const sorted = [...subjects].sort((a, b) => a.name.localeCompare(b.name))
  const total = Array.from(selected).reduce((s, m) => s + m, 0)

  const originalSubjectName = session.subjectId
    ? (subjects.find((s) => s.id === session.subjectId)?.name ?? 'Unknown')
    : 'Unassigned'
  const originalLabel = `${originalSubjectName} · ${formatDuration(session.minutes)}`

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

  function toggleTime(minutes: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(minutes)) next.delete(minutes)
      else next.add(minutes)
      return next
    })
  }

  function handleSave() {
    if (total === 0) return
    onSave({ minutes: total, subjectId: subjectId || null })
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="edit-session-dialog-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        {/* Header */}
        <h2
          id="edit-session-dialog-title"
          className="text-base font-semibold text-gray-900 mb-1"
        >
          Edit Session
        </h2>

        {/* Session reference pill */}
        <p className="text-sm font-medium text-gray-700 bg-gray-100 rounded px-2 py-1 inline-block mb-5 truncate max-w-full">
          {originalLabel}
        </p>

        <div className="space-y-5 mb-6">
          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            >
              <option value="">Unassigned</option>
              {sorted.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Duration
            </label>
            <div
              className="flex rounded-lg border border-gray-200 overflow-hidden"
              role="group"
              aria-label="Select duration"
            >
              {TIME_OPTIONS.map((opt, i) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => toggleTime(opt.minutes)}
                  aria-pressed={selected.has(opt.minutes)}
                  aria-label={`Select ${opt.label}`}
                  className={`flex-1 text-xs font-medium py-2 transition-all select-none focus:outline-none ${
                    i > 0 ? 'border-l border-gray-200' : ''
                  } ${
                    selected.has(opt.minutes)
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs tabular-nums">
              {total > 0
                ? <span className="text-gray-500">{formatDuration(total)} selected</span>
                : <span className="text-gray-300">Select a duration</span>
              }
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={total === 0}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              total > 0
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
