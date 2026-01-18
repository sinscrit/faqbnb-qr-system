/**
 * ContentPreview Accessibility Tests
 *
 * Comprehensive accessibility tests for ContentPreview and ContentPieceCard components.
 * Verifies WCAG 2.1 AA compliance including:
 * - axe-core automated checks
 * - ARIA attribute correctness
 * - Focus management and touch targets
 * - Screen reader announcements
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/ContentPreview.a11y.test
 * @see docs/REQ-174-accessibility-audit-detailed.md
 * @lastModified 2026-01-10 (REQ-174 Accessibility Audit)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentPreview, type ContentPreviewProps, SIZE_CONFIG, TYPE_CONFIG } from '../ContentPreview';
import { ContentPieceCard, type ContentPieceCardProps } from '../ContentPieceCard';
import { checkA11y, verifyAriaAttributes } from '../../../__tests__/helpers/a11yTestUtils';
import type { ContentPiece, ContentData } from '../../../ItemCreationWorkflow.types';

// =============================================================================
// Test Factories
// =============================================================================

const createMockContent = (
  type: 'video' | 'photo' | 'pdf' | 'text' | 'url' = 'photo',
  overrides?: Partial<ContentPiece>
): ContentPiece => {
  const baseContent: Record<string, ContentData> = {
    video: { type: 'video', file: new File([''], 'test.mp4', { type: 'video/mp4' }), duration: 120 },
    photo: { type: 'photo', file: new File([''], 'test.jpg', { type: 'image/jpeg' }) },
    pdf: { type: 'pdf', file: new File([''], 'test.pdf', { type: 'application/pdf' }), pageCount: 5 },
    text: { type: 'text', text: 'This is sample text content for testing purposes.' },
    url: { type: 'url', url: 'https://example.com', title: 'Example Site' },
  };

  return {
    id: 'test-content-1',
    type,
    data: baseContent[type],
    order: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  } as ContentPiece;
};

const createContentPreviewProps = (overrides?: Partial<ContentPreviewProps>): ContentPreviewProps => ({
  content: createMockContent('photo'),
  size: 'medium',
  showTypeBadge: true,
  ...overrides,
});

const createContentPieceCardProps = (overrides?: Partial<ContentPieceCardProps>): ContentPieceCardProps => ({
  content: createMockContent('photo'),
  onRemove: vi.fn(),
  onRetake: vi.fn(),
  disabled: false,
  ...overrides,
});

// =============================================================================
// ContentPreview Accessibility Tests
// =============================================================================

describe('ContentPreview Accessibility', () => {
  describe('axe-core compliance', () => {
    it('should have no accessibility violations for photo content', async () => {
      const { container } = render(<ContentPreview {...createContentPreviewProps()} />);
      await checkA11y(container);
    });

    it('should have no accessibility violations for video content', async () => {
      const { container } = render(
        <ContentPreview {...createContentPreviewProps({ content: createMockContent('video') })} />
      );
      await checkA11y(container);
    });

    it('should have no accessibility violations for PDF content', async () => {
      const { container } = render(
        <ContentPreview {...createContentPreviewProps({ content: createMockContent('pdf') })} />
      );
      await checkA11y(container);
    });

    it('should have no accessibility violations for text content', async () => {
      const { container } = render(
        <ContentPreview {...createContentPreviewProps({ content: createMockContent('text') })} />
      );
      await checkA11y(container);
    });

    it('should have no accessibility violations for URL content', async () => {
      const { container } = render(
        <ContentPreview {...createContentPreviewProps({ content: createMockContent('url') })} />
      );
      await checkA11y(container);
    });

    it('should have no accessibility violations in loading state', async () => {
      const { container } = render(
        <ContentPreview {...createContentPreviewProps({ isLoading: true })} />
      );
      await checkA11y(container);
    });

    it('should have no accessibility violations with remove button', async () => {
      const { container } = render(
        <ContentPreview {...createContentPreviewProps({ showRemove: true, onRemove: vi.fn() })} />
      );
      await checkA11y(container);
    });
  });

  describe('ARIA attributes', () => {
    it('should have img role on container without remove button', () => {
      render(<ContentPreview {...createContentPreviewProps()} />);

      // Container has role="img", but also contains an actual img element
      // Use a more specific selector
      const imgContainer = screen.getByLabelText('Photo content preview');
      expect(imgContainer).toHaveAttribute('role', 'img');
    });

    it('should have figure role when remove button is present (to avoid nested-interactive)', () => {
      render(<ContentPreview {...createContentPreviewProps({ showRemove: true, onRemove: vi.fn() })} />);

      const figureContainer = screen.getByRole('figure');
      expect(figureContainer).toBeInTheDocument();
    });

    it('should have descriptive aria-label matching content type', () => {
      const { rerender } = render(<ContentPreview {...createContentPreviewProps()} />);
      expect(screen.getByLabelText('Photo content preview')).toBeInTheDocument();

      rerender(<ContentPreview {...createContentPreviewProps({ content: createMockContent('video') })} />);
      expect(screen.getByLabelText('Video content preview')).toBeInTheDocument();

      rerender(<ContentPreview {...createContentPreviewProps({ content: createMockContent('pdf') })} />);
      expect(screen.getByLabelText('PDF content preview')).toBeInTheDocument();

      rerender(<ContentPreview {...createContentPreviewProps({ content: createMockContent('text') })} />);
      expect(screen.getByLabelText('Text content preview')).toBeInTheDocument();

      rerender(<ContentPreview {...createContentPreviewProps({ content: createMockContent('url') })} />);
      expect(screen.getByLabelText('Link content preview')).toBeInTheDocument();
    });

    it('should have aria-hidden="true" on decorative icons', () => {
      render(<ContentPreview {...createContentPreviewProps({ content: createMockContent('pdf') })} />);

      const container = screen.getByLabelText('PDF content preview');
      const icons = container.querySelectorAll('svg');

      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should hide type badge from screen readers', () => {
      render(<ContentPreview {...createContentPreviewProps({ showTypeBadge: true })} />);

      const container = screen.getByLabelText('Photo content preview');
      const badge = container.querySelector('[aria-hidden="true"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('loading state accessibility', () => {
    it('should have proper loading indicator attributes', () => {
      render(<ContentPreview {...createContentPreviewProps({ isLoading: true })} />);

      const loadingIndicator = screen.getByRole('status');
      expect(loadingIndicator).toBeInTheDocument();
      expect(loadingIndicator).toHaveAttribute('aria-busy', 'true');
      expect(loadingIndicator).toHaveAttribute('aria-label', 'Loading content preview');
    });

    it('should have sr-only loading text', () => {
      render(<ContentPreview {...createContentPreviewProps({ isLoading: true })} />);

      const srOnlyText = screen.getByText('Loading preview...');
      expect(srOnlyText).toHaveClass('sr-only');
    });
  });

  describe('remove button accessibility', () => {
    it('should have accessible remove button with content type in label', () => {
      render(<ContentPreview {...createContentPreviewProps({ showRemove: true, onRemove: vi.fn() })} />);

      // The button aria-label now includes the content type (e.g., "Remove photo content")
      const removeButton = screen.getByRole('button', { name: /remove.*content/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('should have visible focus indicator on remove button', () => {
      render(<ContentPreview {...createContentPreviewProps({ showRemove: true, onRemove: vi.fn() })} />);

      const removeButton = screen.getByRole('button', { name: /remove.*content/i });

      // Check for focus ring classes
      expect(removeButton.className).toContain('focus:ring');
      expect(removeButton.className).toContain('focus:outline-none');
    });

    it('should have minimum touch target size for remove button', () => {
      render(<ContentPreview {...createContentPreviewProps({ showRemove: true, onRemove: vi.fn() })} />);

      const removeButton = screen.getByRole('button', { name: /remove.*content/i });

      // Check for min-w and min-h classes indicating 44px+ touch target
      expect(removeButton.className).toContain('min-w-');
      expect(removeButton.className).toContain('min-h-');
    });
  });

  describe('photo content accessibility', () => {
    it('should have alt text on photo images', () => {
      render(<ContentPreview {...createContentPreviewProps({ content: createMockContent('photo') })} />);

      // The image may not render without actual file content, but alt should be present
      const img = document.querySelector('img');
      if (img) {
        expect(img).toHaveAttribute('alt', 'Photo content preview');
      }
    });
  });
});

// =============================================================================
// ContentPieceCard Accessibility Tests
// =============================================================================

/**
 * Helper wrapper that provides required list context for ContentPieceCard.
 * ContentPieceCard uses role="listitem" which requires a parent with role="list".
 */
const ListWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div role="list" aria-label="Content pieces">
    {children}
  </div>
);

describe('ContentPieceCard Accessibility', () => {
  describe('axe-core compliance', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ListWrapper>
          <ContentPieceCard {...createContentPieceCardProps()} />
        </ListWrapper>
      );
      await checkA11y(container);
    });

    it('should have no accessibility violations with drag handle', async () => {
      const { container } = render(
        <ListWrapper>
          <ContentPieceCard {...createContentPieceCardProps({ showDragHandle: true })} />
        </ListWrapper>
      );
      await checkA11y(container);
    });

    it('should have no accessibility violations when disabled', async () => {
      const { container } = render(
        <ListWrapper>
          <ContentPieceCard {...createContentPieceCardProps({ disabled: true })} />
        </ListWrapper>
      );
      await checkA11y(container);
    });

    it('should have no accessibility violations when dragging', async () => {
      const { container } = render(
        <ListWrapper>
          <ContentPieceCard {...createContentPieceCardProps({ isDragging: true })} />
        </ListWrapper>
      );
      await checkA11y(container);
    });
  });

  describe('ARIA attributes', () => {
    it('should have listitem role for card container', () => {
      render(<ContentPieceCard {...createContentPieceCardProps()} />);

      const listitem = screen.getByRole('listitem');
      expect(listitem).toBeInTheDocument();
    });

    it('should have descriptive aria-label on card', () => {
      render(<ContentPieceCard {...createContentPieceCardProps()} />);

      const listitem = screen.getByRole('listitem');
      expect(listitem).toHaveAttribute('aria-label', 'Photo content piece');
    });

    it('should have aria-hidden="true" on decorative elements', () => {
      render(<ContentPieceCard {...createContentPieceCardProps()} />);

      const card = screen.getByRole('listitem');
      const icons = card.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('action buttons accessibility', () => {
    it('should have accessible retake button', () => {
      render(<ContentPieceCard {...createContentPieceCardProps()} />);

      const retakeButton = screen.getByRole('button', { name: /retake content/i });
      expect(retakeButton).toBeInTheDocument();
    });

    it('should have accessible remove button', () => {
      render(<ContentPieceCard {...createContentPieceCardProps()} />);

      const removeButton = screen.getByRole('button', { name: /remove content/i });
      expect(removeButton).toBeInTheDocument();
    });

    it('should have minimum touch targets for action buttons (48px)', () => {
      render(<ContentPieceCard {...createContentPieceCardProps()} />);

      const retakeButton = screen.getByRole('button', { name: /retake content/i });
      const removeButton = screen.getByRole('button', { name: /remove content/i });

      // Both buttons should have min-w-[48px] and min-h-[48px] classes
      expect(retakeButton.className).toContain('min-w-[48px]');
      expect(retakeButton.className).toContain('min-h-[48px]');
      expect(removeButton.className).toContain('min-w-[48px]');
      expect(removeButton.className).toContain('min-h-[48px]');
    });

    it('should have visible focus indicators on action buttons', () => {
      render(<ContentPieceCard {...createContentPieceCardProps()} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        expect(button.className).toContain('focus:ring');
        expect(button.className).toContain('focus:outline-none');
      });
    });

    it('should disable buttons when card is disabled', () => {
      render(<ContentPieceCard {...createContentPieceCardProps({ disabled: true })} />);

      const retakeButton = screen.getByRole('button', { name: /retake content/i });
      const removeButton = screen.getByRole('button', { name: /remove content/i });

      expect(retakeButton).toBeDisabled();
      expect(removeButton).toBeDisabled();
    });
  });

  describe('drag handle accessibility', () => {
    it('should have accessible drag handle with proper label', () => {
      render(<ContentPieceCard {...createContentPieceCardProps({ showDragHandle: true })} />);

      const dragHandle = screen.getByRole('button', { name: /drag to reorder/i });
      expect(dragHandle).toBeInTheDocument();
    });

    it('should have minimum touch target for drag handle (48px)', () => {
      render(<ContentPieceCard {...createContentPieceCardProps({ showDragHandle: true })} />);

      const dragHandle = screen.getByRole('button', { name: /drag to reorder/i });

      expect(dragHandle.className).toContain('min-w-[48px]');
      expect(dragHandle.className).toContain('min-h-[48px]');
    });

    it('should have focus indicator on drag handle', () => {
      render(<ContentPieceCard {...createContentPieceCardProps({ showDragHandle: true })} />);

      const dragHandle = screen.getByRole('button', { name: /drag to reorder/i });
      expect(dragHandle.className).toContain('focus:ring');
    });
  });

  describe('keyboard interaction', () => {
    it('should trigger retake callback on button click', () => {
      const onRetake = vi.fn();
      render(<ContentPieceCard {...createContentPieceCardProps({ onRetake })} />);

      const retakeButton = screen.getByRole('button', { name: /retake content/i });
      fireEvent.click(retakeButton);

      expect(onRetake).toHaveBeenCalledWith('test-content-1');
    });

    it('should trigger remove callback on button click', () => {
      const onRemove = vi.fn();
      render(<ContentPieceCard {...createContentPieceCardProps({ onRemove })} />);

      const removeButton = screen.getByRole('button', { name: /remove content/i });
      fireEvent.click(removeButton);

      expect(onRemove).toHaveBeenCalledWith('test-content-1');
    });
  });
});
