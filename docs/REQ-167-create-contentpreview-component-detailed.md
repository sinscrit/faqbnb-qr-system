# REQ-167: Create ContentPreview Component - Detailed Task Breakdown

**Generated:** 2026-01-09 23:15:00 UTC
**Last Modified:** 2026-01-09 23:15:00 UTC
**Request Number:** 167
**Plan Reference:** Plan-094-UI-UX-Workflow-Improvements.md (Phase 5, Task 5.1)
**Overview Document:** REQ-167-create-contentpreview-component-overview.md
**Type:** NEW FEATURE
**Size:** M (Medium - 12 tasks, ~3.25 days)

---

## Executive Summary

This document provides the detailed, actionable task breakdown for creating the `ContentPreview` shared component. Each task is scoped to approximately 1 story point (a few hours of focused work) with clear verification steps.

### Goal
Create a reusable `ContentPreview` component that displays standardized, visually informative previews of various content types (video, photo, PDF, text, URL) throughout the application. This component will support three size variants and include loading states for each content type.

### Component Purpose

| Feature | Description |
|---------|-------------|
| Multi-format support | Video, Photo, PDF, Text, URL content types |
| Size variants | Small (80x80px), Medium (120x120px), Large (200x200px) |
| Loading states | Type-specific loading skeletons |
| Reusability | Standalone component for PreviewSaveStep, SessionSummaryStep, and future displays |

---

## Authorized Files for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | Main ContentPreview component |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPreview.test.tsx` | Unit tests for ContentPreview |

### Files to MODIFY

| File Path | Function/Section | Change |
|-----------|------------------|--------|
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Barrel exports | Add ContentPreview export |

### Files to REFERENCE (Read-Only)

| File Path | Reason |
|-----------|--------|
| `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Existing preview patterns to extract |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | ContentPiece and ContentData types |
| `src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx` | Text truncation patterns |
| `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts` | URL metadata handling patterns |

---

## Detailed Task Breakdown

### Task 1: Create Base Component Structure with Types and Constants

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** None

#### Description
Create the base ContentPreview component file with TypeScript interfaces, size configuration constants, and component skeleton.

#### Implementation Steps

1. Create new file `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
2. Add file header comment with JSDoc documentation
3. Import dependencies (React, lucide-react icons, cn utility, types)
4. Define `ContentPreviewProps` interface
5. Define `ContentPreviewSize` type
6. Define `SIZE_CONFIG` constant with dimensions for each size
7. Define `TYPE_CONFIG` constant with icon, color, and label for each content type
8. Create main component skeleton with size-based container rendering

#### Code Structure

```typescript
'use client';

/**
 * ContentPreview Component
 *
 * Displays standardized, visually informative previews of various content types.
 * Supports video, photo, PDF, text, and URL content with size variants and loading states.
 *
 * @example
 * ```tsx
 * <ContentPreview
 *   content={contentPiece}
 *   size="medium"
 *   showTypeBadge={true}
 * />
 * ```
 *
 * @module ItemCreationWorkflow/components/shared/ContentPreview
 * @see PreviewSaveStep for primary usage context
 * @lastModified 2026-01-09
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Video, Image, FileText, Type, Link, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentPiece, ContentData, ContentType } from '../../ItemCreationWorkflow.types';

// =============================================================================
// Types
// =============================================================================

export type ContentPreviewSize = 'small' | 'medium' | 'large';

export interface ContentPreviewProps {
  /** Content piece to preview */
  content: ContentPiece;
  /** Size variant for different contexts */
  size?: ContentPreviewSize;
  /** Whether to show the type badge (Video/Photo/PDF/etc.) */
  showTypeBadge?: boolean;
  /** Whether to show remove button */
  showRemove?: boolean;
  /** Callback when remove is clicked */
  onRemove?: () => void;
  /** Whether the preview is in a loading state */
  isLoading?: boolean;
  /** Optional CSS class for container */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

/** Size configuration with pixel dimensions and text sizing */
export const SIZE_CONFIG: Record<ContentPreviewSize, { width: number; height: number; iconSize: string; textSize: string }> = {
  small: { width: 80, height: 80, iconSize: 'w-5 h-5', textSize: 'text-[10px]' },
  medium: { width: 120, height: 120, iconSize: 'w-8 h-8', textSize: 'text-xs' },
  large: { width: 200, height: 200, iconSize: 'w-10 h-10', textSize: 'text-sm' },
};

/** Content type configuration with icon, color theme, and display label */
export const TYPE_CONFIG: Record<ContentType, { icon: typeof Video; color: string; label: string }> = {
  video: { icon: Video, color: 'bg-purple-100 text-purple-700', label: 'Video' },
  photo: { icon: Image, color: 'bg-blue-100 text-blue-700', label: 'Photo' },
  pdf: { icon: FileText, color: 'bg-amber-100 text-amber-700', label: 'PDF' },
  text: { icon: Type, color: 'bg-green-100 text-green-700', label: 'Text' },
  url: { icon: Link, color: 'bg-indigo-100 text-indigo-700', label: 'Link' },
};
```

#### Verification Steps

- [ ] File created at correct path
- [ ] All imports resolve without errors
- [ ] `ContentPreviewProps` interface includes all required properties
- [ ] `SIZE_CONFIG` has entries for 'small', 'medium', 'large'
- [ ] `TYPE_CONFIG` has entries for all 5 content types
- [ ] Run `npm run type-check` - should pass (component not yet complete but types valid)

#### Acceptance Criteria
- [ ] File created with proper JSDoc header
- [ ] ContentPreviewProps interface defined with all documented properties
- [ ] SIZE_CONFIG constant defined with three size variants
- [ ] TYPE_CONFIG constant defined with all five content types
- [ ] Imports from correct paths relative to component location

---

### Task 2: Implement Video Preview Sub-Component

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 1

#### Description
Extract and adapt the video preview rendering logic from ContentPieceCard into a standalone VideoPreview sub-component with size-aware rendering.

#### Implementation Steps

1. Add VideoPreview interface for props
2. Create VideoPreview function component
3. Implement blob URL creation from video file
4. Add video element with object-fit cover styling
5. Add play button overlay (centered)
6. Add duration badge (bottom-right corner)
7. Implement size-aware icon and text scaling
8. Register blob URL for cleanup via urlsRef

#### Code Implementation

```typescript
// =============================================================================
// Sub-Components
// =============================================================================

interface VideoPreviewProps {
  data: Extract<ContentData, { type: 'video' }>;
  size: ContentPreviewSize;
  urlsRef: React.MutableRefObject<string[]>;
}

function VideoPreview({ data, size, urlsRef }: VideoPreviewProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const sizeConfig = SIZE_CONFIG[size];

  useEffect(() => {
    if (data.file) {
      const url = URL.createObjectURL(data.file);
      urlsRef.current.push(url);
      setThumbnailUrl(url);
    }
    return () => {
      // URL cleanup handled by parent component
    };
  }, [data.file, urlsRef]);

  return (
    <div className="relative w-full h-full">
      {thumbnailUrl ? (
        <video
          src={thumbnailUrl}
          className="w-full h-full object-cover"
          preload="metadata"
          aria-hidden="true"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <Video className={cn(sizeConfig.iconSize, 'text-gray-400')} aria-hidden="true" />
        </div>
      )}
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
        <Play className={cn(sizeConfig.iconSize, 'text-white')} aria-hidden="true" />
      </div>
      {/* Duration badge */}
      {data.duration != null && (
        <div className={cn(
          'absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white rounded',
          sizeConfig.textSize
        )}>
          {formatDuration(data.duration)}
        </div>
      )}
    </div>
  );
}

/** Format duration in seconds to MM:SS format */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

#### Verification Steps

- [ ] VideoPreview renders video thumbnail from blob URL
- [ ] Play button overlay centered and visible
- [ ] Duration badge displays formatted time (e.g., "1:30")
- [ ] Icon and text sizes scale with size prop
- [ ] Blob URL registered in urlsRef for cleanup
- [ ] Fallback icon shown when no file provided
- [ ] Run `npm run type-check` - no type errors in VideoPreview

#### Acceptance Criteria
- [ ] Video preview displays thumbnail from blob URL
- [ ] Duration badge visible with formatted time
- [ ] Play button overlay centered
- [ ] Size-aware scaling for icons and text
- [ ] Graceful fallback when no file provided

---

### Task 3: Implement Photo Preview Sub-Component

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 1

#### Description
Extract and adapt the photo preview rendering logic from ContentPieceCard into a standalone PhotoPreview sub-component.

#### Implementation Steps

1. Add PhotoPreview interface for props
2. Create PhotoPreview function component
3. Implement blob URL creation from photo file
4. Add img element with object-fit cover styling
5. Implement size-aware fallback icon
6. Handle image loading errors gracefully

#### Code Implementation

```typescript
interface PhotoPreviewProps {
  data: Extract<ContentData, { type: 'photo' }>;
  size: ContentPreviewSize;
  urlsRef: React.MutableRefObject<string[]>;
}

function PhotoPreview({ data, size, urlsRef }: PhotoPreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_CONFIG[size];

  useEffect(() => {
    if (data.file) {
      const url = URL.createObjectURL(data.file);
      urlsRef.current.push(url);
      setImageUrl(url);
      setHasError(false);
    }
    return () => {
      // URL cleanup handled by parent component
    };
  }, [data.file, urlsRef]);

  if (hasError || !imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Image className={cn(sizeConfig.iconSize, 'text-gray-400')} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Photo content preview"
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}
```

#### Verification Steps

- [ ] PhotoPreview renders image from blob URL
- [ ] Image fills container with object-fit cover
- [ ] Error state shows fallback icon
- [ ] Icon size scales with size prop
- [ ] Run `npm run type-check` - no type errors

#### Acceptance Criteria
- [ ] Photo preview displays image thumbnail
- [ ] Graceful error handling with fallback
- [ ] Size-aware fallback icon

---

### Task 4: Implement PDF Preview Sub-Component

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 1

#### Description
Extract and adapt the PDF preview rendering logic from ContentPieceCard into a standalone PdfPreview sub-component with page count badge.

#### Implementation Steps

1. Add PdfPreview interface for props
2. Create PdfPreview function component
3. Display FileText icon with amber theme
4. Add page count badge when available
5. Handle singular vs plural "page/pages" text

#### Code Implementation

```typescript
interface PdfPreviewProps {
  data: Extract<ContentData, { type: 'pdf' }>;
  size: ContentPreviewSize;
}

function PdfPreview({ data, size }: PdfPreviewProps) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50">
      <FileText className={cn(sizeConfig.iconSize, 'text-amber-600')} aria-hidden="true" />
      {data.pageCount != null && (
        <span className={cn('mt-1 text-amber-700', sizeConfig.textSize)}>
          {data.pageCount} {data.pageCount === 1 ? 'page' : 'pages'}
        </span>
      )}
    </div>
  );
}
```

#### Verification Steps

- [ ] PdfPreview displays FileText icon with amber theme
- [ ] Page count displayed when available
- [ ] "page" vs "pages" pluralization correct
- [ ] Icon and text sizes scale with size prop
- [ ] Run `npm run type-check` - no type errors

#### Acceptance Criteria
- [ ] PDF preview displays document icon
- [ ] Page count badge visible when pageCount provided
- [ ] Correct singular/plural handling
- [ ] Amber color theme applied

---

### Task 5: Implement Text Preview Sub-Component

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 1

#### Description
Extract and adapt the text preview rendering logic from ContentPieceCard into a standalone TextPreview sub-component with truncated text display.

#### Implementation Steps

1. Add TextPreview interface for props
2. Create TextPreview function component
3. Truncate text based on size (different limits per size)
4. Display truncated text with line-clamp
5. Apply green theme background
6. Size-aware line clamp settings

#### Code Implementation

```typescript
interface TextPreviewProps {
  data: Extract<ContentData, { type: 'text' }>;
  size: ContentPreviewSize;
}

/** Maximum characters to display per size */
const TEXT_TRUNCATE_LIMITS: Record<ContentPreviewSize, number> = {
  small: 40,
  medium: 80,
  large: 150,
};

/** Line clamp classes per size */
const LINE_CLAMP_CLASSES: Record<ContentPreviewSize, string> = {
  small: 'line-clamp-2',
  medium: 'line-clamp-3',
  large: 'line-clamp-5',
};

function TextPreview({ data, size }: TextPreviewProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const limit = TEXT_TRUNCATE_LIMITS[size];
  const lineClamp = LINE_CLAMP_CLASSES[size];

  const truncatedText = useMemo(() => {
    if (data.text.length > limit) {
      return data.text.substring(0, limit) + '...';
    }
    return data.text;
  }, [data.text, limit]);

  return (
    <div className="w-full h-full flex items-center justify-center p-2 bg-green-50">
      <p className={cn(
        'text-green-800 text-center',
        sizeConfig.textSize,
        lineClamp
      )}>
        {truncatedText}
      </p>
    </div>
  );
}
```

#### Verification Steps

- [ ] TextPreview displays truncated text
- [ ] Text truncation limits vary by size
- [ ] Line clamp applied appropriately
- [ ] Green theme background applied
- [ ] Text centered within container
- [ ] Run `npm run type-check` - no type errors

#### Acceptance Criteria
- [ ] Text preview displays truncated content
- [ ] Size-aware truncation limits
- [ ] Line clamp prevents overflow
- [ ] Green color theme applied

---

### Task 6: Implement URL Preview Sub-Component

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Task 1

#### Description
Extract and adapt the URL preview rendering logic from ContentPieceCard into a standalone UrlPreview sub-component with favicon, title, and domain display.

#### Implementation Steps

1. Add UrlPreview interface for props
2. Create UrlPreview function component
3. Display thumbnail if available (full preview)
4. Display favicon + title + domain if no thumbnail
5. Handle missing metadata gracefully (fallback to hostname)
6. Apply indigo theme background

#### Code Implementation

```typescript
interface UrlPreviewProps {
  data: Extract<ContentData, { type: 'url' }>;
  size: ContentPreviewSize;
}

function UrlPreview({ data, size }: UrlPreviewProps) {
  const sizeConfig = SIZE_CONFIG[size];

  // Extract domain from URL for fallback display
  const domain = useMemo(() => {
    try {
      return new URL(data.url).hostname;
    } catch {
      return data.url;
    }
  }, [data.url]);

  // If thumbnail available, show full image preview
  if (data.thumbnailUrl) {
    return (
      <img
        src={data.thumbnailUrl}
        alt={data.title || 'URL preview'}
        className="w-full h-full object-cover"
      />
    );
  }

  // Otherwise show favicon + title + domain
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-indigo-50">
      {data.faviconUrl ? (
        <img
          src={data.faviconUrl}
          alt=""
          className={cn(
            size === 'small' ? 'w-4 h-4' : 'w-6 h-6',
            'mb-1'
          )}
        />
      ) : (
        <Link
          className={cn(
            size === 'small' ? 'w-4 h-4' : 'w-6 h-6',
            'text-indigo-600 mb-1'
          )}
          aria-hidden="true"
        />
      )}
      <p className={cn(
        'text-indigo-800 text-center',
        sizeConfig.textSize,
        size === 'small' ? 'line-clamp-1' : 'line-clamp-2'
      )}>
        {data.title || domain}
      </p>
      {size !== 'small' && data.title && (
        <p className={cn('text-indigo-600 text-center line-clamp-1', SIZE_CONFIG.small.textSize)}>
          {domain}
        </p>
      )}
    </div>
  );
}
```

#### Verification Steps

- [ ] UrlPreview displays thumbnail when available
- [ ] Favicon displayed when no thumbnail but favicon available
- [ ] Fallback Link icon when no favicon
- [ ] Title displayed (or hostname as fallback)
- [ ] Domain displayed separately for medium/large sizes
- [ ] Indigo theme applied
- [ ] Run `npm run type-check` - no type errors

#### Acceptance Criteria
- [ ] URL preview handles all metadata combinations
- [ ] Thumbnail takes priority when available
- [ ] Graceful fallback to hostname
- [ ] Indigo color theme applied

---

### Task 7: Implement Loading Skeleton Component

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
**Estimated Effort:** 0.75 story points
**Dependencies:** Tasks 1-6

#### Description
Create a unified loading skeleton component with shimmer animation that adapts to different sizes and announces loading state to screen readers.

#### Implementation Steps

1. Create PreviewSkeleton function component
2. Implement shimmer animation using Tailwind animate-pulse
3. Apply size-aware dimensions from SIZE_CONFIG
4. Add aria-busy="true" and sr-only loading text
5. Match content type background colors for visual consistency

#### Code Implementation

```typescript
// =============================================================================
// Loading Skeleton
// =============================================================================

interface PreviewSkeletonProps {
  size: ContentPreviewSize;
  contentType?: ContentType;
}

function PreviewSkeleton({ size, contentType }: PreviewSkeletonProps) {
  const sizeConfig = SIZE_CONFIG[size];

  // Get background color based on content type (or default gray)
  const bgColor = contentType
    ? TYPE_CONFIG[contentType].color.split(' ')[0].replace('100', '50')
    : 'bg-gray-100';

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col items-center justify-center animate-pulse',
        bgColor
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading content preview"
    >
      {/* Icon placeholder */}
      <div className={cn(
        'rounded bg-gray-200',
        size === 'small' ? 'w-5 h-5' : size === 'medium' ? 'w-8 h-8' : 'w-10 h-10'
      )} />
      {/* Text placeholder */}
      {size !== 'small' && (
        <div className="mt-2 w-3/4 h-3 rounded bg-gray-200" />
      )}
      {/* Screen reader announcement */}
      <span className="sr-only">Loading preview...</span>
    </div>
  );
}
```

#### Verification Steps

- [ ] PreviewSkeleton displays with shimmer animation
- [ ] Size-aware dimensions applied
- [ ] Background color hints at content type when provided
- [ ] aria-busy="true" present
- [ ] Screen reader text included
- [ ] Run `npm run type-check` - no type errors

#### Acceptance Criteria
- [ ] Loading skeleton shows shimmer animation
- [ ] Size variants render correctly
- [ ] Accessible loading announcement included
- [ ] Optional content type hint via background color

---

### Task 8: Implement Main ContentPreview Component

**File:** `src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Tasks 1-7

#### Description
Implement the main ContentPreview component that orchestrates sub-components, handles object URL cleanup, and renders the type badge and remove button.

#### Implementation Steps

1. Create main ContentPreview function component
2. Set up urlsRef for blob URL tracking
3. Implement useEffect cleanup for object URLs
4. Add container with size-based dimensions
5. Render loading skeleton when isLoading is true
6. Switch on content type to render appropriate sub-component
7. Add optional type badge (top-left)
8. Add optional remove button (top-right, visible on hover)
9. Export component and type as default and named export

#### Code Implementation

```typescript
// =============================================================================
// Main Component
// =============================================================================

export function ContentPreview({
  content,
  size = 'medium',
  showTypeBadge = true,
  showRemove = false,
  onRemove,
  isLoading = false,
  className,
}: ContentPreviewProps) {
  // Track object URLs for cleanup
  const urlsRef = useRef<string[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      urlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const sizeConfig = SIZE_CONFIG[size];
  const typeConfig = TYPE_CONFIG[content.type];
  const TypeIcon = typeConfig.icon;

  // Render content based on type
  const renderContent = () => {
    if (isLoading) {
      return <PreviewSkeleton size={size} contentType={content.type} />;
    }

    switch (content.type) {
      case 'video':
        return <VideoPreview data={content.data as Extract<ContentData, { type: 'video' }>} size={size} urlsRef={urlsRef} />;
      case 'photo':
        return <PhotoPreview data={content.data as Extract<ContentData, { type: 'photo' }>} size={size} urlsRef={urlsRef} />;
      case 'pdf':
        return <PdfPreview data={content.data as Extract<ContentData, { type: 'pdf' }>} size={size} />;
      case 'text':
        return <TextPreview data={content.data as Extract<ContentData, { type: 'text' }>} size={size} />;
      case 'url':
        return <UrlPreview data={content.data as Extract<ContentData, { type: 'url' }>} size={size} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden border border-gray-200 bg-white',
        className
      )}
      style={{ width: sizeConfig.width, height: sizeConfig.height }}
      role="img"
      aria-label={`${typeConfig.label} content preview`}
    >
      {/* Content preview */}
      {renderContent()}

      {/* Type badge (top-left) */}
      {showTypeBadge && (
        <div
          className={cn(
            'absolute top-1 left-1 flex items-center gap-0.5 px-1 py-0.5 rounded font-medium',
            typeConfig.color,
            size === 'small' ? 'text-[8px]' : 'text-xs'
          )}
          aria-hidden="true"
        >
          <TypeIcon className={size === 'small' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
          {size !== 'small' && <span>{typeConfig.label}</span>}
        </div>
      )}

      {/* Remove button (top-right, visible on hover) */}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            'absolute top-1 right-1 p-1 bg-white/90 rounded-full',
            'opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity',
            'hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500',
            'min-w-[28px] min-h-[28px] flex items-center justify-center'
          )}
          aria-label="Remove content"
        >
          <X className="w-3.5 h-3.5 text-red-600" />
        </button>
      )}
    </div>
  );
}

export default ContentPreview;
```

#### Verification Steps

- [ ] ContentPreview renders correct sub-component for each content type
- [ ] Size prop controls container dimensions
- [ ] isLoading shows PreviewSkeleton
- [ ] Type badge visible when showTypeBadge is true
- [ ] Remove button appears on hover when showRemove is true
- [ ] onRemove callback fires when remove clicked
- [ ] Object URLs cleaned up on unmount
- [ ] aria-label includes content type
- [ ] Run `npm run type-check` - no type errors

#### Acceptance Criteria
- [ ] All 5 content types render correctly
- [ ] Size variants work (small, medium, large)
- [ ] Loading state shows skeleton
- [ ] Type badge conditionally shown
- [ ] Remove button works with callback
- [ ] Memory-safe object URL cleanup

---

### Task 9: Export ContentPreview from Shared Index

**File:** `src/components/ItemCreationWorkflow/components/shared/index.ts`
**Estimated Effort:** 0.25 story points
**Dependencies:** Task 8

#### Description
Add ContentPreview component and type exports to the shared components barrel file.

#### Implementation Steps

1. Open `src/components/ItemCreationWorkflow/components/shared/index.ts`
2. Add import/export for ContentPreview
3. Add export for ContentPreviewProps type
4. Add export for ContentPreviewSize type
5. Update JSDoc comment to list ContentPreview in Content Components section

#### Code Changes

**Add to Content Components section (after ContentPieceCard exports):**

```typescript
export { ContentPreview, SIZE_CONFIG as CONTENT_PREVIEW_SIZE_CONFIG, TYPE_CONFIG as CONTENT_PREVIEW_TYPE_CONFIG } from './ContentPreview';
export type { ContentPreviewProps, ContentPreviewSize } from './ContentPreview';
```

**Update JSDoc comment (add to listing):**

```typescript
/**
 * - **Content**: ContentPieceCard, SortableContentPieceCard, ContentPreview
 */
```

#### Verification Steps

- [ ] ContentPreview exported from shared/index.ts
- [ ] ContentPreviewProps type exported
- [ ] ContentPreviewSize type exported
- [ ] SIZE_CONFIG and TYPE_CONFIG exported (renamed to avoid conflicts)
- [ ] JSDoc updated to include ContentPreview
- [ ] Run `npm run type-check` - no type errors
- [ ] Import works: `import { ContentPreview } from './components/shared'`

#### Acceptance Criteria
- [ ] Component exportable from barrel file
- [ ] All associated types exported
- [ ] Documentation updated

---

### Task 10: Create Unit Tests - Basic Rendering

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPreview.test.tsx`
**Estimated Effort:** 1 story point
**Dependencies:** Tasks 1-9

#### Description
Create unit tests for basic ContentPreview rendering, covering all content types and size variants.

#### Implementation Steps

1. Create test file with proper imports
2. Set up URL.createObjectURL and revokeObjectURL mocks
3. Create test fixtures for each content type
4. Write tests for:
   - Video preview with thumbnail and duration
   - Photo preview with image
   - PDF preview with page count
   - Text preview with truncation
   - URL preview with favicon and domain
   - Size variant rendering (small, medium, large)

#### Code Implementation

```typescript
/**
 * ContentPreview Component Tests
 *
 * @module ItemCreationWorkflow/components/shared/__tests__/ContentPreview.test
 * @lastModified 2026-01-09
 */

import { render, screen, waitFor } from '@testing-library/react';
import { ContentPreview } from '../ContentPreview';
import type { ContentPiece } from '../../../ItemCreationWorkflow.types';

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
const mockRevokeObjectURL = jest.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// Test Fixtures
// =============================================================================

const mockVideoContent: ContentPiece = {
  id: 'video-1',
  type: 'video',
  data: { type: 'video', file: new Blob(['video'], { type: 'video/mp4' }), duration: 90 },
  order: 0,
};

const mockPhotoContent: ContentPiece = {
  id: 'photo-1',
  type: 'photo',
  data: { type: 'photo', file: new Blob(['image'], { type: 'image/jpeg' }) },
  order: 0,
};

const mockPdfContent: ContentPiece = {
  id: 'pdf-1',
  type: 'pdf',
  data: { type: 'pdf', file: new Blob(['pdf'], { type: 'application/pdf' }), pageCount: 12 },
  order: 0,
};

const mockTextContent: ContentPiece = {
  id: 'text-1',
  type: 'text',
  data: { type: 'text', text: 'Sample text content for testing the preview component.' },
  order: 0,
};

const mockUrlContent: ContentPiece = {
  id: 'url-1',
  type: 'url',
  data: {
    type: 'url',
    url: 'https://example.com',
    title: 'Example Website',
    faviconUrl: 'https://example.com/favicon.ico',
  },
  order: 0,
};

describe('ContentPreview', () => {
  // ===========================================================================
  // Content Type Rendering Tests
  // ===========================================================================

  describe('content type rendering', () => {
    it('renders video preview with duration badge', async () => {
      render(<ContentPreview content={mockVideoContent} />);

      expect(screen.getByText('Video')).toBeInTheDocument();
      expect(screen.getByText('1:30')).toBeInTheDocument(); // 90 seconds = 1:30

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });
    });

    it('renders photo preview', async () => {
      render(<ContentPreview content={mockPhotoContent} />);

      expect(screen.getByText('Photo')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });
    });

    it('renders PDF preview with page count', () => {
      render(<ContentPreview content={mockPdfContent} />);

      expect(screen.getByText('PDF')).toBeInTheDocument();
      expect(screen.getByText('12 pages')).toBeInTheDocument();
    });

    it('renders text preview with truncated content', () => {
      render(<ContentPreview content={mockTextContent} />);

      expect(screen.getByText('Text')).toBeInTheDocument();
      // Text should be visible (under truncation limit for medium size)
      expect(screen.getByText(/Sample text content/)).toBeInTheDocument();
    });

    it('renders URL preview with title', () => {
      render(<ContentPreview content={mockUrlContent} />);

      expect(screen.getByText('Link')).toBeInTheDocument();
      expect(screen.getByText('Example Website')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Size Variant Tests
  // ===========================================================================

  describe('size variants', () => {
    it('renders small size with correct dimensions', () => {
      const { container } = render(<ContentPreview content={mockPhotoContent} size="small" />);

      const preview = container.firstChild as HTMLElement;
      expect(preview).toHaveStyle({ width: '80px', height: '80px' });
    });

    it('renders medium size with correct dimensions', () => {
      const { container } = render(<ContentPreview content={mockPhotoContent} size="medium" />);

      const preview = container.firstChild as HTMLElement;
      expect(preview).toHaveStyle({ width: '120px', height: '120px' });
    });

    it('renders large size with correct dimensions', () => {
      const { container } = render(<ContentPreview content={mockPhotoContent} size="large" />);

      const preview = container.firstChild as HTMLElement;
      expect(preview).toHaveStyle({ width: '200px', height: '200px' });
    });

    it('hides type label in small size', () => {
      render(<ContentPreview content={mockPhotoContent} size="small" />);

      // Icon should be present but label text should not
      expect(screen.queryByText('Photo')).not.toBeInTheDocument();
    });
  });
});
```

#### Verification Steps

- [ ] All content type tests pass
- [ ] Size variant tests pass
- [ ] Mocks properly set up for URL methods
- [ ] Run `npm test -- ContentPreview.test.tsx` - all tests pass

#### Acceptance Criteria
- [ ] Tests for all 5 content types
- [ ] Tests for all 3 size variants
- [ ] Duration formatting tested
- [ ] Page count display tested

---

### Task 11: Create Unit Tests - Interactions and States

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPreview.test.tsx`
**Estimated Effort:** 0.75 story points
**Dependencies:** Task 10

#### Description
Add unit tests for ContentPreview interactions (remove button), loading states, and object URL cleanup.

#### Code Implementation (add to existing test file)

```typescript
  // ===========================================================================
  // Loading State Tests
  // ===========================================================================

  describe('loading state', () => {
    it('shows loading skeleton when isLoading is true', () => {
      render(<ContentPreview content={mockPhotoContent} isLoading={true} />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText('Loading preview...')).toBeInTheDocument();
    });

    it('shows content when isLoading is false', () => {
      render(<ContentPreview content={mockPhotoContent} isLoading={false} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Type Badge Tests
  // ===========================================================================

  describe('type badge', () => {
    it('shows type badge by default', () => {
      render(<ContentPreview content={mockPhotoContent} />);

      expect(screen.getByText('Photo')).toBeInTheDocument();
    });

    it('hides type badge when showTypeBadge is false', () => {
      render(<ContentPreview content={mockPhotoContent} showTypeBadge={false} />);

      expect(screen.queryByText('Photo')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Remove Button Tests
  // ===========================================================================

  describe('remove button', () => {
    it('shows remove button when showRemove is true', () => {
      render(<ContentPreview content={mockPhotoContent} showRemove={true} onRemove={jest.fn()} />);

      expect(screen.getByRole('button', { name: /remove content/i })).toBeInTheDocument();
    });

    it('hides remove button when showRemove is false', () => {
      render(<ContentPreview content={mockPhotoContent} showRemove={false} />);

      expect(screen.queryByRole('button', { name: /remove content/i })).not.toBeInTheDocument();
    });

    it('calls onRemove when remove button clicked', async () => {
      const mockOnRemove = jest.fn();
      render(<ContentPreview content={mockPhotoContent} showRemove={true} onRemove={mockOnRemove} />);

      const removeButton = screen.getByRole('button', { name: /remove content/i });
      removeButton.click();

      expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Cleanup Tests
  // ===========================================================================

  describe('cleanup', () => {
    it('revokes object URLs on unmount', async () => {
      const { unmount } = render(<ContentPreview content={mockPhotoContent} />);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });

      unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('accessibility', () => {
    it('has appropriate aria-label on container', () => {
      render(<ContentPreview content={mockPhotoContent} />);

      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Photo content preview');
    });

    it('remove button has accessible label', () => {
      render(<ContentPreview content={mockPhotoContent} showRemove={true} onRemove={jest.fn()} />);

      expect(screen.getByRole('button', { name: /remove content/i })).toHaveAttribute('aria-label', 'Remove content');
    });

    it('loading state has aria-busy', () => {
      render(<ContentPreview content={mockPhotoContent} isLoading={true} />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });
  });
```

#### Verification Steps

- [ ] Loading state tests pass
- [ ] Type badge visibility tests pass
- [ ] Remove button tests pass
- [ ] Object URL cleanup tests pass
- [ ] Accessibility tests pass
- [ ] Run `npm test -- ContentPreview.test.tsx` - all tests pass

#### Acceptance Criteria
- [ ] isLoading prop shows skeleton
- [ ] showTypeBadge prop controls badge visibility
- [ ] showRemove + onRemove work correctly
- [ ] URLs cleaned up on unmount
- [ ] Accessibility attributes present

---

### Task 12: Full Verification and Integration Testing

**Estimated Effort:** 0.75 story points
**Dependencies:** Tasks 1-11

#### Description
Perform comprehensive verification of the ContentPreview component including TypeScript compilation, linting, build, and visual inspection.

#### Verification Commands

```bash
# Step 1: TypeScript compilation
npm run type-check

# Step 2: Linting
npm run lint

# Step 3: Run tests
npm test -- ContentPreview.test.tsx

# Step 4: Build verification
npm run build

# Step 5: Verify exports
grep -r "ContentPreview" src/components/ItemCreationWorkflow/components/shared/index.ts
```

#### Manual Visual Inspection Checklist

Create a temporary test page or use Storybook (if available) to visually verify:

- [ ] **Video Preview**
  - Thumbnail displays from video blob
  - Play button centered
  - Duration badge bottom-right
  - All three sizes render correctly

- [ ] **Photo Preview**
  - Image fills container with object-fit cover
  - Fallback icon shows on error
  - All three sizes render correctly

- [ ] **PDF Preview**
  - FileText icon centered
  - Page count badge visible
  - Amber background applied
  - All three sizes render correctly

- [ ] **Text Preview**
  - Truncated text visible
  - Green background applied
  - Line clamp prevents overflow
  - All three sizes render correctly

- [ ] **URL Preview**
  - Thumbnail shown when available
  - Favicon + title fallback works
  - Indigo background applied
  - Domain shown for medium/large sizes
  - All three sizes render correctly

- [ ] **Loading States**
  - Skeleton animation visible
  - Background color hints at type
  - Screen reader announcement included

- [ ] **Interactive Features**
  - Type badge toggles with prop
  - Remove button shows on hover
  - Remove callback fires on click

#### Expected Results

| Metric | Expected |
|--------|----------|
| TypeScript compilation | 0 errors |
| Lint errors | 0 errors |
| Test pass rate | 100% |
| Build | Success |

#### Accessibility Verification

- [ ] Screen reader announces content type
- [ ] Loading state announced with aria-busy
- [ ] Remove button has accessible label
- [ ] Color contrast meets WCAG AA for badges

#### Acceptance Criteria
- [ ] TypeScript compiles without errors
- [ ] Lint passes without errors
- [ ] All unit tests pass
- [ ] Build completes successfully
- [ ] Visual inspection confirms correct rendering
- [ ] Accessibility requirements met

---

## Task Summary

| Task | Description | File(s) | Est. Points | Dependencies |
|------|-------------|---------|-------------|--------------|
| 1 | Create base structure with types/constants | ContentPreview.tsx | 1.0 | None |
| 2 | Implement VideoPreview sub-component | ContentPreview.tsx | 1.0 | Task 1 |
| 3 | Implement PhotoPreview sub-component | ContentPreview.tsx | 0.5 | Task 1 |
| 4 | Implement PdfPreview sub-component | ContentPreview.tsx | 0.5 | Task 1 |
| 5 | Implement TextPreview sub-component | ContentPreview.tsx | 0.5 | Task 1 |
| 6 | Implement UrlPreview sub-component | ContentPreview.tsx | 1.0 | Task 1 |
| 7 | Implement loading skeleton | ContentPreview.tsx | 0.75 | Tasks 1-6 |
| 8 | Implement main ContentPreview component | ContentPreview.tsx | 1.0 | Tasks 1-7 |
| 9 | Export from shared index | shared/index.ts | 0.25 | Task 8 |
| 10 | Unit tests - basic rendering | ContentPreview.test.tsx | 1.0 | Tasks 1-9 |
| 11 | Unit tests - interactions and states | ContentPreview.test.tsx | 0.75 | Task 10 |
| 12 | Full verification and testing | All files | 0.75 | Tasks 1-11 |
| **Total** | | | **9.0** | |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Object URL memory leaks | Low | Medium | Strict urlsRef pattern with cleanup on unmount |
| Large video thumbnails slow rendering | Low | Medium | Use video preload="metadata" instead of "auto" |
| Missing URL metadata | Medium | Low | Graceful fallback to domain-only display |
| Size inconsistency across contexts | Medium | Low | Strict SIZE_CONFIG constants, not derived values |
| Type assertion issues | Low | Low | Explicit Extract<> types for content data |

---

## Rollback Plan

If issues are discovered after implementation:

1. Delete the new component file:
   ```bash
   rm src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx
   rm src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPreview.test.tsx
   ```

2. Revert the barrel export changes:
   ```bash
   git checkout HEAD~1 -- src/components/ItemCreationWorkflow/components/shared/index.ts
   ```

3. Run verification:
   ```bash
   npm run type-check && npm run lint && npm run build
   ```

---

## Future Integration Points

After this component is complete:

1. **Task 5.2 (REQ-168)**: Redesign PreviewSaveStep to use ContentPreview
2. **Refactoring**: Consider updating ContentPieceCard to compose ContentPreview internally
3. **SessionSummaryStep**: Could use ContentPreview for item content thumbnails

---

## References

- **Request:** `/docs/gen_requests.md` - REQ-167
- **Overview:** `/docs/REQ-167-create-contentpreview-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md` - Phase 5, Task 5.1
- **Existing Pattern:** `/src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`
- **Types:** `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Test Pattern:** `/src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPieceCard.test.tsx`

---

## Acceptance Criteria (from REQ-167)

All criteria from the original request:

- [ ] Video content displays a thumbnail image with a visible duration badge
- [ ] Photo content displays a thumbnail of the image
- [ ] PDF content displays a thumbnail with a page count indicator
- [ ] Text content displays truncated preview text with a recognizable icon
- [ ] URL content displays the site favicon, page title, and domain name
- [ ] All content types show appropriate loading states while being processed
- [ ] The component handles error states gracefully when previews cannot be generated
- [ ] The component is exported from the shared component barrel for use throughout the application
- [ ] The component adapts responsively to different container sizes
- [ ] The preview appearance is visually consistent with the application's design system
