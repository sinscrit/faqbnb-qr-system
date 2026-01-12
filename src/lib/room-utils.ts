/**
 * Room Utilities
 * Created: 2026-01-12
 * REQ-212: Instructions List Page
 *
 * Helper functions for extracting and processing room information from item tags.
 * Tags use format: #room.roomname (e.g., #room.kitchen, #room.living-room)
 */

/**
 * Extracts room name from item tags
 * @param tags Array of tag strings (e.g., ['#room.kitchen', '#appliance.coffee-maker'])
 * @returns Capitalized room name with spaces, or null if no room tag found
 *
 * @example
 * extractRoomFromTags(['#room.kitchen']) // Returns: "Kitchen"
 * extractRoomFromTags(['#room.living-room']) // Returns: "Living Room"
 * extractRoomFromTags(['#appliance.coffee']) // Returns: null
 */
export function extractRoomFromTags(tags: string[]): string | null {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Find the first tag that starts with #room.
  const roomTag = tags.find((tag) => tag.startsWith('#room.'));

  if (!roomTag) {
    return null;
  }

  // Extract the room name after the dot
  const roomName = roomTag.substring('#room.'.length);

  // Handle empty or malformed tags
  if (!roomName || roomName.trim() === '') {
    return null;
  }

  // Replace hyphens with spaces
  const roomWithSpaces = roomName.replace(/-/g, ' ');

  // Capitalize first letter of each word
  const capitalizedRoom = roomWithSpaces
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return capitalizedRoom;
}

/**
 * Sets or updates room tag in tags array
 * @param tags Array of tag strings
 * @param roomType Room type value (e.g., 'kitchen', 'living-room') or null to remove
 * @returns New array with room tag updated (does not mutate original)
 *
 * @example
 * setRoomInTags(['#room.kitchen', 'appliance'], 'bathroom') // Returns: ['appliance', '#room.bathroom']
 * setRoomInTags(['#room.kitchen', 'appliance'], null) // Returns: ['appliance']
 * setRoomInTags(['appliance'], 'kitchen') // Returns: ['appliance', '#room.kitchen']
 */
export function setRoomInTags(tags: string[], roomType: string | null): string[] {
  // Remove any existing room tags
  const tagsWithoutRoom = tags.filter((tag) => !tag.startsWith('#room.'));

  // If roomType is provided, add the new room tag
  if (roomType && roomType.trim() !== '') {
    return [...tagsWithoutRoom, `#room.${roomType}`];
  }

  // Otherwise, return tags without room tag
  return tagsWithoutRoom;
}
