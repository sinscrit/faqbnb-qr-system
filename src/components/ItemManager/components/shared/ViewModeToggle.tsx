'use client';

/**
 * ViewModeToggle Component
 *
 * Toggle control for switching between grid and list view modes.
 * Provides clear visual indication of the current selection.
 *
 * @module ItemManager/components/shared/ViewModeToggle
 * @lastModified 2026-01-22 (REQ-E02-079 Task 1) - Added i18n for aria-labels
 */

import { LayoutGrid, List } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ViewModeToggleProps } from '../../ItemManager.types';

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
  disabled = false,
  className,
}: ViewModeToggleProps) {
  const t = useTranslations('items');

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      role="group"
      aria-label={t('view.toggle')}
    >
      <button
        type="button"
        onClick={() => onViewModeChange('grid')}
        disabled={disabled}
        aria-label={t('view.grid')}
        aria-pressed={viewMode === 'grid'}
        className={cn(
          "p-2 rounded-md transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2",
          viewMode === 'grid'
            ? "bg-white text-[#FF385C] shadow-sm"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
          disabled && "pointer-events-none"
        )}
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('list')}
        disabled={disabled}
        aria-label={t('view.list')}
        aria-pressed={viewMode === 'list'}
        className={cn(
          "p-2 rounded-md transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2",
          viewMode === 'list'
            ? "bg-white text-[#FF385C] shadow-sm"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
          disabled && "pointer-events-none"
        )}
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );
}

export default ViewModeToggle;
