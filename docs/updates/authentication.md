![alt text](image.png)
![alt text](image-1.png)
Please try to clone the structure of these templates for this workflow
The style should be similar to what we are currently using for this app, professional, trendy, and sleek
for the logo we should use
🔍🐢

# TortugaIQ Demo Auth Plan (Next.js + Auth.js / NextAuth)

## Goal

Build the simplest working authentication flow for the TortugaIQ demo:

- Google OAuth
- Facebook OAuth
- Email + password sign-up
- Email + password sign-in
- No email confirmation
- No password reset
- Redirect to `/app` after successful auth
- Log out back to `/`
- Use a simple **server-side in-memory user store** for credentials users
- Use Auth.js session handling normally (do **not** try to store Auth.js sessions in localStorage)

Auth.js supports custom sign-in pages, OAuth providers, credentials auth through `authorize()`, sign-in/sign-out helpers, and route protection. :contentReference[oaicite:0]{index=0}

---

## Scope constraints

For this demo, explicitly **exclude**:

- Apple login
- Email confirmation
- Forgot password
- Password reset
- Account linking
- Database adapters
- Profile editing
- Roles / permissions
- Advanced account settings

This keeps the auth workflow small and testable.

---

## High-level architecture

### Auth methods

Use exactly 3 methods:

- `google`
- `facebook`
- `credentials`

Auth.js supports built-in OAuth providers and a Credentials provider that forwards submitted username/email/password to your authentication logic. :contentReference[oaicite:1]{index=1}

### Storage strategy

For the **credentials** flow only:

- Keep users in a simple server-side in-memory store, such as a `Map<string, DemoUser>`
- Key by lowercased email
- Hash passwords before storing
- Accept that users disappear when the server restarts

For this demo, that is acceptable and much simpler than adding a database.

### Session strategy

- Let Auth.js manage sessions normally
- Use JWT-based sessions for the credentials flow
- Do **not** put auth sessions in localStorage

The Credentials provider is intended to validate submitted credentials in `authorize()` and return a user object when valid. :contentReference[oaicite:2]{index=2}

---

## Pages to build

### Public pages

- `/`
  - landing page
- `/notes`
  - blog / writing page
- `/sign-in`
  - custom sign-in page
- `/sign-up`
  - custom sign-up page

### Protected pages

- `/app`
  - demo app entry page after auth
- `/app/*`

Auth.js supports custom sign-in pages through the `pages` config, and route protection can be done by checking session state and redirecting unauthenticated users. :contentReference[oaicite:3]{index=3}

---

## Required files / modules

### 1. `auth.ts`

Central Auth.js config file.

Responsibilities:

- configure providers:
  - Google
  - Facebook
  - Credentials
- configure custom sign-in page
- export auth helpers
- use JWT session strategy
- include callbacks if needed to normalize the session user object

Auth.js recommends creating an `auth.ts` config file and exporting the handlers/helpers from there. :contentReference[oaicite:4]{index=4}

### 2. Auth route

Use the standard Auth.js route handler for Next.js.

Responsibilities:

- expose auth endpoints
- process OAuth callbacks
- process credentials sign-in requests

### 3. `lib/demo-user-store.ts`

Simple in-memory credentials user store.

Responsibilities:

- create user
- find user by email
- verify password
- prevent duplicate sign-up

Example data shape:

```ts
type DemoUser = {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  provider: "credentials";
  createdAt: number;
};
```
