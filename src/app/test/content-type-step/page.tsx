'use client';

/**
 * Test Page for ContentTypeStep Component
 *
 * This page demonstrates the ContentTypeStep component in isolation for testing.
 * Access at: /test/content-type-step
 *
 * @lastModified 2025-12-31 (REQ-035 Browser Testing)
 */

import React, { useState, useCallback } from 'react';
import { ContentTypeStep, type ContentType } from '@/components/ItemCapture';

export default function ContentTypeStepTestPage() {
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [selectionHistory, setSelectionHistory] = useState<string[]>([]);

  const handleSelect = useCallback((type: ContentType) => {
    setSelectedType(type);
    setSelectionHistory(prev => [...prev, `Selected: ${type} at ${new Date().toLocaleTimeString()}`]);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedType(null);
    setSelectionHistory([]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            ContentTypeStep Component Test
          </h1>
          <p className="text-gray-600 mt-2">
            Test page for REQ-035 ContentTypeStep implementation
          </p>
        </div>

        {/* Component Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <ContentTypeStep
            selectedType={selectedType}
            onSelect={handleSelect}
          />

          {/* Test Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Selection
              </button>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Debug: Current State</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Selected Type:</h3>
              <pre className="text-xs bg-gray-900 rounded p-3 overflow-auto">
                {JSON.stringify(selectedType, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Selection History:</h3>
              <pre className="text-xs bg-gray-900 rounded p-3 overflow-auto max-h-48">
                {selectionHistory.length > 0
                  ? selectionHistory.join('\n')
                  : '(no selections yet)'}
              </pre>
            </div>
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Test Scenarios</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">1.</span>
              <span><strong>Click each option:</strong> Verify all 4 buttons are clickable and update state</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">2.</span>
              <span><strong>Visual selection:</strong> Selected option should have blue border/background</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">3.</span>
              <span><strong>Single selection:</strong> Only one option can be selected at a time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">4.</span>
              <span><strong>Keyboard navigation:</strong> Tab between buttons, Enter/Space to select</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">5.</span>
              <span><strong>Focus rings:</strong> Blue focus ring visible when tabbing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">6.</span>
              <span><strong>Responsive grid:</strong> 2 columns on mobile, 4 on desktop (resize window)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">7.</span>
              <span><strong>Touch targets:</strong> Buttons have minimum 100px height</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">8.</span>
              <span><strong>Hover states:</strong> Unselected buttons change on hover (desktop)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">9.</span>
              <span><strong>Press feedback:</strong> Buttons scale down slightly when clicked</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">10.</span>
              <span><strong>Icons:</strong> Each option shows correct Lucide icon</span>
            </li>
          </ul>
        </div>

        {/* Accessibility Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Accessibility Checklist</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Container has <code className="bg-blue-100 px-1 rounded">role=&quot;radiogroup&quot;</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Each button has <code className="bg-blue-100 px-1 rounded">role=&quot;radio&quot;</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Selected state indicated by <code className="bg-blue-100 px-1 rounded">aria-checked</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Descriptive <code className="bg-blue-100 px-1 rounded">aria-label</code> on each option</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Icons have <code className="bg-blue-100 px-1 rounded">aria-hidden=&quot;true&quot;</code></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
