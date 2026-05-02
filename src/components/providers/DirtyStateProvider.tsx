'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import UnsavedChangesDialog from '@/components/ui/UnsavedChangesDialog'

interface DirtyStateContextType {
  isDirty: boolean
  setDirty: (dirty: boolean) => void
  requestNavigation: (action: () => void) => void
}

const DirtyStateContext = createContext<DirtyStateContextType>({
  isDirty: false,
  setDirty: () => {},
  requestNavigation: (action) => action(),
})

export function useDirtyState() {
  return useContext(DirtyStateContext)
}

export function DirtyStateProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setIsDirty] = useState(false)
  // Store pending action as a ref-wrapped function to avoid useState auto-invocation pitfall.
  // We use a state flag to drive dialog visibility and a ref to hold the actual callback.
  const [dialogOpen, setDialogOpen] = useState(false)
  const pendingActionRef = useRef<(() => void) | null>(null)

  // Browser close / refresh guard
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const setDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty)
  }, [])

  const requestNavigation = useCallback((action: () => void) => {
    if (isDirty) {
      pendingActionRef.current = action
      setDialogOpen(true)
    } else {
      action()
    }
  }, [isDirty])

  function handleKeepEditing() {
    pendingActionRef.current = null
    setDialogOpen(false)
  }

  function handleDiscard() {
    const action = pendingActionRef.current
    pendingActionRef.current = null
    setIsDirty(false)
    setDialogOpen(false)
    action?.()
  }

  return (
    <DirtyStateContext.Provider value={{ isDirty, setDirty, requestNavigation }}>
      {children}
      {dialogOpen && (
        <UnsavedChangesDialog
          onKeepEditing={handleKeepEditing}
          onDiscard={handleDiscard}
        />
      )}
    </DirtyStateContext.Provider>
  )
}
