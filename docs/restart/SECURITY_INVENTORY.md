# Workspace Security Inventory

Updated: 2026-08-10.

This inventory records paths, classifications, and actions only. It intentionally contains no credential values, fragments, hashes, prefixes, cookie names, user identifiers, or sensitive URLs.

## Scope And Method

- Inspected tracked and local filenames associated with credentials, sessions, auth URLs, environment files, private keys, and MCP configuration.
- Scanned tracked current-tree text, including generated browser-test artifacts, for high-confidence API-key and JWT patterns. Excluded `.git`, dependencies, build output, archives, and lockfile noise.
- Classified MCP fields structurally and verified that the Playwright endpoint port matches `.projstuff` without reporting credentials.
- Did not inspect or rewrite Git history. History remediation is a separate disruptive operation requiring explicit approval.
- Did not revoke or rotate external credentials. Those actions can interrupt live integrations and must be coordinated using the follow-up register below.

## Current-Tree Inventory

| Path | Tracking state before remediation | Classification | Current-tree action | External follow-up |
| --- | --- | --- | --- | --- |
| `.mcp.json` | Tracked | Supabase personal-access-token binding plus local MCP launch configuration | Removed the embedded value and its explicit env map. The Supabase process now inherits `SUPABASE_ACCESS_TOKEN` from its parent environment; read-only mode remains enabled. Added the standalone Playwright CDP endpoint matching `.projstuff`. | Revoke and replace the exposed Supabase personal access token before using Supabase MCP again. Supply the replacement only through the launching process environment. |
| `.cursor/mcp.json` | Tracked | Duplicate local MCP configuration containing a Supabase personal access token | Deleted the redundant configuration and ignored the path; root `.mcp.json` remains the canonical safe configuration. | Revoke the exposed Supabase personal access token. If it differs from the token formerly in `.mcp.json`, revoke both. Do not place a replacement in this file. |
| `.claude/settings.local.json` | Tracked | Local agent permission file containing a Supabase personal access token in an allowed-command entry | Deleted the local-only configuration and ignored the path. | Revoke the exposed Supabase personal access token. If it differs from other exposed tokens, revoke each affected token. |
| `temp_service_key.txt` | Tracked | Supabase service-role JWT | Deleted from the current tree and ignored by name. | Rotate the affected Supabase project's legacy service-role/secret key, then update authorized server-only stores such as Railway and local ignored environment files. |
| `gcloud_auth_url.txt` | Tracked | Google OAuth authorization-flow material | Deleted from the current tree and ignored by name. | Discard the outstanding flow, review the corresponding Google account's connected-app grants, and revoke any token issued by that flow. Rotate an OAuth client secret only if provider review confirms it was also exposed; no client secret was identified in this file classification. |
| `cookies.txt` | Tracked | Provider-unresolved browser session-cookie export | Deleted from the current tree and ignored by name. | Invalidate sessions associated with the browser/account that produced the export. If the provider cannot be identified safely, sign out all sessions for the relevant test accounts. |
| `.playwright-mcp/credentials-entered-raphajunk.png` | Tracked | Screenshot of a credential-entry flow; potentially sensitive visual session material | Deleted from the current tree; the full `.playwright-mcp/` directory is ignored. | Rotate any password, API key, or recovery credential entered during the captured flow and invalidate the associated sessions. Provider/account identification must happen outside repository artifacts. |
| `e2e/.auth/user.json` | Tracked | Playwright authenticated storage state containing cookies and local-storage session data | Deleted from the current tree; `e2e/.auth/` is ignored. | Invalidate the represented test-user sessions and regenerate storage state only into the ignored directory when tests require it. |
| `playwright-report/index.html` | Tracked | Generated Playwright report containing embedded session material | Deleted from the current tree; `playwright-report/` and `test-results/` are ignored. | Covered by invalidating the affected Playwright test-user sessions. |
| `RAILWAY_DEPLOYMENT_CHECKLIST.md` | Tracked | Project-specific Supabase anon JWT literal in legacy deployment documentation | Replaced with an unmistakably non-working placeholder. | The anon key is browser-visible by design, but it identifies a project. Rotate the project's anon/key set if the project is active and the committed environment association is no longer acceptable. |
| `RAILWAY_DEPLOY.md` | Tracked | Project-specific Supabase anon JWT literal in legacy deployment documentation | Replaced with an unmistakably non-working placeholder. | Same Supabase anon/key-set review as above. |
| `req-006-Quick-Wins-Admin-Panel-Issues-Resolution-log.md` | Tracked | Legacy validation log containing committed Supabase anon and service-role credential fragments | Replaced both fragments with a non-working redaction marker while preserving the surrounding validation evidence. | Covered by the Supabase anon/key-set review and service-role/secret-key rotation above. |
| `.env.local.backup` | Ignored local file | Duplicate local environment material with no unique variable names relative to `.env.local` | Deleted as an unnecessary duplicate. | Covered by rotation of the credential classes stored in the active environment. |
| `.env.local.new` | Ignored local file | Duplicate local environment material with no unique variable names relative to `.env.local` | Deleted as an unnecessary duplicate. | Covered by rotation of the credential classes stored in the active environment. |
| `.env.local` | Ignored local file | Active local environment configuration | Preserved as explicitly required; remains ignored. No value was copied or changed. | Replace affected values after provider-side rotations. Consolidate long-lived secrets into an approved local secret store when available. |
| `.env.railway` | Ignored local file | Local Railway-oriented environment configuration with variable names not fully represented in `.env.local` | Preserved to avoid losing unique configuration; remains ignored. No value was copied or changed. | Reconcile its variable names with Railway and `ENVIRONMENT.md`, rotate affected values, then remove the local file once the authoritative store is verified. |
| `.env.example` | Previously ignored/untracked example | Public environment contract | Replaced with non-working examples for P0 names and explicitly unignored so it can be committed. | None. Never replace placeholders with real values. |
| `docs/REQ-253-write-unit-tests-for-translation-service-detailed.md` | Tracked | Obvious non-working API-key example | Retained unchanged. | None. |

## Required Provider Actions

These are not complete until an accountable operator records the provider, affected project/account, completion date, and replacement destination without recording values:

1. Supabase: revoke every exposed personal access token formerly stored in `.mcp.json`, `.cursor/mcp.json`, and `.claude/settings.local.json`; confirm separately whether they represented one token or multiple tokens without recording values.
2. Supabase: rotate the exposed service-role/secret key for the affected project and update server-only consumers.
3. Supabase: review whether to rotate the project anon/key set referenced by legacy deployment documentation.
4. Google: abandon the recorded OAuth flow and revoke any grant or access/refresh token produced by it.
5. Session providers: invalidate sessions represented by the removed cookie export, Playwright storage state, generated report, and credential-entry screenshot.

## History Follow-Up

All items marked as previously tracked remain recoverable from existing Git history even after this cleanup commit. Do not run a history rewrite as part of Milestone 0.2. After provider-side revocation is complete, separately decide whether repository distribution warrants a coordinated history rewrite. That operation requires explicit approval, a collaborator notification plan, backup/remote verification, and force-push coordination.

## Acceptance Evidence

Repository-side Milestone 0.2 remediation passed independent validation on 2026-08-10. The validator confirmed by path/classification only that:

- named sensitive standalone files, browser storage/report artifacts, local agent/MCP credential files, and the screenshot are absent from the current tree;
- `.mcp.json` contains no embedded credential value and its Playwright port matches `.projstuff`;
- `.env.example` is safe and eligible for tracking;
- the tracked current tree has no live-looking high-confidence credential-pattern matches;
- `git diff --check` passes and unrelated work remains preserved.

This acceptance closes repository-side Milestone 0.2 only. Provider rotations, grant/session invalidations, replacement propagation, and the separately approved Git-history decision remain outstanding under `Required Provider Actions` and `History Follow-Up`.
