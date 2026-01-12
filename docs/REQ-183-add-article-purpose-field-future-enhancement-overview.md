# Implementation Breakdown: REQ-183 - Add Content Purpose Dropdown to Item Capture Flow

**Document Created:** 2026-01-12 16:00:00
**Last Modified:** 2026-01-12 16:00:00
**Request ID:** REQ-183
**Implementation Plan Reference:** Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md (Phase 0, Task 0.3)
**Type:** NEW FEATURE
**Size:** M (Medium)
**Status:** Future Enhancement (Deferred)

---

## Overview

This document provides the implementation breakdown for adding an optional "Content Purpose" dropdown field to the Item Capture workflow. This enhancement allows users to classify the type of instructional content (e.g., Troubleshooting, How-To, FAQ, Maintenance) during initial item capture, rather than requiring post-capture editing to set article purpose.

### Background Context

The FAQBNB data model correctly separates Items (physical objects that receive QR codes) from Articles (instructional content with specific purposes). Currently:

- **Items** are captured via the ItemCapture wizard with the Item Name field
- **Articles** have a `purpose` field defined in `src/types/index.ts` as `PurposeType`
- Article purpose is currently set only during the content editing/organization phase after capture

This enhancement streamlines the workflow by allowing purpose classification at capture time for users who know their content intent upfront.

---

## Technical Context

### Existing Data Model

The existing `PurposeType` enum (`src/types/index.ts:96-103`) already defines the allowed purpose values:

```typescript
export type PurposeType =
  | 'how-to-use'
  | 'how-to-clean'
  | 'troubleshooting'
  | 'safety-info'
  | 'maintenance'
  | 'features'
  | 'other';
```

The `ItemArticle` interface (`src/types/index.ts:106-116`) uses this type:

```typescript
export interface ItemArticle {
  id: string;
  itemId: string;
  purpose: PurposeType;
  title: string;
  description?: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  links?: ItemLink[];
}
```

### Existing ItemCapture Architecture

The ItemCapture wizard uses a multi-step flow managed by:
- **State Types:** `src/components/ItemCapture/ItemCapture.types.ts`
- **MetadataStep:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
- **Constants:** `src/components/ItemCapture/utils/constants.ts`
- **Main Component:** `src/components/ItemCapture/ItemCapture.tsx`

Current `ItemMetadata` interface (`ItemCapture.types.ts:261-273`):

```typescript
export interface ItemMetadata {
  title: string;
  location?: string;
  tags?: string[];
  applianceType?: ApplianceType;
}
```

---

## Request Analysis

### User Story

> As a property manager, I want to specify the content purpose (e.g., "How-To", "Troubleshooting") when capturing an item so that the article is pre-classified without requiring post-capture editing.

### Acceptance Criteria (from REQ-183)

1. Content Purpose dropdown appears in the item capture flow after the Item Name field
2. Dropdown is clearly marked as optional and does not block workflow progression
3. Dropdown includes standard purpose options: Troubleshooting, How-To, FAQ, Maintenance, Safety, Warranty
4. Selected purpose value is stored with item metadata
5. Selected purpose pre-populates article classification during content editing phase
6. Users can skip the field entirely without validation errors
7. Field placement does not disrupt existing workflow layout or user experience

### Mapping to Existing Types

The acceptance criteria purpose options need to be mapped to existing `PurposeType` values:

| UI Label | PurposeType Value |
|----------|-------------------|
| How-To | `how-to-use` |
| Troubleshooting | `troubleshooting` |
| Cleaning | `how-to-clean` |
| Maintenance | `maintenance` |
| Safety | `safety-info` |
| Features | `features` |
| Other | `other` |

Note: "FAQ" and "Warranty" from acceptance criteria don't have direct mappings - they could use `other` or the `PurposeType` could be extended.

---

## Implementation Tasks

### Task 1: Extend ItemMetadata Interface

**File:** `src/components/ItemCapture/ItemCapture.types.ts`
**Estimated Effort:** 1 story point

Add optional `contentPurpose` field to `ItemMetadata`:

```typescript
export interface ItemMetadata {
  title: string;
  location?: string;
  tags?: string[];
  applianceType?: ApplianceType;
  contentPurpose?: PurposeType;  // NEW: Optional content purpose
}
```

**Rationale:** Using the existing `PurposeType` from `src/types/index.ts` ensures type consistency with the Article data model.

---

### Task 2: Add Purpose Constants to ItemCapture

**File:** `src/components/ItemCapture/utils/constants.ts`
**Estimated Effort:** 1 story point

Add a new constant array for the purpose dropdown options:

```typescript
import type { PurposeType } from '@/types';

/**
 * Content purpose options for the MetadataStep dropdown.
 * Matches PurposeType values from the Article data model.
 * @see REQ-183
 */
export const CONTENT_PURPOSE_OPTIONS: { value: PurposeType; label: string }[] = [
  { value: 'how-to-use', label: 'How-To Instructions' },
  { value: 'how-to-clean', label: 'Cleaning Guide' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'safety-info', label: 'Safety Information' },
  { value: 'features', label: 'Features & Tips' },
  { value: 'other', label: 'Other' },
];
```

---

### Task 3: Add Content Purpose Dropdown to MetadataStep

**File:** `src/components/ItemCapture/components/steps/MetadataStep.tsx`
**Estimated Effort:** 2 story points

Add a new optional dropdown field between the Item Name field and the Room field. The implementation should follow the existing pattern used for the Item Type dropdown.

**Changes Required:**

1. Import `CONTENT_PURPOSE_OPTIONS` from constants
2. Import `PurposeType` from types
3. Add unique ID for the new field
4. Add change handler for content purpose
5. Add the dropdown UI component

**UI Placement:** After Item Name field, before Room field (lines ~383-384)

**Sample Implementation:**

```tsx
{/* Content Purpose Field (Optional) - NEW REQ-183 */}
<div>
  <label
    htmlFor={purposeId}
    className="block text-sm font-medium text-gray-700 mb-2"
  >
    Content Purpose
    <span className="text-gray-400 font-normal ml-1">(optional)</span>
  </label>
  <div className="relative">
    <select
      id={purposeId}
      value={metadata.contentPurpose || ''}
      onChange={handlePurposeChange}
      className={cn(
        'w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'hover:border-gray-400 transition-colors',
        'min-h-[48px] bg-white pr-10'
      )}
    >
      <option value="">Select content type...</option>
      {CONTENT_PURPOSE_OPTIONS.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
  </div>
  <p className="text-gray-500 text-xs mt-1">
    Optionally classify what type of instructions you're creating
  </p>
</div>
```

---

### Task 4: Update ReviewStep to Display Content Purpose

**File:** `src/components/ItemCapture/components/steps/ReviewStep.tsx`
**Estimated Effort:** 1 story point

Add a display row in the Metadata Summary section to show the selected content purpose when present.

**Location:** After Item Type display (around line ~444)

**Changes Required:**

1. Import `CONTENT_PURPOSE_OPTIONS` from constants
2. Add helper function to get purpose label
3. Add conditional rendering for purpose field

```tsx
{/* Content Purpose (conditional) */}
{metadata.contentPurpose && (
  <div>
    <dt className="text-sm font-medium text-gray-500">Content Purpose</dt>
    <dd className="mt-1 text-sm text-gray-900">
      {getContentPurposeLabel(metadata.contentPurpose)}
    </dd>
  </div>
)}
```

---

### Task 5: Update ItemRecord Output Type

**File:** `src/components/ItemCapture/ItemCapture.types.ts`
**Estimated Effort:** 1 story point

Add `contentPurpose` to the `ItemRecord` output interface so it's included in the `onComplete` callback data.

**Location:** `ItemRecord` interface (lines ~210-237)

```typescript
export interface ItemRecord {
  id: string;
  title: string;
  location?: string;
  tags?: string[];
  applianceType?: ApplianceType;
  contentPurpose?: PurposeType;  // NEW: Optional content purpose
  contentType: 'media' | 'text-only' | 'pdf-only' | 'url-only' | 'mixed';
  media: MediaItem[];
  instructions?: string;
  createdAt: Date;
}
```

---

### Task 6: Wire Content Purpose Through ItemCapture Flow

**File:** `src/components/ItemCapture/ItemCapture.tsx`
**Estimated Effort:** 1 story point

Ensure the `contentPurpose` value flows from MetadataStep through to the final `ItemRecord` assembly.

**Changes:**
1. Pass `contentPurpose` in the assembled record
2. Ensure state reset clears the purpose field

---

### Task 7: Pre-populate Article Purpose on Save (Integration)

**Files:** Item submission handler / API route
**Estimated Effort:** 2 story points

When an item with `contentPurpose` is submitted:
1. If creating an article, use the `contentPurpose` value as the initial `purpose` field
2. This should be handled in the item creation flow where articles are generated

**Note:** This task may require updates to the item creation API endpoint to accept and use the `contentPurpose` value.

---

## Dependencies

### Depends On (upstream)

- **Task 0.1 (REQ-181):** MetadataStep labels must be clarified with "Item Name" terminology before adding Content Purpose field to avoid user confusion
- **Task 0.2 (REQ-182):** ReviewStep must show "Item Name" label before adding Content Purpose display

### Blocks (downstream)

- None - this is an optional enhancement that doesn't block other functionality

### Parallel Safety

- **Files touched:**
  - `src/components/ItemCapture/ItemCapture.types.ts` - shared with REQ-2/REQ-3
  - `src/components/ItemCapture/components/steps/MetadataStep.tsx` - shared with REQ-181
  - `src/components/ItemCapture/components/steps/ReviewStep.tsx` - shared with REQ-182
  - `src/components/ItemCapture/utils/constants.ts` - unique to this task
  - `src/components/ItemCapture/ItemCapture.tsx` - shared with REQ-3/REQ-5

- **Conflicts with:**
  - Phase 0, Task 0.1 (REQ-181): Both modify MetadataStep.tsx
  - Phase 0, Task 0.2 (REQ-182): Both modify ReviewStep.tsx
  - Phase 2 (REQ-3): Both modify ItemCapture.types.ts

- **Safe to parallelize with:**
  - Phase 1, REQ-5 (Step Count): Different files (ProgressIndicator.tsx)
  - Phase 3, REQ-1 (Dashboard Cards): Different components
  - Phase 4, REQ-4 (Navigation): Different components

---

## Authorized Files and Functions for Modification

### Primary Files

| File | Functions/Sections to Modify |
|------|------------------------------|
| `src/components/ItemCapture/ItemCapture.types.ts` | `ItemMetadata` interface, `ItemRecord` interface |
| `src/components/ItemCapture/utils/constants.ts` | Add `CONTENT_PURPOSE_OPTIONS` constant |
| `src/components/ItemCapture/components/steps/MetadataStep.tsx` | Add dropdown UI after Item Name field, add `handlePurposeChange` handler |
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Add content purpose display in metadata section |
| `src/components/ItemCapture/ItemCapture.tsx` | Include `contentPurpose` in record assembly |

### Support Files (Read-Only Reference)

| File | Purpose |
|------|---------|
| `src/types/index.ts` | Reference `PurposeType` enum definition |
| `database/schema.sql` | Verify `item_articles.purpose` column exists |

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Field Placement | After Item Name, before Room | Logical flow: Item Name -> What kind of content -> Where is it |
| Dropdown vs. Radio | Dropdown | Consistent with Item Type field pattern; saves vertical space |
| Optional vs. Required | Optional | Users may not know content purpose upfront; preserves existing workflow |
| Type Reuse | Use existing `PurposeType` | Ensures consistency with Article data model; no new enum needed |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Purpose options don't match user mental model | Medium | Low | Include "Other" option; gather user feedback for iteration |
| Field adds cognitive load | Low | Low | Mark as optional; provide helper text; allow skipping |
| Integration with article creation fails | Low | Medium | Graceful fallback: if purpose not used, article created without pre-populated purpose |
| Mobile layout issues with new field | Low | Medium | Test on mobile viewports; field uses same responsive pattern as Item Type |

---

## Testing Plan

### Unit Tests

- [ ] `ItemMetadata` interface accepts `contentPurpose` field
- [ ] `CONTENT_PURPOSE_OPTIONS` contains all expected values
- [ ] `getContentPurposeLabel` returns correct labels
- [ ] MetadataStep renders purpose dropdown when initialized
- [ ] Purpose selection updates metadata state
- [ ] ReviewStep displays purpose when present
- [ ] ReviewStep hides purpose section when not set
- [ ] ItemRecord includes `contentPurpose` in assembled output

### Integration Tests

- [ ] Complete capture flow with purpose selection
- [ ] Complete capture flow without purpose selection (skipped)
- [ ] Purpose value persists through wizard step navigation
- [ ] Purpose value cleared on wizard reset

### Accessibility Tests

- [ ] Dropdown has proper label association
- [ ] Optional field indicator is screen reader accessible
- [ ] Keyboard navigation works correctly
- [ ] Focus management follows existing patterns

### Manual Testing

- [ ] Test on desktop viewport (1280x720+)
- [ ] Test on tablet viewport (768x1024)
- [ ] Test on mobile viewport (375x667)
- [ ] Verify dropdown options are readable
- [ ] Verify helper text is visible

---

## Effort Estimate

| Task | Description | Story Points |
|------|-------------|--------------|
| Task 1 | Extend ItemMetadata interface | 1 |
| Task 2 | Add purpose constants | 1 |
| Task 3 | Add dropdown to MetadataStep | 2 |
| Task 4 | Update ReviewStep display | 1 |
| Task 5 | Update ItemRecord output | 1 |
| Task 6 | Wire through ItemCapture flow | 1 |
| Task 7 | Pre-populate article purpose | 2 |
| **Total** | | **9 story points** |

**Estimated Development Time:** 1-2 days
**Confidence:** High (follows existing patterns)

---

## Open Questions

1. **FAQ and Warranty Purposes:** The acceptance criteria mention "FAQ" and "Warranty" as purpose options, but these don't exist in the current `PurposeType` enum. Should we:
   - Map them to `other`?
   - Extend `PurposeType` with new values (requires database migration)?
   - Remove them from the UI options?

2. **Multi-Article Scenarios:** If a user captures content with a purpose, but later wants to add additional articles with different purposes to the same item, how should the workflow handle this?

3. **Default Purpose:** Should there be a default purpose (e.g., "how-to-use") or always start with empty selection?

---

## References

- Request Document: `docs/gen_requests.md` (REQ-183)
- Implementation Plan: `docs/prd/Plan-105-FAQBNB-Review-2026-01-11-Comprehensive-Implementation.md`
- Data Types: `src/types/index.ts`
- ItemCapture Types: `src/components/ItemCapture/ItemCapture.types.ts`
- MetadataStep: `src/components/ItemCapture/components/steps/MetadataStep.tsx`
- ReviewStep: `src/components/ItemCapture/components/steps/ReviewStep.tsx`
- Constants: `src/components/ItemCapture/utils/constants.ts`
