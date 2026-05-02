# TortugaIQ Production — Session Prompts

Copy the relevant prompt at the start of each new Claude Code session.
The two reference files Claude needs are always:
- `tortugaiq-next/CLAUDE.md` — primary production app guidance
- `C:\Users\edgar\.claude\plans\glittery-plotting-shamir.md` — full rebuild plan

---

## Phase 0 — Scaffolding

```
We are building the TortugaIQ production Next.js app. Nothing has been built yet.

Please read `production-planning/tortugaiq-production-version-plan.md` and `C:\Users\edgar\.claude\plans\glittery-plotting-shamir.md` to orient yourself, then implement Phase 0: Scaffolding.

Phase 0 steps:
1. Run: npx create-next-app@latest tortugaiq-next --typescript --tailwind --app --src-dir --import-alias "@/*"
2. Install dependencies: drizzle-orm, drizzle-kit, @neondatabase/serverless, next-auth@beta, @auth/drizzle-adapter, bcryptjs, @types/bcryptjs, zod, @tanstack/react-query, react-markdown, remark-gfm, remark-math, rehype-katex, katex, resend
3. Create drizzle.config.ts and src/db/schema.ts with Auth.js adapter tables only (users, accounts, sessions, verification_tokens)
4. Create .env.example with all required variable names documented
5. Generate and apply the first migration
6. Create src/auth.ts with Google, Facebook, and Credentials providers
7. Create src/app/api/auth/[...nextauth]/route.ts and src/middleware.ts
8. Write tortugaiq-next/CLAUDE.md using the content in Part 8 of the plan file

End goal: OAuth login works end-to-end. Do not proceed to domain code until login is verified.
```

---

## Phase 1 — Domain Schema + Data Layer

```
We are building the TortugaIQ production Next.js app. Phase 0 is complete — Next.js is scaffolded, Auth.js is configured, OAuth login works, and tortugaiq-next/CLAUDE.md exists.

Please read `tortugaiq-next/CLAUDE.md` and `C:\Users\edgar\.claude\plans\glittery-plotting-shamir.md` to orient yourself, then implement Phase 1: Domain Schema + Data Layer.

Phase 1 steps:
1. Add all domain tables to src/db/schema.ts (subjects, topics, tags, concepts, concept_subjects, concept_topics, concept_tags, subject_concept_orders, subject_sort_modes, study_sessions, password_reset_tokens)
2. Run drizzle-kit generate and drizzle-kit migrate
3. Write all Server Actions in src/actions/ (concepts.ts, subjects.ts, study-sessions.ts, auth.ts)
4. Write Zod validation schemas in src/lib/validations.ts
5. Write TypeScript types in src/lib/types.ts

End goal: Full schema in the database, all Server Actions written and type-safe, no UI yet.
```

---

## Phase 2 — Auth Pages UI

```
We are building the TortugaIQ production Next.js app. Phases 0 and 1 are complete — the database schema is in place and all Server Actions are written.

Please read `tortugaiq-next/CLAUDE.md` and `C:\Users\edgar\.claude\plans\glittery-plotting-shamir.md` to orient yourself, then implement Phase 2: Auth Pages UI.

Phase 2 steps:
1. Port SignInPage — real Google/Facebook OAuth buttons + email/password credentials form wired to Auth.js signIn()
2. Port SignUpPage — wired to the signUpWithCredentials Server Action in src/actions/auth.ts
3. Build /forgot-password page — email submission form wired to requestPasswordReset Server Action
4. Build /forgot-password/reset page — token consumption + new password form wired to resetPassword Server Action
5. Create the (auth) route group layout with centered card styling matching the demo app's style

The demo SignInPage and SignUpPage live at ../src/views/SignInPage.jsx and ../src/views/SignUpPage.jsx — use them as the visual reference.

End goal: Full auth flow works — sign up, sign in (credentials + OAuth), sign out, and password recovery via email.
```

---

## Phase 3 — App Shell + Shared Components

```
We are building the TortugaIQ production Next.js app. Phases 0–2 are complete — auth is fully working including password recovery.

Please read `tortugaiq-next/CLAUDE.md` and `C:\Users\edgar\.claude\plans\glittery-plotting-shamir.md` to orient yourself, then implement Phase 3: App Shell + Shared Components.

Phase 3 steps:
1. Build (app)/layout.tsx — AppShell with Sidebar (fixed left, collapsible) and StudySessionBar (fixed top) and main#main-content (scrollable)
2. Port all shared UI components to TypeScript in src/components/ui/:
   - Sidebar.tsx (replace Zustand with useSubjects TanStack Query hook; Auth.js signOut())
   - StudySessionBar.tsx (wire to addStudySession Server Action)
   - ConceptForm.tsx (modal for add/edit concepts — wire to createConcept/updateConcept)
   - MarkdownEditor.tsx (remove imageStore dependency, images feature is disabled)
   - InlineEditor.tsx (split from MarkdownEditor into its own file)
   - FilterSortBar.tsx, ShortcutsHintBar.tsx, StatusBadge.tsx, CreatableMultiSelect.tsx (pure UI ports)
3. Create src/components/providers/SessionProvider.tsx and QueryProvider.tsx
4. Wire both providers into src/app/layout.tsx
5. Create TanStack Query hooks in src/hooks/ (useConcepts.ts, useSubjects.ts, useStudySessions.ts, useFilterSort.ts)

The demo components live in ../src/components/ — use them as the behavioral reference.

End goal: Authenticated users land on /app and see the full app shell (sidebar + top bar) with a working ConceptForm modal.
```

---

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

## Phase 5 — Overview + Marketing Pages

```
We are building the TortugaIQ production Next.js app. Phases 0–4 are complete — all core app views are working.

Please read `tortugaiq-next/CLAUDE.md` and `C:\Users\edgar\.claude\plans\glittery-plotting-shamir.md` to orient yourself, then implement Phase 5: Overview + Marketing Pages.

Phase 5 steps:
1. OverviewView (/app/overview) — server component with three sections: Study (total time, sessions, reviews by subject), Inventory (state distribution, 10 most recent concepts), Catalog (subjects/topics/tags with concept counts). Reference: ../src/views/OverviewView.jsx
2. NotesView (/notes) and PostView (/notes/[slug]) — static Server Components; copy markdown posts from ../src/posts/ to src/posts/; port ../src/utils/posts.js to src/lib/posts.ts using Node fs
3. LandingPage (/) — port ../src/views/LandingPage.jsx; preserve the hero section, "The Idea" section, and overall styling

End goal: All pages are implemented. The app is fully functional from landing page through every authenticated view.
```

---

## Phase 6 — Polish + Deploy

```
We are building the TortugaIQ production Next.js app. Phases 0–5 are complete — the entire app is implemented and functional locally.

Please read `tortugaiq-next/CLAUDE.md` and `C:\Users\edgar\.claude\plans\glittery-plotting-shamir.md` to orient yourself, then guide me through Phase 6: Polish + Deploy.

Phase 6 steps:
1. Audit keyboard navigation in all views — verify SubjectView, ListMode, IndexMode, FocusMode, ConceptView all shortcuts work
2. Add error boundaries around the main content area and key interactive sections
3. Add loading states (suspense boundaries or skeleton UI) for data-fetching views
4. Walk me through setting up the Vercel project:
   - Root directory: tortugaiq-next/
   - Link Neon database via Vercel integration
   - Set all environment variables
   - Configure Google and Facebook OAuth callback URLs for the production domain
5. Run drizzle-kit migrate against the production Neon branch
6. Deploy and verify the production build works

End goal: App is live on Vercel with a production Neon database and working OAuth.
```
