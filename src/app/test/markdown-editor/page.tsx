'use client';

/**
 * Test page for MarkdownEditor component (REQ-045)
 * This page allows manual testing of the markdown editor component.
 * @lastModified 2025-12-31
 */

import React, { useState, useCallback } from 'react';
import { MarkdownEditor } from '@/components/ItemCapture';

export default function TestMarkdownEditorPage() {
  const [value, setValue] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [maxLength, setMaxLength] = useState(5000);
  const [warningThreshold, setWarningThreshold] = useState(4500);

  // Event log for debugging
  const [eventLog, setEventLog] = useState<string[]>([]);

  const logEvent = useCallback((event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) => [...prev.slice(-9), `[${timestamp}] ${event}`]);
  }, []);

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      logEvent(`onChange: ${newValue.length} chars`);
    },
    [logEvent]
  );

  // Preset content for testing
  const setTestContent = (content: string) => {
    setValue(content);
    logEvent(`Set preset content: ${content.length} chars`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">MarkdownEditor Test (REQ-045)</h1>

        {/* Controls Panel */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <h2 className="font-semibold mb-3">Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Disabled</label>
              <button
                onClick={() => setDisabled(!disabled)}
                className={`px-4 py-2 rounded text-sm ${
                  disabled ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {disabled ? 'Disabled' : 'Enabled'}
              </button>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Length</label>
              <select
                value={maxLength}
                onChange={(e) => setMaxLength(Number(e.target.value))}
                className="border rounded px-2 py-2 text-sm w-full"
              >
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
                <option value={5000}>5000</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Warning At</label>
              <select
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="border rounded px-2 py-2 text-sm w-full"
              >
                <option value={50}>50</option>
                <option value={80}>80</option>
                <option value={400}>400</option>
                <option value={900}>900</option>
                <option value={4500}>4500</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Clear</label>
              <button
                onClick={() => setValue('')}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm"
              >
                Clear Content
              </button>
            </div>
          </div>

          {/* Preset Content Buttons */}
          <div className="mt-4 border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Test Presets:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setTestContent(
                    '# Hello World\n\nThis is **bold** and *italic* text.\n\n## List\n\n- Item 1\n- Item 2\n- Item 3\n\n[Click here](https://example.com)'
                  )
                }
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Sample Markdown
              </button>
              <button
                onClick={() => setTestContent('a'.repeat(90))}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
              >
                Near Warning (90)
              </button>
              <button
                onClick={() => setTestContent('a'.repeat(100))}
                className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
              >
                At Warning (100)
              </button>
              <button
                onClick={() => setTestContent('a'.repeat(120))}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Over Limit (120)
              </button>
            </div>
          </div>
        </div>

        {/* State Display */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow">
          <h2 className="font-semibold mb-2">State</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Length:</span> {value.length}
            </div>
            <div>
              <span className="text-gray-500">Max:</span> {maxLength}
            </div>
            <div>
              <span className="text-gray-500">Warning At:</span> {warningThreshold}
            </div>
            <div>
              <span className="text-gray-500">Disabled:</span>{' '}
              {disabled ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-gray-800 text-green-400 rounded-lg p-4 mb-4 font-mono text-sm max-h-32 overflow-y-auto">
          <p className="text-gray-500 mb-1">// Event Log</p>
          {eventLog.length === 0 ? (
            <p className="text-gray-500">No events yet...</p>
          ) : (
            eventLog.map((log, i) => (
              <p key={i}>{log}</p>
            ))
          )}
        </div>

        {/* MarkdownEditor Component */}
        <div
          className="bg-white rounded-lg p-6 shadow"
          style={{ minHeight: '500px' }}
          data-testid="markdown-editor-container"
        >
          <MarkdownEditor
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            warningThreshold={warningThreshold}
            disabled={disabled}
            placeholder="Write your content here using markdown formatting..."
            ariaLabel="Test markdown editor"
          />
        </div>

        {/* Testing Checklist */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow">
          <h2 className="font-semibold mb-4">Testing Checklist</h2>

          <div className="space-y-4 text-sm">
            {/* Basic Editor Flow */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Basic Functionality (Tasks 3.5.2-3.5.8)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Textarea accepts input</li>
                <li>[ ] Character count updates in real-time</li>
                <li>[ ] Bold button wraps selected text with **</li>
                <li>[ ] Italic button wraps selected text with *</li>
                <li>[ ] Heading buttons prepend #, ##, ###</li>
                <li>[ ] List buttons work correctly</li>
                <li>[ ] Link button inserts [](url) format</li>
                <li>[ ] Ctrl+B/I/K shortcuts work</li>
                <li>[ ] Cursor position correct after formatting</li>
              </ul>
            </div>

            {/* Character Limit */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Character Limit (Task 3.5.3)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Progress bar shows fill percentage</li>
                <li>[ ] Warning color (yellow) at threshold</li>
                <li>[ ] Error color (red) when over limit</li>
                <li>[ ] Error message appears when over limit</li>
                <li>[ ] Toolbar disabled when over limit</li>
              </ul>
            </div>

            {/* Preview and Responsive */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Preview & Responsive (Tasks 3.5.4, 3.5.9, 3.5.10)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] **bold** renders as bold text</li>
                <li>[ ] *italic* renders as italic text</li>
                <li>[ ] # Heading renders correctly</li>
                <li>[ ] Lists render correctly</li>
                <li>[ ] Links render as clickable</li>
                <li>[ ] Mobile: Tab switcher visible</li>
                <li>[ ] Mobile: Only one pane at a time</li>
                <li>[ ] Desktop: Both panes side-by-side</li>
                <li>[ ] Desktop: Tab switcher hidden</li>
              </ul>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Accessibility (Task 3.5.12)
              </h3>
              <ul className="space-y-1 text-gray-600 pl-4">
                <li>[ ] Toolbar has role=&quot;toolbar&quot;</li>
                <li>[ ] Buttons have aria-label</li>
                <li>[ ] Tab buttons have role=&quot;tab&quot;</li>
                <li>[ ] Tab panels have role=&quot;tabpanel&quot;</li>
                <li>[ ] Character counter has aria-live</li>
                <li>[ ] Error message has role=&quot;alert&quot;</li>
                <li>[ ] Focus rings visible</li>
                <li>[ ] 44px minimum touch targets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
