// src/components/SimpleDashboard/EmptyStateCard.tsx
// REQ-137: Reusable Empty State Card Component
// Created: 2026-01-06
// Last Modified: 2026-01-06

'use client';

import { LucideIcon } from 'lucide-react';

/**
 * Props for the EmptyStateCard component
 */
export interface EmptyStateCardProps {
  /** Icon component to display */
  icon?: LucideIcon;
  /** Primary heading text */
  title: string;
  /** Secondary descriptive text */
  description: string;
  /** CTA button label */
  actionLabel?: string;
  /** CTA button click handler */
  onAction?: () => void;
  /** Variant for visual styling */
  variant?: 'default' | 'welcome' | 'subtle';
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Reusable empty state card component for SimpleDashboard
 *
 * Features:
 * - Three visual variants: default, welcome (prominent), subtle (inline)
 * - Airbnb Design System styling with gradient CTA button
 * - Full accessibility with ARIA attributes
 * - Keyboard navigation support
 * - Optional icon, title, description, and CTA button
 *
 * @param icon - Lucide icon component to display
 * @param title - Primary heading text
 * @param description - Secondary descriptive text
 * @param actionLabel - CTA button label
 * @param onAction - CTA button click handler
 * @param variant - Visual styling variant
 * @param className - Optional additional CSS classes
 */
export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  className = '',
}: EmptyStateCardProps) {
  // Variant-specific styles
  const variantStyles = {
    default: {
      container: 'py-12 px-6',
      iconContainer: 'w-20 h-20',
      iconSize: 'w-10 h-10',
      title: 'text-2xl',
      description: 'text-lg',
    },
    welcome: {
      container: 'py-16 px-8',
      iconContainer: 'w-24 h-24',
      iconSize: 'w-12 h-12',
      title: 'text-3xl',
      description: 'text-xl',
    },
    subtle: {
      container: 'py-8 px-4',
      iconContainer: 'w-16 h-16',
      iconSize: 'w-8 h-8',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      role="status"
      aria-label={`${title}. ${description}`}
      className={`flex flex-col items-center text-center ${styles.container} ${className}`}
    >
      {/* Icon Container */}
      {Icon && (
        <div
          className={`${styles.iconContainer} mx-auto mb-6 bg-[#F7F7F7] rounded-full flex items-center justify-center`}
        >
          <Icon
            className={`${styles.iconSize} text-[#717171]`}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Title */}
      <h3 className={`${styles.title} font-bold text-[#222222] mb-2`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`${styles.description} text-[#717171] max-w-md mx-auto mb-6`}>
        {description}
      </p>

      {/* CTA Button */}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionLabel}
          className="inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 rounded-lg font-medium text-base bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white transition-all duration-200 ease-out hover:scale-[1.02] hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyStateCard;
