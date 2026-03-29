import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import Sidebar from './components/Sidebar'
import ConceptForm from './components/ConceptForm'
import HomeView from './views/HomeView'
import SubjectView from './views/SubjectView'
import ConceptView from './views/ConceptView'
import SearchView from './views/SearchView'
import ListMode from './views/ListMode'
import FocusMode from './views/FocusMode'
import IndexMode from './views/IndexMode'

export default function App() {
  const navigate = useNavigate()

  // null = closed | { mode: 'add' } | { mode: 'edit', concept }
  const [formState, setFormState] = useState(null)

  function openNewForm() { setFormState({ mode: 'add' }) }
  function openEditForm(concept) { setFormState({ mode: 'edit', concept }) }
  function closeForm() { setFormState(null) }

  function handleDone(id) {
    if (formState?.mode === 'add') {
      navigate(`/concepts/${id}`)
    }
    closeForm()
  }

  return (
    <AppContext.Provider value={{ openEditForm }}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar onNewConcept={openNewForm} />

        <main id="main-content" className="flex-1 ml-60 overflow-y-auto">
          <Routes>
            <Route path="/"                    element={<HomeView onNewConcept={openNewForm} />} />
            <Route path="/subjects/:subjectId" element={<SubjectView />} />
            <Route path="/concepts/:conceptId" element={<ConceptView />} />
            <Route path="/search"              element={<SearchView />} />
            <Route path="/list"                element={<ListMode />} />
            <Route path="/focus"               element={<FocusMode />} />
            <Route path="/index"               element={<IndexMode />} />
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
