/**
 * Vitest Configuration for FAQbnb Project
 *
 * Configures test environment and coverage for React/Next.js application.
 *
 * @lastModified 2026-01-24 (REQ-E05-034 - Added TranslationManagement components coverage)
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.e2e.test.ts',
      'src/**/*.perf.test.ts',  // Added for REQ-E03-034 - Performance tests
      'src/**/*.edgecases.test.ts',  // Added for REQ-E04-024 - Edge case tests
      'src/**/*.edgecases.test.tsx',  // Added for REQ-E04-024 - Edge case tests
    ],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/ItemCreationWorkflow/**/*.ts',
        'src/components/ItemCreationWorkflow/**/*.tsx',
        'src/components/TranslationManagement/**/*.ts',   // Added for REQ-E05-034
        'src/components/TranslationManagement/**/*.tsx',  // Added for REQ-E05-034
        'src/hooks/useTranslationStatus.ts',              // Added for REQ-E05-034
        'src/hooks/useTranslationRealtime.ts',            // Added for REQ-E05-034
        'src/lib/job-queue/**/*.ts',  // Added for REQ-254
        'src/lib/translation-service/**/*.ts',
        'src/lib/content-translation/**/*.ts',  // Added for REQ-E03-030
        'src/app/api/translations/**/*.ts',      // Added for REQ-E03-032
        'src/app/api/admin/items/**/*.ts',       // Added for REQ-E03-032
        'src/app/api/admin/articles/**/*.ts',    // Added for REQ-E03-032
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/__tests__/**',
        'src/**/*.perf.test.ts',  // Exclude performance tests from coverage
        'src/**/performance/**',   // Exclude performance test helpers
      ],
    },
    // Timeout for integration, E2E, and performance tests that may take longer
    testTimeout: 30000,  // Increased to 30 seconds for performance tests (REQ-E03-034)
    hookTimeout: 10000,  // Added for performance test setup/teardown
    // Pool options for better performance test isolation
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
