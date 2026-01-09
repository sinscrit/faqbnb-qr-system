'use client';

/**
 * Version Footer Component
 *
 * Displays the git commit hash and build date at the bottom of every page.
 * Helps verify which version is deployed.
 *
 * @created 2026-01-09
 */

export function VersionFooter() {
  const commit = process.env.NEXT_PUBLIC_GIT_COMMIT || 'dev';
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || 'local';

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 py-1 px-4 text-center text-xs text-gray-500 z-50">
      <span>v{commit}</span>
      <span className="mx-2">|</span>
      <span>{buildDate}</span>
    </footer>
  );
}

export default VersionFooter;
