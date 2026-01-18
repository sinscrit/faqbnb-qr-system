# REQ-024: AuthContext Account Role Integration and Current Account State Management - Detailed Implementation

**Request Reference**: REQ-024 from `docs/gen_requests.md`  
**Overview Reference**: `docs/req-024-AuthContext-Account-Role-Integration-Overview.md`  
**Date**: September 3, 2025  
**Type**: BUG FIX REQUEST  
**Complexity**: 8/15 Points  

---

## Implementation Instructions

### Project Setup Requirements
- **Working Directory**: Operate from project root folder `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus`
- **Database Access**: Use Supabase MCP tools for all database queries and modifications
- **No Folder Navigation**: All commands must be issued from the project root
- **Testing**: Create test scripts in `./tmp` folder for validation
- **Build Verification**: Run `npm run build` after each major change

---

## Database State Verification

### Current Database Evidence
From Supabase query, user `raphajunk@outlook.com` has:
```
account_id: "cceeca1b-2f0b-4a23-89ba-8daf980b26a6"
user_id: "122ae2c2-1236-4347-95fa-1c6a0f89201e"  
role: "owner"
account_name: "Default Account"
```

### Database Schema Validation
Required tables and relationships:
- `account_users` table with `account_id`, `user_id`, `role` columns
- `accounts` table with account information
- `users` table with user authentication data
- Foreign key relationships properly established

---

## Task Breakdown

## 1. Database Integration Enhancement

### 1.1 Update getUser Function to Fetch Account Role -unit tested-
- [x] **File**: `src/lib/auth.ts`
- [x] **Function**: `getUser()`
- [x] **Action**: Enhance the existing `getUser()` function to fetch account role data from `account_users` table
- [x] **Details**:
  - Add LEFT JOIN query to fetch account_users data when loading user
  - Include account role in the returned AuthUser object
  - Update currentAccount field to include user's role in that account
  - Ensure backward compatibility with existing authentication flows
  - Handle cases where user has multiple accounts (fetch default/current account role)

### 1.2 Enhance getUserRoleInAccount Integration -unit tested-
- [x] **File**: `src/lib/auth.ts`
- [x] **Function**: `getUserRoleInAccount()`
- [x] **Action**: Ensure this existing function is properly integrated with AuthContext loading
- [x] **Details**:
  - Verify function returns correct role for test user
  - Update error handling to provide meaningful feedback
  - Add console logging for debugging account role queries
  - Test with different account roles (owner, admin, member, viewer)

### 1.3 Create Account Role Query Helper -unit tested-
- [x] **File**: `src/lib/auth.ts`
- [x] **Function**: Create `getAccountWithUserRole(accountId: string, userId: string)`
- [x] **Action**: Create dedicated function to fetch account data with user's role
- [x] **Details**:
  - Query accounts table with LEFT JOIN to account_users
  - Return Account object enhanced with user's role in that account
  - Handle cases where user is not a member of the account
  - Use Supabase client for consistent access patterns

## 2. AuthContext State Management Enhancement

### 2.1 Update AuthContext Interface -unit tested-
- [x] **File**: `src/contexts/AuthContext.tsx`
- [x] **Section**: Interface definitions and state
- [x] **Action**: Update Account type and AuthContext state to include user role information
- [x] **Details**:
  - Add `userRole` field to currentAccount state object
  - Update TypeScript interfaces for enhanced account data
  - Ensure state setters properly handle role information
  - Maintain backward compatibility with existing Account type

### 2.2 Fix getAccountRole Function -unit tested-
- [x] **File**: `src/contexts/AuthContext.tsx`
- [x] **Function**: `getAccountRole()`
- [x] **Action**: Replace the null-returning placeholder with actual role lookup
- [x] **Details**:
  - Return the role from currentAccount.userRole if available
  - Add fallback to query account_users table if role not in state
  - Return proper AccountRole type ("owner" | "admin" | "member" | "viewer")
  - Add error handling for missing or invalid account relationships

### 2.3 Enhance Account Loading in Authentication Flow -unit tested-
- [x] **File**: `src/contexts/AuthContext.tsx`
- [x] **Functions**: `initializeAuth()`, `sessionInitialization()`, `refreshUserData()`
- [x] **Action**: Update all account loading functions to include role data
- [x] **Details**:
  - Modify account loading to use enhanced getUser() function
  - Update setCurrentAccount calls to include role information
  - Ensure account switching preserves and updates role data
  - Add console logging for debugging account role loading

### 2.4 Update Permission Loading Integration -unit tested-
- [x] **File**: `src/contexts/AuthContext.tsx`
- [x] **Function**: `loadDashboardPermissions()`
- [x] **Action**: Ensure permission loading receives proper account role context
- [x] **Details**:
  - Pass currentAccount with role information to getDashboardPermissions
  - Update permission loading to use getAccountRole() for role context
  - Add validation that account role is properly passed to permission system
  - Update console logging to show account role in permission debug info

## 3. Permission System Integration

### 3.1 Validate Permission Loading with Account Role -unit tested-
- [x] **File**: `src/lib/permissions.ts`
- [x] **Function**: `getDashboardPermissions()`
- [x] **Action**: Verify function properly receives and uses account role information
- [x] **Details**:
  - Add console logging to show received account and role data
  - Validate that account role is used in permission calculations
  - Ensure owner role grants proper property management permissions
  - Test permission calculation with different account roles

### 3.2 Update usePermissions Hook Integration -unit tested-
- [x] **File**: `src/hooks/usePermissions.ts`
- [x] **Action**: Ensure hook properly receives account role context from AuthContext
- [x] **Details**:
  - Verify accountUser parameter includes role information
  - Add error handling for missing account role data
  - Update permission calculation validation
  - Add console debugging for permission hook context

## 4. Dashboard Integration Updates

### 4.1 Remove Temporary Properties Page Fix -unit tested-
- [x] **File**: `src/app/dashboard/properties/page.tsx`
- [x] **Action**: Remove the temporary accountUser hardcoding and use proper AuthContext
- [x] **Details**:
  - Remove the manual accountUser object creation
  - Update usePermissions call to rely on AuthContext account role
  - Remove temporary comments about "TODO: This should come from AuthContext"
  - Test that permissions work properly with AuthContext integration

### 4.2 Update Dashboard Items Page -unit tested-
- [x] **File**: `src/app/dashboard/items/page.tsx`
- [x] **Action**: Ensure proper account role integration for items management
- [x] **Details**:
  - Verify usePermissions receives proper account context
  - Test item creation/editing permissions for account owners
  - Validate permission-based UI rendering
  - Remove any temporary permission workarounds

### 4.3 Update Dashboard Analytics Page -unit tested-
- [x] **File**: `src/app/dashboard/analytics/page.tsx`
- [x] **Action**: Ensure analytics permissions work with proper account role
- [x] **Details**:
  - Verify analytics features respect account role permissions
  - Test analytics access for different account roles
  - Validate permission-based analytics feature availability

## 5. Testing and Validation

### 5.1 Create AuthContext Account Role Test
- [ ] **File**: `tmp/test_auth_context_account_role.js`
- [ ] **Action**: Create comprehensive test for AuthContext account role functionality
- [ ] **Details**:
  - Test getAccountRole() returns proper role for test user
  - Verify currentAccount contains role information
  - Test account loading includes role data from database
  - Validate permission system receives proper account context
  - Test account switching preserves role information

### 5.2 Create Permission Integration Test
- [ ] **File**: `tmp/test_permission_account_integration.js`
- [ ] **Action**: Test permission system with proper account role integration
- [ ] **Details**:
  - Verify usePermissions hook receives account role context
  - Test permission calculations for account owners
  - Validate property management permissions
  - Test UI permission-based rendering

### 5.3 Create Database Account Role Query Test
- [ ] **File**: `tmp/test_database_account_role.js`
- [ ] **Action**: Test database queries for account role fetching
- [ ] **Details**:
  - Test getUserRoleInAccount() function
  - Verify account_users table queries
  - Test account role fetching for different scenarios
  - Validate database relationship integrity

### 5.4 Browser Testing with BrowserMCP
- [ ] **Action**: Use BrowserMCP to test complete authentication and permission flow
- [ ] **Details**:
  - Navigate to dashboard/properties page
  - Verify user can create properties (Add Property button visible)
  - Test permission warnings are no longer displayed for account owners
  - Validate console logs show proper account role in permission debug info
  - Take screenshots for visual validation of fixed permissions

## 6. Build and Deployment

### 6.1 Build Verification
- [ ] **Action**: Run `npm run build` to ensure no TypeScript or build errors
- [ ] **Details**:
  - Fix any TypeScript errors related to account role changes
  - Ensure all imports and type definitions are correct
  - Validate build completes successfully
  - Check for any new linting errors

### 6.2 Server Restart and Testing
- [ ] **Action**: Use `bash restart_all_servers.sh --rebuild` to restart with clean build
- [ ] **Details**:
  - Ensure servers restart successfully
  - Verify Supabase MCP connection is maintained
  - Test authentication flow works properly
  - Validate dashboard functionality with new account role integration

## 7. Documentation Updates

### 7.1 Update Technical Guide
- [ ] **File**: `docs/gen_techguide.md`
- [ ] **Action**: Document AuthContext account role integration changes
- [ ] **Details**:
  - Add section on account role state management
  - Document getAccountRole() function implementation
  - Include permission system integration notes
  - Add troubleshooting guide for account role issues

### 7.2 Update Component Guide
- [ ] **File**: `docs/component_guide.md`
- [ ] **Action**: Document AuthContext changes affecting dashboard components
- [ ] **Details**:
  - Update AuthContext section with account role information
  - Document permission integration changes
  - Add examples of proper account role usage
  - Include timestamp: September 3, 2025, 20:35 CEST

## 8. Final Validation

### 8.1 End-to-End Permission Test
- [ ] **Action**: Complete test of authentication and permission flow for `raphajunk@outlook.com`
- [ ] **Details**:
  - Login with test user credentials
  - Navigate to dashboard/properties page
  - Verify "Add Property" button is visible
  - Test property creation functionality
  - Confirm no "Limited Permissions" warnings
  - Validate console shows proper account role context

### 8.2 Account Role Persistence Test
- [ ] **Action**: Test account role persistence across browser refresh and session restoration
- [ ] **Details**:
  - Login and verify account role is loaded
  - Refresh browser page and verify role persists
  - Test session restoration includes account role
  - Validate localStorage account persistence includes role

### 8.3 Multiple Account Role Test (if applicable)
- [ ] **Action**: Test account role handling for users with multiple accounts
- [ ] **Details**:
  - Test account switching preserves role information
  - Verify role updates when switching between accounts
  - Test permission changes with different account roles
  - Validate UI updates properly with role changes

---

## Success Criteria Validation

### Technical Validation
- [ ] Console logs show: `accountId: "cceeca1b-2f0b-4a23-89ba-8daf980b26a6", accountRole: "owner"`
- [ ] getAccountRole() function returns "owner" for test user
- [ ] usePermissions hook receives proper account context
- [ ] Permission system grants 13+ permissions for account owners
- [ ] Dashboard properties page shows "Add Property" button
- [ ] No "Limited Permissions" warnings for account owners

### User Experience Validation
- [ ] Test user can create, edit, and delete properties
- [ ] All dashboard features are accessible to account owners
- [ ] UI renders properly based on account role permissions
- [ ] Account switching works with proper role updates
- [ ] Session restoration maintains account role information

### Performance Validation
- [ ] Authentication time remains acceptable with account role fetching
- [ ] Permission calculations complete quickly
- [ ] Database queries for account role are optimized
- [ ] UI updates smoothly with permission changes

---

## Authorized Files for Modification

The following files are authorized for modification as part of this implementation:

### Core Authentication Files
- `src/contexts/AuthContext.tsx` - All account role state management functions
- `src/lib/auth.ts` - getUser(), getUserRoleInAccount(), account loading functions
- `src/hooks/usePermissions.ts` - Permission hook integration with account role

### Dashboard Integration Files  
- `src/app/dashboard/properties/page.tsx` - Remove temporary fixes, use proper AuthContext
- `src/app/dashboard/items/page.tsx` - Account role permission integration
- `src/app/dashboard/analytics/page.tsx` - Analytics permission integration

### Permission System Files
- `src/lib/permissions.ts` - getDashboardPermissions() validation and integration

### Type Definition Files
- `src/types/index.ts` - Account interface updates if needed for role integration

### Testing Files
- `tmp/test_auth_context_account_role.js` - AuthContext account role testing
- `tmp/test_permission_account_integration.js` - Permission system testing
- `tmp/test_database_account_role.js` - Database query testing

### Documentation Files
- `docs/gen_techguide.md` - Technical documentation updates
- `docs/component_guide.md` - Component documentation updates

---

**Important Notes:**
- Use Supabase MCP tools for all database operations
- Operate from project root directory only
- Create test scripts in ./tmp folder
- Run builds and restart servers for validation
- Take screenshots with BrowserMCP for visual confirmation
- Add timestamps using system date (September 3, 2025, 20:35 CEST)

**Next Steps**: Begin implementation with Task 1.1 - Database Integration Enhancement
