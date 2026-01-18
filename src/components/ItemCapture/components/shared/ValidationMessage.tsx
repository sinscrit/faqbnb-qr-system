'use client';

/**
 * ValidationMessage Component
 *
 * A reusable component for displaying validation errors, warnings, and info messages.
 * Provides consistent styling and accessibility support across the ItemCapture flow.
 *
 * @module ItemCapture/components/shared/ValidationMessage
 * @see docs/REQ-052-create-validation-layer-detailed.md
 * @lastModified 2025-12-31 (REQ-052 Task 11)
 */

import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export type ValidationMessageType = 'error' | 'warning' | 'info';

export interface ValidationMessageProps {
  /** Type of validation message determining styling and icon */
  type: ValidationMessageType;
  /** The message to display */
  message: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Whether to show the icon (default: true) */
  showIcon?: boolean;
}

// =============================================================================
// Styling Configuration
// =============================================================================

const styles: Record<ValidationMessageType, string> = {
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

const iconStyles: Record<ValidationMessageType, string> = {
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

const icons: Record<ValidationMessageType, typeof AlertCircle> = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const ariaLabels: Record<ValidationMessageType, string> = {
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
};

// =============================================================================
// Component
// =============================================================================

/**
 * ValidationMessage displays error, warning, or info messages with
 * appropriate styling and icons.
 *
 * Features:
 * - Three message types: error (red), warning (yellow), info (blue)
 * - Appropriate icons for each type
 * - Accessible with proper ARIA attributes
 * - Customizable via className prop
 *
 * @example
 * ```tsx
 * <ValidationMessage
 *   type="error"
 *   message="Title is required"
 * />
 *
 * <ValidationMessage
 *   type="warning"
 *   message="Instructions exceed 5000 character limit"
 *   className="mt-2"
 * />
 *
 * <ValidationMessage
 *   type="info"
 *   message="You can add up to 10 photos"
 *   showIcon={false}
 * />
 * ```
 */
export function ValidationMessage({
  type,
  message,
  className,
  showIcon = true,
}: ValidationMessageProps) {
  const Icon = icons[type];

  return (
    <div
      className={cn(
        'flex items-start gap-2 px-3 py-2 border rounded-md text-sm',
        styles[type],
        className
      )}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {showIcon && (
        <Icon
          className={cn('w-4 h-4 flex-shrink-0 mt-0.5', iconStyles[type])}
          aria-hidden="true"
        />
      )}
      <span>
        <span className="sr-only">{ariaLabels[type]}: </span>
        {message}
      </span>
    </div>
  );
}

// =============================================================================
// List Component for Multiple Messages
// =============================================================================

export interface ValidationMessageListProps {
  /** Array of messages with their types */
  messages: Array<{
    type: ValidationMessageType;
    message: string;
    key?: string;
  }>;
  /** Optional additional CSS classes for the container */
  className?: string;
  /** Gap between messages (default: 2) */
  gap?: number;
}

/**
 * ValidationMessageList displays multiple validation messages in a list.
 *
 * @example
 * ```tsx
 * <ValidationMessageList
 *   messages={[
 *     { type: 'error', message: 'Title is required', key: 'title' },
 *     { type: 'warning', message: 'Instructions too long', key: 'text' },
 *   ]}
 * />
 * ```
 */
export function ValidationMessageList({
  messages,
  className,
  gap = 2,
}: ValidationMessageListProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={cn(`flex flex-col gap-${gap}`, className)}>
      {messages.map((item, index) => (
        <ValidationMessage
          key={item.key ?? index}
          type={item.type}
          message={item.message}
        />
      ))}
    </div>
  );
}

export default ValidationMessage;
