# FAQBNB Technical Guide

This document provides technical implementation details for the FAQBNB QR Item Display System.

**Last Updated**: July 25, 2025 03:30 CEST

---

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15.4.2 with App Router
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Railway

### Database Schema (Multi-Tenant Architecture)
```sql
-- Property types table
property_types (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP
)

-- Users table (multi-tenant)
users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Properties table
properties (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_type_id UUID NOT NULL REFERENCES property_types(id),
  nickname VARCHAR(100) NOT NULL,
  address TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Items table (updated for multi-tenant)
items (
  id UUID PRIMARY KEY,
  public_id VARCHAR(50) UNIQUE,
  name VARCHAR(255),
  description TEXT,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  qr_code_url TEXT,
  qr_code_uploaded_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Links table  
item_links (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  title VARCHAR(255),
  link_type VARCHAR(50) CHECK (link_type IN ('youtube', 'pdf', 'image', 'text')),
  url TEXT,
  thumbnail_url TEXT,
  display_order INTEGER,
  created_at TIMESTAMP
)

-- Analytics tables
item_visits (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id),
  visited_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  referrer TEXT
)

item_reactions (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id),
  reaction_type VARCHAR(50) CHECK (reaction_type IN ('like', 'dislike', 'love', 'confused')),
  ip_address INET,
  session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## UC001 - Admin CRUD Functionality Implementation

**Reference**: UC001 from gen_USE_CASES.md  
**Implementation Date**: July 21, 2025

### Admin API Architecture

#### 1. List Items API - `/api/admin/items`
**File**: `src/app/api/admin/items/route.ts`

**GET Method Implementation**:
```typescript
export async function GET(request: NextRequest) {
  // Extract search params (search, page, limit)
  // Build Supabase query with filtering and pagination
  // Execute query and get link counts
  // Return ItemsListResponse format
}
```

**Features**:
- Pagination support (default: 20 items per page)
- Search functionality (name and public_id ILIKE)
- Link count aggregation for each item
- Error handling with detailed logging

#### 2. Create Items API - `/api/admin/items`
**File**: `src/app/api/admin/items/route.ts`

**POST Method Implementation**:
```typescript
export async function POST(request: NextRequest) {
  // Validate UUID format and required fields
  // Create item in transaction
  // Insert associated links with proper ordering
  // Return ItemResponse with created data
}
```

**Features**:
- UUID format validation
- Transactional item and links creation
- Comprehensive input validation
- Duplicate prevention (unique public_id constraint)

#### 3. Update Items API - `/api/admin/items/[publicId]`
**File**: `src/app/api/admin/items/[publicId]/route.ts`

**PUT Method Implementation**:
```typescript
export async function PUT(request: NextRequest, { params }) {
  // Extract and validate publicId
  // Load existing item and links
  // Perform complex UPSERT operations:
  //   - Update existing links
  //   - Insert new links  
  //   - Delete removed links
  // Return updated ItemResponse
}
```

**Features**:
- Complex UPSERT logic for links management
- Maintains link ordering
- Handles partial updates
- Item existence validation

#### 4. Delete Items API - `/api/admin/items/[publicId]`
**File**: `src/app/api/admin/items/[publicId]/route.ts`

**DELETE Method Implementation**:
```typescript
export async function DELETE(request: NextRequest, { params }) {
  // Validate publicId and item existence
  // Count links before deletion
  // Delete item (CASCADE handles links)
  // Verify deletion success
  // Return confirmation with deletion summary
}
```

**Features**:
- CASCADE deletion verification
- Pre-deletion link counting
- Post-deletion verification
- Detailed deletion reporting

### Client API Integration

#### Enhanced API Client - `src/lib/api.ts`
```typescript
export const adminApi = {
  listItems(search?, page?, limit?): Promise<ItemsListResponse>,
  getItem(publicId): Promise<ItemResponse>,
  createItem(item): Promise<ItemResponse>,
  updateItem(publicId, item): Promise<ItemResponse>,
  deleteItem(publicId): Promise<DeletionResponse>
}
```

**Enhancements**:
- JSDoc documentation for all methods
- Client-side validation (UUID format, required fields)
- Search and pagination parameter support
- Comprehensive error handling
- TypeScript type safety

### Form Page Architecture

#### 1. New Item Form - `/admin/items/new`
**File**: `src/app/admin/items/new/page.tsx`

**Implementation**:
```typescript
export default function NewItemPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSave = async (itemData: CreateItemRequest) => {
    // Call adminApi.createItem
    // Handle success/error states
    // Redirect with success message
  };
  
  return <ItemForm onSave={handleSave} onCancel={handleCancel} />;
}
```

**Features**:
- Loading state management
- Error display with user-friendly messages
- Success redirection to admin panel
- ItemForm component integration

#### 2. Edit Item Form - `/admin/items/[publicId]/edit`
**File**: `src/app/admin/items/[publicId]/edit/page.tsx`

**Implementation**:
```typescript
export default function EditItemPage({ params }) {
  const [item, setItem] = useState<UpdateItemRequest | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load item data on mount
  useEffect(() => {
    loadItem(publicId);
  }, [publicId]);
  
  const handleSave = async (itemData: UpdateItemRequest) => {
    // Call adminApi.updateItem
    // Handle success/error states
  };
  
  return item ? <ItemForm item={item} onSave={handleSave} /> : <LoadingState />;
}
```

**Features**:
- Dynamic route parameter handling
- Async data loading with error states
- ItemResponse to UpdateItemRequest transformation
- Loading states for better UX
- Error handling for non-existent items

### Database Integration

#### Supabase Configuration
**File**: `src/lib/supabase.ts`

```typescript
// Public client for read operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for write operations  
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
```

**Note**: Current implementation uses regular client due to service key configuration. Production should use supabaseAdmin for admin operations.

#### Row Level Security (RLS)
- **Public read access**: All items and links visible to public
- **Admin write access**: Authenticated admin operations
- **Constraint enforcement**: Database-level validation

### Error Handling Strategy

#### API Level
- HTTP status codes (200, 201, 400, 404, 500)
- Consistent JSON error response format
- Detailed error logging for debugging
- Input validation with specific error messages

#### Client Level
- Try-catch blocks with user-friendly error messages
- Loading states during async operations
- Form validation before submission
- Network error retry mechanisms

#### UI Level
- Error boundary components
- Toast notifications for success/error states
- Loading spinners and skeleton states
- Graceful fallbacks for missing data

### Performance Optimizations

#### Database
- Indexed queries on public_id and item_id
- Pagination to limit result sets
- Efficient JOIN operations for link counts
- Database-level constraints for data integrity

#### Frontend
- React hooks for state management
- Async component loading
- Form validation to prevent unnecessary API calls
- Optimistic UI updates where appropriate

### Security Considerations

#### Input Validation
- UUID format validation
- URL format validation
- SQL injection prevention via Supabase client
- XSS prevention through React's built-in escaping

#### Access Control
- Admin route protection (future enhancement)
- RLS policies for data access
- Service-level API key separation
- CORS configuration for API endpoints

---

## Development Guidelines

### File Structure
```
src/
├── app/api/admin/items/           # Admin API routes
├── app/admin/items/               # Admin form pages
├── components/                    # Reusable components
├── lib/                          # Utility functions and API clients
└── types/                        # TypeScript type definitions
```

### Testing Strategy
- Unit tests for API endpoints
- Integration tests for form workflows
- End-to-end testing for complete user journeys
- Database state verification after operations

---

## UC005 - Multi-Tenant Property Management Implementation

**Reference**: UC005 from gen_USE_CASES.md  
**Implementation Date**: July 25, 2025  
**Status**: Phase 1 Complete (Database Schema), Phase 2 In Progress

### Architecture Changes

#### Database Migrations Applied
1. **create_property_types_table** - Standard property classifications
2. **create_users_table** - Multi-tenant user management
3. **create_properties_table** - Property ownership and organization
4. **add_property_to_items** - Items-to-properties relationship
5. **create_default_properties_for_existing_items** - Migration safety
6. **make_property_id_required** - Enforce data integrity
7. **setup_multitenant_rls_policies** - Security isolation
8. **update_items_rls_for_properties** - Property-based access control

#### Row Level Security (RLS) Implementation
```sql
-- Example RLS policies for multi-tenant isolation

-- Users can only access their own properties
CREATE POLICY "Users can manage own properties" ON properties
    FOR ALL USING (user_id = auth.uid());

-- Users can only access items in their properties
CREATE POLICY "Users can manage own property items" ON items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = items.property_id 
            AND p.user_id = auth.uid()
        )
    );

-- Admins can access all data
CREATE POLICY "Admins can manage all items" ON items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.role = 'admin'
        )
    );
```

#### TypeScript Type Definitions
```typescript
// Updated Database interface in src/lib/supabase.ts
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        // ... Insert/Update types
      }
      properties: {
        Row: {
          id: string
          user_id: string
          property_type_id: string
          nickname: string
          address: string | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      // ... other tables
    }
  }
}
```

### Security Features

#### Data Isolation
- **Property Ownership**: Users can only access properties they own
- **Item Isolation**: Items are accessible only through property ownership chain
- **Analytics Filtering**: Visit and reaction data filtered by property ownership
- **Admin Override**: System administrators can access all data for management

#### Migration Safety
- **Legacy Item Support**: Existing items assigned to default "Legacy Items" property
- **Backward Compatibility**: Public QR code access maintained without authentication
- **Zero Downtime**: Migrations applied without breaking existing functionality
- **Data Integrity**: Foreign key constraints ensure referential integrity

### Performance Considerations

#### Database Optimizations
- **Strategic Indexing**: Indexes on user_id, property_id for fast filtering
- **Query Optimization**: Efficient JOINs for property ownership verification
- **RLS Performance**: Policies designed to minimize database overhead

#### Scalability
- **Multi-Tenant Architecture**: Supports unlimited users and properties
- **Property-Based Partitioning**: Logical data separation enables horizontal scaling
- **Efficient Analytics**: Property-filtered analytics reduce query complexity

### Future Enhancements
- File upload capabilities
- Bulk operations
- Audit logging
- Performance monitoring
- Advanced user role management

---

*This technical guide serves as implementation reference and architectural documentation for the FAQBNB system.* 