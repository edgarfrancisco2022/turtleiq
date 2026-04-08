## Phase 4 — Core Views

```
We are building the TortugaIQ production Next.js app. Phases 0–3 are complete — the app shell and all shared components are working.

Please read `tortugaiq-next/CLAUDE.md` and `C:\Users\edgar\.claude\plans\glittery-plotting-shamir.md` to orient yourself, then implement Phase 4: Core Views.

Implement views in this order:
1. HomeView (/app) — welcome screen with "New Concept" CTA
2. SubjectView (/app/subjects/[subjectId]) — concepts list with sort modes (alpha/date/custom), filters, keyboard nav (↑↓ Enter Space +/-), custom sort arrows, MVK inline drawer, back-navigation state restoration
3. ConceptView (/app/concepts/[conceptId]) — full concept detail with three MarkdownEditor sections (MVK, Notes, References), state/priority/review/pin controls, keyboard shortcuts (Backspace +/-)
4. ListMode /Library (/app/library) — all concepts with client-side name search, full filter/sort, keyboard nav, MVK drawer, back-navigation state restoration
5. IndexMode (/app/index) — alphabetical pill grid (5-column desktop), visual keyboard navigation, two-click navigation, MVK drawer, back-navigation state restoration
6. FocusMode (/app/focus) — single-concept flipcard, Reveal buttons for MVK/Notes/References, ←/→ navigation

The demo views live in ../src/views/ — they are the behavioral reference. Keyboard shortcuts and back-navigation state restoration (sessionStorage pattern) must be preserved exactly as documented in CLAUDE.md.

End goal: All core app views work with full interactivity matching the demo app.
```

---
