/**
 * useToast Hook
 *
 * A lightweight toast notification system using React's useSyncExternalStore
 * for state management. Provides a simple API for showing toast notifications.
 *
 * @module hooks/useToast
 * @created 2026-01-24
 * @requestReference REQ-E05-030
 *
 * @example
 * // Basic usage
 * import { useToast } from '@/hooks/useToast';
 *
 * function MyComponent() {
 *   const { toast } = useToast();
 *
 *   const handleClick = () => {
 *     toast({
 *       title: 'Success',
 *       description: 'Your changes have been saved.',
 *       variant: 'success',
 *     });
 *   };
 *
 *   return <button onClick={handleClick}>Save</button>;
 * }
 */

'use client';

import { useSyncExternalStore, useCallback } from 'react';
import type { ToastVariant } from '@/components/ui/toast';

// =============================================================================
// Types
// =============================================================================

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export type ToastInput = Omit<ToastData, 'id'>;

// =============================================================================
// Toast Store (Module-Level State)
// =============================================================================

let toasts: ToastData[] = [];
let listeners: Set<() => void> = new Set();
let toastCounter = 0;

const DEFAULT_DURATION = 5000;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ToastData[] {
  return toasts;
}

function getServerSnapshot(): ToastData[] {
  return [];
}

function addToast(input: ToastInput): string {
  const id = `toast-${++toastCounter}-${Date.now()}`;
  const toast: ToastData = {
    ...input,
    id,
    duration: input.duration ?? DEFAULT_DURATION,
  };

  toasts = [...toasts, toast];
  emitChange();

  // Auto-dismiss after duration
  if (toast.duration && toast.duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, toast.duration);
  }

  return id;
}

function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emitChange();
}

function dismissAllToasts(): void {
  toasts = [];
  emitChange();
}

// =============================================================================
// Store Hook (for Toaster component)
// =============================================================================

/**
 * Hook for the Toaster component to access toast state.
 * Returns current toasts and dismiss function.
 */
export function useToastStore() {
  const currentToasts = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    toasts: currentToasts,
    dismiss: dismissToast,
    dismissAll: dismissAllToasts,
  };
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook for showing toast notifications.
 * Returns a toast function for creating notifications.
 *
 * @returns Object with toast function and dismiss utilities
 */
export function useToast() {
  const toast = useCallback((input: ToastInput) => {
    return addToast(input);
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  const dismissAll = useCallback(() => {
    dismissAllToasts();
  }, []);

  return {
    toast,
    dismiss,
    dismissAll,
  };
}

// =============================================================================
// Convenience Functions (can be used outside React components)
// =============================================================================

export const toast = {
  /**
   * Show a default toast
   */
  default: (input: Omit<ToastInput, 'variant'>) => addToast({ ...input, variant: 'default' }),

  /**
   * Show a success toast
   */
  success: (input: Omit<ToastInput, 'variant'>) => addToast({ ...input, variant: 'success' }),

  /**
   * Show an error toast
   */
  error: (input: Omit<ToastInput, 'variant'>) => addToast({ ...input, variant: 'error' }),

  /**
   * Show an info toast
   */
  info: (input: Omit<ToastInput, 'variant'>) => addToast({ ...input, variant: 'info' }),

  /**
   * Dismiss a specific toast
   */
  dismiss: dismissToast,

  /**
   * Dismiss all toasts
   */
  dismissAll: dismissAllToasts,
};
