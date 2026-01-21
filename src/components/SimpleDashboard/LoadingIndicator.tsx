// src/components/SimpleDashboard/LoadingIndicator.tsx
// REQ-138: Unified Loading Indicator Component
// Created: 2026-01-06
// Last Modified: 2026-01-21

'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Size options for LoadingIndicator
 */
export type LoadingIndicatorSize = 'sm' | 'md' | 'lg';

/**
 * Props for LoadingIndicator component
 */
export interface LoadingIndicatorProps {
  /** Size of the spinner: 'sm' (16px), 'md' (24px), 'lg' (32px) */
  size?: LoadingIndicatorSize;
  /** Accessible label describing what is loading */
  label?: string;
  /** Override color (default: Airbnb red #FF385C) */
  color?: 'brand' | 'white' | 'muted';
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Size preset mappings
 */
const sizeStyles: Record<LoadingIndicatorSize, string> = {
  sm: 'w-4 h-4',  // 16px
  md: 'w-6 h-6',  // 24px
  lg: 'w-8 h-8',  // 32px
};

/**
 * Color preset mappings
 */
const colorStyles: Record<string, string> = {
  brand: 'text-[#FF385C]',
  white: 'text-white',
  muted: 'text-[#717171]',
};

/**
 * Unified loading spinner component
 *
 * Provides a consistent, accessible loading indicator across the application:
 * - Uses Lucide Loader2 icon with spin animation
 * - Includes ARIA attributes for screen readers
 * - Supports multiple sizes and colors
 * - Respects prefers-reduced-motion via CSS
 *
 * @param size - Size preset (default: 'md')
 * @param label - Accessible label (default: translated 'Loading...')
 * @param color - Color preset (default: 'brand')
 * @param className - Optional additional CSS classes
 */
export function LoadingIndicator({
  size = 'md',
  label,
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  const t = useTranslations('common.loading');
  const effectiveLabel = label ?? t('generic.loading');
  const sizeClass = sizeStyles[size];
  const colorClass = colorStyles[color];

  return (
    <span
      role="status"
      aria-label={effectiveLabel}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <Loader2
        className={cn(
          'animate-spin',
          sizeClass,
          colorClass
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{effectiveLabel}</span>
    </span>
  );
}
