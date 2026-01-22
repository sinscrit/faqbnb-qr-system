// src/components/SimpleDashboard/BulkOperationsToolbar.tsx
// REQ-136: Bulk Operations Toolbar Component
// Created: 2026-01-06
// Last Modified: 2026-01-22 08:00:00 UTC - REQ-E02-052: Internationalized all UI strings

'use client';

import { useTranslations } from 'next-intl';
import { CheckSquare, Square, Printer, X } from 'lucide-react';

/**
 * Props for BulkOperationsToolbar component
 */
export interface BulkOperationsToolbarProps {
  /** Number of currently selected properties */
  selectedCount: number;
  /** Total number of properties */
  totalCount: number;
  /** Callback when Select All is clicked */
  onSelectAll: () => void;
  /** Callback when Deselect All is clicked */
  onDeselectAll: () => void;
  /** Callback when Print Selected is clicked */
  onPrintSelected: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Toolbar for bulk operations on properties
 * Visible at 'many' tier (16+ properties)
 *
 * Features:
 * - Checkbox for "Select All"
 * - Selected count display: "X selected"
 * - "Print Selected" button
 * - "Deselect All" button
 * - Airbnb Design Language System styling
 * - Disabled state when no selection
 *
 * @param selectedCount - Number of selected properties
 * @param totalCount - Total number of properties
 * @param onSelectAll - Callback for Select All action
 * @param onDeselectAll - Callback for Deselect All action
 * @param onPrintSelected - Callback for Print Selected action
 * @param className - Optional additional CSS classes
 */
export function BulkOperationsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onPrintSelected,
  className = '',
}: BulkOperationsToolbarProps) {
  const t = useTranslations('dashboard');
  const hasSelection = selectedCount > 0;
  const allSelected = selectedCount === totalCount && totalCount > 0;

  // Handle checkbox toggle
  const handleCheckboxClick = () => {
    if (allSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-4 ${className}`}
      role="toolbar"
      aria-label={t('bulk.toolbarAriaLabel')}
    >
      {/* Select All Checkbox */}
      <button
        type="button"
        onClick={handleCheckboxClick}
        className="flex items-center gap-2 min-h-[48px] px-3 py-2 rounded-lg hover:bg-[#F7F7F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]"
        aria-label={allSelected ? t('bulk.deselectAllAriaLabel') : t('bulk.selectAllAriaLabel')}
      >
        {allSelected ? (
          <CheckSquare className="w-5 h-5 text-[#FF385C]" />
        ) : (
          <Square className="w-5 h-5 text-[#717171]" />
        )}
        <span className="text-sm text-[#222222]">
          {allSelected ? t('bulk.allSelected') : t('bulk.selectAll')}
        </span>
      </button>

      {/* Selected Count */}
      {hasSelection && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F7F7] rounded-lg">
          <span className="text-sm font-medium text-[#222222]">
            {t('bulk.selectedCount', { count: selectedCount })}
          </span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="p-1 rounded-full hover:bg-[#E0E0E0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]"
            aria-label={t('bulk.clearSelectionAriaLabel')}
          >
            <X className="w-4 h-4 text-[#717171]" />
          </button>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Print Selected Button */}
      <button
        type="button"
        onClick={onPrintSelected}
        disabled={!hasSelection}
        className="flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-lg font-medium text-base bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white transition-all duration-200 ease-out hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
        aria-label={t('bulk.printAriaLabel', { count: selectedCount })}
      >
        <Printer className="w-5 h-5" />
        <span>{t('bulk.printSelected')}</span>
      </button>
    </div>
  );
}

export default BulkOperationsToolbar;
