# Detailed Task Breakdown: REQ-E05-014 - Create TranslationStatusColumn Component

**Document Created:** 2026-01-20 17:30 UTC
**Last Modified:** 2026-01-20 17:30 UTC
**Request ID:** REQ-E05-014
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.2
**Size:** S (Small)
**Priority:** P2 - Medium
**Overview Document:** [REQ-E05-014-create-translationstatuscolumn-component-overview.md](./REQ-E05-014-create-translationstatuscolumn-component-overview.md)

---

## Executive Summary

This document provides granular, actionable implementation tasks for creating the TranslationStatusColumn component. The component displays translation status for all six supported languages as a compact row of colored dots within table cells. Each dot represents one language's translation state using the standard color scheme. Clicking the indicator opens the TranslationPreviewPanel for detailed review.

---

## Prerequisites Checklist

Before starting implementation, verify these prerequisites are met:

- [ ] Epic 1 Foundation is complete (translation tables, language types)
- [ ] Translation service types exist at `/src/lib/translation-service/translation-service.types.ts`
- [ ] `@radix-ui/react-tooltip` package is installed (verify in package.json)
- [ ] REQ-E05-006 (TranslationManagement.types.ts) is complete OR plan to inline types
- [ ] REQ-E05-007 (TranslationPreviewPanel) is complete OR component works standalone with onClick callback

---

## Task Breakdown

### Task 1: Create TranslationStatusColumn Directory Structure
**Estimated Effort:** 1 story point
**File Operations:** Create directories

#### 1.1 Create Component Directory
Create the directory structure for the TranslationStatusColumn component:

```bash
# Directory to create
/src/components/TranslationManagement/TranslationStatusColumn/
```

**Acceptance Criteria:**
- [ ] Directory `/src/components/TranslationManagement/` exists
- [ ] Directory `/src/components/TranslationManagement/TranslationStatusColumn/` exists

---

### Task 2: Create Component Types (Optional - Can Inline)
**Estimated Effort:** 1 story point
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts`

#### 2.1 Define Props Interface

Create the types file with the following content:

```typescript
/**
 * TranslationStatusColumn Component Types
 * Part of REQ-E05-014: Compact Translation Status Column Indicator
 *
 * @module TranslationManagement/TranslationStatusColumn/types
 * @created 2026-01-20
 */

import type { SupportedLanguage, TranslationStatus } from '@/lib/translation-service/translation-service.types';

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the TranslationStatusColumn component.
 * Displays a compact row of 6 colored dots representing translation status per language.
 */
export interface TranslationStatusColumnProps {
  /**
   * Type of entity being displayed.
   * Used for the onClick callback and accessibility label.
   */
  entityType: 'article' | 'item' | 'link';

  /**
   * Unique identifier of the entity.
   * Passed to onClick callback for panel integration.
   */
  entityId: string;

  /**
   * Translation status for each language.
   * Keys are language codes, values are status strings.
   * Missing languages are treated as 'not started'.
   */
  translationStatuses: Partial<Record<SupportedLanguage, TranslationStatus>>;

  /**
   * Callback when the indicator is clicked.
   * Typically used to open the TranslationPreviewPanel.
   * @param entityType - The entity type (article, item, link)
   * @param entityId - The entity's unique identifier
   */
  onClick?: (entityType: string, entityId: string) => void;

  /**
   * Whether the component is in a loading state.
   * Shows shimmer animation when true.
   * @default false
   */
  loading?: boolean;

  /**
   * Size variant for the dots.
   * 'small' = 8px (w-2 h-2), 'medium' = 10px (w-2.5 h-2.5)
   * @default 'small'
   */
  size?: 'small' | 'medium';

  /**
   * Additional CSS classes for the container.
   */
  className?: string;
}

// =============================================================================
// Helper Types
// =============================================================================

/**
 * Configuration for a single language dot.
 * Used internally for rendering the dot row.
 */
export interface LanguageDotConfig {
  /** Language code */
  code: SupportedLanguage;
  /** Display name for tooltip */
  name: string;
  /** Flag emoji for tooltip */
  flag: string;
  /** Current translation status */
  status: TranslationStatus | 'not_started';
  /** Tailwind background color class */
  colorClass: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Status color mapping to Tailwind classes.
 * Follows the PRD color specification.
 */
export const STATUS_COLORS: Record<TranslationStatus | 'not_started', string> = {
  completed: 'bg-green-500',      // #10b981 - Green for complete
  pending: 'bg-amber-500',        // #f59e0b - Orange for pending
  processing: 'bg-amber-500',     // #f59e0b - Orange for processing
  failed: 'bg-red-500',           // #ef4444 - Red for failed
  manual: 'bg-violet-500',        // #a855f7 - Purple for manual
  not_started: 'bg-gray-300',     // #d1d5db - Gray for not started
};

/**
 * Status labels for accessibility and tooltips.
 */
export const STATUS_LABELS: Record<TranslationStatus | 'not_started', string> = {
  completed: 'Completed',
  pending: 'Pending',
  processing: 'Processing',
  failed: 'Failed',
  manual: 'Manual',
  not_started: 'Not Started',
};
```

**Acceptance Criteria:**
- [ ] `TranslationStatusColumnProps` interface is defined with all required properties
- [ ] `LanguageDotConfig` helper type is defined
- [ ] `STATUS_COLORS` constant maps all status values to Tailwind classes
- [ ] `STATUS_LABELS` constant provides human-readable status names
- [ ] All types have JSDoc comments explaining their purpose
- [ ] File imports `SupportedLanguage` and `TranslationStatus` from translation service types

---

### Task 3: Create Main Component
**Estimated Effort:** 3 story points
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

#### 3.1 Create Component File with Imports and Setup

```typescript
'use client';

/**
 * TranslationStatusColumn Component
 *
 * Compact visual indicator displaying translation status for all 6 supported
 * languages as a horizontal row of colored dots. Each dot represents one
 * language's translation state. Clicking opens the TranslationPreviewPanel.
 *
 * @module TranslationManagement/TranslationStatusColumn
 * @see docs/REQ-E05-014-create-translationstatuscolumn-component-overview.md
 * @created 2026-01-20
 */

import { useCallback, useMemo } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  type TranslationStatus,
} from '@/lib/translation-service/translation-service.types';
import type {
  TranslationStatusColumnProps,
  LanguageDotConfig,
} from './TranslationStatusColumn.types';
import { STATUS_COLORS, STATUS_LABELS } from './TranslationStatusColumn.types';
```

#### 3.2 Implement Helper Functions

```typescript
// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Build the configuration for all 6 language dots.
 * Returns array in fixed order: EN, FR, ES, DE, NL, IT
 */
function buildLanguageDots(
  translationStatuses: Partial<Record<SupportedLanguage, TranslationStatus>>
): LanguageDotConfig[] {
  return SUPPORTED_LANGUAGES.map((lang) => {
    const status = translationStatuses[lang.code] ?? 'not_started';
    return {
      code: lang.code,
      name: lang.name,
      flag: lang.flag ?? '',
      status,
      colorClass: STATUS_COLORS[status],
    };
  });
}

/**
 * Generate an accessibility label summarizing translation status.
 * Example: "Translation status: 4 of 6 languages completed"
 */
function generateAriaLabel(
  translationStatuses: Partial<Record<SupportedLanguage, TranslationStatus>>
): string {
  const totalLanguages = SUPPORTED_LANGUAGES.length;
  const completedCount = SUPPORTED_LANGUAGES.filter((lang) => {
    const status = translationStatuses[lang.code];
    return status === 'completed' || status === 'manual';
  }).length;

  return `Translation status: ${completedCount} of ${totalLanguages} languages completed`;
}
```

#### 3.3 Implement Individual Dot Component

```typescript
// =============================================================================
// Sub-components
// =============================================================================

interface LanguageDotProps {
  config: LanguageDotConfig;
  size: 'small' | 'medium';
}

/**
 * Individual language status dot with tooltip.
 */
function LanguageDot({ config, size }: LanguageDotProps) {
  const sizeClasses = size === 'small' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  const tooltipContent = `${config.flag} ${config.name} - ${STATUS_LABELS[config.status]}`;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span
            className={cn(
              'inline-block rounded-full transition-colors duration-200',
              sizeClasses,
              config.colorClass
            )}
            aria-hidden="true"
          />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className={cn(
              'z-50 overflow-hidden rounded-md',
              'bg-gray-900 dark:bg-gray-800 px-3 py-2',
              'text-xs text-white',
              'shadow-md',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2',
              'data-[side=top]:slide-in-from-bottom-2'
            )}
            sideOffset={5}
          >
            {tooltipContent}
            <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
```

#### 3.4 Implement Main Component

```typescript
// =============================================================================
// Main Component
// =============================================================================

/**
 * TranslationStatusColumn displays a compact row of 6 colored dots
 * representing the translation status for each supported language.
 *
 * @example
 * ```tsx
 * <TranslationStatusColumn
 *   entityType="item"
 *   entityId="item-123"
 *   translationStatuses={{
 *     en: 'completed',
 *     fr: 'completed',
 *     es: 'pending',
 *     de: 'failed',
 *   }}
 *   onClick={(type, id) => openPreviewPanel(type, id)}
 * />
 * ```
 */
export function TranslationStatusColumn({
  entityType,
  entityId,
  translationStatuses,
  onClick,
  loading = false,
  size = 'small',
  className,
}: TranslationStatusColumnProps) {
  // Build dot configurations with memoization
  const languageDots = useMemo(
    () => buildLanguageDots(translationStatuses),
    [translationStatuses]
  );

  // Generate accessibility label
  const ariaLabel = useMemo(
    () => generateAriaLabel(translationStatuses),
    [translationStatuses]
  );

  // Handle click with keyboard support
  const handleClick = useCallback(() => {
    onClick?.(entityType, entityId);
  }, [onClick, entityType, entityId]);

  // Handle keyboard activation (Enter/Space)
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  // Calculate container width based on size
  const containerWidth = size === 'small' ? 'w-20' : 'w-24';
  const gapClass = size === 'small' ? 'gap-1' : 'gap-1.5';

  // Loading state with shimmer effect
  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center',
          gapClass,
          containerWidth,
          'animate-pulse',
          className
        )}
        aria-label="Loading translation status"
        role="status"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              'inline-block rounded-full bg-gray-200 dark:bg-gray-700',
              size === 'small' ? 'w-2 h-2' : 'w-2.5 h-2.5'
            )}
          />
        ))}
      </div>
    );
  }

  // Interactive or static rendering based on onClick presence
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={cn(
        'flex items-center',
        gapClass,
        containerWidth,
        isClickable && [
          'cursor-pointer',
          'rounded-md',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'transition-colors duration-150',
          'p-1 -m-1', // Increase click area
        ],
        className
      )}
      role={isClickable ? 'button' : 'img'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
    >
      {languageDots.map((dot) => (
        <LanguageDot key={dot.code} config={dot} size={size} />
      ))}
    </div>
  );
}

export default TranslationStatusColumn;
```

**Acceptance Criteria:**
- [ ] Component imports all required dependencies
- [ ] `buildLanguageDots` function creates configuration for all 6 languages
- [ ] `generateAriaLabel` function produces descriptive accessibility text
- [ ] `LanguageDot` sub-component renders individual dots with tooltips
- [ ] Main component handles loading state with shimmer animation
- [ ] Component supports both clickable (button role) and static (img role) modes
- [ ] Keyboard navigation works with Enter and Space keys
- [ ] Focus ring is visible for keyboard users
- [ ] Dark mode is supported with appropriate Tailwind classes
- [ ] Component uses memoization for performance optimization
- [ ] Tooltips use Radix UI and follow existing TruncatedText patterns
- [ ] Fixed container width prevents table column fluctuation

---

### Task 4: Create Barrel Export for Component
**Estimated Effort:** 0.5 story points
**File:** `/src/components/TranslationManagement/TranslationStatusColumn/index.ts`

#### 4.1 Create Index File

```typescript
/**
 * TranslationStatusColumn Component Exports
 *
 * @module TranslationManagement/TranslationStatusColumn
 */

export { TranslationStatusColumn, default } from './TranslationStatusColumn';
export type {
  TranslationStatusColumnProps,
  LanguageDotConfig,
} from './TranslationStatusColumn.types';
export { STATUS_COLORS, STATUS_LABELS } from './TranslationStatusColumn.types';
```

**Acceptance Criteria:**
- [ ] Component is exported as named export and default export
- [ ] Props type is exported for external use
- [ ] Helper types and constants are exported for potential reuse

---

### Task 5: Create or Update TranslationManagement Index
**Estimated Effort:** 0.5 story points
**File:** `/src/components/TranslationManagement/index.ts`

#### 5.1 Create Parent Index File

If the file doesn't exist, create it. If it exists, add the TranslationStatusColumn export.

```typescript
/**
 * TranslationManagement Component Library
 *
 * Components for property owners to view, review, and manage
 * translations of their content.
 *
 * @module TranslationManagement
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 */

// TranslationStatusColumn - Compact table column indicator
export * from './TranslationStatusColumn';
```

**Acceptance Criteria:**
- [ ] `/src/components/TranslationManagement/index.ts` exists
- [ ] TranslationStatusColumn is exported from the parent module
- [ ] File includes module-level documentation

---

### Task 6: Verify and Test Component
**Estimated Effort:** 1 story point

#### 6.1 TypeScript Compilation Check

Run TypeScript compiler to verify no type errors:

```bash
npx tsc --noEmit
```

**Acceptance Criteria:**
- [ ] No TypeScript compilation errors
- [ ] All imports resolve correctly

#### 6.2 Visual Verification (Optional - if test environment exists)

Create a simple test page or Storybook story to verify:

1. Component renders 6 dots in horizontal row
2. Colors match status specification
3. Tooltips appear on hover with correct content
4. Click handler fires with correct parameters
5. Loading state shows shimmer animation
6. Keyboard navigation works

**Test Scenarios:**

| Scenario | Expected Result |
|----------|-----------------|
| All completed | 6 green dots |
| All pending | 6 orange dots |
| Mixed statuses | Colors match each status |
| No translation data | 6 gray dots (not_started) |
| Loading state | 6 gray pulsing dots |
| Click on indicator | onClick called with entityType, entityId |
| Tab to indicator | Focus ring visible |
| Press Enter | onClick called |
| Press Space | onClick called |
| Hover on dot | Tooltip shows flag, name, status |

---

## File Summary

### Files to Create

| File Path | Purpose | Estimated Lines |
|-----------|---------|-----------------|
| `/src/components/TranslationManagement/TranslationStatusColumn/index.ts` | Barrel export | ~15 |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Main component | ~200 |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts` | TypeScript types | ~80 |
| `/src/components/TranslationManagement/index.ts` | Parent module export | ~15 |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| None required for this task | Future tasks will integrate with ItemRow, etc. |

---

## Integration Examples

### With ItemRow Component (Future Task)

```tsx
// In ItemRow.tsx - add translation status column
import { TranslationStatusColumn } from '@/components/TranslationManagement';

// In the columns section:
<div className="hidden xl:flex w-24 items-center justify-center">
  <TranslationStatusColumn
    entityType="item"
    entityId={item.id}
    translationStatuses={item.translationStatuses ?? {}}
    onClick={(type, id) => onTranslationClick?.(type, id)}
    size="small"
  />
</div>
```

### With TranslationPreviewPanel (Future Integration)

```tsx
// Parent component manages preview state
const [previewTarget, setPreviewTarget] = useState<{
  type: string;
  id: string;
} | null>(null);

<TranslationStatusColumn
  entityType="article"
  entityId={article.id}
  translationStatuses={article.translationStatuses}
  onClick={(type, id) => setPreviewTarget({ type, id })}
/>

{previewTarget && (
  <TranslationPreviewPanel
    entityType={previewTarget.type as 'article' | 'item' | 'link'}
    entityId={previewTarget.id}
    isOpen={!!previewTarget}
    onClose={() => setPreviewTarget(null)}
  />
)}
```

---

## Styling Reference

### Color Palette (Tailwind Classes)

| Status | Background | Hex | Visual |
|--------|------------|-----|--------|
| Complete | `bg-green-500` | #10b981 | Green dot |
| Pending | `bg-amber-500` | #f59e0b | Orange dot |
| Processing | `bg-amber-500` | #f59e0b | Orange dot |
| Failed | `bg-red-500` | #ef4444 | Red dot |
| Manual | `bg-violet-500` | #a855f7 | Purple dot |
| Not Started | `bg-gray-300` | #d1d5db | Gray dot |

### Size Specifications

| Size | Dot Dimensions | Container Width | Gap |
|------|----------------|-----------------|-----|
| small | 8px (w-2 h-2) | 80px (w-20) | 4px (gap-1) |
| medium | 10px (w-2.5 h-2.5) | 96px (w-24) | 6px (gap-1.5) |

### Dark Mode Support

All colors use Tailwind's semantic classes that automatically adapt:
- Hover background: `hover:bg-gray-100 dark:hover:bg-gray-800`
- Tooltip background: `bg-gray-900 dark:bg-gray-800`
- Loading shimmer: `bg-gray-200 dark:bg-gray-700`

---

## Accessibility Checklist

- [ ] Group has appropriate `role` attribute (button when clickable, img when static)
- [ ] `aria-label` provides summary of translation status
- [ ] Individual dots are `aria-hidden` (tooltip provides info on interaction)
- [ ] Component is keyboard accessible (`tabIndex={0}` when clickable)
- [ ] Focus state is visible (ring-2 focus ring)
- [ ] Enter and Space keys activate click handler
- [ ] Loading state has `role="status"` for screen readers
- [ ] Tooltip content is accessible via Radix's portal

---

## Testing Checklist

### Unit Tests (Future Task)

```typescript
describe('TranslationStatusColumn', () => {
  it('renders 6 dots for all languages');
  it('applies correct color for completed status');
  it('applies correct color for pending status');
  it('applies correct color for failed status');
  it('applies correct color for manual status');
  it('applies gray color for missing/not_started status');
  it('shows loading shimmer when loading prop is true');
  it('calls onClick with entityType and entityId when clicked');
  it('calls onClick when Enter key is pressed');
  it('calls onClick when Space key is pressed');
  it('generates correct aria-label with completion count');
  it('shows tooltip with language name and status on hover');
  it('applies focus ring on keyboard focus');
  it('renders as button role when onClick provided');
  it('renders as img role when onClick not provided');
});
```

---

## Dependencies Verification

Before starting, verify these packages are available:

```bash
# Check package.json for these dependencies
grep "@radix-ui/react-tooltip" package.json
grep "tailwindcss" package.json
```

If `@radix-ui/react-tooltip` is not installed:

```bash
npm install @radix-ui/react-tooltip
```

---

## Notes

1. **Performance**: The component uses `useMemo` for dot configuration and aria-label to avoid unnecessary recalculations on re-render.

2. **Flexibility**: The `onClick` prop is optional, allowing the component to function as either an interactive button or a static visual indicator.

3. **Dark Mode**: All styles use Tailwind's dark mode variants for automatic theme support.

4. **Tooltip Provider**: Each LanguageDot wraps its own Tooltip.Provider. In a production app with many instances, consider lifting the Provider to a parent component for better performance.

5. **Integration Timing**: This component is designed to work standalone. The TranslationPreviewPanel integration (clicking to open panel) will be handled by parent components in future tasks.

---

## References

- Overview Document: `/docs/REQ-E05-014-create-translationstatuscolumn-component-overview.md`
- Request: `/docs/gen_requests_epic5.md` - REQ-E05-014
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Translation Types: `/src/lib/translation-service/translation-service.types.ts`
- Pattern Reference: `/src/components/ItemManager/components/shared/EngagementIndicator.tsx`
- Tooltip Pattern: `/src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx`
- Radix Tooltip Docs: https://www.radix-ui.com/primitives/docs/components/tooltip
