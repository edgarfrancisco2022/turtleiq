'use client'

import { useState } from 'react'
import Sidebar from '@/components/ui/Sidebar'
import StudySessionBar from '@/components/ui/StudySessionBar'
import { ConceptFormProvider, useConceptForm } from '@/components/providers/ConceptFormProvider'
import { SidebarStateContext } from '@/components/providers/SidebarStateProvider'

function AppShellInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { openConceptForm } = useConceptForm()

  const mainLeft = `${collapsed ? 'md:pl-16' : 'md:pl-60'}`

  return (
    <SidebarStateContext.Provider value={{ collapsed }}>
      <Sidebar
        onNewConcept={openConceptForm}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <StudySessionBar
        collapsed={collapsed}
        onMobileOpen={() => setMobileOpen(true)}
      />

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <main
        id="main-content"
        className={`${mainLeft} pt-11 min-h-screen transition-all duration-200 overflow-y-auto`}
      >
        {children}
      </main>
    </SidebarStateContext.Provider>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConceptFormProvider>
      <AppShellInner>{children}</AppShellInner>
    </ConceptFormProvider>
  )
}
