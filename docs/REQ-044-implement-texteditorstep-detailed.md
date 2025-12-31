# REQ-044: Implement TextEditorStep - Detailed Task Breakdown

**Generated:** 2025-12-31T15:35:00
**Last Modified:** 2025-12-31T15:35:00
**Overview Reference:** `/docs/REQ-044-implement-texteditorstep-overview.md`
**Request Reference:** REQ-044 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 3 - File Upload & Text
**Task ID:** 3.4

---

## Document Purpose

This document provides step-by-step implementation tasks for the `TextEditorStep` component. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific verification steps.

---

## Prerequisites

Before starting implementation, verify the following are complete:

| Prerequisite | Location | Status Check |
|--------------|----------|--------------|
| Phase 1 Complete | Tasks 1.1-1.5 | Directory structure exists |
| ItemCapture directory | `src/components/ItemCapture/` | Verify directory exists |
| steps directory | `src/components/ItemCapture/components/steps/` | Create if not exists |
| useItemCaptureState hook | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Verify hook exists with SET_INSTRUCTIONS action |
| ItemCapture.types.ts | `src/components/ItemCapture/ItemCapture.types.ts` | Verify type definitions exist |
| constants.ts | `src/components/ItemCapture/utils/constants.ts` | Verify file exists (will add new constants) |
| cn utility | `src/lib/utils.ts` | Verify cn() function exists |
| lucide-react | `package.json` | Verify lucide-react is installed |
| react-markdown | `package.json` | Verify react-markdown is installed (^9.1.0) |

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Main step component |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/utils/constants.ts` | Add `TEXT_EDITOR_CONSTRAINTS`, `MARKDOWN_FORMATS` | Constants for text limits and format definitions |
| `src/components/ItemCapture/index.ts` | Add `TextEditorStep` export | Public API |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Import and render TextEditorStep for 'write-text' step | Wizard integration |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | State dispatch pattern, SET_INSTRUCTIONS action |
| `src/components/ItemCapture/ItemCapture.types.ts` | Type definitions |
| `src/lib/utils.ts` | cn() utility function |
| `src/components/ItemForm.tsx` | Form patterns, error display, textarea patterns |
| `docs/REQ-042-implement-fileuploadstep-overview.md` | Sibling step pattern in Phase 3 |
| `node_modules/react-markdown` | react-markdown API reference |

---

## Implementation Tasks

### Task 3.4.1: Add Constants to constants.ts

**Objective:** Add text editor constraints and markdown format definitions to the constants file.

**Estimated Time:** 20 minutes

**Dependencies:** constants.ts must exist from Phase 1

**Implementation Steps:**

1. Open `src/components/ItemCapture/utils/constants.ts`

2. Add the text editor constraints object:
   ```typescript
   export const TEXT_EDITOR_CONSTRAINTS = {
     /** Maximum character count */
     maxLength: 5000,
     /** Character count at which to show warning (yellow) */
     warningThreshold: 4500,
     /** Debounce delay in milliseconds for auto-save */
     autoSaveDelay: 500,
     /** Minimum textarea height in pixels */
     minHeight: 200,
   } as const;
   ```

3. Add the markdown format definitions:
   ```typescript
   export const MARKDOWN_FORMATS = {
     bold: { prefix: '**', suffix: '**', label: 'Bold', shortcut: 'Ctrl+B' },
     italic: { prefix: '*', suffix: '*', label: 'Italic', shortcut: 'Ctrl+I' },
     heading1: { prefix: '# ', suffix: '', label: 'Heading 1', shortcut: '' },
     heading2: { prefix: '## ', suffix: '', label: 'Heading 2', shortcut: '' },
     heading3: { prefix: '### ', suffix: '', label: 'Heading 3', shortcut: '' },
     bulletList: { prefix: '- ', suffix: '', label: 'Bullet List', shortcut: '' },
     numberedList: { prefix: '1. ', suffix: '', label: 'Numbered List', shortcut: '' },
     link: { prefix: '[', suffix: '](url)', label: 'Link', shortcut: 'Ctrl+K' },
   } as const;
   ```

4. Export the type for MARKDOWN_FORMATS keys:
   ```typescript
   export type MarkdownFormatKey = keyof typeof MARKDOWN_FORMATS;
   ```

**Verification Steps:**

- [ ] Constants compile without TypeScript errors
- [ ] Both TEXT_EDITOR_CONSTRAINTS and MARKDOWN_FORMATS are exported
- [ ] MarkdownFormatKey type is available for import
- [ ] Run `npm run build` - no type errors

---

### Task 3.4.2: Create TextEditorStep Component File with Props Interface

**Objective:** Create the component file with proper TypeScript interface, imports, and basic structure.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.4.1 complete

**Implementation Steps:**

1. Create `src/components/ItemCapture/components/steps/TextEditorStep.tsx`

2. Add the 'use client' directive and required imports:
   ```typescript
   'use client';

   import { useState, useCallback, useEffect, useRef } from 'react';
   import ReactMarkdown from 'react-markdown';
   import {
     Bold,
     Italic,
     Heading1,
     Heading2,
     Heading3,
     List,
     ListOrdered,
     Link,
     Eye,
     Edit3
   } from 'lucide-react';
   import { cn } from '@/lib/utils';
   import { useItemCaptureContext } from '../../hooks/useItemCaptureState';
   import {
     TEXT_EDITOR_CONSTRAINTS,
     MARKDOWN_FORMATS,
     type MarkdownFormatKey
   } from '../../utils/constants';
   ```

3. Define the props interface:
   ```typescript
   interface TextEditorStepProps {
     /** Optional CSS class name for the root element */
     className?: string;
   }
   ```

4. Create component skeleton with basic state:
   ```typescript
   export function TextEditorStep({ className }: TextEditorStepProps) {
     const { state, dispatch } = useItemCaptureContext();
     const [localContent, setLocalContent] = useState(state.instructions || '');
     const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
     const textareaRef = useRef<HTMLTextAreaElement>(null);
     const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

     return (
       <div className={cn('flex flex-col h-full', className)}>
         {/* Component content will be added in subsequent tasks */}
         <div>TextEditorStep placeholder</div>
       </div>
     );
   }
   ```

5. Add default export and named export for flexibility

**Verification Steps:**

- [ ] File compiles without TypeScript errors
- [ ] Component can be imported in test file
- [ ] Props interface has JSDoc comments
- [ ] Run `npm run build` - no type errors

---

### Task 3.4.3: Implement MarkdownToolbar Subcomponent

**Objective:** Create the formatting toolbar with buttons for all supported markdown operations.

**Estimated Time:** 45 minutes

**Dependencies:** Task 3.4.2 complete

**Implementation Steps:**

1. Define the toolbar button interface and configuration array (inside TextEditorStep.tsx):
   ```typescript
   interface ToolbarButtonConfig {
     icon: React.ComponentType<{ className?: string }>;
     format: MarkdownFormatKey;
     ariaLabel: string;
   }

   const TOOLBAR_BUTTONS: ToolbarButtonConfig[] = [
     { icon: Bold, format: 'bold', ariaLabel: 'Bold (Ctrl+B)' },
     { icon: Italic, format: 'italic', ariaLabel: 'Italic (Ctrl+I)' },
     { icon: Heading1, format: 'heading1', ariaLabel: 'Heading 1' },
     { icon: Heading2, format: 'heading2', ariaLabel: 'Heading 2' },
     { icon: Heading3, format: 'heading3', ariaLabel: 'Heading 3' },
     { icon: List, format: 'bulletList', ariaLabel: 'Bullet List' },
     { icon: ListOrdered, format: 'numberedList', ariaLabel: 'Numbered List' },
     { icon: Link, format: 'link', ariaLabel: 'Insert Link (Ctrl+K)' },
   ];
   ```

2. Create the MarkdownToolbar component:
   ```typescript
   interface MarkdownToolbarProps {
     onFormat: (format: MarkdownFormatKey) => void;
     disabled?: boolean;
   }

   function MarkdownToolbar({ onFormat, disabled }: MarkdownToolbarProps) {
     return (
       <div
         className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-wrap"
         role="toolbar"
         aria-label="Text formatting"
       >
         {TOOLBAR_BUTTONS.map(({ icon: Icon, format, ariaLabel }) => (
           <button
             key={format}
             type="button"
             onClick={() => onFormat(format)}
             disabled={disabled}
             className={cn(
               'p-2 rounded hover:bg-gray-200 transition-colors',
               'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
               'disabled:opacity-50 disabled:cursor-not-allowed'
             )}
             aria-label={ariaLabel}
             title={ariaLabel}
           >
             <Icon className="w-4 h-4 text-gray-700" />
           </button>
         ))}
       </div>
     );
   }
   ```

3. Add the toolbar to the main component structure (within the editor pane section, to be completed in later tasks)

**Verification Steps:**

- [ ] MarkdownToolbar renders with all 8 buttons
- [ ] Each button has correct icon
- [ ] Each button has aria-label for accessibility
- [ ] Buttons show hover state on mouse over
- [ ] Buttons have visible focus ring
- [ ] Disabled state dims buttons and prevents clicks
- [ ] Toolbar has role="toolbar" attribute

---

### Task 3.4.4: Implement Text Format Application Logic

**Objective:** Create the function that applies markdown formatting to selected text or at cursor position.

**Estimated Time:** 45 minutes

**Dependencies:** Tasks 3.4.2, 3.4.3 complete

**Implementation Steps:**

1. Add the applyFormat callback to TextEditorStep:
   ```typescript
   const applyFormat = useCallback((format: MarkdownFormatKey) => {
     const textarea = textareaRef.current;
     if (!textarea) return;

     const { prefix, suffix } = MARKDOWN_FORMATS[format];
     const start = textarea.selectionStart;
     const end = textarea.selectionEnd;
     const selectedText = localContent.substring(start, end);

     let newText: string;
     let newCursorPos: number;

     if (selectedText) {
       // Wrap selected text with format
       newText =
         localContent.substring(0, start) +
         prefix +
         selectedText +
         suffix +
         localContent.substring(end);
       newCursorPos = start + prefix.length + selectedText.length + suffix.length;
     } else {
       // Insert format at cursor
       newText =
         localContent.substring(0, start) +
         prefix +
         suffix +
         localContent.substring(end);
       // Position cursor between prefix and suffix
       newCursorPos = start + prefix.length;
     }

     setLocalContent(newText);

     // Restore focus and cursor position
     requestAnimationFrame(() => {
       textarea.focus();
       textarea.setSelectionRange(newCursorPos, newCursorPos);
     });
   }, [localContent]);
   ```

2. Update toolbar to use applyFormat:
   ```typescript
   <MarkdownToolbar onFormat={applyFormat} disabled={isOverLimit} />
   ```

3. Add helper variable for limit check:
   ```typescript
   const characterCount = localContent.length;
   const isOverLimit = characterCount > TEXT_EDITOR_CONSTRAINTS.maxLength;
   ```

**Verification Steps:**

- [ ] Selecting text and clicking Bold wraps text with **
- [ ] Selecting text and clicking Italic wraps text with *
- [ ] Selecting text and clicking Heading1 prepends #
- [ ] Clicking format with no selection inserts format syntax at cursor
- [ ] Cursor is repositioned correctly after format application
- [ ] Textarea maintains focus after format application
- [ ] Format disabled when over character limit

---

### Task 3.4.5: Implement Keyboard Shortcuts

**Objective:** Add keyboard shortcuts for common formatting operations (Ctrl+B, Ctrl+I, Ctrl+K).

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.4.4 complete

**Implementation Steps:**

1. Create the keyboard handler function:
   ```typescript
   const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
     // Detect Mac vs Windows/Linux for modifier key
     const isMac = typeof navigator !== 'undefined' &&
                   navigator.platform.toUpperCase().indexOf('MAC') >= 0;
     const modifier = isMac ? e.metaKey : e.ctrlKey;

     if (!modifier) return;

     switch (e.key.toLowerCase()) {
       case 'b':
         e.preventDefault();
         applyFormat('bold');
         break;
       case 'i':
         e.preventDefault();
         applyFormat('italic');
         break;
       case 'k':
         e.preventDefault();
         applyFormat('link');
         break;
     }
   }, [applyFormat]);
   ```

2. Attach the handler to the textarea:
   ```typescript
   <textarea
     ref={textareaRef}
     onKeyDown={handleKeyDown}
     // ... other props
   />
   ```

**Verification Steps:**

- [ ] Ctrl+B (or Cmd+B on Mac) applies bold format
- [ ] Ctrl+I (or Cmd+I on Mac) applies italic format
- [ ] Ctrl+K (or Cmd+K on Mac) inserts link format
- [ ] Default browser behavior is prevented for these shortcuts
- [ ] Shortcuts work with and without text selection
- [ ] Non-shortcut key presses work normally

---

### Task 3.4.6: Implement CharacterCounter Subcomponent

**Objective:** Create the character counter with progress bar and visual feedback for limit proximity.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.4.2 complete

**Implementation Steps:**

1. Create the CharacterCounter component:
   ```typescript
   interface CharacterCounterProps {
     current: number;
     max: number;
     warning: number;
   }

   function CharacterCounter({ current, max, warning }: CharacterCounterProps) {
     const percentage = (current / max) * 100;
     const isWarning = current >= warning;
     const isError = current > max;

     return (
       <div className="flex items-center justify-between text-sm">
         <span
           className={cn(
             'tabular-nums',
             isError && 'text-red-600 font-medium',
             isWarning && !isError && 'text-yellow-600',
             !isWarning && 'text-gray-500'
           )}
           aria-live="polite"
           aria-atomic="true"
         >
           {current.toLocaleString()} / {max.toLocaleString()} characters
         </span>

         {/* Progress bar */}
         <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden ml-3">
           <div
             className={cn(
               'h-full rounded-full transition-all duration-300',
               isError && 'bg-red-500',
               isWarning && !isError && 'bg-yellow-500',
               !isWarning && 'bg-blue-500'
             )}
             style={{ width: `${Math.min(percentage, 100)}%` }}
             role="progressbar"
             aria-valuenow={current}
             aria-valuemin={0}
             aria-valuemax={max}
             aria-label="Character count progress"
           />
         </div>
       </div>
     );
   }
   ```

2. Integrate into main component:
   ```typescript
   <CharacterCounter
     current={characterCount}
     max={TEXT_EDITOR_CONSTRAINTS.maxLength}
     warning={TEXT_EDITOR_CONSTRAINTS.warningThreshold}
   />
   ```

**Verification Steps:**

- [ ] Counter displays current character count
- [ ] Counter displays max character limit
- [ ] Counter text is gray when under warning threshold
- [ ] Counter text turns yellow when approaching limit (>= warningThreshold)
- [ ] Counter text turns red when over limit
- [ ] Progress bar width matches percentage
- [ ] Progress bar color changes appropriately
- [ ] Counter has aria-live="polite" for screen readers
- [ ] Progress bar has proper ARIA progressbar attributes

---

### Task 3.4.7: Implement Mobile TabSwitcher Subcomponent

**Objective:** Create the tab navigation component for switching between editor and preview on mobile devices.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.4.2 complete

**Implementation Steps:**

1. Create the TabSwitcher component:
   ```typescript
   interface TabSwitcherProps {
     activeTab: 'editor' | 'preview';
     onTabChange: (tab: 'editor' | 'preview') => void;
   }

   function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
     return (
       <div className="flex border-b border-gray-200 md:hidden" role="tablist">
         <button
           role="tab"
           id="editor-tab"
           aria-selected={activeTab === 'editor'}
           aria-controls="editor-panel"
           onClick={() => onTabChange('editor')}
           className={cn(
             'flex-1 py-3 px-4 text-sm font-medium transition-colors',
             'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
             activeTab === 'editor'
               ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
               : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
           )}
         >
           <Edit3 className="w-4 h-4 inline-block mr-2" aria-hidden="true" />
           Editor
         </button>
         <button
           role="tab"
           id="preview-tab"
           aria-selected={activeTab === 'preview'}
           aria-controls="preview-panel"
           onClick={() => onTabChange('preview')}
           className={cn(
             'flex-1 py-3 px-4 text-sm font-medium transition-colors',
             'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
             activeTab === 'preview'
               ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
               : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
           )}
         >
           <Eye className="w-4 h-4 inline-block mr-2" aria-hidden="true" />
           Preview
         </button>
       </div>
     );
   }
   ```

2. Integrate into main component:
   ```typescript
   <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
   ```

**Verification Steps:**

- [ ] TabSwitcher only visible on screens < 768px (md breakpoint)
- [ ] Tab switcher hidden on desktop (md:hidden)
- [ ] Active tab has blue styling and border
- [ ] Inactive tab has gray styling
- [ ] Clicking tab changes activeTab state
- [ ] Each tab has proper ARIA tab attributes
- [ ] Tab buttons have visible focus ring

---

### Task 3.4.8: Implement Debounced Auto-Save to State

**Objective:** Add automatic saving of content to the state machine with debouncing to prevent excessive dispatches.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.4.2 complete

**Implementation Steps:**

1. Add the auto-save effect with debouncing:
   ```typescript
   // Auto-save effect with debouncing
   useEffect(() => {
     // Clear existing timeout
     if (saveTimeoutRef.current) {
       clearTimeout(saveTimeoutRef.current);
     }

     // Set new timeout for auto-save
     saveTimeoutRef.current = setTimeout(() => {
       if (localContent !== state.instructions) {
         dispatch({ type: 'SET_INSTRUCTIONS', payload: localContent });
       }
     }, TEXT_EDITOR_CONSTRAINTS.autoSaveDelay);

     // Cleanup on unmount or when localContent changes
     return () => {
       if (saveTimeoutRef.current) {
         clearTimeout(saveTimeoutRef.current);
       }
     };
   }, [localContent, state.instructions, dispatch]);
   ```

2. Add immediate save on component unmount:
   ```typescript
   // Immediate save on unmount
   useEffect(() => {
     const currentContent = localContent;
     const currentStateInstructions = state.instructions;

     return () => {
       // Only save if different (closure captures current values)
       if (currentContent !== currentStateInstructions) {
         dispatch({ type: 'SET_INSTRUCTIONS', payload: currentContent });
       }
     };
   }, []); // Empty deps intentionally - runs on unmount only
   ```

3. Add save status indicator (optional visual feedback):
   ```typescript
   const isSaving = localContent !== state.instructions;
   ```

**Verification Steps:**

- [ ] Content dispatches to state after 500ms of no typing
- [ ] Rapid typing does not cause multiple dispatches
- [ ] Content saves immediately when component unmounts
- [ ] Content saves immediately when navigating to different step
- [ ] isSaving flag correctly reflects pending save state
- [ ] No memory leaks from uncleaned timeouts

---

### Task 3.4.9: Implement Editor Pane with Textarea

**Objective:** Create the editor pane with toolbar and textarea for markdown input.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.4.3, 3.4.4, 3.4.5, 3.4.6 complete

**Implementation Steps:**

1. Add the content change handler:
   ```typescript
   const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
     setLocalContent(e.target.value);

     // Clear error if content is now valid
     if (state.errors?.instructions &&
         e.target.value.length <= TEXT_EDITOR_CONSTRAINTS.maxLength) {
       dispatch({ type: 'CLEAR_ERRORS' });
     }
   };
   ```

2. Create the editor pane structure:
   ```typescript
   {/* Editor Pane */}
   <div
     id="editor-panel"
     role="tabpanel"
     aria-labelledby="editor-tab"
     className={cn(
       'flex-1 flex flex-col min-w-0',
       activeTab !== 'editor' && 'hidden md:flex'
     )}
   >
     {/* Toolbar */}
     <MarkdownToolbar onFormat={applyFormat} disabled={isOverLimit} />

     {/* Textarea */}
     <textarea
       ref={textareaRef}
       value={localContent}
       onChange={handleContentChange}
       onKeyDown={handleKeyDown}
       placeholder="Write your item instructions here using markdown formatting..."
       className={cn(
         'flex-1 w-full p-4 resize-none',
         'border border-t-0 border-gray-200 rounded-b-lg',
         'font-mono text-sm leading-relaxed',
         'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
         'placeholder:text-gray-400',
         isOverLimit && 'border-red-300 focus:ring-red-500'
       )}
       style={{ minHeight: TEXT_EDITOR_CONSTRAINTS.minHeight }}
       aria-label="Markdown content editor"
       aria-describedby="char-count"
       aria-invalid={isOverLimit}
     />

     {/* Character Counter */}
     <div id="char-count" className="mt-2">
       <CharacterCounter
         current={characterCount}
         max={TEXT_EDITOR_CONSTRAINTS.maxLength}
         warning={TEXT_EDITOR_CONSTRAINTS.warningThreshold}
       />
     </div>

     {/* Error Message */}
     {isOverLimit && (
       <p className="text-red-600 text-sm mt-2" role="alert">
         Content exceeds the maximum character limit. Please shorten your text.
       </p>
     )}
   </div>
   ```

**Verification Steps:**

- [ ] Textarea renders with placeholder text
- [ ] Typing updates localContent state
- [ ] Textarea has monospace font
- [ ] Textarea has minimum height constraint
- [ ] Textarea border turns red when over limit
- [ ] Focus ring changes to red when over limit
- [ ] Error message appears when over limit
- [ ] aria-invalid reflects limit state
- [ ] Textarea hidden on mobile when preview tab active
- [ ] Textarea always visible on desktop

---

### Task 3.4.10: Implement Preview Pane with react-markdown

**Objective:** Create the preview pane that renders markdown content using react-markdown.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.4.2 complete

**Implementation Steps:**

1. Create the preview pane structure:
   ```typescript
   {/* Preview Pane */}
   <div
     id="preview-panel"
     role="tabpanel"
     aria-labelledby="preview-tab"
     className={cn(
       'flex-1 flex flex-col min-w-0',
       activeTab !== 'preview' && 'hidden md:flex',
       'md:border-l md:border-gray-200 md:pl-4'
     )}
   >
     {/* Preview Header (desktop only) */}
     <div className="hidden md:flex items-center gap-2 mb-2 text-sm text-gray-500">
       <Eye className="w-4 h-4" aria-hidden="true" />
       <span>Preview</span>
     </div>

     {/* Markdown Preview */}
     <div
       className={cn(
         'flex-1 p-4 bg-gray-50 rounded-lg overflow-auto',
         'prose prose-sm max-w-none',
         'prose-headings:text-gray-800',
         'prose-p:text-gray-600',
         'prose-a:text-blue-600',
         'prose-strong:text-gray-800',
         'prose-ul:text-gray-600',
         'prose-ol:text-gray-600'
       )}
       style={{ minHeight: TEXT_EDITOR_CONSTRAINTS.minHeight }}
     >
       {localContent ? (
         <ReactMarkdown>{localContent}</ReactMarkdown>
       ) : (
         <p className="text-gray-400 italic">
           Start typing to see a preview of your formatted content...
         </p>
       )}
     </div>
   </div>
   ```

2. Ensure prose styles render markdown correctly:
   - Headings: h1-h6 with proper sizing
   - Bold/Italic: proper emphasis styling
   - Lists: bullet and numbered with proper indentation
   - Links: blue color, underline on hover

**Verification Steps:**

- [ ] Preview pane renders markdown as formatted HTML
- [ ] **bold** renders as bold text
- [ ] *italic* renders as italic text
- [ ] # Heading renders as h1
- [ ] - item renders as bullet list
- [ ] 1. item renders as numbered list
- [ ] [text](url) renders as clickable link
- [ ] Preview updates in real-time as user types
- [ ] Empty state shows placeholder message
- [ ] Preview hidden on mobile when editor tab active
- [ ] Preview always visible on desktop

---

### Task 3.4.11: Implement Responsive Split Layout

**Objective:** Create the responsive layout that shows side-by-side on desktop and tabbed on mobile.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.4.7, 3.4.9, 3.4.10 complete

**Implementation Steps:**

1. Assemble the complete component layout:
   ```typescript
   export function TextEditorStep({ className }: TextEditorStepProps) {
     // ... all hooks and handlers from previous tasks

     return (
       <div className={cn('flex flex-col h-full', className)}>
         {/* Mobile Tab Switcher */}
         <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 min-h-0">
           {/* Editor Pane - from Task 3.4.9 */}

           {/* Preview Pane - from Task 3.4.10 */}
         </div>

         {/* Auto-save indicator */}
         {localContent !== state.instructions && (
           <div className="px-4 pb-2 text-xs text-gray-400 flex items-center gap-1">
             <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" aria-hidden="true" />
             <span>Saving...</span>
           </div>
         )}
       </div>
     );
   }
   ```

2. Verify responsive breakpoints work correctly:
   - Mobile (< 768px): Single pane with tabs, full width
   - Tablet/Desktop (>= 768px): Side-by-side, 50/50 split

3. Ensure both panes flex equally on desktop:
   ```typescript
   // Both editor and preview panes have flex-1 for equal width
   className="flex-1 flex flex-col min-w-0"
   ```

**Verification Steps:**

- [ ] On mobile, tabs control which pane is visible
- [ ] On mobile, only one pane visible at a time
- [ ] On desktop, both panes visible side-by-side
- [ ] On desktop, tab switcher is hidden
- [ ] Both panes have equal width on desktop
- [ ] Layout doesn't break at breakpoint transitions
- [ ] Saving indicator appears during pending save

---

### Task 3.4.12: Add Accessibility Features

**Objective:** Ensure the component meets accessibility requirements with proper ARIA attributes and keyboard navigation.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.4.3-3.4.11 complete

**Implementation Steps:**

1. Verify all ARIA attributes are in place:

   **Toolbar:**
   - [ ] `role="toolbar"`
   - [ ] `aria-label="Text formatting"`

   **Toolbar Buttons:**
   - [ ] `aria-label` with format name and shortcut
   - [ ] `title` attribute matching aria-label

   **Tab Buttons:**
   - [ ] `role="tab"`
   - [ ] `aria-selected` reflecting active state
   - [ ] `aria-controls` pointing to panel ID
   - [ ] Unique `id` attributes

   **Tab Panels:**
   - [ ] `role="tabpanel"`
   - [ ] `aria-labelledby` pointing to tab ID
   - [ ] Unique `id` attributes

   **Textarea:**
   - [ ] `aria-label="Markdown content editor"`
   - [ ] `aria-describedby="char-count"`
   - [ ] `aria-invalid` when over limit

   **Character Counter:**
   - [ ] `aria-live="polite"`
   - [ ] `aria-atomic="true"`

   **Progress Bar:**
   - [ ] `role="progressbar"`
   - [ ] `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
   - [ ] `aria-label`

   **Error Message:**
   - [ ] `role="alert"`

2. Verify keyboard navigation works:
   - Tab key moves focus through: tabs → toolbar → textarea → preview
   - Enter/Space on toolbar button applies format
   - Arrow keys work within tablist (optional enhancement)

3. Add skip link or landmark if needed for complex layout

**Verification Steps:**

- [ ] Screen reader announces all controls correctly
- [ ] Keyboard-only navigation works completely
- [ ] Focus indicators visible on all interactive elements
- [ ] Character count changes announced by screen reader
- [ ] Error message announced when it appears
- [ ] Tab/panel relationship correctly communicated

---

### Task 3.4.13: Integrate with CaptureWizard

**Objective:** Connect TextEditorStep to the wizard navigation so it renders for the 'write-text' step.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.4.1-3.4.12 complete

**Implementation Steps:**

1. Open `src/components/ItemCapture/components/CaptureWizard.tsx`

2. Add import for TextEditorStep:
   ```typescript
   import { TextEditorStep } from './steps/TextEditorStep';
   ```

3. Find the step rendering logic and add the 'write-text' case:
   ```typescript
   // Assuming switch/case or conditional rendering pattern
   case 'write-text':
     return <TextEditorStep />;

   // Or if using object mapping:
   const stepComponents: Record<WizardStep, React.ComponentType> = {
     // ... other steps
     'write-text': TextEditorStep,
     // ... other steps
   };
   ```

4. Verify step transitions work correctly:
   - Coming from ContentTypeStep (when user selects text option)
   - Going to next step (review or add-more)

5. Handle any step-specific navigation requirements

**Verification Steps:**

- [ ] TextEditorStep renders when wizard step is 'write-text'
- [ ] Can navigate to TextEditorStep from content type selection
- [ ] Can navigate away from TextEditorStep using wizard navigation
- [ ] Content persists in state when navigating back
- [ ] No errors in console during step transitions

---

### Task 3.4.14: Export TextEditorStep from Index

**Objective:** Add TextEditorStep to the public exports of the ItemCapture component.

**Estimated Time:** 15 minutes

**Dependencies:** Task 3.4.13 complete

**Implementation Steps:**

1. Open `src/components/ItemCapture/index.ts`

2. Add the TextEditorStep export:
   ```typescript
   // Components - Steps
   export { TextEditorStep } from './components/steps/TextEditorStep';
   ```

3. Verify the export works correctly

**Verification Steps:**

- [ ] Can import `TextEditorStep` from `@/components/ItemCapture`
- [ ] No circular dependency warnings
- [ ] TypeScript autocomplete works for the import
- [ ] `npm run build` passes

---

### Task 3.4.15: Manual Testing - Basic Editor Flow

**Objective:** Verify the basic text editing flow works correctly.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.4.1-3.4.14 complete

**Test Cases:**

1. **Basic Typing:**
   - [ ] Textarea accepts input
   - [ ] Character count updates in real-time
   - [ ] Content appears in preview pane

2. **Toolbar Formatting:**
   - [ ] Bold button wraps selected text with **
   - [ ] Italic button wraps selected text with *
   - [ ] Heading buttons prepend #, ##, ###
   - [ ] List buttons prepend - or 1.
   - [ ] Link button inserts [](url) syntax

3. **Keyboard Shortcuts:**
   - [ ] Ctrl+B (Cmd+B on Mac) applies bold
   - [ ] Ctrl+I (Cmd+I on Mac) applies italic
   - [ ] Ctrl+K (Cmd+K on Mac) inserts link

4. **Character Limit:**
   - [ ] Counter shows warning color at 4500+ characters
   - [ ] Counter shows error color at 5000+ characters
   - [ ] Progress bar reflects current usage
   - [ ] Error message appears when over limit

5. **Auto-Save:**
   - [ ] Content saves after 500ms of no typing
   - [ ] "Saving..." indicator appears during save
   - [ ] Content persists after navigating away and back

**Verification Steps:**

- [ ] All test cases pass
- [ ] Document any issues found

---

### Task 3.4.16: Manual Testing - Preview and Responsive Layout

**Objective:** Verify the preview pane and responsive layout work correctly.

**Estimated Time:** 30 minutes

**Dependencies:** Tasks 3.4.1-3.4.14 complete

**Test Cases:**

1. **Preview Rendering:**
   - [ ] **bold** renders as bold text
   - [ ] *italic* renders as italic text
   - [ ] # Heading renders correctly sized
   - [ ] - items render as bullet list
   - [ ] 1. items render as numbered list
   - [ ] [link](url) renders as clickable link
   - [ ] Preview updates as user types

2. **Mobile Layout (< 768px):**
   - [ ] Tab switcher is visible
   - [ ] Default shows Editor tab active
   - [ ] Clicking Preview tab shows preview
   - [ ] Only one pane visible at a time
   - [ ] Tabs have touch-friendly size (48px)

3. **Desktop Layout (>= 768px):**
   - [ ] Tab switcher is hidden
   - [ ] Both editor and preview visible side-by-side
   - [ ] Panes have equal width
   - [ ] Preview has left border separator

4. **Breakpoint Transitions:**
   - [ ] Resize window - layout adjusts smoothly
   - [ ] Content preserved during resize
   - [ ] No layout jumps or flickering

**Verification Steps:**

- [ ] All test cases pass on target screen sizes
- [ ] Document any issues found

---

### Task 3.4.17: Manual Testing - Cross-Browser and Accessibility

**Objective:** Verify cross-browser compatibility and accessibility compliance.

**Estimated Time:** 45 minutes

**Dependencies:** Tasks 3.4.1-3.4.14 complete

**Test Cases:**

1. **Browser Compatibility:**
   - [ ] Chrome (desktop): All features work
   - [ ] Firefox (desktop): All features work
   - [ ] Safari (desktop): All features work
   - [ ] Edge (desktop): All features work
   - [ ] Chrome (Android): Touch and formatting work
   - [ ] Safari (iOS): Touch and formatting work

2. **Keyboard Navigation:**
   - [ ] Tab key navigates through all controls
   - [ ] Shift+Tab navigates backwards
   - [ ] Enter/Space activates buttons
   - [ ] Focus visible on all interactive elements

3. **Screen Reader Testing:**
   - [ ] Toolbar announced as "Text formatting, toolbar"
   - [ ] Each button announces format and shortcut
   - [ ] Tab panels correctly associated with tabs
   - [ ] Character count announced (aria-live)
   - [ ] Error announced when over limit (role="alert")

4. **Visual Accessibility:**
   - [ ] Color contrast meets WCAG AA
   - [ ] Focus rings visible on all colors
   - [ ] Text readable at all sizes
   - [ ] Icons have sufficient contrast

**Verification Steps:**

- [ ] All browsers work without JavaScript errors
- [ ] Keyboard-only navigation is complete
- [ ] Screen reader (VoiceOver/NVDA) works correctly
- [ ] Document any accessibility issues found

---

## Task Summary

| Task | Description | Est. Time | Status |
|------|-------------|-----------|--------|
| 3.4.1 | Add constants to constants.ts | 20 min | Pending |
| 3.4.2 | Create component file with props interface | 30 min | Pending |
| 3.4.3 | Implement MarkdownToolbar subcomponent | 45 min | Pending |
| 3.4.4 | Implement text format application logic | 45 min | Pending |
| 3.4.5 | Implement keyboard shortcuts | 30 min | Pending |
| 3.4.6 | Implement CharacterCounter subcomponent | 30 min | Pending |
| 3.4.7 | Implement TabSwitcher subcomponent | 30 min | Pending |
| 3.4.8 | Implement debounced auto-save | 30 min | Pending |
| 3.4.9 | Implement editor pane with textarea | 30 min | Pending |
| 3.4.10 | Implement preview pane with react-markdown | 30 min | Pending |
| 3.4.11 | Implement responsive split layout | 30 min | Pending |
| 3.4.12 | Add accessibility features | 30 min | Pending |
| 3.4.13 | Integrate with CaptureWizard | 30 min | Pending |
| 3.4.14 | Export from index | 15 min | Pending |
| 3.4.15 | Manual testing - basic editor flow | 30 min | Pending |
| 3.4.16 | Manual testing - preview and responsive | 30 min | Pending |
| 3.4.17 | Manual testing - cross-browser and accessibility | 45 min | Pending |

**Total Estimated Time:** ~8.5 hours

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementing Task(s) |
|--------------------|----------------------|
| Toolbar provides buttons for bold, italic, headings, lists, links | 3.4.3 |
| Clicking toolbar button applies markdown syntax | 3.4.4 |
| Preview pane displays formatted markdown in real-time | 3.4.10 |
| Desktop shows editor and preview side-by-side | 3.4.11 |
| Mobile provides tab navigation for editor/preview | 3.4.7, 3.4.11 |
| Character counter displays and updates per keystroke | 3.4.6 |
| Visual indicator for approaching/exceeding limit | 3.4.6 |
| Content auto-saves after typing stops | 3.4.8 |
| Content persists when navigating away and back | 3.4.8, 3.4.13 |
| Markdown syntax matches conventions (**bold**, *italic*) | 3.4.1, 3.4.4 |

---

## Definition of Done

- [ ] All 17 tasks completed and verified
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] Component can be imported from `@/components/ItemCapture`
- [ ] All acceptance criteria met
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on iOS Safari and Android Chrome
- [ ] Keyboard navigation works for all actions
- [ ] Screen reader compatibility verified
- [ ] Touch targets meet 48px minimum on mobile
- [ ] Responsive design works on mobile and desktop
- [ ] Integration with state machine complete (SET_INSTRUCTIONS dispatch)
- [ ] Integration with CaptureWizard complete
- [ ] Auto-save debouncing works correctly
- [ ] Preview renders all supported markdown formats

---

## Integration Notes

This component integrates with:

- **State Machine:** Dispatches SET_INSTRUCTIONS action
- **CaptureWizard:** Renders as the 'write-text' step
- **react-markdown:** For preview rendering

The component follows the same patterns established in:
- FileUploadStep (Task 3.2) - sibling step in Phase 3
- PhotoCaptureStep (Task 2.4) - established step patterns

This task enables:
- **Task 3.5 - MarkdownEditor:** Can extract toolbar as reusable component

---

## References

- [Overview Document](/docs/REQ-044-implement-texteditorstep-overview.md)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [FileUploadStep Detailed](/docs/REQ-042-implement-fileuploadstep-detailed.md) - Sibling step pattern
- [react-markdown Documentation](https://github.com/remarkjs/react-markdown)
- [Lucide Icons](https://lucide.dev/icons/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ARIA Authoring Practices - Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [ARIA Authoring Practices - Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)
