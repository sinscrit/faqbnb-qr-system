# REQ-184: Update QR Code Label Display - Implementation Overview

**Generated:** 2026-01-12
**Last Modified:** 2026-01-12
**Request Source:** docs/gen_requests.md - Request #184
**Implementation Plan:** docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Phase:** 0 - REQ-2 - Data Model UI Clarification
**Task ID:** 0.4

---

## Summary

This task ensures QR code labels display only the Item Name (e.g., "Steamer") instead of combining Purpose with Item Name (e.g., "How to Clean - Steamer"). This change aligns with the broader Phase 0 Data Model UI Clarification effort to clearly distinguish Items (physical objects) from Articles (instructions/content).

---

## Current State Analysis

### QR Code Label Data Flow

The QR code label display involves multiple components in a data pipeline:

1. **Data Source:** Item metadata stored in database with `name` field
2. **Hook Generation:** `src/hooks/useQRCodeGeneration.ts` - Generates QR codes with item data
3. **Print Preview:** `src/components/QRCodePrintPreview.tsx` - Displays QR codes with labels
4. **Print Manager:** `src/components/QRCodePrintManager.tsx` - Manages print workflow
5. **PDF API:** `src/app/api/admin/generate-pdf/route.ts` - Server-side PDF generation
6. **PDF Module:** `src/lib/pdf_generator_module.js` - Core PDF rendering with labels

### Current Implementation Findings

**GOOD NEWS:** The current implementation already uses Item Name only for labels in most places:

| Component | Current Label Source | Status |
|-----------|---------------------|--------|
| `QRCodePrintPreview.tsx:122` | `item.item.name` | ✅ Correct |
| `QRCodePrintManager.tsx:627` | `item.name` for label | ✅ Correct |
| `generate-pdf/route.ts:186` | `qr.name` (from item.name) | ✅ Correct |
| `pdf_generator_module.js:396` | `qrData.label` | ⚠️ Depends on input |

**Key Finding:** The data flows correctly from `item.name` through the system. The "Purpose - Item Name" format does NOT appear to be currently implemented in the QR code label display. This was likely the intended behavior from the data model design.

### Files Reviewed

1. **`src/hooks/useQRCodeGeneration.ts`**
   - Generates QR codes using `item.public_id` for URL
   - Does not set labels - that's handled by display components
   - Line 149: `const qrUrl = \`${baseUrl}/item/${item.public_id}\``

2. **`src/components/QRCodePrintPreview.tsx`**
   - Line 122: `{item.item.name}` - Already displays Item Name only
   - Label is displayed above QR code in a 225x225 container
   - Mobile-responsive label sizing

3. **`src/components/QRCodePrintManager.tsx`**
   - Line 627: `label: item.name` - Already passes Item Name only
   - Converts generatedQRCodes to format for print window

4. **`src/app/api/admin/generate-pdf/route.ts`**
   - Line 186: `safeLabel = qr.name || ...` - Uses Item Name
   - Fallback chain: `qr.name || qrAny.title || qrAny.label || qrAny.displayName`
   - Labels are passed to PDF generator module

5. **`src/lib/pdf_generator_module.js`**
   - Line 396: `doc.text(qrData.label, labelX, labelY)` - Renders the label
   - Label comes from `qrCodes[].label` in config
   - No transformation applied - displays what it receives

---

## Implementation Tasks

### Task 0.4.1: Verify QRCodePrintPreview Label Display ✅ (Confirmed Correct)

**File:** `src/components/QRCodePrintPreview.tsx`

**Current Code (Line 118-124):**
```tsx
{showLabels && (
  <div className="qr-item-label text-center w-full mb-1">
    <p className="text-sm font-medium text-gray-900 print:text-black truncate">
      {item.item.name}  // ✅ Already using Item Name only
    </p>
  </div>
)}
```

**Status:** No changes needed - already correct.

### Task 0.4.2: Verify QRCodePrintManager Label Mapping ✅ (Confirmed Correct)

**File:** `src/components/QRCodePrintManager.tsx`

**Current Code (Line 622-628):**
```tsx
const selectedItemsData = items
  .filter(item => generatedQRCodes.has(item.id))
  .map(item => ({
    id: item.publicId,
    label: item.name  // ✅ Already using Item Name only
  }));
```

**Status:** No changes needed - already correct.

### Task 0.4.3: Verify PDF API Label Handling ✅ (Confirmed Correct)

**File:** `src/app/api/admin/generate-pdf/route.ts`

**Current Code (Lines 182-196):**
```tsx
const safeLabel = qr.name || qrAny.title || qrAny.label || qrAny.displayName || `QR Code ${index + 1}`;
// ...
return {
  id: safeId,
  label: safeLabel,  // ✅ Uses item.name from client
  imageData: safeImageData
};
```

**Status:** No changes needed - fallback chain correctly prioritizes `qr.name` (Item Name).

### Task 0.4.4: Verify PDF Generator Module Label Rendering ✅ (Confirmed Correct)

**File:** `src/lib/pdf_generator_module.js`

**Current Code (Lines 392-396):**
```javascript
const labelWidth = doc.widthOfString(qrData.label);
const labelX = qrX + (qrSize - labelWidth) / 2;
const labelY = qrY + qrSize + 8;
doc.text(qrData.label, labelX, labelY);  // ✅ Displays what it receives
```

**Status:** No changes needed - renders the label passed from API route.

### Task 0.4.5: Add Verification Test (Recommended)

**New File:** `src/components/__tests__/QRCodeLabelDisplay.test.tsx`

**Purpose:** Create a test to verify QR code labels display Item Name only, preventing regression.

```typescript
// Verify label displays Item Name only, not "Purpose - Item Name"
test('QR code label displays Item Name only', () => {
  const mockItem = {
    id: '123',
    name: 'Steamer',  // Item Name
    // Note: No purpose/article title should be concatenated
  };

  // Test that rendered label equals item.name exactly
  expect(screen.getByText('Steamer')).toBeInTheDocument();
  expect(screen.queryByText(/How to Clean/)).not.toBeInTheDocument();
});
```

---

## Authorized Files and Functions for Modification

### Primary Files (Already Verified - No Changes Needed)

| File | Function/Section | Purpose | Change Required |
|------|-----------------|---------|-----------------|
| `src/components/QRCodePrintPreview.tsx` | `VirtualizedQRItem` component, line 122 | Displays QR label in preview | ✅ None - correct |
| `src/components/QRCodePrintManager.tsx` | `renderStepContent()`, lines 622-628 | Maps item data for print | ✅ None - correct |
| `src/app/api/admin/generate-pdf/route.ts` | `POST()`, lines 182-196 | Creates PDF label data | ✅ None - correct |
| `src/lib/pdf_generator_module.js` | Label rendering, lines 392-396 | Renders label in PDF | ✅ None - correct |

### Test Files (New - Recommended)

| File | Purpose |
|------|---------|
| `src/components/__tests__/QRCodeLabelDisplay.test.tsx` | Regression test for label format |

---

## Dependencies

### Depends On (upstream)
- **Task 0.1** (Update MetadataStep Labels): Must establish "Item Name" terminology in the capture workflow
- **Task 0.2** (Update ReviewStep Labels): Must use "Item Name" consistently in review display

### Blocks (downstream)
- None - This is the final task in the Item Name clarification chain for QR codes

### Parallel Safety
- **Files touched:**
  - `src/components/QRCodePrintPreview.tsx` (verification only)
  - `src/components/QRCodePrintManager.tsx` (verification only)
  - `src/app/api/admin/generate-pdf/route.ts` (verification only)
  - `src/lib/pdf_generator_module.js` (verification only)
  - `src/components/__tests__/QRCodeLabelDisplay.test.tsx` (new file)

- **Conflicts with:** None - this task is verification-focused

- **Safe to parallelize with:**
  - Phase 1 tasks (Step Count Fix)
  - Phase 3 tasks (Dashboard Cards)
  - Phase 4 tasks (Navigation Menu)

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| No changes needed after investigation | HIGH | LOW | This is acceptable - confirms correct implementation |
| Label format regression in future | MEDIUM | MEDIUM | Add regression test (Task 0.4.5) |
| Edge case with missing item.name | LOW | MEDIUM | Fallback chain in API route handles gracefully |

---

## Testing Plan

### Verification Testing

1. **Print Preview Test**
   - [ ] Create a new item with name "Test Steamer"
   - [ ] Navigate to QR code print preview
   - [ ] Verify label displays "Test Steamer" only (not "How to Use - Test Steamer")

2. **PDF Export Test**
   - [ ] Generate PDF with multiple QR codes
   - [ ] Verify each label shows Item Name only
   - [ ] Verify labels are properly centered under QR codes

3. **Mobile Preview Test**
   - [ ] View print preview on mobile device
   - [ ] Verify labels are readable and properly sized
   - [ ] Verify no Purpose prefix appears

---

## Implementation Summary

**Outcome:** After thorough investigation, the QR code label display is **already correctly implemented** to show Item Name only.

**Findings:**
1. `QRCodePrintPreview.tsx` uses `item.item.name` ✅
2. `QRCodePrintManager.tsx` maps labels from `item.name` ✅
3. PDF API route uses `qr.name` as primary label source ✅
4. PDF generator module renders labels as received ✅

**Recommended Action:**
1. Mark this task as complete after verification testing
2. Add regression test (Task 0.4.5) to prevent future changes from introducing "Purpose - Item Name" format

---

## References

- Source Request: `docs/gen_requests.md` - REQ-184
- Implementation Plan: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md`
- QR Code Hook: `src/hooks/useQRCodeGeneration.ts`
- Print Preview: `src/components/QRCodePrintPreview.tsx`
- Print Manager: `src/components/QRCodePrintManager.tsx`
- PDF API Route: `src/app/api/admin/generate-pdf/route.ts`
- PDF Generator: `src/lib/pdf_generator_module.js`
- Data Types: `src/types/index.ts`
