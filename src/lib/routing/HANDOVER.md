# Routing Handover

Updated: 2026-08-10.

`canonical-route-policy.ts` lists exact request-owned routes that bypass the
legacy middleware Supabase session/profile/language branch. It includes exact
`/dashboard2` so the canonical property-context API owns authentication and
recovery before any legacy redirect or remote request can occur.

Do not change this to prefix matching. Nested `/dashboard2/*` routes still load
the explicitly transitional legacy provider/dashboard shell and must remain on
their existing middleware path until each route receives a canonical slice.
Trailing-slash, nested, legacy, and OAuth callback variants are intentionally
false in the focused policy tests.

The correction was discovered by the Slice 2B.2 standalone browser run. Eleven
policy assertions, the corrected desktop/mobile matrix, exact-pinned typecheck,
and production build pass locally. Independent browser repetition is pending;
see `../../../docs/restart/SLICE_2B2_BROWSER_ACCEPTANCE.md`.

`production-route-policy.ts` remains the separate production-only prototype
and diagnostic `404` gate. Do not merge its purpose with the canonical
middleware-owned route boundary.
