'use client';

import { useState } from 'react';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { ItemDisplayProps } from '@/types';
import LinkCard from './LinkCard';

export default function ItemDisplay({ item }: ItemDisplayProps) {
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

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

  const handleLinkClick = (url: string, linkType: string) => {
    if (linkType === 'youtube') {
      // For YouTube, we can either open in a new tab or embed
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (linkType === 'image') {
      // For images, we could open in a lightbox or new tab
      setSelectedLink(url);
    } else {
      // For PDFs and text links, open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const closeLightbox = () => {
    setSelectedLink(null);
  };

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
                <p className="text-sm text-gray-500">ID: {item.publicId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Description Section */}
        {item.description && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Item</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        )}

        {/* Links Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Instructions & Resources
            </h2>
            <span className="text-sm text-gray-500">
              {item.links.length} {item.links.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {item.links.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-3">
                <ExternalLink className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500">No resources available for this item.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {item.links.map((link) => (
                <LinkCard
                  key={link.id}
                  title={link.title}
                  linkType={link.linkType}
                  url={link.url}
                  thumbnailUrl={link.thumbnailUrl}
                  onClick={() => handleLinkClick(link.url, link.linkType)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Powered by QR Item Display System
          </p>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedLink && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="ml-2">Back</span>
            </button>
            <img
              src={selectedLink}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

