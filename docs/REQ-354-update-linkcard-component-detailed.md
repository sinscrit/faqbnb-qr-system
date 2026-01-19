# REQ-354: Update LinkCard Component with Translation Support - Detailed Task Breakdown

**Last Modified:** 2026-01-19 16:45 UTC
**Request Type:** ENHANCEMENT
**Size:** S (Small)
**Phase:** 5 - Update Guest Pages
**Task ID:** 5.3
**Dependencies:** REQ-350 (useGuestLanguage hook), Epic 1 L10N types
**Overview Document:** docs/REQ-354-update-linkcard-component-overview.md

---

## Executive Summary

This document provides a detailed, step-by-step task breakdown for enhancing the LinkCard component to support translation display. The component will accept translated link titles and display them based on guest language preferences, with the ability to toggle between translated and original content.

---

## Pre-Implementation Checklist

Before starting implementation, verify these dependencies are in place:

- [ ] `SupportedLanguage` type exists in `/src/contexts/LocaleContext.tsx`
- [ ] `LinkCardProps` interface exists in `/src/types/index.ts` (lines 403-409)
- [ ] `LinkCard.tsx` component exists at `/src/components/LinkCard.tsx`
- [ ] Build passes with `npm run build`
- [ ] Tests pass with `npm test`

---

## Task Breakdown

### Task 1: Update LinkCardProps Interface in Types File

**File:** `/src/types/index.ts`
**Lines to Modify:** 403-409
**Estimated Effort:** 1 story point
**Risk Level:** Low

#### 1.1 Current State

```typescript
// Lines 403-409 in /src/types/index.ts
export interface LinkCardProps {
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  onClick: () => void;
}
```

#### 1.2 Target State

```typescript
export interface LinkCardProps {
  /** Link title (translated when available) */
  title: string;
  /** Type of link for icon/badge display */
  linkType: LinkType;
  /** URL to navigate to when clicked */
  url: string;
  /** Optional thumbnail image URL */
  thumbnailUrl?: string;
  /** Click handler for link navigation */
  onClick: () => void;
  // Translation support props
  /** Original title in source language (when showing translation) */
  originalTitle?: string;
  /** Whether to show the original title instead of translated title */
  showOriginal?: boolean;
  /** Whether this title is a translation */
  isTranslated?: boolean;
}
```

#### 1.3 Implementation Steps

1. Open `/src/types/index.ts`
2. Locate the `LinkCardProps` interface (approximately lines 403-409)
3. Add three new optional properties after `onClick`:
   - `originalTitle?: string;` - The original language title
   - `showOriginal?: boolean;` - Flag to toggle display mode
   - `isTranslated?: boolean;` - Flag indicating translation status
4. Add JSDoc comments to all properties for clarity
5. Save the file

#### 1.4 Verification

```bash
# Verify TypeScript compilation
npx tsc --noEmit

# Expected: No errors related to LinkCardProps
```

---

### Task 2: Update LinkCard Component Function Signature

**File:** `/src/components/LinkCard.tsx`
**Line to Modify:** 8
**Estimated Effort:** 1 story point
**Risk Level:** Low

#### 2.1 Current State

```typescript
// Line 8 in /src/components/LinkCard.tsx
export default function LinkCard({ title, linkType, url, thumbnailUrl, onClick }: LinkCardProps) {
```

#### 2.2 Target State

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

#### 2.3 Implementation Steps

1. Open `/src/components/LinkCard.tsx`
2. Locate the function signature (line 8)
3. Destructure the three new props with default values:
   - `originalTitle` - no default (undefined)
   - `showOriginal = false` - default to showing translated content
   - `isTranslated = false` - default to assuming not translated
4. Format across multiple lines for readability

#### 2.4 Verification

```bash
# Verify TypeScript compilation
npx tsc --noEmit

# Expected: No errors in LinkCard.tsx
```

---

### Task 3: Add Display Title Derivation Logic

**File:** `/src/components/LinkCard.tsx`
**Location:** After line 10 (after useState declarations)
**Estimated Effort:** 1 story point
**Risk Level:** Low

#### 3.1 Current State

```typescript
// Lines 9-10 in /src/components/LinkCard.tsx
const [imageError, setImageError] = useState(false);
const [imageLoading, setImageLoading] = useState(true);
```

#### 3.2 Target State

```typescript
const [imageError, setImageError] = useState(false);
const [imageLoading, setImageLoading] = useState(true);

// Derive the title to display based on showOriginal toggle
// Falls back to translated title if original is not provided
const displayTitle = showOriginal && originalTitle ? originalTitle : title;
```

#### 3.3 Implementation Steps

1. Open `/src/components/LinkCard.tsx`
2. After the `useState` declarations (after line 10)
3. Add the `displayTitle` derived variable:
   ```typescript
   const displayTitle = showOriginal && originalTitle ? originalTitle : title;
   ```
4. Add a comment explaining the logic

#### 3.4 Logic Explanation

| `showOriginal` | `originalTitle` | Result |
|----------------|-----------------|--------|
| `false` | undefined | Shows `title` (translated) |
| `false` | "Original Text" | Shows `title` (translated) |
| `true` | undefined | Shows `title` (fallback) |
| `true` | "Original Text" | Shows `originalTitle` |

---

### Task 4: Update Title Display in Render

**File:** `/src/components/LinkCard.tsx`
**Lines to Modify:** 128-130
**Estimated Effort:** 1 story point
**Risk Level:** Low

#### 4.1 Current State

```tsx
// Lines 127-131 in /src/components/LinkCard.tsx
<div className="p-4">
  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
    {title}
  </h3>
```

#### 4.2 Target State

```tsx
<div className="p-4">
  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
    {displayTitle}
  </h3>
```

#### 4.3 Implementation Steps

1. Open `/src/components/LinkCard.tsx`
2. Locate the `<h3>` element containing `{title}` (approximately line 129)
3. Replace `{title}` with `{displayTitle}`
4. Save the file

#### 4.4 Verification

- The change should be a single line modification
- Ensures title display respects the showOriginal toggle

---

### Task 5: Update Image Alt Text for Accessibility

**File:** `/src/components/LinkCard.tsx`
**Line to Modify:** 78
**Estimated Effort:** 1 story point
**Risk Level:** Low

#### 5.1 Current State

```tsx
// Line 78 in /src/components/LinkCard.tsx
alt={`${title} preview`}
```

#### 5.2 Target State

```tsx
alt={`${displayTitle} preview`}
```

#### 5.3 Implementation Steps

1. Open `/src/components/LinkCard.tsx`
2. Locate the `<img>` element's `alt` attribute (approximately line 78)
3. Replace `${title}` with `${displayTitle}` in the template string
4. Save the file

#### 5.4 Accessibility Note

This ensures screen readers announce the correct title based on the current display mode, providing a consistent experience for all users.

---

### Task 6: Update Console Warning to Use displayTitle

**File:** `/src/components/LinkCard.tsx`
**Line to Modify:** 57
**Estimated Effort:** 0.5 story point
**Risk Level:** Very Low

#### 6.1 Current State

```typescript
// Line 57 in /src/components/LinkCard.tsx
console.warn(`Failed to load thumbnail for: ${title}`, { thumbnailUrl, url, linkType });
```

#### 6.2 Target State

```typescript
console.warn(`Failed to load thumbnail for: ${displayTitle}`, { thumbnailUrl, url, linkType });
```

#### 6.3 Implementation Steps

1. Open `/src/components/LinkCard.tsx`
2. Locate the `handleImageError` function (approximately line 57)
3. Replace `${title}` with `${displayTitle}` in the console.warn
4. Save the file

#### 6.4 Rationale

Console warnings should reflect the displayed title for easier debugging when investigating thumbnail loading issues.

---

## Complete Modified Files

### File 1: `/src/types/index.ts` (Partial)

```typescript
// Lines 402-420 (after modification)

// Component props types
export interface LinkCardProps {
  /** Link title (translated when available) */
  title: string;
  /** Type of link for icon/badge display */
  linkType: LinkType;
  /** URL to navigate to when clicked */
  url: string;
  /** Optional thumbnail image URL */
  thumbnailUrl?: string;
  /** Click handler for link navigation */
  onClick: () => void;
  // Translation support props
  /** Original title in source language (when showing translation) */
  originalTitle?: string;
  /** Whether to show the original title instead of translated title */
  showOriginal?: boolean;
  /** Whether this title is a translation */
  isTranslated?: boolean;
}
```

### File 2: `/src/components/LinkCard.tsx` (Partial - Key Changes)

```typescript
// Updated function signature (line 8)
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
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Derive the title to display based on showOriginal toggle
  const displayTitle = showOriginal && originalTitle ? originalTitle : title;

  // ... rest of component ...

  // Updated handleImageError (line ~60)
  const handleImageError = () => {
    console.warn(`Failed to load thumbnail for: ${displayTitle}`, { thumbnailUrl, url, linkType });
    setImageError(true);
    setImageLoading(false);
  };

  // ... in return statement ...

  // Updated img alt (line ~78)
  <img
    src={thumbnailSrc}
    alt={`${displayTitle} preview`}
    // ... other props
  />

  // Updated h3 content (line ~129)
  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
    {displayTitle}
  </h3>
```

---

## Verification Checklist

### Compile-Time Verification

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] No TypeScript errors in IDE for modified files
- [ ] All imports resolve correctly

### Runtime Verification

- [ ] Component renders correctly with only required props (backward compatibility)
- [ ] Component displays `title` when `showOriginal=false`
- [ ] Component displays `originalTitle` when `showOriginal=true` and `originalTitle` provided
- [ ] Component falls back to `title` when `showOriginal=true` but `originalTitle` is undefined
- [ ] Image alt text reflects the displayed title
- [ ] Console warnings use the displayed title

### Visual Verification

- [ ] No visual regressions in existing link card styling
- [ ] Title display maintains proper truncation (line-clamp-2)
- [ ] Hover states work correctly

---

## Test Scenarios

### Scenario 1: Backward Compatibility (No Translation Props)

```tsx
<LinkCard
  title="Original Video Title"
  linkType="youtube"
  url="https://youtube.com/watch?v=abc123"
  onClick={() => {}}
/>
// Expected: Displays "Original Video Title"
```

### Scenario 2: Translated Content (showOriginal=false)

```tsx
<LinkCard
  title="Titre Vidéo Traduit"
  originalTitle="Original Video Title"
  linkType="youtube"
  url="https://youtube.com/watch?v=abc123"
  showOriginal={false}
  isTranslated={true}
  onClick={() => {}}
/>
// Expected: Displays "Titre Vidéo Traduit"
```

### Scenario 3: Show Original Toggle Active

```tsx
<LinkCard
  title="Titre Vidéo Traduit"
  originalTitle="Original Video Title"
  linkType="youtube"
  url="https://youtube.com/watch?v=abc123"
  showOriginal={true}
  isTranslated={true}
  onClick={() => {}}
/>
// Expected: Displays "Original Video Title"
```

### Scenario 4: Show Original Without Original Title (Fallback)

```tsx
<LinkCard
  title="Some Title"
  linkType="text"
  url="https://example.com"
  showOriginal={true}
  // originalTitle not provided
  onClick={() => {}}
/>
// Expected: Displays "Some Title" (fallback to title prop)
```

---

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate Rollback:**
   - Revert the two modified files to their previous state
   - The component is fully backward compatible, so existing usages continue to work

2. **Files to Revert:**
   - `/src/types/index.ts` - Remove the three new optional props from `LinkCardProps`
   - `/src/components/LinkCard.tsx` - Revert to using `title` directly

3. **Verification After Rollback:**
   - Run `npm run build` to confirm build success
   - Run `npm test` to confirm test suite passes

---

## Future Integration Notes

Once this task is complete, the following components will use the new translation props:

1. **ItemDisplay.tsx (REQ-352)** - Will pass translation props when rendering links:
   ```tsx
   <LinkCard
     key={link.id}
     title={link.title}                      // Translated title
     originalTitle={link.originalTitle}      // Original title
     linkType={link.linkType}
     url={link.url}
     thumbnailUrl={link.thumbnailUrl}
     showOriginal={showOriginal}             // From useGuestLanguage hook
     isTranslated={link.isTranslated}        // From translation metadata
     onClick={() => handleLinkClick(link.url, link.linkType)}
   />
   ```

2. **TranslatedLink type** - Will provide the `originalTitle` and `isTranslated` properties
3. **useGuestLanguage hook** - Will provide the `showOriginal` state

---

## Acceptance Criteria Verification

| Criteria | Task | Verification Method |
|----------|------|---------------------|
| AC-1: Component accepts translated title prop | Task 1 | TypeScript compilation |
| AC-2: Component displays translated title by default | Task 4 | Manual testing |
| AC-3: Component responds to view-original toggle | Tasks 3, 4 | Manual testing |
| AC-4: Component displays original when no translation | Task 3 | Manual testing |
| AC-5: Handles undefined/null gracefully | Task 3 | Manual testing |
| AC-6: No layout shift on title update | Task 4 | Visual inspection |
| AC-7: Maintains existing styling | All | Visual inspection |
| AC-8: TypeScript types updated | Task 1 | TypeScript compilation |
| AC-9: Preserves existing functionality | All | Regression testing |

---

## Summary

| Task | Description | File | Lines | Risk |
|------|-------------|------|-------|------|
| 1 | Update LinkCardProps interface | `/src/types/index.ts` | 403-409 | Low |
| 2 | Update function signature | `/src/components/LinkCard.tsx` | 8 | Low |
| 3 | Add displayTitle derivation | `/src/components/LinkCard.tsx` | After 10 | Low |
| 4 | Update title display | `/src/components/LinkCard.tsx` | 129 | Low |
| 5 | Update image alt text | `/src/components/LinkCard.tsx` | 78 | Low |
| 6 | Update console warning | `/src/components/LinkCard.tsx` | 57 | Very Low |

**Total Estimated Effort:** 5.5 story points (Small enhancement)

---

## References

- **Overview Document:** `/docs/REQ-354-update-linkcard-component-overview.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md` (Task 5.3)
- **Requirements:** `/docs/gen_requests_epic4.md` (REQ-354)
- **Epic 4 PRD:** `/docs/prd/PRD_L10N_Epic4_Guest_Experience.md`
- **Existing Component:** `/src/components/LinkCard.tsx`
- **Type Definitions:** `/src/types/index.ts`

---

*Document generated for FAQBNB Localization Epic 4 - Guest Experience, Phase 5, Task 5.3*
