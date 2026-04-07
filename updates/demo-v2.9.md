# TortugaIQ — Index View Redesign Plan (Final)

## Goal

Redesign **only the concept layout / index surface** of the Index view while preserving all existing navigation behavior and keeping the overall TortugaIQ design language intact.

The new Index should:

- feel like a **real textbook index**
- remain clearly distinct from **Library** and **Focus**
- preserve **fast review / fast exposure**
- look **professional, trendy, and sleek**
- feel **structured, calm, and inviting**
- make the user want to keep navigating to the next concept
- preserve and respect the app’s current keyboard navigation model

This is **not** a full page redesign.  
This is primarily a redesign of the **index concept presentation layer**.

---

## Core Product Intent

The Index view is valuable and should stay.

Its purpose is not just “show lots of concepts.”  
Its purpose is:

- **rapid recognition**
- **rapid exposure**
- **lightweight navigation**
- **quick mental contact with many concepts**

The view should feel like:

- a **modern textbook index**
- a **clean editorial scan surface**
- a **reading-oriented interface**
- content-first, not component-first

The view should **not** feel like:

- a dump of tags
- a chip cloud
- a search results page
- a condensed Library view
- a collection of UI pills/buttons competing for attention

---

## Preserve Existing Behavior

The following behaviors must remain unchanged:

- arrow-based navigation
- hover state
- active/focused state
- keyboard navigation
- current “move to concept” interaction model
- if a concept is active, clicking again opens that concept

### MVK Panel Requirement

- The **MVK panel functionality must remain intact**
- For each concept, the user must still be able to view its MVK exactly as currently implemented
- Do **not** modify, redesign, or interfere with MVK panel behavior

---

## Main Design Direction

### Replace “chip cloud” with a “structured editorial index”

The current problem is visual:

- too chaotic
- too random
- not enough structure
- not enough hierarchy
- too “UI-like”
- lacks rhythm

The redesign should move toward:

- **clean text-first entries**
- **row-wise reading**
- **responsive multi-column layout**
- **alphabetic structure**
- **subtle dividers**
- **strong but quiet hierarchy**
- **light interactive states**

---

## Layout Strategy

### Responsive Row-wise Grid

Use a responsive grid:

- **mobile:** 1 column
- **medium screens:** 3 columns
- **large screens:** 5 columns

Important:

- reading flow is **left → right → next row**
- do **not** use column-first reading
- scanning should feel like a **modern reference page**

### Tradeoff

We intentionally trade a small amount of raw speed for:

- clarity
- structure
- aesthetics
- engagement

Even with 5 columns, this remains far faster than Library mode.

---

## Grouping Strategy

### Alphabetical Grouping with Soft Anchors

Concepts are sorted A → Z.

When the first letter changes:

- render a **letter header**
- render a **subtle divider**
- add **extra vertical spacing**

This creates:

- orientation
- structure
- rhythm
- index-like feel

### Non-Alphabetic Concepts (Symbols / Numbers)

All concepts that do **not** start with A–Z should be grouped under a single section:

```
#
2x Rule
100 Days
+ Operator
#hashtag
_private
```

Then continue with:

```
A
B
C
...
```

#### Rules

- If first character is A–Z → group normally
- Otherwise → group under `#`

#### Sorting inside `#`

- numbers first (ascending)
- then symbols (lexicographic)
- then fallback to full string comparison

#### Notes

- do NOT create multiple symbol groups
- do NOT add extra divider lines per symbol
- keep the UI clean and predictable

---

## Visual Hierarchy

### Letter Anchors

Each letter group should feel like a **landmark**:

- slightly larger text
- visually distinct
- spaced clearly
- aligned cleanly with grid

---

### Divider Lines

- used only at letter transitions
- subtle and minimal
- supported by whitespace (not dominant)

---

## Concept Entry Styling

### Remove Chip / Pill Aesthetic

Concepts should no longer look like UI chips.

Instead:

- text-first entries
- lightweight interactive rows
- minimal visual noise

---

### States

#### Default

- plain text
- no heavy borders
- no filled backgrounds
- clean and quiet

#### Hover

- subtle background or contrast change
- light and elegant
- no aggressive styling

#### Active (Focused)

- clearly visible
- feels like a **reading cursor**
- not like a button selection
- supports keyboard navigation strongly

---

## Spacing and Rhythm

### “Breathing Density”

- tight horizontally
- slightly relaxed vertically
- more space at letter transitions

---

### Vertical Rhythm

Pattern should feel like:

```
concept
concept
concept

A
divider

concept
concept
```

This rhythm is critical for scanability and appeal.

---

## Alignment Rules

Ensure:

- clean left alignment
- consistent column spacing
- stable row height
- no layout shifts on interaction
- visual baseline is consistent

---

## Relationship to the App

The Index can feel slightly more editorial, but must still match:

- professional
- trendy
- sleek
- minimal
- modern

It should feel like a **specialized mode within the same system**, not a different product.

---

## Desired Emotional Outcome

The user should feel:

- “this looks organized”
- “this is easy to scan”
- “this feels calm”
- “I want to keep going”
- “this is a serious learning tool”

The view should create **momentum**.

---

## What We Are Not Doing

- not redesigning the full page
- not removing keyboard navigation
- not turning Index into Library
- not keeping chip-cloud layout
- not adding heavy UI components
- not over-decorating
- not fragmenting symbol groups
- not using column-first reading

---

## Implementation Priorities

### High Priority

1. keep navigation logic unchanged
2. replace chip layout with responsive grid
3. implement alphabetical grouping
4. implement `#` group for non-alphabetic entries
5. add letter anchors + dividers
6. redesign concept entries (text-first)
7. refine hover and active states
8. improve spacing and rhythm

### Secondary

9. typography refinement
10. responsive polish
11. visual consistency with app

---

## Acceptance Criteria

The redesign is complete when:

- keyboard navigation works as before
- MVK panel works exactly as before
- scanning is easier than before
- layout feels structured and calm
- Index feels like a real index
- visually appealing and inviting
- clearly different from Library
- consistent with TortugaIQ design language

---

## Design North Star

> Build a calm, elegant, editorial-style index that feels like a modern textbook reference surface, preserves fast navigation, and makes the user want to keep moving through concepts.

---

## Build Order

1. keep all behavior intact
2. refactor rendering layer only
3. implement responsive row-wise grid
4. sort and group concepts
5. insert letter anchors + `#` group
6. redesign entries (remove chips)
7. refine interaction states
8. tune spacing and hierarchy

---

## Final Quality Check

Before finishing:

- Does it feel like a real index?
- Is it more appealing than before?
- Is scanning effortless?
- Does it still feel like TortugaIQ?
- Does navigation feel smooth?
- Do users want to keep going?

If not, continue refining.
