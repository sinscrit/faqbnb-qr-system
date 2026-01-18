# REQ-121: Apply Airbnb Design System Colors Overview

**Generated:** 2026-01-06 17:30:00 UTC
**Last Modified:** 2026-01-06 17:30:00 UTC
**Request Reference:** docs/gen_requests.md - REQ-121
**PRD Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md
**Design System Reference:** docs/prd/airbnb_designsystem.md
**Phase:** 1 - Fix PRD Violations (Critical Path)
**Task ID:** 1.3

---

## 1. Executive Summary

This document provides a technical implementation breakdown for applying Airbnb Design System colors throughout the Dashboard 2 interface. The current implementation uses generic blue color schemes (`text-blue-600`, `bg-blue-100`, `border-blue-500`) which violate the PRD requirements for Airbnb brand alignment. This task focuses specifically on replacing blue color references with Airbnb Design System tokens.

---

## 2. Current State Analysis

### 2.1 PRD Violations Identified

| File | Lines | Current (Wrong) | Required (Airbnb DLS) |
|------|-------|-----------------|----------------------|
| `/src/app/dashboard2/layout.tsx` | 33 | `text-blue-600` (loader) | `text-[#FF385C]` (Radical Red) |
| `/src/app/dashboard2/layout.tsx` | 70 | `bg-blue-600` (login button) | `bg-[#FF385C]` |
| `/src/app/dashboard2/layout.tsx` | 120 | `border-blue-500 text-blue-600` (active nav) | `border-[#FF385C] text-[#FF385C]` |
| `/src/app/dashboard2/page.tsx` | 26 | `from-blue-600 to-blue-700` (gradient) | `from-[#E61E4D] via-[#E31C5F] to-[#D70466]` |
| `/src/app/dashboard2/page.tsx` | 36 | `hover:border-blue-500` (card hover) | `hover:border-[#FF385C]` |
| `/src/app/dashboard2/page.tsx` | 39-40 | `bg-blue-100`, `text-blue-600` (icon) | `bg-[#FFEEEF]`, `text-[#FF385C]` |
| `/src/app/dashboard2/page.tsx` | 42 | `group-hover:text-blue-500` | `group-hover:text-[#FF385C]` |
| `/src/app/dashboard2/page.tsx` | 48 | `text-blue-600` (accent text) | `text-[#FF385C]` |
| `/src/app/dashboard2/page.tsx` | 82-116 | `bg-blue-100` (feature highlights) | `bg-gray-100` or remove section |

### 2.2 Existing Correct Implementations (Reference Patterns)

The `ItemCreationWorkflow` component already correctly implements Airbnb Design System colors:

```typescript
// From src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx
text-[#222222]    // Primary text (Mine Shaft)
text-[#717171]    // Secondary text (Foggy variant)
bg-[#FF385C]      // Primary CTA (Radical Red)
hover:bg-[#E31C5F] // Hover state
focus:ring-[#FF385C] // Focus ring
```

---

## 3. Airbnb Design System Color Reference

### 3.1 Required Color Tokens

| Token | Hex Code | Tailwind Class | Usage |
|-------|----------|----------------|-------|
| **Radical Red** | `#FF385C` | `text-[#FF385C]`, `bg-[#FF385C]` | Primary CTA, brand accent |
| **Mine Shaft** | `#222222` | `text-[#222222]` | Primary text, headings |
| **Hof** | `#484848` | `text-[#484848]` | Alternative primary text |
| **Secondary Text** | `#717171` | `text-[#717171]` | Secondary text, captions |
| **Foggy** | `#767676` | `text-[#767676]` | Alternative secondary text |
| **Border** | `#DDDDDD` | `border-[#DDDDDD]` | Standard borders |
| **Background** | `#FFFFFF` | `bg-white` | Page backgrounds |
| **Babu (Success)** | `#00A699` | `text-[#00A699]`, `bg-[#00A699]` | Success states |
| **Rausch (Error)** | `#FF5A5F` | `text-[#FF5A5F]`, `bg-[#FF5A5F]` | Error states |
| **Arches (Warning)** | `#FC642D` | `text-[#FC642D]`, `bg-[#FC642D]` | Warning states |

### 3.2 Gradient Patterns

```css
/* Airbnb Primary Gradient (for CTAs) */
background: linear-gradient(to right, #E61E4D, #E31C5F, #D70466);

/* Tailwind equivalent */
className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466]"
```

### 3.3 Light/Tint Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Radical Red Light | `#FFEEEF` | Light background for red icons |
| Gray 50 | `#F7F7F7` | Subtle background tint |
| Gray 100 | `#EBEBEB` | Borders, dividers |

---

## 4. Implementation Tasks

### Task 1.3.1: Update Dashboard2 Layout Loading State

**File:** `/src/app/dashboard2/layout.tsx`

**Location:** Lines 29-37 (loading state)

**Change Required:**
```diff
- <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
+ <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
```

---

### Task 1.3.2: Update Dashboard2 Layout Login Button

**File:** `/src/app/dashboard2/layout.tsx`

**Location:** Lines 68-73 (login button in unauthenticated state)

**Change Required:**
```diff
- className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
+ className="inline-flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
```

---

### Task 1.3.3: Update Dashboard2 Layout Navigation Active State

**File:** `/src/app/dashboard2/layout.tsx`

**Location:** Lines 118-122 (active navigation tab)

**Change Required:**
```diff
className={`inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors ${
  isActive
-   ? 'border-blue-500 text-blue-600'
+   ? 'border-[#FF385C] text-[#FF385C]'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
}`}
```

---

### Task 1.3.4: Update Dashboard2 Page Welcome Gradient

**File:** `/src/app/dashboard2/page.tsx`

**Location:** Line 26 (welcome section gradient)

**Change Required:**
```diff
- <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
+ <div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-2xl p-8 text-white">
```

---

### Task 1.3.5: Update Dashboard2 Page Create Card Styles

**File:** `/src/app/dashboard2/page.tsx`

**Location:** Lines 34-52 (Create New Item card)

**Changes Required:**
```diff
<button
  onClick={() => router.push('/dashboard2/create')}
- className="group bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 p-8 text-left transition-all hover:shadow-lg"
+ className="group bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-[#FF385C] p-8 text-left transition-all hover:shadow-lg"
>
  <div className="flex items-start justify-between">
-   <div className="bg-blue-100 rounded-xl p-4 group-hover:bg-blue-500 transition-colors">
-     <PlusCircle className="w-8 h-8 text-blue-600 group-hover:text-white" />
+   <div className="bg-[#FFEEEF] rounded-xl p-4 group-hover:bg-[#FF385C] transition-colors">
+     <PlusCircle className="w-8 h-8 text-[#FF385C] group-hover:text-white" />
    </div>
-   <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-blue-500 transition-colors" />
+   <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-[#FF385C] transition-colors" />
  </div>
  ...
- <div className="flex items-center gap-2 mt-4 text-blue-600">
+ <div className="flex items-center gap-2 mt-4 text-[#FF385C]">
```

---

### Task 1.3.6: Update Dashboard2 Page Feature Highlights

**File:** `/src/app/dashboard2/page.tsx`

**Location:** Lines 77-118 (Feature Highlights section)

**Changes Required:**
```diff
- <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
+ <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
```

Note: This change applies to all 4 feature highlight number circles (lines 82, 91, 100, 109).

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files (MODIFY)

| File Path | Lines | Functions/Sections | Scope |
|-----------|-------|-------------------|-------|
| `/src/app/dashboard2/layout.tsx` | 33 | Loading state spinner | Color class only |
| `/src/app/dashboard2/layout.tsx` | 70 | Login button | Color class only |
| `/src/app/dashboard2/layout.tsx` | 118-122 | `navigationItems.map()` render | Active state classes |
| `/src/app/dashboard2/page.tsx` | 26 | Welcome section div | Gradient classes |
| `/src/app/dashboard2/page.tsx` | 36-52 | Create New Item button | Hover and icon colors |
| `/src/app/dashboard2/page.tsx` | 82, 91, 100, 109 | Feature highlight circles | Background colors |

### 5.2 Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `/src/app/dashboard2/create/page.tsx` | Already complete per PRD |
| `/src/app/dashboard2/items/page.tsx` | Already complete per PRD |
| `/src/components/ItemCreationWorkflow/**` | Already uses correct Airbnb colors |
| `/src/components/QRCodePrintManager.tsx` | Out of scope for this task |
| `/src/components/PropertyForm.tsx` | Separate task for component-level color updates |

---

## 6. Implementation Checklist

### Pre-Implementation
- [ ] Read current layout.tsx file
- [ ] Read current page.tsx file
- [ ] Verify Airbnb color token values from design system doc

### Layout.tsx Changes
- [ ] Update loading spinner color (line 33)
- [ ] Update login button background and hover (line 70)
- [ ] Update active navigation border and text colors (lines 118-122)

### Page.tsx Changes
- [ ] Update welcome gradient (line 26)
- [ ] Update Create card hover border (line 36)
- [ ] Update Create card icon background (line 39)
- [ ] Update Create card icon color (line 40)
- [ ] Update Create card arrow hover color (line 42)
- [ ] Update Create card accent text color (line 48)
- [ ] Update all 4 feature highlight circle backgrounds (lines 82, 91, 100, 109)

### Post-Implementation
- [ ] Visual verification in browser
- [ ] Check loading state appearance
- [ ] Verify navigation active state
- [ ] Confirm gradient renders correctly
- [ ] Test hover states on cards

---

## 7. Acceptance Criteria

Based on PRD Phase 1.3:

- [ ] All `blue-*` Tailwind classes in `/src/app/dashboard2/layout.tsx` are replaced with Airbnb color tokens
- [ ] All `blue-*` Tailwind classes in `/src/app/dashboard2/page.tsx` are replaced with Airbnb color tokens
- [ ] Primary CTA color uses Radical Red (`#FF385C`)
- [ ] Gradient backgrounds use Airbnb gradient (`#E61E4D` -> `#E31C5F` -> `#D70466`)
- [ ] Active navigation state uses Radical Red (`#FF385C`)
- [ ] Loading spinner uses Radical Red (`#FF385C`)
- [ ] No console errors related to styling
- [ ] Visual appearance matches Airbnb design system

---

## 8. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Color format | Inline hex with `[#HEXVAL]` | No existing design token setup in Tailwind config; matches existing pattern in ItemCreationWorkflow |
| Gradient format | Tailwind gradient classes | Consistent with existing codebase patterns |
| Light red background | `#FFEEEF` | Derived from Radical Red at 10% opacity for icon backgrounds |
| Feature highlights | Change to gray-100 | Neutral color appropriate for informational (non-CTA) elements |

---

## 9. Testing Approach

### Visual Testing
1. Load `/dashboard2` in browser
2. Verify loading spinner appears in Radical Red during auth check
3. Verify welcome gradient displays Airbnb red-to-pink gradient
4. Verify "Create New Item" card:
   - Icon background is light red (#FFEEEF)
   - Icon color is Radical Red (#FF385C)
   - Hover state shows Radical Red border
   - Arrow turns Radical Red on hover
5. Verify navigation active state shows Radical Red underline and text
6. Verify feature highlight circles are gray (not blue)

### Responsive Testing
- Test at mobile breakpoint (< 744px)
- Test at tablet breakpoint (744px - 1127px)
- Test at desktop breakpoint (> 1128px)

---

## 10. Dependencies

### Required Before Implementation
- None (standalone color replacement task)

### Blocks After Implementation
- Phase 2: Statistics Cards (will use consistent Airbnb colors)
- Phase 3: Action Buttons (will use Airbnb CTA styling)

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Color contrast accessibility | Low | Medium | Verify 4.5:1 ratio for text; Airbnb colors are designed for AA compliance |
| Inconsistent hover states | Low | Low | Test all interactive elements after changes |
| Missing color references | Low | Low | Use grep to find any remaining `blue-` references |

---

## 12. References

- [PRD: Plan-001-Simple-Dashboard-Implementation-REVISED.md](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md) - Task 1.3
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md) - Color tokens
- [ItemCreationWorkflow](/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx) - Reference implementation
- [gen_requests.md](/docs/gen_requests.md) - REQ-121

---

## 13. Effort Estimate

| Task | Estimate |
|------|----------|
| Layout.tsx changes | 10 minutes |
| Page.tsx changes | 15 minutes |
| Visual verification | 10 minutes |
| **Total** | **35 minutes** |

This task is a straightforward find-and-replace operation with visual verification. Low complexity.
