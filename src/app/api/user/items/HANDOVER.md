# Canonical User Item API Handover

Updated: 2026-08-10.

`route.ts` is the independently accepted local Slice 3A.3 atomic publication
boundary. Keep it POST-only,
same-origin, JSON-only, 32 KiB-bounded, strict, and `no-store`. The exact input
is property UUID, publication-request UUID, one normalized 120-code-point item
name, and one normalized instruction title/body. Reject all extra identity,
tenant, description, publication, URL, QR, and media fields. Normalize UUIDs to
lowercase. Names/titles are NFKC-normalized single lines; the instruction body
preserves LF and TAB but rejects CR, CRLF, unsafe controls, format/surrogate
characters, U+2028, and U+2029.

Publication must use the request-bound cookie client. `publishCurrentItem`
freshly resolves current user/account and revalidates the property hint before
invoking only `publish_current_item_with_instruction`; require one strict
matching row and return only public ID/name plus title/body. Never add GET/list
behavior, service role, raw errors, or client tenant authority.

Map RPC SQLSTATE `23505` to sanitized `409 PUBLISH_CONFLICT`. It means a request
UUID was reused after changing content; the client must mint a new UUID before
submitting that intentional change. Do not present it as retryable 503.

Phase 1 now validates the database-facing DTO independently of the HTTP parser,
rejects CR/CRLF before property or RPC work, preserves LF/TAB, and maps property
failures into the exact `PublicationResult` shape without leaking
`authenticated`. The exact pinned nine-file focused matrix passes `105/105`,
with typecheck and diff hygiene also passing. Separate review verified these
contracts and accepted Phase 1. Phase 2 executor evidence now passes the pinned
clean install, `105/105` focused and `224/224` prerequisite tests, route gate,
typecheck, build/build ID, source scans, and diff hygiene; see
`../../../../../docs/restart/PHASE_2_LOCAL_APPLICATION_ACCEPTANCE.md`.
Separate review accepted Phase 2; Phase 4 Supabase 17 runtime proof remains
pending. No remote mutation is
allowed against the existing data-bearing project while the restart data
decision is pending. Plan-governed disposable acceptance and a fresh isolated
internal target are allowed only after their respective gates pass.
