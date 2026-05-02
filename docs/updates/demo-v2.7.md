### navigation instructions

I have generated the following ChatGPT instructions for this functionality, however I only skimmed through it, and it is not final, it is just a suggestion, please do not take it as the final word on this.

Let me first explain what we need before adding ChatGPTs instructions.

We need to add navigation and shortcut instructions on every major view (Library, Focus, Index, Search, Concept) so that it is super clear for the user what he can do, especially we need to make it super obvious that this app is about quick reviews using the MVKs

We need to be able to tell users a lot of information about navigation but an extremely concise way using just navigation icons and relevant keywords.

We need to find the best place to place these instructions so that they are in a similar position in all the views. ChatGPT has proposed a place, but feel free to improve or even change that idea based on the actual codebase.

Please assume the role of a UI/UX expert and create a plan on how to implement this, take ChatGPTs suggestion as the suggestion of junior which can be right or wrong, you are the expert.

ChatGPTs instructions may have incorrect details, as it doesnt have the complete or updated view of the codebase.

Please try to maintain the same general style for this feature as the rest of the app, it can have slight differences to make it stand out a little but should match the overall feeling of the app.

Please create a plan for this overriding if necessary, or improving if possible, or otherwise agreeing with ChatGPTs instructions.

# Keyboard Shortcuts Hint Bar Plan

## Goal

Add a small reusable **Shortcuts** hint bar to the main interactive views so keyboard navigation is immediately discoverable without adding clutter.

This hint bar should:

- be visible at a glance
- feel lightweight and modern
- avoid paragraph-style instructions
- use compact keyboard chips with very short labels
- remain consistent across views
- help users discover MVK, concept opening, back navigation, and review count controls

This is not a documentation block.
It is a compact visual legend.

---

## Core UX principle

Do **not** add explanatory sentences like:

- Use up and down arrow keys to navigate between concepts...
- Press space to reveal MVK...

That is too heavy.

Instead, use a small row of keyboard hint chips like:

- `↑ ↓` Navigate
- `Space` MVK
- `Enter` Open
- `⌫` Back
- `+ / -` Review Count

This should feel almost instant to scan.

---

## Component

Create one reusable component:

- **ShortcutsHintBar**

It should accept an array of shortcut items.

Each shortcut item should contain:

- key label
- short action label

Example shape:

- key: `↑ ↓`
- label: `Navigate`

---

## Placement

Place the hint bar in a consistent location across views:

- directly below the page title / count area
- above the main content
- before the primary list / concept content

This keeps it discoverable without making it dominant.

---

## Visual style

The hint bar should be:

- compact
- muted
- horizontally arranged
- able to wrap on smaller screens
- visually lighter than the main cards
- consistent with the app’s modern / sleek style

### Recommended styling direction

- small rounded chips for keys
- short text labels beside each key chip
- subtle border or soft background
- no strong accent colors
- no large icons required unless already available and visually clean

This should feel like interface metadata, not a tutorial.

---

## Heading

Use a very small heading:

- **Shortcuts**

Do not use:

- Keyboard Instructions
- How to Use This View
- Navigation Help

Those are too heavy.

---

## Label naming

Use these exact action labels:

- **Navigate**
- **MVK**
- **Open**
- **Back**
- **Review Count**

### Why “Review Count”

Use **Review Count** for the `+ / -` shortcut.

This is clearer than:

- Review
- Counter
- Reviews

It directly tells the user that `+ / -` changes the review number.

---

## View-specific shortcut sets

### Library view

Show:

- `↑ ↓` Navigate
- `Space` MVK
- `Enter` Open
- `⌫` Back
- `+ / -` Review Count

### Focus view

Show:

- `← →` Navigate
- `+ / -` Review Count

Do not show MVK, Open, or Back here.

Keep Focus simpler.

### Index view

Show:

- `↑ ↓ ← →` Navigate
- `Space` MVK
- `Enter` Open
- `⌫` Back
- `+ / -` Review Count

### Concept view

Show:

- `⌫` Back
- `+ / -` Review Count

Do not show Space or Enter here.

---

## Important consistency rule

The shortcut hint bar must only display actions that actually exist in that specific view.

Do not force identical shortcut sets across all views.

Consistency should come from:

- the same visual component
- the same placement
- the same concise wording

Not from showing the same actions everywhere.

---

## Interaction behavior

This component is display-only.
It does not need its own interaction logic.
It is purely a visual hint layer.

If the user is typing in an input or editor, shortcut behavior should continue to respect the existing logic that avoids triggering shortcuts while editing.

---

## Responsive behavior

On smaller widths:

- allow chips to wrap to the next line
- maintain spacing
- avoid truncating labels if possible

The component should still feel calm and readable on narrow layouts.

---

## Suggested component API

Possible props shape:

- `title?: string`
- `items: Array<{ keyLabel: string, actionLabel: string }>`

Example:

- `{ keyLabel: '↑ ↓', actionLabel: 'Navigate' }`
- `{ keyLabel: 'Space', actionLabel: 'MVK' }`

---

## Suggested rendering structure

A simple structure is enough:

- wrapper
- small “Shortcuts” label
- row of shortcut items

Each item:

- key chip
- short text label

Example visual pattern:

- `[↑ ↓] Navigate`
- `[Space] MVK`
- `[Enter] Open`

---

## Final per-view spec

### Library

**Shortcuts**

- `↑ ↓` Navigate
- `Space` MVK
- `Enter` Open
- `⌫` Back
- `+ / -` Review Count

### Focus

**Shortcuts**

- `← →` Navigate
- `+ / -` Review Count

### Index

**Shortcuts**

- `↑ ↓ ← →` Navigate
- `Space` MVK
- `Enter` Open
- `⌫` Back
- `+ / -` Review Count

### Concept

**Shortcuts**

- `⌫` Back
- `+ / -` Review Count

---

## Design goal

The user should understand the available keyboard controls almost instantly, without having to read a paragraph.

This should improve discoverability while preserving the app’s simplicity.

The final result should feel:

- modern
- quiet
- obvious
- consistent
- non-intrusive

---

## Final instruction

Implement a reusable **ShortcutsHintBar** component and add it to Library, Focus, Index, and Concept views using the exact shortcut sets above.

Keep it compact, muted, and visually consistent with the rest of the app.
