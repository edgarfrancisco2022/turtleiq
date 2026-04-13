'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import ConceptForm from '@/components/ui/ConceptForm'
import type { Concept } from '@/lib/types'

interface ConceptFormContextType {
  openConceptForm: (concept?: Concept | null) => void
  closeConceptForm: () => void
}

const ConceptFormContext = createContext<ConceptFormContextType>({
  openConceptForm: () => {},
  closeConceptForm: () => {},
})

export function useConceptForm() {
  return useContext(ConceptFormContext)
}

export function ConceptFormProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [concept, setConcept] = useState<Concept | null>(null)
  // When navigating to a newly created concept, keep the backdrop visible so the
  // previous view never flashes through. ConceptView calls closeConceptForm() on
  // mount to drop the backdrop once the new page is actually rendered.
  const [navigating, setNavigating] = useState(false)
  const router = useRouter()

  function openConceptForm(c?: Concept | null) {
    setConcept(c ?? null)
    setOpen(true)
    setNavigating(false)
  }

  const handleClose = useCallback(() => {
    setOpen(false)
    setNavigating(false)
    setConcept(null)
  }, [])

  function handleDone(id: string) {
    if (!concept) {
      // New concept: switch to backdrop-only mode and navigate.
      // The form disappears but the backdrop stays until ConceptView mounts.
      setNavigating(true)
      router.push(`/app/concepts/${id}`)
    } else {
      handleClose()
    }
  }

  return (
    <ConceptFormContext.Provider value={{ openConceptForm, closeConceptForm: handleClose }}>
      {children}
      {open && !navigating && (
        <ConceptForm concept={concept} onClose={handleClose} onDone={handleDone} />
      )}
      {navigating && (
        // Backdrop-only overlay: keeps the previous view hidden during navigation.
        // onClick is a safety valve in case navigation fails.
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
    </ConceptFormContext.Provider>
  )
}
