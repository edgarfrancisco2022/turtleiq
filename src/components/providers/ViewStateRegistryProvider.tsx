'use client'

import { createContext, useCallback, useContext, useRef } from 'react'

interface ViewStateRegistryContextType {
  registerViewStateSaver: (fn: () => void) => () => void
  captureViewState: () => void
}

const ViewStateRegistryContext = createContext<ViewStateRegistryContextType>({
  registerViewStateSaver: () => () => {},
  captureViewState: () => {},
})

export function useViewStateRegistry() {
  return useContext(ViewStateRegistryContext)
}

export function ViewStateRegistryProvider({ children }: { children: React.ReactNode }) {
  const saverRef = useRef<(() => void) | null>(null)

  const registerViewStateSaver = useCallback((fn: () => void) => {
    saverRef.current = fn
    return () => {
      if (saverRef.current === fn) saverRef.current = null
    }
  }, [])

  const captureViewState = useCallback(() => {
    saverRef.current?.()
  }, [])

  return (
    <ViewStateRegistryContext.Provider value={{ registerViewStateSaver, captureViewState }}>
      {children}
    </ViewStateRegistryContext.Provider>
  )
}
