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

