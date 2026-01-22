# Implementation Overview: Implement Stale Translation Indicator

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-023 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 |
| Breakdown Created | 2026-01-22 20:10 |
| T-shirt Size | M (Medium) |
| Estimated Effort | 8-10 hours |
| Phase | Phase 5 - Manual Edit Preservation |
| Task ID | 5.2 |
| Status | PENDING |

---

## Goals

Enhance the TranslationStatusItem component to visually indicate when manual translations have become stale (outdated) due to source content changes. Provide owners with clear visual warnings and an "Update Translation" action button to prompt them to review and refresh stale translations.

### Technical Goals

1. **Stale Detection Logic**: Implement utility function comparing `source_version_at` vs `source_updated_at` timestamps
2. **Visual Indicators**: Add amber/yellow warning styling (border, background, icon) for stale translations
3. **Status Badge Enhancement**: Update StatusBadge to show "Outdated" label with AlertTriangle icon
4. **Action Button**: Add "Update Translation" button for stale manual translations
5. **Component Props**: Extend TranslationStatusItemProps with stale detection timestamps
6. **Internationalization**: Add translation keys for stale status labels and tooltips

---

## Assumptions & Clarifications

### Assumptions

1. **Component Location**: TranslationStatusItem.tsx is in `/src/components/TranslationManagement/TranslationPreviewPanel/` per Epic 5 architecture plan (line 98)
2. **Component Existence**: The component may not exist yet (Epic 5 components are being built), so implementation may be creation rather than modification
3. **Stale Detection Scope**: Only manual translations (`status='manual'`) show prominent stale warnings; auto translations may auto-re-translate
4. **Timestamp Format**: Both `source_version_at` and `source_updated_at` accept Date objects or ISO 8601 strings
5. **Grace Period**: No grace period in initial implementation (every second counts as potential staleness)
6. **Amber Theme**: Consistent with ManualEditWarningDialog, using amber/yellow for warnings (not red errors)

### Clarifications Needed

- **Item**: Should auto-translated content (`status='auto'`) also show stale indicators, or just trigger silent re-translation?
- **Item**: Should there be a "grace period" (e.g., 5 minutes) to avoid marking translations as stale during rapid editing sessions?
- **Item**: What happens when "Update Translation" is clicked - open editor dialog or trigger automatic re-translation?

---

## Implementation Plan

### Step 1: Create Translation Utilities Module
**Description**: Create `/src/lib/translation-utils.ts` with stale detection logic
**Rationale**: Centralized utility functions for timestamp comparison, reusable across components
**Estimated Effort**: 1 hour

**Utility Functions:**

```typescript
/**
 * Translation Utilities
 *
 * Helper functions for translation status detection and management.
 *
 * @module lib/translation-utils
 * @created 2026-01-22
 */

/**
 * Determines if a translation is stale by comparing version and source timestamps.
 *
 * A translation is stale when the source content was updated AFTER the translation
 * was last generated/updated.
 *
 * @param sourceVersionAt - Timestamp when translation was based on source
 * @param sourceUpdatedAt - Current timestamp of source content
 * @returns true if translation is outdated, false otherwise
 */
export function isTranslationStale(
  sourceVersionAt: Date | string | null | undefined,
  sourceUpdatedAt: Date | string | null | undefined
): boolean {
  // Cannot determine staleness without both timestamps
  if (!sourceVersionAt || !sourceUpdatedAt) {
    return false;
  }

  try {
    const versionTime = new Date(sourceVersionAt).getTime();
    const sourceTime = new Date(sourceUpdatedAt).getTime();

    // Invalid dates
    if (isNaN(versionTime) || isNaN(sourceTime)) {
      return false;
    }

    // Stale if source was updated after translation version
    return sourceTime > versionTime;
  } catch (error) {
    console.error('Error checking translation staleness:', error);
    return false;
  }
}

/**
 * Determines if a translation is stale with a grace period.
 *
 * Useful for avoiding flickering during rapid editing sessions.
 *
 * @param sourceVersionAt - Timestamp when translation was based on source
 * @param sourceUpdatedAt - Current timestamp of source content
 * @param graceMinutes - Grace period in minutes (default: 5)
 * @returns true if translation is outdated beyond grace period
 */
export function isTranslationStaleWithGrace(
  sourceVersionAt: Date | string | null | undefined,
  sourceUpdatedAt: Date | string | null | undefined,
  graceMinutes: number = 5
): boolean {
  if (!sourceVersionAt || !sourceUpdatedAt) {
    return false;
  }

  try {
    const versionTime = new Date(sourceVersionAt).getTime();
    const sourceTime = new Date(sourceUpdatedAt).getTime();
    const graceMs = graceMinutes * 60 * 1000;

    if (isNaN(versionTime) || isNaN(sourceTime)) {
      return false;
    }

    // Stale if source was updated more than grace period after translation
    return sourceTime > (versionTime + graceMs);
  } catch (error) {
    console.error('Error checking translation staleness with grace:', error);
    return false;
  }
}

/**
 * Gets a human-readable time difference between two timestamps.
 *
 * @param olderDate - The older timestamp
 * @param newerDate - The newer timestamp
 * @returns Formatted string like "2 hours ago", "3 days ago"
 */
export function getTimeDifference(
  olderDate: Date | string,
  newerDate: Date | string
): string {
  try {
    const older = new Date(olderDate).getTime();
    const newer = new Date(newerDate).getTime();
    const diffMs = newer - older;

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  } catch (error) {
    return 'unknown';
  }
}
```

**Key Features:**
- Robust error handling with try-catch
- Null/undefined safety checks
- Invalid date detection
- Grace period variant for future use
- Time difference formatter for tooltips

---

### Step 2: Update TranslationStatusItemProps Interface
**Description**: Extend the props interface to include stale detection timestamps and callbacks
**Rationale**: Provides component with data needed for stale detection
**Estimated Effort**: 30 minutes

**Props Interface Extension:**

```typescript
/**
 * Props for TranslationStatusItem component
 */
export interface TranslationStatusItemProps {
  /** Language code (e.g., 'fr', 'de', 'es') */
  language: string;

  /** Translation status */
  status: 'complete' | 'pending' | 'missing' | 'manual' | 'auto';

  /** Last updated timestamp of the translation */
  lastUpdated?: Date | string;

  /** Callback when Edit button is clicked */
  onEdit?: () => void;

  // ===== NEW PROPS FOR STALE DETECTION =====

  /**
   * Timestamp when translation was created/updated based on source content.
   * From translation table's `source_version_at` column.
   */
  sourceVersionAt?: Date | string | null;

  /**
   * Timestamp of current source content (item/article updated_at).
   * From source entity's `updated_at` column.
   */
  sourceUpdatedAt?: Date | string | null;

  /**
   * Callback when "Update Translation" button is clicked.
   * Triggered for stale translations.
   */
  onUpdateTranslation?: () => void;

  /**
   * Whether the translation is currently being updated.
   * Shows loading spinner on Update Translation button.
   */
  isUpdating?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}
```

**File Location**: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

---

### Step 3: Create/Update TranslationStatusItem Component Structure
**Description**: Implement the component with stale detection logic and conditional rendering
**Rationale**: Core component implementation with visual hierarchy for stale states
**Estimated Effort**: 2.5 hours

**Component Structure:**

```typescript
'use client';

/**
 * TranslationStatusItem Component
 *
 * Displays translation status for a single language with stale detection.
 * Shows warning indicators and update actions for outdated manual translations.
 *
 * @module TranslationManagement/TranslationPreviewPanel
 * @see docs/REQ-E05-023-implement-stale-translation-indicator-overview.md
 * @created 2026-01-22
 */

import { AlertTriangle, Check, Clock, Edit, Languages, Loader2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { isTranslationStale } from '@/lib/translation-utils';

export function TranslationStatusItem({
  language,
  status,
  lastUpdated,
  onEdit,
  sourceVersionAt,
  sourceUpdatedAt,
  onUpdateTranslation,
  isUpdating = false,
  className,
}: TranslationStatusItemProps) {
  const t = useTranslations('translation.statusItem');

  // Determine if translation is stale (only for manual translations)
  const isStale = status === 'manual' && isTranslationStale(sourceVersionAt, sourceUpdatedAt);

  // Get language display name
  const languageDisplayName = getLanguageDisplayName(language);

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border transition-colors',
        // Stale styling: amber border and background
        isStale && 'border-amber-400 bg-amber-50 dark:bg-amber-950/20',
        // Normal styling
        !isStale && 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
        className
      )}
      role="region"
      aria-label={t('ariaLabel', { language: languageDisplayName })}
    >
      {/* Left side: Language and status */}
      <div className="flex items-center gap-3">
        {/* Language icon/flag */}
        <div className="flex-shrink-0">
          <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>

        {/* Language name and status badge */}
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {languageDisplayName}
          </p>
          <StatusBadge status={status} isStale={isStale} />
        </div>
      </div>

      {/* Right side: Actions and indicators */}
      <div className="flex items-center gap-2">
        {/* Stale warning icon (with tooltip) */}
        {isStale && (
          <StaleWarningIcon />
        )}

        {/* Update Translation button (only for stale translations) */}
        {isStale && onUpdateTranslation && (
          <button
            onClick={onUpdateTranslation}
            disabled={isUpdating}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md',
              'bg-amber-100 text-amber-700 hover:bg-amber-200',
              'dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
              'transition-all duration-200'
            )}
            aria-label={t('updateTranslationAriaLabel', { language: languageDisplayName })}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{t('updating')}</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>{t('updateTranslation')}</span>
              </>
            )}
          </button>
        )}

        {/* Edit button (always available) */}
        {onEdit && (
          <button
            onClick={onEdit}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md',
              'text-gray-700 bg-gray-100 hover:bg-gray-200',
              'dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
              'transition-colors duration-200'
            )}
            aria-label={t('editAriaLabel', { language: languageDisplayName })}
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('edit')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
```

**Key Features:**
- Stale detection using utility function
- Conditional amber styling for stale state
- Update Translation button with loading state
- ARIA labels for accessibility
- Dark mode support
- Responsive button labels (hide text on mobile)

---

### Step 4: Implement StatusBadge Sub-Component
**Description**: Create StatusBadge component showing translation status with stale override
**Rationale**: Encapsulates status display logic with icon and label
**Estimated Effort**: 1 hour

**StatusBadge Component:**

```typescript
/**
 * StatusBadge displays the translation status with appropriate icon and styling.
 * Overrides to show "Stale" badge for outdated manual translations.
 */
interface StatusBadgeProps {
  status: 'complete' | 'pending' | 'missing' | 'manual' | 'auto';
  isStale: boolean;
}

function StatusBadge({ status, isStale }: StatusBadgeProps) {
  const t = useTranslations('translation.statusItem');

  // Stale overrides normal status display
  if (isStale) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{t('stale')}</span>
      </span>
    );
  }

  // Normal status badges
  switch (status) {
    case 'complete':
      return (
        <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('complete')}</span>
        </span>
      );

    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('pending')}</span>
        </span>
      );

    case 'missing':
      return (
        <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <span>—</span>
          <span>{t('missing')}</span>
        </span>
      );

    case 'manual':
      return (
        <span className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400">
          <Edit className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('manual')}</span>
        </span>
      );

    case 'auto':
      return (
        <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('auto')}</span>
        </span>
      );

    default:
      return null;
  }
}
```

**Status Visual Guide:**
| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| Stale (override) | AlertTriangle | Amber | Outdated manual translation |
| Complete | Check | Green | Translation up-to-date |
| Pending | Clock | Blue | Translation in progress |
| Missing | — | Gray | No translation exists |
| Manual | Edit | Indigo | Manually edited |
| Auto | RefreshCw | Gray | Auto-generated |

---

### Step 5: Implement StaleWarningIcon Sub-Component
**Description**: Create visual warning indicator with tooltip for stale translations
**Rationale**: Additional visual cue beyond border/background styling
**Estimated Effort**: 30 minutes

**StaleWarningIcon Component:**

```typescript
/**
 * StaleWarningIcon displays an amber warning icon with tooltip
 * for stale translations.
 */
function StaleWarningIcon() {
  const t = useTranslations('translation.statusItem');

  return (
    <div
      className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900"
      title={t('staleTooltip')}
      role="img"
      aria-label={t('staleAriaLabel')}
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
    </div>
  );
}
```

**Features:**
- Circular amber background
- AlertTriangle icon
- Tooltip on hover showing explanation
- ARIA label for screen readers
- Dark mode support

---

### Step 6: Implement getLanguageDisplayName Helper
**Description**: Utility function to convert language codes to display names
**Rationale**: Consistent language name display across the component
**Estimated Effort**: 20 minutes

**Helper Function:**

```typescript
/**
 * Maps language codes to display names.
 * Falls back to uppercase code if mapping not found.
 */
function getLanguageDisplayName(language: string): string {
  const t = useTranslations('translation.statusItem.languages');

  // Try to get translated language name
  try {
    return t(language);
  } catch {
    // Fallback to uppercase code
    return language.toUpperCase();
  }
}
```

**Translation Keys Structure:**
```json
{
  "translation": {
    "statusItem": {
      "languages": {
        "es": "Spanish",
        "fr": "French",
        "de": "German",
        "it": "Italian",
        "nl": "Dutch"
      }
    }
  }
}
```

---

### Step 7: Add English Translation Keys
**Description**: Add all English i18n keys to `/messages/en.json`
**Rationale**: Enables internationalization for all new text
**Estimated Effort**: 30 minutes

**Translation Keys:**

```json
{
  "translation": {
    "statusItem": {
      "ariaLabel": "{language} translation status",
      "stale": "Outdated",
      "staleTooltip": "Source content has changed since this translation was last updated",
      "staleAriaLabel": "Translation is outdated",
      "updateTranslation": "Update Translation",
      "updateTranslationAriaLabel": "Update {language} translation",
      "updating": "Updating...",
      "edit": "Edit",
      "editAriaLabel": "Edit {language} translation",
      "complete": "Complete",
      "pending": "Pending",
      "missing": "Missing",
      "manual": "Manual",
      "auto": "Auto",
      "languages": {
        "es": "Spanish",
        "fr": "French",
        "de": "German",
        "it": "Italian",
        "nl": "Dutch"
      }
    }
  }
}
```

**Location**: Add to `/messages/en.json` under `translation.statusItem` namespace

---

### Step 8: Add Translation Keys for Other Locales
**Description**: Add translation keys for all supported locales (es, fr, de, it, nl)
**Rationale**: Ensures component works in all supported languages
**Estimated Effort**: 1.5 hours

**Translation Table (from spec lines 3908-3915):**

| Locale | File | stale | updateTranslation | staleTooltip |
|--------|------|-------|-------------------|--------------|
| **es** | `/messages/es.json` | Desactualizada | Actualizar traducción | El contenido de origen ha cambiado desde la última actualización de esta traducción |
| **fr** | `/messages/fr.json` | Obsolète | Mettre à jour la traduction | Le contenu source a changé depuis la dernière mise à jour de cette traduction |
| **de** | `/messages/de.json` | Veraltet | Übersetzung aktualisieren | Der Quellinhalt hat sich seit der letzten Aktualisierung dieser Übersetzung geändert |
| **it** | `/messages/it.json` | Obsoleta | Aggiorna traduzione | Il contenuto di origine è cambiato dall'ultimo aggiornamento di questa traduzione |
| **nl** | `/messages/nl.json` | Verouderd | Vertaling bijwerken | De broninhoud is gewijzigd sinds deze vertaling voor het laatst is bijgewerkt |

**Additional Keys per Locale:**
- All keys from Step 7 translated appropriately
- `languages.*` with localized language names (e.g., in Spanish: "Español", "Francés", "Alemán", "Italiano", "Holandés")

---

### Step 9: Create Barrel Export File
**Description**: Create/update index.ts in TranslationPreviewPanel directory
**Rationale**: Enables clean imports from parent modules
**Estimated Effort**: 10 minutes

**File: `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`**

```typescript
/**
 * TranslationPreviewPanel Component Exports
 *
 * Preview panel showing translation status for all languages.
 *
 * @module TranslationManagement/TranslationPreviewPanel
 * @created 2026-01-22
 */

export { TranslationStatusItem } from './TranslationStatusItem';
export type { TranslationStatusItemProps } from './TranslationStatusItem';

// Other exports from this directory...
// export { TranslationPreviewPanel } from './TranslationPreviewPanel';
// export { TranslationProgressBar } from './TranslationProgressBar';
```

---

### Step 10: Add TypeScript Types to Shared Types File
**Description**: Add/update shared types in TranslationManagement.types.ts
**Rationale**: Centralized type definitions for the module
**Estimated Effort**: 20 minutes

**File: `/src/components/TranslationManagement/TranslationManagement.types.ts`**

```typescript
/**
 * Shared types for TranslationManagement module
 */

/**
 * Translation status values
 */
export type TranslationStatus =
  | 'complete'   // Translation is complete and current
  | 'pending'    // Translation is being generated
  | 'missing'    // No translation exists
  | 'manual'     // Translation was manually edited
  | 'auto';      // Translation was auto-generated

/**
 * Supported language codes
 */
export type SupportedLanguage = 'es' | 'fr' | 'de' | 'it' | 'nl';

/**
 * Translation status data for a single language
 */
export interface LanguageTranslationStatus {
  language: SupportedLanguage;
  status: TranslationStatus;
  lastUpdated?: Date | string;
  sourceVersionAt?: Date | string | null;
  isStale?: boolean;
}
```

---

### Step 11: Add Unit Tests (Optional but Recommended)
**Description**: Create tests for stale detection utility functions
**Rationale**: Ensures timestamp comparison logic is correct
**Estimated Effort**: 1 hour

**File: `/src/lib/__tests__/translation-utils.test.ts`**

```typescript
import { isTranslationStale, isTranslationStaleWithGrace } from '../translation-utils';

describe('translation-utils', () => {
  describe('isTranslationStale', () => {
    it('returns false when both timestamps are null', () => {
      expect(isTranslationStale(null, null)).toBe(false);
    });

    it('returns false when sourceVersionAt is null', () => {
      expect(isTranslationStale(null, new Date())).toBe(false);
    });

    it('returns false when sourceUpdatedAt is null', () => {
      expect(isTranslationStale(new Date(), null)).toBe(false);
    });

    it('returns true when source was updated after translation', () => {
      const versionAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-01T11:00:00Z');
      expect(isTranslationStale(versionAt, updatedAt)).toBe(true);
    });

    it('returns false when translation is current', () => {
      const versionAt = new Date('2024-01-01T11:00:00Z');
      const updatedAt = new Date('2024-01-01T10:00:00Z');
      expect(isTranslationStale(versionAt, updatedAt)).toBe(false);
    });

    it('handles ISO string dates', () => {
      const versionAt = '2024-01-01T10:00:00Z';
      const updatedAt = '2024-01-01T11:00:00Z';
      expect(isTranslationStale(versionAt, updatedAt)).toBe(true);
    });

    it('returns false for invalid dates', () => {
      expect(isTranslationStale('invalid', 'also-invalid')).toBe(false);
    });
  });

  describe('isTranslationStaleWithGrace', () => {
    it('returns false within grace period', () => {
      const versionAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-01T10:02:00Z'); // 2 minutes later
      expect(isTranslationStaleWithGrace(versionAt, updatedAt, 5)).toBe(false);
    });

    it('returns true beyond grace period', () => {
      const versionAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-01T10:10:00Z'); // 10 minutes later
      expect(isTranslationStaleWithGrace(versionAt, updatedAt, 5)).toBe(true);
    });
  });
});
```

---

### Step 12: Testing and Quality Assurance
**Description**: Manual testing and verification of all functionality
**Rationale**: Ensure component works correctly before marking complete
**Estimated Effort**: 1.5 hours

**Test Checklist:**

**Stale Detection Logic:**
- [ ] Stale detection works with Date objects
- [ ] Stale detection works with ISO string dates
- [ ] Returns false when either timestamp is null/undefined
- [ ] Returns false when timestamps are equal
- [ ] Returns true when source updated after translation
- [ ] Returns false when translation is current
- [ ] Handles invalid dates gracefully (no crashes)

**Visual Display:**
- [ ] Amber border displays for stale translations
- [ ] Amber background displays for stale translations
- [ ] Normal border/background for non-stale translations
- [ ] StatusBadge shows "Outdated" with AlertTriangle for stale
- [ ] StatusBadge shows normal status for non-stale
- [ ] StaleWarningIcon displays for stale translations
- [ ] StaleWarningIcon has tooltip on hover

**Update Translation Button:**
- [ ] Button displays only for stale translations
- [ ] Button displays only when `onUpdateTranslation` callback provided
- [ ] Button shows "Update Translation" text with RefreshCw icon
- [ ] Button disabled when `isUpdating={true}`
- [ ] Button shows spinner and "Updating..." when loading
- [ ] Button calls `onUpdateTranslation` callback when clicked
- [ ] Button has proper ARIA label

**Edit Button:**
- [ ] Edit button displays when `onEdit` callback provided
- [ ] Edit button calls `onEdit` callback when clicked
- [ ] Edit button has proper ARIA label
- [ ] Button text hidden on mobile (sm breakpoint)

**Internationalization:**
- [ ] All text displays in English by default
- [ ] Switching to Spanish shows Spanish translations
- [ ] Switching to French shows French translations
- [ ] Switching to German shows German translations
- [ ] Switching to Italian shows Italian translations
- [ ] Switching to Dutch shows Dutch translations
- [ ] Language display names are correct

**Accessibility:**
- [ ] Component has proper ARIA labels
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Focus visible styling displays correctly
- [ ] Screen reader announces status correctly
- [ ] Tooltip accessible via keyboard focus

**Dark Mode:**
- [ ] All colors have dark mode variants
- [ ] Contrast is sufficient in dark mode
- [ ] Icons visible in dark mode

**Edge Cases:**
- [ ] Component handles missing optional props
- [ ] Component handles unknown language codes (fallback)
- [ ] Component handles very old timestamps
- [ ] Component handles future timestamps (edge case)
- [ ] No console errors with various prop combinations

**TypeScript and Build:**
- [ ] No TypeScript compilation errors
- [ ] No console errors during normal operation
- [ ] Component builds successfully in production mode

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create

| File | Purpose | Size Est. |
|------|---------|-----------|
| `/src/lib/translation-utils.ts` | Stale detection utility functions | ~100 lines |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Main component implementation | ~250-300 lines |
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Barrel export | ~15 lines |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared type definitions | ~50 lines |
| `/src/lib/__tests__/translation-utils.test.ts` | Unit tests (optional) | ~80 lines |

### Files to Modify

| File | Target | Type | Lines | Justification |
|------|--------|------|-------|---------------|
| `/messages/en.json` | `translation.statusItem.*` | Add | ~25 lines | English i18n strings |
| `/messages/es.json` | `translation.statusItem.*` | Add | ~25 lines | Spanish i18n strings |
| `/messages/fr.json` | `translation.statusItem.*` | Add | ~25 lines | French i18n strings |
| `/messages/de.json` | `translation.statusItem.*` | Add | ~25 lines | German i18n strings |
| `/messages/it.json` | `translation.statusItem.*` | Add | ~25 lines | Italian i18n strings |
| `/messages/nl.json` | `translation.statusItem.*` | Add | ~25 lines | Dutch i18n strings |

### Components/Modules to Reference (READ ONLY)

| File | Purpose |
|------|---------|
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage` type definition |
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Button styling patterns, ARIA attributes |

### Dependencies to Import

```typescript
// React
import React from 'react';

// Icons
import { AlertTriangle, Check, Clock, Edit, Languages, Loader2, RefreshCw } from 'lucide-react';

// i18n
import { useTranslations } from 'next-intl';

// Utils
import { cn } from '@/lib/utils';
import { isTranslationStale } from '@/lib/translation-utils';

// Types
import type { SupportedLanguage } from '@/lib/translation-service';
```

---

## Dependencies

### Depends On (Completed First)

- **REQ-E05-004** (source_version_at columns): Provides the timestamp columns in translation tables needed for stale detection
- **Epic 1** (Foundation): Translation tables with `translation_status` and `source_version_at` columns
- **Translation Service Module**: Provides `SupportedLanguage` type

### Blocks (Requires This First)

- **TranslationPreviewPanel** (parent component): Needs this component to display language statuses
- **Translation Management Page**: May integrate this component for status display

### Parallel Safety

**Files touched by this task:**
- `/src/lib/translation-utils.ts` (new file)
- `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` (new file)
- `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` (new file)
- `/src/components/TranslationManagement/TranslationManagement.types.ts` (new file)
- `/messages/*.json` (additive changes to `translation.statusItem.*` namespace)

**Conflicts with:** None (new component and utility, isolated namespace)

**Safe to parallelize with:**
- All other Epic 5 components (different files)
- Other translation namespace additions (different keys)

### External Dependencies

- **lucide-react**: Icons (already installed)
- **next-intl**: Translation function (already integrated)
- **Tailwind CSS**: Styling classes (already configured)
- **cn utility**: Class name merging (already exists)

---

## Risks and Considerations

### Potential Side Effects

1. **Timestamp Format Inconsistencies**: Database may return timestamps in different formats (ISO strings vs Date objects vs Unix timestamps)
   - **Mitigation**: Utility function accepts Date | string | null and normalizes via `new Date()` constructor
   - **Error Handling**: Try-catch blocks prevent crashes from invalid dates

2. **False Positives During Rapid Editing**: User rapidly editing source content may cause translations to flicker between stale/non-stale
   - **Mitigation**: `isTranslationStaleWithGrace` function available (though not used in initial implementation)
   - **Future Enhancement**: Could add 5-minute grace period to reduce flicker

3. **Performance with Many Languages**: Component re-renders on every prop change; stale detection runs on each render
   - **Mitigation**: Stale detection is simple timestamp comparison (very fast)
   - **Optimization**: Could memoize `isStale` calculation with `useMemo` if needed

4. **Timezone Issues**: Timestamps from different sources (client vs server) may have timezone discrepancies
   - **Mitigation**: Using `.getTime()` for comparison normalizes to UTC milliseconds
   - **Note**: Staleness is relative (source > version), not absolute time display

5. **Auto Translation Behavior Unclear**: Spec doesn't fully define how auto-translated content should behave when stale
   - **Risk**: Auto translations might accumulate as stale without user awareness
   - **Current Implementation**: Only manual translations show prominent stale warnings
   - **Future**: May need silent auto-re-translation for `status='auto'`

### Testing Requirements

1. **Timestamp Comparison Edge Cases**: Test with various timestamp formats, null values, invalid dates, equal timestamps
2. **Visual Regression Testing**: Verify amber styling vs normal styling in light/dark modes
3. **Accessibility Testing**: Screen reader testing, keyboard navigation verification
4. **Internationalization Testing**: Test all 6 locales thoroughly
5. **Integration Testing**: Test with parent TranslationPreviewPanel component (when it exists)
6. **Responsive Testing**: Verify mobile layout (hidden button text)

### Open Questions

- [ ] Should auto-generated translations (`status='auto'`) also show stale indicators, or should they trigger silent re-translation?
- [ ] Should there be a grace period (e.g., 5 minutes) to avoid marking translations as stale during active editing?
- [ ] What should "Update Translation" button do - open editor dialog or trigger automatic re-translation?
- [ ] Should the stale tooltip include the time difference ("Source updated 2 hours ago")?
- [ ] Should stale translations show a visual indicator in the Translation Management page table view?

---

## Out of Scope

The following items are explicitly **NOT** included in this implementation:

1. **Automatic Re-translation**: Component only shows indicators; automatic re-translation logic is separate
2. **Translation Editor Integration**: "Update Translation" callback implementation is parent's responsibility
3. **Realtime Updates**: No Supabase Realtime subscription for live stale status updates
4. **Batch Stale Detection**: No API endpoint to check staleness for multiple entities
5. **Stale History**: No tracking of how long a translation has been stale
6. **Notification System**: No alerts or notifications when translations become stale
7. **Grace Period Configuration**: No UI for configuring grace period (hardcoded in utility if used)
8. **Stale Translation Report**: No summary view of all stale translations across entities
9. **Priority Scoring**: No algorithm to prioritize which stale translations to update first
10. **Diff View**: No side-by-side comparison of old source vs new source that caused staleness
11. **Undo/Rollback**: No way to revert to previous translation version
12. **Custom Stale Threshold**: No per-language or per-entity stale detection rules
13. **Analytics**: No tracking of stale translation metrics
14. **Email Notifications**: No email alerts when translations become stale
15. **Bulk Update Action**: No way to update all stale translations at once from this component

---

## Notes for Implementation Agent

### Critical Implementation Details

1. **Component Location**: Create in `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` per Epic 5 architecture (line 98 of Plan-111).

2. **Stale Detection Only for Manual**: The condition `status === 'manual' && isTranslationStale(...)` ensures only manually edited translations show prominent stale warnings. Auto translations may handle staleness differently.

3. **Amber Theme Consistency**: Use `amber-400` border, `amber-50` background, `amber-600` text colors to match ManualEditWarningDialog warning theme.

4. **Timestamp Handling**: Accept both Date objects and ISO strings; normalize via `new Date()` constructor; use `.getTime()` for comparison.

5. **Error Handling in Utility**: The `isTranslationStale` function must never crash - wrap in try-catch and return `false` on any error.

6. **Dark Mode Support**: All colors must have dark mode variants (e.g., `bg-amber-50 dark:bg-amber-950/20`).

7. **Button Visibility Logic**: Update Translation button only renders when `isStale && onUpdateTranslation` - both conditions must be true.

8. **Language Display Names**: Use `useTranslations('translation.statusItem.languages')` for localized language names, fallback to uppercase code.

### Code Quality Standards

- **TypeScript**: Strict mode, no `any` types, all interfaces defined
- **Accessibility**: Full ARIA attributes, keyboard navigation, focus management
- **Internationalization**: All text via `useTranslations()`, no hardcoded strings
- **Error Handling**: Utility functions handle null/undefined/invalid gracefully
- **Performance**: Simple timestamp comparison (no expensive operations)
- **Dark Mode**: All colors have dark mode variants

### Testing Priorities

1. **Stale Detection Logic**: Test utility function with various timestamp combinations
2. **Visual Display**: Verify amber styling appears correctly for stale state
3. **Button Behavior**: Test Update Translation button click handler and loading state
4. **Accessibility**: Screen reader announces status and actions correctly
5. **Internationalization**: All 6 locales display correctly
6. **Edge Cases**: Null timestamps, invalid dates, equal timestamps

### Common Pitfalls to Avoid

- ❌ **Don't** show stale indicators for auto translations (only manual)
- ❌ **Don't** use red colors for stale state (use amber/yellow)
- ❌ **Don't** crash on null/undefined timestamps (return false)
- ❌ **Don't** forget dark mode color variants
- ❌ **Don't** forget ARIA labels for buttons and regions
- ❌ **Don't** forget to add translations to all 6 locale files
- ❌ **Don't** render Update button when callback not provided
- ❌ **Don't** use exact equality for timestamp comparison (use `>`)

---

**Document generated:** 2026-01-22 20:10

---

**END OF DOCUMENT**
