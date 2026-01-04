/**
 * Tests for LocationFilter component
 *
 * @see docs/REQ-065-implement-filterpanel-detailed.md (Task 2.4.10)
 * @lastModified 2026-01-04 (REQ-065 - Initial test suite)
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationFilter } from '../LocationFilter';

describe('LocationFilter', () => {
  const defaultLocations = ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom'];

  describe('rendering', () => {
    it('renders with placeholder when no selection', () => {
      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Select location...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
          placeholder="Choose a room"
        />
      );

      expect(screen.getByText('Choose a room')).toBeInTheDocument();
    });

    it('renders section label', () => {
      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Location')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
          label="Room"
        />
      );

      expect(screen.getByText('Room')).toBeInTheDocument();
    });

    it('shows selected location in button', () => {
      render(
        <LocationFilter
          selectedLocation="Kitchen"
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Kitchen')).toBeInTheDocument();
    });

    it('applies blue styling when location is selected', () => {
      render(
        <LocationFilter
          selectedLocation="Kitchen"
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      const button = screen.getByRole('button', { expanded: false });
      expect(button).toHaveClass('border-blue-300');
    });
  });

  describe('dropdown behavior', () => {
    it('opens dropdown when button clicked', async () => {
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));

      expect(screen.getByPlaceholderText('Search locations...')).toBeInTheDocument();
    });

    it('shows all locations in dropdown', async () => {
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));

      expect(screen.getByRole('option', { name: /Kitchen/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Bathroom/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Living Room/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Bedroom/i })).toBeInTheDocument();
    });

    it('filters locations when searching', async () => {
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));
      await user.type(screen.getByPlaceholderText('Search locations...'), 'bath');

      expect(screen.getByRole('option', { name: /Bathroom/i })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /Kitchen/i })).not.toBeInTheDocument();
    });

    it('shows empty state when no locations match', async () => {
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));
      await user.type(screen.getByPlaceholderText('Search locations...'), 'xyz');

      expect(screen.getByText('No matching locations')).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('selects location when clicked', async () => {
      const onSelectionChange = jest.fn();
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('option', { name: /Kitchen/i }));

      expect(onSelectionChange).toHaveBeenCalledWith('Kitchen');
    });

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('option', { name: /Kitchen/i }));

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search locations...')).not.toBeInTheDocument();
      });
    });

    it('highlights selected location in dropdown', async () => {
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation="Kitchen"
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));

      const kitchenOption = screen.getByRole('option', { name: /Kitchen/i });
      expect(kitchenOption).toHaveAttribute('aria-selected', 'true');
      expect(kitchenOption).toHaveClass('bg-blue-100');
    });
  });

  describe('clear button', () => {
    it('shows clear button when location is selected', () => {
      render(
        <LocationFilter
          selectedLocation="Kitchen"
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByLabelText('Clear location selection')).toBeInTheDocument();
    });

    it('hides clear button when no location selected', () => {
      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.queryByLabelText('Clear location selection')).not.toBeInTheDocument();
    });

    it('clears selection when clear button clicked', async () => {
      const onSelectionChange = jest.fn();
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation="Kitchen"
          availableLocations={defaultLocations}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(screen.getByLabelText('Clear location selection'));

      expect(onSelectionChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('keyboard navigation', () => {
    it('closes dropdown on Escape', async () => {
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));
      expect(screen.getByPlaceholderText('Search locations...')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search locations...')).not.toBeInTheDocument();
      });
    });

    it('selects first matching location on Enter', async () => {
      const onSelectionChange = jest.fn();
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));
      await user.type(screen.getByPlaceholderText('Search locations...'), 'bath');
      await user.keyboard('{Enter}');

      expect(onSelectionChange).toHaveBeenCalledWith('Bathroom');
    });
  });

  describe('click outside', () => {
    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <LocationFilter
            selectedLocation={undefined}
            availableLocations={defaultLocations}
            onSelectionChange={() => {}}
          />
          <button>Outside</button>
        </div>
      );

      await user.click(screen.getByRole('button', { expanded: false }));
      expect(screen.getByPlaceholderText('Search locations...')).toBeInTheDocument();

      await user.click(screen.getByText('Outside'));

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search locations...')).not.toBeInTheDocument();
      });
    });
  });

  describe('empty state', () => {
    it('shows message when no locations available', async () => {
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={[]}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));

      expect(screen.getByText('No locations available')).toBeInTheDocument();
    });

    it('shows custom no locations message', async () => {
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={[]}
          onSelectionChange={() => {}}
          noLocationsMessage="Add some locations first"
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));

      expect(screen.getByText('Add some locations first')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables button when disabled', () => {
      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
          disabled
        />
      );

      expect(screen.getByRole('button', { expanded: false })).toBeDisabled();
    });

    it('hides clear button when disabled', () => {
      render(
        <LocationFilter
          selectedLocation="Kitchen"
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
          disabled
        />
      );

      expect(screen.queryByLabelText('Clear location selection')).not.toBeInTheDocument();
    });

    it('prevents opening dropdown when disabled', async () => {
      const user = userEvent.setup();

      render(
        <LocationFilter
          selectedLocation={undefined}
          availableLocations={defaultLocations}
          onSelectionChange={() => {}}
          disabled
        />
      );

      await user.click(screen.getByRole('button', { expanded: false }));

      expect(screen.queryByPlaceholderText('Search locations...')).not.toBeInTheDocument();
    });
  });
});
