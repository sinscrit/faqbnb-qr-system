/**
 * ItemTypeSelector Component
 * Created: 2026-01-13
 * REQ-215: Simplified Item Edit Page
 *
 * Dropdown selector for choosing an item type.
 * Uses item type constants from ItemCreationWorkflow.
 */

import { ITEM_TYPES, ITEM_TYPE_LABELS } from '@/components/ItemCreationWorkflow/utils/constants';
import { ItemTypeSelectorProps } from './ItemEditForm.types';

export function ItemTypeSelector({ value, onChange, disabled = false }: ItemTypeSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue === '' ? null : (selectedValue as any));
  };

  return (
    <div>
      <label
        htmlFor="item-type-selector"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Item Type
      </label>
      <select
        id="item-type-selector"
        aria-label="Select item type"
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Select item type...</option>
        {ITEM_TYPES.map((itemType) => (
          <option key={itemType} value={itemType}>
            {ITEM_TYPE_LABELS[itemType]}
          </option>
        ))}
      </select>
    </div>
  );
}
