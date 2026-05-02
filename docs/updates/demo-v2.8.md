### Adding markdown help feature

The following instructions are by ChatGPT, please create a plan improving on this idea, or coming up with a better one.

We need to create a Markdown Help feature, that is intuitive and simple. The design should match the general design of the app, it should be professional, modern and sleek.

Please verify that ChatGPTs instructions make sense, adapt the plan so that everything makes sense in the context of this codebase

# Markdown Help Panel Feature Plan

## Goal

Add a **right-side Markdown Help panel** to the Markdown editors so users can quickly learn the syntax without leaving the app.

This feature should:

- keep the editor UI clean
- avoid repetitive instructional text in every editor header
- teach users the most important Markdown basics
- explain math syntax used in the app
- explain standard image syntax
- keep the user inside the app
- include a link to a full external Markdown guide at the bottom

This panel should feel like a **lightweight in-app reference**, not a tutorial and not a large documentation page.

---

## Why this feature matters

Markdown is one of the core features of the app.

The app is not only a learning app, but also partly a **Markdown-based note-taking environment**.
Because of that, users need a simple way to learn the basics without friction.

The help panel should communicate this clearly and simply:

**Markdown is simple, portable, and works naturally with AI tools.**

That sentence should appear near the top of the panel.

---

## High-level UX direction

### Do not do this

- Do not place long Markdown guidance text directly inside every editor header
- Do not show a large popup automatically
- Do not force the user through a tutorial
- Do not render a giant formal cheat sheet table
- Do not overload the panel with too much explanation

### Do this instead

- Add a small **Markdown Help** trigger in the editor header
- Open a **right-side help panel**
- Show a clean stacked list of the most useful syntax examples
- Keep examples concise and highly scannable
- Include a full external guide link at the bottom

---

## Scope

This feature should apply to the Markdown editing experience wherever the app uses the shared Markdown editor pattern.

At minimum:

- Concept notes editor
- Other concept-related Markdown editors that reuse the shared Markdown editor UI
- If the MVK editor uses the same editor system, keep the interaction consistent there too

The help surface should feel like part of the editor system, not a one-off feature.

---

## Trigger / entry point

### Label

Use this exact label:

**Markdown Help**

This is clearer than:

- Help
- Formatting
- Editor Help

The user should immediately know what the link/button is for.

### Placement

Place the **Markdown Help** trigger in the editor header area.

Ideal location:

- near existing editor controls
- visible but subtle
- not visually dominant

It should feel like a natural companion to:

- code / preview toggle
- edit / save / cancel controls

---

## Panel behavior

### Open behavior

- Clicking **Markdown Help** opens a right-side panel
- The panel should appear within the app UI, not as a browser popup
- The editor should remain visible so the user can reference help while writing

### Close behavior

- The panel should be easy to close
- A standard close button is enough
- If the app already has a panel / drawer pattern, reuse it

### Interaction philosophy

The panel is meant to support writing while staying in context.
The user should be able to:

- open help
- glance at syntax
- continue typing
- switch between editor and help naturally

---

## Panel title

Use:

**Markdown Help**

---

## Intro sentence

At the top of the panel, show this sentence:

**Markdown is simple, portable, and works naturally with AI tools.**

This sentence should be short, visually subtle, and immediately below the title or near the top section.

Do not add more marketing copy than this.

---

## Panel structure

The panel should be divided into 3 parts:

1. **Basics**
2. **Math**
3. **Full Guide Link**

This keeps the panel focused and easy to scan.

---

## Basics section

### Section title

**Basics**

### Presentation style

Do not use a giant table.

Instead, render a clean vertical list of items.
Each item should contain:

- a short label
- a small syntax example block

This should feel modern and readable.

### Example visual pattern

- Label: **Heading**
- Small code block underneath

This is much easier to scan than a two-column table.

---

## Basics items

Show the following items in this exact order.

### Heading

    # H1
    ## H2
    ### H3

### Bold

    **bold text**

### Italic

    *italicized text*

### Highlight

    ==very important words==

### Blockquote

    > blockquote

### Ordered List

    1. First item
    2. Second item
    3. Third item

### Unordered List

    - First item
    - Second item
    - Third item

### Task List

    - [x] Write the press release
    - [ ] Update the website
    - [ ] Contact the media

### Code

    `code`

### Horizontal Rule

    ---

### Link

    [title](https://www.example.com)

### Image

    ![alt text](image.jpg)

---

## Why this order

This order is intentional and should be preserved because it moves from:

- text structure
- text emphasis
- text blocks
- lists
- inline formatting
- separators
- references/media

That makes the panel feel intuitive and progressively organized.

---

## Math section

### Section title

**Math**

Because the app supports LaTeX / math rendering, this needs its own dedicated section.

Users should see both:

- inline math
- block math

### Inline Math

    $x^2$

### Block Math

    $$
    \int_0^1 x^2 \, dx
    $$

### Optional supporting note

If a tiny note is helpful, keep it short:

- Use single `$` for inline math
- Use double `$$` for block math

Do not add a long explanation.

---

## Full guide link

### Footer link

At the bottom of the panel, add a link with this exact text:

**Open full Markdown guide**

This should open the full external Markdown guide / cheat sheet in a new tab.

This link is meant for users who want more than the in-app reference provides.

---

## Content rules

### Keep

- short labels
- small syntax examples
- clean spacing
- calm, minimal wording

### Avoid

- long paragraphs
- academic explanations
- too much theory about Markdown
- too many advanced syntaxes beyond the current essentials
- duplicate explanations in every editor body/header

The panel should feel like a **reference surface**, not a lesson.

---

## Visual design guidance

### Desired feel

The panel should feel:

- modern
- sleek
- simple
- quiet
- useful
- easy to scan

### Layout guidance

- vertically scrollable if needed
- clean section spacing
- small but readable code examples
- labels clearly separated from code blocks
- enough spacing so the panel does not feel cramped

### Code example styling

Each syntax example should appear in a compact code-style block or syntax container.
It should be very easy to copy visually.

Avoid making the examples too large or overly decorated.

---

## Consistency guidance

This feature should visually align with the rest of the app.

It should not feel like:

- a foreign documentation screen
- a blog article
- a marketing popup

It should feel like a natural extension of the Markdown editing workflow.

---

## Suggested component structure

Possible components:

- `MarkdownHelpPanel`
- `MarkdownHelpSection`
- `MarkdownHelpItem`

### Suggested responsibilities

#### MarkdownHelpPanel

- right-side drawer/panel container
- title
- intro sentence
- sections
- footer link

#### MarkdownHelpSection

- section title
- list of help items

#### MarkdownHelpItem

- item label
- syntax example block

This keeps the feature modular and maintainable.

---

## Suggested data structure

A simple data-driven approach is preferred.

For example:

- section title
- array of items
- each item has:
  - label
  - example text

This will make the panel easier to maintain and extend later.

---

## Suggested basics data

Use content equivalent to this:

- Heading → `# H1 / ## H2 / ### H3`
- Bold → `**bold text**`
- Italic → `*italicized text*`
- Highlight → `==very important words==`
- Blockquote → `> blockquote`
- Ordered List → numbered list
- Unordered List → bullet list
- Task List → checkbox syntax
- Code → inline code syntax
- Horizontal Rule → `---`
- Link → Markdown link syntax
- Image → Markdown image syntax

---

## Suggested math data

Use content equivalent to this:

- Inline Math → `$x^2$`
- Block Math → `$$ ... $$`

---

## Future-friendly note

This panel should be easy to extend later if needed.

Possible future additions:

- app-specific image reference examples
- internal image hosting notes
- preview-specific reminders
- app-specific Markdown conventions

But for now, keep the first version focused on:

- core Markdown
- math
- external full guide link

---

## Accessibility / usability guidance

- panel should be keyboard accessible
- close button should be obvious
- focus behavior should be reasonable if your UI already handles drawers/panels
- external guide link should be clearly labeled

No extra complexity is needed beyond basic good UI behavior.

---

## Final microcopy summary

### Trigger

**Markdown Help**

### Panel title

**Markdown Help**

### Intro sentence

**Markdown is simple, portable, and works naturally with AI tools.**

### Section titles

- **Basics**
- **Math**

### Footer link

**Open full Markdown guide**

---

## Final instruction

Implement a reusable right-side **Markdown Help** panel for the Markdown editor.

The panel should:

- open from a **Markdown Help** trigger in the editor header
- explain the core Markdown basics using short labeled syntax examples
- include a dedicated **Math** section for inline and block LaTeX syntax
- include a footer link to a full external Markdown guide
- remain clean, modern, simple, and easy to scan

This feature should help users learn Markdown inside the app without cluttering the editor UI.
