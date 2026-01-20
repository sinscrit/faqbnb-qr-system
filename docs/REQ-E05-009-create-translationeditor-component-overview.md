# REQ-E05-009: Create TranslationEditor Component

## Implementation Overview

**Date Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Status:** PENDING
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.5
**Size:** M (Medium)

---

## Summary

Create a modal dialog component that enables property owners to manually edit machine-generated translations with a side-by-side view comparing original source content and editable translation text. The component provides character count monitoring, dirty state tracking, and save/cancel workflows with unsaved changes confirmation.

---

## Requirements Reference

**Source Request:** REQ-E05-010 from `/docs/gen_requests_epic5.md`

**Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` - Phase 2, Task 2.5

### Acceptance Criteria (from Request)

- [ ] Modal dialog uses Radix UI Dialog primitive for accessibility and focus management
- [ ] Modal opens centered on viewport with overlay backdrop that prevents interaction with underlying content
- [ ] Left side displays original source content in read-only format with clear visual styling
- [ ] Right side displays editable textarea for translation content with appropriate font size and spacing
- [ ] Both sides display content in equal-width columns (50% each) on desktop viewports
- [ ] Character count displays beneath translation textarea showing current length versus maximum if applicable
- [ ] Character count shows warning state (orange/red color) when approaching or exceeding recommended limits
- [ ] Textarea auto-expands vertically to match content height up to a maximum threshold
- [ ] Dirty state indicator displays when translation content differs from original saved value
- [ ] Save button is disabled when no changes have been made (clean state)
- [ ] Save button is enabled when changes exist (dirty state)
- [ ] Cancel button displays confirmation dialog when unsaved changes exist
- [ ] Cancel button immediately closes modal when no changes have been made
- [ ] Save action persists changes via API and marks translation status as 'manual'
- [ ] Success notification displays after successful save operation
- [ ] Error notification displays if save operation fails with actionable error message
- [ ] Modal header displays language name and flag icon for the translation being edited
- [ ] Escape key triggers cancel workflow (with confirmation if dirty)
- [ ] Modal is fully keyboard accessible with proper tab order and focus management
- [ ] Modal adapts to mobile viewports by stacking original and translation vertically
- [ ] Component accepts entity reference (entityType, entityId) and language code as required props
- [ ] Component accepts original content text as required prop
- [ ] Component accepts existing translation text as optional prop
- [ ] Component accepts onSave callback function that receives updated translation content
- [ ] Component integrates with manual translation update API endpoint
- [ ] Loading state displays during save operation with disabled controls
- [ ] Component maintains focus on first interactive element when opened
- [ ] Component returns focus to triggering element when closed

---

## Technical Context

### Existing Patterns to Follow

| Pattern | Reference File | Usage |
|---------|---------------|-------|
| Radix Dialog Modal | `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx` | Base modal structure with Dialog.Root, Portal, Overlay, Content |
| Character Counter | `/src/components/ItemCapture/editors/MarkdownEditor.tsx` (lines 63-112) | Progress bar with warning/error states |
| Unsaved Changes Dialog | `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx` | Confirmation pattern for dirty state |
| Focus Trap | `/src/components/ItemManager/utils/a11yUtils.tsx` | useFocusTrap hook for modal accessibility |
| Side-by-Side Layout | `/src/components/ItemCapture/editors/MarkdownEditor.tsx` | Desktop flex layout with mobile stack |

### Dependencies

**From Epic 1 (Foundation):**
- Translation table schema with `translation_status` column
- `SupportedLanguage` type from `/src/lib/translation-service/translation-service.types.ts`
- `SUPPORTED_LANGUAGES` constant with flag emojis and language names

**From Epic 5 (Owner Management):**
- TranslationManagement types file (REQ-E05-006)
- Manual translation update API endpoint `PUT /api/translations/[entityType]/[entityId]/[language]` (REQ-E05-002)
- TranslationPreviewPanel integration (REQ-E05-007)

### Component Location

```
/src/components/TranslationManagement/
├── TranslationEditor/
│   ├── index.ts                     # Barrel exports
│   ├── TranslationEditor.tsx        # Main modal component
│   ├── TranslationEditor.types.ts   # Component-specific types
│   └── CharacterCounter.tsx         # Character count sub-component (optional extraction)
```

---

## Implementation Approach

### 1. Component Props Interface

```typescript
interface TranslationEditorProps {
  /** Whether editor is open */
  isOpen: boolean;
  /** Entity reference */
  entityType: 'article' | 'item' | 'link';
  entityId: string;
  /** Target language for editing */
  language: SupportedLanguage;
  /** Source content (original language) */
  sourceContent: {
    title?: string;
    description?: string;
    name?: string;
  };
  /** Source language */
  sourceLanguage: SupportedLanguage;
  /** Existing translation (if any) */
  existingTranslation?: {
    title?: string;
    description?: string;
    name?: string;
    status?: TranslationStatus;
  };
  /** Maximum character limit (optional, for character counter warning) */
  maxCharacters?: number;
  /** Save handler - called with updated content */
  onSave: (content: TranslationContent) => Promise<void>;
  /** Cancel/close handler */
  onCancel: () => void;
}

interface TranslationContent {
  title?: string;
  description?: string;
  name?: string;
}
```

### 2. Modal Structure

The modal uses Radix UI Dialog primitives:

```tsx
<Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      {/* Header with language flag and name */}
      {/* Side-by-side content area */}
      {/* Footer with Save/Cancel buttons */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### 3. Side-by-Side Layout

**Desktop (≥768px):**
- Two equal columns (50% each)
- Left: Read-only source content with gray background
- Right: Editable textarea with character counter

**Mobile (<768px):**
- Stacked layout: Source at top, translation below
- Source collapsible or scrollable
- Full-width textarea

### 4. Dirty State Tracking

```typescript
const [editedContent, setEditedContent] = useState(existingTranslation);
const isDirty = useMemo(() => {
  return JSON.stringify(editedContent) !== JSON.stringify(existingTranslation);
}, [editedContent, existingTranslation]);
```

### 5. Character Counter Implementation

Follow the pattern from MarkdownEditor.tsx:
- Display current/max character count
- Warning state at 90% (orange/yellow)
- Error state when exceeded (red)
- Progress bar visual indicator
- `aria-live="polite"` for screen reader announcements

### 6. Unsaved Changes Confirmation

When canceling with dirty state:
1. Show confirmation dialog (ConfirmExitDialog pattern)
2. "Discard Changes" vs "Keep Editing" options
3. Escape key triggers same flow

### 7. API Integration

Save action calls:
```typescript
PUT /api/translations/{entityType}/{entityId}/{language}
Body: { title?: string, description?: string, name?: string }
```

Response handling:
- Success: Toast notification, close modal
- Error: Toast with error message, keep modal open

### 8. Focus Management

- Focus first interactive element (textarea) on open
- Focus trap within modal (Tab cycles through focusable elements)
- Return focus to trigger element on close
- Use `useFocusTrap` hook from `/src/components/ItemManager/utils/a11yUtils.tsx`

---

## Visual Specifications

### Modal Dimensions

| Viewport | Width | Layout |
|----------|-------|--------|
| Desktop (≥768px) | max-w-4xl (896px) | Side-by-side columns |
| Tablet (768px-1024px) | 90% viewport width | Side-by-side columns |
| Mobile (<768px) | Full width - 16px margins | Stacked layout |

### Header Design

```
┌─────────────────────────────────────────────────────────────────┐
│ 🇫🇷 Edit French Translation                               [X]   │
└─────────────────────────────────────────────────────────────────┘
```

- Flag emoji from `SUPPORTED_LANGUAGES` constant
- Language name (e.g., "Edit French Translation")
- Close button (X) with 44px touch target

### Content Area Design

```
┌─────────────────────────────────────────────────────────────────┐
│  Original (English)           │  Translation (Français)         │
│  ┌─────────────────────────┐  │  ┌─────────────────────────┐   │
│  │ Title: How to Use...    │  │  │ [Title textarea]        │   │
│  │                         │  │  │                         │   │
│  │ Description:            │  │  │ [Description textarea]  │   │
│  │ Load dishes on the...   │  │  │                         │   │
│  └─────────────────────────┘  │  └─────────────────────────┘   │
│                               │  125 / 500 characters ━━━━━░░░ │
│                               │  ● Unsaved changes             │
└─────────────────────────────────────────────────────────────────┘
```

### Footer Design

```
┌─────────────────────────────────────────────────────────────────┐
│                                      [Cancel]  [Save Changes]   │
└─────────────────────────────────────────────────────────────────┘
```

- Cancel: Gray secondary button
- Save: Blue primary button (disabled when clean, loading spinner when saving)

### Color Specifications

| Element | Tailwind Class | Hex |
|---------|---------------|-----|
| Source background | `bg-gray-50` | #F9FAFB |
| Source border | `border-gray-200` | #E5E7EB |
| Dirty indicator | `text-amber-500` | #F59E0B |
| Character warning | `text-yellow-500` | #EAB308 |
| Character error | `text-red-500` | #EF4444 |
| Save button | `bg-blue-600` | #2563EB |
| Cancel button | `bg-gray-100` | #F3F4F6 |

---

## Authorized Files and Functions for Modification

### New Files to Create

| File | Purpose |
|------|---------|
| `/src/components/TranslationManagement/TranslationEditor/index.ts` | Barrel exports |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | Main modal component |
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.types.ts` | Component-specific types |

### Files to Modify

| File | Modifications |
|------|--------------|
| `/src/components/TranslationManagement/index.ts` | Add TranslationEditor exports |

### Allowed Dependencies

| Dependency | Purpose | Import Path |
|------------|---------|-------------|
| @radix-ui/react-dialog | Modal primitive | `@radix-ui/react-dialog` |
| lucide-react | Icons (X, Loader2, AlertTriangle) | `lucide-react` |
| cn utility | Class name merging | `@/lib/utils` |
| SupportedLanguage | Language type | `@/lib/translation-service/translation-service.types` |
| SUPPORTED_LANGUAGES | Language metadata | `@/lib/translation-service/translation-service.types` |
| useFocusTrap | Focus management | `@/components/ItemManager/utils/a11yUtils` |

---

## Testing Considerations

### Unit Tests

1. Dirty state detection accuracy
2. Character count calculation
3. Warning/error threshold detection
4. Props validation

### Component Tests

1. Modal open/close behavior
2. Focus management on open
3. Focus restoration on close
4. Escape key handling
5. Unsaved changes confirmation flow
6. Form submission with loading state
7. Mobile responsive layout

### Integration Tests

1. API call on save
2. Error handling display
3. Success notification display

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| Focus trap | `useFocusTrap` hook active when modal open |
| ARIA labels | Dialog.Title, aria-describedby for content |
| Keyboard navigation | Tab cycles through interactive elements |
| Escape key | Triggers cancel workflow |
| Screen reader | Character counter uses aria-live="polite" |
| Color contrast | All text meets WCAG 2.1 AA (4.5:1 ratio) |
| Touch targets | Minimum 44px for mobile |

---

## Error Handling

| Scenario | User Feedback |
|----------|--------------|
| API save fails | Toast: "Failed to save translation. Please try again." |
| Network error | Toast: "Network error. Check your connection and try again." |
| Validation error | Inline error message near affected field |
| Character limit exceeded | Red character counter, save button enabled (allows submission for API validation) |

---

## Dependencies Graph

```
TranslationEditor
├── @radix-ui/react-dialog (npm)
├── lucide-react (npm)
├── /src/lib/utils (cn function)
├── /src/lib/translation-service/translation-service.types
│   └── SupportedLanguage, SUPPORTED_LANGUAGES
├── /src/components/ItemManager/utils/a11yUtils
│   └── useFocusTrap
├── /src/components/TranslationManagement/TranslationManagement.types
│   └── TranslationEditorProps (shared types)
└── API: PUT /api/translations/[entityType]/[entityId]/[language]
```

---

## Implementation Checklist

- [ ] Create TranslationEditor/index.ts with exports
- [ ] Create TranslationEditor.types.ts with props interface
- [ ] Create TranslationEditor.tsx main component
- [ ] Implement Radix Dialog structure
- [ ] Implement side-by-side layout (desktop)
- [ ] Implement stacked layout (mobile)
- [ ] Implement character counter with progress bar
- [ ] Implement dirty state tracking
- [ ] Implement unsaved changes confirmation dialog
- [ ] Implement save with loading state
- [ ] Implement error handling with toast
- [ ] Add focus trap on modal open
- [ ] Add focus restoration on close
- [ ] Add Escape key handler
- [ ] Add ARIA attributes for accessibility
- [ ] Update TranslationManagement/index.ts exports
- [ ] Write component tests

---

## References

- [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request: `/docs/gen_requests_epic5.md` (REQ-E05-010)
- Character Counter Pattern: `/src/components/ItemCapture/editors/MarkdownEditor.tsx`
- Modal Pattern: `/src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- Confirmation Dialog Pattern: `/src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`
