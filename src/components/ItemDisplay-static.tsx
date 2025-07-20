'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ItemDisplayProps } from '@/types';
import LinkCard from './LinkCard-static';

export default function ItemDisplay({ item }: ItemDisplayProps) {
  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h1>
          <p className="text-gray-600">The requested item could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">QR</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                <p className="text-sm text-gray-600">ID: {item.publicId}</p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View More Items
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Description */}
        {item.description && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Item</h2>
            <p className="text-gray-700 leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Resources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Resources & Links</h2>
            <span className="text-sm text-gray-500">
              {item.links?.length || 0} resource{(item.links?.length || 0) !== 1 ? 's' : ''}
            </span>
          </div>

          {item.links && item.links.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {item.links
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((link) => (
                  <LinkCard
                    key={link.id}
                    title={link.title}
                    linkType={link.linkType}
                    url={link.url}
                    thumbnailUrl={link.thumbnailUrl}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ExternalLink className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Available</h3>
              <p className="text-gray-600">
                Resources and links for this item haven&apos;t been added yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Scan the QR code to access this information instantly
          </p>
        </div>
      </div>
    </div>
  );
}

