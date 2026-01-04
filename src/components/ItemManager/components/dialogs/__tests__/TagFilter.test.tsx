/**
 * Tests for TagFilter component
 *
 * @see docs/REQ-065-implement-filterpanel-detailed.md (Task 2.4.9)
 * @lastModified 2026-01-04 (REQ-065 - Initial test suite)
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagFilter } from '../TagFilter';

describe('TagFilter', () => {
  const defaultTags = ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom'];

  describe('rendering', () => {
    it('renders with section label', () => {
      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
          label="Select Tags"
        />
      );

      expect(screen.getByText('Select Tags')).toBeInTheDocument();
    });

    it('shows selected tags as chips', () => {
      render(
        <TagFilter
          selectedTags={['Kitchen', 'Bathroom']}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Bathroom')).toBeInTheDocument();
    });

    it('shows add tags button', () => {
      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
        />
      );

      expect(screen.getByText('Add tags...')).toBeInTheDocument();
    });
  });

  describe('removing tags', () => {
    it('removes tag when X button clicked', async () => {
      const onSelectionChange = jest.fn();
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={['Kitchen', 'Bathroom']}
          availableTags={defaultTags}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(screen.getByLabelText('Remove Kitchen tag'));

      expect(onSelectionChange).toHaveBeenCalledWith(['Bathroom']);
    });
  });

  describe('dropdown behavior', () => {
    it('opens dropdown when button clicked', async () => {
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByText('Add tags...'));

      expect(screen.getByPlaceholderText('Search tags...')).toBeInTheDocument();
    });

    it('shows available (unselected) tags in dropdown', async () => {
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={['Kitchen']}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByText('Add tags...'));

      expect(screen.getByRole('option', { name: /Bathroom/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Living Room/i })).toBeInTheDocument();
      // Kitchen should not be in the dropdown since it's already selected
      expect(screen.queryByRole('option', { name: /Kitchen/i })).not.toBeInTheDocument();
    });

    it('filters tags when searching', async () => {
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByText('Add tags...'));
      await user.type(screen.getByPlaceholderText('Search tags...'), 'bath');

      expect(screen.getByRole('option', { name: /Bathroom/i })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /Kitchen/i })).not.toBeInTheDocument();
    });

    it('shows empty state when no tags match search', async () => {
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByText('Add tags...'));
      await user.type(screen.getByPlaceholderText('Search tags...'), 'xyz');

      expect(screen.getByText('No matching tags')).toBeInTheDocument();
    });
  });

  describe('adding tags', () => {
    it('adds tag when clicked in dropdown', async () => {
      const onSelectionChange = jest.fn();
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(screen.getByText('Add tags...'));
      await user.click(screen.getByRole('option', { name: /Kitchen/i }));

      expect(onSelectionChange).toHaveBeenCalledWith(['Kitchen']);
    });

    it('closes dropdown after selecting tag', async () => {
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByText('Add tags...'));
      await user.click(screen.getByRole('option', { name: /Kitchen/i }));

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search tags...')).not.toBeInTheDocument();
      });
    });
  });

  describe('keyboard navigation', () => {
    it('closes dropdown on Escape', async () => {
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByText('Add tags...'));
      expect(screen.getByPlaceholderText('Search tags...')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search tags...')).not.toBeInTheDocument();
      });
    });

    it('selects first matching tag on Enter', async () => {
      const onSelectionChange = jest.fn();
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={onSelectionChange}
        />
      );

      await user.click(screen.getByText('Add tags...'));
      await user.type(screen.getByPlaceholderText('Search tags...'), 'bath');
      await user.keyboard('{Enter}');

      expect(onSelectionChange).toHaveBeenCalledWith(['Bathroom']);
    });
  });

  describe('click outside', () => {
    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <TagFilter
            selectedTags={[]}
            availableTags={defaultTags}
            onSelectionChange={() => {}}
          />
          <button>Outside</button>
        </div>
      );

      await user.click(screen.getByText('Add tags...'));
      expect(screen.getByPlaceholderText('Search tags...')).toBeInTheDocument();

      await user.click(screen.getByText('Outside'));

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search tags...')).not.toBeInTheDocument();
      });
    });
  });

  describe('empty state', () => {
    it('shows message when no tags available', async () => {
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={[]}
          availableTags={[]}
          onSelectionChange={() => {}}
        />
      );

      await user.click(screen.getByText('Add tags...'));

      expect(screen.getByText('No tags available')).toBeInTheDocument();
    });

    it('shows custom no tags message', async () => {
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={[]}
          availableTags={[]}
          onSelectionChange={() => {}}
          noTagsMessage="Create some tags first"
        />
      );

      await user.click(screen.getByText('Add tags...'));

      expect(screen.getByText('Create some tags first')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables add button when disabled', () => {
      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
          disabled
        />
      );

      expect(screen.getByText('Add tags...')).toBeDisabled();
    });

    it('disables remove buttons when disabled', () => {
      render(
        <TagFilter
          selectedTags={['Kitchen']}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
          disabled
        />
      );

      expect(screen.getByLabelText('Remove Kitchen tag')).toBeDisabled();
    });

    it('prevents opening dropdown when disabled', async () => {
      const user = userEvent.setup();

      render(
        <TagFilter
          selectedTags={[]}
          availableTags={defaultTags}
          onSelectionChange={() => {}}
          disabled
        />
      );

      await user.click(screen.getByText('Add tags...'));

      expect(screen.queryByPlaceholderText('Search tags...')).not.toBeInTheDocument();
    });
  });
});
