# Generated Requests - Epic 4 (Guest Experience)

This file contains auto-generated feature requests for L10N Epic 4.
Request IDs use format: REQ-E04-XXX

Last Reset: 2026-01-19

---

## REQ-E04-001: Create Localization Types and Utilities

**Date**: 2026-01-19 19:45
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide centralized type definitions and utility functions for internationalization across all application components.

### Current Behavior
No centralized type definitions exist for localization. Components cannot reference standardized language codes, translation structures, or language metadata in a type-safe manner.

### Expected Behavior
Developers can import well-defined TypeScript types and constants that describe supported languages, translation content structures, and language metadata. Utility functions are available for common language operations such as validation and formatting.

### User Impact
End users experience no direct impact, but this foundation enables consistent multilingual support across the application. Developers gain type safety and autocomplete when working with language-related features.

### Business Value
Establishes a scalable foundation for internationalization that prevents errors and accelerates development of multilingual features.

### Acceptance Criteria
- [ ] A types file exists that exports type definitions for supported languages
- [ ] Language codes follow standardized formats (e.g., ISO 639-1)
- [ ] Type definitions include structures for translated content with language keys
- [ ] A constant array or object defines all supported languages with their metadata (name, native name, direction)
- [ ] Utility functions are exported for language validation and common operations
- [ ] All exports use TypeScript for full type safety
- [ ] The types file can be imported by any component in the application

---

## REQ-E04-002: Create Guest Language Detection and Persistence Utilities

**Date**: 2026-01-19 20:15
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should automatically detect and persist guest language preferences through cookies, URL parameters, and browser headers to provide seamless multilingual experiences without requiring authentication.

### Current Behavior
Guest users cannot have their language preferences detected or remembered across page visits. The application has no mechanism to read browser language settings, process URL language parameters, or store guest language choices in cookies.

### Expected Behavior
When a guest visits the application, the system detects their preferred language by checking (in priority order): URL parameters, existing cookies, and browser Accept-Language headers. Once detected or explicitly chosen, the language preference is stored in a cookie that persists across sessions. Browser language codes are intelligently mapped to the application's supported languages.

### User Impact
Guest users immediately see content in their preferred language without needing to manually select it each visit. Users who speak languages with regional variants (e.g., en-US, en-GB, zh-CN, zh-TW) are automatically matched to the closest supported language.

### Business Value
Reduces friction for international guests by eliminating the need to repeatedly select their language. Improves first-impression experience by respecting browser language preferences, increasing engagement and conversion rates for multilingual audiences.

### Acceptance Criteria
- [ ] A utility function detects language from URL parameters when provided
- [ ] Language detection falls back to cookie values if URL parameter is absent
- [ ] Language detection falls back to Accept-Language header parsing if no cookie exists
- [ ] Accept-Language header is parsed correctly according to HTTP standards, respecting quality values
- [ ] Browser-specific language codes (e.g., en-US, pt-BR) are mapped to application-supported languages (e.g., en, pt)
- [ ] A utility function persists language selection to a cookie with appropriate expiration
- [ ] Cookie settings include path and security attributes suitable for production use
- [ ] If no language can be detected, the system defaults to English
- [ ] All utility functions handle edge cases such as malformed headers, invalid language codes, and missing data
- [ ] Functions are exported from a module that can be used in both server and client contexts

---

## REQ-E04-003: Expose Localization Types Through Central Types Index

**Date**: 2026-01-19 20:30
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The central types index should re-export all localization type definitions to provide a single import location for type-safe internationalization throughout the application.

### Current Behavior
Localization types exist in a dedicated file but are not accessible through the central types index. Developers must know the specific localization types module path to import language-related types, creating friction and inconsistency in import patterns.

### Expected Behavior
Developers import all localization types from the central types index using a single, predictable import statement. The types index re-exports all localization type definitions, making them discoverable alongside other application types.

### User Impact
End users experience no direct change. Developers benefit from simplified imports and improved discoverability of localization types through IDE autocomplete and consistent import patterns.

### Business Value
Reduces cognitive load for developers working with multilingual features and ensures localization types are treated as first-class citizens in the application's type system.

### Acceptance Criteria
- [ ] The central types index file re-exports all types from the localization types module
- [ ] Imports use wildcard export syntax or explicit named exports
- [ ] No breaking changes occur to existing type imports
- [ ] Developers can import localization types using the central types path
- [ ] TypeScript compilation succeeds without errors after the change

---

## REQ-E04-004: Create Translation Fetch Utilities for Content Retrieval

**Date**: 2026-01-19 20:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide utility functions that retrieve translated content for items, articles, links, and tags in the guest's preferred language.

### Current Behavior
No utilities exist to fetch content with translations applied. Components cannot request content in a specific language or retrieve translations separately from the main content. Each component would need to manually join translation tables and apply fallback logic.

### Expected Behavior
Developers call utility functions that accept content identifiers and a language code, receiving either the fully translated content or just the translation data. Functions handle translation lookups, apply fallback to the original language when translations are missing, and return consistently structured results. Batch functions allow efficient retrieval of translations for multiple items simultaneously.

### User Impact
Guests see content in their selected language with seamless fallback to the original when translations are unavailable. Performance is optimized through batch retrieval, resulting in faster page loads for multilingual content.

### Business Value
Centralizes translation retrieval logic, reducing code duplication across components and ensuring consistent translation behavior throughout the application. Enables efficient multilingual content delivery at scale.

### Acceptance Criteria
- [ ] A utility function fetches a complete item with its translation applied for a given public ID and language
- [ ] A utility function fetches only translation data for a specific item without the full item object
- [ ] A utility function batch-fetches article translations for multiple article IDs in a single database query
- [ ] A utility function batch-fetches link translations for multiple link IDs in a single database query
- [ ] A utility function batch-fetches tag translations for multiple tag keys in a single database query
- [ ] All functions return null or empty results when content does not exist rather than throwing errors
- [ ] Translation functions automatically fall back to original content when the requested translation is missing
- [ ] Returned data structures are consistently typed with TypeScript interfaces
- [ ] Functions accept language codes that match the supported language type definitions
- [ ] Functions are exported from a dedicated translation utilities module

---

## REQ-E04-005: Create Public Item API Endpoint with Translation Support

**Date**: 2026-01-19 21:00
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should expose a public API endpoint that returns item details with all related content translated into the guest's requested language.

### Current Behavior
No public API endpoint exists for retrieving items with translation support. Guests cannot access item data through a dedicated API that merges original content with translations based on language preference.

### Expected Behavior
A GET endpoint accepts a public item ID in the URL path and an optional language query parameter. The endpoint retrieves the complete item including all articles, links, and tags, then merges original content with translations for the requested language. The response includes translation metadata such as translation status, source language, and version information. When no language parameter is provided, the endpoint defaults to English. When a requested translation is incomplete or missing, the endpoint returns original content with metadata indicating the fallback behavior.

### User Impact
Guests viewing items through shareable links or QR codes immediately see all content in their preferred language. The experience is seamless even when translations are partial, as original content fills in gaps automatically.

### Business Value
Enables multilingual content sharing through a single endpoint, supporting the core use case of international guests accessing property information. Provides a foundation for guest-facing features like QR codes and shareable links with language selection.

### Acceptance Criteria
- [ ] A GET endpoint exists at the public items path that accepts a public ID parameter
- [ ] The endpoint accepts a language query parameter to specify the desired translation
- [ ] When no language parameter is provided, the endpoint defaults to English
- [ ] The endpoint validates that the requested language is supported by the application
- [ ] The endpoint returns a 404 status when the item does not exist or is not accessible
- [ ] The endpoint returns a 400 status when an invalid language code is provided
- [ ] The response includes the complete item with all articles, links, and tags
- [ ] Original content is merged with translations for all translatable fields
- [ ] Translation metadata is included in the response (status, source language, version information)
- [ ] When a translation is missing or incomplete, original content is returned with metadata indicating fallback
- [ ] The response format matches the GuestContentResponse type structure
- [ ] The endpoint handles database errors gracefully and returns appropriate error responses
- [ ] Response includes proper HTTP headers for caching and content type
- [ ] The endpoint does not require authentication for public items

---

## REQ-E04-006: Create Language Availability API Endpoint

**Date**: 2026-01-19 21:15
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide a public API endpoint that returns the list of available translation languages for a specific item.

### Current Behavior
No endpoint exists to query which languages are available for a given item. Guests and clients cannot discover which translations exist before requesting content, forcing them to either request each language speculatively or display language options without knowing availability.

### Expected Behavior
A GET endpoint accepts a public item ID and returns a structured response listing all languages for which complete or partial translations exist. The response indicates the translation completeness for each available language, including metadata about what content types are translated (articles, links, tags). The endpoint performs efficiently by querying translation status without loading full content.

### User Impact
Guests see only language options that have actual translations available, avoiding frustration from selecting languages with no content. Language switcher components can display accurate availability indicators, improving the user experience when browsing multilingual content.

### Business Value
Enables dynamic language selection interfaces that adapt to actual translation availability, improving guest satisfaction and reducing support burden from missing translations. Provides a lightweight endpoint for building responsive, translation-aware UI components.

### Acceptance Criteria
- [ ] A GET endpoint exists at the path for item language availability that accepts a public ID parameter
- [ ] The endpoint returns a list of language codes for which at least one translation exists
- [ ] The response includes translation completeness indicators for each language
- [ ] The response indicates which content types are translated (items, articles, links, tags)
- [ ] The response format matches the LanguageAvailabilityResponse type structure
- [ ] The endpoint returns a 404 status when the item does not exist or is not accessible
- [ ] The endpoint performs efficiently without loading full translated content
- [ ] The endpoint does not require authentication for public items
- [ ] Response includes proper HTTP headers for caching and content type
- [ ] The endpoint handles database errors gracefully and returns appropriate error responses

---

## REQ-E04-007: Create Translation Utility Helpers for Content Display

**Date**: 2026-01-19 21:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide utility functions that intelligently merge original content with translations, determine the best display language, and format language names for user interfaces.

### Current Behavior
No utilities exist for common translation operations. Components must manually implement logic for merging translated content with originals, determining which language to display when requested translations are unavailable, and formatting language codes into human-readable names. This leads to inconsistent translation handling across the application.

### Expected Behavior
Developers call utility functions that handle translation merging, language selection logic, and formatting. A merge function combines original content with translation data, preserving original values when translations are missing. A display language function evaluates requested languages against available translations and source content to determine the optimal language to show. A formatting function converts language codes into display-friendly names with optional native language output.

### User Impact
Guests experience consistent translation behavior across all content types. Language names appear in appropriate formats throughout the interface. Content displays in the best available language when exact matches are unavailable, improving the experience for users speaking languages with partial translations.

### Business Value
Eliminates code duplication across components by centralizing translation logic. Ensures predictable fallback behavior that maintains usability even with incomplete translations. Provides building blocks for translation-aware UI components.

### Acceptance Criteria
- [ ] A merge function accepts original content and translation data, returning merged content with all fields
- [ ] The merge function preserves original values for fields without translations
- [ ] The merge function handles null or undefined translation data gracefully
- [ ] A display language function accepts a requested language, available languages, and source language
- [ ] The display language function returns the requested language if it is available
- [ ] The display language function returns the source language if the requested language is not available
- [ ] The display language function returns English as the final fallback if neither requested nor source languages are available
- [ ] A format function accepts a language code and returns a human-readable language name
- [ ] The format function accepts an optional native flag to return names in the language itself (e.g., "Español" instead of "Spanish")
- [ ] All functions are properly typed with TypeScript interfaces
- [ ] All functions handle edge cases such as invalid language codes, missing data, and malformed inputs
- [ ] Functions are exported from a dedicated translation utilities module
- [ ] Functions are pure and do not have side effects

---

## REQ-E04-008: Create Guest Language Switcher Component

**Date**: 2026-01-20 14:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Guests should have a dropdown component that displays all available languages with flags and native names, indicating which translations are complete and allowing selection of any language regardless of translation status.

### Current Behavior
No language selection interface exists for guest users. Guests cannot discover available languages, see which translations are complete, or switch between languages when viewing content.

### Expected Behavior
A dropdown component displays all six supported languages with their flag icons and native names. Languages with complete or partial translations show a checkmark indicator. Languages without translations appear grayed out but remain selectable, allowing guests to preview the fallback experience. The component uses accessible dropdown patterns for keyboard navigation and screen reader support. When a guest selects a language, the choice is persisted and the page content updates accordingly.

### User Impact
Guests can easily switch between languages to view content in their preferred language or explore available translations. Visual indicators help guests understand translation availability before switching. The interface remains accessible to users relying on assistive technologies or keyboard navigation.

### Business Value
Empowers international guests to control their language experience without requiring technical knowledge. Clear availability indicators set accurate expectations about translation completeness, reducing frustration and support requests. Accessible design ensures compliance with international accessibility standards.

### Acceptance Criteria
- [ ] A dropdown component renders with all six supported languages
- [ ] Each language option displays a flag icon representing the language or country
- [ ] Each language option shows the language name in its native form (e.g., "Español", "Français")
- [ ] Languages with available translations display a checkmark or similar indicator
- [ ] Languages without translations appear visually distinct (grayed out or dimmed)
- [ ] Languages without translations remain selectable despite visual distinction
- [ ] The dropdown uses Radix UI primitives for accessibility compliance
- [ ] The component supports keyboard navigation (arrow keys, enter, escape)
- [ ] The component includes proper ARIA attributes for screen readers
- [ ] When a language is selected, the selection is persisted via cookie or state
- [ ] The currently selected language is visually highlighted in the dropdown
- [ ] The component accepts translation availability data as a prop
- [ ] The component emits an event or callback when language selection changes
- [ ] The component handles loading states when translation data is being fetched
- [ ] The component displays an error state if translation availability cannot be determined
- [ ] The dropdown trigger shows the currently selected language with its flag

---

## REQ-E04-009: Create Translation Banner Component

**Date**: 2026-01-20 22:15
**Type**: NEW FEATURE
**Size**: S

### Summary
Guests viewing translated content should see a persistent, non-dismissible banner that identifies the source language and offers an option to view the original version.

### Current Behavior
No visual indicator exists to inform guests when they are viewing translated content. Guests cannot tell if content has been translated from another language or access the original version if they prefer it.

### Expected Behavior
A light blue banner appears at the top of translated content displaying text such as "Translated from Spanish - View original" with a globe icon. The banner uses a consistent light blue background color for visibility without being intrusive. The banner cannot be dismissed, ensuring guests always have context about translation status. Clicking "View original" toggles the display to show the source language content. The banner includes appropriate spacing and typography to integrate naturally with surrounding content.

### User Impact
Guests viewing translated content immediately understand that a translation is being shown and which language was the source. Users who prefer original content or who are bilingual can easily switch to view the untranslated version. Transparency about translation status builds trust and allows guests to make informed decisions about content interpretation.

### Business Value
Provides transparency that builds credibility with international guests by making translation status explicit. Reduces potential miscommunication by giving guests the option to compare translated and original content. Meets ethical standards for disclosure when automated translation is used.

### Acceptance Criteria
- [ ] A banner component renders with a light blue background color (#E3F2FD)
- [ ] The banner displays text indicating the source language (e.g., "Translated from Spanish")
- [ ] The banner includes a globe icon positioned before or after the text
- [ ] The banner includes actionable text like "View original" that guests can click
- [ ] The banner is not dismissible and has no close button
- [ ] Clicking "View original" triggers a callback or event to switch language display
- [ ] The banner has appropriate padding and spacing for comfortable reading
- [ ] Typography is consistent with the application's design system
- [ ] The component accepts the source language as a prop
- [ ] The component accepts a callback function for the "View original" action
- [ ] The banner is responsive and displays appropriately on mobile devices
- [ ] The component integrates with accessibility standards (ARIA labels, keyboard navigation)
- [ ] The banner appears only when translated content is being displayed
- [ ] The component handles undefined or null source language gracefully

---

## REQ-E04-010: Create Missing Translation Banner Component

**Date**: 2026-01-20 22:30
**Type**: NEW FEATURE
**Size**: S

### Summary
Guests viewing content in a language that has no translation available should see a subtle, informational banner indicating which language was requested and that the original language is being displayed instead.

### Current Behavior
No visual indicator exists to inform guests when a requested translation is unavailable. Guests cannot tell if content is being shown in the original language due to missing translations or if they simply selected the original language intentionally. This creates confusion about whether translation is unavailable or was never attempted.

### Expected Behavior
A muted-style information banner appears when a guest selects a language that has no translation for the current content. The banner displays text such as "French translation not available. Showing content in English." The banner uses subdued, non-alarming styling such as gray background with softer text colors to communicate the information without causing concern. The banner appears persistently while viewing content without the requested translation but does not interrupt the reading experience. The styling differs visibly from error messages to indicate this is informational rather than problematic.

### User Impact
Guests who select languages without available translations immediately understand why content appears in a different language. The subtle, muted styling ensures the message is noticed without creating anxiety or suggesting an error. Users can continue reading with clear context about the language being displayed.

### Business Value
Reduces confusion and support requests by clearly explaining why requested translations are unavailable. The muted design approach maintains a positive user experience even when translations are incomplete, supporting the gradual rollout of multilingual content without alarming users about missing translations.

### Acceptance Criteria
- [ ] A banner component renders when a requested translation is unavailable
- [ ] The banner displays text indicating the requested language (e.g., "French translation not available")
- [ ] The banner displays text indicating which language is being shown instead (e.g., "Showing content in English")
- [ ] The banner uses muted styling with a gray or neutral background color
- [ ] Text colors are subdued compared to standard UI text but remain readable
- [ ] The banner styling clearly differentiates from error messages or warning banners
- [ ] The banner does not include any alarming icons or colors (no red, yellow, or exclamation marks)
- [ ] The component accepts the requested language as a prop
- [ ] The component accepts the fallback language being displayed as a prop
- [ ] The banner has appropriate padding and spacing that does not overwhelm the content
- [ ] Typography is consistent with the application's design system
- [ ] The banner is responsive and displays appropriately on mobile devices
- [ ] The component integrates with accessibility standards (ARIA role="status" or similar)
- [ ] The banner appears only when a translation was requested but is not available
- [ ] The component handles undefined or null language props gracefully

---

## REQ-E04-011: Create View Original Toggle Component

**Date**: 2026-01-20 23:00
**Type**: NEW FEATURE
**Size**: S

### Summary
Guests viewing translated content should have a secondary button that toggles between viewing the translation and the original source language version, with visual indication of the current state.

### Current Behavior
No toggle mechanism exists for guests to switch between translated and original content. Guests cannot quickly compare translations with source material or verify translation accuracy by viewing both versions.

### Expected Behavior
A secondary-styled button displays text that changes based on the current view state. When viewing a translation, the button shows "View in original (English)" with an appropriate swap or language icon. When viewing the original, the button shows "View translation" with the same icon. Clicking the button triggers a callback that switches the content display between translated and original versions. The button styling uses the application's secondary button design to indicate it is a non-primary action. The icon provides visual reinforcement of the toggle action.

### User Impact
Guests can effortlessly toggle between translated and original content to verify accuracy, understand nuanced meaning, or compare language versions. Bilingual guests benefit from being able to check both versions quickly. The toggle provides confidence in translation quality by making the original content easily accessible.

### Business Value
Builds trust with international guests by demonstrating transparency and giving them control over content presentation. Supports bilingual users and guests who want to verify translation accuracy. The easy comparison mechanism can help identify translation issues, supporting quality improvement efforts.

### Acceptance Criteria
- [ ] A button component renders with secondary button styling as defined in the design system
- [ ] When viewing translated content, the button displays "View in original (English)" or similar text with the source language name
- [ ] When viewing original content, the button displays "View translation" or similar text
- [ ] The button includes a swap icon or language toggle icon that visually represents switching between versions
- [ ] The icon position is consistent whether showing translation or original state
- [ ] Clicking the button triggers a callback function to change the displayed content version
- [ ] The component accepts the current view state as a prop (translated vs. original)
- [ ] The component accepts the source language name as a prop for display in the toggle text
- [ ] The component accepts a callback function that executes when the button is clicked
- [ ] The button is responsive and displays appropriately on mobile devices
- [ ] Typography is consistent with the application's secondary button design
- [ ] The component integrates with accessibility standards (appropriate ARIA labels, keyboard interaction)
- [ ] The button visually indicates the action that will occur when clicked, not the current state
- [ ] The component handles undefined or null props gracefully with sensible defaults

---

## REQ-E04-012: Create Language Indicator Component

**Date**: 2026-01-20 08:03
**Type**: NEW FEATURE
**Size**: S

### Summary
Guests should see a compact, visual indicator in the header that displays the current content language with an appropriate flag icon and optional subtitle showing the source language when viewing translations.

### Current Behavior
No header element exists to show guests which language they are currently viewing. Guests must infer the display language from content itself or remember their last language selection. When viewing translated content, guests cannot quickly identify the source language without reading detailed banner messages elsewhere on the page.

### Expected Behavior
A compact component appears in the application header displaying the current language's flag icon alongside the language name or code. When viewing translated content, an optional subtitle appears below or beside the main indicator showing "translated from [source language]" in smaller, muted text. The component occupies minimal header space while remaining readable and accessible. The design integrates seamlessly with existing header elements without disrupting navigation or branding.

### User Impact
Guests have persistent awareness of which language they are viewing without needing to scroll or search for language information. When viewing translations, guests immediately understand the source language at a glance. The compact design preserves screen real estate while improving orientation and context awareness throughout the browsing experience.

### Business Value
Reduces cognitive load by making language context immediately visible without requiring user action. Improves perceived transparency and professionalism by clearly displaying language information. The persistent header placement ensures guests never lose context about which language they selected, supporting a confident multilingual browsing experience.

### Acceptance Criteria
- [ ] A component renders in the application header with minimal width suitable for compact header placement
- [ ] The component displays a flag icon representing the currently displayed language
- [ ] The component displays the language name or code beside the flag icon
- [ ] When viewing translated content, an optional subtitle appears showing "translated from [source language]"
- [ ] The subtitle uses smaller font size and muted color compared to the main language label
- [ ] The subtitle positioning (below or beside) adapts appropriately for mobile and desktop viewports
- [ ] The component accepts the current display language as a prop
- [ ] The component accepts an optional source language prop for displaying translation origin
- [ ] When no source language is provided, the subtitle does not appear
- [ ] The component integrates visually with the existing header design system
- [ ] Typography, spacing, and colors match the header's visual style
- [ ] The component remains readable on both light and dark header backgrounds
- [ ] The component is responsive and scales appropriately on mobile devices
- [ ] The component integrates with accessibility standards (appropriate text alternatives for flag icons)
- [ ] The component handles undefined or null language props gracefully

---


## REQ-E04-013: Create Barrel Export File for Guest Components

**Date**: 2026-01-20 08:30
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The system should provide a centralized barrel export file that re-exports all guest-facing components from a single import location.

### Current Behavior
Guest components exist in individual files within the guest components directory, but no centralized export mechanism exists. Developers must import each guest component using its specific file path, leading to verbose import statements and reduced discoverability when multiple guest components are needed in a single file.

### Expected Behavior
Developers import guest components from a single barrel export file using a clean, predictable path. The barrel file re-exports all guest-facing components including the language switcher, translation banners, view toggle, and language indicator. Import statements become concise and consistent across the codebase. When new guest components are added, they are included in the barrel exports to maintain comprehensive coverage.

### User Impact
End users experience no direct change. Developers benefit from simplified imports, improved component discoverability through IDE autocomplete, and reduced boilerplate in component files that use multiple guest-facing features.

### Business Value
Reduces friction when building guest-facing features by providing a clear, organized component library structure. Improves code maintainability by establishing a single source of truth for guest component exports. Accelerates development velocity when working with multilingual guest experiences.

### Acceptance Criteria
- [ ] A barrel export file exists at the path for guest components index
- [ ] The file exports the GuestLanguageSwitcher component
- [ ] The file exports the TranslationBanner component
- [ ] The file exports the MissingTranslationBanner component
- [ ] The file exports the ViewOriginalToggle component
- [ ] The file exports the LanguageIndicator component
- [ ] All exports use named export syntax for clarity and tree-shaking compatibility
- [ ] The file includes no business logic, only re-exports
- [ ] TypeScript types associated with components are also re-exported when applicable
- [ ] The barrel file can be imported from any application component using the guest components path
- [ ] No breaking changes occur to existing direct component imports

---

## REQ-E04-014: Create Guest Language State Management Hook

**Date**: 2026-01-20 09:00
**Type**: NEW FEATURE
**Size**: M

### Summary
Guest users should have their language preference automatically managed through a React hook that synchronizes state between cookies, URL parameters, and the displayed content version.

### Current Behavior
No centralized state management exists for guest language preferences. Components cannot track the current display language, persist language changes across sessions, or coordinate between translation display and original content toggling. Guest language selection, persistence, and display logic would need to be reimplemented in each component that handles multilingual content.

### Expected Behavior
A React hook provides centralized management of guest language state including the currently selected language and whether original or translated content is being shown. The hook reads initial language preference from URL parameters for shareable links, falls back to cookie values for returning guests, and persists any language changes back to cookies for future visits. When guests toggle between translated and original content, the hook updates local display state without affecting the persisted language preference. The hook handles language changes by updating the cookie and optionally triggering content refetching. URL parameter synchronization enables shareable links that open directly in a specific language.

### User Impact
Guests experience seamless language persistence across sessions without needing to repeatedly select their preferred language. Shareable links with language parameters open directly in the intended language. Toggling to view original content affects only the current viewing session without changing the saved preference. The experience feels cohesive and intelligent as language preferences are remembered and respected throughout the browsing journey.

### Business Value
Eliminates friction in the multilingual guest experience by intelligently managing language state across sessions and navigation events. Enables powerful sharing features where links can specify language, supporting use cases like multilingual property listings and international marketing campaigns. Centralizing state management reduces bugs and inconsistencies that could arise from duplicate language handling logic across components.

### Acceptance Criteria
- [ ] A React hook exports state for the current display language with type-safe language code values
- [ ] The hook exports state indicating whether original or translated content is being shown (showOriginal flag)
- [ ] On initial load, the hook checks for a language parameter in the URL and uses it if present
- [ ] When no URL parameter exists, the hook reads the language preference from a cookie
- [ ] When neither URL parameter nor cookie exists, the hook defaults to English
- [ ] The hook provides a function to change the current language selection
- [ ] When language is changed, the new preference is persisted to a cookie with appropriate expiration
- [ ] When language is changed, the hook optionally triggers a callback or refetch to update displayed content
- [ ] The hook provides a function to toggle between translated and original content display
- [ ] Toggling between translated and original affects only the showOriginal state without changing the persisted language cookie
- [ ] The hook maintains synchronization between URL parameters and state for shareable link support
- [ ] The hook handles edge cases such as invalid language codes, malformed cookies, and missing data
- [ ] The hook works correctly in both server-side rendering and client-side navigation contexts
- [ ] State updates are performant and do not cause unnecessary re-renders
- [ ] The hook accepts optional configuration parameters such as cookie name and expiration duration
- [ ] The hook is exported from a dedicated hooks module for guest features

---

## REQ-E04-015: Create Cookie Utility for Language Persistence

**Date**: 2026-01-20 09:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide a dedicated utility function that sets and manages the guest language preference cookie with appropriate security settings and long-term expiration.

### Current Behavior
No specialized utility exists for managing the guest language cookie. Components and hooks that need to persist language preferences must manually construct cookie strings with security attributes, expiration dates, and proper formatting, leading to inconsistent cookie handling and potential security gaps.

### Expected Behavior
A utility function accepts a language code and sets a cookie named `FAQBNB_GUEST_LANG` with a 1-year expiration period. The cookie includes the Secure flag for HTTPS-only transmission and SameSite=Lax to balance security with cross-site navigation usability. The utility handles cookie formatting, expiration calculation, and attribute setting automatically. A complementary function retrieves the cookie value when needed. Both functions handle edge cases such as invalid language codes, cookie storage failures, and environments where cookies are disabled.

### User Impact
Guests' language preferences persist reliably for one year without requiring repeated selection. The long expiration ensures returning guests see their preferred language even after extended absences. Cookie security attributes protect guest privacy while maintaining seamless navigation across the application.

### Business Value
Standardizes cookie management for language persistence, ensuring consistent security practices across the application. The one-year expiration balances user convenience with data freshness, reducing friction for international guests while avoiding indefinite cookie retention. Proper security flags demonstrate commitment to user privacy and align with industry best practices.

### Acceptance Criteria
- [ ] A utility function accepts a language code parameter and sets a cookie named `FAQBNB_GUEST_LANG`
- [ ] The cookie expiration is set to exactly 1 year from the time of setting
- [ ] The cookie includes the Secure flag to ensure HTTPS-only transmission
- [ ] The cookie includes SameSite=Lax to allow cross-site navigation while preventing CSRF attacks
- [ ] The cookie path is set to `/` to ensure availability across the entire application
- [ ] A companion function retrieves the current value of the language cookie
- [ ] The retrieval function returns null or undefined when the cookie does not exist
- [ ] Both functions validate that the language code matches supported language types before setting
- [ ] Invalid language codes are rejected and the cookie is not set or is cleared
- [ ] The utility handles environments where cookies are disabled gracefully without throwing errors
- [ ] The functions work correctly in both server-side and client-side contexts
- [ ] The utility is exported from the guest language module or a dedicated cookie utilities module
- [ ] TypeScript types ensure only valid language codes can be passed to the set function
- [ ] The implementation follows Next.js best practices for cookie handling

---

## REQ-E04-016: Update Guest Item Page with Translation Support

**Date**: 2026-01-20 10:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
The guest-facing item detail page should automatically detect the guest's preferred language and display all item content with appropriate translations applied.

### Current Behavior
The guest item detail page displays content only in the original language in which it was created. The page has no mechanism to detect guest language preferences from URL parameters, cookies, or browser headers. Translation data exists in the database but is not retrieved or applied when rendering item pages for guests. Page metadata for search engines uses only the original language title and description regardless of the guest's language preference.

### Expected Behavior
When a guest visits an item detail page, the server component detects the preferred language by checking URL parameters first, then cookies, and finally Accept-Language headers as fallbacks. The page fetches the complete item including all articles, links, and tags with translations merged for the detected language. Translation metadata indicating translation status, source language, and version information is passed to client components for display decisions. Page metadata for SEO dynamically uses the translated title and description when showing translated content, improving discoverability in non-English search results. When translations are unavailable, the page seamlessly falls back to original content while maintaining all language detection and metadata capabilities.

### User Impact
International guests immediately see property information in their preferred language without manual selection. Shareable links with language parameters open directly in the specified language, supporting use cases like QR codes in multilingual properties or international marketing materials. Search engine results show localized titles and descriptions, improving click-through rates for non-English searches. The experience feels personalized and professional as language preferences are automatically respected.

### Business Value
Eliminates the primary friction point for international guests by providing automatic language detection and translation application. Improves SEO performance in international markets by serving localized metadata to search engines. Enables powerful sharing scenarios where property owners can distribute language-specific links to different guest audiences. Demonstrates technical sophistication and commitment to international guest experiences, supporting expansion into non-English markets.

### Acceptance Criteria
- [ ] The page component checks for a language parameter in the URL query string
- [ ] When no URL parameter exists, the component checks for the guest language cookie
- [ ] When no cookie exists, the component parses the Accept-Language header from the request
- [ ] When no language can be detected, the component defaults to English
- [ ] Detected language codes are validated against supported languages before use
- [ ] The component fetches the complete item data including articles, links, and tags
- [ ] Translation data is retrieved for all content in the detected language
- [ ] Original content is merged with translation data using the appropriate utility function
- [ ] When translations are missing or incomplete, original content is used as fallback
- [ ] Translation metadata is extracted including status, source language, and version timestamps
- [ ] Translation metadata is passed to client components via props or context
- [ ] Page metadata generation uses the translated title when a translation is available
- [ ] Page metadata generation uses the translated description when a translation is available
- [ ] When showing translated content, metadata includes the original language in appropriate schema markup
- [ ] The page handles cases where the item does not exist with appropriate 404 responses
- [ ] The page handles database errors gracefully without exposing error details to guests
- [ ] Language detection logic follows the same priority order consistently across all guest pages
- [ ] The implementation follows Next.js 13+ server component patterns
- [ ] Type safety is maintained throughout with proper TypeScript interfaces

---

## REQ-E04-017: Update ItemDisplay Component with Translation Controls

**Date**: 2026-01-20 18:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The item display component should accept translation data and provide interactive controls for guests to switch between languages and view original content.

### Current Behavior
The ItemDisplay component renders item content only in the original language without any translation awareness. The component has no mechanism to accept translation data, display language selection controls, or toggle between translated and original versions. Guests viewing the component cannot discover available languages or change their language preference.

### Expected Behavior
The ItemDisplay component accepts translation metadata and original content as props, enabling it to display either translated or original versions based on guest preference. The component integrates the guest language hook to track current language selection and display state. A language switcher appears in the component header allowing guests to select from available translations. When displaying translated content, a translation banner appears showing the source language with an option to view the original. When a guest selects a language without available translation, a missing translation banner appears explaining that original content is being shown. The view original toggle allows guests to switch between translated and original content via client-side state without refetching data. All translation controls integrate seamlessly with the component's existing layout and design.

### User Impact
Guests viewing items gain full control over language selection directly within the item display without navigating away or refreshing the page. Visual banners provide clear context about translation status and source language. The ability to toggle between translated and original content empowers bilingual guests and those who want to verify translation accuracy. All controls remain accessible via keyboard navigation and screen readers.

### Business Value
Transforms the ItemDisplay component into a fully multilingual interface that supports international guest experiences without requiring authentication. Provides transparent communication about translation status that builds trust. The client-side toggle mechanism delivers instant switching between content versions, creating a responsive and modern user experience. This component serves as the primary interface for guests accessing shared property information, making its multilingual capabilities critical for international adoption.

### Acceptance Criteria
- [ ] The component accepts translation metadata as a prop including available languages and translation status
- [ ] The component accepts original content separately from translated content as props
- [ ] The component integrates the useGuestLanguage hook to track current language and display state
- [ ] The GuestLanguageSwitcher component is rendered in the header area of the display
- [ ] The language switcher displays all available languages with appropriate availability indicators
- [ ] When displaying translated content, the TranslationBanner component appears showing the source language
- [ ] The translation banner includes a "View original" action that triggers the display toggle
- [ ] When a guest selects a language without available translation, the MissingTranslationBanner appears
- [ ] The missing translation banner indicates which language was requested and which is being shown
- [ ] The component maintains client-side state for toggling between translated and original content
- [ ] Toggling to view original swaps displayed content without triggering a server refetch
- [ ] Toggling back to translation restores the translated content from props
- [ ] All translatable fields (title, description, articles, links, tags) respect the current display state
- [ ] The component handles cases where translation metadata is missing or malformed gracefully
- [ ] The component handles cases where original content is missing with appropriate fallbacks
- [ ] All new UI elements integrate with the component's existing styling and layout
- [ ] The header area accommodates the language switcher without breaking responsive design
- [ ] Translation banners appear in appropriate positions without disrupting content flow
- [ ] The component maintains accessibility for keyboard navigation and screen readers
- [ ] TypeScript types are updated to include translation-related props
- [ ] The component works correctly in both client-side navigation and direct page load scenarios

---

## REQ-E04-018: Update LinkCard Component with Translation Display Support

**Date**: 2026-01-20 08:40
**Type**: ENHANCEMENT
**Size**: S

### Summary
The LinkCard component should display translated link titles when available and allow guests to toggle back to viewing the original title.

### Current Behavior
The LinkCard component displays only the original title of links as created by the property owner. The component has no awareness of translation data or guest language preferences. When guests view items in their preferred language, link titles remain in the original language, creating an inconsistent multilingual experience.

### Expected Behavior
The LinkCard component accepts both original and translated title values as props. When a translated title is provided, the component displays it by default. The component respects a display toggle state that allows guests to switch to viewing the original title when desired. When no translation is available, the component displays the original title without any visual changes. The component integrates seamlessly with the existing LinkCard design, maintaining all current functionality such as click actions, styling, and layout while adding translation awareness.

### User Impact
Guests viewing items in their preferred language see link titles translated into that language, creating a cohesive multilingual experience throughout the item content. Bilingual guests or those who toggle to view original content see the original link titles, maintaining consistency with their display preference. The transition between translated and original titles is seamless and respects the guest's language preference settings.

### Business Value
Completes the multilingual experience for item content by ensuring all visible text elements respect guest language preferences. Demonstrates attention to detail in internationalization that builds credibility with international guests. Maintains consistency across all content elements, preventing the jarring experience of mixed-language displays that could reduce trust or comprehension.

### Acceptance Criteria
- [ ] The component accepts an original title prop that contains the link title in the source language
- [ ] The component accepts an optional translated title prop that contains the link title in the guest's preferred language
- [ ] When a translated title prop is provided and the guest is viewing translated content, the component displays the translated title
- [ ] When no translated title prop is provided, the component displays the original title
- [ ] The component accepts a display toggle state or prop indicating whether to show translated or original content
- [ ] When the display toggle indicates original content should be shown, the component displays the original title regardless of translation availability
- [ ] The component maintains all existing styling, layout, and click behavior
- [ ] The component handles undefined or null translated title props gracefully without errors
- [ ] The component handles empty string values for titles appropriately
- [ ] TypeScript prop types are updated to include the new translation-related props
- [ ] The component remains compatible with all existing usage patterns where only original title is provided
- [ ] No visual regression occurs in the component's appearance or spacing
- [ ] The component works correctly in both client-side and server-side rendering contexts

---

## REQ-E04-019: Support Language Parameter in Shareable Links

**Date**: 2026-01-20 08:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Guest-facing item pages should read and respect a language query parameter in the URL to enable shareable links that open directly in a specific language, while maintaining proper SEO practices with canonical URLs.

### Current Behavior
Guest item pages do not support language query parameters in the URL. When property owners create shareable links or QR codes for multilingual properties, they cannot include language preference in the URL. Every guest who accesses a shared link sees content in the default language or must manually select their preferred language after the page loads. Canonical URLs are not configured, potentially causing SEO issues with duplicate content across language variants.

### Expected Behavior
Guest item pages accept a URL query parameter such as `?lang=es` that specifies the desired display language. When a guest accesses a URL with this parameter, the page detects and applies the specified language immediately on load, showing all content in that language without requiring manual selection. The specified language takes priority over cookie-based preferences and browser language detection for that initial page view. The page automatically includes the selected language in any shareable link interface, allowing guests to copy URLs that preserve their current language choice. Page metadata includes a canonical URL that points to the version without language parameters, signaling to search engines that the base URL is the primary version regardless of language display. This prevents search engines from treating each language variant as duplicate content while still allowing language-specific sharing.

### User Impact
Guests who receive shareable links or scan QR codes with language parameters immediately see content in their intended language without needing to navigate language selection menus. Property owners can create and distribute language-specific links to different guest audiences, such as including Spanish-language QR codes in properties frequented by Spanish-speaking guests. The experience feels intelligent and personalized as the URL itself carries language context. Guests who want to share content with others in a specific language can do so confidently knowing the recipient will see the same language version.

### Business Value
Enables powerful distribution strategies where property owners target different language audiences with customized links. Supports use cases like multilingual QR codes placed in different areas of a property, language-specific marketing campaigns, and customer support scenarios where agents send language-appropriate links. Proper canonical URL implementation prevents SEO penalties from duplicate content while maintaining the flexibility of language-specific sharing. This feature differentiates the product in international markets by demonstrating sophisticated multilingual link management.

### Acceptance Criteria
- [ ] Guest item pages accept a query parameter named `lang` in the URL
- [ ] Valid language codes in the parameter trigger immediate display in that language on page load
- [ ] The language parameter takes priority over cookie-based language preferences
- [ ] The language parameter takes priority over browser Accept-Language header detection
- [ ] Invalid or unsupported language codes in the parameter are ignored and fallback detection occurs
- [ ] When a language parameter is present, the selected language is still persisted to the cookie for subsequent visits
- [ ] The page includes a canonical URL in the HTML meta tags
- [ ] The canonical URL points to the base page path without any language query parameters
- [ ] The canonical URL uses the full absolute URL format including protocol and domain
- [ ] Any shareable link functionality on the page includes the current language as a query parameter
- [ ] When guests copy or share the current page URL, the language parameter is preserved if they are viewing a non-default language
- [ ] When viewing the default language (English), shareable links do not include the language parameter
- [ ] The language parameter persists correctly through client-side navigation and browser back/forward actions
- [ ] Search engine crawlers see the canonical URL regardless of language parameters in the crawled URL
- [ ] The implementation follows Next.js best practices for query parameter handling in server components
- [ ] TypeScript types for page props include the language query parameter
- [ ] The feature works correctly in both development and production environments
- [ ] URL parameter handling is case-insensitive for language codes (e.g., `?lang=ES` and `?lang=es` both work)

---

## REQ-E04-020: Add Guest Language Detection to Middleware

**Date**: 2026-01-20 21:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The application middleware should detect guest language preferences for item pages and pass this information to downstream components via headers and cookies without performing URL redirects.

### Current Behavior
The middleware does not intercept requests to guest-facing item pages. No centralized language detection occurs at the middleware layer. Guest item pages must independently detect language from query parameters, cookies, and headers, duplicating detection logic across multiple page components. The middleware matcher does not include `/item/*` routes, meaning these guest-facing pages bypass any potential middleware processing entirely.

### Expected Behavior
The middleware matches on `/item/*` routes to intercept all guest item page requests. For matched requests, the middleware detects the guest's preferred language by examining (in priority order) the URL query parameter, existing cookies, and the Accept-Language header. Once detected, the language preference is set in both a custom response header for server-side components to read and a cookie for client-side persistence. The middleware completes processing by allowing the request to proceed to the page component without any URL redirection. Language information flows through the request pipeline via the header, eliminating the need for pages to re-implement detection logic. The URL structure remains unchanged as language is carried in query parameters rather than path segments.

### User Impact
Guests experience no visible change in page behavior or navigation patterns. The technical improvement happens transparently as middleware handles language detection before page rendering begins. Response times may improve slightly as pages can read pre-detected language from headers instead of re-parsing cookies and headers independently.

### Business Value
Centralizes language detection logic in a single location, eliminating code duplication across guest-facing pages and reducing the risk of inconsistent language handling. Establishes a scalable pattern for language detection that can easily extend to additional guest pages in the future. Improves maintainability by creating a single source of truth for guest language preference detection. Provides a foundation for future middleware-based features such as language-specific caching strategies or analytics.

### Acceptance Criteria
- [ ] The middleware matcher configuration includes the pattern `/item/*` to match all item page routes
- [ ] The middleware executes for all requests matching `/item/*` paths
- [ ] The middleware checks for a language query parameter in the request URL
- [ ] When a language query parameter is present and valid, it takes priority as the detected language
- [ ] When no query parameter exists, the middleware reads the guest language cookie value
- [ ] When no cookie exists, the middleware parses the Accept-Language header
- [ ] Accept-Language parsing respects quality values and selects the highest-priority supported language
- [ ] When no language can be detected through any method, the middleware defaults to English
- [ ] Detected language codes are validated against the list of supported languages
- [ ] Invalid or unsupported language codes are ignored and fallback detection continues
- [ ] The middleware sets a custom response header containing the detected language code
- [ ] The header name follows a consistent naming convention (e.g., `x-guest-language` or `x-faqbnb-lang`)
- [ ] The middleware sets or updates the guest language cookie with the detected value
- [ ] Cookie settings include appropriate expiration (1 year), path (/), Secure flag, and SameSite=Lax
- [ ] The middleware does NOT perform any URL redirects or path modifications
- [ ] The middleware does NOT add or remove query parameters from the URL
- [ ] Language information remains in the query parameter format, not in the URL path
- [ ] The response proceeds to the requested page component after middleware processing
- [ ] The middleware handles errors gracefully without blocking page requests
- [ ] When language detection fails, the middleware still allows the request to proceed with default language
- [ ] The middleware implementation follows Next.js 13+ middleware patterns and best practices
- [ ] TypeScript types are properly defined for middleware request and response handling
- [ ] The middleware performs efficiently without introducing noticeable latency
- [ ] The implementation does not conflict with existing middleware functionality for other routes

---

## REQ-E04-021: Create Server-Side Language Detection Utility

**Date**: 2026-01-20 23:15
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide a server-side utility function that detects guest language preferences from NextRequest objects by examining URL parameters, cookies, and headers in priority order.

### Current Behavior
No server-side utility exists to detect language preferences from incoming requests. Server components and API routes must manually parse URL parameters, read cookies from request headers, and interpret Accept-Language headers independently. This results in duplicated detection logic across different server-side code paths, inconsistent priority handling, and potential errors in header parsing.

### Expected Behavior
A server-side utility function accepts a NextRequest object and returns the detected guest language code. The function examines language sources in strict priority order: first checking URL query parameters for an explicit language selection, then reading the guest language cookie if no parameter exists, then parsing the Accept-Language header as a fallback, and finally defaulting to English when no preference can be determined. Accept-Language parsing respects HTTP quality values to select the highest-priority language that the application supports. Browser-specific language codes with regional variants are intelligently mapped to the application's supported language set. The function validates all detected language codes against supported languages before returning them. Invalid or unsupported codes trigger fallback to the next detection method rather than causing errors.

### User Impact
Guests experience no direct change, but the reliability and consistency of language detection improves across all server-rendered pages and API endpoints. Edge cases such as malformed headers, invalid language codes, or unusual browser configurations are handled gracefully, ensuring guests always see content in a predictable language even when detection encounters problems.

### Business Value
Establishes a single, well-tested implementation of server-side language detection that eliminates code duplication and reduces bugs. Ensures consistent language preference handling across all server components, API routes, and middleware that need language awareness. Creates a maintainable foundation for server-side internationalization that can easily accommodate new detection rules or priority changes in the future.

### Acceptance Criteria
- [ ] A utility function accepts a NextRequest object as its parameter
- [ ] The function returns a supported language code as a string
- [ ] The function first checks for a URL query parameter named `lang` or similar
- [ ] When a valid language code exists in the URL parameter, it is returned immediately
- [ ] When the URL parameter contains an invalid language code, detection continues to the next method
- [ ] When no URL parameter exists, the function reads the guest language cookie from request cookies
- [ ] The cookie name matches the constant defined in the cookie utility (e.g., `FAQBNB_GUEST_LANG`)
- [ ] When a valid language code exists in the cookie, it is returned
- [ ] When the cookie contains an invalid language code or does not exist, detection continues to the Accept-Language header
- [ ] The function parses the Accept-Language header according to HTTP standards
- [ ] Accept-Language quality values (q-values) are respected to prioritize languages correctly
- [ ] Multiple languages in the header are evaluated in priority order until a supported language is found
- [ ] Regional language codes (e.g., en-US, pt-BR, zh-CN) are mapped to supported base languages (e.g., en, pt, zh)
- [ ] When no language can be detected from any source, the function defaults to English
- [ ] All returned language codes are validated against the supported languages constant
- [ ] The function handles malformed Accept-Language headers gracefully without throwing errors
- [ ] The function handles missing request cookies gracefully without throwing errors
- [ ] The function handles null or undefined NextRequest objects gracefully with appropriate fallback
- [ ] The function is a pure function with no side effects (does not modify cookies or headers)
- [ ] The function is exported from the guest language module at `/src/lib/i18n/guest-language.ts`
- [ ] TypeScript types ensure type safety for the NextRequest parameter and return value
- [ ] The implementation follows Next.js best practices for server-side request handling
- [ ] The function includes inline documentation describing the priority order and return behavior

---

## REQ-E04-022: Create Server-Side Language Detection Utility Function

**Date**: 2026-01-20 23:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide a dedicated server-side utility function that reads guest language preferences from NextRequest cookies and headers with defined priority logic.

### Current Behavior
No server-side function exists specifically for detecting guest language from server-side request contexts. Server components and middleware that need to determine guest language preferences must implement their own parsing logic for cookies and Accept-Language headers, leading to duplicate code and inconsistent detection behavior.

### Expected Behavior
A server-side utility function accepts a NextRequest object and returns the detected guest language code by examining request data in strict priority order. The function first checks for an explicit language parameter in the URL query string, providing the highest priority to intentional user selection. When no URL parameter exists, the function reads the guest language cookie to retrieve stored preferences from previous sessions. When no cookie is found, the function parses the Accept-Language header to infer language preference from browser settings. Finally, when no language can be determined through any method, the function defaults to English. The function validates all detected language codes against the application's supported languages, rejecting invalid codes and continuing to the next detection method. The implementation handles edge cases such as malformed headers, corrupted cookies, and missing data without throwing errors.

### User Impact
Guests experience no visible change in behavior, but language detection becomes more reliable and consistent across all server-rendered pages and API endpoints. Edge cases that previously might have resulted in errors or incorrect language display are handled gracefully, ensuring guests always see content in a predictable language.

### Business Value
Eliminates code duplication by centralizing server-side language detection logic in a single, well-tested utility function. Ensures consistent language preference handling across all server components, reducing bugs and maintenance burden. Creates a reusable foundation that other server-side features can build upon when language awareness is needed.

### Acceptance Criteria
- [ ] A utility function is created in the file at path `/src/lib/i18n/guest-language.ts`
- [ ] The function accepts a NextRequest object from Next.js as its parameter
- [ ] The function returns a string containing a valid supported language code
- [ ] Priority order is strictly followed: URL parameter > Cookie > Accept-Language header > Default (English)
- [ ] The function checks the URL query string for a language parameter (e.g., `lang` or `language`)
- [ ] When a valid URL parameter is found, it is returned immediately without checking other sources
- [ ] When the URL parameter is invalid or missing, detection proceeds to check cookies
- [ ] The function reads the guest language cookie using the standard cookie name
- [ ] When a valid cookie value is found, it is returned without checking headers
- [ ] When the cookie is invalid or missing, detection proceeds to parse the Accept-Language header
- [ ] Accept-Language parsing follows HTTP standards and respects quality values
- [ ] Regional language variants (e.g., en-US, zh-CN) are mapped to supported base languages (e.g., en, zh)
- [ ] When multiple languages are present in Accept-Language, the highest-priority supported language is selected
- [ ] When no language can be detected from any source, the function returns English as the default
- [ ] All detected language codes are validated against the supported languages list before being returned
- [ ] Invalid language codes are rejected and trigger fallback to the next detection method
- [ ] The function handles malformed Accept-Language headers without throwing errors
- [ ] The function handles missing or corrupted cookies without throwing errors
- [ ] The function handles null or undefined NextRequest parameters gracefully
- [ ] The function is a pure function with no side effects (does not modify request state)
- [ ] TypeScript types ensure proper type safety for parameters and return values
- [ ] The function is exported from the guest-language module for use by other server-side code

---

## REQ-E04-023: Validate Language Detection Priority and Fallback Scenarios

**Date**: 2026-01-20 23:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system should undergo comprehensive testing to verify that the language detection priority chain works correctly across all scenarios including browser preferences, cookie persistence, URL parameters, and fallback logic.

### Current Behavior
Language detection utilities, middleware, and page components have been implemented with a defined priority order, but no systematic testing has verified that the detection chain functions correctly in real-world scenarios. Browser language detection may not correctly parse Accept-Language headers. Cookie preferences may fail to override browser settings as intended. URL parameters may not take precedence over cookies. Fallback to original content when translations are missing may not work reliably. Without validation, guests could experience unpredictable language selection behavior that degrades the multilingual experience.

### Expected Behavior
Testing confirms that browser Accept-Language headers are correctly parsed and mapped to supported languages, with regional variants properly handled. Tests verify that when a guest sets a language preference via the language switcher, a cookie is created that overrides browser language detection on subsequent page loads. Tests demonstrate that URL parameters with language codes take the highest priority, overriding both cookie preferences and browser settings. Tests validate that when a requested translation is unavailable, the system seamlessly falls back to displaying original content with appropriate messaging. Edge cases are tested including malformed headers, invalid language codes, missing cookies, and conflicting language signals from multiple sources.

### User Impact
Guests experience predictable and reliable language selection behavior regardless of how they access content or what language preferences are configured in their browser. When guests explicitly select a language, that choice is consistently honored across sessions. When guests use shareable links with language parameters, content appears in the correct language immediately. When translations are incomplete, guests see original content rather than broken or partial displays.

### Business Value
Validates that the significant investment in multilingual infrastructure delivers a reliable guest experience. Identifies and enables correction of any gaps in language detection logic before international guests encounter problems. Builds confidence in the language selection mechanism that is critical for international market expansion. Provides documented test scenarios that serve as regression tests for future development.

### Acceptance Criteria
- [ ] Test case verifies Accept-Language header parsing extracts the highest-priority supported language
- [ ] Test case verifies regional language variants in Accept-Language are mapped to base supported languages
- [ ] Test case verifies multiple languages in Accept-Language are evaluated in correct quality-value order
- [ ] Test case verifies that setting a language via the language switcher creates a persistent cookie
- [ ] Test case verifies the language cookie has correct expiration period of 1 year
- [ ] Test case verifies the cookie includes Secure and SameSite attributes as specified
- [ ] Test case verifies a returning guest with a language cookie sees content in the cookie's language
- [ ] Test case verifies the language cookie overrides Accept-Language header when both are present
- [ ] Test case verifies a URL with language parameter displays content in the specified language immediately
- [ ] Test case verifies URL parameter language takes precedence over existing cookie preference
- [ ] Test case verifies URL parameter language takes precedence over Accept-Language header
- [ ] Test case verifies URL parameter with invalid language code falls back to cookie or browser detection
- [ ] Test case verifies that requesting a language with no available translation shows original content
- [ ] Test case verifies MissingTranslationBanner appears when requested translation is unavailable
- [ ] Test case verifies original content displays correctly when translation fallback occurs
- [ ] Test case verifies translation metadata correctly indicates fallback status
- [ ] Test case verifies default to English occurs when no language can be detected from any source
- [ ] Test case verifies malformed Accept-Language headers do not cause errors and trigger fallback
- [ ] Test case verifies missing or corrupted cookie values do not cause errors and trigger fallback
- [ ] Test case verifies the complete priority chain: URL parameter > Cookie > Accept-Language > Default English
- [ ] All test cases are documented with steps to reproduce and expected outcomes
- [ ] Test results are recorded showing pass/fail status for each scenario
- [ ] Any identified issues are documented with reproduction steps and severity assessment

---


---

## REQ-E04-024: Validate Content Display Scenarios with Translation System

**Date**: 2026-01-20 21:00
**Type**: ENHANCEMENT
**Size**: M
**Last Modified**: 2026-01-20 21:00

### Summary
The system should undergo comprehensive testing to verify that translated content displays correctly to guests, original content appears when no translation exists, the view original toggle functions instantly, and the language switcher updates content appropriately.

### Current Behavior
Translation infrastructure, guest components, and language detection mechanisms have been implemented, but no systematic testing has validated that content display scenarios work correctly from the guest perspective. Translated content may not render properly when available. Original content fallback when translations are missing may fail or display incorrectly. The view original toggle may cause delays or incorrect content display. The language switcher may not trigger proper content updates when guests select different languages. Without validation, guests could encounter broken translation displays, missing content, or non-functional language controls that undermine the entire multilingual experience.

### Expected Behavior
Testing confirms that when a guest views an item with available translations in their selected language, all translatable content fields (title, description, articles, links, tags) display the translated versions correctly. Tests verify that when a guest selects a language for which no translation exists, the system gracefully displays the original content without errors or blank fields. Tests demonstrate that the view original toggle switches between translated and original content instantly without network delays or page reloads, providing responsive client-side state management. Tests validate that when a guest uses the language switcher to select a different language, all content on the page updates to reflect the new language choice, fetching translations if necessary or falling back to original content appropriately.

### User Impact
Guests viewing translated content see accurate, complete translations across all content fields without missing or broken elements. Guests who select languages without translations still see complete, usable content in the original language with clear messaging about translation availability. Bilingual guests or those verifying translations can instantly toggle between versions without waiting for page reloads, creating a responsive and modern experience. Guests exploring different language options see immediate content updates that reflect their selection, building confidence in the language selection interface.

### Business Value
Validates that the complete translation system delivers a reliable, high-quality multilingual experience that meets international guest expectations. Identifies any gaps or bugs in content display logic before guests encounter them, protecting the application's reputation in international markets. Confirms that client-side performance optimizations (like instant toggling) work correctly, demonstrating technical sophistication. Provides documented test scenarios that serve as regression tests when adding new features or content types to the translation system.

### Acceptance Criteria
- [ ] Test case verifies translated item title displays correctly when viewing item in a language with available translation
- [ ] Test case verifies translated item description displays correctly when translation is available
- [ ] Test case verifies all article content within an item displays translated versions when available
- [ ] Test case verifies all link titles display translated versions when available
- [ ] Test case verifies all tag names display translated versions when available
- [ ] Test case verifies that when no translation exists for selected language, original item title displays without errors
- [ ] Test case verifies that when no translation exists, original description displays completely and correctly
- [ ] Test case verifies that when no translation exists, original articles display without missing content
- [ ] Test case verifies that when no translation exists, original link titles display correctly
- [ ] Test case verifies that when no translation exists, original tag names display correctly
- [ ] Test case verifies MissingTranslationBanner appears when displaying original content due to missing translation
- [ ] Test case verifies banner message correctly identifies the requested language and fallback language
- [ ] Test case verifies clicking view original toggle switches from translated to original content instantly
- [ ] Test case verifies toggle action completes in under 200 milliseconds without network requests
- [ ] Test case verifies all content fields (title, description, articles, links, tags) update simultaneously during toggle
- [ ] Test case verifies toggling back to translation restores the translated content instantly
- [ ] Test case verifies toggle state persists correctly during multiple back-and-forth switches
- [ ] Test case verifies selecting a new language via language switcher updates all visible content
- [ ] Test case verifies language switcher triggers appropriate data fetching when translations are not yet loaded
- [ ] Test case verifies language switcher updates TranslationBanner to show correct source language after switch
- [ ] Test case verifies language switcher causes MissingTranslationBanner to appear when switching to untranslated language
- [ ] Test case verifies language selection is persisted to cookie and honored on subsequent page loads
- [ ] Test case verifies content updates handle partial translations correctly, showing translated fields and original fields appropriately
- [ ] Test case verifies no content flashing or layout shifts occur during language switches or toggle actions
- [ ] Test case verifies all scenarios work correctly on both desktop and mobile viewports
- [ ] All test cases are documented with clear steps to reproduce and expected outcomes
- [ ] Test results are recorded showing pass/fail status for each content display scenario
- [ ] Any identified display issues are documented with reproduction steps, screenshots, and severity assessment

---

## REQ-E04-025: Test Edge Cases for Guest Language Detection and Display

**Date**: 2026-01-20 14:30
**Type**: ENHANCEMENT
**Size**: M
**Last Modified**: 2026-01-20 14:30

### Summary
The system should undergo comprehensive edge case testing to verify that guest language detection and translation display handle exceptional scenarios gracefully, including missing translations for partial fields, blocked cookies, malformed Accept-Language headers, and unsupported language codes.

### Current Behavior
The guest localization infrastructure has been implemented with language detection utilities, cookie persistence, header parsing, and translation display components. However, no systematic testing has validated how the system behaves when encountering edge cases that deviate from normal operation. Edge cases such as missing translations for only some fields (partial translations), browsers or users with cookies blocked, malformed or unusual Accept-Language headers, and requests for unsupported language codes may cause unexpected behavior, errors, or degraded user experiences. Without explicit testing of these scenarios, production guests may encounter failures or confusing behavior when their environment differs from standard assumptions.

### Expected Behavior
Testing confirms that when translations exist for some fields but not others (partial translations), the system displays translated content for available fields and gracefully falls back to original content for untranslated fields within the same content item, creating a coherent mixed-language display when necessary. Tests verify that when cookies are blocked or unavailable due to browser settings, privacy tools, or incognito mode, the language detection system continues to function by relying on URL parameters and Accept-Language headers without errors or crashes. Tests demonstrate that malformed Accept-Language headers including empty values, invalid quality factors, improperly formatted strings, and unusual character encodings do not cause errors and trigger appropriate fallback behavior. Tests validate that requests containing unsupported language codes (languages not in the supported six-language set) are handled gracefully by falling back to the next detection method or defaulting to English without error messages or broken UI.

### User Impact
Guests with partial translations see coherent content that maximizes translated fields while filling gaps with original language content, rather than broken pages or missing fields. Privacy-conscious guests using cookie-blocking tools or incognito mode can still use language features through URL parameters or browser settings, experiencing no functionality loss. Guests with unusual browser configurations or language settings that produce non-standard Accept-Language headers do not encounter errors or blank pages. Guests who request unsupported languages (perhaps through URL manipulation or unusual browser settings) see appropriate fallback content rather than error messages or broken interfaces. The system demonstrates resilience across the diverse range of guest environments encountered in production.

### Business Value
Validates system resilience against real-world edge cases that could undermine guest trust and cause support burden if unhandled. Ensures the multilingual experience remains functional for privacy-conscious guests and those with non-standard configurations, expanding the effective audience reach. Demonstrates technical robustness that builds confidence for international market expansion. Identifies potential failure modes before guests encounter them, enabling proactive fixes that protect the application's reputation. Creates documented edge case tests that serve as regression tests for future development and refactoring.

### Acceptance Criteria

#### Missing Translation for Some Fields (Partial Translations)
- [ ] Test case verifies system behavior when item has translated title but original description
- [ ] Test case verifies system behavior when item has translated description but original title
- [ ] Test case verifies articles display correctly when some articles have translations and others do not
- [ ] Test case verifies link titles display correctly with mix of translated and untranslated links
- [ ] Test case verifies tag names display correctly with partial tag translations
- [ ] Test case verifies TranslationBanner displays appropriately for partially translated content
- [ ] Test case verifies no visual gaps, missing content, or layout breaks occur with partial translations
- [ ] Test case verifies translation metadata correctly reflects partial translation status
- [ ] Test case verifies view original toggle switches ALL fields to original, not just partially translated fields
- [ ] Test case verifies language switcher handles partial translations without errors

#### Cookie Blocked Scenario
- [ ] Test case simulates browser with cookies blocked entirely
- [ ] Test case verifies language detection falls back to Accept-Language header when cookies unavailable
- [ ] Test case verifies URL language parameter still functions when cookies are blocked
- [ ] Test case verifies no JavaScript errors occur when cookie set operations fail
- [ ] Test case verifies no error messages display to user when cookies are unavailable
- [ ] Test case verifies language switcher remains functional in incognito/private browsing mode
- [ ] Test case verifies repeated visits without cookies use Accept-Language detection each time
- [ ] Test case verifies the system does not crash or hang when attempting to read blocked cookies
- [ ] Test case verifies appropriate graceful degradation message is logged (if applicable) but not shown to user
- [ ] Test case verifies guest can still manually select language via URL parameter when cookies blocked

#### Malformed Accept-Language Header
- [ ] Test case verifies handling of empty Accept-Language header value
- [ ] Test case verifies handling of Accept-Language header with only whitespace
- [ ] Test case verifies handling of Accept-Language header with invalid quality factor (e.g., q=abc, q=2.0, q=-1)
- [ ] Test case verifies handling of Accept-Language header with missing quality separator (e.g., "en;0.8" instead of "en;q=0.8")
- [ ] Test case verifies handling of Accept-Language header with duplicate languages
- [ ] Test case verifies handling of Accept-Language header with unusual but valid language tags (e.g., "i-klingon", "x-custom")
- [ ] Test case verifies handling of Accept-Language header exceeding typical length (very long header string)
- [ ] Test case verifies handling of Accept-Language header with special characters or encoding issues
- [ ] Test case verifies handling of Accept-Language header with only unsupported languages listed
- [ ] Test case verifies all malformed header scenarios fall back gracefully to default English without errors
- [ ] Test case verifies no server errors or 500 responses occur from malformed headers
- [ ] Test case verifies malformed headers do not cause excessive logging or performance degradation

#### Unsupported Language Code
- [ ] Test case verifies behavior when URL parameter contains unsupported language code (e.g., ?lang=kl for Klingon)
- [ ] Test case verifies behavior when cookie contains an unsupported language code value
- [ ] Test case verifies behavior when Accept-Language header contains only unsupported languages
- [ ] Test case verifies unsupported language codes in URL parameter trigger fallback to cookie detection
- [ ] Test case verifies unsupported language codes in cookie trigger fallback to Accept-Language detection
- [ ] Test case verifies unsupported languages in Accept-Language trigger fallback to default English
- [ ] Test case verifies no error messages display to guest when unsupported language is requested
- [ ] Test case verifies language switcher does not display unsupported languages as options
- [ ] Test case verifies system does not attempt to fetch translations for unsupported language codes
- [ ] Test case verifies unsupported language codes are sanitized and do not pose injection risks
- [ ] Test case verifies case variations of unsupported codes (e.g., "KL", "Kl", "kL") are handled consistently
- [ ] Test case verifies partial matches to supported languages are handled appropriately (e.g., "esp" vs "es")

#### General Edge Case Validation
- [ ] All edge case scenarios are tested on both desktop and mobile viewports
- [ ] All edge case scenarios are tested in at least two major browsers (Chrome, Safari or Firefox)
- [ ] Error handling does not expose internal system details or stack traces to guests
- [ ] System maintains performance within acceptable thresholds during edge case handling
- [ ] All test cases are documented with clear reproduction steps and expected outcomes
- [ ] Test results are recorded with pass/fail status and any observed deviations from expected behavior
- [ ] Any identified issues are documented with reproduction steps, severity assessment, and recommended fixes

---

## REQ-E04-026: Validate Mobile Responsiveness of Guest Localization Features

**Date**: 2026-01-20 22:30
**Type**: ENHANCEMENT
**Size**: M
**Last Modified**: 2026-01-20 22:30

### Summary
The system should undergo comprehensive mobile responsiveness testing to verify that the guest language switcher remains accessible on small screens, translation banners do not obscure critical content, and all interactive controls are touch-friendly.

### Current Behavior
Guest localization components have been implemented including the language switcher dropdown, translation banners, view original toggle, and language indicator. While these components may have responsive styling, no systematic testing has validated their behavior on mobile devices with various screen sizes and touch interactions. The language switcher dropdown may become difficult to access or interact with on small screens. Translation banners may cover important content or consume excessive vertical space on mobile viewports. Interactive buttons and toggle controls may have touch targets that are too small for comfortable mobile interaction. Without mobile-specific validation, guests accessing content on smartphones and tablets may encounter usability issues that degrade the multilingual experience.

### Expected Behavior
Testing confirms that the language switcher dropdown remains fully accessible and usable on mobile devices including small smartphones with screen widths as narrow as 320 pixels. The dropdown opens smoothly with touch interaction, displays all language options in a scrollable list when necessary, and allows touch selection without accidental selections or interaction problems. Translation banners appear prominently to communicate translation status but do not obscure critical content such as item titles, primary descriptions, or action buttons. Banner heights adjust appropriately for mobile viewports while remaining readable. All interactive controls including language switcher triggers, view original toggles, and banner action links have touch targets meeting minimum size recommendations for mobile accessibility. Spacing between interactive elements prevents accidental touches on adjacent controls. Typography remains readable at mobile font sizes without requiring zoom gestures.

### User Impact
Guests accessing content via smartphones and tablets enjoy the same high-quality multilingual experience as desktop users. Language selection is easily accessible without awkward interactions or difficult-to-tap controls. Translation banners provide important context without frustrating guests by covering content they are trying to read. All interactive elements respond reliably to touch input with appropriately sized touch targets that reduce errors and frustration. Mobile guests can switch languages, view originals, and interact with all localization features using natural touch gestures without requiring desktop-style precision.

### Business Value
Validates that the significant investment in guest localization delivers value across all device types, not just desktop browsers. Given that international travelers frequently use mobile devices to access property information, mobile usability is critical for international market success. Prevents negative reviews or support requests related to mobile usability issues with language features. Demonstrates commitment to mobile-first or mobile-friendly design principles that align with modern web application standards. Ensures the guest experience remains consistent across devices, building trust and satisfaction with international guests regardless of how they access content.

### Acceptance Criteria

#### Language Switcher on Small Screens
- [ ] Test case verifies language switcher dropdown trigger is visible and tappable on 320px width screens
- [ ] Test case verifies language switcher dropdown trigger has touch target at least 44x44 pixels per iOS guidelines
- [ ] Test case verifies dropdown opens smoothly with single tap without requiring double-tap or long-press
- [ ] Test case verifies opened dropdown displays all language options without horizontal scrolling
- [ ] Test case verifies dropdown list scrolls vertically when language options exceed viewport height
- [ ] Test case verifies individual language options have adequate spacing to prevent accidental selection of adjacent options
- [ ] Test case verifies selected language is clearly highlighted in the dropdown list on mobile
- [ ] Test case verifies dropdown closes appropriately when tapping outside the dropdown area
- [ ] Test case verifies language switcher integrates appropriately in mobile header layout without causing overflow
- [ ] Test case verifies flag icons remain visible and recognizable at mobile sizes
- [ ] Test case verifies language names are fully readable without truncation on narrow screens

#### Translation Banners on Mobile
- [ ] Test case verifies TranslationBanner appears above primary content on mobile layouts
- [ ] Test case verifies TranslationBanner does not obscure item title or primary description
- [ ] Test case verifies banner height is appropriate for mobile viewports without consuming excessive screen space
- [ ] Test case verifies banner text remains readable at mobile font sizes
- [ ] Test case verifies "View original" action link in banner has adequate touch target size
- [ ] Test case verifies banner icon and text layout adapts appropriately for narrow screens
- [ ] Test case verifies MissingTranslationBanner displays appropriately without obscuring content
- [ ] Test case verifies multiple banners do not stack in ways that consume excessive mobile screen space
- [ ] Test case verifies banner styling remains visually distinct from surrounding content on mobile
- [ ] Test case verifies banners do not cause horizontal scrolling on mobile viewports
- [ ] Test case verifies banner persistence does not interfere with mobile navigation gestures

#### Touch-Friendly Interactive Controls
- [ ] Test case verifies view original toggle button has touch target at least 44x44 pixels
- [ ] Test case verifies spacing between view original toggle and nearby interactive elements prevents accidental touches
- [ ] Test case verifies toggle responds immediately to touch without requiring precise tap positioning
- [ ] Test case verifies language indicator in header is readable and appropriately sized on mobile
- [ ] Test case verifies any interactive elements in language indicator have adequate touch targets
- [ ] Test case verifies all buttons use appropriate active/pressed states visible on touch devices
- [ ] Test case verifies touch interactions do not trigger browser zoom when double-tapping controls
- [ ] Test case verifies dropdown menu options respond reliably to touch without requiring precise targeting
- [ ] Test case verifies touch interactions provide immediate visual feedback indicating the action was registered
- [ ] Test case verifies no interactive elements are positioned too close to screen edges where touch is difficult

#### Mobile Layout and Typography
- [ ] Test case verifies all localization components maintain readable typography on screens as small as 320px width
- [ ] Test case verifies no content requires horizontal scrolling on mobile devices
- [ ] Test case verifies language switcher, banners, and controls adapt layout appropriately for portrait mobile orientation
- [ ] Test case verifies language switcher, banners, and controls adapt layout appropriately for landscape mobile orientation
- [ ] Test case verifies components maintain visual hierarchy on mobile so most important elements are prominent
- [ ] Test case verifies component spacing prevents visual crowding on small screens
- [ ] Test case verifies all text remains readable without requiring pinch-to-zoom gestures

#### Cross-Device and Browser Testing
- [ ] Test cases are executed on actual iOS devices or high-fidelity simulators
- [ ] Test cases are executed on actual Android devices or high-fidelity emulators
- [ ] Test cases verify behavior on both mobile Chrome and mobile Safari browsers
- [ ] Test cases verify behavior on tablet-sized viewports in addition to phone-sized screens
- [ ] Test cases verify behavior across multiple screen densities and pixel ratios
- [ ] Test cases document any device-specific or browser-specific issues encountered

#### General Mobile Usability
- [ ] Test case verifies language selection changes persist correctly when navigating on mobile
- [ ] Test case verifies mobile users can complete entire workflow from language selection to content viewing without desktop assistance
- [ ] Test case verifies no JavaScript errors occur during mobile touch interactions
- [ ] Test case verifies page performance remains acceptable on mobile devices during language switching
- [ ] All test cases are documented with device specifications, screen sizes, and clear reproduction steps
- [ ] Test results are recorded with pass/fail status and screenshots showing mobile behavior
- [ ] Any identified mobile usability issues are documented with reproduction steps, affected devices, and severity assessment

---

## REQ-E04-027: Validate Performance of Guest Language Detection and Content Display

**Date**: 2026-01-20 15:30
**Type**: ENHANCEMENT
**Size**: M
**Last Modified**: 2026-01-20 15:30

### Summary
The system should undergo performance testing to verify that language detection completes in under 10 milliseconds, content retrieval with translations completes in under 200 milliseconds, and client-side language switching completes in under 100 milliseconds.

### Current Behavior
Guest localization features have been implemented including language detection from cookies and headers, server-side content retrieval with translation merging, and client-side language switching via React state management. While functional implementation is complete, no systematic performance validation has confirmed these operations meet acceptable performance thresholds for production use. Language detection may introduce latency if cookie parsing or header processing is inefficient. Content retrieval with translation merging may exceed acceptable response times if database queries or data transformation logic is not optimized. Client-side language switching may feel sluggish if state updates trigger excessive re-renders or complex processing. Without performance validation, guests may experience delays that degrade the perceived quality of the multilingual experience.

### Expected Behavior
Testing confirms that server-side language detection including reading cookies, parsing Accept-Language headers, validating language codes, and determining the final language selection completes in under 10 milliseconds on average. Content retrieval operations including fetching items with all related content, querying translation tables, merging original and translated content, and preparing the response payload complete in under 200 milliseconds from request receipt to response transmission. Client-side language switching triggered by the language switcher component completes in under 100 milliseconds from user interaction to visual update of all content fields on screen. Performance measurements are taken under realistic conditions including representative database query loads, typical content sizes with multiple articles and links, and various network latency scenarios. Measurements identify any performance bottlenecks in the localization pipeline such as inefficient database queries, excessive data transformation overhead, or suboptimal client-side rendering patterns.

### User Impact
Guests experience near-instantaneous language detection when accessing item pages, with no perceptible delay between page request and content rendering. Content loads quickly even when translations are applied, matching the performance expectations guests have for modern web applications. When guests switch languages using the language switcher, content updates immediately with no noticeable lag, creating a responsive and fluid interface that feels like a native application. The overall experience feels polished and performant, building confidence in the quality and professionalism of the multilingual features.

### Business Value
Validates that localization infrastructure meets professional performance standards required for international market success. Fast language detection ensures guests do not experience delays during the critical first impression when accessing shared content. Quick content retrieval with translations maintains engagement and reduces bounce rates that could occur if pages load slowly. Instant client-side language switching demonstrates technical sophistication and creates positive user experiences that differentiate the product from competitors. Performance validation identifies optimization opportunities before scaling to larger content volumes or higher traffic from international markets. Documented performance characteristics provide baseline metrics for regression testing as features evolve.

### Acceptance Criteria

#### Language Detection Performance (< 10ms)
- [ ] Performance test measures time from request receipt to language detection completion
- [ ] Test measurement includes reading cookie values from request headers
- [ ] Test measurement includes parsing Accept-Language header with multiple languages and quality values
- [ ] Test measurement includes validating detected language code against supported languages list
- [ ] Test measurement includes fallback logic execution when primary detection methods fail
- [ ] Average language detection time across 100 test requests is under 10 milliseconds
- [ ] 95th percentile language detection time is under 15 milliseconds
- [ ] 99th percentile language detection time is under 25 milliseconds
- [ ] Language detection performance remains consistent when Accept-Language header contains 5+ languages
- [ ] Language detection performance remains consistent when cookie is missing and fallback occurs
- [ ] No single language detection operation exceeds 50 milliseconds under normal conditions
- [ ] Performance measurements are taken on representative server hardware or production environment

#### Content with Translation Retrieval Performance (< 200ms)
- [ ] Performance test measures total time from request receipt to complete response transmission
- [ ] Test measurement includes fetching item data with all related articles, links, and tags
- [ ] Test measurement includes querying translation tables for all content elements in requested language
- [ ] Test measurement includes merging original content with translation data using utility functions
- [ ] Test measurement includes constructing response payload with translation metadata
- [ ] Test uses representative content items with at least 5 articles, 10 links, and 15 tags
- [ ] Average response time across 100 test requests is under 200 milliseconds
- [ ] 95th percentile response time is under 300 milliseconds
- [ ] 99th percentile response time is under 500 milliseconds
- [ ] Response time remains under threshold when translations exist for all content elements
- [ ] Response time remains under threshold when translations are missing and fallback occurs
- [ ] Response time remains under threshold when partial translations exist (some fields translated, others not)
- [ ] Database query performance is analyzed to identify optimization opportunities if thresholds are not met
- [ ] Performance measurements account for realistic network latency between application server and database

#### Client-Side Language Switch Performance (< 100ms)
- [ ] Performance test measures time from user interaction to complete content update on screen
- [ ] Test measurement includes React state update triggered by language switcher selection
- [ ] Test measurement includes component re-render for all content elements affected by language change
- [ ] Test measurement includes DOM updates to display new language content
- [ ] Test measurement includes any visual transition effects or animations
- [ ] Test uses representative content items with at least 5 articles, 10 links, and 15 tags
- [ ] Average language switch time across 50 user interactions is under 100 milliseconds
- [ ] 95th percentile language switch time is under 150 milliseconds
- [ ] 99th percentile language switch time is under 200 milliseconds
- [ ] Client-side toggle between translated and original content completes within same performance threshold
- [ ] Performance remains consistent when switching between different language pairs
- [ ] Performance remains consistent on both desktop and mobile devices
- [ ] Performance measurements are taken using browser developer tools performance profiling
- [ ] React DevTools Profiler is used to identify component rendering bottlenecks if thresholds are not met

#### Performance Bottleneck Identification and Documentation
- [ ] All performance tests are executed in an environment that closely simulates production conditions
- [ ] Performance measurements are repeated at least 100 times for statistical significance
- [ ] Outlier measurements are analyzed to identify causes of performance degradation
- [ ] Database query execution times are measured separately to identify slow queries
- [ ] Data transformation and merging logic execution times are measured separately
- [ ] Client-side rendering performance is profiled to identify expensive component updates
- [ ] Any performance measurements exceeding thresholds are documented with root cause analysis
- [ ] Optimization recommendations are documented for any identified bottlenecks
- [ ] Performance test results are documented including average, median, 95th percentile, and 99th percentile times
- [ ] Performance characteristics are documented as baseline metrics for future regression testing

#### Cross-Environment Performance Validation
- [ ] Performance tests are executed on desktop browser environments
- [ ] Performance tests are executed on mobile browser environments to validate client-side performance on constrained devices
- [ ] Performance tests are executed with varying database loads to ensure consistency under different conditions
- [ ] Performance tests are executed with items of different content sizes (small, medium, large)
- [ ] Performance tests account for cold start scenarios where caches are empty
- [ ] Performance tests account for warm cache scenarios where repeated requests benefit from caching
- [ ] Any performance degradation on mobile devices is documented and assessed for acceptability
- [ ] Performance validation confirms the system meets thresholds under realistic production-like conditions

---

