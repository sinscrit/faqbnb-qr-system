# REQ-009: Account-Based Property Management System (Phase 2) - Detailed Implementation

**Reference Documents**: 
- **Requirement**: REQ-009 from `docs/gen_requests.md`
- **Overview**: `docs/req-009-Account-Based-Property-Management-System-Overview.md`

**Date**: July 27, 2025 02:09:50 CEST  
**Type**: Major Feature Implementation (Architecture - Phase 2)  
**Complexity**: 15 Points (High Complexity)  
**Priority**: High Priority - Core admin functionality transformation

## Prerequisites Verification ✅

**Database Status Confirmed**: Phase 1 (REQ-008) is COMPLETE
- ✅ `accounts` table exists with 1 default account 
- ✅ `account_users` table exists with proper role structure
- ✅ `properties` table has `account_id` foreign key (1 property linked)
- ✅ All multi-tenant foundation tables are in place
- ✅ Ready for Phase 2 implementation

## Implementation Instructions for AI Agent

**CRITICAL**: 
- Operate from project root folder `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus`
- DO NOT navigate to other folders
- Use Supabase MCP tools for all database operations
- Only modify files listed in "Authorized Files and Functions for Modification"
- Test each implementation thoroughly before proceeding

---

## Phase 2A: Admin API Account Integration (8 Points)

### 1. Implement Account Context in Admin Property API Routes (2 Points)

**Files**: `src/app/api/admin/properties/route.ts`

- [x] Review current `GET()` function and understand existing user-based filtering logic -unit tested-
- [x] Add account context extraction from session/headers in admin property API -unit tested-
- [x] Modify `GET()` function to filter properties by account_id instead of just user_id -unit tested-
- [x] Update property queries to include account-based filtering for admin users -unit tested-
- [x] Ensure regular users still see only their own properties within their account context -unit tested-
- [x] Add account validation to ensure users can only access accounts they belong to -unit tested-
- [x] Update `POST()` function to create properties within current account context -unit tested-
- [x] Test property listing with account filtering using Supabase MCP -unit tested-
- [x] Test property creation with account context using API calls -unit tested-
- [x] Verify backward compatibility for existing single-account scenarios -unit tested-

### 2. Implement Account Context in Admin Property Detail API (1 Point)

**Files**: `src/app/api/admin/properties/[propertyId]/route.ts`

- [x] Review current property detail API functions (`GET()`, `PUT()`, `DELETE()`) -unit tested-
- [x] Add account validation to ensure property belongs to current account context -unit tested-
- [x] Modify property access checks to include account membership validation -unit tested-
- [x] Update error responses to handle cross-account access attempts -unit tested-
- [x] Test property editing within account boundaries using Supabase MCP -unit tested-
- [x] Test property deletion with account validation -unit tested-
- [x] Verify proper error handling for unauthorized account access -unit tested-

### 3. Implement Account Context in Admin Items API Routes (2 Points)

**Files**: `src/app/api/admin/items/route.ts`

- [x] Review current `GET()` function and understand property-based item filtering -unit tested-
- [x] Modify `validateAdminAuth()` function to include account context extraction -unit tested-
- [x] Update item queries to filter by account through property relationships -unit tested-
- [x] Add account-based filtering logic: `properties.account_id = current_account_id` -unit tested-
- [x] Modify `POST()` function to validate property belongs to current account -unit tested-
- [x] Update item creation to ensure properties are within account boundaries -unit tested-
- [x] Test item listing with account-based filtering using Supabase MCP -unit tested-
- [x] Test item creation across different account contexts -unit tested-
- [x] Verify account isolation - users cannot see items from other accounts -unit tested-

### 4. Implement Account Context in Admin Item Detail API (1 Point)

**Files**: `src/app/api/admin/items/[publicId]/route.ts`

- [x] Review current item detail functions (`GET()`, `PUT()`, `DELETE()`) -unit tested-
- [x] Add account boundary validation through property relationships -unit tested-
- [x] Ensure item operations respect account context via property ownership -unit tested-
- [x] Update item access checks to validate account membership -unit tested-
- [x] Test item editing within account boundaries -unit tested-
- [x] Test item deletion with account validation -unit tested-
- [x] Verify cross-account item access is properly blocked -unit tested-

### 5. Implement Account Context in Analytics APIs (1 Point)

**Files**: `src/app/api/admin/analytics/route.ts`, `src/app/api/admin/analytics/reactions/route.ts`

- [x] Review current analytics aggregation logic -unit tested-
- [x] Modify analytics queries to filter by account through item-property relationships -unit tested-
- [x] Update visit analytics to respect account boundaries -unit tested-
- [x] Update reaction analytics to respect account boundaries -unit tested-
- [x] Add account-based data aggregation for admin analytics -unit tested-
- [x] Test analytics filtering with account context using Supabase MCP -unit tested-
- [x] Verify analytics data isolation between accounts -unit tested-

### 6. Create Basic Account Management API Endpoint (1 Point)

**Files**: `src/app/api/admin/accounts/route.ts` (NEW)

- [x] Create new file `src/app/api/admin/accounts/route.ts` -unit tested-
- [x] Implement `GET()` function to list accounts user belongs to -unit tested-
- [x] Add account membership validation through `account_users` table -unit tested-
- [x] Include account role information in response -unit tested-
- [x] Add proper error handling and authentication validation -unit tested-
- [x] Test account listing for users with multiple account memberships -unit tested-
- [x] Test response includes proper account details and user roles -unit tested-

---

## Phase 2B: Authentication & Session Updates (4 Points)

### 7. Enhance Authentication Library with Account Context (2 Points)

**Files**: `src/lib/auth.ts`

- [ ] Review current `getUser()` and `getSession()` functions
- [ ] Add new function `getUserAccounts()` to retrieve user's account memberships
- [ ] Add function `validateAccountAccess(userId, accountId)` for permission checking
- [ ] Add function `getCurrentAccountContext()` to extract account from session
- [ ] Update `validateAdminAuth()` to include account context validation
- [ ] Add account switching logic functions for session management
- [ ] Test account membership retrieval using Supabase MCP
- [ ] Test account access validation with different user/account combinations
- [ ] Verify account context extraction from session data

### 8. Update AuthContext with Account State Management (1 Point)

**Files**: `src/contexts/AuthContext.tsx`

- [ ] Review current AuthContext state and functions
- [ ] Add account-related state: `currentAccount`, `userAccounts`, `switchingAccount`
- [ ] Add function `setCurrentAccount(account)` for account switching
- [ ] Add function `loadUserAccounts()` to fetch user's accounts
- [ ] Add function `switchAccount(accountId)` for account context switching
- [ ] Update context provider to initialize account state on user login
- [ ] Add account validation when switching between accounts
- [ ] Test account state management in context
- [ ] Test account switching functionality

### 9. Update Session API with Account Context (1 Point)

**Files**: `src/app/api/auth/session/route.ts`

- [ ] Review current session validation logic
- [ ] Add account context to session data structure
- [ ] Include current account information in session responses
- [ ] Add account switching endpoint handling in session API
- [ ] Update session validation to include account context
- [ ] Add account membership validation in session endpoints
- [ ] Test session with account context data
- [ ] Test account switching through session API

---

## Phase 2C: Admin Interface Updates (3 Points)

### 10. Create Account Selector Component (1 Point)

**Files**: `src/components/AccountSelector.tsx` (NEW)

- [ ] Create new React component file `src/components/AccountSelector.tsx`
- [ ] Build dropdown/selector UI for account switching
- [ ] Implement account switching logic using AuthContext
- [ ] Add loading states for account switching operations
- [ ] Add visual indicators for current account selection
- [ ] Include account role badges (owner, admin, member, viewer)
- [ ] Add proper error handling for account switching failures
- [ ] Style component to match existing admin interface design
- [ ] Test component with multiple account scenarios
- [ ] Test account switching functionality in component

### 11. Integrate Account Selector in Admin Layout (1 Point)

**Files**: `src/app/admin/layout.tsx`

- [ ] Review current `AdminLayoutContent` function and layout structure
- [ ] Import and integrate `AccountSelector` component in header area
- [ ] Update layout to show current account context in navigation
- [ ] Add account context loading states in layout
- [ ] Update property selector logic to work within account context
- [ ] Modify layout to handle account switching state changes
- [ ] Add account context indicators throughout admin interface
- [ ] Test layout with account switching functionality
- [ ] Test layout responsiveness with account selector

### 12. Update Admin Dashboard with Account Context (1 Point)

**Files**: `src/app/admin/page.tsx`, `src/app/admin/properties/page.tsx`, `src/app/admin/items/page.tsx`

- [ ] Review current admin dashboard component logic
- [ ] Update item listings to use account-aware API calls
- [ ] Update property listings to use account-aware API calls  
- [ ] Add account context to data fetching logic
- [ ] Update property and item forms to respect account context
- [ ] Add account context indicators in item/property listings
- [ ] Update analytics components to use account-filtered data
- [ ] Test dashboard functionality with account context
- [ ] Test property and item management within account boundaries
- [ ] Verify account switching updates dashboard data properly

---

## Integration Testing & Validation (Required for each phase)

### 13. API Integration Testing (Continuous)

**Execute after each API modification**:

- [ ] Test all admin API endpoints with account context using Postman/curl
- [ ] Verify account-based filtering using Supabase MCP queries  
- [ ] Test cross-account access attempts return appropriate errors
- [ ] Test account switching preserves proper data isolation
- [ ] Validate API performance with account-based queries
- [ ] Test backward compatibility with existing single-account data

### 14. Authentication Flow Testing (After Phase 2B)

**Execute after authentication updates**:

- [ ] Test user login with account context loading
- [ ] Test account switching functionality end-to-end
- [ ] Test session management with account context
- [ ] Test authentication middleware with account validation
- [ ] Test account permissions and role-based access
- [ ] Test logout and session cleanup with account context

### 15. UI Integration Testing (After Phase 2C)

**Execute after interface updates**:

- [ ] Test admin interface with multiple account scenarios
- [ ] Test account selector component in different browsers
- [ ] Test account switching preserves proper UI state
- [ ] Test property and item management within account context
- [ ] Test analytics display with account filtering
- [ ] Test responsive design with account components

### 16. End-to-End System Testing (Final validation)

**Execute after complete implementation**:

- [ ] Test complete account-based workflow from login to item management
- [ ] Test multiple users with different account memberships
- [ ] Test account isolation - verify users cannot access other accounts
- [ ] Test public item access remains unchanged (critical requirement)
- [ ] Test system performance with account-based filtering
- [ ] Test data consistency and integrity with account context

---

## Success Criteria Validation

**Before marking REQ-009 as complete, verify**:

- [ ] All admin APIs operate within account context
- [ ] Users can seamlessly switch between accounts they belong to  
- [ ] Account isolation is properly enforced throughout the system
- [ ] Public item access continues to work without any changes
- [ ] System performance is maintained with account-based filtering
- [ ] Authentication flows properly handle account context
- [ ] Admin interface clearly shows current account context
- [ ] Property and item management respects account boundaries

---

## Notes for Implementation

**Database Operations**: Always use Supabase MCP tools:
- Use `mcp_supabase_execute_sql` for testing queries
- Use `mcp_supabase_list_tables` to verify table structures
- Use `mcp_supabase_apply_migration` if any schema changes are needed

**Testing Strategy**: Test each 1-point task immediately after completion before proceeding to the next task.

**Error Handling**: Implement proper error handling for account context failures and unauthorized access attempts.

**Performance**: Monitor query performance with account-based filtering and optimize indexes if needed.

---

*This detailed implementation guide serves as the step-by-step roadmap for completing REQ-009. Each checkbox represents a specific, actionable task that can be completed and verified independently.* 