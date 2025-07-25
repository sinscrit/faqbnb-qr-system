# FAQBNB Use Cases

This document describes the use cases implemented in the FAQBNB QR Item Display System.

**Last Updated**: July 25, 2025 12:36 CEST - UC-005 Multi-Tenant Property Management Added

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

*This use case document is maintained to track feature implementation and ensure system requirements are met.* 