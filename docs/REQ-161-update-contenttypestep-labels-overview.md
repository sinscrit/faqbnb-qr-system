# REQ-161: Update ContentTypeStep Labels - Implementation Overview

**Generated:** 2026-01-09 22:30:00 UTC
**Last Modified:** 2026-01-09 22:30:00 UTC
**Request Number:** 161
**Plan Reference:** Plan-094-UI-UX-Workflow-Improvements.md (Phase 3, Task 3.2)
**Type:** ENHANCEMENT
**Size:** XS

---

## Summary

Update the ContentTypeStep component to display clearer labels with format hints. Specifically, add a subtitle "Video, Image, PDF, Text" beneath the "Upload File" option to inform users about supported file formats before they click through. This provides upfront clarity about what can be uploaded and reduces user confusion.

---

## Current State Analysis

### Current ContentTypeStep Options (ItemCreationWorkflow)

**Location:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

The component currently displays two sets of options based on `currentContentSource`:

**Existing Content Options (lines 63-69):**
```typescript
const EXISTING_CONTENT_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Upload Video', icon: Upload },
  { type: 'photo', label: 'Upload Photo', icon: ImageIcon },
  { type: 'pdf', label: 'Upload PDF', icon: FileText },
  { type: 'text', label: 'Paste Text', icon: Type },
  { type: 'url', label: 'Paste URL', icon: Link },
];
```

**Create New Options (lines 71-75):**
```typescript
const CREATE_NEW_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Record Video', icon: Video },
  { type: 'photo', label: 'Take Photo', icon: Camera },
  { type: 'text', label: 'Write Text', icon: PenLine },
];
```

### Current Interface Definition (lines 38-42)

```typescript
interface ContentTypeOption {
  type: ContentType;
  label: string;
  icon: LucideIcon;
}
```

**Note:** The interface currently lacks a `subtitle` or `description` field for format hints.

### Current Card Rendering (lines 147-155)

The `ContentTypeCard` component renders only the label:
```typescript
<span
  className={cn(
    'flex-1 text-left text-base sm:text-lg font-medium',
    isSelected ? 'text-blue-700' : 'text-gray-900'
  )}
>
  {option.label}
</span>
```

---

## Implementation Approach

### Target State

After implementation:
1. The `ContentTypeOption` interface includes an optional `subtitle` field
2. "Upload File" options include format hint subtitles
3. The `ContentTypeCard` component conditionally renders subtitles when present
4. Icons remain correctly aligned and visible
5. Mobile responsive layout is maintained

### Changes Required

The implementation involves **minimal changes** to add subtitle support:

1. **Add `subtitle` to interface** - Optional field for format hints
2. **Update option data** - Add subtitles to upload-related options
3. **Update card rendering** - Display subtitle below label when present

---

## Tasks

### Task 1: Update ContentTypeOption Interface

**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

**Changes:**
- [ ] Add optional `subtitle` field to `ContentTypeOption` interface (line ~38-42)

**Current Code:**
```typescript
interface ContentTypeOption {
  type: ContentType;
  label: string;
  icon: LucideIcon;
}
```

**New Code:**
```typescript
interface ContentTypeOption {
  type: ContentType;
  label: string;
  icon: LucideIcon;
  /** Optional subtitle for format hints */
  subtitle?: string;
}
```

---

### Task 2: Add Subtitles to Content Options

**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

**Changes:**
- [ ] Add subtitle to "Upload Video" option: "MP4, MOV, WebM"
- [ ] Add subtitle to "Upload Photo" option: "JPG, PNG, WebP"
- [ ] Add subtitle to "Upload PDF" option: "PDF documents"
- [ ] Add subtitle to "Paste Text" option (optional): "Plain text"
- [ ] Add subtitle to "Paste URL" option (optional): "Web links"

**Current Code (lines 63-69):**
```typescript
const EXISTING_CONTENT_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Upload Video', icon: Upload },
  { type: 'photo', label: 'Upload Photo', icon: ImageIcon },
  { type: 'pdf', label: 'Upload PDF', icon: FileText },
  { type: 'text', label: 'Paste Text', icon: Type },
  { type: 'url', label: 'Paste URL', icon: Link },
];
```

**New Code:**
```typescript
const EXISTING_CONTENT_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Upload Video', icon: Upload, subtitle: 'MP4, MOV, WebM' },
  { type: 'photo', label: 'Upload Photo', icon: ImageIcon, subtitle: 'JPG, PNG, WebP' },
  { type: 'pdf', label: 'Upload PDF', icon: FileText, subtitle: 'PDF documents' },
  { type: 'text', label: 'Paste Text', icon: Type },
  { type: 'url', label: 'Paste URL', icon: Link },
];
```

**Note:** The CREATE_NEW_OPTIONS array does not require subtitles as these are device capture actions, not file format selections.

---

### Task 3: Update ContentTypeCard Rendering

**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

**Changes:**
- [ ] Update `ContentTypeCardProps` interface to include subtitle (line ~81-86)
- [ ] Add subtitle rendering below label in ContentTypeCard (line ~147-155)
- [ ] Style subtitle with smaller, muted text

**Current ContentTypeCardProps (lines 81-86):**
```typescript
interface ContentTypeCardProps {
  option: ContentTypeOption;
  isSelected: boolean;
  onSelect: (type: ContentType) => void;
  tabIndex?: number;
}
```

**Current Label Section (lines 147-155):**
```typescript
{/* Label Section */}
<span
  className={cn(
    'flex-1 text-left text-base sm:text-lg font-medium',
    isSelected ? 'text-blue-700' : 'text-gray-900'
  )}
>
  {option.label}
</span>
```

**New Label Section:**
```typescript
{/* Label Section */}
<div className="flex-1 text-left">
  <span
    className={cn(
      'block text-base sm:text-lg font-medium',
      isSelected ? 'text-blue-700' : 'text-gray-900'
    )}
  >
    {option.label}
  </span>
  {option.subtitle && (
    <span
      className={cn(
        'block text-xs sm:text-sm mt-0.5',
        isSelected ? 'text-blue-500' : 'text-gray-500'
      )}
    >
      {option.subtitle}
    </span>
  )}
</div>
```

---

### Task 4: Update CONTENT_SOURCE_OPTIONS in Constants (Optional Enhancement)

**File:** `/src/components/ItemCreationWorkflow/utils/constants.ts`

**Note:** This task is optional but recommended for consistency if `CONTENT_SOURCE_OPTIONS` is used elsewhere.

**Changes:**
- [ ] Review if `CONTENT_SOURCE_OPTIONS` (lines 150-163) needs format hint updates
- [ ] If used for display, add subtitle/description support

**Current Code (lines 150-163):**
```typescript
export const CONTENT_SOURCE_OPTIONS = {
  existing: {
    video: 'Upload Video',
    photo: 'Upload Photo',
    pdf: 'Upload PDF',
    text: 'Paste Text',
    url: 'Paste URL',
  },
  'create-new': {
    video: 'Record Video',
    photo: 'Take Photo',
    text: 'Write Text',
  },
} as const;
```

**Recommendation:** Leave unchanged unless other components use this constant for label display. The ContentTypeStep component uses its own inline options arrays.

---

### Task 5: Verify Icon Alignment

**File:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

**Changes:**
- [ ] Verify icon container maintains proper sizing with subtitle text
- [ ] Ensure flex alignment remains correct (`items-center`)
- [ ] Test that icons don't shift when subtitle is present

**Current Icon Section (lines 129-145):**
```typescript
{/* Icon Section */}
<div
  className={cn(
    'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12',
    'flex items-center justify-center',
    'rounded-lg',
    isSelected ? 'bg-blue-100' : 'bg-gray-100'
  )}
>
  <Icon
    className={cn(
      'w-5 h-5 sm:w-6 sm:h-6',
      isSelected ? 'text-blue-600' : 'text-gray-500'
    )}
    aria-hidden="true"
  />
</div>
```

**Note:** The icon section should remain unchanged. The flex layout with `items-center` will automatically handle vertical alignment with the new label+subtitle structure.

---

### Task 6: Verify Mobile Responsiveness

**Changes:**
- [ ] Test on mobile viewport (320px width)
- [ ] Verify subtitle text doesn't overflow card width
- [ ] Verify touch targets remain accessible (48px minimum)
- [ ] Confirm text is readable at smaller sizes

**Testing Steps:**
1. Open browser DevTools
2. Set viewport to mobile sizes (320px, 375px, 414px)
3. Navigate to content type step
4. Verify labels and subtitles display correctly
5. Verify cards remain touch-friendly

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File Path | Modification Type | Specific Changes |
|-----------|------------------|------------------|
| `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | MODIFY | Add `subtitle` field to interface, update options data, update card rendering |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `CONTENT_SOURCE_OPTIONS` not used for display in ContentTypeStep |
| `src/components/ItemCapture/components/steps/ContentTypeStep.tsx` | Different component in ItemCapture module - separate enhancement if needed |

### Functions/Components to Modify

| Location | Component/Interface | Change |
|----------|---------------------|--------|
| `ContentTypeStep.tsx:38-42` | `ContentTypeOption` interface | Add optional `subtitle` field |
| `ContentTypeStep.tsx:63-69` | `EXISTING_CONTENT_OPTIONS` | Add subtitle values for upload options |
| `ContentTypeStep.tsx:88-166` | `ContentTypeCard` | Update to render subtitle when present |

---

## Testing Requirements

### Manual Testing Checklist

- [ ] Navigate to ContentTypeStep with "existing" content source
- [ ] Verify "Upload Video" shows subtitle "MP4, MOV, WebM"
- [ ] Verify "Upload Photo" shows subtitle "JPG, PNG, WebP"
- [ ] Verify "Upload PDF" shows subtitle "PDF documents"
- [ ] Verify "Paste Text" and "Paste URL" display without subtitles
- [ ] Verify icons remain properly aligned with text
- [ ] Verify selection state styling applies to both label and subtitle
- [ ] Test on mobile viewport sizes (320px, 375px, 414px)
- [ ] Verify keyboard navigation still works correctly
- [ ] Navigate to ContentTypeStep with "create-new" content source
- [ ] Verify options display correctly without subtitles

### Automated Verification

```bash
# Type checking
npm run type-check

# Lint
npm run lint

# Build verification
npm run build
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Text overflow on mobile | Low | Medium | Use text truncation or line wrapping CSS |
| Breaking existing card layout | Low | Medium | Test thoroughly before committing |
| Accessibility regression | Low | Medium | Verify screen reader announces subtitle |
| Inconsistent styling | Low | Low | Follow existing color scheme (blue-500 for selected, gray-500 for unselected) |

---

## Dependencies

- **Follows Task 3.1:** Remove ContentSourceStep (REQ-160) - This task modifies the same step flow
- **Independent of Task 3.3:** Consolidate Content Options - Different enhancement

---

## Acceptance Criteria (from REQ-161)

- [ ] "Upload File" label remains visible as the primary heading for the upload content type
- [ ] Subtitle text "Video, Image, PDF, Text" (or format-specific hints) appears beneath the upload file label
- [ ] Content type selection options display format hints indicating supported file types
- [ ] Existing icon graphics remain properly aligned and visible
- [ ] Label changes do not break mobile responsive layout
- [ ] All text follows application typography and accessibility standards

---

## References

- **Request:** `/docs/gen_requests.md` - REQ-161
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` - Phase 3, Task 3.2
- **Current Component:** `/src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
- **Related Request:** REQ-160 - Remove ContentSourceStep (Phase 3, Task 3.1)
- **ItemCapture ContentTypeStep:** `/src/components/ItemCapture/components/steps/ContentTypeStep.tsx` (different component)
