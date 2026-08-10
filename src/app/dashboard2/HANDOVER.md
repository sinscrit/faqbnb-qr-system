# Dashboard 2 Handover

Updated: 2026-08-10.

The exact `/dashboard2` route is the Slice 2B.2 canonical provider-free home.
It depends only on `GET/POST /api/user/property-context` and the cookie-backed
logout endpoint. Keep it single-column with one primary action per state and do
not reintroduce legacy navigation, stats, settings, translations, `AuthContext`,
`PropertyContext`, browser Supabase, or account local storage.

Only `faqbnb_last_property_hint` may persist, and only as an untrusted property
UUID checked against a fresh server choice list before POST revalidation. Never
persist account context, roles, identities, or tokens. The first-item link may
carry only `propertyId` as an untrusted hint.

`Dashboard2ProviderBoundary` dynamically retains `Dashboard2LayoutClient` for
nested transition routes but does not initialize it for the exact home or exact
`/dashboard2/create` publication route. Those other nested routes remain legacy
work. Both canonical routes must remain in the middleware-owned route policy so
legacy session/profile work cannot redirect before their request-bound APIs
respond. Slice 2B.2 browser evidence remains recorded in
`../../../docs/restart/SLICE_2B2_BROWSER_ACCEPTANCE.md`.

Slice 3A.3 Phase 1 independently accepted the provider-free create route, its
property-hint-only form boundary, and the expanded `105/105` focused matrix.
Phase 2 pinned clean-build acceptance and the broader Phase 3 mocked browser
matrix remain pending; standalone browser work must follow repository
`browser-init`.
