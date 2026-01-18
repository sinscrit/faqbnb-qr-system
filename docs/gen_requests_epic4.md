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

