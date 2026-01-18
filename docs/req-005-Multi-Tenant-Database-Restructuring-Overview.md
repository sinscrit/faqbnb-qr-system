# REQ-005: Multi-Tenant Database Restructuring with Property Management - Overview

**Reference**: REQ-005 from `docs/gen_requests.md`  
**Date**: January 28, 2025  
**Document Created**: July 25, 2025 at 03:20 CEST  
**Type**: Major Feature Implementation (Architecture Change)  
**Complexity**: 13-21 Points (High Complexity)

## Goals Restatement

Transform the current single-tenant FAQBNB system into a multi-tenant architecture where:

1. **User Management**: Users sign up using Supabase authentication with two distinct roles (regular users and admins)
2. **Property-Based Organization**: Items belong to properties (not directly to users), enabling organized management of multiple locations
3. **Role-Based Access Control**: Regular users can only manage their own properties and items, while admins have system-wide access
4. **Analytics Filtering**: Analytics must be filterable by property to provide meaningful insights per location
5. **Backward Compatibility**: Non-authenticated users can still access items via QR codes without any changes

## Implementation Order and Breakdown

### Phase 1: Database Schema Restructuring (5-8 points)
**Priority**: Critical Foundation
**Dependencies**: None

#### 1.1 Create New Tables
- **users**: Link Supabase auth to application users
- **property_types**: Standardized property categories (house, apartment, villa, etc.)
- **properties**: User-owned properties with metadata

#### 1.2 Modify Existing Tables
- **items**: Add `property_id` foreign key
- **admin_users**: Extend role system for multi-tenant support

#### 1.3 Data Migration Strategy
- Create migration scripts for existing items
- Establish default property assignments for legacy data

### Phase 2: Authentication & Authorization System (3-5 points)
**Priority**: Critical Foundation
**Dependencies**: Phase 1 completion

#### 2.1 Extend Authentication Infrastructure
- Update Supabase client configuration for multi-tenant support
- Implement user registration flow for regular users
- Extend session management for property-based access

#### 2.2 Role-Based Access Control
- Update middleware for property-based route protection
- Implement permission checking functions
- Create authorization helpers for API endpoints

### Phase 3: Property Management System (3-5 points)
**Priority**: High
**Dependencies**: Phases 1-2 completion

#### 3.1 Property CRUD Operations
- Create property management API endpoints
- Implement property form components
- Build property listing and selection interfaces

#### 3.2 Item-Property Association
- Update item creation to require property assignment
- Modify item editing to allow property changes (with permission checks)
- Implement property-based item filtering

### Phase 4: Analytics Property Filtering (2-3 points)
**Priority**: Medium
**Dependencies**: Phases 1-3 completion

#### 4.1 Analytics Infrastructure Updates
- Modify analytics queries to support property filtering
- Update analytics components to include property selectors
- Implement property-specific reporting

#### 4.2 Admin vs User Analytics Views
- Create filtered analytics for regular users (own properties only)
- Maintain system-wide analytics for admin users
- Update analytics export functionality

## Technical Challenges

1. **Data Migration Complexity**: Safely migrating existing items to new property structure without data loss
2. **Performance Optimization**: Ensuring property-based filtering doesn't impact system performance
3. **Security Implementation**: Robust isolation between user properties to prevent data leakage
4. **Session Management**: Coordinating Supabase auth with application-level permissions
5. **Backward Compatibility**: Maintaining public QR code access while implementing access controls

## Authorized Files and Functions for Modification

### Database Schema Files
- **`database/schema.sql`**
  - Functions: Create new tables (`users`, `properties`, `property_types`)
  - Functions: Modify existing tables (`items`, `admin_users`)
  - Functions: Update RLS policies for multi-tenant access
  - Functions: Create new indexes for property-based queries

- **`database/seed-data.sql`** / **`database/seed-data-uuid.sql`**
  - Functions: Add sample property data
  - Functions: Update item seed data with property associations

### Authentication & Authorization
- **`src/lib/supabase.ts`**
  - Functions: Update database type definitions
  - Functions: Add property-related database types
  - Functions: Extend client configuration

- **`src/lib/auth.ts`**
  - Functions: `getUser()` - extend for property access
  - Functions: `isAdmin()` - update for multi-tenant roles
  - Functions: Add `canAccessProperty()`, `getUserProperties()`
  - Functions: Add user registration helpers

- **`src/contexts/AuthContext.tsx`**
  - Functions: `AuthProvider` - extend state management
  - Functions: `useAuth()` - add property-related context
  - Functions: Add user registration flows
  - Functions: Update session management for property access

- **`src/middleware.ts`**
  - Functions: `middleware()` - add property-based route protection
  - Functions: Add property access validation
  - Functions: Update admin vs user route handling

### API Endpoints
- **`src/app/api/auth/`**
  - **`register/route.ts`** (NEW): User registration endpoint
  - **`login/route.ts`**: Update for multi-tenant support
  - **`session/route.ts`**: Extend session data with user properties

- **`src/app/api/admin/properties/`** (NEW DIRECTORY)
  - **`route.ts`** (NEW): Property CRUD operations
  - **`[propertyId]/route.ts`** (NEW): Individual property management

- **`src/app/api/admin/items/`**
  - **`route.ts`**: 
    - Functions: `GET()` - add property filtering
    - Functions: `POST()` - require property assignment
  - **`[publicId]/route.ts`**: 
    - Functions: `GET()`, `PUT()`, `DELETE()` - add property permission checks

- **`src/app/api/admin/analytics/`**
  - **`route.ts`**: 
    - Functions: `GET()` - add property-based filtering
  - **`reactions/route.ts`**: 
    - Functions: `GET()` - property-based reaction analytics

### Frontend Components
- **`src/components/AuthGuard.tsx`**
  - Functions: `AuthGuard()` - extend for property-based access
  - Functions: `useRequireAuth()` - add property permission checking

- **`src/components/PropertyForm.tsx`** (NEW)
  - Functions: Property creation/editing form component

- **`src/components/PropertySelector.tsx`** (NEW)
  - Functions: Property selection dropdown for admins

- **`src/components/ItemForm.tsx`**
  - Functions: Update to include property selection
  - Functions: Add property validation

- **`src/components/AnalyticsOverviewCards.tsx`**
  - Functions: Add property filtering capabilities
  - Functions: Update analytics calculations for property scope

- **`src/components/TimeRangeSelector.tsx`**
  - Functions: Add property selector integration

### Admin Interface Pages
- **`src/app/admin/layout.tsx`**
  - Functions: Add property context provider
  - Functions: Update navigation for property management

- **`src/app/admin/page.tsx`**
  - Functions: Update item listing with property filtering
  - Functions: Add property selection for admins
  - Functions: Filter items based on user role and property access

- **`src/app/admin/properties/`** (NEW DIRECTORY)
  - **`page.tsx`** (NEW): Property listing page
  - **`new/page.tsx`** (NEW): Create new property page
  - **`[propertyId]/edit/page.tsx`** (NEW): Edit property page

- **`src/app/admin/items/`**
  - **`new/page.tsx`**: Update to require property selection
  - **`[publicId]/edit/page.tsx`**: Add property modification with permission checks

- **`src/app/admin/analytics/page.tsx`**
  - Functions: Add property filtering interface
  - Functions: Update analytics queries for property scope

### Type Definitions
- **`src/types/index.ts`**
  - Functions: Add `User`, `Property`, `PropertyType` interfaces
  - Functions: Update `Item` interface with property relationship
  - Functions: Extend analytics types for property filtering

- **`src/types/analytics.ts`**
  - Functions: Add property-based analytics types
  - Functions: Update analytics response types

### Public Access (Maintain Compatibility)
- **`src/app/item/[publicId]/page.tsx`**
  - Functions: Ensure public access remains unchanged
  - Functions: Add property context for internal tracking

- **`src/app/api/items/[publicId]/route.ts`**
  - Functions: Maintain public access while adding property context

### Authentication Pages
- **`src/app/login/`**
  - **`page.tsx`**: Update for multi-tenant login flow
  - **`LoginPageContent.tsx`**: Add user type handling

- **`src/app/register/`** (NEW DIRECTORY)
  - **`page.tsx`** (NEW): User registration page
  - **`RegisterForm.tsx`** (NEW): Registration form component

### Utility Functions
- **`src/lib/api.ts`**
  - Functions: Add property management API calls
  - Functions: Update existing API calls with property filtering

- **`src/lib/utils.ts`**
  - Functions: Add property-related utility functions
  - Functions: Property permission checking helpers

## Success Criteria

1. **Database**: New multi-tenant schema successfully deployed with data migration
2. **Authentication**: Users can register and login with proper role assignment
3. **Property Management**: Users can create, edit, and manage their properties
4. **Access Control**: Regular users can only access their own properties and items
5. **Analytics**: Property-based filtering works correctly for both user types
6. **Backward Compatibility**: Existing QR code links continue to work without authentication
7. **Performance**: Property-based filtering maintains acceptable response times
8. **Security**: No cross-tenant data leakage between user properties

## Rollback Plan

1. **Database Rollback**: Maintain current schema as backup, use feature flags for new tables
2. **Authentication Fallback**: Keep current admin-only authentication as fallback mode
3. **API Versioning**: Maintain v1 endpoints alongside new v2 property-aware endpoints
4. **Frontend Fallback**: Feature flags to disable property management UI if needed

---

**Next Phase**: Upon approval, begin with Phase 1 (Database Schema Restructuring) as the foundation for all subsequent changes. 