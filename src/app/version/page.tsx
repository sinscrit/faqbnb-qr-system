import versionData from '../../../version.json';

/**
 * Version Page - Displays application version information
 * Route: /version
 *
 * Updated: 2026-01-13
 */
export default function VersionPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">FAQBNB Version</h1>

          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Version</div>
              <div className="text-3xl font-mono font-bold text-blue-600">
                v{versionData.version}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Commit</div>
                <div className="text-lg font-mono text-gray-800">
                  {versionData.commit}
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Date</div>
                <div className="text-lg font-mono text-gray-800">
                  {versionData.date}
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Environment</div>
              <div className="text-lg font-mono text-gray-800">
                {process.env.NODE_ENV || 'development'}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
