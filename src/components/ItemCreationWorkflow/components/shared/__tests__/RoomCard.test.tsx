/**
 * RoomCard Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/RoomCard.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomCard } from '../RoomCard';

describe('RoomCard', () => {
  const defaultProps = {
    room: 'kitchen' as const,
    label: 'Kitchen',
    icon: 'chef-hat',
    isSelected: false,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders room label correctly', () => {
    render(<RoomCard {...defaultProps} />);
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });

  it('renders room icon', () => {
    render(<RoomCard {...defaultProps} />);
    // The icon is rendered with aria-hidden
    const button = screen.getByRole('radio');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onSelect when clicked', () => {
    render(<RoomCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('radio'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('kitchen');
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows selected state styling', () => {
    render(<RoomCard {...defaultProps} isSelected={true} />);
    const button = screen.getByRole('radio');
    expect(button).toHaveClass('border-blue-500', 'bg-blue-50');
    expect(button).toHaveAttribute('aria-checked', 'true');
  });

  it('shows unselected state styling', () => {
    render(<RoomCard {...defaultProps} isSelected={false} />);
    const button = screen.getByRole('radio');
    expect(button).toHaveClass('border-gray-200', 'bg-white');
    expect(button).toHaveAttribute('aria-checked', 'false');
  });

  it('shows disabled state and prevents clicks', () => {
    render(<RoomCard {...defaultProps} isDisabled={true} />);
    const button = screen.getByRole('radio');
    expect(button).toHaveClass('border-gray-200', 'bg-gray-50', 'text-gray-400', 'cursor-not-allowed');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('has correct ARIA role="radio"', () => {
    render(<RoomCard {...defaultProps} />);
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  it('has correct aria-checked attribute', () => {
    const { rerender } = render(<RoomCard {...defaultProps} isSelected={false} />);
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'false');

    rerender(<RoomCard {...defaultProps} isSelected={true} />);
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true');
  });

  it('has correct aria-disabled attribute', () => {
    const { rerender } = render(<RoomCard {...defaultProps} isDisabled={false} />);
    expect(screen.getByRole('radio')).toHaveAttribute('aria-disabled', 'false');

    rerender(<RoomCard {...defaultProps} isDisabled={true} />);
    expect(screen.getByRole('radio')).toHaveAttribute('aria-disabled', 'true');
  });

  it('handles keyboard Enter key', async () => {
    const user = userEvent.setup();
    render(<RoomCard {...defaultProps} />);
    const button = screen.getByRole('radio');

    button.focus();
    await user.keyboard('{Enter}');

    expect(defaultProps.onSelect).toHaveBeenCalledWith('kitchen');
  });

  it('handles keyboard Space key', async () => {
    const user = userEvent.setup();
    render(<RoomCard {...defaultProps} />);
    const button = screen.getByRole('radio');

    button.focus();
    await user.keyboard(' ');

    expect(defaultProps.onSelect).toHaveBeenCalledWith('kitchen');
  });

  it('does not trigger onSelect on keyboard when disabled', async () => {
    const user = userEvent.setup();
    render(<RoomCard {...defaultProps} isDisabled={true} />);
    const button = screen.getByRole('radio');

    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<RoomCard {...defaultProps} className="custom-class" />);
    expect(screen.getByRole('radio')).toHaveClass('custom-class');
  });

  it('handles unknown icon name gracefully (falls back to MapPin)', () => {
    render(<RoomCard {...defaultProps} icon="unknown-icon-name" />);
    // Should render without error - MapPin is the fallback
    const button = screen.getByRole('radio');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders different room types correctly', () => {
    const roomTypes = [
      { room: 'laundry' as const, label: 'Laundry Room', icon: 'shirt' },
      { room: 'bedroom' as const, label: 'Bedroom', icon: 'bed' },
      { room: 'bathroom' as const, label: 'Bathroom', icon: 'shower-head' },
      { room: 'living-room' as const, label: 'Living Room', icon: 'sofa' },
    ];

    roomTypes.forEach(({ room, label, icon }) => {
      const { unmount } = render(
        <RoomCard
          room={room}
          label={label}
          icon={icon}
          isSelected={false}
          onSelect={defaultProps.onSelect}
        />
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it('has focus-visible ring styling', () => {
    render(<RoomCard {...defaultProps} />);
    const button = screen.getByRole('radio');
    expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-blue-500');
  });

  it('has proper touch target size', () => {
    render(<RoomCard {...defaultProps} />);
    const button = screen.getByRole('radio');
    expect(button).toHaveClass('min-h-[100px]');
  });
});
