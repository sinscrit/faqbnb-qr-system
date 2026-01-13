/**
 * InstructionsTable Component
 * Created: 2026-01-12
 * REQ-212: Instructions List Page
 *
 * Displays a table of instruction articles with item information.
 * Shows title, item name, room, purpose, and actions.
 */

import { Pencil } from 'lucide-react';
import { InstructionsTableProps } from './InstructionsTable.types';

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

export function InstructionsTable({ instructions, onEdit, loading }: InstructionsTableProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Purpose
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Purpose
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                No guides available
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
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
              Room
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
              Purpose
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
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

              {/* Room Column (hidden on mobile) */}
              <td className="px-6 py-4 hidden md:table-cell">
                {instruction.room ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {instruction.room}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>

              {/* Purpose Column (hidden on small mobile) */}
              <td className="px-6 py-4 hidden sm:table-cell">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPurposeBadgeColor(
                    instruction.purpose
                  )}`}
                >
                  {formatPurposeLabel(instruction.purpose)}
                </span>
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
