import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/authStore'

const navItem = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
    isActive
      ? 'bg-gray-700 text-white font-medium'
      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
  }`

const LibraryIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="3" height="12" rx="0.5" />
    <rect x="6" y="5" width="3" height="10" rx="0.5" />
    <path d="M11 14.5l2.5-9.5 3 .8-2.5 9.5-3-.8z" />
  </svg>
)

const FocusIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" />
    <circle cx="9" cy="9" r="3" />
  </svg>
)

const IndexIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="14" height="14" rx="1.5" />
    <line x1="6" y1="6" x2="12" y2="6" />
    <line x1="6" y1="9" x2="12" y2="9" />
    <line x1="6" y1="12" x2="10" y2="12" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="7.5" r="5" />
    <line x1="11.5" y1="11.5" x2="16" y2="16" />
  </svg>
)

const SubjectIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="14" height="11" rx="1" />
    <path d="M5 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
    <line x1="5" y1="9" x2="13" y2="9" />
    <line x1="5" y1="12" x2="10" y2="12" />
  </svg>
)

const TIME_OPTIONS = [
  { label: '+15m', minutes: 15 },
  { label: '+30m', minutes: 30 },
  { label: '+1h',  minutes: 60 },
  { label: '+2h',  minutes: 120 },
]

function formatTime(totalMinutes) {
  if (!totalMinutes) return '0m'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h${m}m`
}

function getInitials(name = '', email = '') {
  const src = name || email
  return src.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function Sidebar({ onNewConcept }) {
  const subjects      = useStore(s => s.subjects)
  const conceptCount  = useStore(s => s.concepts.length)
  const concepts      = useStore(s => s.concepts)
  const studySessions = useStore(s => s.studySessions)
  const addStudySession = useStore(s => s.addStudySession)

  const user     = useAuthStore(s => s.user)
  const signOut  = useAuthStore(s => s.signOut)
  const navigate = useNavigate()

  const [selectedTime, setSelectedTime]       = useState(null) // minutes
  const [selectedSubject, setSelectedSubject] = useState('')   // '' = Mixed

  const sorted = [...subjects].sort((a, b) => a.name.localeCompare(b.name))

  function subjectCount(subjectId) {
    return concepts.filter(c => c.subjectIds.includes(subjectId)).length
  }

  const totalMinutes = studySessions.reduce((sum, s) => sum + s.minutes, 0)

  function handleAdd() {
    if (!selectedTime) return
    addStudySession({ minutes: selectedTime, subjectId: selectedSubject || null })
    setSelectedTime(null)
    setSelectedSubject('')
  }

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <aside className="w-60 bg-gray-900 text-gray-300 flex flex-col h-screen fixed left-0 top-0 select-none" aria-label="Application sidebar">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-gray-700/60">
        <Link to="/app" className="flex items-center gap-2 hover:opacity-80 transition-opacity" aria-label="TortugaIQ home">
          <span className="text-xl leading-none" aria-hidden="true">🔍🐢</span>
          <div>
            <div className="text-white font-bold text-sm tracking-tight">TortugaIQ</div>
            {conceptCount > 0 && (
              <div className="text-gray-400 text-xs">{conceptCount} concept{conceptCount !== 1 ? 's' : ''}</div>
            )}
          </div>
        </Link>
      </div>

      <nav aria-label="Main navigation" className="flex flex-col flex-1 overflow-hidden">
        {/* New + Search */}
        <div className="px-3 pt-3 space-y-0.5">
          <button
            onClick={onNewConcept}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
            aria-label="Create new concept"
          >
            <span className="text-base font-light" aria-hidden="true">+</span> New Concept
          </button>
          <NavLink to="/app/search" className={navItem}><SearchIcon /> Search</NavLink>
        </div>

        {/* Study Session */}
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider" id="study-session-label">Study Session</p>
            <span className="text-xs text-gray-400 font-mono" aria-label={`Total study time: ${formatTime(totalMinutes)}`}>[{formatTime(totalMinutes)}]</span>
          </div>

          {/* Time buttons */}
          <div className="grid grid-cols-4 gap-1 mb-2 px-1" role="group" aria-labelledby="study-session-label">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt.minutes}
                onClick={() => setSelectedTime(t => t === opt.minutes ? null : opt.minutes)}
                aria-pressed={selectedTime === opt.minutes}
                aria-label={`Add ${opt.label} to study session`}
                className={`text-xs py-1 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset ${
                  selectedTime === opt.minutes
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Subject selector */}
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <SubjectIcon aria-hidden="true" />
            <label htmlFor="study-subject-select" className="sr-only">Study subject</label>
            <select
              id="study-subject-select"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="flex-1 text-xs bg-gray-800 text-gray-300 border border-gray-700 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="">Mixed</option>
              {sorted.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Add button */}
          <div className="px-1">
            <button
              onClick={handleAdd}
              disabled={!selectedTime}
              className="w-full text-xs py-1 rounded-md font-medium transition-colors disabled:opacity-30 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-disabled={!selectedTime}
            >
              + Add session
            </button>
          </div>
        </div>

        {/* Explore */}
        <div className="px-3 pt-3 space-y-0.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1" aria-hidden="true">
            Explore
          </p>
          <NavLink to="/app/library" className={navItem}><LibraryIcon /> Library</NavLink>
          <NavLink to="/app/focus" className={navItem}><FocusIcon /> Focus</NavLink>
          <NavLink to="/app/index" className={navItem}><IndexIcon /> Index</NavLink>
        </div>

        {/* Subjects */}
        <div className="flex-1 overflow-y-auto px-3 pt-3">
          {sorted.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1" aria-hidden="true">
                Subjects
              </p>
              {sorted.map(subject => (
                <NavLink
                  key={subject.id}
                  to={`/app/subjects/${subject.id}`}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-gray-700 text-white font-medium'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                    }`
                  }
                >
                  <span className="truncate">{subject.name}</span>
                  <span className="text-xs text-gray-400 ml-1" aria-label={`${subjectCount(subject.id)} concepts`}>{subjectCount(subject.id)}</span>
                </NavLink>
              ))}
            </>
          )}
        </div>
      </nav>

      {/* Signed-in user */}
      {user && (
        <div className="px-3 py-3 border-t border-gray-700/60">
          <div className="flex items-center gap-2 px-2 py-1.5" aria-label={`Signed in as ${user.name || user.email}`}>
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0" aria-hidden="true">
              {getInitials(user.name, user.email)}
            </div>
            <div className="flex-1 min-w-0">
              {user.name && <div className="text-xs font-medium text-gray-300 truncate">{user.name}</div>}
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full mt-1 text-xs text-gray-400 hover:text-gray-200 px-2 py-1 text-left transition-colors rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  )
}
