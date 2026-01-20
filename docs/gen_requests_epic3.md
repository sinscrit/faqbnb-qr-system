# Generated Requests - Epic 3 (Dynamic Content Translation)

This file contains auto-generated feature requests for L10N Epic 3.
Request IDs use format: REQ-E03-XXX

Last Reset: 2026-01-19

---

## REQ-E03-001: Create Content Translation Module Structure

**Date**: 2026-01-19
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must provide a dedicated module for managing content translation operations with proper type definitions.

### Current Behavior
No content translation module exists. Translation logic, if any, is scattered or non-existent.

### Expected Behavior
A structured module exists at the specified location with:
- A main module entry point that exports all translation functionality
- Complete TypeScript type definitions for all content translation operations
- Clear interface contracts for translation requests, responses, and status tracking
- Type-safe definitions for supported content types (items, articles, links, tags)
- Type definitions for translation metadata (language codes, status, timestamps)

### User Impact
Developers implementing translation features will have:
- Clear contracts for how content translation works
- Type safety when working with translation operations
- A single import point for all translation functionality
- Reduced risk of runtime errors through compile-time type checking

### Business Value
Establishes the foundation for scalable, maintainable translation infrastructure that reduces development time and bugs in future translation features.

### Acceptance Criteria
- [ ] Module structure exists at the expected location with barrel export pattern
- [ ] Type definitions file contains interfaces for all content entities that require translation
- [ ] Type definitions include translation job states (pending, processing, completed, failed)
- [ ] Type definitions include language code enumerations or types
- [ ] Type definitions include translation metadata (source language, target language, created/updated timestamps, version tracking)
- [ ] All types are properly exported and importable from the module
- [ ] TypeScript compilation succeeds with no type errors

---

## REQ-E03-002: Implement Content Translation Orchestrator

**Date**: 2026-01-19 14:32
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a central orchestration function that coordinates the creation of translation jobs across all target languages for a given piece of content.

### Current Behavior
No orchestration mechanism exists for managing multi-language translation workflows. When content is created or updated, there is no automated way to initiate translations across supported languages.

### Expected Behavior
A primary orchestration function accepts content metadata (entity type, entity identifier, translatable fields, source language) and:
- Determines which target languages require translation based on system configuration
- Creates individual translation job records in the database for each target language
- Returns summary information indicating how many jobs were successfully queued
- Integrates with translation service infrastructure established in Epic 1
- Maintains type safety through proper TypeScript interfaces

### User Impact
Content owners will experience:
- Automatic translation initiation when they publish or update content
- Visibility into which languages are being processed
- Confidence that all supported languages are being addressed

Developers will experience:
- Simple API for triggering translations from any content endpoint
- Consistent translation behavior across different content types
- Clear status reporting for debugging and monitoring

### Business Value
Eliminates manual translation coordination, ensuring consistent multilingual content delivery and reducing the operational burden on content teams.

### Acceptance Criteria
- [ ] Core orchestration function accepts entity type, entity ID, fields to translate, and source language as parameters
- [ ] Function queries system configuration to determine active target languages
- [ ] Function creates one translation job record per target language in the database
- [ ] Function skips job creation if a pending or completed job already exists for that language/content combination
- [ ] Function returns a result object containing the count of jobs created and any error information
- [ ] Function integrates with translation service type definitions from Epic 1
- [ ] Function handles database errors gracefully and reports them in the result
- [ ] All TypeScript types are properly defined and exported

---

## REQ-E03-003: Implement Entity-Specific Translation Triggers

**Date**: 2026-01-19 16:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide dedicated trigger functions for each content entity type that extract translatable fields and initiate translation workflows.

### Current Behavior
When content entities (items, articles, links) are created or updated, no translation process is automatically initiated. Content remains in its original language only.

### Expected Behavior
The system provides three specialized trigger functions:

**Item Translation Trigger**
- Accepts an item identifier and source language code
- Retrieves the item record from the database
- Extracts the name and description fields for translation
- Queues translation jobs for all target languages
- Returns a result indicating success or failure with job counts

**Article Translation Trigger**
- Accepts an article identifier and source language code
- Retrieves the article record from the database
- Extracts the title and description fields for translation
- Queues translation jobs for all target languages
- Returns a result indicating success or failure with job counts

**Link Translation Trigger**
- Accepts a link identifier and source language code
- Retrieves the link record from the database
- Extracts only the title field for translation (URLs remain unchanged)
- Queues translation jobs for all target languages
- Returns a result indicating success or failure with job counts

All triggers follow consistent patterns, use shared orchestration logic, and maintain type safety.

### User Impact
Content creators will experience:
- Automatic translation initiation when they create items, articles, or links
- Appropriate field selection based on content type (e.g., URLs are never translated)
- Consistent translation behavior regardless of content type

### Business Value
Provides the essential bridge between content creation and translation infrastructure, ensuring all user-generated content becomes available in multiple languages without manual intervention.

### Acceptance Criteria
- [ ] Item trigger function exists and accepts item ID and source language parameters
- [ ] Item trigger extracts name and description fields from the database
- [ ] Item trigger invokes orchestration logic to queue translation jobs
- [ ] Article trigger function exists and accepts article ID and source language parameters
- [ ] Article trigger extracts title and description fields from the database
- [ ] Article trigger invokes orchestration logic to queue translation jobs
- [ ] Link trigger function exists and accepts link ID and source language parameters
- [ ] Link trigger extracts only the title field (excludes URL field)
- [ ] Link trigger invokes orchestration logic to queue translation jobs
- [ ] All triggers return consistent result objects with job counts and status
- [ ] All triggers handle missing entities gracefully with appropriate error responses
- [ ] All triggers handle database errors gracefully
- [ ] TypeScript types are properly defined for all parameters and return values

---

## REQ-E03-004: Implement Tag Translation Trigger

**Date**: 2026-01-19 17:15
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must provide a specialized translation trigger for tag entities that intelligently handles both system-provided tags and user-created tags.

### Current Behavior
When tags are created or associated with content, no translation process is initiated. Tags remain in their original language, preventing users from searching or filtering using tags in their preferred language.

### Expected Behavior
The system provides a tag translation trigger function that:
- Accepts a tag key identifier and source language code as parameters
- Determines whether the tag is a system tag or user-created tag
- Skips translation for system tags (which are already seeded in all languages during initialization)
- For user-created tags, checks if translation jobs already exist before creating new ones
- Queues translation jobs for all target languages when appropriate
- Returns a result object indicating whether jobs were queued, skipped, or if errors occurred

The function operates efficiently by avoiding redundant database operations and respects the distinction between pre-translated system content and dynamic user content.

### User Impact
Users will experience:
- Tag search and filtering that works in their chosen language
- Consistent tag vocabulary across all supported languages
- Immediate availability of user-created tags in multiple languages
- No duplication of translation efforts for system-provided tags

### Business Value
Completes the content translation infrastructure by handling the final translatable entity type, ensuring comprehensive multilingual support across all user-facing content categories.

### Acceptance Criteria
- [ ] Tag trigger function exists and accepts tag key and source language as parameters
- [ ] Function retrieves tag information from the database using the provided tag key
- [ ] Function distinguishes between system tags and user-created tags (via database flag or tag metadata)
- [ ] Function immediately returns success without queuing jobs when processing system tags
- [ ] Function checks for existing translation jobs before creating new ones for user tags
- [ ] Function returns early if all required translations already exist or are in progress
- [ ] Function queues translation jobs for missing target languages only
- [ ] Function returns a result object with job count, skip reason, and status information
- [ ] Function handles missing tag keys gracefully with appropriate error responses
- [ ] Function handles database errors gracefully
- [ ] TypeScript types are properly defined for all parameters and return values

---

## REQ-E03-005: Implement Translation Storage Utilities

**Date**: 2026-01-19 18:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide dedicated storage utilities that persist translated content to the database using an UPSERT pattern to handle both new translations and updates to existing translations.

### Current Behavior
No standardized mechanism exists for storing translated content in the database. When translation jobs complete, there is no consistent way to save the translated text, leading to potential data loss or inconsistent storage patterns.

### Expected Behavior
The system provides four specialized storage functions that handle database persistence for each translatable entity type:

**Item Translation Storage**
- Accepts an item identifier, target language code, and translation data (name, description)
- Executes an UPSERT operation (insert if new, update if exists) on the item translations table
- Records translation metadata (source version, timestamp)
- Returns success or failure indication

**Article Translation Storage**
- Accepts an article identifier, target language code, and translation data (title, description)
- Executes an UPSERT operation on the article translations table
- Records translation metadata (source version, timestamp)
- Returns success or failure indication

**Link Translation Storage**
- Accepts a link identifier, target language code, and translation data (title only)
- Executes an UPSERT operation on the link translations table
- Records translation metadata (source version, timestamp)
- Returns success or failure indication

**Tag Translation Storage**
- Accepts a tag key, target language code, and translated tag value
- Executes an UPSERT operation on the tag translations table
- Records translation metadata (source version, timestamp)
- Returns success or failure indication

All functions use the UPSERT pattern to gracefully handle scenarios where translations are re-run or updated due to source content changes.

### User Impact
Content consumers will experience:
- Reliable availability of translated content across all supported languages
- Updated translations when source content is modified
- No duplicate or conflicting translation records in the database

Developers will experience:
- Simple API for persisting translation results
- Automatic handling of translation updates without complex conditional logic
- Consistent storage patterns across all content types
- Type-safe interfaces for all storage operations

### Business Value
Provides the critical data persistence layer for the translation infrastructure, ensuring translation efforts result in reliably stored multilingual content that users can access.

### Acceptance Criteria
- [ ] Function exists for storing item translations with parameters for item ID, language, and data object
- [ ] Item storage function performs UPSERT operation (ON CONFLICT UPDATE or equivalent)
- [ ] Item storage function persists name and description translations
- [ ] Function exists for storing article translations with parameters for article ID, language, and data object
- [ ] Article storage function performs UPSERT operation
- [ ] Article storage function persists title and description translations
- [ ] Function exists for storing link translations with parameters for link ID, language, and data object
- [ ] Link storage function performs UPSERT operation
- [ ] Link storage function persists title translation only
- [ ] Function exists for storing tag translations with parameters for tag key, language, and translated value
- [ ] Tag storage function performs UPSERT operation
- [ ] All storage functions record translation metadata (timestamp, source version if available)
- [ ] All storage functions handle database constraint violations gracefully
- [ ] All storage functions return typed result objects indicating success or error details
- [ ] All storage functions validate required parameters before attempting database operations
- [ ] TypeScript types are properly defined for all parameters, data objects, and return values

---

## REQ-E03-006: Implement Translation Status Utilities

**Date**: 2026-01-19 19:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide utilities that aggregate translation job status with stored translation records to report comprehensive translation status for individual content entities or batches of entities.

### Current Behavior
No unified mechanism exists to determine the translation status of content entities. Information about translation jobs exists separately from stored translations, making it impossible to answer questions like "Is this item fully translated?" or "Which articles have pending translations?"

### Expected Behavior
The system provides two status aggregation functions:

**Single Entity Status Query**
- Accepts an entity type (item, article, link, or tag) and entity identifier
- Queries the translation jobs table to find all jobs associated with that entity
- Queries the translations table to find all completed translations for that entity
- Aggregates the data to determine status for each target language (not_started, pending, processing, completed, failed)
- Returns a comprehensive status object showing overall completion percentage and per-language status

**Batch Entity Status Query**
- Accepts an array of entity specifications (each containing entity type and identifier)
- Performs optimized batch queries to retrieve job and translation data for all entities
- Aggregates status information for each entity in the batch
- Returns an array of status results matching the input order
- Optimizes database queries to avoid N+1 query problems

Both functions provide visibility into the complete translation pipeline state by combining job tracking data with stored translation records.

### User Impact
Content owners will experience:
- Clear visibility into which content is available in which languages
- Understanding of translation progress for recently created or updated content
- Ability to identify content that needs translation attention
- Dashboard views showing translation status across large content collections

Developers will experience:
- Single API for checking translation completeness
- Efficient batch operations for list views and reports
- Type-safe status enumerations
- Clear distinction between "translation pending" and "translation completed"

### Business Value
Enables visibility and monitoring of the translation infrastructure, allowing content teams to track multilingual content coverage and identify gaps in translation completion.

### Acceptance Criteria
- [ ] Single entity status function accepts entity type and entity ID parameters
- [ ] Single entity status function queries translation jobs table for that entity
- [ ] Single entity status function queries translations table for that entity
- [ ] Single entity status function combines job and translation data to determine per-language status
- [ ] Single entity status function returns status enumeration (not_started, pending, processing, completed, failed) for each target language
- [ ] Single entity status function calculates overall completion percentage
- [ ] Batch status function accepts an array of entity specifications
- [ ] Batch status function uses efficient database queries (JOIN or IN clauses) to retrieve data for all entities
- [ ] Batch status function returns results in the same order as input entities
- [ ] Batch status function handles large batches (100+ entities) efficiently
- [ ] Both functions handle entities with no translation jobs or records gracefully
- [ ] Both functions handle database errors gracefully with appropriate error responses
- [ ] Status results include timestamp of last translation update
- [ ] TypeScript types are properly defined for entity specifications, status enumerations, and result objects
- [ ] All functions are properly exported from the module

---

## REQ-E03-007: Add Source Language Detection Utility

**Date**: 2026-01-20 13:45
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must provide a utility function that determines the source language for content translation by evaluating multiple language sources in a defined priority order.

### Current Behavior
No standardized mechanism exists for determining which language should be used as the source when initiating content translations. Content APIs lack a consistent way to identify the original language of user-created content, leading to potential translation inaccuracies or failures.

### Expected Behavior
The system provides a source language detection function that:
- Accepts user context, account context, and an optional language override parameter
- Evaluates language sources in strict priority order: explicit override first, then user preference, then account preference, finally defaulting to English
- Returns a validated supported language code that can be used as the source language for translation operations
- Ensures the returned language code is always one of the system's supported languages
- Provides type-safe inputs and outputs using TypeScript interfaces

The priority logic operates as follows:
1. If an override language is explicitly provided, return that language
2. Otherwise, if the user has a preferred language set in their profile, return that language
3. Otherwise, if the user's account has a preferred language, return that language
4. Otherwise, return English as the ultimate fallback

### User Impact
Content creators will experience:
- Accurate translation sourcing that respects their language preferences
- Ability to override automatic language detection when creating multilingual content
- Consistent source language selection across all content types
- Correct translation direction even when switching between languages

Developers will experience:
- Single source of truth for language detection logic
- Consistent behavior across all content creation and update flows
- Clear prioritization rules that eliminate ambiguity
- Reduced code duplication across API endpoints

### Business Value
Ensures translation accuracy by correctly identifying source languages, reducing translation errors and improving the quality of multilingual content delivery to guests.

### Acceptance Criteria
- [ ] Function exists with signature accepting user object, account object, and optional override string parameter
- [ ] Function returns a supported language code type (not a freeform string)
- [ ] Function evaluates override parameter first and returns immediately if valid language is provided
- [ ] Function evaluates user preferred language second if override is not provided
- [ ] Function evaluates account preferred language third if neither override nor user preference exists
- [ ] Function returns English ('en') as default if no preferences are set
- [ ] Function validates that returned language code is in the supported languages list
- [ ] Function handles null or undefined user/account objects gracefully
- [ ] Function handles invalid override values by falling back to next priority level
- [ ] TypeScript types are properly defined for all parameters and return values
- [ ] Function is exported from the content translation module

---

## REQ-E03-008: Modify Items API to Trigger Translations

**Date**: 2026-01-20 14:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
The items creation and update API endpoints must automatically initiate translation workflows when items are created or modified.

### Current Behavior
When items are created or updated through the API, no translation process is triggered. Items remain available only in their original language. The API returns basic item data without any information about translation job status.

### Expected Behavior
The POST handler for item creation:
- Accepts an optional source language parameter in the request body
- Detects the source language using the language detection utility if not explicitly provided
- After successfully creating the item record, invokes the content translation orchestrator
- Includes translation job identifiers in the response payload to enable status tracking

The PUT/PATCH handler for item updates:
- Detects whether translatable fields (name, description) have changed
- Deletes existing translation records for the item before applying updates
- Queues new translation jobs after successfully updating the item
- Includes translation job identifiers in the response payload

Both handlers maintain backward compatibility with existing API consumers while adding new translation-related response fields. Errors in the translation queuing process do not prevent the primary item operation from succeeding but are reported in the response.

### User Impact
Content owners will experience:
- Automatic availability of their items in all supported languages shortly after creation
- Updated translations when they modify item names or descriptions
- Visibility into translation processing status through job identifiers
- Seamless multilingual content delivery without manual translation requests

API consumers will receive:
- Additional response fields indicating translation job status
- Ability to track translation progress using returned job identifiers
- Backward-compatible responses (existing fields remain unchanged)

### Business Value
Closes the gap between content creation and multilingual availability, ensuring all items become accessible to international guests automatically and reducing time-to-market for new content.

### Acceptance Criteria
- [ ] POST handler accepts an optional sourceLanguage parameter in the request body
- [ ] POST handler uses language detection utility to determine source language when not explicitly provided
- [ ] POST handler calls content translation orchestrator after successful item creation
- [ ] POST handler includes translationJobIds array in successful response payload
- [ ] POST handler includes translation error messages in response if orchestration fails
- [ ] POST handler completes item creation even if translation queuing fails
- [ ] PUT/PATCH handler identifies when name or description fields have changed
- [ ] PUT/PATCH handler deletes existing translation records for the item before update
- [ ] PUT/PATCH handler calls content translation orchestrator after successful update
- [ ] PUT/PATCH handler includes translationJobIds array in successful response payload
- [ ] PUT/PATCH handler skips translation queuing if translatable fields are unchanged
- [ ] Both handlers maintain existing response structure with new fields added as non-breaking changes
- [ ] Both handlers handle translation orchestrator errors gracefully without failing the primary operation
- [ ] Response type definitions are updated to include optional translation-related fields
- [ ] API documentation reflects new request parameters and response fields

---

## REQ-E03-009: Modify Articles API to Trigger Translations

**Date**: 2026-01-20 15:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The articles creation and update API endpoints must automatically initiate translation workflows when articles are created or modified.

### Current Behavior
When articles are created or updated through the API, no translation process is triggered. Articles remain available only in their original language. The API returns basic article data without any information about translation job status.

### Expected Behavior
The POST handler for article creation:
- Accepts an optional source language parameter in the request body
- Detects the source language using the language detection utility if not explicitly provided
- After successfully creating the article record, invokes the content translation orchestrator
- Includes translation job identifiers in the response payload to enable status tracking

The PUT/PATCH handler for article updates:
- Detects whether translatable fields (title, description) have changed
- Deletes existing translation records for the article before applying updates
- Queues new translation jobs after successfully updating the article
- Includes translation job identifiers in the response payload

Both handlers maintain backward compatibility with existing API consumers while adding new translation-related response fields. Errors in the translation queuing process do not prevent the primary article operation from succeeding but are reported in the response.

### User Impact
Content owners will experience:
- Automatic availability of their articles in all supported languages shortly after creation
- Updated translations when they modify article titles or descriptions
- Visibility into translation processing status through job identifiers
- Seamless multilingual content delivery without manual translation requests

API consumers will receive:
- Additional response fields indicating translation job status
- Ability to track translation progress using returned job identifiers
- Backward-compatible responses (existing fields remain unchanged)

### Business Value
Ensures help articles and informational content become accessible to international guests automatically, improving support quality for non-English speakers and reducing manual translation coordination.

### Acceptance Criteria
- [ ] POST handler accepts an optional sourceLanguage parameter in the request body
- [ ] POST handler uses language detection utility to determine source language when not explicitly provided
- [ ] POST handler calls content translation orchestrator after successful article creation
- [ ] POST handler includes translationJobIds array in successful response payload
- [ ] POST handler includes translation error messages in response if orchestration fails
- [ ] POST handler completes article creation even if translation queuing fails
- [ ] PUT/PATCH handler identifies when title or description fields have changed
- [ ] PUT/PATCH handler deletes existing translation records for the article before update
- [ ] PUT/PATCH handler calls content translation orchestrator after successful update
- [ ] PUT/PATCH handler includes translationJobIds array in successful response payload
- [ ] PUT/PATCH handler skips translation queuing if translatable fields are unchanged
- [ ] Both handlers maintain existing response structure with new fields added as non-breaking changes
- [ ] Both handlers handle translation orchestrator errors gracefully without failing the primary operation
- [ ] Response type definitions are updated to include optional translation-related fields
- [ ] API documentation reflects new request parameters and response fields

---

## REQ-E03-010: Modify Links API to Trigger Translations

**Date**: 2026-01-20 16:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The links creation and update API endpoints must automatically initiate translation workflows when links are created or modified.

### Current Behavior
When links are created or updated through the API, no translation process is triggered. Link titles remain available only in their original language. The API returns basic link data without any information about translation job status.

### Expected Behavior
The POST handler for link creation:
- Accepts an optional source language parameter in the request body
- Detects the source language using the language detection utility if not explicitly provided
- After successfully creating the link record, invokes the content translation orchestrator for the title field only
- Includes translation job identifiers in the response payload to enable status tracking
- Ensures the URL field is never sent for translation

The PUT/PATCH handler for link updates:
- Detects whether the translatable field (title only) has changed
- Deletes existing translation records for the link before applying updates
- Queues new translation jobs after successfully updating the link
- Includes translation job identifiers in the response payload
- Ensures URL updates do not trigger translation workflows

Both handlers maintain backward compatibility with existing API consumers while adding new translation-related response fields. Errors in the translation queuing process do not prevent the primary link operation from succeeding but are reported in the response.

### User Impact
Content owners will experience:
- Automatic availability of their link titles in all supported languages shortly after creation
- Updated translations when they modify link titles
- Visibility into translation processing status through job identifiers
- Seamless multilingual content delivery without manual translation requests
- Assurance that URLs remain unchanged across all language versions

API consumers will receive:
- Additional response fields indicating translation job status
- Ability to track translation progress using returned job identifiers
- Backward-compatible responses (existing fields remain unchanged)

### Business Value
Completes the content API translation integration by ensuring all user-created content types trigger automatic multilingual processing, improving discoverability of linked resources for international guests.

### Acceptance Criteria
- [ ] POST handler accepts an optional sourceLanguage parameter in the request body
- [ ] POST handler uses language detection utility to determine source language when not explicitly provided
- [ ] POST handler calls content translation orchestrator after successful link creation
- [ ] POST handler passes only the title field to the orchestrator (excludes URL field)
- [ ] POST handler includes translationJobIds array in successful response payload
- [ ] POST handler includes translation error messages in response if orchestration fails
- [ ] POST handler completes link creation even if translation queuing fails
- [ ] PUT/PATCH handler identifies when the title field has changed
- [ ] PUT/PATCH handler ignores URL field changes for translation purposes
- [ ] PUT/PATCH handler deletes existing translation records for the link before update
- [ ] PUT/PATCH handler calls content translation orchestrator after successful update
- [ ] PUT/PATCH handler includes translationJobIds array in successful response payload
- [ ] PUT/PATCH handler skips translation queuing if the title field is unchanged
- [ ] Both handlers maintain existing response structure with new fields added as non-breaking changes
- [ ] Both handlers handle translation orchestrator errors gracefully without failing the primary operation
- [ ] Response type definitions are updated to include optional translation-related fields
- [ ] API documentation reflects new request parameters and response fields

---


## REQ-E03-011: Add Tag Translation on Item Save

**Date**: 2026-01-20 17:00
**Type**: ENHANCEMENT
**Size**: S

### Summary
The items creation and update API endpoints must automatically queue translation jobs for user-defined tags attached to items.

### Current Behavior
When items are saved with user-defined tags, the tags remain in their original language. Guests viewing items in other languages see untranslated tag names, reducing the usefulness of tag-based filtering and categorization.

### Expected Behavior
Both POST and PUT/PATCH handlers for items:
- Extract the tags array from the request payload after successful item save
- Iterate through each tag in the array
- Skip system tags (tags whose keys start with '#' character)
- For each user-defined tag, check if translation records already exist in the database for all target languages
- Queue tag translation jobs only for languages where translations are missing
- Continue processing even if tag translation queuing encounters errors
- Log tag translation errors without preventing the item save operation from succeeding

The tag translation process runs asynchronously after the item is successfully saved, ensuring user-defined tags become searchable and filterable in all supported languages.

### User Impact
Content owners will experience:
- User-defined tags that automatically become available in multiple languages
- Consistent tag vocabulary across language versions
- Ability to create custom categorization schemes that work for international guests
- Seamless tag management without manual translation efforts

Guests will experience:
- Tag-based filtering that works in their preferred language
- Consistent tag display across all content in their selected language
- Better content discovery through localized tag search

### Business Value
Extends multilingual support to user-generated taxonomy, ensuring tags remain a useful organizational and discovery tool for international audiences without adding manual translation burden to property owners.

### Acceptance Criteria
- [ ] POST handler extracts tags array from successfully saved item
- [ ] POST handler iterates through each tag in the array
- [ ] POST handler skips tags where the tag key begins with '#' character
- [ ] POST handler queries database to check for existing translation records for each user tag
- [ ] POST handler queues tag translation jobs only for missing language translations
- [ ] POST handler avoids creating duplicate translation jobs for tags that are already queued or completed
- [ ] PUT/PATCH handler performs the same tag translation logic after item updates
- [ ] Both handlers continue item save operation even if tag translation queuing fails
- [ ] Both handlers log tag translation errors to system error tracking
- [ ] Tag translation queuing does not impact item save response time noticeably
- [ ] Tag translation uses the same source language as the item itself
- [ ] All database queries for tag translation status are optimized to avoid N+1 problems
- [ ] System tags are never sent to the translation queue

---

## REQ-E03-012: Update TypeScript Types for API Responses

**Date**: 2026-01-20 17:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
The TypeScript type definitions for API requests and responses must be updated to include translation-related fields that support the multilingual content infrastructure.

### Current Behavior
The existing type definitions for item and article API operations do not include fields for translation job tracking or source language specification. API consumers cannot access translation status information through strongly-typed interfaces, and there is no standardized way to specify source language when creating content.

### Expected Behavior
The types file is updated with the following changes:

**ItemResponse Type Enhancement**
- Add an optional field for translation job identifiers (array of strings)
- This field appears in responses when translation jobs are queued during item creation or updates

**ArticleResponse Type Enhancement**
- Add an optional field for translation job identifiers (array of strings)
- This field appears in responses when translation jobs are queued during article creation or updates

**CreateItemRequest Type Enhancement**
- Add an optional field for specifying source language (string type matching supported language codes)
- This field allows content creators to explicitly declare the language of their content

**CreateArticleRequest Type Enhancement**
- Add an optional field for specifying source language (string type matching supported language codes)
- This field allows content creators to explicitly declare the language of their content

**Type Exports**
- Ensure all translation-related types defined in the content translation module are exported through the central types file
- This includes types for translation status, language codes, and translation metadata

All changes maintain backward compatibility. New fields are optional and do not break existing API consumers.

### User Impact
Developers consuming the API will experience:
- TypeScript autocomplete for translation-related fields in API responses
- Compile-time type checking when working with translation job identifiers
- Type-safe language code specification when creating content
- IntelliSense documentation for translation fields in their IDE
- Reduced runtime errors through stronger type contracts

API documentation generated from TypeScript types will automatically reflect the new fields, improving discoverability for integration partners.

### Business Value
Strengthens the type system to support multilingual features, reducing integration errors and improving developer experience when working with translation functionality.

### Acceptance Criteria
- [ ] ItemResponse type includes optional translationJobIds field typed as string array
- [ ] ArticleResponse type includes optional translationJobIds field typed as string array
- [ ] CreateItemRequest type includes optional sourceLanguage field typed as string
- [ ] CreateArticleRequest type includes optional sourceLanguage field typed as string
- [ ] All translation-related types from the content translation module are exported
- [ ] Exported types include at minimum: translation status enumerations, language code types, translation metadata interfaces
- [ ] TypeScript compilation succeeds with no type errors after changes
- [ ] Existing API handlers that use these types compile successfully without modification
- [ ] Type definitions are properly documented with TSDoc comments explaining translation fields
- [ ] All exports from the types file maintain consistent naming conventions
- [ ] No breaking changes are introduced to existing type definitions

---

## REQ-E03-013: Enhance Job Processor for Content-Specific Handling

**Date**: 2026-01-20 18:00
**Type**: ENHANCEMENT
**Size**: M

### Summary
The translation job processor must route translation jobs to specialized handlers based on content entity type to ensure appropriate field extraction, translation, and storage.

### Current Behavior
The existing job processing infrastructure from Epic 1 processes translation jobs generically without awareness of content entity types. There is no differentiation between translating an item, article, link, or tag, leading to inability to handle entity-specific field requirements.

### Expected Behavior
The main job processing function is enhanced to include content type awareness:
- When a translation job is dequeued from the job queue, the processor examines the entity type field
- Based on the entity type value (item, article, link, or tag), the processor dispatches to a specialized handler function
- Each specialized handler knows which fields to translate, how to format translation requests, and where to store results
- The processor maintains a clean switch/case structure that is easily extensible for future content types
- All specialized handlers follow consistent patterns for error handling, status reporting, and job completion marking

The specialized handlers operate as follows:
- Item handler translates name and description fields, stores results in item translations table
- Article handler translates title and description fields, stores results in article translations table
- Link handler translates title field only, stores results in link translations table
- Tag handler translates tag value, stores results in tag translations table

Each handler integrates with the translation storage utilities created in REQ-E03-005 for data persistence.

### User Impact
Content creators will experience:
- Correct translation of all content types with appropriate field handling
- Reliable preservation of non-translatable fields (such as URLs in links)
- Consistent translation quality across different content entity types
- Predictable translation completion timing

Guests viewing content will experience:
- Accurate translations that respect the structure of each content type
- Complete multilingual coverage of all user-generated content
- Consistent translation quality across items, articles, links, and tags

### Business Value
Completes the translation job processing pipeline by connecting generic job queue infrastructure to content-specific translation requirements, enabling end-to-end automated multilingual content delivery.

### Acceptance Criteria
- [ ] Main job processor function includes a switch or if-else statement based on job.entityType
- [ ] Processor routes to processItemTranslation function when entityType is 'item'
- [ ] Processor routes to processArticleTranslation function when entityType is 'article'
- [ ] Processor routes to processLinkTranslation function when entityType is 'link'
- [ ] Processor routes to processTagTranslation function when entityType is 'tag'
- [ ] Processor handles unknown entity types gracefully with error logging
- [ ] Each specialized handler extracts the correct fields for its entity type
- [ ] Each specialized handler calls the translation service with appropriate payloads
- [ ] Each specialized handler uses the correct storage utility from REQ-E03-005
- [ ] Each specialized handler marks jobs as completed in the job queue upon success
- [ ] Each specialized handler marks jobs as failed with error details upon failure
- [ ] Each specialized handler respects job retry limits and backoff policies
- [ ] All handlers maintain consistent error handling patterns
- [ ] TypeScript types are properly defined for entity type enumerations and handler signatures
- [ ] Code includes JSDoc comments explaining the routing logic

---

## REQ-E03-014: Implement Item Translation Processor

**Date**: 2026-01-20 19:15
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a specialized processor function that retrieves item records, translates item fields, persists the translations, and updates job status.

### Current Behavior
No dedicated handler exists for processing item translation jobs. When translation jobs are created for items, there is no mechanism to retrieve the item data, submit fields for translation, or store the translated results.

### Expected Behavior
The system provides an item translation processor function that executes the following workflow when invoked with a translation job:

**Data Retrieval**
- Accepts a translation job specification containing item identifier, target language, and job metadata
- Queries the database to retrieve the item record using the identifier
- Handles cases where the item no longer exists or has been deleted
- Returns appropriate error status if the item cannot be found

**Field Extraction and Translation**
- Extracts the name and description fields from the retrieved item record
- Prepares a translation request payload containing both fields
- Submits the translation request to the translation service established in Epic 1
- Specifies the source language and target language from the job metadata
- Handles translation service errors and timeouts appropriately

**Storage**
- Receives the translated name and description from the translation service
- Invokes the item translation storage utility from REQ-E03-005
- Passes the item identifier, target language, and translated field values
- Uses the UPSERT pattern to handle both new translations and updates
- Records translation metadata including timestamp and source version

**Job Status Management**
- Marks the translation job as completed upon successful storage
- Records completion timestamp in the job record
- For failures at any stage, marks the job as failed with detailed error information
- Respects job retry policies and backoff intervals
- Increments retry counters for transient failures

The processor maintains type safety throughout, handles errors gracefully at each stage, and provides detailed logging for troubleshooting.

### User Impact
Content owners will experience:
- Automatic translation of item names and descriptions shortly after creation or update
- Reliable delivery of item content in all supported languages
- Consistent translation quality for property inventory across languages
- Visibility into translation failures through job status tracking

Guests viewing items will experience:
- Fully translated item names and descriptions in their chosen language
- Complete understanding of property inventory regardless of language preference
- Consistent translation quality across all items in a property

### Business Value
Delivers the core value proposition of multilingual item management by automating the translation of property inventory, enabling international guests to fully understand available items and improving booking confidence.

### Acceptance Criteria
- [ ] Function accepts a translation job object containing item ID, target language, and job metadata
- [ ] Function queries the database to retrieve the item record by ID
- [ ] Function handles missing or deleted items with appropriate error status
- [ ] Function extracts name and description fields from the item record
- [ ] Function prepares translation request with both fields in a single API call
- [ ] Function calls the translation service with source language, target language, and field data
- [ ] Function handles translation service errors with retry logic for transient failures
- [ ] Function handles translation service timeouts with appropriate error status
- [ ] Function receives translated name and description from the translation service response
- [ ] Function calls the item translation storage utility from REQ-E03-005
- [ ] Function passes item ID, target language, and translated fields to storage utility
- [ ] Function marks job as completed in the job queue upon successful storage
- [ ] Function records completion timestamp in the job record
- [ ] Function marks job as failed with error details when any stage fails
- [ ] Function increments retry counter for transient errors (network, timeout, rate limit)
- [ ] Function does not retry for permanent errors (invalid item ID, unsupported language)
- [ ] Function respects maximum retry limits defined in job configuration
- [ ] Function logs all significant events (start, completion, errors) for troubleshooting
- [ ] TypeScript types are properly defined for job objects, responses, and error states
- [ ] Function is exported from the content translation module
- [ ] Function integrates cleanly with the job processor routing logic from REQ-E03-013

---

## REQ-E03-015: Implement Article Translation Processor

**Date**: 2026-01-20 19:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a specialized processor function that retrieves article records, translates article fields, persists the translations, and updates job status.

### Current Behavior
No dedicated handler exists for processing article translation jobs. When translation jobs are created for articles, there is no mechanism to retrieve the article data, submit fields for translation, or store the translated results.

### Expected Behavior
The system provides an article translation processor function that executes the following workflow when invoked with a translation job:

**Data Retrieval**
- Accepts a translation job specification containing article identifier, target language, and job metadata
- Queries the database to retrieve the article record using the identifier
- Handles cases where the article no longer exists or has been deleted
- Returns appropriate error status if the article cannot be found

**Field Extraction and Translation**
- Extracts the title and description fields from the retrieved article record
- Prepares a translation request payload containing both fields
- Submits the translation request to the translation service established in Epic 1
- Specifies the source language and target language from the job metadata
- Handles translation service errors and timeouts appropriately

**Storage**
- Receives the translated title and description from the translation service
- Invokes the article translation storage utility from REQ-E03-005
- Passes the article identifier, target language, and translated field values
- Uses the UPSERT pattern to handle both new translations and updates
- Records translation metadata including timestamp and source version

**Job Status Management**
- Marks the translation job as completed upon successful storage
- Records completion timestamp in the job record
- For failures at any stage, marks the job as failed with detailed error information
- Respects job retry policies and backoff intervals
- Increments retry counters for transient failures

The processor maintains type safety throughout, handles errors gracefully at each stage, and provides detailed logging for troubleshooting.

### User Impact
Content owners will experience:
- Automatic translation of article titles and descriptions shortly after creation or update
- Reliable delivery of help articles and informational content in all supported languages
- Consistent translation quality for instructional content across languages
- Visibility into translation failures through job status tracking

Guests viewing articles will experience:
- Fully translated article titles and descriptions in their chosen language
- Access to help documentation and instructions regardless of language preference
- Consistent translation quality across all help content in a property

### Business Value
Extends multilingual automation to help articles and instructional content, ensuring international guests receive the same quality of support and guidance as native language speakers, reducing support tickets and improving guest satisfaction.

### Acceptance Criteria
- [ ] Function accepts a translation job object containing article ID, target language, and job metadata
- [ ] Function queries the database to retrieve the article record by ID
- [ ] Function handles missing or deleted articles with appropriate error status
- [ ] Function extracts title and description fields from the article record
- [ ] Function prepares translation request with both fields in a single API call
- [ ] Function calls the translation service with source language, target language, and field data
- [ ] Function handles translation service errors with retry logic for transient failures
- [ ] Function handles translation service timeouts with appropriate error status
- [ ] Function receives translated title and description from the translation service response
- [ ] Function calls the article translation storage utility from REQ-E03-005
- [ ] Function passes article ID, target language, and translated fields to storage utility
- [ ] Function marks job as completed in the job queue upon successful storage
- [ ] Function records completion timestamp in the job record
- [ ] Function marks job as failed with error details when any stage fails
- [ ] Function increments retry counter for transient errors (network, timeout, rate limit)
- [ ] Function does not retry for permanent errors (invalid article ID, unsupported language)
- [ ] Function respects maximum retry limits defined in job configuration
- [ ] Function logs all significant events (start, completion, errors) for troubleshooting
- [ ] TypeScript types are properly defined for job objects, responses, and error states
- [ ] Function is exported from the content translation module
- [ ] Function integrates cleanly with the job processor routing logic from REQ-E03-013

---



## REQ-E03-016: Implement Link Translation Processor

**Date**: 2026-01-20 20:15
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must provide a specialized processor function that retrieves link records, translates the title field only, persists the translation, and updates job status.

### Current Behavior
No dedicated handler exists for processing link translation jobs. When translation jobs are created for links, there is no mechanism to retrieve the link data, submit the title field for translation, or store the translated results.

### Expected Behavior
The system provides a link translation processor function that executes the following workflow when invoked with a translation job:

**Data Retrieval**
- Accepts a translation job specification containing link identifier, target language, and job metadata
- Queries the database to retrieve the link record using the identifier
- Handles cases where the link no longer exists or has been deleted
- Returns appropriate error status if the link cannot be found

**Field Extraction and Translation**
- Extracts only the title field from the retrieved link record
- Explicitly excludes the URL field from translation to preserve link functionality
- Prepares a translation request payload containing only the title field
- Submits the translation request to the translation service established in Epic 1
- Specifies the source language and target language from the job metadata
- Handles translation service errors and timeouts appropriately

**Storage**
- Receives the translated title from the translation service
- Invokes the link translation storage utility from REQ-E03-005
- Passes the link identifier, target language, and translated title value
- Uses the UPSERT pattern to handle both new translations and updates
- Records translation metadata including timestamp and source version
- Ensures the original URL is preserved in all language versions

**Job Status Management**
- Marks the translation job as completed upon successful storage
- Records completion timestamp in the job record
- For failures at any stage, marks the job as failed with detailed error information
- Respects job retry policies and backoff intervals
- Increments retry counters for transient failures

The processor maintains type safety throughout, handles errors gracefully at each stage, and provides detailed logging for troubleshooting. It differs from item and article processors by handling only a single field (title) rather than multiple fields.

### User Impact
Content owners will experience:
- Automatic translation of link titles shortly after creation or update
- Preservation of original URLs ensuring links remain functional across all languages
- Reliable delivery of localized link titles in all supported languages
- Consistent translation quality for curated links across languages
- Visibility into translation failures through job status tracking

Guests viewing links will experience:
- Translated link titles in their chosen language
- Functional links that navigate to the same destination regardless of language preference
- Better understanding of link purposes through localized titles
- Consistent link display quality across all content in their selected language

### Business Value
Completes the multilingual link infrastructure by ensuring link titles are localized while preserving link functionality, enabling international guests to understand the purpose of shared resources without compromising link integrity.

### Acceptance Criteria
- [ ] Function accepts a translation job object containing link ID, target language, and job metadata
- [ ] Function queries the database to retrieve the link record by ID
- [ ] Function handles missing or deleted links with appropriate error status
- [ ] Function extracts only the title field from the link record
- [ ] Function explicitly excludes the URL field from the translation request
- [ ] Function prepares translation request with only the title field
- [ ] Function calls the translation service with source language, target language, and title data
- [ ] Function handles translation service errors with retry logic for transient failures
- [ ] Function handles translation service timeouts with appropriate error status
- [ ] Function receives translated title from the translation service response
- [ ] Function calls the link translation storage utility from REQ-E03-005
- [ ] Function passes link ID, target language, and translated title to storage utility
- [ ] Function marks job as completed in the job queue upon successful storage
- [ ] Function records completion timestamp in the job record
- [ ] Function marks job as failed with error details when any stage fails
- [ ] Function increments retry counter for transient errors (network, timeout, rate limit)
- [ ] Function does not retry for permanent errors (invalid link ID, unsupported language)
- [ ] Function respects maximum retry limits defined in job configuration
- [ ] Function logs all significant events (start, completion, errors) for troubleshooting
- [ ] TypeScript types are properly defined for job objects, responses, and error states
- [ ] Function is exported from the content translation module
- [ ] Function integrates cleanly with the job processor routing logic from REQ-E03-013

---

## REQ-E03-017: Implement Tag Translation Processor

**Date**: 2026-01-20 20:45
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must provide a specialized processor function that retrieves tag records, translates the tag value, persists the translation as a user tag, and updates job status.

### Current Behavior
No dedicated handler exists for processing tag translation jobs. When translation jobs are created for user-defined tags, there is no mechanism to retrieve the tag data, submit the value for translation, or store the translated results.

### Expected Behavior
The system provides a tag translation processor function that executes the following workflow when invoked with a translation job:

**Data Retrieval**
- Accepts a translation job specification containing tag key, target language, and job metadata
- Queries the database to retrieve the tag record using the tag key
- Handles cases where the tag no longer exists or has been deleted
- Returns appropriate error status if the tag cannot be found

**Field Extraction and Translation**
- Extracts the tag value from the retrieved tag record
- Prepares a translation request payload containing the tag value
- Submits the translation request to the translation service established in Epic 1
- Specifies the source language and target language from the job metadata
- Handles translation service errors and timeouts appropriately

**Storage**
- Receives the translated tag value from the translation service
- Invokes the tag translation storage utility from REQ-E03-005
- Passes the tag key, target language, and translated value
- Explicitly sets is_system_tag to false to indicate this is a user-created tag
- Uses the UPSERT pattern to handle both new translations and updates
- Records translation metadata including timestamp and source version

**Job Status Management**
- Marks the translation job as completed upon successful storage
- Records completion timestamp in the job record
- For failures at any stage, marks the job as failed with detailed error information
- Respects job retry policies and backoff intervals
- Increments retry counters for transient failures

The processor maintains type safety throughout, handles errors gracefully at each stage, and provides detailed logging for troubleshooting. It differs from other content processors by handling a single text value and requiring the is_system_tag flag to be set.

### User Impact
Content owners will experience:
- Automatic translation of user-defined tags shortly after creation
- Tag vocabulary that works consistently across all supported languages
- Reliable delivery of localized tag names for categorization and search
- Visibility into translation failures through job status tracking

Guests will experience:
- Tag filtering and search that works in their chosen language
- Consistent tag display across all content in their selected language
- Better content discovery through localized tag vocabulary
- Seamless browsing experience with multilingual tag support

### Business Value
Completes the content translation infrastructure by handling the final translatable entity type, ensuring user-generated taxonomy is fully multilingual and enabling international guests to search and filter content using localized tag vocabulary.

### Acceptance Criteria
- [ ] Function accepts a translation job object containing tag key, target language, and job metadata
- [ ] Function queries the database to retrieve the tag record by key
- [ ] Function handles missing or deleted tags with appropriate error status
- [ ] Function extracts the tag value from the tag record
- [ ] Function prepares translation request with the tag value
- [ ] Function calls the translation service with source language, target language, and tag value
- [ ] Function handles translation service errors with retry logic for transient failures
- [ ] Function handles translation service timeouts with appropriate error status
- [ ] Function receives translated tag value from the translation service response
- [ ] Function calls the tag translation storage utility from REQ-E03-005
- [ ] Function passes tag key, target language, and translated value to storage utility
- [ ] Function explicitly sets is_system_tag parameter to false when storing translation
- [ ] Function marks job as completed in the job queue upon successful storage
- [ ] Function records completion timestamp in the job record
- [ ] Function marks job as failed with error details when any stage fails
- [ ] Function increments retry counter for transient errors (network, timeout, rate limit)
- [ ] Function does not retry for permanent errors (invalid tag key, unsupported language)
- [ ] Function respects maximum retry limits defined in job configuration
- [ ] Function logs all significant events (start, completion, errors) for troubleshooting
- [ ] TypeScript types are properly defined for job objects, responses, and error states
- [ ] Function is exported from the content translation module
- [ ] Function integrates cleanly with the job processor routing logic from REQ-E03-013

---

## REQ-E03-018: Implement Job Prioritization

**Date**: 2026-01-20 21:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The translation job processing system must prioritize jobs based on content recency and operation type to ensure the most critical translations are completed first.

### Current Behavior
Translation jobs are processed in the order they appear in the job queue without consideration for urgency or business priority. Newly created content translations may be delayed behind large batch operations, resulting in poor user experience when fresh content remains untranslated.

### Expected Behavior
The system implements a four-tier job prioritization scheme:

**Priority 100 - Recently Created Content**
- Translation jobs for content created within the last 5 minutes receive the highest priority
- Ensures new content becomes multilingual almost immediately
- Applies to all content types (items, articles, links, tags)

**Priority 50 - Updated Content**
- Translation jobs triggered by content updates receive high priority
- Ensures modifications are reflected in all languages promptly
- Balances urgency with batch operation efficiency

**Priority 25 - Batch Imports**
- Translation jobs created during bulk content imports receive medium priority
- Allows batch operations to complete without blocking individual content creation
- Prevents resource exhaustion during large import operations

**Priority 10 - Retry Failed Translations**
- Translation jobs being retried after previous failures receive lower priority
- Ensures system resources prioritize new content over error recovery
- Failed jobs still receive processing but do not block normal operations

The job picker query is modified to order results by priority descending (highest first), then by creation timestamp ascending (oldest first within the same priority level). This ensures deterministic, fair processing while respecting business priorities.

### User Impact
Content owners will experience:
- Near-instant multilingual availability when creating new content
- Rapid translation updates when modifying existing content
- Predictable translation timing regardless of background batch operations
- Better overall system responsiveness during content management workflows

Guests viewing content will experience:
- Minimal delay between content publication and multilingual availability
- Up-to-date translations when property owners make changes
- Consistent content freshness across all supported languages
- Improved overall content quality and currency

### Business Value
Optimizes translation processing to align with business priorities, ensuring the user experience for real-time content creation remains excellent even when background batch operations are running, improving perceived system performance and content owner satisfaction.

### Acceptance Criteria
- [ ] Priority calculation utility function exists that accepts a translation job and returns a numeric priority value
- [ ] Function assigns priority 100 to jobs where content was created less than 5 minutes ago
- [ ] Function determines content creation time by comparing job created_at timestamp with content entity created_at timestamp
- [ ] Function assigns priority 50 to jobs triggered by content updates (where entity updated_at differs from created_at)
- [ ] Function assigns priority 25 to jobs created during batch import operations (identified by batch identifier in job metadata)
- [ ] Function assigns priority 10 to jobs being retried (where retry_count is greater than zero)
- [ ] Priority field is added to translation jobs table schema via database migration
- [ ] Priority value is calculated and stored when jobs are created in the queue
- [ ] Job picker query includes ORDER BY priority DESC, created_at ASC clause
- [ ] Job processor retrieves jobs in priority order during each processing cycle
- [ ] Priority assignment logic is unit tested with scenarios for each priority tier
- [ ] Priority does not change after initial job creation (no dynamic re-prioritization)
- [ ] TypeScript types include priority field in translation job interface
- [ ] Priority calculation function is exported from the job queue module
- [ ] Database indexes support efficient priority-based job retrieval

---

## REQ-E03-019: Implement Concurrency Control

**Date**: 2026-01-20 22:00
**Type**: NEW FEATURE
**Size**: M

### Summary
The translation job processing system must limit concurrent translation API calls to prevent overwhelming the translation service provider and respect rate limits.

### Current Behavior
The job processor from Epic 1 does not enforce limits on how many translation API requests can be made simultaneously. During high-volume periods or batch operations, the system may attempt to process dozens or hundreds of translation jobs concurrently, potentially overwhelming the translation service provider, triggering rate limits, or degrading performance for all translation requests.

### Expected Behavior
The system implements a concurrency control mechanism that ensures no more than 10 translation API calls are in flight simultaneously:

**Semaphore-Based Throttling**
- A concurrency control utility maintains an internal counter tracking active translation requests
- Before initiating any translation API call, processors must acquire a slot from the concurrency controller
- If all 10 slots are occupied, the processor waits until a slot becomes available
- When a translation request completes (success or failure), the slot is released back to the controller
- The controller operates fairly, serving waiting processors in the order they requested slots

**Integration with Job Processors**
- All content-specific translation processors (items, articles, links, tags) integrate with the concurrency controller
- Processors acquire slots before calling the translation service API
- Processors release slots in finally blocks to ensure cleanup even during errors
- Slot acquisition includes timeout logic to prevent indefinite waiting

**Rate Limit Handling**
- When translation service returns rate limit errors (HTTP 429 or similar), the system does not immediately retry
- Rate-limited jobs are marked for delayed retry with exponential backoff
- Concurrency controller respects retry delay periods before allowing jobs to reacquire slots
- Multiple rate limit responses trigger progressive backoff increases

The concurrency control mechanism is transparent to job creation and queuing logic. It only affects job execution, ensuring smooth integration with existing translation infrastructure.

### User Impact
Content owners will experience:
- Stable, predictable translation processing speeds during all operational conditions
- No degradation of translation service quality during high-volume periods
- Reduced translation failures due to rate limiting
- More reliable completion of batch import operations

System administrators will experience:
- Predictable resource consumption patterns
- Ability to tune concurrency limits based on translation provider tier or plan
- Clear visibility into translation throughput capacity
- Reduced service errors and failed job counts

### Business Value
Protects the translation service provider relationship by respecting rate limits and preventing service disruptions, while ensuring consistent translation processing performance regardless of system load or batch operation volume.

### Acceptance Criteria
- [ ] Concurrency controller module exists with configurable maximum concurrent requests (default 10)
- [ ] Controller provides an acquire() method that returns a promise resolving when a slot is available
- [ ] Controller provides a release() method that frees a slot for waiting processors
- [ ] Controller tracks the count of currently active translation requests
- [ ] Controller queues waiting requests in FIFO order when all slots are occupied
- [ ] Acquire method accepts an optional timeout parameter and rejects the promise if timeout expires
- [ ] All four content-specific processors (items, articles, links, tags) call acquire() before translation API calls
- [ ] All four processors call release() in finally blocks to ensure cleanup on success or error
- [ ] Processors handle slot acquisition timeout errors appropriately by marking jobs for retry
- [ ] Rate limit detection logic identifies HTTP 429 responses from the translation service
- [ ] Rate-limited jobs are marked with exponential backoff delay before allowing requeue
- [ ] Concurrency controller respects rate limit backoff periods when evaluating job eligibility
- [ ] Controller exposes metrics (current active count, queue depth, total processed) for monitoring
- [ ] Configuration allows adjustment of maximum concurrent requests via environment variable
- [ ] TypeScript types properly define controller interface, acquire/release method signatures
- [ ] Unit tests verify slot acquisition, release, queuing, and timeout behavior
- [ ] Integration tests verify rate limit handling and backoff logic
- [ ] Documentation explains concurrency model and configuration options

---

## REQ-E03-020: Implement Stale Job Cleanup

**Date**: 2026-01-20 22:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The translation job processing system must automatically detect and recover jobs that become stuck in processing state, resetting them to queued status for retry.

### Current Behavior
Translation jobs that enter processing state can remain stuck indefinitely if the processor crashes, encounters unexpected errors, or loses connection during execution. These stale jobs are never completed or retried, resulting in permanently missing translations. The job queue accumulates stuck jobs that consume resources and distort processing metrics without contributing to translation completion.

### Expected Behavior
The system provides a cleanup mechanism that runs automatically before each job processing cycle:

**Stale Job Detection**
- Before picking new jobs from the queue, the processor scans for jobs in processing state
- Jobs are considered stale if they have been in processing state for more than 5 minutes
- Detection compares the current timestamp against the job's status_updated_at timestamp
- Only jobs with status equal to 'processing' and age exceeding the threshold are selected

**Job Recovery**
- Each detected stale job is reset to queued status to allow reprocessing
- The retry attempt counter is incremented by one to track recovery attempts
- If the job has exceeded maximum retry attempts, it is marked as failed instead of queued
- Status update timestamp is refreshed to current time
- Processing worker identifier is cleared to allow any worker to claim the job

**Cleanup Execution Timing**
- Cleanup runs synchronously before the job picker retrieves new jobs to process
- This ensures stale jobs are recovered and become available in the same processing cycle
- Cleanup operates on the entire job queue, not limited to a specific content type or language
- Cleanup execution is logged with count of recovered jobs for monitoring and alerting

**Maximum Retry Protection**
- Jobs that have been reset multiple times eventually fail permanently
- Default maximum retry limit is 3 attempts before permanent failure
- Failed jobs record the failure reason as "exceeded maximum retries after stale recovery"
- Failed jobs are excluded from future cleanup cycles

### User Impact
Content owners will experience:
- Automatic recovery of translations that were interrupted by system issues
- Reduced frequency of permanently missing translations
- More reliable translation completion during periods of system instability
- Confidence that temporary failures do not result in permanent content gaps

System operators will experience:
- Reduced manual intervention for stuck translation jobs
- Clear visibility into job recovery patterns through logs and metrics
- Early warning system for translation processing reliability issues
- Self-healing translation infrastructure that recovers from transient failures

### Business Value
Improves translation system resilience by automatically recovering from processor crashes, network interruptions, and unexpected errors, ensuring translations eventually complete even when individual processing attempts fail, reducing operational overhead and improving multilingual content coverage.

### Acceptance Criteria
- [ ] Cleanup function scans the job queue for jobs in processing state
- [ ] Cleanup identifies stale jobs where current time minus status_updated_at exceeds 5 minutes
- [ ] Cleanup runs before the job picker retrieves new jobs in each processing cycle
- [ ] Cleanup updates stale job status from processing to queued
- [ ] Cleanup increments the retry_count field for each recovered job
- [ ] Cleanup clears the processing_worker_id field to allow any worker to claim the job
- [ ] Cleanup updates the status_updated_at timestamp to current time
- [ ] Cleanup checks retry_count against maximum retry limit before resetting to queued
- [ ] Jobs exceeding maximum retry limit are marked as failed instead of queued
- [ ] Failed jobs record failure reason as "exceeded_max_retries_after_stale"
- [ ] Cleanup logs the count of jobs recovered in each execution
- [ ] Cleanup logs the count of jobs permanently failed due to retry limit
- [ ] Cleanup operation completes within reasonable time even with thousands of jobs in queue
- [ ] Cleanup uses database indexes to efficiently identify stale jobs
- [ ] Maximum retry limit is configurable via environment variable with default value of 3
- [ ] Stale threshold duration is configurable via environment variable with default of 5 minutes
- [ ] TypeScript types properly define cleanup function signature and configuration
- [ ] Unit tests verify stale job detection logic with various timestamp scenarios
- [ ] Unit tests verify retry limit enforcement and permanent failure marking
- [ ] Integration tests verify cleanup executes before job picking in the processing cycle

---

## REQ-E03-021: Create Translation Status API Endpoint

**Date**: 2026-01-20 10:13
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a public API endpoint that returns comprehensive translation status for any content entity, combining job processing status with stored translation records.

### Current Behavior
No API endpoint exists for querying translation status. Content consumers and UI components cannot determine whether translations are available, pending, or failed for a given piece of content. There is no way to check translation progress without direct database access.

### Expected Behavior
A GET endpoint is created that accepts entity type and entity identifier as route parameters and returns a comprehensive status response:

**Endpoint Structure**
- Route pattern uses dynamic segments for entity type and entity ID
- Supports entity types: item, article, link, tag
- Returns 404 for invalid entity types or non-existent entities
- Returns 200 with status payload for valid requests

**Response Payload Structure**
The response includes:
- Overall translation status (fully_translated, partially_translated, pending, not_started, has_failures)
- Completion percentage across all target languages
- Per-language status breakdown showing state for each supported language
- Timestamp of most recent translation update
- Array of available languages where translations are completed
- Array of pending languages where jobs are queued or processing
- Array of failed languages where translation attempts have failed

**Data Aggregation**
The endpoint integrates with translation status utilities from REQ-E03-006 to:
- Query translation job records for the specified entity
- Query completed translation records for the specified entity
- Combine job and translation data to determine current state
- Calculate completion metrics and aggregate language-specific status

**Cache Optimization**
Response headers include appropriate cache directives:
- Cache-Control header set to allow 1-minute caching for completed translations
- Cache-Control header set to no-cache for pending or failed translations
- ETag header based on translation update timestamp for conditional requests
- Last-Modified header reflecting most recent translation update

The endpoint provides type-safe responses through proper TypeScript interfaces and handles all error conditions gracefully.

### User Impact
UI components will be able to:
- Display accurate translation status badges on content list views
- Show translation progress indicators on content detail pages
- Enable or disable language selection based on translation availability
- Provide real-time feedback when translations are being processed
- Alert users when translations have failed and need attention

API consumers will experience:
- Single endpoint for all translation status queries regardless of content type
- Efficient caching that reduces database load for frequently accessed content
- Comprehensive status information that eliminates need for multiple API calls
- Clear differentiation between "not started," "in progress," and "completed" states

### Business Value
Enables transparency in the translation system by providing visibility into translation status, allowing UI components to provide accurate feedback to users and enabling content teams to identify translation gaps or failures quickly.

### Acceptance Criteria
- [ ] GET endpoint exists at route matching pattern with entityType and entityId parameters
- [ ] Endpoint validates entityType parameter against supported types (item, article, link, tag)
- [ ] Endpoint returns 400 error for unsupported entity types
- [ ] Endpoint queries database to verify entity existence before checking translation status
- [ ] Endpoint returns 404 error when entity does not exist
- [ ] Endpoint calls translation status utility from REQ-E03-006 to aggregate status data
- [ ] Endpoint returns 200 status with JSON payload for valid requests
- [ ] Response payload includes overall status enumeration value
- [ ] Response payload includes numeric completion percentage (0-100)
- [ ] Response payload includes array of per-language status objects
- [ ] Each language status object includes language code and status enumeration
- [ ] Response payload includes timestamp of most recent translation update
- [ ] Response payload includes array of completed language codes
- [ ] Response payload includes array of pending language codes
- [ ] Response payload includes array of failed language codes
- [ ] Response includes Cache-Control header with max-age=60 for fully translated content
- [ ] Response includes Cache-Control header with no-cache for partially translated or pending content
- [ ] Response includes ETag header computed from translation update timestamp
- [ ] Response includes Last-Modified header matching most recent translation update
- [ ] Endpoint handles database errors gracefully with 500 status and error payload
- [ ] Endpoint handles translation status utility errors gracefully
- [ ] TypeScript types are defined for request parameters, response payload, and error responses
- [ ] All types are properly exported from the API types module
- [ ] Endpoint execution completes within 500ms for typical content entities
- [ ] Endpoint includes appropriate CORS headers for cross-origin requests

---

## REQ-E03-022: Create Retry Failed Translations Endpoint

**Date**: 2026-01-20 23:00
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide an API endpoint that allows property owners to manually retry failed translation jobs for specific content entities and languages.

### Current Behavior
When translation jobs fail, they remain in failed state indefinitely with no mechanism for manual retry. Property owners cannot trigger re-translation attempts when failures occur due to temporary issues like network problems or rate limiting. Failed translations result in permanent content gaps unless database records are manually manipulated.

### Expected Behavior
A POST endpoint is created that accepts entity specifications and initiates retry operations:

**Request Processing**
- Endpoint accepts entity type and entity identifier as route or body parameters
- Accepts an optional array of target language codes to limit retry scope
- If no languages specified, retries all failed translation jobs for the entity
- If languages specified, retries only failed jobs for those specific languages
- Returns 400 error if entity type is invalid or entity does not exist
- Returns 200 with retry summary even if no failed jobs are found

**Job Reset Logic**
- Endpoint queries translation jobs table for jobs matching entity and language criteria
- Filters query to include only jobs where status equals 'failed'
- For each matching failed job, updates the database record:
  - Sets status from 'failed' back to 'queued'
  - Sets retry_count to zero to allow fresh retry attempts
  - Updates status_updated_at timestamp to current time
  - Clears any error messages or failure reasons
  - Clears processing worker identifier
- All job updates occur within a database transaction to ensure consistency

**Response Structure**
The endpoint returns a summary object containing:
- Total count of jobs that were reset to queued status
- Array of language codes that were affected
- Breakdown showing count per language
- Timestamp of the retry operation
- Entity identification information echoed from request

**Idempotency**
- Endpoint can be called multiple times safely
- If no failed jobs exist for the specified criteria, returns success with zero count
- Does not affect jobs in queued, processing, or completed states
- Only resets jobs that are currently in failed state

### User Impact
Property owners will experience:
- Ability to recover from temporary translation failures without technical support
- Control over which languages to retry when failures affect specific markets
- Visibility into how many translations were queued for retry
- Confidence that failed translations can be recovered without data loss
- Self-service translation management capabilities

UI components can provide:
- Retry buttons on content management interfaces when failures are detected
- Targeted retry controls for specific languages
- Feedback showing retry operation success and job counts
- Progressive disclosure of retry options only when failures exist

### Business Value
Empowers property owners to resolve translation issues independently, reducing support burden and improving multilingual content coverage by providing a self-service recovery mechanism for temporary failures.

### Acceptance Criteria
- [ ] POST endpoint exists accepting entityType and entityId as parameters
- [ ] Endpoint accepts optional languages array parameter in request body
- [ ] Endpoint validates entityType against supported types (item, article, link, tag)
- [ ] Endpoint returns 400 error for invalid entity types
- [ ] Endpoint queries database to verify entity existence
- [ ] Endpoint returns 404 error when entity does not exist
- [ ] Endpoint queries translation jobs table for failed jobs matching entity
- [ ] When languages parameter is provided, query filters to only those languages
- [ ] When languages parameter is omitted, query includes all languages
- [ ] Endpoint updates each failed job: status to 'queued', retry_count to 0
- [ ] Endpoint clears error_message field when resetting jobs
- [ ] Endpoint clears processing_worker_id field when resetting jobs
- [ ] Endpoint updates status_updated_at timestamp to current time
- [ ] All job updates execute within a single database transaction
- [ ] Endpoint rolls back transaction if any update fails
- [ ] Endpoint returns 200 status with summary payload on success
- [ ] Response payload includes total count of jobs reset
- [ ] Response payload includes array of affected language codes
- [ ] Response payload includes per-language breakdown of reset counts
- [ ] Response payload includes timestamp of retry operation
- [ ] Response payload includes entity type and ID for confirmation
- [ ] Endpoint returns success with zero count when no failed jobs exist
- [ ] Endpoint does not modify jobs in queued, processing, or completed states
- [ ] Endpoint can be called multiple times safely without side effects
- [ ] Endpoint handles database errors gracefully with 500 status
- [ ] TypeScript types are defined for request body, response payload, and errors
- [ ] Endpoint execution completes within 2 seconds for typical retry operations
- [ ] Endpoint includes appropriate authorization checks for entity ownership
- [ ] API documentation describes endpoint parameters, responses, and error codes

---

## REQ-E03-023: Create Manual Translation Override Endpoint

**Date**: 2026-01-20 10:29
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide an API endpoint that allows property owners with edit access to manually override automatic translations by providing their own translated content for specific languages.

### Current Behavior
Once automatic translations are generated, there is no mechanism for property owners to provide corrections or improvements. Users who are multilingual or who work with professional translators cannot substitute higher-quality translations for automatically generated content. All translations remain as initially generated regardless of quality or accuracy concerns.

### Expected Behavior
A PUT endpoint is created at the specified route pattern that accepts manual translation overrides:

**Endpoint Structure**
- Route includes dynamic segments for entity type, entity identifier, and target language code
- Accepts a request body containing field-level translation overrides
- Returns 404 for invalid entity types, non-existent entities, or unsupported language codes
- Returns 403 when the requesting user lacks edit permissions for the entity
- Returns 200 with updated translation status on successful override

**Field Validation**
- Endpoint validates that request body contains only translatable fields for the entity type
- For items: accepts name and description fields only
- For articles: accepts title and description fields only
- For links: accepts title field only, rejects attempts to translate URL
- For tags: accepts value field only
- Returns 400 error if request includes non-translatable or invalid fields
- Validates that field values are non-empty strings

**Authorization Check**
- Endpoint retrieves the specified content entity from the database
- Determines entity ownership or edit permission relationship
- Compares requesting user identifier against entity owner or editors list
- Denies request if user lacks edit access to the entity
- Authorization logic differs by entity type based on ownership model

**Translation Storage**
- Endpoint performs UPSERT operation on the appropriate translations table
- Sets translation status field to 'manual' to distinguish from automatic translations
- Records the current user identifier in a reviewed_by field
- Updates or creates translation record with provided field values
- Records timestamp of manual override operation
- Preserves other translation metadata like source language and creation date

**Response Structure**
The endpoint returns a confirmation object containing:
- Success indicator
- Entity identification information (type and ID)
- Target language code
- Count of fields that were updated
- Timestamp of the override operation
- Translation status value ('manual')

### User Impact
Property owners will experience:
- Ability to improve or correct automatic translations when quality issues are identified
- Control over final translation quality for critical content
- Support for professional translation workflows where human translators provide content
- Confidence that their manual translations will not be overwritten by automatic processes
- Flexibility to maintain multilingual content at desired quality standards

Multilingual staff will experience:
- Direct editing capability for translations in languages they speak
- Workflow integration with professional translation services
- Quality assurance capabilities for verifying automatic translation accuracy
- Authority to approve or refine machine-generated translations

### Business Value
Empowers property owners to maintain translation quality standards by allowing human oversight and correction of automatic translations, ensuring critical content meets accuracy and cultural appropriateness requirements while still benefiting from automatic translation for bulk content.

### Acceptance Criteria
- [ ] PUT endpoint exists at route pattern with entityType, entityId, and language parameters
- [ ] Endpoint validates entityType parameter against supported types (item, article, link, tag)
- [ ] Endpoint returns 400 error for unsupported entity types
- [ ] Endpoint validates language parameter against supported language codes
- [ ] Endpoint returns 400 error for unsupported language codes
- [ ] Endpoint queries database to verify entity existence before processing
- [ ] Endpoint returns 404 error when specified entity does not exist
- [ ] Endpoint retrieves entity record to determine ownership information
- [ ] Endpoint compares requesting user ID against entity owner or editors list
- [ ] Endpoint returns 403 error when user lacks edit access to entity
- [ ] Endpoint validates request body contains only valid translatable fields for entity type
- [ ] Endpoint returns 400 error when request includes non-translatable fields
- [ ] Endpoint returns 400 error when field values are empty or non-string
- [ ] Endpoint performs UPSERT operation on appropriate translation table (item_translations, article_translations, link_translations, or tag_translations)
- [ ] UPSERT operation sets status field to 'manual' value
- [ ] UPSERT operation records current user ID in reviewed_by field
- [ ] UPSERT operation updates all provided field values
- [ ] UPSERT operation updates timestamp field to current time
- [ ] UPSERT operation preserves existing metadata (source_language, created_at, etc.)
- [ ] Endpoint returns 200 status with success payload after successful override
- [ ] Response payload includes entity type and ID for confirmation
- [ ] Response payload includes target language code
- [ ] Response payload includes count of fields updated
- [ ] Response payload includes timestamp of operation
- [ ] Response payload includes translation status value ('manual')
- [ ] Endpoint handles database constraint violations gracefully with appropriate errors
- [ ] Endpoint handles database errors gracefully with 500 status
- [ ] TypeScript types are defined for request body, route parameters, and response payload
- [ ] Request body type definitions are entity-type-specific (different interfaces for items vs articles)
- [ ] Endpoint execution completes within 1 second for typical override operations
- [ ] Manual translations are never automatically overwritten by subsequent translation jobs
- [ ] API documentation describes endpoint parameters, authorization requirements, and field constraints
- [ ] Integration tests verify authorization checks prevent unauthorized overrides
- [ ] Integration tests verify manual status is set and reviewed_by is recorded

---

## REQ-E03-024: Create Batch Status Endpoint for List Views

**Date**: 2026-01-20 10:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide an API endpoint that efficiently returns translation status for multiple content entities in a single request, optimized for dashboard and list view scenarios.

### Current Behavior
The existing translation status endpoint from REQ-E03-021 handles only single entity queries. Dashboard and list views that display dozens or hundreds of content items must make separate API calls for each entity's translation status, resulting in poor performance, excessive network overhead, and potential rate limiting issues. There is no efficient way to query translation status for content collections.

### Expected Behavior
A POST endpoint is created that accepts an array of entity specifications and returns translation status for all entities in a single optimized response:

**Endpoint Structure**
- POST route accepts a request body containing an array of entity specifications
- Each specification includes entity type and entity identifier
- Endpoint supports mixed entity types within the same request (items, articles, links, tags)
- Returns 400 error for malformed request bodies or invalid entity types
- Returns 200 with status array matching the input order and length

**Request Body Structure**
The request accepts an array of entity specification objects, where each object contains:
- entityType field (item, article, link, or tag)
- entityId field (UUID or appropriate identifier)
- Optional fields parameter to request only specific status information
Request size is limited to 100 entities per call to prevent resource exhaustion

**Database Query Optimization**
The endpoint uses efficient batch queries to minimize database round trips:
- Groups entity specifications by type to enable type-specific batch queries
- Uses SQL IN clauses or similar constructs to retrieve job and translation data for all entities
- Executes separate optimized queries per entity type (maximum of 4 queries regardless of entity count)
- Aggregates results in memory to build per-entity status summaries
- Avoids N+1 query patterns that would degrade performance at scale

**Response Structure**
The endpoint returns an array of status summary objects in the same order as the request:
- Each element corresponds to the entity at the same index in the request array
- Per-entity summary includes overall translation status (fully_translated, partially_translated, pending, not_started, has_failures)
- Summary includes completion percentage across all target languages
- Summary includes array of available languages where translations exist
- Summary includes count of pending languages where jobs are queued or processing
- Summary includes count of failed languages where translation attempts have failed
- Response omits verbose per-language details to minimize payload size for large batches

**Error Handling**
- Invalid entity types in request return 400 with error details specifying which index failed validation
- Non-existent entities are included in response with status 'not_found' rather than failing entire request
- Database errors that affect specific entity queries mark those entities with status 'error' while returning successful results for others
- Complete database failure results in 500 status with error payload

### User Impact
Dashboard users will experience:
- Fast loading of list views showing translation status for all displayed content
- Single network request instead of dozens or hundreds of individual calls
- Responsive UI even when viewing large content collections
- Real-time translation status visibility across all content without performance degradation

Content managers will experience:
- Ability to quickly scan translation coverage across their entire property inventory
- Identification of content requiring translation attention in bulk views
- Efficient monitoring of translation progress for recent content batches
- Dashboard performance that remains consistent regardless of content volume

### Business Value
Enables practical translation status monitoring at scale by providing efficient batch query capabilities, allowing content managers to maintain visibility into multilingual coverage across large content collections without performance penalties.

### Acceptance Criteria
- [ ] POST endpoint exists at specified route accepting JSON request body
- [ ] Request body contains entities array with entityType and entityId for each element
- [ ] Endpoint validates request body structure and returns 400 for malformed requests
- [ ] Endpoint validates entityType values against supported types for each array element
- [ ] Endpoint returns 400 with index information when invalid types are found
- [ ] Endpoint enforces maximum request size of 100 entities and returns 400 when exceeded
- [ ] Endpoint groups entity specifications by type for efficient batch processing
- [ ] Endpoint executes batch database queries using IN clauses or equivalent constructs
- [ ] Endpoint performs maximum of 4 database queries regardless of entity count (one per entity type present)
- [ ] Endpoint retrieves translation job data for all specified entities in batch queries
- [ ] Endpoint retrieves translation record data for all specified entities in batch queries
- [ ] Endpoint aggregates job and translation data to determine per-entity status
- [ ] Endpoint returns 200 status with JSON array response
- [ ] Response array length matches request array length exactly
- [ ] Response array order matches request array order exactly
- [ ] Each response element includes entityType and entityId for reference
- [ ] Each response element includes overall status enumeration value
- [ ] Each response element includes completion percentage (0-100)
- [ ] Each response element includes array of available language codes
- [ ] Each response element includes count of pending languages
- [ ] Each response element includes count of failed languages
- [ ] Non-existent entities return element with status 'not_found' rather than failing request
- [ ] Entities with database query errors return element with status 'error' and error message
- [ ] Response excludes verbose per-language details to minimize payload size
- [ ] Endpoint completes within 2 seconds for requests containing 100 entities
- [ ] Endpoint completes within 500ms for requests containing 20 entities
- [ ] Database queries use appropriate indexes to ensure efficient execution
- [ ] Endpoint handles complete database failure with 500 status and error payload
- [ ] TypeScript types are defined for request body structure, entity specification, and response array
- [ ] Response type definitions enforce consistent structure across all entity types
- [ ] Endpoint includes appropriate CORS headers for cross-origin requests
- [ ] API documentation describes request format, response structure, and error scenarios
- [ ] API documentation includes example requests and responses
- [ ] Unit tests verify request validation logic and error handling
- [ ] Integration tests verify batch query optimization and performance characteristics
- [ ] Integration tests verify response ordering matches request ordering

---

## REQ-E03-025: Create Job Processing API Route

**Date**: 2026-01-20 10:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide an administrative API endpoint that triggers on-demand translation job processing with configurable batch sizes and returns detailed processing statistics.

### Current Behavior
Translation job processing occurs only through scheduled tasks or background workers. Administrators cannot manually trigger job processing to verify system functionality, recover from processing failures, or accelerate translations for time-sensitive content. There is no on-demand mechanism to process queued translation jobs immediately.

### Expected Behavior
A POST endpoint is created at the specified administrative route that initiates immediate translation job processing:

**Endpoint Structure**
- Route is secured behind administrative authentication or service role authorization
- Accepts POST requests with optional JSON body containing configuration parameters
- Returns 403 error when called by users lacking administrative privileges
- Returns 200 status with processing statistics on successful execution
- Operates synchronously, processing jobs and returning results before responding

**Request Parameters**
The endpoint accepts an optional request body containing:
- batchSize parameter controlling how many jobs to process in a single invocation (defaults to 10 if not provided)
- Maximum batch size is capped at 50 to prevent resource exhaustion
- Requests specifying batch sizes above the maximum are automatically capped rather than rejected

**Processing Execution**
When invoked, the endpoint:
- Runs the stale job cleanup routine before processing new jobs
- Invokes the job picker to retrieve up to batchSize queued jobs ordered by priority
- Processes each retrieved job using the content-specific handlers established in previous requirements
- Respects concurrency limits defined in the concurrency controller
- Continues processing even if individual jobs fail
- Tracks success and failure counts throughout execution
- Completes processing before returning response

**Response Structure**
The endpoint returns a statistics object containing:
- Total count of jobs that were processed (attempted)
- Count of jobs that completed successfully
- Count of jobs that failed during processing
- Count of stale jobs that were recovered before processing began
- Average processing duration per job in milliseconds
- Array of language codes that were processed
- Breakdown of job counts by content entity type (items, articles, links, tags)
- Timestamp marking when processing began and ended

**Authorization**
The endpoint implements strict authorization checks:
- Verifies requesting user has administrative role or system privileges
- Alternatively, accepts service role authentication tokens for automated triggers
- Returns 403 Forbidden error for unauthorized requests
- Logs all processing invocations with user identity for audit purposes

### User Impact
System administrators will experience:
- Ability to manually trigger translation processing during troubleshooting
- Immediate feedback on translation system functionality through processing statistics
- Control over batch sizes for testing or resource-constrained scenarios
- Visibility into job processing performance through detailed metrics
- Confidence that critical translations can be accelerated on demand

Automated systems will experience:
- Reliable API for implementing custom scheduling solutions
- Alternative to cron-based processing for serverless deployment environments
- Flexible batch size control for optimizing resource utilization
- Comprehensive processing metrics for monitoring and alerting systems

### Business Value
Enables manual intervention and custom automation for translation processing, providing operational flexibility for deployments that cannot use traditional scheduled tasks while maintaining visibility into processing performance and results.

### Acceptance Criteria
- [ ] POST endpoint exists at specified administrative route
- [ ] Endpoint enforces authentication and verifies administrative or service role privileges
- [ ] Endpoint returns 403 error when called by users lacking administrative access
- [ ] Endpoint accepts optional JSON body with batchSize parameter
- [ ] Endpoint defaults batchSize to 10 when parameter is not provided
- [ ] Endpoint validates batchSize is a positive integer
- [ ] Endpoint caps batchSize at maximum value of 50
- [ ] Endpoint returns 400 error for invalid batchSize values (negative, non-numeric)
- [ ] Endpoint executes stale job cleanup routine before processing jobs
- [ ] Endpoint invokes job picker to retrieve up to batchSize queued jobs
- [ ] Job picker respects priority ordering established in REQ-E03-018
- [ ] Endpoint processes each job using appropriate content-specific handler
- [ ] Endpoint respects concurrency limits from concurrency controller (REQ-E03-019)
- [ ] Endpoint continues processing remaining jobs even when individual jobs fail
- [ ] Endpoint tracks processing start and end timestamps
- [ ] Endpoint tracks count of successful job completions
- [ ] Endpoint tracks count of failed job attempts
- [ ] Endpoint tracks count of stale jobs recovered during cleanup
- [ ] Endpoint calculates average processing duration per job
- [ ] Endpoint aggregates processed language codes
- [ ] Endpoint aggregates job counts by entity type
- [ ] Endpoint returns 200 status with statistics payload on completion
- [ ] Response payload includes total processed count
- [ ] Response payload includes success count
- [ ] Response payload includes failure count
- [ ] Response payload includes stale recovery count
- [ ] Response payload includes average processing duration in milliseconds
- [ ] Response payload includes array of language codes processed
- [ ] Response payload includes entity type breakdown object
- [ ] Response payload includes processing start and end timestamps
- [ ] Endpoint completes synchronously before returning response
- [ ] Endpoint handles database errors gracefully with 500 status
- [ ] Endpoint logs invocation details including requesting user for audit trail
- [ ] Endpoint execution completes within reasonable time (under 30 seconds for batch size of 10)
- [ ] TypeScript types are defined for request body, response payload, and error responses
- [ ] API documentation describes endpoint parameters, authorization requirements, and response structure
- [ ] Integration tests verify authorization checks prevent unauthorized access
- [ ] Integration tests verify batch size validation and capping behavior
- [ ] Integration tests verify statistics accuracy by comparing against actual job processing results

---

## REQ-E03-026: Set Up Railway Cron Job for Translation Processing

**Date**: 2026-01-20 10:53
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must provide automated periodic triggering of translation job processing through a scheduled task that calls the processing endpoint at regular intervals.

### Current Behavior
No automated mechanism exists to trigger translation job processing. Jobs remain queued indefinitely unless manually processed via API calls. Content creators experience significant delays between content creation and multilingual availability because translation jobs are never automatically processed.

### Expected Behavior
A scheduled task is configured using Railway cron jobs or an alternative scheduling mechanism that automatically triggers translation processing:

**Scheduling Configuration**
- A cron expression is configured to invoke the job processing endpoint at regular intervals
- Recommended schedule: every 30 seconds for low latency translation delivery
- Alternative schedule: every 5 minutes for cost optimization when translation speed is less critical
- The schedule is configurable via environment variable to allow deployment-specific tuning
- Default configuration prioritizes user experience with 30-second intervals

**Processing Trigger**
- Each scheduled execution makes an authenticated HTTP POST request to the job processing endpoint from REQ-E03-025
- Request includes service role authentication token to authorize processing
- Request specifies a batch size appropriate for the scheduled interval (larger batches for less frequent runs)
- Scheduled task monitors response status and logs errors when processing fails
- Failed processing attempts are retried on the next scheduled interval without blocking future executions

**Configuration Options**
The deployment supports two operational modes:
- High-responsiveness mode: 30-second intervals with batch size of 10 jobs per run
- Cost-optimized mode: 5-minute intervals with batch size of 50 jobs per run
Mode selection is controlled via environment variable with high-responsiveness as default

**Railway-Specific Implementation**
If deploying on Railway:
- Railway cron job feature is used to define the schedule
- Job configuration specifies the API endpoint URL including full domain
- Authentication token is passed via environment variable
- Cron job logs are accessible through Railway dashboard for monitoring
- Job execution history is retained for troubleshooting

**Alternative Implementation**
If Railway cron jobs are unavailable or unsuitable:
- External scheduling service (GitHub Actions, Vercel Cron, AWS EventBridge) is used
- Service makes HTTP requests to the public API endpoint
- Service passes authentication credentials via headers
- Service implements retry logic for failed requests
- Documentation specifies alternative configuration steps

### User Impact
Content creators will experience:
- Automatic translation of new content within 30 seconds (or 5 minutes in cost-optimized mode)
- No manual intervention required to trigger translation processing
- Predictable translation delivery timing for planning content publication
- Consistent translation processing regardless of content creation timing
- Confidence that translations will complete without user action

System operators will experience:
- Simplified deployment with automatic translation processing
- Configurable scheduling to balance latency and resource consumption
- Visibility into processing execution through cron job logs
- Ability to tune processing frequency based on operational needs
- Self-healing translation infrastructure that processes jobs continuously

### Business Value
Completes the translation automation infrastructure by providing the scheduling mechanism that drives continuous job processing, eliminating manual intervention requirements and ensuring multilingual content availability with predictable latency.

### Acceptance Criteria
- [ ] Cron job or scheduled task is configured to run at regular intervals
- [ ] Default schedule is set to execute every 30 seconds
- [ ] Schedule interval is configurable via environment variable
- [ ] Alternative 5-minute schedule is documented for cost-optimized deployments
- [ ] Scheduled task makes authenticated HTTP POST request to job processing endpoint
- [ ] Request includes service role authentication token from environment variable
- [ ] Request specifies batch size parameter (10 for 30-second intervals, 50 for 5-minute intervals)
- [ ] Batch size is configurable via environment variable with sensible defaults per schedule
- [ ] Scheduled task logs successful execution with processing statistics
- [ ] Scheduled task logs errors when processing endpoint returns error status
- [ ] Failed executions do not prevent subsequent scheduled runs
- [ ] Railway cron job configuration is documented in deployment documentation
- [ ] Alternative scheduling approaches (GitHub Actions, Vercel Cron, etc.) are documented
- [ ] Environment variable documentation describes all configuration options
- [ ] Documentation includes setup instructions for Railway-specific configuration
- [ ] Documentation includes setup instructions for alternative scheduling services
- [ ] Deployment guide specifies how to verify cron job is running correctly
- [ ] Deployment guide includes troubleshooting steps for common scheduling issues
- [ ] Cron job execution can be monitored through platform-specific logs or dashboards
- [ ] Authentication token for scheduled processing is distinct from user authentication
- [ ] Authentication token has minimal required permissions (job processing only)

---

## REQ-E03-028: Create Translation Job Indexes

**Date**: 2026-01-20 11:15
**Type**: ENHANCEMENT
**Size**: S

### Summary
The translation job processing system must have optimized database indexes on the translation jobs table to ensure efficient job picking, status queries, and monitoring operations at scale.

### Current Behavior
The translation jobs table lacks comprehensive indexes for query patterns used by the job processor, monitoring endpoints, and status utilities. As the job queue grows to thousands or tens of thousands of records, query performance degrades significantly for operations like:
- Picking the next batch of jobs sorted by priority and creation time
- Identifying stale jobs that have been in processing state for extended periods
- Filtering jobs by entity type and status for statistics aggregation
- Looking up job status for specific entities and languages
Without proper indexes, these queries require full table scans that become prohibitively slow as data volume increases.

### Expected Behavior
The system applies database indexes through a migration that optimizes all critical query patterns:

**Primary Index for Job Picking**
An index on the combination of status, priority (descending), and created_at (ascending) enables the job picker to efficiently retrieve queued jobs in priority order. This index directly supports the query pattern established in REQ-E03-018 for prioritized job processing.

**Index for Stale Job Detection**
An index on the combination of status and status_updated_at enables the stale job cleanup routine from REQ-E03-020 to efficiently identify jobs that have been stuck in processing state beyond the threshold duration.

**Index for Entity Lookup**
An index on the combination of entity_type, entity_id, and target_language enables translation status queries from REQ-E03-021 and REQ-E03-024 to efficiently find all jobs associated with specific content entities.

**Index for Statistics Queries**
An index on the combination of status and updated_at enables the monitoring endpoint from REQ-E03-027 to efficiently calculate job counts and temporal metrics without scanning the entire table.

**Index for Language-Based Filtering**
An index on target_language enables efficient aggregation of job counts by language for monitoring and reporting purposes.

Each index is implemented using appropriate database-specific syntax (B-tree indexes for PostgreSQL/Supabase) and includes all columns needed to satisfy the query without additional table lookups where practical.

### User Impact
System administrators will experience:
- Fast response times for monitoring dashboards regardless of job queue size
- Consistent job processing performance even with large backlogs
- Ability to query translation status for specific content without performance degradation
- Predictable system behavior as translation volume scales

Content owners will experience:
- No delays when viewing translation status in UI components
- Fast loading of content list views that display translation badges
- Responsive translation management interfaces even with large content collections
- Reliable system performance during high-volume translation processing

### Business Value
Ensures the translation infrastructure can scale to production workloads by optimizing database queries, preventing performance degradation as content volume grows and maintaining consistent user experience regardless of system load.

### Acceptance Criteria
- [ ] Database migration file is created with appropriate naming convention and timestamp
- [ ] Migration includes CREATE INDEX statement for job picking using (status, priority DESC, created_at ASC)
- [ ] Migration includes CREATE INDEX statement for stale detection using (status, status_updated_at)
- [ ] Migration includes CREATE INDEX statement for entity lookup using (entity_type, entity_id, target_language)
- [ ] Migration includes CREATE INDEX statement for statistics using (status, updated_at)
- [ ] Migration includes CREATE INDEX statement for language filtering using (target_language)
- [ ] All CREATE INDEX statements include IF NOT EXISTS clause for safe rerunning
- [ ] Migration is tested on development database to verify syntax and execution
- [ ] Migration is applied to staging environment and performance is validated
- [ ] Job picker query execution plan shows index usage after migration
- [ ] Stale job cleanup query execution plan shows index usage after migration
- [ ] Translation status query execution plan shows index usage after migration
- [ ] Monitoring endpoint query execution plan shows index usage after migration
- [ ] Query performance is measured before and after migration showing improvement
- [ ] Index maintenance does not significantly impact job insert or update operations
- [ ] Migration includes appropriate comments documenting index purpose
- [ ] Migration includes DOWN migration statements to remove indexes if rollback is needed
- [ ] Documentation is updated to reflect index strategy and maintenance requirements

---

## REQ-E03-027: Implement Job Monitoring Endpoint

**Date**: 2026-01-20 10:59
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide an administrative API endpoint that returns real-time statistics about the translation job queue, including job counts by status, entity type filtering, and time-based metrics.

### Current Behavior
No API endpoint exists for monitoring the translation job queue health and status. Administrators cannot assess translation system performance, identify processing bottlenecks, or track job completion rates without direct database access. There is no visibility into how many jobs are pending, processing, or recently completed or failed.

### Expected Behavior
A GET endpoint is created that returns comprehensive translation job queue statistics:

**Endpoint Structure**
- Route accepts GET requests with optional query string parameters for filtering
- Returns 403 error when called by users lacking administrative privileges
- Returns 200 status with statistics payload on successful execution
- Supports filtering by entity type to isolate specific content translation metrics
- Supports filtering by status to focus on particular job states
- Does not require authentication for basic status checks but enforces authorization for detailed metrics

**Query Parameters**
The endpoint accepts optional filters:
- entityType parameter to limit statistics to specific content type (item, article, link, or tag)
- status parameter to limit statistics to specific job states (queued, processing, completed, failed)
- When filters are omitted, statistics cover all entity types and statuses
- Invalid filter values return 400 error with descriptive error message

**Statistics Calculation**
The endpoint queries the translation jobs table to calculate:

**Queue Metrics**
- Count of jobs currently in queued status awaiting processing
- Count of jobs currently in processing status being actively translated
- Count of jobs completed successfully within the last hour
- Count of jobs that failed within the last hour
- Average queue wait time for jobs that transitioned from queued to processing in the last hour
- Oldest queued job timestamp to identify stale queue conditions

**Entity Breakdown**
- Job count breakdown by entity type (items, articles, links, tags)
- Separate counts for queued, processing, completed, and failed states per entity type
- Allows identification of which content types have processing backlogs

**Language Breakdown**
- Job count breakdown by target language code
- Identifies whether specific languages have processing delays
- Helps administrators allocate processing resources based on language demand

**Temporal Metrics**
- Completed job count for the last hour
- Failed job count for the last hour
- Average processing duration for completed jobs in the last hour
- Provides insight into recent processing velocity and success rates

**Response Structure**
The endpoint returns a statistics object containing:
- Overall queue depth (total queued jobs)
- Active processing count (total jobs currently being processed)
- Completed count for last hour with timestamp window
- Failed count for last hour with timestamp window
- Entity type breakdown object with per-type counts
- Language breakdown object with per-language counts
- Average processing duration in milliseconds
- Average queue wait time in milliseconds
- Oldest queued job timestamp
- Response timestamp

**Performance Optimization**
- Statistics queries use database indexes on status and timestamp fields
- Counts are calculated using efficient aggregate queries rather than retrieving full records
- Filtering reduces query scope to improve response times for targeted metrics
- Response is cacheable for short periods (30 seconds) to reduce database load during repeated checks

### User Impact
System administrators will experience:
- Real-time visibility into translation system health and performance
- Ability to identify processing bottlenecks by entity type or language
- Early warning when job queues grow beyond normal thresholds
- Insight into translation success rates through failed job metrics
- Data for capacity planning and resource allocation decisions
- Quick assessment of whether translation processing is keeping pace with content creation

Operations teams will experience:
- Monitoring endpoint for alerting systems to detect queue backup conditions
- Metrics for dashboard visualizations showing translation system health
- Data for investigating performance degradation or processing failures
- Historical context through hourly completion and failure rates
- Ability to validate that processing configuration changes are effective

### Business Value
Enables proactive monitoring and operational visibility into the translation infrastructure, allowing administrators to identify and resolve processing issues before they impact content availability and user experience.

### Acceptance Criteria
- [ ] GET endpoint exists at route matching pattern with optional query parameters
- [ ] Endpoint enforces authentication for detailed administrative metrics
- [ ] Endpoint returns 403 error when called by users lacking administrative access
- [ ] Endpoint accepts optional entityType query parameter
- [ ] Endpoint validates entityType against supported values (item, article, link, tag)
- [ ] Endpoint returns 400 error for invalid entityType values
- [ ] Endpoint accepts optional status query parameter
- [ ] Endpoint validates status against supported values (queued, processing, completed, failed)
- [ ] Endpoint returns 400 error for invalid status values
- [ ] Endpoint queries translation jobs table for queued job count
- [ ] Endpoint queries translation jobs table for processing job count
- [ ] Endpoint queries translation jobs table for completed jobs in last hour using timestamp filter
- [ ] Endpoint queries translation jobs table for failed jobs in last hour using timestamp filter
- [ ] Endpoint calculates average queue wait time using queued_at and processing_started_at timestamps
- [ ] Endpoint identifies oldest queued job timestamp
- [ ] Endpoint aggregates job counts by entity type
- [ ] Endpoint aggregates job counts by target language code
- [ ] Endpoint calculates average processing duration for completed jobs using processing_started_at and completed_at timestamps
- [ ] Endpoint applies entityType filter to all queries when parameter is provided
- [ ] Endpoint applies status filter to all queries when parameter is provided
- [ ] Endpoint returns 200 status with JSON statistics payload
- [ ] Response payload includes queuedCount field
- [ ] Response payload includes processingCount field
- [ ] Response payload includes completedLastHour field with count and time window
- [ ] Response payload includes failedLastHour field with count and time window
- [ ] Response payload includes entityTypeBreakdown object with per-type statistics
- [ ] Response payload includes languageBreakdown object with per-language statistics
- [ ] Response payload includes averageProcessingDurationMs field
- [ ] Response payload includes averageQueueWaitTimeMs field
- [ ] Response payload includes oldestQueuedJobTimestamp field
- [ ] Response payload includes responseTimestamp field
- [ ] Endpoint uses database indexes to optimize statistics queries
- [ ] Endpoint executes all statistics calculations using aggregate queries (COUNT, AVG) rather than retrieving full records
- [ ] Endpoint completes within 500ms for typical job queue sizes
- [ ] Endpoint handles database errors gracefully with 500 status
- [ ] Response includes Cache-Control header with max-age=30 to allow short-term caching
- [ ] TypeScript types are defined for query parameters and response payload structure
- [ ] API documentation describes endpoint parameters, response fields, and filtering behavior
- [ ] API documentation includes example responses for typical scenarios
- [ ] Integration tests verify filtering logic produces correct scoped statistics
- [ ] Integration tests verify timestamp-based filtering for hourly metrics
- [ ] Integration tests verify aggregate calculations match expected values

---

## REQ-E03-028: Create Translation Lookup Indexes

**Date**: 2026-01-20 16:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
Database indexes must be created on all translation tables to enable fast lookup of translated content by entity ID and language combination.

### Current Behavior
Translation tables exist without optimized indexes for the primary access pattern of retrieving translations by entity identifier and target language, resulting in sequential scans for translation queries.

### Expected Behavior
When the system queries for translated content, database indexes facilitate rapid retrieval using the entity ID and language code composite key without requiring full table scans.

### User Impact
Property owners and guests experience faster page load times when viewing content in non-source languages, as translation retrieval operations complete with minimal database query latency.

### Business Value
Optimizes the most frequent database access pattern in the localization system, ensuring translation retrieval scales efficiently as content volume grows across multiple languages.

### Acceptance Criteria
- [ ] Migration script creates composite index on item_translations table for (item_id, language) columns
- [ ] Migration script creates composite index on article_translations table for (article_id, language) columns
- [ ] Migration script creates composite index on link_translations table for (link_id, language) columns
- [ ] Migration script creates composite index on tag_translations table for (tag_key, language) columns
- [ ] All index creation statements use IF NOT EXISTS clause to enable safe re-execution
- [ ] Migration applies indexes using CREATE INDEX CONCURRENTLY to avoid table locking on production databases
- [ ] Migration includes descriptive naming convention identifying table and columns (idx_<table>_lookup pattern)
- [ ] Database query planner uses new indexes for translation lookup queries (verified via EXPLAIN ANALYZE)
- [ ] Translation retrieval queries complete in under 10ms for typical dataset sizes
- [ ] Index creation completes successfully on development environment
- [ ] Index creation completes successfully on staging environment
- [ ] TypeScript database types remain unchanged (indexes are transparent to application layer)
- [ ] Migration reversibility is documented with corresponding DROP INDEX statements
- [ ] Performance benchmarks demonstrate query speed improvement compared to pre-index baseline
- [ ] Database monitoring confirms index usage during normal application operation

---

## REQ-E03-029: Add Updated_At Trigger for Translations

**Date**: 2026-01-20 16:50
**Type**: ENHANCEMENT
**Size**: S

### Summary
Database triggers must automatically update the updated_at timestamp column whenever translation records are modified, ensuring accurate modification tracking without requiring application-level timestamp management.

### Current Behavior
Translation records may have stale or manually-managed updated_at timestamps that require explicit application code to set during every update operation, creating risk of inconsistent or missing modification timestamps.

### Expected Behavior
When any translation record is modified through UPDATE statements, the database automatically sets the updated_at column to the current timestamp without requiring application code intervention.

### User Impact
Property owners viewing translation management interfaces see accurate "last modified" timestamps that reflect the true recency of translation updates, enabling informed decisions about which translations may need review or regeneration.

System administrators benefit from reliable audit trails showing when translation content was last changed, supporting troubleshooting and content history tracking.

### Business Value
Ensures data integrity for translation modification timestamps through database-level enforcement, reducing application complexity and eliminating the risk of stale timestamps from missed application-level updates.

### Acceptance Criteria
- [ ] Migration script creates reusable trigger function named update_updated_at_column or equivalent
- [ ] Trigger function sets NEW.updated_at to current timestamp (NOW() or CURRENT_TIMESTAMP)
- [ ] Trigger function returns NEW record to allow UPDATE to proceed
- [ ] Migration creates BEFORE UPDATE trigger on item_translations table
- [ ] Migration creates BEFORE UPDATE trigger on article_translations table
- [ ] Migration creates BEFORE UPDATE trigger on link_translations table
- [ ] Migration creates BEFORE UPDATE trigger on tag_translations table
- [ ] All triggers fire only on UPDATE operations, not on INSERT or DELETE
- [ ] All triggers execute the shared trigger function
- [ ] All trigger creation statements use IF NOT EXISTS clause or equivalent idempotent pattern
- [ ] Migration includes descriptive naming convention for triggers (trigger_update_<table>_timestamp pattern)
- [ ] Trigger function creation uses OR REPLACE clause to allow safe re-execution
- [ ] Manual UPDATE statement on translation record automatically updates the timestamp
- [ ] Application-level UPDATE operations observe automatic timestamp updates
- [ ] Trigger does not interfere with explicit updated_at values during INSERT operations
- [ ] Trigger executes efficiently without measurable performance impact on UPDATE operations
- [ ] Migration succeeds on development environment
- [ ] Migration succeeds on staging environment
- [ ] TypeScript database types remain unchanged (triggers are transparent to application layer)
- [ ] Migration reversibility is documented with corresponding DROP TRIGGER statements
- [ ] Updated_at columns reflect accurate modification times after trigger deployment
- [ ] Database logs confirm trigger execution during translation update operations


---

## REQ-E03-030: Write Unit Tests for Content Translation Module

**Date**: 2026-01-20 18:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
Comprehensive unit tests must be created for the content translation orchestration module to verify translation queueing logic, entity-specific trigger behavior, and source language detection functionality operate correctly across all supported content types.

### Current Behavior
Content translation orchestration code exists without automated test coverage, requiring manual verification of translation queueing behavior and increasing risk of regression when modification or refactoring occurs.

### Expected Behavior
When developers run the test suite, automated unit tests verify that translation orchestration functions correctly queue translation jobs for all entity types, properly detect source languages, and trigger appropriate translation workflows based on content type and state.

### User Impact
Developers working on translation features have confidence that changes do not introduce regressions, as automated tests catch logic errors before code reaches production environments.

Property owners benefit indirectly through higher quality translation features with fewer bugs and more reliable content localization behavior.

### Business Value
Establishes quality assurance foundation for the translation system, reducing debugging time and preventing translation-related bugs from affecting user experience in production.

### Acceptance Criteria
- [ ] Test file created for queueContentTranslations function with complete coverage of all code paths
- [ ] Tests verify translation jobs are queued for each supported entity type (items, articles, links, tags)
- [ ] Tests verify correct job priority assignment based on content type and update context
- [ ] Tests verify translation jobs include all required metadata (entity ID, type, source language, target languages)
- [ ] Tests verify no translation jobs are queued when content is unchanged or in draft state
- [ ] Tests verify translation jobs include source version tracking for staleness detection
- [ ] Test file created for entity-specific translation triggers with coverage of each content type
- [ ] Tests verify item translation trigger extracts correct translatable fields (name, location, notes)
- [ ] Tests verify article translation trigger extracts correct translatable fields (title, content)
- [ ] Tests verify link translation trigger extracts correct translatable fields (title, description)
- [ ] Tests verify tag translation trigger handles both new and existing tag scenarios
- [ ] Tests verify triggers respect translation enabled/disabled configuration flags
- [ ] Tests verify triggers handle database errors gracefully with appropriate error responses
- [ ] Test file created for source language detection utility with comprehensive test cases
- [ ] Tests verify language detection for all supported source languages with typical text samples
- [ ] Tests verify language detection handles mixed-language content appropriately
- [ ] Tests verify language detection defaults to configured fallback language for ambiguous content
- [ ] Tests verify language detection handles empty or very short text inputs
- [ ] Tests verify language detection confidence scoring when available from detection library
- [ ] All tests use proper mocking for external dependencies (database, translation API, job queue)
- [ ] All tests follow established naming conventions and file organization patterns
- [ ] All tests execute successfully in CI environment without flakiness
- [ ] Test coverage report shows minimum 90% line coverage for tested modules
- [ ] Test coverage report shows minimum 85% branch coverage for tested modules
- [ ] Tests execute in under 5 seconds total to maintain fast test suite performance
- [ ] Tests are documented with clear descriptions of scenario being verified
- [ ] Tests include both positive cases (expected behavior) and negative cases (error conditions)
- [ ] Tests verify TypeScript type safety for all function parameters and return values
- [ ] Test suite runs successfully on development environment
- [ ] Test suite runs successfully in CI/CD pipeline

---

## REQ-E03-031: Write Unit Tests for Job Processing

**Date**: 2026-01-20 10:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system should include comprehensive unit tests for the job processing functionality to ensure reliable background translation operations.

### Current Behavior
Job processing code exists but lacks dedicated unit test coverage for job pickup, locking, retry logic, and concurrency control mechanisms.

### Expected Behavior
A complete suite of unit tests should verify that:
- Jobs are correctly picked up and locked to prevent duplicate processing
- Entity-specific processors handle their respective content types accurately
- Retry logic activates appropriately when jobs fail
- Concurrency controls prevent race conditions and resource conflicts

### User Impact
Developers gain confidence that the background job system behaves correctly under various conditions, reducing the likelihood of translation failures or duplicate processing in production.

### Business Value
Robust testing prevents data inconsistencies and ensures that translations complete reliably, maintaining user trust in the multilingual content system.

### Acceptance Criteria
- [ ] Unit tests verify job pickup selects pending jobs and marks them as processing
- [ ] Unit tests confirm locking mechanism prevents concurrent processing of the same job
- [ ] Unit tests validate each entity-specific processor (items, articles, links, tags) handles its content type
- [ ] Unit tests check retry logic increments attempt count and respects maximum retry limits
- [ ] Unit tests verify concurrency control limits the number of simultaneous job executions
- [ ] All tests pass consistently without flakiness
- [ ] Test coverage for job processing modules exceeds 80%


---

## REQ-E03-032: Write Integration Tests for API Endpoints

**Date**: 2026-01-20 (System Date: 2026-01-20)
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide comprehensive integration tests that verify API endpoints correctly trigger translation jobs and return expected responses for content creation and translation management operations.

### Current Behavior
No integration tests exist to verify that API endpoints properly trigger translation workflows, handle status requests, retry failed jobs, or apply manual overrides.

### Expected Behavior
When integration tests are executed, they should verify that:
- Creating items through the API triggers translation jobs for all supported languages
- Creating articles through the API triggers translation jobs for all supported languages
- The translation status endpoint returns accurate status information for content
- The retry endpoint successfully requeues failed translation jobs
- The manual override endpoint correctly updates translations and marks them as manually edited

### User Impact
**Affected Users**: Development team, QA team, DevOps
**Impact**: Development teams gain confidence that translation workflows function correctly end-to-end, reducing production bugs and improving system reliability.

### Business Value
Integration tests catch workflow issues before deployment, ensuring that the translation system reliably serves multilingual content to guests and reduces support burden from translation failures.

### Acceptance Criteria
- [ ] Test suite verifies item creation API triggers translations for all target languages
- [ ] Test suite verifies article creation API triggers translations for all target languages
- [ ] Test suite validates translation status endpoint returns correct status for pending, in-progress, completed, and failed translations
- [ ] Test suite confirms retry endpoint successfully requeues failed jobs and updates job status
- [ ] Test suite verifies manual override endpoint updates translation content and sets manual flag
- [ ] All tests use realistic test data and verify database state changes
- [ ] Tests include error scenarios such as invalid content IDs, unsupported languages, and missing translations
- [ ] Test suite runs successfully in CI/CD pipeline

---

## REQ-E03-033: Write End-to-End Tests for Complete Translation Workflow

**Date**: 2026-01-20 15:45
**Type**: NEW FEATURE
**Size**: L

### Summary
The system must include comprehensive end-to-end tests that validate the complete translation workflow from content creation through job processing to final translation storage and status verification.

### Current Behavior
No end-to-end tests exist to verify that the entire translation pipeline functions correctly across all integrated components including API endpoints, job queue, background processors, database storage, and status tracking.

### Expected Behavior
When end-to-end tests execute, they should simulate real-world usage patterns by:
- Creating content items that automatically trigger translation job creation
- Waiting for background job processors to pick up and execute translation jobs
- Verifying that translated content is correctly stored in the database with proper metadata
- Checking that translation status accurately reflects the current state of all translations
- Testing retry mechanisms for failed translations to ensure they are properly re-queued and processed

### User Impact
**Affected Users**: Development team, QA team, product owners
**Impact**: Teams gain confidence that the entire translation system functions correctly in production-like scenarios, ensuring guests receive properly translated content without manual intervention or debugging.

### Business Value
End-to-end testing validates that all system components work together seamlessly, reducing the risk of translation failures that could result in incomplete multilingual experiences for international guests and damage to brand reputation.

### Acceptance Criteria
- [ ] Test creates an item via API and verifies translation jobs are queued for all target languages
- [ ] Test creates an article via API and verifies translation jobs are queued for all target languages
- [ ] Test creates a link via API and verifies translation jobs are queued for all target languages
- [ ] Test waits for job processing to complete and verifies translations are stored in database
- [ ] Test verifies translated content matches expected structure with all required fields populated
- [ ] Test checks translation status endpoint reports "completed" for successfully processed translations
- [ ] Test verifies translation metadata includes correct source language, target language, and timestamps
- [ ] Test simulates translation failure scenario and verifies job status is marked as "failed"
- [ ] Test uses retry endpoint to re-queue failed translation job
- [ ] Test verifies retried job is picked up by processor and successfully completes
- [ ] Test validates that manual translation overrides are properly preserved and flagged
- [ ] Test confirms stale translation detection when source content is updated after translation
- [ ] Test verifies batch status endpoint returns correct aggregated status for multiple items
- [ ] Test includes realistic timing for job processing with appropriate wait/polling mechanisms
- [ ] Test suite uses isolated test data that doesn't interfere with other tests or production data
- [ ] Test suite properly cleans up test data after execution
- [ ] All E2E tests pass consistently in CI/CD environment
- [ ] Test execution time is reasonable (under 5 minutes for complete suite)
- [ ] Tests include detailed logging to aid in debugging failures
- [ ] Tests verify proper error handling when translation API is unavailable

---


---

## REQ-E03-034: Conduct Performance Testing with 100+ Concurrent Translation Jobs

**Date**: 2026-01-20 15:52
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must be validated to handle high-volume translation workloads by testing with 100+ concurrent translation jobs while measuring completion times and verifying rate limiting functions correctly.

### Current Behavior
The translation job processing system has not been tested under high-concurrency conditions, leaving uncertainty about system behavior when many translation jobs are queued simultaneously.

### Expected Behavior
When performance testing is conducted, the system should successfully process 100+ concurrent translation jobs with:
- Each individual job completing within 60 seconds from queue submission to storage
- Rate limiting preventing API quota exhaustion while maintaining acceptable throughput
- No job failures due to resource contention or concurrency issues
- Accurate status tracking for all jobs throughout the processing lifecycle

### User Impact
**Affected Users**: All property owners creating or updating content during peak usage periods
**Impact**: Owners can confidently publish content knowing that translations will complete promptly even when multiple users are actively creating content simultaneously, ensuring guests receive translated content without delays.

### Business Value
Performance validation ensures the translation system scales to support growth in user adoption and content creation volume, preventing service degradation that could result in incomplete multilingual experiences or frustrated property owners.

### Acceptance Criteria
- [ ] Performance test creates 100+ translation jobs simultaneously across multiple content types
- [ ] Test measures and records job completion time for each individual translation job
- [ ] 95th percentile job completion time is under 60 seconds
- [ ] No jobs fail due to timeout or resource exhaustion
- [ ] Rate limiting correctly throttles API requests to stay within provider limits
- [ ] Rate limiting does not cause excessive job failures or retries
- [ ] Concurrent job processing respects configured maximum concurrent job limit
- [ ] Database connection pool handles concurrent load without exhaustion
- [ ] Test monitors system resource utilization (CPU, memory, database connections) during load
- [ ] No memory leaks detected during sustained high-concurrency operation
- [ ] Job status tracking remains accurate for all jobs under concurrent load
- [ ] Test results are documented with graphs showing throughput and completion times
- [ ] Test verifies system recovers gracefully when load returns to normal levels
- [ ] Performance test can be run in staging environment without affecting production data

