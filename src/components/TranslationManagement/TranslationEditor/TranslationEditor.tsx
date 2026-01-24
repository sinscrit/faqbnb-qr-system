'use client';

/**
 * TranslationEditor Component
 *
 * Modal dialog for editing translation content with side-by-side layout showing
 * original source alongside editable translation fields. Features character
 * counting, dirty state tracking, and unsaved changes confirmation.
 *
 * @module TranslationManagement/TranslationEditor
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @created 2026-01-24
 * @requestReference REQ-E05-010
 *
 * @example
 * // Basic usage
 * const [isEditorOpen, setIsEditorOpen] = useState(false);
 *
 * const sourceContent: TranslationFieldContent[] = [
 *   { fieldName: 'name', fieldLabel: 'Name', value: 'Coffee Maker', maxLength: 100 },
 *   { fieldName: 'description', fieldLabel: 'Description', value: 'How to use...', maxLength: 500 },
 * ];
 *
 * const initialTranslation: TranslationFieldContent[] = [
 *   { fieldName: 'name', fieldLabel: 'Name', value: 'Machine à café', maxLength: 100 },
 *   { fieldName: 'description', fieldLabel: 'Description', value: 'Comment utiliser...', maxLength: 500 },
 * ];
 *
 * <TranslationEditor
 *   isOpen={isEditorOpen}
 *   onClose={() => setIsEditorOpen(false)}
 *   entityId="123"
 *   entityType="item"
 *   language="fr"
 *   sourceContent={sourceContent}
 *   initialTranslation={initialTranslation}
 *   onSave={async (fields) => {
 *     await fetch('/api/translations/update', {
 *       method: 'POST',
 *       body: JSON.stringify({ entityId: '123', language: 'fr', fields })
 *     });
 *   }}
 * />
 *
 * @example
 * // Integration with TranslationStatusItem Edit button
 * const handleEdit = (language: SupportedLanguage) => {
 *   setSelectedLanguage(language);
 *   setIsEditorOpen(true);
 * };
 */

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, Save, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Represents a single translatable field with its configuration and value.
 */
export interface TranslationFieldContent {
  /** Unique identifier for the field */
  fieldName: string;
  /** Display label for the field */
  fieldLabel: string;
  /** Current value of the field */
  value: string;
  /** Maximum character limit (optional) */
  maxLength?: number;
}

/**
 * Props for TranslationEditor component.
 *
 * @property isOpen - Controls modal visibility
 * @property onClose - Callback when modal is closed
 * @property entityId - ID of the entity being translated
 * @property entityType - Type of entity (item, article, link, tag)
 * @property language - Target language for translation
 * @property sourceContent - Original content for reference (read-only)
 * @property initialTranslation - Starting translation values
 * @property onSave - Callback with edited content when saved
 * @property isLoading - External loading state
 * @property className - Additional CSS classes
 */
export interface TranslationEditorProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  language: SupportedLanguage;
  sourceContent: TranslationFieldContent[];
  initialTranslation: TranslationFieldContent[];
  onSave: (content: TranslationFieldContent[]) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Internal state for tracking field values, dirty state, and save status.
 */
interface EditorState {
  fields: TranslationFieldContent[];
  isDirty: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// =============================================================================
// CharacterCounter Subcomponent
// =============================================================================

/**
 * Props for CharacterCounter component.
 */
interface CharacterCounterProps {
  current: number;
  max: number;
  warningThreshold?: number;
}

/**
 * Character counter with color-coded feedback based on character count.
 *
 * Color states:
 * - Gray: Below 80% of limit
 * - Amber + warning icon: 80-99% of limit
 * - Green + checkmark: Exactly at limit
 * - Red + warning icon: Over limit (shouldn't happen with maxLength)
 */
function CharacterCounter({
  current,
  max,
  warningThreshold = 0.8,
}: CharacterCounterProps) {
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
      {isAtLimit && <span className="text-green-600">✓</span>}
      {(isNearLimit || isOverLimit) && (
        <span className={cn(isOverLimit ? 'text-red-600' : 'text-amber-600')}>
          ⚠
        </span>
      )}
    </div>
  );
}

// =============================================================================
// TranslationFieldPair Subcomponent
// =============================================================================

/**
 * Props for TranslationFieldPair component.
 */
interface TranslationFieldPairProps {
  field: TranslationFieldContent;
  originalValue: string;
  translationValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Displays a single translatable field with original content on the left
 * and editable translation on the right.
 */
function TranslationFieldPair({
  field,
  originalValue,
  translationValue,
  onChange,
  disabled = false,
  className,
}: TranslationFieldPairProps) {
  const t = useTranslations('translation.editor');

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {/* Original field (left) - read-only */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('original')} - {field.fieldLabel}
        </label>
        <textarea
          value={originalValue}
          readOnly
          disabled
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none min-h-[80px]"
          rows={3}
        />
      </div>

      {/* Translation field (right) - editable */}
      <div className="space-y-2">
        <label
          htmlFor={`translation-${field.fieldName}`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('translation')} - {field.fieldLabel}
        </label>
        <textarea
          id={`translation-${field.fieldName}`}
          value={translationValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[80px]"
          rows={3}
          maxLength={field.maxLength}
        />
        {field.maxLength && (
          <CharacterCounter current={translationValue.length} max={field.maxLength} />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function TranslationEditor(props: TranslationEditorProps) {
  const {
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
  } = props;

  // Suppress unused variable warnings - these are part of the interface for future use
  void entityId;
  void entityType;

  const t = useTranslations('translation.editor');

  // Initialize editor state
  const [editorState, setEditorState] = useState<EditorState>({
    fields: initialTranslation,
    isDirty: false,
    isSubmitting: false,
    error: null,
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditorState({
        fields: initialTranslation,
        isDirty: false,
        isSubmitting: false,
        error: null,
      });
    }
  }, [isOpen, initialTranslation]);

  // Check if fields have been modified
  const checkIsDirty = useCallback(
    (currentFields: TranslationFieldContent[]) => {
      return currentFields.some(
        (field, index) => field.value !== initialTranslation[index]?.value
      );
    },
    [initialTranslation]
  );

  // Event Handlers

  /**
   * Updates a specific field value and recalculates dirty state.
   */
  const handleFieldChange = useCallback(
    (fieldName: string, value: string) => {
      setEditorState((prev) => {
        const updatedFields = prev.fields.map((field) =>
          field.fieldName === fieldName ? { ...field, value } : field
        );
        return {
          ...prev,
          fields: updatedFields,
          isDirty: checkIsDirty(updatedFields),
          error: null,
        };
      });
    },
    [checkIsDirty]
  );

  /**
   * Saves translation changes by calling parent callback. Handles loading and error states.
   */
  const handleSave = useCallback(async () => {
    if (!editorState.isDirty || editorState.isSubmitting) return;

    setEditorState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      await onSave(editorState.fields);
      onClose();
    } catch (err) {
      setEditorState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: err instanceof Error ? err.message : t('saveFailed'),
      }));
    }
  }, [
    editorState.isDirty,
    editorState.isSubmitting,
    editorState.fields,
    onSave,
    onClose,
    t,
  ]);

  /**
   * Closes the modal with confirmation prompt if there are unsaved changes.
   */
  const handleClose = useCallback(() => {
    if (editorState.isDirty) {
      const confirmClose = window.confirm(t('unsavedChangesPrompt'));
      if (!confirmClose) return;
    }
    onClose();
  }, [editorState.isDirty, onClose, t]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
            'w-full max-w-4xl max-h-[90vh] overflow-hidden',
            'bg-white dark:bg-gray-900 rounded-lg shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('editTranslation')}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('editingFor')} {language.toUpperCase()}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                onClick={handleClose}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={t('close')}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content Area */}
          <div className="overflow-y-auto px-6 py-4 space-y-6 max-h-[calc(90vh-200px)]">
            {/* Error message */}
            {editorState.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                      {t('saveError')}
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {editorState.error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Field pairs */}
            {editorState.fields.map((field) => {
              const originalField = sourceContent.find(
                (f) => f.fieldName === field.fieldName
              );
              return (
                <TranslationFieldPair
                  key={field.fieldName}
                  field={field}
                  originalValue={originalField?.value || ''}
                  translationValue={field.value}
                  onChange={(value) => handleFieldChange(field.fieldName, value)}
                  disabled={editorState.isSubmitting || isLoading}
                />
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              disabled={editorState.isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!editorState.isDirty || editorState.isSubmitting || isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(editorState.isSubmitting || isLoading) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Save className="h-4 w-4" />
              {editorState.isSubmitting || isLoading ? t('saving') : t('save')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
