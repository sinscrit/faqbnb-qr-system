'use client';

import { extractRoomFromTags } from '@/lib/room-utils';
import type { ArticleEditData } from '../InstructionEditor.types';

export interface ReadOnlyContextSectionProps {
  articleData: ArticleEditData;
}

/**
 * Helper function to extract item type from tags
 */
function extractItemTypeFromTags(tags: string[]): string {
  if (tags.some(t => t.startsWith('#appliance'))) return 'Appliance';
  if (tags.some(t => t.startsWith('#room-item'))) return 'Room Item';
  if (tags.some(t => t.startsWith('#general-info'))) return 'General Info';
  return 'Appliance'; // Default
}

/**
 * ReadOnlyContextSection displays the page header and read-only item metadata
 * Shows: Room, Item Type, and Item Name (but NOT Purpose per requirements)
 */
export function ReadOnlyContextSection({ articleData }: ReadOnlyContextSectionProps) {
  const roomName = extractRoomFromTags(articleData.item.tags) || 'Unknown Room';
  const itemType = extractItemTypeFromTags(articleData.item.tags);
  const itemName = articleData.item.name;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <h1 className="text-2xl font-semibold text-[#222222]">
        Editing Instruction For: {articleData.title}
      </h1>

      {/* Read-only metadata container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Room Field */}
          <div className="space-y-1">
            <dt className="text-sm font-medium text-[#717171]">Room</dt>
            <dd className="text-base text-[#222222] bg-gray-50 px-3 py-2 rounded-md">
              {roomName}
            </dd>
          </div>

          {/* Item Type Field */}
          <div className="space-y-1">
            <dt className="text-sm font-medium text-[#717171]">Item Type</dt>
            <dd className="text-base text-[#222222] bg-gray-50 px-3 py-2 rounded-md">
              {itemType}
            </dd>
          </div>

          {/* Item Name Field */}
          <div className="space-y-1">
            <dt className="text-sm font-medium text-[#717171]">Item Name</dt>
            <dd className="text-base text-[#222222] bg-gray-50 px-3 py-2 rounded-md">
              {itemName}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
