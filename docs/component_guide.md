# FAQBNB Component Guide

This document provides detailed information about React components in the FAQBNB QR Item Display System.

**Last Updated**: September 4, 2025 - Sequential Authentication State Machine (REQ-025)

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

### SystemBackOfficePage
**File**: `src/app/admin/system/back-office/page.tsx`  
**Added**: September 3, 2025 (REQ-023 Task 8.2)  
**Purpose**: Enhanced system administrator back office with user analytics and access request management

#### Overview
The SystemBackOfficePage component provides a secure, system-admin-only interface for advanced user management and access control. This component was moved from the general admin area to the dedicated system admin section for enhanced security and proper role separation.

#### Component Structure
```typescript
export default function SystemBackOfficePage(): JSX.Element
```

#### Enhanced Features

##### Security Enhancements
- **System Admin Only Access**: Restricted to users with `isAdmin = true`
- **Secure Data Handling**: All operations logged and audited
- **Confirmation Dialogs**: Enhanced user interaction for critical actions
- **Error Boundaries**: Robust error handling with user-friendly messages

##### User Analytics Dashboard
- **Comprehensive User Metrics**: Total users, accounts, items, and visits tracking
- **Real-time Statistics**: Live data updates from existing admin APIs
- **User Analytics Table**: Detailed user activity and account management view
- **System-wide Overview**: Cross-account analytics for system administrators

##### Access Request Management
- **Advanced Filtering**: Status-based filtering (pending, approved, denied, registered)
- **Approval Workflow**: Streamlined approval and denial processes
- **Email Notifications**: Integrated email sending for approved requests
- **Audit Trail**: Complete logging of all access request actions

##### Visual Design
- **System Admin Branding**: Red-themed interface consistent with system admin area
- **Enhanced UI Components**: Improved tables, cards, and interaction elements
- **Responsive Layout**: Mobile-friendly design with proper spacing
- **Loading States**: Professional loading indicators and error states

##### Action Handlers
```typescript
// Enhanced action handlers with confirmation dialogs
const handleApproveRequest = async (requestId: string) => { /* ... */ }
const handleDenyRequest = async (requestId: string) => { /* ... */ }
const handleSendEmail = async (requestId: string) => { /* ... */ }
```

#### API Integration
- **User Analytics API**: `/api/admin/users/analytics` for comprehensive user data
- **Access Request Management**: Integrated with existing access request workflows
- **Real-time Updates**: Live data synchronization with backend systems
- **Error Handling**: Comprehensive error management with user feedback

#### Security Features
- **Permission Validation**: Continuous validation of system admin privileges
- **Session Monitoring**: Active session verification throughout usage
- **Action Logging**: Complete audit trail for all administrative actions
- **Secure Communication**: Encrypted data transmission and storage

#### User Experience Improvements
- **Confirmation Dialogs**: User confirmation for destructive actions
- **Status Indicators**: Clear visual feedback for all operations
- **Error Recovery**: Graceful error handling with retry options
- **Navigation Integration**: Seamless integration with system admin navigation

#### Performance Optimizations
- **Efficient Data Loading**: Optimized API calls and data processing
- **Lazy Loading**: On-demand loading of heavy components
- **Caching Strategy**: Smart caching of frequently accessed data
- **Memory Management**: Proper cleanup and resource management

#### Usage Context
```typescript
// System admin access only
export default function SystemBackOfficePage() {
  return (
    <SystemAdminLayout>
      <SystemBackOfficePage />
    </SystemAdminLayout>
  );
}
```

#### Migration Benefits
- **Enhanced Security**: Moved to dedicated system admin area
- **Improved UX**: Better confirmation dialogs and user feedback
- **Audit Compliance**: Complete logging and audit trail
- **Role Separation**: Clear separation from regular admin functions

---

## REQ-024: AuthContext Account Role Integration (September 3, 2025)

### Overview
Complete AuthContext enhancement for account role state management and integration across all dashboard components. This implementation fixes account role fetching, enhances AuthContext state management, and ensures proper permission system integration.

### Enhanced Components

#### AuthContext Provider (`src/contexts/AuthContext.tsx`)

##### Enhanced Interface
```typescript
interface AuthContextType {
  // Enhanced: getAccountRole now returns Promise<AccountRole | null>
  getAccountRole: () => Promise<AccountRole | null>;

  // Enhanced: currentAccount includes userRole field
  currentAccount: Account | null; // Account now has userRole?: AccountRole | null

  // All other existing properties maintained for backward compatibility
}
```

##### Key Enhancements
- **Async getAccountRole**: Now returns Promise for database fallback queries
- **Role State Management**: Account objects include user's role in that account
- **Enhanced Logging**: Comprehensive debug logging for account role operations
- **Error Handling**: Robust error handling with secure fallbacks

#### Enhanced Dashboard Pages

##### Properties Management Page (`src/app/dashboard/properties/page.tsx`)
```typescript
// Enhanced: Removed temporary accountUser hardcoding (REQ-024)
const { useCanAccess, permissions } = usePermissions(user, currentAccount);

// Enhanced: Validates account role integration
console.log('🔍 PROPERTIES_PAGE_DEBUG: Account role integration validation', {
  userId: user?.id,
  accountId: currentAccount?.id,
  accountUserRole: currentAccount?.userRole,
  isAccountOwner: currentAccount && user ? currentAccount.owner_id === user.id : false
});
```

**Key Changes:**
- Removed temporary `accountUser` object hardcoding
- Uses `currentAccount` directly from AuthContext
- Added validation logging for account role integration
- Maintains all existing permission functionality

##### Items Management Page (`src/app/dashboard/items/page.tsx`)
```typescript
// Enhanced: Use AuthContext account role integration (REQ-024)
const { user, currentAccount } = useAuth();
const { useCanAccess, permissions } = usePermissions(user, currentAccount);

// Enhanced: Validates account role integration
console.log('🔍 ITEMS_PAGE_DEBUG: Account role integration validation', {
  userId: user?.id,
  accountId: currentAccount?.id,
  accountUserRole: currentAccount?.userRole
});
```

**Key Changes:**
- Added `currentAccount` to useAuth destructuring
- Updated usePermissions to use `currentAccount` instead of `undefined`
- Enhanced header setting to use `currentAccount.id`
- Added comprehensive validation logging

##### Analytics Dashboard Page (`src/app/dashboard/analytics/page.tsx`)
```typescript
// Enhanced: Use AuthContext account role integration (REQ-024)
const { user, currentAccount } = useAuth();
const { useCanAccess, permissions } = usePermissions(user, currentAccount);

// Enhanced: Validates account role integration
console.log('🔍 ANALYTICS_PAGE_DEBUG: Account role integration validation', {
  userId: user?.id,
  accountId: currentAccount?.id,
  accountUserRole: currentAccount?.userRole
});
```

**Key Changes:**
- Added `currentAccount` to useAuth destructuring
- Updated usePermissions to use `currentAccount` instead of `undefined`
- Added validation logging for account role integration

#### Enhanced Permission Hook (`src/hooks/usePermissions.ts`)

##### Enhanced Role Detection
```typescript
// Enhanced: Check both account.userRole and accountUser.role (REQ-024)
const currentAccountRole = useMemo(() => {
  const roleFromAccount = account?.userRole;
  const roleFromUser = accountUser?.role;

  console.log('🔐 PERMISSIONS_HOOK_DEBUG: CURRENT_ACCOUNT_ROLE_CALCULATION', {
    accountId: account?.id,
    roleFromAccount,
    roleFromUser,
    finalRole: roleFromAccount || roleFromUser || null,
    source: roleFromAccount ? 'account.userRole' : roleFromUser ? 'accountUser.role' : 'none'
  });

  return roleFromAccount || roleFromUser || null;
}, [account?.userRole, accountUser?.role, account?.id]);
```

##### Enhanced Permission Loading
```typescript
// Enhanced: Validate account role availability (REQ-024)
if (!accountRoleFromUser && !accountRoleFromAccount && account) {
  console.warn('🔐 PERMISSIONS_HOOK_DEBUG: ACCOUNT_ROLE_WARNING: No account role found');
}

// Enhanced: Use account.userRole if available, otherwise accountUser.role
const context: PermissionContext = {
  accountRole: accountRoleFromAccount || accountRoleFromUser || null,
  // ... other context properties
};
```

### Implementation Patterns

#### Account Role Integration Pattern
```typescript
// Standard pattern for dashboard pages
function DashboardPage() {
  // 1. Get AuthContext with account role information
  const { user, currentAccount } = useAuth();

  // 2. Use usePermissions with currentAccount (includes userRole)
  const { useCanAccess, permissions } = usePermissions(user, currentAccount);

  // 3. Permission checks now use account.userRole
  const canCreate = useCanAccess('create_items');
  const canEdit = useCanAccess('edit_items');

  // 4. UI renders based on account role permissions
  return (
    <div>
      {canCreate.granted && <CreateButton />}
      {canEdit.granted && <EditButton />}
    </div>
  );
}
```

#### State Management Flow
```typescript
// Account role state management flow
1. User authentication → getUser() includes account with role
2. AuthContext initialization → setCurrentAccount(accountWithRole)
3. Permission loading → getDashboardPermissions(user, accountWithRole)
4. Component rendering → usePermissions provides role-based features
5. UI adaptation → Components show/hide features based on account role
```

### Testing and Validation

#### Component Integration Tests
```typescript
// Test account role integration in dashboard components
describe('Dashboard Components Account Role Integration', () => {
  test('Properties page uses currentAccount.userRole', () => {
    // Verify usePermissions receives currentAccount with userRole
  });

  test('Items page validates account role context', () => {
    // Verify account role validation logging
  });

  test('Analytics page uses proper account context', () => {
    // Verify currentAccount integration
  });
});
```

#### Permission Hook Tests
```typescript
// Test enhanced usePermissions hook
describe('usePermissions Account Role Integration', () => {
  test('prioritizes account.userRole over accountUser.role', () => {
    // Test role priority logic
  });

  test('provides warning for missing account role', () => {
    // Test warning logging for missing roles
  });

  test('maintains backward compatibility', () => {
    // Test existing functionality unchanged
  });
});
```

### Performance Considerations

#### Optimized State Updates
- **Role Caching**: Account roles cached in AuthContext state
- **Lazy Loading**: Account roles loaded only when needed
- **Memoization**: Permission calculations memoized per account/role
- **Background Updates**: Non-blocking account role fetching

#### Memory Management
- **State Cleanup**: Proper cleanup of account role state
- **Reference Management**: Efficient object references for account data
- **Garbage Collection**: Automatic cleanup of unused role data

### Security Enhancements

#### Role Validation
- **Database Verification**: Account roles verified against `account_users` table
- **State Consistency**: Account role state synchronized with database
- **Access Control**: Permission checks validate account membership
- **Audit Logging**: Comprehensive logging of account role operations

#### Authentication Integration
- **Role Persistence**: Account roles maintained across browser sessions
- **Session Validation**: Account role verification on session refresh
- **Multi-Tenant Security**: Proper account isolation based on user roles

### Migration Notes

#### Backward Compatibility
- **Existing Components**: All existing dashboard components continue to work
- **Permission Checks**: Existing permission logic unchanged
- **AuthContext Usage**: Existing useAuth usage patterns maintained
- **Type Safety**: Enhanced types are backward compatible

#### Migration Benefits
- **Enhanced Security**: Proper account role validation and verification
- **Improved Performance**: Optimized permission loading and caching
- **Better UX**: Seamless account role integration across dashboard
- **Maintainability**: Centralized account role management and validation

---

**Component Status**: Production Ready  
**Last Updated**: September 3, 2025  
**Implementation**: AuthContext account role integration for REQ-024 unified dashboard architecture

**Permission System Status**: Production Ready
**Last Tested**: September 3, 2025
**Implementation**: Enhanced role-based access control with account role integration

---

## Sequential Authentication State Machine Components (REQ-025)

### Enhanced AuthContext (`src/contexts/AuthContext.tsx`)

**Added**: September 4, 2025 (REQ-025 Sequential Authentication State Machine)
**Purpose**: Enterprise-grade authentication state management with sequential flows, error recovery, and performance monitoring

#### Overview
The enhanced AuthContext implements a comprehensive sequential authentication state machine that eliminates race conditions, provides predictable state transitions, and ensures reliable user authentication across all dashboard components. This architectural improvement addresses fundamental React state management issues and provides enterprise-grade authentication reliability.

#### Component Architecture

##### State Machine Implementation
```typescript
// REQ-025: Sequential State Machine - Single useEffect manages all authentication flows
enum AuthState {
  UNINITIALIZED = 'UNINITIALIZED',
  LOADING = 'LOADING',
  AUTHENTICATED = 'AUTHENTICATED',
  ERROR = 'ERROR'
}

useEffect(() => {
  const DEBUG_PREFIX = "🔄 STATE_MACHINE:";

  switch (authState) {
    case AuthState.UNINITIALIZED: {
      // REQ-025: First try to restore persisted state
      const restoredState = restoreAuthState();
      if (restoredState) {
        updateGlobalAuthState({
          user: restoredState.user,
          session: restoredState.session,
          accounts: restoredState.accounts,
          currentAccount: restoredState.currentAccount,
          authState: AuthState.AUTHENTICATED
        });
        return;
      }
      // Initiate fresh authentication with error recovery
      break;
    }

    case AuthState.LOADING: {
      // Sequential loading progress validation
      // All authentication steps must complete before AUTHENTICATED
      break;
    }

    case AuthState.AUTHENTICATED: {
      // Load dashboard permissions for authenticated user
      break;
    }

    case AuthState.ERROR: {
      // REQ-025: Attempt automatic error recovery
      recoverFromErrorState().then(recovered => {
        if (recovered) {
          // Recovery successful, transition to appropriate state
        } else {
          // Recovery failed, show error UI
        }
      });
      break;
    }
  }
}, [authState, user, session, userAccounts, currentAccount, logger]);
```

##### Enhanced Context Interface
```typescript
interface AuthContextType {
  // Core authentication state
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;

  // Multi-tenant state
  userAccounts: Account[];
  currentAccount: Account | null;

  // State machine state
  authState: AuthState;

  // Enhanced functions (REQ-025)
  getAccountRole: () => Promise<AccountRole | null>; // Now async with database fallback

  // Authentication actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchAccount: (accountId: string) => Promise<void>;

  // Performance monitoring
  getAuthPerformance: () => PerformanceStats;
}
```

#### Key Features

##### 1. Sequential State Management
- **Single Source of Truth**: One useEffect manages all authentication flows
- **Predictable Transitions**: Clear state progression (UNINITIALIZED → LOADING → AUTHENTICATED/ERROR)
- **Atomic Updates**: All state changes happen simultaneously to prevent inconsistencies
- **Race Condition Prevention**: Sequential execution eliminates concurrent state conflicts

##### 2. Enhanced State Persistence
```typescript
const persistAuthState = React.useCallback((state: AuthStateData) => {
  const persistMetricId = startTiming('STATE_PERSISTENCE', {
    authState: state.authState,
    hasUser: !!state.user,
    accountCount: state.accounts?.length || 0
  });

  try {
    const stateToPersist = {
      user: state.user,
      session: {
        ...state.session,
        access_token: '[PRESENT]' // Sanitize sensitive data
      },
      accounts: state.accounts,
      currentAccount: state.currentAccount,
      authState: state.authState,
      error: state.error,
      timestamp: Date.now(),
      version: '1.0'
    };

    localStorage.setItem('auth_persisted_state', JSON.stringify(stateToPersist));
    endTiming(persistMetricId, true);
  } catch (error) {
    endTiming(persistMetricId, false);
    // Automatic cleanup on failure
  }
}, [logger]);
```

##### 3. State Restoration with Validation
```typescript
const restoreAuthState = React.useCallback((): AuthStateData | null => {
  const restoreMetricId = startTiming('STATE_RESTORATION', { source: 'localStorage' });

  try {
    const persistedState = localStorage.getItem('auth_persisted_state');
    if (!persistedState) return null;

    const state = JSON.parse(persistedState);

    // Version validation
    if (state.version !== '1.0') {
      localStorage.removeItem('auth_persisted_state');
      return null;
    }

    // Age validation (24 hour expiry)
    const age = Date.now() - state.timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('auth_persisted_state');
      return null;
    }

    endTiming(restoreMetricId, true);
    return state;
  } catch (error) {
    endTiming(restoreMetricId, false);
    // Clear corrupted data
    localStorage.removeItem('auth_persisted_state');
    return null;
  }
}, []);
```

##### 4. Comprehensive Error Recovery
```typescript
const handleAuthErrorRecovery = React.useCallback(async (
  error: any,
  context: string,
  onRetry?: () => Promise<any>,
  onFallback?: () => Promise<any>
): Promise<{ recovered: boolean; result?: any }> => {
  const errorType = classifyAuthError(error);
  const recoverable = isRecoverableError(errorType);

  if (!recoverable) {
    console.error(`🚨 AUTH_ERROR: Unrecoverable error in ${context}:`, error);
    return { recovered: false };
  }

  // Retry with exponential backoff
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (onRetry) {
        const result = await onRetry();
        return { recovered: true, result };
      }
    } catch (retryError) {
      if (attempt < maxRetries - 1) {
        const delay = calculateRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Try fallback strategy
  if (onFallback) {
    try {
      const result = await onFallback();
      return { recovered: true, result };
    } catch (fallbackError) {
      console.error(`🚨 AUTH_FALLBACK: Fallback failed:`, fallbackError);
    }
  }

  return { recovered: false };
}, []);
```

##### 5. Performance Monitoring Integration
```typescript
// Authentication performance tracking
const authMetricId = startTiming('AUTH_ORCHESTRATOR', {
  trigger: 'state_machine',
  currentState: authState
});

const result = await authenticateUser();
recordTiming('AUTH_ORCHESTRATOR_TOTAL', performance.now() - startTime,
  result.state === 'AUTHENTICATED', {
  resultState: result.state,
  hasUser: !!result.user,
  accountCount: result.accounts?.length || 0
});

endTiming(authMetricId, result.state === 'AUTHENTICATED');
```

#### Dependencies
```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Account } from '@/types';
import {
  AuthUser,
  AuthResponse,
  Property,
  User,
  signInWithEmail as authSignIn,
  signOut as authSignOut,
  getUser,
  getSession,
  refreshSession,
  isSessionExpiringSoon,
  isAdmin,
  getUserProperties,
  registerUser,
  switchAccount,
  getAccountsForUser,
  clearAccountContext,
  AccountSwitchResponse,
} from '@/lib/auth';
import { performanceMonitor, startTiming, endTiming, recordTiming } from '@/lib/performance-monitor';
```

#### State Management
```typescript
// Core authentication state
const [user, setUser] = useState<AuthUser | null>(null);
const [session, setSession] = useState<Session | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Multi-tenant state
const [userAccounts, setUserAccounts] = useState<Account[]>([]);
const [currentAccount, setCurrentAccount] = useState<Account | null>(null);

// State machine state
const [authState, setAuthState] = useState<AuthState>(AuthState.UNINITIALIZED);

// Performance monitoring
const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
```

#### Key Methods

##### Authentication Actions
```typescript
const signIn = useCallback(async (email: string, password: string) => {
  setAuthState(AuthState.LOADING);
  setError(null);

  try {
    const result = await authSignIn(email, password);

    if (result.state === 'AUTHENTICATED') {
      updateGlobalAuthState({
        user: result.user,
        session: result.session,
        accounts: result.accounts,
        currentAccount: result.currentAccount,
        authState: AuthState.AUTHENTICATED
      });
    } else {
      setAuthState(AuthState.ERROR);
      setError(result.error || 'Authentication failed');
    }
  } catch (error) {
    setAuthState(AuthState.ERROR);
    setError(error instanceof Error ? error.message : 'Authentication failed');
  }
}, []);

const signOut = useCallback(async () => {
  try {
    await authSignOut();
    clearPersistedState();
    updateGlobalAuthState({
      user: null,
      session: null,
      accounts: [],
      currentAccount: null,
      authState: AuthState.UNINITIALIZED,
      error: null
    });
  } catch (error) {
    console.error('Sign out error:', error);
  }
}, []);
```

##### Account Management
```typescript
const switchAccount = useCallback(async (accountId: string) => {
  const switchMetricId = startTiming('ACCOUNT_SWITCH', {
    fromAccountId: currentAccount?.id,
    toAccountId: accountId
  });

  try {
    setLoading(true);
    const result = await switchToAccount(accountId);

    if (result.success) {
      setCurrentAccount(result.account);
      // Reload permissions for new account
      await loadPermissions();
      endTiming(switchMetricId, true);
    } else {
      endTiming(switchMetricId, false, { error: result.error });
      setError(result.error || 'Failed to switch account');
    }
  } catch (error) {
    endTiming(switchMetricId, false, { error: error.message });
    setError('Failed to switch account');
  } finally {
    setLoading(false);
  }
}, [currentAccount, loadPermissions]);
```

##### Performance Monitoring
```typescript
const getAuthPerformance = useCallback(() => {
  return {
    authenticationTime: getPerformanceStats('AUTH_ORCHESTRATOR_TOTAL'),
    sessionRestoration: getPerformanceStats('STATE_RESTORATION_TOTAL'),
    statePersistence: getPerformanceStats('STATE_PERSISTENCE_TOTAL'),
    errorRecovery: getPerformanceStats('AUTH_ERROR_RECOVERY'),
    summary: getPerformanceSummary()
  };
}, []);
```

#### Error Handling

##### Error Classification
```typescript
enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

##### Recovery Strategies
- **Network Errors**: Automatic retry with exponential backoff
- **Authentication Errors**: Clear user messaging with retry options
- **Database Errors**: Connection retry with circuit breaker pattern
- **Permission Errors**: Fallback to secure default permissions
- **Unknown Errors**: Comprehensive logging and user guidance

#### Styling and Design System
The AuthContext is a logical component that doesn't render UI directly. It provides authentication state and actions to UI components through the React Context API.

#### Integration Points

##### Dashboard Components
```typescript
// In dashboard components
function DashboardPage() {
  const { user, currentAccount, authState, loading, error } = useAuth();

  if (authState === AuthState.LOADING) {
    return <LoadingSpinner />;
  }

  if (authState === AuthState.ERROR) {
    return <ErrorMessage error={error} onRetry={retryAuthentication} />;
  }

  if (authState === AuthState.AUTHENTICATED) {
    return <DashboardContent user={user} currentAccount={currentAccount} />;
  }

  return <LoginPrompt />;
}
```

##### Navigation Components
```typescript
// In navigation components
function Navigation() {
  const { user, currentAccount, signOut, getAuthPerformance } = useAuth();

  const handleSignOut = async () => {
    const performance = getAuthPerformance();
    console.log('Authentication performance:', performance);
    await signOut();
  };

  return (
    <nav>
      {user && (
        <div>
          <span>Welcome, {user.email}</span>
          {currentAccount && (
            <span>Account: {currentAccount.name}</span>
          )}
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      )}
    </nav>
  );
}
```

##### API Integration
```typescript
// In API client functions
async function apiRequest(endpoint: string, options: RequestInit = {}, requiresAuth = false) {
  const { session, refreshSession } = useAuth();

  if (requiresAuth && !session) {
    throw new Error('Authentication required');
  }

  // Automatic session refresh if expiring
  if (session && isSessionExpiringSoon(session)) {
    await refreshSession();
  }

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(session && { Authorization: `Bearer ${session.access_token}` })
    }
  });

  return response;
}
```

#### Testing Strategy

##### Unit Testing
```typescript
// AuthContext state machine testing
describe('AuthContext State Machine', () => {
  test('transitions from UNINITIALIZED to LOADING on sign in', () => {
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.signIn('test@example.com', 'password');
    });
    expect(result.current.authState).toBe(AuthState.LOADING);
  });

  test('transitions to AUTHENTICATED on successful authentication', async () => {
    // Mock successful authentication
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });
    expect(result.current.authState).toBe(AuthState.AUTHENTICATED);
  });

  test('handles authentication errors gracefully', async () => {
    // Mock authentication failure
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn('invalid@example.com', 'wrongpassword');
    });
    expect(result.current.authState).toBe(AuthState.ERROR);
    expect(result.current.error).toBeTruthy();
  });
});
```

##### Integration Testing
- **Authentication Flow**: Complete login/logout cycle testing
- **Session Management**: Browser refresh and session restoration
- **Account Switching**: Multi-tenant account switching validation
- **Error Recovery**: Network failure and automatic recovery
- **Performance Monitoring**: Real-time performance metric validation

#### Performance Considerations

##### Optimization Features
- **Lazy Loading**: Authentication state loaded only when needed
- **Memoization**: Expensive operations cached with proper dependencies
- **Background Operations**: Non-blocking authentication state updates
- **Memory Management**: Proper cleanup of authentication state

##### Performance Targets
- **Authentication Time**: < 3 seconds for fresh authentication
- **Session Restoration**: < 500ms for cached sessions
- **State Persistence**: < 100ms for localStorage operations
- **Memory Usage**: Stable with no memory leaks

#### Accessibility Features
While AuthContext doesn't render UI directly, it supports accessibility through:

- **Error Announcements**: Screen reader announcements for authentication state changes
- **Loading Indicators**: Accessible loading states for authentication operations
- **Error Messages**: Descriptive error messages for authentication failures
- **Keyboard Navigation**: Support for keyboard-based authentication flows

#### Maintenance Notes

##### Code Organization
- **Single Responsibility**: AuthContext focuses solely on authentication state management
- **Separation of Concerns**: Authentication logic separated from UI components
- **Type Safety**: Full TypeScript integration with comprehensive interfaces
- **Modular Design**: Easy to extend with new authentication methods

##### Future Enhancement Opportunities
1. **Multi-Factor Authentication**: Enhanced security with MFA support
2. **Biometric Authentication**: Device-based authentication integration
3. **Social Login**: Additional OAuth provider support
4. **Session Management**: Advanced session timeout and refresh strategies
5. **Audit Logging**: Enhanced authentication event tracking
6. **Offline Support**: Offline authentication state management

---

### Performance Monitor Utility (`src/lib/performance-monitor.ts`)

**Added**: September 4, 2025 (REQ-025 Sequential Authentication State Machine)
**Purpose**: Real-time performance monitoring and analytics for authentication operations

#### Overview
The PerformanceMonitor utility provides comprehensive performance tracking and analytics capabilities for the authentication system. It enables real-time monitoring of authentication operations, error tracking, and performance optimization insights.

#### Component Structure
```typescript
interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  operation: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  lastExecution: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100;
  private stats: Map<string, PerformanceStats> = new Map();
}
```

#### Key Features

##### 1. Performance Tracking
```typescript
// Start timing an operation
const metricId = startTiming('AUTH_ORCHESTRATOR', {
  trigger: 'state_machine',
  currentState: authState
});

// End timing with success/failure
endTiming(metricId, true, {
  resultState: 'AUTHENTICATED',
  userId: user?.id
});

// Record complete operation
recordTiming('AUTH_ORCHESTRATOR_TOTAL', duration, true, {
  resultState: result.state,
  hasUser: !!result.user,
  accountCount: result.accounts?.length || 0
});
```

##### 2. Statistics Aggregation
```typescript
// Get performance statistics for specific operation
const authStats = getPerformanceStats('AUTH_ORCHESTRATOR_TOTAL');
// Returns: PerformanceStats with count, average, min, max, success rate

// Get overall performance summary
const summary = getPerformanceSummary();
// Returns: total operations, average time, success rate, slowest/fastest operations
```

##### 3. Memory Management
```typescript
// Automatic cleanup of old metrics
if (this.metrics.length > this.maxMetrics) {
  this.metrics.shift(); // Remove oldest metric
}

// Export data for analysis
const exportData = performanceMonitor.export();
// Returns: metrics, stats, and summary
```

#### Usage Examples

##### Authentication Performance Tracking
```typescript
function useAuthPerformance() {
  const startAuthentication = useCallback((context: string) => {
    return startTiming('AUTHENTICATION', { context });
  }, []);

  const endAuthentication = useCallback((metricId: string, success: boolean, metadata?: any) => {
    endTiming(metricId, success, metadata);
  }, []);

  const getAuthenticationStats = useCallback(() => {
    return getPerformanceStats('AUTHENTICATION');
  }, []);

  return {
    startAuthentication,
    endAuthentication,
    getAuthenticationStats
  };
}
```

##### Component-Level Performance Monitoring
```typescript
function AuthenticatedComponent() {
  const { startAuthentication, endAuthentication } = useAuthPerformance();

  useEffect(() => {
    const metricId = startAuthentication('component_mount');

    // Component logic here

    return () => {
      endAuthentication(metricId, true, { component: 'AuthenticatedComponent' });
    };
  }, []);

  return <div>Authenticated Content</div>;
}
```

##### Performance Dashboard Integration
```typescript
function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats[]>([]);

  useEffect(() => {
    const updateStats = () => {
      setStats(getPerformanceStats());
    };

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    updateStats(); // Initial load

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="performance-dashboard">
      {stats.map(stat => (
        <div key={stat.operation} className="metric-card">
          <h3>{stat.operation}</h3>
          <div className="metrics">
            <div>Count: {stat.count}</div>
            <div>Average: {stat.averageDuration.toFixed(2)}ms</div>
            <div>Success Rate: {stat.successRate.toFixed(1)}%</div>
            <div>Min/Max: {stat.minDuration}/{stat.maxDuration}ms</div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Dependencies
```typescript
// No external dependencies - uses native browser performance API
// Compatible with all modern browsers supporting performance.now()
```

#### Error Handling
```typescript
// Graceful degradation for unsupported browsers
if (typeof performance === 'undefined' || !performance.now) {
  console.warn('Performance monitoring not supported in this browser');
  // Fallback to Date.now() or disable monitoring
}

// Handle localStorage errors
try {
  localStorage.setItem('performance_metrics', JSON.stringify(metrics));
} catch (error) {
  console.warn('Failed to persist performance metrics:', error);
  // Continue without persistence
}
```

#### Performance Impact
- **Memory Usage**: Minimal (< 1MB for 100 metrics)
- **CPU Overhead**: Negligible (< 0.1ms per operation)
- **Storage Impact**: Small JSON objects in localStorage
- **Network Impact**: None (client-side only)

#### Testing Strategy

##### Unit Testing
```typescript
describe('PerformanceMonitor', () => {
  test('tracks operation timing correctly', () => {
    const monitor = new PerformanceMonitor();
    const metricId = monitor.start('test_operation');

    // Simulate operation
    setTimeout(() => {
      monitor.end(metricId, true);

      const stats = monitor.getStats('test_operation');
      expect(stats[0].count).toBe(1);
      expect(stats[0].successRate).toBe(100);
    }, 100);
  });

  test('calculates statistics accurately', () => {
    const monitor = new PerformanceMonitor();

    // Record multiple operations
    monitor.record('test_op', 100, true);
    monitor.record('test_op', 200, true);
    monitor.record('test_op', 150, false);

    const stats = monitor.getStats('test_op')[0];
    expect(stats.averageDuration).toBe(150);
    expect(stats.successRate).toBe(66.7);
  });
});
```

##### Integration Testing
- **Browser Compatibility**: Testing across different browsers
- **Memory Leak Prevention**: Long-running performance monitoring
- **Storage Limitations**: Handling localStorage quota exceeded
- **Performance Impact**: Measuring monitoring overhead

#### Browser Compatibility
- **Modern Browsers**: Chrome 24+, Firefox 15+, Safari 9+, Edge 12+
- **Legacy Support**: Graceful degradation for older browsers
- **Mobile Browsers**: Full support on iOS Safari, Chrome Mobile
- **Performance API**: Uses native `performance.now()` when available

#### Maintenance Notes

##### Code Organization
- **Single Responsibility**: Focused solely on performance monitoring
- **Modular Design**: Easy to extend with new metric types
- **Memory Efficient**: Automatic cleanup and size limits
- **Type Safe**: Full TypeScript integration

##### Future Enhancement Opportunities
1. **Server-Side Integration**: Send metrics to monitoring service
2. **Advanced Analytics**: Trend analysis and anomaly detection
3. **Custom Dashboards**: Configurable performance visualizations
4. **Alerting System**: Performance threshold notifications
5. **Historical Data**: Long-term performance trend storage
6. **Real-time Monitoring**: WebSocket-based live updates

---

**Component Status**: Production Ready
**Last Tested**: September 4, 2025
**Implementation**: Sequential authentication state machine with performance monitoring (REQ-025)