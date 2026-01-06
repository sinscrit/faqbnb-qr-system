# REQ-120: Remove Account References from Dashboard Page - Implementation Breakdown

**Document Created:** 2026-01-06 16:45 UTC
**Last Modified:** 2026-01-06 16:45 UTC
**Request Reference:** gen_requests.md - Request #120
**Implementation Plan Reference:** Plan-001-Simple-Dashboard-Implementation-REVISED.md
**Phase:** 1 - Fix PRD Violations (Critical Path)
**Task ID:** 1.2

---

## Executive Summary

This task removes account-related references from the dashboard page (`/src/app/dashboard2/page.tsx`) to comply with PRD Design Principle #1: "No account references." The dashboard currently displays account-related data in the welcome section that violates product specifications and must be removed.

---

## Current State Assessment

### File Under Modification

**File:** `/src/app/dashboard2/page.tsx`

### Current PRD Violations

| Line(s) | Issue | PRD Violation |
|---------|-------|---------------|
| 14, 20 | `useAccountContext` import and hook usage | Design Principle #1: "No account references" |
| 30-33 | Account name conditional in welcome message | Design Principle #1: "No account references" |

### Current Code Analysis

```typescript
// Line 14: Import statement with account context
import { useAuth, useAccountContext } from '@/contexts/AuthContext';

// Line 20: Hook usage
const { currentAccount } = useAccountContext();

// Lines 30-33: Account name in welcome section
<p className="text-blue-100 text-lg">
  {currentAccount
    ? `Managing items for ${currentAccount.name}`
    : 'Create and manage your QR code items'}
</p>
```

---

## Technical Context

### Technology Stack (Verified)

| Technology | Details |
|------------|---------|
| Framework | Next.js 15.5.9 (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 4 |
| State Management | React Context (AuthContext) |
| Component Type | Client-side component (`'use client'`) |

### Dependencies Being Modified

| Import | Current Usage | Action |
|--------|---------------|--------|
| `useAccountContext` from `@/contexts/AuthContext` | Used to get `currentAccount` | Remove import and hook call |

### Dependencies Being Kept

| Import | Usage | Notes |
|--------|-------|-------|
| `useAuth` from `@/contexts/AuthContext` | Get `user` object for firstName | Keep - used for user greeting |
| `useRouter` from `next/navigation` | Navigation to create/items pages | Keep |
| Lucide icons | UI icons | Keep |

---

## Implementation Tasks

### Task 1.2.1: Remove Account Context Import

**Priority:** P0 - Critical
**Complexity:** Low
**Estimated Effort:** 5 minutes

**Current Code (Line 14):**
```typescript
import { useAuth, useAccountContext } from '@/contexts/AuthContext';
```

**Required Change:**
```typescript
import { useAuth } from '@/contexts/AuthContext';
```

**Rationale:** The `useAccountContext` hook is only used to display account information in the welcome message, which violates PRD requirements.

---

### Task 1.2.2: Remove Account Context Hook Usage

**Priority:** P0 - Critical
**Complexity:** Low
**Estimated Effort:** 5 minutes

**Current Code (Line 20):**
```typescript
const { currentAccount } = useAccountContext();
```

**Required Change:**
Delete this line entirely.

**Rationale:** With the account reference removed from the UI, the hook is no longer needed.

---

### Task 1.2.3: Update Welcome Message to PRD-Compliant Text

**Priority:** P0 - Critical
**Complexity:** Low
**Estimated Effort:** 5 minutes

**Current Code (Lines 29-33):**
```typescript
<p className="text-blue-100 text-lg">
  {currentAccount
    ? `Managing items for ${currentAccount.name}`
    : 'Create and manage your QR code items'}
</p>
```

**Required Change:**
```typescript
<p className="text-[#717171] text-lg">Create and manage your QR code items</p>
```

**Rationale:**
1. Remove the conditional that references `currentAccount.name`
2. Use the static PRD-compliant message
3. Update color from `text-blue-100` to Airbnb Design System secondary text color `text-[#717171]` (Note: This color change aligns with Task 1.3 - Apply Airbnb Design System Colors)

---

## Ordered Implementation Steps

| Step | Task | File | Action | Dependencies |
|------|------|------|--------|--------------|
| 1 | 1.2.1 | `/src/app/dashboard2/page.tsx` | Remove `useAccountContext` from import | None |
| 2 | 1.2.2 | `/src/app/dashboard2/page.tsx` | Delete `const { currentAccount } = useAccountContext();` | Step 1 |
| 3 | 1.2.3 | `/src/app/dashboard2/page.tsx` | Replace welcome message with static text | Step 2 |

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Scope | Authorization Level |
|-----------|-------|---------------------|
| `/src/app/dashboard2/page.tsx` | Lines 14, 20, 29-33 | Full modification authorized |

### Functions/Components Authorized for Modification

| Component/Function | File | Scope |
|--------------------|------|-------|
| `Dashboard2Page` | `/src/app/dashboard2/page.tsx` | Import statements, hook calls, JSX rendering |

### Files NOT to be Modified

| File Path | Reason |
|-----------|--------|
| `/src/contexts/AuthContext.tsx` | Contains `useAccountContext` hook - used elsewhere, do not modify |
| `/src/app/dashboard2/layout.tsx` | Covered by separate task (Task 1.1) |
| `/src/app/dashboard2/create/page.tsx` | Already PRD-compliant, no changes needed |
| `/src/app/dashboard2/items/page.tsx` | Already PRD-compliant, no changes needed |

---

## Acceptance Criteria

### Functional Requirements

- [ ] No import of `useAccountContext` in dashboard page
- [ ] No usage of `currentAccount` variable anywhere in the component
- [ ] Welcome message displays static text: "Create and manage your QR code items"
- [ ] Welcome message never displays account name under any conditions

### Visual Requirements

- [ ] Welcome subtitle text uses Airbnb secondary text color (`text-[#717171]`)
- [ ] No visual reference to account names or account-related information

### Technical Requirements

- [ ] Component renders without errors
- [ ] No console warnings about unused imports
- [ ] TypeScript compilation succeeds without errors
- [ ] Page loads correctly at `/dashboard2` route

### Regression Prevention

- [ ] "Welcome back, {firstName}!" greeting still displays correctly
- [ ] Navigation to `/dashboard2/create` still works from Create New Item card
- [ ] Navigation to `/dashboard2/items` still works from View Items card
- [ ] Feature Highlights section still displays correctly
- [ ] User authentication flow still functions correctly

---

## Testing Checklist

### Manual Testing

1. **Page Load Test**
   - Navigate to `/dashboard2`
   - Verify page loads without errors
   - Verify welcome message shows static text

2. **Account Reference Test**
   - Login with user that has accounts
   - Verify no account name appears anywhere on dashboard
   - Check browser console for any account-related logs

3. **Navigation Test**
   - Click "Create New Item" → should navigate to `/dashboard2/create`
   - Click "View Items" → should navigate to `/dashboard2/items`

4. **Visual Regression Test**
   - Verify welcome section layout matches design
   - Verify text colors match Airbnb Design System

### Automated Testing (if applicable)

- Run existing test suite to ensure no regressions
- Verify TypeScript compilation: `npm run build`

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking authentication flow | Low | High | Only modifying display logic, not auth logic |
| Regression in other dashboard features | Low | Medium | Keep all other code unchanged |
| Missing account context used elsewhere in file | Low | Medium | Code review confirmed only usage is in welcome message |

---

## Dependencies

### Upstream Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 1.1: Remove Account References from Layout | Parallel | Can be done independently |

### Downstream Dependencies

| Dependent Task | Impact |
|----------------|--------|
| Task 1.3: Apply Airbnb Design System Colors | Will further modify this file; coordinate text color changes |

---

## Related Files Reference

### Files That May Be Affected by Similar Changes

These files also use `useAccountContext` and may need review for PRD compliance in other tasks:

| File | Usage | Task Reference |
|------|-------|----------------|
| `/src/app/dashboard2/layout.tsx` | Account selector in header | Task 1.1 (separate) |
| `/src/components/DashboardLayout.tsx` | Original dashboard | Not in scope |

---

## Implementation Notes

### Code Style Guidelines

- Follow existing file formatting (Prettier configuration)
- Maintain JSDoc comments at top of file
- Keep consistent import ordering

### Commit Message Template

```
[REQ-120] Remove account references from dashboard page

- Remove useAccountContext import
- Remove currentAccount hook usage
- Update welcome message to static PRD-compliant text
- Apply Airbnb secondary text color to subtitle

Closes #120
```

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-06 16:45 UTC | Technical Lead | Initial document creation |
