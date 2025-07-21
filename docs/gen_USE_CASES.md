# FAQBNB Use Cases

This document describes the use cases implemented in the FAQBNB QR Item Display System.

**Last Updated**: July 21, 2025 10:08 CEST

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

## Future Use Cases (Planned)

### UC002 - File Upload Management
**Status**: Not Implemented  
**Description**: Allow admins to upload and manage thumbnail images and PDF files directly through the admin interface.

### UC003 - Bulk Operations
**Status**: Not Implemented  
**Description**: Enable admins to perform bulk operations like importing/exporting items, bulk delete, and batch updates.

### UC004 - User Role Management  
**Status**: Not Implemented  
**Description**: Implement different admin roles with varying permissions for content management.

---

*This use case document is maintained to track feature implementation and ensure system requirements are met.* 