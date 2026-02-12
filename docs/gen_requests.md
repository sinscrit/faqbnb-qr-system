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


---

## REQ-094: Workflow State Management with Step Navigation

**Date**: 2026-01-05 00:00
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a centralized state management solution that controls multi-step workflow progression, including forward and backward navigation, conditional step skipping, and navigation history tracking.

### Current Behavior
There is no unified workflow state management mechanism. Step transitions, navigation history, and conditional flow logic are either not implemented or handled inconsistently across different parts of the application.

### Expected Behavior
Users can seamlessly progress through multi-step workflows with the following capabilities:
- Move forward to the next logical step
- Navigate backward through previously visited steps
- Automatically skip irrelevant steps based on context (e.g., when "General" room category is selected, item type selection is bypassed)
- Have their navigation history preserved to enable accurate back-button behavior
- Experience consistent state transitions regardless of which workflow they're using

### User Impact
Affects all users who interact with multi-step workflows in the application. Improves user experience by providing intuitive navigation controls, preventing invalid state transitions, and allowing users to review and modify earlier choices without losing progress.

### Business Value
Establishes a scalable foundation for all multi-step user workflows. Reduces development time for future workflow features by providing reusable state management patterns and ensures consistent user experience across different workflows.

### Acceptance Criteria
- [ ] Users can progress forward through workflow steps in the correct sequence
- [ ] Users can navigate backward to any previously visited step without data loss
- [ ] When applicable conditions are met, irrelevant steps are automatically skipped without user intervention
- [ ] Navigation history accurately reflects the actual path taken through the workflow
- [ ] All state transitions follow predictable patterns that handle edge cases gracefully
- [ ] The state management solution can be reused across different workflow types


---

## REQ-095: Main Workflow Component with Step Rendering

**Date**: 2026-01-05 (Modified: 2026-01-05)
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need a unified workflow interface that guides them through the item creation process by displaying the appropriate step based on their current progress and allowing them to navigate safely between steps.

### Current Behavior
No main workflow component exists to orchestrate the item creation process. Users cannot progress through a guided multi-step experience when creating items.

### Expected Behavior
When users begin creating an item, they are presented with a cohesive workflow interface that:
- Displays the current step's content based on where they are in the process
- Shows a visual progress indicator at the top indicating which step they are on and how many steps remain
- Allows users to see their progress at a glance through a header component
- Prevents accidental data loss by confirming before they exit the workflow
- Seamlessly transitions between steps as users navigate forward and backward

### User Impact
All users creating items will benefit from a clear, guided experience that reduces confusion about what information is needed next and prevents accidental loss of work-in-progress.

### Business Value
A polished workflow experience increases user confidence and completion rates for item creation, reducing abandonment and support requests related to confusion about the creation process.

### Acceptance Criteria
- [ ] Users see a workflow interface when creating items that displays different content based on which step they are currently on
- [ ] A progress indicator is visible at all times showing the current step number and total steps
- [ ] When users attempt to exit the workflow with unsaved changes, they are prompted to confirm before losing their work
- [ ] The workflow interface smoothly transitions between different steps without jarring layout shifts or content flashes
- [ ] Users can clearly identify which step they are on at any point in the workflow


---

## REQ-096: Session Persistence for Workflow State

**Date**: 2026-01-05 14:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should automatically save workflow progress to the user's browser and restore it when they return to the page.

### Current Behavior
When a user navigates away from the workflow or closes their browser, all progress in the current workflow session is lost. Users must restart from the beginning each time they return to the application.

### Expected Behavior
The system automatically saves workflow state as users progress through steps. When users return to the application after navigating away or closing their browser, the workflow resumes from where they left off. Once a workflow session is completed, the saved state is removed from browser storage.

### User Impact
Users can safely navigate away from or close the application without losing their progress. This eliminates frustration from accidentally losing work and enables users to complete workflows across multiple sessions at their own pace.

### Business Value
Reduces user abandonment rates by removing the risk of losing progress. Improves user experience by respecting their time and allowing flexible completion patterns.

### Acceptance Criteria
- [ ] Workflow state is automatically saved to browser storage whenever state changes occur
- [ ] When a user returns to the application, their previous workflow state is automatically restored
- [ ] Users can continue from their last step without re-entering previously completed information
- [ ] When a workflow is marked as complete, the saved state is removed from browser storage
- [ ] Multiple workflow sessions can be managed independently without conflicts

---

## REQ-097: Shared UI Components for Item Creation Workflow

**Date**: 2026-01-05 18:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The application should provide reusable UI components that maintain consistent design patterns across the item creation workflow and broader application.

### Current Behavior
The item creation workflow lacks standardized UI components for displaying progress, presenting room selections, and showing item type options. Each view must implement its own visual elements, leading to inconsistent styling and duplicated code.

### Expected Behavior
The application provides a library of shared components including a session progress indicator, standardized card layouts for room selections, and card layouts for item type choices. All components follow the established design system visual language with consistent spacing, typography, colors, and interaction patterns.

### User Impact
Users experience a cohesive, professional interface throughout the workflow with predictable visual patterns. The consistent design reduces cognitive load and makes the workflow feel more polished and trustworthy.

### Business Value
Accelerates future development by enabling component reuse. Ensures brand consistency across the application. Reduces maintenance overhead by centralizing design pattern implementations.

### Acceptance Criteria
- [ ] A progress indicator component displays the current step and total steps in the workflow
- [ ] Room selection cards present property rooms with consistent visual hierarchy and spacing
- [ ] Item type cards display available content types with recognizable icons and clear labels
- [ ] All components apply the design system's color palette, typography scale, and spacing units
- [ ] Components are responsive and function correctly on mobile, tablet, and desktop viewports
- [ ] Components accept appropriate props for customization while maintaining visual consistency
- [ ] Card components support hover states and visual feedback for interactive elements


---

## REQ-098: Room Selection Step in Item Creation Workflow

**Date**: 2026-01-05 19:32
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to select which room a household item belongs to during the item creation workflow, choosing from predefined room types or specifying a custom room name.

### Current Behavior
The item creation workflow does not provide a dedicated step for room selection. Users cannot associate items with specific rooms in their property, limiting the organizational value of the inventory system.

### Expected Behavior
During the item creation workflow, users encounter a room selection step displaying a visual grid of common room types (such as Bedroom, Kitchen, Bathroom, Living Room) with recognizable icons and clear labels. Users can tap any predefined room to select it, or choose an "Other" option that reveals a text input field for entering a custom room name. After making a selection, users can proceed to the next workflow step.

### User Impact
Users can organize their property inventory by room location, making it easier to find items later and create room-specific documentation for guests. The visual grid with large touch targets ensures selections are easy and accurate on mobile devices. The custom room option accommodates unique property layouts without restricting users to a predetermined list.

### Business Value
Improves the utility of the inventory system by adding spatial organization. Enhances data quality by capturing room context for each item. Supports better guest experiences through room-specific information presentation.

### Acceptance Criteria
- [ ] Room selection step displays a grid of predefined room options with icons and text labels
- [ ] Each room option has a minimum touch target size of 48x48 pixels for mobile accessibility
- [ ] An "Other" option is available for rooms not in the predefined list
- [ ] Selecting "Other" reveals a text input field for entering a custom room name
- [ ] Users can change their selection before proceeding to the next step
- [ ] The selected room (predefined or custom) is saved to the workflow state
- [ ] Navigation to the next workflow step is only possible after a valid room selection is made
- [ ] The step integrates seamlessly with the workflow's progress indicator and navigation pattern


---

## REQ-099: Item Type Selection Step in Item Creation Workflow

**Date**: 2026-01-05 14:32
**Type**: NEW FEATURE
**Size**: M

### Summary
Users must be able to select the type of item they are creating from three distinct categories: Appliance, Room Item, or General Information, with the step automatically skipped when creating general property information.

### Current Behavior
After selecting a room, users have no way to specify what kind of item they are documenting. The workflow does not differentiate between appliances, physical room items, or general informational content.

### Expected Behavior
After room selection, users see three clearly labeled cards representing item type options. Each card displays a title, description, and relevant examples to help users understand the distinction. If the user selected "General" as the room type in the previous step, this item type selection is automatically skipped since general information has a predetermined type.

### User Impact
Property managers and hosts creating item documentation will have a clearer categorization system. This helps organize items logically and ensures the correct fields and workflows are presented in subsequent steps based on item type. Users who selected "General" room save time by not seeing an unnecessary selection step.

### Business Value
Proper categorization improves the overall quality of property documentation and enables type-specific features and validations in later workflow steps.

### Acceptance Criteria
- [ ] Three distinct card options are presented: Appliance, Room Item, and General Info
- [ ] Each card displays clear descriptions and practical examples
- [ ] User can select exactly one item type by clicking a card
- [ ] Selection state is visually indicated on the chosen card
- [ ] Continue button is disabled until an item type is selected
- [ ] When "General" room was previously selected, this step is automatically bypassed
- [ ] The selected item type is stored in workflow state
- [ ] Component follows established patterns from RoomSelectionStep implementation

---

## REQ-100: Specific Item Selection Step with Intelligent Suggestions

**Date**: 2026-01-05 15:47
**Type**: NEW FEATURE
**Size**: L

### Summary
Users must be able to select or enter the specific item name in the third step of the item creation workflow, with intelligent suggestions based on previously selected room and item type, automatic name generation, and prevention of duplicate item creation.

### Current Behavior
After selecting a room and item type, users have no interface to specify the actual item they want to document. There is no guidance on naming, no suggestions based on context, and no visibility into which items already exist for the selected location.

### Expected Behavior
The third workflow step presents an intelligent item selection interface. Users see contextual suggestions for common items based on their room and item type selections (e.g., "Microwave" suggested for Kitchen + Appliance). Previously created items for the same room and type appear in a grayed-out state to prevent duplicates. Users can select a suggested item or enter a custom name through an editable field that auto-populates with a "Room - Item" format. All interactions feel responsive and guide users toward consistent, collision-free item naming.

### User Impact
Property managers and hosts creating item documentation receive intelligent guidance that reduces typing, prevents accidental duplicate entries, and ensures consistent naming across their property inventory. New users especially benefit from suggestions that help them discover what types of items are commonly documented.

### Business Value
Intelligent suggestions reduce friction in the item creation process, improve data quality through consistent naming, and prevent user frustration from duplicate item conflicts. The system becomes more helpful and professional by anticipating user needs.

### Acceptance Criteria
- [ ] Suggestions are dynamically generated based on selected room and item type combination
- [ ] Previously created items for the same room and type appear visually distinct (grayed out) and are not selectable
- [ ] Users can click a suggestion to select it as the item name
- [ ] An editable name field allows users to enter custom item names
- [ ] Default item name follows "Room - Item" format when field is initially displayed
- [ ] Selected or entered item name is validated before allowing progression
- [ ] Suggestion system is implemented through a reusable hook for potential future use
- [ ] Individual suggestion buttons are separate components for maintainability
- [ ] Name editor component handles text input, validation, and formatting logic
- [ ] Continue button is disabled until a valid item name is selected or entered
- [ ] The selected item name is stored in workflow state

---


## REQ-101: Comprehensive Suggestions Matrix Data Population

**Date**: 2026-01-05 16:23
**Type**: ENHANCEMENT
**Size**: M

### Summary
The suggestion system must be populated with a comprehensive matrix of common items across all room types (Kitchen, Laundry, Bedroom, Bathroom, Living Room, Garage, Outdoor, General), properly categorized by item type (Appliance, Room Item, General Info).

### Current Behavior
The suggestion system infrastructure exists but lacks complete data coverage. Users may see limited or missing suggestions for certain room and item type combinations, reducing the system's helpfulness and requiring manual entry more frequently than necessary.

### Expected Behavior
When users select any combination of room type and item type, they see relevant, well-organized suggestions that represent commonly documented items for that context. Kitchen appliances include items like Microwave, Refrigerator, Dishwasher, and Oven. Bedroom room items include Bed Frame, Nightstand, Dresser, and Closet. Every room type has appropriate suggestions for all applicable item type categories, making the system feel complete and professional.

### User Impact
Users creating items for any room type receive helpful, contextually relevant suggestions that speed up their workflow and reduce cognitive load. Coverage across all room types ensures a consistent experience regardless of which area of their property they are documenting.

### Business Value
Complete suggestion coverage demonstrates system maturity, reduces user friction across all use cases, and ensures feature parity between different room types. This completeness encourages adoption and reduces support requests about missing suggestions.

### Acceptance Criteria
- [ ] Suggestions are defined for all eight room types: Kitchen, Laundry, Bedroom, Bathroom, Living Room, Garage, Outdoor, and General
- [ ] Each room type includes suggestions categorized as Appliance, Room Item, or General Info where applicable
- [ ] Kitchen suggestions include common appliances and room items found in kitchens
- [ ] Laundry suggestions include washing machines, dryers, and related items
- [ ] Bedroom suggestions include furniture and storage items
- [ ] Bathroom suggestions include fixtures, appliances, and accessories
- [ ] Living Room suggestions include entertainment, seating, and storage items
- [ ] Garage suggestions include tools, storage, and utility items
- [ ] Outdoor suggestions include furniture, equipment, and landscaping items
- [ ] General suggestions include items that don't fit specific room categories
- [ ] All suggestions follow consistent naming conventions
- [ ] Suggestions matrix is sourced from PRD specifications or best practices for rental property documentation

---

## REQ-102: Content Source Selection Step for Item Creation Workflow

**Date**: 2026-01-05 17:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Users must be able to choose whether they have existing content to upload or want to create new content immediately, with this choice influencing which content type options appear in the subsequent step.

### Current Behavior
After selecting the specific item name, users have no way to indicate whether they already have documentation materials ready to upload (videos, photos, PDFs, text, URLs) or prefer to create content on the spot using device capabilities. The workflow does not differentiate between these two distinct user paths.

### Expected Behavior
The fourth workflow step presents two clear choice cards: "I have content" and "Create now". Each card displays a descriptive explanation of what that option means. The "I have content" card explains that users can upload existing videos, photos, PDFs, paste text, or add URLs. The "Create now" card explains that users can record videos, take photos, or write text directly. Users select one option by clicking the corresponding card. The selected choice determines which content type options are available in the next step, filtering to only upload-based types for existing content or only creation-based types for new content.

### User Impact
Property managers and hosts benefit from a clearer separation between uploading prepared materials versus creating documentation in real-time. This reduces confusion in the content type selection step by showing only relevant options based on the user's current situation. Users with existing materials can quickly proceed to upload workflows, while those creating fresh content see only applicable creation options.

### Business Value
Separating content source from content type streamlines the user experience by reducing cognitive load and eliminating irrelevant choices. This two-step filtering approach makes the workflow feel more intelligent and responsive to user context.

### Acceptance Criteria
- [ ] Two distinct choice cards are presented: "I have content" and "Create now"
- [ ] Each card displays a clear title and description explaining the option
- [ ] Each card shows examples of what content types will be available for that choice
- [ ] User can select exactly one content source option by clicking a card
- [ ] Selection state is visually indicated on the chosen card
- [ ] Continue button is disabled until a content source is selected
- [ ] Selecting "I have content" stores 'existing' in workflow state
- [ ] Selecting "Create now" stores 'create-new' in workflow state
- [ ] Component follows established patterns from ItemTypeStep and RoomSelectionStep implementations
- [ ] Component uses shared card component if applicable for consistency
- [ ] The selected content source filters options in the content-type-selection step
- [ ] Component is exported from steps index file for integration into workflow renderer


---

## REQ-103: Content Type Selection Step with Dynamic Options

**Date**: 2026-01-05 19:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Users must be able to select the specific type of content they want to add, with available options dynamically filtered based on their previous content source selection.

### Current Behavior
After selecting whether they have existing content or want to create new content, users have no interface to specify the actual content format they intend to use. There is no mechanism to capture whether they want to upload a video versus a photo, or record new media versus writing text, leaving the workflow incomplete.

### Expected Behavior
The fifth workflow step presents content type options as icon-labeled cards, dynamically filtered based on the previous content source selection. Users who selected "I have content" see five options: Upload Video, Upload Photo, Upload PDF, Paste Text, and Paste URL. Users who selected "Create now" see three options: Record Video, Take Photo, and Write Text. Each card displays a clear icon representing the content type and a descriptive label. Users select one content type by clicking the corresponding card. The selection is visually highlighted, and the chosen content type is stored in workflow state for use in subsequent content capture steps.

### User Impact
Property managers and hosts benefit from seeing only relevant content type options based on their current context, reducing decision fatigue and potential confusion. The visual card-based interface with icons makes content type selection intuitive and accessible across different user skill levels. Clear separation between upload and creation paths ensures users always see options that match their stated intent.

### Business Value
Dynamic content type filtering based on user context demonstrates intelligent workflow design and prevents users from encountering inappropriate options. This refinement in the user journey increases perceived system quality and reduces support burden by eliminating confusion about which content types are available when.

### Acceptance Criteria
- [ ] Content type options are rendered as icon-labeled cards
- [ ] For "I have content" source, exactly five options appear: Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
- [ ] For "Create now" source, exactly three options appear: Record Video, Take Photo, Write Text
- [ ] Each card displays an appropriate icon representing the content type
- [ ] Each card displays a clear, descriptive label matching the content type
- [ ] User can select exactly one content type by clicking a card
- [ ] Selected card shows visual indication of active selection state
- [ ] Continue button is disabled until a content type is selected
- [ ] Selected content type is stored in workflow state as content-type field
- [ ] Component retrieves content source from workflow state to determine which options to display
- [ ] Component follows established patterns from previous step implementations
- [ ] Component uses shared card components for consistency if applicable
- [ ] Component is exported from steps index file for integration into workflow renderer
- [ ] Icon selections are visually distinct and clearly communicate each content type's purpose


---

## REQ-104: URL Content with Preview Using Open Graph Metadata

**Date**: 2026-01-05 20:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Users must be able to paste a URL and see a preview of the content before proceeding, with the system fetching and displaying Open Graph metadata while gracefully handling loading, success, and error states.

### Current Behavior
After selecting "Paste URL" as the content type, users have no interface to enter a URL or preview what the linked content contains before adding it to their item documentation. There is no mechanism to validate that the URL is accessible or to provide users with visual confirmation of what they are documenting.

### Expected Behavior
When users select the URL content type, they see an input field to paste or type a URL. After entering a valid URL, the system automatically fetches Open Graph metadata including title, description, and preview image. While fetching, users see a loading indicator. On success, a rich preview card displays showing the retrieved title, description, and image from the URL's Open Graph tags. If fetching fails or metadata is unavailable, users see an error message but can still proceed with a warning notification. Users can continue with the workflow once a URL is entered, regardless of whether the preview loaded successfully, though warnings appear when metadata could not be retrieved.

### User Impact
Property managers and hosts benefit from immediate visual feedback confirming the URL they entered points to the expected content. Rich previews showing titles, descriptions, and images reduce errors from pasting incorrect URLs and increase confidence that documentation links will be helpful to guests. The ability to proceed even when previews fail ensures workflow continuity while maintaining awareness of potential issues.

### Business Value
Open Graph preview functionality demonstrates modern UX patterns familiar from social media and messaging platforms, increasing perceived system quality. Validation feedback reduces support requests from users adding broken or incorrect links while maintaining workflow flexibility by allowing manual override when automated preview fails.

### Acceptance Criteria
- [ ] URL input field accepts text entry for web addresses
- [ ] System automatically triggers metadata fetch after URL is entered and validated as proper URL format
- [ ] Loading state displays visual indicator while fetching Open Graph metadata
- [ ] Success state displays preview card with retrieved title, description, and image when available
- [ ] Preview card layout is visually appealing and clearly displays all available metadata fields
- [ ] Error state displays informative message when metadata fetch fails
- [ ] Error state includes warning indicator but still allows user to proceed with workflow
- [ ] Users can continue to next step with entered URL regardless of preview success or failure
- [ ] Warning message appears when user proceeds without successful preview
- [ ] useUrlPreview hook encapsulates fetching logic and state management
- [ ] useUrlPreview hook returns loading, success, error, and data states
- [ ] useUrlPreview hook handles network errors gracefully
- [ ] Fetched metadata is stored in workflow state for potential later use
- [ ] Component follows established patterns from previous step implementations
- [ ] URL validation prevents obviously malformed URLs from triggering fetch requests

---

## REQ-105: Content Creation Step for Item Creation Workflow

**Date**: 2026-01-05 11:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to create content for their FAQ/information items through a guided content creation step that adapts to their previous workflow selections.

### Current Behavior
Users cannot create content through the item creation workflow. The existing content capture functionality exists but is not integrated into the multi-step workflow.

### Expected Behavior
When users reach the content creation step in the item creation workflow:
- They see a content creation interface configured based on their earlier selections (item type, specific item, and content source)
- They can input or capture content appropriate to the selected content source type
- Their captured content is properly formatted and ready for the next workflow step
- They can cancel and return to the previous step without losing their progress

### User Impact
All users creating new FAQ or information items will use this step to capture their content. This affects the primary content creation flow and ensures content is captured in a consistent, workflow-aware manner.

### Business Value
Completes a critical step in the item creation workflow, enabling users to actually create content after configuring what type of content they want to create. This bridges the gap between workflow configuration and content capture.

### Acceptance Criteria
- [ ] Content creation step displays when user advances from content source selection
- [ ] Content capture interface adapts based on item type, specific item, and content source selections
- [ ] Captured content is transformed into the expected format for subsequent workflow steps
- [ ] Cancel action returns user to previous step without data loss
- [ ] Content validation occurs before allowing progression to next step
- [ ] Existing content capture functionality is preserved and not broken by integration

---

## REQ-106: Preview and Save Step for Item Creation Workflow

**Date**: 2026-01-05 17:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to preview their created content in its final presentation format and confirm that all information is correct before saving the completed item to their property.

### Current Behavior
Users complete the content creation step but have no opportunity to preview how the content will appear to end users or make final adjustments before saving. There is no unified preview experience showing the item name, content thumbnail, and offering options to modify or replace content.

### Expected Behavior
After creating content, users advance to a preview and save step where:
- They see a visual preview of their content appropriate to the content type (video thumbnail, photo preview, PDF representation, text preview, or URL card with metadata)
- The item name is displayed prominently with an option to edit it inline
- They can choose to retake or replace the content if unsatisfied
- They can save the completed item through a clear call-to-action button
- They receive immediate confirmation feedback when the item is successfully saved

### User Impact
All users completing the item creation workflow will use this step as the final checkpoint before their item goes live. This affects user confidence in the content quality and reduces the need for post-creation edits or deletions.

### Business Value
Provides quality assurance in the creation process by giving users a final review opportunity before committing. Reduces user errors, abandoned creations, and support requests related to incorrectly saved items. Completes the end-to-end item creation experience.

### Acceptance Criteria
- [ ] Preview step displays after content creation with appropriate content visualization for all supported content types (video, photo, PDF, text, URL)
- [ ] Item name is shown prominently with an edit option that allows inline modification
- [ ] Retake or replace option allows users to return to content creation without losing other workflow data
- [ ] Save button is clearly visible and triggers item persistence to the database
- [ ] Success confirmation is displayed immediately after successful save
- [ ] Multi-content items display all content pieces through a dedicated card component
- [ ] Content preview accurately represents how the item will appear to end users
- [ ] All workflow state (room, item type, specific item, content) is preserved during preview


---

## REQ-107: Next Action Step for Item Creation Workflow

**Date**: 2026-01-05 (System timestamp preserved)
**Type**: NEW FEATURE
**Size**: M

### Summary
After creating or editing an item, users should be presented with clear options to continue their session, add more content to the current item, or finish their work.

### Current Behavior
Once an item is created or edited, there is no structured way for users to decide what to do next within the same session, leading to an unclear continuation of the workflow.

### Expected Behavior
After completing item creation or editing, users see a decision point with three clear options:
1. Add More to Item - Continue enriching the current item with additional content
2. Tag New Item - Start creating another item in the same session
3. I'm Done - Complete the session and return to the main view

The interface displays session progress (e.g., "4 items created") to give users context about their productivity during the current session. Selection of any option routes the user to the appropriate next step in the workflow.

### User Impact
Content creators and curators gain better control over their workflow, allowing them to batch-create multiple items efficiently or continue refining a single item without losing context. The session progress indicator provides motivation and clarity about their accomplishments.

### Business Value
Streamlines the content creation process by reducing cognitive load and navigation uncertainty, potentially increasing the number of items created per session and improving overall content quality through easier iterative enhancement.

### Acceptance Criteria
- [ ] After item creation or editing completion, users are presented with three distinct action options
- [ ] Session progress indicator displays the number of items created in the current session
- [ ] Selecting "Add More to Item" navigates to the appropriate step for adding additional content to the current item
- [ ] Selecting "Tag New Item" initiates a new item creation flow while maintaining the session context
- [ ] Selecting "I'm Done" concludes the session and returns the user to the main application view
- [ ] The session progress count accurately reflects the number of items created during the current session
- [ ] All three navigation paths successfully route to their intended destinations

---

## REQ-108: Multi-Content Item Support

**Date**: 2026-01-05 09:42
**Type**: ENHANCEMENT
**Size**: L

### Summary
Users should be able to add multiple pieces of content to a single item, reorder those content pieces, and remove individual pieces to create comprehensive, multi-faceted item documentation.

### Current Behavior
Items support storing multiple content pieces internally through a content array, but users cannot add additional content after the initial creation step. The preview displays all content pieces, but provides no way to add more content, reorder existing pieces for better presentation, or selectively remove pieces that are no longer needed.

### Expected Behavior
When users select "Add More to Item" from the next action step, they are returned to an appropriate point in the workflow where they can add another piece of content to the existing item. The preview step displays all existing content pieces with visual indicators showing their current order. Users can drag and drop content pieces to reorder them for optimal presentation. Each content piece includes a remove button that allows selective deletion without affecting other pieces. A counter displays the current number of content pieces and enforces a maximum limit of 10 pieces per item to prevent overwhelming content collections.

### User Impact
Content creators gain the flexibility to build comprehensive item documentation that includes multiple perspectives, formats, or levels of detail. Property managers can combine video walkthroughs with text instructions, photos, and PDF manuals in a single item. Users who realize they forgot important content can easily add it without creating duplicate items. The ability to reorder content ensures the most important information appears first.

### Business Value
Reduces item fragmentation by allowing comprehensive documentation in a single item rather than forcing users to create multiple related items. Improves content quality and completeness, leading to better guest experiences and fewer support requests. The 10-piece limit prevents system abuse while accommodating legitimate use cases.

### Acceptance Criteria
- [ ] Users selecting "Add More to Item" from the next action step are routed to the content source selection with the current item preserved
- [ ] Preview step displays all existing content pieces in their current order
- [ ] Users can drag and drop content pieces using intuitive touch or mouse interactions to reorder them
- [ ] Each content piece displays a remove button that deletes only that specific piece
- [ ] Content counter displays current count and maximum limit (e.g., "3 of 10 pieces")
- [ ] System prevents adding more than 10 content pieces to a single item with a clear error message
- [ ] Reordering content updates the order property of each content piece to maintain sort stability
- [ ] Removing a content piece triggers a confirmation if it's the last remaining piece
- [ ] All drag-and-drop interactions are keyboard accessible for users who cannot use a mouse
- [ ] Content piece order is preserved when saving the item and displayed consistently in all views


---

## REQ-109: Session Summary Step with Item Management

**Date**: 2026-01-05 14:32
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to review all content items created during their current session and access previously created items before generating QR codes.

### Current Behavior
There is no consolidated view where users can review the collection of content items they have created within a single session or access items from previous sessions.

### Expected Behavior
After creating one or more content items, users see a summary screen that displays:
- All newly created items in the current session with visual thumbnails
- A collapsible section showing items created in previous sessions
- The ability to edit or remove any displayed item
- Visual distinction between new session items and historical items

### User Impact
Content creators managing multiple items need a centralized place to review, organize, and manage their content before proceeding to QR code generation. This enables them to quality-check their work, make last-minute adjustments, and ensure they're generating QR codes for the correct set of items.

### Business Value
Reduces errors and rework by giving users a final review checkpoint before committing to QR code generation. Improves user confidence and reduces support requests related to incorrect or incomplete content submissions.

### Acceptance Criteria
- [ ] Session summary screen displays all items created in the current session
- [ ] Each item shows a visual thumbnail or icon representing its content type
- [ ] Previously created items are accessible through a collapsible section that is collapsed by default
- [ ] Each item card provides edit and remove actions that function correctly
- [ ] Visual design clearly distinguishes between new session items and historical items
- [ ] Removing an item updates the display immediately without requiring a page refresh
- [ ] Editing an item navigates back to the appropriate editing interface with data pre-populated

---

## REQ-110: Print Options Panel for Item Creation Session

**Date**: 2026-01-05 14:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need the ability to selectively print items created during their session with options to generate a PDF, print directly, or skip printing entirely.

### Current Behavior
After completing an item creation session, users have no integrated way to review and print the items they just created. They must navigate elsewhere in the system to access print functionality.

### Expected Behavior
After reviewing their session summary, users are presented with a print options panel that allows them to:
- Choose the scope of items to print (all items from the session, only new items, or manually select specific items)
- Generate a PDF document containing the selected items
- Send selected items directly to a printer
- Opt out of printing and return to the main workflow

The panel should clearly display which items are included in each scope option and provide a way to exit without printing.

### User Impact
Property managers and hosts who create multiple items in a single session will be able to immediately print QR codes and item information without leaving the workflow. This streamlines the process of preparing physical materials for their properties, especially during initial setup or bulk item additions.

### Business Value
Reduces friction in the item creation workflow by providing immediate access to print functionality at the natural conclusion of a creation session. This encourages users to complete the full setup process including physical QR code placement, which increases the utility and stickiness of the platform.

### Acceptance Criteria
- [ ] Users can select one of three print scopes: all items from the session, only newly created items, or individually selected items
- [ ] When selecting individual items, users can see a list of items with selection controls
- [ ] A "Generate PDF" action creates a downloadable PDF containing the selected items
- [ ] A "Print Directly" action triggers the browser print dialog for the selected items
- [ ] A "Just Review / Done for Now" option allows users to exit the panel without printing
- [ ] The panel clearly indicates how many items are included in the current selection
- [ ] Users can change their scope selection and see the count update accordingly


---

## REQ-111: QR Code Generation and Progress Tracking for Item Creation Sessions

**Date**: 2026-01-05 12:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
Users should be able to generate QR codes for selected items created during a session, with visible progress tracking and error recovery options.

### Current Behavior
After items are created in a session, users must navigate away from the workflow to generate QR codes for their items. There is no integrated QR code generation capability within the item creation workflow itself.

### Expected Behavior
Within the session summary step, users can generate QR codes for one or more items directly. The system displays real-time progress as QR codes are generated, and if any generation fails, users can retry individual items without losing already-generated codes.

### User Impact
Property managers and administrators completing item creation sessions can immediately generate QR codes for their new items without switching contexts or navigating to different screens. This streamlines the workflow from item creation to physical deployment.

### Business Value
Reduces friction in the item-to-deployment pipeline by eliminating context switching and navigation overhead. Improves user confidence through transparent progress feedback and resilient error handling.

### Acceptance Criteria
- [ ] Users can select one or more items from their session for QR code generation
- [ ] Progress indicator shows current generation status (e.g., "Generating 3 of 12")
- [ ] Successfully generated QR codes are visually distinguished from pending or failed items
- [ ] When generation fails for an item, an error message appears with a retry action
- [ ] Retrying a failed item does not regenerate already-successful QR codes
- [ ] Generation process can be cancelled by the user mid-operation
- [ ] Users can proceed with the workflow even if some QR codes failed to generate


---

## REQ-112: PDF Generation Integration for Item Creation Workflow

**Date**: 2026-01-05 16:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Users should be able to generate and download a professionally formatted PDF containing QR codes for items created during their session, with configurable paper sizes and item name labels.

### Current Behavior
After completing an item creation session and selecting print options, users can generate QR codes but there is no integrated capability to export these QR codes as a downloadable PDF document with professional formatting.

### Expected Behavior
Users can generate a PDF document containing their selected QR codes with the following characteristics:
- Standard paper size support for Letter and A4 formats
- QR codes arranged in an optimized grid layout with appropriate spacing
- Item name labels positioned below each QR code for easy identification
- Professional margins and formatting suitable for printing
- Immediate download capability of the generated PDF file

The PDF generation should leverage existing infrastructure and component patterns already established in the system, providing a seamless experience from session completion through to obtaining printable materials.

### User Impact
Property managers and hosts who need physical QR codes for their items will be able to immediately generate print-ready PDFs without relying on external tools or manual formatting. This eliminates friction in the workflow from digital item creation to physical deployment, particularly valuable during initial property setup or bulk item additions.

### Business Value
Completes the end-to-end item creation workflow by providing the final deliverable users need: a professional, print-ready document. This reduces abandonment at the final step of the workflow and increases the likelihood that users will complete physical QR code deployment, thereby maximizing platform engagement and utility.

### Acceptance Criteria
- [ ] Users can select between Letter and A4 paper formats before generating the PDF
- [ ] Generated PDFs contain QR codes arranged in an optimized grid layout that maximizes space utilization
- [ ] Each QR code displays the corresponding item name as a label positioned directly below the code
- [ ] PDF margins and spacing are appropriate for standard home and office printers
- [ ] The PDF automatically downloads to the user's device when generation completes
- [ ] Generation respects the user's item selection from the print options panel
- [ ] Users see visual feedback during PDF generation for operations that take more than one second
- [ ] Failed PDF generation displays a clear error message with recovery options

---

## REQ-113: Error Handling and Edge Case Improvements for Item Creation Workflow

**Date**: 2026-01-05 12:26
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system should gracefully handle error conditions and edge cases throughout the item creation workflow, providing clear feedback and recovery options when network connectivity fails, permissions are denied, or users encounter boundary conditions.

### Current Behavior
When unexpected conditions occur during the item creation workflow—such as network interruptions during URL preview fetching, camera permission denials, extremely long item names, empty sessions, or session refresh attempts—the system may exhibit unclear error states, provide insufficient feedback, or fail to offer recovery paths. Users encountering these situations may become confused or unable to proceed with their tasks.

### Expected Behavior
The system should anticipate and handle the following scenarios gracefully:

**Network Interruptions**: When network connectivity is lost during URL preview generation, users see a clear indicator that the preview could not be loaded, with an option to retry or proceed without preview.

**Camera Access**: When camera permissions are denied or unavailable, users are presented with alternative input methods (manual URL entry or file upload) without disrupting the workflow.

**Long Item Names**: When item names exceed reasonable display lengths, they are truncated in list views with ellipsis, and the full name appears in a tooltip on hover or tap.

**Empty Sessions**: When users attempt to complete a session without adding any items, they receive a friendly prompt asking if they want to add items or exit the session.

**Session Recovery**: When users refresh the browser or navigate away during an active session, the system attempts to restore their work-in-progress state, including unsaved items and current step position.

**Duplicate Names**: When users enter an item name that already exists in the current session, they see a warning indicator and are prompted to confirm whether they want to proceed with a duplicate name or modify it.

### User Impact
Users working in challenging environments (unstable connectivity, restricted device permissions) or encountering edge cases will experience a more robust and forgiving system. Instead of facing dead ends or confusing states, they receive clear guidance and alternative paths forward, reducing frustration and workflow abandonment.

### Business Value
Improved error handling reduces support requests, increases workflow completion rates, and builds user confidence in the platform's reliability. By gracefully handling edge cases, the system accommodates a wider range of real-world usage scenarios without requiring technical intervention.

### Acceptance Criteria
- [ ] When network connectivity fails during URL preview fetching, a "Preview unavailable" message displays with a retry button
- [ ] When camera permissions are denied, the interface automatically switches to show manual URL entry and file upload options
- [ ] Item names exceeding 40 characters are truncated with ellipsis in list displays, showing the full name on hover or long-press
- [ ] Attempting to proceed from an empty session triggers a confirmation dialog asking "No items added yet. Add items or exit session?"
- [ ] Refreshing the browser during an active session restores the user's position, step progress, and any items added to the session
- [ ] When a duplicate item name is detected within the current session, a warning icon appears with the message "Similar name already used"
- [ ] All error states include actionable recovery options rather than passive error messages
- [ ] Network-related errors distinguish between temporary connectivity issues and permanent failures


---

## REQ-114: Accessibility and Mobile Optimization for Item Creation Workflow

**Date**: 2026-01-05 14:23
**Type**: ENHANCEMENT
**Size**: M

### Summary
The Item Creation Workflow should be fully accessible to users with disabilities and provide an optimized experience across all device types and input methods.

### Current Behavior
The Item Creation Workflow currently functions on desktop browsers but may have gaps in accessibility support, keyboard navigation, screen reader compatibility, and mobile device optimization. Users relying on assistive technologies or accessing the workflow from mobile devices may encounter barriers to completing item creation tasks.

### Expected Behavior
All users should be able to complete the Item Creation Workflow regardless of their device type, input method, or accessibility needs. This includes:
- Screen reader users who navigate via keyboard and rely on descriptive labels
- Keyboard-only users who navigate without a mouse
- Mobile and tablet users who interact via touch gestures
- Users with motion sensitivity who prefer reduced animations
- Users on various screen sizes from small phones to large desktop displays

### User Impact
This affects all users of the Item Creation Workflow, with particular importance for:
- Users with visual, motor, or cognitive disabilities who rely on assistive technologies
- Mobile users who represent a significant portion of potential platform access
- Users in accessibility-regulated environments where compliance is mandatory
- Power users who prefer keyboard-based workflows for efficiency

### Business Value
Accessibility and mobile optimization are essential for inclusive product design and regulatory compliance. Expanding support to mobile devices increases potential user reach, while accessibility features ensure legal compliance and demonstrate commitment to universal design principles.

### Acceptance Criteria
- [ ] All interactive elements include appropriate ARIA labels and roles
- [ ] Complete keyboard navigation support allows users to move through all workflow steps using only keyboard input
- [ ] Focus indicators are visible and logical focus order is maintained when navigating between workflow steps
- [ ] All touch targets meet minimum size requirements of 48x48 pixels for reliable interaction on touch devices
- [ ] Workflow layout adapts appropriately to mobile phone, tablet, and desktop screen sizes
- [ ] Users can enable reduced motion preferences to minimize or eliminate animations throughout the workflow
- [ ] Screen reader testing confirms all content and interactions are announced correctly
- [ ] Mobile gesture support is verified on iOS and Android devices


---

## REQ-115: Unit Testing for Item Creation Workflow Components

**Date**: 2026-01-05 14:32
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system shall provide comprehensive unit test coverage for the item creation workflow's state management, suggestion handling, URL preview functionality, navigation logic, and session persistence mechanisms.

### Current Behavior
The item creation workflow components and hooks lack dedicated unit tests, making it difficult to verify correctness, catch regressions early, and ensure reliable behavior across edge cases.

### Expected Behavior
Each major component and hook in the item creation workflow has a corresponding test suite that validates its behavior in isolation, including:
- State transitions and reducer logic respond correctly to all action types
- Suggestion generation and filtering produce expected results
- URL preview fetching handles success, failure, and loading states appropriately
- Step navigation prevents invalid transitions and maintains workflow integrity
- Session data persists and recovers correctly across browser sessions

### User Impact
While users do not directly interact with tests, this enhancement improves overall system reliability by catching bugs before they reach production, reducing unexpected errors during item creation, and enabling confident future modifications to workflow logic.

### Business Value
Unit tests reduce maintenance costs by catching regressions early, enable faster iteration by providing confidence in changes, and improve overall product quality by ensuring core workflow features behave consistently.

### Acceptance Criteria
- [ ] Workflow state reducer handles all action types correctly and transitions between states as expected
- [ ] Suggestion hook returns appropriate suggestions based on input and handles empty or invalid scenarios
- [ ] URL preview hook manages loading, success, and error states correctly for various URL inputs
- [ ] Step navigation logic prevents users from skipping required steps or moving backward inappropriately
- [ ] Session persistence correctly saves and restores workflow state across browser sessions
- [ ] All tests run successfully in the project's test environment without manual intervention
- [ ] Test coverage for these components meets or exceeds project standards



---

## REQ-116: Integration Testing for Item Creation Workflow

**Date**: 2026-01-05 14:45
**Type**: ENHANCEMENT
**Size**: L

### Summary
The system shall provide comprehensive integration tests that verify the complete item creation workflow operates correctly end-to-end, including seamless integration between all workflow steps, media capture functionality, and QR code generation.

### Current Behavior
While unit tests validate individual components in isolation, there is no comprehensive integration testing to verify that all workflow steps work together correctly, that the ItemCapture component integrates properly with the workflow, and that QR code generation functions as expected within the complete user journey.

### Expected Behavior
The testing suite includes integration tests that validate:
- Users can navigate through the complete workflow from room selection through final save, with all steps communicating correctly and maintaining consistent state
- The ItemCapture component integrates seamlessly, allowing users to capture photos, videos, and other media as part of the workflow without data loss or state corruption
- QR code generation triggers at the appropriate time, produces valid codes for created items, and handles generation failures gracefully within the workflow context
- Session persistence works correctly across the entire workflow, allowing users to pause and resume their work without losing progress
- Error states propagate correctly between integrated components, providing users with clear feedback when issues occur

### User Impact
Users completing the item creation workflow will experience a reliable, predictable system where all features work together harmoniously, media captures integrate smoothly, QR codes generate successfully, and their work is protected through automatic session recovery.

### Business Value
Integration testing reduces production defects by catching issues that only appear when components interact, decreases support costs by preventing workflow failures, and increases user confidence in the system's reliability during critical item creation tasks.

### Acceptance Criteria
- [ ] Complete workflow flow tests verify users can progress from initial step through final save with all intermediate steps functioning correctly
- [ ] ItemCapture integration tests confirm media capture, preview, and editing features work within the workflow context
- [ ] QR code generation integration tests verify codes are created successfully for items and handle generation failures appropriately
- [ ] Cross-step data persistence tests confirm information entered in one step is correctly available in subsequent steps
- [ ] Session recovery tests validate that pausing and resuming the workflow at any step maintains complete state integrity
- [ ] Error handling tests demonstrate that failures in one component provide appropriate feedback without corrupting the entire workflow
- [ ] All integration tests run successfully in a continuous integration environment

---

## REQ-117: Technical Documentation and API Reference for Item Creation Workflow

**Date**: 2026-01-05 16:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system's Item Creation Workflow shall include comprehensive developer documentation covering barrel export patterns, public API interfaces, and practical implementation examples to support maintainability and developer onboarding.

### Current Behavior
Developers working with the Item Creation Workflow must rely on source code inspection to understand component APIs, barrel export structures, and usage patterns. There is no consolidated reference documentation or practical examples showing how to integrate and extend workflow components.

### Expected Behavior
Developers have access to complete technical documentation that includes:
- Clear documentation of all barrel export patterns explaining the module organization and what each export provides
- JSDoc comments on every public API (components, hooks, utilities, types) describing parameters, return values, and usage constraints
- Practical usage examples in the README demonstrating common integration scenarios such as embedding the workflow, customizing steps, handling events, and extending functionality
- Code examples that developers can reference when implementing or troubleshooting workflow integration

### User Impact
Developers joining the project or maintaining the Item Creation Workflow can quickly understand component APIs, discover available features through documentation, and implement workflow integrations correctly on their first attempt, reducing trial-and-error development time.

### Business Value
Comprehensive documentation reduces onboarding time for new developers, decreases maintenance costs by making the codebase more accessible, and improves code quality by clarifying intended usage patterns and API contracts.

### Acceptance Criteria
- [ ] All barrel export files include header comments documenting the organization strategy and purpose of exported modules
- [ ] Every public component includes JSDoc comments describing props, behavior, and usage examples
- [ ] Every custom hook includes JSDoc comments describing parameters, return values, and side effects
- [ ] All exported utility functions and type definitions include complete JSDoc documentation
- [ ] README includes at least three practical usage examples covering basic workflow integration, custom step configuration, and event handling
- [ ] Documentation examples use current TypeScript syntax and match the actual implemented API signatures
- [ ] Code examples in documentation are validated to compile and run without errors


---

## REQ-118: Phase 8 Documentation Updates - Barrel Exports, JSDoc, and Usage Examples

**Date**: 2026-01-05 19:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system shall provide updated barrel export documentation, comprehensive JSDoc comments on all public APIs, and practical usage examples in the README to improve code discoverability and developer experience.

### Current Behavior
Developers navigating the codebase encounter barrel export files without explanatory documentation, public APIs lacking JSDoc annotations describing their purpose and parameters, and a README that does not demonstrate common usage patterns or integration examples.

### Expected Behavior
Developers accessing the codebase find:
- Barrel export files with clear documentation explaining the module organization, what components or utilities are grouped together, and why specific items are exported
- Every public API (components, hooks, functions, types) annotated with JSDoc comments that describe purpose, parameters, return values, usage constraints, and examples where applicable
- README sections containing practical code examples demonstrating typical integration scenarios, common workflows, and best practices for using the public APIs

### User Impact
Developers working with the codebase can quickly locate relevant components through organized barrel exports, understand API contracts without inspecting implementation details, and reference working examples when implementing features, resulting in faster development velocity and fewer integration errors.

### Business Value
Well-documented code reduces onboarding friction for new team members, decreases time spent answering documentation questions, minimizes bugs caused by API misuse, and improves long-term maintainability by making architectural decisions explicit and discoverable.

### Acceptance Criteria
- [ ] All barrel export files contain header comments explaining the organization strategy and listing the categories of exported items
- [ ] Every public component, hook, utility function, and type interface includes JSDoc comments with descriptions and parameter/return type documentation
- [ ] README includes at least three practical usage examples demonstrating common integration patterns
- [ ] JSDoc comments follow consistent formatting standards throughout the codebase
- [ ] Usage examples in README are tested to ensure they compile and execute without errors
- [ ] Documentation is reviewed by at least one developer unfamiliar with the code to verify clarity and completeness

---

## REQ-119: Remove Account References from Layout Component

**Date**: 2026-01-06 (Current Session)
**Type**: BUG FIX
**Size**: S

### Summary
The layout component contains account-related references that violate PRD requirements and must be removed to ensure compliance with the product specification.

### Current Behavior
Account-related UI elements, navigation items, or references appear in the layout component, creating functionality or visual elements that conflict with the approved product requirements document.

### Expected Behavior
The layout component displays only PRD-compliant elements with no account-related references, navigation items, or UI components visible to users.

### User Impact
Users currently see account-related interface elements that should not be present according to product specifications, potentially creating confusion about available functionality or access patterns.

### Business Value
Ensuring strict PRD compliance maintains product vision alignment and prevents users from encountering incomplete or unintended features that could negatively affect user experience or create support burden.

### Acceptance Criteria
- [ ] All account-related references are identified and catalogued from the layout component
- [ ] Account-related UI elements are removed from the visual interface
- [ ] Account-related navigation items are removed from menus and navigation structures
- [ ] Layout renders successfully without account references on all supported viewport sizes
- [ ] No console errors or warnings appear related to removed account functionality
- [ ] Visual regression testing confirms layout appearance matches PRD specifications


---

## REQ-120: Remove Account References from Dashboard Page

**Date**: 2026-01-06 16:45
**Type**: BUG FIX
**Size**: S

### Summary
The dashboard page displays account-related functionality or references that violate PRD requirements and must be removed to ensure full compliance with product specifications.

### Current Behavior
The dashboard page contains account-related UI elements, data displays, navigation items, or functional components that are not aligned with the approved product requirements document.

### Expected Behavior
The dashboard page operates without any account-related functionality, displaying only PRD-compliant features and data visualizations that align with the approved product vision.

### User Impact
Users accessing the dashboard currently see account-related elements that should not be present, which may create confusion about system capabilities, access patterns, or expected workflows.

### Business Value
Enforcing strict PRD compliance on the dashboard ensures the product vision is properly implemented and prevents users from encountering incomplete or unauthorized features that could undermine user experience quality or create unnecessary support inquiries.

### Acceptance Criteria
- [ ] All account-related references are identified and documented from the dashboard page
- [ ] Account-related UI components are removed from the dashboard interface
- [ ] Account-related data queries or API calls are removed from dashboard logic
- [ ] Dashboard renders successfully without account references across all supported screen sizes
- [ ] No console errors or warnings appear related to removed account functionality
- [ ] Dashboard functionality is validated to ensure no regressions in PRD-compliant features
- [ ] Visual testing confirms dashboard appearance matches PRD specifications without account elements


---

## REQ-121: Apply Airbnb Design System Colors Throughout Application

**Date**: 2026-01-06 03:09
**Type**: ENHANCEMENT
**Size**: L

### Summary
The application shall consistently use Airbnb design system colors across all user interface components to achieve visual cohesion and brand alignment as specified in the PRD.

### Current Behavior
Components throughout the application use inconsistent color schemes that do not align with the Airbnb design system. Color values are hardcoded with arbitrary choices including generic grays, blues, purples, and other colors that do not match the established Airbnb brand palette. Primary text appears in various shades rather than the standardized Airbnb text colors. Interactive elements like buttons and links use inconsistent accent colors instead of the defined brand primary color. Background colors and borders vary across components without adhering to a unified color token system.

### Expected Behavior
All interface elements display colors that strictly adhere to the Airbnb design system palette. Primary text appears in Mine Shaft (#222222) or Hof (#484848) for optimal readability. Secondary text and metadata use Foggy (#767676) or the lighter gray (#717171). Call-to-action buttons and interactive elements feature Radical Red (#FF385C) as the primary brand color. Success states display using Babu (#00A699), warning states use Arches (#FC642D), and error states use Rausch (#FF5A5F). Backgrounds consistently use White (#FFFFFF) or defined neutral variations. Borders appear in the standard border color (#DDDDDD). All color applications maintain WCAG 2.1 Level AA contrast ratios for accessibility compliance.

### User Impact
Users experience a visually unified interface that feels professional and cohesive across all application screens. The consistent color palette creates stronger brand recognition and visual hierarchy. Color usage becomes predictable, helping users quickly identify interactive elements, status indicators, and information hierarchy. Users with accessibility needs benefit from standardized contrast ratios that ensure text remains readable in all contexts.

### Business Value
Aligning with the Airbnb design system elevates the application's professional appearance and strengthens brand consistency. A unified color system reduces design debt and future maintenance costs by establishing clear standards for new features. Accessibility compliance through proper contrast ratios reduces legal risk and expands the potential user base.

### Acceptance Criteria
- [ ] Primary text throughout the application uses Mine Shaft (#222222) or Hof (#484848)
- [ ] Secondary text and supporting information display in Foggy (#767676) or #717171
- [ ] Primary call-to-action elements use Radical Red (#FF385C) as the brand color
- [ ] Success states consistently display using Babu (#00A699)
- [ ] Warning states consistently use Arches (#FC642D)
- [ ] Error states consistently use Rausch (#FF5A5F)
- [ ] Background colors use White (#FFFFFF) or approved neutral variations from the design system
- [ ] Border colors consistently use #DDDDDD or defined system values
- [ ] All text-on-background combinations maintain minimum 4.5:1 contrast ratio for normal text
- [ ] All text-on-background combinations maintain minimum 3:1 contrast ratio for large text
- [ ] Color tokens are defined in a centralized location for consistent reuse
- [ ] No arbitrary color values remain in component implementations
- [ ] Visual testing confirms color consistency across all major user flows
- [ ] Accessibility audit verifies contrast compliance across the application

---

## REQ-122: Dashboard Statistics Summary API

**Date**: 2026-01-06 
**Type**: NEW FEATURE
**Size**: S

### Summary
The dashboard should display summary statistics showing the user's total number of properties, distinct room locations, and unique tags across all their items.

### Current Behavior
The dashboard does not provide any statistical overview of the user's inventory. Users cannot quickly see how many properties they manage, how many distinct locations they have items in, or what tags are being used across their collection.

### Expected Behavior
The dashboard displays three key metrics in a statistics summary:
- Total count of properties belonging to the current user
- Total count of distinct room/location names across all items
- Total count of unique tags applied across all items

When a user has no data (zero properties, rooms, or tags), the statistics display zero values without errors or broken states.

### User Impact
Users viewing the dashboard immediately see high-level metrics that provide quick insight into the scope and organization of their inventory. This helps users understand at a glance how much content they've created and how it's being categorized.

### Business Value
Provides users with immediate value and context when they access the dashboard, reinforcing engagement by showing their accumulated data. Creates foundation for future analytics and insights features.

### Acceptance Criteria
- [ ] Statistics accurately reflect the current user's total property count
- [ ] Room/location count represents distinct location names from all items belonging to the user
- [ ] Tag count represents all unique tags applied across the user's items
- [ ] All statistics display zero when the user has no data, without errors
- [ ] Statistics update when the user creates, modifies, or deletes relevant data
- [ ] API response time remains under 500ms for typical user data volumes


---

## REQ-123: Dashboard Statistics State Management Hook

**Date**: 2026-01-06 11:23
**Type**: NEW FEATURE
**Size**: S

### Summary
The dashboard statistics display should fetch data from the statistics API endpoint and provide a mechanism for users to refresh the displayed metrics on demand.

### Current Behavior
No client-side mechanism exists to fetch dashboard statistics from the API. The dashboard cannot retrieve or display the statistics data, and users have no way to request updated statistics without refreshing the entire page.

### Expected Behavior
When the dashboard loads, statistics automatically fetch from the API endpoint and display to the user. During the initial load, a loading indicator appears while the data is being retrieved. If the API request fails, an error state displays with appropriate user-facing messaging. After statistics load successfully, users can trigger a manual refresh to retrieve the latest data without reloading the page. The refresh operation updates the statistics display with current values while providing visual feedback that the refresh is in progress.

### User Impact
Users see their dashboard statistics immediately upon landing on the dashboard page. When users add new properties, rooms, or tags, they can manually refresh the statistics to see the updated counts reflected without losing their place or reloading the entire application. If network issues occur, users receive clear feedback about the problem rather than seeing stale or broken data.

### Business Value
Creates a responsive, real-time data experience that keeps users engaged with accurate information. Reduces perceived latency and improves user satisfaction by providing manual refresh capability. Establishes reusable patterns for state management that can be applied to other dashboard features.

### Acceptance Criteria
- [ ] Statistics automatically fetch when the dashboard component mounts
- [ ] A loading state displays while statistics are being retrieved from the API
- [ ] Statistics data populates the display once the API request completes successfully
- [ ] An error state displays with user-friendly messaging if the API request fails
- [ ] A refresh function is exposed that allows manual re-fetching of statistics
- [ ] Calling the refresh function triggers a new API request and updates the displayed data
- [ ] Visual feedback indicates when a refresh operation is in progress
- [ ] Multiple rapid refresh calls are handled gracefully without duplicate requests
- [ ] The loading state does not display when refreshing already-loaded statistics
- [ ] Error states from failed refresh attempts do not permanently block the interface


---

## REQ-124: Dashboard Statistics Cards Display Component

**Date**: 2026-01-06 10:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Dashboard users should see three statistics cards displaying counts for Items, Rooms, and Tags in a horizontal layout with consistent visual styling.

### Current Behavior
The dashboard does not display statistics cards showing counts for Items, Rooms, and Tags.

### Expected Behavior
The dashboard displays three cards in a single horizontal row, each showing:
- An icon representing the statistic type (package box, house, or tag)
- A large number displaying the current count
- A descriptive label below the number
- Consistent styling matching the Airbnb design language
- Smooth loading animation while data is being fetched
- Zero values displayed as "0" when no data exists

### User Impact
Dashboard visitors will immediately see key metrics about their inventory (Items, Rooms, Tags) upon landing on the page, providing quick insight into system usage without navigating to other sections.

### Business Value
Provides at-a-glance visibility into core inventory metrics, improving user orientation and reducing navigation time to access basic system information.

### Acceptance Criteria
- [ ] Three cards are displayed horizontally in a single row
- [ ] Each card shows an appropriate icon: package box for Items, house for Rooms, tag symbol for Tags
- [ ] Numbers are displayed prominently in 32px bold text
- [ ] Labels appear below numbers in 14px gray text
- [ ] Cards have white backgrounds with 12px rounded corners and subtle shadows
- [ ] During data loading, cards display a shimmer animation
- [ ] When count is zero, cards display "0" rather than empty state or "No data" message
- [ ] Visual styling matches Airbnb Design Language System standards

---

## REQ-125: Dashboard Page Statistics Display Integration

**Date**: 2026-01-06 (Modified: 2026-01-06)
**Type**: ENHANCEMENT
**Size**: S

### Summary
The Dashboard 2 page should display real-time statistics cards showing key metrics for properties, bookings, reviews, and revenue.

### Current Behavior
The Dashboard 2 page exists but does not display any statistics or metrics to the user. The statistics API, data hook, and display component exist but are not connected to the dashboard page.

### Expected Behavior
When a user navigates to the Dashboard 2 page, they should immediately see a set of statistics cards displaying:
- Total number of properties
- Total number of bookings
- Total number of reviews
- Total revenue amount

The statistics should load automatically when the page is accessed and display loading states while data is being fetched. If data cannot be retrieved, appropriate error states should be shown.

### User Impact
Property managers and administrators will gain immediate visibility into their key business metrics when accessing the dashboard, eliminating the need to navigate to separate sections to understand their business performance at a glance.

### Business Value
Provides users with instant access to critical business metrics, improving decision-making efficiency and user satisfaction with the dashboard experience.

### Acceptance Criteria
- [ ] Dashboard 2 page displays statistics cards on page load
- [ ] Statistics data is fetched automatically without user interaction
- [ ] Loading indicators appear while statistics are being retrieved
- [ ] All four metric cards (properties, bookings, reviews, revenue) are visible
- [ ] Error states are handled gracefully if data retrieval fails
- [ ] Statistics refresh appropriately when the page is revisited


---

## REQ-126: Action Buttons Component for Dashboard Operations

**Date**: 2026-01-06 15:30
**Type**: NEW FEATURE
**Size**: S

### Summary
Users should have quick access to primary dashboard actions through a set of three prominent, touch-friendly buttons: Create Item, View Items, and Print QR Codes.

### Current Behavior
The dashboard does not provide a centralized action button interface for common operations. Users must navigate through menus or other UI areas to access item creation, viewing, and QR code printing functionality.

### Expected Behavior
A row of three equal-width action buttons should be displayed prominently on the dashboard. Each button should:
- Show both an icon and descriptive text label
- Provide sufficient touch area for mobile and tablet users (minimum 48x48 pixels)
- Use distinct visual styling: the Create button appears with a red gradient indicating primary action, while View and Print buttons use a white background with black borders
- Respond to hover interactions with a subtle scale effect and background color change
- Maintain consistent spacing and alignment across all viewport sizes

### User Impact
Property managers and administrators will experience faster access to the three most common dashboard operations. Mobile and tablet users will benefit from large, easy-to-tap targets that reduce interaction errors.

### Business Value
Streamlines the user workflow for critical operations, reducing clicks and navigation time while improving accessibility and mobile usability.

### Acceptance Criteria
- [ ] Three buttons are displayed in equal widths within a single row
- [ ] Each button meets minimum touch target size of 48x48 pixels
- [ ] Create button displays with red gradient background and white text
- [ ] View and Print buttons display with white background, black border, and black text
- [ ] All buttons show appropriate icons alongside text labels
- [ ] Hover interaction triggers a 1.02x scale transformation
- [ ] Hover interaction applies darker background color to each button
- [ ] Button styling matches Airbnb Design Language System standards
- [ ] Buttons remain accessible and usable on mobile, tablet, and desktop viewports

---

## REQ-127: Smart Navigation for QR Code Printing Based on Property Count

**Date**: 2026-01-06 14:23
**Completed**: 2026-01-06 20:30
**Status**: ✅ COMPLETE
**Type**: ENHANCEMENT
**Size**: S

### Summary
When a user initiates the QR code printing action, the system should intelligently route them either directly to the print interface (for single-property accounts) or to a property selection screen (for multi-property accounts).

### Current Behavior
The print QR code button routing does not differentiate between single-property and multi-property users, potentially requiring unnecessary navigation steps for users with only one property.

### Expected Behavior
- Users with exactly one property are taken directly to the print QR code interface for that property
- Users with two or more properties are first presented with a property selector interface, then proceed to print the selected property's QR code
- The navigation decision occurs immediately when the user clicks the print QR code action

### User Impact
Single-property owners experience a streamlined workflow with one fewer navigation step, while multi-property owners retain the ability to choose which property's QR code to print.

### Business Value
Reduces friction in the QR code generation workflow for the majority of users who manage a single property, improving task completion time and user satisfaction.

### Acceptance Criteria
- [x] When a user with one property clicks print QR code, they navigate directly to the print interface showing that property's QR code
- [x] When a user with multiple properties clicks print QR code, they navigate to a property selection screen
- [x] The property count determination is accurate and reflects the user's current accessible properties
- [x] The navigation transition occurs without perceptible delay or loading states between decision and routing
- [x] If property count cannot be determined, the system defaults to the multi-property flow (property selector first)

### Implementation Details (Added 2026-01-06)

**Files Created:**
- `src/app/dashboard2/print/page.tsx` - Property selector page for multi-property users
- `src/app/dashboard2/print/[propertyId]/page.tsx` - Print flow page with QRCodePrintManager integration

**Files Modified:**
- `src/components/SimpleDashboard/ActionButtons.tsx` - Enhanced JSDoc documentation

**Key Features:**
- Smart navigation logic in ActionButtons routes users based on property count
- Property selector displays responsive grid with Airbnb design system styling
- Print flow validates property access and fetches items via API
- Full keyboard accessibility and ARIA labels throughout
- Error handling with retry functionality for network failures


---

## REQ-128: Property-Specific QR Code Print Flow Route

**Date**: 2026-01-06
**Completed**: 2026-01-06 21:00
**Status**: ✅ COMPLETE
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to select a property and navigate to a dedicated print page where they can print QR codes for all items associated with that property.

### Current Behavior
There is no dedicated route or interface for users to select a property and access a print-specific view for that property's QR codes.

### Expected Behavior
After selecting a property from a property selector interface, users are navigated to a property-specific print page that displays all items associated with that property and provides QR code printing functionality. The print page is accessible via a predictable URL pattern that includes the property identifier.

### User Impact
Property managers and administrators who need to print QR codes for multiple items within a specific property will have a streamlined workflow. This eliminates the need to manually filter or search for items belonging to a particular property when preparing to print labels.

### Business Value
Improves operational efficiency by providing a focused, property-scoped printing interface that reduces the time and effort required to generate QR code labels for property items.

### Acceptance Criteria
- [x] A property selection interface is available that allows users to choose which property they want to print QR codes for (implemented via REQ-127)
- [x] Upon property selection, users are navigated to a URL that includes the selected property's unique identifier (implemented via REQ-127)
- [x] The print page displays all items that belong to the selected property (implemented via REQ-127)
- [x] The print page includes functional QR code printing capabilities (QRCodePrintManager integration)
- [x] The interface correctly filters and displays only items associated with the selected property (API filtering)
- [x] Users can successfully generate and print QR codes for the property's items from this dedicated view (Full workflow verified)

### Implementation Details (Added 2026-01-06)

**Note**: REQ-128 was fully implemented as part of REQ-127 (Print QR Code Navigation Logic).

**Files Implemented:**
- `src/app/dashboard2/print/page.tsx` (217 lines) - Property selector page for multi-property users
  - Responsive grid layout (1-3 columns based on viewport)
  - Property cards with nickname, type, and address
  - Loading state with Airbnb-styled spinner
  - Empty state with "Add a Property" CTA
  - Single-property auto-redirect
  - Full keyboard accessibility with ARIA labels
  - Back navigation to dashboard
- `src/app/dashboard2/print/[propertyId]/page.tsx` (320 lines) - Print flow page with QRCodePrintManager integration
  - Property access validation via AuthContext
  - Items fetching from `/api/user/properties/[propertyId]/items`
  - Breadcrumb navigation for multi-property users
  - Error handling with retry functionality
  - Loading states during auth and data fetch
  - Invalid property redirect to selector
  - QRCodePrintManager integration with all required props
- `src/components/SimpleDashboard/ActionButtons.tsx` (191 lines) - Smart navigation logic based on property count
  - Single property → Direct to `/dashboard2/print/{id}`
  - Multiple properties → Navigate to `/dashboard2/print` selector

**API Integration:**
- `GET /api/user/properties/[propertyId]/items` - Fetches items filtered by property_id

**Airbnb Design System Compliance:**
- Primary gradient: `from-[#E61E4D] to-[#D70466]`
- Primary text: `text-[#222222]`
- Secondary text: `text-[#717171]`
- Border: `border-[#DDDDDD]`
- Card radius: `rounded-xl` (12px)
- Focus ring: `focus-visible:ring-2 ring-[#222222]`

**Verification Completed:**
- ✅ Build successful (npm run build)
- ✅ Property selector UI verified
- ✅ Print flow page verified
- ✅ ActionButtons navigation logic verified
- ✅ API integration verified
- ✅ Accessibility compliance verified (ARIA labels, focus states, keyboard navigation)


---

## REQ-129: Replace Legacy Action Cards with ActionButtons Component

**Date**: 2026-01-06 14:30
**Status**: COMPLETED (2026-01-06)
**Verified By**: REQ-129-replace-existing-action-cards-detailed.md
**Type**: ENHANCEMENT
**Size**: S

### Summary
Dashboard 2 should use the new ActionButtons component instead of the legacy action card implementation to provide a consistent and maintainable user interface.

### Current Behavior
Dashboard 2 displays action cards using an older implementation pattern that may differ in styling, structure, or behavior from the newly standardized ActionButtons component.

### Expected Behavior
Dashboard 2 seamlessly renders the ActionButtons component in place of the previous action cards, displaying all available actions (View FAQs, Edit Properties, Print QR Codes) with identical functionality and visual appearance to the new standard.

### User Impact
Property managers experience a more consistent interface across the dashboard, with no disruption to their existing workflows for accessing FAQ management, property editing, or QR code printing features.

### Business Value
Consolidating to a single action button component reduces maintenance overhead and ensures future enhancements to action buttons propagate uniformly across the application.

### Acceptance Criteria
- [x] Dashboard 2 renders the ActionButtons component in the same layout position as the previous action cards
- [x] All three action buttons (View FAQs, Edit Properties, Print QR Codes) function identically to their previous implementations
- [x] Visual styling matches the design specifications for the new ActionButtons component
- [x] No console errors or warnings appear when Dashboard 2 loads or when action buttons are clicked
- [x] Dashboard layout remains responsive and properly aligned after the component replacement

### Implementation Notes (2026-01-06)
- ActionButtons component integrated via `src/components/SimpleDashboard/ActionButtons.tsx`
- Three buttons: "Create New Item" (primary), "View Items" (secondary), "Print QR Code" (secondary)
- Responsive layout: 1 column on mobile, 3 columns on desktop
- WCAG 2.1 AA compliant with 48px touch targets and focus visible states
- Print QR Code uses property-based navigation (single property → direct, multiple → selector)
- No legacy action card code remains in dashboard2/page.tsx


---

## REQ-130: Property List Section for Dashboard 2

**Date**: 2026-01-06 14:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Dashboard 2 should display a property list section that shows all properties owned by the user, with each property row being clickable to navigate to an edit view, and an "Add New Property" button for creating additional properties.

### Current Behavior
Dashboard 2 does not currently display a dedicated section showing the user's properties in a navigable list format.

### Expected Behavior
Users see a clearly labeled section with a dynamic heading that reads "My Property" when they own exactly one property, or "My Properties" when they own multiple properties. Each property appears as a clickable row with a chevron icon indicating it can be expanded or navigated to. Clicking any property row opens that property's edit view. Below the list of properties, users see an "Add New Property" button that initiates the property creation flow.

### User Impact
Property managers can quickly view all their properties at a glance from the main dashboard, navigate directly to any property's edit interface with a single click, and easily add new properties without navigating through multiple menus or pages.

### Business Value
Centralizing property access on the main dashboard improves discoverability and reduces navigation friction, enabling property managers to maintain their property portfolio more efficiently and encouraging the addition of new properties to the platform.

### Acceptance Criteria
- [ ] A PropertySection component is displayed on Dashboard 2
- [ ] The section heading displays "My Property" when the user owns exactly one property
- [ ] The section heading displays "My Properties" when the user owns two or more properties
- [ ] Each property appears as a distinct, clickable row in the section
- [ ] Each property row displays a chevron icon positioned on the right side
- [ ] Clicking any property row navigates the user to that property's edit view
- [ ] An "Add New Property" button appears below the list of property rows
- [ ] Clicking the "Add New Property" button initiates the property creation workflow
- [ ] The component handles loading states while property data is being fetched
- [ ] The component handles empty states appropriately when the user has no properties
- [ ] The component is fully keyboard accessible with proper focus management
- [ ] The component follows the Airbnb design system color palette and styling conventions


---

## REQ-131: Property Edit Modal for Dashboard 2

**Date**: 2026-01-06 15:03
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to edit existing property information through a modal dialog that presents all property fields in an organized form, validates input, and provides clear feedback on save or cancel actions.

### Current Behavior
Users can navigate to a property edit view from the property list, but no modal interface exists to capture and save property information changes.

### Expected Behavior
When a user clicks on a property from the property list, a modal dialog opens displaying the property's current information in editable form fields. The modal presents Property Name as a required field with a maximum of 100 characters, followed by optional address fields including Address Line 1 (max 200 characters), Address Line 2 (max 200 characters), City (max 100 characters), State/Province (max 100 characters), Postal Code (max 20 characters), and Country (presented as a dropdown selection). Users can modify any field and click Save to commit changes, which triggers a success notification and closes the modal. If users click Cancel, all changes are discarded and the modal closes without saving. If users attempt to save with validation errors such as an empty required field or exceeded character limits, appropriate error messages appear next to the affected fields.

### User Impact
Property managers can quickly update property details without leaving the main dashboard context, receive immediate validation feedback on their input, and clearly understand which changes were saved versus discarded through visual confirmation.

### Business Value
Streamlining property data management through an intuitive modal interface reduces user frustration, decreases support requests related to property editing, and ensures property data quality through inline validation.

### Acceptance Criteria
- [ ] A modal dialog opens when a user selects a property from the property list
- [ ] The modal is implemented using Radix UI Dialog component
- [ ] All existing property data is pre-populated in the form fields when the modal opens
- [ ] Property Name field is marked as required and enforces a 100-character maximum
- [ ] Address Line 1 field accepts up to 200 characters and is marked as optional
- [ ] Address Line 2 field accepts up to 200 characters and is marked as optional
- [ ] City field accepts up to 100 characters and is marked as optional
- [ ] State/Province field accepts up to 100 characters and is marked as optional
- [ ] Postal Code field accepts up to 20 characters and is marked as optional
- [ ] Country field is presented as a dropdown selection and is marked as optional
- [ ] Clicking the Save button commits all field changes and closes the modal
- [ ] A success toast notification appears after successfully saving changes
- [ ] Clicking the Cancel button discards all changes and closes the modal
- [ ] Attempting to save with an empty Property Name field displays an error message
- [ ] Attempting to save with any field exceeding its character limit displays an error message
- [ ] Error messages appear adjacent to the field that failed validation
- [ ] The modal can be dismissed by clicking outside the dialog or pressing the Escape key
- [ ] The modal is fully keyboard accessible with proper focus management
- [ ] The modal follows the Airbnb design system color palette and styling conventions
- [ ] The modal is responsive and displays appropriately on mobile and desktop viewports


---

## REQ-132: Property Creation Modal for Dashboard 2

**Date**: 2026-01-06 16:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to create new properties through a modal dialog that presents the same form structure as the property edit modal, validates input, creates the property on save, and refreshes the property list to reflect the addition.

### Current Behavior
Users can initiate property creation by clicking the "Add New Property" button, but no modal interface exists to capture and save new property information.

### Expected Behavior
When a user clicks the "Add New Property" button, a modal dialog opens displaying empty form fields ready for data entry. The modal presents Property Name as a required field with a maximum of 100 characters, followed by optional address fields including Address Line 1 (max 200 characters), Address Line 2 (max 200 characters), City (max 100 characters), State/Province (max 100 characters), Postal Code (max 20 characters), and Country (presented as a dropdown selection). Users can fill in the fields and click Save to create the new property, which triggers property creation, closes the modal, displays a success notification, and refreshes the property list to show the newly added property. If users click Cancel, the modal closes without creating a property. If users attempt to save with validation errors such as an empty required field or exceeded character limits, appropriate error messages appear next to the affected fields.

### User Impact
Property managers can quickly add new properties to their portfolio without navigating away from the main dashboard, receive immediate validation feedback on their input, and see their new property appear in the list immediately upon successful creation.

### Business Value
Reducing friction in the property creation workflow encourages users to add more properties to the platform, increasing platform engagement and the total addressable inventory that can be managed through the system.

### Acceptance Criteria
- [ ] A modal dialog opens when a user clicks the "Add New Property" button
- [ ] The modal is implemented using Radix UI Dialog component
- [ ] All form fields are initially empty when the modal opens
- [ ] Property Name field is marked as required and enforces a 100-character maximum
- [ ] Address Line 1 field accepts up to 200 characters and is marked as optional
- [ ] Address Line 2 field accepts up to 200 characters and is marked as optional
- [ ] City field accepts up to 100 characters and is marked as optional
- [ ] State/Province field accepts up to 100 characters and is marked as optional
- [ ] Postal Code field accepts up to 20 characters and is marked as optional
- [ ] Country field is presented as a dropdown selection and is marked as optional
- [ ] Clicking the Save button creates the new property and closes the modal
- [ ] A success toast notification appears after successfully creating the property
- [ ] The property list refreshes automatically to display the newly created property
- [ ] Clicking the Cancel button discards all input and closes the modal
- [ ] Attempting to save with an empty Property Name field displays an error message
- [ ] Attempting to save with any field exceeding its character limit displays an error message
- [ ] Error messages appear adjacent to the field that failed validation
- [ ] The modal can be dismissed by clicking outside the dialog or pressing the Escape key
- [ ] The modal is fully keyboard accessible with proper focus management
- [ ] The modal follows the Airbnb design system color palette and styling conventions
- [ ] The modal is responsive and displays appropriately on mobile and desktop viewports
- [ ] The form reuses the same component structure as the property edit modal to maintain consistency


---

## REQ-133: Integrate Property Section into Dashboard 2

**Date**: 2026-01-06 (System generated)
**Type**: ENHANCEMENT
**Size**: S

### Summary
The Dashboard 2 page should display property information using the PropertySection component instead of placeholder or legacy code.

### Current Behavior
Dashboard 2 either shows placeholder property display elements or uses legacy property display code that does not leverage the newly created PropertySection component.

### Expected Behavior
When users access Dashboard 2, they see their property information rendered through the PropertySection component, which displays property details, action buttons, and management controls in a consistent, responsive layout within the dashboard grid.

### User Impact
Property managers and owners viewing Dashboard 2 will have access to the full property management interface, including viewing property details, editing properties, and adding new properties through the integrated PropertySection component.

### Business Value
Completes the property management workflow in Dashboard 2 by connecting the view layer (PropertySection) with the dashboard page, enabling users to actually manage their properties through the modernized interface.

### Acceptance Criteria
- [ ] PropertySection component is rendered within Dashboard 2 page
- [ ] Property data flows correctly from dashboard state to PropertySection
- [ ] Component maintains responsive design within dashboard grid layout
- [ ] All PropertySection features (view, edit, add property) function correctly when accessed through dashboard
- [ ] Any placeholder or legacy property display code is removed
- [ ] Page layout remains consistent with other Dashboard 2 sections


---

## REQ-134: Filter Statistics by Individual Property

**Date**: 2026-01-06 14:23
**Type**: ENHANCEMENT
**Size**: M

### Summary
Hosts with multiple properties should be able to view statistics filtered by a specific property or see aggregated totals across all their properties.

### Current Behavior
The statistics section displays aggregated totals across all properties without any indication that data spans multiple properties, and provides no way to view statistics for an individual property.

### Expected Behavior
- When a specific property is selected, statistics reflect only that property's data
- When viewing all properties together, statistics show aggregated totals with a clear "(all properties)" label
- The statistics section updates dynamically based on the current property filter selection
- All statistical metrics (bookings, revenue, guest interactions, etc.) respect the property filter context

### User Impact
Hosts with multiple properties can now analyze performance metrics per property, enabling them to:
- Compare performance across different properties
- Identify which properties generate the most engagement
- Make data-driven decisions about resource allocation per property
- Understand property-specific trends and patterns

### Business Value
Enables multi-property hosts to gain actionable insights at the property level, improving their ability to optimize individual property performance and make informed business decisions.

### Acceptance Criteria
- [ ] Statistics API accepts an optional propertyId filter parameter
- [ ] When propertyId is provided, API returns statistics for only that property
- [ ] When no propertyId is provided, API returns aggregated totals across all properties
- [ ] Statistics section displays "(all properties)" label when showing aggregated data
- [ ] Statistics section displays the property name when filtered to a single property
- [ ] All statistical metrics (counts, percentages, trends) accurately reflect the filtered scope
- [ ] Property filter changes trigger statistics refresh with appropriate context
- [ ] Edge case: Hosts with only one property see statistics without the "(all properties)" label



---

## REQ-135: Print Flow Property Selector

**Date**: 2026-01-06 07:47
**Type**: ENHANCEMENT
**Size**: M

### Summary
Users should select which property's materials they want to print before accessing the print configuration screen.

### Current Behavior
The print flow proceeds directly to print configuration without prompting users to select which property's content they want to print, creating risk of printing materials for the wrong property in multi-property accounts.

### Expected Behavior
- A property selection step appears before the print configuration screen
- Users see a list of their properties with names and thumbnail images (if available)
- The currently active property in the application is pre-selected by default
- Users must explicitly select a property before proceeding to print configuration
- After selection, the print flow continues with configuration for the chosen property's content
- The selected property context is maintained throughout the remainder of the print workflow

### User Impact
Hosts managing multiple properties gain confidence that they are printing the correct property's materials (QR codes, FAQ sheets). This prevents costly mistakes like printing QR codes that direct guests to the wrong property's information.

### Business Value
Reduces user error in multi-property scenarios, improving trust and satisfaction with the print functionality. Prevents support issues related to incorrect materials being printed and distributed to properties.

### Acceptance Criteria
- [ ] Property selection step is inserted as the first screen in the print flow
- [ ] All properties belonging to the user are displayed with names and thumbnails
- [ ] Currently active property is pre-selected if one exists in application state
- [ ] Users cannot proceed to print configuration without selecting a property
- [ ] Selected property context is passed forward to subsequent print flow steps
- [ ] Property selector displays gracefully on both desktop and mobile devices
- [ ] Single-property accounts skip the selector and proceed directly to print configuration

---

## REQ-136: Dashboard Progressive UI Based on Property Count

**Date**: 2026-01-06 14:30
**Type**: ENHANCEMENT
**Size**: L

### Summary
The dashboard should automatically adapt its layout, components, and information density based on the number of properties a user manages.

### Current Behavior
The dashboard presents the same interface and level of detail regardless of whether a user manages one property or dozens of properties. This creates a suboptimal experience at both extremes: single-property users see unnecessary complexity, while multi-property users lack the aggregated views and navigation tools they need.

### Expected Behavior
The dashboard should progressively reveal features and adjust its presentation as the user's property portfolio grows:

- **Single Property (1)**: Streamlined, focused view showing only that property's details without selectors or aggregation tools
- **Few Properties (2-5)**: Introduction of property selector and basic comparison features
- **Multiple Properties (6-15)**: Enhanced filtering, grouping capabilities, and summary statistics become prominent
- **Many Properties (16+)**: Advanced navigation tools, bulk operations, portfolio-level analytics, and search functionality become available

The transition between these states should feel natural and helpful, not abrupt or confusing.

### User Impact
All users managing properties will experience a dashboard tailored to their specific scale of operations. New users with single properties will find the system simpler and less intimidating, while power users managing larger portfolios will have access to advanced tools exactly when they need them.

### Business Value
Progressive UI reduces friction for new users during onboarding while simultaneously providing scalability for growing users. This supports user retention at both ends of the spectrum without requiring users to learn features they don't need or search for features they do need.

### Acceptance Criteria
- [ ] Dashboard detects the current property count and adjusts its layout accordingly
- [ ] Single-property users see a simplified dashboard without property selection controls
- [ ] Property selector appears when a user has 2 or more properties
- [ ] Filtering and grouping controls become visible when a user has 6 or more properties
- [ ] Advanced navigation tools (search, bulk actions, portfolio analytics) appear when a user has 16 or more properties
- [ ] The transition between UI states occurs automatically when properties are added or removed
- [ ] All functionality remains accessible regardless of property count (progressive disclosure, not removal)
- [ ] Users can manually access advanced features even with fewer properties if desired (via settings or preferences)


---

## REQ-137: Empty State Guidance with Contextual CTAs

**Date**: 2026-01-06 14:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
When users encounter screens with no data or content, the system should display friendly, helpful empty states that guide them toward the appropriate next action.

### Current Behavior
Screens with no content may show blank areas or generic messages that don't guide users on what to do next. New users or users without properties or items may not understand how to begin or what actions are available.

### Expected Behavior
The system displays context-aware empty states that:
- Acknowledge the current empty condition with friendly, encouraging language
- Explain why the screen is empty in a helpful way
- Provide a clear call-to-action button or link to resolve the empty state
- Use welcoming, Airbnb-style tone that makes users feel supported rather than lost

Specific scenarios include:
- New user with no items: Display a welcoming message encouraging them to create their first item
- No properties available: Show a prompt inviting them to add their first property
- Any other empty data views: Provide appropriate guidance with consistent visual and tonal patterns

### User Impact
New users and existing users encountering empty sections will have clear guidance on next steps, reducing confusion and abandonment. The friendly messaging creates a more welcoming experience that aligns with hospitality-focused brand expectations.

### Business Value
Improved onboarding and user activation by reducing friction when users encounter empty states. Better conversion from new signups to active users through clear, encouraging guidance.

### Acceptance Criteria
- [ ] New users see a welcoming empty state with "Create your first item" messaging and prominent CTA when no items exist
- [ ] Users without properties see an encouraging empty state with "Add your first property" messaging and clear action button
- [ ] All empty state messages use friendly, helpful tone consistent with Airbnb's communication style
- [ ] Empty states include visual elements (icons or illustrations) that complement the messaging
- [ ] Call-to-action buttons in empty states successfully navigate to or trigger the appropriate creation flow
- [ ] Empty states are visually distinct from error states to avoid confusion
- [ ] Messaging is concise and action-oriented, avoiding jargon or technical language


---

## REQ-138: Shimmer Skeletons and Consistent Loading Indicators

**Date**: 2026-01-06 10:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Display engaging shimmer skeleton placeholders during data loading and provide consistent loading indicators across all async operations to improve perceived performance and user experience.

### Current Behavior
Users encounter blank spaces, abrupt content shifts, or inconsistent loading feedback when data is being fetched. Some sections may show loading indicators while others display nothing, creating an inconsistent and potentially confusing experience.

### Expected Behavior
When content is loading, users see shimmer skeleton components that mirror the layout of the actual content (cards, lists, tables, etc.). All async operations display a consistent loading indicator (spinner or progress indicator) that clearly communicates system activity. The transition from skeleton to actual content is smooth and visually polished.

### User Impact
All users benefit from a more polished, responsive-feeling application. The shimmer effect reduces perceived wait time and provides clear visual feedback that the system is working. Users can anticipate content layout before data arrives, reducing cognitive load and layout shift jarring.

### Business Value
Improved perceived performance increases user satisfaction and reduces frustration during loading states. Professional, consistent loading experiences enhance brand perception and application polish.

### Acceptance Criteria
- [ ] All data-loading sections (dashboard, property lists, statistics, forms) display shimmer skeleton placeholders while fetching
- [ ] Skeleton placeholders accurately reflect the layout and structure of the loaded content
- [ ] All async operations (save, update, delete, fetch) show a consistent loading indicator
- [ ] Loading states are visually distinct from empty states
- [ ] Transitions between loading and loaded states are smooth without jarring layout shifts
- [ ] Loading indicators automatically disappear when operations complete or error



---

## REQ-139: Comprehensive Accessibility Compliance

**Date**: 2026-01-06 14:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The application should meet WCAG accessibility standards by implementing proper keyboard navigation, screen reader support, and focus management throughout all interactive elements.

### Current Behavior
Some interactive elements may lack proper accessibility features, making the application difficult or impossible to use for people relying on keyboards, screen readers, or other assistive technologies. Users navigating without a mouse may encounter barriers when trying to interact with modals, forms, and other controls.

### Expected Behavior
All interactive elements should be fully accessible through keyboard navigation and assistive technologies:

- **Tab Navigation**: Users can navigate through all interactive elements in a logical, predictable order using the Tab key
- **Screen Reader Support**: All buttons, controls, and regions have descriptive ARIA labels that clearly communicate their purpose and state
- **Visual Focus Indicators**: When navigating via keyboard, the currently focused element displays a clear, visible focus ring that meets contrast requirements
- **Modal Keyboard Controls**: Users can close modal dialogs by pressing the Escape key, with focus properly managed when opening and closing
- **Semantic Structure**: Interactive elements use appropriate HTML elements and ARIA attributes to convey meaning and state

### User Impact
Users with disabilities or those who prefer keyboard navigation will be able to use the application independently and efficiently. This includes users with motor impairments, vision impairments using screen readers, and power users who prefer keyboard shortcuts.

### Business Value
Accessibility compliance expands the potential user base, demonstrates social responsibility, reduces legal risk, and often improves the overall user experience for all users regardless of ability.

### Acceptance Criteria
- [ ] All interactive elements (buttons, links, form inputs, modals) can be reached and activated using only keyboard navigation
- [ ] Tab order follows a logical sequence that matches visual layout and workflow
- [ ] All buttons, form controls, and regions have descriptive ARIA labels appropriate for screen readers
- [ ] Focused elements display a visible focus indicator (2px ring in #222222) that meets WCAG contrast requirements
- [ ] Modal dialogs can be dismissed by pressing the Escape key
- [ ] When a modal opens, focus moves to the modal; when closed, focus returns to the triggering element
- [ ] Focus is trapped within modal dialogs (tabbing cycles through modal elements only)
- [ ] All functionality available via mouse is also available via keyboard

---

## REQ-140: Mobile-Responsive Dashboard Experience

**Date**: 2026-01-06 11:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The dashboard must adapt its layout and interaction patterns to provide an optimal experience on mobile devices with touch-friendly controls and appropriate content stacking.

### Current Behavior
The dashboard layout is optimized for desktop viewports. On mobile devices, statistics cards may display in a grid that causes horizontal scrolling or cramped content. Action buttons may appear in a horizontal row that doesn't fit smaller screens. Modals may retain their desktop dimensions, creating awkward spacing or requiring unnecessary scrolling. Interactive elements may be smaller than recommended touch target sizes, making them difficult to activate accurately on touch devices.

### Expected Behavior
When viewed on mobile devices, the dashboard automatically reorganizes to a vertical, single-column layout. Statistics cards display one per row, stacked vertically for easy scanning. Action buttons stack vertically with appropriate spacing between them. Modal dialogs expand to utilize the full screen on mobile devices, maximizing visible content and minimizing scrolling. All interactive elements (buttons, links, form controls) meet or exceed 48-pixel minimum touch target dimensions to ensure comfortable, accurate tapping without precision difficulties.

### User Impact
Property managers and staff accessing the dashboard from mobile devices will experience a significantly improved interface. Content will be easier to read without horizontal scrolling or pinch-to-zoom. Actions will be easier to trigger without mis-taps. The mobile experience will feel intentionally designed for touch interaction rather than being a scaled-down desktop interface.

### Business Value
Mobile responsiveness is essential for modern web applications. Property managers often check dashboards while on-site or away from their desks, making mobile access critical for operational efficiency and timely decision-making.

### Acceptance Criteria
- [ ] Statistics cards display in a single-column layout (one card per row) on mobile viewports
- [ ] Action buttons stack vertically with adequate spacing on mobile viewports
- [ ] Modal dialogs utilize full-screen presentation on mobile devices
- [ ] All interactive elements (buttons, links, inputs, controls) have minimum 48px tap targets on touch devices
- [ ] Dashboard remains fully functional across mobile viewport sizes (320px width and up)
- [ ] No horizontal scrolling occurs on mobile devices when viewed at standard zoom levels
- [ ] Touch interactions (tap, swipe) work smoothly without requiring precise targeting


---

## REQ-141: Dashboard Navigation Restructure - Properties Menu Integration

**Date**: 2026-01-08 10:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
The dashboard navigation should provide direct menu access to properties management while removing the properties tile from the main dashboard view.

### Current Behavior
- The top navigation bar displays "Home", "Create Item", and "My Items" menu options
- A "My Properties" card appears in the dashboard body with an empty state message
- Users access properties through the dashboard tile rather than top-level navigation

### Expected Behavior
- The top navigation bar displays "Home", "My Properties", and "My Items" menu options
- The "Create Item" menu option is removed from the navigation bar
- The "My Properties" card section is removed from the dashboard body
- Users navigate to properties management through the top navigation menu
- Item creation remains available through the existing "Create New Item" button on the dashboard body

### User Impact
Users managing multiple properties will have faster, more consistent access through top-level navigation rather than scrolling to find the properties section. The dashboard home view becomes cleaner and more focused on primary actions.

### Business Value
Elevates property management to the same navigation hierarchy as other core features, recognizing properties as a primary user workflow rather than a secondary dashboard feature.

### Acceptance Criteria
- [ ] Top navigation menu no longer displays "Create Item" option
- [ ] Top navigation menu includes "My Properties" option in a logical position
- [ ] Clicking "My Properties" in navigation routes to the properties management view
- [ ] Dashboard body no longer displays the "My Properties" card/tile section
- [ ] "Create New Item" button remains functional on the dashboard body
- [ ] All navigation transitions work smoothly without broken routes or empty states


---

## REQ-142: Property Context System and Enhanced Item Management

**Date**: 2026-01-08 14:35
**Type**: NEW FEATURE
**Size**: L

### Summary
Users need the ability to switch between multiple properties in the dashboard, with all displayed data filtered to the currently selected property, and enhanced item management capabilities including view, edit, and delete actions.

### Current Behavior
The dashboard displays all items regardless of property association. Users cannot switch property context, and there is no automatic property creation for new users. Item management is limited, with no inline view, edit, or delete capabilities from the item list.

### Expected Behavior
**Property Context System:**
- A property dropdown selector appears in the top navigation bar showing all properties belonging to the user
- Selecting a property filters all dashboard data (items, rooms, statistics) to show only that property's data
- New users automatically receive a default property named "My Property" upon first login
- The selected property persists across browser sessions
- All newly created items are automatically associated with the currently selected property

**Enhanced Item Management:**
- Each item displays three action buttons: View, Edit, and Delete
- View action opens a modal showing item details (name, description, links, media, room, timestamps) styled according to the dashboard design system, without displaying the QR code
- Edit action opens the item editor with current item data pre-populated
- Delete action shows a confirmation dialog, with additional warnings if media is attached, and removes both the item and all associated media files upon confirmation

### User Impact
**Who is affected:**
- New users who need an immediate starting point for organizing items
- Property managers handling multiple properties who need to view data in isolation
- All users who need to review, modify, or remove items from their dashboard

**How their experience changes:**
- Multi-property users can cleanly separate and view data by property without confusion
- New users experience a seamless onboarding with an automatically created default property
- Users can perform all item management tasks without navigating away from the dashboard
- Item deletion becomes safer with confirmation dialogs and clear warnings about associated resources

### Business Value
This feature enables the platform to serve multi-property users effectively, which expands the addressable market beyond single-property managers. The enhanced item management reduces friction in the user workflow and prevents accidental data loss through proper confirmations.

### Acceptance Criteria
- [ ] Property dropdown appears in the top navigation bar and displays all properties belonging to the authenticated user
- [ ] Selecting a property from the dropdown filters all dashboard content (items list, rooms list, statistics) to show only data associated with that property
- [ ] First-time users automatically have a default property created with name "My Property" and appropriate default description
- [ ] The selected property context persists across browser sessions using client-side storage
- [ ] Items created while a property is selected are automatically associated with that property
- [ ] Each item in the items list displays View, Edit, and Delete action buttons
- [ ] View action opens a modal displaying item details styled according to dashboard design system, without showing the QR code
- [ ] Edit action opens an editor pre-populated with the selected item's current data
- [ ] Delete action displays a confirmation dialog before proceeding
- [ ] Delete confirmation shows an additional warning when the item has associated media files
- [ ] Confirming deletion removes the item record and all associated media files from storage
- [ ] The property dropdown gracefully handles scenarios where users have no properties or only one property


---

## REQ-143: Media Management on Edit Item Page

**Date**: 2026-01-08 (Modified: 2026-01-08)
**Type**: ENHANCEMENT
**Size**: L

### Summary
Users should be able to view, add, edit, delete, and reorder all media assets associated with an item directly from the Edit Item page.

### Current Behavior
The Edit Item page only allows users to modify the item's name and description. Media assets (YouTube videos, PDFs, images, text content) associated with the item cannot be viewed or managed from this page. Users must navigate elsewhere or use separate tools to see what media is attached to an item or to make changes to it.

### Expected Behavior
When editing an item, users should see a dedicated media management section that displays all existing media assets. From this section, users can:
- See a list of all media currently associated with the item, with appropriate previews or thumbnails
- Add new media by providing a title, URL, and selecting the media type
- Edit the title, URL, or type of existing media
- Remove media that is no longer needed
- Reorder media to control the sequence in which it appears to end users

### User Impact
This affects property managers and administrators who need to curate the content available for each item. Currently, they must manage media separately from other item attributes, creating a fragmented editing experience. This enhancement consolidates all item-related editing tasks into a single interface, reducing navigation overhead and cognitive load.

### Business Value
Streamlining the media management workflow reduces the time required to maintain property content and decreases the likelihood of errors or omissions. A unified editing experience improves user satisfaction and makes the platform more competitive with other property management solutions.

### Acceptance Criteria
- [ ] All existing media assets linked to the item are displayed in the media management section
- [ ] Each media entry shows its title, type, and a preview or thumbnail where applicable
- [ ] Users can add a new media asset by specifying a title, URL, and type (YouTube, PDF, image, text)
- [ ] Users can edit the title, URL, and type of any existing media asset
- [ ] Users can delete any media asset, with confirmation to prevent accidental removal
- [ ] Users can reorder media assets, and the new order is persisted
- [ ] Changes to media assets are saved when the user saves the item
- [ ] The media management section is visually integrated with the rest of the Edit Item page


---

## REQ-144: Pre-fill Room and Item Type in Item Details Form

**Date**: 2026-01-08 14:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
When users reach the Item Details form during item creation, the Room and Item Type fields should be automatically populated with the values they selected earlier in the workflow, eliminating redundant data entry.

### Current Behavior
Users select a Room in the first step of the item creation workflow, then select an Item Type in the second step. When they later reach the Item Details form (after recording or selecting media), both the Room and Item Type dropdown fields are empty, requiring users to re-enter information they already provided.

### Expected Behavior
When the Item Details form appears, the Room dropdown should display the room the user selected in the initial room selection step, and the Item Type dropdown should display the item type they chose in the item type selection step. Users can still change either value if needed, but they are not required to re-select them.

### User Impact
All users creating items will save time and experience less friction during the item creation process. This particularly benefits users creating multiple items in a single session, as they avoid repetitive selections for each item.

### Business Value
Reduces user frustration and time-to-completion for item creation, improving overall workflow efficiency and user satisfaction with the item management system.

### Acceptance Criteria
- [ ] When a user reaches the Item Details form, the Room field displays the room selected in the room selection step
- [ ] When a user reaches the Item Details form, the Item Type field displays the item type selected in the item type selection step
- [ ] Users can change the pre-filled Room value by selecting a different option from the dropdown
- [ ] Users can change the pre-filled Item Type value by selecting a different option from the dropdown
- [ ] If a user changes the pre-filled values, the new selections are saved with the item
- [ ] Pre-filled values persist correctly if a user navigates backward and forward through the workflow steps

---

## REQ-145: Support Video Link Type in Items API

**Date**: 2026-01-09 20:15
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The system should accept 'video' as a valid link type when creating or updating items through the API, enabling users to attach video content directly to items.

### Current Behavior
When creating or updating an item, the API only accepts four link types: 'youtube', 'pdf', 'image', and 'text'. Attempting to save an item with a 'video' link type results in validation failure, preventing users from uploading video content through the item creation workflow.

### Expected Behavior
Users can successfully create or update items with link type set to 'video'. The API accepts the 'video' link type during validation and processes it the same way it handles other media types like 'image' and 'pdf'.

### User Impact
All users creating items with video content will be able to upload and attach videos directly to their items, expanding the types of instructional or informational content they can provide to guests.

### Business Value
Enables video upload functionality as part of a larger file upload feature rollout. This is a prerequisite for implementing the complete video upload workflow, allowing properties to provide richer, more engaging content to their guests.

### Acceptance Criteria
- [ ] Items can be created with link type 'video' without triggering validation errors
- [ ] Items can be updated to change their link type to 'video' without triggering validation errors
- [ ] Existing items with other link types can be updated to 'video' without data loss
- [ ] The API returns appropriate success responses when handling 'video' link type
- [ ] No existing functionality for other link types (youtube, pdf, image, text) is affected


---

## REQ-146: File Upload API Endpoint for Item Media

**Date**: 2026-01-09 19:35
**Type**: NEW FEATURE
**Size**: M

### Summary
System should provide a secure endpoint that accepts file uploads from authenticated users and stores them in cloud storage, returning a publicly accessible URL.

### Current Behavior
No API endpoint exists to handle file uploads. Users can only reference external URLs or upload files directly to storage without server-side validation or authentication.

### Expected Behavior
Users submit files through a POST request to an API endpoint. The system validates file type and size, authenticates the user, generates a unique filename, stores the file in cloud storage, and returns the public URL along with file metadata. If validation fails or the user is not authenticated, appropriate error responses are returned.

### User Impact
Authenticated users creating or editing items will be able to upload videos, photos, and PDFs through a reliable server-side endpoint. This removes the need for client-side direct uploads and provides consistent validation and error handling.

### Business Value
Centralizes file upload logic with proper authentication and validation, reducing security risks and ensuring consistent file naming conventions. Enables future client implementations to upload media without duplicating validation logic.

### Acceptance Criteria
- [ ] Endpoint accepts POST requests with multipart form data containing a file
- [ ] Endpoint rejects files that are not videos, images, or PDFs
- [ ] Endpoint rejects files exceeding size limits: 50MB for videos, 10MB for photos, 20MB for PDFs
- [ ] Endpoint returns 401 error when user is not authenticated
- [ ] Endpoint generates unique filenames using user ID, timestamp, and UUID
- [ ] Endpoint stores files in cloud storage and returns public URL with metadata
- [ ] Endpoint returns appropriate error messages for validation failures and upload errors
- [ ] Response includes original filename, file size, content type, and public URL


---

## REQ-147: Integrate File Upload into Item Creation Workflow

**Date**: 2026-01-09 12:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
Enable users to record videos, capture photos, and upload PDFs during item creation, with automatic upload to cloud storage before saving.

### Current Behavior
When users capture or select media content (video, photo, PDF) during the item creation workflow, the system skips saving that content because it contains File or Blob data instead of URLs. Captured media is lost when the item is saved.

### Expected Behavior
When users capture video, take photos, or upload PDFs during item creation, the system automatically uploads these files to cloud storage before saving the item. The upload shows progress feedback, handles errors gracefully, and replaces the captured File or Blob data with the returned storage URL. All captured content is persisted and viewable by guests.

### User Impact
Property owners can create items with rich media content including recorded videos, captured photos, and uploaded PDFs. Previously captured media that was being discarded will now be saved and displayed to guests, making the item creation workflow fully functional for all content types.

### Business Value
Completes the file upload feature implementation, making the item creation workflow production-ready for all media types. Enables property owners to provide richer, more helpful content to their guests through video demonstrations and visual guides.

### Acceptance Criteria
- [ ] Video, photo, and PDF files are uploaded to cloud storage before item save
- [ ] Upload progress indicator displays during file upload operations
- [ ] Failed uploads display clear error messages and allow retry
- [ ] Uploaded files are correctly mapped to appropriate content link types (video, image, pdf)
- [ ] Users cannot submit the form while uploads are in progress
- [ ] URL and text content continues to work as before without modification
- [ ] Large video files show progress feedback throughout the upload process
- [ ] Multiple files within the same item are uploaded sequentially or in parallel as appropriate



---

## REQ-148: Support Item-Related Articles with Purpose Categories

**Date**: 2026-01-09 21:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should store and organize articles associated with items, allowing categorization by purpose such as usage instructions, cleaning procedures, and troubleshooting guides.

### Current Behavior
No structured storage exists for item-related articles. Content that could help guests use, maintain, or troubleshoot items cannot be organized by purpose or easily retrieved.

### Expected Behavior
Property owners can associate multiple articles with any item, each categorized by its purpose (how to use, how to clean, troubleshooting, etc.). Articles are automatically titled based on their purpose and the item name. Articles can be ordered for display and are automatically removed when their parent item is deleted.

### User Impact
Property owners will have a structured way to provide comprehensive guidance to guests about items in their property. Guests will be able to access categorized help content, making it easier to find the specific information they need.

### Business Value
Creates the foundation for rich, organized documentation about property items. Enables property owners to provide better guest experiences through structured help content, potentially reducing support requests and improving guest satisfaction.

### Acceptance Criteria
- [ ] Articles can be created and linked to specific items
- [ ] Each article has a purpose category that indicates its content type
- [ ] Articles have titles that can be automatically generated from purpose and item name
- [ ] Articles can include optional detailed descriptions
- [ ] Multiple articles for the same item can be ordered for display
- [ ] Articles are automatically deleted when their parent item is deleted
- [ ] Articles can be efficiently retrieved by item identifier
- [ ] Access to articles respects security policies similar to other item-related data
- [ ] Creation and modification timestamps are tracked for each article



---

## REQ-149: Link Items to Articles for Relationship Mapping

**Date**: 2026-01-09 22:15
**Type**: ENHANCEMENT
**Size**: S

### Summary
The system should establish a direct relationship between items and articles through a database link, allowing articles to be properly associated with the items they describe.

### Current Behavior
The item links table stores references to various content types associated with items, but cannot reference articles. This prevents items from having a structured relationship to their instructional or informational articles.

### Expected Behavior
Items can be linked to articles through a dedicated reference that maintains referential integrity. When an article is deleted, any links to it are automatically removed. The system can efficiently query which articles are associated with a given item and vice versa.

### User Impact
Property owners will be able to create rich connections between items and their documentation. Guests viewing an item will be able to access all related articles through a unified interface.

### Business Value
Completes the foundational data model for item-article relationships, enabling the full implementation of item documentation features. Supports backwards compatibility with existing item links while enabling new article-based features.

### Acceptance Criteria
- [ ] Items can be linked to articles through a database relationship
- [ ] Links to articles are automatically removed when the article is deleted
- [ ] Existing item links continue to function without disruption
- [ ] The system can efficiently find all articles linked to a specific item
- [ ] The relationship respects database constraints and referential integrity
- [ ] NULL values are supported for links that do not reference articles


---

## REQ-150: Implement Row Level Security Policies for Item Articles

**Date**: 2026-01-09 14:32
**Type**: ENHANCEMENT
**Size**: S

### Summary
The system must enforce access control policies on item articles, ensuring users can only access articles associated with their own properties while allowing public read access for QR code scanning scenarios.

### Current Behavior
The item articles table exists without Row Level Security policies, meaning access control is not enforced at the database level and must be manually implemented in application logic.

### Expected Behavior
- Users can view, create, modify, and remove articles only for items they own through property ownership
- Authenticated users cannot access articles belonging to other users' properties
- Public users (unauthenticated) can view any article when accessed through its public identifier
- The database automatically enforces these rules regardless of how the data is accessed

### User Impact
Property owners gain confidence that their item article data is protected and cannot be accessed or modified by other users, while maintaining the ability to share articles publicly via QR codes for guest access.

### Business Value
Enforcing security at the database level provides defense-in-depth protection and reduces the risk of security vulnerabilities in the application layer exposing sensitive property and item information.

### Acceptance Criteria
- [ ] Authenticated users can view articles for items in properties they own
- [ ] Authenticated users can create new articles for items in properties they own
- [ ] Authenticated users can modify existing articles for items in properties they own
- [ ] Authenticated users can remove articles for items in properties they own
- [ ] Authenticated users cannot view articles for items in properties owned by others
- [ ] Unauthenticated users can view any article regardless of ownership
- [ ] All access control is enforced at the database level through RLS policies



---

## REQ-151: API Endpoint Updates for Article-Based Content Structure

**Date**: 2026-01-09 22:45
**Type**: ENHANCEMENT
**Size**: L

### Summary
The system's API endpoints must be updated to support creating, retrieving, and managing articles alongside items, enabling the transition to an article-based content organization model.

### Current Behavior
The items API endpoints create and return item data with direct links to content, but do not handle article creation or retrieval. There is no dedicated API for managing articles separately. The display interface organizes content by link type rather than by conceptual grouping.

### Expected Behavior
When an item is saved, the API automatically creates the associated article records based on the content provided. When items are retrieved, the response includes their related articles with nested link information. A complete set of CRUD endpoints exists for managing articles independently. The display interface groups and presents content by article, making it easier for users to understand the organized structure of information about each item.

### User Impact
Property owners will experience a more intuitive content management workflow where articles are created automatically during item creation. Guests viewing items will see content organized by article topics rather than scattered across different content types, improving comprehension and usability.

### Business Value
Enables the full implementation of the article-based content structure, providing a more scalable and maintainable approach to organizing item-related information. Improves both the content authoring experience and the end-user consumption experience.

### Acceptance Criteria
- [ ] Saving an item through POST to items endpoint automatically creates article records for included content
- [ ] Retrieving items through GET from items endpoint returns articles with their nested links
- [ ] Full CRUD operations are available for articles through dedicated endpoints
- [ ] The item display interface visually groups content by article rather than by content type
- [ ] Article creation during item save respects purpose categories and maintains proper relationships
- [ ] API responses maintain backward compatibility where possible with existing client implementations
- [ ] Error handling provides clear feedback when article operations fail
- [ ] Performance remains acceptable when loading items with multiple articles and nested content




---

## REQ-152: Update Type Definitions for Article-Based Data Structure

**Date**: 2026-01-09 22:52
**Type**: ENHANCEMENT
**Size**: S

### Summary
The application's TypeScript type definitions must be updated to reflect the new article-based content organization model, ensuring type safety and developer clarity throughout the codebase.

### Current Behavior
The existing type definitions represent items with directly attached links and content, but lack any representation of articles as an intermediate organizational layer. The type system does not enforce or communicate the article-based structure to developers.

### Expected Behavior
Type definitions accurately model the article-based structure where items contain articles, and articles contain links. Developers working with item data receive intellisense and type checking that guides them toward the correct article-based data structure. Admin API type definitions align with the updated data model.

### User Impact
Developers working on the system will have clearer guidance through type safety when building features that interact with item and article data, reducing bugs and improving code quality. This indirectly benefits property owners and guests through more reliable application behavior.

### Business Value
Ensures type safety during the database refactoring phase, catching potential errors at compile time rather than runtime. Provides self-documenting code that helps current and future developers understand the article-based content model.

### Acceptance Criteria
- [ ] An ItemArticle type exists representing article records with all required fields
- [ ] The ItemArticle type includes support for nested links
- [ ] The ItemArticle type includes purpose, title, description, and display order fields
- [ ] The Item type is updated to include an articles property containing an array of ItemArticle
- [ ] Admin API type definitions reflect the article-based structure
- [ ] All timestamp fields are properly typed
- [ ] Type definitions support optional fields where the schema permits nulls
- [ ] Existing code using the old Item type surface compilation errors that guide refactoring


---

## REQ-153: Migrate Existing Item Links to Article Structure

**Date**: 2026-01-09 
**Type**: ENHANCEMENT
**Size**: M

### Summary
Existing items with associated links must be migrated to use the new article-based structure without losing data or breaking existing functionality.

### Current Behavior
Items have links stored directly against them without an intermediate article grouping. When the database schema changes to require articles, existing link data could become orphaned or inaccessible.

### Expected Behavior
When the database schema is updated, all existing item links are automatically preserved by creating appropriate article records and updating link associations. Users continue to see all their existing content without interruption.

### User Impact
Users with existing items that have attached links will retain full access to their content after the system upgrade. No manual data re-entry or recovery is required.

### Business Value
Ensures zero data loss during schema migration and maintains user trust by preserving all existing work during system improvements.

### Acceptance Criteria
- [ ] All existing items with links have at least one article record created automatically
- [ ] All existing links are successfully associated with an article after migration
- [ ] No item links are orphaned or inaccessible after the migration completes
- [ ] The migration can be run safely on production data without requiring downtime
- [ ] Migration can be re-run safely if interrupted (idempotent behavior)



---

## REQ-154: Introduce Purpose Selection Step in Item Creation Workflow

**Date**: 2026-01-09 16:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
Users must select the purpose or intent of their item before proceeding with content creation, replacing the current content source selection as the first step in the workflow.

### Current Behavior
The item creation workflow begins with a content source selection step where users choose how they will provide content. The workflow does not explicitly capture the user's intent or purpose for creating the item.

### Expected Behavior
When creating a new item, users first encounter a purpose selection step that allows them to choose the intended use or goal of the item they are creating. This replaces the content source selection as the initial workflow step and establishes context for subsequent creation steps.

### User Impact
Property owners creating items will have a clearer, more intentional workflow that begins by defining why they are creating content rather than how they will create it. This change affects all users creating new items and provides better context for the remaining workflow steps.

### Business Value
Improves user experience by establishing intent before execution, allowing the system to better tailor subsequent steps based on the selected purpose. Creates foundation for purpose-driven content recommendations and workflow optimizations.

### Acceptance Criteria
- [ ] Users see a purpose selection interface as the first step when creating an item
- [ ] Multiple purpose options are available for selection with clear labels and descriptions
- [ ] The selected purpose is captured and maintained throughout the item creation workflow
- [ ] The content source selection step is removed from the workflow
- [ ] Progress indicators reflect the updated workflow step sequence
- [ ] Navigation between workflow steps accounts for the new step ordering
- [ ] Workflow state properly tracks the selected purpose value
- [ ] All step transitions function correctly with the updated workflow structure


---

## REQ-155: Generate Appropriate Titles Based on Item Purpose

**Date**: 2026-01-09 20:11
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must automatically generate appropriate descriptive titles for items based on their selected purpose type, ensuring consistent and meaningful naming across all content.

### Current Behavior
Items do not have automatically generated titles. Users must manually create titles, or titles may be missing or inconsistent when items are created programmatically without explicit title input.

### Expected Behavior
When an item is created with a purpose type, the system automatically generates a contextually appropriate title that describes the item's intended use. The generated title adapts to the specific purpose selected (e.g., "Check-in Instructions", "House Rules", "Welcome Guide"). If purpose information is missing, the system provides a sensible fallback title.

### User Impact
Property owners benefit from automatically generated, professional titles that clearly communicate the purpose of each item without requiring manual input. This reduces cognitive load during content creation and ensures consistency across all items of the same type.

### Business Value
Improves content organization and discoverability by ensuring all items have meaningful, purpose-driven titles. Reduces user friction during item creation by eliminating the need to think about appropriate naming conventions.

### Acceptance Criteria
- [ ] Items created with a purpose type receive an automatically generated title
- [ ] Generated titles accurately reflect the selected purpose type
- [ ] All supported purpose type combinations produce appropriate titles
- [ ] A fallback title is provided when purpose information is unavailable
- [ ] The title generation logic is centralized and reusable across the application
- [ ] Generated titles are clear, professional, and user-friendly
- [ ] The utility can be called from any part of the application that creates items

---

## REQ-156: Streamline Workflow by Removing Content Source Selection Step

**Date**: 2026-01-09 10:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The item creation workflow should simplify the user journey by removing the content source selection step and automatically generating titles when users select their item's purpose.

### Current Behavior
Users navigate through multiple steps in the creation workflow, including a separate content source selection step that adds friction to the process. Title generation is a separate, manual action that occurs independently of purpose selection.

### Expected Behavior
When users select the purpose of their item, the system automatically generates an appropriate title and the workflow bypasses the content source selection step entirely. The state machine transitions directly to the next relevant step after purpose selection, creating a more streamlined experience.

### User Impact
All users creating new items will experience a faster, more intuitive workflow with fewer decision points and automatic helpful defaults. This reduces cognitive load and time-to-completion for item creation.

### Business Value
Simplifying the creation workflow reduces user friction and abandonment, leading to higher completion rates and improved user satisfaction with the platform.

### Acceptance Criteria
- [ ] Selecting an item purpose automatically generates an appropriate title
- [ ] The content source selection step no longer appears in the creation flow
- [ ] Users can proceed to the next step immediately after selecting a purpose
- [ ] The system correctly determines which step follows purpose selection
- [ ] Users cannot advance from the purpose step until a valid purpose is selected
- [ ] All workflow transitions maintain data integrity across the simplified flow


---

## REQ-157: Implement Interactive Purpose Selection Interface

**Date**: 2026-01-09 20:13
**Type**: NEW FEATURE
**Size**: M

### Summary
Users need an interactive, accessible interface to select the purpose of their item from a grid of clearly labeled options with visual icons and smooth navigation.

### Current Behavior
The system has a purpose selection step defined in the workflow, but there is no interactive user interface component to present purpose options and capture user selection in an engaging, accessible manner.

### Expected Behavior
Users see a visually appealing grid of purpose cards, each with a distinctive icon and clear label. They can select a purpose using mouse clicks, touch gestures, or keyboard navigation. Upon selection, visual feedback confirms their choice before the workflow automatically advances to the next step. Screen readers announce options and selections appropriately.

### User Impact
All users creating items will interact with this interface as their first step. The experience must be intuitive for mouse users, touch device users, keyboard-only users, and assistive technology users alike. A polished, responsive interface improves user confidence and reduces confusion during item creation.

### Business Value
A well-designed purpose selection interface sets a professional tone for the entire item creation experience. Proper accessibility ensures compliance and inclusivity, while smooth interactions reduce abandonment and support requests.

### Acceptance Criteria
- [ ] Purpose options are displayed in a responsive grid layout that adapts to screen size
- [ ] Each purpose option displays a distinctive icon and clear text label
- [ ] Users can select a purpose by clicking or tapping on a card
- [ ] Keyboard users can navigate between purpose cards using arrow keys
- [ ] Pressing Enter or Space on a focused card selects that purpose
- [ ] Selected card displays visual feedback before automatic workflow advancement
- [ ] A brief delay between selection and advancement provides time for users to see their choice confirmed
- [ ] Screen readers announce each purpose option and the current selection state
- [ ] All interactive elements include appropriate ARIA labels and roles
- [ ] The component follows the established pattern used in similar selection steps
- [ ] The component is properly exported and integrated into the workflow step sequence

</EOF>

---

## REQ-158: Integrate Purpose Selection Step into Item Creation Workflow

**Date**: 2026-01-09 23:32
**Type**: ENHANCEMENT
**Size**: S

### Summary
The purpose selection interface component must be integrated into the main item creation workflow so users can access and interact with it during the creation process.

### Current Behavior
The purpose selection component exists as a standalone element but is not connected to the item creation workflow. Users navigating through the workflow cannot access the purpose selection interface, making it impossible to specify the purpose of their item during creation.

### Expected Behavior
When users reach the purpose selection stage of the workflow, they see and can interact with the purpose selection interface. Their selection triggers the appropriate workflow action, and the workflow advances to the next step after a purpose is chosen. The interface displays correctly within the workflow layout and responds to all workflow state changes.

### User Impact
All users creating new items will be able to access the purpose selection step as a natural part of their creation journey. Without this integration, the purpose selection feature remains inaccessible to users, blocking the entire purpose-driven workflow enhancement.

### Business Value
Completing this integration is essential to deliver the purpose-based workflow improvements to users. This represents a critical path item that unlocks the value of related purpose-driven features.

### Acceptance Criteria
- [ ] The purpose selection component appears when the workflow reaches the purpose selection step
- [ ] Users can interact with all purpose selection interface elements within the workflow
- [ ] Selecting a purpose triggers the correct workflow state transition
- [ ] The workflow advances to the appropriate next step after purpose selection
- [ ] The purpose selection step displays consistently with other workflow steps
- [ ] Navigation between workflow steps functions correctly before and after the purpose selection step
- [ ] All workflow state data related to purpose selection is properly maintained

---

## REQ-159: Unit Tests for Purpose Selection Step Component

**Date**: 2026-01-09 20:15
**Type**: ENHANCEMENT
**Size**: S

### Summary
The purpose selection step component requires comprehensive unit tests to verify state management, navigation, auto-advance behavior, and accessibility compliance.

### Current Behavior
The purpose selection step component exists and functions within the workflow, but lacks automated test coverage. Without tests, regressions could be introduced during future changes, and there is no verification that the component meets accessibility standards or handles keyboard navigation correctly.

### Expected Behavior
A complete test suite validates all critical behaviors of the purpose selection step. Tests confirm that selecting a purpose updates state correctly, the step auto-advances after selection, keyboard navigation works as intended, and all accessibility attributes are properly configured. Tests execute quickly, provide clear failure messages, and maintain high code coverage for the component.

### User Impact
All users benefit from a more reliable and accessible purpose selection experience. Users who rely on keyboard navigation or assistive technologies will have confidence that the interface has been validated for their needs. Developers gain confidence when making changes to the component.

### Business Value
Test coverage reduces the risk of bugs in production and ensures accessibility compliance, which broadens the user base and reduces potential legal exposure. Automated tests accelerate development velocity by catching issues early.

### Acceptance Criteria
- [ ] Tests verify that selecting a purpose correctly updates the component state
- [ ] Tests verify the step auto-advances to the next step after purpose selection
- [ ] Tests verify keyboard navigation allows users to navigate and select purposes using keyboard only
- [ ] Tests verify proper ARIA labels, roles, and other accessibility attributes are present
- [ ] Tests achieve at least 90% code coverage for the purpose selection component
- [ ] All tests pass consistently and execute in under 5 seconds
- [ ] Test descriptions clearly communicate what behavior is being validated


---

## REQ-160: Remove Content Source Selection Step from Workflow

**Date**: 2026-01-09 20:17
**Type**: ENHANCEMENT
**Size**: S

### Summary
Users should proceed directly through the creation workflow without encountering the content source selection step, which has been identified as redundant.

### Current Behavior
The workflow includes a content source selection step that users must navigate through during the creation process. This step appears as part of the standard workflow sequence, requiring users to interact with or pass through it even when it does not add meaningful value to their workflow.

### Expected Behavior
The content source selection step no longer appears in the workflow. Users move seamlessly from the preceding step to the following step without interruption. The workflow maintains logical progression and all navigation controls function correctly despite the removal of this intermediate step. Step numbering and progress indicators automatically adjust to reflect the shortened workflow.

### User Impact
All users creating new items experience a more streamlined workflow with fewer steps to complete. The reduction in workflow length decreases time-to-completion and simplifies the overall user journey. Users no longer encounter a step that may have caused confusion or appeared unnecessary.

### Business Value
Removing redundant steps improves user satisfaction and reduces workflow abandonment rates. A leaner workflow demonstrates attention to user experience efficiency and reduces cognitive load during the creation process.

### Acceptance Criteria
- [ ] The content source selection step no longer appears in the workflow sequence
- [ ] Users navigate from the previous step directly to the next step without errors
- [ ] Step numbering and progress indicators reflect the correct total number of remaining steps
- [ ] All forward and backward navigation functions work correctly across the modified workflow
- [ ] No errors or warnings appear in the console related to the removed step
- [ ] The workflow can be completed end-to-end successfully
- [ ] Step index calculations remain accurate throughout the workflow


---

## REQ-161: Enhanced Content Type Step Labels with Format Guidance

**Date**: 2026-01-09 11:45
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The content type selection screen should display clearer labels and inform users about supported file formats before they attempt to upload.

### Current Behavior
Users see a "Upload File" option without immediate visibility into what file types are accepted, requiring them to click through to discover supported formats.

### Expected Behavior
Users see "Upload File" as the primary label with a subtitle displaying "Video, Image, PDF, Text" directly beneath it. Format hints appear alongside each content type option in the selection interface, providing upfront clarity about what can be uploaded.

### User Impact
All users creating items will benefit from reduced confusion and fewer failed upload attempts. Users will make more informed decisions about content type selection before proceeding to upload.

### Business Value
Reduces user frustration and support inquiries related to unsupported file formats. Improves workflow completion rates by setting clear expectations upfront.

### Acceptance Criteria
- [ ] "Upload File" label remains visible as the primary heading for the upload content type
- [ ] Subtitle text "Video, Image, PDF, Text" appears beneath the upload file label
- [ ] Content type selection options display format hints indicating supported file types
- [ ] Existing icon graphics remain properly aligned and visible
- [ ] Label changes do not break mobile responsive layout
- [ ] All text follows application typography and accessibility standards


---

## REQ-162: Consolidate Content Options into Single Selection Grid

**Date**: 2026-01-09 16:32
**Type**: ENHANCEMENT
**Size**: M

### Summary
Users should select from all available content creation methods in a single unified interface rather than navigating through multiple selection steps.

### Current Behavior
The workflow presents content options across separate steps, requiring users to first choose between different content sources before seeing the full range of content type options. This multi-step approach segments related choices and extends the workflow unnecessarily.

### Expected Behavior
Users encounter a single content selection screen displaying all five content creation options in a unified grid layout: Record Video, Take Photo, Write Text, Upload File (with subtitle: Video, Image, PDF, Text), and Add Link. All options appear simultaneously with equal visual prominence, allowing users to understand all available choices at once and select their preferred method in a single interaction.

### User Impact
All users creating items will experience a more direct workflow with fewer clicks required to begin content creation. Users can quickly scan all available options and make informed decisions without navigating back and forth between steps. The streamlined interface reduces decision fatigue and accelerates the path to content creation.

### Business Value
Consolidating content options simplifies the user experience and reduces workflow abandonment by eliminating redundant navigation steps. A cleaner, more intuitive interface improves user satisfaction and demonstrates a modern, thoughtful approach to workflow design. Reduced step count directly correlates with higher completion rates.

### Acceptance Criteria
- [ ] A single content selection screen displays all five content options in a grid layout
- [ ] All options are presented with equal visual weight and clear labeling
- [ ] The "Upload File" option displays the subtitle "Video, Image, PDF, Text" beneath the main label
- [ ] Users can select any content option and immediately proceed to the corresponding content creation interface
- [ ] Grid layout adapts responsively for mobile, tablet, and desktop screen sizes
- [ ] Selection state is clearly indicated when a user hovers over or focuses on an option
- [ ] Workflow navigation correctly routes users to the appropriate next step based on selection
- [ ] No redundant selection steps remain in the workflow sequence

---

## REQ-163: Audit Content Input Screens for Duplicate Navigation

**Date**: 2026-01-09 14:30
**Type**: ENHANCEMENT
**Size**: XS

### Summary
Identify and document all content input screens that currently display bottom navigation controls.

### Current Behavior
Content input screens may have bottom navigation that duplicates other navigation mechanisms in the application, but there is no comprehensive inventory of which screens are affected.

### Expected Behavior
A complete documented list of all content input screens showing bottom navigation exists, enabling informed decisions about navigation consolidation.

### User Impact
This audit enables the design team and developers to understand the full scope of navigation duplication across content input workflows, ensuring consistent improvements can be planned and executed.

### Business Value
Provides the foundation for streamlining navigation patterns, which will reduce cognitive load and improve user experience consistency across all content input flows.

### Acceptance Criteria
- [ ] All content input screens with bottom navigation are identified and documented
- [ ] The following screens are confirmed to be included in the audit: TextEditorStep, FileUploadStep, VideoCaptureStep, PhotoCaptureStep, UrlInputStep, and NextActionStep
- [ ] Documentation clearly indicates which navigation elements appear on each screen
- [ ] Findings are available for review by stakeholders planning navigation improvements


---

## REQ-164: Remove Bottom Navigation from Content Screens

**Date**: 2026-01-09 11:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Remove redundant bottom navigation bars from content input screens while preserving inline navigation controls.

### Current Behavior
Content input screens display both inline navigation buttons (Back/Continue) and a bottom navigation bar, creating duplicate navigation elements that clutter the interface and confuse users about which controls to use.

### Expected Behavior
Content input screens show only inline navigation controls without a bottom navigation bar. Users interact with a single, clear set of navigation controls positioned contextually within each screen.

### User Impact
Users creating FAQ content experience a cleaner, less cluttered interface with unambiguous navigation controls. The streamlined design reduces cognitive load and makes the content creation workflow feel more professional and polished.

### Business Value
Improves user experience consistency across the content creation workflow and reduces interface clutter, leading to higher user satisfaction and reduced support inquiries about navigation.

### Acceptance Criteria
- [ ] Text editor screen displays no bottom navigation bar
- [ ] File upload screen displays no bottom navigation bar
- [ ] Video capture screen displays no bottom navigation bar
- [ ] Photo capture screen displays no bottom navigation bar
- [ ] URL input screen displays no bottom navigation bar
- [ ] All affected screens maintain functional inline navigation controls
- [ ] Navigation button placement is visually consistent across all content input screens
- [ ] Users can complete the entire content creation workflow without encountering duplicate navigation elements

---

## REQ-165: Implement Context-Aware Navigation Button Display

**Date**: 2026-01-09 12:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The navigation buttons at the bottom of content screens should display different combinations based on whether the user has viewed the content, and must remain persistently visible without scrolling.

### Current Behavior
Navigation buttons may not be properly contextualized to the user's viewing state, and may become hidden when users scroll through content on various screen sizes.

### Expected Behavior
When a user first arrives at a content screen (before viewing), only a "Back" button is visible. After the user has viewed or scrolled through the content, both "Back" and "Continue" buttons appear. These navigation buttons remain anchored and visible at all times, regardless of scroll position or viewport size.

### User Impact
All users navigating through content screens will benefit from clearer navigation options that adapt to their progress. Mobile users will particularly benefit from buttons that remain accessible without needing to scroll to find them.

### Business Value
Reduces navigation confusion and friction in the user journey, leading to higher completion rates and better user experience across all device types.

### Acceptance Criteria
- [ ] Before viewing content, only "Back" button is displayed
- [ ] After viewing or interacting with content, both "Back" and "Continue" buttons are displayed
- [ ] Navigation buttons remain visible and accessible at all times during scrolling
- [ ] Button visibility and positioning works correctly on mobile viewport sizes (tested at minimum 320px width)
- [ ] Button container does not obscure content or create usability issues


---

## REQ-166: Streamline NextActionStep Navigation with Confirmation Dialog

**Date**: 2026-01-09 15:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
Simplify the NextActionStep screen by removing the bottom navigation bar and standardizing on exactly three action cards with a confirmation dialog for the cancel action.

### Current Behavior
The NextActionStep screen displays both action cards and a bottom navigation bar, creating redundant navigation controls. The cancel action may not adequately warn users about potential data loss.

### Expected Behavior
The NextActionStep screen displays exactly three action cards without any bottom navigation bar: "Review & Submit," "Add More Content," and "Cancel." When users select the Cancel action, a confirmation dialog appears warning them that they will lose unsaved work before proceeding.

### User Impact
Users completing the item creation workflow encounter a cleaner, more focused interface with clear next-step options. Users attempting to cancel are protected from accidental data loss through an explicit confirmation step.

### Business Value
Aligns the NextActionStep screen with the broader UI/UX cleanup initiative to eliminate redundant navigation, while improving user experience by preventing accidental workflow abandonment and data loss.

### Acceptance Criteria
- [ ] Bottom navigation bar is completely removed from the NextActionStep screen
- [ ] Exactly three action cards are visible: Review & Submit, Add More Content, and Cancel
- [ ] Selecting Cancel triggers a confirmation dialog before proceeding
- [ ] The confirmation dialog explicitly warns users about losing unsaved work
- [ ] Selecting "Review & Submit" proceeds to the review step without additional prompts
- [ ] Selecting "Add More Content" returns users to add additional items without additional prompts
- [ ] The layout adapts responsively across mobile, tablet, and desktop viewports


---

## REQ-167: ContentPreview Shared Component for Multi-Format Media Display

**Date**: 2026-01-09 19:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should see consistent, visually informative previews of various content types throughout the application, regardless of whether the content is a video, photo, PDF, text, or URL.

### Current Behavior
The application lacks a unified component for displaying content previews across different media types. Preview implementations are inconsistent or missing, leading to varied user experiences when viewing different content formats.

### Expected Behavior
When viewing any content item, users see a standardized preview that adapts to the content type: videos display a thumbnail with duration badge, photos show an image thumbnail, PDFs display a thumbnail with page count indicator, text content shows a truncated preview with an identifying icon, and URLs show a favicon with the page title and domain. All previews include appropriate loading states while content is being processed.

### User Impact
All users interacting with content items across different screens benefit from a consistent, professional preview experience that helps them quickly identify and understand content without needing to open it. The visual consistency reduces cognitive load and makes the interface feel more polished and unified.

### Business Value
Establishes a reusable component pattern that reduces code duplication, accelerates future development, and ensures brand consistency across the application. Improves overall user experience by providing clear visual feedback about content types.

### Acceptance Criteria
- [ ] Video content displays a thumbnail image with a visible duration badge
- [ ] Photo content displays a thumbnail of the image
- [ ] PDF content displays a thumbnail with a page count indicator
- [ ] Text content displays truncated preview text with a recognizable icon
- [ ] URL content displays the site favicon, page title, and domain name
- [ ] All content types show appropriate loading states while being processed
- [ ] The component handles error states gracefully when previews cannot be generated
- [ ] The component is exported from the shared component barrel for use throughout the application
- [ ] The component adapts responsively to different container sizes
- [ ] The preview appearance is visually consistent with the application's design system


---

## REQ-168: Redesign PreviewSaveStep Layout

**Date**: 2026-01-09 22:35
**Type**: ENHANCEMENT
**Size**: M

### Summary
Users should see a clean, information-rich preview screen displaying item details and content previews before saving, rather than being presented with large action buttons encouraging them to add more content.

### Current Behavior
The PreviewSaveStep screen displays prominent "Add Media" and "Add Link" call-to-action buttons, creating visual clutter and suggesting users should add more content rather than review what they've already created. Item metadata and content previews are not clearly displayed, making it difficult for users to verify their work before saving.

### Expected Behavior
When users reach the preview and save screen, they see an organized layout with two clear sections: an Item Details section showing the auto-generated title (editable), room (read-only), item type (read-only), and purpose (read-only); and a Content section displaying actual previews of all captured content with a content count badge. Instead of large call-to-action buttons, users see a small, unobtrusive "+ Add More" link that allows adding additional content without dominating the screen layout.

### User Impact
Users completing the item creation workflow encounter a focused review experience that helps them verify item details and content before saving. The redesigned layout reduces visual noise, makes important information easier to scan, and shifts emphasis from adding more content to reviewing existing work.

### Business Value
Aligns the preview screen with Phase 5 UI/UX improvements by creating a cleaner, more professional interface that prioritizes information clarity over action prompts. Reduces cognitive load during the final review step and improves the overall quality of submitted items.

### Acceptance Criteria
- [ ] Large "Add Media" and "Add Link" buttons are completely removed from the screen
- [ ] Item Details section displays title (editable field), room (read-only), item type (read-only), and purpose (read-only)
- [ ] The auto-generated title can be edited inline by the user
- [ ] Content section displays actual previews of all content items using appropriate preview components
- [ ] A content count badge displays the total number of content items
- [ ] A small "+ Add More" link is available for adding additional content
- [ ] The "+ Add More" link is visually de-emphasized compared to primary actions
- [ ] The layout adapts responsively across mobile, tablet, and desktop viewports
- [ ] All content previews render correctly for different media types (video, photo, PDF, text, URL)
- [ ] The visual hierarchy prioritizes reviewing existing content over adding new content



---

## REQ-169: Update Content Display with Grid Layout and Reordering

**Date**: 2026-01-09 22:58
**Type**: ENHANCEMENT
**Size**: M

### Summary
Users should be able to view, reorder, and remove individual content pieces in a grid layout with interactive controls, replacing the current static content display.

### Current Behavior
Content items are displayed in a simple list or card format without interactive controls. Users cannot change the order of content pieces after they are added, cannot remove individual pieces without clearing all content, and lack visual feedback about the organization of multiple content items. The display does not differentiate between truly empty states and states with content.

### Expected Behavior
When users view their content collection, each piece is displayed using a consistent preview component arranged in a responsive grid layout. Users can drag content pieces to reorder them using visible drag handles, and each piece includes a remove button for individual deletion. When the content collection is genuinely empty (no items exist), users see an appropriate empty state message. When content exists, the grid displays all pieces with full interaction capabilities.

### User Impact
Users managing multiple content pieces gain precise control over content organization and composition. The ability to reorder content ensures users can present information in their preferred sequence, while individual removal buttons eliminate the frustration of having to delete and re-add content to fix mistakes.

### Business Value
Enhances the Phase 5 UI/UX improvements by providing professional-grade content management capabilities that match user expectations from modern content creation tools. Reduces user frustration and support requests related to content organization, and improves the quality of final output by giving users full control over content presentation.

### Acceptance Criteria
- [ ] Each content piece is rendered using a shared ContentPreview component
- [ ] Content pieces are arranged in a responsive grid layout that adapts to screen size
- [ ] Each content piece displays a visible drag handle for reordering
- [ ] Users can drag and drop content pieces to change their order in the collection
- [ ] Each content piece includes a clearly labeled remove button
- [ ] Clicking the remove button deletes that specific content piece from the collection
- [ ] The empty state message only appears when the content collection contains zero items
- [ ] When content exists, the grid displays all pieces without showing the empty state
- [ ] Reordering and removal operations update the content collection state immediately
- [ ] The grid layout maintains visual consistency across different content types (video, photo, PDF, text, URL)



---

## REQ-170: Pre-populate Fields in Review Screen

**Date**: 2026-01-09 22:59
**Type**: ENHANCEMENT
**Size**: S

### Summary
Users should see their item's title, room, item type, and purpose automatically displayed in the review screen with the ability to edit the title inline or through a modal.

### Current Behavior
When users reach the review screen during item creation, fields are empty or not displayed, requiring users to manually reference or remember the metadata they entered in previous steps. The auto-generated title from the item creation logic is not visible, and room, item type, and purpose information is not carried forward for review.

### Expected Behavior
When users arrive at the review screen, they immediately see the item title auto-filled using the generateItemTitle() function, with the room displayed from the current item's room selection, the item type shown from the current item's itemType selection, and the purpose displayed from the current item's purpose selection. Users can click the title to edit it either inline or through a modal dialog, while room, item type, and purpose remain read-only as reference information.

### User Impact
Users completing the item creation workflow experience a smoother, more efficient review process. They can verify that metadata was captured correctly without navigating back through previous steps, and they can make final title adjustments without disrupting their workflow.

### Business Value
Completes the Phase 5 redesign of the review screen by ensuring all relevant metadata is visible and editable where appropriate. Reduces user friction during the final review step and improves data quality by making it easier for users to verify and refine item information before saving.

### Acceptance Criteria
- [ ] The title field is automatically populated using the generateItemTitle() function when the review screen loads
- [ ] The room field displays the value from currentItem.room as read-only text
- [ ] The item type field displays the value from currentItem.itemType as read-only text
- [ ] The purpose field displays the value from currentItem.purpose as read-only text
- [ ] Users can click or tap the title to edit it
- [ ] Title editing works either inline (directly in the field) or through a modal dialog
- [ ] Changes to the title are persisted to the item's metadata
- [ ] All pre-populated fields are visible and readable on mobile and desktop viewports
- [ ] The title editing interface provides clear visual feedback when entering edit mode


---

## REQ-171: Update Test Coverage for Review Screen Redesign

**Date**: 2026-01-09 10:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
Ensure comprehensive test coverage validates the redesigned review screen behavior, including content preview rendering, field pre-population, title editing, and empty state handling.

### Current Behavior
Test coverage may not adequately verify all aspects of the redesigned review screen, including the new content preview feature, pre-populated field display, title editing capability, and empty state scenarios.

### Expected Behavior
The test suite validates that:
- Content previews render correctly for all supported content types
- Pre-populated fields display accurate information from the source content
- Users can successfully edit titles before finalizing
- The screen handles empty or missing content gracefully

### User Impact
Users and stakeholders benefit from increased confidence that the redesigned review screen functions correctly across all scenarios, reducing the likelihood of defects in production.

### Business Value
Comprehensive test coverage reduces regression risk and enables faster, safer iteration on the review screen feature, ultimately improving product quality and user satisfaction.

### Acceptance Criteria
- [ ] Tests verify content preview renders correctly for each supported content type
- [ ] Tests confirm pre-populated fields display accurate source information
- [ ] Tests validate title editing functionality works as expected
- [ ] Tests ensure empty state scenarios are handled gracefully without errors
- [ ] All new tests pass consistently in the test suite

---

## REQ-172: Comprehensive End-to-End Item Creation Workflow Testing

**Date**: 2026-01-09 20:28
**Type**: ENHANCEMENT
**Size**: M

### Summary
Perform comprehensive end-to-end testing of the complete item creation workflow to validate all user interactions, data flows, state transitions, and integration points function correctly from start to finish.

### Current Behavior
While individual components and steps may be tested in isolation, there is no comprehensive end-to-end validation ensuring the entire workflow operates smoothly when users navigate through all steps sequentially, handling various user decisions and edge cases.

### Expected Behavior
The complete item creation flow functions correctly when users:
- Navigate through all steps in sequence: room selection, item type selection, purpose selection, content type selection, content creation, review, and save
- See auto-generated titles displayed accurately based on their selections
- View all pre-filled fields populated correctly in the review screen
- Choose to add additional content to the same item
- Cancel the workflow at any point and receive proper confirmation
- Experience consistent behavior across different content types and purposes

### User Impact
Users creating items benefit from a reliable, predictable workflow that handles all scenarios gracefully. Testing ensures users can trust the system to preserve their input, generate appropriate titles, and complete operations without unexpected errors or data loss.

### Business Value
Comprehensive end-to-end testing reduces production defects, improves user confidence in the system, and validates that all UI/UX improvements integrate correctly to deliver the intended seamless experience.

### Acceptance Criteria
- [ ] Complete workflow tested from room selection through final save operation
- [ ] Auto-generated title generation verified for multiple purpose and item type combinations
- [ ] Pre-filled field display confirmed accurate for all content types
- [ ] "Add More Content" flow tested to ensure additional content associates correctly with the item
- [ ] Cancel confirmation dialog tested at multiple workflow stages
- [ ] Navigation between steps validated for forward and backward movement
- [ ] Error handling verified when invalid data is submitted at any step
- [ ] Session persistence tested to ensure workflow state survives page refresh
- [ ] Mobile and desktop experiences tested for consistent behavior


---

## REQ-173: Mobile Responsiveness and Touch Interaction Support

**Date**: 2026-01-09 20:48
**Type**: ENHANCEMENT
**Size**: M

### Summary
Ensure the application provides an optimal mobile experience with proper responsive layouts, appropriately sized touch targets, and fully functional touch interactions including drag-to-reorder capabilities.

### Current Behavior
The application may not be fully optimized for mobile devices, potentially presenting users with interface elements that are difficult to interact with on touchscreens, layouts that don't adapt to small viewports, or touch gestures that don't function as expected.

### Expected Behavior
When users access the application on mobile devices:
- All interface elements display properly on viewports as small as 320px width
- Interactive elements present touch targets that meet or exceed 48px minimum size for comfortable tapping
- Drag-to-reorder functionality works smoothly with touch gestures
- Content previews scale appropriately to remain legible and functional on small screens
- Navigation elements remain accessible without requiring zooming or horizontal scrolling
- Text input fields display mobile-friendly keyboards when focused

### User Impact
Mobile users experience a first-class interface designed specifically for their device constraints. They can comfortably tap buttons, rearrange items through intuitive touch gestures, and read content without frustration, matching the quality of the desktop experience.

### Business Value
Mobile-optimized experiences expand the application's usability to users on-the-go, increase engagement across all device types, and demonstrate professional interface design standards that build user trust and satisfaction.

### Acceptance Criteria
- [ ] All screens display correctly and remain functional at 320px viewport width
- [ ] Interactive elements (buttons, links, form inputs) meet minimum 48px touch target size
- [ ] Drag-to-reorder functionality responds accurately to touch gestures without conflicts with scrolling
- [ ] Content previews scale proportionally and remain readable on small screens
- [ ] No horizontal scrolling required for primary content at mobile viewport sizes
- [ ] Touch interactions feel responsive with appropriate visual feedback
- [ ] Forms display appropriate mobile keyboard types (numeric, email, etc.) based on input type

---

## REQ-174: Accessibility Compliance Verification for Upload Flow

**Date**: 2026-01-09 14:32
**Type**: ENHANCEMENT
**Size**: M

### Summary
All components and interactions within the upload flow must meet accessibility standards to ensure equal access for users with disabilities.

### Current Behavior
Accessibility features may be incomplete or inconsistent across newly developed components, potentially creating barriers for users who rely on assistive technologies, keyboard navigation, or screen readers.

### Expected Behavior
The entire upload flow provides a fully accessible experience where:
- All interactive elements are reachable and operable via keyboard alone
- Screen readers announce meaningful context at each step
- Visual focus indicators are clear and follow logical tab order
- ARIA labels provide appropriate semantic information for all components

### User Impact
Users who rely on assistive technologies (screen readers, keyboard-only navigation, voice control) will have equal access to the upload functionality. This affects users with visual impairments, motor disabilities, and those who prefer or require keyboard navigation.

### Business Value
Ensures legal compliance with accessibility standards (WCAG 2.1 AA) and expands the user base by removing barriers for disabled users, while improving overall usability for all users.

### Acceptance Criteria
- [ ] All interactive components have appropriate ARIA labels that describe their purpose
- [ ] Complete upload workflow can be navigated using only keyboard (Tab, Enter, Space, Arrow keys)
- [ ] Screen reader testing confirms meaningful announcements at step transitions and state changes
- [ ] Focus management correctly moves to relevant elements when transitioning between steps
- [ ] All form inputs, buttons, and custom controls are keyboard accessible
- [ ] Focus visible indicators meet contrast requirements and are never hidden


---

## REQ-175: Synchronize Documentation with Implementation Changes

**Date**: 2026-01-09 16:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
All code documentation, inline comments, and external documentation files must be updated to accurately reflect the changes made during the UI/UX workflow improvements implementation.

### Current Behavior
Documentation may contain outdated workflow descriptions, missing JSDoc comments on modified components, stale inline comments describing previous behavior, and README files that don't reflect current functionality or component structure.

### Expected Behavior
Documentation is comprehensive and current across all modified areas:
- Workflow step comments accurately describe the current user journey
- Component-level JSDoc includes complete parameter descriptions and usage examples
- Modified files include timestamp annotations indicating last modification date
- README files (if present) reflect current architecture, component structure, and usage patterns

### User Impact
Developers maintaining or extending the application can quickly understand component behavior and workflow logic without archaeology through git history or experimentation. New team members can onboard faster with accurate, comprehensive documentation.

### Business Value
Reduces maintenance costs by preventing misunderstandings about system behavior, accelerates feature development by providing clear component contracts, and improves code quality through better developer understanding of existing implementations.

### Acceptance Criteria
- [ ] All WORKFLOW_STEPS constant comments match the current step sequence and behavior
- [ ] JSDoc comments exist for all modified components with complete parameter and return type documentation
- [ ] Modified files include @lastModified annotations with date in YYYY-MM-DD format
- [ ] README files (if present) are updated to reflect current component architecture and workflow
- [ ] No documentation references deprecated features or removed functionality
- [ ] Code examples in documentation execute successfully against current implementation


---

## REQ-176: Add Missing Media Capture Step to Item Creation Workflow

**Date**: 2026-01-10 12:05
**Type**: BUG FIX
**Size**: M
**Depends On**: None
**Blocks**: REQ-177

### Summary
The item creation workflow is missing the media capture step. After selecting a content type, the workflow should present the appropriate capture interface before showing Item Details.

### Current Behavior
After selecting a content type (Record Video, Take Photo, Write Text, Upload File, Add Link) at Step 5, the workflow immediately jumps to the "Item Details" form. The user never gets to actually capture or upload their media.

### Expected Behavior
After content type selection:
1. **Record Video** → Opens camera interface with record/stop controls, preview, and confirm button
2. **Take Photo** → Opens camera interface with capture button, preview, and confirm button
3. **Upload File** → Opens file picker, shows preview of selected file, confirm button
4. **Write Text** → Shows text editor with save/confirm action
5. **Add Link** → Shows URL input field with validation and confirm button

Only after the user captures/provides media AND confirms it should the workflow proceed to Item Details.

### User Impact
The workflow is fundamentally broken - users cannot actually add the content they intended. They select "Record Video" but never see a camera. This makes the entire item creation feature non-functional for media content.

### Business Value
This fix makes the item creation feature actually work as designed. Without this, users cannot create items with video, photo, or file content.

### Acceptance Criteria
- [ ] After content type selection, system displays the appropriate capture interface
- [ ] Video recording option opens camera interface with record/stop controls and confirmation step
- [ ] Photo capture option opens camera interface with capture button and confirmation step
- [ ] File upload option opens file picker with preview and confirmation step
- [ ] Text writing option shows text editor with save/confirm action
- [ ] Link addition option shows URL input with validation and confirmation step
- [ ] Item Details form only appears after media capture is confirmed
- [ ] User can go back from capture step to change content type selection
- [ ] Workflow can be tested end-to-end for all five content type paths

### Technical Notes
- Component: `/src/components/ItemCreationWorkflow/`
- Route: `/dashboard2/create`
- The workflow step progression logic needs to be updated to include the capture step

---

## REQ-177: Intelligent Pre-filling of Item Details Based on Workflow Choices

**Date**: 2026-01-10 12:15
**Type**: ENHANCEMENT
**Size**: M
**Depends On**: REQ-176

### Summary
When the Item Details form is displayed (after media capture), fields should be intelligently pre-filled based on choices the user made in earlier workflow steps, minimizing or eliminating the need for manual data entry.

### Current Behavior
When the Item Details form appears, all fields are blank. Users must manually type the item name, select the article purpose, and choose tags - even though the system already knows the item type, category, and purpose from earlier steps in the workflow.

### Expected Behavior
Item Details form fields are pre-populated:
1. **Item Name** - Generated from item type + category (e.g., "Kitchen Appliance" or "Living Room Furniture")
2. **Article Purpose** - Pre-selected based on the purpose chosen in earlier workflow step
3. **Tags** - Automatically selected based on logical mapping:
   - Item type → relevant type tag
   - Category → relevant category tag
   - Purpose → relevant purpose tag (e.g., "how-to", "safety", "maintenance")

In simple/basic cases, the user should be able to just review the pre-filled values and confirm without typing anything.

### User Impact
Reduces friction and repetitive data entry. Users don't have to re-type information they already provided implicitly through their workflow choices. Faster item creation, fewer errors, better UX.

### Business Value
Demonstrates system intelligence. Reduces time-to-completion for item creation. Improves user satisfaction and completion rates.

### Acceptance Criteria
- [ ] Item Name field is pre-populated based on item type and category from earlier steps
- [ ] Article Purpose field is pre-populated based on purpose selection from earlier steps
- [ ] Tags are automatically selected based on logical mapping of item type, category, and purpose
- [ ] Pre-filled values are clearly visible but editable by the user
- [ ] User can clear or modify any pre-filled value before submission
- [ ] Pre-filling logic handles edge cases (missing data gracefully defaults to empty)
- [ ] Simple workflow path (e.g., Kitchen > Appliance > How-to-use > Photo) requires zero typing

### Technical Notes
- Requires mapping logic: workflow state → field defaults
- Component: `/src/components/ItemCreationWorkflow/`
- Depends on REQ-176 being complete (media capture step must exist first)

---

## REQ-178: Update Navigation Menu Icons to Match New Layout

**Date**: 2026-01-11 12:30
**Type**: ENHANCEMENT
**Size**: XS

### Summary
Navigation menu should display a grid icon for the Dashboard item and a document icon for the Instructions item to better reflect their purpose and improve visual consistency.

### Current Behavior
The Dashboard menu item uses a house icon (Home icon from Lucide), which visually suggests a homepage rather than a dashboard view. The Instructions menu item lacks an appropriate icon to indicate documentation or help content.

### Expected Behavior
Navigation menu displays:
1. A grid icon (LayoutDashboard from Lucide) for the Dashboard menu item, visually conveying the dashboard's multi-panel layout
2. A document icon (FileText from Lucide) for the Instructions menu item, clearly indicating textual help content

### User Impact
Users can more quickly recognize menu items by their intuitive icons. The visual language of the navigation becomes clearer and more aligned with common UI patterns (grids for dashboards, documents for instructions).

### Business Value
Improves usability through better visual affordances. Reduces cognitive load by using standard iconography conventions.

### Acceptance Criteria
- [ ] Dashboard menu item displays LayoutDashboard icon instead of Home icon
- [ ] Instructions menu item displays FileText icon
- [ ] Icon imports are updated in all navigation-related components
- [ ] Icons render correctly at all supported screen sizes
- [ ] No visual regressions in navigation menu layout or spacing


---

## REQ-179: Update MetadataStep Field Labels for Item vs Article Clarity

**Date**: 2026-01-11 00:00
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The MetadataStep component should display field labels that properly distinguish between "Item Name" and "Article Title" to reflect the correct terminology throughout the UI.

### Current Behavior
Field labels in the MetadataStep component do not clearly differentiate between item-level metadata (Item Name) and article-level metadata (Article Title), potentially causing confusion about which entity is being edited.

### Expected Behavior
The MetadataStep component displays clear, distinct labels:
- "Item Name" when referring to the physical item or object being cataloged
- "Article Title" when referring to the content or article associated with the item

Users immediately understand which field corresponds to which entity based on the label text.

### User Impact
All users creating or editing items through the workflow experience clearer guidance and reduced confusion about field purposes, leading to more accurate data entry and fewer errors.

### Business Value
Improved label clarity reduces user confusion, decreases data entry errors, and creates consistency with the underlying data model terminology.

### Acceptance Criteria
- [ ] MetadataStep component displays "Item Name" label for item-level name field
- [ ] MetadataStep component displays "Article Title" label for article-level title field
- [ ] Field labels are visually consistent with other form labels in the application
- [ ] Labels are properly internationalized if i18n is in use
- [ ] No other UI components are affected by this change



---

## REQ-180: Update MetadataStep Item Name Field Label and Helper Text

**Date**: 2026-01-11 15:30
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The Item Name field in MetadataStep should display "Item Name" as its label instead of "Title", with updated placeholder text and helper text that clarifies this field refers to the physical object receiving the QR code.

### Current Behavior
The field label reads "Title" which does not clearly convey that this input captures the name of a physical object. The placeholder and helper text do not reinforce the distinction between items (physical objects) and articles (instructional content).

### Expected Behavior
The field displays:
1. Label: "Item Name" with required indicator asterisk
2. Placeholder: "Enter item name..." with examples like "Steamer" or "Coffee Maker"
3. Helper text: "The physical item this QR code will be attached to"

This clearly distinguishes the item (physical object) from articles (content describing how to use it).

### User Impact
All users creating items through the workflow immediately understand they are naming a physical object rather than creating a content title. This reduces confusion between item-level and article-level metadata.

### Business Value
Aligns the UI terminology with the underlying data model structure, preventing downstream confusion and data entry errors. Critical for the REQ-2 data model fix to separate items from articles.

### Acceptance Criteria
- [ ] Label text changes from "Title" to "Item Name" with red asterisk
- [ ] Placeholder updates to "Enter item name..." with relevant examples
- [ ] Helper text "The physical item this QR code will be attached to" appears below the field
- [ ] Helper text is visually consistent with other helper text in the application
- [ ] Field validation and required behavior remain unchanged
- [ ] No visual regressions in form layout or spacing




---

## REQ-181: Enhance MetadataStep Placeholder and Error Messaging for Physical Item Clarity

**Date**: 2026-01-11 16:00
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The Item Name field in MetadataStep should have enhanced placeholder text emphasizing physical item names only, helper text explaining the distinction between items and articles, and error messages that reference "Item name" instead of "Title".

### Current Behavior
The placeholder text and error messaging do not clearly emphasize that this field is specifically for physical object names. There is no inline guidance explaining that instructional content (like "How to Clean") is captured separately as articles. Error messages may reference generic terms like "Title" that don't reinforce the item/article distinction.

### Expected Behavior
The Item Name field displays:
1. Placeholder text that emphasizes physical item names only (e.g., "e.g., Steamer, Coffee Maker, Hair Dryer")
2. Helper text that reads: "This is the name of the physical item (e.g., 'Steamer'). Instructions like 'How to Clean' are captured separately as articles."
3. Error messages that reference "Item name" when validation fails (e.g., "Item name is required" instead of "Title is required")

### User Impact
All users creating items receive immediate, inline guidance that prevents confusion between item metadata (physical object name) and article metadata (instructional content titles). This reduces incorrect data entry and support requests.

### Business Value
Provides proactive user education at the point of data entry, reducing errors and improving data quality. Essential for successful adoption of the item/article separation introduced in the data model restructure.

### Acceptance Criteria
- [ ] Placeholder text explicitly shows examples of physical item names only
- [ ] Helper text appears below the field explaining the item vs article distinction
- [ ] Helper text mentions that instructions like "How to Clean" are captured as articles
- [ ] Error messages use "Item name" terminology consistently
- [ ] All text changes are visually consistent with existing UI patterns
- [ ] No validation logic changes are introduced

---

## REQ-182: Update ReviewStep Labels to Distinguish Item Name from Article Purpose

**Date**: 2026-01-12 (Created via formal requirement process)
**Type**: ENHANCEMENT
**Size**: S

### Summary
The review step should display "Item Name" instead of "Title" and include a separate section for article purpose information when the workflow captures article-based content.

### Current Behavior
The review screen shows a generic "Title" label that does not distinguish between the physical item being tagged and the article or instructional content associated with it. Users cannot differentiate between what they are naming the physical object versus what purpose the article serves. The QR code preview may show ambiguous information that does not clearly indicate it represents the physical item.

### Expected Behavior
The review screen displays clear, distinct labels that separate physical item identification from article purpose. The "Item Name" label appears for the physical object being tagged. When article content is captured, a separate "Purpose/Article" section shows what kind of instructional or informational content is attached. The QR code preview displays only the item name to reinforce that the code identifies the physical object, not the article.

### User Impact
Users creating items with attached articles will understand exactly what information describes the physical object versus the instructional content. Property managers reviewing items before saving will see clear separation between item identification and article categorization. Users scanning QR codes will see consistent item naming that matches the physical tag placement.

### Business Value
Reduces user confusion during the review phase by providing clear semantic labels that match the mental model of tagging physical items with instructional content. Ensures QR codes accurately represent what they identify.

### Acceptance Criteria
- [ ] Label changes from "Title" to "Item Name" in the review display
- [ ] Article purpose information appears in a dedicated section labeled "Purpose/Article" when workflow captures article content
- [ ] QR code preview component shows only the item name without mixing in article information
- [ ] Visual hierarchy clearly separates item identification from article metadata
- [ ] Review screen layout accommodates both item name and article purpose without appearing cluttered


---

## REQ-183: Add Content Purpose Dropdown to Item Capture Flow (Future Enhancement)

**Date**: 2026-01-12 15:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The item capture flow should include an optional "Content Purpose" dropdown field that allows users to classify the type of instructional content being created during initial capture, enabling faster content classification without requiring post-capture editing.

### Current Behavior
The Item Name field captures only the physical item name. The purpose of associated articles (e.g., troubleshooting guide, how-to instructions, FAQ, safety information) must be set during the content editing and organization phase after initial item capture is complete. There is no mechanism during the capture workflow to indicate what type of instructional content will be associated with the physical item.

### Expected Behavior
During the item capture workflow, users see an optional "Content Purpose" dropdown field that allows them to pre-classify the article type. The dropdown includes common content purposes such as troubleshooting, how-to, FAQ, maintenance guide, safety instructions, and warranty information. This selection is stored with the item metadata and pre-populates article classification fields during the content editing phase. Users can skip this field if they are unsure or prefer to classify content later.

### User Impact
Property managers and content creators who know the intended purpose of their instructional content at capture time can classify it immediately, reducing the need for post-capture organization work. Users who prefer to classify content during editing can continue to skip this field and organize later without workflow disruption.

### Business Value
Streamlines the content creation workflow for users who have clear intent about article purpose at capture time. Improves content organization efficiency by reducing the need to revisit items purely for classification purposes. Supports better analytics and reporting on content types being created across the platform.

### Acceptance Criteria
- [ ] Content Purpose dropdown appears in the item capture flow after the Item Name field
- [ ] Dropdown is clearly marked as optional and does not block workflow progression
- [ ] Dropdown includes standard purpose options: Troubleshooting, How-To, FAQ, Maintenance, Safety, Warranty
- [ ] Selected purpose value is stored with item metadata
- [ ] Selected purpose pre-populates article classification during content editing phase
- [ ] Users can skip the field entirely without validation errors
- [ ] Field placement does not disrupt existing workflow layout or user experience

---

## REQ-184: Simplify QR Code Label Display to Show Item Name Only

**Date**: 2026-01-12 (Phase 0, Task 0.4)
**Type**: ENHANCEMENT
**Size**: S

### Summary
QR code labels should display only the Item Name instead of combining Purpose with Item Name to improve clarity and simplicity.

### Current Behavior
QR code labels currently display in the format "Purpose - Item Name" when generated and exported to PDF, combining two pieces of information into a single label.

### Expected Behavior
QR code labels should display only the Item Name, both in the preview interface and in PDF exports. The Purpose field information should not be included in the QR code label display.

### User Impact
Users capturing items will see cleaner, simpler QR code labels that focus on the essential identifier (Item Name) without additional context that may cause visual clutter or confusion.

### Business Value
Simplifying the QR code label display aligns with the broader data model clarification effort (Phase 0) and ensures consistency across the application where Item Name is the primary identifier for captured items.

### Acceptance Criteria
- [ ] QR code preview displays only the Item Name as the label
- [ ] PDF exports show QR codes with Item Name only (not "Purpose - Item Name")
- [ ] All QR code generation logic uses Item Name consistently
- [ ] Existing QR codes continue to function with the updated label format


---

## REQ-185: Fix Workflow Step Count Display Inconsistency

**Date**: 2026-01-12 22:30
**Type**: BUG FIX
**Size**: S

### Summary
The workflow progress display shows an incorrect step count that does not match the actual number of stages users navigate through during item creation.

### Current Behavior
The system displays a step counter showing "8 of 10" or similar count that does not align with the four logical stages represented in the ProgressIndicator component. The ProgressIndicator correctly maps multiple wizard steps to four display stages, but another component or counter is displaying an inconsistent total step count.

### Expected Behavior
The workflow progress display consistently shows the correct number of stages throughout the item creation process. All step counters and progress indicators align with the actual four-stage workflow structure. Users see accurate progress information that matches their position in the workflow.

### User Impact
Users completing the item creation workflow see confusing or inaccurate progress information that misrepresents how far they have progressed through the process. This creates uncertainty about workflow length and completion status.

### Business Value
Accurate progress indicators improve user confidence and reduce workflow abandonment by providing clear, truthful feedback about task completion status.

### Acceptance Criteria
- [ ] All workflow step counters display the correct total number of stages
- [ ] Step count display remains consistent across all workflow screens
- [ ] Progress indicators accurately reflect user position within the four-stage structure
- [ ] No components display step counts that exceed or contradict the actual workflow structure



---

## REQ-186: Ensure Save Is the Final Workflow Step

**Date**: 2026-01-12 22:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
The item creation workflow should end immediately after the save action, with no additional mandatory steps appearing in the step progression flow.

### Current Behavior
After users save their item, the workflow may include additional steps in the step counter or progression sequence. The "What's Next" screen appears as part of the numbered step flow, creating the impression that the workflow is incomplete even after the save operation has finished.

### Expected Behavior
When users complete the save action, the workflow ends immediately. The step counter stops at the save step with no additional steps indicated. The "What's Next" screen appears as a post-workflow menu or success state, clearly separate from the step progression and not counted as part of the workflow stages. Users understand that saving represents full completion of the capture process.

### User Impact
Users completing item creation receive clear confirmation that they have finished all required steps when they save. There is no confusion about whether additional actions are required to complete the workflow. Users can confidently proceed to post-workflow options without feeling obligated to continue through more stages.

### Business Value
Clarifying workflow completion reduces user confusion and abandonment during the critical save operation. Clear completion signals improve user confidence and support higher workflow completion rates. Separating post-workflow options from the main flow allows for better extensibility without artificially inflating perceived workflow complexity.

### Acceptance Criteria
- [ ] Step counter shows save as the final step in the numbered progression
- [ ] No additional steps appear after save in the workflow step count
- [ ] "What's Next" screen appears outside the step progression flow
- [ ] "What's Next" screen does not increment the step counter
- [ ] Save action provides clear completion feedback indicating workflow end
- [ ] Post-workflow menu options are visually distinct from workflow steps




---

## REQ-187: Update Mobile View Step Count to Match Desktop Workflow

**Date**: 2026-01-12 23:12
**Type**: BUG FIX
**Size**: XS

### Summary
The step counter in the mobile view of the item creation workflow should display the correct total number of stages, matching the four-stage structure shown on desktop.

### Current Behavior
The mobile view displays an incorrect total stage count in the workflow progress indicator. The `totalStages` variable may show a number different from 4, creating inconsistency between mobile and desktop experiences and misrepresenting the actual workflow length.

### Expected Behavior
The mobile view displays "X of 4" throughout the workflow, accurately reflecting the four distinct stages in the item creation process. The stage count matches the desktop experience and aligns with the ProgressIndicator component's stage mapping logic.

### User Impact
Mobile users see accurate progress information that matches their actual position in the four-stage workflow. Users switching between devices encounter consistent progress displays. Mobile users have the same clear understanding of workflow length and completion status as desktop users.

### Business Value
Consistent progress indicators across devices reduce user confusion and build trust in the application. Accurate mobile progress displays prevent workflow abandonment caused by unclear or misleading completion status.

### Acceptance Criteria
- [ ] Mobile view displays correct total stage count of 4
- [ ] Step counter on mobile matches desktop step counter behavior
- [ ] Mobile progress display updates correctly as users move through workflow stages
- [ ] No discrepancy exists between mobile and desktop total stage counts




---

## REQ-188: Add WhatsNextStep to Wizard Step Type Definitions

**Date**: 2026-01-12 00:10
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The wizard type system should recognize 'whats-next' as a valid step type while ensuring this step is excluded from progress counting logic.

### Current Behavior
The WizardStep union type does not include a 'whats-next' value. When the What's Next screen is rendered, the type system does not recognize it as a valid wizard step, potentially causing type errors or requiring workarounds. The absence of this step type in the type definitions creates inconsistency between the implementation and the type system.

### Expected Behavior
The WizardStep union type includes 'whats-next' as a recognized step value. Components can reference this step type without type errors. The progress counter logic explicitly excludes 'whats-next' from step counting calculations, ensuring it appears outside the numbered workflow progression. Type definitions clearly document that this step does not contribute to workflow progress.

### User Impact
Users experience a seamless transition to the What's Next screen without encountering system errors. The progress indicator correctly excludes this post-workflow screen from the step count, providing clear confirmation that the workflow is complete. Users see consistent behavior between the workflow's final save step and the subsequent options menu.

### Business Value
Proper type system support prevents runtime errors and improves code maintainability. Excluding the What's Next screen from progress counting provides clearer workflow completion signals, reducing user confusion and potential abandonment. Clean separation of workflow steps from post-workflow screens enables future expansion of completion options without impacting perceived workflow complexity.

### Acceptance Criteria
- [ ] WizardStep union type includes 'whats-next' as a valid value
- [ ] Progress counter logic explicitly excludes 'whats-next' from step counting
- [ ] TypeScript compilation succeeds with no type errors related to 'whats-next' step
- [ ] Documentation or code comments indicate 'whats-next' is not counted in progress
- [ ] Existing workflow step counting behavior remains unchanged for all other steps




---

## REQ-189: Integrate WhatsNextStep Component into ItemCapture Wizard Flow

**Date**: 2026-01-12 10:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The item creation workflow should display a "What's Next" options screen immediately after successful item save, providing users with clear post-completion actions without counting this screen as part of the workflow progression.

### Current Behavior
After users save an item, the workflow may end abruptly without clear guidance on available next actions, or may display a generic completion message. Users are left uncertain about how to proceed with printing QR codes, creating additional items, or managing their saved content. The transition from workflow completion to next steps lacks structure and actionable options.

### Expected Behavior
Immediately following successful item save, users see a dedicated "What's Next" screen presenting clear action options. This screen displays outside the numbered workflow progression, appearing as a post-workflow menu rather than an additional required step. Users can choose to print QR codes for the newly created item, create another item, view their item list, or return to the dashboard. The transition feels purposeful and provides immediate value through actionable next steps.

### User Impact
Users completing item creation receive immediate, actionable guidance on productive next steps. The post-completion experience feels polished and purposeful rather than abrupt. Users can efficiently continue their workflow by printing QR codes or creating additional items without navigating through multiple screens. First-time users discover key features like QR code printing immediately after their first successful item creation.

### Business Value
Structured post-completion options increase user engagement by surfacing high-value actions at the optimal moment. Immediate QR code printing prompts drive adoption of the core product feature. Seamless "create another item" option encourages batch operations and increases overall item creation volume. Clear next steps reduce user drop-off after completion and improve perceived application polish.

### Acceptance Criteria
- [ ] WhatsNextStep component renders immediately after successful item save
- [ ] Screen displays outside the numbered workflow progression (not counted in steps)
- [ ] Users can select "Print QR Codes" to initiate printing for the newly created item
- [ ] Users can select "Create Another Item" to restart the workflow with cleared state
- [ ] Users can select "View Items" to navigate to the item management screen
- [ ] Users can select "Go to Dashboard" to return to the main dashboard
- [ ] Workflow state transitions cleanly to the WhatsNextStep without progress counter incrementing
- [ ] Component integrates with existing ItemCapture wizard navigation system
- [ ] Mobile and desktop views display the options screen with appropriate responsive layout

---

## REQ-190: Remove Navigation Controls from WhatsNextStep Completion Screen

**Date**: 2026-01-12 14:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
The "What's Next" screen should not display any navigation controls, progress indicators, or workflow step counters, presenting only the four action options as a clean post-completion menu.

### Current Behavior
The "What's Next" screen appears as part of the numbered workflow progression, displaying navigation controls such as back buttons, cancel buttons, and step counter indicators. This creates confusion as users cannot undo a completed save operation, have nothing to cancel, and the screen should not be counted as a workflow step. The presence of these controls suggests the workflow is still in progress when it has actually completed.

### Expected Behavior
The "What's Next" screen displays as a standalone completion menu without any workflow navigation controls. Users see only the four action options (Print QR Codes, Create Another Item, View Items, Go to Dashboard) without back buttons, cancel buttons, or numbered progress indicators. The screen clearly communicates that the item creation workflow has completed and the user is now choosing their next action.

### User Impact
Users completing item creation receive a clear visual signal that the workflow has finished successfully. The absence of navigation controls eliminates confusion about whether additional steps remain or if changes can be undone. The clean presentation focuses attention entirely on the available next actions, creating a decisive transition point between workflow completion and subsequent activities.

### Business Value
Removing navigation controls from the completion screen reduces user confusion and reinforces the successful completion of item creation. The simplified interface increases the likelihood users will engage with one of the four next action options rather than attempting to navigate backward or cancel. Clear workflow boundaries improve perceived application quality and reduce support requests about post-completion navigation.

### Acceptance Criteria
- [ ] WhatsNextStep does not display a back button
- [ ] WhatsNextStep does not display a cancel button  
- [ ] WhatsNextStep is not included in the numbered progress indicator display
- [ ] Progress indicator component hides itself or shows no active step when WhatsNextStep is active
- [ ] Only the four action option buttons are visible on the WhatsNextStep screen
- [ ] Screen maintains consistent layout and spacing without navigation controls
- [ ] Mobile and desktop views both exclude navigation controls appropriately

---


## REQ-191: Wire Up Dashboard Card Navigation Links

**Date**: 2026-01-12 15:23
**Type**: ENHANCEMENT
**Size**: S

### Summary
Dashboard cards should navigate users to their corresponding destinations when clicked, creating an interactive entry point for all major application features.

### Current Behavior
Dashboard cards display static information about properties, items, and system features but do not respond to user clicks. Users must navigate through separate menu options or buttons to access the features represented by these cards. The cards serve only as informational displays rather than actionable navigation elements.

### Expected Behavior
Users can click on any dashboard card to navigate directly to the relevant section of the application. Property cards navigate to property-specific views, item statistics cards navigate to item management filtered by the corresponding category, and feature cards navigate to their respective functional areas. The cards provide visual feedback on hover and click states, making their interactive nature immediately apparent.

### User Impact
Users gain rapid access to application features directly from the dashboard overview. A single click on a property card takes them to that property's detail or management view. Clicking item statistics navigates to pre-filtered item lists, reducing the number of steps needed to find relevant content. The dashboard transforms from a passive display into an active navigation hub, improving workflow efficiency.

### Business Value
Interactive dashboard cards reduce navigation friction and accelerate user task completion. Direct card-to-feature navigation improves feature discoverability by providing contextual entry points from summary statistics. Enhanced dashboard interactivity increases user engagement with secondary features that might otherwise remain hidden in menu structures. The improved user experience supports higher retention and more frequent application usage.

### Acceptance Criteria
- [ ] All dashboard cards respond to click interactions with appropriate navigation
- [ ] Property cards navigate to property-specific detail or management views
- [ ] Item statistics cards navigate to item management with appropriate category filters applied
- [ ] Feature action cards navigate to their corresponding functional sections
- [ ] Cards display hover states indicating clickability (cursor change, visual highlight)
- [ ] Click interactions work consistently across desktop and mobile devices
- [ ] Navigation preserves application state and allows users to return to the dashboard
- [ ] Card click targets are appropriately sized for touch interactions on mobile devices
- [ ] Screen readers announce cards as interactive navigation elements

---

## REQ-192: Add Navigation Links to UserDashboard Statistics Cards

**Date**: 2026-01-12 15:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
Statistics cards in the UserDashboard should include navigation links to their corresponding sections, allowing users to navigate directly from dashboard metrics to detailed views.

### Current Behavior
The UserDashboard displays statistics cards showing property counts, item counts, and other metrics. These cards are purely informational and do not provide any navigation functionality. Users must use separate navigation menus to access the detailed views of properties, items, or other features represented by the statistics.

### Expected Behavior
Each statistics card becomes a clickable navigation element that directs users to the relevant section of the application. When a user clicks on the Properties card, they navigate to the properties listing page. Clicking the Items card takes them to the items management view. Each card shows appropriate visual feedback on hover to indicate it is interactive.

### User Impact
Users can navigate directly from the dashboard overview to detailed views with a single click on any statistics card. This reduces the number of steps needed to access specific sections and creates a more intuitive browsing experience. Dashboard metrics become actionable entry points rather than passive information displays.

### Business Value
Streamlined navigation from dashboard cards improves user efficiency and reduces friction in common workflows. Direct access from statistics to detailed views encourages users to explore and engage with application features more actively. Enhanced dashboard interactivity creates a more polished and professional user experience.

### Acceptance Criteria
- [ ] Each statistics card in the statsCards array includes an href property pointing to its corresponding route
- [ ] Properties card navigates to /dashboard/properties
- [ ] Items card navigates to /dashboard/items
- [ ] Additional statistics cards include appropriate navigation paths
- [ ] Card rendering uses Next.js Link component to enable navigation
- [ ] Cards display hover states indicating they are clickable
- [ ] Navigation works correctly on both desktop and mobile devices
- [ ] Card click targets are appropriately sized for touch interaction
- [ ] Screen readers identify cards as navigational links



## REQ-193: Add Visual Feedback for Clickable Dashboard Cards

**Date**: 2026-01-12 16:30
**Type**: ENHANCEMENT
**Size**: XS

### Summary
Dashboard cards should provide clear visual feedback through hover, active, and focus states to indicate their interactive nature and improve accessibility.

### Current Behavior
Dashboard cards either lack visual feedback when users interact with them, or the feedback is minimal and does not clearly communicate that the cards are clickable elements. Users may not immediately recognize cards as interactive navigation components, and keyboard users may not see clear focus indicators when navigating through cards.

### Expected Behavior
Dashboard cards respond to user interactions with distinct visual states. On hover, the card shadow increases and the border color subtly changes, drawing attention to the interactive element. When clicked, the card applies a slight scale reduction to provide tactile feedback. Keyboard navigation displays a visible focus ring around the active card, ensuring accessibility compliance. The cursor changes to a pointer when hovering over any card, immediately signaling clickability.

### User Impact
Users receive immediate visual confirmation that dashboard cards are interactive elements. The hover and cursor changes reduce uncertainty about whether cards can be clicked. Keyboard users benefit from clear focus indicators that make navigation predictable and accessible. The active state provides satisfying feedback during the click interaction, improving the perceived responsiveness of the interface.

### Business Value
Clear visual feedback reduces user hesitation and encourages exploration of dashboard features. Proper focus states ensure WCAG accessibility compliance, expanding the application's usable audience. Polished interaction states contribute to a professional, modern user experience that reflects positively on product quality. Enhanced affordances lead to higher engagement rates with dashboard navigation features.

### Acceptance Criteria
- [ ] Cards display increased shadow elevation on hover state
- [ ] Card border color changes subtly on hover state
- [ ] Cards apply slight scale reduction (transform: scale) on active state
- [ ] Cards display visible focus ring when focused via keyboard navigation
- [ ] Focus ring meets WCAG contrast requirements for visibility
- [ ] Cursor changes to pointer when hovering over cards
- [ ] All visual state transitions use smooth CSS transitions
- [ ] Visual feedback works consistently across desktop and mobile devices
- [ ] Touch interactions on mobile devices show appropriate active states
- [ ] Visual states do not interfere with card content readability

---

## REQ-194: Add Mobile Label Support to Navigation Menu

**Date**: 2026-01-12 (Created by FA Agent)
**Type**: ENHANCEMENT
**Size**: S

### Summary
Navigation menu items should display mobile-optimized labels on small screens that may differ from desktop labels to ensure clarity within limited screen space.

### Current Behavior
Navigation items display the same label text across all viewport sizes, which may not be optimal for mobile devices where screen real estate is limited.

### Expected Behavior
On mobile devices, navigation items adapt their label text to shorter, space-optimized versions when appropriate, while maintaining the same navigation functionality and full labels on desktop viewports.

### User Impact
Mobile users will experience improved navigation clarity with labels that fit better within the constrained mobile viewport, reducing visual clutter and improving readability.

### Business Value
Enhances mobile user experience by ensuring navigation labels are appropriately sized and readable on all devices, leading to better mobile engagement and usability.

### Acceptance Criteria
- [ ] Navigation items can accept both desktop and mobile label configurations
- [ ] Mobile labels display on viewports below a defined breakpoint (typically tablet size)
- [ ] Desktop labels display on larger viewports without modification
- [ ] Label transitions are handled smoothly during viewport resize
- [ ] All navigation functionality remains consistent regardless of which label variant is displayed
- [ ] Screen readers announce the appropriate label based on the current viewport

---

## REQ-195: Update Dashboard Layout Navigation to Align with RoleBasedNavigation

**Date**: 2026-01-12 17:45 (Created by FA Agent)
**Type**: ENHANCEMENT
**Size**: S

### Summary
The Dashboard Layout Navigation component needs to be updated to align with the RoleBasedNavigation changes, add an Instructions menu item, and update mobile labels for improved mobile user experience.

### Current Behavior
The Dashboard Layout Navigation component may have navigation items that do not align with the recently updated RoleBasedNavigation component. The navigation lacks an Instructions menu item, and mobile labels may not be optimized for smaller screen sizes, potentially causing layout issues or unclear navigation on mobile devices.

### Expected Behavior
The Dashboard Layout Navigation component aligns completely with RoleBasedNavigation changes, ensuring consistency across the application's navigation systems. An Instructions menu item is added to provide users with access to application instructions and help content. Mobile labels are updated to display shortened, space-optimized text on mobile viewports while showing full labels on desktop. The navigation maintains visual and functional consistency with the RoleBasedNavigation component.

### User Impact
Users will experience consistent navigation across all parts of the application, reducing confusion when switching between dashboard views. The addition of the Instructions menu item provides easy access to help content, improving user onboarding and self-service support. Mobile users will benefit from optimized labels that fit better within the constrained viewport, improving readability and navigation efficiency.

### Business Value
Consistent navigation patterns across components reduce development complexity and improve maintainability. The Instructions menu item reduces support requests by making help content easily discoverable. Optimized mobile labels enhance the mobile user experience, which is critical for users who primarily access the application on smaller devices. Alignment with RoleBasedNavigation reduces code duplication and ensures updates propagate consistently.

### Acceptance Criteria
- [ ] Dashboard Layout Navigation component aligns with RoleBasedNavigation structure and styling
- [ ] Instructions menu item is added to the navigation
- [ ] Instructions menu item navigates to the appropriate help/instructions page
- [ ] Mobile labels are implemented for navigation items requiring shortened text
- [ ] Mobile labels display on viewports below the defined breakpoint
- [ ] Desktop labels display on larger viewports
- [ ] Navigation icons remain consistent with RoleBasedNavigation
- [ ] Menu item order matches RoleBasedNavigation where applicable
- [ ] All navigation functionality works correctly on both desktop and mobile devices
- [ ] Component passes accessibility requirements for navigation elements

---

## REQ-196: Separate User-Visible and Internal Workflow Steps Constants

**Date**: 2026-01-12 18:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
The workflow step counter should display steps 1-8 for user-visible progress, while internal navigation includes additional post-workflow screens that are not counted or numbered.

### Current Behavior
The workflow uses a single WORKFLOW_STEPS constant that includes both numbered workflow steps and unnumbered post-workflow screens. The progress indicator and step counter treat all steps equally, causing confusion when users see step numbers on screens that should not be counted as part of the main workflow. Progress weights may not reach 100% at the intended final step.

### Expected Behavior
The system separates user-facing workflow steps from internal navigation steps. A USER_VISIBLE_STEPS constant contains the first 8 steps that users see numbered in the progress indicator. A POST_WORKFLOW_SCREENS constant contains screens like next-action and session-summary that appear after workflow completion without step numbers. The complete WORKFLOW_STEPS constant combines both for internal navigation purposes. Progress weights are calibrated to reach 100% completion at the preview-save step, which represents the final numbered step in the user's journey.

### User Impact
Users will see a clear 8-step workflow with numbered progress, reinforcing that the main workflow is complete after saving their item. Post-workflow screens like "What's Next" and "Session Summary" will appear as natural continuations without creating confusion about whether additional numbered steps remain. Progress indicators will accurately reflect 100% completion at the appropriate point.

### Business Value
Clear workflow progression improves user confidence and reduces abandonment by setting accurate expectations about workflow length. Proper separation of numbered steps from post-workflow screens supports better onboarding and user guidance. Accurate progress indication at 100% provides psychological completion cues that encourage continued engagement with post-workflow features.

### Acceptance Criteria
- [ ] USER_VISIBLE_STEPS constant is created containing the first 8 workflow steps
- [ ] POST_WORKFLOW_SCREENS constant is created containing next-action and session-summary
- [ ] WORKFLOW_STEPS constant combines both arrays for internal navigation
- [ ] Progress weights are updated to reach 100% at preview-save step
- [ ] Step counter displays numbers only for USER_VISIBLE_STEPS
- [ ] Post-workflow screens do not display step numbers
- [ ] Progress indicator shows 100% completion when users reach preview-save
- [ ] Navigation flow continues to work correctly through all screens
- [ ] Type definitions are updated to reflect the new constants structure

---

## REQ-197: Update PROGRESS_WEIGHTS Constant to Reflect Correct Step Count

**Date**: 2026-01-12 19:00
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The PROGRESS_WEIGHTS constant in the ItemCapture workflow should be updated to accurately reflect the 8-step user workflow with proper weight distribution.

### Current Behavior
The PROGRESS_WEIGHTS constant may contain weights for steps that are no longer part of the numbered user workflow, or may have incorrect weight distributions that do not align with the actual 8-step flow. Progress calculations may not accurately reflect user position within the workflow, potentially showing incorrect completion percentages at various stages.

### Expected Behavior
The PROGRESS_WEIGHTS constant contains exactly 8 entries corresponding to the USER_VISIBLE_STEPS workflow stages. Each step is assigned an appropriate weight value that reflects its relative contribution to overall workflow progress. The sum of all weights totals 100, ensuring the progress bar reaches full completion at the preview-save step. Weight distribution reflects the actual time and effort typically required for each step, providing meaningful progress feedback to users.

### User Impact
Users will see accurate progress indication as they move through the workflow. The progress bar will advance in meaningful increments that match their actual advancement through the creation process, improving the sense of accomplishment and providing clear expectations about remaining effort.

### Business Value
Accurate progress indication reduces user anxiety about workflow length and improves completion rates by providing clear visual feedback. Proper weight distribution helps users understand which steps require more attention without artificially inflating or minimizing progress at any stage.

### Acceptance Criteria
- [ ] PROGRESS_WEIGHTS constant contains exactly 8 entries
- [ ] Weight values sum to 100 for complete workflow coverage
- [ ] Weights are ordered to match USER_VISIBLE_STEPS sequence
- [ ] Progress bar reaches 100% completion at preview-save step
- [ ] Weight distribution reflects reasonable time allocation for each step
- [ ] Progress calculations use the updated PROGRESS_WEIGHTS correctly
- [ ] Progress indicator displays smooth, logical advancement through all steps

---

---

## REQ-198: Hide Workflow Header on Post-Workflow Screens

**Date**: 2026-01-12 13:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
The workflow header displaying step navigation should not appear on post-workflow confirmation and navigation screens.

### Current Behavior
The workflow header with step numbers and navigation controls appears on all screens in the item capture flow, including the final "What's Next" screen that appears after an item is successfully captured and saved.

### Expected Behavior
The workflow header should automatically hide itself when the user reaches post-workflow screens. These screens serve as confirmation and navigation points rather than data entry steps, and should not display step counts or navigation controls.

### User Impact
Users completing the item capture workflow see misleading step navigation on the final confirmation screen, which may cause confusion about whether additional steps remain or whether they can safely navigate away.

### Business Value
Eliminates visual confusion at the end of the workflow, providing clear confirmation that the process is complete and reducing user uncertainty about the workflow state.

### Acceptance Criteria
- [ ] Workflow header does not appear on the "What's Next" screen after item capture
- [ ] Workflow header continues to appear normally on all data entry and capture steps
- [ ] No step counting or progress indication appears on post-workflow screens
- [ ] Screen layout adjusts appropriately when header is hidden (no empty space or layout shift)
- [ ] Behavior is consistent across mobile and desktop viewports


---

## REQ-199: Update ItemCreationWorkflow to Use USER_VISIBLE_STEPS Constant

**Date**: 2026-01-12 16:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
The ItemCreationWorkflow component should use the centralized USER_VISIBLE_STEPS constant instead of hardcoded step counts for displaying workflow progress and step navigation.

### Current Behavior
The ItemCreationWorkflow component contains hardcoded references to the number of steps in the workflow. When the step count changes due to workflow modifications, these hardcoded values become outdated, causing the displayed step count to misalign with the actual number of user-facing steps in the wizard.

### Expected Behavior
The ItemCreationWorkflow component references the USER_VISIBLE_STEPS constant to determine the total number of steps. When the workflow changes, only the USER_VISIBLE_STEPS constant requires updating, and all components automatically reflect the correct step count. The workflow header, progress indicators, and navigation controls all display consistent, accurate step information.

### User Impact
Users see consistent step counts throughout the item capture workflow. The displayed step information (e.g., "Step 3 of 8") accurately reflects their position in the wizard, preventing confusion about how many steps remain and providing reliable progress feedback.

### Business Value
Centralizing step count logic reduces maintenance burden and prevents inconsistencies when workflow steps are added or removed. This improves code maintainability and ensures users always receive accurate progress information.

### Acceptance Criteria
- [ ] ItemCreationWorkflow imports and uses USER_VISIBLE_STEPS constant from constants file
- [ ] All hardcoded step count references in ItemCreationWorkflow are replaced with USER_VISIBLE_STEPS
- [ ] Workflow header displays step count using USER_VISIBLE_STEPS
- [ ] Progress calculations use USER_VISIBLE_STEPS as the denominator
- [ ] Step navigation logic references USER_VISIBLE_STEPS for boundary checks
- [ ] No hardcoded step numbers remain in ItemCreationWorkflow component
- [ ] All existing tests pass with the updated implementation


---

## REQ-200: Update useWorkflowState Hook to Handle Step Counting and Navigation Logic

**Date**: 2026-01-12 12:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
The workflow state management hook should correctly calculate and track the total number of steps in the ItemCapture wizard, accounting for the new final step that appears after the save action.

### Current Behavior
The workflow state management logic does not properly account for all steps in the wizard sequence, particularly the step that appears after users complete the save/review action. This causes the step indicator to display incorrect progress information.

### Expected Behavior
The workflow state management should accurately track the total step count throughout the entire wizard flow, including the final step that appears after save. The step counter should show users their correct position in the workflow at all times, with proper navigation state management.

### User Impact
Users completing the item capture workflow see accurate progress indicators that reflect their true position in the multi-step process, improving their understanding of how many steps remain.

### Business Value
Accurate progress tracking reduces user confusion and abandonment during the multi-step workflow, improving completion rates and user satisfaction with the item capture feature.

### Acceptance Criteria
- [ ] The state management logic correctly calculates total steps including the final post-save step
- [ ] Step count remains accurate as users navigate through the entire workflow
- [ ] Navigation logic properly handles transitions between all steps in the sequence
- [ ] The step indicator displays correct current/total values at every stage
- [ ] Existing workflow functionality continues to work without regression


---

## REQ-201: Integrate WhatsNextStep Component into ItemCreationWorkflow

**Date**: 2026-01-12 13:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
The ItemCreationWorkflow should present users with a clear decision menu after successfully saving an item, allowing them to choose their next action from four distinct options.

### Current Behavior
After saving an item in the ItemCreationWorkflow, users encounter a NextActionStep component that does not provide a clear, intuitive interface for deciding what to do next. The existing WhatsNextStep component (already implemented in the ItemCapture flow) has the correct four-option interface but is not yet integrated into the ItemCreationWorkflow.

### Expected Behavior
After successfully saving an item, users see a friendly success confirmation displaying the saved item's name, followed by four clearly labeled action options:
1. Edit Instructions - Review and modify the instructions just created
2. Add New Instructions - Create different instructions for the same item
3. Create New Item - Start the workflow fresh with a different item
4. Done - Exit the workflow and return to the dashboard

Each option is presented as a distinct, clickable card with an icon, title, and description. The "Add New Instructions" option is visually emphasized as the recommended next action.

### User Impact
Users completing the item creation workflow have clear, actionable next steps immediately after saving. They understand their options without confusion and can quickly continue their work pattern (whether adding more instructions to the same item, creating new items, or returning to the dashboard).

### Business Value
Providing clear post-save navigation options improves workflow efficiency and encourages users to create comprehensive documentation by making it easy to add multiple instruction sets to a single item. This reduces friction in the content creation process and increases user productivity.

### Acceptance Criteria
- [ ] NextActionStep component accepts savedItem object containing id, name, and articleTitle
- [ ] NextActionStep component accepts four callback props: onEditInstructions, onAddNewInstructions, onCreateNewItem, and onDone
- [ ] The WhatsNextStep component implementation is reused or refactored to serve both ItemCapture and ItemCreationWorkflow flows
- [ ] Success confirmation displays the saved item's name correctly
- [ ] All four action options are clearly visible with appropriate icons and descriptions
- [ ] "Add New Instructions" option has visual emphasis (primary variant styling)
- [ ] Clicking each option triggers the appropriate callback function
- [ ] The interface is accessible with proper ARIA labels and keyboard navigation
- [ ] Existing ItemCreationWorkflow tests are updated to cover the new interface


---

## REQ-202: Remove Back Navigation from Post-Workflow Header

**Date**: 2026-01-12 14:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
The workflow header should not display a back arrow or navigation control after users complete the item capture workflow and reach the "What's Next" screen.

### Current Behavior
When users arrive at the final "What's Next" screen after completing the item capture workflow, the header may still display a back arrow or navigation control that allows them to return to previous steps. This creates confusion about whether the workflow is truly complete and whether users can or should modify their saved work.

### Expected Behavior
After users save their item and reach the "What's Next" decision screen, no back arrow or navigation control appears in the header. The header remains visible for branding consistency but clearly signals that the workflow is complete and users should choose one of the four presented action options rather than attempting to navigate backward.

### User Impact
Users completing the item capture workflow receive clear visual signals that they have successfully finished the process. The absence of backward navigation prevents confusion about whether changes can still be made and encourages users to consciously choose their next action from the provided options.

### Business Value
Preventing post-completion navigation reduces user confusion and helps maintain data integrity by discouraging users from attempting to modify already-saved items through the workflow interface. This improves the perceived quality of the completion experience.

### Acceptance Criteria
- [ ] No back arrow appears in the header when WhatsNextStep is displayed
- [ ] Header remains visible for branding and context
- [ ] Users cannot navigate backward from WhatsNextStep using header controls
- [ ] The header styling appropriately reflects the completion state
- [ ] Existing navigation functionality on other steps remains unaffected
- [ ] Tests verify that back navigation is not rendered on WhatsNextStep


---

## REQ-203: Update StatisticsCards Component for Click Navigation

**Date**: 2026-01-12 18:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Dashboard statistics cards should function as clickable navigation elements that direct users to relevant sections of the application when selected.

### Current Behavior
The StatisticsCards component displays key metrics (total items, properties, recent items, items needing attention) as static informational cards. Users can view the statistics but cannot interact with them to navigate to related content or take action on the displayed metrics.

### Expected Behavior
Each statistics card becomes an interactive element that responds to user clicks. When users select a card, the application navigates them to the appropriate section where they can view detailed information or take action related to that metric. For example, clicking the "Total Items" card navigates to the item manager, while clicking "Items Needing Attention" filters to show items requiring updates or review.

### User Impact
Users gain the ability to quickly navigate from dashboard overview metrics directly to detailed views, reducing the number of steps needed to take action on important statistics. This creates a more efficient workflow where the dashboard serves as both an information hub and a navigation tool.

### Business Value
Making statistics cards clickable improves user engagement with the dashboard and reduces friction in common navigation patterns. Users can move more quickly from metrics to action, increasing productivity and making the dashboard feel more dynamic and responsive to user needs.

### Acceptance Criteria
- [ ] All four statistics cards become clickable with appropriate visual feedback
- [ ] Each card navigates to the correct destination when clicked
- [ ] Cards display hover states that indicate they are interactive
- [ ] Keyboard navigation allows users to activate cards using Enter or Space
- [ ] Screen readers announce cards as clickable buttons with proper labels
- [ ] Click areas encompass the entire card surface for easy targeting
- [ ] Navigation maintains proper routing history for browser back functionality
- [ ] Cards remain visually consistent with existing design while indicating interactivity
- [ ] Tests verify that clicking each card triggers the correct navigation



---

## REQ-204: Create Placeholder Routes for Rooms and Tags Navigation

**Date**: 2026-01-12 19:15
**Type**: NEW FEATURE
**Size**: S

### Summary
The application should provide dedicated routes for Rooms and Tags sections that users can navigate to from the dashboard, either showing filtered item views or placeholder content until full feature implementation.

### Current Behavior
Dashboard navigation cards for Rooms and Tags exist but lack corresponding route destinations. When users attempt to navigate to these sections, they encounter missing routes or broken navigation, creating a incomplete user experience.

### Expected Behavior
Users clicking Rooms or Tags navigation elements are directed to dedicated pages at `/dashboard2/rooms` and `/dashboard2/tags` respectively. These pages either redirect users to the item manager with appropriate filters applied (showing only items in a selected room or with selected tags) or display placeholder content that acknowledges the feature and sets expectations for future functionality.

### User Impact
Users exploring the dashboard navigation find all paths lead to valid destinations, creating confidence in the application's completeness. Even if full Rooms and Tags management features are not yet implemented, users receive clear feedback about these sections and can access filtered views of their items organized by these attributes.

### Business Value
Providing working routes for all navigation elements prevents user frustration and maintains the perception of a polished, complete application. This allows dashboard navigation to be fully functional while room and tag management features continue development.

### Acceptance Criteria
- [ ] Route exists at `/dashboard2/rooms/page.tsx` that renders without errors
- [ ] Route exists at `/dashboard2/tags/page.tsx` that renders without errors
- [ ] Both routes are accessible through standard Next.js routing patterns
- [ ] Pages either redirect to item manager with appropriate filters or show placeholder content
- [ ] Placeholder content (if used) clearly communicates the section purpose and sets expectations
- [ ] Navigation from dashboard to these routes functions correctly
- [ ] Browser back button works properly when navigating away from these pages
- [ ] Routes follow existing authentication and authorization patterns
- [ ] Page components match the visual design language of other dashboard sections

---

## REQ-205: Update Navigation Menu Configuration in Dashboard Layout

**Date**: 2026-01-12 00:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
Update the navigationItems configuration in the dashboard layout to provide proper navigation structure for the application menu.

### Current Behavior
The dashboard layout contains a navigationItems configuration that may not reflect the complete or correct navigation structure needed for the application. The navigation menu may be missing items, have incorrect routing, or lack proper organization for the user experience.

### Expected Behavior
The navigationItems configuration should define a complete, well-organized navigation menu that allows users to access all major application features. Each navigation item should have correct routing paths, appropriate labels, and proper icon associations that align with the application's information architecture.

### User Impact
All authenticated users navigating through the dashboard will benefit from a properly configured navigation menu that provides clear access paths to application features and follows consistent organizational patterns.

### Business Value
A well-structured navigation menu improves user orientation, reduces confusion, and increases feature discoverability, leading to higher engagement and better overall user experience.

### Acceptance Criteria
- [ ] Navigation configuration includes all primary application features and routes
- [ ] Each navigation item has an appropriate label that clearly indicates its purpose
- [ ] Navigation items are organized in a logical hierarchy or grouping
- [ ] All navigation paths route correctly to their intended destinations
- [ ] Navigation structure is consistent with the application's information architecture
- [ ] Icons or visual indicators are properly associated with each navigation item where applicable


---

## REQ-206: Add Mobile Label Display Logic to Navigation Menu

**Date**: 2026-01-12 (Current Session)
**Type**: ENHANCEMENT
**Size**: M

### Summary
The navigation menu should display mobile-optimized labels on smaller screens to improve readability and maintain usability in constrained viewport widths.

### Current Behavior
The navigation menu displays the same labels across all screen sizes. On mobile devices, longer navigation labels may be truncated, difficult to read, or cause layout issues due to limited horizontal space.

### Expected Behavior
When users access the application on mobile devices, the navigation menu automatically switches to display abbreviated or mobile-optimized labels. The labels remain clear and readable while fitting within the constrained mobile viewport. On larger screens, the full-length labels continue to display normally.

### User Impact
Mobile users will experience improved navigation usability with labels that are appropriately sized for their device. The interface will feel more polished and professional, with navigation items that are easier to tap and read on smaller touchscreens.

### Business Value
Enhancing mobile navigation usability reduces friction for users accessing the application from smartphones and tablets, which increasingly represents a significant portion of web traffic. Clear, readable navigation improves user confidence and reduces support inquiries related to mobile interface issues.

### Acceptance Criteria
- [ ] Navigation items display alternative labels on mobile viewports (typically below 768px width)
- [ ] Mobile labels are visually distinct but maintain semantic consistency with their full-length counterparts
- [ ] The transition between mobile and desktop labels occurs smoothly during viewport resizing
- [ ] All navigation functionality remains intact when mobile labels are displayed
- [ ] Mobile labels are configured through the navigation items configuration structure
- [ ] The implementation follows responsive design patterns consistent with the rest of the application


---

## REQ-207: Create Instructions Page for User Guidance

**Date**: 2026-01-12 19:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The application should provide a dedicated Instructions page that guides users through the features and workflows available in FAQBNB, accessible from the main navigation menu.

### Current Behavior
Users navigating through the application lack a centralized location for learning how to use various features. When users need guidance on workflows such as creating items, managing properties, or generating QR codes, they must rely on contextual help or trial and error. There is no comprehensive instructions page accessible from the navigation menu.

### Expected Behavior
Users can access a well-organized Instructions page from the navigation menu that provides clear, step-by-step guidance on using key application features. The page presents information in an easy-to-scan format with sections covering common workflows such as property setup, item creation, QR code generation, and item management. Users can quickly find answers to how-to questions without leaving the application.

### User Impact
All users, particularly new users onboarding to the platform, benefit from having accessible, comprehensive instructions. Users spend less time confused about feature functionality and more time productively managing their property inventories. The Instructions page reduces the learning curve and builds user confidence in using the application independently.

### Business Value
Providing clear user guidance reduces support burden, improves user retention during onboarding, and increases feature adoption rates. Users who understand how to use the application effectively are more likely to remain engaged and recommend the platform to others.

### Acceptance Criteria
- [ ] Instructions page exists at a dedicated route accessible from the navigation menu
- [ ] Page follows authentication and authorization patterns consistent with other dashboard pages
- [ ] Instructions content is organized into logical sections covering major application workflows
- [ ] Page layout is responsive and readable on both desktop and mobile devices
- [ ] Navigation menu includes a clearly labeled link to the Instructions page
- [ ] Instructions page matches the visual design language and component patterns of the application
- [ ] Page can be accessed by all authenticated users regardless of role or property count
- [ ] Content is written in clear, user-friendly language avoiding technical jargon where possible


---

## REQ-208: Update Type Definitions to Separate Item from Article

**Date**: 2026-01-12 19:45
**Type**: ENHANCEMENT
**Size**: L

### Summary
The application's type definitions should clearly separate the concept of a physical Item from its associated Article content, establishing a one-to-many relationship where each Item can have multiple Articles with different purposes.

### Current Behavior
The current type system conflates physical Items with their instructional content. An Item record contains content pieces directly, making it difficult to manage multiple sets of instructions for the same physical object. Users cannot create separate articles for different purposes (cleaning instructions, troubleshooting guides, usage tips) for a single physical item. The QR code links directly to mixed content rather than to a well-organized collection of purpose-specific articles.

### Expected Behavior
The type definitions distinguish between a physical Item (which receives one QR code and has a name and location) and an Article (which contains purpose-specific instructional content). Each Item can be associated with multiple Articles, where each Article has a clear purpose type that determines its title (such as "How to Clean" or "Troubleshooting Guide"). The Item name appears on the QR code label, while Articles contain the actual instructional content pieces. The data model reflects this separation with proper interface definitions, maintaining backward compatibility through deprecated legacy fields.

### User Impact
Users managing property inventories gain the ability to organize multiple types of instructions for each physical item without confusion between the item's identity and its documentation. When scanning a QR code, users see a clear separation between what the physical item is and the various instruction articles available for it. Content creators can add new article types to existing items without restructuring the entire item record.

### Business Value
Properly separating Items from Articles creates a more scalable content architecture that supports richer documentation capabilities. This separation enables future features like article templates, shared articles across similar items, and purpose-specific content recommendations. The clearer data model reduces technical debt and makes the codebase more maintainable for ongoing development.

### Acceptance Criteria
- [ ] Article interface includes id, title, purpose, content array, and createdAt timestamp
- [ ] Article purpose field uses a PurposeType enum that drives the article title
- [ ] SessionItem interface includes physical item attributes: id, name, room, itemType, createdAt
- [ ] SessionItem interface includes an optional articles array containing Article objects
- [ ] SessionItem retains a deprecated content field marked with @deprecated JSDoc for compatibility
- [ ] QR code URL field remains on SessionItem as an optional property
- [ ] Tags remain on SessionItem as optional property for item categorization
- [ ] Type definitions include proper JSDoc comments explaining the purpose and usage of each field
- [ ] The one-to-many relationship between Item and Article is clear from the type structure
- [ ] All date fields use Date type consistently across both interfaces


---

## REQ-209: Update CurrentItemState to Reflect Item-Article Separation

**Date**: 2026-01-12 20:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
The CurrentItemState interface used in the Item Capture wizard should be restructured to properly distinguish between physical Item properties and Article content properties, aligning with the new data model architecture.

### Current Behavior
The CurrentItemState interface currently mixes physical item attributes with article content attributes in a single flat structure. Properties like item name, room, and item type are stored alongside article content arrays and article-specific fields. This conflation makes it unclear which fields describe the physical object versus which fields describe the instructional content. State management hooks and components must work with an ambiguous data structure that does not reflect the proper relationship between Items and Articles.

### Expected Behavior
The CurrentItemState interface separates physical item properties from article properties into distinct nested objects. The top level contains item-specific attributes: item name, room, item type, and QR code URL. Article-related fields are grouped under an article object containing purpose, content array, and article title. Components consuming this state can clearly distinguish between setting item metadata versus building article content. State transitions during the wizard flow maintain clear separation between item selection steps and content creation steps.

### User Impact
Users progressing through the Item Capture wizard experience no visible changes to their workflow, but the underlying state management correctly maps their inputs to either the physical Item or the Article being created. Developers working with the state management hooks benefit from clearer separation of concerns and more maintainable code. Future enhancements that require managing multiple articles per item become significantly easier to implement due to the properly structured state.

### Business Value
Refactoring the state management to match the corrected data model eliminates a major source of technical debt and architectural confusion. This enables future features like multiple articles per item, article templates, and purpose-driven content creation. The clearer state structure reduces bugs related to data mapping and makes the codebase more understandable for ongoing development efforts.

### Acceptance Criteria
- [ ] CurrentItemState interface includes a top-level item property containing name, room, itemType, and optional qrCodeUrl
- [ ] CurrentItemState interface includes a top-level article property containing purpose, content array, and title
- [ ] The content array within article property maintains its current structure with type, data, thumbnailUrl, and metadata fields
- [ ] Tags remain at the top level of CurrentItemState as they can apply to both items and articles
- [ ] State management hooks that consume CurrentItemState are updated to access properties through the new nested structure
- [ ] All components reading from or updating CurrentItemState use the correct property paths for item versus article data
- [ ] Type errors are resolved throughout the codebase after the interface restructure
- [ ] JSDoc comments clearly document which properties describe the physical Item versus the Article content
- [ ] Legacy code paths or deprecated fields are clearly marked if backward compatibility is required during transition



---

## REQ-210: Update PreviewSaveStep Display to Separate Item Name from Article Title

**Date**: 2026-01-12 20:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The PreviewSaveStep component should display physical Item properties separately from Article properties, showing "Item Name" for the physical object and "Article Title" for the purpose-derived instructional content, with QR code previews showing only the item name.

### Current Behavior
The PreviewSaveStep currently displays a single title field without distinguishing between the physical item name and the article's purpose-driven title. Users reviewing their content before saving cannot clearly see the separation between what the physical item is called versus what the instructional article is titled. The QR code preview may display mixed information rather than focusing on the physical item name that should appear on the printed label. This conflation creates confusion about what will appear on the QR label versus what will appear as the article heading.

### Expected Behavior
The PreviewSaveStep displays two distinct fields during review: an "Item Name" field showing the physical item such as "Cabinets" and an "Article Title" field showing the purpose-derived title such as "How to Clean Cabinets". The QR code preview section clearly shows only the item name as it will appear on the printed QR label. Users reviewing their content can easily verify that the physical item is correctly named and that the article title appropriately describes the instructional content purpose. The visual layout makes the distinction between item and article properties immediately clear.

### User Impact
Users completing the item creation workflow gain clarity about what information will appear on the QR code label versus what will appear as content titles when someone scans the code. This reduces confusion during the review step and helps users catch mistakes where the physical item name might be confused with the article purpose. Property managers printing QR labels have confidence that the labels will show concise, appropriate item names rather than lengthy article titles.

### Business Value
Clearly separating item name from article title in the preview step reduces user errors and support requests related to QR code label content. Users have better understanding of the data model, making them more confident in creating additional articles for existing items in future interactions. The improved clarity supports the architectural goal of separating physical items from their instructional content.

### Acceptance Criteria
- [ ] PreviewSaveStep displays an "Item Name" field showing the physical item name entered by the user
- [ ] PreviewSaveStep displays an "Article Title" field showing the purpose-derived article title
- [ ] QR code preview section shows only the item name, not the article title
- [ ] Visual layout clearly distinguishes between item properties and article properties through section grouping or visual separation
- [ ] Field labels use consistent terminology with other parts of the application
- [ ] The distinction between Item Name and Article Title is visually clear on both desktop and mobile layouts
- [ ] All text labels and helper text refer to "Item Name" for physical objects and "Article Title" for instructional content
- [ ] The review step accurately reflects the data that will be saved to the database in the separated Item and Article structure

---

## REQ-211: Update QR Code Generation to Encode Item IDs

**Date**: 2026-01-12 21:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
QR code generation should encode Item IDs that link to the physical item's landing page, which then displays all associated articles, rather than encoding direct links to individual article content.

### Current Behavior
QR codes generated during the item creation workflow may encode URLs that link directly to article content or use ambiguous identifiers that conflate items with articles. When users scan a QR code, they arrive at a page that assumes a one-to-one relationship between the physical item and its instructional content. The QR generation utilities do not properly distinguish between Item IDs and Article IDs, leading to confusion in the data flow and potential routing issues as the system evolves to support multiple articles per item.

### Expected Behavior
The QR code generation process creates codes that encode Item IDs exclusively, producing URLs in the format that routes to an item landing page. When a user scans the QR code, they see the item name and a list of all available articles for that physical item, organized by purpose type. The QR generation hook receives item metadata and generates codes based on the Item ID, not the Article ID. Storage of the QR code URL remains with the Item record, as each physical item receives exactly one QR code regardless of how many articles document it.

### User Impact
Property managers scanning QR codes arrive at a unified view of all documentation available for a physical item, rather than being linked to a single article that might not cover their current need. Users creating items during the workflow see QR codes that properly represent the physical item identity. When multiple articles are added to an item in future interactions, the same QR code continues to work correctly, routing to an updated landing page showing all articles.

### Business Value
Properly structuring QR codes around Item IDs rather than Article IDs ensures the QR code system scales correctly as the platform evolves to support richer content organization. QR codes remain stable and do not need regeneration when new articles are added to existing items. The architecture supports future features like article recommendations, shared articles, and purpose-based content filtering at the item landing page.

### Acceptance Criteria
- [ ] QR code generation utilities accept Item ID as the primary identifier for encoding
- [ ] Generated QR code URLs follow a consistent format that routes to item landing pages
- [ ] The useSessionQRGeneration hook uses Item IDs when creating QR codes for captured items
- [ ] QR code URLs stored in the database are associated with Item records, not Article records
- [ ] QR code generation logic does not reference Article IDs in URL construction
- [ ] Generated QR codes produce scannable URLs that resolve correctly to item landing pages
- [ ] The QR code generation process maintains compatibility with existing print workflows
- [ ] Documentation clearly explains that QR codes represent physical items, not individual articles
- [ ] All QR code generation occurs after the Item ID is known or can be deterministically generated


---

## REQ-212: Instructions List Page

**Date**: 2026-01-12 (Document created/modified)
**Type**: NEW FEATURE
**Size**: M
**Target**: `/dashboard2/` (NOT legacy `/dashboard/`)

### Summary
Property owners should be able to view all their instructions in a centralized list page at `/dashboard2/instructions`, accessible from the dashboard2 sidebar navigation.

### Current Behavior
Once instructions are created, there is no dedicated page where property owners can see all their instructions at once. Instructions are scattered across items and difficult to locate. The dashboard2 sidebar has an "Instructions" nav item but it doesn't link to a functional page.

### Expected Behavior
Property owners can navigate to an "Instructions" page from the **dashboard2 sidebar** (at `/dashboard2/instructions`) where they see a complete list of all instructions for the selected property. Each instruction displays its title (e.g., "How to Use - Refrigerator"), associated item name, and room location.

### User Impact
Property owners gain visibility over their instructional content. They can easily locate instructions and see what content exists for each item.

### Business Value
Provides essential read capability for instructions. Foundation for future edit functionality (REQ-213).

### Acceptance Criteria
- [ ] An "Instructions" navigation item appears in the dashboard2 sidebar and links to `/dashboard2/instructions`
- [ ] The instructions list page displays all instructions (from `item_articles` table) for the currently selected property
- [ ] Each instruction in the list shows: instruction title, associated item name, and room (from item tags)
- [ ] Empty state message shown when no instructions exist
- [ ] Loading state shown while fetching data


---

## REQ-213: Edit Instruction Flow

**Date**: 2026-01-12 (Document created/modified)
**Type**: NEW FEATURE
**Size**: L
**Depends On**: REQ-212

### Summary
Property owners should be able to edit existing instructions using the same workflow they used to create them, but in a read-only item context where only content can be modified.

### Current Behavior
There is no way to edit instructions after they are created. Users must delete and recreate if changes are needed.

### Expected Behavior
Clicking an instruction from the list (REQ-212) opens the ItemCreationWorkflow in "edit mode". The item context (room, item type, specific item, purpose) is pre-populated and read-only. Users can add, remove, or modify content items (videos, photos, PDFs, text, URLs). Saving updates the existing instruction and content records.

### User Impact
Property owners can maintain accurate, up-to-date instructions as item details change or content needs improvement. Reduces friction in content management.

### Business Value
Completes CRUD operations for instructions. Reduces support burden from owners struggling to update their content.

### Acceptance Criteria
- [ ] Clicking an instruction from the list page navigates to edit mode (e.g., `/dashboard2/instructions/[articleId]/edit`)
- [ ] Edit mode pre-populates item context (room, item type, specific item, purpose) as read-only/display-only
- [ ] Edit mode loads existing content pieces from `item_links` where `article_id` matches
- [ ] User can add new content pieces to the instruction
- [ ] User can remove existing content pieces
- [ ] User can modify content order
- [ ] Saving persists changes to the existing `item_articles` and `item_links` records
- [ ] After saving, user returns to instructions list with confirmation message
- [ ] Cancel returns to instructions list without saving changes



---

## REQ-214: Dedicated Single-Page Edit Experience for Instructions

**Date**: 2026-01-12 23:21
**Type**: ENHANCEMENT
**Size**: M
**Supersedes**: REQ-213 (replaces workflow-based edit with dedicated page)

### Summary
Property owners should edit instructions on a dedicated single-page form rather than navigating through the full multi-step item creation workflow, which incorrectly starts at step 1 (room selection) when accessed in edit mode.

### Current Behavior
Editing an instruction navigates to the ItemCreationWorkflow component starting at step 1 (room selection), presenting all eight workflow steps even though most of the item context (room, item type, item name, purpose) should not be editable. The workflow UI includes step progress indicators, back arrows, and multi-step navigation inappropriate for editing existing content. Users must click through multiple screens to reach the content editing section.

### Expected Behavior
Clicking an instruction from the list opens a dedicated edit page at `/dashboard2/instructions/[articleId]/edit`. The page displays a single form divided into two sections: a read-only context section at the top showing the header "Editing Instruction For: [Article Title]" along with the room, item type, and item name (but not purpose), and an editable section below for article title, tags, and content pieces. Users can modify the title and tags, add/remove/edit/reorder content pieces, and see Save and Cancel buttons. No step indicators, progress bars, or back arrows appear. After saving, users return to the instructions list with a success message.

### User Impact
Property owners experience a streamlined editing flow appropriate for modifying existing content without navigating unnecessary workflow steps. Editing takes fewer clicks and presents only relevant, editable fields. The interface clearly distinguishes between fixed item context and modifiable instruction content.

### Business Value
Improves user experience by matching the editing interface to the actual editing task rather than reusing creation workflows. Reduces confusion and time spent navigating irrelevant screens. Aligns with standard web application patterns where editing uses simpler, focused forms rather than creation wizards.

### Acceptance Criteria
- [ ] Edit page renders at `/dashboard2/instructions/[articleId]/edit` when navigating from instructions list
- [ ] Page displays header "Editing Instruction For: [Article Title]" where title reflects current article title
- [ ] Read-only section groups room, item type, and item name together at top of page
- [ ] Read-only section does not display purpose field
- [ ] Article title field is editable and shows current title value
- [ ] Tags display current tags and allow adding/removing tags
- [ ] Content section lists all current content pieces from article
- [ ] Users can add new content pieces of any supported type
- [ ] Users can delete existing content pieces
- [ ] Users can reorder content pieces using drag and drop
- [ ] Users can edit existing content pieces
- [ ] Save button persists all changes to article title, tags, and content
- [ ] Cancel button returns to instructions list without saving
- [ ] Success message displays on instructions list after successful save
- [ ] No step progress indicators appear on edit page
- [ ] No back arrow navigation appears on edit page
- [ ] No multi-step workflow navigation appears on edit page


---

## REQ-215: Simplified Item Edit Page with Instructions List

**Date**: 2026-01-13 (Time captured at document modification)
**Type**: ENHANCEMENT
**Size**: M

### Summary
The Item Edit page should focus exclusively on item metadata (name, room, type, description, tags) and display a navigable list of associated instructions, removing redundant Media & Links and Property sections.

### Current Behavior
The Item Edit page displays multiple sections including:
- Item metadata fields (name, room, type, description, tags)
- Media & Links section showing content that belongs to instructions
- Property information that is already implied by the item's association
All content appears on a single page with no clear separation between item attributes and instruction content.

### Expected Behavior
When users access the Item Edit page, they see:
- A clean form with only item metadata fields (name, room selection, type selection, description, tags)
- An Instructions section at the bottom listing all instructions associated with this item
- Each instruction entry displays its title, purpose, and an edit action
- Clicking an instruction navigates to the dedicated Instruction Edit page
- An empty state with option to create new instruction when no instructions exist
- No Media & Links section
- No Property display section

### User Impact
Property hosts editing items will experience a cleaner, less cluttered interface focused on the item's core attributes. They can easily see all instructions for an item and navigate directly to edit specific instructions. This reduces cognitive load and makes the relationship between items and their instructions more explicit.

### Business Value
Simplifies the item editing experience by removing redundant information and clearly separating item attributes from instruction content. This improves usability and aligns with the dedicated instruction editing flow established in REQ-214.

### Acceptance Criteria
- [ ] Item Edit page displays only item metadata fields: name, room selection, type selection, description, and tags
- [ ] Media & Links section is removed from Item Edit page
- [ ] Property section is removed from Item Edit page
- [ ] Instructions section appears at bottom of Item Edit page
- [ ] Each instruction in the list displays title, purpose, and edit action
- [ ] Clicking an instruction navigates to the Instruction Edit page at the correct route
- [ ] Empty state appears when item has no instructions, with option to create new instruction
- [ ] Navigation flow works correctly: Item Edit → Instruction Edit → back to Item Edit
- [ ] All existing item metadata can still be edited and saved successfully

---

## REQ-216: Items List Table Display and Interaction Enhancements

**Date**: 2026-01-13 00:22
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property managers need an improved Items List table that shows instruction counts, supports column sorting, and provides filtering capabilities to efficiently manage and locate items.

### Current Behavior
The Items List table displays a "Type" column whose purpose is unclear and not useful to users. The table lacks sorting functionality, making it difficult to organize items. There is no filtering mechanism to narrow down the list based on specific criteria. Users cannot quickly identify which items have instructions or how many instructions exist per item.

### Expected Behavior
The Items List table displays an "Instructions" column (abbreviated as "Instr." on mobile devices) showing the count of instruction articles associated with each item. Users can click any column header to sort the list in ascending or descending order, with a visual indicator showing the current sort column and direction. Filter controls allow users to narrow the list by room, search by name, or apply other relevant criteria through intuitive interfaces such as dropdowns and search inputs.

### User Impact
Property managers can quickly assess which items require attention based on instruction availability. They can efficiently locate specific items through search and filtering rather than scrolling through long lists. Sorting capabilities enable organizing items by any attribute, improving workflow efficiency when managing multiple properties with numerous items.

### Business Value
Reducing the time required to locate and manage items increases operational efficiency for property managers. Better visibility into instruction coverage helps identify gaps in documentation and prioritize content creation efforts.

### Acceptance Criteria
- [ ] The "Type" column is removed from the Items List table
- [ ] An "Instructions" column appears showing the numeric count of instruction articles for each item
- [ ] The "Instructions" column label displays as "Instructions" on desktop and "Instr." on mobile devices
- [ ] Clicking any column header sorts the list by that column in ascending order
- [ ] Clicking the same column header again toggles between ascending and descending sort
- [ ] A visual indicator (arrow or icon) shows which column is currently sorted and in which direction
- [ ] Filter controls are available and accessible above or within the table
- [ ] Users can filter items by room selection through a dropdown or similar control
- [ ] Users can filter items by name through a search input field
- [ ] Applied filters visibly affect the displayed list of items
- [ ] The instruction count data is returned by the system for each item displayed



---

## REQ-217: Replace "Instructions" Terminology with "Guide" Throughout Application

**Date**: 2026-01-13 09:02
**Type**: ENHANCEMENT
**Size**: M

### Summary
Replace all user-facing occurrences of "Instructions" with the shorter, more space-efficient term "Guide" (or "Guides" in plural form) throughout the application interface.

### Current Behavior
The application currently uses "Instructions" as the terminology for user guidance content. This term appears in navigation items, page titles, table column headers, button labels, empty states, and messaging. The longer word creates space constraints, particularly in table columns and on mobile viewports.

### Expected Behavior
Users see "Guide" or "Guides" instead of "Instructions" throughout the application. The shorter terminology fits better in constrained spaces while maintaining clarity. All navigation elements, page headings, table displays, buttons, and user-facing messages reflect this updated terminology consistently.

### User Impact
All users interacting with guidance content will see the updated terminology. The change primarily benefits users on mobile devices or viewing tables where column width is limited. The shorter term improves readability and visual balance without changing functionality.

### Business Value
Improved visual hierarchy and space utilization in the UI leads to better user experience, especially on mobile devices. The terminology better aligns with common industry patterns for user assistance content.

### Acceptance Criteria
- [ ] Navigation items that previously displayed "Instructions" now show "Guides"
- [ ] Page titles referencing instructions now reference guides instead
- [ ] Table column headers display "Guide" or appropriately abbreviated text
- [ ] Column values that displayed counts show "X guides" instead of "X instructions"
- [ ] Empty state messages for guidance content use "guide" terminology
- [ ] Button labels referring to instructions now refer to guides
- [ ] Success and error messages display "guide" terminology where previously using "instructions"
- [ ] The terminology change is applied consistently across all dashboard pages
- [ ] Mobile viewports display the updated terminology without overflow or truncation issues
- [ ] All user-facing text reflects the change while internal code variables may remain unchanged


---

## REQ-218: Items List UI Improvements - Remove Clutter, Fix Search Clear, Add Column Toggle

**Date**: 2026-01-13 10:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Improve the Items List interface by removing redundant status displays, fixing the search clear button, and adding user-controlled table column customization.

### Current Behavior
- The interface displays "No filters applied" and "X of Y items" text below the toolbar, cluttering the view
- When users type in the search field and click the X button to clear, the search text reappears instead of staying cleared
- The Property column is always visible with no option to hide it
- Users cannot customize which columns they see in the table

### Expected Behavior
- The filter status text and item count display are removed from below the toolbar
- Clicking the X button in the search field immediately clears the text and resets the search results without the text reappearing
- A gear icon appears on the right side of the table header row (after the CREATED column)
- Clicking the gear icon reveals a small popup or dropdown menu
- The menu includes a toggle option to show or hide the Property column
- The Property column is hidden by default when users first visit the page
- The user's column visibility preference persists throughout their browser session

### User Impact
Affects all users viewing the Items List in the alternative dashboard interface. Users will experience a cleaner interface, more reliable search clearing, and control over which columns they see.

### Business Value
Reduces visual clutter and improves usability by giving users control over their view. Fixing the search clear bug eliminates user frustration and improves the perceived quality of the interface.

### Acceptance Criteria
- [ ] The "No filters applied" text no longer appears below the search and filter controls
- [ ] The "X of Y items" count display no longer appears below the search and filter controls
- [ ] Clicking the X button in the search input completely clears the search text
- [ ] After clicking the X button, the search text does not reappear
- [ ] Clearing the search resets the displayed items to show all results matching any other active filters
- [ ] A gear or settings icon appears in the table header row to the right of the CREATED column
- [ ] Clicking the gear icon opens a popup or dropdown menu for table customization
- [ ] The customization menu includes a toggle option labeled "Show Property Column" or similar
- [ ] The Property column is hidden by default when users first load the page
- [ ] Toggling the Property column visibility immediately shows or hides that column in the table
- [ ] The user's Property column visibility preference persists across page refreshes within the same browser session
- [ ] These changes apply only to the Items List in the alternative dashboard interface, not the original dashboard

---

## REQ-219: Sortable Table Headers and Column Settings for Guides List

**Date**: 2026-01-13 16:47
**Type**: ENHANCEMENT
**Size**: M

### Summary
Add sortable column headers, column visibility controls, and proper header row infrastructure to the Guides list page to match the functionality available on the Items list page.

### Current Behavior
The Guides list page displays article data in rows but lacks proper table headers. Users cannot sort the list by different criteria or customize which columns are visible. There are no visual indicators showing what each column represents, making it harder to scan and understand the data at a glance.

### Expected Behavior
The Guides list displays a proper header row above the data with clickable column labels. Users can click any column header to sort the list ascending or descending, with visual arrows indicating the current sort direction and order. A gear icon in the header row opens a dropdown menu allowing users to show or hide specific columns. The header styling matches the Items list appearance with uppercase labels and appropriate background colors.

### User Impact
Affects all users viewing the Guides list in the alternative dashboard interface. Users gain the ability to organize guide articles by title, parent item, purpose type, or creation date. Users can customize their table view by hiding columns they don't need, reducing visual clutter.

### Business Value
Improves usability and consistency across the dashboard by providing the same powerful table features users already have on the Items list. Makes it easier for users to find specific guides and manage larger collections of articles.

### Acceptance Criteria
- [ ] A table header row appears above the guide data rows with labels for each column
- [ ] Column headers include Title, Item, Purpose, and Created labels
- [ ] Clicking any column header sorts the list by that column in ascending order
- [ ] Clicking the same header again reverses the sort to descending order
- [ ] Sort direction indicators (up and down arrows) appear next to the active sort column
- [ ] A gear icon appears on the right side of the header row
- [ ] Clicking the gear icon opens a dropdown menu with column visibility toggles
- [ ] Users can show or hide individual columns through the gear menu
- [ ] Column visibility preferences persist throughout the browser session
- [ ] The header row styling matches the Items list visual design
- [ ] These changes apply only to the Guides list in the alternative dashboard interface


---

## REQ-220: Full Toolbar Infrastructure for Guides List Page

**Date**: 2026-01-13 21:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
Add a complete toolbar component to the Guides list page matching the Items list functionality, including debounced search input, view toggle between grid and list layouts, property column visibility, and purpose-based filtering.

### Current Behavior
The Guides list page displays articles in a basic list format without search capabilities, view options, or filtering controls. Users must scroll through all guides to find what they need and cannot customize the display format or filter by specific criteria.

### Expected Behavior
The Guides list page displays a toolbar above the table containing a search input field that filters guides as users type, a toggle button switching between grid tile view and list view, and filter options for purpose type and property. The search input includes a clear button to reset the filter. The toolbar matches the visual design and interaction patterns established on the Items list page.

### User Impact
Affects all users viewing guides in the alternative dashboard interface. Users gain the ability to quickly search guides by title, item name, or purpose category without scrolling. Users can switch between compact list view and visual grid view based on their preference or task context. Multi-property users can filter guides to see only those belonging to specific properties.

### Business Value
Creates consistent user experience across the dashboard by providing the same powerful navigation and display tools on both Items and Guides pages. Reduces time spent finding specific guides and improves usability when managing large guide collections.

### Acceptance Criteria
- [ ] A toolbar component appears above the Guides list matching the visual layout of the Items list toolbar
- [ ] A search input field filters visible guides as the user types with appropriate debounce delay
- [ ] The search filters by guide title, associated item name, and purpose category
- [ ] An X button inside the search input clears the search text and resets the filter
- [ ] A view toggle control switches between grid tile view and list table view
- [ ] The view toggle buttons match the design used on the Items list page
- [ ] A property column appears in the list view showing which property each guide belongs to
- [ ] The property column is hidden by default and can be shown via the column settings gear icon
- [ ] Filter dropdowns allow users to filter by purpose type when viewing guides
- [ ] Filter dropdowns allow users to filter by property when viewing guides across multiple properties
- [ ] The toolbar layout and component styling matches the Items list implementation
- [ ] These changes apply only to the Guides list at the alternative dashboard interface path

---

## REQ-221: Contextual Google OAuth Display in Registration Form

**Date**: 2026-01-13 21:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The registration form should display Google OAuth login only when relevant to the user's email address and position it prominently when available.

### Current Behavior
The "Continue with Google" button appears at the bottom of the registration form after the password fields and OR divider. It displays for all users regardless of their email domain, which can lead to authentication failures when non-Gmail users attempt OAuth registration with a different Google account.

### Expected Behavior
The "Continue with Google" button appears near the top of the form, immediately following the access code and email fields, and before the personal information section. The button and its surrounding OR divider are only visible when the access code email address ends with `@gmail.com`. For all other email domains, neither the OAuth button nor the divider appear, presenting a clean single-path registration experience.

### User Impact
Users with Gmail access codes see a more prominent OAuth option that matches their email provider, encouraging a streamlined authentication flow. Users with non-Gmail addresses see a focused form without irrelevant authentication options, preventing confusion and failed registration attempts caused by email domain mismatches.

### Business Value
Reduces registration friction for Gmail users while preventing error states for non-Gmail users, leading to higher successful registration completion rates and fewer support inquiries about email mismatch errors.

### Acceptance Criteria
- [ ] The "Continue with Google" button appears immediately after the email field and before the Full Name field
- [ ] The OAuth button is visible only when the entered email address ends with `@gmail.com`
- [ ] The OAuth button is hidden when the email address uses any other domain
- [ ] The OR divider appears only when the Google OAuth button is visible
- [ ] The OR divider is hidden when the Google OAuth button is hidden
- [ ] The visibility state updates dynamically as the user types or modifies the email field
- [ ] The layout transitions smoothly when showing or hiding the OAuth section
- [ ] Non-Gmail users see only the standard email/password registration fields
- [ ] The form maintains proper spacing and visual hierarchy in both visible and hidden states


---

## REQ-222: Radio Button Registration Method Selection for Gmail Users

**Date**: 2026-01-13 
**Type**: ENHANCEMENT
**Size**: M

### Summary
Gmail users should choose between Google OAuth or email/password registration via radio buttons, with the form dynamically showing only relevant fields based on their selection.

### Current Behavior
When a Gmail address is detected during registration, users see a "Continue with Google" button displayed above the full registration form. All form fields (Full Name, Password, Confirm Password, Terms checkbox, and Create Account button) remain visible regardless of whether the user intends to use Google OAuth or email/password registration. Non-Gmail users see only the standard registration form without any Google-related elements.

### Expected Behavior
When a user enters a Gmail address, a radio button group appears with two mutually exclusive options: "Continue with Google" (pre-selected) and "Sign up with email and password." 

When "Continue with Google" is selected, the form displays only the email address (read-only), the terms acceptance checkbox, and an enabled "Continue with Google" button. The Full Name, Password, Confirm Password fields and Create Account button are hidden.

When "Sign up with email and password" is selected, the "Continue with Google" button becomes disabled and greyed out. The form displays all standard registration fields: email (read-only), Full Name (optional), Password, Confirm Password, terms checkbox, and the Create Account button.

For non-Gmail addresses, no radio buttons or Google-related UI elements appear. Users see only the standard email/password registration form.

### User Impact
Gmail users registering new accounts will experience a cleaner, more focused interface that adapts to their chosen registration method. Users who prefer Google OAuth will see fewer irrelevant form fields, reducing cognitive load and form completion time. Users who prefer email/password registration will have a clear understanding that Google OAuth is unavailable once they make that choice. Non-Gmail users are unaffected and continue to see the familiar registration form.

### Business Value
Enhances user experience by eliminating visual clutter and decision paralysis during registration. Increases likelihood of successful Gmail user registration by presenting clear, mutually exclusive paths forward. Aligns UI state with user intent, reducing confusion about which button to click.

### Acceptance Criteria
- [ ] When a Gmail address is entered, two radio buttons appear labeled "Continue with Google" and "Sign up with email and password"
- [ ] "Continue with Google" radio button is pre-selected by default when Gmail address is detected
- [ ] When "Continue with Google" is selected, Full Name, Password, and Confirm Password fields are not visible
- [ ] When "Continue with Google" is selected, the "Continue with Google" button is enabled only after terms are accepted
- [ ] When "Continue with Google" is selected, the Create Account button is not visible
- [ ] When "Sign up with email and password" is selected, all standard form fields become visible
- [ ] When "Sign up with email and password" is selected, the "Continue with Google" button is disabled and visually greyed out
- [ ] When the email is changed from Gmail to non-Gmail, the radio buttons and all Google-related UI disappear
- [ ] When the email is changed from non-Gmail to Gmail, the radio buttons appear with "Continue with Google" pre-selected
- [ ] Non-Gmail addresses never trigger the display of radio buttons or Google OAuth UI


---

## REQ-223: Localization Database Foundation Schema

**Date**: 2026-01-17 10:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should support multi-language translation capabilities by establishing a database schema that stores translations for articles, items, links, tags, and tracks translation job metadata.

### Current Behavior
The application stores content in a single language without any translation or localization infrastructure. Content is displayed in the language it was originally created in, with no mechanism to present alternative language versions to users based on their preferences or location.

### Expected Behavior
A comprehensive database schema exists to support multi-language content across the platform. When content is created, it can be associated with translations in multiple target languages. Translation metadata tracks which content has been translated, into which languages, and by what method (manual, automated, or hybrid). The schema supports efficient lookups of translated content by language code and maintains referential integrity between original content and its translations.

### User Impact
Property owners creating content will eventually be able to provide translated versions of their guides, item descriptions, links, and tags to serve international guests. Guests viewing content will ultimately receive information in their preferred language. This foundational schema enables all future localization features without requiring costly database restructuring later.

### Business Value
Establishes the technical foundation for international expansion and multi-language guest support. Prevents future migration costs by implementing proper translation architecture from the start. Enables phased rollout of localization features by providing stable, well-indexed data structures.

### Acceptance Criteria
- [ ] A migration file creates five translation-related tables: article_translations, item_translations, link_translations, tag_translations, and translation_jobs
- [ ] Each translation table references its source entity and includes language_code, translated content fields, and timestamps
- [ ] The translation_jobs table tracks metadata about translation requests including status, source/target languages, and translation method
- [ ] Database indexes are created on language_code columns for efficient query performance
- [ ] Database indexes are created on foreign key columns to optimize lookup of translations for specific content
- [ ] The migration can be applied successfully to both local development and staging environments
- [ ] The migration is reversible with a proper rollback script that removes all created tables and indexes

---

## REQ-224: Track Original Language for Content Items

**Date**: 2026-01-17 14:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
The system must track the original language in which content was created for items, item articles, and item links.

### Current Behavior
Content tables store multilingual data without indicating which language version is the original source. When content exists in multiple languages, there is no way to identify which language the content was originally authored in.

### Expected Behavior
Each content record maintains a reference to its source language. When viewing or processing content in the system, users can identify which language version is the authoritative original. New content defaults to English as the source language, while the system preserves this information for all existing records.

### User Impact
Content managers and administrators gain visibility into which language version is the original, enabling better translation workflows and content governance. This affects anyone who manages multilingual content or needs to understand the provenance of translated materials.

### Business Value
Proper source language tracking enables efficient translation workflows and ensures content quality by clearly identifying authoritative source versions versus translations.

### Acceptance Criteria
- [ ] Items table records indicate their source language
- [ ] Item articles table records indicate their source language
- [ ] Item links table records indicate their source language
- [ ] All existing records show English as their source language
- [ ] New records can specify any valid language code as their source language


---

## REQ-225: User and Account Language Preference Storage

**Date**: 2026-01-17 12:00
**Type**: ENHANCEMENT
**Size**: S

### Summary
The system should store each user's and account's preferred display language so that the application can present content in the language they are most comfortable with.

### Current Behavior
The database does not capture or persist language preferences for users or accounts. When users interact with the application, there is no mechanism to remember their preferred language for subsequent visits or sessions.

### Expected Behavior
Each user and account has a stored language preference that defaults to English when no selection has been made. When a user or account selects their preferred language through the application interface, that preference is persisted and applied consistently across all future interactions until changed.

### User Impact
Users with language preferences other than English will be able to set their preferred language once and have it remembered. Account-level language settings will allow property management teams to establish a default language for their organization that applies to all team members unless individually overridden.

### Business Value
Supporting stored language preferences is foundational to delivering a truly localized user experience, expanding the application's accessibility to international markets and non-English-speaking users. This infrastructure enables future localization features and demonstrates commitment to global usability.

### Acceptance Criteria
- [ ] Each user record includes a language preference field with a default value of English
- [ ] Each account record includes a language preference field with a default value of English
- [ ] Language preference values follow standard language codes for consistency and interoperability
- [ ] Existing user and account records automatically receive the default language value during migration
- [ ] The database schema change is reversible without data loss


---

## REQ-226: Translation Table Access Control Policies

**Date**: 2026-01-17 11:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should only be able to view and modify translations for content they are authorized to access, while automated background processes can perform translation operations without restriction.

### Current Behavior
Translation tables exist without access control policies, allowing unrestricted read and write access to all authenticated users regardless of their relationship to the underlying content.

### Expected Behavior
- Users can view translations only for content they have permission to view
- Users can create or modify translations only for content they own
- Automated translation services can read and write all translation records to perform background translation jobs
- Unauthorized users attempting to access translation data receive appropriate access denial responses

### User Impact
Content owners are protected from unauthorized users viewing or modifying their translated content. Users searching or browsing listings see only translations for content they are permitted to access. Background translation processes continue to operate normally for all content.

### Business Value
Ensures translation data respects the same privacy and authorization boundaries as the source content, maintaining data security and user trust in the platform.

### Acceptance Criteria
- [ ] Users can read translation records when they have read access to the corresponding source content
- [ ] Users can create and update translation records when they own the corresponding source content
- [ ] Service role accounts can read and write all translation records without restriction
- [ ] Users without content access permissions cannot read or write associated translation records
- [ ] Policy enforcement applies consistently across all translation tables in the system


---

## REQ-227: TypeScript Type Definitions for Translation Tables

**Date**: 2026-01-17 14:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
The application's TypeScript type definitions must include all newly created translation-related database tables to provide type safety and autocomplete support.

### Current Behavior
The TypeScript database type definitions do not include the translation table structures that were recently added to the database schema.

### Expected Behavior
Developers working with translation tables receive full TypeScript IntelliSense, type checking, and autocomplete when querying or manipulating translation data. The type system prevents runtime errors from incorrect column names or data structures.

### User Impact
Developers building localization features will have improved productivity through better IDE support and catch type-related errors at compile time rather than runtime.

### Business Value
Reduces development time and prevents bugs by ensuring type safety across the translation system, enabling faster and more reliable delivery of multilingual features.

### Acceptance Criteria
- [ ] TypeScript type definitions exist for all translation-related database tables
- [ ] Type definitions accurately reflect the database schema including column names, data types, and relationships
- [ ] Developers can query translation tables with full type inference and autocomplete support
- [ ] TypeScript compiler catches mismatched types when interacting with translation tables


---

## REQ-228: System Tag Translation Data Seeding

**Date**: 2026-01-17 23:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system must be pre-populated with standard room and appliance tag translations across all supported languages to provide immediate multilingual support for common property features.

### Current Behavior
The translation tables exist but contain no data, requiring property owners to manually create translations for standard tags that are used across most properties.

### Expected Behavior
When the system initializes, standard tags for room types and appliance types are already available in all supported languages. Property owners selecting common rooms or appliances see properly translated labels immediately based on their language preference.

### User Impact
Property owners and guests experience a fully localized interface from the first interaction with standard property features. Owners save time by not having to translate common terms that apply universally across properties.

### Business Value
Accelerates platform adoption by eliminating setup friction for international users and demonstrates professional multilingual support from day one, enhancing credibility in global markets.

### Acceptance Criteria
- [ ] Standard room type tags are available in all supported languages
- [ ] Standard appliance type tags are available in all supported languages
- [ ] Translations are semantically accurate and culturally appropriate for each language
- [ ] System can identify which tags are system-defined versus user-created
- [ ] Seed data operation is idempotent and can be safely run multiple times

---

## REQ-229: Install and Configure Internationalization Framework

**Date**: 2026-01-17 09:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The application should support multiple languages by integrating an internationalization framework that manages translations for all static user interface text.

### Current Behavior
The application displays all user interface text in a single language without support for translations or locale switching.

### Expected Behavior
The application is configured with an internationalization framework that:
- Supports six different language locales
- Provides a centralized location for all translated strings
- Enables runtime language switching for users
- Maintains consistent translation structure across the application

### User Impact
This foundation enables users to view the application interface in their preferred language, improving accessibility for non-English speakers and setting the stage for full multilingual support.

### Business Value
Expands market reach by making the application accessible to international users and demonstrates commitment to global audience support.

### Acceptance Criteria
- [ ] Internationalization library is installed as a project dependency
- [ ] Translation message files exist for all six supported locales
- [ ] Framework is configured to recognize and load translations for each locale
- [ ] Application can be initialized with any of the six supported languages
- [ ] Translation file structure is consistent and follows framework conventions

---

## REQ-230: Centralized Locale Configuration and Server-Side Locale Detection

**Date**: 2026-01-17 17:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The application should provide a centralized configuration module that defines all supported locales and implements server-side logic to automatically detect the appropriate language for each user request.

### Current Behavior
The application lacks a unified definition of supported languages and has no mechanism to determine which language should be displayed when users access the system.

### Expected Behavior
The system maintains a single source of truth for supported locales and default language settings. When any server request is processed, the system automatically determines the appropriate locale by examining user preferences, browser settings, or falling back to the configured default language. This detected locale is then available throughout the request lifecycle for rendering appropriately localized content.

### User Impact
Users see content in their preferred language immediately upon accessing the application without manual configuration. The experience feels native and personalized based on their browser settings or stored preferences.

### Business Value
Reduces implementation complexity by centralizing locale logic and ensures consistent language detection behavior across all server-rendered pages and API responses.

### Acceptance Criteria
- [ ] A configuration module exists that lists all supported locale codes
- [ ] A default locale is explicitly defined in the configuration
- [ ] Server-side request handling includes locale detection logic
- [ ] Locale detection considers user account preferences if authenticated
- [ ] Locale detection falls back to browser Accept-Language headers for unauthenticated requests
- [ ] The detected locale is accessible throughout the server request processing pipeline
- [ ] Configuration can be imported and reused across different parts of the application


---

## REQ-231: Configure Next.js Application for Internationalization Support

**Date**: 2026-01-18 14:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
The application must be configured to enable internationalization capabilities through framework-level settings that support locale detection and language routing.

### Current Behavior
The application runs with a default single-language configuration without any locale detection, language routing, or internationalization middleware enabled at the framework level.

### Expected Behavior
When users access the application, the system automatically detects their preferred language and routes them to the appropriate localized version of the site. The application configuration enables language-aware routing patterns and locale-based content delivery.

### User Impact
All application users will benefit from automatic language detection based on their browser preferences or explicit language selections. This creates the foundation for users to interact with the application in their preferred language without manual configuration steps.

### Business Value
Establishing framework-level internationalization support is a prerequisite for delivering a multilingual user experience, enabling market expansion to non-English speaking regions and improving user satisfaction through localized interfaces.

### Acceptance Criteria
- [ ] Application configuration includes internationalization plugin integration
- [ ] Locale detection activates automatically when users access the application
- [ ] Language preferences from browser settings are recognized and respected
- [ ] Framework routing supports locale-prefixed URL patterns
- [ ] Configuration changes do not break existing single-language functionality during transition

---

## REQ-232: Application-Wide Translation Context Provider Integration

**Date**: 2026-01-18 14:35
**Type**: ENHANCEMENT
**Size**: S

### Summary
The application root must provide translation context to all client-side components, enabling them to access localized strings and formatting utilities throughout the component tree.

### Current Behavior
Client components in the application have no access to translation functionality. Each component would need to independently manage language preferences and translation lookups, leading to inconsistent localization implementation and redundant code.

### Expected Behavior
When the application initializes, a translation provider automatically wraps all client components, making translation utilities and localized strings immediately available to any component that needs them. Components can access translations through simple function calls without needing to manage language state or configuration.

### User Impact
End users will experience consistent language presentation across all interactive elements of the application. Components that display dynamic text, format dates, numbers, or currencies will automatically respect the user's language preference.

### Business Value
This establishes the runtime infrastructure required for client-side internationalization, enabling interactive components to display localized content and ensuring a cohesive multilingual user experience across the entire application.

### Acceptance Criteria
- [ ] All client-side components have access to translation functionality without explicit setup
- [ ] Language preference changes propagate automatically to all components
- [ ] Translation context includes both message strings and formatting utilities
- [ ] Server-rendered and client-rendered content use consistent locale settings
- [ ] Application continues to function normally for users with single-language preference


---

## REQ-233: Initial Translation File Structure with Namespace Organization

**Date**: 2026-01-18 
**Type**: NEW FEATURE
**Size**: S

### Summary
The system shall provide a structured set of translation files organized by functional namespaces to support multiple language locales.

### Current Behavior
No translation files exist in the application. All user-facing text is hardcoded in the source code, making internationalization impossible.

### Expected Behavior
Translation files are created with a clear namespace structure that separates concerns (common UI elements, authentication flows, dashboard content, item management, and error messages). An English baseline translation file is fully structured, and placeholder files for additional locales are present to facilitate future translation work.

### User Impact
This foundational structure enables translators and content managers to provide localized experiences for users in different languages. Developers can reference translations by namespace and key rather than embedding text directly in components.

### Business Value
Establishes the foundation for serving international users by creating a scalable translation architecture that supports rapid addition of new languages without code changes.

### Acceptance Criteria
- [ ] An English translation file exists with all five namespaces defined (common, auth, dashboard, items, errors)
- [ ] Each namespace contains at least one sample translation key to demonstrate structure
- [ ] Stub translation files for at least two additional locales are present and follow the same namespace structure
- [ ] The translation file structure is documented so developers and translators understand the organization pattern
- [ ] Translation files are located in a standard directory that the i18n framework can discover automatically



---

## REQ-234: Translation Function Integration Verification

**Date**: 2026-01-18 11:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
The system shall demonstrate successful translation integration by updating an existing component to use the translation function and verifying development workflow functions correctly.

### Current Behavior
Components in the application use hardcoded text strings. No components currently demonstrate the integration of the translation framework, and developers have no working example to reference when implementing translations in other components.

### Expected Behavior
At least one existing component retrieves its displayed text through the translation function rather than hardcoded strings. When developers modify translation files during development, changes appear immediately in the running application without requiring a manual restart, confirming that the development workflow supports efficient translation work.

### User Impact
Developers implementing translations in other components can reference a working example. The improved development workflow allows translators and developers to see translation changes instantly, speeding up the localization process.

### Business Value
Validates that the translation framework integration is functional and developer-friendly. Provides a confidence checkpoint before proceeding with broader translation implementation across the application.

### Acceptance Criteria
- [ ] One component that previously displayed hardcoded text now retrieves text through translation functions
- [ ] The component displays correctly with translated content from the default locale
- [ ] Modifying the translation file for the component's text results in the change appearing in the browser without manual server restart
- [ ] The selected component serves as a clear, documented reference example for other developers
- [ ] No functionality or user experience regressions occur in the updated component



---

## REQ-235: Translation Service Module Infrastructure

**Date**: 2026-01-18 20:15
**Type**: NEW FEATURE
**Size**: M

### Summary
The application shall provide a dedicated translation service module with comprehensive type definitions to support dynamic content translation across the system.

### Current Behavior
The application lacks infrastructure for translating dynamic content stored in the database. While static UI elements can be translated through the internationalization framework, user-generated content such as property descriptions, item names, room labels, and guide instructions cannot be presented in different languages.

### Expected Behavior
A translation service module exists as a centralized location for all translation-related utilities, hooks, and type definitions. The module provides well-defined TypeScript interfaces that describe translation data structures, service contracts, and API interactions. Developers can import translation utilities from a single, predictable location rather than scattering translation logic throughout the codebase.

### User Impact
Users will eventually be able to view dynamic content (property descriptions, item names, instructions) in their preferred language. Property owners will gain the ability to provide multilingual versions of their content, making properties accessible to international guests.

### Business Value
Establishes the architectural foundation for dynamic content translation, enabling the platform to serve international markets and allowing property owners to reach guests who speak different languages. This infrastructure supports future translation features without requiring major refactoring.

### Acceptance Criteria
- [ ] A translation service directory exists with a clear, organized structure
- [ ] Type definition files describe all translation-related data structures
- [ ] TypeScript interfaces define contracts for translation service operations
- [ ] The module structure supports future expansion without breaking existing integrations
- [ ] Type definitions align with the translation database schema and API requirements


---

## REQ-236: AI-Powered Translation Provider with Domain Context

**Date**: 2026-01-18 10:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide automated translation of content using an AI translation service that understands the vacation rental domain and can maintain consistent terminology across all translated content.

### Current Behavior
No automated translation capability exists. Content must be manually translated by users or remain in the original language only.

### Expected Behavior
When translation is requested, the system automatically translates content using an AI service that:
- Understands vacation rental terminology (e.g., "check-in", "amenities", "house rules")
- Maintains consistent translation of domain-specific terms across all content
- Respects usage limits to prevent service interruptions
- Handles authentication securely without exposing credentials to end users
- Provides appropriate error messages when translation is unavailable

### User Impact
Property owners and managers can offer their listings, FAQs, and guest communications in multiple languages without manual translation work. Guests receive accurate, contextually appropriate translations that use proper vacation rental terminology.

### Business Value
Enables multi-language support at scale without requiring multilingual staff or expensive human translation services. Improves guest experience for international travelers and expands market reach for property owners.

### Acceptance Criteria
- [ ] System successfully authenticates with the translation service using secure credentials
- [ ] Translations incorporate vacation rental domain context to ensure appropriate terminology
- [ ] System respects rate limits and prevents service overuse
- [ ] When rate limits are approached or exceeded, users receive clear feedback
- [ ] Translation requests that fail return meaningful error messages to the user
- [ ] Credentials and API keys are never exposed in client-side code or responses


---

## REQ-237: Alternative AI Translation Provider for Service Resilience

**Date**: 2026-01-18 21:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system shall provide an alternative AI-powered translation service that maintains translation availability when the primary translation service is unavailable or experiences issues.

### Current Behavior
Translation capability depends entirely on a single AI service provider. When that service experiences downtime, rate limiting, or API changes, all translation functionality becomes unavailable to users with no fallback mechanism.

### Expected Behavior
When the primary translation service fails or is unavailable, the system automatically attempts translation using an alternative AI service. The fallback service:
- Implements the same interface as the primary provider for seamless integration
- Understands vacation rental terminology and context
- Activates transparently without user intervention when the primary service fails
- Maintains translation quality standards comparable to the primary service
- Handles its own authentication, rate limiting, and error conditions independently

### User Impact
Users experience uninterrupted translation services even when individual AI providers face technical issues. Property owners can reliably offer multilingual content without worrying about service outages affecting guest experiences.

### Business Value
Increases platform reliability and reduces risk of translation service disruptions that could impact guest satisfaction or property owner productivity. Provides negotiating leverage with AI service providers and allows the platform to automatically route to the most cost-effective provider based on usage patterns.

### Acceptance Criteria
- [ ] Alternative translation service integrates seamlessly with existing translation architecture
- [ ] Both translation providers implement identical interface contracts for consistent behavior
- [ ] System automatically switches to fallback provider when primary service fails
- [ ] Translation quality from fallback provider meets minimum accuracy standards
- [ ] Fallback provider handles vacation rental terminology appropriately
- [ ] Each provider manages its own authentication and rate limiting independently
- [ ] System logs which provider was used for each translation request for monitoring purposes


---

## REQ-238: Translation Service Rate Limiting

**Date**: 2026-01-18 10:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should enforce configurable rate limits when calling external translation providers to prevent service disruptions and quota exhaustion.

### Current Behavior
No rate limiting mechanism exists for translation API calls, which could result in:
- Exceeding provider rate limits and receiving error responses
- Exhausted API quotas before critical translations complete
- Service degradation when translation demand spikes

### Expected Behavior
The system automatically controls the frequency of translation requests to external providers based on configurable thresholds. When limits are approached, requests are queued or delayed rather than rejected. Different providers can have different rate limits configured independently.

### User Impact
Property owners experience more reliable translation service availability, especially during high-demand periods such as listing updates or bulk content changes. Translation requests complete successfully without interruption from rate limit errors.

### Business Value
Prevents service outages and ensures efficient use of paid API quotas by smoothing request patterns and avoiding provider throttling.

### Acceptance Criteria
- [ ] Translation requests are automatically throttled when configured rate limits are approached
- [ ] Each translation provider can have independently configured rate limits
- [ ] Rate limit configuration can be adjusted without code changes
- [ ] Requests exceeding rate limits are queued rather than immediately rejected
- [ ] System continues to function normally when rate limits are not being approached


---

## REQ-239: Translation Service Retry Logic with Exponential Backoff

**Date**: 2026-01-18 11:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The translation service should automatically retry failed translation requests using exponential backoff with jitter to handle transient failures gracefully.

### Current Behavior
Translation requests fail immediately when external translation providers experience temporary issues such as network timeouts, rate limit rejections, or service unavailability.

### Expected Behavior
When a translation request fails due to a transient error, the system should automatically retry up to three times with increasing delays between attempts. Each retry delay should include a random jitter component to prevent multiple clients from retrying simultaneously.

### User Impact
Property owners and guests experience more reliable translations even during periods of provider instability or network issues. Translation failures are reduced significantly without requiring manual intervention or page refreshes.

### Business Value
Improves service reliability and user experience by masking transient failures from external dependencies. Reduces support burden from translation-related issues.

### Acceptance Criteria
- [ ] Failed translation requests are automatically retried up to three times
- [ ] Delay between retries increases exponentially with each attempt
- [ ] Random jitter is added to retry delays to prevent synchronized retry storms
- [ ] Retry logic distinguishes between retryable errors (timeouts, 5xx) and permanent failures (4xx client errors)
- [ ] After all retries are exhausted, the original error is surfaced to the caller
- [ ] Retry attempts and outcomes are logged for observability

---

## REQ-240: Unified Translation Service Interface

**Date**: 2026-01-18 11:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The application should provide a unified translation service interface that handles individual text translations and batch translations to all supported languages while managing provider selection and fallback behavior.

### Current Behavior
Translation providers exist independently without a coordinated service layer. Callers must directly interact with specific translation providers and manually implement provider selection, fallback logic, and batch translation operations.

### Expected Behavior
Users and systems can request text translations through a single service interface that transparently selects the appropriate provider based on configuration, handles provider failures gracefully by falling back to alternative providers, and supports both single-language and multi-language batch translation operations.

### User Impact
Developers implementing multilingual features experience a simplified integration pattern with automatic provider management. Property owners and guests benefit from more reliable translations due to automatic provider fallback when the primary service encounters issues.

### Business Value
Accelerates feature development by providing a consistent translation interface. Improves system reliability through automatic provider failover. Enables centralized monitoring and control of all translation operations.

### Acceptance Criteria
- [ ] A single function translates text from one language to another language
- [ ] A batch function translates text to all supported application languages in one operation
- [ ] The service selects the translation provider based on environment configuration settings
- [ ] When the primary provider fails, the service automatically attempts translation using the fallback provider
- [ ] Translation requests include appropriate rate limiting and retry logic from underlying utilities
- [ ] The service maintains consistent error handling and logging across all translation operations
- [ ] Batch translations return results in a structured format mapping each target language to its translated text


---

## REQ-241: Translation Service Environment Configuration

**Date**: 2026-01-18 00:00
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The system must provide documented environment variables for configuring translation service providers and API credentials.

### Current Behavior
No environment configuration exists for translation service integration. Developers have no reference for required API keys or provider selection.

### Expected Behavior
The system provides a template configuration file showing all required environment variables for translation services, including provider selection and API credentials for supported translation providers.

### User Impact
Developers and DevOps teams can properly configure translation services across different environments (development, staging, production) with clear documentation of required credentials and configuration options.

### Business Value
Enables secure configuration management for translation services, supporting the L10N initiative's Phase 3 infrastructure by establishing clear deployment requirements.

### Acceptance Criteria
- [ ] Configuration template includes translation provider selection variable
- [ ] Configuration template includes Anthropic API credential variable
- [ ] Configuration template includes OpenAI API credential variable
- [ ] All new variables include descriptive comments explaining their purpose and valid values


---

## REQ-242: Admin Translation Testing Interface

**Date**: 2026-01-18 09:15
**Type**: NEW FEATURE
**Size**: S

### Summary
Administrators need a way to manually test translation functionality by submitting text and receiving translations without deploying to production.

### Current Behavior
There is no way for administrators to test the translation service in isolation. Testing translations requires running them through the full application workflow, making it difficult to debug translation issues or verify service configuration.

### Expected Behavior
Administrators can access a dedicated endpoint where they can submit text in a source language and receive translations in target languages. The response includes the translated text along with metadata about which translation provider was used and any relevant diagnostics.

### User Impact
Platform administrators and developers gain the ability to quickly verify translation service health, test new language pairs, debug translation quality issues, and validate configuration changes before they affect end users.

### Business Value
Reduces time spent debugging translation problems and increases confidence in the translation system, allowing faster rollout of new languages and quicker resolution of translation-related issues.

### Acceptance Criteria
- [ ] Only authenticated administrators can access the translation testing endpoint
- [ ] Administrators can specify source text, source language, and target language(s)
- [ ] The response includes the translated text for each requested target language
- [ ] The response indicates which translation provider handled the request
- [ ] Unauthorized users receive an appropriate error when attempting to access the endpoint
- [ ] The endpoint handles errors gracefully and returns informative messages when translation fails


---

## REQ-243: Translation Job Queue Module for Background Processing

**Date**: 2026-01-18 12:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must support asynchronous translation processing through a job queue that manages translation tasks, tracks their lifecycle status, and prevents concurrent processing of the same job.

### Current Behavior
Translation operations are processed synchronously during user requests, causing delays in response times and potential timeout issues when translating large content volumes. There is no mechanism to defer translation work to background processes or retry failed translations without user intervention.

### Current Behavior
Users experience delays when creating or updating content that requires translation, particularly when multiple languages are involved. Large translation batches may fail due to request timeouts, and there is no visibility into translation progress or ability to resume interrupted translation work.

### Expected Behavior
When content requires translation, the system creates job entries in a persistent queue with a pending status. Background workers fetch jobs from the queue with proper locking to ensure only one worker processes each job at a time. As jobs are processed, their status progresses through defined states (pending, processing, completed, failed). Users receive immediate confirmation that translation has been queued rather than waiting for completion.

### User Impact
Property owners experience faster response times when creating or updating content, as they no longer wait for translations to complete. Content editors can monitor translation progress through status indicators. Failed translations can be automatically retried without requiring user action, improving overall reliability.

### Business Value
Improves application responsiveness and scalability by decoupling translation work from user requests. Enables reliable processing of high-volume translation workloads. Provides foundation for future enhancements like batch translation scheduling and translation progress monitoring.

### Acceptance Criteria
- [ ] New translation jobs can be inserted into the queue with metadata identifying the content to translate
- [ ] Each job tracks its current status using well-defined states (pending, processing, completed, failed)
- [ ] Jobs can be updated to reflect status changes as they progress through the queue
- [ ] Workers can fetch the next available pending job using a locking mechanism
- [ ] The locking mechanism prevents two workers from processing the same job simultaneously
- [ ] Jobs that fail during processing can be marked as failed with error details preserved
- [ ] The queue supports filtering jobs by status to enable monitoring and reporting
- [ ] Job records include timestamps tracking when they were created, started, and completed


---

## REQ-244: Background Job Processor for Translation Queue

**Date**: 2026-01-18 22:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should automatically process queued translation jobs in the background at regular intervals and update content with completed translations.

### Current Behavior
Translation jobs are queued but there is no automated mechanism to process them. Jobs remain in 'queued' status indefinitely without manual intervention.

### Expected Behavior
The system should:
- Continuously monitor for new translation jobs that need processing
- Automatically pick up queued jobs and translate the content using the configured translation service
- Process jobs one at a time to avoid overwhelming external services
- Update the translated content in the appropriate location once translation completes
- Record whether each job succeeded or failed, along with relevant diagnostic information
- Allow administrators to configure how frequently the system checks for new jobs

### User Impact
**Property Owners** will see their content automatically translated after submission without needing to manually trigger or monitor the process. Translation happens reliably in the background.

**System Administrators** can tune the processing frequency based on translation volume and API rate limits.

### Business Value
Enables hands-free, reliable translation workflow that scales with content volume while respecting external API constraints. Reduces operational overhead and improves user experience by automating the translation pipeline.

### Acceptance Criteria
- [ ] System checks for queued translation jobs at a configurable time interval
- [ ] Only one translation job is processed at a time
- [ ] When a job completes successfully, the translated content appears in the correct location for that content type (property details, listing information, FAQ entries, or system labels)
- [ ] Job status updates to 'completed' when translation succeeds
- [ ] Job status updates to 'failed' when translation fails, with diagnostic information recorded
- [ ] Processing interval can be configured without code changes
- [ ] System continues processing subsequent jobs even if one job fails


---

## REQ-245: Admin API Endpoint for Translation Job Processing

**Date**: 2026-01-18 10:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Administrators need an API endpoint to trigger on-demand translation job processing and receive processing statistics.

### Current Behavior
No mechanism exists to manually trigger translation job processing or retrieve processing metrics via API.

### Expected Behavior
The system provides an authenticated admin endpoint that:
- Triggers the translation job processor to run
- Returns statistics about the processing session including total jobs processed, successful completions, and failures
- Can be invoked by external schedulers or monitoring systems

### User Impact
System administrators and DevOps personnel can monitor translation processing health, manually trigger processing when needed, and integrate with external scheduling systems without direct database access.

### Business Value
Enables operational visibility into translation processing and provides flexibility for both automated scheduling and manual intervention during critical periods.

### Acceptance Criteria
- [ ] Endpoint requires admin-level authentication before processing
- [ ] Single invocation triggers one processing cycle of pending translation jobs
- [ ] Response includes count of jobs processed in this cycle
- [ ] Response includes count of successful translations
- [ ] Response includes count of failed translations
- [ ] Response includes total processing time
- [ ] Endpoint can be called repeatedly without adverse effects
- [ ] Failed job processing does not prevent statistics from being returned
- [ ] Endpoint is suitable for periodic invocation by cron or similar schedulers


---

## REQ-246: Admin Job Status Query API Endpoint

**Date**: 2026-01-18 
**Type**: NEW FEATURE
**Size**: M

### Summary
Administrators should be able to query translation jobs by status and entity type to monitor system health and debug issues.

### Current Behavior
There is no API endpoint for administrators to view and filter translation job details.

### Expected Behavior
Administrators can retrieve a list of translation jobs filtered by their current status (pending, processing, completed, failed) and by entity type (property, FAQ, etc.), with sufficient detail for monitoring and troubleshooting purposes.

### User Impact
System administrators and support teams gain visibility into the translation job queue, allowing them to identify bottlenecks, track progress, investigate failures, and verify successful completions.

### Business Value
Provides operational visibility into the translation system, enabling proactive issue detection and faster resolution of translation-related problems.

### Acceptance Criteria
- [ ] Administrators can retrieve a list of all translation jobs
- [ ] Results can be filtered by job status (pending, processing, completed, failed)
- [ ] Results can be filtered by entity type (property, FAQ, etc.)
- [ ] Each job record includes sufficient detail for debugging (job ID, status, timestamps, entity reference, error messages if applicable)
- [ ] The endpoint is restricted to authenticated administrators only
- [ ] Query results are paginated to handle large job volumes


---

## REQ-247: Middleware Language Context and Cookie Management

**Date**: 2026-01-18 17:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The application middleware should automatically detect, apply, and persist user language preferences across all requests.

### Current Behavior
The middleware does not read or set language preferences from request cookies, meaning user language selections are not maintained across page navigations or sessions.

### Expected Behavior
When a user navigates through the application:
- Their previously selected language preference is automatically detected and applied to each request
- Language changes made by the user are immediately persisted and available on subsequent requests
- The language context is consistently available throughout the request lifecycle

### User Impact
All users (guests and property owners) will benefit from persistent language preferences. Once a user selects their preferred language, it will remain active across all pages and future visits without requiring re-selection.

### Business Value
Improves user experience by eliminating the need to repeatedly select language preferences and ensures consistent localization throughout the user journey.

### Acceptance Criteria
- [ ] User's language preference is detected from cookies on each incoming request
- [ ] Language context is available to all downstream request handlers and page components
- [ ] When a user changes their language preference, the new selection is written to cookies
- [ ] Language preference persists across browser sessions
- [ ] Default language is applied when no preference cookie exists



---

## REQ-248: Language Selection Dropdown

**Date**: 2026-01-18 18:12
**Type**: NEW FEATURE
**Size**: M

### Summary
Users should be able to select their preferred display language from a dropdown menu showing all supported languages in their native names.

### Current Behavior
No interface element exists for users to change the application's display language.

### Expected Behavior
A language selection control is accessible from the application interface, displaying all six supported languages using their native language names (e.g., "Deutsch" for German, "Français" for French). When a user selects a language:
- The application interface immediately reflects the new language choice
- For authenticated users, the preference is stored with their user profile
- For guest users, the preference is stored locally to persist across sessions

### User Impact
All users, whether authenticated or browsing as guests, can view and interact with the application in their preferred language. The selection persists between visits, eliminating the need to repeatedly set language preferences.

### Business Value
Enables a truly multilingual user experience, increasing accessibility for international property owners and guests. Demonstrates commitment to serving a global audience and removes language barriers to platform adoption.

### Acceptance Criteria
- [ ] A dropdown control displays all six supported languages
- [ ] Each language is shown using its native name (not English translations)
- [ ] Selecting a language immediately updates the application's display language
- [ ] For authenticated users, language preference is saved to their user account
- [ ] For guest users, language preference is saved to browser storage
- [ ] The user's last selected language is automatically applied when they return to the application
- [ ] The language selector is accessible from all major pages in the application

---

## REQ-249: Language Preference Management Hook

**Date**: 2026-01-18 18:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Components should be able to access and update the user's language preference through a centralized hook that manages persistence across both authenticated and guest user sessions.

### Current Behavior
No standardized mechanism exists for components to read or update language preferences, leading to potential inconsistency in how language settings are managed throughout the application.

### Expected Behavior
Components can import and use a hook that provides:
- The current active language preference
- A function to update the language preference
- Loading states while the preference is being retrieved or saved
- Error states if preference operations fail

The hook automatically handles different persistence strategies based on user authentication status (database for authenticated users, browser storage for guests) and synchronizes the preference with the application's internationalization system.

### User Impact
Both authenticated users and guests experience consistent language preference handling throughout the application. Language selections persist appropriately for their session type, and all UI components reflect preference changes immediately.

### Business Value
Provides a maintainable, centralized approach to language preference management that reduces code duplication and ensures consistent behavior across all features requiring language selection.

### Acceptance Criteria
- [ ] Hook exposes the current language preference value
- [ ] Hook exposes a function to update the language preference
- [ ] For authenticated users, preference changes are saved to the user profile database
- [ ] For guest users, preference changes are saved to browser local storage
- [ ] Hook provides a loading state indicator during async operations
- [ ] Hook provides error state and error message information for failed operations
- [ ] Preference updates trigger re-renders in consuming components
- [ ] The hook initializes preference from the appropriate source based on authentication status
- [ ] The hook falls back to browser locale detection when no stored preference exists

---

## REQ-250: Application-Specific Locale Context Wrapper

**Date**: 2026-01-18 00:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
The application should provide a React context layer that wraps the internationalization framework with application-specific locale management logic.

### Current Behavior
Components interact directly with the internationalization framework for locale operations, requiring each to implement persistence, authentication integration, and state management independently.

### Expected Behavior
Components access locale functionality through a unified context that automatically handles language preference persistence, synchronizes with user profiles for authenticated users, manages browser storage for anonymous users, and provides a clean API for all locale-related operations.

### User Impact
Both authenticated and anonymous users benefit from seamless language preference persistence. Authenticated users have their language selection saved to their profile and synchronized across devices. Anonymous users have their selection preserved in browser storage for future visits.

### Business Value
Creates a maintainable abstraction layer that encapsulates all locale-related business logic in one location, reducing coupling to specific internationalization libraries and ensuring consistent behavior across the entire application.

### Acceptance Criteria
- [ ] Context exposes the current active locale
- [ ] Context exposes the list of available locales for the application
- [ ] Context provides a function to switch between available locales
- [ ] For authenticated users, locale changes are persisted to the user profile in the database
- [ ] For anonymous users, locale changes are persisted to browser local storage
- [ ] Context integrates with the existing authentication system to determine user status
- [ ] Context provides helper methods for common locale operations
- [ ] Context prevents direct component dependency on the underlying internationalization framework
- [ ] Locale switching triggers appropriate re-renders throughout the component tree
- [ ] Context handles loading and error states for persistence operations

---

## REQ-251: User Language Preference Update Endpoint

**Date**: 2026-01-18 
**Type**: NEW FEATURE
**Size**: S

### Summary
Authenticated users should be able to update their preferred language setting through an API endpoint.

### Current Behavior
There is no mechanism for users to persist their language preference to their profile.

### Expected Behavior
When a user selects a different language, their preference is saved and persists across sessions and devices. The next time they log in from any device, the application displays in their preferred language.

### User Impact
All authenticated users who wish to use the application in a language other than the default will benefit. This particularly impacts multilingual users and users whose native language differs from the application default.

### Business Value
Enabling persistent language preferences improves user experience by respecting user choice and reducing friction in international markets. Users no longer need to manually switch languages on every visit.

### Acceptance Criteria
- [ ] An authenticated user can submit a request to change their language preference
- [ ] The submitted language preference is validated against supported languages
- [ ] Successfully updated preferences are reflected immediately in subsequent requests
- [ ] Unauthenticated requests are rejected with appropriate status code
- [ ] Invalid language codes are rejected with clear error messaging
- [ ] The preference persists across user sessions and devices


---

## REQ-252: Integrate Language Switcher into Application Navigation

**Date**: 2026-01-18 00:00
**Type**: ENHANCEMENT
**Size**: S

### Summary
Users should be able to access the language switching control from the main navigation areas of the application, including the authenticated dashboard and public-facing pages.

### Current Behavior
The language switching component exists but is not integrated into any navigation areas, making it inaccessible to users who need to change their language preference.

### Expected Behavior
- Authenticated users see a language switcher control in the dashboard header navigation
- Visitors on public-facing pages can optionally access language switching from the public navigation
- The language switcher appears consistently in its designated location across all relevant pages
- Switching languages updates the entire interface immediately without requiring page navigation

### User Impact
All users (both authenticated and unauthenticated) gain the ability to change their language preference through a visible, accessible control in the navigation, improving the multilingual experience and reducing the barrier to accessing content in their preferred language.

### Business Value
Increases accessibility for international users by making language selection discoverable and readily available, supporting the platform's global reach and user satisfaction.

### Acceptance Criteria
- [ ] Language switcher appears in the dashboard layout header for authenticated users
- [ ] Language switcher maintains its position and styling consistently across dashboard pages
- [ ] Language selection persists when navigating between different sections of the dashboard
- [ ] Public-facing pages optionally display the language switcher in their navigation
- [ ] The switcher remains functional and visible on both desktop and mobile viewports


---

## REQ-253: Create Comprehensive Unit Tests for Translation Service

**Date**: 2026-01-18 00:00
**Type**: NEW FEATURE
**Size**: M

### Summary
The translation service must have comprehensive unit tests covering translation execution, error handling, retry logic, and rate limiting to ensure reliability.

### Current Behavior
No unit tests exist for the translation service functionality, making it difficult to verify correctness and prevent regressions during future development.

### Expected Behavior
Developers can run a complete test suite that validates the translation service works correctly under normal conditions, handles failures gracefully, respects rate limits, and retries appropriately when encountering transient errors.

### User Impact
End users experience more reliable translations with fewer failures and unexpected behaviors. Developers can confidently modify and enhance the translation service knowing tests will catch breaking changes.

### Business Value
Reduces production incidents related to translation failures and accelerates development velocity by providing fast feedback on code changes.

### Acceptance Criteria
- [ ] Text translation produces correct results for valid inputs across multiple language pairs
- [ ] Translation requests that fail transiently are automatically retried with exponential backoff
- [ ] Translation requests that exceed rate limits are queued and processed when capacity becomes available
- [ ] Invalid inputs (empty text, unsupported languages, malformed requests) are rejected with appropriate error messages
- [ ] All test cases pass consistently and complete execution in under 30 seconds
- [ ] Test coverage for translation service modules exceeds 80%


---

## REQ-254: Create Integration Tests for Translation Job Processing

**Date**: 2026-01-18 [System Time]
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must include comprehensive integration tests that verify translation jobs are processed correctly from creation to completion, including scenarios with multiple concurrent jobs.

### Current Behavior
Integration tests for the translation job processing system do not exist. The job lifecycle and concurrent processing behavior are untested at the integration level.

### Expected Behavior
Automated integration tests execute during the development and deployment pipeline, validating:
- Jobs move through all expected states (queued, processing, completed, failed)
- Job results are stored and retrievable
- Multiple jobs can run simultaneously without data corruption or race conditions
- System handles job failures gracefully
- Job status updates are accurate and timely

### User Impact
Developers and QA engineers gain confidence that the translation job system works reliably under realistic conditions. Production users experience fewer bugs and more predictable behavior when requesting translations.

### Business Value
Integration tests reduce the risk of critical bugs reaching production, particularly around edge cases like concurrent job processing. This prevents translation failures that could impact user experience and trust in the platform.

### Acceptance Criteria
- [ ] Tests verify a job progresses through all lifecycle states (created → queued → processing → completed)
- [ ] Tests verify failed jobs transition to the failed state and include error details
- [ ] Tests verify job results are correctly stored and retrievable via status endpoints
- [ ] Tests simulate multiple concurrent jobs and verify all complete successfully
- [ ] Tests verify concurrent jobs do not interfere with each other's data or state
- [ ] Tests verify system maintains data integrity under concurrent load
- [ ] All integration tests pass consistently in CI/CD pipeline

---

## REQ-255: Component Tests for Language Switcher

**Date**: 2026-01-18 10:45
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must include comprehensive component tests for the language switcher interface to verify dropdown behavior and language preference persistence.

### Current Behavior
Component tests for the language selection interface do not exist. The dropdown interaction patterns and preference persistence mechanisms are not validated through automated testing.

### Expected Behavior
Automated component tests execute during development and deployment, validating:
- Dropdown opens when the user interacts with the trigger element
- Dropdown displays all available language options
- Dropdown closes after a language is selected
- Selected language is visually indicated in the interface
- Language preference persists across sessions
- Previously selected language is automatically restored when the user returns

### User Impact
Developers gain confidence that the language switcher behaves consistently across browsers and devices. Users experience reliable language selection without unexpected behavior or lost preferences.

### Business Value
Component tests prevent regressions in a critical user-facing feature that directly impacts the multilingual experience. Automated validation reduces manual testing effort and catches issues before they reach production.

### Acceptance Criteria
- [ ] Tests verify dropdown opens on user interaction (click, keyboard, touch)
- [ ] Tests verify dropdown displays all configured language options
- [ ] Tests verify dropdown closes after language selection
- [ ] Tests verify selected language is visually highlighted in the dropdown
- [ ] Tests verify language preference is stored when a selection is made
- [ ] Tests verify stored preference is restored when the component remounts
- [ ] Tests verify component handles missing or invalid stored preferences gracefully
- [ ] All component tests pass consistently in CI/CD pipeline


---

## REQ-256: Manual End-to-End Validation for Localization Features

**Date**: 2026-01-18 00:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
The application must undergo comprehensive manual end-to-end testing to validate that all localization features function correctly in real-world usage scenarios.

### Current Behavior
No formal manual validation process exists for the localization feature set, creating risk that integration issues or edge cases may go undetected until production.

### Expected Behavior
A tester or stakeholder can systematically validate that:
- Language switching changes the interface language immediately and persists across sessions
- All translated content displays correctly in each supported language without layout breaks or missing text
- Translation jobs process successfully from submission through completion with appropriate status updates

### User Impact
Affects all users of the localized application. Successful validation ensures a seamless multilingual experience, while validation failures caught here prevent user-facing defects in production.

### Business Value
Manual validation catches integration issues, UX problems, and edge cases that automated tests may miss, reducing the risk of poor user experience when the localization feature launches.

### Acceptance Criteria
- [ ] Tester can switch between all supported languages and confirm the interface updates immediately
- [ ] Tester verifies that language preference persists after closing and reopening the browser
- [ ] Tester confirms all static UI elements display translated text with no layout overflow or truncation
- [ ] Tester confirms dynamic content (if applicable) displays in the correct language based on user preference
- [ ] Tester submits translation jobs and verifies they complete successfully with appropriate status indicators
- [ ] Tester confirms job processing handles errors gracefully and provides clear feedback
- [ ] Test results are documented with any defects reported back to the development team


---

## REQ-257: Item Edit Flow Usability Improvements

**Date**: 2026-02-10 00:00
**Type**: BUG FIX / ENHANCEMENT
**Size**: M
**Source PRD**: `docs/prd/PRD_bug_report-Item_edit_flow.pdf`

### Summary
Address three usability issues in the item creation and editing workflow: missing direct media capture functionality, inefficient list item editing requiring horizontal scrolling, and inability to add a guide from the item details screen when the Guides section is empty.

### Current Behavior
1. **Media Capture**: The application only allows uploading existing files from device storage via the "Upload a file" option. Users cannot take photos or record videos directly within the app.
2. **List Item Editing**: To edit an item in a list, users must scroll horizontally to find and click an "Edit" button. The list item rows themselves are not tappable.
3. **Add Guide CTA**: On the item details screen, when no guides are associated with an item, there is no visible call-to-action for the user to add one directly from that view.

### Expected Behavior
1. **Media Capture**: Users can take photos and record videos directly from within the application without leaving the app, in addition to uploading existing files.
2. **List Item Editing**: The entire row of a list item is tappable and initiates the editing process, eliminating the need for horizontal scrolling to find the Edit button.
3. **Add Guide CTA**: An "Add Guide" button or link appears within the "Guides" section on the item details page when no guides exist, allowing users to create and associate a guide directly from that view.

### User Impact
1. **Media Capture**: Significantly improves user experience by allowing in-app photo/video capture, reducing friction and context switching.
2. **List Item Editing**: Makes the interface more intuitive and reduces unnecessary horizontal scrolling, improving navigation efficiency.
3. **Add Guide CTA**: Streamlines the workflow for users who want to create and associate a guide with a specific item without navigating away.

### Business Value
These usability improvements reduce friction in core item management workflows, leading to faster task completion, fewer user errors, and improved user satisfaction.

### Acceptance Criteria

#### 1. Direct Media Capture Functionality
- [ ] "Add Content" modal includes options to take a photo using the device camera
- [ ] "Add Content" modal includes options to record a video using the device camera
- [ ] Camera and video capture launch native device capture interfaces
- [ ] Captured media is properly processed and uploaded to the system
- [ ] Existing "Upload a file" functionality remains unchanged and functional
- [ ] Media capture works on both iOS and Android devices (mobile web)
- [ ] Appropriate permissions are requested before accessing camera/microphone

#### 2. Tappable List Item Rows for Editing
- [ ] Entire item row in the list view is tappable/clickable
- [ ] Tapping an item row navigates to the item edit form
- [ ] Visual feedback (hover/tap state) indicates row interactivity
- [ ] Existing Edit button remains visible for users who prefer explicit button interaction
- [ ] Row tap behavior is consistent across all list views showing items
- [ ] No accidental navigation when interacting with other row elements (e.g., checkboxes, action buttons)

#### 3. Add Guide Button in Empty Guides Section
- [ ] "Add Guide" button or link appears in the Guides section when no guides exist for an item
- [ ] "Add Guide" CTA is visually prominent and clearly labeled
- [ ] Clicking "Add Guide" initiates the guide creation workflow
- [ ] Newly created guide is automatically associated with the current item
- [ ] Empty state messaging ("No guides yet") accompanies the Add Guide CTA
- [ ] Add Guide functionality works correctly for both new and existing items

### Technical Notes
- Media capture may require HTML5 `getUserMedia` API or native input capture attributes
- List row tappability should use appropriate cursor styles and ARIA attributes for accessibility
- Guide creation flow should prefill the item association when initiated from item details

---

## REQ-258: Mixed Localization in Item Suggestion Selection

**Date**: 2026-02-12 00:00
**Type**: BUG FIX
**Size**: S
**Source**: User bug report

### Summary
The item suggestion selection screen displays mixed languages - the UI chrome is correctly localized (e.g., French) but the suggested item names appear in English regardless of the selected locale.

### Current Behavior
When a user navigates from room selection to the suggested items list:
- UI labels display in the selected language (e.g., French: "Quel article spécifique?", "Étape 3 sur 8")
- Item suggestion labels display in English (e.g., "Shower", "Bathtub", "Toilet", "Mirror", "Sink", "Hairdryer")

### Expected Behavior
All UI elements including item suggestion labels must display in the user's selected language:
- French example: "Douche", "Baignoire", "Toilettes", "Miroir", "Lavabo", "Sèche-cheveux"
- All supported locales should have translated item suggestions

### Steps to Reproduce
1. Set application language to a non-English locale (e.g., French)
2. Navigate to item creation flow
3. Select a room (e.g., Bathroom)
4. Observe the suggested items list on Step 3

### User Impact
Creates a confusing and unprofessional user experience where the interface language is inconsistent. Users who do not understand English may struggle to identify the correct item suggestions.

### Business Value
Consistent localization is essential for international users and reinforces product quality. Mixed languages reduce user trust and may lead to selection errors.

### Acceptance Criteria
- [ ] Item suggestion labels display in the selected locale language
- [ ] All supported locales have translations for item suggestions
- [ ] Language consistency is maintained throughout the item creation flow
- [ ] No hardcoded English strings remain in item suggestion data
- [ ] Translations are verified for accuracy by native speakers (or translation service)

### Technical Notes
- Investigate whether item suggestions are sourced from a static list or database
- Ensure translation keys exist in all message files (`/messages/*.json`)
- Verify the suggestion component uses the translation function (`t()`) rather than hardcoded strings

---

## REQ-259: Mixed Language Display in Item Creation Recap Screen

**Date**: 2026-02-12 00:00
**Type**: BUG FIX
**Size**: S
**Source**: User bug report

### Summary
The item creation recap screen displays mixed languages - French UI labels but English field values. All content on the recap screen must fully respect the selected language.

### Current Behavior
When a user reaches the item creation recap screen with French locale selected:
- UI labels display correctly in French (e.g., "Nom de l'article", "Pièce", "Type d'article")
- Field values display in English (e.g., "Bathtub", "Bathroom", "Room Item", "Safety Information - Bathtub")

### Expected Behavior
All UI elements including field values must display in the user's selected language:
- French example: "Nom de l'article: Baignoire", "Pièce: Salle de bain", "Type d'article: Article de pièce"
- Purpose/article title should also be localized appropriately
- All supported locales should have consistent language display

### Steps to Reproduce
1. Set application language to a non-English locale (e.g., French)
2. Navigate to item creation flow
3. Complete the item creation steps (select room, item type, etc.)
4. Reach the recap/preview screen
5. Observe that field values display in English despite French UI labels

### User Impact
Creates a confusing and unprofessional user experience where the interface language is inconsistent. Users may not understand the values being displayed for their selections if they do not speak English.

### Business Value
Consistent localization throughout the entire workflow is essential for international users. Mixed languages during the final review step undermines user confidence before saving an item.

### Acceptance Criteria
- [ ] Item name value displays in the selected locale language on recap screen
- [ ] Room name value displays in the selected locale language on recap screen
- [ ] Item type value displays in the selected locale language on recap screen
- [ ] Article purpose/title displays in the selected locale language on recap screen
- [ ] All supported locales have translations for recap field values
- [ ] Language consistency is maintained from selection through recap
- [ ] No hardcoded English strings remain in recap display values

### Technical Notes
- The recap screen likely displays values selected in earlier steps without translation
- Need to ensure the translation function (`t()`) is applied to displayed values, not just labels
- Room, item type, and purpose selections should store translation keys rather than English strings
- Alternatively, the recap component should lookup translations for the stored values
- Verify consistency with REQ-258 (item suggestion selection) fix approach

---

## REQ-263: Eliminate Redundant Property Selection When Printing QR Codes

**Date**: 2026-02-12 [System Time]
**Type**: BUG FIX
**Size**: S

### Summary
Users are prompted to select a property again when choosing to print QR codes, even though they already have a property selected in the application header. The system should carry the current property context forward automatically.

### Current Behavior
When a user selects a property from the property selector (visible in the header), then navigates to print QR codes, they are presented with a "Select a Property" screen asking them to choose which property's QR codes to print. This creates a redundant selection step since the user has already established their property context.

### Steps to Reproduce
1. Select a property from the property selector in the header
2. Navigate to the print QR codes functionality
3. Observe: User is prompted again with "Select a Property" screen to choose which property's QR codes to print

### Expected Behavior
When a user has already selected a property in the application header, the print QR codes functionality should:
1. Automatically use the currently selected property context
2. Navigate directly to the QR code printing/preview screen for that property
3. Optionally provide a way to change the property if the user wants to print QR codes for a different property (e.g., a property switcher within the print flow)

### User Impact
Users experience unnecessary friction when performing the common task of printing QR codes for their currently selected property. The extra selection step adds confusion and slows down the workflow, especially for users who manage multiple properties and have intentionally selected one to work with.

### Business Value
Streamlining the QR code printing workflow reduces user frustration and increases efficiency for property managers who frequently need to print or reprint QR codes. A smoother experience encourages more consistent use of the QR code feature.

### Acceptance Criteria
- [ ] When a property is selected in the header and user initiates print QR codes, the system uses the current property context
- [ ] User is taken directly to the QR code printing/preview screen without an intermediate property selection step
- [ ] If no property is currently selected, the property selection screen is shown (existing behavior preserved)
- [ ] User can still access QR codes for other properties through an appropriate UI control if needed
- [ ] Property context is correctly passed through all steps of the print QR code flow
- [ ] No regression in QR code printing functionality for users without a pre-selected property

### Technical Notes
- Property selection state should be available from the existing property context/state management
- The print QR flow should check for existing property selection before rendering the property picker
- Consider adding a property indicator in the print preview to confirm which property's codes are being printed

---


---

## REQ-262: Media Type Mismatch in Content Editor

**Date**: 2026-02-12 00:00
**Type**: BUG FIX
**Size**: S
**Source**: Bug #5 - Content Editor

### Summary
Media type is incorrectly saved or displayed in the content editor. When a user adds a photo, it appears as a text block instead of displaying the photo preview.

### Current Behavior
1. User adds a photo via the "Add Content" modal
2. User saves the content
3. When viewing the content, it displays as a text block ("T Texte") instead of showing the photo preview
4. The media type indicator does not match the actual uploaded content type

### Expected Behavior
1. User adds a photo via the "Add Content" modal
2. User saves the content
3. When viewing the content, it displays with the correct media type indicator (photo icon)
4. Photo preview is shown correctly matching the uploaded media

### User Impact
Users cannot visually distinguish between different content types (text, photo, video) in the content list. This causes confusion when managing content and may lead to accidentally deleting or modifying the wrong content items.

### Business Value
Correct media type display is essential for content management workflows. Users need to quickly identify content types at a glance to efficiently organize and edit their item instructions.

### Root Cause Investigation
Possible causes to investigate:
- Content type not being saved correctly when adding photo media
- Content type field being overwritten or defaulted to "text"
- Frontend not reading the correct content type field when rendering
- Mismatch between database column and frontend type mapping

### Acceptance Criteria
- [ ] When adding a photo via "Add Content", the content type is correctly saved as photo/image type
- [ ] Photo content displays with the correct photo/image icon in the content list
- [ ] Photo preview thumbnail is displayed correctly for photo content
- [ ] Text content continues to display correctly with text icon
- [ ] Video content displays correctly with video icon (if applicable)
- [ ] Media type is preserved correctly after editing and re-saving content
- [ ] Database stores the correct content_type value for each media type

### Files to Investigate
- `src/components/InstructionEditor/components/AddContentModal.tsx` - Content creation logic
- `src/components/ItemEditForm/ItemInstructionsList.tsx` - Content list display
- `src/app/api/` - API endpoints for saving content
- Database schema for content/instruction storage

### Technical Notes
- Check the content_type or media_type field mapping between frontend and database
- Verify the save operation includes the correct type parameter
- Ensure the display component reads and uses the type field correctly

---

## REQ-260: Session Summary Screen Displays Raw Localization Keys

**Date**: 2026-02-12
**Type**: BUG FIX
**Size**: S

### Summary
The post-creation session summary screen displays raw localization keys instead of properly translated text, breaking the user experience for all language users.

### Current Behavior
After creating an item and reaching the session summary/edit selection screen, raw localization keys are displayed instead of translated labels:
- `workflow.steps.sessionSumm` (should display a title)
- `workflow.steps.sessionSummary.header.subtitle` (should display subtitle text)
- `workflow.steps.sessionSummary.newItems.addMor` (should display "Add More" or similar)
- `workflow.steps.sessionSummary.exist` (should display "Existing Items" or similar)
- `workflow.steps.sessionSummary.actions.printQR` (should display "Print QR Code" or similar)

### Expected Behavior
All localization keys on the session summary screen are resolved to their proper translated text values based on the user's selected language. The UI displays human-readable labels such as:
- Page title (translated)
- Section headers and subtitles (translated)
- Action buttons like "Add More Items", "Print QR Code" (translated)
- Navigation labels (translated)

### User Impact
All users see cryptic technical keys instead of meaningful labels, making the session summary screen confusing and unprofessional. This affects the user experience immediately after item creation, a critical point in the user journey.

### Business Value
Fixing this bug restores professional appearance and usability of the item creation workflow, preventing user confusion and maintaining confidence in the application quality.

### Steps to Reproduce
1. Navigate to item creation flow
2. Create a new item successfully
3. Observe the session summary / edit selection screen
4. Note the raw localization keys displayed instead of translated text

### Acceptance Criteria
- [ ] Session summary screen title displays translated text, not raw keys
- [ ] Header subtitle displays translated text
- [ ] "Add More Items" or equivalent action displays translated text
- [ ] "Existing Items" section label displays translated text
- [ ] "Print QR Code" action button displays translated text
- [ ] All localization keys in the `workflow.steps.sessionSummary` namespace are properly resolved
- [ ] Translations work correctly for all supported languages
- [ ] No truncated keys (like `sessionSumm` or `addMor`) appear in the UI

### Technical Notes
- Investigate why translation keys are truncated (e.g., `sessionSumm` instead of `sessionSummary`)
- Verify translation files contain the full key paths under `workflow.steps.sessionSummary`
- Check if the translation hook/function is being called correctly on this screen
- Ensure the translation namespace is properly scoped in the component


## REQ-261: Guide Edit Screen - Title Auto-Modification and Room Metadata Loss

**Date**: 2026-02-12 00:00
**Type**: BUG FIX
**Size**: S

### Summary
The guide edit screen has multiple bugs: it automatically appends "(Updated Title)" to guide titles when saving, loses room metadata (displaying "Pièce inconnue" / Unknown Room instead of the actual room name), and exhibits mixed localization with French UI elements displaying alongside English content.

### Current Behavior
1. **Title Auto-Modification**: When a guide is saved, the system automatically appends "(Updated Title)" to the guide title (e.g., "How to Use - Bathtub" becomes "How to Use - Bathtub (Updated Title)").
2. **Room Metadata Loss**: After saving and reopening a guide, the room association is lost and displays "Pièce inconnue" (Unknown Room) instead of the originally assigned room.
3. **Mixed Localization**: The UI shows French labels ("Pièce inconnue") while content remains in English, indicating inconsistent locale handling.

### Expected Behavior
1. **Title Preservation**: Guide titles should remain exactly as entered by the user. The system should not append any suffix like "(Updated Title)" to the title.
2. **Room Metadata Preservation**: Room associations should persist correctly through the save/edit cycle. If a guide was associated with "Bathroom" or "Bathtub", it should display that room name after reopening.
3. **Consistent Localization**: Either all UI elements and content should respect the user's locale setting, or the locale context should be properly passed to all components.

### User Impact
- Users see incorrect guide titles that they did not enter, creating confusion and requiring manual correction
- Room organization is broken as all guides appear under "Unknown Room" after editing
- Mixed language display creates a confusing and unprofessional user experience

### Business Value
These bugs significantly degrade the guide management experience, making it difficult for hosts to maintain organized and accurate guides. Fixing these issues restores trust in the editing workflow and improves overall usability.

### Steps to Reproduce
1. Create a new item with a room assignment
2. Add a guide to the item with a specific title
3. Save the guide
4. Reopen the guide for editing
5. Observe: Title has "(Updated Title)" appended; Room shows "Pièce inconnue" instead of actual room

### Acceptance Criteria
- [ ] Guide titles are preserved exactly as entered by the user after saving
- [ ] No automatic suffixes (like "(Updated Title)") are appended to guide titles
- [ ] Room metadata persists correctly through create/edit/save cycles
- [ ] Room name displays correctly in the user's selected locale
- [ ] All UI labels display in a consistent locale (user's preference)
- [ ] Existing guides with corrupted titles/rooms can be corrected by re-saving

### Technical Notes
- Investigate where "(Updated Title)" is being appended in the save logic
- Check room ID vs room name handling in the form state management
- Verify locale context is properly passed to the ItemEditForm and child components
- Review the data transformation between form state and API payload

---

## REQ-264: QR Code Print Manager Mobile Usability Improvements

**Date**: 2026-02-12 12:22
**Type**: BUG FIX
**Size**: S

### Summary
Fix mobile usability issues in the QR Code Print Manager where the item list cannot be scrolled, the layout is cluttered with prominent UUID displays, and only the "Select All" button is practically usable on mobile devices.

### Current Behavior
1. **No Scroll**: The item list in the QR Code Print Manager modal/drawer does not scroll on mobile devices, preventing users from accessing items below the visible viewport.
2. **Cluttered Layout**: Items display UUIDs prominently, making it difficult for users to identify items by their meaningful names. The overall mobile layout is cramped and hard to navigate.
3. **Limited Interaction**: Individual item selection is impractical on mobile; only the "Select All" button provides a usable interaction pattern.

### Expected Behavior
1. **Scrollable List**: The item list scrolls smoothly on mobile devices, allowing users to access all items regardless of list length.
2. **Clean Layout**: Items display human-readable names prominently with UUIDs hidden or minimized. The mobile layout uses appropriate spacing and sizing for touch targets.
3. **Full Functionality**: Users can easily select individual items, use multi-select, and interact with all controls on mobile devices with proper touch-friendly sizing.

### User Impact
Mobile users cannot effectively use the QR Code Print Manager to select specific items for printing. They are forced to use "Select All" or switch to a desktop device, significantly degrading the mobile experience.

### Business Value
Many property hosts access the platform primarily from mobile devices. A functional mobile print manager ensures these users can complete QR code printing tasks without friction, maintaining productivity and user satisfaction.

### Acceptance Criteria
- [ ] Item list container is scrollable on mobile devices (iOS Safari, Chrome Android)
- [ ] Scroll behavior is smooth with proper momentum scrolling on touch devices
- [ ] Item names are displayed prominently; UUIDs are hidden or shown in a secondary/collapsed state
- [ ] Touch targets for item selection meet minimum 44x44px accessibility guidelines
- [ ] Individual item checkboxes/selection controls are easily tappable on mobile
- [ ] Layout adapts responsively to mobile viewport widths (< 768px)
- [ ] "Select All" and "Select None" buttons remain functional and accessible
- [ ] Print action button is accessible without scrolling past the item list
- [ ] No horizontal overflow or unintended horizontal scrolling on mobile
- [ ] Visual hierarchy clearly distinguishes selected vs unselected items on mobile

### Technical Notes
- Investigate CSS overflow properties on the item list container
- Consider using `-webkit-overflow-scrolling: touch` for iOS momentum scrolling
- Review mobile-specific Tailwind breakpoints for responsive layout adjustments
- Item display should prioritize `name` or `title` fields over `id` or `publicId`

---
