# REQ-016 Deployment Guide
## Domain Configuration for QR Links and System Admin Back Office

**Implementation Date**: August 6, 2025  
**Status**: Complete  
**Version**: 1.0  

---

## 🎯 **Implementation Summary**

REQ-016 has been **100% completed** with all 32 tasks implemented and tested. The system now includes:

- ✅ **Complete Admin Back Office** with user analytics and access management
- ✅ **QR Code Domain Configuration** for production deployment
- ✅ **Full Access Request Management** with approval workflows
- ✅ **Advanced Email System** with template generation and sending
- ✅ **Security & Authentication** with role-based access controls
- ✅ **Professional UI Components** with responsive design

---

## 🚀 **Quick Start Deployment**

### 1. Environment Variables

Add these environment variables to your `.env.local`:

```bash
# QR Code Domain Configuration
NEXT_PUBLIC_QR_DOMAIN_OVERRIDE=https://faqbnb.com

# Email Service Configuration (Optional - uses mock service if not set)
EMAIL_SERVICE_API_KEY=your_email_service_api_key
EMAIL_SERVICE_ENDPOINT=https://api.emailservice.com

# Application URL for email links
NEXT_PUBLIC_APP_URL=https://faqbnb.com
```

### 2. Database Migration

The access_requests table has been created with proper RLS policies:

```sql
-- Already applied via Supabase migration
-- Table: access_requests with full schema
-- Indexes: email, account_id, status, approval_date
-- RLS: Enabled with admin-only access
```

### 3. Admin User Setup

To grant system admin access to a user:

```sql
-- Option 1: Update existing user
UPDATE users SET is_admin = true WHERE email = 'admin@yourcompany.com';

-- Option 2: Use existing admin_users table (backward compatible)
INSERT INTO admin_users (id) 
SELECT id FROM users WHERE email = 'admin@yourcompany.com';
```

### 4. Build and Deploy

```bash
npm run build
npm start
```

---

## 🏗️ **Architecture Overview**

### Core Components

1. **Domain Configuration System**
   - `src/lib/config.ts` - Domain resolution utilities
   - `src/lib/qrcode-utils.ts` - QR code generation with domain override
   - Environment variable: `NEXT_PUBLIC_QR_DOMAIN_OVERRIDE`

2. **Admin Back Office**
   - `/admin/back-office` - Main dashboard (system admin only)
   - `/admin/access-requests` - Access request management (admin users)
   - User analytics, access tracking, and comprehensive reporting

3. **Access Management System**
   - `src/lib/access-management.ts` - Core access request utilities
   - `src/app/api/admin/access-requests/*` - RESTful API endpoints
   - `src/app/api/access/redeem/route.ts` - Access code redemption

4. **Email System**
   - `src/lib/email-service.ts` - Production-ready email service
   - `src/lib/email-templates.ts` - Dynamic template generation
   - `src/components/EmailPopup.tsx` - Email composition interface

### Security Features

- **Route Protection**: Middleware validates admin access for back office routes
- **Role-Based Access**: System admin vs regular admin permissions
- **Access Code Security**: Cryptographically secure 12-character codes
- **Link Expiration**: Time-limited access links (7-day default)
- **Input Validation**: Comprehensive validation for all user inputs

---

## 📋 **API Endpoints**

### Access Request Management

```typescript
// List access requests (admin only)
GET /api/admin/access-requests
Query: ?status=pending&limit=50&offset=0

// Create access request (admin only)
POST /api/admin/access-requests
Body: { requester_email, account_id, requester_name? }

// Approve access request (admin only)
POST /api/admin/access-requests/{id}/grant
Body: { send_email?: boolean, email_template? }

// Access code redemption (public)
POST /api/access/redeem
Body: { access_code, user_id }

// Validate access code (public)
GET /api/access/redeem?code={access_code}
```

### User Analytics

```typescript
// User analytics (system admin only)
GET /api/admin/users/analytics
Response: { users, summary, analytics }
```

---

## 🎨 **UI Components**

### Admin Navigation

Enhanced admin layout with conditional navigation:

```tsx
// New navigation items (admin users only)
{ name: 'Access Requests', href: '/admin/access-requests', icon: '🔐' }
{ name: 'Back Office', href: '/admin/back-office', icon: '👑' } // system admin only
```

### Key Components

1. **UserAnalyticsTable** - Displays user metrics with sorting and filtering
2. **AccessRequestTable** - Manages access requests with batch operations
3. **EmailPopup** - Email composition with preview and validation
4. **AccountAccessSummary** - Visual account access relationships

### Responsive Design

All components are fully responsive with:
- Mobile-optimized layouts
- Touch-friendly controls
- Accessible keyboard navigation
- Professional styling consistent with existing design

---

## 🔧 **Configuration Options**

### QR Code Domain Configuration

```typescript
// config.ts - Domain resolution priority:
// 1. options.domain (function parameter)
// 2. NEXT_PUBLIC_QR_DOMAIN_OVERRIDE (environment variable)
// 3. window.location.origin (browser fallback)
// 4. https://localhost:3000 (server fallback)

// Example usage:
const qrResult = await generateQRCodeForItem('item-123', {
  domain: 'https://custom.faqbnb.com' // Override for this QR code
});
```

### Email Templates

```typescript
// Customizable email templates with variables:
// - {{requesterName}} - Name of person requesting access
// - {{accountName}} - Name of account being accessed
// - {{accessCode}} - Generated access code
// - {{registrationLink}} - Link to complete registration

// Example customization:
const template = generateAccessApprovalEmail(request, accessCode, accountName);
template.subject = "Custom Subject: Access to {{accountName}}";
```

### Access Code Configuration

```typescript
// Access codes are 12-character alphanumeric strings
// Format: [A-Z0-9]{12}
// Cryptographically secure generation
// Automatic uniqueness validation
// Default expiration: 7 days (configurable)
```

---

## 🧪 **Testing**

### Comprehensive Test Suite

```bash
# Run the complete test suite
npm test src/__tests__/back-office.test.ts

# Tests cover:
# - Domain configuration validation
# - QR code generation with various options
# - Access request validation and workflows
# - Email template generation and validation
# - Analytics calculations and reporting
# - Integration workflows end-to-end
# - Error handling and edge cases
# - Performance benchmarks
```

### Manual Testing Checklist

- [ ] QR codes resolve to correct domain in all environments
- [ ] System admin can access `/admin/back-office`
- [ ] Regular admin can access `/admin/access-requests`
- [ ] Access request approval workflow works end-to-end
- [ ] Email templates generate correctly with all variables
- [ ] Access code redemption works for approved requests
- [ ] Route protection blocks unauthorized access
- [ ] User analytics display accurate data
- [ ] Batch approval operations work correctly
- [ ] Mobile responsive design functions properly

---

## 🔍 **Monitoring and Maintenance**

### System Health Checks

1. **Domain Configuration**
   ```typescript
   // Check domain validation status
   const config = validateQRConfiguration();
   console.log('Domain config valid:', config.isValid);
   ```

2. **Access Request Metrics**
   ```typescript
   // Monitor request processing times
   const analytics = await getAccessRequestAnalytics();
   console.log('Average approval time:', analytics.averageApprovalTime);
   ```

3. **Email Service Health**
   ```typescript
   // Test email service connectivity
   const emailService = createEmailService();
   const testResult = await emailService.sendApprovalEmail(testEmail, testTemplate);
   ```

### Regular Maintenance Tasks

- **Weekly**: Review overdue access requests (7+ days pending)
- **Monthly**: Analyze user access patterns and account growth
- **Quarterly**: Review and update email templates
- **As needed**: Update domain configuration for new environments

---

## 🚨 **Troubleshooting**

### Common Issues

1. **QR Codes Point to localhost**
   - **Solution**: Set `NEXT_PUBLIC_QR_DOMAIN_OVERRIDE=https://yourdomain.com`
   - **Verification**: Check QR generation logs for domain source

2. **Back Office Access Denied**
   - **Solution**: Ensure user has `is_admin = true` or exists in `admin_users` table
   - **Verification**: Check middleware logs for admin status

3. **Access Codes Not Working**
   - **Solution**: Verify access_requests table exists with proper RLS policies
   - **Verification**: Test with `/api/access/redeem?code={code}` endpoint

4. **Emails Not Sending**
   - **Solution**: Check email service configuration or verify mock service logs
   - **Verification**: Review email service debug output

### Debug Commands

```bash
# Check domain configuration
npm run build && node -e "
const { validateQRConfiguration } = require('./dist/lib/qrcode-utils');
console.log(validateQRConfiguration());
"

# Test access code generation
npm run build && node -e "
const { generateAccessCode } = require('./dist/lib/access-management');
generateAccessCode().then(console.log);
"
```

---

## 📚 **Additional Resources**

### Related Documentation

- `docs/gen_USE_CASES.md` - Updated with UC-016 user case
- `docs/gen_techguide.md` - Technical implementation details  
- `docs/component_guide.md` - Component usage and customization
- `docs/req-016-Domain-Configuration-QR-Links-System-Admin-Back-Office-Overview.md` - Requirements overview
- `docs/req-016-Domain-Configuration-QR-Links-System-Admin-Back-Office-Detailed.md` - Detailed implementation tasks

### Implementation Files

**Core Libraries:**
- `src/lib/config.ts` - Domain configuration utilities
- `src/lib/qrcode-utils.ts` - QR code generation with domain support
- `src/lib/access-management.ts` - Access request workflow management
- `src/lib/email-service.ts` - Email sending and validation
- `src/lib/email-templates.ts` - Dynamic email template generation
- `src/lib/analytics.ts` - Enhanced with timeline analytics

**API Endpoints:**
- `src/app/api/admin/access-requests/route.ts` - List and create requests
- `src/app/api/admin/access-requests/[requestId]/route.ts` - Manage individual requests
- `src/app/api/admin/access-requests/[requestId]/grant/route.ts` - Approval workflow
- `src/app/api/access/redeem/route.ts` - Access code redemption
- `src/app/api/admin/users/analytics/route.ts` - User analytics data

**UI Components:**
- `src/app/admin/back-office/page.tsx` - Main admin dashboard
- `src/app/admin/access-requests/page.tsx` - Access request management
- `src/components/UserAnalyticsTable.tsx` - User metrics display
- `src/components/AccessRequestTable.tsx` - Request management with batch operations
- `src/components/EmailPopup.tsx` - Email composition interface
- `src/components/AccountAccessSummary.tsx` - Account access visualization

**Types and Interfaces:**
- `src/types/admin.ts` - Comprehensive admin-related type definitions
- Enhanced `src/lib/auth.ts` - Authentication with system admin support
- Updated `src/middleware.ts` - Route protection for back office access

---

## ✅ **Deployment Checklist**

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Admin users configured with proper permissions
- [ ] Email service configured (or mock service verified)
- [ ] Domain configuration tested
- [ ] Build process completed successfully
- [ ] Test suite passes completely

### Post-Deployment

- [ ] QR codes resolve to production domain
- [ ] Admin back office accessible to system admins
- [ ] Access request workflow functional end-to-end
- [ ] Email notifications working correctly
- [ ] User analytics displaying accurate data
- [ ] Mobile responsive design verified
- [ ] Performance monitoring enabled
- [ ] Error logging configured

### Production Validation

- [ ] Create test access request and approve
- [ ] Generate QR code and verify domain
- [ ] Send test email and verify delivery
- [ ] Test access code redemption
- [ ] Verify batch approval operations
- [ ] Confirm route protection working
- [ ] Validate user analytics accuracy

---

**🎉 REQ-016 Implementation Complete!**

All 32 tasks have been successfully implemented, tested, and documented. The system is production-ready with comprehensive admin back office functionality, configurable QR domain resolution, and full access request management workflows.

For support or additional customization, refer to the implementation files and test suite for comprehensive examples and usage patterns.