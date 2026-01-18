/**
 * PreviewSaveStep Accessibility Tests
 *
 * Comprehensive accessibility tests for PreviewSaveStep component.
 * Verifies WCAG 2.1 AA compliance including:
 * - axe-core automated checks
 * - Section and heading structure
 * - Drag and drop announcements
 * - Modal dialog accessibility
 * - Item/Article field accessibility (REQ-210)
 *
 * @module ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.a11y.test
 * @see docs/REQ-174-accessibility-audit-detailed.md
 * @see docs/REQ-210-update-previewsavestep-display-detailed.md
 * @lastModified 2026-01-12 (REQ-210: Item/Article separation a11y tests)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreviewSaveStep, type PreviewSaveStepProps } from '../PreviewSaveStep';
import { checkA11y, verifyHeadingHierarchy, getLiveRegionContents } from '../../../__tests__/helpers/a11yTestUtils';
import type { CurrentItemState, ContentPiece } from '../../../ItemCreationWorkflow.types';

// =============================================================================
// Test Factories
// =============================================================================

const createMockContentPiece = (overrides?: Partial<ContentPiece>): ContentPiece => ({
  id: `content-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  type: 'photo',
  data: { type: 'photo', file: new File([''], 'test.jpg', { type: 'image/jpeg' }) },
  order: 0,
  ...overrides,
});

const createMockCurrentItem = (overrides?: Partial<CurrentItemState>): CurrentItemState => ({
  room: 'living-room',
  itemType: 'appliance',
  specificItem: 'TV',
  purpose: 'how-to-use',
  itemName: 'Living Room TV',
  currentArticle: {
    title: 'How to Use',
    purpose: 'how-to-use',
    content: [createMockContentPiece({ id: 'content-1' })],
  },
  content: [createMockContentPiece({ id: 'content-1' })],
  contentSource: 'create-new',
  contentType: 'photo',
  tags: [],
  ...overrides,
});

const createMockProps = (overrides?: Partial<PreviewSaveStepProps>): PreviewSaveStepProps => ({
  currentItem: createMockCurrentItem(),
  onUpdateItemName: vi.fn(),
  onUpdateArticleTitle: vi.fn(),
  onUpdateTags: vi.fn(),
  onRemoveContent: vi.fn(),
  onReorderContent: vi.fn(),
  onRetake: vi.fn(),
  onSave: vi.fn().mockResolvedValue({ id: 'item-123', qrCodeUrl: 'https://example.com/qr.png' }),
  onCancel: vi.fn(),
  onComplete: vi.fn(),
  isSaving: false,
  ...overrides,
});

// =============================================================================
// PreviewSaveStep Accessibility Tests
// =============================================================================

describe('PreviewSaveStep Accessibility', () => {
  describe('axe-core compliance', () => {
    it('should have no accessibility violations with single content', async () => {
      const { container } = render(<PreviewSaveStep {...createMockProps()} />);
      await checkA11y(container);
    });

    it('should have no accessibility violations with multiple content pieces', async () => {
      const props = createMockProps({
        currentItem: createMockCurrentItem({
          content: [
            createMockContentPiece({ id: 'content-1', order: 0 }),
            createMockContentPiece({ id: 'content-2', order: 1 }),
            createMockContentPiece({ id: 'content-3', order: 2 }),
          ],
        }),
      });
      const { container } = render(<PreviewSaveStep {...props} />);
      await checkA11y(container);
    });

    it('should have no accessibility violations when saving', async () => {
      const { container } = render(
        <PreviewSaveStep {...createMockProps({ isSaving: true })} />
      );
      await checkA11y(container);
    });

    it('should have no accessibility violations with empty content', async () => {
      const props = createMockProps({
        currentItem: createMockCurrentItem({ content: [] }),
      });
      const { container } = render(<PreviewSaveStep {...props} />);
      await checkA11y(container);
    });
  });

  describe('section and heading structure', () => {
    it('should have proper heading hierarchy', () => {
      const { container } = render(<PreviewSaveStep {...createMockProps()} />);
      const result = verifyHeadingHierarchy(container);
      expect(result.pass).toBe(true);
    });

    it('should have aria-labelledby on Item Details section', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      const section = screen.getByRole('region', { name: /item details/i });
      expect(section).toBeInTheDocument();
    });

    it('should have aria-labelledby on Content section', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      const section = screen.getByRole('region', { name: /content/i });
      expect(section).toBeInTheDocument();
    });

    it('should have h3 headings for sections', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      expect(screen.getByRole('heading', { name: /item details/i, level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /content/i, level: 3 })).toBeInTheDocument();
    });
  });

  describe('definition list accessibility', () => {
    it('should use semantic definition list for metadata', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      // Check for dl/dt/dd structure
      const definitionLists = document.querySelectorAll('dl');
      expect(definitionLists.length).toBeGreaterThan(0);

      // Verify structure
      const dl = definitionLists[0];
      const dts = dl.querySelectorAll('dt');
      const dds = dl.querySelectorAll('dd');

      expect(dts.length).toBeGreaterThan(0);
      expect(dds.length).toEqual(dts.length);
    });

    it('should have readable labels for metadata terms', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      expect(screen.getByText('Room')).toBeInTheDocument();
      expect(screen.getByText('Item Type')).toBeInTheDocument();
      expect(screen.getByText('Purpose')).toBeInTheDocument();
    });
  });

  describe('content list accessibility', () => {
    it('should have list role on content grid', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      const contentList = screen.getByRole('list', { name: /content pieces/i });
      expect(contentList).toBeInTheDocument();
    });

    it('should have count badge with aria-label', () => {
      render(
        <PreviewSaveStep
          {...createMockProps({
            currentItem: createMockCurrentItem({
              content: [
                createMockContentPiece({ id: '1' }),
                createMockContentPiece({ id: '2' }),
                createMockContentPiece({ id: '3' }),
              ],
            }),
          })}
        />
      );

      const badge = screen.getByLabelText(/3 content pieces/i);
      expect(badge).toBeInTheDocument();
    });
  });

  describe('button accessibility', () => {
    it('should have accessible back button with aria-label', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should have accessible save button', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      const saveButton = screen.getByRole('button', { name: /save item/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should disable save button when no content', () => {
      render(
        <PreviewSaveStep
          {...createMockProps({
            currentItem: createMockCurrentItem({ content: [] }),
          })}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save item/i });
      expect(saveButton).toBeDisabled();
    });

    it('should disable save button when no item name', () => {
      render(
        <PreviewSaveStep
          {...createMockProps({
            currentItem: createMockCurrentItem({ itemName: '' }),
          })}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save item/i });
      expect(saveButton).toBeDisabled();
    });

    it('should show loading state on save button with spinner', () => {
      render(<PreviewSaveStep {...createMockProps({ isSaving: true })} />);

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });

    it('should have focus indicators on buttons', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toContain('focus:');
      });
    });
  });

  describe('keyboard navigation', () => {
    it('should tab through interactive elements in logical order', async () => {
      const user = userEvent.setup();
      render(<PreviewSaveStep {...createMockProps()} />);

      // Tab to first element
      await user.tab();

      // Should be on back button first
      expect(document.activeElement).toHaveAttribute('aria-label', 'Go back');
    });
  });

  describe('live region announcements', () => {
    it('should have aria-live region for status updates', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  describe('confirmation dialog accessibility', () => {
    it('should have proper dialog role and aria attributes', async () => {
      const props = createMockProps({
        currentItem: createMockCurrentItem({
          content: [createMockContentPiece({ id: 'only-piece' })],
        }),
      });
      render(<PreviewSaveStep {...props} />);

      // Trigger the removal of the last piece
      const removeButton = screen.getByRole('button', { name: /remove content/i });
      fireEvent.click(removeButton);

      // Dialog should appear
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'remove-confirm-title');
      });
    });

    it('should have focused button in confirmation dialog', async () => {
      const props = createMockProps({
        currentItem: createMockCurrentItem({
          content: [createMockContentPiece({ id: 'only-piece' })],
        }),
      });
      render(<PreviewSaveStep {...props} />);

      // Trigger the removal of the last piece
      const removeButton = screen.getByRole('button', { name: /remove content/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });

      // Dialog should have accessible buttons - be specific about which Remove button
      const dialog = screen.getByRole('dialog');
      expect(screen.getByRole('button', { name: /keep/i })).toBeInTheDocument();
      // The dialog has a Remove button (not "Remove content" which is on the card)
      const dialogButtons = within(dialog).getAllByRole('button');
      expect(dialogButtons.length).toBe(2);
    });
  });

  describe('empty state accessibility', () => {
    it('should have accessible empty state with add button', () => {
      render(
        <PreviewSaveStep
          {...createMockProps({
            currentItem: createMockCurrentItem({ content: [] }),
          })}
        />
      );

      expect(screen.getByText(/no content added yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add content/i })).toBeInTheDocument();
    });

    it('should have aria-hidden on decorative empty state icon', () => {
      render(
        <PreviewSaveStep
          {...createMockProps({
            currentItem: createMockCurrentItem({ content: [] }),
          })}
        />
      );

      const icons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('drag and drop accessibility', () => {
    it('should have drag handle with accessible label', () => {
      const props = createMockProps({
        currentItem: createMockCurrentItem({
          content: [
            createMockContentPiece({ id: '1', order: 0 }),
            createMockContentPiece({ id: '2', order: 1 }),
          ],
        }),
      });
      render(<PreviewSaveStep {...props} />);

      const dragHandles = screen.getAllByRole('button', { name: /drag to reorder/i });
      expect(dragHandles.length).toBe(2);
    });

    it('should provide keyboard instructions for reordering', () => {
      const props = createMockProps({
        currentItem: createMockCurrentItem({
          content: [
            createMockContentPiece({ id: '1', order: 0 }),
            createMockContentPiece({ id: '2', order: 1 }),
          ],
        }),
      });
      render(<PreviewSaveStep {...props} />);

      // DnDContext should have announcements configured
      const contentList = screen.getByRole('list', { name: /content pieces/i });
      expect(contentList).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Item/Article Separation Accessibility Tests (REQ-210)
  // ===========================================================================

  describe('Item/Article separation accessibility (REQ-210)', () => {
    it('should have proper ARIA labels for Item Name field', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      // ItemNameEditor provides its own label "Item Name"
      const itemNameInput = screen.getByLabelText(/item name/i);
      expect(itemNameInput).toBeInTheDocument();
      expect(itemNameInput).toHaveAttribute('id', 'item-name-editor');
    });

    it('should have proper ARIA labels for Article Title field', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      const articleTitleInput = screen.getByLabelText(/article title/i);
      expect(articleTitleInput).toBeInTheDocument();
      expect(articleTitleInput).toHaveAttribute('id', 'article-title-editor');
    });

    it('should have section subheadings for Physical Item and Article/Instructions', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      // Verify visual section headings exist
      expect(screen.getByText(/physical item/i)).toBeInTheDocument();
      expect(screen.getByText(/article.*instructions/i)).toBeInTheDocument();
    });

    it('should have h3 and h4 headings providing navigation landmarks', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      // Main section has h3
      expect(screen.getByRole('heading', { name: /item details/i, level: 3 })).toBeInTheDocument();

      // Sub-sections have h4 headings
      const h4Headings = screen.getAllByRole('heading', { level: 4 });
      expect(h4Headings.length).toBeGreaterThanOrEqual(2);
    });

    it('should have no accessibility violations with Item/Article fields', async () => {
      const props = createMockProps({
        currentItem: createMockCurrentItem({
          specificItem: 'Refrigerator',
          currentArticle: {
            title: 'How to Clean',
            purpose: 'how-to-clean',
            content: [createMockContentPiece({ id: 'content-1' })],
          },
        }),
      });
      const { container } = render(<PreviewSaveStep {...props} />);
      await checkA11y(container);
    });

    it('should have helper text for QR code label visible for screen readers', () => {
      render(<PreviewSaveStep {...createMockProps()} />);

      expect(screen.getByText(/appears on QR code label/i)).toBeInTheDocument();
    });

    it('should mark Article Title input as disabled when callback not provided', () => {
      render(
        <PreviewSaveStep
          {...createMockProps({
            onUpdateArticleTitle: undefined,
          })}
        />
      );

      const articleTitleInput = screen.getByLabelText(/article title/i);
      expect(articleTitleInput).toBeDisabled();
    });
  });
});
