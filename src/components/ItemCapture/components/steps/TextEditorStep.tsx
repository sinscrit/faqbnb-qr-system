'use client';

/**
 * TextEditorStep Component
 *
 * Wizard step component for writing text-based instructions within the
 * Item Capture workflow. Provides a markdown editor with formatting toolbar,
 * live preview, and character counter.
 *
 * Features:
 * - Markdown formatting toolbar (bold, italic, headings, lists, links)
 * - Live markdown preview using react-markdown
 * - Responsive layout (side-by-side on desktop, tabs on mobile)
 * - Character counter with limit enforcement
 * - Keyboard shortcuts for common formatting
 * - Debounced auto-save to state
 * - Full accessibility support
 *
 * @module ItemCapture/components/steps/TextEditorStep
 * @see docs/REQ-044-implement-texteditorstep-detailed.md
 * @lastModified 2025-12-31 (REQ-044)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TEXT_EDITOR_CONSTRAINTS,
  MARKDOWN_FORMATS,
  type MarkdownFormatKey,
} from '../../utils/constants';
import type { ItemCaptureState, WizardStep } from '../../ItemCapture.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for TextEditorStep component.
 */
export interface TextEditorStepProps {
  /** Current wizard state */
  state: ItemCaptureState;
  /** Callback to set instructions text */
  setInstructions: (text: string) => void;
  /** Callback to navigate to a specific step */
  goToStep: (step: WizardStep) => void;
  /** Callback to go to previous step */
  prevStep: () => void;
  /** Optional CSS class name for the root element */
  className?: string;
}

// =============================================================================
// Toolbar Configuration
// =============================================================================

/**
 * Configuration for toolbar buttons.
 */
interface ToolbarButtonConfig {
  icon: React.ComponentType<{ className?: string }>;
  format: MarkdownFormatKey;
  ariaLabel: string;
}

/**
 * Toolbar button definitions.
 */
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

// =============================================================================
// Subcomponents
// =============================================================================

/**
 * MarkdownToolbar provides formatting buttons for the editor.
 */
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

/**
 * CharacterCounter shows current character count with progress bar.
 */
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

/**
 * TabSwitcher provides mobile navigation between editor and preview.
 */
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

// =============================================================================
// Main Component
// =============================================================================

/**
 * TextEditorStep provides markdown text editing within the wizard.
 *
 * Features:
 * - Markdown formatting toolbar with 8 format buttons
 * - Live preview using react-markdown
 * - Responsive layout (tabs on mobile, side-by-side on desktop)
 * - Character counter with warning and error states
 * - Keyboard shortcuts (Ctrl/Cmd + B, I, K)
 * - Debounced auto-save to parent state
 *
 * @example
 * ```tsx
 * <TextEditorStep
 *   state={wizardState}
 *   setInstructions={handleSetInstructions}
 *   goToStep={handleGoToStep}
 *   prevStep={handlePrevStep}
 * />
 * ```
 */
export function TextEditorStep({
  state,
  setInstructions,
  goToStep,
  prevStep,
  className,
}: TextEditorStepProps) {
  // ===========================================================================
  // Local State
  // ===========================================================================

  const [localContent, setLocalContent] = useState(state.instructions || '');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ===========================================================================
  // Computed Values
  // ===========================================================================

  const characterCount = localContent.length;
  const isOverLimit = characterCount > TEXT_EDITOR_CONSTRAINTS.maxLength;
  const isSaving = localContent !== state.instructions;

  // ===========================================================================
  // Auto-Save Effect with Debouncing
  // ===========================================================================

  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      if (localContent !== state.instructions) {
        setInstructions(localContent);
      }
    }, TEXT_EDITOR_CONSTRAINTS.autoSaveDelay);

    // Cleanup on unmount or when localContent changes
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [localContent, state.instructions, setInstructions]);

  // Immediate save on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (localContent !== state.instructions) {
        setInstructions(localContent);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===========================================================================
  // Format Application
  // ===========================================================================

  const applyFormat = useCallback(
    (format: MarkdownFormatKey) => {
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
    },
    [localContent]
  );

  // ===========================================================================
  // Keyboard Shortcuts
  // ===========================================================================

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Detect Mac vs Windows/Linux for modifier key
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
    [applyFormat]
  );

  // ===========================================================================
  // Content Change Handler
  // ===========================================================================

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  };

  // ===========================================================================
  // Navigation Handlers
  // ===========================================================================

  const handleContinue = useCallback(() => {
    // Save any pending content
    if (localContent !== state.instructions) {
      setInstructions(localContent);
    }
    goToStep('add-more');
  }, [localContent, state.instructions, setInstructions, goToStep]);

  const handleBack = useCallback(() => {
    // Save any pending content
    if (localContent !== state.instructions) {
      setInstructions(localContent);
    }
    prevStep();
  }, [localContent, state.instructions, setInstructions, prevStep]);

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Write Instructions</h2>
        <p className="text-sm text-gray-600">
          Add text-based instructions using markdown formatting
        </p>
      </div>

      {/* Mobile Tab Switcher */}
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

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
      </div>

      {/* Auto-save indicator */}
      {isSaving && (
        <div className="px-4 pb-2 text-xs text-gray-400 flex items-center gap-1">
          <span
            className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
            aria-hidden="true"
          />
          <span>Saving...</span>
        </div>
      )}

      {/* Step Navigation */}
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={isOverLimit}
            className={cn(
              'px-6 py-2 rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              isOverLimit
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : localContent.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {localContent.trim() ? 'Continue' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextEditorStep;
