# FAQBNB Component Guide

This document provides detailed information about React components in the FAQBNB QR Item Display System.

**Last Updated**: July 25, 2025 17:14 CEST - AdminItemsPage Component Added (REQ-006)

---

## Admin Components

### AdminItemsPage
**File**: `src/app/admin/items/page.tsx`  
**Added**: July 25, 2025 (REQ-006)  
**Purpose**: Main admin interface for items management - fixes critical 404 bug

#### Overview
The AdminItemsPage component provides a comprehensive interface for administrators to manage items in the system. This component was created to resolve the critical 404 error that occurred when navigating to `/admin/items` from the admin navigation.

#### Props
This is a Next.js page component and doesn't accept props directly.

#### Dependencies
```typescript
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Item } from '@/types';
```

#### State Management
```typescript
interface ItemWithDetails extends Item {
  links_count?: number;
  visits_count?: number;
  reactions_count?: number;
  property_name?: string;
}

const [items, setItems] = useState<ItemWithDetails[]>([]);
const [loadingItems, setLoadingItems] = useState(true);
const [error, setError] = useState<string | null>(null);
```

#### Key Features

##### 1. Authentication Integration
- **AuthGuard Protection**: Integrates with `AuthContext` for authentication
- **Loading States**: Shows spinner during authentication check
- **Login Redirect**: Redirects unauthenticated users to login page
- **Role-Based Access**: Supports both admin and regular user access levels

##### 2. API Integration
- **Endpoint**: Connects to `/api/admin/items`
- **Error Handling**: Comprehensive error states with retry functionality
- **Loading Management**: Progressive loading states during data fetch
- **Credentials**: Uses `credentials: 'include'` for session management

##### 3. Property Filtering (Multi-Tenant Support)
- **Property Selection**: Responds to `selectedProperty` from auth context
- **Filter Banner**: Shows current property when selected
- **Dynamic Queries**: Refetches data when property selection changes
- **Empty State Handling**: Different messaging for property-specific vs global empty states

##### 4. Items Display Interface
```typescript
// Card-based layout for each item
<div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md">
  <h3>{item.name}</h3>
  <p>{item.description}</p>
  <div className="flex items-center gap-4 text-sm text-gray-500">
    <span>ID: {item.public_id}</span>
    <span>Links: {item.links_count}</span>
    <span>Visits: {item.visits_count}</span>
  </div>
</div>
```

##### 5. Quick Action Buttons
- **📈 Analytics**: Navigates to `/admin/items/[publicId]/analytics`
- **✏️ Edit**: Navigates to `/admin/items/[publicId]/edit`
- **👁️ View**: Navigates to `/item/[publicId]` (public view)

##### 6. Navigation Features
- **Add New Item**: Button to `/admin/items/new`
- **Back to Dashboard**: Return to `/admin` main page
- **Breadcrumb Support**: Clear navigation hierarchy

##### 7. Statistics Overview
```typescript
// Aggregate statistics display
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div>Total Items: {items.length}</div>
  <div>Total Links: {items.reduce((sum, item) => sum + (item.links_count || 0), 0)}</div>
  <div>Total Visits: {items.reduce((sum, item) => sum + (item.visits_count || 0), 0)}</div>
  <div>Total Reactions: {items.reduce((sum, item) => sum + (item.reactions_count || 0), 0)}</div>
</div>
```

#### Error Handling

##### Error States Handled
1. **API Connection Failures**: Network or server errors
2. **Authentication Failures**: Expired or invalid sessions
3. **Empty Data States**: No items available
4. **Loading Failures**: Data fetch interruptions

##### Error UI Components
```typescript
// Error display with retry functionality
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center gap-2">
      <svg className="w-5 h-5 text-red-600">...</svg>
      <span className="text-red-800 font-medium">Error:</span>
      <span className="text-red-700">{error}</span>
    </div>
    <button 
      onClick={() => window.location.reload()}
      className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
    >
      Retry
    </button>
  </div>
)}
```

#### Responsive Design

##### Mobile-First Approach
- **Card Layout**: Stacks vertically on mobile devices
- **Button Sizing**: Touch-friendly button dimensions
- **Text Truncation**: Prevents overflow on small screens
- **Grid System**: Responsive grid for statistics display

##### Breakpoint Behavior
- **Mobile (< 768px)**: Single column layout, stacked buttons
- **Tablet (768px+)**: Two column grid, inline button groups
- **Desktop (1024px+)**: Full feature layout, optimized spacing

#### Performance Considerations

##### Optimization Features
- **Lazy Loading**: Items load progressively during API fetch
- **Memoization**: Component re-renders optimized with proper dependencies
- **Error Boundaries**: Graceful handling of component failures
- **Loading States**: Prevents layout shift during data loading

##### Data Fetching Strategy
```typescript
useEffect(() => {
  const loadItems = async () => {
    if (!user) return; // Early return for unauthenticated users
    
    setLoadingItems(true);
    setError(null);
    
    try {
      // API call with error handling
    } catch (error) {
      // Comprehensive error logging and user feedback
    } finally {
      setLoadingItems(false);
    }
  };

  loadItems();
}, [user, selectedProperty]); // Optimal dependency array
```

#### Styling and Design System

##### Tailwind CSS Classes
- **Layout**: `space-y-6`, `flex items-center justify-between`
- **Cards**: `bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md`
- **Buttons**: `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`
- **Text**: `text-2xl font-bold text-gray-900`, `text-gray-600`

##### Color Scheme
- **Primary Actions**: Blue (`bg-blue-600`, `text-blue-800`)
- **Success States**: Green (`bg-green-100`, `text-green-800`)
- **Error States**: Red (`bg-red-50`, `text-red-800`)
- **Neutral Elements**: Gray (`bg-gray-100`, `text-gray-700`)

#### Integration Points

##### Authentication Context
```typescript
const { user, loading, isAdmin, selectedProperty } = useAuth();
```

##### Navigation Integration
```typescript
const router = useRouter();
// Used for programmatic navigation to various admin routes
```

##### API Integration
- **Endpoint**: `/api/admin/items`
- **Method**: GET with credentials
- **Response Format**: `{ success: boolean, data: Item[], error?: string }`

#### Testing Strategy

##### Component Testing
- **Authentication States**: Tested with/without user authentication
- **Loading States**: Verified loading spinner and data display
- **Error States**: Confirmed error handling and retry functionality
- **Empty States**: Validated empty state messaging and actions

##### Integration Testing
- **Route Navigation**: All navigation buttons tested for correct routing
- **API Integration**: Verified API calls and response handling
- **Property Filtering**: Tested multi-tenant property selection
- **Responsive Design**: Confirmed layout on multiple screen sizes

#### Maintenance Notes

##### Code Organization
- **Single Responsibility**: Component focuses solely on items listing
- **Separation of Concerns**: Authentication, API calls, and UI separated
- **Reusable Patterns**: Follows established admin component patterns
- **Type Safety**: Full TypeScript integration with proper interfaces

##### Future Enhancement Opportunities
1. **Pagination**: For large item collections
2. **Search/Filter**: Item search and advanced filtering
3. **Bulk Actions**: Multiple item selection and operations
4. **Drag & Drop**: Item reordering functionality
5. **Export Features**: Data export capabilities

---

**Component Status**: Production Ready  
**Last Tested**: July 25, 2025  
**Bug Fixes**: Resolves critical 404 error for `/admin/items` route 