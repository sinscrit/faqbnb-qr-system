/**
 * Tests for PropertyFilter component
 *
 * @see docs/REQ-065-implement-filterpanel-detailed.md (Task 2.4.11)
 * @lastModified 2026-01-04 (REQ-065 - Initial test suite)
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyFilter } from '../PropertyFilter';
import type { Property } from '../../../ItemManager.types';

describe('PropertyFilter', () => {
  const defaultProperties: Property[] = [
    { id: '1', name: 'Beach House', address: '123 Ocean Dr' },
    { id: '2', nickname: 'Mountain Cabin', address: '456 Summit Rd' },
    {
      id: '3',
      name: 'City Apartment',
      property_types: { display_name: 'Apartment' },
    },
    { id: '4', nickname: 'Lake House', address: '789 Lake View' },
  ];

  describe('rendering', () => {
    it('returns null when properties array is empty', () => {
      const { container } = render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={[]}
          onSelectionChange={() => {}}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders section label', () => {
      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Property')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={() => {}}
          label="Filter by Property"
        />
      );

      expect(screen.getByText('Filter by Property')).toBeInTheDocument();
    });

    it('renders all properties', () => {
      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Beach House')).toBeInTheDocument();
      expect(screen.getByText('Mountain Cabin')).toBeInTheDocument();
      expect(screen.getByText('City Apartment')).toBeInTheDocument();
      expect(screen.getByText('Lake House')).toBeInTheDocument();
    });

    it('shows property addresses', () => {
      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText(/123 Ocean Dr/)).toBeInTheDocument();
      expect(screen.getByText(/456 Summit Rd/)).toBeInTheDocument();
    });

    it('shows property types when available', () => {
      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText(/Apartment/)).toBeInTheDocument();
    });

    it('renders group with correct role and aria-label', () => {
      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={() => {}}
          label="Property"
        />
      );

      expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Property');
    });

    it('prefers nickname over name when available', () => {
      const properties: Property[] = [
        { id: '1', name: 'Official Name', nickname: 'Friendly Nickname' },
      ];

      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={properties}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Friendly Nickname')).toBeInTheDocument();
      expect(screen.queryByText('Official Name')).not.toBeInTheDocument();
    });

    it('shows "Unnamed Property" when no name or nickname', () => {
      const properties: Property[] = [{ id: '1' }];

      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={properties}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Unnamed Property')).toBeInTheDocument();
    });
  });

  describe('selection state', () => {
    it('shows checkmark on selected properties', () => {
      render(
        <PropertyFilter
          selectedPropertyIds={['1', '3']}
          properties={defaultProperties}
          onSelectionChange={() => {}}
        />
      );

      const beachHouseButton = screen.getByRole('checkbox', { name: /Beach House/i });
      const cityApartmentButton = screen.getByRole('checkbox', { name: /City Apartment/i });
      const mountainCabinButton = screen.getByRole('checkbox', { name: /Mountain Cabin/i });

      expect(beachHouseButton).toHaveAttribute('aria-checked', 'true');
      expect(cityApartmentButton).toHaveAttribute('aria-checked', 'true');
      expect(mountainCabinButton).toHaveAttribute('aria-checked', 'false');
    });

    it('applies blue styling to selected properties', () => {
      render(
        <PropertyFilter
          selectedPropertyIds={['1']}
          properties={defaultProperties}
          onSelectionChange={() => {}}
        />
      );

      const selectedButton = screen.getByRole('checkbox', { name: /Beach House/i });
      expect(selectedButton).toHaveClass('bg-blue-50');
      expect(selectedButton).toHaveClass('border-blue-300');
    });
  });

  describe('interactions', () => {
    it('toggles property selection when clicked', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <PropertyFilter
          selectedPropertyIds={['1']}
          properties={defaultProperties}
          onSelectionChange={onSelectionChange}
        />
      );

      // Add a new property
      await user.click(screen.getByRole('checkbox', { name: /Mountain Cabin/i }));
      expect(onSelectionChange).toHaveBeenCalledWith(['1', '2']);
    });

    it('removes property from selection when clicking selected', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <PropertyFilter
          selectedPropertyIds={['1', '2']}
          properties={defaultProperties}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(screen.getByRole('checkbox', { name: /Beach House/i }));
      expect(onSelectionChange).toHaveBeenCalledWith(['2']);
    });

    it('supports multiple selections', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(screen.getByRole('checkbox', { name: /Beach House/i }));
      expect(onSelectionChange).toHaveBeenCalledWith(['1']);
    });
  });

  describe('disabled state', () => {
    it('disables all buttons when disabled prop is true', () => {
      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
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
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={onSelectionChange}
          disabled
        />
      );

      await user.click(screen.getByRole('checkbox', { name: /Beach House/i }));

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('applies opacity styling when disabled', () => {
      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
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
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={() => {}}
        />
      );

      await user.tab();
      expect(screen.getByRole('checkbox', { name: /Beach House/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('checkbox', { name: /Mountain Cabin/i })).toHaveFocus();
    });

    it('Enter key toggles selection', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.tab();
      await user.keyboard('{Enter}');

      expect(onSelectionChange).toHaveBeenCalledWith(['1']);
    });

    it('Space key toggles selection', async () => {
      const onSelectionChange = vi.fn();
      const user = userEvent.setup();

      render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.tab();
      await user.keyboard(' ');

      expect(onSelectionChange).toHaveBeenCalledWith(['1']);
    });
  });

  describe('custom className', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <PropertyFilter
          selectedPropertyIds={[]}
          properties={defaultProperties}
          onSelectionChange={() => {}}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
