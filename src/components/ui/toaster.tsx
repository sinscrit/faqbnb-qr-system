'use client';

/**
 * Toaster Component
 *
 * Global toast container that renders all active toasts from the toast store.
 * Should be placed at the root layout level to ensure toasts are visible globally.
 *
 * @module components/ui/toaster
 * @created 2026-01-24
 * @requestReference REQ-E05-030
 */

import { useToastStore } from '@/hooks/useToast';
import { Toast, ToastProvider, ToastViewport } from './toast';

// =============================================================================
// Toaster Component
// =============================================================================

/**
 * Toaster component that renders all active toasts.
 * Place this component at the root layout level.
 *
 * @example
 * // In layout.tsx
 * import { Toaster } from '@/components/ui/toaster';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Toaster />
 *       </body>
 *     </html>
 *   );
 * }
 */
export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          action={toast.action}
          onOpenChange={(open) => {
            if (!open) {
              dismiss(toast.id);
            }
          }}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
