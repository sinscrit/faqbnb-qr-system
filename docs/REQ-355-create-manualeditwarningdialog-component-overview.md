# REQ-355: Create ManualEditWarningDialog Component - Implementation Overview

**Document Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-325 (Note: Task context referenced REQ-355, but actual request is REQ-325)
**Phase:** 5 - Manual Edit Preservation
**Task ID:** 5.1
**Type:** NEW FEATURE
**Size:** M (Medium)

---

## Summary

Create the `ManualEditWarningDialog` component that warns property owners when source content has been updated and manual translations exist. The dialog provides options to either preserve existing manual edits or re-translate all affected languages, ensuring owners have explicit control over their translation work.

---

## Background and Context

### Business Need

When property owners update source content (e.g., item descriptions, article titles), they need to be informed if any translations have been manually edited. Manual edits represent time invested by the owner to improve translation quality, and these should not be accidentally overwritten during automated re-translation.

### Technical Context

- **Framework:** Next.js 15.5.9 with App Router
- **UI Library:** Radix UI primitives (Dialog component)
- **Styling:** Tailwind CSS 4.x
- **Pattern Reference:** Existing dialog patterns in `ConfirmDeleteDialog.tsx`, `AssetRemoveConfirmDialog.tsx`, and `PropertyEditModal.tsx`

### Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| Translation tables | Epic 1 - `article_translations`, `item_translations`, `link_translations` | Required |
| Translation status tracking | Epic 3 - `translation_status` column with 'manual' value | Required |
| Radix Dialog | `@radix-ui/react-dialog` | Already installed |
| Language metadata | `/src/lib/i18n/config.ts` - `localeMetadata` | Required |
| Translation types | `/src/lib/translation-service/translation-service.types.ts` | Required |

---

## User Impact

Property owners discover and interact with this dialog when:
1. Updating source content that has associated manual translations
2. Needing to decide whether to preserve or overwrite their translation work
3. Understanding which specific languages have been manually edited

---

## Technical Approach

### Component Architecture

```
/src/components/TranslationManagement/ManualEditWarning/
├── index.ts                        # Barrel exports
└── ManualEditWarningDialog.tsx     # Main dialog component
```

### Props Interface

```typescript
interface ManualEditWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Languages with manual edits that would be affected */
  affectedLanguages: SupportedLanguage[];
  /** Entity type being updated */
  entityType: 'article' | 'item' | 'link';
  /** Entity name for display context */
  entityName?: string;
  /** Callback when user chooses to keep manual edits */
  onKeepManualEdits: () => void;
  /** Callback when user chooses to re-translate all */
  onRetranslateAll: () => void;
  /** Callback when dialog is cancelled */
  onCancel: () => void;
  /** Loading state during action processing */
  isLoading?: boolean;
}
```

### Component Behavior

1. **Display Trigger:** Dialog appears when source content is updated and manual translations exist
2. **Language List:** Shows flag emoji, language name for each affected language
3. **Primary Action:** "Keep Manual Edits" - preserves existing translations, proceeds with source update
4. **Destructive Action:** "Re-translate All" - queues re-translation for all languages (with prominent warning)
5. **Cancel Action:** Aborts the entire save operation
6. **Keyboard Support:** Escape to close, Tab navigation, Enter for primary action

### Design Specifications

| Element | Specification |
|---------|---------------|
| Dialog Width | `max-w-md` (28rem / 448px) |
| Border Radius | `rounded-xl` |
| Animation | `animate-in fade-in zoom-in-95` |
| Warning Icon | Yellow/amber `AlertTriangle` from lucide-react |
| Keep Button | Primary style (gradient, Airbnb pink) |
| Re-translate Button | Destructive style (red background with warning) |
| Cancel Button | Secondary style (outlined) |

### Status Indicator Colors (from PRD)

| Status | Color | Tailwind Class |
|--------|-------|----------------|
| Manual Edit | Purple | `text-violet-500` (#8B5CF6) |
| Warning | Yellow | `text-yellow-500` (#EAB308) |

---

## Implementation Tasks

### Task 1: Create ManualEditWarningDialog Component (45 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

1. Create component with Radix Dialog (following `PropertyEditModal.tsx` pattern)
2. Implement props interface with TypeScript
3. Add warning header with AlertTriangle icon
4. Display explanatory message about source content update
5. Render affected languages list with flags and names
6. Implement three action buttons: Keep, Re-translate, Cancel
7. Add prominent warning text for Re-translate option
8. Handle loading state during action processing
9. Implement keyboard accessibility (Escape, Tab, Enter)
10. Add ARIA labels and focus management

### Task 2: Create Barrel Export (5 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/index.ts`

1. Export `ManualEditWarningDialog` component
2. Export `ManualEditWarningDialogProps` type

### Task 3: Update Parent Index Exports (5 min)

**File:** `/src/components/TranslationManagement/index.ts` (create if not exists)

1. Re-export from `ManualEditWarning/index.ts`
2. Maintain consistent export pattern with other components

### Task 4: Add Unit Tests (30 min)

**File:** `/src/components/TranslationManagement/ManualEditWarning/__tests__/ManualEditWarningDialog.test.tsx`

1. Test dialog renders when isOpen is true
2. Test dialog does not render when isOpen is false
3. Test affected languages list displays correctly
4. Test onKeepManualEdits callback fires on button click
5. Test onRetranslateAll callback fires on button click
6. Test onCancel callback fires on cancel/escape
7. Test loading state disables buttons
8. Test keyboard accessibility (Escape key)

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx` | Main dialog component |
| `/src/components/TranslationManagement/ManualEditWarning/index.ts` | Barrel exports |
| `/src/components/TranslationManagement/index.ts` | Parent barrel exports (if not exists) |
| `/src/components/TranslationManagement/ManualEditWarning/__tests__/ManualEditWarningDialog.test.tsx` | Unit tests |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | Dialog pattern reference |
| `/src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | Warning dialog pattern |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Radix Dialog pattern |
| `/src/lib/i18n/config.ts` | Language metadata (flags, names) |
| `/src/lib/translation-service/translation-service.types.ts` | Translation types |
| `/src/lib/utils.ts` | cn() utility function |

### Functions/Types to Import

| Import | Source |
|--------|--------|
| `cn` | `@/lib/utils` |
| `SupportedLocale`, `localeMetadata` | `@/lib/i18n/config` |
| `TranslationStatus`, `SupportedLanguage` | `@/lib/translation-service/translation-service.types` |
| `AlertTriangle`, `Loader2` | `lucide-react` |
| `* as Dialog` | `@radix-ui/react-dialog` |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| Dialog appears when source content updated and manual translations exist | Parent component integration (REQ-326) |
| Uses Radix Dialog for accessibility and keyboard navigation | Task 1 |
| Header clearly indicates source content has been updated | Task 1 - step 3 |
| Body explains manual translation edits exist | Task 1 - step 4 |
| Displays list of affected languages with flag and name | Task 1 - step 5 |
| "Keep Manual Edits" option preserves existing translations | Task 1 - step 6 |
| "Re-translate All" option with prominent warning | Task 1 - steps 6, 7 |
| Loading indicator during processing | Task 1 - step 8 |
| Keyboard accessible with proper focus management | Task 1 - steps 9, 10 |
| ARIA labels for screen readers | Task 1 - step 10 |
| Responsive on tablet and desktop | Radix Dialog + Tailwind responsive |
| Component located at specified path | Task 1 |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Integration timing with save flow | Medium | Medium | Clear callback interface, documented usage pattern |
| User confusion about options | Low | Medium | Clear labeling, prominent warning text |
| Mobile viewport issues | Low | Low | Responsive design with drawer fallback |

---

## Testing Strategy

### Unit Tests
- Component rendering states
- Callback invocations
- Loading state handling
- Keyboard interactions

### Integration Tests (Future - REQ-326)
- Save flow interruption
- Translation check query
- Action completion

---

## References

- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request Document:** `/docs/gen_requests_epic5.md` (REQ-325)
- **Dialog Patterns:** [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Task 1: ManualEditWarningDialog Component | 45 min |
| Task 2: Barrel Export | 5 min |
| Task 3: Parent Index Exports | 5 min |
| Task 4: Unit Tests | 30 min |
| **Total** | **~1.5 hours** |

---

*Document generated for FAQBNB Localization Epic 5 - Owner Translation Management*
