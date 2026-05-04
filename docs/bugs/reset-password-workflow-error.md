# Reset Password Workflow Error

## Symptom

After submitting an email on `/forgot-password` and clicking "Send reset link", the user is redirected to:

> Application error: An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error.
>
> digest: 2461795887

---

## Root Cause

The `requestPasswordReset` Server Action calls the email-sending library with no try/catch. When sending fails, the uncaught exception propagates and Next.js renders the generic "Application error" page.

The deeper cause: Vercel's serverless infrastructure **blocks all outbound SMTP connections** on ports 25, 465, and 587. This is a platform-level restriction and cannot be worked around with configuration.

---

## Fix Attempt History

### Attempt 1 — Resend API (abandoned early)
- **Approach:** Use the `resend` npm package with `RESEND_API_KEY`.
- **Why it failed:** Team believed a verified custom domain was required to send to arbitrary recipients. The attempt was abandoned.
- **Note:** This belief was incorrect — Resend supports single email address verification (no domain needed for low-volume personal use).

### Attempt 2 — Nodemailer + Gmail SMTP + `tls: { rejectUnauthorized: false }`
- **Approach:** `nodemailer.createTransport` with `smtp.gmail.com:465`, Gmail App Password (`GMAIL_USER` / `GMAIL_APP_PASSWORD`), and TLS certificate verification disabled.
- **Why it failed (locally):** Worked locally due to the TLS bypass.
- **Why it was removed:** Security audit flagged `rejectUnauthorized: false` — disabling TLS verification exposes the connection to MITM attacks. Removed per security standards.

### Attempt 3 — Nodemailer + Gmail SMTP (without TLS bypass)
- **Approach:** Same as Attempt 2 but with certificate verification re-enabled.
- **Why it failed in production:** Vercel blocks SMTP ports. The `sendMail()` call throws an unhandled exception, crashing the Server Action with the "Application error" page. Also failed locally for the user due to local firewall rules.

---

## Current Fix (Attempt 4) — Resend HTTP API

**Root insight:** Vercel blocks SMTP (ports 25, 465, 587) but allows all outbound HTTPS (port 443). Resend uses the HTTPS API — not SMTP — so it works on Vercel.

**Changes made:**
- `src/actions/auth.ts`: Replaced `nodemailer` with `resend` package (already installed as `v6.10.0`).
- Both email calls (`requestPasswordReset` and `resetPassword`) now use `resend.emails.send()`.
- Both calls are wrapped in `try/catch` so a failed send can never crash the Server Action.
- Removed the `NODE_ENV !== 'development'` guard — the dev log (`console.log`) still prints the URL, and the email send is attempted in all environments (failures are caught and logged).

**Environment variables used:**
- `RESEND_API_KEY` — Resend API key (already in project)
- `RESEND_FROM_EMAIL` — sender address; must be a verified email or domain in the Resend dashboard

**Setup required for the personal Gmail approach:**
1. Go to [resend.com/emails](https://resend.com) → Domains → Add email address
2. Verify `edgarfrancisco2022@gmail.com` (or whichever Gmail) by clicking the confirmation link
3. Set `RESEND_FROM_EMAIL=edgarfrancisco2022@gmail.com` in Vercel env vars
4. Set `RESEND_API_KEY` in Vercel env vars (if not already set)
5. Deploy and test

**If email sending still fails:** Check Vercel function logs — `[requestPasswordReset] Email send failed:` will include the Resend error. Common causes: unverified sender address, invalid API key, or Resend account in test mode.
