'use client';

/**
 * ItemList Component
 *
 * Renders items in a vertical list layout with table-like structure.
 * Each item is displayed using the ItemRow component.
 *
 * @module ItemManager/components/ItemList
 * @lastModified 2026-01-04 (REQ-069 - Added onLongPressSelect prop support)
 */

import { cn } from '@/lib/utils';
import { ItemRow } from './ItemRow';
import type { ItemListProps, ItemRecordExtended, SortOption } from '../ItemManager.types';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface SortableColumnHeaderProps {
  label: string;
  shortLabel?: string; // For mobile responsive display
  sortKeyAsc: SortOption;
  sortKeyDesc: SortOption;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

function SortableColumnHeader({
  label,
  shortLabel,
  sortKeyAsc,
  sortKeyDesc,
  currentSort,
  onSortChange,
  className,
}: SortableColumnHeaderProps) {
  const isActive = currentSort === sortKeyAsc || currentSort === sortKeyDesc;
  const isAscending = currentSort === sortKeyAsc;

  const handleClick = () => {
    if (currentSort === sortKeyDesc) {
      onSortChange(sortKeyAsc);
    } else {
      onSortChange(sortKeyDesc);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex items-center gap-1 text-xs font-medium uppercase tracking-wider',
        'hover:text-gray-700 transition-colors cursor-pointer',
        isActive ? 'text-gray-900' : 'text-gray-500',
        className
      )}
      aria-label={`Sort by ${label}`}
    >
      <span className="hidden md:inline">{label}</span>
      <span className="md:hidden">{shortLabel || label}</span>
      {isActive ? (
        isAscending ? (
          <ArrowUp className="h-3 w-3" aria-label="Ascending" />
        ) : (
          <ArrowDown className="h-3 w-3" aria-label="Descending" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
      )}
    </button>
  );
}

export function ItemList({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  onLongPressSelect,
  onEdit,
  onDelete,
  onManageAssets,
  onDuplicate,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  currentSort,
  onSortChange,
}: ItemListProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto",
        className
      )}
      role="table"
      aria-label={`${items.length} item${items.length !== 1 ? 's' : ''}`}
      aria-describedby={items.length === 0 ? 'empty-message-list' : undefined}
    >
      {/* Screen reader only table caption */}
      <div className="sr-only" role="caption">
        Item list showing {items.length} items.
        {isSelectionMode && ` Selection mode active with ${selectedIds.size} selected.`}
      </div>
      {/* Header Row - Hidden on mobile, role=rowgroup for table structure */}
      <div role="rowgroup" className="hidden md:block min-w-fit">
        <div
          role="row"
          className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          {isSelectionMode && <div role="columnheader" className="w-8 flex-shrink-0" aria-label="Selection" />}
          <div role="columnheader" className="w-12 flex-shrink-0" aria-label="Item preview" />
          {onSortChange ? (
            <SortableColumnHeader
              label="Title"
              sortKeyAsc="title-asc"
              sortKeyDesc="title-desc"
              currentSort={currentSort || 'created-desc'}
              onSortChange={onSortChange}
              className="flex-1 min-w-[120px]"
            />
          ) : (
            <div role="columnheader" className="flex-1 min-w-[120px]">Title</div>
          )}
          {onSortChange ? (
            <SortableColumnHeader
              label="Location"
              sortKeyAsc="location-asc"
              sortKeyDesc="location-asc"
              currentSort={currentSort || 'created-desc'}
              onSortChange={onSortChange}
              className="w-24 flex-shrink-0"
            />
          ) : (
            <div role="columnheader" className="w-24 flex-shrink-0">Location</div>
          )}
          {onSortChange ? (
            <SortableColumnHeader
              label="Instructions"
              shortLabel="Instr."
              sortKeyAsc="instructions-asc"
              sortKeyDesc="instructions-desc"
              currentSort={currentSort || 'created-desc'}
              onSortChange={onSortChange}
              className="w-20 flex-shrink-0"
            />
          ) : (
            <div role="columnheader" className="w-20 flex-shrink-0">
              <span className="hidden md:inline">Instructions</span>
              <span className="md:hidden">Instr.</span>
            </div>
          )}
          <div role="columnheader" className="hidden lg:block w-40 flex-shrink-0">Tags</div>
          {onSortChange ? (
            <SortableColumnHeader
              label="Created"
              sortKeyAsc="created-asc"
              sortKeyDesc="created-desc"
              currentSort={currentSort || 'created-desc'}
              onSortChange={onSortChange}
              className="w-28 flex-shrink-0"
            />
          ) : (
            <div role="columnheader" className="w-28 flex-shrink-0">Created</div>
          )}
          <div role="columnheader" className="w-10 flex-shrink-0 sticky right-0 bg-gray-50" aria-label="Actions" />
        </div>
      </div>

      {/* Item Rows - rowgroup for table body */}
      <div role="rowgroup" className="divide-y divide-gray-200 min-w-fit">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onPreviewClick={onItemPreview}
            onSelectionChange={onSelectionChange}
            isSelected={selectedIds.has(item.id)}
            isSelectionMode={isSelectionMode}
            onLongPressSelect={onLongPressSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageAssets={onManageAssets}
            onDuplicate={onDuplicate}
            enableInlineEdit={enableInlineEdit}
            onUpdateItem={onUpdateItem}
            existingTags={existingTags}
            articlesCount={(item as ItemRecordExtended).articlesCount}
          />
        ))}
      </div>
    </div>
  );
}

export default ItemList;
