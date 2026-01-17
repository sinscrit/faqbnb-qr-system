"use client";

// Global Error Page for Next.js App Router
// This catches errors in the root layout and displays a fallback UI
// Sentry will automatically capture these errors
// Last Modified: 2026-01-16

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#f8f9fa',
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            maxWidth: '500px',
          }}>
            <h1 style={{
              color: '#dc3545',
              marginBottom: '16px',
              fontSize: '24px',
            }}>
              Something went wrong!
            </h1>
            <p style={{
              color: '#6c757d',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              We apologize for the inconvenience. Our team has been notified of this error.
            </p>
            {error.digest && (
              <p style={{
                fontSize: '12px',
                color: '#adb5bd',
                marginBottom: '16px',
                fontFamily: 'monospace',
              }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#0d6efd',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
