# Generated Requests - Epic 4 (Guest Experience)

This file contains auto-generated feature requests for L10N Epic 4.
Request IDs use format: REQ-E04-XXX

Last Reset: 2026-01-22

---

## REQ-E04-001: Create Localization Types File

**Date**: 2026-01-22 15:55
**Type**: NEW FEATURE
**Size**: S

### Summary
Create a centralized type definition file for guest-facing localization that establishes language support constants, type definitions, and utility functions for multi-language content delivery.

### Current Behavior
The application lacks a formal type system for managing guest language preferences and translated content. There is no centralized definition of supported languages or standardized interfaces for handling localized content in guest-facing features.

### Expected Behavior
The system provides a single source of truth for localization types, including:
- Enumeration of all supported guest languages
- Type-safe interfaces for translated content structures
- Language metadata (native names, display labels, locale codes)
- Utility functions for language validation and selection
- Clear contracts for components consuming localized content

### User Impact
This foundational infrastructure enables property owners and guests to experience the application in their preferred language. Developers gain type safety when implementing localization features, reducing bugs and ensuring consistent behavior across all guest-facing pages.

### Business Value
Establishes the technical foundation for international expansion. Provides a scalable framework that supports adding new languages without refactoring existing code. Reduces development time for future localization features through reusable types and utilities.

### Acceptance Criteria
- [ ] File exists at the specified path with proper TypeScript definitions
- [ ] All supported languages are defined with correct ISO codes and native names
- [ ] Type interfaces accurately model translated content structures
- [ ] Utility functions correctly validate language codes and handle edge cases
- [ ] Type definitions integrate seamlessly with next-intl translation system
- [ ] All exports are properly documented with TSDoc comments
- [ ] TypeScript compiler validates all definitions without errors

---

## REQ-E04-002: Create Guest Language Utility Module

**Date**: 2026-01-22 16:00
**Type**: NEW FEATURE
**Size**: S

### Summary
Create a utility module for detecting, persisting, and managing guest language preferences. This module provides the core functionality for determining which language to display content in for unauthenticated guest users viewing shared items.

### Current Behavior
There is no mechanism for detecting or persisting guest language preferences. Guest users viewing shared content see it in the default language regardless of their browser settings or explicit preferences.

### Expected Behavior
The system provides a comprehensive guest language utility module that:
- Detects preferred language from URL parameters, cookies, or browser Accept-Language header (in priority order)
- Persists language preferences in a cookie for returning guests
- Parses and interprets Accept-Language headers correctly
- Maps browser language codes to supported application languages
- Falls back gracefully when preferred language is unavailable

### User Impact
Guests can view shared content in their preferred language automatically based on their browser settings, or explicitly select a language that persists across visits. This improves accessibility and user experience for international guests.

### Business Value
Enables seamless multi-language support for guest-facing content without requiring user accounts. Supports international property owners who share content with guests speaking different languages. Reduces friction for guests accessing shared property information.

### Acceptance Criteria
- [ ] `detectGuestLanguage(request, urlParam?)` correctly prioritizes URL param > cookie > Accept-Language header > default
- [ ] `setGuestLanguageCookie(language)` sets a properly configured cookie with appropriate expiration
- [ ] `parseAcceptLanguage(header)` correctly parses quality values and returns languages in priority order
- [ ] `mapToSupportedLanguage(code)` maps common browser codes (e.g., 'en-US', 'fr-FR') to supported languages
- [ ] Unsupported language codes fall back to English gracefully
- [ ] All functions are properly typed using types from `/src/types/l10n.ts`
- [ ] Module exports are properly documented with TSDoc comments
- [ ] Unit tests cover edge cases including malformed headers and missing cookies

---

## REQ-E04-003: Update types/index.ts with L10N Exports

**Date**: 2026-01-22 16:05
**Type**: ENHANCEMENT
**Size**: XS

### Summary
Update the central types barrel file to export all localization types from the new `l10n.ts` module, enabling convenient imports throughout the codebase.

### Current Behavior
The `/src/types/index.ts` barrel file does not export localization types. Developers must import directly from `/src/types/l10n.ts` rather than the central types module.

### Expected Behavior
All localization types and constants from `l10n.ts` are re-exported through the central `types/index.ts` barrel file, allowing imports like:
```typescript
import { SupportedLanguage, SUPPORTED_LANGUAGES, TranslatedContent } from '@/types';
```

### User Impact
Developers can import localization types from the standard `@/types` path, maintaining consistency with other type imports in the codebase.

### Business Value
Improves developer experience and codebase consistency. Reduces cognitive load by providing a single import path for all application types.

### Acceptance Criteria
- [ ] `/src/types/index.ts` includes export statement for `l10n.ts` module
- [ ] All public types from `l10n.ts` are accessible via `@/types` import
- [ ] Existing exports in `index.ts` remain unchanged
- [ ] TypeScript compiler validates exports without errors
- [ ] No circular dependency issues introduced

---

## REQ-E04-004: Create Translation Fetch Utilities

**Date**: 2026-01-22 16:10
**Type**: NEW FEATURE
**Size**: M

### Summary
Create a utility module for fetching translated content from the database. This module provides functions to retrieve items, articles, links, and tags with their translations applied for a specific language.

### Current Behavior
There are no dedicated utilities for fetching translated content. Code that needs translated data must implement its own database queries and translation merging logic, leading to duplication and inconsistency.

### Expected Behavior
The system provides a comprehensive translation fetch module that:
- Fetches items with translations merged for a specific language
- Retrieves only translation data when the base item is already loaded
- Batch fetches article translations efficiently
- Batch fetches link translations efficiently
- Batch fetches tag translations efficiently
- Falls back to original content when translations are unavailable
- Handles missing translations gracefully without errors

### User Impact
Guests viewing shared content see properly translated text in their preferred language. The translation system works seamlessly, falling back to original content when translations don't exist.

### Business Value
Centralizes translation fetching logic, reducing code duplication and maintenance burden. Enables efficient batch loading of translations, improving page load performance. Provides a consistent API for all components that need translated content.

### Acceptance Criteria
- [ ] `fetchTranslatedItem(publicId, language)` returns item with translated fields merged
- [ ] `fetchItemTranslations(itemId, language)` returns only translation data for an item
- [ ] `fetchArticleTranslations(articleIds, language)` batch fetches translations for multiple articles
- [ ] `fetchLinkTranslations(linkIds, language)` batch fetches translations for multiple links
- [ ] `fetchTagTranslations(tagKeys, language)` batch fetches translations for tag labels
- [ ] All functions return original content when translation is unavailable
- [ ] Database queries are optimized with proper indexes utilized
- [ ] All functions are properly typed using types from `/src/types/l10n.ts`
- [ ] Error handling covers database connection issues and invalid IDs
- [ ] Unit tests verify translation merging and fallback behavior

---

## REQ-E04-005: Create Public Item API Endpoint with Translation Support

**Date**: 2026-01-22 16:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Create a public API endpoint that serves item content with translations for guest users. This endpoint enables unauthenticated access to shared items with automatic translation merging based on the requested language.

### Current Behavior
There is no public API endpoint for fetching items with translation support. Guest-facing pages cannot easily retrieve translated item content through a standardized API.

### Expected Behavior
The system provides a public API endpoint that:
- Accepts a `lang` query parameter to specify desired language
- Fetches the item by public ID without requiring authentication
- Merges translation data for the requested language
- Returns a standardized `GuestContentResponse` format
- Includes translation metadata (source language, translation status, etc.)
- Falls back to original content when translations unavailable
- Returns appropriate HTTP status codes for errors

### User Impact
Guests can access translated item content through a clean API. Client-side applications can dynamically fetch content in different languages without page reloads.

### Business Value
Enables flexible front-end implementations for guest content display. Supports future mobile apps or third-party integrations that need translated content. Provides a cacheable endpoint for improved performance.

### Acceptance Criteria
- [ ] GET `/api/public/items/[publicId]` endpoint exists and is publicly accessible
- [ ] `?lang=xx` query parameter selects the translation language
- [ ] Response follows `GuestContentResponse` type structure
- [ ] Translation metadata includes: `requestedLanguage`, `displayLanguage`, `isTranslated`, `originalLanguage`
- [ ] Returns 404 for non-existent items with appropriate error message
- [ ] Returns 200 with original content when translation unavailable (with metadata indicating fallback)
- [ ] Invalid language codes fall back to English with appropriate metadata
- [ ] Response headers support caching with appropriate cache-control directives
- [ ] Endpoint is rate-limited to prevent abuse
- [ ] All response types are properly defined and exported

---

## REQ-E04-006: Create Language Availability API Endpoint

**Date**: 2026-01-22 16:20
**Type**: NEW FEATURE
**Size**: S

### Summary
Create a public API endpoint that returns available translations for a specific item. This endpoint enables guest-facing UI components to display language switching options based on which translations actually exist.

### Current Behavior
There is no way to query which translations are available for a specific item. UI components cannot dynamically show language options based on actual translation availability.

### Expected Behavior
The system provides a public API endpoint that:
- Returns a list of available languages for a specific item
- Indicates the original/source language of the content
- Includes language metadata (native name, display name, locale code)
- Returns appropriate HTTP status codes for errors
- Supports caching for performance optimization

### User Impact
Guests see accurate language switching options that only show languages with actual translations. This prevents frustration from selecting a language that has no translation available.

### Business Value
Improves user experience by showing only valid language options. Reduces support requests from guests confused by non-functional language options. Enables dynamic UI that adapts to translation availability.

### Acceptance Criteria
- [ ] GET `/api/public/items/[publicId]/languages` endpoint exists and is publicly accessible
- [ ] Response follows `LanguageAvailabilityResponse` type structure
- [ ] Response includes `availableLanguages` array with language codes and metadata
- [ ] Response includes `originalLanguage` indicating the source content language
- [ ] Returns 404 for non-existent items with appropriate error message
- [ ] Returns empty `availableLanguages` array (with original language only) when no translations exist
- [ ] Response headers support caching with appropriate cache-control directives
- [ ] All response types are properly defined and exported

---

## REQ-E04-007: Create Translation Utility Helpers

**Date**: 2026-01-22 16:25
**Type**: NEW FEATURE
**Size**: S

### Summary
Create a utility module with helper functions for translation operations. These utilities handle common translation tasks like merging content, determining the best display language, and formatting language names for UI display.

### Current Behavior
There are no shared utility functions for common translation operations. Components implement their own logic for merging translations and determining display languages, leading to inconsistent behavior.

### Expected Behavior
The system provides a set of utility functions that:
- Merge original content with translation data, preserving untranslated fields
- Determine the best language to display based on user request, available translations, and source content
- Format language codes into human-readable names (in English or native script)
- Handle edge cases consistently across the application

### User Impact
Guests experience consistent translation behavior throughout the application. Language names are displayed appropriately in UI components. Content gracefully falls back when translations are partial.

### Business Value
Reduces code duplication by centralizing translation logic. Ensures consistent behavior across all components that handle translations. Simplifies development of new translation-aware features.

### Acceptance Criteria
- [ ] `mergeTranslation(original, translation)` correctly overlays translated fields onto original content
- [ ] `mergeTranslation` preserves original fields when translation field is null/undefined
- [ ] `getDisplayLanguage(requested, available, source)` returns requested language when available
- [ ] `getDisplayLanguage` falls back to source language when requested translation unavailable
- [ ] `formatLanguageName(code, native?)` returns English name by default (e.g., "French")
- [ ] `formatLanguageName(code, true)` returns native name (e.g., "Français")
- [ ] All functions are properly typed using types from `/src/types/l10n.ts`
- [ ] Functions handle invalid inputs gracefully without throwing errors
- [ ] Unit tests cover edge cases and fallback scenarios

---

## REQ-E04-008: Create GuestLanguageSwitcher Component

**Date**: 2026-01-22 16:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Create a language switcher dropdown component for guest users to select their preferred content language. The component displays all supported languages with visual indicators for translation availability.

### Current Behavior
There is no language switching UI for guest users. Guests cannot change the display language when viewing shared content.

### Expected Behavior
The system provides a language switcher component that:
- Displays a dropdown with all 6 supported languages
- Shows language flags/icons alongside native language names
- Indicates languages with available translations using a checkmark icon
- Displays languages without translations in a grayed-out style (still selectable for fallback)
- Updates content language when a new selection is made
- Persists the selection via cookie for returning guests
- Uses Radix UI dropdown primitives for full accessibility support

### User Impact
Guests can easily switch between languages when viewing shared content. Visual indicators help guests understand which languages have full translations versus fallback content. The accessible dropdown works with keyboard navigation and screen readers.

### Business Value
Empowers international guests to view content in their preferred language. Clear visual feedback reduces confusion about translation availability. Accessible implementation ensures compliance with accessibility standards.

### Acceptance Criteria
- [ ] Component renders a dropdown trigger showing current language with flag/icon
- [ ] Dropdown displays all 6 supported languages (English, French, Spanish, German, Italian, Dutch)
- [ ] Each language option shows flag/icon and native name (e.g., "Français", "Español")
- [ ] Languages with available translations display a checkmark indicator
- [ ] Languages without translations appear grayed out but remain selectable
- [ ] Selecting a language updates the displayed content language
- [ ] Language selection persists via cookie using `setGuestLanguageCookie`
- [ ] Component uses Radix UI DropdownMenu for accessibility
- [ ] Keyboard navigation works correctly (arrow keys, Enter, Escape)
- [ ] Component accepts `availableLanguages` prop to indicate translation availability
- [ ] Component accepts `currentLanguage` and `onLanguageChange` props
- [ ] Component is properly typed with exported prop types

---

## REQ-E04-009: Create TranslationBanner Component

**Date**: 2026-01-22 16:35
**Type**: NEW FEATURE
**Size**: S

### Summary
Create a banner component that displays when content is being shown in a translated language. The banner provides context about the translation and offers a link to view the original content.

### Current Behavior
There is no visual indicator when guests are viewing translated content. Guests have no way to know the content was originally written in a different language or to switch to view the original.

### Expected Behavior
The system provides a translation banner component that:
- Displays a light blue informational banner (#E3F2FD background)
- Shows text indicating the source language: "Translated from [Language]"
- Includes a "View original" link/button to switch to source content
- Displays a globe icon for visual context
- Remains visible (non-dismissible) to maintain translation context
- Only renders when viewing translated content (not when viewing original)

### User Impact
Guests always know when they are viewing translated content. They can easily switch to view the original content if the translation seems unclear or they prefer the source language. The consistent visual design provides clear context without being intrusive.

### Business Value
Builds trust with guests by being transparent about translations. Reduces confusion when translations may not perfectly capture the original intent. Provides an easy path to original content for bilingual guests who may prefer it.

### Acceptance Criteria
- [ ] Component renders a banner with light blue background (#E3F2FD)
- [ ] Banner displays "Translated from [Language]" with the source language name
- [ ] Banner includes a globe icon (using existing icon library)
- [ ] "View original" link/button is present and functional
- [ ] Component accepts `sourceLanguage` prop for the original content language
- [ ] Component accepts `onViewOriginal` callback prop
- [ ] Component does not render when `isTranslated` is false
- [ ] Banner is non-dismissible (no close button)
- [ ] Component is responsive and displays well on mobile devices
- [ ] Component is properly typed with exported prop types

---

## REQ-E04-010: Create MissingTranslationBanner Component

**Date**: 2026-01-22 16:40
**Type**: NEW FEATURE
**Size**: S

### Summary
Create a banner component that displays when the requested translation is not available and content is being shown in a fallback language. The banner uses muted styling to inform users without causing alarm.

### Current Behavior
There is no indication when a guest's requested language is unavailable. Guests may be confused when content appears in a different language than expected without explanation.

### Expected Behavior
The system provides a missing translation banner component that:
- Displays when the requested language translation does not exist
- Shows a clear message: "[Requested Language] translation not available. Showing content in [Fallback Language]."
- Uses muted/subtle styling (gray tones) to inform without alarming
- Does not render when the requested translation is available
- Provides helpful context without being intrusive

### User Impact
Guests understand why content appears in a different language than they requested. The non-alarming design prevents confusion or concern about errors. Clear messaging sets appropriate expectations.

### Business Value
Reduces support requests from confused guests. Maintains professional appearance when translations are incomplete. Transparently communicates translation availability without negatively impacting user experience.

### Acceptance Criteria
- [ ] Component renders a banner with muted/subtle styling (gray background, subdued text)
- [ ] Banner displays message format: "[Requested Language] translation not available. Showing content in [Fallback Language]."
- [ ] Component accepts `requestedLanguage` prop for the language user wanted
- [ ] Component accepts `fallbackLanguage` prop for the language being displayed
- [ ] Component does not render when translation is available (controlled by parent)
- [ ] Styling is intentionally muted to avoid alarming users
- [ ] Component includes an info icon for visual context
- [ ] Component is responsive and displays well on mobile devices
- [ ] Component is properly typed with exported prop types

---

## REQ-E04-011: Create ViewOriginalToggle Component

**Date**: 2026-01-22 16:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Create a toggle button component that allows guests to switch between viewing translated content and the original content. The button provides a simple way to compare translations or view source content.

### Current Behavior
There is no dedicated toggle for switching between translated and original content. Guests must use the language switcher to manually select the original language.

### Expected Behavior
The system provides a view toggle component that:
- Displays as a secondary-style button for non-intrusive placement
- Shows "View in original ([Language])" when viewing translation
- Shows "View translation" when viewing original content
- Includes a swap/toggle icon for visual clarity
- Toggles between translated and original content on click
- Maintains state awareness of current view mode

### User Impact
Guests can quickly toggle between original and translated content without navigating through the language switcher. This is especially useful for bilingual guests who want to verify translation accuracy or see specific terminology in the original language.

### Business Value
Enhances user experience for guests who want to compare translations. Reduces friction for bilingual users. Provides a focused interaction for a common use case without cluttering the language switcher.

### Acceptance Criteria
- [ ] Component renders as a secondary-style button (outline or ghost variant)
- [ ] Button text shows "View in original ([Language])" when viewing translation
- [ ] Button text shows "View translation" when viewing original content
- [ ] Button includes a swap/toggle icon (using existing icon library)
- [ ] Component accepts `isViewingOriginal` prop for current state
- [ ] Component accepts `originalLanguage` prop for display text
- [ ] Component accepts `onToggle` callback prop
- [ ] Button styling matches existing secondary button patterns in the codebase
- [ ] Component is responsive and displays well on mobile devices
- [ ] Component is properly typed with exported prop types

---

## REQ-E04-012: Create LanguageIndicator Component

**Date**: 2026-01-22 16:50
**Type**: NEW FEATURE
**Size**: S

### Summary
Create a compact language indicator component that displays the current content language with a flag icon. Designed for use in headers and compact spaces where full language switcher would be too large.

### Current Behavior
There is no compact visual indicator showing the current display language. Guest-facing pages lack clear visual feedback about which language content is being shown in.

### Expected Behavior
The system provides a language indicator component that:
- Displays the current language with a flag/icon
- Shows an optional subtitle "translated from [Language]" when viewing translated content
- Uses compact styling suitable for header placement
- Provides visual consistency across guest-facing pages
- Can optionally be clickable to trigger language switching

### User Impact
Guests can quickly see which language they're viewing content in without inspecting the language switcher. The compact design fits naturally in headers without taking up significant space.

### Business Value
Improves UI clarity for international guests. Provides constant visual feedback about language state. Enables flexible placement options for different page layouts.

### Acceptance Criteria
- [ ] Component displays current language code or short name with flag/icon
- [ ] Flag/icon matches the current display language
- [ ] Optional `showTranslatedFrom` prop enables subtitle "translated from [Language]"
- [ ] Compact styling fits header placement (minimal height/padding)
- [ ] Component accepts `currentLanguage` prop for display
- [ ] Component accepts optional `sourceLanguage` prop for translation context
- [ ] Component accepts optional `onClick` prop for triggering language switcher
- [ ] When clickable, appropriate hover/focus states are displayed
- [ ] Component is responsive and scales appropriately on mobile
- [ ] Component is properly typed with exported prop types

---

## REQ-E04-013: Create Barrel Exports for Guest Components

**Date**: 2026-01-22 16:55
**Type**: ENHANCEMENT
**Size**: XS

### Summary
Create a barrel export file for all guest-facing localization components, enabling convenient imports from a single path.

### Current Behavior
There is no centralized export file for guest components. Developers must import each component from its individual directory path.

### Expected Behavior
A barrel export file at `/src/components/guest/index.ts` re-exports all guest localization components, allowing imports like:
```typescript
import {
  GuestLanguageSwitcher,
  TranslationBanner,
  MissingTranslationBanner,
  ViewOriginalToggle,
  LanguageIndicator
} from '@/components/guest';
```

### User Impact
Developers can import all guest components from a single path, improving code readability and consistency.

### Business Value
Improves developer experience and codebase organization. Reduces import statement verbosity. Follows established patterns in the codebase for component organization.

### Acceptance Criteria
- [ ] `/src/components/guest/index.ts` file exists
- [ ] All guest components are exported: GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, ViewOriginalToggle, LanguageIndicator
- [ ] Component prop types are also exported for external use
- [ ] Imports via `@/components/guest` work correctly
- [ ] No circular dependency issues introduced
- [ ] TypeScript compiler validates exports without errors

---

## REQ-E04-014: Create useGuestLanguage Hook

**Date**: 2026-01-22 17:00
**Type**: NEW FEATURE
**Size**: M

### Summary
Create a React hook for managing guest language state and preferences. This hook provides a centralized way for components to access and modify the current display language, toggle between translated and original content, and sync language preferences across the application.

### Current Behavior
There is no shared state management for guest language preferences. Components would need to individually manage language state, leading to inconsistent behavior and duplicated logic.

### Expected Behavior
The system provides a `useGuestLanguage` hook that:
- Manages language state including current language and "show original" toggle
- Persists language preference to a cookie for returning guests
- Handles language changes by updating the cookie and triggering content refresh
- Provides a toggle function to switch between translation and original content
- Syncs with URL parameters to enable shareable language-specific links
- Initializes state from URL param, cookie, or browser detection (in priority order)

### User Impact
Guests experience consistent language behavior across all components on a page. Language changes are persisted and reflected immediately. Shareable links with language parameters work correctly.

### Business Value
Centralizes language state management, reducing bugs and inconsistencies. Enables shareable links with specific language selections for marketing and support. Provides a clean API for components to consume language state.

### Acceptance Criteria
- [ ] Hook returns `currentLanguage` representing the active display language
- [ ] Hook returns `showOriginal` boolean for translation/original toggle state
- [ ] Hook returns `setLanguage(lang)` function to change the display language
- [ ] Hook returns `toggleOriginal()` function to switch between translation and original
- [ ] `setLanguage` updates the cookie via `setGuestLanguageCookie`
- [ ] Hook initializes from URL `?lang=` parameter when present
- [ ] Hook falls back to cookie value when URL parameter absent
- [ ] Hook falls back to browser detection when no cookie exists
- [ ] Hook accepts optional `availableLanguages` to validate selections
- [ ] URL parameter updates when language changes (using `router.replace` or similar)
- [ ] Hook is properly typed with exported return type interface

---

## REQ-E04-015: Create Cookie Utility for Language Persistence

**Date**: 2026-01-22 17:05
**Type**: ENHANCEMENT
**Size**: XS

### Summary
Extend the guest language utility module with cookie management functions for persisting language preferences. This ensures guests' language selections are remembered across visits.

### Current Behavior
The guest language utility module (REQ-E04-002) is planned but does not yet include detailed cookie management specifications. Cookie configuration details need to be explicitly defined.

### Expected Behavior
The guest language utility at `/src/lib/i18n/guest-language.ts` includes cookie functionality that:
- Sets a `FAQBNB_GUEST_LANG` cookie with the selected language code
- Uses a 1-year expiration for long-term preference persistence
- Configures cookies with `Secure` flag for HTTPS-only transmission
- Uses `SameSite=Lax` for CSRF protection while allowing normal navigation
- Provides a function to read the current cookie value
- Provides a function to clear the cookie if needed

### User Impact
Guests' language preferences persist across browser sessions and visits. Returning guests automatically see content in their previously selected language.

### Business Value
Improves returning guest experience by remembering preferences. Reduces friction for international guests who don't need to re-select their language each visit. Standard cookie configuration ensures security compliance.

### Acceptance Criteria
- [ ] Cookie name is `FAQBNB_GUEST_LANG`
- [ ] Cookie expiration is set to 1 year (365 days)
- [ ] Cookie includes `Secure` flag
- [ ] Cookie uses `SameSite=Lax` attribute
- [ ] `setGuestLanguageCookie(language)` sets the cookie with all proper attributes
- [ ] `getGuestLanguageCookie()` retrieves the current cookie value
- [ ] `clearGuestLanguageCookie()` removes the cookie
- [ ] Cookie value is the ISO language code (e.g., "en", "fr", "es")
- [ ] Functions handle missing cookie gracefully (return null/undefined)
- [ ] Works correctly in both client and server contexts where applicable

---

## REQ-E04-016: Update Guest Item Page Server Component

**Date**: 2026-01-22 17:10
**Type**: ENHANCEMENT
**Size**: M

### Summary
Update the guest item page server component to support multi-language content delivery. The page should detect the guest's preferred language, fetch translated content, and pass translation metadata to client components for rendering.

### Current Behavior
The guest item page fetches and displays content only in the original language. There is no language detection, translation fetching, or SEO metadata localization.

### Expected Behavior
The guest item page server component:
- Detects preferred language from URL parameter, cookie, or Accept-Language headers (in priority order)
- Fetches item data with translations merged for the detected language
- Passes translation metadata to client components (display language, source language, is translated flag)
- Generates localized SEO metadata using translated title and description
- Falls back gracefully to original content when translations unavailable

### User Impact
Guests arriving via shared links see content in their preferred language automatically. Search engines index localized versions of content, improving discoverability for international guests. The page loads with appropriate content without requiring client-side language switching.

### Business Value
Improves SEO for international markets by providing localized metadata. Reduces bounce rate by showing content in guests' preferred language immediately. Supports property owners sharing content with international guests.

### Acceptance Criteria
- [ ] Page detects language from `?lang=` URL parameter as highest priority
- [ ] Page falls back to `FAQBNB_GUEST_LANG` cookie when no URL param
- [ ] Page falls back to Accept-Language header when no cookie
- [ ] Page defaults to English when no preference detected
- [ ] Item data is fetched with translations using `fetchTranslatedItem`
- [ ] Translation metadata (`displayLanguage`, `sourceLanguage`, `isTranslated`) passed to client
- [ ] `generateMetadata` returns translated title and description for SEO
- [ ] OpenGraph and Twitter card metadata uses translated content
- [ ] Page renders correctly when translation unavailable (shows original)
- [ ] Server component remains a valid RSC (no client-only hooks)

---

## REQ-E04-017: Update ItemDisplay Component (Client Component)

**Date**: 2026-01-22 17:15
**Type**: ENHANCEMENT
**Size**: L

### Summary
Update the ItemDisplay client component to support multi-language content display with translation controls. The component should integrate language switching UI, display translation banners, and handle toggling between translated and original content.

### Current Behavior
The ItemDisplay component renders item content in a single language without any translation awareness or language switching capabilities.

### Expected Behavior
The ItemDisplay component:
- Accepts translation metadata and original content as props from the server component
- Integrates the `useGuestLanguage` hook for language state management
- Displays GuestLanguageSwitcher in the header area for language selection
- Shows TranslationBanner when displaying translated content
- Shows MissingTranslationBanner when requested translation is unavailable
- Handles "View Original" toggle to swap between translated and original content client-side
- Maintains smooth UX during language switches

### User Impact
Guests can switch languages and toggle between original and translated content directly on the item page. Clear visual feedback indicates translation status. The experience is seamless without full page reloads for language changes.

### Business Value
Provides a complete multi-language viewing experience for guests. Empowers guests to choose their preferred language or verify translations. Differentiates the product with professional internationalization support.

### Acceptance Criteria
- [ ] Component accepts `translationMeta` prop with display language, source language, and translated flag
- [ ] Component accepts `originalContent` prop for client-side original/translation toggle
- [ ] `useGuestLanguage` hook is integrated for state management
- [ ] GuestLanguageSwitcher appears in appropriate header location
- [ ] TranslationBanner displays when `isTranslated` is true
- [ ] MissingTranslationBanner displays when requested language differs from display language
- [ ] "View Original" toggle swaps displayed content without API call
- [ ] Language change triggers content refetch (via hook or callback)
- [ ] Component handles loading states during language switches
- [ ] All new props are properly typed
- [ ] Existing functionality remains unchanged when translation props not provided

---

## REQ-E04-018: Update LinkCard Component

**Date**: 2026-01-22 17:20
**Type**: ENHANCEMENT
**Size**: S

### Summary
Update the LinkCard component to support displaying translated link titles. The component should accept translated content and support toggling between translated and original titles based on user preference.

### Current Behavior
The LinkCard component displays link titles only in the original language. There is no support for translated titles or toggling between original and translated content.

### Expected Behavior
The LinkCard component:
- Accepts an optional translated title prop
- Displays the translated title by default when available
- Displays the original title when the "view original" toggle is active
- Falls back to original title when no translation is provided
- Maintains existing styling and behavior for non-translated use cases

### User Impact
Guests see link titles in their preferred language when translations are available. The toggle between original and translated content works consistently across all content types including links.

### Business Value
Provides consistent translation support across all content elements. Ensures links are not overlooked in the translation experience. Maintains a cohesive multi-language user experience.

### Acceptance Criteria
- [ ] Component accepts optional `translatedTitle` prop
- [ ] Component accepts optional `showOriginal` prop for toggle state
- [ ] Translated title displays when `translatedTitle` is provided and `showOriginal` is false
- [ ] Original title displays when `showOriginal` is true
- [ ] Original title displays as fallback when `translatedTitle` is not provided
- [ ] Existing functionality remains unchanged when new props not provided
- [ ] All new props are properly typed
- [ ] Component is backwards compatible with existing usage

---

## REQ-E04-019: Handle URL Parameter for Shareable Links

**Date**: 2026-01-22 17:25
**Type**: ENHANCEMENT
**Size**: S

### Summary
Implement URL parameter handling for language-specific shareable links. This allows guests to share links that open content in a specific language while maintaining proper SEO with canonical URLs.

### Current Behavior
The guest item page does not read or use URL language parameters. There is no way to create shareable links that specify a particular language. Canonical URLs are not explicitly managed for language variations.

### Expected Behavior
The system handles URL language parameters such that:
- The `?lang=` query parameter specifies the display language
- Shareable links can include the language parameter (e.g., `/item/abc123?lang=fr`)
- Canonical URL excludes the language parameter to prevent SEO duplication
- The "Copy Link" or sharing functionality includes the current language parameter
- Language parameter is validated against supported languages

### User Impact
Guests can share links that open in a specific language, useful for property owners sharing with international guests. Recipients see content in the intended language immediately. Search engines properly index the canonical (non-language-specific) URL.

### Business Value
Enables property owners to share language-specific links with guests. Improves SEO by preventing duplicate content issues across language variations. Supports marketing campaigns targeting specific language markets.

### Acceptance Criteria
- [ ] Page reads `?lang=` URL parameter on load
- [ ] Valid language codes update the display language
- [ ] Invalid language codes are ignored (fall back to default detection)
- [ ] Canonical URL in metadata excludes `?lang=` parameter
- [ ] Sharing functionality includes current `?lang=` parameter in generated links
- [ ] Language parameter persists through page navigation where appropriate
- [ ] URL updates when language is changed via GuestLanguageSwitcher
- [ ] Browser history handles language changes appropriately (replace vs push)

---

## REQ-E04-020: Add Guest Language Detection to Middleware

**Date**: 2026-01-22 17:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
Update the Next.js middleware to handle guest language detection for public item pages. The middleware should detect the guest's language preference and make it available to downstream server components without performing redirects.

### Current Behavior
The middleware does not handle guest language detection. Public item routes (`/item/*`) may not be included in the middleware matcher. There is no mechanism to pass detected language to server components via headers.

### Expected Behavior
The middleware:
- Includes `/item/*` routes in the middleware matcher configuration
- Detects guest language from URL parameter, cookie, or Accept-Language header
- Sets a request header (e.g., `x-guest-language`) with the detected language for downstream use
- Sets the language cookie if not already present (for subsequent requests)
- Does NOT redirect users based on language (language selection via query param, not path)
- Passes through requests efficiently without blocking

### User Impact
Guests experience faster page loads as language detection happens early in the request pipeline. Server components can access the detected language consistently. No unexpected redirects disrupt the guest experience.

### Business Value
Improves performance by centralizing language detection at the edge. Ensures consistent language handling across all guest routes. Maintains clean URLs without language path segments.

### Acceptance Criteria
- [ ] Middleware matcher includes `/item/:path*` pattern
- [ ] Middleware detects language from `?lang=` URL parameter as highest priority
- [ ] Middleware detects language from `FAQBNB_GUEST_LANG` cookie as second priority
- [ ] Middleware detects language from `Accept-Language` header as fallback
- [ ] Detected language is set in `x-guest-language` request header
- [ ] Cookie is set if no existing language preference found
- [ ] Middleware does NOT perform redirects for language selection
- [ ] Existing middleware functionality (auth, etc.) remains unaffected
- [ ] Performance impact is minimal (no database calls in middleware)

---

## REQ-E04-021: Create Server-Side Language Detection Utility

**Date**: 2026-01-22 17:35
**Type**: NEW FEATURE
**Size**: S

### Summary
Create server-side language detection functions that work with Next.js Request objects. These utilities enable server components and middleware to detect guest language preferences from cookies, headers, and URL parameters.

### Current Behavior
The guest language utility module (REQ-E04-002) is designed for general use but may not have optimized functions for server-side contexts like middleware and server components that work with `NextRequest` objects.

### Expected Behavior
The server-side language detection utility:
- Reads language preference from `NextRequest` cookies
- Reads language preference from `NextRequest` headers (Accept-Language)
- Reads language preference from URL search parameters
- Applies correct priority order: URL param > Cookie > Accept-Language > default
- Returns a validated `SupportedLanguage` type
- Works efficiently in edge runtime (middleware) and Node runtime (server components)

### User Impact
Server-side rendering correctly detects guest language without client-side JavaScript. Initial page loads show content in the correct language immediately. Middleware can efficiently process language detection.

### Business Value
Enables proper SSR with localized content for SEO benefits. Improves initial page load experience by detecting language server-side. Provides consistent language detection across all server contexts.

### Acceptance Criteria
- [ ] `detectGuestLanguageServer(request: NextRequest)` function exists
- [ ] Function reads `?lang=` URL search parameter as highest priority
- [ ] Function reads `FAQBNB_GUEST_LANG` cookie as second priority
- [ ] Function parses and uses `Accept-Language` header as fallback
- [ ] Function returns English as ultimate default
- [ ] Return type is `SupportedLanguage` (validated)
- [ ] Function works in both edge runtime and Node runtime
- [ ] Function handles missing/malformed inputs gracefully
- [ ] Utility integrates with types from `/src/types/l10n.ts`

---

## REQ-E04-022: Test Language Detection Scenarios

**Date**: 2026-01-22 17:40
**Type**: TESTING
**Size**: M

### Summary
Create comprehensive tests for language detection scenarios to ensure the priority system works correctly across all detection methods. Tests should verify that URL parameters, cookies, and browser headers are processed in the correct order.

### Current Behavior
There are no automated tests verifying language detection behavior. Manual testing is required to confirm detection priority and fallback logic work correctly.

### Expected Behavior
A test suite exists that verifies:
- Browser Accept-Language header detection works correctly
- Cookie preference properly overrides browser language
- URL parameter properly overrides cookie preference
- Fallback to original/English works when no preference exists
- Edge cases are handled gracefully

### User Impact
Ensures guests consistently see content in their expected language based on their preferences. Prevents regressions that could cause unexpected language behavior.

### Business Value
Automated testing reduces manual QA effort. Catches regressions early in development. Provides confidence in the language detection system's reliability.

### Acceptance Criteria
- [ ] Test: Browser Accept-Language header `fr-FR,fr;q=0.9,en;q=0.8` correctly detects French
- [ ] Test: Browser Accept-Language with unsupported language falls back to English
- [ ] Test: Cookie `FAQBNB_GUEST_LANG=es` overrides browser language `fr-FR`
- [ ] Test: URL parameter `?lang=de` overrides cookie `FAQBNB_GUEST_LANG=es`
- [ ] Test: Invalid URL parameter `?lang=invalid` falls back to next detection method
- [ ] Test: No preferences at all defaults to English
- [ ] Test: Malformed Accept-Language header handled gracefully
- [ ] Test: Empty cookie value handled gracefully
- [ ] Tests cover both server-side and client-side detection functions
- [ ] All tests pass in CI pipeline

---

## REQ-E04-023: Test Content Display Scenarios

**Date**: 2026-01-22 17:45
**Type**: TESTING
**Size**: M

### Summary
Create comprehensive tests for content display scenarios to ensure translated content renders correctly in all situations. Tests should verify that content display, toggling, and language switching work as expected.

### Current Behavior
There are no automated tests verifying content display behavior with translations. Manual testing is required to confirm content shows correctly in different translation states.

### Expected Behavior
A test suite exists that verifies:
- Translated content displays correctly when available
- Original content displays when no translation exists
- "View Original" toggle switches content instantly without API calls
- Language switcher updates displayed content appropriately
- Loading states are handled during content updates

### User Impact
Ensures guests see the correct content in the correct language without display glitches or errors. Provides confidence that the translation display system works reliably.

### Business Value
Automated testing reduces manual QA effort for internationalization features. Catches visual and functional regressions early. Ensures consistent quality across all language display scenarios.

### Acceptance Criteria
- [ ] Test: Translated item title displays correctly when translation exists
- [ ] Test: Translated article content displays correctly
- [ ] Test: Translated link titles display correctly
- [ ] Test: Original content displays when translation is unavailable
- [ ] Test: "View Original" toggle swaps content without page reload
- [ ] Test: "View Original" toggle swaps back to translation on second click
- [ ] Test: Language switcher selection updates displayed content
- [ ] Test: TranslationBanner appears when viewing translated content
- [ ] Test: MissingTranslationBanner appears when translation unavailable
- [ ] Test: Loading state displays during language switch
- [ ] All tests pass in CI pipeline

---

