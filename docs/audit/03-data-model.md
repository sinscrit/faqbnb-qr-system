# 03 Data Model

Date: 2026-07-10

## Sources Reviewed

- `database/schema.sql`
- `database/migrations/*.sql`
- `database/README.md`
- `src/lib/supabase.ts`
- `docs/req-005-Multi-Tenant-Database-Restructuring-*`
- `docs/req-008-Multi-Tenant-Database-Structure-Implementation-Phase-1-*`
- `docs/req-009-Account-Based-Property-Management-System-*`

## Current Canonical Model In Code

The generated TypeScript `Database` type in `src/lib/supabase.ts` indicates the app currently expects these tables:

| Area | Tables |
| --- | --- |
| Tenancy and users | `users`, `accounts`, `account_users`, `admin_users` |
| Properties | `properties`, `property_types` |
| QR content | `items`, `item_articles`, `item_links` |
| Access/onboarding | `access_requests`, `mailing_list_subscribers` |
| Analytics | `item_visits`, `item_reactions` |
| Localization | `item_translations`, `article_translations`, `link_translations`, `tag_translations`, `translation_jobs` |

The practical ownership chain appears to be:

```text
account
  -> account_users
  -> properties
  -> items
  -> item_articles
  -> item_links
  -> translations
```

`properties` also retain `user_id`, so the model currently mixes direct user ownership and account ownership.

## Checked-In Schema Drift

`database/schema.sql` is not sufficient to recreate the current app database. It only creates:

- `items`
- `item_articles`
- `item_links`
- `admin_users`
- `mailing_list_subscribers`

It does not create these tables that current code expects:

- `users`
- `accounts`
- `account_users`
- `properties`
- `property_types`
- `access_requests`
- `item_visits`
- `item_reactions`

It also defines older `items` and `item_links` shapes. For example, current generated types expect `items.property_id`, `items.location`, `items.tags`, and `items.source_language`, while `database/schema.sql` does not define all of those columns.

## Migration Drift

Checked-in migrations only cover localization additions:

- `20260117_l10n_foundation.sql`
- `20260118_add_preferred_language_columns.sql`
- `20260118_add_source_language_columns.sql`

The docs for REQ-008 state that account and account-user tables were created through Supabase MCP migrations, but those migrations are not present in `database/migrations`. That means a fresh environment cannot be recreated from this repository alone.

## RLS And Security Model Drift

`database/schema.sql` enables public read access on `items`, `item_articles`, and `item_links` with `USING (true)`. That may be acceptable for public QR content, but it is too broad unless every row is intentionally public and contains no host-private fields.

The checked-in schema has no account-aware RLS policies for:

- `accounts`
- `account_users`
- `properties`
- account-scoped `items`
- translations under account-owned content

REQ-008 documents account RLS policies, but those policies are not present in the checked-in SQL source of truth.

## Data Model Strengths

- The account/property/item hierarchy is a reasonable SaaS model.
- `public_id` on `items` supports stable QR URLs.
- `item_articles` gives a better instruction grouping model than flat links alone.
- `account_users` supports future team access without requiring a redesign.
- Translation tables are separated by entity type and have status fields.
- `item_visits` and `item_reactions` support basic analytics without requiring a third-party product.

## Data Model Risks

| Risk | Impact |
| --- | --- |
| Repository cannot recreate current DB | New environments and LLM agents will fail or invent schema fixes. |
| Mixed `user_id` and `account_id` ownership | Cross-tenant access rules become hard to reason about. |
| Host CRUD still uses `/api/admin/*` naming | Product roles and database roles are blurred. |
| Public read policies are broad | Private host data could become public if stored on item/link rows. |
| Generated types are manually embedded in `src/lib/supabase.ts` | Types may drift from remote Supabase without a repeatable generation command. |
| Translation migrations reference `users` and `accounts` not created by checked-in schema | Fresh setup order is incomplete. |
| `database/README.md` documents the old simple schema | Onboarding instructions are misleading. |

## Recommended Canonical Schema

For restart, make `database/migrations` the source of truth. A fresh database should be reproducible from checked-in SQL in this order:

1. Extensions and helper functions.
2. `users` profile table linked to `auth.users`.
3. `accounts`.
4. `account_users`.
5. `property_types`.
6. `properties` with `account_id NOT NULL` after migration.
7. `items` with `property_id NOT NULL`.
8. `item_articles`.
9. `item_links`.
10. `access_requests`.
11. `item_visits` and `item_reactions`.
12. Translation tables and translation jobs.
13. RLS policies.
14. Seeds for property types and system tag translations.

## Ownership Recommendation

Use account ownership as canonical:

- `accounts.owner_id` identifies the primary owner.
- `account_users` defines membership and role.
- `properties.account_id` is required.
- `properties.user_id` should either be removed later or treated only as `created_by`.
- Items inherit tenant scope through `items.property_id -> properties.account_id`.

## Immediate Remediation Tasks

1. Create a complete baseline migration that matches current generated types.
2. Replace or update `database/schema.sql` so it no longer describes the obsolete simple schema.
3. Add RLS policies for every account-owned table.
4. Add an explicit public-content policy for QR pages that exposes only intended public fields.
5. Add a command/script for regenerating `src/lib/supabase.ts` types from Supabase.
6. Update `database/README.md` with the real setup order.
