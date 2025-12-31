# REQ-045: Create MarkdownEditor Component - Detailed Task Breakdown

**Generated:** 2025-12-31T15:45:00Z
**Last Modified:** 2025-12-31T15:45:00Z
**Request Reference:** REQ-045 in `/docs/gen_requests.md`
**Overview Document:** `/docs/REQ-045-create-markdowneditor-component-overview.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 3 - File Upload & Text
**Task ID:** 3.5

---

## Document Purpose

This document transforms the technical overview into granular, actionable tasks that can be executed step-by-step. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes specific file paths, verification steps, and acceptance criteria.

---

## Pre-Implementation Checklist

Before starting implementation, verify the following prerequisites:

| Prerequisite | Status Check | Action if Missing |
|--------------|--------------|-------------------|
| Phase 1 Complete | Check for `src/components/ItemCapture/index.ts` | Complete Phase 1 first |
| constants.ts exists | Check for `src/components/ItemCapture/utils/constants.ts` | Create constants file in Task 3.5.1 |
| cn() utility available | Check `src/lib/utils.ts` exports cn | Already available |
| react-markdown installed | Run `npm list react-markdown` | Run `npm install react-markdown` |
| lucide-react installed | Run `npm list lucide-react` | Already installed (v0.525.0) |

---

## Authorized Files and Functions

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/utils/constants.ts` | Shared constants for editor constraints and markdown formats |
| `src/components/ItemCapture/editors/MarkdownEditor.tsx` | Main reusable editor component |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/index.ts` | Add `MarkdownEditor` export | Public API exposure |

### Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `src/lib/utils.ts` | cn() utility pattern |
| `src/components/TimeRangeSelector.tsx` | Accessibility patterns, toolbar patterns |
| `src/components/ItemCapture/editors/ImageCropper.tsx` | Component structure patterns |

---

## Task Breakdown

### Task 3.5.1: Create constants.ts with Editor Configuration

**Objective:** Create the shared constants file that defines text editor constraints and markdown format specifications.

**Estimated Time:** 30 minutes

**Dependencies:** None (can start immediately)

**File to Create:** `src/components/ItemCapture/utils/constants.ts`

#### Implementation Steps

1. Create the constants file with the following exports:
   - `TEXT_EDITOR_CONSTRAINTS` object with maxLength, warningThreshold, autoSaveDelay, minHeight
   - `MARKDOWN_FORMATS` object defining prefix/suffix for each format type
   - `MarkdownFormatKey` type export

2. Include these markdown format definitions:
   - bold: `**text**`
   - italic: `*text*`
   - heading1: `# text`
   - heading2: `## text`
   - heading3: `### text`
   - bulletList: `- text`
   - numberedList: `1. text`
   - link: `[text](url)`

#### Code Structure

```typescript
// TEXT_EDITOR_CONSTRAINTS
export const TEXT_EDITOR_CONSTRAINTS = {
  maxLength: 5000,
  warningThreshold: 4500,
  autoSaveDelay: 500,
  minHeight: 200,
};

// MARKDOWN_FORMATS with prefix, suffix, label, shortcut
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

#### Verification Steps

- [ ] File exists at `src/components/ItemCapture/utils/constants.ts`
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] `MarkdownFormatKey` type is exported and usable
- [ ] All 8 markdown format definitions are present
- [ ] `TEXT_EDITOR_CONSTRAINTS` contains all 4 properties

---

### Task 3.5.2: Create MarkdownEditor Base Component with Props Interface

**Objective:** Create the main MarkdownEditor component file with props interface, basic structure, and controlled component pattern.

**Estimated Time:** 45 minutes

**Dependencies:** Task 3.5.1 (constants.ts)

**File to Create:** `src/components/ItemCapture/editors/MarkdownEditor.tsx`

#### Implementation Steps

1. Add `'use client'` directive at top of file
2. Define `MarkdownEditorProps` interface with all props:
   - value: string
   - onChange: (value: string) => void
   - maxLength?: number (default from constants)
   - warningThreshold?: number (default from constants)
   - placeholder?: string
   - disabled?: boolean
   - minHeight?: number (default from constants)
   - className?: string
   - ariaLabel?: string
   - ariaDescribedBy?: string

3. Create exported `MarkdownEditor` function component with:
   - Internal state for `activeTab: 'editor' | 'preview'`
   - `textareaRef` using useRef
   - Computed `characterCount` from value.length
   - Computed `isOverLimit` boolean
   - Basic JSX structure with placeholder content

4. Import dependencies:
   - useState, useCallback, useRef from 'react'
   - cn from '@/lib/utils'
   - TEXT_EDITOR_CONSTRAINTS, MARKDOWN_FORMATS, MarkdownFormatKey from '../utils/constants'

#### Code Structure

```typescript
'use client';

import { useState, useCallback, useRef } from 'react';
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

  const characterCount = value.length;
  const isOverLimit = characterCount > maxLength;

  // Placeholder - will be implemented in subsequent tasks
  return (
    <div className={cn('flex flex-col', className)}>
      <p>MarkdownEditor placeholder</p>
    </div>
  );
}
```

#### Verification Steps

- [ ] File exists at `src/components/ItemCapture/editors/MarkdownEditor.tsx`
- [ ] TypeScript compiles without errors
- [ ] Component can be imported: `import { MarkdownEditor } from './editors/MarkdownEditor'`
- [ ] Props interface accepts all documented properties
- [ ] Default values match constants

---

### Task 3.5.3: Implement CharacterCounter Sub-component

**Objective:** Build the character counter with visual progress bar, warning state, and error state.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.5.2

**File to Modify:** `src/components/ItemCapture/editors/MarkdownEditor.tsx`

#### Implementation Steps

1. Define `CharacterCounterProps` interface:
   - current: number
   - max: number
   - warning: number

2. Create internal `CharacterCounter` function component with:
   - Computed percentage: `(current / max) * 100`
   - Computed `isWarning`: `current >= warning`
   - Computed `isError`: `current > max`
   - Text display: `{current.toLocaleString()} / {max.toLocaleString()} characters`
   - Visual progress bar with colored fill
   - ARIA attributes for accessibility

3. Styling requirements:
   - Normal state: `text-gray-500`, blue progress bar
   - Warning state: `text-yellow-600`, yellow progress bar
   - Error state: `text-red-600 font-medium`, red progress bar
   - Progress bar height: `h-1.5`
   - Progress bar width: `w-24`

#### Code Structure

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

#### Verification Steps

- [ ] CharacterCounter renders current/max character count
- [ ] Progress bar fills proportionally to character count
- [ ] Text turns yellow when current >= warning threshold
- [ ] Text turns red with font-medium when current > max
- [ ] Progress bar color matches text state
- [ ] `aria-live="polite"` is set on count text
- [ ] `aria-valuenow`, `aria-valuemin`, `aria-valuemax` set on progress bar

---

### Task 3.5.4: Implement MobileTabSwitcher Sub-component

**Objective:** Build the mobile tab switcher for toggling between editor and preview views on small screens.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.5.2

**File to Modify:** `src/components/ItemCapture/editors/MarkdownEditor.tsx`

#### Implementation Steps

1. Add icon imports from lucide-react:
   - `Edit3` for editor tab
   - `Eye` for preview tab

2. Define `MobileTabSwitcherProps` interface:
   - activeTab: 'editor' | 'preview'
   - onTabChange: (tab: 'editor' | 'preview') => void

3. Create internal `MobileTabSwitcher` function component with:
   - Container div with `role="tablist"` and `aria-label="Editor view mode"`
   - Two button elements with `role="tab"`
   - `aria-selected` attribute based on activeTab
   - `aria-controls` pointing to panel IDs
   - `id` attributes for tab buttons (editor-tab, preview-tab)
   - Hidden on md breakpoint and above: `md:hidden`

4. Styling requirements:
   - Active tab: `text-blue-600 border-b-2 border-blue-600 bg-blue-50`
   - Inactive tab: `text-gray-500 hover:text-gray-700 hover:bg-gray-50`
   - Both tabs: `flex-1 py-3 px-4 text-sm font-medium`
   - Focus state: `focus:ring-2 focus:ring-inset focus:ring-blue-500`

#### Code Structure

```typescript
import { Eye, Edit3 } from 'lucide-react';

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

#### Verification Steps

- [ ] Tab switcher renders two buttons (Editor, Preview)
- [ ] Tab switcher is hidden on screens >= 768px (md breakpoint)
- [ ] Clicking tab calls onTabChange with correct value
- [ ] Active tab has blue styling with border
- [ ] Inactive tab has gray styling
- [ ] `role="tablist"` on container
- [ ] `role="tab"` and `aria-selected` on buttons
- [ ] `aria-controls` points to panel IDs
- [ ] Icons have `aria-hidden="true"`

---

### Task 3.5.5: Implement MarkdownToolbar Sub-component

**Objective:** Build the accessible toolbar with formatting buttons that apply markdown syntax.

**Estimated Time:** 1 hour

**Dependencies:** Task 3.5.2

**File to Modify:** `src/components/ItemCapture/editors/MarkdownEditor.tsx`

#### Implementation Steps

1. Add icon imports from lucide-react:
   - `Bold`, `Italic`, `Heading1`, `Heading2`, `Heading3`
   - `List`, `ListOrdered`, `Link as LinkIcon`

2. Define `ToolbarButton` interface:
   - icon: React.ComponentType<{ className?: string }>
   - format: MarkdownFormatKey
   - ariaLabel: string

3. Create `TOOLBAR_BUTTONS` array with all 8 formatting buttons

4. Define `MarkdownToolbarProps` interface:
   - onFormat: (format: MarkdownFormatKey) => void
   - disabled?: boolean

5. Create internal `MarkdownToolbar` function component with:
   - Container div with `role="toolbar"` and `aria-label="Text formatting"`
   - Map over TOOLBAR_BUTTONS to render button elements
   - Each button: `type="button"`, disabled state, onClick handler
   - `aria-label` and `title` attributes for accessibility

6. Styling requirements (44px touch targets):
   - Button: `p-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center`
   - Hover: `hover:bg-gray-200`
   - Focus: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`
   - Disabled: `disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`
   - Container: `flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg`

#### Code Structure

```typescript
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Link as LinkIcon
} from 'lucide-react';

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
            'p-2 rounded transition-colors',
            'min-w-[44px] min-h-[44px] flex items-center justify-center',
            'hover:bg-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
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

#### Verification Steps

- [ ] Toolbar renders 8 formatting buttons
- [ ] Each button has minimum 44x44px size
- [ ] `role="toolbar"` on container
- [ ] Each button has `aria-label` and `title`
- [ ] Clicking button calls onFormat with correct format key
- [ ] Disabled state applies to all buttons when disabled=true
- [ ] Focus ring visible when button is focused
- [ ] Buttons wrap on narrow screens

---

### Task 3.5.6: Implement Format Application Logic

**Objective:** Create the `applyFormat` callback that inserts markdown syntax at cursor position or wraps selected text.

**Estimated Time:** 45 minutes

**Dependencies:** Task 3.5.2, Task 3.5.5

**File to Modify:** `src/components/ItemCapture/editors/MarkdownEditor.tsx`

#### Implementation Steps

1. Inside the main `MarkdownEditor` component, create `applyFormat` using `useCallback`:
   - Get textarea reference from textareaRef
   - Return early if textarea is null or disabled
   - Get prefix/suffix from MARKDOWN_FORMATS[format]
   - Get selection start/end from textarea
   - Get selected text using value.substring(start, end)

2. Handle two cases:
   - **Selected text exists:** Wrap with prefix + selectedText + suffix
   - **No selection:** Insert prefix + suffix, position cursor between them

3. After text update:
   - Call onChange with new text
   - Use `requestAnimationFrame` to restore focus and cursor position

4. Add `applyFormat` to dependency array: `[value, onChange, disabled]`

#### Code Structure

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

#### Verification Steps

- [ ] Selecting text and clicking Bold wraps text with `**`
- [ ] Selecting text and clicking Italic wraps text with `*`
- [ ] No selection + Bold inserts `****` with cursor between
- [ ] No selection + Link inserts `[](url)` with cursor after `[`
- [ ] Heading formats prepend `# ` without suffix
- [ ] Cursor position is restored after format application
- [ ] Focus returns to textarea after clicking toolbar button
- [ ] Format does nothing when disabled=true

---

### Task 3.5.7: Implement Keyboard Shortcuts Handler

**Objective:** Add keyboard shortcuts for common formatting operations (Ctrl/Cmd + B/I/K).

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.5.6

**File to Modify:** `src/components/ItemCapture/editors/MarkdownEditor.tsx`

#### Implementation Steps

1. Inside the main `MarkdownEditor` component, create `handleKeyDown` using `useCallback`:
   - Return early if disabled
   - Detect Mac vs Windows/Linux using `navigator.platform`
   - Check for modifier key (metaKey on Mac, ctrlKey on Windows)
   - Return early if modifier not pressed

2. Handle keyboard shortcuts:
   - `b` → applyFormat('bold')
   - `i` → applyFormat('italic')
   - `k` → applyFormat('link')
   - Call `e.preventDefault()` for each handled shortcut

3. Add `handleKeyDown` to dependency array: `[applyFormat, disabled]`

#### Code Structure

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

#### Verification Steps

- [ ] Ctrl+B applies bold formatting on Windows/Linux
- [ ] Cmd+B applies bold formatting on Mac
- [ ] Ctrl+I applies italic formatting on Windows/Linux
- [ ] Cmd+I applies italic formatting on Mac
- [ ] Ctrl+K inserts link formatting on Windows/Linux
- [ ] Cmd+K inserts link formatting on Mac
- [ ] Shortcuts do nothing when disabled=true
- [ ] Default browser behavior is prevented for handled shortcuts

---

### Task 3.5.8: Implement Textarea with Focus Management

**Objective:** Add the textarea element with proper styling, event handlers, and accessibility attributes.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.5.6, Task 3.5.7

**File to Modify:** `src/components/ItemCapture/editors/MarkdownEditor.tsx`

#### Implementation Steps

1. Create `handleChange` function to call onChange with textarea value

2. Add textarea element with:
   - ref={textareaRef}
   - value={value}
   - onChange={handleChange}
   - onKeyDown={handleKeyDown}
   - disabled={disabled}
   - placeholder={placeholder}

3. Add ARIA attributes:
   - aria-label={ariaLabel}
   - aria-describedby={ariaDescribedBy || 'char-count'}
   - aria-invalid={isOverLimit}

4. Styling requirements:
   - Base: `flex-1 w-full p-4 resize-none`
   - Border: `border border-t-0 border-gray-200 rounded-b-lg`
   - Typography: `font-mono text-sm leading-relaxed`
   - Focus: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset`
   - Placeholder: `placeholder:text-gray-400`
   - Disabled: `disabled:bg-gray-100 disabled:cursor-not-allowed`
   - Error: `isOverLimit && 'border-red-300 focus:ring-red-500'`
   - Set `style={{ minHeight }}` for configurable height

#### Code Structure

```typescript
const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  onChange(e.target.value);
};

// In JSX:
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
```

#### Verification Steps

- [ ] Textarea renders with monospace font
- [ ] Typing in textarea calls onChange with new value
- [ ] Keyboard shortcuts work while typing
- [ ] Placeholder text shows when empty
- [ ] Disabled state prevents input
- [ ] Focus ring is blue normally
- [ ] Focus ring turns red when over character limit
- [ ] aria-invalid is true when over limit
- [ ] aria-describedby points to character counter

---

### Task 3.5.9: Implement Preview Pane with react-markdown

**Objective:** Add the preview pane that renders markdown content using react-markdown.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.5.2

**File to Modify:** `src/components/ItemCapture/editors/MarkdownEditor.tsx`

#### Implementation Steps

1. Add import for react-markdown:
   ```typescript
   import ReactMarkdown from 'react-markdown';
   ```

2. Create preview pane section with:
   - Desktop header showing "Preview" label with Eye icon
   - ReactMarkdown component rendering value
   - Empty state placeholder when value is empty
   - Role and aria attributes for tab panel

3. Apply prose styling for rendered markdown:
   - Base: `prose prose-sm max-w-none`
   - Headings: `prose-headings:text-gray-800`
   - Paragraphs: `prose-p:text-gray-600`
   - Links: `prose-a:text-blue-600 prose-a:underline`
   - Strong: `prose-strong:text-gray-800`
   - Lists: `prose-ul:text-gray-600 prose-ol:text-gray-600`
   - Code: `prose-code:text-gray-800 prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded`

4. Container styling:
   - Base: `flex-1 p-4 bg-gray-50 rounded-lg overflow-auto`
   - Set `style={{ minHeight }}` for consistent height

#### Code Structure

```typescript
import ReactMarkdown from 'react-markdown';

// In JSX:
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
```

#### Verification Steps

- [ ] Preview pane renders markdown content correctly
- [ ] Bold text (`**text**`) renders as bold
- [ ] Italic text (`*text*`) renders as italic
- [ ] Headings (`# H1`, `## H2`, `### H3`) render with correct sizes
- [ ] Links (`[text](url)`) render as clickable links
- [ ] Lists render correctly (bullet and numbered)
- [ ] Empty state shows placeholder text
- [ ] Preview pane scrolls when content exceeds height
- [ ] Preview updates immediately when value changes

---

### Task 3.5.10: Compose Full Component with Responsive Layout

**Objective:** Assemble all sub-components into the complete MarkdownEditor with responsive layout.

**Estimated Time:** 45 minutes

**Dependencies:** Tasks 3.5.3 through 3.5.9

**File to Modify:** `src/components/ItemCapture/editors/MarkdownEditor.tsx`

#### Implementation Steps

1. Update the main return statement to include:
   - MobileTabSwitcher at the top
   - Main content area with flex layout
   - Editor pane (left/single on mobile)
   - Preview pane (right/separate tab on mobile)

2. Implement responsive layout:
   - Mobile: Single pane with tab switching
   - Desktop (md+): Side-by-side layout with both panes visible

3. Editor pane structure:
   - MarkdownToolbar
   - Textarea (from Task 3.5.8)
   - CharacterCounter
   - Over-limit error message

4. Tab panel visibility:
   - Editor panel: `hidden md:flex` when preview tab active on mobile
   - Preview panel: `hidden md:flex` when editor tab active on mobile

5. Add over-limit error message:
   ```tsx
   {isOverLimit && (
     <p className="text-red-600 text-sm mt-2" role="alert">
       Content exceeds the maximum character limit. Please shorten your text.
     </p>
   )}
   ```

#### Code Structure

```typescript
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
        <MarkdownToolbar
          onFormat={applyFormat}
          disabled={disabled || isOverLimit}
        />

        <textarea ... />

        <div id="char-count">
          <CharacterCounter
            current={characterCount}
            max={maxLength}
            warning={warningThreshold}
          />
        </div>

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
        ...
      </div>
    </div>
  </div>
);
```

#### Verification Steps

- [ ] Mobile: Only editor pane visible by default
- [ ] Mobile: Tab switcher allows switching to preview
- [ ] Mobile: Tab switcher hidden on desktop
- [ ] Desktop: Both panes visible side-by-side
- [ ] Desktop: Left pane is editor, right pane is preview
- [ ] Over-limit error message appears when character count exceeds max
- [ ] Toolbar is disabled when over limit
- [ ] All ARIA attributes correct for tab panels
- [ ] Layout doesn't break at various screen widths

---

### Task 3.5.11: Update Index Barrel Export

**Objective:** Export the MarkdownEditor component from the ItemCapture index file.

**Estimated Time:** 15 minutes

**Dependencies:** Task 3.5.10

**File to Create/Modify:** `src/components/ItemCapture/index.ts`

#### Implementation Steps

1. Check if `src/components/ItemCapture/index.ts` exists:
   - If not, create it

2. Add export for MarkdownEditor:
   ```typescript
   export { MarkdownEditor } from './editors/MarkdownEditor';
   ```

3. Add re-export for constants if needed:
   ```typescript
   export { TEXT_EDITOR_CONSTRAINTS, MARKDOWN_FORMATS, type MarkdownFormatKey } from './utils/constants';
   ```

#### Code Structure

```typescript
// src/components/ItemCapture/index.ts

// Editor components
export { MarkdownEditor } from './editors/MarkdownEditor';

// Constants and types
export {
  TEXT_EDITOR_CONSTRAINTS,
  MARKDOWN_FORMATS,
  type MarkdownFormatKey
} from './utils/constants';
```

#### Verification Steps

- [ ] `index.ts` exists in ItemCapture directory
- [ ] MarkdownEditor can be imported: `import { MarkdownEditor } from '@/components/ItemCapture'`
- [ ] Constants can be imported: `import { TEXT_EDITOR_CONSTRAINTS } from '@/components/ItemCapture'`
- [ ] TypeScript compiles without errors
- [ ] No circular dependency warnings

---

### Task 3.5.12: Accessibility Audit and ARIA Implementation Review

**Objective:** Verify all accessibility requirements are met and fix any gaps.

**Estimated Time:** 30 minutes

**Dependencies:** Task 3.5.10

**File to Modify:** `src/components/ItemCapture/editors/MarkdownEditor.tsx`

#### Implementation Steps

1. Verify ARIA attributes on all elements:
   - Toolbar: `role="toolbar"`, `aria-label="Text formatting"`
   - Tab container: `role="tablist"`, `aria-label="Editor view mode"`
   - Tab buttons: `role="tab"`, `aria-selected`, `aria-controls`
   - Tab panels: `role="tabpanel"`, `aria-labelledby`
   - Textarea: `aria-label`, `aria-describedby`, `aria-invalid`
   - Character count: `aria-live="polite"`, `aria-atomic="true"`
   - Progress bar: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
   - Error message: `role="alert"`

2. Verify keyboard navigation:
   - Tab key moves between toolbar, textarea, and tabs
   - Arrow keys work within toolbar buttons
   - Keyboard shortcuts (Ctrl/Cmd+B/I/K) work

3. Verify screen reader support:
   - All icons have `aria-hidden="true"`
   - All interactive elements have accessible names
   - State changes are announced (character count, error states)

4. Verify touch targets:
   - All toolbar buttons are at least 44x44px
   - Tab buttons have adequate height

#### Accessibility Checklist

| Element | Attribute | Expected Value | Status |
|---------|-----------|----------------|--------|
| Toolbar container | role | "toolbar" | |
| Toolbar container | aria-label | "Text formatting" | |
| Toolbar button | aria-label | Format name with shortcut | |
| Toolbar button | title | Same as aria-label | |
| Tab container | role | "tablist" | |
| Tab container | aria-label | "Editor view mode" | |
| Editor tab button | role | "tab" | |
| Editor tab button | aria-selected | true/false | |
| Editor tab button | aria-controls | "editor-panel" | |
| Editor tab button | id | "editor-tab" | |
| Preview tab button | role | "tab" | |
| Preview tab button | aria-selected | true/false | |
| Preview tab button | aria-controls | "preview-panel" | |
| Preview tab button | id | "preview-tab" | |
| Editor panel | role | "tabpanel" | |
| Editor panel | aria-labelledby | "editor-tab" | |
| Editor panel | id | "editor-panel" | |
| Preview panel | role | "tabpanel" | |
| Preview panel | aria-labelledby | "preview-tab" | |
| Preview panel | id | "preview-panel" | |
| Textarea | aria-label | Configurable | |
| Textarea | aria-describedby | "char-count" | |
| Textarea | aria-invalid | true when over limit | |
| Character count | aria-live | "polite" | |
| Character count | aria-atomic | "true" | |
| Progress bar | role | "progressbar" | |
| Error message | role | "alert" | |

#### Verification Steps

- [ ] All ARIA attributes present as documented
- [ ] VoiceOver/NVDA can navigate all interactive elements
- [ ] Screen reader announces button purposes
- [ ] Screen reader announces character count changes
- [ ] Screen reader announces error when over limit
- [ ] Keyboard-only navigation works throughout component
- [ ] Focus is visible on all interactive elements
- [ ] Touch targets meet 44px minimum

---

### Task 3.5.13: Manual Testing Across Browsers and Devices

**Objective:** Verify component works correctly across target browsers and devices.

**Estimated Time:** 1 hour

**Dependencies:** Task 3.5.10

**No file modifications** - Testing task only

#### Testing Matrix

| Platform | Browser | Priority | Test Status |
|----------|---------|----------|-------------|
| iOS 16+ | Safari | High | |
| Android | Chrome | High | |
| Desktop macOS | Chrome | High | |
| Desktop macOS | Safari | Medium | |
| Desktop Windows | Chrome | High | |
| Desktop Windows | Firefox | Medium | |
| Desktop Windows | Edge | Low | |

#### Test Cases

1. **Basic Functionality**
   - [ ] Type text in editor
   - [ ] Apply all formatting (bold, italic, headings, lists, link)
   - [ ] Character count updates in real-time
   - [ ] Preview renders markdown correctly
   - [ ] Clear content and verify placeholder appears

2. **Formatting with Selection**
   - [ ] Select text and apply bold
   - [ ] Select text and apply italic
   - [ ] Select text and insert link
   - [ ] Verify cursor position after formatting

3. **Formatting without Selection**
   - [ ] Click bold with no selection
   - [ ] Verify markers inserted with cursor between
   - [ ] Type text and verify it appears between markers

4. **Keyboard Shortcuts**
   - [ ] Ctrl+B (Windows) / Cmd+B (Mac) applies bold
   - [ ] Ctrl+I (Windows) / Cmd+I (Mac) applies italic
   - [ ] Ctrl+K (Windows) / Cmd+K (Mac) inserts link

5. **Character Limit**
   - [ ] Type past warning threshold (4500) - yellow indicator
   - [ ] Type past limit (5000) - red indicator and error
   - [ ] Toolbar disabled when over limit
   - [ ] Delete text to go under limit - toolbar re-enabled

6. **Responsive Layout**
   - [ ] Mobile (<768px): Tab switcher visible, single pane
   - [ ] Desktop (>=768px): Both panes visible, tabs hidden
   - [ ] Toolbar buttons wrap correctly on narrow screens

7. **Mobile-Specific**
   - [ ] Touch toolbar buttons (44px targets)
   - [ ] Switch between editor and preview tabs
   - [ ] Virtual keyboard doesn't obscure editor
   - [ ] Scroll works within editor and preview

8. **Accessibility**
   - [ ] Navigate with Tab key only
   - [ ] Screen reader announces button purposes
   - [ ] Focus states visible on all elements

#### Verification Steps

- [ ] All High priority platforms tested
- [ ] All 8 test case categories pass
- [ ] No console errors during testing
- [ ] Performance is acceptable (no lag when typing)
- [ ] Document any browser-specific issues found

---

### Task 3.5.14: Write Unit Tests for MarkdownEditor

**Objective:** Create unit tests for the MarkdownEditor component.

**Estimated Time:** 1 hour

**Dependencies:** Task 3.5.10

**File to Create:** `src/components/ItemCapture/editors/__tests__/MarkdownEditor.test.tsx`

#### Implementation Steps

1. Create test file with testing-library/react

2. Test cases to implement:
   - Renders with placeholder when value is empty
   - Renders value in textarea
   - Calls onChange when typing
   - Applies bold format to selected text
   - Applies italic format to selected text
   - Inserts link format at cursor
   - Shows warning state at threshold
   - Shows error state over limit
   - Disables toolbar when disabled prop is true
   - Preview renders markdown content
   - Tab switching works on mobile
   - Keyboard shortcuts apply formatting

3. Mock react-markdown for faster tests

#### Test Structure

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '../MarkdownEditor';

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-preview">{children}</div>;
  };
});

describe('MarkdownEditor', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders textarea with placeholder when empty', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder');
    });

    it('renders value in textarea', () => {
      render(<MarkdownEditor {...defaultProps} value="Hello world" />);
      expect(screen.getByRole('textbox')).toHaveValue('Hello world');
    });
  });

  describe('onChange', () => {
    it('calls onChange when typing', async () => {
      const onChange = jest.fn();
      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);

      await userEvent.type(screen.getByRole('textbox'), 'test');
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('formatting', () => {
    it('applies bold format via toolbar button', async () => {
      // ... test implementation
    });
  });

  describe('character counter', () => {
    it('shows warning state at threshold', () => {
      render(
        <MarkdownEditor
          {...defaultProps}
          value={'a'.repeat(4500)}
          warningThreshold={4500}
        />
      );
      // Verify warning styling
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<MarkdownEditor {...defaultProps} />);
      expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label');
    });
  });
});
```

#### Verification Steps

- [ ] Test file exists at specified path
- [ ] All test cases pass: `npm test`
- [ ] Test coverage for main component logic
- [ ] No console warnings during tests
- [ ] Tests run in reasonable time (<5 seconds)

---

## Summary

| Task | Description | Est. Time | Dependencies |
|------|-------------|-----------|--------------|
| 3.5.1 | Create constants.ts with editor configuration | 30 min | None |
| 3.5.2 | Create MarkdownEditor base component with props interface | 45 min | 3.5.1 |
| 3.5.3 | Implement CharacterCounter sub-component | 30 min | 3.5.2 |
| 3.5.4 | Implement MobileTabSwitcher sub-component | 30 min | 3.5.2 |
| 3.5.5 | Implement MarkdownToolbar sub-component | 1 hr | 3.5.2 |
| 3.5.6 | Implement format application logic | 45 min | 3.5.2, 3.5.5 |
| 3.5.7 | Implement keyboard shortcuts handler | 30 min | 3.5.6 |
| 3.5.8 | Implement textarea with focus management | 30 min | 3.5.6, 3.5.7 |
| 3.5.9 | Implement preview pane with react-markdown | 30 min | 3.5.2 |
| 3.5.10 | Compose full component with responsive layout | 45 min | 3.5.3-3.5.9 |
| 3.5.11 | Update index barrel export | 15 min | 3.5.10 |
| 3.5.12 | Accessibility audit and ARIA implementation review | 30 min | 3.5.10 |
| 3.5.13 | Manual testing across browsers and devices | 1 hr | 3.5.10 |
| 3.5.14 | Write unit tests for MarkdownEditor | 1 hr | 3.5.10 |

**Total Estimated Time:** ~8.5 hours

---

## Acceptance Criteria Traceability

From REQ-045:

| Acceptance Criteria | Covered By Task(s) |
|--------------------|-------------------|
| Toolbar buttons are keyboard-navigable and announce their function to screen readers | 3.5.5, 3.5.12 |
| Common formatting operations can be triggered via keyboard shortcuts | 3.5.7 |
| On mobile viewports, the toolbar repositions or collapses | 3.5.5, 3.5.10 |
| Preview pane renders markdown content | 3.5.9 |
| Users can toggle between edit and preview modes | 3.5.4, 3.5.10 |
| Formatting buttons update the editor content correctly when text is selected | 3.5.6 |
| The editor maintains focus and cursor position after formatting operations | 3.5.6, 3.5.8 |

---

## References

- Overview Document: `/docs/REQ-045-create-markdowneditor-component-overview.md`
- Implementation Plan: `/docs/prd/item-capture-implementation-plan.md`
- Request: REQ-045 in `/docs/gen_requests.md`
- Accessibility Patterns: `src/components/TimeRangeSelector.tsx`
- Existing Component: `src/components/ItemCapture/editors/ImageCropper.tsx`
