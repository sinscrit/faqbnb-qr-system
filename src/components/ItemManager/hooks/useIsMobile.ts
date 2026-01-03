/**
 * useIsMobile Hook
 *
 * Viewport detection hook for determining mobile/desktop viewport.
 * Uses matchMedia for efficient viewport detection with proper SSR handling.
 *
 * @module ItemManager/hooks/useIsMobile
 * @lastModified 2026-01-03 (REQ-089)
 */

'use client';

import { useState, useEffect } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface UseIsMobileOptions {
  /** Breakpoint in pixels (default: 768 = md breakpoint in Tailwind) */
  breakpoint?: number;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook to detect if the current viewport is mobile-sized.
 *
 * @param options - Configuration options
 * @param options.breakpoint - Breakpoint in pixels (default: 768)
 * @returns boolean - true if viewport is below the breakpoint
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isMobile = useIsMobile();
 *   return isMobile ? <MobileView /> : <DesktopView />;
 * }
 *
 * // With custom breakpoint
 * const isSmall = useIsMobile({ breakpoint: 640 }); // sm breakpoint
 * ```
 */
export function useIsMobile(options: UseIsMobileOptions = {}): boolean {
  const { breakpoint = 768 } = options;

  // Default to false for SSR - prevents hydration mismatch
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    // Set initial value based on current viewport
    setIsMobile(mediaQuery.matches);

    // Handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Add listener using modern API
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
