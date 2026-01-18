# REQ-131: Create Property Edit Modal - Implementation Overview

**Document Created:** 2026-01-06 16:30:00 UTC
**Last Modified:** 2026-01-06 16:30:00 UTC
**Request Reference:** REQ-131 in docs/gen_requests.md
**Implementation Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 4, Task 4.2)
**Status:** Ready for Implementation

---

## 1. Executive Summary

This document provides a detailed implementation breakdown for creating the PropertyEditModal component for Dashboard 2. The modal allows users to edit existing property information through a Radix UI Dialog interface with form validation, save/cancel actions, and success feedback via toast notifications.

### Key Deliverables
1. **PropertyEditModal Component** - Modal dialog wrapping property edit form
2. **Form Fields** - Property Name (required), Address fields (optional), Country dropdown
3. **Validation** - Client-side field validation with error messages
4. **User Feedback** - Success toast on save, modal dismiss on cancel
5. **Integration** - Wire up to PropertySection and Dashboard2 page

---

## 2. Current State Analysis

### 2.1 Existing Infrastructure

| Component | Location | Status | Relevance |
|-----------|----------|--------|-----------|
| `PropertySection` | `/src/components/SimpleDashboard/PropertySection.tsx` | **COMPLETE** | Consumer of edit modal, has `onPropertyEdit` callback ready |
| `PropertyForm` | `/src/components/PropertyForm.tsx` | **EXISTS** | Existing form with different field structure; NOT directly reusable (uses nickname/address/propertyTypeId) |
| `ItemPreviewModal` | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | **PATTERN** | Reference pattern for Radix UI Dialog modal implementation |
| Dashboard2 Page | `/src/app/dashboard2/page.tsx` | **COMPLETE** | Already has TODO placeholder for `onPropertyEdit` callback |
| SimpleDashboard Index | `/src/components/SimpleDashboard/index.ts` | **COMPLETE** | Export hub - will need to export PropertyEditModal |

### 2.2 PRD Field Requirements vs Existing PropertyForm

The existing `PropertyForm.tsx` uses different fields than the PRD specifies:

| PRD Requirement | Existing PropertyForm | Gap |
|-----------------|----------------------|-----|
| Property Name (required, 100 chars) | `nickname` (required, 100 chars) | Field name mapping needed |
| Address Line 1 (optional, 200 chars) | `address` (single field, 500 chars) | Need separate line fields |
| Address Line 2 (optional, 200 chars) | N/A | New field |
| City (optional, 100 chars) | N/A | New field |
| State/Province (optional, 100 chars) | N/A | New field |
| Postal Code (optional, 20 chars) | N/A | New field |
| Country (optional, dropdown) | N/A | New field |
| Property Type (dropdown) | `propertyTypeId` (required) | Not in PRD - omit |

**Decision:** Create a new modal-specific form that matches PRD fields exactly, rather than adapting the existing PropertyForm.

### 2.3 API Considerations

**Current API:** `/src/app/api/user/properties/[propertyId]/route.ts`
- Only has GET method implemented
- PUT method not implemented for user properties

**Admin API:** `/src/app/api/admin/properties/[propertyId]/route.ts`
- Has PUT method but requires admin auth and different field structure

**Action Required:** Need to either:
1. Add PUT endpoint to user properties API, OR
2. Create a new dashboard-specific endpoint

**Recommendation:** Add PUT method to existing `/api/user/properties/[propertyId]/route.ts` to keep API consistent.

---

## 3. Technical Specifications

### 3.1 Component Interface

```typescript
// src/components/SimpleDashboard/PropertyEditModal.tsx

export interface PropertyEditModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Property being edited (null when closed) */
  property: Property | null;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when property is saved successfully */
  onSave: (updatedProperty: Property) => void;
  /** Optional additional CSS classes */
  className?: string;
}

export interface PropertyEditFormData {
  /** Property name (required) */
  name: string;
  /** Address line 1 */
  addressLine1: string;
  /** Address line 2 */
  addressLine2: string;
  /** City */
  city: string;
  /** State or Province */
  state: string;
  /** Postal code */
  postalCode: string;
  /** Country code */
  country: string;
}

export interface PropertyEditValidationErrors {
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  general?: string;
}
```

### 3.2 Form Field Specifications

| Field | Label | Required | Max Length | Type | Validation |
|-------|-------|----------|------------|------|------------|
| `name` | Property Name | Yes | 100 | text | Non-empty after trim |
| `addressLine1` | Address Line 1 | No | 200 | text | Length check only |
| `addressLine2` | Address Line 2 | No | 200 | text | Length check only |
| `city` | City | No | 100 | text | Length check only |
| `state` | State/Province | No | 100 | text | Length check only |
| `postalCode` | Postal Code | No | 20 | text | Length check only |
| `country` | Country | No | - | select | Valid country code |

### 3.3 Country Dropdown Options

Use ISO 3166-1 alpha-2 codes with common countries prioritized:
```typescript
const COUNTRIES = [
  { code: '', label: 'Select country...' },
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'JP', label: 'Japan' },
  { code: 'MX', label: 'Mexico' },
  // ... additional countries
];
```

### 3.4 Airbnb Design System Application

| Element | Tailwind Classes |
|---------|-----------------|
| Modal Overlay | `bg-black/50` |
| Modal Container | `bg-white rounded-xl shadow-lg` |
| Modal Title | `text-xl font-semibold text-[#222222]` |
| Form Labels | `text-sm font-medium text-[#222222]` |
| Required Indicator | `text-[#FF385C]` (using Radical Red) |
| Input Fields | `border-[#DDDDDD] rounded-lg focus:border-[#222222] focus:ring-[#222222]` |
| Error Text | `text-sm text-[#FF385C]` |
| Save Button | `bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white rounded-lg` |
| Cancel Button | `bg-white border border-[#222222] text-[#222222] rounded-lg` |
| Close Button (X) | `text-[#717171] hover:text-[#222222]` |

### 3.5 Toast Notification

Since no toast library is currently installed, implement a simple inline success message pattern OR install a lightweight toast solution:

**Option A: Inline Success State**
```typescript
// After successful save, close modal and rely on parent to show feedback
onSave(updatedProperty);
onClose();
```

**Option B: Add Toast Library (Recommended)**
- Install `sonner` or `react-hot-toast`
- Add `<Toaster />` to root layout
- Use `toast.success('Property updated successfully')` on save

**Recommendation:** Use Option A for MVP, add toast in Phase 6 (Polish).

---

## 4. Ordered Implementation Tasks

### Task 4.2.1: Create PropertyEditModal Component Shell
**Priority:** P0 (Blocking)
**Estimated Effort:** 30 minutes

1. Create file `/src/components/SimpleDashboard/PropertyEditModal.tsx`
2. Import Radix UI Dialog (`import * as Dialog from '@radix-ui/react-dialog'`)
3. Define TypeScript interfaces (`PropertyEditModalProps`, `PropertyEditFormData`, `PropertyEditValidationErrors`)
4. Create modal structure with header, body, and footer sections
5. Implement open/close state handling with proper focus management

**Files to Create:**
- `/src/components/SimpleDashboard/PropertyEditModal.tsx`

### Task 4.2.2: Implement Form Fields with Validation
**Priority:** P0 (Blocking)
**Estimated Effort:** 45 minutes

1. Add form state with `useState` for `formData` and `errors`
2. Create pre-population logic from `property` prop
3. Implement each form field:
   - Property Name (required) with max length indicator
   - Address Line 1 (optional)
   - Address Line 2 (optional)
   - City (optional)
   - State/Province (optional)
   - Postal Code (optional)
   - Country dropdown (optional)
4. Implement `validateForm()` function with field-level validation
5. Add inline error messages adjacent to each field

**Validation Rules:**
```typescript
function validateForm(data: PropertyEditFormData): PropertyEditValidationErrors {
  const errors: PropertyEditValidationErrors = {};

  // Property Name - required, max 100
  if (!data.name.trim()) {
    errors.name = 'Property name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Property name must be 100 characters or less';
  }

  // Address Line 1 - max 200
  if (data.addressLine1.length > 200) {
    errors.addressLine1 = 'Address must be 200 characters or less';
  }

  // Address Line 2 - max 200
  if (data.addressLine2.length > 200) {
    errors.addressLine2 = 'Address must be 200 characters or less';
  }

  // City - max 100
  if (data.city.length > 100) {
    errors.city = 'City must be 100 characters or less';
  }

  // State - max 100
  if (data.state.length > 100) {
    errors.state = 'State/Province must be 100 characters or less';
  }

  // Postal Code - max 20
  if (data.postalCode.length > 20) {
    errors.postalCode = 'Postal code must be 20 characters or less';
  }

  return errors;
}
```

### Task 4.2.3: Implement Save Handler with API Call
**Priority:** P0 (Blocking)
**Estimated Effort:** 30 minutes

1. Create `handleSave` function that:
   - Runs validation
   - Shows loading state on Save button
   - Calls API endpoint
   - Handles success (call `onSave`, close modal)
   - Handles error (display error message)
2. Disable form during submission
3. Handle Enter key to submit form

**API Call Pattern:**
```typescript
const handleSave = async () => {
  const validationErrors = validateForm(formData);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsSubmitting(true);
  setErrors({});

  try {
    const response = await fetch(`/api/user/properties/${property?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update property');
    }

    const { data: updatedProperty } = await response.json();
    onSave(updatedProperty);
    onClose();
  } catch (error) {
    setErrors({
      general: error instanceof Error ? error.message : 'Failed to update property'
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

### Task 4.2.4: Implement Cancel/Dismiss Handlers
**Priority:** P0 (Blocking)
**Estimated Effort:** 15 minutes

1. Cancel button closes modal without saving
2. Clicking overlay (outside modal) closes modal
3. Pressing Escape key closes modal
4. Reset form state when modal closes
5. Prevent accidental close during form submission

### Task 4.2.5: Add API PUT Endpoint for User Properties
**Priority:** P0 (Blocking)
**Estimated Effort:** 30 minutes

1. Add PUT method to `/src/app/api/user/properties/[propertyId]/route.ts`
2. Validate user authentication
3. Validate user owns the property
4. Validate request body
5. Update property in database
6. Return updated property

**Note:** This needs to handle the new address field structure. Consider database schema implications.

### Task 4.2.6: Update SimpleDashboard Index Export
**Priority:** P0 (Blocking)
**Estimated Effort:** 5 minutes

1. Add export for `PropertyEditModal` in `/src/components/SimpleDashboard/index.ts`
2. Add type export for `PropertyEditModalProps`

### Task 4.2.7: Integrate Modal into Dashboard2 Page
**Priority:** P0 (Blocking)
**Estimated Effort:** 20 minutes

1. Import `PropertyEditModal` in `/src/app/dashboard2/page.tsx`
2. Add state for selected property and modal open state
3. Wire up `onPropertyEdit` callback to open modal with selected property
4. Wire up `onSave` callback to update local state (trigger data refresh via AuthContext)
5. Render `PropertyEditModal` component

### Task 4.2.8: Apply Airbnb Design System Styling
**Priority:** P1 (High)
**Estimated Effort:** 20 minutes

1. Ensure all colors use Airbnb DLS tokens
2. Apply proper border-radius (12px for modal, 8px for buttons/inputs)
3. Add proper focus states with `focus-visible:ring-2 ring-[#222222]`
4. Test hover states on buttons
5. Verify gradient on Save button matches ActionButtons pattern

### Task 4.2.9: Implement Mobile Responsive Layout
**Priority:** P1 (High)
**Estimated Effort:** 15 minutes

1. On mobile (< 768px): Modal becomes full-height drawer from bottom
2. Add mobile drag handle indicator
3. Stack form fields vertically
4. Stack action buttons vertically on narrow screens
5. Ensure 48px minimum touch targets

### Task 4.2.10: Add Accessibility Features
**Priority:** P1 (High)
**Estimated Effort:** 20 minutes

1. Add proper ARIA labels to modal (`aria-labelledby`, `aria-describedby`)
2. Implement focus trap within modal (handled by Radix Dialog)
3. Set initial focus on first form field
4. Announce form errors to screen readers (`role="alert"`)
5. Test keyboard navigation (Tab, Shift+Tab, Escape)

---

## 5. Authorized Files and Functions for Modification

### 5.1 Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Main modal component |

### 5.2 Files to Modify

| File Path | Lines/Functions | Modification |
|-----------|-----------------|--------------|
| `/src/components/SimpleDashboard/index.ts` | Line 15+ | Add exports for PropertyEditModal and PropertyEditModalProps |
| `/src/app/dashboard2/page.tsx` | Lines 40-48 | Replace TODO placeholders with actual modal state and handlers |
| `/src/app/api/user/properties/[propertyId]/route.ts` | Add PUT function | Add PUT endpoint for property updates |

### 5.3 Files for Reference Only (Do Not Modify)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Reference pattern for Radix Dialog implementation |
| `/src/components/SimpleDashboard/ActionButtons.tsx` | Reference pattern for Airbnb button styling |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Reference for PropertySectionProps interface |
| `/src/components/PropertyForm.tsx` | Reference for form validation patterns |
| `/src/types/index.ts` | Reference for Property type definition |

---

## 6. Database Schema Considerations

### Current Property Table Structure
Based on the existing codebase, properties have:
```typescript
interface Property {
  id: string;
  user_id: string;
  property_type_id: string;
  account_id: string | null;
  nickname: string;          // Maps to "Property Name"
  address: string | null;    // Single field currently
  created_at: string | null;
  updated_at: string | null;
}
```

### PRD Field Mapping Options

**Option A: Store as JSON (Recommended for MVP)**
- Keep single `address` column
- Store structured address as JSON: `{ line1, line2, city, state, postalCode, country }`
- No database migration required

**Option B: Add New Columns**
- Add separate columns: `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`
- Requires database migration
- More queryable but higher implementation cost

**Recommendation:** Use Option A for initial implementation to avoid database changes.

---

## 7. Testing Considerations

### Manual Test Cases

1. **Open Modal** - Click property row, modal opens with pre-populated data
2. **Validation - Empty Name** - Clear name, click Save, see error message
3. **Validation - Long Fields** - Enter > max length, see error message
4. **Save Success** - Edit name, click Save, modal closes, property list updates
5. **Cancel** - Edit fields, click Cancel, modal closes, no changes saved
6. **Escape Key** - Press Escape, modal closes
7. **Click Outside** - Click overlay, modal closes
8. **Mobile Layout** - Resize to mobile, verify drawer layout
9. **Keyboard Navigation** - Tab through all fields, verify focus order
10. **Screen Reader** - Test with VoiceOver/NVDA for announcements

---

## 8. Dependencies

### Required Packages (Already Installed)
- `@radix-ui/react-dialog` - Modal primitive
- `lucide-react` - Icons (X for close button)
- `tailwind-merge` / `clsx` - Class merging via `cn()` utility

### No New Dependencies Required

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API PUT endpoint doesn't exist | High | Blocking | Task 4.2.5 adds the endpoint |
| Address field structure mismatch | Medium | Medium | Use JSON storage in existing address column |
| No toast library for success feedback | Low | Low | Use inline feedback or add in Phase 6 |
| AuthContext doesn't refresh property data | Medium | Medium | Call refreshUserProperties() after save |

---

## 10. Acceptance Criteria Checklist

From REQ-131:

- [ ] Modal dialog opens when user selects a property from the property list
- [ ] Modal is implemented using Radix UI Dialog component
- [ ] All existing property data is pre-populated when modal opens
- [ ] Property Name field is marked as required and enforces 100-character maximum
- [ ] Address Line 1 field accepts up to 200 characters and is marked as optional
- [ ] Address Line 2 field accepts up to 200 characters and is marked as optional
- [ ] City field accepts up to 100 characters and is marked as optional
- [ ] State/Province field accepts up to 100 characters and is marked as optional
- [ ] Postal Code field accepts up to 20 characters and is marked as optional
- [ ] Country field is presented as a dropdown selection and is marked as optional
- [ ] Clicking Save button commits all field changes and closes modal
- [ ] Success feedback appears after saving changes
- [ ] Clicking Cancel button discards all changes and closes modal
- [ ] Empty Property Name field displays error message on save attempt
- [ ] Exceeding character limits displays error message on save attempt
- [ ] Error messages appear adjacent to the field that failed validation
- [ ] Modal can be dismissed by clicking outside or pressing Escape
- [ ] Modal is fully keyboard accessible with proper focus management
- [ ] Modal follows Airbnb design system color palette and styling
- [ ] Modal is responsive and displays appropriately on mobile and desktop

---

## 11. References

- PRD: `/docs/prd/PRD_Dashboard_2_Simple_Dashboard.md` (Feature 3, Feature 4)
- Implementation Plan: `/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md` (Phase 4)
- Airbnb Design System: `/docs/prd/airbnb_designsystem.md`
- Related Request: REQ-130 (PropertySection Component)
- Next Task: REQ-132 (Add Property Modal) - Phase 4, Task 4.3
