# REQ-354: Update LinkCard Component with Translation Support - Implementation Overview

**Last Modified:** 2026-01-19 16:00 UTC
**Request Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** 5 - Update Guest Pages
**Task ID:** 5.3
**Dependencies:** REQ-350 (useGuestLanguage hook), Epic 1 L10N types

---

## Summary

The LinkCard component must be enhanced to accept translated link titles and display them in the guest's preferred language, with the ability to show the original title when a view-original toggle is activated. This change supports the guest-facing localization experience defined in Epic 4.

---

## Current State Analysis

### Existing Component: `/src/components/LinkCard.tsx`

The current LinkCard component:
- **Props Interface** (from `/src/types/index.ts`):
  ```typescript
  export interface LinkCardProps {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    onClick: () => void;
  }
  ```
- Displays a single `title` string with no translation awareness
- Renders link type badges, thumbnails, and visual styling
- Has no knowledge of language preferences or original content
- Used in `ItemDisplay.tsx` at lines 217, 244 for rendering link cards

### Current Usage in ItemDisplay.tsx

```tsx
// Line 217 (within article.links loop)
<LinkCard
  key={link.id}
  title={link.title}
  linkType={link.linkType}
  url={link.url}
  thumbnailUrl={link.thumbnailUrl}
  onClick={() => handleLinkClick(link.url, link.linkType)}
/>

// Line 244 (flat links view)
<LinkCard
  key={link.id}
  title={link.title}
  linkType={link.linkType}
  url={link.url}
  thumbnailUrl={link.thumbnailUrl}
  onClick={() => handleLinkClick(link.url, link.linkType)}
/>
```

---

## Target State

### Enhanced Props Interface

The LinkCard component will accept additional optional props for translation support:

```typescript
export interface LinkCardProps {
  // Existing props
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  onClick: () => void;

  // NEW: Translation support props
  /** Original title in source language (when showing translation) */
  originalTitle?: string;
  /** Whether to show the original title instead of translated title */
  showOriginal?: boolean;
  /** Whether this title is a translation */
  isTranslated?: boolean;
}
```

### Behavior Changes

1. **Default behavior (no new props):** Display `title` as before - backward compatible
2. **When `showOriginal=true` and `originalTitle` provided:** Display `originalTitle` instead of `title`
3. **Visual indicator (optional):** When `isTranslated=true`, optionally show a subtle indicator that content is translated (e.g., a small globe icon or translated badge)

---

## Implementation Tasks

### Task 1: Update LinkCardProps Interface

**File:** `/src/types/index.ts`
**Lines:** 403-409

Update the `LinkCardProps` interface to include translation-related props:

```typescript
export interface LinkCardProps {
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  onClick: () => void;
  // Translation support
  originalTitle?: string;
  showOriginal?: boolean;
  isTranslated?: boolean;
}
```

### Task 2: Update LinkCard Component Logic

**File:** `/src/components/LinkCard.tsx`
**Lines:** 8, 128-130

**2a. Update component function signature (line 8):**
```typescript
export default function LinkCard({
  title,
  linkType,
  url,
  thumbnailUrl,
  onClick,
  originalTitle,
  showOriginal = false,
  isTranslated = false
}: LinkCardProps) {
```

**2b. Add display title derivation:**
```typescript
// Derive the title to display based on showOriginal toggle
const displayTitle = showOriginal && originalTitle ? originalTitle : title;
```

**2c. Update title rendering (lines 128-130):**
Replace `{title}` with `{displayTitle}` in the h3 element:
```tsx
<h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
  {displayTitle}
</h3>
```

### Task 3: Update alt text for accessibility

**File:** `/src/components/LinkCard.tsx`
**Line:** 78

Update the image alt text to use `displayTitle`:
```tsx
alt={`${displayTitle} preview`}
```

---

## Integration with ItemDisplay

Once LinkCard is updated, ItemDisplay.tsx will pass the translation props when rendering links. This will be handled in a separate task (REQ-352/353), but the expected usage pattern will be:

```tsx
<LinkCard
  key={link.id}
  title={link.title}                      // Translated title
  originalTitle={link.originalTitle}      // Original title (from TranslatedLink)
  linkType={link.linkType}
  url={link.url}
  thumbnailUrl={link.thumbnailUrl}
  showOriginal={showOriginal}             // From useGuestLanguage hook
  isTranslated={link.isTranslated}        // From translation metadata
  onClick={() => handleLinkClick(link.url, link.linkType)}
/>
```

---

## Authorized Files and Functions for Modification

### Files Authorized for Modification

| File | Authorized Changes |
|------|-------------------|
| `/src/types/index.ts` | Update `LinkCardProps` interface (lines 403-409) |
| `/src/components/LinkCard.tsx` | Update component to accept and use translation props |

### Functions/Sections Authorized for Modification

| File | Function/Section | Change Description |
|------|------------------|-------------------|
| `/src/types/index.ts` | `LinkCardProps` interface | Add `originalTitle`, `showOriginal`, `isTranslated` props |
| `/src/components/LinkCard.tsx` | `LinkCard` function signature | Add new props with defaults |
| `/src/components/LinkCard.tsx` | Title rendering (line 128-130) | Use derived `displayTitle` |
| `/src/components/LinkCard.tsx` | Image alt text (line 78) | Use `displayTitle` for alt |

### Files NOT to Modify

- `/src/components/ItemDisplay.tsx` - Will be updated in REQ-352
- Any test files - Testing is a separate task
- Any API routes - Not relevant to this UI change

---

## Technical Considerations

### Backward Compatibility

The new props are all optional with sensible defaults:
- `originalTitle`: undefined (not used)
- `showOriginal`: false (show translated title by default)
- `isTranslated`: false (assume not translated)

Existing usages of LinkCard will continue to work without changes.

### Performance

- No additional API calls
- No additional state management
- Simple prop-based conditional rendering
- No measurable performance impact

### Accessibility

- Alt text updated to use the displayed title for screen readers
- No changes to keyboard navigation or focus management
- Maintains existing ARIA attributes

---

## Dependencies

### Required Before Implementation

| Dependency | Source | Status |
|------------|--------|--------|
| `SupportedLanguage` type | `/src/contexts/LocaleContext.tsx` | Available |
| `LinkCardProps` interface | `/src/types/index.ts` | Exists (to be extended) |

### Required After Implementation

| Consumer | Task |
|----------|------|
| ItemDisplay component update | REQ-352 (Phase 5.2) |
| Integration testing | REQ-355+ (Testing phase) |

---

## Testing Checklist

- [ ] Component renders correctly with only required props (backward compatibility)
- [ ] Component displays `title` when `showOriginal=false`
- [ ] Component displays `originalTitle` when `showOriginal=true` and `originalTitle` provided
- [ ] Component falls back to `title` when `showOriginal=true` but `originalTitle` undefined
- [ ] Image alt text reflects the displayed title
- [ ] TypeScript compilation succeeds with updated interface
- [ ] No visual regressions in existing link card styling

---

## Acceptance Criteria

1. **AC-1:** LinkCard accepts optional `originalTitle`, `showOriginal`, and `isTranslated` props
2. **AC-2:** When `showOriginal=true` and `originalTitle` is provided, the component displays the original title
3. **AC-3:** When `showOriginal=false` or `originalTitle` is undefined, the component displays the translated `title`
4. **AC-4:** Existing usages of LinkCard continue to work without modification
5. **AC-5:** Image alt text uses the displayed title value

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 5.3)
- **Epic 4 PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Existing Component:** `/src/components/LinkCard.tsx`
- **Type Definitions:** `/src/types/index.ts`
- **LocaleContext:** `/src/contexts/LocaleContext.tsx`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 5, Task 5.3*
