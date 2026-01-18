# REQ-119: Remove Account References from Layout Component - Implementation Overview

**Document Created:** 2026-01-06 14:45:00 UTC
**Request Reference:** docs/gen_requests.md - REQ-119
**Implementation Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md
**Phase:** 1 - Fix PRD Violations (Critical Path)
**Task ID:** 1.1

---

## 1. Summary

This task removes all account-related references from the `/src/app/dashboard2/layout.tsx` component to ensure compliance with PRD Design Principle #1: "No account references." The layout currently displays account selection UI (CompactAccountSelector) and account type badges that should not be present according to the product specification.

---

## 2. Current State Analysis

### 2.1 Identified Account References in layout.tsx

| Line(s) | Element | Description | Violation |
|---------|---------|-------------|-----------|
| 14 | `useAccountContext` import | Hook import for account context | Design Principle #1 |
| 15 | `CompactAccountSelector` import | Component import for account selector | Design Principle #1 |
| 16 | `Account` type import | Type import for account | Design Principle #1 |
| 23 | `const { currentAccount } = useAccountContext()` | Hook usage | Design Principle #1 |
| 32-35 | `handleAccountChange` function | Account change handler | Design Principle #1 |
| 98-108 | Account type badge + user email display | Header section showing Admin/User badge and email | Design Principle #1 |
| 113 | `<CompactAccountSelector onAccountChange={handleAccountChange} className="w-64" />` | Account selector component | Design Principle #1 |

### 2.2 Header Elements to Retain

Per PRD requirements, the header should contain ONLY:
- FAQBNB logo/title
- Navigation tabs (Home, Create Item, My Items)
- Logout button

---

## 3. Technical Approach

### 3.1 Removal Strategy

1. **Remove imports** (lines 14-16 partial):
   - Remove `useAccountContext` from AuthContext import
   - Remove entire `CompactAccountSelector` import line
   - Remove `Account` type import

2. **Remove hook usage** (line 23):
   - Remove `const { currentAccount } = useAccountContext()` - variable is unused in layout after account references removed

3. **Remove handler function** (lines 32-35):
   - Remove `handleAccountChange` function entirely

4. **Simplify header left section** (lines 94-108):
   - Remove the account type badge (`<span>` with Admin/User)
   - Remove user email display
   - Keep only FAQBNB title

5. **Remove account selector from header right section** (line 113):
   - Remove `<CompactAccountSelector>` component
   - Keep only logout button

### 3.2 Resulting Header Structure

```tsx
{/* Header */}
<header className="border-b border-gray-200 bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center py-4">
      {/* Left side - Title only */}
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900">FAQBNB</h1>
      </div>

      {/* Right side - Logout only */}
      <div className="flex items-center">
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 flex items-center gap-1"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  </div>
</header>
```

---

## 4. Impact Analysis

### 4.1 No Downstream Impact

| File | Impact | Reason |
|------|--------|--------|
| `/src/app/dashboard2/page.tsx` | None | Has its own account context usage (separate task 1.2) |
| `/src/app/dashboard2/create/page.tsx` | None | Uses `currentAccount` for API headers - legitimate usage |
| `/src/app/dashboard2/items/page.tsx` | None | Uses `currentAccount` for API headers - legitimate usage |

### 4.2 Important Note

The `useAccountContext` in `/dashboard2/create/page.tsx` and `/dashboard2/items/page.tsx` is **NOT** to be removed. These files use `currentAccount.id` in API request headers for RLS (Row Level Security) and are a legitimate backend integration, not a UI element violation.

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files Authorized for Modification

| File | Authorization Level | Scope |
|------|---------------------|-------|
| `/src/app/dashboard2/layout.tsx` | **FULL** | Remove account references as specified |

### 5.2 Specific Functions/Sections Authorized

| Location | Function/Section | Action |
|----------|------------------|--------|
| Line 14 | Import statement | Remove `useAccountContext` from import |
| Line 15 | Import statement | DELETE entire line |
| Line 16 | Import statement | DELETE entire line |
| Line 23 | Hook usage | DELETE entire line |
| Lines 32-35 | `handleAccountChange` function | DELETE entire function |
| Lines 94-108 | Header left section | MODIFY to remove badge and email |
| Line 113 | CompactAccountSelector | DELETE component usage |

### 5.3 Files NOT Authorized for Modification

| File | Reason |
|------|--------|
| `/src/app/dashboard2/page.tsx` | Handled in Task 1.2 |
| `/src/app/dashboard2/create/page.tsx` | Account context usage is for API headers (legitimate) |
| `/src/app/dashboard2/items/page.tsx` | Account context usage is for API headers (legitimate) |
| `/src/components/AccountSelector.tsx` | Component remains for other parts of application |

---

## 6. Testing Considerations

### 6.1 Visual Verification

- [ ] Header shows only "FAQBNB" title on left side
- [ ] No Admin/User badge visible
- [ ] No user email visible
- [ ] No account selector dropdown visible
- [ ] Logout button remains functional

### 6.2 Console Verification

- [ ] No console errors related to removed components
- [ ] No console warnings about unused imports
- [ ] No undefined variable errors

### 6.3 Functional Verification

- [ ] Page loads without errors
- [ ] Navigation tabs still work (Home, Create Item, My Items)
- [ ] Logout button still functions correctly
- [ ] Layout renders correctly on mobile viewport sizes

---

## 7. Implementation Steps

### Step 1: Remove Imports
```diff
- import { AuthProvider, useAuth, useAccountContext } from '@/contexts/AuthContext';
+ import { AuthProvider, useAuth } from '@/contexts/AuthContext';
- import { CompactAccountSelector } from '@/components/AccountSelector';
- import { Account } from '@/types';
```

### Step 2: Remove Hook Usage
```diff
  const { user, loading, signOut, isAdmin } = useAuth();
- const { currentAccount } = useAccountContext();
```

### Step 3: Remove Handler Function
```diff
- // Handle account change
- const handleAccountChange = (account: Account | null) => {
-   console.log('Account changed:', account?.name || 'none');
- };
```

### Step 4: Simplify Header Left Section
```diff
  {/* Left side - Title and user info */}
- <div className="flex items-center space-x-4">
-   <div>
-     <h1 className="text-xl font-bold text-gray-900">FAQBNB</h1>
-     <div className="flex items-center space-x-2 mt-1">
-       <span
-         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
-           isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
-         }`}
-       >
-         {isAdmin ? 'Admin' : 'User'}
-       </span>
-       <span className="text-sm text-gray-600">{user?.email}</span>
-     </div>
-   </div>
- </div>
+ <div className="flex items-center">
+   <h1 className="text-xl font-bold text-gray-900">FAQBNB</h1>
+ </div>
```

### Step 5: Remove Account Selector from Header Right Section
```diff
  {/* Right side - Account selector and logout */}
- <div className="flex items-center space-x-3">
-   <CompactAccountSelector onAccountChange={handleAccountChange} className="w-64" />
-   <button
+ <div className="flex items-center">
+   <button
```

---

## 8. Acceptance Criteria (from REQ-119)

- [x] All account-related references are identified and catalogued from the layout component
- [ ] Account-related UI elements are removed from the visual interface
- [ ] Account-related navigation items are removed from menus and navigation structures
- [ ] Layout renders successfully without account references on all supported viewport sizes
- [ ] No console errors or warnings appear related to removed account functionality
- [ ] Visual regression testing confirms layout appearance matches PRD specifications

---

## 9. Dependencies

### 9.1 Pre-requisites
- None - this is the first task in Phase 1

### 9.2 Blocking For
- Task 1.2: Remove Account References from Dashboard Page (depends on patterns established here)
- Task 1.3: Apply Airbnb Design System Colors

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking layout structure | Low | Medium | Careful removal with visual testing |
| Missing cleanup of unused variables | Low | Low | TypeScript compiler will warn |
| Affecting other dashboard routes | Low | High | Only modifying layout.tsx, not child pages |

---

## References

- [PRD: Dashboard 2 - Simple Dashboard](/docs/prd/PRD_Dashboard_2_Simple_Dashboard.md)
- [Implementation Plan (REVISED)](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md)
- [Request #119 in gen_requests.md](/docs/gen_requests.md)
