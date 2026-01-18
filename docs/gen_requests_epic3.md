# Generated Requests - Epic 3

This file contains auto-generated feature requests for L10N Epic 3.

---

## REQ-259: Create Content Translation Module Structure and Type Definitions

**Date**: 2026-01-18 (Generated)
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must provide a foundational module structure and comprehensive type definitions for translating dynamic user-generated content across all supported languages.

### Current Behavior
No structured mechanism exists for handling translation of dynamic content such as property descriptions, amenities, house rules, and other user-generated text that varies by property and owner.

### Expected Behavior
Developers can import well-defined TypeScript interfaces and types that describe how content translation requests are structured, how translation metadata is stored, and how translation results are returned. The module provides a clear contract for content that needs translation, including fields like property descriptions, amenity names, house rules, and FAQ items.

### User Impact
This foundational infrastructure enables property owners to have their dynamic content automatically translated into multiple languages, improving discoverability and accessibility for international guests. Without this structure, multilingual support for user-generated content cannot be implemented consistently.

### Business Value
Establishes the architectural foundation for dynamic content translation across the platform, enabling property listings to reach international audiences and improving booking conversion rates for non-English speaking guests.

### Acceptance Criteria
- [ ] A module index file exports all public-facing translation types and interfaces
- [ ] Type definitions include interfaces for translatable content entities (properties, amenities, rules, FAQs)
- [ ] Type definitions specify translation metadata (source language, target languages, translation status, timestamps)
- [ ] Type definitions support batch translation operations for efficiency
- [ ] Type definitions include error handling structures for failed or partial translations
- [ ] All types are properly exported and importable by other application modules
- [ ] Type definitions align with the database schema established in Epic 3 foundation tasks

---

## REQ-260: Implement Content Translation Orchestrator

**Date**: 2026-01-18 12:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a centralized orchestration function that coordinates the creation and queuing of translation jobs for user-generated content across all target languages.

### Current Behavior
No mechanism exists to automatically coordinate translation job creation when content needs to be translated into multiple languages. Property owners must manually manage translation requests, and there is no systematic way to ensure content is translated consistently across all required languages.

### Expected Behavior
When content requires translation, the system accepts a translation request specifying the content, source language, and target languages, then automatically creates and queues individual translation jobs for each target language. The orchestrator returns a summary indicating which jobs were successfully queued, which failed, and provides tracking identifiers for monitoring translation progress. The system handles batch operations efficiently and integrates seamlessly with the translation service infrastructure established in Epic 1.

### User Impact
Property owners can request translations for their content and trust that the system will automatically handle translation into all selected languages without requiring separate requests per language. The system provides clear feedback about translation job status and handles errors gracefully, ensuring owners know if any translations failed to queue.

### Business Value
Streamlines the translation workflow by automating the coordination of multiple translation jobs, reducing manual effort and ensuring consistent multilingual content availability. This automation improves operational efficiency and reduces the time-to-market for multilingual property listings.

### Acceptance Criteria
- [ ] A queueContentTranslations function accepts options including content identifier, source language, target languages, and content type
- [ ] The function creates individual translation jobs for each specified target language
- [ ] The function returns a result object indicating successful job queues, failed attempts, and job tracking identifiers
- [ ] QueueTranslationOptions type defines all required parameters for initiating translation orchestration
- [ ] QueueTranslationResult type provides comprehensive feedback about queued jobs and any failures
- [ ] The orchestrator integrates with translation service types and infrastructure from Epic 1
- [ ] The function handles errors gracefully and provides detailed error information for failed job creation
- [ ] The implementation supports batch translation operations for multiple content items
- [ ] Job creation respects rate limiting and concurrency constraints from the translation service layer

---

## REQ-261: Implement Entity-Specific Translation Triggers

**Date**: 2026-01-18 12:55
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide dedicated trigger functions for each content entity type (items, articles, links) that extract translatable fields and initiate translation job creation with appropriate language settings.

### Current Behavior
No specialized functions exist to handle translation initiation for different content entity types. The system cannot automatically identify which fields need translation for items, articles, or links, nor can it extract the appropriate content and queue translation jobs based on entity-specific requirements.

### Expected Behavior
When an item, article, or link requires translation, the system provides a dedicated trigger function that accepts the entity identifier and source language, automatically extracts the relevant translatable fields for that entity type, and queues translation jobs through the orchestrator. Item translations include name and description fields, article translations include title and description fields, and link translations include only the title field while preserving the original URL unchanged. Each trigger function returns comprehensive job status information to track translation progress.

### User Impact
Property owners and content managers can trigger translations for specific content entities without needing to know which fields are translatable or how to structure translation requests. The system automatically handles the complexity of identifying translatable content and ensures that appropriate fields are translated while non-translatable fields like URLs remain unchanged.

### Business Value
Simplifies the translation workflow by providing entity-aware translation triggers that understand the structure and requirements of different content types, reducing implementation complexity and ensuring consistent translation behavior across all content entities.

### Acceptance Criteria
- [ ] A triggerItemTranslation function accepts item identifier and source language parameters
- [ ] The item trigger extracts name and description fields from the specified item
- [ ] The item trigger queues translation jobs for the extracted fields and returns job status information
- [ ] A triggerArticleTranslation function accepts article identifier and source language parameters
- [ ] The article trigger extracts title and description fields from the specified article
- [ ] The article trigger queues translation jobs for the extracted fields and returns job status information
- [ ] A triggerLinkTranslation function accepts link identifier and source language parameters
- [ ] The link trigger extracts only the title field and explicitly excludes URL fields from translation
- [ ] The link trigger queues translation jobs for the title field only and returns job status information
- [ ] All trigger functions return QueueTranslationResult type indicating success, failure, and job tracking identifiers
- [ ] All trigger functions handle database retrieval errors gracefully and provide meaningful error messages
- [ ] The triggers integrate seamlessly with the content translation orchestrator established in REQ-260

---

## REQ-262: Implement Tag Translation Trigger with System Tag Handling

**Date**: 2026-01-18 16:30
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must provide a specialized trigger function for tag translation that distinguishes between system tags and user-created tags, preventing redundant translation of pre-seeded system tags while enabling translation of custom tags.

### Current Behavior
No mechanism exists to automatically initiate translations for tags when they are created or modified. The system cannot differentiate between system tags that were pre-seeded with translations and user-created custom tags that require translation. This results in potential duplicate translation jobs for system tags or missing translations for user tags.

### Expected Behavior
When a tag requires translation, the system accepts the tag identifier and source language, automatically determines whether the tag is a system tag or user-created tag, and initiates translation jobs only when necessary. System tags are recognized as already having translations from the seeding process and are skipped. User-created custom tags are validated to prevent duplicate translation requests, then queued for translation if translations do not already exist. The trigger returns comprehensive status information indicating whether translation was skipped, already exists, or newly queued.

### User Impact
Property owners can create custom tags in their preferred language and trust that the system will automatically handle translation into all supported languages without manual intervention. The system avoids wasting resources translating system tags that already have complete translations, while ensuring custom tags are promptly translated for international guests.

### Business Value
Optimizes translation resource usage by intelligently skipping pre-translated system tags while ensuring user-generated tags are translated, improving platform efficiency and enabling property owners to customize their listings with multilingual tag support.

### Acceptance Criteria
- [ ] A triggerTagTranslation function accepts tag identifier and source language parameters
- [ ] The function determines whether the tag is a system tag based on tag metadata or type indicators
- [ ] System tags return immediately without queuing translation jobs since they were pre-seeded
- [ ] User-created tags are checked against existing translations before queuing new jobs
- [ ] Translation jobs are only queued when translations do not already exist for the target languages
- [ ] The function returns QueueTranslationResult indicating whether translation was skipped, existing, or newly queued
- [ ] The result includes job tracking identifiers for newly queued translation jobs
- [ ] The function handles database retrieval errors gracefully with meaningful error messages
- [ ] The trigger integrates seamlessly with the content translation orchestrator established in REQ-260
- [ ] The implementation prevents duplicate translation jobs for tags that already have complete translations

---

## REQ-263: Implement Translation Storage Utilities

**Date**: 2026-01-18 04:44
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide dedicated storage utility functions that persist translated content for each entity type using UPSERT patterns to handle both new translations and translation updates.

### Current Behavior
No specialized functions exist to store translated content back to the database after translation jobs complete. The system cannot efficiently handle scenarios where translations need to be created initially or updated when source content changes, resulting in potential duplicate records or missing translations when content is re-translated.

### Expected Behavior
When translation jobs complete successfully, the system provides entity-specific storage functions that accept the entity identifier, target language, and translated data, then automatically store or update the translation in the appropriate database table using UPSERT logic. Item translations update the name and description in the items_translations table, article translations update title and description in articles_translations table, link translations update only the title in links_translations table, and tag translations update the translated value in tags_translations table. Each storage function handles both initial translation creation and subsequent updates seamlessly without manual conflict resolution.

### User Impact
Translated content is automatically persisted to the database and made available to guests viewing content in their preferred language. When property owners update their content and re-translate, the system updates existing translations rather than creating duplicates or failing due to constraint violations, ensuring guests always see the most current translated version.

### Business Value
Ensures translation investment is preserved through robust storage mechanisms that handle both new and updated translations gracefully, enabling continuous content improvement without data integrity issues or translation loss.

### Acceptance Criteria
- [ ] A storeItemTranslation function accepts item identifier, target language, and translated name and description fields
- [ ] The item storage function uses UPSERT pattern to insert new translations or update existing translations
- [ ] A storeArticleTranslation function accepts article identifier, target language, and translated title and description fields
- [ ] The article storage function uses UPSERT pattern to insert new translations or update existing translations
- [ ] A storeLinkTranslation function accepts link identifier, target language, and translated title field
- [ ] The link storage function uses UPSERT pattern to insert new translations or update existing translations
- [ ] A storeTagTranslation function accepts tag key, target language, and translated value
- [ ] The tag storage function uses UPSERT pattern to insert new translations or update existing translations
- [ ] All storage functions handle database constraint violations gracefully and provide meaningful error messages
- [ ] All storage functions update timestamp metadata to track when translations were stored or updated
- [ ] The implementation is located at /src/lib/content-translation/storage/translation-storage.ts
- [ ] All storage functions are properly exported and importable by other application modules
- [ ] The storage utilities integrate with the database schema established in Epic 3 foundation tasks

---

## REQ-264: Implement Translation Status Utilities

**Date**: 2026-01-18 17:22
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide utility functions that aggregate translation job queue status with stored translation records to report comprehensive translation availability and completion status for individual entities and entity batches.

### Current Behavior
No consolidated mechanism exists to determine the translation status of user-generated content entities. Property owners and the application cannot easily answer questions like "Are all my property descriptions fully translated?" or "Which languages are missing for this amenity?" Without aggregated status information, tracking translation progress requires manual cross-referencing between job queues and translation storage tables.

### Expected Behavior
When translation status is requested for a content entity (item, article, link, or tag), the system provides a function that accepts the entity type and identifier, queries both the translation job queue and stored translation tables, and returns a comprehensive status report indicating which languages have completed translations, which languages have pending translation jobs, and which languages have no translation activity. For batch queries involving multiple entities, the system efficiently retrieves status for all requested entities in a single operation and returns an array of status results maintaining the order of the input request.

### User Impact
Property owners can quickly assess translation coverage for their content and identify which languages are missing or still processing. The application can display accurate translation availability indicators to guests, showing which languages are immediately available versus which are being prepared. Translation management interfaces can surface incomplete translations automatically, helping owners prioritize translation efforts.

### Business Value
Provides visibility into translation coverage and completion status across the platform, enabling data-driven decisions about translation priorities and helping owners identify gaps in multilingual content availability that could limit international guest reach.

### Acceptance Criteria
- [ ] A getEntityTranslationStatus function accepts entity type and entity identifier parameters
- [ ] The function queries the translation job queue to identify pending or in-progress translation jobs for the entity
- [ ] The function queries the appropriate translation storage table to identify completed translations for the entity
- [ ] The function returns a TranslationStatusResult indicating completed languages, pending languages, and missing languages
- [ ] The TranslationStatusResult includes timestamp metadata for when translations were last updated
- [ ] A getBatchTranslationStatus function accepts an array of entity type and identifier pairs
- [ ] The batch function returns an array of TranslationStatusResult objects maintaining input order
- [ ] The batch function optimizes database queries to minimize round trips when retrieving status for multiple entities
- [ ] Both functions handle database query errors gracefully and provide meaningful error messages
- [ ] The implementation is located at /src/lib/content-translation/storage/translation-status.ts
- [ ] All status utility functions are properly exported and importable by other application modules
- [ ] The utilities integrate with both the translation job queue and translation storage schemas

---

## REQ-265: Implement Source Language Detection Utility

**Date**: 2026-01-18 19:45
**Type**: NEW FEATURE
**Size**: XS

### Summary
The system must provide a utility function that determines the appropriate source language for content translation by evaluating user preferences, account preferences, and fallback defaults in a defined priority order.

### Current Behavior
No centralized mechanism exists to determine which language should be used as the source language when translating user-generated content. The system cannot systematically resolve source language from multiple potential sources (manual override, user preferences, account preferences) or provide a consistent fallback when preferences are not configured.

### Expected Behavior
When content requires translation, the system provides a function that accepts a user object, account object, and optional language override parameter, then returns a supported language code based on a priority chain. The function first uses the override parameter if provided, then checks the user's preferred language setting, then checks the account's preferred language setting, and finally defaults to English if none of the previous values are available. The result is always a valid supported language code that can be used as the source language for translation operations.

### User Impact
Content translation operations automatically use the most appropriate source language based on available user and account configuration without requiring manual language selection for each translation request. When users or property managers have configured language preferences, those preferences are respected systematically, while new users without preferences receive sensible English defaults.

### Business Value
Streamlines the translation workflow by automating source language determination based on user and account context, reducing friction in the translation process and ensuring translations use the correct source language without manual intervention for each operation.

### Acceptance Criteria
- [ ] A detectSourceLanguage function accepts user object, account object, and optional override parameters
- [ ] The function returns a SupportedLanguage type representing a valid language code
- [ ] When override parameter is provided, the function returns the override value regardless of other settings
- [ ] When no override is provided, the function checks user.preferred_language and returns it if set
- [ ] When no override or user preference exists, the function checks account.preferred_language and returns it if set
- [ ] When none of the above are available, the function returns 'en' as the default language
- [ ] The implementation is located at /src/lib/content-translation/source-language.ts
- [ ] The function is properly exported and importable by other application modules
- [ ] The function handles missing or null user/account objects gracefully by falling back appropriately
- [ ] The function validates that returned language codes are valid SupportedLanguage values

---

## REQ-266: Modify Items API to Trigger Content Translations

**Date**: 2026-01-18 19:55
**Type**: ENHANCEMENT
**Size**: M

### Summary
The Items API must automatically initiate translation jobs when items are created or updated, ensuring multilingual content is generated without manual intervention.

### Current Behavior
When property owners create or update items through the Items API, the content is stored only in the source language. No automatic translation process is triggered, requiring property owners to manually initiate translations separately or leaving items untranslated for international guests.

### Expected Behavior
When an item is created via the POST endpoint, the API accepts an optional source language parameter, successfully creates the item, automatically queues translation jobs for all target languages, and returns the item data along with translation job tracking identifiers. When an item is updated via PUT or PATCH endpoints, the API first removes all existing translations for that item to prevent stale content, queues new translation jobs based on the updated content, and returns the updated item data along with new translation job tracking identifiers. Property owners receive immediate confirmation that translations are being processed without needing to take additional action.

### User Impact
Property owners create and update item content once in their preferred language, and the system automatically ensures the content is translated into all supported languages. Guests visiting the platform in different languages see translated item content without property owners needing to manage translation workflows manually.

### Business Value
Automates the translation workflow at the point of content creation and modification, ensuring consistent multilingual content availability and reducing the manual effort required to maintain translations across property listings.

### Acceptance Criteria
- [ ] The POST handler in /src/app/api/admin/items/route.ts accepts an optional sourceLanguage field in the request body
- [ ] After successful item creation, the POST handler calls queueContentTranslations with the new item identifier and source language
- [ ] The POST response includes a translationJobIds field containing identifiers for queued translation jobs
- [ ] The PUT or PATCH handler in /src/app/api/admin/items/[id]/route.ts deletes all existing translations for the item before updating
- [ ] After successful item update, the PUT/PATCH handler calls queueContentTranslations with the updated item identifier and source language
- [ ] The PUT/PATCH response includes a translationJobIds field containing identifiers for newly queued translation jobs
- [ ] Translation queueing failures do not cause the item create or update operation to fail
- [ ] Translation queueing errors are logged but do not prevent the API from returning a successful response for item operations
- [ ] When sourceLanguage is not provided, the API uses the source language detection utility to determine the appropriate source language
- [ ] The implementation integrates with the content translation orchestrator established in REQ-260

---

## REQ-267: Modify Articles API to Trigger Content Translations

**Date**: 2026-01-18 21:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
The Articles API must automatically initiate translation jobs when articles are created or updated, ensuring multilingual instructional content is generated without manual intervention.

### Current Behavior
When property owners create or update articles through the Articles API, the content is stored only in the source language. No automatic translation process is triggered, requiring property owners to manually initiate translations separately or leaving instructional articles untranslated for international guests.

### Expected Behavior
When an article is created via the POST endpoint, the API accepts an optional source language parameter, successfully creates the article, automatically queues translation jobs for all target languages, and returns the article data along with translation job tracking identifiers. When an article is updated via PUT or PATCH endpoints in the article detail route, the API first removes all existing translations for that article to prevent stale content, queues new translation jobs based on the updated content, and returns the updated article data along with new translation job tracking identifiers. Property owners receive immediate confirmation that translations are being processed without needing to take additional action.

### User Impact
Property owners create and update instructional articles once in their preferred language, and the system automatically ensures the content is translated into all supported languages. International guests viewing property guides and instructions see translated article content in their preferred language without property owners needing to manage translation workflows manually.

### Business Value
Automates the translation workflow for instructional content at the point of creation and modification, ensuring consistent multilingual guide availability and reducing the manual effort required to maintain translated instructions across property listings.

### Acceptance Criteria
- [ ] The POST handler in /src/app/api/admin/articles/route.ts accepts an optional sourceLanguage field in the request body
- [ ] After successful article creation, the POST handler calls queueContentTranslations with the new article identifier and source language
- [ ] The POST response includes a translationJobIds field containing identifiers for queued translation jobs
- [ ] The PUT or PATCH handler in /src/app/api/admin/articles/[id]/route.ts deletes all existing translations for the article before updating
- [ ] After successful article update, the PUT/PATCH handler calls queueContentTranslations with the updated article identifier and source language
- [ ] The PUT/PATCH response includes a translationJobIds field containing identifiers for newly queued translation jobs
- [ ] Translation queueing failures do not cause the article create or update operation to fail
- [ ] Translation queueing errors are logged but do not prevent the API from returning a successful response for article operations
- [ ] When sourceLanguage is not provided, the API uses the source language detection utility to determine the appropriate source language
- [ ] The implementation integrates with the content translation orchestrator established in REQ-260

---

## REQ-268: Modify Links API to Trigger Content Translations

**Date**: 2026-01-18 22:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The Links API must automatically initiate translation jobs when links are created or updated, ensuring multilingual link titles are generated without manual intervention while preserving the original URL across all languages.

### Current Behavior
When property owners create or update links through the Links API, the link title is stored only in the source language. No automatic translation process is triggered, requiring property owners to manually initiate translations separately or leaving link titles untranslated for international guests who may not understand the purpose or destination of the link.

### Expected Behavior
When a link is created via the POST endpoint, the API accepts an optional source language parameter, successfully creates the link record, automatically queues translation jobs for the link title across all target languages while keeping the URL unchanged, and returns the link data along with translation job tracking identifiers. When a link is updated via PUT or PATCH endpoints in the link detail route, the API first removes all existing translations for that link to prevent displaying outdated or inconsistent translated titles, queues new translation jobs based on the updated title content, and returns the updated link data along with new translation job tracking identifiers. Property owners receive immediate confirmation that link title translations are being processed automatically without needing to manage separate translation requests.

### User Impact
Property owners add and update links with descriptive titles in their preferred language once, and the system automatically ensures those titles are translated into all supported languages so international guests understand what each link represents. The URL remains identical across all languages, maintaining proper linking functionality while only the human-readable title is translated.

### Business Value
Automates the translation workflow for link metadata at the point of creation and modification, ensuring consistent multilingual link title availability across property listings and reducing the manual effort required to maintain translated link descriptions for international guests.

### Acceptance Criteria
- [ ] The POST handler in /src/app/api/admin/items/[id]/links/route.ts accepts an optional sourceLanguage field in the request body
- [ ] After successful link creation, the POST handler calls triggerLinkTranslation with the new link identifier and source language
- [ ] The POST response includes a translationJobIds field containing identifiers for queued translation jobs
- [ ] The PUT or PATCH handler in /src/app/api/admin/items/[id]/links/route.ts deletes all existing translations for the link before updating
- [ ] After successful link update, the PUT/PATCH handler calls triggerLinkTranslation with the updated link identifier and source language
- [ ] The PUT/PATCH response includes a translationJobIds field containing identifiers for newly queued translation jobs
- [ ] Translation queueing failures do not cause the link create or update operation to fail
- [ ] Translation queueing errors are logged but do not prevent the API from returning a successful response for link operations
- [ ] When sourceLanguage is not provided, the API uses the source language detection utility to determine the appropriate source language
- [ ] The implementation uses triggerLinkTranslation function which only translates the title field and explicitly excludes URL from translation
- [ ] The implementation integrates with the content translation orchestrator and entity-specific triggers established in REQ-260 and REQ-261

---

## REQ-269: Add Tag Translation on Item Save

**Date**: 2026-01-18 05:27
**Type**: ENHANCEMENT
**Size**: M

### Summary
The Items API must automatically queue translation jobs for user-created tags when items are created or updated, while intelligently skipping system tags that already have pre-seeded translations.

### Current Behavior
When property owners create or update items with tags through the Items API, the tags are stored but no automatic translation is triggered. User-created custom tags remain untranslated for international guests, while system tags that already have complete translations may be unnecessarily re-queued for translation, wasting resources and creating duplicate translation jobs.

### Expected Behavior
When an item is created or updated via the Items API, the system examines each tag in the tags array to determine if translation is needed. For each user-created tag that lacks translations, the system automatically queues a tag translation job to generate translations in all target languages. System tags, identified by a hash prefix or system metadata, are recognized as having pre-seeded translations and are skipped entirely to avoid redundant translation requests. Property owners receive confirmation indicating which tags were queued for translation and which were skipped, providing transparency about translation activity.

### User Impact
Property owners can apply custom tags to their items in their preferred language, and the system automatically ensures those tags are translated for international guests without manual translation management. The system avoids wasting translation resources on pre-translated system tags while ensuring custom tags receive timely translations, improving both efficiency and guest experience.

### Business Value
Optimizes translation resource allocation by intelligently differentiating between system tags with existing translations and user tags requiring translation, reducing unnecessary translation costs while ensuring comprehensive multilingual tag coverage for custom property categorization.

### Acceptance Criteria
- [ ] The POST handler in /src/app/api/admin/items/route.ts examines the tags array after successful item creation
- [ ] For each tag in the array, the handler determines whether the tag is a system tag based on a hash prefix check
- [ ] System tags (starting with #) are skipped and no translation job is queued
- [ ] User-created tags are checked against existing translations to prevent duplicate translation requests
- [ ] Translation jobs are queued only for user tags that lack translations in target languages
- [ ] The POST response includes a tagTranslationJobIds field containing identifiers for queued tag translation jobs
- [ ] The PUT or PATCH handler in /src/app/api/admin/items/[id]/route.ts performs the same tag translation logic after successful item update
- [ ] The PUT/PATCH response includes a tagTranslationJobIds field containing identifiers for newly queued tag translation jobs
- [ ] Tag translation queueing failures do not cause the item create or update operation to fail
- [ ] Tag translation queueing errors are logged but do not prevent the API from returning a successful response for item operations
- [ ] The implementation uses triggerTagTranslation function established in REQ-262 for each eligible user tag
- [ ] The implementation integrates with the content translation orchestrator and tag-specific trigger established in REQ-260 and REQ-262
- [ ] When sourceLanguage is not provided, the API uses the source language detection utility to determine the appropriate source language for tag translation

---

## REQ-270: Update TypeScript Types for Translation API Responses

**Date**: 2026-01-18 16:45
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The system must extend API request and response type definitions to include translation job tracking identifiers and source language specification for items and articles.

### Current Behavior
API response types for item and article operations do not include fields for tracking translation jobs initiated by create or update operations. Request types do not include optional source language parameters that allow property owners to explicitly specify which language their content is written in. Without these type definitions, translation job identifiers cannot be returned to callers, and source language detection must rely solely on user preferences rather than allowing per-request overrides.

### Expected Behavior
When items or articles are created or updated through API endpoints, response objects include an optional array of translation job identifiers indicating which background translation jobs were successfully queued. Request payloads accept an optional source language parameter allowing property owners to specify the content language when it differs from their account default. TypeScript compilation enforces correct usage of these fields throughout the application, ensuring translation-related data is properly typed and validated at development time.

### User Impact
Developers working with the translation system have strongly-typed interfaces that clearly indicate which API responses include translation tracking information and which requests accept source language overrides. The application provides better transparency about translation job status by returning job identifiers immediately when content is saved, enabling future features that track and display translation progress.

### Business Value
Establishes the type foundation for transparent translation job tracking and flexible source language specification, enabling future enhancements to translation status visibility while maintaining type safety across the application codebase.

### Acceptance Criteria
- [ ] ItemResponse interface includes optional translationJobIds field of type string array
- [ ] ArticleResponse interface includes optional translationJobIds field of type string array
- [ ] CreateItemRequest interface includes optional sourceLanguage field of type string
- [ ] CreateArticleRequest interface includes optional sourceLanguage field of type string
- [ ] All translation-related types from the content translation module are exported from the main types index
- [ ] Type definitions align with the API implementation changes in REQ-266, REQ-267, and REQ-268
- [ ] TypeScript compilation succeeds without errors after type additions
- [ ] Existing code consuming these types continues to compile without breaking changes due to optional field additions

---

## REQ-271: Enhance Translation Job Processor for Content-Specific Handling

**Date**: 2026-01-18 22:50
**Type**: ENHANCEMENT
**Size**: M

### Summary
The translation job processor must execute entity-specific processing workflows when handling translation jobs, ensuring each content type receives appropriate translation handling based on its structure and requirements.

### Current Behavior
The translation job queue system processes all translation jobs using a generic workflow regardless of content type. The processor cannot differentiate between items, articles, links, and tags, resulting in a one-size-fits-all approach that cannot account for entity-specific field structures, validation requirements, or storage patterns. This limits the system's ability to optimize translation handling for different content entities.

### Expected Behavior
When a translation job is dequeued from the job queue, the processor examines the entity type specified in the job metadata and routes the job to a specialized processing function designed for that content type. Item translation jobs invoke a processor that handles name and description field translation and storage. Article translation jobs invoke a processor that handles title and description field translation and storage. Link translation jobs invoke a processor that translates only the title field while explicitly preserving the original URL. Tag translation jobs invoke a processor that handles tag value translation and applies appropriate validation for tag naming constraints. Each specialized processor retrieves the source content, calls the translation service with the appropriate fields, and stores the translated results using the correct storage utility for that entity type.

### User Impact
Translated content appears correctly in the application with all entity-specific fields properly translated and stored. Property owners see their items, articles, links, and tags translated appropriately based on each content type's structure, with link URLs remaining unchanged and tags following proper naming conventions after translation.

### Business Value
Ensures translation quality and correctness by applying entity-aware processing logic that understands the unique requirements of each content type, preventing translation errors that could result from generic processing and improving the overall reliability of the translation system.

### Acceptance Criteria
- [ ] The processTranslationJob function in /src/lib/job-queue/translation-jobs.ts accepts a TranslationJob parameter
- [ ] The function examines the entityType field in the job metadata to determine content type
- [ ] When entityType is 'item', the function calls processItemTranslation with the job data
- [ ] When entityType is 'article', the function calls processArticleTranslation with the job data
- [ ] When entityType is 'link', the function calls processLinkTranslation with the job data
- [ ] When entityType is 'tag', the function calls processTagTranslation with the job data
- [ ] The processItemTranslation function retrieves the source item data and extracts name and description fields
- [ ] The processItemTranslation function calls the translation service for both fields and stores results using storeItemTranslation
- [ ] The processArticleTranslation function retrieves the source article data and extracts title and description fields
- [ ] The processArticleTranslation function calls the translation service for both fields and stores results using storeArticleTranslation
- [ ] The processLinkTranslation function retrieves the source link data and extracts only the title field
- [ ] The processLinkTranslation function calls the translation service for the title field only and stores results using storeLinkTranslation with the original URL unchanged
- [ ] The processTagTranslation function retrieves the source tag data and extracts the tag value
- [ ] The processTagTranslation function calls the translation service for the tag value and stores results using storeTagTranslation
- [ ] All specialized processing functions handle translation service errors gracefully and mark jobs as failed with descriptive error messages
- [ ] All specialized processing functions integrate with the translation storage utilities established in REQ-263
- [ ] The implementation extends the existing job queue infrastructure from Epic 1
- [ ] Unknown or unsupported entity types result in job failure with a clear error message indicating the entity type is not supported

---

## REQ-272: Implement Item Translation Processor

**Date**: 2026-01-18 23:15
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a specialized processor function that fetches item data, translates name and description fields, and stores the translated content in the item_translations table with appropriate job status tracking.

### Current Behavior
No dedicated processor exists to handle translation jobs specifically for items. Translation jobs are queued but cannot be executed because there is no implementation that retrieves item data, sends the appropriate fields to the translation service, and persists the translated results back to the database with proper error handling and status updates.

### Expected Behavior
When a translation job for an item is dequeued by the job processor, the system invokes a specialized item translation function that accepts the job metadata including item identifier, target language, and job tracking information. The function retrieves the source item record from the database to extract the name and description fields, calls the translation service to translate both fields from the source language to the target language, and stores the translated results in the item_translations table using UPSERT logic. Upon successful completion, the job status is updated to completed. If any step fails due to database errors, translation service errors, or network issues, the job status is updated to failed with a descriptive error message captured in the job metadata for debugging purposes.

### User Impact
Item content created by property owners is automatically translated and made available to international guests viewing listings in their preferred language. Guests see translated item names and descriptions that accurately convey the information provided by property owners, improving comprehension and trust in property listings across language barriers.

### Business Value
Enables automated multilingual item content delivery by implementing the core processing logic that bridges translation job queues with actual translation execution and storage, ensuring translation investment produces visible results for international guests.

### Acceptance Criteria
- [ ] A processItemTranslation function accepts job metadata including item identifier, source language, target language, and job tracking identifier
- [ ] The function queries the database to retrieve the source item record using the item identifier
- [ ] The function extracts the name and description fields from the retrieved item record
- [ ] The function calls the translation service to translate both name and description from source language to target language
- [ ] The function stores the translated name and description in the item_translations table using UPSERT logic
- [ ] The UPSERT operation associates the translation with the correct item identifier and target language code
- [ ] Upon successful translation and storage, the function updates the job status to 'completed' in the job queue
- [ ] Upon database retrieval failure, the function updates the job status to 'failed' with error details indicating the item could not be found or accessed
- [ ] Upon translation service failure, the function updates the job status to 'failed' with error details indicating the translation request failed
- [ ] Upon storage failure, the function updates the job status to 'failed' with error details indicating the translation could not be persisted
- [ ] The function is exported from /src/lib/content-translation/processors/item-processor.ts
- [ ] The implementation integrates with the translation storage utility established in REQ-263
- [ ] The implementation integrates with the translation service infrastructure from Epic 1
- [ ] The implementation integrates with the job queue status update mechanisms from Epic 1

---

## REQ-273: Implement Article Translation Processor

**Date**: 2026-01-18 23:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a specialized processor function that fetches article data, translates title and description fields, and stores the translated content in the article_translations table with appropriate job status tracking.

### Current Behavior
No dedicated processor exists to handle translation jobs specifically for articles. Translation jobs are queued but cannot be executed because there is no implementation that retrieves article data, sends the appropriate fields to the translation service, and persists the translated results back to the database with proper error handling and status updates.

### Expected Behavior
When a translation job for an article is dequeued by the job processor, the system invokes a specialized article translation function that accepts the job metadata including article identifier, target language, and job tracking information. The function retrieves the source article record from the database to extract the title and description fields, calls the translation service to translate both fields from the source language to the target language, and stores the translated results in the article_translations table using UPSERT logic. Upon successful completion, the job status is updated to completed. If any step fails due to database errors, translation service errors, or network issues, the job status is updated to failed with a descriptive error message captured in the job metadata for debugging purposes.

### User Impact
Article content created by property owners for instructional guides is automatically translated and made available to international guests viewing property instructions in their preferred language. Guests see translated article titles and descriptions that accurately convey the guidance provided by property owners, improving comprehension and enabling guests to follow property-specific instructions regardless of language barriers.

### Business Value
Enables automated multilingual article content delivery by implementing the core processing logic that bridges translation job queues with actual translation execution and storage, ensuring instructional content reaches international guests effectively and reducing property owner burden for maintaining multilingual guides.

### Acceptance Criteria
- [ ] A processArticleTranslation function accepts job metadata including article identifier, source language, target language, and job tracking identifier
- [ ] The function queries the database to retrieve the source article record using the article identifier
- [ ] The function extracts the title and description fields from the retrieved article record
- [ ] The function calls the translation service to translate both title and description from source language to target language
- [ ] The function stores the translated title and description in the article_translations table using UPSERT logic
- [ ] The UPSERT operation associates the translation with the correct article identifier and target language code
- [ ] Upon successful translation and storage, the function updates the job status to 'completed' in the job queue
- [ ] Upon database retrieval failure, the function updates the job status to 'failed' with error details indicating the article could not be found or accessed
- [ ] Upon translation service failure, the function updates the job status to 'failed' with error details indicating the translation request failed
- [ ] Upon storage failure, the function updates the job status to 'failed' with error details indicating the translation could not be persisted
- [ ] The function is exported from /src/lib/content-translation/processors/article-processor.ts
- [ ] The implementation integrates with the translation storage utility established in REQ-263
- [ ] The implementation integrates with the translation service infrastructure from Epic 1
- [ ] The implementation integrates with the job queue status update mechanisms from Epic 1

---

## REQ-274: Implement Link Translation Processor

**Date**: 2026-01-18 18:05
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must provide a specialized processor function that fetches link data, translates only the title field, and stores the translated content in the link_translations table while preserving the original URL unchanged with appropriate job status tracking.

### Current Behavior
No dedicated processor exists to handle translation jobs specifically for links. Translation jobs are queued but cannot be executed because there is no implementation that retrieves link data, sends only the title field to the translation service, and persists the translated title back to the database while ensuring the URL remains unchanged across all language versions.

### Expected Behavior
When a translation job for a link is dequeued by the job processor, the system invokes a specialized link translation function that accepts the job metadata including link identifier, target language, and job tracking information. The function retrieves the source link record from the database to extract only the title field while explicitly excluding the URL field from translation processing. The function calls the translation service to translate only the title field from the source language to the target language, then stores the translated title in the link_translations table using UPSERT logic while preserving the original URL value unchanged. Upon successful completion, the job status is updated to completed. If any step fails due to database errors, translation service errors, or network issues, the job status is updated to failed with a descriptive error message captured in the job metadata for debugging purposes.

### User Impact
Link titles created by property owners are automatically translated and made available to international guests viewing property resources in their preferred language. Guests see translated link titles that accurately describe the destination or purpose of each link, while the actual URL remains functional and unchanged across all languages. This ensures guests understand what they are clicking while maintaining proper link functionality regardless of the selected language.

### Business Value
Enables automated multilingual link title delivery by implementing the core processing logic that bridges translation job queues with actual translation execution and storage, ensuring resource links are understandable to international guests while maintaining link integrity by preventing URL translation that could break external references.

### Acceptance Criteria
- [ ] A processLinkTranslation function accepts job metadata including link identifier, source language, target language, and job tracking identifier
- [ ] The function queries the database to retrieve the source link record using the link identifier
- [ ] The function extracts only the title field from the retrieved link record and explicitly excludes the URL field
- [ ] The function calls the translation service to translate only the title field from source language to target language
- [ ] The function stores only the translated title in the link_translations table using UPSERT logic with the original URL preserved unchanged
- [ ] The UPSERT operation associates the translation with the correct link identifier and target language code
- [ ] Upon successful translation and storage, the function updates the job status to 'completed' in the job queue
- [ ] Upon database retrieval failure, the function updates the job status to 'failed' with error details indicating the link could not be found or accessed
- [ ] Upon translation service failure, the function updates the job status to 'failed' with error details indicating the translation request failed
- [ ] Upon storage failure, the function updates the job status to 'failed' with error details indicating the translation could not be persisted
- [ ] The function is exported from /src/lib/content-translation/processors/link-processor.ts
- [ ] The implementation integrates with the translation storage utility established in REQ-263
- [ ] The implementation integrates with the translation service infrastructure from Epic 1
- [ ] The implementation integrates with the job queue status update mechanisms from Epic 1
- [ ] The processor explicitly validates that URL fields are never sent to the translation service

---

## REQ-275: Implement Tag Translation Processor

**Date**: 2026-01-18 17:40
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must provide a specialized processor function that fetches tag data, translates the tag value, and stores the translated content in the tag_translations table marked as a user tag with appropriate job status tracking.

### Current Behavior
No dedicated processor exists to handle translation jobs specifically for tags. Translation jobs are queued but cannot be executed because there is no implementation that retrieves tag data, sends the tag value to the translation service, and persists the translated results back to the database with proper user tag identification and status updates.

### Expected Behavior
When a translation job for a tag is dequeued by the job processor, the system invokes a specialized tag translation function that accepts the job metadata including tag key, target language, and job tracking information. The function retrieves the source tag record from the database to extract the tag value, calls the translation service to translate the value from the source language to the target language, and stores the translated result in the tag_translations table using UPSERT logic with the is_system_tag field explicitly set to false to identify it as a user-created tag. Upon successful completion, the job status is updated to completed. If any step fails due to database errors, translation service errors, or network issues, the job status is updated to failed with a descriptive error message captured in the job metadata for debugging purposes.

### User Impact
Custom tags created by property owners are automatically translated and made available to international guests viewing property listings in their preferred language. Guests see translated tag values that accurately convey the categorization and metadata provided by property owners, improving content discoverability and comprehension across language barriers.

### Business Value
Enables automated multilingual tag delivery by implementing the core processing logic that bridges translation job queues with actual translation execution and storage, ensuring user-generated categorization and metadata reaches international guests effectively while properly distinguishing user tags from pre-seeded system tags.

### Acceptance Criteria
- [ ] A processTagTranslation function accepts job metadata including tag key, source language, target language, and job tracking identifier
- [ ] The function queries the database to retrieve the source tag record using the tag key
- [ ] The function extracts the tag value field from the retrieved tag record
- [ ] The function calls the translation service to translate the tag value from source language to target language
- [ ] The function stores the translated tag value in the tag_translations table using UPSERT logic
- [ ] The UPSERT operation associates the translation with the correct tag key and target language code
- [ ] The UPSERT operation explicitly sets is_system_tag to false to mark the translation as a user tag
- [ ] Upon successful translation and storage, the function updates the job status to 'completed' in the job queue
- [ ] Upon database retrieval failure, the function updates the job status to 'failed' with error details indicating the tag could not be found or accessed
- [ ] Upon translation service failure, the function updates the job status to 'failed' with error details indicating the translation request failed
- [ ] Upon storage failure, the function updates the job status to 'failed' with error details indicating the translation could not be persisted
- [ ] The function is exported from /src/lib/content-translation/processors/tag-processor.ts
- [ ] The implementation integrates with the translation storage utility established in REQ-263
- [ ] The implementation integrates with the translation service infrastructure from Epic 1
- [ ] The implementation integrates with the job queue status update mechanisms from Epic 1

---

## REQ-276: Implement Job Prioritization for Translation Queue

**Date**: 2026-01-18 10:15
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must assign priority levels to translation jobs based on content recency and operation type, ensuring time-sensitive translations are processed before lower-priority batch operations.

### Current Behavior
Translation jobs are processed in the order they are created without regard to urgency or importance. Recently created content requiring immediate translation receives the same priority as bulk imports or retry operations, potentially causing delays in publishing new property content for international guests.

### Expected Behavior
When translation jobs are created, the system automatically assigns priority values based on specific criteria. Content created within the last 5 minutes receives the highest priority of 100 to enable rapid publication. Updated content receives priority 50 to ensure modifications are translated promptly. Batch import operations receive priority 25 as they are less time-sensitive. Failed translation retry attempts receive the lowest priority of 10 to avoid blocking new content. The job picker query retrieves jobs ordered by priority descending, then by creation timestamp ascending, ensuring highest-priority jobs are processed first while maintaining chronological order within each priority level.

### User Impact
Property owners see their newly created content translated and available to international guests more quickly, improving the time-to-market for new listings. Updates to existing content are prioritized appropriately over bulk operations, ensuring guests see current information without excessive delays. Batch imports and retries are processed during lower-demand periods without interfering with time-sensitive translation requests.

### Business Value
Optimizes translation resource allocation by prioritizing time-sensitive content over bulk operations, improving guest experience through faster multilingual content availability while maintaining efficient processing of background tasks during periods of lower demand.

### Acceptance Criteria
- [ ] A priority assignment utility function determines the appropriate priority value based on job metadata
- [ ] Jobs for content created within the last 5 minutes are assigned priority 100
- [ ] Jobs for updated content are assigned priority 50
- [ ] Jobs for batch import operations are assigned priority 25
- [ ] Jobs for retry attempts of failed translations are assigned priority 10
- [ ] The translation job creation logic calls the priority assignment utility to set the priority field
- [ ] The job picker query orders results by priority descending as the primary sort criterion
- [ ] The job picker query orders results by created_at ascending as the secondary sort criterion within each priority level
- [ ] The priority assignment logic is located at /src/lib/job-queue/priority.ts
- [ ] The priority utility function is properly exported and importable by job creation modules
- [ ] The job queue table schema includes a priority field to store integer priority values
- [ ] Priority values are stored as integers to enable efficient database sorting and indexing

---

## REQ-277: Implement Concurrency Control for Translation API Calls

**Date**: 2026-01-18 18:22
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must enforce a maximum limit on concurrent translation API calls to prevent overwhelming translation service providers with excessive simultaneous requests.

### Current Behavior
Translation job processors execute API calls to translation service providers without limits on concurrent execution. When multiple translation jobs are processed simultaneously, the system can generate dozens or hundreds of concurrent API requests, potentially exceeding provider rate limits, triggering service throttling, or degrading translation service performance due to resource exhaustion.

### Expected Behavior
When translation jobs are being processed, the system enforces a maximum of 10 concurrent translation API calls at any given time. Additional translation jobs wait in a queue until one of the active API calls completes, at which point the next waiting job is allowed to proceed. The concurrency control mechanism uses either a semaphore pattern or queue-based throttling to regulate access to the translation API. The system respects translation provider rate limits proactively, preventing rate limit errors before they occur and ensuring stable, predictable translation throughput without service interruptions.

### User Impact
Translation jobs are processed reliably without service interruptions caused by rate limiting or provider throttling. Property owners experience consistent translation processing times and receive translated content without unexpected delays or failures caused by overwhelming the translation service. The system maintains steady progress through translation backlogs without triggering provider-imposed restrictions that could halt all translation activity.

### Business Value
Protects the translation service integration from rate limiting penalties and service degradation by proactively managing concurrency, ensuring sustainable long-term operation of the translation pipeline and avoiding potential service suspension or additional costs associated with exceeding provider quotas.

### Acceptance Criteria
- [ ] A concurrency control module is implemented at /src/lib/job-queue/concurrency.ts
- [ ] The module exports a mechanism to enforce a maximum of 10 concurrent translation API calls
- [ ] The concurrency control uses either semaphore-based throttling or queue-based throttling to manage access
- [ ] Translation job processors acquire concurrency permission before making API calls to the translation service
- [ ] When the concurrency limit is reached, additional jobs wait until an active API call completes
- [ ] When an API call completes, the concurrency control releases one waiting job to proceed
- [ ] The concurrency limit value is configurable through environment variables or configuration constants
- [ ] The implementation respects translation provider rate limits by preventing excessive concurrent requests
- [ ] The concurrency control handles edge cases such as job failures releasing concurrency slots correctly
- [ ] The module is properly exported and importable by translation job processor modules
- [ ] The concurrency control integrates with the translation job processing infrastructure from Epic 1
- [ ] The implementation does not block the job picker or job queue management operations

---

## REQ-278: Implement Stale Job Cleanup for Translation Queue

**Date**: 2026-01-18 11:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The system must automatically detect and recover translation jobs that remain stuck in processing status beyond an acceptable time threshold, resetting them to queued status for retry processing.

### Current Behavior
Translation jobs that encounter unexpected interruptions during processing (such as process crashes, network timeouts, or server restarts) remain indefinitely in the processing status. These stale jobs are never completed and never retried, effectively creating orphaned work items that block progress and prevent content from being translated. The system has no mechanism to detect when a job has been processing for an abnormally long time or to recover these jobs for retry.

### Expected Behavior
Before the job picker selects new translation jobs for processing, the system runs a cleanup operation that identifies all jobs currently in processing status for more than 5 minutes. For each stale job identified, the system increments an attempt counter to track retry history and resets the job status from processing back to queued, making the job eligible for processing again. The cleanup operation logs each recovery action for monitoring and debugging purposes. Jobs that have exceeded a maximum retry threshold are marked as failed rather than re-queued to prevent infinite retry loops on jobs that are fundamentally broken.

### User Impact
Translation jobs that encounter temporary failures or infrastructure interruptions are automatically recovered and retried without manual intervention. Property owners whose content was affected by stale jobs eventually receive their translations once the cleanup operation rescues the jobs, preventing permanent loss of translation requests. The system maintains forward progress on the translation queue even when individual processing attempts fail unexpectedly.

### Business Value
Improves translation system reliability and resilience by automatically recovering from processing interruptions, reducing manual operations overhead for investigating and restarting failed jobs, and ensuring translation work is eventually completed even when infrastructure issues occur.

### Acceptance Criteria
- [ ] A cleanup utility function identifies all translation jobs in processing status for more than 5 minutes
- [ ] The cleanup function increments the attempt counter for each identified stale job
- [ ] The cleanup function resets stale job status from processing to queued
- [ ] The cleanup function logs each recovered job including job identifier, entity type, and time spent processing
- [ ] Jobs with attempt count exceeding a maximum retry threshold (e.g., 3 attempts) are marked as failed instead of re-queued
- [ ] The job picker routine calls the cleanup utility before selecting new jobs to process
- [ ] The cleanup operation executes within a database transaction to ensure consistency
- [ ] The 5-minute threshold is configurable through environment variables or configuration constants
- [ ] The maximum retry threshold is configurable through environment variables or configuration constants
- [ ] The cleanup utility is implemented at /src/lib/job-queue/cleanup.ts
- [ ] The cleanup utility is properly exported and importable by job picker modules
- [ ] The implementation uses database timestamps to accurately calculate processing duration
- [ ] The cleanup operation completes efficiently without blocking job picker performance
- [ ] Failed jobs include error metadata indicating they exceeded maximum retry attempts

---

## REQ-328: Create Translation Status API Endpoint

**Date**: 2026-01-18 14:35
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a RESTful API endpoint that returns comprehensive translation status information for any content entity, combining active job queue status with stored translation records to give a complete picture of translation availability.

### Current Behavior
No API endpoint exists to query translation status for content entities. Property owners and application components cannot programmatically determine which languages have completed translations, which translations are currently being processed, or which languages are missing translations entirely. This lack of visibility prevents building translation management interfaces and makes it impossible to display accurate translation availability indicators to users.

### Expected Behavior
When a GET request is made to `/api/translations/status/[entityType]/[entityId]`, the API validates the entity type parameter against supported content types (item, article, link, tag), retrieves the entity to confirm it exists, queries the translation job queue to identify any pending or in-progress translation jobs for the entity, queries the appropriate translation storage table to retrieve all completed translations, and returns a comprehensive status response that includes the entity identifier, entity type, source language, an array of completed translations with language code and last updated timestamp, an array of pending translations with language code and job status, an array of missing language codes that have neither completed translations nor pending jobs, and overall translation coverage percentage. The response includes cache-friendly headers with appropriate Cache-Control and ETag values to enable efficient polling and reduce unnecessary database queries for unchanged status.

### User Impact
Property owners can view real-time translation status for their content through management interfaces, understanding exactly which languages are available, which are being processed, and which need attention. Application components can display accurate translation availability indicators to guests and owners, improving transparency about multilingual content coverage. Developers can build monitoring dashboards and automated alerts based on translation status data.

### Business Value
Provides the foundational API for translation management features by exposing comprehensive status information, enabling property owners to make informed decisions about translation priorities and enabling the platform to surface translation gaps that could impact international guest reach.

### Technical Details
- **File Location**: `/src/app/api/translations/status/[entityType]/[entityId]/route.ts`
- **HTTP Method**: GET
- **Route Parameters**:
  - `entityType`: The type of content entity (item, article, link, tag)
  - `entityId`: The unique identifier of the entity
- **Response Format**: JSON with translation status details
- **Cache Headers**: Include Cache-Control with max-age and ETag for conditional requests
- **Authentication**: Requires authenticated user with access to the entity

### Dependencies
- REQ-264: Translation Status Utilities - provides the underlying status aggregation functions
- Epic 1: Translation Job Queue infrastructure - provides job status query capabilities
- Epic 3 Foundation: Translation storage tables - provides completed translation records

### Acceptance Criteria
- [ ] A route handler file is created at /src/app/api/translations/status/[entityType]/[entityId]/route.ts
- [ ] The GET handler extracts entityType and entityId from route parameters
- [ ] The handler validates entityType is one of: 'item', 'article', 'link', 'tag'
- [ ] Invalid entityType values return 400 Bad Request with descriptive error message
- [ ] The handler queries the database to verify the entity exists before proceeding
- [ ] Non-existent entities return 404 Not Found with descriptive error message
- [ ] The handler calls getEntityTranslationStatus utility to retrieve aggregated status
- [ ] The response includes entityId and entityType fields for context
- [ ] The response includes sourceLanguage field indicating the original content language
- [ ] The response includes completedTranslations array with objects containing languageCode and updatedAt timestamp
- [ ] The response includes pendingTranslations array with objects containing languageCode and jobStatus (queued/processing)
- [ ] The response includes missingLanguages array with language codes that have no translation or pending job
- [ ] The response includes coveragePercentage field calculated as (completed / total supported languages) * 100
- [ ] The response includes Cache-Control header with max-age of 30 seconds for polling efficiency
- [ ] The response includes ETag header based on content hash for conditional request support
- [ ] The handler returns 304 Not Modified when If-None-Match header matches current ETag
- [ ] Database query errors return 500 Internal Server Error with generic error message
- [ ] The implementation integrates with authentication middleware to verify user access to the entity
- [ ] The response includes totalLanguages field indicating the count of all supported target languages
- [ ] The handler logs status requests for monitoring and debugging purposes

---

## REQ-329: Create Retry Failed Translations Endpoint

**Date**: 2026-01-18 14:50
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a RESTful API endpoint that allows property owners and administrators to retry translation jobs that previously failed, enabling recovery from temporary service disruptions without recreating content.

### Current Behavior
When translation jobs fail due to temporary issues such as service outages, network timeouts, or rate limiting, there is no user-accessible mechanism to retry those failed translations. Property owners must delete and recreate their content or manually contact support to trigger new translation jobs, resulting in poor user experience and increased support burden. Failed jobs remain in failed status indefinitely with no path to recovery.

### Expected Behavior
When a POST request is made to `/api/translations/retry`, the API accepts a request body containing the entity type, entity identifier, and optionally a specific array of target language codes to retry. The system queries the translation job queue to identify all failed jobs matching the entity type and identifier. If specific languages were requested, only failed jobs for those languages are selected; otherwise, all failed jobs for the entity are selected. For each failed job identified, the system resets the job status from failed to queued, resets the attempt counter to zero to give the job a fresh start, and clears any previous error metadata. The API returns a response indicating the total count of jobs that were successfully re-queued, providing confirmation that retry processing has been initiated. The re-queued jobs become eligible for processing by the normal job picker workflow according to priority and queue order.

### User Impact
Property owners can recover from translation failures by clicking a retry button in the management interface, avoiding the frustration of recreating content or waiting for support intervention. Failed translations caused by temporary service issues are easily retried once the underlying issue is resolved, ensuring content eventually reaches international guests without data loss or duplication. The system provides clear feedback about how many translation jobs were retried, giving owners confidence that the retry action succeeded.

### Business Value
Reduces support burden by enabling self-service recovery from failed translations, improves user satisfaction by providing transparent control over translation retry operations, and ensures translation investment is not lost due to temporary infrastructure issues that can be resolved through simple retry mechanisms.

### Technical Details
- **File Location**: `/src/app/api/translations/retry/route.ts`
- **HTTP Method**: POST
- **Request Body**:
  - `entityType`: The type of content entity (item, article, link, tag) - required
  - `entityId`: The unique identifier of the entity - required
  - `languages`: Array of language codes to retry (optional, defaults to all failed jobs for the entity)
- **Response Format**: JSON with retry operation results
- **Authentication**: Requires authenticated user with access to the entity

### Dependencies
- Epic 1: Translation Job Queue infrastructure - provides job status update capabilities
- REQ-260: Content Translation Orchestrator - provides job creation patterns
- REQ-264: Translation Status Utilities - provides failed job identification patterns

### Acceptance Criteria
- [ ] A route handler file is created at /src/app/api/translations/retry/route.ts
- [ ] The POST handler accepts entityType, entityId, and optional languages array in request body
- [ ] The handler validates entityType is one of: 'item', 'article', 'link', 'tag'
- [ ] Invalid entityType values return 400 Bad Request with descriptive error message
- [ ] Missing entityId returns 400 Bad Request with descriptive error message
- [ ] The handler queries the database to verify the entity exists before proceeding
- [ ] Non-existent entities return 404 Not Found with descriptive error message
- [ ] The handler queries the translation job queue to find all jobs matching entityType and entityId with status 'failed'
- [ ] When languages array is provided, only failed jobs matching the specified language codes are selected
- [ ] When languages array is omitted or empty, all failed jobs for the entity are selected
- [ ] For each selected failed job, the handler updates status to 'queued'
- [ ] For each selected failed job, the handler resets the attempt counter to 0
- [ ] For each selected failed job, the handler clears previous error metadata from the job record
- [ ] The response includes a retriedCount field indicating the total number of jobs re-queued
- [ ] The response includes a jobs array with objects containing jobId, languageCode, and previousAttempts for each re-queued job
- [ ] The handler returns 200 OK with retriedCount of 0 when no failed jobs are found matching the criteria
- [ ] Database update errors return 500 Internal Server Error with generic error message
- [ ] The implementation integrates with authentication middleware to verify user access to the entity
- [ ] The handler logs retry operations including entity details and count of re-queued jobs for monitoring
- [ ] Re-queued jobs are processed according to normal priority and queue ordering rules
- [ ] The endpoint validates that the languages array contains only valid supported language codes when provided

---

