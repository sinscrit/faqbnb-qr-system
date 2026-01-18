/**
 * ItemTypeCard Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/ItemTypeCard.test
 * @lastModified 2026-01-05
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Zap } from 'lucide-react';
import { ItemTypeCard, ITEM_TYPE_ICONS } from '../ItemTypeCard';

describe('ItemTypeCard', () => {
  const defaultProps = {
    itemType: 'appliance' as const,
    label: 'Appliance',
    description: 'Washer, dryer, stove, refrigerator, etc.',
    icon: Zap,
    isSelected: false,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders label correctly', () => {
    render(<ItemTypeCard {...defaultProps} />);
    expect(screen.getByText('Appliance')).toBeInTheDocument();
  });

  it('renders description correctly', () => {
    render(<ItemTypeCard {...defaultProps} />);
    expect(screen.getByText('Washer, dryer, stove, refrigerator, etc.')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<ItemTypeCard {...defaultProps} />);
    const button = screen.getByRole('radio');
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onSelect when clicked', () => {
    render(<ItemTypeCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('radio'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('appliance');
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows selected state styling', () => {
    render(<ItemTypeCard {...defaultProps} isSelected={true} />);
    const button = screen.getByRole('radio');
    expect(button).toHaveClass('border-blue-500', 'bg-blue-50');
    expect(button).toHaveAttribute('aria-checked', 'true');
  });

  it('shows unselected state styling', () => {
    render(<ItemTypeCard {...defaultProps} isSelected={false} />);
    const button = screen.getByRole('radio');
    expect(button).toHaveClass('border-gray-200', 'bg-white');
    expect(button).toHaveAttribute('aria-checked', 'false');
  });

  it('shows checkmark when selected', () => {
    render(<ItemTypeCard {...defaultProps} isSelected={true} />);
    // The Check icon is rendered when selected
    const button = screen.getByRole('radio');
    const svgs = button.querySelectorAll('svg');
    // Should have 2 SVGs: the item type icon and the checkmark
    expect(svgs.length).toBe(2);
  });

  it('does not show checkmark when unselected', () => {
    render(<ItemTypeCard {...defaultProps} isSelected={false} />);
    const button = screen.getByRole('radio');
    const svgs = button.querySelectorAll('svg');
    // Should only have 1 SVG: the item type icon
    expect(svgs.length).toBe(1);
  });

  it('has correct ARIA role="radio"', () => {
    render(<ItemTypeCard {...defaultProps} />);
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  it('has correct aria-checked attribute', () => {
    const { rerender } = render(<ItemTypeCard {...defaultProps} isSelected={false} />);
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'false');

    rerender(<ItemTypeCard {...defaultProps} isSelected={true} />);
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true');
  });

  it('has aria-describedby linking to description', () => {
    render(<ItemTypeCard {...defaultProps} />);
    const button = screen.getByRole('radio');
    expect(button).toHaveAttribute('aria-describedby', 'appliance-description');

    const descriptionElement = document.getElementById('appliance-description');
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement).toHaveTextContent('Washer, dryer, stove, refrigerator, etc.');
  });

  it('handles keyboard Enter key', async () => {
    const user = userEvent.setup();
    render(<ItemTypeCard {...defaultProps} />);
    const button = screen.getByRole('radio');

    button.focus();
    await user.keyboard('{Enter}');

    expect(defaultProps.onSelect).toHaveBeenCalledWith('appliance');
  });

  it('handles keyboard Space key', async () => {
    const user = userEvent.setup();
    render(<ItemTypeCard {...defaultProps} />);
    const button = screen.getByRole('radio');

    button.focus();
    await user.keyboard(' ');

    expect(defaultProps.onSelect).toHaveBeenCalledWith('appliance');
  });

  it('applies custom className', () => {
    render(<ItemTypeCard {...defaultProps} className="custom-class" />);
    expect(screen.getByRole('radio')).toHaveClass('custom-class');
  });

  it('renders different item types correctly', () => {
    const itemTypes = [
      { itemType: 'room-item' as const, label: 'Room Item', description: 'Pantry, cabinets, closet, sink, etc.' },
      { itemType: 'general-info' as const, label: 'General Info', description: 'Trash schedule, WiFi info, house rules, etc.' },
    ];

    itemTypes.forEach(({ itemType, label, description }) => {
      const { unmount } = render(
        <ItemTypeCard
          itemType={itemType}
          label={label}
          description={description}
          icon={ITEM_TYPE_ICONS[itemType]}
          isSelected={false}
          onSelect={defaultProps.onSelect}
        />
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
      unmount();
    });
  });

  it('has focus-visible ring styling', () => {
    render(<ItemTypeCard {...defaultProps} />);
    const button = screen.getByRole('radio');
    expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-blue-500');
  });

  it('has proper touch target size', () => {
    render(<ItemTypeCard {...defaultProps} />);
    const button = screen.getByRole('radio');
    expect(button).toHaveClass('min-h-[120px]');
  });

  it('exports ITEM_TYPE_ICONS mapping', () => {
    expect(ITEM_TYPE_ICONS).toBeDefined();
    expect(ITEM_TYPE_ICONS['appliance']).toBeDefined();
    expect(ITEM_TYPE_ICONS['room-item']).toBeDefined();
    expect(ITEM_TYPE_ICONS['general-info']).toBeDefined();
  });

  it('has horizontal layout with gap', () => {
    render(<ItemTypeCard {...defaultProps} />);
    const button = screen.getByRole('radio');
    expect(button).toHaveClass('flex', 'items-center', 'gap-4');
  });

  it('has text content aligned left', () => {
    const { container } = render(<ItemTypeCard {...defaultProps} />);
    const textContainer = container.querySelector('.text-left');
    expect(textContainer).toBeInTheDocument();
  });
});
