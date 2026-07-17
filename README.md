# MathComplete Lab

A user-facing static website for randomized math practice tools.

## Pages

- `index.html`
- `practice.html`
- `dashboard.html`
- `mistakes.html`
- `login.html`
- `games/` contains the 33 practice tools

## Shared UI

- `assets/css/design-system.css` owns the site tokens, responsive layout, controls, cards, and light/dark themes.
- `assets/js/theme.js` exposes `MCLTheme.get()` and `MCLTheme.set()` and dispatches `mcl:themechange`.
- `assets/js/site-shell.js` renders the shared desktop and mobile navigation.
- `assets/js/tool-catalog.js` is the single catalog used by the home workspace and Practice Library.
- `assets/js/tool-ux.js` adds the shared breadcrumbs, compact advanced settings, session summary, and result statistic to tools.

When adding a practice tool, create the page in `games/`, register it once in `assets/js/tool-catalog.js`, and include the shared theme, design-system, shell, and tool-UX assets used by the existing tools.

## Local use

Open `index.html` in a browser.

## Supabase setup

1. Open the Supabase SQL Editor.
2. Run `supabase/schema.sql` to create `profiles`, `attempts`, `mistakes`, indexes, and RLS policies.
3. Confirm Email auth is enabled in Supabase Authentication.
4. Keep `assets/js/supabase-client.js` updated with the project URL and publishable key.

Practice games now call `MCLProgress.recordGameAttempt()` after each answered question. Signed-in users save to Supabase; signed-out users save recent attempts in local storage and can sync them from `dashboard.html` after logging in. Signed-in users can also save favorite practice tools through the `favorite_tools` table.
