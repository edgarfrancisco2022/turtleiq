import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/authStore'

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


const PlusIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="9" y1="2" x2="9" y2="16" />
    <line x1="2" y1="9" x2="16" y2="9" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="11 4 6 9 11 14" />
  </svg>
)

const HamburgerIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="2" y1="4.5" x2="16" y2="4.5" />
    <line x1="2" y1="9" x2="16" y2="9" />
    <line x1="2" y1="13.5" x2="16" y2="13.5" />
  </svg>
)

const OverviewIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="6" height="6" rx="1" />
    <rect x="10" y="2" width="6" height="6" rx="1" />
    <rect x="2" y="10" width="6" height="6" rx="1" />
    <rect x="10" y="10" width="6" height="6" rx="1" />
  </svg>
)

const HomeIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 8l7-6 7 6" />
    <path d="M4 7v8h4v-4h2v4h4V7" />
  </svg>
)

function getInitials(name = '', email = '') {
  const src = name || email
  return src.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function Sidebar({ onNewConcept, collapsed, onToggle, mobileOpen }) {
  const subjects      = useStore(s => s.subjects)
  const conceptCount  = useStore(s => s.concepts.length)
  const concepts      = useStore(s => s.concepts)
  const user     = useAuthStore(s => s.user)
  const signOut  = useAuthStore(s => s.signOut)
  const navigate = useNavigate()

  const sorted = [...subjects].sort((a, b) => a.name.localeCompare(b.name))

  function subjectCount(subjectId) {
    return concepts.filter(c => c.subjectIds.includes(subjectId)).length
  }

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  // Nav item styles — different layout when collapsed
  function navItem({ isActive }) {
    const base = isActive
      ? 'bg-gray-700 text-white font-medium'
      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
    return collapsed
      ? `flex items-center justify-center p-2 rounded-lg transition-colors ${base}`
      : `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${base}`
  }

  // Sidebar width + mobile translate
  const asideClass = [
    'bg-gray-900 text-gray-300 flex flex-col h-screen fixed left-0 top-0 select-none z-40 transition-all duration-200',
    // desktop width
    collapsed ? 'md:w-16' : 'md:w-60',
    // mobile: overlay drawer
    mobileOpen ? 'w-72 translate-x-0 shadow-2xl' : 'w-72 -translate-x-full md:translate-x-0',
  ].join(' ')

  return (
    <aside className={asideClass} aria-label="Application sidebar">
      {/* Brand / Toggle */}
      <div className={`border-b border-gray-700/60 flex items-center ${collapsed ? 'px-0 py-4 justify-center' : 'px-5 py-4 justify-between'}`}>
        {collapsed ? (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <HamburgerIcon />
          </button>
        ) : (
          <>
            <Link to="/app" className="flex items-center gap-2 hover:opacity-80 transition-opacity" aria-label="TortugaIQ home">
              <span className="text-xl leading-none whitespace-nowrap" aria-hidden="true">🔍🐢</span>
              <div>
                <div className="text-white font-bold text-sm tracking-tight">TortugaIQ</div>
                {conceptCount > 0 && (
                  <div className="text-gray-400 text-xs">{conceptCount} concept{conceptCount !== 1 ? 's' : ''}</div>
                )}
              </div>
            </Link>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeftIcon />
            </button>
          </>
        )}
      </div>

      <nav aria-label="Main navigation" className="flex flex-col flex-1 overflow-hidden">
        {/* New Concept + Search */}
        <div className={`pt-3 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {collapsed ? (
            <>
              <NavLink to="/app" end className={navItem} title="Home"><HomeIcon /></NavLink>
              <button
                onClick={onNewConcept}
                className="w-full flex items-center justify-center p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-label="Create new concept"
                title="New Concept"
              >
                <PlusIcon />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onNewConcept}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-label="Create new concept"
              >
                <span className="text-base font-light" aria-hidden="true">+</span> New Concept
              </button>
            </>
          )}
        </div>

        {/* Explore */}
        <div className={`pt-3 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1" aria-hidden="true">
              Explore
            </p>
          )}
          <NavLink to="/app/overview" className={navItem} title="Overview"><OverviewIcon />{!collapsed && ' Overview'}</NavLink>
          <NavLink to="/app/library" className={navItem} title="Library"><LibraryIcon />{!collapsed && ' Library'}</NavLink>
          <NavLink to="/app/focus"   className={navItem} title="Focus"><FocusIcon />{!collapsed && ' Focus'}</NavLink>
          <NavLink to="/app/index"   className={navItem} title="Index"><IndexIcon />{!collapsed && ' Index'}</NavLink>
        </div>

        {/* Subjects — hidden when collapsed */}
        {!collapsed && (
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
        )}

        {/* Spacer when collapsed so footer is pushed to bottom */}
        {collapsed && <div className="flex-1" />}
      </nav>

      {/* User footer */}
      {user && (
        <div className={`border-t border-gray-700/60 ${collapsed ? 'px-2 py-3 flex justify-center' : 'px-3 py-3'}`}>
          {collapsed ? (
            <button
              onClick={handleSignOut}
              className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={`Sign out (signed in as ${user.name || user.email})`}
              title={`${user.name || user.email} — Sign out`}
            >
              {getInitials(user.name, user.email)}
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 px-2 py-1.5" aria-label={`Signed in as ${user.name || user.email}`}>
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0" aria-hidden="true">
                  {getInitials(user.name, user.email)}
                </div>
                <div className="flex-1 min-w-0">
                  {user.name && <div className="text-xs font-medium text-gray-300 truncate">{user.name}</div>}
                  <div className="text-xs text-gray-400 truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full mt-1 text-xs text-gray-400 hover:text-gray-200 px-2 py-1 text-left transition-colors rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  )
}
