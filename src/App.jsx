import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import { useAuthStore } from './store/authStore'
import Sidebar from './components/Sidebar'
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
import SearchView   from './views/SearchView'
import ListMode     from './views/ListMode'
import FocusMode    from './views/FocusMode'
import IndexMode    from './views/IndexMode'

// Redirects to /sign-in if not authenticated
function RequireAuth({ children }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/sign-in" replace />
  return children
}

// The authenticated app shell: sidebar + routed content
function AppShell() {
  const navigate = useNavigate()
  const [formState, setFormState] = useState(null)

  function openNewForm()        { setFormState({ mode: 'add' }) }
  function openEditForm(concept){ setFormState({ mode: 'edit', concept }) }
  function closeForm()          { setFormState(null) }

  function handleDone(id) {
    if (formState?.mode === 'add') navigate(`/app/concepts/${id}`)
    closeForm()
  }

  return (
    <AppContext.Provider value={{ openEditForm }}>
      <div className="flex h-screen bg-gray-50">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Sidebar onNewConcept={openNewForm} />

        <main id="main-content" className="flex-1 ml-60 overflow-y-auto" tabIndex={-1}>
          <Routes>
            <Route index                        element={<HomeView onNewConcept={openNewForm} />} />
            <Route path="subjects/:subjectId"   element={<SubjectView />} />
            <Route path="concepts/:conceptId"   element={<ConceptView />} />
            <Route path="search"                element={<SearchView />} />
            <Route path="library"               element={<ListMode />} />
            <Route path="focus"                 element={<FocusMode />} />
            <Route path="index"                 element={<IndexMode />} />
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
