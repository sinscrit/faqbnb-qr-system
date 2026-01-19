/**
 * Vitest Configuration for FAQbnb Project
 *
 * Configures test environment and coverage for React/Next.js application.
 *
 * @lastModified 2026-01-18 (REQ-254)
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
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/ItemCreationWorkflow/**/*.ts',
        'src/components/ItemCreationWorkflow/**/*.tsx',
        'src/lib/job-queue/**/*.ts',  // Added for REQ-254
        'src/lib/translation-service/**/*.ts',
      ],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
    },
    // Timeout for integration tests that may take longer
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
