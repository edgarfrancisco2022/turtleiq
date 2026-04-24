# Markdown Editor — Redirect on Save

## The Bug

**Components**: `src/components/ui/MarkdownEditor.tsx`, `src/app/(app)/app/concepts/[conceptId]/page.tsx`, `src/hooks/useConcepts.ts`

**Symptom**: When a user saves markdown content in a ConceptView editor (MVK, Notes, or References), the save succeeds (data is persisted to the database) but the app unexpectedly redirects to a previous concept view instead of remaining on the current one.

**Intermittency**: Appears intermittent. More reproducible if the user holds the Backspace key while clicking Save (e.g., deleting content right before saving).

**Not a UX-cancel**: The user intentionally clicked Save. The data is persisted. The redirect is unintended.

---

## Root Cause

Two mechanisms interact to produce this bug.

### Mechanism A — Stale Backspace keydown after textarea unmounts (primary)

`handleSave()` in `MarkdownEditor.tsx` runs:

```typescript
function handleSave() {
  setDirty(false)     // 1. clears dirty flag — isDirty is now false
  onSave(draft)       // 2. fires mutation
  setIsEditing(false) // 3. removes textarea from DOM
}
```

If the user held Backspace (deleting characters) and then clicked Save without releasing the key:

1. The textarea unmounts in step 3
2. The browser fires another keydown for the still-held Backspace, but `e.target` is now `body` (focus moved when the textarea was removed)
3. ConceptView's document-level keyboard listener checks `e.target.tagName` — `BODY` is not `INPUT/TEXTAREA/SELECT` — so the guard passes
4. `isDirty` is already `false` (cleared in step 1), so `requestNavigation` immediately calls `router.back()`
5. User is redirected to the previous entry in browser history

This explains the "previous concept view" destination — it is exactly `router.back()` behavior.

### Mechanism B — Overly broad `invalidateQueries` (secondary, may be independent)

`useUpdateConceptContent.onSuccess` was firing:

```typescript
qc.invalidateQueries({ queryKey: ['concepts'] })    // broadcasts to ALL concept queries
qc.invalidateQueries({ queryKey: ['concepts', id] })
```

Content fields (mvkNotes, markdownNotes, referencesMarkdown) are not displayed in list views (SubjectView, Library, IndexMode). The broad `['concepts']` invalidation is incorrect and creates unnecessary React update batches. In the React 19 + Next.js 15 + TanStack Query v5 environment, these extra batches interact with the same race condition that drives the redirect-new-concept-navigation bug (see that doc), potentially causing stale `pendingTarget` state in `ConceptFormProvider` to trigger an unintended `router.push`.

---

## Fix — Attempt 1 (current) — 2026-04-24

Three targeted changes were made:

### 1. Stop Backspace from bubbling out of the textarea (`MarkdownEditor.tsx`)

```typescript
function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === 'Backspace') {
    e.stopPropagation()
  }
  if (e.key === 'Tab') { ... }
}
```

`stopPropagation` prevents the document-level listener in ConceptView from ever receiving Backspace events that originated in the textarea, covering both the steady-state case and the stale-keydown-after-unmount case.

### 2. Narrow `useUpdateConceptContent` invalidation (`useConcepts.ts`)

```typescript
onSuccess: (_, { id }) => {
  // Removed: qc.invalidateQueries({ queryKey: ['concepts'] })
  qc.invalidateQueries({ queryKey: ['concepts', id] })
},
```

Only the individual concept's cache entry is invalidated. The list cache is unaffected, eliminating the unnecessary React update batch.

### 3. Belt-and-suspenders: `isPending` guard in keyboard listener (`concepts/[conceptId]/page.tsx`)

```typescript
if (updateContentMut.isPending) return
```

Added to ConceptView's keyboard handler before any navigation action. Prevents back-navigation while a content save mutation is in-flight, covering any remaining timing window between `setDirty(false)` and `setIsEditing(false)`.

**Result**: TBD — deployed 2026-04-24.

---

## Relationship to redirect-new-concept-navigation Bug

Both bugs are rooted in the same environment sensitivity (React 19 concurrent scheduler + Next.js 15 App Router + TanStack Query v5). The fixes were deployed together:

- This bug's fixes (Mechanisms A and B above) are independent of `ConceptFormProvider`
- The redirect-new-concept-navigation Attempt 6 fix (`startTransition`) was deployed at the same time but is a separate change
