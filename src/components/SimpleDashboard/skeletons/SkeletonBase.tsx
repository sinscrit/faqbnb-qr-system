// src/components/SimpleDashboard/skeletons/SkeletonBase.tsx
// REQ-138: Accessible Skeleton Base Component
// Created: 2026-01-06
// Last Modified: 2026-01-06

import { cn } from '@/lib/utils';

/**
 * Props for SkeletonBase component
 */
export interface SkeletonBaseProps {
  /** Child elements to render inside the skeleton wrapper */
  children: React.ReactNode;
  /** Accessible label describing what is loading */
  label?: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Accessible skeleton wrapper component
 *
 * Provides proper ARIA attributes for screen readers:
 * - role="status" for live region announcement
 * - aria-busy="true" to indicate loading state
 * - aria-label for context
 * - sr-only text for detailed announcement
 *
 * @param children - Child elements (skeleton UI)
 * @param label - Accessible label (default: "Loading content")
 * @param className - Optional additional CSS classes
 */
export function SkeletonBase({
  children,
  label = 'Loading content',
  className,
}: SkeletonBaseProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn('animate-pulse', className)}
    >
      <span className="sr-only">{label}, please wait...</span>
      {children}
    </div>
  );
}
