'use client'

import { createContext, useContext } from 'react'

interface SidebarStateContextType {
  collapsed: boolean
}

export const SidebarStateContext = createContext<SidebarStateContextType>({ collapsed: false })

export function useSidebarState() {
  return useContext(SidebarStateContext)
}
