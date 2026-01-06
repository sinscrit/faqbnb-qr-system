// src/components/SimpleDashboard/skeletons/SkeletonCard.tsx
// REQ-138: Skeleton Card Container Component
// Created: 2026-01-06
// Last Modified: 2026-01-06

import { cn } from '@/lib/utils';

/**
 * Padding preset options for SkeletonCard
 */
export type SkeletonCardPadding = 'sm' | 'md' | 'lg' | 'none';

/**
 * Props for SkeletonCard component
 */
export interface SkeletonCardProps {
  /** Child elements to render inside the card */
  children: React.ReactNode;
  /** Padding preset: 'sm' (p-4), 'md' (p-6), 'lg' (p-8), 'none' (p-0) */
  padding?: SkeletonCardPadding;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Padding preset mappings
 */
const paddingStyles: Record<SkeletonCardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  none: 'p-0',
};

/**
 * Skeleton card container component
 *
 * Provides consistent card styling for skeleton placeholders,
 * matching the existing Airbnb Design System card appearance.
 *
 * @param children - Child elements (skeleton content)
 * @param padding - Padding preset (default: 'md')
 * @param className - Optional additional CSS classes
 */
export function SkeletonCard({
  children,
  padding = 'md',
  className,
}: SkeletonCardProps) {
  const paddingClass = paddingStyles[padding];

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm',
        paddingClass,
        className
      )}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
