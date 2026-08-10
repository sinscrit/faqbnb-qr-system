# Recovery API Handover

`request/route.ts` is intentionally enumeration-resistant and always returns
the same accepted response after valid input, including provider errors.
`update/route.ts` requires both the server-validated recovery session and the
short-lived, HMAC-authenticated, recovered-user-bound, HttpOnly, path-scoped
proof minted by `/auth/confirm`. It clears that proof before every request
outcome, shares server password validation, and resolves
canonical context before returning `/dashboard2`.

`AUTH_RECOVERY_PROOF_SECRET` is a required independent server secret of at
least 32 bytes. Rotation invalidates outstanding proofs. The proof is stateless:
normal browser use is single-attempt, but durable concurrent replay prevention
is not claimed without a future accepted nonce store.

Do not add identity lookups, detailed provider errors, tokens, bearer payloads,
return URLs, or service-role behavior. Real email delivery is not yet proven.
