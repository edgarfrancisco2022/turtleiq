import Link from 'next/link'
import { getConcepts } from '@/actions/concepts'
import { getStudySessions } from '@/actions/study-sessions'
import { getSubjects, getTopics, getTags } from '@/actions/subjects'

export const metadata = { title: 'Overview — TortugaIQ' }

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatMinutes(total: number): string {
  if (!total) return '0m'
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Shared components ────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
      {children}
    </h2>
  )
}

function SummaryCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3.5">
      <div className="text-2xl font-bold text-gray-900 tabular-nums leading-tight">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  )
}

function BreakdownList({
  title,
  items,
  emptyText,
}: {
  title: string
  items: { name: string; value: string | number }[]
  emptyText: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-gray-700 min-w-0 break-words">{item.name}</span>
              <span className="text-gray-400 flex-shrink-0 tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default async function OverviewPage() {
  const [concepts, studySessions, subjects, topics, tags] = await Promise.all([
    getConcepts(),
    getStudySessions(),
    getSubjects(),
    getTopics(),
    getTags(),
  ])

  // ── Study ──────────────────────────────────────────────────────────────────
  const totalMinutes = studySessions.reduce((acc, s) => acc + (s.minutes || 0), 0)
  const totalSessions = studySessions.length
  const totalReviews = concepts.reduce((acc, c) => acc + (c.reviewCount || 0), 0)

  const minutesBySubject: Record<string, number> = {}
  const sessionsBySubjectMap: Record<string, number> = {}
  for (const s of studySessions) {
    const sid = s.subjectId || '__none__'
    minutesBySubject[sid] = (minutesBySubject[sid] || 0) + (s.minutes || 0)
    sessionsBySubjectMap[sid] = (sessionsBySubjectMap[sid] || 0) + 1
  }

  const reviewsBySubjectMap: Record<string, number> = {}
  for (const c of concepts) {
    for (const sid of c.subjectIds) {
      reviewsBySubjectMap[sid] = (reviewsBySubjectMap[sid] || 0) + (c.reviewCount || 0)
    }
  }

  const subjectName = (sid: string) =>
    sid === '__none__' ? 'Unassigned' : (subjects.find((s) => s.id === sid)?.name || 'Unknown')

  const timeBySubject = Object.entries(minutesBySubject)
    .sort(([, a], [, b]) => b - a)
    .map(([sid, mins]) => ({ name: subjectName(sid), value: formatMinutes(mins) }))

  const sessionsBySubjectList = Object.entries(sessionsBySubjectMap)
    .sort(([, a], [, b]) => b - a)
    .map(([sid, count]) => ({ name: subjectName(sid), value: count }))

  const reviewsBySubjectList = Object.entries(reviewsBySubjectMap)
    .sort(([, a], [, b]) => b - a)
    .map(([sid, count]) => ({ name: subjects.find((s) => s.id === sid)?.name || 'Unknown', value: count }))

  const lastSession =
    studySessions.length > 0
      ? [...studySessions].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      : null

  const lastSessionSubjectName = lastSession?.subjectId
    ? subjects.find((s) => s.id === lastSession.subjectId)?.name
    : null

  // ── Inventory ──────────────────────────────────────────────────────────────
  const conceptsBySubject = [...subjects]
    .sort((a, b) => {
      const ca = concepts.filter((c) => c.subjectIds.includes(a.id)).length
      const cb = concepts.filter((c) => c.subjectIds.includes(b.id)).length
      return cb - ca
    })
    .map((s) => ({
      name: s.name,
      value: concepts.filter((c) => c.subjectIds.includes(s.id)).length,
    }))

  const recentConcepts = [...concepts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const STATE_ORDER = ['NEW', 'LEARNING', 'REVIEWING', 'MEMORIZING', 'STORED'] as const
  const STATE_LABELS: Record<string, string> = {
    NEW: 'New',
    LEARNING: 'Learning',
    REVIEWING: 'Reviewing',
    MEMORIZING: 'Memorizing',
    STORED: 'Stored',
  }
  const conceptState = STATE_ORDER.map((state) => ({
    name: STATE_LABELS[state],
    value: concepts.filter((c) => (c.state || 'NEW') === state).length,
  }))

  // ── Catalog ────────────────────────────────────────────────────────────────
  const subjectList = [...subjects]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => ({
      name: s.name,
      value: `${concepts.filter((c) => c.subjectIds.includes(s.id)).length} concepts`,
    }))

  const topicList = [...topics]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => ({
      name: t.name,
      value: `${concepts.filter((c) => c.topicIds.includes(t.id)).length} concepts`,
    }))

  const tagList = [...tags]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => ({
      name: t.name,
      value: `${concepts.filter((c) => c.tagIds.includes(t.id)).length} concepts`,
    }))

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">

      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Study activity, knowledge inventory, and catalog structure.</p>
      </div>

      {/* ── Section 1: Study ─────────────────────────────────── */}
      <section className="mb-10">
        <SectionTitle>Study</SectionTitle>

        {/* Summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <SummaryCard value={formatMinutes(totalMinutes)} label="Total Study Time" />
          <SummaryCard value={totalSessions} label="Study Sessions" />
          <SummaryCard value={totalReviews} label="Total Reviews" />
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <BreakdownList title="Study Time by Subject" items={timeBySubject} emptyText="No study data available" />
          <BreakdownList title="Sessions by Subject" items={sessionsBySubjectList} emptyText="No study data available" />
          <BreakdownList title="Reviews by Subject" items={reviewsBySubjectList} emptyText="No review data available" />
        </div>

        {/* Last Study Session */}
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3.5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Last Study Session</div>
          {lastSession ? (
            <p className="text-sm text-gray-700">
              {lastSessionSubjectName || 'Unassigned'}
              {' · '}
              {formatMinutes(lastSession.minutes)}
              {lastSession.createdAt && (
                <span className="text-gray-400"> · {formatDate(lastSession.createdAt)}</span>
              )}
            </p>
          ) : (
            <p className="text-sm text-gray-400">No study sessions yet</p>
          )}
        </div>
      </section>

      {/* ── Section 2: Inventory ──────────────────────────────── */}
      <section className="mb-10">
        <SectionTitle>Inventory</SectionTitle>

        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <SummaryCard value={concepts.length} label="Total Concepts" />
          <SummaryCard value={subjects.length} label="Subjects" />
          <SummaryCard value={topics.length} label="Topics" />
          <SummaryCard value={tags.length} label="Tags" />
        </div>

        {/* Row 1: Concepts by Subject + Concept State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <BreakdownList title="Concepts by Subject" items={conceptsBySubject} emptyText="No subjects yet" />
          <BreakdownList title="Concept State" items={conceptState} emptyText="" />
        </div>

        {/* Row 2: Recent Concepts — full width */}
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3.5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Concepts</div>
          {recentConcepts.length === 0 ? (
            <p className="text-sm text-gray-400">No concepts added yet</p>
          ) : (
            <div className="space-y-0.5">
              {recentConcepts.map((c) => {
                const conceptSubjects = subjects.filter((s) => c.subjectIds.includes(s.id))
                return (
                  <Link
                    key={c.id}
                    href={`/app/concepts/${c.id}`}
                    className="group flex items-start gap-3 text-sm -mx-2 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors duration-150 min-w-0"
                  >
                    {c.createdAt && (
                      <span className="text-gray-400 flex-shrink-0 text-xs tabular-nums pt-px">
                        {formatDate(c.createdAt)}
                      </span>
                    )}
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors min-w-0 break-words">
                      {c.name}
                    </span>
                    {conceptSubjects.length > 0 && (
                      <span className="text-gray-400 text-xs flex-shrink-0">
                        {conceptSubjects.map((s) => s.name).join(' · ')}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Section 3: Catalog ───────────────────────────────── */}
      <section className="mb-10">
        <SectionTitle>Catalog</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <BreakdownList title="Subjects" items={subjectList} emptyText="No subjects yet" />
          <BreakdownList title="Topics"   items={topicList}   emptyText="No topics yet" />
          <BreakdownList title="Tags"     items={tagList}     emptyText="No tags yet" />
        </div>
      </section>

    </div>
  )
}
