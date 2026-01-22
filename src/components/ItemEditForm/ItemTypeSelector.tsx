/**
 * ItemTypeSelector Component
 * Created: 2026-01-13
 * REQ-215: Simplified Item Edit Page
 * Last Modified: 2026-01-22 (REQ-E02-083 i18n support)
 *
 * Dropdown selector for choosing an item type.
 * Uses item type constants from ItemCreationWorkflow.
 */

import { useTranslations } from 'next-intl';
import { ITEM_TYPES } from '@/components/ItemCreationWorkflow/utils/constants';
import { ItemTypeSelectorProps } from './ItemEditForm.types';

export function ItemTypeSelector({ value, onChange, disabled = false }: ItemTypeSelectorProps) {
  const t = useTranslations('items.edit');

  // Map item types to translation keys
  const getItemTypeLabel = (itemType: string): string => {
    const keyMap: Record<string, string> = {
      'appliance': 'itemTypes.appliance',
      'room-item': 'itemTypes.roomItem',
      'general-info': 'itemTypes.generalInfo',
    };
    return t(keyMap[itemType] || 'itemTypes.appliance');
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue === '' ? null : (selectedValue as typeof ITEM_TYPES[number]));
  };

  return (
    <div>
      <label
        htmlFor="item-type-selector"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {t('form.itemTypeLabel')}
      </label>
      <select
        id="item-type-selector"
        aria-label={t('form.itemTypeAriaLabel')}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{t('form.itemTypePlaceholder')}</option>
        {ITEM_TYPES.map((itemType) => (
          <option key={itemType} value={itemType}>
            {getItemTypeLabel(itemType)}
          </option>
        ))}
      </select>
    </div>
  );
}
