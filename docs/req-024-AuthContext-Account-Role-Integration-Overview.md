# REQ-024: AuthContext Account Role Integration and Current Account State Management - Overview

**Request Reference**: REQ-024 from `docs/gen_requests.md`  
**Date**: September 3, 2025  
**Type**: BUG FIX REQUEST  
**Complexity**: 8/15 Points (Medium-High Complexity)  

---

## Goals and Objectives

### Primary Goal
Fix the critical AuthContext bug where user account roles are not properly loaded from the `account_users` table, causing permission system failures and preventing users from accessing features they should have access to.

### Secondary Goals
1. Ensure proper integration between AuthContext and the multi-tenant permission system
2. Implement robust account role fetching and state management
3. Provide seamless user experience with proper permission handling
4. Maintain backward compatibility with existing authentication flows

---

## Problem Statement

### Current Issue
The AuthContext is loading `currentAccount` state but failing to include the user's role within that account. This causes:

1. **Permission System Failure**: Users receive basic permissions (4) instead of account-owner permissions (13+)
2. **Feature Access Denial**: Users cannot create properties, manage items, or access account features
3. **UI Inconsistency**: Permission warnings display even for account owners
4. **Database Disconnect**: `account_users` table data is not being fetched and integrated

### Root Cause Analysis
- `getAccountRole()` function in AuthContext returns `null` due to missing account role data
- `getUserRoleInAccount()` function exists in auth.ts but is not being called by AuthContext
- Account state is populated without role information from `account_users` table
- Permission system defaults to basic user permissions when account role is undefined

---

## Technical Analysis

### Complexity Factors

#### Database Integration (2 points)
- Need to fetch data from `account_users` table during authentication
- Requires proper JOIN operations or additional queries
- Must handle multiple account scenarios
- Error handling for missing account relationships

#### State Management (2 points)
- Update AuthContext state structure to include account role
- Ensure proper state updates during account switching
- Handle account role persistence across sessions
- Coordinate with existing account management functions

#### Permission System Integration (2 points)
- Update permission loading to use proper account role
- Ensure `usePermissions` hook receives correct account context
- Validate permission calculations with new account role data
- Test permission-based UI rendering

#### Authentication Flow Enhancement (2 points)
- Modify existing authentication functions to fetch account roles
- Update session restoration to include account role data
- Handle OAuth flows with account role integration
- Ensure backward compatibility with existing auth patterns

### Implementation Scope

#### Core Components
1. **AuthContext Enhancement**: Update context to store and manage account role information
2. **Authentication Flow**: Modify getUser() and related functions to fetch account roles
3. **Permission Integration**: Update permission system to use proper account role data
4. **State Persistence**: Ensure account role data persists across sessions and page refreshes

#### Database Operations
- Query `account_users` table for user role in current account
- Handle multiple account scenarios where user has different roles
- Implement proper error handling for missing or invalid account relationships

---

## Breakdown of Work

### Phase 1: Database Integration (2-3 story points)
1. **Analyze Current Database Schema**
   - Review `account_users` table structure
   - Understand existing foreign key relationships
   - Validate data integrity for test cases

2. **Enhance Auth Functions**
   - Update `getUser()` to fetch account role from `account_users`
   - Modify account loading functions to include role data
   - Implement proper error handling for missing relationships

### Phase 2: AuthContext State Management (2-3 story points)
1. **Update Context Interface**
   - Add account role fields to context state
   - Update TypeScript interfaces for account data
   - Modify state setters to include role information

2. **Enhance Account Management**
   - Update `getAccountRole()` function to return actual role
   - Modify account switching to include role updates
   - Implement role persistence in localStorage if needed

### Phase 3: Permission System Integration (2-3 story points)
1. **Update Permission Loading**
   - Ensure `getDashboardPermissions()` receives proper account role
   - Update `usePermissions` hook calls throughout application
   - Validate permission calculations with account role data

2. **Test Permission Flows**
   - Test owner permissions for property creation/editing
   - Validate admin permissions for account management
   - Ensure member/viewer permissions work correctly

### Phase 4: Testing and Validation (1-2 story points)
1. **Unit Testing**
   - Test AuthContext with different account roles
   - Validate permission system with various user scenarios
   - Test account switching with role preservation

2. **Integration Testing**
   - End-to-end testing of authentication flow with account roles
   - Browser testing of permission-based UI rendering
   - Database query validation for account role fetching

---

## Success Criteria

### Technical Success
- [ ] AuthContext properly loads and stores user's account role from `account_users` table
- [ ] `getAccountRole()` function returns correct role ("owner", "admin", "member", "viewer")
- [ ] Permission system receives proper account context (accountId and accountRole defined)
- [ ] Users with "owner" role can create, edit, and delete properties and items
- [ ] Permission warnings no longer display for account owners
- [ ] Account switching preserves and updates role information correctly

### User Experience Success
- [ ] Users can access all features they have permissions for
- [ ] UI displays proper buttons and features based on account role
- [ ] Permission errors only show for actual permission violations
- [ ] Account switching works seamlessly with proper permission updates

### Performance Success
- [ ] Account role loading does not significantly impact authentication time
- [ ] Permission calculations remain fast and efficient
- [ ] Database queries are optimized for account role fetching

---

## Authorized Files and Functions for Modification

### Core Authentication Files
- **`src/contexts/AuthContext.tsx`**
  - `getAccountRole()` function - implement actual role fetching
  - State management for `currentAccount` with role data
  - Account loading functions to include role information
  - Permission loading integration with account role

- **`src/lib/auth.ts`**
  - `getUser()` function - enhance to fetch account role from `account_users`
  - `getUserRoleInAccount()` function - ensure proper integration with AuthContext
  - Account switching functions to include role updates
  - Session restoration with account role data

- **`src/hooks/usePermissions.ts`**
  - Permission hook integration with proper account role context
  - Error handling for missing account role data
  - Permission calculation validation

### Dashboard Integration Files
- **`src/app/dashboard/properties/page.tsx`**
  - Remove temporary account user hardcoding
  - Update to use proper AuthContext account role
  - Test permission-based UI rendering

- **`src/app/dashboard/items/page.tsx`**
  - Update permission checks to use AuthContext account role
  - Validate permission-based feature access

- **`src/app/dashboard/analytics/page.tsx`**
  - Update permission integration for analytics features

### Type Definition Files
- **`src/types/index.ts`**
  - Update Account interface to include user role information if needed
  - Enhance AuthUser interface for account role context

### Permission System Files
- **`src/lib/permissions.ts`**
  - Validate `getDashboardPermissions()` properly receives account role
  - Update permission calculation functions if needed

---

## Dependencies and Prerequisites

### Database Requirements
- `account_users` table must be accessible via Supabase client
- Proper RLS policies for account role queries
- Valid foreign key relationships between users, accounts, and account_users

### Authentication Requirements
- Existing authentication flow must remain functional
- Session management should continue to work properly
- OAuth flows should integrate with account role fetching

### Permission System Requirements
- Existing permission calculations should remain accurate
- Permission key definitions should remain stable
- UI permission checks should continue to work

---

## Risk Assessment

### Technical Risks
- **Medium Risk**: Breaking existing authentication flows during enhancement
- **Low Risk**: Database query performance impact for account role fetching
- **Medium Risk**: State management complexity with multiple account scenarios

### Mitigation Strategies
- Implement changes incrementally with thorough testing
- Use feature flags or gradual rollout for permission system changes
- Maintain backward compatibility during development
- Create comprehensive test cases for all account role scenarios

---

## Validation Strategy

### Manual Testing
1. Test authentication with account owners (`raphajunk@outlook.com`)
2. Verify permission warnings disappear for account owners
3. Test property creation/editing functionality
4. Validate account switching preserves role information

### Automated Testing
1. Unit tests for AuthContext account role loading
2. Integration tests for permission system with account roles
3. Database query tests for account role fetching
4. End-to-end tests for complete authentication and permission flows

### Browser Testing
1. Test with BrowserMCP for visual validation
2. Console log analysis for permission debug information
3. Network request validation for proper API calls
4. UI state validation for permission-based rendering

---

**Document Created**: September 3, 2025, 20:35 CEST  
**Next Step**: Create detailed implementation document `req-024-AuthContext-Account-Role-Integration-Detailed.md`


