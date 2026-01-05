'use client';

/**
 * NextActionStep Component
 * Step 8 of ItemCreationWorkflow - Decision point after item save.
 * @module ItemCreationWorkflow/components/steps/NextActionStep
 * @see docs/REQ-107-next-action-step-overview.md
 * @lastModified 2026-01-05 (REQ-108 Multi-Content Item Support)
 */

import { useRef, useCallback } from 'react';
import { Plus, Tag, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionItem } from '../../ItemCreationWorkflow.types';
import { SessionProgressBar } from '../shared/SessionProgressBar';
import { MAX_CONTENT_PIECES } from '../../utils/constants';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Props for the ActionCard internal sub-component.
 */
interface ActionCardProps {
  /** Icon component or element */
  icon: React.ReactNode;
  /** Background color for icon circle */
  iconBgColor: string;
  /** Action title */
  title: string;
  /** Action description */
  description: string;
  /** Click handler */
  onClick: () => void;
  /** Optional additional styles */
  className?: string;
}

/**
 * Props for the NextActionStep component.
 */
export interface NextActionStepProps {
  /** Number of items created in this session */
  itemsCreated: number;
  /** Last saved item in the session (null if no items saved yet) */
  lastSavedItem: SessionItem | null;
  /** Number of content pieces in the last saved item */
  lastItemContentCount?: number;
  /** Callback when user wants to add more content to the last item */
  onAddMore: () => void;
  /** Callback when user wants to start a new item */
  onTagNewItem: () => void;
  /** Callback when user is done with the session */
  onDone: () => void;
  /** Optional CSS class name */
  className?: string;
}

// =============================================================================
// ActionCard Sub-Component
// =============================================================================

/**
 * Internal ActionCard component for displaying action options.
 * Provides consistent styling and accessibility for all action cards.
 */
function ActionCard({
  icon,
  iconBgColor,
  title,
  description,
  onClick,
  className,
}: ActionCardProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${title}: ${description}`}
      className={cn(
        // Base styles
        'border border-gray-200 rounded-lg p-4 md:p-6',
        'flex items-start gap-4',
        'cursor-pointer select-none',
        // Hover and focus states
        'hover:bg-gray-50 transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
        // Touch-friendly min height
        'min-h-[80px]',
        className
      )}
    >
      {/* Icon Circle */}
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
          iconBgColor
        )}
      >
        {icon}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-[#222222]">{title}</h3>
        <p className="text-sm text-[#717171] mt-1">{description}</p>
      </div>
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Truncates a string to the specified max length with ellipsis.
 * @param text - The text to truncate
 * @param maxLength - Maximum character length (default: 40)
 * @returns Truncated text with ellipsis if needed
 */
function truncateText(text: string, maxLength: number = 40): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

// =============================================================================
// Main Component
// =============================================================================

export function NextActionStep({
  itemsCreated,
  lastSavedItem,
  lastItemContentCount = 0,
  onAddMore,
  onTagNewItem,
  onDone,
  className,
}: NextActionStepProps) {
  // Refs for keyboard navigation
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Get item name for "Add More" description
  const itemName = lastSavedItem?.name
    ? truncateText(lastSavedItem.name)
    : 'this item';

  // Handle arrow key navigation between cards
  const handleContainerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const currentIndex = cardRefs.current.findIndex(
        (ref) => ref === document.activeElement
      );

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, cardRefs.current.length - 1);
        cardRefs.current[nextIndex]?.focus();
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        cardRefs.current[prevIndex]?.focus();
      }
    },
    []
  );

  // Set ref for a card at a specific index
  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    },
    []
  );

  // Build list of visible cards
  const cards: {
    key: string;
    icon: React.ReactNode;
    iconBgColor: string;
    title: string;
    description: string;
    onClick: () => void;
  }[] = [];

  // "Add More to This Item" card - only show if:
  // 1. There's a last saved item, AND
  // 2. The item hasn't reached the content limit
  const canAddMore = lastSavedItem && lastItemContentCount < MAX_CONTENT_PIECES;

  if (canAddMore) {
    cards.push({
      key: 'add-more',
      icon: <Plus className="w-6 h-6 text-blue-600" aria-hidden="true" />,
      iconBgColor: 'bg-blue-100',
      title: 'Add More to This Item',
      description: lastItemContentCount >= MAX_CONTENT_PIECES - 1
        ? `Add one more piece to "${itemName}" (at limit after)`
        : `Add another video, photo, or document to "${itemName}"`,
      onClick: onAddMore,
    });
  }

  // "Tag New Item" card - always visible
  cards.push({
    key: 'tag-new',
    icon: <Tag className="w-6 h-6 text-green-600" aria-hidden="true" />,
    iconBgColor: 'bg-green-100',
    title: 'Tag New Item',
    description: 'Start creating another item for your property',
    onClick: onTagNewItem,
  });

  // "I'm Done" card - always visible
  cards.push({
    key: 'done',
    icon: <Check className="w-6 h-6 text-[#FF385C]" aria-hidden="true" />,
    iconBgColor: 'bg-[#FF385C]/10',
    title: "I'm Done",
    description: 'Review your items and print QR codes',
    onClick: onDone,
  });

  return (
    <div
      className={cn('flex flex-col gap-6 p-4 md:p-6', className)}
      aria-label="Choose your next action"
    >
      {/* Page Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[#222222]">What's Next?</h2>
        <p className="text-[#717171] mt-2">
          Choose what you'd like to do next
        </p>
      </div>

      {/* Session Progress */}
      <div role="status" aria-live="polite">
        <SessionProgressBar itemsCreated={itemsCreated} />
      </div>

      {/* Action Cards Container */}
      <div
        role="group"
        aria-label="Action options"
        className="flex flex-col gap-3"
        onKeyDown={handleContainerKeyDown}
      >
        {cards.map((card, index) => (
          <div key={card.key} ref={setCardRef(index)}>
            <ActionCard
              icon={card.icon}
              iconBgColor={card.iconBgColor}
              title={card.title}
              description={card.description}
              onClick={card.onClick}
            />
          </div>
        ))}
      </div>

      {/* Screen Reader Announcements */}
      <div aria-live="polite" className="sr-only">
        Step: What's Next? - {itemsCreated} items created in this session.
      </div>
    </div>
  );
}

export default NextActionStep;
