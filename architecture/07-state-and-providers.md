# 07 — State & Providers

## React Context — When and Why

React Context is a mechanism for sharing state between components without prop drilling. In this app, context is used for state that is:
- **Needed by many components** at different levels of the tree
- **Not server data** (that's TanStack Query's job)
- **App-level concern** (not local to one component)

The rule: don't reach for context for everything. It causes re-renders of all consumers when the value changes. For state local to one component, use `useState`. For server data, use TanStack Query.

---

## Provider Nesting in `(app)/layout.tsx`

The app layout wraps its children in this exact order:

```typescript
// src/app/(app)/layout.tsx
export default function AppLayout({ children }) {
  return (
    <DirtyStateProvider>
      <ViewStateRegistryProvider>
        <ConceptFormProvider>
          <AppShellInner>
            {/* Sidebar, StudySessionBar, main */}
            {children}
          </AppShellInner>
        </ConceptFormProvider>
      </ViewStateRegistryProvider>
    </DirtyStateProvider>
  )
}
```

The nesting order is not arbitrary:

- **`DirtyStateProvider` must be outermost** — it guards all navigation including those triggered from ConceptFormProvider. If it were inside, the guard wouldn't cover form-triggered navigations.
- **`ViewStateRegistryProvider` must wrap `ConceptFormProvider`** — the ConceptFormProvider calls `captureViewState()` from the registry when creating a new concept. If the registry were inside, the call would fail.
- **`ConceptFormProvider` wraps `AppShellInner`** — the form modal is rendered by ConceptFormProvider, and the Sidebar button that triggers the form is inside AppShellInner. The Sidebar calls `useConceptForm().openConceptForm()`, which requires the provider to be an ancestor.

---

## Provider 1: `DirtyStateProvider`

**File:** `src/components/providers/DirtyStateProvider.tsx`

**Purpose:** Prevent data loss when a user navigates away while a MarkdownEditor has unsaved content.

### State and Interface

```typescript
interface DirtyStateContextType {
  isDirty: boolean
  setDirty: (dirty: boolean) => void
  requestNavigation: (action: () => void) => void
}
```

- `isDirty` — true if any MarkdownEditor has unsaved changes
- `setDirty` — called by MarkdownEditor instances when content changes
- `requestNavigation(action)` — called by navigation elements; checks dirty before executing

### The `requestNavigation` Guard

Instead of calling `router.push(url)` directly, navigation elements call:

```typescript
const { requestNavigation } = useDirtyState()

function handleNavClick() {
  requestNavigation(() => router.push('/app/library'))
}
```

Inside `requestNavigation`:
- If `isDirty === false`: execute `action()` immediately
- If `isDirty === true`: store `action` in a ref, show `UnsavedChangesDialog`

The dialog has two buttons:
- **"Keep Editing"**: close dialog, discard the pending action
- **"Discard Changes"**: `setDirty(false)`, close dialog, execute the pending action

### Browser `beforeunload` Guard

When `isDirty` is true, the browser's native "Leave page?" dialog is activated:

```typescript
useEffect(() => {
  const handler = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault()
      e.returnValue = ''  // Required for Chrome
    }
  }
  window.addEventListener('beforeunload', handler)
  return () => window.removeEventListener('beforeunload', handler)
}, [isDirty])
```

This prevents accidental data loss on browser close, tab close, or URL bar navigation.

### MarkdownEditor Integration

Each MarkdownEditor registers and clears the dirty flag:

```typescript
// In MarkdownEditor.tsx
const { setDirty } = useDirtyState()

useEffect(() => {
  if (isEditing) {
    setDirty(draft !== savedContent)  // Mark dirty if draft differs from saved
  }
}, [draft, isEditing, savedContent])

useEffect(() => {
  return () => setDirty(false)  // Clear on unmount (safety net)
}, [])
```

---

## Provider 2: `ViewStateRegistryProvider`

**File:** `src/components/providers/ViewStateRegistryProvider.tsx`

**Purpose:** Allow list views to save their state (scroll position, filters, focused concept) before navigating to ConceptView, so they can restore it on back-navigation.

### Interface

```typescript
interface ViewStateRegistryContextType {
  registerViewStateSaver: (fn: () => void) => () => void
  captureViewState: () => void
}
```

- `registerViewStateSaver(fn)` — a list view calls this on mount, passing its save function. Returns an unregister function called on unmount.
- `captureViewState()` — fires the registered saver function. Called by ConceptFormProvider before navigating to a new concept.

### Single-Slot Design

The registry holds only **one** saver at a time:

```typescript
const saverRef = useRef<(() => void) | null>(null)

function registerViewStateSaver(fn: () => void) {
  saverRef.current = fn
  return () => { saverRef.current = null }  // unregister on unmount
}

function captureViewState() {
  saverRef.current?.()  // call the current saver if one is registered
}
```

Why single-slot? At any given time, only one list view is rendered (you can't be on Library and SubjectView simultaneously). The latest registration wins, and unmount cleans it up. This prevents stale savers from triggering.

### Back Navigation State Pattern

When a list view's saver function fires, it writes to `sessionStorage`:

```typescript
// Example from ListMode — called by the registered saver
function saveState() {
  const scrollEl = document.getElementById('main-content')
  window.__cvBackPending = true  // in-memory flag to prevent stale restore
  sessionStorage.setItem('cv-back', '1')
  sessionStorage.setItem('scroll-library', String(scrollEl?.scrollTop ?? 0))
  sessionStorage.setItem('library-last-id', focusedId)
  sessionStorage.setItem('library-state', JSON.stringify({ filters, sort }))
}
```

On mount, the list view checks:

```typescript
useEffect(() => {
  const hasBack = sessionStorage.getItem('cv-back') === '1'
  if (hasBack && window.__cvBackPending) {
    // Restore state
    sessionStorage.removeItem('cv-back')
    window.__cvBackPending = false
    const scroll = Number(sessionStorage.getItem('scroll-library') ?? 0)
    // ... restore filters, scroll, focused concept
  } else {
    // Fresh load — scroll to top
    document.getElementById('main-content')?.scrollTo(0, 0)
  }
}, [])
```

**The `__cvBackPending` flag** solves a subtle problem: `sessionStorage` persists across page refreshes. If you saved state, then refreshed the page directly (not via back navigation), the old `cv-back` key would still be there and would trigger a false restore. The in-memory `window.__cvBackPending` flag is set only when a navigation is actually happening — it's cleared on page reload because it's in memory, not storage.

### `sessionStorage` Key Convention

| Key | View | Value |
|-----|------|-------|
| `cv-back` | All list views | `'1'` — signals "came from ConceptView" |
| `scroll-library` | Library | Scroll position (px) |
| `scroll-subject` | SubjectView | Scroll position (px) |
| `scroll-index` | IndexMode | Scroll position (px) |
| `library-last-id` | Library | Focused concept ID |
| `subject-last-id` | SubjectView | Focused concept ID |
| `index-last-id` | IndexMode | Focused concept ID |
| `library-state` | Library | JSON: `{ filters, sort }` |
| `subject-state` | SubjectView | JSON: `{ filters, sort }` |

---

## Provider 3: `ConceptFormProvider`

**File:** `src/components/providers/ConceptFormProvider.tsx`

**Purpose:** Provide a globally accessible "open concept form" function and manage the create/edit modal. Also handles the navigation race condition after concept creation.

### Interface

```typescript
interface ConceptFormContextType {
  openConceptForm: (concept?: Concept | null) => void
  closeConceptForm: () => void
}
```

### The Race Condition Problem

When a user creates a new concept:
1. ConceptForm calls `createConcept(input)` → Server Action returns `newConceptId`
2. `useCreateConcept().onSuccess` fires → `qc.invalidateQueries(...)` starts background refetches
3. `router.push('/app/concepts/newId')` is called
4. The refetch response arrives while Next.js's RSC navigation is in progress
5. TanStack Query's `useSyncExternalStore` fires a high-priority React update
6. React prioritizes the TQ update over the navigation transition → **navigation is silently cancelled**

This was one of the hardest bugs in the app. Nine approaches were tried before a stable solution was found. See `docs/bugs/redirect-new-concept-navigation.md`.

### The Solution

Three parts working together:

**Part 1: `refetchType: 'none'` in `useCreateConcept`**

Mark queries as stale without starting network requests. No refetch = no TQ update during navigation.

**Part 2: Cancel in-flight queries before `router.push`**

Even with `refetchType: 'none'`, the previous invalidation might have already started requests. Cancel them:

```typescript
await Promise.all([
  qc.cancelQueries({ queryKey: ['concepts'] }),
  qc.cancelQueries({ queryKey: ['subjects'] }),
  // ...
])
router.push(pendingTarget)
```

**Part 3: Delay `router.push` until after React commits**

Calling `router.push` inside a React event handler or immediately in `onSuccess` can still interleave with React's scheduler. The fix: use `useEffect` to call `router.push` AFTER React commits the pending state update.

```typescript
const [pendingTarget, setPendingTarget] = useState<string | null>(null)

useEffect(() => {
  if (!pendingTarget) return
  if (pendingRedirectRef.current !== pendingTarget) return  // cancelled
  // cancelQueries + router.push
}, [pendingTarget])

// In handleDone:
function handleDone(id: string) {
  captureViewState()
  setNavigating(true)  // Show backdrop-only while navigating
  const target = `/app/concepts/${id}`
  pendingRedirectRef.current = target
  setPendingTarget(target)  // Triggers the useEffect after commit
}
```

### The `navigating` State

When creating a new concept, there's a moment between "form submitted" and "ConceptView rendered" where the UI would flash the previous list view. The `navigating` state shows a dark backdrop during this window:

```typescript
{open && !navigating && (
  <ConceptForm concept={concept} onClose={handleClose} onDone={handleDone} />
)}
{navigating && (
  <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />
)}
```

When ConceptView mounts, it calls `closeConceptForm()` which resets `navigating` to false and removes the backdrop.

### Cancellation Safety

If the user clicks the backdrop during navigation (rare edge case), `handleClose` must cancel the pending navigation:

```typescript
const pendingRedirectRef = useRef<string | null>(null)

const handleClose = useCallback(() => {
  setOpen(false)
  setNavigating(false)
  setConcept(null)
  setPendingTarget(null)             // cancel state trigger
  pendingRedirectRef.current = null  // cancel even if useEffect is already queued
}, [])
```

The `useEffect` checks `pendingRedirectRef.current !== pendingTarget` — if the ref was nulled, the effect becomes a no-op.

---

## Provider 4: `SidebarStateProvider`

**File:** `src/components/providers/SidebarStateProvider.tsx`

Simple boolean context for the sidebar collapsed/expanded state. Used by Sidebar, StudySessionBar, and the main content area to adjust their layout.

---

## Provider 5: `SessionProvider`

**File:** `src/components/providers/SessionProvider.tsx`

A thin wrapper around NextAuth's `SessionProvider`. Placed in the **root layout** (not the app layout) so it's available to all routes including auth pages.

```typescript
'use client'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}
```

This enables `useSession()` to work in any client component anywhere in the app.

---

## Provider 6: `QueryProvider`

**File:** `src/components/providers/QueryProvider.tsx`

TanStack Query's `QueryClientProvider` wrapper. Also placed in the root layout. See [06 — Client Data Layer](./06-client-data-layer.md) for details.

---

## Summary: Which Provider for What?

| Need | Use |
|------|-----|
| Server data (concepts, subjects, sessions) | TanStack Query (`useConcepts()`, etc.) |
| Auth session (`session.user.id`, `session.user.isGuest`) | `useSession()` via SessionProvider |
| Open/close the concept create/edit form | `useConceptForm()` via ConceptFormProvider |
| Check/register dirty editor state | `useDirtyState()` via DirtyStateProvider |
| Save/restore list view state before navigation | `useViewStateRegistry()` via ViewStateRegistryProvider |
| Sidebar collapsed state | SidebarStateProvider |
| Local UI state (input values, toggles, open menus) | `useState` in the component |
