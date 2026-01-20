# REQ-E05-022: Create ManualEditWarningDialog Component - Implementation Overview

**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E05-022
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.1
**Size:** M (Medium)
**Dependencies:** Epic 1 (Foundation), Epic 3 (Dynamic Content Translation)

---

## Summary

Create a warning dialog component that appears when property owners update source content and manual translations exist. The dialog allows owners to make an informed decision: preserve their human-reviewed translations (which may become stale) or re-translate all content (discarding manual work). This protects valuable translation investments while ensuring owners understand the implications of their choices.

---

## Current Behavior

When source content changes occur:
- The system has no mechanism to warn property owners about existing manual translations
- Manual translations may be automatically overwritten without user consent
- Property owners lose valuable human-reviewed content refinements
- There is no visibility into which languages have manual edits at risk

---

## Expected Behavior

When source content updates are detected for entities with manual translations:
1. A modal dialog appears with a clear warning message
2. The dialog lists all languages that have manual translation status
3. Property owners can choose between:
   - **Keep Manual Edits**: Preserve existing translations (may become stale)
   - **Re-translate All**: Queue new translation jobs, discarding manual work
4. The "Re-translate All" action requires secondary confirmation due to destructive nature
5. Cancel option allows returning to the edit view without saving

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Reference File | Usage |
|---------|----------------|-------|
| Radix UI Dialog | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Dialog.Root, Portal, Overlay, Content structure |
| Warning Dialogs | `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | AlertTriangle icon, destructive button styling, item list preview |
| Focus Management | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Keyboard handling, focus trap, escape key |
| Validation UI | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Error states, loading indicators |

### Database Schema Reference

```sql
-- Translation status values (from Epic 1)
-- 'pending', 'processing', 'completed', 'failed', 'manual'

-- Key tables:
-- article_translations.translation_status, .reviewed_by
-- item_translations.translation_status
-- link_translations.translation_status
```

### Supported Languages

From `/src/components/LanguageSwitcher/constants.ts`:
- `en` - English 🇬🇧
- `nl` - Dutch 🇳🇱
- `fr` - French 🇫🇷
- `de` - German 🇩🇪
- `it` - Italian 🇮🇹
- `es` - Spanish 🇪🇸

---

## Implementation Approach

### Component Architecture

```
/src/components/TranslationManagement/ManualEditWarning/
├── index.ts                          # Public exports
├── ManualEditWarningDialog.tsx       # Main component
└── ManualEditWarningDialog.types.ts  # Type definitions (optional, can inline)
```

### Props Interface

```typescript
interface ManualEditWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Entity being updated (article, item, or link) */
  entityType: 'article' | 'item' | 'link';

  /** Entity ID for the content being updated */
  entityId: string;

  /** Array of language codes with manual translation status */
  affectedLanguages: SupportedLanguage[];

  /** Callback when user chooses to keep manual edits */
  onKeepManual: () => void;

  /** Callback when user confirms re-translation (after secondary confirmation) */
  onRetranslate: () => void;

  /** Callback when dialog is cancelled (no action taken) */
  onCancel: () => void;

  /** Optional: Loading state during re-translate operation */
  loading?: boolean;
}
```

### Visual Design Reference

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚠️  Manual Translations Will Be Affected                   [X]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  You're updating content that has been manually translated.     │
│  These translations may become outdated after your changes.     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  3 languages with manual translations:                     │ │
│  │                                                            │ │
│  │  🇫🇷 French                                                │ │
│  │  🇪🇸 Spanish                                               │ │
│  │  🇩🇪 German                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│     [Cancel]    [Keep Manual Edits]    [Re-translate All]        │
│                                        (requires confirmation)   │
└──────────────────────────────────────────────────────────────────┘
```

### Key Implementation Details

1. **Radix UI Dialog Structure**
   - Use `Dialog.Root`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`
   - Include `Dialog.Title` and `Dialog.Description` for accessibility
   - Implement responsive layout (centered modal on desktop, slide-up drawer on mobile)

2. **Warning Icon & Styling**
   - Use `AlertTriangle` from lucide-react with amber/yellow background
   - Follow existing warning color patterns: `text-amber-500`, `bg-amber-100`

3. **Language List Display**
   - Import language data from `SUPPORTED_LOCALES` constant
   - Display flag emoji + language native name for each affected language
   - Scrollable list if many languages (max-height with overflow-y-auto)

4. **Button Actions**
   - **Cancel**: Secondary style (gray/white), dismisses without action
   - **Keep Manual Edits**: Neutral style, calls `onKeepManual`
   - **Re-translate All**: Warning style (amber/orange), triggers secondary confirmation

5. **Secondary Confirmation for Re-translate**
   - Inline confirmation or nested dialog
   - Clear message: "This will discard all manual translations. Are you sure?"
   - Destructive red button for final confirmation

6. **Accessibility Requirements**
   - `role="alertdialog"` for the warning nature
   - `aria-modal="true"`
   - `aria-labelledby` and `aria-describedby`
   - Focus trap within dialog
   - Escape key triggers cancel
   - Focus returns to trigger element on close

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/ManualEditWarning/index.ts` | Barrel exports |
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Main dialog component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/index.ts` | Add ManualEditWarning exports (create if doesn't exist) |

### Dependencies to Import

```typescript
// From existing packages
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// From existing codebase
import { SUPPORTED_LOCALES, getLocaleByCode } from '@/components/LanguageSwitcher/constants';
import type { SupportedLanguage } from '@/types';
```

---

## Integration Points

### Where This Component Will Be Used

1. **Article Editor** (`/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`)
   - Check for manual translations before save
   - Show dialog if manual translations exist and content has changed

2. **Item Editor** (`/src/app/dashboard2/items/[publicId]/edit/page.tsx`)
   - Same pattern as article editor

3. **Content Save Handlers**
   - Integration with save flow to check translation status
   - Hook into existing save handlers to intercept when manual translations exist

### API Dependencies

From implementation plan, requires:
- `GET /api/translations/status` - To check which languages have manual status
- `POST /api/translations/retranslate` - To queue re-translation jobs (from `onRetranslate` callback)

---

## Acceptance Criteria

Based on REQ-E05-023 from gen_requests_epic5.md:

- [ ] Dialog uses Radix UI Dialog primitive for accessibility and focus management
- [ ] Dialog displays when source content update is detected for entity with manual translations
- [ ] Dialog opens centered on viewport with overlay backdrop preventing interaction
- [ ] Warning message clearly explains that source content has changed and manual translations may become outdated
- [ ] Language list displays all languages that currently have manual translation status
- [ ] Each listed language displays flag icon and language name for easy recognition
- [ ] "Keep Manual Edits" button preserves all existing manual translations without modification
- [ ] "Keep Manual Edits" button includes helper text explaining that manual review may be needed later
- [ ] "Re-translate All" button queues new translation jobs for all listed manual languages
- [ ] "Re-translate All" button displays additional confirmation message emphasizing that manual work will be discarded
- [ ] "Re-translate All" action shows secondary confirmation dialog before proceeding with destructive action
- [ ] Both action buttons are clearly labeled with action-oriented text describing outcome
- [ ] Dialog includes "Cancel" option that dismisses dialog without saving source content changes
- [ ] Cancel action returns user to content edit view to reconsider changes
- [ ] Dialog displays count of affected languages in heading (e.g., "3 manual translations will be affected")
- [ ] Component accepts entity reference (entityType, entityId) as required props
- [ ] Component accepts array of affected language codes as required prop
- [ ] Component accepts onKeepManual callback function executed when user chooses to preserve edits
- [ ] Component accepts onRetranslate callback function executed when user confirms re-translation
- [ ] Component accepts onCancel callback function executed when dialog is dismissed
- [ ] Escape key triggers cancel action and closes dialog
- [ ] Dialog maintains focus trap preventing interaction with content behind overlay
- [ ] First interactive element receives focus when dialog opens
- [ ] Dialog returns focus to triggering element when closed
- [ ] Component is fully keyboard accessible with logical tab order through all controls
- [ ] Component includes appropriate ARIA labels and roles for screen reader accessibility
- [ ] Warning icon displays at top of dialog to emphasize importance of decision
- [ ] Visual hierarchy makes consequences of each action clear through layout and typography
- [ ] Dialog adapts to mobile viewports maintaining full usability on small screens
- [ ] Language list scrolls independently if affected language count exceeds viewport height
- [ ] Dialog styling matches application design system with consistent spacing and colors
- [ ] "Keep Manual Edits" button uses secondary or neutral styling (gray or white)
- [ ] "Re-translate All" button uses warning styling (orange or yellow) to indicate caution
- [ ] Component renders correctly in both light and dark theme contexts if themes are supported
- [ ] Dialog prevents body scroll when open on mobile devices
- [ ] Component integrates with content save workflows in item, article, and link editors

---

## Testing Considerations

### Unit Tests

1. **Rendering Tests**
   - Dialog renders when `isOpen` is true
   - Dialog does not render when `isOpen` is false
   - All affected languages display correctly
   - Language list scrolls when many languages

2. **Interaction Tests**
   - Cancel button calls `onCancel`
   - Keep Manual Edits button calls `onKeepManual`
   - Re-translate All triggers secondary confirmation
   - Secondary confirmation calls `onRetranslate`
   - Escape key triggers cancel

3. **Accessibility Tests**
   - Focus trapping works correctly
   - ARIA attributes present
   - Keyboard navigation functions

### Integration Tests

1. Show dialog when saving content with manual translations
2. Verify correct languages are identified as manual
3. Confirm re-translate action queues correct jobs
4. Verify keep manual action preserves translation status

---

## Design System Colors Reference

| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Warning Icon Background | Amber | `bg-amber-100` |
| Warning Icon | Amber | `text-amber-500` |
| Cancel Button | Gray | `bg-gray-100 text-gray-700` |
| Keep Manual Button | White/Gray | `bg-white border-[#222222]` |
| Re-translate Button | Amber/Warning | `bg-amber-500 text-white` |
| Destructive Confirm | Red | `bg-red-600 text-white` |
| Overlay | Black 50% | `bg-black/50` |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request Definition: `/docs/gen_requests_epic5.md` (REQ-E05-023)
- Pattern Reference: `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- Radix Dialog Reference: `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- Language Constants: `/src/components/LanguageSwitcher/constants.ts`
- [Radix UI Dialog Documentation](https://www.radix-ui.com/primitives/docs/components/dialog)
