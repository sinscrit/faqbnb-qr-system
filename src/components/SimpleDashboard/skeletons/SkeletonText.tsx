// src/components/SimpleDashboard/skeletons/SkeletonText.tsx
// REQ-138: Skeleton Text Placeholder Component
// Created: 2026-01-06
// Last Modified: 2026-01-06

import { cn } from '@/lib/utils';

/**
 * Width preset options for SkeletonText
 */
export type SkeletonTextWidth = 'sm' | 'md' | 'lg' | 'full' | string;

/**
 * Height preset options for SkeletonText
 */
export type SkeletonTextHeight = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Props for SkeletonText component
 */
export interface SkeletonTextProps {
  /** Width of the skeleton: 'sm' (16rem), 'md' (24rem), 'lg' (32rem), 'full' (100%), or custom */
  width?: SkeletonTextWidth;
  /** Height of the skeleton: 'xs' (12px), 'sm' (16px), 'md' (20px), 'lg' (24px) */
  height?: SkeletonTextHeight;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Width preset mappings
 */
const widthStyles: Record<string, string> = {
  sm: 'w-16',  // 4rem / 64px - short labels
  md: 'w-24',  // 6rem / 96px - medium text
  lg: 'w-32',  // 8rem / 128px - longer text
  full: 'w-full',
};

/**
 * Height preset mappings
 */
const heightStyles: Record<SkeletonTextHeight, string> = {
  xs: 'h-3',  // 12px - small labels
  sm: 'h-4',  // 16px - body text
  md: 'h-5',  // 20px - larger text
  lg: 'h-6',  // 24px - headings
};

/**
 * Skeleton placeholder for text lines
 *
 * Creates a rounded rectangle that mimics the shape of text,
 * used within loading states to indicate where content will appear.
 *
 * @param width - Width preset or custom value (default: 'md')
 * @param height - Height preset (default: 'sm')
 * @param className - Optional additional CSS classes
 */
export function SkeletonText({
  width = 'md',
  height = 'sm',
  className,
}: SkeletonTextProps) {
  // Determine width class - use preset or treat as custom
  const widthClass = widthStyles[width] || width;
  const heightClass = heightStyles[height];

  return (
    <div
      className={cn(
        'bg-gray-200 rounded',
        widthClass,
        heightClass,
        className
      )}
      aria-hidden="true"
    />
  );
}
