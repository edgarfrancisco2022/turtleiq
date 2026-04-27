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

**Result**: TBD — superseded by Attempt 6 on the same day without separate verification.

---

## Attempt 6 — 2026-04-24

**What changed**: Wrapped `router.push` in `startTransition` inside the `useEffect`. All other state/ref logic from Attempt 5 is unchanged.

```typescript
const [, startTransition] = useTransition()

useEffect(() => {
  if (!pendingTarget) return
  if (pendingRedirectRef.current !== pendingTarget) return
  startTransition(() => router.push(pendingTarget))
}, [pendingTarget])
```

**Why expected to work**: `startTransition` in React 19 explicitly registers the navigation as a concurrent transition, giving it the correct priority within the scheduler and preventing it from being silently dropped when TanStack Query's cache-update batch is being processed.

**Result**: **Still failing in production** — confirmed 2026-04-26. Specific reproduction: user on ConceptView creates a new concept → stays on original ConceptView instead of redirecting to new concept. Especially reproducible when markdown content was edited/saved on the original concept before creating the new one.

---

## New Finding: Markdown Editor Interactions as a Trigger (2026-04-26)

Investigation revealed a concrete causal link between MarkdownEditor interactions and the redirect failure.

### Why `startTransition` is counterproductive

`startTransition` marks the navigation as **low-priority** in React 19's concurrent scheduler. Low-priority transitions are interruptible — React will pause them to process higher-priority work.

TanStack Query v5 uses `useSyncExternalStore` internally, meaning its cache state notifications to React subscribers fire **synchronously** (high priority). Every `qc.invalidateQueries` call triggers a synchronous notification chain.

The failure mode with Attempt 6:

1. `startTransition(() => router.push(NEW_ID))` — navigation starts as **low-priority** transition
2. Any `qc.invalidateQueries` call that fires **after step 1** triggers a synchronous (high-priority) TQ subscriber notification
3. React preempts the low-priority navigation to process the high-priority update
4. The navigation transition is interrupted — Next.js silently drops it

The `useEffect` alone (without `startTransition`) already guarantees `router.push` fires post-commit with no active React update cycle. `startTransition` was not needed and actively made the navigation preemptable.

### How markdown editing specifically triggers this

`useUpdateConceptContent` fires `qc.invalidateQueries({ queryKey: ['concepts', conceptId] })` in its `onSuccess`. If the user:

1. Saves markdown content on ConceptView[OLD_ID] → content mutation in-flight
2. Opens form and creates a new concept (before content save resolves)
3. Create mutation resolves → `handleDone(NEW_ID)` → `startTransition(() => router.push(NEW_ID))`
4. Content mutation resolves → `qc.invalidateQueries({ queryKey: ['concepts', OLD_ID] })`
5. TQ fires synchronous notification → React schedules high-priority update
6. High-priority update **interrupts** the navigation transition → redirect dropped

Any other in-flight mutation (e.g., field update from state/priority dropdown, review counter) causes the same problem.

### Secondary: MarkdownEditor state persists across same-route navigation (separate bug)

When navigating from ConceptView[OLD_ID] to ConceptView[NEW_ID], Next.js App Router reuses the ConceptView component instance (same `[conceptId]` route segment). MarkdownEditor components are NOT unmounted — they re-render with new `content` props while retaining `isEditing` and `draft` state. A user landing on a new concept can find the previous concept's editor still open in edit mode, with stale dirty state that affects subsequent navigation guards.

Fixed separately (see Attempt 7 below) with `key={conceptId}` on each MarkdownEditor.

---

## Attempt 7 (current) — 2026-04-26

**What changed**: Removed `startTransition` (and `useTransition`) from ConceptFormProvider entirely. The `useEffect` is kept unchanged — it remains the correct mechanism for post-commit navigation.

```typescript
// useTransition import and hook removed

useEffect(() => {
  if (!pendingTarget) return
  if (pendingRedirectRef.current !== pendingTarget) return  // cancelled by handleClose
  router.push(pendingTarget)
  // No startTransition: navigation runs at normal priority and cannot be preempted
  // by TQ's synchronous subscriber notifications.
}, [pendingTarget])
```

**Also changed**: Added `key={conceptId}` to each MarkdownEditor in ConceptView to discard `isEditing`/`draft` state on same-route navigation (secondary fix).

**Why expected to work**: `useEffect` fires after the commit phase — React is idle, no update cycle is active. `router.push` runs at normal priority. Normal-priority work is not preemptable by other normal-priority work, and TQ's `useSyncExternalStore` notifications schedule normal React renders rather than synchronous interrupts at this point (they can only interrupt *transitions*, not normal renders).

The `useEffect` timing guarantee alone is what was needed all along. `startTransition` in Attempt 6 was added based on the correct intuition that the scheduler was the problem, but it solved the wrong half: instead of preventing navigation from running during a React update (which `useEffect` already handles), it made navigation interruptible by updates that fire *after* it starts.

**Result**: **Still failing in production** — confirmed 2026-04-27 in two separate cases.

**Case 1**: User on `/app/sessions` → creates concept with new subject + new tag → stays on sessions. Vercel logs show a `GET /app/concepts/{id}` (RSC payload fetch) but no navigation commits.

**Case 2**: User on `/app/concepts/{old-id}` → creates concept `adae20b5-7d57...` → stays on old concept. Vercel logs show `GET /app/concepts/adae20b5...` (RSC fetch) AND `POST /app/concepts/adae20b5...` (getConcept Server Action from ConceptView rendering inside the doomed transition) — proving ConceptView partially rendered before the transition was interrupted and discarded.

**Why Attempt 7 fails**: The `useEffect` guarantees `router.push` runs after React commits, but `router.push` internally uses `startTransition` to apply the RSC payload. That makes the navigation interruptible. The 4× `qc.invalidateQueries` in `useCreateConcept.onSuccess` start refetch network requests BEFORE `handleDone` runs. When any refetch response arrives during the navigation transition, TQ fires a `useSyncExternalStore` notification — a synchronous, high-priority React update that preempts the low-priority `startTransition` navigation. Next.js detects the interruption and silently discards the navigation.

---

## Attempt 8 (current) — 2026-04-27

**What changed**: Added `qc.cancelQueries` calls inside the `useEffect`, immediately before `router.push`, for all four query keys invalidated by `useCreateConcept.onSuccess`.

```typescript
useEffect(() => {
  if (!pendingTarget) return
  if (pendingRedirectRef.current !== pendingTarget) return
  qc.cancelQueries({ queryKey: ['concepts'] })
  qc.cancelQueries({ queryKey: ['subjects'] })
  qc.cancelQueries({ queryKey: ['topics'] })
  qc.cancelQueries({ queryKey: ['tags'] })
  router.push(pendingTarget)
}, [pendingTarget])
```

**Why expected to work**: `cancelQueries` synchronously marks each matching query as cancelled in TQ's internal state. When the in-flight refetch network responses later arrive, TQ checks the cancelled flag and discards the results — no cache update, no `useSyncExternalStore` notification reaches React. With no high-priority updates to interrupt it, the `startTransition`-wrapped navigation runs to completion.

The stale flag (set by `invalidateQueries` in `onSuccess`) survives the cancellation. Queries remain stale and re-fetch automatically on the next component mount or window focus. No data is lost.

Cancelling inside the `useEffect` (rather than in `handleDone`) is more precise: cancel and `router.push` execute synchronously back-to-back with no window for new refetches to start between them.

**Result**: TBD — deployed 2026-04-27.

---

## If Attempt 8 Also Fails — Next Things to Try

1. **`router.replace` instead of `router.push`**: Semantically more correct (form modal state shouldn't be in history). May behave differently internally for edge cases.

2. **Production instrumentation**: Add Sentry/console events before `router.push` and inside ConceptView's `closeConceptForm` effect to trace exactly where the flow breaks.

3. **Hard navigation fallback**: Use `window.location.href = target` instead of `router.push`. Forces a full page reload — guaranteed to work but loses client state.
