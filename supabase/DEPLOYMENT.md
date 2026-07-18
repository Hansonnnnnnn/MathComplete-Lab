# Supabase production setup

The frontend is implemented, but the following project-level settings require access to the Supabase, Google, Cloudflare, and Resend dashboards.

## 1. Database and function

```powershell
supabase link --project-ref hcrxxfcvmrjahnjlbjur
supabase db push
supabase secrets set MFA_RECOVERY_PEPPER="use-a-long-random-secret"
supabase secrets set MCL_ALLOWED_ORIGINS="https://hansonnnnnnn.github.io,http://localhost:8000,http://127.0.0.1:8000"
supabase functions deploy account-security
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are supplied to hosted Edge Functions by Supabase. Do not add them to an `.env` file committed to Git.

## 2. URL configuration

Set the Site URL to:

`https://hansonnnnnnn.github.io/MathComplete-Lab/`

Add these redirect patterns:

- `https://hansonnnnnnn.github.io/MathComplete-Lab/auth-callback.html**`
- `http://localhost:8000/auth-callback.html**`
- `http://127.0.0.1:8000/auth-callback.html**`

## 3. Authentication providers

- Enable Email/Password and require email confirmation.
- Set the minimum password length to 12.
- Enable secure email change and password-change security notifications.
- Configure Google OAuth with the callback URL shown by Supabase for this project.
- Keep anonymous sign-in disabled.
- Leave TOTP MFA enabled.

## 4. Email delivery

Configure Resend under Authentication SMTP Settings using a verified sending domain. Customize confirmation, password recovery, email change, and security notification templates in both English and Chinese. Do not use Supabase's default mailer for production traffic.

## 5. Abuse controls

Create a Cloudflare Turnstile widget for the GitHub Pages host and local test origins. Paste its public site key into `turnstileSiteKey` in `assets/js/supabase-client.js`, then configure the matching secret in Supabase Auth CAPTCHA settings.

Review Auth rate limits before launch. Start conservatively for sign-up, sign-in, resend, and password recovery, then adjust using production logs.

## 6. Pre-launch owner tasks

- Replace the draft contact paragraphs in `terms.html` and `privacy.html` with a monitored support/privacy email and obtain appropriate legal review.
- Confirm `termsVersion` and `privacyVersion` in `assets/js/supabase-client.js` match the published policy dates.
- Test email deliverability, Google consent-screen status, Turnstile, account deletion, and data export on the production URL.
