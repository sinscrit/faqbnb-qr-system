# REQ-018: Registration Page with Access Code Validation and OAuth Support - Detailed Implementation

**Document Generated**: Wednesday, August 6, 2025 at 21:37:21 CEST  
**Request Reference**: REQ-018 from docs/gen_requests.md  
**Overview Reference**: docs/req-018-Registration-Page-Access-Code-OAuth-Overview.md  
**Type**: Feature Implementation  
**Complexity**: 13-21 Points (High Complexity)  

## Important Notes for Implementation

⚠️ **CRITICAL INSTRUCTIONS:**
- **ALWAYS operate from the project root folder** (`/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus`)
- **DO NOT navigate to other folders** - all commands must be executed from project root
- **Use Supabase MCP** for all database queries, modifications, and understanding via `mcp_supabase_*` tools
- **Only modify files listed in "Authorized Files and Functions for Modification"**
- **Database changes require checking current state first** using `mcp_supabase_execute_sql`

## Current Database State Analysis

Based on Supabase MCP analysis, the following tables are **CONFIRMED** to exist and be ready for integration:

### ✅ Required Tables Present:
- **`users`** table with `is_admin` boolean field (ready for OAuth integration)
- **`accounts`** table with proper owner relationship (ready for default account creation)
- **`account_users`** junction table with role-based access (ready for auto-assignment)
- **`access_requests`** table with comprehensive access code system including:
  - `access_code` VARCHAR field for validation
  - `status` ENUM with values: 'pending', 'approved', 'rejected', 'denied', 'registered'
  - `registration_date` for tracking completion
  - `requester_email` for email validation

### ✅ Existing Functions Available:
- `validateAccessCode(accessCode)` in `src/lib/access-management.ts` (lines 411-460)
- `registerUser(email, password, fullName)` in `src/lib/auth.ts` (lines 730-774)
- Supabase auth integration fully configured

## Detailed Implementation Tasks

### Phase 1: Registration Page Frontend and Basic Form Validation (3 points)

#### 1. Create Main Registration Page Component (1 point)
**Goal**: Implement the primary registration page at `/register` route with URL parameter handling

**Substeps**:
- [ ] Create directory structure: `mkdir -p src/app/register`
- [ ] Create file `src/app/register/page.tsx` with Next.js 13+ App Router structure
- [ ] Implement URL parameter extraction using `useSearchParams()` for `code` and `email`
- [ ] Add parameter validation:
  - [ ] Validate `code` parameter exists and matches format `^[A-Z0-9]{12}$`
  - [ ] Validate `email` parameter exists and matches email format
  - [ ] Display user-friendly error for missing/invalid parameters
- [ ] Create responsive page layout with mobile-first design
- [ ] Add proper meta tags and page title
- [ ] Implement loading states for initial parameter validation
- [ ] Add error boundary for graceful error handling

**Test Steps**:
- [ ] Test URL: `http://localhost:3000/register?code=ABC123DEF456&email=test@example.com`
- [ ] Verify parameter extraction works correctly
- [ ] Test error handling for malformed URLs
- [ ] Verify responsive design on mobile/desktop

#### 2. Implement Registration Form Component (1 point)
**Goal**: Create reusable registration form supporting both email/password and OAuth methods

**Substeps**:
- [ ] Create file `src/components/RegistrationForm.tsx`
- [ ] Implement form state management using `useState` or `useReducer`
- [ ] Add form fields:
  - [ ] Email field (pre-populated from URL parameter, read-only)
  - [ ] Password field with show/hide toggle
  - [ ] Confirm password field
  - [ ] Full name field (optional)
  - [ ] Terms and conditions checkbox
- [ ] Implement client-side validation:
  - [ ] Email format validation (even though pre-populated)
  - [ ] Password strength validation (min 8 chars, 1 letter, 1 number)
  - [ ] Password confirmation matching
  - [ ] Full name minimum 2 characters if provided
- [ ] Add real-time validation feedback
- [ ] Implement form submission handling
- [ ] Add loading states and disabled states during submission
- [ ] Create error message display system

**Test Steps**:
- [ ] Test form validation with invalid inputs
- [ ] Verify password strength requirements
- [ ] Test form submission prevents duplicate submissions
- [ ] Verify accessibility with screen readers

#### 3. Create Registration Logic Hook (1 point)
**Goal**: Implement custom hook for registration business logic and API communication

**Substeps**:
- [ ] Create file `src/hooks/useRegistration.ts`
- [ ] Implement hook state management:
  - [ ] `isLoading` state for submission status
  - [ ] `error` state for error messages
  - [ ] `isValidating` state for access code validation
- [ ] Create function `validateAccessCodeAsync(code, email)`:
  - [ ] Call `/api/auth/validate-code` endpoint
  - [ ] Handle validation responses
  - [ ] Return validation status and error messages
- [ ] Create function `submitRegistration(formData)`:
  - [ ] Submit to `/api/auth/register` with access code
  - [ ] Handle success/error responses
  - [ ] Trigger post-registration actions
- [ ] Implement automatic access code validation on component mount
- [ ] Add retry mechanisms for network failures
- [ ] Implement proper cleanup on component unmount

**Test Steps**:
- [ ] Test access code validation with valid/invalid codes
- [ ] Test registration submission with valid data
- [ ] Test error handling for network failures
- [ ] Verify hook cleanup prevents memory leaks

### Phase 2: Access Code Validation System and API Integration (4 points)

#### 4. Create Access Code Validation API Endpoint (1 point)
**Goal**: Implement server-side API endpoint for secure access code validation

**Substeps**:
- [ ] Create file `src/app/api/auth/validate-code/route.ts`
- [ ] Implement `GET` handler for code validation:
  - [ ] Extract `code` and `email` from query parameters
  - [ ] Validate parameter format and presence
  - [ ] Call existing `validateAccessCode()` from `src/lib/access-management.ts`
  - [ ] Verify email matches `requester_email` in database
  - [ ] Return validation result with appropriate HTTP status codes
- [ ] Implement rate limiting (max 10 requests per minute per IP)
- [ ] Add comprehensive error handling
- [ ] Add request logging for security monitoring
- [ ] Implement CORS headers if needed

**Test Steps**:
- [ ] Use `mcp_supabase_execute_sql` to create test access request with known code
- [ ] Test endpoint with valid code/email combination
- [ ] Test with invalid codes, emails, or missing parameters
- [ ] Verify rate limiting works correctly
- [ ] Test error responses are properly formatted

#### 5. Enhance Access Validation Library (1 point)
**Goal**: Extend existing access validation utilities for registration-specific needs

**Substeps**:
- [ ] Create file `src/lib/access-validation.ts` (extends existing functions)
- [ ] Implement `validateAccessCodeForRegistration(code, email)`:
  - [ ] Use existing `validateAccessCode()` from access-management.ts
  - [ ] Add email matching validation
  - [ ] Check if code hasn't been used for registration yet
  - [ ] Return detailed validation result with account information
- [ ] Implement `consumeAccessCode(code, userId)`:
  - [ ] Update `access_requests` table to mark code as used
  - [ ] Set `registration_date` to current timestamp
  - [ ] Set `status` to 'registered'
  - [ ] Add user ID reference if available
- [ ] Add `generateAccessCodeMetadata(request)`:
  - [ ] Extract relevant account and request information
  - [ ] Return metadata for registration process
- [ ] Implement proper error handling and logging

**Test Steps**:
- [ ] Test validation with existing access request data
- [ ] Test email matching validation
- [ ] Test code consumption updates database correctly
- [ ] Verify error handling for edge cases

#### 6. Database Schema Verification and Updates (1 point)
**Goal**: Verify existing database schema supports registration flow and add missing indexes

**Substeps**:
- [ ] Use `mcp_supabase_execute_sql` to verify current `access_requests` table structure
- [ ] Confirm required fields exist:
  - [ ] `access_code` VARCHAR (confirmed present)
  - [ ] `status` ENUM with 'registered' value (confirmed present)
  - [ ] `registration_date` TIMESTAMP (confirmed present)
  - [ ] `requester_email` VARCHAR (confirmed present)
- [ ] Add missing indexes if needed using `mcp_supabase_apply_migration`:
  - [ ] `CREATE INDEX IF NOT EXISTS idx_access_requests_code_status ON access_requests(access_code, status);`
  - [ ] `CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(requester_email);`
- [ ] Verify `users` table has required fields:
  - [ ] `is_admin` boolean (confirmed present)
  - [ ] Proper foreign key to `auth.users` (confirmed present)
- [ ] Test query performance with new indexes

**Test Steps**:
- [ ] Use `mcp_supabase_execute_sql` to test index creation
- [ ] Verify query performance with `EXPLAIN ANALYZE`
- [ ] Test access code lookups are fast
- [ ] Confirm foreign key constraints work correctly

#### 7. Integration Testing for Validation Flow (1 point)
**Goal**: Comprehensive testing of access code validation end-to-end

**Substeps**:
- [ ] Create test access request using `mcp_supabase_execute_sql`:
  ```sql
  INSERT INTO access_requests (requester_email, access_code, status) 
  VALUES ('test@example.com', 'TEST12345678', 'approved');
  ```
- [ ] Test validation API endpoint:
  - [ ] Valid code/email combination returns success
  - [ ] Invalid code returns appropriate error
  - [ ] Mismatched email returns error
  - [ ] Already consumed code returns error
- [ ] Test frontend integration:
  - [ ] Registration page validates code on load
  - [ ] Error messages display correctly
  - [ ] Valid codes enable registration form
- [ ] Test security aspects:
  - [ ] Rate limiting prevents abuse
  - [ ] SQL injection attempts are blocked
  - [ ] Error messages don't leak sensitive information
- [ ] Clean up test data after testing

**Test Steps**:
- [ ] Run through complete validation flow
- [ ] Test all error scenarios
- [ ] Verify security measures work
- [ ] Clean up test access requests

### Phase 3: Google OAuth Setup and Integration (8 points)

#### 8. Configure Google OAuth Provider in Supabase (2 points)
**Goal**: Set up Google OAuth provider configuration in Supabase dashboard and environment

**Substeps**:
- [ ] Access Supabase project dashboard → Authentication → Providers
- [ ] Enable Google OAuth provider
- [ ] Configure OAuth settings:
  - [ ] Set authorized redirect URI: `{SUPABASE_URL}/auth/v1/callback`
  - [ ] Configure allowed domains if needed
  - [ ] Set OAuth scopes: `openid`, `email`, `profile`
- [ ] Update environment variables in `.env.local`:
  - [ ] Add `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_client_id`
  - [ ] Add `GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret`
  - [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
  - [ ] Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- [ ] Test OAuth configuration in Supabase dashboard
- [ ] Verify OAuth provider shows as enabled

**Test Steps**:
- [ ] Check Supabase dashboard shows Google OAuth enabled
- [ ] Verify environment variables are loaded correctly
- [ ] Test OAuth redirect URL configuration
- [ ] Confirm OAuth scopes are properly set

#### 9. Implement Google OAuth Button Component (2 points)
**Goal**: Create reusable OAuth button component with proper Google OAuth integration

**Substeps**:
- [ ] Create file `src/components/GoogleOAuthButton.tsx`
- [ ] Implement component with Supabase OAuth integration:
  - [ ] Use `supabase.auth.signInWithOAuth({ provider: 'google' })`
  - [ ] Configure redirect URL to registration completion page
  - [ ] Add proper loading states
  - [ ] Handle OAuth errors gracefully
- [ ] Style button according to Google OAuth design guidelines:
  - [ ] Use proper Google logo and colors
  - [ ] Add hover and focus states
  - [ ] Ensure accessibility compliance
- [ ] Implement OAuth state management:
  - [ ] Pass access code as state parameter
  - [ ] Include email parameter for validation
  - [ ] Handle OAuth callback data
- [ ] Add analytics tracking for OAuth usage
- [ ] Implement retry mechanism for failed OAuth attempts

**Test Steps**:
- [ ] Test OAuth button initiates Google OAuth flow
- [ ] Verify button styling follows Google guidelines
- [ ] Test loading states and error handling
- [ ] Verify accessibility with keyboard navigation

#### 10. Create OAuth Callback Handler (2 points)
**Goal**: Implement OAuth callback processing for registration completion

**Substeps**:
- [ ] Create file `src/app/api/auth/oauth/callback/route.ts`
- [ ] Implement `GET` handler for OAuth callback:
  - [ ] Extract OAuth code and state parameters
  - [ ] Validate state parameter contains access code
  - [ ] Exchange OAuth code for user tokens using Supabase
  - [ ] Extract user profile data (email, name, picture)
- [ ] Implement OAuth user registration:
  - [ ] Validate access code from state parameter
  - [ ] Create user record in `users` table
  - [ ] Create default account for user
  - [ ] Link user to account with owner role
  - [ ] Mark access code as consumed
- [ ] Handle OAuth-specific scenarios:
  - [ ] User email doesn't match access request email
  - [ ] User already exists with different auth method
  - [ ] OAuth provider returns incomplete data
- [ ] Implement proper redirect handling:
  - [ ] Success redirect to dashboard
  - [ ] Error redirect to registration page with error message
- [ ] Add comprehensive logging for OAuth flow

**Test Steps**:
- [ ] Test complete OAuth flow from button to callback
- [ ] Test error scenarios and redirects
- [ ] Verify user and account creation
- [ ] Test access code consumption

#### 11. Integrate OAuth with Registration Context (1 point)
**Goal**: Update authentication context to support OAuth registration flow

**Substeps**:
- [ ] Update `src/contexts/AuthContext.tsx`:
  - [ ] Add OAuth registration function
  - [ ] Handle OAuth session management
  - [ ] Update user state after OAuth completion
  - [ ] Add OAuth error handling
- [ ] Integrate OAuth button with registration form:
  - [ ] Add OAuth button to registration form
  - [ ] Show "OR" divider between email/password and OAuth
  - [ ] Disable form during OAuth flow
  - [ ] Handle OAuth completion in form component
- [ ] Update registration page to support OAuth flow:
  - [ ] Show OAuth button when access code is valid
  - [ ] Handle OAuth callback redirects
  - [ ] Display appropriate success/error messages
- [ ] Test integration with existing auth flow

**Test Steps**:
- [ ] Test OAuth integration with auth context
- [ ] Verify session management after OAuth
- [ ] Test form interaction with OAuth flow
- [ ] Verify user experience is smooth

#### 12. OAuth Error Handling and Security (1 point)
**Goal**: Implement comprehensive OAuth error handling and security measures

**Substeps**:
- [ ] Implement OAuth error scenarios:
  - [ ] User denies OAuth permissions
  - [ ] OAuth provider returns error
  - [ ] Network failures during OAuth flow
  - [ ] Invalid or expired OAuth tokens
- [ ] Add security measures:
  - [ ] Validate OAuth state parameter to prevent CSRF
  - [ ] Verify OAuth callback origin
  - [ ] Implement OAuth session timeout
  - [ ] Add rate limiting for OAuth attempts
- [ ] Create user-friendly error messages:
  - [ ] "Please try again" for temporary errors
  - [ ] "Permission denied" for user cancellation
  - [ ] "Technical issue" for server errors
- [ ] Add OAuth flow monitoring and logging:
  - [ ] Log OAuth initiation and completion
  - [ ] Track OAuth success/failure rates
  - [ ] Monitor for suspicious OAuth activity
- [ ] Implement OAuth retry mechanisms

**Test Steps**:
- [ ] Test all OAuth error scenarios
- [ ] Verify security measures prevent attacks
- [ ] Test error message clarity for users
- [ ] Verify logging captures necessary information

### Phase 4: Enhanced Registration API and Account Creation (6 points)

#### 13. Extend Registration API for Access Code Flow (2 points)
**Goal**: Enhance existing registration endpoint to support access code validation and consumption

**Substeps**:
- [ ] Update file `src/app/api/auth/register/route.ts`:
  - [ ] Add access code parameter to request body
  - [ ] Validate access code before registration
  - [ ] Call `validateAccessCodeForRegistration()` function
  - [ ] Ensure email matches access request
- [ ] Enhance registration flow:
  - [ ] Call existing `registerUser()` function
  - [ ] Add account creation after user creation
  - [ ] Consume access code after successful registration
  - [ ] Handle transaction rollback on failures
- [ ] Update request/response types:
  - [ ] Add `accessCode` to registration request interface
  - [ ] Include account information in success response
  - [ ] Add access code specific error messages
- [ ] Implement comprehensive error handling:
  - [ ] Invalid access code errors
  - [ ] Email mismatch errors
  - [ ] Registration failures
  - [ ] Account creation failures
- [ ] Add request logging and monitoring

**Test Steps**:
- [ ] Test registration with valid access code
- [ ] Test error handling for invalid codes
- [ ] Verify email validation works
- [ ] Test complete registration flow

#### 14. Implement Default Account Creation (2 points)
**Goal**: Create automatic default account setup for newly registered users

**Substeps**:
- [ ] Enhance `src/lib/auth.ts` with account creation functions:
  - [ ] Implement `createDefaultAccount(userId, userEmail)`:
    - [ ] Generate account name: "Default Account"
    - [ ] Set user as account owner
    - [ ] Create account record in `accounts` table
    - [ ] Return account ID and details
  - [ ] Implement `linkUserToAccount(userId, accountId, role)`:
    - [ ] Create record in `account_users` table
    - [ ] Set role to 'owner' for default accounts
    - [ ] Set proper timestamps
    - [ ] Handle duplicate relationship errors
- [ ] Update `registerUser()` function:
  - [ ] Call `createDefaultAccount()` after user creation
  - [ ] Call `linkUserToAccount()` to establish ownership
  - [ ] Include account info in return data
  - [ ] Handle account creation failures gracefully
- [ ] Implement database transaction logic:
  - [ ] Use Supabase transactions where possible
  - [ ] Implement manual rollback for failures
  - [ ] Ensure data consistency
- [ ] Add proper error handling and logging

**Test Steps**:
- [ ] Test account creation for new users
- [ ] Verify account ownership relationships
- [ ] Test transaction rollback on failures
- [ ] Verify account settings are properly initialized

#### 15. Update Type Definitions (1 point)
**Goal**: Add TypeScript interfaces for new registration flow types

**Substeps**:
- [ ] Update `src/types/index.ts`:
  - [ ] Add `RegistrationRequest` interface:
    ```typescript
    interface RegistrationRequest {
      email: string;
      password: string;
      fullName?: string;
      confirmPassword?: string;
      accessCode: string;
    }
    ```
  - [ ] Add `AccessCodeValidation` interface:
    ```typescript
    interface AccessCodeValidation {
      isValid: boolean;
      request?: AccessRequest;
      account?: Account;
      error?: string;
    }
    ```
  - [ ] Add `OAuthUserData` interface:
    ```typescript
    interface OAuthUserData {
      email: string;
      fullName?: string;
      picture?: string;
      provider: 'google';
      providerId: string;
    }
    ```
  - [ ] Add `RegistrationResult` interface:
    ```typescript
    interface RegistrationResult {
      success: boolean;
      user?: User;
      account?: Account;
      session?: Session;
      error?: string;
    }
    ```
- [ ] Export all new interfaces
- [ ] Update existing interfaces if needed
- [ ] Ensure type compatibility across components

**Test Steps**:
- [ ] Verify TypeScript compilation succeeds
- [ ] Test type checking in components
- [ ] Verify interface completeness
- [ ] Test type safety in API endpoints

#### 16. Comprehensive Registration Testing (1 point)
**Goal**: End-to-end testing of complete registration system

**Substeps**:
- [ ] Create comprehensive test scenarios:
  - [ ] Email/password registration with valid access code
  - [ ] Google OAuth registration with valid access code
  - [ ] Registration with invalid access code
  - [ ] Registration with mismatched email
  - [ ] Registration with already used access code
- [ ] Test database state after each scenario:
  - [ ] User record created correctly
  - [ ] Account record created and linked
  - [ ] Access code marked as consumed
  - [ ] Proper relationship in `account_users` table
- [ ] Test user experience flows:
  - [ ] Complete registration redirects to dashboard
  - [ ] Error scenarios show appropriate messages
  - [ ] Loading states work correctly
  - [ ] Success messages are clear
- [ ] Verify security measures:
  - [ ] Rate limiting prevents abuse
  - [ ] CSRF protection works
  - [ ] Input validation prevents attacks
  - [ ] Error messages don't leak information
- [ ] Performance testing:
  - [ ] Registration completes in reasonable time
  - [ ] Database queries are optimized
  - [ ] No memory leaks in frontend
- [ ] Clean up all test data after testing

**Test Steps**:
- [ ] Run all test scenarios systematically
- [ ] Verify database state using `mcp_supabase_execute_sql`
- [ ] Test user experience manually
- [ ] Verify security and performance
- [ ] Clean up test data

## Security Considerations

### Access Code Security:
- [ ] Access codes are single-use only
- [ ] Codes expire after reasonable time period
- [ ] Email validation prevents unauthorized access
- [ ] Rate limiting prevents brute force attacks

### OAuth Security:
- [ ] CSRF protection via state parameter
- [ ] Secure token exchange
- [ ] Proper redirect URI validation
- [ ] Session management security

### Database Security:
- [ ] Parameterized queries prevent SQL injection
- [ ] Row Level Security (RLS) policies active
- [ ] Proper foreign key constraints
- [ ] Audit logging for registration events

## Testing Requirements

Each task must include:
- [ ] Unit tests for new functions
- [ ] Integration tests for API endpoints
- [ ] Frontend component testing
- [ ] Database query testing using `mcp_supabase_execute_sql`
- [ ] End-to-end user flow testing
- [ ] Security testing for vulnerabilities
- [ ] Performance testing for optimization
- [ ] Cross-browser testing for compatibility

## Completion Criteria

A task is considered complete when:
- [ ] All substeps are checked and verified
- [ ] Unit and integration tests pass
- [ ] No TypeScript compilation errors
- [ ] No security vulnerabilities identified
- [ ] Performance meets requirements
- [ ] Database state is correct after operations
- [ ] User experience flows work as expected
- [ ] Code review by another developer (if applicable)

## Rollback Plan

If implementation fails:
1. [ ] Use `mcp_supabase_execute_sql` to rollback database changes
2. [ ] Remove or comment out new code files
3. [ ] Revert environment variable changes
4. [ ] Disable OAuth provider in Supabase dashboard
5. [ ] Restore original registration flow functionality

---

**Total Estimated Time**: 13-20 days  
**Critical Path**: Phase 3 (OAuth setup) → Phase 4 (Account creation)  
**Risk Mitigation**: Test each phase independently before proceeding  
**Success Metrics**: Users can successfully register via access codes with both auth methods