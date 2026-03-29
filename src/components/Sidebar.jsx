import { NavLink } from 'react-router-dom'
import { useStore } from '../store/useStore'

const navItem = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
    isActive
      ? 'bg-slate-700 text-white font-medium'
      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
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

export default function Sidebar({ onNewConcept }) {
  const subjects     = useStore(s => s.subjects)
  const conceptCount = useStore(s => s.concepts.length)
  const concepts     = useStore(s => s.concepts)

  const sorted = [...subjects].sort((a, b) => a.name.localeCompare(b.name))

  function subjectCount(subjectId) {
    return concepts.filter(c => c.subjectIds.includes(subjectId)).length
  }

  return (
    <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 select-none">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔍🐢</span>
          <div>
            <div className="text-white font-bold text-sm tracking-tight">TurtleIQ</div>
            {conceptCount > 0 && (
              <div className="text-slate-500 text-xs">{conceptCount} concept{conceptCount !== 1 ? 's' : ''}</div>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 pt-3 space-y-0.5">
        <button
          onClick={onNewConcept}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-left"
        >
          <span className="text-base font-light">+</span> New Concept
        </button>

        <NavLink to="/search" className={navItem}><SearchIcon /> Search</NavLink>
      </div>

      {/* Modes */}
      <div className="px-3 pt-3 space-y-0.5">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1">
          Explore
        </p>
        <NavLink to="/list"  className={navItem}><LibraryIcon /> Library</NavLink>
        <NavLink to="/focus" className={navItem}><FocusIcon /> Focus</NavLink>
        <NavLink to="/index" className={navItem}><IndexIcon /> Index</NavLink>
      </div>

      {/* Subjects */}
      <div className="flex-1 overflow-y-auto px-3 pt-3">
        {sorted.length > 0 && (
          <>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1">
              Subjects
            </p>
            {sorted.map(subject => (
              <NavLink
                key={subject.id}
                to={`/subjects/${subject.id}`}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-700 text-white font-medium'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <span className="truncate">{subject.name}</span>
                <span className="text-xs text-slate-600 ml-1">{subjectCount(subject.id)}</span>
              </NavLink>
            ))}
          </>
        )}
      </div>
    </aside>
  )
}
