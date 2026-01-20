# Implementation Overview: REQ-E05-023 - Implement Stale Translation Indicator

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E05-023
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.2
**Size:** M (Medium)
**Priority:** P2 - Medium

---

## Summary

Enhance the `TranslationStatusItem` component and related translation status UI components to display a distinct stale warning indicator when translations have become outdated due to source content modifications. The stale indicator uses a yellow border/icon to alert property owners that a translation may no longer accurately reflect the current source content and provides an "Update Translation" action button for quick remediation.

---

## Request Details

### Original Request (REQ-E05-024)

Property owners need visual indicators showing when translations have become stale due to source content changes, allowing them to identify outdated translations requiring review or regeneration.

### Expected Behavior

Translation status components display a distinct stale warning indicator when:
- The source content modification timestamp (`source_version_at`) is more recent than the translation creation timestamp (`translated_at`)
- The translation is marked as stale through visual differentiation:
  - **Yellow border** (#f59e0b or #fbbf24) around the status row or language cell
  - **Stale warning icon** (alert triangle or clock with exclamation)
  - **Combined status label** showing "Complete (Stale)" or "Manual (Stale)"
- An "Update Translation" action button appears for quick re-translation

### User Impact

Property owners can:
- Identify which translations need review after source content updates without manually tracking modification dates
- Understand which completed translations may contain outdated information for guests
- Prioritize translation refresh work based on content staleness rather than only status
- Maintain translation accuracy over time as content evolves through clear visual signals

### Business Value

- Prevents guests from seeing outdated translated content that no longer matches current source information
- Maintains translation quality standards as content evolves over time
- Reduces risk of miscommunication through stale translations that have not kept pace with source content changes

---

## Technical Context

### Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| `TranslationStatusItem` component | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | REQ-E05-007 (predecessor) |
| `TranslationStatus` type | `/src/lib/translation-service/translation-service.types.ts` | Exists |
| `SupportedLanguage` type | `/src/lib/translation-service/translation-service.types.ts` | Exists |
| `source_version_at` column | Translation tables | REQ-E05-003 (predecessor) |
| `TranslationPreviewPanel` | `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | REQ-E05-006 (predecessor) |
| `TranslationStatusColumn` | `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | REQ-E05-014 (predecessor) |
| `TranslationStatusWidget` | `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | REQ-E05-013 (predecessor) |
| `TranslationStatusFilter` | `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | REQ-E05-014 (predecessor) |
| `cn` utility | `/src/lib/utils` | Exists |
| Lucide React icons | `lucide-react` | Exists |

### Existing Patterns to Follow

| Pattern | Source File | Usage |
|---------|-------------|-------|
| Status chip styling | `/src/components/ItemManager/components/shared/TagChip.tsx` | Color-coded badge styling |
| Warning indicators | Application-wide | Yellow/orange for warning states |
| Engagement indicator | `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Color-coded status with icons |
| TranslationStatusItem status mapping | REQ-E05-007 implementation | Status-to-icon/color mapping |

### Technology Stack

| Technology | Purpose |
|------------|---------|
| React 18+ | Component framework |
| TypeScript 5.x | Type safety |
| Tailwind CSS 4.x | Styling |
| Lucide React | Icons (AlertTriangle, Clock, RefreshCw) |
| cn utility | Class name composition |

---

## Component Specification

### Staleness Detection Logic

```typescript
/**
 * Determines if a translation is stale based on timestamp comparison.
 * A translation is stale when:
 * 1. source_version_at is available (non-null)
 * 2. translated_at is available (non-null)
 * 3. source_version_at < translated_at indicates the translation was created
 *    BEFORE source was updated (meaning source was updated after translation)
 *
 * More accurately: translation is stale when the SOURCE entity's updated_at
 * is MORE RECENT than the translation's source_version_at
 */
function isTranslationStale(
  sourceVersionAt: string | null | undefined,
  sourceEntityUpdatedAt: string | null | undefined
): boolean {
  if (!sourceVersionAt || !sourceEntityUpdatedAt) {
    return false; // Cannot determine staleness without both timestamps
  }
  // Stale if source entity was updated after the translation was created
  return new Date(sourceVersionAt) < new Date(sourceEntityUpdatedAt);
}
```

### Extended Props Interface for TranslationStatusItem

```typescript
interface TranslationStatusItemProps {
  /** Existing props from REQ-E05-007 */
  language: SupportedLanguage;
  status: TranslationStatus;
  translatedText?: string;
  isSourceLanguage?: boolean;
  onEdit?: () => void;
  onRetranslate?: () => void;
  onRetry?: () => void;
  onView?: () => void;
  actionsDisabled?: boolean;
  className?: string;

  /** NEW: Stale indicator props */
  /** Timestamp when this translation was created/last updated (from translation record) */
  sourceVersionAt?: string | null;

  /** Timestamp when the source entity was last updated (from items/articles/links) */
  sourceEntityUpdatedAt?: string | null;

  /** Callback for Update Translation action (triggered on stale translations) */
  onUpdateTranslation?: () => void;

  /** Whether this translation has been manually reviewed (status === 'manual') */
  isManuallyEdited?: boolean;
}
```

### Visual States for Stale Indicator

| Condition | Visual Treatment | Icon | Color | Label |
|-----------|------------------|------|-------|-------|
| Completed & Stale | Yellow border + warning icon | AlertTriangle | Yellow (#f59e0b) | "Complete (Stale)" |
| Manual & Stale | Yellow border + warning icon | AlertTriangle | Yellow (#f59e0b) | "Manual (Stale)" |
| Pending & Stale | No stale indicator | Clock | Orange (existing) | "Pending" |
| Failed & Stale | No stale indicator (failure takes precedence) | AlertCircle | Red (existing) | "Failed" |
| Not Stale | Standard status indicator | Per status | Per status | Per status |

### Layout with Stale Indicator

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ ┌─ Yellow border (2px solid #f59e0b) when stale ─────────────────────────────────────────┐  │
│ │ 🇫🇷  Français   ⚠️ ✓ Complete (Stale)   Comment utiliser le...   [Update] [Edit] [↻]   │  │
│ │ ▲    ▲         ▲  ▲  ▲                  ▲                        ▲                      │  │
│ │ │    │         │  │  │                  │                        │                      │  │
│ │ Flag Language  │  │  Combined label     Preview text             Action buttons        │  │
│ │      Name      │  │  "Status (Stale)"   with ellipsis            (Update is NEW)       │  │
│ │                │  Status icon                                                           │  │
│ │                Warning icon (yellow)                                                    │  │
│ └──────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Tailwind Classes for Stale State

```typescript
const staleStyles = {
  // Border styles for stale state
  border: 'border-2 border-amber-400 rounded-lg',

  // Warning icon styles
  warningIcon: 'text-amber-500',

  // Label modifier
  labelSuffix: '(Stale)',

  // Action button styles for "Update Translation"
  updateButton: 'bg-amber-500 hover:bg-amber-600 text-white',

  // Background hint for stale row
  background: 'bg-amber-50/50',
};
```

---

## Implementation Tasks

### Task 1: Add isStale prop and staleness calculation utility

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

Add staleness detection logic:
1. Add new props: `sourceVersionAt`, `sourceEntityUpdatedAt`, `onUpdateTranslation`
2. Create internal `isStale` computed value using timestamp comparison
3. Only show stale indicator for completed or manual translations
4. Export utility function for reuse across components

```typescript
// Add to component
const isStale = useMemo(() => {
  // Only completed and manual translations can be stale
  if (status !== 'completed' && status !== 'manual') return false;
  if (!sourceVersionAt || !sourceEntityUpdatedAt) return false;
  return new Date(sourceVersionAt) < new Date(sourceEntityUpdatedAt);
}, [status, sourceVersionAt, sourceEntityUpdatedAt]);
```

### Task 2: Implement visual stale indicator styling

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

Update the component's visual rendering:
1. Add yellow border (`border-2 border-amber-400`) when `isStale` is true
2. Add yellow background hint (`bg-amber-50/50`) for subtle emphasis
3. Display AlertTriangle icon (yellow) alongside the status icon when stale
4. Update status label to show combined state: "Complete (Stale)" or "Manual (Stale)"

```typescript
// Update container styles
const containerStyles = cn(
  'flex items-center gap-3 p-3 rounded-lg transition-all',
  isStale && 'border-2 border-amber-400 bg-amber-50/50',
  !isStale && 'border border-gray-200',
  className
);
```

### Task 3: Add "Update Translation" action button

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

Add prominently displayed action button for stale translations:
1. "Update Translation" button appears when `isStale` is true
2. Button is styled with amber/warning colors for visibility
3. Button calls `onUpdateTranslation` callback when clicked
4. For manual stale translations, show confirmation before re-translating

```typescript
// Add to action buttons section
{isStale && onUpdateTranslation && (
  <button
    onClick={handleUpdateTranslation}
    className={cn(
      'px-3 py-1.5 text-sm font-medium rounded-md',
      'bg-amber-500 hover:bg-amber-600 text-white',
      'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
      'transition-colors'
    )}
    aria-label={`Update ${getLanguageInfo(language)?.name} translation`}
  >
    <RefreshCw className="w-4 h-4 mr-1.5 inline" />
    Update Translation
  </button>
)}
```

### Task 4: Add tooltip explaining staleness

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

Add hover tooltip explaining why translation is marked stale:
1. Show tooltip on hover over stale warning icon
2. Display source content update date and translation creation date
3. Use native HTML title attribute or custom tooltip component

```typescript
// Tooltip content
const staleTooltipContent = useMemo(() => {
  if (!isStale || !sourceVersionAt || !sourceEntityUpdatedAt) return '';
  const translationDate = new Date(sourceVersionAt).toLocaleDateString();
  const sourceDate = new Date(sourceEntityUpdatedAt).toLocaleDateString();
  return `Translation from ${translationDate}. Source updated on ${sourceDate}.`;
}, [isStale, sourceVersionAt, sourceEntityUpdatedAt]);
```

### Task 5: Handle confirmation for manual stale translations

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

For manually edited stale translations, require confirmation before overwriting:
1. Check if `status === 'manual'` and `isStale`
2. Show confirmation dialog before calling `onUpdateTranslation`
3. Confirmation warns that manual edits will be lost

```typescript
const handleUpdateTranslation = useCallback(() => {
  if (status === 'manual' && isStale) {
    // Trigger confirmation dialog (parent component handles this)
    onUpdateTranslation?.();
  } else {
    onUpdateTranslation?.();
  }
}, [status, isStale, onUpdateTranslation]);
```

### Task 6: Update TranslationStatusColumn for stale indicator

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

Add stale indicator to the compact table column component:
1. Add yellow dot indicator for stale translations in the six-dot display
2. Stale overrides the normal status color with yellow (#f59e0b)
3. Add tooltip showing stale state on hover

### Task 7: Update TranslationPreviewPanel to show stale banner

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`

Add stale warning banner at top of preview panel:
1. Show banner when any translation is stale
2. Banner text: "Some translations may be outdated due to recent content changes."
3. Banner uses amber/yellow styling for warning

### Task 8: Update TranslationStatusWidget to count stale translations

**File:** `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`

Add stale count to the dashboard widget:
1. Add separate count for stale translations
2. Display: "5 stale" alongside other status counts
3. Use amber/yellow color for stale count

### Task 9: Add "Stale Translations" filter option

**File:** `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx`

Add new filter option for stale translations:
1. Add "Stale Translations" to filter dropdown options
2. Filter shows only content with at least one stale translation
3. Works in conjunction with other status filters

### Task 10: Update type definitions

**File:** `/src/components/TranslationManagement/TranslationManagement.types.ts`

Add stale-related type definitions:
1. Add `isStale` boolean to translation status interfaces
2. Add `sourceVersionAt` and `sourceEntityUpdatedAt` fields
3. Update TranslationStatusItemProps interface

```typescript
// Add to TranslationManagement.types.ts
export interface TranslationStatusData {
  language: SupportedLanguage;
  status: TranslationStatus;
  translatedText?: string;
  translatedAt?: string | null;
  sourceVersionAt?: string | null;
  reviewedBy?: string | null;
  /** Computed: true if source was updated after translation */
  isStale?: boolean;
}

export interface StaleTranslationInfo {
  language: SupportedLanguage;
  translationDate: string;
  sourceUpdateDate: string;
}
```

### Task 11: Export stale utility functions

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

Export the staleness utility for reuse:
```typescript
export { isTranslationStale } from './TranslationStatusItem';
export type { TranslationStatusItemProps } from './TranslationStatusItem';
```

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Add stale indicator, yellow border, warning icon, "Update Translation" button, tooltip |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Add stale warning banner at top when any translation is stale |
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Export `isTranslationStale` utility function |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Add yellow dot for stale translations in six-dot display |
| `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx` | Add stale count to dashboard statistics |
| `/src/components/TranslationManagement/TranslationStatusFilter/TranslationStatusFilter.tsx` | Add "Stale Translations" filter option |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Add `isStale`, `sourceVersionAt`, `sourceEntityUpdatedAt` type definitions |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-service/translation-service.types.ts` | TranslationStatus, SupportedLanguage, getLanguageInfo |
| `/src/lib/utils.ts` | cn utility function |
| `/src/components/ItemManager/components/shared/TagChip.tsx` | Color/styling patterns |
| `/src/lib/supabase.ts` | Database types including source_version_at |

### New Exports

| Export | From File | Purpose |
|--------|-----------|---------|
| `isTranslationStale` | TranslationStatusItem | Utility function for staleness calculation |

---

## Acceptance Criteria Checklist

### Visual Indicators
- [ ] TranslationStatusItem displays stale indicator when source_version_at < source entity updated_at
- [ ] Stale indicator uses yellow/orange color (#f59e0b or #fbbf24) to distinguish from other status colors
- [ ] Stale indicator displays as yellow border around the entire status row
- [ ] Stale warning icon (AlertTriangle) displays alongside translation status
- [ ] Status label updates to show "Complete (Stale)" or "Manual (Stale)" combining both states
- [ ] Stale status takes visual precedence through combined display (not replacing status)

### Action Buttons
- [ ] "Update Translation" action button appears when stale state is detected
- [ ] "Update Translation" button is prominently displayed for stale translations
- [ ] Clicking "Update Translation" triggers re-translation for the specific stale language
- [ ] Confirmation dialog appears for manually edited stale translations before overwriting

### Tooltips and Explanation
- [ ] Stale indicator includes tooltip explaining why translation is marked as stale on hover
- [ ] Tooltip displays source content update date and translation creation date for comparison

### Table and Column Views
- [ ] Translation status column in table views shows yellow dot indicator for stale translations
- [ ] Translation preview panel displays stale warning banner at top when opened for stale translation

### Dashboard and Filtering
- [ ] Dashboard translation widget includes count of stale translations in status summary
- [ ] Filter dropdown includes "Stale Translations" option to show only outdated content
- [ ] Stale translation count displays separately from other status counts in statistics views

### Logic and Data
- [ ] Component calculates staleness by comparing source_version_at with source entity updated_at
- [ ] Stale indicator only displays when both timestamps are available for comparison
- [ ] Translations created before source_version_at tracking was implemented do not show stale indicators
- [ ] Stale status updates immediately when source content is modified through realtime subscriptions
- [ ] Stale indicator disappears when translation is refreshed and new timestamp is more recent

### Props and Interface
- [ ] Component accepts source modification timestamp as optional prop
- [ ] Component accepts translation creation timestamp as required prop
- [ ] New `onUpdateTranslation` callback prop for stale translation action

### Accessibility and Styling
- [ ] Visual hierarchy ensures stale indicator is immediately noticeable without being disruptive
- [ ] Color contrast meets WCAG accessibility standards for yellow warning indicators
- [ ] Stale indicator works correctly in both light and dark theme contexts
- [ ] Component styling remains consistent with application design system
- [ ] Keyboard focus states clearly indicate stale translations through focus ring styling

---

## Testing Requirements

### Unit Tests

- [ ] `isTranslationStale()` returns true when sourceVersionAt < sourceEntityUpdatedAt
- [ ] `isTranslationStale()` returns false when sourceVersionAt >= sourceEntityUpdatedAt
- [ ] `isTranslationStale()` returns false when either timestamp is null/undefined
- [ ] Component displays yellow border when isStale is true
- [ ] Component shows warning icon when isStale is true
- [ ] Component shows "Update Translation" button when isStale is true
- [ ] Component does not show stale indicator for pending/processing/failed status
- [ ] Tooltip displays correct date information

### Integration Tests

- [ ] Stale indicator updates when source content is modified (realtime)
- [ ] "Update Translation" button triggers re-translation API call
- [ ] Filter by "Stale Translations" returns correct results
- [ ] Dashboard widget shows accurate stale count

### Accessibility Tests

- [ ] Stale warning icon has proper ARIA label
- [ ] "Update Translation" button is keyboard accessible
- [ ] Color contrast ratio for yellow warning meets WCAG AA
- [ ] Screen readers announce stale state correctly

### Visual Tests

- [ ] Yellow border displays correctly on all status states
- [ ] Warning icon renders at correct size and position
- [ ] Tooltip appears on hover with correct content
- [ ] Responsive layout maintains stale indicators on mobile

---

## Code Examples

### Usage in TranslationPreviewPanel

```tsx
{SUPPORTED_LANGUAGES.map((lang) => {
  const translation = translations[lang.code];
  return (
    <TranslationStatusItem
      key={lang.code}
      language={lang.code}
      status={translation?.status ?? 'pending'}
      translatedText={translation?.content?.title}
      isSourceLanguage={lang.code === sourceLanguage}
      sourceVersionAt={translation?.sourceVersionAt}
      sourceEntityUpdatedAt={sourceEntity.updatedAt}
      onEdit={() => handleEdit(lang.code)}
      onRetranslate={() => handleRetranslate(lang.code)}
      onRetry={() => handleRetry(lang.code)}
      onUpdateTranslation={() => handleUpdateStaleTranslation(lang.code)}
      actionsDisabled={isProcessing}
    />
  );
})}
```

### Staleness Utility Function

```typescript
/**
 * Determines if a translation is stale based on timestamp comparison.
 * @param sourceVersionAt - Timestamp of source when translation was created
 * @param sourceEntityUpdatedAt - Current updated_at of the source entity
 * @returns true if translation is stale (source updated after translation)
 */
export function isTranslationStale(
  sourceVersionAt: string | null | undefined,
  sourceEntityUpdatedAt: string | null | undefined
): boolean {
  if (!sourceVersionAt || !sourceEntityUpdatedAt) {
    return false;
  }
  return new Date(sourceVersionAt) < new Date(sourceEntityUpdatedAt);
}
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing source_version_at data | Medium | Low | Graceful fallback - no stale indicator shown |
| Over-alerting users with stale warnings | Medium | Medium | Only show for completed/manual; clear visual hierarchy |
| Performance with many stale checks | Low | Low | Compute staleness once per render, memoize |
| Confusion between stale and failed states | Low | Medium | Clear visual distinction (yellow vs red) and combined labels |
| Manual translations accidentally overwritten | Medium | High | Confirmation dialog before re-translating manual edits |
| Realtime updates causing UI flicker | Low | Low | Debounce staleness recalculation |

---

## Dependencies Graph

```
REQ-E05-003 (source_version_at migration)
    ↓
REQ-E05-007 (TranslationStatusItem base component)
    ↓
REQ-E05-023 (Stale Translation Indicator) ← THIS TASK
    ↓
REQ-E05-022 (ManualEditWarningDialog) - Uses confirmation for manual stale
```

---

## References

- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Task 5.2)
- **Request File:** `/docs/gen_requests_epic5.md` (REQ-E05-024)
- **TranslationStatusItem Base:** `/docs/REQ-E05-007-create-translationstatusitem-component-overview.md`
- **source_version_at Migration:** `/docs/REQ-E05-003-add-sourceversionat-columns-via-migration-overview.md`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **PRD Status Colors Spec:** UI Visual Specifications section

---

*Document generated for FAQBNB L10N Epic 5 - Task 5.2: Implement Stale Translation Indicator*
