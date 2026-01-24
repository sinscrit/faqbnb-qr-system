'use client';

/**
 * ItemGrid Component
 *
 * Renders items in a responsive multi-column grid layout.
 * Each item is displayed using the ItemCard component.
 * Optionally displays translation status indicator below each card.
 *
 * @module ItemManager/components/ItemGrid
 * @lastModified 2026-01-24 (REQ-E05-017 - Added translation status indicator support)
 */

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ItemCard } from './ItemCard';
import { TranslationStatusColumn } from '@/components/TranslationManagement/TranslationStatusColumn';
import type { ItemGridProps } from '../ItemManager.types';

export function ItemGrid({
  items,
  onItemPreview,
  onSelectionChange,
  selectedIds,
  isSelectionMode,
  onLongPressSelect,
  className,
  enableInlineEdit,
  onUpdateItem,
  existingTags,
  loading,
  // Translation status props (REQ-E05-017)
  showTranslationStatus,
  onTranslationStatusClick,
  translationStatuses,
}: ItemGridProps & { loading?: boolean }) {
  // REQ-E02-080: i18n translations for grid
  const t = useTranslations('items.grid');

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 lg:gap-6",
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
        className
      )}
      role="grid"
      aria-label={t('ariaLabel', { count: items.length })}
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
            onLongPressSelect={onLongPressSelect}
            enableInlineEdit={enableInlineEdit}
            onUpdateItem={onUpdateItem}
            existingTags={existingTags}
          />

          {/* REQ-E05-017: Translation Status Indicator */}
          {showTranslationStatus && translationStatuses?.[item.id] && (
            <div className="mt-2 flex justify-center">
              <TranslationStatusColumn
                entityId={item.id}
                entityType="item"
                translations={translationStatuses[item.id]}
                size="sm"
                onClick={() => onTranslationStatusClick?.(item)}
                showTooltip={true}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ItemGrid;
