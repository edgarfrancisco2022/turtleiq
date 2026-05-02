# TortugaIQ Production Rebuild Plan

## Context

The current TortugaIQ demo app is a React + Vite frontend-only app with localStorage persistence and a client-side plaintext-password auth system. The goal is to rebuild it as a production-grade Next.js full-stack app with a real PostgreSQL database, robust authentication (OAuth + email/password with recovery), and strict per-user data isolation — while preserving the UI and all UX behaviors exactly.

This plan covers three things:

1. How to restructure the workspace so both apps coexist
2. What to build and in what order
3. A comprehensive CLAUDE.md for the production app

---

## Part 1: Workspace Restructuring

The Next.js app lives as a subdirectory inside the existing workspace. **No existing demo files are moved or modified.**

```
learning-app-experimental/          ← workspace root (unchanged)
├── CLAUDE.md                       ← update to mention both apps
├── src/                            ← demo app source (untouched)
├── package.json                    ← demo app (untouched)
├── app-design.md, landing-page.md  ← untouched
├── production-planning/            ← untouched
│
└── tortugaiq-next/                 ← NEW: Next.js production app
    ├── CLAUDE.md                   ← primary Claude guidance for prod app
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── drizzle.config.ts
    ├── .env.local                  ← gitignored
    ├── .env.example                ← committed
    └── src/
        └── ...
```

**Running both locally:** Demo: `npm run dev` from workspace root (port 5173). Production: `npm run dev` from `tortugaiq-next/` (port 3000). They are fully independent — no shared `node_modules`, no monorepo tooling needed.

**Update to root CLAUDE.md:** Add a brief section explaining the two apps and directing Claude to `tortugaiq-next/CLAUDE.md` for all production work.

---

## Part 2: Production Next.js Folder Structure

```
tortugaiq-next/src/
├── app/
│   ├── layout.tsx                      ← root layout: fonts, global CSS, providers
│   ├── globals.css
│   ├── page.tsx                        ← LandingPage (/)
│   ├── (marketing)/                    ← route group: public pages, marketing layout
│   │   ├── layout.tsx
│   │   └── notes/
│   │       ├── page.tsx                ← NotesView
│   │       └── [slug]/page.tsx         ← PostView
│   ├── (auth)/                         ← route group: auth pages, centered layout
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── forgot-password/
│   │       ├── page.tsx                ← request reset
│   │       └── reset/page.tsx          ← consume token + set new password
│   ├── (app)/                          ← route group: authenticated shell
│   │   ├── layout.tsx                  ← AppShell: Sidebar + StudySessionBar + main
│   │   └── app/
│   │       ├── page.tsx                ← HomeView
│   │       ├── subjects/[subjectId]/page.tsx
│   │       ├── concepts/[conceptId]/page.tsx
│   │       ├── library/page.tsx
│   │       ├── focus/page.tsx
│   │       ├── index/page.tsx
│   │       └── overview/page.tsx
│   └── api/auth/[...nextauth]/route.ts ← Auth.js handler
│
├── auth.ts                             ← Auth.js config
├── middleware.ts                       ← protect /app/* routes
│
├── db/
│   ├── index.ts                        ← drizzle client (neon serverless)
│   ├── schema.ts                       ← single source of truth for all tables
│   └── migrations/                     ← generated SQL, committed to git
│
├── actions/                            ← all Server Actions (the API layer)
│   ├── concepts.ts
│   ├── subjects.ts
│   ├── study-sessions.ts
│   └── auth.ts
│
├── components/
│   ├── ui/                             ← pure presentational client components
│   │   ├── Sidebar.tsx
│   │   ├── StudySessionBar.tsx
│   │   ├── ConceptForm.tsx
│   │   ├── MarkdownEditor.tsx
│   │   ├── InlineEditor.tsx
│   │   ├── FilterSortBar.tsx
│   │   ├── ShortcutsHintBar.tsx
│   │   ├── StatusBadge.tsx
│   │   └── CreatableMultiSelect.tsx
│   └── providers/
│       ├── SessionProvider.tsx
│       └── QueryProvider.tsx
│
├── hooks/
│   ├── useFilterSort.ts                ← pure client-side filter/sort (port from demo)
│   ├── useConcepts.ts                  ← TanStack Query: concepts CRUD
│   ├── useSubjects.ts                  ← TanStack Query: subjects + sort
│   └── useStudySessions.ts
│
├── lib/
│   ├── types.ts                        ← all TypeScript interfaces + enums
│   ├── validations.ts                  ← Zod schemas
│   ├── utils.ts                        ← formatMinutes, groupByLetter, etc.
│   └── posts.ts                        ← static blog loader (fs-based, server-only)
│
└── posts/                              ← markdown blog posts (copy from demo)
```

---

## Part 3: Key Technical Decisions

| Decision                  | Choice                      | Reason                                                         |
| ------------------------- | --------------------------- | -------------------------------------------------------------- |
| Session strategy          | Database sessions (not JWT) | Instant revocation; simpler reasoning; Neon is fast            |
| ORM                       | Drizzle ORM + Drizzle Kit   | TypeScript-native, SQL-transparent, excellent migration DX     |
| API layer                 | Server Actions only         | No API route boilerplate; type-safe; works with TanStack Query |
| Client caching            | TanStack Query v5           | Optimistic updates reproduce the instant Zustand-feel          |
| Password hashing          | bcryptjs (12 rounds)        | Industry standard; works in Edge runtime                       |
| Email (password recovery) | Resend                      | Simple API, generous free tier, built for transactional        |

---

## Part 4: Database Schema (summary)

Full Drizzle schema in `src/db/schema.ts`. Tables:

**Auth (required by Auth.js Drizzle adapter):** `users`, `accounts`, `sessions`, `verification_tokens`

**Password recovery (custom):** `password_reset_tokens`

**Domain tables:**

- `subjects`, `topics`, `tags` — each with `(userId, name)` unique constraint (no duplicates per user)
- `concepts` — core entity: `id, userId, name, mvkNotes, markdownNotes, referencesMarkdown, state, priority, reviewCount, pinned, createdAt, updatedAt`
- `concept_subjects`, `concept_topics`, `concept_tags` — M:M junction tables with cascade deletes
- `subject_concept_orders` — `(userId, subjectId, conceptId, position)` for custom sort
- `subject_sort_modes` — `(userId, subjectId, mode)` preference per subject
- `study_sessions` — `(id, userId, minutes, subjectId?, createdAt)`

Every user-owned table has `userId` as a non-nullable FK to `users.id` with `ON DELETE CASCADE`.

---

## Part 5: Authentication Design

- **Auth.js v5** with `DrizzleAdapter` for database session management
- **Google OAuth** — `next-auth/providers/google`
- **Facebook OAuth** — `next-auth/providers/facebook`
- **Credentials** — email + bcrypt password; `authorize()` in `src/auth.ts`
- **Sign-up** — dedicated Server Action in `src/actions/auth.ts` (Auth.js does not handle sign-up for credentials)
- **Password recovery** — crypto token → stored in `password_reset_tokens` → email via Resend → `/forgot-password/reset?token=...` page → validate + hash + update
- **Middleware** (`src/middleware.ts`) — redirects unauthenticated requests for `/app/*` to `/sign-in`

---

## Part 6: Server Action Pattern (Security Contract)

Every Server Action must:

```typescript
const session = await auth();
if (!session?.user?.id) throw new Error("Unauthorized");
const userId = session.user.id;
// All DB queries: ...where(eq(table.userId, userId))
```

Never accept `userId` from the client. Never skip the ownership check.

---

## Part 7: Implementation Phases

### Phase 0 — Scaffolding

1. `npx create-next-app@latest tortugaiq-next --typescript --tailwind --app --src-dir --import-alias "@/*"`
2. Install: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `next-auth@beta`, `@auth/drizzle-adapter`, `bcryptjs`, `@types/bcryptjs`, `zod`, `@tanstack/react-query`, `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`, `katex`, `resend`
3. Create `drizzle.config.ts`, `src/db/schema.ts` (Auth.js tables only)
4. Create `.env.example` with all variable names documented
5. Generate and apply first migration
6. Configure `src/auth.ts` with all three providers
7. Create `src/app/api/auth/[...nextauth]/route.ts` and `src/middleware.ts`
8. **Verify OAuth login works end-to-end before touching domain code**

### Phase 1 — Domain Schema + Data Layer

1. Add all domain tables to `schema.ts`
2. Generate and apply migration
3. Write all Server Actions in `src/actions/`
4. Write Zod schemas in `src/lib/validations.ts`
5. Write TypeScript types in `src/lib/types.ts`

### Phase 2 — Auth Pages UI

1. Port `SignInPage.jsx` → real OAuth buttons + credentials form wired to Auth.js
2. Port `SignUpPage.jsx` → wire to `signUpWithCredentials` Server Action
3. Build `/forgot-password` and `/forgot-password/reset` pages

### Phase 3 — App Shell + Shared Components

1. Build `(app)/layout.tsx` with Sidebar, StudySessionBar
2. Port all shared UI components to TypeScript
3. Set up `QueryProvider` and `SessionProvider` in root layout

### Phase 4 — Core Views (in this order)

1. HomeView (trivial)
2. ConceptForm modal (create/edit)
3. SubjectView (with sort modes, keyboard nav, MVK drawer)
4. ConceptView (full page with MarkdownEditor sections)
5. ListMode / Library
6. IndexMode (visual grid nav)
7. FocusMode (flipcard carousel)

### Phase 5 — Overview + Marketing Pages

1. OverviewView (server component, aggregate queries)
2. NotesView + PostView (static blog)
3. LandingPage (port marketing page)

### Phase 6 — Polish + Deploy

1. Verify all keyboard navigation
2. Add error boundaries and loading states
3. Set up Vercel project (root directory: `tortugaiq-next/`)
4. Link Neon database, set env vars in Vercel
5. Run `drizzle-kit migrate` against production Neon branch
6. Deploy

---

## Part 8: CLAUDE.md for Production App

The file below should be written to `tortugaiq-next/CLAUDE.md`:

---

````markdown
# CLAUDE.md — TortugaIQ Production App

This is the primary reference for Claude Code working on this app. Read it before writing any code.

---

## What Is TortugaIQ

TortugaIQ is a personal knowledge management app for long-term learning. The core unit is the **Concept** — a named piece of knowledge with:

- An **MVK** (Minimum Viable Knowledge): the smallest useful representation
- Full markdown notes and references
- Metadata: subjects, topics, tags, state, priority, review count, pin status

This is NOT a flashcard or spaced-repetition app. Users navigate their concepts manually and track their own progress. The design philosophy: simple, fast, long-term maintainable.

The demo app (React + Vite) lives at `../` (workspace root). When you need to understand a UX behavior or edge case, read the corresponding `.jsx` file there. Key demo files:

- `../src/store/useStore.js` — all business logic (addConcept, resolveNames, pruneCollections, moveConceptInSubject)
- `../src/views/SubjectView.jsx` — keyboard nav, back-navigation state, MVK drawer
- `../src/views/IndexMode.jsx` — visual grid navigation algorithm
- `../src/hooks/useFilterSort.js` — filter/sort logic to port

---

## Tech Stack

| Layer       | Choice                                      |
| ----------- | ------------------------------------------- |
| Framework   | Next.js 15, App Router, TypeScript (strict) |
| Database    | PostgreSQL on Neon (serverless)             |
| ORM         | Drizzle ORM + Drizzle Kit                   |
| Auth        | Auth.js v5 (NextAuth)                       |
| Client data | TanStack Query v5                           |
| Validation  | Zod                                         |
| Styling     | Tailwind CSS v3 + @tailwindcss/typography   |
| Email       | Resend                                      |
| Deploy      | Vercel                                      |

---

## Setup & Commands

```bash
# From the tortugaiq-next/ directory:
npm install
cp .env.example .env.local    # fill in all values
npm run dev                    # localhost:3000
npm run build
npm run lint

# Database
npx drizzle-kit generate      # generate migration after changing schema.ts
npx drizzle-kit migrate       # apply pending migrations to DATABASE_URL
npx drizzle-kit studio        # visual schema browser (optional)
```
````

### Required environment variables (.env.example documents all)

```
DATABASE_URL=               # Neon connection string (pooled)
NEXTAUTH_SECRET=            # openssl rand -base64 32
NEXTAUTH_URL=               # http://localhost:3000 (dev) | production URL (prod)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=          # e.g. noreply@tortugaiq.com
```

---

## Data Model

### TypeScript Types (`src/lib/types.ts`)

```typescript
export type ConceptState =
  | "NEW"
  | "LEARNING"
  | "REVIEWING"
  | "MEMORIZING"
  | "STORED";
export type ConceptPriority = "LOW" | "MEDIUM" | "HIGH";
export type SubjectSortMode = "alpha" | "date" | "custom";

export interface Subject {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Topic {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Concept {
  id: string;
  userId: string;
  name: string;
  mvkNotes: string;
  markdownNotes: string;
  referencesMarkdown: string;
  state: ConceptState;
  priority: ConceptPriority;
  reviewCount: number;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Joined fields (populated by query, not stored in concepts table)
  subjectIds: string[];
  topicIds: string[];
  tagIds: string[];
}

export interface StudySession {
  id: string;
  userId: string;
  minutes: number;
  subjectId: string | null;
  createdAt: Date;
}

// Input types for mutations (names, not IDs — server resolves/creates)
export interface ConceptInput {
  name: string;
  subjectNames: string[];
  topicNames: string[];
  tagNames: string[];
}
```

### Database Tables (`src/db/schema.ts`)

| Table                    | Purpose                                                    |
| ------------------------ | ---------------------------------------------------------- |
| `users`                  | Auth.js adapter + `passwordHash` column extension          |
| `accounts`               | OAuth provider accounts (Auth.js)                          |
| `sessions`               | Database sessions (Auth.js)                                |
| `verification_tokens`    | Email verification (Auth.js)                               |
| `password_reset_tokens`  | Password recovery flow                                     |
| `subjects`               | User subjects — unique `(userId, name)` constraint         |
| `topics`                 | User topics — unique `(userId, name)`                      |
| `tags`                   | User tags — unique `(userId, name)`                        |
| `concepts`               | Core entity                                                |
| `concept_subjects`       | M:M concept ↔ subject (cascade delete)                     |
| `concept_topics`         | M:M concept ↔ topic (cascade delete)                       |
| `concept_tags`           | M:M concept ↔ tag (cascade delete)                         |
| `subject_concept_orders` | Custom sort positions per `(userId, subjectId, conceptId)` |
| `subject_sort_modes`     | Sort mode preference per `(userId, subjectId)`             |
| `study_sessions`         | Study time log                                             |

Every user-owned table has `userId` as a non-nullable FK to `users.id ON DELETE CASCADE`.

---

## Routes

### Public

| Route                    | View               | Notes                                     |
| ------------------------ | ------------------ | ----------------------------------------- |
| `/`                      | LandingPage        | Marketing page, hero + "The Idea" section |
| `/notes`                 | NotesView          | Static blog list                          |
| `/notes/[slug]`          | PostView           | Blog post                                 |
| `/sign-in`               | SignInPage         | Credentials + Google + Facebook           |
| `/sign-up`               | SignUpPage         | Registration                              |
| `/forgot-password`       | ForgotPasswordPage | Request reset email                       |
| `/forgot-password/reset` | ResetPasswordPage  | Token validation + new password           |

### App (require auth — middleware redirects to /sign-in)

| Route                       | View         | Notes                       |
| --------------------------- | ------------ | --------------------------- |
| `/app`                      | HomeView     | Welcome + "New Concept" CTA |
| `/app/subjects/[subjectId]` | SubjectView  | Concepts in a subject       |
| `/app/concepts/[conceptId]` | ConceptView  | Full concept detail         |
| `/app/library`              | ListMode     | All concepts, searchable    |
| `/app/focus`                | FocusMode    | Flipcard carousel           |
| `/app/index`                | IndexMode    | Alphabetical pill grid      |
| `/app/overview`             | OverviewView | Stats dashboard             |

### App Shell Layout (`(app)/layout.tsx`)

Renders: `Sidebar` (fixed left, collapsible) + `StudySessionBar` (fixed top) + `main#main-content` (scrollable). `ConceptForm` modal rendered at shell level so it can be triggered from any view.

---

## View Behaviors & Keyboard Shortcuts

### SubjectView (`/app/subjects/[subjectId]`)

- Sort modes: `alpha`, `date`, `custom`
- Filters: topic, tag, state, priority, pinned
- Keyboard (outside inputs): `↑↓` navigate rows, `Enter` open, `Space` toggle MVK drawer, `+/=` increment review, `-` decrement review, `Backspace` back
- Custom sort arrows only visible when mode is `custom` AND no filters active; show amber warning when filters active
- Back navigation restores scroll, focused row, and filter state from `sessionStorage`

### ConceptView (`/app/concepts/[conceptId]`)

- Three sections: MVK (blue tint), Notes, References — each with MarkdownEditor (Code/Preview toggle)
- Keyboard: `Backspace` back, `+/=` increment review, `-` decrement review

### ListMode / Library (`/app/library`)

- Client-side name search (no DB call on each keystroke)
- Sort: A→Z, Z→A, newest, oldest, most reviewed, least reviewed, pinned first, priority high
- Filters: subject, topic, tag, state, priority, pinned
- Keyboard: same as SubjectView (↑↓, Enter, Space MVK, +/-)
- Back navigation preserves state

### FocusMode (`/app/focus`)

- One concept at a time; Reveal buttons for MVK / Notes / References
- Keyboard: `←` prev, `→` next, `+/-` review

### IndexMode (`/app/index`)

- 5-column desktop grid, grouped alphabetically; `#` group for non-alphabetic
- Two-click: first click focuses pill, second click opens ConceptView
- Keyboard: `←→↑↓` visual grid navigation (finds nearest pill on adjacent row by horizontal overlap), `Space` MVK, `+/-` review, `Enter` open
- Back navigation preserves state

### OverviewView (`/app/overview`)

- Three sections: Study (total time, sessions, reviews), Inventory (state distribution, recent), Catalog (subjects/topics/tags with counts)
- Server component; no keyboard shortcuts

### Back Navigation State (sessionStorage pattern)

SubjectView, ListMode, and IndexMode save state before navigating to ConceptView:

- `cv-back` — key presence signals returning from ConceptView
- `scroll-{view}` — scrollTop of `#main-content`
- `{view}-last-id` — focused concept ID
- `{view}-state` — serialized filters + sort

On mount: if `cv-back` present → restore state + remove key; if absent → reset scroll to top. **This pattern must be preserved exactly.**

---

## Authentication (`src/auth.ts`)

- **Database sessions** — stored in `sessions` table; revocable; no JWT secrets needed
- **Credentials provider** — `authorize()` looks up user by email, compares bcrypt hash
- **Sign-up** — separate Server Action (`src/actions/auth.ts`) since Auth.js doesn't handle credentials sign-up
- **Password recovery** — `crypto.randomBytes(32)` hex token → `password_reset_tokens` (1h expiry) → Resend email → `/forgot-password/reset?token=...` → validate + `bcrypt.hash` new password
- **Middleware** (`src/middleware.ts`) — `auth()` check on all `/app/*` paths
- **Server Components** — `auth()` from `@/auth`
- **Client Components** — `useSession()` from `next-auth/react`; `session.user.id` is always set via the session callback

---

## Server Actions (`src/actions/`)

All data mutations and queries are Server Actions. No custom API routes for domain data.

### Security contract (mandatory in every action)

```typescript
const session = await auth();
if (!session?.user?.id) throw new Error("Unauthorized");
const userId = session.user.id;
// Every DB query: ...where(eq(table.userId, userId))
```

Never accept `userId` from the client. Never skip the ownership check.

### `concepts.ts`

| Action                                   | Description                                                                         |
| ---------------------------------------- | ----------------------------------------------------------------------------------- |
| `getConcepts()`                          | All user concepts with joined subject/topic/tag IDs                                 |
| `getConcept(id)`                         | Single concept + joined names                                                       |
| `createConcept(input)`                   | Resolve-or-create subjects/topics/tags; insert concept + junctions; init sort order |
| `updateConcept(id, input)`               | Diff old vs new junctions; prune orphans                                            |
| `deleteConcept(id)`                      | Delete concept (FK cascade handles junctions); prune orphaned subjects/topics/tags  |
| `updateConceptField(id, field, value)`   | Patch `state`, `priority`, or `pinned`                                              |
| `updateConceptContent(id, field, value)` | Patch `mvkNotes`, `markdownNotes`, or `referencesMarkdown`                          |
| `incrementReview(id)`                    | `review_count + 1`                                                                  |
| `decrementReview(id)`                    | `GREATEST(0, review_count - 1)`                                                     |

### `subjects.ts`

| Action                                                  | Description                                                                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `getSubjectSortMode(subjectId)`                         | Returns `'alpha' \| 'date' \| 'custom'`                                                       |
| `setSubjectSortMode(subjectId, mode)`                   | Upsert; if switching to `custom`, initialize `subject_concept_orders` with current date order |
| `getSubjectConceptOrder(subjectId)`                     | Concept IDs in position order                                                                 |
| `moveConceptInSubject(subjectId, conceptId, direction)` | Swap adjacent positions                                                                       |

### `study-sessions.ts`

| Action                                     | Description                   |
| ------------------------------------------ | ----------------------------- |
| `getStudySessions()`                       | All sessions for current user |
| `addStudySession({ minutes, subjectId? })` | Insert session                |

### `auth.ts`

| Action                                             | Description                                                                              |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `signUpWithCredentials({ email, name, password })` | Validate → check duplicate → bcrypt hash → insert user → sign in                         |
| `requestPasswordReset({ email })`                  | Generate token → insert `password_reset_tokens` → send Resend email                      |
| `resetPassword({ token, newPassword })`            | Validate token (exists, unexpired, unused) → bcrypt hash → update user → mark token used |

---

## Client-Side Data Fetching (TanStack Query)

Server Components call Server Actions directly for initial render (no HTTP round-trip). Client Components use TanStack Query hooks for reactive updates after mutations.

Use **optimistic updates** for `updateConceptField`, `incrementReview`, `decrementReview` — this reproduces the instant feel of the Zustand demo:

```typescript
onMutate: async ({ id, field, value }) => {
  await qc.cancelQueries({ queryKey: ['concepts'] })
  const prev = qc.getQueryData(['concepts'])
  qc.setQueryData(['concepts'], (old) =>
    old?.map(c => c.id === id ? { ...c, [field]: value } : c) ?? []
  )
  return { prev }
},
onError: (_, __, ctx) => qc.setQueryData(['concepts'], ctx?.prev),
onSettled: () => qc.invalidateQueries({ queryKey: ['concepts'] }),
```

---

## Architectural Rules

1. **No userId from client** — `userId` is always read from the server session. Never passed from client.
2. **Per-user data isolation** — every domain query includes `where(eq(table.userId, userId))`. Hard requirement.
3. **Migration discipline** — always `drizzle-kit generate` + `drizzle-kit migrate`. Never `drizzle-kit push` after initial setup. The `src/db/migrations/` directory is committed to git.
4. **Server boundary** — Zod validation, DB access, and auth checks live in Server Actions only. No raw DB access from client components.
5. **Orphan pruning** — when a concept is deleted or its subjects/topics/tags are changed, prune subjects/topics/tags no longer referenced by any concept for that user (mirrors `pruneCollections` in the demo store).
6. **Sort order initialization** — when `setSubjectSortMode('custom')` is called for the first time on a subject, initialize `subject_concept_orders` with the current date-ordered concept list.
7. **No images** — the image feature is disabled ("Pro Plan" in demo). Do not add image storage until explicitly requested.
8. **UI parity** — behavior regressions from the demo are not acceptable. When in doubt, read the demo `.jsx` file.

---

## Migration Discipline

```bash
# After changing src/db/schema.ts:
npx drizzle-kit generate       # creates src/db/migrations/*.sql
# Review the generated SQL before applying
npx drizzle-kit migrate        # applies to DATABASE_URL

# Neon branching strategy:
# - .env.local DATABASE_URL → Neon "dev" branch
# - Vercel env vars → Neon "main" (production) branch
# - Always test migrations on dev branch first
```

`src/db/migrations/` is committed to git. It is the authoritative migration history.

---

## Component Inventory

All UI components are Client Components (`'use client'`). They receive data as props and call TanStack Query mutation hooks for updates.

| Component                  | Ports from demo                       | Notes                                                    |
| -------------------------- | ------------------------------------- | -------------------------------------------------------- |
| `Sidebar.tsx`              | `Sidebar.jsx`                         | Replace Zustand with TanStack Query; Auth.js `signOut()` |
| `StudySessionBar.tsx`      | `StudySessionBar.jsx`                 | Wire to `addStudySession` Server Action                  |
| `ConceptForm.tsx`          | `ConceptForm.jsx`                     | Wire to `createConcept`/`updateConcept`; same modal UX   |
| `MarkdownEditor.tsx`       | `MarkdownEditor.jsx`                  | Remove imageStore dependency                             |
| `InlineEditor.tsx`         | Inline export in `MarkdownEditor.jsx` | Split into own file                                      |
| `FilterSortBar.tsx`        | `FilterSortBar.jsx`                   | Pure UI, no store dependency                             |
| `ShortcutsHintBar.tsx`     | `ShortcutsHintBar.jsx`                | Pure UI                                                  |
| `StatusBadge.tsx`          | `StatusBadge.jsx`                     | StateSelector, PriorityBadge, ReviewCounter, PinButton   |
| `CreatableMultiSelect.tsx` | `CreatableMultiSelect.jsx`            | Pure UI                                                  |

---

## Markdown Support

Same as demo: `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` + `@tailwindcss/typography`. The `tiq-img://` scheme is NOT implemented (images disabled).

---

## Static Blog (Notes)

Posts in `src/posts/*.md` with YAML frontmatter (`title`, `date`). `src/lib/posts.ts` reads files with Node `fs` at build/request time. `NotesView` and `PostView` are static Server Components.

---

## Deployment

1. Create Vercel project; set root directory to `tortugaiq-next/`
2. Link Neon database via Vercel integration (auto-sets `DATABASE_URL`)
3. Set remaining env vars in Vercel project settings
4. Configure OAuth callback URLs: `https://<domain>/api/auth/callback/google`, `.../facebook`
5. Run `drizzle-kit migrate` against production Neon branch before first deploy
6. Deploy via `git push` (Vercel auto-deploys from main branch)

```

---

## Critical Files to Create

| File | Purpose |
|------|---------|
| `tortugaiq-next/CLAUDE.md` | Primary guidance (content above) |
| `tortugaiq-next/src/db/schema.ts` | Drizzle schema — single source of truth |
| `tortugaiq-next/src/auth.ts` | Auth.js config |
| `tortugaiq-next/src/middleware.ts` | Route protection |
| `tortugaiq-next/src/actions/concepts.ts` | Core data mutations |
| `tortugaiq-next/src/lib/types.ts` | TypeScript types |
| `tortugaiq-next/.env.example` | Documented env var template |

---

## Verification

- OAuth sign-in: confirm Google/Facebook buttons complete full flow and land on `/app`
- Credentials sign-up: create account → redirected to `/app` → sign out → sign in → data persists
- Password recovery: request reset email received → link works → new password accepted
- Concept CRUD: create concept with subjects/topics/tags → appears in SubjectView → edit → delete → orphan pruning works
- Keyboard nav: all shortcuts work in SubjectView, ListMode, IndexMode, FocusMode, ConceptView
- Back navigation: navigate from SubjectView → ConceptView → back → scroll/focus/filters restored
- Data isolation: sign in as User A, create concepts, sign in as User B — User B sees nothing
- Migration: `drizzle-kit generate` produces valid SQL; `drizzle-kit migrate` applies cleanly to fresh DB
- Demo app: `npm run dev` from workspace root still works at port 5173 (unaffected)
```
