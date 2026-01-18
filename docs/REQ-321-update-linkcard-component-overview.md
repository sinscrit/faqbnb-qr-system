# Implementation Overview: Update LinkCard Component for Translation Support

## Header

| Field | Value |
|-------|-------|
| Request Reference | #321 |
| Source File | docs/gen_requests_epic4.md |
| Implementation Plan | docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md |
| Original Request Date | 2026-01-18 |
| Breakdown Created | 2026-01-18 |
| T-shirt Size | S |
| Estimated Effort | 2-4 hours |
| Phase | 5 - Update Guest Pages |
| Task ID | 5.3 |

## Goals

Enhance the `LinkCard` component to support translated content display within the guest-facing localization experience. The component should:

1. **Accept Translated Title**: Add a new prop for the translated title alongside the original title
2. **Display Logic**: Show translated title by default when available, switch to original when toggle is on
3. **Toggle Support**: Respond to the "View Original" toggle state from parent component
4. **Graceful Degradation**: Display original title when no translation is provided

### Assumptions & Clarifications

- The `showOriginal` state is managed by the parent component (`ItemDisplay`) via the `useGuestLanguage` hook
- The `LinkCard` component does not manage its own translation state; it receives the toggle state as a prop
- The translated title comes from the `link_translations` table (Epic 1/3 dependency)
- URLs are never translated (only titles are localized)
- When `translatedTitle` is `null`, `undefined`, or an empty string, the original title is always shown regardless of `showOriginal` state
- No refetch is needed when toggling; content switching is purely client-side

## Implementation Plan

### Step 1: Update LinkCardProps Interface

- **Description**: Extend the `LinkCardProps` interface in `/src/types/index.ts` to include two new optional props: `translatedTitle` and `showOriginal`
- **Rationale**: Type safety requires defining the new props before using them in the component
- **Estimated Effort**: XS (15 minutes)

### Step 2: Update LinkCard Component Display Logic

- **Description**: Modify the title rendering logic in `LinkCard.tsx` to:
  1. Check if `translatedTitle` is provided and non-empty
  2. Check the `showOriginal` prop value
  3. Display the appropriate title based on the conditions
- **Rationale**: Core functionality to support translation display
- **Estimated Effort**: S (30 minutes)

### Step 3: Update Alt Text for Accessibility

- **Description**: Update the image `alt` attribute to use the displayed title (translated or original) for consistent accessibility
- **Rationale**: Screen readers should announce the same title that is visually displayed
- **Estimated Effort**: XS (15 minutes)

### Step 4: Test Edge Cases

- **Description**: Verify behavior for edge cases:
  - `translatedTitle` is `undefined` (original shown)
  - `translatedTitle` is `null` (original shown)
  - `translatedTitle` is empty string `""` (original shown)
  - `showOriginal` is `true` with valid translation (original shown)
  - `showOriginal` is `false` with valid translation (translated shown)
  - `showOriginal` not provided (defaults to false, translation shown if available)
- **Rationale**: Ensure robust handling of all possible prop combinations
- **Estimated Effort**: S (30-60 minutes)

### Step 5: Update Parent Component Integration

- **Description**: Ensure the `ItemDisplay` component passes the `translatedTitle` and `showOriginal` props to `LinkCard` when rendering links
- **Rationale**: Component must receive props from parent to function correctly
- **Estimated Effort**: S (30 minutes)

## Authorized Files and Functions for Modification

> **APPROVED SCOPE**: Changes outside this list require review

### Type Definitions

| File | Target | Type | Change Description |
|------|--------|------|-------------------|
| `src/types/index.ts` | `LinkCardProps` | Modify | Add `translatedTitle?: string` and `showOriginal?: boolean` props |

### Core Component

| File | Target | Type | Change Description |
|------|--------|------|-------------------|
| `src/components/LinkCard.tsx` | `LinkCard` | Modify | Update title display logic to support translation toggle |

### Parent Component (Context for Integration)

| File | Target | Type | Change Description |
|------|--------|------|-------------------|
| `src/components/ItemDisplay.tsx` | `ItemDisplay` | Modify (if needed) | Pass `translatedTitle` and `showOriginal` props to LinkCard instances |

## Code Changes Detail

### Updated LinkCardProps Interface

```typescript
// src/types/index.ts
export interface LinkCardProps {
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  onClick: () => void;
  /** Translated title for internationalization support */
  translatedTitle?: string | null;
  /** When true, display original title instead of translated title */
  showOriginal?: boolean;
}
```

### Updated LinkCard Component Logic

```typescript
// src/components/LinkCard.tsx

// Determine which title to display
const displayTitle = useMemo(() => {
  // If showOriginal is true, always show original
  if (showOriginal) {
    return title;
  }
  // If translated title is available and non-empty, show it
  if (translatedTitle && translatedTitle.trim() !== '') {
    return translatedTitle;
  }
  // Fallback to original title
  return title;
}, [title, translatedTitle, showOriginal]);
```

## Dependencies

### Internal Dependencies

- **REQ-320**: Update ItemDisplay Component for Guest Translation Support - Parent component that manages translation state and passes props to LinkCard
- **REQ-317**: useGuestLanguage Hook - Provides the `showOriginal` state that gets passed down to LinkCard
- **Epic 1**: Translation Tables - `link_translations` table must exist with translated title data
- **Epic 3**: Dynamic Content Translation - Translation data must be populated in the database

### External Dependencies

- None - Uses only existing React and TypeScript patterns

## Risks and Considerations

### Potential Side Effects

1. **Backward Compatibility**: Components using `LinkCard` without translation props will continue to work unchanged (props are optional with sensible defaults)
2. **Performance**: Adding the `useMemo` hook has negligible performance impact; the condition check is O(1)
3. **Type Changes**: Any TypeScript consumers importing `LinkCardProps` will see the new optional props in autocomplete

### Testing Requirements

1. **Unit Tests**: Test title display logic with various prop combinations
2. **Visual Tests**: Verify title renders correctly in both original and translated states
3. **Integration Tests**: Verify toggle from `ItemDisplay` correctly updates all `LinkCard` instances
4. **Accessibility Tests**: Verify screen readers announce the correct title

### No Breaking Changes

- All existing usages of `LinkCard` remain valid
- New props are optional with default behavior matching current behavior
- No changes to URL handling, thumbnail logic, or click behavior

## Out of Scope

Per original request (REQ-321) and implementation plan (Plan-111):

1. **URL Translation**: URLs are never translated per design decision
2. **Thumbnail Translation**: Thumbnails are visual and language-independent
3. **Translation Fetching**: This component does not fetch translations; it receives them as props
4. **Translation State Management**: Managed by parent component and `useGuestLanguage` hook
5. **Language Switcher Integration**: Handled at the `ItemDisplay` level, not in `LinkCard`

## Related Documentation

- **Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Definition**: `/docs/gen_requests_epic4.md` (REQ-321)
- **Parent Component REQ**: REQ-320 (Update ItemDisplay Component)
- **Hook REQ**: REQ-317 (Create useGuestLanguage Hook)
- **Type Definitions**: `/src/types/index.ts`

---
*Document generated: 2026-01-18*
