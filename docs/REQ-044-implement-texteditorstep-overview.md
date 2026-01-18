# REQ-044: Implement TextEditorStep - Technical Implementation Overview

**Generated:** 2025-12-31T14:45:00
**Last Modified:** 2025-12-31T14:45:00
**Request Reference:** REQ-044 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 3 - File Upload & Text
**Task ID:** 3.4

---

## Executive Summary

This document provides a technical implementation breakdown for `TextEditorStep`, a wizard step component that enables users to compose and format markdown-based item descriptions with a toolbar, live preview, character counting, and auto-save functionality.

TextEditorStep is part of Phase 3 (File Upload & Text), Track B, and represents a core content creation feature that operates independently from the file upload track (Track A). The component directly enables Task 3.5 (MarkdownEditor component) by establishing the step container and integration patterns.

---

## Scope

### In Scope

- Markdown editor textarea with syntax support
- Formatting toolbar with buttons for bold, italic, headings, lists, and links
- Live preview pane rendering formatted markdown
- Split view layout on desktop (side-by-side editor and preview)
- Tab-based navigation between editor and preview on mobile
- Real-time character counter with limit indicator
- Visual feedback when approaching or exceeding character limit
- Debounced auto-save to application state
- State persistence when navigating between wizard steps
- Keyboard shortcuts for common formatting operations
- Responsive design for mobile and desktop
- Accessibility (ARIA labels, keyboard navigation, screen reader support)

### Out of Scope

- Rich text editing (WYSIWYG) - using markdown syntax instead
- Image embedding in markdown (handled by separate media items)
- File attachment within text editor
- Collaborative editing or real-time sync
- Markdown export/import from external files
- Spell checking (rely on browser native)
- Grammar suggestions
- Custom markdown extensions beyond CommonMark

---

## Dependencies

### Hard Dependencies (Must Complete First)

| Dependency | Status | Location |
|------------|--------|----------|
| Phase 1 Complete | Required | Tasks 1.1-1.5 |
| ItemCapture.types.ts | Required | `src/components/ItemCapture/ItemCapture.types.ts` |
| useItemCaptureState hook | Required | Task 1.2 - for state dispatch with SET_INSTRUCTIONS action |
| constants.ts | Required | `src/components/ItemCapture/utils/constants.ts` |

### Soft Dependencies (Can Develop in Parallel)

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 3.5 - MarkdownEditor | Sequential | Enhanced editor after step container established |
| Task 3.1-3.3 - File Upload Track | Independent | Track A runs in parallel |
| ValidationMessage component | Optional | May already exist from Phase 1 |

### External Dependencies

| Dependency | Version | Notes |
|------------|---------|-------|
| react-markdown | ^9.1.0 | Already installed - for preview rendering |
| lucide-react | ^0.525.0 | Already installed - toolbar icons |
| Tailwind CSS | 4.x | Already configured - styling |
| cn() utility | - | `src/lib/utils.ts` - class merging |

---

## Technical Approach

### Architecture Decision: Integrated Step with Embedded Editor

**Decision:** TextEditorStep is a self-contained step component that includes the editor, toolbar, preview, and character counting inline, rather than delegating to a separate hook.

**Rationale:**
- Text editing state is simpler than media capture (no streams, no permissions)
- useState with debounced dispatch provides sufficient state management
- Matches the "thin component" philosophy from other steps while avoiding unnecessary abstraction
- Task 3.5 (MarkdownEditor) will extract reusable toolbar logic for future use

### Component Structure

```
TextEditorStep/
├── Core Layout
│   ├── Header - Step title and tab controls (mobile)
│   ├── EditorPane - Textarea with toolbar
│   ├── PreviewPane - Rendered markdown output
│   └── Footer - Character count and status
├── Sub-components
│   ├── MarkdownToolbar - Formatting buttons
│   ├── CharacterCounter - Count with limit indicator
│   └── TabSwitcher - Mobile editor/preview toggle
└── Integration
    ├── useItemCaptureContext - State dispatch
    ├── react-markdown - Preview rendering
    └── Constants - Text limits
```

### View Mode State Matrix

| Screen Size | Default View | Toggle Available | Layout |
|-------------|--------------|------------------|--------|
| Mobile (<768px) | Editor | Yes (tabs) | Single pane, full width |
| Tablet (768-1024px) | Split | Optional | Side-by-side, 50/50 |
| Desktop (>1024px) | Split | Optional | Side-by-side, 60/40 |

### Auto-Save Behavior

| Trigger | Debounce | Action |
|---------|----------|--------|
| User typing | 500ms | Dispatch SET_INSTRUCTIONS to state |
| Tab switch | Immediate | Dispatch current content |
| Step navigation | Immediate | Dispatch and validate |
| Component unmount | Immediate | Final dispatch |

---

## Interface Design

### Component Props Interface

```typescript
interface TextEditorStepProps {
  /** Optional CSS class name for the root element */
  className?: string;
}
```

The component retrieves and updates state via context, following the established wizard step pattern.

### State Integration

```typescript
// From parent context
const { state, dispatch } = useItemCaptureContext();

// Reading current content
const currentContent = state.instructions || '';

// Dispatching updates
dispatch({ type: 'SET_INSTRUCTIONS', payload: markdownContent });

// Validation errors
dispatch({
  type: 'SET_ERROR',
  payload: { field: 'instructions', message: 'Content exceeds character limit' }
});
```

### Constants (to add to constants.ts)

```typescript
export const TEXT_EDITOR_CONSTRAINTS = {
  maxLength: 5000,           // Maximum character count
  warningThreshold: 4500,    // Show warning at this count
  autoSaveDelay: 500,        // Debounce delay in ms
  minHeight: 200,            // Minimum textarea height in px
};

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

---

## Implementation Tasks

### Task Breakdown

| Task | Description | Estimate | Depends On |
|------|-------------|----------|------------|
| 3.4.1 | Create component file with props interface and basic layout | 30 min | Phase 1 complete |
| 3.4.2 | Implement MarkdownToolbar with formatting buttons | 45 min | 3.4.1 |
| 3.4.3 | Implement textarea with syntax highlighting awareness | 30 min | 3.4.1 |
| 3.4.4 | Add toolbar button click handlers for text insertion | 45 min | 3.4.2, 3.4.3 |
| 3.4.5 | Implement keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K) | 30 min | 3.4.4 |
| 3.4.6 | Integrate react-markdown for live preview | 30 min | 3.4.1 |
| 3.4.7 | Implement split view layout for desktop | 30 min | 3.4.3, 3.4.6 |
| 3.4.8 | Implement tab switcher for mobile view | 30 min | 3.4.3, 3.4.6 |
| 3.4.9 | Add CharacterCounter with limit indicator | 20 min | 3.4.3 |
| 3.4.10 | Implement debounced auto-save to state | 30 min | 3.4.3 |
| 3.4.11 | Connect to ItemCapture state machine | 20 min | 3.4.10 |
| 3.4.12 | Accessibility audit and ARIA implementation | 30 min | All above |
| 3.4.13 | Responsive design adjustments and polish | 30 min | All above |
| 3.4.14 | Manual testing across browsers and devices | 45 min | All above |

**Total Estimated Time:** ~7 hours (1 day)

---

## Detailed Implementation Specifications

### 1. Component Layout Structure

```tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Link, Eye, Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useItemCaptureContext } from '../hooks/useItemCaptureState';
import { TEXT_EDITOR_CONSTRAINTS, MARKDOWN_FORMATS } from '../utils/constants';

interface TextEditorStepProps {
  className?: string;
}

export function TextEditorStep({ className }: TextEditorStepProps) {
  const { state, dispatch } = useItemCaptureContext();
  const [localContent, setLocalContent] = useState(state.instructions || '');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ... implementation
}
```

### 2. MarkdownToolbar Component

```tsx
interface ToolbarButton {
  icon: React.ComponentType<{ className?: string }>;
  format: keyof typeof MARKDOWN_FORMATS;
  ariaLabel: string;
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { icon: Bold, format: 'bold', ariaLabel: 'Bold (Ctrl+B)' },
  { icon: Italic, format: 'italic', ariaLabel: 'Italic (Ctrl+I)' },
  { icon: Heading1, format: 'heading1', ariaLabel: 'Heading 1' },
  { icon: Heading2, format: 'heading2', ariaLabel: 'Heading 2' },
  { icon: Heading3, format: 'heading3', ariaLabel: 'Heading 3' },
  { icon: List, format: 'bulletList', ariaLabel: 'Bullet List' },
  { icon: ListOrdered, format: 'numberedList', ariaLabel: 'Numbered List' },
  { icon: Link, format: 'link', ariaLabel: 'Insert Link (Ctrl+K)' },
];

function MarkdownToolbar({
  onFormat,
  disabled
}: {
  onFormat: (format: keyof typeof MARKDOWN_FORMATS) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg"
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

### 3. Text Insertion Logic

```typescript
const applyFormat = useCallback((format: keyof typeof MARKDOWN_FORMATS) => {
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

### 4. Keyboard Shortcuts Handler

```typescript
const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
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

### 5. Character Counter Component

```tsx
function CharacterCounter({
  current,
  max,
  warning
}: {
  current: number;
  max: number;
  warning: number;
}) {
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
        />
      </div>
    </div>
  );
}
```

### 6. Mobile Tab Switcher

```tsx
function TabSwitcher({
  activeTab,
  onTabChange
}: {
  activeTab: 'editor' | 'preview';
  onTabChange: (tab: 'editor' | 'preview') => void;
}) {
  return (
    <div className="flex border-b border-gray-200 md:hidden" role="tablist">
      <button
        role="tab"
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
        <Edit3 className="w-4 h-4 inline-block mr-2" />
        Editor
      </button>
      <button
        role="tab"
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
        <Eye className="w-4 h-4 inline-block mr-2" />
        Preview
      </button>
    </div>
  );
}
```

### 7. Debounced Auto-Save Logic

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

  // Cleanup on unmount
  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };
}, [localContent, state.instructions, dispatch]);

// Immediate save on unmount
useEffect(() => {
  return () => {
    if (localContent !== state.instructions) {
      dispatch({ type: 'SET_INSTRUCTIONS', payload: localContent });
    }
  };
}, []); // Empty deps - only runs on unmount
```

### 8. Complete TextEditorStep Component

```tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Link, Eye, Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useItemCaptureContext } from '../hooks/useItemCaptureState';
import { TEXT_EDITOR_CONSTRAINTS, MARKDOWN_FORMATS } from '../utils/constants';

interface TextEditorStepProps {
  className?: string;
}

export function TextEditorStep({ className }: TextEditorStepProps) {
  const { state, dispatch } = useItemCaptureContext();
  const [localContent, setLocalContent] = useState(state.instructions || '');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const characterCount = localContent.length;
  const isOverLimit = characterCount > TEXT_EDITOR_CONSTRAINTS.maxLength;

  // Format application handler
  const applyFormat = useCallback((format: keyof typeof MARKDOWN_FORMATS) => {
    // Implementation from section 3
  }, [localContent]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Implementation from section 4
  }, [applyFormat]);

  // Auto-save effect
  useEffect(() => {
    // Implementation from section 7
  }, [localContent, state.instructions, dispatch]);

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);

    // Clear error if content is now valid
    if (state.errors?.instructions && e.target.value.length <= TEXT_EDITOR_CONSTRAINTS.maxLength) {
      dispatch({ type: 'CLEAR_ERRORS' });
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Mobile Tab Switcher */}
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 min-h-0">
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
            <Eye className="w-4 h-4" />
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
      </div>

      {/* Auto-save indicator */}
      {localContent !== state.instructions && (
        <div className="px-4 pb-2 text-xs text-gray-400 flex items-center gap-1">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          Saving...
        </div>
      )}
    </div>
  );
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Main step component |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/utils/constants.ts` | Add `TEXT_EDITOR_CONSTRAINTS`, `MARKDOWN_FORMATS` | Constants for text limits and format definitions |
| `src/components/ItemCapture/index.ts` | Add `TextEditorStep` export | Public API |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Import and render TextEditorStep for 'write-text' step | Integration |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | State dispatch pattern, SET_INSTRUCTIONS action |
| `src/components/ItemCapture/ItemCapture.types.ts` | Type definitions |
| `src/lib/utils.ts` | cn() utility |
| `src/components/ItemForm.tsx` | Form patterns, error display, textarea patterns |
| `docs/REQ-042-implement-fileuploadstep-overview.md` | Sibling step pattern in Phase 3 |
| `node_modules/react-markdown` | react-markdown API reference |

### Functions to Implement

```typescript
// TextEditorStep.tsx - Main component
export function TextEditorStep(props: TextEditorStepProps): JSX.Element

// Internal sub-components
function MarkdownToolbar({ onFormat, disabled }: ToolbarProps): JSX.Element
function CharacterCounter({ current, max, warning }: CounterProps): JSX.Element
function TabSwitcher({ activeTab, onTabChange }: TabProps): JSX.Element

// Internal helpers
function applyFormat(format: FormatKey): void
function handleKeyDown(e: KeyboardEvent): void
function handleContentChange(e: ChangeEvent): void
```

---

## Styling Specifications

### Tailwind Classes Reference

| Element | Classes | Notes |
|---------|---------|-------|
| Toolbar | `flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg` | Container for format buttons |
| Toolbar Button | `p-2 rounded hover:bg-gray-200 focus:ring-2 focus:ring-blue-500` | Individual format button |
| Textarea | `w-full p-4 border border-gray-200 rounded-b-lg font-mono text-sm` | Editor area |
| Textarea Focus | `focus:ring-2 focus:ring-blue-500 focus:ring-inset` | Focus state |
| Textarea Error | `border-red-300 focus:ring-red-500` | Over-limit state |
| Preview Pane | `bg-gray-50 rounded-lg prose prose-sm max-w-none` | Markdown render area |
| Tab Active | `text-blue-600 border-b-2 border-blue-600 bg-blue-50` | Selected tab |
| Tab Inactive | `text-gray-500 hover:text-gray-700 hover:bg-gray-50` | Unselected tab |
| Counter Normal | `text-gray-500` | Under warning threshold |
| Counter Warning | `text-yellow-600` | Above warning, under limit |
| Counter Error | `text-red-600 font-medium` | Over limit |

### Responsive Breakpoints

| Breakpoint | Layout | Editor Width | Preview Width | Tabs Visible |
|------------|--------|--------------|---------------|--------------|
| Mobile (default) | Single pane | 100% | 100% | Yes |
| md (768px+) | Side-by-side | 50% | 50% | No (both visible) |
| lg (1024px+) | Side-by-side | 60% | 40% | No (both visible) |

---

## Accessibility Requirements

### ARIA Attributes

| Element | Attribute | Value |
|---------|-----------|-------|
| Toolbar | `role` | `"toolbar"` |
| Toolbar | `aria-label` | `"Text formatting"` |
| Toolbar Button | `aria-label` | Format name with shortcut |
| Tab Buttons | `role` | `"tab"` |
| Tab Buttons | `aria-selected` | `true`/`false` |
| Tab Buttons | `aria-controls` | Panel ID |
| Tab Panels | `role` | `"tabpanel"` |
| Tab Panels | `aria-labelledby` | Tab ID |
| Textarea | `aria-label` | `"Markdown content editor"` |
| Textarea | `aria-describedby` | `"char-count"` |
| Character Count | `aria-live` | `"polite"` |
| Progress Bar | `role` | `"progressbar"` |
| Error Message | `role` | `"alert"` |

### Keyboard Navigation

| Key | Context | Action |
|-----|---------|--------|
| Tab | General | Navigate between toolbar, textarea, tabs |
| Enter/Space | Toolbar button | Apply format |
| Ctrl+B / Cmd+B | Textarea | Apply bold |
| Ctrl+I / Cmd+I | Textarea | Apply italic |
| Ctrl+K / Cmd+K | Textarea | Insert link |
| Arrow Keys | Tab buttons | Switch between tabs |

### Screen Reader Announcements

- Format applied: Announce format name when button clicked
- Character count: Live region updates as user types
- Over limit: Alert when limit exceeded
- Tab switch: Announce active panel change

---

## Testing Strategy

### Unit Test Coverage

| Test Case | Description |
|-----------|-------------|
| Render empty | Shows textarea with placeholder |
| Render with content | Displays existing instructions from state |
| Format bold | Wraps selected text with ** |
| Format italic | Wraps selected text with * |
| Format heading | Prepends # to line |
| Format link | Inserts markdown link syntax |
| Character count | Updates count on input |
| Over limit styling | Red styling when > maxLength |
| Preview updates | Preview reflects textarea content |
| Auto-save triggers | Dispatch called after debounce |

### Integration Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Type and save | Enter text → Wait 500ms | Content dispatched to state |
| Apply format | Select text → Click Bold | Text wrapped with ** |
| Keyboard shortcut | Select text → Ctrl+B | Text wrapped with ** |
| Preview sync | Type markdown | Preview shows formatted output |
| Tab switch (mobile) | Click Preview tab | Preview pane visible, editor hidden |
| Navigate away | Enter text → Go to next step | Content persisted in state |
| Return to step | Navigate back to text step | Previous content restored |

### Manual Testing Matrix

| Platform | Browser | Priority | Notes |
|----------|---------|----------|-------|
| iOS 16+ | Safari | High | Touch-based, keyboard shortcuts via modifier key |
| Android | Chrome | High | Touch-based, verify tab switching |
| Desktop | Chrome | High | Full keyboard shortcut support |
| Desktop | Firefox | Medium | Verify selection handling |
| Desktop | Edge | Low | Chromium-based |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Selection API inconsistency | Medium | Medium | Test across browsers; fallback to cursor-position insert |
| react-markdown XSS | Low | High | Library sanitizes by default; no raw HTML option |
| Mobile keyboard covers editor | Medium | Medium | Scroll into view on focus; test on real devices |
| Large content performance | Low | Medium | Debounce preview updates if laggy |
| Auto-save data loss | Low | High | Immediate save on unmount; periodic backup |
| Prose styles conflict | Medium | Low | Scope prose classes; test against global styles |

---

## Success Criteria

Based on REQ-044 Acceptance Criteria:

- [ ] Toolbar provides buttons for bold, italic, heading levels, bullet lists, numbered lists, and link insertion
- [ ] Clicking a toolbar button applies the appropriate markdown syntax to selected text or at cursor position
- [ ] Preview pane displays formatted markdown rendering in real-time
- [ ] Desktop layout shows editor and preview side-by-side simultaneously
- [ ] Mobile layout provides tab navigation to switch between editor view and preview view
- [ ] Character counter displays current character count and updates with each keystroke
- [ ] Visual indicator shows when user approaches or exceeds the character limit
- [ ] Content automatically saves to application state after user stops typing for a defined period
- [ ] Previously saved content persists when user navigates away and returns to this step
- [ ] Markdown syntax in toolbar buttons matches common conventions (e.g., **bold**, *italic*)

Additional Technical Criteria:

- [ ] Keyboard shortcuts work for bold (Ctrl+B), italic (Ctrl+I), link (Ctrl+K)
- [ ] All toolbar buttons meet 44px minimum touch target
- [ ] Screen readers announce format operations
- [ ] Tab navigation works on mobile devices
- [ ] No console errors during typing or format application
- [ ] Debounced auto-save prevents excessive dispatches
- [ ] Content survives browser refresh via state persistence (if enabled)

---

## Relationship to Task 3.5 (MarkdownEditor)

Task 3.4 (this task) creates the `TextEditorStep` as a self-contained wizard step. Task 3.5 extracts the toolbar and editor logic into a reusable `MarkdownEditor` component.

**Progression:**
1. **Task 3.4:** Build complete step with inline toolbar, editor, preview
2. **Task 3.5:** Extract `MarkdownEditor` as reusable component
3. **Future:** Refactor `TextEditorStep` to consume `MarkdownEditor`

This approach allows faster initial delivery while setting up for clean abstraction.

---

## References

- [react-markdown Documentation](https://github.com/remarkjs/react-markdown)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [REQ-042 FileUploadStep Overview](/docs/REQ-042-implement-fileuploadstep-overview.md) - Sibling step in Track A
- [REQ-034 MetadataStep Overview](/docs/REQ-034-implement-metadatastep-overview.md) - Form patterns
- [ItemForm.tsx](/src/components/ItemForm.tsx) - Textarea patterns
- [Lucide Icons](https://lucide.dev/icons/) - Icon reference
- [CommonMark Spec](https://commonmark.org/) - Markdown syntax standard
