# REQ-E04-018: Update LinkCard Component with Translation Display Support - Detailed Task Breakdown

**Request ID:** REQ-E04-018
**Title:** Update LinkCard Component with Translation Display Support
**Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** Epic 4 - Guest Experience, Phase 5 - Update Guest Pages
**Task ID:** 5.3

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for enhancing the `LinkCard` component to support translation display. The enhancement adds two optional props (`originalTitle` and `showOriginal`) that allow the component to toggle between translated and original link titles based on the guest's display preference.

**Estimated Total Effort:** 1-2 story points
**Files Modified:** 2
**Risk Level:** Low (backward compatible, additive changes only)

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 4 REQ-E04-017 (ItemDisplay with translation support) is complete or in progress
- [ ] Epic 4 REQ-E04-014 (useGuestLanguage hook) is available
- [ ] `/src/types/l10n.ts` exists with localization types (REQ-E04-001)
- [ ] `/src/types/index.ts` exports L10N types (REQ-E04-003)

---

## Task Breakdown

### Task 1: Update LinkCardProps Interface in Types File

**File:** `/src/types/index.ts`
**Lines to modify:** 403-409 (current LinkCardProps interface)
**Effort:** XS (5 minutes)
**Dependencies:** None

#### Current Code
```typescript
export interface LinkCardProps {
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  onClick: () => void;
}
```

#### Target Code
```typescript
export interface LinkCardProps {
  /** Current display title (translated or original) */
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  onClick: () => void;
  /** Original title in source language for translation toggle (optional) */
  originalTitle?: string;
  /** Whether to display original content instead of translated - controlled by parent (optional, defaults to false) */
  showOriginal?: boolean;
}
```

#### Implementation Steps
1. Open `/src/types/index.ts`
2. Locate the `LinkCardProps` interface (approximately line 403)
3. Add JSDoc comment to existing `title` prop for clarity
4. Add `originalTitle?: string` with JSDoc comment
5. Add `showOriginal?: boolean` with JSDoc comment
6. Save file

#### Verification
- [ ] TypeScript compilation succeeds without errors
- [ ] Existing LinkCard usages continue to work (backward compatible)
- [ ] New props appear in IDE autocomplete when typing `<LinkCard`

---

### Task 2: Update LinkCard Component Props Destructuring

**File:** `/src/components/LinkCard.tsx`
**Line to modify:** 8
**Effort:** XS (5 minutes)
**Dependencies:** Task 1

#### Current Code (Line 8)
```typescript
export default function LinkCard({ title, linkType, url, thumbnailUrl, onClick }: LinkCardProps) {
```

#### Target Code
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

#### Implementation Steps
1. Open `/src/components/LinkCard.tsx`
2. Locate line 8 with the function signature
3. Add `originalTitle` to destructuring
4. Add `showOriginal = false` to destructuring with default value
5. Optional: Format to multiline for readability
6. Save file

#### Verification
- [ ] TypeScript compilation succeeds
- [ ] Component still renders correctly with existing props only
- [ ] No console errors when `originalTitle` and `showOriginal` are omitted

---

### Task 3: Add Display Title Computation Logic

**File:** `/src/components/LinkCard.tsx`
**Insert after:** Line 10 (after state declarations)
**Effort:** XS (5 minutes)
**Dependencies:** Task 2

#### Implementation
Add the following code after line 10 (after the `imageLoading` state declaration):

```typescript
  // Determine which title to display based on toggle state
  // When showOriginal is true AND originalTitle exists, show original
  // Otherwise, show the (translated) title prop
  const displayTitle = showOriginal && originalTitle ? originalTitle : title;
```

#### Insert Position
```typescript
export default function LinkCard({ ... }: LinkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // ADD HERE: displayTitle computation
  const displayTitle = showOriginal && originalTitle ? originalTitle : title;

  // Get the appropriate icon for the link type
  const getIcon = () => {
    ...
```

#### Implementation Steps
1. Locate line 10 in `/src/components/LinkCard.tsx`
2. Add blank line after `imageLoading` state
3. Add comment explaining the display logic
4. Add `displayTitle` constant with conditional logic
5. Save file

#### Verification
- [ ] `displayTitle` resolves to `title` when `showOriginal` is false
- [ ] `displayTitle` resolves to `title` when `originalTitle` is undefined
- [ ] `displayTitle` resolves to `originalTitle` when both `showOriginal` is true AND `originalTitle` is defined

---

### Task 4: Update Title Rendering in JSX

**File:** `/src/components/LinkCard.tsx`
**Line to modify:** 129
**Effort:** XS (2 minutes)
**Dependencies:** Task 3

#### Current Code (Line 129)
```typescript
          {title}
```

#### Target Code
```typescript
          {displayTitle}
```

#### Implementation Steps
1. Locate line 129 in the JSX (inside the `<h3>` element)
2. Replace `{title}` with `{displayTitle}`
3. Save file

#### Verification
- [ ] Component renders the computed displayTitle
- [ ] Text appears correctly in the card content section

---

### Task 5: Update Image Alt Text

**File:** `/src/components/LinkCard.tsx`
**Line to modify:** 78
**Effort:** XS (2 minutes)
**Dependencies:** Task 3

#### Current Code (Line 78)
```typescript
            alt={`${title} preview`}
```

#### Target Code
```typescript
            alt={`${displayTitle} preview`}
```

#### Implementation Steps
1. Locate line 78 (the `<img>` element's alt attribute)
2. Replace `${title}` with `${displayTitle}`
3. Save file

#### Verification
- [ ] Alt text uses the currently displayed title
- [ ] Screen readers announce the correct title for images

---

### Task 6: Update Error Logging for Debugging

**File:** `/src/components/LinkCard.tsx`
**Lines to modify:** 56-60 (handleImageError function)
**Effort:** XS (5 minutes)
**Dependencies:** Task 2

#### Current Code (Lines 56-60)
```typescript
  const handleImageError = () => {
    console.warn(`Failed to load thumbnail for: ${title}`, { thumbnailUrl, url, linkType });
    setImageError(true);
    setImageLoading(false);
  };
```

#### Target Code
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

#### Implementation Steps
1. Locate the `handleImageError` function (lines 56-60)
2. Update the console.warn message to use `displayTitle`
3. Add `title` and `originalTitle` to the log object for debugging
4. Format object for readability
5. Save file

#### Verification
- [ ] Console warnings include both title values for debugging
- [ ] Error logging uses the currently displayed title in message

---

### Task 7: Add File Header Comment

**File:** `/src/components/LinkCard.tsx`
**Insert at:** Top of file (after 'use client')
**Effort:** XS (2 minutes)
**Dependencies:** None

#### Implementation
Add a comment block after line 1:

```typescript
'use client';

// REQ-E04-018: LinkCard with Translation Display Support
// Supports both originalTitle and translated title with showOriginal toggle
// Last Modified: 2026-01-20
```

#### Implementation Steps
1. Open `/src/components/LinkCard.tsx`
2. Add comment block after 'use client' directive
3. Save file

---

## Complete Modified File Reference

### `/src/types/index.ts` - LinkCardProps Section

```typescript
// Component props types
export interface LinkCardProps {
  /** Current display title (translated or original) */
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  onClick: () => void;
  /** Original title in source language for translation toggle (optional) */
  originalTitle?: string;
  /** Whether to display original content instead of translated - controlled by parent (optional, defaults to false) */
  showOriginal?: boolean;
}
```

### `/src/components/LinkCard.tsx` - Complete Modified File

```typescript
'use client';

// REQ-E04-018: LinkCard with Translation Display Support
// Supports both originalTitle and translated title with showOriginal toggle
// Last Modified: 2026-01-20

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
  originalTitle,
  showOriginal = false
}: LinkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Determine which title to display based on toggle state
  // When showOriginal is true AND originalTitle exists, show original
  // Otherwise, show the (translated) title prop
  const displayTitle = showOriginal && originalTitle ? originalTitle : title;

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
            alt={`${displayTitle} preview`}
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
            {getLinkTypeLabel(linkType).toUpperCase()}
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
          {displayTitle}
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
```

---

## Integration with ItemDisplay (REQ-E04-017)

After completing this task, the `ItemDisplay` component can pass translation props to `LinkCard`:

```typescript
// In ItemDisplay.tsx when rendering links
{article.links.map((link) => (
  <LinkCard
    key={link.id}
    title={link.title}
    originalTitle={link.originalTitle}
    showOriginal={showOriginal}  // From useGuestLanguage hook
    linkType={link.linkType}
    url={link.url}
    thumbnailUrl={link.thumbnailUrl}
    onClick={() => handleLinkClick(link.url, link.linkType)}
  />
))}
```

---

## Testing Checklist

### Unit Tests

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Backward compatibility | `title="Test"` only | Displays "Test" |
| Both titles, showOriginal=false | `title="Lien"`, `originalTitle="Link"`, `showOriginal=false` | Displays "Lien" |
| Both titles, showOriginal=true | `title="Lien"`, `originalTitle="Link"`, `showOriginal=true` | Displays "Link" |
| showOriginal=true, no originalTitle | `title="Lien"`, `showOriginal=true` | Displays "Lien" (fallback) |
| Empty originalTitle | `title="Lien"`, `originalTitle=""`, `showOriginal=true` | Displays "Lien" (fallback) |
| Alt text correctness | `title="Translated"`, `originalTitle="Original"`, `showOriginal=true` | Alt text: "Original preview" |

### Manual Testing Steps

1. **Backward Compatibility Test:**
   - Find an existing LinkCard usage in the codebase
   - Verify it still renders correctly without new props
   - Check console for no TypeScript or runtime errors

2. **Translation Toggle Test:**
   - If ItemDisplay is ready, navigate to guest item page
   - Set language to French (or any non-English)
   - Verify link titles show translated text
   - Click "View Original"
   - Verify link titles switch to English originals
   - Click "View Translation"
   - Verify link titles return to French

3. **Edge Case Test:**
   - View item with links that have no translations
   - Verify original titles display without errors
   - Toggle "View Original" - verify no change (already showing original)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing LinkCard usages | Low | High | New props are optional with defaults |
| Type errors in consuming components | Low | Medium | TypeScript will flag missing required props |
| Long translated titles causing overflow | Low | Low | Existing `line-clamp-2` handles truncation |
| Performance impact | Very Low | Very Low | Simple string conditional, no re-renders |

---

## Acceptance Criteria Verification

| Criteria from Request | Task(s) | Implementation |
|-----------------------|---------|----------------|
| Component accepts original title prop | Task 1, Task 2 | `originalTitle?: string` optional prop |
| Component accepts translated title prop | Existing | `title: string` required prop |
| Displays translated when toggle off | Task 3, Task 4 | `displayTitle` uses `title` when `!showOriginal` |
| Displays original when toggle on | Task 3, Task 4 | `displayTitle` uses `originalTitle` when `showOriginal` |
| Accepts display toggle state | Task 1, Task 2 | `showOriginal?: boolean` with default `false` |
| Handles undefined translated title | Task 3 | Falls back to `title` |
| Maintains all existing styling | All | No className changes |
| Maintains click behavior | N/A | `onClick` unchanged |
| TypeScript props updated | Task 1 | Interface extended |
| Backward compatible | All | New props optional |
| No visual regression | Task 4 | Same JSX structure |

---

## Files Changed Summary

| File | Change Type | Lines Modified |
|------|-------------|----------------|
| `/src/types/index.ts` | Modified | 403-409 → 403-413 |
| `/src/components/LinkCard.tsx` | Modified | Lines 1-3, 8, 10, 57, 78, 129 |

---

## References

- **Request:** `/docs/gen_requests_epic4.md` - REQ-E04-018
- **Overview:** `/docs/REQ-E04-018-update-linkcard-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Current Component:** `/src/components/LinkCard.tsx`
- **Types File:** `/src/types/index.ts`
- **Parent Component:** `/src/components/ItemDisplay.tsx` (REQ-E04-017)

---

*Detailed task breakdown generated for FAQBNB Localization Epic 4 - Guest Experience*
*Document created: 2026-01-20*
