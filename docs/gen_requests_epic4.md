# Generated Requests - Epic 4

This file contains auto-generated feature requests for L10N Epic 4.

---

## REQ-304: Create Localization Types File

**Date**: 2026-01-18 (generated)
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide a centralized type definition file that establishes the type contracts for all localization and internationalization features.

### Current Behavior
No dedicated type definitions exist for localization concerns, forcing developers to define language types and translation structures inline or inconsistently across components.

### Expected Behavior
A dedicated types file exists that exports all necessary TypeScript types, interfaces, and constants for localization, including supported languages, language metadata, and translated content structures. Developers import these types when working with any localization feature.

### User Impact
Developers working on localization features have consistent, type-safe definitions to work with, reducing errors and improving development velocity. The application gains a single source of truth for which languages are supported.

### Business Value
Establishes a strong foundation for the entire localization system, ensuring type safety and consistency across all internationalization features. Reduces maintenance burden by centralizing language definitions.

### Acceptance Criteria
- [ ] Type definitions include supported language codes with proper TypeScript constraints
- [ ] Language metadata interface includes display names, text direction, and locale formatting information
- [ ] Translated content types support both simple string translations and rich content structures
- [ ] A constant exports the complete list of supported languages with their metadata
- [ ] Utility type definitions exist for translation keys, language detection, and preference storage
- [ ] All types are properly exported and can be imported by other modules
- [ ] Documentation comments explain the purpose of each major type and interface

---

## REQ-305: Create Guest Language Detection and Preference Utility Module

**Date**: 2026-01-18 13:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide utilities to automatically detect guest language preferences and persist those preferences across sessions.

### Current Behavior
The application does not detect or store language preferences for unauthenticated guests. All users see the same default language regardless of their browser settings or previous language selections.

### Expected Behavior
When a guest visits the application, the system automatically detects their preferred language from multiple sources in priority order: URL parameters, stored cookies, and browser Accept-Language headers. Once detected or manually selected, the preference is stored and remembered across sessions. The system intelligently maps browser language codes to the closest supported language when exact matches are unavailable.

### User Impact
Guests see content in their preferred language immediately upon arrival, without needing to manually select it on every visit. International visitors have a seamless, localized experience from their first interaction with the platform.

### Business Value
Reduces friction for international users and increases engagement by providing automatic language detection. Creates a more professional, globally-aware first impression that can improve conversion rates for international markets.

### Acceptance Criteria
- [ ] Language detection function examines URL parameters first, then cookies, then Accept-Language headers
- [ ] Browser Accept-Language header is correctly parsed to extract preferred language codes with quality weights
- [ ] Language codes from browsers are mapped to the nearest supported language when no exact match exists
- [ ] Selected language preference is persisted in a cookie that survives browser sessions
- [ ] Cookie storage function sets appropriate expiration, path, and security attributes
- [ ] All utility functions handle edge cases such as malformed headers, unsupported codes, and missing values
- [ ] Functions return predictable defaults when no language preference can be determined
- [ ] The module exports clean, reusable functions that can be called from middleware or API routes

---

## REQ-306: Export Localization Types from Central Types Index

**Date**: 2026-01-18 14:15
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The system's central types index should re-export all localization type definitions to enable consistent imports across the application.

### Current Behavior
Localization types exist in a dedicated file but are not re-exported from the main types index. Developers must import directly from the localization types file, creating inconsistent import patterns and bypassing the centralized type module structure.

### Expected Behavior
The main types index file re-exports all localization types, allowing developers to import any localization type from the central types location alongside other application types. Import statements remain consistent with the project's architectural pattern of importing types from a single entry point.

### User Impact
Developers experience consistent import patterns when working with localization features. Code is easier to maintain and refactor because all types flow through a single, predictable import path.

### Business Value
Maintains architectural consistency and improves long-term maintainability by adhering to the established pattern of centralized type exports.

### Acceptance Criteria
- [ ] The main types index file includes an export statement for all localization types
- [ ] Localization types can be successfully imported from the types index location
- [ ] No existing imports are broken by the addition of the exports
- [ ] The export follows the same pattern as other type re-exports in the index file

---

## REQ-307: Create Translation Fetch Utilities for Guest Content

**Date**: 2026-01-18 14:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide dedicated utilities to fetch translated content from the database for guest-facing features.

### Current Behavior
No standardized utilities exist for retrieving translated content from translation tables. Developers must write custom database queries whenever they need to display content in different languages, leading to inconsistent query patterns and duplicated logic across the application.

### Expected Behavior
A dedicated module provides reusable functions that fetch translated content from translation tables based on language preferences. Functions handle items, articles, links, and tags, automatically joining translation tables with source content and falling back to source language when translations are unavailable. Each function returns properly typed results that include both the original content and its translation.

### User Impact
Guests see content in their preferred language throughout the application. When translations are not yet available, they see the original language content seamlessly without errors or missing information.

### Business Value
Enables the guest-facing localization experience by providing the data layer needed to display translated content. Ensures consistent translation loading patterns across all content types, reducing bugs and improving developer productivity.

### Acceptance Criteria
- [ ] Function exists to fetch a single item with its translation given a public ID and language code
- [ ] Function exists to fetch only translation data for an item given its internal ID and language code
- [ ] Function exists to fetch translations for multiple articles given a list of article IDs and language code
- [ ] Function exists to fetch translations for multiple links given a list of link IDs and language code
- [ ] Function exists to fetch translations for multiple tags given a list of tag keys and language code
- [ ] All functions properly join translation tables with source content tables using appropriate foreign key relationships
- [ ] Functions gracefully handle cases where translations do not exist for the requested language
- [ ] Return values include both source content and translation data in a predictable structure
- [ ] Functions use proper type definitions for parameters and return values
- [ ] Database queries are optimized to minimize round trips and use appropriate indexes

---

## REQ-308: Create Public Item API Endpoint with Translation Support

**Date**: 2026-01-18 15:20
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should expose a public API endpoint that returns item details with translations merged based on guest language preferences.

### Current Behavior
No public API endpoint exists for retrieving individual items with their translated content. Guest-facing pages cannot fetch item data with translations through a REST API, forcing all data loading to occur server-side or through generic database queries that don't handle translations.

### Expected Behavior
A GET endpoint is available at the public items route that accepts a public item identifier and an optional language query parameter. When called, it retrieves the item's original content, fetches any available translation for the requested language, and returns a unified response containing the merged content. The response includes metadata indicating translation status, source language, and which fields have been translated. When no translation exists, the original content is returned with appropriate metadata indicating the fallback.

### User Impact
Guests viewing item details see content in their preferred language when translations are available. The experience is seamless, with no broken content or missing information when switching languages. Client-side applications can dynamically fetch translated item data without full page reloads.

### Business Value
Enables a modern, dynamic guest experience where language switching happens instantly without page refreshes. Provides the API layer needed for mobile applications and progressive web app features to deliver localized content. Supports A/B testing and analytics around language preferences and translation quality.

### Acceptance Criteria
- [ ] GET endpoint exists at the public items route accepting a public item identifier in the URL path
- [ ] Endpoint accepts an optional language query parameter that defaults to a sensible value when omitted
- [ ] Item lookup occurs using the public identifier, not internal database IDs
- [ ] Translation fetch occurs only when a language parameter is provided and differs from the source language
- [ ] Response merges original content with translated content, with translations taking precedence for available fields
- [ ] Response includes metadata fields indicating translation status, source language, and target language
- [ ] Response follows the guest content response format for consistency with other public endpoints
- [ ] Endpoint returns appropriate HTTP status codes for not found, invalid parameters, and server errors
- [ ] Response includes proper CORS headers to allow client-side access from guest-facing domains
- [ ] Endpoint performance is optimized to minimize database queries and response time
- [ ] Error responses include helpful messages that don't expose internal system details

---

## REQ-309: Create Language Availability API Endpoint for Items

**Date**: 2026-01-18 15:45
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should expose a public API endpoint that returns the list of languages for which translations are available for a specific item.

### Current Behavior
Guests and client applications have no way to discover which language translations exist for an item without attempting to fetch each translation individually. Language switching interfaces cannot display only the languages that have actual translations available, potentially showing options that lead to untranslated content.

### Expected Behavior
A GET endpoint is available at the item languages route that accepts a public item identifier and returns a list of all languages for which translations exist. The response includes both the source language and all target languages that have complete or partial translations available. Each language entry includes metadata about translation completeness and last update timestamps. The endpoint returns quickly by querying only translation metadata tables without fetching full content.

### User Impact
Guests see accurate language options when viewing items, showing only languages that have actual translations available. The language switching interface is informative and trustworthy, improving confidence in the localization experience. Users avoid the frustration of selecting a language only to find content remains untranslated.

### Business Value
Enables intelligent language switching interfaces that enhance user experience and build trust in the platform's internationalization capabilities. Provides transparency into translation coverage, which can inform content strategy and prioritization decisions. Reduces support burden by preventing confusion around missing translations.

### Acceptance Criteria
- [ ] GET endpoint exists at the item languages route accepting a public item identifier in the URL path
- [ ] Item lookup occurs using the public identifier and verifies the item exists before querying translations
- [ ] Query retrieves all translation records associated with the item from the appropriate translation table
- [ ] Response includes the item's source language as part of the available languages list
- [ ] Response follows the LanguageAvailabilityResponse format with consistent structure
- [ ] Each language entry includes the language code and human-readable language name
- [ ] Translation status metadata indicates whether translations are complete, partial, or outdated
- [ ] Response includes timestamps for when each translation was last updated
- [ ] Endpoint returns appropriate HTTP status codes for not found items and server errors
- [ ] Response includes proper CORS headers to allow client-side access from guest-facing domains
- [ ] Query is optimized to check translation existence without fetching full content data
- [ ] Endpoint handles items with no translations gracefully, returning only the source language

---

## REQ-310: Create Translation Utility Helpers for Content Merging and Language Selection

**Date**: 2026-01-18 16:00
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide utility functions to merge original content with translations, determine the best available language for display, and format language names for user interfaces.

### Current Behavior
No standardized utilities exist for common translation operations like merging source content with translation overlays or determining which language to display when the requested language is unavailable. Developers must implement this logic repeatedly across different features, leading to inconsistent behavior and duplicate code.

### Expected Behavior
A dedicated utility module provides three core helper functions. The first function merges original content with translation data, creating a unified object where translated fields override original fields while preserving untranslated content. The second function implements fallback logic to determine the best language to display given a requested language, available translations, and the source language. The third function formats language codes into human-readable names with optional native language display. These utilities are imported and used consistently across all features that work with translations.

### User Impact
Guests experience consistent translation behavior across all content types. When translations are partial, they see a seamless blend of translated and original content without gaps or errors. Language displays are formatted professionally and consistently throughout the interface.

### Business Value
Centralizes critical translation logic to ensure consistent user experience across all localized features. Reduces development time and bug potential by eliminating duplicate implementations of translation merging and language selection rules. Creates a maintainable foundation for expanding localization features.

### Acceptance Criteria
- [ ] mergeTranslation function accepts an original content object and a translation object as parameters
- [ ] mergeTranslation returns a new object combining both inputs without mutating the originals
- [ ] mergeTranslation preserves all fields from the original object when corresponding translation fields are null or undefined
- [ ] mergeTranslation overrides original fields with translation values when translation fields contain content
- [ ] getDisplayLanguage function accepts requested language, available languages array, and source language as parameters
- [ ] getDisplayLanguage returns the requested language when it exists in the available languages
- [ ] getDisplayLanguage returns the source language when the requested language is unavailable
- [ ] getDisplayLanguage handles edge cases like empty available languages arrays and null inputs gracefully
- [ ] formatLanguageName function accepts a language code and optional native flag parameter
- [ ] formatLanguageName returns properly formatted display names for all supported language codes
- [ ] formatLanguageName returns the native language name when the native flag is true
- [ ] formatLanguageName handles unknown language codes by returning the code itself as a fallback
- [ ] All utility functions include proper TypeScript type definitions for parameters and return values
- [ ] Functions include JSDoc comments explaining parameters, return values, and usage examples

---

## REQ-311: Create Guest Language Switcher Component

**Date**: 2026-01-18 16:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide a dedicated language selection component for guest-facing pages that displays all supported languages with visual indicators of translation availability.

### Current Behavior
No specialized language switcher exists for guest users viewing public content. Guests have no interface element to discover or switch between available language translations when viewing items, articles, or other localized content.

### Expected Behavior
A dropdown component appears in guest-facing interfaces that lists all six supported languages with their native names and flag icons. When opened, the dropdown shows which languages have translations available for the current content using checkmark indicators. Languages without translations appear visually distinct but remain selectable, allowing guests to set their preference even when translations are not yet complete. The component uses accessible dropdown patterns and updates the user's language preference when a selection is made.

### User Impact
Guests can easily discover which languages are supported and see at a glance which translations are available for the content they are viewing. The visual design with flags and native names makes language selection intuitive for international users who may not read English. Language switching is seamless and accessible to users with disabilities through proper keyboard navigation and screen reader support.

### Business Value
Provides the primary interface for guests to access localized content, enabling the full value of translation investments to be realized. Creates a professional, internationally-aware user experience that signals to global audiences that the platform is built for them. Accessible design ensures compliance with international accessibility standards and broadens market reach.

### Acceptance Criteria
- [ ] Component displays a dropdown showing all six supported languages
- [ ] Each language entry shows a flag icon and the language's native name
- [ ] Visual checkmark indicator appears next to languages that have translations for the current item
- [ ] Languages without available translations are visually distinct through styling such as reduced opacity or gray coloring
- [ ] All languages remain selectable regardless of translation availability
- [ ] Component uses Radix UI dropdown primitives for proper accessibility support
- [ ] Dropdown is keyboard navigable with arrow keys, Enter to select, and Escape to close
- [ ] Screen readers announce the current language selection and available options
- [ ] Selecting a language updates the guest's language preference and triggers content refresh
- [ ] Component accepts a property indicating which languages have translations available for the current content
- [ ] Component displays the currently selected language in the closed state
- [ ] Dropdown positioning works correctly in various layout contexts without overflow issues
- [ ] Component follows the project's established styling patterns and design system

---

## REQ-312: Create TranslationBanner Component

**Date**: 2026-01-18 16:45
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should display a persistent informational banner at the top of translated content indicating that the content has been translated from another language and providing access to the original version.

### Current Behavior
When guests view translated content, there is no visual indication that they are viewing a translation rather than the original content. Guests cannot easily identify the source language or access the original untranslated version, potentially causing confusion about content authenticity and accuracy.

### Expected Behavior
A light blue banner appears prominently at the top of any content displayed in a translated language. The banner shows a globe icon followed by text stating "Translated from [Language]" with a clickable "View original" action. The banner uses a professional information design pattern that clearly communicates the translation status without being intrusive or dismissible. Clicking "View original" switches the display to the source language content.

### User Impact
Guests viewing translated content are always aware that they are seeing a translation rather than the original. This transparency builds trust and allows users to access the source content when they want to verify translation accuracy or prefer to read the original language. The persistent banner ensures translation status is never ambiguous.

### Business Value
Maintains transparency and trust with international audiences by clearly identifying translated content. Provides legal protection by ensuring users know when they are viewing automated or human translations rather than original content. Reduces support inquiries about content accuracy by making translation status immediately visible.

### Acceptance Criteria
- [ ] Component renders a banner with a light blue background color (#E3F2FD)
- [ ] Banner displays a globe icon on the left side of the text
- [ ] Banner shows text "Translated from [Language]" where [Language] is replaced with the source language name
- [ ] Banner includes a "View original" clickable text or link element
- [ ] Banner spans the full width of its container with appropriate padding
- [ ] Component is not dismissible and remains visible as long as translated content is displayed
- [ ] Component accepts properties for source language code and an onClick handler for the view original action
- [ ] Typography and spacing follow the project's design system guidelines
- [ ] Banner is visually distinct from content but not overly prominent or distracting
- [ ] Component works correctly on mobile viewports without horizontal scrolling
- [ ] Screen readers announce the banner content and "View original" action appropriately
- [ ] Component follows established patterns for informational banners in the application

---

## REQ-313: Create MissingTranslationBanner Component

**Date**: 2026-01-18 17:00
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should display a subtle informational banner when a guest requests content in a language that does not have a translation available, explaining that the original language content is being shown instead.

### Current Behavior
When guests request content in a language for which no translation exists, the application silently displays the original language content without any explanation. Guests have no indication that their language preference was recognized but cannot be fulfilled, potentially causing confusion about why content remains in the original language despite their selection.

### Expected Behavior
A muted informational banner appears at the top of content when a guest has selected a language preference but the requested translation is not available. The banner displays a message such as "French translation not available. Showing content in English." with gentle, non-alarming styling that informs rather than warns. The banner uses subdued colors and an information icon to maintain a calm, professional tone while ensuring guests understand why their language preference is not being reflected.

### User Impact
Guests understand why content appears in a language different from their selection, reducing confusion and setting appropriate expectations. The gentle presentation avoids creating alarm or suggesting an error has occurred, while still providing transparency about translation availability. Users know their preference was recognized and will be honored when translations become available.

### Business Value
Manages user expectations around translation coverage without creating negative emotional responses. Maintains transparency and trust while avoiding the perception that the platform is broken or ignoring user preferences. Reduces support inquiries about why language switching does not appear to work for certain content.

### Acceptance Criteria
- [ ] Component renders a banner with muted, neutral background color such as light gray
- [ ] Banner displays an information icon that is calm and non-alarming in style
- [ ] Banner shows text indicating which translation was requested and which language is being displayed instead
- [ ] Message format follows the pattern "[Requested Language] translation not available. Showing content in [Source Language]."
- [ ] Banner uses subdued text colors and styling to avoid drawing excessive attention or creating alarm
- [ ] Component spans the full width of its container with appropriate padding
- [ ] Component is not dismissible and remains visible while the language mismatch exists
- [ ] Component accepts properties for requested language code and source language code
- [ ] Typography uses smaller or less prominent font sizing compared to primary content
- [ ] Banner works correctly on mobile viewports without horizontal scrolling
- [ ] Screen readers announce the banner content with appropriate informational tone
- [ ] Component follows established patterns for non-critical informational banners


---

## REQ-314: Create ViewOriginalToggle Component

**Date**: 2026-01-18 17:15
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide a toggle control that allows guests viewing translated content to switch between the translated version and the original language version.

### Current Behavior
No dedicated toggle component exists for switching between translated and original content views. Guests viewing translations must rely on other mechanisms such as banner links or language switcher dropdowns to access original content, creating inconsistent interaction patterns across different contexts.

### Expected Behavior
A secondary-styled button component displays with dynamic label text that changes based on the current view state. When viewing a translation, the button shows "View in original (English)" with a swap icon. When viewing the original, it shows "View translation" with the same icon. Clicking the toggle switches between the two states and triggers the appropriate content display change. The component follows the secondary button style from the design system, ensuring visual distinction from primary actions while remaining clearly interactive.

### User Impact
Guests can quickly toggle between translated and original content without navigating through dropdowns or multiple interface elements. The dynamic labeling makes the current state and available action immediately clear. The swap icon provides visual reinforcement of the toggle behavior, making the interaction intuitive even for users who may not fully understand the text labels.

### Business Value
Provides a streamlined interaction pattern for accessing original content that can be embedded in various contexts throughout the guest experience. Improves usability for bilingual users who may want to compare translations with originals. Creates a reusable component that supports consistent toggle behavior across multiple features.

### Acceptance Criteria
- [ ] Component renders as a button using the secondary button style from the design system
- [ ] Label dynamically displays "View in original (English)" when currently viewing a translation
- [ ] Label dynamically displays "View translation" when currently viewing the original content
- [ ] Source language name is dynamically inserted into the label rather than hardcoded as "English"
- [ ] Swap icon appears in the button, positioned consistently with label text
- [ ] Icon comes from the project's established icon library
- [ ] Component accepts properties for current view state indicating whether translation or original is displayed
- [ ] Component accepts a property for the source language code to generate correct labels
- [ ] Component accepts an onClick handler that is called when the button is clicked
- [ ] Button follows accessibility patterns with proper ARIA attributes and keyboard support
- [ ] Typography and spacing follow the project's design system guidelines
- [ ] Component works correctly on mobile viewports with appropriate touch target sizing
- [ ] Button visual style clearly indicates it is interactive through hover and focus states

---

## REQ-315: Create LanguageIndicator Component

**Date**: 2026-01-18 17:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide a compact visual indicator that displays the current language being viewed, designed for placement in header areas and other space-constrained contexts.

### Current Behavior
No dedicated component exists to show the current display language in a compact, visually clear format. Headers and navigation areas lack a consistent way to communicate which language the guest is currently viewing, forcing reliance on larger dropdown components or leaving language status ambiguous.

### Expected Behavior
A small, inline component displays the current language using a flag icon and language code or abbreviation. The component occupies minimal horizontal space, making it suitable for placement in headers, toolbars, and other compact layouts. Optionally, when viewing translated content, the component can show a subtle subtitle such as "translated from Spanish" beneath the main language indicator. The component is read-only and serves as a status display rather than an interactive control, though it may be clickable to trigger language selection when integrated with other components.

### User Impact
Guests always have a clear, at-a-glance view of which language they are currently seeing without needing to open dropdowns or navigate to settings. The visual design with flag icons makes language status immediately recognizable even in peripheral vision. The compact size ensures the indicator can be present throughout the interface without consuming valuable screen space or creating visual clutter.

### Business Value
Provides continuous language awareness throughout the guest experience, reinforcing the application's international capabilities. Creates a consistent visual pattern for language indication that can be reused across multiple interface contexts. Supports bilingual users who may frequently switch languages by providing constant feedback about current state.

### Acceptance Criteria
- [ ] Component renders a flag icon corresponding to the current display language
- [ ] Component displays the language name or abbreviated language code next to the flag
- [ ] Component occupies minimal horizontal space suitable for header placement
- [ ] Component optionally displays a subtitle line showing "translated from [Language]" when viewing a translation
- [ ] Subtitle display is controlled through a component property and defaults to hidden
- [ ] Component accepts a property for the current language code to determine display content
- [ ] Component accepts an optional property for the source language when displaying translation status
- [ ] Flag icons are sourced from the project's established icon or image assets
- [ ] Typography is scaled appropriately for compact display without sacrificing readability
- [ ] Component layout stacks vertically on extremely small viewports if needed to maintain readability
- [ ] Component follows the project's design system for spacing, colors, and typography
- [ ] Component can optionally accept an onClick handler to make it interactive when used with language switcher functionality
- [ ] Screen readers announce the current language and translation status appropriately
- [ ] Component remains visually balanced and professional when placed alongside other header elements

---

## REQ-316: Create Barrel Exports for Guest Components

**Date**: 2026-01-18 17:45
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The system should provide a single barrel export file for all guest components, enabling clean and consistent import statements across the application.

### Current Behavior
Guest components exist in individual files within the guest components directory, but no centralized export file exists. Developers must import each guest component using its full path, creating verbose import statements with multiple lines when several guest components are needed in a single file.

### Expected Behavior
A barrel file exists at the root of the guest components directory that re-exports all guest components from their individual module files. Developers can import any combination of guest components using a single import statement that references the guest components directory, following established patterns used elsewhere in the codebase for component organization.

### User Impact
Developers experience cleaner, more maintainable code with simplified import statements. Code reviews are easier because import blocks are more concise and follow predictable patterns. Refactoring and reorganizing components becomes simpler because import paths are centralized through the barrel file.

### Business Value
Improves code maintainability and developer productivity by reducing boilerplate in import statements. Creates consistency with the project's architectural patterns for component organization, making the codebase more approachable for new developers. Reduces the chance of import errors during refactoring operations.

### Acceptance Criteria
- [ ] Index file exists at `/src/components/guest/index.ts` serving as the barrel export
- [ ] All existing guest components are re-exported from the barrel file
- [ ] Components include: GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, ViewOriginalToggle, and LanguageIndicator
- [ ] Export statements use named exports to match the pattern of component definitions
- [ ] Import statements in existing files can successfully import guest components from the barrel path
- [ ] TypeScript compilation succeeds without errors after adding the barrel file
- [ ] The barrel file includes a comment header describing its purpose
- [ ] File follows the project's established patterns for barrel exports in other component directories

---

## REQ-317: Create useGuestLanguage Hook for Language State Management

**Date**: 2026-01-18 18:00
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide a custom React hook that manages guest language preferences, handles language switching, and synchronizes language state across multiple persistence mechanisms.

### Current Behavior
No centralized hook exists for managing guest language state in client components. Components that need to handle language preferences must implement their own state management, cookie handling, and URL parameter synchronization, leading to duplicated logic and inconsistent behavior across different parts of the application.

### Expected Behavior
A dedicated hook manages all aspects of guest language preference state within React components. The hook tracks the current language selection, maintains a toggle state for viewing original versus translated content, persists language preferences to browser cookies with appropriate expiration, reads initial language state from URL parameters to support shareable links, and provides callback functions for changing languages and toggling between translation and original views. When language changes occur, the hook updates the cookie and optionally triggers content refetching. The toggle between translation and original operates client-side without requiring new data fetches.

### User Impact
Guests experience consistent language preference behavior across all pages of the application. Language selections persist across sessions through cookies, eliminating the need to reselect preferences on every visit. Shareable links preserve language context, allowing users to send localized links to others. The viewing experience is seamless, with instant toggling between translated and original content without loading delays.

### Business Value
Centralizes all guest language state logic in a single, testable hook that reduces bugs and improves maintainability. Enables sophisticated features like shareable localized links that can improve viral growth and user engagement. Creates a foundation for analytics around language preferences and translation usage patterns. Improves developer productivity by providing a single, well-documented interface for all language-related state management.

### Acceptance Criteria
- [ ] Hook exports a function named useGuestLanguage that can be called from any React component
- [ ] Hook manages currentLanguage state representing the guest's selected language preference
- [ ] Hook manages showOriginal state representing whether the original or translated content is displayed
- [ ] Hook reads initial language preference from URL query parameters when component mounts
- [ ] Hook reads language preference from cookies when no URL parameter is present
- [ ] Hook falls back to browser language detection when no URL parameter or cookie exists
- [ ] Hook provides a changeLanguage callback function that accepts a new language code
- [ ] changeLanguage function updates the cookie with the new preference and appropriate expiration
- [ ] changeLanguage function optionally triggers a refetch callback when provided
- [ ] Hook provides a toggleOriginal callback function that switches between translation and original views
- [ ] toggleOriginal operates purely client-side without triggering data refetch
- [ ] Hook synchronizes language state with URL parameters for shareable link support
- [ ] Cookie persistence includes proper path, domain, and expiration attributes
- [ ] Hook properly handles edge cases such as unsupported language codes and malformed URL parameters
- [ ] Hook returns a typed object containing all state values and callback functions
- [ ] TypeScript types are properly defined for hook parameters and return values
- [ ] Hook follows React hooks conventions and can be used with React Strict Mode

---

## REQ-318: Create Cookie Utility for Guest Language Persistence

**Date**: 2026-01-18 18:15
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide a dedicated utility module for setting and retrieving the guest language preference cookie with proper security attributes and long-term persistence.

### Current Behavior
No standardized utility exists for managing the guest language preference cookie. Components and utilities that need to store or retrieve language preferences must implement cookie handling logic directly, leading to inconsistent cookie attributes, varying expiration times, and potential security vulnerabilities across different implementations.

### Expected Behavior
A dedicated utility module provides two core functions for cookie management: one to set the guest language preference cookie with a one-year expiration and proper security attributes, and one to retrieve the current language preference from the cookie. The set function automatically handles cookie string formatting, path configuration, secure attribute setting for HTTPS connections, and SameSite attribute configuration to prevent CSRF attacks. The get function parses the document cookie string, extracts the language preference value if present, and returns null when the cookie does not exist. Both functions use the standard cookie name `FAQBNB_GUEST_LANG` to ensure consistency across the application.

### User Impact
Guests' language preferences persist reliably across browser sessions for up to one year, eliminating the need to repeatedly select their preferred language on return visits. The long persistence period creates a seamless experience for regular users while security attributes protect against cross-site attacks and ensure cookies are only transmitted over secure connections in production environments.

### Business Value
Enables long-term language preference retention that improves user experience and reduces friction for returning international visitors. Standardizes cookie security practices to protect user privacy and meet regulatory requirements for secure cookie handling. Centralizes cookie management logic to ensure consistent behavior and simplify future modifications to cookie policies or attributes.

### Acceptance Criteria
- [ ] Utility module exists at `/src/lib/i18n/guest-language.ts`
- [ ] Module exports a function named `setGuestLanguageCookie` that accepts a language code parameter
- [ ] setGuestLanguageCookie sets a cookie named `FAQBNB_GUEST_LANG` with the provided language code as the value
- [ ] Cookie expiration is set to 365 days (one year) from the current date
- [ ] Cookie path attribute is set to "/" to make it available across the entire application
- [ ] Cookie Secure attribute is set to true to ensure transmission only over HTTPS in production
- [ ] Cookie SameSite attribute is set to "Lax" to balance security with functionality for navigation scenarios
- [ ] Module exports a function named `getGuestLanguageCookie` that retrieves the current language preference
- [ ] getGuestLanguageCookie parses the document.cookie string to extract the FAQBNB_GUEST_LANG value
- [ ] getGuestLanguageCookie returns the language code string when the cookie exists
- [ ] getGuestLanguageCookie returns null when the cookie does not exist or is malformed
- [ ] Cookie name constant is defined once and reused across both functions to prevent typos
- [ ] Functions include proper TypeScript type definitions for parameters and return values
- [ ] Functions include JSDoc comments explaining parameters, return values, and usage examples
- [ ] Module handles edge cases such as setting cookies in environments where document.cookie is not available

---

## REQ-319: Update Guest Item Page Server Component with Language Detection and Translation Support

**Date**: 2026-01-18 18:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The guest item page should automatically detect the visitor's preferred language and serve translated content when available, with proper SEO metadata in the detected language.

### Current Behavior
The guest item page at the public item route displays content only in the source language. Language preferences from URL parameters, cookies, or browser headers are ignored. Metadata for search engines always uses the original language title and description, regardless of visitor location or language preference. Translations stored in the database are not retrieved or considered when rendering the page.

### Expected Behavior
When a guest visits an item page, the server component examines URL query parameters for an explicit language selection, then checks browser cookies for a stored language preference, and finally analyzes the Accept-Language header as a fallback. Using the detected language, the server fetches the item's original content along with any available translation for that language. Translation metadata including source language, target language, and translation status is passed to the client component for rendering decisions. The metadata generation function produces SEO-optimized title and description tags using the translated content when available, ensuring search engines index the page appropriately for different language markets.

### User Impact
International guests automatically see item content in their preferred language without manual language selection. Search results in different countries and language contexts display properly localized titles and descriptions, improving discoverability for non-English speakers. The experience feels native and personalized from the first page load, building trust with global audiences.

### Business Value
Dramatically improves international SEO by providing language-specific metadata that search engines can index for different markets. Increases organic traffic from non-English search queries by making content discoverable in multiple languages. Creates a professional first impression for international visitors that can improve conversion rates and reduce bounce rates for global audiences.

### Acceptance Criteria
- [ ] Server component examines URL query parameters to detect explicit language selection before other sources
- [ ] Language detection checks browser cookies using the standard guest language cookie name when no URL parameter exists
- [ ] Accept-Language header is parsed and evaluated when URL and cookie sources provide no language preference
- [ ] Language detection uses the guest language detection utility module to ensure consistent logic
- [ ] Item fetch query includes translation lookup for the detected language code
- [ ] Translation fetch utilities are called to retrieve translated item data when a non-source language is detected
- [ ] Props passed to client component include translation metadata such as source language, target language, and translation status
- [ ] Props passed to client component include flags indicating which languages have available translations
- [ ] generateMetadata function receives the detected language and uses it to fetch appropriate translation data
- [ ] Metadata title uses the translated item name when a translation is available and complete
- [ ] Metadata description uses the translated description when available, falling back to source language when not
- [ ] OpenGraph metadata includes translated content to ensure proper social media preview in different languages
- [ ] Metadata includes language-specific meta tags such as `og:locale` to indicate content language to search engines
- [ ] Translation fetch occurs server-side during page generation to avoid client-side loading delays
- [ ] Error handling gracefully falls back to source language content when translation fetch fails
- [ ] Component maintains backward compatibility with existing item display component prop structure

---

## REQ-320: Update ItemDisplay Component for Guest Translation Support

**Date**: 2026-01-18 18:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The item display component should render translated content when available, provide guests with language switching controls, and display informational banners indicating translation status.

### Current Behavior
The ItemDisplay component renders item content using only the original source language data provided in props. No consideration is given to translation metadata, language preferences, or alternative language versions. Guests viewing items have no visual indication that translations exist or ability to switch between languages from within the item display interface.

### Expected Behavior
The component accepts translation metadata properties including source language, target language, translation status, and available languages. When rendering, it integrates the guest language hook to manage current language selection and view toggling state. A language switcher dropdown appears in the component header, showing all six supported languages with visual indicators for which translations are available. When displaying translated content, a prominent banner appears stating "Translated from [Language]" with a "View original" action. When the guest has requested a language without an available translation, a subtle banner explains that the original language is being shown instead. The "View original" toggle allows instant switching between translated and original content client-side without refetching data. All language interactions update the guest's stored preference and persist across sessions.

### User Impact
Guests viewing item details can immediately see which language translations are available and switch between them using an intuitive dropdown interface. When viewing translations, clear visual feedback confirms the translation status and provides instant access to the original content for verification or comparison. The experience is transparent and trustworthy, with no confusion about whether content is original or translated. Language preferences are remembered, creating a personalized experience that improves with repeated visits.

### Business Value
Delivers the complete guest-facing translation experience that enables international users to consume content in their preferred languages. Creates transparency around translation status that builds trust and reduces support burden from confused users. Provides the interface layer that makes translation investments visible and valuable to end users, directly supporting international growth objectives. Maintains professional standards for multilingual content presentation that meet user expectations in global markets.

### Acceptance Criteria
- [ ] Component accepts translationMeta prop containing source language, target language, and translation status
- [ ] Component accepts availableLanguages prop indicating which language translations exist for the current item
- [ ] Component accepts original content props alongside current content to support toggle functionality
- [ ] useGuestLanguage hook is integrated and called at component initialization
- [ ] GuestLanguageSwitcher component is rendered in the item display header area
- [ ] Language switcher receives available languages from props to show translation availability indicators
- [ ] TranslationBanner component appears when displaying content in a translated language
- [ ] TranslationBanner receives source language code and displays correct language name
- [ ] TranslationBanner "View original" action triggers the toggle callback from useGuestLanguage hook
- [ ] MissingTranslationBanner appears when guest language preference differs from displayed language due to unavailable translation
- [ ] MissingTranslationBanner receives both requested language and source language to generate correct message
- [ ] Client-side state swap occurs when toggling between original and translated views without refetching
- [ ] Toggle state switches displayed content between original and translated versions instantaneously
- [ ] Language preference changes update the cookie and trigger component re-render with new language content
- [ ] Component properly handles cases where translation is partial or incomplete without breaking layout
- [ ] All banner and switcher components are positioned consistently with the design system
- [ ] Component remains responsive and functional on mobile viewports with appropriate banner stacking
- [ ] Screen readers announce language changes and translation status appropriately
- [ ] Component maintains backward compatibility when translation props are not provided

---

## REQ-321: Update LinkCard Component for Translation Support

**Date**: 2026-01-18 19:00
**Type**: ENHANCEMENT
**Size**: S

### Summary
The link card component should display translated link titles when translations are available and provide the ability to toggle between translated and original titles.

### Current Behavior
The LinkCard component displays link information using only the original source language title provided in props. When viewing items with translated link metadata, the links continue to show in the original language, creating an inconsistent experience where the main content is translated but supporting links remain untranslated. No mechanism exists to show original titles when viewing translated content.

### Expected Behavior
The component accepts a translated title property alongside the original title. When a translated title is provided, it displays the translated version by default to maintain consistency with the surrounding translated content. When a view original toggle state is active, the component switches to displaying the original title instead of the translation. The title display updates instantly based on the toggle state without requiring component re-mounting or data refetching. When no translation is provided, the component displays the original title regardless of toggle state, ensuring graceful handling of partial translations.

### User Impact
Guests viewing translated item content see link titles in the same language as the main content, creating a cohesive and fully localized experience. When comparing original and translated versions using the toggle feature, all link titles switch languages together with the main content. The experience feels complete and professional, without jarring language inconsistencies between different elements of the page.

### Business Value
Completes the translation experience by ensuring all content elements display consistently in the selected language. Creates a professional, publication-quality multilingual interface that meets user expectations in international markets. Eliminates a potential source of confusion and frustration for non-English speakers who might see mixed-language content.

### Acceptance Criteria
- [ ] Component accepts a translatedTitle prop that can be null or undefined when no translation exists
- [ ] Component accepts a showOriginal prop indicating whether to display original or translated content
- [ ] Component displays the translatedTitle when it is provided and showOriginal is false
- [ ] Component displays the original title when showOriginal is true regardless of translated title availability
- [ ] Component displays the original title when translatedTitle is null or undefined regardless of showOriginal state
- [ ] Title display updates immediately when the showOriginal prop value changes
- [ ] No data refetching or component re-initialization occurs when toggling between original and translated titles
- [ ] Component maintains all existing functionality for link type detection, icon display, and click handling
- [ ] TypeScript type definitions are updated to include the new optional props
- [ ] Component handles edge cases such as empty string translations gracefully
- [ ] Component remains visually consistent with the design system when displaying either title version
- [ ] Screen readers announce the displayed title correctly regardless of which version is shown

---

## REQ-322: Handle URL Language Parameter for Shareable Links

**Date**: 2026-01-18 19:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
Guest-facing pages should read language preferences from URL query parameters and include language codes in shareable links while excluding them from canonical URLs for proper SEO handling.

### Current Behavior
Guest item pages do not consistently process language query parameters from URLs. When users share links containing language preferences, recipients may not see the content in the intended language. Canonical URL tags include query parameters, potentially creating SEO issues with duplicate content across different language parameter combinations.

### Expected Behavior
When a guest visits a page with a language query parameter such as `?lang=fr`, the application reads this parameter and displays the content in the specified language if a translation is available. When the guest uses sharing functionality or copies the page URL, the current language selection is included as a query parameter to preserve the language context for the recipient. The canonical URL meta tag points to the base URL without any language parameter, signaling to search engines that all language variants represent the same content and preventing duplicate content penalties.

### User Impact
Guests can share links that automatically display content in their preferred language when opened by recipients. International users sharing recommendations see their language choice preserved, creating a more personalized sharing experience. Recipients who prefer different languages can still switch using the language selector without breaking the shared link's functionality.

### Business Value
Enables viral growth across international markets by allowing users to share properly localized links. Improves SEO by correctly handling canonical URLs and preventing search engines from treating each language parameter variation as duplicate content. Creates a more sophisticated sharing experience that respects user language preferences while maintaining technical SEO best practices.

### Acceptance Criteria
- [ ] Guest item page component reads the `lang` query parameter from the URL on page load
- [ ] Valid language codes from the lang parameter are used to set the initial display language
- [ ] Invalid or unsupported language codes in the parameter are handled gracefully with fallback to default detection
- [ ] Language parameter takes precedence over cookie and browser header detection in the preference hierarchy
- [ ] When language is changed via the language switcher, the URL updates to include the new lang parameter
- [ ] URL updates occur using browser history API to avoid full page reloads
- [ ] Share functionality includes the current lang parameter value in generated shareable links
- [ ] Canonical URL meta tag is generated without any lang or other query parameters
- [ ] Canonical URL points to the clean base path of the current page
- [ ] OpenGraph URL metadata does not include language parameters to prevent social platform caching issues
- [ ] Browser back and forward navigation properly handles URL parameter changes and displays correct language
- [ ] Direct navigation to URLs with lang parameters works correctly from external referrers
- [ ] Language parameter persists in the URL when other interactions occur such as scrolling or viewing media
- [ ] URL updates do not trigger Google Analytics or tracking events that would inflate pageview counts
- [ ] Component maintains performance without unnecessary re-renders when processing URL parameter changes

---

## REQ-323: Add Guest Language Detection to Middleware

**Date**: 2026-01-18 19:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The middleware layer should detect guest language preferences for public item routes and make this information available to downstream handlers without performing redirects.

### Current Behavior
The application middleware does not process public item routes or detect guest language preferences at the edge. Language detection occurs separately in individual page components, requiring duplicate logic across multiple routes and preventing centralized request-level language handling. No mechanism exists to set language context headers or cookies from middleware for downstream consumption.

### Expected Behavior
The middleware configuration includes all `/item/*` routes in its matcher patterns, allowing the middleware function to intercept requests to public item pages before they reach page handlers. When a request to an item route is intercepted, the middleware executes the guest language detection logic that examines URL query parameters, cookie values, and Accept-Language headers in priority order. Once the preferred language is determined, the middleware sets a custom request header containing the detected language code that page components and API routes can read. For guests without an existing language preference cookie, the middleware sets the language cookie based on the detection results. Critically, the middleware does not perform any redirects or URL modifications, preserving language information in query parameters rather than path segments to avoid SEO complications and infinite redirect loops.

### User Impact
Guests accessing public item pages experience consistent language detection regardless of which specific item or route they visit. The language preference is established early in the request lifecycle, enabling faster page rendering with pre-determined language context. Cookie-based language persistence is handled reliably at the middleware level, ensuring preferences are stored even when JavaScript is disabled or delayed in loading.

### Business Value
Centralizes language detection logic at the infrastructure level, eliminating duplication across individual page components and reducing maintenance burden. Enables future advanced features such as language-based edge caching, request routing to region-specific services, and serverless function optimization based on language context. Improves reliability by handling language preferences at the framework level rather than relying on client-side code execution. Creates a foundation for more sophisticated internationalization features without requiring changes to individual page implementations.

### Acceptance Criteria
- [ ] Middleware matcher configuration includes pattern matching `/item/:path*` to intercept all public item routes
- [ ] Middleware matcher configuration does not include redirects or other routes that should not undergo language detection
- [ ] Middleware function checks if the current request path matches an item route before executing language detection
- [ ] Guest language detection utility is imported and called with request context including URL, headers, and cookies
- [ ] Detection utility receives the search parameters object to access lang query parameter values
- [ ] Detection utility receives the cookies object to read existing language preference cookie
- [ ] Detection utility receives the Accept-Language header value for browser language detection
- [ ] Middleware sets a custom request header named X-Guest-Language with the detected language code
- [ ] Custom header is accessible to downstream page components and API route handlers
- [ ] When no existing language cookie is present, middleware sets the guest language preference cookie
- [ ] Cookie is set with the same attributes used elsewhere including one-year expiration and proper security flags
- [ ] Cookie is not overwritten when a valid existing cookie already matches the detected language
- [ ] Middleware does NOT perform any redirects based on language detection results
- [ ] Language preference remains in URL query parameters and is not moved to path segments
- [ ] Middleware handles edge cases such as missing headers, malformed cookies, and unsupported language codes
- [ ] Middleware processing completes quickly without blocking request handling or causing timeout issues
- [ ] TypeScript types for middleware request and response objects properly include custom header definitions
- [ ] Middleware function includes error handling that allows requests to proceed even if language detection fails
- [ ] Fallback behavior defaults to a sensible language when detection logic encounters errors

---

## REQ-324: Create Server-Side Language Detection Utility

**Date**: 2026-01-18 19:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide a server-side utility function that detects guest language preferences from Next.js request objects by examining URL parameters, cookies, and Accept-Language headers in priority order.

### Current Behavior
Language detection logic is implemented separately for client-side and server-side contexts, creating code duplication and inconsistent detection behavior. Server components and middleware lack a standardized utility for determining guest language preferences from incoming requests. Each server-side context must implement its own language detection logic, leading to different priority orders and edge case handling across the application.

### Expected Behavior
A dedicated server-side utility module provides a function that accepts a Next.js request object and returns the detected language preference. The function examines URL query parameters first for explicit language selection, then reads the language preference cookie, then parses the Accept-Language header as a fallback, and finally returns the default language when no preference is found. The detection logic handles all edge cases including malformed headers, invalid language codes, and missing request properties. The utility works seamlessly in both middleware and server component contexts, accepting the appropriate request object type for each environment.

### User Impact
Guests visiting the application from any entry point experience consistent language detection regardless of whether the page is rendered through middleware, server components, or API routes. Language preferences set through any mechanism are reliably recognized across all server-side contexts. The detection priority ensures that explicit choices always override implicit signals, preventing unexpected language switching.

### Business Value
Eliminates code duplication between client and server language detection implementations, reducing maintenance burden and potential for bugs from divergent logic. Creates a single source of truth for server-side language detection that can be tested independently and modified without touching multiple files. Enables consistent language preference handling across all server-rendered content, improving reliability and user trust in the localization system.

### Acceptance Criteria
- [ ] Utility module exists at `/src/lib/i18n/guest-language.ts` containing server-side detection function
- [ ] Function accepts a NextRequest object as its primary parameter for middleware contexts
- [ ] Function extracts language from URL query parameters using the standard `lang` parameter name
- [ ] URL parameter language detection validates that the language code is supported before returning it
- [ ] Function reads the guest language preference cookie using the standard cookie name when no URL parameter exists
- [ ] Cookie language detection validates that the stored language code is still supported
- [ ] Function parses the Accept-Language header when neither URL nor cookie provide valid language codes
- [ ] Accept-Language parsing extracts language codes with quality weights and selects the highest priority supported language
- [ ] Function maps browser language variants to supported languages when exact matches are not available
- [ ] Function returns the application default language when all detection sources fail or provide invalid codes
- [ ] Function handles missing or undefined request properties gracefully without throwing errors
- [ ] Function includes proper TypeScript type definitions for NextRequest parameter and string return value
- [ ] Function includes JSDoc comments explaining parameters, return values, detection priority order, and usage examples
- [ ] Utility exports constants for the language cookie name and default language to ensure consistency
- [ ] Function processes quickly without blocking request handling in middleware contexts
- [ ] Edge cases such as empty strings, whitespace-only values, and case sensitivity are handled correctly

---

## REQ-325: Test Language Detection Priority and Fallback Scenarios

**Date**: 2026-01-18 06:04
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system should have comprehensive test coverage verifying that language detection examines sources in the correct priority order and properly falls back to default language when preferences are unavailable or invalid.

### Current Behavior
Language detection utilities and components exist but lack systematic test coverage to verify the priority hierarchy and fallback behavior. Without testing, there is no guarantee that URL parameters override cookies, cookies override browser headers, and the system gracefully handles missing or malformed language preferences across different contexts.

### Expected Behavior
A comprehensive test suite validates all language detection scenarios across both client and server contexts. Tests verify that URL parameters take highest priority and always override cookie and browser settings when present. Tests confirm that cookie preferences are used when URL parameters are absent, overriding browser Accept-Language headers. Tests ensure browser language detection activates only when neither URL nor cookie preferences exist. Tests validate that the system falls back to the original source language when all detection methods fail or return unsupported language codes. Each test covers edge cases including malformed inputs, empty strings, unsupported codes, and missing request properties.

### User Impact
Guests experience reliable and predictable language detection behavior across all entry points and contexts. Language preferences set explicitly through URL parameters always take precedence, ensuring shareable links work as expected. Stored preferences in cookies persist correctly without being overridden by browser settings. When all else fails, content appears in a sensible default language rather than breaking or showing errors.

### Business Value
Ensures the language detection system functions correctly under all conditions, preventing user frustration from unpredictable language switching. Validates that the preference priority hierarchy supports both explicit user choices and implicit detection without conflicts. Creates confidence that language detection works reliably across different browsers, devices, and network conditions. Reduces support burden by catching edge cases and error conditions before they reach production users.

### Acceptance Criteria
- [ ] Test verifies URL language parameter overrides cookie preference when both are present
- [ ] Test verifies URL language parameter overrides browser Accept-Language header when both are present
- [ ] Test verifies cookie preference overrides browser Accept-Language header when no URL parameter exists
- [ ] Test verifies browser Accept-Language header is used when neither URL parameter nor cookie is present
- [ ] Test verifies system falls back to original source language when all detection sources are missing
- [ ] Test verifies system falls back to original source language when all sources provide invalid language codes
- [ ] Test verifies malformed Accept-Language headers do not cause errors and fallback works correctly
- [ ] Test verifies empty string language preferences are treated as invalid and trigger fallback
- [ ] Test verifies unsupported language codes in URL parameters trigger fallback to next priority source
- [ ] Test verifies unsupported language codes in cookies trigger fallback to browser header detection
- [ ] Test verifies the same priority hierarchy works in both middleware and client component contexts
- [ ] Test verifies language detection handles missing request objects gracefully without throwing errors
- [ ] Test verifies cookie setting occurs when language is detected from browser headers but no cookie exists
- [ ] Test verifies existing cookies are not overwritten when they match the detected language
- [ ] Test suite includes both unit tests for detection utilities and integration tests for complete page flows
- [ ] Tests cover all six supported languages to ensure each can be properly detected and displayed
- [ ] Test assertions verify both the detected language code and any side effects like cookie setting

---

## REQ-326: Test Content Display Scenarios for Translations

**Date**: 2026-01-18 20:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system should have comprehensive test coverage verifying that translated content displays correctly, original content appears when translations are unavailable, and toggle controls switch between versions instantly without data refetching.

### Current Behavior
Translation display components and utilities exist but lack systematic test coverage to verify that content rendering behaves correctly across all translation availability scenarios. Without testing, there is no guarantee that translated content overrides original content properly, fallback to original content works when translations are missing, toggle controls operate instantly client-side, and language switcher updates trigger appropriate content changes.

### Expected Behavior
A comprehensive test suite validates all content display scenarios for the guest translation experience. Tests verify that when a complete translation exists, all translated fields display instead of original content. Tests confirm that when translations are partial or missing, original content appears seamlessly for untranslated fields without gaps or errors. Tests ensure the "View Original" toggle switches displayed content instantly without triggering API calls or component re-renders beyond state updates. Tests validate that language switcher selections update the displayed content to show the newly selected language's translation when available. Each test covers realistic user journeys including switching languages multiple times, toggling between original and translated views, and viewing items with varying levels of translation completeness.

### User Impact
Guests viewing translated content see reliable, consistent behavior across all items and translation scenarios. Content never appears broken or incomplete when translations are partial. Toggle controls respond instantly without loading delays, creating a smooth comparison experience between original and translated versions. Language switching works predictably, always showing the best available content for the selected language.

### Business Value
Ensures the guest-facing translation experience functions flawlessly across all real-world scenarios, preventing user frustration from broken or inconsistent content display. Validates that translation investments deliver actual value through proper content rendering. Creates confidence that partial translations enhance rather than degrade the user experience. Reduces support burden by catching content display edge cases before they reach production users.

### Acceptance Criteria
- [ ] Test verifies that when a complete translation exists, all translated content fields display in place of original content
- [ ] Test verifies that translated item name, description, and all text fields appear in the target language
- [ ] Test verifies that when a translation is partial, untranslated fields display original content seamlessly
- [ ] Test verifies mixed content displays without visual gaps, errors, or inconsistent formatting
- [ ] Test verifies that when no translation exists for requested language, all content displays in original language
- [ ] Test verifies "View Original" toggle switches from translated content to original content instantly
- [ ] Test verifies toggle operation does not trigger network requests or data refetching
- [ ] Test verifies toggle operation updates only the displayed content state without full component re-render
- [ ] Test verifies toggling back to translated view restores the translated content without refetching
- [ ] Test verifies language switcher selection updates displayed content to show new language translation
- [ ] Test verifies switching to a language without translation shows original content with appropriate banner
- [ ] Test verifies switching between multiple languages with available translations shows correct content for each
- [ ] Test verifies link titles within items update to translated versions when translations exist for links
- [ ] Test verifies link titles fall back to original when link translations are unavailable
- [ ] Test verifies translation banners appear correctly when viewing translated content
- [ ] Test verifies missing translation banners appear when requested language is unavailable
- [ ] Test verifies banner messages show correct source and target language names
- [ ] Test suite includes visual regression tests to ensure translated content maintains proper layout and styling
- [ ] Tests cover all content types including items, articles, links, and tags where applicable
- [ ] Tests validate behavior across all six supported languages to ensure consistent display logic

---

## REQ-327: Test Edge Cases in Translation and Localization System

**Date**: 2026-01-18 06:20
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system should have comprehensive test coverage for edge cases and failure scenarios in the translation and localization system to ensure graceful degradation and reliable behavior under unexpected conditions.

### Current Behavior
Core translation functionality has been implemented and tested for standard happy-path scenarios, but edge cases and error conditions lack systematic test coverage. Without testing unusual situations such as partial translations, blocked cookies, malformed headers, and unsupported language codes, the system's resilience under real-world adverse conditions remains unverified.

### Expected Behavior
A comprehensive test suite validates all edge cases and failure scenarios throughout the translation system. Tests verify that when some fields have translations but others are missing, the display seamlessly blends translated and original content without errors or visual gaps. Tests confirm that when browser cookies are blocked or disabled, the system falls back gracefully to URL parameters and browser headers for language detection without breaking functionality. Tests ensure that malformed or invalid Accept-Language headers do not cause crashes, instead triggering appropriate fallback behavior. Tests validate that when unsupported or invalid language codes appear in any input source, the system handles them gracefully by falling back to the next priority detection method or ultimately to the default language.

### User Impact
Guests experience reliable localization behavior even when their browser configuration is unusual or when privacy settings block cookies. Users with non-standard Accept-Language headers or browsers sending unexpected data still see appropriate content in a reasonable language. When translation data is incomplete or inconsistent, content displays professionally without broken layouts or missing information. The system feels robust and trustworthy across all edge cases rather than fragile or error-prone.

### Business Value
Ensures the localization system functions reliably across the full diversity of real-world browser configurations, privacy settings, and user environments. Prevents user frustration and abandonment caused by broken localization in edge cases. Reduces support burden by handling unusual scenarios gracefully without requiring user intervention or support tickets. Creates confidence that the translation system is production-ready and resilient under all conditions.

### Acceptance Criteria
- [ ] Test verifies display behavior when item translation has some fields translated but others remain null or empty
- [ ] Test verifies that missing translated fields fall back to displaying original content for those specific fields
- [ ] Test verifies mixed content scenarios maintain consistent styling and layout without visual breaks
- [ ] Test verifies language detection functions correctly when document.cookie is blocked or inaccessible
- [ ] Test verifies cookie detection gracefully returns null when cookie access throws exceptions
- [ ] Test verifies language preferences persist through URL parameters when cookies are blocked
- [ ] Test verifies the system continues functioning without cookie persistence in privacy-focused browsers
- [ ] Test verifies malformed Accept-Language headers do not cause exceptions or application crashes
- [ ] Test verifies Accept-Language parser handles missing quality weights correctly
- [ ] Test verifies Accept-Language parser handles duplicate language codes without errors
- [ ] Test verifies Accept-Language parser handles extremely long header values without performance issues
- [ ] Test verifies unsupported language codes in URL parameters trigger fallback to cookie detection
- [ ] Test verifies unsupported language codes in cookies trigger fallback to Accept-Language header detection
- [ ] Test verifies completely invalid language codes in all sources fall back to default language
- [ ] Test verifies language codes with incorrect casing are normalized and matched correctly
- [ ] Test verifies regional language variants that are not supported map to base language codes appropriately
- [ ] Test verifies empty string language preferences are treated as missing and trigger fallback
- [ ] Test verifies whitespace-only language values are treated as invalid and trigger fallback
- [ ] Test verifies null and undefined language values at any detection stage trigger appropriate fallback
- [ ] Test verifies translation fetch continues to function when database returns unexpected null values
- [ ] Test suite covers error scenarios without relying on mock implementations that hide real error conditions
- [ ] Tests validate error handling across both client-side and server-side language detection utilities
- [ ] Tests confirm that no edge case scenario results in blank pages, white screens, or application crashes

---

## REQ-328: Mobile Responsiveness Testing for Guest Localization Components

**Date**: 2026-01-18 20:45
**Type**: TESTING
**Size**: M

### Summary
The system should have comprehensive mobile responsiveness testing to ensure all guest-facing localization components function correctly and remain accessible on small screen devices.

### Current Behavior
Guest localization components including the language switcher, translation banners, and toggle controls have been implemented for desktop viewports but lack systematic testing on mobile devices and small screens. Without mobile-specific testing, there is no guarantee that these components remain usable, accessible, and visually correct on smartphones and tablets.

### Expected Behavior
A comprehensive mobile responsiveness test suite validates all guest localization components across various screen sizes and touch devices. Tests verify that the language switcher dropdown renders correctly on small screens without overflow, truncation, or layout issues. Tests confirm that translation banners do not obscure main content or navigation elements on mobile viewports. Tests ensure all interactive elements including buttons, toggles, and dropdown triggers have appropriate touch target sizes for finger-based interaction. The test suite covers both portrait and landscape orientations across common mobile breakpoints.

### User Impact
International guests accessing the application on mobile devices can easily discover and use language switching features. Touch targets are appropriately sized to prevent accidental taps and frustration. Banners provide translation status information without covering important content or blocking user interactions. The localization experience on mobile is as smooth and professional as on desktop, supporting the growing majority of users who access web content primarily through mobile devices.

### Business Value
Ensures the localization investment delivers value to mobile users, who represent a significant and growing portion of web traffic. Prevents user frustration and abandonment caused by broken or unusable mobile interfaces. Supports international markets where mobile-first usage patterns are particularly prevalent. Creates a professional, globally-aware mobile experience that meets user expectations and supports business growth in international markets.

### Acceptance Criteria
- [ ] Test verifies language switcher dropdown renders fully visible on screens 320px wide without horizontal overflow
- [ ] Test verifies language switcher dropdown does not extend beyond viewport boundaries on small screens
- [ ] Test verifies language switcher dropdown items remain readable and selectable on mobile viewports
- [ ] Test verifies language switcher touch target is at least 44x44 pixels for comfortable finger tapping
- [ ] Test verifies translation banner displays correctly on mobile without obscuring page header or navigation
- [ ] Test verifies translation banner text wraps appropriately on narrow screens without truncation of important information
- [ ] Test verifies translation banner "View original" action is easily tappable with appropriate touch target size
- [ ] Test verifies missing translation banner does not push main content below the fold on small screens
- [ ] Test verifies banners stack correctly when multiple informational elements are present on mobile
- [ ] Test verifies ViewOriginalToggle button has minimum 44x44 pixel touch target for accessibility compliance
- [ ] Test verifies toggle button label text remains readable on small screens, wrapping or abbreviating as needed
- [ ] Test verifies language indicator component scales appropriately for mobile header contexts
- [ ] Test verifies flag icons in language components render at appropriate sizes for mobile displays
- [ ] Test verifies dropdown menus close properly when tapping outside on touch devices
- [ ] Test verifies all localization components function correctly in both portrait and landscape orientations
- [ ] Test verifies responsive breakpoints at 320px, 375px, 414px, and 768px cover common mobile device sizes
- [ ] Test verifies no horizontal scrolling is introduced by localization components on any tested viewport size
- [ ] Test verifies touch interactions do not conflict with native mobile browser gestures such as swipe navigation
- [ ] Test verifies all interactive elements have visible focus states for keyboard navigation on tablets
- [ ] Test verifies localization components maintain proper z-index stacking on mobile to prevent content overlap issues

---

## REQ-329: Performance Validation for Guest Localization System

**Date**: 2026-01-18 20:50
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system should meet defined performance benchmarks for all guest-facing localization operations to ensure language features do not degrade user experience or page load times.

### Current Behavior
Guest localization features including language detection, content translation display, and language switching have been implemented but lack systematic performance measurement and validation. Without defined performance benchmarks and testing, there is no guarantee that translation features execute efficiently or that they maintain acceptable response times under production load conditions.

### Expected Behavior
A comprehensive performance test suite validates that all localization operations meet defined performance thresholds. Language detection completes in under 10 milliseconds, ensuring minimal impact on server response times and page load performance. Content retrieval with translation data completes in under 200 milliseconds, providing fast page rendering even when fetching and merging translated content from the database. Client-side language switching executes in under 100 milliseconds, creating an instant, responsive feel when guests toggle between languages or view original content. Performance tests run against realistic data volumes including items with multiple translations, complex Accept-Language headers, and concurrent request scenarios.

### User Impact
Guests experience fast, responsive language features that feel instant rather than laggy or slow. Page loads are not noticeably slower when displaying translated content compared to original language content. Language switching happens immediately without perceptible delay, creating confidence in the localization system. International users on slower networks or devices still experience acceptable performance, ensuring localization features work well across global audiences with varying connection quality.

### Business Value
Ensures localization features enhance rather than degrade application performance, preventing translation capabilities from becoming a competitive disadvantage. Validates that the system can scale to handle production traffic volumes without performance bottlenecks in language detection or translation fetching. Creates confidence that the localization system is production-ready and will perform well under real-world load conditions. Prevents user abandonment caused by slow page loads or unresponsive language controls.

### Acceptance Criteria
- [ ] Performance test measures language detection execution time from request to language code result
- [ ] Language detection consistently completes in under 10 milliseconds across all detection scenarios
- [ ] Detection performance test covers URL parameter detection, cookie detection, and Accept-Language header parsing
- [ ] Performance benchmark accounts for worst-case Accept-Language header complexity with multiple language codes and quality weights
- [ ] Performance test measures end-to-end content retrieval time including database queries and translation merging
- [ ] Content with translation retrieval consistently completes in under 200 milliseconds for typical items
- [ ] Content retrieval benchmark includes joining item content with translation data across all relevant translation tables
- [ ] Performance test validates query efficiency for items with articles, links, and tags that all require translation lookups
- [ ] Performance test measures client-side language switch time from user action to content display update
- [ ] Language switching consistently completes in under 100 milliseconds for client-side toggle operations
- [ ] Switch performance benchmark includes state updates, content swapping, and banner visibility changes
- [ ] Performance tests execute against realistic production-scale data volumes with hundreds of items and translations
- [ ] Tests measure performance impact of partial translations versus complete translations
- [ ] Tests validate that language detection does not create measurable overhead on non-localized routes
- [ ] Performance regression tests run automatically to detect degradation when new localization features are added
- [ ] Benchmark results are documented and tracked over time to identify performance trends
- [ ] Tests identify and report specific bottlenecks when performance thresholds are not met
- [ ] Performance test suite covers both server-side operations and client-side rendering and state management

---

## REQ-338: Create Localization Types File

**Date**: 2026-01-19 13:25
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide a centralized TypeScript types file that defines all localization-related types, interfaces, and constants used throughout the guest-facing internationalization features.

### Current Behavior
No dedicated type definitions exist for localization concerns. Developers must define language types, translation structures, and locale-related interfaces inline or inconsistently across components, leading to potential type mismatches and duplicated type definitions throughout the codebase.

### Expected Behavior
A dedicated types file exports comprehensive TypeScript definitions for all localization needs. The file defines a union type for supported language codes, an interface describing language metadata including display names and locale information, types for translated content structures, and a constant array listing all supported languages with their complete metadata. Developers import these types when implementing any localization feature, ensuring consistent type contracts across the entire application.

### User Impact
Developers building localization features work with strongly-typed, consistent definitions that catch errors at compile time. The application maintains type safety when handling language preferences, translated content, and locale-specific formatting. Users benefit indirectly from fewer runtime errors and more reliable language switching functionality.

### Business Value
Establishes a type-safe foundation for the entire localization system, reducing bugs and improving developer productivity. Centralizing type definitions in a single location simplifies maintenance and ensures consistent handling of localization concerns across all features. This foundation supports rapid, reliable development of additional internationalization capabilities.

### Acceptance Criteria
- [ ] A types file exists at `/src/types/l10n.ts`
- [ ] A SupportedLanguage type is defined as a union of all supported language codes (e.g., 'en' | 'es' | 'fr' | 'de' | 'it' | 'nl')
- [ ] A LanguageInfo interface is defined including fields for language code, display name, native name, and locale information
- [ ] A TranslatedContent type or interface is defined to represent content with translations across multiple fields
- [ ] A SUPPORTED_LANGUAGES constant is exported containing an array of LanguageInfo objects for all six supported languages
- [ ] Language utility types are defined for translation keys, language detection results, and preference storage
- [ ] All exported types include JSDoc comments explaining their purpose and usage
- [ ] The file follows the project's established TypeScript conventions and code style
- [ ] All types are properly exported and can be imported by other modules
- [ ] TypeScript compilation succeeds without errors after adding the types file
---

## REQ-339: Create Guest Language Utility Module

**Date**: 2026-01-19 14:32
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide a comprehensive utility module that detects guest language preferences from multiple sources and persists those preferences across browser sessions.

### Current Behavior
No standardized utilities exist for guest language detection and preference management. Each component or page that needs to determine a guest's language preference must implement its own detection logic, leading to inconsistent behavior and duplicated code across the application.

### Expected Behavior
A dedicated utility module provides four core functions that work together to manage guest language preferences. The first function detects the guest's preferred language by examining URL query parameters, reading stored browser cookies, and parsing the Accept-Language header in priority order. The second function persists language selections by setting a browser cookie with appropriate security attributes and long-term expiration. The third function parses Accept-Language headers to extract language codes with their quality weights and returns them in priority order. The fourth function maps browser-reported language codes to the application's supported languages, handling regional variants and finding the closest match when exact codes are unavailable.

### User Impact
Guests visiting the application automatically see content in their preferred language based on browser settings or previously stored preferences. When guests manually select a language, that choice is remembered across all future visits without requiring repeated selection. The system intelligently handles various browser language configurations, mapping regional language variants to supported languages and ensuring a sensible language choice even when browser preferences don't exactly match available translations.

### Business Value
Provides the foundational infrastructure for all guest language detection throughout the application. Enables automatic language personalization that improves user experience for international visitors and increases engagement with localized content. Creates a reusable, tested foundation that eliminates the need for duplicate language detection logic across multiple features, reducing maintenance burden and preventing inconsistent behavior.

### Acceptance Criteria
- [ ] Module exists at `/src/lib/i18n/guest-language.ts`
- [ ] `detectGuestLanguage` function accepts request object and optional URL parameter as arguments
- [ ] Detection function examines URL language parameter first before other sources
- [ ] Detection function reads the guest language preference cookie when no URL parameter is present
- [ ] Detection function parses the Accept-Language request header as the final fallback
- [ ] Detection function returns the default language when all sources fail or provide unsupported codes
- [ ] `setGuestLanguageCookie` function accepts a language code and sets a browser cookie
- [ ] Cookie is set with one-year expiration to enable long-term preference persistence
- [ ] Cookie includes appropriate security attributes including Secure and SameSite flags
- [ ] Cookie path is set to "/" to make the preference available across all application routes
- [ ] `parseAcceptLanguage` function accepts an Accept-Language header string
- [ ] Parsing function extracts language codes with quality weights from the header
- [ ] Parsing function returns language codes sorted by quality weight in descending order
- [ ] Parsing function handles malformed headers gracefully without throwing errors
- [ ] `mapToSupportedLanguage` function accepts a language code that may not be directly supported
- [ ] Mapping function returns an exact match when the code corresponds to a supported language
- [ ] Mapping function maps regional variants to base language codes when appropriate (e.g., "en-US" to "en")
- [ ] Mapping function returns the default language when no reasonable match can be determined
- [ ] All functions include proper TypeScript type definitions for parameters and return values
- [ ] All functions include JSDoc comments explaining their purpose, parameters, and return values
- [ ] Module exports a constant for the cookie name to ensure consistency across all usage points
- [ ] Functions handle edge cases including null values, empty strings, and undefined parameters

---

## REQ-340: Export Localization Types from Main Types Index

**Date**: 2026-01-19 14:45
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The main types index should re-export all localization types to enable clean, consistent imports across the application.

### Current Behavior
Localization types are defined in a dedicated file but are not accessible through the central types entry point. Developers must import localization types using direct file paths, creating inconsistent import patterns compared to other application types that are imported through the main types index.

### Expected Behavior
The main types index file includes an export statement that re-exports all types from the localization types module. Developers can import any localization type from the types index alongside other application types, maintaining consistent import patterns throughout the codebase. The export statement follows the same pattern used for other type re-exports in the index file.

### User Impact
Developers experience consistent, predictable import patterns when working with localization types. Code reviews become simpler because all type imports follow the same structure. Future refactoring is easier because type imports are centralized through a single entry point.

### Business Value
Maintains architectural consistency by ensuring all types flow through the established central export pattern. Improves long-term code maintainability by preventing scattered direct imports that complicate refactoring. Reduces cognitive load for developers by providing a single, predictable location for all type imports.

### Acceptance Criteria
- [ ] The types index file at `/src/types/index.ts` includes an export statement for localization types
- [ ] The export statement uses the pattern `export * from './l10n'` to re-export all types from the l10n module
- [ ] Localization types can be successfully imported from `@/types` path alias
- [ ] No existing imports or type references are broken by adding the export
- [ ] TypeScript compilation succeeds without errors after adding the re-export
- [ ] The export statement is positioned logically within the index file alongside other type exports

---

## REQ-341: Create Translation Fetch Utilities Module

**Date**: 2026-01-19 02:34
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide dedicated utility functions that retrieve translated content from the database for items, articles, links, and tags based on guest language preferences.

### Current Behavior
No standardized utilities exist for fetching translated content from translation tables. Each feature that needs to display localized content must write custom database queries, leading to inconsistent query patterns, duplicated logic, and varying approaches to handling missing translations across different parts of the application.

### Expected Behavior
A dedicated module provides five specialized functions for fetching translated content. The first function retrieves a complete item with its translation given a public identifier and language code, joining item data with translation tables and returning a merged result. The second function fetches only translation data for an item given its internal identifier and target language. The third function retrieves translations for multiple articles in a single query given a list of article identifiers and language code. The fourth function fetches translations for multiple links given link identifiers and language. The fifth function retrieves translations for multiple tags given tag keys and language. All functions properly handle cases where translations do not exist, gracefully falling back or returning appropriate null values without errors.

### User Impact
Guests see content in their preferred language throughout the application when translations are available. When translations are incomplete or missing, they see the original language content seamlessly without broken displays, missing information, or error messages. The translation experience feels reliable and professional across all content types.

### Business Value
Provides the essential data layer that enables all guest-facing localization features to function. Standardizes translation retrieval patterns across the application, reducing bugs and improving developer productivity. Ensures consistent fallback behavior when translations are unavailable, maintaining content quality and preventing broken user experiences. Creates a maintainable foundation for expanding translation coverage to additional content types.

### Acceptance Criteria
- [ ] Module exists at `/src/lib/translations/fetch-translations.ts`
- [ ] `fetchTranslatedItem` function accepts a public item ID and language code as parameters
- [ ] `fetchTranslatedItem` joins item content tables with item translation tables using appropriate foreign keys
- [ ] `fetchTranslatedItem` returns both original item data and translation data in a structured response object
- [ ] `fetchTranslatedItem` handles missing translations by returning original content with metadata indicating no translation exists
- [ ] `fetchItemTranslations` function accepts an internal item ID and language code as parameters
- [ ] `fetchItemTranslations` retrieves only translation data without joining full item content
- [ ] `fetchItemTranslations` returns null or empty object when no translation exists for the specified language
- [ ] `fetchArticleTranslations` function accepts an array of article IDs and a language code
- [ ] `fetchArticleTranslations` retrieves translations for all specified articles in a single database query
- [ ] `fetchArticleTranslations` returns a collection mapping article IDs to their translation data
- [ ] `fetchArticleTranslations` handles partial results where some articles have translations and others do not
- [ ] `fetchLinkTranslations` function accepts an array of link IDs and a language code
- [ ] `fetchLinkTranslations` retrieves translations for all specified links in a single database query
- [ ] `fetchLinkTranslations` returns a collection mapping link IDs to their translation data
- [ ] `fetchTagTranslations` function accepts an array of tag keys and a language code
- [ ] `fetchTagTranslations` retrieves translations for all specified tags in a single database query
- [ ] `fetchTagTranslations` returns a collection mapping tag keys to their translation data
- [ ] All functions use proper TypeScript type definitions for parameters and return values
- [ ] All functions include proper error handling that prevents database errors from crashing the application
- [ ] Database queries are optimized with appropriate joins, filters, and index usage
- [ ] Functions minimize database round trips by fetching related data in single queries where possible
- [ ] All functions include JSDoc comments explaining parameters, return values, and usage examples
- [ ] Functions work correctly with Supabase client and follow established database access patterns in the project

---

## REQ-342: Create Public Item API Endpoint with Translation Support

**Date**: 2026-01-19 02:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should expose a public API endpoint that returns individual item details with translated content merged based on the guest's language preference.

### Current Behavior
No dedicated public API endpoint exists for retrieving item details with translation support. Guest-facing pages cannot dynamically fetch items with their translated content through a REST API, limiting the ability to build client-side language switching and preventing progressive enhancement patterns for localized content delivery.

### Expected Behavior
A GET endpoint is available at the public items route that accepts a public item identifier in the URL path and an optional language code as a query parameter. When invoked, the endpoint validates the item identifier, retrieves the original item content, fetches available translations for the requested language, and merges the translated content with the original data. The response includes a unified content object where translated fields override original fields, along with metadata indicating the translation status, source language, target language, and which specific fields have translations available. When no translation exists for the requested language, the endpoint returns the original content with metadata clearly indicating the fallback scenario.

### User Impact
Guests can dynamically switch between languages without full page reloads, creating a modern, responsive localization experience. Client-side applications can fetch item data in different languages on demand, enabling instant language switching with smooth transitions. When translations are unavailable, guests still receive complete content in the original language with clear status information explaining the situation.

### Business Value
Enables sophisticated client-side internationalization features including instant language switching, progressive enhancement, and single-page application patterns for localized content. Provides the API foundation needed for mobile applications, progressive web apps, and headless CMS integrations to deliver multilingual content. Supports analytics and A/B testing around translation effectiveness by exposing translation metadata that can inform content strategy decisions.

### Acceptance Criteria
- [ ] GET endpoint exists at `/api/public/items/[publicId]/route.ts`
- [ ] Endpoint accepts a public item identifier as a URL path parameter
- [ ] Endpoint accepts an optional `lang` query parameter specifying the desired language code
- [ ] When no language parameter is provided, endpoint defaults to source language
- [ ] Item lookup validates that the public identifier exists before attempting translation fetch
- [ ] Endpoint returns 404 status code with appropriate error message when item is not found
- [ ] Translation fetch occurs only when a valid, supported language code is provided
- [ ] Translation utilities are called to retrieve item translation data for the requested language
- [ ] Original item content is merged with translation data, with translations taking precedence for available fields
- [ ] Response follows a GuestContentResponse format with consistent structure across all content endpoints
- [ ] Response includes a `content` object containing the merged item data
- [ ] Response includes a `meta` object containing translation metadata
- [ ] Metadata indicates source language code, target language code, and translation status
- [ ] Metadata includes flags or indicators showing which specific fields have translations
- [ ] When translation is unavailable, response includes original content with metadata indicating fallback occurred
- [ ] Endpoint returns 400 status code when language parameter contains invalid or unsupported language code
- [ ] Endpoint returns appropriate HTTP status codes for server errors with helpful error messages
- [ ] Response includes proper CORS headers to allow access from guest-facing client applications
- [ ] Error messages in responses avoid exposing internal system details or database structure
- [ ] Database queries are optimized to minimize round trips and execution time
- [ ] Endpoint performance meets defined benchmarks for content retrieval with translation merging
- [ ] Response TypeScript types are properly defined and exported for client-side consumption
- [ ] All error scenarios are handled gracefully without exposing stack traces or internal errors

---

## REQ-343: Create Language Availability API Endpoint for Public Items

**Date**: 2026-01-19 15:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should expose a public API endpoint that returns all available language translations for a specific item, allowing clients to discover translation coverage before requesting specific language versions.

### Current Behavior
Client applications have no programmatic way to determine which language translations exist for an item without attempting to fetch each translation individually. Language switcher interfaces cannot display only the languages that have actual translations available, potentially showing options that lead to untranslated content and creating a suboptimal user experience.

### Expected Behavior
A GET endpoint is available at the item languages route that accepts a public item identifier and returns a structured response listing all languages for which translations exist. The response includes the item's source language as well as all target languages that have complete or partial translation records in the database. Each language entry in the response provides the language code, human-readable language name, translation completeness status, and the timestamp when the translation was last updated. The endpoint executes efficiently by querying only translation metadata tables without fetching full content data.

### User Impact
Guests see language selection interfaces that accurately reflect which translations are actually available for the content they are viewing. Language switcher dropdowns display only viable language options or clearly indicate which languages lack translations, preventing the frustration of selecting a language only to find the content remains untranslated. The interface builds trust by providing accurate, up-to-date information about translation availability.

### Business Value
Enables intelligent, data-driven language selection interfaces that enhance user experience and demonstrate transparency about translation coverage. Provides visibility into translation completeness that can inform content strategy and help prioritize which items need translation work. Reduces user confusion and support burden by preventing guests from selecting languages that have no available translations. Creates the foundation for advanced features like translation quality indicators and missing translation notifications.

### Acceptance Criteria
- [ ] GET endpoint exists at `/api/public/items/[publicId]/languages/route.ts`
- [ ] Endpoint accepts a public item identifier as a URL path parameter
- [ ] Item lookup validates that the public identifier exists before querying translations
- [ ] Endpoint returns 404 status code with appropriate error message when item is not found
- [ ] Query retrieves all translation records associated with the item from the item_translations table
- [ ] Response includes the item's source language as part of the available languages list
- [ ] Response follows the LanguageAvailabilityResponse format with consistent structure
- [ ] Each language entry includes the language code as a string value
- [ ] Each language entry includes a human-readable language name for display purposes
- [ ] Translation status metadata indicates whether translations are complete, partial, or outdated
- [ ] Response includes timestamps showing when each translation was last updated
- [ ] Database query checks only translation table metadata without fetching full content columns
- [ ] Query is optimized with appropriate indexes and filters to minimize execution time
- [ ] Endpoint handles items with no translations gracefully, returning only the source language
- [ ] Endpoint returns 400 status code when the public identifier format is invalid
- [ ] Endpoint returns appropriate HTTP status codes for server errors
- [ ] Response includes proper CORS headers to allow client-side access from guest-facing domains
- [ ] Error responses include helpful messages without exposing internal database structure
- [ ] Response TypeScript types are properly defined matching the LanguageAvailabilityResponse interface
- [ ] Endpoint performance meets defined benchmarks for metadata retrieval operations
- [ ] All error scenarios are handled gracefully without exposing stack traces or internal errors

---

## REQ-344: Create Translation Utility Helpers for Content Merging and Language Selection

**Date**: 2026-01-19 16:12
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide utility functions that merge original content with translation data, determine the best available language for display, and format language names for user interfaces.

### Current Behavior
No standardized utilities exist for common translation operations such as merging source content with translation overlays, determining which language to display when the requested language is unavailable, or formatting language codes into human-readable names. Each feature that displays translated content must implement these operations independently, leading to inconsistent behavior, duplicated logic, and varying approaches to handling partial translations across different parts of the application.

### Expected Behavior
A dedicated utility module provides three core helper functions that are used consistently throughout all guest-facing localization features. The first function accepts an original content object and a translation object, then returns a merged result where translated fields override corresponding original fields while preserving untranslated content seamlessly. The second function implements intelligent fallback logic by accepting a requested language, an array of available languages, and the source language, then returning the best language to display based on availability. The third function accepts a language code and an optional native flag, then returns a properly formatted display name suitable for user interfaces, with support for both English and native language names.

### User Impact
Guests viewing translated content experience consistent behavior across all content types and features. When translations are partial, they see a seamless blend of translated and original content without gaps, errors, or jarring inconsistencies. Language displays throughout the interface are formatted professionally and consistently. When requested translations are unavailable, the system makes intelligent fallback decisions that prioritize showing content over showing errors.

### Business Value
Centralizes critical translation logic to ensure consistent user experience across all localized features, eliminating the risk of different components handling translations differently. Reduces development time and bug potential by providing well-tested, reusable functions that eliminate the need for duplicate implementations. Creates a maintainable foundation for expanding localization features, as any improvements to merging or fallback logic benefit all features simultaneously through the shared utilities.

### Acceptance Criteria
- [ ] Utility module exists at location provided in the translation utilities path
- [ ] mergeTranslation function accepts two parameters: an original content object and a translation object
- [ ] mergeTranslation creates a new merged object without mutating the original input objects
- [ ] mergeTranslation preserves all fields from the original object when corresponding translation fields are null or undefined
- [ ] mergeTranslation overrides original field values with translation values when translation fields contain actual content
- [ ] mergeTranslation handles nested object properties correctly when merging complex content structures
- [ ] mergeTranslation handles edge cases such as empty objects, null inputs, and mismatched object structures gracefully
- [ ] getDisplayLanguage function accepts three parameters: requested language, available languages array, and source language
- [ ] getDisplayLanguage returns the requested language when it exists in the available languages array
- [ ] getDisplayLanguage returns the source language when the requested language is not in the available languages
- [ ] getDisplayLanguage handles edge cases including empty available languages arrays, null values, and undefined parameters
- [ ] getDisplayLanguage returns a predictable default when all inputs are invalid or missing
- [ ] formatLanguageName function accepts a language code as the first parameter
- [ ] formatLanguageName accepts an optional boolean flag indicating whether to return the native language name
- [ ] formatLanguageName returns the English display name for the language code when the native flag is false or omitted
- [ ] formatLanguageName returns the native language name when the native flag is true
- [ ] formatLanguageName handles all six supported language codes correctly
- [ ] formatLanguageName returns the language code itself as a fallback when the code is unrecognized or unsupported
- [ ] All three utility functions include proper TypeScript type definitions for parameters and return values
- [ ] All functions include comprehensive JSDoc comments explaining parameters, return values, usage examples, and edge case behavior
- [ ] Functions are exported as named exports that can be imported individually or together
- [ ] Module follows the project's established coding conventions and file structure patterns


## REQ-345: Create GuestLanguageSwitcher Component

**Date**: 2026-01-19 03:01
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide a dropdown component for guest-facing pages that displays all supported languages with visual indicators showing which translations are available for the current content.

### Current Behavior
No language selection component exists specifically for guest users viewing public content. Guests have no interface element to discover available language translations or switch between languages when viewing items or other localized content.

### Expected Behavior
A dropdown component appears in guest-facing interfaces showing all six supported languages with their native names and flag icons. When opened, the dropdown clearly indicates which languages have translations available for the current content using checkmark indicators. Languages without available translations appear visually distinct through reduced opacity or gray styling but remain selectable to allow guests to set their language preference even when translations are incomplete. The component implements the Radix UI dropdown primitive to ensure full keyboard navigation, screen reader support, and adherence to accessibility best practices.

### User Impact
Guests can easily discover which languages are supported and immediately see which translations are available for the content they are viewing. The visual design with flag icons and native language names creates an intuitive selection experience for international users regardless of their English proficiency. Full keyboard navigation and screen reader support ensure the language switcher is accessible to users with disabilities, complying with international accessibility standards.

### Business Value
Provides the primary interface through which guests access translated content, making translation investments visible and valuable to end users. Creates a professional, internationally-aware user experience that signals to global audiences that the platform is built for them. Accessible implementation ensures compliance with accessibility regulations and broadens potential market reach to users who rely on assistive technologies.

### Acceptance Criteria
- [ ] Component file exists at `/src/components/guest/GuestLanguageSwitcher/GuestLanguageSwitcher.tsx`
- [ ] Component displays a dropdown showing all six supported languages (English, Spanish, French, German, Italian, Dutch)
- [ ] Each language entry displays a flag icon corresponding to the language
- [ ] Each language entry displays the language's native name for recognition by native speakers
- [ ] Visual checkmark indicator appears next to languages that have translations available for the current content
- [ ] Languages without available translations are visually distinguished through styling such as reduced opacity or gray text
- [ ] All languages remain clickable and selectable regardless of translation availability
- [ ] Component is built using Radix UI dropdown primitives for proper accessibility support
- [ ] Dropdown can be fully operated using keyboard controls including arrow keys for navigation, Enter to select, and Escape to close
- [ ] Screen readers announce the current language selection and available language options appropriately
- [ ] Selecting a language triggers a callback function provided through component props
- [ ] Component accepts a property specifying which languages have translations available for the current content
- [ ] Component accepts a property indicating the currently selected language to highlight in the dropdown
- [ ] Component displays the currently selected language with its flag in the closed state
- [ ] Dropdown positioning and layout work correctly across various page contexts without overflow or clipping issues
- [ ] Component follows the project's established design system for colors, typography, and spacing
- [ ] Component remains responsive and functional on mobile viewports with appropriate touch target sizing
- [ ] Flag icons are sourced from the project's established icon or image asset library
- [ ] TypeScript prop types are properly defined with clear interfaces for component properties
- [ ] Component includes proper error handling for missing or invalid prop values

---

## REQ-346: Create TranslationBanner Component

**Date**: 2026-01-19 15:47
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should display a persistent informational banner when guests view translated content, indicating the source language and providing access to view the original version.

### Current Behavior
When guests view content that has been translated from another language, there is no visual indication that they are seeing a translation rather than the original content. Guests cannot easily determine the source language or access the original untranslated version, potentially causing uncertainty about content authenticity and accuracy.

### Expected Behavior
A light blue banner appears at the top of translated content displaying a globe icon and the text "Translated from [Language] - View original" where [Language] is replaced with the source language name. The banner uses a professional, informational design with background color #E3F2FD that clearly communicates translation status without being intrusive. The "View original" text is clickable, triggering a switch to display the source language content. The banner is not dismissible and remains visible as long as translated content is being displayed, ensuring translation status is always transparent.

### User Impact
Guests viewing translated content always know they are seeing a translation rather than original content. This transparency builds trust by making the translation status immediately obvious. Users who want to verify translation accuracy or prefer to read the original language can easily switch to the source content with a single click. The persistent visibility ensures there is never ambiguity about whether content is original or translated.

### Business Value
Maintains transparency and trust with international audiences by clearly identifying all translated content. Provides legal and ethical protection by ensuring users are always aware when viewing automated or human-assisted translations rather than original authored content. Reduces potential support inquiries about content accuracy by making translation status immediately visible and providing instant access to original content for verification.

### Acceptance Criteria
- [ ] Component file exists at `/src/components/guest/TranslationBanner/TranslationBanner.tsx`
- [ ] Component renders a banner with light blue background color (#E3F2FD)
- [ ] Banner displays a globe icon positioned on the left side of the text content
- [ ] Banner shows the text "Translated from [Language] - View original" with dynamic language name insertion
- [ ] Component accepts a property for the source language code to generate the correct language name
- [ ] Component accepts an onClick handler property for the "View original" action
- [ ] "View original" text is styled as clickable with appropriate hover and focus states
- [ ] Banner spans the full width of its container with appropriate internal padding
- [ ] Component is non-dismissible with no close button or dismiss functionality
- [ ] Typography and spacing follow the project's design system guidelines
- [ ] Banner is visually distinct from content while maintaining a calm, informational appearance
- [ ] Component works correctly on mobile viewports without horizontal scrolling or layout breaks
- [ ] Banner text wraps appropriately on narrow screens without truncating important information
- [ ] Screen readers announce the banner content and "View original" action with appropriate semantics
- [ ] Component follows established patterns for informational banners used elsewhere in the application
- [ ] Globe icon is sourced from the project's established icon library
- [ ] TypeScript prop types are properly defined with clear interfaces for component properties
- [ ] Component includes proper handling for missing or invalid prop values
- [ ] Component remains accessible with proper ARIA attributes and keyboard navigation support

---

## REQ-347: Create MissingTranslationBanner Component

**Date**: 2026-01-19 16:45
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should display a subtle informational banner when a guest requests content in a language that lacks an available translation, explaining that the content is being shown in the original language instead.

### Current Behavior
When guests select a language preference for which no translation exists, the application silently displays the original language content without explanation. Guests have no indication that their language preference was recognized but cannot be fulfilled, potentially causing confusion about why content appears in a different language than they selected.

### Expected Behavior
A muted informational banner appears at the top of content when a guest has selected a language preference but the requested translation is unavailable. The banner displays a message following the pattern "[Requested Language] translation not available. Showing content in [Source Language]." with gentle, non-alarming styling that informs without creating concern. The banner uses subdued colors such as light gray background with neutral text colors and includes a calm information icon. The styling intentionally avoids warning or error visual patterns to maintain a professional, reassuring tone while still providing transparency about translation availability.

### User Impact
Guests understand why content appears in a language different from their selection, eliminating confusion and setting appropriate expectations about translation coverage. The gentle presentation avoids creating alarm or suggesting a system error has occurred, while still maintaining transparency. Users know their preference was recognized and will be honored when translations become available, building trust in the localization system.

### Business Value
Manages user expectations around translation coverage without creating negative emotional responses or suggesting the platform is broken. Maintains transparency and builds trust by acknowledging the language preference while explaining why it cannot currently be fulfilled. Reduces support inquiries from users confused about why language switching appears not to work for certain content. Demonstrates respect for user preferences even when they cannot immediately be met.

### Acceptance Criteria
- [ ] Component file exists at `/src/components/guest/MissingTranslationBanner/MissingTranslationBanner.tsx`
- [ ] Component renders a banner with muted, neutral background color such as light gray (#F5F5F5)
- [ ] Banner displays a calm information icon that avoids warning or error styling
- [ ] Banner shows text indicating which translation was requested and which language is being displayed instead
- [ ] Message format follows the pattern "[Requested Language] translation not available. Showing content in [Source Language]."
- [ ] Component accepts a property for the requested language code to generate the correct language name
- [ ] Component accepts a property for the source language code to indicate what is actually being displayed
- [ ] Banner uses subdued text colors that draw less attention than primary content
- [ ] Typography uses smaller or less prominent font sizing compared to primary content headings
- [ ] Banner spans the full width of its container with appropriate internal padding
- [ ] Component is non-dismissible and remains visible while the language mismatch condition exists
- [ ] Component works correctly on mobile viewports without horizontal scrolling or layout breaks
- [ ] Banner text wraps appropriately on narrow screens without truncating the language names
- [ ] Screen readers announce the banner content with appropriate informational tone using proper ARIA attributes
- [ ] Component follows established patterns for non-critical informational banners in the application
- [ ] Information icon is sourced from the project's established icon library
- [ ] Styling intentionally avoids colors, icons, or patterns associated with errors or warnings
- [ ] TypeScript prop types are properly defined with clear interfaces for component properties
- [ ] Component includes proper handling for missing or invalid prop values
- [ ] Component maintains professional appearance without creating visual alarm or distraction from content

---

## REQ-348: Create ViewOriginalToggle Component

**Date**: 2026-01-19 19:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide a toggle button that allows guests viewing translated content to switch between the translated version and the original source language version.

### Current Behavior
No dedicated toggle control exists for switching between translated and original content views within the guest interface. Guests viewing translations must rely on banner links or dropdown selections to access original content, creating inconsistent interaction patterns and requiring multiple interface elements to accomplish a simple toggle action.

### Expected Behavior
A secondary-styled button component displays with dynamic label text that changes based on whether the guest is currently viewing translated or original content. When viewing a translation, the button shows "View in original (English)" alongside a swap icon. When viewing the original, it shows "View translation" with the same swap icon. The button follows the secondary button style from the design system to visually distinguish it from primary actions while remaining clearly interactive. Clicking the toggle instantly switches between the two content versions without requiring navigation or dropdown interaction.

### User Impact
Guests can quickly toggle between translated and original content using a single, clearly labeled button. The dynamic labeling makes the current state and available action immediately obvious without requiring guests to remember what they are currently viewing. The swap icon provides universal visual reinforcement of the toggle behavior that transcends language barriers, making the interaction intuitive even for users with limited English proficiency.

### Business Value
Provides a streamlined, reusable interaction pattern for accessing original content that can be embedded in various contexts throughout the guest experience. Improves usability for bilingual users who frequently want to compare translations with originals or verify translation accuracy. Creates a consistent toggle pattern that supports professional multilingual content presentation and meets user expectations in international markets.

### Acceptance Criteria
- [ ] Component file exists at `/src/components/guest/ViewOriginalToggle/ViewOriginalToggle.tsx`
- [ ] Component renders as a button using the secondary button style from the design system
- [ ] Label dynamically displays "View in original (English)" when currently viewing a translation
- [ ] Label dynamically displays "View translation" when currently viewing the original content
- [ ] Source language name is dynamically inserted into the label rather than hardcoded as "English"
- [ ] Component accepts a property for the source language code to generate correct labels
- [ ] Swap icon appears within the button, positioned consistently with the label text
- [ ] Icon is sourced from the project's established icon library
- [ ] Component accepts a property indicating the current view state (whether viewing translation or original)
- [ ] Component accepts an onClick handler property that is called when the button is clicked
- [ ] Button follows accessibility patterns with proper ARIA attributes for toggle controls
- [ ] Button includes proper keyboard support including Enter and Space key activation
- [ ] Typography and spacing follow the project's design system guidelines
- [ ] Component works correctly on mobile viewports with appropriate touch target sizing (minimum 44x44 pixels)
- [ ] Button visual states clearly indicate interactivity through hover, focus, and active states
- [ ] Screen readers announce the button's current label and its toggle nature appropriately
- [ ] TypeScript prop types are properly defined with clear interfaces for component properties
- [ ] Component includes proper handling for missing or invalid prop values
- [ ] Button styling provides sufficient contrast with surrounding content for visibility
- [ ] Component maintains visual consistency with other secondary actions in the application


---

## REQ-349: Create LanguageIndicator Component

**Date**: 2026-01-19 20:15
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should display a compact visual indicator showing guests which language they are currently viewing, with optional context about the original source language when content has been translated.

### Current Behavior
No persistent language indicator exists in the guest interface to show which language is currently being displayed. Guests must rely on recognizing the language of the content itself or remembering their language selection to understand what language they are viewing, creating potential confusion especially during language switching or when visiting shared links that may default to unexpected languages.

### Expected Behavior
A compact component displays in the application header or navigation area showing the current display language with its corresponding flag icon and language name. When viewing translated content, an optional subtitle appears in a smaller, muted font showing "Translated from [Original Language]" to provide transparency about the content's origin. The component maintains a minimal footprint suitable for persistent header display without consuming excessive space or overwhelming the interface. The flag icon provides immediate visual recognition of the current language, while the text label ensures clarity for guests who may not recognize flag symbols.

### User Impact
Guests always have clear awareness of which language they are currently viewing without needing to inspect content or recall previous selections. When viewing translations, guests understand the content originated in a different language, building trust through transparency. The compact design ensures this information remains visible without interfering with primary content or navigation. The combination of flag icon and text label accommodates different user preferences and accessibility needs, making language status universally clear.

### Business Value
Reduces confusion and support inquiries related to unexpected language display, especially for users accessing shared links or returning to the application after language preference changes. Builds trust by maintaining transparency about content origin and translation status. Provides consistent language status awareness that supports professional multilingual content presentation and meets user expectations in international markets. Creates a reusable component that can be positioned in various interface locations as design needs evolve.

### Acceptance Criteria
- [ ] Component file exists at `/src/components/guest/LanguageIndicator/LanguageIndicator.tsx`
- [ ] Component displays a flag icon representing the current display language
- [ ] Component displays the language name in text form adjacent to or near the flag icon
- [ ] Flag icons are sourced from a consistent flag icon library or asset set
- [ ] Component accepts a property for the current language code to determine which flag and name to display
- [ ] Component accepts an optional property to specify the source language when content is translated
- [ ] When source language property is provided, component displays a subtitle in smaller, muted text
- [ ] Subtitle follows the format "Translated from [Source Language]" when present
- [ ] Subtitle uses reduced font size and lighter text color to visually de-emphasize it relative to the main language display
- [ ] Component maintains a compact layout suitable for header or navigation bar placement
- [ ] Component does not exceed reasonable width constraints that would disrupt header layouts (approximately 150-200 pixels)
- [ ] Component works correctly on mobile viewports with appropriate responsive sizing
- [ ] On mobile, component may stack elements vertically or abbreviate text to fit space constraints
- [ ] Component includes proper accessibility attributes for screen readers to announce current language
- [ ] Screen readers convey both the current display language and the translation source if present
- [ ] Component maintains readable contrast ratios for both the main language name and optional subtitle
- [ ] Component follows the project's design system typography and spacing guidelines
- [ ] TypeScript prop types are properly defined with clear interfaces for component properties
- [ ] Component handles missing flag assets gracefully, falling back to text-only display if flag cannot be loaded
- [ ] Component remains visually consistent with surrounding header or navigation elements
- [ ] Flag icon sizing is proportional and does not appear overly large or small relative to text

---

## REQ-350: Create Barrel Export for Guest Components

**Date**: 2026-01-19 20:30
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The system should provide a centralized barrel export file that exports all guest-facing localization components through a single import point.

### Current Behavior
Guest-facing components for language switching and translation status display exist as individual files within the guest components directory. Consuming code must import each component directly from its specific file path, leading to verbose import statements, inconsistent import patterns across the codebase, and increased maintenance burden when component file locations change. No centralized export point exists to simplify component imports.

### Expected Behavior
A barrel export file at the guest components directory root exports all guest-facing localization components including GuestLanguageSwitcher, TranslationBanner, MissingTranslationBanner, ViewOriginalToggle, and LanguageIndicator. Consuming code can import multiple guest components from a single module path using destructured imports. The barrel export automatically includes all components in the directory, making component imports concise and maintainable. When new guest components are added, they are added to this barrel export to maintain consistent import patterns.

### User Impact
Developers benefit from cleaner, more maintainable import statements when using guest localization components. Code reviews become easier as import patterns remain consistent throughout the application. Refactoring component file structures becomes safer as internal paths are abstracted behind the barrel export.

### Business Value
Reduces technical debt and improves code maintainability by establishing consistent import patterns. Decreases development time for features that consume guest components by eliminating the need to locate individual component file paths. Creates a scalable pattern that simplifies codebase navigation and reduces friction as the guest component library grows.

### Acceptance Criteria
- [ ] Barrel export file exists at `/src/components/guest/index.ts`
- [ ] File exports GuestLanguageSwitcher component
- [ ] File exports TranslationBanner component
- [ ] File exports MissingTranslationBanner component
- [ ] File exports ViewOriginalToggle component
- [ ] File exports LanguageIndicator component
- [ ] All exports use named export syntax for consistency
- [ ] File includes a comment header documenting its purpose as a barrel export for guest localization components
- [ ] File follows the project's established barrel export patterns if they exist elsewhere in the codebase
- [ ] Consuming code can successfully import components using destructured syntax from the barrel file
- [ ] TypeScript type definitions are properly exported alongside component exports
- [ ] No circular dependency warnings or errors occur when importing from the barrel file
- [ ] File is formatted according to project linting and formatting standards
- [ ] Updates to component file locations only require changes to the barrel export, not to consuming code


---

## REQ-351: Create Cookie Utility for Guest Language Persistence

**Date**: 2026-01-19 20:35
**Type**: NEW FEATURE
**Size**: S

### Summary
The system should provide a utility module for managing guest language preference cookies with proper security settings and long-term persistence.

### Current Behavior
No cookie management utility exists for storing guest language preferences. Guest users cannot persist their language selection across sessions, forcing them to reselect their preferred language each time they visit the application. No mechanism exists to remember the language choice for unauthenticated visitors between browser sessions.

### Expected Behavior
A cookie utility module provides functions to read, write, and clear a guest language preference cookie named `FAQBNB_GUEST_LANG`. When a guest selects a language, the utility stores the language code in the cookie with a one-year expiration period. The cookie includes security flags to protect user data and ensure proper cross-site behavior. On subsequent visits, the utility retrieves the stored language preference from the cookie, allowing the application to display content in the guest's previously selected language without requiring re-selection. The utility handles edge cases including missing cookies, expired cookies, and invalid language codes gracefully.

### User Impact
Guest users experience seamless language persistence across sessions, maintaining their preferred language choice without repeated configuration. Users visiting the application from the same browser consistently see content in their chosen language, improving the user experience for multilingual audiences. Users no longer lose their language preference when closing and reopening their browser.

### Business Value
Improves user retention by providing a personalized experience that remembers guest preferences across sessions. Reduces friction in the guest journey by eliminating repetitive language selection tasks. Demonstrates respect for user preferences, building trust with international visitors who rely on non-English language support.

### Acceptance Criteria
- [ ] Cookie utility module exists at `/src/lib/i18n/guest-language.ts`
- [ ] Module exports a function to write the guest language preference cookie
- [ ] Cookie is named exactly `FAQBNB_GUEST_LANG`
- [ ] Cookie expiration is set to one year from the write date
- [ ] Cookie includes the `Secure` flag to ensure HTTPS-only transmission
- [ ] Cookie includes `SameSite=Lax` to balance security with cross-site functionality
- [ ] Module exports a function to read the guest language preference from the cookie
- [ ] Read function returns the language code string when cookie exists and is valid
- [ ] Read function returns null or undefined when cookie does not exist or is expired
- [ ] Module exports a function to clear the guest language preference cookie
- [ ] Clear function properly removes the cookie by setting expiration to a past date
- [ ] Module handles cases where cookies are disabled or blocked by the browser
- [ ] Module validates that language codes stored in cookies match supported language codes
- [ ] Module includes TypeScript type definitions for all exported functions
- [ ] Module includes inline documentation describing function parameters and return values
- [ ] Cookie path is set to root `/` to ensure availability across the entire application
- [ ] Module is compatible with both client-side and server-side rendering contexts where applicable

---

## REQ-352: Update Guest Item Page with Localization Support

**Date**: 2026-01-19 00:00
**Type**: ENHANCEMENT
**Size**: L

### Summary
The guest-facing item detail page must detect the guest's preferred language and display item content with appropriate translations, including metadata for search engine optimization.

### Current Behavior
The guest item page displays content exclusively in the source language (typically English). No language detection occurs from URL parameters, cookies, or headers. Item titles, descriptions, and other textual content appear only in the language provided by the item owner. Search engines index only the source language version of the page, limiting discoverability for non-English search queries. Guest users viewing items cannot see translated versions of item content regardless of their language preference.

### Expected Behavior
When a guest navigates to an item detail page, the server component detects the guest's language preference by checking URL parameters first, then cookies, then browser headers. The server fetches the item data along with translation records for the detected language. The server passes both the primary content and translation metadata to client components for rendering. The server generates page metadata including title, description, and Open Graph tags using the translated versions when available, falling back to source language when translations are missing. Search engines receive properly localized metadata, improving discoverability in non-English search results. Guests see item content in their preferred language when translations exist, with clear indication when viewing source language or partial translations.

### User Impact
Guest users view item content in their preferred language, improving comprehension and engagement with listed items. International guests browsing items receive a localized experience without manual language switching per page. Search engine users discover items through searches in their native language, expanding the audience reach for item owners. Guests with limited English proficiency access item information that was previously inaccessible to them.

### Business Value
Expands market reach by making item listings accessible to non-English speaking audiences. Improves SEO performance in international markets through proper localized metadata. Increases conversion rates by presenting item information in languages guests understand best. Demonstrates platform commitment to internationalization, building credibility with global users.

### Acceptance Criteria
- [ ] Server component detects language from URL parameter (highest priority)
- [ ] Server component checks cookie for language preference when URL parameter is absent
- [ ] Server component examines Accept-Language headers when URL and cookie are absent
- [ ] Server component defaults to English when no language preference is detected
- [ ] Server component fetches item record from database by public ID
- [ ] Server component fetches translation records for detected language and item ID
- [ ] Server component passes translation status metadata to client components
- [ ] Server component passes both source content and translated content to client components
- [ ] Page metadata function generates title tag using translated item title when available
- [ ] Page metadata function generates description meta tag using translated description when available
- [ ] Page metadata function generates Open Graph title using translated content when available
- [ ] Page metadata function generates Open Graph description using translated content when available
- [ ] Metadata falls back to source language content when translations are missing
- [ ] Metadata includes language code in HTML lang attribute matching detected language
- [ ] Server component handles cases where item does not exist with appropriate 404 response
- [ ] Server component handles database errors gracefully without exposing internal details
- [ ] Translation fetch queries use proper joins to retrieve related translation records
- [ ] Server component validates language codes against supported language list
- [ ] Page renders successfully when translations are partial or missing
- [ ] TypeScript types properly define the shape of data passed from server to client components


---

## REQ-353: Update ItemDisplay Component with Translation Support

**Date**: 2026-01-19 15:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The ItemDisplay component should show content in the guest's preferred language when translations are available, with controls to switch languages and view the original version.

### Current Behavior
The ItemDisplay component renders item content in the original language only, without any language selection or translation awareness.

### Expected Behavior
When a guest views an item, the component should:
- Display content in their preferred language when a translation exists
- Show a language switcher in the header allowing them to change languages
- Display a banner indicating when translated content is being shown
- Display a banner when no translation is available for the selected language
- Allow guests to toggle between the translation and original version
- Remember the guest's viewing preference (original vs. translation) during their session

### User Impact
Guests will be able to consume item content in their preferred language, understand when they are viewing translated content, and easily switch between languages or view the original version at any time.

### Business Value
Enhances the multilingual guest experience by providing transparent, controllable access to translated content with clear visual indicators of translation status.

### Acceptance Criteria
- [ ] Component accepts translation metadata and original content as props
- [ ] Guest language preference is obtained via the useGuestLanguage hook
- [ ] GuestLanguageSwitcher component appears in the item header
- [ ] TranslationBanner displays when showing translated content
- [ ] MissingTranslationBanner displays when selected language has no translation
- [ ] Toggle control allows switching between original and translated versions
- [ ] View preference (original/translation) is maintained via client-side state
- [ ] All language switches and toggles update the display without page reload


---

## REQ-354: Update LinkCard Component with Translation Support

**Date**: 2026-01-19 15:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
The LinkCard component must accept translated link titles and display them in the guest's preferred language, with the ability to show the original title when a view-original toggle is activated.

### Current Behavior
The LinkCard component displays link titles exclusively in the source language as stored in the database. No translation props are accepted, and the component has no awareness of language preferences or translation availability. Guest users see all link titles in the original language regardless of their language settings or available translations.

### Expected Behavior
When rendering a link card, the component receives both the original title and the translated title as props. By default, the component displays the translated title when available and the translation is not toggled off. When a guest activates a view-original toggle elsewhere in the interface, the component switches to display the original title instead. The component handles cases where translations are missing by displaying the original title without visual disruption. The transition between original and translated titles occurs smoothly without page reload or layout shift.

### User Impact
Guest users viewing link collections see link titles in their preferred language, making link content more accessible and understandable. Guests who prefer to see original language content can easily toggle to view source titles. International guests browsing curated links benefit from localized titles that match their language settings.

### Business Value
Improves the multilingual guest experience by extending translation support to link metadata. Increases engagement with curated link collections by presenting them in languages guests understand. Maintains consistency across the platform by ensuring all user-facing content respects language preferences.

### Acceptance Criteria
- [ ] Component accepts a translated title prop alongside the original title prop
- [ ] Component displays translated title by default when translation is provided
- [ ] Component responds to view-original toggle state to switch between translated and original titles
- [ ] Component displays original title when no translation is available
- [ ] Component handles undefined or null translated title props gracefully
- [ ] Title display updates without causing layout shift or reflow
- [ ] Component maintains existing styling and visual appearance for both original and translated titles
- [ ] TypeScript types include optional translated title property in component props interface
- [ ] Component preserves all existing functionality for link navigation and interaction
- [ ] Component works correctly when nested within translated item or article contexts



---

## REQ-355: Support Language Parameter in Shareable URLs

**Date**: 2026-01-19 16:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Guest-facing pages should accept a language parameter in the URL to enable shareable links that open directly in a specific language, while maintaining proper SEO through canonical URL management.

### Current Behavior
Guest-facing pages determine language through browser settings, cookies, or default values only. URLs do not accept language parameters. When guests share links to items or articles, recipients always see content in their own browser's language preference rather than the language the sharer intended. No mechanism exists to create language-specific shareable links.

### Expected Behavior
When a guest views an item or article, the page reads a `lang` query parameter from the URL (e.g., `?lang=es`). If present and valid, this parameter overrides all other language detection methods including cookies and browser headers. When a guest shares the current page using the share functionality, the generated shareable link includes the current language as a query parameter, ensuring recipients see the same language version. The canonical URL tag in page metadata excludes the language parameter to avoid SEO penalties for duplicate content. Language parameter values are validated against the list of supported languages, falling back to default detection when invalid.

### User Impact
Guests can share specific language versions of items and articles with others through simple URL sharing. Recipients who click shared links immediately see content in the intended language without needing to adjust settings. Users who prefer a specific language can bookmark URLs with language parameters for consistent experience across sessions.

### Business Value
Enables viral growth through language-specific sharing where users can recommend content to international contacts in their native language. Reduces friction in cross-border recommendations by eliminating manual language switching. Maintains SEO best practices through proper canonical URL implementation, avoiding duplicate content penalties while supporting multilingual URLs.

### Acceptance Criteria
- [ ] Page router reads `lang` query parameter from URL search params
- [ ] Valid language parameter takes highest priority in language detection hierarchy
- [ ] Language parameter validates against supported language codes list
- [ ] Invalid or unsupported language codes are ignored and fallback detection proceeds
- [ ] Share functionality generates URLs including current language as query parameter
- [ ] Generated shareable URLs use format: `{base_url}?lang={code}`
- [ ] Canonical URL meta tag in page head excludes language query parameter
- [ ] Canonical URL points to base page path without query parameters
- [ ] Language parameter works correctly on all guest-facing pages (items, articles, etc.)
- [ ] URL parameter persists across client-side navigation when present
- [ ] Browser history correctly maintains language parameter when navigating
- [ ] Language switcher component updates URL parameter when guest changes language
- [ ] Removing language parameter via manual URL edit reverts to default detection
- [ ] Page metadata (title, description, Open Graph) reflects language from URL parameter



---

## REQ-356: Add Guest Language Detection to Middleware for Item Routes

**Date**: 2026-01-19 16:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The middleware should detect guest language preferences for item routes and make that language available to downstream page components without performing redirects.

### Current Behavior
The middleware does not process `/item/*` routes for language detection. Guest-facing item pages have no access to language preferences determined at the middleware level. Language detection happens independently in each page component, creating inconsistency and performance overhead. The middleware matcher pattern excludes item routes from processing.

### Expected Behavior
The middleware matcher includes `/item/*` routes in its pattern list. When a request arrives for an item page, the middleware detects the guest's preferred language using a consistent priority order: URL query parameter, language cookie, Accept-Language header, then default fallback. The detected language is stored in a custom response header and optionally refreshed in a cookie for future requests. The middleware does not perform any redirects or path modifications, as language selection uses query parameters rather than path-based routing. Page components access the detected language from the request headers provided by the middleware, ensuring consistent language handling across all guest-facing pages.

### User Impact
Guest users viewing items experience consistent language detection across their session. Language preferences are automatically detected from their browser settings on first visit. Subsequent visits remember their language choice through cookies. The page loads directly in the detected language without redirects or delays.

### Business Value
Provides foundation for multilingual guest experience by centralizing language detection logic in middleware. Improves performance by determining language once per request rather than redundantly in multiple components. Enables consistent language behavior across all guest-facing pages through a single implementation point.

### Acceptance Criteria
- [ ] Middleware matcher pattern includes `/item/*` in the routes list
- [ ] Middleware reads language from URL query parameter with highest priority
- [ ] Middleware reads language preference from cookie when query parameter is absent
- [ ] Middleware parses Accept-Language header as fallback when cookie is not present
- [ ] Middleware uses default language when no other preference indicators exist
- [ ] Detected language is validated against supported language codes list
- [ ] Invalid language codes trigger fallback to default language
- [ ] Middleware sets custom response header containing detected language code
- [ ] Middleware updates language cookie with detected language when appropriate
- [ ] Middleware does not redirect requests or modify URL paths
- [ ] Language detection completes before request reaches page component
- [ ] Page components can access detected language from request headers
- [ ] Middleware preserves all existing functionality for authenticated routes
- [ ] Cookie has appropriate expiration, domain, and security settings
- [ ] Solution works correctly for both initial page loads and client-side navigation

---

## REQ-357: Test Language Detection Priority Scenarios

**Date**: 2026-01-19 00:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
Validate that the language detection system correctly applies priority rules across browser preferences, cookie storage, URL parameters, and fallback mechanisms.

### Current Behavior
Language detection logic exists in the middleware and utility modules, but comprehensive testing scenarios have not been systematically validated to ensure the priority chain works as designed.

### Expected Behavior
The system should correctly detect and apply language preferences according to this priority order:
1. URL parameter (highest priority)
2. Cookie preference
3. Browser Accept-Language header
4. Fallback to original content language (lowest priority)

Each priority level should override lower-priority sources.

### User Impact
Guests viewing items, articles, or links experience consistent language selection regardless of how they arrive at the content. Validation ensures that explicit choices (URL parameters) always win over implicit preferences (browser settings), preventing confusion or unexpected language switching.

### Business Value
Comprehensive testing prevents language detection bugs that could frustrate international users and ensures the localization system behaves predictably across all entry points.

### Acceptance Criteria
- [ ] Browser language detection correctly identifies preferred language from Accept-Language header when no other preferences exist
- [ ] Cookie-stored language preference overrides browser settings when present
- [ ] URL parameter (e.g., ?lang=de) overrides both cookie and browser preferences
- [ ] System falls back to original content language when no preference is available or detected language has no translation
- [ ] All test scenarios documented with expected inputs and outputs
- [ ] Edge cases validated (invalid language codes, missing translations, conflicting preferences)



---

## REQ-358: Test Content Display Scenarios for Translated Guest Experience

**Date**: 2026-01-19 18:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Validate that guest-facing content displays correctly across all translation scenarios, including proper translation display, fallback to original content, instant toggle functionality, and dynamic language switching.

### Current Behavior
Translation components and language detection logic have been implemented, but comprehensive end-to-end testing scenarios for content display have not been systematically validated to ensure seamless guest experience across all translation states.

### Expected Behavior
The system should correctly display content according to these scenarios:

1. **Translated Content Display**: When a translation exists for the guest's selected language, all translatable content (item descriptions, article text, link descriptions, tag names) displays in that language while maintaining proper formatting and structure.

2. **Original Content Fallback**: When no translation exists for the selected language, the system displays the original content without error states, with optional indicators showing that content is displayed in its original language.

3. **View Original Toggle**: Guests can instantly switch between translated and original content using a toggle control, with the change applying immediately without page reload or visible delay.

4. **Language Switcher Updates**: When guests use the language switcher component to change their language preference, all displayed content updates to reflect the new language selection, showing translations when available or original content as fallback.

### User Impact
Guests viewing multilingual content experience predictable, reliable content display regardless of translation availability. Users can verify translations against original content instantly. Language changes apply immediately across the entire interface without confusion or broken states. The experience feels polished and professional across all language combinations.

### Business Value
Validates the complete guest-facing translation experience to ensure international users can consume content naturally in their preferred language. Prevents frustration from incomplete translations or broken language switching. Builds trust in the platform's multilingual capabilities through consistent, reliable behavior.

### Acceptance Criteria
- [ ] Translated content displays correctly when translation exists for selected language
- [ ] All translatable fields (descriptions, titles, tags) show translated versions consistently
- [ ] Original content displays properly when no translation exists for selected language
- [ ] Missing translations do not cause errors, blank content, or loading states
- [ ] "View Original" toggle switches between translated and original content instantly
- [ ] Toggle state persists while navigating within the same item or article
- [ ] Toggle works correctly when translation is missing (shows original in both states)
- [ ] Language switcher component updates all visible content when language changes
- [ ] Content update happens without full page reload
- [ ] Language change applies to all translated elements on the page simultaneously
- [ ] Switching to a language without translations shows original content gracefully
- [ ] All test scenarios cover items, articles, and links content types
- [ ] Edge cases validated (partial translations, mixed language content, rapid language switching)
- [ ] Performance remains smooth when toggling or switching languages repeatedly
- [ ] Test scenarios documented with expected visual outcomes and behavior

---

## REQ-359: Test Edge Cases in Translation and Localization System

**Date**: 2026-01-19 18:50
**Type**: ENHANCEMENT
**Size**: M

### Summary
Validate that the localization system handles edge cases gracefully, including partial translations, blocked cookies, malformed language headers, and unsupported language codes.

### Current Behavior
The translation and language detection system has been implemented with standard use cases in mind, but comprehensive testing of edge cases and error scenarios has not been systematically performed to ensure robust behavior when conditions are not ideal.

### Expected Behavior
The system should handle edge cases gracefully:

1. **Missing Translation for Some Fields**: When an item, article, or link has translations for only some fields (e.g., title translated but description missing), the system displays translated content where available and falls back to original content for untranslated fields without errors or blank spaces.

2. **Cookie Blocked Scenario**: When browser privacy settings or extensions block cookies entirely, the language detection system falls back to Accept-Language header parsing without errors, and language switching still functions using URL parameters or session storage alternatives.

3. **Malformed Accept-Language Header**: When the browser sends an invalid, corrupted, or non-standard Accept-Language header (e.g., missing region codes, invalid syntax, garbage characters), the system parses gracefully and falls back to default language without crashing or displaying errors.

4. **Unsupported Language Code**: When a user requests a language not in the supported list (via URL parameter, cookie, or header), the system detects the unsupported code, logs the attempt, and gracefully falls back to the default language or original content language without breaking the user experience.

### User Impact
Guests encounter a stable, professional experience even when technical conditions are not ideal. Users with strict privacy settings can still consume content. International users with unusual browser configurations or language preferences receive appropriate fallback content rather than errors. The system feels reliable regardless of edge case scenarios.

### Business Value
Ensures the localization system is production-ready and resilient to real-world variability in user configurations, browser behaviors, and data completeness. Prevents user-facing errors that could damage trust in the platform's multilingual capabilities. Reduces support burden from edge case failures.

### Acceptance Criteria
- [ ] Partial translations display correctly with mixed original and translated content
- [ ] Each field independently shows translated version if available, original if not
- [ ] No blank spaces, error messages, or broken layouts appear when some fields lack translations
- [ ] Translation status indicators accurately reflect partial translation state
- [ ] System functions normally when cookies are completely blocked by browser settings
- [ ] Language preference defaults to Accept-Language header when cookie cannot be set
- [ ] Language switcher still updates display using URL parameters as fallback
- [ ] No JavaScript errors occur when cookie access fails
- [ ] Malformed Accept-Language headers parse without throwing errors
- [ ] Common malformations handled (missing regions, invalid syntax, unexpected characters)
- [ ] System defaults to fallback language when header cannot be parsed
- [ ] Error logged for monitoring purposes without exposing errors to user
- [ ] Unsupported language codes (via URL parameter or cookie) detected and rejected
- [ ] System falls back to default language when unsupported code encountered
- [ ] Language switcher only displays supported language options
- [ ] Shareable URLs with invalid language parameters redirect or default gracefully
- [ ] All edge cases tested across items, articles, and links
- [ ] Edge case scenarios documented with expected behavior and actual results
- [ ] Console logs clean with no unhandled errors for any edge case
- [ ] User experience remains professional and functional for all edge cases


---

## REQ-360: Test Mobile Responsiveness for Localization Components

**Date**: 2026-01-19 19:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
Validate that all localization interface components function correctly and display properly on mobile devices, ensuring touch-friendly interactions and responsive layouts across small screen sizes.

### Current Behavior
Localization components including the language switcher, translation banners, and view original toggles have been implemented and tested on desktop viewports, but comprehensive mobile responsiveness testing has not been systematically performed to ensure optimal experience on smartphones and tablets.

### Expected Behavior
All localization components should adapt gracefully to mobile viewports:

1. **Language Switcher on Small Screens**: The language switcher component displays properly on mobile devices with appropriately sized touch targets, readable text, and a layout that fits within narrow viewports without horizontal scrolling or overlapping other navigation elements. The dropdown or modal interface for language selection works smoothly with touch gestures.

2. **Banner Visibility Without Content Obstruction**: Translation status banners, missing translation warnings, and stale translation indicators render at appropriate sizes on mobile screens without obscuring primary content. Banners can be dismissed easily via touch, and dismissed state persists during the session. Banner positioning adapts to mobile layouts without causing content reflow issues.

3. **Touch-Friendly Interactive Elements**: All translation-related interactive components including the "View Original" toggle, language selector buttons, manual retranslate actions, and translation management controls feature touch targets meeting minimum accessibility standards (at least 44x44 pixels). Buttons provide visual feedback on touch, and gestures like tap, swipe, and scroll work naturally without accidental activations or requiring precise finger placement.

### User Impact
Mobile users experience seamless language switching and translation features with the same reliability as desktop users. Touch interactions feel natural and responsive without frustration from small buttons or awkward layouts. Content remains readable and accessible regardless of translation status banners or language controls. The mobile experience feels polished and professional, encouraging international mobile users to engage with multilingual content.

### Business Value
Ensures the localization system provides excellent user experience across all devices, particularly mobile which often represents majority traffic for modern web applications. Prevents mobile users from abandoning the platform due to unusable language controls or obstructed content. Validates accessibility standards for touch interfaces, reducing legal and usability risks.

### Acceptance Criteria
- [ ] Language switcher component renders correctly on screens 320px to 768px wide
- [ ] Language switcher touch targets are minimum 44x44 pixels for accessibility
- [ ] Language selection dropdown or modal opens smoothly via touch without scrolling issues
- [ ] Selected language displays clearly in mobile navigation without truncation
- [ ] Language switcher does not overlap or obscure other navigation elements on small screens
- [ ] Translation status banners display at appropriate height on mobile viewports
- [ ] Banners do not cover primary content (titles, descriptions, images) on any mobile screen size
- [ ] Banner dismiss button is easily tappable with minimum 44x44 pixel touch target
- [ ] Dismissed banner state persists within session without reappearing on scroll
- [ ] Banner positioning adapts correctly in both portrait and landscape mobile orientations
- [ ] "View Original" toggle button meets minimum touch target size on mobile
- [ ] Toggle provides visual feedback on touch (press state, ripple effect, or similar)
- [ ] Toggle switches content instantly without lag or unintended double-taps
- [ ] Manual retranslate and edit controls in management interfaces are touch-friendly
- [ ] All interactive elements avoid accidental activation from scrolling or swiping gestures
- [ ] Touch interactions tested on both iOS Safari and Android Chrome browsers
- [ ] Responsive behavior validated across viewport sizes: 320px, 375px, 414px, 768px widths
- [ ] No horizontal scrolling introduced by localization components on any screen size
- [ ] Content remains readable and properly formatted with banners and controls present
- [ ] Mobile testing documented with device models, browsers, and visual evidence of proper behavior

