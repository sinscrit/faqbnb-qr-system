# Live Supabase P0 Inventory

Captured: 2026-08-10 01:44:25 CEST (+0200)

Status: **COMPLETE — INDEPENDENTLY VALIDATED READ-ONLY EVIDENCE**

Target: connected live FAQBNB project (project identifier intentionally omitted).

## Safety And Method

This inventory was collected through the connected Supabase MCP using only:

- `mcp__supabase__get_project_url`
- `mcp__supabase__list_tables` with compact `public` output
- `mcp__supabase__execute_sql` with catalog-only `SELECT` queries and aggregate `count(*)` queries
- `mcp__supabase__list_migrations`
- `mcp__supabase__get_advisors` with `type: security`

No migration was applied. No DDL, DML, branch operation, function deployment, storage mutation, or other remote mutation was performed. No application row, email, UUID, key, credential, or secret was returned to or written into this document. Counts are aggregates only. Policy predicates and function bodies were deliberately not collected.

## Independent Validation

A separate validation agent performed a fresh, bounded read-only re-query and confirmed the inventory on 2026-08-10. The validator independently matched the 26-table compact public-schema listing and RLS flags, the nine P0 table shapes and constraints, exact aggregate counts, policy/index/function metadata, the one-bucket/eight-object storage summary, the 109-entry migration ledger, and the eight security-advisor warnings. The validator returned no application rows or identity values and made no remote mutation.

The fresh catalog query found nine non-internal triggers across the inspected live scope. This document intentionally lists only the five P0-relevant triggers below; the other four belong to deferred non-P0 table groups. Validation also confirmed that policy predicates, ownership coverage, auth-provider distribution, backup/restore evidence, and local-to-live reconciliation remain outside this bounded inventory and therefore unresolved.

## Public Schema At A Glance

The compact inventory reports 26 public tables, all with RLS enabled:

`accounts`, `account_users`, `access_requests`, `admin_users`, `article_translations`, `creators`, `daily_scores`, `enrollments`, `item_articles`, `item_links`, `item_reactions`, `item_translations`, `item_visits`, `items`, `leaderboard_notifications`, `link_translations`, `mailing_list_subscribers`, `participants`, `properties`, `property_types`, `questions`, `quizzes`, `sent_questions`, `tag_translations`, `translation_jobs`, and `users`.

Only the nine P0-relevant tables below received detailed inspection. There is no standalone `instructions`, `content`, or `media` table. The live content/media representation is `item_articles` plus `item_links`; binary objects are in the `item-media` storage bucket.

## Exact Aggregate Counts

These are exact `count(*)` results, not the estimated row figures in compact table metadata.

| Relation | Rows |
| --- | ---: |
| `auth.users` | 21 |
| `public.users` | 11 |
| `public.accounts` | 11 |
| `public.account_users` | 11 |
| `public.properties` | 17 |
| `public.property_types` | 7 |
| `public.items` | 23 |
| `public.item_articles` | 14 |
| `public.item_links` | 34 |
| `public.access_requests` | 23 |

The aggregate mismatch between 21 auth identities and 11 public user profiles is preservation-relevant. It does not identify which identities are unmatched, why they are unmatched, or whether every account-owned row has a valid owner.

## P0 Table Shape

Notation: `!` means not nullable; `?` means nullable. Defaults are summarized only when structurally useful.

### `accounts`

- Columns: `id uuid!` (generated), `owner_id uuid!`, `name varchar!`, `description text?`, `settings jsonb?`, `created_at timestamptz?`, `updated_at timestamptz?`.
- Primary key: `id`.
- Foreign key: `owner_id -> auth.users.id`.
- Unique constraint: `(owner_id, name)`.
- Indexes: `accounts_name_owner_unique`, `accounts_pkey`, `idx_accounts_owner_id`.
- Triggers: none.

### `account_users`

- Columns: `account_id uuid!`, `user_id uuid!`, `role varchar!` (default `member`), `invited_at timestamptz?`, `joined_at timestamptz?`, `created_at timestamptz?`.
- Composite primary key: `(account_id, user_id)`.
- Foreign keys: `account_id -> public.accounts.id`; `user_id -> auth.users.id`.
- Indexes: `account_users_pkey`, `idx_account_users_account_id`, `idx_account_users_role`, `idx_account_users_user_id`.
- Triggers: none.

### `users`

- Columns: `id uuid!`, `email text!`, `full_name text?`, `role text?`, `created_at timestamptz?`, `updated_at timestamptz?`, `is_admin boolean?`, `profile_picture text?`, `auth_provider text?`.
- Primary key: `id`.
- Foreign key: `id -> auth.users.id`.
- Unique constraint: `email`.
- Indexes: `idx_users_auth_provider`, `idx_users_email`, `idx_users_is_admin`, `idx_users_role`, `users_email_key`, `users_pkey`.
- Trigger: `update_users_updated_at` -> `public.update_updated_at_column`.

### `properties`

- Columns: `id uuid!` (generated), `user_id uuid!`, `property_type_id uuid!`, `nickname varchar!`, `address text?`, `created_at timestamptz?`, `updated_at timestamptz?`, `account_id uuid?`.
- Primary key: `id`.
- Foreign keys: `user_id -> public.users.id`; `property_type_id -> public.property_types.id`; `account_id -> public.accounts.id`.
- Indexes: `idx_properties_account_id`, `idx_properties_nickname`, `idx_properties_property_type_id`, `idx_properties_user_id`, `properties_pkey`.
- Trigger: `update_properties_updated_at` -> `public.update_updated_at_column`.
- Preservation concern: the canonical tenant key `account_id` is nullable while the legacy `user_id` is required.

### `property_types`

- Columns: `id uuid!` (generated), `name varchar!`, `display_name varchar!`, `description text?`, `created_at timestamptz?`.
- Primary key: `id`.
- Foreign keys: none.
- Unique constraint: `name`.
- Indexes: `idx_property_types_name`, `property_types_name_key`, `property_types_pkey`.
- Triggers: none.

### `items`

- Columns: `id uuid!` (generated), `public_id varchar!`, `name varchar!`, `description text?`, `created_at timestamptz?`, `updated_at timestamptz?`, `qr_code_url text?`, `qr_code_uploaded_at timestamptz?`, `property_id uuid!`, `tags text[]?`, `source_language varchar?`.
- Primary key: `id`.
- Foreign key: `property_id -> public.properties.id`.
- Unique constraint: `public_id`.
- Indexes: `idx_items_property_id`, `idx_items_public_id`, `idx_items_source_language`, `idx_items_tags`, `items_pkey`, `items_public_id_key`.
- Trigger: `update_items_updated_at` -> `public.update_updated_at_column`.

### `item_articles`

- Columns: `id uuid!` (generated), `item_id uuid!`, `purpose varchar!`, `title varchar!`, `description text?`, `display_order integer?`, `created_at timestamptz?`, `updated_at timestamptz?`, `source_language varchar?`.
- Primary key: `id`.
- Foreign key: `item_id -> public.items.id`.
- Indexes: `idx_item_articles_item_id`, `idx_item_articles_item_order`, `idx_item_articles_source_language`, `item_articles_pkey`.
- Trigger: `update_item_articles_updated_at` -> `public.update_updated_at_column`.
- RLS is enabled and forced on this table.

### `item_links`

- Columns: `id uuid!` (generated), `item_id uuid?`, `title varchar!`, `link_type varchar!`, `url text!`, `thumbnail_url text?`, `display_order integer?`, `created_at timestamptz?`, `article_id uuid?`, `source_language varchar?`.
- Primary key: `id`.
- Foreign keys: `item_id -> public.items.id`; `article_id -> public.item_articles.id`.
- Indexes: `idx_item_links_article_id`, `idx_item_links_item_id`, `idx_item_links_order`, `idx_item_links_source_language`, `item_links_pkey`.
- Triggers: none.
- Preservation concern: both parent links are nullable, so ownership/content reachability requires later aggregate reconciliation.

### `access_requests`

- Columns: `id uuid!` (generated), `requester_email varchar!`, `requester_name varchar?`, `account_id uuid?`, `request_date timestamptz?`, `approval_date timestamptz?`, `approved_by uuid?`, `access_code varchar?`, `registration_date timestamptz?`, `status varchar?`, `notes text?`, `created_at timestamptz?`, `updated_at timestamptz?`, `source varchar?`, `metadata jsonb?`, `denial_date timestamptz?`, `denial_reason text?`, `processed_by uuid?`, `processed_at timestamptz?`.
- Primary key: `id`.
- Foreign keys: `account_id -> public.accounts.id`; `approved_by -> auth.users.id`; `processed_by -> public.users.id`.
- Indexes: `access_requests_pkey`, `idx_access_requests_account_id`, `idx_access_requests_code_status`, `idx_access_requests_email`, `idx_access_requests_request_date`, `idx_access_requests_status`.
- Triggers: none.

## RLS And Policy Metadata

RLS is enabled on all nine P0 tables. It is forced only on `item_articles`; the other eight are not forced. The inventory intentionally records policy names, roles, and operations only. These labels do not prove that the predicates correctly enforce tenant isolation.

| Table | Policy | Roles | Operation |
| --- | --- | --- | --- |
| `accounts` | Account members can view accounts | `public` | SELECT |
| `accounts` | Account owners can manage their accounts | `public` | ALL |
| `accounts` | Service role accounts access | `service_role` | ALL |
| `accounts` | Temporary authentication access for accounts | `anon`, `authenticated` | SELECT |
| `account_users` | Temporary authentication access | `anon`, `authenticated` | SELECT |
| `users` | Admins can manage all users | `public` | ALL |
| `users` | Service role users access | `service_role` | ALL |
| `users` | Users can manage own data | `public` | ALL |
| `properties` | Admins can manage all properties | `public` | ALL |
| `properties` | Service role properties access | `service_role` | ALL |
| `properties` | Users can manage own properties | `public` | ALL |
| `property_types` | Admins can manage property_types | `public` | ALL |
| `property_types` | Public read access on property_types | `public` | SELECT |
| `items` | Admins can manage all items | `public` | ALL |
| `items` | Public read access on items | `public` | SELECT |
| `items` | Service role items access | `service_role` | ALL |
| `items` | Users can manage own property items | `public` | ALL |
| `item_articles` | Public can view item articles | `public` | SELECT |
| `item_articles` | Users can delete own item articles | `public` | DELETE |
| `item_articles` | Users can insert own item articles | `public` | INSERT |
| `item_articles` | Users can update own item articles | `public` | UPDATE |
| `item_articles` | Users can view own item articles | `public` | SELECT |
| `item_links` | Admins can manage all item_links | `public` | ALL |
| `item_links` | Public read access on item_links | `public` | SELECT |
| `item_links` | Users can manage own property item_links | `public` | ALL |
| `access_requests` | Admins can manage all access requests | `public` | ALL |
| `access_requests` | Service role access requests access | `service_role` | ALL |

The policy names `Temporary authentication access*` and the many `public`-role management policies are high-priority reconciliation targets. Their actual predicates must be reviewed locally or through a separately approved metadata query before any claim of tenant isolation.

## Functions And Triggers

The public schema exposes three functions by name:

| Function | Arguments | Security definer |
| --- | --- | --- |
| `fetch_and_lock_translation_job` | `p_worker_id text` | No |
| `handle_new_user` | none | Yes |
| `update_updated_at_column` | none | Yes |

The five P0-relevant non-internal triggers, from nine total found across the inspected live scope, are:

- `auth.users.on_auth_user_created` -> `public.handle_new_user`.
- `public.users.update_users_updated_at` -> `public.update_updated_at_column`.
- `public.properties.update_properties_updated_at` -> `public.update_updated_at_column`.
- `public.items.update_items_updated_at` -> `public.update_updated_at_column`.
- `public.item_articles.update_item_articles_updated_at` -> `public.update_updated_at_column`.

Function bodies and executable grants were not queried. The advisor findings below nevertheless show that the two security-definer functions have unsafe-looking external execution exposure.

## Storage

One bucket exists:

| Bucket | Public | Aggregate objects |
| --- | --- | ---: |
| `item-media` | Yes | 8 |

Policies on `storage.objects`:

| Policy | Roles | Operation |
| --- | --- | --- |
| Public read access for item-media | `public` | SELECT |
| Users can upload to their own folder | `authenticated` | INSERT |
| Users can update their own files | `authenticated` | UPDATE |
| Users can delete their own files | `authenticated` | DELETE |

Bucket configuration beyond its public flag, storage policy predicates, object paths, object owners, and object contents were not collected.

## Security Advisor Summary

The security advisor returned eight warnings and no other level in this snapshot:

1. `fetch_and_lock_translation_job` has a mutable search path. [Remediation](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
2. Anonymous users can execute security-definer `handle_new_user`. [Remediation](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
3. Anonymous users can execute security-definer `update_updated_at_column`. [Remediation](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
4. Authenticated users can execute security-definer `handle_new_user`. [Remediation](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
5. Authenticated users can execute security-definer `update_updated_at_column`. [Remediation](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
6. Email OTP expiry exceeds the recommended one-hour threshold. [Remediation](https://supabase.com/docs/guides/platform/going-into-prod#security)
7. Leaked-password protection is disabled. [Remediation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
8. The current Postgres release has security patches available. [Remediation](https://supabase.com/docs/guides/platform/upgrading)

These findings were observed only. No advisor remediation was applied.

## Remote Migration Ledger

The remote migration ledger contains 109 entries:

```text
20250630104600_initial_schema
20250630113159_demo_user_setup
20250701072642_003_update_media_type_values
20250702052108_add_qr_code_data_columns
20250703045801_demo_user_correct_structure
20250703045936_demo_data_valid_uuids
20250705101252_004_revert_property_types
20250705112634_005_update_media_types
20250705113814_003_update_property_types
20250720075825_drop_existing_tables
20250720075835_create_new_schema
20250720075842_setup_rls_policies
20250720075850_load_sample_data
20250720075902_load_sample_links
20250720075916_load_more_sample_links
20250720075926_load_remaining_sample_links
20250720080019_fix_function_search_path
20250720080026_optimize_rls_policies
20250721060338_update_public_ids_to_uuid
20250723013331_add_missing_qr_code_columns
20250723085149_create_item_visits_table
20250723085155_add_item_visits_comment
20250723085305_create_item_reactions_table
20250723085312_add_item_reactions_comment
20250723085453_create_item_visits_indexes
20250723085500_create_item_reactions_indexes
20250723085547_enable_rls_on_analytics_tables
20250723085552_create_item_visits_public_policy
20250723085559_create_item_reactions_public_policies
20250723085712_create_admin_item_visits_policy
20250723085718_create_admin_item_reactions_policy
20250723094811_add_public_delete_policy_item_reactions
20250723100704_create_admin_users_table
20250723100713_create_mailing_list_subscribers_table
20250723100753_add_missing_columns_to_mailing_list
20250723100820_fix_mailing_list_rls_policies
20250723101013_simplify_mailing_list_rls_policies
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
20260118045251_l10n_foundation
20260118045628_add_source_language_columns
20260118050915_enable_rls_translation_tables
20260118050931_add_article_translations_service_role_policy
20260118050953_add_article_translations_public_select_policy
20260118051012_add_article_translations_owner_policies
20260118051031_add_item_translations_policies
20260118051053_add_link_translations_policies
20260118051109_add_tag_translations_policies
20260118051130_add_translation_jobs_policies
20260118135803_add_locked_columns_to_translation_jobs
20260118135814_add_fetch_and_lock_function
20260121070138_add_priority_to_translation_jobs
20260121070150_add_priority_index_translation_jobs
20260121185011_create_translation_job_indexes
20260121190207_add_updated_at_column_to_tag_translations
20260121190229_add_updated_at_trigger_to_tag_translations
20260124004053_add_reviewed_by_to_item_and_link_translations
20260124011937_add_source_version_at_columns
20260124012113_add_source_version_at_columns_idempotency_test
20260207123350_create_creators
20260207123357_create_quizzes
20260207123359_create_questions
20260207123401_create_participants
20260207123408_create_enrollments
20260207123413_create_sent_questions
20260207123451_create_daily_scores
20260207144701_enable_rls
20260207153816_create_handle_new_user_trigger
20260208002145_add_unique_constraint_sent_questions_enrollment_question
20260208010728_add_daily_scores_date_index
20260208012518_decimal_points_and_time_bonus
20260208014802_add_leaderboard_notifications_and_index
```

The ledger includes destructive-sounding historical entries such as `drop_existing_tables` and a second unrelated application family added in February 2026. Names alone do not establish whether matching SQL exists locally or whether each migration produced the intended current state.

## Deferred Table Groups

Detailed inspection was intentionally deferred for 17 non-P0 public tables:

- Admin/marketing: `admin_users`, `mailing_list_subscribers`.
- Analytics/reactions: `item_visits`, `item_reactions`.
- Localization jobs and projections: `article_translations`, `item_translations`, `link_translations`, `tag_translations`, `translation_jobs`.
- Unrelated quiz/leaderboard family: `creators`, `quizzes`, `questions`, `participants`, `enrollments`, `sent_questions`, `daily_scores`, `leaderboard_notifications`.

Their names and RLS-enabled status came from the compact schema listing; their columns, constraints, policies, indexes, triggers, and exact row counts were not queried.

## P0 Findings

- The live project contains the complete account -> membership -> property -> item -> article/link chain needed for the restart's P0 model.
- Existing aggregate data is material: 21 auth identities, 11 accounts, 17 properties, 23 items, 14 articles, 34 links, and 8 stored media objects. The preservation-safe default remains justified.
- Identity is split across `auth.users` and `public.users`, with an aggregate difference of ten records.
- `properties` retains both required `user_id` and nullable `account_id`; tenancy is not yet normalized around one invariant.
- `item_articles` is the only inspected table with forced RLS.
- Policy metadata includes explicitly temporary authentication policies and broad `public`-role management policies. Policy predicates and real cross-account tests are required before accepting tenant isolation.
- Content/media is modeled by articles, links, and a public storage bucket rather than standalone instruction/media tables.
- The remote ledger spans FAQBNB, localization, and an apparently unrelated quiz/leaderboard schema, so a P0-only controlled-salvage baseline is safer than treating the entire live project as one clean application schema.
- Security-advisor warnings block any claim that the live backend is production-hardened.

## Unknowns And Next Evidence

- Auth provider distribution, active-user status, email verification state, and last activity were not queried; only the total auth-user count is known.
- Policy predicates, grants, and real two-identity behavior remain unknown, so RLS effectiveness is unproven.
- Ownership coverage, orphan counts, null-account counts, duplicate memberships, and public-ID validity were not queried in this bounded inventory.
- No backup timestamp, export, restore rehearsal, point-in-time recovery status, or rollback proof was inspected.
- No local migration, generated-type, or canonical-query reconciliation was performed in this step.
- No staging project was created and no fresh-schema replay was attempted.
- Storage object ownership/path integrity and reachability from P0 content remain unknown.
- The purpose and ownership of the unrelated quiz/leaderboard tables in this project remain unknown.

This document is inventory evidence only. It does not finalize `DATA_MIGRATION_DECISION.md` and authorizes no remote mutation.
