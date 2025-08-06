# REQ-016: Domain Configuration for QR Links and System Admin Back Office - Overview

**Document Created**: August 06, 2025 10:38:44 CEST  
**Request Reference**: docs/gen_requests.md - Request #016  
**Type**: Feature Implementation (Major)  
**Complexity**: 28-34 Points (High Complexity)  
**Status**: PENDING

## Request Summary

Implementation of configurable domain parameter for QR code links and creation of a comprehensive system admin back office interface for user management, access tracking, and account analytics.

**Original Request**: REQ-016 from `docs/gen_requests.md`

## Goals

1. **Domain Configuration for QR Links**: Add configurable domain parameter that overrides localhost regardless of where code generation runs
2. **System Admin Database Infrastructure**: Implement database flag for system administrators (manually settable)
3. **Back Office User Analytics Dashboard**: Comprehensive dashboard showing user account access, ownership, and visit statistics
4. **Access Request Management System**: Complete workflow for managing user access requests with email integration and approval processes

## Implementation Breakdown

### Phase 1: Domain Configuration and Admin Infrastructure (5 points)
**Priority**: High - Foundation for admin system

#### 1.1 Domain Parameter for QR Code Links (3 points)
- **Goal**: Replace localhost resolution with configurable domain
- **Implementation**:
  - Environment variable for domain override
  - QR generation utility updates
  - Cross-environment support (dev, staging, production)
- **Success Criteria**: QR codes consistently resolve to configured domain

#### 1.2 System Admin Database Flag (2 points)
- **Goal**: Enable database-level admin identification
- **Implementation**:
  - Add `is_admin` boolean column to users table
  - Authentication middleware updates
  - Admin route protection
- **Success Criteria**: Admin users can access back office functionality

### Phase 2: User Analytics Dashboard Infrastructure (8 points)
**Priority**: High - Core admin functionality

#### 2.1 User Analytics Data Model (4 points)
- **Goal**: Complex data aggregation across users, accounts, and visits
- **Implementation**:
  - Multi-table analytics queries
  - Account access vs ownership calculations
  - Visit statistics aggregation
- **Success Criteria**: Comprehensive user analytics API

#### 2.2 Back Office Dashboard Interface (4 points)
- **Goal**: Rich admin interface for user management
- **Implementation**:
  - User list with analytics display
  - Account access summary components
  - Sortable tables and filtering
- **Success Criteria**: Intuitive admin dashboard

### Phase 3: Access Request Management System (10 points)
**Priority**: Medium-High - Advanced admin workflow

#### 3.1 Access Request Database Infrastructure (4 points)
- **Goal**: Track access requests and approval workflow
- **Implementation**:
  - New access_requests table
  - Request timeline tracking
  - Status management
- **Success Criteria**: Complete access request data model

#### 3.2 Access Request Management Interface (3 points)
- **Goal**: Admin interface for managing access requests
- **Implementation**:
  - Request listing and filtering
  - Approval workflow interface
  - Timeline analytics display
- **Success Criteria**: Functional access management UI

#### 3.3 Email Integration System (3 points)
- **Goal**: Automated email notifications for access approval
- **Implementation**:
  - Email template system
  - Dynamic access link generation
  - Popup email composition interface
- **Success Criteria**: Complete email workflow

### Phase 4: Email Integration and Approval Workflow (9 points)
**Priority**: Medium - Enhanced user experience

#### 4.1 Email Template Engine (4 points)
- **Goal**: Dynamic email generation with access codes
- **Implementation**:
  - Template utilities
  - Access code generation
  - Link generation with codes
- **Success Criteria**: Professional email templates

#### 4.2 Approval Workflow Automation (3 points)
- **Goal**: Streamlined access granting process
- **Implementation**:
  - One-click approval buttons
  - Automated email sending
  - Status tracking
- **Success Criteria**: Efficient approval workflow

#### 4.3 Registration Timeline Analytics (2 points)
- **Goal**: Track registration completion patterns
- **Implementation**:
  - Date calculations for request vs registration
  - Analytics for unregistered users
  - Timeline reporting
- **Success Criteria**: Complete registration analytics

## Authorized Files and Functions for Modification

### Environment and Configuration Files

#### New Configuration Files
- **`.env.local`** / **`.env`**
  - Variables: `NEXT_PUBLIC_QR_DOMAIN_OVERRIDE` - Configurable domain for QR links
  - Variables: `DOMAIN_OVERRIDE` - Backend domain configuration

- **`src/lib/config.ts`** (NEW FILE)
  - Functions: `getDomainOverride()` - Get configured domain or fallback
  - Functions: `getQRDomain()` - Domain resolution for QR generation
  - Functions: `validateDomainConfig()` - Configuration validation

### Database Schema Modifications

#### Schema Updates
- **`database/schema.sql`**
  - Tables: Add `is_admin BOOLEAN DEFAULT FALSE` to users table
  - Tables: Create `access_requests` table with columns:
    - `id UUID PRIMARY KEY`
    - `requester_email VARCHAR(255) NOT NULL`
    - `requester_name VARCHAR(255)`
    - `account_id UUID REFERENCES accounts(id)`
    - `request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
    - `approval_date TIMESTAMP WITH TIME ZONE`
    - `approved_by UUID REFERENCES auth.users(id)`
    - `access_code VARCHAR(255) UNIQUE`
    - `registration_completed_date TIMESTAMP WITH TIME ZONE`
    - `status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'denied', 'registered'))`
    - `email_sent_date TIMESTAMP WITH TIME ZONE`

### QR Code System Updates

#### QR Generation Utilities
- **`src/lib/qrcode-utils.ts`**
  - Functions: `generateQRCode()` - Update to use domain configuration
  - Functions: `generateQRCodeWithCache()` - Domain-aware caching
  - Functions: `buildQRUrl()` - NEW: URL construction with domain override
  - Functions: `validateQRDomain()` - NEW: Domain validation

- **`src/app/api/qr-codes/route.ts`** (NEW FILE)
  - Functions: `GET()` - QR code generation endpoint with domain support
  - Functions: `validateDomainConfig()` - Server-side domain validation

#### QR Print Management
- **`src/components/QRCodePrintManager.tsx`**
  - Functions: `performQRGeneration()` - Update to use configured domain
  - Variables: Update URL generation logic in line 211: `url: \`${getQRDomain()}/item/${item.publicId}\``

- **`src/hooks/useQRCodeGeneration.ts`**
  - Functions: `generateBatchQRCodes()` - Domain-aware QR generation
  - Functions: `generateQRCodeWithOptions()` - Use domain configuration

### Authentication and Authorization System

#### Admin Authentication
- **`src/lib/auth.ts`**
  - Functions: `signInWithEmail()` - Update admin check to use is_admin flag (line 93-103)
  - Functions: `isSystemAdmin()` - NEW: Check is_admin database flag
  - Functions: `validateAdminAccess()` - NEW: Admin role validation

- **`src/lib/auth-server.ts`**
  - Functions: `validateAdminAuth()` - Update to check is_admin flag (line 53-97)
  - Functions: `checkSystemAdminRole()` - NEW: Server-side admin validation

#### Middleware Updates
- **`src/middleware.ts`**
  - Functions: `middleware()` - Add back office route protection
  - Functions: `protectBackOfficeRoutes()` - NEW: System admin route protection
  - Routes: Protect `/admin/back-office/*` routes

- **`src/contexts/AuthContext.tsx`**
  - Variables: Add `isSystemAdmin` to auth context state
  - Functions: `useAuth()` - Include system admin status
  - Functions: `updateUserRole()` - Handle admin flag updates

### API Layer - Admin Back Office

#### User Analytics API
- **`src/app/api/admin/users/analytics/route.ts`** (NEW FILE)
  - Functions: `GET()` - User analytics with account access and visit data
  - Functions: `getUserAccountAnalytics()` - Account access vs ownership calculations
  - Functions: `getUserVisitStatistics()` - Visit analytics per user
  - Functions: `calculateAccountMetrics()` - Account ownership and access metrics

#### Access Request Management API
- **`src/app/api/admin/access-requests/route.ts`** (NEW FILE)
  - Functions: `GET()` - List access requests with filtering and pagination
  - Functions: `POST()` - Create new access request
  - Functions: `PUT()` - Update access request status

- **`src/app/api/admin/access-requests/[requestId]/route.ts`** (NEW FILE)
  - Functions: `GET()` - Get specific access request details
  - Functions: `DELETE()` - Remove access request

- **`src/app/api/admin/access-requests/[requestId]/grant/route.ts`** (NEW FILE)
  - Functions: `POST()` - Grant access and send approval email
  - Functions: `generateAccessCode()` - Create unique access codes
  - Functions: `sendApprovalEmail()` - Email notification system

### Frontend - Back Office Interface

#### Admin Dashboard Pages
- **`src/app/admin/back-office/page.tsx`** (NEW FILE)
  - Functions: `BackOfficePage()` - Main admin dashboard
  - Functions: `loadUserAnalytics()` - Load user data and analytics
  - Functions: `handleUserSearch()` - User search and filtering

- **`src/app/admin/back-office/access-requests/page.tsx`** (NEW FILE)
  - Functions: `AccessRequestsPage()` - Access request management interface
  - Functions: `loadAccessRequests()` - Load request data
  - Functions: `handleApprovalAction()` - Process approval requests
  - Functions: `openEmailPopup()` - Email composition interface

#### Admin Components
- **`src/components/UserAnalyticsTable.tsx`** (NEW FILE)
  - Functions: `UserAnalyticsTable()` - User analytics display component
  - Functions: `renderAccountAccess()` - Account access summary
  - Functions: `renderVisitStatistics()` - Visit count displays
  - Functions: `handleSortChange()` - Table sorting functionality

- **`src/components/AccountAccessSummary.tsx`** (NEW FILE)
  - Functions: `AccountAccessSummary()` - Account access visualization
  - Functions: `calculateAccessMetrics()` - Access vs ownership calculations
  - Functions: `renderAccessBadges()` - Visual access indicators

- **`src/components/AccessRequestTable.tsx`** (NEW FILE)
  - Functions: `AccessRequestTable()` - Access request listing
  - Functions: `renderRequestStatus()` - Status visualization
  - Functions: `renderTimelineMetrics()` - Request timeline display
  - Functions: `handleApprovalClick()` - Approval action handling

- **`src/components/EmailPopup.tsx`** (NEW FILE)
  - Functions: `EmailPopup()` - Email composition modal
  - Functions: `generateEmailTemplate()` - Pre-formatted email creation
  - Functions: `handleSendEmail()` - Email sending workflow
  - Functions: `validateEmailTemplate()` - Template validation

### Utility Libraries

#### Analytics Utilities
- **`src/lib/analytics.ts`** (NEW FILE)
  - Functions: `calculateUserAccountMetrics()` - User account analytics
  - Functions: `aggregateVisitData()` - Visit statistics aggregation
  - Functions: `computeAccessStatistics()` - Access vs ownership calculations
  - Functions: `generateAnalyticsReport()` - Comprehensive analytics reporting

#### Email System
- **`src/lib/email-templates.ts`** (NEW FILE)
  - Functions: `generateAccessApprovalEmail()` - Approval email template
  - Functions: `createAccessLink()` - Dynamic access link generation
  - Functions: `validateEmailTemplate()` - Template validation
  - Functions: `renderEmailHTML()` - HTML email rendering

#### Access Management
- **`src/lib/access-management.ts`** (NEW FILE)
  - Functions: `generateAccessCode()` - Unique access code creation
  - Functions: `validateAccessRequest()` - Request validation
  - Functions: `processAccessApproval()` - Approval workflow
  - Functions: `trackRegistrationCompletion()` - Registration monitoring

### Type Definitions

#### Admin Types
- **`src/types/admin.ts`** (NEW FILE)
  - Interfaces: `UserAnalytics` - User analytics data structure
  - Interfaces: `AccountAccessSummary` - Account access information
  - Interfaces: `AccessRequest` - Access request data model
  - Interfaces: `AccessApprovalRequest` - Approval workflow data
  - Interfaces: `EmailTemplate` - Email template structure
  - Interfaces: `BackOfficeUser` - Admin user data

#### Extended Base Types
- **`src/types/index.ts`**
  - Interfaces: Extend `AuthUser` with `isSystemAdmin: boolean`
  - Interfaces: Add `AccessRequestStatus` enum
  - Interfaces: Add `EmailTemplateType` enum
  - Interfaces: Update database types for new tables

### Existing API Route Updates

#### Session Management
- **`src/app/api/auth/session/route.ts`**
  - Functions: `GET()` - Update to include is_admin flag (lines 124-143)
  - Variables: Add `isSystemAdmin` to session response

#### Admin Routes (Update auth validation)
- **`src/app/api/admin/accounts/route.ts`**
  - Functions: `validateAdminAuth()` - Update to check is_admin flag (lines 42-97)

- **`src/app/api/admin/items/route.ts`**
  - Functions: Auth validation - Add system admin check for back office access

- **`src/app/api/admin/analytics/route.ts`**
  - Functions: `GET()` - Add user analytics capabilities for system admins

### Files NOT Authorized for Modification

#### Public Access (Maintain unchanged)
- **`src/app/item/[publicId]/page.tsx`** - Public item display (no changes needed)
- **`src/components/ItemDisplay.tsx`** - Item display component (no changes needed)
- **`src/app/api/visits/route.ts`** - Visit tracking API (no changes needed)

#### Core Database
- **`database/seed-data.sql`** - Sample data (reference only)
- **`database/setup-admin-user.sql`** - Existing admin setup (reference only)

#### Existing QR Components (Reference only)
- **`src/components/QRCodePrintPreview.tsx`** - Preview display (reference only)
- **`src/lib/pdf-generator.ts`** - PDF generation (reference only)

## Technical Implementation Notes

### Database Considerations
1. **Migration Safety**: Add `is_admin` column with `DEFAULT FALSE` to avoid breaking existing users
2. **Index Requirements**: Add indexes on `access_requests.requester_email` and `access_requests.status`
3. **Constraint Validation**: Ensure proper foreign key relationships for access requests

### Domain Configuration Priority
1. **Environment Variable**: Check `NEXT_PUBLIC_QR_DOMAIN_OVERRIDE` first
2. **Fallback Strategy**: Use `window.location.origin` if no override configured
3. **Validation**: Ensure domain includes protocol (https://)

### Security Requirements
1. **Admin Access**: System admin flag can only be set manually in database
2. **Access Codes**: Use cryptographically secure random generation
3. **Email Validation**: Validate email addresses before sending approval emails
4. **Rate Limiting**: Implement rate limiting on access request submissions

### Performance Considerations
1. **Analytics Queries**: Use proper indexing for multi-table joins
2. **Caching Strategy**: Cache user analytics data for dashboard performance
3. **Batch Operations**: Implement efficient batch email sending for approvals

## Implementation Order

1. **Phase 1**: Domain configuration and admin database flag (5 points)
2. **Phase 2**: User analytics infrastructure and dashboard (8 points)
3. **Phase 3**: Access request data model and basic management (10 points)
4. **Phase 4**: Email integration and approval workflow (9 points)

**Total Estimated Effort**: 28-34 story points