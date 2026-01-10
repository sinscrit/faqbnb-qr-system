# REQ-161: Update ContentTypeStep Labels - Detailed Task Breakdown

**Generated:** 2026-01-09 22:45:00 UTC
**Last Modified:** 2026-01-09 22:45:00 UTC
**Request Number:** 161
**Phase:** 3 - Remove Redundant Step & Update Labels
**Task ID:** 3.2
**Overview Document:** `/docs/REQ-161-update-contenttypestep-labels-overview.md`
**Plan Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
**Type:** ENHANCEMENT
**Size:** XS
**Estimated Story Points:** 2-3

---

## Executive Summary

This document provides granular, implementation-ready tasks for updating the `ContentTypeStep` component to display clearer labels with format hints. The enhancement adds optional subtitle support to content type cards, allowing users to see supported file formats (e.g., "MP4, MOV, WebM") directly beneath the primary label without clicking through.

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Overview document reviewed: `/docs/REQ-161-update-contenttypestep-labels-overview.md`
- [ ] Current component code reviewed: `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
- [ ] Development server running locally (`npm run dev`)
- [ ] Git working tree clean or changes stashed

---

## Authorized Files for Modification

| File Path | Modification Type |
|-----------|------------------|
| `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx` | MODIFY |

### Files NOT to Modify

| File Path | Reason |
|-----------|--------|
| `src/components/ItemCreationWorkflow/utils/constants.ts` | `CONTENT_SOURCE_OPTIONS` not used for display rendering |
| `src/components/ItemCapture/components/steps/ContentTypeStep.tsx` | Different module - separate enhancement if needed |

---

## Task Breakdown

### Task 1: Add `subtitle` Field to ContentTypeOption Interface

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Lines:** 38-42

#### Description
Extend the `ContentTypeOption` interface to include an optional `subtitle` field for displaying format hints beneath the primary label.

#### Current Code (lines 38-42)
```typescript
interface ContentTypeOption {
  type: ContentType;
  label: string;
  icon: LucideIcon;
}
```

#### Implementation Steps

1. **Open file** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

2. **Locate the interface** at lines 38-42 (search for `interface ContentTypeOption`)

3. **Add optional subtitle field** with JSDoc comment:
```typescript
interface ContentTypeOption {
  type: ContentType;
  label: string;
  icon: LucideIcon;
  /** Optional subtitle for format hints (e.g., "MP4, MOV, WebM") */
  subtitle?: string;
}
```

#### Verification Steps

- [ ] TypeScript compiler shows no errors: `npm run type-check`
- [ ] Existing code using `ContentTypeOption` still compiles (no breaking changes)
- [ ] Field is optional (existing usages without subtitle work)

#### Acceptance Criteria
- [ ] `subtitle` field added as optional string
- [ ] JSDoc comment explains the field's purpose
- [ ] No TypeScript compilation errors

---

### Task 2: Add Subtitles to EXISTING_CONTENT_OPTIONS Array

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Lines:** 63-69

#### Description
Add format hint subtitles to the upload-related content type options. These subtitles inform users about supported file formats before they select an option.

#### Current Code (lines 63-69)
```typescript
const EXISTING_CONTENT_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Upload Video', icon: Upload },
  { type: 'photo', label: 'Upload Photo', icon: ImageIcon },
  { type: 'pdf', label: 'Upload PDF', icon: FileText },
  { type: 'text', label: 'Paste Text', icon: Type },
  { type: 'url', label: 'Paste URL', icon: Link },
];
```

#### Implementation Steps

1. **Locate the constant** at lines 63-69 (search for `EXISTING_CONTENT_OPTIONS`)

2. **Add subtitle property** to each upload-type option:
```typescript
const EXISTING_CONTENT_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Upload Video', icon: Upload, subtitle: 'MP4, MOV, WebM' },
  { type: 'photo', label: 'Upload Photo', icon: ImageIcon, subtitle: 'JPG, PNG, WebP' },
  { type: 'pdf', label: 'Upload PDF', icon: FileText, subtitle: 'PDF documents' },
  { type: 'text', label: 'Paste Text', icon: Type },
  { type: 'url', label: 'Paste URL', icon: Link },
];
```

#### Design Decisions
- **Video formats:** MP4, MOV, WebM - common web-supported video formats
- **Photo formats:** JPG, PNG, WebP - standard image formats
- **PDF:** "PDF documents" - concise descriptor
- **Text/URL:** No subtitle needed - these are self-explanatory input types

#### Verification Steps

- [ ] TypeScript compiler shows no errors: `npm run type-check`
- [ ] Array structure remains valid
- [ ] Format strings are accurate to actual supported formats

#### Acceptance Criteria
- [ ] Video option shows subtitle "MP4, MOV, WebM"
- [ ] Photo option shows subtitle "JPG, PNG, WebP"
- [ ] PDF option shows subtitle "PDF documents"
- [ ] Text and URL options have no subtitle (intentional)

---

### Task 3: Update CREATE_NEW_OPTIONS Array (Optional Enhancement)

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Lines:** 71-75

#### Description
Optionally add helpful subtitles to the "create new" content type options. These can provide additional context about each capture method.

#### Current Code (lines 71-75)
```typescript
const CREATE_NEW_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Record Video', icon: Video },
  { type: 'photo', label: 'Take Photo', icon: Camera },
  { type: 'text', label: 'Write Text', icon: PenLine },
];
```

#### Implementation Steps (OPTIONAL)

1. **Decide if subtitles are needed** - The overview document indicates CREATE_NEW_OPTIONS do not require subtitles as these are device capture actions

2. **If subtitles are desired**, add contextual hints:
```typescript
const CREATE_NEW_OPTIONS: ContentTypeOption[] = [
  { type: 'video', label: 'Record Video', icon: Video, subtitle: 'Use camera' },
  { type: 'photo', label: 'Take Photo', icon: Camera, subtitle: 'Use camera' },
  { type: 'text', label: 'Write Text', icon: PenLine, subtitle: 'Type content' },
];
```

3. **Recommended approach:** Leave unchanged (no subtitles for create-new options)

#### Verification Steps

- [ ] TypeScript compiler shows no errors: `npm run type-check`
- [ ] If unchanged, verify no regressions in create-new flow

#### Acceptance Criteria
- [ ] CREATE_NEW_OPTIONS works correctly with or without subtitles
- [ ] Decision documented (add or skip subtitles)

---

### Task 4: Update ContentTypeCard Rendering to Display Subtitles

**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Lines:** 147-155

#### Description
Modify the `ContentTypeCard` component's label rendering section to conditionally display subtitles when present. The subtitle should appear below the main label in smaller, muted text.

#### Current Code (lines 147-155)
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

#### Implementation Steps

1. **Locate the Label Section** at lines 147-155 (search for `{/* Label Section */}`)

2. **Replace the `<span>` with a `<div>` container** that holds both label and optional subtitle:
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

#### Key Implementation Notes

1. **Container change:** `<span>` → `<div>` to allow block-level children
2. **Label span:** Add `block` class for proper stacking
3. **Subtitle span:**
   - Conditional rendering with `{option.subtitle && ...}`
   - Smaller text: `text-xs sm:text-sm`
   - Vertical spacing: `mt-0.5`
   - Color states: `text-blue-500` (selected) / `text-gray-500` (unselected)
4. **Flex behavior:** `flex-1 text-left` preserved on container

#### Verification Steps

- [ ] TypeScript compiler shows no errors: `npm run type-check`
- [ ] ESLint shows no errors: `npm run lint`
- [ ] Component renders without runtime errors

#### Acceptance Criteria
- [ ] Label text displays correctly
- [ ] Subtitle displays below label when present
- [ ] Subtitle hidden when not present (no empty space)
- [ ] Selection state colors apply to both label and subtitle
- [ ] Layout maintains proper alignment with icon and checkmark

---

### Task 5: Verify Icon and Checkmark Alignment

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
**Lines:** 129-165

#### Description
Verify that the icon section (left) and checkmark indicator (right) remain properly aligned after adding the subtitle. The flex container with `items-center` should handle vertical centering automatically.

#### Verification Steps

1. **Start development server:** `npm run dev`

2. **Navigate to content type step** in the workflow (select "existing" content source)

3. **Visual inspection checklist:**
   - [ ] Icon container (left) vertically centered with label text
   - [ ] Icon size unchanged (w-10 h-10 sm:w-12 sm:h-12)
   - [ ] Label text properly aligned with icon
   - [ ] Subtitle text appears directly below label
   - [ ] Checkmark (right) appears on selected cards
   - [ ] Checkmark vertically centered with content

4. **Compare cards with and without subtitles:**
   - [ ] Cards without subtitles (Text, URL) have same vertical alignment
   - [ ] Cards with subtitles (Video, Photo, PDF) have consistent layout
   - [ ] No visual "jumping" between card types

#### Current Icon Section (lines 129-145) - NO CHANGES NEEDED
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

#### Acceptance Criteria
- [ ] Icon alignment unchanged
- [ ] Checkmark alignment unchanged
- [ ] Visual consistency across all content type cards
- [ ] No layout shifts when selecting/deselecting cards

---

### Task 6: Verify Mobile Responsiveness

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

#### Description
Test the updated ContentTypeStep component on mobile viewport sizes to ensure subtitles display correctly and don't cause layout issues on smaller screens.

#### Testing Steps

1. **Open browser DevTools** (Chrome: F12 or Cmd+Option+I)

2. **Enable device toolbar** (Cmd+Shift+M or toggle device icon)

3. **Test at mobile breakpoints:**

   | Device | Width | Expected Behavior |
   |--------|-------|-------------------|
   | Small mobile | 320px | Single column, text wraps if needed |
   | iPhone SE | 375px | Single column, subtitles visible |
   | iPhone 12/13 | 390px | Single column, comfortable layout |
   | iPhone 12 Pro Max | 428px | Single column, ample spacing |
   | Tablet (640px+) | 640px | Two columns, subtitles visible |

4. **Verification checklist for each viewport:**
   - [ ] Subtitle text visible and readable
   - [ ] No horizontal overflow/scrolling
   - [ ] Touch targets remain accessible (48px minimum height)
   - [ ] Card spacing consistent
   - [ ] Selection state clearly visible
   - [ ] Text doesn't truncate unexpectedly

5. **Test interaction on mobile:**
   - [ ] Tap to select works correctly
   - [ ] Selection feedback visible
   - [ ] Auto-advance behavior works

#### Acceptance Criteria
- [ ] Subtitles display correctly at 320px width
- [ ] No text overflow or horizontal scrolling
- [ ] Touch targets meet 48px minimum (min-h-[80px] on cards)
- [ ] Layout responsive from 320px to desktop

---

### Task 7: Verify Accessibility

**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

#### Description
Verify that the subtitle addition maintains accessibility standards, including screen reader support and keyboard navigation.

#### Testing Steps

1. **Screen reader testing:**
   - [ ] VoiceOver (Mac): Enable with Cmd+F5
   - [ ] Navigate to content type cards
   - [ ] Verify screen reader announces both label AND subtitle
   - [ ] Verify selection state is announced

2. **Keyboard navigation testing:**
   - [ ] Tab to content type cards
   - [ ] Use arrow keys to navigate between cards
   - [ ] Press Enter/Space to select
   - [ ] Verify focus indicator visible
   - [ ] Verify selection works via keyboard

3. **Color contrast verification:**
   - [ ] Subtitle text (`text-gray-500`) meets WCAG AA contrast (4.5:1)
   - [ ] Selected subtitle (`text-blue-500`) meets contrast requirements
   - [ ] Use browser accessibility tools to verify

4. **ARIA attributes verification:**
   - [ ] `role="radiogroup"` on container
   - [ ] `role="radio"` on each card
   - [ ] `aria-checked` reflects selection state
   - [ ] `aria-label` or text content describes option

#### Acceptance Criteria
- [ ] Screen readers announce label and subtitle
- [ ] Keyboard navigation unaffected
- [ ] Color contrast meets WCAG AA standards
- [ ] ARIA attributes properly configured

---

### Task 8: Run Automated Verification

**Story Points:** 0.25
**File:** N/A (project-wide)

#### Description
Run automated checks to ensure the changes don't introduce type errors, linting issues, or build failures.

#### Commands to Run

```bash
# 1. TypeScript type checking
npm run type-check

# 2. ESLint linting
npm run lint

# 3. Production build verification
npm run build
```

#### Expected Results

1. **Type check:** No errors related to ContentTypeStep or ContentTypeOption
2. **Lint:** No new warnings or errors
3. **Build:** Successful compilation

#### Troubleshooting

| Issue | Likely Cause | Resolution |
|-------|--------------|------------|
| Type error on `subtitle` | Interface not updated | Complete Task 1 |
| Lint error on JSX structure | Improper nesting | Verify div/span structure in Task 4 |
| Build failure | Syntax error | Check for missing commas, brackets |

#### Acceptance Criteria
- [ ] `npm run type-check` passes with no errors
- [ ] `npm run lint` passes with no new errors
- [ ] `npm run build` completes successfully

---

### Task 9: Manual End-to-End Testing

**Story Points:** 0.25
**File:** N/A (runtime testing)

#### Description
Perform complete manual testing of the ContentTypeStep with the new subtitles to ensure the feature works as expected in the full workflow context.

#### Test Scenarios

**Scenario 1: Existing Content Flow**
1. Start new item creation workflow
2. Select any room
3. Select any item type
4. Select any specific item
5. Select "I have existing content" (or proceed to content source)
6. **Verify ContentTypeStep displays:**
   - [ ] "Upload Video" with subtitle "MP4, MOV, WebM"
   - [ ] "Upload Photo" with subtitle "JPG, PNG, WebP"
   - [ ] "Upload PDF" with subtitle "PDF documents"
   - [ ] "Paste Text" with no subtitle
   - [ ] "Paste URL" with no subtitle

**Scenario 2: Create New Content Flow**
1. Navigate to ContentTypeStep with "create-new" content source
2. **Verify ContentTypeStep displays:**
   - [ ] "Record Video" (no subtitle or appropriate subtitle)
   - [ ] "Take Photo" (no subtitle or appropriate subtitle)
   - [ ] "Write Text" (no subtitle or appropriate subtitle)

**Scenario 3: Selection Behavior**
1. Click on "Upload Video" card
2. **Verify:**
   - [ ] Card highlights with blue border
   - [ ] Label changes to blue-700
   - [ ] Subtitle changes to blue-500
   - [ ] Auto-advance triggers after 150ms

**Scenario 4: Visual Consistency**
1. Compare cards side-by-side
2. **Verify:**
   - [ ] Icon alignment consistent across all cards
   - [ ] Text baseline alignment looks natural
   - [ ] Cards have equal heights when subtitles present

#### Acceptance Criteria
- [ ] All existing content options display correct subtitles
- [ ] Create-new options display correctly (with or without subtitles)
- [ ] Selection behavior unchanged
- [ ] Visual layout consistent and professional

---

## Post-Implementation Checklist

After completing all tasks:

- [ ] All 9 tasks marked complete
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manual testing complete on desktop
- [ ] Manual testing complete on mobile (or DevTools emulation)
- [ ] Accessibility verified (keyboard + screen reader)
- [ ] No console errors in browser DevTools

---

## Rollback Plan

If issues are discovered after deployment:

1. **Revert the single file change:**
   ```bash
   git checkout HEAD~1 -- src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx
   ```

2. **Verify revert:**
   ```bash
   npm run build && npm run type-check
   ```

3. **Document issues** for investigation

---

## Summary of Changes

| Location | Change | Lines Affected |
|----------|--------|----------------|
| `ContentTypeOption` interface | Add `subtitle?: string` | ~38-42 |
| `EXISTING_CONTENT_OPTIONS` | Add subtitle values | ~63-69 |
| `ContentTypeCard` label section | Render subtitle conditionally | ~147-155 |

**Total Lines Changed:** ~20-25 lines
**Risk Level:** Low (additive change, no breaking modifications)

---

## References

- **Request:** `/docs/gen_requests.md` - REQ-161
- **Overview:** `/docs/REQ-161-update-contenttypestep-labels-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` - Phase 3, Task 3.2
- **Component:** `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`
- **Related Request:** REQ-160 - Remove ContentSourceStep (Phase 3, Task 3.1)
