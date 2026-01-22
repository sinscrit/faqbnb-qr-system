"use client";

// Error Page for Next.js App Router
// This catches errors in page components and displays a fallback UI
// Sentry will automatically capture these errors
// Last Modified: 2026-01-22

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.boundary');

  useEffect(() => {
    // Report the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-5">
      <div
        role="alert"
        aria-live="assertive"
        className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg"
      >
        <h2 className="text-red-500 mb-4 text-2xl font-semibold">
          {t('title')}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {t('message')}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">
            {t('errorId', { digest: error.digest })}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {t('tryAgain')}
        </button>
      </div>
    </div>
  );
}
