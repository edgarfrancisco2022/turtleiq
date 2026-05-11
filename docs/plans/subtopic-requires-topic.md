# Plan: Subtopic Requires Topic Restriction

## Context

The Topic/Subtopic migration established that a Concept can have at most one Topic and one Subtopic. The upcoming Outline feature relies on a clean Subject → Topic → Subtopic → Concept hierarchy. To guarantee that hierarchy is always traversable, any Concept that has a Subtopic must also have a Topic — otherwise the Subtopic floats disconnected from the hierarchy chain. This restriction is enforced in the UI (ConceptForm) and server-side (validation schema).

---

## Implementation

### 1. `src/components/ui/CreatableMultiSelect.tsx`
Added `disabled?: boolean` and `disabledMessage?: string` props. When `disabled`:
- The trigger container gets `cursor-not-allowed bg-gray-50` styling
- `tabIndex` is set to `-1` (skipped in tab order)
- Click and keyboard handlers are suppressed
- The `disabledMessage` replaces the regular placeholder text
- The chevron / "remove to change" footer is hidden

### 2. `src/components/ui/ConceptForm.tsx`
Two changes:
- **Topic onChange**: when the topic is cleared, also clear `selSubtopic` automatically
- **Subtopic field**: `disabled={!selTopic}` + `disabledMessage="Select a topic first to add a subtopic"`

### 3. `src/lib/validations.ts`
Added a `.refine()` to `conceptInputSchema`:
```typescript
.refine(
  (data) => data.subtopicName === null || data.topicName !== null,
  { message: 'A topic is required when a subtopic is selected', path: ['subtopicName'] }
)
```
This fires in both `createConcept` and `updateConcept` (both call `conceptInputSchema.parse()`), serving as a server-side safety net.

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/ui/CreatableMultiSelect.tsx` | Added `disabled` + `disabledMessage` props |
| `src/components/ui/ConceptForm.tsx` | Auto-clear subtopic on topic clear; disable subtopic when no topic |
| `src/lib/validations.ts` | Added `.refine()` to `conceptInputSchema` |
| `architecture/08-views-and-components.md` | Updated ConceptForm and CreatableMultiSelect docs |
