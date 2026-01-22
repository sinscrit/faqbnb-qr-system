/**
 * RoomSelector Component
 * Created: 2026-01-13
 * REQ-215: Simplified Item Edit Page
 * Last Modified: 2026-01-22 (REQ-E02-083 i18n support)
 *
 * Dropdown selector for choosing a room for an item.
 * Uses room constants from ItemCreationWorkflow.
 */

import { useTranslations } from 'next-intl';
import { ROOM_TYPES } from '@/components/ItemCreationWorkflow/utils/constants';
import { RoomSelectorProps } from './ItemEditForm.types';

export function RoomSelector({ value, onChange, disabled = false }: RoomSelectorProps) {
  const t = useTranslations('items.edit');

  // Map room types to translation keys
  const getRoomLabel = (roomType: string): string => {
    const keyMap: Record<string, string> = {
      'kitchen': 'rooms.kitchen',
      'bathroom': 'rooms.bathroom',
      'bedroom': 'rooms.bedroom',
      'living-room': 'rooms.livingRoom',
      'laundry': 'rooms.laundry',
      'garage': 'rooms.garage',
      'outdoor': 'rooms.outdoor',
      'office': 'rooms.office',
      'gym': 'rooms.gym',
      'pool': 'rooms.pool',
      'other': 'rooms.other',
    };
    return t(keyMap[roomType] || 'rooms.other');
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue === '' ? null : (selectedValue as typeof ROOM_TYPES[number]));
  };

  return (
    <div>
      <label
        htmlFor="room-selector"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {t('form.roomLabel')}
      </label>
      <select
        id="room-selector"
        aria-label={t('form.roomAriaLabel')}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{t('form.roomPlaceholder')}</option>
        {ROOM_TYPES.map((roomType) => (
          <option key={roomType} value={roomType}>
            {getRoomLabel(roomType)}
          </option>
        ))}
      </select>
    </div>
  );
}
