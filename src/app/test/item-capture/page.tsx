'use client';

/**
 * Test Page for ItemCapture Assembly - Integration Test
 *
 * This page demonstrates the onComplete assembly functionality
 * by testing the assembleItemRecord function and UUID generation.
 *
 * Access at: /test/item-capture
 *
 * @lastModified 2025-12-31 (REQ-053 Integration Testing)
 */

import React, { useState, useCallback } from 'react';
import {
  assembleItemRecord,
  generateUUID,
  isValidUUID,
  determineContentType,
} from '@/components/ItemCapture';
import type { ItemRecord, MediaItem, ItemMetadata } from '@/components/ItemCapture';

// =============================================================================
// Types
// =============================================================================

interface SubmissionLog {
  timestamp: Date;
  record: ItemRecord;
  summary: {
    id: string;
    title: string;
    contentType: string;
    mediaCount: number;
    totalMediaSize: number;
    hasInstructions: boolean;
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// =============================================================================
// Mock Data Generators
// =============================================================================

function createMockMediaItem(type: 'video' | 'image' | 'pdf', index: number): MediaItem {
  const mimeTypes = {
    video: 'video/mp4',
    image: 'image/jpeg',
    pdf: 'application/pdf',
  };

  return {
    id: `temp-${type}-${index}`,
    type,
    file: new Blob([`mock ${type} content`], { type: mimeTypes[type] }),
    order: index,
    metadata: {
      mimeType: mimeTypes[type],
      fileSize: 1024 * 100 * (index + 1),
      source: 'capture' as const,
      ...(type === 'video' && { duration: 30 }),
      ...(type === 'image' && { dimensions: { width: 1920, height: 1080 } }),
      ...(type === 'pdf' && { pageCount: 5 }),
    },
  };
}

// =============================================================================
// Component
// =============================================================================

export default function ItemCaptureTestPage() {
  const [submissions, setSubmissions] = useState<SubmissionLog[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Form state for testing
  const [title, setTitle] = useState('Test Item');
  const [location, setLocation] = useState('Kitchen');
  const [tags, setTags] = useState('appliance, maintenance');
  const [instructions, setInstructions] = useState('Test instructions here.');
  const [mediaTypes, setMediaTypes] = useState<Array<'video' | 'image' | 'pdf'>>(['video']);

  // Add log entry
  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  // Test UUID generation
  const handleTestUUID = useCallback(() => {
    addLog('Testing UUID generation...');
    const uuid = generateUUID();
    const isValid = isValidUUID(uuid);
    addLog(`  Generated: ${uuid}`);
    addLog(`  Is valid UUID v4: ${isValid}`);

    // Generate 10 more and check uniqueness
    const uuids = new Set([uuid]);
    for (let i = 0; i < 10; i++) {
      uuids.add(generateUUID());
    }
    addLog(`  11 UUIDs generated, ${uuids.size} unique (should be 11)`);
  }, [addLog]);

  // Test content type determination
  const handleTestContentType = useCallback(() => {
    addLog('Testing content type determination...');

    const testCases = [
      { media: [{ type: 'video' as const }], instructions: '', expected: 'media' },
      { media: [{ type: 'image' as const }], instructions: '', expected: 'media' },
      { media: [{ type: 'pdf' as const }], instructions: '', expected: 'pdf-only' },
      { media: [], instructions: 'Text only', expected: 'text-only' },
      { media: [{ type: 'video' as const }], instructions: 'With text', expected: 'mixed' },
      { media: [{ type: 'image' as const }, { type: 'pdf' as const }], instructions: '', expected: 'mixed' },
    ];

    testCases.forEach((tc, i) => {
      const result = determineContentType(tc.media, tc.instructions || undefined);
      const pass = result === tc.expected;
      addLog(`  Case ${i + 1}: ${pass ? '✅' : '❌'} ${result} (expected: ${tc.expected})`);
    });
  }, [addLog]);

  // Test assembly function
  const handleTestAssembly = useCallback(() => {
    addLog('Testing assembleItemRecord...');

    const metadata: ItemMetadata = {
      title: title.trim(),
      location: location.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      applianceType: 'dishwasher',
    };

    const mediaItems = mediaTypes.map((type, i) => createMockMediaItem(type, i));

    try {
      const record = assembleItemRecord({
        metadata,
        mediaItems,
        instructions: instructions.trim(),
      });

      addLog(`  ✅ Assembly successful!`);
      addLog(`  ID: ${record.id} (valid: ${isValidUUID(record.id)})`);
      addLog(`  Title: "${record.title}"`);
      addLog(`  Content Type: ${record.contentType}`);
      addLog(`  Media: ${record.media.length} items`);
      record.media.forEach((m, i) => {
        addLog(`    [${i}] ${m.type} - ID: ${m.id.slice(0, 8)}... (valid: ${isValidUUID(m.id)})`);
      });
      if (record.location) addLog(`  Location: ${record.location}`);
      if (record.tags) addLog(`  Tags: ${record.tags.join(', ')}`);
      if (record.applianceType) addLog(`  Appliance: ${record.applianceType}`);
      if (record.instructions) addLog(`  Instructions: ${record.instructions.slice(0, 50)}...`);
      addLog(`  Created At: ${record.createdAt.toISOString()}`);

      // Add to submissions
      const totalMediaSize = record.media.reduce((sum, m) => sum + m.file.size, 0);
      setSubmissions(prev => [
        {
          timestamp: new Date(),
          record,
          summary: {
            id: record.id,
            title: record.title,
            contentType: record.contentType,
            mediaCount: record.media.length,
            totalMediaSize,
            hasInstructions: !!record.instructions,
          },
        },
        ...prev,
      ]);
    } catch (error) {
      addLog(`  ❌ Assembly failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [title, location, tags, instructions, mediaTypes, addLog]);

  // Toggle media type
  const toggleMediaType = useCallback((type: 'video' | 'image' | 'pdf') => {
    setMediaTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            ItemCapture Assembly Test
          </h1>
          <p className="text-gray-600 mt-2">
            Test page for REQ-053 onComplete assembly implementation.
            Test UUID generation, content type detection, and ItemRecord assembly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Tests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Tests</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleTestUUID}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test UUID Generation
                </button>
                <button
                  type="button"
                  onClick={handleTestContentType}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Test Content Type
                </button>
                <button
                  type="button"
                  onClick={handleTestAssembly}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Test Assembly
                </button>
              </div>
            </div>

            {/* Assembly Input Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Assembly Input</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Media Types (mock)</label>
                  <div className="flex gap-4">
                    {(['video', 'image', 'pdf'] as const).map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={mediaTypes.includes(type)}
                          onChange={() => toggleMediaType(type)}
                          className="rounded"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Latest Submission */}
            {submissions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold mb-4">Latest Submission</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">ID:</dt>
                    <dd className="font-mono text-xs">{submissions[0].summary.id.slice(0, 8)}...</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Title:</dt>
                    <dd className="font-medium">{submissions[0].summary.title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Content Type:</dt>
                    <dd>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {submissions[0].summary.contentType}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Media Items:</dt>
                    <dd>{submissions[0].summary.mediaCount}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Total Size:</dt>
                    <dd>{formatBytes(submissions[0].summary.totalMediaSize)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Instructions:</dt>
                    <dd>{submissions[0].summary.hasInstructions ? 'Yes' : 'No'}</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Event Log */}
            <div className="bg-gray-800 rounded-lg p-4 text-white">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold">Event Log</h3>
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className="bg-gray-900 rounded p-3 h-64 overflow-auto text-xs font-mono">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No events yet. Complete the wizard to see logs.</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="text-green-400 mb-1">{log}</div>
                  ))
                )}
              </div>
            </div>

            {/* Submission History */}
            {submissions.length > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Previous Submissions ({submissions.length - 1})
                </h3>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {submissions.slice(1).map((sub, i) => (
                    <div
                      key={sub.summary.id}
                      className="text-sm p-2 bg-gray-50 rounded"
                    >
                      <div className="font-medium">{sub.summary.title}</div>
                      <div className="text-xs text-gray-500">
                        {sub.timestamp.toLocaleTimeString()} • {sub.summary.contentType} • {sub.summary.mediaCount} items
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Integration Test Checklist</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Core Requirements</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Submit button triggers handleSubmit</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>onComplete receives valid ItemRecord</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>ItemRecord has valid UUID for id</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Title is trimmed in output</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Media items have valid UUIDs</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>createdAt is a valid Date</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Content Type Detection</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Video only → contentType: &quot;media&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Text only → contentType: &quot;text-only&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>PDF only → contentType: &quot;pdf-only&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Mixed content → contentType: &quot;mixed&quot;</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">State Management</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Wizard resets after successful submission</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Error handling preserves state on failure</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Debug logging outputs expected format</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Optional Fields</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Location only present when provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Tags only present when provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Instructions only present when provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span>Empty tags filtered out</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
