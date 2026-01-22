# Implementation Overview: Create TranslationEditor Component

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-010 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 10:30 |
| Breakdown Created | 2026-01-22 19:13 |
| T-shirt Size | M |
| Estimated Effort | 8-10 hours |

## Goals

Create a modal dialog component for editing translation content with a side-by-side layout showing original source content alongside editable translation fields. The component provides comprehensive editing capabilities including textareas with auto-resize, character count warnings, dirty state tracking with unsaved changes prompts, loading states during save operations, and full keyboard accessibility.

**Technical Requirements:**
- Radix Dialog modal component for consistent accessibility
- Side-by-side responsive layout: original (left) vs translation (right)
- Editable textarea fields for title, description, instructions
- Auto-resizing textareas based on content length (minimum 3 rows)
- Character count display with color-coded warnings (gray < 80%, amber 80-99%, green at limit, red over limit)
- Dirty state tracking comparing current values to initial values
- Unsaved changes confirmation prompt when closing with edits
- Save button disabled when no changes (isDirty=false)
- Loading state with spinner during save operations
- Error handling with inline message display
- Focus management (first textarea on open, trap focus in modal)
- i18n support via next-intl for all UI text
- ARIA attributes for accessibility

### Assumptions & Clarifications

- **Discovery**: PropertyEditModal.tsx (lines 181-571) provides excellent Radix Dialog pattern with form validation and dirty state
- **Discovery**: TextEditorStep.tsx (lines 146-195) shows character counter component with color-coded warnings
- **Discovery**: InstructionEditor.tsx uses isDirty state tracking with window.confirm for unsaved changes (lines 105-159)
- **Discovery**: Project uses Radix Dialog via `@radix-ui/react-dialog` import pattern
- **Assumption**: Component receives TranslationFieldContent[] for both source and initial translation
- **Assumption**: Parent component handles API calls, this component just calls onSave callback
- **Assumption**: Entity types (item/article/link/tag) have same translatable fields (title, description, instructions)
- **Assumption**: Character limits differ by field: title (100), description (500), instructions (500)
- **Clarification needed**: Should we show diff/comparison highlighting between original and translation?
- **Clarification needed**: Should textarea scroll sync between original and translation sides?

## Implementation Plan

### Step 1: Create Component Directory and File Structure
- **Description**: Set up component directory and create main component file
- **Rationale**: Establish proper folder organization for Epic 5 components
- **Estimated Effort**: 10 minutes

Create directory:
```bash
mkdir -p src/components/TranslationManagement/TranslationEditor
```

Create files:
- `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` - Main modal component
- `/src/components/TranslationManagement/TranslationEditor/index.ts` - Barrel export file

### Step 2: Define Props Interface and Type Definitions
- **Description**: Create TypeScript interfaces for component props and internal state
- **Rationale**: Establish type safety for component API
- **Estimated Effort**: 30 minutes

Props interface (initially in component file, later move to TranslationManagement.types.ts):
```typescript
export interface TranslationEditorProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Entity ID being translated */
  entityId: string;
  /** Entity type being translated */
  entityType: 'item' | 'article' | 'link' | 'tag';
  /** Target language code */
  language: SupportedLanguage;
  /** Source content fields (read-only) */
  sourceContent: TranslationFieldContent[];
  /** Initial translation content (editable) */
  initialTranslation: TranslationFieldContent[];
  /** Callback when save is triggered */
  onSave: (content: TranslationFieldContent[]) => Promise<void>;
  /** Loading state during save operation */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface TranslationFieldContent {
  /** Field identifier (e.g., 'title', 'description', 'instructions') */
  fieldName: string;
  /** Human-readable label */
  fieldLabel: string;
  /** Field value */
  value: string;
  /** Optional character limit */
  maxLength?: number;
}

interface EditorState {
  /** Current edited field values */
  fields: TranslationFieldContent[];
  /** Whether any field has been modified */
  isDirty: boolean;
  /** Whether save operation is in progress */
  isSubmitting: boolean;
  /** Error message if save fails */
  error: string | null;
}
```

### Step 3: Create CharacterCounter Subcomponent
- **Description**: Build reusable character counter with color-coded warnings
- **Rationale**: Extract this logic for reusability and testability
- **Estimated Effort**: 45 minutes

Component file: Same file or separate `CharacterCounter.tsx` in TranslationEditor directory

Pattern reference: TextEditorStep.tsx (lines 146-195)

```typescript
interface CharacterCounterProps {
  current: number;
  max: number;
  /** Threshold for warning (default: 80% of max) */
  warningThreshold?: number;
}

function CharacterCounter({ current, max, warningThreshold = 0.8 }: CharacterCounterProps) {
  const t = useTranslations('translationManagement.editor');

  const percentage = (current / max) * 100;
  const warningPoint = max * warningThreshold;
  const isNearLimit = current >= warningPoint && current < max;
  const isAtLimit = current === max;
  const isOverLimit = current > max;

  return (
    <div className="flex items-center justify-between text-xs mt-1">
      <span
        className={cn(
          'tabular-nums',
          isOverLimit && 'text-red-600 font-medium',
          isAtLimit && 'text-green-600 font-medium',
          isNearLimit && 'text-amber-600 font-medium',
          !isNearLimit && !isAtLimit && !isOverLimit && 'text-gray-500'
        )}
        aria-live="polite"
      >
        {current}/{max}
      </span>

      {/* Warning/Success Icons */}
      {isAtLimit && <span className="text-green-600">✓</span>}
      {(isNearLimit || isOverLimit) && (
        <span className={cn(isOverLimit ? 'text-red-600' : 'text-amber-600')}>⚠</span>
      )}
    </div>
  );
}
```

Color logic:
- Gray (< 80%): Normal state
- Amber (80-99%): Warning, approaching limit
- Green (at limit): At exact character limit
- Red (> limit): Over limit warning

### Step 4: Create TranslationFieldPair Subcomponent
- **Description**: Build side-by-side original/translation field pair component
- **Rationale**: Reusable component for each translatable field (title, description, instructions)
- **Estimated Effort**: 60 minutes

```typescript
interface TranslationFieldPairProps {
  /** Field configuration */
  field: TranslationFieldContent;
  /** Original source content */
  originalValue: string;
  /** Current translation value */
  translationValue: string;
  /** Callback when translation changes */
  onChange: (value: string) => void;
  /** Whether field is disabled during save */
  disabled?: boolean;
  /** Optional CSS classes */
  className?: string;
}

function TranslationFieldPair({
  field,
  originalValue,
  translationValue,
  onChange,
  disabled = false,
  className,
}: TranslationFieldPairProps) {
  const t = useTranslations('translationManagement.editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [translationValue]);

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-4', className)}>
      {/* Original (Read-only) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.fieldLabel} ({t('originalLabel')})
        </label>
        <div className="min-h-[6rem] p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
          {originalValue || <span className="text-gray-400 italic">{t('noContent')}</span>}
        </div>
      </div>

      {/* Translation (Editable) */}
      <div className="space-y-2">
        <label htmlFor={`translation-${field.fieldName}`} className="block text-sm font-medium text-gray-900">
          {field.fieldLabel} ({t('translationLabel')})
        </label>
        <textarea
          ref={textareaRef}
          id={`translation-${field.fieldName}`}
          value={translationValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={field.maxLength}
          rows={3}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'resize-none overflow-hidden',
            'text-sm text-gray-900'
          )}
        />
        {field.maxLength && (
          <CharacterCounter
            current={translationValue.length}
            max={field.maxLength}
          />
        )}
      </div>
    </div>
  );
}
```

Key features:
- Side-by-side on desktop (lg+), stacked on mobile
- Original shown as read-only div
- Translation shown as auto-resizing textarea
- Character counter below translation field
- Auto-resize textarea using ref and useEffect

### Step 5: Implement Main Component Structure with Radix Dialog
- **Description**: Build main modal component with Dialog wrapper and state management
- **Rationale**: Establish foundation with proper React state and Dialog behavior
- **Estimated Effort**: 60 minutes

Pattern reference: PropertyEditModal.tsx (lines 352-428)

Component structure:
```typescript
export function TranslationEditor({
  isOpen,
  onClose,
  entityId,
  entityType,
  language,
  sourceContent,
  initialTranslation,
  onSave,
  isLoading = false,
  className,
}: TranslationEditorProps) {
  const t = useTranslations('translationManagement.editor');
  const tLang = useTranslations('languages');

  // State management
  const [state, setState] = useState<EditorState>({
    fields: [],
    isDirty: false,
    isSubmitting: false,
    error: null,
  });

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setState({
        fields: [...initialTranslation],
        isDirty: false,
        isSubmitting: false,
        error: null,
      });
    }
  }, [isOpen, initialTranslation]);

  // Compute isDirty by comparing current to initial
  useEffect(() => {
    const hasChanges = state.fields.some((field, index) => {
      return field.value !== initialTranslation[index]?.value;
    });
    if (hasChanges !== state.isDirty) {
      setState(prev => ({ ...prev, isDirty: hasChanges }));
    }
  }, [state.fields, initialTranslation]);

  // Sync loading state from parent
  useEffect(() => {
    setState(prev => ({ ...prev, isSubmitting: isLoading }));
  }, [isLoading]);

  // Language name for title
  const languageName = tLang(language);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { /* handle close */ }}>
      {/* Dialog content */}
    </Dialog.Root>
  );
}
```

### Step 6: Implement Field Change and Dirty State Tracking
- **Description**: Add handlers for field value changes and dirty state computation
- **Rationale**: Core editing logic with change detection
- **Estimated Effort**: 30 minutes

```typescript
// Handle field value change
const handleFieldChange = useCallback((fieldName: string, value: string) => {
  setState(prev => ({
    ...prev,
    fields: prev.fields.map(field =>
      field.fieldName === fieldName ? { ...field, value } : field
    ),
    error: null, // Clear error on edit
  }));
}, []);

// Compute isDirty by comparing to initial
const isDirty = useMemo(() => {
  return state.fields.some((field, index) => {
    return field.value !== initialTranslation[index]?.value;
  });
}, [state.fields, initialTranslation]);
```

Pattern reference: PropertyEditModal.tsx (lines 229-235) for field change handling.

### Step 7: Implement Close Handler with Unsaved Changes Prompt
- **Description**: Add logic to prompt user when closing with unsaved changes
- **Rationale**: Prevent accidental loss of edits
- **Estimated Effort**: 30 minutes

Pattern reference: InstructionEditor.tsx (lines 152-159)

```typescript
const handleClose = useCallback(() => {
  if (state.isDirty && !state.isSubmitting) {
    const confirmed = window.confirm(t('unsavedChangesWarning'));
    if (!confirmed) return;
  }
  onClose();
}, [state.isDirty, state.isSubmitting, onClose, t]);

// In Dialog.Root:
<Dialog.Root
  open={isOpen}
  onOpenChange={(open) => {
    if (!open) handleClose();
  }}
>
```

Note: For better UX, consider replacing window.confirm with custom confirmation Dialog in future enhancement.

### Step 8: Implement Save Handler with Error Handling
- **Description**: Add save logic that calls onSave callback and handles errors
- **Rationale**: Execute save operation with proper error handling
- **Estimated Effort**: 30 minutes

```typescript
const handleSave = useCallback(async () => {
  if (!state.isDirty || state.isSubmitting) return;

  setState(prev => ({ ...prev, isSubmitting: true, error: null }));

  try {
    await onSave(state.fields);
    // Parent will close modal on success
  } catch (error) {
    setState(prev => ({
      ...prev,
      isSubmitting: false,
      error: error instanceof Error ? error.message : t('saveFailed'),
    }));
  }
}, [state.isDirty, state.isSubmitting, state.fields, onSave, t]);
```

Pattern reference: PropertyEditModal.tsx (lines 240-287)

### Step 9: Build Dialog Content Layout with Header, Body, and Footer
- **Description**: Construct full modal layout with all sections
- **Rationale**: Complete the UI structure with proper accessibility
- **Estimated Effort**: 90 minutes

**Header Section:**
```typescript
<div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
  <Dialog.Title className="text-xl font-semibold text-gray-900">
    {t('modalTitle', { language: languageName })}
  </Dialog.Title>
  <Dialog.Close asChild>
    <button
      type="button"
      onClick={handleClose}
      disabled={state.isSubmitting}
      className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      aria-label={t('closeModal')}
    >
      <X className="w-5 h-5" />
    </button>
  </Dialog.Close>
</div>
```

**Body Section (Scrollable):**
```typescript
<div className="flex-1 overflow-y-auto p-4 sm:p-6">
  {/* Error message */}
  {state.error && (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
      {state.error}
    </div>
  )}

  {/* Field pairs */}
  <div className="space-y-6">
    {state.fields.map((field, index) => {
      const originalField = sourceContent.find(f => f.fieldName === field.fieldName);
      return (
        <TranslationFieldPair
          key={field.fieldName}
          field={field}
          originalValue={originalField?.value || ''}
          translationValue={field.value}
          onChange={(value) => handleFieldChange(field.fieldName, value)}
          disabled={state.isSubmitting}
        />
      );
    })}
  </div>
</div>
```

**Footer Section:**
```typescript
<div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200">
  {/* Unsaved changes warning */}
  <div className="flex-1">
    {state.isDirty && (
      <p className="text-sm text-amber-600 flex items-center gap-1.5">
        <span>⚠</span>
        <span>{t('unsavedChangesMessage')}</span>
      </p>
    )}
  </div>

  {/* Action buttons */}
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={handleClose}
      disabled={state.isSubmitting}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      {t('cancel')}
    </button>

    <button
      type="button"
      onClick={handleSave}
      disabled={!state.isDirty || state.isSubmitting}
      className={cn(
        'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg',
        'hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center gap-2'
      )}
    >
      {state.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
      {t('saveChanges')}
    </button>
  </div>
</div>
```

Pattern reference: PropertyEditModal.tsx (lines 369-566) for complete layout structure.

### Step 10: Add Focus Management and Keyboard Support
- **Description**: Implement focus trap, initial focus, and keyboard shortcuts
- **Rationale**: Ensure accessibility and good keyboard UX
- **Estimated Effort**: 30 minutes

Focus management:
```typescript
// Focus first textarea when modal opens
useEffect(() => {
  if (isOpen) {
    // Delay to ensure DOM is ready
    setTimeout(() => {
      const firstTextarea = document.querySelector<HTMLTextAreaElement>(
        '#translation-title, [id^="translation-"]:first-of-type'
      );
      firstTextarea?.focus();
    }, 100);
  }
}, [isOpen]);

// Keyboard shortcuts
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd/Ctrl+S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      if (state.isDirty && !state.isSubmitting) {
        handleSave();
      }
    }

    // Escape to close (with unsaved check handled by Dialog)
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, state.isDirty, state.isSubmitting, handleSave]);
```

Radix Dialog automatically handles:
- Focus trap within modal
- Escape key to close
- Focus return to trigger element

### Step 11: Add i18n Translation Keys
- **Description**: Document required translation keys for component
- **Rationale**: Ensure all UI text is translatable
- **Estimated Effort**: 20 minutes

Required translation keys in `/messages/en.json` under `translationManagement.editor`:
```json
{
  "translationManagement": {
    "editor": {
      "modalTitle": "Edit Translation - {language}",
      "originalLabel": "Original",
      "translationLabel": "Translation",
      "noContent": "No content",
      "closeModal": "Close",
      "cancel": "Cancel",
      "saveChanges": "Save Changes",
      "unsavedChangesMessage": "You have unsaved changes",
      "unsavedChangesWarning": "You have unsaved changes. Are you sure you want to close without saving?",
      "saveFailed": "Failed to save translation. Please try again.",
      "characterCount": "{current}/{max}",
      "characterCountAria": "{current} of {max} characters"
    }
  }
}
```

Note: Add equivalent translations to all supported locales (fr, es, de, nl, it).

### Step 12: Create Barrel Export and Directory Index
- **Description**: Set up proper exports for clean imports
- **Rationale**: Enable clean import paths
- **Estimated Effort**: 10 minutes

Create `/src/components/TranslationManagement/TranslationEditor/index.ts`:
```typescript
export { TranslationEditor } from './TranslationEditor';
export type { TranslationEditorProps, TranslationFieldContent } from './TranslationEditor';
```

Update `/src/components/TranslationManagement/index.ts` (if exists):
```typescript
export { TranslationEditor } from './TranslationEditor';
// Future: export other components
```

### Step 13: Manual Testing Checklist
- **Description**: Test component with various scenarios
- **Rationale**: Ensure all functionality works correctly
- **Estimated Effort**: 60 minutes

Test scenarios:
- [ ] **Modal opens**: Modal displays when isOpen=true
- [ ] **Modal closes**: Close button and overlay click close modal
- [ ] **Title displays language**: Title shows "Edit Translation - Spanish" format
- [ ] **Original content displays**: Left side shows read-only source content
- [ ] **Translation content editable**: Right side textareas are editable
- [ ] **Auto-resize textareas**: Textareas grow/shrink with content
- [ ] **Character counters**: Display correct count for each field
- [ ] **Character warnings**: Colors change at 80%, 100%, and over limit
- [ ] **Dirty state detection**: isDirty=true when any field changes
- [ ] **Unsaved warning displays**: Footer shows warning when isDirty=true
- [ ] **Save button disabled**: Disabled when isDirty=false
- [ ] **Close confirmation**: Prompt shows when closing with unsaved changes
- [ ] **Save calls callback**: onSave called with correct TranslationFieldContent[]
- [ ] **Loading state**: Inputs disabled and button shows spinner during save
- [ ] **Error display**: Error message shows on save failure
- [ ] **Modal stays open**: Modal remains open after save error for retry
- [ ] **Focus management**: First textarea receives focus on open
- [ ] **Keyboard navigation**: Tab moves between textareas
- [ ] **Escape closes**: ESC key closes modal (with unsaved check)
- [ ] **Cmd+S saves**: Keyboard shortcut triggers save
- [ ] **Responsive layout**: Side-by-side on desktop, stacked on mobile
- [ ] **i18n labels**: All text uses translations
- [ ] **ARIA attributes**: role="dialog", aria-modal, aria-labelledby present

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create
| File | Target | Type |
|------|--------|------|
| `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` | — | Create |
| `/src/components/TranslationManagement/TranslationEditor/index.ts` | — | Create (barrel file) |

### New Directories to Create
| Directory | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationEditor/` | Directory for translation editor component |

### Existing Files to Reference (Read-Only)
| File | Purpose |
|------|------------|
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Pattern reference for Radix Dialog modal (lines 181-571) |
| `/src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Pattern reference for character counter (lines 146-195) |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | Pattern reference for dirty state tracking (lines 105-159) |
| `/src/lib/utils.ts` | Import `cn` utility |
| `/messages/en.json` | Add translation keys |

### Existing Files to Modify (Optional)
| File | Target | Type |
|------|--------|------|
| `/src/components/TranslationManagement/index.ts` | Export statement | Modify - add TranslationEditor export (if file exists) |

## Dependencies

### Depends On (Completed First)
- **REQ-E05-002**: Update Translation API Endpoint
  - Provides: PUT endpoint for updating translations
  - Reason: onSave callback will call this API endpoint
  - Status: According to overview, endpoint already exists from Epic 3
- **REQ-E05-006**: TranslationManagement Types File
  - Status: Pending (not yet created)
  - Note: Props interfaces will be initially defined in component file, then moved when REQ-E05-006 is implemented
  - Reason: Component can function without centralized types initially
- **Existing**: @radix-ui/react-dialog installed
- **Existing**: next-intl configured for i18n
- **Existing**: lucide-react for icons (X, Loader2)

### Blocks (Requires This First)
- **REQ-E05-007**: TranslationPreviewPanel Component - will open this editor when Edit action is clicked
- **REQ-E05-008**: TranslationStatusItem Component - provides Edit button that opens this editor
- **Future**: Any component that needs translation editing modal

### Parallel Safety
- **Files touched**:
  - `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx` (new file)
  - `/src/components/TranslationManagement/TranslationEditor/index.ts` (new file)
- **Conflicts with**: None - new component in new directory
- **Safe to parallelize with**:
  - REQ-E05-008 (TranslationStatusItem) - different directory
  - REQ-E05-009 (TranslationProgressBar) - different directory
  - All Epic 5 API endpoint tasks (different files entirely)
  - Epic 5 database/type tasks (different scope)

### External Dependencies
- React 18+ with hooks (useState, useEffect, useCallback, useMemo, useRef)
- Next.js 15.5.9 with App Router
- @radix-ui/react-dialog for modal component
- next-intl for i18n
- lucide-react for icons
- Tailwind CSS for styling
- TypeScript 5.x with strict mode

## Risks and Considerations

### Potential Side Effects
- **Radix Dialog version compatibility**: If Radix Dialog API changes, component may break
  - Mitigation: Lock @radix-ui/react-dialog version in package.json
  - Mitigation: Follow existing Dialog patterns in codebase (PropertyEditModal)

- **Auto-resize textarea performance**: Frequent recalculations on every keystroke could cause lag
  - Mitigation: Auto-resize logic is minimal (just height adjustment)
  - Mitigation: Consider debouncing if performance issues arise

- **Window.confirm for unsaved changes**: Non-customizable native browser prompt
  - Mitigation: Works for MVP, document as future enhancement to use custom Dialog
  - Mitigation: Consistent with existing pattern in InstructionEditor.tsx

- **Character limit enforcement**: maxLength attribute truncates input but doesn't warn before limit
  - Mitigation: Character counter provides visual feedback before hitting limit
  - Mitigation: Color-coded warnings at 80% threshold

- **i18n keys missing**: If translation keys not added to all locale files, component shows fallback text
  - Mitigation: Document all required keys in this overview
  - Mitigation: Add keys to all 6 supported locales (en, fr, es, de, nl, it)

### Testing Requirements
- **Unit tests**:
  - isDirty state detection when fields change
  - Character counter color logic (gray/amber/green/red)
  - Field change handlers update correct field
  - Save button disabled state based on isDirty
  - Unsaved changes prompt triggers correctly

- **Integration tests**:
  - Component renders within parent TranslationPreviewPanel
  - onSave callback called with correct data structure
  - Modal closes on successful save
  - Error message displays on save failure
  - Focus moves to first textarea on open
  - Keyboard shortcuts work (Escape, Cmd+S)

- **Visual regression tests**:
  - Side-by-side layout on desktop, stacked on mobile
  - Character counter colors display correctly
  - Unsaved changes warning appears in footer
  - Loading spinner shows on save button during submission
  - Error message styling

- **Accessibility tests**:
  - ARIA dialog role and attributes correct
  - Focus trap works within modal
  - Escape key closes modal
  - Screen reader announces modal title
  - Keyboard navigation works (Tab between textareas)
  - Disabled states prevent interaction
  - Color contrast meets WCAG AA standards

### Open Questions
- [ ] Should we show a diff/comparison view highlighting differences between original and translation?
  - Recommendation: Out of scope for MVP, add as future enhancement
- [ ] Should we implement scroll synchronization between original and translation panels?
  - Recommendation: Nice-to-have feature, add in future iteration if requested
- [ ] Should we replace window.confirm with custom confirmation Dialog?
  - Recommendation: Use window.confirm for MVP (matches existing pattern), upgrade later
- [ ] Should we add a "Revert" button to reset field to initial value?
  - Recommendation: Out of scope, user can manually type initial value or close/reopen
- [ ] Should we validate translation content (e.g., no empty translations)?
  - Recommendation: Parent component handles validation before calling onSave
- [ ] Should we support rich text formatting in textareas (bold, italic, etc.)?
  - Recommendation: Out of scope, plain text only for MVP
- [ ] Should we show translation status (pending/complete) in the editor?
  - Recommendation: Not needed in editor, status shown in parent preview panel

## Out of Scope

The following are explicitly **not** included in this task:
- API integration for saving translations (parent component responsibility)
- Translation status badge display within editor (shown in parent panel)
- Diff/comparison view highlighting changes between original and translation
- Scroll synchronization between original and translation panels
- Rich text editing (bold, italic, formatting buttons)
- Markdown editor for translation fields
- Translation validation logic (empty field checks, format validation)
- Translation history or version control UI
- Undo/redo functionality for edits
- Auto-save to draft state (only explicit save via button)
- Word count in addition to character count
- Translation quality scoring or suggestions
- Machine translation regenerate button within editor (handled by parent)
- Side-by-side comparison mode with color-coded diffs
- Expandable/collapsible field sections
- Drag-to-resize panels
- Print or export translation for review
- Comments or annotations on translations
- Real-time collaboration indicators
- Translation memory suggestions
- Glossary or terminology lookup
- Audio playback for text-to-speech preview
- Image or media attachments to translations
- Custom confirmation dialog (using window.confirm for MVP)
- Field-level revert to initial value button

## Special Notes

### Component Composition Strategy

This component is designed as a **controlled modal component** following React best practices:
- Parent controls open/close state via `isOpen` prop
- Parent provides source and initial translation data
- Parent handles save operation via `onSave` callback
- Parent manages loading state during API calls
- Component manages internal form state and dirty tracking
- Component calls `onClose` to signal close request (parent decides whether to close)

This separation enables:
- Parent controls data fetching and API integration
- Component focuses on editing UX and state management
- Clear responsibility boundaries
- Easy testing with mock props

### Side-by-Side Layout Responsiveness

The side-by-side layout adapts based on screen size:
- **Desktop (lg+)**: Original and translation shown side-by-side (grid-cols-2)
- **Mobile (< lg)**: Original and translation stacked vertically (grid-cols-1)

This ensures:
- Optimal use of screen space on all devices
- Original content always visible for reference
- No horizontal scrolling on mobile

### Textarea Auto-Resize Implementation

Auto-resizing textareas technique:
1. Set `rows={3}` for minimum height
2. Set `resize-none` to disable manual resize handle
3. Set `overflow-hidden` to hide scrollbar
4. On value change, use ref to:
   - Reset height to 'auto' to get accurate scrollHeight
   - Set height to `${textarea.scrollHeight}px`

This provides:
- Seamless growth as user types
- No scrollbars within textareas
- Consistent with text editor patterns in codebase

### Character Limit Behavior

Character limits are enforced via:
- `maxLength` attribute on textarea (hard limit, browser enforced)
- Character counter provides visual feedback
- Color-coded warnings help users stay within limits

Recommended field limits (to be specified by parent):
- **Title**: 100 characters (concise headline)
- **Description**: 500 characters (summary paragraph)
- **Instructions**: 500-1000 characters (detailed text)

These limits should match database column constraints.

### Dirty State Detection

Dirty state logic:
- Compare each current field value to corresponding initial field value
- If ANY field differs, `isDirty = true`
- Update isDirty whenever fields change (useEffect dependency)
- Save button enabled only when isDirty=true
- Unsaved changes warning shown when isDirty=true

This ensures:
- No accidental data loss
- Clear visual feedback when changes exist
- Save button provides clear affordance

### Error Handling Strategy

Error handling approach:
- Errors caught in try/catch of handleSave
- Error message displayed inline at top of modal body
- Modal stays open to allow retry
- Error clears when user starts editing again
- Parent-thrown errors displayed via state.error

This provides:
- Clear feedback on what went wrong
- Opportunity to retry without losing edits
- Non-blocking error display

### Accessibility Implementation

ARIA attributes applied:
- `role="dialog"` on Dialog.Content
- `aria-modal="true"` to indicate modal behavior
- `aria-labelledby` pointing to Dialog.Title id
- `aria-describedby` pointing to Dialog.Description (if needed)
- `aria-live="polite"` on error message for screen reader announcement
- Proper label associations for all form fields

Keyboard support:
- Tab: Navigate between textareas
- Escape: Close modal (with unsaved check)
- Cmd/Ctrl+S: Save changes
- Enter: Line break in textarea (not submit)
- Focus trap: Focus stays within modal (Radix handles this)

### Integration with TranslationPreviewPanel

This component will be consumed by TranslationPreviewPanel (REQ-E05-007) as:
```tsx
// Inside TranslationPreviewPanel.tsx
const [editorState, setEditorState] = useState({
  isOpen: false,
  entityId: '',
  language: 'en',
  sourceContent: [],
  initialTranslation: [],
});

const handleEdit = (language: SupportedLanguage) => {
  // Fetch translation data for this language
  const source = getSourceContent(entityId, entityType);
  const translation = getTranslationContent(entityId, entityType, language);

  setEditorState({
    isOpen: true,
    entityId,
    language,
    sourceContent: source,
    initialTranslation: translation,
  });
};

const handleSave = async (content: TranslationFieldContent[]) => {
  // Call API to update translation
  await updateTranslation(entityId, entityType, editorState.language, content);

  // Close editor on success
  setEditorState(prev => ({ ...prev, isOpen: false }));

  // Refresh translation status
  refetchTranslations();
};

// Render
<TranslationEditor
  isOpen={editorState.isOpen}
  onClose={() => setEditorState(prev => ({ ...prev, isOpen: false }))}
  entityId={editorState.entityId}
  entityType={entityType}
  language={editorState.language}
  sourceContent={editorState.sourceContent}
  initialTranslation={editorState.initialTranslation}
  onSave={handleSave}
/>
```

### Future Enhancement Opportunities

Potential improvements for future iterations:
1. **Custom confirmation dialog**: Replace window.confirm with styled Radix Dialog
2. **Diff view**: Show side-by-side comparison with highlighted changes
3. **Scroll sync**: Synchronize scroll position between original and translation panels
4. **Auto-save drafts**: Save translation to draft state every N seconds
5. **Undo/redo**: Add history stack for field changes
6. **Field-level revert**: Button to reset individual field to initial value
7. **Rich text editor**: Support for markdown or HTML formatting
8. **Translation memory**: Suggest previously translated phrases
9. **Character-level diff**: Highlight exact character changes in diff view
10. **Validation feedback**: Inline validation messages per field
11. **Progress indicator**: Show which fields have been edited
12. **Keyboard shortcuts guide**: Help modal showing available shortcuts

---
*Document generated: 2026-01-22 19:13*
