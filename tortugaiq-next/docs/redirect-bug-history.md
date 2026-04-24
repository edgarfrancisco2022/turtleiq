# Redirect Bug — Fix Attempt History

## The Bug

**Component**: `src/components/providers/ConceptFormProvider.tsx` — `handleDone(id)`

**Symptom**: After a user creates a new concept via the "New Concept" form, the app is supposed to redirect to `/app/concepts/{id}` (the newly created concept's view). Most of the time this works, but intermittently the redirect silently fails and the user remains on whatever page they were on before opening the form.

**Intermittency**: Happens randomly — maybe 1 in 5 to 1 in 20 times. Not tied to any specific page, though confirmed reproduction workflows include:
- User on `/app/sessions` → creates concept → stays on `/app/sessions`
- User on `/app/concepts/{old-id}` → creates concept → stays on old concept view instead of navigating to the new one

**Not a UX-cancel**: The user is not clicking the backdrop to dismiss. The backdrop briefly appears and then disappears (navigation never fires), or the form closes but no navigation happens. The user is left stranded on the previous view.

---

## Root Cause (Best Current Understanding)

`router.push` in Next.js 15 (App Router) + React 19 + TanStack Query v5 is silently dropped when it is called while a React concurrent update is in progress.

The form submission flow:
1. `createMutation.mutateAsync(input)` resolves (Promise.then — microtask)
2. TanStack Query's `onSuccess`/`onSettled` fire → `qc.invalidateQueries(...)` → React scheduler is notified to batch cache updates
3. `handleDone(id)` is called → sets React state (`setNavigating(true)`) and schedules `router.push`
4. If `router.push` fires *while React is processing the TQ cache update batch*, Next.js drops it

The React 19 scheduler uses `MessageChannel` for high-priority task scheduling. `MessageChannel` tasks can interleave with `setTimeout(0)` macrotasks in ways that cause the overlap. `useEffect`, on the other hand, is guaranteed to fire only after React has fully committed all pending state — including the TQ cache updates — so it is inherently race-free.

---

## Attempt 1 — 2026-04-13 — commit `6955e4d` / `c231dfd`

**What changed**: Added the `navigating` state, backdrop overlay, and `closeConceptForm` pattern. Called `router.push` directly and synchronously inside `handleDone`, immediately after `setNavigating(true)`.

```typescript
setNavigating(true)
router.push(`/app/concepts/${id}`)
```

**Why expected to work**: Straightforward — set state, then navigate.

**Result**: Still intermittent. `router.push` is called during an active React state-update batch (triggered by `setNavigating(true)` and/or TQ's cache invalidations), so Next.js 15 silently drops it.

---

## Attempt 2 — 2026-04-23 — commit `a5a9e7b` ("fix redirect issue")

**What changed**: Replaced direct `router.push` with a `useEffect` triggered by a `pendingRedirectId` state variable.

```typescript
const [pendingRedirectId, setPendingRedirectId] = useState<string | null>(null)

useEffect(() => {
  if (pendingRedirectId) {
    router.push(`/app/concepts/${pendingRedirectId}`)
    setPendingRedirectId(null)        // ← BUG 1
  }
}, [pendingRedirectId, router])      // ← BUG 2, no cancellation = BUG 3
```

**Why expected to work**: `useEffect` defers the navigation until after React commits all pending state, avoiding the race with concurrent React updates.

**Bugs in this implementation**:
1. **`setState` inside the effect**: `setPendingRedirectId(null)` schedules an immediate re-render *right after* `router.push` fires. This extra commit during active navigation recreates the very timing conflict the effect was supposed to escape.
2. **`router` in dependency array**: `useRouter()` returns a stable singleton in Next.js 15, but including it adds noise and could cause spurious effect re-fires if the reference ever changes.
3. **No cancellation**: `handleClose` had no way to abort the pending navigation. If the user somehow triggered a close between the state set and the effect firing, navigation would proceed anyway.

**Result**: Reverted ~1 hour later in favor of `setTimeout(0)` (commit `c8fb133`). Likely failed in testing due to the extra re-render (Bug 1) causing inconsistent behavior.

---

## Attempt 3 — 2026-04-23 — commit `c8fb133` ("fix third attempt")

**What changed**: Reverted `useEffect` approach. Replaced with `setTimeout(0)` + `pendingRedirectRef` (a ref instead of state for cancellation).

```typescript
const pendingRedirectRef = useRef<string | null>(null)

// In handleDone:
pendingRedirectRef.current = target
setTimeout(() => {
  if (pendingRedirectRef.current === target) {
    router.push(target)
  }
}, 0)

// In handleClose:
pendingRedirectRef.current = null  // cancels pending setTimeout
```

**Why expected to work**: `setTimeout(0)` defers `router.push` to the next macrotask — after all microtasks (Promise callbacks, React commits, TQ invalidations) complete. The ref enables cancellation if the user clicks the backdrop before the timeout fires.

**Result**: Still intermittent in production. The React 19 scheduler uses `MessageChannel` internally for some batching, and `MessageChannel` tasks have higher priority than `setTimeout(0)` tasks in some browser environments, meaning they can still interleave.

---

## Attempt 4 — 2026-04-23 — commit `ac14642` ("more fixes")

**What changed**: Added `useQueryClient` and `qc.invalidateQueries` calls to `openConceptForm` (when the form *opens*, not when it's submitted). This pre-invalidates subjects/topics/tags so the form's multi-selects load fresh data. No change to the redirect logic itself.

```typescript
function openConceptForm(c?: Concept | null) {
  qc.invalidateQueries({ queryKey: ['subjects'] })
  qc.invalidateQueries({ queryKey: ['topics'] })
  qc.invalidateQueries({ queryKey: ['tags'] })
  // ...
}
```

**Why expected to work**: By triggering query invalidations *when the form opens* (before the user starts filling it in), the refetch network requests should complete before the concept is submitted, reducing the overlap between active TQ updates and `router.push`.

**Result**: Possibly reduced frequency but did not eliminate the bug. The race condition with `setTimeout(0)` still exists regardless of when invalidations are triggered.

---

## Attempt 5 (current) — 2026-04-24

**What changed**: Replaced `setTimeout(0)` with a `useEffect` triggered by a `pendingTarget` state variable — fixing all three bugs from Attempt 2.

```typescript
// New state variable (replaces setTimeout)
const [pendingTarget, setPendingTarget] = useState<string | null>(null)
// Existing ref kept for cancellation
const pendingRedirectRef = useRef<string | null>(null)

// useEffect: fires after React commits — no setState inside
useEffect(() => {
  if (!pendingTarget) return
  if (pendingRedirectRef.current !== pendingTarget) return  // cancelled
  router.push(pendingTarget)
  // No setState here — avoids the extra-render issue from Attempt 2
}, [pendingTarget])  // router NOT in deps

// handleDone:
pendingRedirectRef.current = target
setPendingTarget(target)  // triggers the effect

// handleClose:
setPendingTarget(null)            // cancel pending effect
pendingRedirectRef.current = null // cancel even if effect already queued
```

**How this differs from Attempt 2**:
- **No `setState` inside effect**: `router.push` fires into a clean, committed React state with no follow-up re-render.
- **`router` not in deps**: Avoids potential spurious re-fires.
- **Cancellation via ref**: If `handleClose` fires before the effect runs, `pendingRedirectRef.current` is nulled and the effect is a no-op. If `handleClose` fires after `router.push` has already been called, the backdrop is cleared and navigation proceeds normally (ConceptView's `closeConceptForm` call on mount handles cleanup).

**Why expected to work**: `useEffect` is guaranteed by React to fire only after the component tree has been fully committed to the DOM — including all batched state updates (`setNavigating(true)`, TQ cache updates from `openConceptForm`'s invalidations, and TQ's mutation `onSettled` callbacks). At that point, React is not in any update cycle, and `router.push` cannot be dropped.

**Result**: TBD — deployed 2026-04-24.

---

## If Attempt 5 Also Fails — Next Things to Try

If the bug persists after Attempt 5, investigate these directions:

1. **Wrap `router.push` in `startTransition`** inside the `useEffect`. In React 19, `startTransition` explicitly integrates with the concurrent scheduler. If `router.push` is being dropped because Next.js's internal navigation transition conflicts with a TQ transition, wrapping it would serialize them.

   ```typescript
   const [, startTransition] = useTransition()
   useEffect(() => {
     if (!pendingTarget || pendingRedirectRef.current !== pendingTarget) return
     startTransition(() => router.push(pendingTarget))
   }, [pendingTarget])
   ```

2. **Check `router.replace` vs `router.push`**: `router.replace` is semantically the right call (the form modal state shouldn't be in history). It might behave differently in edge cases.

3. **Add a pathname-watch fallback**: Use `usePathname()` in `ConceptFormProvider` to detect if navigation didn't happen after a timeout, and retry.

4. **Instrument in production**: Add a `console.error` or Sentry event inside `handleDone` right before `setPendingTarget`, and another one inside the `useEffect` right before `router.push`, to confirm the effect is actually firing in production when the bug occurs.

5. **Inspect TanStack Query mutation definition**: Read `src/hooks/useConcepts.ts` to see what `onSuccess`/`onSettled` the create mutation has. If it uses `startTransition` internally or triggers aggressive invalidations, those could be the source of the race.
