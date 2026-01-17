"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sentry Test Page
        </h1>
        <p className="text-gray-600 mb-6">
          Click the button below to trigger a test error and verify Sentry is working.
        </p>

        <button
          type="button"
          onClick={() => {
            throw new Error("Sentry Test Error - This is a test!");
          }}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium mb-4 w-full"
        >
          Throw Client Error
        </button>

        <button
          type="button"
          onClick={async () => {
            await Sentry.startSpan(
              { name: "Example Frontend Span", op: "test" },
              async () => {
                const res = await fetch("/api/sentry-example-api");
                if (!res.ok) {
                  throw new Error("API Error");
                }
              }
            );
          }}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium w-full"
        >
          Throw Server Error
        </button>

        <p className="text-xs text-gray-400 mt-6">
          After clicking, check your Sentry dashboard for the error.
        </p>
      </div>
    </div>
  );
}
