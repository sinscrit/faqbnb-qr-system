# REQ-320: Update ItemDisplay Component for Guest Translation Support

**Last Modified:** 2026-01-18 15:30:00 UTC
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Phase:** 5 - Update Guest Pages
**Task ID:** 5.2
**Implementation Plan Reference:** [Plan-111-L10N-Epic4-Guest-Experience.md](./prd/Plan-111-L10N-Epic4-Guest-Experience.md)
**Depends On:** REQ-311 (GuestLanguageSwitcher), REQ-312 (TranslationBanner), REQ-313 (MissingTranslationBanner), REQ-317 (useGuestLanguage hook), REQ-319 (Guest Item Page Server Component)

---

## Summary

The ItemDisplay component must be enhanced to render translated content when available, provide guests with language switching controls, and display informational banners indicating translation status. This task transforms the existing client component into a translation-aware display that integrates with the guest language preference system.

---

## Current Behavior

The `ItemDisplay` component at `/src/components/ItemDisplay.tsx`:
- Renders item content using only the original source language data provided via `item` prop
- Displays item name, description, and links/articles in their original language
- Has no awareness of translation metadata, language preferences, or alternative language versions
- Guests viewing items have no visual indication that translations exist
- No ability to switch between languages from within the item display interface

**Current Component Structure:**
- Accepts `ItemDisplayProps` containing `item: ItemResponse['data']`
- Manages visit tracking, reactions, and lightbox state internally
- Header section with logo, item name, and visit counter
- Description section (optional)
- Reaction buttons section
- Links/Articles grid section
- Footer section with branding

---

## Expected Behavior

### Translation Integration
1. Accept new `translationMeta` prop containing source language, target language, translation status, and available languages
2. Accept `availableLanguages` prop indicating which translations exist for the current item
3. Accept original content alongside current content to support toggle functionality
4. Integrate `useGuestLanguage` hook to manage language state and preferences

### Header Enhancement
1. Add `GuestLanguageSwitcher` component to the header area (right side, before visit counter)
2. Language switcher shows all 6 supported languages with availability indicators
3. Current language displayed with flag icon

### Translation Banners
1. Display `TranslationBanner` when showing content in a translated language
   - Light blue banner with globe icon
   - Text: "Translated from [Language]"
   - "View original" action link
2. Display `MissingTranslationBanner` when guest requested a language without available translation
   - Muted styling with info icon
   - Text: "[Language] translation not available. Showing content in [Source Language]."

### View Toggle Functionality
1. "View original" in TranslationBanner triggers toggle to show source content
2. Client-side state swap between translated and original content (no refetch)
3. Toggle state managed via `useGuestLanguage` hook's `toggleOriginal` function

### Content Display
1. Display `item.name` or `item.originalName` based on toggle state
2. Display `item.description` or `item.originalDescription` based on toggle state
3. Pass appropriate translated/original titles to `LinkCard` components
4. Pass appropriate translated/original content to article sections

### Cookie Persistence
1. Language changes update the `FAQBNB_GUEST_LANG` cookie
2. Cookie persists for 1 year with proper security attributes

---

## User Impact

- Guests viewing item details can immediately see which language translations are available
- Intuitive dropdown interface for switching between languages
- Clear visual feedback confirms translation status via banners
- Instant access to original content for verification or comparison
- Transparent experience with no confusion about whether content is original or translated
- Language preferences are remembered across sessions

---

## Technical Architecture

### Component Flow

```
ItemDisplay (client component)
├── Header
│   ├── Logo
│   ├── Item Name (translated or original)
│   ├── GuestLanguageSwitcher ← NEW
│   └── VisitCounter
├── TranslationBanner (conditional) ← NEW
├── MissingTranslationBanner (conditional) ← NEW
├── Description Section
│   └── Content (translated or original)
├── Reaction Section
├── Links/Articles Section
│   └── LinkCard/ArticleCard (translated or original titles)
└── Footer
```

### State Management

```typescript
// useGuestLanguage hook manages:
{
  currentLanguage: SupportedLanguage;     // Guest's selected language
  showOriginal: boolean;                   // Toggle state
  displayLanguage: SupportedLanguage;      // Effective display language
  setLanguage: (lang) => void;             // Change language preference
  toggleOriginal: () => void;              // Toggle between original/translated
  hasTranslation: (lang) => boolean;       // Check availability
}
```

### Props Interface Extension

```typescript
// Extended ItemDisplayProps
interface ItemDisplayProps {
  item: ItemResponse['data'];
  // NEW: Translation support props
  translationMeta?: {
    sourceLanguage: SupportedLanguage;
    displayLanguage: SupportedLanguage;
    requestedLanguage: SupportedLanguage;
    isShowingTranslation: boolean;
    availableTranslations: SupportedLanguage[];
  };
  // NEW: Original content for toggle support
  originalContent?: {
    name: string;
    description: string | null;
    articles?: Array<{
      id: string;
      title: string;
      description: string | null;
      links: Array<{
        id: string;
        title: string;
      }>;
    }>;
    links?: Array<{
      id: string;
      title: string;
    }>;
  };
}
```

---

## Implementation Tasks

### Task 5.2.1: Extend ItemDisplayProps Type Definition
- Update `/src/types/index.ts` to add translation-related props to `ItemDisplayProps`
- Define `translationMeta` optional prop interface
- Define `originalContent` optional prop interface
- Ensure backward compatibility when translation props are not provided

### Task 5.2.2: Import and Integrate useGuestLanguage Hook
- Import `useGuestLanguage` from `/src/hooks/useGuestLanguage`
- Call hook at component initialization with translation metadata
- Destructure `currentLanguage`, `showOriginal`, `displayLanguage`, `setLanguage`, `toggleOriginal`

### Task 5.2.3: Add GuestLanguageSwitcher to Header
- Import `GuestLanguageSwitcher` from `/src/components/guest`
- Place in header section between item info and VisitCounter
- Pass `currentLanguage`, `availableTranslations`, `sourceLanguage`, `onLanguageChange`
- Style to fit with existing header layout (flex, proper spacing)

### Task 5.2.4: Implement TranslationBanner Display
- Import `TranslationBanner` from `/src/components/guest`
- Add conditional render below header when `translationMeta?.isShowingTranslation && !showOriginal`
- Pass `sourceLanguage`, `displayLanguage`, `onViewOriginal={toggleOriginal}`

### Task 5.2.5: Implement MissingTranslationBanner Display
- Import `MissingTranslationBanner` from `/src/components/guest`
- Add conditional render when requested language differs from display language due to unavailable translation
- Condition: `translationMeta && translationMeta.requestedLanguage !== translationMeta.displayLanguage && !translationMeta.isShowingTranslation`
- Pass `requestedLanguage`, `displayLanguage` (source language)

### Task 5.2.6: Implement Content Toggle Logic
- Update item name display: `showOriginal && originalContent ? originalContent.name : item.name`
- Update description display: `showOriginal && originalContent ? originalContent.description : item.description`
- Create helper function `getDisplayContent()` for clarity

### Task 5.2.7: Update Article/Link Sections for Translation
- Map articles with toggle logic for title/description
- Map links with toggle logic for title
- Pass translated or original titles to `LinkCard` component

### Task 5.2.8: Ensure Backward Compatibility
- All translation props are optional
- Component functions normally when `translationMeta` is not provided
- No visual changes when translation features are not active
- Existing behavior preserved for non-translated items

### Task 5.2.9: Mobile Responsive Adjustments
- Ensure banners stack properly on mobile viewports
- Language switcher adapts to smaller screens
- No horizontal scrolling introduced

### Task 5.2.10: Accessibility Enhancements
- Screen readers announce language changes
- Banners include proper ARIA attributes
- Language switcher is keyboard navigable

---

## Authorized Files and Functions for Modification

### Primary File
| File | Functions/Sections | Modification Type |
|------|-------------------|-------------------|
| `/src/components/ItemDisplay.tsx` | Entire component | MODIFY - Add translation integration |

### Type Definitions
| File | Functions/Sections | Modification Type |
|------|-------------------|-------------------|
| `/src/types/index.ts` | `ItemDisplayProps` interface | MODIFY - Add translation props |

### Dependencies (READ ONLY - do not modify)
| File | Purpose |
|------|---------|
| `/src/hooks/useGuestLanguage.ts` | Language state hook (from REQ-317) |
| `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx` | Language dropdown (from REQ-311) |
| `/src/components/guest/TranslationBanner/TranslationBanner.tsx` | Translation indicator (from REQ-312) |
| `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx` | Missing translation info (from REQ-313) |
| `/src/types/l10n.ts` | Localization types (from REQ-304) |

---

## Acceptance Criteria

- [ ] Component accepts `translationMeta` prop containing source language, target language, and translation status
- [ ] Component accepts `availableLanguages` prop indicating which language translations exist for the current item
- [ ] Component accepts original content props alongside current content to support toggle functionality
- [ ] `useGuestLanguage` hook is integrated and called at component initialization
- [ ] `GuestLanguageSwitcher` component is rendered in the item display header area
- [ ] Language switcher receives available languages from props to show translation availability indicators
- [ ] `TranslationBanner` component appears when displaying content in a translated language
- [ ] `TranslationBanner` receives source language code and displays correct language name
- [ ] `TranslationBanner` "View original" action triggers the toggle callback from useGuestLanguage hook
- [ ] `MissingTranslationBanner` appears when guest language preference differs from displayed language due to unavailable translation
- [ ] `MissingTranslationBanner` receives both requested language and source language to generate correct message
- [ ] Client-side state swap occurs when toggling between original and translated views without refetching
- [ ] Toggle state switches displayed content between original and translated versions instantaneously
- [ ] Language preference changes update the cookie and trigger component re-render with new language content
- [ ] Component properly handles cases where translation is partial or incomplete without breaking layout
- [ ] All banner and switcher components are positioned consistently with the design system
- [ ] Component remains responsive and functional on mobile viewports with appropriate banner stacking
- [ ] Screen readers announce language changes and translation status appropriately
- [ ] Component maintains backward compatibility when translation props are not provided

---

## Design Specifications

### Translation Banner
- Background: Light blue (#E3F2FD)
- Icon: Globe icon (from Lucide)
- Text: 14px, gray (#666)
- Link: Blue, underlined
- Height: 40px
- Position: Below header, full width
- Not dismissible

### Language Switcher Position
- Location: Header right side, before VisitCounter
- Compact mode on mobile (flag + abbreviated code)
- Full mode on desktop (flag + native name)

### Content Toggle
- Instant client-side swap (no loading state needed)
- No visual flash during toggle
- Maintain scroll position during toggle

---

## Testing Considerations

### Manual Testing Scenarios
1. View item with translation available - verify TranslationBanner appears
2. Click "View original" - verify content switches to original language
3. Toggle back to translation - verify content returns to translated version
4. Change language via switcher - verify cookie is updated and content changes
5. Request unavailable translation - verify MissingTranslationBanner appears
6. View item without translation props - verify backward compatibility (no banners, no errors)

### Edge Cases
- Partial translation (some fields translated, others not)
- Very long translated content (ensure no layout break)
- Translation with different text direction (future consideration for RTL)
- Missing original content fallback

### Mobile Testing
- Banners don't overlap content
- Language switcher accessible via touch
- Scrolling behavior normal with banners

---

## Dependencies

### Must Be Completed First
- REQ-304: Localization types file (`/src/types/l10n.ts`)
- REQ-311: GuestLanguageSwitcher component
- REQ-312: TranslationBanner component
- REQ-313: MissingTranslationBanner component
- REQ-316: Barrel exports for guest components
- REQ-317: useGuestLanguage hook
- REQ-319: Guest item page server component (provides translation data)

### Parallel Work Possible With
- REQ-321: Update LinkCard component (can be done in parallel)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hook dependencies not ready | Low | High | Verify REQ-317 completion before starting |
| Guest components not ready | Low | High | Verify REQ-311/312/313 completion before starting |
| Breaking existing item display | Medium | High | Thorough testing of backward compatibility |
| Performance impact from hook | Low | Medium | Hook manages client-side state only, no network calls |
| Layout issues with banners | Medium | Medium | Test with various content lengths and screen sizes |

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- Request Definition: `/docs/gen_requests_epic4.md` (REQ-320)
- Current Component: `/src/components/ItemDisplay.tsx`
- Types: `/src/types/index.ts`
- LinkCard Component: `/src/components/LinkCard.tsx`
