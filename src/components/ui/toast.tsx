'use client';

/**
 * Toast Component
 *
 * A toast notification component using @radix-ui/react-toast primitives.
 * Provides success, error, info, and default variants with consistent styling.
 *
 * @module components/ui/toast
 * @created 2026-01-24
 * @requestReference REQ-E05-030
 */

import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

// =============================================================================
// Types
// =============================================================================

export type ToastVariant = 'default' | 'success' | 'error' | 'info';

export interface ToastProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: ToastVariant;
}

// =============================================================================
// Variant Styles
// =============================================================================

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-white border-gray-200',
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  info: 'bg-blue-50 border-blue-200',
};

const variantTitleStyles: Record<ToastVariant, string> = {
  default: 'text-gray-900',
  success: 'text-green-900',
  error: 'text-red-900',
  info: 'text-blue-900',
};

const variantDescriptionStyles: Record<ToastVariant, string> = {
  default: 'text-gray-600',
  success: 'text-green-700',
  error: 'text-red-700',
  info: 'text-blue-700',
};

// =============================================================================
// Toast Components
// =============================================================================

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = forwardRef<
  ElementRef<typeof ToastPrimitive.Viewport>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export const Toast = forwardRef<
  ElementRef<typeof ToastPrimitive.Root>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & ToastProps
>(({ className, variant = 'default', title, description, action, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
      'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
      'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out',
      'data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
      'data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
      variantStyles[variant],
      className
    )}
    {...props}
  >
    <div className="flex-1">
      {title && (
        <ToastTitle className={variantTitleStyles[variant]}>{title}</ToastTitle>
      )}
      {description && (
        <ToastDescription className={variantDescriptionStyles[variant]}>
          {description}
        </ToastDescription>
      )}
    </div>
    {action && (
      <ToastAction
        altText={action.label}
        onClick={action.onClick}
        className={cn(
          'inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          variant === 'error' && 'border-red-300 hover:bg-red-100 focus:ring-red-500',
          variant === 'success' && 'border-green-300 hover:bg-green-100 focus:ring-green-500',
          variant === 'info' && 'border-blue-300 hover:bg-blue-100 focus:ring-blue-500',
          variant === 'default' && 'border-gray-300 hover:bg-gray-100 focus:ring-gray-500'
        )}
      >
        {action.label}
      </ToastAction>
    )}
    <ToastClose />
  </ToastPrimitive.Root>
));
Toast.displayName = ToastPrimitive.Root.displayName;

export const ToastTitle = forwardRef<
  ElementRef<typeof ToastPrimitive.Title>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

export const ToastDescription = forwardRef<
  ElementRef<typeof ToastPrimitive.Description>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

export const ToastAction = forwardRef<
  ElementRef<typeof ToastPrimitive.Action>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

export const ToastClose = forwardRef<
  ElementRef<typeof ToastPrimitive.Close>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity',
      'hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;
