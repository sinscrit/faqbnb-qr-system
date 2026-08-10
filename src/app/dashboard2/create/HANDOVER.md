# Dashboard Create Handover

Updated: 2026-08-10. Slice 3A.3 Phase 1 is independently accepted locally.
Phase 2 is independently accepted; Phase 3 acceptance remains pending.

`page.tsx` passes only the optional query property UUID hint into the
provider-free `PublishGuestPageForm`. The client always fetches fresh
`/api/user/property-context` state before using a query/session hint. One
property is automatic; multiple properties show one radio decision plus
Continue; zero properties returns to `/dashboard2`.

The form owns three fields and a guest-shaped preview. Session storage keys are
versioned and contain only property hint, form/request UUID, and submitted
snapshot. Before ambiguous submission, the canonical normalized payload is
both displayed and frozen. Retry sends the exact stored request. Discard mints
a UUID; confirmed success or explicit discard clears the snapshot. A 400 thaws
without losing content. Never add auth/account/role storage or allow a client
property hint to become tenant authority.

The accepted Phase 2 clean install, `105/105` focused matrix, `224/224`
prerequisite union, route gate, typecheck, build/build ID, source audit, and
diff hygiene passed separate review. Phase 3 standalone Playwright is the active
gate and follows only after repository `browser-init`; never use the in-app
browser.

Phase 1 now rejects CR and CRLF in recovered client drafts while preserving LF
and TAB in the frozen normalized request. Field validation keeps focus on the
first invalid field and exposes its alert as the field's accessible
description; ambiguous network and server recovery errors focus the alert.
Regression coverage proves both focus paths and the CR/CRLF boundary.

Implementation-agent evidence under exact Node `22.23.2` and npm `10.9.9`:
the historical nine-file Slice 3A.3 matrix plus six new regressions passes
`105/105`; `tsc --noEmit` and `git diff --check` also pass. A separate validator
repeated the evidence, verified the handover corrections, and accepted Phase 1.
Full executor evidence is in
`../../../../docs/restart/PHASE_2_LOCAL_APPLICATION_ACCEPTANCE.md`. A separate
validator accepted Phase 2; Phase 3 browser acceptance remains separate.
