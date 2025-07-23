'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { ItemDisplayProps } from '@/types';
import { ReactionCounts } from '@/types/reactions';
import LinkCard from './LinkCard';
import ReactionButtons from './ReactionButtons';
import { getSessionId } from '@/lib/session';
import { analyticsApi } from '@/lib/api';

export default function ItemDisplay({ item }: ItemDisplayProps) {
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [visitRecorded, setVisitRecorded] = useState<boolean>(false);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts | undefined>(undefined);
  const [reactionError, setReactionError] = useState<string | null>(null);

  // Visit tracking with client-side deduplication
  useEffect(() => {
    const recordVisit = async () => {
      try {
        // Skip if no item or visit already recorded in this component instance
        if (!item?.id || visitRecorded) {
          return;
        }

        const sessionId = getSessionId();
        
        // Check if we've already recorded a visit for this item in this session
        const visitKey = `faqbnb_visit_${item.id}_${sessionId}`;
        const lastVisitTime = localStorage.getItem(visitKey);
        
        // Only record visit if we haven't visited this item in this session
        // or if last visit was more than 1 minute ago (to handle page refreshes)
        const now = Date.now();
        const oneMinute = 60 * 1000;
        
        if (lastVisitTime && (now - parseInt(lastVisitTime)) < oneMinute) {
          console.info('Visit already recorded for this item in current session');
          setVisitRecorded(true);
          return;
        }

        // Record the visit
        await analyticsApi.recordVisit(item.id, sessionId);
        
        // Mark as recorded in localStorage to prevent duplicate visits
        localStorage.setItem(visitKey, now.toString());
        setVisitRecorded(true);
        
        console.info('Visit recorded successfully for item:', item.name);
      } catch (error) {
        console.error('Visit tracking failed:', error);
        // Fail silently - don't disrupt user experience
        // Still mark as recorded to prevent retries
        setVisitRecorded(true);
      }
    };

    recordVisit();
  }, [item?.id, visitRecorded]); // Re-run if item changes, but not if visitRecorded changes

  // Reaction change handler with error boundary
  const handleReactionChange = (newCounts: ReactionCounts) => {
    try {
      setReactionCounts(newCounts);
      setReactionError(null);
      console.info('Reaction counts updated:', newCounts);
    } catch (error) {
      console.error('Failed to handle reaction change:', error);
      setReactionError('Failed to update reaction counts');
    }
  };

  // Error boundary for reaction system
  const handleReactionError = (error: Error) => {
    console.error('Reaction system error:', error);
    setReactionError('Reaction system temporarily unavailable');
  };

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
              <Image
                src="/faqbnb_logoshort.png"
                alt="FAQBNB Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
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

        {/* Reaction Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            How helpful was this?
          </h2>
          
          {/* Error Message */}
          {reactionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{reactionError}</p>
              <button 
                onClick={() => setReactionError(null)}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Reaction Buttons */}
          <div className="reaction-section-wrapper">
            <ReactionButtons 
              itemId={item.id} 
              initialCounts={reactionCounts}
              onReactionChange={handleReactionChange}
            />
          </div>
          
          {/* Reaction Summary */}
          {reactionCounts && reactionCounts.total > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                {reactionCounts.total} {reactionCounts.total === 1 ? 'person' : 'people'} found this helpful
              </p>
            </div>
          )}
        </div>

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
            Powered by FAQBNB.com
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

