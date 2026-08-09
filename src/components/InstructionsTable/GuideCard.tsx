'use client';

/**
 * GuideCard Component
 *
 * A card component for displaying guides in the grid view of the Guides list page.
 * Shows guide title, item name, room, purpose badge, and edit action.
 *
 * @module InstructionsTable/GuideCard
 * @see docs/req-220-toolbar-infrastructure-guides-list-overview.md
 * @lastModified 2026-01-22 18:35 (REQ-E02-074 - L10N)
 */

import { Pencil, FileText, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { InstructionRow } from './InstructionsTable.types';
import { DebugBadge } from '@/components/DebugBadge';

// =============================================================================
// Types
// =============================================================================

export interface GuideCardProps {
  /** The guide data to display */
  guide: InstructionRow;
  /** Callback when edit button is clicked */
  onEdit: (articleId: string) => void;
  /** Optional additional CSS classes */
  className?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get badge color for purpose type
 */
function getPurposeBadgeColor(purpose: string): string {
  switch (purpose) {
    case 'how_to_use':
    case 'how-to-use':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'troubleshooting':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'how_to_clean':
    case 'how-to-clean':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'safety_info':
    case 'safety-info':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'maintenance':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'features':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Format purpose label for display
 */
function formatPurposeLabel(purpose: string): string {
  return purpose
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

// =============================================================================
// Component
// =============================================================================

export function GuideCard({ guide, onEdit, className }: GuideCardProps) {
  const t = useTranslations('articles.card');
  const purposeBadgeColor = getPurposeBadgeColor(guide.purpose);
  const formattedPurpose = formatPurposeLabel(guide.purpose);
  const formattedDate = formatDate(guide.createdAt);

  // Handle card click - opens edit
  const handleCardClick = () => {
    onEdit(guide.articleId);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit(guide.articleId);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`${guide.articleTitle} - ${guide.itemName} - ${formattedPurpose}. Press Enter to edit.`}
      className={cn(
        'group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200',
        'transition-all duration-200 overflow-hidden',
        'hover:shadow-lg hover:border-gray-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2',
        className
      )}
    >
      {/* Header Section with Purpose Badge */}
      <div className="relative h-20 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        {/* Document Icon */}
        <FileText className="w-10 h-10 text-gray-300" aria-hidden="true" />

        {/* Debug Badge - Article ID */}
        <DebugBadge
          id={guide.articleId}
          type="guide"
          size="xs"
          position="absolute-top-left"
        />

        {/* Purpose Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
              purposeBadgeColor
            )}
          >
            {formattedPurpose}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-[#FF385C] transition-colors">
          {guide.articleTitle}
        </h3>

        {/* Item Name */}
        <p className="text-xs text-gray-500 mt-1 truncate">
          {guide.itemName}
        </p>

        {/* Room and Date Row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          {/* Room */}
          {guide.room ? (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Home className="w-3 h-3" aria-hidden="true" />
              <span className="truncate max-w-[100px]">{guide.room}</span>
            </div>
          ) : (
            <div /> // Empty spacer
          )}

          {/* Created Date */}
          {formattedDate && (
            <span className="text-xs text-gray-400">
              {formattedDate}
            </span>
          )}
        </div>

        {/* Edit Button - visible on hover or always on mobile */}
        <div className="mt-3 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(guide.articleId);
            }}
            className={cn(
              'w-full flex items-center justify-center gap-1.5',
              'px-3 py-2 text-sm font-medium',
              'text-[#FF385C] bg-[#FFEEEF] hover:bg-[#FFE0E4]',
              'rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1'
            )}
            aria-label={`${t('edit')} ${guide.articleTitle}`}
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            <span>{t('edit')}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default GuideCard;
