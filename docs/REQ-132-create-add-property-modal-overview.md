# REQ-132: Create Add Property Modal - Implementation Overview

**Document Created:** 2026-01-06 17:00:00 UTC
**Last Modified:** 2026-01-06 17:00:00 UTC
**Request ID:** REQ-132
**PRD Reference:** Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 4, Task 4.3)
**Design System:** Airbnb Design System (airbnb_designsystem.md)

---

## 1. Summary

Create an `AddPropertyModal` component for Dashboard 2 that allows users to create new properties through a modal dialog. The modal must share the same form structure as the existing `PropertyEditModal` (REQ-131), validate input fields, create the property via API on save, and refresh the property list upon successful creation.

---

## 2. Current State Analysis

### Existing Infrastructure

| Component | Location | Status | Reuse Potential |
|-----------|----------|--------|-----------------|
| `PropertyEditModal` | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | ✅ Complete | High - Form structure, validation, styling |
| `PropertySection` | `/src/components/SimpleDashboard/PropertySection.tsx` | ✅ Complete | Provides `onAddProperty` callback |
| `PropertyForm` | `/src/components/PropertyForm.tsx` | ✅ Complete | Reference for validation patterns |
| User Properties API | `/src/app/api/user/properties/route.ts` | ✅ GET only | Need POST endpoint |
| Admin Properties API | `/src/app/api/admin/properties/route.ts` | ✅ POST exists | Reference for create pattern |
| AuthContext | `/src/contexts/AuthContext.tsx` | ✅ Complete | `getUserProperties()` for refresh |

### Missing Components

| Component | Priority | Description |
|-----------|----------|-------------|
| `AddPropertyModal` | P0 | New component for property creation |
| POST `/api/user/properties` | P0 | User-level property creation endpoint |
| Index export | P1 | Add to SimpleDashboard barrel file |

---

## 3. Technical Requirements

### 3.1 Form Fields (Matching PropertyEditModal)

| Field | Type | Required | Max Length | Validation |
|-------|------|----------|------------|------------|
| Property Name | text | Yes | 100 chars | Non-empty, trimmed |
| Address Line 1 | text | No | 200 chars | - |
| Address Line 2 | text | No | 200 chars | - |
| City | text | No | 100 chars | - |
| State/Province | text | No | 100 chars | - |
| Postal Code | text | No | 20 chars | - |
| Country | dropdown | No | - | Valid country code |

### 3.2 API Contract

**Request (POST /api/user/properties):**
```typescript
{
  nickname: string;        // Required, max 100 chars
  address: string;         // JSON-encoded address object
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: Property;
  error?: string;
  code?: string;
}
```

### 3.3 Airbnb Design System Compliance

| Element | Token | Value |
|---------|-------|-------|
| Primary CTA | `bg-gradient-to-r from-[#E61E4D] to-[#D70466]` | Radical Red gradient |
| Primary Text | `text-[#222222]` | Mine Shaft |
| Secondary Text | `text-[#717171]` | Gray |
| Border | `border-[#DDDDDD]` | Light gray |
| Error | `text-[#FF385C]` | Radical Red |
| Card Radius | `rounded-xl` | 12px |
| Button Radius | `rounded-lg` | 8px |
| Min Touch Target | `min-h-[48px]` | 48px |

---

## 4. Implementation Tasks

### Task 1: Create AddPropertyModal Component

**File:** `/src/components/SimpleDashboard/AddPropertyModal.tsx`

**Description:** Create a modal component that mirrors `PropertyEditModal` structure but handles property creation instead of editing.

**Sub-tasks:**
- [ ] 1.1: Create file with component scaffold and type definitions
- [ ] 1.2: Copy form structure from PropertyEditModal (COUNTRIES constant, form data interface, validation)
- [ ] 1.3: Initialize form state with empty values (not pre-populated)
- [ ] 1.4: Implement handleSave with POST to `/api/user/properties`
- [ ] 1.5: Add success callback that calls `onSave(newProperty)` and closes modal
- [ ] 1.6: Ensure modal title reads "Add New Property" instead of "Edit Property"

**Dependencies:** PropertyEditModal (reference), Radix UI Dialog

### Task 2: Create User Properties POST Endpoint

**File:** `/src/app/api/user/properties/route.ts`

**Description:** Add POST handler for user-level property creation.

**Sub-tasks:**
- [ ] 2.1: Add POST export function to existing route file
- [ ] 2.2: Implement authentication validation (reuse existing `validateUserAuth`)
- [ ] 2.3: Get user's account context for property creation
- [ ] 2.4: Validate request body (nickname required, address optional)
- [ ] 2.5: Get default property type (or first available type)
- [ ] 2.6: Insert property into database with user_id, account_id, property_type_id
- [ ] 2.7: Return created property with success response

**Dependencies:** supabase client, validateUserAuth helper

### Task 3: Export AddPropertyModal from Index

**File:** `/src/components/SimpleDashboard/index.ts`

**Description:** Add barrel export for the new component.

**Sub-tasks:**
- [ ] 3.1: Add export statement for AddPropertyModal
- [ ] 3.2: Add export statement for AddPropertyModalProps type

### Task 4: Integrate with Dashboard Page

**File:** `/src/app/dashboard2/page.tsx`

**Description:** Wire up AddPropertyModal to the dashboard.

**Sub-tasks:**
- [ ] 4.1: Import AddPropertyModal component
- [ ] 4.2: Add state for modal visibility: `const [showAddPropertyModal, setShowAddPropertyModal] = useState(false)`
- [ ] 4.3: Create handleAddProperty callback to open modal
- [ ] 4.4: Create handlePropertyAdded callback to refresh properties via `getUserProperties()`
- [ ] 4.5: Pass `onAddProperty={handleAddProperty}` to PropertySection
- [ ] 4.6: Render AddPropertyModal with isOpen, onClose, onSave props

**Dependencies:** PropertySection, AddPropertyModal, AuthContext

### Task 5: Success Toast Notification

**Description:** Display success feedback after property creation.

**Sub-tasks:**
- [ ] 5.1: Investigate existing toast/notification pattern in codebase
- [ ] 5.2: Add success toast display in handlePropertyAdded callback
- [ ] 5.3: Toast message: "Property created successfully"

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Main modal component |

### Files to MODIFY

| File Path | Functions/Sections | Change Type |
|-----------|-------------------|-------------|
| `/src/app/api/user/properties/route.ts` | Add `POST` export function | Add new function |
| `/src/components/SimpleDashboard/index.ts` | Exports section | Add 2 export lines |
| `/src/app/dashboard2/page.tsx` | Component body | Add state, handlers, modal render |

### Files to REFERENCE ONLY (Do Not Modify)

| File Path | Purpose |
|-----------|---------|
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Copy form structure, validation, styling |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Understand callback interface |
| `/src/app/api/admin/properties/route.ts` | Reference POST implementation pattern |
| `/src/contexts/AuthContext.tsx` | Use `getUserProperties()` for refresh |
| `/src/types/index.ts` | Property type definitions |

---

## 6. Component Interface

### AddPropertyModal Props

```typescript
export interface AddPropertyModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed without saving */
  onClose: () => void;
  /** Callback when property is created successfully */
  onSave: (newProperty: Property) => void;
  /** Optional additional CSS classes */
  className?: string;
}
```

### Expected Usage

```tsx
<AddPropertyModal
  isOpen={showAddPropertyModal}
  onClose={() => setShowAddPropertyModal(false)}
  onSave={(newProperty) => {
    getUserProperties(); // Refresh list
    setShowAddPropertyModal(false);
    // Show success toast
  }}
/>
```

---

## 7. Acceptance Criteria

- [ ] Modal opens when user clicks "Add New Property" button in PropertySection
- [ ] Modal displays "Add New Property" as title
- [ ] All form fields render with empty initial values
- [ ] Property Name field is marked as required with asterisk
- [ ] Validation prevents submission with empty Property Name
- [ ] Character limits are enforced (100 for name, 200 for address lines, etc.)
- [ ] Country dropdown displays list of countries
- [ ] Save button shows loading state during API call
- [ ] Successful creation closes modal and refreshes property list
- [ ] Success toast notification appears after creation
- [ ] Cancel button closes modal without creating property
- [ ] Clicking overlay closes modal (when not submitting)
- [ ] Escape key closes modal (when not submitting)
- [ ] Modal is fully keyboard accessible
- [ ] Modal follows Airbnb design system styling
- [ ] Modal is responsive (drawer on mobile, centered modal on desktop)

---

## 8. Testing Considerations

### Unit Tests

- Modal renders correctly when open
- Form validation prevents empty name submission
- Character limits are enforced
- onClose callback fires when cancel clicked
- onSave callback fires with property data on success

### Integration Tests

- Full flow: Open modal → Fill form → Submit → Property appears in list
- Error handling: API failure shows error message
- Validation: Character limits display error messages

### Manual Testing

- Test on mobile viewport (drawer behavior)
- Test on desktop viewport (centered modal)
- Test keyboard navigation (Tab, Enter, Escape)
- Test screen reader accessibility

---

## 9. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Property type requirement | Medium | High | Get default property type or first available |
| Account context missing | Low | High | Validate account context before insert |
| Form state persistence | Low | Medium | Reset form state when modal closes |
| Race condition on refresh | Low | Low | Await getUserProperties before closing |

---

## 10. Implementation Order

1. **Task 2** - Create API endpoint (backend first)
2. **Task 1** - Create AddPropertyModal component
3. **Task 3** - Export from index
4. **Task 4** - Integrate with dashboard
5. **Task 5** - Add success toast

---

## 11. Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| @radix-ui/react-dialog | Installed | Modal dialog primitive |
| lucide-react | Installed | X icon for close button |
| @/lib/utils (cn) | N/A | Class name utility |
| @/types (Property) | N/A | Type definitions |
| @/contexts/AuthContext | N/A | getUserProperties function |

---

## 12. References

- [PRD: Dashboard 2 - Simple Dashboard](/docs/prd/PRD_Dashboard_2_Simple_Dashboard.md)
- [Implementation Plan (Revised)](/docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md)
- [PropertyEditModal (REQ-131)](/src/components/SimpleDashboard/PropertyEditModal.tsx)
- [PropertySection (REQ-130)](/src/components/SimpleDashboard/PropertySection.tsx)
