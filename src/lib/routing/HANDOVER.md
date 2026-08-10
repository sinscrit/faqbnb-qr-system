# Routing Handover

Updated: 2026-08-10.

`canonical-route-policy.ts` lists exact request-owned routes that bypass the
legacy middleware Supabase session/profile/language branch. It includes exact
`/dashboard2` and `/dashboard2/create`, plus the `/item/*` guest prefix, so the
canonical request-owned APIs/anonymous loader own recovery before any legacy
redirect or remote request can occur.

Do not broaden dashboard matching to a prefix. Nested `/dashboard2/*` routes
other than exact `/dashboard2/create` still load the explicitly transitional
legacy provider/dashboard shell and must remain on their existing middleware
path until each route receives a canonical slice. The `/item/*` prefix is
intentional because every guest public ID route is canonical. Trailing-slash,
other nested, legacy, and OAuth callback variants remain false in focused tests.

Slice 2B.2's original correction was discovered by standalone browser testing.
Slice 3A.3 Phase 1 independently accepted the create/guest policy extension as
part of the expanded `105/105` focused matrix. Phase 2 executor evidence passes
the pinned clean build, full `224/224` prerequisite union, and separate `5/5`
production route gate; see
`../../../docs/restart/PHASE_2_LOCAL_APPLICATION_ACCEPTANCE.md`. A separate
validator accepted Phase 2; Phase 3 browser acceptance remains pending; see
`../../../docs/restart/SLICE_2B2_BROWSER_ACCEPTANCE.md` for prior evidence.

`production-route-policy.ts` remains the separate production-only prototype
and diagnostic `404` gate. Do not merge its purpose with the canonical
middleware-owned route boundary.
