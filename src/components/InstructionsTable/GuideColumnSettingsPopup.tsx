'use client';

/**
 * GuideColumnSettingsPopup Component
 *
 * Dropdown popup for toggling column visibility in InstructionsTable.
 * Uses Radix UI DropdownMenu for accessible, keyboard-navigable menu.
 *
 * @module InstructionsTable/components/GuideColumnSettingsPopup
 * @see docs/req-220-toolbar-infrastructure-guides-list-overview.md
 * @lastModified 2026-01-13 (REQ-220 - Added property column option)
 */

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Settings2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GuideColumnVisibilityState } from './InstructionsTable.types';

// ============================================================================
// Types
// ============================================================================

export interface GuideColumnSettingsPopupProps {
  /** Current column visibility state */
  columnVisibility: GuideColumnVisibilityState;
  /** Callback to toggle a column's visibility */
  onToggleColumn: (column: keyof GuideColumnVisibilityState) => void;
  /** Custom class name for the trigger button */
  className?: string;
}

// ============================================================================
// Column Configuration
// ============================================================================

interface ColumnOption {
  key: keyof GuideColumnVisibilityState;
  label: string;
}

const COLUMN_OPTIONS: ColumnOption[] = [
  { key: 'room', label: 'Room' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'property', label: 'Property' }, // REQ-220
];

// ============================================================================
// Component
// ============================================================================

export function GuideColumnSettingsPopup({
  columnVisibility,
  onToggleColumn,
  className,
}: GuideColumnSettingsPopupProps) {
  return (
    <DropdownMenu.Root>
      {/* Trigger Button - Gear Icon */}
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center justify-center',
            'w-8 h-8 rounded-md',
            'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            'transition-colors duration-150',
            className
          )}
          aria-label="Column settings"
        >
          <Settings2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      {/* Dropdown Portal */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 min-w-[180px]',
            'bg-white rounded-lg shadow-lg',
            'border border-gray-200',
            'py-1',
            'animate-fade-in'
          )}
          align="end"
          side="bottom"
          sideOffset={4}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Show Columns
            </p>
          </div>

          {/* Column Toggle Options */}
          {COLUMN_OPTIONS.map((option) => {
            const isChecked = columnVisibility[option.key];

            return (
              <DropdownMenu.CheckboxItem
                key={option.key}
                checked={isChecked}
                onCheckedChange={() => onToggleColumn(option.key)}
                className={cn(
                  'relative flex items-center gap-3',
                  'px-3 py-3 min-h-[48px]',
                  'text-sm cursor-pointer',
                  'outline-none',
                  'transition-colors duration-100',
                  'focus:bg-gray-50',
                  isChecked
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {/* Checkbox Indicator */}
                <div className={cn(
                  'w-5 h-5 flex items-center justify-center flex-shrink-0',
                  'rounded border',
                  isChecked
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300 bg-white'
                )}>
                  {isChecked && (
                    <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  )}
                </div>

                {/* Label */}
                <span>{option.label}</span>
              </DropdownMenu.CheckboxItem>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default GuideColumnSettingsPopup;
