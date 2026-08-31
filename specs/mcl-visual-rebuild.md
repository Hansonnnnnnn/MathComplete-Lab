# MathComplete Lab Full-Site Visual Rebuild Specification

## 1. Status and intent

- Spec status: approved for implementation
- Product: MathComplete Lab
- Scope: every interactive website surface
- Primary audience: U.S. students in grades 7–12, with high-school visual maturity as the baseline
- Design direction: **a precise but lively modern mathematics studio**
- Functional rule: **visual and structural refactor only; no product-logic changes**

This rebuild must make MathComplete Lab feel like one coherent product rather than a collection of individually styled practice pages. It must improve hierarchy, consistency, responsive behavior, legibility, interaction feedback, and visual identity without modifying how questions are generated, answered, scored, stored, synchronized, reviewed, assigned, or exported.

The source design disciplines are:

- Apple Human Interface Guidelines: hierarchy, harmony, consistency, content-first design, progressive disclosure, immediate feedback, cross-device adaptation, and accessibility as a first-order constraint.
- `frontend-design`: subject-grounded visual identity, deliberate typography and composition, meaningful structural devices, one memorable signature element, purposeful motion, and rejection of generic template aesthetics.

Reference sources:

- https://developer.apple.com/design/human-interface-guidelines/
- https://github.com/Ksanbal/apple-hig-codex-skill
- https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md

## 2. Scope

The rebuild includes:

- homepage;
- practice library;
- every standard quiz tool;
- graph, geometry, proof, matching, and other specialized tools;
- setup, active-question, feedback, solution, and results states;
- progress and mistakes pages;
- login, recovery, callback, consent, and account pages;
- teacher Assignment Builder;
- terms and privacy pages;
- shared navigation, language, theme, account, empty, loading, error, and offline states.

The rebuild excludes:

- score-report PDF layout;
- assignment PDF layout;
- question-bank expansion or correction;
- scoring, timers, modes, early completion, report generation, authentication, synchronization, catalog ownership, or persistence behavior;
- new student, teacher, payment, class, or assignment features.

Website buttons that generate PDFs must adopt the rebuilt visual system, but the generated PDF documents keep their independent formal print design.

## 3. Protected functional contracts

Implementation may change HTML hierarchy, semantic wrappers, and visual classes. It must preserve:

- every JavaScript-observed DOM `id`;
- every behavioral `data-*` attribute;
- form field names, values, ranges, and validation rules;
- public browser APIs such as `MCLTheme`, `MCLAuth`, `MCLQuizTool`, `MCLReportExport`, and catalog interfaces;
- event entry points and custom events;
- question and answer serialization;
- tool URLs and catalog IDs;
- focus-order semantics required by existing interactions;
- all current automated functional behavior.

Before altering a page, identify its protected selectors by searching JavaScript and tests. A wrapper may move; a behavioral target may not be renamed or repurposed.

Allowed microcopy changes are limited to navigation labels, buttons, settings help, empty states, and error-recovery text. Mathematical prompts, conditions, answers, explanations, solution steps, and bilingual mathematical meaning are immutable.

## 4. Design doctrine

### 4.1 Content first

- The current learning task is always the strongest element on a practice page.
- Branding and navigation support the task and never compete with the formula, diagram, prompt, or response controls.
- A user must identify the page purpose and primary action within three seconds.
- Advanced and infrequent settings use progressive disclosure.

### 4.2 Mathematics as identity

The visual identity must come from mathematical structure rather than generic education imagery.

- Each course and tool receives an accurate, distinct mathematical motif.
- Visuals may use axes, points, vectors, rays, angle arcs, congruence marks, set boundaries, factor structures, matrices, function curves, and integral area.
- A visual may not imply a mathematical fact that the question has not established.
- Decorative numbering, labels, lines, and diagrams are permitted only when they encode real structure.

### 4.3 One bold signature

The signature element is a family of lightly responsive mathematical diagrams. A tool motif may construct itself once, react to pointer focus, or reveal a relationship on hover. The remainder of the interface stays quiet and disciplined.

Do not use:

- gradient-filled headings;
- ornamental blobs, bokeh, or generic abstract illustrations;
- excessive glass or blur;
- oversized marketing heroes;
- large floating page-section cards;
- nested cards;
- decorative pills for ordinary text;
- continuous animation that competes with reading;
- a different visual language for every tool.

### 4.4 Apple influence boundary

The website must adopt Apple HIG behavior and discipline, not impersonate an Apple system app.

- Prefer clear hierarchy, familiar controls, direct feedback, forgiving actions, and adaptive layouts.
- Do not create fake macOS windows, traffic-light controls, iOS navigation bars, or unsupported system materials.
- Apple-like polish means behavior, spacing, typography, accessibility, and state clarity, not blur alone.

## 5. Visual system

### 5.1 Color roles

Use a two-level system.

Brand and semantic roles:

| Token role | Light reference | Dark reference | Purpose |
| --- | --- | --- | --- |
| Canvas | `#F6F8FB` | `#0D1422` | Application background |
| Surface | `#FFFFFF` | `#151F31` | Controls and true item surfaces |
| Raised surface | `#FFFFFF` | `#1B293F` | Menus and modal layers |
| Primary text | `#13233A` | `#F4F7FB` | Headings, prompts, formulas |
| Secondary text | `#52637A` | `#B7C4D5` | Metadata and explanations |
| Action cobalt | `#2D5FE5` | `#86A8FF` | Primary actions and focus |
| Learning teal | `#148A83` | `#68D3C7` | Progress and constructive state |
| Correct | `#16734D` | `#70D6A8` | Correct state |
| Incorrect | `#B52F2A` | `#FF928C` | Incorrect state |
| Warning | `#A45C0A` | `#F2BE67` | Time or recoverable warning |

Exact derived hover, pressed, subtle, and border values must be generated from these roles and checked for contrast. Do not hard-code page-specific text colors.

Course colors remain distinct for the seven courses. Course color may appear in:

- one course label;
- a tool's mathematical motif;
- a fine accent rule;
- a selected course-navigation state;
- a small progress or context marker.

Course color may not flood an entire page, card, question area, or result panel. Correct, incorrect, warning, focus, and disabled colors are semantic and may never be replaced by course colors.

### 5.2 Typography

Use three deliberate roles:

- Display and page titles: self-hosted `Sora`, with `Noto Sans SC` for Chinese glyphs.
- Body, labels, and controls: self-hosted `Source Sans 3`, with `Noto Sans SC` for Chinese glyphs.
- Mathematics: existing KaTeX fonts and rendering.

Font files must be version-pinned, self-hosted, accompanied by licenses, and loaded with `font-display: swap`. System fallbacks remain available.

Type rules:

- No viewport-width font scaling.
- Use breakpoint-based fixed type steps.
- Desktop page title: 48px maximum; mobile page title: 32px maximum.
- Section title: 28px desktop, 24px mobile.
- Body: 16px minimum with approximately 1.55 line height.
- Utility and metadata: 13-14px, never used for essential answer content.
- Quiz prompts use content-length classes, not viewport scaling.
- Formula size steps down only when content length requires it.
- Important labels wrap; they do not truncate.
- Use `font-variant-numeric: tabular-nums` for scores, timers, and question counters.
- Do not use weights above 700 in normal UI.

### 5.3 Spacing, shape, and depth

- Spacing scale: 4, 8, 12, 16, 24, 32, 48, and 64px.
- Maximum content width: 1200px.
- Practice reading width: approximately 1040px.
- Desktop header: 64px; mobile header: 56px.
- Component radius: 4, 6, or 8px only.
- Minimum interactive target: 44 by 44px.
- Borders carry most component separation; shadows are reserved for menus, dialogs, and genuinely raised transient layers.
- Page sections are unframed full-width regions with constrained inner content.
- Cards are used only for repeated tools, repeated records, questions, results, and framed workspaces.

## 6. Motion and mathematical visuals

Motion must explain hierarchy, state, construction, or causality.

Allowed:

- one page-entry sequence for the main workbench;
- one-time construction animation for the signature mathematical motif;
- progress changes;
- selection, submit, correct, incorrect, reveal, expand, and collapse transitions;
- restrained hover response on browseable tool cards.

Disallowed:

- continuous heading color cycling;
- unrelated floating decoration;
- repeated reveal animations every time an element scrolls into view;
- layout-moving hover effects;
- motion that delays answering or feedback.

Timing reference:

- immediate state: 120-160ms;
- component transition: 200-260ms;
- one-time construction: 400-650ms.

The color-changing pointer trail remains only on the homepage and practice library, only for fine pointers at widths of 768px or more. It must not run on quiz, authentication, account, legal, progress, mistakes, or Assignment Builder pages. It must stop under `prefers-reduced-motion: reduce` and must never intercept input.

Every visual animation must have a fully understandable static state.

## 7. Global shell

### 7.1 Header

The header contains:

- MathComplete Lab mark and name;
- primary destinations;
- language control;
- theme control;
- account state and menu;
- mobile menu trigger when needed.

The logo may be optically refined but must retain the MathComplete Lab name and sigma mark. The mark must be recognizable at small sizes and in both themes.

Desktop and mobile navigation presentation is an evidence-based implementation gate. Start from the current destination model and test representative tasks before deciding whether every destination remains directly visible or moves into an overflow/account surface. Do not add a destination merely to fill space.

Navigation acceptance tasks:

1. Open a new practice tool from the homepage.
2. Return from a tool to the library.
3. Find mistakes and progress.
4. Change language and theme.
5. Sign in or reach account settings.
6. Find Assignment Builder as a teacher or tutor without making it a dominant student destination.

Select the presentation that minimizes missed destinations and mobile header crowding while keeping primary destinations immediately discoverable.

### 7.2 Theme and language

- Keep `data-theme="light|dark"`, system-theme default, manual persistence, and `mcl:themechange` behavior.
- Theme controls display an icon and accessible name.
- Every specialized SVG, canvas, grid, graph, and proof highlight must respond to theme changes.
- Language controls keep current persistence and reload behavior.
- English and Chinese layouts must share identical information and action hierarchy.

## 8. Homepage workbench

The homepage is a usable workbench, not a marketing landing page.

Returning-user hierarchy:

1. concise welcome/context line;
2. continue-practice action;
3. recent accuracy or review recommendation already provided by existing data;
4. course navigation;
5. recently added tools;
6. short brand explanation;
7. Assignment Builder entry.

New or no-history hierarchy:

1. concise welcome/context line;
2. recommended starting point;
3. course navigation;
4. recently added tools;
5. short brand explanation;
6. Assignment Builder entry.

Requirements:

- No full-viewport hero.
- The first viewport must expose actual learning actions.
- Continue/recommendation uses one strong action and one relevant mathematical motif.
- Course entries are compact and scannable.
- Recently added tools use the shared tool-card component.
- Do not invent new recommendation or progress logic.

## 9. Practice library

The information model is fixed:

**course -> topic -> tool**

Desktop:

- persistent course navigation on the left;
- search and current-course context at the top of the content column;
- tools grouped by topic;
- two-column tool list at comfortable desktop widths.

Mobile:

- course selector above search;
- one-column topic groups and tool cards;
- no horizontal filter strip that requires sideways scrolling.

Tool cards contain:

- subject-accurate tool motif;
- tool title;
- one concise description line;
- one correct current-course label;
- favorite control;
- clear open action.

Card height must remain stable across typical titles without clipping. The whole card must not become an ambiguous click target when it contains a separate favorite control. Search filters existing catalog results only and must not change course ownership.

## 10. Standard quiz page

### 10.1 Page hierarchy

Every standard tool uses:

1. breadcrumb;
2. one course label;
3. tool title and concise description;
4. setup toolbar or active-round settings summary;
5. round status and progress;
6. answering instruction;
7. question or visual;
8. response controls;
9. feedback and solution;
10. current primary action.

The question workspace is the strongest region after a round begins. The tool title must not remain hero-sized during active practice.

### 10.2 Settings

Before a round:

- show mode, difficulty, question count, timer, and start action in a compact, scannable form;
- use segmented controls for small mode sets, switches for timer state, selects or steppers where appropriate;
- only show timer level after timing is enabled;
- preserve every current setting and option.

During a round:

- collapse settings to one summary line;
- show difficulty, mode, question count, and timer state;
- retain an explicit control to reopen settings;
- do not allow the summary to compete with question progress.

### 10.3 Status and progress

- Question count, difficulty, and timer use one compact status row.
- End-round remains available but visually secondary to answering.
- Progress uses one thin, high-contrast bar plus textual question count.
- Timer danger uses color, icon, and text, not color alone.

### 10.4 Question and response area

- Mathematical questions remain KaTeX.
- Natural-language questions use the UI body face, not the math font.
- Content-length classes determine question size and wrapping.
- Formula containers may scroll only when a truly indivisible formula cannot wrap safely.
- Choice buttons have stable minimum height and equal dimensions within a question.
- Correct, incorrect, selected, disabled, and focus states remain legible in both themes.
- Correctness always includes a textual or icon cue in addition to color.
- Input, multi-select, matching, and proof interactions keep their current grading semantics.

### 10.5 Feedback and action

- Learn and Practice feedback appears immediately adjacent to the response area.
- Explanations are visually subordinate to the final answer but easy to scan.
- The current primary action is singular: submit, retry when supported, or next.
- Desktop places the primary action after feedback in reading order.
- Mobile uses a persistent bottom action region containing only the currently valid primary action.
- The persistent mobile region accounts for safe-area insets and may not cover inputs, choices, feedback, or final page content.

## 11. Specialized tools

Function graph matching, unit-circle visuals, geometry diagrams, parallel-line tasks, triangle proofing, conditional-logic interactions, and similar tools retain their specialized central interaction.

They must reuse:

- global shell;
- breadcrumb and course label;
- title and description scale;
- setup/summary component;
- round status and progress;
- feedback language;
- result view;
- theme tokens;
- mobile primary action behavior.

Desktop may use side-by-side workspaces only when comparison is part of the task. Mobile must switch to an intentional sequence, not compress a desktop split view. Geometry and graph canvases use stable aspect ratios and responsive bounds. Labels and marks may not collide, clip, or become low contrast.

No specialized stylesheet may redefine global body, heading, button, card, form, result, or navigation styles.

## 12. Results page

Order:

1. answered count;
2. correct count;
3. accuracy;
4. wrong count;
5. per-question review;
6. follow-up actions.

Actions:

- primary: Practice Again;
- secondary: Practice Similar Wrong Types, when available;
- secondary: Download PDF.

Requirements:

- Count the round using existing answered-question behavior.
- Do not add duplicate mistake summaries.
- Avoid a large celebration sequence that delays review.
- Per-question review clearly separates prompt, response, correct answer, choices when applicable, and suggestion.
- Non-choice interactions do not display fake choices.
- PDF-generation progress uses a disabled state and clear status text.

## 13. Supporting pages

### 13.1 Progress and mistakes

- Use a work-focused dashboard hierarchy, not marketing cards.
- Summary metrics form one compact comparison row.
- Filters remain visible and predictable.
- Records use the same review component as quiz results where data overlaps.
- Empty states explain the state and offer one useful next action.

### 13.2 Authentication and account

- Authentication pages use a compact, single-focus form.
- Security and recovery information is clear but visually secondary.
- Account pages group profile, security, sessions, export, and deletion by task.
- Destructive actions are separated, explicitly labeled, and recoverable where existing behavior permits.
- Loading authentication state must not flash the wrong signed-in or signed-out interface.

### 13.3 Assignment Builder

- Preserve the current one-page builder behavior.
- Use a denser teacher-workspace layout than student pages.
- Assignment metadata, tool selection, task configuration, task ordering, validation, and PDF action have distinct regions without nesting cards.
- Repeated task rows remain easy to compare.
- The PDF action remains singular and prominent only after validation succeeds.

### 13.4 Legal pages

- Use a calm reading layout with a table of contents when current content length justifies it.
- Do not apply tool-card styling or decorative mathematical motion.

## 14. Responsive and accessibility requirements

Accessibility is part of the design, not a final patch.

- Meet WCAG AA contrast for text, icons, controls, formulas, graphs, grids, and state labels.
- Test light, dark, increased-contrast, selected, disabled, correct, incorrect, warning, and focus states.
- Do not communicate meaning by color alone.
- All controls have visible keyboard focus.
- Reading and tab order follow the visual order.
- Icon-only controls have accessible names and tooltips where meaning is not universal.
- Text containers expand for Chinese, localization, zoom, and larger text.
- No fixed-height container may clip essential text.
- Respect `prefers-reduced-motion` and `prefers-contrast` where supported.
- Maintain 44px minimum targets and adequate separation.
- Graph and geometry questions include accessible textual context already available in the question model.
- Use `aria-live` only for status changes that need announcement; avoid duplicate announcements.

Required responsive states:

- 1440x900 desktop;
- 1024x768 compact desktop/tablet landscape;
- 390x844 mobile portrait.

Also sanity-check 320px width and 200% browser zoom for catastrophic overflow.

## 15. CSS and component architecture

The final system must have one owner for each layer.

Recommended files:

- `assets/css/design-system.css`: tokens, reset, typography, theme roles, spacing, shell, and accessibility utilities.
- `assets/css/components.css`: buttons, forms, segmented controls, tags, menus, cards, statuses, progress, and empty/loading/error states.
- `assets/css/workspaces.css`: homepage, library, dashboard, mistakes, account, and Assignment Builder composition.
- `assets/css/quiz-tool.css`: standard quiz setup, question, response, feedback, solution, and result components.
- specialized CSS files: only the irreducible graph, geometry, proof, matching, or custom-interaction layout.

Migration rules:

- Remove legacy inline base styles from `index.html`, `practice.html`, and game pages after equivalent shared styles land.
- Remove duplicate global `:root`, `body`, heading, button, form, card, and result declarations from specialized files.
- Do not solve cascade conflicts with growing chains of `!important`.
- Temporary compatibility selectors must be labeled and removed before final acceptance.
- Use low-specificity component classes and `:where()` where useful.
- State classes and data attributes describe state; page-specific selectors describe composition.
- Keep theme values in semantic variables; do not scatter dark-mode overrides through page files.

## 16. Implementation sequence

### Phase 1: Baseline and contracts

1. Record current functional test results.
2. Inventory JavaScript-observed IDs, classes, and data attributes.
3. Capture baseline screenshots for every representative surface and state.
4. Add the final token, font, spacing, state, and motion foundations.

### Phase 2: Shared shell and components

1. Rebuild header, menus, language, theme, and account presentation.
2. Rebuild buttons, controls, labels, progress, tags, status, feedback, and result components.
3. Verify keyboard, mobile menu, theme, language, and authentication state.

### Phase 3: Homepage and library

1. Recompose the workbench hierarchy without changing its data logic.
2. Rebuild course and tool cards around mathematical motifs.
3. Rebuild course/topic/search composition.
4. Restrict the pointer trail to these browse surfaces.

### Phase 4: Standard quiz migration

1. Rebuild shared setup and active-round presentation.
2. Migrate every standard tool to the shared structure.
3. Remove its duplicate inline and page-level base CSS.
4. Test question lengths, 4/5/6 choices, inputs, modes, timer, feedback, early completion, and results.

### Phase 5: Specialized tools and supporting pages

1. Adapt function graph, unit circle, geometry, proof, and custom interactions.
2. Rebuild progress, mistakes, authentication, account, legal, and Assignment Builder composition.
3. Verify theme-aware SVG/canvas rendering and mobile sequencing.

### Phase 6: Visual regression and cleanup

1. Run the complete functional suite.
2. Generate the required screenshot matrix.
3. Inspect overflow, clipping, contrast, focus, motion, and layout stability.
4. Remove compatibility CSS, unused selectors, old gradients, obsolete inline styles, and dead visual assets.
5. Perform a final Apple HIG review and frontend-design self-critique before delivery.

Do not migrate all pages blindly in one pass. Complete and validate one representative standard tool and one specialized tool before broad migration.

## 17. Verification matrix

At minimum, capture and inspect:

| Surface | English/Chinese | Light/Dark | Desktop/Tablet/Mobile |
| --- | --- | --- | --- |
| Homepage, new visitor | Required | Required | Required |
| Homepage, returning user | Required | Required | Required |
| Practice library | Required | Required | Required |
| Standard quiz setup | Required | Required | Required |
| Standard active question | Required | Required | Required |
| Long formula and long prose question | Required | Required | Required |
| Correct and incorrect feedback | Required | Required | Required |
| Results and question review | Required | Required | Required |
| Function graph matching | Required | Required | Required |
| Geometry diagram interaction | Required | Required | Required |
| Triangle proof interaction | Required | Required | Required |
| Login and account | Required | Required | Required |
| Progress and mistakes | Required | Required | Required |
| Assignment Builder | Required | Required | Required |

Functional regression must include:

- search and course selection;
- favorite controls;
- language and theme persistence;
- login state presentation and account menu;
- Learn, Practice, and Exam modes;
- all supported difficulties and choice counts;
- timer on/off and danger state;
- submit, feedback, retry where supported, next, and early completion;
- progress and mistakes persistence;
- report download entry and generation status;
- Assignment Builder validation and PDF generation.

## 18. Acceptance criteria

The rebuild is complete only when:

1. every included web page uses the shared visual language;
2. no page retains an independent legacy base theme;
3. all protected functional contracts remain intact;
4. existing automated functional tests pass without behavior changes;
5. the full screenshot matrix has been reviewed;
6. no required viewport has horizontal page overflow;
7. text, formulas, labels, diagrams, and controls do not overlap or clip;
8. light and dark themes maintain high contrast in every interaction state;
9. English and Chinese contain the same information and actions;
10. keyboard navigation, visible focus, reduced motion, and touch targets pass;
11. the homepage is immediately usable rather than promotional;
12. the practice library remains scannable as the catalog grows;
13. every tool motif accurately reflects its mathematical subject;
14. specialized tools feel part of the same product without losing their required interaction layouts;
15. score-report and assignment PDFs remain functionally and visually unchanged.

## 19. Final design-review questions

Before release, reviewers must be able to answer yes to all of the following:

- Is the primary task obvious in three seconds?
- Does every decorative element communicate mathematics, hierarchy, state, or action?
- Is the site recognizable as MathComplete Lab without relying on its logo text?
- Does the design feel composed for this subject rather than borrowed from a generic dashboard?
- Is there one memorable signature rather than many competing effects?
- Do mobile layouts adapt the task instead of merely shrinking desktop pixels?
- Are all states understandable without color alone?
- Can a student recover from errors without blame or confusion?
- Did the visual rebuild preserve every existing product behavior?
