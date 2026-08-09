# Product Specification

## Product Promise

FAQBNB lets a short-term-rental host publish clear instructions for a property item and place a QR code where a guest needs help. Guests reach useful information immediately, without an account.

## P0 Users

- **Host:** creates and maintains guest instructions for properties they are authorized to manage.
- **Guest:** scans a QR code and reads the published item instructions.
- **System administrator:** operates the platform; this is not a host role or a P0 user journey.

## Canonical Host Journey

The host has one obvious path:

1. Sign in or create a host identity.
2. Name the first property. The app creates and selects the host's account context automatically where safe.
3. Name an item and add at least one plain-text instruction.
4. Preview and publish the guest page.
5. View or download the QR code that opens that page.

Returning hosts land in `/dashboard2` with their last valid property selected. If there is only one valid account or property, selection is automatic. Account and property controls remain available but do not interrupt the primary path.

## Guest Journey

1. Scan or open `/item/[publicId]`.
2. See the item name and published instructions in a mobile-first view.
3. Use visible language or accessibility controls only when relevant.

No login, account selection, or host-only metadata is exposed to a guest.

## P0 Acceptance

- A new host can complete the canonical journey without visiting another dashboard shell.
- A host can resume after a validation or network failure without re-entering completed work.
- One property contains one item with at least one useful plain-text instruction.
- One canonical URL builder supplies preview, share, and QR links.
- The public page works without authentication and contains only guest-safe fields.
- Account A cannot read or mutate Account B data through UI, API, database policy, or storage policy.
- The flow succeeds on Railway staging against a database created from committed migrations.

## Scope Increments

- **P0a — useful page:** identity, automatic account bootstrap, property, item, plain-text instruction, and guest page.
- **P0b — publish:** canonical public URL, QR output, and at most one optional guest-visible image where product validation proves it useful.
- **P0c — dependable operation:** focused tests, CI, staging deployment, backup, migration validation, and recovery.

All three increments are required for maintainable P0. The split exists to create earlier observable checkpoints.

## Initial Product Decisions

- Start with one documented authentication path in the canonical UI. Select the exact method during live auth discovery; do not expose multiple competing registration paths before one works end to end.
- The minimum useful content is plain text. Media is optional and must never block P0a publishing.
- Minimum roles are account owner and member. Advanced roles and invitations are deferred.
- An item is published when it has a stable `publicId` and at least one guest-visible instruction. Draft behavior may be added only if needed to prevent accidental publication.
- Destructive actions require confirmation and explain their impact. Ordinary creation and editing should not require confirmation dialogs.

## Deferred

PDF export beyond preserving canonical links, translation jobs, analytics dashboards, billing, advanced roles, bulk import, complex media editing, native apps, and duplicate admin/user shells are P1 or later.

## UX Success Measures

- No more than four content decisions are required before the first useful guest preview: property name, item name, instruction title, instruction body.
- Every empty state offers one primary next action.
- Back navigation does not discard entered data without warning.
- Errors name the failed action and offer retry or recovery; raw database/auth errors are never shown.
