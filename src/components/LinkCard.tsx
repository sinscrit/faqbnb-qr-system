'use client';

import { useState } from 'react';
import { ExternalLink, FileText, Image, Play, Link as LinkIcon } from 'lucide-react';
import { LinkCardProps } from '@/types';
import { getLinkTypeColor, getYoutubeThumbnail } from '@/lib/utils';

export default function LinkCard({ title, linkType, url, thumbnailUrl, onClick }: LinkCardProps) {
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

  // Get the thumbnail URL based on link type with better fallback handling
  const getThumbnailUrl = () => {
    // First try the provided thumbnailUrl if it exists and no error occurred
    if (thumbnailUrl && thumbnailUrl.trim() !== '' && !imageError) {
      return thumbnailUrl;
    }
    
    // For YouTube videos, try to extract thumbnail from URL
    if (linkType === 'youtube' && !imageError) {
      const youtubeThumbnail = getYoutubeThumbnail(url);
      if (youtubeThumbnail) {
        return youtubeThumbnail;
      }
    }
    
    // For images, use the URL directly as the thumbnail
    if (linkType === 'image' && !imageError) {
      return url;
    }
    
    // Return null to show fallback icon
    return null;
  };

  const thumbnailSrc = getThumbnailUrl();
  const colorClasses = getLinkTypeColor(linkType);

  // Handle image load error
  const handleImageError = () => {
    console.warn(`Failed to load thumbnail for: ${title}`, { thumbnailUrl, url, linkType });
    setImageError(true);
    setImageLoading(false);
  };

  // Handle successful image load
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={`${title} preview`}
            className={`w-full h-full object-cover transition-all duration-200 group-hover:scale-105 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : null}
        
        {/* Fallback icon when no thumbnail or image failed to load */}
        {(!thumbnailSrc || imageError || imageLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className={`text-gray-400 transition-transform duration-200 group-hover:scale-110 ${
              linkType === 'youtube' ? 'text-red-400' : 
              linkType === 'pdf' ? 'text-blue-400' : 
              linkType === 'image' ? 'text-green-400' : 
              'text-purple-400'
            }`}>
              {getIcon()}
            </div>
          </div>
        )}

        {/* Loading state */}
        {imageLoading && thumbnailSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Link type badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
            {linkType.toUpperCase()}
          </span>
        </div>

        {/* Play button overlay for videos */}
        {linkType === 'youtube' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-600 text-white rounded-full p-3 shadow-lg group-hover:bg-red-700 transition-colors">
              <Play className="w-6 h-6 fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        {/* URL preview for text links */}
        {linkType === 'text' && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            {new URL(url).hostname}
          </p>
        )}
      </div>

      {/* Hover indicator */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-xl transition-colors pointer-events-none" />
    </div>
  );
}

