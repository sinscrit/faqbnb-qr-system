'use client';

import { useState } from 'react';
import { ExternalLink, FileText, Image, Play, Link as LinkIcon } from 'lucide-react';
import { LinkType } from '@/types';
import { getLinkTypeColor, getYoutubeThumbnail } from '@/lib/utils';

interface LinkCardProps {
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
}

export default function LinkCard({ title, linkType, url, thumbnailUrl }: LinkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Get the appropriate icon for the link type
  const getIcon = () => {
    switch (linkType) {
      case 'youtube':
        return <Play className="w-6 h-6" />;
      case 'pdf':
        return <FileText className="w-6 h-6" />;
      case 'image':
        return <Image className="w-6 h-6" />;
      case 'text':
        return <LinkIcon className="w-6 h-6" />;
      default:
        return <ExternalLink className="w-6 h-6" />;
    }
  };

  // Get the thumbnail URL based on link type
  const getThumbnailUrl = () => {
    if (thumbnailUrl && !imageError) {
      return thumbnailUrl;
    }
    
    if (linkType === 'youtube') {
      return getYoutubeThumbnail(url);
    }
    
    return null;
  };

  const finalThumbnailUrl = getThumbnailUrl();
  const colorClasses = getLinkTypeColor(linkType);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 overflow-hidden"
    >
      {/* Thumbnail Section */}
      <div className="relative h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
        {finalThumbnailUrl ? (
          <div className="relative w-full h-full">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            )}
            <img
              src={finalThumbnailUrl}
              alt=""
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className={`p-2 rounded-full ${colorClasses}`}>
                  {getIcon()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-full ${colorClasses} group-hover:scale-110 transition-transform duration-200`}>
            {getIcon()}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
              {title}
            </h3>
            
            {/* Link Type Badge */}
            <div className="mt-2 flex items-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
                {linkType.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="ml-2 flex-shrink-0">
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
          </div>
        </div>
      </div>
    </a>
  );
}

