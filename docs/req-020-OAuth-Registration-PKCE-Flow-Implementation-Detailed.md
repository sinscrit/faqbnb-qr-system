# REQ-020: OAuth Registration PKCE Flow Implementation - Detailed Implementation Tasks

**Document Created**: August 9, 2025 02:04 CEST  
**Base Document**: `docs/req-020-OAuth-Registration-PKCE-Flow-Implementation-Overview.md`  
**Request Reference**: REQ-020 in `docs/gen_requests.md`  
**Request Type**: BUG FIX REQUEST - Critical OAuth Registration PKCE Flow Implementation  
**Complexity**: 8 Points (Medium-High Complexity)  
**Priority**: Critical Priority

---

## Prerequisites and Project Context

### Working Directory Requirements
- **IMPORTANT**: All tasks must be performed from the project root folder: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus`
- **DO NOT** attempt to navigate to other folders or use relative navigation commands
- **USE** absolute paths when referencing files outside of the current working directory

### Database State Analysis
Based on Supabase MCP inspection, the current database state shows:

**Current Test User State**: `sgcleprojets@gmail.com`
- ✅ **access_requests table**: Record exists with `status: 'approved'`, `access_code: 'rsqtym53ggkq0z7cs5zzf'`, `registration_date: null`
- ❌ **users table**: No record exists (registration incomplete)
- ❌ **accounts table**: No default account created
- ❌ **account_users table**: No account linking exists

**Database Tables Confirmed**:
- ✅ `users` table with `auth_provider` column for OAuth registration
- ✅ `accounts` table for default account creation
- ✅ `account_users` table for account linking
- ✅ `access_requests` table with proper status tracking

### Authorized Files for Modification
Per the overview document, the following files are authorized for modification:

**CRITICAL MODIFICATIONS**:
- `src/app/auth/oauth/callback/route.ts`
- `src/app/api/auth/complete-oauth-registration/route.ts` (NEW FILE)
- `src/app/register/RegistrationPageContent.tsx`

**MINOR MODIFICATIONS**:
- `src/hooks/useRegistration.ts`
- `src/components/RegistrationForm.tsx`
- `src/types/index.ts`

**NO MODIFICATIONS ALLOWED** outside this list without explicit user permission.

---

## Detailed Implementation Tasks

### 1. OAuth Callback Route Simplification (3 Story Points)

**Objective**: Remove broken server-side registration logic and implement proper client redirect flow

#### 1.1 Analyze Current OAuth Callback Implementation -unit tested-
- [x] Use `read_file` to examine `src/app/auth/oauth/callback/route.ts` lines 111-228
- [x] Identify all server-side registration logic that violates PKCE flow
- [x] Document specific lines containing broken `exchangeCodeForSession()` calls
- [x] Note import statements that need removal

#### 1.2 Remove Broken Server-Side Registration Logic -unit tested-
- [x] Remove server-side OAuth code exchange logic (lines 111-228 approximately)
- [x] Remove imports: `createUser`, `createDefaultAccount`, `linkUserToAccount`
- [x] Remove imports: `validateAccessCodeForRegistration`, `consumeAccessCode`
- [x] Remove `OAuthUserData` type usage
- [x] Keep error handling for OAuth provider errors (lines 22-30 approximately)

#### 1.3 Implement Simplified Redirect Logic -unit tested-
- [x] Replace server-side registration with client redirect for registration flow
- [x] Maintain login flow redirect to `/login` (preserve existing logic)
- [x] For registration flow: redirect to `/register` with success parameters
- [x] Pass `accessCode` and `email` parameters in redirect URL
- [x] Add OAuth success indicator parameter (e.g., `oauth_success=true`)

#### 1.4 Test OAuth Callback Simplification -unit tested-
- [x] Start development server: `npm run dev`
- [x] Use Supabase MCP to verify database state before testing
- [x] Navigate to registration page with access code: `http://localhost:3000/register?code=rsqtym53ggkq0z7cs5zzf&email=sgcleprojets@gmail.com`
- [x] Initiate Google OAuth authentication
- [x] Verify OAuth callback redirects properly without server-side errors
- [x] Check console logs for absence of PKCE errors
- [x] Verify user is NOT created in `users` table yet (expected behavior)

---

### 2. Create Authenticated OAuth Registration API (2 Story Points)

**Objective**: Build new API endpoint for session-authenticated registration completion

#### 2.1 Create New OAuth Registration API File -unit tested-
- [x] Create new file: `src/app/api/auth/complete-oauth-registration/route.ts`
- [x] Add necessary imports from existing auth and validation libraries
- [x] Import: `createUser`, `createDefaultAccount`, `linkUserToAccount` from `src/lib/auth.ts`
- [x] Import: `validateAccessCodeForRegistration`, `consumeAccessCode` from `src/lib/access-validation.ts`
- [x] Import Supabase client for session validation

#### 2.2 Implement Session Validation -unit tested-
- [x] Create `validateOAuthSession()` helper function
- [x] Extract user session from request headers
- [x] Validate session authenticity with Supabase
- [x] Extract OAuth user metadata (email, full_name, provider)
- [x] Return structured user data or authentication error

#### 2.3 Implement OAuth Registration Logic -unit tested-
- [x] Create main `POST()` handler function
- [x] Accept request with `accessCode` and `email` parameters
- [x] Validate OAuth session and extract user data
- [x] Call `validateAccessCodeForRegistration(accessCode, email)`
- [x] Create user with `authProvider: 'google'` using `createUser()`
- [x] Create default account using `createDefaultAccount()`
- [x] Link user to account using `linkUserToAccount()`
- [x] Consume access code using `consumeAccessCode()`

#### 2.4 Add OAuth-Specific Error Handling -unit tested-
- [x] Handle session validation errors
- [x] Handle access code validation failures
- [x] Handle user creation conflicts (already exists)
- [x] Handle account creation failures
- [x] Return appropriate HTTP status codes and error messages
- [x] Add comprehensive logging for debugging

#### 2.5 Test OAuth Registration API -unit tested-
- [x] Create test script or use API testing tool
- [x] Test API endpoint with valid OAuth session
- [x] Test with invalid/missing session
- [x] Test with invalid access code
- [x] Test with already-used access code
- [x] Verify proper database record creation
- [x] Use Supabase MCP to verify all database operations

---

### 3. Client-Side OAuth Detection and Registration Trigger (2 Story Points)

**Objective**: Add OAuth completion detection and registration triggering to registration page

#### 3.1 Analyze Current Registration Page Implementation -unit tested-
- [x] Use `read_file` to examine `src/app/register/RegistrationPageContent.tsx`
- [x] Review `detectEntryMode()` function (lines 37-89)
- [x] Understand current OAuth detection logic (lines 44-66)
- [x] Identify where OAuth completion handler should be added

#### 3.2 Implement OAuth Success Detection -unit tested-
- [x] Add new `useEffect` hook for OAuth success detection
- [x] Detect URL parameters: `oauth_success`, `accessCode`, `email`
- [x] Check for authenticated session using Supabase client
- [x] Add state management for OAuth completion flow
- [x] Distinguish OAuth success from standard access code registration

#### 3.3 Create OAuth Registration Completion Handler -unit tested-
- [x] Add `handleOAuthRegistrationCompletion()` function
- [x] Call new `/api/auth/complete-oauth-registration` endpoint
- [x] Pass session authentication headers
- [x] Include access code and email parameters
- [x] Handle API response and error scenarios
- [x] Integrate with existing error handling system

#### 3.4 Modify Entry Mode Detection -unit tested-
- [x] Update `detectEntryMode()` to properly handle OAuth completion
- [x] Add OAuth success mode alongside 'url' and 'manual' modes
- [x] Fix OAuth callback detection logic (lines 44-66 if needed)
- [x] Ensure proper state transitions for OAuth flow

#### 3.5 Test OAuth Detection and Completion -unit tested-
- [x] Use Playwright MCP or manual testing
- [x] Navigate to registration page with OAuth success parameters
- [x] Verify OAuth success detection triggers automatically
- [x] Verify registration completion API call is made
- [x] Check database using Supabase MCP for user creation
- [x] Verify redirect to success page after completion

---

### 4. Registration Hook Enhancement (1 Story Point)

**Objective**: Add OAuth registration support to existing registration hook

#### 4.1 Analyze Current Registration Hook -unit tested-
- [x] Use `read_file` to examine `src/hooks/useRegistration.ts`
- [x] Review existing `submitRegistration()` function
- [x] Understand current error handling and state management
- [x] Identify where OAuth registration logic should be added

#### 4.2 Add OAuth Registration Function -unit tested-
- [x] Create new `submitOAuthRegistration()` function
- [x] Accept access code and email parameters
- [x] Call new OAuth registration API endpoint
- [x] Handle OAuth-specific response and error scenarios
- [x] Integrate with existing error handling system
- [x] Return consistent result format with existing registration

#### 4.3 Enhance Error Handling for OAuth -unit tested-
- [x] Add OAuth-specific error types to state management
- [x] Handle session authentication errors
- [x] Handle OAuth registration conflicts
- [x] Integrate with existing error translation system
- [x] Add OAuth error codes to error classification

#### 4.4 Test Registration Hook Enhancement -unit tested-
- [x] Create test component or use existing registration form
- [x] Test OAuth registration function with valid parameters
- [x] Test error scenarios (invalid session, used access code)
- [x] Verify error messages are user-friendly
- [x] Verify state management works correctly

---

### 5. Type Definitions Enhancement (0.5 Story Points)

**Objective**: Add OAuth-specific type definitions for registration flow

#### 5.1 Add OAuth Registration Types -unit tested-
- [x] Use `read_file` to examine `src/types/index.ts`
- [x] Add `OAuthRegistrationRequest` interface
- [x] Add `OAuthRegistrationResult` interface
- [x] Enhance existing `OAuthUserData` interface if needed
- [x] Add OAuth-specific error codes to error enums

#### 5.2 Update Type Exports -unit tested-
- [x] Export new OAuth registration types
- [x] Verify compatibility with existing registration types
- [x] Update any type references in authorized files
- [x] Add JSDoc comments for OAuth-specific types

---

### 6. Registration Form Integration (0.5 Story Points)

**Objective**: Connect OAuth completion to registration form component

#### 6.1 Analyze Registration Form Component
- [ ] Use `read_file` to examine `src/components/RegistrationForm.tsx`
- [ ] Review OAuth button integration (lines 630-636)
- [ ] Understand current OAuth start handling (lines 267-276)

#### 6.2 Integrate OAuth Completion Handling
- [ ] Connect OAuth completion to registration hook
- [ ] Handle OAuth success state in form component
- [ ] Integrate OAuth errors with form error display
- [ ] Ensure proper loading states during OAuth registration

#### 6.3 Test Form Integration
- [ ] Test OAuth button click and authentication flow
- [ ] Verify form responds properly to OAuth completion
- [ ] Test error display for OAuth registration failures
- [ ] Verify loading states work correctly

---

### 7. End-to-End Integration Testing (1 Story Point)

**Objective**: Comprehensive testing of complete OAuth registration flow

#### 7.1 Database State Preparation
- [ ] Use Supabase MCP to verify current access request state
- [ ] Confirm `sgcleprojets@gmail.com` access request exists and is approved
- [ ] Verify access code `rsqtym53ggkq0z7cs5zzf` is valid and unused
- [ ] Clear any existing user records for clean testing

#### 7.2 Complete OAuth Registration Flow Test
- [ ] Start development server: `npm run dev`
- [ ] Navigate to: `http://localhost:3000/register?code=rsqtym53ggkq0z7cs5zzf&email=sgcleprojets@gmail.com`
- [ ] Click Google OAuth button
- [ ] Complete Google authentication in browser
- [ ] Verify automatic OAuth completion detection
- [ ] Verify registration completion without errors
- [ ] Verify redirect to success page

#### 7.3 Database Verification
- [ ] Use Supabase MCP to verify user creation: `SELECT * FROM users WHERE email = 'sgcleprojets@gmail.com'`
- [ ] Verify user record has `auth_provider: 'google'`
- [ ] Verify default account creation: `SELECT * FROM accounts WHERE owner_id = [user_id]`
- [ ] Verify account linking: `SELECT * FROM account_users WHERE user_id = [user_id]`
- [ ] Verify access code consumption: `SELECT registration_date FROM access_requests WHERE access_code = 'rsqtym53ggkq0z7cs5zzf'`

#### 7.4 User Experience Validation
- [ ] Verify user sees success page with appropriate messaging
- [ ] Test login flow with same Gmail account post-registration
- [ ] Verify user can access admin interface after login
- [ ] Verify account and property management functionality

#### 7.5 Error Scenario Testing
- [ ] Test OAuth registration with invalid access code
- [ ] Test OAuth registration with already-used access code
- [ ] Test OAuth registration without authenticated session
- [ ] Verify appropriate error messages for each scenario
- [ ] Verify user is not created in database for failed attempts

---

### 8. Performance and Security Validation (0.5 Story Points)

**Objective**: Ensure OAuth registration implementation meets security and performance standards

#### 8.1 Security Review
- [ ] Verify OAuth callback does not expose sensitive data in URLs
- [ ] Confirm session validation in OAuth registration API
- [ ] Check that access codes are properly consumed and cannot be reused
- [ ] Verify no sensitive data is logged in console
- [ ] Confirm PKCE flow compliance throughout implementation

#### 8.2 Performance Testing
- [ ] Test OAuth registration with multiple concurrent users
- [ ] Verify database operations are efficient
- [ ] Check for memory leaks in client-side detection
- [ ] Verify error handling does not cause infinite loops
- [ ] Test with various network conditions

#### 8.3 Compatibility Testing
- [ ] Test OAuth flow in different browsers (Chrome, Firefox, Safari)
- [ ] Verify mobile browser compatibility
- [ ] Test with different Gmail accounts
- [ ] Verify existing email/password registration still works
- [ ] Test login flow with both OAuth and email/password users

---

### 9. Documentation and Cleanup (0.5 Story Points)

**Objective**: Document changes and clean up development artifacts

#### 9.1 Code Documentation
- [ ] Add JSDoc comments to new OAuth registration functions
- [ ] Update inline comments for modified functions
- [ ] Document OAuth flow in relevant function headers
- [ ] Add error code documentation for OAuth scenarios

#### 9.2 Development Cleanup
- [ ] Remove any temporary test files or console logs
- [ ] Verify no development-only code remains in production paths
- [ ] Clean up any unused imports or variables
- [ ] Ensure consistent code formatting

#### 9.3 Implementation Verification
- [ ] Review all changes against authorized files list
- [ ] Confirm no unauthorized files were modified
- [ ] Verify all required functionality is implemented
- [ ] Document any deviations from original plan

---

## Success Criteria Checklist

### Technical Implementation Success
- [ ] OAuth callback route simplified and no longer attempts server-side code exchange
- [ ] New OAuth registration API endpoint created and functional
- [ ] Client-side OAuth detection and completion implemented
- [ ] Registration hook enhanced with OAuth support
- [ ] Type definitions updated for OAuth registration
- [ ] Registration form properly integrated with OAuth flow

### Database Operation Success
- [ ] Users created with correct `auth_provider: 'google'` value
- [ ] Default accounts created and linked to users
- [ ] Access codes properly consumed after registration
- [ ] Access request status updated to 'registered'
- [ ] All database operations atomic and consistent

### User Experience Success
- [ ] Complete OAuth registration flow works without errors
- [ ] Users redirected to success page after registration
- [ ] Error messages are user-friendly and actionable
- [ ] No PKCE-related errors in console logs
- [ ] OAuth registration integrates seamlessly with existing UI

### Security and Performance Success
- [ ] PKCE flow security standards maintained
- [ ] Session validation secure and functional
- [ ] No sensitive data exposed in URLs or logs
- [ ] Performance acceptable under normal load
- [ ] Compatible across modern browsers

---

## Emergency Rollback Plan

If critical issues arise during implementation:

1. **Immediate Rollback**: Revert `src/app/auth/oauth/callback/route.ts` to previous state
2. **Remove New Files**: Delete `src/app/api/auth/complete-oauth-registration/route.ts`
3. **Revert Client Changes**: Restore `src/app/register/RegistrationPageContent.tsx`
4. **Database Cleanup**: Use Supabase MCP to remove any test user records
5. **Verify Existing Flows**: Test email/password registration and OAuth login still work

---

## Implementation Notes

### Database Interaction Guidelines
- **ALWAYS** use Supabase MCP for database queries and verification
- **NEVER** execute raw SQL outside of Supabase MCP tools
- **VERIFY** database state before and after each major test
- **BACKUP** test data expectations before cleanup operations

### Error Handling Standards
- **USE** existing error translation and classification systems
- **MAINTAIN** consistent error message formatting
- **LOG** comprehensive debugging information without exposing sensitive data
- **PROVIDE** actionable error messages for users

### Testing Best Practices
- **TEST** each component in isolation before integration
- **VERIFY** database operations using Supabase MCP after each test
- **CLEAN** test data between test runs for consistent results
- **DOCUMENT** any unexpected behaviors or workarounds needed

---

*This document provides the complete implementation roadmap for REQ-020. Each checkbox represents a specific, actionable task that can be completed independently. All database operations must use Supabase MCP tools, and all file modifications must remain within the authorized files list.*