# TortugaIQ Security Review

You are performing a security review of TortugaIQ — a Next.js 16 personal knowledge management app using App Router, Drizzle ORM + Neon PostgreSQL, Auth.js v5 (JWT strategy), TanStack Query, Zod, and Tailwind CSS.

## How to Run This Review

1. Run `git diff main` (or `git diff main -- <file>` for a specific file) to see the changes under review
2. For each changed file, apply the checklist below
3. Also scan for any new files that introduce new data flows
4. Report results as: **✅ PASS**, **❌ FAIL** (blocking — must fix), or **⚠️ WARN** (non-blocking suggestion)
5. End with: overall verdict, list of blocking issues with file:line references, and non-blocking suggestions

---

## App Security Model

### Authentication Contract (mandatory for every server action)

```ts
const session = await auth()          // or requireAuth() helper
if (!session?.user?.id) throw new Error('Unauthorized')
const userId = session.user.id
// NEVER accept userId from input parameters
```

Every server action must call this at the top before any DB work.

### Data Ownership Contract (mandatory for every DB query)

Every query that reads or writes user data must include `eq(table.userId, userId)` in the WHERE clause. No exceptions.

```ts
// ✅ Correct
.where(and(eq(concepts.id, id), eq(concepts.userId, userId)))

// ❌ Wrong — missing userId check, allows cross-user access
.where(eq(concepts.id, id))
```

### Input Validation Contract

All user-supplied inputs must be validated with a Zod schema from `src/lib/validations.ts` before touching the database. Free-text fields (names, markdown content) must have `.max()` length limits.

### Client-Side Contract

- `userId` is NEVER passed from client to server. It is always derived from the server session.
- Credentials (passwords, tokens) are NEVER stored in `localStorage` or `sessionStorage` for real (non-guest) user accounts.
- Mutations use TanStack Query hooks wrapping Server Actions — no direct DB access from client components.

### Auth-Specific Rules

- Passwords: bcrypt with `BCRYPT_ROUNDS = 12`
- Tokens: `crypto.randomBytes(32).toString('hex')` — never Math.random, never UUID
- Token expiry: enforced in the DB query with `gt(table.expiresAt, new Date())`
- Token invalidation: `usedAt` column set after consumption, checked before use
- Email: always normalized to `.toLowerCase()` before storage and lookup
- Email enumeration: `requestPasswordReset` always returns `{}` (never reveals if email exists)
- TLS: nodemailer must NOT use `tls: { rejectUnauthorized: false }`

### Middleware / Route Protection

- All `/app/*` routes are protected by `src/middleware.ts`
- Any new authenticated route must be added to the middleware matcher

### Security Headers

All HTTP responses include (set via `next.config.ts` headers()):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-XSS-Protection: 0`

### API Route Protection

- Cron/webhook endpoints must use `crypto.timingSafeEqual()` for secret comparison — not `===`
- Auth must be checked before any DB work

---

## Review Checklist

### For Each Modified Server Action (`src/actions/`)

- [ ] `requireAuth()` (or equivalent `auth()` call) at the top, before any DB access?
- [ ] `userId` sourced exclusively from the session — never from function parameters or request body?
- [ ] Every DB SELECT/UPDATE/DELETE includes `eq(table.userId, userId)` ownership check?
- [ ] Zod schema validated with `.parse()` or `.safeParse()` before DB operations?
- [ ] Free-text/markdown string fields have `.max()` constraint in their Zod schema?
- [ ] No string interpolation of user data into raw SQL?
- [ ] Orphan pruning called when deleting entities that own subjects/topics/tags?

### For Modified Auth Flows (`src/actions/auth.ts`, `src/auth.ts`)

- [ ] Password hashing uses `bcrypt` with `BCRYPT_ROUNDS = 12`?
- [ ] Tokens generated with `crypto.randomBytes(32)`?
- [ ] Token expiry enforced in the DB query (not just at creation)?
- [ ] Tokens marked `usedAt` immediately after consumption?
- [ ] Existing unused tokens for a user invalidated when a new reset token is issued?
- [ ] Password reset sends a confirmation email to the user?
- [ ] Email enumeration prevented (always return success on user lookup)?
- [ ] Emails normalized to `.toLowerCase()` before storage/comparison?
- [ ] No `tls: { rejectUnauthorized: false }` in nodemailer config?

### For Modified Client Components / Pages

- [ ] No `userId` passed as a prop, query param, or form field to a server action?
- [ ] No credentials or tokens stored in `localStorage`/`sessionStorage` (for real accounts)?
- [ ] No sensitive data logged to the browser console?
- [ ] New routes that require auth added to the middleware matcher in `src/middleware.ts`?

### For Modified API Routes (`src/app/api/`)

- [ ] Auth checked before any data access?
- [ ] Cron/webhook secrets compared with `crypto.timingSafeEqual()`, not `===`?
- [ ] No user data returned without ownership verification?

### For New DB Tables / Schema Changes (`src/db/schema.ts`)

- [ ] New user-owned tables have a `userId` FK with `onDelete: 'cascade'`?
- [ ] New text columns have appropriate length constraints at the DB level (or at minimum in Zod)?
- [ ] New M:M junction tables have `userId` or are scoped through a parent with userId?
- [ ] Migrations generated with `drizzle-kit generate` and committed to `src/db/migrations/`?

### For Markdown-Rendering Surfaces

- [ ] Using shared `MD_PLUGINS` from `src/lib/md-config.tsx` (not a local copy)?
- [ ] NOT passing `rehype-raw` or `allowDangerousHtml` to react-markdown (would enable XSS)?

---

## Known Documented Limitations (Do NOT flag as new issues)

These are known gaps that are intentionally deferred — do not report them as findings:

- **No rate limiting** on sign-in, sign-up, or password reset endpoints. Planned: `@upstash/ratelimit` + Upstash Redis before high-traffic launch.
- **No email verification** for new accounts. Acceptable for current MVP stage.
- **JWT sessions are not invalidated server-side** after password reset. This requires a token denylist — deferred. Mitigated by short session expiry.
- **No Content Security Policy (CSP)**. Deferred — requires careful tuning for KaTeX/Mermaid/Next.js nonces.
- **Guest credentials in localStorage** (`GuestLink.tsx`). Acceptable risk for ephemeral 30-day guest accounts with no personal data.

---

## Output Format

```
## Security Review — [branch or files reviewed]

### [filename]
- ✅ requireAuth() called at top
- ✅ userId from session only
- ❌ LINE 42: DB update missing userId ownership check — attacker can modify any user's concept
- ⚠️ LINE 78: no .max() on free-text field `notes`

### Summary
**Verdict**: FAIL / PASS / PASS WITH WARNINGS

**Blocking issues** (must fix before merge):
1. `src/actions/foo.ts:42` — ...

**Non-blocking suggestions**:
1. ...
```
