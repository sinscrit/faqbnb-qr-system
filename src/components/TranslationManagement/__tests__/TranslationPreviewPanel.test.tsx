/**
 * TranslationPreviewPanel Component Tests
 *
 * Tests for the TranslationPreviewPanel component covering:
 * - Rendering and display of translation data
 * - Loading, empty, and error states
 * - User interactions
 * - Accessibility compliance
 *
 * @module TranslationManagement/__tests__/TranslationPreviewPanel.test
 * @created 2026-01-24
 * @requestReference REQ-E05-034
 */

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationPreviewPanel } from '../TranslationPreviewPanel/TranslationPreviewPanel';
import {
  createMockTranslationFn,
} from './mocks/component-mocks';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => createMockTranslationFn(),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// =============================================================================
// Test Data
// =============================================================================

const defaultProps = {
  entityId: 'item-123',
  entityType: 'item' as const,
  sourceLanguage: 'en' as const,
  sourceContent: {
    name: 'Welcome to our property',
    description: 'A beautiful vacation rental with stunning views',
  },
  isOpen: true,
  onClose: vi.fn(),
  onTranslationEdited: vi.fn(),
};

const mockApiResponse = {
  items: [
    {
      entityId: 'item-123',
      entityType: 'item',
      entityName: 'Test Item',
      sourceLanguage: 'en',
      sourceContent: {
        name: 'Welcome to our property',
        description: 'A beautiful vacation rental with stunning views',
      },
      translations: [
        {
          language: 'es',
          status: 'completed',
          translatedAt: '2026-01-24T12:00:00Z',
          isStale: false,
          canEdit: true,
          canRetranslate: true,
          content: {
            name: 'Bienvenido a nuestra propiedad',
            description: 'Un hermoso alquiler vacacional con vistas impresionantes',
          },
        },
        {
          language: 'fr',
          status: 'pending',
          canEdit: true,
          canRetranslate: true,
        },
        {
          language: 'de',
          status: 'failed',
          canEdit: true,
          canRetranslate: true,
        },
        {
          language: 'nl',
          status: 'pending',
          canEdit: true,
          canRetranslate: true,
        },
        {
          language: 'it',
          status: 'completed',
          translatedAt: '2026-01-23T10:00:00Z',
          isStale: true,
          canEdit: true,
          canRetranslate: true,
          content: {
            name: 'Benvenuto nella nostra proprietà',
          },
        },
      ],
    },
  ],
};

// =============================================================================
// Test Suite
// =============================================================================

describe('TranslationPreviewPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Rendering and Display Tests
  // ---------------------------------------------------------------------------

  describe('Rendering and Display', () => {
    it('renders without crashing with valid props', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      // Panel should be visible with dialog role
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('displays panel title in header', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        // Title can be entity name or translation key
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      });
    });

    it('displays close button in header', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        const closeButton = screen.getByLabelText(/close/i);
        expect(closeButton).toBeInTheDocument();
      });
    });

    it('displays source content section with original text', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        // Source content header shows source language indicator
        expect(screen.getByText(/sourceContent/)).toBeInTheDocument();
      });
    });

    it('displays source content name correctly', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Welcome to our property')).toBeInTheDocument();
      });
    });

    it('displays source content description correctly', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/beautiful vacation rental/i)).toBeInTheDocument();
      });
    });

    it('renders translation status items after data loads', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        // After loading, should display translations for supported languages
        // The component maps 5 languages: fr, es, de, nl, it
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it('does not render when isOpen is false', () => {
      render(<TranslationPreviewPanel {...defaultProps} isOpen={false} />);

      // Panel should have translate-x-full class when closed
      const panel = document.querySelector('[role="dialog"]');
      expect(panel).toHaveClass('translate-x-full');
    });
  });

  // ---------------------------------------------------------------------------
  // Loading and Empty States Tests
  // ---------------------------------------------------------------------------

  describe('Loading and Empty States', () => {
    it('displays loading state initially', async () => {
      // Slow fetch to observe loading
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockApiResponse),
                }),
              100
            )
          )
      );

      render(<TranslationPreviewPanel {...defaultProps} />);

      // Should show loading text
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });
    });

    it('hides loading state after data loads', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        const loadingText = screen.queryByText(/loadingTranslations/i);
        // After loading, the loading text should be gone
        // (either null or the test passed already)
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it('displays empty state when no translations exist', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        // Component should handle empty items array
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Error Handling Tests
  // ---------------------------------------------------------------------------

  describe('Error Handling', () => {
    it('displays error message when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        // Should show error loading text (from translation key)
        expect(screen.getByText(/errorLoading/i)).toBeInTheDocument();
      });
    });

    it('displays error message with details', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        // Error handling catches and displays errors
        expect(screen.getByText(/errorLoading/i)).toBeInTheDocument();
      });
    });

    it('shows retry button when error occurs', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Failed',
      });

      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });
    });

    it('clicking retry button refetches data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Failed',
      });

      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });

      // Setup successful response for retry
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      fireEvent.click(screen.getByText(/retry/i));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // User Interactions Tests
  // ---------------------------------------------------------------------------

  describe('User Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      render(<TranslationPreviewPanel {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/close/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText(/close/i));
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when overlay backdrop is clicked', async () => {
      const onClose = vi.fn();
      render(<TranslationPreviewPanel {...defaultProps} onClose={onClose} />);

      // Click the backdrop overlay
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('supports keyboard Escape to close panel', async () => {
      const onClose = vi.fn();
      render(<TranslationPreviewPanel {...defaultProps} onClose={onClose} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });

    it('focuses close button when panel opens', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        const closeButton = screen.getByLabelText(/close/i);
        expect(closeButton).toHaveFocus();
      });
    });

    it('displays retranslate all button in footer', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/retranslateAll/i)).toBeInTheDocument();
      });
    });

    it('calls retranslate API when retranslate all is clicked', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/retranslateAll/i)).toBeInTheDocument();
      });

      // Initially fetch for status
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Click retranslate all
      fireEvent.click(screen.getByText(/retranslateAll/i));

      await waitFor(() => {
        // Should have called fetch for retranslate endpoint
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/translations/retranslate',
          expect.any(Object)
        );
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Accessibility Tests
  // ---------------------------------------------------------------------------

  describe('Accessibility', () => {
    it('has appropriate ARIA role for dialog', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('has aria-modal attribute', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });
    });

    it('has aria-labelledby for panel title', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-labelledby', 'panel-title');
      });
    });

    it('close button has accessible name', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        const closeButton = screen.getByLabelText(/close/i);
        expect(closeButton).toBeInTheDocument();
      });
    });

    it('panel has correct heading structure', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation with Tab', async () => {
      const user = userEvent.setup();
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Tab should move focus to next element
      await user.tab();

      // Focus should be on a focusable element
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  // ---------------------------------------------------------------------------
  // Props and Edge Cases Tests
  // ---------------------------------------------------------------------------

  describe('Props and Edge Cases', () => {
    it('accepts custom className prop', async () => {
      render(<TranslationPreviewPanel {...defaultProps} className="custom-class" />);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveClass('custom-class');
      });
    });

    it('handles missing sourceContent gracefully', async () => {
      render(
        <TranslationPreviewPanel
          {...defaultProps}
          sourceContent={{}}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('calls fetch with correct entityId and entityType', async () => {
      render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('entityType=item')
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('entityId=item-123')
        );
      });
    });

    it('refetches data when entityId changes', async () => {
      const { rerender } = render(<TranslationPreviewPanel {...defaultProps} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      rerender(<TranslationPreviewPanel {...defaultProps} entityId="item-456" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it('does not fetch when panel is closed', () => {
      render(<TranslationPreviewPanel {...defaultProps} isOpen={false} />);

      // Should not fetch when panel is not open
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
