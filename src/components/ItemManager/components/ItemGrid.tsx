'use client';

/**
 * ItemGrid Component
 *
 * Renders items in a responsive multi-column grid layout.
 * Each item is displayed using the ItemCard component.
 *
 * @module ItemManager/components/ItemGrid
 * @lastModified 2026-01-03 (REQ-090 Task 4 - Added accessibility features)
 */

import { cn } from '@/lib/utils';
import { ItemCard } from './ItemCard';
import type { ItemGridProps } from '../ItemManager.types';

export function ItemGrid({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  loading,
}: ItemGridProps & { loading?: boolean }) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 lg:gap-6",
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
        className
      )}
      role="grid"
      aria-label={`${items.length} item${items.length !== 1 ? 's' : ''}`}
      aria-busy={loading}
      aria-describedby={items.length === 0 ? 'empty-message-grid' : undefined}
    >
      {items.map((item) => (
        <div key={item.id} role="gridcell">
          <ItemCard
            item={item}
            onPreviewClick={onItemPreview}
            onSelectionChange={onSelectionChange}
            isSelected={selectedIds.has(item.id)}
            isSelectionMode={isSelectionMode}
            enableInlineEdit={enableInlineEdit}
            onUpdateItem={onUpdateItem}
            existingTags={existingTags}
          />
        </div>
      ))}
    </div>
  );
}

export default ItemGrid;
