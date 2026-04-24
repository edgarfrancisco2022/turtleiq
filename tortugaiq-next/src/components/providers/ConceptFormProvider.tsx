'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import ConceptForm from '@/components/ui/ConceptForm'
import { useViewStateRegistry } from './ViewStateRegistryProvider'
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
  // State to trigger the navigation useEffect. Using state (not just a ref) ensures
  // the effect fires after React fully commits — the key difference from setTimeout(0)
  // which can still interleave with the React scheduler's MessageChannel tasks.
  const [pendingTarget, setPendingTarget] = useState<string | null>(null)
  // Ref for cancellation: if the user clicks the backdrop before the effect fires,
  // handleClose nulls this ref and the effect becomes a no-op.
  const pendingRedirectRef = useRef<string | null>(null)
  const router = useRouter()
  const { captureViewState } = useViewStateRegistry()
  const qc = useQueryClient()
  const [, startTransition] = useTransition()

  // Navigate after React fully commits all pending state (setNavigating, TQ cache
  // updates). No setState inside this effect — calling setState inside a useEffect
  // schedules an immediate re-render right after router.push fires, which recreates
  // the same timing conflict we're trying to avoid (that's why a5a9e7b was reverted).
  // startTransition explicitly integrates with React 19's concurrent scheduler so
  // router.push is not dropped when TQ cache updates are still being processed.
  // (Attempt 6 — see docs/bugs/redirect-new-concept-navigation.md)
  useEffect(() => {
    if (!pendingTarget) return
    if (pendingRedirectRef.current !== pendingTarget) return  // cancelled by handleClose
    startTransition(() => router.push(pendingTarget))
  // router and startTransition are stable singletons; omitting avoids spurious re-fires
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTarget])

  function openConceptForm(c?: Concept | null) {
    qc.invalidateQueries({ queryKey: ['subjects'] })
    qc.invalidateQueries({ queryKey: ['topics'] })
    qc.invalidateQueries({ queryKey: ['tags'] })
    setConcept(c ?? null)
    setOpen(true)
    setNavigating(false)
  }

  const handleClose = useCallback(() => {
    setOpen(false)
    setNavigating(false)
    setConcept(null)
    setPendingTarget(null)            // cancel pending useEffect navigation
    pendingRedirectRef.current = null // cancel even if effect is already queued
  }, [])

  function handleDone(id: string) {
    if (!concept) {
      // New concept: save current view state before navigating away, then switch
      // to backdrop-only mode. The form disappears but the backdrop stays until
      // ConceptView mounts. captureViewState() is a no-op when no list view is
      // mounted (e.g. when creating a second concept from within ConceptView).
      captureViewState()
      setNavigating(true)
      const target = `/app/concepts/${id}`
      pendingRedirectRef.current = target
      // Trigger the useEffect above. The effect fires after React commits this
      // render, guaranteeing router.push is called outside any React update cycle.
      setPendingTarget(target)
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
