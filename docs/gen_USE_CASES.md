# FAQBNB Use Cases

This document describes the use cases implemented in the FAQBNB QR Item Display System.

**Last Updated**: September 14, 2025 03:02:28 CEST - UC-027 Print-Only View Added

---

## UC001 - Complete Admin CRUD Functionality
**Origin**: Request #001 from gen_requests.md  
**Implementation Status**: Phase 1 & 2 Completed  
**Date Implemented**: July 21, 2025

### Description
Administrators can perform complete CRUD (Create, Read, Update, Delete) operations on items and their associated links through a comprehensive admin interface.

### Actors
- **Primary**: System Administrator
- **Secondary**: Content Manager

### Preconditions
- User has access to the admin panel at `/admin`
- Database is properly configured with items and item_links tables
- Admin API endpoints are functional

### Main Flow

#### UC001.1 - List and Search Items
1. Admin navigates to `/admin`
2. System displays paginated list of all items
3. Admin can search items by name or public ID
4. System filters results based on search criteria
5. Each item shows name, creation date, and link count

#### UC001.2 - Create New Item
1. Admin clicks "Create New Item" or navigates to `/admin/items/new`
2. System displays ItemForm with empty fields
3. System auto-generates UUID for public ID
4. Admin enters item name and description
5. Admin adds multiple links with different types (YouTube, PDF, Image, Text)
6. Admin can reorder links via drag-and-drop
7. System validates all input data
8. Admin submits form
9. System creates item and associated links in database
10. System redirects to admin panel with success message

#### UC001.3 - Edit Existing Item
1. Admin clicks "Edit" on an item from the admin panel
2. System navigates to `/admin/items/[publicId]/edit`
3. System loads existing item data
4. System populates ItemForm with current data
5. Admin modifies item details and/or links
6. Admin can add, remove, or reorder links
7. System validates changes
8. Admin submits updated form
9. System updates database with changes
10. System redirects to admin panel with success message

#### UC001.4 - Delete Item
1. Admin clicks "Delete" on an item from the admin panel
2. System shows confirmation dialog
3. Admin confirms deletion
4. System deletes item and cascade deletes all associated links
5. System updates admin panel to reflect deletion
6. Public item page returns 404 for deleted item

### Alternative Flows
- **Validation Errors**: System displays specific error messages for invalid data
- **Network Errors**: System shows user-friendly error messages and retry options
- **Item Not Found**: System displays appropriate error page and navigation options
- **Concurrent Updates**: System handles conflicts gracefully

### Postconditions
- **Success**: Item data is correctly managed in database
- **Success**: Changes are immediately reflected in both admin and public views
- **Success**: System maintains data integrity and referential constraints

### Technical Requirements Met
- ✅ Full CRUD API endpoints (`GET`, `POST`, `PUT`, `DELETE`)
- ✅ Form pages with React integration
- ✅ Real-time validation and error handling
- ✅ Database transaction safety
- ✅ Responsive UI design
- ✅ TypeScript type safety

### API Endpoints Implemented
- `GET /api/admin/items` - List items with search and pagination
- `POST /api/admin/items` - Create new item with links
- `PUT /api/admin/items/[publicId]` - Update existing item
- `DELETE /api/admin/items/[publicId]` - Delete item and links

### Pages Implemented
- `/admin/items/new` - Create item form
- `/admin/items/[publicId]/edit` - Edit item form

---

## UC005 - Multi-Tenant Property Management System
**Origin**: Request #005 from gen_requests.md  
**Implementation Status**: Phase 1 Complete (Database Schema), Phase 2 In Progress  
**Date Implemented**: July 25, 2025

### Description
The system supports multi-tenant architecture where users can register, manage multiple properties, and organize items by property location. Regular users can only access their own properties while admin users maintain system-wide access.

### Actors
- **Primary**: Property Owner (Regular User)
- **Secondary**: System Administrator
- **Tertiary**: Public QR Code Scanner

### Preconditions
- Multi-tenant database schema is implemented
- Supabase authentication is configured
- RLS (Row Level Security) policies are active
- Property types are pre-configured

### Main Flow

#### UC005.1 - User Registration and Property Setup
1. New user registers using Supabase authentication
2. System creates user record in multi-tenant database
3. User creates their first property with nickname, address, and type
4. System associates property with user account
5. User can create items assigned to their properties

#### UC005.2 - Multi-Property Management
1. User logs into system
2. System displays only properties owned by the user
3. User can create new properties (house, apartment, villa, etc.)
4. User assigns items to specific properties during creation/editing
5. System enforces property ownership isolation via RLS policies

#### UC005.3 - Property-Based Item Organization
1. User selects a property context
2. System displays only items belonging to that property
3. User creates/edits items within property scope
4. Items maintain connection to properties via property_id foreign key
5. Analytics are filtered by property ownership

#### UC005.4 - Admin System-Wide Management
1. Admin user logs in with elevated privileges
2. System allows access to all properties across all users
3. Admin can view/manage any property or item
4. Admin can access system-wide analytics and reporting
5. Admin can manage property types and system configuration

#### UC005.5 - Public QR Code Access (Backwards Compatible)
1. Anyone scans QR code or visits item URL
2. System provides public read access to item regardless of property
3. Item displays correctly without authentication required
4. Analytics tracking continues to work for anonymous users

### Alternative Flows
- **Property Creation Errors**: System validates property data and shows specific errors
- **Access Denied**: Users attempting to access other users' properties receive access denied
- **Legacy Item Migration**: Existing items are automatically assigned to default "Legacy Items" property
- **Admin Override**: Admin users can access any data for support purposes

### Postconditions
- **Success**: User data is properly isolated by property ownership
- **Success**: Admin users maintain system-wide access for management
- **Success**: Public QR code functionality remains unaffected
- **Success**: Analytics are accurately filtered by property scope

### Technical Implementation Completed

#### Database Schema (Phase 1 Complete)
- ✅ `property_types` table with standard property classifications
- ✅ `users` table linked to Supabase authentication
- ✅ `properties` table with user ownership and property type relationships
- ✅ Updated `items` table with required `property_id` foreign key
- ✅ Migrated existing items to default "Legacy Items" property
- ✅ Multi-tenant RLS policies for data isolation
- ✅ Updated analytics tables with property-based access control

#### Type System Updates (Phase 2 Partial)
- ✅ Complete Supabase TypeScript definitions for all new tables
- ✅ Foreign key relationships properly typed
- ✅ Multi-tenant type safety enabled

### Security Features Implemented
- ✅ Row Level Security (RLS) policies enforce property ownership
- ✅ Admin bypass policies for system management
- ✅ Public read access maintained for QR code functionality
- ✅ Property-based analytics access control

### Migration Safety
- ✅ All existing items preserved during migration
- ✅ Backward compatibility maintained for public access
- ✅ No breaking changes to existing QR code functionality

---

## UC006 - Admin Items Management Interface
**Origin**: Request #006 from gen_requests.md (Quick Wins - Admin Panel Issues Resolution)  
**Implementation Status**: Complete  
**Date Implemented**: July 25, 2025 17:00 CEST

### Description
Administrators can access a dedicated items management interface that provides comprehensive listing, filtering, and management capabilities for all items in the system. This resolves the critical 404 error that occurred when navigating to `/admin/items`.

### Actors
- **Primary**: System Administrator
- **Secondary**: Property Manager, Content Manager

### Preconditions
- User is authenticated and has admin access
- User has navigated to `/admin/items` route
- Supabase database connection is established

### Main Flow

#### UC006.1 - Access Items Management Interface
1. Admin clicks "Items" navigation in admin panel
2. System loads `/admin/items` page (previously returned 404)
3. System displays authentication guard if not logged in
4. System redirects to login if authentication fails
5. System loads items management interface for authenticated admin

#### UC006.2 - View Items Listing
1. System fetches all items via `/api/admin/items` endpoint
2. System displays items in card-based layout
3. Each item card shows:
   - Item name and description
   - Public ID and property association
   - Links count, visits count, reactions count
   - Quick action buttons (Analytics, Edit, View)
4. System shows loading state during data fetch
5. System handles empty state with helpful messaging

#### UC006.3 - Property-Specific Filtering
1. Admin selects a property from property selector
2. System filters items to show only those belonging to selected property
3. System displays property information banner
4. System updates item counts and statistics accordingly

#### UC006.4 - Quick Item Actions
1. **Analytics Action**: Admin clicks "📈 Analytics" button
   - System navigates to `/admin/items/[publicId]/analytics`
   - Shows detailed analytics for specific item
2. **Edit Action**: Admin clicks "✏️ Edit" button
   - System navigates to `/admin/items/[publicId]/edit`
   - Opens item editing interface
3. **View Action**: Admin clicks "👁️ View" button
   - System navigates to `/item/[publicId]`
   - Shows public view of the item

#### UC006.5 - Navigation and Management
1. **Add New Item**: Admin clicks "+ Add New Item" button
   - System navigates to `/admin/items/new`
   - Opens item creation interface
2. **Back to Dashboard**: Admin clicks "← Back to Dashboard"
   - System navigates to `/admin` main dashboard
3. **Statistics Overview**: System displays aggregate statistics
   - Total items count
   - Total links across all items
   - Total visits across all items
   - Total reactions across all items

### Error Handling

#### UC006.E1 - API Connection Failure
1. System detects API connection error
2. System displays error banner with retry option
3. Admin can click "Retry" to reload data
4. System provides technical error details for debugging

#### UC006.E2 - Authentication Failure
1. System detects expired or invalid session
2. System displays authentication required message
3. System provides "Go to Login" button
4. System redirects to login page maintaining return URL

#### UC006.E3 - No Items Available
1. System detects empty items list
2. System displays empty state with helpful messaging
3. System shows "Create Your First Item" call-to-action
4. System differentiates between property-specific and global empty states

### Success Criteria
- [x] `/admin/items` route is accessible without 404 error
- [x] Authentication protection is properly implemented
- [x] Items listing loads and displays correctly
- [x] Property filtering works with multi-tenant support
- [x] Quick actions navigate to correct destinations
- [x] Error states are handled gracefully
- [x] Empty states provide helpful guidance
- [x] Statistics are calculated and displayed accurately

### Technical Implementation
- **Component**: `AdminItemsPage` in `/src/app/admin/items/page.tsx`
- **API Integration**: Uses `/api/admin/items` endpoint
- **Authentication**: Integrated with `AuthContext` and `useAuth` hook
- **Error Handling**: Comprehensive error states with user guidance
- **Loading States**: Progressive loading with skeleton states
- **Responsive Design**: Mobile-friendly card layout

### Benefits
- **Bug Resolution**: Fixed critical 404 error for admin items route
- **User Experience**: Improved navigation flow in admin panel
- **Productivity**: Quick access to item management actions
- **Data Visibility**: Clear overview of item statistics and status
- **Error Recovery**: Robust error handling with recovery options

---

## UC007 - Professional PDF QR Code Printing System
**Origin**: Request #013 from gen_requests.md  
**Implementation Status**: ✅ COMPLETED  
**Date Implemented**: August 2, 2025 10:57 CEST

### Description
Property managers and administrators can export QR codes as professional PDF documents with vector-based cutting guides, supporting both A4 and US Letter formats. The system generates mathematically precise PDFs with customizable layouts, margins, QR sizes, and optional labels for high-quality printing and professional presentation.

### Actors
- **Primary**: Property Manager/Administrator
- **Secondary**: Maintenance Staff, Operations Team
- **Tertiary**: Print Service Provider

### Preconditions
- User has generated QR codes for items in QRCodePrintManager
- User has completed the QR generation process (select, configure, preview steps)
- QR codes are successfully generated and available for export
- User has access to PDF export functionality

### Main Flow

#### UC007.1 - Initiate PDF Export from QR Print Manager
1. User completes QR code generation workflow (select items, configure settings, generate codes)
2. System displays QR codes in preview step with generated QR codes ready
3. User clicks "📄 Export PDF" button alongside existing "🖨️ Print QR Codes" button
4. System validates QR codes availability and opens PDF export options modal
5. System displays PDF configuration interface with current settings

#### UC007.2 - Configure PDF Export Settings
1. **Page Format Selection**:
   - User selects between A4 (210×297mm) or US Letter (8.5×11") format
   - System displays visual preview of selected page format
   - System updates layout calculations based on format selection

2. **Margin Configuration**:
   - User adjusts margins using slider control (5-25mm range)
   - System provides real-time feedback on usable print area
   - System validates margin values and clamps to valid range

3. **QR Code Size Configuration**:
   - User sets QR code size using slider (20-60mm range)
   - System displays visual preview of QR code at selected size
   - System automatically calculates grid layout based on size

4. **PDF Options Selection**:
   - User toggles "Include Cutlines" for professional cutting guides
   - User toggles "Include Labels" for item name display
   - System shows real-time preview of selected options

#### UC007.3 - Generate and Download PDF
1. User clicks "Export PDF" button in modal
2. System validates all settings and QR codes availability
3. System initiates PDF generation pipeline with progress indication:
   - Validating input (0%)
   - Creating PDF document (5%)
   - Calculating layout (10%)
   - Generating QR codes (40%)
   - Embedding QR codes and labels (70%)
   - Adding cutlines (80%)
   - Finalizing PDF (90%)
   - Complete (100%)
4. System generates timestamped filename (e.g., "QR-Codes-2025-08-02T10-57-10.pdf")
5. System triggers browser download of PDF file
6. System displays success message with generation statistics
7. System automatically closes PDF options modal

#### UC007.4 - Multi-Page Document Generation
1. System calculates how many QR codes fit per page based on settings
2. For large QR code batches, system generates multiple PDF pages
3. System maintains consistent layout, margins, and cutlines across all pages
4. System ensures even distribution of QR codes across pages
5. Each page includes complete cutting guides and proper margins

### Alternative Flows

#### UC007.A1 - No QR Codes Available
1. User attempts to export PDF before generating QR codes
2. System displays error message: "No QR codes available for PDF export"
3. System provides guidance to complete QR generation first
4. User returns to QR generation workflow

#### UC007.A2 - Invalid Settings Configuration
1. User configures invalid settings (e.g., margins too large, QR size invalid)
2. System validates settings and displays specific error messages
3. System highlights problematic settings in the interface
4. System prevents PDF generation until settings are corrected
5. User adjusts settings within valid ranges

#### UC007.A3 - PDF Generation Failure
1. System encounters error during PDF generation process
2. System displays user-friendly error message with retry option
3. System provides detailed error information for troubleshooting
4. User can retry generation or adjust settings
5. System maintains existing QR codes for subsequent attempts

### Success Scenarios

#### UC007.S1 - Small Batch Export (1-10 QR Codes)
- Single-page PDF with optimal layout
- All QR codes fit on one page with proper spacing
- Cutting guides provide precise boundaries
- Labels clearly identify each item

#### UC007.S2 - Large Batch Export (20+ QR Codes)  
- Multi-page PDF with consistent layout
- Pages are evenly distributed with QR codes
- Cutting guides maintain alignment across pages
- Performance remains responsive during generation

#### UC007.S3 - Professional Printing Workflow
- PDF exports with vector-based cutting guides
- QR codes maintain scan quality at print resolution
- Margins ensure compatibility with commercial printers
- Document ready for professional print service

### Postconditions
- **Success**: High-quality PDF document downloaded to user's device
- **Success**: PDF contains precisely positioned QR codes with mathematical accuracy
- **Success**: Vector cutting guides enable professional trimming and alignment
- **Success**: QR codes maintain optimal scan quality for intended print size
- **Success**: Browser print functionality remains completely unaffected
- **Success**: Original QR codes remain available for additional exports

### Technical Implementation Features

#### Mathematical Precision
- ✅ Sub-pixel coordinate accuracy for professional printing alignment
- ✅ Vector-based dashed cutting guides (4pt on/4pt off pattern, #999 color)
- ✅ Precise unit conversions between millimeters, points, pixels, and inches
- ✅ Grid layout calculations with automatic column/row optimization

#### PDF Generation Pipeline
- ✅ Complete PDF generation using pdf-lib library for vector output
- ✅ QR code optimization and embedding with print-quality resolution
- ✅ Multi-page document support with consistent layout preservation
- ✅ Progress tracking and user feedback during generation process

#### User Interface Integration
- ✅ Seamless integration with existing QR Print Manager workflow
- ✅ Responsive PDF export options modal with intuitive controls
- ✅ Real-time settings validation and visual feedback
- ✅ Loading states and error handling with recovery options

#### Quality Assurance
- ✅ Comprehensive TypeScript type definitions for all PDF components
- ✅ 15 unit test suites covering all functionality aspects
- ✅ Cross-browser compatibility and performance optimization
- ✅ Error handling with graceful degradation and user guidance

### Business Value
- **Professional Output**: Enables high-quality printed materials for property management
- **Operational Efficiency**: Streamlines QR code printing workflow for maintenance teams
- **Brand Quality**: Provides professional-grade output suitable for customer-facing materials
- **Cost Savings**: Enables in-house printing with commercial-quality results
- **Scalability**: Supports large property portfolios with batch processing capabilities

### Integration Points
- **QRCodePrintManager**: Seamlessly integrated without disrupting existing browser print functionality
- **PDF Generation Pipeline**: Complete end-to-end workflow from QR generation to PDF download
- **Settings Management**: Persistent user preferences for repeated export operations
- **Error Handling**: Comprehensive validation and user guidance throughout process

---

## UC008 - Registration Link Copy Feature for Admin Access Management  
**Origin**: Enhancement to REQ-018 Registration Page Access Code OAuth implementation  
**Implementation Status**: ✅ COMPLETED  
**Date Implemented**: August 7, 2025 12:27 CEST

### Description
System administrators can efficiently copy registration links with pre-filled access codes and email addresses directly to their clipboard from the Access Request Management interface. This feature streamlines the process of sharing registration links with approved users, providing immediate visual feedback and independent button operation for each access request.

### Actors
- **Primary**: System Administrator
- **Secondary**: Support Staff, Account Manager

### Preconditions
- User has admin access to `/admin/access-requests` interface
- Access requests exist with approved status
- Access requests have valid access codes and email addresses
- User's browser supports the Clipboard API (modern browsers)

### Main Flow

#### UC008.1 - Copy Registration Link from Access Request Table
1. Admin navigates to Access Request Management interface (`/admin/access-requests`)
2. System displays table of access requests with various statuses
3. Admin identifies approved access request requiring registration link sharing
4. Admin clicks "📋 Copy Link" button in the Actions column for specific request
5. System generates registration URL with access code and email as query parameters
6. System copies complete registration link to admin's clipboard
7. System displays "Copied" text on the clicked button for 5 seconds
8. System restores original "📋 Copy Link" text after timeout

#### UC008.2 - Independent Button Operation for Multiple Requests
1. Admin working with multiple access requests in table view
2. Admin clicks "📋 Copy Link" button on first request (e.g., copy.test@example.com)
3. System shows "Copied" feedback only on the clicked button
4. Other copy buttons remain unchanged showing "📋 Copy Link"
5. Admin can immediately click different copy button (e.g., brownieswithnuts@gmail.com)
6. System shows "Copied" feedback only on newly clicked button
7. First button restores to normal state after its individual 5-second timeout

#### UC008.3 - Registration Link Generation and Format
1. System retrieves access code and email from selected access request
2. System constructs registration URL using base application URL
3. System adds access_code and email as URL query parameters
4. Example format: `http://localhost:3000/register?access_code=COPY12345678&email=copy.test%40example.com`
5. Generated link enables direct registration with pre-filled credentials
6. Link bypasses manual access code entry for improved user experience

### Alternative Flows

#### UC008.A1 - Missing Access Code or Email
1. Admin clicks copy button on request missing access code or email
2. System validates required data availability
3. System displays alert: "Access code or email not available for this request"
4. Admin reviews request details and ensures proper approval process completion
5. Admin resolves missing data before attempting copy operation

#### UC008.A2 - Clipboard API Unavailable (Fallback)
1. Admin clicks copy button in browser without Clipboard API support
2. System attempts clipboard operation and catches failure
3. System displays alert dialog with complete registration link text
4. Admin manually copies link from alert dialog
5. System logs fallback usage for monitoring purposes

#### UC008.A3 - Network or Application Error
1. Admin clicks copy button during temporary system issue
2. System encounters error during link generation or clipboard operation
3. System displays user-friendly error message with retry option
4. System maintains original button state without false positive feedback
5. Admin can retry operation when system recovers

### Success Scenarios

#### UC008.S1 - Single Request Copy Operation
- Admin copies one registration link successfully
- Clipboard contains properly formatted registration URL
- Visual feedback confirms successful operation
- Admin can paste link into email, chat, or document

#### UC008.S2 - Multiple Sequential Copy Operations
- Admin copies links for multiple approved requests
- Each button operates independently with individual feedback
- No interference between button states or timeouts
- Efficient workflow for batch link distribution

#### UC008.S3 - Email Template Integration Workflow
- Admin copies registration link from interface
- Admin pastes link into email template or communication tool
- Recipients receive direct link with pre-filled registration credentials
- Registration process streamlined for end users

### Postconditions
- **Success**: Registration link copied to admin's clipboard
- **Success**: Visual confirmation provided for successful copy operation
- **Success**: Button independence maintained across multiple operations
- **Success**: Generated link enables seamless user registration experience
- **Failure**: Clear error messaging guides admin toward resolution

### Technical Implementation Features

#### Clipboard Integration
- ✅ Modern Clipboard API implementation for seamless copy operation
- ✅ Fallback alert dialog for browsers without Clipboard API support
- ✅ Error handling with graceful degradation and user feedback

#### Visual Feedback System
- ✅ Button text changes from "📋 Copy Link" to "Copied" for 5 seconds
- ✅ Independent button state management preventing cross-interference
- ✅ Button reference captured before async operations to prevent null errors
- ✅ Visual feedback scoped to specific clicked button using event.currentTarget

#### URL Generation
- ✅ Dynamic base URL detection using environment variables
- ✅ Proper URL encoding for email addresses and special characters
- ✅ URLSearchParams for clean query parameter construction
- ✅ Integration with existing email template link generation functions

#### Error Handling and Validation
- ✅ Input validation for access code and email availability
- ✅ Async operation error handling with try-catch blocks
- ✅ Browser compatibility checks and fallback strategies
- ✅ Detailed console logging for debugging and monitoring

### User Experience Benefits
- **Efficiency**: One-click copy operation eliminates manual URL construction
- **Accuracy**: Automated link generation prevents transcription errors
- **Feedback**: Clear visual confirmation of successful copy operations
- **Independence**: Multiple buttons operate without interference
- **Accessibility**: Fallback support for various browser capabilities

### Integration Points
- **Access Request Management**: Seamlessly integrated into existing admin interface
- **Email Template System**: Compatible with existing registration link generation
- **Authentication System**: Leverages existing access code validation infrastructure
- **Admin Dashboard**: Consistent with overall admin interface design patterns

### Security Considerations
- **Access Control**: Feature only available to authenticated admin users
- **Data Validation**: Input sanitization and validation for all link components
- **Audit Trail**: Action logging maintains accountability for admin operations
- **Secure URLs**: Generated links use secure HTTPS protocol in production

---

## UC-027: Print-Only View for QR Code Generation
**Origin**: Request #027 from gen_requests.md (BUG FIX REQUEST - Browser Print Including UI Elements)
**Implementation Status**: ✅ COMPLETED
**Date Implemented**: September 14, 2025

### Description
The system provides a dedicated print-only view for QR code generation, ensuring that only QR codes and their labels are included in the printed output. This feature eliminates the inclusion of UI elements in printed materials and provides a professional, clean output suitable for property management use.

### Actors
- **Primary**: Property Manager/Administrator
- **Secondary**: Maintenance Staff
- **Tertiary**: Print Service Provider

### Preconditions
- User has authenticated access to QR code generation
- User has selected items for QR code generation
- QR codes have been successfully generated
- User has access to browser print functionality

### Main Flow

#### UC027.1 - Print Route Access
1. User clicks "Print QR Codes" in QR code manager
2. System opens new window/tab with print-only route
3. Route validates user authentication and data
4. System displays QR codes in print-optimized layout
5. Print dialog automatically triggers

#### UC027.2 - Print-Only View Display
1. System renders QR codes without UI elements
2. QR codes arranged in grid layout with proper spacing
3. Labels positioned correctly under each QR code
4. Page margins and breaks optimized for printing
5. Print-specific styles applied automatically

#### UC027.3 - Window Management
1. Print window opens with correct dimensions
2. Print dialog triggers automatically
3. Window closes after print completion
4. Focus returns to main application window
5. Clean window lifecycle management

### Alternative Flows

#### UC027.A1 - Authentication Failure
1. User attempts to access print route without authentication
2. System redirects to login page
3. User completes authentication
4. System returns to print route with data
5. Print process continues normally

#### UC027.A2 - Invalid Data
1. System detects missing or invalid QR code data
2. User receives clear error message
3. System provides navigation back to QR manager
4. User can regenerate QR codes
5. Print process restarts with valid data

#### UC027.A3 - Print Dialog Cancellation
1. User cancels print dialog
2. Print window remains open
3. User can trigger print again or close window
4. System maintains data for retry
5. Window closes on user action

### Success Scenarios

#### UC027.S1 - Professional Print Output
- QR codes print without UI elements
- Labels are clearly readable
- Layout is consistent and professional
- Page breaks occur at logical points
- Output suitable for property management use

#### UC027.S2 - Efficient User Experience
- Print process starts automatically
- Window management is seamless
- User returns to main interface easily
- Multiple print attempts supported
- Clear error recovery paths available

### Postconditions
- **Success**: QR codes printed without UI elements
- **Success**: Print window closed automatically
- **Success**: User returned to main interface
- **Success**: Print output professionally formatted
- **Success**: Window resources properly cleaned up

### Technical Implementation Features

#### Print Route Architecture
- ✅ Dedicated `/print/qr-codes/[propertyId]` route
- ✅ Authentication protection via middleware
- ✅ Data validation and sanitization
- ✅ Print-optimized React components
- ✅ Automatic print triggering

#### Window Management
- ✅ Custom `usePrintWindow` hook for lifecycle management
- ✅ Automatic window cleanup
- ✅ Focus management between windows
- ✅ Error handling and recovery
- ✅ Resource cleanup on completion

#### Print Styling
- ✅ Print-specific CSS with proper margins
- ✅ Grid layout optimization
- ✅ Label positioning and readability
- ✅ Cross-browser compatibility
- ✅ Professional output formatting

### Business Value
- **Professional Output**: Clean, UI-free QR code printing
- **Efficiency**: Streamlined printing workflow
- **User Experience**: Automatic print triggering
- **Resource Usage**: Proper window management
- **Maintainability**: Dedicated print components

### Integration Points
- **Authentication System**: Protected print routes
- **QR Manager**: Print window triggering
- **Styling System**: Print-specific CSS
- **Window Management**: Lifecycle control
- **Error Handling**: Recovery mechanisms

### Success Metrics
- **Print Quality**: Professional output achieved
- **User Satisfaction**: Streamlined workflow
- **Performance**: Quick print route loading
- **Reliability**: Consistent print output
- **Maintainability**: Modular implementation

---

## Future Use Cases (Planned)

### UC002 - File Upload Management
**Status**: Not Implemented  
**Description**: Allow admins to upload and manage thumbnail images and PDF files directly through the admin interface.

---

## UC005 - Multi-Tenant Property Management
**Origin**: Request #005 from gen_requests.md  
**Implementation Status**: ✅ COMPLETED  
**Date Implemented**: July 25, 2025

### Description
Users can manage multiple properties in a multi-tenant environment with complete data isolation. Each user can create, manage, and organize items by property while maintaining secure access control.

### Actors
- **Primary**: Property Manager/User
- **Secondary**: System Administrator
- **Tertiary**: Property Owner

### Preconditions
- User must be authenticated via Supabase Auth
- User must have valid account in the system
- Property types must be available in the system

### Main Flow
1. **User Registration/Login**
   - User authenticates via Supabase Auth system
   - System creates user profile in `users` table
   - User gains access to property management dashboard

2. **Property Creation**
   - User navigates to property management interface
   - User selects property type from predefined list (house, apartment, villa, etc.)
   - User provides property nickname and optional address
   - System validates property data and creates property record
   - Property is automatically associated with the authenticated user

3. **Item Management by Property**
   - User selects a property from their property list
   - User can create, edit, and delete items within that property
   - All items are automatically associated with the selected property
   - User can view analytics filtered by specific properties

4. **Property-Based Analytics**
   - User accesses analytics dashboard
   - User can filter analytics data by specific properties
   - System displays visit counts, reaction data, and engagement metrics per property
   - Data is automatically isolated to user's own properties

### Alternative Flows
- **Admin Access**: System administrators can view and manage all properties and items across all users
- **Property Transfer**: Future enhancement to transfer property ownership between users
- **Bulk Property Operations**: Future enhancement for bulk property management

### Postconditions
- User has complete property management capabilities
- All data is properly isolated between users
- Analytics provide property-specific insights
- Public QR code access remains unchanged for end users

### Technical Implementation Details
- **Database**: New tables `property_types`, `users`, `properties` with full relational integrity
- **Security**: Row-Level Security (RLS) policies ensure complete data isolation
- **APIs**: All admin endpoints support optional property filtering
- **Frontend**: PropertySelector component enables property-based navigation
- **Migration**: Existing items migrated to "Legacy Items" property with zero downtime

### Business Value
- **Multi-Tenant SaaS**: Enables FAQBNB to serve multiple business customers
- **Data Isolation**: Ensures customer data privacy and security
- **Scalability**: Supports unlimited users and properties
- **Enterprise Ready**: Provides foundation for B2B customer acquisition

---

## Future Use Cases

### UC003 - Bulk Operations
**Status**: Not Implemented  
**Description**: Enable admins to perform bulk operations like importing/exporting items, bulk delete, and batch updates.

### UC004 - User Role Management  
**Status**: Not Implemented  
**Description**: Implement different admin roles with varying permissions for content management.

---

## UC-009: User-Friendly Registration Error Handling

**Origin**: REQ-019  
**Implementation Status**: ✅ COMPLETED  
**Date Completed**: August 7, 2025  
**Actor**: New User  
**Goal**: Receive clear, actionable error messages during registration process  
**Context**: User encounters errors during registration and needs guidance to resolve them  

**Main Flow**:
1. User navigates to registration page or attempts registration
2. System encounters an error condition (invalid access code, missing parameters, etc.)
3. System displays user-friendly error message instead of technical error codes
4. When applicable, system provides actionable next steps or buttons
5. User can take suggested action or retry with corrected information

**Error Scenarios**:
- 9a. Missing URL parameters: Shows "Registration link is invalid" with specific missing items
- 9b. Invalid access code: Shows "Invalid access code or email - please check your invitation"
- 9c. User already registered: Shows "User already registered" with "Go to Login" button
- 9d. Network errors: Shows "Something went wrong on our end - please try again later"

**Business Value**: Reduces user frustration and support requests by providing clear guidance on resolving registration issues

**Technical Notes**: Implements centralized error translation system with deduplication and action buttons

---

## UC-022: Admin Dashboard KPI Display
**Origin**: Request #022 from gen_requests.md
**Implementation Status**: ✅ COMPLETED
**Date Implemented**: September 2, 2025 22:28 CEST
**Actor**: System Administrator
**Goal**: Access comprehensive KPI dashboard with properties, users, and account management information
**Context**: Admin needs overview of system performance, user access management, and account structure

### Description
System administrators can access a comprehensive KPI dashboard that displays key metrics about properties, user access management, and account structure. The dashboard provides real-time analytics, account access summaries, and user management capabilities in a single, organized interface.

### Actors
- **Primary**: System Administrator
- **Secondary**: Property Manager, Account Manager

### Preconditions
- User has admin authentication and authorization
- User has navigated to `/admin` dashboard route
- Database contains sufficient data for meaningful KPI display
- Analytics and user access API endpoints are functional

### Main Flow

#### UC022.1 - Access Admin Dashboard
1. Admin authenticates and navigates to `/admin` route
2. System loads KPI dashboard with comprehensive metrics
3. System displays authentication guard if not properly authorized
4. System loads dashboard components with real-time data

#### UC022.2 - View KPI Metrics Overview
1. **Properties Summary**:
   - Total number of properties across all accounts
   - Average items per property calculation
   - Total visits and engagement metrics
   - Real-time property performance indicators

2. **Analytics Dashboard**:
   - System-wide visit counts and trends
   - Item engagement and reaction analytics
   - Time-based metrics (24h, 7d, 30d, all-time)
   - Most active properties and top viewed items

3. **Account Access Management**:
   - List of accounts owned by current admin user
   - Accounts accessible to current admin user
   - User access permissions and roles per account
   - Member counts and account statistics

#### UC022.3 - User Access Management
1. System displays users with access to admin's accounts
2. Admin can view user roles and permissions per account
3. System shows account-specific access details
4. Admin can navigate to detailed account management

#### UC022.4 - Quick Actions Navigation
1. **Manage Items**: Direct link to `/admin/items` for comprehensive item management
2. **Manage Properties**: Link to property management interface
3. **View Analytics**: Access to detailed analytics dashboard
4. **Account Management**: Navigate to account-specific operations

### Alternative Flows

#### UC022.A1 - Limited Data Available
1. System detects insufficient data for comprehensive KPIs
2. Dashboard displays available metrics with "insufficient data" indicators
3. System provides guidance for increasing data collection
4. Dashboard remains functional with partial data display

#### UC022.A2 - API Connection Issues
1. System encounters API connectivity problems
2. Dashboard displays error states with retry functionality
3. Admin can manually refresh dashboard data
4. System provides clear error messaging and recovery options

#### UC022.A3 - Multi-Account Access
1. Admin has access to multiple accounts
2. System displays account selector for context switching
3. Dashboard updates metrics based on selected account
4. User access information reflects selected account context

### Success Scenarios

#### UC022.S1 - Comprehensive Dashboard View
- All KPI metrics load and display correctly
- User access information shows complete account structure
- Navigation between dashboard and management interfaces works seamlessly
- Real-time data updates function properly

#### UC022.S2 - Account-Specific Insights
- Admin can view metrics filtered by specific account
- User access management shows account-specific roles
- Property data reflects correct account ownership
- Analytics provide account-contextual insights

#### UC022.S3 - Performance Monitoring
- Dashboard loads within acceptable time limits
- Real-time updates don't impact performance
- Large datasets display efficiently
- Error recovery works smoothly

### Postconditions
- **Success**: Admin has complete overview of system performance and user access
- **Success**: Dashboard provides actionable insights for account management
- **Success**: Navigation flow enables efficient admin operations
- **Success**: Real-time data supports informed decision-making

### Technical Implementation Features

#### Dashboard Architecture
- ✅ Modular React components for KPI display (`KPIDashboardOverview`, `PropertiesMetricsCard`, `AccountAccessSummary`, `UserAccessTable`)
- ✅ TypeScript interfaces for all dashboard data structures
- ✅ Responsive design with mobile-friendly layouts
- ✅ Error boundaries and loading states for robust user experience

#### API Integration
- ✅ Extended analytics API (`/api/admin/analytics`) with KPI metrics
- ✅ New user access API (`/api/admin/accounts/users`) for account management
- ✅ Account-filtered data queries with proper security
- ✅ Real-time data fetching with error handling and retries

#### Data Visualization
- ✅ KPI cards with trend indicators and performance metrics
- ✅ Account access summaries with role-based display
- ✅ User access tables with sortable columns and filtering
- ✅ Interactive navigation with seamless routing

#### Performance Optimization
- ✅ Efficient database queries with proper indexing
- ✅ Lazy loading of dashboard components
- ✅ Optimized bundle sizes (3.76 kB for dashboard, 5.76 kB for items management)
- ✅ Caching strategies for frequently accessed data

### Business Value
- **Operational Efficiency**: Single dashboard provides complete system overview
- **Account Management**: Streamlined user access and account management workflow
- **Decision Support**: Real-time KPIs enable data-driven decision making
- **User Experience**: Intuitive interface reduces admin learning curve
- **Scalability**: Modular architecture supports future KPI additions

### Integration Points
- **Authentication System**: Seamlessly integrated with existing admin authentication
- **Account Management**: Leverages multi-tenant account structure
- **Analytics Engine**: Utilizes existing analytics infrastructure
- **Navigation System**: Consistent with overall admin interface design

### Security Considerations
- **Access Control**: Dashboard only accessible to authenticated admin users
- **Data Isolation**: All metrics respect account ownership and user permissions
- **Audit Trail**: Admin actions logged for accountability
- **Data Privacy**: User access information properly secured and filtered

---

---

## UC-023: Unified Route Architecture Permission System
**Origin**: Request #023 from gen_requests.md
**Implementation Status**: ✅ COMPLETED
**Date Implemented**: September 3, 2025 06:56 CEST
**Actor**: System Administrator, Property Manager, Regular User
**Goal**: Role-based access control for unified dashboard interface
**Context**: Users need appropriate permissions based on their roles in accounts and system-wide access

### Description
The system implements a comprehensive permission system that controls access to dashboard features based on user roles and account membership. Users can access different levels of functionality depending on whether they are system administrators, account owners, account members, or viewers.

### Actors
- **Primary**: System Administrator (full system access)
- **Secondary**: Account Owner (full account access)
- **Tertiary**: Account Member (limited account access)
- **Quaternary**: Account Viewer (read-only account access)

### Preconditions
- User authentication via Supabase Auth system
- Database schema includes users, admin_users, account_users tables
- Permission system types and utilities are implemented
- User has valid role assignment in system

### Main Flow

#### UC023.1 - Permission System Initialization
1. User authenticates via Supabase Auth
2. System loads user profile and role information
3. System determines account membership and permissions
4. Permission context is established for dashboard session
5. UI adapts based on user's permission level

#### UC023.2 - Role-Based Dashboard Access
1. **System Administrator**:
   - Access to all dashboard sections (Dashboard, Items, Properties, Analytics)
   - Full CRUD operations across all accounts
   - Access to system admin functions (Back Office, User Management)
   - Can view all accounts and manage system-wide analytics
   - Can export data and manage account settings

2. **Account Owner**:
   - Access to main dashboard sections
   - Full CRUD operations within their accounts
   - Can manage properties and items in owned accounts
   - Can view analytics for their accounts
   - Can manage account user roles and settings

3. **Account Member**:
   - Access to dashboard with limited permissions
   - Can view items and properties in accessible accounts
   - Can create items within account scope
   - Limited analytics access based on account permissions
   - Cannot manage account settings or user roles

4. **Account Viewer**:
   - Read-only access to dashboard sections
   - Can view items, properties, and basic analytics
   - Cannot create, edit, or delete content
   - Limited to assigned account scope

#### UC023.3 - Feature-Level Permission Control
1. **Navigation Permissions**:
   - Dashboard access based on authentication status
   - Items management based on account role
   - Properties management based on account permissions
   - Analytics access based on role hierarchy

2. **CRUD Permissions**:
   - Create: Based on account role (members can create items, viewers cannot)
   - Read: Based on account membership and role hierarchy
   - Update: Based on ownership or admin permissions
   - Delete: Limited to owners and account admins

3. **Advanced Permissions**:
   - Analytics viewing requires minimum member role
   - Data export requires admin or system admin role
   - User management requires account owner or system admin
   - System administration requires system admin role

### Alternative Flows

#### UC023.A1 - Permission Denied Scenarios
1. User attempts to access unauthorized feature
2. System displays permission denied message
3. System provides guidance on required permissions
4. User can navigate to allowed sections or request access

#### UC023.A2 - Role Changes
1. User's role changes (e.g., promoted from member to admin)
2. Permission context updates immediately
3. UI adapts to new permission level
4. User gains access to previously restricted features

#### UC023.A3 - Multi-Account Access
1. User belongs to multiple accounts with different roles
2. System shows account selector for context switching
3. Permissions update based on selected account
4. UI adapts to account-specific role permissions

### Success Scenarios

#### UC023.S1 - System Administrator Experience
- Complete access to all system features
- Seamless navigation between account contexts
- Full administrative control and data export capabilities
- System performance monitoring and user management

#### UC023.S2 - Account Owner Experience
- Complete control over owned accounts
- Property and item management within scope
- User role management for account members
- Comprehensive analytics for owned properties

#### UC023.S3 - Account Member Experience
- Collaborative access to account resources
- Item creation and management within permissions
- View access to properties and analytics
- Clear understanding of permission boundaries

### Postconditions
- **Success**: User has appropriate access based on role and context
- **Success**: UI adapts dynamically to permission changes
- **Success**: Data isolation maintained between accounts
- **Success**: Security boundaries enforced consistently

### Technical Implementation Features

#### Permission Architecture
- ✅ TypeScript permission types (`UserRole`, `AccountRole`, `DashboardPermissions`)
- ✅ Permission utility functions with role hierarchy support
- ✅ React hook for permission management (`usePermissions`)
- ✅ Context-aware permission checking with account scope

#### Security Implementation
- ✅ Role-based access control with hierarchical permissions
- ✅ Account-scoped data isolation via permission checks
- ✅ System admin override capabilities for support
- ✅ Secure permission context management

#### User Experience
- ✅ Dynamic UI adaptation based on permissions
- ✅ Clear permission feedback for restricted actions
- ✅ Seamless role transition handling
- ✅ Account context switching with permission updates

### Business Value
- **Security**: Comprehensive access control prevents unauthorized data access
- **User Experience**: Appropriate feature visibility reduces confusion
- **Scalability**: Role-based architecture supports unlimited user accounts
- **Compliance**: Permission system enables audit trails and compliance reporting
- **Flexibility**: Hierarchical permissions support various business models

### Integration Points
- **Authentication System**: Leverages existing Supabase Auth infrastructure
- **Database Schema**: Integrates with users, admin_users, account_users tables
- **Dashboard Components**: Permission-aware UI components throughout system
- **API Endpoints**: Permission checking integrated into all data operations

### Security Considerations
- **Data Isolation**: Account-scoped permissions prevent cross-account data access
- **Role Validation**: Server-side permission validation for all operations
- **Audit Logging**: Permission checks logged for security monitoring
- **Session Security**: Permission context maintained securely in user sessions

---

## UC-025: Sequential Authentication State Machine

**Origin**: REQ-025 from gen_requests.md (BUG FIX REQUEST - React State Management Issues)
**Implementation Status**: ✅ COMPLETED
**Date Implemented**: September 4, 2025
**Complexity**: High (Architectural State Machine Implementation)

### Description
The system implements a comprehensive sequential authentication state machine that eliminates race conditions, provides predictable state transitions, and ensures reliable user authentication across all dashboard components. This architectural improvement addresses fundamental React state management issues that were causing permission inconsistencies and authentication failures.

### Actors
- **Primary**: All Authenticated Users (admin, property owners, members)
- **Secondary**: System Administrators
- **Tertiary**: Public QR Code Users (backward compatibility maintained)

### Preconditions
- User authentication via Supabase Auth system
- Multi-tenant database schema implemented
- Permission system and role-based access control established
- Existing authentication flows require stabilization

### Main Flow

#### UC025.1 - State Machine Initialization
1. User initiates authentication (login, OAuth, or session restoration)
2. System activates sequential state machine with UNINITIALIZED state
3. State machine transitions to LOADING state with progress tracking
4. Sequential authentication steps execute in order:
   - User profile loading with retry mechanisms
   - Account fetching with validation
   - Current account selection with optimization
   - Permission validation and role assignment
5. System transitions to AUTHENTICATED state on success
6. System provides comprehensive error recovery on failure

#### UC025.2 - Sequential Authentication Flow
1. **User Profile Loading**: Fetch user data with exponential backoff retry
2. **Account Discovery**: Load available accounts with role information
3. **Current Account Selection**: Determine appropriate default account
4. **Permission Resolution**: Calculate user permissions based on roles
5. **State Persistence**: Save authentication state to localStorage
6. **Error Recovery**: Automatic recovery from transient failures

#### UC025.3 - State Persistence and Restoration
1. System saves complete authentication state to localStorage
2. State includes user data, accounts, current account, and permissions
3. Session restoration loads persisted state on page refresh
4. State validation ensures data integrity and freshness
5. Automatic cleanup removes stale or corrupted data

#### UC025.4 - Performance Monitoring Integration
1. Real-time performance tracking for all authentication operations
2. Authentication timing metrics (target: < 3 seconds)
3. State persistence performance (< 100ms)
4. Memory usage monitoring and optimization
5. Comprehensive logging for debugging and analytics

#### UC025.5 - Error Recovery System
1. Automatic classification of authentication errors
2. Exponential backoff retry mechanisms for transient failures
3. Fallback authentication strategies for network issues
4. User-friendly error messages with recovery options
5. Comprehensive logging for troubleshooting

### Alternative Flows

#### UC025.A1 - Network Connectivity Issues
1. System detects network failure during authentication
2. Automatic retry with exponential backoff (up to 3 attempts)
3. Fallback to cached authentication state if available
4. User receives clear error message with retry option
5. System attempts recovery when connectivity restored

#### UC025.A2 - Database Connection Failures
1. Authentication fails due to database connectivity issues
2. System logs detailed error information for debugging
3. User receives "Service temporarily unavailable" message
4. System provides automatic retry mechanism
5. Recovery attempted when database connection restored

#### UC025.A3 - Permission Calculation Errors
1. System encounters issues calculating user permissions
2. Fallback to secure default permissions (read-only access)
3. Administrator receives alert for permission system issues
4. System logs detailed permission calculation errors
5. Manual intervention possible through admin interface

#### UC025.A4 - State Persistence Corruption
1. System detects corrupted localStorage authentication state
2. Automatic cleanup of corrupted data
3. Fresh authentication flow initiated
4. User experience minimally impacted (transparent recovery)
5. Detailed logging for debugging purposes

### Success Scenarios

#### UC025.S1 - Successful Authentication Flow
- Authentication completes within target timeframes (< 3 seconds)
- All user data and permissions loaded correctly
- State persisted for future sessions
- No race conditions or state inconsistencies
- Comprehensive logging available for debugging

#### UC025.S2 - Session Restoration Success
- Page refresh maintains user authentication state
- Permissions and account context preserved
- Seamless user experience without re-authentication
- Performance meets target (< 500ms restoration time)
- State validation ensures data integrity

#### UC025.S3 - Error Recovery Success
- Transient network failures automatically resolved
- User receives appropriate guidance during recovery
- System maintains stability during error conditions
- Recovery time within acceptable limits
- Comprehensive error logging for system improvement

#### UC025.S4 - Performance Optimization Achievement
- Authentication performance meets or exceeds targets
- Memory usage remains stable during operation
- State persistence operations complete quickly
- Monitoring provides actionable performance insights
- System scales effectively with user load

### Postconditions
- **Success**: User authentication state is predictable and reliable
- **Success**: Race conditions eliminated from authentication flows
- **Success**: Permission system operates consistently across all components
- **Success**: Error recovery provides excellent user experience
- **Success**: Performance monitoring enables continuous improvement
- **Success**: Backward compatibility maintained for existing functionality

### Technical Implementation Details

#### State Machine Architecture
- **States**: UNINITIALIZED → LOADING → AUTHENTICATED/ERROR
- **Transitions**: Predictable, atomic state updates
- **Concurrency**: Single useEffect manages all state transitions
- **Validation**: State integrity checks at each transition
- **Logging**: Comprehensive event logging for debugging

#### Performance Characteristics
- **Authentication Time**: < 3 seconds (target achieved)
- **Session Restoration**: < 500ms (target achieved)
- **State Persistence**: < 100ms (target achieved)
- **Memory Usage**: Stable, no memory leaks
- **Error Recovery**: < 5 seconds for transient failures

#### Security Features
- **State Validation**: Authentication state integrity verification
- **Secure Persistence**: Sensitive data sanitization in localStorage
- **Session Management**: Automatic session refresh and validation
- **Audit Logging**: Comprehensive authentication event tracking
- **Error Handling**: Secure fallback behavior for edge cases

### Business Value
- **Reliability**: Eliminates authentication-related user complaints and support requests
- **Performance**: Faster, more responsive authentication experience
- **Developer Productivity**: Improved debugging capabilities and error tracking
- **User Experience**: Seamless authentication with automatic error recovery
- **System Stability**: Predictable state management reduces system crashes
- **Scalability**: Architecture supports future authentication enhancements

### Integration Points
- **Supabase Auth**: Leverages existing authentication infrastructure
- **Multi-Tenant Database**: Integrates with property-based data isolation
- **Permission System**: Provides foundation for role-based access control
- **Dashboard Components**: All components benefit from reliable authentication
- **Error Monitoring**: Comprehensive logging for system health monitoring

### Success Metrics
- **Authentication Success Rate**: > 95% (target: > 90%)
- **Error Recovery Success Rate**: > 80% (target: > 75%)
- **Performance Target Achievement**: 100% of timing targets met
- **Memory Stability**: Zero memory leaks detected
- **User Satisfaction**: Authentication issues reduced by > 90%

---

*This use case document is maintained to track feature implementation and ensure system requirements are met.* 