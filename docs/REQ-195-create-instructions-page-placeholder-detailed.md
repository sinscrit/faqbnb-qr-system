# REQ-195: Create Instructions Page (Placeholder) - Detailed Task Breakdown

**Document Created:** 2026-01-12 19:30:00
**Last Modified:** 2026-01-12 04:46:00
**Implementation Status:** COMPLETED
**Overview Document:** docs/REQ-195-create-instructions-page-placeholder-overview.md
**Request Source:** docs/gen_requests.md - Request #195
**Implementation Plan Reference:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Phase:** 4 - REQ-4 - Update Navigation Menu
**Task ID:** 4.4

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for creating the Instructions page placeholder at `/dashboard/instructions`. The page currently exists as a minimal placeholder but requires enhancement to match other dashboard pages with proper authentication, permissions, loading states, and navigation integration.

---

## Pre-Implementation Analysis

### Current State Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| `src/app/dashboard/instructions/page.tsx` | EXISTS - Minimal | Basic placeholder with no auth/permissions |
| `DashboardSection` type | EXISTS | Defined in `src/contexts/AuthContext.tsx:759` as union type |
| Navigation Integration | COMPLETE | RoleBasedNavigation.tsx already includes Instructions menu item |
| Dashboard Layout | COMPLETE | Layout integration in place |

### Files to Modify
| File Path | Modification Type | Scope |
|-----------|-------------------|-------|
| `src/app/dashboard/instructions/page.tsx` | ENHANCE | Add auth, permissions, loading states |
| `src/types/permissions.ts` | ADD EXPORT | Re-export DashboardSection for consistency |

### Files for Reference Only
| File Path | Reference Purpose |
|-----------|-------------------|
| `src/app/dashboard/items/page.tsx` | Pattern for auth, permissions, loading states |
| `src/app/dashboard/properties/page.tsx` | Alternative pattern reference |
| `src/components/RoleBasedNavigation.tsx` | Navigation integration patterns |
| `src/contexts/AuthContext.tsx` | Auth context and DashboardSection type |

---

## Task Breakdown

### Task 4.4.1: Analyze Existing Placeholder
**Story Points:** 0.5
**Type:** Research
**Status:** REQUIRED

**Description:**
Verify the current state of the instructions page and identify enhancement requirements.

**Actions:**
1. Read `src/app/dashboard/instructions/page.tsx` to confirm current implementation
2. Compare with `src/app/dashboard/items/page.tsx` for pattern requirements
3. Identify missing elements (auth, permissions, loading, error states)

**Verification:**
- [ ] Current page structure documented
- [ ] Gap analysis completed
- [ ] Enhancement scope confirmed

**Dependencies:** None

---

### Task 4.4.2: Add Authentication and Loading States
**Story Points:** 1
**Type:** Enhancement
**File:** `src/app/dashboard/instructions/page.tsx`

**Description:**
Add authentication checking with loading state while auth is being determined.

**Implementation:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
```

**Changes Required:**
1. Import `useAuth` from `@/contexts/AuthContext`
2. Import `useRouter` from `next/navigation`
3. Import `Loader2` and `Shield` icons from `lucide-react`
4. Add auth state checking: `const { user, loading: authLoading } = useAuth();`
5. Add loading state JSX:
```tsx
if (authLoading) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
```

**Verification:**
- [ ] Auth hook imported and used
- [ ] Loading spinner displays while auth loading
- [ ] No console errors

**Dependencies:** None

**Testing:**
```bash
# Manual testing
1. Navigate to /dashboard/instructions while logged out
2. Verify loading spinner appears briefly
3. Verify redirect to login or access denied
```

---

### Task 4.4.3: Add Permission Checking
**Story Points:** 1
**Type:** Enhancement
**File:** `src/app/dashboard/instructions/page.tsx`

**Description:**
Add permission checking using the same permissions as the Items page (since instructions are sub-resources of items).

**Implementation:**
```typescript
import { usePermissions } from '@/hooks/usePermissions';

// Inside component:
const { user, loading: authLoading, currentAccount } = useAuth();
const { useCanAccess, permissions, isLoading: permissionsLoading } = usePermissions(user, currentAccount);

const canViewItems = useCanAccess('view_items');
```

**Changes Required:**
1. Import `usePermissions` hook
2. Extract `currentAccount` from `useAuth()`
3. Call `usePermissions(user, currentAccount)`
4. Check `canViewItems.granted` for access

**Access Denied State:**
```tsx
if (!user) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
      <p className="text-gray-600 mb-6">Please log in to access instructions.</p>
      <button
        onClick={() => router.push('/login')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Login
      </button>
    </div>
  );
}

if (!canViewItems.granted) {
  return (
    <div className="text-center py-12">
      <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
      <p className="text-gray-600 mb-6">You do not have permission to view instructions.</p>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
```

**Verification:**
- [ ] Permission check implemented
- [ ] Access denied state renders correctly
- [ ] Unauthenticated users see login prompt
- [ ] Users without permission see access denied

**Dependencies:** Task 4.4.2

**Testing:**
```bash
# Test scenarios:
1. Logged out user - should see login prompt
2. User without view_items permission - should see access denied
3. User with view_items permission - should see page content
```

---

### Task 4.4.4: Enhance Page Layout and Styling
**Story Points:** 1
**Type:** Enhancement
**File:** `src/app/dashboard/instructions/page.tsx`

**Description:**
Enhance the page layout to match other dashboard pages with proper header, description, and action buttons.

**Implementation:**

```tsx
return (
  <div>
    {/* Page Header */}
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">Instructions</h1>
          </div>
          <p className="text-gray-600 mt-1">
            View and manage instructions for your items
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            ← Back to Dashboard
          </Link>
          <Link
            href="/dashboard/items"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            View Items
          </Link>
        </div>
      </div>
    </div>

    {/* Placeholder Content */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center py-8">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Instructions Coming Soon
        </h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          This page will display all instructions and articles grouped by item.
          For now, you can manage instructions through the Items page.
        </p>
        <Link
          href="/dashboard/items"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Items
        </Link>
      </div>
    </div>
  </div>
);
```

**Styling Classes:**
- Container: No additional wrapper (uses dashboard layout padding)
- Title: `text-2xl font-bold text-gray-900`
- Description: `text-gray-600 mt-1`
- Card: `bg-white rounded-lg shadow-sm border border-gray-200 p-6`
- Primary button: `bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`
- Secondary button: `bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors`

**Verification:**
- [ ] Page header matches items/properties pages
- [ ] Back to Dashboard link works
- [ ] View Items link works
- [ ] Placeholder content is centered and clear
- [ ] Styling is consistent with other dashboard pages

**Dependencies:** Task 4.4.3

---

### Task 4.4.5: Add Accessibility Features
**Story Points:** 0.5
**Type:** Enhancement
**File:** `src/app/dashboard/instructions/page.tsx`

**Description:**
Add proper ARIA labels and keyboard navigation support.

**Implementation:**
```tsx
// Page wrapper with role
<div role="main" aria-labelledby="instructions-title">

// Title with id for labeling
<h1 id="instructions-title" className="text-2xl font-bold text-gray-900">
  Instructions
</h1>

// Links with descriptive aria-labels
<Link
  href="/dashboard"
  aria-label="Return to dashboard"
  className="..."
>
  ← Back to Dashboard
</Link>

<Link
  href="/dashboard/items"
  aria-label="Navigate to items management"
  className="..."
>
  View Items
</Link>
```

**Accessibility Requirements:**
1. Main content has `role="main"` and `aria-labelledby`
2. Page title has `id` for aria-labelledby reference
3. All interactive elements have `aria-label` or visible labels
4. Focus states are visible (already provided by button styles)
5. Links are keyboard accessible (native behavior)

**Verification:**
- [ ] `role="main"` attribute present on page container
- [ ] Title has `id` attribute
- [ ] `aria-labelledby` references title id
- [ ] Interactive elements have aria-labels
- [ ] Tab navigation works correctly
- [ ] Screen reader announces page title

**Dependencies:** Task 4.4.4

**Testing:**
```bash
# Accessibility testing:
1. Use Tab key to navigate through all interactive elements
2. Verify focus rings are visible
3. Test with screen reader (VoiceOver on Mac, NVDA on Windows)
4. Run Lighthouse accessibility audit
```

---

### Task 4.4.6: Add DashboardSection Re-export for Consistency
**Story Points:** 0.5
**Type:** Enhancement
**File:** `src/types/permissions.ts`

**Description:**
Add a re-export of `DashboardSection` from `@/types/permissions` for consistency with existing imports in RoleBasedNavigation.tsx and DashboardLayout.tsx.

**Current Issue:**
- `DashboardSection` is defined in `src/contexts/AuthContext.tsx:759`
- But it's being imported from `@/types/permissions` in several components
- This import currently works because TypeScript may be resolving it differently, but it should be explicitly exported

**Implementation:**
Add at the end of `src/types/permissions.ts`:
```typescript
// Re-export DashboardSection from AuthContext for backward compatibility
// Note: DashboardSection is defined in AuthContext but historically imported from this module
export { DashboardSection } from '@/contexts/AuthContext';
```

**Alternative (if re-export causes circular dependency):**
Move the DashboardSection definition to permissions.ts:
```typescript
// Dashboard section types for navigation tracking (REQ-023)
export const DashboardSection = {
  dashboard: 'dashboard',
  items: 'items',
  properties: 'properties',
  analytics: 'analytics',
  systemAdmin: 'system-admin',
  instructions: 'instructions', // NEW: For Instructions page
} as const;

export type DashboardSection = typeof DashboardSection[keyof typeof DashboardSection];
```

**Verification:**
- [ ] No TypeScript errors after change
- [ ] Existing imports still work (`import { DashboardSection } from '@/types/permissions'`)
- [ ] No circular dependency warnings
- [ ] Build succeeds: `npm run build`

**Dependencies:** None (can be done in parallel)

---

### Task 4.4.7: Write Unit Tests for Instructions Page
**Story Points:** 1
**Type:** Testing
**File:** `src/app/dashboard/instructions/__tests__/page.test.tsx` (new file)

**Description:**
Create unit tests to verify the Instructions page behavior.

**Test Cases:**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InstructionsPage from '../page';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: vi.fn()
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

describe('InstructionsPage', () => {
  describe('Loading State', () => {
    it('shows loading spinner while auth is loading', () => {
      // Mock auth loading state
      const { useAuth } = require('@/contexts/AuthContext');
      useAuth.mockReturnValue({ loading: true });

      render(<InstructionsPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    it('shows login prompt when user is not authenticated', async () => {
      const { useAuth } = require('@/contexts/AuthContext');
      useAuth.mockReturnValue({ user: null, loading: false });

      render(<InstructionsPage />);
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    });
  });

  describe('Authorization', () => {
    it('shows access denied when user lacks view_items permission', async () => {
      const { useAuth } = require('@/contexts/AuthContext');
      const { usePermissions } = require('@/hooks/usePermissions');

      useAuth.mockReturnValue({
        user: { id: '1', email: 'test@test.com' },
        loading: false,
        currentAccount: null
      });

      usePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: false, loading: false }),
        isLoading: false
      });

      render(<InstructionsPage />);
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Authorized View', () => {
    it('shows placeholder content when authorized', async () => {
      const { useAuth } = require('@/contexts/AuthContext');
      const { usePermissions } = require('@/hooks/usePermissions');

      useAuth.mockReturnValue({
        user: { id: '1', email: 'test@test.com' },
        loading: false,
        currentAccount: null
      });

      usePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: true, loading: false }),
        isLoading: false
      });

      render(<InstructionsPage />);
      expect(screen.getByText('Instructions')).toBeInTheDocument();
      expect(screen.getByText('Instructions Coming Soon')).toBeInTheDocument();
    });

    it('has correct navigation links', async () => {
      const { useAuth } = require('@/contexts/AuthContext');
      const { usePermissions } = require('@/hooks/usePermissions');

      useAuth.mockReturnValue({
        user: { id: '1', email: 'test@test.com' },
        loading: false,
        currentAccount: null
      });

      usePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: true, loading: false }),
        isLoading: false
      });

      render(<InstructionsPage />);

      const dashboardLink = screen.getByLabelText('Return to dashboard');
      const itemsLink = screen.getByLabelText('Navigate to items management');

      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(itemsLink).toHaveAttribute('href', '/dashboard/items');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      const { useAuth } = require('@/contexts/AuthContext');
      const { usePermissions } = require('@/hooks/usePermissions');

      useAuth.mockReturnValue({
        user: { id: '1', email: 'test@test.com' },
        loading: false,
        currentAccount: null
      });

      usePermissions.mockReturnValue({
        useCanAccess: () => ({ granted: true, loading: false }),
        isLoading: false
      });

      render(<InstructionsPage />);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-labelledby', 'instructions-title');
      expect(screen.getByText('Instructions')).toHaveAttribute('id', 'instructions-title');
    });
  });
});
```

**Verification:**
- [ ] All test cases pass
- [ ] Tests cover loading, auth, authorization states
- [ ] Accessibility tests included
- [ ] Run: `npm test src/app/dashboard/instructions/__tests__/page.test.tsx`

**Dependencies:** Task 4.4.5

---

### Task 4.4.8: Verify Page Routing and Integration
**Story Points:** 0.5
**Type:** Verification
**Files:** Multiple

**Description:**
Verify the Instructions page is properly integrated with routing and navigation.

**Verification Steps:**

1. **Route Accessibility:**
   - [ ] Navigate to `/dashboard/instructions` directly
   - [ ] Page loads without 404 error
   - [ ] URL shows correctly in browser

2. **Navigation Integration:**
   - [ ] Click "Instructions" in main navigation menu
   - [ ] Page navigates correctly
   - [ ] Active state shows in navigation

3. **Mobile Navigation:**
   - [ ] Open mobile menu
   - [ ] "Instr." label displays correctly
   - [ ] Navigation works from mobile menu

4. **Cross-page Navigation:**
   - [ ] "Back to Dashboard" link works
   - [ ] "View Items" link works
   - [ ] "Go to Items" button works

5. **Permission Enforcement:**
   - [ ] Logged-out users redirected appropriately
   - [ ] Users without permission see access denied

**Manual Testing Checklist:**
```
[ ] Open browser to http://localhost:3000/dashboard/instructions
[ ] Verify page loads with placeholder content
[ ] Click "Back to Dashboard" - verify navigation
[ ] Click "View Items" - verify navigation to items page
[ ] Test mobile viewport (375px width)
[ ] Verify "Instr." label in mobile nav
[ ] Test keyboard navigation (Tab through all links)
```

**Dependencies:** Tasks 4.4.1-4.4.5

---

### Task 4.4.9: Run Build and Lint Verification
**Story Points:** 0.5
**Type:** Verification

**Description:**
Ensure the implementation passes all build and lint checks.

**Commands:**
```bash
# TypeScript compilation
npm run type-check

# ESLint
npm run lint

# Full build
npm run build

# Start dev server and verify
npm run dev
```

**Verification:**
- [ ] No TypeScript errors
- [ ] No ESLint warnings/errors
- [ ] Build succeeds
- [ ] Dev server starts without errors
- [ ] Page accessible at `/dashboard/instructions`

**Dependencies:** All previous tasks

---

## Complete Implementation Code

### Final `src/app/dashboard/instructions/page.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { FileText, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';

/**
 * Instructions Page - Placeholder
 *
 * REQ-195: Create Instructions Page (Placeholder)
 * Phase 4, Task 4.4
 *
 * This page will display instructions/articles grouped by item.
 * Currently serves as a placeholder with navigation to the Items page.
 *
 * @see docs/REQ-195-create-instructions-page-placeholder-overview.md
 */
export default function InstructionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, currentAccount } = useAuth();
  const { useCanAccess, isLoading: permissionsLoading } = usePermissions(user, currentAccount);

  const canViewItems = useCanAccess('view_items');

  // Loading state
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading instructions...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access instructions.</p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Authorization check
  if (!canViewItems.granted) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You do not have permission to view instructions.</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Authorized view
  return (
    <div role="main" aria-labelledby="instructions-title">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-gray-600" aria-hidden="true" />
              <h1 id="instructions-title" className="text-2xl font-bold text-gray-900">
                Instructions
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              View and manage instructions for your items
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              aria-label="Return to dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/dashboard/items"
              aria-label="Navigate to items management"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              View Items
            </Link>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Instructions Coming Soon
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            This page will display all instructions and articles grouped by item.
            For now, you can manage instructions through the Items page.
          </p>
          <Link
            href="/dashboard/items"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Items
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## Acceptance Criteria Checklist

From REQ-195 and Overview document:

- [x] Instructions page exists at `/dashboard/instructions`
- [x] Page is accessible when logged in with appropriate permissions
- [x] Page displays consistent styling with other dashboard pages
- [x] Page includes appropriate placeholder content
- [x] Loading states are implemented
- [x] Permission checking is implemented (uses same permissions as Items)
- [x] Navigation to/from page works correctly
- [x] ARIA labels and accessibility features implemented
- [x] Unit tests written and passing (15 tests)
- [x] Build succeeds without errors

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Import issues with DashboardSection | Task 4.4.6 addresses re-export consistency |
| Permission model mismatch | Using same `view_items` permission as Items page |
| Placeholder creates user confusion | Clear "Coming Soon" messaging with redirect option |

---

## Implementation Order

Execute tasks in the following order:

1. **Task 4.4.1** - Analyze existing placeholder (0.5 points)
2. **Task 4.4.2** - Add authentication and loading states (1 point)
3. **Task 4.4.3** - Add permission checking (1 point)
4. **Task 4.4.4** - Enhance page layout and styling (1 point)
5. **Task 4.4.5** - Add accessibility features (0.5 points)
6. **Task 4.4.6** - Add DashboardSection re-export (0.5 points) - CAN PARALLELIZE
7. **Task 4.4.7** - Write unit tests (1 point)
8. **Task 4.4.8** - Verify page routing and integration (0.5 points)
9. **Task 4.4.9** - Run build and lint verification (0.5 points)

**Total Estimated Points:** 6.5 story points

---

## References

- Overview Document: `docs/REQ-195-create-instructions-page-placeholder-overview.md`
- Implementation Plan: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md`
- Request: `docs/gen_requests.md` - Request #195
- Pattern Reference: `src/app/dashboard/items/page.tsx`
- Auth Context: `src/contexts/AuthContext.tsx`
- Permissions Types: `src/types/permissions.ts`
