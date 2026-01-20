# REQ-E05-029: Integrate Translation Preview Panel into Item Editor

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.2
**Size:** M (Medium)
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`

---

## 1. Summary

Property owners need the translation preview panel to automatically display within the item editor after saving content changes, showing translation status for all languages and providing immediate access to translation management actions.

---

## 2. Current Behavior

The item editor page at `/src/app/dashboard2/items/[publicId]/edit/page.tsx` allows users to edit item metadata (name, description, room, item type, tags) and then saves changes via the admin API. Upon successful save, the user is redirected to `/dashboard2/items` without any visibility into translation status. This requires property owners to navigate to separate translation management pages or use other interfaces to review translation coverage for items they just created or updated.

---

## 3. Expected Behavior

After saving an item in the editor, the translation preview panel automatically slides in from the right side of the screen displaying the item's translation status across all six supported languages (EN, ES, FR, DE, IT, PT), with the panel opening immediately when pending translations exist and remaining closed when translations are already complete unless explicitly opened through a dedicated control button.

Key behaviors:
- **Auto-open logic:** Panel opens automatically only when pending or failed translations exist
- **Manual toggle:** A "View Translations" button in the header/toolbar allows manual panel access
- **Slide-in animation:** 400px panel slides from right with 300ms transition
- **Non-blocking overlay:** Panel overlays content without causing layout reflow
- **Real-time updates:** Panel updates as translation jobs complete via Supabase Realtime
- **Action support:** Edit, re-translate, and retry actions function within editor context

---

## 4. User Impact

Property owners can:
- Immediately review translation status after updating item content without leaving the editor context
- Understand which language translations are processing or require attention right after save completion
- Take immediate corrective actions on failed translations without navigation overhead
- Maintain efficient workflows by staying in the editor while managing translation tasks

---

## 5. Business Value

- **Streamlined workflow:** Integrates translation management directly into the editing experience
- **Proactive quality control:** Encourages property owners to verify translation coverage immediately after content updates
- **Reduced context switching:** Eliminates need to navigate between editing and translation management interfaces
- **Higher completion rates:** Makes translation gaps visible at the moment of content save

---

## 6. Technical Context

### 6.1 Existing Patterns to Follow

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Slide-in modal/drawer | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Base pattern for panel animation and overlay |
| Radix UI Dialog | `@radix-ui/react-dialog` | Focus management, accessibility, portal rendering |
| Editor save flow | `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx` | Reference for article editor integration (REQ-E05-029) |
| Form state management | Current item edit page | useState hooks for form fields and loading states |

### 6.2 Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Epic 1 (Foundation) | Required | Translation tables, i18n framework |
| Epic 3 (Dynamic Content) | Required | Translation trigger system, status tracking |
| REQ-E05-007 (TranslationPreviewPanel) | Required | Panel component must exist |
| REQ-E05-011 (useTranslationStatus) | Required | Hook for fetching translation status |
| REQ-E05-012 (useTranslationRealtime) | Required | Hook for real-time subscription |
| REQ-E05-029 (Article Editor Integration) | Reference | Same pattern to follow for consistency |

### 6.3 Component Architecture

```
/src/app/dashboard2/items/[publicId]/edit/page.tsx
  ├── Existing: Form state (name, description, tags)
  ├── Existing: handleSubmit (save handler)
  ├── New: Translation panel state (isOpen, shouldAutoOpen)
  ├── New: TranslationPreviewPanel component integration
  ├── New: Toggle button in header/toolbar
  └── New: Post-save panel auto-open logic
```

### 6.4 State Management

```typescript
// New state additions for translation panel
const [isPanelOpen, setIsPanelOpen] = useState(false);
const [hasPendingTranslations, setHasPendingTranslations] = useState(false);
const [savedItemId, setSavedItemId] = useState<string | null>(null);

// Use hooks from Epic 5 dependencies
const { data: translationStatus, loading: statusLoading } = useTranslationStatus({
  entityType: 'item',
  entityId: savedItemId || item?.id,
  enabled: !!item?.id
});

const { connectionStatus } = useTranslationRealtime({
  entityType: 'item',
  entityId: item?.id,
  onUpdate: (update) => {
    // Trigger status refetch or optimistic update
  }
});
```

---

## 7. Implementation Approach

### 7.1 Modify Item Edit Page

1. **Import translation components and hooks:**
   - Import `TranslationPreviewPanel` from `/src/components/TranslationManagement`
   - Import `useTranslationStatus` and `useTranslationRealtime` hooks
   - Import necessary icons (Languages or Globe from lucide-react)

2. **Add panel state management:**
   - `isPanelOpen`: Controls panel visibility
   - `hasPendingTranslations`: Tracks if auto-open should trigger
   - Track saved item ID for fetching status after save

3. **Modify handleSubmit (save flow):**
   - After successful save, DO NOT immediately redirect
   - Fetch translation status for the saved item
   - Check if any translations are pending or failed
   - If pending/failed exist: auto-open panel, stay on page
   - If all complete: optionally show panel or redirect (based on user preference)

4. **Add toggle button to header:**
   - Position: Next to "Back to Items" or in the action button row
   - Label: "View Translations" with Languages/Globe icon
   - State: Shows translation count badge if pending/failed exist

5. **Integrate TranslationPreviewPanel:**
   - Render panel component with entity reference props
   - Handle onClose to set isPanelOpen to false
   - Handle action callbacks (edit, re-translate, retry)

6. **Add keyboard shortcut:**
   - Alt+T to toggle panel open/close
   - Implement with useEffect keyboard listener

### 7.2 Post-Save Behavior Logic

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!item) return;

  setSaving(true);
  setError(null);

  try {
    // ... existing save logic ...
    const response = await adminApi.updateItem(publicId, payload, headers);

    if (response.success) {
      // NEW: Check translation status instead of immediate redirect
      const statusResponse = await fetchTranslationStatus(item.id);

      const hasPending = statusResponse?.translations?.some(
        t => t.status === 'pending' || t.status === 'failed'
      );

      if (hasPending) {
        // Auto-open panel, stay on page
        setIsPanelOpen(true);
        setHasPendingTranslations(true);
      } else {
        // All translations complete or none exist
        // Either show panel briefly or redirect
        router.push('/dashboard2/items');
      }
    } else {
      setError(response.error || 'Failed to update item');
    }
  } catch (err) {
    // ... existing error handling ...
  } finally {
    setSaving(false);
  }
};
```

### 7.3 Panel Integration

```tsx
// In the return statement, after the form
{item && (
  <TranslationPreviewPanel
    entityType="item"
    entityId={item.id}
    sourceLanguage="en" // or from item.source_language if available
    sourceContent={{
      name: item.name,
      description: item.description || undefined
    }}
    isOpen={isPanelOpen}
    onClose={() => setIsPanelOpen(false)}
    onTranslationEdited={(language) => {
      // Optionally handle post-edit actions
      console.log(`Translation edited for ${language}`);
    }}
  />
)}

// Toggle button in header
<button
  type="button"
  onClick={() => setIsPanelOpen(true)}
  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
  aria-label="View translation status"
>
  <Languages className="w-4 h-4" />
  <span className="hidden sm:inline">Translations</span>
  {hasPendingTranslations && (
    <span className="w-2 h-2 bg-orange-500 rounded-full" />
  )}
</button>
```

---

## 8. Authorized Files and Functions for Modification

### 8.1 Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/app/dashboard2/items/[publicId]/edit/page.tsx` | Modify | Main integration point - add panel state, imports, toggle button, panel component, save flow changes |

### 8.2 Functions to Modify

| Function | File | Changes |
|----------|------|---------|
| `EditItemPage` (component) | `page.tsx` | Add state hooks, import statements, panel rendering |
| `handleSubmit` | `page.tsx` | Modify to check translation status after save, conditionally open panel |
| (new) Keyboard handler | `page.tsx` | Add useEffect for Alt+T shortcut |

### 8.3 New Imports Required

```typescript
// From TranslationManagement components (Epic 5)
import { TranslationPreviewPanel } from '@/components/TranslationManagement';

// Hooks (Epic 5)
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';

// Icons
import { Languages } from 'lucide-react';
```

### 8.4 Files NOT to Modify

- Do NOT modify other editor pages (article editor has separate REQ-E05-029)
- Do NOT modify TranslationPreviewPanel component itself
- Do NOT modify hook implementations
- Do NOT modify API routes

---

## 9. Acceptance Criteria

Based on REQ-E05-030 from gen_requests_epic5.md:

- [ ] TranslationPreviewPanel component is integrated into item editor page at `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- [ ] Panel component receives item entity reference (entityType: 'item', entityId: itemId)
- [ ] Panel state management controls when panel is visible or hidden
- [ ] Panel automatically opens after successful item save operation completes
- [ ] Panel auto-open logic checks if any translation jobs are pending or failed
- [ ] Panel opens automatically only when pending or failed translations exist
- [ ] Panel remains closed after save when all translations are complete and up-to-date
- [ ] Manual toggle button displays in item editor header or toolbar area
- [ ] Manual toggle button shows "View Translations" or similar descriptive label
- [ ] Clicking toggle button opens panel regardless of automatic open conditions
- [ ] Panel slide-in animation triggers smoothly without disrupting editor layout
- [ ] Panel overlays editor content without causing layout reflow or shifting
- [ ] Panel remains accessible while editor is in edit mode for parallel workflows
- [ ] Panel close button dismisses panel and returns focus to editor content
- [ ] Clicking overlay backdrop outside panel closes panel
- [ ] Panel updates in real-time as translation jobs complete through subscriptions
- [ ] Panel integration preserves existing item editor save functionality
- [ ] Panel open state does not interfere with editor autosave if enabled
- [ ] Panel displays loading state while fetching translation status after save
- [ ] Panel handles error states gracefully if status fetch fails
- [ ] Panel shows empty state appropriately for newly created items without translations yet
- [ ] Panel action buttons (edit, re-translate, retry) function correctly within editor context
- [ ] Edit translation action opens editor modal without conflicting with item editor
- [ ] Re-translate action triggers translation jobs and updates panel status
- [ ] Panel width (400px) does not obscure critical editor controls on standard viewports
- [ ] Panel adapts responsively for tablet viewports maintaining usability
- [ ] Panel component accepts optional onClose callback for editor state management
- [ ] Integration includes keyboard shortcuts for opening/closing panel (e.g., Alt+T)
- [ ] Panel keyboard accessibility works correctly within editor context
- [ ] Focus management handles transitions between editor and panel appropriately
- [ ] Panel z-index ensures it overlays editor content without being obscured by other UI elements
- [ ] Integration maintains editor performance without noticeable lag during panel operations
- [ ] Component handles edge cases like deleted items or missing permissions gracefully
- [ ] Panel displays correctly in both light and dark theme contexts if themes are supported
- [ ] Integration follows consistent patterns with article editor translation panel integration from REQ-E05-029

---

## 10. Testing Considerations

### 10.1 Unit Tests
- Test panel state management (open/close toggle)
- Test auto-open logic with various translation status scenarios
- Test keyboard shortcut handler (Alt+T)

### 10.2 Integration Tests
- Test save flow with pending translations triggers panel open
- Test save flow with complete translations allows redirect
- Test panel actions (edit, re-translate) integrate correctly

### 10.3 E2E Tests
- Complete flow: edit item -> save -> panel opens -> edit translation -> close panel
- Test manual toggle works independent of save action
- Test responsive behavior on tablet viewports

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| TranslationPreviewPanel not yet implemented | Medium | High | Check dependency status before implementation; stub component if needed |
| useTranslationStatus hook not available | Medium | High | Implement fallback direct API call; feature flag integration |
| Panel overlaps critical UI elements | Low | Medium | Carefully set z-index; test on various viewport sizes |
| Save flow timing issues with status fetch | Low | Medium | Add loading state; handle race conditions with cleanup |
| Performance impact from realtime subscription | Low | Low | Ensure proper cleanup on unmount; throttle updates if needed |

---

## 12. Dependencies Checklist

Before implementation, verify these dependencies are complete:

- [ ] REQ-E05-007: TranslationPreviewPanel component exists
- [ ] REQ-E05-011: useTranslationStatus hook implemented
- [ ] REQ-E05-012: useTranslationRealtime hook implemented
- [ ] REQ-E05-001: Translation status API endpoint working
- [ ] Epic 1: Translation tables and i18n framework deployed
- [ ] Epic 3: Translation trigger system operational

---

## 13. References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request: `/docs/gen_requests_epic5.md` - REQ-E05-030
- Article Editor Integration (Reference Pattern): REQ-E05-029
- Existing Modal Pattern: `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- Item Edit Page: `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- Radix UI Dialog: https://www.radix-ui.com/primitives/docs/components/dialog
- Supabase Realtime: https://supabase.com/docs/guides/realtime

---

*Generated for FAQBNB Localization Epic 5 - Owner Translation Management*
