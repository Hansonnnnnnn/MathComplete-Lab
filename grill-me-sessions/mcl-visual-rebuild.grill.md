# Grill Session: mcl-visual-rebuild

Started: 2026-08-27
Last updated: 2026-08-27
Status: complete
Domain: MathComplete Lab full-site visual redesign using Apple HIG and frontend-design principles, without changing product logic.

## Summary

MathComplete Lab will be visually rebuilt as a precise but lively mathematics studio for U.S. students in grades 7–12. The redesign covers every interactive web page while preserving quiz generation, scoring, modes, authentication, reporting, assignments, progress, and all existing JavaScript/DOM contracts; PDF layouts remain outside the redesign.

## Existing-System Findings

- The site already has shared light/dark design tokens and a shared application header in `assets/css/design-system.css`.
- Legacy page CSS and inline styles remain in the homepage, practice library, and shared quiz stylesheet, including old gradients, oversized radii, decorative backgrounds, and duplicated component rules.
- The product includes standard quiz pages, specialized graph and geometry tools, account and progress pages, report output, and an assignment builder.
- The redesign must preserve existing DOM contracts and JavaScript behavior unless a visual wrapper can change without altering logic.

## Decision Log

### DECIDED: Session name
- **Decision**: Use `mcl-visual-rebuild`.
- **Rationale**: Short, durable, and clearly scoped to the site-wide visual redesign.
- **Date**: 2026-08-27

### DECIDED: Redesign scope
- **Decision**: Redesign every interactive web surface: homepage, practice library, all quiz tools and result states, progress, mistakes, authentication, account, assignment builder, and legal pages.
- **Rationale**: A unified system requires every user-facing web flow to share the same hierarchy, components, themes, and interaction language.
- **Exclusion**: Existing score-report and assignment PDF layouts are not redesigned; only their website entry points must align visually.
- **Date**: 2026-08-27

### DECIDED: Core visual personality
- **Decision**: Use a "precise but lively modern mathematics studio" direction.
- **Rationale**: Apple HIG supplies clarity, restraint, hierarchy, and feedback; mathematical diagrams, notation, coordinate systems, and course colors supply a distinctive identity rooted in the product itself.
- **Guardrails**: Do not imitate Apple through superficial blur or glass effects. Avoid childish game styling, generic education SaaS styling, and cold enterprise-dashboard styling.
- **Date**: 2026-08-27

### DECIDED: Primary audience
- **Decision**: Design primarily for U.S. students in grades 7–12, with high-school visual maturity as the baseline.
- **Rationale**: The curriculum spans Pre-Algebra through calculus; the interface must be approachable without becoming childish and rigorous without reading like a university textbook.
- **Adaptation**: Pre-Algebra may use more direct visual scaffolding, while teacher tools may use higher information density, but the visual system remains consistent.
- **Date**: 2026-08-27

### DECIDED: Signature visual element and cursor motion
- **Decision**: Make responsive, subject-accurate mathematical diagrams the site's signature element. Each course and tool receives a distinct motif with a restrained construction or state animation.
- **Rationale**: The signature emerges from the product's mathematical subject instead of generic decoration.
- **Cursor trail**: Keep the time-varying color trail on the homepage and practice library only. Disable it in quizzes, authentication, account, legal, and assignment-form contexts, and whenever reduced motion is requested.
- **Date**: 2026-08-27

### DECIDED: Design-detail delegation
- **Decision**: Do not interview the user about detailed color values, typography choices, animation curves, shadows, component styling, or decorative treatment.
- **Rationale**: Those decisions will be derived in the specification from the Apple HIG and frontend-design principles. The interview will cover only product-level visual logic and information hierarchy.
- **Date**: 2026-08-27

### DECIDED: Homepage hierarchy
- **Decision**: Keep the homepage as a learning workbench rather than a marketing landing page.
- **Behavioral hierarchy**: Returning users see continuation and review actions first; users without history see course entry points and a recommended starting point first. Brand explanation follows the usable content.
- **Constraint**: Preserve existing recommendation and progress logic.
- **Date**: 2026-08-27

### DECIDED: Practice-library hierarchy
- **Decision**: Preserve a three-level information model: course, topic, tool.
- **Desktop**: Persistent course navigation on the left; topic-grouped tools on the right.
- **Mobile**: Replace the course sidebar with a top course selector.
- **Search**: Search filters tool results without changing catalog ownership or adding new advanced filters.
- **Date**: 2026-08-27

### DECIDED: Quiz-page information order
- **Decision**: Standardize the visual reading order as session summary, status/progress, instruction, question or visual, response control, feedback/solution, and next action.
- **Special tools**: Graph, geometry, proof, matching, and other custom interactions may adapt the central workspace but must preserve the shared status, feedback, and action hierarchy.
- **Constraint**: Do not change question generation, scoring, mode behavior, or interaction semantics.
- **Date**: 2026-08-27

### DECIDED: Mobile quiz action model
- **Decision**: Use a single-column mobile quiz layout with one persistent bottom primary action.
- **Behavior**: Question content, visuals, and response controls scroll normally; the bottom action presents only the currently valid primary command, such as submit or next.
- **Constraint**: Preserve existing action handlers and validation behavior.
- **Date**: 2026-08-27

### DECIDED: Active-round settings visibility
- **Decision**: Collapse the full settings panel after a round starts into a one-line summary of difficulty, mode, question count, and timer state.
- **Behavior**: Keep an explicit control for reopening the complete settings UI.
- **Constraint**: Preserve current settings values, controls, and round-reset behavior.
- **Date**: 2026-08-27

### DECIDED: Results-page hierarchy
- **Decision**: Present answered count, correct count, accuracy, and wrong count first; then the per-question review; then follow-up actions.
- **Actions**: Practice again is primary. Similar-wrong-type practice and PDF download are secondary.
- **Constraint**: Avoid large celebratory animation or duplicate summaries that compete with review content.
- **Date**: 2026-08-27

### DEFERRED: Global navigation presentation
- **Reason**: The user wants the final navigation presentation selected through UX evaluation rather than preference alone.
- **Open questions**: Whether teacher assignment access belongs only on the homepage or also in the account/menu surface; exact desktop and mobile presentation.
- **Resolution path**: Compare representative task completion, discoverability, header crowding, and mobile reachability under the Apple HIG and frontend-design review procedure.
- **Risk if ignored**: An aesthetically clean header could hide useful destinations, while an over-complete header could reduce clarity and mobile usability.
- **Date**: 2026-08-27

### DECIDED: Markup migration boundary
- **Decision**: HTML structure, semantic wrappers, and visual classes may change to support a coherent design system.
- **Protected contracts**: Preserve existing DOM IDs, data attributes, form fields, event entry points, and JavaScript interfaces.
- **Hard constraint**: Do not alter question banks, scoring, modes, authentication, progress, reports, assignments, or other product behavior.
- **Date**: 2026-08-27

### DECIDED: Acceptance coverage
- **Decision**: Treat the following as hard visual acceptance criteria.
- **Viewports**: 1440x900, 1024x768, and 390x844.
- **States**: English/Chinese, light/dark, authenticated/guest.
- **Representative surfaces**: standard quiz, long mathematics, function graph, geometry diagram, proof interaction, assignment builder, and every remaining web page.
- **Quality floor**: no horizontal overflow, overlap, low contrast, clipping, unexpected layout shift, inaccessible focus, ignored reduced-motion preference, or undersized touch targets.
- **Regression**: Existing automated functional behavior must remain unchanged.
- **Date**: 2026-08-27

### DECIDED: Copy-editing boundary
- **Decision**: Interface microcopy may be clarified or shortened from the learner's point of view.
- **Allowed**: Buttons, empty states, settings help, navigation labels, and error-recovery messages.
- **Protected content**: Mathematical prompts, conditions, answers, solution steps, and bilingual mathematical meaning may not change.
- **Date**: 2026-08-27

## Open Threads

- None. Detailed aesthetic decisions are delegated to the Apple HIG and frontend-design procedures and resolved in the final specification.

## Parking Lot

- Navigation presentation remains an evidence-based implementation gate: retain or adapt the current destinations according to representative desktop and mobile UX testing.
- Downloaded PDFs are explicitly outside the redesign scope.
