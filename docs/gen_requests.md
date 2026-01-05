# FAQBNB Implementation Requests Log

## Document Purpose
This document tracks all implementation requests made for the FAQBNB system, providing a sequential record of feature requests, enhancements, and bug fixes with complexity analysis.

---

## REQ-001: Complete Admin CRUD Functionality Implementation  
**Status**: COMPLETED (July 21, 2025)  
**Reference**: `docs/req-001-Complete-Admin-CRUD-Functionality-Overview.md`  
**Type**: Core Feature  
**Summary**: Implemented complete administrative functionality for CRUD operations on items and links through the admin panel.

---

## REQ-002: QR Code URL Support for Items
**Date**: January 28, 2025  
**Reference**: `docs/req-002-QR-Code-URL-Support-Overview.md`  
**Type**: Feature Implementation  
**Complexity**: 3 Points  
**Summary**: Add QR code URL support functionality for items.

---

## REQ-003: Admin Authentication System & SaaS Landing Page  
**Date**: January 28, 2025  
**Reference**: `docs/req-003-Admin-Auth-SaaS-Landing-Overview.md`  
**Type**: Feature Implementation (Major)  
**Complexity**: 20 Points  
**Summary**: Implement admin authentication system and SaaS landing page.

---

## REQ-004: Analytics and Reaction System Implementation
**Date**: January 23, 2025  
**Type**: Feature Enhancement  
**Complexity**: 45-55 Points (High Complexity)

### Request Summary
Implement comprehensive analytics and user reaction tracking system with the following components:

1. **UI Improvement**: Shorten Public ID display to first 8 characters in admin item list
2. **Visit Analytics System**: Track and display visit counts with time-based breakdowns
3. **User Reaction System**: Allow visitors to react to items with various emotions

### Detailed Requirements

#### 1. Public ID Display Optimization
- Modify admin items list to show only first 8 characters of public ID
- Maintain full UUID functionality behind the scenes
- **Files Affected**: `src/app/admin/page.tsx`, admin item list components

#### 2. Visit Analytics Implementation
- Track every visit to item pages
- Provide analytics for:
  - Last 24 hours
  - Last 7 days  
  - Last 30 days
  - Last 365 days
  - All time total
- **Files Affected**: 
  - `database/schema.sql` (new `item_visits` table)
  - `src/app/api/visits/` (new API endpoints)
  - `src/app/item/[publicId]/page.tsx` (visit tracking)
  - `src/app/admin/page.tsx` (analytics display)

#### 3. User Reaction System
- Reaction types: Like 👍, Dislike 👎, Love ❤️, Confused 😕
- Track and display reaction counts per item
- **Files Affected**:
  - `database/schema.sql` (new `item_reactions` table)
  - `src/app/api/reactions/` (new API endpoints)
  - `src/app/item/[publicId]/page.tsx` (reaction UI)
  - `src/components/` (new reaction components)
  - `src/app/admin/page.tsx` (reaction analytics)

### Complexity Analysis

#### Database Layer (15 points)
- **New Tables**: `item_visits`, `item_reactions`
- **Indexing Requirements**: Time-based queries, item relationships
- **Migration Complexity**: Moderate - new tables with foreign keys

#### Backend API Development (20 points)  
- **Visit Tracking**: Real-time visit logging with IP/session management
- **Analytics Aggregation**: Efficient time-based query optimization
- **Reaction Management**: CRUD operations with conflict handling
- **Performance Considerations**: High-volume data handling

#### Frontend Implementation (15 points)
- **Admin Analytics Dashboard**: Charts, metrics, time range selectors
- **Public Reaction Interface**: Interactive reaction buttons
- **Real-time Updates**: Dynamic count updates
- **Responsive Design**: Mobile-friendly reaction interface

#### Integration & Testing (10 points)
- **Visit Tracking Integration**: Seamless page view recording
- **Admin Panel Integration**: Analytics display in existing interface
- **API Testing**: Comprehensive endpoint validation
- **Performance Testing**: High-load analytics queries

### Technical Challenges
1. **Scalability**: Efficient storage and querying of potentially high-volume visit data
2. **Real-time Performance**: Fast analytics aggregation without blocking page loads
3. **Data Integrity**: Preventing reaction spam and duplicate visit counting
4. **User Experience**: Intuitive reaction interface that encourages engagement

### Implementation Priority
**High Priority** - Enhances core functionality with valuable user engagement metrics and improved admin experience.

### Related Files Reference
- **Database**: `database/schema.sql`
- **Admin Interface**: `src/app/admin/page.tsx`
- **Item Display**: `src/app/item/[publicId]/page.tsx`
- **API Routes**: `src/app/api/` (new subdirectories)
- **Components**: `src/components/` (new reaction components)
- **Types**: `src/types/index.ts` (new type definitions)

---

*Next Request: REQ-005* 

## REQ-005: Multi-Tenant Database Restructuring with Property Management
**Date**: January 28, 2025  
**Type**: Major Feature Implementation (Architecture Change)  
**Complexity**: 13-21 Points (High Complexity)

### Request Summary
Restructure the database and application to support a multi-tenant architecture where users can manage multiple properties, with role-based access control for regular users and admins.

### Detailed Requirements

#### 1. User Management & Authentication
- Integrate Supabase authentication for user registration/login
- Implement two user types: regular users and admin users
- **Files Affected**: 
  - `src/lib/supabase.ts` (auth integration)
  - `src/contexts/AuthContext.tsx` (user context updates)
  - `src/app/api/auth/` (authentication endpoints)

#### 2. Property Management System
- Users can create multiple properties
- Each property has: nickname, address, and type (house, apartment, villa, etc.)
- Items belong to properties (not directly to users)
- **Files Affected**:
  - `database/schema.sql` (new tables: users, properties, property_types)
  - `src/app/admin/properties/` (new property management pages)
  - `src/components/PropertyForm.tsx` (new component)
  - `src/app/api/admin/properties/` (new API endpoints)

#### 3. Access Control Implementation
- **Regular Users**: Can only view/manage their own properties and associated items
- **Admin Users**: Can view/manage all properties and items across the system
- **Files Affected**:
  - `src/middleware.ts` (role-based route protection)
  - `src/components/AuthGuard.tsx` (permission checking)
  - `src/app/admin/layout.tsx` (admin interface updates)
  - `src/app/admin/page.tsx` (filtered item display)

#### 4. Analytics Property Filtering
- Analytics must be filterable by property
- Admins see analytics for all properties
- Regular users see analytics only for their properties
- **Files Affected**:
  - `src/app/admin/analytics/page.tsx` (property filtering)
  - `src/app/api/admin/analytics/` (filtered analytics endpoints)
  - `src/components/AnalyticsOverviewCards.tsx` (property-based filtering)
  - `src/components/TimeRangeSelector.tsx` (property selector addition)

#### 5. Backward Compatibility
- Non-logged users accessing items via QR codes remain unaffected
- Existing item URLs continue to work
- **Files Affected**:
  - `src/app/item/[publicId]/page.tsx` (maintain public access)
  - `src/app/api/items/[publicId]/route.ts` (public item access)

### Complexity Analysis

#### Database Schema Changes (5-8 points)
- **New Tables**: `users`, `properties`, `property_types`
- **Table Modifications**: Add foreign keys to existing `items` table
- **Data Migration**: Potentially complex migration of existing data
- **Indexing**: New indexes for property-based queries

#### Authentication & Authorization (3-5 points)
- **Supabase Integration**: Complete auth system implementation
- **Role-Based Access Control**: User permission system
- **Session Management**: Updated session handling for multi-tenant access
- **Middleware Updates**: Route protection based on user roles

#### Backend API Updates (3-5 points)
- **Property CRUD Operations**: Complete property management API
- **Modified Item Endpoints**: Property-based filtering
- **Analytics Endpoints**: Property-filtered analytics
- **Permission Checking**: API-level access control

#### Frontend Updates (2-3 points)
- **Property Management UI**: New property creation/editing interface
- **Updated Admin Interface**: Property filtering throughout admin panel
- **Authentication Flow**: Complete login/registration flow integration
- **Responsive Design**: Property management on all screen sizes

### Technical Challenges
1. **Data Migration**: Safely migrating existing items to new property structure
2. **Performance**: Efficient property-based filtering across large datasets
3. **Security**: Robust role-based access control implementation
4. **User Experience**: Seamless transition for existing users

### Implementation Priority
**High Priority** - Major architectural change that enables scalable multi-tenant functionality.

### Related Files Reference
- **Database**: `database/schema.sql`, `database/seed-data.sql`
- **Authentication**: `src/lib/supabase.ts`, `src/contexts/AuthContext.tsx`
- **Middleware**: `src/middleware.ts`
- **Admin Interface**: `src/app/admin/`, `src/components/AuthGuard.tsx`
- **API Routes**: `src/app/api/admin/`, `src/app/api/auth/`
- **Item Management**: `src/app/admin/items/`, `src/components/ItemForm.tsx`
- **Analytics**: `src/app/admin/analytics/`, `src/components/Analytics*.tsx`
- **Types**: `src/types/index.ts`, `src/types/analytics.ts`
- **Public Access**: `src/app/item/[publicId]/`, `src/app/api/items/`

---

*Next Request: REQ-006* 

## REQ-006: BUG FIX REQUEST - Quick Wins Admin Panel Issues Resolution
**Date**: January 28, 2025  
**Type**: Bug Fix Implementation  
**Complexity**: 7 Points (Low-Medium Complexity)

### Request Summary
Address immediate quick-win issues in the admin panel to improve basic functionality and user experience. These are low-complexity fixes that can be resolved quickly to build momentum before tackling more complex authentication problems.

### Detailed Requirements

#### 1. Port Configuration Standardization (1 point)
- **Issue**: Server running on port 3001 but application expects port 3000
- **Fix**: Kill conflicting processes and standardize on single port
- **Files Affected**: 
  - `package.json` (dev scripts)
  - `restart_all_servers.sh` (port management)
  - Development environment configuration

#### 2. Missing Admin Items Route (2 points)
- **Issue**: `/admin/items` returns 404 - no page.tsx exists
- **Fix**: Create proper routing structure or redirect to main dashboard
- **Files Affected**:
  - `src/app/admin/items/page.tsx` (create new file)
  - `src/app/admin/layout.tsx` (navigation updates)

#### 3. Environment Configuration Verification (3 points)
- **Issue**: Potential `.env.local` misalignment causing connection issues
- **Fix**: Verify and correct environment variables
- **Files Affected**:
  - `.env.local` (environment variables)
  - `src/lib/supabase.ts` (connection configuration)
  - Development documentation

#### 4. Multiple Server Instance Cleanup (1 point)
- **Issue**: Multiple Next.js processes causing port conflicts
- **Fix**: Clean process management and startup scripts
- **Files Affected**:
  - `restart_all_servers.sh` (process cleanup)
  - Process management scripts

### Complexity Analysis

#### Development Environment (2 points)
- **Port Conflicts**: Simple process management and configuration
- **Process Cleanup**: Standard development environment maintenance
- **Risk Level**: Very Low - standard development operations

#### Routing Structure (2 points)
- **Missing Route**: Create simple page component or redirect
- **Navigation Updates**: Minor layout modifications
- **Risk Level**: Low - standard Next.js routing

#### Configuration Management (3 points)
- **Environment Variables**: Verification and correction of .env settings
- **Supabase Configuration**: Ensure proper API keys and URLs
- **Risk Level**: Low-Medium - affects external service connections

### Technical Challenges
1. **Minimal Risk**: All fixes are low-risk development environment improvements
2. **Quick Implementation**: Each fix can be completed in under 30 minutes
3. **No Breaking Changes**: Fixes improve existing functionality without major modifications

### Implementation Priority
**High Priority** - Quick wins to establish working baseline before complex fixes.

### Related Files Reference
- **Environment**: `.env.local`, `src/lib/supabase.ts`
- **Routing**: `src/app/admin/items/page.tsx`, `src/app/admin/layout.tsx`
- **Scripts**: `restart_all_servers.sh`, `package.json`
- **Development**: Process management and port configuration

---

## REQ-007: BUG FIX REQUEST - Critical API Authentication System Resolution
**Date**: January 28, 2025  
**Type**: Bug Fix Implementation (Critical)  
**Complexity**: 16 Points (High Complexity)

### Request Summary
Resolve critical API authentication issues preventing data loading across the admin panel. Despite successful frontend login, all API endpoints return 401 Unauthorized errors, blocking core functionality.

### Detailed Requirements

#### 1. API Authentication Middleware Debug (13 points)
- **Issue**: API routes return 401 Unauthorized despite valid frontend authentication
- **Root Cause**: Disconnect between frontend auth tokens and backend validation
- **Fix Required**: Complete authentication flow debugging and resolution
- **Files Affected**:
  - `src/middleware.ts` (authentication middleware)
  - `src/app/api/admin/items/route.ts` (items API endpoint)
  - `src/app/api/admin/properties/route.ts` (properties API endpoint)
  - `src/lib/auth.ts` (authentication utilities)
  - `src/lib/api.ts` (API request handling)

#### 2. Session Token Validation (Included in above)
- **Issue**: Frontend sessions not properly validated by backend
- **Fix**: Ensure proper Supabase JWT token transmission and validation
- **Files Affected**:
  - `src/contexts/AuthContext.tsx` (session management)
  - `src/app/api/auth/session/route.ts` (session validation)
  - API route authentication helpers

#### 3. Database Permission Resolution (3 points)
- **Issue**: Admin user may lack proper database access despite authentication
- **Fix**: Verify Row Level Security (RLS) policies and admin permissions
- **Files Affected**:
  - `database/schema.sql` (RLS policies)
  - Admin user configuration
  - Supabase project settings

### Complexity Analysis

#### Authentication System Debugging (13 points)
- **Deep System Integration**: Requires understanding of Next.js middleware, Supabase auth, and JWT validation
- **Multiple Integration Points**: Frontend context, middleware, API routes, and database
- **Complex Debugging**: Tracing authentication flow across multiple layers
- **High Risk**: Core system functionality - improper fixes could break entire auth system

#### Database Access Control (3 points)
- **RLS Policy Review**: Understanding and modifying Row Level Security policies
- **User Permission Management**: Ensuring proper role assignments
- **Database Schema**: Potential modifications to user/admin table structure
- **Medium Risk**: Database-level changes affecting data access

### Technical Challenges
1. **Authentication Flow Complexity**: Multiple systems (Next.js, Supabase, middleware) must work together seamlessly
2. **JWT Token Lifecycle**: Proper token generation, transmission, validation, and refresh
3. **Cross-Component State**: Frontend auth state must properly sync with backend validation
4. **Database Security**: Balancing security with admin access requirements
5. **Session Management**: Handling token refresh and expiration scenarios

### Implementation Priority
**Critical Priority** - Blocks all admin functionality; must be resolved for system usability.

### Diagnostic Steps Required
1. **API Route Testing**: Direct endpoint testing with authentication headers
2. **Token Inspection**: Verify JWT token format and claims
3. **Middleware Debugging**: Step-through authentication middleware logic
4. **Database Query Testing**: Direct database access verification
5. **Session Flow Analysis**: Complete auth flow from login to API access

### Related Files Reference
- **Authentication Core**: `src/lib/auth.ts`, `src/contexts/AuthContext.tsx`
- **Middleware**: `src/middleware.ts`
- **API Routes**: `src/app/api/admin/items/route.ts`, `src/app/api/admin/properties/route.ts`
- **API Utilities**: `src/lib/api.ts`, `src/lib/supabase.ts`
- **Session Management**: `src/app/api/auth/session/route.ts`
- **Database**: `database/schema.sql` (RLS policies)
- **Frontend Auth**: `src/app/login/LoginPageContent.tsx`, `src/components/AuthGuard.tsx`

---

## REQ-008: Multi-Tenant Database Structure Implementation (Phase 1)
**Date**: January 28, 2025  
**Type**: Major Feature Implementation (Architecture - Phase 1)  
**Complexity**: 13 Points (High Complexity)

### Request Summary
Implement the foundational database structure for multi-tenant account system while preserving all existing public functionality. This phase establishes the core account architecture without breaking any existing features.

### Detailed Requirements

#### 1. Database Schema Creation (8 points)
- **Create Accounts Table**: Primary tenant entity with owner relationship
- **Create Account-Users Junction Table**: Many-to-many relationship between accounts and users
- **Add Account Context to Properties**: Link properties to accounts instead of direct user ownership
- **Files Affected**:
  - `database/schema.sql` (new tables: accounts, account_users)
  - `database/schema.sql` (modify properties table)
  - New migration files for account structure

#### 2. Data Migration Strategy (3 points)  
- **Preserve Existing Data**: Create default accounts for existing users/properties
- **Maintain Public Access**: Ensure item public URLs continue working unchanged
- **Migration Scripts**: Safe migration with rollback capabilities
- **Files Affected**:
  - `database/migration-account-structure.sql` (new migration file)
  - Migration validation scripts

#### 3. Basic Account Management API (2 points)
- **Account Creation**: Simple account creation for new users
- **Account Listing**: Basic account retrieval for authenticated users
- **Owner Validation**: Ensure account ownership rules
- **Files Affected**:
  - `src/app/api/admin/accounts/route.ts` (new API endpoint)
  - `src/types/index.ts` (new account types)

### Complexity Analysis

#### Database Architecture Changes (8 points)
- **New Table Creation**: Accounts and account_users with proper constraints
- **Foreign Key Updates**: Modify existing property relationships
- **Index Optimization**: Performance indexes for account-based queries
- **RLS Foundation**: Basic security policies for new tables
- **High Risk**: Database structure changes affecting existing data

#### Data Migration Safety (3 points)
- **Existing Data Preservation**: Zero data loss during migration
- **Backward Compatibility**: Public item access must remain unchanged
- **Migration Validation**: Comprehensive pre/post migration checks
- **Medium Risk**: Data migration always carries some risk

#### Basic API Infrastructure (2 points)
- **Simple CRUD Operations**: Basic account management endpoints
- **Type Definitions**: New TypeScript types for accounts
- **Authentication Integration**: Account context in existing auth flow
- **Low Risk**: New functionality doesn't affect existing features

### Technical Challenges
1. **Zero Downtime Migration**: Database changes without breaking existing functionality
2. **Public Access Preservation**: Maintaining item accessibility via public URLs
3. **Data Integrity**: Ensuring proper relationships during migration
4. **Performance**: New account-based queries must be efficient

### Implementation Priority
**High Priority** - Foundation for entire multi-tenant system; must be stable before proceeding to Phase 2.

### Related Files Reference
- **Database**: `database/schema.sql`, new migration files
- **API Routes**: `src/app/api/admin/accounts/route.ts` (new)
- **Types**: `src/types/index.ts` (account type definitions)
- **Migration**: New migration and validation scripts
- **Public Access**: `src/app/item/[publicId]/` (verify unchanged)

---

## REQ-009: Account-Based Property Management System (Phase 2)
**Date**: January 28, 2025  
**Type**: Major Feature Implementation (Architecture - Phase 2)  
**Complexity**: 15 Points (High Complexity)

### Request Summary
Transform the admin property management system to be account-based, implementing account context throughout the admin interface while maintaining all public functionality unchanged.

### Detailed Requirements

#### 1. Admin API Account Integration (8 points)
- **Account Context in All Admin APIs**: Modify all `/api/admin/*` endpoints for account filtering
- **Property Management Updates**: Account-based property CRUD operations
- **Item Management Updates**: Ensure items respect account boundaries through properties
- **Analytics Filtering**: Account-based analytics and reporting
- **Files Affected**:
  - `src/app/api/admin/properties/route.ts` (account filtering)
  - `src/app/api/admin/properties/[propertyId]/route.ts` (account validation)
  - `src/app/api/admin/items/route.ts` (account-based item filtering)
  - `src/app/api/admin/analytics/route.ts` (account analytics)

#### 2. Authentication & Session Updates (4 points)
- **Account Context in Sessions**: Track current account in user sessions
- **Account Switching Logic**: Allow users to switch between accounts they belong to
- **Permission Validation**: Ensure users can only access accounts they're associated with
- **Files Affected**:
  - `src/lib/auth.ts` (account session management)
  - `src/contexts/AuthContext.tsx` (account context)
  - `src/app/api/auth/session/route.ts` (account in session data)
  - `src/middleware.ts` (account-based route protection)

#### 3. Admin Interface Updates (3 points)
- **Account Selector Component**: UI for switching between accounts
- **Property Management Updates**: Account-aware property forms and listings
- **Admin Dashboard Updates**: Account context throughout admin interface
- **Files Affected**:
  - `src/components/AccountSelector.tsx` (new component)
  - `src/app/admin/properties/page.tsx` (account filtering)
  - `src/app/admin/page.tsx` (account-based item display)
  - `src/app/admin/layout.tsx` (account selector integration)

### Complexity Analysis

#### Backend API Transformation (8 points)
- **Multiple Endpoint Updates**: Comprehensive changes to admin API layer
- **Account Filtering Logic**: Implement account-based data filtering throughout
- **Performance Optimization**: Efficient account-based database queries
- **Security Validation**: Ensure proper account access control
- **High Risk**: Changes to core admin functionality

#### Authentication System Enhancement (4 points)
- **Session Management**: Complex account context integration
- **Account Switching**: Secure account transition logic
- **Permission Systems**: Multi-account access control
- **Middleware Updates**: Route protection based on account membership
- **Medium-High Risk**: Authentication changes affect security

#### Frontend Admin Integration (3 points)
- **Account-Aware Components**: Update existing admin components
- **User Experience**: Seamless account switching interface
- **State Management**: Account context throughout admin interface
- **Medium Risk**: UI changes affecting admin workflow

### Technical Challenges
1. **Performance**: Efficient account-based filtering across large datasets
2. **Security**: Robust account isolation and access control
3. **User Experience**: Intuitive account switching without confusion
4. **Data Consistency**: Ensuring account boundaries are properly enforced

### Implementation Priority
**High Priority** - Core admin functionality transformation; enables multi-tenant management.

### Related Files Reference
- **Admin APIs**: `src/app/api/admin/` (all endpoints)
- **Authentication**: `src/lib/auth.ts`, `src/contexts/AuthContext.tsx`, `src/middleware.ts`
- **Admin Interface**: `src/app/admin/` (all admin pages)
- **Components**: `src/components/AccountSelector.tsx` (new), property/item forms
- **Session Management**: `src/app/api/auth/session/route.ts`
- **Public Access**: `src/app/item/[publicId]/` (verify unchanged)

---

## REQ-010: Multi-User Account Collaboration Features (Phase 3)
**Date**: January 28, 2025  
**Type**: Feature Implementation (Architecture - Phase 3)  
**Complexity**: 11 Points (Medium-High Complexity)

### Request Summary
Complete the multi-tenant system with advanced collaboration features including user invitations, role-based permissions within accounts, and comprehensive account management interface.

### Detailed Requirements

#### 1. User Invitation & Management System (6 points)
- **User Invitation Flow**: Invite users to join accounts with specific roles
- **Role-Based Permissions**: Different permission levels within accounts (admin, member, viewer)
- **Account User Management**: Add/remove users from accounts with proper validation
- **Files Affected**:
  - `src/app/api/admin/accounts/[accountId]/users/route.ts` (new user management API)
  - `src/app/api/admin/invitations/route.ts` (new invitation system)
  - `src/app/admin/accounts/[accountId]/users/page.tsx` (new user management interface)
  - `src/components/UserInvitationForm.tsx` (new component)

#### 2. Advanced Account Management Interface (3 points)
- **Account Settings Page**: Comprehensive account configuration interface
- **User Role Management**: Interface for managing user permissions within accounts
- **Account Analytics**: Advanced account-level reporting and insights
- **Files Affected**:
  - `src/app/admin/accounts/[accountId]/page.tsx` (new account management page)
  - `src/app/admin/accounts/[accountId]/settings/page.tsx` (new settings page)
  - `src/components/AccountManagement.tsx` (new component)
  - `src/components/UserRoleManager.tsx` (new component)

#### 3. Enhanced Security & Validation (2 points)
- **Role-Based Access Control**: Granular permissions within accounts
- **Invitation Security**: Secure invitation tokens and validation
- **Account Isolation Testing**: Comprehensive multi-account security validation
- **Files Affected**:
  - `src/lib/permissions.ts` (new permissions library)
  - Database RLS policies updates
  - Security validation utilities

### Complexity Analysis

#### Collaboration System (6 points)
- **Invitation Infrastructure**: Complex invitation and acceptance flow
- **Role Management**: Sophisticated permission system within accounts
- **User Management**: Add/remove users with proper validation and security
- **Email Integration**: Invitation emails and notifications
- **Medium-High Risk**: Complex user management features

#### Advanced Interface Development (3 points)
- **Account Management UI**: Comprehensive administrative interface
- **User Experience**: Intuitive collaboration and permission management
- **Role-Based UI**: Interface elements based on user permissions
- **Low-Medium Risk**: New UI features don't affect core functionality

#### Security Enhancement (2 points)
- **Permission Systems**: Granular access control implementation
- **Security Testing**: Multi-account isolation validation
- **Access Control**: Role-based feature access
- **Medium Risk**: Security features require careful implementation

### Technical Challenges
1. **Permission Complexity**: Balancing simplicity with granular control
2. **Invitation Security**: Secure token-based invitation system
3. **User Experience**: Intuitive collaboration without overwhelming interface
4. **Testing Complexity**: Multi-user, multi-account scenarios

### Implementation Priority
**Medium Priority** - Enhanced features that complete the multi-tenant vision; can be implemented after core system is stable.

### Related Files Reference
- **User Management**: `src/app/api/admin/accounts/[accountId]/users/` (new)
- **Invitations**: `src/app/api/admin/invitations/` (new)
- **Account Interface**: `src/app/admin/accounts/` (new pages)
- **Components**: New collaboration components
- **Security**: `src/lib/permissions.ts` (new), RLS policy updates
- **Email**: Invitation and notification system

---

*Next Request: REQ-011* 

## REQ-011: QR Code Printing System for Properties
**Date**: January 28, 2025  
**Type**: Feature Implementation  
**Complexity**: 10 Points (Medium-High Complexity)

### Request Summary
Implement a QR code printing feature for the properties page that allows users to select multiple items from a property and generate customizable print layouts with QR codes for bulk printing.

### Detailed Requirements

#### 1. QR Code Generation Integration (3 points)
- **QR Code Library Integration**: Install and configure QR code generation library (qrcode.js or similar)
- **Dynamic QR Code Creation**: Generate QR codes for item URLs (`faqbnb.com/item/[publicId]`)
- **Code Optimization**: Efficient QR code generation for multiple items
- **Files Affected**:
  - `package.json` (new dependency: qrcode.js or equivalent)
  - `src/lib/qrcode-utils.ts` (new utility functions)
  - QR code generation and caching logic

#### 2. Bulk Item Selection Interface (3 points)
- **Multi-Select Item List**: Checkbox interface for selecting multiple items
- **Select All/None Functionality**: Bulk selection controls
- **Property-Specific Item Loading**: Load items belonging to specific property
- **Files Affected**:
  - `src/app/admin/properties/[propertyId]/page.tsx` (add QR print button)
  - `src/components/QRCodePrintManager.tsx` (new component)
  - `src/components/ItemSelectionList.tsx` (new component)

#### 3. Print Layout Customization System (3 points)
- **Size Controls**: Small, medium, large QR code sizes
- **Grid Layout Options**: Configurable items per row/column
- **Print Optimization**: CSS for proper page breaks and print formatting
- **Live Preview**: Real-time preview of print layout
- **Files Affected**:
  - `src/components/QRCodePrintPreview.tsx` (new component)
  - `src/components/PrintLayoutControls.tsx` (new component)
  - `src/styles/print.css` (new print-specific styles)

#### 4. Integration with Property Management (1 point)
- **Property Page Integration**: Add "Print QR Codes" button to property view
- **Item API Integration**: Fetch items for specific property
- **State Management**: Handle selection state and print settings
- **Files Affected**:
  - `src/app/admin/properties/[propertyId]/page.tsx` (button integration)
  - Property management workflow integration

### Complexity Analysis

#### QR Code Generation (3 points)
- **Library Integration**: Install and configure QR code generation library
- **Performance Optimization**: Efficient generation for multiple items simultaneously
- **URL Construction**: Dynamic QR code content based on item public IDs
- **Caching Strategy**: Avoid regenerating identical QR codes
- **Low-Medium Risk**: Standard library integration with established patterns

#### User Interface Development (6 points)
- **Multi-Select Interface**: Complex selection state management
- **Print Layout System**: Advanced CSS for print optimization with page breaks
- **Real-Time Preview**: Dynamic layout updates based on user preferences
- **Responsive Design**: Interface that works across different screen sizes
- **Print CSS Challenges**: Browser-specific print behavior and layout control
- **Medium Risk**: Complex UI with print-specific requirements

#### System Integration (1 point)
- **Property Page Integration**: Simple button addition to existing interface
- **API Integration**: Use existing item fetching endpoints
- **State Management**: Standard React state patterns
- **Low Risk**: Integration with existing, stable components

### Technical Challenges
1. **Print CSS Complexity**: Browser differences in print rendering and page break handling
2. **QR Code Quality**: Ensuring high-resolution QR codes suitable for printing
3. **Performance**: Generating multiple QR codes without blocking UI
4. **User Experience**: Intuitive interface for complex customization options
5. **Layout Optimization**: Efficient use of paper space while maintaining readability

### Implementation Priority
**Medium Priority** - Useful productivity feature that enhances the property management workflow but not critical for core functionality.

### Implementation Phases
1. **Phase 1**: QR code generation library integration and basic generation
2. **Phase 2**: Item selection interface and property integration
3. **Phase 3**: Print layout customization and preview system
4. **Phase 4**: Print optimization and user experience refinement

### Related Files Reference
- **Property Management**: `src/app/admin/properties/[propertyId]/page.tsx`
- **Item API**: `src/app/api/admin/items/route.ts` (existing endpoint for item fetching)
- **New Components**: 
  - `src/components/QRCodePrintManager.tsx`
  - `src/components/ItemSelectionList.tsx`
  - `src/components/QRCodePrintPreview.tsx`
  - `src/components/PrintLayoutControls.tsx`
- **Utilities**: `src/lib/qrcode-utils.ts` (new)
- **Styles**: `src/styles/print.css` (new)
- **Dependencies**: `package.json` (QR code generation library)
- **Types**: `src/types/index.ts` (new interfaces for print settings)
- **Existing Items System**: `src/components/ItemForm.tsx`, `src/types/index.ts`

---

*Next Request: REQ-012* 

## REQ-012: BUG FIX REQUEST - QR Code Print Manager UI Transition and Display
**Date**: January 28, 2025  
**Type**: Bug Fix Implementation  
**Complexity**: 3 Points (Low-Medium Complexity)

### Request Summary
Fix critical UI bug in the QR Code Print Manager where QR codes are successfully generated in the backend but the interface fails to transition from the "Configure Print" step to the "Preview & Print" step, preventing users from viewing their generated QR codes.

### Detailed Requirements

#### 1. UI State Transition Bug Fix (1 point)
- **Issue**: React component gets stuck on Step 2 (⚙️ Configure Print) after successful QR generation
- **Symptom**: Console shows `✅ Generated 11 QR codes successfully` but UI never advances to Step 3
- **Fix Required**: Proper state management to transition from Step 2 → Step 3 after QR generation completion
- **Files Affected**:
  - `src/components/QRCodePrintManager.tsx` (step transition logic)
  - `src/hooks/useQRCodeGeneration.ts` (state management integration)

#### 2. QR Code Preview Display Implementation (1 point)
- **Issue**: Generated QR codes exist in memory but are never rendered in DOM
- **Symptom**: DOM analysis shows `canvases: 0, dataImages: 0` despite successful generation
- **Fix Required**: Implement Step 3 (🖨️ Preview & Print) content with actual QR code display
- **Files Affected**:
  - `src/components/QRCodePrintManager.tsx` (Step 3 rendering logic)
  - `src/components/QRCodePrintPreview.tsx` (QR code grid display)

#### 3. QR Code Layout Specification (1 point)
- **Issue**: Need to implement specific layout requirements for QR code display
- **Requirements**: 
  - Each QR code container: 225x225 pixels
  - QR code size: 200x200 pixels (centered in container)
  - Item name displayed above each QR code within the 225x225 box
  - Grid layout (appears to be 3 columns based on reference image)
- **Files Affected**:
  - `src/components/QRCodePrintPreview.tsx` (grid layout and styling)
  - `src/styles/print.css` (print-specific layout styles)

### Complexity Analysis

#### React State Management (1 point)
- **Component State Bug**: Simple state transition fix in existing component
- **Hook Integration**: Ensure proper communication between QR generation hook and UI component
- **Risk Level**: Low - isolated to component state management

#### UI Rendering Implementation (1 point)
- **QR Display Logic**: Connect existing generated QR data to visual rendering
- **Step 3 Content**: Implement missing preview step UI content
- **Risk Level**: Low - adding missing UI functionality without changing existing logic

#### Layout & Styling (1 point)
- **CSS Grid Implementation**: Create responsive grid layout for QR codes
- **Precise Dimensions**: Apply specific 225x225 and 200x200 pixel requirements
- **Print Optimization**: Ensure layout works for both screen preview and print
- **Risk Level**: Low - CSS styling and layout work

### Technical Challenges
1. **Minimal Complexity**: Backend QR generation already works perfectly
2. **UI-Only Fix**: All data and logic exists; only UI rendering needs implementation
3. **Well-Defined Requirements**: Clear specifications for layout and dimensions
4. **Existing Infrastructure**: QR generation hook and modal framework already functional

### Implementation Priority
**High Priority** - Blocks user access to generated QR codes; core functionality is unusable without this fix.

### Related Files Reference
- **Primary Component**: `src/components/QRCodePrintManager.tsx` (step transition and Step 3 implementation)
- **QR Generation Hook**: `src/hooks/useQRCodeGeneration.ts` (state integration)
- **Preview Component**: `src/components/QRCodePrintPreview.tsx` (QR display grid)
- **Styling**: `src/styles/print.css` (layout and print optimization)
- **Reference Implementation**: Request REQ-011 QR Code Printing System (base functionality)

### Backend Status
- ✅ **QR Generation**: Fully functional - `✅ Generated 11 QR codes successfully`
- ✅ **Data Processing**: Working - `🚀 Processing 11 QR codes in batches of 5`
- ✅ **Item Selection**: Functional - All 11 items properly selected
- ✅ **Configuration**: Working - Settings applied correctly

### Current Bug Evidence
- **Console Logs**: Backend shows successful QR generation
- **DOM Analysis**: No QR code elements rendered (`canvases: 0, dataImages: 0`)
- **UI State**: Stuck on Configure Print step, buttons disabled but no progression
- **User Impact**: Complete inability to view or use generated QR codes

---

*Next Request: REQ-013* 

## REQ-013: Professional PDF QR Code Printing System with Vector Cutlines
**Date**: January 28, 2025  
**Type**: Feature Implementation (Advanced)  
**Complexity**: 17 Points (High Complexity)

### Request Summary
Implement a professional PDF generation system for QR codes with precise vector-based cutlines, replacing the current browser print functionality with a mathematically accurate PDF creation solution that ensures perfect alignment on any printer.

### Detailed Requirements

#### 1. PDF Generation Library Integration (3 points)
- **PDF Library Selection**: Integrate `pdf-lib`, `pdfkit`, `jspdf`, or `@react-pdf/renderer` for vector-based PDF creation
- **Library Configuration**: Configure build system and type definitions for chosen PDF library
- **Vector Support**: Ensure selected library supports both bitmap QR codes and vector line drawing
- **Files Affected**:
  - `package.json` (new PDF library dependency)
  - `next.config.js` (potential build configuration)
  - `src/lib/pdf-generator.ts` (new PDF utility library)

#### 2. Mathematical Page Geometry System (5 points)
- **Page Size Support**: A4 (210 × 297 mm) and Letter (8.5 × 11 inch) format support
- **Margin Calculations**: Configurable margins (default 10mm) with precise coordinate conversion
- **Grid Mathematics**: 
  - Calculate columns: `floor((page_width - 2 × margin) / qr_side)`
  - Dynamic row calculations based on total items and column count
  - Absolute positioning for each QR code cell
- **Coordinate System**: Convert between millimeters, points, and pixels for different PDF libraries
- **Files Affected**:
  - `src/lib/pdf-geometry.ts` (new mathematical calculation library)
  - `src/types/pdf.ts` (new PDF-specific type definitions)

#### 3. Vector Cutline Drawing System (4 points)
- **Dashed Line Implementation**: Vector-based dashed cutlines with 4pt on / 4pt off pattern
- **Grid Boundary Detection**: Calculate exact positions for column and row boundaries
- **Line Properties**: 
  - Stroke width: 0.5-1 pt configurable
  - Color: #999999 (light gray)
  - Vector precision for perfect printer alignment
- **Multi-page Support**: Cutlines on every page with consistent positioning
- **Files Affected**:
  - `src/lib/pdf-cutlines.ts` (new cutline drawing utilities)
  - Vector drawing integration in PDF generation pipeline

#### 4. QR Code Integration & Layout Engine (3 points)
- **QR Code Processing**: Convert existing generated QR codes (PNG/SVG) to PDF-compatible format
- **Absolute Positioning**: Place QR codes at calculated cell origins with pixel-perfect accuracy
- **Label Integration**: Optional item labels positioned outside QR area within cell boundaries
- **Size Consistency**: Ensure uniform QR code sizing (e.g., 40mm per specification)
- **Files Affected**:
  - `src/components/QRCodePrintManager.tsx` (add PDF export option)
  - `src/components/QRCodePrintPreview.tsx` (PDF preview integration)
  - `src/lib/qrcode-utils.ts` (PDF format conversion utilities)

#### 5. User Interface & Export System (2 points)
- **Export Options**: Add "Export PDF" button alongside existing print functionality
- **Page Format Selection**: UI controls for A4 vs Letter page size selection
- **Margin Customization**: User-configurable margin settings
- **PDF Download**: Browser-based PDF download with proper filename generation
- **Files Affected**:
  - `src/components/QRCodePrintManager.tsx` (PDF export controls)
  - `src/components/PDFExportOptions.tsx` (new configuration component)
  - PDF export workflow integration

### Complexity Analysis

#### PDF Library Integration & Learning Curve (3 points)
- **Library Selection**: Evaluation and integration of appropriate PDF library
- **API Learning**: Understanding chosen library's API, coordinate systems, and limitations
- **Build Configuration**: Potential Next.js build system modifications for PDF libraries
- **Risk Level**: Medium - External library dependency with potential build complications

#### Mathematical Precision System (5 points)
- **Complex Calculations**: Multi-unit coordinate conversions (mm, pt, px)
- **Page Layout Mathematics**: Dynamic grid calculations with edge case handling
- **Precision Requirements**: Sub-pixel accuracy required for professional printing
- **Cross-Format Support**: Different page sizes with consistent mathematical approach
- **Risk Level**: High - Mathematical errors could cause misaligned prints

#### Vector Graphics Implementation (4 points)
- **Vector Drawing**: Precise dashed line drawing with configurable patterns
- **Grid System**: Complex boundary detection and line placement calculations
- **Multi-page Consistency**: Ensuring cutlines align perfectly across all pages
- **PDF Standards**: Compliance with PDF vector drawing specifications
- **Risk Level**: Medium-High - Vector graphics require precise implementation

#### System Integration (3 points)
- **Existing QR Flow**: Integration with current `QRCodePrintManager` workflow
- **Data Pipeline**: Converting existing QR generation output to PDF format
- **State Management**: Managing PDF generation state alongside existing print logic
- **User Experience**: Seamless integration without disrupting existing functionality
- **Risk Level**: Medium - Integration with existing complex QR generation system

#### Testing & Quality Assurance (2 points)
- **Cross-browser Testing**: PDF generation consistency across different browsers
- **Print Validation**: Testing actual printed output for alignment accuracy
- **Performance Testing**: Large QR code batches and PDF generation speed
- **Device Testing**: Various printers and paper sizes for validation
- **Risk Level**: Low-Medium - Testing complexity but well-defined requirements

### Technical Challenges
1. **Mathematical Precision**: Converting between measurement units while maintaining accuracy
2. **PDF Library Limitations**: Working within constraints of chosen PDF library
3. **Vector Graphics Complexity**: Implementing precise dashed line patterns
4. **Cross-Browser Compatibility**: Ensuring consistent PDF generation across browsers
5. **Performance Optimization**: Generating large PDFs with many QR codes efficiently
6. **Print Validation**: Ensuring perfect alignment on physical printers

### Implementation Priority
**Medium-High Priority** - Professional printing solution that significantly enhances the QR code workflow, but existing browser print functionality provides basic coverage.

### Implementation Phases
1. **Phase 1**: PDF library integration and basic page geometry (6 points)
2. **Phase 2**: Vector cutline system and grid calculations (5 points)
3. **Phase 3**: QR code placement and layout engine (4 points)
4. **Phase 4**: UI integration and export system (2 points)

### Related Files Reference
- **Existing QR System**: 
  - `src/components/QRCodePrintManager.tsx` (main print management)
  - `src/components/QRCodePrintPreview.tsx` (current preview system)
  - `src/lib/qrcode-utils.ts` (QR generation utilities)
  - `src/hooks/useQRCodeGeneration.ts` (QR generation hook)
- **New PDF System**:
  - `src/lib/pdf-generator.ts` (new - core PDF creation)
  - `src/lib/pdf-geometry.ts` (new - mathematical calculations)
  - `src/lib/pdf-cutlines.ts` (new - vector cutline drawing)
  - `src/components/PDFExportOptions.tsx` (new - PDF configuration UI)
  - `src/types/pdf.ts` (new - PDF type definitions)
- **Configuration**: 
  - `package.json` (PDF library dependency)
  - `next.config.js` (potential build updates)
- **Integration Points**:
  - `src/app/admin/properties/[propertyId]/page.tsx` (property management integration)
  - `src/types/index.ts` (QR print settings extension)

### Technical Specifications
- **Supported Page Formats**: A4 (210×297mm), Letter (8.5×11in)
- **Default Margins**: 10mm configurable
- **QR Code Size**: 40mm (configurable)
- **Cutline Properties**: 0.5-1pt stroke, #999 color, 4pt dash pattern
- **Output Format**: Vector PDF with embedded bitmap QR codes
- **File Naming**: `qr-codes-{property-name}-{date}.pdf`

---

*Next Request: REQ-015*

## REQ-015: BUG FIX REQUEST - Critical PDF QR Code Generation Layout and Positioning Issues
**Date**: January 28, 2025  
**Type**: Bug Fix Implementation (Critical)  
**Complexity**: 10 Points (Medium-High Complexity)

### Request Summary
Fix critical PDF generation issues where QR codes are rendered at incorrect sizes and positions, resulting in extremely poor space utilization and unprofessional output. Current system generates QR codes clustered in bottom-left corner at approximately 10-15mm instead of expected 40mm default, with over 90% page space wasted.

### Detailed Requirements

#### 1. QR Code Size Calculation Fix (3 points)
- **Issue**: QR codes render at 10-15mm instead of expected 40mm default size
- **Root Cause**: Millimeter-to-points conversion errors in PDF generation pipeline
- **Fix Required**: Debug and correct size calculation throughout PDF generation chain
- **Files Affected**:
  - `src/lib/pdf-generator.ts` (QR code embedding and sizing)
  - `src/lib/pdf-geometry.ts` (grid layout calculations)
  - `src/lib/qrcode-utils.ts` (QR generation for PDF)
  - `src/components/QRCodePrintManager.tsx` (size settings integration)

#### 2. Coordinate System Positioning Correction (4 points)
- **Issue**: QR codes clustered in bottom-left corner instead of proper grid distribution
- **Root Cause**: PDF coordinate system (bottom-left origin) vs expected positioning logic conflicts
- **Fix Required**: Debug and fix `getQRCellPosition()` coordinate calculations and PDF positioning
- **Files Affected**:
  - `src/lib/pdf-geometry.ts` (cell positioning calculations)
  - `src/lib/pdf-generator.ts` (QR code placement logic)
  - `src/types/pdf.ts` (coordinate type definitions)

#### 3. Page Space Utilization Optimization (2 points)
- **Issue**: Over 90% page space wasted due to incorrect grid layout calculations
- **Root Cause**: Grid layout logic not properly distributing items across usable page area
- **Fix Required**: Fix `calculateGridLayout()` to properly utilize entire page area
- **Files Affected**:
  - `src/lib/pdf-geometry.ts` (grid layout mathematics)
  - `src/lib/pdf-generator.ts` (page layout implementation)

#### 4. Professional Print Quality Validation (1 point)
- **Issue**: Output unsuitable for professional printing due to size and positioning errors
- **Fix Required**: Implement validation for minimum readable QR code sizes and proper spacing
- **Files Affected**:
  - `src/lib/pdf-generator.ts` (quality validation)
  - `src/components/QRCodePrintManager.tsx` (user feedback)

### Complexity Analysis

#### Mathematical Coordinate System Debugging (4 points)
- **PDF Coordinate Systems**: Complex debugging of bottom-left origin vs top-left expectations
- **Unit Conversions**: Multiple conversion layers between mm, points, and pixels
- **Grid Mathematics**: Debugging multi-step calculations for cell positioning
- **Precision Requirements**: Sub-millimeter accuracy needed for professional printing
- **High Risk**: Mathematical errors affect all QR code positioning

#### PDF Generation Pipeline Analysis (3 points)
- **Multi-Library Integration**: Understanding pdf-lib, QR generation, and coordinate conversion
- **Debug Complex Flow**: Tracing data through generatePDFFromQRCodes → addQRCodeToPage → coordinate calculations
- **Size Calculation Chain**: Following QR size from UI settings through multiple conversion steps
- **Medium-High Risk**: Changes to core PDF generation affect entire printing system

#### Quality Assurance & Validation (2 points)
- **Physical Print Testing**: Validating actual printed output dimensions and positioning
- **Cross-Format Testing**: Ensuring fixes work across A4, Letter, and other page sizes
- **Edge Case Handling**: Multiple QR codes, different sizes, various margin settings
- **Medium Risk**: Quality validation requires comprehensive testing

#### System Integration Preservation (1 point)
- **Existing Functionality**: Ensure fixes don't break current QR generation workflow
- **UI Compatibility**: Maintain existing interface while fixing underlying calculations
- **Low Risk**: Focused fixes to mathematical calculations without major architectural changes

### Technical Challenges
1. **Coordinate System Complexity**: PDF bottom-left origin vs standard top-left coordinate expectations
2. **Multi-Step Unit Conversions**: Debugging mm → points → pixels conversions across multiple functions
3. **Mathematical Precision**: Ensuring sub-millimeter accuracy for professional printing standards
4. **Library Integration**: Understanding pdf-lib coordinate system and embedding behavior
5. **Testing Complexity**: Validating mathematical corrections require physical print testing

### Implementation Priority
**Critical Priority** - Current PDF output is completely unusable for professional printing, making core QR code printing functionality non-functional.

### Current Evidence of Issues
- **Visual Analysis**: QR codes appear as tiny dots in corner instead of grid layout
- **Size Analysis**: Codes approximately 10-15mm instead of 40mm specification
- **Space Utilization**: 90%+ page area completely unused
- **User Impact**: Generated PDFs unsuitable for any professional printing use

### Related Files Reference
- **Core PDF Generation**: 
  - `src/lib/pdf-generator.ts` (main generation pipeline, QR embedding)
  - `src/lib/pdf-geometry.ts` (coordinate calculations, grid layout)
  - `src/lib/pdf-cutlines.ts` (vector drawing utilities)
- **QR Code Integration**:
  - `src/lib/qrcode-utils.ts` (QR generation for PDF)
  - `src/hooks/useQRCodeGeneration.ts` (QR generation state)
- **User Interface**:
  - `src/components/QRCodePrintManager.tsx` (print management UI)
  - `src/components/QRCodePrintPreview.tsx` (preview display)
  - `src/components/PDFExportOptions.tsx` (PDF configuration)
- **Type Definitions**:
  - `src/types/pdf.ts` (PDF-specific types)
  - `src/types/qrcode.ts` (QR code types)
- **Integration Points**:
  - `src/app/admin/properties/[propertyId]/qr-print/page.tsx` (QR print page)

### Expected vs Actual Behavior
- **Expected**: 2 QR codes distributed properly across page at 40mm each with professional layout
- **Actual**: 2 tiny QR codes (10-15mm) clustered in bottom-left corner with massive wasted space
- **Impact**: Complete failure of professional printing functionality

---

*Next Request: REQ-016*

## REQ-016: Domain Configuration for QR Links and System Admin Back Office
**Date**: August 6, 2025  
**Type**: Feature Implementation (Major)  
**Complexity**: 28-34 Points (High Complexity)

### Request Summary
Implement configurable domain parameter for QR code links and create a comprehensive system admin back office interface for user management, access tracking, and account analytics.

### Detailed Requirements

#### 1. Domain Parameter for QR Code Links (3 points)
- **Issue**: QR codes currently resolve to localhost when generated locally
- **Solution**: Add configurable domain parameter that overrides localhost regardless of where code generation runs
- **Implementation**: Environment variable or admin setting for domain configuration
- **Files Affected**:
  - `.env.local` / `.env` (new DOMAIN_OVERRIDE parameter)
  - `src/lib/qrcode-utils.ts` (domain resolution logic)
  - `src/app/api/qr-codes/route.ts` (QR generation endpoint)
  - `src/components/QRCodePrintManager.tsx` (domain integration)
  - `src/lib/config.ts` (new configuration management)

#### 2. System Admin Database Flag Implementation (2 points)
- **Requirement**: Sys admin users flagged in database (manually set in Supabase)
- **Implementation**: Add is_admin boolean field to users table
- **Access Control**: Admin-only routes and components based on database flag
- **Files Affected**:
  - `database/schema.sql` (add is_admin column to users table)
  - `src/lib/auth.ts` (admin role checking)
  - `src/middleware.ts` (admin route protection)
  - `src/contexts/AuthContext.tsx` (admin state management)

#### 3. Back Office User Analytics Dashboard (12 points)
- **User List Display**: Current users with comprehensive account access information
- **Account Access Analytics**: 
  - Accounts user has access to but doesn't own
  - Visit counts to items in those accounts
  - Accounts user owns with item counts and visit statistics
- **Data Aggregation**: Complex queries across users, accounts, items, and visits
- **Files Affected**:
  - `src/app/admin/back-office/page.tsx` (new admin dashboard)
  - `src/app/api/admin/users/analytics/route.ts` (new user analytics API)
  - `src/components/UserAnalyticsTable.tsx` (new analytics display component)
  - `src/components/AccountAccessSummary.tsx` (new access summary component)
  - `src/lib/analytics.ts` (new analytics calculation utilities)
  - `src/types/admin.ts` (new admin-specific type definitions)

#### 4. Access Request Management System (11 points)
- **Access Request Tracking**: List of people who have requested access
- **Request Timeline**: When access was requested, granted, and registration dates
- **Registration Analytics**: 
  - Days since request for unregistered users
  - Days between request and registration for registered users
- **Email Integration**: Pre-formatted email popup with access links and codes
- **Approval Workflow**: Admin buttons to grant access with automated email generation
- **Files Affected**:
  - `database/schema.sql` (new access_requests table)
  - `src/app/admin/back-office/access-requests/page.tsx` (new access management page)
  - `src/app/api/admin/access-requests/route.ts` (new access request API)
  - `src/app/api/admin/access-requests/[requestId]/grant/route.ts` (grant access endpoint)
  - `src/components/AccessRequestTable.tsx` (new request management component)
  - `src/components/EmailPopup.tsx` (new email composition component)
  - `src/lib/email-templates.ts` (new email template utilities)
  - `src/lib/access-management.ts` (new access control utilities)

### Complexity Analysis

#### Domain Configuration System (3 points)
- **Environment Management**: Dynamic domain resolution based on configuration
- **QR Code Integration**: Modify existing QR generation to use configurable domain
- **Cross-Environment Support**: Development, staging, production domain handling
- **Risk Level**: Low-Medium - Configuration change affecting URL generation

#### Database Schema & Admin Infrastructure (2 points)
- **Schema Addition**: Simple boolean flag addition to existing users table
- **Authentication Integration**: Admin role checking throughout application
- **Route Protection**: Middleware updates for admin-only access
- **Risk Level**: Low - Simple database addition with standard auth patterns

#### User Analytics Dashboard (12 points)
- **Complex Data Aggregation**: Multi-table joins across users, accounts, items, visits
- **Performance Optimization**: Efficient queries for potentially large datasets
- **Advanced UI Components**: Rich dashboard interface with sortable tables and analytics
- **Real-time Data**: Up-to-date user access and visit statistics
- **Cross-Account Analytics**: Complex ownership vs access relationship tracking
- **Risk Level**: High - Complex database queries and new admin interface

#### Access Request Management (11 points)
- **Complete Workflow System**: Request → Review → Approval → Email → Registration tracking
- **Email Integration**: Template system with dynamic link generation
- **Timeline Analytics**: Complex date calculations for request/registration tracking
- **Database Design**: New access request tracking with proper relationships
- **Approval Process**: Secure access granting with proper validation
- **User Experience**: Intuitive admin interface for managing access requests
- **Risk Level**: High - Complete new workflow system with email integration

### Technical Challenges
1. **Complex Database Relationships**: Multi-table analytics across accounts, users, and access
2. **Email Integration**: Secure template system with dynamic access links
3. **Performance**: Efficient analytics queries for large user datasets
4. **Security**: Admin access control and secure access granting workflow
5. **User Experience**: Intuitive admin interface for complex data relationships
6. **Timeline Calculations**: Accurate date math for request/registration analytics

### Implementation Priority
**High Priority** - Critical admin functionality for user management and system oversight.

### Implementation Phases
1. **Phase 1**: Domain configuration and admin flag implementation (5 points)
2. **Phase 2**: User analytics dashboard infrastructure (8 points)
3. **Phase 3**: Access request management system (10 points)
4. **Phase 4**: Email integration and approval workflow (9 points)

### Related Files Reference
- **Configuration**: 
  - `.env.local`, `src/lib/config.ts` (domain settings)
  - `database/schema.sql` (admin flag and access requests)
- **Authentication & Authorization**:
  - `src/lib/auth.ts`, `src/middleware.ts`, `src/contexts/AuthContext.tsx`
- **QR Code System**:
  - `src/lib/qrcode-utils.ts`, `src/app/api/qr-codes/route.ts`
  - `src/components/QRCodePrintManager.tsx`
- **New Admin Interface**:
  - `src/app/admin/back-office/` (new admin pages)
  - `src/components/UserAnalyticsTable.tsx`, `src/components/AccessRequestTable.tsx`
  - `src/components/EmailPopup.tsx` (new components)
- **New API Endpoints**:
  - `src/app/api/admin/users/analytics/route.ts`
  - `src/app/api/admin/access-requests/` (access management APIs)
- **New Utilities**:
  - `src/lib/analytics.ts`, `src/lib/email-templates.ts`
  - `src/lib/access-management.ts` (new utility libraries)
- **Type Definitions**:
  - `src/types/admin.ts` (new admin types)
  - `src/types/index.ts` (extend existing types)

### Database Schema Requirements
- **Users Table**: Add `is_admin` boolean field (manually settable)
- **Access Requests Table**: New table for tracking access requests with:
  - Request date, user info, account requested, approval status
  - Approval date, admin who approved, registration completion date
  - Email sent status and access code generation

---

## REQ-017: Auto-Create Access Requests from Beta Waitlist Signups
**Date**: August 6, 2025  
**Type**: Feature Enhancement  
**Complexity**: 3-4 Points (Medium)

### Request Summary
Automatically create access requests when users sign up for the beta waitlist through `http://localhost:3000/#beta`. This will integrate the existing mailing list signup functionality with the access request management system implemented in REQ-016.

### Current State Analysis
The beta waitlist functionality is already implemented with:
- **Frontend**: Beta signup section at `#beta` on homepage with "Be First to Access FAQBNB" 
- **API**: `/api/mailing-list` endpoint for email collection and validation
- **Database**: `mailing_list_subscribers` table storing beta signups
- **UI**: `MailingListSignup` component with full validation and user feedback

### Requested Enhancement
When a user submits their email through the beta waitlist form, the system should:
1. **Continue existing behavior**: Add email to mailing list (preserve current functionality)
2. **New behavior**: Automatically create an access request entry in the `access_requests` table
3. **Admin integration**: Make these beta-originated requests visible in the admin dashboard at `/admin/access-requests`
4. **Special handling**: Mark these requests with `source: 'beta_waitlist'` for admin identification

### Complexity Analysis

#### Low-Medium Complexity Factors (2 points):
- **Existing Infrastructure**: Access request system already implemented in REQ-016
- **Working API Endpoint**: `/api/mailing-list` already handles validation and database operations
- **Database Schema**: `access_requests` table already exists with proper structure
- **Admin Interface**: Dashboard already supports access request management

#### Medium Complexity Factors (1-2 points):
- **Account Handling**: Beta users don't specify a target account, need special handling
- **Dual Operations**: Must successfully complete both mailing list signup AND access request creation
- **Error Handling**: Need transaction-like behavior to maintain data consistency
- **Admin UX**: Beta requests may need different UI treatment in admin dashboard

#### Technical Implementation Points:
- **API Modification** (1 point): Enhance `/api/mailing-list` to create access requests
- **Beta Request Logic** (1 point): Handle null account_id and special beta metadata
- **Error Handling** (0.5 point): Ensure atomic operations and proper rollback
- **Admin Dashboard** (0.5 point): Minor updates to display beta-source requests appropriately
- **Testing & Validation** (0.5-1 point): Verify end-to-end flow works correctly

### Referenced Files

#### Core Implementation Files:
- **Primary API**: `src/app/api/mailing-list/route.ts` (main modification needed)
- **Frontend Component**: `src/components/MailingListSignup.tsx` (minimal/no changes)
- **Homepage Integration**: `src/app/page.tsx` (no changes expected)

#### Access Request System Files (REQ-016):
- **Types**: `src/types/admin.ts` (may need beta-specific enum values)
- **Utilities**: `src/lib/access-management.ts` (may leverage existing validation)
- **Admin Dashboard**: `src/app/admin/access-requests/page.tsx` (minor display updates)
- **Components**: `src/components/AccessRequestTable.tsx` (potential beta indicator)

#### Database Tables:
- **Existing**: `mailing_list_subscribers` (continue using)
- **Existing**: `access_requests` (add beta-originated entries)
- **Relationship**: Link via email address for tracking

### Risk Assessment
**Low-Medium Risk**:
- **Data Integrity**: Need to ensure both operations succeed or both fail
- **Performance**: Minimal impact, adding one additional database insert
- **User Experience**: Should be transparent to users (no UX change)
- **Admin Experience**: May need to educate admins on beta vs. regular requests

### Success Criteria
1. ✅ Beta waitlist signup continues to work exactly as before
2. ✅ Email successfully added to mailing list
3. ✅ Access request automatically created with appropriate metadata
4. ✅ Beta requests visible in admin dashboard with source identification
5. ✅ Proper error handling if either operation fails
6. ✅ Admin can approve beta requests using existing workflow

### Implementation Priority
**Medium Priority** - Enhances existing functionality and improves admin workflow efficiency by automatically capturing beta interest as actionable access requests.

---

## REQ-018: Implement Registration Page with Access Code Validation and OAuth Support
**Date**: January 28, 2025  
**Type**: Feature Implementation  
**Complexity**: 13-21 Points (High Complexity)

### Request Summary
Create a user registration system accessible via `http://localhost:3000/register?code=XXXXX&email=pendinguseremail@domain.com` that validates access codes from approved pending requests and supports both email/password and Google OAuth registration methods. Upon successful registration, automatically create a default account with the user as owner.

### Detailed Requirements

#### 1. Registration Page Frontend Implementation (5 points)
- **URL Parameter Handling**: Parse and validate `code` and `email` query parameters
- **Dual Authentication Methods**: Support both email/password and Google OAuth registration
- **Form Validation**: Comprehensive client-side validation for all registration fields
- **Error Handling**: User-friendly error messages for various failure scenarios
- **Files Affected**:
  - `src/app/register/page.tsx` (new registration page)
  - `src/components/RegistrationForm.tsx` (new registration form component)
  - `src/components/GoogleOAuthButton.tsx` (new OAuth component)
  - `src/hooks/useRegistration.ts` (new registration logic hook)

#### 2. Access Code Validation System (3 points)
- **Database Integration**: Validate access codes against pending requests table
- **Code Expiration**: Check if access codes are still valid and not expired
- **Email Verification**: Ensure email parameter matches the pending request
- **Security**: Prevent code reuse and implement proper validation flow
- **Files Affected**:
  - `src/app/api/auth/validate-code/route.ts` (new code validation endpoint)
  - `src/lib/access-validation.ts` (new validation utilities)
  - Database schema updates for pending requests tracking

#### 3. Google OAuth Integration (8 points)
- **OAuth Provider Setup**: Configure Google OAuth provider with Supabase
- **Authentication Flow**: Implement complete OAuth registration flow
- **Token Management**: Handle OAuth tokens and session creation
- **User Data Integration**: Map Google profile data to user registration
- **Error Handling**: OAuth-specific error scenarios and fallbacks
- **Files Affected**:
  - `src/lib/supabase.ts` (OAuth configuration)
  - `src/app/api/auth/oauth/callback/route.ts` (new OAuth callback handler)
  - `src/contexts/AuthContext.tsx` (OAuth integration in auth context)
  - Environment variables for Google OAuth credentials

#### 4. Enhanced Registration API (3 points)
- **Extended Registration Endpoint**: Modify existing `/api/auth/register` for access code flow
- **Access Code Consumption**: Mark access codes as used after successful registration
- **User Creation**: Enhanced user creation with access code metadata
- **Session Management**: Proper session creation for newly registered users
- **Files Affected**:
  - `src/app/api/auth/register/route.ts` (extend existing registration API)
  - `src/lib/auth.ts` (enhance registerUser function)
  - Database updates for tracking code usage

#### 5. Default Account Creation (2 points)
- **Automatic Account Setup**: Create default account upon successful registration
- **Owner Assignment**: Set registered user as account owner
- **Account Naming**: Generate appropriate default account name
- **Database Transactions**: Ensure atomic user and account creation
- **Files Affected**:
  - `src/lib/auth.ts` (extend registration to include account creation)
  - `src/app/api/auth/register/route.ts` (account creation integration)
  - Database account creation utilities

### Complexity Analysis

#### Frontend Registration Interface (5 points)
- **Dual Auth Methods**: Complex UI supporting both email/password and OAuth flows
- **URL Parameter Handling**: Secure parsing and validation of query parameters
- **Form State Management**: Complex form state with validation and error handling
- **OAuth Integration**: Frontend OAuth flow with proper redirect handling
- **Risk Level**: Medium - New frontend functionality with OAuth complexity

#### Access Code Security System (3 points)
- **Database Validation**: Secure code validation against pending requests
- **Security Implementation**: Prevent replay attacks and unauthorized access
- **Code Lifecycle**: Proper code expiration and consumption tracking
- **Risk Level**: Medium-High - Security-critical validation system

#### Google OAuth Implementation (8 points)
- **OAuth Provider Setup**: Complex third-party authentication integration
- **Supabase OAuth Config**: Integration with existing Supabase auth system
- **Token Management**: Secure OAuth token handling and session creation
- **Cross-Platform Support**: OAuth flow working across different environments
- **Error Scenarios**: Comprehensive OAuth error handling and fallbacks
- **Risk Level**: High - Third-party integration with authentication implications

#### Backend Integration (5 points)
- **API Extension**: Modify existing registration API for new access code flow
- **Database Operations**: Complex transactions for user, account, and code management
- **Session Integration**: Proper integration with existing authentication system
- **Account Creation**: Automatic default account setup with proper relationships
- **Risk Level**: Medium - Extensions to existing critical authentication systems

### Technical Challenges
1. **OAuth Integration Complexity**: Setting up and securing Google OAuth with Supabase
2. **Security Validation**: Ensuring access codes cannot be replayed or tampered with
3. **Database Transactions**: Atomic operations for user registration, account creation, and code consumption
4. **Error Handling**: Comprehensive error scenarios across multiple authentication methods
5. **URL Parameter Security**: Secure handling of sensitive data in URL parameters
6. **Session Management**: Proper session creation and authentication state management

### Implementation Priority
**High Priority** - Core user onboarding functionality that enables controlled user registration and account creation.

### Implementation Phases
1. **Phase 1**: Registration page frontend and basic form validation (3 points)
2. **Phase 2**: Access code validation system and API integration (4 points)
3. **Phase 3**: Google OAuth setup and integration (8 points)
4. **Phase 4**: Default account creation and final integration (6 points)

### Related Files Reference
- **New Registration System**:
  - `src/app/register/page.tsx` (new registration page)
  - `src/components/RegistrationForm.tsx` (new form component)
  - `src/components/GoogleOAuthButton.tsx` (new OAuth component)
  - `src/hooks/useRegistration.ts` (new registration hook)
- **API Endpoints**:
  - `src/app/api/auth/register/route.ts` (extend existing)
  - `src/app/api/auth/validate-code/route.ts` (new validation endpoint)
  - `src/app/api/auth/oauth/callback/route.ts` (new OAuth callback)
- **Authentication System**:
  - `src/lib/auth.ts` (extend registration functions)
  - `src/lib/supabase.ts` (OAuth configuration)
  - `src/contexts/AuthContext.tsx` (OAuth integration)
  - `src/lib/access-validation.ts` (new validation utilities)
- **Database Schema**:
  - Pending requests table updates for code tracking
  - Account creation integration
  - OAuth provider data storage
- **Configuration**:
  - Environment variables for Google OAuth credentials
  - Supabase OAuth provider configuration

### Technical Specifications
- **URL Format**: `/register?code=XXXXX&email=user@domain.com`
- **Authentication Methods**: Email/password and Google OAuth
- **Code Validation**: Server-side validation against pending requests
- **Account Creation**: Automatic default account with user as owner
- **Session Management**: Immediate login after successful registration
- **Security**: Access code consumption, replay prevention, secure token handling

---

## REQ-019: BUG FIX REQUEST - Registration Page Error Handling and User Experience Improvements
**Date**: August 7, 2025  
**Type**: Bug Fix Implementation  
**Complexity**: 13 Points (Medium-High Complexity)

### Request Summary
Fix critical user experience issues in the registration page including duplicate error displays, unclear error messages for already-registered users, and missing manual entry functionality for users without URL parameters. Additionally, add beta access link for users who need to request access codes.

### Detailed Requirements

#### 1. Error Message Consolidation and Improvement (5 points)
- **Issue**: Currently displays two error boxes for the same validation failure
- **Specific Problem**: Shows both "Validation failed: 409 Conflict" and "Registration Failed - Validation failed: 409 Conflict"
- **Fix Required**: Consolidate to single error display with user-friendly messaging
- **User-Friendly Error Messages**: 
  - Replace "409 Conflict" with "User already registered" 
  - Replace "404 Not Found" with "Invalid access code or email"
  - Replace technical error codes with clear, actionable messages
- **Files Affected**:
  - `src/app/register/RegistrationPageContent.tsx` (error state management)
  - `src/components/RegistrationForm.tsx` (error display logic)
  - `src/hooks/useRegistration.ts` (error message mapping)

#### 2. Manual Entry Mode Implementation (5 points)
- **Issue**: Page requires access code and email in URL parameters, no fallback for direct page access
- **Fix Required**: Detect missing URL parameters and provide manual entry interface
- **Manual Entry Features**:
  - Input fields for access code and email when not provided in URL
  - Client-side validation for manually entered codes
  - Same validation workflow as URL parameter flow
  - Seamless transition between URL and manual modes
- **Files Affected**:
  - `src/app/register/RegistrationPageContent.tsx` (manual entry mode detection)
  - `src/components/RegistrationForm.tsx` (manual input fields)
  - `src/components/AccessCodeInput.tsx` (new component for manual entry)
  - `src/hooks/useRegistration.ts` (manual entry validation logic)

#### 3. Beta Access Link Integration (1 point)
- **Issue**: Users who land on registration page without valid codes have no clear path to request access
- **Fix Required**: Add prominent link to beta access request page
- **Implementation**: Link to `http://localhost:3000/#beta` for users to request access codes
- **Placement**: Displayed when validation fails or in manual entry mode
- **Files Affected**:
  - `src/app/register/RegistrationPageContent.tsx` (beta link placement)
  - `src/components/RegistrationForm.tsx` (conditional beta link display)

#### 4. Enhanced Error State Management (2 points)
- **Issue**: Multiple error sources creating inconsistent error display states
- **Fix Required**: Unified error handling system with proper state management
- **Implementation**: Single error state with proper error type classification
- **Error Categories**: Validation errors, network errors, user-friendly messages
- **Files Affected**:
  - `src/hooks/useRegistration.ts` (unified error state)
  - `src/types/index.ts` (error type definitions)
  - `src/app/register/RegistrationPageContent.tsx` (error state integration)

### Complexity Analysis

#### Error Handling System Redesign (5 points)
- **Multiple Error Sources**: Registration validation, access code validation, network errors
- **State Management**: Complex error state coordination between multiple components
- **User Experience**: Converting technical errors to user-friendly messages
- **Error Classification**: Different error types requiring different UI treatments
- **Risk Level**: Medium - Changes to existing error flow across multiple components

#### Manual Entry Interface Development (5 points)
- **Conditional UI**: Dynamic interface based on URL parameter presence
- **Validation Integration**: Manual entry validation using existing validation infrastructure
- **State Transitions**: Seamless switching between URL-parameter and manual entry modes
- **Form State Management**: Complex form state with multiple input sources
- **User Experience**: Intuitive interface for users landing on page without parameters
- **Risk Level**: Medium - New UI functionality with existing validation integration

#### Integration and Testing (3 points)
- **Component Integration**: Changes across multiple registration components
- **Validation Workflow**: Ensure manual entry follows same security patterns as URL parameters
- **User Experience Testing**: Comprehensive testing of different user entry scenarios
- **Error Scenario Testing**: Validation of all error conditions with improved messaging
- **Risk Level**: Low-Medium - Integration testing and UX validation

### Technical Challenges
1. **Error State Complexity**: Managing multiple error sources with single display system
2. **UI State Management**: Dynamic interface based on entry method (URL vs manual)
3. **Validation Consistency**: Ensuring manual entry has same security as URL parameters
4. **User Experience**: Clear error messages without revealing security details
5. **Component Coordination**: Multiple components need to work together seamlessly

### Implementation Priority
**High Priority** - Significant user experience issues that prevent effective user registration and create confusion for users trying to access the system.

### Current Issues Evidence
- **Duplicate Errors**: Two error boxes showing identical "409 Conflict" messages
- **Technical Error Codes**: "409 Conflict", "404 Not Found" exposed to end users
- **No Manual Entry**: Users can't enter codes if they don't have URL parameters
- **No Access Path**: Users without codes have no clear way to request access
- **Poor UX**: Confusing error messages that don't guide users to solutions

### Related Files Reference
- **Primary Components**:
  - `src/app/register/RegistrationPageContent.tsx` (main registration page logic)
  - `src/components/RegistrationForm.tsx` (registration form component)
  - `src/hooks/useRegistration.ts` (registration business logic)
- **New Components**:
  - `src/components/AccessCodeInput.tsx` (new manual entry component)
- **Type Definitions**:
  - `src/types/index.ts` (error type definitions, registration interfaces)
- **Validation System**:
  - `src/app/api/auth/validate-code/route.ts` (validation endpoint)
  - `src/lib/access-validation.ts` (validation utilities)
- **Integration Points**:
  - Beta access page at `http://localhost:3000/#beta`
  - Access request system from REQ-016/REQ-018

### Expected User Experience Improvements
1. **Single, Clear Errors**: One error message with actionable information
2. **User-Friendly Language**: "User already registered" instead of "409 Conflict"
3. **Manual Entry Option**: Users can enter codes directly if not in URL
4. **Clear Next Steps**: Beta access link when users need to request access
5. **Consistent Interface**: Seamless experience regardless of entry method

---

## REQ-020: BUG FIX REQUEST - OAuth Registration PKCE Flow Implementation for Client-Side Registration
**Date**: August 8, 2025  
**Type**: Bug Fix Implementation (Critical)  
**Complexity**: 8 Points (Medium-High Complexity)

### Request Summary
Fix critical OAuth registration bug where Google OAuth authentication succeeds but server-side code exchange fails due to PKCE (Proof Key for Code Exchange) flow violations. Currently, users complete OAuth authentication successfully but registration fails at server-side code exchange with "invalid request: both auth code and code verifier should be non-empty" errors. Implement client-side OAuth registration flow that respects PKCE security model.

### Detailed Requirements

#### 1. OAuth Callback Simplification (3 points)
- **Issue**: Server-side `exchangeCodeForSession()` fails because PKCE code verifier is client-side only
- **Root Cause**: Server trying to exchange OAuth code without access to client-generated PKCE verifier
- **Fix Required**: Remove server-side code exchange, redirect to client for proper PKCE flow handling
- **Files Affected**:
  - `src/app/auth/oauth/callback/route.ts` (remove 100+ lines of broken server-side registration)
  - OAuth callback should only redirect with success parameters, not attempt registration

#### 2. Client-Side OAuth Registration Handler (2 points)  
- **Issue**: No client-side mechanism to detect OAuth completion and trigger registration
- **Fix Required**: Add OAuth success detection and registration completion on client-side
- **Implementation**: `useEffect` hook to detect OAuth success and call authenticated registration API
- **Files Affected**:
  - `src/app/register/RegistrationPageContent.tsx` (OAuth success detection logic)
  - Entry mode detection to handle OAuth success parameters
  - State management for OAuth completion flow

#### 3. Authenticated Registration API Endpoint (2 points)
- **Issue**: No API endpoint for authenticated users to complete registration
- **Fix Required**: Create new API endpoint that accepts authenticated session for registration
- **Implementation**: Use existing registration logic but with session-based auth instead of password
- **Files Affected**:
  - `src/app/api/auth/complete-oauth-registration/route.ts` (new authenticated registration endpoint)
  - Reuse existing `createUser`, `createDefaultAccount`, `linkUserToAccount` functions
  - Session validation and user creation with OAuth metadata

#### 4. Registration Success Flow Integration (1 point)
- **Issue**: OAuth registration has no proper success/redirect flow
- **Fix Required**: Integrate OAuth registration with existing success page and redirects
- **Implementation**: Redirect to `/register/success` after successful OAuth registration
- **Files Affected**:
  - `src/app/register/success/page.tsx` (OAuth success messaging)
  - Registration completion state management
  - Success page integration with OAuth-specific messaging

### Complexity Analysis

#### OAuth Architecture Restructuring (3 points)
- **Server-Side Removal**: Safely removing 100+ lines of broken OAuth code
- **PKCE Compliance**: Ensuring proper PKCE flow respect without breaking security
- **Redirect Flow**: Correct OAuth callback → client detection → registration completion flow
- **Risk Level**: Medium - Architectural change to OAuth handling

#### Client-Side OAuth Detection (2 points)
- **Async Flow Management**: Complex OAuth success detection and registration triggering
- **State Management**: OAuth state vs registration state coordination
- **Error Handling**: Multiple failure points in OAuth → registration chain
- **Risk Level**: Medium - New async flow with multiple components

#### Authenticated API Development (2 points)
- **Session-Based Auth**: API endpoint that validates authenticated sessions
- **Registration Logic Reuse**: Leverage existing registration infrastructure
- **Error Handling**: Session validation and registration failure scenarios
- **Risk Level**: Low-Medium - New endpoint using existing proven logic

#### Integration Testing (1 point)
- **End-to-End Testing**: Complete OAuth flow from registration page to success
- **Multiple Email Testing**: Different Gmail accounts and OAuth scenarios
- **Database Verification**: Ensure complete user/account creation
- **Risk Level**: Low - Testing and validation of implemented solution

### Technical Challenges
1. **PKCE Security Model**: Respecting OAuth security without compromising registration flow
2. **Async State Management**: Coordinating OAuth completion with registration process
3. **Error Handling**: Multiple failure points across OAuth → detection → API → success chain
4. **Session Validation**: Ensuring authenticated API endpoint security
5. **Existing Flow Preservation**: Not breaking current email/password registration

### Implementation Priority
**Critical Priority** - OAuth registration is completely non-functional, blocking Google-authenticated user registration entirely.

### Current Bug Evidence
- **OAuth Authentication**: ✅ Works - users successfully authenticate via Google
- **Server-Side Code Exchange**: ❌ Fails - "invalid request: both auth code and code verifier should be non-empty"
- **User Registration**: ❌ Fails - no user created in application `users` table  
- **Access Request Completion**: ❌ Fails - `registration_date` remains `null`
- **User Impact**: Complete inability to register via Google OAuth despite successful authentication

### Database Evidence
- **Auth Users Table**: ✅ User created (OAuth authentication works)
- **Application Users Table**: ❌ Empty (registration fails)
- **Access Requests Table**: ❌ `registration_date: null` (registration incomplete)
- **Accounts Table**: ❌ No default account created

### Architecture Solution
**Current (Broken)**:
```
OAuth → Server Code Exchange → Server Registration → Success
         ↑ FAILS HERE due to PKCE
```

**Fixed (Client-Side)**:
```
OAuth → Client Detection → Authenticated API → Success
        ↑ Respects PKCE   ↑ Uses session    ↑ Complete registration
```

### Related Files Reference
- **OAuth Callback**: `src/app/auth/oauth/callback/route.ts` (simplify, remove server-side registration)
- **Registration Page**: `src/app/register/RegistrationPageContent.tsx` (OAuth detection logic)
- **New API Endpoint**: `src/app/api/auth/complete-oauth-registration/route.ts` (new authenticated registration)
- **Success Page**: `src/app/register/success/page.tsx` (OAuth success integration)
- **Registration Logic**: `src/lib/auth.ts` (reuse existing functions)
- **Access Validation**: `src/lib/access-validation.ts` (reuse validation logic)
- **Types**: `src/types/index.ts` (OAuth registration types)

### Technical Specifications
- **OAuth Flow**: Google OAuth → Supabase PKCE → Client detection → Authenticated registration
- **Authentication**: Session-based validation for registration API
- **Registration**: Complete user/account creation using existing proven logic
- **Success Flow**: Redirect to `/register/success` with OAuth-specific messaging
- **Error Handling**: Comprehensive error scenarios across entire OAuth registration chain

---

## REQ-021: BUG FIX REQUEST - Complete OAuth Registration Flow with Automatic Login
**Date**: August 9, 2025  
**Type**: Bug Fix Implementation (Critical)  
**Complexity**: 6 Points (Medium Complexity)

### Request Summary
Fix critical gaps in OAuth registration flow where users successfully authenticate via Google OAuth and user accounts are created in Supabase auth.users, but the client-side registration completion fails to trigger and users are forced to manually log in again after registration. Implement automatic OAuth success detection, registration completion, and seamless login flow.

### Detailed Requirements

#### 1. OAuth Success Handler Debug and Fix (2 points)
- **Issue**: OAuth success `useEffect` in `RegistrationPageContent.tsx` not triggering despite `oauth_success=true` URL parameter
- **Root Cause**: User/session context missing or timing issues after OAuth redirect
- **Fix Required**: Debug and fix OAuth success detection conditions and session availability
- **Files Affected**:
  - `src/app/register/RegistrationPageContent.tsx` (OAuth success handler useEffect)
  - OAuth success detection logging and debugging
  - Session timing and availability issues

#### 2. Automatic Login Implementation (3 points)
- **Issue**: After successful OAuth registration, users are redirected to success page requiring manual login
- **Root Cause**: Registration success flow doesn't maintain OAuth session for automatic login
- **Fix Required**: Modify success flow to automatically log user into dashboard instead of requiring re-authentication
- **Files Affected**:
  - `src/app/register/RegistrationPageContent.tsx` (success handling after registration)
  - `src/app/register/success/page.tsx` (remove manual login requirement)
  - Authentication state persistence through registration flow

#### 3. End-to-End Flow Testing and Verification (1 point)
- **Issue**: Complete OAuth registration flow not verified from start to finish
- **Fix Required**: Comprehensive testing using Playwright MCP and database verification
- **Implementation**: Verify user registration AND automatic login to admin dashboard
- **Files Affected**:
  - End-to-end testing validation
  - Database state verification via Supabase MCP
  - Complete user journey testing

### Complexity Analysis

#### OAuth Session Timing Issues (2 points)
- **React Component Lifecycle**: Debug useEffect conditions and dependency timing
- **Session Availability**: Ensure user/session context available after OAuth redirect
- **Client-Side State Management**: Fix missing user/session state in component
- **Risk Level**: Low-Medium - Client-side React debugging and timing fixes

#### Authentication Flow Redesign (3 points)
- **Session Persistence**: Maintain OAuth authentication through registration completion
- **Automatic Login**: Replace manual login requirement with seamless authentication
- **State Management**: Ensure authentication state persists from OAuth through registration to dashboard
- **User Experience**: Complete registration → automatic login → dashboard access flow
- **Risk Level**: Medium - Changes to authentication flow and user journey

#### Testing and Validation (1 point)
- **End-to-End Testing**: Complete OAuth flow testing with Playwright MCP
- **Database Verification**: Confirm user creation, account linking, and access code consumption
- **User Journey Validation**: Verify seamless experience from OAuth to dashboard
- **Risk Level**: Low - Testing and validation of implemented solution

### Technical Challenges
1. **React State Timing**: OAuth redirect causing user/session state to be unavailable in useEffect
2. **Authentication Persistence**: Maintaining OAuth session through multi-step registration process
3. **User Experience**: Seamless flow without manual intervention after successful OAuth
4. **Session Management**: Proper authentication state from OAuth completion to dashboard access

### Implementation Priority
**Critical Priority** - OAuth registration appears to work but fails to complete, and successful registrations require manual re-authentication, breaking user experience.

### Current Evidence of Issues
- **OAuth Authentication**: ✅ Working - users authenticate successfully via Google
- **Registration API**: ✅ Working - `/api/auth/complete-oauth-registration` responds correctly
- **Client-Side Detection**: ❌ Failing - OAuth success handler not triggering
- **Database Creation**: ❌ Incomplete - users not created in application users table
- **Automatic Login**: ❌ Missing - users forced to manually log in after registration
- **User Experience**: ❌ Broken - successful OAuth redirects to manual login requirement

### Browser Evidence
- **URL Parameters**: `oauth_success=true&accessCode=...&email=...` present in registration page URL
- **Console Logs**: No `OAUTH_SUCCESS_HANDLER` logs indicating useEffect not triggering
- **Page State**: Shows "Manual Registration Entry" form instead of automatic completion
- **User Context**: `hasUser: false` indicating missing authentication context
- **Database State**: User exists in `auth.users` but not in application `users` table

### Expected vs Actual Flow
- **Expected**: OAuth → Registration → Automatic Login → Dashboard
- **Actual**: OAuth → Manual Registration Form → Manual Login Required
- **Gap**: Client-side OAuth success detection and automatic completion not working

### Related Files Reference
- **OAuth Success Detection**: `src/app/register/RegistrationPageContent.tsx` (OAuth success useEffect handler)
- **Registration API**: `src/app/api/auth/complete-oauth-registration/route.ts` (working registration endpoint)
- **Success Page**: `src/app/register/success/page.tsx` (currently requires manual login)
- **Auth Context**: `src/contexts/AuthContext.tsx` (user/session state management)
- **OAuth Button**: `src/components/GoogleOAuthButton.tsx` (OAuth initiation)
- **OAuth Callback**: `src/app/auth/oauth/callback/route.ts` (redirect handling)

### Technical Specifications
- **OAuth Detection**: Fix `oauth_success=true` parameter detection and useEffect triggering
- **Session Context**: Ensure authenticated user/session available in React component after OAuth redirect
- **Automatic Registration**: Trigger `/api/auth/complete-oauth-registration` automatically when conditions met
- **Seamless Login**: Direct redirect to admin dashboard after successful registration
- **Error Handling**: Comprehensive error scenarios with user-friendly messaging

---

## REQ-022: Admin Routes Reorganization and KPI Dashboard Implementation

**Date:** September 2, 2025  
**Type:** Feature Enhancement  
**Complexity Points:** 8/10  

### Request Summary
Reorganize admin routing structure and implement KPI dashboard:

1. **Remove redundant route** `http://localhost:3000/admin/items` since it does little more than what `http://localhost:3000/admin` already does
2. **Replace** `/admin/items` functionality with what's currently displayed under `/admin`
3. **Transform** `/admin` into KPI dashboard displaying:
   - Number of properties and number of views
   - List of users with access to current user's account
   - List of accounts that current user has access to (and associated users)

### Key Files Involved
- `/src/app/admin/page.tsx` - Main admin dashboard (to be converted to KPI dashboard)
- `/src/app/admin/items/page.tsx` - Items route (to be removed/replaced)
- Related admin components and API routes for KPI data
- Database queries for user access relationships and property/view metrics

### Brief Analysis
**Complexity: Medium-High (8/10 points)**

Technical considerations:
- Route restructuring and content migration between admin pages
- Database queries for user access relationships and account metrics  
- KPI dashboard UI/UX implementation with metrics visualization
- Preserving existing admin functionality during reorganization
- Understanding current admin route functionality and relationships
- User permission system analysis for account access data
- Metrics calculation implementation for properties and views
- Dashboard design and data presentation components

Main complexity factors:
1. Understanding current admin route functionality and what content needs migration
2. Database relationship analysis for user permissions and account access
3. Metrics calculation and aggregation for KPI display
4. Dashboard design with proper data visualization
5. Ensuring no functionality is lost during route reorganization

---

## REQ-023: Unified Route Architecture Implementation - Eliminate Admin/User Route Duplication

**Date:** September 3, 2025  
**Type:** Architecture Enhancement  
**Complexity Points:** 12/15  

### Request Summary
Implement a unified route architecture to eliminate code duplication between `/admin` and `/user` routes that currently perform identical functions but cause maintenance overhead and inconsistency when changes in one route set are not reflected in the other.

### Problem Analysis
Currently the system has two parallel route sets:
- **Admin Routes**: `/admin`, `/admin/items`, `/admin/properties`, `/admin/analytics`
- **User Routes**: `/user`, `/user/items`, `/user/properties`, `/user/analytics`

**Issues Identified:**
1. **Code Duplication**: Both route sets perform nearly identical functions with minimal differences
2. **Maintenance Overhead**: Changes in admin routes not automatically reflected in user routes
3. **API Inconsistency**: Both route sets call the same `/api/admin/*` endpoints
4. **Authorization Logic**: Server-side APIs already handle role-based filtering
5. **UI Redundancy**: User routes have almost identical UI components to admin routes

### Detailed Requirements

#### 1. Unified Dashboard Route Structure (5 points)
- **Create New Structure**: Replace both `/admin` and `/user` with unified `/dashboard/*` routes
- **Adaptive Interface**: Single codebase that adapts based on user permissions  
- **Route Migration**: 
  - `/dashboard` (replaces both `/admin` and `/user`)
  - `/dashboard/items` (replaces `/admin/items` and `/user/items`)
  - `/dashboard/properties` (replaces `/admin/properties` and `/user/properties`)
  - `/dashboard/analytics` (replaces `/admin/analytics` and `/user/analytics`)
- **Files Affected**:
  - `src/app/dashboard/` (new unified route directory)
  - `src/app/dashboard/items/page.tsx` (new unified items management)
  - `src/app/dashboard/properties/page.tsx` (new unified properties management)
  - `src/app/dashboard/analytics/page.tsx` (new unified analytics)
  - `src/app/dashboard/layout.tsx` (new unified layout with role-based navigation)

#### 2. Role-Based UI Adaptation (4 points)
- **Conditional Rendering**: Components adapt UI elements based on user role (admin vs user)
- **Permission-Based Features**: Show/hide features based on user permissions
- **Navigation Adaptation**: Dynamic navigation menu based on user role
- **Admin-Only Features**: Preserve admin-only functionality (system settings, user management)
- **Files Affected**:
  - `src/components/DashboardLayout.tsx` (new unified layout component)
  - `src/components/RoleBasedNavigation.tsx` (new adaptive navigation)
  - `src/components/UnifiedItemsManager.tsx` (new unified items component)
  - `src/components/UnifiedPropertiesManager.tsx` (new unified properties component)
  - `src/lib/permissions.ts` (new role-based permission utilities)

#### 3. Legacy Route Redirects and Cleanup (2 points)
- **Redirect Implementation**: Automatic redirects from old routes to new unified routes
- **Preserve Bookmarks**: Ensure existing bookmarks continue to work
- **Clean Migration**: Remove duplicate code from admin/user routes
- **Files Affected**:
  - `src/app/admin/page.tsx` (redirect to `/dashboard`)
  - `src/app/user/page.tsx` (redirect to `/dashboard`)
  - `src/middleware.ts` (redirect logic for old routes)
  - Remove duplicate components and pages

#### 4. Admin-Only System Routes (1 point)
- **Preserve Admin Functions**: Keep admin-only features in separate `/admin/system` area
- **System Management**: User management, system settings, back office functions
- **Clear Separation**: Admin system functions vs regular dashboard functions
- **Files Affected**:
  - `src/app/admin/system/` (new admin-only system management)
  - `src/app/admin/back-office/page.tsx` (move to system area)
  - Admin-only navigation and access control

### Complexity Analysis

#### Architecture Transformation (5 points)
- **Route Restructuring**: Complete reorganization of application routing structure
- **Component Migration**: Moving and merging functionality from two separate route trees
- **State Management**: Ensuring unified state management across role-based interfaces
- **Navigation Logic**: Complex adaptive navigation based on user permissions
- **Risk Level**: Medium-High - Major architectural change affecting core navigation

#### Role-Based UI System (4 points)
- **Conditional Rendering**: Complex component logic based on user roles and permissions
- **Permission Management**: Sophisticated role-based feature access control
- **Component Reusability**: Single components serving multiple user types with different capabilities
- **UI/UX Consistency**: Maintaining intuitive interface across different permission levels
- **Risk Level**: Medium - New permission-based UI patterns

#### Migration and Compatibility (2 points)
- **Redirect Management**: Ensuring seamless transition from old to new routes
- **Bookmark Preservation**: Maintaining user bookmarks and external links
- **Code Cleanup**: Safe removal of duplicate components and routes
- **Risk Level**: Low-Medium - Migration planning and execution

#### Testing and Validation (1 point)
- **Cross-Role Testing**: Validating interface behavior for different user types
- **Permission Testing**: Ensuring proper access control and feature visibility
- **Navigation Testing**: Verifying redirect logic and route transitions
- **Risk Level**: Low - Comprehensive testing of new unified system

### Technical Challenges
1. **Component Unification**: Merging similar but slightly different admin/user components
2. **Permission Granularity**: Implementing precise role-based feature control
3. **State Management**: Managing role context throughout unified application
4. **Navigation Complexity**: Dynamic navigation adapting to user permissions
5. **Migration Safety**: Ensuring no functionality is lost during unification
6. **Performance**: Single components handling multiple role scenarios efficiently

### Implementation Priority
**High Priority** - Eliminates significant technical debt and maintenance overhead while improving code quality and development velocity.

### Key Benefits
1. **Single Source of Truth**: One codebase for all user interfaces
2. **Automatic Consistency**: Changes apply to all users automatically
3. **Reduced Maintenance**: No more duplicate code to maintain
4. **Future Scalability**: Easier to add new roles or features
5. **Code Quality**: DRY principles and better architecture

### Implementation Phases
1. **Phase 1**: Create unified dashboard structure and basic role detection (3 points)
2. **Phase 2**: Implement role-based UI adaptation and components (6 points)
3. **Phase 3**: Set up legacy redirects and admin-only system area (2 points)
4. **Phase 4**: Testing, cleanup, and documentation (1 point)

### Related Files Reference
#### Current Duplicate Routes:
- **Admin Routes**: `src/app/admin/` (items, properties, analytics pages)
- **User Routes**: `src/app/user/` (items, properties, analytics pages)
- **Shared APIs**: `src/app/api/admin/` (already handles role-based filtering)

#### New Unified Structure:
- **Dashboard Routes**: `src/app/dashboard/` (new unified interface)
- **Unified Components**: `src/components/Unified*.tsx` (new role-adaptive components)
- **Permission System**: `src/lib/permissions.ts` (new role management)
- **Unified Layout**: `src/app/dashboard/layout.tsx` (new adaptive layout)

#### Authentication & Context:
- **Auth Context**: `src/contexts/AuthContext.tsx` (role detection and management)
- **Middleware**: `src/middleware.ts` (route protection and redirects)
- **Permission Utilities**: `src/lib/auth.ts` (role-based access control)

#### API Integration:
- **Existing APIs**: `src/app/api/admin/` (already role-aware, no changes needed)
- **Authentication**: `src/lib/supabase.ts` (existing role validation)

### Technical Specifications
- **Route Structure**: `/dashboard/*` replaces both `/admin/*` and `/user/*`
- **Role Detection**: Based on existing authentication system and database flags
- **Permission Model**: Feature-level permissions within unified interface
- **Admin System**: Separate `/admin/system/*` for admin-only functions
- **Redirect Strategy**: 301 redirects from legacy routes to new unified routes
- **Component Pattern**: Single components with role-based conditional rendering

---

## REQ-024: BUG FIX REQUEST - AuthContext Account Role Integration and Current Account State Management

**Date**: September 3, 2025  
**Type**: BUG FIX REQUEST  
**Complexity Points**: 8/15  
**Reference**: `docs/req-024-AuthContext-Account-Role-Integration-Overview.md`

### Request Summary
Fix critical AuthContext bug where `currentAccount` state is not properly loaded with user's account role information, resulting in permission system failures. Users cannot access features they should have permissions for because the AuthContext is not fetching and storing the user's role within their account from the `account_users` table.

### Problem Analysis
Current state analysis reveals:

1. **AuthContext State Issue**: `currentAccount` is being loaded but without the user's role in that account
2. **getAccountRole Function**: Returns `null` because it cannot determine user's role in current account
3. **Permission System Failure**: `usePermissions` hook receives `undefined` account role, defaulting to basic user permissions (4 permissions instead of expected 13+ permissions for account owners)
4. **Database Relationship Missing**: User's role from `account_users` table is not being fetched and integrated into AuthContext

### Console Evidence
```
🔐 PERMISSIONS_HOOK_DEBUG: CONTEXT_CHANGED_LOADING_PERMISSIONS {
  userId: "122ae2c2-1236-4347-95fa-1c6a0f89201e",
  accountId: undefined,           // ❌ Should be account ID
  accountRole: undefined          // ❌ Should be "owner"
}
```

### Database Evidence
User `raphajunk@outlook.com` exists with proper account relationship:
- `account_role: "owner"` in `account_users` table
- `account_id: "cceeca1b-2f0b-4a23-89ba-8daf980b26a6"`
- `account_name: "Default Account"`

### Expected Behavior
After fix, the AuthContext should:
1. Fetch user's account role from `account_users` table during authentication
2. Store account role information in `currentAccount` state
3. Pass proper account role to permission system
4. Display full permissions for account owners (create/edit/delete properties, items, etc.)

### Technical Impact
- **Priority**: HIGH - Users cannot access core application features
- **Affected Components**: AuthContext, permission system, all dashboard pages
- **Database Tables**: `account_users`, `accounts`, `users`
- **Files Impacted**: AuthContext.tsx, auth.ts, usePermissions hook, dashboard pages

---

## REQ-025: BUG FIX REQUEST - Sequential Authentication State Machine Implementation

**Date:** September 7, 2025
**Type:** BUG FIX REQUEST - Architecture Refactor
**Complexity:** 15-18 Points (High Complexity)
**Status:** REQUESTED

### Request Summary
Replace the current concurrent race-condition prone authentication flows with a sequential state machine approach that eliminates state management failures while maintaining all existing functionality.

### Problem Analysis

#### Current Issue
The authentication system currently uses 9 concurrent flows that compete for React state, causing:
- Race conditions between multiple auth flows
- State update failures in React's concurrent rendering
- Permission system failures due to undefined account state
- Complex dependency chains causing cascading failures

#### Root Cause Analysis
1. **Concurrent Flow Competition**: 9 auth flows running simultaneously compete for state
2. **React State Management Limits**: React's batching causes state updates to be lost
3. **Dependency Chain Complexity**: useEffect dependencies become stale with concurrent updates
4. **Global State Corruption**: Multiple AuthContext instances interfere with each other

### Detailed Requirements

#### 1. Sequential State Machine Architecture (6 points)
- **Replace 9 concurrent flows** with single state machine
- **Clear state transitions**: UNAUTHORIZED → LOADING → AUTHENTICATED → ERROR
- **Atomic state updates**: Single state object instead of multiple setState calls
- **Sequential execution**: Each auth step completes before the next begins
- **Files Affected**:
  - `src/contexts/AuthContext.tsx` (complete refactor)
  - `src/hooks/usePermissions.ts` (simplified dependency management)
  - `src/lib/auth.ts` (single auth orchestrator function)

#### 2. Authentication Orchestrator (4 points)
- **Single entry point**: One function handles all auth scenarios
- **Sequential flow control**: Check session → OAuth detection → login form
- **State machine integration**: Clear transitions between auth states
- **Error handling**: Proper error recovery without race conditions
- **Files Affected**:
  - `src/lib/auth.ts` (new `authenticateUser()` orchestrator)
  - `src/contexts/AuthContext.tsx` (state machine implementation)

#### 3. Backward Compatibility Preservation (3 points)
- **Public item access**: Maintain QR code functionality for anonymous users
- **Existing URLs**: Keep `/item/[publicId]` routes working without auth
- **Gradual enhancement**: Add features only for authenticated users
- **Files Affected**:
  - `src/app/item/[publicId]/page.tsx` (ensure public access)
  - `src/app/api/items/[publicId]/route.ts` (maintain API compatibility)

#### 4. Permission System Simplification (2 points)
- **Stable state input**: Permissions calculated from stable state machine
- **No race conditions**: Sequential permission loading
- **Clear dependencies**: Simplified useEffect dependency arrays
- **Files Affected**:
  - `src/hooks/usePermissions.ts` (remove complex dependency chains)
  - `src/lib/permissions.ts` (stable permission calculation)

### Complexity Analysis

#### Technical Complexity Factors (15-18 points)

##### Architecture Refactor (6 points)
- **State Machine Design**: Complex state transition logic and error handling
- **Concurrent to Sequential**: Major paradigm shift in auth flow design
- **Atomic State Updates**: Replace multiple setState calls with single updates
- **Global State Management**: Coordinate between AuthContext and permission hooks
- **High Risk**: Core authentication system changes affect entire application

##### Authentication Flow Reorganization (4 points)
- **Multiple Entry Points**: Handle direct login, OAuth callbacks, session restoration
- **State Persistence**: Maintain auth state across page refreshes
- **Error Recovery**: Proper error handling without state corruption
- **Integration Testing**: Ensure all auth paths work correctly
- **Medium-High Risk**: Authentication system is critical to application functionality

##### Backward Compatibility (3 points)
- **Public Access Preservation**: Ensure QR codes continue working
- **URL Structure Maintenance**: Keep existing `/item/*` routes functional
- **Anonymous User Support**: Maintain read-only access for non-logged users
- **Low-Medium Risk**: Changes are additive, not destructive

##### Permission System Stabilization (2 points)
- **Dependency Simplification**: Remove complex useEffect chains
- **State Stability**: Calculate permissions from reliable state source
- **Race Condition Elimination**: Sequential permission loading
- **Low Risk**: Permission system improvements are isolated

### Implementation Plan

#### Phase 1: State Machine Foundation (4 points)
1. Define clear auth states and transitions
2. Create authentication orchestrator function
3. Implement atomic state update mechanism
4. Add comprehensive logging for debugging

#### Phase 2: Sequential Flow Conversion (6 points)
1. Convert concurrent useEffect hooks to state machine
2. Replace race-condition logic with sequential steps
3. Implement proper error handling and recovery
4. Test auth state persistence and restoration

#### Phase 3: Integration and Testing (5 points)
1. Ensure backward compatibility with QR codes
2. Verify permission system works with stable state
3. Test all authentication entry points
4. Performance testing for sequential vs concurrent flows

### Files Affected
- **Core Authentication**:
  - `src/contexts/AuthContext.tsx` (major refactor)
  - `src/lib/auth.ts` (new orchestrator function)
- **Permission System**:
  - `src/hooks/usePermissions.ts` (simplified dependencies)
  - `src/lib/permissions.ts` (stable calculation)
- **Public Access**:
  - `src/app/item/[publicId]/page.tsx` (backward compatibility)
  - `src/app/api/items/[publicId]/route.ts` (public API)
- **Dashboard Integration**:
  - `src/app/dashboard/properties/page.tsx` (permission integration)
  - `src/app/dashboard/layout.tsx` (role-based navigation)

### Expected Benefits
✅ **Eliminates Race Conditions**: No concurrent flows competing for state
✅ **Stable State Management**: Predictable React state updates
✅ **Better Error Handling**: Clear error recovery paths
✅ **Improved Performance**: Reduced re-renders and state conflicts
✅ **Easier Maintenance**: Single state machine instead of 9 concurrent flows
✅ **Same Functionality**: All business requirements maintained

### Risk Assessment
- **High Risk**: Core authentication system changes
- **Medium Impact**: May require UI adjustments for permission handling
- **Low Downtime**: Sequential implementation allows gradual rollout
- **High Benefit**: Eliminates fundamental state management issues

---

## REQ-026: UI Enhancement - Relocate Print QR Codes Button
**Date**: September 10, 2025  
**Type**: UI Enhancement  
**Complexity**: 2 Points (Simple UI Reorganization)

### Request Summary
Relocate the "Print QR Codes" button from the QR Code Management section to the top right header area of the property detail page, replacing the redundant email display.

### Detailed Requirements

#### 1. Remove Redundant Email Display
- Remove email display from top right of property detail page header
- Keep existing email display in top left area
- **File**: `src/app/dashboard/properties/[propertyId]/page.tsx`

#### 2. Remove QR Code Management Section
- Remove entire "QR Code Management" section from property information area
- Remove associated description text: "Generate and print QR codes for all items in this property"
- Remove item count text: "X items available for QR codes"
- **File**: `src/app/dashboard/properties/[propertyId]/page.tsx`

#### 3. Relocate Print QR Codes Button
- Move "Print QR Codes" button to top right header area
- Maintain current action button styling (blue background, white text, printer icon)
- Preserve existing functionality and event handlers
- **File**: `src/app/dashboard/properties/[propertyId]/page.tsx`

### Files Affected
- **Primary**: `src/app/dashboard/properties/[propertyId]/page.tsx`
  - Header section reorganization
  - QR Code Management section removal
  - Button relocation and styling preservation

### Current Implementation Status
- ✅ QR print functionality already working
- ✅ Button event handlers implemented
- ✅ QR print page and manager functional
- 🔄 Only UI reorganization needed

### Complexity Analysis

#### Low Complexity Factors (2 points total)
##### UI Element Relocation (1 point)
- **Simple DOM Reorganization**: Moving existing button element to different container
- **Preserved Functionality**: No changes to event handlers or logic
- **Maintained Styling**: Keep existing button appearance
- **Low Risk**: Purely presentational change

##### Section Removal (1 point)
- **Clean Code Removal**: Delete unused QR Code Management section
- **No Dependency Impact**: Other components unaffected
- **Simplified UI**: Cleaner interface with better button placement
- **Low Risk**: Removing redundant elements

### Implementation Plan

#### Phase 1: Header Reorganization (1 point)
1. Locate current email display in header
2. Replace with Print QR Codes button
3. Ensure proper styling and positioning
4. Test button accessibility in new location

#### Phase 2: Section Cleanup (1 point)
1. Remove QR Code Management section from property information
2. Remove associated text and item counts
3. Verify clean removal without broken layouts
4. Test overall page appearance

### Expected Benefits
✅ **Cleaner UI**: Remove redundant email display  
✅ **Better Accessibility**: QR print function in prominent header location  
✅ **Improved UX**: Quicker access to print functionality  
✅ **Consistent Design**: Better button placement following UI patterns  

### Risk Assessment
- **Low Risk**: Simple UI reorganization with no logic changes
- **Low Impact**: Purely visual improvement
- **No Downtime**: Safe to implement without functionality disruption
- **High Benefit**: Improved user experience and interface clarity

---

## REQ-027: BUG FIX REQUEST - Browser Print Including UI Elements

**Date**: September 2025  
**Points**: 5  
**Type**: Bug Fix  
**Status**: Pending

### Problem Description
When using the "Print QR Codes" button, the browser prints the entire page including UI elements instead of just the QR codes, leading to wasted ink and unprofessional output.

### Current Implementation
**Files**:
- `src/components/QRCodePrintManager.tsx` - Contains print trigger using `window.print()`
- `src/components/QRCodePrintPreview.tsx` - Print preview and handling
- `src/styles/print.css` - Current print-specific styles

### Proposed Solution
Create a dedicated print route (`/print/qr-codes/[propertyId]`) that:
1. Only renders printable content
2. Has no UI elements
3. Auto-triggers print
4. Handles window management

### Complexity Analysis
**Technical Complexity**: Medium
- Route implementation
- Window management
- State preservation
- Print event handling

**Points Breakdown**:
- Route & Component: 2 points
- Window Management: 1 point
- Print Optimization: 1 point
- Testing: 1 point
Total: 5 points

### Success Criteria
1. Only QR codes and labels in print
2. No UI elements
3. Automatic print triggering
4. Clean window management
5. Cross-browser compatibility

*Next Request: REQ-028* 
---

## REQ-028: Bundle Size Impact Analysis for Media Processing Dependencies

**Date**: 2025-12-30 00:00
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should validate that new media processing dependencies do not exceed bundle size performance targets before implementing the item capture workflow.

### Current Behavior
The application does not yet include dependencies for PDF thumbnail generation, image cropping, or markdown rendering. No baseline measurement exists for how these libraries will impact bundle size and initial load time.

### Expected Behavior
Before implementing the item capture component, the system should:
- Measure the bundle size impact of adding PDF processing, image cropping, and markdown rendering capabilities
- Verify that lazy loading strategies prevent large libraries from blocking initial page load
- Confirm that the total bundle size for the item capture workflow remains under performance targets
- Document baseline metrics and chunk sizes for future reference

### User Impact
End users will experience fast initial page loads (under 2 seconds) even after new media processing features are added. Users uploading PDFs will see thumbnails load quickly without affecting the experience of users who never upload PDFs.

### Business Value
Prevents performance regressions before they reach production. Identifies optimization strategies early in the development cycle, reducing the risk of costly refactoring later.

### Acceptance Criteria
- [ ] Dependencies for PDF processing, image cropping, and markdown rendering are installed
- [ ] Production build analysis shows item capture workflow bundle is under 500KB (excluding lazily-loaded PDF processing)
- [ ] PDF processing library loads only when a user uploads a PDF file, not on initial page load
- [ ] Initial page load time remains under 2 seconds with new dependencies included
- [ ] Bundle analysis report documents chunk sizes and lazy loading behavior for all new dependencies

---

## REQ-029: iOS Safari MediaRecorder API Compatibility Validation

**Date**: 2025-12-30 (Spike Work)
**Type**: TECHNICAL SPIKE
**Size**: S

### Summary
Validate that the MediaRecorder API works reliably on iOS Safari (versions 15+) before implementing video recording features for mobile property item documentation.

### Current Behavior
The system does not currently support video recording for documenting property items. Before implementing this feature, iOS Safari compatibility must be verified, as this browser has known inconsistencies with the MediaRecorder API.

### Expected Behavior
After completing this spike:
- Development team has documented evidence that MediaRecorder works (or doesn't work) on iOS Safari 15, 16, and 17
- Documented list of working codec and container combinations for iOS devices
- Documented permission flows and any iOS-specific quirks
- Clear recommendation on whether to proceed with MediaRecorder-based implementation or plan alternative approaches

### User Impact
This spike directly impacts mobile users (iPhone and iPad) who will need to record video walkthroughs of property items. If MediaRecorder is not viable on iOS Safari, alternative solutions (photo-only mode, third-party libraries, or native app requirements) must be identified before development begins.

### Business Value
Prevents wasted development effort by validating technical feasibility early. If iOS Safari does not support the required recording functionality, the team can pivot to alternative solutions before investing in full implementation.

### Acceptance Criteria
- [ ] Minimal test page created that attempts MediaRecorder video recording
- [ ] Test page verified on iPhone running iOS 15, iOS 16, and iOS 17
- [ ] Test page verified on iPad
- [ ] Documentation produced listing working codec/container combinations for each tested iOS version
- [ ] Documentation produced describing camera permission flows and any iOS-specific quirks
- [ ] Successfully record and play back a 30-second video on iOS Safari 15 OR document why this is not possible
- [ ] Successfully switch between front and back cameras during recording OR document limitations
- [ ] Recommendation provided on implementation approach (proceed with MediaRecorder, use fallback, or alternative solution)

### Dependencies
This spike must be completed before implementing the ItemCapture component described in the item capture implementation plan. Results will inform Phase 2 development decisions.

### Timebox
4 hours maximum

*Next Request: REQ-030*
---

---

## REQ-030: ItemCapture Component Foundation Infrastructure

**Date**: 2025-12-31 04:15
**Type**: NEW FEATURE
**Size**: XS

### Summary
The system shall provide a structured directory and type-safe foundation for the ItemCapture component to enable organized development of media capture functionality.

### Current Behavior
The ItemCapture component infrastructure does not exist. There is no organized directory structure, type definitions, or export mechanism for the upcoming media capture feature.

### Expected Behavior
When developers begin implementing the ItemCapture component, they should find:
- A properly organized directory structure under the components folder
- A centralized type definition file containing all necessary interfaces for the component
- A barrel export file that exposes the component's public API

This foundation enables multiple developers to work on different aspects of the feature simultaneously while maintaining type safety and consistent module boundaries.

### User Impact
Property owners will ultimately use this infrastructure to capture and organize instructional media about household items. This foundation task does not directly impact end users but is a prerequisite for delivering that capability.

### Business Value
Establishes the technical foundation for the ItemCapture feature, enabling parallel development of subsequent phases and ensuring type safety across the component architecture.

### Acceptance Criteria
- [ ] Directory structure exists at the correct location within the components folder
- [ ] Type definition file contains all required interfaces as specified in the implementation plan
- [ ] Barrel export file properly exports the component and its public types
- [ ] TypeScript compiler reports no errors when importing from the new module
- [ ] All files follow the established codebase patterns for client components and type exports

---

## REQ-031: ItemCapture Component Directory Structure Setup

**Date**: 2025-12-31 14:23
**Type**: NEW FEATURE
**Size**: XS

### Summary
Establish the foundational directory structure and TypeScript type definitions for the ItemCapture component to support organized component development.

### Current Behavior
The ItemCapture component directory structure does not exist in the codebase.

### Expected Behavior
The project contains a properly organized component directory with:
- A dedicated folder for all ItemCapture-related components
- Centralized export management for clean imports throughout the application
- Complete TypeScript interface definitions for type safety

### User Impact
Developers working on the ItemCapture feature will have a clear, organized structure that:
- Makes it easy to locate ItemCapture-related code
- Enables clean, predictable imports across the codebase
- Provides type safety and autocomplete support when working with ItemCapture data

### Business Value
Proper component architecture reduces development time and bugs by establishing clear boundaries and type contracts before implementation begins.

### Acceptance Criteria
- [ ] A new directory exists specifically for ItemCapture components
- [ ] A barrel export file is present that allows importing ItemCapture modules from a single entry point
- [ ] A TypeScript types file is present containing all necessary interface definitions for the ItemCapture feature
- [ ] The directory structure follows the project's existing component organization patterns
- [ ] No compilation errors or TypeScript warnings are introduced

---

## REQ-032: ItemCapture State Machine Implementation

**Date**: 2025-12-31 16:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Users navigating through the item capture workflow need a reliable mechanism that controls step transitions, validates data at each stage, and maintains a consistent state throughout the capture process.

### Current Behavior
No state management infrastructure exists for the ItemCapture component. There is no mechanism to track wizard progress, validate step transitions, or maintain captured data across the multi-step flow.

### Expected Behavior
The application provides a predictable, reducer-based state machine that:
- Manages all wizard steps and transitions between them
- Validates user input before allowing progression to the next step
- Maintains all captured metadata and media items in a single source of truth
- Handles errors gracefully with clear messaging
- Prevents invalid state transitions

### User Impact
Property owners using the item capture feature will experience:
- Smooth navigation through the capture workflow without unexpected behavior
- Clear validation feedback if required information is missing
- Confidence that their work is preserved as they move between steps
- Prevention of data loss if errors occur during the capture process

### Business Value
A robust state machine reduces support burden by preventing users from entering invalid states and ensures data integrity throughout the capture workflow, leading to higher completion rates and better quality submissions.

### Acceptance Criteria
- [ ] A custom hook exists that manages wizard state using a reducer pattern
- [ ] All wizard steps can be transitioned to and from according to the defined flow
- [ ] Step transitions validate required data before allowing progression
- [ ] State includes all necessary fields: current step, metadata, media items, instructions, and errors
- [ ] Actions exist for all state mutations: setting metadata, adding/removing media, updating instructions, navigating steps, and managing errors
- [ ] Invalid state transitions are prevented by the reducer logic
- [ ] Error state can be set and cleared for individual fields
- [ ] The hook provides both state and dispatch methods to consuming components
- [ ] Camera and recording states are tracked separately for proper resource management


---

## REQ-033: Wizard Navigation Scaffold for Item Capture

**Date**: 2025-12-31 11:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need a multi-step wizard interface with navigation controls and visual progress tracking to guide them through the item capture process.

### Current Behavior
No wizard navigation framework exists for the item capture workflow. Users have no structured way to move between capture steps or understand their progress through the process.

### Expected Behavior
Users see a clear wizard interface that:
- Displays their current step in the capture process
- Shows visual progress indicating how far they've progressed
- Provides intuitive navigation controls (back, next, cancel) to move between steps
- Maintains context as they navigate through the multi-step workflow

### User Impact
All users capturing items will interact with this navigation scaffold. It provides the foundational user experience for the entire capture workflow, making it easy to understand where they are in the process and how to move forward or backward through the steps.

### Business Value
A well-designed wizard navigation reduces user confusion and abandonment during item capture. Clear progress indicators and intuitive controls improve task completion rates and overall user satisfaction with the capture experience.

### Acceptance Criteria
- [ ] Users can see a container that organizes and displays individual capture steps
- [ ] Users can navigate backward to review or modify previous steps
- [ ] Users can navigate forward to advance through the workflow
- [ ] Users can cancel the entire capture process from any step
- [ ] Users can see a visual indicator showing which step they're on and how many steps remain
- [ ] Navigation controls are disabled or hidden when contextually inappropriate (e.g., "back" on first step)
- [ ] Progress indicator accurately reflects the user's position in the multi-step workflow


---

## REQ-034: Metadata Collection Step in Item Capture Wizard

**Date**: 2025-12-31 10:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Users must be able to enter descriptive metadata for their items through a dedicated step in the item capture wizard, including title, location, tags, and appliance type.

### Current Behavior
The item capture wizard does not yet have a step for collecting metadata information about items being captured.

### Expected Behavior
When users reach the metadata step in the item capture wizard, they see a form with four fields:
- A required title field with validation feedback
- An optional location field that combines a dropdown of preset locations with the ability to enter custom text
- An optional tags field displaying selected tags as removable pills with the ability to add new tags
- An optional appliance type selector presented as a dropdown with predefined options

Users can navigate forward only when required fields (title) are valid. All entered data persists when navigating between wizard steps.

### User Impact
All users capturing items will use this step to provide descriptive information that makes their items searchable and organized. Without accurate metadata, users cannot effectively categorize or later find their captured items.

### Business Value
Structured metadata collection ensures item data quality and enables effective search, filtering, and organization features that drive user engagement and platform value.

### Acceptance Criteria
- [ ] Title field is required and displays validation errors when empty or invalid
- [ ] Location field offers both preset options and custom text entry
- [ ] Tags field displays selected tags as dismissible pills and allows adding multiple tags
- [ ] Appliance type selector shows predefined categories in a dropdown format
- [ ] All metadata entered persists when navigating backward and forward through wizard steps
- [ ] Users cannot proceed to the next step when the title field is invalid
- [ ] Form handling follows the same patterns and conventions used in existing item forms


---

## REQ-035: Content Type Selection Step in Item Capture Wizard

**Date**: 2025-12-31 09:15
**Type**: NEW FEATURE
**Size**: S

### Summary
Users must be able to select the type of content they want to create (video, photo, text, or upload existing media) through an accessible, mobile-optimized interface during the item capture flow.

### Current Behavior
The content type selection step does not exist in the item capture wizard.

### Expected Behavior
When users reach the content type selection step in the wizard, they see four clearly labeled options presented as large, touch-friendly buttons:
- Record Video
- Take Photo
- Write Text
- Upload File

Each button displays both an icon and text label. The interface is optimized for mobile devices with touch targets large enough to prevent accidental selections. Users can tap any option to proceed to the appropriate capture or upload flow.

### User Impact
All users creating new items will interact with this step. Mobile users particularly benefit from the touch-optimized design, reducing frustration from mis-taps or unclear options. The clear visual presentation helps users quickly understand their content creation choices without confusion.

### Business Value
Streamlines the content creation flow by providing clear, accessible choices upfront. Reduces user error and abandonment during item creation by following mobile-first accessibility standards.

### Acceptance Criteria
- [ ] Four content type options are displayed: Video, Photo, Text, and Upload
- [ ] Each option includes both an icon and descriptive text label
- [ ] All interactive buttons meet minimum touch target size of 48x48 pixels
- [ ] Icons are provided by the Lucide React icon library
- [ ] The layout adapts appropriately to different screen sizes
- [ ] Users can select one option and proceed to the next step in the wizard
- [ ] The selected option is visually indicated before proceeding


---

## REQ-036: Media Capture Interface for Item Photography

**Date**: 2025-12-31 14:23
**Type**: NEW FEATURE
**Size**: L

### Summary
Users need a reliable way to capture photos of items using their device's camera with appropriate error handling and device selection capabilities.

### Current Behavior
No media capture functionality exists. Users cannot take photos of items directly within the application.

### Expected Behavior
Users can:
- Grant camera permissions through a clear, guided flow with helpful error messages
- See which cameras are available on their device
- Switch between available cameras (front/back on mobile, multiple webcams on desktop)
- Receive clear feedback when camera access fails or is unavailable
- Be informed upfront if their browser does not support camera functionality
- Experience consistent behavior across different browsers and devices

### User Impact
All users attempting to capture item photos are affected. This enables users to document their items without leaving the application or using external tools. Users with camera permission issues or browser compatibility problems will receive clear guidance instead of cryptic errors.

### Business Value
Removes friction from the item documentation workflow. Increases completion rates by keeping users in-app. Reduces support burden by proactively handling permission and compatibility issues.

### Acceptance Criteria
- [ ] User can successfully capture photos when camera permissions are granted
- [ ] User receives a clear, actionable message when camera permissions are denied
- [ ] User can see a list of available cameras and select between them
- [ ] User receives appropriate feedback when no cameras are detected
- [ ] User is notified if their browser does not support camera access before attempting to use the feature
- [ ] Camera switching works on devices with multiple cameras without requiring page reload
- [ ] Permission requests follow platform-specific best practices and display user-friendly language
- [ ] Error messages distinguish between different failure scenarios (no permission, no hardware, browser incompatibility)


---

## REQ-037: Live Camera Preview Component for Media Capture

**Date**: 2025-12-31 10:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need a live camera preview interface that displays the video feed, handles camera initialization states, and provides visual feedback when permissions are denied or the camera is unavailable.

### Current Behavior
No camera preview component exists. Users cannot see a live feed from their device camera during the item capture workflow.

### Expected Behavior
When users activate camera capture mode:
- A live video preview appears showing the camera feed
- The preview automatically mirrors the image when using the front-facing camera for natural selfie-style composition
- A loading indicator displays while the camera is activating
- If camera permissions are denied or unavailable, an error message explains the situation and suggests corrective action
- Users can toggle the mirror mode on or off based on their preference

### User Impact
This affects property managers and hosts who need to capture photos and videos of property items. The preview ensures they can properly frame shots before capturing, improving media quality and reducing retakes.

### Business Value
Real-time camera feedback reduces the friction in capturing property documentation, leading to higher-quality media assets and faster item cataloging workflows.

### Acceptance Criteria
- [ ] Live video feed displays in the preview area when camera access is granted
- [ ] Front-facing camera feed is mirrored by default for intuitive composition
- [ ] A loading state is visible during camera initialization
- [ ] Permission denied scenarios show a clear error message with guidance
- [ ] Camera unavailable scenarios (hardware missing, in-use by another app) show appropriate error messages
- [ ] Mirror mode can be toggled on and off without interrupting the video stream
- [ ] Preview maintains appropriate aspect ratio across different device orientations
- [ ] Camera preview stops cleanly when the user navigates away or cancels capture


---

## REQ-038: Video Recording Step with Playback Review

**Date**: 2025-12-31 10:15
**Type**: NEW FEATURE
**Size**: L

### Summary
Users need the ability to record short videos of items with recording controls, duration limits, and playback review capabilities before proceeding in the capture workflow.

### Current Behavior
The Item Capture wizard does not currently support video recording. Users can only capture still photographs of items.

### Expected Behavior
Users should be able to:
- Initiate video recording with a clear start control
- See a visible recording indicator while capturing is in progress
- Monitor elapsed recording time via a countdown timer display
- Have recording automatically stopped when the 2-minute maximum is reached
- Switch between front and back cameras during setup (before or between recordings)
- Stop recording manually before reaching the time limit
- Review the captured video with playback controls before accepting or re-recording

### User Impact
Property managers and staff who need to document items with video (showing details, demonstrating functionality, capturing context that still images cannot convey) will be able to create video content directly within the Item Capture workflow. This enables richer documentation of complex or high-value items.

### Business Value
Video capture capability increases the quality and completeness of item documentation, supporting better guest communication and reducing disputes about item condition or functionality.

### Acceptance Criteria
- [ ] A start recording button is visible and functional when the video capture step is active
- [ ] When recording begins, a clear visual indicator shows that recording is in progress
- [ ] A countdown timer displays the elapsed recording time and shows how much time remains until the 2-minute limit
- [ ] Recording automatically stops when 2 minutes is reached
- [ ] Users can manually stop recording at any time before the limit
- [ ] A camera switch button allows toggling between available cameras (when multiple cameras exist)
- [ ] After recording stops, a review screen displays with playback controls
- [ ] From the review screen, users can choose to accept the video or discard and re-record
- [ ] The captured video can be played, paused, and scrubbed through on the review screen


---

## REQ-039: Photo Capture Step with Multi-Image Support

**Date**: 2025-12-31 10:45
**Type**: NEW FEATURE
**Size**: L

### Summary
Users should be able to capture multiple photos of an item using their device camera, with the ability to review, accept, or retake each photo before proceeding.

### Current Behavior
No photo capture functionality currently exists within the item capture workflow.

### Expected Behavior
When users reach the photo capture step in the item capture wizard, they should see:
- A live camera preview showing what will be captured
- A prominent capture button that triggers photo capture
- Tactile feedback when the capture button is pressed (on supported devices)
- A toggle to switch between front and rear cameras
- A visual indicator showing flash status (on devices that support camera flash)
- After capturing a photo, a preview screen with options to accept or retake the photo
- If accepted, the photo appears as a thumbnail in a strip at the bottom of the screen
- The ability to capture additional photos, with all captured photos visible in the thumbnail strip
- The ability to review previously captured photos by tapping their thumbnails

### User Impact
Property managers and hosts capturing item inventory will have a streamlined, mobile-friendly interface for documenting items with multiple angles or detail shots. This enables comprehensive visual documentation without leaving the capture workflow.

### Business Value
Multi-photo support allows users to create complete visual records of items in a single session, improving documentation quality and reducing the likelihood of needing to recapture items later.

### Acceptance Criteria
- [ ] User can see a live camera preview before capturing
- [ ] Capture button triggers photo capture and provides haptic feedback on supported devices
- [ ] User can switch between front and rear cameras
- [ ] Flash indicator displays current flash status on devices with camera flash
- [ ] After capture, user sees a full-screen preview of the captured photo
- [ ] User can choose to accept or retake the photo from the preview screen
- [ ] Accepted photos appear as thumbnails in a horizontally scrollable strip
- [ ] User can capture multiple photos in sequence
- [ ] User can tap a thumbnail to review a previously captured photo
- [ ] All captured photos are retained when navigating to the next step
---

## REQ-040: Thumbnail Generation Utility for Media Capture

**Date**: 2025-12-31 11:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Users should see consistent thumbnail previews of captured media (photos and videos) within the item capture workflow.

### Current Behavior
No thumbnail generation capability exists. Captured media cannot be displayed in preview form without loading the full-resolution asset.

### Expected Behavior
The system generates compact, consistently-sized thumbnail images from both photo captures and video frames. Thumbnails display quickly in gallery views and media selection interfaces without consuming excessive memory or bandwidth.

### User Impact
Users can quickly browse and review their captured media through visual thumbnails. This improves navigation speed and reduces loading times when reviewing multiple photos or videos within a single item capture session.

### Business Value
Thumbnail previews are essential for modern media workflows. They enable rapid visual scanning of content and reduce frustration associated with loading full-size assets just to identify which media was captured.

### Acceptance Criteria
- [ ] System generates 200x200 pixel thumbnails from captured photos
- [ ] System extracts a representative frame from captured videos and generates a 200x200 pixel thumbnail
- [ ] All thumbnails maintain consistent dimensions regardless of source aspect ratio
- [ ] Thumbnail generation uses canvas-based rendering for both image and video sources
- [ ] Generated thumbnails are returned as memory-efficient blob objects
- [ ] Thumbnail generation completes within 500ms for typical mobile device camera captures
- [ ] Thumbnails display correctly in media gallery views without distortion


---

## REQ-041: File Upload Hook with Validation and Drag-and-Drop Support

**Date**: 2025-12-31 14:32
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to upload files through both traditional file input selection and drag-and-drop interactions, with automatic validation of file types and sizes before upload.

### Current Behavior
No file upload capability exists in the item capture workflow. Users cannot add documents, images, or other files to their items.

### Expected Behavior
Users can select files by clicking a file input button or by dragging files from their file system and dropping them onto a designated area. The system immediately validates each selected file against allowed types and size limits, providing clear feedback if a file is rejected. Users can select multiple files at once when appropriate.

### User Impact
Property managers and hosts can attach supporting documents, additional photos, receipts, or other files to their inventory items. The drag-and-drop functionality makes bulk uploads faster and more intuitive, while validation prevents upload errors and wasted time.

### Business Value
Enables comprehensive item documentation by supporting multiple file types beyond camera-captured media. Reduces user frustration through immediate validation feedback and modern interaction patterns.

### Acceptance Criteria
- [ ] Users can click to open a file browser and select one or more files
- [ ] Users can drag files from their desktop or file manager and drop them onto a designated zone
- [ ] The system validates each file's type against an allowed list before accepting it
- [ ] The system validates each file's size against a maximum limit before accepting it
- [ ] Users receive clear feedback when a file is rejected due to type or size restrictions
- [ ] Multiple files can be selected simultaneously when enabled
- [ ] Visual feedback indicates when the drag-and-drop zone is active and ready to receive files
- [ ] Rejected files do not interrupt the acceptance of valid files in a multi-file selection


---

## REQ-042: File Upload Step with Interactive Upload Zone

**Date**: 2025-12-31 09:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Users must be able to upload files through an intuitive interface that supports both click-to-select and drag-and-drop interactions, with clear visual feedback throughout the upload process.

### Current Behavior
No file upload step exists in the ItemCapture wizard flow.

### Expected Behavior
The wizard presents a dedicated step where users can:
- Click an upload area to select files from their device
- Drag files from their desktop/file manager and drop them onto a designated zone
- See visual feedback when dragging files over the drop zone (highlighting, border changes)
- View file type icons that indicate what kind of file has been selected
- Monitor upload progress through a visual indicator (progress bar or percentage)
- Receive clear error messages when attempting to upload invalid or unsupported file types
- Preview thumbnails of successfully uploaded files before proceeding

### User Impact
Property owners and managers uploading inventory documentation will have a modern, intuitive file upload experience that matches contemporary web application standards. Reduces friction in the capture workflow and provides confidence through visual feedback.

### Business Value
Streamlines the file upload process, reducing abandonment rates during item capture. Visual feedback and error handling prevent user confusion and support ticket volume related to failed uploads.

### Acceptance Criteria
- [ ] Upload area responds to click events and opens the native file picker
- [ ] Drop zone visually changes appearance when files are dragged over it
- [ ] Each uploaded file displays an appropriate icon based on its file type
- [ ] Progress indicator appears and updates during file upload
- [ ] Error messages appear immediately when invalid file types are selected
- [ ] Successfully uploaded files display as thumbnail previews
- [ ] Users can proceed to the next wizard step after successful upload
- [ ] Users receive clear feedback if they attempt to proceed without uploading files

---

## REQ-043: PDF Thumbnail Generation and Metadata Display

**Date**: 2025-12-31 09:15
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should generate visual thumbnail previews from uploaded PDF documents and display document metadata to help users identify and verify PDF content before submission.

### Current Behavior
When users upload PDF files through the file upload interface, they receive generic file-type icons with no visual preview of the document content or information about the document structure.

### Expected Behavior
When a user uploads a PDF file, the system should automatically generate a thumbnail image from the first page of the document and display the total page count alongside the preview. Users should see a clear visual representation of their PDF content without needing to open the file separately. If a PDF cannot be processed due to corruption or password protection, the system should display an appropriate placeholder with a helpful message instead of failing silently.

### User Impact
Users uploading PDF documents for property items (manuals, guides, receipts, warranties) will be able to visually confirm they selected the correct file without leaving the upload interface. This reduces errors and improves confidence during the upload process, particularly when managing multiple similar documents.

### Business Value
Reduces user errors and support requests related to incorrect document uploads. Enhances perceived quality and professionalism of the upload experience.

### Acceptance Criteria
- [ ] Uploaded PDF files display a thumbnail preview showing the first page of the document
- [ ] Page count metadata appears next to each PDF thumbnail (e.g., "3 pages")
- [ ] Corrupt PDF files display a placeholder image with a message indicating the file cannot be previewed
- [ ] Password-protected PDFs display a placeholder image with a message indicating the file is protected
- [ ] Thumbnail generation completes within 2 seconds for PDFs under 10MB
- [ ] System handles PDFs with zero pages or malformed structure without crashing
- [ ] Generated thumbnails maintain readable aspect ratio and quality
- [ ] Users can still proceed with upload even when thumbnail generation fails


---

## REQ-044: Text Editor Step with Markdown Support and Live Preview

**Date**: 2025-12-31 14:22
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to compose and format item descriptions using a markdown editor with formatting tools, live preview, and input limits to create rich text content for their inventory items.

### Current Behavior
No text editing capability exists in the item capture workflow. Users cannot add or format descriptive text for their inventory items.

### Expected Behavior
The wizard presents a dedicated step with a text editor that allows users to:
- Type and edit item descriptions in markdown syntax
- Apply common text formatting using toolbar buttons (bold, italic, headings, bulleted lists, numbered lists, hyperlinks)
- See a live preview of their formatted text as they type
- View the editor and preview side-by-side on larger screens for immediate feedback
- Switch between editor and preview tabs on mobile devices to maximize screen space
- Monitor their character count in real-time with a visual indicator showing proximity to the limit
- Receive automatic saving of their content to prevent data loss during typing
- Know exactly when they exceed the character limit with clear visual feedback

### User Impact
Property managers and hosts can create detailed, well-formatted descriptions for inventory items that improve readability and professionalism. The live preview eliminates guesswork about markdown rendering, while auto-save prevents frustration from accidental data loss during long editing sessions.

### Business Value
Enables richer item documentation with formatted descriptions that increase the value and usability of inventory records. Reduces user frustration through auto-save and clear input boundaries, leading to higher completion rates in the capture workflow.

### Acceptance Criteria
- [ ] Toolbar provides buttons for bold, italic, heading levels, bullet lists, numbered lists, and link insertion
- [ ] Clicking a toolbar button applies the appropriate markdown syntax to selected text or at cursor position
- [ ] Preview pane displays formatted markdown rendering in real-time
- [ ] Desktop layout shows editor and preview side-by-side simultaneously
- [ ] Mobile layout provides tab navigation to switch between editor view and preview view
- [ ] Character counter displays current character count and updates with each keystroke
- [ ] Visual indicator shows when user approaches or exceeds the character limit
- [ ] Content automatically saves to application state after user stops typing for a defined period
- [ ] Previously saved content persists when user navigates away and returns to this step
- [ ] Markdown syntax in toolbar buttons matches common conventions (e.g., **bold**, *italic*)

---

## REQ-045: Accessible Markdown Editor with Mobile-Optimized Toolbar

**Date**: 2025-12-31 14:23
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need a markdown editor with an accessible toolbar, keyboard shortcuts, and live preview to create and edit FAQ content on both desktop and mobile devices.

### Current Behavior
No markdown editing capability exists within the item capture workflow. Users cannot format text content or preview how their markdown will render.

### Expected Behavior
When users choose to add text content, they see a markdown editor with:
- A toolbar containing formatting buttons (bold, italic, headings, lists, links, etc.) that work with screen readers
- Keyboard shortcuts that allow power users to format text without using the toolbar
- A toolbar that adapts its layout and position for comfortable use on mobile devices
- A live preview pane showing how the markdown content will appear when rendered
- Smooth transitions between editing and previewing on smaller screens

### User Impact
All users creating text-based FAQ items benefit from easier content formatting. Mobile users gain a touch-friendly editing experience. Users with accessibility needs can navigate and use formatting features via keyboard and assistive technologies.

### Business Value
Improves content quality by making markdown formatting accessible to non-technical users. Reduces support requests related to markdown syntax errors by providing immediate visual feedback through live preview.

### Acceptance Criteria
- [ ] Toolbar buttons are keyboard-navigable and announce their function to screen readers
- [ ] Common formatting operations (bold, italic, headings, lists, links) can be triggered via keyboard shortcuts
- [ ] On mobile viewports, the toolbar repositions or collapses to avoid obscuring the editing area
- [ ] Preview pane renders markdown content using standard markdown syntax
- [ ] Users can toggle between edit and preview modes
- [ ] Formatting buttons update the editor content correctly when text is selected
- [ ] The editor maintains focus and cursor position after formatting operations


---

## REQ-046: Non-Destructive Media Editing State Management

**Date**: 2025-12-31 14:35
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to edit media items (photos and videos) with changes tracked separately from the original, and only applied when explicitly confirmed.

### Current Behavior
No editing capability exists for captured or uploaded media items. Once a photo or video is added to an item, it cannot be modified or enhanced.

### Expected Behavior
Users can:
- Select any media item to enter edit mode
- Make adjustments to photos or videos (cropping, rotation, filters, etc.)
- Preview changes in real-time while the original remains untouched
- Cancel edits to revert to the original at any time
- Confirm edits to apply changes permanently
- See which media items have pending edits that haven't been confirmed

### User Impact
Property owners and managers creating item documentation will be able to refine their media before finalizing, reducing the need to recapture photos or videos when minor adjustments are needed. This improves content quality and reduces frustration during the capture workflow.

### Business Value
Enables users to produce higher-quality item documentation without leaving the capture interface, reducing abandonment rates and increasing the completeness of property inventories.

### Acceptance Criteria
- [ ] Each media item can be placed into an edit state independently of other items
- [ ] Original media data is preserved and never modified until user confirms changes
- [ ] All edit operations are tracked as a changeset that can be inspected or discarded
- [ ] Users can cancel editing to immediately return to the original media
- [ ] Confirming edits applies the changeset and updates the media item
- [ ] The system indicates visually which items have pending (unconfirmed) edits
- [ ] Multiple media items can have pending edits simultaneously without conflict


---

## REQ-047: Image Cropping Tool for Media Editing

**Date**: 2025-12-31 09:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to crop photos with intuitive touch-friendly controls, choosing either free-form cropping or standard aspect ratios to frame their item images precisely.

### Current Behavior
Once a photo is captured or uploaded, users cannot crop, reframe, or adjust the composition. The entire image is used as-is, even if it includes unwanted elements or poor framing.

### Expected Behavior
When a user selects a photo to edit, they can activate a cropping tool that:
- Displays adjustable crop boundaries overlaid on the image
- Offers preset aspect ratio options (1:1 square, 4:3 standard, 16:9 widescreen) for common use cases
- Allows free-form cropping with no aspect ratio constraint for maximum flexibility
- Provides touch-friendly drag handles that work reliably on mobile devices
- Shows a real-time preview of the cropped result as the user adjusts the boundaries
- Applies the crop when confirmed, or cancels to return to the uncropped image

### User Impact
Property owners creating item documentation gain control over photo composition, enabling them to remove distracting backgrounds, focus on the item itself, and create professional-looking images without external editing tools. Mobile users benefit from touch-optimized controls designed for phones and tablets.

### Business Value
Improves the quality and consistency of item photos by allowing users to frame items properly within the capture workflow, reducing the need for external photo editing and increasing user satisfaction with their documentation.

### Acceptance Criteria
- [ ] Cropping tool displays a draggable crop boundary overlay on the selected image
- [ ] Users can select from preset aspect ratios: 1:1, 4:3, and 16:9
- [ ] Users can choose free-form cropping with no aspect ratio constraint
- [ ] Crop boundary handles are large enough and positioned appropriately for touch interaction on mobile screens
- [ ] Preview updates in real-time as the crop boundary is adjusted
- [ ] Confirming the crop applies the change to the image
- [ ] Canceling the crop returns the image to its pre-crop state
- [ ] The cropping interface integrates with the non-destructive editing state management system


---

## REQ-048: Image Rotation Tool for Media Editing

**Date**: 2025-12-31 15:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Users should be able to rotate photos in 90-degree increments with smooth animated previews and precise canvas-based processing.

### Current Behavior
Once a photo is captured or uploaded, users cannot rotate it to correct orientation issues. Photos taken in the wrong orientation must be retaken or remain incorrectly oriented in the documentation.

### Expected Behavior
When a user selects a photo to edit, they can access rotation controls that:
- Display clearly labeled buttons for rotating left (counter-clockwise) and right (clockwise) by 90 degrees
- Show an animated preview that smoothly rotates the image as the user clicks rotation buttons
- Apply the actual rotation using canvas-based processing to maintain image quality
- Allow multiple rotation operations to be chained (e.g., rotating 180 degrees via two 90-degree clicks)
- Update the preview instantly with smooth transitions between rotation states
- Preserve image quality and dimensions appropriately when rotation is confirmed

### User Impact
Property owners and managers creating item documentation can quickly fix orientation issues without leaving the capture workflow. This is especially valuable for photos imported from devices that may not automatically correct orientation metadata, or for items photographed at awkward angles.

### Business Value
Reduces friction in the item capture workflow by eliminating the need to retake photos or use external editing tools for simple orientation corrections, improving efficiency and user satisfaction.

### Acceptance Criteria
- [ ] Rotation controls display two clearly labeled buttons: rotate left 90 degrees and rotate right 90 degrees
- [ ] Clicking a rotation button triggers a smooth animated transition showing the image rotating
- [ ] The actual rotation is processed using canvas-based rendering to ensure quality
- [ ] Multiple rotation operations can be applied sequentially (e.g., 90, then another 90 for 180 total)
- [ ] The rotation preview animation completes before allowing the next rotation action
- [ ] Confirming edits applies the rotation permanently to the image
- [ ] Canceling edits reverts the image to its original orientation
- [ ] The rotation tool integrates with the non-destructive editing state management system



---

## REQ-049: Video Trimming Interface with Start/End Markers

**Date**: 2025-12-31 16:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to visually mark start and end points on recorded or uploaded videos to indicate which portion should be retained, with the actual trimming performed server-side at upload time.

### Current Behavior
When users capture or upload videos, they must accept the entire video duration regardless of unwanted content at the beginning or end. There is no way to exclude introductory fumbling, setup time, or trailing footage without re-recording the entire video.

### Expected Behavior
When a user selects a video to edit, they can access a trimming interface that:
- Displays a video player showing the full captured or uploaded video
- Provides a scrubber timeline control that allows dragging to navigate through the video
- Shows visual markers (handles) to set the desired start point and end point
- Highlights the selected trim region on the timeline to clearly indicate what will be kept
- Updates the video preview to show the trimmed section when playback is initiated
- Displays the duration of the selected trim region and the total original duration
- Allows adjustment of markers by dragging them along the timeline
- Saves trim marker positions (timestamps) without performing actual video processing in the browser
- Communicates trim instructions to the server for processing during final upload

### User Impact
Property owners and managers documenting items with video can quickly exclude unnecessary footage from the beginning and end of recordings, ensuring only relevant content is uploaded. This eliminates the need to re-record videos or manually edit them outside the system.

### Business Value
Improves the quality of video documentation by giving users control over content boundaries without requiring expensive client-side video processing. Deferring actual trimming to server-side upload time keeps the browser-based workflow lightweight and performant while still delivering professional results.

### Acceptance Criteria
- [ ] Video player displays the full video with standard playback controls (play, pause, seek)
- [ ] Timeline scrubber allows users to drag and navigate to any point in the video
- [ ] Two draggable markers appear on the timeline representing start point and end point
- [ ] The timeline visually highlights the region between start and end markers to show the selected trim range
- [ ] Playing the video starts from the marked start point and stops at the marked end point
- [ ] Duration display shows both the trimmed selection length and total video length
- [ ] Markers can be repositioned by dragging along the timeline with smooth visual feedback
- [ ] Markers cannot be dragged past each other (start must remain before end)
- [ ] Trim marker positions (as timestamps) are saved to the application state
- [ ] No actual video encoding or processing occurs in the browser (V1 simplified approach)
- [ ] Trim instructions are packaged with the video file for server-side processing during upload
- [ ] The trimming interface integrates with the non-destructive editing state management system

---

## REQ-050: Media Editor Step with Type-Specific Editing Interface

**Date**: 2025-12-31 10:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to edit captured or uploaded media items within a wizard step that displays the appropriate editing interface based on media type, with the ability to skip, apply, or cancel edits before proceeding.

### Current Behavior
No media editing step exists in the item capture wizard. Users cannot modify images or videos after capturing or uploading them.

### Expected Behavior
When the user reaches the media editor step in the wizard:
- The system displays the appropriate editing interface based on the media type (cropping and rotation controls for images, trimming controls for videos)
- Each editing operation shows a "Skip" button that allows bypassing that particular edit
- After making changes, the user sees "Apply" and "Cancel" buttons to confirm or discard their edits
- Upon completing edits for one media item, the system automatically advances to the next media item if multiple items exist
- After all media items have been edited (or skipped), the system transitions to the review step

### User Impact
Users creating item listings with visual media will be able to refine their images and videos directly within the capture workflow, eliminating the need to edit media externally before uploading. This improves the quality of listings and reduces friction in the creation process.

### Business Value
Integrated editing capabilities increase listing quality and reduce abandonment rates by providing a seamless end-to-end capture and refinement experience without requiring external tools.

### Acceptance Criteria
- [ ] When an image is presented for editing, cropping and rotation controls are displayed
- [ ] When a video is presented for editing, trimming controls are displayed
- [ ] Each editing interface includes a clearly visible "Skip" button
- [ ] After making edits, "Apply" and "Cancel" buttons are available
- [ ] Clicking "Apply" saves the edits and advances to the next media item or review step
- [ ] Clicking "Cancel" discards edits and advances to the next media item or review step
- [ ] Clicking "Skip" bypasses editing and advances to the next media item or review step
- [ ] When multiple media items exist, the system presents each one sequentially for editing
- [ ] After the last media item is processed, the wizard transitions to the review step
- [ ] The user can see which media item they are currently editing (e.g., "Image 2 of 5")
---

## REQ-051: Media Thumbnail Component with Type-Specific Visual Indicators

**Date**: 2025-12-31 11:23
**Type**: NEW FEATURE
**Size**: S

### Summary
Users should see a consistent, visually distinct thumbnail representation for all media types (video, image, PDF) with appropriate overlays and controls that clearly communicate the media type and available actions.

### Current Behavior
No reusable media thumbnail component exists. Different media types are displayed inconsistently or not at all during the item capture review process.

### Expected Behavior
When a media item is displayed as a thumbnail:
- Images appear with their actual visual content scaled to fit the thumbnail dimensions
- Videos display their first frame or generated thumbnail with a play icon overlay clearly visible
- PDF files show a document icon with the total page count displayed numerically
- All thumbnails include a delete button overlay that appears when the user hovers or taps the thumbnail
- While a thumbnail is generating or loading, a loading state indicator is displayed in place of the content
- All three media types maintain the same visual dimensions and styling for consistent grid layouts

### User Impact
Users reviewing their captured or uploaded media will have a clear, at-a-glance understanding of what type of content each item represents, with consistent controls across all media types. This reduces confusion and makes managing multiple media items more intuitive.

### Business Value
Standardized media presentation improves user confidence during the review process and reduces errors caused by unclear media type indicators, leading to higher quality submissions and fewer support requests.

### Acceptance Criteria
- [ ] Image thumbnails display the actual image content scaled to fit the thumbnail area
- [ ] Video thumbnails display a representative frame with a visible play icon overlay
- [ ] PDF thumbnails display a document icon with the exact page count shown as text
- [ ] All three media types render at the same dimensions when displayed in a grid
- [ ] A delete button overlay appears on hover (desktop) or tap (mobile) for all media types
- [ ] Clicking the delete button removes the associated media item from the collection
- [ ] While content is loading or processing, a loading spinner or skeleton state is displayed
- [ ] The loading state transitions smoothly to the final thumbnail once content is ready
- [ ] All thumbnails maintain consistent spacing, border radius, and visual styling


---

## REQ-052: Content Submission Validation Layer

**Date**: 2025-12-31 15:42
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must validate all user-provided content before allowing submission, ensuring data completeness, content requirements, and size constraints are met.

### Current Behavior
Users can progress through the item capture wizard without comprehensive validation of their inputs, potentially leading to incomplete submissions or failed uploads due to size constraints.

### Expected Behavior
Before submission is allowed, the system validates that:
- All required metadata fields contain valid values
- At least one form of content (media files or text) has been provided
- Individual files do not exceed their respective size limits
- The combined total size of all uploads remains within acceptable bounds
- Users receive clear, actionable feedback when validation fails, indicating exactly what needs to be corrected

### User Impact
**Affected**: All users creating new items through the capture wizard

Users will receive immediate feedback about missing or invalid data before attempting submission, reducing frustration from failed uploads and ensuring all submissions meet minimum quality standards. Clear validation messages guide users to complete their submissions successfully on the first attempt.

### Business Value
Reduces server load from invalid submissions, improves data quality in the system, and enhances user experience by catching errors early in the submission process rather than after upload attempts.

### Acceptance Criteria
- [ ] Submission cannot proceed when any required metadata field is empty or invalid
- [ ] Submission cannot proceed when neither media files nor text content has been provided
- [ ] Warning appears when a single file exceeds the maximum allowed size for its type
- [ ] Warning appears when the total size of all files exceeds the maximum total upload size
- [ ] Validation errors display specific, user-friendly messages indicating which requirements are not met
- [ ] Total upload size calculation accurately reflects the sum of all selected media files
- [ ] Validation state updates in real-time as users add or remove content


---

## REQ-053: Final Item Record Assembly and Submission Handler

**Date**: 2025-12-31 16:15
**Type**: NEW FEATURE
**Size**: M

### Summary
When the user completes the item capture wizard, the system must assemble all collected data into a final structured record with unique identifiers, timestamps, and properly determined content type before emitting it to the parent component.

### Current Behavior
The wizard collects metadata, content, and media across multiple steps, but no mechanism exists to consolidate this information into a unified, submission-ready record structure when the user clicks "Submit" or "Complete."

### Expected Behavior
When the user completes the final review step and initiates submission:
- All captured metadata (name, description, location, tags) is gathered into a single record structure
- All content data (text content, uploaded files, captured media) is included in the record
- A unique identifier is generated for the item itself
- Additional unique identifiers are generated for each media file in the submission
- The content type field is automatically determined based on what content was provided (e.g., "video" if video was captured, "image" if photos were uploaded, "text" if only text content exists)
- A creation timestamp is added to the record reflecting the moment of submission
- The complete, structured record is emitted to the parent component for processing
- The wizard state is cleared and reset to allow creation of another item

### User Impact
Users completing the wizard will experience a seamless transition from review to submission, with their data properly packaged and ready for backend processing. The completion event triggers the next step in the workflow (saving to database, displaying success message, etc.) without requiring manual data assembly.

### Business Value
Automated record assembly ensures data consistency, reduces the risk of missing fields or malformed submissions, and provides a clean integration point between the capture interface and backend persistence logic.

### Acceptance Criteria
- [ ] Upon submission, all metadata fields are collected into the final record structure
- [ ] All content data (text, media files, uploaded files) is included in the final record
- [ ] A unique identifier is generated for the item record itself
- [ ] Each media file receives its own unique identifier
- [ ] The content type field is set automatically based on the primary content provided
- [ ] A creation timestamp is added to the record using the current date and time
- [ ] The completed record is emitted to the parent component via callback or event
- [ ] After emission, the wizard state is reset to initial values
- [ ] The record structure matches the expected format for backend persistence


---

## REQ-054: Media Editor Performance Optimization

**Date**: 2025-12-31 16:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The item capture wizard must efficiently manage system resources by lazy loading heavy components, properly cleaning up media streams and object URLs, and preventing memory leaks throughout the capture and editing lifecycle.

### Current Behavior
Media editor components, camera streams, and dynamically generated object URLs are loaded immediately and may not be properly released when no longer needed, potentially causing memory accumulation, degraded performance over extended sessions, and resource exhaustion on memory-constrained devices.

### Expected Behavior
The system optimizes resource usage by:
- Loading editor components (image cropper, video trimmer, PDF viewer) only when the user enters the editing step, not during initial wizard load
- Releasing camera and microphone streams immediately when the user exits camera capture or switches to a different step
- Revoking all blob URLs created for media previews and thumbnails when those previews are no longer displayed or when the component unmounts
- Maintaining stable memory usage across multiple capture sessions without requiring page refresh
- Completing media operations without noticeable lag or performance degradation, even on mid-range mobile devices

### User Impact
**Affected**: All users capturing or editing media, particularly those on mobile devices or completing multiple submissions in a single session

Users will experience faster initial load times, smoother transitions between wizard steps, and consistent performance throughout extended editing sessions. Battery drain on mobile devices will be reduced by releasing camera access promptly, and memory-constrained devices will remain responsive even after multiple item captures.

### Business Value
Improved resource management reduces user frustration from slow performance, extends the usable session time before browser memory limits are reached, and decreases abandonment rates caused by application lag or unresponsiveness.

### Acceptance Criteria
- [ ] Editor components (cropper, trimmer, PDF viewer) are not loaded until the user navigates to the editing step
- [ ] Camera and microphone access is released within one second of exiting the capture step
- [ ] All blob URLs created for media preview are revoked when their associated preview element is unmounted
- [ ] Memory usage remains stable across five consecutive item capture sessions without page reload
- [ ] No active media streams persist after the user navigates away from camera capture
- [ ] Application performance (measured by frame rate or interaction responsiveness) does not degrade during a 15-minute editing session
- [ ] Memory profiling confirms no significant memory leaks in media handling code paths


---

## REQ-055: Developer Test Harness for Item Capture Wizard

**Date**: 2025-12-31 14:23
**Type**: NEW FEATURE
**Size**: S

### Summary
Developers need a dedicated test page to manually verify the complete item capture wizard flow, inspect output data, and confirm local-only operation without network requests.

### Current Behavior
Developers must integrate the ItemCapture component into the main application to test functionality, making it difficult to isolate behavior, verify output structure, and confirm network isolation during development and debugging.

### Expected Behavior
A standalone test page accessible at a dedicated route allows developers to:
- Launch and complete the full wizard workflow in isolation
- View structured output data in the browser console when the wizard completes
- Confirm through browser developer tools that zero network requests occur during the capture process

### User Impact
Development team members testing, debugging, or extending the ItemCapture wizard will have a self-contained environment for verification without affecting the main application flow.

### Business Value
Reduces development time and increases confidence in changes by providing immediate feedback on wizard behavior and data structure conformance.

### Acceptance Criteria
- [ ] Test page is accessible at the designated test route
- [ ] Completing the wizard triggers console output displaying the complete data structure passed to onComplete
- [ ] Browser network monitor shows zero requests initiated during the entire capture workflow
- [ ] Test page can be accessed without authentication or special configuration
- [ ] Console output is clearly formatted and includes all expected data fields


---

## REQ-056: ItemManager Component Foundation and Type System

**Date**: 2026-01-02 16:45
**Type**: NEW FEATURE
**Size**: S

### Summary
The ItemManager component requires a proper directory structure and complete type system that defines all interfaces, data structures, and configuration options needed to support item listing, filtering, selection, and management operations.

### Current Behavior
The ItemManager component does not yet exist in the codebase. Property owners currently have no interface for browsing, searching, or managing their library of instructional items after creation.

### Expected Behavior
A foundational component structure is established with:
- A dedicated component directory at the proper location in the source tree
- Complete TypeScript type definitions covering all component props, callbacks, configuration options, and data structures
- Barrel exports that provide clean import paths for consuming code
- Integration with existing shared types from the ItemCapture component to maintain consistency across the item lifecycle

### User Impact
Development team members implementing ItemManager features will have a clear type contract to follow, ensuring consistency in data handling and reducing integration errors when connecting the manager to backend services and the ItemCapture editing workflow.

### Business Value
Establishing types upfront prevents rework, clarifies component responsibilities, and ensures the interface can properly receive data and emit actions without tight coupling to persistence or routing concerns.

### Acceptance Criteria
- [ ] Component directory exists at the expected location in the source tree
- [ ] Type definition file contains all interfaces specified in the component PRD
- [ ] Barrel export file allows importing ItemManager types and components from a single entry point
- [ ] Shared types from ItemCapture (ItemRecord, MediaItem, Property) are imported and reused
- [ ] No implementation logic exists yet, only structural files and type definitions
- [ ] TypeScript compilation succeeds with no type errors in the new files
- [ ] File contains proper documentation comments for exported interfaces

---

## REQ-057: Item Manager State Management Hook

**Date**: 2026-01-02 17:15
**Type**: NEW FEATURE
**Size**: M

### Summary
The Item Manager component requires a centralized state management hook that coordinates view modes, filtering, sorting, and multi-item selection across the item listing interface.

### Current Behavior
The ItemManager component has no internal state management mechanism. Users cannot switch between different viewing layouts, filter or sort their item collection, or select multiple items for batch operations.

### Expected Behavior
A custom React hook manages all core presentation and interaction state for the item manager:
- Users can toggle between different view modes (grid, list, or other layout options) and the interface responds by rearranging the displayed items accordingly
- Users can apply filters to narrow down visible items based on criteria such as content type, creation date, or status
- Users can change the sort order of displayed items using various sorting criteria
- Users can select individual items or multiple items simultaneously for bulk actions
- State transitions are handled through a reducer pattern that ensures predictable and traceable state updates
- The state hook integrates cleanly with the component's props and can be controlled externally when needed

### User Impact
Property owners will gain fundamental interaction capabilities needed to navigate and manage large collections of instructional items, making the interface practical for real-world use with dozens or hundreds of items.

### Business Value
Implementing robust state management early prevents architectural refactoring later and ensures the component can scale to support advanced features like saved filters, bulk editing, and synchronized state across multiple views.

### Acceptance Criteria
- [ ] State management hook file exists and exports a single primary hook function
- [ ] View mode state can be toggled between supported layout types and persists across interactions
- [ ] Filter state accepts multiple filter criteria and correctly manages active filter combinations
- [ ] Sort state tracks current sort field and direction (ascending/descending)
- [ ] Selection state manages a collection of selected item identifiers and supports select-all and clear-all operations
- [ ] All state transitions are handled by a reducer function that processes typed action objects
- [ ] Hook returns both current state values and dispatch functions for triggering state changes
- [ ] Hook can be initialized with default or externally-provided state values
- [ ] State shape matches the interfaces defined in the component's type system
- [ ] No UI rendering logic exists in the hook - only state management
- [ ] TypeScript compilation succeeds with full type safety for all state operations


---

## REQ-058: ItemCard Component for Grid View Display

**Date**: 2026-01-02 17:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The Item Manager requires a visual card component that displays individual items in a grid layout, showing key metadata and supporting user interactions for preview and selection.

### Current Behavior
The ItemManager component has no visual representation for displaying individual items. Property owners cannot see their collection of instructional items or interact with them through a visual interface.

### Expected Behavior
A reusable card component renders each item with:
- A thumbnail image or type-specific visual placeholder at the top of the card
- The item's title displayed prominently below the thumbnail
- The associated location or room name shown beneath the title
- A visual badge or indicator showing the content type (photo, video, document, text, or upload)
- Clickable card surface that opens a preview or detail view of the item when tapped or clicked
- A selection checkbox that appears when the interface enters selection mode, allowing users to mark the item for batch operations
- Visual feedback indicating the current selection state when the checkbox is visible and checked

### User Impact
Property owners will be able to browse their item collection visually, quickly identify items by thumbnail and title, understand what type of content each item contains, open items for detailed viewing, and select multiple items for batch operations when needed.

### Business Value
A well-designed card component creates an intuitive browsing experience that scales from small collections to large libraries, reducing the cognitive load of managing instructional content and encouraging property owners to create comprehensive guest information.

### Acceptance Criteria
- [ ] ItemCard component file exists in the ItemManager component directory
- [ ] Card displays a thumbnail image when the item has associated media
- [ ] Card shows a type-appropriate placeholder when no thumbnail is available
- [ ] Item title is displayed with appropriate text truncation for long titles
- [ ] Location or room name appears below the title
- [ ] Content type badge is visible and uses distinct visual styling for each content type
- [ ] Clicking anywhere on the card (except the checkbox) triggers the preview callback
- [ ] Selection checkbox is hidden by default and only appears when selection mode is active
- [ ] Checking the checkbox triggers the selection callback with the item's identifier
- [ ] Card provides visual feedback (hover state, active state) during user interaction
- [ ] Component accepts all necessary props defined in the ItemManager type system
- [ ] Component is responsive and adapts to different grid column widths
- [ ] TypeScript compilation succeeds with no type errors

---

## REQ-059: ItemRow Component for List View Display

**Date**: 2026-01-02 (Current Time)
**Type**: NEW FEATURE
**Size**: S

### Summary
Users should be able to view captured items in a list format that displays comprehensive metadata and provides quick access to item actions and selection controls.

### Current Behavior
No list view option exists for displaying captured items with detailed metadata.

### Expected Behavior
When users select list view mode, each captured item appears as a row showing:
- Item thumbnail or icon
- Item title and description
- Associated tags
- Creation and modification dates
- Action menu accessible via a kebab menu icon
- Selection checkbox for bulk operations

Users can:
- Click the checkbox to select/deselect individual items
- Click the kebab menu to access item-specific actions (edit, delete, share, etc.)
- Click anywhere else on the row to view full item details

### User Impact
All users who need to manage multiple captured items will benefit from:
- Faster scanning of item metadata without opening individual items
- Easier comparison of multiple items side-by-side
- More efficient bulk selection for batch operations
- Better utilization of screen space on wider displays

### Business Value
List view is a standard pattern in content management interfaces that improves user productivity when managing collections. This complements the grid view option and accommodates different user preferences and use cases.

### Acceptance Criteria
- [ ] List view displays all captured items as horizontal rows
- [ ] Each row shows item thumbnail, title, description, tags, and dates
- [ ] Checkbox appears on each row and toggles item selection state
- [ ] Kebab menu icon appears on each row and opens contextual action menu
- [ ] Row background highlights on hover to indicate interactivity
- [ ] Clicking the row (excluding checkbox and kebab menu) navigates to item details
- [ ] Row layout adapts responsively to different screen widths
- [ ] Selected rows display visual indication (e.g., background color change)

---

## REQ-060: Grid and List View Layout Components with Toggle

**Date**: 2026-01-02 14:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to switch between grid and list display modes when viewing their collection of captured items, with each mode optimized for different browsing and management needs.

### Current Behavior
The Item Manager does not provide alternate view modes for displaying captured items. Users can only view items in a single, fixed layout format regardless of their current task or preference.

### Expected Behavior
The Item Manager displays a view mode toggle control (typically icons for grid and list) that allows users to switch between two layout modes:

**Grid View Mode:**
- Items are arranged in a responsive grid with multiple columns
- Grid automatically adjusts column count based on available screen width (e.g., 4 columns on desktop, 2 on tablet, 1 on mobile)
- Each grid cell displays an item using the card component format
- Grid maintains consistent spacing and alignment across all items
- Layout emphasizes visual browsing with thumbnails prominently displayed

**List View Mode:**
- Items are arranged in a vertical single-column format
- Each item appears as a horizontal row showing comprehensive metadata
- List format provides a table-like structure optimized for scanning detailed information
- Layout emphasizes efficiency and information density

**Toggle Behavior:**
- View mode toggle control is always visible when items are present
- Clicking the grid icon switches to grid view and updates the display immediately
- Clicking the list icon switches to list view and updates the display immediately
- The currently active view mode is visually indicated in the toggle control
- Selected view mode preference persists during the user session

### User Impact
All property owners managing instructional items will benefit from:
- Flexibility to choose the view that best suits their current task (visual browsing vs. detailed management)
- Better experience on different device sizes with appropriately responsive layouts
- Faster visual scanning when using grid view for thumbnail-based navigation
- More efficient metadata review when using list view for detailed item comparison
- Personalized interface that adapts to individual workflow preferences

### Business Value
Providing multiple view modes is a standard pattern in content management systems that significantly improves user satisfaction and efficiency. Users with different cognitive preferences, tasks, and device contexts all gain a better experience, which increases engagement with the item management features and encourages more comprehensive property documentation.

### Acceptance Criteria
- [ ] Grid layout component renders items in a responsive multi-column grid
- [ ] Grid automatically adjusts column count based on viewport width (responsive breakpoints)
- [ ] Grid layout maintains consistent spacing between items and consistent item sizing
- [ ] List layout component renders items in a single-column vertical arrangement
- [ ] List layout displays rows with table-like structure and consistent column alignment
- [ ] View mode toggle control appears in the Item Manager interface header or toolbar
- [ ] Toggle control displays distinct icons for grid and list modes
- [ ] Clicking grid icon switches display to grid layout immediately
- [ ] Clicking list icon switches display to list layout immediately
- [ ] Currently active view mode is visually highlighted in the toggle control
- [ ] Switching between views preserves item selection state (selected items remain selected)
- [ ] Both layouts work correctly with empty state (no items to display)
- [ ] Both layouts work correctly with single item and multiple items
- [ ] TypeScript compilation succeeds with no type errors
- [ ] Layouts render correctly across different viewport sizes and devices


---

## REQ-061: Empty and Loading State Components

**Date**: 2026-01-02 (Current Session)
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should display appropriate visual feedback when content is loading or when no items are available to display.

### Current Behavior
There is no standardized way to communicate loading progress or empty collection states to users within the item capture workflow.

### Expected Behavior
When the system is fetching or processing data, users see a skeleton loading animation that matches the expected content layout. When a collection contains no items, users see a friendly empty state message with relevant guidance or next steps.

### User Impact
Users managing item collections will have clear visual feedback during loading operations and will understand when a collection is intentionally empty versus still loading. This reduces confusion and improves perceived performance.

### Business Value
Proper loading and empty states improve user confidence in the application and reduce support inquiries related to "broken" or "stuck" interfaces.

### Acceptance Criteria
- [ ] Empty state displays a clear message and optional guidance when no items exist in a collection
- [ ] Loading state shows a skeleton animation that reflects the structure of the content being loaded
- [ ] Both states are visually consistent with the application's design system
- [ ] Loading state smoothly transitions to content or empty state once data is available
- [ ] Empty state provides actionable next steps where appropriate


---

## REQ-062: Search, Filter, and Sort Hook for Item Management

**Date**: 2026-01-02 15:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need the ability to search, filter, and sort their captured items to quickly find specific content within their collection.

### Current Behavior
Users must manually scroll through their entire item collection to find specific items, with no ability to narrow down results based on search criteria, filters, or custom sorting preferences.

### Expected Behavior
Users can:
- Enter search text to instantly filter items matching their title, location, tags, or instructions
- Apply filters to narrow down items by specific criteria
- Choose different sort orders to organize items according to their preference
- See results update in real-time as they type or change filter/sort settings
- Clear search and filters to return to viewing all items

### User Impact
All users managing multiple items will benefit from faster item discovery and improved organization. This is especially valuable for users with large collections where manual browsing becomes time-consuming and inefficient.

### Business Value
Improves user productivity and satisfaction by reducing the time needed to locate specific items. Essential foundation for scaling the application to handle large item collections without degrading user experience.

### Acceptance Criteria
- [ ] Search functionality returns items when query matches any part of the item's title, location, tags, or instructions (case-insensitive)
- [ ] Multiple filters can be applied simultaneously, with results showing only items that match all active filters
- [ ] Sort options reorder the entire result set according to the selected comparator
- [ ] When search query is empty and no filters are active, all items are returned in the selected sort order
- [ ] Changes to search, filter, or sort settings produce immediate results without requiring a manual refresh
- [ ] The hook returns the filtered and sorted items array ready for display


---

## REQ-063: Item Toolbar with View Controls and Filter Management

**Date**: 2026-01-02 (Current Session)
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need a toolbar interface that allows them to control how items are displayed, see how many results match their current filters, and quickly reset all applied filters.

### Current Behavior
There is no unified toolbar interface for managing item display preferences and filter state visibility.

### Expected Behavior
Users see a toolbar above the item listing that includes:
- Toggle controls to switch between different view modes (e.g., grid, list, table)
- A display showing the current count of items matching active filters
- A clearly visible action to remove all active filters at once
- Visual feedback indicating which view mode is currently active

### User Impact
All users browsing or managing items will have immediate access to view customization and filter management, improving their ability to find and organize information efficiently.

### Business Value
Provides essential navigation and control features that improve user experience and reduce friction when working with filtered or sorted item collections.

### Acceptance Criteria
- [ ] Toolbar is visible and positioned consistently above item listings
- [ ] View toggle buttons allow switching between available display modes
- [ ] Active view mode is clearly indicated visually
- [ ] Result count updates dynamically as filters are applied or removed
- [ ] "Clear filters" action is accessible and removes all active filters when triggered
- [ ] Toolbar layout adapts gracefully to different screen sizes
- [ ] All toolbar controls are keyboard accessible


---

## REQ-064: Search Input Interface for Item Filtering

**Date**: 2026-01-02 
**Type**: NEW FEATURE
**Size**: S

### Summary
Users need a responsive search input field to quickly filter and find items in their collection using text-based queries.

### Current Behavior
Users can only browse items through views and applied filters without the ability to perform text-based searches for specific items or content.

### Expected Behavior
Users see a search input field that allows them to type search queries and immediately see matching items. The search updates smoothly without lag or performance issues. Users can clear the search with a single action to return to the full item list.

### User Impact
All users managing item collections will be able to quickly locate specific items by typing keywords, significantly reducing time spent browsing through long lists or applying multiple filters.

### Business Value
Search functionality is a fundamental expectation for content management interfaces. Providing responsive, intuitive search improves user efficiency and satisfaction when working with medium to large item collections.

### Acceptance Criteria
- [ ] Search input field is prominently displayed and easily accessible
- [ ] Input updates trigger filtering with a slight delay to prevent performance degradation during typing
- [ ] A clear button appears when search text is present and removes all search text when activated
- [ ] Search field displays an appropriate icon indicating its purpose
- [ ] Search field styling is consistent with the overall design system
- [ ] Search remains functional and responsive with collections of varying sizes
- [ ] Search input is keyboard accessible and supports standard navigation patterns
- [ ] Visual feedback indicates when search is active (e.g., highlighted state, result count)


---

## REQ-065: Advanced Filter Panel for Multi-Criteria Item Filtering

**Date**: 2026-01-02 
**Type**: NEW FEATURE
**Size**: L

### Summary
Users need a comprehensive filter panel to refine item listings by multiple criteria simultaneously including content type, tags, location, and property association.

### Current Behavior
Users can only search for items using basic text search functionality without the ability to apply structured filters or combine multiple filtering criteria.

### Expected Behavior
Users can access a filter panel that allows them to:
- Select one or more content types to view (e.g., photos, videos, documents, links)
- Choose from existing tags using a multi-select interface
- Filter by location from a predefined list
- Filter by specific property or properties when managing multiple properties
- Apply multiple filters simultaneously with results updating in real-time
- Easily clear individual filters or reset all filters at once
- Access the filter panel seamlessly on mobile devices through a collapsible/expandable interface

### User Impact
All users managing item collections benefit from faster, more precise item discovery. Property managers handling multiple properties gain significant efficiency by quickly isolating items by property, content type, or tag combinations. Mobile users can access full filtering capabilities without compromising screen space.

### Business Value
Reduces time spent searching for specific items and improves user productivity when managing large collections. Enhanced filtering capabilities increase platform utility for power users and professional property managers.

### Acceptance Criteria
- [ ] Filter panel displays all available filter categories (content type, tags, location, property)
- [ ] Content type filter allows selecting multiple types simultaneously
- [ ] Tag filter displays all existing tags and supports multi-selection
- [ ] Location filter presents available locations in a dropdown format
- [ ] Property filter enables filtering by one or multiple properties
- [ ] Applied filters are visually indicated with the ability to remove individual filters
- [ ] Filtered results update immediately when filters are applied or removed
- [ ] A "Clear All" action removes all active filters and returns to unfiltered view
- [ ] On mobile devices, the filter panel collapses to preserve screen space and expands when activated
- [ ] Filter panel state persists during the user session when navigating between views
- [ ] Filter combinations work correctly together (e.g., filtering by both content type AND tag shows items matching all criteria)

---

## REQ-066: Sort Menu for Item Organization

**Date**: 2026-01-02 14:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need a sorting menu to reorder their item listings based on different criteria such as date, name, or type.

### Current Behavior
Items are displayed in a fixed order without the ability for users to reorganize the list based on their preferences or current task needs.

### Expected Behavior
Users can access a sort menu that allows them to:
- Select from multiple sort options (e.g., date added, name, content type, last modified)
- See which sort option is currently active with a visual indicator
- Change sort order (ascending/descending) for applicable criteria
- Access the menu easily on mobile devices with appropriately-sized touch targets
- Observe immediate reordering of items when a new sort option is selected

### User Impact
All users managing item collections benefit from flexible organization options. Users working on mobile devices can comfortably select sort options without precision tapping. Users searching for recently added items or alphabetically organized content can quickly find what they need.

### Business Value
Improves user productivity by allowing personalized item organization that matches different workflow patterns. Enhanced mobile usability reduces friction in mobile-first usage scenarios.

### Acceptance Criteria
- [ ] Sort menu displays as a dropdown with all available sorting options
- [ ] Currently active sort option is clearly indicated within the menu
- [ ] Touch targets meet minimum size requirements (44x44px) for mobile accessibility
- [ ] Item list reorders immediately upon selecting a new sort option
- [ ] Sort order toggle (ascending/descending) is available for relevant sort criteria
- [ ] Sort menu is accessible via keyboard navigation for accessibility
- [ ] Selected sort preference persists during the user session
- [ ] Menu closes automatically after selecting an option
- [ ] Visual design is consistent with the application's design system


---

## REQ-067: Filter and Sort Utilities for Item Collection Management

**Date**: 2026-01-02 (created by Claude Agent)
**Type**: NEW FEATURE
**Size**: S

### Summary
Users need the ability to filter and sort their item collections using reusable, testable utility functions that support multiple criteria and ordering options.

### Current Behavior
No standardized filtering or sorting capabilities exist for item collections, requiring custom implementation for each use case.

### Expected Behavior
- Users can filter items based on multiple criteria (category, status, date range, metadata attributes)
- Users can sort items using various comparators (alphabetical, chronological, custom fields)
- Filtering and sorting operations are consistent across the application
- Multiple filters can be combined to narrow down results
- Sort order can be ascending or descending

### User Impact
All users managing item collections will benefit from consistent, predictable filtering and sorting behavior across the application, making it easier to find and organize their content.

### Business Value
Providing robust, reusable filter and sort utilities reduces development time for future features, ensures consistent user experience, and improves maintainability through centralized logic that can be thoroughly tested.

### Acceptance Criteria
- [ ] Users can apply filters to item collections and see only items matching the filter criteria
- [ ] Users can sort item collections by different attributes and see results in the expected order
- [ ] Multiple filters can be applied simultaneously with correct combined results
- [ ] Sort order (ascending/descending) can be toggled and produces correct ordering
- [ ] Filter and sort operations return correct results for edge cases (empty collections, no matches, null values)
- [ ] All filter and sort functions are covered by unit tests demonstrating correct behavior


---

## REQ-068: Multi-Item Selection and Bulk Action Support

**Date**: 2026-01-02 14:23
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to select multiple items from a collection simultaneously and perform bulk actions on the selected set.

### Current Behavior
Users can only interact with items individually, requiring repetitive actions when the same operation needs to be applied to multiple items.

### Expected Behavior
Users can:
- Click on individual items to add them to or remove them from a selection
- Use a "select all" control to quickly select all visible items that match current filters
- Toggle between normal browsing mode and selection mode
- See a clear visual indication of which items are currently selected
- Clear all selections with a single action
- Perform operations on the entire selected set at once

### User Impact
This affects any user managing collections of items who needs to perform the same action on multiple items. It significantly reduces repetitive work and improves efficiency when organizing, categorizing, or performing bulk operations.

### Business Value
Reduces time spent on repetitive tasks and improves user satisfaction by providing standard multi-select functionality expected in modern applications. Enables efficient bulk operations that are foundational for advanced collection management features.

### Acceptance Criteria
- [ ] Individual items can be toggled in and out of the selection independently
- [ ] A "select all" action adds all currently visible (filtered) items to the selection
- [ ] Selection can be cleared completely with a single action
- [ ] Selection mode can be explicitly toggled on or off
- [ ] The selection persists correctly when filters or sorting change
- [ ] Visual feedback clearly indicates which items are selected at all times
- [ ] Selection state is maintained independently from other UI interactions


---

## REQ-069: Selection Mode UI Integration with Visual Feedback

**Date**: 2026-01-02 17:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Item display components should provide interactive selection controls with clear visual feedback to enable users to enter selection mode and identify which items are currently selected.

### Current Behavior
Item display components show content in a static presentation format without selection controls or visual indicators for multi-select operations.

### Expected Behavior
Users can:
- See a checkbox control on each displayed item (both card and row views)
- Tap and hold an item on mobile devices to activate selection mode
- Immediately recognize selected items through distinct visual styling (highlighting, color change, or border treatment)
- View a persistent count showing how many items are currently selected
- Distinguish between normal browsing mode and active selection mode through clear visual state changes

### User Impact
This affects all users who need to perform bulk operations on multiple items. The visual feedback and interaction patterns make the selection feature discoverable and usable, particularly on mobile devices where selection patterns differ from desktop conventions.

### Business Value
Provides standard, intuitive multi-select controls that users expect from modern applications. Mobile-optimized long-press interaction ensures the feature works naturally across all device types without compromising the browsing experience.

### Acceptance Criteria
- [ ] Checkboxes appear on item cards when selection mode is active or available
- [ ] Checkboxes appear on item rows when selection mode is active or available
- [ ] Long-press gesture on mobile devices (touch interfaces) activates selection mode
- [ ] Selected items display a visually distinct appearance (different from unselected state)
- [ ] A selection count indicator shows the current number of selected items
- [ ] Visual state clearly differentiates between selection mode active and selection mode inactive
- [ ] Checkbox controls are accessible and meet WCAG standards for touch target size and keyboard navigation
- [ ] Selection state updates immediately and smoothly when items are selected or deselected



---

## REQ-070: Bulk Actions Bar for Multi-Item Operations

**Date**: 2026-01-02 18:23
**Type**: NEW FEATURE
**Size**: M

### Summary
Users with selected items should see a floating action bar that provides quick access to bulk operations including deletion, tagging, and moving items between properties.

### Current Behavior
Users can select multiple items but have no interface to perform operations on the entire selection. Each item must be managed individually even when many items need the same action applied.

### Expected Behavior
When one or more items are selected, a floating action bar appears on screen containing:
- A "Delete" button to remove all selected items
- An "Add Tag" button to apply tags to all selected items
- A "Remove Tag" button to strip tags from all selected items
- A "Move to Property" button to relocate selected items to a different property (in multi-property scenarios)
- An "Exit Selection Mode" or "Cancel" button to deselect all items and hide the action bar

The bar should remain visible and accessible while items are selected, and automatically hide when selection is cleared or canceled.

### User Impact
This affects all users who manage collections of items and need to perform repetitive operations across multiple items. Users with large inventories or frequent reorganization needs will benefit most significantly, as they can apply changes to dozens of items simultaneously rather than individually.

### Business Value
Dramatically reduces time and effort required for common collection management tasks. Enables users to efficiently organize and maintain larger item collections, which increases engagement and perceived platform capability. Multi-property support facilitates advanced use cases for power users and professional property managers.

### Acceptance Criteria
- [ ] A floating action bar appears when at least one item is selected
- [ ] The action bar disappears when selection is cleared or canceled
- [ ] Delete action removes all selected items (with appropriate confirmation)
- [ ] Add Tag action allows applying one or more tags to all selected items
- [ ] Remove Tag action allows stripping specific tags from all selected items
- [ ] Move to Property action is available and functional in multi-property environments
- [ ] Exit/Cancel button clears the selection and dismisses the action bar
- [ ] The action bar remains accessible and does not obstruct critical content
- [ ] All bulk operations provide feedback on completion (success count, error handling)
- [ ] The action bar is responsive and works correctly on mobile, tablet, and desktop screen sizes


---

## REQ-071: Delete Confirmation Dialog with Item Preview

**Date**: 2026-01-02 15:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Users must confirm item deletion through a dialog that shows what will be deleted, preventing accidental data loss.

### Current Behavior
No delete confirmation dialog exists. Users cannot review which items will be deleted before confirming the destructive action.

### Expected Behavior
When a user initiates a delete action (single or bulk), a confirmation dialog appears showing:
- The number of items to be deleted
- The titles of up to 5 items being deleted
- An overflow indicator when more than 5 items are selected (e.g., "and 3 more")
- Clear cancel and confirm actions with the confirm button styled to indicate a destructive operation

### User Impact
All users managing items will have protection against accidental deletion. Users performing bulk operations will gain confidence knowing exactly what they are about to delete.

### Business Value
Reduces data loss incidents and support requests related to accidental deletions, while improving user trust in bulk operations.

### Acceptance Criteria
- [ ] Confirmation dialog appears when user attempts to delete one or more items
- [ ] Dialog displays accurate count of items to be deleted
- [ ] Dialog shows titles of up to 5 items, with clear truncation message for additional items
- [ ] Confirm button uses destructive styling (red/warning color scheme) to signal danger
- [ ] Cancel button dismisses dialog without performing deletion
- [ ] Confirm button executes deletion and closes dialog
- [ ] Dialog content adapts appropriately for single-item versus bulk deletion scenarios

---

## REQ-072: Bulk Tag Management Dialog

**Date**: 2026-01-02 16:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to add or remove tags from multiple selected items simultaneously through a dedicated dialog interface.

### Current Behavior
Users must tag items individually, requiring repetitive actions when the same tag needs to be applied to or removed from multiple items.

### Expected Behavior
When multiple items are selected, users can open a bulk tag dialog that allows them to:
- Choose between adding tags to all selected items or removing tags from them
- Enter tag names with autocomplete suggestions based on existing tags in the system
- See a preview list of which items will be affected by the tag operation
- Apply the tag changes to all selected items with a single confirmation action

### User Impact
Content creators and organizers who manage large collections will save significant time when categorizing or reorganizing multiple items. Users who need to apply consistent tagging across related items will experience a more efficient workflow.

### Business Value
Reduces friction in content organization workflows and enables users to maintain better-structured collections with less effort, leading to improved content discoverability and user satisfaction.

### Acceptance Criteria
- [ ] Dialog can be opened when one or more items are selected
- [ ] User can toggle between "add tags" and "remove tags" modes
- [ ] Tag input field displays suggestions based on existing tags as user types
- [ ] Dialog shows a preview list of all items that will be affected by the operation
- [ ] User can confirm the operation and all selected items are updated accordingly
- [ ] Dialog can be cancelled without making changes
- [ ] Appropriate feedback is shown when the tag operation completes successfully or fails


---

## REQ-073: Bulk Move Items Between Properties

**Date**: 2026-01-02 (Last Modified: 2026-01-02)
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to select multiple items and move them from one property to another in a single operation when managing multiple properties.

### Current Behavior
Users cannot move multiple items between properties simultaneously. Each item must be moved individually, requiring repetitive actions when reorganizing inventory across properties.

### Expected Behavior
When users have selected multiple items and are operating in multi-property mode, they can initiate a bulk move operation that:
- Presents a dialog to select which property should receive the items
- Shows a clear preview of which items will be moved
- Executes the transfer to the selected property upon confirmation

The bulk move option should not be visible or accessible when the user is working in single-property mode.

### User Impact
Property managers overseeing multiple locations can reorganize inventory more efficiently. This particularly benefits users who need to redistribute items between properties during seasonal changes, renovations, or property portfolio adjustments.

### Business Value
Reduces time spent on inventory management tasks and improves operational efficiency for multi-property users, making the platform more competitive for professional property managers.

### Acceptance Criteria
- [ ] When multiple items are selected in multi-property mode, a bulk move action is available
- [ ] Initiating the bulk move action opens a dialog with a property selector
- [ ] The dialog displays a preview of all selected items that will be moved
- [ ] Users can select the destination property from the available properties
- [ ] Upon confirmation, all selected items are transferred to the chosen property
- [ ] The bulk move action is not visible or accessible in single-property mode
- [ ] Users can cancel the operation without making changes
- [ ] After successful move, users receive confirmation of how many items were transferred


---

## REQ-074: Item Preview Modal with Mobile-Friendly Drawer

**Date**: 2026-01-02 10:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to preview captured item details in a responsive modal overlay that adapts to mobile devices as a slide-up drawer.

### Current Behavior
After capturing an item (photo, video, text, or file), there is no immediate preview interface allowing users to review what they've captured before proceeding with save or edit actions.

### Expected Behavior
When a user completes an item capture action, a preview interface appears that:
- Displays as a centered modal overlay on desktop/tablet screens
- Transforms into a slide-up drawer on mobile devices for thumb-friendly interaction
- Shows the captured item content in an appropriate preview format
- Provides a clearly visible close button
- Closes when the user taps outside the content area (overlay click)
- Closes when the user presses the Escape key
- Supports smooth animations for open/close transitions
- Maintains focus within the modal for keyboard navigation

### User Impact
All users capturing items through the Item Capture Manager will benefit from immediate visual confirmation of their captured content. Mobile users particularly benefit from the drawer-style interface that's optimized for one-handed use and doesn't obscure their captured content.

### Business Value
Improves user confidence in the capture workflow by providing immediate feedback and reducing capture errors. The mobile-optimized experience increases engagement on mobile devices, which represent the majority of property management interactions.

### Acceptance Criteria
- [ ] Preview interface opens immediately after successful item capture
- [ ] On desktop/tablet (viewport width ≥768px), content appears as a centered modal overlay
- [ ] On mobile (viewport width <768px), content appears as a drawer sliding up from bottom
- [ ] Close button is visible and accessible in all viewport sizes
- [ ] Clicking/tapping the overlay background closes the preview
- [ ] Pressing the Escape key closes the preview
- [ ] Opening the preview prevents scrolling of content behind it
- [ ] Closing the preview restores normal scrolling behavior
- [ ] Transition animations are smooth and complete within 300ms
- [ ] Keyboard focus is trapped within the modal when open
- [ ] Screen readers announce the modal opening and closing appropriately


---

## REQ-075: Interactive Media Gallery with Swipe Navigation

**Date**: 2026-01-02 14:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to browse through multiple media items (photos, videos) in a carousel-style gallery with touch/swipe gestures, thumbnail navigation, and the ability to view media in full-screen mode.

### Current Behavior
No dedicated media gallery component exists. Users cannot interactively browse through multiple media items associated with an inventory item.

### Expected Behavior
- Users can swipe left/right (or click arrows) to navigate between media items in the carousel
- A thumbnail strip displays all available media items, allowing direct selection of any specific item
- Users can tap a full-screen button to expand the current media to fill the entire viewport
- Visual indicators clearly distinguish between different media types (e.g., photo vs. video)
- The gallery responds smoothly to touch gestures on mobile devices
- The currently viewed media item is highlighted in the thumbnail strip

### User Impact
Property owners and staff viewing inventory item details will have an intuitive, efficient way to review all associated media. This improves the inspection and verification workflow, particularly for items with multiple photos or videos documenting condition, angles, or details.

### Business Value
Enhances the item detail experience with industry-standard media browsing patterns, reducing friction in reviewing inventory documentation and enabling faster decision-making.

### Acceptance Criteria
- [ ] Carousel displays one media item at a time and responds to swipe gestures (touch) and arrow clicks (desktop)
- [ ] Thumbnail strip shows all media items with the active item visually highlighted
- [ ] Clicking a thumbnail navigates directly to that media item in the carousel
- [ ] Full-screen toggle button expands the current media to fill the viewport and provides a way to exit full-screen
- [ ] Photos and videos have distinct visual indicators (e.g., play icon overlay on video thumbnails)
- [ ] Navigation controls are accessible and visible on both mobile and desktop viewports
- [ ] Gallery gracefully handles edge cases (single media item, no media, mixed media types)


---

## REQ-076: Video Playback Interface with Standard Controls

**Date**: 2026-01-02 15:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to watch video content in the item preview with standard playback controls including play/pause, seeking, volume adjustment, and full-screen viewing.

### Current Behavior
Video items captured or uploaded through the application lack a functional playback interface. Users cannot review video content with interactive controls.

### Expected Behavior
When viewing a video item in the preview or detail view, users see:
- A video player that automatically loads the video content
- Play and pause controls that respond immediately to user interaction
- A seek bar allowing users to jump to any point in the video timeline
- Volume controls with visual feedback showing current volume level
- A full-screen button that expands the video to fill the entire viewport
- Playback progress indicator showing current time and total duration
- Controls that appear on hover (desktop) or tap (mobile) and fade after a few seconds of inactivity
- Responsive sizing that adapts the player to available screen space

### User Impact
Property managers and staff reviewing inventory documentation containing video walkthroughs, condition assessments, or operational demonstrations gain the ability to watch, pause, and review specific moments efficiently. This is particularly valuable when documenting high-value items, complex equipment, or condition issues requiring detailed visual evidence.

### Business Value
Enables comprehensive video-based inventory documentation, meeting professional property management standards and providing defensible records for insurance claims, disputes, or audits.

### Acceptance Criteria
- [ ] Video player loads and displays video content when a video item is selected
- [ ] Play button initiates playback and transforms into a pause button
- [ ] Pause button stops playback and transforms back into a play button
- [ ] Seek bar displays current playback position and allows clicking/dragging to jump to any timestamp
- [ ] Volume control adjusts audio level with visual feedback (mute toggle and volume slider)
- [ ] Full-screen button expands video to fill the viewport with controls remaining accessible
- [ ] Exiting full-screen mode returns the player to its original size and position
- [ ] Playback progress shows current time and total video duration in readable format (e.g., "1:23 / 4:56")
- [ ] Controls auto-hide after 3 seconds of mouse/touch inactivity during playback
- [ ] Moving the mouse or tapping the screen reveals controls again
- [ ] Player is accessible via keyboard (spacebar for play/pause, arrow keys for seeking)
- [ ] Player handles common video formats (MP4, WebM) across modern browsers

---

## REQ-077: Interactive Photo and PDF Viewer with Navigation Controls

**Date**: 2026-01-02 (Current Time)
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to zoom into photos and navigate through multi-page PDF documents when viewing captured item attachments in the preview/detail view.

### Current Behavior
The item preview/detail view displays photos and PDFs, but users cannot interact with these documents beyond basic viewing. Photos cannot be enlarged for closer inspection, and PDF documents cannot be navigated when they contain multiple pages.

### Expected Behavior
When viewing a photo attachment, users can:
- Tap or use pinch gestures to zoom in and examine details
- Pan around the zoomed image to view different areas
- Zoom out to return to the original view

When viewing a PDF attachment, users can:
- Navigate forward and backward through pages
- See the current page number and total page count (e.g., "3 / 12")
- Understand their position within the document

### User Impact
Property managers and inventory personnel frequently need to verify small details in photos (damage, serial numbers, text) and review multi-page documents (manuals, receipts, warranty information). This feature enables thorough inspection and efficient document navigation without leaving the application.

### Business Value
Improves verification accuracy and reduces the need to export documents to external viewers, streamlining the item documentation workflow.

### Acceptance Criteria
- [ ] Users can zoom into photos using tap or pinch gestures
- [ ] Zoomed photos can be panned to view different areas
- [ ] Users can navigate between pages in multi-page PDF documents
- [ ] PDF viewer displays current page number and total page count
- [ ] Navigation controls are intuitive and respond immediately to user input
- [ ] Zoom and navigation state resets when switching between different attachments


---

## REQ-078: Instructions Viewer for Item Preview

**Date**: 2026-01-02 (System date at time of creation)
**Type**: NEW FEATURE
**Size**: S

### Summary
Users need the ability to view formatted instruction text associated with captured items in a readable, scrollable interface.

### Current Behavior
There is no dedicated component to display instruction content for items in the preview/detail view.

### Expected Behavior
When viewing an item that includes instructions, users should see the instructions rendered with proper formatting (headings, lists, emphasis, etc.) in a dedicated scrollable viewing area that handles content of varying lengths gracefully.

### User Impact
Users who create or review items with instructional content will be able to read and understand formatted instructions more easily, improving comprehension and usability of instruction-heavy items.

### Business Value
Enhances the item detail experience by providing clear, formatted display of instructions, supporting better content consumption and reducing user confusion when reviewing complex instructional content.

### Acceptance Criteria
- [ ] Instructions are rendered with markdown formatting preserved (headings, bold, italic, lists, etc.)
- [ ] Content area is scrollable when instructions exceed the visible area
- [ ] The viewer integrates seamlessly within the item preview/detail interface
- [ ] Long instruction content does not break the layout or become unreadable
- [ ] The component uses the existing markdown rendering dependency already present in the project

---

## REQ-079: Item Preview Action Controls with Asset Management

**Date**: 2026-01-02 (System timestamp preserved)
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need quick access to common actions when previewing item details, including editing metadata, managing associated assets, and deletion with safety confirmation.

### Current Behavior
The item preview displays item information but lacks integrated action controls. Users must navigate away from the preview to perform common item management tasks.

### Expected Behavior
When viewing an item preview or detail view, users see a clear set of action buttons that allow them to:
- Edit the item's core information and metadata
- Access a dedicated panel to manage all associated assets (photos, videos, documents)
- Delete the item after confirming their intention

The preview also displays key metadata including the item's title, location information, and any assigned tags for quick reference.

### User Impact
Property managers and staff can perform common item operations directly from the preview interface without navigating to separate management screens. This reduces friction in the workflow when reviewing, organizing, or maintaining item records.

### Business Value
Streamlines the item management workflow by consolidating common actions into the preview interface, reducing the number of navigation steps required for routine operations and improving overall efficiency.

### Acceptance Criteria
- [ ] An Edit button is visible in the item preview that triggers the edit item callback when pressed
- [ ] A Manage Assets button is present that opens a dedicated asset management panel
- [ ] A Delete button is available with appropriate visual treatment (warning/danger styling)
- [ ] When the Delete button is pressed, a confirmation dialog appears before any deletion occurs
- [ ] The item's title is prominently displayed in the preview header
- [ ] Location information is shown when available for the item
- [ ] Tags assigned to the item are displayed in an easily scannable format
- [ ] All action buttons remain accessible and usable on mobile device screen sizes
- [ ] The asset management panel shows all media and documents associated with the item
- [ ] Confirmation dialog clearly identifies which item will be deleted and asks for explicit confirmation

---

## REQ-080: Asset Management State Hook for Batched Operations

**Date**: 2026-01-02 15:42
**Type**: NEW FEATURE
**Size**: M

### Summary
The system needs a centralized state management mechanism that tracks pending changes to item assets and batches all modifications until explicitly committed by the user.

### Current Behavior
Asset operations (adding photos, removing videos, reordering documents) are either applied immediately without user confirmation or lack a cohesive state management approach. Users cannot preview or review their pending changes before finalizing them.

### Expected Behavior
When users interact with item assets in a management interface, the system:
- Tracks all pending additions, removals, and reordering operations in temporary state
- Allows users to perform multiple modifications without immediately persisting changes
- Displays a clear indication of which changes are pending but not yet saved
- Commits all batched changes only when the user explicitly confirms via a "Done" or "Save Changes" action
- Discards all pending changes if the user cancels or navigates away without saving

Users can add multiple assets, remove unwanted ones, and reorder the sequence, then review all changes before finalizing them in a single atomic operation.

### User Impact
Property managers gain confidence when organizing item assets because they can experiment with different arrangements, add or remove multiple files, and review the complete set of changes before committing. This eliminates anxiety about accidental immediate modifications and reduces the need for multiple save operations.

### Business Value
Improves data integrity by allowing users to stage and review changes before persisting them, reducing errors from premature or accidental saves. Supports a more professional asset management workflow aligned with user expectations from modern content management systems.

### Acceptance Criteria
- [ ] Pending additions to the asset collection are tracked in temporary state separate from committed assets
- [ ] Pending removals are tracked without immediately deleting assets from the server or database
- [ ] Reordering operations update only the temporary state until committed
- [ ] An action is provided to add new assets to the pending changes collection
- [ ] An action is provided to mark existing assets for removal in the pending changes
- [ ] An action is provided to reorder assets within the pending changes collection
- [ ] All pending changes are clearly distinguishable from the original asset state
- [ ] When changes are committed, all pending operations are applied in the correct sequence
- [ ] When changes are discarded, the asset state returns to its original configuration
- [ ] The temporary state correctly handles edge cases such as adding then removing the same asset before committing

---

## REQ-081: AssetPanel Slide-In Drawer for Media Management

**Date**: 2026-01-02 17:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need a dedicated slide-in panel to view, add, and manage media assets for an item without leaving the current screen or navigating to a separate page.

### Current Behavior
There is no dedicated interface for managing an item's asset collection within the item preview or management context. Users lack a focused workspace for reviewing existing assets and adding new media while maintaining context of the parent item.

### Expected Behavior
When users trigger asset management for an item, a drawer slides in from the right side of the screen displaying:
- A scrollable list of the item's current assets, each shown with a representative thumbnail
- An "Add Media" button that initiates the process to capture or upload new assets
- A "Done" button to confirm and save pending changes
- A "Cancel" button to discard pending changes and close the drawer

The drawer overlays the current view without forcing navigation, maintains focus on asset management, and provides clear visual feedback for all actions. Users can review the full asset collection, add new media, and finalize or abandon their changes in a single, cohesive interface.

### User Impact
Property managers gain a streamlined, focused workspace for managing item media without losing context or interrupting their workflow. The slide-in panel keeps them oriented within the item they're editing while providing dedicated space for asset operations. This reduces cognitive load and makes media management feel integrated rather than disruptive.

### Business Value
Improves user efficiency and satisfaction by providing a modern, contextual interface for asset management. The drawer pattern aligns with contemporary UX standards and reduces friction in a frequently-used workflow, making the platform feel more polished and professional.

### Acceptance Criteria
- [ ] A drawer component slides in from the right side of the screen when asset management is triggered
- [ ] The drawer displays a scrollable list of all current assets for the item
- [ ] Each asset in the list is shown with an appropriate thumbnail image
- [ ] An "Add Media" button is prominently displayed within the drawer
- [ ] A "Done" button is available to commit pending asset changes and close the drawer
- [ ] A "Cancel" button is available to discard pending changes and close the drawer
- [ ] The drawer does not navigate away from the current page or lose user context
- [ ] The drawer is visually distinct from the underlying content and clearly indicates it is an overlay
- [ ] The drawer is accessible via keyboard navigation and screen readers
- [ ] On mobile devices, the drawer provides an appropriate responsive experience
- [ ] Clicking outside the drawer or pressing the Escape key triggers the cancel behavior


---

## REQ-082: Individual Asset Card Component with Media Type Indicators

**Date**: 2026-01-02 13:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Users need to visually identify and manage individual media assets within the asset management panel, with clear type indicators, metadata display, and the ability to remove unwanted assets.

### Current Behavior
There is no component to represent individual assets within the asset management panel. Users cannot see thumbnails, identify media types, view relevant metadata like duration or page count, or remove specific assets from the collection.

### Expected Behavior
When viewing the asset management panel, each media asset is displayed as a card with a thumbnail preview, a visual indicator showing whether it's a video, photo, or PDF, relevant metadata (such as video duration or PDF page count), and a remove button to delete the asset from the item.

### User Impact
Property managers can quickly scan their media assets visually, immediately identify the type of each asset, understand key metadata at a glance (like how long a video is or how many pages a PDF contains), and easily remove assets that were added by mistake or are no longer needed. This makes asset management intuitive and efficient.

### Business Value
Provides essential visual feedback and control mechanisms for media management, reducing errors and improving user confidence. Clear type indicators and metadata display help users make informed decisions about their content without needing to open each asset individually.

### Acceptance Criteria
- [ ] Each asset is displayed as a distinct card or list item within the asset management panel
- [ ] A thumbnail image is shown for each asset, representing its content
- [ ] A visual type indicator clearly shows whether the asset is a video, photo, or PDF
- [ ] For video assets, the duration is displayed in a readable format (e.g., "1:24")
- [ ] For PDF assets, the page count is displayed (e.g., "5 pages")
- [ ] Photo assets do not display duration or page count
- [ ] Each asset card includes a remove button that is clearly labeled or iconified
- [ ] Clicking the remove button removes the asset from the collection
- [ ] The thumbnail accurately represents the asset content (e.g., first frame for video, page preview for PDF)
- [ ] Type indicators use consistent iconography or labeling across all asset types
- [ ] The component layout remains visually clean and scannable even with multiple assets

---

## REQ-083: Asset Drop Zone Component for File Upload

**Date**: 2026-01-02 (Created by System)
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need a drag-and-drop upload area where they can easily add asset files by dragging them from their file system or clicking to browse, with immediate visual feedback about which files will be uploaded.

### Current Behavior
No dedicated drag-and-drop upload interface exists for asset management workflows.

### Expected Behavior
Users see a clearly defined drop zone area where they can:
- Drag files from their desktop or file manager and drop them onto the zone
- Click anywhere on the zone to open a traditional file picker dialog
- See their selected files listed with preview information before upload begins
- Receive immediate feedback if a file type is not supported
- View thumbnails or icons representing each queued file

The drop zone should visually respond to drag events (e.g., highlighting when files are dragged over it) and clearly indicate its purpose when empty.

### User Impact
Content creators, property managers, and administrators uploading assets will benefit from:
- Faster file selection through drag-and-drop instead of only browse dialogs
- Reduced errors by seeing validation feedback before submission
- Better confidence through preview of queued files
- More intuitive upload experience aligned with modern web application standards

### Business Value
Streamlines asset upload workflows, reducing time spent on file management tasks and improving user satisfaction with the platform's media handling capabilities.

### Acceptance Criteria
- [ ] User can drag one or multiple files from their file system onto the drop zone area
- [ ] User can click on the drop zone to open a file picker dialog
- [ ] Drop zone provides visual feedback when files are dragged over it (highlight, border change, or similar indicator)
- [ ] Files with unsupported types are rejected with a clear error message
- [ ] Accepted files appear in a queue with preview information (file name, size, and thumbnail/icon)
- [ ] User can see all queued files before confirming upload
- [ ] Drop zone clearly indicates its purpose when no files are queued (e.g., instructional text or icon)


---

## REQ-084: Drag-and-Drop Reordering for Captured Assets

**Date**: 2026-01-02 10:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
Users should be able to reorder captured assets by dragging and dropping them into their preferred sequence.

### Current Behavior
Assets are displayed in the order they were captured or added, with no ability to change the sequence after capture. Users must accept the chronological order or delete and re-add items to achieve a different arrangement.

### Expected Behavior
Users can click and hold on an asset item, drag it to a new position in the list, and release to reorder. The system provides clear visual feedback during the drag operation, including:
- A visible drag handle on each asset item that indicates the item can be moved
- Visual indication that an item is being dragged (e.g., elevation, opacity change)
- A clear indicator showing where the item will be dropped when released
- Smooth animations when items shift to accommodate the new position

### User Impact
Content creators and users managing multiple assets gain fine-grained control over presentation order without needing to re-capture or re-upload items. This is particularly valuable when the logical sequence differs from the capture sequence, such as when reorganizing a photo gallery or reordering demonstration steps.

### Business Value
Enhances user autonomy and reduces friction in the content creation workflow, leading to higher quality asset collections and improved user satisfaction with the capture experience.

### Acceptance Criteria
- [ ] Each asset item displays a visible drag handle or clearly indicates it can be dragged
- [ ] When dragging begins, the dragged item provides visual feedback distinct from its normal state
- [ ] While dragging, a clear drop position indicator shows where the item will be placed
- [ ] Releasing the item at a valid position reorders the asset list and persists the new sequence
- [ ] The drag-and-drop interaction works smoothly across touch and mouse input devices
- [ ] Accessibility features support keyboard-based reordering for users who cannot use drag-and-drop
- [ ] The reordering operation does not cause data loss or corruption of asset metadata



---

## REQ-085: Asset Removal Confirmation with Visual Preview

**Date**: 2026-01-02 17:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
Users should see a confirmation dialog with visual preview when removing an individual asset from the asset management panel.

### Current Behavior
When users click the remove button on an asset item, the removal may occur immediately without confirmation, or with a generic text-only confirmation that provides no visual context about what is being deleted.

### Expected Behavior
When a user initiates the removal of an asset by clicking the remove button:
- A confirmation dialog appears displaying the asset's thumbnail preview
- The dialog clearly identifies what type of media is being removed (video, photo, or PDF)
- For videos, the thumbnail includes duration information
- For PDFs, the thumbnail shows page count information
- The dialog presents clear action options: a "Cancel" button and a "Remove" button with destructive styling
- Only when the user confirms by clicking "Remove" does the asset get removed from the collection

### User Impact
Users managing photo galleries, video collections, or mixed media sets gain protection against accidental removal of important assets. The visual preview helps users verify they are removing the correct item, particularly valuable when managing similar-looking assets or working with many items at once.

### Business Value
Reduces user frustration from accidental asset deletion and prevents content loss, which improves confidence in the asset management workflow and reduces support requests for asset recovery.

### Acceptance Criteria
- [ ] Clicking the remove button on any asset item triggers a confirmation dialog before removal
- [ ] The confirmation dialog displays the asset's thumbnail with appropriate scaling and aspect ratio preservation
- [ ] The dialog shows the asset type indicator (video, photo, or PDF) clearly visible
- [ ] For video assets, the confirmation dialog displays the video duration
- [ ] For PDF assets, the confirmation dialog displays the page count
- [ ] The dialog presents a "Cancel" button that closes the dialog without removing the asset
- [ ] The dialog presents a "Remove" button with destructive styling (e.g., red color, warning icon)
- [ ] The asset is only removed from the collection when the user explicitly clicks the "Remove" button
- [ ] The confirmation dialog can be dismissed by clicking outside the dialog or pressing the Escape key, which cancels the removal


---

## REQ-086: Inline Text Editing Component with Keyboard Navigation

**Date**: 2026-01-02 18:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to click on text fields to edit them in place with immediate visual feedback, keyboard shortcuts for save and cancel, and clear indication of loading and error states.

### Current Behavior
Text fields require navigation to separate edit pages or forms, or they lack visual feedback during editing operations. Users cannot quickly edit text values in context, and there is no standardized pattern for inline editing with proper state management across the application.

### Expected Behavior
When a user clicks on an editable text field:
- The text transforms into an editable input field with focus automatically set
- The original text is preserved and can be restored if the user cancels
- Pressing Enter or clicking outside the input field saves the changes
- Pressing Escape cancels the edit and restores the original text
- During save operations, a loading indicator appears to show the system is processing
- If the save fails, an error message displays near the input field explaining what went wrong
- The component returns to read-only display mode after successful save or cancellation
- Visual styling clearly distinguishes between read-only, editing, loading, and error states

### User Impact
Users managing item metadata, property details, or other text-based information can make quick edits without leaving their current context. This streamlines workflows for updating names, descriptions, tags, and other text fields, particularly when making multiple small updates across different items or properties.

### Business Value
Reduces friction in content management workflows and improves user productivity by eliminating unnecessary navigation and form submissions for simple text updates. Provides a consistent editing experience across all editable text fields in the application.

### Acceptance Criteria
- [ ] Clicking on the component transitions it from read-only display to edit mode with an active text input
- [ ] The text input receives keyboard focus automatically when entering edit mode
- [ ] The original text value is preserved and available for restoration during the edit session
- [ ] Pressing the Enter key triggers the save operation
- [ ] Clicking outside the input field (blur event) triggers the save operation
- [ ] Pressing the Escape key cancels the edit and restores the original text without saving
- [ ] During save operations, a loading indicator is visible within or near the input field
- [ ] The input field is disabled during the save operation to prevent further edits
- [ ] If the save operation fails, an error message displays with clear explanation of the failure
- [ ] The error message is positioned near the input field and is clearly associated with it
- [ ] After a successful save, the component returns to read-only display mode showing the updated text
- [ ] After cancellation, the component returns to read-only display mode showing the original text
- [ ] Visual styling clearly distinguishes between all states: read-only, editing, loading, and error
- [ ] The component is keyboard-accessible and works without a mouse
- [ ] The component handles empty string values appropriately

---

## REQ-087: Enable Inline Editing for Item Titles and Locations

**Date**: 2026-01-02 (Current Session)
**Type**: ENHANCEMENT
**Size**: M

### Summary
Users should be able to edit item titles and locations directly within the item card or row display without navigating to a separate form or view.

### Current Behavior
Users must navigate away from the item list view or use a separate editing interface to modify item titles and locations. This interrupts the browsing and management workflow.

### Expected Behavior
When inline editing is enabled, users can click on an item's title or location field and edit the text directly in place. Changes are saved through a callback mechanism and the display updates immediately to reflect the new values.

### User Impact
Property managers and hosts managing multiple items will experience a more streamlined workflow. Quick corrections to item names or location details can be made without context switching, reducing the time spent on inventory management tasks.

### Business Value
Reduces friction in the item management workflow, leading to more accurate and up-to-date inventory data. Faster editing encourages users to maintain better quality information in their listings.

### Acceptance Criteria
- [ ] Item cards display an edit indicator when inline editing is enabled
- [ ] Clicking on a title or location field activates the inline editor
- [ ] Text changes are transmitted through the update callback when the user confirms the edit
- [ ] The inline edit feature can be toggled on or off through a configuration flag
- [ ] Visual feedback indicates when an item is in edit mode versus display mode
- [ ] Changes are reflected in the display immediately after successful save
- [ ] Users can cancel an edit in progress and revert to the original value


---

## REQ-088: Enable Inline Editing for Item Tags

**Date**: 2026-01-02 (Current Session)
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to add, remove, and edit tags directly within the item view without navigating to a separate editing mode or form.

### Current Behavior
Tags can only be managed through a dedicated editing interface that requires users to enter edit mode, make changes, and save explicitly.

### Expected Behavior
Users can click on the tags area within an item to immediately add new tags or remove existing ones. As users type, the system suggests tags that have been used on other items to maintain consistency. Tags appear as interactive chips that can be clicked to remove them.

### User Impact
All users managing inventory items will experience a faster, more intuitive tagging workflow. This particularly benefits users who frequently categorize and organize items, as they can make quick adjustments without context switching.

### Business Value
Reduces friction in the tagging workflow, encouraging better item organization and more consistent categorization across the inventory. Better-tagged items improve searchability and overall system usability.

### Acceptance Criteria
- [ ] Clicking on the tags area activates inline editing mode
- [ ] Users can type to add new tags without leaving the current view
- [ ] Existing tags from other items are suggested as users type
- [ ] Each tag is displayed as a removable chip with a clear deletion action
- [ ] Changes are persisted immediately or with minimal explicit save action
- [ ] The interface clearly indicates when tags are in edit mode versus view mode
- [ ] Tag suggestions are relevant and based on the user's existing tag vocabulary

---

## REQ-089: Mobile UX Polish and Touch Optimization

**Date**: 2026-01-02 15:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The application should provide a polished, mobile-optimized experience with appropriately sized touch targets, gesture support, and adaptive UI components for small screens.

### Current Behavior
The interface is designed primarily for desktop use with mouse interactions. On mobile devices, users encounter touch targets that are too small, panels that obscure content, and previews that don't adapt well to mobile viewports.

### Expected Behavior
On mobile devices, all interactive elements meet minimum touch target sizes for comfortable tapping. Filter panels automatically collapse to maximize screen space. Item previews appear as bottom sheets that slide up from the screen bottom rather than as centered modals. Users can optionally use swipe gestures to navigate through items or perform quick actions.

### User Impact
Property managers and staff using mobile devices while physically inspecting or managing items will have a significantly improved experience. Touch interactions will be more reliable, screen space will be used efficiently, and the interface will feel native to mobile platforms.

### Business Value
Improves accessibility and usability on mobile devices, expanding the range of contexts where the application can be effectively used. Better mobile experience reduces user frustration and increases adoption among field staff.

### Acceptance Criteria
- [ ] All interactive buttons, links, and controls meet the minimum 48x48 pixel touch target size on mobile viewports
- [ ] Filter panels collapse automatically on mobile screens to maximize content visibility
- [ ] Users can expand collapsed filter panels with a clear, accessible toggle control
- [ ] Item preview displays as a bottom sheet on mobile devices instead of a centered modal
- [ ] Bottom sheet preview can be dismissed by swiping down or tapping outside the content area
- [ ] Swipe gestures for navigation or quick actions are implemented where contextually appropriate
- [ ] All touch interactions provide appropriate visual and haptic feedback where supported
- [ ] The mobile experience is tested on both iOS and Android devices


---

## REQ-090: Comprehensive Accessibility Audit and Compliance

**Date**: 2026-01-02 14:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system must provide full accessibility compliance to ensure all users, including those using assistive technologies, can successfully navigate and interact with all features.

### Current Behavior
The current implementation may have accessibility gaps including incomplete keyboard navigation, missing focus indicators, inadequate ARIA labeling, and untested screen reader compatibility across interactive components and modal dialogs.

### Expected Behavior
All interactive elements and workflows should be fully accessible via keyboard alone, with clear visual focus indicators throughout. Modal dialogs and dynamic content changes should properly manage focus and announce state changes to assistive technologies. All controls should have appropriate ARIA labels and roles that accurately describe their purpose and state to screen reader users.

### User Impact
Users who rely on keyboard navigation, screen readers, or other assistive technologies will gain equal access to all system features. This includes users with visual impairments, motor disabilities, or those who prefer keyboard-based workflows for efficiency.

### Business Value
Ensures legal compliance with accessibility standards (WCAG 2.1 AA), expands the potential user base to include people with disabilities, and demonstrates commitment to inclusive design principles.

### Acceptance Criteria
- [ ] All interactive elements are reachable and operable using only keyboard (Tab, Enter, Space, Arrow keys)
- [ ] Focus indicators are clearly visible on all focusable elements with sufficient color contrast
- [ ] Modal dialogs trap focus appropriately and return focus to the triggering element upon close
- [ ] All form controls, buttons, and interactive elements have descriptive ARIA labels and appropriate roles
- [ ] Dynamic content changes and state updates are announced to screen readers
- [ ] Screen reader testing confirms logical reading order and meaningful announcements across all major workflows
- [ ] No keyboard traps exist where users cannot escape using standard navigation


---

## REQ-091: Usage Statistics and User Reactions Integration

**Date**: 2026-01-05 (current system time)
**Type**: ENHANCEMENT
**Size**: M

### Summary
Item listings should display visit counts and reaction summaries to help users understand which content is most engaging and useful to their guests.

### Current Behavior
The item management interface shows basic item metadata (title, location, tags, media) but does not display any engagement metrics. Users cannot see how many times items have been viewed or what reactions guests have provided, even though this data is being collected and stored in the system.

### Expected Behavior
Each item should display its total view count and a summary of guest reactions (likes, loves, etc.). Users should be able to see this information at a glance in both grid and list views, and access detailed analytics when viewing individual items. The back office should provide insights into which items are most frequently accessed or appreciated by guests.

### User Impact
Property managers and staff will gain visibility into which items generate the most guest interest, helping them understand what information is most valuable. This feedback loop enables data-driven decisions about what content to create, update, or prioritize.

### Business Value
Transforms passive content management into an insights-driven workflow by surfacing existing engagement data that is already being collected. Helps users understand their content's impact without additional data collection overhead.

### Acceptance Criteria
- [ ] Item listings show total visit count for each item
- [ ] Item listings display reaction summaries showing count by reaction type
- [ ] Detailed item view provides access to complete analytics including visit history and reaction breakdown
- [ ] Analytics data updates reflect recent guest interactions without requiring page refresh
- [ ] Back office interface includes item-level analytics accessible to property managers
- [ ] Visual indicators clearly distinguish between high-engagement and low-engagement items
- [ ] Performance remains acceptable when displaying analytics for large item collections

---

## REQ-092: Support for URL/Link Items with Metadata Preview

**Date**: 2026-01-05 14:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
Users should be able to add URLs and web links as items alongside images, videos, PDFs, and text content, with automatic metadata extraction and rich preview display.

### Current Behavior
The system supports four content types: images, videos, PDFs, and text/markdown. When users want to reference external resources such as product manuals, tutorial videos, or related web pages, they must either describe them in text or cannot include them at all. The database schema includes a links table that is not currently utilized by the user interface.

### Expected Behavior
Users can select "URL/Link" as a content type during item creation. After entering a URL, the system automatically fetches and displays metadata including the page title, preview image, and website icon. For video platforms like YouTube, the system extracts the video identifier and displays the appropriate thumbnail. The saved link appears in item listings with a visual preview card showing the thumbnail, title, and source domain, and opens the external page when clicked.

### User Impact
Property hosts managing appliances, amenities, and services will be able to enrich item documentation with external resources. Guests viewing items will have direct access to manufacturer manuals, instructional videos, product pages, and related external content without leaving the application context.

### Business Value
This enhancement extends the existing media type system to support modern web-based documentation patterns, making property information more comprehensive and reducing support inquiries by providing guests with manufacturer resources and tutorial content.

### Acceptance Criteria
- [ ] Users can select URL/Link as a content type option during item creation
- [ ] After entering a URL, the system displays a preview showing the fetched title and thumbnail
- [ ] YouTube URLs automatically display the video thumbnail without requiring API authentication
- [ ] Saved URL items appear in item lists with thumbnail, title, and domain indicator
- [ ] Clicking a URL item opens the link in a new browser tab
- [ ] URL items integrate seamlessly with existing item display components and layouts
- [ ] Invalid or inaccessible URLs display appropriate fallback content with the domain name and URL visible


---

## REQ-093: Component Infrastructure for Item Creation Workflow

**Date**: 2026-01-05 14:32
**Type**: NEW FEATURE
**Size**: M

### Summary
Establish the foundational component structure, type definitions, and configuration constants needed for the item creation workflow system.

### Current Behavior
No dedicated component structure exists for managing the item creation workflow. Type definitions, constants, and organizational scaffolding are scattered or missing.

### Expected Behavior
A well-organized component directory with:
- Clear type definitions for all workflow entities and states
- Centralized constants defining room types, item categories, and suggestion logic
- Barrel exports enabling clean imports throughout the application
- A foundation that supports subsequent workflow step implementations

### User Impact
Developers building the item creation workflow will have a clear, type-safe foundation to work from. This reduces implementation errors, improves code discoverability, and establishes consistent patterns across the workflow components.

### Business Value
Accelerates development of the item creation feature by providing reusable infrastructure. Reduces technical debt and maintenance burden through proper typing and organization from the start.

### Acceptance Criteria
- [ ] Component directory structure is created following project conventions
- [ ] All workflow-related TypeScript interfaces are defined and documented
- [ ] Constants file includes room types, item types, and suggestion matrix
- [ ] Barrel export files enable importing from the component root
- [ ] Type definitions compile without errors and satisfy strict mode requirements
- [ ] Constants are structured to support future extensibility without breaking changes

