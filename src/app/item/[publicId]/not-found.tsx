import Link from 'next/link';
import { Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Item Not Found
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          The item you&apos;re looking for doesn&apos;t exist or may have been removed. 
          Please check the QR code and try again.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
            disabled
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back (Demo Mode)
          </button>
          
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>

        {/* Help text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

