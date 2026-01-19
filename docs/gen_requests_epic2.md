# Generated Requests - Epic 2

This file contains auto-generated feature requests for L10N Epic 2.

---

## REQ-304: Create Common Namespace Structure in Translation File

**Date**: 2026-01-18 15:42
**Type**: NEW FEATURE
**Size**: S

### Summary
The application should provide a common namespace within the English translation file to store shared and reusable translation keys that appear across multiple components.

### Current Behavior
No common namespace structure exists in the translation file. There is no designated location for translation keys that are used by multiple components throughout the application, making it difficult to organize and maintain shared strings consistently.

### Expected Behavior
When developers need to reference translation keys for shared UI elements like common buttons, labels, status messages, or navigation items, they can access these through a common namespace. The translation file includes a well-organized common section that groups related shared strings together, making it easy to locate and reuse translation keys across different features and components without duplication.

### User Impact
All users benefit indirectly through more consistent terminology and labeling across the application. When the same action or concept appears in multiple places, users see identical wording because the underlying translation key is shared. This consistency makes the interface more predictable and easier to understand.

### Business Value
Establishing a common namespace structure early in the localization implementation prevents translation key fragmentation and reduces maintenance burden. Shared keys mean fewer strings to translate, lower translation costs, and guaranteed consistency across the application. This foundation enables efficient scaling of the translation system as more features are added.

### Acceptance Criteria
- [ ] A common namespace section exists in the `/messages/en.json` file
- [ ] The namespace structure supports logical grouping of related shared strings
- [ ] The structure is extensible to accommodate new shared translation keys as they are identified
- [ ] Documentation or comments within the file clarify the purpose and intended use of the common namespace
- [ ] The namespace follows the same structural conventions as other namespaces in the translation file
- [ ] The file remains valid JSON after the common namespace addition

---

## REQ-305: Extract and Centralize Button Labels for Internationalization

**Date**: 2026-01-18 04:28
**Type**: ENHANCEMENT
**Size**: M

### Summary
All button labels throughout the application should be extracted from hardcoded text and centralized into the common namespace translation files, enabling internationalization and ensuring consistent terminology across the user interface.

### Current Behavior
Button labels such as submit, cancel, save, delete, edit, confirm, and others are hardcoded directly within component markup throughout the codebase. Each component defines its own button text, leading to potential inconsistencies in wording and making it impossible to translate the interface into other languages. There is no centralized inventory of which button labels exist or where they are used.

### Expected Behavior
When users interact with buttons anywhere in the application, they see consistent labels that can be displayed in their preferred language. All button text is retrieved from translation keys in the common namespace. Developers adding new buttons reference existing translation keys for standard actions rather than creating new hardcoded text. The translation files contain a comprehensive collection of button labels organized by action type or context.

### User Impact
Users experience a more consistent interface where the same action is always represented with identical wording, regardless of which feature or screen they are using. International users benefit from the ability to see button labels in their preferred language once translations are added. Users with cognitive accessibility needs benefit from predictable, consistent terminology throughout their interactions.

### Business Value
Centralizing button labels is a critical step toward supporting international markets and expanding the user base beyond English speakers. Consistency in button labeling reduces confusion and support requests. This work creates a reusable translation infrastructure that accelerates future localization efforts and reduces the cost of maintaining translated content.

### Acceptance Criteria
- [ ] All button labels across the application have been identified and catalogued
- [ ] Button labels are organized within the common namespace in translation files with logical grouping
- [ ] All hardcoded button text in components has been replaced with translation function calls
- [ ] Standard action buttons use shared translation keys consistently across all components
- [ ] The translation file includes all common button labels such as submit, cancel, save, delete, edit, confirm, close, and others
- [ ] Components using the same action display identical button text through shared translation keys
- [ ] All button labels remain functionally equivalent after extraction
- [ ] The changes maintain existing button behavior and accessibility attributes

---

## REQ-306: Extract Modal and Dialog Strings for Internationalization

**Date**: 2026-01-18 15:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
All text content within modals and dialogs should be extracted from hardcoded strings and replaced with translation keys, enabling the application to display localized modal content based on user language preferences.

### Current Behavior
Modal and dialog components contain hardcoded text including titles, body content, confirmation messages, warning text, and action prompts. This text is embedded directly in component code, making it impossible to translate these critical user interactions into other languages. Users see only English text in modals regardless of their language preference, and there is no systematic approach to managing modal content across the application.

### Expected Behavior
When users encounter modals or dialogs during their interactions, all text content appears in their preferred language. Modal titles, descriptions, confirmation prompts, warning messages, and instructional text are all retrieved from translation keys using the translation function. Developers creating new modals reference existing translation patterns and keys for common modal types such as confirmations, warnings, errors, and informational dialogs. The translation files contain organized sections for modal content that can be easily maintained and expanded.

### User Impact
Users receive critical information, warnings, and confirmation requests in their native language, improving comprehension and reducing the risk of unintended actions. Non-English speaking users can fully understand the purpose and consequences of modal interactions instead of being forced to interpret English text. All users benefit from consistent messaging patterns across similar modal types throughout the application.

### Business Value
Localizing modal and dialog content is essential for international market expansion, as these components often convey important warnings, confirmations, or information that users must understand before proceeding. Proper translation of modals reduces support costs by ensuring users comprehend critical interactions. This work establishes reusable translation patterns for common modal types, accelerating future development and maintaining consistency.

### Acceptance Criteria
- [ ] All modal and dialog components have been identified and their text content catalogued
- [ ] Modal titles are extracted to translation keys and replaced with translation function calls
- [ ] Modal body content and descriptions use translation keys instead of hardcoded strings
- [ ] Confirmation prompts, warning messages, and instructional text in modals are internationalized
- [ ] Common modal types share consistent translation key structures across the application
- [ ] Translation files include organized sections for modal content with clear naming conventions
- [ ] All modal functionality remains unchanged after string extraction
- [ ] Modal accessibility attributes that depend on text content are properly maintained
- [ ] Dynamic content within modals can accept translation parameters when needed

---

## REQ-307: Extract Form Element Strings for Internationalization

**Date**: 2026-01-18 16:32
**Type**: ENHANCEMENT
**Size**: L

### Summary
All form-related text including labels, placeholders, hints, validation messages, and helper text should be extracted from hardcoded strings and replaced with translation keys, enabling users to interact with forms in their preferred language.

### Current Behavior
Form components throughout the application contain hardcoded text elements directly in component markup. Labels identifying form fields, placeholder text guiding user input, hint text providing additional context, validation error messages, and helper text are all embedded as string literals in the code. This makes it impossible to display form content in languages other than English. Users see only English form instructions regardless of their language preference, and maintaining consistent wording across similar form fields requires manual coordination.

### Expected Behavior
When users interact with any form in the application, all text elements appear in their preferred language. Field labels clearly identify each input in the user's native language, placeholder text provides culturally appropriate examples, hints offer guidance in understandable terms, and validation messages explain errors clearly. Developers creating new forms reference existing translation keys for common form elements like name, email, password, and standard validation messages. The translation files contain comprehensive form-related strings organized by form context or field type, making it easy to maintain consistency and add new languages.

### User Impact
International users can complete forms confidently in their native language, understanding what information is required and how to provide it correctly. Users with lower English proficiency no longer struggle to interpret form labels or validation errors. All users benefit from consistent terminology across similar form fields throughout the application, reducing cognitive load. Clear, translated validation messages help users correct input errors on the first attempt, improving completion rates and reducing frustration.

### Business Value
Localizing form elements removes a critical barrier to international user adoption, as forms are often the primary point of user data collection and account creation. Poor form translation directly impacts conversion rates and user acquisition. Extracting form strings enables rapid expansion into new markets with minimal development effort once the infrastructure is in place. Centralized validation messages reduce support costs by ensuring error communication is clear and consistent. This work establishes reusable patterns for form localization that accelerate future feature development.

### Acceptance Criteria
- [ ] All form components across the application have been identified and their text elements catalogued
- [ ] Form field labels are extracted to translation keys and replaced with translation function calls
- [ ] Placeholder text for all input fields uses translation keys instead of hardcoded strings
- [ ] Hint text and helper text associated with form fields are internationalized
- [ ] Validation error messages for all form inputs are extracted to translation keys
- [ ] Success messages and confirmation text related to form submission are internationalized
- [ ] Common form fields share consistent translation keys across different forms where appropriate
- [ ] Translation files include organized sections for form-related strings with clear naming conventions
- [ ] Field-specific validation messages can accept dynamic parameters when needed
- [ ] All form functionality including validation behavior remains unchanged after string extraction
- [ ] Form accessibility attributes that reference text content are properly maintained
- [ ] Required field indicators and optional field markers use translation keys

---

## REQ-308: Extract Toast Notification Messages for Internationalization

**Date**: 2026-01-18 16:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
All toast notification messages displayed to users should be extracted from hardcoded strings and replaced with translation keys, enabling notifications to appear in the user's preferred language.

### Current Behavior
Toast notifications throughout the application contain hardcoded English text for success messages, error alerts, informational updates, and warning notifications. These messages are embedded directly in component code or service functions that trigger notifications. Users see only English notifications regardless of their language preference, and there is no systematic approach to managing notification message consistency across the application.

### Expected Behavior
When users receive toast notifications in response to actions or system events, the messages appear in their preferred language. Success confirmations, error alerts, informational messages, and warnings are all retrieved from translation keys using the translation function. Developers triggering notifications reference existing translation keys for common notification patterns rather than writing custom message text. The translation files contain organized sections for notification messages grouped by type or context, ensuring consistent tone and terminology across similar notifications.

### User Impact
International users receive critical feedback, confirmations, and alerts in their native language, ensuring they understand the outcome of their actions and any issues that require attention. Non-English speakers no longer miss important system messages due to language barriers. All users benefit from consistent notification messaging across similar actions throughout the application, creating a more predictable and professional user experience.

### Business Value
Localizing toast notifications improves user confidence and task completion rates, particularly for critical feedback messages that guide users through workflows. Clear, translated error messages reduce support requests and user frustration. This work establishes reusable notification message patterns that accelerate future development and ensure consistent communication with users. Supporting international users with native-language notifications is essential for market expansion and user retention in non-English speaking regions.

### Acceptance Criteria
- [ ] All toast notification trigger points across the application have been identified and catalogued
- [ ] Success notification messages are extracted to translation keys and replaced with translation function calls
- [ ] Error and warning notification messages use translation keys instead of hardcoded strings
- [ ] Informational toast messages are internationalized
- [ ] Common notification patterns share consistent translation keys across different features
- [ ] Translation files include organized sections for notification messages with clear naming by type or severity
- [ ] Notification messages can accept dynamic parameters when needed for user-specific or context-specific content
- [ ] All notification functionality including timing, positioning, and dismiss behavior remains unchanged
- [ ] Notification accessibility attributes are properly maintained with translated content
- [ ] The tone and clarity of messages are preserved across all notification types

---

## REQ-309: Extract Empty State Messages for Internationalization

**Date**: 2026-01-18 16:58
**Type**: ENHANCEMENT
**Size**: M

### Summary
All empty state messages displayed when no data or content is available should be extracted from hardcoded strings and replaced with translation keys, enabling these messages to appear in the user's preferred language.

### Current Behavior
Components throughout the application display hardcoded English text when there is no data to show, such as "No items found", "Your list is empty", "No results match your search", "No data available", or similar messages. These strings are embedded directly in component code, making it impossible to translate empty state experiences into other languages. Users see only English empty state messages regardless of their language preference, and there is no consistent pattern for how empty states are communicated across different features.

### Expected Behavior
When users encounter screens or sections with no data to display, the empty state messages appear in their preferred language. Messages explaining why content is absent, guiding users on how to populate the area, or confirming that filters returned no results are all retrieved from translation keys. Developers creating new components reference existing translation keys for common empty state scenarios rather than writing custom message text. The translation files contain organized sections for empty state messages that maintain consistent tone and provide clear, helpful guidance to users.

### User Impact
International users understand why content areas are empty and what actions they can take to add content, all communicated in their native language. Non-English speakers are not left confused by English-only empty state messages wondering whether the feature is broken or simply unpopulated. All users benefit from consistent and helpful empty state messaging that follows predictable patterns across different sections of the application, making the interface more intuitive and less intimidating when exploring new features.

### Business Value
Localizing empty state messages improves user activation and feature adoption, particularly for new users encountering empty sections for the first time. Clear, translated guidance in empty states reduces user confusion and support requests about whether features are working correctly. This work establishes reusable empty state message patterns that accelerate future development and maintain consistent user communication. Supporting international users with native-language empty state guidance is essential for onboarding success and long-term engagement in non-English speaking markets.

### Acceptance Criteria
- [ ] All empty state messages across the application have been identified and catalogued
- [ ] Empty state primary messages are extracted to translation keys and replaced with translation function calls
- [ ] Empty state secondary messages and call-to-action text are internationalized
- [ ] Common empty state scenarios share consistent translation keys across different features
- [ ] Translation files include organized sections for empty state messages with clear naming conventions
- [ ] Empty state messages can accept dynamic parameters when referencing specific filters or search terms
- [ ] All empty state functionality including layout and visual presentation remains unchanged
- [ ] Empty state messages maintain helpful and encouraging tone across all scenarios
- [ ] Components display appropriate empty state messages for different contexts such as no search results versus no created content

---

## REQ-310: Extract Loading State Messages for Internationalization

**Date**: 2026-01-18 17:15
**Type**: ENHANCEMENT
**Size**: S

### Summary
All loading state messages displayed while content or data is being fetched should be extracted from hardcoded strings and replaced with translation keys, enabling loading feedback to appear in the user's preferred language.

### Current Behavior
Components throughout the application display hardcoded English text during loading states, such as "Loading...", "Please wait...", "Fetching data...", "Processing...", or similar messages. These strings are scattered across different components with no centralized management, making it impossible to translate loading feedback into other languages. Users see only English loading messages regardless of their language preference, and there is inconsistent wording across different loading scenarios throughout the application.

### Expected Behavior
When users wait for content to load or operations to complete, the loading state messages appear in their preferred language. Generic loading indicators, specific operation messages, and progress feedback are all retrieved from translation keys in the common namespace. Developers implementing loading states reference existing translation keys for standard loading scenarios rather than creating new hardcoded text. The translation files contain a dedicated section for loading state messages that maintains consistent terminology and tone across all loading experiences.

### User Impact
International users receive loading feedback in their native language, understanding that the application is working rather than frozen or broken. Non-English speakers are not left uncertain by English-only loading messages. All users benefit from consistent loading message terminology that follows predictable patterns across different features, creating a more professional and polished user experience during wait times.

### Business Value
Localizing loading state messages improves perceived performance and user confidence, particularly during longer operations where feedback is critical. Consistent loading messages reduce user anxiety and support requests about whether the application is functioning correctly. This work establishes reusable loading message patterns that accelerate future development and maintain uniform communication during asynchronous operations. Supporting international users with native-language loading feedback demonstrates attention to detail and commitment to user experience across all markets.

### Acceptance Criteria
- [ ] All loading state messages across the application have been identified and catalogued
- [ ] Generic loading messages are extracted to translation keys in the common namespace
- [ ] Operation-specific loading messages use translation keys instead of hardcoded strings
- [ ] Common loading scenarios share consistent translation keys across different features
- [ ] Translation files include a dedicated section for loading state messages with clear naming conventions
- [ ] Loading messages maintain appropriate brevity and clarity across all contexts
- [ ] All loading state functionality including spinners and visual indicators remains unchanged
- [ ] Components using the same loading scenario display identical message text through shared translation keys
- [ ] Loading messages can accept dynamic parameters when referencing specific operations or resources being loaded

---

## REQ-311: Extract Confirmation Dialog Messages for Internationalization

**Date**: 2026-01-18 17:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
All confirmation dialog messages that prompt users to verify destructive or important actions should be extracted from hardcoded strings and centralized in translation files, enabling these critical messages to appear in the user's preferred language.

### Current Behavior
Confirmation dialogs throughout the application contain hardcoded English text asking users to confirm actions such as deletions, updates, or other significant operations. Messages including titles, question prompts, consequence warnings, and action descriptions are embedded directly in component code. Users see only English confirmation messages regardless of their language preference, and there is no centralized management of these critical user communication touchpoints. Similar confirmation scenarios may use different wording across different features.

### Expected Behavior
When users are asked to confirm important or destructive actions, all confirmation dialog text appears in their preferred language. Dialog titles, confirmation questions, warning messages about consequences, and explanatory text are all retrieved from translation keys using the translation function. Developers creating new confirmation flows reference existing translation keys for common confirmation patterns such as delete confirmations, discard changes warnings, or irreversible action alerts. The translation files contain organized sections for confirmation messages that maintain consistent tone and clearly communicate the gravity and consequences of actions across the application.

### User Impact
International users fully understand the consequences of their actions before confirming destructive operations, reducing the risk of accidental data loss or unwanted changes. Non-English speakers receive critical warnings and confirmation prompts in their native language, ensuring informed consent before proceeding. All users benefit from consistent confirmation message patterns that use familiar wording across similar action types, making it easier to recognize high-risk operations and make informed decisions.

### Business Value
Localizing confirmation dialog messages is critical for user trust and data safety in international markets, as these dialogs protect users from unintended destructive actions. Clear, translated confirmation messages reduce support costs related to accidental deletions or unwanted changes. This work establishes reusable confirmation message patterns that accelerate future development while ensuring consistent risk communication across all features. Proper translation of confirmation dialogs demonstrates commitment to user safety and comprehension across all supported languages, which is essential for enterprise adoption and compliance in regulated markets.

### Acceptance Criteria
- [ ] All confirmation dialog instances across the application have been identified and catalogued
- [ ] Confirmation dialog titles are extracted to translation keys and replaced with translation function calls
- [ ] Confirmation question prompts and body text use translation keys instead of hardcoded strings
- [ ] Warning messages about action consequences are internationalized
- [ ] Explanatory text describing what will happen after confirmation uses translation keys
- [ ] Common confirmation patterns share consistent translation keys across different features
- [ ] Translation files include organized sections for confirmation messages with clear naming by action type
- [ ] Confirmation messages for destructive actions maintain appropriate gravity and clarity in tone
- [ ] Confirmation messages can accept dynamic parameters when referencing specific items or counts being affected
- [ ] All confirmation dialog functionality including button behavior and modal behavior remains unchanged
- [ ] Confirmation dialog accessibility attributes are properly maintained with translated content
- [ ] Both confirm and cancel button labels are internationalized consistently across all confirmation dialogs

---

## REQ-312: Create Date and Time Formatting Translations

**Date**: 2026-01-18 18:15
**Type**: NEW FEATURE
**Size**: M

### Summary
The application should provide localized date and time formatting utilities that automatically display dates, times, and timestamps in culturally appropriate formats based on the user's language and locale preferences.

### Current Behavior
Dates and times throughout the application are formatted using hardcoded English patterns or default JavaScript date formatting. Timestamps appear in a single format regardless of user location or language preference, typically following US conventions such as MM/DD/YYYY for dates and 12-hour time formats. There is no systematic approach to formatting dates and times according to different cultural conventions, regional preferences, or language-specific expectations. Users in different locales see dates and times that may not align with their familiar formatting patterns.

### Expected Behavior
When users view dates, times, or timestamps anywhere in the application, these values appear formatted according to their language and locale settings. Date formats follow cultural conventions such as DD/MM/YYYY for European locales, YYYY/MM/DD for Asian locales, or MM/DD/YYYY for US English. Time displays use 12-hour or 24-hour formats based on regional preferences. Relative time expressions like "2 hours ago" or "yesterday" appear in the user's language with appropriate grammar. Developers use centralized formatting utilities that automatically handle locale-specific formatting rules rather than implementing custom date formatting in each component. The translation infrastructure includes date and time formatting functions that support all target locales with appropriate format patterns, month names, day names, and relative time expressions.

### User Impact
International users see dates and times in their familiar cultural format, eliminating confusion about whether 03/04/2026 means March 4th or April 3rd. Users in regions using 24-hour time notation are not forced to mentally convert from 12-hour formats. Relative timestamps like "3 days ago" appear in the user's native language with correct grammar and cultural conventions. All users benefit from consistent date and time formatting across the entire application, making temporal information easier to scan and comprehend at a glance.

### Business Value
Proper date and time localization is essential for international market expansion, as incorrect date formatting creates confusion and erodes trust in data accuracy. Supporting culturally appropriate formats demonstrates respect for regional conventions and improves user confidence in the application. Centralized formatting utilities reduce development time and bugs by eliminating the need for developers to implement locale-specific formatting logic in each component. This infrastructure supports compliance with regional regulations that may require specific date and time representations in user interfaces and records.

### Acceptance Criteria
- [ ] A centralized date and time formatting utility module has been created with locale-aware formatting functions
- [ ] The utility supports formatting dates according to locale-specific patterns for all target languages
- [ ] Time formatting respects 12-hour versus 24-hour preferences based on locale conventions
- [ ] Relative time expressions such as "just now", "minutes ago", "hours ago", "yesterday", and "days ago" are translated for each supported language
- [ ] Month names and abbreviated month names are available in all target languages
- [ ] Day of week names and abbreviations are translated for each supported language
- [ ] The formatting utilities accept standard date objects or ISO timestamp strings as input
- [ ] Developers can specify different format styles such as short, medium, long, or full for both dates and times
- [ ] The translation files include all necessary date and time related strings organized in the common namespace
- [ ] All existing hardcoded date formatting throughout the application has been replaced with calls to the new utilities
- [ ] Date and time displays across the application automatically reflect the user's current language preference
- [ ] The formatting utilities handle edge cases such as time zones, daylight saving time transitions, and leap years correctly
- [ ] Documentation exists explaining how to use the date and time formatting utilities in components

---

## REQ-313: Generate Translations for All Non-English Languages

**Date**: 2026-01-18 05:33
**Type**: NEW FEATURE
**Size**: XL

### Summary
All translation keys defined in the English translation file should be translated into the five supported non-English languages, enabling users to experience the complete application interface in their preferred language.

### Current Behavior
The English translation file contains all application strings organized in namespaces covering common elements, forms, modals, notifications, empty states, loading states, confirmations, and date formatting. Non-English translation files either do not exist or contain incomplete translations covering only a subset of the application interface. Users selecting non-English languages encounter a mix of translated and English text, creating an inconsistent and unprofessional experience. There is no systematic process for generating, reviewing, or maintaining translations across all supported languages.

### Expected Behavior
When users select any of the five supported non-English languages, the entire application interface appears in their chosen language with complete, accurate, and culturally appropriate translations. All strings that appear in English are also available in every target language with equivalent meaning and appropriate tone. Translation files for each language mirror the structure of the English file, containing translations for every namespace and key. The translations use natural, idiomatic phrasing that sounds native to speakers of each language rather than literal word-for-word conversions. Cultural adaptations are made where direct translation would be unclear or inappropriate, ensuring messages resonate with users in each locale.

### User Impact
International users experience the complete application in their native language without encountering jarring English text that breaks immersion and suggests incomplete localization. Users with limited English proficiency can fully navigate, understand, and use all application features confidently. All users in supported language regions perceive the application as professionally localized and culturally aware, increasing trust and satisfaction. The consistent availability of translations across all interface elements creates a seamless experience that removes language as a barrier to effective use.

### Business Value
Complete translations across all supported languages are essential for credible market entry and user acquisition in non-English regions. Partial translations signal low commitment to international markets and create negative first impressions that harm conversion rates. Professional, complete localization differentiates the product from competitors and enables pricing at premium market rates. This work unlocks revenue opportunities in five major language markets and establishes the translation workflow for adding additional languages efficiently in the future. Quality translations reduce support costs by ensuring users understand the interface, decrease error rates from misunderstood instructions, and improve retention in international markets.

### Acceptance Criteria
- [ ] Translation files have been created for all five supported non-English languages following the same structure as the English file
- [ ] Every translation key present in the English file has a corresponding translation in each of the five language files
- [ ] Translations for common namespace elements including buttons, labels, and navigation are complete across all languages
- [ ] Form element translations including labels, placeholders, hints, and validation messages are complete
- [ ] Modal and dialog translations covering titles, body content, and actions are complete
- [ ] Toast notification messages are translated for success, error, warning, and informational scenarios
- [ ] Empty state messages are translated with culturally appropriate tone and guidance
- [ ] Loading state messages are translated maintaining brevity and clarity
- [ ] Confirmation dialog messages are translated with appropriate gravity for destructive actions
- [ ] Date and time formatting strings including month names, day names, and relative expressions are complete
- [ ] Translations use natural, idiomatic phrasing appropriate for native speakers rather than literal conversions
- [ ] Cultural adaptations have been made where direct translation would be unclear or contextually inappropriate
- [ ] Translation files maintain valid JSON structure with proper character encoding for each language
- [ ] All translated strings have been reviewed for accuracy, tone consistency, and cultural appropriateness
- [ ] Variable placeholders and interpolation markers are preserved correctly in all translations
- [ ] The application displays correctly in each language without text overflow, truncation, or layout issues
- [ ] Users can switch between all six supported languages and see complete translations in each

---

## REQ-314: Create Common Translations Convenience Hook

**Date**: 2026-01-18 19:15
**Type**: NEW FEATURE
**Size**: S

### Summary
The application should provide a convenience hook that simplifies access to common namespace translations for shared components, reducing boilerplate code and ensuring consistent translation key usage across the codebase.

### Current Behavior
Developers working with common or shared components must import the translation function directly and manually construct translation key paths to access common namespace strings. Each component that needs button labels, empty states, loading messages, or other common translations requires repetitive translation function setup and namespace path construction. There is no standardized pattern for accessing common translations, leading to inconsistent key path construction and potential errors in translation key references. Developers may duplicate translation logic across multiple components or create slightly different approaches to accessing the same common translation strings.

### Expected Behavior
When developers build components that display common UI elements like buttons, modals, forms, notifications, empty states, or loading indicators, they can import a convenience hook that provides typed, structured access to all common namespace translations. The hook returns pre-configured translation functions scoped to specific common categories such as buttons, forms, modals, notifications, empty states, loading states, confirmations, and date formatting. Developers call simple, descriptive methods on the returned object rather than constructing full translation key paths manually. The hook handles namespace resolution internally, ensuring all components consistently reference the correct common translation keys without duplication or error.

### User Impact
Users indirectly benefit from more consistent terminology and messaging across the application because developers use standardized translation access patterns. Common UI elements display uniform text across all features because the convenience hook guides developers to reuse shared translation keys correctly. The reduced development friction accelerates feature delivery and reduces bugs related to incorrect or inconsistent translation key usage.

### Business Value
A common translations convenience hook reduces development time and maintenance burden by eliminating boilerplate code and providing clear, typed interfaces for translation access. Fewer translation-related bugs reach production because the hook enforces correct namespace and key path construction. New developers onboarding to the codebase can quickly understand and use translations for common components without studying the translation file structure. This infrastructure investment pays dividends across all future development by standardizing a frequent development pattern and reducing cognitive load when working with internationalized components.

### Acceptance Criteria
- [ ] A custom React hook named useCommonTranslations exists and can be imported by components
- [ ] The hook returns structured access to all common namespace translation categories
- [ ] Methods or properties exist for accessing button labels, form strings, modal content, notifications, empty states, loading states, confirmations, and date formatting utilities
- [ ] The hook leverages the underlying translation function with automatic namespace scoping to the common namespace
- [ ] TypeScript types provide autocomplete and type safety for all translation key paths accessed through the hook
- [ ] The hook follows React hooks conventions and can be used in any functional component
- [ ] Documentation explains the hook's purpose, usage patterns, and available translation categories
- [ ] Existing components that access common translations can optionally migrate to use the convenience hook
- [ ] The hook's implementation is efficient and does not cause unnecessary re-renders or performance overhead
- [ ] Error handling is included for cases where translation keys are not found or the translation system is not initialized
- [ ] The hook's interface is extensible to accommodate new common translation categories as they are added to the namespace

---

## REQ-315: Create Errors Namespace Structure in Translation File

**Date**: 2026-01-18 19:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The application should provide a dedicated errors namespace within the translation file to centralize and organize all error messages, validation feedback, and failure notifications in a structured, type-safe manner.

### Current Behavior
Error messages are scattered throughout the application without a consistent organizational structure. Components and services define error text ad-hoc, hardcoding messages directly where errors occur or creating inconsistent patterns for error communication. There is no centralized location for managing error messages, validation feedback, API failure responses, or system error notifications. Similar error scenarios may display different messages in different parts of the application, and there is no clear taxonomy for organizing error types or severity levels.

### Expected Behavior
When developers need to display error messages, validation feedback, or failure notifications, they reference translation keys from a well-organized errors namespace. The namespace provides logical grouping of error messages by category such as validation errors, API errors, authentication errors, permission errors, and system errors. Each error category contains specific, actionable error messages that clearly explain what went wrong and, when possible, how to resolve the issue. Developers can quickly locate the appropriate error translation key based on the error type and context without needing to create new error messages for common scenarios.

### User Impact
Users receive consistent, clear error messages when issues occur, regardless of which feature or workflow triggered the error. Similar problems always display the same error message, making the interface more predictable and reducing confusion. Error messages provide helpful context about what went wrong and guidance on resolution steps when available. International users benefit from professionally translated error messages that maintain appropriate tone and clarity across all supported languages once translations are added.

### Business Value
Centralizing error messages in a structured namespace reduces support costs by ensuring error communication is clear, consistent, and actionable across the entire application. Users who understand errors can often self-resolve issues without contacting support. Consistent error messaging improves perceived quality and professionalism, particularly important during error scenarios that can erode user trust. This infrastructure establishes reusable error message patterns that accelerate development, reduce duplication, and ensure new features maintain the same high standard of error communication. A well-organized errors namespace facilitates future localization efforts and enables systematic improvement of error messaging quality.

### Acceptance Criteria
- [ ] An errors namespace section exists in the `/messages/en.json` file with a clear, logical structure
- [ ] The namespace includes categories for validation errors, API errors, authentication errors, permission errors, and system errors
- [ ] Each category contains specific error messages organized by error type or scenario
- [ ] Validation errors include common field validation scenarios such as required field, invalid format, length constraints, and value constraints
- [ ] API errors include common failure scenarios such as network errors, timeout errors, server errors, and not found errors
- [ ] Authentication errors include login failures, session expiration, invalid credentials, and account status issues
- [ ] Permission errors include access denied messages for different resource types and action types
- [ ] System errors include unexpected error messages and fallback error text for unhandled scenarios
- [ ] Error messages are written to be clear, specific, and actionable rather than technical or cryptic
- [ ] The namespace structure supports dynamic parameter substitution for error messages that reference specific fields, values, or limits
- [ ] The structure is extensible to accommodate new error categories and messages as they are identified
- [ ] The file remains valid JSON after the errors namespace addition
- [ ] Documentation or comments within the file clarify the purpose and organization of error categories

---

## REQ-316: Audit Form Validation Messages Across Components

**Date**: 2026-01-18 19:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
All form validation messages across the application should be reviewed and standardized to ensure consistency, clarity, and proper user guidance when input errors occur.

### Current Behavior
Form components throughout the application display validation error messages with varying levels of detail, tone, and helpfulness. Some validation messages provide specific guidance on how to correct input errors, while others offer only generic feedback. Error message wording is inconsistent across similar validation scenarios in different forms. Some messages are technical or cryptic, using jargon that confuses non-technical users. Validation feedback may appear in different visual locations or formats depending on the component. There is no standardized pattern for communicating validation requirements before users submit forms, leading to trial-and-error input experiences.

### Expected Behavior
When users encounter validation errors on any form in the application, they receive clear, consistent, and helpful error messages that explain what went wrong and how to fix it. Similar validation scenarios across different forms display identical error messages using shared translation keys from the errors namespace. Validation messages are written in plain language accessible to all users, avoiding technical jargon or cryptic abbreviations. Error messages specify requirements clearly, such as minimum character counts, valid format examples, or required field patterns. Validation feedback appears in consistent visual locations across all forms, creating predictable error discovery patterns. Where possible, inline validation provides guidance before form submission to help users correct errors immediately.

### User Impact
Users spend less time correcting form input errors because validation messages clearly explain requirements and how to satisfy them. Consistent error messaging across forms creates familiarity and reduces cognitive load when users encounter validation issues in different features. Non-technical users understand what they need to fix without needing to interpret technical error messages. Users with accessibility needs benefit from clear, well-structured validation feedback that works properly with assistive technologies. Reduced form abandonment occurs when validation messages guide users to successful completion rather than leaving them confused about requirements.

### Business Value
Clear, consistent validation messages improve form completion rates, directly impacting user onboarding, account creation, data collection, and conversion metrics. Reduced validation-related support requests lower support costs and free resources for higher-value customer interactions. Standardized validation patterns accelerate development of new forms by providing reusable message templates and validation logic. International users benefit from validation messages that translate well, as the audit ensures messages use clear, translatable language structure. This work establishes quality standards for validation communication that improve overall application polish and professionalism.

### Acceptance Criteria
- [ ] All form components across the application have been identified and their validation messages catalogued
- [ ] Validation messages for similar scenarios use consistent wording across different forms
- [ ] All validation messages are written in clear, plain language without technical jargon
- [ ] Required field errors specify what is required rather than just stating field is required
- [ ] Format validation errors provide examples of valid formats when applicable
- [ ] Length constraint errors specify exact character or word limits
- [ ] Value constraint errors clearly communicate acceptable ranges or options
- [ ] All validation messages reference the errors namespace in translation files
- [ ] Validation error display locations are consistent across all forms
- [ ] Messages are actionable, explaining how to correct the error rather than just describing the problem
- [ ] Validation messages are concise while providing necessary detail for correction
- [ ] Error message tone is helpful and professional rather than punitive or condescending
- [ ] Accessibility attributes for validation errors are properly implemented across all forms
- [ ] Inline validation provides immediate feedback where appropriate to prevent submission errors

---

## REQ-317: Audit All API Error Handling and Messages

**Date**: 2026-01-18 20:00
**Type**: ENHANCEMENT
**Size**: L

### Summary
All API endpoint error handling patterns and error response messages should be reviewed, standardized, and improved to ensure consistent, user-friendly error communication across the entire backend while maintaining appropriate security and debuggability.

### Current Behavior
API endpoints throughout the application implement error handling with varying patterns and inconsistent error response formats. Some endpoints return detailed error information while others provide minimal feedback. Error messages may expose internal system details, database structure, or stack traces that should not be visible to end users. HTTP status codes may be used inconsistently for similar error scenarios across different endpoints. Error logging practices vary, with some endpoints logging comprehensive error details for debugging while others provide insufficient context for troubleshooting production issues. Unhandled promise rejections or edge case errors may crash requests or return generic 500 errors without helpful information. There is no standardized error response schema applied uniformly across all API routes.

### Expected Behavior
When any API request fails or encounters an error condition, the endpoint returns a consistent error response format that includes an appropriate HTTP status code, a user-friendly error message suitable for display, an error code or type identifier for programmatic handling, and sufficient context for the client to understand what went wrong without exposing internal system details. All endpoints use HTTP status codes consistently for similar error scenarios such as 400 for bad requests, 401 for authentication failures, 403 for permission issues, 404 for resources not found, and 500 for unexpected server errors. User-facing error messages are clear, actionable when possible, and free from technical jargon or internal implementation details. Server-side error logging captures comprehensive diagnostic information including request context, user information, timestamps, and full error stack traces for debugging purposes without exposing these details to the client. All promise-based operations include proper error handling to prevent unhandled rejections. Edge cases and validation failures return appropriate error responses rather than causing crashes or returning confusing generic errors.

### User Impact
Users receive clear, understandable error messages when API requests fail, helping them understand what went wrong and whether they can take action to resolve the issue. Consistent error responses across all endpoints create a predictable error experience regardless of which feature or API they are using. Users are not exposed to confusing technical details, stack traces, or internal system information that creates security concerns or erodes confidence in the application. When errors occur, users can report issues with meaningful context that helps support teams identify and resolve problems quickly.

### Business Value
Standardized API error handling improves application security by preventing information leakage through error messages while maintaining excellent debuggability through proper server-side logging. Consistent error responses reduce client-side error handling complexity and bugs, accelerating frontend development. Clear, user-friendly error messages reduce support costs by helping users understand and potentially resolve issues without contacting support. Comprehensive server-side error logging enables faster incident diagnosis and resolution, reducing downtime and improving reliability. This work establishes quality standards for API error communication that scale across all current and future endpoints, ensuring a professional and secure error handling foundation for the entire application.

### Acceptance Criteria
- [ ] All API route files have been identified and their error handling patterns reviewed
- [ ] A standardized error response schema has been defined and documented for consistent use across all endpoints
- [ ] All endpoints return error responses in the standardized format with appropriate HTTP status codes
- [ ] User-facing error messages are clear, actionable, and free from internal system details or sensitive information
- [ ] HTTP status codes are used consistently across endpoints for similar error scenarios
- [ ] Authentication errors consistently return 401 status with appropriate error messages
- [ ] Permission and authorization errors consistently return 403 status with clear access denied messages
- [ ] Resource not found errors consistently return 404 status with helpful context about what was not found
- [ ] Validation errors consistently return 400 status with specific field-level error details where applicable
- [ ] Server errors consistently return 500 status with generic user-facing messages while logging detailed information
- [ ] All promise-based operations include proper catch handlers to prevent unhandled rejections
- [ ] Database errors are caught and transformed into appropriate user-facing messages without exposing schema details
- [ ] Network errors and third-party service failures are handled gracefully with informative fallback messages
- [ ] All error scenarios include server-side logging with sufficient context for debugging in production
- [ ] Error logs include request metadata, user context, timestamps, and full error stack traces where applicable
- [ ] Error messages reference the errors namespace in translation files for consistency with frontend patterns
- [ ] Edge cases such as malformed request bodies, missing required parameters, or invalid data types return appropriate 400 errors
- [ ] Rate limiting or quota exceeded scenarios return appropriate error responses with clear guidance
- [ ] The error handling implementation maintains separation between user-facing messages and detailed debug information
---

## REQ-318: Create Centralized Error Message Utility

**Date**: 2026-01-18 17:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The application should provide a centralized error message utility that standardizes error handling, formats error messages consistently, and simplifies error communication across both frontend and backend components.

### Current Behavior
Error messages are generated and handled inconsistently throughout the application. Components and services create error messages using ad-hoc patterns, with some areas using inline strings, others constructing messages programmatically, and still others relying on raw error objects passed through multiple layers. There is no centralized mechanism for formatting errors, categorizing error types, or ensuring consistent error structure across different parts of the codebase. Developers must repeatedly implement similar error handling logic in each component or service that needs to communicate errors to users. Error message formatting varies between toast notifications, form validation feedback, modal dialogs, and API responses, creating fragmented user experiences when errors occur.

### Expected Behavior
When any part of the application needs to handle, format, or display an error, developers use a centralized error message utility that provides consistent error handling patterns. The utility accepts various error inputs such as error objects, error codes, validation failures, or API error responses and transforms them into standardized error message formats appropriate for the consumption context. The utility integrates with the translation system to retrieve localized error messages from the errors namespace based on error types or codes. Developers can specify the error severity level such as error, warning, or info, and the utility ensures appropriate formatting and presentation hints. The utility provides helper functions for common error scenarios such as validation errors, API errors, authentication errors, and permission errors, reducing boilerplate code. Error categorization is automatic when possible, mapping known error patterns to appropriate error namespace keys. The utility maintains consistent error object structure across the application, making error handling predictable in both client and server contexts.

### User Impact
Users receive consistent, well-formatted error messages throughout the application regardless of which feature triggered the error or how it is displayed. Error messages maintain uniform clarity, tone, and structure whether appearing in toast notifications, form fields, modal dialogs, or other UI contexts. International users benefit from error messages that are properly localized through the centralized translation integration. Users encounter fewer confusing or technical error messages because the utility enforces standards for user-facing error communication. When errors provide actionable guidance, the formatting ensures that guidance is prominent and easy to follow.

### Business Value
A centralized error message utility significantly reduces development time and code duplication by providing reusable error handling patterns that work consistently across the entire application. Error-related bugs decrease because error handling logic is centralized, tested once, and applied uniformly rather than reimplemented with variations in each component. Support costs are reduced through consistent, clear error messaging that helps users understand and potentially resolve issues without assistance. The utility creates a foundation for systematic improvement of error communication quality, as enhancements to the central utility automatically benefit all error scenarios. Integration with the translation system ensures error messages are localization-ready from the start, avoiding costly retrofitting when expanding to international markets. This infrastructure establishes professional error handling standards that scale with application growth and complexity.

### Acceptance Criteria
- [ ] A centralized error message utility module exists with documented public API
- [ ] The utility accepts various error input types including Error objects, error codes, validation errors, and API error responses
- [ ] The utility transforms error inputs into standardized error message objects with consistent structure
- [ ] Error message objects include properties for user-facing message text, error code or type, severity level, and optional action guidance
- [ ] The utility integrates with the translation system to retrieve localized error messages from the errors namespace
- [ ] Helper functions exist for common error scenarios such as validation errors, API errors, authentication errors, and permission errors
- [ ] The utility supports dynamic parameter substitution in error messages for field names, values, limits, or contextual information
- [ ] Error severity levels such as error, warning, and info are supported with appropriate categorization
- [ ] The utility handles edge cases such as null errors, unknown error types, and malformed error objects gracefully with sensible fallbacks
- [ ] TypeScript types provide type safety for error utility functions and standardized error object structures
- [ ] The utility can be used in both frontend React components and backend API route handlers
- [ ] Documentation explains the utility's purpose, usage patterns, available helper functions, and integration with the errors namespace
- [ ] The utility maintains separation between user-facing error messages and detailed error information for logging or debugging
- [ ] Error objects produced by the utility include sufficient context for server-side logging without exposing sensitive details to clients
- [ ] The utility is performant and does not introduce significant overhead when handling errors
- [ ] Unit tests validate error transformation logic, translation integration, and edge case handling

---

## REQ-319: Update Zod Validation Schemas to Use Translated Messages

**Date**: 2026-01-18 21:30
**Type**: ENHANCEMENT
**Size**: L

### Summary
All Zod validation schemas throughout the application should be updated to use translated error messages instead of hardcoded English strings, enabling validation feedback to appear in the user's preferred language.

### Current Behavior
Zod validation schemas across the application contain hardcoded English error messages defined inline within schema definitions. When validation fails, users see error messages like "Required", "Invalid email format", "Must be at least 8 characters", or custom validation messages written directly in English within the schema code. These error messages cannot be translated because they are static strings embedded in schema definitions rather than dynamic values retrieved from the translation system. Users with non-English language preferences receive validation errors in English regardless of their interface language setting, creating an inconsistent localization experience. Each schema defines its own validation messages independently, leading to inconsistent wording across similar validation scenarios in different forms throughout the application.

### Expected Behavior
When users encounter validation errors from any form in the application, the error messages appear in their preferred language using the translation system. Zod schemas reference translation keys from the errors namespace instead of containing hardcoded English strings. Validation message retrieval integrates with the active translation context, automatically using the current user's language preference. Similar validation rules across different schemas display consistent error messages because they reference shared translation keys from the validation errors category. Developers creating new Zod schemas follow established patterns for integrating translation functions with schema error message definitions. The validation error messages support dynamic parameter substitution for field names, limits, formats, or other contextual information specific to each validation rule.

### User Impact
International users receive all form validation feedback in their native language, creating a fully localized form experience from field labels through error messaging. Users with limited English proficiency can understand validation requirements and correct input errors without language barriers. All users benefit from consistent validation error wording across similar scenarios throughout the application because schemas reference shared translation keys. The validation experience feels professional and complete rather than partially translated, increasing user confidence and trust in the application.

### Business Value
Translating validation messages removes a critical gap in the localization experience that directly impacts form completion rates in international markets. Forms are primary conversion points for user onboarding, account creation, and data collection, making validation message localization essential for international user acquisition. Consistent validation messaging through shared translation keys reduces development time for new forms and ensures quality standards are maintained across all validation scenarios. This work completes the form localization effort started in previous tasks, delivering the full value of internationalized forms. Supporting translated validation messages demonstrates commitment to international users and enables confident expansion into non-English speaking markets.

### Acceptance Criteria
- [ ] All Zod schema definitions across the application have been identified and catalogued
- [ ] Hardcoded English error messages in Zod schemas have been replaced with translation function calls
- [ ] Schemas access translation functions through an appropriate pattern that integrates with the translation context
- [ ] Validation error messages reference translation keys from the errors validation category in the errors namespace
- [ ] Common validation rules such as required, email format, string length, and number ranges use shared translation keys consistently
- [ ] Field-specific validation messages can accept dynamic parameters for field names, limits, formats, or other contextual values
- [ ] The translation integration pattern works correctly with Zod's error message customization mechanisms
- [ ] Validation errors display in the user's current language preference when forms are submitted or fields are validated
- [ ] All existing validation behavior and rules remain unchanged after translation integration
- [ ] Form validation functionality is not degraded by the translation changes
- [ ] Edge cases such as missing translation keys or translation system initialization failures are handled gracefully with sensible fallbacks
- [ ] Documentation or code comments explain the pattern for integrating translations with Zod schemas for future reference
- [ ] The implementation does not create performance overhead during form validation
- [ ] TypeScript types ensure type safety for translation key references in schema definitions where applicable

---

## REQ-320: Update Error Boundaries with Translations

**Date**: 2026-01-18 21:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
All error boundary components should display error messages, fallback UI text, and recovery actions in the user's preferred language by integrating with the translation system.

### Current Behavior
Error boundary components that catch and handle React component errors display hardcoded English text to users when rendering errors occur. Error messages, fallback UI descriptions, recovery action prompts, and error reporting instructions are all embedded as English strings directly in error boundary component code. When users encounter an unexpected component error and the error boundary activates, they see only English text regardless of their language preference setting. There is no integration between error boundaries and the translation system, making it impossible to localize the critical error recovery experience. Different error boundaries throughout the application may display inconsistent messaging for similar error scenarios.

### Expected Behavior
When users encounter component errors caught by error boundaries anywhere in the application, all error-related text appears in their preferred language. Error boundary fallback UI displays translated headings, error descriptions, and recovery instructions that help users understand what happened and how to proceed. Action buttons within error boundaries such as retry, reload, or go back display labels in the user's language. Error reporting prompts or contact support messages appear in translated form. All error boundaries reference translation keys from the errors namespace, specifically from error boundary or system error categories. Developers creating new error boundaries or updating existing ones follow established patterns for integrating the translation system with error boundary rendering. The error boundary translation integration gracefully handles edge cases such as translation system failures that could prevent error boundaries from rendering correctly.

### User Impact
International users receive clear, understandable error messages and recovery guidance in their native language when unexpected component errors occur, reducing confusion and anxiety during error scenarios. Users with limited English proficiency can understand what went wrong and what actions they can take to recover without language barriers. All users benefit from consistent error boundary messaging across the application because error boundaries reference shared translation keys. The localized error experience feels professional and complete, maintaining user confidence even when technical issues occur. Users are more likely to successfully recover from errors when instructions and actions are presented in familiar language.

### Business Value
Localizing error boundaries completes the comprehensive internationalization of user-facing error communication, ensuring no critical user interaction remains English-only. Professional error handling in the user's language maintains trust and reduces frustration during already stressful error scenarios. Clear, translated recovery instructions reduce support requests related to component errors by helping users self-recover. This work demonstrates attention to detail in localization that extends to edge cases and error scenarios, signaling commitment to international users. Error boundary translation integration establishes patterns for handling translation in critical system components that must remain functional even when other parts of the application fail.

### Acceptance Criteria
- [ ] All error boundary components across the application have been identified and catalogued
- [ ] Error boundary fallback UI headings and titles use translation keys instead of hardcoded English strings
- [ ] Error descriptions and explanatory text in error boundaries are internationalized
- [ ] Recovery action button labels such as retry, reload, or go back reference translation keys from the common namespace
- [ ] Error reporting prompts and contact support messages use translated text where present
- [ ] All error boundaries reference translation keys from appropriate error categories in the errors namespace
- [ ] The translation integration pattern handles cases where the translation system itself may be unavailable or failed
- [ ] Fallback English text is available when translation retrieval fails to ensure error boundaries always render
- [ ] Error boundary functionality including error catching, logging, and recovery actions remains unchanged
- [ ] Translated error messages maintain appropriate clarity and tone for unexpected error scenarios
- [ ] Error boundaries display correctly in all supported languages without text overflow or layout issues
- [ ] The implementation does not introduce new failure modes that could prevent error boundaries from functioning
- [ ] Documentation or code comments explain the pattern for integrating translations with error boundaries
- [ ] Common error boundary types share consistent translation keys across different instances throughout the application

---

## REQ-321: Generate Translations for Error and Validation Messages in Non-English Languages

**Date**: 2026-01-18 21:57
**Type**: NEW FEATURE
**Size**: L

### Summary
All error messages and validation feedback strings defined in the English errors namespace should be translated into the five supported non-English languages, enabling users to receive error feedback and validation guidance in their preferred language.

### Current Behavior
The English translation file contains a comprehensive errors namespace with validation messages, API error feedback, authentication errors, permission messages, and system error text organized by category. Non-English translation files either lack the errors namespace entirely or contain incomplete error message translations covering only a subset of error scenarios. Users selecting non-English languages encounter a mix of translated interface elements and English error messages when validation fails or errors occur. This creates a jarring, unprofessional experience during critical moments when clear communication is most important. There is no systematic process for generating, reviewing, or maintaining error message translations across all supported languages.

### Expected Behavior
When users encounter validation errors, API failures, authentication issues, permission denials, or system errors in any part of the application, all error messages and feedback appear in their chosen language. Every error message key present in the English errors namespace has an equivalent translation in each of the five target languages with culturally appropriate phrasing and tone. Validation feedback uses natural, idiomatic language that clearly explains requirements and how to correct input errors. API error messages are translated to maintain clarity about what went wrong while preserving appropriate technical detail levels. Authentication and permission error messages communicate access issues professionally and clearly across all languages. System error messages maintain appropriate gravity and helpfulness when unexpected issues occur. The translations preserve dynamic parameter placeholders for field names, values, limits, and contextual information that must be substituted at runtime.

### User Impact
International users receive critical error feedback and validation guidance in their native language, enabling them to understand what went wrong and how to correct issues without language barriers. Users with limited English proficiency can successfully navigate error scenarios and complete forms confidently because all feedback appears in familiar language. All users benefit from error messages that maintain consistent tone, clarity, and helpfulness across supported languages. The fully localized error experience demonstrates professional attention to international users and maintains confidence during frustrating error situations. Users are more likely to successfully resolve errors and complete tasks when guidance is presented in their preferred language.

### Business Value
Translating error and validation messages removes the final critical gap in form and error localization, completing the internationalization of user feedback systems essential for market expansion. Error scenarios directly impact conversion rates, form completion, and user retention, making error message translation vital for international success. Professional error communication in the user's language reduces support costs by enabling users to understand and resolve issues independently. Clear, translated validation messages improve form completion rates at key conversion points such as registration, checkout, and data submission. This work completes the comprehensive localization foundation established in previous tasks, delivering full value from the internationalization investment. Quality error message translations differentiate the product in international markets and enable confident enterprise adoption in regions requiring native-language support.

### Acceptance Criteria
- [ ] Translation files for the five supported non-English languages include complete errors namespace sections mirroring the English structure
- [ ] Every error message translation key present in the English errors namespace has a corresponding translation in each target language
- [ ] Validation error messages are translated for all common scenarios including required fields, format errors, length constraints, and value constraints
- [ ] API error messages are translated for network errors, timeouts, server errors, not found errors, and other common API failure scenarios
- [ ] Authentication error messages are translated for login failures, session expiration, invalid credentials, and account status issues
- [ ] Permission error messages are translated for access denied scenarios across different resource types and actions
- [ ] System error messages are translated for unexpected errors, error boundary messages, and fallback error text
- [ ] Translations use natural, idiomatic phrasing appropriate for native speakers rather than literal word-for-word conversions
- [ ] Error message tone remains professional, helpful, and appropriately serious across all languages
- [ ] Dynamic parameter placeholders for field names, values, limits, and contextual information are preserved correctly in all translations
- [ ] Cultural adaptations are made where direct translation would be unclear, overly technical, or contextually inappropriate
- [ ] Validation error translations provide clear guidance on requirements and how to correct input in culturally appropriate terms
- [ ] Translation files maintain valid JSON structure with proper character encoding for each language
- [ ] All error message translations have been reviewed for accuracy, clarity, tone consistency, and cultural appropriateness
- [ ] The application displays error messages correctly in each language without text overflow, truncation, or layout issues
- [ ] Users can switch between supported languages and receive all error feedback in the selected language
- [ ] Error messages with dynamic content display parameter substitutions correctly in each language's grammatical structure

---

## REQ-330: Generate Translations for Authentication and Registration UI in 5 Non-English Languages

**Date**: 2026-01-18 11:42
**Type**: NEW FEATURE
**Size**: L

### Summary
All authentication and registration interface strings defined in the English auth namespace should be translated into the five supported non-English languages (French, Spanish, German, Dutch, and Italian), enabling users to complete login and registration flows in their preferred language.

### Current Behavior
The English translation file contains an auth namespace with basic authentication-related strings covering sign-in, sign-up, email, password, and OAuth interactions. The non-English translation files (French, Spanish, German, Dutch, and Italian) contain only minimal auth namespace translations matching the basic structure present in the English file. Recent work has created comprehensive auth namespace sections for login, signup, OAuth, registration success, and registration completion flows with detailed form labels, validation messages, button text, instructional content, error messages, and workflow-specific guidance. These expanded authentication and registration strings exist only in English. Users selecting non-English languages encounter English text throughout login forms, registration workflows, password reset interfaces, OAuth completion flows, and success confirmation screens, creating an incomplete and unprofessional authentication experience.

### Expected Behavior
When users navigate through any authentication or registration flow in the application, all interface text appears in their chosen language. Every authentication-related translation key present in the English auth namespace has an equivalent translation in French, Spanish, German, Dutch, and Italian with culturally appropriate phrasing and natural language structure. Login form elements including field labels, placeholder hints, button text, OAuth options, validation feedback, authentication errors, loading states, and help text are fully translated. Registration form components including account creation fields, password requirement descriptions, terms acceptance text, validation messages, step indicators, and submission feedback appear in the user's language. Password reset flows display all prompts, instructions, confirmation messages, and error feedback in translated form. OAuth completion interfaces communicate authentication status, access code requirements, and next steps in the user's native language. Registration success and completion screens present confirmation messages, account setup details, redirect notices, and navigation options with culturally appropriate translations. The translations use natural, idiomatic phrasing that sounds native to speakers of each language rather than literal word-for-word conversions. Dynamic parameter placeholders for email addresses, usernames, time values, and other contextual information are preserved correctly in all translations with appropriate grammatical integration.

### User Impact
International users experience complete authentication and registration flows in their native language without encountering English text at critical conversion and onboarding touchpoints. Users with limited English proficiency can confidently create accounts, log in, reset passwords, and complete OAuth flows because all instructions, labels, errors, and feedback appear in familiar language. All users benefit from professionally translated authentication experiences that demonstrate respect for regional language preferences and cultural conventions. Clear, translated field labels and validation messages help international users complete forms successfully on the first attempt, reducing frustration and abandonment. Native-language error messages enable users to understand and resolve authentication issues without language barriers. The fully localized authentication journey creates positive first impressions that build trust and confidence from the moment users encounter the application.

### Business Value
Translating authentication and registration interfaces removes the most critical barrier to international user acquisition, as these flows represent the primary conversion points where language friction directly impacts signup and login completion rates. Professional authentication localization is essential for credible market entry in non-English regions, where English-only login and registration experiences signal low commitment to international users and harm conversion metrics. This work unlocks user acquisition and revenue opportunities in five major European language markets including French, Spanish, German, Dutch, and Italian-speaking regions. Complete authentication translation is frequently a hard requirement for enterprise customers in international markets who mandate native-language interfaces for their users. Quality translations reduce support costs by enabling international users to self-service through authentication and registration without contacting support for clarification. This investment completes the foundational authentication localization work and establishes the translation workflow patterns for adding additional languages efficiently in the future. Translated authentication experiences differentiate the product in competitive international markets and enable premium positioning.

### Acceptance Criteria
- [ ] Translation files for French, Spanish, German, Dutch, and Italian include complete auth namespace sections mirroring the expanded English structure
- [ ] Every authentication and registration translation key present in the English auth namespace has a corresponding translation in each of the five target languages
- [ ] Login-related strings including form headers, field labels, placeholders, button text, OAuth options, remember me options, loading states, and help text are fully translated
- [ ] Registration-related strings including form headers, field labels, placeholders, password requirements, terms text, button labels, validation messages, and step indicators are fully translated
- [ ] Password reset flow strings including request prompts, confirmation messages, new password forms, and success notifications are fully translated
- [ ] OAuth completion interface strings including status messages, access code prompts, instructions, and error feedback are fully translated
- [ ] Registration success and completion page strings including headings, confirmation messages, setup checklists, redirect notices, and button labels are fully translated
- [ ] Authentication error messages including invalid credentials, access denied, account status issues, and session problems are fully translated
- [ ] Validation error messages for authentication forms including required field errors, format validation, length constraints, and password requirements are fully translated
- [ ] Translations use natural, idiomatic phrasing appropriate for native speakers rather than literal word-for-word conversions
- [ ] Authentication terminology follows cultural conventions and expectations for each target language
- [ ] Password requirement descriptions maintain clarity and actionability across all languages
- [ ] Dynamic parameter placeholders for email addresses, usernames, time values, redirect timers, and other contextual information are preserved correctly
- [ ] Translation files maintain valid JSON structure with proper character encoding for each language including special characters
- [ ] All authentication and registration translations have been reviewed for accuracy, clarity, tone consistency, and cultural appropriateness
- [ ] Translations maintain professional, trustworthy tone appropriate for security-related authentication contexts
- [ ] The application displays authentication and registration interfaces correctly in each language without text overflow, truncation, or layout issues
- [ ] Users can switch between all six supported languages and experience complete authentication flows in the selected language
- [ ] OAuth button labels and authentication provider names are appropriately localized or preserved based on best practices for each language
- [ ] Form validation messages display correctly with proper grammatical structure when dynamic parameters are substituted

---

## REQ-322: Create Auth Namespace Structure in Translation File

**Date**: 2026-01-18 22:15
**Type**: NEW FEATURE
**Size**: M

### Summary
The application should provide a dedicated auth namespace within the translation file to centralize and organize all authentication and registration-related text strings in a structured, accessible manner.

### Current Behavior
Authentication and registration flows contain text elements scattered throughout components without a centralized organizational structure. Login forms, signup flows, password reset interfaces, account verification screens, and authentication error messages lack a dedicated namespace in the translation system. There is no consistent location for managing authentication-related strings such as form labels, button text, instruction prompts, success messages, or authentication-specific errors. Developers building authentication features must create translation keys ad-hoc or reference generic common namespace keys that may not capture authentication-specific context. Similar authentication scenarios across different flows may use inconsistent wording or duplicate translation keys.

### Expected Behavior
When developers build or maintain authentication and registration features, they reference translation keys from a well-organized auth namespace dedicated to authentication flows. The namespace provides logical grouping of authentication-related strings by feature area such as login, signup, password reset, account verification, session management, and multi-factor authentication. Each category contains specific strings including form field labels, placeholder text, button labels, instructional messages, success confirmations, and authentication-specific error messages. Developers can quickly locate the appropriate translation key for any authentication UI element without needing to search through common namespaces or create duplicate keys. The structure supports all authentication scenarios from initial registration through account recovery, ensuring comprehensive coverage of the authentication journey.

### User Impact
Users experience consistent terminology and messaging throughout all authentication and registration interactions because developers reference shared translation keys from the dedicated auth namespace. Authentication flows use predictable, familiar language that makes account creation, login, and recovery processes easier to understand and complete. International users benefit from authentication experiences that will be properly translated once translations are added, as all authentication text is organized in a dedicated namespace ready for localization. Clear, consistent authentication messaging reduces confusion during critical security-related interactions such as password resets or account verification.

### Business Value
Establishing an auth namespace structure early in the localization implementation creates a solid foundation for internationalizing authentication flows, which are critical conversion and retention touchpoints. Centralized authentication strings ensure consistent messaging across login, signup, and recovery experiences, improving completion rates and reducing user frustration. This organization accelerates development of new authentication features by providing clear patterns for where authentication-related strings belong. Professional, consistent authentication messaging builds user trust during security-sensitive interactions. The namespace structure prepares authentication flows for international market expansion by organizing all text elements in a translation-ready format.

### Acceptance Criteria
- [ ] An auth namespace section exists in the `/messages/en.json` file with clear logical structure
- [ ] The namespace includes categories for login, signup, password reset, account verification, session management, and authentication errors
- [ ] Login category contains strings for form labels, placeholders, button text, remember me options, and forgot password links
- [ ] Signup category contains strings for registration form fields, password requirements, terms acceptance, and account creation confirmation
- [ ] Password reset category contains strings for reset request flows, email sent confirmations, new password forms, and reset success messages
- [ ] Account verification category contains strings for verification prompts, resend verification options, and verification success messages
- [ ] Session management category contains strings for session expiration notifications, logout confirmations, and concurrent session warnings
- [ ] Authentication errors subcategory contains specific error messages for invalid credentials, account locked, email not verified, and other auth-specific failures
- [ ] The structure supports dynamic parameter substitution for usernames, email addresses, time values, or other contextual authentication information
- [ ] The namespace structure is extensible to accommodate additional authentication features such as social login, multi-factor authentication, or single sign-on
- [ ] Documentation or comments within the file clarify the purpose and organization of the auth namespace categories
- [ ] The structure follows the same organizational conventions as other namespaces in the translation file
- [ ] The file remains valid JSON after the auth namespace addition

---

## REQ-323: Internationalize LoginPageContent Component

**Date**: 2026-01-18 22:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The LoginPageContent component should be updated to use the next-intl translation system, replacing all hardcoded English strings with translation function calls that reference keys from the auth namespace.

### Current Behavior
The `/src/app/login/LoginPageContent.tsx` component contains approximately 40 hardcoded English strings including page titles, subtitles, button labels, loading messages, security notices, version footer text, and various user-facing messages. These strings are embedded directly in the JSX markup, making it impossible to display the login page in any language other than English. Users with non-English language preferences see only English text throughout the entire login experience.

### Expected Behavior
When users access the login page, all visible text appears in their preferred language as determined by the application's locale settings. The component imports the useTranslations hook from next-intl and retrieves all user-facing strings from the auth.login namespace in the translation files. Text elements including the page title "Sign in to your account", the subtitle "Access the FAQBNB administration panel", the "FAQBNB" brand header text, the "Admin Access" label, the "Back to Home" link text, the "Clear Session" button label, the "Secure Access" heading, the security notice description, loading state messages like "Completing authentication..." and "Loading authentication...", success messages like "Login successful! Redirecting...", and OAuth flow messages like "Completing Google sign-in..." are all retrieved from translation keys using the t() function. The component maintains all existing functionality including authentication state handling, redirect logic, URL parameter processing, and session management while displaying all text in the user's selected language.

### User Impact
International users experience the login page fully in their native language, creating a welcoming first impression and reducing confusion during the critical authentication step. Users with limited English proficiency can confidently understand the login process, security information, and any messages that appear during authentication. All users benefit from consistent terminology between the login page and other translated areas of the application. The professional, localized login experience builds trust before users even enter the application.

### Business Value
The login page is the entry point for all authenticated users, making its localization essential for international market expansion. A translated login page demonstrates commitment to international users from their very first interaction with the application. This work enables user acquisition in non-English speaking markets where English-only login experiences create immediate friction. Professional localization of authentication flows is often a requirement for enterprise customers in international markets. Completing the login page translation is a prerequisite for the full authentication flow localization in Sub-Epic 2A.

### Acceptance Criteria
- [ ] The component imports useTranslations from next-intl
- [ ] A translations instance is created with the 'auth.login' namespace
- [ ] The page title "Sign in to your account" uses translation key auth.login.title
- [ ] The subtitle "Access the FAQBNB administration panel" uses translation key auth.login.subtitle
- [ ] The header text "FAQBNB" uses translation key auth.login.brand or common.brand
- [ ] The "Admin Access" label uses translation key auth.login.adminAccess
- [ ] The "Back to Home" link text uses translation key auth.login.backToHome
- [ ] The "Clear Session" button label uses translation key auth.login.clearSession
- [ ] The "Secure Access" heading uses translation key auth.login.secureAccess
- [ ] The security notice description text uses translation key auth.login.secureAccessDescription
- [ ] The loading message "Completing authentication..." uses translation key auth.login.loading.authenticating
- [ ] The loading message "Loading authentication..." uses translation key auth.login.loading.loading
- [ ] The success message "Login successful! Redirecting..." uses translation key auth.login.messages.success
- [ ] The OAuth message "Completing Google sign-in..." uses translation key auth.login.messages.completingGoogle
- [ ] The debug message placeholder text uses translation keys or remains as debug-only content
- [ ] The copyright footer text uses translation key common.footer.copyright or auth.login.copyright
- [ ] All corresponding translation keys exist in /messages/en.json under the auth.login namespace
- [ ] All hardcoded English strings visible to users have been replaced with t() function calls
- [ ] The component renders correctly with translations in place
- [ ] TypeScript compilation succeeds with no type errors related to translation keys
- [ ] The build process completes successfully after the changes
- [ ] Existing functionality including authentication flow, redirects, and message handling remains unchanged
- [ ] The MessageAlert component properly displays translated message content

---

## REQ-324: Internationalize LoginForm Component

**Date**: 2026-01-18 23:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
The LoginForm component should be updated to use the next-intl translation system, replacing all hardcoded English strings with translation function calls that reference keys from the auth namespace.

### Current Behavior
The `/src/components/LoginForm.tsx` component contains approximately 30 hardcoded English strings including form labels, placeholder text, button labels, validation error messages, authentication error messages, and helper text. These strings are embedded directly in the JSX markup and validation logic, making it impossible to display the login form in any language other than English. Users with non-English language preferences see only English text throughout the login form experience regardless of their locale settings.

### Expected Behavior
When users interact with the login form, all visible text appears in their preferred language as determined by the application's locale settings. The component imports the useTranslations hook from next-intl and retrieves all user-facing strings from the auth.login namespace in the translation files. Text elements including the form section header "Sign in with your account", the "Or continue with email" divider text, the "Email Address" label, the placeholder "admin@faqbnb.com", the "Password" label, the placeholder "Enter your password", the "Remember me for 30 days" checkbox label, the "Sign In with Email" button text, the "Signing In..." loading text, the "Authentication Failed" error heading, validation error messages such as "Email is required", "Please enter a valid email address", "Password is required", "Password must be at least 6 characters", authentication error messages such as "Invalid email or password. Please check your credentials and try again.", "Access denied. Admin privileges are required.", "Login failed: No user returned", and the helper text "Access restricted to authorized administrators only" are all retrieved from translation keys using the t() function. The component maintains all existing functionality including form validation, authentication state handling, password visibility toggle, OAuth integration, and error display while presenting all text in the user's selected language.

### User Impact
International users experience the login form fully in their native language, enabling confident interaction with form fields and understanding of validation requirements without language barriers. Users with limited English proficiency can correctly interpret field labels, placeholder hints, and error messages to successfully authenticate. All users benefit from consistent terminology between the login form and other translated areas of the application. The professional, localized login form experience builds trust during the critical authentication process.

### Business Value
The login form is a primary user interaction point for authentication, making its localization essential for international user acquisition and retention. A translated login form reduces authentication friction for non-English speaking users, improving conversion rates for international markets. This work completes the authentication form localization when combined with LoginPageContent (REQ-323), providing a fully translated login experience. Professional localization of authentication components signals commitment to international users and supports enterprise requirements for native-language interfaces.

### Acceptance Criteria
- [ ] The component imports useTranslations from next-intl
- [ ] A translations instance is created with the 'auth.login' namespace
- [ ] The form section header "Sign in with your account" uses translation key auth.login.form.header
- [ ] The divider text "Or continue with email" uses translation key auth.login.form.divider
- [ ] The "Email Address" label uses translation key auth.login.form.emailLabel
- [ ] The email placeholder "admin@faqbnb.com" uses translation key auth.login.form.emailPlaceholder
- [ ] The "Password" label uses translation key auth.login.form.passwordLabel
- [ ] The password placeholder "Enter your password" uses translation key auth.login.form.passwordPlaceholder
- [ ] The "Remember me for 30 days" checkbox label uses translation key auth.login.form.rememberMe
- [ ] The "Sign In with Email" button text uses translation key auth.login.form.submitButton
- [ ] The "Signing In..." loading text uses translation key auth.login.form.submitting
- [ ] The "Authentication Failed" error heading uses translation key auth.login.errors.authenticationFailed
- [ ] The validation error "Email is required" uses translation key auth.login.validation.emailRequired
- [ ] The validation error "Please enter a valid email address" uses translation key auth.login.validation.emailInvalid
- [ ] The validation error "Password is required" uses translation key auth.login.validation.passwordRequired
- [ ] The validation error "Password must be at least 6 characters" uses translation key auth.login.validation.passwordTooShort
- [ ] The auth error "Invalid email or password. Please check your credentials and try again." uses translation key auth.login.errors.invalidCredentials
- [ ] The auth error "Access denied. Admin privileges are required." uses translation key auth.login.errors.accessDenied
- [ ] The auth error "Login failed: No user returned" uses translation key auth.login.errors.noUserReturned
- [ ] The helper text "Access restricted to authorized administrators only" uses translation key auth.login.form.restrictedAccess
- [ ] All corresponding translation keys exist in /messages/en.json under the auth.login namespace
- [ ] All hardcoded English strings visible to users have been replaced with t() function calls
- [ ] The component renders correctly with translations in place
- [ ] TypeScript compilation succeeds with no type errors related to translation keys
- [ ] The build process completes successfully after the changes
- [ ] Existing functionality including form validation, password visibility toggle, OAuth handling, and authentication flow remains unchanged
- [ ] Error messages display correctly in the error alert component with translated content

---

## REQ-325: Internationalize RegistrationForm Component

**Date**: 2026-01-18 23:45
**Type**: ENHANCEMENT
**Size**: L

### Summary
The RegistrationForm component should be updated to use the next-intl translation system, replacing all hardcoded English strings with translation function calls that reference keys from the auth namespace.

### Current Behavior
The registration form component contains hardcoded English strings throughout including form labels, placeholder text, button labels, validation error messages, helper text, password requirement descriptions, terms and conditions text, and success messages. These strings are embedded directly in JSX markup, validation schemas, and conditional rendering logic, making it impossible to display the registration experience in any language other than English. Users with non-English language preferences see only English text throughout the entire registration process regardless of their locale settings. The component likely contains more text elements than the login form due to the additional complexity of account creation flows including field explanations, password strength requirements, consent checkboxes, and multi-step registration guidance.

### Expected Behavior
When users interact with the registration form, all visible text appears in their preferred language as determined by the application's locale settings. The component imports the useTranslations hook from next-intl and retrieves all user-facing strings from the auth.signup namespace in the translation files. Text elements including form section headers, field labels for name, email, password, and password confirmation, placeholder hints providing input examples, password requirement descriptions explaining length, character types, and complexity rules, validation error messages for all field types including format errors and constraint violations, helper text explaining field purposes or requirements, button labels for form submission and navigation, terms and conditions text and consent checkbox labels, success messages confirming account creation, loading states during submission, and any multi-step navigation or progress indicators are all retrieved from translation keys using the t() function. The component maintains all existing functionality including comprehensive form validation, password strength checking, field-level error display, submission handling, success state management, and navigation flows while presenting all text in the user's selected language.

### User Impact
International users experience the complete registration flow in their native language, enabling confident account creation without language barriers at this critical conversion point. Users with limited English profibility can understand all field requirements, password rules, and terms descriptions necessary to successfully create an account. All users benefit from consistent terminology between the registration form and other translated authentication components. Clear, translated password requirement descriptions help users create compliant passwords on the first attempt, reducing frustration during account setup. The professional, fully localized registration experience builds trust and increases completion rates for new user onboarding.

### Business Value
The registration form is the primary conversion point for new user acquisition, making its localization absolutely critical for international market expansion and growth. A translated registration form directly impacts signup completion rates and user acquisition in non-English speaking markets. This work removes the largest barrier to international user onboarding by ensuring every element of the account creation process is accessible in the user's language. Professional localization of the registration experience signals commitment to international users at their first meaningful interaction with the application. Completing registration form translation when combined with login form localization provides a fully internationalized authentication system ready for global markets. This investment enables confident expansion into new regions with the assurance that the complete user acquisition funnel supports native language experiences.

### Acceptance Criteria
- [ ] The component imports useTranslations from next-intl
- [ ] A translations instance is created with the 'auth.signup' namespace
- [ ] All form section headers and titles use translation keys from auth.signup
- [ ] All form field labels including name, email, password, and confirmation fields reference translation keys
- [ ] All placeholder text providing input examples uses translation keys
- [ ] Password requirement descriptions explaining rules and constraints are translated
- [ ] All validation error messages for required fields, format validation, length constraints, and value matching reference translation keys
- [ ] Helper text explaining field purposes or providing additional context uses translation keys
- [ ] Submit button labels and loading state text are internationalized
- [ ] Terms and conditions text and consent checkbox labels reference translation keys
- [ ] Success messages confirming account creation use translation keys
- [ ] Any multi-step navigation labels, progress indicators, or step titles are translated
- [ ] Error display components properly show translated validation messages
- [ ] All corresponding translation keys exist in /messages/en.json under the auth.signup namespace
- [ ] All hardcoded English strings visible to users have been replaced with t() function calls
- [ ] The component renders correctly with translations in place
- [ ] TypeScript compilation succeeds with no type errors related to translation keys
- [ ] The build process completes successfully after the changes
- [ ] Existing functionality including validation logic, password strength checking, form submission, success handling, and navigation flow remains unchanged
- [ ] Password requirement indicators display correctly with translated text
- [ ] Terms acceptance and consent flows work properly with translated content
- [ ] Multi-step registration flows, if present, maintain proper state management with translated UI elements

---

## REQ-326: Internationalize GoogleOAuthButton Component

**Date**: 2026-01-18 15:23
**Type**: ENHANCEMENT
**Size**: S

### Summary
The GoogleOAuthButton component should be updated to use the next-intl translation system, replacing all hardcoded English strings with translation function calls that reference keys from the auth namespace.

### Current Behavior
The GoogleOAuthButton component contains hardcoded English strings including button text, loading state messages, error messages, and accessibility labels. The component displays "Continue with Google" as the default button text, "Connecting to Google..." during the loading state, "Continue with Google" as the aria-label, and rate limit error messages like "Too many authentication attempts. Please try again in X minutes." These strings are embedded directly in the JSX and error handling logic, making it impossible to display the OAuth button interface in any language other than English. Users with non-English language preferences see only English text when interacting with Google authentication regardless of their locale settings.

### Expected Behavior
When users view or interact with the Google OAuth button, all visible text and accessibility labels appear in their preferred language as determined by the application's locale settings. The component imports the useTranslations hook from next-intl and retrieves all user-facing strings from the auth.oauth or auth.login namespace in the translation files. Text elements including the button label "Continue with Google", the loading state message "Connecting to Google...", the aria-label for accessibility "Continue with Google", and the rate limit error message template that includes dynamic minute values are all retrieved from translation keys using the t() function. The component maintains all existing functionality including OAuth flow initiation, rate limiting, loading state management, error callbacks, and disabled state handling while presenting all text in the user's selected language.

### User Impact
International users see Google OAuth button text and feedback messages in their native language, creating a consistent authentication experience across all login methods. Users with limited English proficiency can understand that the button provides Google authentication and comprehend loading states or rate limit messages. All users benefit from consistent terminology between the OAuth button and other translated authentication components. The accessibility label appears in the user's language for assistive technology users, improving the accessible authentication experience.

### Business Value
Localizing the Google OAuth button completes the authentication interface translation by ensuring all login methods are internationalized. OAuth authentication often has higher conversion rates than traditional email login, making its localization valuable for international user acquisition. This work ensures users see consistent language throughout all authentication paths whether choosing email or OAuth login. Professional localization of OAuth components signals attention to detail and commitment to complete internationalization. The small scope of this component makes it a quick win that contributes to the comprehensive authentication localization effort.

### Acceptance Criteria
- [ ] The component imports useTranslations from next-intl
- [ ] A translations instance is created with the 'auth.oauth' or 'auth.login' namespace as appropriate
- [ ] The button text "Continue with Google" uses translation key auth.oauth.continueWithGoogle or auth.login.oauth.google
- [ ] The loading state text "Connecting to Google..." uses translation key auth.oauth.connecting or auth.login.oauth.connecting
- [ ] The aria-label "Continue with Google" uses the same translation key as the button text or a dedicated accessibility key
- [ ] The rate limit error message uses a translation key that supports dynamic parameter substitution for the minute value
- [ ] All corresponding translation keys exist in /messages/en.json under the appropriate auth namespace
- [ ] All hardcoded English strings visible to users or assistive technologies have been replaced with t() function calls
- [ ] The component renders correctly with translations in place
- [ ] TypeScript compilation succeeds with no type errors related to translation keys
- [ ] The build process completes successfully after the changes
- [ ] Existing functionality including OAuth flow, rate limiting, error handling, and callback integration remains unchanged
- [ ] The rate limit error message correctly interpolates the minute value in translated text
- [ ] Accessibility attributes properly reflect translated content for screen readers

---

## REQ-327: Internationalize Registration Page Component

**Date**: 2026-01-18 20:15
**Type**: ENHANCEMENT
**Size**: S

### Summary
The registration page root component should be updated to use the next-intl translation system, replacing all hardcoded English strings in the loading fallback state with translation function calls.

### Current Behavior
The registration page component located at `/src/app/register/page.tsx` contains a fallback loading state that displays hardcoded English text "Loading registration page..." while the main registration content loads. This loading message is embedded directly in JSX markup, making it impossible to display the loading state in any language other than English. Users with non-English language preferences see only English text during the brief loading period when first accessing the registration page.

### Expected Behavior
When users first navigate to the registration page and encounter the loading fallback state, the loading message appears in their preferred language as determined by the application's locale settings. The component imports the useTranslations hook from next-intl and retrieves the loading message from the auth.signup namespace in the translation files. The loading text "Loading registration page..." is retrieved from a translation key such as auth.signup.loading.page using the t() function. The component maintains all existing functionality including the Suspense boundary behavior, loading spinner display, and seamless transition to the main registration content while presenting the loading state text in the user's selected language.

### User Impact
International users see the registration page loading message in their native language, creating a consistent localized experience from the moment they navigate to the registration page. Users with limited English proficiency understand that the registration page is loading rather than seeing confusing English text during the loading state. All users benefit from consistent language presentation across all registration page states including loading, loaded, and error conditions. The professional, fully localized loading experience maintains the translated authentication flow quality established in other components.

### Business Value
Localizing the registration page loading state completes the comprehensive registration flow internationalization by ensuring even transient loading messages appear in the user's language. This attention to detail in localizing all user-facing text including brief loading states demonstrates commitment to complete internationalization and professional user experience. While the loading state is brief, it is the first thing users see when accessing registration, making its localization valuable for establishing the right first impression in international markets. This small but important work ensures no English text appears during the registration journey for non-English speaking users.

### Acceptance Criteria
- [ ] The component imports useTranslations from next-intl
- [ ] A translations instance is created with the 'auth.signup' or 'common' namespace as appropriate
- [ ] The loading message "Loading registration page..." uses translation key auth.signup.loading.page or common.loading.page
- [ ] The corresponding translation key exists in /messages/en.json under the appropriate namespace
- [ ] The hardcoded English loading message has been replaced with a t() function call
- [ ] The component renders correctly with the translated loading message
- [ ] TypeScript compilation succeeds with no type errors related to translation keys
- [ ] The build process completes successfully after the changes
- [ ] Existing functionality including the Suspense boundary, loading spinner, and content transition remains unchanged
- [ ] The loading fallback displays properly with translated text across all supported languages
- [ ] The loading state appears correctly during initial page navigation and hard refreshes

---

## REQ-328: Internationalize Registration Success Page Component

**Date**: 2026-01-18 18:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The registration success page component should be updated to use the next-intl translation system, replacing all hardcoded English strings with translation function calls that reference keys from the auth namespace.

### Current Behavior
The registration success page component located at `/src/app/register/success/page.tsx` contains approximately 25 hardcoded English strings including page headings, status messages, loading indicators, error messages, success confirmations, informational text explaining what was created, button labels, and auto-redirect notices. These strings are embedded directly in the JSX markup and conditional rendering logic, making it impossible to display the success page in any language other than English. Users with non-English language preferences see only English text throughout the registration success experience regardless of their locale settings.

### Expected Behavior
When users complete registration and arrive at the success page, all visible text appears in their preferred language as determined by the application's locale settings. The component imports the useTranslations hook from next-intl and retrieves all user-facing strings from the auth.success namespace in the translation files. Text elements including the brand header "FAQBNB", the subtitle "Registration Complete", the main heading "Registration Successful!", the auto-login status message "Logging you in automatically...", error messages such as "Automatic login failed. Please use the manual login button.", OAuth success messages like "Your account has been created successfully with Google OAuth. You will be redirected to the dashboard shortly.", non-OAuth success messages like "Your account has been created successfully. You can now log in to access all FAQBNB features.", the setup complete heading "Account Setup Complete:", checklist items including "User account created", "Default account established", "Admin privileges configured", and "Access code validated", button labels "Go to Dashboard", "Continue to Login", and "Back to Home", and auto-redirect notices such as "You will be automatically redirected to the dashboard in 2 seconds." and "You will be automatically redirected to the login page in 5 seconds." are all retrieved from translation keys using the t() function. The component maintains all existing functionality including authentication state detection, auto-redirect logic for OAuth and non-OAuth flows, error handling, conditional button display, and timer management while presenting all text in the user's selected language.

### User Impact
International users experience the registration success page fully in their native language, providing clear confirmation that their account was created successfully and what steps happen next. Users with limited English proficiency can understand the account setup details, what was configured, and whether they will be redirected automatically or need to take manual action. All users benefit from consistent terminology between the success page and other translated authentication components. Clear, translated redirect notices and button labels help users understand their options and next steps. The professional, fully localized success experience completes the registration journey with confidence and clarity.

### Business Value
The registration success page is the final touchpoint in the new user onboarding flow, making its localization essential for completing the internationalized registration experience. A translated success page reinforces that the application fully supports the user's language throughout the entire registration journey. This work ensures international users understand what was created during registration and feel confident proceeding to login or dashboard access. Professional localization of the success page demonstrates commitment to complete user experiences in international markets. Completing the registration success page translation when combined with registration form and page localization provides a fully internationalized user acquisition funnel ready for global markets.

### Acceptance Criteria
- [ ] The component imports useTranslations from next-intl
- [ ] A translations instance is created with the 'auth.success' namespace
- [ ] The brand name "FAQBNB" uses translation key auth.success.brand or common.brand
- [ ] The subtitle "Registration Complete" uses translation key auth.success.subtitle
- [ ] The main heading "Registration Successful!" uses translation key auth.success.heading
- [ ] The auto-login loading message "Logging you in automatically..." uses translation key auth.success.autoLogin.loading
- [ ] The auto-login error message uses translation key auth.success.autoLogin.error
- [ ] The OAuth success message uses translation key auth.success.messages.oauthSuccess
- [ ] The non-OAuth success message uses translation key auth.success.messages.emailSuccess
- [ ] The setup complete heading "Account Setup Complete:" uses translation key auth.success.setup.heading
- [ ] The checklist item "User account created" uses translation key auth.success.setup.userCreated
- [ ] The checklist item "Default account established" uses translation key auth.success.setup.accountEstablished
- [ ] The checklist item "Admin privileges configured" uses translation key auth.success.setup.adminConfigured
- [ ] The checklist item "Access code validated" uses translation key auth.success.setup.accessValidated
- [ ] The button label "Go to Dashboard" uses translation key auth.success.buttons.dashboard or common.buttons.dashboard
- [ ] The button label "Continue to Login" uses translation key auth.success.buttons.login
- [ ] The button label "Back to Home" uses translation key auth.success.buttons.home or common.buttons.home
- [ ] The redirect notice "Automatic login in progress..." uses translation key auth.success.redirectNotices.loggingIn
- [ ] The redirect notice for manual fallback uses translation key auth.success.redirectNotices.manualFallback
- [ ] The redirect notice "You will be automatically redirected to the dashboard in 2 seconds." uses translation key auth.success.redirectNotices.dashboardRedirect
- [ ] The redirect notice "You will be automatically redirected to the login page in 5 seconds." uses translation key auth.success.redirectNotices.loginRedirect
- [ ] All corresponding translation keys exist in /messages/en.json under the auth.success namespace
- [ ] All hardcoded English strings visible to users have been replaced with t() function calls
- [ ] The component renders correctly with translations in place
- [ ] TypeScript compilation succeeds with no type errors related to translation keys
- [ ] The build process completes successfully after the changes
- [ ] Existing functionality including OAuth detection, auto-redirect timers, conditional rendering, error handling, and button navigation remains unchanged
- [ ] All conditional message displays show correct translated content based on authentication state
- [ ] Auto-redirect notices display correct translated text with appropriate timing references
- [ ] The checklist displays all translated items properly formatted

---

## REQ-329: Internationalize Registration Complete Page Component

**Date**: 2026-01-18 22:45
**Type**: ENHANCEMENT
**Size**: L

### Summary
The registration complete page component should be updated to use the next-intl translation system, replacing all hardcoded English strings with translation function calls that reference keys from the auth namespace.

### Current Behavior
The registration complete page component located at `/src/app/register/complete/page.tsx` contains approximately 35 hardcoded English strings including page headings, subtitles, instructional text, info banners, form labels, placeholder text, helper messages, button labels, loading states, error messages, success confirmations, sign-out prompts, and footer links. These strings are embedded directly in the JSX markup and conditional rendering logic, making it impossible to display the complete registration flow in any language other than English. Users with non-English language preferences see only English text throughout the OAuth completion experience regardless of their locale settings. This page handles the special case where users complete Google OAuth authentication but still need to provide an access code to finish registration.

### Expected Behavior
When users arrive at the complete registration page after OAuth authentication, all visible text appears in their preferred language as determined by the application's locale settings. The component imports the useTranslations hook from next-intl and retrieves all user-facing strings from the auth.completeRegistration namespace in the translation files. Text elements including the brand name "FAQBNB", the subtitle "Complete Registration", the main heading "Almost there!", the OAuth success description "Your Google sign-in was successful, but we need an access code to complete your registration.", the "Signed in as:" label, the instruction text "Enter your access code to complete account setup.", the form field label "Access Code", the placeholder "Enter your access code", the helper text "Check your email for the access code from your invitation.", the submit button text "Complete Registration", the loading state "Completing Registration...", error messages, the success confirmation heading "Registration Complete!", the success message "Your account has been set up successfully.", the redirect notice "Redirecting to dashboard...", the sign-out prompt "Wrong account? Sign out and try again.", the sign-out button label "Sign Out", the loading message "Checking authentication...", and footer links "Back to Home" and "Request Access Code" are all retrieved from translation keys using the t() function. The component maintains all existing functionality including OAuth state handling, access code validation, form submission, success state management, auto-redirect logic, sign-out functionality, and authentication checking while presenting all text in the user's selected language.

### User Impact
International users experience the complete registration flow in their native language, understanding the OAuth completion requirements and what steps remain to finish account setup. Users with limited English proficiency can comprehend why an access code is needed despite successful Google authentication, where to find the code, and what happens after submission. All users benefit from consistent terminology between the complete registration page and other translated authentication components. Clear, translated instructions reduce confusion for users in the OAuth-but-not-registered state and improve completion rates for this critical edge case. The professional, fully localized completion experience ensures users successfully transition from OAuth to full account creation.

### Business Value
The registration complete page handles an important edge case in the OAuth flow where users authenticate with Google but still need access code validation. Localizing this page ensures international users successfully complete registration rather than abandoning the process due to confusion about access code requirements. This work completes the comprehensive registration flow internationalization by addressing the OAuth completion scenario. Professional localization of all registration states including the OAuth completion case demonstrates commitment to supporting international users through every registration path. Reducing abandonment at this late stage of registration directly impacts user acquisition and conversion rates in international markets.

### Acceptance Criteria
- [ ] The component imports useTranslations from next-intl
- [ ] A translations instance is created with the 'auth.completeRegistration' namespace
- [ ] The brand name "FAQBNB" uses translation key auth.completeRegistration.brand or common.brand
- [ ] The subtitle "Complete Registration" uses translation key auth.completeRegistration.subtitle
- [ ] The main heading "Almost there!" uses translation key auth.completeRegistration.heading
- [ ] The OAuth success description uses translation key auth.completeRegistration.description
- [ ] The "Signed in as:" label uses translation key auth.completeRegistration.signedInAs
- [ ] The instruction text uses translation key auth.completeRegistration.instruction
- [ ] The form field label "Access Code" uses translation key auth.completeRegistration.form.accessCodeLabel
- [ ] The placeholder "Enter your access code" uses translation key auth.completeRegistration.form.accessCodePlaceholder
- [ ] The helper text uses translation key auth.completeRegistration.form.accessCodeHelp
- [ ] The submit button text "Complete Registration" uses translation key auth.completeRegistration.form.submitButton
- [ ] The loading state "Completing Registration..." uses translation key auth.completeRegistration.form.submitting
- [ ] The success heading "Registration Complete!" uses translation key auth.completeRegistration.success.heading
- [ ] The success message uses translation key auth.completeRegistration.success.message
- [ ] The redirect notice "Redirecting to dashboard..." uses translation key auth.completeRegistration.success.redirecting
- [ ] The sign-out prompt uses translation key auth.completeRegistration.signOut.prompt
- [ ] The sign-out button label "Sign Out" uses translation key auth.completeRegistration.signOut.button
- [ ] The loading auth message "Checking authentication..." uses translation key auth.completeRegistration.loading.checkingAuth
- [ ] The LoadingFallback "Loading..." text uses translation key auth.completeRegistration.loading.page or common.loading.generic
- [ ] The footer link "Back to Home" uses translation key auth.completeRegistration.footer.backToHome or common.navigation.backToHome
- [ ] The footer link "Request Access Code" uses translation key auth.completeRegistration.footer.requestAccess
- [ ] The copyright text uses translation key common.footer.copyright
- [ ] Error messages reference appropriate translation keys from the auth.completeRegistration.errors or errors namespace
- [ ] All corresponding translation keys exist in /messages/en.json under the auth.completeRegistration namespace
- [ ] All hardcoded English strings visible to users have been replaced with t() function calls
- [ ] The component renders correctly with translations in place
- [ ] TypeScript compilation succeeds with no type errors related to translation keys
- [ ] The build process completes successfully after the changes
- [ ] Existing functionality including OAuth state detection, access code validation, form submission, success state handling, auto-redirect, sign-out flow, and authentication checking remains unchanged
- [ ] All conditional message displays show correct translated content based on component state
- [ ] The info banner displays translated signed-in email and instruction text properly
- [ ] Error messages display correctly with translated content
- [ ] The success state shows all translated confirmation and redirect messages

---

## REQ-337: Test All Authentication Flows in Each Supported Language

**Date**: 2026-01-18 23:59
**Type**: ENHANCEMENT
**Size**: M

### Summary
All authentication flows including login, registration, password reset, and OAuth completion should be systematically tested in each of the six supported languages to verify that localization works correctly throughout the entire authentication experience.

### Current Behavior
Authentication components have been internationalized with translation keys replacing hardcoded English strings across login pages, registration forms, success pages, OAuth buttons, and completion flows. Translation files exist for all six supported languages including English, French, Spanish, German, Dutch, and Italian with comprehensive auth namespace coverage. However, there has been no systematic end-to-end testing of the complete authentication experience in each language to verify that all flows work correctly, all strings appear properly translated, form validation displays localized messages, error handling shows appropriate translated feedback, and the user experience is seamless across different language settings. Without comprehensive testing, translation issues such as missing keys, incorrect parameter substitution, text overflow in UI components, or broken functionality in specific languages may exist undetected.

### Expected Behavior
When the authentication system is tested in each supported language, all user flows function correctly and display fully translated content. Testers systematically verify the login flow by accessing the login page, viewing all page elements and form labels, submitting valid credentials, encountering validation errors, experiencing authentication errors, and completing successful login in each language. The registration flow is tested by accessing the registration page, viewing form fields and password requirements, submitting with validation errors, accepting terms and conditions, completing successful registration, and viewing success confirmation in each language. The OAuth flow is tested by initiating Google authentication, completing the OAuth process, handling the completion flow when access codes are required, and viewing success states in each language. Password reset flows, when present, are tested by requesting password reset, viewing email confirmations, submitting new passwords, and seeing success messages in each language. Error scenarios are verified by triggering validation errors, authentication failures, permission denials, and system errors to confirm error messages appear correctly translated in each language. Edge cases such as session expiration, concurrent sessions, rate limiting, and auto-redirect flows are tested across all languages. The testing process documents any issues found including missing translations, incorrect text, layout problems caused by translation length differences, broken functionality in specific languages, and inconsistent terminology or tone.

### User Impact
Users in all six supported languages experience fully functional, professionally translated authentication flows with no untranslated strings, broken layouts, or language-specific bugs. International users encounter no surprises or issues when authenticating in their preferred language, building confidence and trust from their first interaction with the application. All users benefit from the quality assurance that comprehensive language testing provides, ensuring a polished, production-ready authentication experience across all supported locales.

### Business Value
Systematic testing of authentication flows across all languages prevents embarrassing translation issues from reaching production that could harm user acquisition and brand reputation in international markets. Authentication flows are critical conversion points where any bugs or poor translation quality directly impact signup and login completion rates. This testing validates the significant localization investment made in authentication components and ensures the work delivers the intended business value of supporting international markets. Identifying and fixing issues before launch reduces support costs and user frustration. Professional, bug-free authentication experiences in all supported languages demonstrate commitment to international users and enable confident market expansion. This quality assurance step is essential for enterprise customers who require validated multi-language support before adoption.

### Acceptance Criteria
- [ ] A testing plan has been created documenting all authentication flows and test scenarios to be verified in each language
- [ ] Login flow has been tested in all six languages including page load, form display, field validation, authentication errors, success states, and redirects
- [ ] Registration flow has been tested in all six languages including form display, password requirements, validation errors, terms acceptance, submission, and success confirmation
- [ ] OAuth flow has been tested in all six languages including Google authentication initiation, OAuth completion, access code handling, and success states
- [ ] Password reset flow has been tested in all six languages if present in the application
- [ ] Error scenarios have been tested in all languages including validation errors, authentication failures, rate limiting, and system errors
- [ ] Edge cases have been tested including session expiration, auto-redirects, loading states, and concurrent session handling across languages
- [ ] All visible text elements in authentication flows display properly translated content in each language
- [ ] Form validation messages appear correctly translated when validation fails
- [ ] Error messages display appropriate translated feedback for all error types
- [ ] Success messages and confirmations appear in the correct language
- [ ] Button labels, field labels, and helper text are translated throughout all flows
- [ ] Loading states and progress indicators display translated messages
- [ ] Layout and formatting remain correct with translations of varying lengths in different languages
- [ ] No text overflow, truncation, or layout breaking occurs in any language
- [ ] Dynamic content such as email addresses, usernames, and time values integrate correctly with translated text
- [ ] Parameter substitution in translated strings works correctly across all languages
- [ ] Navigation between authentication pages maintains correct language context
- [ ] All authentication flows function identically across languages with no language-specific bugs
- [ ] A testing report documents all issues found and their resolution status
- [ ] Critical issues blocking production use have been identified and resolved
- [ ] Minor issues such as terminology inconsistencies have been catalogued for future improvement

---

---

## REQ-338: Create Common Namespace Structure in Translation Files

**Date**: 2026-01-19 10:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
The translation files should include a comprehensive common namespace containing shared translation strings for buttons, labels, loading states, error messages, form actions, navigation elements, and other UI components used throughout the application.

### Current Behavior
The translation file `/messages/en.json` contains a basic common namespace with approximately 35 fundamental translation strings including common action verbs like save, cancel, delete, edit, create, and navigation terms like back, next, and close. While this provides a foundation for shared translations, it lacks many common UI patterns that appear repeatedly across multiple components in the application. Components currently rely on namespace-specific duplicates of common strings or reference the limited common namespace without having access to frequently needed patterns such as detailed loading states with context, comprehensive form validation messages, pagination controls, confirmation dialogs with customizable prompts, status indicators, time-related labels, accessibility text, and common descriptive phrases. This results in translation key duplication across different namespaces, inconsistent terminology when similar concepts are expressed differently in various components, and unnecessary complexity in translation file maintenance.

### Expected Behavior
The common namespace in all translation files serves as a centralized repository for shared UI strings used across multiple components throughout the application. The namespace is organized into logical subsections including actions for common verbs and operations, navigation for movement between pages and sections, forms for input labels and validation messages, status for state indicators and feedback, loading for progress and async operation messages, time for temporal labels and formatting, validation for common field-level error messages, confirmation for dialog prompts and user confirmations, pagination for list and table navigation, accessibility for screen reader text and ARIA labels, and descriptions for commonly reused descriptive phrases. Each subsection contains the translation strings most frequently needed by components across the application, reducing duplication and ensuring terminology consistency. Components reference common namespace keys using patterns like common.actions.save, common.loading.pleaseWait, common.validation.fieldRequired, and common.confirmation.areYouSure. The common namespace evolves over time as new shared patterns emerge, with developers adding new keys to common when they identify reusable strings during component development. The namespace remains focused on truly shared content rather than becoming a catch-all for all possible translations.

### User Impact
Users experience consistent terminology and phrasing across all areas of the application because shared UI elements reference centralized translation strings. Common actions like save, cancel, and delete appear with identical wording throughout the interface, creating a predictable and learnable experience. Status messages, loading indicators, and validation feedback use consistent language patterns regardless of which feature area displays them. This consistency reduces cognitive load and helps users build mental models of how the application communicates with them. International users benefit from professional, consistent translations across all supported languages for these fundamental UI elements.

### Business Value
A well-organized common namespace reduces translation costs by eliminating duplication across component-specific namespaces, as shared strings are translated once rather than repeatedly for each feature area. Translation maintenance becomes easier because common terminology updates can be made in a single location rather than hunting across multiple namespaces. Development velocity improves when developers can reference existing common keys rather than creating new namespace-specific translations for standard UI patterns. Consistent terminology strengthens brand voice and user experience quality, demonstrating attention to detail. The organized structure makes onboarding new developers easier as they learn where to find standard translation strings. This foundational work supports scalable internationalization as the application grows by establishing patterns for shared translation management.

### Acceptance Criteria
- [ ] The common namespace in `/messages/en.json` contains an actions subsection with keys for common verbs and operations beyond the current set
- [ ] The common namespace contains a navigation subsection with keys for directional movement and page transitions
- [ ] The common namespace contains a forms subsection with keys for common form labels and input-related text
- [ ] The common namespace contains a status subsection with keys for state indicators like pending, completed, active, and inactive
- [ ] The common namespace contains a loading subsection with keys for various loading and progress messages
- [ ] The common namespace contains a time subsection with keys for temporal labels like today, yesterday, and relative time expressions
- [ ] The common namespace contains a validation subsection with keys for common field-level validation messages
- [ ] The common namespace contains a confirmation subsection with keys for dialog prompts and user confirmation text
- [ ] The common namespace contains a pagination subsection with keys for list navigation like previous, next, and showing results
- [ ] The common namespace contains an accessibility subsection with keys for screen reader text and ARIA labels
- [ ] Each subsection is organized with clear, semantic key names that describe the content
- [ ] All keys in the common namespace represent truly shared content used across multiple components
- [ ] The common namespace structure is mirrored across all supported language files including en.json, fr.json, es.json, de.json, nl.json, and it.json
- [ ] Translations for all new common keys are provided in English in en.json
- [ ] Placeholder translations matching the English content are provided in all other language files pending professional translation
- [ ] The common namespace remains focused and does not include feature-specific content better suited to dedicated namespaces
- [ ] TypeScript compilation succeeds after adding the new namespace structure
- [ ] Existing components continue to function with the expanded common namespace
- [ ] Documentation or comments indicate the purpose of the common namespace and when to use it versus feature-specific namespaces


---

## REQ-339: Extract Button Labels Across All Components

**Date**: 2026-01-19 
**Type**: ENHANCEMENT
**Size**: M

### Summary
All button labels throughout the application should display in the user's selected language by extracting hardcoded text into translation files.

### Current Behavior
Button labels such as "Submit", "Cancel", "Save", "Delete", "Edit", "Confirm", and others are hardcoded directly in component markup using English text strings. Users see buttons in English regardless of their language preference.

### Expected Behavior
Button labels appear in the user's selected language. All button text is managed through the translation system, allowing consistent terminology across the application and easy updates to button labels without code changes.

### User Impact
All users who prefer non-English languages will see button labels in their chosen language. This affects every interactive element throughout the application including forms, dialogs, navigation controls, and action panels.

### Business Value
Completes a critical piece of the internationalization effort by ensuring interactive elements speak the user's language, reducing confusion and improving task completion rates for international users.

### Acceptance Criteria
- [ ] All button components display labels from translation files using the t() function
- [ ] No hardcoded English button text remains in component markup
- [ ] Button label keys follow a consistent naming convention (e.g., common.buttons.submit, common.buttons.cancel)
- [ ] All extracted labels exist in translation files for every supported language
- [ ] Existing button functionality and click handlers remain unchanged
- [ ] Button labels update immediately when user changes language preference


---

## REQ-340: Extract Modal and Dialog Strings for Translation

**Date**: 2026-01-19 16:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
All modal and dialog components should display titles, messages, and action labels in the user's selected language.

### Current Behavior
Modal and dialog components contain hardcoded English strings for titles, confirmation messages, error messages, informational text, and button labels. Users see these interface elements only in English regardless of their language preference.

### Expected Behavior
Modal and dialog components render all text content using translation keys. Titles, body text, warning messages, confirmation prompts, and action buttons appear in the user's selected language. The translation system provides fallback to English when translations are unavailable.

### User Impact
Users who prefer non-English languages will see modal dialogs, confirmation prompts, error alerts, and informational popups in their chosen language, improving comprehension and reducing confusion during critical interactions like deletions, confirmations, and warnings.

### Business Value
Localized modal and dialog content improves user confidence during important actions and reduces support requests from non-English speakers who misunderstand confirmation prompts or error messages.

### Acceptance Criteria
- [ ] All modal and dialog components are identified and documented
- [ ] Hardcoded strings (titles, messages, button labels, warnings) are replaced with t() function calls
- [ ] Translation keys follow the established namespace pattern (e.g., "modals.confirm.title", "dialogs.delete.message")
- [ ] All extracted strings are added to en.json and propagated to other language files (de.json, es.json, fr.json, it.json, nl.json)
- [ ] Modal components correctly display translated content when language is switched
- [ ] No hardcoded English text remains in modal or dialog components
- [ ] Button labels within modals use consistent translation keys with the button namespace where applicable



---

## REQ-341: Extract Form Element Strings for Internationalization

**Date**: 2026-01-19 16:52
**Type**: ENHANCEMENT
**Size**: L

### Summary
All form element strings including labels, placeholders, validation messages, and hints should display in the user's selected language throughout the application.

### Current Behavior
Form components across the application contain hardcoded English strings for input field labels, placeholder text, helper text, validation error messages, required field indicators, and formatting hints. Users see form interfaces entirely in English regardless of their language preference. Forms include registration, login, profile editing, item creation, article editing, access requests, and administrative interfaces.

### Expected Behavior
All form elements render text content using translation keys from the i18n system. Input labels, placeholder text, helper hints, validation messages, required field indicators, and formatting instructions appear in the user's selected language. The translation system provides appropriate fallbacks when specific translations are unavailable. Form validation messages dynamically insert field names and values while maintaining grammatically correct translations for each language.

### User Impact
Users who prefer non-English languages will interact with forms in their chosen language, understanding what information is required, how to format inputs correctly, and what errors need correction. This affects every data entry scenario including account creation, authentication, content publishing, profile management, and administrative operations. Improved comprehension reduces form abandonment and data entry errors.

### Business Value
Localized form interfaces directly impact conversion rates by removing language barriers during critical user flows like registration and content creation. Reduced form abandonment increases user acquisition and engagement. Clear validation messages in the user's language decrease support requests and improve data quality by helping users submit correct information on the first attempt.

### Acceptance Criteria
- [ ] All form components are identified and catalogued including authentication forms, profile forms, content creation forms, and admin forms
- [ ] Input field labels are extracted to translation keys following the pattern "forms.[formName].labels.[fieldName]"
- [ ] Placeholder text is extracted to translation keys following the pattern "forms.[formName].placeholders.[fieldName]"
- [ ] Helper text and hints are extracted to translation keys following the pattern "forms.[formName].hints.[fieldName]"
- [ ] Field-specific validation messages are extracted to translation keys following the pattern "forms.[formName].validation.[fieldName].[errorType]"
- [ ] Common validation messages are organized in the common.validation namespace for reuse across forms
- [ ] Required field indicators use translation keys for consistency
- [ ] All extracted strings are added to en.json with complete English translations
- [ ] All extracted strings are propagated to other language files (de.json, es.json, fr.json, it.json, nl.json) with placeholder translations
- [ ] Forms correctly display translated content when user switches language
- [ ] Validation messages appear in the correct language when triggered
- [ ] No hardcoded English form strings remain in any component
- [ ] Dynamic validation messages that include field values or counts use proper translation interpolation
- [ ] Forms maintain accessibility attributes with translated ARIA labels where applicable
- [ ] TypeScript types are updated to reflect the new translation key structure
- [ ] All forms function correctly with no regressions in validation logic or submission behavior



---

## REQ-342: Extract Empty State Messages for Internationalization

**Date**: 2026-01-19 17:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
All empty state messages throughout the application should display in the user's selected language by extracting hardcoded text into translation files.

### Current Behavior
Empty state messages are hardcoded in English across various components including list views, dashboards, data tables, and content displays. Messages like "No items found", "No properties available", "No resources available", "No items yet", "Get started by creating your first item", and similar phrases appear only in English regardless of the user's language preference. These messages are displayed when lists are empty, searches return no results, or users have not yet created content.

### Expected Behavior
Empty state messages appear in the user's selected language using translation keys from the i18n system. All empty state scenarios display appropriate messages including zero-data states, no-search-results states, and first-time-user guidance. Messages maintain proper tone and helpfulness in each language while providing consistent user guidance across the application.

### User Impact
Users who prefer non-English languages will see empty state messages in their chosen language. This affects dashboard views, property lists, item lists, search results, resource displays, and all scenarios where the application shows placeholder content or guidance for empty collections. Clear empty state messages in the user's language reduce confusion and improve understanding of next steps.

### Business Value
Localized empty state messages improve first-time user experience by providing guidance in their native language, reducing abandonment during initial setup. Clear "no results" messages in the user's language decrease support requests from users wondering if something is broken when they see empty lists.

### Acceptance Criteria
- [ ] All components displaying empty states are identified including ItemsManagement, PropertiesManagement, ItemSelectionList, ItemDisplay, Dashboard, and analytics components
- [ ] Empty state titles are extracted to translation keys following the pattern "emptyStates.[context].title"
- [ ] Empty state descriptions and guidance text are extracted to translation keys following the pattern "emptyStates.[context].description"
- [ ] Search-specific empty states use dedicated keys like "emptyStates.search.noResults" with proper interpolation for search terms
- [ ] First-time user guidance messages use keys like "emptyStates.[feature].getStarted"
- [ ] All extracted strings are added to en.json with complete English translations
- [ ] All extracted strings are propagated to other language files (de.json, es.json, fr.json, it.json, nl.json)
- [ ] Components correctly display translated empty state messages when language is switched
- [ ] No hardcoded English empty state text remains in any component
- [ ] Empty state messages maintain helpful and encouraging tone in all languages
- [ ] Props for custom empty state messages (emptyStateTitle, emptyStateDescription) continue to work for component flexibility




---

## REQ-343: Extract Loading State Messages for Internationalization

**Date**: 2026-01-19 17:28
**Type**: ENHANCEMENT
**Size**: M

### Summary
All loading state messages throughout the application should display in the user's selected language by extracting hardcoded text into translation files.

### Current Behavior
Loading state messages are hardcoded in English across components that display progress indicators, spinners, skeleton loaders, and data fetching states. Messages like "Loading...", "Please wait...", "Fetching data...", "Processing...", "Submitting...", and similar phrases appear only in English regardless of the user's language preference. These messages are shown during asynchronous operations including data fetches, form submissions, page transitions, and background processing.

### Expected Behavior
Loading state messages appear in the user's selected language using translation keys from the i18n system. All loading scenarios display appropriate messages including initial page loads, data fetching, form submissions, background processes, and transitions between states. Messages maintain clarity about what operation is in progress while providing consistent feedback across the application in each supported language.

### User Impact
Users who prefer non-English languages will see loading indicators and progress messages in their chosen language. This affects every asynchronous operation including page navigation, data loading, search operations, form submissions, file uploads, and background tasks. Clear loading messages in the user's language reduce uncertainty during wait times and improve perceived application responsiveness.

### Business Value
Localized loading messages improve user confidence during asynchronous operations by providing clear feedback in their native language. Reduced user anxiety during loading states decreases abandonment rates for longer operations and improves perceived application quality across all supported markets.

### Acceptance Criteria
- [ ] All components with loading states are identified including page loaders, data tables, forms, modals, search interfaces, and background operation indicators
- [ ] Generic loading messages are extracted to translation keys in the common namespace following the pattern "common.loading.default", "common.loading.pleaseWait"
- [ ] Context-specific loading messages use dedicated keys like "loading.fetchingItems", "loading.submittingForm", "loading.uploadingFile", "loading.processingRequest"
- [ ] Progress indicators with message labels are updated to use translation keys
- [ ] Skeleton loader accessibility labels use translation keys for screen reader announcements
- [ ] All extracted strings are added to en.json with complete English translations
- [ ] All extracted strings are propagated to other language files (de.json, es.json, fr.json, it.json, nl.json)
- [ ] Components correctly display translated loading messages when language is switched
- [ ] Loading messages maintain appropriate brevity and clarity in all languages
- [ ] No hardcoded English loading state text remains in any component
- [ ] ARIA live regions announcing loading states use translated text for accessibility
- [ ] Loading messages with dynamic content (e.g., "Loading 5 items...") use proper translation interpolation


---

## REQ-344: Extract Confirmation Dialog Messages for Internationalization

**Date**: 2026-01-19 18:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
All confirmation dialog messages throughout the application should display in the user's selected language by extracting hardcoded text into translation files.

### Current Behavior
Confirmation dialog messages are hardcoded in English across components that require user confirmation before performing actions. Messages like "Are you sure you want to delete?", "Confirm action", "Yes", "No", "Cancel", "Proceed", "This action cannot be undone", and similar confirmation prompts appear only in English regardless of the user's language preference. These dialogs appear before destructive operations, irreversible actions, navigation away from unsaved changes, and other scenarios requiring explicit user consent.

### Expected Behavior
Confirmation dialog messages appear in the user's selected language using translation keys from the i18n system. All confirmation scenarios display appropriate messages including delete confirmations, save prompts, cancellation warnings, logout confirmations, and navigation warnings. Messages clearly communicate the action consequences and available choices while maintaining consistent terminology across the application in each supported language.

### User Impact
Users who prefer non-English languages will see confirmation dialogs in their chosen language. This affects critical decision points including deleting items, discarding changes, logging out, canceling operations, confirming payments, and approving requests. Clear confirmation messages in the user's language reduce errors from misunderstood prompts and improve confidence when making important decisions.

### Business Value
Localized confirmation dialogs prevent user errors by ensuring critical action prompts are clearly understood in their native language. Reduced accidental deletions and unintended actions decrease support burden and improve user trust in the application across all supported markets.

### Acceptance Criteria
- [ ] All components with confirmation dialogs are identified including delete confirmations, unsaved changes warnings, logout prompts, cancellation dialogs, and approval requests
- [ ] Generic confirmation actions are extracted to translation keys in the common namespace following the pattern "common.confirm.areYouSure", "common.confirm.cannotUndo", "common.confirm.proceedQuestion"
- [ ] Generic button labels use keys like "common.actions.yes", "common.actions.no", "common.actions.cancel", "common.actions.proceed", "common.actions.confirm"
- [ ] Context-specific confirmations use dedicated keys like "confirm.deleteItem", "confirm.discardChanges", "confirm.logout", "confirm.cancelBooking"
- [ ] Dialog titles use translation keys like "confirm.title.delete", "confirm.title.warning", "confirm.title.attention"
- [ ] All extracted strings are added to en.json with complete English translations
- [ ] All extracted strings are propagated to other language files (de.json, es.json, fr.json, it.json, nl.json)
- [ ] Components correctly display translated confirmation dialogs when language is switched
- [ ] Confirmation messages maintain appropriate tone and urgency level in all languages
- [ ] No hardcoded English confirmation dialog text remains in any component
- [ ] Confirmation messages with dynamic content (e.g., "Delete {itemName}?") use proper translation interpolation
- [ ] Multi-step confirmation flows maintain linguistic consistency across all steps



---

## REQ-345: Create Date and Time Formatting Translations

**Date**: 2026-01-19 19:12
**Type**: NEW FEATURE
**Size**: L

### Summary
The application should provide comprehensive date and time formatting translations for all supported languages, enabling users to view dates, times, durations, and date ranges in culturally appropriate formats.

### Current Behavior
Date and time values throughout the application are displayed using a single format (likely English US conventions). Users see dates in MM/DD/YYYY format, 12-hour time notation, and English relative time expressions like "2 days ago" regardless of their language preference or regional conventions. Calendar-related strings such as month names and day names appear in English only.

### Expected Behavior
Date and time values render according to the user's selected language and regional formatting conventions. Users see dates formatted appropriately for their locale (DD.MM.YYYY for German, DD/MM/YYYY for British English, etc.), time displayed in 12-hour or 24-hour format based on regional standards, and relative time expressions in their chosen language. Month names, day names, and all calendar-related strings appear in the user's language. The system provides consistent formatting for durations, date ranges, and timestamp displays across all application features.

### User Impact
Users who prefer non-English languages or non-US regional formats will see all temporal information displayed according to their cultural conventions. This affects every feature displaying dates and times including booking calendars, activity logs, content timestamps, availability schedules, review dates, creation dates, modification timestamps, and analytics time ranges. Familiar date and time formats improve comprehension and reduce cognitive load when interpreting temporal information.

### Business Value
Culturally appropriate date and time formatting demonstrates attention to international user needs and increases application credibility in non-US markets. Proper localization of temporal information reduces user errors in date entry and interpretation, particularly important for booking systems and scheduling features. Meeting user expectations for regional date formats improves overall user satisfaction and reduces support requests from international users.

### Acceptance Criteria
- [ ] Relative time format translations are created for all supported languages including "today", "yesterday", "tomorrow", "X days ago", "X hours ago", "X minutes ago", "X weeks ago", "X months ago", "X years ago", "just now", "in X days", "in X hours"
- [ ] Date format patterns are defined for each locale following regional conventions (DD.MM.YYYY for de, DD/MM/YYYY for en-GB, MM/DD/YYYY for en-US, etc.)
- [ ] Time format patterns respect regional conventions (24-hour format for European languages, 12-hour format with AM/PM for US English)
- [ ] Short date formats, long date formats, and abbreviated date formats are defined for each locale
- [ ] Duration format translations are created including "X hours Y minutes", "X days", "X weeks", "X months and Y days"
- [ ] Date range format translations are created for displaying periods like "Jan 1 - Jan 15", "1-15 January", "1. - 15. Januar"
- [ ] All month names are translated into each supported language (January/Januar/Enero/Janvier/Gennaio/januari, etc.)
- [ ] All full day names are translated into each supported language (Monday/Montag/Lunes/Lundi/Lunedì/maandag, etc.)
- [ ] All abbreviated day names are translated into each supported language (Mon/Mo/Lun/Lu/ma, etc.)
- [ ] All abbreviated month names are translated into each supported language (Jan/Ene/Gen/jan, etc.)
- [ ] Ordinal number formats for dates are created where culturally appropriate (1st, 2nd, 3rd in English; 1., 2., 3. in German, etc.)
- [ ] Quarter and week number formats are defined for each locale if used in the application
- [ ] Translation keys follow a consistent namespace pattern like "datetime.relative.daysAgo", "datetime.months.january", "datetime.weekdays.monday", "datetime.formats.short"
- [ ] All extracted strings are added to en.json with complete English translations
- [ ] All extracted strings are propagated to other language files (de.json, es.json, fr.json, it.json, nl.json) with culturally appropriate translations
- [ ] Date and time formatting utilities or helper functions are created to use these translations consistently
- [ ] Components displaying dates and times use the new formatting translations instead of hardcoded formats
- [ ] Date and time displays update correctly when user switches language preference
- [ ] Relative time expressions update dynamically and display in the correct language
- [ ] Calendar components display month names and day names in the user's selected language
- [ ] Date pickers and time pickers respect regional formatting conventions
- [ ] Timestamp displays across the application use consistent formatting based on user language
- [ ] No hardcoded date or time format strings remain in components
- [ ] Integration with next-intl's built-in date/time formatting capabilities is implemented where appropriate
- [ ] Timezone handling remains consistent and correct across all locales



---

## REQ-346: Generate Translations for All Non-English Common Namespace Keys

**Date**: 2026-01-19 21:03
**Type**: NEW FEATURE
**Size**: L

### Summary
The application should generate complete translations for all common namespace keys across all five non-English target languages to enable comprehensive multilingual support for shared UI components.

### Current Behavior
The common namespace structure exists in English with all UI string categories extracted including buttons, modals, forms, toasts, empty states, loading states, and confirmation dialogs. However, translation files for Spanish, French, German, Italian, and Dutch contain either placeholder values, incomplete translations, or missing keys. Users selecting non-English languages encounter untranslated or incorrectly translated common UI elements throughout the application.

### Expected Behavior
All common namespace keys have accurate, culturally appropriate translations in Spanish, French, German, Italian, and Dutch. Users selecting any supported language see all shared UI components fully translated including action buttons, form labels, status messages, confirmation dialogs, error notifications, and loading indicators. Translations maintain consistent terminology across the application and reflect appropriate formality levels and cultural conventions for each language.

### User Impact
Users who prefer Spanish, French, German, Italian, or Dutch will experience a fully localized application interface with all common UI elements appearing in their chosen language. This affects every user interaction including navigation, form submission, data viewing, content management, error handling, and system feedback. Complete translations eliminate language-switching confusion and provide a professional, polished experience for international users.

### Business Value
Comprehensive translation coverage for common UI elements demonstrates commitment to international markets and significantly improves user experience for non-English speakers. Complete localization increases user adoption and retention in European and Latin American markets, reduces support burden from language-related confusion, and positions the application as a truly international product. Quality translations across all supported languages maintain brand consistency and professionalism in global markets.

### Acceptance Criteria
- [ ] Translation service is configured and operational for generating common namespace translations
- [ ] All button label keys from common.actions namespace are translated into Spanish with contextually appropriate verb forms and terminology
- [ ] All button label keys from common.actions namespace are translated into French with proper grammatical gender and formality
- [ ] All button label keys from common.actions namespace are translated into German with appropriate capitalization and formal/informal register
- [ ] All button label keys from common.actions namespace are translated into Italian with correct verb conjugations and regional preferences
- [ ] All button label keys from common.actions namespace are translated into Dutch with proper verb forms and spelling conventions
- [ ] All modal and dialog keys from common.modal namespace are translated into all five languages maintaining appropriate formality and clarity
- [ ] All form element keys from common.form namespace are translated into all five languages with culturally appropriate label phrasing
- [ ] All toast notification keys from common.toast namespace are translated into all five languages with consistent tone for success, error, warning, and info messages
- [ ] All empty state keys from common.empty namespace are translated into all five languages with helpful, encouraging messaging
- [ ] All loading state keys from common.loading namespace are translated into all five languages with brief, clear status indicators
- [ ] All confirmation dialog keys from common.confirm namespace are translated into all five languages with appropriate urgency and clarity
- [ ] Translation quality is validated for accuracy, cultural appropriateness, and consistency within each language
- [ ] Technical terminology maintains consistency across all UI contexts within each language
- [ ] Formality level (formal vs. informal address) is consistent and appropriate for each language
- [ ] Gendered language is handled appropriately where grammatically required (French, German, Italian, Spanish)
- [ ] Variable interpolation placeholders are preserved correctly in all translated strings
- [ ] Pluralization rules are implemented correctly for each language where applicable
- [ ] All translations fit within typical UI component space constraints without overflow issues
- [ ] Special characters, accents, and diacritical marks are correctly encoded in all language files
- [ ] Translation files (es.json, fr.json, de.json, it.json, nl.json) are updated with all common namespace translations
- [ ] No placeholder or machine-translated content remains in any production language file
- [ ] Application displays all common UI elements correctly in each language when language preference is changed
- [ ] Translation completeness is verified at 100% for common namespace across all five languages
- [ ] Translation quality review is completed by native speakers or professional translation service
- [ ] Translation metadata is documented including source, date generated, and quality review status



---

## REQ-347: Generate Translations for All Static UI Strings Across Five Non-English Languages

**Date**: 2026-01-19 22:15
**Type**: NEW FEATURE
**Size**: XL

### Summary
The application should provide complete, accurate translations for all static UI strings in Spanish, French, German, Italian, and Dutch to deliver a fully localized user experience across all supported languages.

### Current Behavior
Translation files exist for all six supported languages (en, es, fr, de, it, nl) but non-English files contain incomplete, placeholder, or missing translations. Users selecting Spanish, French, German, Italian, or Dutch encounter mixed-language interfaces with English fallback strings appearing throughout the application. The user experience is inconsistent and unprofessional for non-English speakers, limiting international adoption.

### Expected Behavior
All static UI strings across the entire application are translated into Spanish, French, German, Italian, and Dutch with native-quality accuracy and cultural appropriateness. Users selecting any supported language experience a completely localized interface with no English fallback strings visible. Translations maintain consistent terminology, appropriate formality levels, and correct grammatical forms across all namespaces including authentication, navigation, forms, actions, notifications, content management, and system messages.

### User Impact
International users selecting Spanish, French, German, Italian, or Dutch will experience a fully professional, polished application interface in their preferred language. This affects every user touchpoint including registration, login, navigation, content creation, search, filtering, notifications, settings, help text, error messages, and success confirmations. Complete translations eliminate confusion from mixed-language displays and demonstrate respect for international users' language preferences.

### Business Value
Comprehensive translation coverage enables the application to compete effectively in European and Latin American markets by providing native-language experiences that match user expectations for professional software. Complete localization significantly increases user adoption rates, reduces churn from international users, lowers support costs related to language barriers, and positions the product as truly international rather than English-first with minimal translation support. Quality translations across all languages strengthen brand perception and market credibility in target regions.

### Acceptance Criteria
- [ ] Translation service or professional translation provider is configured and operational for all five target languages
- [ ] All authentication namespace keys are translated into Spanish including login, registration, password reset, email verification, and OAuth flows
- [ ] All authentication namespace keys are translated into French including login, registration, password reset, email verification, and OAuth flows
- [ ] All authentication namespace keys are translated into German including login, registration, password reset, email verification, and OAuth flows
- [ ] All authentication namespace keys are translated into Italian including login, registration, password reset, email verification, and OAuth flows
- [ ] All authentication namespace keys are translated into Dutch including login, registration, password reset, email verification, and OAuth flows
- [ ] All navigation and menu namespace keys are translated into all five languages with clear, concise labels
- [ ] All form and input namespace keys are translated into all five languages with appropriate labels, placeholders, and help text
- [ ] All action button namespace keys are translated into all five languages with contextually appropriate verb forms
- [ ] All notification and toast message keys are translated into all five languages maintaining appropriate tone and urgency
- [ ] All error message keys are translated into all five languages with clear, actionable guidance
- [ ] All success and confirmation message keys are translated into all five languages with positive, encouraging tone
- [ ] All content management namespace keys are translated into all five languages for item, article, and link creation and editing
- [ ] All search and filter namespace keys are translated into all five languages with clear filter labels and search prompts
- [ ] All settings and preferences namespace keys are translated into all five languages including account, profile, and system settings
- [ ] All help text, tooltips, and informational message keys are translated into all five languages with clear explanations
- [ ] All validation message keys are translated into all five languages with specific, helpful error descriptions
- [ ] All empty state message keys are translated into all five languages with encouraging calls to action
- [ ] All loading state message keys are translated into all five languages with brief status indicators
- [ ] All date and time formatting keys are translated into all five languages following regional conventions
- [ ] Translation quality is validated by native speakers or professional reviewers for each language
- [ ] Terminology consistency is maintained across all namespaces within each language
- [ ] Formality level (tu vs. vous in French, du vs. Sie in German, etc.) is consistent and appropriate throughout each language
- [ ] Gendered language is handled correctly according to each language's grammatical rules
- [ ] Variable interpolation syntax is preserved correctly in all translated strings
- [ ] Pluralization rules are implemented correctly for all languages using next-intl pluralization features
- [ ] Special characters, accents, and diacritical marks are correctly encoded in all language files
- [ ] Translation files (es.json, fr.json, de.json, it.json, nl.json) contain complete translations with no placeholder or untranslated keys
- [ ] All language files maintain consistent JSON structure matching the English source file
- [ ] Translation completeness reaches 100% for all namespaces in all five languages
- [ ] Application displays fully localized UI across all pages and components when each language is selected
- [ ] No English fallback strings appear when using Spanish, French, German, Italian, or Dutch
- [ ] Language switching updates all UI elements correctly without requiring page refresh
- [ ] Right-to-left layout is not required for these languages and standard left-to-right rendering is confirmed
- [ ] Translation metadata is documented including provider, generation date, review status, and quality assurance process
- [ ] Automated tests verify translation key completeness and prevent untranslated strings in production
- [ ] Translation update process is documented for maintaining translations as new features are added



---

## REQ-348: Create `useCommonTranslations` Convenience Hook

**Date**: 2026-01-19 22:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The application should provide a convenience hook that simplifies access to commonly used translations across components, reducing boilerplate code and improving developer experience when working with shared UI strings.

### Current Behavior
Developers must use the `useTranslations` hook with namespace parameters for every component that needs common translations. Accessing frequently used strings like button labels, form elements, toast messages, and loading states requires repetitive code patterns including `const t = useTranslations('common.actions')` followed by multiple `t('buttonKey')` calls. Components that use translations from multiple common namespaces require multiple hook invocations, leading to verbose component code and increased cognitive load when working with internationalized strings.

### Expected Behavior
A `useCommonTranslations` hook provides convenient access to all common namespace translations through a single hook invocation. The hook returns an organized object structure that groups related translations by category such as actions, form elements, toast messages, modals, loading states, and confirmation dialogs. Developers can access common translations using clear, typed paths like `common.actions.save`, `common.form.email`, or `common.toast.success` without manually invoking separate translation hooks for each namespace.

### User Impact
End users experience no direct impact from this enhancement as it is a developer convenience feature that does not change the translation content or display behavior. However, the improved developer experience indirectly benefits users through faster feature development, reduced translation bugs, and more consistent use of shared UI strings across the application.

### Business Value
Improved developer productivity when implementing internationalized features reduces development time and lowers the risk of translation errors. Standardized access patterns for common translations improve code maintainability and make it easier for new developers to work with the i18n system. Reduced boilerplate code in components improves code readability and makes internationalization feel natural rather than burdensome.

### Acceptance Criteria
- [ ] A new `useCommonTranslations.ts` hook file is created in the appropriate hooks directory
- [ ] The hook imports and uses `useTranslations` from next-intl for each common namespace
- [ ] The hook returns an object structure organizing translations by category: actions, form, toast, modal, loading, confirm, empty
- [ ] The `actions` category provides access to all button and action label translations from common.actions namespace
- [ ] The `form` category provides access to all form element translations including labels, placeholders, and validation messages from common.form namespace
- [ ] The `toast` category provides access to all notification message translations from common.toast namespace
- [ ] The `modal` category provides access to all dialog and modal translations from common.modal namespace
- [ ] The `loading` category provides access to all loading state translations from common.loading namespace
- [ ] The `confirm` category provides access to all confirmation dialog translations from common.confirm namespace
- [ ] The `empty` category provides access to all empty state translations from common.empty namespace
- [ ] TypeScript type definitions are provided for the hook's return value ensuring type safety when accessing translations
- [ ] The hook can be imported and used in any client component without additional configuration
- [ ] Documentation is provided showing example usage patterns for the hook
- [ ] The hook implementation is efficient and does not cause unnecessary re-renders
- [ ] Existing components can optionally migrate to use the convenience hook without breaking changes
- [ ] The hook integrates seamlessly with next-intl's type safety and autocomplete features
- [ ] Unit tests verify the hook correctly returns translation functions organized by category
- [ ] Usage examples demonstrate accessing translations like `const { actions, form, toast } = useCommonTranslations()`

### Technical Notes
This hook is marked as optional in the localization pipeline, providing a quality-of-life improvement for developers working with common translations. While not required for functionality, it significantly reduces code verbosity in components that use multiple common namespace translations. The implementation should be lightweight and leverage next-intl's existing hooks rather than introducing custom translation logic. Consider exporting individual category hooks (e.g., `useCommonActions`, `useCommonForm`) alongside the combined hook for maximum flexibility in component implementations.



---

## REQ-349: Audit Form Validation Messages Across Components

**Date**: 2026-01-19 22:35
**Type**: ENHANCEMENT
**Size**: M

### Summary
The application should have all form validation messages audited and cataloged to ensure they are properly extracted for internationalization and provide consistent, helpful feedback across all forms.

### Current Behavior
Form validation messages are scattered across components with varying formats, levels of detail, and languages. Some validations use hardcoded English strings, others use inline error messages, and validation feedback lacks consistency in tone, clarity, and actionability. Validation messages appear in Zod schemas, React Hook Form configurations, custom validation functions, and inline component logic, making it difficult to ensure complete translation coverage or maintain consistent user guidance across forms.

### Expected Behavior
All form validation messages across the application are identified, documented, and centralized in the errors namespace of translation files. Each validation message provides clear, specific, and actionable feedback explaining what went wrong and how to fix it. Messages maintain consistent tone, terminology, and structure across all forms including registration, login, item creation, article editing, settings updates, and administrative functions. Validation messages are ready for translation into all supported languages with appropriate context for translators to understand the validation rules being communicated.

### User Impact
Users filling out any form in the application receive clear, consistent validation feedback in their preferred language. Instead of generic error messages or technical jargon, users see helpful guidance like "Email address must include an @ symbol" or "Password must be at least 8 characters long." International users receive validation messages in Spanish, French, German, Italian, or Dutch that accurately communicate validation requirements using culturally appropriate language and examples.

### Business Value
Comprehensive validation message auditing ensures no form errors appear in English when users select other languages, eliminating a major localization gap that undermines international user trust. Consistent, helpful validation messages reduce form abandonment rates, lower support costs related to form submission errors, and improve data quality by helping users submit correct information on the first attempt. Centralized validation messages make it easier to maintain and update error guidance as requirements evolve.

### Acceptance Criteria
- [ ] All form components are identified including registration, login, password reset, item creation, item editing, article creation, article editing, link creation, settings updates, and administrative forms
- [ ] All Zod validation schemas are reviewed and validation error messages are documented
- [ ] All React Hook Form validation rules are reviewed and custom error messages are documented
- [ ] All custom validation functions and inline validation logic are reviewed and error messages are extracted
- [ ] A comprehensive catalog is created listing every unique validation message with its current location, triggering condition, and proposed translation key
- [ ] Validation messages are categorized by type: required field, format error, length constraint, range constraint, uniqueness violation, dependency error, and custom business rule
- [ ] Each validation message includes context for translators explaining the validation rule, expected input format, and any locale-specific considerations
- [ ] Validation messages follow a consistent structure with specific guidance rather than generic errors
- [ ] Messages avoid technical jargon and use plain language understandable by non-technical users
- [ ] Messages are actionable, telling users how to fix the error rather than only stating what is wrong
- [ ] Variable placeholders are identified for dynamic values like minimum length, maximum characters, or allowed formats
- [ ] Pluralization requirements are identified for messages that change based on count (e.g., "1 character remaining" vs. "5 characters remaining")
- [ ] Field-specific vs. form-level validation messages are distinguished and categorized appropriately
- [ ] Real-time vs. submit-time validation messages are identified and may use different messaging strategies
- [ ] Validation messages for complex fields like file uploads, date pickers, and rich text editors are documented with special considerations
- [ ] Security-related validation messages are reviewed to ensure they do not expose sensitive system information while remaining helpful
- [ ] The audit document includes recommendations for consolidating duplicate or similar validation messages
- [ ] Translation keys are proposed for each validation message following the errors namespace structure
- [ ] The audit identifies validation messages that may need gender agreement or grammatical variations in different languages
- [ ] Findings are documented in a format that can be directly used for implementation in subsequent tasks
- [ ] The audit is reviewed by UX and content stakeholders to ensure validation messages align with voice and tone guidelines

### Technical Notes
This audit task lays the foundation for subsequent implementation work to centralize validation messages and integrate them with the translation system. Focus on completeness and accuracy in identifying all validation scenarios rather than implementing changes. Pay special attention to complex forms like item and article creation where validation rules may be intricate. Consider that some validation messages may come from server-side API responses and should be included in the audit. The resulting catalog should serve as both a migration checklist and a reference for consistent validation messaging going forward.



---

## REQ-350: Audit All API Error Handling and Messages

**Date**: 2026-01-19 23:45
**Type**: ENHANCEMENT
**Size**: L

### Summary
The application should have all API error handling audited and documented to ensure error responses are properly internationalized, provide consistent structure across endpoints, and use translation keys instead of hardcoded messages.

### Current Behavior
API endpoints return error messages with inconsistent formats, mixing hardcoded English strings, technical error codes, and varying response structures. Error handling patterns differ across routes with some endpoints returning detailed error objects while others provide minimal feedback. Authentication errors, validation failures, database errors, and business logic violations each use different messaging approaches, making it difficult for frontend components to display appropriate localized feedback to users. Server-side error messages are not integrated with the translation system, resulting in English-only error responses regardless of user language preference.

### Expected Behavior
All API endpoints follow a standardized error response structure that includes error codes, translatable message keys, and optional context data for message interpolation. Error messages use translation keys that reference the errors namespace rather than hardcoded strings, allowing frontend components to display localized error feedback in the user's preferred language. Consistent error handling patterns across all routes ensure predictable error structures for authentication failures, validation errors, resource not found scenarios, permission denials, and server errors. API error responses include sufficient context for frontend components to provide specific, actionable guidance to users.

### User Impact
Users interacting with any feature that makes API requests receive error feedback in their preferred language when operations fail. Instead of seeing English error messages like "Invalid credentials" or "Resource not found," Spanish users see "Credenciales inválidas" and French users see "Ressource introuvable." Error messages provide clear, specific guidance about what went wrong and how to resolve the issue, improving the user experience during error scenarios and maintaining language consistency throughout the application.

### Business Value
Comprehensive API error message internationalization eliminates a critical gap in the localization effort, ensuring the entire user experience is available in all supported languages. Standardized error response structures reduce frontend development time by providing predictable error handling patterns across all API integrations. Consistent, helpful error messages reduce user frustration during failures, lower support costs by enabling users to self-resolve common issues, and improve perceived application quality by maintaining professional error handling in all languages.

### Acceptance Criteria
- [ ] All API route files are identified and cataloged across authentication, user management, item operations, article operations, link operations, tag operations, translation services, and administrative functions
- [ ] Error handling code in all API routes is reviewed and documented including try-catch blocks, validation error responses, authentication failures, authorization checks, and database error handling
- [ ] All hardcoded error message strings are identified with their current location, triggering condition, HTTP status code, and proposed translation key
- [ ] Error responses are categorized by type: authentication errors (401), authorization errors (403), validation errors (400), not found errors (404), conflict errors (409), and server errors (500)
- [ ] Each error scenario is documented with the endpoint, HTTP method, triggering condition, current response format, and recommended standardized format
- [ ] A standardized error response schema is proposed including fields for error code, message key, message parameters, field-specific errors for validation, and optional debugging information
- [ ] Translation keys are proposed for all identified error messages following the errors.api namespace structure
- [ ] Field-level validation errors are distinguished from general request errors to enable specific form field feedback
- [ ] Authentication and authorization errors are reviewed to ensure they provide sufficient feedback without exposing security-sensitive information
- [ ] Database constraint violation errors are mapped to user-friendly message keys like "errors.api.duplicate_email" or "errors.api.reference_not_found"
- [ ] Rate limiting, timeout, and service unavailability errors are identified and assigned appropriate message keys
- [ ] Error messages that include dynamic values are documented with parameter placeholders like "{fieldName} is required" or "Maximum {maxLength} characters allowed"
- [ ] Consistency issues are identified where similar errors use different messages or response structures across endpoints
- [ ] Next.js API route error handling patterns are reviewed for compatibility with the proposed standardization
- [ ] Middleware error handling is audited to ensure consistent error responses for request validation, authentication, and authorization
- [ ] Third-party service errors (Supabase, translation APIs) are reviewed and mapped to appropriate user-facing message keys
- [ ] Error logging and monitoring implications are considered to ensure standardization does not reduce debugging capability
- [ ] The audit identifies opportunities to consolidate duplicate error handling code into shared utility functions
- [ ] Recommendations are provided for implementing a centralized error response utility that ensures consistent formatting
- [ ] The audit document includes example "before and after" error responses showing current inconsistent format versus proposed standardized format
- [ ] Findings are prioritized by impact, flagging high-traffic endpoints and user-facing errors for early implementation
- [ ] The audit is documented in a format that serves as an implementation checklist for subsequent API error message migration tasks
- [ ] Frontend error handling code is reviewed to understand how API errors are currently processed and displayed to inform the standardization approach
- [ ] The proposed error response structure is validated against frontend requirements to ensure all necessary information for localized error display is included

### Technical Notes
This audit is foundational for enabling fully localized error handling throughout the application. The standardized error response structure should balance frontend needs for localization with backend needs for debugging and monitoring. Consider that some error messages may need to differ between development and production environments for security reasons. The audit should identify whether a custom error class or utility function would simplify implementing the standardized approach across all routes. Pay special attention to validation errors from Zod schemas, Supabase errors, and authentication flows as these are common sources of user-facing errors. The resulting documentation should enable systematic migration of API error handling in subsequent implementation tasks.


---

## REQ-351: Create Centralized Error Message Utility

**Date**: 2026-01-19 23:55
**Type**: NEW FEATURE
**Size**: M

### Summary
The application should provide a centralized utility for handling error messages that integrates with the translation system, ensuring consistent error formatting and localization across all components and API endpoints.

### Current Behavior
Error messages are handled inconsistently throughout the application with components directly rendering error text, hardcoded strings appearing in try-catch blocks, and varying approaches to displaying validation failures. When errors occur, some components show technical error messages, others display generic feedback, and internationalization is not applied to error scenarios. Error handling logic is duplicated across components and API routes, making it difficult to ensure consistent user experience during failure scenarios or to update error messaging globally.

### Expected Behavior
A centralized error utility provides standardized functions for formatting, localizing, and displaying error messages throughout the application. The utility accepts error codes or error objects and returns properly translated messages in the user's preferred language, with support for message interpolation when dynamic values need to be included. Components and API routes use this utility to ensure all error messages are translated, consistently formatted, and provide appropriate detail based on error type and context. The utility handles common error scenarios like validation failures, authentication errors, network issues, and server errors with predefined message mappings.

### User Impact
Users receive clear, consistently formatted error messages in their preferred language whenever operations fail. Instead of seeing technical errors like "TypeError: Cannot read property" or inconsistent English messages, users see helpful, localized feedback such as "No se pudo cargar el artículo" in Spanish or "Impossible de charger l'article" in French. Error messages provide appropriate context and guidance for resolution while maintaining a professional tone across all failure scenarios.

### Business Value
Centralized error message handling reduces development time by eliminating duplicate error handling code and providing reusable utilities for common scenarios. Consistent, localized error messages improve user experience during failures, reducing frustration and support costs. The utility ensures no English error messages leak through in non-English locales, maintaining the quality and completeness of the internationalization effort across the entire application.

### Acceptance Criteria
- [ ] A new utility module is created for centralized error message handling
- [ ] The utility exports a function that accepts error codes or error objects and returns localized error messages
- [ ] Message interpolation is supported for errors that include dynamic values like field names, limits, or resource identifiers
- [ ] The utility integrates with the translation system to retrieve messages from the errors namespace
- [ ] Fallback behavior is implemented for unknown error codes, providing a generic localized error message
- [ ] The utility handles different error types including validation errors, API errors, network errors, and client-side errors
- [ ] A mapping is provided for common HTTP status codes to appropriate error message keys
- [ ] The utility supports field-specific error messages for form validation scenarios
- [ ] Error severity levels are supported to enable different display treatments for warnings, errors, and critical failures
- [ ] The utility provides a function for formatting API error responses into standardized structures
- [ ] Client-side components can use the utility to display localized error messages from API responses
- [ ] The utility handles arrays of errors for scenarios like bulk validation failures or multiple field errors
- [ ] TypeScript types are provided for error codes, error objects, and utility function parameters
- [ ] The utility includes helper functions for common patterns like extracting error messages from caught exceptions
- [ ] Documentation is provided with usage examples for components, API routes, and error boundaries
- [ ] The utility handles nested error objects from third-party services like Supabase
- [ ] Error messages maintain consistent tone, avoiding technical jargon while providing sufficient detail
- [ ] The utility is framework-agnostic, working in both server-side API routes and client-side React components
- [ ] A comprehensive set of predefined error codes is established covering authentication, validation, authorization, resource operations, and system errors
- [ ] The utility exports constants for error codes to ensure type safety and prevent typos
- [ ] Unit tests verify error message localization, interpolation, fallback behavior, and error type handling
- [ ] The utility integrates with existing logging and monitoring to ensure errors are tracked appropriately
- [ ] Performance is optimized to avoid overhead when handling multiple errors simultaneously
- [ ] The utility is exported from the main types index for convenient importing throughout the application

### Technical Notes
This utility serves as the foundation for standardizing error handling across the application. Consider creating separate functions for client-side error display and API error response formatting to address the different requirements of each context. The utility should work seamlessly with React Hook Form for form validation errors, with toast notifications for user feedback, and with Next.js API routes for server-side error responses. Ensure the utility can extract error information from various error types including Error objects, Supabase PostgrestError objects, and custom application errors. The predefined error code constants should align with the errors namespace structure in translation files to maintain consistency between code and translations.



---

## REQ-352: Update Zod Schemas to Use Translated Messages

**Date**: 2026-01-19 23:58
**Type**: ENHANCEMENT
**Size**: L

### Summary
All Zod validation schemas throughout the application should use translated error messages instead of hardcoded English strings, ensuring form validation feedback appears in the user's preferred language.

### Current Behavior
Zod validation schemas define error messages as hardcoded English strings directly in the schema definitions. When form validation fails, users see English error messages like "Email is required," "Password must be at least 8 characters," or "Invalid URL format" regardless of their language preference. Validation schemas are defined throughout the codebase for forms handling user registration, login, item creation, article editing, link management, and administrative operations, all returning English-only feedback when validation rules are violated.

### Expected Behavior
Zod schemas integrate with the translation system to provide localized validation error messages. When validation fails, error messages appear in the user's preferred language, displaying "E-Mail ist erforderlich" for German users or "El correo electrónico es obligatorio" for Spanish users. Validation messages reference translation keys from the errors.validation namespace rather than containing hardcoded strings, allowing centralized management of validation message text and translations. Custom error messages in Zod schemas use the message parameter to specify translation keys that the centralized error utility resolves to localized text.

### User Impact
Users receive all form validation feedback in their preferred language, creating a consistent localized experience throughout form interactions. Validation errors for required fields, format requirements, length constraints, and business rule violations all appear in the language the user selected. This maintains the professional quality of the internationalized interface during error scenarios and ensures users can understand validation requirements regardless of their language preference.

### Business Value
Translating Zod validation messages completes the form internationalization effort, eliminating a critical gap where English error messages would otherwise appear in non-English interfaces. Centralized translation key management for validation messages enables consistent messaging across all forms and simplifies updates to validation feedback text. This enhancement ensures the application provides a fully localized experience that meets user expectations for international software products.

### Acceptance Criteria
- [ ] All files containing Zod schema definitions are identified across authentication forms, item management, article creation, link management, tag operations, user profile updates, and administrative forms
- [ ] Each Zod schema is reviewed to identify all custom error messages defined using the message parameter
- [ ] Common validation error types are cataloged including required field errors, string length constraints, email format validation, URL format validation, number range constraints, enum value restrictions, and custom business rule validations
- [ ] A standard approach is established for integrating translation keys into Zod schemas while maintaining type safety and schema composability
- [ ] Translation keys are defined in the errors.validation namespace for all identified validation error scenarios
- [ ] Required field errors use translation keys like "errors.validation.required" with field name interpolation support
- [ ] String length constraints use keys like "errors.validation.min_length" and "errors.validation.max_length" with dynamic length value interpolation
- [ ] Format validation errors use keys like "errors.validation.invalid_email" or "errors.validation.invalid_url" for common patterns
- [ ] Custom business rule validations use specific keys like "errors.validation.duplicate_email" or "errors.validation.tag_already_exists"
- [ ] Schema definitions are updated to reference translation keys instead of hardcoded English strings
- [ ] A utility function or pattern is established for accessing translations within Zod schema contexts where the next-intl hook may not be directly available
- [ ] Server-side validation schemas in API routes integrate with the translation system for consistent error responses
- [ ] Client-side validation schemas in form components work seamlessly with React Hook Form to display localized errors
- [ ] Zod schemas that use refine() for complex validation logic integrate translation keys for custom error messages
- [ ] Array and object validation schemas properly localize nested field error messages
- [ ] Conditional validation logic maintains proper error message localization across all conditional branches
- [ ] Validation error messages that include dynamic values like minimum length, maximum length, or allowed values support message interpolation
- [ ] Field-specific validation messages are distinguished from general schema-level errors to enable proper form field highlighting
- [ ] Common validation patterns are abstracted into reusable schema components that reference translation keys
- [ ] All validation schemas maintain backward compatibility with existing form implementations during the migration
- [ ] TypeScript types for schema validation errors properly reflect the translation key structure
- [ ] The centralized error message utility integrates seamlessly with Zod validation error objects
- [ ] Documentation is provided showing how to define new Zod schemas with translated error messages
- [ ] Examples are provided for common patterns like required strings, optional fields, email validation, URL validation, and custom refinements
- [ ] All existing forms are tested in each supported language to verify validation messages appear correctly localized
- [ ] Validation message translations are added to all five non-English language files with appropriate phrasing and tone for each locale
- [ ] Unit tests verify that validation schemas produce expected localized error messages in different language contexts
- [ ] Performance impact of integrating translations into validation schemas is measured and optimized if necessary
- [ ] The approach handles server-side rendering contexts where language preference must be determined from request context
- [ ] Edge cases are addressed such as missing translations, unsupported languages, and validation errors occurring during language switching

### Technical Notes
Integrating translations into Zod schemas requires careful consideration of where translation context is available. Server-side validation in API routes may need to determine language from request headers or user preferences, while client-side validation can use React context. Consider creating a factory function that accepts a translation function and returns configured Zod schemas, enabling reuse of schema logic across different contexts. The solution should not significantly increase bundle size or validation performance overhead. Ensure the approach works with Zod's type inference to maintain strong typing of validated data. Pay special attention to validation schemas used in both server and client contexts to ensure consistent error message localization. This task builds on the centralized error message utility (REQ-351) and should leverage that infrastructure for resolving translation keys to localized messages.


---

## REQ-353: Update Error Boundaries with Translations

**Date**: 2026-01-19 (created by FA)
**Type**: ENHANCEMENT
**Size**: S

### Summary
Error boundary components must display localized error messages that match the user's selected language instead of showing hardcoded English text.

### Current Behavior
When an unexpected error occurs in the application, error boundary components display error messages, fallback UI text, and recovery options in English only, regardless of the user's language preference.

### Expected Behavior
When an error is caught by an error boundary, all displayed text (error titles, descriptions, recovery instructions, and action buttons) appears in the user's currently selected language using the translation system.

### User Impact
All users who prefer non-English languages will see error messages in their chosen language, making error states understandable and recovery actions clearer. This improves the user experience during failure scenarios and maintains consistency with the rest of the localized interface.

### Business Value
Completing error message localization ensures a fully internationalized application where even failure states respect user language preferences, demonstrating attention to detail and commitment to the global user experience.

### Acceptance Criteria
- [ ] All error boundary components retrieve and use translations for displayed text
- [ ] Error titles, descriptions, and instructions appear in the user's selected language
- [ ] Action buttons (reload, go home, try again, etc.) display translated labels
- [ ] Fallback behavior gracefully handles missing translations by showing English as default
- [ ] Error boundaries work correctly in both authenticated and guest contexts
- [ ] No hardcoded English strings remain in error boundary components



---

## REQ-354: Generate Translations for Error Messages and Validation Strings in Five Non-English Languages

**Date**: 2026-01-19 23:59
**Type**: ENHANCEMENT
**Size**: M

### Summary
Generate accurate, professionally-worded translations for all error messages and form validation strings across the five non-English languages to complete the localization of error handling and validation feedback.

### Current Behavior
Translation files contain the errors and validation namespace structure with English source text, but non-English language files either lack these translations entirely or contain placeholder English text. When validation errors occur or error messages display, users who select Spanish, French, German, Italian, or Dutch see English error messages because the corresponding translation keys have not been populated with properly translated content.

### Expected Behavior
All error message keys and validation string keys defined in the errors namespace contain professionally translated, culturally appropriate text in Spanish, French, German, Italian, and Dutch. When a validation rule is violated or an error occurs, the user sees error feedback in their selected language with appropriate tone, formality level, and technical terminology for that locale. Validation messages use proper grammar for describing requirements, constraints, and rule violations in each target language. Error messages maintain consistent severity indicators and actionability across all languages.

### User Impact
Users operating the application in non-English languages receive clear, understandable error feedback and validation messages in their preferred language. Form validation becomes more accessible as users immediately understand what corrections are needed without mentally translating English messages. Error scenarios become less frustrating as users can comprehend error descriptions and recovery instructions in their native language. The application maintains professional quality and credibility during error states across all supported languages.

### Business Value
Completing validation and error message translations eliminates a critical gap that would undermine the entire localization effort by exposing English text during crucial user interactions. Professional error message translations reduce support burden by enabling users to self-diagnose and correct input errors without language barriers. This deliverable demonstrates commitment to serving international users beyond just translating the happy path, addressing error scenarios that significantly impact user experience and satisfaction.

### Acceptance Criteria
- [ ] The errors.validation namespace is fully translated into Spanish including required field messages, length constraints, format validations, and custom business rule violations
- [ ] The errors.validation namespace is fully translated into French with grammatically correct error descriptions and appropriate formality level
- [ ] The errors.validation namespace is fully translated into German with proper compound noun usage and error message structure conventions
- [ ] The errors.validation namespace is fully translated into Italian with culturally appropriate error message tone and technical terminology
- [ ] The errors.validation namespace is fully translated into Dutch with clear validation requirement descriptions and constraint explanations
- [ ] The errors.api namespace is translated into all five languages covering authentication errors, authorization failures, resource not found messages, server errors, and network issues
- [ ] The errors.form namespace is translated for all five languages including submission failures, timeout errors, and data persistence issues
- [ ] Generic error messages covering unexpected errors, boundary errors, and fallback scenarios are translated across all five target languages
- [ ] Required field error messages maintain consistency with field label translations defined elsewhere in the translation files
- [ ] String length constraint messages properly interpolate minimum and maximum values using each language's numeric formatting conventions
- [ ] Email format validation errors use appropriate technical terminology for email addresses in each target language
- [ ] URL format validation errors describe web addresses using locale-appropriate technical terms
- [ ] Date and time validation errors reference date formats familiar to users of each target language
- [ ] Numeric range validation errors express minimum and maximum values according to each locale's number formatting standards
- [ ] Enum validation errors listing allowed values present those values in a grammatically correct list format for each language
- [ ] Custom business rule validation messages maintain appropriate tone for addressing rule violations in each culture
- [ ] API authentication error messages describe login failures, session expiration, and credential issues clearly in each language
- [ ] API authorization error messages explain permission requirements and access restrictions appropriately for each locale
- [ ] Resource not found error messages help users understand what went wrong without technical jargon that might not translate well
- [ ] Server error messages balance technical accuracy with user-friendly language appropriate for each culture
- [ ] Network error messages describe connectivity issues clearly while avoiding overly technical terminology
- [ ] Form submission error messages guide users toward resolution using action-oriented language natural to each target language
- [ ] Timeout error messages explain what happened and what users should do next in each language
- [ ] Data persistence error messages communicate save failures clearly with appropriate urgency for each culture
- [ ] Unexpected error messages maintain professional tone while apologizing appropriately for each cultural context
- [ ] Error boundary fallback messages provide recovery instructions using imperative grammar natural to each target language
- [ ] All translated error messages have been reviewed by native speakers or professional translators to ensure quality
- [ ] Error message translations maintain consistent voice and tone with the rest of the application's translated content
- [ ] Placeholder values in error messages (field names, numbers, dates) are properly formatted according to locale conventions when interpolated
- [ ] Translation keys that include technical terms ensure those terms are translated consistently across all error message contexts
- [ ] Severity indicators in error messages (warning, error, critical) are communicated with culturally appropriate urgency levels
- [ ] Error messages that recommend specific actions use imperative verb forms appropriate for each target language
- [ ] Validation messages for complex fields like passwords balance security requirement communication with user-friendly language
- [ ] Error messages are concise enough to fit in typical UI error display areas across all languages despite varying text length
- [ ] All five language files have identical key structures in the errors namespace with no missing translations
- [ ] Translation content passes automated checks for proper JSON structure, escaped characters, and interpolation syntax
- [ ] Sample forms and error scenarios are tested in each language to verify error messages display correctly and make sense in context
- [ ] Documentation notes any cultural considerations or alternative phrasings that translators considered during the translation process

### Technical Notes
This task represents the actual content creation phase following the structural work of defining error namespaces and integrating translation keys into validation schemas. The translations should be generated using professional translation services, AI-assisted translation with native speaker review, or qualified human translators familiar with software localization. Pay particular attention to validation messages that include dynamic content through interpolation, ensuring placeholder syntax is preserved exactly while the surrounding text is properly translated. Consider the character length of translations as some languages may produce significantly longer text than English, potentially affecting UI layout in error display components. The tone and formality level of error messages should be consistent with the overall voice established in the common namespace translations. For technical errors, balance precision with accessibility, avoiding overly technical terms unless they are standard in the target language's software domain. This deliverable depends on the errors namespace structure (REQ-315), the audit of validation messages (REQ-316), the audit of API errors (REQ-317), and should align with the centralized error utility approach (REQ-318).



---

## REQ-355: Create Auth Namespace Structure in Translation Files

**Date**: 2026-01-19 05:02
**Type**: ENHANCEMENT
**Size**: S

### Summary
Translation files must include a comprehensive auth namespace containing all authentication and registration UI strings to support fully localized login, signup, password reset, and email verification experiences.

### Current Behavior
Translation files contain a basic auth namespace with core authentication labels, but lack the complete vocabulary needed for the full authentication and registration user journey including error states, success messages, form instructions, help text, and workflow-specific prompts.

### Expected Behavior
Each language translation file contains a well-organized auth namespace with keys covering all authentication scenarios: login forms, registration flows, password reset processes, email verification, OAuth authentication, session management messages, and authentication-related errors and confirmations. The structure accommodates both simple labels and complete sentences for instructions and feedback.

### User Impact
Users navigating authentication and registration workflows will encounter fully localized text that guides them through account creation, login, password recovery, and email verification in their preferred language, creating a welcoming and accessible first impression of the application.

### Business Value
Providing comprehensive authentication localization removes language barriers at the critical first interaction with the platform, improving conversion rates for international users and demonstrating commitment to serving a global audience from the very first touchpoint.

### Acceptance Criteria
- [ ] Auth namespace includes all form labels for email, password, name, and other registration fields
- [ ] Auth namespace contains button labels for sign in, sign up, reset password, verify email actions
- [ ] Auth namespace includes help text and instructions for password requirements and account creation
- [ ] Auth namespace contains OAuth provider labels for Google and other social authentication options
- [ ] Auth namespace includes error messages specific to authentication failures
- [ ] Auth namespace contains success messages for registration completion and password reset
- [ ] Auth namespace includes page titles and headings for login, registration, and password reset flows
- [ ] Auth namespace structure is consistent across all six supported language files
- [ ] All keys use clear, descriptive names that indicate their usage context
- [ ] English version serves as the source of truth with complete, well-written copy


---

## REQ-356: Update Login Page Content Component for Internationalization

**Date**: 2026-01-19 10:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The login page component should display all text content in the user's preferred language by replacing hardcoded English strings with translation keys from the auth namespace.

### Current Behavior
The LoginPageContent component contains numerous hardcoded English text strings including page headings, authentication status messages, loading indicators, security notices, footer links, and copyright information. All text appears only in English regardless of user language preference. The component uses literal strings embedded directly in JSX markup and JavaScript logic for messages like "Sign in to your account", "Loading authentication...", "Secure Access", and others. Users visiting the login page see English text even if they have selected a different language preference.

### Expected Behavior
When users visit the login page, all visible text appears in their preferred language. Page headings, subheadings, authentication status messages, loading states, success confirmations, security notices, footer links, and copyright information are all retrieved from translation keys in the auth namespace. The component uses the translation function to render all text content dynamically based on the active locale. Messages displayed during OAuth flows, authentication state transitions, and error conditions appear in the user's selected language. The login experience is fully localized from first visit through successful authentication.

### User Impact
International users encounter a fully localized login experience in their native language, improving comprehension of authentication requirements and security information. Non-English speakers understand loading states, authentication progress messages, and security notices without language barriers. All users benefit from consistent terminology between the login page and other authentication flows throughout the application. A localized login page creates a professional first impression for international visitors and reduces confusion during the critical authentication process.

### Business Value
Localizing the login page is essential for international market expansion, as it represents the first interaction many users have with the application. A login page that speaks the user's language significantly improves conversion rates for new user registration and reduces abandonment during authentication. This work eliminates a major barrier to entry for non-English speaking users and demonstrates the application's commitment to international accessibility. Proper translation of security notices and authentication messages reduces support requests and builds user trust in international markets.

### Acceptance Criteria
- [ ] All hardcoded text strings in LoginPageContent component are identified and catalogued
- [ ] Page title and subtitle text use translation keys from the auth namespace
- [ ] Brand name and tagline text are internationalized where appropriate
- [ ] Loading state messages including authentication progress indicators use translation keys
- [ ] Success confirmation messages are extracted to translation keys
- [ ] OAuth flow messages including Google sign-in progress use translation keys
- [ ] Security notice title and description text are internationalized
- [ ] Footer link text including navigation links and action buttons use translation keys
- [ ] Copyright notice uses a translation key with dynamic year parameter if needed
- [ ] All message alert content including error, success, and info messages supports translation
- [ ] Debug messages visible to users are internationalized where appropriate or removed from production
- [ ] Translation keys follow the established auth namespace structure and naming conventions
- [ ] Component imports and uses the translation function from next-intl
- [ ] All authentication flows continue to function correctly after internationalization
- [ ] The component maintains existing styling, layout, and responsive behavior
- [ ] Accessibility attributes that reference text content are properly maintained with translated values


---

## REQ-357: Update Registration Form Component for Internationalization

**Date**: 2026-01-19 15:42
**Type**: ENHANCEMENT
**Size**: L

### Summary
The registration form should display all user-facing text in the user's selected language instead of English-only hardcoded strings.

### Current Behavior
The RegistrationForm component contains hardcoded English text for all user interface elements including form labels, placeholder text, validation messages, button labels, error messages, password strength indicators, help text, and informational messages. Users cannot view the registration process in their preferred language.

### Expected Behavior
All user-visible text in the registration form appears in the user's selected language. This includes field labels, placeholders, validation error messages, button text, loading states, password strength feedback, registration method selection labels, OAuth flow messages, terms and conditions text, and all other UI strings. The component uses the translation system to fetch appropriate strings based on the active locale.

### User Impact
Users registering for an account can complete the registration process in their preferred language, making the signup experience accessible to non-English speakers. This affects all new users during their first interaction with the platform.

### Business Value
Removing language barriers during registration increases signup conversion rates for international users and demonstrates platform accessibility from the first user touchpoint.

### Acceptance Criteria
- [ ] All form field labels appear in the selected language
- [ ] All placeholder text reflects the selected language
- [ ] All validation error messages display in the selected language
- [ ] Button text and loading states appear in the selected language
- [ ] Password strength indicators and feedback show in the selected language
- [ ] Registration method selection labels and descriptions appear in the selected language
- [ ] OAuth flow messages display in the selected language
- [ ] Terms and conditions text appears in the selected language
- [ ] Help text and informational messages show in the selected language
- [ ] Error messages from form submission appear in the selected language
- [ ] All conditional UI text based on email domain displays in the selected language
- [ ] Success and confirmation messages appear in the selected language


---

## REQ-358: Update Google OAuth Button Component for Internationalization

**Date**: 2026-01-19 17:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
The Google OAuth authentication button should display all text content in the user's preferred language by replacing hardcoded English strings with translation keys from the auth namespace.

### Current Behavior
The GoogleOAuthButton component contains hardcoded English text strings for button labels, loading states, error messages, and accessibility attributes. The button displays "Continue with Google" as its primary label and "Connecting to Google..." during the loading state. Rate limiting error messages appear only in English with the format "Too many authentication attempts. Please try again in X minutes." The aria-label accessibility attribute contains the hardcoded English text "Continue with Google." Users see this English-only content regardless of their selected language preference.

### Expected Behavior
When users encounter the Google OAuth button on authentication pages, all visible text and accessibility attributes appear in their preferred language. The button label displays the localized equivalent of "Continue with Google" retrieved from the auth namespace. During authentication processing, users see a localized loading message indicating the connection is in progress. If rate limiting triggers, users receive error messages explaining the restriction and wait time in their selected language with properly formatted time values according to locale conventions. Screen readers announce the button's purpose in the user's language through the localized aria-label. All error messages passed through the onAuthError callback maintain the user's selected language.

### User Impact
International users interacting with Google OAuth authentication see familiar, native-language instructions and feedback throughout the OAuth flow. Non-English speakers clearly understand the purpose of the authentication button and any error conditions that occur. Users relying on screen readers receive properly localized accessibility information. All users benefit from consistent language throughout the authentication experience, from initial button presentation through completion or error states.

### Business Value
Localizing OAuth authentication buttons reduces friction in the critical authentication process for international users, directly improving signup and login conversion rates. Since Google OAuth is often the preferred authentication method for users, presenting it in the user's native language removes a significant barrier to platform entry. This work ensures language consistency across all authentication methods, reinforcing the application's commitment to international accessibility from the first user interaction.

### Acceptance Criteria
- [ ] Button label text "Continue with Google" uses a translation key from the auth namespace
- [ ] Loading state text "Connecting to Google..." uses a translation key from the auth namespace
- [ ] Rate limiting error message is extracted to a translation key with support for dynamic minute value interpolation
- [ ] Rate limiting error message formats the time value according to locale conventions
- [ ] Generic error message "An unexpected error occurred" uses a translation key from the auth namespace
- [ ] The aria-label attribute value is derived from a translation key
- [ ] Component imports and correctly uses the translation function from next-intl
- [ ] All OAuth authentication flows continue to function correctly after internationalization
- [ ] The button maintains existing styling, layout, and visual presentation
- [ ] Error callbacks receive properly formatted localized error messages
- [ ] Translation keys follow the established auth namespace structure and naming conventions
- [ ] The component remains accessible to screen readers with properly localized announcements


---

## REQ-359: Update Registration Page Root Component for Internationalization

**Date**: 2026-01-19 18:30
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The registration page root component should display its loading state message in the user's selected language instead of hardcoded English text.

### Current Behavior
The registration page root component at `/src/app/register/page.tsx` contains a Suspense fallback that displays a loading spinner with the hardcoded English message "Loading registration page..." while the main registration content loads. This loading state appears only in English regardless of the user's language preference. The component wraps the RegistrationPageContent component in a Suspense boundary but provides no localized feedback during the loading phase.

### Expected Behavior
When users navigate to the registration page, any loading state that appears while the main content loads displays in their preferred language. The Suspense fallback component retrieves the loading message from the translation system using the appropriate locale. Users see consistent language throughout the entire registration experience from the moment the page begins loading through completion. The loading message follows the same internationalization pattern as other authentication flow loading states.

### User Impact
Users experience consistent language from the very first moment of page interaction, including transient loading states. Non-English speakers see familiar loading messages in their native language rather than encountering unexpected English text during page transitions. The registration flow feels cohesive and professional with no language switching between loading and loaded states.

### Business Value
Completing internationalization of even brief loading states demonstrates attention to detail in the localization effort and prevents jarring language switches that could undermine user confidence. This small touch contributes to the overall perception of a fully internationalized platform and removes the last English-only elements from the registration entry point.

### Acceptance Criteria
- [ ] The loading message "Loading registration page..." is extracted to a translation key
- [ ] The RegistrationPageFallback component imports and uses the useTranslations hook from next-intl
- [ ] The translation key is added to the auth.register namespace in all language files
- [ ] The loading message displays in the user's selected language
- [ ] The Suspense boundary continues to function correctly with the translated content
- [ ] TypeScript compilation succeeds with no errors related to translation keys
- [ ] The component maintains existing styling, layout, and spinner animation
- [ ] No console errors appear related to missing translation keys



---

## REQ-360: Update Registration Success Page for Internationalization

**Date**: 2026-01-19 19:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
The registration success page should display all success messages, status information, call-to-action buttons, and notification text in the user's selected language instead of hardcoded English strings.

### Current Behavior
The registration success page contains hardcoded English text throughout the entire component including the page subtitle "Registration Complete," the main heading "Registration Successful!," various status messages depending on authentication state, account setup confirmation details, button labels, and auto-redirect notices. The page displays different content paths: for OAuth users it shows "Your account has been created successfully with Google OAuth. You will be redirected to the dashboard shortly" with automatic dashboard redirect messaging, while non-authenticated users see "Your account has been created successfully. You can now log in to access all FAQBNB features" with login redirect messaging. The "Account Setup Complete" section lists four hardcoded items describing what was created during registration. All button labels including "Go to Dashboard," "Continue to Login," and "Back to Home" are in English only. Error states display English messages like "Automatic login failed. Please use the manual login button." Auto-redirect notices inform users in English about timing with messages such as "You will be automatically redirected to the dashboard in 2 seconds" or "You will be automatically redirected to the login page in 5 seconds." None of this content adapts to the user's language preference.

### Expected Behavior
When users reach the registration success page after completing signup, all text content appears in their preferred language. The page subtitle and main success heading display localized versions of the celebratory confirmation message. Status messages adapt to show OAuth success or traditional registration success text in the user's language. The account setup summary section displays all four confirmation items in translated form. Loading states show localized spinner text like "Logging you in automatically..." in the appropriate language. Error messages for failed auto-login attempts appear in the user's language. All call-to-action buttons display translated labels appropriate to the user's authentication state. Auto-redirect timing notices inform users in their selected language about upcoming page transitions with properly formatted time values. The component uses the translation system to retrieve all UI strings based on the active locale while maintaining all existing functionality for OAuth and non-OAuth registration paths.

### User Impact
Users completing registration see confirmation and next-step guidance in their native language, providing a smooth transition from the localized registration form to post-registration actions. Non-English speakers clearly understand that registration succeeded, what was set up in their account, and what actions are available or will happen automatically. International users experience consistent language throughout the entire registration journey from initial form through final confirmation. Users with different authentication paths (OAuth versus traditional) receive appropriate guidance in their language.

### Business Value
Completing the localization of the registration success page ensures the entire signup funnel provides a consistent language experience from start to finish. This prevents drop-off that could occur if users successfully register but encounter confusing English-only confirmation screens. Localized success messaging and clear next-step buttons in the user's language improve activation rates by making post-registration navigation obvious. This touchpoint reinforces the platform's international accessibility commitment immediately after a user's first major interaction.

### Acceptance Criteria
- [ ] The page subtitle "Registration Complete" uses a translation key from the auth namespace
- [ ] The main heading "Registration Successful!" uses a translation key from the auth namespace
- [ ] OAuth success message uses a translation key with proper handling of dynamic dashboard redirect text
- [ ] Traditional registration success message uses a translation key
- [ ] Auto-login loading message "Logging you in automatically..." uses a translation key
- [ ] Auto-login error message uses a translation key
- [ ] "Account Setup Complete:" heading uses a translation key
- [ ] All four account setup confirmation items use translation keys from the auth namespace
- [ ] "Go to Dashboard" button label uses a translation key
- [ ] "Continue to Login" button label uses a translation key
- [ ] "Back to Home" button label uses a translation key
- [ ] OAuth auto-redirect notice with timing uses a translation key supporting dynamic time value
- [ ] Traditional auto-redirect notice with timing uses a translation key supporting dynamic time value
- [ ] Auto-login progress notice uses a translation key
- [ ] Auto-login failure notice uses a translation key
- [ ] Component imports and correctly uses the useTranslations hook from next-intl
- [ ] All success page flows continue to function correctly for both OAuth and traditional registration
- [ ] Auto-redirect timers work correctly with translated content
- [ ] The component maintains existing styling, layout, and visual presentation
- [ ] Translation keys follow the established auth namespace structure and naming conventions
- [ ] TypeScript compilation succeeds with no errors related to translation keys
- [ ] No console errors appear related to missing translation keys



---

## REQ-361: Update Registration Complete Page for Internationalization

**Date**: 2026-01-19 11:51
**Type**: ENHANCEMENT
**Size**: M

### Summary
The registration complete page should display all user-facing text in the user's selected language instead of hardcoded English strings, including headers, informational messages, form labels, error messages, success states, and navigation links.

### Current Behavior
The registration complete page contains hardcoded English text throughout the entire component including page titles, subtitle text "Complete Registration," header text "Almost there!," instructional messages, info banners, form labels, button text, error messages, success confirmations, and footer links. The page displays "Your Google sign-in was successful, but we need an access code to complete your registration" as hardcoded English text. The info banner shows "Signed in as:" followed by the email address with "Enter your access code to complete account setup." The access code form field has an English label, placeholder "Enter your access code," and helper text "Check your email for the access code from your invitation." Button labels include "Complete Registration" and "Completing Registration..." for loading states. The sign-out section displays "Wrong account? Sign out and try again." Error messages appear in English only. The success state shows "Registration Complete!" with "Your account has been set up successfully" and "Redirecting to dashboard..." Footer links display "Back to Home" and "Request Access Code" in English. Loading state messages like "Loading..." and "Checking authentication..." are hardcoded. None of this content adapts to the user's language preference.

### Expected Behavior
When users reach the registration complete page after OAuth authentication, all text content appears in their preferred language. The page title "Complete Registration" displays in the user's selected language. The main heading "Almost there!" and instructional paragraph about needing an access code appear localized. The info banner with "Signed in as:" and setup instructions shows translated text. The access code form displays a localized field label, placeholder text, and helper text in the appropriate language. Submit button labels for both normal and loading states appear translated. The sign-out section prompt displays in the user's language. Error messages for invalid codes or failed registration attempts appear localized with clear explanations. The success state displays translated confirmation text including the heading, success message, and redirect notice. Footer navigation links show translated labels. All loading states display localized messages including initial page loading and authentication checking. The component uses the translation system to retrieve all UI strings based on the active locale while maintaining all existing OAuth completion functionality, form validation, and redirect behaviors.

### User Impact
Users completing OAuth registration who need to enter an access code see all instructions and feedback in their native language, making the completion process clear and accessible to non-English speakers. International users understand the purpose of the access code requirement through localized explanations. Error messages appear in the user's language, helping them understand what went wrong and how to proceed. Success confirmation and redirect notices appear localized, providing clear feedback about account completion. Users experience consistent language throughout the entire OAuth registration flow from initial authentication through final account setup.

### Business Value
Localizing the registration complete page ensures the entire OAuth signup funnel provides a consistent language experience, preventing confusion or drop-off at this critical completion step. Since this page handles "orphaned" OAuth users who need to complete registration, clear localized instructions maximize successful completion rates. This page is essential for converting OAuth authentications into fully registered accounts, making language accessibility directly impact conversion metrics. Localized error messages and guidance reduce support requests from international users confused by English-only completion instructions.

### Acceptance Criteria
- [ ] The page subtitle "Complete Registration" uses a translation key from the auth namespace
- [ ] The main heading "Almost there!" uses a translation key from the auth namespace
- [ ] The instructional paragraph about Google sign-in and access code requirement uses a translation key
- [ ] The info banner "Signed in as:" label uses a translation key
- [ ] The info banner helper text about entering access code uses a translation key
- [ ] The access code form field label uses a translation key
- [ ] The access code input placeholder text uses a translation key
- [ ] The access code helper text about checking email uses a translation key
- [ ] The submit button label "Complete Registration" uses a translation key
- [ ] The loading state button text "Completing Registration..." uses a translation key
- [ ] The sign-out section prompt "Wrong account? Sign out and try again." uses a translation key
- [ ] The "Sign Out" button label uses a translation key
- [ ] Error messages for invalid access codes use translation keys with support for dynamic error details
- [ ] Success state heading "Registration Complete!" uses a translation key
- [ ] Success state message about account setup uses a translation key
- [ ] Success state redirect notice "Redirecting to dashboard..." uses a translation key
- [ ] Footer link "Back to Home" uses a translation key
- [ ] Footer link "Request Access Code" uses a translation key
- [ ] Footer copyright text uses a translation key with dynamic year value
- [ ] Loading state message "Loading..." uses a translation key from the common namespace
- [ ] Authentication checking message "Checking authentication..." uses a translation key
- [ ] Component imports and correctly uses the useTranslations hook from next-intl
- [ ] All OAuth completion flows continue to function correctly
- [ ] Form validation and submission work correctly with translated content
- [ ] Dashboard redirect after successful completion works as expected
- [ ] Login redirect for unauthenticated users works correctly
- [ ] The component maintains existing styling, layout, and visual presentation
- [ ] Translation keys follow the established auth namespace structure and naming conventions
- [ ] TypeScript compilation succeeds with no errors related to translation keys
- [ ] No console errors appear related to missing translation keys
- [ ] Alt text for the FAQBNB logo image uses a translation key if currently hardcoded


---

## REQ-362: Generate Translations for Authentication Namespace

**Date**: 2026-01-19 11:59
**Type**: ENHANCEMENT
**Size**: L

### Summary
All authentication and registration UI strings defined in the auth namespace must be translated into the five supported non-English languages to complete the internationalization of the authentication flows.

### Current Behavior
The messages/en.json file contains a complete auth namespace with all necessary translation keys for login, registration, OAuth authentication, password management, and account completion flows. However, the corresponding translation files for German (de.json), Spanish (es.json), French (fr.json), Italian (it.json), and Dutch (nl.json) contain only a basic subset of auth translations. Many auth-related strings added in recent internationalization tasks remain untranslated, including complex messages with dynamic values, multi-paragraph instructional text, error messages, success confirmations, status indicators, form validation feedback, button labels for various states, redirect notices with timing information, and account setup confirmation details. When users select a non-English language, any missing translations fall back to English text or display translation key placeholders, creating an inconsistent and unprofessional user experience. The authentication components have been updated to use translation keys via the t() function from next-intl, but without corresponding translations in all target languages, non-English users encounter a mix of their selected language and English throughout the authentication journey.

### Expected Behavior
All translation files for the five target languages contain complete, accurate, and contextually appropriate translations for every key in the auth namespace. German users see all authentication UI in proper German text. Spanish users experience the entire authentication flow in Spanish. French, Italian, and Dutch users similarly see their respective languages throughout login, registration, OAuth flows, password reset, and account completion screens. Dynamic message templates properly handle variable substitution in each language, maintaining grammatical correctness when values like email addresses, timeframes, or error details are inserted. Multi-paragraph instructions maintain natural reading flow in each language. Error messages communicate problems clearly and helpfully in the user's language. Success confirmations feel natural and celebratory in each language. Button labels accurately convey actions in each language's idiom. Time-sensitive notices about redirects use proper time formatting conventions for each locale. Technical terms like "OAuth," "dashboard," and "access code" are handled appropriately for each language, either translated when common practice dictates or preserved as recognizable technical terms. Formal versus informal address (tu/vous, du/Sie) is chosen appropriately for each language based on platform tone. Character limits and text expansion factors are considered to prevent UI overflow in languages that require more space than English. All translations maintain consistency with existing namespace translations for common elements like buttons, errors, and navigation.

### User Impact
Non-English speakers experience fully localized authentication flows without encountering English text or missing translations. German-speaking users register and log in using clear, grammatically correct German throughout every screen and message. Spanish, French, Italian, and Dutch speakers similarly experience seamless, professional authentication in their native languages. International users understand error messages, instructions, and system feedback without language barriers. Users selecting any of the six supported languages have equal access to clear, understandable authentication guidance. The authentication experience feels professionally designed for international audiences rather than appearing as an English-first product with incomplete translations. Users gain confidence in the platform's international support from their very first interaction during registration or login. Non-English speakers no longer need to decipher mixed-language interfaces or guess at the meaning of untranslated English strings during critical authentication moments.

### Business Value
Complete authentication localization removes a major barrier to international user acquisition and retention. Users abandoning registration or failing to complete login due to confusing mixed-language interfaces now successfully convert to active accounts. The platform can credibly market to German, Spanish, French, Italian, and Dutch speaking markets knowing the entire authentication experience is professionally localized. Support burden decreases as international users understand authentication flows without confusion or language barriers. The completed localization foundation enables future expansion to additional languages by establishing translation processes and quality standards. Investment in authentication component internationalization (tasks 2A.1-2A.8) delivers full value only when backed by complete translations, making this translation generation task critical to realizing the benefits of previous technical work. A fully localized authentication experience demonstrates commitment to international markets, building trust with users from the first touchpoint.

### Acceptance Criteria
- [ ] The German translation file (de.json) contains translations for all auth namespace keys present in en.json
- [ ] The Spanish translation file (es.json) contains translations for all auth namespace keys present in en.json
- [ ] The French translation file (fr.json) contains translations for all auth namespace keys present in en.json
- [ ] The Italian translation file (it.json) contains translations for all auth namespace keys present in en.json
- [ ] The Dutch translation file (nl.json) contains translations for all auth namespace keys present in en.json
- [ ] All translations are grammatically correct and contextually appropriate for authentication flows
- [ ] Dynamic message templates preserve variable placeholders in the correct positions for each language's grammar
- [ ] Multi-paragraph text maintains natural reading flow and appropriate paragraph breaks in each language
- [ ] Error messages are clear, helpful, and appropriately formal/informal for each language culture
- [ ] Button labels accurately convey actions using standard conventions for each language
- [ ] Time-related text uses appropriate temporal expressions for each language
- [ ] Technical terms are handled consistently across all translations
- [ ] Formal versus informal address is appropriate for platform tone in languages that distinguish (German, French, Spanish, Dutch, Italian)
- [ ] Text length and expansion factors are considered to prevent UI overflow
- [ ] Translations maintain terminology consistency with existing namespace translations
- [ ] Translation quality is verified by native speakers or professional translation services
- [ ] All JSON files remain valid JSON with proper encoding for special characters
- [ ] No translation keys are missing from any language file
- [ ] Testing with each language confirms no missing translation warnings in browser console
- [ ] Visual inspection of authentication flows in each language shows proper text display without overflow or truncation



---

## REQ-363: Test All Authentication Flows in Each Supported Language

**Date**: 2026-01-19 12:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
All authentication and registration flows must be systematically tested in each of the six supported languages to verify translations display correctly, form validations work properly, and the user experience remains consistent across all locales.

### Current Behavior
Authentication components have been internationalized and translations have been generated for all six supported languages, but comprehensive cross-language testing has not yet been performed. While individual components may have been spot-checked during development, there has been no systematic verification that the complete end-to-end authentication journey works correctly in German, Spanish, French, Italian, and Dutch. It is unknown whether all translation keys are properly connected, whether dynamic message substitution works across languages, whether form validation messages appear correctly in each locale, whether error handling displays appropriate translated feedback, or whether layout and formatting remain intact with varying text lengths across different languages. Edge cases such as language switching mid-flow, session handling across languages, and proper locale persistence through OAuth redirects have not been validated. Without comprehensive testing, there may be missing translations showing as key placeholders, broken layouts due to text overflow in languages with longer words, incorrect parameter substitution in dynamic messages, or inconsistent behavior between languages.

### Expected Behavior
Every authentication flow operates flawlessly in all six supported languages with consistent behavior and properly displayed translations. Testers systematically verify the login flow in English, German, Spanish, French, Italian, and Dutch, confirming that page titles, form labels, placeholders, button text, validation errors, authentication errors, and success messages all appear in the correct language. The registration flow is tested in all six languages, verifying that multi-step forms display translated content, password requirements appear localized, validation feedback shows in the user's language, terms and conditions text is translated, and success confirmations appear correctly. OAuth authentication flows are tested end-to-end in each language, ensuring that the OAuth initiation displays proper language, the return flow maintains language context, account completion steps show translated content, and success states appear localized. Password reset flows (if implemented) are tested across all languages. Error scenarios are deliberately triggered in each language to verify that network errors, validation failures, authentication denials, and system errors all display appropriate translated messages. Layout and formatting are inspected in each language to ensure no text overflow, no truncation of important information, no broken layouts from long German compound words or lengthy Spanish phrases, and proper alignment of form elements regardless of label length. Dynamic content such as email addresses in messages, countdown timers, and error details are verified to integrate correctly with surrounding translated text. Language switching is tested to ensure users can change languages and see immediate updates throughout authentication interfaces. Session management and locale persistence are validated through complete flows including page refreshes and OAuth redirects.

### User Impact
Users authenticating in any of the six supported languages experience a polished, professional authentication flow without encountering English text, missing translations, broken layouts, or language-specific bugs. German speakers confidently register and log in seeing clear, correct German throughout. Spanish, French, Italian, and Dutch speakers similarly experience seamless authentication in their native languages. International users trust the platform's localization quality from their first interaction. Users are not confused by mixed languages or translation placeholders. The authentication experience feels equally refined regardless of which of the six languages is selected.

### Business Value
Comprehensive testing validates the investment in authentication localization, ensuring international users have excellent first experiences. Bugs discovered and fixed before production launch prevent user confusion, support requests, and abandoned registrations from international markets. Testing provides confidence that the platform can be marketed to German, Spanish, French, Italian, and Dutch audiences with a quality authentication experience. Systematic verification establishes a testing methodology that can be applied to future localization efforts. Documented test results demonstrate localization quality to stakeholders and provide evidence of international market readiness.

### Acceptance Criteria
- [ ] A comprehensive test plan documenting all authentication flows, test scenarios, and verification points for each language has been created
- [ ] Login flow has been tested in all six languages verifying page load, form display, field labels, placeholders, button text, field validation messages, authentication error messages, success messages, and post-login redirects
- [ ] Registration flow has been tested in all six languages verifying multi-step form display, field labels and placeholders, password requirement text, validation error messages, terms acceptance text, submission button labels, loading states, success confirmation, and post-registration redirects
- [ ] OAuth authentication flow has been tested in all six languages verifying Google OAuth button text, OAuth initiation flow, OAuth callback handling, account completion page display, access code entry instructions, validation feedback, and success states
- [ ] Password reset flow has been tested in all six languages if implemented in the application
- [ ] Error scenarios have been deliberately triggered in each language including invalid credentials, missing required fields, password complexity failures, duplicate email addresses, network errors, and session expiration
- [ ] All error messages display properly translated, contextually appropriate text in each language
- [ ] Dynamic content integration has been verified including email addresses in confirmation messages, usernames in welcome text, countdown timers, and error detail substitution
- [ ] Layout and formatting have been visually inspected in each language confirming no text overflow, no truncation, no broken layouts, and proper alignment
- [ ] Language switching has been tested by changing language mid-flow and verifying immediate UI updates
- [ ] Session management has been verified including locale persistence through page refreshes, OAuth redirects, and authentication state changes
- [ ] Loading states display translated messages in each language
- [ ] Success states show properly translated confirmation text in each language
- [ ] Navigation between authentication pages maintains correct language context in all six languages
- [ ] Browser console shows no missing translation key warnings in any language
- [ ] All visible text elements throughout authentication flows display translated content with no English fallbacks or key placeholders in any non-English language
- [ ] Form functionality, validation logic, and authentication behavior operate identically across all six languages with no language-specific bugs
- [ ] Test results are documented including screenshots of key screens in each language and notes on any issues discovered and resolved



---

## REQ-364: Create Dashboard Namespace Structure in Translation Files

**Date**: 2026-01-19 14:32
**Type**: NEW FEATURE
**Size**: S

### Summary
A dedicated dashboard namespace must be created within all translation files to organize and manage UI strings specific to the dashboard interface, including page titles, section headings, navigation elements, empty states, and status indicators.

### Current Behavior
Translation files contain various namespace structures for authentication, common UI elements, and errors, but dashboard-specific strings are not yet organized into a dedicated namespace. Dashboard UI strings may be scattered across the common namespace or hardcoded directly in components. There is no centralized structure for managing translations of dashboard page titles, section headings like "Recent Items" or "Quick Actions," empty state messages when no content exists, status indicators such as "Active" or "Pending," navigation labels for dashboard sections, welcome messages personalized to the user, and action prompts encouraging user engagement. Without a dedicated namespace, developers adding new dashboard features lack clear guidance on where to place dashboard-related translations, making maintenance and translation management more difficult as the dashboard grows in complexity.

### Expected Behavior
All six translation files contain a clearly defined dashboard namespace with logical subsections organizing different categories of dashboard UI strings. The namespace includes a titles subsection for page and section titles, a navigation subsection for dashboard menu items and breadcrumbs, an actions subsection for buttons and action labels specific to dashboard operations, an emptyStates subsection for messages shown when lists or sections contain no data, a status subsection for status indicators and badges, and a welcome subsection for user greeting and onboarding messages. Each subsection follows consistent key naming conventions aligned with existing namespace structures. The English translation file serves as the authoritative source defining all dashboard translation keys. Initial dashboard strings cover essential UI elements visible on the main dashboard view. The namespace structure is designed to accommodate future expansion as additional dashboard features and sections are added. Developers creating new dashboard components can easily identify where to place new translation keys within the logical structure. Translation management workflows can efficiently target dashboard strings for review or updates by working within a single, well-organized namespace.

### User Impact
Dashboard interface elements display properly translated text in all supported languages once translations are generated. Users see their dashboard with localized page titles, section headings, navigation labels, and action buttons in their selected language. Empty state messages when no content exists communicate clearly in the user's language, guiding them toward next actions. Status indicators and badges show meaningful localized text rather than technical codes or English-only labels. Welcome messages and personalized greetings feel natural and appropriately formal or informal for each language culture. The dashboard experience feels cohesive and fully localized rather than a patchwork of translated and untranslated elements.

### Business Value
Establishing a dashboard namespace structure before generating translations ensures scalable localization architecture as the dashboard evolves. Clear organization reduces development time by providing obvious locations for new dashboard translation keys, preventing inconsistent naming patterns and scattered translation management. Translation generation efforts (subsequent tasks) benefit from well-structured namespaces that group related strings, making translator work more efficient and contextual. Future dashboard features inherit a proven organizational pattern, maintaining consistency as the application scales. The investment in namespace structure pays dividends throughout the application lifecycle by reducing technical debt and making localization maintenance straightforward.

### Acceptance Criteria
- [ ] All six translation files contain a dashboard namespace at the root level alongside existing namespaces like auth, common, and errors
- [ ] The dashboard namespace includes logical subsections such as titles, navigation, actions, emptyStates, status, and welcome
- [ ] Each subsection contains initial translation keys appropriate for current dashboard UI elements
- [ ] The English translation file defines all dashboard keys with clear, descriptive English text
- [ ] All five non-English translation files contain the same dashboard namespace structure with keys matching the English file
- [ ] Non-English files initially contain English placeholder text or empty strings to be filled by subsequent translation generation tasks
- [ ] Translation key naming follows established conventions used in other namespaces
- [ ] Subsection organization is logical and intuitive for developers adding new dashboard strings
- [ ] The namespace structure is documented with comments or README guidance indicating the purpose of each subsection
- [ ] JSON syntax remains valid in all translation files after adding the dashboard namespace
- [ ] TypeScript compilation succeeds with no errors related to the new namespace structure
- [ ] Existing translation functionality for other namespaces continues to work without regression
- [ ] The namespace structure accommodates foreseeable dashboard expansion without requiring restructuring




---

## REQ-365: Update Dashboard2 Page Component for Internationalization

**Date**: 2026-01-19 16:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The main dashboard page component must be updated to use next-intl's translation system for all visible text, replacing hardcoded English strings with translated content from the dashboard namespace while preserving all existing functionality, state management, and user interactions.

### Current Behavior
The dashboard2 page displays hardcoded English text throughout the interface, including the welcome message greeting users by first name, descriptive subtitle about creating and managing items, new user welcome card with title and description, empty state guidance, success notification when properties are created, and all text passed to child components like action buttons and statistics sections. Users viewing the dashboard in non-English language settings see English text regardless of their language preference. The component contains numerous user-facing strings such as "Welcome back," "Create and manage your QR code items," "Welcome to FAQBNB!," "Get started by adding your first property," "Add Your First Property," and "Property created successfully" that appear only in English. Dynamic content such as the user's first name is correctly extracted but embedded within English sentence structures. The component uses standard React state management and hooks but has no integration with the internationalization system. When the application language is changed, the dashboard content remains in English while other internationalized components update to show the selected language. The page structure, layout, functionality, modals, stats display, and all interactive features work correctly but without language flexibility.

### Expected Behavior
The dashboard2 page integrates with next-intl to display all user-facing text in the currently selected language while maintaining identical functionality and behavior. The component imports the useTranslations hook from next-intl and initializes it with the dashboard namespace to access translated strings. The welcome section heading uses a translated string with dynamic substitution of the user's first name, properly handling name placement which varies across languages. The welcome section subtitle uses a fully translated string. The new user welcome card passes translated title, description, and action label to the EmptyStateCard component using keys from the dashboard namespace such as dashboard.welcome.newUser.title, dashboard.welcome.newUser.description, and dashboard.welcome.newUser.actionLabel. The success message displayed after property creation uses a translated string from the dashboard namespace rather than the hardcoded English text. All text throughout the component references translation keys following the established namespace structure created in the previous task. Dynamic content such as user names integrates naturally with translated text using the translation library's parameter substitution features. The component structure, state management, hooks, handlers, conditional rendering logic, and all functionality remain exactly as implemented, with only the string literals replaced by translation function calls. TypeScript types remain valid and compilation succeeds. The component maintains its responsive design, accessibility features, and progressive UI logic based on property count. When users change their language preference, the dashboard immediately reflects the new language selection with all text updating accordingly while preserving the current view state and user interactions.

### User Impact
Users viewing the dashboard in any of the six supported languages see a fully localized experience with the welcome message, guidance text, action labels, and notifications appearing in their selected language. German speakers see a personalized greeting and instructions in natural German. Spanish, French, Italian, and Dutch speakers similarly experience the dashboard in their native languages. The main landing page of the application feels professionally localized rather than English-only with scattered translations. Users changing languages see immediate updates across all dashboard text, reinforcing that the entire application respects their language preference. First-time users reading the welcome guidance understand next steps clearly in their language. Users creating properties see success confirmation in their language, providing appropriate feedback. The dashboard experience feels cohesive with other internationalized sections of the application.

### Business Value
Localizing the primary dashboard landing page demonstrates professionalism to international users from their first moment after authentication. The dashboard serves as the home base of the application, making its localization essential for a complete international user experience. Users evaluating the platform in non-English languages see evidence of thorough localization effort, increasing confidence in the product's international readiness. The implementation establishes patterns for localizing other dashboard views and complex stateful components throughout the application. Consistent use of the dashboard namespace validates the namespace structure design and demonstrates its practical application. The task advances the Epic 2 localization milestone by completing another high-visibility component, bringing the application closer to full localization coverage across all UI surfaces.

### Acceptance Criteria
- [ ] The dashboard2 page component imports useTranslations from next-intl
- [ ] The useTranslations hook is initialized with the dashboard namespace
- [ ] The welcome heading uses a translated string with dynamic user name substitution following the pattern used in other localized components
- [ ] The welcome subtitle uses a translated string from the dashboard namespace
- [ ] The new user welcome card title uses a translation key from dashboard.welcome subsection
- [ ] The new user welcome card description uses a translation key from dashboard.welcome subsection
- [ ] The new user welcome card action label uses a translation key from dashboard.welcome subsection
- [ ] The success message after property creation uses a translated string from the dashboard namespace
- [ ] All hardcoded English strings visible to users have been replaced with translation function calls
- [ ] Translation keys follow the naming conventions established in the dashboard namespace structure
- [ ] Dynamic content such as user names integrates correctly with translated text using parameter substitution
- [ ] TypeScript compilation succeeds with no type errors related to translation usage
- [ ] All existing functionality including stats display, property modals, bulk operations, progressive UI, and empty states continues to work without regression
- [ ] State management, hooks, handlers, and component logic remain unchanged except for string literal replacements
- [ ] The component renders without errors in all six supported languages
- [ ] Browser console shows no missing translation key warnings when viewing the dashboard in any language
- [ ] Responsive design and mobile layouts continue to function correctly with translated text
- [ ] Accessibility features including ARIA attributes and roles remain intact
- [ ] Switching languages causes dashboard text to update immediately without requiring page refresh
- [ ] Text length variations in different languages do not break layout or cause visual issues
- [ ] The component maintains compatibility with the PropertyEditModal, AddPropertyModal, and all child components


---

## REQ-366: Update Dashboard2 Layout Component for Internationalization

**Date**: 2026-01-19 12:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The dashboard2 layout component should display all navigation labels, loading messages, button text, and accessibility attributes in the user's preferred language by replacing hardcoded strings with translation function calls.

### Current Behavior
The dashboard2 layout contains hardcoded English text throughout, including navigation menu items ("Dashboard", "Items", "Guides", "Properties"), their mobile-abbreviated labels, the logout button label, loading state messages ("Loading dashboard...", "Redirecting to login...", "Loading..."), image alt text ("FAQBNB Logo"), and aria-labels for accessibility. These strings are embedded directly in the component code, making it impossible to display the dashboard layout interface in languages other than English. Users see only English navigation and status messages regardless of their language preference.

### Expected Behavior
When users access any page using the dashboard2 layout, all text elements in the header, navigation bar, and loading states appear in their preferred language. Navigation items display translated labels that maintain meaning across languages while respecting the mobile-abbreviated versions for smaller screens. The logout button shows translated text. Loading messages communicate system status in the user's native language. All accessibility attributes reference translated strings to ensure screen readers announce interface elements correctly in the user's language. The layout remains fully functional with proper active state highlighting and navigation routing regardless of the displayed language.

### User Impact
International users can navigate the dashboard interface confidently in their native language, understanding each section's purpose without requiring English knowledge. Screen reader users receive navigation announcements and button labels in their preferred language, improving accessibility for non-English speakers with visual impairments. All users benefit from a more professional, inclusive experience that respects their language preferences. Loading and status messages provide clear communication during authentication and page transitions in language users understand immediately.

### Business Value
Internationalizing the primary navigation and layout structure is critical for market expansion, as the dashboard layout wraps all authenticated user experiences. Users who cannot navigate the main interface in their language are unlikely to adopt the product. This work establishes the foundation for a fully internationalized dashboard experience and demonstrates language support immediately upon user login. Supporting multiple languages in navigation reduces onboarding friction and increases user retention in international markets. Translated loading states and system messages reduce confusion and support requests from non-English speaking users.

### Acceptance Criteria
- [ ] All navigation item names in the navigationItems array are extracted to translation keys
- [ ] Mobile-abbreviated labels for navigation items use separate translation keys appropriate for compact display
- [ ] The logout button label is replaced with a translation function call
- [ ] All loading state messages use translation keys instead of hardcoded strings
- [ ] The FAQBNB logo alt text is internationalized
- [ ] Aria-label attributes for the logout button and dashboard navigation use translation keys
- [ ] The page title "FAQBNB" may remain as a brand constant or be made translatable based on branding guidance
- [ ] Navigation active state highlighting continues to function correctly with translated labels
- [ ] All navigation routing and onclick handlers remain unchanged
- [ ] Screen reader accessibility is maintained with properly translated aria attributes
- [ ] The component imports and uses the translation function from the localization infrastructure
- [ ] Both desktop and mobile viewport label variants are properly internationalized



---

## REQ-367: Update SimpleDashboard Components for Internationalization

**Date**: 2026-01-19 17:15
**Type**: ENHANCEMENT
**Size**: L

### Summary
All SimpleDashboard components must be updated to use next-intl's translation system for visible text, replacing hardcoded English strings with translated content while preserving functionality, layout, and user interactions.

### Current Behavior
The SimpleDashboard and its child components display hardcoded English text throughout the interface. Users see English-only content including page titles, navigation labels, section headings, button text, form labels, empty state messages, status indicators, and system notifications. The dashboard serves as the primary interface after authentication but offers no language flexibility. Users who select non-English language preferences see other parts of the application update appropriately, but the SimpleDashboard interface remains entirely in English. All component functionality works correctly including navigation, data display, user interactions, and state management, but without any integration with the internationalization infrastructure. Screen readers announce English text regardless of user language preferences, limiting accessibility for non-English speakers.

### Expected Behavior
All SimpleDashboard components display text in the user's selected language while maintaining identical functionality and behavior. Each component integrates with next-intl by importing and using the useTranslations hook. Components reference translation keys from appropriate namespaces such as dashboard, common, navigation, and others established in the translation file structure. Dynamic content like user names, dates, counts, and status values integrate naturally with translated text using parameter substitution features. All visible strings including titles, labels, buttons, descriptions, placeholders, tooltips, error messages, and accessibility attributes use translation function calls instead of hardcoded text. Component structure, state management, event handlers, routing logic, and conditional rendering remain unchanged except for replacing string literals with translation references. TypeScript compilation succeeds with proper typing for all translation calls. Responsive layouts continue to work correctly across viewport sizes with translated text. When users change their language preference, all SimpleDashboard text updates immediately to reflect the new selection without requiring navigation or state loss.

### User Impact
Users viewing SimpleDashboard in any supported language see a fully localized interface with all text appearing in their selected language. The dashboard experience feels professionally internationalized rather than English-only with partial translations elsewhere. Users navigating between different sections see consistent language throughout. Screen reader users receive announcements and labels in their preferred language, significantly improving accessibility for non-English speakers with visual impairments. Users evaluating the platform can experience the complete dashboard workflow in their native language, increasing confidence in the product's international readiness. First-time users understand available actions and features clearly without requiring English proficiency.

### Business Value
Internationalizing SimpleDashboard components completes a critical milestone in Epic 2 by ensuring the primary authenticated user interface supports all target languages. The dashboard is the most frequently viewed interface in the application, making its localization essential for international market success. Users who cannot use the main dashboard in their language are unlikely to continue using the product regardless of other localized features. This work validates the translation namespace structure across a complex, multi-component interface and establishes patterns for localizing other compound UI sections. Completing SimpleDashboard localization brings the application significantly closer to full static UI internationalization coverage, enabling marketing efforts to target non-English speaking markets with confidence.

### Acceptance Criteria
- [ ] All SimpleDashboard component files import useTranslations from next-intl
- [ ] Each component initializes the translation hook with appropriate namespace(s)
- [ ] All user-facing text strings are replaced with translation function calls
- [ ] Translation keys follow established naming conventions and namespace structure
- [ ] Dynamic content integrates correctly with translations using parameter substitution
- [ ] Page titles, section headings, and navigation labels are fully internationalized
- [ ] Button labels, link text, and action triggers use translated strings
- [ ] Form elements including labels, placeholders, and helper text reference translation keys
- [ ] Empty state messages appear in the user's selected language
- [ ] Loading indicators and status messages use translated text
- [ ] Error messages and validation feedback are internationalized
- [ ] Accessibility attributes including aria-labels and alt text use translation keys
- [ ] All existing component functionality continues to work without regression
- [ ] State management, routing, event handlers, and business logic remain unchanged
- [ ] TypeScript compilation succeeds with no type errors related to translations
- [ ] Components render correctly in all six supported languages without layout breaks
- [ ] Browser console shows no missing translation key warnings when using SimpleDashboard
- [ ] Responsive design functions properly with text length variations across languages
- [ ] Language switching causes immediate text updates without navigation or state loss
- [ ] Screen readers announce all interface elements correctly in the user's language
- [ ] Mobile viewport displays properly with translated text in all languages
- [ ] Component integration tests pass with translation system active
- [ ] All child components of SimpleDashboard are included in the internationalization update

---

## REQ-368: Update Navigation and Sidebar Components for Internationalization

**Date**: 2026-01-19 (System Modified)
**Type**: ENHANCEMENT
**Size**: M
**Epic**: Epic 2: Static UI Localization
**Phase**: Phase 2B (Dashboard & Navigation)
**Task**: 2B.5 - Update navigation/sidebar components

### Summary
All navigation and sidebar components must display menu items, labels, and text in the user's selected language using the existing next-intl translation infrastructure.

### Current Behavior
Navigation and sidebar components contain hardcoded English text strings for menu items, section labels, navigation links, and tooltips. Users see the interface in English regardless of their language preference.

### Expected Behavior
Navigation and sidebar components retrieve all displayed text from translation files based on the active locale. When a user switches languages, all navigation elements immediately reflect the selected language without page reload where possible.

### User Impact
All authenticated users navigating the application see menu items, sidebar labels, and navigation text in their preferred language. This affects primary navigation patterns used throughout the application session.

### Business Value
Consistent navigation experience across all supported languages reduces friction for non-English users and reinforces the application's commitment to multilingual support.

### Acceptance Criteria
- [ ] All navigation menu items use translation keys from the appropriate namespace
- [ ] All sidebar section labels and links use translation keys from the appropriate namespace
- [ ] All navigation tooltips and helper text are translated
- [ ] Navigation icons remain visible and properly labeled in all languages
- [ ] Active navigation states and indicators work correctly with translated text
- [ ] Collapsible navigation sections maintain functionality with translated labels
- [ ] Navigation breadcrumbs display translated route names where applicable
- [ ] No hardcoded English strings remain in navigation or sidebar components
- [ ] Language switching updates navigation text without full page reload where technically feasible
- [ ] Translation keys follow the established naming convention for navigation elements

---

## REQ-369: Update Page Metadata with Translations

**Date**: 2026-01-19 15:45
**Type**: ENHANCEMENT
**Size**: S
**Epic**: Epic 2: Static UI Localization
**Phase**: Phase 2B (Dashboard & Navigation)
**Task**: 2B.6 - Update page metadata with translations

### Summary
All page metadata including titles, meta descriptions, and Open Graph tags must display in the user's selected language using the translation system.

### Current Behavior
Page metadata elements such as document titles, meta descriptions, and social sharing tags contain hardcoded English text. When users share links or view browser tabs, the metadata appears only in English regardless of the user's language preference.

### Expected Behavior
Page metadata retrieves localized values from translation files based on the active locale. When a user navigates to any page, the browser tab title, meta description, and social media preview text appear in their selected language. SEO metadata reflects the appropriate language variant for search engine indexing.

### User Impact
All users browsing the application see page titles in their preferred language in browser tabs and bookmarks. Users sharing links on social media platforms see preview cards with descriptions in the appropriate language. This affects the first impression for new users arriving from search results or shared links.

### Business Value
Localized metadata improves SEO performance across different language markets and increases click-through rates from search results and social sharing by presenting content in the user's native language.

### Acceptance Criteria
- [ ] All page document titles use translation keys and display in the active locale
- [ ] All meta description tags retrieve translated content from translation files
- [ ] Open Graph title and description tags display localized content
- [ ] Twitter Card metadata uses appropriate translation keys
- [ ] Page metadata updates correctly when language is changed during navigation
- [ ] Each supported language has complete metadata translations in translation files
- [ ] No hardcoded English strings remain in metadata-related code
- [ ] Metadata translation keys follow established naming conventions
- [ ] Dynamic page titles (e.g., item names, user names) combine properly with translated template text
- [ ] Default fallback metadata exists for pages without specific translations
- [ ] SEO-critical pages have optimized, culturally appropriate translations
- [ ] Browser tab titles reflect current page and language without truncation issues


---

## REQ-370: Generate Translations for Dashboard Namespace in 5 Non-English Languages

**Date**: 2026-01-19 16:02
**Type**: ENHANCEMENT
**Size**: M
**Epic**: Epic 2: Static UI Localization
**Phase**: Phase 2B (Dashboard & Navigation)
**Task**: 2B.7 - Generate translations for 5 non-English languages

### Summary
All dashboard namespace keys created in the English translation file must be translated into German, Spanish, French, Italian, and Dutch using the translation service infrastructure.

### Current Behavior
The dashboard namespace structure exists only in the English translation file. Users selecting German, Spanish, French, Italian, or Dutch see missing translation warnings or fallback English text when viewing dashboard components, navigation elements, and page metadata.

### Expected Behavior
All dashboard namespace keys have complete, accurate translations in all five non-English target languages. When a user selects any supported language, all dashboard interface elements, navigation items, section labels, and metadata display in the selected language without fallback to English or missing key warnings.

### User Impact
All users who select German, Spanish, French, Italian, or Dutch experience the dashboard interface fully translated into their chosen language. This affects every interaction with the main navigation, dashboard components, and related page elements.

### Business Value
Complete dashboard translations deliver on the multilingual promise to users, ensuring feature parity across all supported languages and eliminating the fragmented experience caused by missing translations.

### Acceptance Criteria
- [ ] German translation file contains all dashboard namespace keys with contextually appropriate translations
- [ ] Spanish translation file contains all dashboard namespace keys with contextually appropriate translations
- [ ] French translation file contains all dashboard namespace keys with contextually appropriate translations
- [ ] Italian translation file contains all dashboard namespace keys with contextually appropriate translations
- [ ] Dutch translation file contains all dashboard namespace keys with contextually appropriate translations
- [ ] All translations maintain consistent terminology with previously translated namespaces
- [ ] Navigation menu items use culturally appropriate phrasing for each language
- [ ] Dashboard section labels and headings read naturally in each target language
- [ ] Page metadata translations are optimized for SEO in each language market
- [ ] Translation quality is verified by native or fluent speakers where possible
- [ ] No placeholder or machine-translated text remains in final translation files
- [ ] All translation keys match exactly between English source and target language files
- [ ] Translation service successfully processes all dashboard keys without errors
- [ ] Dashboard components display correctly in all five languages without layout breaks
- [ ] Language switching between all six supported languages works seamlessly in dashboard context
- [ ] Browser console shows no missing translation warnings when dashboard is viewed in any language

---

## REQ-371: Create Workflow Namespace Structure in Translation Files

**Date**: 2026-01-19 16:15
**Type**: NEW FEATURE
**Size**: M
**Epic**: Epic 2: Static UI Localization
**Phase**: Phase 2C (Item Creation Workflow)
**Task**: 2C.1 - Create workflow namespace structure

### Summary
The Item Creation Workflow requires a dedicated namespace in all translation files containing organized translation keys for every user-facing string across all workflow steps, dialogs, forms, and feedback messages.

### Current Behavior
The Item Creation Workflow contains hardcoded English strings throughout its multi-step interface, including step indicators, room selection labels, item type labels, form inputs, validation messages, dialog confirmations, success messages, progress indicators, and button labels. Users navigating the workflow see all interface text in English regardless of their selected language preference. The workflow represents a significant portion of the user experience but remains entirely untranslated, creating a jarring language inconsistency when users switch from localized navigation and dashboard interfaces into the English-only item creation flow.

### Expected Behavior
All six translation files contain a well-organized workflow namespace with logical subsections mirroring the structure of existing namespaces like auth and dashboard. The namespace includes subsections for step titles and instructions, progress indicators, room selection labels, item type labels, purpose selection labels, content type labels, form field labels and placeholders, validation error messages, confirmation dialog messages, success and completion messages, button labels for navigation and actions, help text and tooltips, empty state messages, and session summary labels. Each subsection uses consistent key naming conventions that clearly indicate the workflow step or component context. The English translation file serves as the authoritative source defining all workflow keys. The namespace structure accommodates the complete user journey from workflow entry through multi-step item creation to session completion. Keys are named to be self-documenting, making it easy for developers to identify the correct translation key when localizing workflow components.

### User Impact
This work establishes the translation infrastructure that enables users in all supported languages to experience the Item Creation Workflow in their preferred language. Without this namespace structure, subsequent workflow localization tasks cannot proceed. The comprehensive organization ensures developers can efficiently locate appropriate translation keys when implementing localization across the complex multi-step workflow interface.

### Business Value
The Item Creation Workflow is a core value-generating feature where users create the QR code items that form the foundation of the platform's functionality. Localizing this critical workflow removes a major barrier to international user adoption and successful onboarding. Users who cannot understand item creation instructions in English often abandon the platform before realizing its value. This work enables the platform to convert international users effectively by providing clear, native-language guidance through the essential item creation process. The namespace structure investment pays dividends by enabling rapid localization of current and future workflow features.

### Acceptance Criteria
- [ ] All six translation files (en.json, de.json, es.json, fr.json, it.json, nl.json) contain a workflow namespace object
- [ ] The namespace includes a steps subsection with keys for all workflow step titles and instructional text
- [ ] The namespace includes a progress subsection for session progress indicators and item count labels
- [ ] The namespace includes a rooms subsection for all room type labels used in room selection
- [ ] The namespace includes an itemTypes subsection for all item type labels and descriptions
- [ ] The namespace includes a purposes subsection for purpose selection labels
- [ ] The namespace includes a contentTypes subsection for content type selection labels
- [ ] The namespace includes a forms subsection with field labels, placeholders, and helper text
- [ ] The namespace includes a validation subsection for workflow-specific validation messages
- [ ] The namespace includes a dialogs subsection for confirmation dialogs (exit, remove item, empty session)
- [ ] The namespace includes a buttons subsection for navigation buttons (next, previous, save, add more, finish, print)
- [ ] The namespace includes a messages subsection for success messages, error messages, and status updates
- [ ] The namespace includes a sessionSummary subsection for session review and completion labels
- [ ] The namespace includes an emptyStates subsection for messages shown when no items exist
- [ ] The namespace includes a printOptions subsection for print configuration labels
- [ ] Each subsection groups related keys logically to match workflow component organization
- [ ] Key naming follows consistent patterns established in other namespaces (camelCase, descriptive names)
- [ ] The English translation file contains actual English string values for all keys
- [ ] Non-English translation files initially contain matching English placeholders pending translation generation
- [ ] The namespace structure matches across all six translation files with identical key structures
- [ ] Translation keys are designed to support dynamic content insertion (item counts, room names, item names)
- [ ] Documentation comments or README references explain the workflow namespace organization
- [ ] The namespace structure accommodates future expansion for additional workflow steps or features
- [ ] Developers can easily identify which subsection contains keys for any given workflow component



---

## REQ-372: Update Main ItemCreationWorkflow Component for Internationalization

**Date**: 2026-01-19 17:30
**Type**: ENHANCEMENT
**Size**: L
**Epic**: Epic 2: Static UI Localization
**Phase**: Phase 2C (Item Creation Workflow)
**Task**: 2C.2 - Update main ItemCreationWorkflow component

### Summary
The main ItemCreationWorkflow component must be refactored to use the t() function from next-intl for all user-facing strings, replacing hardcoded English text with translation keys from the workflow namespace.

### Current Behavior
The ItemCreationWorkflow component contains hardcoded English strings throughout its interface, including step titles, progress indicators, session status messages, navigation button labels, and instructional text. All workflow state management, step progression logic, and user feedback messages display in English regardless of the user's selected language preference. Users who have chosen German, Spanish, French, Italian, or Dutch as their preferred language experience a jarring language switch when entering the item creation workflow, breaking the localized experience established in the dashboard and navigation. The component does not import or use the next-intl translation infrastructure, making it impossible for the workflow to respect user language preferences.

### Expected Behavior
The ItemCreationWorkflow component imports and uses the useTranslations hook from next-intl to access workflow namespace translations. All hardcoded English strings are replaced with t() function calls using appropriate translation keys from the workflow namespace. Step titles, progress indicators showing session item counts, navigation button labels, instructional text, session status messages, empty state messages, and all other user-facing text render in the user's selected language. The component maintains its current functionality, state management, and step progression logic while seamlessly integrating internationalized strings. Dynamic content such as item counts and session progress numbers are properly interpolated into translated strings using next-intl's variable substitution features. The component gracefully handles language switching mid-session, allowing users to change their language preference and see updated translations without losing workflow progress. All accessibility labels and ARIA attributes that contain text also use translated strings to ensure screen readers announce content in the user's preferred language.

### User Impact
All users who select a non-English language experience the complete Item Creation Workflow in their chosen language. This affects the primary value-generating flow where users create QR code items. Users no longer encounter confusing language switches when moving from localized navigation into the workflow. International users can successfully complete item creation without needing to understand English instructions or button labels. Users who switch their language preference mid-workflow immediately see updated translations without disrupting their work in progress.

### Business Value
Localizing the Item Creation Workflow directly impacts international user conversion and retention. This is the critical onboarding flow where users create their first items and understand the platform's value proposition. Users who cannot understand item creation instructions in English frequently abandon the platform before completing their first item, resulting in lost conversions. By providing clear, native-language guidance through this essential workflow, the platform can dramatically improve international user success rates, reduce support requests from non-English speakers, and increase the percentage of users who successfully complete onboarding and become active platform users.

### Acceptance Criteria
- [ ] The ItemCreationWorkflow component imports the useTranslations hook from next-intl
- [ ] The workflow namespace is loaded using useTranslations('workflow')
- [ ] All step title strings use translation keys from the workflow.steps subsection
- [ ] Progress indicators showing item counts use translated strings with dynamic number interpolation
- [ ] All navigation button labels (Next, Previous, Add Another Item, Finish Session) use workflow.buttons translation keys
- [ ] Session status messages use workflow.messages translation keys
- [ ] Instructional text and help content use workflow.steps subsection keys
- [ ] Empty state messages when no items exist use workflow.emptyStates translation keys
- [ ] Session summary labels use workflow.sessionSummary translation keys
- [ ] No hardcoded English strings remain in the component's JSX or logic
- [ ] Dynamic content such as "{count} items created" properly uses next-intl's plural rules and variable substitution
- [ ] The component functions identically in all six supported languages
- [ ] Changing language preference mid-workflow updates all visible text without disrupting state or progress
- [ ] All ARIA labels and accessibility attributes use translated strings
- [ ] Error boundaries display translated error messages if workflow initialization fails
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] Console shows no missing translation warnings when workflow is viewed in English
- [ ] Step progression logic continues to work correctly with translated button labels
- [ ] Session state management remains unchanged and compatible with existing data structures
- [ ] The workflow maintains proper client/server component boundaries with next-intl usage
- [ ] TypeScript types correctly reflect the translation key structure for type-safe t() calls
- [ ] The component passes existing unit tests or tests are updated to accommodate translation function calls
- [ ] Visual regression testing confirms layout remains correct with longer translated strings
- [ ] Manual testing confirms workflow completion in all six languages produces correct results


---

## REQ-373: Update RoomSelectionStep Component for Internationalization

**Date**: 2026-01-19 13:15
**Type**: ENHANCEMENT
**Size**: M
**Epic**: Epic 2: Static UI Localization
**Phase**: Phase 2C (Item Creation Workflow)
**Task**: 2C.3 - Update RoomSelectionStep component

### Summary
The RoomSelectionStep component must be refactored to use the t() function from next-intl for all user-facing strings, enabling room selection interface text to display in the user's preferred language.

### Current Behavior
The RoomSelectionStep component displays hardcoded English strings for the step header, instructions, room labels, custom room input labels, accessibility text, and navigation buttons. The component shows "Select a Room" as the heading, "Choose where this item is located in your property" as the description, and displays room type labels like "Kitchen", "Laundry Room", "Bedroom", "Bathroom", "Living Room", "Garage", "Outdoor/Patio", "General/Whole Property", and "Other" in English regardless of the user's language preference. When users select the "Other" option, they see English text prompting them to "Enter room name" with a placeholder showing "e.g., Home Office, Wine Cellar, Mudroom" and a hint reading "Maximum 50 characters". The "Continue" button displays in English. Screen reader users hear English accessibility instructions stating "Use arrow keys to navigate between rooms. Press Enter or Space to select." Users who have set their language preference to German, Spanish, French, Italian, or Dutch encounter this English-only interface when beginning the item creation workflow, breaking the localized experience they receive in other parts of the application.

### Expected Behavior
The RoomSelectionStep component imports and uses the useTranslations hook from next-intl to access workflow namespace translations. The step heading displays the translated equivalent of "Select a Room" from the workflow.steps subsection. The instructional description text renders from a translation key that adapts naturally to each language's syntax and idiom. All nine room type labels display in the user's selected language, with appropriate translations for kitchen, laundry room, bedroom, bathroom, living room, garage, outdoor areas, general property, and custom room options. When users select the "Other" option, the custom room input field label, placeholder examples, and character limit hint all appear in the selected language. The "Continue" button label uses a translated string from the workflow.buttons subsection. Accessibility text for screen readers announces keyboard navigation instructions in the user's preferred language using translated ARIA label strings. The component maintains all existing keyboard navigation functionality, roving tabindex behavior, auto-advance logic, and custom room name validation while seamlessly presenting all interface text in the selected language. Layout and spacing accommodate varying text lengths across different languages without breaking the responsive grid design or causing text overflow issues.

### User Impact
All users who select a non-English language experience the room selection step in their chosen language from the very first interaction with the item creation workflow. This affects every user's initial workflow experience, as room selection is the mandatory first step. Users see room categories described using terminology familiar and natural in their language. International users with limited English proficiency can confidently select the appropriate room category without confusion. Screen reader users who have their assistive technology configured for a non-English language hear navigation instructions in their preferred language, improving accessibility. Users switching languages mid-workflow see immediate updates to room labels and instructions without losing their selection state.

### Business Value
Localizing the first workflow step creates an immediate positive impression for international users, establishing confidence that the entire platform supports their language needs. Room selection is the gateway to all subsequent workflow steps, making this localization essential for international user engagement. Users who encounter their native language at workflow entry are significantly more likely to complete the entire item creation process. Clear, translated room categories reduce user hesitation and support requests from non-English speakers confused by room terminology. This work establishes the localization pattern that subsequent workflow step components will follow, accelerating the broader workflow internationalization effort.

### Acceptance Criteria
- [ ] The RoomSelectionStep component imports the useTranslations hook from next-intl
- [ ] The workflow namespace is loaded using useTranslations('workflow')
- [ ] The step heading "Select a Room" uses a translation key from workflow.steps.roomSelection.title
- [ ] The instructional text "Choose where this item is located in your property" uses a translation key from workflow.steps.roomSelection.description
- [ ] All nine room type labels are retrieved from the workflow.rooms subsection using appropriate translation keys
- [ ] The ROOM_LABELS constant is replaced with dynamic translation lookups for each room type
- [ ] The custom room input field label "Enter room name" uses a translated string from workflow.forms
- [ ] The custom room placeholder text showing example room names uses a translated string with locale-appropriate examples
- [ ] The character limit hint "Maximum 50 characters" uses a translated string with dynamic number interpolation
- [ ] The "Continue" button label uses a translation key from workflow.buttons
- [ ] The ARIA label "Select a room for your item" uses a translated accessibility string
- [ ] The screen reader instructions about keyboard navigation use a translated string from workflow.accessibility
- [ ] No hardcoded English strings remain in the component's JSX or logic
- [ ] The component maintains its roving tabindex keyboard navigation functionality with translations
- [ ] Auto-advance logic continues to work correctly after room selection regardless of language
- [ ] Custom room name validation functions identically in all supported languages
- [ ] The component displays correctly in all six supported languages without text overflow or layout breaks
- [ ] Longer translated text in languages like German or French does not cause grid items to misalign
- [ ] Console shows no missing translation warnings when the component is viewed in English
- [ ] Accessibility testing with screen readers confirms navigation instructions announce correctly in each language
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] TypeScript types correctly reflect the translation key structure for type-safe t() calls
- [ ] Existing unit tests pass or are updated to accommodate translation function calls
- [ ] Visual regression testing confirms responsive grid layout remains correct across all languages and viewport sizes
- [ ] Manual testing in all six languages confirms successful room selection and workflow progression


---

## REQ-374: Update ItemTypeStep Component for Internationalization

**Date**: 2026-01-19 18:45
**Type**: ENHANCEMENT
**Size**: M
**Epic**: Epic 2: Static UI Localization
**Phase**: Phase 2C (Item Creation Workflow)
**Task**: 2C.4 - Update ItemTypeStep component

### Summary
The ItemTypeStep component must be refactored to use the t() function from next-intl for all user-facing strings, enabling item type selection interface text to display in the user's preferred language.

### Current Behavior
The ItemTypeStep component displays hardcoded English strings for the step header, instructions, item type labels, descriptions, accessibility text, and navigation buttons. Users see "Select Item Type" as the heading with a description stating "Choose what type of item you want to create". The component presents four item type options with English labels: "Article" with description "Informational content, guides, or instructions", "Link" with description "External website or resource URL", "Contact" with description "Contact information for people or services", and "File/Document" with description "Downloadable files or documents". Each type displays an icon with an English label and supporting description text. The "Continue" and "Back" buttons appear in English. Screen reader users hear English accessibility instructions such as "Select an item type. Use arrow keys to navigate between item types" and ARIA labels describing each option in English. Users who have selected German, Spanish, French, Italian, or Dutch as their language preference encounter this English-only interface at the critical decision point where they define the nature of the item they are creating.

### Expected Behavior
The ItemTypeStep component imports and uses the useTranslations hook from next-intl to access workflow namespace translations. The step heading displays the translated equivalent of "Select Item Type" from the workflow.steps subsection. The instructional description text renders from a translation key that adapts naturally to each language's phrasing. All four item type labels display in the user's selected language using translation keys from the workflow.itemTypes subsection. Each item type's descriptive text explaining its purpose renders in the selected language with culturally appropriate phrasing that clearly communicates the distinctions between article, link, contact, and file types. Navigation button labels "Continue" and "Back" use translated strings from the workflow.buttons subsection. Accessibility text for screen readers announces keyboard navigation instructions in the user's preferred language using translated ARIA label strings. The component maintains all existing keyboard navigation functionality, selection state management, type validation logic, and visual hover/focus states while seamlessly presenting all interface text in the selected language. Layout and spacing accommodate varying text lengths across different languages without breaking the responsive card grid design or causing text overflow issues. Icon positions remain consistent regardless of label length variations across languages.

### User Impact
All users who select a non-English language experience the item type selection step in their chosen language during the critical moment when they define what they are creating. This affects every user's understanding of the available item types and their ability to make an informed selection that matches their needs. Users see item types described using terminology and explanations that resonate with their language and cultural context. International users with limited English proficiency can confidently understand the differences between article, link, contact, and file types without confusion or misinterpretation. Screen reader users who have their assistive technology configured for a non-English language hear item type descriptions in their preferred language, improving accessibility and comprehension. Users switching languages mid-workflow see immediate updates to item type labels and descriptions without losing their selection state.

### Business Value
Localizing the item type selection step ensures international users correctly understand the fundamental item categories available in the platform, reducing the likelihood of users creating items of the wrong type and becoming frustrated with results that don't match their expectations. Clear, translated item type descriptions reduce user confusion, decrease support requests from non-English speakers uncertain about which type to choose, and increase successful item creation completion rates among international users. This step represents a critical conceptual decision point where users must understand abstract categories, making native-language explanations essential for user success. Proper localization at this decision point directly impacts data quality by helping users select appropriate item types, reducing cleanup work for moderators and support teams.

### Acceptance Criteria
- [ ] The ItemTypeStep component imports the useTranslations hook from next-intl
- [ ] The workflow namespace is loaded using useTranslations('workflow')
- [ ] The step heading "Select Item Type" uses a translation key from workflow.steps.itemType.title
- [ ] The instructional text "Choose what type of item you want to create" uses a translation key from workflow.steps.itemType.description
- [ ] The "Article" type label uses a translation key from workflow.itemTypes.article.label
- [ ] The "Article" type description uses a translation key from workflow.itemTypes.article.description
- [ ] The "Link" type label uses a translation key from workflow.itemTypes.link.label
- [ ] The "Link" type description uses a translation key from workflow.itemTypes.link.description
- [ ] The "Contact" type label uses a translation key from workflow.itemTypes.contact.label
- [ ] The "Contact" type description uses a translation key from workflow.itemTypes.contact.description
- [ ] The "File/Document" type label uses a translation key from workflow.itemTypes.file.label
- [ ] The "File/Document" type description uses a translation key from workflow.itemTypes.file.description
- [ ] The "Continue" button label uses a translation key from workflow.buttons.continue
- [ ] The "Back" button label uses a translation key from workflow.buttons.back
- [ ] The ARIA label "Select an item type" uses a translated accessibility string
- [ ] The screen reader instructions about keyboard navigation use a translated string from workflow.accessibility
- [ ] No hardcoded English strings remain in the component's JSX or logic
- [ ] The component maintains its keyboard navigation functionality with arrow keys regardless of language
- [ ] Selection state management continues to work correctly after language changes
- [ ] Type validation logic functions identically in all supported languages
- [ ] The component displays correctly in all six supported languages without text overflow or layout breaks
- [ ] Longer translated descriptions in languages like German or French do not cause card height inconsistencies or text overflow
- [ ] Card grid layout remains properly aligned with varying label and description lengths
- [ ] Console shows no missing translation warnings when the component is viewed in English
- [ ] Accessibility testing with screen readers confirms item type descriptions announce correctly in each language
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] TypeScript types correctly reflect the translation key structure for type-safe t() calls
- [ ] Existing unit tests pass or are updated to accommodate translation function calls
- [ ] Visual regression testing confirms responsive card grid layout remains correct across all languages and viewport sizes
- [ ] Manual testing in all six languages confirms successful item type selection and workflow progression
- [ ] Icon alignment and spacing remain consistent across all languages despite label length variations
- [ ] Hover and focus states continue to function correctly with translated text

---

## REQ-375: Update SpecificItemStep Component for Internationalization

**Date**: 2026-01-19 19:15
**Type**: ENHANCEMENT
**Size**: L
**Epic**: Epic 2: Static UI Localization
**Phase**: Phase 2C (Item Creation Workflow)
**Task**: 2C.5 - Update SpecificItemStep component

### Summary
The SpecificItemStep component must be refactored to use the t() function from next-intl for all user-facing strings, enabling the item-specific detail forms to display in the user's preferred language across all four item types: Article, Link, Contact, and File.

### Current Behavior
The SpecificItemStep component displays hardcoded English strings for multiple conditional forms based on the selected item type. For Article items, users see English labels: "Title", "Content", "Tags", and "Attachments". For Link items, the form shows "Title", "URL", "Description", and "Tags" in English. For Contact items, labels appear in English: "Name", "Role/Title", "Email", "Phone", "Tags". For File items, the interface displays "Title", "File Upload", "Description", and "Tags" in English. All placeholder text appears in English, such as "Enter article title here", "https://example.com", "Enter contact name", and "Select or drag file here". Field-level help text and validation messages display in English, including "Required field", "Please enter a valid URL", "Please enter a valid email address", and "File size must not exceed 10MB". Navigation buttons "Continue", "Back", and "Save Draft" appear in English. Error messages for failed validation display in English, such as "Title must be at least 3 characters long" or "URL format is invalid". Users who have selected German, Spanish, French, Italian, or Dutch as their language preference encounter these English-only forms when providing the core details of their items, creating confusion about field requirements and validation rules.

### Expected Behavior
The SpecificItemStep component imports and uses the useTranslations hook from next-intl to access workflow namespace translations. The component conditionally renders form fields based on the selected item type, with all labels, placeholders, and help text displaying in the user's preferred language. For Article items, field labels use translation keys from workflow.forms.article (title, content, tags, attachments). For Link items, labels use workflow.forms.link translation keys. For Contact items, labels use workflow.forms.contact keys. For File items, labels use workflow.forms.file keys. All placeholder text renders from language-specific translation keys that provide culturally appropriate examples while remaining generic enough to guide without dictating content. Field-level help text explaining requirements displays using translated strings from workflow.helpText that adapt phrasing to each language's conventions for instructional content. Validation messages use translation keys from workflow.validation with dynamic interpolation for field names and requirement values, such as minimum length or maximum file size. Navigation buttons use translated strings from workflow.buttons for "Continue", "Back", and "Save Draft". Error messages display in the user's selected language with proper grammar and punctuation conventions for that language. ARIA labels and accessibility announcements use translated strings from workflow.accessibility to ensure screen reader users experience the form in their preferred language. The component maintains all existing form validation logic, file upload functionality, tag management, draft saving, and conditional rendering while presenting the interface entirely in the selected language. Layout accommodates varying label lengths across languages without breaking responsive design or causing alignment issues. Required field indicators display appropriately regardless of whether the language places them before or after the label text.

### User Impact
All users who select a non-English language experience the detailed item creation forms in their chosen language, directly affecting their ability to understand field requirements and successfully complete item creation. This impacts every user's experience at the most data-intensive step of the workflow where they provide the substantive content of their items. Users with limited English proficiency can accurately understand what information is required in each field without guessing based on context clues. International users see validation messages that explain errors in their native language, reducing frustration when corrections are needed. Screen reader users configured for non-English languages hear field labels, help text, and error messages announced in their preferred language, significantly improving form accessibility. Users creating complex items with multiple fields benefit from clear, translated instructions that reduce errors and support ticket volume. Users who switch languages mid-workflow see form labels and messages update immediately without losing entered data or validation state.

### Business Value
Localizing the item detail forms is critical for international user success because this step requires users to understand specific field requirements and validation rules that may be unfamiliar. Clear, translated field labels and help text reduce form abandonment rates among non-English speakers who become confused about requirements. Translated validation messages decrease user frustration during error correction, leading to higher completion rates and fewer abandoned partial items. Native-language instructions for file upload requirements, URL formats, and contact information formats reduce data quality issues caused by misunderstood requirements. This localization directly improves data integrity by helping international users submit well-formed, complete items on their first attempt, reducing moderation workload and support requests from users who submitted incorrect data due to language barriers. Proper form localization at this detailed data entry step demonstrates platform professionalism and commitment to international users, increasing user confidence and long-term platform adoption.

### Acceptance Criteria
- [ ] The SpecificItemStep component imports the useTranslations hook from next-intl
- [ ] The workflow namespace is loaded using useTranslations('workflow')
- [ ] Article form labels use translation keys from workflow.forms.article.fields
- [ ] Link form labels use translation keys from workflow.forms.link.fields
- [ ] Contact form labels use translation keys from workflow.forms.contact.fields
- [ ] File form labels use translation keys from workflow.forms.file.fields
- [ ] All placeholder text uses translation keys from workflow.forms.[itemType].placeholders
- [ ] Field-level help text uses translation keys from workflow.helpText
- [ ] Required field indicators use a translated string from workflow.forms.requiredIndicator
- [ ] The "Title" field label uses appropriate translation keys for each item type context
- [ ] The "Tags" field uses translated labels and placeholder text from workflow.forms.tags
- [ ] File upload button text "Choose File" or "Select File" uses a translation key
- [ ] File upload drag-and-drop hint text uses a translated string
- [ ] File size limit message uses a translation key with dynamic interpolation for the size value
- [ ] URL field help text explaining expected format uses a translated string
- [ ] Email field help text uses a translated string
- [ ] Phone field help text uses a translated string
- [ ] Validation error "Title must be at least 3 characters" uses a translation key with dynamic interpolation
- [ ] Validation error "URL format is invalid" uses a translation key
- [ ] Validation error "Email format is invalid" uses a translation key
- [ ] Validation error "File size exceeds limit" uses a translation key with dynamic interpolation
- [ ] Validation error "Required field" uses a translation key with dynamic field name interpolation
- [ ] Navigation button "Continue" uses a translation key from workflow.buttons.continue
- [ ] Navigation button "Back" uses a translation key from workflow.buttons.back
- [ ] "Save Draft" button uses a translation key from workflow.buttons.saveDraft
- [ ] Success message "Draft saved" uses a translation key
- [ ] ARIA labels for file input accessibility use translated strings
- [ ] ARIA labels for tag input accessibility use translated strings
- [ ] Screen reader announcements for validation errors use translated strings
- [ ] No hardcoded English strings remain in any form variant (Article, Link, Contact, File)
- [ ] Form validation logic continues to function identically in all supported languages
- [ ] File upload functionality works correctly with translated interface elements
- [ ] Tag management (add, remove) functions properly with translated UI text
- [ ] Draft saving mechanism works with translated success/error messages
- [ ] Character count indicators display with translated text format
- [ ] The component displays correctly in all six supported languages without layout breaks
- [ ] Longer German or French labels do not cause form field misalignment
- [ ] Form layout remains responsive across all languages and viewport sizes
- [ ] Required field indicators position correctly for RTL-adjacent languages if applicable
- [ ] Console shows no missing translation warnings for any item type form
- [ ] Accessibility testing confirms screen readers announce all form elements in the selected language
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] TypeScript types correctly reflect translation key structure for type-safe t() calls
- [ ] Existing unit tests pass or are updated to accommodate translation function calls
- [ ] Validation error messages display with proper grammar and punctuation for each language
- [ ] Dynamic interpolation in validation messages produces grammatically correct output in all languages
- [ ] Manual testing in all six languages confirms successful form completion for all four item types
- [ ] Visual regression testing confirms consistent form layout across languages and item types
- [ ] Entered data persists correctly when switching languages mid-workflow
- [ ] Error state styling remains consistent with translated validation messages


---

## REQ-376: Update PurposeStep Component for Internationalization

**Date**: 2026-01-19 19:28
**Type**: ENHANCEMENT
**Size**: M
**Epic**: Epic 2: Static UI Localization
**Phase**: Phase 2C (Item Creation Workflow)
**Task**: 2C.6 - Update PurposeStep component

### Summary
The PurposeStep component must be refactored to use the t() function from next-intl for all user-facing strings, enabling users to select the purpose of their content in their preferred language.

### Current Behavior
The PurposeStep component displays hardcoded English strings for the step heading "What's the purpose of this content?", the subheading "Choose what you want to help guests with", and seven purpose option cards. Each purpose card shows an English label: "How to Use", "How to Clean", "Troubleshooting", "Safety Information", "Maintenance", "Features", and "Other". Below each label, a description appears in English: "Operating instructions and controls", "Cleaning and care instructions", "Common issues and fixes", "Safety warnings and precautions", "Regular maintenance tasks", "Product features and benefits", and "General information". The "Continue" button text displays in English. The ARIA label "Select content purpose" appears in English. The screen reader help text "Use up and down arrow keys to navigate. Press Enter or Space to select" displays in English. Users who have selected German, Spanish, French, Italian, or Dutch as their language preference encounter this English-only interface when selecting the purpose for their content item, potentially misunderstanding what each purpose type means or how it will affect their content.

### Expected Behavior
The PurposeStep component imports and uses the useTranslations hook from next-intl to access workflow namespace translations. The step heading uses a translation key from workflow.purposeStep.heading. The subheading text uses a translation key from workflow.purposeStep.subheading. Each purpose option label uses translation keys from workflow.purposes.[purposeType].label where purposeType matches the purpose type constant. Each purpose option description uses translation keys from workflow.purposes.[purposeType].description. The "Continue" button text uses a translation key from workflow.buttons.continue. The ARIA label for the radiogroup uses a translated string from workflow.accessibility.purposeStep.ariaLabel. The keyboard navigation help text uses a translated string from workflow.accessibility.purposeStep.keyboardHelp. All text content displays in the user's selected language while maintaining the component's keyboard navigation functionality with arrow keys, auto-advance behavior on selection, visual feedback states, and screen reader announcements. The component preserves its vertical list layout and maintains consistent spacing and alignment regardless of translated text length variations. Purpose selection logic continues to function identically across all languages. The selected purpose value remains language-independent using the internal purpose type constants rather than translated labels.

### User Impact
All users who select a non-English language experience the purpose selection step in their chosen language, directly affecting their understanding of what each purpose type means and how it will shape their content. This impacts every user who creates article-type items since the purpose selection drives automatic title generation. Users with limited English proficiency can accurately understand the distinction between "How to Use" and "How to Clean" or between "Troubleshooting" and "Safety Information" in their native language, reducing incorrect purpose selections. International users see clear, translated descriptions that explain what type of information belongs in each purpose category, improving content organization and searchability. Screen reader users configured for non-English languages hear purpose options announced in their preferred language, enhancing accessibility during the selection process. Users who switch languages mid-workflow see purpose labels and descriptions update immediately while preserving their previously selected purpose value.

### Business Value
Localizing the purpose selection step is critical because this choice determines how article titles are automatically generated and how content is categorized for guest discovery. Clear, translated purpose labels and descriptions reduce mis-categorization errors among non-English speakers who might confuse similar-sounding English terms. Accurate purpose selection improves content findability for guests since items are organized by purpose type in the guest interface. This localization ensures international property owners categorize their content correctly on the first attempt, reducing the need for manual recategorization by moderators or support staff. Proper categorization driven by clear, translated purpose descriptions enhances the overall guest experience by making it easier to find specific types of information about property items. Native-language purpose descriptions demonstrate platform attention to detail and international user needs, increasing user confidence during the content creation workflow.

### Acceptance Criteria
- [ ] The PurposeStep component imports the useTranslations hook from next-intl
- [ ] The workflow namespace is loaded using useTranslations('workflow')
- [ ] The heading "What's the purpose of this content?" uses a translation key from workflow.purposeStep.heading
- [ ] The subheading "Choose what you want to help guests with" uses a translation key from workflow.purposeStep.subheading
- [ ] The "How to Use" label uses a translation key from workflow.purposes.howToUse.label
- [ ] The "How to Use" description uses a translation key from workflow.purposes.howToUse.description
- [ ] The "How to Clean" label uses a translation key from workflow.purposes.howToClean.label
- [ ] The "How to Clean" description uses a translation key from workflow.purposes.howToClean.description
- [ ] The "Troubleshooting" label uses a translation key from workflow.purposes.troubleshooting.label
- [ ] The "Troubleshooting" description uses a translation key from workflow.purposes.troubleshooting.description
- [ ] The "Safety Information" label uses a translation key from workflow.purposes.safetyInfo.label
- [ ] The "Safety Information" description uses a translation key from workflow.purposes.safetyInfo.description
- [ ] The "Maintenance" label uses a translation key from workflow.purposes.maintenance.label
- [ ] The "Maintenance" description uses a translation key from workflow.purposes.maintenance.description
- [ ] The "Features" label uses a translation key from workflow.purposes.features.label
- [ ] The "Features" description uses a translation key from workflow.purposes.features.description
- [ ] The "Other" label uses a translation key from workflow.purposes.other.label
- [ ] The "Other" description uses a translation key from workflow.purposes.other.description
- [ ] The "Continue" button label uses a translation key from workflow.buttons.continue
- [ ] The ARIA label "Select content purpose" uses a translated accessibility string from workflow.accessibility.purposeStep.ariaLabel
- [ ] The screen reader instructions "Use up and down arrow keys to navigate. Press Enter or Space to select" use a translated string from workflow.accessibility.purposeStep.keyboardHelp
- [ ] No hardcoded English strings remain in the component's JSX or logic
- [ ] The component maintains its keyboard navigation functionality with arrow keys regardless of language
- [ ] The auto-advance behavior on purpose selection continues to work correctly after language changes
- [ ] Selection state management continues to work correctly using purpose type constants (not translated labels)
- [ ] Purpose validation logic functions identically in all supported languages
- [ ] The component displays correctly in all six supported languages without text overflow or layout breaks
- [ ] Longer translated labels in languages like German or French do not cause card height inconsistencies or text clipping
- [ ] Purpose descriptions with varying lengths maintain consistent card layout and alignment
- [ ] Console shows no missing translation warnings when the component is viewed in English
- [ ] Accessibility testing with screen readers confirms purpose options announce correctly in each language
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] TypeScript types correctly reflect the translation key structure for type-safe t() calls
- [ ] Existing unit tests pass or are updated to accommodate translation function calls
- [ ] Visual regression testing confirms consistent card layout remains correct across all languages and viewport sizes
- [ ] Manual testing in all six languages confirms successful purpose selection and workflow progression
- [ ] Icon alignment and spacing remain consistent across all languages despite label length variations
- [ ] Hover and focus states continue to function correctly with translated text
- [ ] The checkmark indicator for selected state displays consistently regardless of text length variations
- [ ] Screen reader announcements for selection changes occur in the user's selected language


---

## REQ-377: Update ContentTypeStep Component for Internationalization

**Date**: 2026-01-19 22:30
**Type**: ENHANCEMENT
**Size**: M
**Epic**: Epic 2: Static UI Localization
**Phase**: Phase 2C (Item Creation Workflow)
**Task**: 2C.7 - Update ContentTypeStep component

### Summary
The ContentTypeStep component must be refactored to use the t() function from next-intl for all user-facing strings, enabling content type selection interface text to display in the user's preferred language.

### Current Behavior
The ContentTypeStep component displays hardcoded English strings for the step heading "What content would you like to add?", the subheading "Choose how you want to add information for this item", and five unified content option cards. Following the REQ-162 consolidation, users see a single grid with all five options: "Record Video", "Take Photo", "Write Text", "Upload File" with subtitle "Video, Image, PDF, Text", and "Add Link". Each option card presents an icon with an English label and optional subtitle text. The "Continue" button text appears in English. The ARIA label "Select content type" displays in English, and the keyboard navigation help text "Use arrow keys to navigate. Press Enter or Space to select" shows in English for screen reader users. Users who have selected German, Spanish, French, Italian, or Dutch as their language preference encounter this English-only interface when choosing how to add content to their item, potentially misunderstanding their options or the supported file formats.

### Expected Behavior
The ContentTypeStep component imports and uses the useTranslations hook from next-intl to access workflow namespace translations. The step heading uses a translation key from workflow.contentTypeStep.heading. The subheading text uses a translation key from workflow.contentTypeStep.subheading. Each of the five unified content options uses translation keys for labels: workflow.contentTypes.recordVideo.label for "Record Video", workflow.contentTypes.takePhoto.label for "Take Photo", workflow.contentTypes.writeText.label for "Write Text", workflow.contentTypes.uploadFile.label for "Upload File", and workflow.contentTypes.addLink.label for "Add Link". The "Upload File" option subtitle displaying supported formats uses a translation key from workflow.contentTypes.uploadFile.subtitle. The "Continue" button text uses a translation key from workflow.buttons.continue. The ARIA label for the radiogroup uses a translated string from workflow.accessibility.contentTypeStep.ariaLabel. The keyboard navigation help text uses a translated string from workflow.accessibility.contentTypeStep.keyboardHelp. All text content displays in the user's selected language while maintaining the component's keyboard navigation with arrow keys, auto-advance behavior on selection after 150ms delay, roving tabindex management, two-column responsive grid layout that adapts to single column on mobile, visual selection states with checkmark indicators, and proper focus management. The component preserves its consolidated design showing all five options simultaneously without requiring separate content source selection. Content type selection logic continues to function identically across all languages using internal type constants rather than translated labels.

### User Impact
All users who select a non-English language experience the content type selection step in their chosen language, directly affecting their understanding of available content creation methods and supported file formats. This impacts every user who creates items since content type selection is a mandatory step in the workflow. Users with limited English proficiency can clearly distinguish between recording video, taking photos, writing text, uploading files, and adding links in their native language, reducing confusion about which option matches their needs. The translated subtitle for "Upload File" specifying "Video, Image, PDF, Text" in the user's language prevents international users from attempting to upload unsupported file types. Screen reader users configured for non-English languages hear content type options announced in their preferred language with proper context for keyboard navigation. Users who switch languages mid-workflow see content type labels update immediately while preserving their previously selected option state. International users can confidently select content creation methods without language barriers affecting their workflow progress.

### Business Value
Localizing the content type selection step is critical because this choice determines the user's path through the remaining workflow steps and directly impacts what type of content they can create for their items. Clear, translated content type labels reduce mis-selection errors among non-English speakers who might confuse similar English terms like "record" versus "upload" or misunderstand file format restrictions. The translated subtitle for upload file formats prevents user frustration from attempting unsupported file types, reducing error rates and support requests. This localization ensures international users select the appropriate content creation method on their first attempt, improving workflow completion rates and reducing abandonment during item creation. Native-language content type descriptions demonstrate platform polish and attention to international user needs, increasing user confidence when making workflow decisions. Proper localization at this step reduces the cognitive load for non-English speakers navigating the workflow, contributing to higher successful item creation rates across all supported language markets.

### Acceptance Criteria
- [ ] The ContentTypeStep component imports the useTranslations hook from next-intl
- [ ] The workflow namespace is loaded using useTranslations('workflow')
- [ ] The heading "What content would you like to add?" uses a translation key from workflow.contentTypeStep.heading
- [ ] The subheading "Choose how you want to add information for this item" uses a translation key from workflow.contentTypeStep.subheading
- [ ] The "Record Video" label uses a translation key from workflow.contentTypes.recordVideo.label
- [ ] The "Take Photo" label uses a translation key from workflow.contentTypes.takePhoto.label
- [ ] The "Write Text" label uses a translation key from workflow.contentTypes.writeText.label
- [ ] The "Upload File" label uses a translation key from workflow.contentTypes.uploadFile.label
- [ ] The "Upload File" subtitle "Video, Image, PDF, Text" uses a translation key from workflow.contentTypes.uploadFile.subtitle
- [ ] The "Add Link" label uses a translation key from workflow.contentTypes.addLink.label
- [ ] The "Continue" button label uses a translation key from workflow.buttons.continue
- [ ] The ARIA label "Select content type" uses a translated accessibility string from workflow.accessibility.contentTypeStep.ariaLabel
- [ ] The screen reader instructions "Use arrow keys to navigate. Press Enter or Space to select" use a translated string from workflow.accessibility.contentTypeStep.keyboardHelp
- [ ] No hardcoded English strings remain in the component's JSX or logic
- [ ] The component maintains its keyboard navigation functionality with arrow keys regardless of language
- [ ] The auto-advance behavior triggering 150ms after selection continues to work correctly with translated text
- [ ] The roving tabindex implementation for keyboard navigation continues to function properly across all languages
- [ ] Selection state management continues to work correctly using content type constants (not translated labels)
- [ ] The unified content options from UNIFIED_CONTENT_OPTIONS continue to map correctly to translated labels
- [ ] Content type validation logic functions identically in all supported languages
- [ ] The component displays correctly in all six supported languages without text overflow or layout breaks
- [ ] The two-column grid layout on tablet/desktop maintains consistent card heights despite label length variations
- [ ] The single-column layout on mobile displays correctly with translated labels in all languages
- [ ] Longer translated labels in languages like German or French do not cause card height inconsistencies or text clipping
- [ ] The subtitle for "Upload File" displays correctly without overflow regardless of translated text length
- [ ] Icon positioning and sizing remain consistent across all languages despite label length variations
- [ ] The checkmark indicator for selected state displays consistently regardless of text length variations
- [ ] Console shows no missing translation warnings when the component is viewed in English
- [ ] Accessibility testing with screen readers confirms content type options announce correctly in each language
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] TypeScript types correctly reflect the translation key structure for type-safe t() calls
- [ ] Existing unit tests pass or are updated to accommodate translation function calls
- [ ] Visual regression testing confirms consistent card layout remains correct across all languages and viewport sizes
- [ ] Manual testing in all six languages confirms successful content type selection and workflow progression
- [ ] Hover and focus states continue to function correctly with translated text
- [ ] Active state scaling animation (0.98 scale) continues to work properly with cards containing translated text
- [ ] Screen reader announcements for selection changes occur in the user's selected language


---

## REQ-378: Update MediaCaptureStep Component and Adapters for Internationalization

**Date**: 2026-01-19 14:23
**Type**: ENHANCEMENT
**Size**: M

### Summary
The MediaCaptureStep component and its related media capture adapters must display all user-facing text in the user's selected language by implementing next-intl translations.

### Current Behavior
The MediaCaptureStep component displays hardcoded English strings for the step heading "Capture Your Media", instructional text, permission request messages, error messages, recording controls, and status indicators. The component presents different interfaces based on content type: for video recording, users see English labels "Start Recording", "Stop Recording", duration timer format, and permission prompts like "Camera access is required to record video". For photo capture, users see English labels "Take Photo", "Retake", "Use Photo", and camera permission messages. The media capture adapters (VideoCaptureAdapter, PhotoCaptureAdapter) display English error messages for browser compatibility issues like "Video recording is not supported in your browser", device access failures such as "Failed to access camera", and recording errors including "Recording failed. Please try again". Status messages appear in English, including "Initializing camera...", "Recording in progress", and "Processing media...". Button labels for control actions display as "Cancel", "Retry", "Use This", and "Retake" in English. File size and duration information shows in English format with labels like "Duration: 0:00" and "Size: 0 MB". Preview area labels including "Preview", "No media captured yet", and quality selection options like "Standard Quality" and "High Quality" all appear in English. Users who have selected German, Spanish, French, Italian, or Dutch as their language preference encounter this English-only interface when capturing media for their items, potentially misunderstanding recording controls, error messages, or permission requirements.

### Expected Behavior
The MediaCaptureStep component imports and uses the useTranslations hook from next-intl to access workflow namespace translations. The step heading uses a translation key from workflow.mediaCaptureStep.heading. Content-type-specific instructions use translation keys: workflow.mediaCaptureStep.videoInstructions for video recording guidance, and workflow.mediaCaptureStep.photoInstructions for photo capture guidance. Recording control buttons use translation keys: workflow.mediaCaptureStep.controls.startRecording for "Start Recording", workflow.mediaCaptureStep.controls.stopRecording for "Stop Recording", workflow.mediaCaptureStep.controls.takePhoto for "Take Photo", workflow.mediaCaptureStep.controls.retake for "Retake", and workflow.mediaCaptureStep.controls.useMedia for "Use Photo" or "Use Video". Permission-related messages use translation keys from workflow.mediaCaptureStep.permissions.cameraRequired, workflow.mediaCaptureStep.permissions.microphoneRequired, and workflow.mediaCaptureStep.permissions.requestAccess. The VideoCaptureAdapter and PhotoCaptureAdapter receive the translation function as a prop and use translation keys for error messages: workflow.mediaCaptureStep.errors.notSupported for browser compatibility issues, workflow.mediaCaptureStep.errors.accessDenied for device access failures, workflow.mediaCaptureStep.errors.captureFailed for recording/capture failures, and workflow.mediaCaptureStep.errors.deviceNotFound when no camera/microphone is detected. Status messages use translation keys from workflow.mediaCaptureStep.status.initializing, workflow.mediaCaptureStep.status.recording, and workflow.mediaCaptureStep.status.processing. Preview area labels use translation keys from workflow.mediaCaptureStep.preview.label and workflow.mediaCaptureStep.preview.empty. Duration timer formatting uses a translated format string from workflow.mediaCaptureStep.durationFormat that supports time localization. File size labels use translation keys from workflow.mediaCaptureStep.fileSizeLabel. Quality selection options use translation keys from workflow.mediaCaptureStep.quality.standard and workflow.mediaCaptureStep.quality.high. Generic action buttons use translation keys from workflow.buttons.cancel and workflow.buttons.retry. All text content displays in the user's selected language while maintaining the component's media capture functionality, device permission handling, recording state management, preview rendering, and media blob generation. The adapters continue to handle browser-specific MediaRecorder API calls, stream management, and error conditions identically across all languages using internal state constants rather than translated strings.

### User Impact
All users who select a non-English language experience the media capture step in their chosen language, directly affecting their ability to understand recording controls, respond to permission requests, and interpret error messages. This impacts every user who chooses video recording or photo capture as their content type. Users with limited English proficiency can clearly understand when to grant camera/microphone permissions, how to start and stop recording, and what actions are available after capturing media in their native language. Translated error messages help international users troubleshoot issues like browser incompatibility, denied permissions, or device failures without language barriers. Users recording video see the duration timer and file size information in familiar, localized formats. Screen reader users configured for non-English languages hear recording status updates, control button labels, and error announcements in their preferred language. International users can confidently navigate the media capture interface without confusion about technical terms or control flow, improving their success rate in adding media content to items.

### Business Value
Localizing the media capture step is critical because this interface involves real-time user interaction with device hardware and permission prompts that are often anxiety-inducing for users unfamiliar with browser media APIs. Clear, translated permission request explanations reduce user hesitation to grant camera/microphone access, increasing media capture completion rates among international users. Native-language error messages enable users to self-diagnose and resolve common issues like browser compatibility or device selection without requiring support intervention, reducing support ticket volume. Translated recording controls prevent user mistakes during time-sensitive operations like video recording, where misunderstanding "Stop" versus "Cancel" could result in lost content. This localization demonstrates platform trustworthiness during a permission-sensitive interaction, increasing user confidence when granting device access. Properly localized status messages and timers improve user experience during waiting periods, reducing abandonment during camera initialization or media processing. Supporting media capture in native languages removes barriers for international users creating rich, visual content for their items, contributing to higher-quality item listings across all supported language markets.

### Acceptance Criteria
- [ ] The MediaCaptureStep component imports the useTranslations hook from next-intl
- [ ] The workflow namespace is loaded using useTranslations('workflow')
- [ ] The step heading "Capture Your Media" uses a translation key from workflow.mediaCaptureStep.heading
- [ ] Video recording instructions use a translation key from workflow.mediaCaptureStep.videoInstructions
- [ ] Photo capture instructions use a translation key from workflow.mediaCaptureStep.photoInstructions
- [ ] The "Start Recording" button label uses a translation key from workflow.mediaCaptureStep.controls.startRecording
- [ ] The "Stop Recording" button label uses a translation key from workflow.mediaCaptureStep.controls.stopRecording
- [ ] The "Take Photo" button label uses a translation key from workflow.mediaCaptureStep.controls.takePhoto
- [ ] The "Retake" button label uses a translation key from workflow.mediaCaptureStep.controls.retake
- [ ] The "Use Photo"/"Use Video" button labels use a translation key from workflow.mediaCaptureStep.controls.useMedia
- [ ] Camera permission request message uses a translation key from workflow.mediaCaptureStep.permissions.cameraRequired
- [ ] Microphone permission request message uses a translation key from workflow.mediaCaptureStep.permissions.microphoneRequired
- [ ] Permission access instruction uses a translation key from workflow.mediaCaptureStep.permissions.requestAccess
- [ ] The VideoCaptureAdapter receives the translation function (t) as a prop
- [ ] The PhotoCaptureAdapter receives the translation function (t) as a prop
- [ ] Browser not supported error uses a translation key from workflow.mediaCaptureStep.errors.notSupported
- [ ] Device access denied error uses a translation key from workflow.mediaCaptureStep.errors.accessDenied
- [ ] Capture failure error uses a translation key from workflow.mediaCaptureStep.errors.captureFailed
- [ ] Device not found error uses a translation key from workflow.mediaCaptureStep.errors.deviceNotFound
- [ ] "Initializing camera" status uses a translation key from workflow.mediaCaptureStep.status.initializing
- [ ] "Recording in progress" status uses a translation key from workflow.mediaCaptureStep.status.recording
- [ ] "Processing media" status uses a translation key from workflow.mediaCaptureStep.status.processing
- [ ] Preview area label uses a translation key from workflow.mediaCaptureStep.preview.label
- [ ] "No media captured yet" empty state uses a translation key from workflow.mediaCaptureStep.preview.empty
- [ ] Duration timer format uses a localized format string from workflow.mediaCaptureStep.durationFormat
- [ ] File size label uses a translation key from workflow.mediaCaptureStep.fileSizeLabel
- [ ] "Standard Quality" option uses a translation key from workflow.mediaCaptureStep.quality.standard
- [ ] "High Quality" option uses a translation key from workflow.mediaCaptureStep.quality.high
- [ ] "Cancel" button label uses a translation key from workflow.buttons.cancel
- [ ] "Retry" button label uses a translation key from workflow.buttons.retry
- [ ] No hardcoded English strings remain in the MediaCaptureStep component JSX or logic
- [ ] No hardcoded English strings remain in VideoCaptureAdapter or PhotoCaptureAdapter error handling
- [ ] The component maintains its device permission request functionality regardless of language
- [ ] MediaRecorder API calls and stream management continue to work identically across all languages
- [ ] Recording state management (idle, initializing, recording, stopped, error) functions correctly with translated UI
- [ ] Media blob generation and preview rendering work correctly regardless of language settings
- [ ] Browser compatibility detection continues to function using internal constants, not translated strings
- [ ] Device enumeration and selection logic works identically in all supported languages
- [ ] Error handling and retry logic function correctly with translated error messages
- [ ] Duration timer updates correctly during recording with localized time format in all languages
- [ ] File size calculations display correctly with appropriate units in all languages
- [ ] The component displays correctly in all six supported languages without text overflow or layout breaks
- [ ] Button labels maintain consistent sizing and alignment despite translation length variations
- [ ] Longer translated error messages in languages like German or French do not cause modal or dialog overflow
- [ ] Permission prompt explanations display correctly without text clipping in all languages
- [ ] Status indicator positioning remains consistent regardless of translated status text length
- [ ] Preview area layout adapts correctly to translated labels in all languages
- [ ] Control button groups maintain proper spacing with translated labels of varying lengths
- [ ] Console shows no missing translation warnings when the component is viewed in English
- [ ] Accessibility testing with screen readers confirms recording controls and status updates announce correctly in each language
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] TypeScript types correctly reflect the translation key structure for type-safe t() calls in adapters
- [ ] Adapter interfaces are updated to include the translation function prop with proper typing
- [ ] Existing unit tests for MediaCaptureStep pass or are updated to accommodate translation function calls
- [ ] Existing unit tests for adapters pass or are updated to mock translation functions
- [ ] Integration tests confirm media capture flow works correctly in all six languages
- [ ] Manual testing with real camera/microphone in all six languages confirms successful media capture
- [ ] Error scenarios (permission denied, device not found, browser not supported) display translated messages correctly
- [ ] Quality selection changes reflect in UI with translated labels in all languages
- [ ] Retake workflow functions correctly with translated control labels
- [ ] Screen reader announcements for state changes (initializing → recording → stopped) occur in user's selected language


---

## REQ-379: Update PreviewSaveStep Component for Internationalization

**Date**: 2026-01-19 13:58
**Type**: ENHANCEMENT
**Size**: L

### Summary
The PreviewSaveStep component must display all user-facing text in the user's selected language by implementing next-intl translations, including form labels, button text, status messages, confirmation dialogs, placeholder text, and accessibility announcements.

### Current Behavior
The PreviewSaveStep component displays hardcoded English strings throughout its interface. The main step heading shows "Preview & Save" in English. Section headings appear as "Content" with a count badge and "Item Details" in English. Form field labels display in English including "Room", "Item Type", "Item Name", "Item Description", "Guide/Article Title", and "Tags". Placeholder text appears in English: "Enter item name", "Enter a brief description of this item (optional)", and "Enter guide/article title". The primary action button shows "Save Item" or "Saving..." with a loading spinner during save operations. The success overlay displays English text including the heading "Item Saved!", descriptive text "Your item has been saved and is ready for your guests!", and a "Continue" button. Empty content state shows "No content added yet" with an "Add Content" button. The small add more link displays "+ Add More" in English. Maximum content limit indicator shows "Maximum reached" in English. The confirmation dialog for removing the last content piece displays English heading "Remove Last Content?", descriptive text "This is the only piece of content. Removing it will leave this item empty. Are you sure you want to remove it?", and action buttons "Keep" and "Remove". Error state messages appear in English including "Failed to save item" with a "Dismiss" button, and the guard message "No item data available. Please start a new item." with a "Go Back" button. Accessibility features use English announcements for drag-and-drop operations including "Picked up [type] content. Current position: X of Y. Use arrow keys to move.", "Over position X", "Dropped [type] content. New position: X of Y", "Position unchanged.", and "Drag cancelled. Content returned to original position." Screen reader live regions announce "Item saved successfully" and "Error: [message]" in English. ARIA labels including "Go back", "Item details form", "Content section heading", "[X] content pieces", and "Content pieces - drag to reorder" all appear in English. Users who have selected German, Spanish, French, Italian, or Dutch as their language preference encounter this entirely English interface when reviewing and saving their items.

### Expected Behavior
The PreviewSaveStep component imports and uses the useTranslations hook from next-intl to access workflow namespace translations. The main step heading "Preview & Save" uses a translation key from workflow.previewSaveStep.heading. The ItemDetailsSection area label uses workflow.previewSaveStep.itemDetails.sectionLabel. Form field labels use translation keys: workflow.previewSaveStep.itemDetails.labels.itemName for "Item Name", workflow.previewSaveStep.itemDetails.labels.itemDescription for "Item Description", workflow.previewSaveStep.itemDetails.labels.room for "Room", workflow.previewSaveStep.itemDetails.labels.itemType for "Item Type", workflow.previewSaveStep.itemDetails.labels.articleTitle for "Guide/Article Title", and workflow.previewSaveStep.itemDetails.labels.tags for "Tags". Placeholder text uses translation keys: workflow.previewSaveStep.itemDetails.placeholders.itemName for "Enter item name", workflow.previewSaveStep.itemDetails.placeholders.itemDescription for the description placeholder, and workflow.previewSaveStep.itemDetails.placeholders.articleTitle for the article title placeholder. The ContentSection heading uses workflow.previewSaveStep.content.heading. The content count accessibility label uses a translation key workflow.previewSaveStep.content.countLabel with interpolation for the count value. The "Maximum reached" indicator uses workflow.previewSaveStep.content.maxReached. The empty content state message "No content added yet" uses workflow.previewSaveStep.content.emptyState, with the "Add Content" button using workflow.previewSaveStep.content.buttons.addContent. The small add more link uses workflow.previewSaveStep.content.buttons.addMore. Drag-and-drop accessibility announcements use translation keys: workflow.previewSaveStep.dragDrop.announcements.pickedUp with interpolation for content type, position, and total count; workflow.previewSaveStep.dragDrop.announcements.overPosition with position interpolation; workflow.previewSaveStep.dragDrop.announcements.dropped with interpolation for type and new position; workflow.previewSaveStep.dragDrop.announcements.unchanged for "Position unchanged"; and workflow.previewSaveStep.dragDrop.announcements.cancelled for drag cancellation. The ARIA label for the content list uses workflow.previewSaveStep.dragDrop.contentListLabel. The save button states use translation keys: workflow.previewSaveStep.buttons.save for "Save Item" and workflow.previewSaveStep.buttons.saving for "Saving..." during save operations. The success overlay uses translation keys: workflow.previewSaveStep.success.heading for "Item Saved!", workflow.previewSaveStep.success.description for the success message, workflow.previewSaveStep.success.qrCodeAlt for QR code alt text with item name interpolation, and workflow.previewSaveStep.success.buttons.continue for "Continue". The last content removal confirmation dialog uses translation keys: workflow.previewSaveStep.confirmRemove.heading for "Remove Last Content?", workflow.previewSaveStep.confirmRemove.message for the warning message, workflow.previewSaveStep.confirmRemove.buttons.keep for "Keep", and workflow.previewSaveStep.confirmRemove.buttons.remove for "Remove". Error handling uses translation keys: workflow.previewSaveStep.errors.saveFailed for generic save errors, workflow.previewSaveStep.errors.noData for "No item data available. Please start a new item.", and workflow.buttons.dismiss for "Dismiss". Navigation buttons use workflow.buttons.goBack for the back arrow button's aria-label. Screen reader announcements use workflow.previewSaveStep.announcements.saveSuccess for "Item saved successfully" and workflow.previewSaveStep.announcements.saveError for error announcements. All text content displays in the user's selected language while maintaining the component's form editing functionality, drag-and-drop content reordering, item metadata management, save operation handling, success overlay display, confirmation dialog behavior, and guard condition rendering.

### User Impact
All users who select a non-English language experience the preview and save step in their chosen language, directly affecting the final review and save operation for every item they create. This impacts every user's workflow completion experience. Users with limited English proficiency can clearly understand which fields contain what information, read success confirmations in their native language, and interpret validation feedback without language barriers. Translated form labels help international users verify their room selection, item type, item name, description, article title, and tags before saving. Native-language placeholder text provides clear guidance on what to enter in each field. Localized button labels eliminate confusion about whether clicking will save the item or perform another action. Success messages in the user's language provide clear confirmation that their work has been saved and the QR code is ready. Confirmation dialogs in native language prevent accidental deletion of content by ensuring users understand the consequences of removing the last content piece. Translated error messages enable users to understand what went wrong during save operations and what action to take. Accessibility improvements benefit screen reader users who receive drag-and-drop announcements, form labels, and status updates in their configured language, making content reordering operations clearer for users with visual impairments across all supported languages.

### Business Value
Localizing the preview and save step is critical because this is the final interaction before item creation completes, where users commit their work and receive confirmation of success. Clear, translated form labels reduce user errors during final review, decreasing the likelihood of items being saved with incorrect metadata that would require editing later. Native-language success messages provide psychological closure and confidence that the operation succeeded, reducing support inquiries from users uncertain whether their item was created. Translated confirmation dialogs for destructive actions like content removal prevent accidental data loss by ensuring users fully understand warnings regardless of language background. Localized drag-and-drop announcements make content reordering accessible to screen reader users in all supported languages, improving accessibility compliance and usability for users with disabilities internationally. Success overlay QR code presentation with translated labels creates a positive final impression in the user's native language, reinforcing platform professionalism and cultural consideration. Clear error messages in native languages enable users to self-diagnose save failures without requiring support escalation, reducing support ticket volume and resolution time. This localization completes the end-to-end internationalization of the item creation workflow, ensuring international users receive a consistent, native-language experience from room selection through final save confirmation, increasing workflow completion rates and user satisfaction across all supported language markets.

### Acceptance Criteria
- [ ] The PreviewSaveStep component imports the useTranslations hook from next-intl
- [ ] The workflow namespace is loaded using useTranslations('workflow')
- [ ] The main step heading "Preview & Save" uses a translation key from workflow.previewSaveStep.heading
- [ ] The back button aria-label uses a translation key from workflow.buttons.goBack
- [ ] ItemDetailsSection section aria-label uses a translation key from workflow.previewSaveStep.itemDetails.sectionLabel
- [ ] "Item Name" label uses a translation key from workflow.previewSaveStep.itemDetails.labels.itemName
- [ ] Item name placeholder uses a translation key from workflow.previewSaveStep.itemDetails.placeholders.itemName
- [ ] "Item Description" label uses a translation key from workflow.previewSaveStep.itemDetails.labels.itemDescription
- [ ] Item description placeholder uses a translation key from workflow.previewSaveStep.itemDetails.placeholders.itemDescription
- [ ] "Room" label uses a translation key from workflow.previewSaveStep.itemDetails.labels.room
- [ ] "Item Type" label uses a translation key from workflow.previewSaveStep.itemDetails.labels.itemType
- [ ] "Guide/Article Title" label uses a translation key from workflow.previewSaveStep.itemDetails.labels.articleTitle
- [ ] Article title placeholder uses a translation key from workflow.previewSaveStep.itemDetails.placeholders.articleTitle
- [ ] "Tags" label uses a translation key from workflow.previewSaveStep.itemDetails.labels.tags
- [ ] ContentSection heading "Content" uses a translation key from workflow.previewSaveStep.content.heading
- [ ] Content count aria-label uses a translation key from workflow.previewSaveStep.content.countLabel with count interpolation
- [ ] "Maximum reached" indicator uses a translation key from workflow.previewSaveStep.content.maxReached
- [ ] "No content added yet" message uses a translation key from workflow.previewSaveStep.content.emptyState
- [ ] "Add Content" button in empty state uses a translation key from workflow.previewSaveStep.content.buttons.addContent
- [ ] "+ Add More" link uses a translation key from workflow.previewSaveStep.content.buttons.addMore
- [ ] Content list aria-label uses a translation key from workflow.previewSaveStep.dragDrop.contentListLabel
- [ ] Drag start announcement uses a translation key from workflow.previewSaveStep.dragDrop.announcements.pickedUp with type, position, and total interpolation
- [ ] Drag over announcement uses a translation key from workflow.previewSaveStep.dragDrop.announcements.overPosition with position interpolation
- [ ] Drag end announcement uses a translation key from workflow.previewSaveStep.dragDrop.announcements.dropped with type and position interpolation
- [ ] Drag unchanged announcement uses a translation key from workflow.previewSaveStep.dragDrop.announcements.unchanged
- [ ] Drag cancelled announcement uses a translation key from workflow.previewSaveStep.dragDrop.announcements.cancelled
- [ ] "Save Item" button label uses a translation key from workflow.previewSaveStep.buttons.save
- [ ] "Saving..." button label uses a translation key from workflow.previewSaveStep.buttons.saving
- [ ] Success overlay heading "Item Saved!" uses a translation key from workflow.previewSaveStep.success.heading
- [ ] Success overlay description uses a translation key from workflow.previewSaveStep.success.description
- [ ] QR code alt text uses a translation key from workflow.previewSaveStep.success.qrCodeAlt with item name interpolation
- [ ] Success overlay "Continue" button uses a translation key from workflow.previewSaveStep.success.buttons.continue
- [ ] Confirmation dialog heading "Remove Last Content?" uses a translation key from workflow.previewSaveStep.confirmRemove.heading
- [ ] Confirmation dialog message uses a translation key from workflow.previewSaveStep.confirmRemove.message
- [ ] Confirmation dialog "Keep" button uses a translation key from workflow.previewSaveStep.confirmRemove.buttons.keep
- [ ] Confirmation dialog "Remove" button uses a translation key from workflow.previewSaveStep.confirmRemove.buttons.remove
- [ ] Save error message uses a translation key from workflow.previewSaveStep.errors.saveFailed
- [ ] "Dismiss" button uses a translation key from workflow.buttons.dismiss
- [ ] No data guard message uses a translation key from workflow.previewSaveStep.errors.noData
- [ ] "Go Back" button in guard state uses a translation key from workflow.buttons.goBack
- [ ] Save success screen reader announcement uses a translation key from workflow.previewSaveStep.announcements.saveSuccess
- [ ] Save error screen reader announcement uses a translation key from workflow.previewSaveStep.announcements.saveError with error interpolation
- [ ] No hardcoded English strings remain in the PreviewSaveStep component JSX or logic
- [ ] No hardcoded English strings remain in sub-components: EmptyContentState, ItemDetailsDisplay, ItemDetailsSection, ContentSection, SuccessOverlay
- [ ] The component maintains its form editing functionality regardless of language
- [ ] Item name editing with onChange callback works correctly with translated labels
- [ ] Item description editing works correctly with translated labels and placeholders
- [ ] Article title editing works correctly with translated labels and placeholders
- [ ] Room and item type dropdown selection works correctly with translated labels
- [ ] Tags editing using TagsEditor component works correctly with translated label
- [ ] Drag-and-drop content reordering functions identically across all languages
- [ ] DndKit sensors (pointer, touch, keyboard) work correctly with translated announcements
- [ ] Content piece removal with confirmation dialog functions correctly with translated text
- [ ] Save operation handling and error display work correctly with translated messages
- [ ] Success overlay display with QR code shows correctly with translated text
- [ ] Guard condition rendering for null currentItem works correctly with translated message
- [ ] Maximum content piece limit enforcement displays correctly with translated indicator
- [ ] Empty content state rendering and "Add Content" action work correctly with translated text
- [ ] Screen reader live region announcements function correctly in all languages
- [ ] The component displays correctly in all six supported languages without text overflow or layout breaks
- [ ] Form labels maintain consistent alignment and spacing despite translation length variations
- [ ] Longer translated placeholders in languages like German or French do not cause input field overflow
- [ ] Success overlay heading and description display correctly without text clipping in all languages
- [ ] Confirmation dialog message displays correctly in modal without overflow in all languages
- [ ] Button labels maintain consistent sizing with translated text of varying lengths
- [ ] Content section heading with count badge displays correctly across all languages
- [ ] Drag-and-drop announcements for screen readers handle long translated strings gracefully
- [ ] QR code display and label in success overlay maintain proper alignment with translated text
- [ ] Error message display adapts correctly to translated message lengths in all languages
- [ ] Console shows no missing translation warnings when the component is viewed in English
- [ ] Accessibility testing with screen readers confirms form labels, buttons, and announcements read correctly in each language
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] TypeScript types correctly reflect the translation key structure for type-safe t() calls
- [ ] Existing unit tests for PreviewSaveStep pass or are updated to accommodate translation function calls
- [ ] Integration tests confirm save flow works correctly in all six languages
- [ ] Manual testing in all six languages confirms successful item preview, editing, and save operations
- [ ] Drag-and-drop testing confirms reordering works correctly with translated announcements in all languages
- [ ] Confirmation dialog testing confirms last content removal warning displays correctly in all languages
- [ ] Success overlay testing confirms QR code display and translated success message appear correctly in all languages
- [ ] Error scenario testing confirms save failures display translated error messages correctly
- [ ] Guard condition testing confirms null currentItem state displays translated fallback message
- [ ] Form validation testing confirms required field checks work correctly with translated labels
- [ ] Screen reader testing confirms all announcements occur in the user's selected language
- [ ] Visual regression testing confirms consistent layout across all languages and viewport sizes


---

## REQ-380: Update SessionSummaryStep Component for Internationalization

**Date**: 2026-01-19 11:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
The SessionSummaryStep component must display a summary of the completed item creation session in the user's selected language using next-intl translations.

### Current Behavior
The SessionSummaryStep component displays hardcoded English strings throughout its interface. The main step heading shows "Session Complete" in English. The summary section displays "You've successfully created:" followed by item details in English. Status messages like "Item saved successfully" and "Ready to share with guests" appear in English. Descriptive labels including "Item Name:", "Room:", "Type:", and "Content Pieces:" all display in English. Action button labels show "Create Another Item" and "View All Items" in English. Success indicators and confirmation messages appear exclusively in English. Users who have selected German, Spanish, French, Italian, or Dutch as their language preference encounter this entirely English summary screen after completing their item creation workflow.

### Expected Behavior
The SessionSummaryStep component imports and uses the useTranslations hook from next-intl to access workflow namespace translations. The main step heading "Session Complete" uses a translation key from workflow.sessionSummary.heading. The introductory message "You've successfully created:" uses workflow.sessionSummary.intro. Status messages use translation keys: workflow.sessionSummary.status.saved for "Item saved successfully" and workflow.sessionSummary.status.ready for "Ready to share with guests". Item detail labels use translation keys: workflow.sessionSummary.labels.itemName for "Item Name:", workflow.sessionSummary.labels.room for "Room:", workflow.sessionSummary.labels.type for "Type:", and workflow.sessionSummary.labels.contentPieces for "Content Pieces:" with count interpolation. Action buttons use translation keys: workflow.sessionSummary.buttons.createAnother for "Create Another Item" and workflow.sessionSummary.buttons.viewAll for "View All Items". All text content displays in the user's selected language while maintaining the component's display functionality, navigation actions, and session completion behavior.

### User Impact
All users who complete the item creation workflow see the summary screen in their chosen language, providing closure and confirmation in their native language. This impacts every user's final experience in the workflow. Users with limited English proficiency can clearly understand what they created, verify the item details, and understand their next action options without language barriers. Translated status messages provide clear confirmation that their work was saved successfully and is ready for guests to access. Native-language labels help international users verify the item name, room assignment, item type, and content count at a glance. Localized action buttons eliminate confusion about whether to create another item or return to view all items.

### Business Value
Localizing the session summary step provides professional closure to the item creation workflow by presenting success confirmation and next-step options in the user's native language. This creates a positive final impression that reinforces platform accessibility and cultural consideration. Clear translated status messages reduce user uncertainty about whether their item was successfully saved, decreasing support inquiries from users seeking confirmation. Native-language action buttons with clear labels increase engagement with additional workflow iterations or navigation to item management, supporting higher content creation rates. This localization completes the comprehensive internationalization of the entire item creation workflow from start to finish.

### Acceptance Criteria
- [ ] The SessionSummaryStep component imports the useTranslations hook from next-intl
- [ ] The workflow namespace is loaded using useTranslations('workflow')
- [ ] The main heading "Session Complete" uses a translation key from workflow.sessionSummary.heading
- [ ] The introductory message "You've successfully created:" uses workflow.sessionSummary.intro
- [ ] The success status message uses a translation key from workflow.sessionSummary.status.saved
- [ ] The ready status message uses a translation key from workflow.sessionSummary.status.ready
- [ ] "Item Name:" label uses a translation key from workflow.sessionSummary.labels.itemName
- [ ] "Room:" label uses a translation key from workflow.sessionSummary.labels.room
- [ ] "Type:" label uses a translation key from workflow.sessionSummary.labels.type
- [ ] "Content Pieces:" label uses a translation key from workflow.sessionSummary.labels.contentPieces with count interpolation
- [ ] "Create Another Item" button uses a translation key from workflow.sessionSummary.buttons.createAnother
- [ ] "View All Items" button uses a translation key from workflow.sessionSummary.buttons.viewAll
- [ ] No hardcoded English strings remain in the SessionSummaryStep component
- [ ] The component maintains its display functionality regardless of language
- [ ] Navigation to create another item works correctly with translated button
- [ ] Navigation to view all items works correctly with translated button
- [ ] Item details display correctly with translated labels in all six supported languages
- [ ] Status messages display correctly without text overflow or layout breaks
- [ ] Button labels maintain consistent sizing with translated text of varying lengths
- [ ] Console shows no missing translation warnings when the component is viewed in English
- [ ] The component gracefully handles missing translation keys without crashing
- [ ] Existing tests pass or are updated to accommodate translation function calls
- [ ] Manual testing in all six languages confirms correct display and navigation functionality



---

## REQ-381: Update All Shared Components in Item Creation Workflow for Internationalization

**Date**: 2026-01-19 16:30
**Type**: ENHANCEMENT
**Size**: XL

### Summary
All shared components used throughout the Item Creation Workflow (25+ files) must be updated to support internationalization by importing and using the next-intl translation function for all UI strings.

### Current Behavior
The Item Creation Workflow contains 25+ shared components located in src/components/ItemCreationWorkflow that currently display hardcoded English strings. These include form controls, validation messages, error states, loading indicators, modal dialogs, tooltips, helper text, icon labels, status badges, progress indicators, confirmation dialogs, empty states, placeholder text, navigation breadcrumbs, keyboard shortcut hints, accessibility announcements, success notifications, warning banners, info panels, action sheets, dropdown menus, radio button groups, checkbox labels, and other reusable UI elements. Each component contains various hardcoded strings including labels ("Select", "Cancel", "Confirm"), messages ("No items found", "Loading..."), placeholders ("Enter text here"), tooltips ("Click to expand"), validation feedback ("Required field", "Invalid format"), and accessibility text ("Opens in new window"). Users who have selected German, Spanish, French, Italian, or Dutch encounter these English strings scattered throughout the workflow regardless of their language preference. The lack of translation support in shared components creates an inconsistent experience where main step components display translated content but nested shared components revert to English.

### Expected Behavior
Each of the 25+ shared components imports and uses the useTranslations hook from next-intl to access the appropriate namespace (workflow.shared, common, or component-specific namespaces). All hardcoded UI strings are extracted into translation keys organized by component and string type (labels, messages, placeholders, tooltips, errors, accessibility). Form control components use translation keys for labels, placeholders, and validation messages with proper variable interpolation where needed. Modal and dialog components use translation keys for titles, body text, and action button labels. Status and notification components use translation keys for all status messages, success confirmations, error notifications, and warning banners. Empty state components use translation keys for heading, description, and call-to-action text. Loading indicators use translation keys for loading messages and progress descriptions. Tooltip and helper text components use translation keys for all explanatory content. Navigation components use translation keys for breadcrumb labels and navigation hints. All aria-label and aria-describedby attributes use translated strings for accessibility. Components maintain their existing functionality, styling, event handling, and prop interfaces while displaying all text content in the user's selected language. Translation keys follow consistent naming conventions across all shared components for maintainability.

### User Impact
All users navigating through the item creation workflow experience complete language consistency from beginning to end, eliminating jarring switches between their chosen language and English. This affects every user interaction with the 25+ shared components used throughout the workflow. Users with limited English proficiency can understand all form controls, validation feedback, error messages, confirmation dialogs, and helper text without encountering language barriers. Translated validation messages help users correct form errors without confusion about what went wrong. Native-language confirmation dialogs ensure users understand the consequences of their actions before proceeding. Localized empty states and loading messages provide clear communication about system state. Screen reader users receive all accessibility announcements in their selected language, improving navigation and comprehension. The comprehensive localization of shared components creates a seamless, professional user experience that respects user language preferences throughout the entire workflow.

### Business Value
Localizing all shared components in the Item Creation Workflow completes the comprehensive internationalization effort, eliminating all remaining English-only interfaces that undermine the platform's commitment to accessibility and global reach. Consistent language support across all components reduces user confusion and frustration, directly decreasing abandonment rates in the item creation workflow. Professional, complete localization builds trust with international users and positions the platform as culturally considerate and accessible. Reduced language barriers in form validation and error handling decrease support ticket volume from users struggling to understand English-only feedback. This systematic component-level localization establishes reusable patterns and infrastructure that accelerate future internationalization efforts across other platform features. The investment in comprehensive shared component translation pays dividends across all current and future features that reuse these components.

### Acceptance Criteria
- [ ] All 25+ shared components in src/components/ItemCreationWorkflow are identified and catalogued
- [ ] Each shared component imports the useTranslations hook from next-intl
- [ ] Appropriate translation namespaces are selected for each component (workflow.shared, common, or component-specific)
- [ ] All hardcoded labels are replaced with translation function calls using workflow.shared.labels.* keys
- [ ] All hardcoded button text is replaced with translation function calls using workflow.shared.buttons.* keys
- [ ] All hardcoded placeholder text is replaced with translation function calls using workflow.shared.placeholders.* keys
- [ ] All hardcoded validation messages are replaced with translation function calls using workflow.shared.validation.* keys
- [ ] All hardcoded error messages are replaced with translation function calls using workflow.shared.errors.* keys
- [ ] All hardcoded success messages are replaced with translation function calls using workflow.shared.success.* keys
- [ ] All hardcoded warning messages are replaced with translation function calls using workflow.shared.warnings.* keys
- [ ] All hardcoded info messages are replaced with translation function calls using workflow.shared.info.* keys
- [ ] All hardcoded tooltip text is replaced with translation function calls using workflow.shared.tooltips.* keys
- [ ] All hardcoded helper text is replaced with translation function calls using workflow.shared.help.* keys
- [ ] All hardcoded empty state messages are replaced with translation function calls using workflow.shared.emptyStates.* keys
- [ ] All hardcoded loading messages are replaced with translation function calls using workflow.shared.loading.* keys
- [ ] All hardcoded modal dialog content is replaced with translation function calls using workflow.shared.modals.* keys
- [ ] All hardcoded confirmation dialog content is replaced with translation function calls using workflow.shared.confirmations.* keys
- [ ] All hardcoded accessibility text (aria-label, aria-describedby) is replaced with translation function calls
- [ ] All components handle variable interpolation correctly for dynamic content (counts, names, dates)
- [ ] All components maintain their existing functionality after translation updates
- [ ] All components maintain their existing styling and layout after translation updates
- [ ] All components maintain their existing prop interfaces without breaking changes
- [ ] Translation keys follow consistent naming conventions across all shared components
- [ ] No hardcoded English strings remain in any shared component
- [ ] Components gracefully handle missing translation keys without crashing
- [ ] All components display correctly in all six supported languages (English, German, Spanish, French, Italian, Dutch)
- [ ] Form validation messages display correctly with proper variable interpolation in all languages
- [ ] Modal and dialog components display titles, body text, and buttons correctly without text overflow
- [ ] Tooltip text displays correctly without truncation in all languages
- [ ] Empty state messages display correctly with proper formatting in all languages
- [ ] Loading messages display correctly during async operations in all languages
- [ ] Confirmation dialogs display translated content correctly with proper button alignment
- [ ] Status badges and indicators display translated status text correctly
- [ ] Dropdown menus and select options display translated options correctly
- [ ] Radio button and checkbox labels display translated text correctly with proper alignment
- [ ] Breadcrumb navigation displays translated labels correctly
- [ ] Accessibility announcements occur in the user's selected language
- [ ] Screen reader testing confirms all aria-label and aria-describedby content reads correctly in each language
- [ ] Console shows no missing translation warnings when any shared component is viewed in English
- [ ] TypeScript types correctly reflect translation key structures for type-safe t() calls
- [ ] Existing unit tests for shared components pass or are updated to accommodate translation function calls
- [ ] Integration tests confirm shared components work correctly within step components in all languages
- [ ] Manual testing in all six languages confirms all shared components display and function correctly
- [ ] Visual regression testing confirms consistent layout across all languages and viewport sizes
- [ ] Translation length variations (e.g., German compound words, French articles) do not cause layout breaks
- [ ] Form control components handle long translated labels without breaking form layout
- [ ] Error messages with variable interpolation display correctly formatted text in all languages
- [ ] Date and time formatting in messages respects locale-specific conventions where applicable
- [ ] Number formatting in count-based messages respects locale-specific conventions where applicable
- [ ] All shared components maintain consistent spacing and alignment despite translation length variations
- [ ] No text clipping or overflow occurs in any shared component in any supported language
- [ ] The component catalog documents which translation namespace each shared component uses
- [ ] Code review confirms translation key naming conventions are followed consistently
- [ ] Performance testing confirms translation function calls do not introduce noticeable latency



---

## REQ-382: Update All Dialog Components in Item Creation Workflow for Internationalization

**Date**: 2026-01-19 17:45
**Type**: ENHANCEMENT
**Size**: L

### Summary
All dialog components within the Item Creation Workflow must be updated to support internationalization by replacing hardcoded strings with translation function calls using the next-intl system.

### Current Behavior
Dialog components throughout the Item Creation Workflow currently display hardcoded English strings for titles, body text, button labels, warning messages, and confirmation prompts. These dialogs appear at various points in the workflow for actions such as confirming item deletion, warning about unsaved changes, validating media uploads, confirming step navigation, requesting permission for camera or microphone access, displaying error details, and showing success confirmations. Users who have selected German, Spanish, French, Italian, or Dutch encounter these critical dialog messages in English, creating confusion and uncertainty about important actions. Confirmation dialogs with unclear English text may lead users to make unintended choices because they cannot fully understand the consequences described in the dialog content.

### Expected Behavior
Each dialog component imports and uses the useTranslations hook from next-intl with the appropriate workflow namespace. Dialog titles use translation keys following the pattern workflow.[component].dialogs.[dialogName].title. Dialog body text uses translation keys following the pattern workflow.[component].dialogs.[dialogName].message with proper variable interpolation for dynamic content like item names, counts, or error details. Primary action buttons use translation keys from workflow.[component].dialogs.[dialogName].confirmButton, and secondary/cancel buttons use translation keys from workflow.[component].dialogs.[dialogName].cancelButton or common.buttons.cancel. Warning and error dialogs use translation keys from workflow.[component].dialogs.[dialogName].warningText or errorText. All aria-label and aria-describedby attributes in dialog components use translated strings for screen reader accessibility. Dialogs maintain their existing functionality, modal behavior, focus management, and event handlers while displaying all text in the user's selected language. Translation keys support variable interpolation for personalized messages such as "Are you sure you want to delete {itemName}?" where the item name appears correctly in the translated sentence structure.

### User Impact
Users navigating the item creation workflow encounter all critical dialogs and confirmation prompts in their selected language, eliminating language barriers at decision points. This affects every user interaction requiring confirmation or acknowledgment throughout the workflow. Users with limited English proficiency can confidently understand the consequences of destructive actions before confirming, reducing accidental data loss. Native-language warning messages about unsaved changes help users make informed decisions about navigation. Localized error dialog messages provide clear explanations about what went wrong and how to resolve issues. Screen reader users receive all dialog announcements and descriptions in their selected language, improving accessibility and comprehension of important prompts.

### Business Value
Translating dialog components reduces user errors and accidental data loss by ensuring users fully understand confirmation prompts and warning messages in their native language. This directly decreases user frustration and support ticket volume related to misunderstood actions. Professional localization of critical decision points builds user trust and confidence in the platform's cultural consideration. Accessible, translated dialogs improve compliance with international accessibility standards and demonstrate commitment to inclusive design. Completing dialog internationalization eliminates a major gap in the workflow's overall localization coverage, bringing the platform closer to production-ready international deployment.

### Acceptance Criteria
- [ ] All dialog components in the Item Creation Workflow are identified and catalogued
- [ ] Each dialog component imports the useTranslations hook from next-intl
- [ ] Dialog components use the appropriate workflow namespace (workflow.roomSelection, workflow.itemType, workflow.specificItem, workflow.purpose, workflow.contentType, workflow.mediaCapture, workflow.previewSave, workflow.sessionSummary, or workflow.shared)
- [ ] All dialog title text is replaced with translation function calls using workflow.[component].dialogs.[dialogName].title keys
- [ ] All dialog body/message text is replaced with translation function calls using workflow.[component].dialogs.[dialogName].message keys
- [ ] All primary action button labels are replaced with translation function calls using workflow.[component].dialogs.[dialogName].confirmButton keys
- [ ] All secondary/cancel button labels are replaced with translation function calls using workflow.[component].dialogs.[dialogName].cancelButton or common.buttons.cancel keys
- [ ] All warning text in dialogs is replaced with translation function calls using workflow.[component].dialogs.[dialogName].warningText keys
- [ ] All error text in dialogs is replaced with translation function calls using workflow.[component].dialogs.[dialogName].errorText keys
- [ ] Variable interpolation is implemented correctly for dynamic content (item names, counts, error messages)
- [ ] All aria-label attributes on dialog elements use translated strings
- [ ] All aria-describedby attributes on dialog elements use translated strings
- [ ] Translation keys follow consistent naming conventions across all dialog components
- [ ] No hardcoded English strings remain in any dialog component
- [ ] Dialogs maintain their existing modal behavior and focus management after translation updates
- [ ] Dialogs maintain their existing styling and layout after translation updates
- [ ] Dialogs maintain their existing event handlers and callback functions after translation updates
- [ ] Components gracefully handle missing translation keys without crashing
- [ ] All dialog components display correctly in all six supported languages (English, German, Spanish, French, Italian, Dutch)
- [ ] Dialog titles display correctly without text overflow or truncation in all languages
- [ ] Dialog body text displays correctly with proper line breaks and formatting in all languages
- [ ] Button labels maintain consistent sizing and alignment with translated text of varying lengths
- [ ] Warning and error messages display correctly with proper emphasis and formatting
- [ ] Dynamic content interpolation produces grammatically correct sentences in all languages
- [ ] Dialogs handle long translated text without breaking modal layout or causing scroll issues
- [ ] Confirmation dialogs clearly communicate the consequences of actions in all supported languages
- [ ] Destructive action dialogs (delete, discard) use appropriately strong language in translations
- [ ] Permission request dialogs (camera, microphone) clearly explain why access is needed in all languages
- [ ] Error dialogs provide actionable guidance in the user's selected language
- [ ] Success confirmation dialogs provide clear next-step guidance in all languages
- [ ] Screen reader testing confirms all dialog announcements and descriptions read correctly in each language
- [ ] Console shows no missing translation warnings when any dialog is displayed in English
- [ ] TypeScript types correctly reflect translation key structures for type-safe t() calls in dialogs
- [ ] Existing unit tests for dialog components pass or are updated to accommodate translation function calls
- [ ] Integration tests confirm dialogs appear and function correctly within workflow steps in all languages
- [ ] Manual testing in all six languages confirms all dialogs display and function correctly
- [ ] Visual regression testing confirms consistent dialog layout across all languages and viewport sizes
- [ ] Translation length variations do not cause button layout issues or text clipping in dialogs
- [ ] Modal overlay and backdrop behavior remains consistent across all language configurations
- [ ] Dialog focus management works correctly regardless of translated content length
- [ ] Keyboard navigation (Tab, Escape, Enter) works correctly in all translated dialogs
- [ ] Dialog close buttons maintain proper positioning despite title length variations
- [ ] All dialogs remain centered and properly sized across all supported languages
- [ ] Dialog components maintain responsive behavior on mobile devices with translated content
- [ ] No layout shifts or jumping occurs when dialogs appear with different language content
- [ ] Code review confirms translation key naming conventions are followed consistently
- [ ] Performance testing confirms translation function calls do not introduce noticeable dialog rendering latency

---

## REQ-383: Generate Translations for Item Creation Workflow (5 Non-English Languages)

**Date**: 2026-01-19
**Type**: Enhancement
**Priority**: High
**Status**: Pending
**Last Modified**: 2026-01-19 (System timestamp)

### Summary
Generate complete translations for the Item Creation Workflow namespace (workflow) across all 5 supported non-English languages: German (de), Spanish (es), French (fr), Italian (it), and Dutch (nl).

### Current Behavior
The workflow namespace exists in English (messages/en.json) with all strings for the Item Creation Workflow components, but the non-English language files lack these translations.

### Expected Behavior
All 5 non-English language files should contain complete, accurate, and culturally appropriate translations for the entire workflow namespace, matching the structure and keys present in the English version.

### User Impact
- **Property Owners**: Can use the Item Creation Workflow in their preferred language
- **Non-English Users**: Experience a fully localized workflow for creating items, rooms, and managing their inventory
- **System Completeness**: Achieves parity across all supported languages for Phase 2C

### Business Value
Completes the localization foundation for the Item Creation Workflow, enabling the application to serve users in their native languages and expanding market reach to non-English speaking regions.

### Acceptance Criteria
- [ ] German (de) translation file contains complete workflow namespace with all keys from English version
- [ ] Spanish (es) translation file contains complete workflow namespace with all keys from English version
- [ ] French (fr) translation file contains complete workflow namespace with all keys from English version
- [ ] Italian (it) translation file contains complete workflow namespace with all keys from English version
- [ ] Dutch (nl) translation file contains complete workflow namespace with all keys from English version
- [ ] All translations are contextually accurate and culturally appropriate
- [ ] Technical terms (e.g., QR code, file types) are properly localized or preserved
- [ ] Pluralization rules are correctly implemented where applicable
- [ ] All translation files maintain valid JSON structure
- [ ] Character encoding handles special characters correctly for each language

### Technical Notes

**Files to Update:**
- `messages/de.json` - Add/complete workflow namespace
- `messages/es.json` - Add/complete workflow namespace
- `messages/fr.json` - Add/complete workflow namespace
- `messages/it.json` - Add/complete workflow namespace
- `messages/nl.json` - Add/complete workflow namespace

**Source Reference:**
- `messages/en.json` - workflow namespace (complete English version)

**Workflow Namespace Structure:**
The workflow namespace includes translations for:
- Main workflow component (steps, navigation, progress indicators)
- RoomSelectionStep (room selection, creation, management)
- ItemTypeStep (item type selection and categories)
- SpecificItemStep (specific item selection and search)
- PurposeStep (purpose selection: broken, consumable, missing)
- ContentTypeStep (content type selection: text, photo, video)
- MediaCaptureStep (photo/video capture interfaces and adapters)
- PreviewSaveStep (preview, review, save actions)
- SessionSummaryStep (summary display and actions)
- All shared components (buttons, dialogs, navigation elements)
- All dialog components (confirmation, error, help dialogs)

**Translation Considerations:**
- Maintain consistent terminology across all components within each language
- Preserve placeholder syntax: `{variableName}` 
- Handle pluralization using next-intl conventions
- Preserve HTML tags if present in strings
- Maintain button/action verb conventions appropriate to each language
- Consider reading direction (LTR for all 5 target languages)
- Validate technical terms are correctly translated or transliterated

**Quality Assurance:**
- Use translation service (Claude/OpenAI) for initial generation
- Review for consistency with existing common/auth/dashboard namespaces
- Test JSON validity with `npm run lint` or JSON validator
- Verify special characters render correctly in each language
- Check that translated strings fit within UI component constraints (no excessive length)

### Dependencies
- REQ-371: Create workflow namespace structure ✓ (completed in previous tasks)
- REQ-372: Update main ItemCreationWorkflow component ✓
- REQ-373: Update RoomSelectionStep ✓
- REQ-374: Update ItemTypeStep ✓
- REQ-375: Update SpecificItemStep ✓
- REQ-376: Update PurposeStep ✓
- REQ-377: Update ContentTypeStep ✓
- REQ-378: Update MediaCaptureStep and adapters ✓
- REQ-379: Update PreviewSaveStep ✓
- REQ-380: Update SessionSummaryStep ✓
- REQ-381: Update all shared components ✓
- REQ-382: Update all dialog components ✓

### Estimated Effort
**Medium (M)**

**Breakdown:**
- Translation generation (automated): 1-2 hours
- Quality review and corrections: 2-3 hours
- Validation and testing: 1-2 hours
- Total: 4-7 hours

**Rationale:**
The workflow namespace is extensive with many components and strings. While translation can be partially automated using AI services, careful review is needed to ensure contextual accuracy, consistent terminology, and proper handling of technical terms across all 5 languages.

### Related Tasks
- Part of Epic 2: Static UI Localization
- Phase 2C: Item Creation Workflow localization
- Follows namespace pattern established in Phase 2A (common) and 2B (dashboard)
- Enables end-to-end testing of workflow in all supported languages


---

## REQ-384: Test Complete Item Creation Workflow in Each Language

**Date**: 2026-01-19 (System Date)
**Type**: ENHANCEMENT
**Size**: M

### Summary
Validate that the complete Item Creation Workflow functions correctly and displays properly translated content in all 6 supported languages.

### Current Behavior
The Item Creation Workflow has been updated with translation keys and all translation files have been generated, but the workflow has not been systematically tested across all supported languages to verify correct functionality and translation display.

### Expected Behavior
The entire Item Creation Workflow operates seamlessly in each of the 6 supported languages, with all labels, messages, buttons, placeholders, and dynamic content displaying accurate translations throughout the multi-step process.

### User Impact
- **Property Owners**: Can confidently use the item creation workflow in their preferred language without encountering untranslated strings or broken functionality
- **Non-English Users**: Experience a fully functional, professionally localized workflow for managing their property inventory
- **Quality Assurance**: Identifies any translation gaps, display issues, or functional problems before users encounter them

### Business Value
Ensures the Item Creation Workflow delivers a production-ready localized experience, preventing user frustration and maintaining professional quality standards across all supported markets.

### Acceptance Criteria
- [ ] Complete workflow tested in English (en) from start to finish
- [ ] Complete workflow tested in Spanish (es) from start to finish
- [ ] Complete workflow tested in French (fr) from start to finish
- [ ] Complete workflow tested in German (de) from start to finish
- [ ] Complete workflow tested in Italian (it) from start to finish
- [ ] Complete workflow tested in Dutch (nl) from start to finish
- [ ] All step transitions display correct language-specific content
- [ ] All buttons and navigation elements show translated labels
- [ ] All form labels, placeholders, and validation messages appear in selected language
- [ ] All dialog boxes and confirmation messages display correct translations
- [ ] All error messages and toast notifications appear in selected language
- [ ] Room creation/selection functions correctly in all languages
- [ ] Item type selection displays translated categories and items
- [ ] Purpose selection (broken/consumable/missing) shows correct translations
- [ ] Content type selection displays translated options
- [ ] Media capture step shows translated instructions and controls
- [ ] Preview/save step displays all content in selected language
- [ ] Session summary shows translated summary information
- [ ] No untranslated strings or fallback keys appear in any language
- [ ] No text overflow or truncation issues in any language
- [ ] Special characters and diacritics render correctly in all languages
- [ ] Workflow state persists correctly when switching languages mid-flow

### Technical Notes

**Testing Approach:**

1. **Language Switching Setup:**
   - Use LanguageSwitcher component in navigation
   - Verify language preference persists across page reloads
   - Test switching languages at different steps in the workflow

2. **Per-Language Test Scenarios:**
   - Start workflow from dashboard
   - Navigate through all steps sequentially
   - Test backward navigation to previous steps
   - Test skipping optional steps (if applicable)
   - Complete workflow and save item
   - View session summary

3. **Specific Step Validations:**

   **RoomSelectionStep:**
   - Room list displays translated labels
   - "Create New Room" button and dialog show translations
   - Room creation form labels and placeholders are translated
   - Validation messages appear in selected language

   **ItemTypeStep:**
   - Category headers display translated text
   - Item type options show translated names
   - Search functionality works with localized input
   - Help text and instructions are translated

   **SpecificItemStep:**
   - Item suggestions display translated names
   - Search results show localized content
   - Custom item creation uses translated labels
   - Selection confirmation shows correct language

   **PurposeStep:**
   - Purpose options (broken/consumable/missing) are translated
   - Descriptions for each purpose appear in selected language
   - Selection feedback displays correct translations

   **ContentTypeStep:**
   - Content type options (text/photo/video) are translated
   - Instructions for each type show correct language
   - Icons and labels match selected language

   **MediaCaptureStep:**
   - Camera/photo capture instructions are translated
   - Permission requests and error messages use selected language
   - Preview controls and buttons show translations
   - File upload dialogs display localized text

   **PreviewSaveStep:**
   - Preview labels and field names are translated
   - Edit/confirm buttons show correct language
   - Save confirmation messages appear in selected language
   - Success/error notifications use correct translations

   **SessionSummaryStep:**
   - Summary statistics display translated labels
   - Item list shows localized content
   - Action buttons use translated text
   - Navigation options appear in selected language

4. **Cross-Step Validations:**
   - Navigation breadcrumbs/progress indicators show translations
   - Step titles and descriptions are localized
   - Back/Next/Cancel buttons consistently translated
   - Help tooltips and hints appear in selected language

5. **Edge Cases and Error Scenarios:**
   - Form validation errors display in selected language
   - Network error messages use correct translations
   - Empty states show localized messages
   - Loading states display translated text
   - Timeout or session expiry messages are translated

**Testing Tools:**
- Browser language switcher (user preference)
- LanguageSwitcher component (UI control)
- Browser developer tools (inspect element text)
- Network tab (verify API responses if localized)
- Console (check for missing translation warnings)

**Documentation:**
- Create test matrix with languages × workflow steps
- Document any issues found with screenshots
- Record translation gaps or display problems
- Note any functional issues specific to certain languages

**Files to Monitor:**
- `messages/en.json` - workflow namespace
- `messages/es.json` - workflow namespace
- `messages/fr.json` - workflow namespace
- `messages/de.json` - workflow namespace
- `messages/it.json` - workflow namespace
- `messages/nl.json` - workflow namespace
- All workflow component files (to verify translation keys are correctly used)

**Common Issues to Watch For:**
- Hardcoded strings that bypass translation system
- Missing translation keys (showing `workflow.stepName.label` instead of translated text)
- Text overflow in languages with longer words (German, Dutch)
- Character encoding issues with diacritics (French, Spanish)
- Date/number formatting inconsistencies
- Pluralization errors
- Gender agreement issues (French, Spanish, Italian, German)
- Button sizing issues with translated text

### Dependencies
- REQ-371: Create workflow namespace structure ✓
- REQ-372: Update main ItemCreationWorkflow component ✓
- REQ-373: Update RoomSelectionStep ✓
- REQ-374: Update ItemTypeStep ✓
- REQ-375: Update SpecificItemStep ✓
- REQ-376: Update PurposeStep ✓
- REQ-377: Update ContentTypeStep ✓
- REQ-378: Update MediaCaptureStep and adapters ✓
- REQ-379: Update PreviewSaveStep ✓
- REQ-380: Update SessionSummaryStep ✓
- REQ-381: Update all shared components ✓
- REQ-382: Update all dialog components ✓
- REQ-383: Generate translations for 5 non-English languages ✓

### Estimated Effort
**Medium (M)**

**Breakdown:**
- Test setup and preparation: 30 minutes
- Complete workflow test per language (6 languages × 45 minutes): 4.5 hours
- Edge case and error scenario testing: 1 hour
- Documentation and issue reporting: 1 hour
- Fixes and retesting (if issues found): 1-2 hours
- Total: 7-8.5 hours

**Rationale:**
Testing requires methodical execution of the complete workflow in each language, careful observation for translation and display issues, and documentation of findings. The workflow has multiple steps and many interaction points, requiring thorough validation. Time estimate assumes some minor issues will be discovered and need correction.

### Related Tasks
- Part of Epic 2: Static UI Localization
- Phase 2C: Item Creation Workflow localization (final validation task)
- Final step before considering Phase 2C complete
- Quality gate for Epic 2 completion

---

## REQ-385: Create Items Namespace Structure in Translation Files

**Date**: 2026-01-19 
**Type**: NEW FEATURE
**Size**: S

### Summary
Establish a dedicated items namespace in all translation files to organize strings related to item management, viewing, editing, and list operations.

### Current Behavior
No dedicated namespace exists for item management UI strings. Item-related text is either hardcoded in components or scattered across generic translation keys, making maintenance difficult and translations inconsistent.

### Expected Behavior
A well-organized items namespace exists in all six supported language files with clearly structured sections for item display, item lists, item editing, item metadata, and item actions. Developers can easily locate and use appropriate translation keys when building or maintaining item management features.

### User Impact
Affects all users who interact with item management features. Users will see consistent, professionally translated labels, messages, and instructions throughout the item management interface. Property managers and administrators benefit from clear, contextual terminology when viewing, creating, or editing items.

### Business Value
Provides a scalable foundation for item management localization. Reduces translation errors and inconsistencies by centralizing all item-related strings. Simplifies future feature development by establishing clear patterns for item UI translations.

### Acceptance Criteria
- [ ] Items namespace created in `messages/en.json` with comprehensive key structure
- [ ] Items namespace replicated to `messages/de.json`, `messages/es.json`, `messages/fr.json`, `messages/it.json`, `messages/nl.json` (English values initially)
- [ ] Namespace includes sections for: item display, item lists, item editing, item metadata, item actions, item filters, item status, item validation
- [ ] Translation keys follow established naming conventions (camelCase, descriptive, hierarchical)
- [ ] Each section contains placeholder keys covering common use cases (titles, labels, buttons, tooltips, empty states, error messages)
- [ ] Structure supports both single item operations and bulk item operations
- [ ] Documentation comment added at namespace start explaining organization and usage patterns


### Technical Notes

**Expected Namespace Structure:**

```json
{
  "items": {
    "display": {
      "title": "Items",
      "contentTypes": { ... },
      "badges": { ... }
    },
    "list": {
      "viewModes": { ... },
      "columns": { ... }
    },
    "editing": {
      "inline": { ... },
      "actions": { ... }
    },
    "metadata": {
      "location": { ... },
      "tags": { ... }
    },
    "actions": {
      "single": { ... },
      "bulk": { ... }
    },
    "filters": { ... },
    "status": { ... },
    "validation": { ... }
  }
}
```

### Dependencies
- REQ-230: Create i18n configuration module ✓
- REQ-231: Update next.config.ts for i18n ✓

### Estimated Effort
**Small (S)**

**Breakdown:**
- Design namespace structure: 30 minutes
- Create English baseline keys: 45 minutes
- Replicate to other language files: 15 minutes
- Documentation: 15 minutes
- Total: ~2 hours

**Rationale:**
Creating the namespace structure is straightforward organizational work. Most time spent on thoughtfully designing the key hierarchy and ensuring it covers all item management use cases. Actual implementation is mostly copying structure across language files.

### Related Tasks
- Part of Epic 2: Static UI Localization
- Phase 2D: Item Management localization (foundation task)
- Prerequisite for REQ-386 (Update ItemManager component family)

---

## REQ-386: Update ItemManager Component Family for Localization

**Date**: 2026-01-19 14:35
**Type**: ENHANCEMENT
**Size**: L

### Summary
Internationalize all ItemManager components to support multilingual item browsing, searching, filtering, and management experiences using next-intl.

### Current Behavior
ItemManager and its component family display all text in hardcoded English. Labels, placeholders, buttons, tooltips, empty states, error messages, and dialog content appear only in English regardless of user language preference. Users cannot view or manage items in their preferred language.

### Expected Behavior
All ItemManager components render text from translation files based on user language preference. Item management interface displays in the selected language including toolbar controls, search placeholders, filter labels, sort options, bulk action buttons, dialog messages, inline editing prompts, empty states, and loading indicators. Translation keys follow established patterns and all user-facing strings are externalized.

### User Impact
Affects all property managers and administrators who use item management features in their preferred language. International users can browse, search, filter, edit, and manage items with fully localized interface text. Reduces cognitive load and improves usability for non-English speakers managing property documentation and media.

### Business Value
Removes language barriers from core property management workflows. Enables effective item organization and retrieval for international property managers. Supports platform expansion into non-English markets by providing professional multilingual item management experience. Aligns with overall localization strategy for global scalability.

### Acceptance Criteria
- [ ] ItemManager main component uses translation keys for all configurable labels and messages
- [ ] ItemToolbar component translates view toggle labels, search placeholder, filter controls, and selection indicators
- [ ] SearchInput component uses translated placeholder and clear button label
- [ ] ItemCard component translates content type badges, inline edit prompts, and analytics labels
- [ ] ItemRow component translates column headers, action buttons, and contextual information
- [ ] ItemGrid and ItemList components use translated empty state and status messages
- [ ] ViewModeToggle component provides translated aria-labels for grid and list modes
- [ ] EmptyState component accepts and displays translated title and description
- [ ] LoadingState component shows translated loading messages
- [ ] ConfirmDeleteDialog translates title, confirmation message, button labels, and item count text with proper pluralization
- [ ] BulkActionsBar translates all action button labels and selection count text
- [ ] BulkTagDialog translates dialog title, instructions, input placeholders, and button labels for add and remove modes
- [ ] BulkMoveDialog translates dialog title, property selection labels, and action buttons
- [ ] FilterPanel and all filter components translate filter category labels and options
- [ ] SortMenu translates sort option labels and current selection indicator
- [ ] ColumnSettingsPopup translates column names and visibility controls
- [ ] All inline editing components translate placeholders, save/cancel labels, and validation messages
- [ ] All shared components translate tooltips, badges, indicators, and helper text
- [ ] Analytics components translate visit count labels, reaction indicators, and engagement messages
- [ ] Asset management components translate upload prompts, file type labels, and management actions
- [ ] All dialog components translate titles, descriptions, buttons, and close labels
- [ ] Result count displays translate with proper pluralization
- [ ] Selection indicators translate count text with proper pluralization
- [ ] All accessibility labels and ARIA attributes use translated text
- [ ] No hardcoded English strings remain in any ItemManager component
- [ ] All translation keys follow established naming conventions in items namespace
- [ ] Default configuration labels can be overridden with translation keys

### Technical Notes

**Component Scope:**

The ItemManager component family includes approximately 50+ components across several categories:

**Core Components:**
- ItemManager.tsx (main orchestrator)
- ItemToolbar.tsx
- SearchInput.tsx
- ItemGrid.tsx
- ItemList.tsx
- ItemCard.tsx
- ItemRow.tsx

**Dialog Components:**
- ConfirmDeleteDialog.tsx
- FilterPanel.tsx
- SortMenu.tsx
- ContentTypeFilter.tsx
- TagFilter.tsx
- LocationFilter.tsx
- PropertyFilter.tsx
- ColumnSettingsPopup.tsx

**Bulk Action Components:**
- BulkActionsBar.tsx
- BulkTagDialog.tsx
- BulkMoveDialog.tsx

**Shared Components:**
- EmptyState.tsx
- LoadingState.tsx
- ViewModeToggle.tsx
- InlineEdit.tsx
- TagsInlineEdit.tsx
- TagChip.tsx
- VisitCountBadge.tsx
- ReactionSummary.tsx
- EngagementIndicator.tsx
- TouchButton.tsx
- BottomSheet.tsx

**Asset Management Components:**
- AssetPanel.tsx
- AssetDropZone.tsx
- AssetItem.tsx
- SortableAssetList.tsx
- AssetRemoveConfirmDialog.tsx

**Preview Components:**
- ItemPreviewModal.tsx
- MediaGallery.tsx
- VideoPlayer.tsx
- PhotoViewer.tsx
- PDFViewer.tsx
- InstructionsViewer.tsx
- AnalyticsSection.tsx

**Translation Strategy:**

1. **Import useTranslations hook** in each component:
   ```typescript
   import { useTranslations } from 'next-intl';
   const t = useTranslations('items');
   ```

2. **Replace hardcoded strings** with translation keys:
   ```typescript
   // Before: "Search items..."
   // After: t('toolbar.searchPlaceholder')
   ```

3. **Handle pluralization** for count-based text:
   ```typescript
   t('selection.itemsSelected', { count: selectedCount })
   ```

4. **Translate ARIA labels** for accessibility:
   ```typescript
   aria-label={t('viewMode.gridLabel')}
   ```

5. **Update default configuration** to use translation keys:
   ```typescript
   const DEFAULT_CONFIG = {
     labels: {
       searchPlaceholder: t('toolbar.searchPlaceholder'),
       emptyStateTitle: t('empty.title'),
       // etc.
     }
   };
   ```

**Key Translation Categories:**

- Toolbar and navigation controls
- Search and filter interfaces
- Sort options and indicators
- Bulk action labels and prompts
- Dialog titles and messages
- Confirmation prompts
- Button labels (save, cancel, delete, etc.)
- Empty state messages
- Loading indicators
- Error messages
- Success notifications
- Inline editing prompts
- Column headers and labels
- Content type badges
- Analytics labels
- Asset management controls
- Preview interface text
- Accessibility labels

**Testing Requirements:**

- Verify all components render translated text in each supported language
- Test pluralization with various counts (0, 1, 2, many)
- Validate text overflow handling with longer translations (German, Dutch)
- Check that special characters render correctly
- Ensure ARIA labels are translated appropriately
- Test selection count indicators with multiple languages
- Validate dialog content translations
- Check filter and sort option translations
- Test bulk action button labels
- Verify empty state messages appear translated
- Validate inline editing placeholders and prompts

**Files to Update:**

Core:
- `src/components/ItemManager/ItemManager.tsx`
- `src/components/ItemManager/components/ItemToolbar.tsx`
- `src/components/ItemManager/components/SearchInput.tsx`
- `src/components/ItemManager/components/ItemCard.tsx`
- `src/components/ItemManager/components/ItemRow.tsx`
- `src/components/ItemManager/components/ItemGrid.tsx`
- `src/components/ItemManager/components/ItemList.tsx`

Dialogs:
- `src/components/ItemManager/components/dialogs/ConfirmDeleteDialog.tsx`
- `src/components/ItemManager/components/dialogs/FilterPanel.tsx`
- `src/components/ItemManager/components/dialogs/SortMenu.tsx`
- `src/components/ItemManager/components/dialogs/ContentTypeFilter.tsx`
- `src/components/ItemManager/components/dialogs/TagFilter.tsx`
- `src/components/ItemManager/components/dialogs/LocationFilter.tsx`
- `src/components/ItemManager/components/dialogs/PropertyFilter.tsx`
- `src/components/ItemManager/components/dialogs/ColumnSettingsPopup.tsx`

Bulk Actions:
- `src/components/ItemManager/components/BulkActions/BulkActionsBar.tsx`
- `src/components/ItemManager/components/BulkActions/BulkTagDialog.tsx`
- `src/components/ItemManager/components/BulkActions/BulkMoveDialog.tsx`

Shared:
- `src/components/ItemManager/components/shared/EmptyState.tsx`
- `src/components/ItemManager/components/shared/LoadingState.tsx`
- `src/components/ItemManager/components/shared/ViewModeToggle.tsx`
- `src/components/ItemManager/components/shared/InlineEdit.tsx`
- `src/components/ItemManager/components/shared/TagsInlineEdit.tsx`
- `src/components/ItemManager/components/shared/TagChip.tsx`
- `src/components/ItemManager/components/shared/VisitCountBadge.tsx`
- `src/components/ItemManager/components/shared/ReactionSummary.tsx`
- `src/components/ItemManager/components/shared/EngagementIndicator.tsx`

Asset Management:
- `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx`
- `src/components/ItemManager/components/AssetPanel/AssetDropZone.tsx`
- `src/components/ItemManager/components/AssetPanel/AssetItem.tsx`
- `src/components/ItemManager/components/AssetPanel/SortableAssetList.tsx`
- `src/components/ItemManager/components/AssetPanel/AssetRemoveConfirmDialog.tsx`

Preview:
- `src/components/ItemManager/components/ItemPreview/ItemPreviewModal.tsx`
- `src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`
- `src/components/ItemManager/components/ItemPreview/VideoPlayer.tsx`
- `src/components/ItemManager/components/ItemPreview/viewers/PhotoViewer.tsx`
- `src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx`
- `src/components/ItemManager/components/ItemPreview/InstructionsViewer.tsx`
- `src/components/ItemManager/components/ItemPreview/AnalyticsSection.tsx`

**Common String Patterns to Translate:**

Counts and pluralization:
- "X items selected"
- "Delete X items"
- "X results found"
- "and X more"

Actions:
- "Delete", "Edit", "Save", "Cancel"
- "Add Tag", "Remove Tag"
- "Move to Property"
- "Clear filters", "Select all"

States:
- "Loading...", "Processing..."
- "No items yet", "No results found"
- "Try adjusting your search or filters"

Confirmations:
- "Are you sure you want to delete this item?"
- "This action cannot be undone."
- "Items to be updated:"

Placeholders:
- "Search items..."
- "Add tags..."
- "Enter title..."
- "Add location..."

### Dependencies
- REQ-385: Create items namespace structure in translation files
- REQ-230: Create i18n configuration module ✓
- REQ-231: Update next.config.ts for i18n ✓

### Estimated Effort
**Large (L)**

**Breakdown:**
- Audit and catalog all hardcoded strings: 2 hours
- Update core ItemManager components (7 files): 3 hours
- Update dialog components (8 files): 3 hours
- Update bulk action components (3 files): 1.5 hours
- Update shared components (9 files): 3 hours
- Update asset management components (5 files): 2 hours
- Update preview components (7 files): 2.5 hours
- Update ItemManager.types.ts for translation key types: 1 hour
- Testing in all languages: 2 hours
- Fix issues and refinements: 2 hours
- Total: ~22 hours

**Rationale:**
Large scope due to 50+ component files requiring updates. Each component needs careful review to identify all user-facing strings, import translation hooks, replace hardcoded text, and handle pluralization. Testing across all languages is essential to catch text overflow issues and ensure proper rendering. The ItemManager is a complex feature with many interaction patterns that must all be localized correctly.

### Related Tasks
- Part of Epic 2: Static UI Localization
- Phase 2D: Item Management localization
- Follows patterns established in Phase 2C (Item Creation Workflow)
- Related to REQ-385 (namespace structure)
- Blocks completion of Epic 2

---

---

## REQ-387: Update ItemGrid and ItemCard Components for Localization

**Date**: 2026-01-19 16:42
**Type**: ENHANCEMENT
**Size**: M

### Summary
The ItemGrid and ItemCard components should display all user-facing text in the user's preferred language, including placeholders, labels, content type badges, and accessibility attributes.

### Current Behavior
The ItemGrid and ItemCard components contain numerous hardcoded English strings embedded directly in the component code. These include placeholder text for inline editing fields ("Enter title...", "Add location...", "Add tags..."), content type badge labels ("LINK", "TEXT", "PDF", "MIXED", "VIDEO", "PHOTO", "MEDIA"), the overflow tag indicator ("+X more"), and various accessibility labels. Users see these strings in English regardless of their language preference, and screen reader users hear English descriptions even when using the application in another language.

### Expected Behavior
When users view items in grid layout, all text appears in their selected language. Placeholder text for inline editing prompts them in their native language. Content type badges display localized labels that clearly identify the type of content. The tag overflow indicator shows the count in a grammatically correct format for the user's language. Accessibility labels and descriptions provide context in the user's preferred language, ensuring screen reader users receive proper information regardless of their locale. The grid's aria-label dynamically adjusts to provide appropriate singular or plural forms based on the item count and target language grammar rules.

### User Impact
Users working in non-English languages can fully understand placeholder prompts when editing item properties inline, reducing confusion about what information to enter. Content type badges become immediately recognizable in the user's native language, making it easier to identify and filter content at a glance. International users with visual accessibility needs benefit from properly localized screen reader announcements that describe card contents and available actions in their preferred language.

### Business Value
Localizing ItemGrid and ItemCard components completes the internationalization of the core item browsing experience, which is fundamental to the application's value proposition. These components appear on every dashboard view and are among the most frequently interacted with elements. Proper localization ensures that international users can efficiently browse, understand, and manage their content, directly supporting user retention and satisfaction in non-English markets.

### Acceptance Criteria
- [ ] ItemGrid component uses translation keys for the grid aria-label with proper singular/plural handling
- [ ] ItemGrid component uses translation keys for loading state indicators and empty state identifiers
- [ ] ItemCard content type badge labels are retrieved from translation keys for all types: LINK, TEXT, PDF, MIXED, VIDEO, PHOTO, and MEDIA
- [ ] ItemCard inline edit placeholders use translation keys: title placeholder, location placeholder, and tags placeholder
- [ ] ItemCard tag overflow indicator uses a translation key with proper count formatting for the target language
- [ ] ItemCard selection checkbox aria-labels are generated from translation keys
- [ ] ItemCard main aria-label describing card contents uses translation keys for all text segments including location prefix, content type, and selection status
- [ ] ItemCard keyboard interaction hints in aria-labels use translated text
- [ ] All hardcoded English strings in both components are replaced with translation function calls using next-intl's useTranslations hook
- [ ] The components maintain all existing functionality including inline editing, selection mode, long-press gestures, and accessibility features
- [ ] Plural forms and count formatting respect the grammatical rules of each supported language


---

## REQ-388: Update Filter and Sort Components for Localization

**Date**: 2026-01-19 17:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
All filter and sort components in the ItemManager should display labels, options, and helper text in the user's selected language by retrieving strings from translation files rather than using hardcoded English text.

### Current Behavior
Filter and sort components throughout the ItemManager display hardcoded English text for all UI elements. This includes the FilterPanel with its section labels, clear filters button, and apply button, the SortMenu with its trigger label and sort option labels, and all individual filter components including ContentTypeFilter, TagFilter, LocationFilter, and PropertyFilter. Users see only English text for filter categories, sort options, button labels, and placeholder text regardless of their language preference. The filter and sort experiences are completely inaccessible to non-English speakers.

### Expected Behavior
When users interact with filtering and sorting controls, all text appears in their selected language. The FilterPanel displays translated labels for each filter category, clear all button, and apply filters action. The SortMenu shows translated sort option labels including title sort, date sort, location sort, and guide count sort options. Individual filter components render translated category names, placeholder text, and selection indicators. All button labels, tooltips, and helper text associated with filtering and sorting functionality are retrieved from the translation system using consistent translation keys.

### User Impact
Property managers and administrators who use filtering and sorting to organize and locate items benefit from a fully localized experience. International users can effectively filter items by content type, tags, location, and property, and sort items by various criteria, all using familiar terminology in their native language. Users managing large item collections gain efficient access to search and organization tools without language barriers.

### Business Value
Localizing filter and sort components removes critical usability barriers for international property managers working with item libraries. These controls are essential for efficient content discovery and organization, directly impacting user productivity and satisfaction. Proper translation ensures that non-English speaking users can leverage the full power of the item management system, supporting global platform adoption and retention.

### Acceptance Criteria
- [ ] FilterPanel component uses translation keys for title, clearAll, contentType, tags, location, property, applyFilters, and close labels
- [ ] SortMenu component uses translation keys for sortLabel and sortByLabel
- [ ] All sort option labels in SORT_OPTIONS constant are replaced with translation key references
- [ ] ContentTypeFilter component displays translated content type labels and filter section heading
- [ ] TagFilter component displays translated tags label and dropdown placeholder text
- [ ] LocationFilter component displays translated location label and selection placeholder
- [ ] PropertyFilter component displays translated property label and multi-select placeholder
- [ ] Active filter count badge label is internationalized
- [ ] Filter clear button and apply button labels appear in selected language
- [ ] Sort direction indicators maintain correct display alongside translated sort option text
- [ ] All filter and sort components maintain existing functionality after internationalization
- [ ] Translation keys follow established naming conventions for the items namespace



---

## REQ-389: Update Bulk Action Dialogs for Localization

**Date**: 2026-01-19 18:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
All bulk action dialog components in the ItemManager should display titles, descriptions, labels, confirmation messages, and action buttons in the user's selected language by retrieving strings from translation files instead of using hardcoded English text.

### Current Behavior
Bulk action dialogs throughout the ItemManager contain hardcoded English text for all user-facing content. This includes dialog titles that describe the bulk operation being performed, warning messages that explain the consequences of bulk actions, confirmation checkboxes with text requiring user acknowledgment, count indicators showing how many items are affected, validation error messages, action button labels for confirm and cancel operations, and status feedback messages during and after bulk operations. Users performing bulk actions on multiple items see only English text in these critical confirmation dialogs, regardless of their language preference. This creates potential confusion and risk when users must confirm destructive operations without fully understanding the presented warnings in their native language.

### Expected Behavior
When users initiate bulk actions on selected items, all dialog content appears in their selected language. Dialog titles clearly identify the bulk operation in the user's native language, such as bulk delete, bulk move, bulk tag assignment, or bulk export. Warning messages explaining the scope and irreversibility of actions are displayed in properly localized text with correct pluralization based on the number of selected items. Confirmation checkboxes present acknowledgment text in the user's language, ensuring they understand what they are confirming. Item count indicators use grammatically correct singular and plural forms appropriate to the target language. Validation messages that appear when bulk operations cannot proceed are shown in the user's preferred language. Primary and secondary action buttons display translated labels that clearly communicate the available choices. Progress indicators and completion messages during bulk operation execution provide feedback in the user's selected language.

### User Impact
Property managers performing bulk operations on multiple items benefit from clear, localized confirmation dialogs that reduce the risk of unintended actions. International users can confidently execute bulk tag assignments, bulk moves between properties, bulk deletions, and bulk exports while fully understanding the scope and consequences of their actions. Users managing large item collections across multiple properties gain the ability to perform efficient bulk operations with appropriate safety confirmations presented in their native language, reducing cognitive load and preventing costly mistakes.

### Business Value
Localizing bulk action dialogs addresses critical safety and usability concerns for international users managing content at scale. Bulk operations represent high-risk, high-value functionality where miscommunication can lead to significant data loss or unintended changes. Providing properly localized confirmation dialogs ensures that non-English speaking users can safely and confidently leverage powerful bulk operations, supporting productivity and preventing user frustration or data loss incidents that could harm platform reputation and user retention.

### Acceptance Criteria
- [ ] All bulk action dialog titles use translation keys with proper context for each operation type
- [ ] Warning messages describing bulk action consequences are retrieved from translation keys
- [ ] Item count indicators in dialog content use translation keys with proper singular and plural forms for each supported language
- [ ] Confirmation checkbox labels requesting user acknowledgment use translation keys
- [ ] Primary action button labels use translation keys appropriate to each bulk operation
- [ ] Secondary action button labels (Cancel, Close) use translation keys from common namespace
- [ ] Validation error messages that prevent bulk operations use translation keys
- [ ] Progress indicator messages during bulk operation execution use translation keys
- [ ] Success and failure feedback messages after bulk operations complete use translation keys
- [ ] Dialog content maintains proper formatting and layout when rendered in languages with longer text strings
- [ ] Pluralization rules are correctly applied based on item counts and target language grammar
- [ ] All bulk action dialogs maintain existing functionality including validation, progress tracking, and error handling
- [ ] Translation keys follow established naming conventions for the items namespace
- [ ] Destructive action dialogs emphasize warnings appropriately regardless of language


---

## REQ-390: Update Item Detail and Edit Pages for Localization

**Date**: 2026-01-19 16:31
**Type**: ENHANCEMENT
**Size**: L

### Summary
Item detail and edit pages must display all content in the user's selected language, including field labels, validation messages, action buttons, status indicators, and help text.

### Current Behavior
Item detail and edit pages display all UI elements in hardcoded English strings. Field labels, button text, validation messages, error states, and help text are not internationalized. Users cannot view or edit item information in their preferred language.

### Expected Behavior
When a user views or edits an item, all UI elements appear in their selected language. This includes page titles, section headings, field labels, placeholder text, validation messages, action buttons, status badges, tooltips, error messages, and success confirmations. The editing experience feels natural and fully localized regardless of the user's language preference.

### User Impact
All authenticated users who manage items are affected. Non-English speakers gain the ability to view and edit item details in their native language, reducing cognitive load and minimizing errors from misunderstood labels or instructions. This particularly benefits international property owners managing multi-language inventories.

### Business Value
Expands the application's usability for international markets by providing a fully localized item management experience. Reduces support requests related to confusion over item fields and validation requirements across different language audiences.

### Acceptance Criteria
- [ ] All static text on item detail pages is translated using the next-intl useTranslations hook
- [ ] All static text on item edit pages is translated using the next-intl useTranslations hook
- [ ] Field labels, placeholders, and help text appear in the user's selected language
- [ ] Validation messages and error states display in the user's selected language
- [ ] Action buttons including save, cancel, delete, and edit show translated labels
- [ ] Status badges and indicators display localized text
- [ ] Page titles and section headings are internationalized
- [ ] Success and error toast notifications appear in the appropriate language
- [ ] All five supported languages render correctly without layout issues
- [ ] Form submission and validation behavior remains unchanged
- [ ] No hardcoded English strings remain in the component files



---

## REQ-391: Generate Translations for Item Management Components (5 Non-English Languages)

**Date**: 2026-01-19 19:43
**Type**: ENHANCEMENT
**Size**: L

### Summary
All Item Management namespace strings extracted in Phase 2D must be translated into the five non-English languages (German, Spanish, French, Italian, Dutch) and added to the respective translation files.

### Current Behavior
Translation key structures exist in the English translation file for the Item Management components, including ItemManager family components, ItemGrid and ItemCard displays, filter and sort controls, bulk action dialogs, and item detail and edit pages. However, the corresponding German, Spanish, French, Italian, and Dutch translation files lack these entries. Non-English users encounter missing translation warnings or fallback to English text when interacting with item management features, breaking the localized experience across critical inventory management workflows.

### Expected Behavior
When users access the application in German, Spanish, French, Italian, or Dutch, all item management interface elements display in their selected language with professionally translated, contextually appropriate text. This includes all ItemManager toolbar actions, item grid headers and empty states, ItemCard metadata labels, filter panel categories and options, sort menu choices, bulk action dialog titles and warnings, item detail field labels, edit page form elements, validation messages, button labels, status indicators, and help text. Translations maintain semantic accuracy while adapting to language-specific conventions for terminology related to property management, inventory tracking, content categorization, and user actions. Pluralization rules are correctly applied for item counts, selection indicators, and result summaries according to each target language's grammar rules.

### User Impact
Property managers and administrators using the platform in German, Spanish, French, Italian, or Dutch gain a complete, native-language experience when managing items across properties. International users can efficiently browse item collections, apply filters to locate specific items, sort results by relevant criteria, perform bulk operations with clear confirmation dialogs, and view or edit individual item details without encountering English fallback text. Users managing inventories across multiple properties benefit from consistent, professional translations that match terminology used in their local property management practices, reducing cognitive load and improving operational efficiency.

### Business Value
Completing Item Management translations represents a critical milestone in providing full localization for core platform functionality. Item management is central to the platform's value proposition for property owners, and incomplete translations in this area directly undermine user experience and platform adoption in non-English markets. Professional, contextually accurate translations demonstrate commitment to international users, support market expansion into German, Spanish, French, Italian, and Dutch-speaking regions, and eliminate a significant barrier to user satisfaction and retention among existing international customers.

### Acceptance Criteria
- [ ] All Item Management namespace keys from the English translation file are present in de.json with accurate German translations
- [ ] All Item Management namespace keys from the English translation file are present in es.json with accurate Spanish translations
- [ ] All Item Management namespace keys from the English translation file are present in fr.json with accurate French translations
- [ ] All Item Management namespace keys from the English translation file are present in it.json with accurate Italian translations
- [ ] All Item Management namespace keys from the English translation file are present in nl.json with accurate Dutch translations
- [ ] Pluralization rules are correctly implemented for each language using next-intl plural syntax
- [ ] Filter category names use terminology appropriate to property management contexts in each language
- [ ] Sort option labels use standard conventions for each language
- [ ] Bulk action dialog warnings maintain appropriate tone and clarity in each language
- [ ] Field labels and validation messages use familiar terminology for each target audience
- [ ] Button labels follow platform-wide translation conventions established in common namespace
- [ ] Status indicators and badges use contextually appropriate language
- [ ] Empty state messages are culturally and linguistically appropriate
- [ ] Help text and tooltips provide clear guidance in each language
- [ ] All translations are validated by native speakers or professional translation services
- [ ] Translation keys maintain consistent structure across all six language files
- [ ] No placeholder or machine-translated content remains in production translation files


---

## REQ-392: Create Articles Namespace Structure in Message Files

**Date**: 2026-01-19 00:00
**Type**: NEW FEATURE
**Size**: S

### Summary
The system shall provide a dedicated namespace structure for article-related translations across all supported language message files.

### Current Behavior
No centralized namespace exists for article and content management UI strings. Article-related labels, messages, and states are not organized within the translation system.

### Expected Behavior
All six language message files (en.json, de.json, es.json, fr.json, it.json, nl.json) contain a comprehensive "articles" namespace with organized keys for article management UI elements. The namespace includes sections for article metadata, list views, form elements, state indicators, actions, and feedback messages.

### User Impact
Content managers and administrators working in any supported language will see consistent, properly translated UI elements throughout the article management interface. This establishes the foundation for localizing the entire article and content management experience.

### Business Value
Enables multilingual content management capabilities, allowing international teams to create and manage articles in their preferred language while maintaining a consistent user experience across all locales.

### Acceptance Criteria
- [ ] Articles namespace exists in all six message files (en.json, de.json, es.json, fr.json, it.json, nl.json)
- [ ] Namespace includes keys for article titles, descriptions, and metadata labels
- [ ] Namespace includes article list view labels (column headers, filters, sorting options)
- [ ] Namespace includes article creation and editing form labels and placeholders
- [ ] Namespace includes article state indicators (draft, published, archived, scheduled)
- [ ] Namespace includes article action labels (create, edit, delete, publish, archive, duplicate)
- [ ] Namespace includes empty state messages for when no articles exist
- [ ] Namespace includes loading state messages for article operations
- [ ] Namespace includes error messages specific to article operations
- [ ] English translations are complete and serve as the source for other languages
- [ ] Namespace structure is consistent across all language files
- [ ] Keys follow the project's established naming conventions



---

## REQ-393: Update Editor Components for Localization

**Date**: 2026-01-19 20:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
Editor components including MarkdownEditor, ImageCropper, and VideoTrimmer must display all UI elements in the user's selected language by retrieving strings from translation files rather than using hardcoded English text.

### Current Behavior
Editor components used throughout the content and article management experience display hardcoded English text for all UI elements. The MarkdownEditor shows English labels for formatting toolbar buttons including bold, italic, heading, list, link, and image options, along with English placeholder text prompting users to write content. The ImageCropper displays English labels for crop controls, aspect ratio options, and action buttons. The VideoTrimmer shows English labels for time controls, duration indicators, and trim actions. Users working with content editing tools see only English text for all controls, buttons, labels, and helper text regardless of their language preference, creating barriers for non-English speakers managing content.

### Expected Behavior
When users interact with content editing tools, all interface elements appear in their selected language. The MarkdownEditor displays translated labels for all formatting toolbar buttons, with culturally appropriate icons and tooltips explaining each formatting action. Placeholder text in the editing area appears in the user's language, providing clear guidance on content creation. The ImageCropper shows translated labels for crop mode selection, aspect ratio options, and apply or reset actions. The VideoTrimmer displays translated labels for start time, end time, and duration indicators, along with localized action buttons. All editor components retrieve text from the articles namespace in translation files, ensuring consistent terminology across the content management experience.

### User Impact
Content creators and property managers who prepare instructions, guides, and media content benefit from fully localized editing tools. International users can efficiently format text content, crop images to appropriate dimensions, and trim video clips using familiar terminology in their native language. Users managing multi-language property documentation gain confidence in editing tools that speak their language, reducing cognitive load during content creation workflows and minimizing errors from misunderstood editing controls.

### Business Value
Localizing content editor components directly impacts content creation quality and user satisfaction for international property managers. Content editing represents a high-value workflow where clear, understandable controls are essential for producing professional documentation. Providing editor interfaces in users' native languages encourages content creation, improves documentation quality across properties, and demonstrates platform commitment to international user experience, supporting market expansion and user retention.

### Acceptance Criteria
- [ ] MarkdownEditor component uses translation keys for all formatting toolbar button labels
- [ ] MarkdownEditor placeholder text is retrieved from translation keys
- [ ] MarkdownEditor tooltips for formatting actions appear in the user's selected language
- [ ] ImageCropper component displays translated labels for crop mode and aspect ratio options
- [ ] ImageCropper action buttons including apply, reset, and cancel use translation keys
- [ ] VideoTrimmer component shows translated labels for time controls and duration display
- [ ] VideoTrimmer action buttons use translation keys for apply and cancel operations
- [ ] All editor components maintain existing functionality after internationalization
- [ ] Translation keys follow the articles.editor, articles.crop, and articles.video namespace conventions
- [ ] Editor components render correctly in all supported languages without layout issues
- [ ] Long translated text in toolbar buttons does not break component layouts
- [ ] All editor components properly handle dynamic content including duration formatting and file size displays



---

## REQ-394: Update Media Handling Components for Localization

**Date**: 2026-01-19 20:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
Media handling components including upload interfaces, gallery views, and media management controls must display all UI elements in the user's selected language by retrieving strings from translation files.

### Current Behavior
Media handling components display hardcoded English text for all interface elements. File upload interfaces show English labels for drag-and-drop zones, file type restrictions, and size limit messages. Gallery components display English text for viewing options, selection controls, and media count displays. Media management controls show English labels for actions like replace, remove, reorder, and set as primary. Progress indicators during upload operations display English status messages. Error messages for unsupported file types, exceeded size limits, or failed uploads appear only in English. Users managing property photos, instructional videos, and documentation attachments encounter English-only interfaces regardless of their language preference.

### Expected Behavior
When users interact with media handling features, all interface elements appear in their selected language. Upload zones display translated instructions for dragging files or clicking to browse, with file type and size restrictions clearly stated in the user's language. Gallery views show translated labels for grid or list view options, selection mode toggles, and media count summaries. Media management actions including replace, remove, reorder, and set primary appear with translated labels. Upload progress indicators display status messages in the user's language, including percentage complete and time remaining estimates. Error messages for upload failures, file validation issues, or network problems appear in translated form with clear guidance for resolution. All media components retrieve text from the articles namespace, ensuring consistent terminology across content and media management workflows.

### User Impact
Property managers uploading photos, videos, and documentation benefit from clear, understandable media handling interfaces in their native language. International users can confidently manage property media libraries using familiar terminology for upload, organization, and editing actions. Users preparing multi-language property listings gain efficiency from localized media tools that reduce confusion and prevent errors during media management tasks.

### Business Value
Localizing media handling components improves content quality and user confidence for international property managers. Media management represents a frequent, high-visibility workflow where clear instructions and feedback are essential for successful content creation. Providing media interfaces in users' native languages reduces upload errors, improves media organization quality, and demonstrates platform commitment to international user experience, supporting both user satisfaction and operational efficiency.

### Acceptance Criteria
- [ ] File upload components display translated instructions for drag-and-drop zones
- [ ] File type and size restriction messages appear in the user's selected language
- [ ] Gallery view components show translated labels for view mode options and selection controls
- [ ] Media count displays use proper pluralization for each supported language
- [ ] Media action buttons including replace, remove, reorder, and set primary use translation keys
- [ ] Upload progress indicators display status messages from translation files
- [ ] Error messages for file validation failures retrieve text from translation keys
- [ ] Success messages for completed uploads appear in the user's language
- [ ] Confirmation dialogs for destructive actions like remove use translated text
- [ ] All media components maintain existing functionality after internationalization
- [ ] Translation keys follow the articles.media namespace convention
- [ ] Long translated text in upload zones and error messages does not break layouts
- [ ] File size and dimension displays format numbers according to locale conventions
- [ ] Media components render correctly in all supported languages without UI issues




---

## REQ-395: Update Crop and Trim Utilities for Localization

**Date**: 2026-01-19 21:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Image crop and video trim utility components must display all controls, labels, and feedback messages in the user's selected language by retrieving strings from translation files rather than using hardcoded English text.

### Current Behavior
Crop and trim utility components display hardcoded English text for all interface elements. Image crop utilities show English labels for aspect ratio presets including square, portrait, landscape, and custom options. Crop control buttons display English text for actions like apply, cancel, reset, and rotate. Grid overlay toggles and zoom controls show English labels. Video trim utilities display English text for timeline markers, playback controls, and trim range selectors. Duration displays show English labels for start time, end time, and total duration. Trim action buttons including apply trim, cancel, and preview use English text. Validation messages warning about minimum duration requirements or invalid trim ranges appear only in English. Users editing media content encounter English-only utility interfaces regardless of their language preference, creating confusion during precise editing operations.

### Expected Behavior
When users access crop or trim utilities, all interface elements appear in their selected language. Image crop utilities display translated labels for aspect ratio presets with culturally appropriate terminology for dimensions and orientations. Crop control buttons show translated action labels with consistent terminology across the editing workflow. Grid overlay and zoom control labels appear in the user's language. Video trim utilities display translated labels for timeline controls, with time duration formatted according to locale conventions. Playback control labels including play, pause, and frame-by-frame navigation appear translated. Trim range indicators show start time, end time, and duration in the user's language with proper time formatting. Action buttons use translated labels that clearly communicate apply, cancel, preview, and reset operations. Validation messages appear in translated form, providing clear guidance about duration limits, file size impacts, and trim range requirements. All crop and trim utilities retrieve text from the articles namespace, ensuring consistent terminology with other content editing tools.

### User Impact
Content creators preparing property media benefit from clear, understandable crop and trim controls in their native language. International users can precisely adjust image compositions and video lengths using familiar terminology for dimensions, timing, and editing actions. Users managing multi-language property documentation gain confidence in utilities that provide localized feedback and validation, reducing errors during precise media editing operations and improving final content quality.

### Business Value
Localizing crop and trim utilities directly impacts content quality and user efficiency for international property managers. Media editing represents a detail-oriented workflow where clear labels and feedback are essential for achieving desired results. Providing utility interfaces in users' native languages reduces editing errors, improves media preparation efficiency, and demonstrates platform commitment to professional-grade international tools, supporting both user satisfaction and content quality standards.

### Acceptance Criteria
- [ ] Image crop utility displays translated labels for all aspect ratio preset options
- [ ] Crop control buttons including apply, cancel, reset, and rotate use translation keys
- [ ] Grid overlay toggle and zoom control labels appear in the user's selected language
- [ ] Video trim utility shows translated labels for timeline markers and playback controls
- [ ] Time duration displays format hours, minutes, and seconds according to locale conventions
- [ ] Trim range indicators display start time, end time, and duration with translated labels
- [ ] Action buttons for trim operations use translation keys for apply, cancel, and preview
- [ ] Validation messages for duration limits and trim range errors retrieve text from translation files
- [ ] Warning messages about file size impacts appear in the user's language
- [ ] Success messages for completed crop or trim operations use translated text
- [ ] All utility components maintain existing functionality after internationalization
- [ ] Translation keys follow the articles.crop and articles.trim namespace conventions
- [ ] Long translated text in control labels does not break component layouts
- [ ] Time formatting adapts to locale-specific conventions for each supported language
- [ ] Crop and trim utilities render correctly in all supported languages without UI issues




---

## REQ-396: Update Instructions Pages for Localization

**Date**: 2026-01-19 22:13
**Type**: ENHANCEMENT
**Size**: M

### Summary
Instructions pages and their associated components must display all interface elements, table headers, labels, and feedback messages in the user's selected language by retrieving text from translation files rather than using hardcoded English strings.

### Current Behavior
Instructions-related components including InstructionsTable and InstructionsViewer display hardcoded English text for all user-facing elements. The instructions table shows English column headers for Title, Item, Room, Property, Purpose, Created, and Actions. Sort indicators display English aria labels for ascending and descending states. Empty state messages show "No guides available" in English only. Table skeleton loaders use English accessibility labels. Action buttons display "Edit" in English. The column settings popup shows English labels for visibility toggles. Purpose badge labels format values like "how_to_use" into English words such as "How To Use" without translation support. Date formatting always uses en-US locale regardless of user language preference. The InstructionsViewer component displays English labels including "Item guides" for aria labels, "Guides" for headers, and "No guides provided" for empty states. Loading skeleton displays English loading text. All static strings, accessibility labels, and user feedback messages appear only in English, creating confusion for international users navigating and managing property instruction documentation.

### Expected Behavior
When users access instructions pages or components, all interface elements appear in their selected language. The InstructionsTable component retrieves column header labels from translation files with keys for title, item, room, property, purpose, created, and actions. Sort indicator aria labels use translations for ascending and descending states. The Edit action button displays translated text. Column visibility settings popup shows translated labels for Room, Property, and Purpose toggles. Empty state messages retrieve "No guides available" text from translation keys. Purpose badge labels use translation keys corresponding to each purpose type including how_to_use, troubleshooting, how_to_clean, safety_info, maintenance, and features, displaying culturally appropriate terminology in each language. Date formatting adapts to locale conventions, showing month and day order according to user language preferences. The InstructionsViewer component uses translation keys for the "Item guides" aria label, "Guides" header text, and "No guides provided" empty state message. Loading state text appears in the user's language. All table components including SortableColumnHeader display fully translated interface text. Translation keys follow the instructions namespace convention, grouping table-related strings under instructions.table and viewer strings under instructions.viewer. Components maintain existing functionality including sorting, column visibility, markdown rendering, and responsive behavior while displaying content in the user's preferred language.

### User Impact
Property managers viewing instruction documentation benefit from clear table interfaces in their native language. International users can understand column headers, sort controls, and action buttons using familiar terminology. Users managing guides across multiple properties and items see localized purpose labels that clearly communicate instruction categories in culturally appropriate terms. Empty states and loading messages provide feedback in the user's language, reducing confusion during navigation. Content creators reviewing instruction articles encounter viewer interfaces with localized labels and messages, improving comprehension of documentation structure and enhancing confidence when organizing property guide content.

### Business Value
Localizing instructions pages improves usability for international property managers who rely on guide documentation for operational excellence. Instructions represent critical property information that guests reference frequently, making clear organizational tools essential for content management. Providing table interfaces and viewer components in users' native languages reduces navigation friction, improves content discovery, and demonstrates platform commitment to professional documentation tools for diverse markets. Enhanced localization of instructions management directly supports content quality, user efficiency, and satisfaction among international property managers maintaining multilingual guest documentation.

### Acceptance Criteria
- [ ] InstructionsTable displays translated column headers for all columns including Title, Item, Room, Property, Purpose, Created, and Actions
- [ ] Sort indicator aria labels for ascending, descending, and unsorted states use translation keys
- [ ] Edit action button retrieves label text from translation files
- [ ] Column visibility settings popup displays translated labels for each toggle option
- [ ] Empty state message "No guides available" uses a translation key
- [ ] Loading skeleton maintains accessibility with translated aria labels
- [ ] Purpose badge labels use translation keys for all purpose types including how_to_use, troubleshooting, how_to_clean, safety_info, maintenance, and features
- [ ] Date formatting in Created column adapts to locale conventions for each supported language
- [ ] InstructionsViewer component uses translation keys for aria labels including "Item guides"
- [ ] InstructionsViewer header text "Guides" retrieves value from translation files
- [ ] InstructionsViewer empty state message "No guides provided" uses a translation key
- [ ] All components implement useTranslations hook from next-intl
- [ ] Translation keys follow instructions.table and instructions.viewer namespace conventions
- [ ] Long translated column headers and labels do not break responsive table layouts
- [ ] Sort functionality continues working correctly after internationalization
- [ ] Column visibility toggle functionality maintains existing behavior with translated labels
- [ ] Markdown rendering in InstructionsViewer works correctly with all supported languages
- [ ] All instructions components render properly in each of the six supported languages (en, de, es, fr, it, nl)


---

## REQ-397: Generate Translations for Article and Content Management (5 Non-English Languages)

**Date**: 2026-01-19 23:47
**Type**: ENHANCEMENT
**Size**: L

### Summary
Generate complete translations for the Articles namespace in translation files across all 5 supported non-English languages (German, Spanish, French, Italian, Dutch) to enable full localization of article and content management interfaces.

### Current Behavior
The articles namespace exists in English translation files with comprehensive strings for all article and content management components including editors, media handlers, crop/trim utilities, and instructions pages. Non-English language files either lack the articles namespace entirely or contain incomplete translations, resulting in English fallback text appearing for international users accessing article management features.

### Expected Behavior
All 5 non-English language files contain complete, accurate, and culturally appropriate translations for the entire articles namespace. The translated content matches the structure and keys present in the English version, enabling property managers to create, edit, and manage articles, media, and instructions in their preferred language. Translations accurately convey technical editing terminology, media handling concepts, and instructional content management labels while maintaining consistency with terminology established in other namespaces like common, dashboard, and workflow.

### User Impact
International property managers benefit from fully localized article and content management interfaces in their native language. Users creating property documentation encounter familiar terminology for editor controls, media upload interfaces, crop and trim utilities, and instruction management pages. Content creators working with media files see localized labels for aspect ratios, file formats, duration displays, and validation messages. Property managers organizing instructional content experience translated table headers, column controls, sort indicators, and purpose labels that clearly communicate organizational structures in culturally appropriate terms.

### Business Value
Completing articles namespace translations enables international market expansion by providing professional-grade content management tools in users' native languages. Article and content management represents core platform functionality where clear, understandable interfaces directly impact content quality and user efficiency. Localized editing tools reduce friction for international property managers, improve content creation workflows, and demonstrate platform commitment to serving diverse markets with production-ready multilingual capabilities. Enhanced article management localization supports both user satisfaction and content quality standards across global property management operations.

### Acceptance Criteria
- [ ] German (de) translation file contains complete articles namespace with all keys from English version
- [ ] Spanish (es) translation file contains complete articles namespace with all keys from English version
- [ ] French (fr) translation file contains complete articles namespace with all keys from English version
- [ ] Italian (it) translation file contains complete articles namespace with all keys from English version
- [ ] Dutch (nl) translation file contains complete articles namespace with all keys from English version
- [ ] Editor component translations accurately convey text formatting, styling, and content editing concepts
- [ ] Media handling translations properly localize file type terminology, size limits, and upload status messages
- [ ] Crop utility translations include culturally appropriate aspect ratio and dimension terminology
- [ ] Trim utility translations correctly format time durations according to locale conventions
- [ ] Instructions page translations provide clear table headers, column labels, and purpose category names
- [ ] Technical terms including markdown, embed, aspect ratio, and timeline are appropriately localized or preserved
- [ ] Pluralization rules are correctly implemented for file counts, media items, and duration displays
- [ ] All translation files maintain valid JSON structure without syntax errors
- [ ] Character encoding properly handles special characters, accents, and diacritics for each language
- [ ] Translated strings maintain reasonable length to avoid breaking component layouts in UI
- [ ] Terminology consistency is maintained with existing common, dashboard, and workflow namespaces
- [ ] Validation and error messages use clear, actionable language appropriate to each culture
- [ ] Date and time formatting in instructions tables adapts to locale-specific conventions

### Technical Notes

**Files to Update:**
- `messages/de.json` - Add/complete articles namespace
- `messages/es.json` - Add/complete articles namespace
- `messages/fr.json` - Add/complete articles namespace
- `messages/it.json` - Add/complete articles namespace
- `messages/nl.json` - Add/complete articles namespace

**Source Reference:**
- `messages/en.json` - articles namespace (complete English version)

**Articles Namespace Structure:**
The articles namespace includes translations for:
- Editor components (text formatting, styling, markdown, preview)
- Media handling components (upload, progress, validation, display)
- Media action components (replace, remove, reorder, set primary)
- Crop utilities (aspect ratios, controls, grid overlay, zoom)
- Trim utilities (timeline, playback controls, duration displays, trim ranges)
- Instructions table (column headers, sort indicators, actions, empty states)
- Instructions viewer (headers, labels, loading states, markdown rendering)
- Media validation messages (file types, sizes, dimensions, duration limits)
- Success and error feedback for all article operations

**Translation Considerations:**
- Maintain consistent terminology across editor, media, and instructions components within each language
- Preserve placeholder syntax: `{variableName}` for dynamic content insertion
- Handle pluralization using next-intl conventions for file counts and media items
- Preserve HTML tags if present in strings for formatted messages
- Maintain appropriate action verb conventions for each language (e.g., save, apply, cancel, reset)
- Consider reading direction (LTR for all 5 target languages)
- Validate technical editing terms are correctly translated or transliterated based on common usage
- Ensure time duration formatting strings support locale-specific number and time conventions
- Maintain semantic consistency between similar actions across different components

**Quality Assurance:**
- Use translation service (Claude/OpenAI) for initial generation of articles namespace
- Review translations for consistency with existing namespaces (common, auth, dashboard, workflow)
- Validate JSON syntax with `npm run lint` or JSON validation tools
- Verify special characters, accents, and diacritics render correctly in each language
- Check that translated strings fit within UI component constraints without breaking layouts
- Test aspect ratio labels and dimension terminology against common usage in target languages
- Verify time duration formatting works correctly with locale-specific conventions
- Confirm purpose badge labels use culturally appropriate terminology for instruction categories
- Validate error and success messages provide clear, actionable feedback in each language

### Dependencies
- REQ-392: Create articles namespace structure ✓ (completed)
- REQ-393: Update editor components for localization ✓
- REQ-394: Update media handling components for localization ✓
- REQ-395: Update crop and trim utilities for localization ✓
- REQ-396: Update instructions pages for localization ✓
- All article/content management components have been updated to use translation keys

### Estimated Effort
**Large (L)**

**Breakdown:**
- Translation generation using automated services: 2-3 hours
- Quality review for editor and media terminology: 3-4 hours
- Review crop/trim utility technical terms: 2-3 hours
- Review instructions table and viewer translations: 2-3 hours
- Validation, testing, and corrections across all 5 languages: 2-3 hours
- Total: 11-16 hours

**Rationale:**
The articles namespace is extensive and complex, containing numerous technical terms related to content editing, media management, image processing, video editing, and instructional content organization. While initial translation generation can be automated using AI services, careful review is essential to ensure contextual accuracy, proper localization of technical terminology, and consistency across the large number of strings spanning multiple component categories. Media-related terminology requires particular attention to align with common usage in each target language, and time/duration formatting must properly support locale conventions.

### Related Tasks
- Part of Epic 2: Static UI Localization
- Phase 2E: Article & Content Management localization
- Task 2E.6: Generate translations for 5 non-English languages
- Follows namespace pattern established in Phase 2A (common), 2B (dashboard), 2C (workflow), and 2D (items)
- Enables comprehensive testing of article management features in all supported languages
- Completes foundation for multilingual content creation and management capabilities

---

## REQ-398: Create Properties Namespace Structure in Translation Files

**Date**: 2026-01-19 23:53
**Type**: NEW FEATURE
**Size**: S

### Summary
Create a properties namespace structure in all translation files to organize UI strings related to property management functionality.

### Current Behavior
Translation files lack a dedicated properties namespace for organizing strings related to property management features. Property-related UI text is either scattered across other namespaces, hardcoded in components, or not yet implemented, making it difficult to maintain consistent terminology and organize property management translations systematically.

### Expected Behavior
All supported language translation files contain a properties namespace with a clear, logical structure for organizing property management UI strings. The namespace follows established patterns from existing namespaces (common, dashboard, workflow, items, articles) and provides organized sections for property listing, property details, property editing, property settings, and property status displays. The structure accommodates future property management features while maintaining consistency with existing translation architecture.

### User Impact
Property managers and hosts benefit from consistent, well-organized terminology throughout property management interfaces. Users creating and managing property listings encounter standardized labels, descriptions, and messages presented in their preferred language. The organized namespace structure ensures property management features maintain translation quality and consistency as new functionality is added over time.

### Business Value
Establishing a properties namespace enables systematic internationalization of property management features, supporting platform expansion into global markets. Clear organization of property-related translations reduces maintenance complexity and ensures consistent terminology across all property management interfaces. The structured approach facilitates future development by providing a clear framework for adding new property management features with proper localization support from the start.

### Acceptance Criteria
- [ ] English (en) translation file contains new properties namespace with initial structure
- [ ] German (de) translation file contains properties namespace matching English structure
- [ ] Spanish (es) translation file contains properties namespace matching English structure
- [ ] French (fr) translation file contains properties namespace matching English structure
- [ ] Italian (it) translation file contains properties namespace matching English structure
- [ ] Dutch (nl) translation file contains properties namespace matching English structure
- [ ] Namespace structure includes logical sections for organizing property management strings
- [ ] Structure follows established patterns from existing namespaces for consistency
- [ ] All translation files maintain valid JSON structure without syntax errors
- [ ] Namespace includes placeholder keys that demonstrate the organizational structure
- [ ] Structure accommodates future property features without requiring reorganization

