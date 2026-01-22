# Implementation Overview: Update ItemManager Component Family for Internationalization

**Last Modified:** 2026-01-22 12:49

## Header

| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-079 |
| Source File | docs/gen_requests_epic2.md |
| Original Request Date | 2026-01-20 16:45 |
| Breakdown Created | 2026-01-22 12:49 |
| Epic | 2 - Static UI Translation |
| Sub-Epic | 2D - Item Management |
| Task ID | 2D.2 |
| T-shirt Size | M (Medium) |
| Estimated Effort | 1-2 days |
| Status | PENDING |

---

## 1. Summary

Update all ItemManager components and related sub-components to use translation hooks and display all user-facing text in the selected language, replacing any remaining hardcoded English strings with localized translations from the `items` namespace.

**Key Observations from Codebase Investigation:**

1. **Many components already have i18n implemented** - The main `ItemManager.tsx`, `ItemToolbar.tsx`, and most dialog components already use `useTranslations('items')`.

2. **Translation keys already exist** - The `/messages/en.json` file has a comprehensive `items` namespace with ~400+ keys covering most UI strings.

3. **Focus areas** - Components that still need attention:
   - `SearchInput.tsx` - Has hardcoded placeholder and aria-labels
   - `ViewModeToggle.tsx` - Has hardcoded aria-labels
   - `TagChip.tsx` - Has hardcoded aria-label pattern
   - `TouchButton.tsx`, `BottomSheet.tsx` - May have hardcoded strings
   - Various utility components in `/shared/`

---

## 2. Goals

### Functional Requirements (Technical Terms)

1. **Complete i18n coverage** - All user-facing strings in ItemManager component family must use translation functions
2. **Consistent namespace** - All components use the `items` namespace for translations
3. **No hardcoded strings** - Zero hardcoded English text in any component file
4. **Dynamic language switching** - Components update immediately when locale changes (no page reload required)
5. **Accessibility compliance** - All aria-labels and screen reader text are translated

### Assumptions & Clarifications

- Epic 1 foundation (next-intl setup) is complete and operational
- Translation files exist at `/messages/{locale}.json`
- The `items` namespace in `en.json` is the source of truth
- Components are client-side and should use `useTranslations` hook (not `getTranslations`)
- Translations for non-English languages (fr, es, de, nl, it) will be generated in a separate task

---

## 3. Implementation Plan

### Step 1: Audit All ItemManager Components for Hardcoded Strings

- **Description**: Systematically review all 50+ component files in `/src/components/ItemManager/` to identify any remaining hardcoded English strings
- **Rationale**: Need complete inventory before making changes to ensure nothing is missed
- **Estimated Effort**: S (2-3 hours)

### Step 2: Update Shared Components in `/components/shared/`

- **Description**: Update utility components that don't currently use translations
- **Rationale**: Shared components are used across multiple parent components; fixing them propagates fixes upward
- **Estimated Effort**: S (2-3 hours)

**Components to update:**
- `ViewModeToggle.tsx` - Add props for translated labels or use translations internally
- `TagChip.tsx` - Translate aria-label pattern
- `TouchButton.tsx` - Check for hardcoded strings
- `BottomSheet.tsx` - Check for hardcoded strings

### Step 3: Update SearchInput Component

- **Description**: Replace hardcoded placeholder and aria-labels with props or translations
- **Rationale**: SearchInput is used in the toolbar and needs i18n support
- **Estimated Effort**: XS (1 hour)

### Step 4: Verify and Fix Dialog Components

- **Description**: Double-check all dialog components for complete i18n coverage
- **Rationale**: Dialogs contain critical user-facing text like confirmations and warnings
- **Estimated Effort**: S (2 hours)

**Components to verify:**
- `ConfirmDeleteDialog.tsx`
- `BulkTagDialog.tsx`
- `BulkMoveDialog.tsx`
- `AssetRemoveConfirmDialog.tsx`
- `FilterPanel.tsx`
- `SortMenu.tsx`
- `LocationFilter.tsx`
- `PropertyFilter.tsx`
- `TagFilter.tsx`
- `ContentTypeFilter.tsx`
- `ColumnSettingsPopup.tsx`

### Step 5: Verify and Fix Preview Components

- **Description**: Ensure all preview-related components use translations
- **Rationale**: Preview modal is a key user interaction point
- **Estimated Effort**: S (2 hours)

**Components to verify:**
- `ItemPreviewModal.tsx`
- `MediaGallery.tsx`
- `InstructionsViewer.tsx`
- `AnalyticsSection.tsx`
- `VideoPlayer.tsx`
- `PhotoViewer.tsx`
- `PDFViewer.tsx`

### Step 6: Verify Core Components

- **Description**: Final verification of main ItemManager components
- **Rationale**: Core components orchestrate the entire feature; must be complete
- **Estimated Effort**: S (1-2 hours)

**Components to verify:**
- `ItemManager.tsx` (already has translations)
- `ItemToolbar.tsx` (already has translations)
- `ItemGrid.tsx`
- `ItemList.tsx`
- `ItemCard.tsx`
- `ItemRow.tsx`

### Step 7: Add Missing Translation Keys

- **Description**: Add any new translation keys discovered during implementation to `/messages/en.json`
- **Rationale**: New keys must be added to support previously hardcoded strings
- **Estimated Effort**: S (1-2 hours)

### Step 8: Verify TypeScript Compilation

- **Description**: Run `npm run typecheck` to ensure no type errors from i18n changes
- **Rationale**: Type safety is critical; changes must not break compilation
- **Estimated Effort**: XS (30 minutes)

---

## 4. Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### 4.1 Shared Components (Step 2)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/shared/ViewModeToggle.tsx` | Component props or i18n hook | Modify |
| `src/components/ItemManager/components/shared/TagChip.tsx` | aria-label translation | Modify |
| `src/components/ItemManager/components/shared/TouchButton.tsx` | i18n verification | Modify |
| `src/components/ItemManager/components/shared/BottomSheet.tsx` | i18n verification | Modify |
| `src/components/ItemManager/components/shared/EmptyState.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/shared/LoadingState.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/shared/InlineEdit.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/shared/TagsInlineEdit.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/shared/VisitCountBadge.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/shared/ReactionSummary.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/shared/EngagementIndicator.tsx` | i18n verification | Verify |

### 4.2 SearchInput (Step 3)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/SearchInput.tsx` | Add translations for placeholder/aria-labels | Modify |

### 4.3 Dialog Components (Step 4)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/dialogs/FilterPanel.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/dialogs/SortMenu.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/dialogs/LocationFilter.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/dialogs/PropertyFilter.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/dialogs/TagFilter.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx` | i18n verification | Verify |

### 4.4 Preview Components (Step 5)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/ItemPreview/MediaGallery.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/ItemPreview/AnalyticsSection.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/ItemPreview/VideoPlayer.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/ItemPreview/viewers/PhotoViewer.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx` | i18n verification | Verify |

### 4.5 Asset Panel Components (Step 5)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/AssetPanel/AssetItem.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx` | i18n verification | Verify |

### 4.6 Core Components (Step 6)

| File | Target | Type |
|------|--------|------|
| `src/components/ItemManager/ItemManager.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/ItemToolbar.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/ItemGrid.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/ItemList.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/ItemCard.tsx` | i18n verification | Verify |
| `src/components/ItemManager/components/ItemRow.tsx` | i18n verification | Verify |

### 4.7 Translation Files (Step 7)

| File | Target | Type |
|------|--------|------|
| `messages/en.json` | `items` namespace - add missing keys | Modify |
| `messages/fr.json` | `items` namespace - add missing keys (if generating translations) | Modify |
| `messages/es.json` | `items` namespace - add missing keys (if generating translations) | Modify |
| `messages/de.json` | `items` namespace - add missing keys (if generating translations) | Modify |
| `messages/nl.json` | `items` namespace - add missing keys (if generating translations) | Modify |
| `messages/it.json` | `items` namespace - add missing keys (if generating translations) | Modify |

---

## 5. Dependencies

### 5.1 Depends On (Completed First)

- **REQ-E02-078** (Task 2D.1): Create items namespace structure - **Required**. The `items` namespace must exist with proper key hierarchy before components can use it. (Investigation shows this is already complete.)
- **Epic 1 Foundation**: next-intl setup, `IntlProvider`, translation files must be operational. (Investigation shows this is already complete.)

### 5.2 Blocks (Requires This First)

- **REQ-E02-080** (Task 2D.3): Update ItemGrid and ItemCard for locale-aware content display - Can proceed in parallel but may need to coordinate on translation keys.
- **REQ-E02-081** (Task 2D.4): Update filter and sort components - May already be complete based on codebase investigation.
- **REQ-E02-082** (Task 2D.5): Update bulk action dialogs - May already be complete based on codebase investigation.

### 5.3 Parallel Safety

- **Files touched**: All files in `src/components/ItemManager/`
- **Conflicts with**: REQ-E02-080, REQ-E02-081, REQ-E02-082 (all modify ItemManager components)
- **Safe to parallelize with**: Tasks in other sub-epics (2A Auth, 2B Dashboard, 2C Workflow, etc.)

### 5.4 External Dependencies

- **next-intl**: i18n framework (already installed)
- **No API changes required**: All changes are frontend-only

---

## 6. Risks and Considerations

### 6.1 Potential Side Effects

1. **Text length variations**: German and French text is typically 20-40% longer than English. UI components may need layout adjustments.
2. **Prop drilling**: Some components receive labels via props instead of using hooks directly. This pattern should be preserved where it exists.
3. **Test updates**: Unit tests with snapshot testing may fail if they include translated text.

### 6.2 Testing Requirements

1. **Visual regression testing**: Verify UI doesn't break with longer translated strings
2. **Language switching**: Test that changing locale updates all ItemManager text immediately
3. **Screen reader testing**: Verify aria-labels are properly translated
4. **Edge cases**: Test empty states, loading states, error states in non-English locales

### 6.3 Open Questions

- [ ] Should `ViewModeToggle` use internal translations or receive labels via props? (Props pattern is used in `ItemToolbar`, may want consistency)
- [ ] Should missing translation keys fall back to English or show the key? (Recommend: Fall back to English with console warning in dev)
- [ ] Are there any component tests that will need updating for i18n?

---

## 7. Out of Scope

The following are explicitly **NOT** part of this task:

1. **Creating translations for non-English languages** - Only English source strings are added; translation generation is a separate task
2. **Modifying database schema** - No changes to item_translations or other tables
3. **Locale detection/switching logic** - Handled by Epic 1 foundation
4. **RTL (right-to-left) language support** - Not in current supported languages
5. **Date/time/number formatting** - Covered by separate i18n formatting utilities
6. **Refactoring component architecture** - Only i18n-specific changes; no structural refactoring

---

## 8. Implementation Pattern Reference

### Client Component Pattern

```typescript
// Before (hardcoded strings)
function ViewModeToggle({ viewMode, onViewModeChange }) {
  return (
    <div aria-label="View mode selection">
      <button aria-label="Grid view">...</button>
      <button aria-label="List view">...</button>
    </div>
  );
}

// After (translated)
import { useTranslations } from 'next-intl';

function ViewModeToggle({ viewMode, onViewModeChange }) {
  const t = useTranslations('items');
  return (
    <div aria-label={t('view.toggle')}>
      <button aria-label={t('view.grid')}>...</button>
      <button aria-label={t('view.list')}>...</button>
    </div>
  );
}
```

### Props-Based Pattern (Alternative)

```typescript
// For components that receive labels via props (maintains flexibility)
interface ViewModeToggleProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  labels?: {
    toggle?: string;
    grid?: string;
    list?: string;
  };
}

function ViewModeToggle({ viewMode, onViewModeChange, labels }: ViewModeToggleProps) {
  const t = useTranslations('items');
  return (
    <div aria-label={labels?.toggle || t('view.toggle')}>
      <button aria-label={labels?.grid || t('view.grid')}>...</button>
      <button aria-label={labels?.list || t('view.list')}>...</button>
    </div>
  );
}
```

---

## 9. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2D section
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-079
- [CLAUDE.md](/CLAUDE.md) - Translation function types and conventions
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated: 2026-01-22 12:49*
