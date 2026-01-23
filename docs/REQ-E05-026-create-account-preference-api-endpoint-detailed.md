# Create Account Preference API Endpoint - Detailed Implementation Tasks

**Generated:** 2026-01-23 11:45
**Reference Documents:**
- Requirements: docs/gen_requests_epic5.md (Request #26)
- Overview: docs/REQ-E05-026-create-account-preference-api-endpoint-overview.md
- Implementation Plan: docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Build & Test Commands

| Action | Command |
|--------|---------|
| Type Check | `npx tsc --noEmit` |
| Unit Tests | `npm test` |
| Build | `npm run build` |
| Lint | `npm run lint` |

---

## 1. Create API Route Directory Structure

**Context:** Next.js App Router uses file-system based routing with the `/app/api/` directory. Dynamic routes use bracket notation `[paramName]` for URL parameters. The preferences endpoint will be nested under accounts to follow RESTful patterns: `/api/accounts/[accountId]/preferences`.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts` (NEW)

**Estimated effort:** 1 story point

- [ ] **1.1** Create directory `/src/app/api/accounts/[accountId]/` if it doesn't exist
- [ ] **1.2** Create directory `/src/app/api/accounts/[accountId]/preferences/`
- [ ] **1.3** Create file `/src/app/api/accounts/[accountId]/preferences/route.ts`
- [ ] **1.4** Verify directory structure matches Next.js App Router conventions

---

## 2. Add File Header and Imports

**Context:** Establish imports for Next.js route handlers, Supabase auth helpers, and TypeScript types. The route handler uses `createRouteHandlerClient` for proper authentication context in the App Router.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **2.1** Add JSDoc file header with REQ-E05-026 reference, Epic 5 Phase 6 Task 6.2, purpose description, and creation date
- [ ] **2.2** Import `NextRequest`, `NextResponse` from 'next/server'
- [ ] **2.3** Import `createRouteHandlerClient` from '@supabase/auth-helpers-nextjs'
- [ ] **2.4** Import `cookies` from 'next/headers'
- [ ] **2.5** Import `Database` type from '@/lib/supabase' (or appropriate path for database types)
- [ ] **2.6** Run type check: `npx tsc --noEmit` to verify imports

---

## 3. Define TypeScript Interfaces

**Context:** Type safety for request bodies and responses ensures compile-time validation and clear API contracts. The interfaces define what data the endpoint accepts and returns.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **3.1** Add comment section: "Type Definitions"
- [ ] **3.2** Define `AccountPreferencesRequest` interface with optional `preferredLanguage?: string` property and JSDoc comment explaining it's an ISO 639-1 language code
- [ ] **3.3** Add comment noting future preferences can be added to this interface
- [ ] **3.4** Define `AccountPreferencesResponse` interface with `success: true`, nested `data` object containing `accountId: string`, `preferences: { preferredLanguage: string | null }`, and `updatedAt: string`
- [ ] **3.5** Define `ErrorResponse` interface with `success: false` and `error: string`
- [ ] **3.6** Add JSDoc comments to each interface explaining their purpose
- [ ] **3.7** Run type check: `npx tsc --noEmit`

---

## 4. Define Constants

**Context:** The supported languages list must match the i18n configuration and database constraints. Defining it as a constant ensures consistency and makes it easy to maintain.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **4.1** Add comment section: "Constants"
- [ ] **4.2** Define `SUPPORTED_LANGUAGES` constant as readonly array: `['en', 'fr', 'es', 'de', 'nl', 'it'] as const`
- [ ] **4.3** Add JSDoc comment referencing `/src/lib/i18n/config.ts` as source of truth
- [ ] **4.4** Add comment noting this must match database check constraint
- [ ] **4.5** Run type check: `npx tsc --noEmit`

---

## 5. Implement validateAccountAccess Helper Function

**Context:** Authorization requires checking if the authenticated user is a member of the requested account. This helper queries the `account_users` junction table to verify membership before allowing preference updates.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **5.1** Add comment section: "Helper Functions"
- [ ] **5.2** Define async function `validateAccountAccess` with parameters: `supabase` (Supabase client instance), `userId: string`, `accountId: string`
- [ ] **5.3** Add JSDoc comment explaining the function checks `account_users` table for membership
- [ ] **5.4** Add return type: `Promise<boolean>`
- [ ] **5.5** Wrap function body in try-catch block
- [ ] **5.6** Query `account_users` table with `.select('role')` filtered by `.eq('account_id', accountId)` and `.eq('user_id', userId)`, using `.single()` to expect one result
- [ ] **5.7** If error or no membership found, log warning with `console.warn` and return `false`
- [ ] **5.8** If membership found, log success with `console.log` including role, and return `true`
- [ ] **5.9** In catch block, log error with `console.error` and return `false`
- [ ] **5.10** Run type check: `npx tsc --noEmit`

---

## 6. Implement PUT Endpoint - Function Signature and Setup

**Context:** The PUT method handles updating account preferences. It must extract the accountId from the URL parameters and initialize the Supabase client with proper authentication context.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **6.1** Add comment section: "PUT Endpoint"
- [ ] **6.2** Add JSDoc comment for PUT function: "Update account preferences (preferredLanguage, etc.)"
- [ ] **6.3** Define async function `PUT` with parameters: `request: NextRequest` and `{ params }: { params: Promise<{ accountId: string }> }`
- [ ] **6.4** Add return type: `Promise<NextResponse<AccountPreferencesResponse | ErrorResponse>>`
- [ ] **6.5** Export the PUT function
- [ ] **6.6** Wrap function body in try-catch block
- [ ] **6.7** Initialize Supabase client: `const supabase = createRouteHandlerClient<Database>({ cookies });`
- [ ] **6.8** Await params and destructure accountId: `const { accountId } = await params;`
- [ ] **6.9** Add console.log for request start with accountId
- [ ] **6.10** Run type check: `npx tsc --noEmit`

---

## 7. Implement PUT Endpoint - Authentication

**Context:** All API endpoints must verify the user is authenticated before processing requests. Unauthenticated requests return 401 Unauthorized.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **7.1** Add comment: "Step 1: Validate Authentication"
- [ ] **7.2** Call `supabase.auth.getUser()` and destructure `data` as `authResult` and `error` as `authError`
- [ ] **7.3** Check if `authError` exists or `authResult.user` is falsy
- [ ] **7.4** If authentication failed, log warning with `console.warn` including error message
- [ ] **7.5** Return `NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })`
- [ ] **7.6** Extract `userId` from `authResult.user.id`
- [ ] **7.7** Log authenticated userId with `console.log`
- [ ] **7.8** Run type check: `npx tsc --noEmit`

---

## 8. Implement PUT Endpoint - Authorization

**Context:** Even authenticated users can only update preferences for accounts they belong to. The authorization check prevents users from modifying other accounts' settings.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **8.1** Add comment: "Step 2: Validate Authorization (Account Access)"
- [ ] **8.2** Call `validateAccountAccess(supabase, userId, accountId)` and await result into `hasAccess` variable
- [ ] **8.3** Check if `!hasAccess`
- [ ] **8.4** If no access, return `NextResponse.json({ success: false, error: 'Access denied to this account' }, { status: 403 })`
- [ ] **8.5** Run type check: `npx tsc --noEmit`

---

## 9. Implement PUT Endpoint - Request Body Parsing and Validation

**Context:** Validate the request body contains valid data before attempting database updates. Check that preferredLanguage is a string and matches one of the supported language codes.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **9.1** Add comment: "Step 3: Parse and Validate Request Body"
- [ ] **9.2** Parse JSON body: `const body: AccountPreferencesRequest = await request.json();`
- [ ] **9.3** Destructure `preferredLanguage` from body
- [ ] **9.4** Check if `preferredLanguage !== undefined`
- [ ] **9.5** If provided, validate `typeof preferredLanguage === 'string'`, return 400 error if not
- [ ] **9.6** Check if `preferredLanguage` is in `SUPPORTED_LANGUAGES` array using `.includes()` with type assertion
- [ ] **9.7** If not supported, return 400 error with message listing valid languages: "preferredLanguage must be one of: en, fr, es, de, nl, it"
- [ ] **9.8** Log validated request body with `console.log`
- [ ] **9.9** Run type check: `npx tsc --noEmit`

---

## 10. Implement PUT Endpoint - Fetch Current Settings

**Context:** To preserve existing settings when updating preferences, we must first fetch the current settings object from the database. This enables a merge strategy rather than replacement.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **10.1** Add comment: "Step 4: Fetch Current Account Settings"
- [ ] **10.2** Query accounts table: `supabase.from('accounts').select('settings').eq('id', accountId).single()`
- [ ] **10.3** Destructure result as `data: currentAccount` and `error: fetchError`
- [ ] **10.4** Check if `fetchError` or `!currentAccount`
- [ ] **10.5** If not found, log error with `console.error` and return 404 "Account not found"
- [ ] **10.6** Run type check: `npx tsc --noEmit`

---

## 11. Implement PUT Endpoint - Merge Settings

**Context:** The settings column stores multiple preferences as JSONB. We merge the new preference with existing settings to avoid losing other data. This follows the principle of minimal destructive changes.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **11.1** Add comment: "Step 5: Merge New Preferences with Existing Settings"
- [ ] **11.2** Cast current settings: `const currentSettings = (currentAccount.settings as Record<string, unknown>) || {};`
- [ ] **11.3** Create updated settings object using spread operator to merge current settings
- [ ] **11.4** Conditionally add preferredLanguage if provided: `...(preferredLanguage !== undefined && { preferredLanguage })`
- [ ] **11.5** Log merge operation with `console.log` showing current and updated settings
- [ ] **11.6** Run type check: `npx tsc --noEmit`

---

## 12. Implement PUT Endpoint - Update Database

**Context:** Write the merged settings back to the database and update the timestamp. Return the updated account data to confirm the change.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **12.1** Add comment: "Step 6: Update Account Settings"
- [ ] **12.2** Update accounts table: `supabase.from('accounts').update({ settings: updatedSettings, updated_at: new Date().toISOString() }).eq('id', accountId).select('id, settings, updated_at').single()`
- [ ] **12.3** Destructure result as `data: updatedAccount` and `error: updateError`
- [ ] **12.4** Check if `updateError` or `!updatedAccount`
- [ ] **12.5** If update failed, log error with `console.error` and return 500 "Failed to update preferences"
- [ ] **12.6** Log success with `console.log` including accountId
- [ ] **12.7** Run type check: `npx tsc --noEmit`

---

## 13. Implement PUT Endpoint - Success Response

**Context:** Return a well-structured response confirming the update, including the new preferences and timestamp. This allows the client to update its local state.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **13.1** Add comment: "Step 7: Return Success Response"
- [ ] **13.2** Return `NextResponse.json` with success response object
- [ ] **13.3** Set `success: true`
- [ ] **13.4** Create nested `data` object with `accountId: updatedAccount.id`
- [ ] **13.5** Add `preferences` object extracting `preferredLanguage` from `updatedAccount.settings` cast to `Record<string, unknown>`, defaulting to null
- [ ] **13.6** Add `updatedAt: updatedAccount.updated_at`
- [ ] **13.7** Run type check: `npx tsc --noEmit`

---

## 14. Implement PUT Endpoint - Error Handler

**Context:** Catch any unexpected errors in the endpoint logic and return a generic 500 error to prevent exposing internal details.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **14.1** In the outer catch block, log error with `console.error` including endpoint path
- [ ] **14.2** Return `NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })`
- [ ] **14.3** Run type check: `npx tsc --noEmit`

---

## 15. Implement GET Endpoint - Function Structure

**Context:** The GET endpoint allows clients to retrieve current preferences without querying the accounts table directly. This provides a consistent API interface and enforces authentication/authorization.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **15.1** Add comment section: "GET Endpoint"
- [ ] **15.2** Add JSDoc comment: "Retrieve current account preferences"
- [ ] **15.3** Define async function `GET` with same signature as PUT
- [ ] **15.4** Add return type: `Promise<NextResponse<AccountPreferencesResponse | ErrorResponse>>`
- [ ] **15.5** Export the GET function
- [ ] **15.6** Wrap body in try-catch block
- [ ] **15.7** Initialize Supabase client and extract accountId from params (same as PUT)
- [ ] **15.8** Add console.log for GET request start
- [ ] **15.9** Run type check: `npx tsc --noEmit`

---

## 16. Implement GET Endpoint - Authentication and Authorization

**Context:** GET endpoint must enforce the same security as PUT - verify authentication and account membership before returning data.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **16.1** Validate authentication using `supabase.auth.getUser()` (same pattern as PUT)
- [ ] **16.2** Return 401 if authentication fails
- [ ] **16.3** Extract userId from auth result
- [ ] **16.4** Validate authorization using `validateAccountAccess(supabase, userId, accountId)`
- [ ] **16.5** Return 403 if access denied
- [ ] **16.6** Run type check: `npx tsc --noEmit`

---

## 17. Implement GET Endpoint - Fetch and Return Preferences

**Context:** Query the account settings and return them in the same format as the PUT response for consistency.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/route.ts`

**Estimated effort:** 1 story point

- [ ] **17.1** Query accounts table: `supabase.from('accounts').select('id, settings, updated_at').eq('id', accountId).single()`
- [ ] **17.2** Destructure result as `data: account` and `error: fetchError`
- [ ] **17.3** Check if error or no account found, return 404
- [ ] **17.4** Return success response with same structure as PUT endpoint
- [ ] **17.5** Extract preferredLanguage from settings, cast to `Record<string, unknown>`, default to null
- [ ] **17.6** In catch block, log error and return 500
- [ ] **17.7** Run type check: `npx tsc --noEmit`

---

## 18. Write Unit Tests - Setup and Mocks

**Context:** Unit tests verify the endpoint behaves correctly under various scenarios. Tests must mock Supabase client and authentication to isolate the endpoint logic.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/__tests__/route.test.ts` (NEW)

**Estimated effort:** 1 story point

- [ ] **18.1** Create test file at `/src/app/api/accounts/[accountId]/preferences/__tests__/route.test.ts`
- [ ] **18.2** Import testing utilities: `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach` from 'vitest'
- [ ] **18.3** Import `NextRequest`, `NextResponse` from 'next/server'
- [ ] **18.4** Import PUT and GET functions from '../route'
- [ ] **18.5** Mock `@supabase/auth-helpers-nextjs` using `vi.mock()`
- [ ] **18.6** Mock `next/headers` cookies function
- [ ] **18.7** Create mock Supabase client object with `auth.getUser`, `from().select()`, and `from().update()` methods
- [ ] **18.8** Create helper function to create mock NextRequest with JSON body
- [ ] **18.9** Create helper function to create mock params: `{ params: Promise.resolve({ accountId: 'test-account-id' }) }`
- [ ] **18.10** Run tests: `npm test` to verify setup works

---

## 19. Write Unit Tests - Authentication Tests

**Context:** Verify the endpoint properly rejects unauthenticated requests with 401 status code and appropriate error message.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/__tests__/route.test.ts`

**Estimated effort:** 1 story point

- [ ] **19.1** Write test: "PUT returns 401 when no auth token provided" - mock getUser to return error, call PUT, assert status 401
- [ ] **19.2** Write test: "PUT returns 401 when auth token is invalid" - mock getUser with no user, assert 401 response
- [ ] **19.3** Write test: "GET returns 401 when not authenticated" - same pattern for GET endpoint
- [ ] **19.4** Verify error response includes `success: false` and `error: 'Unauthorized'`
- [ ] **19.5** Run tests: `npm test` and verify authentication tests pass

---

## 20. Write Unit Tests - Authorization Tests

**Context:** Verify the endpoint checks account membership and denies access to users who aren't members of the account.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/__tests__/route.test.ts`

**Estimated effort:** 1 story point

- [ ] **20.1** Write test: "PUT returns 403 when user is not account member" - mock getUser success but account_users query returns no rows, assert 403
- [ ] **20.2** Write test: "PUT allows access when user is account member" - mock successful membership check, assert request proceeds (not 403)
- [ ] **20.3** Write test: "GET returns 403 for non-member" - same pattern for GET endpoint
- [ ] **20.4** Verify error response includes `error: 'Access denied to this account'`
- [ ] **20.5** Run tests: `npm test` and verify authorization tests pass

---

## 21. Write Unit Tests - Validation Tests

**Context:** Verify the endpoint validates the preferredLanguage field and rejects invalid values with descriptive error messages.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/__tests__/route.test.ts`

**Estimated effort:** 1 story point

- [ ] **21.1** Write test: "PUT returns 400 when preferredLanguage is not a string" - send number, assert 400 with type error message
- [ ] **21.2** Write test: "PUT returns 400 for unsupported language code" - send 'pt', assert 400 with supported languages list
- [ ] **21.3** Write test: "PUT accepts valid language codes" - send each supported language ('en', 'fr', 'es', 'de', 'nl', 'it'), assert 200
- [ ] **21.4** Write test: "PUT handles empty request body gracefully" - send {}, assert success (no-op)
- [ ] **21.5** Run tests: `npm test` and verify validation tests pass

---

## 22. Write Unit Tests - Business Logic Tests

**Context:** Verify the core functionality: updating preferences, merging with existing settings, and returning correct response format.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/__tests__/route.test.ts`

**Estimated effort:** 1 story point

- [ ] **22.1** Write test: "PUT returns 404 when account doesn't exist" - mock accounts query to return null, assert 404
- [ ] **22.2** Write test: "PUT successfully updates preferredLanguage" - mock full success flow, verify update called with correct data
- [ ] **22.3** Write test: "PUT preserves other settings fields when updating" - mock existing settings with other fields, verify merge behavior
- [ ] **22.4** Write test: "PUT updates updated_at timestamp" - verify update query includes new timestamp
- [ ] **22.5** Write test: "PUT returns correct response format" - assert response matches AccountPreferencesResponse interface
- [ ] **22.6** Write test: "GET returns current preferences" - mock account query, verify response structure
- [ ] **22.7** Write test: "GET returns null when no preferences set" - mock empty settings object, assert preferredLanguage is null
- [ ] **22.8** Run tests: `npm test` and verify business logic tests pass

---

## 23. Write Unit Tests - Edge Cases

**Context:** Test boundary conditions and unusual scenarios to ensure robustness.

**Files to modify:**
- `/src/app/api/accounts/[accountId]/preferences/__tests__/route.test.ts`

**Estimated effort:** 1 story point

- [ ] **23.1** Write test: "PUT handles null settings column" - mock account with settings: null, verify merge creates new object
- [ ] **23.2** Write test: "PUT handles malformed JSON request body" - send invalid JSON, expect 500 or appropriate error
- [ ] **23.3** Write test: "PUT handles database update failure" - mock update to return error, assert 500
- [ ] **23.4** Write test: "Validates accountId format" - send non-UUID accountId, verify appropriate handling
- [ ] **23.5** Run tests: `npm test` and verify edge case tests pass

---

## 24. Create API Documentation File

**Context:** Document the API contract for frontend developers and future maintainers. Include request/response examples, authentication requirements, and error codes.

**Files to modify:**
- `/docs/api/accounts.md` (NEW or UPDATE)

**Estimated effort:** 1 story point

- [ ] **24.1** Create file `/docs/api/accounts.md` (or open if it exists)
- [ ] **24.2** Add main heading: "# Accounts API"
- [ ] **24.3** Add section: "## PUT /api/accounts/[accountId]/preferences"
- [ ] **24.4** Document purpose: "Update account-level preferences such as preferred language"
- [ ] **24.5** Add subsection "Authentication" explaining Supabase Auth requirement
- [ ] **24.6** Add subsection "Authorization" explaining account membership requirement
- [ ] **24.7** Add subsection "Request" with method, path, headers, and body schema
- [ ] **24.8** Create markdown table for body parameters with columns: Parameter, Type, Required, Description
- [ ] **24.9** Add subsection "Response" with success example (200 status) showing JSON structure
- [ ] **24.10** Create error table with columns: Status, Code, Message - list all possible errors (401, 403, 400, 404, 500)
- [ ] **24.11** Add section: "## GET /api/accounts/[accountId]/preferences" with same structure
- [ ] **24.12** Add curl examples for both endpoints
- [ ] **24.13** Verify markdown formatting is correct

---

## 25. Manual Testing - Setup Test Account

**Context:** Prepare a test environment with known data to manually verify the endpoint behavior in a real browser or API client.

**Files to modify:**
- None (manual testing)

**Estimated effort:** 1 story point

- [ ] **25.1** Start development server: `npm run dev`
- [ ] **25.2** Identify or create a test account ID from the database
- [ ] **25.3** Ensure test user is a member of the test account (check `account_users` table)
- [ ] **25.4** Note the current settings value for the test account from database
- [ ] **25.5** Prepare authentication token or ensure browser has valid session cookies

---

## 26. Manual Testing - PUT Endpoint

**Context:** Test the PUT endpoint with various scenarios using curl, Postman, or browser dev tools to verify real-world behavior.

**Files to modify:**
- None (manual testing)

**Estimated effort:** 1 story point

- [ ] **26.1** Test successful update: Send PUT request with valid preferredLanguage='fr', verify 200 response
- [ ] **26.2** Verify response structure matches documentation (success: true, data object with accountId, preferences, updatedAt)
- [ ] **26.3** Check database directly: Query accounts table and verify settings.preferredLanguage was updated to 'fr'
- [ ] **26.4** Test with different valid language: Send PUT with 'de', verify update
- [ ] **26.5** Test validation: Send PUT with invalid language 'pt', verify 400 error with helpful message
- [ ] **26.6** Test type validation: Send PUT with preferredLanguage as number, verify 400 error
- [ ] **26.7** Test without authentication: Clear cookies/token and send request, verify 401 error
- [ ] **26.8** Test with different account: Use accountId user doesn't belong to, verify 403 error
- [ ] **26.9** Test settings merge: Add another setting to account manually, update preferredLanguage, verify other setting preserved

---

## 27. Manual Testing - GET Endpoint

**Context:** Test the GET endpoint to verify it correctly retrieves and returns current preferences.

**Files to modify:**
- None (manual testing)

**Estimated effort:** 1 story point

- [ ] **27.1** Send GET request to preferences endpoint with valid authentication
- [ ] **27.2** Verify response includes current preferredLanguage value
- [ ] **27.3** Verify response matches PUT response structure
- [ ] **27.4** Test with account that has no preferences set: verify preferredLanguage returns null
- [ ] **27.5** Test without authentication: verify 401 error
- [ ] **27.6** Test with unauthorized account: verify 403 error

---

## 28. Integration Testing with LanguagePreferenceSection

**Context:** Verify the API works correctly when called from the React component created in REQ-E05-025.

**Files to modify:**
- None (integration testing)

**Estimated effort:** 1 story point

- [ ] **28.1** Open the page containing LanguagePreferenceSection component in browser
- [ ] **28.2** Verify current language preference loads correctly (GET endpoint called)
- [ ] **28.3** Change language selection in dropdown and click Save
- [ ] **28.4** Verify PUT request is sent to correct endpoint with correct payload
- [ ] **28.5** Verify success message appears in component
- [ ] **28.6** Reload page and verify new preference persists (GET returns updated value)
- [ ] **28.7** Test error scenario: Simulate network error or server error, verify component displays error message
- [ ] **28.8** Verify browser console shows no errors during normal operation

---

## 29. Verify TypeScript Compilation

**Context:** Ensure all new code compiles without errors and types are correctly defined.

**Files to modify:**
- None (verification)

**Estimated effort:** 1 story point

- [ ] **29.1** Run full type check: `npx tsc --noEmit` from project root
- [ ] **29.2** Fix any type errors in route.ts file
- [ ] **29.3** Fix any type errors in test file
- [ ] **29.4** Verify return types match defined interfaces
- [ ] **29.5** Verify no implicit 'any' types exist
- [ ] **29.6** Re-run type check and confirm zero errors

---

## 30. Run Linter and Fix Issues

**Context:** Ensure code quality and consistency with project ESLint configuration.

**Files to modify:**
- Various (as needed for lint fixes)

**Estimated effort:** 1 story point

- [ ] **30.1** Run linter: `npm run lint` from project root
- [ ] **30.2** Fix any ESLint warnings in route.ts
- [ ] **30.3** Fix any ESLint warnings in test file
- [ ] **30.4** Verify no unused imports exist
- [ ] **30.5** Verify no unused variables exist
- [ ] **30.6** Verify console.log statements are acceptable (or replace with proper logging)
- [ ] **30.7** Re-run linter and confirm zero warnings

---

## 31. Build Verification

**Context:** Ensure the API route can be built for production without errors.

**Files to modify:**
- None (verification)

**Estimated effort:** 1 story point

- [ ] **31.1** Run production build: `npm run build` from project root
- [ ] **31.2** Verify build completes successfully without errors
- [ ] **31.3** Check build output for any warnings related to new API route
- [ ] **31.4** Verify route is included in build output
- [ ] **31.5** If build fails, identify and fix the issue, then rebuild
- [ ] **31.6** Confirm final build succeeds with zero errors

---

## Authorized Files for Modification

### New Files to Create
1. `/src/app/api/accounts/[accountId]/preferences/route.ts` - Main API endpoint
2. `/src/app/api/accounts/[accountId]/preferences/__tests__/route.test.ts` - Unit tests
3. `/docs/api/accounts.md` - API documentation (or update if exists)

### Existing Files to Modify
- None (this is a new endpoint with no dependencies on existing code)

### Files to Reference (No Changes)
- `/src/lib/supabase.ts` - Database type definitions
- `/src/lib/i18n/config.ts` - Supported languages list
- `/src/app/api/admin/accounts/[accountId]/route.ts` - Pattern reference for account access
- `/src/app/api/user/properties/[propertyId]/route.ts` - Pattern reference for auth

---

## Dependencies

### Required (Must Exist First)
- **Supabase Auth**: `@supabase/auth-helpers-nextjs` package ✅ (installed)
- **Database Tables**:
  - `accounts` table with `settings` JSONB column ✅ (exists)
  - `account_users` table for authorization ✅ (exists)
- **Next.js 15**: App Router with route handlers ✅ (configured)
- **Epic 1 - L10N Foundation**: Language codes defined ✅

### Blocks (Requires This First)
- **REQ-E05-025**: LanguagePreferenceSection Component - Needs this API to persist preferences
- **REQ-E05-027**: Account Settings Integration - Needs this API for data loading/saving

---

## Success Criteria

This implementation will be considered successful when:

1. ✅ PUT endpoint created at `/api/accounts/[accountId]/preferences/route.ts`
2. ✅ Unauthenticated requests return HTTP 401 with clear error message
3. ✅ Requests for accounts user doesn't belong to return HTTP 403
4. ✅ Invalid `preferredLanguage` values return HTTP 400 with validation error
5. ✅ Non-existent account IDs return HTTP 404
6. ✅ Valid PUT request updates `settings.preferredLanguage` in database
7. ✅ Existing settings fields preserved when updating (merge, not replace)
8. ✅ Response includes `accountId`, `preferences` object, and `updatedAt` timestamp
9. ✅ GET endpoint returns current preferences for authenticated user
10. ✅ Language validation uses same list as database constraints and i18n config
11. ✅ No TypeScript compilation errors
12. ✅ No ESLint warnings
13. ✅ API follows existing route patterns (consistent error handling, response format)
14. ✅ All unit tests pass
15. ✅ Manual API testing scenarios complete successfully
16. ✅ API documentation created/updated
17. ✅ Integration with LanguagePreferenceSection component works correctly
18. ✅ Production build succeeds without errors

---

**Document Status**: PENDING
**Last Updated**: 2026-01-23 11:45
**Author**: Senior Developer (Task Breakdown Agent)
**Review Status**: Awaiting Implementation
