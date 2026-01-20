# REQ-E04-018: Update LinkCard Component with Translation Display Support - Implementation Overview

**Request ID:** REQ-E04-018
**Title:** Update LinkCard Component with Translation Display Support
**Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** Epic 4 - Guest Experience, Phase 5 - Update Guest Pages
**Task ID:** 5.3

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Summary

Enhance the `LinkCard` component (`/src/components/LinkCard.tsx`) to accept both original and translated title values as props, displaying the appropriate title based on a toggle state. When guests toggle to view original content, link titles should switch from translated to original text without requiring a page reload or data refetch.

---

## Context and Dependencies

### Implementation Plan Reference
- **Document:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Task Reference:** Phase 5: Update Guest Pages, Task 5.3

### Dependencies from Previous Tasks (Epic 4)

| Dependency | Location | Status |
|------------|----------|--------|
| Localization Types | `/src/types/l10n.ts` | Required (REQ-E04-001) |
| ItemDisplay Component (with translation) | `/src/components/ItemDisplay.tsx` | Required (REQ-E04-017) |
| useGuestLanguage Hook | `/src/hooks/useGuestLanguage.ts` | Required (REQ-E04-014) |
| Types Index Export | `/src/types/index.ts` | Required (REQ-E04-003) |

### Dependencies from Epic 1 (Foundation)

| Dependency | Location | Status |
|------------|----------|--------|
| SupportedLanguage Type | `/src/contexts/LocaleContext.tsx` | Available |
| SUPPORTED_LOCALES Config | `/src/contexts/LocaleContext.tsx` | Available |

### Existing Patterns to Follow

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Current LinkCard Implementation | `/src/components/LinkCard.tsx` | Primary file to modify |
| LinkCardProps Interface | `/src/types/index.ts` | Type definition to extend |
| ItemDisplay Toggle Pattern | `/src/components/ItemDisplay.tsx` | Parent component passing toggle state |
| Client Component Pattern | `'use client'` directive | Required for current LinkCard |

---

## Technical Specification

### Current Component Structure

The existing `LinkCard` component is a client component that:
- Displays link title from the `title` prop
- Renders thumbnail images with fallback handling
- Shows link type badges (youtube, pdf, image, text)
- Handles click events via `onClick` callback
- Manages image loading and error states

### Current Props Interface

```typescript
// From /src/types/index.ts
export interface LinkCardProps {
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  onClick: () => void;
}
```

### Updated Props Interface

```typescript
// Extended LinkCardProps to support translation toggle
export interface LinkCardProps {
  /** Current title to display (translated or original based on showOriginal) */
  title: string;
  /** Original title in source language (optional) */
  originalTitle?: string;
  /** Whether to display original content instead of translated */
  showOriginal?: boolean;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  onClick: () => void;
}
```

### Alternative Approach (Selected)

To maintain simplicity and backward compatibility, the `showOriginal` toggle logic can be handled by the parent component (`ItemDisplay`). In this approach:

```typescript
// Parent component (ItemDisplay) determines which title to pass
<LinkCard
  title={showOriginal && link.originalTitle ? link.originalTitle : link.title}
  linkType={link.linkType}
  url={link.url}
  thumbnailUrl={link.thumbnailUrl}
  onClick={() => handleLinkClick(link.url, link.linkType)}
/>
```

However, for a cleaner separation of concerns and explicit documentation of translation support, the LinkCard component should accept both values and handle the toggle internally.

### Component Architecture

```
LinkCard.tsx (client component)
├── Props
│   ├── title (required) - current display title
│   ├── originalTitle (optional) - source language title
│   ├── showOriginal (optional) - toggle state from parent
│   ├── linkType, url, thumbnailUrl, onClick (unchanged)
│
├── Display Logic
│   └── displayTitle = showOriginal && originalTitle ? originalTitle : title
│
└── Rendering (unchanged structure)
    ├── Thumbnail Section
    │   ├── Image with loading/error states
    │   └── Link type badge
    └── Content Section
        └── Title (using displayTitle)
```

### Data Flow

```
ItemDisplay (parent)
    │
    ├── showOriginal state (from useGuestLanguage hook)
    ├── link.title (translated)
    ├── link.originalTitle (original)
    │
    ▼
LinkCard (child)
    │
    ├── Receives: title, originalTitle, showOriginal
    │
    ▼
Display Logic
    │
    └── Shows: showOriginal && originalTitle ? originalTitle : title
```

---

## Implementation Tasks

### Task 1: Update LinkCardProps Interface in Types File
**File:** `/src/types/index.ts`

Extend the existing LinkCardProps interface:
```typescript
export interface LinkCardProps {
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  onClick: () => void;
  /** Original title in source language for translation toggle (optional) */
  originalTitle?: string;
  /** Whether to display original content - controlled by parent (optional) */
  showOriginal?: boolean;
}
```

### Task 2: Update LinkCard Component to Accept New Props
**File:** `/src/components/LinkCard.tsx`

Update the destructuring to include new optional props:
```typescript
export default function LinkCard({
  title,
  linkType,
  url,
  thumbnailUrl,
  onClick,
  originalTitle,
  showOriginal = false
}: LinkCardProps) {
```

### Task 3: Add Display Title Logic
**File:** `/src/components/LinkCard.tsx`

Add logic to determine which title to display:
```typescript
// Determine display title based on toggle state
const displayTitle = showOriginal && originalTitle ? originalTitle : title;
```

### Task 4: Update Title Rendering
**File:** `/src/components/LinkCard.tsx`

Update the JSX to use the computed display title:
```typescript
{/* Content Section */}
<div className="p-4">
  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
    {displayTitle}
  </h3>

  {/* URL preview for text links */}
  {linkType === 'text' && (
    <p className="text-xs text-gray-500 mt-1 truncate">
      {new URL(url).hostname}
    </p>
  )}
</div>
```

### Task 5: Update Alt Text for Thumbnail
**File:** `/src/components/LinkCard.tsx`

Update the image alt text to use the current display title:
```typescript
<img
  src={thumbnailSrc}
  alt={`${displayTitle} preview`}
  className={`w-full h-full object-cover transition-all duration-200 group-hover:scale-105 ${
    imageLoading ? 'opacity-0' : 'opacity-100'
  }`}
  onLoad={handleImageLoad}
  onError={handleImageError}
  loading="lazy"
/>
```

### Task 6: Update Error Logging
**File:** `/src/components/LinkCard.tsx`

Update error logging to include both titles for debugging:
```typescript
const handleImageError = () => {
  console.warn(`Failed to load thumbnail for: ${displayTitle}`, {
    thumbnailUrl,
    url,
    linkType,
    title,
    originalTitle
  });
  setImageError(true);
  setImageLoading(false);
};
```

### Task 7: Ensure Backward Compatibility
**File:** `/src/components/LinkCard.tsx`

The implementation must ensure existing usages work without changes:
- `originalTitle` defaults to undefined
- `showOriginal` defaults to false
- When neither is provided, behavior is identical to current implementation
- No breaking changes to existing callsites

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/LinkCard.tsx` | Add originalTitle and showOriginal props, update title display logic |
| `/src/types/index.ts` | Extend LinkCardProps interface with new optional props |

### Functions to Modify

| File | Function/Section | Modification |
|------|------------------|--------------|
| `/src/components/LinkCard.tsx` | `LinkCard` component | Accept new props, add displayTitle logic |
| `/src/components/LinkCard.tsx` | Props destructuring | Add `originalTitle`, `showOriginal` with defaults |
| `/src/components/LinkCard.tsx` | Title `<h3>` element | Use `displayTitle` instead of `title` |
| `/src/components/LinkCard.tsx` | Image `alt` attribute | Use `displayTitle` for accessibility |
| `/src/components/LinkCard.tsx` | `handleImageError` | Include both titles in debug logging |

### Existing Structure to Preserve

| Element | Location | Notes |
|---------|----------|-------|
| Image loading states | Lines 9-10 | Keep `imageError`, `imageLoading` state |
| `getIcon` function | Lines 13-26 | Unchanged |
| `getThumbnailUrl` function | Lines 28-50 | Unchanged |
| Thumbnail rendering | Lines 74-124 | Unchanged except alt text |
| Link type badge | Lines 109-114 | Unchanged |
| URL preview for text links | Lines 133-137 | Unchanged |
| Hover indicator | Line 141 | Unchanged |

---

## Code Structure Reference

Based on existing component structure in `/src/components/LinkCard.tsx`:

```typescript
// /src/components/LinkCard.tsx
// REQ-E04-018: LinkCard with Translation Display Support
// Last Modified: 2026-01-20

'use client';

import { useState } from 'react';
import { ExternalLink, FileText, Image, Play, Link as LinkIcon } from 'lucide-react';
import { LinkCardProps } from '@/types';
import { getLinkTypeColor, getLinkTypeLabel, getYoutubeThumbnail } from '@/lib/utils';

export default function LinkCard({
  title,
  linkType,
  url,
  thumbnailUrl,
  onClick,
  originalTitle,      // NEW: Original title for translation toggle
  showOriginal = false // NEW: Toggle state from parent
}: LinkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // NEW: Determine which title to display based on toggle state
  const displayTitle = showOriginal && originalTitle ? originalTitle : title;

  // Get the appropriate icon for the link type (unchanged)
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

  // Get the thumbnail URL based on link type (unchanged)
  const getThumbnailUrl = () => {
    if (thumbnailUrl && thumbnailUrl.trim() !== '' && !imageError) {
      return thumbnailUrl;
    }
    if (linkType === 'youtube' && !imageError) {
      const youtubeThumbnail = getYoutubeThumbnail(url);
      if (youtubeThumbnail) {
        return youtubeThumbnail;
      }
    }
    if (linkType === 'image' && !imageError) {
      return url;
    }
    return null;
  };

  const thumbnailSrc = getThumbnailUrl();
  const colorClasses = getLinkTypeColor(linkType);

  // Handle image load error (updated logging)
  const handleImageError = () => {
    console.warn(`Failed to load thumbnail for: ${displayTitle}`, {
      thumbnailUrl,
      url,
      linkType,
      title,
      originalTitle
    });
    setImageError(true);
    setImageLoading(false);
  };

  // Handle successful image load (unchanged)
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail Section (unchanged except alt text) */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={`${displayTitle} preview`}  {/* UPDATED: Use displayTitle */}
            className={`w-full h-full object-cover transition-all duration-200 group-hover:scale-105 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : null}

        {/* Fallback icon (unchanged) */}
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

        {/* Loading state (unchanged) */}
        {imageLoading && thumbnailSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Link type badge (unchanged) */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
            {getLinkTypeLabel(linkType).toUpperCase()}
          </span>
        </div>

        {/* Play button overlay for videos (unchanged) */}
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
          {displayTitle}  {/* UPDATED: Use displayTitle instead of title */}
        </h3>

        {/* URL preview for text links (unchanged) */}
        {linkType === 'text' && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            {new URL(url).hostname}
          </p>
        )}
      </div>

      {/* Hover indicator (unchanged) */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded-xl transition-colors pointer-events-none" />
    </div>
  );
}
```

---

## Integration Points

### ItemDisplay Integration (REQ-E04-017)

The parent `ItemDisplay` component will pass the toggle state and both titles:

```typescript
// In ItemDisplay.tsx when rendering links
{article.links.map((link) => (
  <LinkCard
    key={link.id}
    title={link.title}
    originalTitle={link.originalTitle}
    showOriginal={showOriginal}
    linkType={link.linkType}
    url={link.url}
    thumbnailUrl={link.thumbnailUrl}
    onClick={() => handleLinkClick(link.url, link.linkType)}
  />
))}
```

### Alternative: Parent-Controlled Title (Simpler Approach)

If the team prefers simplicity, the parent can compute the title before passing:

```typescript
// In ItemDisplay.tsx - parent computes display title
<LinkCard
  title={showOriginal && link.originalTitle ? link.originalTitle : link.title}
  linkType={link.linkType}
  url={link.url}
  thumbnailUrl={link.thumbnailUrl}
  onClick={() => handleLinkClick(link.url, link.linkType)}
/>
```

This approach requires no changes to LinkCard but loses explicit documentation of translation support.

### Translation Data Structure (From REQ-E04-016)

Link objects from the server will include original content:
```typescript
interface TranslatedLink {
  id: string;
  title: string;              // Translated title
  originalTitle?: string;     // Original title in source language
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  displayOrder: number;
}
```

---

## Acceptance Criteria Verification

| Criteria | Implementation |
|----------|----------------|
| Component accepts original title prop | `originalTitle?: string` optional prop |
| Component accepts translated title prop | `title: string` required prop (existing) |
| Displays translated title when available and toggle off | `displayTitle` logic uses `title` when `!showOriginal` |
| Displays original title when toggle is on | `displayTitle` logic uses `originalTitle` when `showOriginal` |
| Component accepts display toggle state | `showOriginal?: boolean` optional prop with default `false` |
| Displays original title when toggle on | `showOriginal && originalTitle ? originalTitle : title` |
| Displays original title when no translation | Falls back to `title` when `originalTitle` is undefined |
| Maintains all existing styling | No changes to className attributes |
| Maintains all existing layout | No changes to JSX structure |
| Maintains click behavior | `onClick` prop unchanged |
| Handles undefined translated title | Defaults to `title` if `originalTitle` not provided |
| Handles empty string values | Logic handles empty strings via falsy check |
| TypeScript props updated | `LinkCardProps` interface extended |
| Backward compatible | New props are optional with defaults |
| Works in client-side rendering | Remains a `'use client'` component |
| Works in server-side rendering | Props can be passed from server components |
| No visual regression | Title display location and styling unchanged |

---

## Testing Considerations

### Unit Test Scenarios

1. **Renders with title only (backward compatibility):**
   - Input: `title="Test Link"`
   - Expected: Displays "Test Link"

2. **Renders with both titles, showOriginal false:**
   - Input: `title="Lien Test"`, `originalTitle="Test Link"`, `showOriginal=false`
   - Expected: Displays "Lien Test"

3. **Renders with both titles, showOriginal true:**
   - Input: `title="Lien Test"`, `originalTitle="Test Link"`, `showOriginal=true`
   - Expected: Displays "Test Link"

4. **Renders with showOriginal true but no originalTitle:**
   - Input: `title="Lien Test"`, `showOriginal=true`
   - Expected: Displays "Lien Test" (fallback)

5. **Alt text uses correct title:**
   - Input: `title="Translated"`, `originalTitle="Original"`, `showOriginal=true`
   - Expected: Alt text is "Original preview"

6. **Empty originalTitle handled:**
   - Input: `title="Lien Test"`, `originalTitle=""`, `showOriginal=true`
   - Expected: Displays "Lien Test" (fallback since empty string is falsy)

### Integration Test Scenarios

1. ItemDisplay toggles showOriginal - all LinkCards update titles
2. Language change in parent propagates correct titles to LinkCards
3. Mixed content: some links have translations, some don't

### Manual Test Scenarios

1. Visit item page in French - link titles show French
2. Click "View original" - link titles switch to English
3. Click "View translation" - link titles return to French
4. Item with partial translations - translated links show translated, untranslated show original

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ItemDisplay not passing props | Low | High | Backward compatible defaults |
| Performance from frequent re-renders | Low | Low | React's reconciliation handles this |
| Type mismatch with existing code | Low | Medium | New props are optional |
| Long titles causing layout issues | Low | Low | Existing `line-clamp-2` handles truncation |
| Empty string edge cases | Low | Low | Falsy check handles empty strings |

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-018
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Current Component:** `/src/components/LinkCard.tsx`
- **Types File:** `/src/types/index.ts`
- **Parent Component:** `/src/components/ItemDisplay.tsx` (REQ-E04-017)
- **Guest Item Page:** `/src/app/item/[publicId]/page.tsx` (REQ-E04-016)
- **useGuestLanguage Hook:** `/src/hooks/useGuestLanguage.ts` (REQ-E04-014)
