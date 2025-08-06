# REQ-018: Registration Page with Access Code Validation and OAuth Support - Implementation Overview

**Document Generated**: Wednesday, August 6, 2025 at 21:30:43 CEST  
**Request Reference**: REQ-018 from docs/gen_requests.md  
**Type**: Feature Implementation  
**Complexity**: 13-21 Points (High Complexity)  

## Executive Summary

This document outlines the implementation plan for REQ-018, which requires creating a comprehensive user registration system accessible via `http://localhost:3000/register?code=XXXXX&email=pendinguseremail@domain.com`. The system must validate access codes from approved pending requests, support both email/password and Google OAuth registration methods, and automatically create a default account with the user as owner upon successful registration.

## Goals and Objectives

### Primary Goals
1. **Secure Registration Flow**: Implement access code-based registration system preventing unauthorized signups
2. **Dual Authentication Support**: Enable both traditional email/password and Google OAuth registration methods
3. **Account Auto-Provisioning**: Automatically create and assign ownership of default accounts to new users
4. **Integration with Existing Systems**: Seamlessly integrate with current Supabase authentication and multi-tenant architecture

### Secondary Objectives
- Maintain security standards with proper access code validation and consumption
- Provide comprehensive error handling and user feedback
- Ensure mobile-responsive registration interface
- Support URL parameter-based pre-population for streamlined user experience

## Implementation Order and Breakdown

### Phase 1: Registration Page Frontend and Basic Form Validation (3 points)
**Priority**: High - Foundation for all subsequent phases  
**Estimated Duration**: 2-3 days

#### Deliverables:
- Create registration page component with URL parameter parsing
- Implement basic form validation and error handling
- Design responsive UI layout supporting both auth methods
- Establish component architecture for OAuth integration

#### Key Tasks:
1. Create `src/app/register/page.tsx` with Next.js routing
2. Implement URL parameter extraction and validation for `code` and `email`
3. Design registration form component with form state management
4. Add client-side validation for email format and password strength
5. Create error messaging system for user feedback

### Phase 2: Access Code Validation System and API Integration (4 points)
**Priority**: High - Critical security component  
**Estimated Duration**: 3-4 days

#### Deliverables:
- Server-side access code validation against database
- Secure code consumption mechanism preventing replay attacks
- API endpoint for code verification before registration
- Integration with existing access request system

#### Key Tasks:
1. Create `src/app/api/auth/validate-code/route.ts` endpoint
2. Implement access code validation logic in `src/lib/access-validation.ts`
3. Add code expiration and status checking
4. Integrate with existing `access_requests` table structure
5. Implement secure code consumption marking codes as used

### Phase 3: Google OAuth Setup and Integration (8 points)
**Priority**: Medium-High - Complex third-party integration  
**Estimated Duration**: 5-7 days

#### Deliverables:
- Google OAuth provider configuration in Supabase
- Complete OAuth authentication flow implementation
- OAuth callback handling and session management
- User profile data mapping and integration

#### Key Tasks:
1. Configure Google OAuth provider in Supabase dashboard
2. Set up environment variables for Google OAuth credentials
3. Implement OAuth button component in `src/components/GoogleOAuthButton.tsx`
4. Create OAuth callback handler in `src/app/api/auth/oauth/callback/route.ts`
5. Integrate OAuth flow with existing AuthContext
6. Handle OAuth-specific error scenarios and user feedback

### Phase 4: Default Account Creation and Final Integration (6 points)
**Priority**: High - Core business logic completion  
**Estimated Duration**: 3-4 days

#### Deliverables:
- Enhanced registration API supporting access code flow
- Automatic default account creation functionality
- Complete user onboarding workflow
- End-to-end testing and validation

#### Key Tasks:
1. Extend existing registration API to handle access codes
2. Implement default account creation logic
3. Add database transaction handling for atomic operations
4. Integrate account creation with user registration
5. Complete registration workflow testing

## Technical Architecture

### Database Requirements

#### Existing Tables to Modify:
- **access_requests**: Add code consumption tracking
- **users**: Ensure compatibility with new registration flow
- **accounts**: Support auto-creation for new users
- **account_users**: Automatic owner assignment

#### New Validation Logic:
- Access code uniqueness and expiration validation
- Email-to-request matching verification
- Code status tracking (pending, approved, used, expired)

### API Endpoints Structure

#### New Endpoints:
- `GET/POST /api/auth/validate-code` - Code validation and verification
- `POST /api/auth/oauth/callback` - OAuth callback handling

#### Enhanced Endpoints:
- `POST /api/auth/register` - Extended for access code validation and account creation

### Authentication Flow Design

#### Traditional Registration:
1. User visits `/register?code=XXXXX&email=user@domain.com`
2. System validates access code against database
3. User completes email/password form
4. Server validates code, creates user, and creates default account
5. User automatically logged in with session created

#### OAuth Registration:
1. User visits registration page with access code
2. User clicks "Sign in with Google" button
3. OAuth flow redirects to Google for authentication
4. Callback validates access code and creates user/account
5. User redirected to dashboard with active session

## Risk Assessment and Mitigation

### High-Risk Areas:
1. **OAuth Integration Complexity**: Mitigation - Use Supabase's built-in OAuth providers
2. **Security Vulnerabilities**: Mitigation - Implement proper code validation and CSRF protection
3. **Database Transaction Failures**: Mitigation - Use atomic transactions for user/account creation

### Medium-Risk Areas:
1. **URL Parameter Tampering**: Mitigation - Server-side validation of all parameters
2. **Code Replay Attacks**: Mitigation - Single-use code consumption tracking
3. **Session Management**: Mitigation - Leverage Supabase's session handling

## Testing Strategy

### Unit Testing:
- Access code validation functions
- Account creation utilities
- OAuth integration components
- Form validation logic

### Integration Testing:
- Complete registration flow end-to-end
- OAuth callback functionality
- Database transaction integrity
- Error handling scenarios

### Security Testing:
- Access code tampering attempts
- CSRF protection validation
- OAuth flow security
- SQL injection prevention

## Success Criteria

### Functional Requirements:
- ✅ Users can register via access code-protected URL
- ✅ Both email/password and Google OAuth registration work
- ✅ Default accounts created automatically with proper ownership
- ✅ Access codes properly validated and consumed
- ✅ Integration with existing authentication system

### Performance Requirements:
- Registration process completes in under 5 seconds
- OAuth flow completes within 10 seconds
- Database queries optimized for sub-second response times

### Security Requirements:
- Access codes cannot be reused or replayed
- All user input properly validated and sanitized
- OAuth tokens securely handled
- Database transactions atomic and consistent

## Authorized Files and Functions for Modification

### New Files to Create:
```
src/app/register/page.tsx
├── Main registration page component
├── URL parameter parsing and validation
├── Dual authentication method support
└── Error handling and user feedback

src/components/RegistrationForm.tsx
├── Registration form component
├── Form state management
├── Client-side validation
└── Email/password input handling

src/components/GoogleOAuthButton.tsx
├── OAuth button component
├── Google OAuth integration
├── OAuth flow initiation
└── Loading and error states

src/hooks/useRegistration.ts
├── Registration logic hook
├── API communication
├── State management
└── Error handling

src/app/api/auth/validate-code/route.ts
├── GET: validateAccessCode(code, email)
├── POST: consumeAccessCode(code, userId)
├── Access code validation logic
└── Security checks and rate limiting

src/app/api/auth/oauth/callback/route.ts
├── GET: handleOAuthCallback(code, state)
├── OAuth token exchange
├── User profile data extraction
└── Account creation integration

src/lib/access-validation.ts
├── validateAccessCode(code: string, email: string)
├── consumeAccessCode(code: string)
├── checkCodeExpiration(code: string)
└── generateSecureCode()
```

### Existing Files to Modify:
```
src/app/api/auth/register/route.ts
├── POST: Enhanced registration handler
├── Access code validation integration
├── Account creation workflow
└── OAuth registration support

src/lib/auth.ts
├── registerUser() - Enhanced for access codes
├── createDefaultAccount() - New function
├── linkUserToAccount() - New function
└── validateRegistrationData() - Enhanced validation

src/lib/supabase.ts
├── OAuth provider configuration
├── Client initialization updates
├── New OAuth scopes and settings
└── Environment variable integration

src/contexts/AuthContext.tsx
├── register() - Enhanced registration function
├── OAuth state management
├── Session handling updates
└── Account context integration

src/types/index.ts
├── RegistrationRequest interface
├── AccessCodeValidation interface
├── OAuthUserData interface
└── DefaultAccountSettings interface

.env.local
├── GOOGLE_OAUTH_CLIENT_ID
├── GOOGLE_OAUTH_CLIENT_SECRET
├── NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI
└── ACCESS_CODE_EXPIRY_HOURS
```

### Database Schema Updates:
```
access_requests table
├── Add: used_at TIMESTAMP
├── Add: used_by_user_id UUID REFERENCES users(id)
├── Modify: status ENUM add 'consumed' value
└── Index: idx_access_requests_code_status

accounts table
├── Verify: owner_id UUID NOT NULL
├── Verify: name VARCHAR(255) NOT NULL
├── Add: is_default BOOLEAN DEFAULT false
└── Index: idx_accounts_owner_default

account_users table
├── Verify: account_id, user_id, role structure
├── Add: created_via ENUM ('registration', 'invitation', 'admin')
└── Constraint: unique(account_id, user_id)
```

### Key Functions by Component:

#### Frontend Components:
- `RegistrationPage.validateUrlParams()`
- `RegistrationForm.handleSubmit()`
- `RegistrationForm.validateForm()`
- `GoogleOAuthButton.initiateOAuth()`
- `useRegistration.submitRegistration()`

#### Backend API Functions:
- `validateAccessCode(code, email)` in access-validation.ts
- `consumeAccessCode(code, userId)` in access-validation.ts
- `registerUserWithCode()` in auth.ts
- `createDefaultAccount()` in auth.ts
- `handleOAuthRegistration()` in oauth/callback/route.ts

#### Authentication Functions:
- `AuthContext.register()` - Enhanced for OAuth and access codes
- `validateAdminAuth()` - Existing, no changes needed
- `getDefaultAccountForUser()` - Existing, may need enhancement

#### Database Functions:
- `createUser()` - Existing, minor enhancements for metadata
- `createAccount()` - New function for default account creation
- `linkUserToAccount()` - New function for automatic ownership
- `updateAccessRequestStatus()` - New function for code consumption

## Dependencies and Prerequisites

### External Dependencies:
- Google OAuth 2.0 API credentials
- Supabase OAuth provider configuration
- Next.js 13+ App Router support
- React 18+ with hooks support

### Internal Dependencies:
- Existing Supabase authentication system
- Multi-tenant account structure (REQ-008/009)
- Access request management system (REQ-016)
- Current AuthContext implementation

### Configuration Requirements:
- Google Cloud Console project setup
- OAuth consent screen configuration
- Supabase dashboard OAuth provider setup
- Environment variable configuration
- Database migration execution

---

**Implementation Timeline**: 13-20 days  
**Risk Level**: Medium-High (OAuth complexity, security requirements)  
**Business Impact**: High (Core user onboarding functionality)  
**Technical Debt**: Low (Builds on existing architecture)  

**Next Steps**: Upon approval, begin with Phase 1 frontend implementation while setting up Google OAuth credentials for Phase 3.