/**
 * Tag Mapping Utility
 *
 * Auto-generates tags based on workflow selections (room, item type, purpose).
 * Uses pattern-based logic to determine which tags should be pre-filled.
 *
 * ## Tag Generation Logic
 *
 * 1. **Room Tags**: Include room tag unless room is 'other'
 *    - Kitchen → 'kitchen' tag
 *    - Laundry → 'laundry' tag
 *    - etc.
 *
 * 2. **Item Type Tags**: Map item type to corresponding tag
 *    - 'appliance' → 'appliance' tag
 *    - 'room-item' → 'room-item' tag
 *    - 'general-info' → handled by general/info tags
 *
 * 3. **Purpose Tags**: Map purpose to corresponding tag
 *    - 'how-to-use' → 'instructions'
 *    - 'how-to-clean' → 'cleaning'
 *    - 'troubleshooting' → 'troubleshooting'
 *    - 'safety-info' → 'safety'
 *    - 'maintenance' → 'maintenance'
 *    - 'features' → 'features'
 *    - 'other' → 'info'
 *
 * 4. **Special Cases**:
 *    - Room 'general' → add 'general' and 'info' tags
 *    - Item type 'general-info' → add 'general' and 'info' tags
 *
 * @example Basic usage
 * ```typescript
 * const tags = generateTags({
 *   room: 'kitchen',
 *   itemType: 'appliance',
 *   purpose: 'how-to-use'
 * });
 * // Returns: ['kitchen', 'appliance', 'instructions']
 * ```
 *
 * @example General info
 * ```typescript
 * const tags = generateTags({
 *   room: 'general',
 *   itemType: 'general-info',
 *   purpose: 'other'
 * });
 * // Returns: ['general', 'info']
 * ```
 *
 * @module ItemCreationWorkflow/utils/tagMapper
 * @created 2026-01-10 (REQ-177 Intelligent Pre-filling)
 */

import type { RoomType, ItemType, PurposeType } from '../ItemCreationWorkflow.types';
import type { TagTypeConst } from './constants';

/**
 * Input parameters for tag generation.
 */
export interface TagMapperInput {
  /** Selected room type */
  room: RoomType;
  /** Selected item type */
  itemType: ItemType;
  /** Selected purpose (can be null if not yet selected) */
  purpose: PurposeType | null;
}

/**
 * Maps purpose type to corresponding tag.
 */
const PURPOSE_TO_TAG: Record<PurposeType, TagTypeConst> = {
  'how-to-use': 'instructions',
  'how-to-clean': 'cleaning',
  'troubleshooting': 'troubleshooting',
  'safety-info': 'safety',
  'maintenance': 'maintenance',
  'features': 'features',
  'other': 'info',
};

/**
 * Generates tags based on workflow selections.
 *
 * Tags are determined using pattern-based logic:
 * - Room tags (unless 'other')
 * - Item type tags
 * - Purpose-derived tags
 * - Special handling for 'general' contexts
 *
 * Results are automatically deduplicated.
 *
 * @param input - Workflow state with room, itemType, and purpose
 * @returns Array of tag identifiers (deduplicated)
 *
 * @example Kitchen appliance - how to use
 * ```typescript
 * generateTags({
 *   room: 'kitchen',
 *   itemType: 'appliance',
 *   purpose: 'how-to-use'
 * }); // → ['kitchen', 'appliance', 'instructions']
 * ```
 *
 * @example General info
 * ```typescript
 * generateTags({
 *   room: 'general',
 *   itemType: 'general-info',
 *   purpose: 'other'
 * }); // → ['general', 'info']
 * ```
 */
export function generateTags(input: TagMapperInput): TagTypeConst[] {
  const tags: TagTypeConst[] = [];
  const { room, itemType, purpose } = input;

  // 1. Add room tag (unless 'other' room)
  if (room !== 'other' && room !== 'general') {
    // Map room to tag - use room value directly if it matches a valid tag
    const validRoomTags: TagTypeConst[] = [
      'kitchen',
      'laundry',
      'bedroom',
      'bathroom',
      'living-room',
      'garage',
      'outdoor',
    ];

    if (validRoomTags.includes(room as TagTypeConst)) {
      tags.push(room as TagTypeConst);
    }
  }

  // 2. Add item type tags
  if (itemType === 'appliance') {
    tags.push('appliance');
  } else if (itemType === 'room-item') {
    tags.push('room-item');
  }

  // 3. Add purpose-derived tag (if purpose is selected)
  if (purpose) {
    const purposeTag = PURPOSE_TO_TAG[purpose];
    tags.push(purposeTag);
  }

  // 4. Special cases: 'general' room or 'general-info' item type
  if (room === 'general' || itemType === 'general-info') {
    tags.push('general');
    tags.push('info');
  }

  // 5. Deduplicate tags
  const uniqueTags = Array.from(new Set(tags));

  return uniqueTags;
}
