# REQ-163: Audit All Content Input Screens - Detailed Task Breakdown

**Document Generated:** 2026-01-09 22:45 UTC
**Last Modified:** 2026-01-09 22:45 UTC
**Request ID:** REQ-163
**Phase:** 4 - Remove Duplicate Navigation
**Task ID:** 4.1
**Overview Document:** `/docs/REQ-163-audit-all-content-input-screens-overview.md`
**Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## Executive Summary

This detailed task breakdown transforms the REQ-163 overview into actionable, granular implementation tasks. The audit identifies navigation patterns across all content input screens to provide the foundation for navigation consolidation in subsequent tasks (4.2-4.4).

**Note:** Based on the overview analysis, this audit task (REQ-163) is already substantially complete. The overview document contains the comprehensive audit findings. The tasks below formalize the verification and documentation completion process.

---

## Pre-Implementation Checklist

- [x] Overview document read and understood
- [x] Implementation Plan (Plan-094) Phase 4 requirements reviewed
- [x] README.md project conventions reviewed
- [x] Source code for all target components examined
- [x] Authorized files list confirmed from overview

---

## Authorized Files and Functions for Modification

Per the overview document Section 5, the following files are authorized for this audit task:

| File | Modification Type | Line References |
|------|-------------------|-----------------|
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Review/Document | Lines 556-584 |
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Review/Document | Lines 708-733 |
| `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | Review/Document | No bottom nav |
| `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | Review/Document | Lines 966-991 |
| `src/components/ItemCapture/components/steps/UrlInputStep.tsx` | Review/Document | Lines 444-453 |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Review/Document | Action cards |

**Output Document:**
- `docs/REQ-163-audit-all-content-input-screens-detailed.md` (this document)

---

## Task Breakdown

### Task 1: Verify TextEditorStep Navigation Pattern

**Story Points:** < 1 (verification task)
**Status:** Audit Complete (per overview)

#### Description
Confirm and document the navigation pattern in TextEditorStep.tsx, verifying the overview findings are accurate.

#### Steps
1. Open `src/components/ItemCapture/components/steps/TextEditorStep.tsx`
2. Navigate to lines 556-584
3. Verify the following elements exist:
   - Back button with `handleBack()` callback
   - Continue/Skip button with `handleContinue()` callback
   - Dynamic label logic based on `localContent.trim()`
   - Disabled state when `isOverLimit` is true

#### Verification Checklist
- [ ] Back button present at lines 560-565
- [ ] Continue/Skip button present at lines 566-581
- [ ] Button styling matches documented pattern:
  - Back: `px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg`
  - Continue: Conditional styling based on content state
- [ ] Navigation target is `'add-more'` step
- [ ] Both handlers save pending content before navigation

#### Findings (from Overview)
```
Screen: TextEditorStep
Has Bottom Navigation: Yes
Navigation Type: Step Navigation
Elements: Back + Continue/Skip
Lines: 556-584
Logic: Continue saves pending content before navigation
```

---

### Task 2: Verify FileUploadStep Navigation Pattern

**Story Points:** < 1 (verification task)
**Status:** Audit Complete (per overview)

#### Description
Confirm and document the navigation pattern in FileUploadStep.tsx, verifying the overview findings are accurate.

#### Steps
1. Open `src/components/ItemCapture/components/steps/FileUploadStep.tsx`
2. Navigate to lines 708-733
3. Verify the following elements exist:
   - Back button with `handleBack()` callback
   - Continue/Skip button with `handleContinue()` callback
   - Dynamic label logic based on `hasFiles` state

#### Verification Checklist
- [ ] Back button present at lines 711-716
- [ ] Continue/Skip button present at lines 718-730
- [ ] Button styling matches documented pattern
- [ ] Navigation target is `'add-more'` step
- [ ] Simple navigation without save operations (files added immediately)

#### Findings (from Overview)
```
Screen: FileUploadStep
Has Bottom Navigation: Yes
Navigation Type: Step Navigation
Elements: Back + Continue/Skip
Lines: 708-733
Logic: Simple navigation (files are added immediately on upload)
```

---

### Task 3: Verify VideoCaptureStep Navigation Pattern

**Story Points:** < 1 (verification task)
**Status:** Audit Complete (per overview)

#### Description
Confirm that VideoCaptureStep does NOT have traditional bottom navigation, using mode-based camera controls instead.

#### Steps
1. Open `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx`
2. Search for "Step Navigation" comment or similar navigation pattern
3. Verify the component uses mode-based controls instead:
   - Camera Controls (Preview/Recording Mode)
   - Review Mode Controls (lines 649-694)
   - Error State Navigation

#### Verification Checklist
- [ ] NO traditional Back/Continue bottom navigation bar exists
- [ ] Camera controls present for preview/recording mode
- [ ] Review mode has Retake and Accept buttons (inline, not bottom bar)
- [ ] CameraPermissionFallback provides "Upload File" fallback option
- [ ] Keyboard: Escape key handles step-appropriate actions

#### Findings (from Overview)
```
Screen: VideoCaptureStep
Has Bottom Navigation: No
Navigation Type: Mode-based controls
Elements: Camera controls only
Logic: User must explicitly accept recorded video to proceed
```

---

### Task 4: Verify PhotoCaptureStep Navigation Pattern

**Story Points:** < 1 (verification task)
**Status:** Audit Complete (per overview)

#### Description
Confirm and document the navigation pattern in PhotoCaptureStep.tsx, verifying the overview findings are accurate.

#### Steps
1. Open `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx`
2. Navigate to lines 966-991
3. Verify the following elements exist:
   - Back button with `handleBack()` callback
   - Continue/Skip button with `handleContinue()` callback
   - Dynamic label logic based on `capturedPhotos.length`

#### Verification Checklist
- [ ] Back button present at lines 969-974
- [ ] Continue/Skip button present at lines 976-988
- [ ] Button styling matches documented pattern
- [ ] Navigation target is `'add-more'` step
- [ ] handleBack stops camera before calling prevStep()
- [ ] Additional navigation exists in Review Mode (lines 765-810) and Gallery Mode (lines 679-739)

#### Findings (from Overview)
```
Screen: PhotoCaptureStep
Has Bottom Navigation: Yes
Navigation Type: Step Navigation
Elements: Back + Continue/Skip
Lines: 966-991
Logic: Stops camera on back navigation
Additional: Review mode has Retake/Accept (inline), Gallery has Close/Delete/Prev/Next (overlay)
```

---

### Task 5: Verify UrlInputStep Navigation Pattern

**Story Points:** < 1 (verification task)
**Status:** Audit Complete (per overview)

#### Description
Confirm and document the partial navigation pattern in UrlInputStep.tsx, which only has a Back button.

#### Steps
1. Open `src/components/ItemCapture/components/steps/UrlInputStep.tsx`
2. Navigate to lines 444-453
3. Verify the navigation elements:
   - Back button only (no Continue)
   - Navigation happens through "Add Link" buttons in preview/form

#### Verification Checklist
- [ ] Back button present at lines 444-453
- [ ] NO Continue button in bottom navigation
- [ ] "Add Link" button exists within preview card
- [ ] "Add Link Anyway" button exists for proceed without preview
- [ ] Both link buttons navigate to `'add-more'` step
- [ ] Left-aligned back button styling differs slightly (uses gap-2, ArrowLeft icon)

#### Findings (from Overview)
```
Screen: UrlInputStep
Has Bottom Navigation: Partial (Back only)
Navigation Type: Back button only
Elements: Back (no Continue)
Lines: 444-453
Logic: Form submission pattern - Continue action embedded in "Add Link" buttons
```

---

### Task 6: Verify NextActionStep Navigation Pattern

**Story Points:** < 1 (verification task)
**Status:** Audit Complete (per overview)

#### Description
Confirm that NextActionStep uses action cards instead of traditional bottom navigation.

#### Steps
1. Open `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
2. Search for "Step Navigation" comment or bottom navigation patterns
3. Verify the component uses ActionCard components for navigation

#### Verification Checklist
- [ ] NO traditional bottom navigation bar exists
- [ ] ActionCard components used for navigation options (lines 237-270)
- [ ] Three action cards present:
  1. "Add More to This Item" (conditional - only if lastSavedItem exists AND content limit not reached)
  2. "Tag New Item" (always visible)
  3. "I'm Done" (always visible)
- [ ] handleDoneClick() may show EmptySessionDialog

#### Findings (from Overview)
```
Screen: NextActionStep
Has Bottom Navigation: No
Navigation Type: Action Cards
Elements: Card-based navigation
Lines: 237-270 (action cards)
Logic: Already follows clean pattern per Plan-094; needs Cancel confirmation dialog per Task 4.4
```

---

### Task 7: Create Navigation Pattern Summary Table

**Story Points:** < 1 (documentation task)
**Status:** Complete (in overview document Section 4)

#### Description
Document a summary table of all navigation patterns for stakeholder review.

#### Output Table (from Overview Section 4.1-4.2)

**Components WITH Bottom Navigation (Candidates for Modification in Task 4.2):**

| Component | Current Pattern | Navigation Elements | Recommended Action |
|-----------|----------------|---------------------|-------------------|
| TextEditorStep | Back + Continue/Skip buttons | Left: Back, Right: Continue/Skip | Keep inline, already integrated |
| FileUploadStep | Back + Continue/Skip buttons | Left: Back, Right: Continue/Skip | Keep inline, already integrated |
| PhotoCaptureStep | Back + Continue/Skip buttons | Left: Back, Right: Continue/Skip | Keep inline, already integrated |

**Components WITHOUT Bottom Navigation (No Changes Needed):**

| Component | Current Pattern | Notes |
|-----------|----------------|-------|
| VideoCaptureStep | Mode-based controls | Clean camera workflow |
| UrlInputStep | Back only + form actions | Form submission pattern |
| NextActionStep | Action cards | Already clean design |

---

### Task 8: Document Button Styling Consistency

**Story Points:** < 1 (documentation task)
**Status:** Complete (in overview document Section 4.3)

#### Description
Document the consistent styling patterns used across all navigation buttons.

#### Styling Patterns (from Overview Section 4.3)

```typescript
// Back Button (consistent across TextEditorStep, FileUploadStep, PhotoCaptureStep)
className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors
           focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"

// Continue/Skip Button (consistent across all)
className={cn(
  'px-6 py-2 rounded-lg transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  hasContent
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
)}
```

**UrlInputStep Back Button (slight variation):**
```typescript
className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900
           focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
```

#### Consistency Issues Identified
1. UrlInputStep uses `text-gray-700` instead of `text-gray-600`
2. UrlInputStep uses `focus:ring-cyan-500` instead of `focus:ring-gray-500`
3. UrlInputStep uses `rounded` instead of `rounded-lg`

---

### Task 9: Compile Recommendations for Task 4.2

**Story Points:** < 1 (documentation task)
**Status:** Complete (in overview document Section 6)

#### Description
Document recommendations for the navigation consolidation work in Task 4.2.

#### Recommendations (from Overview Section 6)

**Clarification Needed:**
The existing navigation in TextEditorStep, FileUploadStep, and PhotoCaptureStep appears to be **inline step navigation** (Back + Continue at the bottom of the component), NOT a separate "bottom navigation bar" that duplicates other navigation.

**Options for Task 4.2:**
1. Remove ALL bottom navigation from these components (requiring alternative navigation)
2. Keep inline Back/Continue but remove a separate bottom navigation bar (which doesn't currently exist)
3. Consolidate styling and ensure consistent button placement

**Current State Assessment:**
The components already follow a consistent pattern:
- Back button: Left-aligned, subtle styling
- Continue/Skip button: Right-aligned, primary styling when content exists

**Recommended Improvements for Task 4.2:**
1. Ensure buttons remain visible (not scrolled off) on mobile
2. Add Cancel confirmation to NextActionStep per Task 4.4
3. Consider adding Continue action to UrlInputStep for consistency

---

### Task 10: Final Verification and Sign-Off

**Story Points:** < 1 (verification task)
**Status:** Pending

#### Description
Final verification that all acceptance criteria are met and documentation is complete.

#### Acceptance Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| All content input screens with bottom navigation identified | Complete | See Tasks 1-6 |
| TextEditorStep confirmed in audit | Complete | Task 1 |
| FileUploadStep confirmed in audit | Complete | Task 2 |
| VideoCaptureStep confirmed in audit | Complete | Task 3 |
| PhotoCaptureStep confirmed in audit | Complete | Task 4 |
| UrlInputStep confirmed in audit | Complete | Task 5 |
| NextActionStep confirmed in audit | Complete | Task 6 |
| Navigation elements documented for each screen | Complete | Tasks 1-6 |
| Findings available for stakeholder review | Complete | This document + Overview |

#### Sign-Off Checklist
- [ ] All 6 screens audited and documented
- [ ] Navigation pattern summary table created (Task 7)
- [ ] Button styling consistency documented (Task 8)
- [ ] Recommendations for Task 4.2 compiled (Task 9)
- [ ] Overview document reviewed and accurate
- [ ] Detailed document reviewed and accurate

---

## Audit Summary

### Components WITH Bottom Step Navigation

| Component | File | Lines | Nav Elements | Content Logic |
|-----------|------|-------|--------------|---------------|
| TextEditorStep | `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | 556-584 | Back + Continue/Skip | `localContent.trim()` |
| FileUploadStep | `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | 708-733 | Back + Continue/Skip | `hasFiles` |
| PhotoCaptureStep | `src/components/ItemCapture/components/steps/PhotoCaptureStep.tsx` | 966-991 | Back + Continue/Skip | `capturedPhotos.length > 0` |
| UrlInputStep | `src/components/ItemCapture/components/steps/UrlInputStep.tsx` | 444-453 | Back only | Form submission pattern |

### Components WITHOUT Bottom Step Navigation

| Component | File | Navigation Type | Notes |
|-----------|------|-----------------|-------|
| VideoCaptureStep | `src/components/ItemCapture/components/steps/VideoCaptureStep.tsx` | Mode-based | Camera controls + Review mode |
| NextActionStep | `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | Action Cards | 3 card options |

---

## Dependencies

### Tasks That Depend on This Audit

| Task ID | Title | Dependency |
|---------|-------|------------|
| 4.2 | Remove Bottom Navigation from Content Screens | Uses this audit to identify which components need modification |
| 4.3 | Update Button Logic | Uses button styling patterns documented here |
| 4.4 | Fix NextActionStep | Confirms NextActionStep already lacks bottom navigation |

### Upstream Dependencies

| Dependency | Status |
|------------|--------|
| Overview document (REQ-163-overview.md) | Complete |
| Plan-094 Phase 4 requirements | Documented |

---

## Testing Requirements

### Accessibility Verification (for Task 4.2 planning)

For each screen with bottom navigation, the following accessibility attributes should be verified:

1. **Focus indicators** - All buttons have visible focus rings
2. **Keyboard navigation** - Tab order is logical
3. **Screen reader** - aria-live regions announce state changes
4. **Touch targets** - Buttons meet 48px minimum (verify during Task 4.2)

### Mobile Viewport Testing (for Task 4.2 planning)

Test navigation visibility on:
- 320px viewport width (small phones)
- 375px viewport width (iPhone SE)
- 390px viewport width (iPhone 14)
- Landscape orientations

---

## References

- **Overview Document:** `/docs/REQ-163-audit-all-content-input-screens-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`
- **Request:** `/docs/gen_requests.md` - REQ-163
- **Related Tasks:**
  - REQ-164: Remove Bottom Navigation from Content Screens (Task 4.2)
  - Plan-094 Task 4.3: Update Button Logic
  - Plan-094 Task 4.4: Fix NextActionStep (Add Cancel Confirmation)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-09 22:45 UTC | Senior Dev Agent | Initial detailed task breakdown |
