'use client';

/**
 * Test Page for Basic Shared Components (REQ-097)
 *
 * Renders all new shared components for visual verification and testing.
 *
 * @lastModified 2026-01-05
 */

import { useState } from 'react';
import {
  SessionProgressBar,
  RoomCard,
  ItemTypeCard,
  ITEM_TYPE_ICONS,
} from '@/components/ItemCreationWorkflow';
import {
  ROOM_TYPES,
  ROOM_LABELS,
  ROOM_ICONS,
  ITEM_TYPES,
  ITEM_TYPE_LABELS,
  ITEM_TYPE_DESCRIPTIONS,
} from '@/components/ItemCreationWorkflow/utils/constants';
import type { RoomType, ItemType } from '@/components/ItemCreationWorkflow';

export default function BasicSharedComponentsTestPage() {
  // State for SessionProgressBar demo
  const [itemsCreated, setItemsCreated] = useState(5);

  // State for RoomCard selection
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [disabledRooms, setDisabledRooms] = useState<RoomType[]>([]);

  // State for ItemTypeCard selection
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        <h1 className="text-3xl font-bold text-gray-900">
          REQ-097: Basic Shared Components Test
        </h1>

        {/* SessionProgressBar Section */}
        <section className="bg-white rounded-xl p-6 shadow-sm" data-testid="session-progress-section">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            SessionProgressBar
          </h2>

          {/* Progress bar demo */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Default (with count)</h3>
              <SessionProgressBar itemsCreated={itemsCreated} data-testid="progress-bar-default" />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Without count text</h3>
              <SessionProgressBar itemsCreated={itemsCreated} showCount={false} />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Custom max items (10)</h3>
              <SessionProgressBar itemsCreated={itemsCreated} maxItems={10} />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <label className="text-sm font-medium text-gray-600">
                Items Created: {itemsCreated}
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={itemsCreated}
                onChange={(e) => setItemsCreated(Number(e.target.value))}
                className="flex-1"
                data-testid="items-slider"
              />
            </div>
          </div>
        </section>

        {/* RoomCard Section */}
        <section className="bg-white rounded-xl p-6 shadow-sm" data-testid="room-card-section">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            RoomCard
          </h2>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Selected room: <strong data-testid="selected-room">{selectedRoom || 'None'}</strong>
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3" data-testid="room-grid">
              {ROOM_TYPES.map((room) => (
                <RoomCard
                  key={room}
                  room={room}
                  label={ROOM_LABELS[room]}
                  icon={ROOM_ICONS[room]}
                  isSelected={selectedRoom === room}
                  isDisabled={disabledRooms.includes(room)}
                  onSelect={(r) => setSelectedRoom(r)}
                  data-testid={`room-card-${room}`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  if (selectedRoom && !disabledRooms.includes(selectedRoom)) {
                    setDisabledRooms([...disabledRooms, selectedRoom]);
                    setSelectedRoom(null);
                  }
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                data-testid="disable-room-btn"
              >
                Disable Selected Room
              </button>
              <button
                type="button"
                onClick={() => setDisabledRooms([])}
                className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                data-testid="reset-disabled-btn"
              >
                Reset Disabled
              </button>
            </div>
          </div>
        </section>

        {/* ItemTypeCard Section */}
        <section className="bg-white rounded-xl p-6 shadow-sm" data-testid="item-type-card-section">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ItemTypeCard
          </h2>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Selected item type: <strong data-testid="selected-item-type">{selectedItemType || 'None'}</strong>
            </p>

            <div className="space-y-3" data-testid="item-type-list">
              {ITEM_TYPES.map((itemType) => (
                <ItemTypeCard
                  key={itemType}
                  itemType={itemType}
                  label={ITEM_TYPE_LABELS[itemType]}
                  description={ITEM_TYPE_DESCRIPTIONS[itemType]}
                  icon={ITEM_TYPE_ICONS[itemType]}
                  isSelected={selectedItemType === itemType}
                  onSelect={(type) => setSelectedItemType(type)}
                  data-testid={`item-type-card-${itemType}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Accessibility Notes */}
        <section className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Accessibility Notes
          </h2>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>All cards use <code>role=&quot;radio&quot;</code> with <code>aria-checked</code></li>
            <li>Focus states are visible with blue ring</li>
            <li>Touch targets exceed 48px minimum</li>
            <li>Keyboard navigation works (Tab, Enter, Space)</li>
            <li>Progress bar has <code>role=&quot;progressbar&quot;</code> with ARIA attributes</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
