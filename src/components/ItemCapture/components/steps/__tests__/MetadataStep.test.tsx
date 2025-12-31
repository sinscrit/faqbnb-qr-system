/**
 * Unit Tests for MetadataStep Component
 *
 * Tests validation logic, component rendering, and user interactions.
 *
 * @module ItemCapture/components/steps/__tests__/MetadataStep
 * @lastModified 2025-12-31 (REQ-034 Task 12)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetadataStep, validateMetadata } from '../MetadataStep';
import { METADATA_CONSTRAINTS, PRESET_LOCATIONS, SUGGESTED_TAGS } from '../../../utils/constants';
import type { ItemMetadata } from '../../../ItemCapture.types';

// =============================================================================
// Test Utilities
// =============================================================================

const createMockMetadata = (overrides?: Partial<ItemMetadata>): ItemMetadata => ({
  title: '',
  location: '',
  tags: [],
  applianceType: undefined,
  ...overrides,
});

const defaultProps = {
  metadata: createMockMetadata(),
  errors: {},
  onUpdate: jest.fn(),
  onValidate: jest.fn(() => true),
};

// =============================================================================
// validateMetadata Function Tests
// =============================================================================

describe('validateMetadata', () => {
  describe('title validation', () => {
    it('returns error for empty title', () => {
      const metadata = createMockMetadata({ title: '' });
      const errors = validateMetadata(metadata);
      expect(errors.title).toBe('Title is required');
    });

    it('returns error for whitespace-only title', () => {
      const metadata = createMockMetadata({ title: '   ' });
      const errors = validateMetadata(metadata);
      expect(errors.title).toBe('Title is required');
    });

    it('returns error for title exceeding max length', () => {
      const longTitle = 'a'.repeat(METADATA_CONSTRAINTS.title.maxLength + 1);
      const metadata = createMockMetadata({ title: longTitle });
      const errors = validateMetadata(metadata);
      expect(errors.title).toBe(`Title must be ${METADATA_CONSTRAINTS.title.maxLength} characters or less`);
    });

    it('returns no error for valid title', () => {
      const metadata = createMockMetadata({ title: 'Valid Title' });
      const errors = validateMetadata(metadata);
      expect(errors.title).toBeUndefined();
    });

    it('returns no error for title at max length', () => {
      const maxTitle = 'a'.repeat(METADATA_CONSTRAINTS.title.maxLength);
      const metadata = createMockMetadata({ title: maxTitle });
      const errors = validateMetadata(metadata);
      expect(errors.title).toBeUndefined();
    });
  });

  describe('location validation', () => {
    it('returns no error for empty location (optional field)', () => {
      const metadata = createMockMetadata({ location: '' });
      const errors = validateMetadata(metadata);
      expect(errors.location).toBeUndefined();
    });

    it('returns error for location exceeding max length', () => {
      const longLocation = 'a'.repeat(METADATA_CONSTRAINTS.location.maxLength + 1);
      const metadata = createMockMetadata({ title: 'Valid', location: longLocation });
      const errors = validateMetadata(metadata);
      expect(errors.location).toBe(`Location must be ${METADATA_CONSTRAINTS.location.maxLength} characters or less`);
    });

    it('returns no error for valid location', () => {
      const metadata = createMockMetadata({ title: 'Valid', location: 'Kitchen' });
      const errors = validateMetadata(metadata);
      expect(errors.location).toBeUndefined();
    });
  });

  describe('tags validation', () => {
    it('returns no error for empty tags array', () => {
      const metadata = createMockMetadata({ title: 'Valid', tags: [] });
      const errors = validateMetadata(metadata);
      expect(errors.tags).toBeUndefined();
    });

    it('returns error for exceeding max tags', () => {
      const tooManyTags = Array(METADATA_CONSTRAINTS.maxTags + 1).fill(null).map((_, i) => `tag${i}`);
      const metadata = createMockMetadata({ title: 'Valid', tags: tooManyTags });
      const errors = validateMetadata(metadata);
      expect(errors.tags).toBe(`Maximum ${METADATA_CONSTRAINTS.maxTags} tags allowed`);
    });

    it('returns error for tag exceeding max length', () => {
      const longTag = 'a'.repeat(METADATA_CONSTRAINTS.tag.maxLength + 1);
      const metadata = createMockMetadata({ title: 'Valid', tags: [longTag] });
      const errors = validateMetadata(metadata);
      expect(errors.tags).toBe(`Each tag must be ${METADATA_CONSTRAINTS.tag.maxLength} characters or less`);
    });

    it('returns no error for valid tags', () => {
      const metadata = createMockMetadata({ title: 'Valid', tags: ['How-to', 'Setup'] });
      const errors = validateMetadata(metadata);
      expect(errors.tags).toBeUndefined();
    });
  });

  describe('valid metadata', () => {
    it('returns empty errors object for fully valid metadata', () => {
      const metadata = createMockMetadata({
        title: 'Washing Machine',
        location: 'Laundry Room',
        tags: ['How-to', 'Maintenance'],
        applianceType: 'washer',
      });
      const errors = validateMetadata(metadata);
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });
});

// =============================================================================
// MetadataStep Component Tests
// =============================================================================

describe('MetadataStep Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all four fields', () => {
      render(<MetadataStep {...defaultProps} />);

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
      expect(screen.getByText(/tags/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/appliance type/i)).toBeInTheDocument();
    });

    it('shows required indicator on title field', () => {
      render(<MetadataStep {...defaultProps} />);
      const titleLabel = screen.getByText(/title/i).closest('label');
      expect(titleLabel).toHaveTextContent('*');
    });

    it('displays error messages when errors prop provided', () => {
      const props = {
        ...defaultProps,
        errors: { title: 'Title is required' },
      };
      render(<MetadataStep {...props} />);
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    it('shows character count for title', () => {
      const props = {
        ...defaultProps,
        metadata: createMockMetadata({ title: 'Test' }),
      };
      render(<MetadataStep {...props} />);
      expect(screen.getByText(`4/${METADATA_CONSTRAINTS.title.maxLength} characters`)).toBeInTheDocument();
    });

    it('shows tag count', () => {
      const props = {
        ...defaultProps,
        metadata: createMockMetadata({ tags: ['tag1', 'tag2'] }),
      };
      render(<MetadataStep {...props} />);
      expect(screen.getByText(`(2/${METADATA_CONSTRAINTS.maxTags})`)).toBeInTheDocument();
    });
  });

  describe('title field interactions', () => {
    it('calls onUpdate when title is changed', async () => {
      const onUpdate = jest.fn();
      render(<MetadataStep {...defaultProps} onUpdate={onUpdate} />);

      const titleInput = screen.getByLabelText(/title/i);
      await userEvent.type(titleInput, 'New Title');

      expect(onUpdate).toHaveBeenCalledWith({ title: 'N' });
    });

    it('calls onValidate on blur', async () => {
      const onValidate = jest.fn();
      render(<MetadataStep {...defaultProps} onValidate={onValidate} />);

      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.focus(titleInput);
      fireEvent.blur(titleInput);

      expect(onValidate).toHaveBeenCalled();
    });

    it('has maxLength attribute', () => {
      render(<MetadataStep {...defaultProps} />);
      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toHaveAttribute('maxLength', String(METADATA_CONSTRAINTS.title.maxLength));
    });
  });

  describe('location dropdown interactions', () => {
    it('shows dropdown when input is focused', async () => {
      render(<MetadataStep {...defaultProps} />);

      const locationInput = screen.getByLabelText(/location/i);
      fireEvent.focus(locationInput);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('shows preset locations in dropdown', async () => {
      render(<MetadataStep {...defaultProps} />);

      const locationInput = screen.getByLabelText(/location/i);
      fireEvent.focus(locationInput);

      await waitFor(() => {
        PRESET_LOCATIONS.slice(0, 5).forEach(location => {
          expect(screen.getByText(location)).toBeInTheDocument();
        });
      });
    });

    it('filters locations based on search term', async () => {
      render(<MetadataStep {...defaultProps} />);

      const locationInput = screen.getByLabelText(/location/i);
      await userEvent.type(locationInput, 'Kitchen');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByText('Kitchen')).toBeInTheDocument();
        expect(screen.queryByText('Living Room')).not.toBeInTheDocument();
      });
    });

    it('shows custom option when no exact match', async () => {
      render(<MetadataStep {...defaultProps} />);

      const locationInput = screen.getByLabelText(/location/i);
      await userEvent.type(locationInput, 'Custom Location');

      await waitFor(() => {
        expect(screen.getByText(/use custom/i)).toBeInTheDocument();
      });
    });

    it('calls onUpdate when preset location is selected', async () => {
      const onUpdate = jest.fn();
      render(<MetadataStep {...defaultProps} onUpdate={onUpdate} />);

      const locationInput = screen.getByLabelText(/location/i);
      fireEvent.focus(locationInput);

      await waitFor(() => {
        const kitchenOption = screen.getByText('Kitchen');
        fireEvent.click(kitchenOption);
      });

      expect(onUpdate).toHaveBeenCalledWith({ location: 'Kitchen' });
    });

    it('closes dropdown on Escape key', async () => {
      render(<MetadataStep {...defaultProps} />);

      const locationInput = screen.getByLabelText(/location/i);
      fireEvent.focus(locationInput);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(locationInput, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('tag input interactions', () => {
    it('displays existing tags as pills', () => {
      const props = {
        ...defaultProps,
        metadata: createMockMetadata({ tags: ['How-to', 'Setup'] }),
      };
      render(<MetadataStep {...props} />);

      expect(screen.getByText('How-to')).toBeInTheDocument();
      expect(screen.getByText('Setup')).toBeInTheDocument();
    });

    it('removes tag when X button is clicked', async () => {
      const onUpdate = jest.fn();
      const props = {
        ...defaultProps,
        metadata: createMockMetadata({ tags: ['How-to', 'Setup'] }),
        onUpdate,
      };
      render(<MetadataStep {...props} />);

      const removeButton = screen.getByLabelText('Remove tag: How-to');
      fireEvent.click(removeButton);

      expect(onUpdate).toHaveBeenCalledWith({ tags: ['Setup'] });
    });

    it('adds tag on Enter key', async () => {
      const onUpdate = jest.fn();
      render(<MetadataStep {...defaultProps} onUpdate={onUpdate} />);

      const tagInput = screen.getByPlaceholderText(/add a tag/i);
      await userEvent.type(tagInput, 'NewTag{enter}');

      expect(onUpdate).toHaveBeenCalledWith({ tags: ['NewTag'] });
    });

    it('shows suggested tags', () => {
      render(<MetadataStep {...defaultProps} />);

      expect(screen.getByText(/suggested tags/i)).toBeInTheDocument();
      SUGGESTED_TAGS.slice(0, 3).forEach(tag => {
        expect(screen.getByText(`+ ${tag}`)).toBeInTheDocument();
      });
    });

    it('adds suggested tag when clicked', async () => {
      const onUpdate = jest.fn();
      render(<MetadataStep {...defaultProps} onUpdate={onUpdate} />);

      const suggestedTag = screen.getByText(`+ ${SUGGESTED_TAGS[0]}`);
      fireEvent.click(suggestedTag);

      expect(onUpdate).toHaveBeenCalledWith({ tags: [SUGGESTED_TAGS[0]] });
    });

    it('disables input when max tags reached', () => {
      const maxTags = Array(METADATA_CONSTRAINTS.maxTags).fill(null).map((_, i) => `tag${i}`);
      const props = {
        ...defaultProps,
        metadata: createMockMetadata({ tags: maxTags }),
      };
      render(<MetadataStep {...props} />);

      const tagInput = screen.getByPlaceholderText(/max tags reached/i);
      expect(tagInput).toBeDisabled();
    });

    it('hides suggested tags when max tags reached', () => {
      const maxTags = Array(METADATA_CONSTRAINTS.maxTags).fill(null).map((_, i) => `tag${i}`);
      const props = {
        ...defaultProps,
        metadata: createMockMetadata({ tags: maxTags }),
      };
      render(<MetadataStep {...props} />);

      expect(screen.queryByText(/suggested tags/i)).not.toBeInTheDocument();
    });
  });

  describe('appliance type dropdown', () => {
    it('shows placeholder by default', () => {
      render(<MetadataStep {...defaultProps} />);
      const select = screen.getByLabelText(/appliance type/i);
      expect(select).toHaveValue('');
    });

    it('calls onUpdate when appliance type is selected', async () => {
      const onUpdate = jest.fn();
      render(<MetadataStep {...defaultProps} onUpdate={onUpdate} />);

      const select = screen.getByLabelText(/appliance type/i);
      await userEvent.selectOptions(select, 'washer');

      expect(onUpdate).toHaveBeenCalledWith({ applianceType: 'washer' });
    });

    it('calls onUpdate with undefined when cleared', async () => {
      const onUpdate = jest.fn();
      const props = {
        ...defaultProps,
        metadata: createMockMetadata({ applianceType: 'washer' }),
        onUpdate,
      };
      render(<MetadataStep {...props} />);

      const select = screen.getByLabelText(/appliance type/i);
      await userEvent.selectOptions(select, '');

      expect(onUpdate).toHaveBeenCalledWith({ applianceType: undefined });
    });
  });

  describe('accessibility', () => {
    it('title field has aria-required', () => {
      render(<MetadataStep {...defaultProps} />);
      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toHaveAttribute('aria-required', 'true');
    });

    it('title field has aria-invalid when error exists', () => {
      const props = {
        ...defaultProps,
        errors: { title: 'Title is required' },
      };
      render(<MetadataStep {...props} />);
      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('error messages have role="alert"', () => {
      const props = {
        ...defaultProps,
        errors: { title: 'Title is required' },
      };
      render(<MetadataStep {...props} />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Title is required');
    });

    it('location input has aria-expanded attribute', () => {
      render(<MetadataStep {...defaultProps} />);
      const locationInput = screen.getByLabelText(/location/i);
      expect(locationInput).toHaveAttribute('aria-expanded', 'false');
    });

    it('location input has aria-haspopup attribute', () => {
      render(<MetadataStep {...defaultProps} />);
      const locationInput = screen.getByLabelText(/location/i);
      expect(locationInput).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('location dropdown has listbox role', async () => {
      render(<MetadataStep {...defaultProps} />);

      const locationInput = screen.getByLabelText(/location/i);
      fireEvent.focus(locationInput);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });
  });

  describe('mobile touch targets', () => {
    it('title input has minimum height', () => {
      render(<MetadataStep {...defaultProps} />);
      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toHaveClass('min-h-[48px]');
    });

    it('location input has minimum height', () => {
      render(<MetadataStep {...defaultProps} />);
      const locationInput = screen.getByLabelText(/location/i);
      expect(locationInput).toHaveClass('min-h-[48px]');
    });

    it('appliance select has minimum height', () => {
      render(<MetadataStep {...defaultProps} />);
      const select = screen.getByLabelText(/appliance type/i);
      expect(select).toHaveClass('min-h-[48px]');
    });
  });
});
