/**
 * Tests for ContentTypeFilter component
 *
 * @see docs/REQ-065-implement-filterpanel-detailed.md (Task 2.4.8)
 * @lastModified 2026-01-04 (REQ-065 - Initial test suite)
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentTypeFilter } from '../ContentTypeFilter';

describe('ContentTypeFilter', () => {
  describe('rendering', () => {
    it('renders all 5 content type options', () => {
      render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Video')).toBeInTheDocument();
      expect(screen.getByText('Photo')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('Text Only')).toBeInTheDocument();
      expect(screen.getByText('Mixed')).toBeInTheDocument();
    });

    it('renders with default label', () => {
      render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Content Type')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={() => {}}
          label="Filter by Type"
        />
      );

      expect(screen.getByText('Filter by Type')).toBeInTheDocument();
    });

    it('renders group with correct role and aria-label', () => {
      render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={() => {}}
          label="Content Type"
        />
      );

      expect(screen.getByRole('group')).toHaveAttribute(
        'aria-label',
        'Content Type'
      );
    });
  });

  describe('selection state', () => {
    it('shows checkmark on selected types', () => {
      render(
        <ContentTypeFilter
          selectedTypes={['video', 'pdf']}
          onSelectionChange={() => {}}
        />
      );

      const videoButton = screen.getByRole('checkbox', { name: /video/i });
      const pdfButton = screen.getByRole('checkbox', { name: /pdf/i });
      const photoButton = screen.getByRole('checkbox', { name: /photo/i });

      expect(videoButton).toHaveAttribute('aria-checked', 'true');
      expect(pdfButton).toHaveAttribute('aria-checked', 'true');
      expect(photoButton).toHaveAttribute('aria-checked', 'false');
    });

    it('applies blue styling to selected types', () => {
      render(
        <ContentTypeFilter
          selectedTypes={['video']}
          onSelectionChange={() => {}}
        />
      );

      const videoButton = screen.getByRole('checkbox', { name: /video/i });
      expect(videoButton).toHaveClass('bg-blue-100');
      expect(videoButton).toHaveClass('text-blue-800');
    });
  });

  describe('interactions', () => {
    it('clicking unselected type adds it to selection', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ContentTypeFilter
          selectedTypes={['video']}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(screen.getByRole('checkbox', { name: /pdf/i }));

      expect(onSelectionChange).toHaveBeenCalledWith(['video', 'pdf']);
    });

    it('clicking selected type removes it from selection', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ContentTypeFilter
          selectedTypes={['video', 'pdf']}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(screen.getByRole('checkbox', { name: /video/i }));

      expect(onSelectionChange).toHaveBeenCalledWith(['pdf']);
    });

    it('supports multiple selections', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(screen.getByRole('checkbox', { name: /video/i }));

      expect(onSelectionChange).toHaveBeenCalledWith(['video']);
    });
  });

  describe('disabled state', () => {
    it('disables all buttons when disabled prop is true', () => {
      render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={() => {}}
          disabled
        />
      );

      const buttons = screen.getAllByRole('checkbox');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('prevents clicks when disabled', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={onSelectionChange}
          disabled
        />
      );

      await user.click(screen.getByRole('checkbox', { name: /video/i }));

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('applies opacity styling when disabled', () => {
      render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={() => {}}
          disabled
        />
      );

      const buttons = screen.getAllByRole('checkbox');
      buttons.forEach((button) => {
        expect(button).toHaveClass('opacity-50');
      });
    });
  });

  describe('keyboard accessibility', () => {
    it('buttons are focusable with Tab', async () => {
      const user = userEvent.setup();

      render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={() => {}}
        />
      );

      await user.tab();
      expect(screen.getByRole('checkbox', { name: /video/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('checkbox', { name: /photo/i })).toHaveFocus();
    });

    it('Enter key toggles selection', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.tab();
      await user.keyboard('{Enter}');

      expect(onSelectionChange).toHaveBeenCalledWith(['video']);
    });

    it('Space key toggles selection', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.tab();
      await user.keyboard(' ');

      expect(onSelectionChange).toHaveBeenCalledWith(['video']);
    });
  });

  describe('custom className', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <ContentTypeFilter
          selectedTypes={[]}
          onSelectionChange={() => {}}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
