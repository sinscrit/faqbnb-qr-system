# REQ-045: Create MarkdownEditor Component - Technical Implementation Overview

**Generated:** 2025-12-31T15:10:00
**Last Modified:** 2025-12-31T15:10:00
**Request Reference:** REQ-045 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 3 - File Upload & Text
**Task ID:** 3.5

---

## Executive Summary

This document provides a technical implementation breakdown for `MarkdownEditor`, a reusable editor component extracted from the TextEditorStep implementation. The component provides an accessible toolbar with keyboard shortcuts, live markdown preview, and mobile-optimized layout for creating and formatting FAQ content.

MarkdownEditor is part of Phase 3 (File Upload & Text), Track B, and represents a reusable UI component that can be consumed by TextEditorStep and potentially other future features requiring markdown editing. The component follows the "props in, callback out" pattern established in the codebase.

---

## Scope

### In Scope

- Custom toolbar with accessible formatting buttons
- Keyboard shortcuts for common formatting operations (bold, italic, link)
- Mobile-optimized toolbar placement and layout
- Preview rendering with react-markdown
- Textarea with markdown syntax support
- Format application logic (wrapping/inserting markdown syntax)
- Character counting with limit indicators
- Responsive layout (tabs on mobile, split view on desktop)
- ARIA attributes for screen reader compatibility
- Touch-friendly button sizing (44px minimum)

### Out of Scope

- State persistence or auto-save (handled by parent component)
- Integration with ItemCapture state machine (handled by TextEditorStep)
- Rich text editing (WYSIWYG)
- Image embedding or file attachments
- Spell checking or grammar suggestions
- Custom markdown extensions beyond CommonMark
- Collaborative editing features

---

## Dependencies

### Hard Dependencies (Must Complete First)

| Dependency | Status | Location |
|------------|--------|----------|
| Phase 1 Complete | Required | Tasks 1.1-1.5 |
| Task 3.4 - TextEditorStep | Strongly Recommended | Establishes patterns, validates requirements |
| constants.ts | Required | `src/components/ItemCapture/utils/constants.ts` |
| cn() utility | Required | `src/lib/utils.ts` |

### Soft Dependencies (Can Develop in Parallel)

| Dependency | Status | Notes |
|------------|--------|-------|
| ValidationMessage component | Optional | May already exist from Phase 1 shared components |

### External Dependencies

| Dependency | Version | Notes |
|------------|---------|-------|
| react-markdown | ^9.1.0 | Already installed - for preview rendering |
| lucide-react | ^0.525.0 | Already installed - toolbar icons |
| Tailwind CSS | 4.x | Already configured - styling |

---

## Technical Approach

### Architecture Decision: Standalone Reusable Component

**Decision:** MarkdownEditor is a standalone, controlled component that accepts value and onChange props, rather than managing its own state.

**Rationale:**
- Enables reuse across different contexts (TextEditorStep, future components)
- Parent component controls state management and persistence
- Matches React controlled component patterns used throughout codebase
- Easier testing and composition
- Clear separation of concerns: MarkdownEditor handles UI/formatting, parent handles state

### Component Structure

```
MarkdownEditor/
├── Props Interface
│   ├── value: string
│   ├── onChange: (value: string) => void
│   ├── maxLength?: number
│   ├── placeholder?: string
│   ├── disabled?: boolean
│   └── className?: string
├── Sub-components (Internal)
│   ├── MarkdownToolbar - Accessible formatting buttons
│   ├── EditorTextarea - Main text input area
│   ├── PreviewPane - Rendered markdown output
│   ├── CharacterCounter - Count with limit indicator
│   └── MobileTabSwitcher - Editor/Preview toggle (mobile only)
└── Utilities
    ├── applyFormat() - Insert markdown syntax
    └── handleKeyboardShortcut() - Process keyboard shortcuts
```

### View Mode State Matrix

| Screen Size | Default View | Toggle Available | Layout |
|-------------|--------------|------------------|--------|
| Mobile (<768px) | Editor | Yes (tabs) | Single pane, full width |
| Tablet (768-1024px) | Split | Optional | Side-by-side, 50/50 |
| Desktop (>1024px) | Split | Optional | Side-by-side, 60/40 |

### Keyboard Shortcuts

| Shortcut (Windows/Linux) | Shortcut (Mac) | Action |
|--------------------------|----------------|--------|
| Ctrl+B | Cmd+B | Bold (**text**) |
| Ctrl+I | Cmd+I | Italic (*text*) |
| Ctrl+K | Cmd+K | Insert Link ([text](url)) |

---

## Interface Design

### Component Props Interface

```typescript
interface MarkdownEditorProps {
  /** Current markdown content value */
  value: string;

  /** Callback when content changes */
  onChange: (value: string) => void;

  /** Maximum character limit (default: 5000) */
  maxLength?: number;

  /** Character count at which to show warning (default: 4500) */
  warningThreshold?: number;

  /** Placeholder text for empty editor */
  placeholder?: string;

  /** Disable editing */
  disabled?: boolean;

  /** Minimum height in pixels (default: 200) */
  minHeight?: number;

  /** Optional CSS class name for the root element */
  className?: string;

  /** Optional aria-label for the editor */
  ariaLabel?: string;

  /** Optional aria-describedby reference */
  ariaDescribedBy?: string;
}
```

### Usage Example

```tsx
import { MarkdownEditor } from '@/components/ItemCapture/editors/MarkdownEditor';

function TextEditorStep() {
  const [content, setContent] = useState('');

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      maxLength={5000}
      warningThreshold={4500}
      placeholder="Write your instructions here..."
      ariaLabel="Item description editor"
    />
  );
}
```

### Constants (shared with TextEditorStep)

```typescript
// Already defined in constants.ts from Task 3.4
export const TEXT_EDITOR_CONSTRAINTS = {
  maxLength: 5000,
  warningThreshold: 4500,
  autoSaveDelay: 500,
  minHeight: 200,
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

export type MarkdownFormatKey = keyof typeof MARKDOWN_FORMATS;
```

---

## Implementation Tasks

### Task Breakdown

| Task | Description | Estimate | Depends On |
|------|-------------|----------|------------|
| 3.5.1 | Create component file with props interface | 20 min | constants.ts from 3.4 |
| 3.5.2 | Implement MarkdownToolbar sub-component | 45 min | 3.5.1 |
| 3.5.3 | Implement format application logic | 30 min | 3.5.1 |
| 3.5.4 | Add keyboard shortcuts handler | 30 min | 3.5.3 |
| 3.5.5 | Build EditorTextarea with focus management | 30 min | 3.5.1 |
| 3.5.6 | Implement PreviewPane with react-markdown | 20 min | 3.5.1 |
| 3.5.7 | Create CharacterCounter sub-component | 20 min | 3.5.1 |
| 3.5.8 | Implement MobileTabSwitcher | 25 min | 3.5.1 |
| 3.5.9 | Compose full component with responsive layout | 30 min | 3.5.2-3.5.8 |
| 3.5.10 | Accessibility audit and ARIA implementation | 30 min | 3.5.9 |
| 3.5.11 | Update barrel export in index.ts | 5 min | 3.5.9 |
| 3.5.12 | Manual testing across browsers and devices | 30 min | All above |

**Total Estimated Time:** ~5.5 hours

---

## Detailed Implementation Specifications

### 1. Component Layout Structure

```tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Link as LinkIcon, Eye, Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TEXT_EDITOR_CONSTRAINTS, MARKDOWN_FORMATS, MarkdownFormatKey } from '../utils/constants';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  warningThreshold?: number;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  maxLength = TEXT_EDITOR_CONSTRAINTS.maxLength,
  warningThreshold = TEXT_EDITOR_CONSTRAINTS.warningThreshold,
  placeholder = 'Write your content here using markdown formatting...',
  disabled = false,
  minHeight = TEXT_EDITOR_CONSTRAINTS.minHeight,
  className,
  ariaLabel = 'Markdown editor',
  ariaDescribedBy,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ... implementation
}
```

### 2. MarkdownToolbar Sub-component

```tsx
interface ToolbarButton {
  icon: React.ComponentType<{ className?: string }>;
  format: MarkdownFormatKey;
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
  { icon: LinkIcon, format: 'link', ariaLabel: 'Insert Link (Ctrl+K)' },
];

interface MarkdownToolbarProps {
  onFormat: (format: MarkdownFormatKey) => void;
  disabled?: boolean;
}

function MarkdownToolbar({ onFormat, disabled }: MarkdownToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1 p-2',
        'border-b border-gray-200 bg-gray-50 rounded-t-lg',
        // Mobile: smaller buttons, more compact
        'md:gap-2'
      )}
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
            // Base styles
            'p-2 rounded transition-colors',
            // Touch target: 44px minimum (p-2 = 8px + 16px icon + 8px = 32px, need larger)
            'min-w-[44px] min-h-[44px] flex items-center justify-center',
            // Hover and focus states
            'hover:bg-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
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

### 3. Format Application Logic

```typescript
const applyFormat = useCallback((format: MarkdownFormatKey) => {
  const textarea = textareaRef.current;
  if (!textarea || disabled) return;

  const { prefix, suffix } = MARKDOWN_FORMATS[format];
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.substring(start, end);

  let newText: string;
  let newCursorPos: number;

  if (selectedText) {
    // Wrap selected text with format
    newText =
      value.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      value.substring(end);
    newCursorPos = start + prefix.length + selectedText.length + suffix.length;
  } else {
    // Insert format at cursor
    newText =
      value.substring(0, start) +
      prefix +
      suffix +
      value.substring(end);
    // Position cursor between prefix and suffix for typing
    newCursorPos = start + prefix.length;
  }

  onChange(newText);

  // Restore focus and cursor position after React re-render
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  });
}, [value, onChange, disabled]);
```

### 4. Keyboard Shortcuts Handler

```typescript
const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (disabled) return;

  // Detect Mac vs Windows/Linux
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
}, [applyFormat, disabled]);
```

### 5. CharacterCounter Sub-component

```tsx
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
    <div className="flex items-center justify-between text-sm mt-2">
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

      {/* Visual progress bar */}
      <div
        className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden ml-3"
        aria-hidden="true"
      >
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

### 6. MobileTabSwitcher Sub-component

```tsx
interface MobileTabSwitcherProps {
  activeTab: 'editor' | 'preview';
  onTabChange: (tab: 'editor' | 'preview') => void;
}

function MobileTabSwitcher({ activeTab, onTabChange }: MobileTabSwitcherProps) {
  return (
    <div
      className="flex border-b border-gray-200 md:hidden"
      role="tablist"
      aria-label="Editor view mode"
    >
      <button
        id="editor-tab"
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
        <Edit3 className="w-4 h-4 inline-block mr-2" aria-hidden="true" />
        Editor
      </button>
      <button
        id="preview-tab"
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
        <Eye className="w-4 h-4 inline-block mr-2" aria-hidden="true" />
        Preview
      </button>
    </div>
  );
}
```

### 7. Complete MarkdownEditor Component

```tsx
export function MarkdownEditor({
  value,
  onChange,
  maxLength = TEXT_EDITOR_CONSTRAINTS.maxLength,
  warningThreshold = TEXT_EDITOR_CONSTRAINTS.warningThreshold,
  placeholder = 'Write your content here using markdown formatting...',
  disabled = false,
  minHeight = TEXT_EDITOR_CONSTRAINTS.minHeight,
  className,
  ariaLabel = 'Markdown editor',
  ariaDescribedBy,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterCount = value.length;
  const isOverLimit = characterCount > maxLength;

  // Format application handler
  const applyFormat = useCallback((format: MarkdownFormatKey) => {
    // Implementation from section 3
  }, [value, onChange, disabled]);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Implementation from section 4
  }, [applyFormat, disabled]);

  // Handle content change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Mobile Tab Switcher */}
      <MobileTabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
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
          <MarkdownToolbar
            onFormat={applyFormat}
            disabled={disabled || isOverLimit}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              'flex-1 w-full p-4 resize-none',
              'border border-t-0 border-gray-200 rounded-b-lg',
              'font-mono text-sm leading-relaxed',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
              'placeholder:text-gray-400',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              isOverLimit && 'border-red-300 focus:ring-red-500'
            )}
            style={{ minHeight }}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy || 'char-count'}
            aria-invalid={isOverLimit}
          />

          {/* Character Counter */}
          <div id="char-count">
            <CharacterCounter
              current={characterCount}
              max={maxLength}
              warning={warningThreshold}
            />
          </div>

          {/* Over-limit Error Message */}
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
              'prose-a:text-blue-600 prose-a:underline',
              'prose-strong:text-gray-800',
              'prose-ul:text-gray-600',
              'prose-ol:text-gray-600',
              'prose-code:text-gray-800 prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded'
            )}
            style={{ minHeight }}
          >
            {value ? (
              <ReactMarkdown>{value}</ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">
                Start typing to see a preview of your formatted content...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/editors/MarkdownEditor.tsx` | Main reusable editor component |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/index.ts` | Add `MarkdownEditor` export | Public API exposure |
| `src/components/ItemCapture/utils/constants.ts` | Add `MarkdownFormatKey` type export | Type export for consumers |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/components/ItemCapture/utils/constants.ts` | TEXT_EDITOR_CONSTRAINTS, MARKDOWN_FORMATS |
| `src/lib/utils.ts` | cn() utility |
| `src/components/ItemCapture/components/steps/TextEditorStep.tsx` | Integration patterns (from Task 3.4) |
| `src/components/TimeRangeSelector.tsx` | Accessibility patterns, toolbar patterns |
| `src/components/PropertyForm.tsx` | Form validation patterns |
| `docs/REQ-044-implement-texteditorstep-overview.md` | Parent step context |

### Functions to Implement

```typescript
// MarkdownEditor.tsx - Main component
export function MarkdownEditor(props: MarkdownEditorProps): JSX.Element

// Internal sub-components
function MarkdownToolbar({ onFormat, disabled }: MarkdownToolbarProps): JSX.Element
function CharacterCounter({ current, max, warning }: CharacterCounterProps): JSX.Element
function MobileTabSwitcher({ activeTab, onTabChange }: MobileTabSwitcherProps): JSX.Element

// Internal helpers (within component scope)
function applyFormat(format: MarkdownFormatKey): void
function handleKeyDown(e: KeyboardEvent): void
function handleChange(e: ChangeEvent): void
```

---

## Styling Specifications

### Tailwind Classes Reference

| Element | Classes | Notes |
|---------|---------|-------|
| Toolbar Container | `flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg` | Wraps on mobile |
| Toolbar Button | `p-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center` | 44px touch target |
| Toolbar Button Hover | `hover:bg-gray-200` | Visual feedback |
| Toolbar Button Focus | `focus:ring-2 focus:ring-blue-500 focus:ring-offset-1` | Accessibility |
| Toolbar Button Disabled | `disabled:opacity-50 disabled:cursor-not-allowed` | Disabled state |
| Textarea | `w-full p-4 border border-gray-200 rounded-b-lg font-mono text-sm` | Monospace for code |
| Textarea Focus | `focus:ring-2 focus:ring-blue-500 focus:ring-inset` | Focus state |
| Textarea Error | `border-red-300 focus:ring-red-500` | Over-limit state |
| Preview Container | `bg-gray-50 rounded-lg prose prose-sm max-w-none overflow-auto` | Markdown styling |
| Tab Active | `text-blue-600 border-b-2 border-blue-600 bg-blue-50` | Selected tab |
| Tab Inactive | `text-gray-500 hover:text-gray-700 hover:bg-gray-50` | Unselected tab |
| Counter Normal | `text-gray-500 tabular-nums` | Under threshold |
| Counter Warning | `text-yellow-600` | Approaching limit |
| Counter Error | `text-red-600 font-medium` | Over limit |
| Progress Bar | `h-1.5 bg-gray-200 rounded-full overflow-hidden` | Background |
| Progress Fill | `h-full rounded-full transition-all duration-300` | Animated fill |

### Responsive Breakpoints

| Breakpoint | Layout | Toolbar | Editor | Preview | Tabs |
|------------|--------|---------|--------|---------|------|
| Mobile (default) | Single pane | Wrapped | 100% | 100% | Visible |
| md (768px+) | Side-by-side | Inline | 50% | 50% | Hidden (both visible) |
| lg (1024px+) | Side-by-side | Inline | 60% | 40% | Hidden (both visible) |

---

## Accessibility Requirements

### ARIA Attributes

| Element | Attribute | Value |
|---------|-----------|-------|
| Toolbar | `role` | `"toolbar"` |
| Toolbar | `aria-label` | `"Text formatting"` |
| Toolbar Button | `aria-label` | Format name with shortcut |
| Tab Container | `role` | `"tablist"` |
| Tab Container | `aria-label` | `"Editor view mode"` |
| Tab Buttons | `role` | `"tab"` |
| Tab Buttons | `aria-selected` | `true`/`false` |
| Tab Buttons | `aria-controls` | Panel ID |
| Tab Panels | `role` | `"tabpanel"` |
| Tab Panels | `aria-labelledby` | Tab button ID |
| Textarea | `aria-label` | Configurable via props |
| Textarea | `aria-describedby` | Character count ID |
| Textarea | `aria-invalid` | `true` when over limit |
| Character Count | `aria-live` | `"polite"` |
| Character Count | `aria-atomic` | `"true"` |
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

### Touch Target Requirements

- All toolbar buttons: minimum 44x44 pixels
- Tab buttons: full width, minimum 48px height
- Adequate spacing between buttons (8px minimum)

---

## Testing Strategy

### Unit Test Coverage

| Test Case | Description |
|-----------|-------------|
| Render empty | Shows textarea with placeholder, empty preview |
| Render with value | Displays value in textarea and preview |
| onChange callback | Called when textarea content changes |
| Format bold | Wraps selected text with ** |
| Format italic | Wraps selected text with * |
| Format heading | Prepends # to line |
| Format list | Prepends - or 1. to line |
| Format link | Inserts [text](url) syntax |
| Format at cursor | Inserts format markers with cursor between |
| Character count | Displays correct count |
| Warning threshold | Yellow styling when >= threshold |
| Over limit | Red styling and error message |
| Disabled state | All inputs disabled, styling applied |
| Keyboard Ctrl+B | Applies bold format |
| Keyboard Cmd+B (Mac) | Applies bold format |
| Preview updates | Preview reflects value prop |

### Integration Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Type and format | Enter text → Select → Click Bold | Text wrapped with **, onChange called |
| Keyboard shortcut | Select text → Ctrl+B | Text wrapped with ** |
| Mobile tab switch | Click Preview tab | Preview pane visible, editor hidden |
| Desktop split view | Resize to 768px+ | Both panes visible side-by-side |
| Character limit | Type beyond limit | Error message shown, toolbar disabled |
| Focus management | Apply format | Cursor position preserved |

### Manual Testing Matrix

| Platform | Browser | Priority | Notes |
|----------|---------|----------|-------|
| iOS 16+ | Safari | High | Touch toolbar, keyboard shortcuts |
| Android | Chrome | High | Touch toolbar, tab switching |
| Desktop | Chrome | High | Full keyboard shortcut support |
| Desktop | Firefox | Medium | Verify selection handling |
| Desktop | Safari | Medium | Verify Cmd key detection |
| Desktop | Edge | Low | Chromium-based |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Selection API inconsistency | Medium | Medium | Test across browsers; fallback to cursor-position insert |
| react-markdown XSS | Low | High | Library sanitizes by default; no raw HTML option |
| Mobile keyboard covers editor | Medium | Medium | Scroll into view on focus; test on real devices |
| Touch target too small | Medium | High | Enforce 44px minimum; verify on device |
| Cursor position lost | Medium | Medium | requestAnimationFrame for re-focus after state update |
| Mac vs Windows shortcut confusion | Low | Low | Detect platform; show correct shortcut in tooltip |

---

## Success Criteria

Based on REQ-045 Acceptance Criteria:

- [ ] Toolbar buttons are keyboard-navigable and announce their function to screen readers
- [ ] Common formatting operations (bold, italic, headings, lists, links) can be triggered via keyboard shortcuts
- [ ] On mobile viewports, the toolbar repositions or collapses to avoid obscuring the editing area
- [ ] Preview pane renders markdown content using standard markdown syntax
- [ ] Users can toggle between edit and preview modes
- [ ] Formatting buttons update the editor content correctly when text is selected
- [ ] The editor maintains focus and cursor position after formatting operations

Additional Technical Criteria:

- [ ] Component is controlled (value/onChange props)
- [ ] All toolbar buttons meet 44px minimum touch target
- [ ] Screen readers announce format button purposes
- [ ] Keyboard shortcuts work on Mac (Cmd) and Windows/Linux (Ctrl)
- [ ] Character counter updates in real-time
- [ ] Visual warning at configurable threshold
- [ ] Error state at configurable limit
- [ ] Responsive layout works at all breakpoints
- [ ] No console errors during formatting operations

---

## Relationship to Task 3.4 (TextEditorStep)

Task 3.4 implements `TextEditorStep` as a complete wizard step with integrated editor. Task 3.5 (this task) extracts the editor into a reusable `MarkdownEditor` component.

**Progression:**
1. **Task 3.4 (Complete):** Build TextEditorStep with inline toolbar, editor, preview, auto-save
2. **Task 3.5 (This):** Extract MarkdownEditor as reusable component
3. **Refactor:** Update TextEditorStep to consume MarkdownEditor (optional, for code cleanup)

**Key Differences:**

| Feature | TextEditorStep | MarkdownEditor |
|---------|----------------|----------------|
| State management | Manages own state with auto-save | Controlled component (value/onChange) |
| Context integration | Uses useItemCaptureContext | No context dependency |
| Auto-save | Built-in debounced dispatch | Not included (parent responsibility) |
| Reusability | Wizard-specific | General-purpose |

---

## References

- [react-markdown Documentation](https://github.com/remarkjs/react-markdown)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Phase 3, Task 3.5
- [REQ-044 TextEditorStep Overview](/docs/REQ-044-implement-texteditorstep-overview.md) - Parent step context
- [REQ-044 TextEditorStep Detailed](/docs/REQ-044-implement-texteditorstep-detailed.md) - Implementation patterns
- [TimeRangeSelector.tsx](/src/components/TimeRangeSelector.tsx) - Accessibility patterns (lines 54-255)
- [Lucide Icons](https://lucide.dev/icons/) - Icon reference
- [CommonMark Spec](https://commonmark.org/) - Markdown syntax standard
- [WCAG 2.1 Touch Target](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - 44px requirement

---
