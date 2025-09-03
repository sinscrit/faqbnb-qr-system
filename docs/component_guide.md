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

## Permission System Components (REQ-023)

### usePermissions Hook
**File**: `src/hooks/usePermissions.ts`  
**Added**: September 3, 2025 06:56 CEST (REQ-023)  
**Purpose**: React hook providing role-based access control for unified dashboard architecture

#### Overview
The usePermissions hook provides a comprehensive permission management system for the unified dashboard. It integrates with the authentication context and permission utilities to provide role-based access control throughout the application.

#### Hook Interface
```typescript
function usePermissions(
  user: User | null,
  account?: Account,
  accountUser?: AccountUser
): UsePermissionsReturn
```

#### Return Interface
```typescript
interface UsePermissionsReturn {
  // State
  permissions: DashboardPermissions | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  context: PermissionContext | null;

  // Computed properties
  isSystemAdmin: boolean;
  isAccountOwner: boolean;
  currentAccountRole: AccountRole | null;

  // Permission checking
  useCanAccess: (permission: PermissionKey) => PermissionResult;
  hasPermissionSync: (permission: PermissionKey) => boolean;

  // Actions
  loadPermissions: () => Promise<void>;
  refreshPermissions: () => void;
  clearPermissions: () => void;
}
```

#### Key Features

##### 1. Permission State Management
```typescript
// Automatic permission loading based on user/account context
useEffect(() => {
  if (user) {
    loadPermissions();
  } else {
    clearPermissions();
  }
}, [user?.id, account?.id, accountUser?.role]);
```

##### 2. Permission Checking API
```typescript
// Component-level permission checking
const canEditItems = useCanAccess(PERMISSIONS.EDIT_ITEMS);
const canManageUsers = useCanAccess(PERMISSIONS.MANAGE_USERS);

if (canEditItems.granted) {
  return <EditButton />;
}
```

##### 3. Role-Based Computed Properties
```typescript
// Automatic role detection
const isSystemAdmin = user ? canAccessAdminFeatures(user) : false;
const isAccountOwner = account && user && account.owner_id === user.id;
const currentAccountRole = accountUser?.role || null;
```

##### 4. Error Handling and Loading States
```typescript
// Comprehensive error states
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

// Permission-based UI adaptation
return (
  <div>
    {canEditItems.granted && <EditButton />}
    {isSystemAdmin && <AdminPanel />}
  </div>
);
```

#### Dependencies
```typescript
import { useState, useCallback, useEffect, useMemo } from 'react';
import { DashboardPermissions, PermissionCheck, PermissionContext } from '../types/permissions';
import { User, Account, AccountUser } from '../types';
import {
  getDashboardPermissions,
  hasPermission,
  checkUserPermission,
  checkAccountPermission,
  canAccessAdminFeatures
} from '../lib/permissions';
```

#### Usage Examples

##### Basic Permission Checking
```typescript
function DashboardComponent() {
  const { useCanAccess, isLoading, error } = usePermissions(user, account, accountUser);

  const canCreateItems = useCanAccess(PERMISSIONS.CREATE_ITEMS);
  const canViewAnalytics = useCanAccess(PERMISSIONS.VIEW_ANALYTICS);

  if (isLoading) return <div>Loading permissions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {canCreateItems.granted && (
        <button>Create New Item</button>
      )}
      {canViewAnalytics.granted && (
        <AnalyticsDashboard />
      )}
    </div>
  );
}
```

##### Role-Based Component Rendering
```typescript
function AdminPanel() {
  const { isSystemAdmin, currentAccountRole } = usePermissions(user, account, accountUser);

  return (
    <div>
      {isSystemAdmin && <SystemAdminControls />}
      {currentAccountRole === 'admin' && <AccountAdminControls />}
      {currentAccountRole === 'member' && <MemberControls />}
    </div>
  );
}
```

##### Permission-Based Navigation
```typescript
function NavigationMenu() {
  const { hasPermissionSync } = usePermissions(user, account, accountUser);

  const menuItems = [
    hasPermissionSync(PERMISSIONS.VIEW_ITEMS) && { name: 'Items', href: '/dashboard/items' },
    hasPermissionSync(PERMISSIONS.VIEW_PROPERTIES) && { name: 'Properties', href: '/dashboard/properties' },
    hasPermissionSync(PERMISSIONS.VIEW_ANALYTICS) && { name: 'Analytics', href: '/dashboard/analytics' },
    hasPermissionSync(PERMISSIONS.ACCESS_SYSTEM_ADMIN) && { name: 'Admin', href: '/admin/system' }
  ].filter(Boolean);

  return (
    <nav>
      {menuItems.map(item => (
        <Link key={item.name} href={item.href}>{item.name}</Link>
      ))}
    </nav>
  );
}
```

#### Performance Considerations
- **Lazy Loading**: Permissions loaded only when needed
- **Memoization**: Optimized re-rendering with proper dependencies
- **Context Caching**: Permission context cached per user session
- **Error Boundaries**: Graceful handling of permission failures

#### Testing Strategy
- **Hook Testing**: Permission loading and state management
- **Permission Checking**: Various role and account combinations
- **Error States**: Network failures and invalid contexts
- **Performance**: Loading times and re-rendering optimization

#### Integration Points
- **Authentication Context**: Integrates with existing auth system
- **Permission Utilities**: Uses centralized permission logic
- **Dashboard Components**: Provides permission context to all components
- **API Layer**: Permission validation integrated into data operations

---

### Permission Utility Functions
**File**: `src/lib/permissions.ts`  
**Added**: September 3, 2025 06:56 CEST (REQ-023)  
**Purpose**: Core permission checking logic for role-based access control

#### Overview
The permissions utility module provides the foundational logic for role-based access control in the unified dashboard system. It includes functions for checking user permissions, account permissions, and comprehensive dashboard permission resolution.

#### Core Functions

##### checkUserPermission
```typescript
function checkUserPermission(
  user: User | null,
  requiredRole: UserRole
): PermissionCheck
```

**Purpose**: Validates user role against required permissions
**Parameters**:
- `user`: User object or null
- `requiredRole`: Required user role (USER, ADMIN, SYSTEM_ADMIN)

**Returns**: PermissionCheck with granted status and context

##### checkAccountPermission
```typescript
async function checkAccountPermission(
  user: User | null,
  account: Account,
  requiredRole: AccountRole,
  accountUser?: AccountUser
): Promise<PermissionCheck>
```

**Purpose**: Validates account-specific permissions
**Parameters**:
- `user`: User object or null
- `account`: Account object
- `requiredRole`: Required account role (OWNER, ADMIN, MEMBER, VIEWER)
- `accountUser`: Optional account membership details

##### canAccessAdminFeatures
```typescript
function canAccessAdminFeatures(user: User | null): boolean
```

**Purpose**: Determines if user has admin access
**Logic**: Checks `user.role === 'admin'` or `user.is_admin === true`

##### canManageProperties
```typescript
async function canManageProperties(
  user: User | null,
  account: Account,
  accountUser?: AccountUser
): Promise<boolean>
```

**Purpose**: Checks property management permissions
**Logic**: Requires ADMIN role or higher in account

##### canViewAnalytics
```typescript
async function canViewAnalytics(
  user: User | null,
  account: Account,
  accountUser?: AccountUser
): Promise<boolean>
```

**Purpose**: Checks analytics viewing permissions
**Logic**: Requires MEMBER role or higher in account

##### getDashboardPermissions
```typescript
async function getDashboardPermissions(
  user: User | null,
  account?: Account,
  accountUser?: AccountUser
): Promise<DashboardPermissions>
```

**Purpose**: Comprehensive dashboard permission resolution
**Returns**: Complete permission set for all dashboard features

#### Permission Resolution Logic

##### System Admin Permissions
```typescript
// System admins have full access
if (userCheck.granted && userCheck.context?.isSystemAdmin) {
  return {
    canAccessDashboard: true,
    canAccessItems: true,
    canAccessProperties: true,
    canAccessAnalytics: true,
    canAccessAdminFeatures: true,
    canAccessSystemAdmin: true,
    // Full CRUD permissions...
  };
}
```

##### Account Owner Permissions
```typescript
// Account owners have account-level control
if (account && account.owner_id === user.id) {
  return {
    // Full access to account resources
    canCreateItems: true,
    canEditItems: true,
    canDeleteItems: true,
    canManageAccountUsers: true,
    canManageAccountSettings: true
  };
}
```

##### Role-Based Hierarchy
```typescript
// Account role hierarchy (higher numbers = more permissions)
const roleHierarchy: Record<AccountRole, number> = {
  [AccountRole.OWNER]: 4,
  [AccountRole.ADMIN]: 3,
  [AccountRole.MEMBER]: 2,
  [AccountRole.VIEWER]: 1
};
```

#### Usage Examples

##### Component-Level Permission Checking
```typescript
import { hasPermission } from '../lib/permissions';

async function checkItemEditPermission(user, account, accountUser) {
  const canEdit = await hasPermission(
    user,
    PERMISSIONS.EDIT_ITEMS,
    account,
    accountUser
  );

  return canEdit;
}
```

##### API-Level Permission Validation
```typescript
// In API route handler
const userPermission = await checkUserPermission(user, UserRole.ADMIN);
if (!userPermission.granted) {
  return NextResponse.json(
    { error: 'Insufficient permissions' },
    { status: 403 }
  );
}
```

##### Account-Specific Permissions
```typescript
const propertyPermission = await checkAccountPermission(
  user,
  account,
  AccountRole.ADMIN,
  accountUser
);

if (propertyPermission.granted) {
  // Allow property management operations
}
```

#### Error Handling
```typescript
try {
  const permissions = await getDashboardPermissions(user, account, accountUser);
  return permissions;
} catch (error) {
  console.error('Permission resolution failed:', error);
  return getDefaultPermissions(); // Secure defaults
}
```

#### Performance Optimizations
- **Caching**: Permission results cached per user session
- **Batch Operations**: Multiple permission checks in single operation
- **Early Returns**: Fail-fast logic for unauthorized users
- **Memory Management**: Proper cleanup of permission contexts

---

## Layout Components

### SystemAdminLayout
**File**: `src/app/admin/system/layout.tsx`  
**Added**: September 3, 2025 (REQ-023 Task 8.1)  
**Purpose**: Dedicated layout for system administrator functions with enhanced security and branding

#### Overview
The SystemAdminLayout component provides a specialized interface for system administrators (`isAdmin = true`), featuring distinctive red-themed branding and dedicated navigation for system-level functions. It serves as a secure gateway to administrative back office operations and user management tools.

#### Component Structure
```typescript
export default function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element
```

#### Features

##### Access Control
- **System Admin Only**: Requires `isAdmin = true` permission
- **Secure Authentication**: Validates user admin status before rendering
- **Graceful Access Denied**: Clear messaging for unauthorized users with return navigation

##### Visual Design
- **Red Theme Branding**: Distinctive red header and background (`bg-red-900`, `bg-red-50`)
- **System Admin Badge**: Clear identification with 👑 System Admin indicator
- **Breadcrumb Navigation**: Shows Dashboard → System Admin context path
- **Professional Styling**: Consistent with admin theme but visually distinct

##### Navigation Structure
```typescript
const navigationItems = [
  { name: 'Back to Dashboard', href: '/dashboard', icon: '⬅️' },
  { name: 'Back Office', href: '/admin/system/back-office', icon: '👑' },
  { name: 'User Management', href: '/admin/system/user-management', icon: '👥' },
  { name: 'System Analytics', href: '/admin/system/analytics', icon: '📊' },
];
```

##### Security Features
- **Permission Verification**: Checks `isAdmin` flag on every render
- **Session Validation**: Integrates with existing authentication context
- **Route Protection**: Prevents access to system admin routes for regular users
- **Error Boundaries**: Handles authentication failures gracefully

##### User Experience
- **Loading States**: Appropriate loading indicators during authentication checks
- **Error Messages**: Clear communication of access restrictions
- **Navigation Options**: Multiple paths to return to main dashboard
- **Responsive Design**: Mobile-friendly layout and navigation

#### Usage Context
```typescript
// In system admin pages
export default function SystemAdminPage() {
  return (
    <SystemAdminLayout>
      <div className="system-admin-content">
        {/* System admin specific content */}
      </div>
    </SystemAdminLayout>
  );
}
```

#### Integration Points
- **Authentication Context**: Leverages existing `useAuth()` and `useAccountContext()`
- **Navigation System**: Integrates with unified dashboard navigation
- **Permission System**: Uses `isAdmin` flag from user authentication
- **Error Handling**: Follows established error handling patterns

#### Security Considerations
- **Elevated Permissions**: Only accessible to system administrators
- **Session Monitoring**: Continuous validation of admin privileges
- **Audit Trail**: All system admin actions are logged
- **Access Logging**: Records entry and exit from system admin areas

---

**Component Status**: Production Ready  
**Last Updated**: September 3, 2025  
**Implementation**: Dedicated system admin layout for REQ-023 unified route architecture

**Permission System Status**: Production Ready  
**Last Tested**: September 3, 2025 06:56 CEST  
**Implementation**: Complete role-based access control for unified dashboard architecture