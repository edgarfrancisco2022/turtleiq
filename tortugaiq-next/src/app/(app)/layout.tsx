'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Sidebar from '@/components/ui/Sidebar'
import StudySessionBar from '@/components/ui/StudySessionBar'
import { ConceptFormProvider, useConceptForm } from '@/components/providers/ConceptFormProvider'
import { DirtyStateProvider, useDirtyState } from '@/components/providers/DirtyStateProvider'
import { SidebarStateContext } from '@/components/providers/SidebarStateProvider'
import { ViewStateRegistryProvider } from '@/components/providers/ViewStateRegistryProvider'

function AppShellInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { openConceptForm } = useConceptForm()
  const qc = useQueryClient()

  // [DEBUG] Log all TQ cache events to trace race with router.push
  useEffect(() => {
    const unsub = qc.getQueryCache().subscribe((event) => {
      const type = event.type
      if (['invalidated', 'updated', 'added', 'removed', 'observerAdded', 'observerRemoved'].includes(type)) {
        console.log('[TQ cache]', type, (event as any).query?.queryKey, performance.now())
      }
    })
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // [DEBUG] Log pathname changes to detect whether navigation commits
  useEffect(() => {
    console.log('[redirect] pathname changed to', pathname, performance.now())
  }, [pathname])

  // Auto-close mobile drawer on any route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])
  const { requestNavigation } = useDirtyState()

  const mainLeft = `${collapsed ? 'md:pl-16' : 'md:pl-60'}`

  return (
    <SidebarStateContext.Provider value={{ collapsed }}>
      <Sidebar
        onNewConcept={() => requestNavigation(() => openConceptForm())}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <StudySessionBar
        collapsed={collapsed}
        onMobileOpen={() => { setMobileOpen(true); setCollapsed(false) }}
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
        className={`${mainLeft} pt-11 h-screen transition-all duration-200 overflow-y-auto overflow-x-hidden scroll-pt-11 scroll-pb-12`}
      >
        {children}
      </main>
    </SidebarStateContext.Provider>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DirtyStateProvider>
      <ViewStateRegistryProvider>
        <ConceptFormProvider>
          <AppShellInner>{children}</AppShellInner>
        </ConceptFormProvider>
      </ViewStateRegistryProvider>
    </DirtyStateProvider>
  )
}
