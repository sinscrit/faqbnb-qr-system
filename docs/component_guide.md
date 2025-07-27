# FAQBNB Component Guide

This document provides detailed information about React components in the FAQBNB QR Item Display System.

**Last Updated**: Sun Jul 27 02:12:42 CEST 2025 - AccountSelector Component Added (REQ-009)

---

## Core UI Components

### AccountSelector
**File**: `src/components/AccountSelector.tsx`  
**Added**: July 27, 2025 (REQ-009)  
**Purpose**: Multi-tenant account switching and management interface

#### Overview
The AccountSelector component provides a comprehensive interface for users to switch between accounts in the multi-tenant FAQBNB system. It includes multiple variants for different use cases and integrates seamlessly with the authentication context.

#### Component Variants

##### 1. Main AccountSelector
```typescript
export function AccountSelector({ 
  onAccountChange, 
  disabled = false, 
  showAccountInfo = true, 
  className = '' 
}: AccountSelectorProps): JSX.Element
```

##### 2. CompactAccountSelector  
```typescript
export function CompactAccountSelector({ 
  onAccountChange, 
  disabled = false, 
  className = '' 
}: Omit<AccountSelectorProps, 'showAccountInfo'>): JSX.Element
```

##### 3. AccountInfo (Read-only)
```typescript
export function AccountInfo({ 
  className = '' 
}: { className?: string }): JSX.Element
```

#### Props Interface
```typescript
interface AccountSelectorProps {
  onAccountChange?: (account: Account | null) => void;
  disabled?: boolean;
  showAccountInfo?: boolean;
  className?: string;
}

interface AccountDisplayProps {
  account: Account;
  userRole?: string;
  isOwner?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  showInfo?: boolean;
}
```

#### Dependencies
```typescript
import React, { useState } from 'react';
import { ChevronDownIcon, CheckIcon, BuildingOfficeIcon, UserIcon, CrownIcon } from '@heroicons/react/24/outline';
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
import { Account } from '@/types';
```

#### State Management
```typescript
const [isOpen, setIsOpen] = useState(false);
const [switchError, setSwitchError] = useState<string | null>(null);
```

#### Key Features

##### 1. Account Context Integration
- **Authentication Context**: Integrates with `useAuth()` and `useAccountContext()`
- **Current Account Display**: Shows selected account with role indicators
- **Available Accounts**: Lists all accounts user has access to
- **Role-Based UI**: Different displays for owners vs members

##### 2. Account Switching Logic
```typescript
const handleAccountSwitch = async (account: Account) => {
  try {
    setSwitchError(null);
    setIsOpen(false);
    
    if (account.id === currentAccount?.id) {
      return; // Already selected
    }

    const result = await switchToAccount(account.id);
    
    if (!result.success) {
      setSwitchError(result.error || 'Failed to switch account');
      return;
    }

    // Notify parent component of account change
    if (onAccountChange) {
      onAccountChange(account);
    }
  } catch (error) {
    setSwitchError('An unexpected error occurred');
  }
};
```

##### 3. Visual Indicators
- **Owner Crown**: 👑 icon for account owners
- **Role Display**: User's role within each account (admin, member, etc.)
- **Selection State**: Visual feedback for currently selected account
- **Loading States**: Spinner during account switching operations

##### 4. Responsive Dropdown Interface
```typescript
// Dropdown trigger
<button
  type="button"
  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  onClick={() => !disabled && !switchingAccount && setIsOpen(!isOpen)}
  disabled={disabled || switchingAccount}
>
  <AccountDisplay account={currentAccount} />
</button>

// Dropdown menu
{isOpen && (
  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
    {userAccounts.map((account) => (
      <AccountDisplay
        key={account.id}
        account={account}
        onClick={() => handleAccountSwitch(account)}
        isSelected={account.id === currentAccount?.id}
      />
    ))}
  </div>
)}
```

##### 5. Error Handling
```typescript
// Error display with dismissal
{switchError && (
  <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
    <div className="flex items-center space-x-2">
      <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="..." clipRule="evenodd" />
      </svg>
      <span>{switchError}</span>
    </div>
    <button 
      className="mt-1 text-xs text-red-700 hover:text-red-800 underline"
      onClick={() => setSwitchError(null)}
    >
      Dismiss
    </button>
  </div>
)}
```

#### Styling and Design System

##### Tailwind CSS Classes
- **Container**: `relative w-full`
- **Trigger Button**: `w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`
- **Dropdown**: `absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg`
- **Account Items**: `flex items-center justify-between p-3 cursor-pointer transition-colors rounded-lg`
- **Selected State**: `bg-blue-50 border-blue-200 border-2 text-blue-900`
- **Hover State**: `hover:bg-gray-50 border border-gray-200`

##### Visual Design Elements
- **Icons**: Heroicons outline icons for consistency
- **Color Scheme**: Blue for selected states, gray for neutral states
- **Typography**: Consistent text sizing (`text-sm`, `text-xs`)
- **Spacing**: Proper padding and margins (`p-3`, `space-x-3`)

#### Single Account Behavior
```typescript
// Special handling for users with only one account
if (userAccounts.length === 1) {
  const account = userAccounts[0];
  return (
    <div className={`${className}`}>
      <div className="text-xs font-medium text-gray-700 mb-2">Current Account</div>
      <AccountDisplay
        account={account}
        userRole={getCurrentAccountRole(account.id)}
        isOwner={isAccountOwner(account)}
        isSelected={true}
        showInfo={showAccountInfo}
      />
    </div>
  );
}
```

#### Accessibility Features
- **Keyboard Navigation**: Full keyboard support for dropdown navigation
- **Focus Management**: Proper focus states and ring indicators
- **Screen Reader Support**: Descriptive labels and ARIA attributes
- **Click Outside**: Automatic dropdown closure on outside clicks

#### Performance Considerations
- **Lazy State Updates**: State changes only when necessary
- **Memoized Callbacks**: Optimized re-rendering with proper dependencies
- **Error Boundaries**: Graceful handling of component failures
- **Loading States**: Prevents user interaction during account switching

#### Integration with Admin Layout
```typescript
// In src/app/admin/layout.tsx
import { CompactAccountSelector } from '@/components/AccountSelector';

// Usage in header
<CompactAccountSelector
  onAccountChange={handleAccountChange}
  className="w-64"
/>
```

#### Testing Strategy

##### Component Testing
- **Account Switching**: Verified switching between multiple accounts
- **Single Account**: Tested display-only mode for single account users
- **Error States**: Confirmed error handling and user feedback
- **Loading States**: Validated loading indicators during operations
- **Responsive Design**: Tested on multiple screen sizes

##### Integration Testing
- **Authentication Context**: Verified integration with auth hooks
- **Account Context**: Tested account state management integration
- **Parent Callbacks**: Confirmed callback execution on account changes
- **Layout Integration**: Tested integration within admin layout

#### Usage Examples

##### Basic Usage
```typescript
<AccountSelector
  onAccountChange={(account) => console.log('Account changed:', account)}
  showAccountInfo={true}
/>
```

##### Compact Version for Headers
```typescript
<CompactAccountSelector
  onAccountChange={handleAccountSwitch}
  className="max-w-sm"
/>
```

##### Read-only Display
```typescript
<AccountInfo className="mb-4" />
```

#### Maintenance Notes

##### Code Organization
- **Single Responsibility**: Focused solely on account selection and switching
- **Reusable Design**: Multiple variants for different use cases
- **Type Safety**: Full TypeScript integration with proper interfaces
- **Context Integration**: Seamless integration with authentication system

##### Future Enhancement Opportunities
1. **Account Creation**: Direct account creation from selector
2. **Account Management**: Settings and configuration access
3. **Keyboard Shortcuts**: Quick account switching with hotkeys
4. **Search/Filter**: Account search for users with many accounts
5. **Recent Accounts**: Quick access to recently used accounts

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