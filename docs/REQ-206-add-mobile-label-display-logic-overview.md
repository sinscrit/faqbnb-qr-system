# REQ-206: Add Mobile Label Display Logic to Navigation Menu - Overview

**Document Created:** 2026-01-12 23:58:00 UTC
**Last Modified:** 2026-01-12 23:58:00 UTC
**Request Reference:** docs/gen_requests.md - REQ-206
**Implementation Plan:** docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase:** 4 - Update Navigation Menu (ITEM-04) - MEDIUM Priority
**Task ID:** 4.2

---

## Summary

Add CSS and rendering logic to the dashboard2 layout navigation to display abbreviated labels on mobile devices while showing full labels on desktop. This task implements the responsive label display functionality that consumes the `mobileLabel` property added by Task 4.1 (REQ-205).

The navigation should display:
- **Desktop (≥768px):** Full labels (Dashboard, Items, Instructions, Properties)
- **Mobile (<768px):** Abbreviated labels (D/B, Items, Instr., Prop.)

---

## Current Behavior

The dashboard2 layout (`src/app/dashboard2/layout.tsx`) navigation rendering at lines 120-140 currently displays only the full `item.name` for all viewport sizes:

```typescript
{navigationItems.map((item) => {
  const isActive = /* ... */;
  const Icon = item.icon;
  return (
    <button
      key={item.name}
      onClick={() => router.push(item.href)}
      /* ... */
    >
      <Icon className="w-4 h-4 mr-2" />
      {item.name}  {/* Shows full name on all devices */}
    </button>
  );
})}
```

**Issues:**
1. Navigation labels can overflow on narrow mobile screens
2. Does not utilize the `mobileLabel` property that will be added by REQ-205
3. Inconsistent with other parts of the app that use responsive labels

---

## Expected Behavior

Update the navigation rendering to show:
- Full label on desktop (`hidden md:inline`)
- Abbreviated label on mobile (`md:hidden`)

```typescript
{navigationItems.map((item) => {
  const isActive = /* ... */;
  const Icon = item.icon;
  return (
    <button
      key={item.name}
      onClick={() => router.push(item.href)}
      /* ... */
    >
      <Icon className="w-4 h-4 mr-2" />
      {/* Desktop: full label */}
      <span className="hidden md:inline">{item.name}</span>
      {/* Mobile: abbreviated label */}
      <span className="md:hidden">{item.mobileLabel || item.name}</span>
    </button>
  );
})}
```

Expected visual outcome:
| Viewport | Dashboard | Items | Instructions | Properties |
|----------|-----------|-------|--------------|------------|
| Desktop (≥768px) | Dashboard | Items | Instructions | Properties |
| Mobile (<768px) | D/B | Items | Instr. | Prop. |

---

## Technical Analysis

### Existing Pattern Reference

The codebase already has an established pattern for responsive labels:

**1. Dashboard Layout (src/app/dashboard/layout.tsx:245-248):**
```typescript
{/* Desktop: show full name, Mobile: show mobileName */}
<span className="hidden sm:inline">{item.name}</span>
<span className="sm:hidden">{item.mobileName || item.name}</span>
```

**2. Logout Button (src/app/dashboard2/layout.tsx:108-109):**
```typescript
<LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
<span className="hidden sm:inline">Logout</span>
```

**3. BulkActionsBar (src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx:100):**
```typescript
<Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
<span className="hidden sm:inline">{label}</span>
```

### Breakpoint Selection

The implementation plan specifies using `md:` (768px) breakpoint rather than `sm:` (640px):
- `md:hidden` - Hide on screens ≥768px (show on mobile only)
- `hidden md:inline` - Hide by default, show inline on screens ≥768px

This is consistent with the navigation having 4 items that need more space on mobile.

### Required Changes

The changes are minimal - only the rendering logic inside the navigation map function:

**File:** `src/app/dashboard2/layout.tsx`
**Location:** Lines 136-137 (within navigation button)

**Current:**
```typescript
<Icon className="w-4 h-4 mr-2" />
{item.name}
```

**Target:**
```typescript
<Icon className="w-4 h-4 mr-2" />
{/* Desktop: full label, Mobile: abbreviated label */}
<span className="hidden md:inline">{item.name}</span>
<span className="md:hidden">{item.mobileLabel || item.name}</span>
```

---

## Dependencies

### Depends On (upstream)

- **Task 4.1 (REQ-205): Update Navigation Items Configuration** - This task must complete first to add the `mobileLabel` property to each navigation item. Without the `mobileLabel` values, the mobile display will fall back to full names via the `|| item.name` fallback.

### Blocks (downstream)

- **None** - This task completes the mobile label feature. No subsequent tasks depend on it.

### Parallel Safety

- **Files touched:**
  - `src/app/dashboard2/layout.tsx` - Navigation rendering section (lines 136-137)

- **Conflicts with:**
  - **Task 4.1 (REQ-205)** - Modifies the same file but different sections:
    - Task 4.1: navigationItems configuration (lines 28-32)
    - Task 4.2: Navigation rendering (lines 136-137)
  - **Recommendation:** Execute sequentially (4.1 then 4.2) to avoid merge conflicts

- **Safe to parallelize with:**
  - Phase 1 (ITEM-05): Workflow step count fix - modifies `constants.ts`, `WorkflowHeader.tsx`, `useWorkflowState.ts`
  - Phase 2 (ITEM-03): What's Next screen - modifies `NextActionStep.tsx`
  - Phase 3 (ITEM-01): Dashboard cards clickable - modifies `StatisticsCards.tsx`
  - Phase 5 (ITEM-02): Data model separation - modifies type definitions
  - Task 4.3: Create Instructions page - creates new file `src/app/dashboard2/instructions/page.tsx`

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Line Range | Functions/Elements | Modification Type |
|------|------------|-------------------|-------------------|
| `src/app/dashboard2/layout.tsx` | 136-137 | Navigation button content | Replace `{item.name}` with responsive spans |

### Detailed Change Specification

**File:** `src/app/dashboard2/layout.tsx`

**Current code (lines 125-139):**
```typescript
return (
  <button
    key={item.name}
    onClick={() => router.push(item.href)}
    aria-current={isActive ? 'page' : undefined}
    className={`inline-flex items-center px-3 sm:px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2 ${
      isActive
        ? 'border-[#FF385C] text-[#FF385C]'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    <Icon className="w-4 h-4 mr-2" />
    {item.name}
  </button>
);
```

**Target code (lines 125-141):**
```typescript
return (
  <button
    key={item.name}
    onClick={() => router.push(item.href)}
    aria-current={isActive ? 'page' : undefined}
    className={`inline-flex items-center px-3 sm:px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2 ${
      isActive
        ? 'border-[#FF385C] text-[#FF385C]'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    <Icon className="w-4 h-4 mr-2" />
    {/* REQ-206: Desktop shows full label, Mobile shows abbreviated */}
    <span className="hidden md:inline">{item.name}</span>
    <span className="md:hidden">{item.mobileLabel || item.name}</span>
  </button>
);
```

---

## Implementation Tasks

### Task 1: Update Navigation Button Rendering

**File:** `src/app/dashboard2/layout.tsx`
**Location:** Lines 136-137 (inside navigation button within map)

**Steps:**
1. Replace `{item.name}` with two span elements
2. First span: `className="hidden md:inline"` showing `{item.name}`
3. Second span: `className="md:hidden"` showing `{item.mobileLabel || item.name}`
4. Add comment documenting the responsive behavior

### Task 2: Verify TypeScript Type Safety

Ensure the `mobileLabel` property access doesn't cause TypeScript errors. If REQ-205 (Task 4.1) adds the NavItem interface with optional `mobileLabel`, no additional type work is needed here. The `|| item.name` fallback handles the optional case gracefully.

---

## Acceptance Criteria

Based on ITEM-04 requirements from the implementation plan:

- [ ] Navigation displays abbreviated labels on mobile viewports (<768px)
- [ ] Navigation displays full labels on desktop viewports (≥768px)
- [ ] Mobile labels match specification: D/B, Items, Instr., Prop.
- [ ] Fallback works correctly if `mobileLabel` is undefined
- [ ] No visual regression in navigation styling
- [ ] Active state highlighting continues to work correctly
- [ ] Icons remain visible and properly spaced on all viewports

---

## Testing Plan

### Manual Testing

1. **Desktop viewport testing (≥768px):**
   - Navigate to `/dashboard2`
   - Verify all 4 navigation items show full labels: Dashboard, Items, Instructions, Properties
   - Verify icons are visible and properly spaced

2. **Mobile viewport testing (<768px):**
   - Resize browser window or use DevTools device mode
   - Verify navigation items show abbreviated labels: D/B, Items, Instr., Prop.
   - Verify navigation items don't overflow or wrap unexpectedly
   - Verify icons remain visible

3. **Breakpoint transition testing:**
   - Slowly resize browser across the 768px breakpoint
   - Verify smooth transition between label versions
   - No layout shift or flicker during transition

4. **Fallback testing:**
   - If a `mobileLabel` is missing, verify full `name` is shown on mobile
   - Test by temporarily removing a mobileLabel value

5. **Active state testing:**
   - Navigate to each section
   - Verify active state highlighting works with responsive labels

### Automated Testing Suggestions

Consider adding tests in `src/app/dashboard2/__tests__/layout.test.tsx`:

```typescript
describe('Dashboard2 Layout Navigation', () => {
  it('renders responsive labels correctly', () => {
    // Desktop: shows full names
    // Mobile: shows mobileLabel values
  });

  it('falls back to name when mobileLabel is undefined', () => {
    // Verify fallback behavior
  });
});
```

---

## Complexity Assessment

**Size:** XS (Extra Small)
**Estimated Effort:** 15-30 minutes
**Confidence:** Very High

This is a minimal change:
- Single file modification
- 2-3 lines of code change
- Uses established Tailwind CSS patterns
- No logic changes, only presentation
- Built-in fallback for safety

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Task 4.1 (REQ-205) not complete | Medium | High | Execute sequentially; fallback uses full name |
| TypeScript error on mobileLabel | Low | Low | Use optional chaining or ensure interface is defined |
| Layout shift on breakpoint | Very Low | Low | Use consistent padding; test transition |
| Accessibility regression | Very Low | Medium | Labels remain readable; icon provides visual cue |

---

## Alternative Approaches Considered

### 1. CSS text-overflow with truncation
**Rejected:** Would cut off labels unpredictably; less user-friendly than explicit abbreviations.

### 2. Icon-only on mobile
**Rejected:** PRD specifically requires abbreviated text labels, not icon-only navigation.

### 3. Use `sm:` breakpoint instead of `md:`
**Rejected:** With 4 navigation items, the `md:` (768px) breakpoint provides better spacing. The implementation plan explicitly specifies `md:` classes.

### 4. JavaScript-based viewport detection
**Rejected:** CSS-only solution is simpler, more performant, and follows existing patterns in the codebase.

---

## References

- **Source Request:** `docs/gen_requests.md` - REQ-206
- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md` (Phase 4, Task 4.2, lines 515-529)
- **Upstream Dependency:** `docs/REQ-205-update-navigationitems-in-layout-overview.md` (Task 4.1)
- **Target File:** `src/app/dashboard2/layout.tsx`
- **Pattern Reference:** `src/app/dashboard/layout.tsx` (lines 245-248) - Existing mobileName pattern
- **Pattern Reference:** `src/app/dashboard2/layout.tsx` (lines 108-109) - Logout button responsive pattern
