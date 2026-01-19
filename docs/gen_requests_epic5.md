# Generated Requests - Epic 5

This file contains auto-generated feature requests for L10N Epic 5.

---

## REQ-304: Translation Status Query Endpoint

**Date**: 2026-01-18 00:00
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners and account administrators should be able to query the translation status of their content across different entity types and languages.

### Current Behavior
No endpoint exists to query translation status. Users cannot see which of their properties, FAQ items, or other content have been translated, are pending translation, or have failed translation.

### Expected Behavior
Users can retrieve translation status information filtered by entity type, specific entity ID, translation status, or property. The response shows both summary counts by status and detailed item-level information. Access is restricted to content belonging to the user's account.

### User Impact
Property owners managing multilingual content need visibility into which items require translation, are in progress, or have completed successfully. Account administrators overseeing multiple properties need aggregate status across their portfolio.

### Business Value
Enables owners to monitor translation coverage and identify content gaps, ensuring guests receive complete information in their preferred language.

### Acceptance Criteria
- [ ] Endpoint accepts optional filters for entity type, entity ID, translation status, and property ID
- [ ] Response includes summary counts grouped by translation status
- [ ] Response includes item-level details showing entity, language, status, and timestamps
- [ ] Only returns translation records for entities owned by the authenticated user's account
- [ ] Unauthorized users receive appropriate error responses
- [ ] Performance remains acceptable when querying large result sets

---

## REQ-305: Manual Translation Update Endpoint

**Date**: 2026-01-18 14:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners should be able to manually update translation content for their properties, FAQ items, and other translatable entities.

### Current Behavior
No endpoint exists for owners to manually provide or edit translations. Translations can only be created through automated translation services, leaving owners unable to correct machine translations or provide their own preferred translations.

### Expected Behavior
Authenticated users can submit updated translation content for entities they own. When a manual update is received, the system records the translation as manually reviewed, captures who performed the review, sets the status to indicate manual curation, and validates the user has appropriate access before persisting changes.

### User Impact
Property owners who are multilingual or who work with professional translators need the ability to override automated translations with manually curated content. This ensures translation quality matches their brand voice and cultural preferences.

### Business Value
Empowers owners to maintain translation quality and accuracy, reducing guest confusion from poor automated translations and improving booking confidence for international travelers.

### Acceptance Criteria
- [ ] Endpoint accepts entity type, entity ID, language code, and translation content
- [ ] Only processes requests from users who own the specified entity
- [ ] Updates the translation status to reflect manual curation
- [ ] Records the authenticated user as the reviewer
- [ ] Returns the updated translation record upon success
- [ ] Returns authorization error when user lacks access to the entity
- [ ] Returns validation error when required fields are missing or malformed
- [ ] Handles non-existent entities gracefully with appropriate error response

---

## REQ-306: Content Re-Translation Queue Endpoint

**Date**: 2026-01-18 04:32
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners should be able to trigger re-translation of their content, with options to preserve or overwrite manually curated translations.

### Current Behavior
No endpoint exists to queue re-translation jobs for existing content. Once content is translated, owners cannot request fresh translations when the source content changes significantly or when translation quality needs improvement.

### Expected Behavior
Authenticated users can submit requests to re-translate one or more entities they own. The request specifies which entities to re-translate and whether to preserve manually edited translations or overwrite them. The system queues translation jobs for each entity-language combination and returns a summary showing how many jobs were queued and how many were skipped due to manual edit protection.

### User Impact
Property owners who update their content descriptions, amenity details, or FAQ answers need those changes reflected in all translated languages. Owners who find machine translation quality inadequate need the ability to request re-translation after improving source content quality. Owners who have manually curated certain translations need assurance those edits won't be accidentally overwritten.

### Business Value
Ensures translated content stays synchronized with source content updates, maintaining translation accuracy and relevance for international guests. Respects owner investment in manual translation curation while enabling bulk refresh operations.

### Acceptance Criteria
- [ ] Endpoint accepts multiple entity identifiers in a single request
- [ ] Endpoint accepts a parameter specifying whether to skip or overwrite manually edited translations
- [ ] Only queues re-translation jobs for entities owned by the authenticated user
- [ ] Response indicates the total number of jobs queued successfully
- [ ] Response indicates the number of entities skipped due to manual edit protection
- [ ] Returns authorization error when user lacks access to any specified entity
- [ ] Returns validation error when entity identifiers are malformed or missing
- [ ] Handles requests for non-existent entities gracefully without queuing jobs

---

## REQ-307: Add Source Version Tracking Columns to Translation Tables

**Date**: 2026-01-18 14:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
Translation tables should track when the source content was last modified to identify stale translations that need updating.

### Current Behavior
Translation tables lack timestamp columns to indicate when the source content was last changed. When property owners update descriptions, amenities, or FAQ answers, the system cannot automatically identify which translations have become outdated and need re-translation.

### Expected Behavior
Each translation table includes a source_version_at timestamp column that records when the source content was last modified. Indexes exist to efficiently query translations by status, enabling fast identification of outdated translations that require attention. The migration applies cleanly through database tooling without manual intervention.

### User Impact
Property owners who update their content expect all language versions to reflect those changes. Without version tracking, outdated translations remain invisible, potentially misleading international guests with obsolete information.

### Business Value
Enables automated detection of stale translations, ensuring international guests always see current information and reducing manual effort required to track which translations need updating after content changes.

### Acceptance Criteria
- [ ] Migration adds source_version_at column to property_translations table
- [ ] Migration adds source_version_at column to listing_translations table
- [ ] Migration adds source_version_at column to faq_translations table
- [ ] Migration adds source_version_at column to amenity_translations table
- [ ] Indexes are created to support efficient queries filtering by translation status
- [ ] Indexes are created to support efficient queries ordering by source version timestamp
- [ ] Migration executes successfully without errors
- [ ] Database type definitions reflect the new columns after migration

---

## REQ-308: Update TypeScript Database Types for Translation Infrastructure

**Date**: 2026-01-18 15:00
**Type**: ENHANCEMENT
**Size**: S

### Summary
TypeScript type definitions should accurately reflect all translation tables and newly added columns to provide type safety and autocomplete support when working with localization data.

### Current Behavior
Database type definitions may not include translation tables introduced in earlier localization epics or recently added columns such as source language tracking, preferred language settings, and source version timestamps. Developers working with translation data lack accurate type checking and autocomplete assistance.

### Expected Behavior
Type definitions comprehensively cover all translation tables including property translations, listing translations, FAQ translations, amenity translations, and system tag translations. Type definitions include all newly added columns for source language tracking, user language preferences, translation status tracking, and source version timestamps. Developers receive immediate feedback when accessing database fields, preventing runtime errors from typos or incorrect field references.

### User Impact
Developers building owner translation management features need reliable type information to avoid bugs. Property owners benefit indirectly through more reliable features with fewer runtime errors caused by type mismatches.

### Business Value
Reduces development time through accurate autocomplete and catches errors at compile time rather than runtime, improving code quality and reducing bug fix cycles.

### Acceptance Criteria
- [ ] Type definitions include all translation table structures
- [ ] Type definitions include source_language columns added to core entity tables
- [ ] Type definitions include preferred_language columns added to user-related tables
- [ ] Type definitions include source_version_at columns added to translation tables
- [ ] Type definitions include all translation status and metadata fields
- [ ] TypeScript compiler successfully validates code using the updated types
- [ ] Autocomplete suggestions appear correctly when accessing translation fields in development environment

---

## REQ-309: Create TranslationManagement Component Type Definitions

**Date**: 2026-01-18 15:15
**Type**: NEW FEATURE
**Size**: S

### Summary
The TranslationManagement component system should have a centralized types file defining all shared interfaces and type definitions used across translation management UI components.

### Current Behavior
No type definitions exist for the TranslationManagement component system. Developers building owner-facing translation management interfaces lack shared type contracts for translation records, status information, filter criteria, and component props.

### Expected Behavior
A dedicated types file exports TypeScript interfaces and types covering translation records with their metadata, translation status enumerations, filter and sort criteria for translation queries, component props for translation management widgets, and callback function signatures for translation operations. Components import these types to ensure consistent data structures and type-safe prop passing throughout the translation management interface.

### User Impact
Property owners interacting with translation management features benefit from a more reliable and consistent user interface. Developers building these features have clear type contracts that prevent prop mismatches and data structure inconsistencies.

### Business Value
Establishes a strong type foundation for the translation management UI system, reducing bugs from type mismatches and improving developer productivity through autocomplete and compile-time error detection.

### Acceptance Criteria
- [ ] Types file is created in the TranslationManagement component directory
- [ ] Interfaces are defined for translation record data structures
- [ ] Enumerations or union types are defined for translation status values
- [ ] Interfaces are defined for filter and query parameters
- [ ] Component prop types are defined for reusable translation management widgets
- [ ] Callback function types are defined for translation operations
- [ ] All exported types include JSDoc comments explaining their purpose
- [ ] TypeScript compiler validates the types file without errors
- [ ] Types are successfully imported and used in at least one component

---

## REQ-310: Create TranslationPreviewPanel Component

**Date**: 2026-01-18 15:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners should be able to view a detailed preview of all translations for a selected content item in a slide-in panel showing source content, translation status across all languages, and available actions.

### Current Behavior
No preview panel exists to display comprehensive translation information for individual content items. Property owners cannot see at a glance which languages have completed translations, which are pending, or which have failed. There is no unified interface to review source content alongside its translations and take actions like editing or requesting re-translation.

### Expected Behavior
When a property owner selects a content item from the translation management interface, a panel slides in from the right side of the screen. The panel displays the source content at the top for reference, followed by a list of all six supported languages showing their current translation status. Each language entry indicates whether translation is complete, pending, failed, or manually edited. Action buttons allow the owner to edit translations, request re-translation for specific languages, or retry failed translations. The panel width is fixed at 400 pixels and overlays the main content without disrupting the layout.

### User Impact
Property owners managing translations across multiple languages need a quick way to assess translation coverage for each piece of content. Viewing all language statuses in one place eliminates the need to navigate between separate pages or toggle multiple dropdowns. Having action buttons directly in the preview panel streamlines the workflow for fixing translation issues or updating content.

### Business Value
Reduces time spent managing translations by consolidating information and actions into a single, accessible interface. Improves translation coverage by making gaps immediately visible, ensuring international guests receive complete information in their preferred language.

### Acceptance Criteria
- [ ] Panel slides in from the right side of the viewport when triggered
- [ ] Panel width is exactly 400 pixels
- [ ] Source content is displayed prominently at the top of the panel
- [ ] All six supported languages are listed with their current translation status
- [ ] Status indicators clearly differentiate between complete, pending, failed, and manually edited states
- [ ] Edit button allows modification of translation content for selected language
- [ ] Re-translate button triggers re-translation for selected language
- [ ] Retry button appears for failed translations and triggers retry operation
- [ ] Panel closes when user clicks outside the panel or activates a close control
- [ ] Panel does not disrupt the main content layout when open
- [ ] Panel is keyboard accessible for navigation and actions

---

## REQ-311: Create TranslationStatusItem Component

**Date**: 2026-01-18 15:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners viewing translation details in the preview panel should see each language represented as a single row displaying language identity, translation status, a preview of the translated content, and available actions.

### Current Behavior
No component exists to display individual language translation status within the preview panel. Property owners cannot see language-specific translation information or take actions on individual language translations.

### Expected Behavior
Each language is displayed as a distinct row within the TranslationPreviewPanel. The row shows the language flag icon on the left, followed by the language name, a colored status indicator showing whether translation is complete, pending, failed, or manually edited, and a preview of the translated text truncated to fit the row. Action buttons on the right allow owners to edit the translation, request re-translation, or retry failed translations. Status indicators use color coding: green for complete translations, orange for pending, red for failed, and purple for manually curated translations.

### User Impact
Property owners reviewing translation coverage for their content need to quickly scan which languages are complete and which need attention. Color-coded status indicators and preview text enable rapid assessment without expanding each item. Action buttons positioned on each row streamline the workflow for addressing translation issues or making edits.

### Business Value
Accelerates translation management workflows by presenting language status in a scannable format with immediate access to relevant actions, reducing the time owners spend maintaining multilingual content.

### Acceptance Criteria
- [ ] Row displays language flag icon aligned to the left
- [ ] Row displays language name adjacent to the flag
- [ ] Row displays status indicator using specified color coding: green for complete, orange for pending, red for failed, purple for manually edited
- [ ] Row displays preview text of the translation, truncated appropriately to fit within row width
- [ ] Row includes action buttons for edit, re-translate, and retry operations
- [ ] Retry button appears only when status indicates translation failure
- [ ] Row maintains consistent height across different languages and content lengths
- [ ] Row is keyboard accessible for navigation and action triggering
- [ ] Row styling provides clear visual separation from adjacent rows
- [ ] Clicking action buttons triggers appropriate translation operations

---

## REQ-312: Create TranslationProgressBar Component

**Date**: 2026-01-18 04:53
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners viewing translation status in the preview panel should see a visual progress indicator showing how many languages have completed translation out of the total number of supported languages.

### Current Behavior
No progress indicator exists to show translation completion status at a glance. Property owners cannot quickly assess overall translation coverage for a content item without scanning through all individual language status rows. There is no visual feedback during active translation processing to indicate that work is in progress.

### Expected Behavior
A progress bar appears at the top of the TranslationPreviewPanel displaying text in the format "X/Y translations complete" where X represents the count of successfully completed translations and Y represents the total number of supported languages. The bar visually fills from left to right proportional to the completion percentage. When translations are actively processing, the progress bar displays an animated state such as a moving gradient or pulsing effect to provide visual feedback that work is underway. The component updates in real-time as translation statuses change.

### User Impact
Property owners managing content across multiple languages need to quickly understand translation coverage without reading through each language entry. A visual progress indicator allows instant recognition of whether content is fully translated, partially translated, or missing most translations. Animation during processing reassures owners that their translation requests are being handled and prevents uncertainty about whether the system is working.

### Business Value
Improves user experience by providing immediate visual feedback about translation status, reducing cognitive load and time spent assessing translation coverage. Animated processing states increase user confidence in the system and reduce support requests about whether translations are working.

### Acceptance Criteria
- [ ] Component displays in a prominent position within the TranslationPreviewPanel
- [ ] Text shows completion count in the format "X/Y translations complete"
- [ ] Visual bar fills proportionally from 0% to 100% based on completion ratio
- [ ] Component distinguishes between complete, pending, failed, and manually edited statuses when calculating completion count
- [ ] Component displays animated state when one or more translations are actively processing
- [ ] Animation is smooth and does not cause performance issues
- [ ] Progress bar updates automatically when translation statuses change
- [ ] Component is accessible with appropriate ARIA labels describing progress state
- [ ] Component styling is consistent with the overall design system
- [ ] Component handles edge cases such as zero translations or all failed translations gracefully

---

## REQ-313: Create TranslationEditor Component

**Date**: 2026-01-18 04:57
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners should be able to edit translation content through a modal dialog that displays the original source text alongside the translation text, allowing direct comparison while making edits.

### Current Behavior
No translation editing interface exists. Property owners cannot manually review or modify automated translations to ensure quality, correct errors, or adjust tone to match their brand voice. There is no way to see source content and translation side by side during editing, making it difficult to ensure translation accuracy.

### Expected Behavior
When a property owner chooses to edit a translation, a modal dialog opens using Radix Dialog. The modal displays a side-by-side view with the original source content on the left and an editable textarea for the translation on the right. A character count displays below the textarea, showing the current length and warning if the translation significantly exceeds or falls short of the source length. Save and Cancel buttons allow the owner to commit changes or dismiss edits. The dialog tracks dirty state, prompting for confirmation if the owner attempts to close with unsaved changes. When saved, the translation is marked as manually reviewed and the modal closes automatically.

### User Impact
Property owners who are multilingual or work with professional translators need the ability to refine automated translations. Seeing source and translation together ensures translations maintain the intended meaning and tone. Character count feedback helps owners ensure translations are appropriately detailed without being verbose. Dirty state tracking prevents accidental loss of editing work when navigating away from the modal.

### Business Value
Empowers property owners to maintain high translation quality that matches their brand standards, improving guest trust and booking confidence for international travelers. Reduces guest confusion from poor automated translations by enabling owner curation.

### Acceptance Criteria
- [ ] Modal opens when edit action is triggered for a translation
- [ ] Modal uses Radix Dialog component for accessibility and keyboard navigation
- [ ] Left pane displays original source content in read-only format
- [ ] Right pane displays editable textarea populated with current translation text
- [ ] Character count displays below textarea showing current character length
- [ ] Character count includes warning indicator if translation length differs significantly from source
- [ ] Save button commits translation changes and closes modal
- [ ] Cancel button dismisses modal without saving changes
- [ ] Modal tracks dirty state and prompts for confirmation if user attempts to close with unsaved edits
- [ ] Saved translations are marked with manually reviewed status
- [ ] Modal is responsive and usable on tablet and desktop viewports
- [ ] Modal is keyboard accessible with proper focus management
- [ ] Textarea supports standard editing operations including undo/redo

---

## REQ-314: Create useTranslationStatus Hook

**Date**: 2026-01-18 16:00
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners viewing translation management interfaces should be able to query translation status for individual entities or entire properties through a reusable React hook that handles data fetching, loading states, and error conditions.

### Current Behavior
No reusable hook exists to fetch translation status data from the backend API. Components attempting to display translation information must implement their own data fetching logic, leading to code duplication and inconsistent error handling patterns. There is no standard way to query translation status at different scopes such as a single entity versus property-wide aggregates.

### Expected Behavior
The useTranslationStatus hook accepts parameters specifying whether to fetch status for a single entity or for all entities within a property. When called with an entity ID, the hook fetches translation status records for that specific entity across all supported languages. When called with a property ID, the hook fetches aggregated translation status covering all translatable entities within that property. The hook returns an object containing loading, error, and data states following standard React Query patterns. The hook handles authentication errors, network failures, and missing data gracefully, providing clear error messages to consuming components.

### User Impact
Property owners navigating translation management screens expect immediate feedback about loading status and clear error messages when data cannot be retrieved. Developers building these screens benefit from a consistent data fetching pattern that eliminates boilerplate code and ensures uniform error handling across all translation interfaces.

### Business Value
Reduces development time by providing a tested, reusable data fetching abstraction. Improves user experience through consistent loading and error states across all translation features. Simplifies maintenance by centralizing API integration logic in a single location.

### Acceptance Criteria
- [ ] Hook accepts optional entity ID parameter for single-entity queries
- [ ] Hook accepts optional property ID parameter for property-wide queries
- [ ] Hook returns loading boolean indicating whether data is being fetched
- [ ] Hook returns error object containing error details when requests fail
- [ ] Hook returns data object containing translation status records when successful
- [ ] Hook automatically refetches data when parameters change
- [ ] Hook handles authentication errors by returning appropriate error state
- [ ] Hook handles network failures gracefully without crashing consuming components
- [ ] Hook provides TypeScript types for all return values
- [ ] Hook can be used by multiple components simultaneously without conflicts

---

## REQ-315: Create useTranslationRealtime Hook

**Date**: 2026-01-18 05:26
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners viewing translation management interfaces should receive automatic updates when translations complete, fail, or change status without needing to manually refresh the page.

### Current Behavior
No realtime subscription mechanism exists to push translation status updates to the client. Property owners must manually refresh the page or re-query the API to see updated translation statuses after requesting translations or re-translations. This creates a poor user experience where owners are uncertain whether their translation requests are being processed and must repeatedly check for updates.

### Expected Behavior
The useTranslationRealtime hook establishes a Supabase realtime subscription to translation table changes filtered by the authenticated user's account. When translation records are inserted, updated, or deleted, the hook receives push notifications from the database and automatically updates the local state, triggering UI re-renders to reflect the new status. The hook accepts entity ID or property ID parameters to scope subscriptions appropriately, reducing unnecessary updates for unrelated content. When the component unmounts or parameters change, the hook cleanly unsubscribes from realtime channels to prevent memory leaks and orphaned subscriptions.

### User Impact
Property owners who request translations or re-translations want immediate visual feedback when processing completes. Automatic updates eliminate the frustration of repeatedly refreshing the page to check status. Real-time notifications reassure owners that their requests are being handled and provide immediate visibility when translations complete successfully or encounter errors requiring attention.

### Business Value
Improves user experience by providing instant feedback on translation operations, reducing perceived latency and increasing confidence in the platform. Eliminates support requests about whether translations are processing by making status changes immediately visible.

### Acceptance Criteria
- [ ] Hook establishes Supabase realtime subscription when mounted
- [ ] Hook filters subscription to only receive updates for the authenticated user's account
- [ ] Hook accepts optional entity ID parameter to scope subscription to specific entity
- [ ] Hook accepts optional property ID parameter to scope subscription to specific property
- [ ] Hook automatically updates local state when translation insert events are received
- [ ] Hook automatically updates local state when translation update events are received
- [ ] Hook automatically updates local state when translation delete events are received
- [ ] Hook cleanly unsubscribes from realtime channel when component unmounts
- [ ] Hook resubscribes with new filters when parameters change
- [ ] Hook handles realtime connection errors gracefully without crashing
- [ ] Hook provides TypeScript types for subscription data payloads
- [ ] Hook can be used by multiple components simultaneously without conflicts
- [ ] UI components using the hook re-render automatically when translation status changes

---

## REQ-316: Create TranslationStatusWidget Component

**Date**: 2026-01-18 17:00
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners and account administrators viewing the dashboard should see a translation status summary widget displaying overall translation progress, counts by status, and a link to view detailed translation management.

### Current Behavior
No dashboard widget exists to display translation status information. Property owners navigating to the dashboard cannot see at a glance how many of their content items have been translated, are pending translation, or have failed. There is no quick access point from the dashboard to the detailed translation management interface.

### Expected Behavior
A compact summary card appears on the dashboard showing translation coverage across all content owned by the authenticated user's account. The widget displays a progress bar with percentage completion representing the ratio of fully translated content items to total translatable items. Below the progress bar, status counts show the breakdown of items by translation status: complete, partial (some languages translated but not all), pending (translation queued but not started), and failed (translation encountered errors). A "View Details" link at the bottom of the widget navigates to the full translation management interface where owners can take action on specific items.

### User Impact
Property owners managing multilingual content need visibility into translation coverage from the dashboard without navigating to specialized screens. Seeing translation progress and status counts at a glance helps owners prioritize translation work and identify issues requiring attention. Direct access from the dashboard to detailed translation management streamlines the workflow for addressing translation gaps. Account administrators overseeing multiple properties benefit from aggregate translation metrics showing portfolio-wide coverage. Identifying properties with low translation completion enables targeted intervention to ensure all listings present complete information to international guests.

### Business Value
Increases translation completion rates by making translation status visible and easily accessible from the primary dashboard interface. Higher translation coverage improves discoverability for international guests and increases booking potential across all supported language markets.

### Acceptance Criteria
- [ ] Widget displays as a summary card component on the dashboard
- [ ] Widget shows progress bar indicating overall translation completion percentage
- [ ] Widget displays count of content items with status "complete" (all languages translated)
- [ ] Widget displays count of content items with status "partial" (some languages translated)
- [ ] Widget displays count of content items with status "pending" (translation queued)
- [ ] Widget displays count of content items with status "failed" (translation errors)
- [ ] Widget includes "View Details" link that navigates to translation management page
- [ ] Widget only displays data for content belonging to the authenticated user's account
- [ ] Widget shows loading state while translation status data is being fetched
- [ ] Widget displays appropriate empty state when no translatable content exists
- [ ] Widget displays error state if translation status data cannot be retrieved
- [ ] Widget is responsive and adapts layout for tablet and desktop viewports
- [ ] Widget is keyboard accessible with proper focus management for the "View Details" link

---

## REQ-317: Create TranslationStatusColumn Component

**Date**: 2026-01-18 17:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners viewing lists of content items should see a compact column displaying translation status across all supported languages using visual indicators that can be clicked to open the detailed preview panel.

### Current Behavior
No compact status indicator exists for displaying translation coverage in table columns. When property owners view lists of their content items, FAQs, or properties, they cannot quickly assess which items have complete translation coverage and which need attention. There is no visual way to scan translation status across multiple content items simultaneously.

### Expected Behavior
A compact status column appears in content tables showing six small indicators representing the six supported languages. Each indicator uses a dot or small icon with color coding to show translation status for that language: green for complete translations, orange for pending, red for failed, gray for not started, and purple for manually edited. Owners can hover over an indicator to see a tooltip identifying the language. Clicking anywhere within the status column for a row opens the TranslationPreviewPanel for that content item, providing quick access to detailed translation information and actions without leaving the table view.

### User Impact
Property owners managing multiple content items need to quickly identify which items have incomplete translation coverage requiring attention. Scanning a table with visual status indicators is significantly faster than opening each item individually to check translation status. Color coding allows instant recognition of problem states such as failed translations that need intervention. One-click access to the detailed preview panel streamlines the workflow for addressing translation issues across many items.

### User Impact
Property owners managing multiple content items across different languages need to quickly identify which items have complete translation coverage and which require attention. Scanning visual indicators in a table column is much faster than checking each item individually. Color-coded status allows instant recognition of issues requiring intervention.

### Business Value
Improves translation management efficiency by enabling rapid identification of incomplete or failed translations across many content items. Higher visibility of translation gaps leads to improved translation coverage, ensuring international guests receive complete information in their preferred language.

### Acceptance Criteria
- [ ] Component displays exactly six indicators representing each supported language
- [ ] Each indicator uses color coding: green for complete, orange for pending, red for failed, gray for not started, purple for manually edited
- [ ] Indicators are compact enough to fit comfortably within a table column without wrapping
- [ ] Hovering over an indicator displays a tooltip showing the language name and status
- [ ] Clicking the status column opens the TranslationPreviewPanel for that content item
- [ ] Component accepts translation status data as a prop including status for each language
- [ ] Component handles missing or incomplete translation data gracefully without breaking layout
- [ ] Component maintains consistent alignment and spacing when used in table rows with varying content heights
- [ ] Component is keyboard accessible allowing users to activate the preview panel via keyboard
- [ ] Component provides appropriate ARIA labels for screen readers
- [ ] Visual indicators remain legible at typical table cell sizes

---

## REQ-318: Create TranslationStatusFilter Component

**Date**: 2026-01-18 18:15
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners viewing lists of content items should be able to filter the list by translation status to quickly focus on items requiring translation work or review.

### Current Behavior
No filter control exists to narrow content lists based on translation status. Property owners viewing all their content items cannot selectively display only items that are fully translated, partially translated, pending translation, have failed translations, or have been manually edited. Owners must scan the entire list to identify items requiring attention, which becomes inefficient as content volume grows.

### Expected Behavior
A dropdown filter control appears above content item lists offering translation status options. The dropdown displays "Translation Status: All" as the default selected value. When clicked, the dropdown expands to show all available filter options: All, Fully Translated, Partially Translated, Pending, Failed, and Manually Edited. When an owner selects a specific status, the list immediately updates to display only items matching that translation status. The selected filter value persists in the dropdown label, showing owners which filter is currently active. Selecting "All" returns the view to showing all items regardless of translation status.

### User Impact
Property owners managing translation coverage across many content items need efficient ways to identify specific translation states requiring action. Filtering to show only pending items helps owners monitor active translation work. Filtering to failed items enables quick identification of errors requiring intervention. Filtering to partially translated items highlights content with incomplete language coverage. Reducing visual clutter by hiding irrelevant items speeds up translation management workflows.

### Business Value
Improves translation management efficiency by allowing owners to focus attention on specific categories of translation work. Faster identification of translation issues leads to quicker resolution and higher overall translation coverage, ensuring international guests receive complete information.

### Acceptance Criteria
- [ ] Component renders as a dropdown control positioned above content item lists
- [ ] Dropdown displays "Translation Status: All" as the default label when no filter is active
- [ ] Dropdown offers six filter options: All, Fully Translated, Partially Translated, Pending, Failed, Manually Edited
- [ ] Selecting a filter option immediately updates the content list to show only matching items
- [ ] Dropdown label updates to reflect the currently selected filter option
- [ ] Selecting "All" removes any active filter and displays all content items
- [ ] Component emits filter change events that parent components can handle to update list data
- [ ] Component accepts current filter value as a prop to support controlled component pattern
- [ ] Dropdown is keyboard accessible with arrow key navigation through options
- [ ] Dropdown provides appropriate ARIA labels for screen readers
- [ ] Component styling is consistent with the overall design system
- [ ] Component is responsive and usable on tablet and desktop viewports

---

## REQ-319: Integrate Translation Status Widget into Dashboard

**Date**: 2026-01-18 18:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The dashboard should display the TranslationStatusWidget component to provide property owners with immediate visibility into translation coverage when they log in.

### Current Behavior
The dashboard layout does not include the TranslationStatusWidget component. Property owners viewing the dashboard cannot see translation status information without navigating to a separate translation management page. Translation coverage metrics are not surfaced at the primary entry point where owners first engage with the application.

### Expected Behavior
The dashboard page displays the TranslationStatusWidget in a prominent position within the layout, typically in the first row of summary cards alongside other key metrics. When the dashboard loads, translation status data is automatically fetched and displayed in the widget. The widget shows overall translation progress, counts by status, and provides a direct link to detailed translation management. The dashboard fetches the status summary on initial page load and displays appropriate loading states while data is being retrieved.

### User Impact
Property owners logging into the platform see translation status immediately without requiring navigation to specialized screens. Prominent placement on the dashboard increases awareness of translation coverage and makes identifying translation gaps part of the daily workflow. Quick access to translation metrics encourages owners to maintain high translation coverage across all supported languages.

### Business Value
Increases translation completion rates by surfacing translation status at the primary dashboard touchpoint. Higher visibility of translation metrics encourages proactive management of multilingual content, improving discoverability for international guests and expanding booking potential across language markets.

### Acceptance Criteria
- [ ] TranslationStatusWidget component is imported into the dashboard page file
- [ ] Widget is positioned in a prominent location within the dashboard layout
- [ ] Dashboard fetches translation status summary data when the page loads
- [ ] Widget receives translation status data through props or context
- [ ] Widget displays loading state during initial data fetch
- [ ] Widget updates automatically if translation status changes while dashboard is visible
- [ ] Widget maintains responsive layout on tablet and desktop viewports
- [ ] Widget does not break dashboard layout when added to the page
- [ ] Widget is keyboard accessible and integrates with dashboard navigation flow
- [ ] Widget only displays for authenticated users with appropriate permissions

---

## REQ-320: Add Translation Status Column to Items Grid

**Date**: 2026-01-18 20:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners viewing their content items in grid or table layouts should see translation status directly in the list view to quickly identify which items require translation attention.

### Current Behavior
The ItemGrid component displays item information without translation status visibility. Property owners cannot see which items have complete translation coverage, partial translations, or failed translations without opening each item individually. Translation management requires navigating away from the item list to a separate interface, breaking the workflow continuity.

### Expected Behavior
The ItemGrid component includes an optional translation status column displaying compact visual indicators for all six supported languages. Each row shows translation status using the TranslationStatusColumn component, which displays color-coded dots or icons representing completion status per language. Clicking the translation status column for any item opens the TranslationPreviewPanel, allowing owners to view details and take action without leaving the item list. The column appears when translation features are enabled and can be toggled on or off based on user preferences or screen size constraints.

### User Impact
Property owners managing items across multiple languages need to quickly identify translation gaps while browsing their item inventory. Inline translation status eliminates the need to open items individually to check translation coverage. One-click access to detailed translation controls streamlines the workflow for addressing translation issues across many items. Viewing translation status alongside other item attributes provides holistic visibility into content completeness.

### Business Value
Reduces time spent managing translations by surfacing status information directly in the primary item management interface. Increases translation completion rates by making gaps immediately visible during routine content management activities, ensuring international guests receive complete information in all supported languages.

### Acceptance Criteria
- [ ] ItemGrid component accepts an optional prop to enable translation status column
- [ ] Translation status column displays when enabled via prop or feature flag
- [ ] Each row includes TranslationStatusColumn component showing status for all six languages
- [ ] Translation status column uses compact visual indicators that fit within standard table cell dimensions
- [ ] Clicking translation status column opens TranslationPreviewPanel for that specific item
- [ ] Column layout adapts responsively, hiding on narrow viewports where space is constrained
- [ ] Column remains aligned and properly spaced when items have varying content lengths
- [ ] Component handles missing translation data gracefully without breaking grid layout
- [ ] Translation status updates automatically when status changes occur
- [ ] Feature integrates with existing ItemGrid filtering and sorting functionality
- [ ] Column is keyboard accessible allowing users to open preview panel via keyboard navigation

---

## REQ-321: Create BulkTranslationBar Component

**Date**: 2026-01-18 05:54
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners who have selected multiple content items should see an action bar offering bulk translation operations across all selected items simultaneously.

### Current Behavior
No bulk action interface exists for translation operations. Property owners who need to re-translate multiple items must open each item individually and request re-translation one at a time. When managing translation coverage across many items, this repetitive workflow becomes time-consuming and error-prone. There is no visual indicator showing which items are currently selected or how many bulk operations will affect.

### Expected Behavior
When a property owner selects one or more content items from the management interface, a floating action bar appears at the bottom of the viewport displaying the count of selected items. The bar offers two bulk translation actions: "Re-translate All Languages" which queues re-translation jobs for all six supported languages across all selected items, and "Re-translate Specific Language" which opens a language selector allowing the owner to choose one language for bulk re-translation. When a bulk operation is triggered, the bar displays a progress indicator showing how many items have been processed out of the total selection. A dismiss control allows owners to clear the selection and hide the action bar. The bar remains visible and fixed at the bottom as owners scroll through the item list, ensuring bulk actions remain accessible regardless of scroll position.

### User Impact
Property owners managing translation updates across multiple properties or content items after making source content improvements need efficient ways to trigger re-translation at scale. Bulk operations eliminate the tedious process of opening each item individually to request re-translation. Visual feedback during processing reassures owners that operations are progressing and provides clarity about completion status. Being able to target specific languages for bulk re-translation allows surgical updates when only certain language translations need refreshing without queuing unnecessary work.

### Business Value
Dramatically reduces time required to maintain translation coverage across large content inventories. Enables property owners to keep translated content synchronized with source updates efficiently, ensuring international guests consistently see current information. Improved translation management workflows increase owner satisfaction and translation completion rates.

### Acceptance Criteria
- [ ] Action bar appears when one or more content items are selected
- [ ] Bar displays the count of currently selected items in the format "X items selected"
- [ ] Bar offers "Re-translate All Languages" action button
- [ ] Bar offers "Re-translate Specific Language" action button that opens language selector
- [ ] Clicking "Re-translate All Languages" queues translation jobs for all six languages across all selected items
- [ ] Language selector allows choosing one specific language for targeted bulk re-translation
- [ ] Bar displays progress indicator during bulk operations showing completion status
- [ ] Progress indicator shows format "Processing X of Y items"
- [ ] Bar includes dismiss control that clears selection and hides the bar
- [ ] Bar remains fixed at bottom of viewport during scrolling
- [ ] Bar prevents triggering multiple concurrent bulk operations
- [ ] Bar displays error state if bulk operations encounter failures
- [ ] Bar provides success confirmation when all bulk operations complete
- [ ] Component is keyboard accessible for all actions
- [ ] Component is responsive and usable on tablet and desktop viewports

---

## REQ-322: Create LanguageSelectorDialog Component

**Date**: 2026-01-18 05:59
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners performing bulk re-translation operations should be able to select one or more specific languages through a modal dialog offering a checkbox list with select all and deselect all controls.

### Current Behavior
No language selection dialog exists for targeting specific languages during bulk operations. When property owners want to re-translate selected items in only certain languages rather than all six supported languages, they lack an interface to specify which languages should be included in the bulk operation. Users must either re-translate all languages even when only a subset needs updating, wasting translation resources, or abandon bulk operations entirely and handle items individually.

### Expected Behavior
When a property owner clicks "Re-translate Specific Language" in the BulkTranslationBar, a modal dialog opens displaying a list of all six supported languages as checkboxes. Each language entry shows the language flag icon, language name, and a checkbox for selection. At the top of the list, two action links appear: "Select All" which checks all language checkboxes simultaneously, and "Deselect All" which unchecks all selections. The dialog footer contains Cancel and Confirm buttons. Clicking Confirm triggers bulk re-translation for only the languages that were checked, then closes the dialog. Clicking Cancel dismisses the dialog without initiating any translation operations. The dialog prevents submission when no languages are selected, displaying an inline validation message prompting the owner to select at least one language.

### User Impact
Property owners who have updated source content or improved translation quality for specific languages need granular control over which languages receive bulk re-translation. Re-translating only necessary languages conserves translation credits and processing time while still enabling efficient bulk operations. Select All and Deselect All controls streamline selection when owners want to process most languages or start fresh with their selection. Preventing submission without selections avoids confusion and accidental empty operations.

### Business Value
Optimizes translation resource utilization by allowing surgical bulk updates targeting only languages that require re-translation. Reduces unnecessary translation processing costs while maintaining the efficiency benefits of bulk operations. Improves owner satisfaction by providing flexible control over translation management workflows.

### Acceptance Criteria
- [ ] Dialog opens when "Re-translate Specific Language" action is triggered from BulkTranslationBar
- [ ] Dialog uses Radix Dialog component for accessibility and keyboard navigation
- [ ] Dialog displays all six supported languages in a vertical checkbox list
- [ ] Each language entry includes flag icon, language name, and checkbox control
- [ ] "Select All" action link checks all language checkboxes simultaneously
- [ ] "Deselect All" action link unchecks all language checkboxes simultaneously
- [ ] Dialog footer contains Cancel button that dismisses dialog without action
- [ ] Dialog footer contains Confirm button that initiates bulk re-translation for selected languages
- [ ] Confirm button is disabled when no languages are selected
- [ ] Inline validation message displays when user attempts to confirm with no selections
- [ ] Dialog tracks dirty state and prompts for confirmation if user attempts to close after making selections
- [ ] Successful confirmation closes dialog and triggers bulk re-translation operation
- [ ] Dialog is responsive and usable on tablet and desktop viewports
- [ ] Dialog is keyboard accessible with proper focus management and tab order
- [ ] Checkbox states are clearly visible for accessibility with sufficient color contrast
- [ ] Dialog provides appropriate ARIA labels for screen readers

---

## REQ-323: Create Translation Management Page

**Date**: 2026-01-18 10:15
**Type**: NEW FEATURE
**Size**: L

### Summary
Property owners and account administrators should have a dedicated page displaying all translatable content in a full-width table with filtering, sorting, and bulk selection capabilities to efficiently manage translations across their entire content inventory.

### Current Behavior
No centralized translation management interface exists. Property owners managing multilingual content must navigate to individual items, properties, or FAQ sections to check translation status and perform translation operations. There is no unified view showing all translatable content across different entity types in one place. Owners cannot filter content by translation status, entity type, or language coverage. Bulk operations on translations require opening items individually, making large-scale translation management impractical.

### Expected Behavior
The Translation Management page displays a full-width data table showing all translatable content belonging to the authenticated user's account. Each table row represents one translatable entity and displays the entity name, entity type, translation status indicators for all six supported languages, and action controls. Above the table, a filter bar offers dropdowns to narrow the view by content type, specific language, and translation status. Users can select multiple rows using checkboxes, activating the BulkTranslationBar for multi-item operations. Clicking a row's translation status column opens the TranslationPreviewPanel for detailed information and single-item actions. The table supports sorting by entity name, type, and overall translation completion percentage. Pagination controls appear when content volume exceeds one page, with configurable items per page. The page displays loading states during data fetching and appropriate empty states when no content matches applied filters.

### User Impact
Property owners managing dozens or hundreds of content items across multiple properties need efficient tools to maintain translation coverage at scale. A centralized management page eliminates the fragmented workflow of checking translations across disconnected sections of the application. Filtering and sorting capabilities allow owners to quickly identify specific translation gaps requiring attention, such as all items missing Spanish translations or all FAQ entries with failed translation jobs. Bulk selection and operations dramatically reduce time spent requesting re-translations or reviewing translation status after making widespread source content improvements. Account administrators overseeing translation coverage for multiple property owners benefit from aggregate visibility and management capabilities across their entire portfolio.

### Business Value
Provides scalable translation management tooling that supports growing content inventories without proportional increases in owner effort. Efficient management interfaces increase translation completion rates by reducing friction in translation workflows, ensuring international guests receive complete information in all supported languages. Higher translation coverage expands booking potential across all language markets and improves platform competitiveness in international markets.

### Acceptance Criteria
- [ ] Page renders at dashboard route for translations showing full-width table layout
- [ ] Table displays all translatable entities owned by authenticated user's account
- [ ] Table columns include entity name, entity type, translation status for each of six languages, and action controls
- [ ] Translation status column uses TranslationStatusColumn component showing visual indicators per language
- [ ] Filter bar appears above table offering type, language, and status filter dropdowns
- [ ] Type filter allows selection of specific entity types or all types
- [ ] Language filter allows selection of specific language or all languages
- [ ] Status filter allows selection by translation completion state
- [ ] Applying filters immediately updates table to show only matching content
- [ ] Table supports row selection via checkboxes for bulk operations
- [ ] Selecting one or more rows activates BulkTranslationBar with bulk action controls
- [ ] Clicking translation status column in any row opens TranslationPreviewPanel for that entity
- [ ] Table supports sorting by entity name, type, and overall translation completion
- [ ] Pagination controls appear when content exceeds page size threshold
- [ ] Page size selector allows choosing items per page
- [ ] Loading state displays during initial data fetch and filter changes
- [ ] Empty state displays when no translatable content exists
- [ ] Empty state displays when active filters match no content
- [ ] Page is responsive and usable on tablet and desktop viewports
- [ ] Page is keyboard accessible with proper focus management for all interactive controls
- [ ] Page only displays content belonging to authenticated user's account
- [ ] Unauthorized users are redirected to appropriate error or login page

---

## REQ-324: Add Translations Navigation Link

**Date**: 2026-01-18 20:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
Property owners navigating the dashboard should see a Translations link in the main navigation menu providing direct access to the translation management page.

### Current Behavior
The dashboard navigation menu does not include a link to the translation management interface. Property owners who want to access translation features must either manually type the URL or navigate through the dashboard widget's "View Details" link. There is no persistent navigation entry making translation management discoverable as a primary application feature.

### Expected Behavior
The dashboard navigation menu includes a "Translations" menu item appearing in a logical position within the navigation hierarchy. The link displays a Languages or Globe icon alongside the text label for visual recognition. When clicked, the navigation item directs users to the Translation Management page where they can view and manage translations across all their content. The navigation item remains visible and accessible from all dashboard pages, providing consistent access to translation features throughout the application.

### User Impact
Property owners managing multilingual content need quick, predictable access to translation tools without memorizing URLs or relying on widget links. A dedicated navigation entry signals that translation management is a first-class feature deserving regular attention. Consistent placement in navigation reduces friction in accessing translation features and encourages owners to maintain translation coverage as part of their regular content management workflow.

### Business Value
Increases translation feature adoption and usage by making translation management easily discoverable through primary navigation. Higher feature visibility leads to improved translation completion rates, ensuring international guests receive complete information in all supported languages and expanding booking potential across language markets.

### Acceptance Criteria
- [ ] Navigation menu includes "Translations" menu item with recognizable label
- [ ] Menu item displays Languages or Globe icon for visual identification
- [ ] Menu item appears in appropriate position within navigation hierarchy
- [ ] Clicking menu item navigates to Translation Management page
- [ ] Menu item is visible from all pages within the dashboard
- [ ] Menu item visual styling is consistent with other navigation elements
- [ ] Active state highlights menu item when user is on Translation Management page
- [ ] Menu item is keyboard accessible and integrates with navigation keyboard controls
- [ ] Menu item includes appropriate ARIA labels for screen readers
- [ ] Menu item only displays for authenticated users with translation management permissions

---

## REQ-325: Create ManualEditWarningDialog Component

**Date**: 2026-01-18 21:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners should be warned when source content has been updated and manual translations exist, allowing them to choose between preserving their manual edits or re-translating all affected languages.

### Current Behavior
No warning mechanism exists when source content is updated after manual translation edits have been made. Property owners who have invested time in manually curating translations for specific languages are not informed when the underlying source content changes. When source content is updated, the system may automatically queue re-translations that would overwrite valuable manual edits without the owner's knowledge or consent. There is no opportunity for owners to review which languages have manual edits before deciding how to handle source content updates.

### Expected Behavior
When a property owner updates source content and manual translations exist for that content, a modal dialog appears before processing the update. The dialog clearly explains that the source content has changed and that manual translation edits exist which may become outdated or be overwritten. The dialog displays a list of all affected languages, showing which languages have manual edits that would be impacted by the source content change. The owner is presented with two options: "Keep Manual Edits" which preserves all manually curated translations as-is without re-translating them, or "Re-translate All" which queues re-translation jobs for all languages, including those with manual edits. The "Re-translate All" option displays a prominent warning that manual edits will be lost. The dialog uses Radix Dialog for accessibility and keyboard navigation. Cancel dismisses the dialog without taking any action on the source content update.

### User Impact
Property owners who have manually refined translations expect their work to be protected from accidental overwriting. When source content evolves, owners need visibility into which translations may be affected and control over how to handle the situation. Some owners may prefer to keep their manual edits and manually update the translations themselves to maintain quality. Others may prefer to re-translate everything and re-apply manual refinements afterward. Providing clear information about affected languages and explicit choice over the outcome respects owner investment in translation quality and prevents frustrating loss of manual work.

### Business Value
Protects owner investment in translation quality by preventing accidental overwriting of manually curated content. Builds trust in the translation management system by giving owners explicit control over their translations. Reduces support requests from owners who have lost manual edits due to unexpected re-translation. Ensures translation quality is maintained even as source content evolves, benefiting international guests who rely on accurate translations.

### Acceptance Criteria
- [ ] Dialog appears when source content is updated and manual translations exist for that content
- [ ] Dialog uses Radix Dialog component for accessibility and keyboard navigation
- [ ] Dialog header clearly indicates that source content has been updated
- [ ] Dialog body explains that manual translation edits exist which may be affected
- [ ] Dialog displays a list of all languages with manual edits that would be impacted
- [ ] Each affected language entry shows language flag icon and language name
- [ ] Dialog offers "Keep Manual Edits" option that preserves existing manual translations
- [ ] Dialog offers "Re-translate All" option that queues re-translation for all languages
- [ ] "Re-translate All" option displays prominent warning that manual edits will be lost
- [ ] Warning uses visual emphasis such as warning icon and contrasting color
- [ ] Cancel button dismisses dialog without processing source content update
- [ ] Selecting "Keep Manual Edits" proceeds with source update without re-translating manual edits
- [ ] Selecting "Re-translate All" proceeds with source update and queues re-translation for all languages
- [ ] Dialog is keyboard accessible with proper focus management and tab order
- [ ] Dialog provides appropriate ARIA labels for screen readers
- [ ] Dialog is responsive and usable on tablet and desktop viewports
- [ ] Component is located at `/src/components/TranslationManagement/ManualEditWarning/ManualEditWarningDialog.tsx`

---

## REQ-326: Integrate Warning into Content Save Flow

**Date**: 2026-01-18 21:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Content save operations should check for existing manual translations and display the ManualEditWarningDialog when source content is being updated, ensuring property owners make informed decisions about preserving or overwriting their manual translation work.

### Current Behavior
Content save handlers process source content updates immediately without checking whether manual translations exist for that content. When property owners update descriptions, FAQ answers, or other translatable content that has been manually curated in one or more languages, the system does not interrupt the save flow to warn about potential translation impacts. Owners are unaware that their source content changes may trigger automatic re-translation that could overwrite valuable manual edits.

### Expected Behavior
When a property owner saves changes to translatable content, the save handler checks whether manual translations exist for that entity before processing the update. If manual translations are detected, the save operation pauses and displays the ManualEditWarningDialog, informing the owner which languages contain manual edits and offering choices about how to proceed. If the owner chooses "Keep Manual Edits," the source content update proceeds while preserving all manually curated translations unchanged. If the owner chooses "Re-translate All," the source content update proceeds and translation jobs are queued for all languages, including those with manual edits. The dialog only appears when manual translations actually exist; routine saves for content without manual edits proceed immediately without interruption.

### User Impact
Property owners who invest time in manually refining translations expect their work to be protected when updating source content. Without warning, owners may unknowingly trigger re-translations that erase hours of manual translation curation. Being interrupted during the save flow to review translation impacts ensures owners make conscious decisions rather than accidentally overwriting their own work. Seeing exactly which languages have manual edits provides clarity about what is at stake and helps owners decide whether to preserve edits and manually update translations later, or to re-translate everything fresh from the improved source content.

### Business Value
Protects owner investment in translation quality by ensuring manual edits are never overwritten without explicit owner consent. Reduces frustration and support requests from owners who have lost manual translation work. Builds trust in the translation management system by respecting owner effort and providing transparent control over translation workflows. Maintains high translation quality as content evolves by giving owners tools to manage the relationship between source updates and existing manual edits.

### Acceptance Criteria
- [ ] Article save handler checks for manual translations before processing source content updates
- [ ] Item save handler checks for manual translations before processing source content updates
- [ ] Save operation pauses when manual translations are detected for the entity being saved
- [ ] ManualEditWarningDialog displays showing affected languages with manual edits
- [ ] Choosing "Keep Manual Edits" in dialog completes save without re-translating manually edited languages
- [ ] Choosing "Re-translate All" in dialog completes save and queues re-translation jobs for all languages
- [ ] Canceling dialog aborts the entire save operation without updating source content
- [ ] Save operations for content without manual translations proceed immediately without warning dialog
- [ ] Translation check query only examines translations for the specific entity being saved
- [ ] Integration handles loading states during translation check query gracefully
- [ ] Integration handles errors during translation check query without breaking save flow
- [ ] Warning dialog integration works for all translatable entity types including properties, FAQs, articles, and amenities
- [ ] User experience remains responsive with minimal delay introduced by translation check

---

## REQ-327: Create Language Preference Setting Component

**Date**: 2026-01-18 06:35
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners should be able to select and save their preferred interface language through a settings interface displaying all supported languages with visual feedback for selection state and save operations.

### Current Behavior
No interface exists for users to set their preferred language for the application. Property owners navigating the platform cannot specify which language they want to see for menus, labels, messages, and other interface elements. Language preference is not captured during user registration or available in settings afterward. The system has no way to determine which language each user prefers for their experience, resulting in all users receiving interface content in the same default language regardless of their linguistic preferences.

### Expected Behavior
A language preference settings section displays a dropdown selector populated with all six supported languages, each shown with their flag icon, native language name, and localized label. The dropdown shows the user's currently saved preference when the section loads. When the user selects a different language from the dropdown, a save button becomes enabled to commit the change. Clicking save updates the user's preferred language setting in the database and displays a loading state on the button during the save operation. Upon successful save, a confirmation message appears and the save button returns to a disabled state until the next change is made. Help text below the dropdown explains that this preference controls which language the user sees throughout the application interface. If the save operation fails, an error message displays indicating the issue without losing the user's selection, allowing them to retry.

### User Impact
Property owners operating in different language markets need the interface presented in their preferred language to use the platform effectively. Users who are not fluent in the default language face barriers to understanding navigation, settings, and feature descriptions. Providing explicit language preference control empowers every user to configure their optimal experience regardless of their primary language. Once set, the preference persists across sessions so users don't need to reconfigure their language choice every time they log in.

### Business Value
Expands platform accessibility to international property owners by supporting their preferred language for all interface elements, not just guest-facing content. Improves user satisfaction and feature adoption rates by removing language barriers to platform navigation and comprehension. Demonstrates commitment to serving a global user base and differentiates the platform from competitors offering only English interfaces.

### Acceptance Criteria
- [ ] Settings section displays language selector dropdown showing all six supported languages
- [ ] Each language option displays flag icon, native language name, and localized label
- [ ] Dropdown shows user's currently saved preferred language when section loads
- [ ] Changing dropdown selection enables the save button
- [ ] Save button displays loading state during save operation
- [ ] Successful save updates user's preferred_language value in the database
- [ ] Successful save displays confirmation message to user
- [ ] Failed save displays error message without losing user's selection
- [ ] Save button returns to disabled state after successful save completes
- [ ] Help text explains that preference controls application interface language
- [ ] Component loads current preference from authenticated user's profile data
- [ ] Component handles missing or invalid preference data gracefully with fallback to default language
- [ ] Component is keyboard accessible with proper focus management for dropdown and button
- [ ] Component provides appropriate ARIA labels for screen readers
- [ ] Component is responsive and usable on tablet and desktop viewports
- [ ] Component styling is consistent with overall settings design system

---

## REQ-328: Create Account Language Preference API Endpoint

**Date**: 2026-01-18 10:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Account administrators should be able to update the preferred language for their account through a secure API endpoint that validates account ownership before persisting preference changes.

### Current Behavior
No API endpoint exists to update account-level language preferences. Account administrators cannot programmatically set or modify which language their account uses for owner-facing interfaces and communications. The system lacks backend infrastructure to persist account language preferences, forcing all accounts to use the default language regardless of the account administrator's linguistic preferences or primary market.

### Expected Behavior
A PUT endpoint accepts requests to update the preferred language for a specific account. The endpoint validates that the authenticated user has administrative access to the account being modified before processing the request. When a valid language preference is submitted, the system updates the account record with the new preferred language value and returns the updated account object confirming the change. The endpoint rejects requests from users who lack access to the specified account with an authorization error. Invalid language codes are rejected with a validation error listing supported language options. The endpoint handles missing account identifiers gracefully, returning appropriate error messages without exposing system internals.

### User Impact
Account administrators managing properties across different language markets need the ability to configure their account's language preference to match their primary operational language. Backend API support enables frontend preference controls to function reliably, ensuring preference changes persist correctly and are immediately available across all user sessions. Proper validation prevents invalid language codes from corrupting account data and ensures only authorized users can modify account preferences.

### Business Value
Provides essential backend infrastructure for account-level language preference functionality, enabling personalized multilingual experiences for account administrators. Secure access validation protects account data from unauthorized modification while allowing legitimate preference updates. Reliable preference persistence ensures consistent language experiences across sessions, improving user satisfaction and platform usability for international account administrators.

### Acceptance Criteria
- [ ] Endpoint accepts PUT requests with account identifier and preferred language value
- [ ] Endpoint validates the authenticated user has administrative access to the specified account
- [ ] Endpoint rejects unauthorized requests with appropriate authorization error response
- [ ] Endpoint validates submitted language code against list of supported languages
- [ ] Endpoint rejects invalid language codes with validation error listing supported options
- [ ] Endpoint updates the account's preferred_language field when validation passes
- [ ] Endpoint returns updated account object upon successful preference update
- [ ] Endpoint handles missing account identifiers with appropriate error response
- [ ] Endpoint handles non-existent account identifiers with not found error response
- [ ] Endpoint returns appropriate error responses when database update operations fail
- [ ] Response format is consistent with other API endpoints in the system
- [ ] Endpoint enforces proper request authentication and session validation

---

## REQ-329: Integrate Language Preference Section into Account Settings

**Date**: 2026-01-18 11:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners and account administrators should be able to access and configure their preferred interface language from within the account settings or user profile page, with the language preference section pre-populated with their current saved preference.

### Current Behavior
No language preference configuration exists within the account settings or user profile pages. The LanguagePreferenceSection component has been created (REQ-327) but is not integrated into any settings interface where users can access it. Users have no discoverable path to configure their preferred interface language within the application's existing settings navigation structure. The account settings page and user profile page both lack any language-related configuration options.

### Expected Behavior
The LanguagePreferenceSection component is integrated into the appropriate settings location based on the application's information architecture. If language preference is account-level (affecting all users on an account), the section appears within account settings. If language preference is user-level (personal preference for each individual user), the section appears within user profile settings. The section displays in a logical position within the settings page layout, grouped with other preferences or personal configuration options. When the settings page loads, the LanguagePreferenceSection queries the current preference from the authenticated user's or account's data and pre-populates the language dropdown with the saved value. If no preference has been set previously, the dropdown defaults to the system default language. The section maintains visual consistency with other settings sections on the page, using the same spacing, typography, and layout patterns.

### User Impact
Property owners and account administrators expect to find language preference configuration in a predictable location within settings. Without integration into the settings flow, users cannot discover or access the language preference feature even though the component exists. Proper integration ensures users can easily locate and configure their language preference as part of their normal settings management workflow. Pre-populating with the current preference confirms to users what language is currently active and prevents confusion about whether their previous selections were saved correctly.

### Business Value
Completes the language preference feature by connecting the settings component to the application's navigation structure, making the feature accessible and usable. Proper integration increases feature adoption by ensuring users can discover language settings through natural exploration of account or profile settings. Higher adoption of language preferences improves user satisfaction for international property owners and demonstrates platform commitment to serving a global user base.

### Acceptance Criteria
- [ ] Determine whether language preference belongs in account settings or user profile based on application architecture
- [ ] Import LanguagePreferenceSection component into the appropriate settings page file
- [ ] Position the section in a logical location within the settings page layout
- [ ] Section groups appropriately with other preference or personalization settings
- [ ] Settings page fetches current language preference when loading
- [ ] LanguagePreferenceSection receives current preference value as prop or through context
- [ ] Dropdown displays the currently saved preference when section renders
- [ ] If no preference exists, dropdown displays the system default language
- [ ] Section styling is consistent with other sections on the settings page
- [ ] Section maintains responsive layout on tablet and desktop viewports
- [ ] Section is keyboard accessible within the settings page tab order
- [ ] Settings page handles loading states during preference data fetch
- [ ] Settings page handles error states if preference data cannot be retrieved
- [ ] Preference changes made in the section persist correctly to the backend
- [ ] Navigation to settings page is accessible from main application navigation

---

## REQ-330: Integrate Translation Preview Panel into Article Editor

**Date**: 2026-01-18 10:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners editing articles should see the translation preview panel automatically appear after saving, with automatic panel opening when translations are pending or incomplete.

### Current Behavior
The article editor allows property owners to create and modify content without providing visibility into translation status upon save completion. After saving an article, owners cannot immediately see whether translations have been queued, completed, or failed. There is no automatic feedback mechanism informing owners about pending translations that require attention or manual review. Owners must navigate away from the editor to a separate translation management interface to check translation status for the article they just edited.

### Expected Behavior
When a property owner saves an article in the editor, the system displays the TranslationPreviewPanel after the save operation completes successfully. The panel slides in from the right showing translation status for all six supported languages, providing immediate visibility into whether translations are complete, pending, failed, or manually edited. If any translations are in pending status after save, the panel automatically opens without requiring user action, ensuring owners are aware that translation work is in progress. If all translations are already complete, the panel remains collapsed but available, allowing owners to expand it if they wish to review or modify translations. The panel displays the saved article content as the source reference at the top, followed by the status list for each language with appropriate action buttons for editing, re-translating, or retrying failed translations.

### User Impact
Property owners creating or updating articles expect feedback about what happens next with their content. Automatically showing translation status after save reduces uncertainty about whether translation processing was triggered and eliminates the need to navigate elsewhere to check progress. When translations are pending, automatic panel opening draws attention to the fact that work is underway, reassuring owners that the system is actively processing their content. Having the preview panel immediately accessible after save streamlines the workflow for reviewing and refining translations without losing context from the editing session.

### Business Value
Improves editor user experience by providing immediate translation feedback at the moment owners care most about translation status. Reduces friction in translation management workflows by eliminating navigation away from the editor to check translation progress. Increases translation review and refinement rates by surfacing translation controls immediately after content creation, leading to higher translation quality for international guests.

### Acceptance Criteria
- [ ] TranslationPreviewPanel component is integrated into the article editor page
- [ ] Panel displays automatically after successful article save operations
- [ ] Panel loads translation status data for the saved article across all six languages
- [ ] Panel automatically opens when one or more translations have pending status
- [ ] Panel remains collapsed when all translations are complete, but remains available for manual opening
- [ ] Panel displays article source content at the top for reference
- [ ] Panel shows status indicators for each of the six supported languages
- [ ] Panel includes action buttons for editing, re-translating, and retrying translations
- [ ] Panel positioning and animation matches standard TranslationPreviewPanel behavior from other contexts
- [ ] Panel does not disrupt article editor layout when displayed
- [ ] Panel handles cases where no translations exist gracefully without errors
- [ ] Panel updates in real-time if translation statuses change while panel is open
- [ ] Panel can be manually closed by user after reviewing translation status
- [ ] Integration maintains responsive layout on tablet and desktop viewports
- [ ] Panel is keyboard accessible and integrates with editor keyboard navigation

---

## REQ-331: Integrate Translation Preview Panel into Item Editor

**Date**: 2026-01-18 11:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners editing items should see the translation preview panel automatically appear after saving, with automatic panel opening when translations are pending or incomplete.

### Current Behavior
The item editor allows property owners to create and modify items without providing visibility into translation status upon save completion. After saving an item, owners cannot immediately see whether translations have been queued, completed, or failed. There is no automatic feedback mechanism informing owners about pending translations that require attention or manual review. Owners must navigate away from the editor to a separate translation management interface to check translation status for the item they just edited.

### Expected Behavior
When a property owner saves an item in the editor, the system displays the TranslationPreviewPanel after the save operation completes successfully. The panel slides in from the right showing translation status for all six supported languages, providing immediate visibility into whether translations are complete, pending, failed, or manually edited. If any translations are in pending status after save, the panel automatically opens without requiring user action, ensuring owners are aware that translation work is in progress. If all translations are already complete, the panel remains collapsed but available, allowing owners to expand it if they wish to review or modify translations. The panel displays the saved item content as the source reference at the top, followed by the status list for each language with appropriate action buttons for editing, re-translating, or retrying failed translations.

### User Impact
Property owners creating or updating FAQ items expect feedback about what happens next with their content. Automatically showing translation status after save reduces uncertainty about whether translation processing was triggered and eliminates the need to navigate elsewhere to check progress. When translations are pending, automatic panel opening draws attention to the fact that work is underway, reassuring owners that the system is actively processing their content. Having the preview panel immediately accessible after save streamlines the workflow for reviewing and refining translations without losing context from the editing session.

### Business Value
Improves editor user experience by providing immediate translation feedback at the moment owners care most about translation status. Reduces friction in translation management workflows by eliminating navigation away from the editor to check translation progress. Increases translation review and refinement rates by surfacing translation controls immediately after content creation, leading to higher translation quality for international guests.

### Acceptance Criteria
- [ ] TranslationPreviewPanel component is integrated into the item editor page
- [ ] Panel displays automatically after successful item save operations
- [ ] Panel loads translation status data for the saved item across all six languages
- [ ] Panel automatically opens when one or more translations have pending status
- [ ] Panel remains collapsed when all translations are complete, but remains available for manual opening
- [ ] Panel displays item source content at the top for reference
- [ ] Panel shows status indicators for each of the six supported languages
- [ ] Panel includes action buttons for editing, re-translating, and retrying translations
- [ ] Panel positioning and animation matches standard TranslationPreviewPanel behavior from other contexts
- [ ] Panel does not disrupt item editor layout when displayed
- [ ] Panel handles cases where no translations exist gracefully without errors
- [ ] Panel updates in real-time if translation statuses change while panel is open
- [ ] Panel can be manually closed by user after reviewing translation status
- [ ] Integration maintains responsive layout on tablet and desktop viewports
- [ ] Panel is keyboard accessible and integrates with editor keyboard navigation

---

## REQ-332: Implement Loading States and Error Handling for Translation Components

**Date**: 2026-01-18 07:03
**Type**: ENHANCEMENT
**Size**: L

### Summary
All translation management components should display appropriate loading indicators during asynchronous operations and show clear error messages with retry options when operations fail.

### Current Behavior
Translation management components lack consistent loading state indicators and error handling mechanisms. When property owners trigger translation operations, request status queries, or save preference changes, they receive no visual feedback during processing. When API requests fail due to network issues, server errors, or validation problems, components either crash, display generic browser errors, or fail silently without informing users what went wrong. There are no retry mechanisms for failed operations, forcing users to reload the entire page or re-navigate to attempt operations again.

### Expected Behavior
Every translation component displays loading spinners or skeleton states during data fetching and processing operations. The TranslationPreviewPanel shows a loading spinner while querying translation status after being opened. The TranslationStatusWidget on the dashboard displays skeleton placeholders for status counts while loading. The LanguagePreferenceSection shows a loading state on the save button during preference update operations. When any API request fails, components display user-friendly error messages through toast notifications or inline alert components explaining what went wrong in clear language. Error messages distinguish between different failure types such as network errors, authentication failures, validation errors, and server errors, providing context-appropriate guidance. Failed operations display retry buttons allowing users to attempt the operation again without losing their work or navigating away. Retry buttons are positioned directly alongside error messages for immediate access. Components handle partial failures gracefully, such as when bulk re-translation succeeds for some items but fails for others, showing which items succeeded and which require retry.

### User Impact
Property owners performing translation operations expect immediate visual feedback confirming their actions are being processed. Without loading indicators, delays create uncertainty about whether the system is working or has frozen. When errors occur, generic or missing error messages leave owners confused about what went wrong and how to proceed. Having to reload the page or re-enter information after failures creates frustration and wastes time. Clear error messages help owners understand whether issues are temporary network problems, permission issues requiring admin intervention, or input validation errors they can fix immediately. Retry buttons eliminate the need to repeat entire workflows after transient failures, preserving user progress and reducing friction. Partial failure handling ensures owners can identify and address only the problematic subset of items rather than abandoning entire bulk operations due to a few failures.

### Business Value
Improves user experience by providing transparent feedback about system state and operation progress, building trust in the translation management features. Reduces support requests by clearly explaining errors and providing self-service retry mechanisms for common failure scenarios. Increases feature adoption by reducing frustration from poor error handling that might otherwise discourage owners from using translation features. Maintains user productivity by enabling graceful recovery from failures without losing work or requiring full page reloads.

### Acceptance Criteria
- [ ] TranslationPreviewPanel displays loading spinner while fetching translation status data
- [ ] TranslationStatusWidget displays skeleton placeholders during dashboard load
- [ ] TranslationEditor modal shows loading state during save operations
- [ ] LanguagePreferenceSection shows loading state on save button during preference updates
- [ ] BulkTranslationBar displays progress indicator during bulk re-translation operations
- [ ] Translation Management page shows loading state during initial data fetch and filter changes
- [ ] All API failures trigger user-friendly error messages via toast notifications or inline alerts
- [ ] Error messages distinguish between network errors, authentication failures, validation errors, and server errors
- [ ] Error messages provide clear explanations in non-technical language
- [ ] Failed operations display retry buttons positioned adjacent to error messages
- [ ] Retry buttons re-attempt the failed operation without requiring user to re-enter data
- [ ] Components handle partial bulk operation failures by showing success and failure counts separately
- [ ] Partial failures display lists showing which items succeeded and which failed with retry options
- [ ] Loading states use accessible ARIA labels for screen readers
- [ ] Error messages are keyboard accessible and can be dismissed via keyboard
- [ ] Toast notifications auto-dismiss after appropriate timeout for non-critical errors
- [ ] Critical errors requiring user action remain visible until explicitly dismissed
- [ ] Components maintain responsive layout during loading and error states
- [ ] Loading indicators do not block user interface unnecessarily when operations can run in background
- [ ] Error handling prevents component crashes and application state corruption

---

## REQ-333: Add Accessibility Features to Translation Management Interface

**Date**: 2026-01-18 22:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
Translation management components should provide comprehensive accessibility features including semantic labels, keyboard navigation, screen reader announcements, and focus management to ensure all users can effectively manage translations regardless of ability.

### Current Behavior
Translation management components do not implement comprehensive accessibility patterns. Status icons lack descriptive text labels explaining their meaning to screen reader users. The preview panel cannot be navigated efficiently using only keyboard controls. When translation status changes occur, screen readers do not announce the updates, leaving users unaware that translations have completed or failed. Modal dialogs do not manage focus properly, allowing keyboard focus to escape the dialog or fail to return to the triggering element when closed. Interactive elements lack sufficient contrast ratios and focus indicators for users with visual impairments.

### Expected Behavior
All translation status icons include ARIA labels describing their meaning, such as "Translation complete," "Translation pending," "Translation failed," or "Manually edited translation." The TranslationPreviewPanel supports full keyboard navigation with tab key moving between interactive elements in logical order, arrow keys navigating between language entries in the status list, and Escape key closing the panel. When translation status changes from pending to complete or failed, screen reader users receive live region announcements stating "Translation completed for Spanish" or "Translation failed for French." Modal dialogs including TranslationEditor and LanguageSelectorDialog implement proper focus trapping, preventing keyboard focus from leaving the dialog while open. When modals open, focus moves automatically to the first interactive element or a designated initial focus target. When modals close, focus returns to the element that triggered the modal, maintaining navigation context. All interactive elements including buttons, links, and form controls display visible focus indicators with sufficient contrast to meet accessibility standards. Color-coded status indicators are supplemented with icons or text labels so status remains distinguishable for users with color vision deficiencies.

### User Impact
Property owners using screen readers or keyboard-only navigation need equal access to translation management features to maintain their content across languages. Visual status indicators are meaningless to screen reader users without descriptive labels explaining translation states. Keyboard navigation inefficiencies force users to tab through excessive elements or prevent efficient navigation entirely. Missing live region announcements mean screen reader users must manually query status repeatedly to detect when translations complete, creating inefficient workflows. Poor focus management in modals disorients keyboard users by allowing focus to escape into background content or losing navigation context when dialogs close. Insufficient focus indicators create uncertainty about which element is currently selected, increasing interaction errors and cognitive load.

### Business Value
Ensures compliance with web accessibility standards including WCAG guidelines, reducing legal risk and demonstrating commitment to inclusive design. Expands the platform's addressable market to include property owners with disabilities who rely on assistive technologies. Improves usability for all users through better keyboard navigation and focus management patterns that benefit power users who prefer keyboard shortcuts. Enhances platform reputation by providing thoughtful, inclusive experiences that respect diverse user needs and abilities.

### Acceptance Criteria
- [ ] All translation status icons include descriptive ARIA labels indicating status meaning
- [ ] Status labels distinguish between complete, pending, failed, and manually edited states
- [ ] TranslationPreviewPanel supports tab key navigation through all interactive elements in logical order
- [ ] Preview panel supports arrow key navigation between language status entries
- [ ] Pressing Escape key while preview panel is open closes the panel
- [ ] Translation status changes trigger screen reader announcements via ARIA live regions
- [ ] Live region announcements include the affected language and new status state
- [ ] TranslationEditor modal implements focus trapping preventing focus from escaping dialog
- [ ] LanguageSelectorDialog modal implements focus trapping preventing focus from escaping dialog
- [ ] ManualEditWarningDialog modal implements focus trapping preventing focus from escaping dialog
- [ ] When modals open, focus moves automatically to first interactive element or designated initial focus target
- [ ] When modals close, focus returns to the triggering element that opened the modal
- [ ] All buttons, links, and form controls display visible focus indicators when focused
- [ ] Focus indicators meet minimum contrast ratio requirements for accessibility standards
- [ ] Color-coded status indicators are supplemented with icons or text ensuring status is distinguishable without color
- [ ] Form validation errors are announced to screen readers when they occur
- [ ] Loading states and progress indicators are announced to screen readers via live regions
- [ ] All interactive elements have descriptive accessible names via ARIA labels or visible text
- [ ] Component landmarks use appropriate ARIA roles to aid screen reader navigation
- [ ] Skip links or keyboard shortcuts allow bypassing repetitive navigation elements
- [ ] Keyboard focus never becomes trapped in non-modal contexts
- [ ] Interactive element hit targets meet minimum size requirements for touch and pointer accessibility

---

## REQ-334: Write Unit Tests for Translation Hooks

**Date**: 2026-01-18 10:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
Translation hook implementations should be validated through comprehensive unit tests ensuring correct behavior for data fetching, state management, and realtime subscription handling.

### Current Behavior
No unit tests exist for the useTranslationStatus and useTranslationRealtime hooks. Property owners relying on these hooks for translation management interfaces have no automated validation ensuring the hooks behave correctly under various conditions. Developers modifying hook implementations lack test coverage to catch regressions or verify that changes don't break existing functionality. Edge cases such as network failures, authentication errors, missing data, or subscription disconnections may not be handled correctly because these scenarios have not been tested systematically.

### Expected Behavior
A test suite validates both useTranslationStatus and useTranslationRealtime hooks using React Testing Library patterns appropriate for testing custom hooks. Tests for useTranslationStatus verify that the hook fetches translation status correctly when provided with entity IDs or property IDs, returns expected loading states during data fetching, returns error states when API requests fail, and handles authentication errors appropriately. Tests mock Supabase client responses using standard mocking patterns, simulating successful data retrieval, network failures, and various error conditions. Tests for useTranslationRealtime verify that the hook establishes realtime subscriptions when mounted, filters subscriptions appropriately based on provided parameters, updates local state when insert events are received, updates local state when update events are received, cleans up subscriptions when the component unmounts, and handles realtime connection errors gracefully. Mock implementations simulate Supabase realtime channel subscription behavior including event emission, connection state changes, and cleanup operations. Test cases cover normal operation paths as well as error scenarios ensuring hooks remain stable under adverse conditions.

### User Impact
Property owners viewing translation management interfaces depend on hooks functioning reliably across all conditions. Untested hooks may fail silently or crash when encountering edge cases like network timeouts or authentication expiration, creating frustration when translation status appears to load indefinitely or disappears unexpectedly. Developers maintaining translation features benefit from test coverage that documents expected behavior and catches regressions during refactoring or enhancement work. Comprehensive tests increase confidence that hook implementations are robust enough for production use.

### Business Value
Reduces bugs in translation management features by validating hook behavior before deployment. Improves developer productivity through automated regression detection that catches issues during development rather than after release. Increases code maintainability by documenting expected hook behavior through test specifications. Enhances platform reliability by ensuring translation features remain stable under diverse network conditions and error scenarios.

### Acceptance Criteria
- [ ] Test suite created for useTranslationStatus hook using React Testing Library
- [ ] Tests verify hook returns loading state during initial data fetch
- [ ] Tests verify hook returns data state when fetch succeeds
- [ ] Tests verify hook returns error state when fetch fails
- [ ] Tests verify hook handles authentication errors with appropriate error state
- [ ] Tests verify hook refetches data when parameters change
- [ ] Tests mock Supabase client select queries returning successful responses
- [ ] Tests mock Supabase client select queries returning error responses
- [ ] Test suite created for useTranslationRealtime hook using React Testing Library
- [ ] Tests verify hook establishes Supabase realtime subscription on mount
- [ ] Tests verify hook filters subscription by entity ID when provided
- [ ] Tests verify hook filters subscription by property ID when provided
- [ ] Tests verify hook updates state when translation insert events are received
- [ ] Tests verify hook updates state when translation update events are received
- [ ] Tests verify hook updates state when translation delete events are received
- [ ] Tests verify hook unsubscribes from realtime channel on unmount
- [ ] Tests mock Supabase realtime subscription setup and event emission
- [ ] Tests mock realtime connection errors and verify graceful handling
- [ ] Tests verify hook resubscribes when filter parameters change
- [ ] All tests pass successfully in continuous integration environment
- [ ] Test coverage for both hooks meets project quality standards
- [ ] Tests execute quickly without introducing unnecessary delays
- [ ] Mock implementations accurately simulate Supabase client behavior

---

## REQ-335: Component Test Suite for Translation Management UI

**Date**: 2026-01-18 07:20
**Type**: ENHANCEMENT
**Size**: M

### Summary
Translation management components should have automated tests verifying rendering behavior, user interactions, and data flow to ensure reliability and prevent regressions.

### Current Behavior
No component tests exist for the translation management user interface. Changes to TranslationPreviewPanel, TranslationEditor, TranslationStatusWidget, and related components cannot be validated automatically. Developers modifying these components lack confidence that changes preserve existing functionality. Manual testing is required for every modification, slowing development velocity and increasing the risk of undetected bugs reaching users.

### Expected Behavior
A comprehensive test suite covers critical translation management components including TranslationPreviewPanel, TranslationEditor, and TranslationStatusWidget. Tests verify that TranslationPreviewPanel renders correctly with different translation status combinations across all six languages and responds appropriately to user interactions like opening the editor or triggering re-translation. Tests confirm that TranslationEditor displays source and translation content side by side, tracks changes to the translation text, prevents saving when text is invalid, marks translations as manually reviewed upon successful save, and prompts for confirmation when closing with unsaved changes. Tests validate that TranslationStatusWidget displays accurate counts for complete, partial, pending, and failed translation statuses, updates automatically when status data changes, and navigates to the detailed translation management page when the user clicks the view details link.

### User Impact
Property owners relying on translation management features benefit from increased stability and fewer bugs introduced by new development. Developers building and maintaining translation features gain faster feedback loops through automated testing, reducing time spent on manual verification and increasing confidence when refactoring or adding capabilities.

### Business Value
Reduces regression risk as the translation management system evolves, protecting platform reliability and owner trust. Accelerates development velocity by catching bugs earlier in the development cycle before they reach users. Enables safer refactoring and optimization of translation components, improving long-term code maintainability.

### Acceptance Criteria
- [ ] Test suite includes tests for TranslationPreviewPanel component
- [ ] TranslationPreviewPanel tests verify component renders with translation status data
- [ ] TranslationPreviewPanel tests verify status indicators display correctly for all six languages
- [ ] TranslationPreviewPanel tests verify action buttons appear for appropriate translation states
- [ ] TranslationPreviewPanel tests verify clicking edit button opens the TranslationEditor
- [ ] TranslationPreviewPanel tests verify clicking re-translate button triggers re-translation request
- [ ] Test suite includes tests for TranslationEditor component
- [ ] TranslationEditor tests verify source content displays in read-only left pane
- [ ] TranslationEditor tests verify translation content displays in editable right pane
- [ ] TranslationEditor tests verify character count updates as user types
- [ ] TranslationEditor tests verify save button becomes enabled when content changes
- [ ] TranslationEditor tests verify save operation marks translation as manually reviewed
- [ ] TranslationEditor tests verify save operation closes the editor upon success
- [ ] TranslationEditor tests verify dirty state warning appears when closing with unsaved changes
- [ ] Test suite includes tests for TranslationStatusWidget component
- [ ] TranslationStatusWidget tests verify component displays count of complete translations
- [ ] TranslationStatusWidget tests verify component displays count of partial translations
- [ ] TranslationStatusWidget tests verify component displays count of pending translations
- [ ] TranslationStatusWidget tests verify component displays count of failed translations
- [ ] TranslationStatusWidget tests verify progress bar fills proportionally to completion ratio
- [ ] TranslationStatusWidget tests verify view details link navigates to translation management page
- [ ] All tests pass consistently in continuous integration environment
- [ ] Test suite uses appropriate mocking for API calls and data dependencies
- [ ] Test suite achieves meaningful code coverage for tested components
- [ ] Tests are maintainable and clearly document expected component behavior

---

## REQ-336: Create Translation Status API Endpoint

**Date**: 2026-01-19 00:00
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners should be able to query translation status information for their content through an API endpoint that accepts filters and returns both summary counts and item-level status details.

### Current Behavior
No API endpoint exists to query translation status. Property owners viewing translation management interfaces cannot retrieve data showing which content items have complete translations, pending translations, or failed translation jobs. Frontend components attempting to display translation status lack a backend data source.

### Expected Behavior
A GET endpoint accepts optional query parameters filtering translation status by entity type, specific entity ID, translation status, and property ID. When filters are provided, the endpoint narrows results to only translation records matching all specified criteria. The response includes a summary object containing counts grouped by translation status such as how many translations are complete, pending, or failed. The response also includes an array of detailed translation records showing the entity identifier, language code, translation status, and relevant timestamps for each record. The endpoint validates that the authenticated user owns all entities included in the results, ensuring users cannot access translation information for content belonging to other accounts. When a user lacks authorization to view requested content, the endpoint returns an appropriate error response. The endpoint handles missing or invalid filter parameters gracefully, treating them as requests for all data within the user's access scope.

### User Impact
Property owners managing translation coverage across multiple content items need visibility into which translations are complete and which require attention. Querying by entity type allows owners to check translation status for all their FAQ items or all their property descriptions separately. Filtering by specific entity ID provides detailed status for individual content pieces when editing or reviewing them. Filtering by translation status enables workflows focused on addressing pending or failed translations. Summary counts give owners at-a-glance understanding of overall translation coverage without scanning through individual records.

### Business Value
Provides essential backend infrastructure for all translation management UI features, enabling data-driven interfaces that help property owners maintain high translation coverage. Secure access validation protects content privacy while enabling authorized users to efficiently manage their multilingual content. Flexible filtering capabilities support diverse user workflows from high-level overview to detailed item-specific management.

### Acceptance Criteria
- [ ] Endpoint accepts GET requests with optional entityType query parameter
- [ ] Endpoint accepts GET requests with optional entityId query parameter
- [ ] Endpoint accepts GET requests with optional status query parameter
- [ ] Endpoint accepts GET requests with optional propertyId query parameter
- [ ] Endpoint returns translation records matching all provided filter criteria
- [ ] Endpoint returns all translation records within user's access scope when no filters are provided
- [ ] Response includes summary object with counts grouped by translation status
- [ ] Response includes array of detailed translation records showing entity, language, status, and timestamps
- [ ] Endpoint validates authenticated user has access to all entities included in results
- [ ] Endpoint rejects unauthorized requests with appropriate error response
- [ ] Endpoint handles invalid filter parameters gracefully without crashing
- [ ] Endpoint returns empty results when filters match no translation records
- [ ] Response format is consistent with other API endpoints in the system
- [ ] Endpoint performance remains acceptable when querying large result sets
- [ ] Endpoint enforces proper request authentication and session validation

---

## REQ-337: Create Update Translation API Endpoint

**Date**: 2026-01-19 11:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners should be able to update translation content for entities they own through a secure API endpoint that marks translations as manually reviewed.

### Current Behavior
No API endpoint exists for updating translation content. Property owners viewing their automated translations cannot manually edit or refine the translated text. When machine translations contain errors, use inappropriate tone, or fail to capture brand voice, owners have no way to provide corrected translations.

### Expected Behavior
The endpoint accepts requests containing the entity type, entity identifier, language code, and updated translation content. Before processing the update, the system verifies that the authenticated user has ownership rights to the specified entity. When authorization is confirmed, the endpoint persists the updated translation content and automatically sets the translation status to indicate manual curation. The system records the authenticated user's identifier as the reviewer responsible for the manual edit. The endpoint returns the complete updated translation record upon successful save. When users attempt to update translations for entities they do not own, the endpoint rejects the request with an authorization error. Missing or malformed required fields trigger validation errors with clear explanations of what needs correction.

### User Impact
Property owners who are multilingual or who collaborate with professional translators need the ability to refine automated translations to ensure quality matches their brand standards. When translations contain cultural nuances that machine translation misses, owners need control to provide appropriate alternatives. Recording who performed manual edits provides accountability and helps teams coordinate translation work.

### Business Value
Empowers property owners to maintain translation quality that meets their standards, improving guest confidence and booking conversion for international travelers. Reduces guest confusion from inaccurate automated translations by enabling owner refinement. Builds trust in the translation system by giving owners explicit control over their multilingual content.

### Acceptance Criteria
- [ ] Endpoint accepts PUT requests with entity type, entity ID, language code, and translation content
- [ ] Endpoint validates the authenticated user owns the specified entity before processing
- [ ] Endpoint rejects unauthorized requests with appropriate authorization error
- [ ] Endpoint validates all required fields are present and properly formatted
- [ ] Endpoint returns validation error when required fields are missing or malformed
- [ ] Endpoint updates the translation content in the database when validation passes
- [ ] Endpoint sets translation status to indicate manual curation
- [ ] Endpoint records the authenticated user's identifier as the reviewer
- [ ] Endpoint returns the complete updated translation record upon success
- [ ] Endpoint handles requests for non-existent entities with appropriate error response
- [ ] Endpoint handles requests for non-existent translations by creating new translation records
- [ ] Response format is consistent with other API endpoints in the system
- [ ] Endpoint enforces proper request authentication and session validation

---

## REQ-338: Create Re-Translate API Endpoint

**Date**: 2026-01-19 00:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners should be able to trigger re-translation of existing content through an API endpoint that supports bulk operations, provides control over manual edit preservation, and returns detailed processing results.

### Current Behavior
No dedicated re-translation endpoint exists at `/src/app/api/translations/retranslate/route.ts`. Property owners cannot programmatically request re-translation of content that has already been translated. When source content is updated or translation quality needs improvement, owners lack an API mechanism to queue fresh translation jobs for existing entities. There is no way to specify whether manually curated translations should be preserved or overwritten during re-translation operations.

### Expected Behavior
A POST endpoint at `/src/app/api/translations/retranslate/route.ts` accepts requests to re-translate one or more entities. The request body includes an array of entity identifiers specifying which content items to re-translate, and a boolean parameter controlling whether manually edited translations should be skipped or overwritten. When the skip manual edits option is enabled, the system queues re-translation jobs only for languages where translations are either automated or missing, preserving any translations marked as manually reviewed. When the overwrite option is enabled, re-translation jobs are queued for all languages regardless of manual edit status. The endpoint processes each entity in the request, queuing translation jobs for appropriate language combinations based on the manual edit policy. The response includes a count of how many translation jobs were successfully queued and a count of how many entity-language combinations were skipped due to manual edit protection. The endpoint validates that the authenticated user owns all specified entities before processing, rejecting unauthorized requests with appropriate error responses.

### User Impact
Property owners who have updated source content descriptions need an efficient way to refresh all translated versions without manually triggering re-translation for each language individually. When translation service quality improves or translation models are updated, owners want to request fresh translations for existing content to benefit from improved quality. Owners who have invested time in manually curating certain translations need assurance that bulk re-translation operations won't accidentally overwrite their manual work. Receiving clear feedback about how many jobs were queued versus skipped helps owners understand what processing occurred and whether manual translations were successfully protected.

### Business Value
Enables efficient translation maintenance at scale, allowing property owners to keep translated content synchronized with source updates without excessive manual effort. Respects owner investment in manual translation curation by providing explicit control over whether manual edits are preserved or refreshed. Supports continuous improvement of translation quality by making it easy to re-translate content after translation service enhancements or source content improvements.

### Acceptance Criteria
- [ ] Endpoint is implemented at `/src/app/api/translations/retranslate/route.ts`
- [ ] Endpoint accepts POST requests with request body containing entity identifiers
- [ ] Request body accepts array of entity objects specifying entity type and entity ID for each item
- [ ] Request body accepts boolean parameter controlling manual edit handling policy
- [ ] When skip manual edits is true, endpoint only queues jobs for automated or missing translations
- [ ] When skip manual edits is false, endpoint queues jobs for all languages including manually edited ones
- [ ] Endpoint validates authenticated user owns all specified entities before processing
- [ ] Endpoint rejects requests containing entities the user does not own with authorization error
- [ ] Endpoint queues translation jobs for each entity-language combination based on manual edit policy
- [ ] Response includes integer count of successfully queued translation jobs
- [ ] Response includes integer count of entity-language combinations skipped due to manual edit protection
- [ ] Response format includes both jobCount and skippedCount fields
- [ ] Endpoint handles requests for non-existent entities gracefully without queuing jobs
- [ ] Endpoint handles malformed entity identifiers with validation error response
- [ ] Endpoint handles empty entity arrays with validation error indicating at least one entity required
- [ ] Endpoint supports bulk operations processing multiple entities in a single request
- [ ] Endpoint performance remains acceptable when processing large entity batches
- [ ] Response format is consistent with other API endpoints in the system
- [ ] Endpoint enforces proper request authentication and session validation

---

## REQ-339: Add Source Version Tracking Columns via Migration

**Date**: 2026-01-19 02:38
**Type**: ENHANCEMENT
**Size**: S

### Summary
Translation tables should include source version timestamp columns to track when the original content was last modified, enabling automatic detection of stale translations.

### Current Behavior
Translation tables do not capture when the source content they reference was last updated. When property owners modify descriptions, amenity details, FAQ answers, or other translatable content, the system cannot determine which existing translations have become outdated and require re-translation. Without version tracking, translations may remain active even though they no longer accurately reflect the current source content.

### Expected Behavior
A database migration adds source_version_at timestamp columns to all translation tables including property translations, listing translations, FAQ translations, amenity translations, and system tag translations. The column stores the timestamp of when the source content was last modified, allowing the system to compare source modification times against translation creation times to identify stale translations. Indexes are created on relevant columns to support efficient queries filtering by translation status and ordering by source version timestamp, enabling fast identification of translations requiring updates. The migration executes successfully through database management tooling without errors.

### User Impact
Property owners who update their content expect translated versions to stay synchronized with those changes. Without automated detection of outdated translations, international guests may see obsolete information that contradicts current source content, creating confusion and reducing booking confidence.

### Business Value
Enables automated identification of stale translations that require re-translation after source content updates, ensuring international guests always receive current and accurate information. Reduces manual effort required to track which translations need updating after content changes, improving translation maintenance efficiency.

### Acceptance Criteria
- [ ] Migration adds source_version_at column to property_translations table
- [ ] Migration adds source_version_at column to listing_translations table
- [ ] Migration adds source_version_at column to faq_translations table
- [ ] Migration adds source_version_at column to amenity_translations table
- [ ] Migration adds source_version_at column to system_tag_translations table
- [ ] Column type is timestamp with time zone for accurate temporal tracking
- [ ] Indexes are created to support efficient filtering by translation status
- [ ] Indexes are created to support efficient ordering by source_version_at timestamp
- [ ] Migration executes successfully without errors or conflicts
- [ ] Database schema reflects new columns after migration completes
- [ ] Existing translation records handle null values gracefully for the new column

---

## REQ-340: Update TypeScript Database Types for Owner Management Translation Features

**Date**: 2026-01-19 02:43
**Type**: ENHANCEMENT
**Size**: S

### Summary
TypeScript type definitions should reflect all translation infrastructure columns and newly added fields to ensure type safety when building owner management translation features.

### Current Behavior
The database type definitions include translation tables and some language preference fields from earlier localization epics. However, as new columns are added through migrations for owner management features, such as source version tracking timestamps, reviewer identification fields, and manual edit flags, the TypeScript definitions may not reflect these changes immediately. Developers building translation preview panels, status widgets, and editor components lack complete type information for newly added database fields.

### Expected Behavior
Type definitions in the database types file comprehensively cover all translation-related tables and columns needed for owner management features. All translation tables include type definitions for source version tracking columns recently added via migration. Translation tables include type definitions for reviewer identification columns that track which user performed manual edits. Translation status fields are properly typed to support filtering and querying. Job queue tables include complete type information for status tracking, locking mechanisms, and error handling fields. Developers receive accurate autocomplete suggestions and compile-time validation when accessing any translation-related database field in owner management components.

### User Impact
Property owners benefit indirectly through more reliable translation management features built with accurate type safety. Developers building owner-facing interfaces need complete type information to avoid runtime errors from incorrect field references or type mismatches. Missing or incorrect type definitions cause confusion during development and may result in bugs that affect owner experience.

### Business Value
Reduces development time and prevents bugs by ensuring TypeScript compiler can validate all database field access at compile time rather than discovering errors at runtime. Improves code maintainability by providing self-documenting type contracts that clarify which fields exist and their expected data types. Accelerates feature development by enabling accurate IDE autocomplete for all translation-related database operations.

### Acceptance Criteria
- [ ] Type definitions include all translation table structures
- [ ] Type definitions include source_version_at columns for all translation tables
- [ ] Type definitions include reviewed_by columns for tracking manual edits
- [ ] Type definitions include translation_status fields with appropriate type constraints
- [ ] Type definitions include all translation job queue columns including locking fields
- [ ] Type definitions include preferred_language columns for users and accounts
- [ ] Type definitions include source_language columns for content entities
- [ ] TypeScript compiler validates code using updated types without errors
- [ ] Autocomplete suggestions appear correctly when accessing translation fields in development
- [ ] All Row, Insert, and Update type variants are properly defined for affected tables
- [ ] Relationships are correctly typed for foreign key references in translation tables

---

## REQ-341: Create TranslationManagement Component Type Definitions File

**Date**: 2026-01-19 13:42
**Type**: NEW FEATURE
**Size**: S

### Summary
The TranslationManagement component system should have a centralized type definitions file that exports all TypeScript interfaces and types used across translation management UI components.

### Current Behavior
No shared type definitions file exists for the TranslationManagement component system. Developers building translation management UI components lack a single source of truth for type contracts covering translation records, status values, filter parameters, and component props. Without centralized types, developers may duplicate type definitions across multiple components or use inconsistent data structures, leading to type mismatches and integration issues.

### Current Behavior
No type definitions file exists for the TranslationManagement component system. Each component that needs translation-related types must define its own interfaces or import from scattered locations, leading to duplication and inconsistency.

### Expected Behavior
A type definitions file at the TranslationManagement component directory exports all shared TypeScript interfaces and types needed across the translation management UI. The file defines interfaces for translation record data including entity identifiers, language codes, translation content, status values, and metadata timestamps. Translation status is represented through enumerated types or string literal unions covering values like pending, completed, failed, and manually edited. Filter and sort parameter interfaces define the shape of query criteria including entity type filters, language filters, status filters, and sort direction options. Component prop interfaces define the expected props for reusable widgets like status indicators, preview panels, and editor dialogs. Callback function types define signatures for operations like triggering re-translation, saving edits, or handling status changes. All exported types include JSDoc comments explaining their purpose, expected usage, and any constraints or validation requirements.

### User Impact
Property owners benefit from more reliable translation management interfaces built with consistent, type-safe data structures. Developers building translation components have clear type contracts that prevent prop mismatches, reduce integration bugs, and improve development speed through autocomplete and compile-time validation.

### Business Value
Establishes a strong type foundation for the translation management UI system, improving code quality and reducing bugs from type inconsistencies. Accelerates development by providing reusable type definitions that eliminate duplication and provide clear contracts for component integration. Improves long-term maintainability by centralizing type definitions in a single authoritative location.

### Acceptance Criteria
- [ ] Types file is created at `/src/components/TranslationManagement/TranslationManagement.types.ts`
- [ ] File exports interface for translation record data structures including entity ID, entity type, language code, content, status, and timestamps
- [ ] File exports enum or string literal union type for translation status values covering pending, completed, failed, and manually edited states
- [ ] File exports interface for filter parameters including entity type filter, language filter, and status filter
- [ ] File exports interface for sort parameters including sort field and sort direction
- [ ] File exports prop type interfaces for translation status indicator components
- [ ] File exports prop type interfaces for translation preview panel components
- [ ] File exports prop type interfaces for translation editor components
- [ ] File exports callback function type signatures for re-translation operations
- [ ] File exports callback function type signatures for save operations
- [ ] File exports callback function type signatures for status change handlers
- [ ] All exported types include JSDoc comments describing their purpose and usage
- [ ] TypeScript compiler validates the types file without errors or warnings
- [ ] Types can be successfully imported and used in at least one component file
- [ ] Types align with database type definitions for translation tables where applicable
- [ ] File follows project TypeScript conventions and naming patterns

---


---

## REQ-342: Create TranslationPreviewPanel Component for Content Translation Review

**Date**: 2026-01-19 14:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners should be able to view and review all translations for a piece of content in a slide-in panel that displays source content alongside translation status for all supported languages with available actions.

### Current Behavior
No translation preview panel component exists to display translation status and content for owner-managed entities. When property owners edit their listings, properties, FAQs, or amenities, they have no visual interface to see which languages have translations, review translation status, or take actions like re-translating or manually editing translations. Without this panel, owners cannot easily assess translation coverage, identify failed or outdated translations, or initiate translation operations directly from the editing interface.

### Expected Behavior
A reusable TranslationPreviewPanel component slides in from the right side of the screen with a width of 400 pixels when triggered. The panel displays the source content at the top, showing the original text that will be translated into other languages for context. Below the source content, the panel lists all six supported languages (English, Spanish, French, German, Italian, Dutch) with visual status indicators showing translation state for each language. Each language row displays the language name, a status indicator showing whether the translation is pending, completed, failed, or manually edited, and a preview of the translated content if available. Action buttons appear for each language allowing owners to edit the translation manually, trigger re-translation to generate a fresh version, or retry a failed translation job. The panel includes a close button allowing owners to dismiss it and return to their primary editing workflow. The panel adapts to different entity types, displaying appropriate field-specific translations for property names, listing descriptions, FAQ content, or amenity names based on the context from which it was opened.

### User Impact
Property owners gain visibility into translation status for all their content directly within the editing interface, eliminating the need to navigate away to check translation coverage. Owners can quickly identify which languages lack translations or have failed translations requiring attention. Owners can take immediate action to improve translation quality through re-translation or manual editing without context switching. International marketing becomes more manageable as owners can ensure all content is properly translated before publishing or updating listings.

### Business Value
Empowers property owners to maintain high-quality multilingual content by providing transparent translation status and convenient action controls in a familiar editing context. Reduces support burden by making translation management self-service rather than requiring administrator intervention. Increases the likelihood that owners will maintain complete and accurate translations across all languages, improving the experience for international guests and potentially increasing bookings from non-English markets.

### Acceptance Criteria
- [ ] Component file is created at `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- [ ] Panel slides in from the right side of the screen with smooth animation
- [ ] Panel width is fixed at 400 pixels for consistent layout
- [ ] Panel displays source content at the top with clear labeling indicating it is the original version
- [ ] Panel lists all six supported languages below the source content
- [ ] Each language row displays the language name in a user-friendly format
- [ ] Each language row displays a visual status indicator showing translation state
- [ ] Status indicators clearly differentiate between pending, completed, failed, and manually edited states
- [ ] Each language row shows a preview of translated content when translation is available
- [ ] Edit button appears for each language allowing owners to manually modify translations
- [ ] Re-translate button appears for each language to trigger fresh translation generation
- [ ] Retry button appears for failed translations to reprocess the translation job
- [ ] Close button allows owners to dismiss the panel and return to editing
- [ ] Panel handles different entity types appropriately based on context
- [ ] Component uses types from the TranslationManagement.types.ts file
- [ ] Component follows project styling conventions and accessibility guidelines
- [ ] Panel is responsive and maintains usability on different screen sizes
- [ ] Loading states display appropriately while fetching translation data
- [ ] Error states display appropriately if translation data cannot be loaded


---

## REQ-343: Create TranslationProgressBar Component for Visual Translation Status

**Date**: 2026-01-19 15:30
**Type**: NEW FEATURE
**Size**: S

### Summary
Users should see a visual progress indicator showing the completion status of translations across all supported languages with real-time updates during active translation processing.

### Current Behavior
No visual progress bar component exists to display translation completion status. When property owners or administrators view content with multiple language translations, they cannot quickly assess overall translation coverage at a glance. Without a progress indicator, users must manually count which languages have completed translations versus which are pending or failed, making it difficult to understand translation readiness at a glance. During active translation processing, users have no visual feedback indicating that translation work is in progress or how many translations have completed versus remaining.

### Expected Behavior
A TranslationProgressBar component displays a horizontal progress bar with fill color indicating the percentage of completed translations. Above or beside the progress bar, a text label shows the completion count in the format "3/5 translations complete" or similar, clearly indicating how many languages have successful translations versus the total number of supported languages. When translations are actively processing, the progress bar displays a subtle animation such as a moving gradient or pulsing effect to indicate work in progress and provide visual feedback that the system is actively translating content. The progress bar uses distinct visual states for different scenarios: a green or blue fill for successful translations, a warning color if some translations have failed but others succeeded, and a muted or gray state if no translations exist yet. The component accepts the total count of supported languages and the count of completed translations as props, calculating the percentage automatically and rendering the appropriate visual representation. The component is reusable across different contexts including the translation preview panel, item grids, and translation management pages.

### User Impact
Property owners can instantly assess translation coverage for their content without counting individual language rows or reading detailed status indicators. Visual progress feedback during translation processing reassures users that their translation requests are being processed and provides a sense of completion progress. Quick visual scanning of progress bars across multiple content items helps owners prioritize which content needs translation attention first.

### Business Value
Improves user experience by replacing cognitive overhead of counting translations with instant visual comprehension through progress bars. Reduces perceived wait time during translation processing by providing animated visual feedback indicating active work. Encourages owners to complete translations across all languages by making incomplete coverage visually prominent through partial progress bars.

### Acceptance Criteria
- [ ] Component file is created at `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`
- [ ] Component accepts props for completed translation count and total translation count
- [ ] Component renders a horizontal progress bar with fill indicating completion percentage
- [ ] Component displays text label showing completion count in format "X/Y translations complete"
- [ ] Progress bar fill color indicates successful translation state using appropriate theme colors
- [ ] Component displays animation during active translation processing such as moving gradient or pulse effect
- [ ] Animation prop allows parent components to trigger or disable animation based on processing state
- [ ] Component handles edge cases gracefully such as zero translations or all translations complete
- [ ] Progress bar width is configurable through props or adapts to container width
- [ ] Component uses semantic HTML and ARIA attributes for accessibility
- [ ] Component follows project styling conventions and integrates with design system
- [ ] Component is fully typed using TypeScript interfaces for all props
- [ ] Component can be successfully imported and rendered in at least one parent component
- [ ] Visual appearance matches design expectations for progress indicators used elsewhere in the application
- [ ] Animation performance is smooth without causing layout shifts or reflows


---

## REQ-344: Create useTranslationRealtime Hook for Live Translation Updates

**Date**: 2026-01-19 00:00
**Type**: NEW FEATURE
**Size**: M

### Summary
Implement a React hook that subscribes to real-time database changes for translation status updates, enabling the UI to automatically refresh when translation jobs complete.

### Current Behavior
When translations are processing in the background, users must manually refresh the page or wait for polling intervals to see updated translation status. There is no immediate feedback when a translation job completes successfully or fails.

### Expected Behavior
When a user is viewing content that has pending translations, the UI automatically updates in real-time as translation jobs complete. Status indicators, preview panels, and language availability change instantly without requiring page refreshes or manual polling.

### User Impact
Content managers and property owners working with multilingual content will see immediate feedback when their translation jobs complete. This creates a more responsive and modern experience, reducing uncertainty about whether translations are ready and eliminating the need to constantly refresh pages to check status.

### Business Value
Real-time updates improve user confidence in the translation system and reduce support inquiries about translation timing. The immediate feedback loop encourages users to create more multilingual content by making the process feel faster and more reliable.

### Acceptance Criteria
- [ ] Hook subscribes to Supabase realtime channel for translation table updates
- [ ] UI components automatically re-render when subscribed translation records change
- [ ] Hook accepts entity type and entity ID parameters to filter relevant updates
- [ ] Subscription is properly cleaned up when component unmounts to prevent memory leaks
- [ ] Hook returns current translation status and a loading state
- [ ] Multiple components can subscribe to the same translation updates without conflicts
- [ ] Connection errors are handled gracefully with automatic reconnection attempts
- [ ] Hook works correctly for items, articles, links, and tags translation updates



---

## REQ-350: Create TranslationStatusWidget Component for Dashboard Summary

**Date**: 2026-01-19 22:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners should see a summary card on their dashboard that displays overall translation status across all their content with quick access to detailed translation management.

### Current Behavior
No dashboard widget exists to provide property owners with an at-a-glance view of their translation coverage. Owners must navigate to individual items, articles, or links to check translation status for each piece of content separately. There is no centralized summary showing how many of their content pieces are fully translated, partially translated, or have pending or failed translations across all supported languages. Without this overview, owners cannot easily prioritize translation work or understand the overall multilingual readiness of their property information.

### Expected Behavior
A TranslationStatusWidget component appears on the property owner dashboard as a summary card displaying aggregated translation statistics across all content owned by that property owner. The widget shows a progress bar indicating the overall percentage of completed translations across all content types and languages. Below the progress bar, the widget displays counts broken down by status: the number of items with complete translations in all languages, the number with partial translations in some languages, the number with pending translations currently processing, and the number with failed translations requiring attention. Each status count uses distinct visual styling and icons to quickly communicate the meaning at a glance. A "View Details" link at the bottom of the widget navigates the owner to a dedicated translation management page where they can see detailed status for each piece of content and take corrective actions. The widget automatically updates when translation jobs complete without requiring page refresh.

### User Impact
Property owners can instantly understand the multilingual readiness of their entire property portfolio from the dashboard without navigating through individual content items. Visual breakdown by status helps owners prioritize which translation issues need immediate attention versus what is already complete or in progress. Quick access to detailed management through the "View Details" link reduces navigation friction when owners want to take action on translation tasks.

### Business Value
Increases owner engagement with translation features by surfacing translation status prominently on the dashboard rather than hiding it in individual content editors. Encourages owners to maintain complete translations by making incomplete coverage visible during routine dashboard visits. Reduces support burden by providing self-service visibility into translation progress and issues, preventing owners from contacting support to ask about translation status.

### Acceptance Criteria
- [ ] Component file is created at `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
- [ ] Widget renders as a dashboard card with consistent styling matching other dashboard widgets
- [ ] Widget displays a progress bar showing overall translation completion percentage across all owner content
- [ ] Progress bar calculation includes all content types: items, articles, links, and tags
- [ ] Widget displays count of content pieces with complete translations in all supported languages
- [ ] Widget displays count of content pieces with partial translations in some but not all languages
- [ ] Widget displays count of content pieces with pending translations currently processing
- [ ] Widget displays count of content pieces with failed translations requiring owner attention
- [ ] Each status count uses distinct visual styling with appropriate colors and icons
- [ ] Failed translation count uses warning or error color to draw attention to issues
- [ ] "View Details" link appears at the bottom of the widget with clear affordance
- [ ] Clicking "View Details" navigates to the translation management page with appropriate filters or context
- [ ] Widget handles loading state appropriately while fetching translation statistics
- [ ] Widget handles error state appropriately if translation statistics cannot be loaded
- [ ] Widget handles empty state appropriately for owners with no content yet
- [ ] Widget automatically updates when translation status changes through real-time subscriptions or periodic refresh
- [ ] Component is fully typed using TypeScript interfaces for all props and data structures
- [ ] Component follows project styling conventions and accessibility guidelines
- [ ] Widget is responsive and maintains usability on different screen sizes
- [ ] Widget integrates successfully into the existing dashboard layout without breaking other widgets


---

## REQ-351: Create TranslationStatusColumn Component for Table Integration

**Date**: 2026-01-19 (Current system date)
**Type**: NEW FEATURE
**Size**: M

### Summary
Content owners need a compact, at-a-glance view of translation status for each content item directly within table listings, with the ability to quickly access detailed translation information.

### Current Behavior
Content listings (articles, items, links) display only the original content without any indication of translation availability or status across supported languages.

### Expected Behavior
Each content item row displays a compact status indicator column showing the translation state for all six supported languages using visual markers (dots or icons). Each language indicator clearly shows whether a translation is complete, pending, missing, or has failed. Clicking the status column opens a detailed translation preview panel for that specific content item.

### User Impact
Content owners managing multilingual properties can immediately identify which content items have complete translations, which need attention, and which languages are missing. This eliminates the need to open individual items to check translation status and enables quick identification of incomplete localization coverage.

### Business Value
Improves translation workflow efficiency by providing immediate visibility into localization completeness across the content inventory. Reduces time spent identifying translation gaps and enables proactive management of multilingual content quality.

### Acceptance Criteria
- [ ] Component displays exactly six language status indicators in a compact, horizontally-aligned layout suitable for table columns
- [ ] Each language indicator uses clear visual differentiation for states: complete, pending, missing, and failed
- [ ] Clicking anywhere on the status column opens the translation preview panel for that content item
- [ ] Component accepts content item data (ID, type, current translations) as props
- [ ] Visual indicators update in real-time when translation status changes
- [ ] Component maintains consistent sizing and alignment within table layouts across different screen sizes
- [ ] Hover states provide language identification (e.g., tooltip showing "German: Complete")
- [ ] Loading states are handled gracefully when translation data is being fetched



---

## REQ-352: Integrate Translation Status Widget into Dashboard Layout

**Date**: 2026-01-19 23:15
**Type**: ENHANCEMENT
**Size**: S

### Summary
Property owners should see their translation status summary automatically when viewing their main dashboard without requiring additional navigation or configuration.

### Current Behavior
The dashboard displays property management information but does not include translation status visibility. Property owners have no awareness of their translation coverage or pending translation jobs unless they specifically navigate to content editing interfaces or translation management pages. The TranslationStatusWidget component exists but is not integrated into the main dashboard layout where owners regularly check their property status.

### Expected Behavior
When a property owner views their main dashboard, the TranslationStatusWidget appears as a prominent card within the dashboard layout alongside other key property metrics and status information. The widget loads translation status data automatically when the dashboard page renders, displaying real-time statistics about translation completion across all the owner's content. The widget fits naturally within the existing dashboard grid or layout structure without disrupting other dashboard components. Loading states appear appropriately while translation statistics are being fetched, and error states are handled gracefully if data cannot be retrieved.

### User Impact
Property owners gain immediate visibility into their multilingual content coverage during routine dashboard visits without requiring additional clicks or navigation. This passive awareness increases engagement with translation features and helps owners maintain complete translation coverage by surfacing translation status where they naturally look for property management information.

### Business Value
Increases translation feature adoption by integrating translation visibility into the primary owner workflow rather than treating it as a separate or optional feature. Proactive display of translation status encourages owners to maintain complete multilingual content, directly supporting the platform's international expansion goals.

### Acceptance Criteria
- [ ] TranslationStatusWidget component is imported and rendered within the dashboard page layout
- [ ] Widget appears in a visually prominent location within the dashboard that does not obscure other critical dashboard information
- [ ] Dashboard fetches translation status summary data on page load using the appropriate API endpoint or database query
- [ ] Fetched data is passed to the TranslationStatusWidget component through props
- [ ] Loading state displays appropriately while translation statistics are being fetched on initial dashboard load
- [ ] Error state displays appropriately if translation statistics cannot be loaded, without breaking the entire dashboard
- [ ] Widget integrates seamlessly with the existing dashboard layout responsive grid or flex structure
- [ ] Dashboard page maintains acceptable performance with the added translation status query
- [ ] Translation statistics refresh appropriately when the owner performs actions that affect translation status
- [ ] Widget positioning and styling match the visual design of other dashboard summary cards



---

## REQ-353: Add Translation Status Column to Items List

**Date**: 2026-01-19 23:18
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners viewing their items list should see translation status for each item directly within the grid, enabling quick assessment of which items have complete translations without opening individual items.

### Current Behavior
The items grid displays item cards with thumbnail, title, description, and action buttons. Translation status is not visible in the list view. Property owners must open each item individually or navigate to separate translation management interfaces to determine which items have been translated to which languages. This requires extensive navigation and multiple page loads to assess translation coverage across their content inventory.

### Expected Behavior
Each item card in the grid displays a compact translation status indicator showing the completion state for all supported languages. The status indicator uses visual cues (icons, colors, or badges) to communicate translation completeness at a glance. Clicking the translation status indicator opens the translation preview panel for that specific item, allowing owners to review or edit translations directly from the list view. The status indicator updates in real-time when translations are completed or modified. The visual indicator is appropriately sized to fit within the existing card layout without overwhelming other item information.

### User Impact
Property owners can immediately identify gaps in their multilingual content coverage while browsing their items list. This reduces the effort required to maintain translation completeness and enables owners to prioritize translation work based on visible status indicators. Owners with large item inventories benefit from being able to scan translation status across dozens or hundreds of items simultaneously.

### Business Value
Improves translation workflow efficiency by surfacing translation status where owners already spend time managing content. Reduces friction in maintaining complete translations by eliminating the need to check each item individually, supporting the platform's goal of comprehensive multilingual content availability.

### Acceptance Criteria
- [ ] ItemGrid component accepts an optional prop to enable translation status display
- [ ] When enabled, each ItemCard displays a translation status indicator showing completion for all supported languages
- [ ] Translation status indicator is visually compact and does not disrupt the existing card layout or spacing
- [ ] Clicking the translation status indicator triggers the translation preview panel for that item
- [ ] Status indicator uses clear visual differentiation for translation states: complete, pending, missing, and failed
- [ ] Status indicator updates dynamically when translation data changes without requiring page refresh
- [ ] Component gracefully handles items with no translation data (shows appropriate default state)
- [ ] Translation status fetch does not significantly degrade grid rendering performance for lists with many items
- [ ] Status indicator is accessible with appropriate ARIA labels describing translation completion state
- [ ] Mobile layouts display the status indicator appropriately within reduced card dimensions




---

## REQ-354: Create Translation Management Page

**Date**: 2026-01-19 23:25
**Type**: NEW FEATURE
**Size**: L

### Summary
Property owners need a centralized dashboard page where they can view, filter, and manage translations for all their content items and articles across all supported languages in a single interface.

### Current Behavior
Translation management is scattered across individual item and article editing interfaces. Property owners must navigate to each piece of content separately to check or manage its translations. There is no unified view showing translation status across the entire content inventory. Owners cannot filter content by translation status, language availability, or content type. Bulk operations on translations are not possible. Assessing overall translation coverage requires manually checking each item and article individually.

### Expected Behavior
A dedicated Translation Management page displays a full-width table listing all content (items, articles, and links) owned by the current user. Each row shows the content name, content type, and separate status columns for each of the six supported languages. The table includes a filter bar allowing owners to narrow results by content type, specific language, and translation status. Row selection enables bulk actions such as initiating translations for multiple pieces of content simultaneously or deleting translations. Each row provides action buttons or menu options for individual translation operations. The table supports sorting by content name, type, or translation completion. Pagination handles large content inventories efficiently. The page provides clear visual indicators for translation states and handles loading states gracefully during data fetches.

### User Impact
Property owners managing multilingual content gain a comprehensive overview of their translation coverage without repetitive navigation through individual content pages. Filtering capabilities allow owners to quickly identify content missing translations for specific languages or content types requiring attention. Bulk selection dramatically reduces the time required to initiate or manage translations across multiple content items. Owners with large inventories benefit from centralized visibility and batch operations that were previously impossible or extremely time-consuming.

### Business Value
Significantly improves translation workflow efficiency by consolidating management into a purpose-built interface. Reduces friction in maintaining complete multilingual content coverage across properties. Enables proactive translation management at scale, supporting the platform's international growth strategy by making it easier for owners to maintain high-quality multilingual content availability.

### Acceptance Criteria
- [ ] Page accessible at /dashboard2/translations route requiring authenticated owner access
- [ ] Table displays all content items, articles, and links owned by the current authenticated user
- [ ] Each table row shows content name, content type, and individual status indicators for all six supported languages
- [ ] Filter bar includes dropdowns or multi-select controls for Type, Language, and Status filtering
- [ ] Applied filters update the table content dynamically without full page reload
- [ ] Table rows support individual selection via checkbox with visual indication of selected state
- [ ] Bulk selection control in table header selects or deselects all visible rows
- [ ] Bulk action bar appears when one or more rows are selected, offering relevant translation operations
- [ ] Each row includes an actions menu or buttons providing access to translation preview, editing, or retranslation
- [ ] Table supports sorting by content name, content type, and overall translation completion
- [ ] Pagination controls appear when content count exceeds page size limit
- [ ] Loading states display appropriately during initial data fetch and filter application
- [ ] Empty states communicate clearly when no content exists or no content matches applied filters
- [ ] Page layout is responsive and maintains usability on tablet-sized screens
- [ ] Translation status updates reflect in the table when translations are completed or modified without requiring manual refresh

---

## REQ-355: Add Translations Navigation Link to Dashboard

**Date**: 2026-01-19 23:28
**Type**: ENHANCEMENT
**Size**: XS

### Summary
Property owners need a visible, easily accessible navigation link to reach the Translation Management page from anywhere within the dashboard interface.

### Current Behavior
The Translation Management page exists but has no dedicated navigation entry. Property owners must manually type the route URL or use browser bookmarks to access the translations dashboard. The navigation sidebar does not include any reference to translation management functionality. There is no visual indication that translation management capabilities exist within the application.

### Expected Behavior
The dashboard navigation sidebar displays a "Translations" menu item with an appropriate icon such as Languages or Globe. Clicking this navigation link routes the user to the Translation Management page. The navigation item highlights or changes appearance when the user is viewing the translations section, providing clear visual feedback about the current location within the dashboard. The link appears consistently across all dashboard pages that use the shared layout component.

### User Impact
Property owners discover and access translation management features through standard navigation patterns instead of memorizing URLs or relying on external documentation. The visible navigation entry signals the availability of translation management capabilities, encouraging adoption and regular use of multilingual content features.

### Business Value
Increases discoverability and utilization of translation features by making them visible in the primary navigation structure. Improves user experience through standard navigation patterns that match user expectations for application structure.

### Acceptance Criteria
- [ ] Navigation link labeled "Translations" appears in the dashboard sidebar navigation
- [ ] Link displays an icon representing language or translation functionality
- [ ] Clicking the link navigates to the Translation Management page without page reload
- [ ] Active state styling applies when viewing the translations section
- [ ] Navigation link appears for all authenticated property owners with content access
- [ ] Link position in navigation follows logical information architecture principles
- [ ] Navigation remains accessible and visible across all viewport sizes supported by the dashboard


---

## REQ-356: Implement Stale Translation Indicator

**Date**: 2026-01-19 23:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners need visual indicators showing when manually edited translations have become stale because the source content has been updated since the translation was last edited.

### Current Behavior
The TranslationStatusItem component displays translation status with indicators for completion states like complete, pending, missing, and failed. When a property owner manually edits a translation and later updates the source content, there is no visual indication that the manual translation may now be outdated or inconsistent with the current source material. Owners have no way to identify which of their manual translations require review or updating based on source content changes. The version tracking exists in the database but is not surfaced in the user interface.

### Expected Behavior
The TranslationStatusItem component displays a stale translation warning when source content has been modified after a manual edit was made. A yellow warning icon or badge appears alongside the translation status indicator, clearly distinguishing stale translations from current ones. The entire status item displays a yellow border or background tint to increase visibility of the stale state. An "Update Translation" action button appears within the stale translation item, allowing the owner to trigger re-translation from the updated source content. Hovering over or focusing on the stale indicator reveals a tooltip explaining that the source content has changed since the manual edit. The stale indicator only appears for translations marked as manually edited, not for translations that are automatically managed.

### User Impact
Property owners maintaining manually edited translations can immediately identify which translations need attention after updating source content. This prevents the common scenario where source content evolves but manually edited translations become progressively more outdated and inconsistent. Owners no longer need to manually track which translations require updates after content changes, reducing the cognitive load of managing multilingual content across multiple properties.

### Business Value
Improves translation quality by surfacing maintenance requirements proactively rather than relying on owners to notice discrepancies. Reduces the risk of guests viewing outdated or inaccurate translated content that no longer reflects current source information. Supports the platform's commitment to high-quality multilingual content by providing tools that make it easier to maintain translation accuracy over time.

### Acceptance Criteria
- [ ] TranslationStatusItem component detects stale status based on source_version_at timestamp being later than the manual edit timestamp
- [ ] Stale translations display a yellow warning icon or badge adjacent to the translation status indicator
- [ ] Stale translation items show a yellow border or subtle yellow background tint distinct from other status states
- [ ] "Update Translation" action button appears within stale translation items
- [ ] Clicking "Update Translation" triggers the re-translation API endpoint for that specific content and language
- [ ] Tooltip or hover state on the stale indicator explains why the translation is marked as stale
- [ ] Stale indicator only appears when is_manually_edited flag is true and source content has been updated
- [ ] Automatically translated content (not manually edited) does not show stale warnings even when source content changes
- [ ] Stale indicator styling is visually distinct from error, pending, and missing states
- [ ] After re-translation completes, the stale indicator disappears and status returns to complete
- [ ] Component handles loading state appropriately while re-translation is processing
- [ ] Stale state is accessible with appropriate ARIA attributes describing the warning condition

---

## REQ-357: Integrate Manual Translation Warning into Content Save Flow

**Date**: 2026-01-19 00:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
Content editors should be warned before saving changes to articles or items that have manually edited translations, preventing accidental loss of manual translation work.

### Current Behavior
When a content editor saves changes to an article or item, the system automatically triggers re-translation of all language versions, including those that were manually edited or corrected. There is no indication that manual translation work will be overwritten, leading to unintentional loss of carefully crafted translations.

### Expected Behavior
Before saving content changes that would trigger re-translation, the system detects if any language versions have manual translation overrides and displays a warning dialog. The editor can review which languages have manual edits, decide whether to proceed with the save (which will mark those translations for re-translation), or cancel and preserve the manual work.

### User Impact
Content editors and translation managers who manually refine translations will be protected from accidentally overwriting their work. This reduces frustration, prevents rework, and maintains translation quality by preserving intentional manual edits.

### Business Value
Protects investment in manual translation refinement and improves editor confidence when managing multilingual content.

### Acceptance Criteria
- [ ] Article save handlers check for manual translation overrides before processing the save
- [ ] Item save handlers check for manual translation overrides before processing the save
- [ ] Warning dialog appears when manual translations are detected, showing affected languages
- [ ] Editor can proceed with save (triggering re-translation) or cancel to preserve manual edits
- [ ] No warning appears when no manual translations exist for the content being saved
- [ ] Warning state does not block urgent content updates when editor chooses to proceed


---

## REQ-358: Create LanguagePreferenceSection Component

**Date**: 2026-01-19 14:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a dedicated interface component that allows them to select and save their preferred language for the application interface through a dropdown selector with clear visual feedback and help text.

### Current Behavior
Property owners access the application interface in a single default language with no ability to customize their language preference. The system lacks a user interface component for selecting and persisting language preferences. While language detection and switching infrastructure exists, there is no settings interface where property owners can explicitly choose and save their preferred language for future sessions. Property owners who prefer languages other than the default have no method to customize their interface experience.

### Expected Behavior
Property owners access a LanguagePreferenceSection component within their account settings or profile area. The component displays a language dropdown selector showing all supported languages with their native names and flag icons. The currently saved preference is pre-selected when the component loads. After selecting a new language from the dropdown, a save button becomes active, allowing the property owner to persist their choice. During the save operation, the button displays a loading state with appropriate visual feedback. Help text near the dropdown explains that this setting controls the language used throughout the application interface, not the language of guest-facing content. The saved preference applies immediately and persists across browser sessions.

### User Impact
Property owners working in their preferred language experience reduced cognitive load and faster task completion. Non-English-speaking property owners gain equal access to all platform features without language barriers. Property owners managing properties in multiple countries can use the interface in their native language while creating content in various target languages. The explicit preference setting provides a sense of control and customization that improves overall satisfaction with the platform.

### Business Value
Expands addressable market by removing language barriers for international property owners. Increases user satisfaction and retention by providing interface localization that respects user preferences. Reduces support inquiries related to interface comprehension and navigation in non-preferred languages. Demonstrates commitment to serving a global user base and positions the platform as accessible to international property managers.

### Acceptance Criteria
- [ ] Component file exists at /src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx
- [ ] Component renders a language dropdown selector displaying all supported languages
- [ ] Each language option shows a flag icon and native language name
- [ ] Dropdown pre-selects the currently saved language preference when component mounts
- [ ] Save button appears below or adjacent to the dropdown selector
- [ ] Save button is disabled until user selects a different language from current preference
- [ ] Save button displays loading state (spinner or loading text) during save operation
- [ ] Help text appears near the dropdown explaining the setting's purpose and scope
- [ ] Help text clarifies that this setting affects the application interface, not guest-facing content
- [ ] Component handles successful save by displaying confirmation feedback
- [ ] Component handles failed save by displaying error message without losing user's selection
- [ ] Component is keyboard accessible with proper focus management
- [ ] Component provides appropriate ARIA labels for screen readers
- [ ] Component styling is consistent with the application's design system
- [ ] Component is responsive and usable on both tablet and desktop viewports



---

## REQ-359: Create Account Language Preference API Endpoint

**Date**: 2026-01-19 14:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a server endpoint that securely validates account access and persists their preferred language selection to the database, enabling language preferences to be saved and retrieved across sessions.

### Current Behavior
The application lacks a server-side API endpoint for managing account-level language preferences. When property owners attempt to save their language selection through the LanguagePreferenceSection component, there is no backend endpoint to receive and persist this data. The database may have a preferred_language column in the accounts table, but no API route exists to update it. Property owners cannot save language preferences because the client-side component has no endpoint to communicate with. Language selections made in the interface are lost when the browser session ends or the page refreshes.

### Expected Behavior
A PUT endpoint exists at /api/accounts/[accountId]/preferences/route.ts that accepts language preference updates and validates account access before persisting changes. When a property owner saves their language preference through the LanguagePreferenceSection component, the component sends a PUT request containing the selected language code to this endpoint. The endpoint verifies that the authenticated user has permission to modify the specified account's preferences, preventing unauthorized access to other accounts' settings. After successful validation, the endpoint updates the preferred_language column in the accounts table with the new language code. The endpoint returns a success response with the updated preference data, or an appropriate error response if validation fails or the database update encounters an issue. The endpoint handles common error scenarios including invalid language codes, missing authentication, unauthorized access attempts, and database connection failures.

### User Impact
Property owners can reliably save their language preferences with confidence that their selection will persist across sessions and devices. Property owners managing multiple accounts can set different language preferences for each account. Property owners experience immediate feedback when their preference save succeeds or fails, eliminating uncertainty about whether their selection was recorded. The secure validation ensures that property owners can only modify preferences for accounts they have permission to access, protecting account security.

### Business Value
Provides the critical backend infrastructure required for the language preference feature to function, completing the user preference management capability. Ensures secure handling of user preferences by validating account access before persisting changes. Establishes a pattern for additional account preference endpoints that may be needed in the future. Demonstrates platform reliability by properly persisting user settings rather than losing preferences between sessions.

### Acceptance Criteria
- [ ] PUT endpoint exists at /src/app/api/accounts/[accountId]/preferences/route.ts
- [ ] Endpoint accepts JSON request body containing preferredLanguage field with language code
- [ ] Endpoint validates that the authenticated user has permission to access the specified accountId
- [ ] Endpoint returns 401 Unauthorized if user is not authenticated
- [ ] Endpoint returns 403 Forbidden if user does not have access to the specified account
- [ ] Endpoint returns 400 Bad Request if preferredLanguage is missing or invalid
- [ ] Endpoint validates that preferredLanguage is one of the supported language codes
- [ ] Endpoint updates the preferred_language column in the accounts table for the specified accountId
- [ ] Endpoint returns 200 OK with updated preference data on successful save
- [ ] Endpoint returns 500 Internal Server Error if database update fails
- [ ] Error responses include clear error messages that can be displayed to the user
- [ ] Endpoint handles database connection failures gracefully
- [ ] Endpoint logs significant errors for debugging purposes
- [ ] Endpoint follows existing API route patterns and conventions used in the codebase
- [ ] TypeScript types are properly defined for request body and response payload


---

## REQ-360: Integrate Language Preference Section into Account Settings

**Date**: 2026-01-19 15:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners need access to the language preference interface through their account settings or profile area, with the selected preference pre-populated from their existing account data.

### Current Behavior
The LanguagePreferenceSection component exists but is not rendered anywhere in the application interface. Property owners cannot access the language preference controls because there is no navigation path or page integration point for the component. The account settings or profile pages do not include a language preference section, leaving the functionality inaccessible to end users. Even though the component and API endpoint exist, property owners have no way to discover or use the language preference feature. The isolation of the component means that existing user language preferences stored in the database are never displayed or made editable through the interface.

### Expected Behavior
The LanguagePreferenceSection component is integrated into either the account settings page or user profile page, appearing as a clearly labeled section within the existing interface layout. When property owners navigate to account settings or their profile, they see a "Language Preference" or "Interface Language" section alongside other account configuration options. The component loads the property owner's current language preference from their account data and pre-populates the language dropdown with this existing selection. The placement decision between account settings and profile is based on where other account-level preferences are managed in the application's existing information architecture. The component appears in a logical position within the page flow, grouped with related settings if applicable. Property owners can discover the feature through normal navigation without requiring documentation or support assistance.

### User Impact
Property owners gain practical access to the language preference feature through an intuitive location within familiar account management flows. Property owners see their current language selection immediately when accessing the settings, providing confirmation of their existing preference. Property owners managing their account settings can configure all preferences in a single location rather than searching across multiple interface areas. The integration completes the user journey from wanting to change language preferences to successfully saving and applying those changes.

### Business Value
Transforms the language preference capability from technically implemented but inaccessible functionality into a usable feature that delivers value to property owners. Ensures development investment in the LanguagePreferenceSection component and API endpoint translates to actual user benefit and feature adoption. Follows user experience best practices by placing settings controls in discoverable, expected locations rather than hidden or obscure areas. Establishes clear patterns for integrating additional account preference features in the future.

### Acceptance Criteria
- [ ] Decision documented regarding placement in account settings versus profile page based on existing application information architecture
- [ ] LanguagePreferenceSection component is imported and rendered on the chosen page
- [ ] Component receives the current account data including existing language preference as props or via API fetch
- [ ] Language dropdown pre-populates with the property owner's current language preference from account data
- [ ] Section appears with a clear heading like "Language Preference" or "Interface Language"
- [ ] Component is positioned logically within the page layout, grouped with related settings if applicable
- [ ] Component styling is consistent with other sections on the same page
- [ ] Page layout remains responsive and properly accommodates the new section on all viewport sizes
- [ ] Property owners can navigate to the page containing the language preference section through existing navigation patterns
- [ ] Changes saved through the component are immediately reflected if the property owner revisits the settings page
- [ ] Loading state is handled appropriately while account data is being fetched
- [ ] Error state is handled appropriately if account data cannot be loaded



---

## REQ-361: Integrate Translation Preview Panel into Article Editor

**Date**: 2026-01-19 15:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
Content editors managing articles need immediate visibility into translation status and preview capabilities directly within the article editing interface, without navigating away from their current editing context.

### Current Behavior
When content editors save changes to an article through the article editor at `/src/app/dashboard2/instructions/[articleId]/edit/page.tsx`, they receive confirmation that the article was saved successfully, but no information about translation status or progress is displayed. Editors must navigate away from the article editor to a separate translation management interface to check whether translations have been triggered, monitor their progress, or preview translated content. This context switching interrupts the content editing workflow and makes it difficult for editors to verify that translations are being generated correctly. After saving article updates, editors have no way to know if translations are pending, in progress, or have completed without leaving the current page.

### Expected Behavior
The article editor page integrates a translation preview panel component that appears automatically after the editor saves article changes. The panel displays immediately when translation jobs are pending or in progress, providing real-time status updates without requiring page navigation. If translations for the article are pending when the page loads, the panel automatically opens to alert the editor to ongoing translation activity. The panel shows translation status for each configured language, indicating whether translations are complete, pending, in progress, or have failed. Editors can expand language sections within the panel to preview translated article content alongside the source content. The panel includes action buttons allowing editors to manually trigger re-translation, edit translations directly, or dismiss the panel to continue editing. The panel position within the page layout does not obstruct the main article editing form but remains easily accessible throughout the editing session.

### User Impact
Content editors maintaining multilingual articles gain immediate awareness of translation status and quality without disrupting their editing workflow. Editors can verify that article updates have triggered translations correctly and monitor progress in real-time. Editors identifying translation issues or quality concerns can take corrective action immediately rather than discovering problems only after navigating through multiple pages. The integrated workflow reduces the cognitive load of managing multilingual content by consolidating editing and translation management into a unified interface. Editors working under time pressure can efficiently manage both source content and translations in a single focused session.

### Business Value
Streamlines the content editing workflow by reducing context switching and navigation overhead, increasing editor productivity. Improves translation quality by providing immediate feedback that allows editors to catch and correct issues earlier in the content lifecycle. Reduces the risk of published articles with missing or failed translations by surfacing translation problems during the editing process. Enhances editor satisfaction by providing a cohesive, integrated experience for multilingual content management rather than fragmented, disconnected tools.

### Acceptance Criteria
- [ ] Translation preview panel component is integrated into the article editor page at /src/app/dashboard2/instructions/[articleId]/edit/page.tsx
- [ ] Panel appears automatically after the editor saves article changes successfully
- [ ] Panel auto-opens when page loads if there are pending or in-progress translations for the current article
- [ ] Panel displays translation status for each configured target language
- [ ] Panel shows real-time status updates as translations progress through pending, in-progress, and complete states
- [ ] Panel includes expandable sections for each language allowing editors to preview translated content
- [ ] Panel provides action buttons for re-triggering translation, editing translations, and dismissing the panel
- [ ] Panel positioning within the page layout does not obstruct the main article editing form
- [ ] Panel remains accessible and functional throughout the editing session without requiring page reload
- [ ] Panel handles failed translations by displaying error messages and retry options
- [ ] Panel provides appropriate loading states while fetching translation data
- [ ] Panel is responsive and usable on tablet and desktop viewports supported by the dashboard
- [ ] Panel updates automatically when translation status changes without requiring manual refresh
- [ ] Panel can be manually closed or minimized by the editor to focus on editing tasks


---

## REQ-362: Integrate Translation Preview Panel into Item Editor

**Date**: 2026-01-19 14:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
Owners should be able to preview how their item content appears in different languages while editing items, using the same translation preview functionality available in the article editor.

### Current Behavior
When editing an item, owners can modify the content but have no visibility into how the translated versions will appear to guests. They must publish changes and navigate to the guest view to see translations, creating a disconnect between content creation and multilingual presentation.

### Expected Behavior
The item editor displays an integrated preview panel that shows real-time or near-real-time translations of the item content in selected languages. Owners can switch between languages to verify translations before publishing. The preview updates as content changes, allowing owners to understand how edits will affect translations.

### User Impact
Property owners creating or updating items gain confidence that their content will display correctly across all supported languages. This reduces the need for trial-and-error publication cycles and enables owners to catch translation issues before guests encounter them.

### Business Value
Improving the owner's editing experience leads to higher quality multilingual content and reduces support requests related to unexpected translation behavior.

### Acceptance Criteria
- [ ] Preview panel is visible within the item editor interface
- [ ] Owners can select which language to preview from available target languages
- [ ] Preview reflects current item content including title, description, and any other translatable fields
- [ ] Preview indicates translation status (completed, pending, failed) for each language
- [ ] Preview updates when content changes, showing either cached translations or loading states
- [ ] Implementation follows the same architectural pattern established in the article editor preview



---

## REQ-363: Add Loading States and Error Handling to All Translation Components

**Date**: 2026-01-19 16:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
All translation management components should display appropriate loading indicators during asynchronous operations and provide clear error messages with retry capabilities when operations fail.

### Current Behavior
Translation components may perform API calls to fetch translation status, submit translation jobs, or update translation content without showing clear loading states to indicate that operations are in progress. When API calls fail due to network issues, server errors, or validation problems, users receive inconsistent or missing feedback about what went wrong and have no clear path to retry the failed operation. Some components may hang or appear frozen while waiting for API responses, leaving users uncertain whether the system is working or has encountered a problem. Error states, when they do appear, may lack actionable guidance about how to resolve the issue or attempt the operation again. The absence of standardized loading and error handling patterns across translation features creates an inconsistent user experience where some operations provide clear feedback while others leave users guessing.

### Expected Behavior
Every component that performs asynchronous operations related to translations displays a clear loading indicator while the operation is in progress. Loading spinners appear in appropriate locations within the component, such as within buttons that trigger actions, in content areas awaiting data, or as overlays for full-component loading states. When API calls fail, components display error messages through toast notifications or inline error displays that clearly explain what went wrong in user-friendly language. Error messages avoid technical jargon and provide specific guidance about what the user can do next, such as checking their network connection, waiting a moment, or contacting support. Every error state includes a retry button or mechanism allowing users to attempt the failed operation again without refreshing the page or losing their current context. Loading states prevent duplicate submissions by disabling action buttons or forms while operations are in progress. Components gracefully handle edge cases such as timeout errors, partial failures in batch operations, and authorization issues. Error handling distinguishes between different failure types and provides appropriate messaging and actions for each case.

### User Impact
Property owners working with translation features receive clear, immediate feedback about whether their actions are being processed or have completed successfully. Owners no longer experience confusion or uncertainty when operations take several seconds to complete, as loading indicators provide reassurance that the system is working. Owners encountering errors receive actionable information allowing them to resolve issues independently rather than abandoning the task or contacting support. The ability to retry failed operations directly from error messages reduces frustration and enables owners to recover from temporary network issues or server problems without losing their work. Consistent loading and error patterns across all translation features create a predictable, reliable experience that builds user confidence in the system.

### Business Value
Reduces user frustration and support burden by providing clear feedback and self-service error recovery, improving owner satisfaction with translation features. Decreases the likelihood of owners abandoning translation-related tasks due to unclear system states or confusing error conditions. Improves perceived system reliability and professionalism through polished loading states and error handling that meet modern web application standards. Enables owners to work more efficiently by minimizing interruptions caused by errors and providing fast recovery mechanisms when issues occur.

### Acceptance Criteria
- [ ] All components with asynchronous operations display loading spinners or skeleton screens during data fetching
- [ ] Loading indicators appear within or adjacent to the specific component area being affected, not as full-page overlays unless appropriate
- [ ] Action buttons that trigger API calls show loading spinners within the button and become disabled during operation execution
- [ ] Failed API operations trigger toast notifications with clear, user-friendly error messages
- [ ] Error messages distinguish between common failure types: network errors, server errors, validation errors, and authorization errors
- [ ] Every error notification includes a retry button or action allowing users to re-attempt the failed operation
- [ ] Retry actions preserve the user's input and context rather than requiring them to start over
- [ ] Components prevent duplicate submissions by disabling forms or buttons while operations are in progress
- [ ] Batch operations that partially fail provide detailed feedback about which items succeeded and which failed
- [ ] Loading states do not cause layout shifts or visual jumps that disrupt the user experience
- [ ] Error handling covers edge cases including timeout errors, rate limiting, and concurrent edit conflicts
- [ ] Components recover gracefully from errors without requiring page refresh or loss of unsaved work
- [ ] Error messages provide specific, actionable guidance appropriate to each failure type
- [ ] Loading and error handling patterns are consistent across all translation-related components including preview panels, status widgets, language switchers, and management interfaces




---

## REQ-364: Add Accessibility Features to Translation Components

**Date**: 2026-01-19 17:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
Translation management components should be fully accessible to users relying on assistive technologies, with proper ARIA labels, keyboard navigation, screen reader announcements, and focus management.

### Current Behavior
Translation components including preview panels, status widgets, language switchers, and translation editors have been implemented with primary focus on visual presentation and mouse-based interaction. These components may lack semantic HTML markup, ARIA attributes, and keyboard navigation patterns necessary for users with disabilities to operate them effectively. Status icons indicating translation progress or completion states display visual information without corresponding text alternatives that screen readers can announce. Interactive elements such as expandable preview sections, translation editor modals, and language selection dropdowns may not be fully operable via keyboard alone, requiring mouse interaction that excludes keyboard-only users. When translation status changes occur dynamically, such as a job transitioning from pending to complete, screen reader users receive no audible notification of the change unless they manually navigate back to check the status. Modal dialogs for translation editing or manual override operations may not properly trap focus within the modal, allowing keyboard focus to escape to background content and creating confusion. Focus management when opening and closing preview panels or dialogs does not return focus to appropriate trigger elements, disrupting keyboard navigation flow.

### Expected Behavior
All translation status icons include descriptive ARIA labels that convey their meaning to screen reader users, such as "Translation complete for French" or "Translation pending for German". Interactive elements within preview panels, including expand/collapse toggles and action buttons, are fully operable via keyboard using standard navigation keys like Tab, Enter, and Space. Preview panels implement proper focus management by moving focus to the panel when it opens and returning focus to the trigger element when closed. Translation editor modals trap keyboard focus within the modal while open, ensuring Tab key navigation cycles only through modal controls. Screen reader users receive live region announcements when translation status changes occur, such as "French translation completed successfully" or "German translation failed, retry available". Language switcher components provide keyboard-accessible dropdown menus or radio button groups with arrow key navigation between options. All interactive controls have visible focus indicators meeting WCAG contrast requirements so keyboard users can track their navigation position. Components use semantic HTML elements such as button, nav, dialog, and section rather than generic divs with click handlers. Translation management interfaces organize content in a logical heading hierarchy that screen reader users can navigate efficiently.

### User Impact
Property owners and content editors with visual disabilities or mobility impairments can fully access and operate all translation management features using assistive technologies. Keyboard-only users can efficiently navigate through translation previews, manage translation jobs, and update content without requiring mouse interaction. Screen reader users receive timely notifications about translation status changes, allowing them to monitor progress without repeatedly checking status indicators. Users with cognitive disabilities benefit from clear focus indicators and predictable navigation patterns that reduce confusion. The accessible implementation ensures compliance with accessibility standards and regulations, making the platform usable by a broader audience.

### Business Value
Expands the potential user base by ensuring the platform is usable by property owners and editors with disabilities, demonstrating commitment to inclusive design. Reduces legal and regulatory risk by meeting accessibility standards such as WCAG 2.1 Level AA, which may be required by law in certain jurisdictions. Improves the platform's reputation and competitive position by providing accessibility features that competitors may lack. Enhances overall usability for all users through improvements like keyboard navigation and clear focus indicators, not just users with disabilities. Aligns with corporate values around diversity, equity, and inclusion by ensuring equal access to platform features.

### Acceptance Criteria
- [ ] All translation status icons include descriptive ARIA labels that convey status information to screen readers
- [ ] Preview panel expand/collapse toggles are keyboard accessible using Enter or Space keys
- [ ] Preview panel implements focus trap when opened, cycling Tab navigation within panel content
- [ ] Preview panel returns focus to the trigger element when closed via keyboard or close button
- [ ] Translation editor modals trap keyboard focus within the modal while open
- [ ] Translation editor modals return focus to appropriate trigger element when dismissed
- [ ] Language switcher component is fully keyboard navigable using Tab, Enter, and arrow keys
- [ ] Translation status changes trigger ARIA live region announcements audible to screen readers
- [ ] Live announcements include sufficient context, such as language name and new status state
- [ ] All interactive controls have visible focus indicators with minimum 3:1 contrast ratio
- [ ] Focus indicators are consistent across all translation components
- [ ] Components use semantic HTML elements: button for actions, nav for navigation, dialog for modals
- [ ] Translation management interfaces use proper heading hierarchy (h1, h2, h3) for screen reader navigation
- [ ] Form controls within translation editors include properly associated label elements
- [ ] Error messages and validation feedback are associated with form controls via aria-describedby
- [ ] Batch action controls like "Select all translations" are keyboard accessible
- [ ] Translation preview content is marked with appropriate language attributes (lang attribute)
- [ ] Components meet WCAG 2.1 Level AA success criteria for keyboard access, focus management, and screen reader compatibility
- [ ] Accessibility features are tested with common screen readers including NVDA, JAWS, and VoiceOver
- [ ] Keyboard navigation is tested to ensure logical tab order and no keyboard traps

---

## REQ-365: Write Unit Tests for Translation Hooks

**Date**: 2026-01-19 
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system must include comprehensive unit tests for custom React hooks that manage translation state and real-time updates to ensure reliability and maintainability.

### Current Behavior
Translation hooks (useTranslationStatus and useTranslationRealtime) exist without dedicated unit test coverage, making it difficult to verify their behavior and prevent regressions during future changes.

### Expected Behavior
All translation-related hooks have thorough unit test suites that verify state management, data fetching, subscription handling, and error scenarios using mocked Supabase responses.

### User Impact
Developers working on the translation system can confidently make changes knowing that hook behavior is validated by automated tests, reducing the risk of bugs reaching production that could break translation status displays or real-time updates.

### Business Value
Improves code quality and reduces maintenance costs by catching issues early in the development cycle before they impact end users.

### Acceptance Criteria
- [ ] Unit tests exist for useTranslationStatus hook covering all state transitions (loading, success, error)
- [ ] Unit tests exist for useTranslationRealtime hook covering subscription lifecycle and real-time updates
- [ ] Supabase client responses are properly mocked to avoid external dependencies during testing
- [ ] Tests verify correct handling of edge cases (network failures, empty results, invalid data)
- [ ] All tests pass successfully and are integrated into the project's test suite
- [ ] Test coverage for hooks meets or exceeds project standards (typically 80%+)


---

## REQ-366: Write Component Tests for Translation Management UI

**Date**: 2026-01-19 23:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Critical translation management components should have automated component tests verifying rendering behavior, user interactions, and state management to ensure reliability and prevent regressions.

### Current Behavior
TranslationPreviewPanel, TranslationEditor, and TranslationStatusWidget components exist in production without comprehensive component-level test coverage. While unit tests may exist for underlying hooks and utilities, the integrated behavior of these components including rendering logic, user interaction handling, and state updates remains untested. Developers modifying these components cannot quickly verify that changes preserve existing functionality without extensive manual testing. The TranslationPreviewPanel's rendering of translation status across multiple languages, the TranslationEditor's save flow with validation and API integration, and the TranslationStatusWidget's count calculations and progress display lack automated validation. Changes to these components risk introducing visual regressions, broken interactions, or incorrect state management that only surface during manual testing or in production.

### Expected Behavior
A comprehensive component test suite validates TranslationPreviewPanel rendering behavior across different translation status scenarios including complete translations, partial coverage, pending jobs, and failed translations. Tests verify the panel displays correct status indicators for all six supported languages and shows appropriate action buttons based on translation state. Tests confirm that user interactions like clicking the edit button properly trigger the TranslationEditor modal and clicking retry buttons initiate re-translation requests. TranslationEditor component tests verify the save flow from initial render through user input to successful save completion, ensuring source content displays correctly, the text editor captures changes, validation prevents invalid saves, and successful saves properly mark translations as manually reviewed. Tests validate that the editor prompts for confirmation when users attempt to close with unsaved changes and that the cancel action preserves the unsaved state while the close action discards changes. TranslationStatusWidget component tests verify accurate count calculations for complete, partial, pending, and failed translation statuses, validate progress bar rendering with correct fill percentages, and confirm that count updates trigger appropriate UI re-renders. Tests ensure clicking the view details link navigates to the translation management page with correct parameters.

### User Impact
Property owners relying on translation management interfaces benefit from increased component stability and fewer UI bugs introduced during ongoing development. Developers building and extending translation features gain confidence that component refactoring or enhancement work will not break existing functionality, as automated tests catch issues immediately. Testing the full component integration including rendering, interactions, and state management provides stronger reliability guarantees than testing individual functions in isolation. The comprehensive test coverage reduces the time developers spend on manual regression testing, allowing faster iteration and more frequent improvements to translation management features.

### Business Value
Reduces regression risk as the translation management system evolves, protecting the reliability of features that property owners depend on for maintaining multilingual content. Accelerates development velocity by providing fast automated feedback during development rather than requiring time-consuming manual testing cycles. Enables safer refactoring and optimization of translation components, improving long-term code maintainability and allowing technical debt reduction without fear of breaking production functionality. Demonstrates engineering quality and professionalism through comprehensive testing practices that build stakeholder confidence in the platform's technical foundation.

### Acceptance Criteria
- [ ] Component test suite exists for TranslationPreviewPanel component
- [ ] TranslationPreviewPanel tests verify component renders with mocked translation status data
- [ ] TranslationPreviewPanel tests verify correct status indicators display for all six languages
- [ ] TranslationPreviewPanel tests verify status indicators change appearance based on translation state
- [ ] TranslationPreviewPanel tests verify appropriate action buttons appear for each translation status
- [ ] TranslationPreviewPanel tests verify clicking edit button triggers expected callback or modal
- [ ] TranslationPreviewPanel tests verify clicking retry button initiates re-translation flow
- [ ] Component test suite exists for TranslationEditor component
- [ ] TranslationEditor tests verify component renders with source and translation content
- [ ] TranslationEditor tests verify source content displays in read-only section
- [ ] TranslationEditor tests verify translation content displays in editable text area
- [ ] TranslationEditor tests verify text input updates component state correctly
- [ ] TranslationEditor tests verify save button becomes enabled when content changes
- [ ] TranslationEditor tests verify save button remains disabled when content is invalid
- [ ] TranslationEditor tests verify successful save triggers API call with correct payload
- [ ] TranslationEditor tests verify successful save marks translation as manually reviewed
- [ ] TranslationEditor tests verify successful save closes the editor component
- [ ] TranslationEditor tests verify unsaved changes trigger confirmation prompt when closing
- [ ] TranslationEditor tests verify confirmation prompt offers save, discard, and cancel options
- [ ] Component test suite exists for TranslationStatusWidget component
- [ ] TranslationStatusWidget tests verify component displays count of complete translations
- [ ] TranslationStatusWidget tests verify component displays count of partial translations
- [ ] TranslationStatusWidget tests verify component displays count of pending translations
- [ ] TranslationStatusWidget tests verify component displays count of failed translations
- [ ] TranslationStatusWidget tests verify progress bar fills proportionally to completion percentage
- [ ] TranslationStatusWidget tests verify progress bar updates when status counts change
- [ ] TranslationStatusWidget tests verify view details link includes correct navigation parameters
- [ ] All component tests use appropriate mocking for Supabase client and API dependencies
- [ ] Tests isolate component behavior from external dependencies to ensure reliability
- [ ] Component tests achieve meaningful code coverage for rendering and interaction logic
- [ ] All tests pass consistently in both local development and continuous integration environments
- [ ] Test suite is maintainable with clear test descriptions and well-organized test structure
