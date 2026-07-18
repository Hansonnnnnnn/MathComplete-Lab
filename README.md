# MathComplete Lab

A static GitHub Pages site with randomized mathematics practice, bilingual UI, local guest progress, and optional Supabase account sync.

## Main pages

- `index.html`, `practice.html`, and `games/` provide the student practice experience.
- `login.html`, `auth-callback.html`, `reset-password.html`, and `consent.html` implement authentication flows.
- `account.html`, `dashboard.html`, and `mistakes.html` provide account, progress, and review tools.
- `terms.html` and `privacy.html` contain bilingual draft policies that require owner review before launch.

## Shared application code

- `assets/css/design-system.css` owns global themes, layout, controls, and responsive behavior.
- `assets/js/site-shell.js` renders the shared navigation and account menu.
- `assets/js/supabase-client.js` contains public client configuration and session storage policy.
- `assets/js/auth.js` is the single source of truth for authenticated state.
- `assets/js/progress.js` isolates guest/account data and uploads attempts idempotently.
- `assets/js/tool-catalog.js` is the central practice-tool catalog.

## Local use

Serve the folder over HTTP so OAuth and PKCE callbacks have a valid origin:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000/`. Opening HTML directly is fine for visual-only work but cannot exercise the full account flow.

## Supabase deployment

1. Apply `supabase/migrations/202607170001_auth_hardening.sql`, or run the matching `supabase/schema.sql` snapshot in the SQL Editor.
2. Deploy `supabase/functions/account-security` and set `MFA_RECOVERY_PEPPER` to a long random secret.
3. Follow `supabase/DEPLOYMENT.md` for Email, Google, Resend SMTP, Turnstile, callback URLs, rate limits, and security notifications.
4. Put only the public Supabase URL, publishable key, and Turnstile site key in `assets/js/supabase-client.js`. Never place a secret or service-role key in this repository.

Guest attempts stay on the current device. The first authenticated session asks whether to merge those records. Account-specific pending uploads are isolated by user ID and automatically retried without creating duplicate cloud attempts.
