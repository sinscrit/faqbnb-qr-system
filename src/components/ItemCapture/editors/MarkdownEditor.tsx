'use client';

/**
 * MarkdownEditor Component
 *
 * A reusable markdown editor with live preview, formatting toolbar, and
 * character limit visualization. Supports mobile-first responsive layout
 * with tab switching on small screens and side-by-side view on desktop.
 *
 * @module ItemCapture/editors/MarkdownEditor
 * @lastModified 2025-12-31 (REQ-045)
 */

import { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Eye,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TEXT_EDITOR_CONSTRAINTS,
  MARKDOWN_FORMATS,
  type MarkdownFormatKey,
} from '../utils/constants';

// =============================================================================
// Props Interface
// =============================================================================

export interface MarkdownEditorProps {
  /** Current editor value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Maximum character limit (default: 5000) */
  maxLength?: number;
  /** Character count threshold for warning state (default: 4500) */
  warningThreshold?: number;
  /** Placeholder text for empty editor */
  placeholder?: string;
  /** Disable editing */
  disabled?: boolean;
  /** Minimum height in pixels (default: 200) */
  minHeight?: number;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for textarea */
  ariaLabel?: string;
  /** ID of element describing the textarea */
  ariaDescribedBy?: string;
}

// =============================================================================
// Sub-component: CharacterCounter
// =============================================================================

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

// =============================================================================
// Sub-component: MobileTabSwitcher
// =============================================================================

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
        type="button"
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
        type="button"
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

// =============================================================================
// Sub-component: MarkdownToolbar
// =============================================================================

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

// =============================================================================
// Main Component: MarkdownEditor
// =============================================================================

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

  // ===========================================================================
  // Format Application Logic
  // ===========================================================================

  const applyFormat = useCallback(
    (format: MarkdownFormatKey) => {
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
        newText = value.substring(0, start) + prefix + suffix + value.substring(end);
        // Position cursor between prefix and suffix for typing
        newCursorPos = start + prefix.length;
      }

      onChange(newText);

      // Restore focus and cursor position after React re-render
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [value, onChange, disabled]
  );

  // ===========================================================================
  // Keyboard Shortcuts Handler
  // ===========================================================================

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return;

      // Detect Mac vs Windows/Linux
      const isMac =
        typeof navigator !== 'undefined' &&
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
    },
    [applyFormat, disabled]
  );

  // ===========================================================================
  // Text Change Handler
  // ===========================================================================

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Mobile Tab Switcher */}
      <MobileTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

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

          <div id="char-count">
            <CharacterCounter
              current={characterCount}
              max={maxLength}
              warning={warningThreshold}
            />
          </div>

          {isOverLimit && (
            <p className="text-red-600 text-sm mt-2" role="alert">
              Content exceeds the maximum character limit. Please shorten your
              text.
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
