# REQ-351: Create TranslationStatusColumn Component - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks
**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Type:** NEW FEATURE
**Size:** M (Medium)
**Phase:** 3 - Dashboard Integration
**Task ID:** 3.2
**Epic:** L10N Epic 5 - Owner Translation Management
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)
**Overview Document:** REQ-351-create-translationstatuscolumn-component-overview.md

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating the `TranslationStatusColumn` component. This component displays a compact, horizontal row of six visual indicators (one per supported language) showing translation status, designed for integration into table-based content listings. Each indicator uses color-coded visual differentiation, and clicking the column opens the detailed translation preview panel.

---

## Prerequisites

Before starting implementation, verify:

1. **Epic 1 Foundation Complete:**
   - Translation tables exist: `item_translations`, `article_translations`, `link_translations`
   - Translation status values defined: `pending`, `processing`, `completed`, `failed`, `manual`

2. **i18n Configuration Available:**
   - `/src/lib/i18n/config.ts` exports `locales`, `localeMetadata`, `SupportedLocale`

3. **Utility Function Available:**
   - `/src/lib/utils.ts` exports `cn()` for class merging

4. **TranslationManagement Directory:**
   - Create `/src/components/TranslationManagement/` directory if it doesn't exist

---

## Task Breakdown

### Task 1: Create TranslationStatusColumn Directory Structure

**File:** Create directory `/src/components/TranslationManagement/TranslationStatusColumn/`

**Objective:** Set up the folder structure for the TranslationStatusColumn component module.

**Actions:**
1. Create the directory: `/src/components/TranslationManagement/TranslationStatusColumn/`
2. This task is a prerequisite for all subsequent tasks

**Verification:**
- Directory exists at `/src/components/TranslationManagement/TranslationStatusColumn/`

**Estimated Effort:** 0.1 story points

---

### Task 2: Create TranslationStatusColumn Types File

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts`

**Objective:** Define all TypeScript interfaces and types for the TranslationStatusColumn component.

**Actions:**

1. Create the file with the following type definitions:

```typescript
/**
 * TranslationStatusColumn Types
 *
 * Type definitions for the TranslationStatusColumn component used in table integrations.
 *
 * REQ-351: Create TranslationStatusColumn Component for Table Integration
 * Plan-111: L10N Epic 5 - Owner Translation Management, Phase 3, Task 3.2
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import type { SupportedLocale } from '@/lib/i18n/config';

/**
 * Translation status values matching database enum
 * 'missing' is a UI-only status when no translation record exists
 */
export type TranslationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'manual'
  | 'missing';

/**
 * Entity types that support translation
 */
export type TranslatableEntityType = 'article' | 'item' | 'link';

/**
 * Map of translation status by locale
 */
export type TranslationStatusMap = {
  [K in SupportedLocale]?: TranslationStatus;
};

/**
 * Props for the TranslationStatusColumn component
 */
export interface TranslationStatusColumnProps {
  /**
   * Type of entity being displayed
   */
  entityType: TranslatableEntityType;

  /**
   * Unique identifier for the entity
   */
  entityId: string;

  /**
   * Source language of the original content
   * Used to display the source language indicator differently (blue)
   */
  sourceLanguage: SupportedLocale;

  /**
   * Translation status for each language
   * Missing languages default to 'missing' status
   */
  translations: TranslationStatusMap;

  /**
   * Callback fired when the status column is clicked
   * Opens the translation preview panel
   */
  onClick?: (entityType: TranslatableEntityType, entityId: string) => void;

  /**
   * Whether the component is in a loading state
   * Displays skeleton placeholders when true
   * @default false
   */
  isLoading?: boolean;

  /**
   * Size variant for the status indicators
   * 'small' for compact table rows, 'medium' for larger displays
   * @default 'small'
   */
  size?: 'small' | 'medium';

  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;

  /**
   * Disable click interaction
   * When true, cursor and onClick are disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * Configuration for a single status indicator's visual appearance
 */
export interface StatusIndicatorConfig {
  /**
   * Background color Tailwind class
   */
  bgColor: string;

  /**
   * Border color Tailwind class (for hollow indicators)
   */
  borderColor: string;

  /**
   * Icon or symbol to display (optional, for non-dot variants)
   */
  icon?: string;

  /**
   * CSS animation class (for processing state)
   */
  animation?: string;

  /**
   * Whether the indicator should be hollow (ring only)
   */
  hollow?: boolean;
}
```

**Verification:**
- File compiles without TypeScript errors
- Types are importable from other files
- All documented interfaces match the overview specification

**Estimated Effort:** 0.5 story points

---

### Task 3: Create Module Index Export File

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/index.ts`

**Objective:** Create barrel export for the TranslationStatusColumn module.

**Actions:**

1. Create the file with exports:

```typescript
/**
 * TranslationStatusColumn Module Exports
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

export { TranslationStatusColumn } from './TranslationStatusColumn';
export type {
  TranslationStatusColumnProps,
  TranslationStatus,
  TranslatableEntityType,
  TranslationStatusMap,
  StatusIndicatorConfig,
} from './TranslationStatusColumn.types';
```

**Verification:**
- File compiles without errors
- Exports are accessible from parent module

**Estimated Effort:** 0.25 story points

---

### Task 4: Create Base TranslationStatusColumn Component Structure

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Objective:** Create the main component file with basic structure, imports, and horizontal flex layout for 6 indicators.

**Actions:**

1. Create the file with base component structure:

```typescript
'use client';

/**
 * TranslationStatusColumn Component
 *
 * Compact visual indicator showing translation status for all six supported languages.
 * Designed for integration into table columns, displaying color-coded status dots.
 * Clicking the column opens the translation preview panel for the associated content.
 *
 * REQ-351: Create TranslationStatusColumn Component for Table Integration
 * Plan-111: L10N Epic 5 - Owner Translation Management, Phase 3, Task 3.2
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { locales, localeMetadata, type SupportedLocale } from '@/lib/i18n/config';
import type {
  TranslationStatusColumnProps,
  TranslationStatus,
  StatusIndicatorConfig,
} from './TranslationStatusColumn.types';

// =============================================================================
// Constants
// =============================================================================

/**
 * Visual configuration for each translation status
 */
const STATUS_STYLES: Record<TranslationStatus, StatusIndicatorConfig> = {
  completed: {
    bgColor: 'bg-green-500',
    borderColor: 'border-green-500',
    hollow: false,
  },
  manual: {
    bgColor: 'bg-violet-500',
    borderColor: 'border-violet-500',
    hollow: false,
  },
  pending: {
    bgColor: 'bg-amber-400',
    borderColor: 'border-amber-400',
    hollow: true,
  },
  processing: {
    bgColor: 'bg-amber-400',
    borderColor: 'border-amber-400',
    animation: 'animate-pulse',
    hollow: false,
  },
  failed: {
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
    hollow: false,
  },
  missing: {
    bgColor: 'bg-gray-300',
    borderColor: 'border-gray-300',
    hollow: true,
  },
};

/**
 * Source language indicator style (blue filled dot)
 */
const SOURCE_STYLE: StatusIndicatorConfig = {
  bgColor: 'bg-blue-500',
  borderColor: 'border-blue-500',
  hollow: false,
};

/**
 * Human-readable status labels for tooltips
 */
const STATUS_LABELS: Record<TranslationStatus, string> = {
  completed: 'Translated',
  manual: 'Manually edited',
  pending: 'Pending',
  processing: 'Translating...',
  failed: 'Failed',
  missing: 'Not translated',
};

/**
 * Size configuration for indicators
 */
const SIZE_CLASSES = {
  small: {
    indicator: 'w-3 h-3',
    container: 'gap-1 py-1 px-2',
    minWidth: 'min-w-[80px]',
  },
  medium: {
    indicator: 'w-4 h-4',
    container: 'gap-1.5 py-1.5 px-3',
    minWidth: 'min-w-[96px]',
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the visual configuration for a status indicator
 */
function getIndicatorStyle(
  locale: SupportedLocale,
  status: TranslationStatus,
  sourceLanguage: SupportedLocale
): StatusIndicatorConfig {
  // Source language gets special blue indicator
  if (locale === sourceLanguage) {
    return SOURCE_STYLE;
  }
  return STATUS_STYLES[status];
}

/**
 * Generate tooltip text for a status indicator
 */
function getTooltipText(
  locale: SupportedLocale,
  status: TranslationStatus,
  sourceLanguage: SupportedLocale
): string {
  const languageName = localeMetadata[locale].name;
  if (locale === sourceLanguage) {
    return `${languageName}: Original`;
  }
  return `${languageName}: ${STATUS_LABELS[status]}`;
}

// =============================================================================
// Component
// =============================================================================

/**
 * TranslationStatusColumn - Compact translation status indicator for table columns
 *
 * Displays six visual indicators (one per supported language) showing translation
 * status with color coding. Clicking opens the translation preview panel.
 *
 * @example
 * ```tsx
 * <TranslationStatusColumn
 *   entityType="item"
 *   entityId="123"
 *   sourceLanguage="en"
 *   translations={{ en: 'completed', fr: 'completed', es: 'pending' }}
 *   onClick={(type, id) => openPreview(type, id)}
 * />
 * ```
 */
export function TranslationStatusColumn({
  entityType,
  entityId,
  sourceLanguage,
  translations,
  onClick,
  isLoading = false,
  size = 'small',
  className,
  disabled = false,
}: TranslationStatusColumnProps) {
  const sizeConfig = SIZE_CLASSES[size];

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick(entityType, entityId);
    }
  }, [disabled, onClick, entityType, entityId]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && !disabled && onClick) {
        event.preventDefault();
        onClick(entityType, entityId);
      }
    },
    [disabled, onClick, entityType, entityId]
  );

  // ---------------------------------------------------------------------------
  // Memoized Values
  // ---------------------------------------------------------------------------

  const indicators = useMemo(() => {
    return locales.map((locale) => {
      const status = translations[locale] || 'missing';
      const style = getIndicatorStyle(locale, status, sourceLanguage);
      const tooltip = getTooltipText(locale, status, sourceLanguage);

      return {
        locale,
        status,
        style,
        tooltip,
      };
    });
  }, [translations, sourceLanguage]);

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div
        className={cn(
          'inline-flex items-center',
          sizeConfig.container,
          sizeConfig.minWidth,
          className
        )}
        aria-label="Loading translation status"
        role="status"
      >
        {locales.map((locale) => (
          <span
            key={locale}
            className={cn(
              'rounded-full bg-gray-200 animate-pulse',
              sizeConfig.indicator
            )}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isClickable = !disabled && !!onClick;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded',
        sizeConfig.container,
        sizeConfig.minWidth,
        isClickable && 'cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : 'group'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={`Translation status for ${entityType}. Click to view details.`}
      aria-disabled={disabled}
    >
      {indicators.map(({ locale, style, tooltip }) => (
        <span
          key={locale}
          className={cn(
            'rounded-full',
            sizeConfig.indicator,
            style.hollow
              ? cn('border-2 bg-transparent', style.borderColor)
              : style.bgColor,
            style.animation
          )}
          title={tooltip}
          aria-hidden="true"
        />
      ))}
      {/* Screen reader summary */}
      <span className="sr-only">
        {indicators.map(({ locale, tooltip }) => tooltip).join(', ')}
      </span>
    </div>
  );
}

export default TranslationStatusColumn;
```

**Verification:**
- Component renders without errors
- 6 indicators display in horizontal layout
- Loading state shows 6 skeleton dots
- Component accepts all props defined in types

**Estimated Effort:** 1.5 story points

---

### Task 5: Create/Update Parent TranslationManagement Index

**File:** `/src/components/TranslationManagement/index.ts`

**Objective:** Create or update the parent barrel export to include TranslationStatusColumn.

**Actions:**

1. If file doesn't exist, create it:

```typescript
/**
 * TranslationManagement Module Exports
 *
 * Public API for translation management components.
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

// TranslationStatusColumn
export {
  TranslationStatusColumn,
  type TranslationStatusColumnProps,
  type TranslationStatus,
  type TranslatableEntityType,
  type TranslationStatusMap,
} from './TranslationStatusColumn';
```

2. If file exists, add the exports for TranslationStatusColumn

**Verification:**
- `TranslationStatusColumn` is importable from `@/components/TranslationManagement`
- Types are also importable from the same path
- Build passes without errors

**Estimated Effort:** 0.25 story points

---

### Task 6: Create/Update Shared TranslationManagement Types

**File:** `/src/components/TranslationManagement/TranslationManagement.types.ts`

**Objective:** Create shared type definitions that can be used across all TranslationManagement components for consistency.

**Actions:**

1. Create or update the file:

```typescript
/**
 * TranslationManagement Shared Types
 *
 * Common type definitions shared across all TranslationManagement components.
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import type { SupportedLocale } from '@/lib/i18n/config';

/**
 * Translation status values matching database enum
 * 'missing' is a UI-only status when no translation record exists
 */
export type TranslationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'manual'
  | 'missing';

/**
 * Entity types that support translation
 */
export type TranslatableEntityType = 'article' | 'item' | 'link';

/**
 * Map of translation status by locale
 */
export type TranslationStatusMap = {
  [K in SupportedLocale]?: TranslationStatus;
};

/**
 * Summary of translation progress
 */
export interface TranslationProgressSummary {
  /** Total number of languages */
  total: number;
  /** Number of completed translations */
  completed: number;
  /** Number of pending translations */
  pending: number;
  /** Number of failed translations */
  failed: number;
  /** Number of manually edited translations */
  manual: number;
  /** Completion percentage (0-100) */
  percentage: number;
}
```

2. Update TranslationStatusColumn.types.ts to import shared types instead of re-defining:

```typescript
// At the top of TranslationStatusColumn.types.ts
export type {
  TranslationStatus,
  TranslatableEntityType,
  TranslationStatusMap,
} from '../TranslationManagement.types';
```

**Verification:**
- Shared types are importable from parent module
- No duplicate type definitions exist
- All components using these types compile correctly

**Estimated Effort:** 0.5 story points

---

### Task 7: Add Unit Tests for TranslationStatusColumn

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.test.tsx`

**Objective:** Write comprehensive unit tests covering rendering, interactions, and accessibility.

**Actions:**

1. Create the test file:

```typescript
/**
 * TranslationStatusColumn Unit Tests
 *
 * @created 2026-01-19
 * @lastModified 2026-01-19
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationStatusColumn } from './TranslationStatusColumn';
import type { TranslationStatusMap } from './TranslationStatusColumn.types';

describe('TranslationStatusColumn', () => {
  const defaultProps = {
    entityType: 'item' as const,
    entityId: 'test-123',
    sourceLanguage: 'en' as const,
    translations: {
      en: 'completed',
      fr: 'completed',
      es: 'pending',
      de: 'processing',
      nl: 'failed',
      it: 'missing',
    } as TranslationStatusMap,
  };

  // ---------------------------------------------------------------------------
  // Rendering Tests
  // ---------------------------------------------------------------------------

  describe('Rendering', () => {
    it('renders six status indicators', () => {
      render(<TranslationStatusColumn {...defaultProps} />);

      // Should have 6 visible indicator elements
      const container = screen.getByRole('group');
      const indicators = container.querySelectorAll('span[title]');
      expect(indicators).toHaveLength(6);
    });

    it('renders correct colors for each status', () => {
      const { container } = render(<TranslationStatusColumn {...defaultProps} />);

      // Check for specific color classes
      expect(container.querySelector('.bg-blue-500')).toBeInTheDocument(); // en - source
      expect(container.querySelector('.bg-green-500')).toBeInTheDocument(); // fr - completed
      expect(container.querySelector('.border-amber-400')).toBeInTheDocument(); // es - pending (hollow)
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument(); // de - processing
      expect(container.querySelector('.bg-red-500')).toBeInTheDocument(); // nl - failed
    });

    it('shows source language as blue indicator', () => {
      render(<TranslationStatusColumn {...defaultProps} />);

      const enIndicator = screen.getByTitle('English: Original');
      expect(enIndicator).toHaveClass('bg-blue-500');
    });

    it('renders loading skeleton when isLoading is true', () => {
      render(<TranslationStatusColumn {...defaultProps} isLoading={true} />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Loading translation status');

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(6);
    });

    it('applies small size classes by default', () => {
      const { container } = render(<TranslationStatusColumn {...defaultProps} />);

      const indicators = container.querySelectorAll('span[title]');
      indicators.forEach((indicator) => {
        expect(indicator).toHaveClass('w-3', 'h-3');
      });
    });

    it('applies medium size classes when size="medium"', () => {
      const { container } = render(
        <TranslationStatusColumn {...defaultProps} size="medium" />
      );

      const indicators = container.querySelectorAll('span[title]');
      indicators.forEach((indicator) => {
        expect(indicator).toHaveClass('w-4', 'h-4');
      });
    });

    it('applies custom className', () => {
      const { container } = render(
        <TranslationStatusColumn {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // ---------------------------------------------------------------------------
  // Interaction Tests
  // ---------------------------------------------------------------------------

  describe('Interactions', () => {
    it('calls onClick with entityType and entityId when clicked', async () => {
      const onClick = vi.fn();
      render(<TranslationStatusColumn {...defaultProps} onClick={onClick} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith('item', 'test-123');
    });

    it('does not call onClick when disabled', async () => {
      const onClick = vi.fn();
      render(
        <TranslationStatusColumn {...defaultProps} onClick={onClick} disabled={true} />
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it('triggers onClick on Enter key press', async () => {
      const onClick = vi.fn();
      render(<TranslationStatusColumn {...defaultProps} onClick={onClick} />);

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('triggers onClick on Space key press', async () => {
      const onClick = vi.fn();
      render(<TranslationStatusColumn {...defaultProps} onClick={onClick} />);

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard(' ');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('has cursor-pointer when onClick is provided', () => {
      const onClick = vi.fn();
      const { container } = render(
        <TranslationStatusColumn {...defaultProps} onClick={onClick} />
      );

      expect(container.firstChild).toHaveClass('cursor-pointer');
    });

    it('has cursor-not-allowed when disabled', () => {
      const { container } = render(
        <TranslationStatusColumn {...defaultProps} onClick={vi.fn()} disabled={true} />
      );

      expect(container.firstChild).toHaveClass('cursor-not-allowed');
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility Tests
  // ---------------------------------------------------------------------------

  describe('Accessibility', () => {
    it('has appropriate aria-label', () => {
      render(<TranslationStatusColumn {...defaultProps} onClick={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Translation status')
      );
    });

    it('has role="button" when clickable', () => {
      render(<TranslationStatusColumn {...defaultProps} onClick={vi.fn()} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has role="group" when not clickable', () => {
      render(<TranslationStatusColumn {...defaultProps} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('sets aria-disabled when disabled', () => {
      render(
        <TranslationStatusColumn {...defaultProps} onClick={vi.fn()} disabled={true} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('has tooltips with language names and status', () => {
      render(<TranslationStatusColumn {...defaultProps} />);

      expect(screen.getByTitle('English: Original')).toBeInTheDocument();
      expect(screen.getByTitle('French: Translated')).toBeInTheDocument();
      expect(screen.getByTitle('Spanish: Pending')).toBeInTheDocument();
      expect(screen.getByTitle('German: Translating...')).toBeInTheDocument();
      expect(screen.getByTitle('Dutch: Failed')).toBeInTheDocument();
      expect(screen.getByTitle('Italian: Not translated')).toBeInTheDocument();
    });

    it('includes screen reader summary text', () => {
      render(<TranslationStatusColumn {...defaultProps} />);

      const srText = screen.getByText(/English: Original/);
      expect(srText).toHaveClass('sr-only');
    });

    it('is focusable when clickable', () => {
      render(<TranslationStatusColumn {...defaultProps} onClick={vi.fn()} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------

  describe('Edge Cases', () => {
    it('handles empty translations object', () => {
      render(
        <TranslationStatusColumn
          {...defaultProps}
          translations={{}}
        />
      );

      // All indicators should show as missing
      const missingIndicators = screen.getAllByTitle(/Not translated/);
      expect(missingIndicators.length).toBeGreaterThan(0);
    });

    it('handles partial translations object', () => {
      render(
        <TranslationStatusColumn
          {...defaultProps}
          translations={{ en: 'completed', fr: 'completed' }}
        />
      );

      expect(screen.getByTitle('English: Original')).toBeInTheDocument();
      expect(screen.getByTitle('French: Translated')).toBeInTheDocument();
      expect(screen.getByTitle('Spanish: Not translated')).toBeInTheDocument();
    });

    it('renders without onClick prop', () => {
      expect(() => {
        render(<TranslationStatusColumn {...defaultProps} />);
      }).not.toThrow();
    });
  });
});
```

**Verification:**
- All tests pass with `npm run test`
- Coverage meets minimum threshold for component
- Tests cover rendering, interactions, and accessibility

**Estimated Effort:** 1.0 story points

---

### Task 8: Verify Build and TypeScript Compilation

**Objective:** Ensure the component builds without errors and integrates correctly.

**Actions:**

1. Run TypeScript compilation:
   ```bash
   npm run type-check
   ```

2. Run build:
   ```bash
   npm run build
   ```

3. Run linting:
   ```bash
   npm run lint
   ```

4. Fix any errors or warnings

**Verification:**
- No TypeScript errors
- Build succeeds
- No linting errors or warnings

**Estimated Effort:** 0.25 story points

---

### Task 9: Create Storybook Story (Optional Enhancement)

**File:** `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.stories.tsx`

**Objective:** Create Storybook stories for visual testing and documentation (if Storybook is used in project).

**Actions:**

1. Create story file showcasing different states:
   - Default state with mixed statuses
   - All completed
   - All pending
   - All failed
   - Loading state
   - Disabled state
   - Different sizes

**Verification:**
- Stories render correctly in Storybook
- All states are visually correct

**Estimated Effort:** 0.5 story points (optional)

---

## File Summary

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationStatusColumn/index.ts` | Module barrel export |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` | Main component implementation |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.types.ts` | TypeScript type definitions |
| `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.test.tsx` | Unit tests |

### Files to Create/Modify

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/src/components/TranslationManagement/index.ts` | Create or Modify | Parent barrel export |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Create or Modify | Shared types |

### Files to Reference (Read-Only)

| File Path | Information Needed |
|-----------|-------------------|
| `/src/lib/i18n/config.ts` | `locales`, `localeMetadata`, `SupportedLocale` type |
| `/src/lib/utils.ts` | `cn()` utility for class merging |
| `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Pattern for dot/icon variants with color states |
| `/src/components/ItemManager/components/shared/TagChip.tsx` | Pattern for compact visual indicators |

---

## Definition of Done Checklist

- [ ] Directory structure created at `/src/components/TranslationManagement/TranslationStatusColumn/`
- [ ] `TranslationStatusColumn.types.ts` created with all type definitions
- [ ] `index.ts` barrel export created for module
- [ ] `TranslationStatusColumn.tsx` component implemented
- [ ] Component renders 6 status indicators in horizontal layout
- [ ] Source language displays as blue indicator
- [ ] Completed translations display as green
- [ ] Pending translations display as hollow orange
- [ ] Processing translations display with pulse animation
- [ ] Failed translations display as red
- [ ] Missing translations display as hollow gray
- [ ] Manual edits display as purple
- [ ] Loading state displays skeleton indicators
- [ ] Click handler fires with correct entityType and entityId
- [ ] Keyboard navigation works (Enter/Space triggers onClick)
- [ ] Disabled state prevents interaction
- [ ] Tooltips show language name and status
- [ ] Screen reader text provides full status summary
- [ ] aria-label and roles are correctly set
- [ ] Parent barrel export updated
- [ ] Shared types file created/updated
- [ ] Unit tests written and passing
- [ ] TypeScript compilation passes without errors
- [ ] Build succeeds
- [ ] Linting passes

---

## Effort Summary

| Task | Estimated Effort |
|------|------------------|
| Task 1: Create directory structure | 0.1 SP |
| Task 2: Create types file | 0.5 SP |
| Task 3: Create module index export | 0.25 SP |
| Task 4: Create base component | 1.5 SP |
| Task 5: Create/update parent index | 0.25 SP |
| Task 6: Create/update shared types | 0.5 SP |
| Task 7: Add unit tests | 1.0 SP |
| Task 8: Verify build | 0.25 SP |
| Task 9: Create Storybook story (optional) | 0.5 SP |
| **Total (without optional)** | **4.35 SP** |
| **Total (with optional)** | **4.85 SP** |

---

## Dependencies Between Tasks

```
Task 1 (Directory)
    │
    ▼
Task 2 (Types) ──────────┐
    │                    │
    ▼                    ▼
Task 3 (Index)    Task 6 (Shared Types)
    │                    │
    └──────┬─────────────┘
           │
           ▼
       Task 4 (Component)
           │
           ▼
       Task 5 (Parent Export)
           │
           ▼
       Task 7 (Tests)
           │
           ▼
       Task 8 (Verify Build)
           │
           ▼
       Task 9 (Storybook - Optional)
```

---

## References

- **Overview Document:** `REQ-351-create-translationstatuscolumn-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **i18n Config:** `/src/lib/i18n/config.ts`
- **Pattern Reference:** `/src/components/ItemManager/components/shared/EngagementIndicator.tsx`

---

*Document generated for FAQBNB REQ-351 - TranslationStatusColumn Component Implementation*
