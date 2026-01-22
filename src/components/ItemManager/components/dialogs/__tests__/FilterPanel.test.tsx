/**
 * Integration Tests for FilterPanel component
 *
 * @see docs/REQ-065-implement-filterpanel-detailed.md (Task 2.4.12)
 * @lastModified 2026-01-04 (REQ-065 - Initial integration test suite)
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from '../FilterPanel';
import type { FilterState, Property } from '../../../ItemManager.types';

describe('FilterPanel', () => {
  const defaultTags = ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom'];
  const defaultLocations = ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom'];
  const defaultProperties: Property[] = [
    { id: '1', name: 'Beach House', address: '123 Ocean Dr' },
    { id: '2', name: 'Mountain Cabin', address: '456 Summit Rd' },
  ];

  const emptyFilters: FilterState = {};

  describe('rendering', () => {
    it('renders all filter sections', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
        />
      );

      expect(screen.getByText('Content Type')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
    });

    it('renders header with Filters title', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
        />
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('hides PropertyFilter when multiPropertyMode is false', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          properties={defaultProperties}
          multiPropertyMode={false}
          isOpen={true}
        />
      );

      expect(screen.queryByText('Property')).not.toBeInTheDocument();
    });

    it('shows PropertyFilter when multiPropertyMode is true and properties exist', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          properties={defaultProperties}
          multiPropertyMode={true}
          isOpen={true}
        />
      );

      expect(screen.getByText('Property')).toBeInTheDocument();
      expect(screen.getByText('Beach House')).toBeInTheDocument();
    });

    it('returns null when isOpen is false (desktop)', () => {
      const { container } = render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('active filter count', () => {
    it('shows correct active filter count badge', () => {
      const filters: FilterState = {
        contentTypes: ['video', 'image'],
        tags: ['Kitchen'],
        locations: ['Bathroom'],
      };

      render(
        <FilterPanel
          filters={filters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
        />
      );

      // 2 content types + 1 tag + 1 location = 4
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('shows no badge when no filters active', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
        />
      );

      // No badge should be present
      expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
    });
  });

  describe('clear all button', () => {
    it('shows Clear All button when filters are active', () => {
      const filters: FilterState = {
        contentTypes: ['video'],
      };

      render(
        <FilterPanel
          filters={filters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
        />
      );

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('hides Clear All button when no filters active', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
        />
      );

      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    it('calls onClearFilters when Clear All clicked', async () => {
      const onClearFilters = vi.fn();
      const user = userEvent.setup();

      const filters: FilterState = {
        contentTypes: ['video'],
      };

      render(
        <FilterPanel
          filters={filters}
          onFiltersChange={() => {}}
          onClearFilters={onClearFilters}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
        />
      );

      await user.click(screen.getByText('Clear All'));

      expect(onClearFilters).toHaveBeenCalled();
    });
  });

  describe('filter changes', () => {
    it('propagates content type changes to onFiltersChange', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup();

      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={onFiltersChange}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
        />
      );

      await user.click(screen.getByRole('checkbox', { name: /video/i }));

      expect(onFiltersChange).toHaveBeenCalledWith({
        contentTypes: ['video'],
      });
    });

    it('propagates tag changes to onFiltersChange', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup();

      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={onFiltersChange}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
        />
      );

      await user.click(screen.getByText('Add tags...'));
      await user.click(screen.getByRole('option', { name: /Kitchen/i }));

      expect(onFiltersChange).toHaveBeenCalledWith({
        tags: ['Kitchen'],
      });
    });

    it('propagates location changes to onFiltersChange', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup();

      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={onFiltersChange}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
        />
      );

      await user.click(screen.getByText('Select location...'));
      await user.click(screen.getByRole('option', { name: /Kitchen/i }));

      expect(onFiltersChange).toHaveBeenCalledWith({
        locations: ['Kitchen'],
      });
    });

    it('propagates property changes when multiPropertyMode is true', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup();

      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={onFiltersChange}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          properties={defaultProperties}
          multiPropertyMode={true}
          isOpen={true}
        />
      );

      await user.click(screen.getByRole('checkbox', { name: /Beach House/i }));

      expect(onFiltersChange).toHaveBeenCalledWith({
        propertyIds: ['1'],
      });
    });
  });

  describe('mobile drawer mode', () => {
    it('renders overlay when isMobile and isOpen', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isMobile={true}
          isOpen={true}
        />
      );

      // Overlay should be present
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('returns null when isMobile and isOpen is false', () => {
      const { container } = render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isMobile={true}
          isOpen={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('shows close button in mobile mode', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isMobile={true}
          isOpen={true}
        />
      );

      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    it('shows Apply Filters button in mobile mode', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isMobile={true}
          isOpen={true}
        />
      );

      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    });

    it('calls onOpenChange(false) when overlay clicked', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          onOpenChange={onOpenChange}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isMobile={true}
          isOpen={true}
        />
      );

      // Click the overlay (the dialog's sibling that covers the background)
      const overlay = document.querySelector('.bg-black\\/50');
      if (overlay) {
        await user.click(overlay);
      }

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onOpenChange(false) when Apply Filters clicked', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          onOpenChange={onOpenChange}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isMobile={true}
          isOpen={true}
        />
      );

      await user.click(screen.getByText('Apply Filters'));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onOpenChange(false) when close button clicked', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          onOpenChange={onOpenChange}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isMobile={true}
          isOpen={true}
        />
      );

      await user.click(screen.getByLabelText('Close'));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('custom labels', () => {
    it('uses custom labels', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
          labels={{
            title: 'Filter Items',
            contentType: 'Type',
            tags: 'Labels',
            location: 'Room',
          }}
        />
      );

      expect(screen.getByText('Filter Items')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Labels')).toBeInTheDocument();
      expect(screen.getByText('Room')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables all filters when disabled prop is true', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
          disabled={true}
        />
      );

      const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });
      expect(videoCheckbox).toBeDisabled();
    });

    it('prevents filter changes when disabled', async () => {
      const onFiltersChange = vi.fn();
      const user = userEvent.setup();

      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={onFiltersChange}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isOpen={true}
          disabled={true}
        />
      );

      await user.click(screen.getByRole('checkbox', { name: /video/i }));

      expect(onFiltersChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('mobile drawer has dialog role and aria-modal', () => {
      render(
        <FilterPanel
          filters={emptyFilters}
          onFiltersChange={() => {}}
          onClearFilters={() => {}}
          availableTags={defaultTags}
          availableLocations={defaultLocations}
          isMobile={true}
          isOpen={true}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});
