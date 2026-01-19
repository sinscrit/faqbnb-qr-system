import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * Next.js Configuration with next-intl Integration
 *
 * The createNextIntlPlugin wraps the Next.js config to enable:
 * - Server-side locale detection via src/i18n/request.ts
 * - Message loading from /messages/{locale}.json
 * - Integration with NextIntlClientProvider in layout.tsx
 *
 * REQ-232: IntlProvider wrapper integration
 * Last Modified: 2026-01-18
 */

// Create the next-intl plugin - explicitly specify the config path
// Using relative path from project root (where next.config.ts is located)
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  // IMPORTANT: Empty turbopack object required for next-intl to inject its aliases
  // See: https://github.com/amannn/next-intl/issues/639
  turbopack: {},
  // Fix workspace root detection for Webpack/build - ensure Next.js uses project root
  outputFileTracingRoot: process.cwd(),
};

// Sentry configuration options
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

// Apply both next-intl and Sentry config wrappers
// Order matters: nextConfig -> withNextIntl -> withSentryConfig
// withNextIntl must be applied first to properly set up i18n aliases
const configWithIntl = withNextIntl(nextConfig);
export default withSentryConfig(configWithIntl, sentryConfig);
