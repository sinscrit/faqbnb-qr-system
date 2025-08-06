# REQ-016: Domain Configuration for QR Links and System Admin Back Office - Detailed Implementation

**Document Created**: August 06, 2025 10:42:30 CEST  
**Request Reference**: docs/gen_requests.md - Request #016  
**Overview Reference**: docs/req-016-Domain-Configuration-QR-Links-System-Admin-Back-Office-Overview.md  
**Type**: Feature Implementation (Major)  
**Complexity**: 28-34 Points (High Complexity)  
**Status**: PENDING

## Implementation Instructions

**CRITICAL**: All operations must be performed from the project root folder `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus`. DO NOT attempt to navigate to other folders.

**Database Operations**: Use Supabase MCP tools (`mcp_supabase_execute_sql`, `mcp_supabase_apply_migration`) for all database interactions.

## Database Structure Analysis

**Current State**:
- ✅ **users table exists** with columns: id (uuid), email (text), full_name (text), role (text, default 'user'), created_at, updated_at
- ✅ **admin_users table exists** with columns: id (uuid), email (text), full_name (text), role (text, default 'admin'), created_at, updated_at  
- ✅ **accounts table exists** with multi-tenant structure
- ✅ **account_users table exists** for account membership
- ✅ **item_visits table exists** for analytics
- ❌ **is_admin flag missing** from users table
- ❌ **access_requests table missing** 

## Phase 1: Domain Configuration and Admin Infrastructure (5 Points)

### 1. Environment Configuration for Domain Override (1 point) -unit tested-

**Goal**: Add configurable domain parameter for QR code generation

**Substeps**:
- [x] Create or update `.env.local` file with new environment variable:
  ```
  NEXT_PUBLIC_QR_DOMAIN_OVERRIDE=https://faqbnb.com
  ```
- [x] Verify `.env.local` is in `.gitignore` for security
- [x] Create `.env.example` template with:
  ```
  # QR Code Domain Configuration
  NEXT_PUBLIC_QR_DOMAIN_OVERRIDE=https://your-production-domain.com
  ```
- [x] Test environment variable loading with `console.log(process.env.NEXT_PUBLIC_QR_DOMAIN_OVERRIDE)`

### 2. Domain Configuration Utility Library (1 point) -unit tested-

**Goal**: Create domain resolution utilities for QR code generation

**Substeps**:
- [x] Create new file `src/lib/config.ts` with functions:
  ```typescript
  export function getDomainOverride(): string | null
  export function getQRDomain(): string
  export function validateDomainConfig(domain: string): boolean
  ```
- [x] Implement `getDomainOverride()` to read `NEXT_PUBLIC_QR_DOMAIN_OVERRIDE`
- [x] Implement `getQRDomain()` with fallback logic: override → window.location.origin
- [x] Add domain validation for protocol requirement (https://)
- [x] Add TypeScript exports to `src/types/index.ts` for domain configuration types

### 3. System Admin Database Flag Implementation (1 point) -unit tested-

**Goal**: Add is_admin boolean flag to users table

**Substeps**:
- [x] Use `mcp_supabase_apply_migration` with name: `add_is_admin_flag_to_users`
- [x] Execute migration SQL:
  ```sql
  ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  COMMENT ON COLUMN users.is_admin IS 'System administrator flag - can only be set manually in database';
  CREATE INDEX idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;
  ```
- [x] Verify column addition with `mcp_supabase_execute_sql`:
  ```sql
  SELECT column_name, data_type, is_nullable, column_default 
  FROM information_schema.columns 
  WHERE table_name = 'users' AND column_name = 'is_admin';
  ```
- [x] Test column with sample query: `SELECT id, email, is_admin FROM users LIMIT 5;`

### 4. QR Code Generation Domain Integration (1 point) -unit tested-

**Goal**: Update QR generation to use configured domain

**Substeps**:
- [x] Modify `src/lib/qrcode-utils.ts` function `generateQRCode()`:
  - [x] Import `getQRDomain` from `src/lib/config.ts`
  - [x] Add new function `buildQRUrl(publicId: string): string`
  - [x] Replace hardcoded URL generation with domain-aware URL building
- [x] Update `src/components/QRCodePrintManager.tsx` line ~211:
  - [x] Replace `\`${window.location.origin}/item/${item.publicId}\`` 
  - [x] With `buildQRUrl(item.publicId)`
- [x] Test QR generation with environment variable set and unset
- [x] Verify QR codes resolve to correct domain

### 5. Authentication System Admin Integration (1 point) -unit tested-

**Goal**: Update authentication to check is_admin database flag

**Substeps**:
- [x] Modify `src/lib/auth.ts` function `signInWithEmail()` (lines 93-103):
  - [x] Add query to check `users.is_admin` flag alongside admin_users table
  - [x] Add new function `isSystemAdmin(userId: string): Promise<boolean>`
- [x] Update `src/lib/auth-server.ts` function `validateAdminAuth()` (lines 53-97):
  - [x] Include is_admin flag check in user validation
  - [x] Add fallback logic: admin_users table OR users.is_admin = true
- [x] Update `src/contexts/AuthContext.tsx`:
  - [x] Add `isSystemAdmin: boolean` to auth context state
  - [x] Update context provider to include system admin status
- [x] Test authentication with is_admin flag set to true for test user

## Phase 2: User Analytics Dashboard Infrastructure (8 Points)

### 6. Access Requests Database Table Creation (1 point)

**Goal**: Create access_requests table for tracking user access requests

**Substeps**:
- [ ] Use `mcp_supabase_apply_migration` with name: `create_access_requests_table`
- [ ] Execute migration SQL:
  ```sql
  CREATE TABLE access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_email VARCHAR(255) NOT NULL,
    requester_name VARCHAR(255),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    access_code VARCHAR(255) UNIQUE,
    registration_completed_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'registered')),
    email_sent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- [ ] Add indexes and comments:
  ```sql
  CREATE INDEX idx_access_requests_email ON access_requests(requester_email);
  CREATE INDEX idx_access_requests_status ON access_requests(status);
  CREATE INDEX idx_access_requests_account_id ON access_requests(account_id);
  COMMENT ON TABLE access_requests IS 'User access requests for account membership approval';
  ```
- [ ] Enable RLS: `ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;`
- [ ] Verify table creation with `mcp_supabase_execute_sql`: `SELECT * FROM access_requests LIMIT 1;`

### 7. User Analytics API Endpoint (1 point)

**Goal**: Create API endpoint for user analytics with account access data

**Substeps**:
- [ ] Create new file `src/app/api/admin/users/analytics/route.ts`
- [ ] Implement `GET()` function with authentication check using `validateAdminAuth()`
- [ ] Add complex analytics query joining:
  - [ ] users table for user info
  - [ ] account_users table for account access relationships  
  - [ ] accounts table for account ownership
  - [ ] item_visits table for visit statistics
- [ ] Return structured response with:
  ```typescript
  {
    success: boolean;
    data: {
      users: {
        id: string;
        email: string;
        fullName: string;
        ownedAccounts: { count: number; totalItems: number; totalVisits: number };
        accessAccounts: { count: number; totalItems: number; totalVisits: number };
      }[];
    };
  }
  ```
- [ ] Test endpoint with curl: `curl -H "Authorization: Bearer <token>" http://localhost:3000/api/admin/users/analytics`

### 8. User Analytics Calculation Utilities (1 point)

**Goal**: Create utility functions for complex user analytics calculations

**Substeps**:
- [ ] Create new file `src/lib/analytics.ts`
- [ ] Implement functions:
  ```typescript
  export async function calculateUserAccountMetrics(userId: string): Promise<UserAccountMetrics>
  export async function aggregateVisitData(accountIds: string[]): Promise<VisitSummary>
  export async function computeAccessStatistics(userId: string): Promise<AccessStatistics>
  export async function generateAnalyticsReport(userId?: string): Promise<AnalyticsReport>
  ```
- [ ] Add Supabase queries for:
  - [ ] Account ownership counting
  - [ ] Account access (non-ownership) counting  
  - [ ] Item counts per account
  - [ ] Visit counts per account/user
- [ ] Create TypeScript interfaces in `src/types/admin.ts`
- [ ] Test analytics calculations with known test data

### 9. Back Office Main Dashboard Page (1 point)

**Goal**: Create main admin dashboard interface

**Substeps**:
- [ ] Create new file `src/app/admin/back-office/page.tsx`
- [ ] Implement `BackOfficePage()` component with:
  - [ ] Authentication guard using `AuthGuard` with `requireAdmin={true}`
  - [ ] User analytics data loading using `useEffect()`
  - [ ] Search and filter functionality
  - [ ] Responsive layout with user statistics display
- [ ] Add navigation link in `src/app/admin/layout.tsx`:
  ```typescript
  <Link href="/admin/back-office">Back Office</Link>
  ```
- [ ] Add route protection in `src/middleware.ts` for `/admin/back-office` path
- [ ] Test page access with admin user authentication

### 10. User Analytics Table Component (1 point)

**Goal**: Create reusable component for displaying user analytics

**Substeps**:
- [ ] Create new file `src/components/UserAnalyticsTable.tsx`
- [ ] Implement `UserAnalyticsTable()` component with props:
  ```typescript
  interface UserAnalyticsTableProps {
    users: UserAnalytics[];
    onSort: (field: string) => void;
    onFilter: (filters: UserFilters) => void;
    isLoading?: boolean;
  }
  ```
- [ ] Add features:
  - [ ] Sortable columns (email, owned accounts, access accounts, total visits)
  - [ ] Search functionality
  - [ ] Loading states and error handling
  - [ ] Responsive design for mobile devices
- [ ] Style with existing CSS patterns from admin interface
- [ ] Test component with mock data

### 11. Account Access Summary Component (1 point)

**Goal**: Create component for visualizing account access relationships

**Substeps**:
- [ ] Create new file `src/components/AccountAccessSummary.tsx` 
- [ ] Implement `AccountAccessSummary()` component with:
  ```typescript
  interface AccountAccessSummaryProps {
    userId: string;
    ownedAccounts: AccountSummary[];
    accessAccounts: AccountSummary[];
  }
  ```
- [ ] Add visual elements:
  - [ ] Badge system for access levels (owner, admin, member, viewer)
  - [ ] Account cards with statistics
  - [ ] Visit count visualizations
  - [ ] Items count per account
- [ ] Implement responsive grid layout
- [ ] Test with various user access scenarios

### 12. Admin Type Definitions (1 point)

**Goal**: Create comprehensive TypeScript definitions for admin functionality

**Substeps**:
- [ ] Create new file `src/types/admin.ts` with interfaces:
  ```typescript
  export interface UserAnalytics
  export interface AccountAccessSummary  
  export interface AccessRequest
  export interface AccessApprovalRequest
  export interface EmailTemplate
  export interface BackOfficeUser
  export interface UserAccountMetrics
  export interface VisitSummary
  export interface AccessStatistics
  ```
- [ ] Update `src/types/index.ts` to extend existing types:
  - [ ] Add `isSystemAdmin: boolean` to `AuthUser` interface
  - [ ] Add `AccessRequestStatus` enum
  - [ ] Add `EmailTemplateType` enum
- [ ] Export all admin types from main types file
- [ ] Verify TypeScript compilation with `npm run type-check`

### 13. Middleware Admin Route Protection (1 point)

**Goal**: Add route protection for back office functionality  

**Substeps**:
- [ ] Update `src/middleware.ts` to add `/admin/back-office` route protection
- [ ] Add system admin check:
  ```typescript
  if (pathname.startsWith('/admin/back-office')) {
    // Check is_admin flag in addition to admin_users table
  }
  ```
- [ ] Update admin session validation to include is_admin flag
- [ ] Add redirect logic for unauthorized access attempts
- [ ] Test route protection with different user types:
  - [ ] Regular user (should be denied)
  - [ ] Admin user (should be allowed)
  - [ ] System admin (should be allowed)

## Phase 3: Access Request Management System (10 Points)

### 14. Access Request List API Endpoint (1 point)

**Goal**: Create API for listing and managing access requests

**Substeps**:
- [ ] Create new file `src/app/api/admin/access-requests/route.ts`
- [ ] Implement `GET()` function with:
  - [ ] Authentication validation using `validateAdminAuth()`
  - [ ] Query parameters for filtering: status, account_id, date_range
  - [ ] Pagination support (limit, offset)
  - [ ] Complex query joining access_requests with accounts and users tables
- [ ] Implement `POST()` function for creating access requests:
  - [ ] Validation for requester_email, account_id
  - [ ] Duplicate request prevention
  - [ ] Email format validation
- [ ] Return structured responses with error handling
- [ ] Test with curl and various query parameters

### 15. Access Request Detail API Endpoint (1 point)

**Goal**: Create API for individual access request management

**Substeps**:
- [ ] Create new file `src/app/api/admin/access-requests/[requestId]/route.ts`
- [ ] Implement `GET()` function for request details:
  - [ ] UUID validation for requestId parameter
  - [ ] Detailed request information with timeline data
  - [ ] Related account and user information
- [ ] Implement `PUT()` function for updating request status
- [ ] Implement `DELETE()` function for removing requests
- [ ] Add request timeline calculations:
  - [ ] Days since request
  - [ ] Days between request and approval
  - [ ] Registration completion tracking
- [ ] Test CRUD operations with Postman

### 16. Access Approval API Endpoint (1 point)

**Goal**: Create API endpoint for approving access requests

**Substeps**:
- [ ] Create new file `src/app/api/admin/access-requests/[requestId]/grant/route.ts`
- [ ] Implement `POST()` function with:
  - [ ] Admin authentication validation
  - [ ] Access code generation using crypto.randomBytes()
  - [ ] Database transaction for status update and code generation
  - [ ] Account_users table insertion for approved access
- [ ] Add functions:
  ```typescript
  async function generateAccessCode(): Promise<string>
  async function processAccessApproval(requestId: string, adminId: string): Promise<ApprovalResult>
  async function createAccountAccess(userId: string, accountId: string, role: string): Promise<void>
  ```
- [ ] Implement approval workflow with status tracking
- [ ] Test approval process with multiple access requests

### 17. Access Request Management Page (1 point)

**Goal**: Create admin interface for managing access requests

**Substeps**:
- [ ] Create new file `src/app/admin/back-office/access-requests/page.tsx`
- [ ] Implement `AccessRequestsPage()` component with:
  - [ ] Access request listing with status filtering
  - [ ] Search functionality by email or account
  - [ ] Approval action buttons
  - [ ] Timeline analytics display
- [ ] Add data loading with error handling:
  ```typescript
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<RequestFilters>({});
  ```
- [ ] Implement bulk operations for multiple requests
- [ ] Test with various access request scenarios

### 18. Access Request Table Component (1 point)

**Goal**: Create component for displaying access request data

**Substeps**:
- [ ] Create new file `src/components/AccessRequestTable.tsx`
- [ ] Implement `AccessRequestTable()` component with:
  ```typescript
  interface AccessRequestTableProps {
    requests: AccessRequest[];
    onApprove: (requestId: string) => void;
    onDeny: (requestId: string) => void;
    onEmailClick: (request: AccessRequest) => void;
  }
  ```
- [ ] Add table features:
  - [ ] Status badge rendering with color coding
  - [ ] Timeline calculations display
  - [ ] Action buttons (Approve, Deny, Email)
  - [ ] Sortable columns and filtering
- [ ] Implement responsive design for mobile devices
- [ ] Add loading states and empty state handling

### 19. Email Template Utilities (1 point)

**Goal**: Create email template system for access approvals

**Substeps**:
- [ ] Create new file `src/lib/email-templates.ts`
- [ ] Implement functions:
  ```typescript
  export function generateAccessApprovalEmail(request: AccessRequest, accessCode: string): EmailTemplate
  export function createAccessLink(accountId: string, accessCode: string): string
  export function validateEmailTemplate(template: EmailTemplate): boolean
  export function renderEmailHTML(template: EmailTemplate): string
  ```
- [ ] Create email templates with dynamic content:
  - [ ] Subject line with account name
  - [ ] Personalized greeting
  - [ ] Access link with embedded code
  - [ ] Registration instructions
- [ ] Add email validation and sanitization
- [ ] Test template generation with sample data

### 20. Email Composition Popup Component (1 point)

**Goal**: Create modal component for email composition

**Substeps**:
- [ ] Create new file `src/components/EmailPopup.tsx`
- [ ] Implement `EmailPopup()` component with:
  ```typescript
  interface EmailPopupProps {
    isOpen: boolean;
    request: AccessRequest;
    onClose: () => void;
    onSend: (emailData: EmailData) => void;
  }
  ```
- [ ] Add popup features:
  - [ ] Pre-filled email template
  - [ ] Editable subject and body
  - [ ] Access link preview
  - [ ] Send and cancel actions
- [ ] Implement modal overlay with escape key handling
- [ ] Style consistently with existing admin interface
- [ ] Test popup functionality and email preview

### 21. Access Management Utility Functions (1 point)

**Goal**: Create utility functions for access management workflows

**Substeps**:
- [ ] Create new file `src/lib/access-management.ts`
- [ ] Implement functions:
  ```typescript
  export async function generateAccessCode(): Promise<string>
  export async function validateAccessRequest(request: Partial<AccessRequest>): Promise<ValidationResult>
  export async function processAccessApproval(requestId: string, adminId: string): Promise<ApprovalResult>
  export async function trackRegistrationCompletion(accessCode: string): Promise<void>
  ```
- [ ] Add access code generation with cryptographic security
- [ ] Implement request validation with business rules
- [ ] Add registration tracking and timeline calculations
- [ ] Test utility functions with unit tests

### 22. Registration Timeline Analytics (1 point)

**Goal**: Create analytics for tracking registration patterns

**Substeps**:
- [ ] Add timeline calculation functions to `src/lib/analytics.ts`:
  ```typescript
  export function calculateDaysSinceRequest(requestDate: Date): number
  export function calculateDaysBetweenRequestAndRegistration(requestDate: Date, registrationDate: Date): number
  export function getRegistrationStatus(request: AccessRequest): RegistrationStatus
  ```
- [ ] Update access request display components to show timeline data
- [ ] Add visual indicators for:
  - [ ] Pending requests (days waiting)
  - [ ] Approved but unregistered (days since approval)
  - [ ] Completed registrations (timeline summary)
- [ ] Test timeline calculations with various date scenarios

### 23. Back Office Navigation Integration (1 point)

**Goal**: Integrate back office functionality into admin navigation

**Substeps**:
- [ ] Update `src/app/admin/layout.tsx` to add back office navigation:
  ```typescript
  <nav>
    <Link href="/admin/back-office">User Analytics</Link>
    <Link href="/admin/back-office/access-requests">Access Requests</Link>
  </nav>
  ```
- [ ] Add conditional navigation based on system admin status
- [ ] Update page titles and breadcrumbs
- [ ] Style navigation consistently with existing admin interface
- [ ] Test navigation flow between back office pages

## Phase 4: Email Integration and Approval Workflow (9 Points)

### 24. Email Template Engine Implementation (1 point)

**Goal**: Create robust email template system with dynamic content

**Substeps**:
- [ ] Enhance `src/lib/email-templates.ts` with advanced templating:
  ```typescript
  export class EmailTemplateEngine {
    static renderTemplate(template: string, variables: Record<string, any>): string
    static validateTemplate(template: string): TemplateValidation
    static previewTemplate(template: string, sampleData: any): string
  }
  ```
- [ ] Add template variables support: `{{accountName}}`, `{{accessLink}}`, `{{requesterName}}`
- [ ] Implement HTML email templates with CSS styling
- [ ] Add text-only fallback templates
- [ ] Test template rendering with various data scenarios

### 25. Email Sending Integration (1 point)

**Goal**: Integrate email sending capability (mock implementation)

**Substeps**:
- [ ] Create new file `src/lib/email-service.ts` with interface:
  ```typescript
  export interface EmailService {
    sendApprovalEmail(to: string, template: EmailTemplate): Promise<EmailResult>
    validateEmailAddress(email: string): boolean
    trackEmailDelivery(emailId: string): Promise<DeliveryStatus>
  }
  ```
- [ ] Implement mock email service for development:
  ```typescript
  export class MockEmailService implements EmailService
  ```
- [ ] Add email sending to approval workflow
- [ ] Log email sending attempts for audit trail
- [ ] Test email service integration

### 26. Approval Workflow Automation (1 point)

**Goal**: Create streamlined approval process with automation

**Substeps**:
- [ ] Update `src/components/AccessRequestTable.tsx` with one-click approval:
  - [ ] Add "Quick Approve & Email" button
  - [ ] Implement approval confirmation dialog
  - [ ] Add batch approval functionality for multiple requests
- [ ] Create approval workflow in `src/lib/access-management.ts`:
  ```typescript
  export async function quickApproval(requestId: string, adminId: string): Promise<ApprovalResult>
  ```
- [ ] Add status tracking and audit logging
- [ ] Implement rollback functionality for approval errors
- [ ] Test complete approval workflow end-to-end

### 27. Access Link Generation and Validation (1 point)

**Goal**: Create secure access link system for approved users

**Substeps**:
- [ ] Enhance `src/lib/email-templates.ts` with secure link generation:
  ```typescript
  export function generateSecureAccessLink(accountId: string, accessCode: string, expirationHours?: number): string
  export function validateAccessLink(link: string): LinkValidation
  ```
- [ ] Add access code expiration logic (default 7 days)
- [ ] Create access code redemption API endpoint
- [ ] Add link validation and security checks
- [ ] Test link generation and validation

### 28. Registration Completion Tracking (1 point)

**Goal**: Track when approved users complete registration

**Substeps**:
- [ ] Create new file `src/app/api/access/redeem/route.ts` for access code redemption
- [ ] Implement registration completion tracking:
  ```typescript
  export async function markRegistrationComplete(accessCode: string, userId: string): Promise<void>
  ```
- [ ] Update access_requests table when registration is completed
- [ ] Add webhook or trigger for automatic completion detection
- [ ] Create registration completion analytics
- [ ] Test registration tracking workflow

### 29. Email Template Preview System (1 point)

**Goal**: Create preview system for email templates before sending

**Substeps**:
- [ ] Add preview functionality to `src/components/EmailPopup.tsx`:
  - [ ] Preview tab with rendered HTML
  - [ ] Variable substitution preview
  - [ ] Mobile/desktop preview modes
- [ ] Implement preview API endpoint for template testing
- [ ] Add template validation and error highlighting
- [ ] Create sample data for template preview
- [ ] Test preview functionality with various templates

### 30. Comprehensive Testing Suite (1 point)

**Goal**: Create test suite for all back office functionality

**Substeps**:
- [ ] Create test file `src/__tests__/back-office.test.ts` with tests for:
  - [ ] Domain configuration utilities
  - [ ] User analytics calculations
  - [ ] Access request management
  - [ ] Email template generation
- [ ] Use Supabase MCP to create test data:
  ```sql
  INSERT INTO access_requests (requester_email, account_id, status) VALUES 
  ('test@example.com', 'test-account-id', 'pending');
  ```
- [ ] Test API endpoints with different user permissions
- [ ] Verify database constraints and validations
- [ ] Test complete user workflows end-to-end

### 31. Admin Permissions and Security Validation (1 point)

**Goal**: Validate security and permissions throughout back office system

**Substeps**:
- [ ] Test route protection for all back office paths:
  - [ ] `/admin/back-office` - requires is_admin flag
  - [ ] `/admin/back-office/access-requests` - requires system admin
  - [ ] API endpoints - require admin authentication
- [ ] Validate database RLS policies for new tables
- [ ] Test SQL injection prevention in new queries
- [ ] Verify access control for user analytics data
- [ ] Create security test scenarios and document results

### 32. Documentation and Deployment Preparation (1 point)

**Goal**: Complete documentation and prepare for deployment

**Substeps**:
- [ ] Update environment variable documentation in README
- [ ] Create admin user setup guide for is_admin flag
- [ ] Document email template customization process
- [ ] Create deployment checklist for domain configuration
- [ ] Test all functionality in development environment
- [ ] Verify no unauthorized file modifications outside approved list
- [ ] Create post-deployment verification checklist

## Validation and Testing Requirements

### Database Validation
- [ ] Verify all new tables have proper RLS policies
- [ ] Test foreign key constraints and cascading deletes
- [ ] Validate data types and constraints
- [ ] Test migration rollback procedures

### API Testing  
- [ ] Test all new API endpoints with authentication
- [ ] Verify error handling and status codes
- [ ] Test rate limiting and security measures
- [ ] Validate request/response schemas

### Integration Testing
- [ ] Test complete user workflows end-to-end
- [ ] Verify email sending and template rendering
- [ ] Test approval workflow with real data
- [ ] Validate domain configuration in different environments

### Security Testing
- [ ] Test admin access controls
- [ ] Verify unauthorized access prevention
- [ ] Test SQL injection prevention
- [ ] Validate input sanitization

## Success Criteria

- [ ] Domain configuration working in all environments
- [ ] System admin flag properly integrated into authentication
- [ ] User analytics dashboard displaying accurate data
- [ ] Access request management workflow functional
- [ ] Email system generating and sending approval emails
- [ ] All authorized files updated according to specifications
- [ ] No unauthorized modifications outside approved file list
- [ ] Complete test coverage for all new functionality
- [ ] Documentation updated with new features
- [ ] Security validation completed successfully

## Notes for Implementation

- **Database First**: Always check current database state with Supabase MCP before making changes
- **Testing Required**: Each story point task should include testing verification
- **Security Focus**: Validate admin permissions at every step
- **Error Handling**: Implement comprehensive error handling for all new functionality
- **Performance**: Consider query optimization for analytics calculations
- **Rollback Plan**: Ensure all database changes can be safely rolled back if needed