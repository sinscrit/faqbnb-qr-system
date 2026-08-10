# P0 Schema Reconciliation

Captured: 2026-08-10.

Status: **COMPLETE — INDEPENDENTLY VALIDATED**

This document reconciles the independently validated, read-only evidence in
`LIVE_SCHEMA_INVENTORY.md` with the repository's SQL, TypeScript database types,
and queries used by the canonical product surfaces. It made no remote query or
mutation and does not authorize a live migration.

## Independent Validation

A separate validation agent checked this reconciliation against the committed
live inventory, local SQL and seed artifacts, database/domain types, canonical
queries, and the bounded admin compatibility dependencies. The validator
confirmed the seven-area P0 matrix, non-replayable local sequence, exact
migration-name gap, type/query drift, preservation-safe slices, and absence of
remote mutation.

Accepted corrections clarified that the inline database type has no
reproducible generator rather than asserting provenance, aligned property/item/
content slices with the governing roadmap, kept a simple selector for genuinely
multiple valid choices, added the missing trigger-function replay dependency,
expanded the plural guest-route mismatch to the item list, and recorded the
current account-header transport mismatch. These corrections are incorporated
below.

## Decision Summary

- The live project has the P0 entity chain, but the repository cannot reproduce
  it. The live migration ledger has 109 entries while the repository contains
  three differently named, partial migrations and an older manual `schema.sql`.
- `database/schema.sql`, `database/README.md`, `database/seed-data.sql`, and
  `database/seed-data-uuid.sql` are legacy bootstrap artifacts, not a valid P0
  source of truth. Do not run them against an existing or new canonical project.
- `src/lib/supabase.ts` contains the inline `Database` type, but the repository
  has no reproducible generation path. There is no
  `src/types/database.generated.ts`; `npm run db:types` only prints a placeholder
  command and generates nothing.
- The canonical UI is not yet backed entirely by canonical APIs. Host item and
  instruction screens still call `/api/admin`; those compatibility dependencies
  must be moved one consumer at a time to `/api/user`.
- The next database work must be additive and slice-based: identity/account,
  property/type, item/public content, storage, then access requests. Each slice
  needs a fresh-replay test, real authenticated RLS tests, regenerated types,
  and a canonical API consumer before acceptance.
- P0 account and property context must be inferred when there is only one valid
  choice. A returning host may resume the last server-validated choice; when
  several valid choices remain, show one simple selector. Headers and local
  storage may remember a choice but must not establish tenant authority.

## Evidence Scope

Inspected local sources:

- `database/schema.sql`, all three `database/migrations/*.sql`, both root seed
  files, `database/seeds/*.sql`, `database/setup-admin-user.sql.template`, and
  `database/README.md`;
- the inline `Database` type in `src/lib/supabase.ts`, domain/database-shaped
  interfaces in `src/types/index.ts` and `src/types/admin.ts`, and transforms in
  `src/lib/db-transforms.ts`;
- `/dashboard2`, `/item/[publicId]`, `/api/public`, and `/api/user`;
- `AuthContext`, `PropertyContext`, the shared auth/Supabase helpers, translation
  fetch helpers, and components directly used by those surfaces;
- `/api/admin` routes only when a canonical host consumer still calls them.

Deferred by design: non-P0 quiz/leaderboard tables, exhaustive translation and
analytics reconciliation, live policy predicates, provider-side auth
configuration, per-resource ownership aggregates, backup/restore proof, and any
remote mutation. Independently validated aggregate auth/provider and bootstrap
coverage is recorded in `AUTH_DISCOVERY.md`.

## P0 Reconciliation Matrix

| P0 area | Validated live presence and shape | Reproducible locally? | Type coverage | Canonical consumer coverage | Mismatch / risk | Proposed migration slice |
| --- | --- | --- | --- | --- | --- | --- |
| Accounts | `accounts(id, owner_id, name, description?, settings?, created_at?, updated_at?)`; owner FK to `auth.users`; unique `(owner_id, name)` | **Isolated baseline added; Supabase 17 replay pending.** Slice 2A.1 creates the validated base fields, stronger null/default constraints, indexes, least grants, and RLS, and fails closed if boundary objects already exist | Inline and domain types cover the live fields; domain `settings` is non-null while live is nullable | Auth helpers and `/api/user/properties` resolve memberships/accounts; dashboard stores a selected account client-side | Live policies include temporary/broad labels; account selection is duplicated across helpers; some code queries nonexistent `accounts.preferred_language` | **2A.1 Identity/account bootstrap:** fresh isolated `users`, `accounts`, membership, updated-at trigger, indexes and RLS; deterministic, server-validated P0 account context. A future live migration remains separate and approval-gated |
| Memberships / users | `account_users(account_id, user_id, role, invited_at?, joined_at?, created_at?)`; `users` mirrors auth identity and admin/profile metadata | **Isolated baseline added; Supabase 17 replay pending.** The unsafe live auth trigger is not copied; an authenticated, server-derived, idempotent RPC owns profile/account/membership bootstrap | Inline types cover live base columns, but `users.preferred_language` is typed and queried although absent live. Role unions are application assumptions, not a validated live constraint | Every `/api/user` stats/property route reaches `account_users`; `AuthContext` uses `getAccountsForUser`; language API reads/writes `users.preferred_language` | 21 auth users vs 11 profiles; aggregate discovery shows every profile has an owner-role membership on an account owned by the same auth user and ten auth users have none of those application records, but their individual states remain unclassified; many `.single()` calls assume one membership; client-imported auth code uses the misleading `supabaseAdmin` helper, which falls back to the anon browser client when no server key is available | **2A.1** under `AUTH_DISCOVERY.md`: preserve every identity, use email/password as primary, and repair/bootstrap only in an isolated target until classification and restore proof exist |
| Properties / types | `properties(id, user_id!, property_type_id!, nickname!, address?, account_id?, timestamps)` plus seven `property_types` rows | **No.** Neither table nor seed exists in a replayable migration | Inline types match the validated live columns. Domain `Property` adds nonexistent `thumbnail_url` | Canonical add/edit/list uses `/api/user/properties`; property context auto-selects the first property; item/admin compatibility APIs join through properties | `account_id` is nullable while `user_id` is required. `/api/user/properties/[propertyId]` selects nonexistent `name` and `description`. Some queries require both account and legacy user ownership, excluding valid account members | **2B Property/type:** create/seed types, create property model, backfill account ownership, RLS, then make the canonical tenant invariant enforceable only after coverage is proven |
| Items / public ID | `items` requires unique `public_id` and `property_id`; includes name, description, QR fields, tags and source language | **Partial but invalid.** `schema.sql` creates items without `property_id` or `tags`; source language is a later patch | Inline type adds nonexistent live `location`; domain types make nullable timestamps/tags effectively non-null and omit source language | `/dashboard2/items`, create and edit still call `/api/admin/items`; print uses `/api/user/properties/[propertyId]/items`; guest route resolves by `public_id` | Dashboard stats queries absent `items.location`. Create and item-list code construct `/items/{id}` while the canonical guest route is `/item/{id}`. Host APIs additionally require `properties.user_id === user.id`, conflicting with account membership semantics | **2C Item/public identity:** property-owned item table/constraints/indexes, membership-based RLS, then canonical `/api/user/items` migration |
| Articles / links | `item_articles.item_id!`; `item_links.item_id?` and `article_id?`; content is title/description plus typed URLs; no standalone instruction table | **Partial but invalid.** Base SQL omits article description/source language, makes article `item_id` nullable, and lacks the live migration history | Inline types broadly match live. Domain `ItemLink.item_id`, timestamps and display order are stricter than live; API/domain article types use camelCase projections | Public guest helper fetches items/articles/links and translations; dashboard instruction screens still call `/api/admin/articles`; item create/edit writes nested content | Both link parents may be null live, so reachability/ownership is unproven. Public helper uses `supabaseAdmin`, bypassing RLS when a service key exists. Article compatibility APIs query absent preferred-language columns | **3 Instructions/public read/QR:** exact article/link constraints, orphan audit/backfill, tenant write RLS, intentionally guest-safe projections, and one public URL builder; do not require media to publish text instructions |
| Media / storage | Public `item-media` bucket, eight aggregate objects, four storage policy labels; URLs live in `item_links`/thumbnails | **No.** No bucket or storage policy migration is checked in | No generated storage schema type; link URL fields exist; property thumbnail is type-only | Create workflow uploads through `/api/admin/upload`; print generates via `/api/admin/generate-pdf` | Object paths/owners and policy predicates are unknown. A public bucket plus service-side upload does not prove tenant-safe writes. Media is optional for P0a | **4/P0b media:** create bucket idempotently, account/property/item path convention, authenticated ownership policies, public-read decision and orphan reconciliation |
| Access requests | `access_requests` has 19 validated columns and nullable `account_id`; no public profile relation required | **No.** No local creation or policy migration | Inline and admin types add three absent live columns: `email_sent_date`, `registration_completed_date`, `approval_notes` | `/api/public/access-request` searches account names with anon access, inserts with `supabaseAdmin`, and exposes status lookup by email or request ID | Public account-name search/status lookup creates enumeration/privacy risk; live policy labels do not show public insert/select; feature is not needed for the one-path signed-in P0a flow | **Deferred compatibility slice:** reproduce only after auth scope is chosen; replace enumeration with opaque receipt/status semantics or explicitly remove from P0 |

## Local Replay Findings

### The checked-in sequence cannot create P0

A migration runner starting from an empty database fails because the first local
migration, `20260117_l10n_foundation.sql`, references `items`, `item_articles`,
`item_links`, and `users`, none of which are created by an earlier migration. Its
triggers also depend on `update_updated_at_column()`, which no migration creates.

Following `database/README.md` does not fix this. Its manual `schema.sql` creates
the three content tables, but not `users`; the localization migration still
references the missing user table. The next migration alters missing `users` and
`accounts`. No documented order produces the validated live P0 chain.

### Legacy bootstrap artifacts

| Artifact | Finding | Required disposition |
| --- | --- | --- |
| `database/schema.sql` | Old admin-centric snapshot: five tables only; no account/property chain; item shape is incompatible with live | Mark historical and replace with migration-only bootstrap after the slice migrations exist |
| `database/README.md` | Instructs manual SQL-editor execution and service-role copying; omits migrations, local replay, RLS tests, storage and tenant model | Rewrite with one non-interactive local/test workflow; never instruct application developers to paste a service key into client-facing setup |
| `database/seed-data.sql` | Inserts items without required live `property_id`; uses legacy readable IDs and remote URLs | Retire from canonical replay; replace with deterministic account -> property -> item -> article/link seed |
| `database/seed-data-uuid.sql` | Also inserts items without `property_id`; random IDs prevent deterministic assertions | Retire from canonical replay |
| `database/setup-admin-user.sql.template` | Manual placeholders bypass auth bootstrap and updates properties by legacy `user_id` | Keep only as historical evidence or remove after canonical bootstrap tooling exists; never make it the P0 setup path |
| `database/seeds/20260117_system_tag_translations.sql` | Depends on translation tables and is not required for P0a | Defer until the localization slice has a replayable base |

## Exact Migration-History Gap

The repository and live migration ledger share **zero exact migration names**:

- Live: 109 ledger entries recorded in `LIVE_SCHEMA_INVENTORY.md`.
- Local: `20260117_l10n_foundation`,
  `20260118_add_preferred_language_columns`, and
  `20260118_add_source_language_columns`.
- The live ledger contains similarly named entries for localization foundation
  and source language (`20260118045251_l10n_foundation` and
  `20260118045628_add_source_language_columns`). There is no live ledger entry
  matching the local preferred-language migration, consistent with the validated
  absence of those columns.

Every one of the 109 live names is absent locally. The following exact names are
the minimum structural P0 lineage relevant to the reconciled entities; they must
be represented by new, reviewed canonical slice migrations rather than copied
blindly from their names:

```text
20250720075835_create_new_schema
20250720075842_setup_rls_policies
20250720080019_fix_function_search_path
20250720080026_optimize_rls_policies
20250721060338_update_public_ids_to_uuid
20250723013331_add_missing_qr_code_columns
20250725012607_create_property_types_table
20250725012708_create_users_table
20250725012822_create_properties_table
20250725012922_add_property_to_items
20250725013048_create_default_properties_for_existing_items_v2
20250725013149_make_property_id_required
20250725013304_setup_multitenant_rls_policies
20250725013429_update_items_rls_for_properties
20250726042549_create_accounts_table
20250726042740_create_account_users_table
20250726042943_add_account_id_to_properties
20250726043152_create_accounts_rls_policies
20250806013402_add_source_metadata_to_access_requests
20250806013841_fix_accounts_owner_id_foreign_key
20250806041532_add_access_requests_rls_policies
20250806041555_enable_access_requests_rls
20250806064233_add_denial_columns_to_access_requests
20250806065358_update_access_requests_status_constraint
20250806084557_add_is_admin_flag_to_users
20250806094029_create_access_requests_table
20250807120232_add_access_code_status_index
20250807122557_add_oauth_fields_to_users
20260109125124_add_item_media_storage_policies
20260109125259_add_video_link_type_to_item_links
20260110004334_create_item_articles_table
20260110004402_add_item_articles_indexes
20260110004417_enable_item_articles_rls
20260110004434_add_item_articles_public_select_policy
20260110004451_add_item_articles_owner_policy
20260110004929_add_article_id_to_item_links
20260110004950_add_item_links_article_index
20260110005619_drop_basic_item_articles_policies
20260110005643_add_item_articles_owner_select_policy
20260110005644_add_item_articles_owner_update_policy
20260110005645_add_item_articles_owner_delete_policy
20260110005646_add_item_articles_public_select_policy
20260110011936_migrate_links_to_articles_phase_a
20260110011955_migrate_links_to_articles_phase_b
20260110233459_add_tags_to_items
20260207153816_create_handle_new_user_trigger
```

This is an exact ledger-to-file gap, not a claim that every historical live
migration should be recreated one-for-one. The canonical history should encode
the final P0 invariants in a small additive sequence and preserve live data via
explicit backfills and compatibility windows.

## Type Reconciliation

### Database type source

`src/lib/supabase.ts` resembles generated Supabase output but is an inline file
edited in place, with no reproducible generator in the repository. Its
`Relationships` arrays are empty, and several live relations are therefore not
type-checked. `npm run db:types` is a placeholder `echo`; its named output file
does not exist. A real, pinned generation command must target an isolated schema
produced from committed migrations, not the live project.

### Confirmed P0 type drift

| Type location | Drift from validated live P0 |
| --- | --- |
| `Database.users` | Adds `preferred_language`, absent live |
| `Database.items` | Adds `location`, absent live |
| `Database.access_requests` | Adds `email_sent_date`, `registration_completed_date`, and `approval_notes`, absent live |
| `Database.*.Relationships` | Empty despite validated foreign keys, so joined-query shapes are not generated evidence |
| `types/index.ts: Account` | Treats nullable live `settings` as required/non-null |
| `types/index.ts: Property` | Adds `thumbnail_url`, absent live |
| `types/index.ts: Item` | Treats nullable live tags/timestamps as non-null and omits source language |
| `types/index.ts: ItemLink` | Treats nullable live `item_id`, `display_order`, and `created_at` as non-null |
| `types/admin.ts: AccessRequest` | Repeats the three absent access-request columns |

Regenerate database types after each accepted schema slice, then keep camelCase
DTOs separate and transform explicitly in `db-transforms.ts`.

## Canonical Query Findings

### Canonical `/api/user` coverage

- Account/membership: property, activity and dashboard endpoints select the first
  or only `account_users` row. Several use `.single()`, so multiple memberships
  can turn automatic context into a query error rather than a deterministic
  selection.
- Property: list/create uses live columns, but
  `/api/user/properties/[propertyId]` selects `properties.name` and
  `properties.description`, which do not exist live. It must use `nickname` and
  `address`.
- Dashboard: `/api/user/dashboard/stats` selects `items.location`, absent live.
  Rooms are already encoded in tags elsewhere, so P0 should derive room counts
  from the canonical tag convention rather than add a second location field.
- Language: `/api/user/language` reads and writes `users.preferred_language`,
  absent live. This route cannot be treated as operational until a deliberate
  preference migration is accepted.
- Property authorization often filters both `account_id` and `user_id`. That
  blocks a legitimate account member from shared property data and preserves two
  competing tenant rules. P0 authorization must derive from account membership.

### Public guest coverage

- `/item/[publicId]` calls `/api/public/items/[publicId]`, which resolves `items`
  by unique `public_id` and fetches articles, links and translations.
- The translation helper and language endpoint use `supabaseAdmin`; with a
  service-role key present this bypasses RLS. The response is therefore safe only
  if its explicit projection and public-content rule are safe. There is no live
  publication-status column, so current public access means every resolvable item.
- `/api/public/access-request` uses anon account-name search, service-role insert,
  and status lookup by email/request ID. This is not part of the low-friction P0a
  host/guest path and requires a separate privacy/security decision.

### Remaining `/api/admin` dependencies from canonical UI

These are compatibility dependencies, not endorsement of `/api/admin` as the
host API namespace:

| Canonical consumer | Compatibility call | Data dependency |
| --- | --- | --- |
| `/dashboard2/create` | list properties/items, create item; upload media | accounts/memberships, properties/types, items, articles, links, `item-media` |
| `/dashboard2/items` and item edit | list/get/create/update/delete item | users/admin users, memberships, properties, items, articles, links, analytics |
| `/dashboard2/instructions` and edit | list/get/update article | users, accounts/memberships, properties, items, articles, links, translation preferences/jobs |
| `/dashboard2/print/[propertyId]` | generate PDF | no database access in the PDF handler; item data arrives from `/api/user` |
| Item-manager analytics UI | item analytics | admin user, items, item visits, analytics RPC fallback |

The account-context transports do not match: these canonical consumers send
`x-current-account`, while the admin item/article/property helpers read
`account_id` or `x-account-id`. The create page also prepares
`x-current-account` but does not pass it to `adminApi.createItem`. The compatibility
handlers therefore fall back to their own first-membership behavior instead of
honoring the visible selection. This is a functional compatibility defect, not a
reason to preserve either header; Slice 2A must choose one server-validated
contract.

Migration order must not be distorted to preserve these route names. Implement
canonical `/api/user` contracts, move one visible consumer, test account denial,
then remove the corresponding compatibility call.

## Preservation-Safe Migration Strategy

1. **Create an isolated replay target.** Add local Supabase configuration and a
   single migration directory; do not mutate live or rewrite its ledger.
2. **Slice 2A.1 — identity/account.** In a fresh isolated target, reproduce
   public profiles, accounts, memberships, the safe updated-at trigger and
   indexes. Replace the externally executable live auth trigger with an
   authenticated bootstrap RPC that derives identity data server-side. Add real
   two-identity RLS tests. Resolve one P0 account on the server; do not trust
   `x-current-account` or local storage without membership validation. Keep the
   future preservation-safe live migration separate and approval-gated.
3. **Slice 2B — property/type.** Seed stable property types, reproduce
   properties, and backfill `account_id` in a rehearsal copy. Preserve `user_id`
   during the compatibility window; make account ownership canonical only after
   null/orphan/ambiguous counts are zero.
4. **Slice 2C — item/public identity.** Reproduce the property FK, unique public
   ID, QR fields and tags. Remove the phantom `location` contract.
5. **Slice 3 — text content/public page/QR.** Reproduce articles and links, audit
   orphan links, and define explicit guest-read vs member-write policies.
   Introduce one URL builder for `/item/{publicId}`. Text instruction publishing
   must work without optional media.
6. **Slice 4/P0b — storage.** Reproduce `item-media` only after an account-owned
   object path and deletion policy are testable.
7. **Deferred access slice.** Email/password is the initial method. Reconcile
   public request privacy and status semantics only after P0a; do not make the
   legacy code-request flow a registration prerequisite.
8. **For every slice:** apply migrations from zero, seed two accounts, exercise
   allow/deny behavior as authenticated users without service role, regenerate
   types, run focused API tests, and update this reconciliation.

## Evidence Still Required Before Live Mutation

- Provider-side auth configuration, staging confirmation/recovery delivery, and
  existing-Google compatibility callback verification; aggregate identity
  evidence is independently validated and complete in `AUTH_DISCOVERY.md`.
- Ownership coverage: null/orphan/ambiguous accounts, profiles, properties,
  content parents and storage paths.
- Full policy predicates/grants and two-real-identity behavior.
- Verified backup/export timestamp and isolated restore rehearsal.
- Accountable approval and rollback record in `DATA_MIGRATION_DECISION.md`.

Until those exist, the binding decision remains preservation-safe discovery.
