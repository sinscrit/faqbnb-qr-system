# Implementation Overview: REQ-E05-014 - Create TranslationStatusColumn Component

**Document Created:** 2026-01-20 16:45 UTC
**Last Modified:** 2026-01-20 16:45 UTC
**Request ID:** REQ-E05-014
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.2
**Size:** S (Small)
**Priority:** P2 - Medium

---

## Summary

Create a compact TranslationStatusColumn component that displays translation status for all six supported languages using a row of colored dots within table cells. Each dot represents one language's translation state, and clicking the indicator opens the TranslationPreviewPanel for detailed review and actions.

---

## Dependencies

### Epic Dependencies
| Dependency | Status | Description |
|------------|--------|-------------|
| Epic 1 - Foundation | Required | Translation tables, language types, translation service |
| Epic 3 - Dynamic Content Translation | Required | Translation trigger system, status tracking |
| REQ-E05-006 | Required | TranslationManagement.types.ts shared type definitions |
| REQ-E05-007 | Required | TranslationPreviewPanel component to open on click |

### Package Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-tooltip` | ^1.2.8 | Tooltip for individual language status on hover |
| `lucide-react` | existing | Icons not strictly needed (using colored dots) |
| `tailwindcss` | ^4.x | Status color styling |

---

## Technical Context

### Existing Patterns to Follow

1. **EngagementIndicator Component** (`/src/components/ItemManager/components/shared/EngagementIndicator.tsx`)
   - Provides dot variant pattern with `'dot'` variant rendering colored circles
   - Uses `role="img"` and `aria-label` for accessibility
   - Size variants: `'small'` (w-2 h-2) and `'medium'` (w-3 h-3)

2. **TruncatedText Component** (`/src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx`)
   - Demonstrates Radix Tooltip usage pattern
   - Uses `Tooltip.Provider`, `Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Content`
   - Animation classes for smooth transitions

3. **ItemRow Component** (`/src/components/ItemManager/components/ItemRow.tsx`)
   - Table column integration patterns
   - Click handling with interactive element detection
   - Responsive breakpoints: `hidden lg:flex`, `hidden xl:flex`
   - Column width patterns: `w-20`, `w-24`, `w-28`

### Translation Service Types
From `/src/lib/translation-service/translation-service.types.ts`:
- `SupportedLanguage`: `'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'`
- `TranslationStatus`: `'pending' | 'processing' | 'completed' | 'failed' | 'manual'`
- `SUPPORTED_LANGUAGES`: Array with emoji flags (`🇬🇧 🇫🇷 🇪🇸 🇩🇪 🇳🇱 🇮🇹`)
- Language order: EN, FR, ES, DE, NL, IT (6 languages)

### Color Palette (from PRD)
| Status | Color | Tailwind Class | Hex |
|--------|-------|----------------|-----|
| Complete | Green | `bg-green-500` | #10b981 |
| Pending/Processing | Orange | `bg-amber-500` | #f59e0b |
| Failed | Red | `bg-red-500` | #ef4444 |
| Manual | Purple | `bg-violet-500` | #a855f7 |
| Not Started | Gray | `bg-gray-300` | #d1d5db |

---

## Component Architecture

### File Structure
```
/src/components/TranslationManagement/
├── TranslationStatusColumn/
│   ├── index.ts                         # Barrel exports
│   ├── TranslationStatusColumn.tsx      # Main component
│   └── TranslationStatusColumn.types.ts # Component types (optional, can inline)
```

### Props Interface
```typescript
interface TranslationStatusColumnProps {
  /** Type of entity (article, item, link) */
  entityType: 'article' | 'item' | 'link';

  /** Unique identifier of the entity */
  entityId: string;

  /** Translation status for each language */
  translationStatuses: Partial<Record<SupportedLanguage, TranslationStatus>>;

  /** Callback when indicator is clicked - opens preview panel */
  onClick?: (entityType: string, entityId: string) => void;

  /** Whether the component is in a loading state */
  loading?: boolean;

  /** Size variant for dots */
  size?: 'small' | 'medium';

  /** Additional CSS classes */
  className?: string;
}
```

### Component Behavior

1. **Visual Display**
   - Renders 6 circular dots in a horizontal row
   - Fixed order: EN, FR, ES, DE, NL, IT
   - Each dot color reflects the language's translation status
   - Consistent spacing (2-4px gap) between dots
   - Fixed width container to prevent column width fluctuation

2. **Tooltip on Hover**
   - Individual language tooltips show: language flag + name + status
   - Example: "🇫🇷 French - Completed"
   - Uses Radix Tooltip for accessibility

3. **Click Interaction**
   - Entire indicator group is clickable
   - Click triggers `onClick(entityType, entityId)` callback
   - Parent component uses callback to open TranslationPreviewPanel
   - Cursor changes to pointer on hover

4. **Loading State**
   - Shows shimmer/pulse animation on dots
   - Uses `animate-pulse` Tailwind class

5. **Accessibility**
   - Group has `role="button"` (clickable) or `role="img"` (visual indicator)
   - Comprehensive `aria-label`: "Translation status: 4 of 6 languages completed"
   - Keyboard accessible via tabIndex and Enter/Space handlers
   - Focus visible ring for keyboard navigation

---

## Implementation Tasks

### Task 1: Create Component Types (Optional)
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts`
- Define `TranslationStatusColumnProps` interface
- Define `LanguageStatusDot` helper type
- Export status color mapping constants

### Task 2: Create Main Component
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`
- Import Radix Tooltip and translation types
- Implement dot rendering with status colors
- Add tooltip for each language dot
- Implement click handler with keyboard support
- Add loading state with shimmer effect
- Include proper ARIA attributes

### Task 3: Create Barrel Export
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/index.ts`
- Export `TranslationStatusColumn` component
- Export types for external use

### Task 4: Update TranslationManagement Index
**File:** `/src/components/TranslationManagement/index.ts`
- Add export for TranslationStatusColumn module

---

## Visual Specification

### Dot Layout
```
┌──────────────────────────────────┐
│  ● ● ● ● ● ●                     │  (6 dots, ~8-10px each)
│  EN FR ES DE NL IT               │  (language order)
└──────────────────────────────────┘
```

### Status Color Examples
```
● ● ● ● ● ●   All complete (green)
● ● ● ○ ○ ○   3 complete, 3 not started
● ● ⏳ ● ❌ ●   Mixed states (green, amber, red, purple)
```

### Tooltip Content
```
┌─────────────────────────┐
│ 🇫🇷 French              │
│ Status: Completed       │
└─────────────────────────┘
```

---

## Integration Points

### With ItemRow/ItemList
```tsx
// In ItemRow.tsx columns array
<div className="hidden xl:flex w-24 items-center justify-center">
  <TranslationStatusColumn
    entityType="item"
    entityId={item.id}
    translationStatuses={item.translationStatuses}
    onClick={(type, id) => openTranslationPreview(type, id)}
  />
</div>
```

### With TranslationPreviewPanel
```tsx
// Parent component manages preview panel state
const [previewEntity, setPreviewEntity] = useState<{type: string; id: string} | null>(null);

<TranslationStatusColumn
  entityType="article"
  entityId={article.id}
  translationStatuses={article.translationStatuses}
  onClick={(type, id) => setPreviewEntity({ type, id })}
/>

{previewEntity && (
  <TranslationPreviewPanel
    entityType={previewEntity.type}
    entityId={previewEntity.id}
    isOpen={!!previewEntity}
    onClose={() => setPreviewEntity(null)}
  />
)}
```

---

## Authorized Files and Functions for Modification

### New Files to Create
| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationStatusColumn/index.ts` | Barrel export |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Main component |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts` | Types (optional) |

### Files to Modify
| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/index.ts` | Add TranslationStatusColumn export |

### Files for Reference Only (Do Not Modify)
| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Dot variant pattern |
| `/src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx` | Radix Tooltip pattern |
| `/src/components/ItemManager/components/ItemRow.tsx` | Table column integration |
| `/src/lib/translation-service/translation-service.types.ts` | Language and status types |

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| Component renders as horizontal row of 6 dots | Task 2 - dot layout with flex and gap |
| Each dot represents one language in order EN, FR, ES, DE, NL, IT | Task 2 - map SUPPORTED_LANGUAGES array |
| Dot colors use standard status scheme | Task 2 - STATUS_COLORS constant mapping |
| Tooltips show language name and status on hover | Task 2 - Radix Tooltip per dot |
| Entire indicator is clickable and opens preview panel | Task 2 - onClick prop, keyboard handlers |
| Component accepts entity reference as required props | Task 1/2 - Props interface |
| Component displays loading state with shimmer | Task 2 - loading prop with animate-pulse |
| Dots have consistent size (8-10px diameter) | Task 2 - Tailwind w-2/w-2.5 classes |
| Component maintains fixed width | Task 2 - fixed container width |
| Fully keyboard accessible | Task 2 - tabIndex, Enter/Space handlers |
| ARIA label describes translation status summary | Task 2 - computed aria-label |
| Works in light and dark themes | Task 2 - Tailwind dark: variants |
| Smooth color transitions on status updates | Task 2 - transition-colors class |

---

## Testing Considerations

### Unit Tests
- Renders correct number of dots (6)
- Each dot has correct color for its status
- Loading state shows shimmer animation
- Click handler called with correct entityType and entityId
- Keyboard navigation (Enter/Space) triggers click
- ARIA label accurately describes status summary
- Tooltip appears on hover with correct content

### Integration Tests
- Component displays correctly within ItemRow
- Click opens TranslationPreviewPanel
- Status updates reflect in dot colors
- Responsive hiding at breakpoints works

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationPreviewPanel not ready | Medium | High | Component works standalone, onClick can be no-op initially |
| Types file (REQ-E05-006) not complete | Medium | Medium | Inline types in component, refactor later |
| Performance with many rows | Low | Medium | Minimal DOM, no complex calculations |
| Theme inconsistency | Low | Low | Use Tailwind classes that support dark mode |

---

## Notes

- The component assumes translation status data is already fetched and passed via props
- Parent components (ItemRow, ArticleList) are responsible for data fetching
- The `useTranslationStatus` hook (REQ-E05-011) can be used by parent to fetch data
- Consider memoization if component re-renders frequently in large lists

---

## References

- Request: `/docs/gen_requests_epic5.md` - REQ-E05-014
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Translation Types: `/src/lib/translation-service/translation-service.types.ts`
- Radix Tooltip: https://www.radix-ui.com/primitives/docs/components/tooltip
