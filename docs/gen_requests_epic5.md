# Generated Requests - Epic 5 (Owner Translation Management)

This file contains auto-generated feature requests for L10N Epic 5.
Request IDs use format: REQ-E05-XXX

Last Reset: 2026-01-19
Last Modified: 2026-01-20 23:59 (REQ-E05-033 added)

---

## REQ-E05-001: Translation Status Query API Endpoint

**Date**: 2026-01-19
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need to query the translation status of their content through an API that provides both summary statistics and detailed item-level information.

### Current Behavior
No API endpoint exists for property owners to programmatically retrieve translation status information for their content.

### Expected Behavior
A GET endpoint returns translation status data filtered by entity type, entity ID, translation status, and property ownership, with appropriate access validation ensuring owners only see their own content.

### User Impact
Property owners can integrate translation status monitoring into their workflows, dashboards display accurate translation progress, and automated systems can trigger actions based on translation completion states.

### Business Value
Enables owners to track multilingual content coverage and identify gaps in translated content, supporting better guest experiences across language preferences.

### Acceptance Criteria
- [ ] GET request accepts query parameters: entityType, entityId, status, propertyId
- [ ] Response includes summary counts showing total, pending, completed, and failed translations
- [ ] Response includes item-level status details with entity information and translation state
- [ ] System validates that requesting account has access to the specified property
- [ ] Unauthorized access attempts return appropriate error responses
- [ ] Empty result sets return successfully with zero counts
- [ ] Query performance remains acceptable with large datasets (response time under 2 seconds)

---

## REQ-E05-002: Manual Translation Update API Endpoint

**Date**: 2026-01-19 14:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need to manually update and override machine-generated translations through an API endpoint that marks content as human-reviewed.

### Current Behavior
No API endpoint exists for property owners to submit manual translation updates or override machine-generated translations for their content.

### Expected Behavior
A PUT endpoint accepts translation content updates, automatically marks the translation status as 'manual', records the reviewer's identity, validates ownership permissions, and persists the changes successfully.

### User Impact
Property owners can provide accurate, culturally-appropriate translations that override automated translations, ensuring higher quality multilingual content that reflects their brand voice and local expertise.

### Business Value
Improves translation quality through human oversight while maintaining automated workflows for scale, leading to better guest satisfaction with translated content.

### Acceptance Criteria
- [ ] PUT request accepts entityType, entityId, and language as path parameters
- [ ] Request body contains the updated translation content fields
- [ ] System automatically sets translation status to 'manual' upon update
- [ ] System records the reviewedBy field with the authenticated user's identifier
- [ ] System validates that the requesting user has access to the specified entity
- [ ] Unauthorized access attempts return 403 Forbidden responses
- [ ] Invalid entity references return 404 Not Found responses
- [ ] Successful updates return the complete updated translation record
- [ ] Translation version history is preserved when content is updated
- [ ] Content validation ensures required fields are present and properly formatted

---

## REQ-E05-003: Bulk Content Re-Translation Request API Endpoint

**Date**: 2026-01-19 14:35
**Type**: NEW FEATURE
**Size**: L

### Summary
Property owners need to request re-translation of their content when translations become stale or need refreshing, supporting both individual and bulk operations with configurable handling of manually edited translations.

### Current Behavior
No API endpoint exists for property owners to trigger re-translation of existing content, forcing them to manually delete and recreate translations or wait for automatic staleness detection.

### Expected Behavior
A POST endpoint accepts single or multiple entity references, queues translation jobs for each requested entity and language combination, respects options to skip or overwrite manually edited translations, and returns counts of jobs created versus skipped.

### User Impact
Property owners can refresh outdated translations across their entire property with a single request, choose whether to preserve human-reviewed translations during bulk updates, and receive immediate feedback on how many translations will be regenerated.

### Business Value
Enables efficient translation refresh workflows when source content changes significantly, reducing manual effort while preserving valuable human edits where appropriate.

### Acceptance Criteria
- [ ] POST request accepts array of entity references (entityType and entityId pairs)
- [ ] Request body supports 'skipManualEdits' option (boolean) to preserve human-reviewed translations
- [ ] Request body supports 'overwriteManualEdits' option (boolean) to force re-translation of all content
- [ ] System validates that requesting user has ownership access to all specified entities
- [ ] System queues translation jobs for all supported languages per entity
- [ ] Response includes 'jobsQueued' count showing number of translation jobs created
- [ ] Response includes 'jobsSkipped' count showing number of manual translations preserved
- [ ] System handles mixed entity types (items, articles, links) in a single request
- [ ] Partial authorization failures return clear error messages identifying inaccessible entities
- [ ] Job creation failures are logged but do not prevent other jobs from being queued
- [ ] System prevents duplicate job creation if translations are already pending
- [ ] Empty request bodies or arrays return appropriate validation errors

---

## REQ-E05-004: Source Content Version Tracking via Database Schema

**Date**: 2026-01-19 14:40
**Type**: ENHANCEMENT
**Size**: S

### Summary
The translation system needs to track when source content was last modified to automatically detect when translations have become stale and require re-translation.

### Current Behavior
Translation tables store translated content and status, but do not maintain timestamps indicating when the source content was last changed, making it impossible to automatically detect outdated translations.

### Expected Behavior
Translation tables include source_version_at timestamp columns that are automatically updated whenever source content changes, enabling the system to compare translation creation dates against source modification dates to identify stale translations requiring refresh.

### User Impact
Property owners benefit from automatic detection of outdated translations, ensuring guests always see accurate translated content that reflects the latest source information without manual intervention.

### Business Value
Reduces manual translation management overhead, improves translation accuracy over time, and ensures multilingual content stays synchronized with source content changes.

### Acceptance Criteria
- [ ] Database migration adds source_version_at column to items_translation table
- [ ] Database migration adds source_version_at column to articles_translation table
- [ ] Database migration adds source_version_at column to links_translation table
- [ ] All new source_version_at columns allow NULL values for backward compatibility
- [ ] Indexes are created on source_version_at columns for efficient staleness queries
- [ ] Composite indexes are created combining status and source_version_at for performance
- [ ] Migration can be rolled back without data loss
- [ ] Existing translation records remain valid after migration
- [ ] Query performance for status filtering shows no degradation after index creation

---

## REQ-E05-005: TypeScript Database Type Definitions for Translation Schema

**Date**: 2026-01-19 14:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
The application's TypeScript type definitions need to reflect the current translation table schema including all columns added during previous epic phases.

### Current Behavior
TypeScript type definitions may be missing or outdated for translation-related database tables, causing type safety issues, IntelliSense problems, and potential runtime errors when accessing translation data.

### Expected Behavior
Type definitions accurately represent all translation table structures including the translation_jobs table, translation content tables for items/articles/links, and all column types including newly added columns like source_version_at, ensuring developers have complete type safety and autocomplete support.

### User Impact
Developers building translation features experience fewer runtime errors, benefit from accurate autocomplete suggestions, catch type mismatches during development rather than production, and maintain code quality through compile-time validation.

### Business Value
Reduces development time through better tooling support, prevents type-related bugs from reaching production, and improves code maintainability by ensuring database schema changes are reflected in application code.

### Acceptance Criteria
- [ ] Type definitions include complete translation_jobs table structure with all columns
- [ ] Type definitions include items_translation table with source_version_at column
- [ ] Type definitions include articles_translation table with source_version_at column
- [ ] Type definitions include links_translation table with source_version_at column
- [ ] Enum types are defined for translation status values (pending, completed, failed, manual)
- [ ] Enum types are defined for entity types (item, article, link, tag)
- [ ] All timestamp columns are typed as Date or string as appropriate
- [ ] JSON columns are typed with specific structures rather than generic Record types
- [ ] Type definitions match actual database schema without discrepancies
- [ ] Existing code using translation types compiles without new type errors
- [ ] Generated types include helpful JSDoc comments describing column purposes

---

## REQ-E05-006: Translation Management Shared Type Definitions

**Date**: 2026-01-19 15:00
**Type**: NEW FEATURE
**Size**: S

### Summary
Translation management UI components need a centralized type definition file containing all shared interfaces, types, and enums to ensure type consistency across the owner-facing translation management interface.

### Current Behavior
No centralized type definition file exists for translation management UI components, leading to potential type inconsistencies, duplicate type definitions across components, and lack of a single source of truth for translation management data structures.

### Expected Behavior
A dedicated TypeScript types file defines all shared interfaces for translation status displays, translation editor props, translation job metadata, language selection controls, and reusable component properties, providing complete type safety and IntelliSense support throughout the translation management feature.

### User Impact
Developers building and maintaining translation management features experience fewer type-related bugs, benefit from accurate IDE autocomplete, maintain consistency across components through shared type contracts, and catch integration errors during development rather than runtime.

### Business Value
Accelerates feature development through better tooling support, reduces maintenance costs by centralizing type definitions, prevents runtime errors through compile-time validation, and improves code quality through enforced type contracts.

### Acceptance Criteria
- [ ] File created at `/src/components/TranslationManagement/TranslationManagement.types.ts`
- [ ] Types define translation status display data structures (status, counts, percentages)
- [ ] Types define translation editor component props and state interfaces
- [ ] Types define translation job metadata structures (job ID, entity reference, language, priority)
- [ ] Types define language selector component props and option types
- [ ] Types define translation preview component props and content structure
- [ ] Enum types define translation status values matching database schema
- [ ] Enum types define entity types matching database schema
- [ ] Types include JSDoc comments explaining purpose and usage of complex structures
- [ ] All types export properly for use across translation management components
- [ ] Types integrate seamlessly with existing database types from generated definitions
- [ ] No circular dependencies exist between type definition files

---

## REQ-E05-007: Translation Preview Panel Component

**Date**: 2026-01-19 15:05
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a slide-in panel that displays translation status and content for a selected item, showing the source content alongside all available language translations with their current state and available actions.

### Current Behavior
No dedicated UI component exists for property owners to preview translation status and content for individual items, forcing them to navigate to separate pages or views to understand translation coverage and quality.

### Expected Behavior
A 400-pixel-wide panel slides in from the right side of the screen, displaying the source content at the top section, followed by a list of all six supported languages with their translation status indicators, and provides action buttons for editing translations, triggering re-translation, or retrying failed translations.

### User Impact
Property owners can quickly review translation coverage for any content item without leaving their current view, understand which languages need attention, assess translation quality by comparing source and translated content, and take immediate corrective actions when issues are identified.

### Business Value
Streamlines translation management workflows by consolidating status review and action controls in a single, non-disruptive interface, reducing the time required to maintain multilingual content quality.

### Acceptance Criteria
- [ ] Panel slides in from right side with smooth animation (300ms transition)
- [ ] Panel width is fixed at 400 pixels on desktop viewports
- [ ] Panel header displays the entity type and identifier or title
- [ ] Source content section displays original language content at top of panel
- [ ] Language list displays all six supported languages (EN, ES, FR, DE, IT, PT)
- [ ] Each language entry shows translation status with appropriate visual indicator
- [ ] Each language entry displays translation completion percentage or status label
- [ ] Edit button opens translation editor for manual content updates
- [ ] Re-translate button queues new translation job for selected language
- [ ] Retry button re-attempts failed translation jobs
- [ ] Action buttons are contextually enabled/disabled based on translation status
- [ ] Close button or overlay click dismisses panel with animation
- [ ] Panel content scrolls independently when exceeding viewport height
- [ ] Panel is responsive and adapts layout for tablet viewports (768px and below)
- [ ] Panel overlays content without affecting page layout or causing reflow
- [ ] Loading states display while fetching translation data
- [ ] Error states display when translation data cannot be loaded
- [ ] Component accepts entity reference (entityType and entityId) as props
- [ ] Component integrates with translation status API endpoint

---

## REQ-E05-008: Translation Status Item Row Component

**Date**: 2026-01-20 14:22
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners need a reusable row component that displays a single language's translation status within the preview panel, showing the flag, language name, status indicator, preview text snippet, and available actions.

### Current Behavior
No reusable component exists to display individual language translation status rows, requiring duplicate code across different translation management views and inconsistent visual presentation of translation information.

### Expected Behavior
A single-row component renders with the language's flag icon on the left, followed by the language name, a colored status indicator matching the specification (green for complete, orange for pending, red for failed, purple for manual), a truncated preview of the translated text, and contextual action buttons that appear on row hover or focus.

### User Impact
Property owners can quickly scan translation status across all languages in a consistent visual format, identify which translations need attention through color-coded status indicators, preview translation quality without opening a full editor, and take immediate action on individual translations through accessible controls.

### Business Value
Provides a consistent, reusable building block for all translation status views, reducing development time for future features while maintaining a cohesive user experience across the translation management interface.

### Acceptance Criteria
- [ ] Component renders as a single horizontal row with flex layout
- [ ] Flag icon displays at left edge using appropriate emoji or icon library
- [ ] Language name displays immediately after flag in medium font weight
- [ ] Status indicator displays using specified colors: green (complete), orange (pending), red (failed), purple (manual)
- [ ] Status indicator includes appropriate icon (checkmark, clock, error, pencil) matching status type
- [ ] Preview text displays truncated translation content (maximum 80 characters with ellipsis)
- [ ] Preview text shows fallback message when no translation exists
- [ ] Action buttons display on row hover or keyboard focus
- [ ] Edit action button is enabled for completed or manual translations
- [ ] Re-translate action button is enabled for completed, failed, or manual translations
- [ ] Retry action button is enabled only for failed translations
- [ ] All action buttons include accessible labels and ARIA attributes
- [ ] Component accepts language code (ISO 639-1) as required prop
- [ ] Component accepts translation status enum as required prop
- [ ] Component accepts translated content text as optional prop
- [ ] Component accepts callback functions for each action button
- [ ] Component is fully keyboard accessible with focus management
- [ ] Component maintains consistent height regardless of content length
- [ ] Component visual design matches specified color palette and typography
- [ ] Component works within both light and dark theme contexts

---

## REQ-E05-009: Translation Progress Bar Visual Indicator Component

**Date**: 2026-01-20 14:30
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners need a visual progress indicator that displays translation completion status as a ratio and animated progress bar, showing at a glance how many languages have completed translations out of the total number of supported languages.

### Current Behavior
No visual progress indicator component exists to communicate translation completion status, forcing property owners to manually count completed translations or review individual language statuses to understand overall translation coverage.

### Expected Behavior
A compact progress bar component displays a fraction indicator (e.g., "3/5 translations complete") above or beside a horizontal progress bar that fills proportionally to represent completion percentage, with smooth animation when progress values change and color-coded states to indicate different completion levels.

### User Impact
Property owners can immediately assess translation coverage for any content item through a single visual element, understand how close they are to full multilingual coverage, and monitor real-time progress as translation jobs complete through animated transitions.

### Business Value
Provides instant visual feedback on translation status without requiring detailed analysis, encouraging property owners to complete translations for all supported languages by making progress transparent and actionable.

### Acceptance Criteria
- [ ] Component displays a text label showing completion ratio in format "X/Y translations complete"
- [ ] Component displays a horizontal progress bar beneath the text label
- [ ] Progress bar fills from left to right proportional to completion percentage
- [ ] Progress bar uses green color (#10b981) for complete state (100% coverage)
- [ ] Progress bar uses orange color (#f59e0b) for partial state (1-99% coverage)
- [ ] Progress bar uses gray color (#d1d5db) for empty state (0% coverage)
- [ ] Progress bar animates smoothly when progress value changes (300ms transition)
- [ ] Component accepts total count as numeric prop representing number of languages
- [ ] Component accepts completed count as numeric prop representing finished translations
- [ ] Component calculates percentage automatically from total and completed values
- [ ] Component displays "0/6 translations complete" when no translations exist
- [ ] Component displays "6/6 translations complete" when all languages are translated
- [ ] Component is responsive and maintains readability at different widths
- [ ] Component height remains consistent regardless of progress value
- [ ] Progress animation uses easing function for smooth visual transition (ease-in-out)
- [ ] Component includes ARIA attributes for accessibility (role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax)
- [ ] Component renders correctly within the TranslationPreviewPanel component
- [ ] Component styling is consistent with the application's design system
- [ ] Component updates instantly when translation jobs complete in real-time

---

## REQ-E05-010: Translation Editor Modal Component

**Date**: 2026-01-20 14:45
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a modal dialog to manually edit translation content with a side-by-side view comparing original and translated text, supporting character count monitoring, dirty state tracking, and save/cancel workflows.

### Current Behavior
No modal editor component exists for property owners to manually review and edit machine-generated translations, forcing them to work in separate interfaces without seeing the source content alongside the translation.

### Expected Behavior
A modal dialog opens centered on the screen displaying the original content on the left and an editable translation textarea on the right, with real-time character count feedback, visual dirty state indication when changes are made, and clearly labeled Save and Cancel buttons that respect unsaved changes through confirmation prompts.

### User Impact
Property owners can refine machine-generated translations while referencing the original content, ensure translations maintain appropriate length through character count warnings, understand when they have unsaved changes through clear visual feedback, and confidently save or discard their edits through an intuitive control interface.

### Business Value
Enables efficient human review and correction of automated translations, improving translation quality while maintaining the productivity benefits of machine translation through a streamlined editing workflow.

### Acceptance Criteria
- [ ] Modal dialog uses Radix UI Dialog primitive for accessibility and focus management
- [ ] Modal opens centered on viewport with overlay backdrop that prevents interaction with underlying content
- [ ] Left side displays original source content in read-only format with clear visual styling
- [ ] Right side displays editable textarea for translation content with appropriate font size and spacing
- [ ] Both sides display content in equal-width columns (50% each) on desktop viewports
- [ ] Character count displays beneath translation textarea showing current length versus maximum if applicable
- [ ] Character count shows warning state (orange/red color) when approaching or exceeding recommended limits
- [ ] Textarea auto-expands vertically to match content height up to a maximum threshold
- [ ] Dirty state indicator displays when translation content differs from original saved value
- [ ] Save button is disabled when no changes have been made (clean state)
- [ ] Save button is enabled when changes exist (dirty state)
- [ ] Cancel button displays confirmation dialog when unsaved changes exist
- [ ] Cancel button immediately closes modal when no changes have been made
- [ ] Save action persists changes via API and marks translation status as 'manual'
- [ ] Success notification displays after successful save operation
- [ ] Error notification displays if save operation fails with actionable error message
- [ ] Modal header displays language name and flag icon for the translation being edited
- [ ] Escape key triggers cancel workflow (with confirmation if dirty)
- [ ] Modal is fully keyboard accessible with proper tab order and focus management
- [ ] Modal adapts to mobile viewports by stacking original and translation vertically
- [ ] Component accepts entity reference (entityType, entityId) and language code as required props
- [ ] Component accepts original content text as required prop
- [ ] Component accepts existing translation text as optional prop
- [ ] Component accepts onSave callback function that receives updated translation content
- [ ] Component integrates with manual translation update API endpoint
- [ ] Loading state displays during save operation with disabled controls
- [ ] Component maintains focus on first interactive element when opened
- [ ] Component returns focus to triggering element when closed

---

## REQ-E05-011: Translation Status Monitoring React Hook

**Date**: 2026-01-20 15:00
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a reusable React hook that fetches and monitors translation status for individual content items or entire properties, providing loading states, error handling, and automatic refresh capabilities.

### Current Behavior
No reusable hook exists for components to fetch translation status data from the API, forcing each component to implement its own data fetching logic with inconsistent error handling, loading state management, and refresh behavior.

### Expected Behavior
A custom React hook accepts either a single entity reference or a property-wide scope parameter, fetches translation status from the API endpoint, returns data in a standardized format with loading and error states, supports manual refresh actions, and optionally polls for updates when translation jobs are actively processing.

### User Impact
Developers building translation management features can quickly integrate translation status displays without reimplementing data fetching logic, users see consistent loading and error states across all translation interfaces, translation status updates automatically when jobs complete, and components remain responsive through proper loading state handling.

### Business Value
Accelerates feature development by providing a reusable abstraction over the translation status API, ensures consistent error handling across all translation management interfaces, reduces code duplication and maintenance burden, and improves user experience through standardized loading patterns.

### Acceptance Criteria
- [ ] Hook file created at `/src/hooks/useTranslationStatus.ts`
- [ ] Hook accepts entity reference parameters (entityType and entityId) for single-entity queries
- [ ] Hook accepts propertyId parameter for property-wide translation status queries
- [ ] Hook accepts optional filter parameters (status, language) to narrow results
- [ ] Hook returns data object containing translation status records from API
- [ ] Hook returns loading boolean indicating when fetch operation is in progress
- [ ] Hook returns error object containing error details if fetch operation fails
- [ ] Hook returns refresh function to manually trigger data refetch
- [ ] Hook implements automatic retry logic for failed requests (3 attempts with exponential backoff)
- [ ] Hook supports optional polling mode with configurable interval (default: 5 seconds)
- [ ] Hook automatically disables polling when no pending translation jobs exist
- [ ] Hook cleans up polling intervals and pending requests when component unmounts
- [ ] Hook integrates with the translation status GET API endpoint
- [ ] Hook handles 401/403 responses by surfacing authentication errors to consumers
- [ ] Hook handles 404 responses gracefully when queried entity does not exist
- [ ] Hook caches results to prevent redundant API calls when parameters unchanged
- [ ] Hook supports React Suspense pattern for data fetching (optional enhancement)
- [ ] Hook includes TypeScript type definitions for all parameters and return values
- [ ] Hook validates required parameters and throws descriptive errors for invalid input
- [ ] Hook works correctly with React StrictMode (handles double-mounting in development)
- [ ] Hook prevents race conditions when parameters change rapidly through proper cleanup
- [ ] Loading state is true during initial fetch and false when data or error is available
- [ ] Error state clears when successful refetch occurs after previous error
- [ ] Component using hook can display loading skeleton while data loads
- [ ] Component using hook can display error message with retry button when fetch fails

---

## REQ-E05-012: Realtime Translation Updates Subscription Hook

**Date**: 2026-01-20 15:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need their translation management interfaces to automatically update when translation jobs complete or status changes occur, without requiring manual page refresh or polling intervals.

### Current Behavior
Translation status information only updates when components explicitly refetch data through polling intervals or manual refresh actions, causing delays in reflecting completed translations and creating unnecessary server load through frequent polling requests.

### Expected Behavior
A React hook subscribes to Supabase Realtime channels for translation record changes, automatically triggers UI updates when translations complete or change status, filters subscription events to only relevant entity types and property ownership, and properly cleans up subscriptions when components unmount or parameters change.

### User Impact
Property owners see translation status update immediately when jobs complete without waiting for polling intervals, translation progress bars animate in real-time as each language finishes processing, the interface feels responsive and live rather than stale, and users can trust that displayed information is always current without manual refresh actions.

### Business Value
Improves perceived system responsiveness and user confidence through instant updates, reduces unnecessary API polling load on servers while providing better real-time feedback, and creates a more professional experience that matches modern web application expectations.

### Acceptance Criteria
- [ ] Hook file created at `/src/hooks/useTranslationRealtime.ts`
- [ ] Hook accepts entity reference parameters (entityType and entityId) for single-entity subscriptions
- [ ] Hook accepts propertyId parameter for property-wide subscriptions
- [ ] Hook accepts optional callback function that executes when translation updates are received
- [ ] Hook creates Supabase Realtime channel subscription on mount
- [ ] Hook subscribes to INSERT events on relevant translation tables (items_translation, articles_translation, links_translation)
- [ ] Hook subscribes to UPDATE events on relevant translation tables
- [ ] Hook filters subscription events to match provided entity reference or property scope
- [ ] Hook filters subscription events to only include rows accessible to authenticated user
- [ ] Hook triggers callback function with updated translation record when events match filters
- [ ] Hook unsubscribes from Realtime channel when component unmounts
- [ ] Hook re-establishes subscription when entity reference or property parameters change
- [ ] Hook handles subscription errors gracefully without crashing the component
- [ ] Hook handles disconnection and automatic reconnection scenarios
- [ ] Hook debounces rapid successive updates to prevent excessive re-renders (100ms debounce)
- [ ] Hook integrates seamlessly with useTranslationStatus hook for coordinated updates
- [ ] Hook includes TypeScript type definitions for all parameters and return values
- [ ] Hook provides connection status indicator (connected, connecting, disconnected, error)
- [ ] Hook cleans up pending timers and subscriptions when parameters change
- [ ] Hook works correctly with React StrictMode (handles double-mounting in development)
- [ ] Component using hook receives instant updates when translation jobs complete
- [ ] Component using hook can display connection status indicator if desired
- [ ] Component using hook can combine realtime updates with initial data fetch from useTranslationStatus
- [ ] Hook prevents memory leaks through proper cleanup of all subscriptions and event listeners
- [ ] Hook only subscribes to channels when component is actively mounted and visible
- [ ] Subscription filter logic validates ownership access before processing update events
- [ ] Hook supports pausing/resuming subscriptions when tab visibility changes (optional enhancement)
- [ ] Multiple components using same subscription share a single Realtime channel connection

---

## REQ-E05-013: Dashboard Translation Status Summary Widget

**Date**: 2026-01-20 15:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a dashboard widget that displays an at-a-glance summary of translation coverage across all their content, showing overall progress and status breakdowns with quick access to detailed translation management.

### Current Behavior
No dashboard widget exists to show property owners their overall translation status, forcing them to navigate to dedicated translation pages to understand the completeness of their multilingual content coverage.

### Expected Behavior
A compact dashboard card displays translation completion statistics with a visual progress bar showing the percentage of content fully translated, numerical counts categorized by translation status (complete, partial, pending, failed), and a clickable link or button to navigate to the detailed translation management interface.

### User Impact
Property owners can monitor translation health from their main dashboard without navigating away, quickly identify when content needs translation attention through status counts, assess overall multilingual readiness through the progress percentage, and access detailed translation tools through a single click when issues require investigation.

### Business Value
Increases visibility of translation coverage encouraging property owners to maintain complete multilingual content, reduces friction in translation management by surfacing status at the primary dashboard touchpoint, and supports better guest experiences by highlighting incomplete translations before guests encounter them.

### Acceptance Criteria
- [ ] Widget renders as a dashboard card with consistent styling matching other dashboard widgets
- [ ] Card header displays title "Translation Status" with appropriate icon
- [ ] Progress bar displays overall translation completion as a percentage (0-100%)
- [ ] Progress bar uses color coding: green (80-100%), orange (40-79%), red (0-39%)
- [ ] Status counts section displays four numerical indicators with labels
- [ ] Complete count shows number of content items with all languages translated
- [ ] Partial count shows number of content items with some but not all languages translated
- [ ] Pending count shows number of translation jobs currently queued or in progress
- [ ] Failed count shows number of translation jobs that encountered errors
- [ ] Each status count uses appropriate icon and color to match its semantic meaning
- [ ] "View Details" link navigates to the full translation management page
- [ ] Widget displays loading skeleton while fetching translation status data
- [ ] Widget displays error state with retry option when data fetch fails
- [ ] Widget shows zero states gracefully when no content has been created yet
- [ ] Widget updates automatically when translation jobs complete without requiring page refresh
- [ ] Widget integrates with useTranslationStatus hook to fetch property-wide statistics
- [ ] Widget integrates with useTranslationRealtime hook for live status updates
- [ ] Widget is responsive and adapts layout for mobile viewports
- [ ] Widget maintains consistent height to prevent dashboard layout shifts
- [ ] Component accepts propertyId as a required prop to scope statistics
- [ ] Component is accessible with proper ARIA labels and semantic HTML structure
- [ ] Widget hover state provides visual feedback for the "View Details" action area
- [ ] Widget displays tooltip explaining the progress percentage calculation method

---

## REQ-E05-014: Compact Translation Status Column Indicator for Table Views

**Date**: 2026-01-20 16:00
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners need a compact visual indicator within table columns that displays translation status for all languages at a glance, using a six-dot pattern where each dot represents one language's translation state.

### Current Behavior
No inline status indicator exists for displaying translation coverage within list or table views, requiring property owners to open detail views or panels to assess which languages have been translated for each content item.

### Expected Behavior
A compact horizontal row of six colored dots displays within table cells, where each dot corresponds to one supported language using the standard color scheme (green for complete, orange for pending, red for failed, purple for manual, gray for not started), and clicking the indicator opens the translation preview panel for detailed review and actions.

### User Impact
Property owners can rapidly scan their entire content inventory to identify translation gaps without opening individual items, understand translation coverage distribution across their catalog through quick visual patterns, and access detailed translation information for any item through a single click on the status indicator.

### Business Value
Enables efficient translation coverage audits across large content catalogs, encourages complete multilingual coverage by making gaps visually obvious, and reduces the number of clicks required to manage translations through streamlined access to preview panels.

### Acceptance Criteria
- [ ] Component renders as a horizontal row of six circular indicators (dots or icons)
- [ ] Each dot represents one language in consistent order: EN, ES, FR, DE, IT, PT
- [ ] Dot colors use standard status scheme: green (#10b981) complete, orange (#f59e0b) pending, red (#ef4444) failed, purple (#a855f7) manual, gray (#d1d5db) not started
- [ ] Each dot includes a tooltip showing the language name and status on hover
- [ ] Entire indicator component is clickable and opens the TranslationPreviewPanel
- [ ] Click handler passes entity reference (entityType, entityId) to panel component
- [ ] Component accepts entity reference as required props (entityType, entityId)
- [ ] Component accepts translation status data array as required prop containing status for each language
- [ ] Component displays loading state with shimmer effect while status data is being fetched
- [ ] Dots have consistent size (8-10 pixels diameter) for compact table presentation
- [ ] Dots have small spacing between them (2-4 pixels) to remain compact
- [ ] Component maintains fixed width to prevent table column width fluctuation
- [ ] Component is fully keyboard accessible with proper focus indication and Enter/Space activation
- [ ] Component includes ARIA label describing the translation status summary
- [ ] Component adapts to mobile viewports by maintaining readability at small sizes
- [ ] Component integrates with TranslationPreviewPanel through click event callback
- [ ] Component accepts optional onClick callback prop for custom integration
- [ ] Visual design maintains clarity at standard table row heights (40-48 pixels)
- [ ] Dots use smooth color transitions when status updates occur (200ms transition)
- [ ] Component updates immediately when receiving new translation status data
- [ ] Component works correctly within various table components (ItemManager, ArticleList, etc.)
- [ ] Component includes focus trap to prevent table navigation interruption during keyboard use
- [ ] Component displays correctly in both light and dark theme contexts

---

## REQ-E05-015: Translation Status Filter Dropdown for Content Lists

**Date**: 2026-01-20 16:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners need a dropdown filter control within content list views that allows filtering items by their translation status to quickly identify content requiring translation attention.

### Current Behavior
No filtering mechanism exists for property owners to narrow content lists based on translation completeness or status, requiring manual scanning of all items to identify those needing translation work or attention.

### Expected Behavior
A dropdown select control displays above or within content list headers offering six filter options: "All Items", "Fully Translated", "Partially Translated", "Pending", "Failed", and "Manually Edited", with the selection persisting during the session and immediately updating the visible content list to show only matching items.

### User Impact
Property owners can rapidly isolate untranslated or problematic content requiring immediate attention, focus their translation workflow on specific status categories without distraction from already-completed items, understand the scope of translation work remaining through filtered item counts, and efficiently manage large content catalogs by progressively addressing translation gaps.

### Business Value
Streamlines translation management workflows by enabling focused attention on content requiring specific actions, reduces time spent searching for incomplete translations in large catalogs, and encourages systematic completion of translation coverage through organized filtering.

### Acceptance Criteria
- [ ] Dropdown component renders as a select input with clear label "Filter by Translation Status"
- [ ] Dropdown displays six options: "All Items", "Fully Translated", "Partially Translated", "Pending", "Failed", "Manually Edited"
- [ ] "All Items" option shows all content regardless of translation status (default selection)
- [ ] "Fully Translated" option shows only items with translations completed for all six supported languages
- [ ] "Partially Translated" option shows items with translations in some but not all languages
- [ ] "Pending" option shows items with one or more translation jobs currently queued or in progress
- [ ] "Failed" option shows items with one or more translation jobs that encountered errors
- [ ] "Manually Edited" option shows items where at least one translation has been manually reviewed and edited
- [ ] Selection triggers immediate re-filtering of the content list without page reload
- [ ] Filtered item count displays near the dropdown showing number of matching items (e.g., "Showing 12 of 45 items")
- [ ] Filter selection persists in component state during the user's current session
- [ ] Filter state resets to "All Items" when navigating away and returning to the list view
- [ ] Component accepts onChange callback prop that receives selected filter value
- [ ] Component accepts optional currentFilter prop to support controlled component pattern
- [ ] Dropdown is keyboard accessible with arrow key navigation and Enter/Space selection
- [ ] Component includes appropriate ARIA labels and roles for screen reader accessibility
- [ ] Component styling matches the application's design system and form input patterns
- [ ] Component displays correctly within ItemManager, ArticleList, and other list container components
- [ ] Component is responsive and adapts layout for mobile viewports (768px and below)
- [ ] Component integrates with list data fetching hooks to apply filter criteria to API queries
- [ ] Component displays loading state in dropdown during filter application
- [ ] Empty state message displays when filter produces zero results (e.g., "No failed translations found")
- [ ] Component positioning aligns with other list control elements (search, sort, bulk actions)
- [ ] Filter selection updates URL query parameters for shareable filtered views (optional enhancement)
- [ ] Component works correctly when combined with other active filters (search text, date range, etc.)

---

## REQ-E05-016: Dashboard Translation Status Widget Integration

**Date**: 2026-01-20 16:55
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners need the translation status widget integrated into their main dashboard view so they can monitor translation coverage immediately upon login without navigating to specialized translation management pages.

### Current Behavior
The dashboard displays property information and content summaries but provides no visibility into translation status or multilingual content coverage, requiring property owners to remember to check translation pages separately or rely on manual tracking of translation completeness.

### Expected Behavior
The dashboard includes the TranslationStatusWidget component displaying overall translation health with progress indicators, status counts, and direct navigation to detailed translation management, automatically loading translation statistics on dashboard load and updating in real-time as translation jobs complete.

### User Impact
Property owners see translation coverage status immediately upon accessing their dashboard, can quickly identify translation gaps requiring attention without navigating away from their primary workspace, understand the state of their multilingual content at a glance, and access detailed translation tools through a single click when intervention is needed.

### Business Value
Increases awareness of translation status by placing it at the primary user touchpoint, encourages proactive translation management by making gaps visible on every dashboard visit, and reduces the likelihood of incomplete multilingual content going unnoticed before guests encounter missing translations.

### Acceptance Criteria
- [ ] TranslationStatusWidget component is imported and rendered within the dashboard layout
- [ ] Widget displays in a prominent position visible without scrolling on desktop viewports
- [ ] Widget receives propertyId from current user's active property context
- [ ] Dashboard fetches translation status data on initial page load
- [ ] Widget displays loading skeleton during initial data fetch
- [ ] Widget displays error state with retry option if status fetch fails
- [ ] Widget shows zero state when no content has been created yet
- [ ] Widget updates automatically when translation jobs complete through realtime subscriptions
- [ ] Widget placement maintains consistent positioning across different dashboard layouts
- [ ] Widget does not cause layout shift when loading or updating with new data
- [ ] Widget is responsive and adapts layout for tablet viewports (768px and below)
- [ ] Widget is fully accessible with proper ARIA labels and keyboard navigation
- [ ] "View Details" link navigates to the translation management page at `/dashboard2/translations`
- [ ] Widget integrates with existing dashboard grid or card layout system
- [ ] Widget maintains visual consistency with other dashboard widgets (card style, spacing, typography)
- [ ] Dashboard page performance remains acceptable with widget added (no significant load time increase)
- [ ] Widget data fetching uses proper caching to avoid redundant API calls on dashboard revisits
- [ ] Widget handles missing or invalid property context gracefully without crashing
- [ ] Widget displays correctly in both light and dark theme contexts if themes are supported
- [ ] Integration preserves existing dashboard functionality without introducing regressions

---

## REQ-E05-017: Items List Translation Status Column Integration

**Date**: 2026-01-20 17:05
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners need a translation status indicator column integrated into their Items list view that displays each item's multilingual coverage and provides quick access to translation management for individual items.

### Current Behavior
The Items list displays item details including name, room, category, and actions but provides no visibility into translation status, requiring property owners to open each item individually or navigate to separate translation pages to understand which items have complete multilingual coverage.

### Expected Behavior
The Items list includes an optional translation status column displaying the compact six-dot status indicator for each item, showing at a glance which languages have been translated, with click functionality that opens the translation preview panel for immediate review and action on translation issues.

### User Impact
Property owners can rapidly audit translation coverage across their entire item inventory without leaving the list view, identify items requiring translation attention through visual scanning of status indicators, prioritize translation work by focusing on items with the most translation gaps, and access detailed translation controls for any item through a single click on the status indicator.

### Business Value
Streamlines translation workflow management by integrating translation status into existing content management interfaces, reduces context switching between content management and translation management, and increases likelihood of complete multilingual coverage through constant visibility of translation gaps.

### Acceptance Criteria
- [ ] Translation status column is added to ItemGrid component table structure
- [ ] Column displays TranslationStatusColumn component for each item row
- [ ] Column header is labeled "Translations" with appropriate icon
- [ ] Status column displays six-dot indicator showing translation state for all supported languages
- [ ] Each dot uses standard color coding: green (complete), orange (pending), red (failed), purple (manual), gray (not started)
- [ ] Clicking the status indicator opens TranslationPreviewPanel for the corresponding item
- [ ] Preview panel displays with entity reference (entityType: 'item', entityId: item.id)
- [ ] Column can be toggled on/off through view preferences or column visibility controls
- [ ] Column visibility preference persists across user sessions
- [ ] Column width is fixed to prevent table layout fluctuations (80-100 pixels)
- [ ] Column displays loading shimmer while translation status data is being fetched
- [ ] Translation status data is fetched efficiently without separate API calls per row
- [ ] Bulk status fetch retrieves translation status for all visible items in single request
- [ ] Status indicators update in real-time when translation jobs complete
- [ ] Column is responsive and adapts display for tablet viewports (may hide on mobile)
- [ ] Column maintains consistent alignment with other table columns
- [ ] Keyboard navigation allows focusing and activating status indicators
- [ ] Status column includes proper ARIA labels for screen reader accessibility
- [ ] Column sorting functionality allows ordering items by translation completeness (optional)
- [ ] Empty state displays gracefully when item has no translation status data
- [ ] Component integration does not cause performance degradation with large item lists (100+ items)
- [ ] Column works correctly when combined with existing filters, search, and sorting
- [ ] Integration preserves existing ItemGrid functionality without introducing regressions
- [ ] Column displays correctly in both light and dark theme contexts if themes are supported

---

## REQ-E05-018: Bulk Translation Action Bar for Multi-Item Operations

**Date**: 2026-01-20 17:30
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a contextual action bar that appears when multiple content items are selected, providing bulk translation operations including re-translate all languages and re-translate specific languages with visual progress feedback.

### Current Behavior
No bulk translation operation interface exists for property owners to manage translations across multiple content items simultaneously, requiring them to open and process each item individually even when applying the same translation action to many items at once.

### Expected Behavior
A fixed-position action bar slides up from the bottom of the screen when one or more items are selected in list views, displaying the selection count and offering two primary actions: "Re-translate All" which queues translation jobs for all languages across all selected items, and "Re-translate Specific Language" which opens a language selector dialog for targeted bulk operations, with a progress indicator showing job queuing status during bulk operations and success confirmation when operations complete.

### User Impact
Property owners can efficiently refresh translations across their entire catalog when source content changes significantly, apply translation updates to multiple items simultaneously instead of processing them individually, select specific languages for bulk re-translation when only certain translations need updates, and monitor progress through clear visual feedback as bulk operations process each selected item.

### Business Value
Dramatically reduces time required to maintain multilingual content at scale, enables rapid response to content quality issues affecting multiple items, and encourages systematic translation maintenance by removing manual repetition barriers.

### Acceptance Criteria
- [ ] Action bar component appears at bottom of viewport when one or more items are selected
- [ ] Action bar slides up from bottom with smooth animation (300ms transition)
- [ ] Action bar remains fixed at bottom during page scrolling
- [ ] Selection count displays showing number of selected items (e.g., "3 items selected")
- [ ] "Re-translate All" button triggers translation jobs for all six supported languages for all selected items
- [ ] "Re-translate Specific Language" button opens language selection dialog
- [ ] Language selection dialog displays all six supported languages as selectable options
- [ ] Language selection dialog supports single or multiple language selection
- [ ] Confirming language selection queues translation jobs only for selected languages
- [ ] Progress indicator displays during bulk job creation showing "Queuing translations..."
- [ ] Progress indicator shows completion count as jobs are queued (e.g., "Processing 5 of 12 items...")
- [ ] Success notification displays when all jobs are successfully queued with total count
- [ ] Error notification displays if job creation fails for any items with specific error details
- [ ] "Cancel" or "Clear Selection" button dismisses action bar and deselects all items
- [ ] Action bar includes option to "Skip Manual Edits" preserving human-reviewed translations
- [ ] Checkbox or toggle control for "Skip Manual Edits" option is clearly labeled
- [ ] Action bar integrates with bulk re-translate API endpoint passing selected item IDs
- [ ] Component accepts array of selected item IDs as required prop
- [ ] Component accepts entity type as required prop (item, article, link)
- [ ] Component accepts onComplete callback that fires when bulk operations finish
- [ ] Component handles API errors gracefully without disrupting other selected items
- [ ] Action bar is fully keyboard accessible with proper focus management
- [ ] Action bar includes appropriate ARIA labels and roles for screen readers
- [ ] Action bar adapts to mobile viewports maintaining usability at narrow widths
- [ ] Action bar z-index ensures it overlays other content without being obscured
- [ ] Component displays loading state with disabled controls during operation
- [ ] Component provides escape hatch to cancel in-progress bulk operations if possible
- [ ] Action bar automatically dismisses after successful completion with 2-second delay
- [ ] Component integrates with ItemManager selection state management
- [ ] Component works correctly with filtered and sorted list views
- [ ] Component handles edge cases like zero selections gracefully without displaying
- [ ] Visual design matches application design system with consistent spacing and typography
- [ ] Action buttons use appropriate colors: primary action (blue), destructive action (red if applicable)

---

## REQ-E05-019: Language Selection Dialog for Targeted Bulk Operations

**Date**: 2026-01-20 17:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners need a modal dialog that displays all supported languages as selectable checkboxes when performing bulk translation operations, enabling them to choose specific language subsets for re-translation rather than always processing all languages.

### Current Behavior
No language selection interface exists for bulk translation operations, preventing property owners from applying translation updates to specific language subsets when only certain translations need refreshing or when translation budget constraints require selective processing.

### Expected Behavior
A modal dialog opens centered on the screen displaying all six supported languages as labeled checkboxes with flag icons, providing "Select All" and "Deselect All" convenience controls, and offering clearly labeled Confirm and Cancel buttons that either queue translation jobs for selected languages or dismiss the dialog without action.

### User Impact
Property owners can selectively refresh translations for specific languages when only those translations are outdated or problematic, reduce unnecessary translation API costs by avoiding re-translation of languages that don't require updates, and efficiently manage translation priorities by processing high-priority languages first through targeted selection.

### Business Value
Optimizes translation resource utilization by enabling surgical updates to specific language subsets rather than forcing wasteful full re-translation, supports flexible translation workflows that adapt to budget constraints and priority languages, and reduces overall translation costs while maintaining control over multilingual content quality.

### Acceptance Criteria
- [ ] Modal dialog uses Radix UI Dialog primitive for accessibility and focus management
- [ ] Dialog opens centered on viewport with overlay backdrop preventing interaction with underlying content
- [ ] Dialog header displays title "Select Languages for Re-translation"
- [ ] Checkbox list displays all six supported languages: English, Spanish, French, German, Italian, Portuguese
- [ ] Each language checkbox displays flag icon followed by language name label
- [ ] Each checkbox includes proper label association for accessibility
- [ ] "Select All" button checks all language checkboxes in single action
- [ ] "Deselect All" button unchecks all language checkboxes in single action
- [ ] Select All and Deselect All buttons are clearly positioned above or below checkbox list
- [ ] Confirm button is labeled "Re-translate Selected Languages" or similar action-oriented text
- [ ] Confirm button is disabled when no languages are selected
- [ ] Confirm button is enabled when one or more languages are selected
- [ ] Cancel button dismisses dialog without triggering any translation actions
- [ ] Escape key triggers cancel action and closes dialog
- [ ] Confirming selection closes dialog and returns array of selected language codes to parent component
- [ ] Component accepts onConfirm callback function that receives array of selected language codes
- [ ] Component accepts onCancel callback function that executes when dialog is dismissed
- [ ] Component accepts optional defaultSelection prop to pre-select specific languages
- [ ] Dialog maintains checkbox state during the dialog session but resets when reopened
- [ ] Component is fully keyboard accessible with proper tab order through all controls
- [ ] First interactive element (first checkbox or Select All button) receives focus when dialog opens
- [ ] Checkbox states can be toggled using Space key when focused
- [ ] Dialog returns focus to triggering element when closed
- [ ] Component includes appropriate ARIA labels and roles for screen reader accessibility
- [ ] Dialog adapts to mobile viewports maintaining full usability on small screens
- [ ] Checkbox list scrolls independently if language count exceeds viewport height
- [ ] Visual design matches application design system with consistent spacing and typography
- [ ] Language order remains consistent across all uses (alphabetical or by priority)
- [ ] Component renders correctly in both light and dark theme contexts if themes are supported
- [ ] Dialog prevents body scroll when open on mobile devices
- [ ] Component integrates seamlessly with BulkTranslationBar component

---

## REQ-E05-020: Translation Management Page with Full-Width Content Table

**Date**: 2026-01-20 08:54
**Type**: NEW FEATURE
**Size**: L

### Summary
Property owners need a dedicated translation management page that displays all their content items in a comprehensive table view with translation status indicators, filtering capabilities, and bulk selection support for efficient multilingual content management.

### Current Behavior
No centralized page exists for property owners to view and manage translations across all their content types (items, articles, links) in a single unified interface with comprehensive filtering and bulk operation capabilities.

### Expected Behavior
A full-width table page displays all content entities with columns showing entity name, type, individual language status indicators for all six supported languages, and action controls, with a filter bar above the table offering content type selection, language-specific filtering, and translation status filtering, and row selection checkboxes enabling bulk operations through integration with the bulk translation action bar.

### User Impact
Property owners can audit translation coverage across their entire content catalog from a single centralized view, filter and sort content to prioritize translation work based on status or content type, select multiple items for bulk translation operations without navigating between different content type pages, and monitor translation health through comprehensive status visibility across all languages and all content types simultaneously.

### Business Value
Provides a centralized command center for translation operations reducing the complexity of managing multilingual content at scale, enables efficient translation workflow management through powerful filtering and bulk actions, and increases translation completion rates by making gaps highly visible and actionable from a single interface.

### Acceptance Criteria
- [ ] Page route created at `/src/app/dashboard2/translations/page.tsx`
- [ ] Page layout uses full-width content area without sidebars (max-width: 100% of available space)
- [ ] Table displays all content entities accessible to the current property owner
- [ ] Table includes column for entity name displaying the item/article/link title or identifier
- [ ] Table includes column for entity type showing "Item", "Article", or "Link" with appropriate icon
- [ ] Table includes six individual columns for language status (EN, ES, FR, DE, IT, PT)
- [ ] Each language column displays status indicator using standard color scheme (green complete, orange pending, red failed, purple manual, gray not started)
- [ ] Table includes Actions column with quick access to view details, edit, or re-translate controls
- [ ] Filter bar renders above table with three filter controls in horizontal layout
- [ ] Content type filter dropdown offers options: "All Types", "Items", "Articles", "Links"
- [ ] Language filter dropdown offers options to show only content missing specific language translations
- [ ] Status filter dropdown offers options: "All", "Fully Translated", "Partially Translated", "Pending", "Failed", "Manually Edited"
- [ ] Each table row includes a checkbox for bulk selection
- [ ] Checkbox in table header selects/deselects all currently visible rows
- [ ] Selected row count displays when one or more items are selected
- [ ] BulkTranslationBar component appears when items are selected
- [ ] Table supports pagination or infinite scroll for large content catalogs (100+ items)
- [ ] Table displays loading skeleton during initial data fetch
- [ ] Table displays empty state when no content matches current filters
- [ ] Empty state includes call-to-action to create content or adjust filters
- [ ] Table is sortable by clicking column headers (name, type, translation completion)
- [ ] Clicking entity name navigates to that entity's detail/edit page
- [ ] Clicking language status cell opens TranslationPreviewPanel for that entity and language
- [ ] Page integrates with translation status API endpoint to fetch comprehensive status data
- [ ] Page implements efficient data fetching strategy to avoid loading all entities simultaneously
- [ ] Page updates in real-time when translation jobs complete through realtime subscriptions
- [ ] Table is responsive and adapts layout for tablet viewports (may stack columns or use horizontal scroll)
- [ ] Page header includes title "Translation Management" and breadcrumb navigation
- [ ] Page includes help text or tooltip explaining filtering and bulk operation capabilities
- [ ] Filter selections persist in URL query parameters for shareable filtered views
- [ ] Page is fully keyboard accessible with proper focus management and tab order
- [ ] Page includes appropriate ARIA labels and semantic HTML structure
- [ ] Table maintains scroll position when returning from entity detail pages
- [ ] Page performance remains acceptable with large datasets (response time under 3 seconds for 500+ items)
- [ ] Component handles missing or invalid property context gracefully
- [ ] Page displays correctly in both light and dark theme contexts if themes are supported

---

## REQ-E05-021: Translation Management Page Implementation

**Date**: 2026-01-20 17:55
**Type**: NEW FEATURE
**Size**: L

### Summary
Property owners need a centralized page where they can view all their content with translation status across all supported languages, filter by content type and translation status, and perform bulk translation operations.

### Current Behavior
Property owners must navigate to individual content management pages to review translation status for their items, articles, and links, with no unified view showing translation coverage across all content types simultaneously.

### Expected Behavior
A dedicated translation management page displays a full-width table showing all content entities with their names, types, and individual translation status indicators for each supported language, with filtering controls for content type, language, and translation status, and bulk selection capabilities that activate a contextual action bar for multi-item translation operations.

### User Impact
Property owners can audit translation coverage across their entire content catalog from a single centralized interface, identify translation gaps through visual scanning of status indicators, filter content to focus on items requiring translation attention, and efficiently manage translations at scale through bulk operations instead of processing items individually.

### Business Value
Reduces the time and effort required to maintain multilingual content quality across large catalogs, increases translation completion rates by making gaps highly visible and immediately actionable, and provides a scalable solution for managing translations as property content libraries grow over time.

### Acceptance Criteria
- [ ] Page displays at route `/src/app/dashboard2/translations/page.tsx`
- [ ] Table layout uses full available width without constraining sidebars
- [ ] Table shows columns for content name, content type, and individual status for all six languages
- [ ] Each language column displays a status indicator with appropriate color coding
- [ ] Filter bar above table offers content type selection with options for all types or specific types
- [ ] Filter bar offers language-specific filtering to show content missing specific translations
- [ ] Filter bar offers status filtering with options for fully translated, partially translated, pending, failed, and manually edited
- [ ] Each table row includes a selection checkbox for bulk operations
- [ ] Header checkbox selects or deselects all visible rows in current view
- [ ] Bulk translation action bar appears at bottom of screen when items are selected
- [ ] Clicking content name navigates to that content's detail or edit page
- [ ] Clicking a language status indicator opens the translation preview panel for that specific content and language
- [ ] Table displays loading state while fetching translation status data
- [ ] Table displays empty state when no content matches applied filters
- [ ] Table supports sorting by content name, type, or translation completion percentage
- [ ] Translation status updates automatically when jobs complete without requiring page refresh
- [ ] Filter selections persist in browser session during navigation
- [ ] Page performs efficiently with large content catalogs containing hundreds of items
- [ ] Page is fully keyboard accessible with logical tab order and focus management
- [ ] Page includes proper ARIA labels for screen reader accessibility
- [ ] Page layout adapts responsively for tablet and mobile viewports

---


## REQ-E05-022: Navigation Link Integration for Translation Management Page

**Date**: 2026-01-20 18:15
**Type**: ENHANCEMENT
**Size**: S

### Summary
Property owners need direct access to the translation management page through a navigation item in the dashboard layout without having to manually enter URLs or discover the feature through indirect means.

### Current Behavior
The translation management page exists at the route but is not discoverable through the dashboard navigation menu, requiring property owners to know the direct URL or find links from other pages to access translation management features.

### Expected Behavior
The dashboard navigation includes a clearly labeled "Translations" navigation item with an appropriate icon (Languages or Globe) that navigates directly to the translation management page, positioned either as a top-level navigation item or as a sub-item under the settings or content management section, ensuring property owners can access translation features through standard navigation patterns.

### User Impact
Property owners can discover and access translation management features through intuitive navigation without searching or guessing URLs, benefit from consistent navigation patterns matching other dashboard features, and efficiently navigate to translation tools as part of their regular content management workflow.

### Business Value
Increases feature discoverability and adoption by making translation management accessible through standard navigation, encourages proactive translation maintenance by reducing access friction, and aligns with user expectations for feature organization within the dashboard interface.

### Acceptance Criteria
- [ ] Navigation item labeled "Translations" is added to dashboard navigation structure
- [ ] Navigation item uses Languages icon or Globe icon from icon library
- [ ] Navigation item appears in a logical position within existing navigation hierarchy
- [ ] Navigation item may be positioned as top-level item or sub-item under Settings depending on navigation structure
- [ ] Clicking navigation item navigates to `/dashboard2/translations` route
- [ ] Navigation item highlights as active when user is on translation management page
- [ ] Navigation item is visible to all authenticated property owners with content access
- [ ] Navigation item maintains consistent styling with other navigation items
- [ ] Navigation item includes appropriate ARIA labels for accessibility
- [ ] Navigation item is keyboard accessible through standard tab navigation
- [ ] Navigation item works correctly in both collapsed and expanded sidebar states
- [ ] Navigation item adapts appropriately for mobile viewport navigation patterns
- [ ] Navigation item positioning does not disrupt existing navigation organization
- [ ] Navigation change is implemented in `/src/app/dashboard2/layout.tsx` file
- [ ] Navigation item displays correctly in both light and dark theme contexts if themes are supported

---

## REQ-E05-023: Manual Edit Preservation Warning Dialog

**Date**: 2026-01-20 18:25
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a warning dialog that appears when source content has been updated and manual translations exist, allowing them to choose between preserving human-reviewed edits or re-translating all content.

### Current Behavior
When source content changes, the system may overwrite manually edited translations without warning property owners, resulting in loss of human-reviewed content refinements and cultural adaptations that required time and expertise to create.

### Expected Behavior
A modal dialog appears when source content updates are detected for items with existing manual translations, displaying a clear warning message about the pending content change, listing all languages that have manual edits at risk of being overwritten, and offering two distinct action paths with explicit consequences: keep existing manual edits (requiring manual review later) or re-translate all languages (discarding manual work).

### User Impact
Property owners can make informed decisions about preserving valuable human-reviewed translations when content changes, understand which languages will be affected before taking action, avoid accidental loss of translation work that required significant time or cultural expertise, and choose appropriate workflows based on whether content changes are minor edits or major rewrites requiring full re-translation.

### Business Value
Protects investment in professional or human-reviewed translations by preventing accidental overwrites, reduces frustration from losing manual translation work, and supports flexible workflows that respect both automation efficiency and human translation quality.

### Acceptance Criteria
- [ ] Dialog uses Radix UI Dialog primitive for accessibility and focus management
- [ ] Dialog displays when source content update is detected for entity with manual translations
- [ ] Dialog opens centered on viewport with overlay backdrop preventing interaction with underlying content
- [ ] Warning message clearly explains that source content has changed and manual translations may become outdated
- [ ] Language list displays all languages that currently have manual translation status
- [ ] Each listed language displays flag icon and language name for easy recognition
- [ ] "Keep Manual Edits" button preserves all existing manual translations without modification
- [ ] "Keep Manual Edits" button includes helper text explaining that manual review may be needed later
- [ ] "Re-translate All" button queues new translation jobs for all listed manual languages
- [ ] "Re-translate All" button displays additional confirmation message emphasizing that manual work will be discarded
- [ ] "Re-translate All" action shows secondary confirmation dialog before proceeding with destructive action
- [ ] Both action buttons are clearly labeled with action-oriented text describing outcome
- [ ] Dialog includes "Cancel" option that dismisses dialog without saving source content changes
- [ ] Cancel action returns user to content edit view to reconsider changes
- [ ] Dialog displays count of affected languages in heading (e.g., "3 manual translations will be affected")
- [ ] Component accepts entity reference (entityType, entityId) as required props
- [ ] Component accepts array of affected language codes as required prop
- [ ] Component accepts onKeepManual callback function executed when user chooses to preserve edits
- [ ] Component accepts onRetranslate callback function executed when user confirms re-translation
- [ ] Component accepts onCancel callback function executed when dialog is dismissed
- [ ] Escape key triggers cancel action and closes dialog
- [ ] Dialog maintains focus trap preventing interaction with content behind overlay
- [ ] First interactive element receives focus when dialog opens
- [ ] Dialog returns focus to triggering element when closed
- [ ] Component is fully keyboard accessible with logical tab order through all controls
- [ ] Component includes appropriate ARIA labels and roles for screen reader accessibility
- [ ] Warning icon displays at top of dialog to emphasize importance of decision
- [ ] Visual hierarchy makes consequences of each action clear through layout and typography
- [ ] Dialog adapts to mobile viewports maintaining full usability on small screens
- [ ] Language list scrolls independently if affected language count exceeds viewport height
- [ ] Dialog styling matches application design system with consistent spacing and colors
- [ ] "Keep Manual Edits" button uses secondary or neutral styling (gray or white)
- [ ] "Re-translate All" button uses warning styling (orange or yellow) to indicate caution
- [ ] Component renders correctly in both light and dark theme contexts if themes are supported
- [ ] Dialog prevents body scroll when open on mobile devices
- [ ] Component integrates with content save workflows in item, article, and link editors

---

## REQ-E05-024: Stale Translation Visual Indicator

**Date**: 2026-01-20 18:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners need visual indicators showing when translations have become stale due to source content changes, allowing them to identify outdated translations requiring review or regeneration.

### Current Behavior
Translation status displays show whether translations are complete, pending, or failed, but provide no indication when completed translations have become outdated because source content was modified after the translation was created.

### Expected Behavior
Translation status components display a distinct stale warning indicator using a yellow border or icon when the source content modification timestamp is more recent than the translation creation timestamp, marking the translation as potentially outdated and requiring attention.

### User Impact
Property owners can identify which translations need review after source content updates without manually tracking modification dates, understand which completed translations may contain outdated information for guests, prioritize translation refresh work based on content staleness rather than only status, and maintain translation accuracy over time as content evolves through clear visual signals.

### Business Value
Prevents guests from seeing outdated translated content that no longer matches current source information, maintains translation quality standards as content evolves over time, and reduces the risk of miscommunication through stale translations that have not kept pace with source content changes.

### Acceptance Criteria
- [ ] TranslationStatusItem component displays stale indicator when source_version_at timestamp is newer than translation created_at timestamp
- [ ] Stale indicator uses yellow or orange color (#f59e0b or #fbbf24) to distinguish from other status colors
- [ ] Stale indicator displays as yellow border around the entire status row or language cell
- [ ] Stale warning icon (alert triangle or clock with exclamation) displays alongside translation status
- [ ] Stale status takes visual precedence over other status indicators (complete, manual, etc.) through combined display
- [ ] Status label updates to show "Stale" or "Outdated" in addition to current translation status
- [ ] Stale translations display status as "Complete (Stale)" or "Manual (Stale)" combining both states
- [ ] "Update Translation" action button appears in addition to standard edit and re-translate actions
- [ ] "Update Translation" button is prominently displayed when stale state is detected
- [ ] "Update Translation" action queues new translation job to refresh the outdated content
- [ ] Clicking "Update Translation" triggers re-translation only for the specific stale language
- [ ] Confirmation dialog appears for manually edited stale translations before overwriting
- [ ] Stale indicator includes tooltip explaining why translation is marked as stale on hover
- [ ] Tooltip displays source content update date and translation creation date for comparison
- [ ] Translation status column in table views shows yellow dot indicator for stale translations
- [ ] Translation preview panel displays stale warning banner at top when opened for stale translation
- [ ] Dashboard translation widget includes count of stale translations in status summary
- [ ] Filter dropdown includes "Stale Translations" option to show only outdated content
- [ ] Stale translation count displays separately from other status counts in statistics views
- [ ] Component calculates staleness by comparing source_version_at with translation created_at from database
- [ ] Stale indicator only displays when both timestamps are available for comparison
- [ ] Translations created before source_version_at tracking was implemented do not show stale indicators
- [ ] Stale status updates immediately when source content is modified through realtime subscriptions
- [ ] Stale indicator disappears when translation is refreshed and new timestamp is more recent than source
- [ ] Component accepts source modification timestamp as optional prop
- [ ] Component accepts translation creation timestamp as required prop
- [ ] Visual hierarchy ensures stale indicator is immediately noticeable without being disruptive
- [ ] Color contrast meets WCAG accessibility standards for yellow warning indicators
- [ ] Stale indicator works correctly in both light and dark theme contexts
- [ ] Component styling remains consistent with application design system
- [ ] Keyboard focus states clearly indicate stale translations through focus ring styling

---

## REQ-E05-025: Manual Edit Warning Integration into Content Save Flow

**Date**: 2026-01-20 19:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners need automatic detection of manual translations when saving content changes, with immediate presentation of the warning dialog to make informed decisions about preserving or replacing human-reviewed translations.

### Current Behavior
Content save operations proceed without checking for existing manual translations, allowing source content updates to create stale translations without giving property owners an opportunity to decide whether to preserve manual edits or trigger re-translation.

### Expected Behavior
When a property owner saves changes to source content, the system checks whether any translations have manual status, and if detected, displays the manual edit preservation warning dialog before completing the save operation, allowing the owner to choose between preserving existing manual translations or queuing re-translation jobs for affected languages.

### User Impact
Property owners receive immediate notification when content changes will affect manual translations, can make informed decisions about translation workflows at the moment of content update, avoid accidentally creating stale translations without awareness, and choose appropriate actions based on the scope of their content changes.

### Business Value
Prevents unintended loss of valuable manual translation work, ensures property owners are aware of translation implications when updating content, and supports flexible workflows that balance automation efficiency with protection of human-reviewed content quality.

### Acceptance Criteria
- [ ] Article save handler checks for existing manual translations before persisting content changes
- [ ] Item save handler checks for existing manual translations before persisting content changes
- [ ] Link save handler checks for existing manual translations before persisting content changes
- [ ] System queries translation tables filtered by entity reference and manual status
- [ ] Manual translation check executes only when source content fields have changed
- [ ] Check ignores metadata-only updates that do not affect translatable content
- [ ] Warning dialog displays when one or more manual translations are detected
- [ ] Dialog shows complete list of affected languages with manual status
- [ ] Dialog passes entity reference and affected language codes to component props
- [ ] Save operation pauses until dialog action is selected by property owner
- [ ] Choosing "Keep Manual Edits" completes save without triggering translation jobs
- [ ] Choosing "Re-translate All" completes save and queues translation jobs for affected languages
- [ ] Choosing "Cancel" aborts save operation and returns to edit view
- [ ] Translation jobs receive priority flag when manually triggered via dialog
- [ ] System updates source_version_at timestamp in translation records after save
- [ ] Manual translations marked as stale when source_version_at timestamp updates
- [ ] Integration preserves existing save validation logic and error handling
- [ ] Warning dialog appears before any database commits occur
- [ ] Failed translation job creation does not prevent content save completion
- [ ] Success notification displays after save indicating whether translations were queued
- [ ] Component handles concurrent save attempts gracefully with proper locking
- [ ] Integration works correctly with autosave functionality if enabled
- [ ] Manual check query performance remains acceptable (response time under 500ms)
- [ ] System logs all dialog interactions and decisions for audit purposes
- [ ] Feature can be disabled via feature flag for gradual rollout if needed
- [ ] Integration does not affect save performance for content without manual translations
- [ ] Dialog state persists correctly if user navigates away during decision process
- [ ] Component handles edge cases like deleted translations gracefully
- [ ] Integration maintains accessibility standards for dialog presentation
- [ ] Feature works consistently across article editor, item editor, and link editor interfaces

---

## REQ-E05-026: Language Preference Section Component

**Date**: 2026-01-20 21:33
**Type**: NEW FEATURE
**Size**: M

### Summary
Property owners need a dedicated settings section where they can select their preferred language for dashboard interface translations, save their preference with clear feedback, and understand how the language setting affects their experience.

### Current Behavior
No dedicated language preference component exists within the translation management interface, leaving property owners without a clear, centralized location to manage their own language preferences for the owner-facing dashboard experience.

### Expected Behavior
A standalone settings section displays a labeled dropdown selector containing all six supported languages (English, Spanish, French, German, Italian, Portuguese), a save button that provides visual loading feedback during preference persistence, and explanatory help text clarifying that this setting controls the owner's dashboard language rather than guest-facing content translations.

### User Impact
Property owners can easily select their preferred interface language from a clear, discoverable location, receive immediate visual confirmation when saving their preference through loading states and success notifications, and understand through contextual help text exactly what the language preference setting controls versus guest content translation settings.

### Business Value
Improves owner experience by providing intuitive language customization controls, reduces confusion about the distinction between interface language and content translation settings, and supports international property owners who prefer managing their dashboard in their native language.

### Acceptance Criteria
- [ ] Component renders as a self-contained settings section with clear visual boundaries
- [ ] Section header displays "Language Preference" or equivalent descriptive title
- [ ] Dropdown selector displays all six supported languages: English, Spanish, French, German, Italian, Portuguese
- [ ] Each dropdown option displays language name with corresponding flag icon for visual recognition
- [ ] Dropdown selection persists in component state until explicitly saved
- [ ] Save button displays adjacent to or below the dropdown selector
- [ ] Save button shows loading spinner or indicator during preference save operation
- [ ] Save button is disabled while save operation is in progress to prevent duplicate submissions
- [ ] Save button is disabled when no changes have been made to current selection
- [ ] Success notification displays after preference is successfully saved
- [ ] Error notification displays with actionable message if save operation fails
- [ ] Help text explains that this setting controls the owner dashboard interface language
- [ ] Help text clarifies that content translation settings are managed separately
- [ ] Help text displays below the dropdown in muted or secondary text styling
- [ ] Component fetches current language preference on mount and sets dropdown default
- [ ] Component displays loading skeleton while fetching initial preference value
- [ ] Component handles missing or invalid stored preferences gracefully with sensible defaults
- [ ] Component integrates with account preferences API endpoint for persistence
- [ ] Language change takes effect immediately after successful save without requiring page refresh
- [ ] Component is fully keyboard accessible with proper focus management
- [ ] Dropdown can be navigated using arrow keys and selection confirmed with Enter
- [ ] Component includes appropriate ARIA labels for screen reader accessibility
- [ ] Component adapts responsively for mobile viewports with appropriate touch targets
- [ ] Visual design matches application design system patterns for settings sections
- [ ] Component displays correctly in both light and dark theme contexts if themes are supported
- [ ] Component can be integrated into account settings page or profile section

---

## REQ-E05-027: Account Language Preference API Endpoint

**Date**: 2026-01-20 22:15
**Type**: NEW FEATURE
**Size**: S

### Summary
Property owners need a server-side API endpoint to persist and retrieve their preferred language setting for the dashboard interface, enabling the language preference to be saved to their account and accessed across devices.

### Current Behavior
No API endpoint exists for property owners to save or retrieve their preferred dashboard interface language, preventing the language preference setting from being persisted across browser sessions or synchronized across multiple devices where they access the dashboard.

### Expected Behavior
A PUT endpoint at the account preferences route accepts a language preference payload and validates that the requesting user has permission to modify the specified account, persists the preference to the accounts table, and returns the updated account record confirming the change has been saved successfully.

### User Impact
Property owners can set their preferred dashboard language once and have that preference automatically applied every time they access the dashboard from any device, experience consistent language preferences across browser sessions without re-selecting their language repeatedly, and trust that their language customization will persist as a stored account setting rather than temporary browser state.

### Business Value
Provides foundation for personalized language experiences across the owner dashboard, reduces friction for international property owners who would otherwise need to repeatedly change language settings, and enables future expansion of account-level localization preferences beyond just language selection.

### Acceptance Criteria
- [ ] PUT endpoint created at route: `/src/app/api/accounts/[accountId]/preferences/route.ts`
- [ ] Endpoint accepts accountId as path parameter extracted from URL
- [ ] Request body accepts preferredLanguage field containing ISO 639-1 language code
- [ ] Request body validates that preferredLanguage value is one of six supported languages: en, es, fr, de, it, pt
- [ ] Endpoint validates that authenticated user has ownership access to the specified account
- [ ] Unauthorized access attempts return 403 Forbidden with clear error message
- [ ] Invalid account references return 404 Not Found with appropriate error message
- [ ] Invalid language codes return 400 Bad Request with validation error details
- [ ] Endpoint updates the preferredLanguage column in the accounts table
- [ ] Database update operation is atomic and handles concurrent updates safely
- [ ] Successful update returns 200 OK with complete updated account record in response body
- [ ] Response includes updated timestamp showing when preference was modified
- [ ] Endpoint handles database errors gracefully returning 500 Internal Server Error with logged details
- [ ] Endpoint supports GET method to retrieve current account preferences including preferredLanguage
- [ ] GET request validates account access before returning preference data
- [ ] Endpoint performance remains acceptable with response time under 500ms
- [ ] Request validation uses Zod schema for type safety and consistent error messages
- [ ] Endpoint integrates with existing authentication middleware to identify requesting user
- [ ] Endpoint logs all preference update operations for audit purposes
- [ ] API endpoint includes rate limiting to prevent abuse (reasonable limit: 10 requests per minute per user)
- [ ] Endpoint supports CORS headers if frontend and API are on different domains
- [ ] Database migration adds preferredLanguage column to accounts table if it does not exist
- [ ] Column definition allows NULL values for backward compatibility with existing accounts
- [ ] Default value is NULL or 'en' for accounts without explicit preference
- [ ] Endpoint includes appropriate TypeScript types for request and response payloads
- [ ] Integration tests verify permission validation prevents unauthorized access
- [ ] Integration tests verify successful preference updates persist to database
- [ ] Integration tests verify invalid language codes are rejected with appropriate errors
- [ ] API documentation clearly specifies request format, validation rules, and response structure
- [ ] Endpoint follows existing API conventions for error response format and status codes

---

## REQ-E05-028: Language Preference Section Integration into Account Settings

**Date**: 2026-01-20 22:25
**Type**: ENHANCEMENT
**Size**: S

### Summary
Property owners need access to the language preference component through the account settings interface, enabling them to customize their dashboard language as part of their standard profile configuration.

### Current Behavior
The language preference component exists but is not integrated into any accessible page location, preventing property owners from discovering or utilizing the language customization feature without direct navigation or external links.

### Expected Behavior
The account settings page includes the language preference section component positioned within the settings layout in a logical grouping with other personalization or regional preferences, displaying the current language selection pre-populated from account data and allowing changes to be saved directly from the settings interface.

### User Impact
Property owners can discover language preference settings through natural exploration of account settings, adjust their preferred dashboard language alongside other account preferences in a consolidated interface, and access language customization through established navigation patterns without needing to learn specialized routes.

### Business Value
Increases feature adoption by making language preferences discoverable through standard settings navigation, aligns with user expectations that language settings are found within account configuration pages, and reduces support burden by placing preferences in intuitive locations.

### Acceptance Criteria
- [ ] LanguagePreferenceSection component is imported into account settings page
- [ ] Component renders within settings page layout in appropriate section grouping
- [ ] Component displays under "Preferences" or "Regional Settings" section heading
- [ ] Component appears before or after related settings like timezone or date format preferences
- [ ] Component receives authenticated user's account ID as required prop
- [ ] Component pre-populates dropdown with current language preference from account data
- [ ] Settings page displays loading state while fetching account preferences
- [ ] Settings page handles missing preferences gracefully with default language selection
- [ ] Component save operation integrates with account preferences API endpoint
- [ ] Success notification displays within settings page context after preference save
- [ ] Error handling displays appropriate messages within settings page layout
- [ ] Settings page layout does not shift or reflow when language preference changes
- [ ] Component maintains consistent styling with other settings section components
- [ ] Component spacing and padding matches other settings sections
- [ ] Integration preserves existing settings page functionality without regressions
- [ ] Settings page remains responsive with language preference section added
- [ ] Component displays correctly in both light and dark theme contexts if themes are supported
- [ ] Keyboard navigation flows logically through settings controls including language preference
- [ ] ARIA labels and semantic structure maintain accessibility standards across entire settings page
- [ ] Integration can be toggled via feature flag for gradual rollout if needed
- [ ] Alternative integration location in user profile page is considered if more appropriate than settings

---

## REQ-E05-029: Translation Preview Panel Integration into Article Editor

**Date**: 2026-01-20 22:35
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners need the translation preview panel to automatically display within the article editor after saving content changes, showing translation status for all languages and providing immediate access to translation management actions.

### Current Behavior
The article editor save flow completes without displaying translation status information, requiring property owners to navigate to separate translation management pages or use other interfaces to review translation coverage for articles they just created or updated.

### Expected Behavior
After saving an article in the editor, the translation preview panel automatically slides in from the right side of the screen displaying the article's translation status across all six supported languages, with the panel opening immediately when pending translations exist and remaining closed when translations are already complete unless explicitly opened through a dedicated control button.

### User Impact
Property owners can immediately review translation status after updating article content without leaving the editor context, understand which language translations are processing or require attention right after save completion, take immediate corrective actions on failed translations without navigation overhead, and maintain efficient workflows by staying in the editor while managing translation tasks.

### Business Value
Streamlines the content creation workflow by integrating translation management directly into the editing experience, encourages property owners to verify translation coverage immediately after content updates rather than forgetting to check later, and reduces context switching between editing and translation management interfaces.

### Acceptance Criteria
- [ ] TranslationPreviewPanel component is integrated into article editor page
- [ ] Panel component receives article entity reference (entityType: 'article', entityId: articleId)
- [ ] Panel state management controls when panel is visible or hidden
- [ ] Panel automatically opens after successful article save operation completes
- [ ] Panel auto-open logic checks if any translation jobs are pending or failed
- [ ] Panel opens automatically only when pending or failed translations exist
- [ ] Panel remains closed after save when all translations are complete and up-to-date
- [ ] Manual toggle button displays in article editor header or toolbar area
- [ ] Manual toggle button shows "View Translations" or similar descriptive label
- [ ] Clicking toggle button opens panel regardless of automatic open conditions
- [ ] Panel slide-in animation triggers smoothly without disrupting editor layout
- [ ] Panel overlays editor content without causing layout reflow or shifting
- [ ] Panel remains accessible while editor is in edit mode for parallel workflows
- [ ] Panel close button dismisses panel and returns focus to editor content
- [ ] Clicking overlay backdrop outside panel closes panel
- [ ] Panel updates in real-time as translation jobs complete through subscriptions
- [ ] Panel integration preserves existing article editor save functionality
- [ ] Panel open state does not interfere with editor autosave if enabled
- [ ] Panel displays loading state while fetching translation status after save
- [ ] Panel handles error states gracefully if status fetch fails
- [ ] Panel shows empty state appropriately for newly created articles without translations yet
- [ ] Panel action buttons (edit, re-translate, retry) function correctly within editor context
- [ ] Edit translation action opens editor modal without conflicting with article editor
- [ ] Re-translate action triggers translation jobs and updates panel status
- [ ] Panel width (400px) does not obscure critical editor controls on standard viewports
- [ ] Panel adapts responsively for tablet viewports maintaining usability
- [ ] Panel component accepts optional onClose callback for editor state management
- [ ] Integration includes keyboard shortcuts for opening/closing panel (e.g., Alt+T)
- [ ] Panel keyboard accessibility works correctly within editor context
- [ ] Focus management handles transitions between editor and panel appropriately
- [ ] Panel z-index ensures it overlays editor content without being obscured by other UI elements
- [ ] Integration maintains editor performance without noticeable lag during panel operations
- [ ] Component handles edge cases like deleted articles or missing permissions gracefully
- [ ] Panel displays correctly in both light and dark theme contexts if themes are supported
- [ ] Integration follows consistent patterns with item editor translation panel integration

---

## REQ-E05-030: Translation Preview Panel Integration into Item Editor

**Date**: 2026-01-20 23:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners need the translation preview panel to automatically display within the item editor after saving content changes, showing translation status for all languages and providing immediate access to translation management actions.

### Current Behavior
The item editor save flow completes without displaying translation status information, requiring property owners to navigate to separate translation management pages or use other interfaces to review translation coverage for items they just created or updated.

### Expected Behavior
After saving an item in the editor, the translation preview panel automatically slides in from the right side of the screen displaying the item's translation status across all six supported languages, with the panel opening immediately when pending translations exist and remaining closed when translations are already complete unless explicitly opened through a dedicated control button.

### User Impact
Property owners can immediately review translation status after updating item content without leaving the editor context, understand which language translations are processing or require attention right after save completion, take immediate corrective actions on failed translations without navigation overhead, and maintain efficient workflows by staying in the editor while managing translation tasks.

### Business Value
Streamlines the content creation workflow by integrating translation management directly into the editing experience, encourages property owners to verify translation coverage immediately after content updates rather than forgetting to check later, and reduces context switching between editing and translation management interfaces.

### Acceptance Criteria
- [ ] TranslationPreviewPanel component is integrated into item editor page at `/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- [ ] Panel component receives item entity reference (entityType: 'item', entityId: itemId)
- [ ] Panel state management controls when panel is visible or hidden
- [ ] Panel automatically opens after successful item save operation completes
- [ ] Panel auto-open logic checks if any translation jobs are pending or failed
- [ ] Panel opens automatically only when pending or failed translations exist
- [ ] Panel remains closed after save when all translations are complete and up-to-date
- [ ] Manual toggle button displays in item editor header or toolbar area
- [ ] Manual toggle button shows "View Translations" or similar descriptive label
- [ ] Clicking toggle button opens panel regardless of automatic open conditions
- [ ] Panel slide-in animation triggers smoothly without disrupting editor layout
- [ ] Panel overlays editor content without causing layout reflow or shifting
- [ ] Panel remains accessible while editor is in edit mode for parallel workflows
- [ ] Panel close button dismisses panel and returns focus to editor content
- [ ] Clicking overlay backdrop outside panel closes panel
- [ ] Panel updates in real-time as translation jobs complete through subscriptions
- [ ] Panel integration preserves existing item editor save functionality
- [ ] Panel open state does not interfere with editor autosave if enabled
- [ ] Panel displays loading state while fetching translation status after save
- [ ] Panel handles error states gracefully if status fetch fails
- [ ] Panel shows empty state appropriately for newly created items without translations yet
- [ ] Panel action buttons (edit, re-translate, retry) function correctly within editor context
- [ ] Edit translation action opens editor modal without conflicting with item editor
- [ ] Re-translate action triggers translation jobs and updates panel status
- [ ] Panel width (400px) does not obscure critical editor controls on standard viewports
- [ ] Panel adapts responsively for tablet viewports maintaining usability
- [ ] Panel component accepts optional onClose callback for editor state management
- [ ] Integration includes keyboard shortcuts for opening/closing panel (e.g., Alt+T)
- [ ] Panel keyboard accessibility works correctly within editor context
- [ ] Focus management handles transitions between editor and panel appropriately
- [ ] Panel z-index ensures it overlays editor content without being obscured by other UI elements
- [ ] Integration maintains editor performance without noticeable lag during panel operations
- [ ] Component handles edge cases like deleted items or missing permissions gracefully
- [ ] Panel displays correctly in both light and dark theme contexts if themes are supported
- [ ] Integration follows consistent patterns with article editor translation panel integration from REQ-E05-029

---

## REQ-E05-031: Comprehensive Loading States and Error Handling for Translation Management UI

**Date**: 2026-01-20 23:45
**Type**: ENHANCEMENT
**Size**: L

### Summary
All translation management components need consistent loading states with proper spinners and error handling with actionable retry mechanisms to provide users with clear feedback during asynchronous operations and recovery paths when operations fail.

### Current Behavior
Translation management components may lack consistent loading indicators during data fetching or API operations, display generic or unhelpful error messages when API calls fail, and provide no mechanism for users to retry failed operations without refreshing the page or re-navigating.

### Expected Behavior
Every component displaying translation data shows skeleton loaders or spinner indicators during initial data fetch, API mutation operations display inline loading states with disabled controls to prevent duplicate submissions, all API failures present user-friendly error messages explaining what went wrong in non-technical language, and actionable retry buttons allow users to re-attempt failed operations without losing context or requiring page navigation.

### User Impact
Property owners understand when the system is processing their requests through clear visual feedback, never wonder whether an action is working or stalled due to missing loading indicators, receive helpful guidance when operations fail explaining the issue and how to resolve it, can recover from transient failures immediately through retry mechanisms without losing work or re-navigating, and experience a polished interface that handles edge cases gracefully rather than appearing broken or unresponsive.

### Business Value
Reduces user frustration and support burden by providing clear feedback and self-service recovery options, builds user confidence in the translation management system through professional error handling, prevents data loss or confusion from unclear system states, and improves overall user satisfaction by handling failures gracefully rather than forcing users to troubleshoot or contact support.

### Acceptance Criteria
- [ ] TranslationPreviewPanel displays skeleton loader for language status rows during initial data fetch
- [ ] TranslationStatusWidget shows shimmer effect on progress bar and counts during dashboard load
- [ ] TranslationStatusColumn in table views displays loading dots or shimmer while fetching status
- [ ] Language preference dropdown shows spinner icon during preference save operation
- [ ] Translation editor modal displays loading overlay with spinner during save operation
- [ ] Bulk translation action bar shows progress indicator during job queue creation
- [ ] All API mutation operations disable action buttons while request is in flight
- [ ] Disabled buttons display loading spinner or text change (e.g., "Saving..." instead of "Save")
- [ ] Loading states use consistent spinner component or animation pattern across all components
- [ ] Loading indicators maintain minimum display time (300ms) to prevent flashing on fast connections
- [ ] Error messages display in toast notifications for transient failures (network errors, timeouts)
- [ ] Error messages display as inline alerts for contextual failures (validation errors, permission issues)
- [ ] All error messages avoid technical jargon and use plain language explaining the issue
- [ ] Error messages include specific guidance on resolution when applicable (e.g., "Check your connection and try again")
- [ ] 403 Forbidden errors display message: "You don't have permission to perform this action"
- [ ] 404 Not Found errors display message: "The requested content could not be found"
- [ ] 500 Server errors display message: "Something went wrong on our end. Please try again in a moment."
- [ ] Network timeout errors display message: "The request took too long. Please check your connection and try again."
- [ ] Every error state includes a retry button or action to re-attempt the failed operation
- [ ] Retry buttons preserve the original context and parameters of the failed operation
- [ ] Retry actions implement exponential backoff to avoid overwhelming failing services
- [ ] Maximum retry attempts are limited (3 attempts) with clear messaging after final failure
- [ ] Critical errors that cannot be recovered display contact support option with error reference ID
- [ ] Translation status fetch failures show error state in place of status indicators with retry option
- [ ] Translation save failures keep editor modal open with error message and allow user to retry
- [ ] Bulk operation failures provide detailed breakdown showing which items succeeded vs failed
- [ ] Partial bulk operation failures allow retry of only the failed items without re-processing successes
- [ ] Language preference save failures display error toast and revert dropdown to previous value
- [ ] Failed translation job creation attempts log errors but don't block content save completion
- [ ] Real-time subscription connection errors display subtle warning indicator without disrupting UI
- [ ] Subscription reconnection attempts happen automatically in background with status indicator
- [ ] Empty state messages display when filters produce zero results (distinct from error states)
- [ ] Loading skeletons match the approximate layout and size of loaded content to prevent layout shift
- [ ] Error boundaries catch unexpected React errors and display fallback UI with reload option
- [ ] All asynchronous operations include timeout handling (30 seconds for data fetch, 60 seconds for mutations)
- [ ] Loading and error states are fully accessible with appropriate ARIA live regions and roles
- [ ] Screen readers announce loading states and error messages without requiring user navigation
- [ ] Color is not the only indicator of error states (icons and text labels always accompany color coding)
- [ ] Error styling meets WCAG contrast requirements for text readability
- [ ] Component unit tests verify loading states display correctly during async operations
- [ ] Component unit tests verify error states display with appropriate messaging
- [ ] Integration tests verify retry mechanisms successfully re-attempt failed operations
- [ ] Error logging captures sufficient context for debugging (user ID, operation type, error details)
- [ ] Loading performance remains acceptable with multiple components loading simultaneously
- [ ] Visual design of loading states and error messages matches application design system

---

## REQ-E05-032: Accessibility Features for Translation Management Components

**Date**: 2026-01-20 23:55
**Type**: ENHANCEMENT
**Size**: M

### Summary
Property owners using assistive technology need translation management components that are fully accessible through keyboard navigation, screen reader announcements, proper ARIA labeling, and focus management to ensure equal access to translation features.

### Current Behavior
Translation management components may display visual information about translation status but lack sufficient ARIA labels, keyboard navigation support, screen reader announcements for status changes, or proper focus management in modal interactions, creating barriers for property owners who rely on assistive technology.

### Expected Behavior
All translation status icons include descriptive ARIA labels identifying the language and status state, the translation preview panel supports complete keyboard navigation with logical tab order and escape key dismissal, translation status changes trigger screen reader announcements through ARIA live regions, and translation management modals implement proper focus trapping that moves focus to the first interactive element on open and returns focus to the triggering element on close.

### User Impact
Property owners who use screen readers can understand translation status through descriptive announcements rather than relying on visual indicators alone, users who navigate via keyboard can access all translation management features without requiring mouse interaction, status change notifications are perceivable to users with visual impairments through screen reader announcements, and modal dialogs maintain predictable focus behavior that prevents keyboard users from becoming trapped or disoriented.

### Business Value
Ensures the translation management system is accessible to all property owners regardless of ability, meets WCAG accessibility standards reducing legal compliance risks, expands the potential user base by supporting assistive technology users, and demonstrates commitment to inclusive design principles that benefit all users through improved usability patterns.

### Acceptance Criteria
- [ ] Translation status icons include ARIA labels describing status: "English translation complete", "Spanish translation pending", "French translation failed"
- [ ] Each status icon uses role="img" or role="status" with descriptive aria-label attribute
- [ ] Translation status colors are never the only indicator (always accompanied by icon shapes and text labels)
- [ ] Color contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text and UI components)
- [ ] TranslationPreviewPanel is fully keyboard navigable with sequential tab order through all interactive elements
- [ ] Panel can be dismissed using Escape key from any focused element within panel
- [ ] Panel implements focus trap preventing tab navigation from leaving panel while open
- [ ] Panel sets focus to first actionable element (close button or first language row) when opened
- [ ] Panel returns focus to the triggering element (status indicator or button) when closed
- [ ] Each language row in preview panel is keyboard accessible via Tab key navigation
- [ ] Language row actions (Edit, Re-translate, Retry) can be activated via Enter or Space key
- [ ] Status change notifications use ARIA live regions with aria-live="polite" attribute
- [ ] Screen reader announces when translation job completes: "Spanish translation completed successfully"
- [ ] Screen reader announces when translation job fails: "German translation failed, retry available"
- [ ] Screen reader announces when bulk translation operation completes: "5 translation jobs queued successfully"
- [ ] TranslationEditor modal implements focus trap preventing focus from leaving modal while open
- [ ] Modal sets initial focus to translation textarea on open for immediate editing
- [ ] Modal returns focus to triggering edit button when closed via save or cancel
- [ ] Modal can be dismissed via Escape key triggering cancel workflow with confirmation if dirty
- [ ] Language selection dialog maintains focus trap within checkbox list and action buttons
- [ ] Dialog sets focus to first checkbox or "Select All" button when opened
- [ ] Dialog checkbox states can be toggled using Space key when focused
- [ ] Dialog confirm button can be activated via Enter key when focused and enabled
- [ ] Bulk translation action bar is keyboard accessible with tab order through all controls
- [ ] Action bar buttons include descriptive aria-labels: "Re-translate all selected items in all languages"
- [ ] TranslationStatusColumn indicators are keyboard focusable with visible focus ring styling
- [ ] Status column indicators can be activated via Enter or Space key to open preview panel
- [ ] Translation status filter dropdown is fully keyboard navigable with arrow key option selection
- [ ] Dropdown options can be selected via Enter or Space key when focused
- [ ] Dashboard translation widget includes semantic HTML structure with proper heading hierarchy
- [ ] Widget progress bar uses role="progressbar" with aria-valuenow, aria-valuemin, aria-valuemax attributes
- [ ] Widget status counts use semantic elements with aria-labels describing metric meaning
- [ ] All form inputs (language preference dropdown, editor textarea) have associated label elements
- [ ] Label associations use htmlFor/id matching or wrapped label pattern for proper screen reader identification
- [ ] Loading states include aria-busy="true" attribute on container elements during async operations
- [ ] Loading spinners include aria-label="Loading translations" or equivalent descriptive text
- [ ] Error messages include role="alert" to trigger immediate screen reader announcement
- [ ] Retry buttons include aria-label describing what will be retried: "Retry failed Spanish translation"
- [ ] Empty states include descriptive text that screen readers can access (not just visual imagery)
- [ ] All interactive elements have minimum touch target size of 44x44 pixels for mobile accessibility
- [ ] Focus indicators have minimum 3:1 contrast ratio against background per WCAG 2.2 requirements
- [ ] Focus indicators are visible on all interactive elements (never removed via CSS outline: none without replacement)
- [ ] Skip links allow keyboard users to bypass repetitive navigation elements within translation pages
- [ ] Landmark regions (navigation, main, complementary) are properly defined with ARIA or semantic HTML
- [ ] Page titles update dynamically to reflect current view for screen reader context
- [ ] Language names are announced in current interface language rather than native language for clarity
- [ ] Status icons include title attributes for tooltip display on hover with descriptive text
- [ ] Tooltips are also accessible via keyboard focus with visible display when element receives focus
- [ ] Complex interactions (bulk select, drag operations) include keyboard alternatives following WCAG 2.1.1
- [ ] Component documentation includes accessibility notes for developers implementing integrations
- [ ] Automated accessibility testing catches missing ARIA labels and keyboard navigation issues
- [ ] Manual screen reader testing verifies all announcements are clear and contextually appropriate
- [ ] Keyboard-only user testing confirms all features are accessible without mouse or trackpad
- [ ] Accessibility audit confirms WCAG 2.1 Level AA compliance for all translation management features

---

## REQ-E05-033: Unit Tests for Translation Management Hooks

**Date**: 2026-01-20 23:59
**Type**: ENHANCEMENT
**Size**: M

### Summary
The translation management system needs comprehensive unit tests for the useTranslationStatus and useTranslationRealtime hooks to ensure correct behavior during data fetching, status updates, error handling, and cleanup operations.

### Current Behavior
Custom React hooks for translation status management lack automated test coverage, creating risk of regressions when modifying hook logic, making it difficult to verify edge case handling, and preventing confident refactoring without manual testing.

### Expected Behavior
A unit test suite validates that useTranslationStatus correctly fetches translation data with appropriate loading states, handles various error scenarios with proper error objects, executes cleanup on unmount, and responds correctly to parameter changes, while useTranslationRealtime tests verify subscription establishment, event filtering by entity reference, callback execution when matching events occur, debouncing behavior, and proper channel cleanup when components unmount.

### User Impact
Developers maintaining translation features can confidently modify hook implementations knowing tests will catch breaking changes, new team members understand hook behavior through comprehensive test documentation, bugs in edge cases are caught during development rather than production, and refactoring efforts proceed safely with test coverage validating behavior preservation.

### Business Value
Reduces bug introduction risk through automated regression testing, accelerates development velocity by enabling confident code changes without extensive manual testing, improves code maintainability through test documentation of expected behavior, and prevents production issues that would damage user trust and require emergency fixes.

### Acceptance Criteria
- [ ] Test file created at `/src/hooks/__tests__/useTranslationStatus.test.ts`
- [ ] Test file created at `/src/hooks/__tests__/useTranslationRealtime.test.ts`
- [ ] Tests use React Testing Library and Jest for consistent testing patterns
- [ ] Tests use @testing-library/react-hooks for proper hook testing setup
- [ ] useTranslationStatus test suite includes test for initial loading state (loading: true, data: null)
- [ ] useTranslationStatus test suite includes test for successful data fetch returning expected data structure
- [ ] useTranslationStatus test suite includes test for error handling setting error object when fetch fails
- [ ] useTranslationStatus test suite includes test for loading state transitioning to false after fetch completes
- [ ] useTranslationStatus test suite includes test for refresh function triggering new data fetch
- [ ] useTranslationStatus test suite includes test for retry logic attempting 3 times with exponential backoff on failure
- [ ] useTranslationStatus test suite includes test for polling mode enabling automatic refetch at configured intervals
- [ ] useTranslationStatus test suite includes test for polling disabling when no pending jobs exist
- [ ] useTranslationStatus test suite includes test for cleanup canceling pending requests on unmount
- [ ] useTranslationStatus test suite includes test for parameter changes triggering new fetch with updated values
- [ ] useTranslationStatus test suite includes test for caching preventing duplicate API calls with identical parameters
- [ ] Supabase API responses are mocked using jest.mock for predictable test behavior
- [ ] Mock responses include complete translation status objects matching database schema types
- [ ] useTranslationRealtime test suite includes test for subscription creation on mount
- [ ] useTranslationRealtime test suite includes test for INSERT event triggering callback when entity matches
- [ ] useTranslationRealtime test suite includes test for UPDATE event triggering callback when entity matches
- [ ] useTranslationRealtime test suite includes test for events not matching entity reference being filtered out
- [ ] useTranslationRealtime test suite includes test for events not matching property scope being filtered out
- [ ] useTranslationRealtime test suite includes test for debouncing preventing excessive callback executions
- [ ] useTranslationRealtime test suite includes test for callback receiving correct translation record data
- [ ] useTranslationRealtime test suite includes test for subscription cleanup executing unsubscribe on unmount
- [ ] useTranslationRealtime test suite includes test for parameter changes closing old subscription and opening new one
- [ ] useTranslationRealtime test suite includes test for connection error handling without component crash
- [ ] useTranslationRealtime test suite includes test for disconnection and reconnection scenarios
- [ ] useTranslationRealtime test suite includes test for connection status indicator updating correctly
- [ ] Supabase Realtime channel is mocked using jest.mock to simulate subscription behavior
- [ ] Mock channel implementation supports on method for event subscription
- [ ] Mock channel implementation supports unsubscribe method for cleanup verification
- [ ] Mock channel can trigger test events to verify callback execution
- [ ] Tests verify React StrictMode compatibility handling double mounting correctly
- [ ] Tests verify race condition prevention when parameters change rapidly
- [ ] Tests verify memory leak prevention through proper cleanup of timers and subscriptions
- [ ] Tests verify hook type definitions match actual return values
- [ ] Tests verify error messages provide actionable information for debugging
- [ ] Tests verify 401/403 authentication errors are surfaced correctly
- [ ] Tests verify 404 not found responses are handled gracefully
- [ ] Tests verify invalid parameter validation throws descriptive errors
- [ ] Tests achieve minimum 80% code coverage for hook logic
- [ ] Tests run successfully in continuous integration pipeline
- [ ] Tests execute quickly (complete in under 5 seconds for entire suite)
- [ ] Test descriptions clearly explain what behavior is being verified
- [ ] Tests follow arrange-act-assert pattern for clarity and maintainability
- [ ] Mock data factories create realistic test fixtures matching production data shapes
- [ ] Tests clean up all mocks and timers in afterEach blocks to prevent test pollution
- [ ] Tests document any known limitations or edge cases not yet covered
- [ ] Code comments explain complex mock setups or timing-sensitive test logic

---


## REQ-E05-034: Component Tests for Translation Management UI Components

**Date**: 2026-01-20 09:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The translation management system needs comprehensive component tests for TranslationPreviewPanel, TranslationEditor, and TranslationStatusWidget to verify rendering behavior, user interactions, and integration with data hooks.

### Current Behavior
Translation management UI components lack automated component-level tests, creating risk that rendering logic, user interaction handling, or prop-based conditional display could break during refactoring without detection until manual testing or production deployment.

### Expected Behavior
A component test suite validates that TranslationPreviewPanel renders translation status for all languages correctly with proper visual indicators, TranslationEditor displays editable translation content and executes save operations with proper validation and error handling, and TranslationStatusWidget displays accurate counts of pending, completed, and failed translations that update when underlying data changes.

### User Impact
Developers modifying translation UI components can confidently make changes knowing tests will catch visual regressions and interaction bugs, product managers can verify that component behavior matches specifications through test documentation, users experience fewer UI bugs because component interactions are validated before deployment, and quality assurance teams spend less time on repetitive manual testing of standard component behaviors.

### Business Value
Reduces bug introduction risk through automated component regression testing, accelerates feature development by enabling confident UI changes without extensive manual verification, improves code quality through test-driven development practices that clarify component contracts, and decreases quality assurance costs by automating repetitive component interaction verification.

### Acceptance Criteria
- [ ] Test file created at `/src/components/__tests__/TranslationPreviewPanel.test.tsx`
- [ ] Test file created at `/src/components/__tests__/TranslationEditor.test.tsx`
- [ ] Test file created at `/src/components/__tests__/TranslationStatusWidget.test.tsx`
- [ ] Tests use React Testing Library for component rendering and interaction verification
- [ ] Tests use Jest as the test runner with appropriate matchers for assertions
- [ ] Tests use @testing-library/user-event for realistic user interaction simulation
- [ ] TranslationPreviewPanel test suite includes test for rendering with no translations showing empty state message
- [ ] TranslationPreviewPanel test suite includes test for rendering translation rows for each configured language
- [ ] TranslationPreviewPanel test suite includes test for displaying "Complete" status with green indicator for finished translations
- [ ] TranslationPreviewPanel test suite includes test for displaying "Pending" status with yellow indicator for queued translations
- [ ] TranslationPreviewPanel test suite includes test for displaying "Failed" status with red indicator for error translations
- [ ] TranslationPreviewPanel test suite includes test for displaying "Stale" status with warning indicator when source content has changed
- [ ] TranslationPreviewPanel test suite includes test for close button triggering onClose callback when clicked
- [ ] TranslationPreviewPanel test suite includes test for edit button opening TranslationEditor with correct translation data
- [ ] TranslationPreviewPanel test suite includes test for retry button triggering retryTranslation API call with correct parameters
- [ ] TranslationPreviewPanel test suite includes test for re-translate button triggering re-translation job creation
- [ ] TranslationPreviewPanel test suite includes test for loading state displaying skeleton loaders instead of translation data
- [ ] TranslationPreviewPanel test suite includes test for error state displaying error message with retry option
- [ ] TranslationPreviewPanel test suite includes test for translation content preview truncating long text with ellipsis
- [ ] TranslationPreviewPanel test suite includes test for "View Original" toggle switching between translated and original content
- [ ] TranslationPreviewPanel test suite includes test for language labels displaying in current interface language
- [ ] TranslationPreviewPanel test suite includes test for timestamp display showing "Last updated 2 hours ago" format
- [ ] TranslationPreviewPanel test suite includes test for responsive layout adjusting for mobile viewport widths
- [ ] API mock functions return realistic translation status data matching production schema
- [ ] Mock data includes all required fields: language_code, status, translated_content, updated_at
- [ ] TranslationEditor test suite includes test for rendering with existing translation content pre-filled in textarea
- [ ] TranslationEditor test suite includes test for rendering with empty textarea when no translation exists
- [ ] TranslationEditor test suite includes test for displaying original source content in read-only reference section
- [ ] TranslationEditor test suite includes test for displaying character count updating as user types
- [ ] TranslationEditor test suite includes test for save button being disabled when textarea is empty
- [ ] TranslationEditor test suite includes test for save button being enabled when valid content exists
- [ ] TranslationEditor test suite includes test for cancel button closing editor without saving changes
- [ ] TranslationEditor test suite includes test for save button triggering updateTranslation API call with textarea content
- [ ] TranslationEditor test suite includes test for successful save showing success toast notification
- [ ] TranslationEditor test suite includes test for successful save closing editor and refreshing parent component
- [ ] TranslationEditor test suite includes test for API error displaying error message below textarea
- [ ] TranslationEditor test suite includes test for validation error when content exceeds maximum length
- [ ] TranslationEditor test suite includes test for dirty state preventing close without confirmation dialog
- [ ] TranslationEditor test suite includes test for confirmation dialog appearing when closing with unsaved changes
- [ ] TranslationEditor test suite includes test for confirmation dialog discard option closing without saving
- [ ] TranslationEditor test suite includes test for confirmation dialog keep editing option returning to editor
- [ ] TranslationEditor test suite includes test for loading spinner appearing during save operation
- [ ] TranslationEditor test suite includes test for save button being disabled during save operation to prevent double submission
- [ ] TranslationEditor test suite includes test for keyboard shortcut Cmd+S/Ctrl+S triggering save
- [ ] TranslationEditor test suite includes test for keyboard shortcut Escape triggering cancel/close
- [ ] TranslationEditor test suite includes test for language indicator displaying correct language name and flag
- [ ] TranslationEditor test suite includes test for word count display updating alongside character count
- [ ] updateTranslation API function is mocked to return success or error responses
- [ ] Mock API includes realistic delay simulation to test loading states
- [ ] TranslationStatusWidget test suite includes test for rendering with zero translations showing empty state
- [ ] TranslationStatusWidget test suite includes test for displaying count of pending translation jobs
- [ ] TranslationStatusWidget test suite includes test for displaying count of completed translation jobs
- [ ] TranslationStatusWidget test suite includes test for displaying count of failed translation jobs
- [ ] TranslationStatusWidget test suite includes test for displaying total translation count across all statuses
- [ ] TranslationStatusWidget test suite includes test for displaying percentage completion progress bar
- [ ] TranslationStatusWidget test suite includes test for progress bar visual width matching calculated percentage
- [ ] TranslationStatusWidget test suite includes test for counts updating when useTranslationStatus hook data changes
- [ ] TranslationStatusWidget test suite includes test for clicking pending count filtering to show only pending translations
- [ ] TranslationStatusWidget test suite includes test for clicking failed count opening retry all failed dialog
- [ ] TranslationStatusWidget test suite includes test for refresh button triggering data refetch
- [ ] TranslationStatusWidget test suite includes test for loading skeleton appearing during initial data fetch
- [ ] TranslationStatusWidget test suite includes test for error state displaying error message with retry button
- [ ] TranslationStatusWidget test suite includes test for auto-refresh when polling is enabled in hook configuration
- [ ] TranslationStatusWidget test suite includes test for real-time updates when new translation job completes
- [ ] TranslationStatusWidget test suite includes test for badge indicator showing alert when failed count is non-zero
- [ ] TranslationStatusWidget test suite includes test for tooltip showing breakdown on hover over progress bar
- [ ] TranslationStatusWidget test suite includes test for compact mode rendering smaller layout for dashboard cards
- [ ] useTranslationStatus hook is mocked to return controllable test data
- [ ] Mock hook data can be updated during tests to simulate real-time changes
- [ ] All tests clean up timers, subscriptions, and event listeners in cleanup functions
- [ ] Tests verify correct prop types are passed to child components using type assertions
- [ ] Tests verify accessibility attributes (ARIA labels, roles) are present on interactive elements
- [ ] Tests verify correct CSS classes are applied for different status states
- [ ] Tests verify component behavior matches Figma design specifications for visual states
- [ ] Tests achieve minimum 80% code coverage for component logic
- [ ] Tests execute quickly completing in under 10 seconds for entire component suite
- [ ] Test descriptions use clear naming convention: "should [expected behavior] when [condition]"
- [ ] Tests follow arrange-act-assert pattern with clear separation of setup, interaction, and verification
- [ ] Mock data factories provide realistic test fixtures representing production data shapes
- [ ] Tests document any visual regression testing that should be performed manually
- [ ] Tests run successfully in continuous integration pipeline without flakiness
- [ ] All console errors and warnings are addressed or intentionally tested as expected behavior

---
