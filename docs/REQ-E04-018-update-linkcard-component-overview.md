# Technical Lead Implementation Breakdown

| Field | Value |
|-------|-------|
| Request ID | REQ-E04-018 |
| Title | Update LinkCard Component |
| Category | Feature Request |
| Status | PENDING |
| Priority | Medium |
| Last Modified | 2026-01-22 19:37 |
| Phase | 5 - Update Guest Pages |
| Task ID | 5.3 |
| T-Shirt Size | S |
| Estimated Hours | 2-3 hours |

---

## Goals

Update the LinkCard component to support displaying either translated or original link titles based on guest user preferences. When a guest toggles "View Original", link cards should display the original title instead of the translated version.

**Success Criteria:**
- LinkCard accepts optional `originalTitle` prop
- LinkCard accepts `showOriginal` state from parent
- Component displays translated title by default
- Component displays original title when `showOriginal` is true
- Maintains backward compatibility (works without new props)
- No visual changes to card layout or styling
- TypeScript types remain strict with no errors

---

## Implementation Plan

### 1. Update LinkCardProps Interface

**File:** `/src/components/LinkCard.tsx`
**Lines:** ~1-11 (interface definition)

```typescript
interface LinkCardProps {
  title: string;
  originalTitle?: string;
  showOriginal?: boolean;
  linkType: string;
  url: string;
  thumbnailUrl?: string | null;
  onClick?: () => void;
}
```

**Changes:**
- Add `originalTitle?: string` - The original untranslated title
- Add `showOriginal?: boolean` - Whether to display original vs translated content

### 2. Update Component Signature and Display Logic

**File:** `/src/components/LinkCard.tsx`
**Lines:** ~8 (component signature), ~129 (title display)

```typescript
export default function LinkCard({
  title,
  originalTitle,
  showOriginal = false,
  linkType,
  url,
  thumbnailUrl,
  onClick
}: LinkCardProps) {
  // ... existing state and handlers ...

  // Determine which title to display
  const displayTitle = showOriginal && originalTitle ? originalTitle : title;

  return (
    <div className="...">
      {/* ... existing thumbnail/icon logic ... */}

      {/* Update line ~129 */}
      {displayTitle}

      {/* ... existing badge logic ... */}
    </div>
  );
}
```

**Changes:**
- Add `originalTitle` and `showOriginal` to destructured props
- Default `showOriginal` to `false` for backward compatibility
- Calculate `displayTitle` based on `showOriginal` and `originalTitle` presence
- Replace `{title}` with `{displayTitle}` on line ~129

### 3. Update Parent Component (ItemDisplay)

**File:** `/src/components/ItemDisplay.tsx`
**Lines:** Links section (~165-200 based on REQ-E04-017 changes)

```typescript
// Inside ItemDisplay component, links mapping section
{sortedLinks.map((link) => (
  <LinkCard
    key={link.id}
    title={link.title}
    originalTitle={link.originalTitle}
    showOriginal={showOriginal}
    linkType={link.linkType}
    url={link.url}
    thumbnailUrl={link.thumbnailUrl}
    onClick={() => handleLinkClick(link)}
  />
))}
```

**Changes:**
- Pass `originalTitle={link.originalTitle}` to each LinkCard
- Pass `showOriginal={showOriginal}` from useGuestLanguage hook

### 4. Update Item Type Definition (if needed)

**File:** Check existing type definitions in `/src/types/` or inline in ItemDisplay.tsx

Ensure the `Link` type includes `originalTitle`:

```typescript
interface Link {
  id: string;
  title: string;
  originalTitle?: string;  // Add if missing
  linkType: string;
  url: string;
  thumbnailUrl?: string | null;
  displayOrder: number;
}
```

**Note:** This may already exist from backend changes in earlier Epic 4 tasks.

---

## Authorized Files and Functions for Modification

### Primary Files

1. **`/src/components/LinkCard.tsx`**
   - **Interface:** `LinkCardProps` (~lines 1-11)
     - ADD property: `originalTitle?: string`
     - ADD property: `showOriginal?: boolean`
   - **Component:** `LinkCard` function (~line 8)
     - UPDATE signature to destructure new props
     - ADD logic to calculate `displayTitle`
     - UPDATE JSX to use `displayTitle` instead of `title` (~line 129)

### Secondary Files (Integration)

2. **`/src/components/ItemDisplay.tsx`**
   - **Component:** Links mapping section (~lines 165-200)
     - UPDATE LinkCard usage to pass `originalTitle` prop
     - UPDATE LinkCard usage to pass `showOriginal` prop from useGuestLanguage hook

### Type Definitions (Verification Only)

3. **Check `/src/types/` or component inline types**
   - Verify `Link` interface includes `originalTitle?: string`
   - No changes needed if property already exists from backend work

---

## Dependencies

### Depends On:
- **REQ-E04-014** - Create useGuestLanguage hook (provides `showOriginal` state)
- **REQ-E04-017** - Update ItemDisplay component (integration point for showOriginal)
- **Backend:** Item links must include `originalTitle` field in API responses

### Blocks:
- None (leaf task in guest experience feature tree)

### Parallel Safety:
- **SAFE** - Can be implemented in parallel with:
  - REQ-E04-019 (Update ItemArticleCard if exists)
  - Any other component updates that consume translation state

---

## Technical Risks and Considerations

### Risk: Missing originalTitle Data

**Issue:** If API doesn't return `originalTitle`, component will always show translated title even when `showOriginal` is true.

**Mitigation:**
- Use optional chaining: `const displayTitle = showOriginal && originalTitle ? originalTitle : title;`
- Component gracefully falls back to translated title if original is unavailable
- Document this behavior in code comments

### Risk: Inconsistent Display State

**Issue:** If `showOriginal` prop is not passed from parent, toggle won't work.

**Mitigation:**
- Default `showOriginal` to `false` in component signature
- Component works correctly without the prop (shows translated title)
- Integration testing with ItemDisplay to verify state flow

### Risk: Type Safety

**Issue:** TypeScript errors if Link type doesn't include originalTitle.

**Mitigation:**
- Verify Link type definition includes `originalTitle?: string`
- Update type definition if missing (coordinate with backend team)
- Run `npm run typecheck` to catch issues early

---

## Testing Strategy

### Unit Tests

Create `/src/components/__tests__/LinkCard.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import LinkCard from '../LinkCard';

describe('LinkCard', () => {
  const defaultProps = {
    title: 'Traduit',
    linkType: 'website',
    url: 'https://example.com',
  };

  it('displays translated title by default', () => {
    render(<LinkCard {...defaultProps} />);
    expect(screen.getByText('Traduit')).toBeInTheDocument();
  });

  it('displays translated title when showOriginal is false', () => {
    render(
      <LinkCard
        {...defaultProps}
        originalTitle="Original"
        showOriginal={false}
      />
    );
    expect(screen.getByText('Traduit')).toBeInTheDocument();
  });

  it('displays original title when showOriginal is true', () => {
    render(
      <LinkCard
        {...defaultProps}
        originalTitle="Original"
        showOriginal={true}
      />
    );
    expect(screen.getByText('Original')).toBeInTheDocument();
  });

  it('falls back to translated title if originalTitle is missing', () => {
    render(
      <LinkCard
        {...defaultProps}
        showOriginal={true}
      />
    );
    expect(screen.getByText('Traduit')).toBeInTheDocument();
  });

  it('maintains backward compatibility without new props', () => {
    render(<LinkCard {...defaultProps} />);
    expect(screen.getByText('Traduit')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test with ItemDisplay component:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemDisplay from '../ItemDisplay';

describe('ItemDisplay - LinkCard Integration', () => {
  const mockItem = {
    id: '1',
    name: 'Test Item',
    links: [
      {
        id: 'link1',
        title: 'Lien Traduit',
        originalTitle: 'Original Link',
        linkType: 'website',
        url: 'https://example.com',
        displayOrder: 1,
      },
    ],
  };

  const mockTranslationMeta = {
    requestedLanguage: 'fr',
    displayLanguage: 'fr',
    availableLanguages: ['en', 'fr'],
    isTranslated: true,
    originalLanguage: 'en',
  };

  it('shows translated link titles by default', () => {
    render(
      <ItemDisplay
        item={mockItem}
        translationMeta={mockTranslationMeta}
      />
    );
    expect(screen.getByText('Lien Traduit')).toBeInTheDocument();
  });

  it('shows original link titles when View Original is toggled', async () => {
    const user = userEvent.setup();
    render(
      <ItemDisplay
        item={mockItem}
        translationMeta={mockTranslationMeta}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /view in original/i });
    await user.click(toggleButton);

    expect(screen.getByText('Original Link')).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

- [ ] Link cards display translated titles by default
- [ ] Clicking "View in original (English)" toggles link titles to original
- [ ] Clicking "View translation" toggles link titles back to translated
- [ ] Link cards without originalTitle gracefully show translated title
- [ ] No visual layout changes or styling differences
- [ ] TypeScript compilation succeeds with no errors
- [ ] Component works in pages without translationMeta prop (backward compatibility)
- [ ] Mobile responsive behavior unchanged
- [ ] Link click handlers still work correctly

---

## Out of Scope

The following are explicitly NOT part of this task:

1. **Article Card Updates** - Handled separately in REQ-E04-019 (if exists)
2. **Visual Design Changes** - No styling modifications to LinkCard
3. **New Analytics** - No tracking for which title version is displayed
4. **Tooltip/Label Changes** - No additional UI elements beyond title swap
5. **Backend Changes** - Assumes `originalTitle` already exists in API responses
6. **Link Description Translation** - Only title is affected by toggle
7. **Badge Translation** - Link type badges remain in current language

---

## Notes

- **Minimal Scope:** This is a focused S-sized task (2-3 hours) with minimal code changes
- **Backward Compatibility:** Component must work without new props for non-translated pages
- **Integration Point:** Requires ItemDisplay to pass `showOriginal` state from useGuestLanguage hook
- **Data Dependency:** Effectiveness depends on backend providing `originalTitle` in link objects
- **User Experience:** Title swaps happen instantly with toggle - no loading state needed
- **Consistency:** Follows same pattern as other content elements (item name, description, articles)

---

**Status:** PENDING

**Next Steps:**
1. Verify Link type definition includes `originalTitle` field
2. Update LinkCardProps interface
3. Implement display logic
4. Update ItemDisplay integration
5. Write unit tests
6. Perform manual testing with real translated content
7. Run typecheck and fix any type errors
8. Commit changes following git conventions
