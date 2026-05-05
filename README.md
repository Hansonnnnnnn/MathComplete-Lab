# MathComplete Lab

A user-facing static website for randomized math practice tools.

## Pages

- `index.html`
- `practice.html`
- `games/algebra-expression.html`

## Local use

Open `index.html` in a browser.

## Supabase setup

1. Open the Supabase SQL Editor.
2. Run `supabase/schema.sql` to create `profiles`, `attempts`, `mistakes`, indexes, and RLS policies.
3. Confirm Email auth is enabled in Supabase Authentication.
4. Keep `assets/js/supabase-client.js` updated with the project URL and publishable key.

Practice games now call `MCLProgress.recordGameAttempt()` after each answered question. Signed-in users save to Supabase; signed-out users save recent attempts in local storage and can sync them from `dashboard.html` after logging in. Signed-in users can also save favorite practice tools through the `favorite_tools` table.
