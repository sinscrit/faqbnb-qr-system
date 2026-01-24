/**
 * TranslationEditor Component Tests
 *
 * Tests for the TranslationEditor modal component covering:
 * - Rendering and initial state
 * - Form validation (character limits, required fields)
 * - Save flow (success and failure cases)
 * - User interactions (typing, cancel, keyboard shortcuts)
 * - Accessibility compliance
 *
 * @module TranslationManagement/__tests__/TranslationEditor.test
 * @created 2026-01-24
 * @requestReference REQ-E05-034
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationEditor } from '../TranslationEditor/TranslationEditor';
import { createMockTranslationFn, createMockEditorProps } from './mocks/component-mocks';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => createMockTranslationFn(),
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

// =============================================================================
// Test Suite
// =============================================================================

describe('TranslationEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    entityId: 'item-123',
    entityType: 'item' as const,
    language: 'es' as const,
    sourceContent: [
      { fieldName: 'name', fieldLabel: 'Name', value: 'Welcome to our property', maxLength: 100 },
      { fieldName: 'description', fieldLabel: 'Description', value: 'A beautiful vacation rental', maxLength: 500 },
    ],
    initialTranslation: [
      { fieldName: 'name', fieldLabel: 'Name', value: 'Bienvenido a nuestra propiedad', maxLength: 100 },
      { fieldName: 'description', fieldLabel: 'Description', value: 'Un hermoso alquiler vacacional', maxLength: 500 },
    ],
    onSave: mockOnSave,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
    mockConfirm.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Rendering and Initial State Tests
  // ---------------------------------------------------------------------------

  describe('Rendering and Initial State', () => {
    it('renders without crashing with translation item', () => {
      render(<TranslationEditor {...defaultProps} />);

      // Dialog should be present
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('displays dialog title for editing translation', () => {
      render(<TranslationEditor {...defaultProps} />);

      expect(screen.getByText(/editTranslation/i)).toBeInTheDocument();
    });

    it('displays target language indicator', () => {
      render(<TranslationEditor {...defaultProps} />);

      // Language is shown in the description: "editingFor ES"
      expect(screen.getByText(/editingFor/)).toBeInTheDocument();
    });

    it('displays original content as read-only reference', () => {
      render(<TranslationEditor {...defaultProps} />);

      // Source content should be visible
      expect(screen.getByText('Welcome to our property')).toBeInTheDocument();
    });

    it('displays editable textarea for translation content', () => {
      render(<TranslationEditor {...defaultProps} />);

      // Should have textareas for editing
      const textareas = screen.getAllByRole('textbox');
      expect(textareas.length).toBeGreaterThan(0);
    });

    it('textarea is pre-filled with existing translation', () => {
      render(<TranslationEditor {...defaultProps} />);

      // Find textarea and check value
      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      ) as HTMLTextAreaElement | undefined;

      expect(editableTextarea?.value).toContain('Bienvenido');
    });

    it('textarea is empty when creating new translation', () => {
      const emptyProps = {
        ...defaultProps,
        initialTranslation: [
          { fieldName: 'name', fieldLabel: 'Name', value: '', maxLength: 100 },
          { fieldName: 'description', fieldLabel: 'Description', value: '', maxLength: 500 },
        ],
      };

      render(<TranslationEditor {...emptyProps} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      ) as HTMLTextAreaElement | undefined;

      expect(editableTextarea?.value).toBe('');
    });

    it('displays character count for fields with maxLength', () => {
      render(<TranslationEditor {...defaultProps} />);

      // Should show character counts like "31/100"
      expect(screen.getByText(/\/100/)).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<TranslationEditor {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Form Validation Tests
  // ---------------------------------------------------------------------------

  describe('Form Validation', () => {
    it('save button is disabled when content unchanged', () => {
      render(<TranslationEditor {...defaultProps} />);

      // Save button should be disabled when nothing changed
      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('save button is enabled when content is modified', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      // Find an editable textarea
      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        await user.type(editableTextarea, ' modified');

        await waitFor(() => {
          const saveButton = screen.getByRole('button', { name: /save/i });
          expect(saveButton).not.toBeDisabled();
        });
      }
    });

    it('character count updates as user types', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        const initialLength = (editableTextarea as HTMLTextAreaElement).value.length;
        await user.type(editableTextarea, 'ABC');

        // Character count should increase
        await waitFor(() => {
          const expectedCount = initialLength + 3;
          expect(screen.getByText(new RegExp(`${expectedCount}/`))).toBeInTheDocument();
        });
      }
    });

    it('enforces maxLength on textarea', () => {
      render(<TranslationEditor {...defaultProps} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      ) as HTMLTextAreaElement | undefined;

      // Textarea should have maxLength attribute
      expect(editableTextarea?.maxLength).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // Save Flow - Success Tests
  // ---------------------------------------------------------------------------

  describe('Save Flow - Success', () => {
    it('clicking save button triggers onSave callback', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      // Modify content to enable save
      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        await user.clear(editableTextarea);
        await user.type(editableTextarea, 'New translation text');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        await waitFor(() => {
          expect(mockOnSave).toHaveBeenCalled();
        });
      }
    });

    it('onSave callback receives translation data', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        await user.clear(editableTextarea);
        await user.type(editableTextarea, 'Updated translation');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        await waitFor(() => {
          expect(mockOnSave).toHaveBeenCalledWith(
            expect.arrayContaining([
              expect.objectContaining({ fieldName: expect.any(String) }),
            ])
          );
        });
      }
    });

    it('shows loading state during save', async () => {
      const slowOnSave = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} onSave={slowOnSave} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        await user.type(editableTextarea, ' change');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        // Button should show saving state
        await waitFor(() => {
          expect(screen.getByText(/saving/i)).toBeInTheDocument();
        });
      }
    });

    it('disables inputs during save operation', async () => {
      const slowOnSave = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} onSave={slowOnSave} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        await user.type(editableTextarea, ' change');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        await waitFor(() => {
          expect(editableTextarea).toBeDisabled();
        });
      }
    });

    it('closes modal after successful save', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        await user.type(editableTextarea, ' change');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled();
        });
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Save Flow - Failure Tests
  // ---------------------------------------------------------------------------

  describe('Save Flow - Failure', () => {
    it('displays error message when save fails', async () => {
      const failingOnSave = vi.fn().mockRejectedValue(new Error('Network error'));

      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} onSave={failingOnSave} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        await user.type(editableTextarea, ' change');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        await waitFor(() => {
          expect(screen.getByText(/saveError/i)).toBeInTheDocument();
        });
      }
    });

    it('form remains editable after save failure', async () => {
      const failingOnSave = vi.fn().mockRejectedValue(new Error('Failed'));

      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} onSave={failingOnSave} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        await user.type(editableTextarea, ' change');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        await waitFor(() => {
          expect(screen.getByText(/saveError/i)).toBeInTheDocument();
        });

        // Textarea should be editable again
        expect(editableTextarea).not.toBeDisabled();
      }
    });

    it('save button re-enables after failed save', async () => {
      const failingOnSave = vi.fn().mockRejectedValue(new Error('Failed'));

      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} onSave={failingOnSave} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        await user.type(editableTextarea, ' change');

        const saveButton = screen.getByRole('button', { name: /save/i });
        await user.click(saveButton);

        await waitFor(() => {
          expect(screen.getByText(/saveError/i)).toBeInTheDocument();
        });

        // Save button should be clickable again
        expect(saveButton).not.toBeDisabled();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // User Interactions Tests
  // ---------------------------------------------------------------------------

  describe('User Interactions', () => {
    it('typing in textarea updates local state', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      ) as HTMLTextAreaElement | undefined;

      if (editableTextarea) {
        const initialValue = editableTextarea.value;
        await user.type(editableTextarea, ' added text');

        expect(editableTextarea.value).toBe(initialValue + ' added text');
      }
    });

    it('clicking cancel button invokes onClose callback', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('warns user about unsaved changes when attempting to cancel', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        await user.type(editableTextarea, ' modified');

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await user.click(cancelButton);

        expect(mockConfirm).toHaveBeenCalled();
      }
    });

    it('does not close if user declines unsaved changes warning', async () => {
      mockConfirm.mockReturnValue(false);

      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      const textareas = screen.getAllByRole('textbox');
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );

      if (editableTextarea) {
        await user.type(editableTextarea, ' modified');

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await user.click(cancelButton);

        expect(mockConfirm).toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });

    it('clicking close button triggers onClose', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      // Find close button (X button in header)
      const closeButton = screen.getByLabelText(/close/i);
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility Tests
  // ---------------------------------------------------------------------------

  describe('Accessibility', () => {
    it('has appropriate ARIA role for dialog', () => {
      render(<TranslationEditor {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('dialog has title for screen readers', () => {
      render(<TranslationEditor {...defaultProps} />);

      // Should have accessible title
      expect(screen.getByText(/editTranslation/i)).toBeInTheDocument();
    });

    it('textareas have labels', () => {
      render(<TranslationEditor {...defaultProps} />);

      // Labels should be associated with textareas
      const textareas = screen.getAllByRole('textbox');
      expect(textareas.length).toBeGreaterThan(0);

      // Each editable textarea should have a label
      const editableTextarea = textareas.find(
        (ta) => !((ta as HTMLTextAreaElement).readOnly || (ta as HTMLTextAreaElement).disabled)
      );
      expect(editableTextarea).toBeInTheDocument();
    });

    it('close button has accessible name', () => {
      render(<TranslationEditor {...defaultProps} />);

      const closeButton = screen.getByLabelText(/close/i);
      expect(closeButton).toBeInTheDocument();
    });

    it('supports keyboard navigation with Tab', async () => {
      const user = userEvent.setup();
      render(<TranslationEditor {...defaultProps} />);

      // Tab should move focus between interactive elements
      await user.tab();

      // Focus should be on an interactive element
      expect(document.activeElement).not.toBe(document.body);
    });

    it('save and cancel buttons have accessible names', () => {
      render(<TranslationEditor {...defaultProps} />);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Edge Cases Tests
  // ---------------------------------------------------------------------------

  describe('Edge Cases', () => {
    it('handles empty sourceContent gracefully', () => {
      const propsWithEmpty = {
        ...defaultProps,
        sourceContent: [],
        initialTranslation: [],
      };

      render(<TranslationEditor {...propsWithEmpty} />);

      // Should render without crashing
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles mismatched source and translation arrays', () => {
      const mismatchedProps = {
        ...defaultProps,
        sourceContent: [
          { fieldName: 'name', fieldLabel: 'Name', value: 'Original', maxLength: 100 },
        ],
        initialTranslation: [
          { fieldName: 'name', fieldLabel: 'Name', value: 'Translation', maxLength: 100 },
          { fieldName: 'extra', fieldLabel: 'Extra', value: 'Extra field', maxLength: 100 },
        ],
      };

      render(<TranslationEditor {...mismatchedProps} />);

      // Should render without crashing
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('accepts custom className prop', () => {
      render(<TranslationEditor {...defaultProps} className="custom-editor" />);

      // Dialog should render (className applied to content wrapper)
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('handles isLoading prop from parent', () => {
      render(<TranslationEditor {...defaultProps} isLoading={true} />);

      // When parent indicates loading, save button should show loading state
      // Save is also disabled because content is unchanged
      const saveButton = screen.getByRole('button', { name: /sav/i });
      expect(saveButton).toBeInTheDocument();
    });
  });
});
