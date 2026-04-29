# MVK panel edit save bug

## The Bug

On the MVK panel, when in edit mode, after adding changes and trying to save, the new changes are not displayed, we have to refresh the page or navigate to the concept view to see the changes. We need to be able to see the changes on the MVK Panel itself. Please lets try to fix this, and document on this bug report the fix attempt, as we are doing in other bug reports.

## Affected Views

All three views that render `MvkDrawer` are affected:
- `SubjectView` (`src/app/(app)/app/subjects/[subjectId]/page.tsx`)
- `Library / ListMode` (`src/app/(app)/app/library/page.tsx`)
- `IndexMode` (`src/app/(app)/app/index/page.tsx`)

All three derive `focusedConcept` from `allConcepts` (the `['concepts']` list cache) and pass `focusedConcept.mvkNotes` into `MvkDrawer`. All three call `useUpdateConceptContent()` for the `onSave` handler.

## Root Cause

`focusedConcept` in each view is derived from `allConcepts` — the `['concepts']` list cache returned by `useConcepts()`. `MvkDrawer` reads `focusedConcept.mvkNotes` from that list.

When the user saved MVK notes, `useUpdateConceptContent` (in `src/hooks/useConcepts.ts`) only invalidated the per-concept query `['concepts', id]` with `refetchType: 'none'` — it never touched the `['concepts']` list cache. So `focusedConcept.mvkNotes` stayed stale and the panel showed the old value until a page refresh or remount caused the stale query to refetch.

## Fix (attempt 1) — 2026-04-28

**File:** `src/hooks/useConcepts.ts` — `useUpdateConceptContent`

Added an optimistic update that patches the `['concepts']` list cache immediately on mutate, the same pattern used by `useUpdateConceptField`. This makes `focusedConcept.mvkNotes` update synchronously the moment the user hits Save. Because all three views share the same hook, the fix covers SubjectView, Library, and IndexMode in one change.

- `onMutate`: cancel in-flight list queries, snapshot previous data, write the new field value into the list cache.
- `onError`: rollback to the snapshot if the server action fails.
- `onSettled`: mark `['concepts', id]` stale with `refetchType: 'none'` (kept to preserve the existing workaround for the startTransition navigation race condition documented in `markdown-editor-redirect-on-save.md` Attempt 2 and `redirect-new-concept-navigation.md` Attempt 9).

**Compatibility with existing fixes:**
- `onMutate`'s `cancelQueries` and `setQueryData` are pure in-memory operations — no network requests are started, so no refetch response can arrive mid-navigation to interrupt the RSC transition.
- `onSettled` retains `refetchType: 'none'`, so the content save server action resolving mid-navigation also cannot start a new network request that would trigger a `useSyncExternalStore` notification and preempt `startTransition`.
- `useCreateConcept` is unchanged — the Attempt 9 fix on that hook is unaffected.

## Fix (attempt 2) — 2026-04-28

**File:** `src/hooks/useConcepts.ts` — `useUpdateConceptContent`

Attempt 1 patched the `['concepts']` list cache in `onMutate`, which fixed the MVK panel in SubjectView/Library/IndexMode (those views derive `focusedConcept` from the list). However, ConceptView reads its concept from a *separate* cache entry — `['concepts', id]` — via `useConcept(id)`. That entry was never updated on save, so all three MarkdownEditors in ConceptView (MVK, Notes, References) showed stale content after clicking Save until the user refreshed.

Extended `onMutate` to also snapshot and write the new field value into `['concepts', id]`. Extended `onError` to rollback that snapshot. `onSettled` is unchanged.

- `onMutate`: snapshot `prevSingle = getQueryData(['concepts', id])`, then `setQueryData(['concepts', id], old => old ? { ...old, [field]: value } : old)`
- `onError`: rollback `['concepts', id]` using `prevSingle` from context (in addition to the existing list rollback); destructures `id` from `variables` instead of ignoring it
- `onSettled`: unchanged — `refetchType: 'none'` on `['concepts', id]` is preserved

**Compatibility with existing fixes:**
- `onSettled` is untouched — `refetchType: 'none'` continues to prevent the content-save server action response from arriving mid-navigation and interrupting `startTransition` (markdown-editor-redirect-on-save.md Attempt 2).
- The new `setQueryData(['concepts', id], ...)` is a pure in-memory write — no network request is started, so no refetch response can arrive mid RSC transition (redirect-new-concept-navigation.md Attempt 9 is unaffected).
- `cancelQueries({ queryKey: ['concepts'] })` already cancels `['concepts', id]` via TanStack Query's default prefix matching, so in-flight single-concept fetches are cancelled before both patches are written — consistent with Attempt 1's list-cache cancellation.
- `useCreateConcept` is unchanged.
