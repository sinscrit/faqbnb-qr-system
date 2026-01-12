'use client';

/**
 * ItemContextDisplay Component
 *
 * REQ-213: Edit Instruction Flow - Read-Only Item Context Display
 * Created: 2026-01-12
 *
 * Displays item context (room, item type, item name, purpose) as read-only
 * at the top of the edit workflow. These fields cannot be changed during edit.
 *
 * @example
 * ```tsx
 * <ItemContextDisplay
 *   room="kitchen"
 *   itemType="appliance"
 *   itemName="Cabinets"
 *   purpose="how-to-clean"
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/ItemContextDisplay
 * @see docs/req-213-edit-instruction-flow-detailed.md
 */

import { Lock, ChefHat, Shirt, Bed, ShowerHead, Sofa, Car, TreePine, Info, MapPin, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoomType, ItemType, PurposeType } from '../../ItemCreationWorkflow.types';
import { ROOM_LABELS, ITEM_TYPE_LABELS, PURPOSE_LABELS } from '../../utils/constants';

// =============================================================================
// Type Definitions
// =============================================================================

export interface ItemContextDisplayProps {
  /** Room where the item is located */
  room: RoomType;
  /** Item type category */
  itemType: ItemType;
  /** Physical item name */
  itemName: string;
  /** Purpose/intent of the article */
  purpose: PurposeType;
}

// =============================================================================
// Icon Mapping
// =============================================================================

/**
 * Maps room types to their corresponding Lucide icons.
 */
const ROOM_ICON_MAP: Record<RoomType, LucideIcon> = {
  kitchen: ChefHat,
  laundry: Shirt,
  bedroom: Bed,
  bathroom: ShowerHead,
  'living-room': Sofa,
  garage: Car,
  outdoor: TreePine,
  general: Info,
  other: MapPin,
};

/**
 * Gets the Lucide icon component for a given room type.
 */
function getRoomIcon(room: RoomType): LucideIcon {
  return ROOM_ICON_MAP[room] || MapPin;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Displays read-only item context information at the top of the edit workflow.
 */
export function ItemContextDisplay({
  room,
  itemType,
  itemName,
  purpose,
}: ItemContextDisplayProps) {
  const RoomIcon = getRoomIcon(room);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
      {/* Header with lock icon */}
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-gray-500" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-600">Editing Instruction For:</span>
        <span className="ml-auto px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md">
          Read-only
        </span>
      </div>

      {/* Item Name - Prominent heading */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        {itemName}
      </h2>

      {/* Context Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Room Badge */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Room
          </span>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md">
            <RoomIcon className="w-5 h-5 text-gray-600" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-900">
              {ROOM_LABELS[room] || room}
            </span>
          </div>
        </div>

        {/* Item Type */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Item Type
          </span>
          <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md">
            <span className="text-sm font-medium text-gray-900">
              {ITEM_TYPE_LABELS[itemType] || itemType}
            </span>
          </div>
        </div>

        {/* Purpose */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Purpose
          </span>
          <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md">
            <span className="text-sm font-medium text-gray-900">
              {PURPOSE_LABELS[purpose] || purpose}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemContextDisplay;
