'use client';

/**
 * ItemNameEditor Component
 *
 * Editable text field for the auto-generated item name.
 * Allows users to customize the "Room - Item" format name.
 * Shows character count and enforces maximum length.
 *
 * @example
 * ```tsx
 * <ItemNameEditor
 *   value={itemName}
 *   onChange={setItemName}
 *   placeholder="Enter item name"
 *   maxLength={100}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/ItemNameEditor
 * @see SpecificItemStep for usage context
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

export interface ItemNameEditorProps {
  /** Current item name value */
  value: string;
  /** Called when name changes */
  onChange: (name: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Optional CSS class name */
  className?: string;
}

export function ItemNameEditor({
  value,
  onChange,
  placeholder = 'Enter item name',
  maxLength = 100,
  disabled = false,
  className,
}: ItemNameEditorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const characterCount = value.length;
  const isNearLimit = characterCount >= maxLength * 0.8;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor="item-name-editor"
        className="flex items-center gap-2 text-sm font-medium text-[#222222]"
      >
        <Pencil className="w-4 h-4 text-[#717171]" aria-hidden="true" />
        Item Name
      </label>

      <div className="relative">
        <input
          id="item-name-editor"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 pr-16 border-2 rounded-lg',
            'text-base text-[#222222] placeholder:text-[#717171]',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[#222222]',
            disabled
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-gray-300'
          )}
          aria-describedby="item-name-hint"
        />

        {/* Character counter */}
        <span
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'text-xs',
            isNearLimit ? 'text-amber-600' : 'text-[#717171]'
          )}
          aria-live="polite"
        >
          {characterCount}/{maxLength}
        </span>
      </div>

      <p id="item-name-hint" className="text-xs text-[#717171]">
        This name will appear on the QR code label
      </p>
    </div>
  );
}

export default ItemNameEditor;
