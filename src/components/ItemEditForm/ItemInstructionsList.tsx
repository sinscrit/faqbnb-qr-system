/**
 * ItemInstructionsList Component
 * Created: 2026-01-13
 * REQ-215: Simplified Item Edit Page
 *
 * Displays a list of instruction articles associated with an item.
 * Shows title, purpose badge, and edit button for each instruction.
 */

import { Pencil, FileText } from 'lucide-react';
import { ItemInstructionsListProps } from './ItemEditForm.types';

/**
 * Get badge color for purpose type
 * Copied from InstructionsTable for consistency
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
 * Copied from InstructionsTable for consistency
 */
function formatPurposeLabel(purpose: string): string {
  return purpose
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function ItemInstructionsList({
  articles,
  itemName,
  onEditInstruction,
  loading = false,
}: ItemInstructionsListProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Guides</h3>
        <p className="text-sm text-gray-500 mb-4">Content associated with this item</p>
        <ul className="space-y-2">
          {[1, 2].map((i) => (
            <li
              key={i}
              className="animate-pulse flex items-center justify-between p-3 bg-gray-100 rounded-lg"
            >
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Guides</h3>
        <p className="text-sm text-gray-500 mb-4">Content associated with this item</p>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No guides yet</p>
          <p className="text-sm text-gray-400 mt-1">Guides for this item will appear here</p>
        </div>
      </div>
    );
  }

  // Instructions list
  return (
    <div className="pt-6 border-t border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Guides</h3>
      <p className="text-sm text-gray-500 mb-4">Content associated with this item</p>
      <ul className="space-y-2">
        {articles.map((article) => (
          <li
            key={article.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 truncate">
                {article.title}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPurposeBadgeColor(
                  article.purpose
                )}`}
              >
                {formatPurposeLabel(article.purpose)}
              </span>
            </div>
            <button
              onClick={() => onEditInstruction(article.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#FF385C] hover:text-[#E31C5F] hover:bg-[#FFEEEF] rounded-lg transition-colors flex-shrink-0"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
