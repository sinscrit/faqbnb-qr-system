/**
 * @fileoverview Client-Side Interactions Performance Tests for Epic 4 - Guest Experience
 *
 * This module tests the performance of client-side operations including
 * React hook state updates and component rendering.
 *
 * @description
 * Performance tests for:
 * - useGuestLanguage hook operations (toggle, setLanguage)
 * - Component rendering (GuestLanguageSwitcher, TranslationBanner)
 * - Cookie operations (set, get, clear)
 *
 * @module __tests__/performance/clientInteractions.perf.test
 * @since Epic 4 - Guest Experience
 * @see REQ-E04-026 - Performance validation specification
 *
 * Last Modified: 2026-01-23 22:40
 */

import { describe, it, expect, afterAll, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render } from '@testing-library/react';
import React from 'react';
import {
  runBenchmark,
  validateBenchmark,
  formatBenchmarkReport,
  type PerformanceBenchmark,
} from './performanceHelpers';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock next/navigation for useGuestLanguage hook
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: () => null,
    toString: () => '',
  }),
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => '/item/test123',
}));

// =============================================================================
// Test Configuration
// =============================================================================

/** Collect all benchmarks for final report */
const benchmarks: PerformanceBenchmark[] = [];

/** Target latency for toggle operations */
const TOGGLE_TARGET_MS = 100;

/** Target latency for component render */
const RENDER_TARGET_MS = 50;

/** Target latency for cookie operations */
const COOKIE_TARGET_MS = 10;

/** Number of iterations for hook tests */
const HOOK_ITERATIONS = 100;

/** Number of iterations for render tests (lower due to DOM operations) */
const RENDER_ITERATIONS = 50;

// =============================================================================
// Report Generation
// =============================================================================

afterAll(() => {
  console.log('\n' + '═'.repeat(80));
  console.log('Client-Side Interactions Performance Report');
  console.log('═'.repeat(80));
  console.log(formatBenchmarkReport(benchmarks));
});

beforeEach(() => {
  vi.clearAllMocks();
  // Clear any existing cookies
  if (typeof document !== 'undefined') {
    document.cookie = 'FAQBNB_GUEST_LANG=; Path=/; Max-Age=0';
  }
});

// =============================================================================
// Test Suite
// =============================================================================

describe('Client-Side Interactions - Performance', () => {
  describe('useGuestLanguage Hook', () => {
    it('toggleOriginal completes in < 100ms', async () => {
      // Import hook dynamically to ensure mocks are applied
      const { useGuestLanguage } = await import('@/hooks/useGuestLanguage');

      const benchmark = await runBenchmark(
        'Hook: toggleOriginal',
        () => {
          const { result } = renderHook(() => useGuestLanguage());

          // Wait for initial load to complete
          if (!result.current.isLoading) {
            act(() => {
              result.current.toggleOriginal();
            });
          }

          return result.current.showOriginal;
        },
        { targetMs: TOGGLE_TARGET_MS, iterations: HOOK_ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('setLanguage completes in < 100ms', async () => {
      const { useGuestLanguage } = await import('@/hooks/useGuestLanguage');

      const benchmark = await runBenchmark(
        'Hook: setLanguage',
        () => {
          const { result } = renderHook(() => useGuestLanguage());

          if (!result.current.isLoading) {
            act(() => {
              result.current.setLanguage('fr');
            });
          }

          return result.current.currentLanguage;
        },
        { targetMs: TOGGLE_TARGET_MS, iterations: HOOK_ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('initial hook render completes in < 100ms', async () => {
      const { useGuestLanguage } = await import('@/hooks/useGuestLanguage');

      const benchmark = await runBenchmark(
        'Hook: Initial Render',
        () => {
          const { result } = renderHook(() => useGuestLanguage());
          return result.current;
        },
        { targetMs: TOGGLE_TARGET_MS, iterations: HOOK_ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });
  });

  describe('Component Render Performance', () => {
    it('GuestLanguageSwitcher renders in < 50ms', async () => {
      // Import component dynamically
      const { GuestLanguageSwitcher } = await import(
        '@/components/guest/GuestLanguageSwitcher'
      );

      const mockOnChange = vi.fn();

      const benchmark = await runBenchmark(
        'Render: GuestLanguageSwitcher',
        () => {
          const { unmount } = render(
            React.createElement(GuestLanguageSwitcher, {
              currentLanguage: 'en',
              onLanguageChange: mockOnChange,
              availableLanguages: ['en', 'fr', 'es', 'de', 'nl', 'it'],
            })
          );
          unmount();
          return true;
        },
        { targetMs: RENDER_TARGET_MS, iterations: RENDER_ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });

    it('TranslationBanner renders in < 50ms', async () => {
      const { TranslationBanner } = await import(
        '@/components/guest/TranslationBanner'
      );

      const mockOnToggle = vi.fn();

      const benchmark = await runBenchmark(
        'Render: TranslationBanner',
        () => {
          const { unmount } = render(
            React.createElement(TranslationBanner, {
              sourceLanguage: 'en',
              displayLanguage: 'fr',
              isShowingOriginal: false,
              onToggleOriginal: mockOnToggle,
            })
          );
          unmount();
          return true;
        },
        { targetMs: RENDER_TARGET_MS, iterations: RENDER_ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });

    it('ViewOriginalToggle renders in < 50ms', async () => {
      const { ViewOriginalToggle } = await import(
        '@/components/guest/ViewOriginalToggle'
      );

      const mockOnToggle = vi.fn();

      const benchmark = await runBenchmark(
        'Render: ViewOriginalToggle',
        () => {
          const { unmount } = render(
            React.createElement(ViewOriginalToggle, {
              showingOriginal: false,
              onToggle: mockOnToggle,
              sourceLanguage: 'en',
              displayLanguage: 'fr',
            })
          );
          unmount();
          return true;
        },
        { targetMs: RENDER_TARGET_MS, iterations: RENDER_ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });

    it('LanguageIndicator renders in < 50ms', async () => {
      const { LanguageIndicator } = await import(
        '@/components/guest/LanguageIndicator'
      );

      const benchmark = await runBenchmark(
        'Render: LanguageIndicator',
        () => {
          const { unmount } = render(
            React.createElement(LanguageIndicator, {
              language: 'fr',
            })
          );
          unmount();
          return true;
        },
        { targetMs: RENDER_TARGET_MS, iterations: RENDER_ITERATIONS }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        minPassRate: 0.90,
      });

      expect(validation.passed).toBe(true);
    });
  });

  describe('Cookie Operations', () => {
    it('setGuestLanguageCookie completes in < 10ms', async () => {
      const { setGuestLanguageCookie } = await import(
        '@/lib/i18n/guest-language'
      );

      const benchmark = await runBenchmark(
        'Cookie: Set',
        () => {
          setGuestLanguageCookie('fr');
          return true;
        },
        { targetMs: COOKIE_TARGET_MS, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('getGuestLanguageCookie completes in < 10ms', async () => {
      const { getGuestLanguageCookie, setGuestLanguageCookie } = await import(
        '@/lib/i18n/guest-language'
      );

      // Set a cookie first
      setGuestLanguageCookie('es');

      const benchmark = await runBenchmark(
        'Cookie: Get',
        () => {
          return getGuestLanguageCookie();
        },
        { targetMs: COOKIE_TARGET_MS, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('clearGuestLanguageCookie completes in < 10ms', async () => {
      const { clearGuestLanguageCookie, setGuestLanguageCookie } = await import(
        '@/lib/i18n/guest-language'
      );

      // Set a cookie first
      setGuestLanguageCookie('de');

      const benchmark = await runBenchmark(
        'Cookie: Clear',
        () => {
          clearGuestLanguageCookie();
          return true;
        },
        { targetMs: COOKIE_TARGET_MS, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });
  });

  describe('Language Detection Client-Side', () => {
    it('detectGuestLanguageClient completes in < 10ms', async () => {
      const { detectGuestLanguageClient } = await import(
        '@/lib/i18n/guest-language'
      );

      const benchmark = await runBenchmark(
        'Client: detectGuestLanguageClient',
        () => {
          return detectGuestLanguageClient();
        },
        { targetMs: COOKIE_TARGET_MS, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });

    it('detectGuestLanguageClient with URL param completes in < 10ms', async () => {
      const { detectGuestLanguageClient } = await import(
        '@/lib/i18n/guest-language'
      );

      const benchmark = await runBenchmark(
        'Client: detectLanguage with URL',
        () => {
          return detectGuestLanguageClient('fr');
        },
        { targetMs: COOKIE_TARGET_MS, iterations: 1000 }
      );

      benchmarks.push(benchmark);

      const validation = validateBenchmark(benchmark, {
        requireP95: true,
        minPassRate: 0.95,
      });

      expect(validation.passed).toBe(true);
    });
  });
});
