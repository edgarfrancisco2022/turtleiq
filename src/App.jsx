import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import { useAuthStore } from './store/authStore'
import Sidebar from './components/Sidebar'
import StudySessionBar from './components/StudySessionBar'
import ConceptForm from './components/ConceptForm'

import LandingPage    from './views/LandingPage'
import NotesView      from './views/NotesView'
import PostView       from './views/PostView'
import SignInPage     from './views/SignInPage'
import SignUpPage     from './views/SignUpPage'
import NotFoundPage   from './views/NotFoundPage'
import HomeView     from './views/HomeView'
import SubjectView  from './views/SubjectView'
import ConceptView  from './views/ConceptView'
import ListMode     from './views/ListMode'
import FocusMode    from './views/FocusMode'
import IndexMode    from './views/IndexMode'
import OverviewView from './views/OverviewView'

// Redirects to /sign-in if not authenticated
function RequireAuth({ children }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/sign-in" replace />
  return children
}

// The authenticated app shell: sidebar + routed content
function AppShell() {
  const navigate = useNavigate()
  const [formState, setFormState]   = useState(null)
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function openNewForm()        { setFormState({ mode: 'add' }); setMobileOpen(false) }
  function openEditForm(concept){ setFormState({ mode: 'edit', concept }) }
  function closeForm()          { setFormState(null) }

  function handleDone(id) {
    if (formState?.mode === 'add') navigate(`/app/concepts/${id}`)
    closeForm()
  }

  return (
    <AppContext.Provider value={{ openEditForm, collapsed }}>
      <div className="flex h-screen bg-gray-50">
        <a href="#main-content" className="skip-link">Skip to main content</a>

        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar
          onNewConcept={openNewForm}
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <StudySessionBar collapsed={collapsed} />

        <main
          id="main-content"
          className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-200 pt-11 max-md:ml-0 ${collapsed ? 'md:ml-16' : 'md:ml-60'}`}
          tabIndex={-1}
        >
          {/* Mobile hamburger */}
          <button
            className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-gray-900 text-gray-300 hover:text-white"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 18 18" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="4.5" x2="16" y2="4.5" />
              <line x1="2" y1="9" x2="16" y2="9" />
              <line x1="2" y1="13.5" x2="16" y2="13.5" />
            </svg>
          </button>
          <Routes>
            <Route index                        element={<HomeView onNewConcept={openNewForm} />} />
            <Route path="subjects/:subjectId"   element={<SubjectView />} />
            <Route path="concepts/:conceptId"   element={<ConceptView />} />
<Route path="library"               element={<ListMode />} />
            <Route path="focus"                 element={<FocusMode />} />
            <Route path="index"                 element={<IndexMode />} />
            <Route path="overview"              element={<OverviewView />} />
          </Routes>
        </main>

        {formState && (
          <ConceptForm
            concept={formState.mode === 'edit' ? formState.concept : null}
            onClose={closeForm}
            onDone={handleDone}
          />
        )}
      </div>
    </AppContext.Provider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/"              element={<LandingPage />} />
      <Route path="/notes"         element={<NotesView />} />
      <Route path="/notes/:slug"   element={<PostView />} />
      <Route path="/sign-in"       element={<SignInPage />} />
      <Route path="/sign-up"       element={<SignUpPage />} />
      <Route
        path="/app/*"
        element={<RequireAuth><AppShell /></RequireAuth>}
      />
      {/* Catch-all: 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
