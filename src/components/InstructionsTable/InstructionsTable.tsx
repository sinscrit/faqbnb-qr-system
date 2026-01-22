'use client';

/**
 * InstructionsTable Component
 * Created: 2026-01-12
 * REQ-212: Instructions List Page
 * @lastModified 2026-01-22 18:30 (REQ-E02-074 - L10N)
 *
 * Displays a table of instruction articles with item information.
 * Shows title, item name, room, property, purpose, and actions.
 * Supports sortable column headers and column visibility settings.
 */

import { Pencil, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { GuideColumnSettingsPopup } from './GuideColumnSettingsPopup';
import type { InstructionsTableProps, GuideSortOption } from './InstructionsTable.types';

// =============================================================================
// SortableColumnHeader Component (REQ-219)
// =============================================================================

interface SortableColumnHeaderProps {
  label: string;
  sortKeyAsc: GuideSortOption;
  sortKeyDesc: GuideSortOption;
  currentSort: GuideSortOption;
  onSortChange: (sort: GuideSortOption) => void;
  className?: string;
}

function SortableColumnHeader({
  label,
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
      <span>{label}</span>
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
      return 'bg-blue-100 text-blue-800';
    case 'troubleshooting':
      return 'bg-orange-100 text-orange-800';
    case 'how_to_clean':
    case 'how-to-clean':
      return 'bg-green-100 text-green-800';
    case 'safety_info':
    case 'safety-info':
      return 'bg-red-100 text-red-800';
    case 'maintenance':
      return 'bg-purple-100 text-purple-800';
    case 'features':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
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

// =============================================================================
// Default Column Visibility
// =============================================================================

const DEFAULT_COLUMN_VISIBILITY = {
  room: true,
  purpose: true,
  property: false, // REQ-220 - Hidden by default
};

// =============================================================================
// Main Component
// =============================================================================

export function InstructionsTable({
  instructions,
  onEdit,
  loading,
  currentSort = 'created-desc',
  onSortChange,
  columnVisibility = DEFAULT_COLUMN_VISIBILITY,
  onToggleColumn,
}: InstructionsTableProps) {
  const t = useTranslations('articles.table');
  const tColumns = useTranslations('articles.list.columns');
  const tEmpty = useTranslations('common.emptyStates');
  // Determine if sorting is enabled
  const isSortable = Boolean(onSortChange);

  // Render table header row
  const renderTableHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        {/* Title Column */}
        <th className="px-6 py-3 text-left">
          {isSortable ? (
            <SortableColumnHeader
              label={tColumns('title')}
              sortKeyAsc="title-asc"
              sortKeyDesc="title-desc"
              currentSort={currentSort}
              onSortChange={onSortChange!}
            />
          ) : (
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {tColumns('title')}
            </span>
          )}
        </th>

        {/* Item Column */}
        <th className="px-6 py-3 text-left">
          {isSortable ? (
            <SortableColumnHeader
              label={tColumns('item')}
              sortKeyAsc="item-asc"
              sortKeyDesc="item-desc"
              currentSort={currentSort}
              onSortChange={onSortChange!}
            />
          ) : (
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {tColumns('item')}
            </span>
          )}
        </th>

        {/* Room Column (conditionally visible) */}
        {columnVisibility.room && (
          <th className="px-6 py-3 text-left hidden md:table-cell">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {tColumns('room')}
            </span>
          </th>
        )}

        {/* Property Column (conditionally visible) - REQ-220 */}
        {columnVisibility.property && (
          <th className="px-6 py-3 text-left hidden md:table-cell">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {tColumns('room')}
            </span>
          </th>
        )}

        {/* Purpose Column (conditionally visible) */}
        {columnVisibility.purpose && (
          <th className="px-6 py-3 text-left hidden sm:table-cell">
            {isSortable ? (
              <SortableColumnHeader
                label={tColumns('purpose')}
                sortKeyAsc="purpose-asc"
                sortKeyDesc="purpose-desc"
                currentSort={currentSort}
                onSortChange={onSortChange!}
              />
            ) : (
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {tColumns('purpose')}
              </span>
            )}
          </th>
        )}

        {/* Created Column */}
        <th className="px-6 py-3 text-left hidden lg:table-cell">
          {isSortable ? (
            <SortableColumnHeader
              label={tColumns('created')}
              sortKeyAsc="created-asc"
              sortKeyDesc="created-desc"
              currentSort={currentSort}
              onSortChange={onSortChange!}
            />
          ) : (
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {tColumns('created')}
            </span>
          )}
        </th>

        {/* Actions + Column Settings */}
        <th className="px-6 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('actions')}
            </span>
            {onToggleColumn && (
              <GuideColumnSettingsPopup
                columnVisibility={columnVisibility}
                onToggleColumn={onToggleColumn}
              />
            )}
          </div>
        </th>
      </tr>
    </thead>
  );

  // Calculate colspan based on visible columns
  const getColspan = () => {
    let count = 3; // Title, Item, Actions are always visible
    if (columnVisibility.room) count++;
    if (columnVisibility.property) count++; // REQ-220
    if (columnVisibility.purpose) count++;
    count++; // Created column
    return count;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {renderTableHeader()}
          <tbody className="bg-white divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
                {columnVisibility.room && (
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </td>
                )}
                {columnVisibility.property && (
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </td>
                )}
                {columnVisibility.purpose && (
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </td>
                )}
                <td className="px-6 py-4 hidden lg:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (instructions.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {renderTableHeader()}
          <tbody className="bg-white">
            <tr>
              <td colSpan={getColspan()} className="px-6 py-12 text-center text-gray-500">
                {tEmpty('guides.noGuidesAvailable')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Main table
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {renderTableHeader()}
        <tbody className="bg-white divide-y divide-gray-200">
          {instructions.map((instruction) => (
            <tr key={instruction.id} className="hover:bg-gray-50 transition-colors">
              {/* Title Column */}
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {instruction.articleTitle}
                </div>
              </td>

              {/* Item Name Column */}
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">{instruction.itemName}</div>
              </td>

              {/* Room Column (conditionally visible) */}
              {columnVisibility.room && (
                <td className="px-6 py-4 hidden md:table-cell">
                  {instruction.room ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {instruction.room}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
              )}

              {/* Property Column (conditionally visible) - REQ-220 */}
              {columnVisibility.property && (
                <td className="px-6 py-4 hidden md:table-cell">
                  {instruction.propertyName ? (
                    <span className="text-sm text-gray-700">
                      {instruction.propertyName}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
              )}

              {/* Purpose Column (conditionally visible) */}
              {columnVisibility.purpose && (
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPurposeBadgeColor(
                      instruction.purpose
                    )}`}
                  >
                    {formatPurposeLabel(instruction.purpose)}
                  </span>
                </td>
              )}

              {/* Created Column */}
              <td className="px-6 py-4 hidden lg:table-cell">
                <div className="text-sm text-gray-500">
                  {formatDate(instruction.createdAt)}
                </div>
              </td>

              {/* Actions Column */}
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit?.(instruction.articleId)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#FF385C] hover:text-[#E31C5F] hover:bg-[#FFEEEF] rounded-lg transition-colors"
                  aria-label={`Edit ${instruction.articleTitle}`}
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                  <span>Edit</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
