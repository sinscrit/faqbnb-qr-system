'use client';

/**
 * InstructionsViewer Test Harness
 *
 * Test page for verifying the InstructionsViewer component with various content types
 * and configuration options.
 *
 * @route /test/instructions-viewer
 * @created 2026-01-03
 * @lastModified 2026-01-03
 * @requestId REQ-078
 */

import { useState } from 'react';
import { InstructionsViewer } from '@/components/ItemManager';

// Test content examples
const testMarkdownContent = `# Coffee Maker Instructions

This is a paragraph with **bold text** and *italic text*.

## Getting Started

Before using your coffee maker, please read these instructions carefully.

### Step-by-Step Guide

1. Fill the water reservoir
2. Add coffee grounds to the filter
3. Press the **power button**
4. Wait for the brewing cycle to complete

## Features

- Automatic shut-off after 2 hours
- Keep warm function
- Programmable timer with \`24-hour\` display

## Important Notes

> Always unplug the appliance when not in use.
> Clean the carafe after each use.

### Troubleshooting

If the coffee maker doesn't start:

1. Check that it's plugged in
2. Verify the water reservoir is filled
3. Ensure the carafe is properly seated

For more information, visit [our support page](https://example.com).

\`\`\`
Error codes:
E01 - Water empty
E02 - Overheating
\`\`\`
`;

const shortContent = 'Simple one-line instruction.';

const emptyContent = '';

const longContent = testMarkdownContent.repeat(3);

export default function TestInstructionsViewer() {
  const [selectedContent, setSelectedContent] = useState<'full' | 'short' | 'empty' | 'long'>('full');
  const [maxHeight, setMaxHeight] = useState('400px');
  const [showHeader, setShowHeader] = useState(false);

  const contentMap = {
    full: testMarkdownContent,
    short: shortContent,
    empty: emptyContent,
    long: longContent,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">InstructionsViewer Test Harness</h1>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Controls</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type
              </label>
              <select
                value={selectedContent}
                onChange={(e) => setSelectedContent(e.target.value as 'full' | 'short' | 'empty' | 'long')}
                className="w-full border rounded px-2 py-1"
              >
                <option value="full">Full Markdown</option>
                <option value="short">Short Text</option>
                <option value="empty">Empty</option>
                <option value="long">Long Content</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Height
              </label>
              <select
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value)}
                className="w-full border rounded px-2 py-1"
              >
                <option value="200px">200px</option>
                <option value="300px">300px</option>
                <option value="400px">400px (default)</option>
                <option value="50vh">50vh</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Show Header
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showHeader}
                  onChange={(e) => setShowHeader(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show header</span>
              </label>
            </div>
          </div>
        </div>

        {/* Component Display */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Component Output</h2>
          <InstructionsViewer
            instructions={contentMap[selectedContent]}
            maxHeight={maxHeight}
            showHeader={showHeader}
            headerText="Item Instructions"
          />
        </div>

        {/* Raw Content Preview */}
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <h2 className="text-lg font-semibold mb-4">Raw Content (for debugging)</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48">
            {contentMap[selectedContent] || '(empty)'}
          </pre>
        </div>
      </div>
    </div>
  );
}
