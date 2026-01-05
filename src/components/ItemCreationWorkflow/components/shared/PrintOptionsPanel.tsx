'use client';

/**
 * PrintOptionsPanel Component
 *
 * Provides print scope selection (All Items, New Items Only, Select Items)
 * with item selection list for selective printing of QR codes.
 * Includes action buttons for Generate PDF, Print Directly, and Done for Now.
 *
 * @module ItemCreationWorkflow/components/shared/PrintOptionsPanel
 * @see docs/REQ-110-print-options-panel-overview.md
 * @lastModified 2026-01-05 (REQ-110 Print Options Panel)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  FileDown,
  Printer,
  SkipForward,
  Check,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Video,
  Image,
  FileText,
  Type,
  Link,
  Package,
  Loader2,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionItem, PrintScope, ContentPiece, ContentType, ContentData } from '../../ItemCreationWorkflow.types';
import { ROOM_LABELS } from '../../utils/constants';
import type { RoomTypeConst } from '../../utils/constants';

// =============================================================================
// Type Definitions
// =============================================================================

export interface PrintOptionsPanelProps {
  /** Items from current session */
  sessionItems: SessionItem[];
  /** Previously existing items */
  existingItems?: SessionItem[];
  /** Callback when user wants to generate PDF */
  onGeneratePDF: (scope: PrintScope) => Promise<void>;
  /** Callback when user wants to print directly */
  onPrintDirect: (scope: PrintScope) => Promise<void>;
  /** Callback when user wants to skip printing */
  onSkipPrint: () => void;
  /** Whether a print operation is in progress */
  isProcessing?: boolean;
  /** Status message during processing */
  processingStatus?: string;
  /** Error message to display */
  error?: string | null;
  /** Callback to clear error */
  onClearError?: () => void;
  /** Optional CSS class */
  className?: string;
}

/** Scope type for internal state */
type ScopeType = 'all' | 'new-only' | 'selected';

// =============================================================================
// Constants
// =============================================================================

const TYPE_CONFIG = {
  video: { icon: Video, color: 'bg-purple-100 text-purple-600' },
  photo: { icon: Image, color: 'bg-blue-100 text-blue-600' },
  pdf: { icon: FileText, color: 'bg-amber-100 text-amber-600' },
  text: { icon: Type, color: 'bg-green-100 text-green-600' },
  url: { icon: Link, color: 'bg-indigo-100 text-indigo-600' },
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Gets a thumbnail element for an item based on its first content piece.
 */
function getItemThumbnail(
  content: ContentPiece[],
  urlsRef: React.MutableRefObject<string[]>
): React.ReactNode {
  if (content.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <Package className="w-5 h-5 text-gray-400" aria-hidden="true" />
      </div>
    );
  }

  const firstContent = content[0];
  const config = TYPE_CONFIG[firstContent.type];
  const TypeIcon = config.icon;

  switch (firstContent.type) {
    case 'video': {
      const videoData = firstContent.data as Extract<ContentData, { type: 'video' }>;
      if (videoData.file) {
        const url = URL.createObjectURL(videoData.file);
        urlsRef.current.push(url);
        return (
          <div className="relative w-full h-full">
            <video
              src={url}
              className="w-full h-full object-cover"
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Video className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
          </div>
        );
      }
      return (
        <div className={cn('w-full h-full flex items-center justify-center', config.color)}>
          <TypeIcon className="w-5 h-5" aria-hidden="true" />
        </div>
      );
    }

    case 'photo': {
      const photoData = firstContent.data as Extract<ContentData, { type: 'photo' }>;
      if (photoData.file) {
        const url = URL.createObjectURL(photoData.file);
        urlsRef.current.push(url);
        return (
          <img
            src={url}
            alt="Item photo"
            className="w-full h-full object-cover"
          />
        );
      }
      return (
        <div className={cn('w-full h-full flex items-center justify-center', config.color)}>
          <TypeIcon className="w-5 h-5" aria-hidden="true" />
        </div>
      );
    }

    case 'pdf':
    case 'text':
    case 'url':
    default: {
      return (
        <div className={cn('w-full h-full flex items-center justify-center', config.color)}>
          <TypeIcon className="w-5 h-5" aria-hidden="true" />
        </div>
      );
    }
  }
}

// =============================================================================
// Scope Option Configuration
// =============================================================================

interface ScopeOption {
  value: ScopeType;
  title: string;
  description: string;
  getCount: ((sessionItems: SessionItem[], existingItems: SessionItem[]) => number) | null;
}

const SCOPE_OPTIONS: ScopeOption[] = [
  {
    value: 'all',
    title: 'All Items',
    description: 'Include new and existing items',
    getCount: (sessionItems, existingItems) => sessionItems.length + existingItems.length,
  },
  {
    value: 'new-only',
    title: 'New Items Only',
    description: 'Only items created in this session',
    getCount: (sessionItems) => sessionItems.length,
  },
  {
    value: 'selected',
    title: 'Select Items',
    description: 'Choose specific items to print',
    getCount: null, // Shows selected count instead
  },
];

// =============================================================================
// Sub-Components
// =============================================================================

interface ScopeCardProps {
  option: ScopeOption;
  isSelected: boolean;
  count: number;
  selectedCount?: number;
  onSelect: () => void;
  tabIndex: number;
}

function ScopeCard({
  option,
  isSelected,
  count,
  selectedCount,
  onSelect,
  tabIndex,
}: ScopeCardProps) {
  const displayCount = option.value === 'selected' && selectedCount !== undefined
    ? selectedCount
    : count;

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={tabIndex}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer',
        'transition-all duration-150',
        isSelected
          ? 'border-[#FF385C] bg-pink-50'
          : 'border-gray-200 bg-white hover:border-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2'
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {/* Selection indicator */}
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              isSelected
                ? 'border-[#FF385C] bg-[#FF385C]'
                : 'border-gray-300 bg-white'
            )}
            aria-hidden="true"
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="font-medium text-[#222222]">{option.title}</span>
        </div>
        <p className="text-sm text-[#717171] mt-1 ml-7">{option.description}</p>
      </div>

      {/* Item count badge */}
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium flex-shrink-0',
          isSelected
            ? 'bg-[#FF385C] text-white'
            : 'bg-gray-100 text-gray-700'
        )}
      >
        {displayCount}
      </span>
    </div>
  );
}

interface SelectableItemRowProps {
  item: SessionItem;
  isSelected: boolean;
  isNew: boolean;
  onToggle: () => void;
  urlsRef: React.MutableRefObject<string[]>;
}

function SelectableItemRow({
  item,
  isSelected,
  isNew,
  onToggle,
  urlsRef,
}: SelectableItemRowProps) {
  const roomLabel = ROOM_LABELS[item.room as RoomTypeConst] || item.room;
  const checkboxId = `item-checkbox-${item.id}`;

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer',
        'border border-gray-200 bg-white',
        'transition-all duration-150',
        'hover:bg-gray-50 hover:border-gray-300',
        'min-h-[56px]' // Ensure minimum touch target
      )}
    >
      {/* Checkbox */}
      <input
        id={checkboxId}
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className={cn(
          'w-5 h-5 rounded border-gray-300 flex-shrink-0',
          'text-[#FF385C] focus:ring-[#FF385C]'
        )}
      />

      {/* Thumbnail */}
      <div
        className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-gray-100"
        aria-hidden="true"
      >
        {getItemThumbnail(item.content, urlsRef)}
      </div>

      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#222222] truncate" title={item.name}>
            {item.name}
          </span>
          {isNew && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-pink-100 text-[#FF385C]">
              New
            </span>
          )}
        </div>
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 mt-0.5"
          aria-label={`Room: ${roomLabel}`}
        >
          {roomLabel}
        </span>
      </div>
    </label>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function PrintOptionsPanel({
  sessionItems,
  existingItems = [],
  onGeneratePDF,
  onPrintDirect,
  onSkipPrint,
  isProcessing = false,
  processingStatus,
  error,
  onClearError,
  className,
}: PrintOptionsPanelProps) {
  // Internal state
  const [scopeType, setScopeType] = useState<ScopeType>('new-only');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => {
    // Initialize with all session items selected
    return new Set(sessionItems.map(item => item.id));
  });
  const [isSelectionExpanded, setIsSelectionExpanded] = useState(false);

  // Ref for tracking object URLs for cleanup
  const urlsRef = useRef<string[]>([]);

  // Ref for first checkbox (for focus management)
  const firstCheckboxRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Expand selection list when scopeType changes to 'selected'
  useEffect(() => {
    if (scopeType === 'selected') {
      setIsSelectionExpanded(true);
      // Focus first checkbox after a short delay for the animation
      setTimeout(() => {
        const firstCheckbox = document.querySelector<HTMLInputElement>('[id^="item-checkbox-"]');
        if (firstCheckbox) {
          firstCheckbox.focus();
        }
      }, 100);
    } else {
      setIsSelectionExpanded(false);
    }
  }, [scopeType]);

  // Combine all items for selection list
  const allItems = [...sessionItems, ...existingItems];

  // Calculate counts
  const sessionItemIds = new Set(sessionItems.map(item => item.id));
  const selectedCount = selectedItemIds.size;
  const isAllSelected = selectedCount === allItems.length;
  const isNoneSelected = selectedCount === 0;
  const isIndeterminate = !isAllSelected && !isNoneSelected;

  // Build PrintScope from current state
  const buildPrintScope = useCallback((): PrintScope => {
    switch (scopeType) {
      case 'all':
        return { type: 'all' };
      case 'new-only':
        return { type: 'new-only' };
      case 'selected':
        return { type: 'selected', itemIds: Array.from(selectedItemIds) };
    }
  }, [scopeType, selectedItemIds]);

  // Check if actions should be disabled
  const isActionsDisabled = isProcessing || (scopeType === 'selected' && selectedCount === 0);

  // Toggle individual item selection
  const handleToggleItem = useCallback((itemId: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  // Select/Deselect all
  const handleToggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(allItems.map(item => item.id)));
    }
  }, [isAllSelected, allItems]);

  // Handle scope selection with keyboard navigation
  const handleScopeKeyDown = useCallback((e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % SCOPE_OPTIONS.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + SCOPE_OPTIONS.length) % SCOPE_OPTIONS.length;
    }

    if (nextIndex !== currentIndex) {
      setScopeType(SCOPE_OPTIONS[nextIndex].value);
      // Focus the new option
      const radioGroup = document.querySelector('[role="radiogroup"]');
      const radios = radioGroup?.querySelectorAll('[role="radio"]');
      if (radios && radios[nextIndex]) {
        (radios[nextIndex] as HTMLElement).focus();
      }
    }
  }, []);

  // Handle Generate PDF click
  const handleGeneratePDF = useCallback(async () => {
    const scope = buildPrintScope();
    await onGeneratePDF(scope);
  }, [buildPrintScope, onGeneratePDF]);

  // Handle Print Directly click
  const handlePrintDirect = useCallback(async () => {
    const scope = buildPrintScope();
    await onPrintDirect(scope);
  }, [buildPrintScope, onPrintDirect]);

  // Dismiss error and return focus
  const handleDismissError = useCallback(() => {
    onClearError?.();
  }, [onClearError]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
        {/* Header */}
        <h2
          id="print-options-heading"
          className="text-lg font-semibold text-[#222222]"
        >
          Which items would you like to print?
        </h2>

        {/* Scope Selection Radio Cards */}
        <div
          role="radiogroup"
          aria-labelledby="print-options-heading"
          className="space-y-3"
        >
          {SCOPE_OPTIONS.map((option, index) => {
            const isSelected = scopeType === option.value;
            const count = option.getCount
              ? option.getCount(sessionItems, existingItems)
              : selectedCount;

            return (
              <div
                key={option.value}
                onKeyDown={(e) => handleScopeKeyDown(e, index)}
              >
                <ScopeCard
                  option={option}
                  isSelected={isSelected}
                  count={count}
                  selectedCount={option.value === 'selected' ? selectedCount : undefined}
                  onSelect={() => setScopeType(option.value)}
                  tabIndex={isSelected ? 0 : -1}
                />
              </div>
            );
          })}
        </div>

        {/* Item Selection List (visible when scopeType is 'selected') */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            isSelectionExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          {scopeType === 'selected' && (
            <div
              role="listbox"
              aria-label="Select items to print"
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Select All Header */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 border-b border-gray-200">
                <input
                  type="checkbox"
                  id="select-all-checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isIndeterminate;
                    }
                  }}
                  onChange={handleToggleAll}
                  className={cn(
                    'w-5 h-5 rounded border-gray-300',
                    'text-[#FF385C] focus:ring-[#FF385C]'
                  )}
                />
                <label
                  htmlFor="select-all-checkbox"
                  className="flex-1 font-medium text-[#222222] cursor-pointer"
                >
                  {isAllSelected ? 'Deselect All' : 'Select All'}
                  <span className="text-[#717171] font-normal ml-2">
                    ({selectedCount} of {allItems.length} selected)
                  </span>
                </label>
              </div>

              {/* Item List */}
              <div className="max-h-[280px] overflow-y-auto p-2 space-y-2">
                {allItems.map((item) => (
                  <SelectableItemRow
                    key={item.id}
                    item={item}
                    isSelected={selectedItemIds.has(item.id)}
                    isNew={sessionItemIds.has(item.id)}
                    onToggle={() => handleToggleItem(item.id)}
                    urlsRef={urlsRef}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live region for screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {selectedCount} items selected for printing
        </div>
      </div>

      {/* Sticky Footer with Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg',
              'bg-red-50 border-l-4 border-[#FF5A5F]'
            )}
          >
            <AlertCircle className="w-5 h-5 text-[#FF5A5F] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#222222]">{error}</p>
              <p className="text-xs text-[#717171] mt-1">Please try again or skip for now.</p>
            </div>
            {onClearError && (
              <button
                type="button"
                onClick={handleDismissError}
                className={cn(
                  'p-1 rounded-lg flex-shrink-0',
                  'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-[#FF385C]'
                )}
                aria-label="Dismiss error"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && processingStatus && (
          <div className="flex items-center justify-center gap-2 py-2 text-[#717171]">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span className="text-sm">{processingStatus}</span>
          </div>
        )}

        {/* Generate PDF Button */}
        <button
          type="button"
          onClick={handleGeneratePDF}
          disabled={isActionsDisabled}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2',
            'px-6 py-3 rounded-lg',
            'bg-[#FF385C] text-white font-medium',
            'hover:bg-[#E31C5F] active:bg-[#C81856]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[48px]'
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="w-5 h-5" aria-hidden="true" />
              Generate PDF
            </>
          )}
        </button>

        {/* Print Directly Button */}
        <button
          type="button"
          onClick={handlePrintDirect}
          disabled={isActionsDisabled}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2',
            'px-6 py-3 rounded-lg',
            'border border-gray-300 text-[#222222] font-medium',
            'hover:bg-gray-50',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[48px]'
          )}
        >
          <Printer className="w-5 h-5" aria-hidden="true" />
          Print Directly
        </button>

        {/* Done for Now Link */}
        <button
          type="button"
          onClick={onSkipPrint}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2',
            'px-4 py-2',
            'text-[#717171] font-medium',
            'hover:text-[#222222]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2'
          )}
        >
          <SkipForward className="w-4 h-4" aria-hidden="true" />
          Done for Now
        </button>
      </div>
    </div>
  );
}

export default PrintOptionsPanel;
