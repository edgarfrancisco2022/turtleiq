'use client'

import { useState } from 'react'
import { useSubjects } from '@/hooks/useSubjects'
import { useStudySessions, useAddStudySession } from '@/hooks/useStudySessions'

const TIME_OPTIONS = [
  { label: '+15m', minutes: 15 },
  { label: '+30m', minutes: 30 },
  { label: '+1h', minutes: 60 },
  { label: '+2h', minutes: 120 },
]

function formatTime(totalMinutes: number) {
  if (!totalMinutes) return '0m'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h${m}m`
}

const ClockIcon = () => (
  <svg
    viewBox="0 0 18 18"
    fill="none"
    className="w-3.5 h-3.5 flex-shrink-0"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="9" r="7.5" />
    <polyline points="9,5 9,9 12,11" />
  </svg>
)

interface Props {
  collapsed: boolean
  onMobileOpen: () => void
}

export default function StudySessionBar({ collapsed, onMobileOpen }: Props) {
  const { data: subjects = [] } = useSubjects()
  const { data: studySessions = [] } = useStudySessions()
  const { mutate: addStudySession } = useAddStudySession()

  const [selectedTimes, setSelectedTimes] = useState<Set<number>>(new Set())
  const [selectedSubject, setSelectedSubject] = useState('')

  const sorted = [...subjects].sort((a, b) => a.name.localeCompare(b.name))
  const totalMinutes = studySessions.reduce((sum, s) => sum + s.minutes, 0)
  const selectedTotal = Array.from(selectedTimes).reduce((sum, m) => sum + m, 0)

  function toggleTime(minutes: number) {
    setSelectedTimes((prev) => {
      const next = new Set(prev)
      if (next.has(minutes)) next.delete(minutes)
      else next.add(minutes)
      return next
    })
  }

  function handleAdd() {
    if (selectedTimes.size === 0) return
    addStudySession({ minutes: selectedTotal, subjectId: selectedSubject || null })
    setSelectedTimes(new Set())
    setSelectedSubject('')
  }

  const leftClass = `max-md:left-0 ${collapsed ? 'md:left-16' : 'md:left-60'}`

  return (
    <div
      className={`fixed top-0 right-0 ${leftClass} h-11 z-30 bg-white border-b border-gray-200 flex items-center gap-2 px-3 transition-all duration-200 max-md:overflow-x-auto`}
      role="region"
      aria-label="Study session tracker"
    >
      {/* Hamburger — mobile only */}
      <button
        className="md:hidden flex-shrink-0 p-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        onClick={onMobileOpen}
        aria-label="Open navigation"
      >
        <svg
          viewBox="0 0 18 18"
          fill="none"
          className="w-4 h-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="2" y1="4.5" x2="16" y2="4.5" />
          <line x1="2" y1="9" x2="16" y2="9" />
          <line x1="2" y1="13.5" x2="16" y2="13.5" />
        </svg>
      </button>

      <div className="flex items-center gap-3 min-w-max">
        {/* Label */}
        <span className="flex items-center gap-1.5 text-gray-400 whitespace-nowrap select-none">
          <ClockIcon />
          <span className="text-xs font-medium text-gray-500 tracking-wide">Study Session</span>
        </span>

        <div className="w-px h-4 bg-gray-200 flex-shrink-0" aria-hidden="true" />

        {/* Total time */}
        <span
          className="text-xs font-mono font-semibold text-gray-700 whitespace-nowrap select-none tabular-nums"
          aria-label={`Total study time: ${formatTime(totalMinutes)}`}
        >
          {formatTime(totalMinutes)}
        </span>

        <div className="w-px h-4 bg-gray-200 flex-shrink-0" aria-hidden="true" />

        {/* Time increment buttons */}
        <div className="flex items-center gap-1" role="group" aria-label="Add study time">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.minutes}
              onClick={() => toggleTime(opt.minutes)}
              aria-pressed={selectedTimes.has(opt.minutes)}
              aria-label={`Select ${opt.label}`}
              className={`inline-flex items-center justify-center text-xs font-medium px-2.5 py-1 rounded-md border transition-all select-none focus:outline-none ${
                selectedTimes.has(opt.minutes)
                  ? 'border-gray-700 bg-gray-800 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Subject selector */}
        <label htmlFor="bar-study-subject" className="sr-only">
          Study subject
        </label>
        <select
          id="bar-study-subject"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer max-w-[140px]"
        >
          <option value="">Mixed</option>
          {sorted.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Log Time button */}
        <button
          onClick={handleAdd}
          disabled={selectedTimes.size === 0}
          aria-disabled={selectedTimes.size === 0}
          title={selectedTimes.size === 0 ? 'Select a time increment first' : undefined}
          className={`inline-flex items-center justify-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium border transition-colors focus:outline-none whitespace-nowrap select-none ${
            selectedTimes.size > 0
              ? 'border-gray-700 bg-gray-800 text-white hover:bg-gray-700 cursor-pointer'
              : 'border-gray-200 bg-gray-50 text-gray-400 pointer-events-none'
          }`}
        >
          <span>+</span>
          <span>Log{selectedTimes.size > 0 ? ` ${formatTime(selectedTotal)}` : ' Time'}</span>
        </button>
      </div>
    </div>
  )
}
