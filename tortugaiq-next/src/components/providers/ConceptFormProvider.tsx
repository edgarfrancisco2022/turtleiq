'use client'

import { createContext, useContext, useState } from 'react'
import ConceptForm from '@/components/ui/ConceptForm'
import type { Concept } from '@/lib/types'

interface ConceptFormContextType {
  openConceptForm: (concept?: Concept | null) => void
}

const ConceptFormContext = createContext<ConceptFormContextType>({
  openConceptForm: () => {},
})

export function useConceptForm() {
  return useContext(ConceptFormContext)
}

export function ConceptFormProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [concept, setConcept] = useState<Concept | null>(null)

  function openConceptForm(c?: Concept | null) {
    setConcept(c ?? null)
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setConcept(null)
  }

  return (
    <ConceptFormContext.Provider value={{ openConceptForm }}>
      {children}
      {open && (
        <ConceptForm concept={concept} onClose={handleClose} onDone={handleClose} />
      )}
    </ConceptFormContext.Provider>
  )
}
