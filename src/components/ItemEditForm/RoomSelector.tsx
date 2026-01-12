/**
 * RoomSelector Component
 * Created: 2026-01-13
 * REQ-215: Simplified Item Edit Page
 *
 * Dropdown selector for choosing a room for an item.
 * Uses room constants from ItemCreationWorkflow.
 */

import { ROOM_TYPES, ROOM_LABELS } from '@/components/ItemCreationWorkflow/utils/constants';
import { RoomSelectorProps } from './ItemEditForm.types';

export function RoomSelector({ value, onChange, disabled = false }: RoomSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue === '' ? null : (selectedValue as any));
  };

  return (
    <div>
      <label
        htmlFor="room-selector"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Room
      </label>
      <select
        id="room-selector"
        aria-label="Select room for this item"
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Select a room...</option>
        {ROOM_TYPES.map((roomType) => (
          <option key={roomType} value={roomType}>
            {ROOM_LABELS[roomType]}
          </option>
        ))}
      </select>
    </div>
  );
}
