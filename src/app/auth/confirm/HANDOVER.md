# Confirmation Callback Handover

This is the single canonical email confirmation/recovery callback. It supports
Supabase PKCE codes and supported email token hashes, writes cookies through the
request-bound server client, and ignores all destination parameters. Email
confirmation must resolve current context before `/dashboard2`; recovery goes
only to `/reset-password` and mints the short-lived, HMAC-authenticated,
recovered-user-bound, HttpOnly proof scoped to the password-update endpoint.
Ambiguous code/token shapes and recovery/signup flow confusion fail closed.

Errors redirect with fixed notice keys only. Never log or echo callback values.
If a callback-created session cannot pass its application gate, deterministic
local cookie cleanup still runs when provider sign-out fails.
