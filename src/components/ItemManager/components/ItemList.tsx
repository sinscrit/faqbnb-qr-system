'use client';

/**
 * ItemList Component
 *
 * Renders items in a vertical list layout with table-like structure.
 * Each item is displayed using the ItemRow component.
 *
 * @module ItemManager/components/ItemList
 * @lastModified 2026-01-03 (REQ-060 Task 4)
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
}: ItemListProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
        className
      )}
      role="list"
      aria-label={`Item list with ${items.length} item${items.length !== 1 ? 's' : ''}`}
    >
      {/* Header Row - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
        {isSelectionMode && <div className="w-8 flex-shrink-0" aria-hidden="true" />}
        <div className="w-12 flex-shrink-0">Preview</div>
        <div className="flex-1 min-w-0">Title</div>
        <div className="w-24 flex-shrink-0">Location</div>
        <div className="hidden sm:block w-20 flex-shrink-0">Type</div>
        <div className="hidden lg:block w-40 flex-shrink-0">Tags</div>
        <div className="w-28 flex-shrink-0">Created</div>
        <div className="w-10 flex-shrink-0" aria-label="Actions" />
      </div>

      {/* Item Rows */}
      <div className="divide-y divide-gray-200">
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
          />
        ))}
      </div>
    </div>
  );
}

export default ItemList;
