# REQ-167: Create ContentPreview Component - Implementation Overview

**Document Created:** 2026-01-09 21:45:00 UTC
**Last Modified:** 2026-01-09 21:45:00 UTC
**Status:** Draft
**Task Context:** Phase 5, Task 5.1 from Plan-094-UI-UX-Workflow-Improvements
**PRD Reference:** `/docs/prd/Plan-094-UI-UX-Workflow-Improvements.md`

---

## 1. Summary

Create a reusable `ContentPreview` component that displays standardized, visually informative previews of various content types (video, photo, PDF, text, URL) throughout the application. This component will be the foundation for the redesigned PreviewSaveStep and other content display areas.

---

## 2. Current State Analysis

### 2.1 Existing Implementation

The current `ContentPieceCard` component (`/src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`) handles content preview but is tightly coupled with action buttons (remove/retake) and drag-and-drop functionality. It includes:

- `VideoPreview` sub-component with thumbnail + duration badge
- `PhotoPreview` sub-component with image thumbnail
- `PdfPreview` sub-component with icon + page count
- `TextPreview` sub-component with truncated text
- `UrlPreviewContent` sub-component with favicon/title/domain

### 2.2 Gaps in Current Implementation

1. **Coupled with Actions**: Cannot use preview rendering independently of remove/retake actions
2. **No Loading States**: Missing explicit loading states for async content (video thumbnail generation, URL metadata)
3. **Inconsistent Sizing**: Size variations not standardized across use cases
4. **Limited Reusability**: Sub-components are internal to ContentPieceCard

---

## 3. Technical Approach

### 3.1 Design Goals

1. **Separation of Concerns**: Extract pure preview rendering from action handling
2. **Loading States**: Built-in loading skeleton for each content type
3. **Size Variants**: Small, medium, large presets for different contexts
4. **Reusability**: Standalone component exportable for use in PreviewSaveStep, SessionSummaryStep, and other displays

### 3.2 Component Architecture

```
ContentPreview.tsx
├── Types & Interfaces
│   ├── ContentPreviewProps
│   ├── ContentPreviewSize
│   └── ContentPreviewStatus
├── Sub-Components
│   ├── VideoPreview (thumbnail + duration badge)
│   ├── PhotoPreview (image thumbnail)
│   ├── PdfPreview (thumbnail + page count)
│   ├── TextPreview (truncated text + icon)
│   └── UrlPreview (favicon + title + domain)
├── Loading States
│   ├── VideoLoadingSkeleton
│   ├── PhotoLoadingSkeleton
│   ├── PdfLoadingSkeleton
│   ├── TextLoadingSkeleton
│   └── UrlLoadingSkeleton
└── Main Component
    └── ContentPreview
```

### 3.3 Props Interface Design

```typescript
export interface ContentPreviewProps {
  /** Content piece to preview */
  content: ContentPiece;
  /** Size variant for different contexts */
  size?: 'small' | 'medium' | 'large';
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
```

### 3.4 Size Configurations

| Size | Dimensions | Use Case |
|------|------------|----------|
| `small` | 80x80px | Inline mentions, compact lists |
| `medium` | 120x120px | Grid displays (default) |
| `large` | 200x200px | Detailed preview, hero display |

---

## 4. Implementation Tasks

### Task 5.1.1: Create Base Component Structure
- [ ] Create `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`
- [ ] Define `ContentPreviewProps` interface
- [ ] Define size configuration constants
- [ ] Set up component skeleton with size switching

### Task 5.1.2: Implement Video Preview
- [ ] Extract video preview logic from ContentPieceCard
- [ ] Display video thumbnail from blob URL
- [ ] Show duration badge (bottom-right corner)
- [ ] Show play button overlay (centered)
- [ ] Add VideoLoadingSkeleton for loading state

### Task 5.1.3: Implement Photo Preview
- [ ] Extract photo preview logic from ContentPieceCard
- [ ] Display image thumbnail with object-fit cover
- [ ] Handle image loading errors gracefully
- [ ] Add PhotoLoadingSkeleton for loading state

### Task 5.1.4: Implement PDF Preview
- [ ] Extract PDF preview logic from ContentPieceCard
- [ ] Display document icon (FileText from Lucide)
- [ ] Show page count badge when available
- [ ] Add PDF-specific background color (amber theme)
- [ ] Add PdfLoadingSkeleton for loading state

### Task 5.1.5: Implement Text Preview
- [ ] Extract text preview logic from ContentPieceCard
- [ ] Display truncated text with line-clamp
- [ ] Show text icon (Type from Lucide)
- [ ] Add text-specific background color (green theme)
- [ ] Add TextLoadingSkeleton for loading state

### Task 5.1.6: Implement URL Preview
- [ ] Extract URL preview logic from ContentPieceCard
- [ ] Display favicon when available
- [ ] Show page title (truncated)
- [ ] Display domain name
- [ ] Handle missing metadata gracefully
- [ ] Add UrlLoadingSkeleton for loading state

### Task 5.1.7: Add Loading States
- [ ] Create unified loading skeleton component
- [ ] Implement shimmer animation using Tailwind
- [ ] Size-aware skeleton dimensions
- [ ] Accessible loading announcement

### Task 5.1.8: Export from Shared Index
- [ ] Export `ContentPreview` from `/components/shared/index.ts`
- [ ] Export `ContentPreviewProps` type
- [ ] Update barrel exports

---

## 5. Authorized Files and Functions for Modification

### Files to CREATE

| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | Main ContentPreview component |
| `/src/components/ItemCreationWorkflow/components/shared/__tests__/ContentPreview.test.tsx` | Unit tests for ContentPreview |

### Files to MODIFY

| File | Function/Section | Change |
|------|------------------|--------|
| `/src/components/ItemCreationWorkflow/components/shared/index.ts` | Barrel exports | Add ContentPreview export |

### Files to REFERENCE (read-only)

| File | Reason |
|------|--------|
| `/src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx` | Existing preview patterns to extract |
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | ContentPiece and ContentData types |
| `/src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx` | Text truncation patterns |
| `/src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts` | URL metadata handling patterns |

---

## 6. Integration Points

### 6.1 Dependencies (Existing)

- `react`: useState, useEffect, useRef, useMemo
- `lucide-react`: Video, Image, FileText, Type, Link, Play icons
- `@/lib/utils`: cn utility for className merging
- `ContentPiece`, `ContentData` from `../../ItemCreationWorkflow.types`

### 6.2 Future Consumers

- **PreviewSaveStep**: Will use ContentPreview for redesigned content display (Phase 5, Task 5.2)
- **SessionSummaryStep**: Could use for item content thumbnails
- **ContentPieceCard**: Refactor to compose ContentPreview internally

---

## 7. Code Patterns to Follow

### 7.1 Component Structure Pattern

Follow the established pattern from `ContentPieceCard.tsx`:

```typescript
'use client';

/**
 * ContentPreview Component
 *
 * Description...
 *
 * @module ItemCreationWorkflow/components/shared/ContentPreview
 * @see PreviewSaveStep for usage context
 * @lastModified 2026-01-09
 */

import { ... } from 'react';
import { ... } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentPiece } from '../../ItemCreationWorkflow.types';

// =============================================================================
// Types
// =============================================================================

export interface ContentPreviewProps { ... }

// =============================================================================
// Constants
// =============================================================================

const SIZE_CONFIG = { ... };
const TYPE_CONFIG = { ... };

// =============================================================================
// Sub-Components
// =============================================================================

function VideoPreview({ ... }) { ... }
function PhotoPreview({ ... }) { ... }
// ...

// =============================================================================
// Loading Skeletons
// =============================================================================

function PreviewSkeleton({ ... }) { ... }

// =============================================================================
// Main Component
// =============================================================================

export function ContentPreview({ ... }: ContentPreviewProps) { ... }

export default ContentPreview;
```

### 7.2 Type Badge Pattern

Use the established color coding from ContentPieceCard:

```typescript
const TYPE_CONFIG = {
  video: { icon: Video, color: 'bg-purple-100 text-purple-700', label: 'Video' },
  photo: { icon: Image, color: 'bg-blue-100 text-blue-700', label: 'Photo' },
  pdf: { icon: FileText, color: 'bg-amber-100 text-amber-700', label: 'PDF' },
  text: { icon: Type, color: 'bg-green-100 text-green-700', label: 'Text' },
  url: { icon: Link, color: 'bg-indigo-100 text-indigo-700', label: 'Link' },
} as const;
```

### 7.3 Object URL Management Pattern

Follow the established cleanup pattern for blob URLs:

```typescript
const urlsRef = useRef<string[]>([]);

useEffect(() => {
  return () => {
    urlsRef.current.forEach(url => URL.revokeObjectURL(url));
  };
}, []);
```

---

## 8. Testing Requirements

### 8.1 Unit Tests

- [ ] Renders video preview with thumbnail and duration
- [ ] Renders photo preview with image
- [ ] Renders PDF preview with page count
- [ ] Renders text preview with truncated content
- [ ] Renders URL preview with favicon and domain
- [ ] Applies correct size classes for each variant
- [ ] Shows loading skeleton when isLoading is true
- [ ] Shows type badge when showTypeBadge is true
- [ ] Hides type badge when showTypeBadge is false
- [ ] Shows remove button when showRemove is true
- [ ] Calls onRemove callback when remove clicked
- [ ] Cleans up object URLs on unmount

### 8.2 Accessibility Tests

- [ ] Has appropriate aria-label for each content type
- [ ] Loading state has aria-busy="true"
- [ ] Remove button has accessible label
- [ ] Color contrast meets WCAG AA

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Object URL memory leaks | Low | Medium | Follow established cleanup pattern with useRef |
| Large video thumbnails slow rendering | Low | Medium | Use video poster or first frame extraction |
| Missing URL metadata | Medium | Low | Graceful fallback to domain-only display |
| Size inconsistency across contexts | Medium | Low | Strict size config constants |

---

## 10. Success Criteria

1. **Functionality**: All 5 content types render correctly with type-specific previews
2. **Loading States**: Each content type shows appropriate loading skeleton
3. **Size Variants**: Small, medium, large sizes render at expected dimensions
4. **Reusability**: Component can be used standalone without ContentPieceCard
5. **Accessibility**: Screen readers announce content type and loading state
6. **Memory Safety**: No object URL leaks on unmount
7. **Test Coverage**: All unit tests passing

---

## 11. Estimated Effort

| Task | Estimate |
|------|----------|
| Task 5.1.1: Base structure | 0.5 day |
| Task 5.1.2: Video preview | 0.5 day |
| Task 5.1.3: Photo preview | 0.25 day |
| Task 5.1.4: PDF preview | 0.25 day |
| Task 5.1.5: Text preview | 0.25 day |
| Task 5.1.6: URL preview | 0.5 day |
| Task 5.1.7: Loading states | 0.5 day |
| Task 5.1.8: Export & tests | 0.5 day |
| **Total** | **3.25 days** |

---

## 12. Next Steps After Completion

1. **Task 5.2**: Redesign PreviewSaveStep to use ContentPreview (separate request)
2. **Refactor**: Consider refactoring ContentPieceCard to compose ContentPreview internally
3. **Documentation**: Update component documentation in shared/index.ts

---

## Appendix A: ContentPiece Type Reference

From `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`:

```typescript
export type ContentData =
  | { type: 'video'; file: File | Blob; duration?: number }
  | { type: 'photo'; file: File | Blob }
  | { type: 'pdf'; file: File | Blob; pageCount?: number }
  | { type: 'text'; text: string }
  | { type: 'url'; url: string; title?: string; thumbnailUrl?: string; faviconUrl?: string };

export interface ContentPiece {
  id: string;
  type: ContentType;
  data: ContentData;
  order: number;
  thumbnail?: Blob;
}
```

---

## Appendix B: Existing Sub-Component Implementations

### B.1 VideoPreview (from ContentPieceCard)

```typescript
function VideoPreview({ data, urlsRef }: VideoPreviewProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data.file) {
      const url = URL.createObjectURL(data.file);
      urlsRef.current.push(url);
      setThumbnailUrl(url);
    }
    return () => {
      // URL will be revoked by parent component cleanup
    };
  }, [data.file, urlsRef]);

  return (
    <div className="relative w-full h-full">
      {thumbnailUrl ? (
        <video
          src={thumbnailUrl}
          className="w-full h-full object-cover"
          preload="metadata"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <Video className="w-8 h-8 text-gray-400" aria-hidden="true" />
        </div>
      )}
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
        <Play className="w-8 h-8 text-white" aria-hidden="true" />
      </div>
      {/* Duration overlay */}
      {data.duration && (
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
          {formatDuration(data.duration)}
        </div>
      )}
    </div>
  );
}
```

### B.2 Duration Formatter

```typescript
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```
