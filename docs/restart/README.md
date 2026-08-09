# FAQBNB Restart Control Center

Status: Milestone 0.1 documentation baseline, 2026-08-10.

This folder is the canonical control surface for the restart. The detailed audit remains evidence in `docs/audit/`; it is not an alternative product specification.

## Start Here

1. Read `PRODUCT_SPEC.md` for the product boundary and simplest user journey.
2. Read `ARCHITECTURE.md` and `CONVENTIONS.md` before changing code.
3. Check `ROADMAP.md` and `HANDOVER.md` for the current slice and blockers.
4. Check `DATA_MIGRATION_DECISION.md` before any database mutation.
5. Use `ENVIRONMENT.md` for runtime and secret boundaries.

If documents conflict, use this order: approved data decision, product spec, architecture, conventions, roadmap, audit evidence, legacy requirements.

## Governing Decisions

- Restart by controlled salvage; do not rewrite the product from zero.
- `/dashboard2` is the only canonical host shell.
- `/item/[publicId]` is the only canonical guest item route.
- APIs are separated by actor: `/api/public`, `/api/user`, and `/api/system`.
- `account_id` is the tenant boundary. Membership must be checked in the API and enforced by RLS.
- Supabase migrations committed to the repository become the database source of truth after live-system reconciliation.
- Railway with Nixpacks is the deployment target.

## UX Guardrails

- Present one primary action per screen and one obvious route through the host workflow.
- Auto-select the only account and property; do not ask users to choose what can be inferred safely.
- Keep creation in this sequence: property, item, instruction, publish QR.
- Reveal optional settings only when requested. Do not block publishing on optional media or advanced metadata.
- Preserve entered data when validation or network operations fail, explain the problem in plain language, and provide a clear retry or back action.
- Do not introduce duplicate dashboards, creation flows, account selectors, or navigation destinations.

## Update Discipline

Every accepted implementation slice updates `ROADMAP.md` and `HANDOVER.md`. A decision that changes product scope, trust boundaries, or canonical surfaces must update its owning document in the same commit.
