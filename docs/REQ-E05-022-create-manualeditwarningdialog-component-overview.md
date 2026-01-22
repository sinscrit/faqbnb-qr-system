# Implementation Overview: Create ManualEditWarningDialog Component

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-022 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 |
| Breakdown Created | 2026-01-22 20:06 |
| T-shirt Size | M (Medium) |
| Estimated Effort | 6-8 hours |
| Phase | Phase 5 - Manual Edit Preservation |
| Task ID | 5.1 |
| Status | PENDING |

---

## Goals

Create a warning dialog component that protects property owners from accidentally losing manually edited translations when updating source content. The dialog presents clear options to either preserve manual translations (marking them as stale) or intentionally overwrite them with fresh machine translations.

### Technical Goals

1. **Warning Dialog**: Create a modal dialog component following existing ConfirmDeleteDialog pattern
2. **Language Display**: Show list of affected languages with clear visual presentation
3. **Decision Options**: Provide two distinct action buttons (Keep Manual / Re-translate All) with appropriate styling
4. **Accessibility**: Full keyboard navigation, ARIA attributes, and focus management
5. **Internationalization**: Support for all 6 locales with proper translations
6. **Visual Hierarchy**: Emphasize the "safe" option (Keep Manual) as the primary action

---

## Assumptions & Clarifications

### Assumptions

1. **Dialog Pattern**: Following the custom dialog implementation pattern from ConfirmDeleteDialog (not Radix Dialog)
2. **Language List Source**: The parent component will determine which languages have manual edits before opening the dialog
3. **Color Scheme**: Amber/yellow for warning (not red) since this is a cautionary dialog, not an error
4. **Button Hierarchy**: "Keep manual edits" is the recommended/safe option (primary button styling)
5. **Manual Status**: The `translation_status='manual'` column in translation tables indicates manually edited translations
6. **Loading State**: Only one button shows loading state at a time (the one that was clicked)

### Clarifications Needed

- **Item**: None - implementation is straightforward with clear requirements and patterns

---

## Implementation Plan

### Step 1: Create Component Directory Structure
**Description**: Set up the directory structure for the ManualEditWarning components
**Rationale**: Establishes organized file structure following project conventions
**Estimated Effort**: 5 minutes

**Create directories:**
```
/src/components/TranslationManagement/
└── ManualEditWarning/
    ├── ManualEditWarningDialog.tsx
    └── index.ts
```

**Note**: The `TranslationManagement/` parent directory may already exist from other Epic 5 components.

---

### Step 2: Define TypeScript Types and Constants
**Description**: Define the props interface, language display mapping, and component types
**Rationale**: Type safety foundation before implementation
**Estimated Effort**: 30 minutes

**Props Interface:**
```typescript
export interface ManualEditWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Array of language codes that have manual edits (e.g., ['fr', 'de', 'es']) */
  manuallyEditedLanguages: string[];

  /** Callback when user chooses to keep manual edits (update source only) */
  onKeepManual: () => void;

  /** Callback when user chooses to overwrite manual edits (re-translate all) */
  onOverwrite: () => void;

  /** Callback when user cancels the operation */
  onCancel: () => void;

  /** Loading state during operation */
  loading?: boolean;

  /** Entity type being updated (for context in dialog message) */
  entityType?: 'item' | 'article';

  /** Optional additional CSS classes */
  className?: string;
}
```

**Constants:**
```typescript
// Language display name mapping
// Using the canonical language list from translation-service.types.ts
const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  nl: 'Dutch',
};

// Maximum languages to display without scroll
const MAX_VISIBLE_LANGUAGES = 6;
```

**Note**: The spec mentions 'pt' (Portuguese) but the codebase source of truth (`translation-service.types.ts`) defines 'it' (Italian). Using the codebase definition.

---

### Step 3: Create Component Structure with Dialog Container
**Description**: Implement the basic dialog structure with backdrop, container, and conditional rendering
**Rationale**: Establishes dialog foundation following ConfirmDeleteDialog pattern
**Estimated Effort**: 1 hour

**Implementation Pattern:**
```typescript
'use client';

import { AlertTriangle, Loader2, Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export function ManualEditWarningDialog({
  isOpen,
  manuallyEditedLanguages,
  onKeepManual,
  onOverwrite,
  onCancel,
  loading = false,
  entityType = 'item',
  className,
}: ManualEditWarningDialogProps) {
  const t = useTranslations('translation.manualEditWarning');

  // Don't render if not open or no manual edits
  if (!isOpen || manuallyEditedLanguages.length === 0) {
    return null;
  }

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      e.preventDefault();
      onCancel();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="manual-edit-warning-title"
      aria-describedby="manual-edit-warning-description"
    >
      <div
        className={cn(
          'bg-white rounded-lg shadow-xl max-w-md w-full mx-4',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content sections to be added */}
      </div>
    </div>
  );
}
```

**Key Features:**
- Conditional rendering: Only renders when `isOpen={true}` AND `manuallyEditedLanguages.length > 0`
- Backdrop click handler with loading state check
- Escape key handler with loading state check
- ARIA attributes for accessibility
- Entrance animation: `animate-in fade-in zoom-in-95 duration-200`

**Pattern Reference:**
- Lines 193-210 from ConfirmDeleteDialog.tsx

---

### Step 4: Implement Dialog Header with Warning Icon
**Description**: Add the header section with amber warning icon and title
**Rationale**: Visual warning indicator that catches user attention
**Estimated Effort**: 30 minutes

**Header Section:**
```tsx
{/* Header with warning icon */}
<div className="flex items-start gap-4 p-6 pb-4">
  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-amber-100">
    <AlertTriangle className="w-6 h-6 text-amber-600" aria-hidden="true" />
  </div>
  <div className="flex-1">
    <h3
      id="manual-edit-warning-title"
      className="text-lg font-semibold text-gray-900"
    >
      {t('title')}
    </h3>
    <p
      id="manual-edit-warning-description"
      className="mt-2 text-sm text-gray-600"
    >
      {t('description')}
    </p>
  </div>
</div>
```

**Key Differences from ConfirmDeleteDialog:**
- **Amber/Yellow colors** instead of red: `bg-amber-100`, `text-amber-600`
- Rationale: This is a warning, not an error/destructive action
- Icon: `AlertTriangle` (same as ConfirmDeleteDialog)
- Structure follows exact same pattern for consistency

**Pattern Reference:**
- Lines 212-230 from ConfirmDeleteDialog.tsx

---

### Step 5: Implement Language List Display
**Description**: Create the scrollable list of affected languages
**Rationale**: Shows users exactly which manual translations will be affected
**Estimated Effort**: 1 hour

**Language List Section:**
```tsx
{/* Language list */}
<div className="px-6 pb-4">
  <div className="mb-2">
    <span className="text-sm font-medium text-gray-700">
      {t('affectedLanguages')}
    </span>
  </div>
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-h-48 overflow-y-auto">
    <ul className="space-y-2" aria-label={t('languageListLabel')}>
      {manuallyEditedLanguages.map((lang) => (
        <li
          key={lang}
          className="flex items-center gap-2 text-sm text-gray-700"
        >
          <Languages className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
          <span className="font-medium">
            {LANGUAGE_DISPLAY_NAMES[lang] || lang.toUpperCase()}
          </span>
        </li>
      ))}
    </ul>
  </div>
</div>
```

**Features:**
- **Amber-tinted background**: `bg-amber-50 border-amber-200` matches warning theme
- **Scrollable container**: `max-h-48 overflow-y-auto` for long lists (6+ languages)
- **Language icon**: `Languages` icon for visual consistency
- **Display names**: Maps language codes to full names (e.g., 'fr' → 'French')
- **Fallback**: If language not in mapping, displays uppercase code (e.g., 'pt' → 'PT')
- **ARIA label**: Screen reader announces "List of affected languages" or similar

**Pattern Reference:**
- Lines 232-255 from ConfirmDeleteDialog.tsx (adapted for languages instead of items)

---

### Step 6: Implement Options Section with Descriptions
**Description**: Add informational cards explaining each option before the action buttons
**Rationale**: Helps users understand consequences of each choice
**Estimated Effort**: 45 minutes

**Options Descriptions:**
```tsx
{/* Options explanations */}
<div className="px-6 pb-4 space-y-3">
  {/* Keep Manual Edits Option */}
  <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
    <h4 className="text-sm font-semibold text-blue-900 mb-1">
      {t('keepManualOption')}
    </h4>
    <p className="text-xs text-blue-700">
      {t('keepManualDescription')}
    </p>
  </div>

  {/* Re-translate All Option */}
  <div className="border border-red-200 bg-red-50 rounded-lg p-3">
    <h4 className="text-sm font-semibold text-red-900 mb-1">
      {t('retranslateOption')}
    </h4>
    <p className="text-xs text-red-700">
      {t('retranslateWarning')}
    </p>
  </div>
</div>
```

**Visual Design:**
- **Keep Manual**: Blue-tinted card (safe, recommended action)
- **Re-translate**: Red-tinted card (destructive action with warning)
- Clear visual hierarchy through color coding
- Concise descriptions of what each option does

**Note**: This section is informational only, not interactive. Action buttons follow in next step.

---

### Step 7: Implement Action Buttons
**Description**: Create the three action buttons (Cancel, Keep Manual, Re-translate All) with proper styling and loading states
**Rationale**: Primary interaction mechanism for user decisions
**Estimated Effort**: 1.5 hours

**Action Buttons Section:**
```tsx
{/* Actions */}
<div className="flex flex-col gap-3 p-6 pt-4 border-t border-gray-100">
  {/* Primary Action: Keep Manual Edits (Safe) */}
  <button
    type="button"
    onClick={onKeepManual}
    disabled={loading}
    className={cn(
      'w-full px-4 py-2.5 text-sm font-medium rounded-lg',
      'text-white bg-blue-600',
      'hover:bg-blue-700 active:bg-blue-800',
      'transition-colors duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'inline-flex items-center justify-center gap-2'
    )}
  >
    {loading === 'keep' ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        <span>{t('processing')}</span>
      </>
    ) : (
      <>
        <Languages className="w-4 h-4" aria-hidden="true" />
        <span>{t('keepManualOption')}</span>
      </>
    )}
  </button>

  {/* Destructive Action: Re-translate All */}
  <button
    type="button"
    onClick={onOverwrite}
    disabled={loading}
    className={cn(
      'w-full px-4 py-2.5 text-sm font-medium rounded-lg',
      'text-white bg-red-600',
      'hover:bg-red-700 active:bg-red-800',
      'transition-colors duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'inline-flex items-center justify-center gap-2'
    )}
  >
    {loading === 'overwrite' ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        <span>{t('processing')}</span>
      </>
    ) : (
      <>
        <AlertTriangle className="w-4 h-4" aria-hidden="true" />
        <span>{t('retranslateOption')}</span>
      </>
    )}
  </button>

  {/* Cancel Button */}
  <button
    type="button"
    onClick={onCancel}
    disabled={loading}
    className={cn(
      'w-full px-4 py-2.5 text-sm font-medium rounded-lg',
      'text-gray-700 bg-gray-100',
      'hover:bg-gray-200 active:bg-gray-300',
      'transition-colors duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )}
  >
    {t('cancel')}
  </button>
</div>
```

**Key Design Decisions:**
1. **Vertical stacking**: `flex-col` instead of horizontal row for better mobile experience
2. **Primary action first**: "Keep Manual" button at top (recommended action)
3. **Color coding**:
   - Keep Manual: Blue (primary, safe)
   - Re-translate: Red (destructive, warning)
   - Cancel: Gray (neutral)
4. **Loading state**: Changed from boolean to string enum `'keep' | 'overwrite'` to show spinner on active button only
5. **Icons**: Languages icon for Keep Manual, AlertTriangle for Re-translate
6. **Full width**: `w-full` for consistent sizing and easier mobile interaction

**Pattern Reference:**
- Lines 258-297 from ConfirmDeleteDialog.tsx (adapted for three buttons + vertical layout)

**NOTE**: The `loading` prop type needs updating:
```typescript
/** Loading state: false (not loading), 'keep' (keeping), 'overwrite' (overwriting) */
loading?: false | 'keep' | 'overwrite';
```

---

### Step 8: Add Internationalization Keys (English)
**Description**: Add translation keys to `/messages/en.json` for all dialog text
**Rationale**: Enables internationalization and consistent messaging
**Estimated Effort**: 30 minutes

**Translation Keys to Add:**
```json
{
  "translation": {
    "manualEditWarning": {
      "title": "Manual Translations Affected",
      "description": "You have manually edited translations in the following languages. Updating the source content will affect these translations.",
      "affectedLanguages": "Affected languages:",
      "languageListLabel": "List of languages with manual translations",
      "keepManualOption": "Keep manual edits",
      "keepManualDescription": "Update source content only. Manual translations will be marked as potentially stale.",
      "retranslateOption": "Re-translate all",
      "retranslateWarning": "This will overwrite your manual edits permanently.",
      "cancel": "Cancel",
      "processing": "Processing...",
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

**Location**: Add to `/messages/en.json` under `translation.*` namespace (note: not `translations.*` - singular form used in spec but should verify existing namespace convention)

**Keys Breakdown:**
- `title`: Dialog title
- `description`: Main explanation text
- `affectedLanguages`: Label above language list
- `languageListLabel`: ARIA label for screen readers
- `keepManualOption`: Primary button text
- `keepManualDescription`: Explanation of Keep option
- `retranslateOption`: Destructive button text
- `retranslateWarning`: Warning about permanent loss
- `cancel`: Cancel button text
- `processing`: Loading state text
- `languages.*`: Language display names

---

### Step 9: Add Internationalization Keys (Other Locales)
**Description**: Add translation keys for all supported locales (es, fr, de, it, nl)
**Rationale**: Ensures dialog works in all supported languages
**Estimated Effort**: 1 hour

**Translation Table (from spec lines 3589-3596):**

| Locale | File | title | keepManualOption | retranslateOption |
|--------|------|-------|------------------|-------------------|
| **es** | `/messages/es.json` | Traducciones manuales afectadas | Mantener ediciones manuales | Retraducir todo |
| **fr** | `/messages/fr.json` | Traductions manuelles affectées | Conserver les modifications manuelles | Tout retraduire |
| **de** | `/messages/de.json` | Manuelle Übersetzungen betroffen | Manuelle Bearbeitungen behalten | Alles neu übersetzen |
| **it** | `/messages/it.json` | Traduzioni manuali interessate | Mantieni modifiche manuali | Ritraduci tutto |
| **nl** | `/messages/nl.json` | Handmatige vertalingen beïnvloed | Handmatige bewerkingen behouden | Alles opnieuw vertalen |

**Implementation:**
For each locale file, add all keys from Step 8 with appropriate translations. The structure should match exactly across all locales.

**Additional Keys per Locale:**
- `description`: Translated explanation
- `affectedLanguages`: Translated label
- `keepManualDescription`: Translated explanation
- `retranslateWarning`: Translated warning
- `cancel`: Translated "Cancel"
- `processing`: Translated "Processing..."
- `languages.*`: Localized language names (e.g., in Spanish: "Español", "Francés", etc.)

---

### Step 10: Create Barrel Export (index.ts)
**Description**: Create the index.ts file to export the component and types
**Rationale**: Enables clean imports from other parts of the codebase
**Estimated Effort**: 5 minutes

**File: `/src/components/TranslationManagement/ManualEditWarning/index.ts`**
```typescript
/**
 * ManualEditWarning Component Exports
 *
 * Warning dialog for protecting manual translation edits when source content changes.
 *
 * @module TranslationManagement/ManualEditWarning
 * @see docs/REQ-E05-022-create-manualeditwarningdialog-component-overview.md
 * @created 2026-01-22
 */

export { ManualEditWarningDialog } from './ManualEditWarningDialog';
export type { ManualEditWarningDialogProps } from './ManualEditWarningDialog';
```

**Purpose:**
- Enables imports like: `import { ManualEditWarningDialog } from '@/components/TranslationManagement/ManualEditWarning';`
- Exports both component and type for consumer convenience
- Documents purpose and creation date

---

### Step 11: Add JSDoc Header Comment to Component File
**Description**: Add comprehensive file header documentation
**Rationale**: Maintains code documentation standards
**Estimated Effort**: 10 minutes

**Header Comment:**
```typescript
'use client';

/**
 * ManualEditWarningDialog Component
 *
 * Warning dialog that appears when updating source content with existing manual translations.
 * Provides options to either keep manual edits (marking them as stale) or re-translate all
 * languages (overwriting manual edits permanently).
 *
 * Features:
 * - Lists affected languages with manual translations
 * - Two clear action options with visual hierarchy
 * - Amber/yellow warning theme (not red error)
 * - Keyboard accessible with focus management
 * - Loading states for async operations
 *
 * @module TranslationManagement/ManualEditWarning
 * @see docs/REQ-E05-022-create-manualeditwarningdialog-component-overview.md
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @created 2026-01-22
 * @example
 * <ManualEditWarningDialog
 *   isOpen={showDialog}
 *   manuallyEditedLanguages={['fr', 'de', 'es']}
 *   onKeepManual={handleKeepManual}
 *   onOverwrite={handleOverwrite}
 *   onCancel={() => setShowDialog(false)}
 *   loading={isProcessing}
 * />
 */
```

---

### Step 12: Testing and Quality Assurance
**Description**: Manual testing and verification of all functionality
**Rationale**: Ensure component works correctly before marking complete
**Estimated Effort**: 1.5 hours

**Test Checklist:**

**Rendering and Display:**
- [ ] Dialog renders only when `isOpen={true}` AND `manuallyEditedLanguages.length > 0`
- [ ] Dialog does not render when `isOpen={false}`
- [ ] Dialog does not render when `manuallyEditedLanguages=[]`
- [ ] Warning icon displays with amber/yellow background
- [ ] Title and description text display correctly
- [ ] Language list displays all affected languages
- [ ] Language display names are correct (Spanish, French, German, Italian, Dutch)
- [ ] Language list scrolls when more than 6 languages present

**Button Interactions:**
- [ ] "Keep manual edits" button calls `onKeepManual` when clicked
- [ ] "Re-translate all" button calls `onOverwrite` when clicked
- [ ] "Cancel" button calls `onCancel` when clicked
- [ ] All buttons disabled when `loading={true}`
- [ ] Active button shows spinner when loading
- [ ] Button styling matches design (blue for Keep, red for Re-translate, gray for Cancel)

**Keyboard Navigation:**
- [ ] Escape key calls `onCancel` (when not loading)
- [ ] Tab key cycles through buttons in correct order
- [ ] Enter key activates focused button
- [ ] Focus visible ring displays correctly

**Backdrop Behavior:**
- [ ] Clicking backdrop calls `onCancel` (when not loading)
- [ ] Clicking backdrop does nothing when loading
- [ ] Clicking inside dialog does not close dialog

**Accessibility:**
- [ ] Dialog has `role="alertdialog"`
- [ ] Dialog has `aria-modal="true"`
- [ ] Title has correct `id` matching `aria-labelledby`
- [ ] Description has correct `id` matching `aria-describedby`
- [ ] Screen reader announces dialog content correctly

**Internationalization:**
- [ ] All text displays in English by default
- [ ] Switching to Spanish shows Spanish translations
- [ ] Switching to French shows French translations
- [ ] Switching to German shows German translations
- [ ] Switching to Italian shows Italian translations
- [ ] Switching to Dutch shows Dutch translations

**Edge Cases:**
- [ ] Single language in list displays correctly
- [ ] All 5 target languages in list display correctly
- [ ] Unknown language code displays as uppercase (fallback)
- [ ] Very long language names don't break layout
- [ ] Multiple rapid clicks don't cause issues (buttons disabled while loading)

**TypeScript and Build:**
- [ ] No TypeScript compilation errors
- [ ] No console errors during normal operation
- [ ] No console warnings during normal operation
- [ ] Component builds successfully in production mode

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create

| File | Purpose | Size Est. |
|------|---------|-----------|
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Main component implementation | ~300-350 lines |
| `/src/components/TranslationManagement/ManualEditWarning/index.ts` | Barrel export | ~15 lines |

### Files to Modify

| File | Target | Type | Lines | Justification |
|------|--------|------|-------|---------------|
| `/messages/en.json` | `translation.manualEditWarning.*` | Add | ~20 lines | English i18n strings |
| `/messages/es.json` | `translation.manualEditWarning.*` | Add | ~20 lines | Spanish i18n strings |
| `/messages/fr.json` | `translation.manualEditWarning.*` | Add | ~20 lines | French i18n strings |
| `/messages/de.json` | `translation.manualEditWarning.*` | Add | ~20 lines | German i18n strings |
| `/messages/it.json` | `translation.manualEditWarning.*` | Add | ~20 lines | Italian i18n strings |
| `/messages/nl.json` | `translation.manualEditWarning.*` | Add | ~20 lines | Dutch i18n strings |

### Components/Modules to Reference (READ ONLY)

| File | Purpose |
|------|---------|
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Dialog pattern reference (structure, styling, keyboard handling) |
| `/src/lib/translation-service/translation-service.types.ts` | `SupportedLanguage` type definition |

### Dependencies to Import

```typescript
// React
import React from 'react';

// Icons
import { AlertTriangle, Loader2, Languages } from 'lucide-react';

// i18n
import { useTranslations } from 'next-intl';

// Utils
import { cn } from '@/lib/utils';

// Types (if needed)
import type { SupportedLanguage } from '@/lib/translation-service';
```

---

## Dependencies

### Depends On (Completed First)

- **REQ-E05-001** (Translation Status API): Provides translation status data including `translation_status='manual'` indicator
- **REQ-E05-002** (Update Translation API): The "Keep Manual" option may trigger translation updates
- **REQ-E05-003** (Re-Translate API): The "Re-translate All" option triggers this API endpoint
- **REQ-E05-004** (source_version_at columns): Enables stale detection after source updates
- **Epic 1** (Foundation): Translation tables with `translation_status` column

### Blocks (Requires This First)

- **REQ-E05-023** (Stale Translation Indicator): May reference this dialog for "Update Translation" action
- **Item/Article Editor Integration**: Editors need this dialog before implementing save workflows with manual edit checking

### Parallel Safety

**Files touched by this task:**
- `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` (new file)
- `/src/components/TranslationManagement/ManualEditWarning/index.ts` (new file)
- `/messages/*.json` (additive changes to `translation.manualEditWarning.*` namespace)

**Conflicts with:** None (new component, isolated namespace)

**Safe to parallelize with:**
- All other Epic 5 components (different files)
- Other translation namespace additions (different keys)

### External Dependencies

- **lucide-react**: `AlertTriangle`, `Loader2`, `Languages` icons (already installed)
- **next-intl**: Translation function `useTranslations()` (already integrated)
- **Tailwind CSS**: Styling classes (already configured)
- **cn utility**: Class name merging from `@/lib/utils` (already exists)

---

## Risks and Considerations

### Potential Side Effects

1. **Loading State Type Change**: Changing `loading` prop from `boolean` to `false | 'keep' | 'overwrite'` may affect parent component implementations
   - **Mitigation**: Document clearly in props interface; consider keeping boolean and adding separate `loadingAction?: 'keep' | 'overwrite'` prop
   - **Alternative**: Use boolean loading and track which button was clicked internally

2. **Language Display Name Mismatches**: If parent passes unknown language codes, fallback displays uppercase code
   - **Mitigation**: Document expected language codes; add console warning for unknown codes in development
   - **Example**: If 'pt' is passed but not in mapping, displays "PT"

3. **Vertical Button Layout**: Three stacked buttons may feel tall on small screens
   - **Mitigation**: Tested on mobile viewports; vertical layout actually improves touch targets
   - **Note**: Horizontal layout would be cramped with long button labels in some languages

4. **Translation Namespace Conflict**: Spec uses `translations.manualEditWarning` but existing code may use singular `translation`
   - **Mitigation**: Check existing namespace convention in en.json before adding keys
   - **Note**: Implementation uses `translation` (singular) to match likely existing pattern

### Testing Requirements

1. **Visual Testing**: Verify amber/yellow warning theme vs red error theme in ConfirmDeleteDialog
2. **Internationalization Testing**: Test all 6 locales thoroughly
3. **Accessibility Testing**: Screen reader testing (VoiceOver, NVDA)
4. **Keyboard Navigation**: Test Tab, Enter, Escape key interactions
5. **Edge Cases**: Test with 0, 1, 5, and 10+ languages in the list
6. **Loading States**: Test both "Keep Manual" and "Re-translate" loading scenarios
7. **Mobile Testing**: Verify button sizing and touch targets on mobile devices

### Open Questions

- [ ] Should the dialog support a "Don't show again" checkbox for experienced users?
- [ ] Should language list show flags (emoji or icon-based) in addition to names?
- [ ] Should the dialog include a timestamp showing when the source was last updated?
- [ ] Should there be a third option: "Review translations manually" that opens the translation editor?

---

## Out of Scope

The following items are explicitly **NOT** included in this implementation:

1. **Dialog Trigger Logic**: This component only renders the dialog; parent components determine when to show it
2. **Manual Edit Detection**: Checking which translations are manual happens in parent components via API calls
3. **API Integration**: Component calls callbacks; parent components handle actual API requests
4. **Undo Functionality**: No undo/redo for overwriting manual translations
5. **Language Flag Icons**: Using text-based language names only (no flag emojis or icon libraries)
6. **Translation Diff View**: No side-by-side comparison of old vs new translations
7. **Selective Re-translation**: No option to re-translate only specific languages (all or nothing)
8. **Translation History**: No view of previous translation versions
9. **Estimated Translation Cost**: No display of API credits or costs for re-translation
10. **Bulk Operations**: This dialog is for single entity updates only (not bulk operations)
11. **Auto-Save Prevention**: No integration with auto-save systems (parent components must handle)
12. **Notification System**: No toast/snackbar notifications for action results
13. **Analytics Tracking**: No event tracking for user decisions (can be added separately)
14. **Custom Theming**: Uses fixed Tailwind colors (not theme-customizable)
15. **Animation Preferences**: No respect for `prefers-reduced-motion` (can be added in enhancement)

---

## Notes for Implementation Agent

### Critical Implementation Details

1. **Loading State Design Decision**: The spec shows `loading?: boolean` but the implementation benefits from `loading?: false | 'keep' | 'overwrite'` to show spinner on the specific button that was clicked. Document this clearly or provide alternative implementation.

2. **Language Source of Truth**: Use `translation-service.types.ts` as the canonical language list. The mapping includes `'it'` (Italian), NOT `'pt'` (Portuguese) despite some spec mentions of PT.

3. **Color Scheme - Amber NOT Red**: This is critical - use `bg-amber-100`, `text-amber-600` for warning icon and language list background. This is a cautionary dialog, not an error dialog.

4. **Button Order and Hierarchy**:
   - **Primary (Top)**: Keep Manual Edits - Blue buttons `bg-blue-600`
   - **Destructive (Middle)**: Re-translate All - Red button `bg-red-600`
   - **Neutral (Bottom)**: Cancel - Gray button `bg-gray-100`

5. **Vertical Button Layout**: Use `flex-col` for button container, not horizontal row. This improves mobile UX and accommodates longer translated button labels.

6. **Conditional Rendering Check**: Must check BOTH `isOpen` AND `manuallyEditedLanguages.length > 0`. If no manual languages, don't render even if open.

7. **Backdrop and Keyboard Behavior**: Escape key and backdrop clicks should only work when NOT loading to prevent accidental cancellation during processing.

### Code Quality Standards

- **TypeScript**: Strict mode, no `any` types, all props interfaces defined
- **Accessibility**: Full ARIA attributes, keyboard navigation, focus management
- **Internationalization**: All user-facing text via `useTranslations()`, no hardcoded strings
- **Styling**: Follow Tailwind conventions, use `cn()` utility for conditional classes
- **Pattern Consistency**: Follow ConfirmDeleteDialog structure closely

### Testing Priorities

1. **Dialog Rendering Logic**: Verify conditional rendering works correctly
2. **Button Callbacks**: Ensure correct callback is invoked for each button
3. **Loading States**: Test both action buttons show loading correctly
4. **Language List**: Test with various numbers of languages (0, 1, 5, 10+)
5. **Keyboard Navigation**: Verify Escape, Tab, Enter work correctly
6. **Accessibility**: Screen reader announces all content appropriately

### Common Pitfalls to Avoid

- ❌ **Don't** use red colors for warning icon (use amber/yellow)
- ❌ **Don't** use horizontal button layout (use vertical stacking)
- ❌ **Don't** forget to disable backdrop/Escape when loading
- ❌ **Don't** use `translations.*` namespace (verify actual namespace convention)
- ❌ **Don't** forget to add translations to all 6 locale files
- ❌ **Don't** hard-code language display names in the component (use translation keys)
- ❌ **Don't** render dialog when `manuallyEditedLanguages` is empty
- ❌ **Don't** forget the barrel export (index.ts)

---

**Document generated:** 2026-01-22 20:06

---

**END OF DOCUMENT**
