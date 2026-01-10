'use client';

/**
 * MediaCaptureStep Component
 *
 * Router component that directs to appropriate media capture UI based on
 * currentItem.contentType and contentSource. This component bridges the
 * ItemCreationWorkflow state with the existing ItemCapture step components.
 *
 * Routes:
 * - video + create-new -> VideoCaptureAdapter
 * - photo + create-new -> PhotoCaptureAdapter
 * - text -> TextEditorAdapter
 * - url -> UrlInputAdapter
 * - existing (any type) -> FileUploadAdapter
 *
 * @module ItemCreationWorkflow/components/steps/MediaCaptureStep
 * @see REQ-176 Add Missing Media Capture Step
 * @created 2026-01-10
 * @lastModified 2026-01-10
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CurrentItemState, ContentPiece } from '../../ItemCreationWorkflow.types';
import {
  VideoCaptureAdapter,
  PhotoCaptureAdapter,
  FileUploadAdapter,
  TextEditorAdapter,
  UrlInputAdapter,
} from './adapters';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for MediaCaptureStep component.
 */
export interface MediaCaptureStepProps {
  /** Current item being created with contentType and contentSource */
  currentItem: CurrentItemState;
  /** Callback to add a content piece to the current item */
  onAddContent: (piece: ContentPiece) => void;
  /** Callback when capture is complete (navigate to preview-save) */
  onComplete: () => void;
  /** Callback to go back to content-type-selection */
  onBack: () => void;
  /** Optional CSS class name for the root element */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * MediaCaptureStep routes to the appropriate capture component based on
 * content type and source selection.
 */
export default function MediaCaptureStep({
  currentItem,
  onAddContent,
  onComplete,
  onBack,
  className,
}: MediaCaptureStepProps) {
  // Validate that we have the necessary information
  if (!currentItem.contentType) {
    return (
      <div className={cn('flex flex-col items-center justify-center min-h-[400px] p-6', className)}>
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No Content Type Selected
        </h2>
        <p className="text-gray-600 text-center max-w-md mb-6">
          Please go back and select a content type before proceeding.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Route to appropriate adapter based on contentType and contentSource
  const { contentType, contentSource } = currentItem;

  // Common adapter props
  const adapterProps = {
    currentItem,
    onAddContent,
    onComplete,
    onBack,
  };

  // Route to appropriate adapter
  // Priority: contentSource 'existing' always uses FileUploadAdapter
  // Then route by contentType for 'create-new' source
  if (contentSource === 'existing') {
    // File upload for any existing content (video, photo, pdf)
    return <FileUploadAdapter {...adapterProps} />;
  }

  // Create-new routing based on content type
  switch (contentType) {
    case 'video':
      return <VideoCaptureAdapter {...adapterProps} />;

    case 'photo':
      return <PhotoCaptureAdapter {...adapterProps} />;

    case 'text':
      return <TextEditorAdapter {...adapterProps} />;

    case 'url':
      return <UrlInputAdapter {...adapterProps} />;

    case 'pdf':
      // PDFs are always uploaded, never created
      return <FileUploadAdapter {...adapterProps} />;

    default:
      // Unknown content type - show error
      return (
        <div className={cn('flex flex-col items-center justify-center min-h-[400px] p-6', className)}>
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unsupported Content Type
          </h2>
          <p className="text-gray-600 text-center max-w-md mb-6">
            The content type "{contentType}" is not supported. Please go back and select a different option.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      );
  }
}
