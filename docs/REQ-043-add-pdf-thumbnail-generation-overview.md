# REQ-043: Add PDF Thumbnail Generation - Technical Implementation Overview

**Generated:** 2025-12-31T21:45:00
**Last Modified:** 2025-12-31T21:45:00
**Request Reference:** REQ-043 in `/docs/gen_requests.md`
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 3 - File Upload & Text
**Task ID:** 3.3

---

## Executive Summary

This document provides a technical implementation breakdown for enhancing PDF thumbnail generation capabilities in the ItemCapture component. The primary goal is to generate visual thumbnail previews from uploaded PDF documents and display document metadata (page count) to help users identify and verify PDF content before submission.

**Current State:** A basic `pdfThumbnailGenerator.ts` utility already exists at `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` with `generatePDFThumbnail()` and `getPDFPageCount()` functions. However, it lacks:
- Error handling for corrupt/password-protected PDFs
- Integration with FileUploadStep for displaying thumbnails
- Page count metadata display in the UI
- Graceful degradation with placeholder images for failure cases
- Performance optimization for large PDFs

This task focuses on **enhancing the existing PDF utility** and **integrating it into the file upload workflow** to meet all acceptance criteria.

---

## Scope

### In Scope

- Enhance `pdfThumbnailGenerator.ts` with robust error handling for:
  - Corrupt PDF files
  - Password-protected PDFs
  - Malformed document structure
  - Zero-page PDFs
- Add PDF-specific error types and constants
- Implement timeout handling for thumbnail generation (2-second limit)
- Create a unified interface that returns thumbnail + metadata + error state
- Integrate PDF thumbnail generation into FileUploadStep
- Display page count badge on PDF file cards
- Show appropriate placeholder images for failed thumbnail generation
- Add user-friendly error messages for PDF processing failures

### Out of Scope

- PDF text extraction or OCR
- Multi-page thumbnail generation (first page only)
- PDF editing or manipulation
- Converting PDFs to other formats
- Server-side PDF processing

---

## Dependencies

### Hard Dependencies (Must Complete First)

| Dependency | Status | Location |
|------------|--------|----------|
| Phase 1 Complete | Required | Tasks 1.1-1.5 |
| useFileUpload hook (Task 3.1) | Required | `src/components/ItemCapture/hooks/useFileUpload.ts` |
| FileUploadStep (Task 3.2) | Required | `src/components/ItemCapture/components/steps/FileUploadStep.tsx` |
| pdfjs-dist installed | Complete | `package.json` - v4.10.38 already installed |

### Soft Dependencies (Can Develop in Parallel)

| Dependency | Status | Notes |
|------------|--------|-------|
| Task 2.5 - Thumbnail Generator | Parallel | Shared thumbnail patterns |
| MediaThumbnail component (Task 5.2) | Future | Will consume PDF thumbnails |

### External Dependencies

| Dependency | Version | Notes |
|------------|---------|-------|
| pdfjs-dist | ^4.10.38 | Already installed; uses CDN worker |
| lucide-react | ^0.525.0 | Already installed - icons for PDF/error states |

---

## Technical Approach

### Architecture Decision: Enhanced Existing Utility

**Decision:** Enhance the existing `pdfThumbnailGenerator.ts` rather than creating a new module.

**Rationale:**
- pdfjs-dist integration already implemented with lazy loading
- CDN worker configuration already established
- Maintains single source of truth for PDF processing
- Follows existing codebase patterns
- Minimizes code duplication

### Enhanced Function Signature

The current utility returns `Promise<Blob | null>` which doesn't provide enough information for error handling. We'll enhance it to return a structured result:

```typescript
interface PDFThumbnailResult {
  /** Generated thumbnail blob (null if generation failed) */
  thumbnail: Blob | null;

  /** Total page count of the PDF */
  pageCount: number;

  /** Error information if thumbnail generation failed */
  error?: PDFThumbnailError;

  /** Whether this is a password-protected PDF */
  isPasswordProtected: boolean;

  /** Whether the PDF appears to be corrupt */
  isCorrupt: boolean;
}

interface PDFThumbnailError {
  code: PDFErrorCode;
  message: string;
  userMessage: string;
}

type PDFErrorCode =
  | 'PDF_PASSWORD_PROTECTED'
  | 'PDF_CORRUPT'
  | 'PDF_EMPTY'
  | 'PDF_TIMEOUT'
  | 'PDF_LOAD_FAILED'
  | 'CANVAS_RENDER_FAILED'
  | 'UNKNOWN_ERROR';
```

### Error Detection Strategy

Based on pdfjs-dist error patterns:

| Error Scenario | Detection Method | User Message |
|----------------|------------------|--------------|
| Password-protected | `PasswordException` from pdfjs | "This PDF is password-protected" |
| Corrupt file | `InvalidPDFException` or parsing failure | "This PDF file appears to be damaged" |
| Zero pages | `pdf.numPages === 0` | "This PDF has no pages to preview" |
| Timeout | AbortController + 2s timer | "Preview generation timed out" |
| Canvas failure | null context or render error | "Unable to generate preview" |

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FileUploadStep                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                       useFileUpload                            │  │
│  │  - File validation                                             │  │
│  │  - Returns ValidatedFile[]                                     │  │
│  └──────────────────────────────┬────────────────────────────────┘  │
│                                 │                                    │
│                                 ▼                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     usePDFThumbnail                            │  │
│  │  (NEW HOOK - processes PDF files after upload)                 │  │
│  │  - Calls generatePDFThumbnailWithMetadata()                    │  │
│  │  - Manages loading/error state per file                        │  │
│  │  - Updates MediaItem with thumbnail + pageCount                │  │
│  └──────────────────────────────┬────────────────────────────────┘  │
│                                 │                                    │
│                                 ▼                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     FileCard Component                         │  │
│  │  - Shows thumbnail or placeholder                              │  │
│  │  - Displays page count badge                                   │  │
│  │  - Shows error state with icon                                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Task Breakdown

| Task | Description | Estimate | Depends On |
|------|-------------|----------|------------|
| 3.3.1 | Define PDF error types and constants | 20 min | - |
| 3.3.2 | Enhance pdfThumbnailGenerator with error handling | 1 hr | 3.3.1 |
| 3.3.3 | Add timeout mechanism with AbortController | 30 min | 3.3.2 |
| 3.3.4 | Create usePDFThumbnail hook | 45 min | 3.3.2, 3.3.3 |
| 3.3.5 | Create PDFPlaceholder component | 30 min | 3.3.1 |
| 3.3.6 | Integrate into FileCard (add page count badge) | 30 min | 3.3.4, 3.3.5 |
| 3.3.7 | Add loading state during thumbnail generation | 20 min | 3.3.4 |
| 3.3.8 | Manual testing with various PDF types | 45 min | All above |

**Total Estimated Time:** ~5 hours

---

## Detailed Implementation Specifications

### 1. PDF Error Types and Constants (Task 3.3.1)

**File:** `src/components/ItemCapture/utils/pdfConstants.ts`

```typescript
// PDF Error Codes
export type PDFErrorCode =
  | 'PDF_PASSWORD_PROTECTED'
  | 'PDF_CORRUPT'
  | 'PDF_EMPTY'
  | 'PDF_TIMEOUT'
  | 'PDF_LOAD_FAILED'
  | 'CANVAS_RENDER_FAILED'
  | 'UNKNOWN_ERROR';

// PDF Processing Constraints
export const PDF_CONSTRAINTS = {
  /** Maximum time to wait for thumbnail generation (ms) */
  THUMBNAIL_TIMEOUT: 2000,

  /** Maximum PDF file size for thumbnail generation (50MB) */
  MAX_PDF_SIZE_FOR_THUMBNAIL: 50 * 1024 * 1024,

  /** Scale factor for thumbnail rendering (0.5 = 50% of original) */
  THUMBNAIL_SCALE: 0.5,

  /** JPEG quality for thumbnail output (0-1) */
  THUMBNAIL_QUALITY: 0.8,
};

// User-friendly error messages
export const PDF_ERROR_MESSAGES: Record<PDFErrorCode, { title: string; description: string }> = {
  PDF_PASSWORD_PROTECTED: {
    title: 'Protected PDF',
    description: 'This PDF is password-protected. You can still upload it, but no preview is available.',
  },
  PDF_CORRUPT: {
    title: 'Damaged PDF',
    description: 'This PDF file appears to be damaged and cannot be previewed.',
  },
  PDF_EMPTY: {
    title: 'Empty PDF',
    description: 'This PDF has no pages to preview.',
  },
  PDF_TIMEOUT: {
    title: 'Preview Timeout',
    description: 'Preview generation took too long. The file can still be uploaded.',
  },
  PDF_LOAD_FAILED: {
    title: 'Load Failed',
    description: 'Unable to load this PDF for preview.',
  },
  CANVAS_RENDER_FAILED: {
    title: 'Render Failed',
    description: 'Unable to generate preview image.',
  },
  UNKNOWN_ERROR: {
    title: 'Preview Unavailable',
    description: 'An unexpected error occurred while generating the preview.',
  },
};
```

### 2. Enhanced pdfThumbnailGenerator (Task 3.3.2, 3.3.3)

**File:** `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts`

```typescript
// This module is lazy-loaded only when a user uploads a PDF
// It should NOT be imported directly - use dynamic import

import { PDF_CONSTRAINTS, PDFErrorCode, PDF_ERROR_MESSAGES } from './pdfConstants';

export interface PDFThumbnailResult {
  thumbnail: Blob | null;
  pageCount: number;
  error?: PDFThumbnailError;
  isPasswordProtected: boolean;
  isCorrupt: boolean;
}

export interface PDFThumbnailError {
  code: PDFErrorCode;
  message: string;
  userMessage: string;
}

/**
 * Generate a thumbnail from a PDF file with comprehensive error handling
 * @param file - The PDF file to process
 * @param signal - Optional AbortSignal for cancellation
 * @returns PDFThumbnailResult with thumbnail, metadata, and error state
 */
export async function generatePDFThumbnailWithMetadata(
  file: File,
  signal?: AbortSignal
): Promise<PDFThumbnailResult> {
  // Check file size before processing
  if (file.size > PDF_CONSTRAINTS.MAX_PDF_SIZE_FOR_THUMBNAIL) {
    return createResult({
      pageCount: 0,
      error: createError('PDF_LOAD_FAILED', 'File too large for preview'),
    });
  }

  try {
    // Dynamic import of pdfjs-dist
    const pdfjs = await import('pdfjs-dist');

    // Configure worker from CDN to avoid bundling
    pdfjs.GlobalWorkerOptions.workerSrc =
      `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

    // Check for abort before loading
    if (signal?.aborted) {
      return createResult({
        pageCount: 0,
        error: createError('PDF_TIMEOUT', 'Operation cancelled'),
      });
    }

    const arrayBuffer = await file.arrayBuffer();

    // Load PDF with timeout
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });

    // Create a promise that rejects on abort
    const abortPromise = signal
      ? new Promise<never>((_, reject) => {
          signal.addEventListener('abort', () => {
            loadingTask.destroy();
            reject(new DOMException('Aborted', 'AbortError'));
          });
        })
      : null;

    const pdf = await (abortPromise
      ? Promise.race([loadingTask.promise, abortPromise])
      : loadingTask.promise);

    // Check for empty PDF
    if (pdf.numPages === 0) {
      return createResult({
        pageCount: 0,
        error: createError('PDF_EMPTY'),
      });
    }

    // Get first page
    const page = await pdf.getPage(1);

    // Check for abort before rendering
    if (signal?.aborted) {
      return createResult({
        pageCount: pdf.numPages,
        error: createError('PDF_TIMEOUT', 'Operation cancelled'),
      });
    }

    // Create canvas and render
    const viewport = page.getViewport({ scale: PDF_CONSTRAINTS.THUMBNAIL_SCALE });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext('2d');
    if (!context) {
      return createResult({
        pageCount: pdf.numPages,
        error: createError('CANVAS_RENDER_FAILED'),
      });
    }

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Convert to blob
    const thumbnail = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', PDF_CONSTRAINTS.THUMBNAIL_QUALITY);
    });

    // Cleanup
    page.cleanup();
    pdf.destroy();

    return {
      thumbnail,
      pageCount: pdf.numPages,
      isPasswordProtected: false,
      isCorrupt: false,
    };

  } catch (error) {
    return handlePDFError(error);
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generatePDFThumbnailWithMetadata instead
 */
export async function generatePDFThumbnail(file: File): Promise<Blob | null> {
  const result = await generatePDFThumbnailWithMetadata(file);
  return result.thumbnail;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generatePDFThumbnailWithMetadata instead
 */
export async function getPDFPageCount(file: File): Promise<number> {
  const result = await generatePDFThumbnailWithMetadata(file);
  return result.pageCount;
}

// Helper functions
function createResult(partial: Partial<PDFThumbnailResult>): PDFThumbnailResult {
  return {
    thumbnail: partial.thumbnail ?? null,
    pageCount: partial.pageCount ?? 0,
    isPasswordProtected: partial.isPasswordProtected ?? false,
    isCorrupt: partial.isCorrupt ?? false,
    error: partial.error,
  };
}

function createError(code: PDFErrorCode, customMessage?: string): PDFThumbnailError {
  const messages = PDF_ERROR_MESSAGES[code];
  return {
    code,
    message: customMessage || messages.description,
    userMessage: messages.title,
  };
}

function handlePDFError(error: unknown): PDFThumbnailResult {
  // pdfjs-dist specific error handling
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.name : '';

  // Password protected PDF
  if (
    errorMessage.includes('password') ||
    errorName === 'PasswordException' ||
    (error as { name?: string })?.name === 'PasswordException'
  ) {
    return createResult({
      pageCount: 0,
      isPasswordProtected: true,
      error: createError('PDF_PASSWORD_PROTECTED'),
    });
  }

  // Corrupt PDF
  if (
    errorMessage.includes('Invalid PDF') ||
    errorMessage.includes('corrupted') ||
    errorName === 'InvalidPDFException'
  ) {
    return createResult({
      pageCount: 0,
      isCorrupt: true,
      error: createError('PDF_CORRUPT'),
    });
  }

  // Abort/timeout
  if (errorName === 'AbortError' || errorMessage.includes('Aborted')) {
    return createResult({
      pageCount: 0,
      error: createError('PDF_TIMEOUT'),
    });
  }

  // Generic error
  console.error('PDF thumbnail generation failed:', error);
  return createResult({
    pageCount: 0,
    error: createError('UNKNOWN_ERROR', errorMessage),
  });
}
```

### 3. usePDFThumbnail Hook (Task 3.3.4)

**File:** `src/components/ItemCapture/hooks/usePDFThumbnail.ts`

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { PDFThumbnailResult } from '../utils/pdfThumbnailGenerator';
import { PDF_CONSTRAINTS } from '../utils/pdfConstants';

interface PDFThumbnailState {
  /** Generated thumbnail blob URL (null if not generated or failed) */
  thumbnailUrl: string | null;

  /** Page count of the PDF */
  pageCount: number;

  /** Whether thumbnail generation is in progress */
  isLoading: boolean;

  /** Error from thumbnail generation */
  error: PDFThumbnailResult['error'] | null;

  /** Whether PDF is password-protected */
  isPasswordProtected: boolean;

  /** Whether PDF is corrupt */
  isCorrupt: boolean;
}

const initialState: PDFThumbnailState = {
  thumbnailUrl: null,
  pageCount: 0,
  isLoading: false,
  error: null,
  isPasswordProtected: false,
  isCorrupt: false,
};

/**
 * Hook to manage PDF thumbnail generation with loading/error states
 * Automatically processes PDF files and returns thumbnail URL + metadata
 */
export function usePDFThumbnail(file: File | null): PDFThumbnailState {
  const [state, setState] = useState<PDFThumbnailState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const thumbnailUrlRef = useRef<string | null>(null);
  const isUnmountedRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Abort any pending operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Revoke object URL
    if (thumbnailUrlRef.current) {
      URL.revokeObjectURL(thumbnailUrlRef.current);
      thumbnailUrlRef.current = null;
    }
  }, []);

  // Process PDF when file changes
  useEffect(() => {
    // Reset state and cleanup previous
    cleanup();

    // No file - return to initial state
    if (!file) {
      if (!isUnmountedRef.current) {
        setState(initialState);
      }
      return;
    }

    // Not a PDF - skip
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      if (!isUnmountedRef.current) {
        setState(initialState);
      }
      return;
    }

    // Set loading state
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Create abort controller with timeout
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Set timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, PDF_CONSTRAINTS.THUMBNAIL_TIMEOUT);

    // Dynamic import and process
    (async () => {
      try {
        const { generatePDFThumbnailWithMetadata } = await import('../utils/pdfThumbnailGenerator');

        if (isUnmountedRef.current || abortController.signal.aborted) {
          return;
        }

        const result = await generatePDFThumbnailWithMetadata(file, abortController.signal);

        if (isUnmountedRef.current) {
          return;
        }

        // Create object URL for thumbnail
        let thumbnailUrl: string | null = null;
        if (result.thumbnail) {
          thumbnailUrl = URL.createObjectURL(result.thumbnail);
          thumbnailUrlRef.current = thumbnailUrl;
        }

        setState({
          thumbnailUrl,
          pageCount: result.pageCount,
          isLoading: false,
          error: result.error || null,
          isPasswordProtected: result.isPasswordProtected,
          isCorrupt: result.isCorrupt,
        });

      } catch (error) {
        if (!isUnmountedRef.current) {
          setState({
            ...initialState,
            isLoading: false,
            error: {
              code: 'UNKNOWN_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error',
              userMessage: 'Preview Unavailable',
            },
          });
        }
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    // Cleanup on unmount or file change
    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [file, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      cleanup();
    };
  }, [cleanup]);

  return state;
}
```

### 4. PDFPlaceholder Component (Task 3.3.5)

**File:** `src/components/ItemCapture/components/shared/PDFPlaceholder.tsx`

```typescript
'use client';

import { FileText, Lock, AlertTriangle, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PDFErrorCode } from '../../utils/pdfConstants';

interface PDFPlaceholderProps {
  /** Error code if thumbnail generation failed */
  errorCode?: PDFErrorCode;

  /** Whether PDF is password-protected */
  isPasswordProtected?: boolean;

  /** Whether PDF is corrupt */
  isCorrupt?: boolean;

  /** Whether thumbnail is currently loading */
  isLoading?: boolean;

  /** Optional CSS class name */
  className?: string;
}

export function PDFPlaceholder({
  errorCode,
  isPasswordProtected,
  isCorrupt,
  isLoading,
  className,
}: PDFPlaceholderProps) {
  // Determine which icon and color to show
  let Icon = FileText;
  let iconColor = 'text-red-500';
  let bgColor = 'bg-red-100';

  if (isLoading) {
    // Loading state - show pulsing PDF icon
    return (
      <div className={cn('flex items-center justify-center bg-gray-100', className)}>
        <div className="animate-pulse">
          <FileText className="h-12 w-12 text-gray-400" />
        </div>
      </div>
    );
  }

  if (isPasswordProtected) {
    Icon = Lock;
    iconColor = 'text-amber-600';
    bgColor = 'bg-amber-100';
  } else if (isCorrupt) {
    Icon = FileWarning;
    iconColor = 'text-red-600';
    bgColor = 'bg-red-100';
  } else if (errorCode) {
    Icon = AlertTriangle;
    iconColor = 'text-orange-500';
    bgColor = 'bg-orange-100';
  } else {
    // Default PDF icon (no error)
    Icon = FileText;
    iconColor = 'text-red-500';
    bgColor = 'bg-red-50';
  }

  return (
    <div className={cn('flex items-center justify-center', bgColor, className)}>
      <Icon className={cn('h-12 w-12', iconColor)} />
    </div>
  );
}
```

### 5. PageCountBadge Component

**File:** Add to `src/components/ItemCapture/components/shared/PageCountBadge.tsx`

```typescript
'use client';

import { cn } from '@/lib/utils';

interface PageCountBadgeProps {
  /** Number of pages in the PDF */
  pageCount: number;

  /** Optional CSS class name */
  className?: string;
}

export function PageCountBadge({ pageCount, className }: PageCountBadgeProps) {
  if (pageCount <= 0) return null;

  const label = pageCount === 1 ? '1 page' : `${pageCount} pages`;

  return (
    <div
      className={cn(
        'absolute bottom-2 right-2 px-2 py-0.5',
        'bg-black/70 text-white text-xs font-medium rounded',
        className
      )}
    >
      {label}
    </div>
  );
}
```

### 6. Enhanced FileCard with PDF Support (Task 3.3.6)

**Modifications to:** `src/components/ItemCapture/components/steps/FileUploadStep.tsx`

```typescript
// Add to FileCard component
import { usePDFThumbnail } from '../../hooks/usePDFThumbnail';
import { PDFPlaceholder } from '../shared/PDFPlaceholder';
import { PageCountBadge } from '../shared/PageCountBadge';

function FileCard({ file, onRemove }: FileCardProps) {
  // Use PDF thumbnail hook for PDF files
  const isPDF = file.category === 'pdf';
  const pdfState = usePDFThumbnail(isPDF ? file.file : null);

  const icon = getFileIcon(file.category);
  const sizeLabel = formatFileSize(file.size);

  // Determine thumbnail source
  const thumbnailUrl = isPDF ? pdfState.thumbnailUrl : file.previewUrl;
  const showPlaceholder = isPDF && !pdfState.thumbnailUrl && !pdfState.isLoading;

  return (
    <div className="relative group bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      {/* Thumbnail or Icon */}
      <div className="aspect-square rounded-md overflow-hidden bg-gray-100 mb-2 flex items-center justify-center relative">
        {/* Image preview */}
        {!isPDF && file.previewUrl && file.category === 'image' && (
          <img
            src={file.previewUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        )}

        {/* PDF thumbnail or placeholder */}
        {isPDF && (
          <>
            {pdfState.isLoading && (
              <PDFPlaceholder isLoading className="w-full h-full" />
            )}
            {pdfState.thumbnailUrl && (
              <img
                src={pdfState.thumbnailUrl}
                alt={`Preview of ${file.name}`}
                className="w-full h-full object-cover"
              />
            )}
            {showPlaceholder && (
              <PDFPlaceholder
                errorCode={pdfState.error?.code}
                isPasswordProtected={pdfState.isPasswordProtected}
                isCorrupt={pdfState.isCorrupt}
                className="w-full h-full"
              />
            )}
            {/* Page count badge */}
            {pdfState.pageCount > 0 && (
              <PageCountBadge pageCount={pdfState.pageCount} />
            )}
          </>
        )}

        {/* Generic file icon for non-image, non-PDF */}
        {!isPDF && (!file.previewUrl || file.category !== 'image') && (
          <div className="p-4">
            {icon}
          </div>
        )}

        {/* Video play indicator overlay */}
        {file.category === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Video className="h-8 w-8 text-white" />
          </div>
        )}
      </div>

      {/* File info */}
      <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
        {file.name}
      </p>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{sizeLabel}</span>
        {isPDF && pdfState.error && (
          <span className="text-amber-600" title={pdfState.error.message}>
            • {pdfState.error.userMessage}
          </span>
        )}
      </div>

      {/* Remove button - visible on hover */}
      <button
        onClick={() => onRemove(file.id)}
        className={cn(
          'absolute top-2 right-2 p-1.5 rounded-full',
          'bg-red-100 text-red-600 opacity-0 group-hover:opacity-100',
          'transition-opacity hover:bg-red-200',
          'focus:outline-none focus:ring-2 focus:ring-red-500 focus:opacity-100'
        )}
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/utils/pdfConstants.ts` | PDF error types and constants |
| `src/components/ItemCapture/hooks/usePDFThumbnail.ts` | PDF thumbnail hook with loading/error states |
| `src/components/ItemCapture/components/shared/PDFPlaceholder.tsx` | Placeholder component for PDF errors |
| `src/components/ItemCapture/components/shared/PageCountBadge.tsx` | Page count badge component |

### Files to Modify

| File Path | Modification | Reason |
|-----------|--------------|--------|
| `src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` | Enhance with error handling, timeout, structured result | Core enhancement |
| `src/components/ItemCapture/components/steps/FileUploadStep.tsx` | Integrate PDF thumbnail hook, add page count badge | UI integration |
| `src/components/ItemCapture/index.ts` | Export new components and hooks | Public API |
| `src/components/ItemCapture/ItemCapture.types.ts` | Add PDFThumbnailResult and related types | Type definitions |

### Functions to Implement

| Function/Component | File | Purpose |
|----------|------|---------|
| `generatePDFThumbnailWithMetadata()` | pdfThumbnailGenerator.ts | Enhanced PDF processing with error handling |
| `createError()` | pdfThumbnailGenerator.ts | PDF error factory function |
| `handlePDFError()` | pdfThumbnailGenerator.ts | Error classification helper |
| `usePDFThumbnail()` | usePDFThumbnail.ts | React hook for PDF thumbnail management |
| `PDFPlaceholder` | PDFPlaceholder.tsx | Placeholder UI component |
| `PageCountBadge` | PageCountBadge.tsx | Page count display component |

### Files NOT to Modify

- `src/lib/utils.ts` - General utilities, not component-specific
- `src/types/index.ts` - Global types, PDF types go in ItemCapture.types.ts
- Any files outside `src/components/ItemCapture/` directory
- `package.json` - pdfjs-dist already installed

---

## Error Handling Strategy

### Error Classification

| Error Type | Code | Recoverable | User Action |
|------------|------|-------------|-------------|
| Password Protected | `PDF_PASSWORD_PROTECTED` | Yes | Upload proceeds; no preview |
| Corrupt File | `PDF_CORRUPT` | Yes | Upload proceeds; no preview |
| Empty PDF | `PDF_EMPTY` | Yes | Upload proceeds; no preview |
| Timeout | `PDF_TIMEOUT` | Yes | Upload proceeds; no preview |
| Canvas Failure | `CANVAS_RENDER_FAILED` | Yes | Upload proceeds; no preview |
| Unknown | `UNKNOWN_ERROR` | Yes | Upload proceeds; no preview |

**Key Principle:** PDF thumbnail generation failures should NEVER block file upload. Users can still upload the PDF even if preview fails.

### User-Friendly Error Display

Errors are displayed inline on the FileCard with:
- Appropriate icon (lock for protected, warning for errors)
- Short error label (e.g., "Protected PDF")
- Full error message available on hover/tooltip

---

## Testing Strategy

### Unit Test Coverage

| Test Case | Description |
|-----------|-------------|
| Valid PDF | Generates thumbnail and returns correct page count |
| Password-protected PDF | Returns isPasswordProtected=true with correct error |
| Corrupt PDF | Returns isCorrupt=true with correct error |
| Empty PDF (0 pages) | Returns PDF_EMPTY error |
| Timeout (2+ seconds) | AbortController cancels operation |
| Large PDF (>50MB) | Skips processing with appropriate message |
| Hook lifecycle | Cleans up object URLs on unmount |
| Hook file change | Cancels previous operation, processes new file |

### Manual Testing Matrix

| Test Scenario | File Type | Expected Result |
|---------------|-----------|-----------------|
| Normal PDF (1-10 pages) | Valid PDF | Thumbnail + page count badge |
| Large PDF (100+ pages) | Valid PDF | Thumbnail + page count badge (within 2s) |
| Password-protected | Protected PDF | Lock icon placeholder |
| Corrupted file | Damaged PDF | Warning icon placeholder |
| Empty PDF | 0-page PDF | Warning icon + "Empty PDF" |
| Very large PDF (>50MB) | Large PDF | No processing, generic PDF icon |
| Rapid file switching | Multiple PDFs | Previous operation cancelled |

### Performance Validation

| Metric | Target | Measurement |
|--------|--------|-------------|
| Thumbnail generation time | < 2s for PDFs under 10MB | Console timing |
| Memory cleanup | No object URL leaks | DevTools memory |
| Main thread blocking | < 100ms per operation | Performance panel |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| pdfjs-dist version mismatch | Low | Medium | Pin version; test upgrade path |
| CDN worker unavailable | Low | High | Consider bundling worker as fallback |
| Memory pressure with many PDFs | Medium | Medium | Process one at a time; cleanup aggressively |
| Timeout too short for slow devices | Medium | Low | Make configurable; 2s is generous |
| iOS Safari PDF rendering quirks | Low | Medium | Test on iOS devices |

---

## Success Criteria

Based on REQ-043 Acceptance Criteria:

- [ ] Uploaded PDF files display a thumbnail preview showing the first page of the document
- [ ] Page count metadata appears next to each PDF thumbnail (e.g., "3 pages")
- [ ] Corrupt PDF files display a placeholder image with a message indicating the file cannot be previewed
- [ ] Password-protected PDFs display a placeholder image with a message indicating the file is protected
- [ ] Thumbnail generation completes within 2 seconds for PDFs under 10MB
- [ ] System handles PDFs with zero pages or malformed structure without crashing
- [ ] Generated thumbnails maintain readable aspect ratio and quality
- [ ] Users can still proceed with upload even when thumbnail generation fails

Additional Technical Criteria:

- [ ] Enhanced pdfThumbnailGenerator maintains backward compatibility
- [ ] usePDFThumbnail hook properly manages object URL lifecycle
- [ ] Abort controller correctly cancels pending operations
- [ ] Error states correctly map to user-friendly messages
- [ ] PDFPlaceholder displays appropriate icons for each error type

---

## Implementation Order Recommendation

1. **Task 3.3.1** - PDF error types and constants (foundation)
2. **Task 3.3.2** - Enhanced pdfThumbnailGenerator (core logic)
3. **Task 3.3.3** - Timeout mechanism (reliability)
4. **Task 3.3.5** - PDFPlaceholder component (can parallel with 3.3.4)
5. **Task 3.3.4** - usePDFThumbnail hook (depends on 3.3.2, 3.3.3)
6. **Task 3.3.6** - FileCard integration (depends on 3.3.4, 3.3.5)
7. **Task 3.3.7** - Loading state polish
8. **Task 3.3.8** - Manual testing

**Estimated Total Effort:** 5 hours (can be completed in 1 day)

---

## References

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [pdfjs-dist npm](https://www.npmjs.com/package/pdfjs-dist)
- [AbortController - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [REQ-041 useFileUpload Overview](/docs/REQ-041-create-usefileupload-hook-overview.md)
- [REQ-042 FileUploadStep Overview](/docs/REQ-042-implement-fileuploadstep-overview.md)
- [Existing pdfThumbnailGenerator.ts](/src/components/ItemCapture/utils/pdfThumbnailGenerator.ts)
