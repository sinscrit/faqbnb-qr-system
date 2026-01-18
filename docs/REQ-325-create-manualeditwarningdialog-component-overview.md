# REQ-325: Create ManualEditWarningDialog Component - Implementation Overview

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request Reference:** docs/gen_requests_epic5.md - Request #325
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.1
**Size:** M (Medium)
**Priority:** P2
**Depends On:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation), REQ-309 (TranslationManagement types)

---

## 1. Summary

Create a warning dialog component that appears when a property owner updates source content and manual translations exist for that content. The dialog allows owners to choose between preserving their manually curated translations or re-translating all affected languages, with clear visibility into which languages have manual edits that would be impacted.

---

## 2. Requirements Analysis

### 2.1 Core Functionality

| Requirement | Description | Priority |
|-------------|-------------|----------|
| Warning Trigger | Dialog appears when source content updated and manual translations exist | P0 |
| Source Update Message | Clear explanation that source content has changed | P0 |
| Affected Languages List | Display all languages with manual edits that would be impacted | P0 |
| Keep Manual Edits Option | Allow preserving existing manual translations unchanged | P0 |
| Re-translate All Option | Queue re-translation for all languages (with warning about manual edit loss) | P0 |
| Cancel Option | Dismiss dialog without processing source content update | P0 |
| Warning Emphasis | Visual emphasis (icon, color) for re-translate destructive action | P1 |
| Keyboard Accessibility | Full keyboard navigation and focus management | P1 |
| Screen Reader Support | ARIA labels and announcements | P1 |
| Responsive Design | Usable on tablet and desktop viewports | P2 |

### 2.2 User Stories

1. **As a property owner**, I want to be warned when my source content update affects manually curated translations, so I can decide whether to preserve my translation work.

2. **As a multilingual property owner**, I want to see which specific languages have manual edits, so I can make an informed decision about re-translation.

3. **As a property owner**, I want to keep my manual edits when updating source content, so I can manually update translations myself if needed.

4. **As a property owner**, I want the option to re-translate all languages when my source content significantly changes, so translations stay synchronized even if I lose manual edits.

---

## 3. Technical Context

### 3.1 Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **UI Components** | Radix UI Dialog, Lucide React icons |
| **Utility** | `cn()` from `/src/lib/utils.ts` for className management |

### 3.2 Related Patterns in Codebase

| Pattern | Location | Usage for This Component |
|---------|----------|--------------------------|
| Radix Dialog | `/src/components/SimpleDashboard/AddPropertyModal.tsx` | Base pattern for accessible modal with Portal, Overlay, Content |
| Confirmation Dialog | `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Warning icon, two-button footer, destructive action styling |
| Warning Colors | ConfirmDeleteDialog, ConfirmExitDialog | Amber for warnings, red for destructive actions |
| Button Styling | AddPropertyModal | Primary (Airbnb gradient), secondary (gray), destructive (red) |
| Keyboard Handling | ConfirmDeleteDialog | Escape key, backdrop click dismissal |
| ARIA Patterns | Both dialogs | role="alertdialog", aria-modal, aria-labelledby |

### 3.3 Dependencies from Epic 1/Epic 3

| Dependency | Purpose | Status |
|------------|---------|--------|
| Translation tables | `article_translations`, `item_translations`, `link_translations` with `translation_status` | Required |
| Manual status tracking | `translation_status = 'manual'` in translation tables | Required |
| Translation service | Queuing re-translation jobs | Required |

### 3.4 Dependencies from Epic 5

| Dependency | Purpose | Status |
|------------|---------|--------|
| REQ-309 | TranslationManagement.types.ts with shared types | Required (should be created first) |
| REQ-306 | Re-translate API endpoint for queuing jobs | Required |

---

## 4. Component Architecture

### 4.1 Component Structure

```
/src/components/TranslationManagement/
├── ManualEditWarning/
│   ├── index.ts                          # Public exports
│   ├── ManualEditWarningDialog.tsx       # Main dialog component
│   └── ManualEditWarningDialog.types.ts  # Component-specific types (optional)
```

### 4.2 Type Definitions

```typescript
// Types for ManualEditWarningDialog
// Should integrate with TranslationManagement.types.ts from REQ-309

/**
 * Supported languages in the application
 */
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'nl' | 'it';

/**
 * Language display information
 */
export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  flag: string; // Emoji flag
}

/**
 * Affected language with manual edit status
 */
export interface AffectedLanguage {
  language: SupportedLanguage;
  hasManualEdit: boolean;
  lastEditedAt?: string;
  reviewedBy?: string;
}

/**
 * Props for ManualEditWarningDialog component
 */
export interface ManualEditWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Entity type being updated */
  entityType: 'article' | 'item' | 'link';

  /** Entity ID being updated */
  entityId: string;

  /** Entity name/title for display */
  entityName: string;

  /** Languages with manual edits that would be affected */
  affectedLanguages: AffectedLanguage[];

  /** Callback when user chooses to keep manual edits */
  onKeepManualEdits: () => void;

  /** Callback when user chooses to re-translate all */
  onRetranslateAll: () => void;

  /** Callback when dialog is cancelled/dismissed */
  onCancel: () => void;

  /** Loading state during action processing */
  loading?: boolean;

  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Result of the warning dialog action
 */
export type ManualEditWarningResult = 'keep' | 'retranslate' | 'cancel';
```

### 4.3 Supported Languages Constant

```typescript
/**
 * Supported languages configuration
 * Reference: Plan-111-L10N-Epic5 mentions 6 supported languages
 */
export const SUPPORTED_LANGUAGES: readonly LanguageInfo[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
] as const;

/**
 * Get language display info by code
 */
export function getLanguageInfo(code: SupportedLanguage): LanguageInfo {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) ?? {
    code,
    name: code.toUpperCase(),
    flag: '🌐',
  };
}
```

---

## 5. Component Design

### 5.1 Visual Layout (ASCII Reference)

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Source Content Updated                                  [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ You have updated the source content for "How to Use the         │
│ Dishwasher". The following translations have been manually      │
│ edited and may now be outdated:                                 │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🇪🇸 Spanish         Edited Jan 15, 2026                    │ │
│ │ 🇫🇷 French          Edited Jan 12, 2026                    │ │
│ │ 🇩🇪 German          Edited Jan 10, 2026                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ⚠️  Warning: Choosing "Re-translate All" will overwrite your    │
│    manually edited translations. This cannot be undone.         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│   [Cancel]    [Keep Manual Edits]    [Re-translate All ⚠️]      │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 UI States

| State | Description | UI Behavior |
|-------|-------------|-------------|
| Default | Dialog open with affected languages listed | All buttons enabled |
| Loading (Keep) | Processing keep manual edits action | Keep button shows spinner, other buttons disabled |
| Loading (Re-translate) | Processing re-translate all action | Re-translate button shows spinner, other buttons disabled |
| Empty Languages | No manual edits detected | Should not show dialog (prevent at integration level) |

### 5.3 Status Icons & Colors (from PRD)

| Element | Icon | Color | Tailwind Class |
|---------|------|-------|----------------|
| Header Warning | `AlertTriangle` | Amber | `text-amber-600`, `bg-amber-100` |
| Re-translate Warning | `AlertTriangle` | Red | `text-red-600` |
| Language Flag | Emoji | N/A | N/A |
| Keep Button | None | Gray | `bg-gray-100`, `text-gray-700` |
| Re-translate Button | Optional `RefreshCw` | Red | `bg-red-600`, `text-white` |

---

## 6. Implementation Tasks

### Task 5.1.1: Create ManualEditWarning directory and index.ts
**File:** `/src/components/TranslationManagement/ManualEditWarning/index.ts`

- Create directory structure
- Export dialog component and types
- Follow existing module export patterns

**Estimated effort:** XS

### Task 5.1.2: Create types file (if not using shared types from REQ-309)
**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.types.ts` (optional)

- Define component props interface
- Define AffectedLanguage interface
- Define ManualEditWarningResult type
- Add JSDoc comments

**Estimated effort:** XS

### Task 5.1.3: Implement ManualEditWarningDialog component
**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

**Sub-tasks:**
1. Import dependencies (Radix Dialog, Lucide icons, cn utility)
2. Define SUPPORTED_LANGUAGES constant (or import from shared types)
3. Implement getLanguageInfo helper function
4. Create header section with warning icon and title
5. Create description text explaining the situation
6. Create affected languages list with flag, name, and edit date
7. Create warning message about re-translate action
8. Create three-button footer (Cancel, Keep Manual Edits, Re-translate All)
9. Implement keyboard handling (Escape to cancel)
10. Implement backdrop click handling (dismiss)
11. Implement loading states with spinners
12. Add ARIA attributes for accessibility
13. Add responsive styling for tablet/desktop

**Estimated effort:** M

### Task 5.1.4: Add helper functions
**File:** Same as Task 5.1.3

- `formatEditDate()` - Format last edited timestamp for display
- `getAffectedLanguageCount()` - Get count for pluralization

**Estimated effort:** XS

### Task 5.1.5: Add to TranslationManagement barrel export
**File:** `/src/components/TranslationManagement/index.ts`

- Export ManualEditWarningDialog component
- Export related types

**Estimated effort:** XS

---

## 7. Authorized Files and Functions for Modification

### 7.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/ManualEditWarning/index.ts` | Module exports |
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Main dialog component |
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.types.ts` | Component types (optional) |

### 7.2 Files to Modify

| File Path | Changes | Scope of Changes |
|-----------|---------|------------------|
| `/src/components/TranslationManagement/index.ts` | Add ManualEditWarning exports | Add 1-2 export lines |

### 7.3 Functions to Create

| Function | Location | Purpose |
|----------|----------|---------|
| `ManualEditWarningDialog` | ManualEditWarningDialog.tsx | Main React component |
| `getLanguageInfo` | ManualEditWarningDialog.tsx or shared types | Get language display info by code |
| `formatEditDate` | ManualEditWarningDialog.tsx | Format last edited timestamp |
| `getAffectedLanguageCount` | ManualEditWarningDialog.tsx | Get count for pluralization |

---

## 8. Integration Points

### 8.1 Content Save Flow Integration (Task 5.3)

The dialog will be triggered during the content save flow. Integration points:

1. **Article Editor:** `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
2. **Item Editor:** `/src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Integration Pattern:**
```typescript
// In save handler
const handleSave = async (content: ContentData) => {
  // Check for manual translations before proceeding
  const manualTranslations = await checkManualTranslations(entityType, entityId);

  if (manualTranslations.length > 0) {
    // Show warning dialog
    setShowManualEditWarning(true);
    setPendingContent(content);
    return;
  }

  // Proceed with save
  await saveContent(content);
};

// Dialog handlers
const handleKeepManualEdits = async () => {
  // Save content without re-translating
  await saveContent(pendingContent, { skipRetranslate: true });
  setShowManualEditWarning(false);
};

const handleRetranslateAll = async () => {
  // Save content and queue re-translation for all languages
  await saveContent(pendingContent, { retranslateAll: true });
  setShowManualEditWarning(false);
};
```

### 8.2 API Dependencies

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/translations/status` | GET | Check for manual translations before save |
| `/api/translations/retranslate` | POST | Queue re-translation jobs |

---

## 9. Acceptance Criteria Checklist

Based on REQ-325 requirements:

- [ ] Dialog appears when source content is updated and manual translations exist for that content
- [ ] Dialog uses Radix Dialog component for accessibility and keyboard navigation
- [ ] Dialog header clearly indicates that source content has been updated
- [ ] Dialog body explains that manual translation edits exist which may be affected
- [ ] Dialog displays a list of all languages with manual edits that would be impacted
- [ ] Each affected language entry shows language flag icon and language name
- [ ] Dialog offers "Keep Manual Edits" option that preserves existing manual translations
- [ ] Dialog offers "Re-translate All" option that queues re-translation for all languages
- [ ] "Re-translate All" option displays prominent warning that manual edits will be lost
- [ ] Warning uses visual emphasis such as warning icon and contrasting color
- [ ] Cancel button dismisses dialog without processing source content update
- [ ] Selecting "Keep Manual Edits" proceeds with source update without re-translating manual edits
- [ ] Selecting "Re-translate All" proceeds with source update and queues re-translation for all languages
- [ ] Dialog is keyboard accessible with proper focus management and tab order
- [ ] Dialog provides appropriate ARIA labels for screen readers
- [ ] Dialog is responsive and usable on tablet and desktop viewports
- [ ] Component is located at `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

---

## 10. Testing Considerations

### 10.1 Unit Tests

- Component renders correctly when isOpen is true
- Component renders nothing when isOpen is false
- Affected languages list renders all provided languages
- Flag emoji and language name display correctly
- Keep Manual Edits button calls onKeepManualEdits
- Re-translate All button calls onRetranslateAll
- Cancel button calls onCancel
- Escape key calls onCancel
- Backdrop click calls onCancel
- Loading state disables all buttons
- Loading spinner shows on active button

### 10.2 Accessibility Tests

- Dialog has role="alertdialog"
- Dialog has aria-modal="true"
- Dialog has aria-labelledby pointing to title
- Dialog has aria-describedby pointing to description
- Focus trap works correctly
- Tab order is logical
- Screen reader announcements work

### 10.3 Integration Tests

- Dialog appears in article editor when manual translations exist
- Dialog appears in item editor when manual translations exist
- Keep Manual Edits preserves translations in database
- Re-translate All queues translation jobs

---

## 11. Open Questions

1. **Edit Date Display:** Should we show the last edited date/time for each language, or just the reviewer name?
   - *Recommendation:* Show date if available, omit reviewer name for privacy

2. **Empty State:** What if no manual translations exist but dialog is somehow triggered?
   - *Recommendation:* Component should return null, caller should check before opening

3. **Partial Selection:** Should users be able to selectively keep/re-translate specific languages?
   - *Recommendation:* Defer to future iteration, keep simple binary choice for now

---

## 12. Code Example

```tsx
// ManualEditWarningDialog.tsx - Simplified structure
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ManualEditWarningDialogProps, AffectedLanguage } from './ManualEditWarningDialog.types';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
] as const;

function getLanguageInfo(code: string) {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) ?? {
    code,
    name: code.toUpperCase(),
    flag: '🌐',
  };
}

export function ManualEditWarningDialog({
  isOpen,
  entityName,
  affectedLanguages,
  onKeepManualEdits,
  onRetranslateAll,
  onCancel,
  loading = false,
  className,
}: ManualEditWarningDialogProps) {
  if (!isOpen || affectedLanguages.length === 0) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && !loading && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 ..." />
        <Dialog.Content
          aria-labelledby="manual-edit-warning-title"
          aria-describedby="manual-edit-warning-description"
          className={cn('fixed z-50 bg-white ...', className)}
        >
          {/* Header with warning icon */}
          <div className="flex items-start gap-4 p-6 pb-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="w-6 h-6 text-amber-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <Dialog.Title id="manual-edit-warning-title" className="text-lg font-semibold">
                Source Content Updated
              </Dialog.Title>
              <Dialog.Description id="manual-edit-warning-description" className="mt-2 text-sm text-gray-600">
                You have updated the source content for "{entityName}". The following translations
                have been manually edited and may now be outdated:
              </Dialog.Description>
            </div>
            {/* Close button */}
          </div>

          {/* Affected languages list */}
          <div className="px-6 pb-4">
            <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <ul className="space-y-2">
                {affectedLanguages.map(({ language, lastEditedAt }) => {
                  const langInfo = getLanguageInfo(language);
                  return (
                    <li key={language} className="flex items-center gap-3 text-sm">
                      <span className="text-lg">{langInfo.flag}</span>
                      <span className="font-medium">{langInfo.name}</span>
                      {lastEditedAt && (
                        <span className="text-gray-500 ml-auto">
                          Edited {formatEditDate(lastEditedAt)}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Warning message */}
          <div className="px-6 pb-4">
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Choosing "Re-translate All" will overwrite your
                manually edited translations. This cannot be undone.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 p-6 pt-4 border-t border-gray-100">
            <button onClick={onCancel} disabled={loading} className="...">
              Cancel
            </button>
            <button onClick={onKeepManualEdits} disabled={loading} className="...">
              {loading ? <Loader2 className="animate-spin" /> : null}
              Keep Manual Edits
            </button>
            <button onClick={onRetranslateAll} disabled={loading} className="... bg-red-600 text-white">
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Re-translate All
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

---

## 13. References

- Request: `docs/gen_requests_epic5.md` - REQ-325
- Implementation Plan: `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Radix Dialog Pattern: `/src/components/SimpleDashboard/AddPropertyModal.tsx`
- Confirmation Dialog Pattern: `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- [Radix UI Dialog Documentation](https://www.radix-ui.com/primitives/docs/components/dialog)

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
