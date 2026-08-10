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
nested transition routes but does not initialize it for the exact home. Those
nested routes remain legacy work. Independent local validation passes;
live/mocked standalone browser acceptance is pending.
