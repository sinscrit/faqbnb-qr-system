# Canonical User Item API Handover

Updated: 2026-08-10.

`route.ts` is the unvalidated Slice 2C.2 candidate. Keep it POST-only,
same-origin, JSON-only, 16 KiB-bounded, strict, and `no-store`. The exact input
is property UUID, creation-request UUID, and one normalized 120-code-point item
name. Reject all extra identity, tenant, description, publication, URL, QR, and
media fields. Normalize UUIDs to lowercase. NFKC-normalize the name, reject
control/format characters including newline and tab, then collapse whitespace.

Creation must use the request-bound cookie client. `createCurrentItem` freshly
resolves current user/account and revalidates the property hint before invoking
`create_current_item`; require one strict matching row and return only public
ID/name. Never add GET/list behavior, service role, raw errors, or client tenant
authority.

Map RPC SQLSTATE `22023` to sanitized `409 ITEM_CREATION_CONFLICT`. It means a
request UUID was reused after changing content; the client must mint a new UUID
before submitting that intentional change. Do not present it as retryable 503.

Focused implementation tests and pinned typecheck/build pass. Independent
validation, Supabase 17 runtime proof, host UI wiring, instructions, and
publication remain pending. No remote mutation is allowed while the restart
data decision is pending.
