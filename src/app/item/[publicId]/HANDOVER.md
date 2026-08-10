# Public Item Page Handover

Updated: 2026-08-10. Slice 3A.3 Phase 1 is independently accepted locally.
Phase 2/3 acceptance remains pending.

The server page and metadata call the same React request-cached
`loadPublicItem`; there is no HTTP self-fetch. The strict DTO is public ID,
name, and one or more ordered `{title,body}` instructions. Invalid, draft, and
unknown IDs use not-found. Upstream or malformed data renders an honest Retry
link to the same canonical path.

The guest surface deliberately contains no public UUID display, host nav, demo
fallback, language/translation, analytics, reactions, visits, or external
requests. Metadata and navigation use `src/lib/public-item-url.ts`; absolute
URLs require the explicitly trusted app origin. `/item/*` bypasses legacy root
providers and middleware work.

The next gate is the Phase 2 pinned clean install and complete local acceptance
matrix. Phase 3 standalone Playwright mobile/desktop acceptance follows only
after repository `browser-init`.

Phase 1 confirmed that the semantic paragraph already retained the exact
multiline body and `whitespace-pre-wrap`; only the Testing Library matcher was
wrong. The regression now asserts the paragraph's exact `textContent` and
preservation class without weakening the markup contract. The exact pinned
nine-file focused matrix passes `105/105`, with typecheck and diff hygiene also
passing. A separate validator repeated the evidence, verified the handover
corrections, and accepted Phase 1. Phase 2 clean-build, Phase 3 browser, and
Phase 4 database runtime evidence remain pending.
