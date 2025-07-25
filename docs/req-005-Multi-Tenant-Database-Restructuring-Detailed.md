# REQ-005: Multi-Tenant Database Restructuring with Property Management - Detailed Implementation

**Reference**: REQ-005 from `docs/gen_requests.md`  
**Overview Document**: `docs/req-005-Multi-Tenant-Database-Restructuring-Overview.md`  
**Date**: January 28, 2025  
**Document Created**: July 25, 2025 at 03:20 CEST  
**Type**: Major Feature Implementation (Architecture Change)  
**Complexity**: 13-21 Points (High Complexity)

## Prerequisites

**CRITICAL INSTRUCTIONS FOR AI AGENT:**
- Operate from the project root folder (`/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus`) at all times
- DO NOT attempt to navigate to other folders
- Use Supabase MCP tools to understand and modify the database
- Only modify files listed in the "Authorized Files and Functions for Modification" section from the overview document
- Run tests for each major component after implementation
- If changes to files outside the authorized list are needed, STOP and ask user permission

## Current Database State Analysis

**Existing Tables:**
- `items` (core items table - needs property_id)
- `item_links` (links associated with items)
- `admin_users` (admin users linked to Supabase auth)
- `mailing_list_subscribers` (mailing list)
- `item_visits` (analytics - implemented in REQ-004)
- `item_reactions` (analytics - implemented in REQ-004)

**Missing for Multi-Tenant:**
- `users` table (regular users)
- `properties` table (user properties)
- `property_types` table (property categories)
- Property-based RLS policies
- Property filtering in APIs and UI

---

## Phase 1: Database Schema Restructuring (8 tasks, 1 point each)

### 1. Create Property Types Table -unit tested-
- [x] Use supabaseMCP to examine current schema structure
- [x] Create migration using `mcp_supabase_apply_migration` with name `create_property_types_table`
- [x] Create table with columns: `id` (UUID, primary key), `name` (VARCHAR(50), unique), `display_name` (VARCHAR(100)), `description` (TEXT), `created_at` (TIMESTAMPTZ)
- [x] Add constraint to validate property type names
- [x] Insert standard property types: house, apartment, villa, condo, townhouse, studio, commercial
- [x] Create index on `name` column for performance
- [x] Test table creation by running `mcp_supabase_execute_sql` to select from property_types

### 2. Create Users Table for Regular Users -unit tested-
- [x] Create migration using `mcp_supabase_apply_migration` with name `create_users_table`
- [x] Create table with columns: `id` (UUID, primary key, references auth.users), `email` (TEXT, not null), `full_name` (TEXT), `role` (TEXT, default 'user'), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
- [x] Add unique constraint on email column
- [x] Add check constraint to validate role values ('user', 'admin')
- [x] Create index on email for performance
- [x] Add trigger to update `updated_at` column automatically
- [x] Test table creation and constraints

### 3. Create Properties Table -unit tested-
- [x] Create migration using `mcp_supabase_apply_migration` with name `create_properties_table`
- [x] Create table with columns: `id` (UUID, primary key), `user_id` (UUID, references users.id), `property_type_id` (UUID, references property_types.id), `nickname` (VARCHAR(100), not null), `address` (TEXT), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
- [x] Add foreign key constraints with CASCADE delete for user_id
- [x] Add foreign key constraint for property_type_id
- [x] Create indexes on user_id and property_type_id for performance
- [x] Add trigger to update `updated_at` column automatically
- [x] Test table creation and foreign key relationships

### 4. Modify Items Table to Add Property Association -unit tested-
- [x] Create migration using `mcp_supabase_apply_migration` with name `add_property_to_items`
- [x] Add `property_id` column (UUID, nullable initially for migration)
- [x] Add foreign key constraint to reference properties.id with CASCADE delete
- [x] Create index on property_id for performance
- [x] Add comment to document the property relationship
- [x] Test column addition without breaking existing data
- [x] Verify foreign key constraint works properly

### 5. Create Default Properties for Existing Items -unit tested-
- [x] Create migration using `mcp_supabase_apply_migration` with name `create_default_properties_for_existing_items`
- [x] Insert a default property type if none exists (use 'house' as default)
- [x] Create a system user account for legacy items (email: system@faqbnb.local)
- [x] Create a default property owned by system user (nickname: "Legacy Items")
- [x] Update all existing items to reference the default property
- [x] Verify all items now have property_id assigned
- [x] Test that items can still be accessed publicly

### 6. Update Items Table Property Constraint -unit tested-
- [x] Create migration using `mcp_supabase_apply_migration` with name `make_property_id_required`
- [x] Alter items table to make property_id NOT NULL (after migration is complete)
- [x] Add comment documenting that all items must belong to a property
- [x] Test constraint by attempting to insert item without property_id (should fail)
- [x] Verify existing items still function correctly
- [x] Test foreign key cascade behavior

### 7. Create Multi-Tenant RLS Policies for New Tables -unit tested-
- [x] Create migration using `mcp_supabase_apply_migration` with name `setup_multitenant_rls_policies`
- [x] Enable RLS on users, properties, and property_types tables
- [x] Create policy for users to read/update their own record
- [x] Create policy for properties where users can manage their own properties
- [x] Create policy for admin users to access all properties and users
- [x] Create public read policy for property_types
- [x] Test policies by simulating user and admin access
- [x] Verify policy isolation between different users

### 8. Update Existing RLS Policies for Items and Links -unit tested-
- [x] Create migration using `mcp_supabase_apply_migration` with name `update_items_rls_for_properties`
- [x] Drop existing admin-only policies for items and item_links
- [x] Create new policy allowing users to manage items in their own properties
- [x] Create new policy allowing admins to manage all items
- [x] Maintain public read access for items and item_links (for QR codes)
- [x] Create policy for analytics tables based on property ownership
- [x] Test that users can only access their property items
- [x] Test that admins can access all items

---

## Phase 2: Authentication & Authorization System (5 tasks, 1 point each)

### 9. Update Supabase Type Definitions -unit tested-
- [x] Open `src/lib/supabase.ts` file
- [x] Add new table types to Database interface: `users`, `properties`, `property_types`
- [x] Update existing table types with new relationships (items.property_id)
- [x] Add proper foreign key relationship definitions
- [x] Update any exported types that reference the database schema
- [x] Test TypeScript compilation after changes
- [x] Verify IntelliSense works correctly for new types

### 10. Extend Authentication Library -unit tested-
- [x] Open `src/lib/auth.ts` file
- [x] Add function `canAccessProperty(userId: string, propertyId: string): Promise<boolean>`
- [x] Add function `getUserProperties(userId: string): Promise<Property[]>`
- [x] Add function `createUser(authUser: User): Promise<void>` for user registration
- [x] Update `getUser()` function to handle both regular users and admins
- [x] Add function `isPropertyOwner(userId: string, propertyId: string): Promise<boolean>`
- [x] Update type definitions for new user and property types
- [x] Test all new authentication functions

### 11. Update Authentication Context
- [ ] Open `src/contexts/AuthContext.tsx` file
- [ ] Add `userProperties` state to track user's properties
- [ ] Add `selectedProperty` state for current property context
- [ ] Update `AuthContextType` interface with new properties
- [ ] Add functions: `getUserProperties()`, `setSelectedProperty()`
- [ ] Update session initialization to load user properties
- [ ] Add user registration workflow functions
- [ ] Test context updates and property loading

### 12. Update Middleware for Property-Based Access
- [ ] Open `src/middleware.ts` file
- [ ] Add property-based route protection for `/admin/properties/*`
- [ ] Update existing admin checks to handle both admin and regular users
- [ ] Add property ownership validation for property-specific routes
- [ ] Update session validation to include property context
- [ ] Add redirects for unauthorized property access
- [ ] Remove temporary auth bypass for analytics endpoints
- [ ] Test middleware with both user types and property access

### 13. Create User Registration API Endpoint
- [ ] Create new file `src/app/api/auth/register/route.ts`
- [ ] Implement POST endpoint for user registration
- [ ] Add email validation and password requirements
- [ ] Create user record in both auth.users and public.users tables
- [ ] Add error handling for duplicate emails
- [ ] Add rate limiting and validation
- [ ] Return appropriate success/error responses
- [ ] Test registration endpoint with valid and invalid data

---

## Phase 3: Property Management System (5 tasks, 1 point each)

### 14. Create Property Management API Endpoints
- [ ] Create new directory `src/app/api/admin/properties/`
- [ ] Create `route.ts` with GET (list properties) and POST (create property) methods
- [ ] Add property filtering based on user role (own properties vs all properties)
- [ ] Create `[propertyId]/route.ts` with GET, PUT, DELETE for individual properties
- [ ] Add proper authorization checks for property access
- [ ] Add validation for property data (nickname, address, type)
- [ ] Add error handling and appropriate HTTP status codes
- [ ] Test all property CRUD operations

### 15. Create Property Type Definitions
- [ ] Open `src/types/index.ts` file
- [ ] Add `PropertyType` interface with id, name, displayName, description fields
- [ ] Add `Property` interface with id, userId, propertyTypeId, nickname, address, timestamps
- [ ] Add `User` interface for regular users (distinct from AuthUser)
- [ ] Update `Item` interface to include propertyId field
- [ ] Add property-related API response types
- [ ] Add property form validation types
- [ ] Test TypeScript compilation with new types

### 16. Create Property Form Component
- [ ] Create new file `src/components/PropertyForm.tsx`
- [ ] Implement form with fields: nickname (required), address, property type dropdown
- [ ] Add form validation using React Hook Form or similar
- [ ] Add property type selection from database
- [ ] Implement save/cancel functionality
- [ ] Add loading states and error handling
- [ ] Style form consistently with existing UI
- [ ] Test form creation and editing functionality

### 17. Create Property Management Pages
- [ ] Create new directory `src/app/admin/properties/`
- [ ] Create `page.tsx` for property listing with user role-based filtering
- [ ] Create `new/page.tsx` for creating new properties
- [ ] Create `[propertyId]/edit/page.tsx` for editing properties
- [ ] Add property deletion with confirmation modal
- [ ] Implement pagination for property listing
- [ ] Add search and filtering capabilities
- [ ] Test property management workflow

### 18. Update Item Form to Include Property Selection
- [ ] Open `src/components/ItemForm.tsx` file
- [ ] Add property selection dropdown for item creation/editing
- [ ] Filter properties based on user role (own properties vs all properties)
- [ ] Make property selection required for new items
- [ ] Update form validation to include property validation
- [ ] Add property context when editing existing items
- [ ] Update save functionality to include property assignment
- [ ] Test item creation with property assignment

---

## Phase 4: Admin Interface Updates (3 tasks, 1 point each)

### 19. Update Admin Layout for Property Management
- [ ] Open `src/app/admin/layout.tsx` file
- [ ] Add property context provider to layout
- [ ] Add navigation links for property management (for both user types)
- [ ] Update navigation to show different options based on user role
- [ ] Add property selector for admins to filter views
- [ ] Add user role indicator in header
- [ ] Update layout styling for new navigation items
- [ ] Test layout updates with both user types

### 20. Update Admin Items Page for Property Filtering
- [ ] Open `src/app/admin/page.tsx` file
- [ ] Add property filtering dropdown for admins
- [ ] Filter items based on selected property and user role
- [ ] Update item creation button to respect property context
- [ ] Add property information in item list display
- [ ] Update search functionality to include property filtering
- [ ] Add property-based pagination
- [ ] Test items page with property filtering

### 21. Update Item Management Pages
- [ ] Open `src/app/admin/items/new/page.tsx` file
- [ ] Update to require property selection for new items
- [ ] Open `src/app/admin/items/[publicId]/edit/page.tsx` file
- [ ] Add property modification with proper authorization
- [ ] Add property context to both pages
- [ ] Update page navigation and breadcrumbs
- [ ] Add property validation and error handling
- [ ] Test item creation and editing with properties

---

## Phase 5: Analytics Property Filtering (2 tasks, 1 point each)

### 22. Update Analytics API for Property Filtering
- [ ] Open `src/app/api/admin/analytics/route.ts` file
- [ ] Add property filtering query parameters
- [ ] Filter analytics data based on user role and property access
- [ ] Update visit analytics to include property-based filtering
- [ ] Open `src/app/api/admin/analytics/reactions/route.ts` file
- [ ] Add property filtering to reaction analytics
- [ ] Update response format to include property context
- [ ] Test analytics with property filtering

### 23. Update Analytics Components for Property Selection
- [ ] Open `src/components/AnalyticsOverviewCards.tsx` file
- [ ] Add property selector integration
- [ ] Filter analytics display based on selected property
- [ ] Open `src/components/TimeRangeSelector.tsx` file
- [ ] Add property selector alongside time range selector
- [ ] Open `src/app/admin/analytics/page.tsx` file
- [ ] Update analytics page to use property filtering
- [ ] Test analytics filtering by property

---

## Phase 6: Testing & Validation (5 tasks, 1 point each)

### 24. Database Testing and Validation
- [ ] Use `mcp_supabase_execute_sql` to verify all new tables exist with correct structure
- [ ] Test foreign key constraints by attempting invalid operations
- [ ] Verify RLS policies by simulating different user access scenarios
- [ ] Test data migration by checking that all items have property assignments
- [ ] Validate indexes are created and improving query performance
- [ ] Run advisory checks using `mcp_supabase_get_advisors` for security and performance
- [ ] Document any schema issues found and resolved

### 25. Authentication and Authorization Testing
- [ ] Test user registration flow end-to-end
- [ ] Test login with both regular users and admin users
- [ ] Verify property access restrictions for regular users
- [ ] Test admin access to all properties and users
- [ ] Test middleware protection for property-specific routes
- [ ] Verify session management with property context
- [ ] Test authorization functions with edge cases

### 26. Property Management Testing
- [ ] Test property CRUD operations for both user types
- [ ] Verify property form validation and error handling
- [ ] Test property deletion and cascading effects on items
- [ ] Test property type selection and validation
- [ ] Verify property listing and filtering functionality
- [ ] Test property-based item assignment and restrictions
- [ ] Test property management UI responsiveness

### 27. Analytics and Reporting Testing
- [ ] Test analytics filtering by property for both user types
- [ ] Verify analytics data accuracy with property filtering
- [ ] Test analytics components with property selection
- [ ] Validate that regular users only see their property analytics
- [ ] Test that admins can see system-wide and property-specific analytics
- [ ] Test analytics export functionality with property filtering
- [ ] Verify analytics performance with property-based queries

### 28. Backward Compatibility and Integration Testing
- [ ] Test that existing QR code links continue to work without authentication
- [ ] Verify public item access is not affected by property-based RLS
- [ ] Test that existing items are properly associated with default property
- [ ] Verify that all existing functionality works with new property structure
- [ ] Test system performance with property-based filtering at scale
- [ ] Test cross-browser compatibility for new property management features
- [ ] Run full regression test suite to ensure no existing functionality is broken

---

## Success Criteria Checklist

- [ ] Database schema successfully updated with multi-tenant structure
- [ ] All existing data migrated to new property-based structure
- [ ] User registration and authentication working for both user types
- [ ] Property management CRUD operations functional for both user types
- [ ] Regular users can only access their own properties and items
- [ ] Admin users can access all properties and items
- [ ] Analytics properly filtered by property based on user role
- [ ] Public QR code access continues to work without authentication
- [ ] All authorized files modified according to specification
- [ ] No unauthorized file modifications made
- [ ] All tests passing with new multi-tenant structure
- [ ] Performance acceptable with property-based filtering
- [ ] Security policies properly isolate user data by property ownership

---

## Rollback Instructions

If any issues arise during implementation:

1. **Database Rollback**: Use Supabase migration rollback features
2. **Code Rollback**: Use git to revert to pre-implementation state
3. **Feature Flags**: Disable property features if needed
4. **Data Recovery**: Restore from backup if data corruption occurs

---

**NEXT STEP**: Begin with Task 1 (Create Property Types Table) and proceed sequentially through each phase.

**REMINDER**: Use supabaseMCP tools for all database operations and maintain focus on project root directory throughout implementation. 