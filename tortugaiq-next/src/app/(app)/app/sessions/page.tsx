'use client'

import { useState, useMemo } from 'react'
import { useStudySessions, useDeleteStudySession, useUpdateStudySession } from '@/hooks/useStudySessions'
import { useSubjects } from '@/hooks/useSubjects'
import { getSubjectColor } from '@/lib/subject-colors'
import DeleteSessionDialog from '@/components/ui/DeleteSessionDialog'
import EditSessionModal from '@/components/ui/EditSessionModal'
import type { StudySession } from '@/lib/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTotalTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const TrashIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 5 5 5 15 5" />
    <path d="M6 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
    <path d="M14 5l-1 10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L4 5" />
    <line x1="9" y1="8" x2="9" y2="13" />
    <line x1="7" y1="8" x2="7" y2="13" />
    <line x1="11" y1="8" x2="11" y2="13" />
  </svg>
)

const PencilIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" style={{ transform: 'translateY(2px)' }} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2l3 3-9 9H4v-3L13 2z" />
  </svg>
)

type SortMode = 'date_new' | 'date_old' | 'duration_high' | 'duration_low'

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SessionsPage() {
  const { data: sessions = [] } = useStudySessions()
  const { data: subjects = [] } = useSubjects()
  const deleteMut = useDeleteStudySession()
  const updateMut = useUpdateStudySession()

  const [sort, setSort] = useState<SortMode>('date_new')
  const [filterSubject, setFilterSubject] = useState<string>('') // subjectId or '' for all
  const [deleteTarget, setDeleteTarget] = useState<StudySession | null>(null)
  const [editTarget, setEditTarget] = useState<StudySession | null>(null)

  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s.name])),
    [subjects]
  )

  const filtered = useMemo(() => {
    let list = filterSubject
      ? sessions.filter((s) => s.subjectId === filterSubject)
      : [...sessions]

    switch (sort) {
      case 'date_new': list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
      case 'date_old': list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break
      case 'duration_high': list.sort((a, b) => b.minutes - a.minutes); break
      case 'duration_low': list.sort((a, b) => a.minutes - b.minutes); break
    }
    return list
  }, [sessions, filterSubject, sort])

  const totalMinutes = useMemo(() => sessions.reduce((sum, s) => sum + s.minutes, 0), [sessions])

  // Subjects that have at least one session (for the filter dropdown)
  const usedSubjects = useMemo(() => {
    const ids = new Set(sessions.map((s) => s.subjectId).filter(Boolean))
    return subjects.filter((s) => ids.has(s.id))
  }, [sessions, subjects])

  function getDeleteLabel(session: StudySession): string {
    const subjectName = session.subjectId ? (subjectMap.get(session.subjectId) ?? 'Unknown') : 'Unassigned'
    return `${subjectName} · ${formatDuration(session.minutes)}`
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 pb-44">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <span className="text-sm text-gray-400">
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
        </span>
      </div>

      {/* Summary strip */}
      {sessions.length > 0 && (
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-xl font-bold text-gray-900">{sessions.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">Total Sessions</div>
          </div>
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-xl font-bold text-gray-900">{formatTotalTime(totalMinutes)}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-0.5">Total Study Time</div>
          </div>
        </div>
      )}

      {/* Sort + Filter bar */}
      {sessions.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center py-2.5 border-b border-gray-100 mb-4">
          <label className="text-xs text-gray-400 font-medium">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="text-xs border border-gray-200 rounded-md px-2.5 py-1 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          >
            <option value="date_new">Newest first</option>
            <option value="date_old">Oldest first</option>
            <option value="duration_high">Longest first</option>
            <option value="duration_low">Shortest first</option>
          </select>

          {usedSubjects.length > 0 && (
            <>
              <span className="w-px h-3.5 bg-gray-200 mx-1" />
              <label className="text-xs text-gray-400 font-medium">Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2.5 py-1 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              >
                <option value="">All subjects</option>
                {usedSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {/* Session rows */}
      {filtered.length > 0 ? (
        <div className="space-y-1.5">
          {filtered.map((session) => {
            const subjectName = session.subjectId ? (subjectMap.get(session.subjectId) ?? 'Unknown') : null
            return (
              <div
                key={session.id}
                className="group border border-gray-200 rounded-md bg-white hover:bg-gray-50 hover:border-gray-300 transition-all px-4 py-3 flex items-center gap-3"
              >
                {/* Subject badge */}
                {subjectName ? (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getSubjectColor(session.subjectId!, subjects)}`}>
                    {subjectName}
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                    Unassigned
                  </span>
                )}

                {/* Duration */}
                <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  {formatDuration(session.minutes)}
                </span>

                <span className="text-gray-300 flex-shrink-0">·</span>

                {/* Date */}
                <span className="text-sm text-gray-400 flex-shrink-0">
                  {formatDate(session.createdAt)}
                </span>

                <div className="flex-1" />

                {/* Edit button */}
                <button
                  onClick={() => setEditTarget(session)}
                  className="flex items-center justify-center text-gray-300 hover:text-gray-600 transition-colors p-1 rounded focus:outline-none"
                  aria-label="Edit session"
                  title="Edit session"
                >
                  <PencilIcon />
                </button>

                {/* Delete button */}
                <button
                  onClick={() => setDeleteTarget(session)}
                  className="flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors p-1 rounded focus:outline-none"
                  aria-label="Remove session"
                  title="Remove session"
                >
                  <TrashIcon />
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm py-16">
          {sessions.length === 0
            ? 'No sessions logged yet. Use the bar at the top to track your study time.'
            : 'No sessions match the current filter.'}
        </p>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteSessionDialog
          sessionLabel={getDeleteLabel(deleteTarget)}
          onConfirm={() => {
            deleteMut.mutate(deleteTarget.id)
            setDeleteTarget(null)
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Edit session */}
      {editTarget && (
        <EditSessionModal
          session={editTarget}
          subjects={subjects}
          onSave={({ minutes, subjectId }) => {
            updateMut.mutate({ id: editTarget.id, minutes, subjectId })
            setEditTarget(null)
          }}
          onCancel={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
