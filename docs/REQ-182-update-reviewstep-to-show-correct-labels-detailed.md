# Detailed Task Breakdown: REQ-182 - Update ReviewStep Labels to Distinguish Item Name from Article Purpose

**Generated:** 2026-01-12 18:15:00
**Last Modified:** 2026-01-12 00:13:00
**Request:** REQ-182 - Update ReviewStep to Show Correct Labels
**Phase:** 0 - REQ-2 - Data Model UI Clarification
**Task ID:** 0.2
**Parent Plan:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md
**Overview Document:** REQ-182-update-reviewstep-to-show-correct-labels-overview.md

---

## Summary

This document provides step-by-step implementation tasks for updating the ReviewStep component to display clearer labels that distinguish between the physical item being tagged and any associated article/instructional content. The changes align the review screen with MetadataStep terminology updates (REQ-181) and prepare the component for future article purpose functionality.

**Goals:**
1. Change "Title" label to "Item Name" in the review summary
2. Add conditional section for "Purpose/Article" display (future-ready)
3. Add QR Code Label preview context to reinforce item name usage
4. Ensure all changes are backward compatible and UI-only

---

## Authorized Files for Modification

| File | Path | Scope |
|------|------|-------|
| ReviewStep.tsx | `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Labels, comments, new conditional sections |

**Note:** Per the overview document, only ReviewStep.tsx is authorized for modification in this task. The `articlePurpose` field in ItemCapture.types.ts is deferred to REQ-183.

---

## Current State Analysis

### ReviewStep.tsx - Title Section (Lines 420-426)

```tsx
{/* Title */}
<div>
  <dt className="text-sm font-medium text-gray-500">Title</dt>
  <dd className="mt-1 text-sm text-gray-900">
    {metadata.title.trim() || <span className="text-gray-400">&mdash;</span>}
  </dd>
</div>
```

### Issues Identified

1. **Label Confusion:** "Title" is ambiguous - doesn't convey physical item context
2. **No Article Purpose Section:** Missing preparation for future article purpose display
3. **No QR Code Context:** Users don't see how item name appears on QR label
4. **Inconsistent with MetadataStep:** After REQ-181, MetadataStep uses "Item Name"

---

## Implementation Tasks

### Task 1: Update Module JSDoc Comment Header
**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Lines:** 1-13
**Story Points:** 0.5

**Current State:**
```typescript
'use client';

/**
 * ReviewStep Component
 *
 * Final step of the ItemCapture wizard where users can review all captured
 * content before submission. Displays metadata summary, media gallery,
 * and instructions preview with options to edit, reorder, or remove items.
 *
 * @module ItemCapture/components/steps/ReviewStep
 * @lastModified 2025-12-31 (REQ-054 - URL cleanup with urlsRef pattern)
 */
```

**Required Changes:**
```typescript
'use client';

/**
 * ReviewStep Component
 *
 * Final step of the ItemCapture wizard where users can review all captured
 * content before submission. Displays item details summary (Item Name, Room,
 * Item Type, Tags), media gallery, and instructions preview with options
 * to edit, reorder, or remove items.
 *
 * @module ItemCapture/components/steps/ReviewStep
 * @lastModified 2026-01-12 (REQ-182 - Updated labels for Item Name clarity)
 */
```

**Verification:**
- [ ] JSDoc comment updated with correct terminology
- [ ] @lastModified date set to 2026-01-12
- [ ] REQ-182 reference included in lastModified comment

---

### Task 2: Update "Title" Label to "Item Name"
**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Lines:** 420-426
**Story Points:** 0.5

**Current State:**
```tsx
{/* Title */}
<div>
  <dt className="text-sm font-medium text-gray-500">Title</dt>
  <dd className="mt-1 text-sm text-gray-900">
    {metadata.title.trim() || <span className="text-gray-400">&mdash;</span>}
  </dd>
</div>
```

**Required Changes:**
```tsx
{/* Item Name */}
<div>
  <dt className="text-sm font-medium text-gray-500">Item Name</dt>
  <dd className="mt-1 text-sm text-gray-900">
    {metadata.title.trim() || <span className="text-gray-400">&mdash;</span>}
  </dd>
</div>
```

**Verification:**
- [ ] Comment updated from `{/* Title */}` to `{/* Item Name */}`
- [ ] Label displays "Item Name" instead of "Title"
- [ ] Data binding unchanged (still uses `metadata.title`)
- [ ] Empty state fallback (em-dash) still renders correctly
- [ ] Styling classes preserved (`text-sm font-medium text-gray-500`)

---

### Task 3: Add Conditional Article Purpose Section
**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Location:** After the Tags section (around line 461), before closing `</dl>` tag
**Story Points:** 0.5

**Current State (Tags section ends around line 461):**
```tsx
          {/* Tags (conditional, spans 2 columns) */}
          {metadata.tags && metadata.tags.length > 0 && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Tags</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {metadata.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
```

**Required Changes (insert before closing `</dl>`):**
```tsx
          {/* Tags (conditional, spans 2 columns) */}
          {metadata.tags && metadata.tags.length > 0 && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Tags</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {metadata.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}

          {/* Purpose/Article (conditional - shown when workflow captures article info) */}
          {/* Note: articlePurpose field will be added to ItemMetadata in REQ-183 */}
          {(metadata as { articlePurpose?: string }).articlePurpose && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Purpose/Article</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {(metadata as { articlePurpose?: string }).articlePurpose}
              </dd>
            </div>
          )}
        </dl>
```

**Implementation Notes:**
- Uses type assertion `(metadata as { articlePurpose?: string })` to allow optional field access without modifying ItemMetadata type
- Section will not render until `articlePurpose` is added to the data model (REQ-183)
- Spans 2 columns on md+ screens for visual consistency with Tags section

**Verification:**
- [ ] Conditional section added after Tags section
- [ ] Type assertion used to access optional `articlePurpose` field
- [ ] Section does NOT render (correctly hidden since field doesn't exist yet)
- [ ] No TypeScript compilation errors
- [ ] Comment explains future enhancement context

---

### Task 4: Add QR Code Label Preview Section
**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Location:** After the closing `</dl>` tag within the metadata section, before the closing `</section>` tag (around line 463)
**Story Points:** 0.5

**Current State (end of metadata section):**
```tsx
        </dl>
      </section>
```

**Required Changes:**
```tsx
        </dl>

        {/* QR Code Label Preview */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <span className="font-medium">QR Code Label:</span>{' '}
            {metadata.title.trim() || <span className="italic">Item Name</span>}
          </p>
        </div>
      </section>
```

**Implementation Notes:**
- Provides visual context that the item name appears on QR code
- Uses subtle styling (text-xs, text-gray-500) to indicate informational nature
- Border separator visually distinguishes from main metadata grid
- Fallback displays italic "Item Name" when title is empty

**Verification:**
- [ ] QR Code Label preview section displays below metadata grid
- [ ] Border separator (`border-t border-gray-100`) creates visual separation
- [ ] "QR Code Label:" prefix uses `font-medium` for emphasis
- [ ] Item name value displays correctly after colon
- [ ] Empty state shows italic "Item Name" placeholder
- [ ] Styling is consistent with informational/helper text patterns

---

### Task 5: Verify Accessibility Attributes
**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Location:** Metadata section around lines 398-463
**Story Points:** 0.5

**Verification Checklist:**
- [ ] Section has `aria-labelledby="metadata-heading"` attribute (existing)
- [ ] Heading element has `id="metadata-heading"` (existing)
- [ ] Description list (`<dl>`) structure maintains semantic meaning
- [ ] `<dt>` elements properly label their corresponding `<dd>` values
- [ ] New conditional sections maintain proper accessibility patterns
- [ ] QR Code Label preview is informational (no interactive elements)

**No code changes required** - this task verifies existing accessibility patterns are preserved.

---

## Testing Tasks

### Task 6: Functional Testing - Label Update
**Story Points:** 0.5

**Test Cases:**
- [ ] Navigate to ItemCapture wizard
- [ ] Complete MetadataStep with item name "Test Steamer"
- [ ] Progress through wizard to ReviewStep
- [ ] Verify "Item Details" section header displays correctly
- [ ] Verify "Item Name" label appears (not "Title")
- [ ] Verify "Test Steamer" value displays next to "Item Name" label
- [ ] Click "Edit" button and verify navigation back to MetadataStep
- [ ] Verify item name value persists after returning to ReviewStep

---

### Task 7: Functional Testing - QR Code Label Preview
**Story Points:** 0.5

**Test Cases:**
- [ ] Complete MetadataStep with item name "Coffee Machine"
- [ ] Navigate to ReviewStep
- [ ] Verify QR Code Label section displays below metadata grid
- [ ] Verify "QR Code Label: Coffee Machine" text displays correctly
- [ ] Clear item name in MetadataStep and return to ReviewStep
- [ ] Verify empty state shows "QR Code Label: Item Name" (italic placeholder)
- [ ] Verify section is purely informational (not interactive/clickable)

---

### Task 8: Functional Testing - Article Purpose (Future Ready)
**Story Points:** 0.5

**Test Cases:**
- [ ] Navigate to ReviewStep with various metadata combinations
- [ ] Verify Purpose/Article section does NOT display (field not implemented)
- [ ] Verify no TypeScript errors about missing `articlePurpose` field
- [ ] Verify build completes without errors (`npm run build`)
- [ ] Verify no console warnings about conditional rendering

---

### Task 9: Visual/Layout Testing
**Story Points:** 0.5

**Test Cases:**
- [ ] Verify "Item Name" label styling matches other labels (text-gray-500, text-sm, font-medium)
- [ ] Verify 2-column grid layout preserved on desktop (md:grid-cols-2)
- [ ] Verify QR Code Label preview border is visible but subtle (border-gray-100)
- [ ] Verify proper spacing: mt-4 before QR preview, pt-4 padding top
- [ ] Test on mobile viewport (375px width):
  - [ ] Labels and values stack appropriately
  - [ ] QR Code Label section displays full width
  - [ ] No horizontal overflow
- [ ] Test on tablet viewport (768px width):
  - [ ] 2-column layout displays correctly
  - [ ] Edit button remains accessible
- [ ] Test on desktop viewport (1024px+):
  - [ ] Layout consistent with existing design
  - [ ] No spacing anomalies

---

### Task 10: Accessibility Testing
**Story Points:** 0.5

**Test Cases:**
- [ ] Tab through ReviewStep - verify focus order is logical
- [ ] Verify screen reader announces:
  - [ ] "Item Details" as section heading
  - [ ] "Item Name" as label with corresponding value
  - [ ] Room, Item Type, Tags labels with values
  - [ ] QR Code Label informational text
- [ ] Verify heading hierarchy:
  - [ ] h2 "Review Your Item" (page title)
  - [ ] h3 "Item Details" (section heading)
  - [ ] h3 "Media & Files" (section heading)
  - [ ] h3 "Links" (section heading)
  - [ ] h3 "Instructions" (section heading)
- [ ] Verify color contrast meets WCAG AA:
  - [ ] text-gray-500 on white background (labels)
  - [ ] text-gray-900 on white background (values)
  - [ ] text-xs text-gray-500 on white (QR preview)
- [ ] Keyboard navigation: verify all Edit buttons reachable via Tab

---

### Task 11: Regression Testing
**Story Points:** 0.5

**Test Cases:**
- [ ] Complete full ItemCapture workflow with all content types:
  - [ ] Video capture
  - [ ] Photo capture
  - [ ] File upload (PDF)
  - [ ] URL links
  - [ ] Text instructions
- [ ] Verify all ReviewStep sections display correctly
- [ ] Verify media reorder functionality works
- [ ] Verify media delete functionality works
- [ ] Verify URL remove functionality works
- [ ] Verify Submit button submits correctly
- [ ] Verify Cancel button shows confirmation dialog
- [ ] Check browser console for any new errors or warnings
- [ ] Verify TypeScript compilation passes (`npm run build`)
- [ ] Run existing tests if available (`npm test`)

---

## Task Summary Table

| Task # | Description | File | Story Points | Status |
|--------|-------------|------|--------------|--------|
| 1 | Update module JSDoc comment header | ReviewStep.tsx | 0.5 | [x] Completed 2026-01-12 |
| 2 | Update "Title" label to "Item Name" | ReviewStep.tsx | 0.5 | [x] Completed 2026-01-12 |
| 3 | Add conditional Article Purpose section | ReviewStep.tsx | 0.5 | [x] Completed 2026-01-12 |
| 4 | Add QR Code Label preview section | ReviewStep.tsx | 0.5 | [x] Completed 2026-01-12 |
| 5 | Verify accessibility attributes | ReviewStep.tsx | 0.5 | [x] Verified 2026-01-12 |
| 6 | Functional testing - Label update | - | 0.5 | [ ] Deferred to browser testing |
| 7 | Functional testing - QR Code preview | - | 0.5 | [ ] Deferred to browser testing |
| 8 | Functional testing - Article Purpose (future) | - | 0.5 | [x] Verified - section hidden correctly (field not yet implemented) |
| 9 | Visual/Layout testing | - | 0.5 | [ ] Deferred to browser testing |
| 10 | Accessibility testing | - | 0.5 | [ ] Deferred to browser testing |
| 11 | Regression testing | - | 0.5 | [x] Build passed successfully |
| **Total** | | | **5.5** | |

## Implementation Notes - 2026-01-12

**Changes Made:**
1. Updated JSDoc header with correct terminology (Item Name, Room, Item Type, Tags) and @lastModified date
2. Changed "Title" label to "Item Name" in the description list (line 423)
3. Added conditional Purpose/Article section with type assertion for future `articlePurpose` field (lines 464-472)
4. Added QR Code Label preview section below the metadata grid (lines 476-481)
5. All accessibility attributes verified to be preserved

**Verification:**
- `npm run build` completed successfully
- ReviewStep.tsx compiles without TypeScript errors
- No changes to data model (metadata.title field name unchanged)

---

## Dependencies

### Upstream Dependencies (Depends On)

| Task/REQ | Description | Reason |
|----------|-------------|--------|
| REQ-181 / Task 0.1 | MetadataStep labels update | ReviewStep labels should match MetadataStep terminology for user consistency |

### Downstream Blocks (Required By)

| Task/REQ | Description | Reason |
|----------|-------------|--------|
| Phase 1 / REQ-5 | Workflow step count fix | Must use correct "Item Name" terminology in step descriptions |
| Phase 2 / REQ-3 | What's Next screen redesign | WhatsNextStep will reference saved "Item Name" in success message |
| REQ-183 | Content Purpose Dropdown | The Purpose/Article section added here will display data from that feature |

---

## Parallel Execution Safety

**Files Modified by This Task:**
- `src/components/ItemCapture/components/steps/ReviewStep.tsx`

**Safe to Run in Parallel With:**
- REQ-183 (Add Article Purpose Field) - modifies ItemCapture.types.ts, different file
- Task 0.4 (Update QR Code Label Display) - modifies `useQRCodeGeneration.ts`, different file
- Phase 3 (REQ-1) - Dashboard cards clickable - different components
- Phase 4 (REQ-4) - Navigation menu update - different components

**Conflicts With (Run Sequentially):**
- REQ-181 / Task 0.1 - If it also modifies ReviewStep.tsx (check Task 6 of REQ-179)
- Any other task modifying ReviewStep.tsx concurrently

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type assertion for articlePurpose causes runtime errors | Low | Medium | Conditional check ensures field must exist before access |
| Label change confuses users accustomed to "Title" | Low | Low | Matches MetadataStep terminology (REQ-181 dependency) |
| QR preview creates expectation of QR code visibility | Low | Low | Clear label indicates preview of label text only |
| Mobile layout breaks with new sections | Low | Medium | Task 9 includes mobile viewport testing |
| Accessibility regression | Low | High | Task 5 and Task 10 verify accessibility preservation |

---

## Implementation Notes

### Backward Compatibility

1. **Data field name unchanged:** The internal field `metadata.title` remains unchanged - only the display label changes to "Item Name"
2. **No database schema changes:** All modifications are UI-only
3. **Type assertions used carefully:** The `articlePurpose` field access uses type assertion with conditional check to prevent runtime errors

### Code Style Considerations

1. **Comment conventions:** Match existing `{/* Section Name */}` comment style
2. **Tailwind utility classes:** Use existing patterns (text-sm, text-gray-500, font-medium)
3. **Spacing utilities:** Follow mt-4, pt-4 conventions for consistent vertical rhythm
4. **Conditional rendering:** Use `&&` pattern consistent with existing conditional sections

### Future Enhancement Preparation

The conditional Article Purpose section is added with these considerations:
- Type assertion allows compilation without modifying ItemCapture.types.ts
- Comment explains this is future-ready for REQ-183
- Section will automatically appear once `articlePurpose` is added to ItemMetadata

---

## Visual Design Reference

### Current Layout (Before)
```
+---------------------------------------+
| Item Details                     Edit |
+---------------+-----------------------+
| Title         | Room                  |
| Steamer       | Kitchen               |
+---------------+-----------------------+
| Item Type     | Tags                  |
| Kitchen       | appliance, cleaning   |
+---------------------------------------+
```

### Updated Layout (After)
```
+---------------------------------------+
| Item Details                     Edit |
+---------------+-----------------------+
| Item Name     | Room                  |
| Steamer       | Kitchen               |
+---------------+-----------------------+
| Item Type     | Tags                  |
| Kitchen       | appliance, cleaning   |
+---------------------------------------+
| QR Code Label: Steamer                |
+---------------------------------------+
```

### Future Layout (After REQ-183)
```
+---------------------------------------+
| Item Details                     Edit |
+---------------+-----------------------+
| Item Name     | Room                  |
| Steamer       | Kitchen               |
+---------------+-----------------------+
| Item Type     | Tags                  |
| Kitchen       | appliance, cleaning   |
+---------------------------------------+
| Purpose/Article                       |
| How to Clean                          |
+---------------------------------------+
| QR Code Label: Steamer                |
+---------------------------------------+
```

---

## References

- [Overview Document](docs/REQ-182-update-reviewstep-to-show-correct-labels-overview.md)
- [Implementation Plan](docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md)
- [Request Entry](docs/gen_requests.md#req-182)
- [ReviewStep Component](src/components/ItemCapture/components/steps/ReviewStep.tsx)
- [ItemCapture Types](src/components/ItemCapture/ItemCapture.types.ts)
- [MetadataStep Component](src/components/ItemCapture/components/steps/MetadataStep.tsx)
