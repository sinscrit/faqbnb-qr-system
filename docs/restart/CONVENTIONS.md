# Restart Conventions

## Product And UX

- Add behavior only to canonical surfaces named in `ARCHITECTURE.md`.
- Use one primary call to action per state. Secondary actions must be visually subordinate.
- Infer safe context instead of asking for redundant choices; always allow the user to change an inferred account or property.
- Use progressive disclosure for optional metadata, media, roles, and advanced settings.
- Preserve form input across recoverable failures. Pair every failure message with a next action.
- Use consistent product words: account, property, item, instruction, guest page, and system administrator.
- Meet keyboard, focus, label, contrast, and mobile layout requirements in touched UI.

## APIs And Types

- `/api/public` is unauthenticated and returns allow-listed guest DTOs.
- `/api/user` requires a user and account membership for account-owned work.
- `/api/system` requires explicit system-administrator authorization.
- Use one account-context convention selected in Slice 2A; never trust a header or parameter without server-side membership validation.
- Validate request and response boundaries with Zod. Keep database naming inside repositories/routes and expose consistent DTO naming to UI code.
- Return normalized error codes and safe messages. Do not log tokens, cookies, key fragments, email addresses, or full third-party responses.

## Database And Security

- Add ordered, idempotent-enough Supabase migrations; never patch a target database without committing the equivalent migration.
- Enable RLS on every account-owned table and storage resource.
- Test permitted same-account behavior and denied cross-account behavior with separate authenticated identities against real policies.
- Keep service-role imports in server-only modules and fail fast when required secrets are absent.
- Do not perform destructive schema/data work while `DATA_MIGRATION_DECISION.md` is pending.

## Implementation Tasks

- The restart PM delegates each implementation task; a different subagent validates the result before acceptance and commit.
- One task changes one resource boundary, route family, or user-visible behavior.
- Name canonical files, observable acceptance, security boundary, focused tests, and explicit out-of-scope areas before implementation.
- Migrate consumers one at a time. Every compatibility adapter has a removal task in `ROADMAP.md`.
- Record unrelated findings in the roadmap instead of broadening the task.
- Update the relevant `HANDOVER.md` after every logical step.

## Verification

- Required now: clean install where relevant, `npm run typecheck`, `npm run build` for app/route changes, focused tests, and a risk-appropriate smoke check.
- Account-owned changes require positive authorization and negative cross-account coverage.
- Browser checks follow repository `AGENTS.md`: initialize from `.projstuff` and use standalone Playwright MCP, never the in-app browser.
- The legacy full Vitest suite and deprecated lint command are diagnostic until Milestone 6 repairs and scopes them.

## Commits

- Commit one accepted logical step at a time with its documentation and focused tests.
- Stage explicit paths so pre-existing work is not swept into restart commits.
- Do not use destructive Git cleanup to handle unrelated changes.
