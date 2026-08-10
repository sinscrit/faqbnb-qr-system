# Public Item Page Handover

Updated: 2026-08-10. Slice 3A.3 Phases 1–3 are independently accepted locally.
Phase 4 database runtime acceptance is the active next gate.

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

The Phase 2 pinned clean install and complete local matrix passed independent
validation. Phase 3 standalone Playwright evidence passes the
desktop/mobile guest matrix through the real server component and anonymous
client against a loopback fake PostgREST projection in separate executor and
validator sessions.

Phase 1 confirmed that the semantic paragraph already retained the exact
multiline body and `whitespace-pre-wrap`; only the Testing Library matcher was
wrong. The regression now asserts the paragraph's exact `textContent` and
preservation class without weakening the markup contract. The exact pinned
nine-file focused matrix passes `105/105`, with typecheck and diff hygiene also
passing. A separate validator repeated the evidence, verified the handover
corrections, and accepted Phase 1. Phase 2 executor evidence now passes
`105/105` focused and `224/224` prerequisite tests plus build/hygiene; see
`../../../../docs/restart/PHASE_2_LOCAL_APPLICATION_ACCEPTANCE.md`. A separate
validator accepted Phase 2; a separate validator accepted Phase 3. Phase 4
database runtime evidence remains pending.

Phase 3 guest evidence covers ordered semantic sections, exact LF/TAB text and
computed `pre-wrap`, canonical metadata, cookie-free loading, no guest UUID or
host navigation, mobile/desktop overflow, uniform invalid/draft/unknown
not-found title/copy/`noindex`, and sanitized unavailable Retry. The clean
23-scenario run had zero external browser requests, request failures, page
errors, or unexpected console issues. Streamed Next.js development
`notFound()` documents reported transport `200`; deployment smoke must record
the production transport result and metadata separately. The independent
validator also observed duplicate development `noindex` tags; their identical
safe directives are non-blocking. See
`../../../../docs/restart/PHASE_3_MOCKED_BROWSER_ACCEPTANCE.md`.
