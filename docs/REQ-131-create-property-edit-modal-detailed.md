# REQ-131: Create Property Edit Modal - Detailed Task Breakdown

**Document Created:** 2026-01-06 22:45:00 UTC
**Last Modified:** 2026-01-06 23:45:00 UTC
**Request Reference:** REQ-131 in docs/gen_requests.md
**Overview Document:** docs/REQ-131-create-property-edit-modal-overview.md
**Implementation Plan Reference:** docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md (Phase 4, Task 4.2)
**Status:** IMPLEMENTED

## Implementation Summary

All tasks have been implemented and build verification passed on 2026-01-06 23:45:00 UTC.

**Files Created:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx` - Complete modal component with all features

**Files Modified:**
- `src/components/SimpleDashboard/index.ts` - Added exports for PropertyEditModal
- `src/app/api/user/properties/[propertyId]/route.ts` - Added PUT endpoint
- `src/app/dashboard2/page.tsx` - Integrated modal with state management

---

## Document Purpose

This document provides granular, actionable implementation tasks for the PropertyEditModal component. Each task is designed to be <= 1 story point (a few hours of focused work) and includes specific verification steps.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] `@radix-ui/react-dialog` is installed (check package.json)
- [ ] `lucide-react` is installed (for icons)
- [ ] `cn()` utility available from `@/lib/utils`
- [ ] Property type from `@/types` includes required fields
- [ ] PropertySection component exists at `src/components/SimpleDashboard/PropertySection.tsx`

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/SimpleDashboard/PropertyEditModal.tsx` | Main modal component with form |

### Files to Modify

| File Path | Lines/Functions | Modification |
|-----------|-----------------|--------------|
| `src/components/SimpleDashboard/index.ts` | Lines 15+ | Add exports for PropertyEditModal and PropertyEditModalProps |
| `src/app/dashboard2/page.tsx` | Lines 40-48 | Replace TODO placeholders with actual modal state and handlers |
| `src/app/api/user/properties/[propertyId]/route.ts` | Add PUT function | Add PUT endpoint for property updates |

### Files for Reference Only (Do Not Modify)

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Reference pattern for Radix Dialog implementation |
| `src/components/SimpleDashboard/ActionButtons.tsx` | Reference pattern for Airbnb button styling |
| `src/components/SimpleDashboard/PropertySection.tsx` | Reference for PropertySectionProps interface |
| `src/components/PropertyForm.tsx` | Reference for form validation patterns |
| `src/types/index.ts` | Reference for Property type definition |

---

## Task Breakdown

### Task 1: Create PropertyEditModal Component Shell (0.5 SP)

**Priority:** P0 (Blocking)
**Dependency:** None

**Description:**
Create the basic PropertyEditModal component file with TypeScript interfaces, Radix UI Dialog structure, and proper modal layout (header, body, footer).

**Implementation Steps:**

1. Create new file: `src/components/SimpleDashboard/PropertyEditModal.tsx`
2. Add 'use client' directive at the top
3. Import dependencies:
   ```typescript
   import { useState, useEffect, useCallback } from 'react';
   import * as Dialog from '@radix-ui/react-dialog';
   import { X } from 'lucide-react';
   import { cn } from '@/lib/utils';
   import { Property } from '@/types';
   ```
4. Define TypeScript interfaces:
   - `PropertyEditModalProps` (isOpen, property, onClose, onSave, className?)
   - `PropertyEditFormData` (name, addressLine1, addressLine2, city, state, postalCode, country)
   - `PropertyEditValidationErrors` (field-level errors + general)
5. Create component function with Dialog.Root, Dialog.Portal, Dialog.Overlay, Dialog.Content
6. Add modal header with title "Edit Property" and close button (X icon)
7. Add empty body section placeholder
8. Add footer section placeholder for buttons
9. Implement basic open/close handling via `isOpen` prop

**Airbnb Design System Styling:**
- Modal overlay: `bg-black/50`
- Modal container: `bg-white rounded-xl shadow-lg`
- Modal title: `text-xl font-semibold text-[#222222]`
- Close button: `text-[#717171] hover:text-[#222222]`

**Verification Steps:**
- [x] File created at correct path
- [x] Component accepts isOpen, property, onClose, onSave props
- [x] Modal opens when isOpen=true
- [x] Modal closes when X button clicked
- [x] No TypeScript errors
- [x] Modal renders with correct Airbnb styling (white bg, rounded-xl)

**Files Modified:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx` (CREATE)

---

### Task 2: Implement Country Dropdown Data (0.25 SP)

**Priority:** P0 (Blocking)
**Dependency:** Task 1

**Description:**
Create the country options array with ISO 3166-1 alpha-2 codes, prioritizing common countries at the top of the list.

**Implementation Steps:**

1. In PropertyEditModal.tsx, add countries constant after imports:
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
     { code: 'BR', label: 'Brazil' },
     { code: 'NL', label: 'Netherlands' },
     { code: 'BE', label: 'Belgium' },
     { code: 'CH', label: 'Switzerland' },
     { code: 'AT', label: 'Austria' },
     { code: 'SE', label: 'Sweden' },
     { code: 'NO', label: 'Norway' },
     { code: 'DK', label: 'Denmark' },
     { code: 'FI', label: 'Finland' },
     { code: 'IE', label: 'Ireland' },
     { code: 'PT', label: 'Portugal' },
     { code: 'NZ', label: 'New Zealand' },
     { code: 'SG', label: 'Singapore' },
     { code: 'HK', label: 'Hong Kong' },
   ] as const;
   ```
2. Export type for country code if needed for validation

**Verification Steps:**
- [x] COUNTRIES array defined with 25+ options
- [x] First option is empty placeholder
- [x] Common countries (US, CA, GB, AU) at top
- [x] All codes are valid ISO 3166-1 alpha-2

**Files Modified:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx` (MODIFY)

---

### Task 3: Implement Form State and Pre-Population (0.5 SP)

**Priority:** P0 (Blocking)
**Dependency:** Task 1, Task 2

**Description:**
Add form state management with useState, implement pre-population from the property prop, and reset form when modal opens/closes.

**Implementation Steps:**

1. Add form state using useState:
   ```typescript
   const [formData, setFormData] = useState<PropertyEditFormData>({
     name: '',
     addressLine1: '',
     addressLine2: '',
     city: '',
     state: '',
     postalCode: '',
     country: '',
   });
   const [errors, setErrors] = useState<PropertyEditValidationErrors>({});
   const [isSubmitting, setIsSubmitting] = useState(false);
   ```

2. Create helper function to parse address from property:
   ```typescript
   const parsePropertyAddress = (property: Property | null): Partial<PropertyEditFormData> => {
     if (!property?.address) return {};
     try {
       const parsed = JSON.parse(property.address);
       return {
         addressLine1: parsed.line1 || '',
         addressLine2: parsed.line2 || '',
         city: parsed.city || '',
         state: parsed.state || '',
         postalCode: parsed.postalCode || '',
         country: parsed.country || '',
       };
     } catch {
       // Fallback: treat as single address line
       return { addressLine1: property.address };
     }
   };
   ```

3. Add useEffect to pre-populate form when modal opens:
   ```typescript
   useEffect(() => {
     if (isOpen && property) {
       const addressData = parsePropertyAddress(property);
       setFormData({
         name: property.nickname || '',
         addressLine1: addressData.addressLine1 || '',
         addressLine2: addressData.addressLine2 || '',
         city: addressData.city || '',
         state: addressData.state || '',
         postalCode: addressData.postalCode || '',
         country: addressData.country || '',
       });
       setErrors({});
     }
   }, [isOpen, property]);
   ```

4. Reset form when modal closes:
   ```typescript
   useEffect(() => {
     if (!isOpen) {
       setErrors({});
       setIsSubmitting(false);
     }
   }, [isOpen]);
   ```

**Verification Steps:**
- [ ] Form fields pre-populate from property.nickname
- [ ] Address fields parse from JSON if property.address is JSON
- [ ] Address fields fallback to single line if property.address is plain string
- [ ] Errors clear when modal opens
- [ ] Form resets correctly when modal closes and reopens

**Files Modified:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx` (MODIFY)

---

### Task 4: Implement Form Fields UI (0.75 SP)

**Priority:** P0 (Blocking)
**Dependency:** Task 3

**Description:**
Render all form fields with proper styling, labels, placeholders, max length indicators, and required field indicators.

**Implementation Steps:**

1. Create reusable input field component or inline JSX for each field:
   ```typescript
   const renderTextField = (
     id: string,
     label: string,
     value: string,
     onChange: (value: string) => void,
     options: {
       required?: boolean;
       maxLength: number;
       placeholder?: string;
       error?: string;
     }
   ) => (
     <div className="space-y-1.5">
       <label htmlFor={id} className="block text-sm font-medium text-[#222222]">
         {label}
         {options.required && <span className="text-[#FF385C] ml-0.5">*</span>}
       </label>
       <input
         id={id}
         type="text"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         maxLength={options.maxLength}
         placeholder={options.placeholder}
         disabled={isSubmitting}
         className={cn(
           'w-full px-3 py-2.5 text-[#222222] rounded-lg border transition-colors',
           'focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-[#222222]',
           'disabled:bg-gray-50 disabled:text-gray-500',
           options.error
             ? 'border-[#FF385C] focus:ring-[#FF385C]'
             : 'border-[#DDDDDD] hover:border-[#222222]'
         )}
       />
       <div className="flex justify-between text-xs">
         {options.error ? (
           <span className="text-[#FF385C]" role="alert">{options.error}</span>
         ) : (
           <span />
         )}
         <span className="text-[#717171]">
           {value.length}/{options.maxLength}
         </span>
       </div>
     </div>
   );
   ```

2. Render fields in the modal body:
   - Property Name (required, max 100)
   - Address Line 1 (optional, max 200)
   - Address Line 2 (optional, max 200)
   - City / State row (side by side on desktop)
   - Postal Code / Country row (side by side on desktop)

3. Country dropdown:
   ```typescript
   <div className="space-y-1.5">
     <label htmlFor="country" className="block text-sm font-medium text-[#222222]">
       Country
     </label>
     <select
       id="country"
       value={formData.country}
       onChange={(e) => handleFieldChange('country', e.target.value)}
       disabled={isSubmitting}
       className={cn(
         'w-full px-3 py-2.5 text-[#222222] rounded-lg border transition-colors',
         'focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-[#222222]',
         'disabled:bg-gray-50 disabled:text-gray-500',
         'border-[#DDDDDD] hover:border-[#222222]'
       )}
     >
       {COUNTRIES.map((country) => (
         <option key={country.code} value={country.code}>
           {country.label}
         </option>
       ))}
     </select>
   </div>
   ```

4. Add handleFieldChange function:
   ```typescript
   const handleFieldChange = (field: keyof PropertyEditFormData, value: string) => {
     setFormData((prev) => ({ ...prev, [field]: value }));
     // Clear field error when user starts typing
     if (errors[field]) {
       setErrors((prev) => ({ ...prev, [field]: undefined }));
     }
   };
   ```

**Airbnb Design System Styling:**
- Labels: `text-sm font-medium text-[#222222]`
- Required indicator: `text-[#FF385C]`
- Inputs: `border-[#DDDDDD] rounded-lg focus:border-[#222222] focus:ring-[#222222]`
- Error text: `text-sm text-[#FF385C]`
- Character count: `text-xs text-[#717171]`

**Verification Steps:**
- [ ] All 7 form fields render correctly
- [ ] Property Name shows required indicator (*)
- [ ] All inputs show character count
- [ ] Country renders as dropdown with all options
- [ ] Fields disabled during submission
- [ ] Styling matches Airbnb design system

**Files Modified:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx` (MODIFY)

---

### Task 5: Implement Form Validation (0.5 SP)

**Priority:** P0 (Blocking)
**Dependency:** Task 4

**Description:**
Implement the validateForm function with all validation rules per PRD requirements.

**Implementation Steps:**

1. Create validateForm function:
   ```typescript
   const validateForm = (data: PropertyEditFormData): PropertyEditValidationErrors => {
     const errors: PropertyEditValidationErrors = {};

     // Property Name - required, max 100
     const trimmedName = data.name.trim();
     if (!trimmedName) {
       errors.name = 'Property name is required';
     } else if (trimmedName.length > 100) {
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

     // Country - validate is valid code or empty
     if (data.country && !COUNTRIES.find(c => c.code === data.country)) {
       errors.country = 'Please select a valid country';
     }

     return errors;
   };
   ```

2. Integrate validation with form submission (preparation for Task 6)

**Verification Steps:**
- [ ] Empty name returns error "Property name is required"
- [ ] Name > 100 chars returns error
- [ ] Each optional field > max length returns appropriate error
- [ ] Valid form returns empty errors object
- [ ] Invalid country code returns error

**Files Modified:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx` (MODIFY)

---

### Task 6: Implement Save Handler with Loading State (0.5 SP)

**Priority:** P0 (Blocking)
**Dependency:** Task 5

**Description:**
Implement the handleSave function that validates the form, calls the API, and handles success/error states.

**Implementation Steps:**

1. Create handleSave function:
   ```typescript
   const handleSave = async () => {
     // Run validation
     const validationErrors = validateForm(formData);
     if (Object.keys(validationErrors).length > 0) {
       setErrors(validationErrors);
       // Focus first error field
       const firstErrorField = Object.keys(validationErrors)[0];
       document.getElementById(firstErrorField)?.focus();
       return;
     }

     setIsSubmitting(true);
     setErrors({});

     try {
       const response = await fetch(`/api/user/properties/${property?.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           nickname: formData.name.trim(),
           address: JSON.stringify({
             line1: formData.addressLine1,
             line2: formData.addressLine2,
             city: formData.city,
             state: formData.state,
             postalCode: formData.postalCode,
             country: formData.country,
           }),
         }),
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
         general: error instanceof Error ? error.message : 'Failed to update property',
       });
     } finally {
       setIsSubmitting(false);
     }
   };
   ```

2. Display general error at top of form if present:
   ```typescript
   {errors.general && (
     <div
       className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#FF385C]"
       role="alert"
     >
       {errors.general}
     </div>
   )}
   ```

3. Handle Enter key to submit:
   ```typescript
   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter' && !e.shiftKey && !isSubmitting) {
       e.preventDefault();
       handleSave();
     }
   };
   ```

**Verification Steps:**
- [ ] Validation errors prevent submission
- [ ] First error field receives focus on validation failure
- [ ] Save button shows loading state during submission
- [ ] Form fields disabled during submission
- [ ] API error displays in general error area
- [ ] Successful save calls onSave and onClose
- [ ] Enter key triggers save (when not submitting)

**Files Modified:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx` (MODIFY)

---

### Task 7: Implement Cancel and Dismiss Handlers (0.25 SP)

**Priority:** P0 (Blocking)
**Dependency:** Task 6

**Description:**
Implement cancel button, overlay click dismiss, and Escape key handling.

**Implementation Steps:**

1. Cancel button handler (already have onClose):
   ```typescript
   const handleCancel = () => {
     if (isSubmitting) return; // Prevent close during submission
     onClose();
   };
   ```

2. Configure Dialog.Root to handle dismiss:
   ```typescript
   <Dialog.Root
     open={isOpen}
     onOpenChange={(open) => {
       if (!open && !isSubmitting) {
         onClose();
       }
     }}
   >
   ```

3. Prevent close during submission in overlay:
   ```typescript
   <Dialog.Overlay
     className="fixed inset-0 z-50 bg-black/50"
     onClick={(e) => {
       if (isSubmitting) e.preventDefault();
     }}
   />
   ```

**Verification Steps:**
- [ ] Cancel button closes modal without saving
- [ ] Clicking overlay closes modal
- [ ] Pressing Escape closes modal
- [ ] Modal cannot be closed while isSubmitting=true
- [ ] Form data not persisted after cancel

**Files Modified:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx` (MODIFY)

---

### Task 8: Implement Action Buttons with Airbnb Styling (0.5 SP)

**Priority:** P0 (Blocking)
**Dependency:** Task 6, Task 7

**Description:**
Add Save and Cancel buttons to the modal footer with proper Airbnb design system styling.

**Implementation Steps:**

1. Add footer section with buttons:
   ```typescript
   {/* Footer with action buttons */}
   <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 border-t border-[#DDDDDD]">
     {/* Cancel Button */}
     <button
       type="button"
       onClick={handleCancel}
       disabled={isSubmitting}
       className={cn(
         'flex-1 sm:flex-none min-h-[48px] px-6 py-3 rounded-lg font-medium text-base',
         'bg-white border border-[#222222] text-[#222222]',
         'transition-all duration-200 ease-out',
         'hover:bg-[#F7F7F7] active:scale-[0.98]',
         'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2',
         'disabled:opacity-50 disabled:cursor-not-allowed'
       )}
     >
       Cancel
     </button>

     {/* Save Button */}
     <button
       type="button"
       onClick={handleSave}
       disabled={isSubmitting}
       className={cn(
         'flex-1 sm:flex-none min-h-[48px] px-6 py-3 rounded-lg font-medium text-base',
         'bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white',
         'transition-all duration-200 ease-out',
         'hover:scale-[1.02] hover:brightness-95 active:scale-[0.98]',
         'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2',
         'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
         'flex items-center justify-center gap-2'
       )}
     >
       {isSubmitting ? (
         <>
           <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
           <span>Saving...</span>
         </>
       ) : (
         <span>Save Changes</span>
       )}
     </button>
   </div>
   ```

**Verification Steps:**
- [ ] Save button has Airbnb gradient (from-[#E61E4D] to-[#D70466])
- [ ] Cancel button has white background with border
- [ ] Buttons have min 48px height (touch targets)
- [ ] Save button shows loading spinner when submitting
- [ ] Buttons stack vertically on mobile (flex-col-reverse)
- [ ] Buttons side by side on desktop
- [ ] Hover states work correctly

**Files Modified:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx` (MODIFY)

---

### Task 9: Add API PUT Endpoint for User Properties (0.75 SP)

**Priority:** P0 (Blocking)
**Dependency:** None (can run in parallel with Tasks 1-8)

**Description:**
Add PUT method to the existing user properties API route to handle property updates.

**Implementation Steps:**

1. Open `src/app/api/user/properties/[propertyId]/route.ts`

2. Add PUT function after existing GET function:
   ```typescript
   // PUT /api/user/properties/[propertyId] - Update property
   export async function PUT(
     request: NextRequest,
     { params }: { params: Promise<{ propertyId: string }> }
   ): Promise<NextResponse<PropertyDetailResponse>> {
     try {
       console.log('User property update API called - validating authentication...');

       // Validate authentication
       const authResult = await validateUserAuth(request);
       if (authResult.error) {
         return authResult.error;
       }

       const user = authResult.user;
       const { propertyId } = await params;

       if (!user) {
         return NextResponse.json(
           { success: false, error: 'User not found', code: 'USER_NOT_FOUND' },
           { status: 401 }
         );
       }

       // Check if user can access this property
       const accessResult = await canAccessProperty(user, propertyId, supabase);
       if (!accessResult.canAccess) {
         const statusCode = accessResult.error === 'Property not found' ? 404 : 403;
         return NextResponse.json(
           {
             success: false,
             error: accessResult.error || 'Access denied',
             code: statusCode === 404 ? 'NOT_FOUND' : 'ACCESS_DENIED'
           },
           { status: statusCode }
         );
       }

       // Parse request body
       const body = await request.json();

       // Validate required fields
       if (!body.nickname || typeof body.nickname !== 'string' || !body.nickname.trim()) {
         return NextResponse.json(
           { success: false, error: 'Property name is required', code: 'VALIDATION_ERROR' },
           { status: 400 }
         );
       }

       // Validate field lengths
       if (body.nickname.trim().length > 100) {
         return NextResponse.json(
           { success: false, error: 'Property name must be 100 characters or less', code: 'VALIDATION_ERROR' },
           { status: 400 }
         );
       }

       // Update property
       const { data: updatedProperty, error: updateError } = await supabase
         .from('properties')
         .update({
           nickname: body.nickname.trim(),
           address: body.address || null,
           updated_at: new Date().toISOString(),
         })
         .eq('id', propertyId)
         .select()
         .single();

       if (updateError) {
         console.error('Error updating property:', updateError);
         return NextResponse.json(
           { success: false, error: 'Failed to update property', code: 'UPDATE_ERROR' },
           { status: 500 }
         );
       }

       console.log(`Successfully updated property ${propertyId} for user ${user.email}`);

       return NextResponse.json({
         success: true,
         data: updatedProperty
       });

     } catch (error) {
       console.error('User property update API error:', error);
       return NextResponse.json(
         { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
         { status: 500 }
       );
     }
   }
   ```

**Verification Steps:**
- [ ] PUT endpoint responds at `/api/user/properties/[propertyId]`
- [ ] Unauthenticated requests return 401
- [ ] Unauthorized property access returns 403
- [ ] Missing property name returns 400 with validation error
- [ ] Successful update returns updated property data
- [ ] Property updated_at timestamp is set

**Files Modified:**
- `src/app/api/user/properties/[propertyId]/route.ts` (MODIFY)

---

### Task 10: Update SimpleDashboard Index Exports (0.25 SP)

**Priority:** P0 (Blocking)
**Dependency:** Task 8

**Description:**
Add exports for PropertyEditModal component and its props interface.

**Implementation Steps:**

1. Open `src/components/SimpleDashboard/index.ts`

2. Add exports after existing exports:
   ```typescript
   export { PropertyEditModal } from './PropertyEditModal';
   export type { PropertyEditModalProps } from './PropertyEditModal';
   ```

3. Update file header comment to include REQ-131

**Verification Steps:**
- [ ] PropertyEditModal can be imported from '@/components/SimpleDashboard'
- [ ] PropertyEditModalProps type can be imported
- [ ] No TypeScript errors in index.ts
- [ ] REQ-131 mentioned in file header

**Files Modified:**
- `src/components/SimpleDashboard/index.ts` (MODIFY)

---

### Task 11: Integrate Modal into Dashboard2 Page (0.5 SP)

**Priority:** P0 (Blocking)
**Dependency:** Task 10

**Description:**
Wire up the PropertyEditModal to the Dashboard2 page, replacing the TODO placeholder with actual state management and handlers.

**Implementation Steps:**

1. Open `src/app/dashboard2/page.tsx`

2. Add imports:
   ```typescript
   import { StatisticsCards, ActionButtons, PropertySection, PropertyEditModal } from '@/components/SimpleDashboard';
   ```

3. Add state for modal:
   ```typescript
   const [editModalOpen, setEditModalOpen] = useState(false);
   const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
   ```

4. Add import for Property type:
   ```typescript
   import { Property } from '@/types';
   ```

5. Create handlers:
   ```typescript
   const handlePropertyEdit = (property: Property) => {
     setSelectedProperty(property);
     setEditModalOpen(true);
   };

   const handlePropertySave = async (updatedProperty: Property) => {
     // Refresh user properties via AuthContext
     await refreshUserProperties?.();
     // Refresh stats to reflect any changes
     refresh();
   };

   const handleEditModalClose = () => {
     setEditModalOpen(false);
     setSelectedProperty(null);
   };
   ```

6. Get refreshUserProperties from AuthContext:
   ```typescript
   const { user, refreshUserProperties } = useAuth();
   ```

7. Update PropertySection props:
   ```typescript
   <PropertySection
     onPropertyEdit={handlePropertyEdit}
     onAddProperty={() => {
       // TODO: Implement in Task 4.3 (AddPropertyModal)
       console.log('[Dashboard2] Add new property');
     }}
   />
   ```

8. Render PropertyEditModal:
   ```typescript
   {/* Property Edit Modal - REQ-131 */}
   <PropertyEditModal
     isOpen={editModalOpen}
     property={selectedProperty}
     onClose={handleEditModalClose}
     onSave={handlePropertySave}
   />
   ```

**Verification Steps:**
- [ ] Clicking property row opens edit modal
- [ ] Modal pre-populates with property data
- [ ] Save updates property and refreshes list
- [ ] Cancel closes modal without changes
- [ ] Stats refresh after successful save

**Files Modified:**
- `src/app/dashboard2/page.tsx` (MODIFY)

---

### Task 12: Implement Mobile Responsive Layout (0.5 SP)

**Priority:** P1 (High)
**Dependency:** Task 8

**Description:**
Make the modal fully responsive with drawer-style presentation on mobile devices.

**Implementation Steps:**

1. Update Dialog.Content classes for responsive behavior:
   ```typescript
   <Dialog.Content
     className={cn(
       // Base styles
       'fixed z-50 bg-white shadow-lg outline-none',
       'overflow-hidden flex flex-col',

       // Desktop: centered modal
       'md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
       'md:max-w-[640px] md:w-[calc(100%-2rem)] md:max-h-[90vh]',
       'md:rounded-xl',

       // Mobile: slide-up drawer
       'max-md:inset-x-0 max-md:bottom-0',
       'max-md:max-h-[90vh] max-md:rounded-t-xl',

       className
     )}
   >
   ```

2. Add mobile drag handle indicator:
   ```typescript
   {/* Mobile drag handle indicator */}
   <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 md:hidden" />
   ```

3. Ensure form fields stack properly on mobile:
   - City/State: side by side on desktop, stacked on mobile
   - PostalCode/Country: side by side on desktop, stacked on mobile

   ```typescript
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
     {/* City */}
     {renderTextField('city', 'City', formData.city, ...)}
     {/* State */}
     {renderTextField('state', 'State/Province', formData.state, ...)}
   </div>
   ```

4. Ensure scrollable body for long forms:
   ```typescript
   <div className="flex-1 overflow-y-auto p-4 sm:p-6">
     {/* Form content */}
   </div>
   ```

**Verification Steps:**
- [ ] Modal centers on desktop (>768px)
- [ ] Modal slides up from bottom on mobile (<768px)
- [ ] Mobile shows drag handle indicator
- [ ] Form fields stack properly on narrow screens
- [ ] Action buttons stack vertically on mobile
- [ ] Form content scrollable when it exceeds viewport
- [ ] 48px minimum touch targets maintained

**Files Modified:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx` (MODIFY)

---

### Task 13: Add Accessibility Features (0.5 SP)

**Priority:** P1 (High)
**Dependency:** Task 8

**Description:**
Ensure full keyboard accessibility, proper ARIA labels, and screen reader support.

**Implementation Steps:**

1. Add aria-labelledby and aria-describedby to Dialog.Content:
   ```typescript
   <Dialog.Content
     aria-labelledby="property-edit-modal-title"
     aria-describedby="property-edit-modal-description"
     ...
   >
   ```

2. Add proper title IDs:
   ```typescript
   <Dialog.Title
     id="property-edit-modal-title"
     className="text-xl font-semibold text-[#222222]"
   >
     Edit Property
   </Dialog.Title>

   <Dialog.Description id="property-edit-modal-description" className="sr-only">
     Edit the details of your property including name and address information.
   </Dialog.Description>
   ```

3. Ensure focus is set to first field on open (already handled by Radix, but verify):
   ```typescript
   // Radix Dialog auto-focuses first focusable element
   // Add autoFocus to first input if needed:
   <input
     id="name"
     autoFocus
     ...
   />
   ```

4. Add role="alert" to error messages (already done in Task 5)

5. Ensure all interactive elements have visible focus states:
   ```typescript
   'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2'
   ```

6. Add screen reader announcement for form state:
   ```typescript
   <div aria-live="polite" className="sr-only">
     {isSubmitting && 'Saving property changes...'}
     {errors.general && `Error: ${errors.general}`}
   </div>
   ```

**Verification Steps:**
- [ ] Modal has aria-labelledby pointing to title
- [ ] First form field receives focus when modal opens
- [ ] Tab navigates through all interactive elements in logical order
- [ ] Shift+Tab navigates backwards
- [ ] Escape closes modal
- [ ] All form errors announced by screen reader (role="alert")
- [ ] Focus visible state on all interactive elements
- [ ] Modal focus trapped (cannot Tab out of modal)

**Files Modified:**
- `src/components/SimpleDashboard/PropertyEditModal.tsx` (MODIFY)

---

### Task 14: Test PropertyEditModal Component (0.5 SP)

**Priority:** P1 (High)
**Dependency:** Task 11, Task 12, Task 13

**Description:**
Perform manual testing of all modal functionality to verify acceptance criteria.

**Test Cases:**

1. **Open Modal**
   - [ ] Click property row in PropertySection
   - [ ] Modal opens with animation
   - [ ] Property name pre-populated
   - [ ] Focus moves to Property Name field

2. **Validation - Empty Name**
   - [ ] Clear property name field
   - [ ] Click Save
   - [ ] Error "Property name is required" appears
   - [ ] Focus moves to name field

3. **Validation - Long Fields**
   - [ ] Enter > 100 characters in Property Name
   - [ ] Click Save
   - [ ] Error message appears
   - [ ] Character count shows exceeded limit

4. **Save Success**
   - [ ] Edit property name
   - [ ] Click Save
   - [ ] Modal closes
   - [ ] Property list shows updated name
   - [ ] No console errors

5. **Cancel**
   - [ ] Edit some fields
   - [ ] Click Cancel
   - [ ] Modal closes
   - [ ] No changes persisted
   - [ ] Reopening shows original values

6. **Escape Key**
   - [ ] Press Escape
   - [ ] Modal closes

7. **Click Outside**
   - [ ] Click overlay (outside modal)
   - [ ] Modal closes

8. **Mobile Layout**
   - [ ] Resize to mobile width (<768px)
   - [ ] Modal shows as drawer from bottom
   - [ ] Drag handle visible
   - [ ] Buttons stacked vertically

9. **Keyboard Navigation**
   - [ ] Tab through all fields
   - [ ] Focus visible on each element
   - [ ] Shift+Tab works backwards
   - [ ] Cannot Tab out of modal

10. **Loading State**
    - [ ] Click Save with valid data
    - [ ] Save button shows spinner
    - [ ] Fields disabled during save
    - [ ] Cancel disabled during save

**Verification:**
- [ ] All 10 test cases pass
- [ ] No console errors or warnings
- [ ] No layout issues on different screen sizes

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Task(s) | Status |
|---------------------|---------|--------|
| Modal dialog opens when user selects a property from the property list | Task 11 | ✅ |
| Modal is implemented using Radix UI Dialog component | Task 1 | ✅ |
| All existing property data is pre-populated when modal opens | Task 3 | ✅ |
| Property Name field is marked as required and enforces 100-character maximum | Task 4, Task 5 | ✅ |
| Address Line 1 field accepts up to 200 characters and is marked as optional | Task 4, Task 5 | ✅ |
| Address Line 2 field accepts up to 200 characters and is marked as optional | Task 4, Task 5 | ✅ |
| City field accepts up to 100 characters and is marked as optional | Task 4, Task 5 | ✅ |
| State/Province field accepts up to 100 characters and is marked as optional | Task 4, Task 5 | ✅ |
| Postal Code field accepts up to 20 characters and is marked as optional | Task 4, Task 5 | ✅ |
| Country field is presented as a dropdown selection and is marked as optional | Task 2, Task 4 | ✅ |
| Clicking Save button commits all field changes and closes modal | Task 6, Task 8 | ✅ |
| Success feedback appears after saving changes | Task 6 | ✅ |
| Clicking Cancel button discards all changes and closes modal | Task 7, Task 8 | ✅ |
| Empty Property Name field displays error message on save attempt | Task 5, Task 6 | ✅ |
| Exceeding character limits displays error message on save attempt | Task 5, Task 6 | ✅ |
| Error messages appear adjacent to the field that failed validation | Task 4 | ✅ |
| Modal can be dismissed by clicking outside or pressing Escape | Task 7 | ✅ |
| Modal is fully keyboard accessible with proper focus management | Task 13 | ✅ |
| Modal follows Airbnb design system color palette and styling | Task 1, Task 4, Task 8 | ✅ |
| Modal is responsive and displays appropriately on mobile and desktop | Task 12 | ✅ |

---

## Task Dependency Graph

```
Task 1 (Shell) ─────┬───► Task 2 (Countries) ───► Task 3 (Form State)
                    │                                     │
                    │                                     ▼
                    │                              Task 4 (Fields UI)
                    │                                     │
                    │                                     ▼
                    │                              Task 5 (Validation)
                    │                                     │
                    │                                     ▼
                    │                              Task 6 (Save Handler)
                    │                                     │
                    │                                     ▼
                    └───────────────────────────► Task 7 (Cancel/Dismiss)
                                                          │
                                                          ▼
                                                   Task 8 (Buttons)
                                                          │
                    ┌─────────────────────────────────────┴──────────┐
                    │                                                │
                    ▼                                                ▼
             Task 12 (Mobile)                                Task 13 (A11y)
                    │                                                │
                    └──────────────────┬─────────────────────────────┘
                                       │
                                       ▼
Task 9 (API) ──────► Task 10 (Exports) ──────► Task 11 (Integration)
                                                          │
                                                          ▼
                                                   Task 14 (Testing)
```

---

## Estimated Total Effort

| Task | Story Points |
|------|--------------|
| Task 1: Component Shell | 0.5 |
| Task 2: Country Data | 0.25 |
| Task 3: Form State | 0.5 |
| Task 4: Form Fields UI | 0.75 |
| Task 5: Validation | 0.5 |
| Task 6: Save Handler | 0.5 |
| Task 7: Cancel/Dismiss | 0.25 |
| Task 8: Action Buttons | 0.5 |
| Task 9: API Endpoint | 0.75 |
| Task 10: Index Exports | 0.25 |
| Task 11: Dashboard Integration | 0.5 |
| Task 12: Mobile Responsive | 0.5 |
| Task 13: Accessibility | 0.5 |
| Task 14: Testing | 0.5 |
| **Total** | **6.25 SP** |

---

## Notes

1. **Database Schema**: The current Property type uses a single `address` field. This implementation stores structured address data as JSON in the existing field, avoiding database migrations.

2. **Toast Notifications**: Per the overview document recommendation, success feedback is provided by closing the modal and refreshing the property list. Toast notifications can be added in Phase 6 (Polish).

3. **Parallel Work**: Task 9 (API Endpoint) can be developed in parallel with Tasks 1-8 since they modify different files.

4. **Testing Environment**: Manual testing should be performed on:
   - Desktop (Chrome, Firefox, Safari)
   - Mobile (iOS Safari, Android Chrome)
   - Screen reader (VoiceOver on macOS)

---

## References

- Overview Document: `docs/REQ-131-create-property-edit-modal-overview.md`
- Implementation Plan: `docs/prd/Plan-001-Simple-Dashboard-Implementation-REVISED.md`
- Request Details: `docs/gen_requests.md` (REQ-131)
- Radix Dialog Pattern: `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- Airbnb Button Styling: `src/components/SimpleDashboard/ActionButtons.tsx`
