# CLAUDE.md — TortugaIQ Production App

This is the primary reference for Claude Code working on this app. Read it before writing any code.

---

## What Is TortugaIQ

TortugaIQ is a personal knowledge management app for long-term learning. The core unit is the **Concept** — a named piece of knowledge with:
- An **MVK** (Minimum Viable Knowledge): the smallest useful representation
- Full markdown notes and references
- Metadata: subjects, topics, tags, state, priority, review count, pin status

This is NOT a flashcard or spaced-repetition app. Users navigate their concepts manually and track their own progress. The design philosophy: simple, fast, long-term maintainable.

The Vite demo that originally prototyped this UI has been removed. All logic now lives in the production codebase (`src/`).

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15, App Router, TypeScript (strict) |
| Database | PostgreSQL on Neon (serverless) |
| ORM | Drizzle ORM + Drizzle Kit |
| Auth | Auth.js v5 (NextAuth) |
| Client data | TanStack Query v5 |
| Validation | Zod |
| Styling | Tailwind CSS v3 + @tailwindcss/typography |
| Email | Resend |
| Deploy | Vercel |

---

## Setup & Commands

```bash
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

### Required environment variables (.env.example documents all)

```
DATABASE_URL=               # Neon connection string (pooled)
AUTH_SECRET=                # openssl rand -base64 32
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
export type ConceptState    = 'NEW' | 'LEARNING' | 'REVIEWING' | 'MEMORIZING' | 'STORED'
export type ConceptPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type SubjectSortMode = 'alpha' | 'date' | 'custom'

export interface Subject { id: string; userId: string; name: string; createdAt: Date; updatedAt: Date }
export interface Topic   { id: string; userId: string; name: string; createdAt: Date; updatedAt: Date }
export interface Tag     { id: string; userId: string; name: string; createdAt: Date; updatedAt: Date }

export interface Concept {
  id: string; userId: string; name: string
  mvkNotes: string; markdownNotes: string; referencesMarkdown: string
  state: ConceptState; priority: ConceptPriority
  reviewCount: number; pinned: boolean
  createdAt: Date; updatedAt: Date
  // Joined fields (populated by query, not stored in concepts table)
  subjectIds: string[]; topicIds: string[]; tagIds: string[]
}

export interface StudySession { id: string; userId: string; minutes: number; subjectId: string | null; createdAt: Date }

// Input types for mutations (names not IDs — server resolves/creates)
export interface ConceptInput { name: string; subjectNames: string[]; topicNames: string[]; tagNames: string[] }
```

### Database Tables (`src/db/schema.ts`)

| Table | Purpose |
|-------|---------|
| `users` | Auth.js adapter + `passwordHash` column extension |
| `accounts` | OAuth provider accounts (Auth.js) |
| `sessions` | Database sessions (Auth.js) |
| `verification_tokens` | Email verification (Auth.js) |
| `password_reset_tokens` | Password recovery flow |
| `subjects` | User subjects — unique `(userId, name)` constraint |
| `topics` | User topics — unique `(userId, name)` |
| `tags` | User tags — unique `(userId, name)` |
| `concepts` | Core entity |
| `concept_subjects` | M:M concept ↔ subject (cascade delete) |
| `concept_topics` | M:M concept ↔ topic (cascade delete) |
| `concept_tags` | M:M concept ↔ tag (cascade delete) |
| `subject_concept_orders` | Custom sort positions per `(userId, subjectId, conceptId)` |
| `subject_sort_modes` | Sort mode preference per `(userId, subjectId)` |
| `study_sessions` | Study time log |

Every user-owned table has `userId` as a non-nullable FK to `users.id ON DELETE CASCADE`.

---

## Routes

### Public

| Route | View | Notes |
|-------|------|-------|
| `/` | LandingPage | Marketing page, hero + "The Idea" section |
| `/notes` | NotesView | Static blog list |
| `/notes/[slug]` | PostView | Blog post |
| `/sign-in` | SignInPage | Credentials + Google + Facebook |
| `/sign-up` | SignUpPage | Registration |
| `/forgot-password` | ForgotPasswordPage | Request reset email |
| `/forgot-password/reset` | ResetPasswordPage | Token validation + new password |

### App (require auth — middleware redirects to /sign-in)

| Route | View | Notes |
|-------|------|-------|
| `/app` | HomeView | Welcome + "New Concept" CTA |
| `/app/subjects/[subjectId]` | SubjectView | Concepts in a subject |
| `/app/concepts/[conceptId]` | ConceptView | Full concept detail |
| `/app/library` | ListMode | All concepts, searchable |
| `/app/focus` | FocusMode | Flipcard carousel |
| `/app/index` | IndexMode | Alphabetical pill grid |
| `/app/overview` | OverviewView | Stats dashboard |

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
const session = await auth()
if (!session?.user?.id) throw new Error('Unauthorized')
const userId = session.user.id
// Every DB query: ...where(eq(table.userId, userId))
```

Never accept `userId` from the client. Never skip the ownership check.

### `concepts.ts`

| Action | Description |
|--------|-------------|
| `getConcepts()` | All user concepts with joined subject/topic/tag IDs |
| `getConcept(id)` | Single concept + joined names |
| `createConcept(input)` | Resolve-or-create subjects/topics/tags; insert concept + junctions; init sort order |
| `updateConcept(id, input)` | Diff old vs new junctions; prune orphans |
| `deleteConcept(id)` | Delete concept (FK cascade handles junctions); prune orphaned subjects/topics/tags |
| `updateConceptField(id, field, value)` | Patch `state`, `priority`, or `pinned` |
| `updateConceptContent(id, field, value)` | Patch `mvkNotes`, `markdownNotes`, or `referencesMarkdown` |
| `incrementReview(id)` | `review_count + 1` |
| `decrementReview(id)` | `GREATEST(0, review_count - 1)` |

### `subjects.ts`

| Action | Description |
|--------|-------------|
| `getSubjectSortMode(subjectId)` | Returns `'alpha' \| 'date' \| 'custom'` |
| `setSubjectSortMode(subjectId, mode)` | Upsert; if switching to `custom`, initialize `subject_concept_orders` with current date order |
| `getSubjectConceptOrder(subjectId)` | Concept IDs in position order |
| `moveConceptInSubject(subjectId, conceptId, direction)` | Swap adjacent positions |

### `study-sessions.ts`

| Action | Description |
|--------|-------------|
| `getStudySessions()` | All sessions for current user |
| `addStudySession({ minutes, subjectId? })` | Insert session |

### `auth.ts`

| Action | Description |
|--------|-------------|
| `signUpWithCredentials({ email, name, password })` | Validate → check duplicate → bcrypt hash → insert user → sign in |
| `requestPasswordReset({ email })` | Generate token → insert `password_reset_tokens` → send Resend email |
| `resetPassword({ token, newPassword })` | Validate token (exists, unexpired, unused) → bcrypt hash → update user → mark token used |

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
8. **UI parity** — behavior regressions from the original demo design are not acceptable. Reference the `docs/updates/` folder for original feature specs.

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

| Component | Ports from demo | Notes |
|-----------|-----------------|-------|
| `Sidebar.tsx` | `Sidebar.jsx` | Replace Zustand with TanStack Query; Auth.js `signOut()` |
| `StudySessionBar.tsx` | `StudySessionBar.jsx` | Wire to `addStudySession` Server Action |
| `ConceptForm.tsx` | `ConceptForm.jsx` | Wire to `createConcept`/`updateConcept`; same modal UX |
| `MarkdownEditor.tsx` | `MarkdownEditor.jsx` | Remove imageStore dependency |
| `InlineEditor.tsx` | Inline export in `MarkdownEditor.jsx` | Split into own file |
| `FilterSortBar.tsx` | `FilterSortBar.jsx` | Pure UI, no store dependency |
| `ShortcutsHintBar.tsx` | `ShortcutsHintBar.jsx` | Pure UI |
| `StatusBadge.tsx` | `StatusBadge.jsx` | StateSelector, PriorityBadge, ReviewCounter, PinButton |
| `CreatableMultiSelect.tsx` | `CreatableMultiSelect.jsx` | Pure UI |

---

## Markdown Support

Same as demo: `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` + `@tailwindcss/typography`. The `tiq-img://` scheme is NOT implemented (images disabled).

---

## Static Blog (Notes)

Posts in `src/posts/*.md` with YAML frontmatter (`title`, `date`). `src/lib/posts.ts` reads files with Node `fs` at build/request time. `NotesView` and `PostView` are static Server Components.

---

## Deployment

1. Create Vercel project; set root directory to repo root (leave empty)
2. Link Neon database via Vercel integration (auto-sets `DATABASE_URL`)
3. Set remaining env vars in Vercel project settings
4. Configure OAuth callback URLs: `https://<domain>/api/auth/callback/google`, `.../facebook`
5. Run `npx drizzle-kit migrate` against production Neon branch before first deploy
6. Deploy via `git push` (Vercel auto-deploys from main branch)

---

## Phase Status

- [x] Phase 0 — Scaffolding (Next.js, deps, schema, Auth.js, migration generated)
- [x] Phase 1 — Domain Schema + Data Layer (Server Actions, types, validations)
- [x] Phase 2 — Auth Pages UI
- [x] Phase 3 — App Shell + Shared Components
- [ ] Phase 4 — Core Views
- [ ] Phase 5 — Overview + Marketing Pages
- [ ] Phase 6 — Polish + Deploy
