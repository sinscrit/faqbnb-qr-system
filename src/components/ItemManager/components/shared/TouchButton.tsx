/**
 * TouchButton Component
 *
 * Utility button wrapper that ensures minimum touch target sizing on mobile
 * viewports while maintaining normal sizing on desktop.
 *
 * @module ItemManager/components/shared/TouchButton
 * @lastModified 2026-01-03 (REQ-089)
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Additional CSS classes */
  className?: string;
  /** Minimum size in pixels (default: 48) */
  minSize?: 44 | 48;
  /** Apply touch sizing on all viewports, not just mobile (default: false) */
  alwaysApply?: boolean;
}

// =============================================================================
// Component Implementation
// =============================================================================

/**
 * A button wrapper that ensures minimum touch target sizing on mobile.
 *
 * Per accessibility guidelines:
 * - WCAG 2.1 Success Criterion 2.5.5: 44x44 CSS pixels minimum
 * - Material Design: 48dp minimum
 *
 * @example
 * ```tsx
 * // Basic usage - 48px on mobile, content-sized on desktop
 * <TouchButton onClick={handleClick}>
 *   <X className="w-5 h-5" />
 * </TouchButton>
 *
 * // With 44px minimum (WCAG minimum)
 * <TouchButton minSize={44}>Delete</TouchButton>
 *
 * // Always apply touch sizing
 * <TouchButton alwaysApply>Always 48px</TouchButton>
 * ```
 */
export function TouchButton({
  children,
  className,
  minSize = 48,
  alwaysApply = false,
  type = 'button',
  ...props
}: TouchButtonProps) {
  // Using inline styles for minSize since Tailwind doesn't support arbitrary dynamic values well
  const sizeClass = minSize === 44 ? 'min-h-[44px] min-w-[44px]' : 'min-h-[48px] min-w-[48px]';

  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center',
        // Touch target sizing - apply on mobile or always
        alwaysApply ? sizeClass : `${sizeClass} md:min-h-0 md:min-w-0`,
        // Touch feedback
        'active:bg-black/5',
        'touch-manipulation',
        // Remove webkit tap highlight
        '[-webkit-tap-highlight-color:transparent]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default TouchButton;
