'use client';

/**
 * ItemList Component
 *
 * Renders items in a vertical list layout with table-like structure.
 * Each item is displayed using the ItemRow component.
 *
 * @module ItemManager/components/ItemList
 * @lastModified 2026-01-03 (REQ-090 Task 5 - Added accessibility features)
 */

import { cn } from '@/lib/utils';
import { ItemRow } from './ItemRow';
import type { ItemListProps } from '../ItemManager.types';

export function ItemList({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  onEdit,
  onDelete,
  onManageAssets,
  onDuplicate,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
}: ItemListProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
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
      <div role="rowgroup" className="hidden md:block">
        <div
          role="row"
          className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          {isSelectionMode && <div role="columnheader" className="w-8 flex-shrink-0" aria-label="Selection" />}
          <div role="columnheader" className="w-12 flex-shrink-0">Preview</div>
          <div role="columnheader" className="flex-1 min-w-0">Title</div>
          <div role="columnheader" className="w-24 flex-shrink-0">Location</div>
          <div role="columnheader" className="hidden sm:block w-20 flex-shrink-0">Type</div>
          <div role="columnheader" className="hidden lg:block w-40 flex-shrink-0">Tags</div>
          <div role="columnheader" className="w-28 flex-shrink-0">Created</div>
          <div role="columnheader" className="w-10 flex-shrink-0" aria-label="Actions" />
        </div>
      </div>

      {/* Item Rows - rowgroup for table body */}
      <div role="rowgroup" className="divide-y divide-gray-200">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onPreviewClick={onItemPreview}
            onSelectionChange={onSelectionChange}
            isSelected={selectedIds.has(item.id)}
            isSelectionMode={isSelectionMode}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageAssets={onManageAssets}
            onDuplicate={onDuplicate}
            enableInlineEdit={enableInlineEdit}
            onUpdateItem={onUpdateItem}
            existingTags={existingTags}
          />
        ))}
      </div>
    </div>
  );
}

export default ItemList;
