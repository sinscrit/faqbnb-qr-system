# FAQBNB Technical Guide

This document provides technical implementation details for the FAQBNB QR Item Display System.

**Last Updated**: July 21, 2025 10:08 CEST

---

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15.4.2 with App Router
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Railway

### Database Schema
```sql
-- Items table
items (
  id UUID PRIMARY KEY,
  public_id VARCHAR(50) UNIQUE,
  name VARCHAR(255),
  description TEXT,
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

### Future Enhancements
- Authentication and authorization
- File upload capabilities
- Bulk operations
- Audit logging
- Performance monitoring

---

*This technical guide serves as implementation reference and architectural documentation for the FAQBNB system.* 