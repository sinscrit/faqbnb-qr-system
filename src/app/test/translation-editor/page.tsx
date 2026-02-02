/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Test Page for TranslationEditor Component
 *
 * Created: 2026-01-25 03:15
 * Purpose: Browser-based testing for REQ-E05-010
 *
 * This page tests the TranslationEditor component with mock data
 * to verify Phase 19-27 acceptance criteria.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TranslationEditor } from '@/components/TranslationManagement/TranslationEditor';
import type { TranslationFieldContent } from '@/components/TranslationManagement/TranslationEditor';

const mockSourceContent: TranslationFieldContent[] = [
  { fieldName: 'name', fieldLabel: 'Name', value: 'Coffee Maker Instructions', maxLength: 100 },
  { fieldName: 'description', fieldLabel: 'Description', value: 'How to use the coffee maker in the kitchen. Make sure to clean after use.', maxLength: 500 },
  { fieldName: 'instructions', fieldLabel: 'Instructions', value: '1. Fill water tank\n2. Add coffee\n3. Press start' },
];

const mockInitialTranslation: TranslationFieldContent[] = [
  { fieldName: 'name', fieldLabel: 'Name', value: 'Instructions pour la Machine à Café', maxLength: 100 },
  { fieldName: 'description', fieldLabel: 'Description', value: 'Comment utiliser la machine à café dans la cuisine.', maxLength: 500 },
  { fieldName: 'instructions', fieldLabel: 'Instructions', value: '1. Remplir le réservoir\n2. Ajouter le café\n3. Appuyer sur démarrer' },
];

export default function TestTranslationEditorPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [savedContent, setSavedContent] = useState<TranslationFieldContent[] | null>(null);
  const [simulateError, setSimulateError] = useState(false);

  // Wait for mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    // Auto-open editor after mount
    setTimeout(() => setIsOpen(true), 100);
  }, []);

  const handleSave = async (content: TranslationFieldContent[]) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (simulateError) {
      throw new Error('Network error: Failed to save translation');
    }

    setSavedContent(content);
    console.log('Saved content:', content);
  };

  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">TranslationEditor Test Page</h1>

      <div className="flex gap-4 mb-6">
        <button
          id="open-editor-btn"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open Editor
        </button>

        <label className="flex items-center gap-2">
          <input
            id="simulate-error-checkbox"
            type="checkbox"
            checked={simulateError}
            onChange={(e) => setSimulateError(e.target.checked)}
          />
          Simulate Save Error
        </label>
      </div>

      {savedContent && (
        <div id="saved-content-display" className="mb-6 p-4 bg-green-100 dark:bg-green-900 rounded">
          <h2 className="font-semibold mb-2">Last Saved Content:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(savedContent, null, 2)}
          </pre>
        </div>
      )}

      <TranslationEditor
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        entityId="test-item-123"
        entityType="item"
        language="fr"
        sourceContent={mockSourceContent}
        initialTranslation={mockInitialTranslation}
        onSave={handleSave}
      />
    </div>
  );
}
