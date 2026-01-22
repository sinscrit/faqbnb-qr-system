'use client';

/**
 * MarkdownEditor Component
 *
 * A reusable markdown editor with live preview, formatting toolbar, and
 * character limit visualization. Supports mobile-first responsive layout
 * with tab switching on small screens and side-by-side view on desktop.
 *
 * @module ItemCapture/editors/MarkdownEditor
 * @lastModified 2026-01-22 (REQ-E02-071 - L10N)
 */

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
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
  t: ReturnType<typeof useTranslations<'articles.editor'>>;
}

function CharacterCounter({ current, max, warning, t }: CharacterCounterProps) {
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
        {t('characterCount', { current, max })}
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
  t: ReturnType<typeof useTranslations<'articles.editor'>>;
}

function MobileTabSwitcher({ activeTab, onTabChange, t }: MobileTabSwitcherProps) {
  return (
    <div
      className="flex border-b border-gray-200 md:hidden"
      role="tablist"
      aria-label={t('aria.viewMode')}
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
        {t('tabs.edit')}
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
        {t('tabs.preview')}
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
  labelKey: string;
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { icon: Bold, format: 'bold', labelKey: 'toolbar.boldShortcut' },
  { icon: Italic, format: 'italic', labelKey: 'toolbar.italicShortcut' },
  { icon: Heading1, format: 'heading1', labelKey: 'formatting.heading1' },
  { icon: Heading2, format: 'heading2', labelKey: 'formatting.heading2' },
  { icon: Heading3, format: 'heading3', labelKey: 'formatting.heading3' },
  { icon: List, format: 'bulletList', labelKey: 'formatting.list' },
  { icon: ListOrdered, format: 'numberedList', labelKey: 'formatting.orderedList' },
  { icon: LinkIcon, format: 'link', labelKey: 'toolbar.linkShortcut' },
];

interface MarkdownToolbarProps {
  onFormat: (format: MarkdownFormatKey) => void;
  disabled?: boolean;
  t: ReturnType<typeof useTranslations<'articles.editor'>>;
}

function MarkdownToolbar({ onFormat, disabled, t }: MarkdownToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1 p-2',
        'border-b border-gray-200 bg-gray-50 rounded-t-lg',
        'md:gap-2'
      )}
      role="toolbar"
      aria-label={t('aria.toolbar')}
    >
      {TOOLBAR_BUTTONS.map(({ icon: Icon, format, labelKey }) => {
        const label = t(labelKey as Parameters<typeof t>[0]);
        return (
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
            aria-label={label}
            title={label}
          >
            <Icon className="w-4 h-4 text-gray-700" />
          </button>
        );
      })}
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
  placeholder,
  disabled = false,
  minHeight = TEXT_EDITOR_CONSTRAINTS.minHeight,
  className,
  ariaLabel,
  ariaDescribedBy,
}: MarkdownEditorProps) {
  const t = useTranslations('articles.editor');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use translated defaults if not provided
  const resolvedPlaceholder = placeholder ?? t('placeholder');
  const resolvedAriaLabel = ariaLabel ?? t('aria.editor');

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
      <MobileTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} t={t} />

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
            t={t}
          />

          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={resolvedPlaceholder}
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
            aria-label={resolvedAriaLabel}
            aria-describedby={ariaDescribedBy || 'char-count'}
            aria-invalid={isOverLimit}
          />

          <div id="char-count">
            <CharacterCounter
              current={characterCount}
              max={maxLength}
              warning={warningThreshold}
              t={t}
            />
          </div>

          {isOverLimit && (
            <p className="text-red-600 text-sm mt-2" role="alert">
              {t('characterError')}
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
            <span>{t('preview')}</span>
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
                {t('previewPlaceholder')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
