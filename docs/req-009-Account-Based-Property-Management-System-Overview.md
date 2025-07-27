# REQ-009: Account-Based Property Management System (Phase 2) - Implementation Overview

**Request Reference**: REQ-009 from `docs/gen_requests.md`  
**Date**: July 27, 2025 01:12:31 CEST  
**Type**: Major Feature Implementation (Architecture - Phase 2)  
**Complexity**: 15 Points (High Complexity)  
**Priority**: High Priority - Core admin functionality transformation; enables multi-tenant management

## Request Summary

Transform the admin property management system to be account-based, implementing account context throughout the admin interface while maintaining all public functionality unchanged. This is Phase 2 of the multi-tenant architecture, building upon Phase 1 (REQ-008) which established the foundational database structure.

## Goals and Implementation Order

### Phase 2A: Admin API Account Integration (8 points)
**Priority**: Critical - Must be completed first as all other phases depend on API changes

**Primary Goal**: Modify all `/api/admin/*` endpoints to operate within account context rather than direct user context, while preserving existing functionality for regular users and enhancing capabilities for admin users.

**Implementation Order**:
1. **Property Management APIs** - Update property CRUD operations for account-based filtering
2. **Item Management APIs** - Ensure items respect account boundaries through properties  
3. **Analytics APIs** - Implement account-based analytics and reporting
4. **Account Validation** - Add account ownership validation across all endpoints

### Phase 2B: Authentication & Session Updates (4 points)
**Priority**: High - Required for account switching and permission validation

**Primary Goal**: Integrate account context into the authentication system, enabling users to operate within specific account contexts and switch between accounts they belong to.

**Implementation Order**:
1. **Session Management** - Track current account in user sessions
2. **Account Context Integration** - Update AuthContext to include account information
3. **Permission Validation** - Ensure users can only access accounts they're associated with
4. **Account Switching Logic** - Allow users to switch between accounts they belong to

### Phase 2C: Admin Interface Updates (3 points)
**Priority**: Medium - UI improvements that depend on backend account integration

**Primary Goal**: Create account-aware admin interface with seamless account switching capabilities while maintaining intuitive user experience.

**Implementation Order**:
1. **Account Selector Component** - UI for switching between accounts
2. **Admin Dashboard Updates** - Account context throughout admin interface
3. **Property Management Updates** - Account-aware property forms and listings

## Technical Challenges

1. **Performance**: Efficient account-based filtering across large datasets
2. **Security**: Robust account isolation and access control  
3. **User Experience**: Intuitive account switching without confusion
4. **Data Consistency**: Ensuring account boundaries are properly enforced
5. **Backward Compatibility**: Maintaining existing functionality while adding account features

## Authorized Files and Functions for Modification

### Phase 2A: Admin API Account Integration

#### Core API Route Files
- **`src/app/api/admin/properties/route.ts`**
  - Functions: `GET()`, `POST()`
  - Changes: Add account filtering logic, modify property queries to include account context
  
- **`src/app/api/admin/properties/[propertyId]/route.ts`**  
  - Functions: `GET()`, `PUT()`, `DELETE()`
  - Changes: Add account validation for property access, ensure property belongs to current account context

- **`src/app/api/admin/items/route.ts`**
  - Functions: `GET()`, `POST()`, `validateAdminAuth()`
  - Changes: Implement account-based item filtering through property relationships

- **`src/app/api/admin/items/[publicId]/route.ts`**
  - Functions: `GET()`, `PUT()`, `DELETE()`
  - Changes: Add account boundary validation for item operations

- **`src/app/api/admin/analytics/route.ts`**
  - Functions: `GET()`
  - Changes: Implement account-based analytics filtering and aggregation

- **`src/app/api/admin/analytics/reactions/route.ts`**
  - Functions: `GET()`
  - Changes: Account-based reaction analytics

#### Account Management API (New)
- **`src/app/api/admin/accounts/route.ts`** (New File)
  - Functions: `GET()`, `POST()` (if account creation is needed)
  - Purpose: Basic account management endpoints

### Phase 2B: Authentication & Session Updates

#### Authentication Core Files
- **`src/lib/auth.ts`**
  - Functions: `getUser()`, `getSession()`, `validateAdminAuth()`
  - Changes: Add account session management functions, account context validation

- **`src/contexts/AuthContext.tsx`**
  - Functions: `AuthProvider()`, context state management
  - Changes: Add account context state, account switching logic, current account tracking

- **`src/app/api/auth/session/route.ts`**
  - Functions: `GET()`, `POST()`
  - Changes: Include account information in session data, account context validation

- **`src/middleware.ts`**
  - Functions: `middleware()`, `extractPropertyIdFromPath()`
  - Changes: Add account-based route protection, account membership validation

#### Session and Permission Files
- **`src/lib/session.ts`**
  - Functions: `getSessionId()`, session management functions
  - Changes: Account context in session data

### Phase 2C: Admin Interface Updates

#### Layout and Navigation
- **`src/app/admin/layout.tsx`**
  - Functions: `AdminLayoutContent()`, `getNavigationItems()`
  - Changes: Integrate account selector component, account context throughout layout

- **`src/components/AccountSelector.tsx`** (New File)
  - Functions: Account selection component, account switching logic
  - Purpose: UI for switching between accounts

#### Admin Pages
- **`src/app/admin/page.tsx`**
  - Functions: Main admin dashboard component
  - Changes: Account-based item display, account context filtering

- **`src/app/admin/properties/page.tsx`**
  - Functions: Properties list component
  - Changes: Account filtering in property management interface

- **`src/app/admin/items/page.tsx`**
  - Functions: Items list component  
  - Changes: Account-aware item filtering and display

- **`src/app/admin/analytics/page.tsx`**
  - Functions: Analytics dashboard component
  - Changes: Account-based analytics filtering and display

#### Form Components
- **`src/components/PropertyForm.tsx`**
  - Functions: Property creation/editing form
  - Changes: Account context in property operations

- **`src/components/ItemForm.tsx`**
  - Functions: Item creation/editing form
  - Changes: Account-aware property selection

### Type Definitions and Utilities

#### Type Files
- **`src/types/index.ts`**
  - Changes: Enhance Account and AccountUser type definitions, add account-related API types

#### Utility Files  
- **`src/lib/api.ts`**
  - Functions: `apiRequest()`, API utility functions
  - Changes: Account context in API requests, account header management

## Implementation Dependencies

### Prerequisites (Must be completed first)
- **REQ-008**: Multi-Tenant Database Structure Implementation (Phase 1) must be completed
- Account and account_users tables must exist and be populated
- Properties must be linked to accounts

### External Dependencies
- Supabase client libraries for account-based queries
- Next.js middleware for account-based route protection
- React context for account state management

## Risk Assessment

### High Risk Components
- **Admin API modifications**: Changes to core admin functionality could break existing features
- **Authentication system changes**: Security-related modifications require careful testing
- **Database query changes**: Account-based filtering must maintain performance

### Medium Risk Components  
- **Admin interface updates**: UI changes affecting admin workflow
- **Session management**: Account context integration into existing sessions

### Low Risk Components
- **New component creation**: AccountSelector and related UI components
- **Type definition updates**: Adding account types to existing type system

## Validation and Testing Requirements

### API Testing
- Account-based filtering validation for all admin endpoints
- Permission validation for cross-account access attempts  
- Performance testing for account-based queries

### UI Testing
- Account switching functionality
- Account context preservation across navigation
- Property and item management within account boundaries

### Security Testing
- Account isolation verification
- Permission boundary testing
- Session account context validation

## Success Criteria

1. **Account Context Integration**: All admin APIs operate within account context
2. **Account Switching**: Users can seamlessly switch between accounts they belong to
3. **Security Isolation**: Users cannot access resources outside their account memberships
4. **Performance Maintenance**: Account-based filtering doesn't degrade system performance
5. **Backward Compatibility**: Existing admin functionality remains unchanged for current users
6. **Public Access Preservation**: Item public URLs continue working without any changes

---

*This document serves as the implementation guide for REQ-009 and should be updated as implementation progresses.* 