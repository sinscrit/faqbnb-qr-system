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

## REQ-330: Create Manual Translation Override Endpoint

**Date**: 2026-01-18 15:10
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a RESTful API endpoint that allows authorized users to manually submit or override translations for content entities, bypassing the automatic translation system when human-quality translations are preferred.

### Current Behavior
All translations are generated automatically through the translation service with no mechanism for manual intervention. Property owners and administrators who have professionally translated content or prefer to provide their own translations cannot submit those translations through the API. Users with domain expertise in specific languages cannot correct or improve automatically generated translations, resulting in suboptimal translation quality in some cases and no path to manual override when automatic translations are inadequate.

### Expected Behavior
When a PUT request is made to `/api/translations/[entityType]/[entityId]/[language]`, the API first validates that the entity type parameter is one of the supported content types (item, article, link, tag). The handler extracts the target language code from the route parameters and validates it against the list of supported languages. The request body contains the translated field values appropriate for the entity type: name and description for items, title and description for articles, title for links, and value for tags. The handler verifies that the authenticated user has edit access to the entity by checking ownership or administrative permissions. Upon successful validation, the handler performs an UPSERT operation on the appropriate translation table to either insert a new translation or update an existing translation with the provided field values. The translation record is stored with a status of 'manual' to distinguish it from automatic translations, and the reviewed_by field is set to the current authenticated user's ID to maintain an audit trail of who provided the translation. The API returns the stored translation record including the entity identifier, language code, translated fields, status, reviewer identifier, and timestamp of the operation.

### User Impact
Property owners can provide their own high-quality translations for content that requires precise language or cultural nuance that automatic translation may not capture effectively. Bilingual property owners can translate their own content without relying on automatic translation services, ensuring the translated content accurately conveys their intended meaning. Administrators can correct or improve translations reported as inaccurate by guests, maintaining content quality across all languages. The distinction between manual and automatic translations enables future features that prioritize human-reviewed translations in quality metrics and displays.

### Business Value
Improves translation quality by enabling human override of automatic translations when necessary, reduces support burden by allowing property owners to self-service translation corrections, and establishes an audit trail for translation accountability that supports quality assurance processes and compliance requirements.

### Technical Details
- **File Location**: `/src/app/api/translations/[entityType]/[entityId]/[language]/route.ts`
- **HTTP Method**: PUT
- **Route Parameters**:
  - `entityType`: The type of content entity (item, article, link, tag)
  - `entityId`: The unique identifier of the entity
  - `language`: The target language code for the translation
- **Request Body** (varies by entity type):
  - For items: `{ name: string, description: string }`
  - For articles: `{ title: string, description: string }`
  - For links: `{ title: string }`
  - For tags: `{ value: string }`
- **Response Format**: JSON with stored translation record details
- **Authentication**: Requires authenticated user with edit access to the entity

### Dependencies
- REQ-263: Translation Storage Utilities - provides UPSERT storage functions for each entity type
- Epic 3 Foundation: Translation storage tables - provides database schema for translation records
- Epic 1: Authentication and authorization infrastructure - provides user verification and access control

### Acceptance Criteria
- [ ] A route handler file is created at /src/app/api/translations/[entityType]/[entityId]/[language]/route.ts
- [ ] The PUT handler extracts entityType, entityId, and language from route parameters
- [ ] The handler validates entityType is one of: 'item', 'article', 'link', 'tag'
- [ ] Invalid entityType values return 400 Bad Request with descriptive error message
- [ ] The handler validates language is a valid supported language code
- [ ] Invalid language codes return 400 Bad Request with descriptive error message
- [ ] The handler queries the database to verify the entity exists before proceeding
- [ ] Non-existent entities return 404 Not Found with descriptive error message
- [ ] The handler verifies the authenticated user has edit access to the entity (owner or admin)
- [ ] Users without edit access receive 403 Forbidden with descriptive error message
- [ ] For item entities, the handler validates request body contains name and description fields
- [ ] For article entities, the handler validates request body contains title and description fields
- [ ] For link entities, the handler validates request body contains title field
- [ ] For tag entities, the handler validates request body contains value field
- [ ] Missing required fields return 400 Bad Request with field-specific error messages
- [ ] The handler performs UPSERT on the appropriate translation table (items_translations, articles_translations, links_translations, or tags_translations)
- [ ] The UPSERT sets the translation status to 'manual' to distinguish from automatic translations
- [ ] The UPSERT sets the reviewed_by field to the current authenticated user's ID
- [ ] The UPSERT updates the updated_at timestamp to the current time
- [ ] The response includes the entityId, language, translated field values, status, reviewedBy, and updatedAt fields
- [ ] The handler returns 200 OK for successful update operations
- [ ] The handler returns 201 Created for successful insert operations when no previous translation existed
- [ ] Database operation errors return 500 Internal Server Error with generic error message
- [ ] The handler logs manual translation operations including entity details, language, and user for audit purposes
- [ ] The implementation integrates with the translation storage utilities established in REQ-263
- [ ] The endpoint prevents SQL injection and validates all input parameters before database operations
- [ ] Empty string values for required fields are rejected with 400 Bad Request

---

## REQ-331: Create Batch Translation Status Endpoint

**Date**: 2026-01-18 15:25
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a RESTful API endpoint that accepts multiple entity identifiers in a single request and returns translation status for all requested entities efficiently, optimized for rendering dashboard list views with translation indicators.

### Current Behavior
No API endpoint exists to query translation status for multiple entities in a single request. Dashboard list views that display translation status indicators must make individual API calls for each entity in the list, resulting in dozens or hundreds of sequential HTTP requests when rendering large lists. This creates significant performance bottlenecks, increases page load times, and generates excessive network overhead when displaying tables or lists of content items with translation status badges.

### Expected Behavior
When a POST request is made to `/api/translations/status/batch`, the API accepts a request body containing an array of entity specifiers, where each specifier includes entity type and entity identifier. The handler validates that all entity types are supported content types and processes the batch request efficiently using optimized database queries that minimize round trips. For each entity in the batch, the system queries translation job queues and translation storage tables to determine completed translations, pending jobs, and missing languages. The response returns an array of status summaries maintaining the same order as the input request, where each summary includes entity identifier, entity type, translation coverage percentage, count of completed translations, count of pending translations, and count of missing translations. The endpoint supports batch sizes up to 100 entities per request to balance efficiency with resource constraints.

### User Impact
Dashboard list views render translation status for all visible items with a single API request instead of making hundreds of individual calls, dramatically improving page load performance and user experience. Property owners viewing lists of their items, articles, or links see immediate translation status indicators without waiting for sequential API calls to complete. The application remains responsive even when displaying large lists of content with translation status badges.

### Business Value
Enables performant translation management interfaces by providing batch status retrieval optimized for list rendering scenarios, improving overall application responsiveness and reducing server load from repetitive individual status queries for the same page view.

### Technical Details
- **File Location**: `/src/app/api/translations/status/batch/route.ts`
- **HTTP Method**: POST
- **Request Body**:
  - `entities`: Array of objects with `entityType` and `entityId` properties - required
  - Maximum batch size: 100 entities
- **Response Format**: JSON array of status summary objects
- **Authentication**: Requires authenticated user with access to queried entities

### Dependencies
- REQ-264: Translation Status Utilities - provides batch status aggregation function
- REQ-328: Translation Status API Endpoint - establishes status response patterns
- Epic 1: Translation Job Queue infrastructure - provides job status query capabilities
- Epic 3 Foundation: Translation storage tables - provides completed translation records

### Acceptance Criteria
- [ ] A route handler file is created at /src/app/api/translations/status/batch/route.ts
- [ ] The POST handler accepts a request body containing an entities array
- [ ] Each entity object in the array must include entityType and entityId properties
- [ ] Missing entities array returns 400 Bad Request with descriptive error message
- [ ] Empty entities array returns 400 Bad Request indicating at least one entity is required
- [ ] Batch size exceeding 100 entities returns 400 Bad Request with descriptive error message
- [ ] The handler validates each entityType is one of: 'item', 'article', 'link', 'tag'
- [ ] Invalid entityType values return 400 Bad Request identifying which entity has an invalid type
- [ ] The handler calls getBatchTranslationStatus utility to retrieve status for all entities efficiently
- [ ] The response returns an array of status objects in the same order as the input entities array
- [ ] Each status object includes entityId, entityType, and coveragePercentage fields
- [ ] Each status object includes completedCount indicating number of completed translations
- [ ] Each status object includes pendingCount indicating number of pending or in-progress jobs
- [ ] Each status object includes missingCount indicating number of languages with no translation or job
- [ ] Each status object includes totalLanguages indicating the count of all supported target languages
- [ ] The handler optimizes database queries to minimize round trips when retrieving status for multiple entities
- [ ] Non-existent entities return a status object with zero counts rather than failing the entire batch
- [ ] Database query errors return 500 Internal Server Error with generic error message
- [ ] The implementation integrates with authentication middleware to verify user has access to at least one entity
- [ ] The handler logs batch status requests including entity count for monitoring purposes
- [ ] The response includes appropriate cache headers to support efficient polling of batch status
- [ ] The endpoint validates that entityId values are properly formatted for their respective entity types

---

## REQ-332: Create Job Processing Trigger API Route

**Date**: 2026-01-18 16:45
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a RESTful API endpoint that allows administrators to manually trigger translation job processing with configurable batch sizes for operational control over queue execution.

### Current Behavior
Translation jobs are queued automatically when content is created or updated, but no administrative endpoint exists to manually trigger job processing on demand. Administrators cannot control when queued translation jobs are executed, cannot adjust processing batch sizes based on current system load, and have no way to manually initiate translation job processing outside of automatic scheduled execution or background worker processes.

### Expected Behavior
When a POST request is made to the administrative endpoint at the specified route, the API validates that the requesting user has service role or administrator permissions before proceeding. The request body accepts an optional batch size parameter that defaults to 10 jobs when not specified, allowing administrators to control how many translation jobs should be processed in a single execution cycle. The handler invokes the translation job processor, which executes cleanup of stale jobs, retrieves up to the specified batch size of queued jobs according to priority and timestamp ordering, processes each job by calling the appropriate entity-specific processor, and tracks processing success and failure counts. Upon completion, the API returns comprehensive statistics including the total number of jobs processed, count of successful completions, count of failures, processing duration, and an array of job identifiers for the processed jobs. The response provides administrators with immediate feedback about processing outcomes and enables monitoring of translation pipeline health.

### User Impact
Administrators gain operational control over translation job processing, allowing manual triggering during maintenance windows or when addressing backlogs. System operators can adjust batch sizes based on current load conditions to balance translation throughput against system resources. The detailed processing statistics enable troubleshooting and monitoring of translation job execution without requiring direct database access or log analysis.

### Business Value
Provides operational flexibility for managing the translation pipeline by enabling manual control over job processing timing and batch sizes, supports troubleshooting and performance optimization through detailed processing statistics, and enables responsive handling of translation backlogs without waiting for scheduled background worker execution.

### Technical Details
- **File Location**: `/src/app/api/admin/process-translations/route.ts`
- **HTTP Method**: POST
- **Request Body**:
  - `batchSize`: Number of jobs to process (optional, default: 10) - integer between 1 and 100
- **Response Format**: JSON with processing statistics
- **Authentication**: Requires service role key or administrator user authentication
- **Authorization**: Only users with admin role or service role key can access this endpoint

### Dependencies
- REQ-271: Enhanced Translation Job Processor - provides entity-specific processing workflows
- REQ-272-275: Entity Translation Processors - provide specialized processing for each content type
- REQ-276: Job Prioritization - establishes priority-based queue ordering
- REQ-277: Concurrency Control - manages concurrent translation API calls during processing
- REQ-278: Stale Job Cleanup - provides cleanup utility to recover stuck jobs before processing
- Epic 1: Translation Job Queue infrastructure - provides job queue query and update capabilities

### Acceptance Criteria
- [ ] A route handler file is created at /src/app/api/admin/process-translations/route.ts
- [ ] The POST handler validates authentication using either service role key or admin user credentials
- [ ] Unauthenticated requests return 401 Unauthorized with descriptive error message
- [ ] Non-administrator users without service role return 403 Forbidden with descriptive error message
- [ ] The handler accepts an optional batchSize parameter from the request body
- [ ] When batchSize is not provided, the handler defaults to processing 10 jobs
- [ ] When batchSize is less than 1 or greater than 100, the handler returns 400 Bad Request with descriptive error message
- [ ] The handler invokes the stale job cleanup utility before selecting jobs to process
- [ ] The handler queries the translation job queue for up to batchSize jobs with status 'queued'
- [ ] The query orders jobs by priority descending and created_at ascending to respect priority rules
- [ ] For each retrieved job, the handler examines entityType and invokes the appropriate processor function
- [ ] The handler tracks the count of successfully completed jobs during processing
- [ ] The handler tracks the count of failed jobs during processing
- [ ] The handler measures total processing duration from start to completion
- [ ] The response includes a processedCount field indicating total jobs attempted
- [ ] The response includes a successCount field indicating jobs completed successfully
- [ ] The response includes a failureCount field indicating jobs that failed during processing
- [ ] The response includes a durationMs field indicating processing time in milliseconds
- [ ] The response includes a processedJobIds array containing identifiers for all processed jobs
- [ ] The response includes a cleanupCount field indicating how many stale jobs were recovered before processing
- [ ] The handler returns 200 OK with statistics even when no jobs are queued or all jobs fail
- [ ] Database query errors return 500 Internal Server Error with generic error message
- [ ] The handler logs processing operations including batch size, counts, and duration for monitoring purposes
- [ ] The implementation respects concurrency controls established in REQ-277 during job processing
- [ ] The endpoint includes rate limiting to prevent abuse from excessive manual triggering (max 10 requests per minute per user)
- [ ] Processing errors for individual jobs do not halt processing of remaining jobs in the batch
- [ ] The handler updates job status to 'processing' before invoking processors and to 'completed' or 'failed' after processing

---

## REQ-333: Configure Automated Translation Job Processing Trigger

**Date**: 2026-01-18 16:55
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must establish an automated scheduled trigger mechanism that periodically invokes the translation job processing endpoint to continuously process queued translation jobs without manual intervention.

### Current Behavior
Translation jobs are queued automatically when content is created or updated, but there is no automated mechanism to continuously process these queued jobs. The translation job processing endpoint exists but requires manual invocation by administrators. Without an automated trigger, queued translation jobs accumulate indefinitely until an administrator manually triggers processing, causing significant delays between when content is created and when translations become available to international guests.

### Expected Behavior
A scheduled job executes at regular intervals, automatically invoking the translation job processing endpoint to process queued translation jobs. The scheduling mechanism can be configured with different intervals based on operational requirements and cost considerations. For low-latency translation delivery optimized for user experience, the trigger runs every 30 seconds to minimize the time between content creation and translation availability. For cost-optimized operation reducing infrastructure costs, the trigger runs every 5 minutes providing reasonable translation delivery while reducing execution frequency. The automated trigger includes authentication credentials required to invoke the administrative processing endpoint, handles transient failures by retrying on the next scheduled execution, and logs execution outcomes for operational monitoring and troubleshooting.

### User Impact
Translations are processed automatically and continuously without requiring administrator intervention or manual triggering. Property owners who create or update content see their translations become available within the configured interval window without any manual action. International guests viewing content shortly after creation see translated content appear automatically as background processing completes translation jobs, improving the perceived quality and completeness of the multilingual platform experience.

### Business Value
Automates the translation pipeline end-to-end by establishing continuous job processing, eliminating manual operational overhead for translation job execution, and ensuring consistent translation delivery without human intervention. The configurable interval allows balancing translation latency against infrastructure costs based on business priorities and usage patterns.

### Technical Details
- **Scheduling Platform**: Railway Cron Jobs (or alternative scheduling mechanism like GitHub Actions scheduled workflows, Vercel Cron, or external services like Upstash QStash)
- **Target Endpoint**: POST /api/admin/process-translations
- **Scheduling Options**:
  - Low-latency mode: every 30 seconds (`*/30 * * * * *` for platforms supporting second-level granularity, or every 1 minute `*/1 * * * *` as alternative)
  - Cost-optimized mode: every 5 minutes (`*/5 * * * *`)
- **Authentication**: Service role key or admin API credentials passed via Authorization header
- **Request Payload**: `{ "batchSize": 10 }` (configurable based on expected load)
- **Retry Policy**: Rely on next scheduled execution for retry, no immediate retry on failure
- **Timeout**: 30 seconds maximum per execution to prevent overlapping jobs

### Dependencies
- REQ-332: Job Processing Trigger API Route - provides the endpoint that the cron job will invoke
- Railway platform or alternative scheduling infrastructure - provides the cron execution environment
- Service role authentication - provides credentials for automated endpoint access

### Acceptance Criteria
- [ ] A cron job configuration is established on Railway or alternative platform
- [ ] The cron job is configured to execute every 30 seconds (or every 1 minute) for low-latency mode
- [ ] An alternative cost-optimized configuration is documented for every 5 minutes execution
- [ ] The cron job makes a POST request to /api/admin/process-translations endpoint
- [ ] The request includes Authorization header with valid service role key or admin credentials
- [ ] The request body includes batchSize parameter set to 10 (or configurable value)
- [ ] The cron job configuration includes a 30-second timeout to prevent hung executions
- [ ] Execution logs are accessible for monitoring job triggering and response status
- [ ] Transient HTTP failures (5xx errors, network timeouts) are logged but do not halt future executions
- [ ] The cron configuration is documented in project documentation or README with setup instructions
- [ ] Environment variables are used to store service role credentials rather than hardcoding in cron configuration
- [ ] The cron job configuration prevents overlapping executions when a single execution exceeds the interval duration
- [ ] The scheduling mechanism is resilient to platform restarts or temporary outages
- [ ] Instructions are provided for switching between low-latency and cost-optimized intervals
- [ ] The cron configuration is version-controlled or documented for reproducibility across environments
- [ ] Testing procedures are documented to validate that the cron job successfully triggers translation processing
- [ ] Alternative scheduling platforms are documented as fallback options if Railway cron is unavailable
- [ ] The configuration includes alerting or notification for repeated failures beyond normal transient errors

---

## REQ-334: Create Translation Job Monitoring Endpoint

**Date**: 2026-01-18 17:05
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a RESTful API endpoint that returns comprehensive job queue statistics and operational health metrics for the translation pipeline, enabling administrators to monitor queue depth, processing throughput, and error rates.

### Current Behavior
No API endpoint exists to query the current state of the translation job queue or obtain operational metrics about translation processing activity. Administrators cannot determine how many translation jobs are queued, actively processing, or have recently completed or failed. Monitoring the translation pipeline requires direct database access to query job status counts, and there is no centralized view of queue health metrics or processing performance indicators.

### Expected Behavior
When a GET request is made to the administrative monitoring endpoint, the API validates that the requesting user has service role or administrator permissions before proceeding. The handler queries the translation job queue to calculate real-time statistics including the total count of jobs in queued status waiting for processing, the total count of jobs currently in processing status being actively executed, the count of jobs that completed successfully within the last hour to indicate recent throughput, and the count of jobs that failed within the last hour to surface error rates. The endpoint accepts optional query parameters for filtering by entity type (item, article, link, tag) and status (queued, processing, completed, failed) to enable focused monitoring of specific content types or job states. The response returns all calculated statistics in a structured JSON format with clear field names, includes timestamp metadata indicating when the statistics were calculated, and provides cache-friendly headers with appropriate short-lived cache durations to balance monitoring frequency against database query load.

### User Impact
Administrators can monitor the health and performance of the translation pipeline through dashboards or monitoring tools that query the endpoint regularly. Operations teams can identify translation queue backlogs by observing high queued counts and take corrective action before delays impact user experience. Error rate monitoring through the failed jobs count enables proactive investigation of translation service issues or systematic failures affecting content translation. The filtering capabilities allow focused monitoring of specific content types when troubleshooting entity-specific translation problems.

### Business Value
Provides operational visibility into the translation pipeline by exposing key performance indicators and queue health metrics, enabling data-driven decisions about infrastructure scaling, error investigation priorities, and translation throughput optimization. Early detection of queue backlogs or elevated error rates prevents degradation of the translation experience for property owners and international guests.

### Technical Details
- **File Location**: `/src/app/api/admin/translation-jobs/route.ts`
- **HTTP Method**: GET
- **Query Parameters**:
  - `entityType`: Filter by content entity type (optional) - one of: item, article, link, tag
  - `status`: Filter by job status (optional) - one of: queued, processing, completed, failed
- **Response Format**: JSON with job queue statistics
- **Authentication**: Requires service role key or administrator user authentication
- **Authorization**: Only users with admin role or service role key can access this endpoint

### Dependencies
- Epic 1: Translation Job Queue infrastructure - provides job queue table and status tracking
- REQ-332: Job Processing Trigger API Route - establishes patterns for admin-only endpoints
- REQ-276: Job Prioritization - provides context for queue ordering that statistics represent

### Acceptance Criteria
- [ ] A route handler file is created at /src/app/api/admin/translation-jobs/route.ts
- [ ] The GET handler validates authentication using either service role key or admin user credentials
- [ ] Unauthenticated requests return 401 Unauthorized with descriptive error message
- [ ] Non-administrator users without service role return 403 Forbidden with descriptive error message
- [ ] The handler accepts optional entityType query parameter for filtering statistics
- [ ] When entityType is provided, the handler validates it is one of: 'item', 'article', 'link', 'tag'
- [ ] Invalid entityType values return 400 Bad Request with descriptive error message
- [ ] The handler accepts optional status query parameter for filtering statistics
- [ ] When status is provided, the handler validates it is one of: 'queued', 'processing', 'completed', 'failed'
- [ ] Invalid status values return 400 Bad Request with descriptive error message
- [ ] The handler queries the job queue table to count jobs with status 'queued'
- [ ] The handler queries the job queue table to count jobs with status 'processing'
- [ ] The handler queries the job queue table to count jobs with status 'completed' updated within the last hour
- [ ] The handler queries the job queue table to count jobs with status 'failed' updated within the last hour
- [ ] When entityType filter is provided, all count queries are filtered by the specified entity type
- [ ] When status filter is provided, only the count for the specified status is returned with other counts set to zero or omitted
- [ ] The response includes a queuedCount field indicating jobs waiting for processing
- [ ] The response includes a processingCount field indicating jobs currently being executed
- [ ] The response includes a completedLastHour field indicating successfully processed jobs in the last hour
- [ ] The response includes a failedLastHour field indicating failed jobs in the last hour
- [ ] The response includes a timestamp field indicating when the statistics were calculated
- [ ] The response includes an appliedFilters object showing which filters were active (entityType, status) or null if none
- [ ] The handler returns 200 OK with all count fields even when counts are zero
- [ ] Database query errors return 500 Internal Server Error with generic error message
- [ ] The handler logs monitoring requests including filter parameters for operational tracking
- [ ] The response includes Cache-Control header with max-age of 10 seconds to allow brief caching
- [ ] The implementation uses efficient COUNT queries with appropriate WHERE clauses rather than retrieving full job records
- [ ] The implementation uses database indexes on status and updated_at columns for performant counting
- [ ] The one-hour window for completed and failed counts uses server-side database timestamp comparison for accuracy
- [ ] The response includes a totalJobs field indicating the overall count of jobs across all statuses when no status filter is applied

---

## REQ-335: Create Database Indexes for Translation Job Optimization

**Date**: 2026-01-18 07:07
**Type**: ENHANCEMENT
**Size**: S

### Summary
The system must create specialized database indexes on the translation jobs table to optimize query performance for job processing, status tracking, and stale job cleanup operations.

### Current Behavior
Translation job queries execute full table scans when retrieving pending jobs for processing, looking up job status by entity identifier, or identifying stale jobs that have been processing too long. As the volume of translation jobs grows over time, these unindexed queries become progressively slower, degrading job processor performance and increasing database load. Status queries for dashboards and monitoring endpoints experience high latency when filtering by entity type and status combinations.

### Expected Behavior
Database queries against the translation jobs table execute efficiently using specialized indexes optimized for the most common query patterns in the translation pipeline. When the job processor retrieves pending or queued jobs ordered by priority and creation timestamp, the query uses an index that filters by status and orders results without requiring a full table scan. When status endpoints query jobs by entity type, entity identifier, and target language, the query uses an index that supports those exact lookup columns. When stale job cleanup identifies jobs stuck in processing status beyond the timeout threshold, the query uses an index filtered for processing status and ordered by started timestamp.

### User Impact
Translation job processing maintains consistent performance regardless of translation queue depth, ensuring property owners receive their translations promptly even as the platform scales to thousands of properties and millions of translation jobs. Dashboard and monitoring interfaces display translation status quickly without database query timeouts or perceived lag when loading job statistics. Background cleanup operations execute efficiently without impacting active job processing performance.

### Business Value
Ensures the translation pipeline scales effectively to support platform growth by optimizing the most performance-critical database queries, preventing translation delays caused by database performance degradation, and reducing database resource consumption through efficient index usage rather than expensive table scans.

### Acceptance Criteria
- [ ] An index named idx_translation_jobs_pending is created on the translation_jobs table
- [ ] The pending jobs index includes columns: status, priority DESC, created_at ASC
- [ ] The pending jobs index uses a partial index filter WHERE status IN ('queued', 'processing')
- [ ] An index named idx_translation_jobs_entity is created on the translation_jobs table
- [ ] The entity jobs index includes columns: entity_type, entity_id, target_language
- [ ] An index named idx_translation_jobs_stale is created on the translation_jobs table
- [ ] The stale jobs index includes columns: status, started_at
- [ ] The stale jobs index uses a partial index filter WHERE status = 'processing'
- [ ] All indexes are created using IF NOT EXISTS to allow safe re-execution of the migration
- [ ] The indexes are created through a Supabase migration with an appropriate descriptive migration name
- [ ] The migration is applied using the Supabase MCP tool apply_migration function
- [ ] Database query plans for job processor queries show index usage rather than sequential scans
- [ ] The migration name follows the snake_case convention (e.g., create_translation_job_indexes)
- [ ] The migration SQL is idempotent and can be safely run multiple times

---

## REQ-336: Create Translation Content Lookup Indexes

**Date**: 2026-01-18 18:45
**Type**: ENHANCEMENT
**Size**: S

### Summary
The system must create specialized database indexes on translation content tables to enable fast lookup of translated content when displaying property listings and articles to international guests.

### Current Behavior
Translation content queries execute full table scans when retrieving translated versions of items, articles, links, and tags for display to users viewing the platform in their preferred language. As the volume of translated content grows across thousands of properties and multiple languages, these unindexed queries become progressively slower, degrading page load performance and creating a poor experience for international guests. Each content display requires looking up translations by entity identifier and target language, but without indexes these lookups scan entire translation tables.

### Expected Behavior
Database queries against translation content tables execute efficiently using composite indexes optimized for the most common content retrieval pattern: looking up a specific translation by entity identifier and language code. When the application displays an item to a guest viewing the site in French, the query retrieves the French translation by item identifier and language using an index that supports both columns without requiring a full table scan. When multiple items appear on a property listing page, the batch translation lookup uses the same indexes to retrieve all translations efficiently. The same pattern applies for articles, links, and tags, with each translation table having an appropriate index for its primary key structure.

### User Impact
International guests experience fast page loads when viewing property listings, guides, and resources in their preferred language. Translated content displays immediately without delays caused by slow database queries scanning large translation tables. Property owners with extensive multilingual content see their listings render quickly for international visitors regardless of how many items, articles, or tags require translation lookup. The platform maintains responsive performance even as translation content volume grows to millions of records across all supported languages.

### Business Value
Ensures the translated content delivery performs efficiently at scale by optimizing the most frequent read operation in the translation system, improving guest satisfaction through fast page loads, and preventing performance degradation that could negatively impact international user retention and booking conversion rates.

### Acceptance Criteria
- [ ] An index named idx_item_translations_lookup is created on the item_translations table
- [ ] The item translations index includes columns: item_id, language
- [ ] An index named idx_article_translations_lookup is created on the article_translations table
- [ ] The article translations index includes columns: article_id, language
- [ ] An index named idx_link_translations_lookup is created on the link_translations table
- [ ] The link translations index includes columns: link_id, language
- [ ] An index named idx_tag_translations_tag_lang is created on the tag_translations table
- [ ] The tag translations index includes columns: tag_key, language
- [ ] All indexes are created using IF NOT EXISTS to allow safe re-execution of the migration
- [ ] The indexes are created through a Supabase migration with an appropriate descriptive migration name
- [ ] The migration is applied using the Supabase MCP tool apply_migration function
- [ ] Database query plans for translation content lookups show index usage rather than sequential scans
- [ ] The migration name follows the snake_case convention (e.g., create_translation_lookup_indexes)
- [ ] The migration SQL is idempotent and can be safely run multiple times

---

## REQ-337: Create Automatic Updated Timestamp Trigger for Translation Tables

**Date**: 2026-01-18 07:15
**Type**: ENHANCEMENT
**Size**: S

### Summary
The system must automatically update the updated_at timestamp column whenever a translation record is modified, ensuring accurate tracking of when translations were last changed.

### Current Behavior
Translation records in the translation tables do not have automatic timestamp management for modification tracking. When translations are updated through UPSERT operations or manual override endpoints, the updated_at column must be manually set by application code. This creates risk of inconsistent timestamp tracking if some code paths forget to update the timestamp, and requires duplicate timestamp logic across multiple storage functions.

### Expected Behavior
When any translation record is modified in the translation tables, the database automatically sets the updated_at column to the current timestamp without requiring explicit timestamp management in application code. The system uses database triggers that execute before update operations on translation records, detecting row changes and applying the current timestamp. This automation ensures every translation modification is accurately timestamped regardless of which code path performed the update, providing reliable audit trails for when translations were last changed.

### User Impact
Translation modification timestamps accurately reflect when content was last translated or manually overridden, enabling users to assess translation freshness when making decisions about content updates. The system displays reliable "last updated" indicators for translations in management interfaces without risk of stale or missing timestamp values caused by application code inconsistencies.

### Business Value
Improves data integrity by automating timestamp management at the database level, reducing application code complexity by eliminating redundant timestamp logic across storage functions, and ensuring accurate translation audit trails that support compliance and quality assurance processes.

### Acceptance Criteria
- [ ] A database trigger function named set_updated_at_timestamp is created that sets NEW.updated_at to CURRENT_TIMESTAMP
- [ ] The trigger function returns the modified NEW record to allow the update to proceed
- [ ] A BEFORE UPDATE trigger is created on the item_translations table invoking set_updated_at_timestamp
- [ ] A BEFORE UPDATE trigger is created on the article_translations table invoking set_updated_at_timestamp
- [ ] A BEFORE UPDATE trigger is created on the link_translations table invoking set_updated_at_timestamp
- [ ] A BEFORE UPDATE trigger is created on the tag_translations table invoking set_updated_at_timestamp
- [ ] The trigger function uses OR REPLACE to allow safe re-execution of the migration
- [ ] The triggers are created using IF NOT EXISTS or DROP/CREATE pattern to allow safe re-execution
- [ ] When a translation record is updated, the updated_at column is automatically set without application code intervention
- [ ] When a translation record is inserted, the updated_at column uses the default value without trigger interference
- [ ] The trigger function is created in the public schema or appropriate schema matching the translation tables
- [ ] The migration is created through a Supabase migration with descriptive name (e.g., add_translation_updated_at_trigger)
- [ ] The migration is applied using the Supabase MCP tool apply_migration function
- [ ] The migration SQL is idempotent and can be safely run multiple times
- [ ] The trigger function executes efficiently without measurable performance impact on update operations

---

## REQ-338: Create Content Translation Module Structure and Type Definitions

**Date**: 2026-01-19 13:45
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must provide foundational TypeScript module structure and comprehensive type definitions for all content translation operations, establishing a clear contract for translation request handling, metadata storage, and result processing.

### Current Behavior
No dedicated module structure exists for content translation functionality. Type definitions for translation requests, job metadata, and translation results are scattered or nonexistent, making it difficult for developers to understand the translation system interface or build translation features with proper type safety.

### Expected Behavior
Developers import well-defined TypeScript interfaces from a centralized content translation module that clearly describe translation request structures, entity-specific translatable fields, translation job metadata, and translation result formats. The module exports all public-facing types through a clean index file, providing a single entry point for content translation type definitions. Type definitions cover all content entity types including items, articles, links, and tags, specifying which fields are translatable for each entity and how translation operations are structured.

### User Impact
This infrastructure enables developers to build translation features with full type safety and IntelliSense support, reducing implementation errors and improving code maintainability. Property owners benefit indirectly through more reliable translation features built on a solid type foundation that prevents runtime errors and data structure mismatches.

### Business Value
Establishes the architectural foundation for content translation features by providing clear, type-safe contracts for translation operations, reducing development time for translation features and minimizing bugs caused by type mismatches or incorrect data structures.

### Acceptance Criteria
- [ ] A module index file is created at /src/lib/content-translation/index.ts
- [ ] A type definitions file is created at /src/lib/content-translation/content-translation.types.ts
- [ ] Type definitions include interfaces for each translatable content entity (items, articles, links, tags)
- [ ] Type definitions specify which fields are translatable for each entity type
- [ ] Type definitions include translation request structures with entity identifier, source language, and target languages
- [ ] Type definitions include translation metadata structures with status, timestamps, and tracking information
- [ ] Type definitions include translation result structures with success/failure indicators and job identifiers
- [ ] Type definitions support batch translation operations for processing multiple entities efficiently
- [ ] All type definitions are exported from the module index file for external consumption
- [ ] Type definitions align with database schema structures established in Epic 3 foundation tasks
- [ ] TypeScript compilation succeeds without errors after module creation
- [ ] The module follows established project patterns for library organization and naming conventions

---


---

## REQ-339: Implement Content Translation Orchestrator Function

**Date**: 2026-01-19 14:22
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide a centralized orchestration function that coordinates the creation and queuing of translation jobs for user-generated content across all target languages, integrating with the translation service infrastructure from Epic 1.

### Current Behavior
No mechanism exists to systematically coordinate translation job creation when content requires translation across multiple languages. While the translation service infrastructure from Epic 1 provides the underlying capabilities for processing individual translation requests, there is no orchestrator to manage the complexity of creating multiple related jobs, tracking their submission status, and providing unified feedback about translation job creation outcomes.

### Expected Behavior
When content requires translation, the system accepts a structured request containing the content entity details, source language, and array of target languages, then automatically creates individual translation jobs for each target language through the job queue system. The orchestrator validates input parameters, creates job records with appropriate priority levels and metadata, interfaces with the translation service types established in Epic 1 for consistent data structures, and returns a comprehensive result indicating which jobs were successfully queued along with their tracking identifiers, which attempts failed along with error details, and overall operation status. The implementation handles partial failures gracefully, ensuring that if some job creations succeed while others fail, the successful jobs are preserved and the caller receives detailed information about both outcomes.

### User Impact
Property owners and content managers trigger translation for their content and receive immediate confirmation about which language translations were successfully initiated. The system handles the complexity of managing multiple translation jobs behind the scenes, providing clear feedback when some translations succeed while others encounter problems. Users trust that requesting translation for five languages will create five distinct jobs that can be tracked and monitored independently.

### Business Value
Streamlines the translation workflow by centralizing coordination logic in a single orchestrator function, reducing code duplication across different content types that all need similar translation job creation patterns, and ensuring consistent error handling and status reporting throughout the translation system.

### Acceptance Criteria
- [ ] A queueContentTranslations function is created at /src/lib/content-translation/content-translation.ts
- [ ] The function accepts QueueTranslationOptions parameter containing entity type, entity identifier, source language, target languages array, and content type metadata
- [ ] The function validates that all target languages are supported language codes defined in Epic 1 types
- [ ] The function validates that source language is a supported language code
- [ ] The function validates that entity type is one of the supported content types (item, article, link, tag)
- [ ] For each target language, the function creates a translation job record in the translation job queue
- [ ] Created job records include entity type, entity identifier, source language, target language, and priority level
- [ ] Created job records use the translation service types from Epic 1 for metadata structures
- [ ] The function returns QueueTranslationResult containing arrays of successfully queued jobs and failed attempts
- [ ] Successfully queued jobs include job tracking identifiers that callers can use for status monitoring
- [ ] Failed attempts include language codes and descriptive error messages explaining why job creation failed
- [ ] The function handles partial failures by completing all possible job creations even when some fail
- [ ] The function integrates with the job queue infrastructure established in Epic 1
- [ ] The function respects rate limiting constraints from the translation service layer when creating jobs
- [ ] The function is properly exported from the module index for use by other application components
- [ ] QueueTranslationOptions and QueueTranslationResult types are defined in content-translation.types.ts
- [ ] The function handles database errors gracefully and includes them in the failed attempts array
- [ ] The implementation prevents duplicate job creation when the same content and language combination already has a pending job
- [ ] The function logs job creation operations including entity details and success/failure counts for monitoring


---

## REQ-340: Implement Entity-Specific Translation Triggers

**Date**: 2026-01-19 (System timestamp at creation)
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide dedicated trigger functions for each content entity type (items, articles, links) to initiate translation workflows based on entity-specific field requirements.

### Current Behavior
There is no automated mechanism to trigger translation workflows for different content entity types when content is created or updated.

### Expected Behavior
When content is created or updated, dedicated trigger functions extract the appropriate translatable fields for each entity type and queue them for translation across all supported languages. Items trigger translation of name and description fields, articles trigger translation of title and description fields, and links trigger translation of only the title field while preserving URLs unchanged.

### User Impact
Content creators and administrators can rely on automatic translation workflows that understand which fields need translation for each content type, eliminating manual translation coordination and ensuring consistent multilingual content availability.

### Business Value
Streamlines content translation by automating field extraction and translation job creation for different entity types, reducing manual effort and ensuring comprehensive multilingual content coverage.

### Acceptance Criteria
- [ ] Item translation trigger accepts item identifier and source language, then queues translations for name and description fields
- [ ] Article translation trigger accepts article identifier and source language, then queues translations for title and description fields
- [ ] Link translation trigger accepts link identifier and source language, then queues translation for title field only
- [ ] All trigger functions return standardized queue result information including job identifiers and status
- [ ] Link trigger explicitly excludes URL fields from translation processing
- [ ] Each trigger function handles errors gracefully and returns meaningful error information


---

## REQ-341: Implement Translation Storage Utilities

**Date**: 2026-01-19 (Created by Claude)
**Type**: NEW FEATURE
**Size**: M

### Summary
The system must provide utilities to store and update translations for all content entities (items, articles, links, tags) using an upsert pattern that handles both new translations and updates to existing ones.

### Current Behavior
There are no dedicated utilities for persisting translated content to the database. Translation data must be manually inserted or updated through direct database operations, leading to code duplication and inconsistent handling across different content types.

### Expected Behavior
The system provides a centralized translation storage module with specialized functions for each content type. When a translation is stored, the system automatically determines whether to insert a new record or update an existing one based on the entity identifier and target language. All storage operations succeed or fail atomically, ensuring data consistency.

### User Impact
Content managers and system administrators benefit from reliable, consistent translation persistence across all content types. Developers implementing translation features can use standardized utilities instead of writing custom database logic for each entity type.

### Business Value
Centralizing translation storage logic reduces implementation errors, accelerates feature development, and ensures consistent data quality across all translated content. This foundation enables reliable multi-language content delivery.

### Acceptance Criteria
- [ ] A translation storage module exists with separate functions for items, articles, links, and tags
- [ ] Each storage function accepts the entity identifier, target language code, and translation data
- [ ] All functions use upsert logic to handle both initial translation creation and subsequent updates
- [ ] Tag translations can be stored using a tag key and language pair
- [ ] Storage operations properly handle database constraints and return meaningful success or error indicators
- [ ] Concurrent upsert operations for the same entity and language resolve without data corruption


---

## REQ-342: Create Source Language Detection Utility

**Date**: 2026-01-19 (System Date)
**Type**: NEW FEATURE
**Size**: S

### Summary
The system must automatically determine the source language for content translation by evaluating multiple priority inputs.

### Current Behavior
No standardized mechanism exists to determine what language content is being created in when translation workflows are triggered.

### Expected Behavior
When content is created or modified, the system determines the source language by checking (in order):
1. An explicit language override if provided
2. The content creator's preferred language setting
3. The account's default language setting
4. English as the ultimate fallback

The detected language is then used as the source for translating content into other supported languages.

### User Impact
- Content creators working in non-English languages will have their content automatically detected and translated from their preferred language
- Accounts with specific language preferences will default to that language for all users unless overridden
- Explicit language selection during content creation will always take precedence
- Ensures consistent source language detection across all content types (articles, items, tags)

### Business Value
Enables multilingual content creation workflows by providing a reliable, predictable method for determining source language, supporting the platform's goal of serving international audiences.

### Acceptance Criteria
- [ ] Utility accepts user object, account object, and optional override parameter
- [ ] Returns a valid supported language code
- [ ] Override parameter takes highest priority when provided
- [ ] User preferred language is used if no override is specified
- [ ] Account preferred language is used if neither override nor user preference exists
- [ ] English ('en') is returned when no other source can be determined
- [ ] Utility handles missing or null values gracefully at each priority level


---

## REQ-343: Modify Articles API to Trigger Translations

**Date**: 2026-01-19 13:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
The articles API endpoints should automatically trigger translation workflows when articles are created or updated, ensuring multilingual availability of article content.

### Current Behavior
Articles can be created and modified through the admin API, but there is no automatic translation workflow triggered for newly created or updated article content. Translations must be manually initiated or coordinated separately.

### Expected Behavior
When an article is created through the POST endpoint, the system accepts an optional source language parameter, creates the article, and automatically queues translations for all supported languages. When an article is updated through the PUT or PATCH endpoint, the system removes any existing translations and queues fresh translations based on the updated content. All translation operations execute asynchronously and do not block the article creation or update response.

### User Impact
Content administrators creating or updating articles will see their content automatically become available in all supported languages without manual intervention. The translation process happens in the background, allowing administrators to continue their workflow immediately.

### Business Value
Eliminates manual translation coordination for article content, accelerates multilingual content availability, and ensures consistency between the article creation workflow and translation coverage.

### Acceptance Criteria
- [ ] POST handler accepts optional sourceLanguage parameter in request body
- [ ] After successful article creation, translation workflow is queued automatically
- [ ] PUT or PATCH handler deletes existing article translations before queuing new ones
- [ ] Translation queueing uses the content translation orchestrator
- [ ] Article API responses return immediately without waiting for translation jobs to complete
- [ ] Errors in translation queueing do not prevent article creation or update from succeeding
- [ ] Source language defaults appropriately if not explicitly provided in request



---

## REQ-344: Modify Links API to Trigger Translations

**Date**: 2026-01-19 13:50
**Type**: ENHANCEMENT
**Size**: M

### Summary
The links API endpoints should automatically trigger translation workflows when links are created or updated, ensuring multilingual availability of link titles.

### Current Behavior
Links associated with items can be created and modified through the admin API, but there is no automatic translation workflow triggered for newly created or updated link titles. Translations must be manually initiated or coordinated separately.

### Expected Behavior
When a link is created through the POST endpoint, the system creates the link record and automatically queues translations of the link title for all supported languages. When a link is updated through the PUT endpoint, the system first removes any existing link translations, then queues fresh translations based on the updated link title. All translation operations execute asynchronously and do not block the link creation or update response.

### User Impact
Content administrators creating or updating item links will see their link titles automatically become available in all supported languages without manual intervention. The translation process happens in the background, allowing administrators to continue their workflow immediately.

### Business Value
Eliminates manual translation coordination for link content, accelerates multilingual content availability, and ensures consistency between the link management workflow and translation coverage across all item-related resources.

### Acceptance Criteria
- [ ] POST handler queues link title translation after successful creation
- [ ] PUT handler deletes existing link translations before queueing new ones
- [ ] Translation queueing uses the content translation orchestrator
- [ ] Links API responses return immediately without waiting for translation jobs to complete
- [ ] Errors in translation queueing do not prevent link creation or update from succeeding
- [ ] Source language is determined using the standard source language detection utility
- [ ] Translation workflow covers all supported languages configured in the system

---

## REQ-345: Add Tag Translation on Item Save

**Date**: 2026-01-19 14:02
**Type**: ENHANCEMENT
**Size**: M

### Summary
The items API endpoints should automatically trigger tag translation workflows when items are created or updated with user-defined tags, ensuring multilingual availability of tag labels.

### Current Behavior
Items can be created and modified with an array of tags through the admin API, but there is no automatic translation workflow triggered for user-defined tags. System tags and user tags are both stored without distinction in translation handling, and translations must be manually initiated or coordinated separately.

### Expected Behavior
When an item is created or updated through POST or PUT endpoints, the system examines each tag in the tags array. For user-defined tags (those not starting with '#'), the system checks whether translations already exist. If translations are missing, the system queues a tag translation job. System tags (those starting with '#') are skipped entirely, as they follow a different translation mechanism. All translation operations execute asynchronously and do not block the item creation or update response.

### User Impact
Content administrators creating or updating items with custom tags will see those tag labels automatically become available in all supported languages without manual intervention. The translation process happens in the background, allowing administrators to continue their workflow immediately while system tags remain unaffected.

### Business Value
Eliminates manual translation coordination for user-generated tag content, accelerates multilingual availability of item categorization, and ensures consistent translation coverage between items and their associated user-defined tags.

### Acceptance Criteria
- [ ] POST handler iterates through tags array after successful item creation
- [ ] PUT handler iterates through tags array after successful item update
- [ ] System filters out tags starting with '#' from translation workflow
- [ ] For each user tag, system checks if translations exist before queueing
- [ ] Tag translation jobs are queued only when translations are missing
- [ ] Translation queueing uses the content translation orchestrator
- [ ] Items API responses return immediately without waiting for tag translation jobs to complete
- [ ] Errors in tag translation queueing do not prevent item creation or update from succeeding

---

## REQ-346: Update TypeScript Types for Content Translation API Responses

**Date**: 2026-01-19 
**Type**: ENHANCEMENT
**Size**: S

### Summary
Extend API response and request types to include translation job metadata and source language information.

### Current Behavior
API response types for items, articles, and links do not expose translation job identifiers or source language metadata. Client applications cannot track translation status or determine the original language of content.

### Expected Behavior
Response types include optional fields for translation job tracking. Request types allow clients to specify the source language explicitly. All translation-related types are exported from the central types module for consistent usage across the application.

### User Impact
Developers building features that display translation status, trigger re-translation workflows, or show language indicators will have properly typed API contracts. Type safety prevents runtime errors when accessing translation metadata.

### Business Value
Improves developer experience and reduces integration bugs by providing complete type coverage for the translation feature surface area.

### Acceptance Criteria
- [ ] ItemResponse and ArticleResponse types include an optional translationJobIds field (string array)
- [ ] CreateItemRequest and CreateArticleRequest types include an optional sourceLanguage field (string)
- [ ] Translation-related types are exported from the central types module
- [ ] Existing API contracts remain backward compatible
- [ ] TypeScript compilation succeeds without errors after type updates


---

## REQ-347: Enhance Job Processor for Content-Specific Translation Handling

**Date**: 2026-01-19 10:45
**Type**: ENHANCEMENT
**Size**: M

### Summary
Extend the translation job processor to route different content types through specialized translation handlers based on entity type.

### Current Behavior
The job processor handles all translation jobs uniformly without distinguishing between items, articles, links, or tags. Each content type may have unique field structures, validation requirements, or post-processing needs that are not accommodated by generic processing logic.

### Expected Behavior
When a translation job is dequeued for processing, the system inspects the entity type field and routes the job to a content-specific handler function. Item translations, article translations, link translations, and tag translations each follow dedicated processing paths that understand the structure and business rules of their respective content types. The routing mechanism remains extensible to support future content types without modifying core job processing infrastructure.

### User Impact
Content of all types receives accurate translations that respect field-specific formatting, validation rules, and contextual requirements. Translation quality improves as each handler can apply domain-specific logic rather than treating all content identically.

### Business Value
Enables more sophisticated translation workflows tailored to content structure, reduces translation errors caused by one-size-fits-all processing, and provides a scalable foundation for adding new translatable content types in the future.

### Acceptance Criteria
- [ ] processTranslationJob function accepts a TranslationJob parameter with an entityType field
- [ ] Switch statement or routing logic dispatches based on entityType value
- [ ] processItemTranslation handler exists and processes jobs where entityType is 'item'
- [ ] processArticleTranslation handler exists and processes jobs where entityType is 'article'
- [ ] processLinkTranslation handler exists and processes jobs where entityType is 'link'
- [ ] processTagTranslation handler exists and processes jobs where entityType is 'tag'
- [ ] Each handler retrieves the source content from the appropriate database table
- [ ] Each handler invokes the translation service with content-appropriate parameters
- [ ] Each handler stores translated results in the corresponding translation table
- [ ] Unrecognized entityType values log an error and mark the job as failed without crashing the processor
- [ ] Existing generic translation tests remain passing or are adapted to use the new routing



---

## REQ-348: Implement Item Translation Processor

**Date**: 2026-01-19 11:15
**Type**: NEW FEATURE
**Size**: M

### Summary
Create a dedicated processor that handles translation jobs for items by fetching the source item, translating its name and description fields, and storing results in the item_translations table.

### Current Behavior
Translation jobs for items are created and queued, but no specialized handler exists to process them. The system cannot automatically translate item content when jobs are dequeued from the translation job queue.

### Expected Behavior
When a translation job for an item is dequeued, the processor retrieves the item by ID from the items table, extracts the name and description fields, invokes the translation service to translate both fields into the target language, stores the translated content in the item_translations table with references to the source item and target language, and updates the translation job status to completed or failed based on the outcome. If the item does not exist or translation fails, the job status reflects the failure with appropriate error information.

### User Impact
Guests viewing items in their preferred language see translated item names and descriptions automatically. Property owners creating or updating items trigger background translation without manual intervention, ensuring content availability across all supported languages.

### Business Value
Enables seamless multilingual item discovery and browsing, removes manual translation burden from content creators, and ensures consistent availability of translated content across the platform's supported languages.

### Acceptance Criteria
- [ ] processItemTranslation function accepts job ID, item ID, source language, and target language parameters
- [ ] Function fetches the item record from the items table using the provided item ID
- [ ] If item is not found, job status is updated to failed with an appropriate error message
- [ ] Name and description fields are extracted from the retrieved item record
- [ ] Translation service is invoked to translate both name and description to the target language
- [ ] If translation fails, job status is updated to failed with error details and processing stops
- [ ] Translated name and description are stored in item_translations table with item_id, language_code, and timestamp
- [ ] If an existing translation for the same item and language exists, it is updated rather than duplicated
- [ ] After successful storage, job status is updated to completed
- [ ] Function returns a success indicator and the translation record ID or error details
- [ ] Processing errors are logged with sufficient context for debugging


---

## REQ-349: Implement Link Translation Processor

**Date**: 2026-01-19 15:30
**Type**: NEW FEATURE
**Size**: S

### Summary
Create a dedicated processor that handles translation jobs for links by fetching the source link, translating its title field, and storing results in the link_translations table.

### Current Behavior
Translation jobs for links are created and queued, but no specialized handler exists to process them. The system cannot automatically translate link content when jobs are dequeued from the translation job queue.

### Expected Behavior
When a translation job for a link is dequeued, the processor retrieves the link by ID from the links table, extracts the title field, invokes the translation service to translate the title into the target language, stores the translated content in the link_translations table with references to the source link and target language, and updates the translation job status to completed or failed based on the outcome. If the link does not exist or translation fails, the job status reflects the failure with appropriate error information.

### User Impact
Guests viewing links in their preferred language see translated link titles automatically. Property owners creating or updating links trigger background translation without manual intervention, ensuring link titles are available across all supported languages.

### Business Value
Enables seamless multilingual link presentation, removes manual translation burden from content creators, and ensures consistent availability of translated link titles across the platform's supported languages.

### Acceptance Criteria
- [ ] processLinkTranslation function accepts job ID, link ID, source language, and target language parameters
- [ ] Function fetches the link record from the links table using the provided link ID
- [ ] If link is not found, job status is updated to failed with an appropriate error message
- [ ] Title field is extracted from the retrieved link record
- [ ] Translation service is invoked to translate the title to the target language
- [ ] If translation fails, job status is updated to failed with error details and processing stops
- [ ] Translated title is stored in link_translations table with link_id, language_code, and timestamp
- [ ] If an existing translation for the same link and language exists, it is updated rather than duplicated
- [ ] After successful storage, job status is updated to completed
- [ ] Function returns a success indicator and the translation record ID or error details
- [ ] Processing errors are logged with sufficient context for debugging


---

## REQ-350: Implement Tag Translation Processor

**Date**: 2026-01-19 16:45
**Type**: NEW FEATURE
**Size**: S

### Summary
Create a dedicated processor that handles translation jobs for tags by fetching the source tag, translating its value field, and storing results in the tag_translations table with proper system tag identification.

### Current Behavior
Translation jobs for tags are created and queued, but no specialized handler exists to process them. The system cannot automatically translate tag content when jobs are dequeued from the translation job queue. User-generated tags remain untranslated while system tags may have separate translation workflows.

### Expected Behavior
When a translation job for a tag is dequeued, the processor retrieves the tag by ID from the tags table, extracts the value field, invokes the translation service to translate the tag value into the target language, stores the translated content in the tag_translations table with references to the source tag and target language, marks the translation as a user tag by setting is_system_tag to false, and updates the translation job status to completed or failed based on the outcome. If the tag does not exist or translation fails, the job status reflects the failure with appropriate error information.

### User Impact
Guests viewing tagged content in their preferred language see translated tag labels automatically. Property owners creating or updating tags trigger background translation without manual intervention, ensuring tag labels are understandable across all supported languages regardless of the original language used.

### Business Value
Enables seamless multilingual tag presentation, improves content discoverability across language boundaries, removes manual translation burden from content creators, and ensures consistent tag translation handling for user-generated tags distinct from pre-seeded system tags.

### Acceptance Criteria
- [ ] processTagTranslation function accepts job ID, tag ID, source language, and target language parameters
- [ ] Function fetches the tag record from the tags table using the provided tag ID
- [ ] If tag is not found, job status is updated to failed with an appropriate error message
- [ ] Value field is extracted from the retrieved tag record
- [ ] Translation service is invoked to translate the tag value to the target language
- [ ] If translation fails, job status is updated to failed with error details and processing stops
- [ ] Translated tag value is stored in tag_translations table with tag_id, language_code, and is_system_tag set to false
- [ ] Translation record includes appropriate timestamp fields for creation and updates
- [ ] If an existing translation for the same tag and language exists, it is updated rather than duplicated
- [ ] After successful storage, job status is updated to completed
- [ ] Function returns a success indicator and the translation record ID or error details
- [ ] Processing errors are logged with sufficient context for debugging
- [ ] System tags are explicitly excluded from this processor or handled with is_system_tag validation


---

## REQ-351: Implement Job Prioritization for Translation Queue

**Date**: 2026-01-19 
**Type**: ENHANCEMENT
**Size**: M

### Summary
The translation job queue should process jobs based on priority levels to ensure recently created content is translated first, followed by updates, batch imports, and retry attempts.

### Current Behavior
Translation jobs are processed in the order they are received without consideration for urgency or content type. New content waits in queue behind older jobs, potentially causing delays in making fresh content available to multilingual audiences.

### Expected Behavior
When translation jobs are picked from the queue, they are selected according to priority level (highest first) and creation time (oldest first within same priority). Recently created content appears in target languages within minutes, while less time-sensitive operations like batch imports and retries process in the background.

### User Impact
Content creators and property owners benefit from faster translation turnaround on new listings and articles. Guests see newly published content in their preferred language without significant delay. System administrators can manage translation workload more effectively by controlling job priority.

### Business Value
Improves perceived system responsiveness and content freshness for international users. Reduces time-to-market for new listings in multiple languages.

### Acceptance Criteria
- [ ] Priority 100 jobs (content created within last 5 minutes) are picked before all other jobs
- [ ] Priority 50 jobs (updated content) are picked after priority 100 but before priority 25
- [ ] Priority 25 jobs (batch imports) are picked after priority 50 but before priority 10
- [ ] Priority 10 jobs (retry attempts) are picked last
- [ ] Within the same priority level, older jobs are processed before newer jobs
- [ ] Job picker query returns jobs ordered by priority descending, then creation time ascending
- [ ] All priority levels function correctly under concurrent job processing scenarios



---

## REQ-352: Implement Stale Job Cleanup for Translation Queue

**Date**: 2026-01-19 17:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
Translation jobs that remain in processing state for more than 5 minutes should be automatically detected and reset to queued status with incremented attempt counts to prevent permanent stuck jobs.

### Current Behavior
Jobs can become stuck in processing state due to worker crashes, timeouts, or unexpected errors, blocking those translation records from being retried. These stuck jobs accumulate over time and require manual intervention to identify and reset.

### Expected Behavior
Before the job processor picks new jobs from the queue, a cleanup routine runs that identifies jobs in processing state for more than 5 minutes, resets their status back to queued, increments their attempt counter, and logs the reset action. These recovered jobs then become eligible for processing again according to normal priority rules.

### User Impact
Content owners and administrators no longer encounter permanently stalled translations requiring manual database intervention. Translation processing continues automatically even after transient system failures, ensuring content eventually reaches all target languages without human intervention.

### Business Value
Improves system reliability and reduces operational overhead by automatically recovering from transient failures. Ensures translation coverage remains comprehensive even during system instability.

### Acceptance Criteria
- [ ] Cleanup function identifies jobs with status processing and updated_at timestamp older than 5 minutes
- [ ] Identified stale jobs have their status changed from processing to queued
- [ ] Attempt counter is incremented for each reset job
- [ ] If attempt counter exceeds maximum retry limit (e.g., 3), job status is set to failed instead of queued
- [ ] Cleanup function logs the number of jobs reset and their IDs for monitoring purposes
- [ ] Cleanup function runs automatically before each batch of jobs is picked from the queue
- [ ] Cleanup execution does not block or significantly delay normal job processing
- [ ] Failed job resets include error message indicating automatic recovery from stale state
- [ ] Cleanup handles concurrent execution safely without race conditions or duplicate resets



---

## REQ-353: Create Translation Status API Endpoint

**Date**: 2026-01-19 18:45
**Type**: NEW FEATURE
**Size**: M

### Summary
An API endpoint should provide comprehensive translation status information for any content entity, including job queue state, completion status per language, and relevant timestamps.

### Current Behavior
There is no standardized way to query the current translation status of content entities. Applications and components must directly query multiple database tables to determine whether translations exist, are in progress, or have failed.

### Expected Behavior
A GET endpoint accepts an entity type and entity identifier in the URL path and returns a structured response containing overall translation status, per-language translation state, job queue information if translations are pending or in progress, and all relevant timestamps. The response includes appropriate HTTP cache headers to reduce database load for frequently accessed entities.

### User Impact
Content creators can see real-time translation progress when editing or reviewing their content. Guest-facing components can determine which language options to display based on completed translations. System monitoring tools can track translation health across all content types without complex database queries.

### Business Value
Centralizes translation status logic into a single, well-defined API that all features can rely on. Reduces database query overhead through intelligent caching. Enables better user experience by showing accurate translation availability.

### Acceptance Criteria
- [ ] GET endpoint accepts entityType parameter (item, article, link, tag) in URL path
- [ ] GET endpoint accepts entityId parameter (UUID) in URL path
- [ ] Response includes overall status field (no_translations, pending, in_progress, completed, partial, failed)
- [ ] Response includes array of language-specific statuses with language code, translation status, and last updated timestamp
- [ ] Response includes job information (job ID, queue position, priority) when translations are queued or processing
- [ ] Response includes created_at and updated_at timestamps for translation records
- [ ] Endpoint returns 404 when entity does not exist
- [ ] Endpoint returns 200 with empty translations array when entity exists but has no translation records
- [ ] Response includes Cache-Control header with appropriate max-age for completed translations
- [ ] Response includes ETag header based on translation updated_at timestamps for efficient caching
- [ ] Endpoint validates entityType against allowed values and returns 400 for invalid types
- [ ] Endpoint validates entityId format (must be valid UUID) and returns 400 for invalid format




---

## REQ-354: Create Retry Failed Translations Endpoint

**Date**: 2026-01-19 19:15
**Type**: NEW FEATURE
**Size**: M

### Summary
An API endpoint should allow administrators and content owners to retry failed translation jobs for specific content entities, either for all languages or a targeted subset of languages.

### Current Behavior
When translation jobs fail due to API errors, rate limiting, or temporary service unavailability, they remain in failed state indefinitely. Users have no mechanism to trigger retries without direct database access or waiting for manual intervention by system administrators.

### Expected Behavior
A POST endpoint accepts an entity type, entity identifier, and optional array of language codes. The system locates all failed translation jobs for the specified entity, optionally filtered by language codes if provided. Each identified job is reset to queued status with its attempt counter reset to zero, making it eligible for reprocessing. The endpoint returns a count of jobs successfully re-queued along with their details.

### User Impact
Content creators can independently retry translations when they notice missing language versions without contacting support. Administrators can bulk-retry failed translations after resolving upstream service issues. Automated monitoring systems can trigger retries based on failure patterns or scheduled maintenance windows.

### Business Value
Reduces manual operational overhead for translation failure recovery. Improves content completeness by enabling self-service retry capabilities. Decreases time-to-resolution for translation issues affecting multiple content items.

### Acceptance Criteria
- [ ] POST endpoint accepts entityType parameter (item, article, link, tag) in request body
- [ ] POST endpoint accepts entityId parameter (UUID) in request body
- [ ] POST endpoint accepts optional languages parameter (array of language codes) in request body
- [ ] Endpoint finds all translation jobs with status failed matching entityType and entityId
- [ ] When languages parameter is provided, only jobs for specified languages are selected
- [ ] Selected jobs have their status changed from failed to queued
- [ ] Selected jobs have their attempts counter reset to 0
- [ ] Response includes count of jobs re-queued
- [ ] Response includes array of re-queued job details (job ID, language, entity type, entity ID)
- [ ] Endpoint returns 404 when entity does not exist
- [ ] Endpoint returns 200 with count 0 when no failed jobs exist for the entity
- [ ] Endpoint validates entityType against allowed values and returns 400 for invalid types
- [ ] Endpoint validates entityId format (must be valid UUID) and returns 400 for invalid format
- [ ] Endpoint validates language codes format and returns 400 for invalid or unsupported languages
- [ ] Operation is atomic - either all matching jobs are reset or none are (database transaction)
- [ ] Endpoint includes appropriate authentication and authorization checks
- [ ] Re-queued jobs are immediately eligible for pickup by the job processor



---

## REQ-355: Create Batch Translation Status Endpoint for List Views

**Date**: 2026-01-19 05:12
**Type**: NEW FEATURE
**Size**: M

### Summary
An API endpoint should accept multiple entity identifiers in a single request and return summary translation status for each entity, optimized for rendering status indicators in dashboard list views and table columns.

### Current Behavior
Dashboard views displaying multiple content items (articles, items, links, tags) must either make individual API requests for each entity's translation status or directly query multiple database tables with complex joins. This results in excessive network overhead for individual requests or complicated client-side data fetching logic.

### Expected Behavior
A POST endpoint accepts an array of entity references, where each reference contains an entity type and entity identifier. The system queries translation status for all entities in a single optimized database operation and returns a summary status object for each entity. Each summary includes the entity reference, overall translation status, count of completed languages, count of pending or in-progress languages, and count of failed languages. The response is structured for efficient mapping to list view rows.

### User Impact
Dashboard list views load significantly faster when displaying translation status indicators for dozens or hundreds of content items. Users can quickly scan which content has complete translations, which needs attention due to failures, and which is currently being processed. System performance improves due to reduced database round trips.

### Business Value
Enables performant dashboard experiences that scale to large content libraries. Reduces server load by batching status queries into optimized database operations. Improves user productivity by surfacing translation health at a glance across all content types.

### Acceptance Criteria
- [ ] POST endpoint accepts array of entity references in request body
- [ ] Each entity reference includes entityType field (item, article, link, tag)
- [ ] Each entity reference includes entityId field (UUID)
- [ ] Endpoint supports batch sizes up to 100 entities per request
- [ ] Response returns array of status summaries matching the order of input references
- [ ] Each status summary includes the original entityType and entityId for mapping
- [ ] Each status summary includes overall status (no_translations, pending, in_progress, completed, partial, failed)
- [ ] Each status summary includes completedCount (number of languages with completed translations)
- [ ] Each status summary includes pendingCount (number of languages with queued or processing jobs)
- [ ] Each status summary includes failedCount (number of languages with failed jobs)
- [ ] Each status summary includes totalLanguages (number of target languages configured for the entity type)
- [ ] Database query uses optimized joins and aggregations to minimize query complexity
- [ ] Endpoint returns 400 when request body is malformed or exceeds batch size limit
- [ ] Endpoint validates entityType values and returns 400 for invalid types
- [ ] Endpoint validates entityId format (must be valid UUID) and returns 400 for invalid format
- [ ] For entities that do not exist, status summary indicates no_translations status with zero counts
- [ ] Response includes appropriate Cache-Control header to allow short-term caching
- [ ] Endpoint completes within 2 seconds for batches of 100 entities
- [ ] Response structure is documented for client-side consumption (TypeScript types or JSON schema)



---

## REQ-356: Create Job Processing API Route for Translation Queue

**Date**: 2026-01-19 19:30
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide an administrative API endpoint that manually triggers translation job processing with configurable batch sizes, returning detailed processing statistics for operational monitoring and control.

### Current Behavior
Translation jobs accumulate in the queue after content creation or updates, but no dedicated API route exists for administrators to manually initiate processing on demand. System operators cannot trigger job processing outside of automated schedules, cannot adjust batch sizes dynamically based on current load conditions, and lack visibility into processing outcomes without examining logs or database records directly.

### Expected Behavior
An administrative POST endpoint accepts an optional batch size parameter and initiates translation job processing for the specified number of queued jobs. The system selects jobs from the queue based on priority and age, processes each through the appropriate content-specific translator, and returns comprehensive statistics including counts of successful completions, failures, and processing duration. The endpoint requires administrative credentials or service role authentication to prevent unauthorized access.

### User Impact
Administrators can manually trigger translation processing during maintenance windows or when addressing backlogs. Operations teams can adjust processing batch sizes to balance translation throughput against system resource constraints. Detailed statistics enable real-time monitoring of translation job health without requiring database access or log analysis tools.

### Business Value
Provides operational flexibility for managing translation workload by enabling on-demand processing control. Reduces time-to-resolution for translation backlogs through manual triggering capabilities. Improves system observability by surfacing processing metrics through a standardized API interface.

### Technical Details
- **File Location**: `/src/app/api/admin/process-translations/route.ts`
- **HTTP Method**: POST
- **Request Body**:
  - `batchSize`: Number of jobs to process (optional, default: 10) - must be integer between 1 and 100
- **Response Format**: JSON object containing processing statistics
- **Authentication**: Requires service role key or authenticated administrator user
- **Authorization**: Only admin role or service role credentials permitted

### Acceptance Criteria
- [ ] Route handler file exists at /src/app/api/admin/process-translations/route.ts
- [ ] POST handler validates authentication using service role key or admin user session
- [ ] Unauthenticated requests return 401 status with error message
- [ ] Non-admin authenticated users return 403 status with error message
- [ ] Handler accepts optional batchSize parameter from request body
- [ ] Missing batchSize parameter defaults to 10 jobs
- [ ] batchSize values less than 1 or greater than 100 return 400 status with validation error
- [ ] Handler queries translation job queue for jobs with status queued
- [ ] Query limits results to batchSize count
- [ ] Query orders jobs by priority descending then created_at ascending
- [ ] Handler processes each job through entity-type-specific processor
- [ ] Response includes processedCount field (total jobs attempted)
- [ ] Response includes successCount field (jobs completed successfully)
- [ ] Response includes failureCount field (jobs that failed)
- [ ] Response includes durationMs field (processing time in milliseconds)
- [ ] Response includes processedJobIds array (identifiers of all processed jobs)
- [ ] Handler returns 200 status even when queue is empty or all jobs fail
- [ ] Database errors return 500 status with generic error message
- [ ] Processing failure for one job does not halt processing of remaining jobs in batch
- [ ] Handler logs batch size, processing counts, and duration for operational monitoring
- [ ] Implementation respects concurrency limits for translation API calls
- [ ] Endpoint includes rate limiting to prevent abuse (maximum 10 requests per minute per authenticated user)


---

## REQ-357: Configure Automated Translation Job Processing Trigger

**Date**: 2026-01-19 20:15
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should automatically invoke translation job processing at regular intervals through a scheduled job mechanism, ensuring content translations are processed continuously without manual intervention.

### Current Behavior
The translation job processing endpoint exists but requires manual invocation by administrators or system operators. Content creators add items, articles, links, and tags that generate translation jobs, but those jobs remain in the queue indefinitely until someone manually triggers the processing endpoint. Users experience delayed availability of translated content, and the system accumulates job backlogs during periods without manual intervention.

### Expected Behavior
A scheduled job automatically invokes the translation job processing endpoint at configurable intervals, typically every 30 seconds for low-latency environments or every 5 minutes for cost-optimized deployments. The scheduler authenticates using service role credentials and triggers batch processing without human intervention. Operators can adjust the schedule frequency based on translation workload patterns, API rate limit constraints, and operational cost considerations.

### User Impact
Content creators see their newly published or updated content become available in multiple languages automatically within minutes or seconds, depending on the configured schedule. Users browsing translated content experience minimal delay between content publication and translation availability. System reliability improves by eliminating dependency on manual triggering.

### Business Value
Reduces operational overhead by automating a repetitive manual process. Improves content time-to-market for multilingual audiences by ensuring consistent translation processing. Enables predictable translation throughput that scales with content creation volume without proportional increase in human intervention.

### Acceptance Criteria
- [ ] Scheduled job configuration is documented in project documentation
- [ ] Configuration specifies job invocation interval (recommended: 30 seconds for low latency, 5 minutes for cost savings)
- [ ] Scheduled job authenticates using service role credentials stored in environment variables
- [ ] Scheduled job invokes the translation job processing API endpoint via HTTP POST request
- [ ] Job includes appropriate authentication headers or API keys for service role access
- [ ] Job passes configured batch size parameter to processing endpoint (recommended: 10-20 jobs per invocation)
- [ ] Scheduled job handles HTTP response codes appropriately (logs success, retries on transient failures, alerts on persistent failures)
- [ ] Configuration supports adjustment of invocation interval without code deployment
- [ ] Alternative scheduling mechanism is documented if primary scheduler becomes unavailable
- [ ] Documentation includes instructions for enabling, disabling, and monitoring the scheduled job
- [ ] Documentation includes cost-benefit analysis comparing different scheduling intervals
- [ ] Scheduled job respects maximum processing capacity to prevent queue overload
- [ ] Job execution logs include timestamp, batch size, and processing outcome for operational monitoring
- [ ] Alert mechanism notifies operators when scheduled job fails consecutively more than 3 times
- [ ] Configuration allows temporary pause of automated processing during maintenance windows

---


## REQ-358: Create Translation Job Monitoring Endpoint

**Date**: 2026-01-19 
**Type**: NEW FEATURE
**Size**: M

### Summary
The system should provide a monitoring endpoint that surfaces real-time translation job queue statistics and allows filtering to support operational visibility and troubleshooting.

### Current Behavior
There is no mechanism to query the current state of the translation job queue or retrieve statistics about processing activity, making it difficult to monitor system health or diagnose processing delays.

### Expected Behavior
Administrators can query an API endpoint that returns current job queue statistics including counts of jobs in different states, with optional filtering by entity type and processing status.

### User Impact
Administrators and support staff gain visibility into translation job processing health, enabling proactive monitoring and faster troubleshooting of translation delays or failures.

### Business Value
Operational transparency reduces time-to-resolution for translation issues and enables data-driven capacity planning for translation infrastructure.

### Acceptance Criteria
- [ ] GET endpoint is created at the specified admin translation jobs route
- [ ] Endpoint returns count of jobs currently in queued state
- [ ] Endpoint returns count of jobs currently in processing state
- [ ] Endpoint returns count of jobs completed within the last hour
- [ ] Endpoint returns count of jobs failed within the last hour
- [ ] Response includes timestamp indicating when statistics were calculated
- [ ] Endpoint supports optional entityType query parameter to filter statistics by content type
- [ ] Endpoint supports optional status query parameter to filter statistics by job state
- [ ] Endpoint requires admin authentication and returns 401 for unauthenticated requests
- [ ] Endpoint returns 403 for authenticated non-admin users
- [ ] Response format is consistent JSON structure with clearly labeled fields
- [ ] Endpoint handles database query failures gracefully with appropriate error responses
- [ ] Query performance is optimized using appropriate database indexes
- [ ] Response time remains under 500ms under normal load conditions

---

---

## REQ-359: Create Translation Job Indexes

**Date**: 2026-01-19 20:30
**Type**: ENHANCEMENT
**Size**: S

### Summary
The system should optimize translation job queue query performance by implementing database indexes on columns used for job retrieval, filtering, and status monitoring.

### Current Behavior
Translation job queries scan entire table rows when filtering by status, entity type, or priority. As the job queue grows beyond a few hundred entries, query performance degrades noticeably. Job processing endpoints experience latency spikes during peak content creation periods when the queue contains thousands of pending jobs. Monitoring dashboards timeout when attempting to aggregate statistics across large job histories.

### Expected Behavior
Database indexes on frequently queried columns enable efficient job retrieval regardless of queue size. Job processors retrieve batches of queued jobs in single-digit milliseconds. Status monitoring queries return aggregated statistics within 100 milliseconds even when the table contains tens of thousands of historical job records. Query execution plans use index scans instead of sequential scans for filtered queries.

### User Impact
Content creators experience consistent translation processing times regardless of overall platform activity. Administrators access real-time monitoring dashboards without performance degradation during peak hours. Automated job processors maintain predictable execution schedules without delays caused by slow database queries.

### Business Value
Prevents translation system performance degradation as content volume grows. Reduces database resource consumption by eliminating inefficient sequential scans. Ensures translation infrastructure scales linearly with content volume rather than experiencing exponential slowdown.

### Acceptance Criteria
- [ ] Index is created on status column in translation_job_queue table
- [ ] Index is created on entity_type column in translation_job_queue table
- [ ] Index is created on priority column in translation_job_queue table
- [ ] Index is created on created_at column in translation_job_queue table
- [ ] Composite index is created on (status, priority, created_at) for job processor queries
- [ ] Composite index is created on (entity_type, status) for filtered monitoring queries
- [ ] Index is created on source_language column for language-specific queries
- [ ] Index is created on target_language column for language-specific queries
- [ ] Migration file follows naming convention with timestamp and descriptive name
- [ ] Migration includes comments documenting which queries benefit from each index
- [ ] Migration is tested against production-scale dataset (10,000+ job records) to verify performance improvement
- [ ] Query execution plans are verified to use indexes for job processor batch retrieval
- [ ] Query execution plans are verified to use indexes for status filtering
- [ ] Query execution plans are verified to use indexes for monitoring aggregations
- [ ] Migration includes rollback script that safely removes indexes
- [ ] Index creation uses CONCURRENTLY option to avoid table locks in production
- [ ] Documentation notes expected query performance improvement metrics
- [ ] Database storage impact is documented (estimated index size relative to table size)


---

## REQ-360: Create Translation Lookup Indexes

**Date**: 2026-01-19 00:00
**Type**: ENHANCEMENT
**Size**: S

### Summary
Database indexes must be created on translation tables to enable fast lookup of translated content by entity ID and language combination.

### Current Behavior
Translation tables exist without optimized indexes for the most common query pattern (lookup by entity ID and target language), resulting in sequential scans when displaying translated content to users.

### Expected Behavior
When the system needs to display translated content for an item, article, link, or tag in a specific language, the database uses composite indexes to instantly locate the appropriate translation record without scanning the entire table.

### User Impact
End users viewing content in their preferred language experience faster page loads. Guest users browsing items, articles, and links see immediate display of translated content without delays.

### Business Value
Improves user experience across all localized pages. Essential for scaling to support multiple languages and high-traffic scenarios where thousands of translation lookups occur per minute.

### Acceptance Criteria
- [ ] Composite index created on item_translations for (item_id, language) lookups
- [ ] Composite index created on article_translations for (article_id, language) lookups
- [ ] Composite index created on link_translations for (link_id, language) lookups
- [ ] Composite index created on tag_translations for (tag_key, language) lookups
- [ ] Query plans confirm index usage for typical translation lookup queries
- [ ] No duplicate or redundant indexes exist that would slow down write operations


---

## REQ-361: Add Updated Timestamp Trigger for Translation Tables

**Date**: 2026-01-19 20:45
**Type**: ENHANCEMENT
**Size**: XS

### Summary
The system should automatically update the updated_at timestamp column whenever any translation record is modified, ensuring accurate tracking of when translations were last changed.

### Current Behavior
Translation tables contain updated_at columns, but these timestamps are not automatically maintained when records are modified. When administrators manually edit translations or when the system re-translates content, the updated_at field retains its original value unless explicitly updated by application code. This creates inconsistent timestamp data and makes it difficult to identify which translations are most recently changed.

### Expected Behavior
Whenever any column in a translation record is modified, the database automatically sets the updated_at column to the current timestamp. This happens transparently at the database level, independent of application logic. Administrators viewing translation history see accurate last-modified timestamps. Translation monitoring tools can reliably identify recently updated translations for quality assurance purposes.

### User Impact
Administrators and content managers can accurately track when translations were last modified, enabling better quality control workflows. Translation audit logs reflect true modification times without relying on application code to maintain timestamp consistency.

### Business Value
Provides reliable audit trail for translation modifications. Enables time-based analysis of translation activity patterns. Reduces application complexity by moving timestamp maintenance to the database layer where it cannot be accidentally omitted.

### Acceptance Criteria
- [ ] Database trigger function is created that sets updated_at to current timestamp
- [ ] Trigger is attached to item_translations table for UPDATE operations
- [ ] Trigger is attached to article_translations table for UPDATE operations
- [ ] Trigger is attached to link_translations table for UPDATE operations
- [ ] Trigger is attached to tag_translations table for UPDATE operations
- [ ] Trigger only fires on UPDATE operations, not INSERT operations
- [ ] Trigger does not fire if updated_at is explicitly set in the UPDATE statement to a different value
- [ ] Migration includes appropriate comments documenting trigger purpose
- [ ] Migration is tested to verify updated_at changes when translation text is modified
- [ ] Migration is tested to verify updated_at changes when translation status is modified
- [ ] Migration includes rollback script that removes triggers and function
- [ ] Trigger function follows PostgreSQL best practices for performance
- [ ] Existing translation records are not affected by trigger installation



---

## REQ-362: Write Unit Tests for Content Translation Module

**Date**: 2026-01-19 21:15
**Type**: ENHANCEMENT
**Size**: M

### Summary
The content translation orchestration module must have comprehensive unit test coverage to verify that translation jobs are correctly queued, entity-specific triggers function properly, and source language detection operates accurately.

### Current Behavior
The content translation orchestration module exists in the codebase without automated unit tests. When developers modify translation logic, there is no systematic way to verify that changes do not break existing functionality. Manual testing cannot efficiently cover all edge cases such as null values, missing fields, unsupported languages, and error conditions. Regression bugs can be introduced without immediate detection.

### Expected Behavior
Developers can run a comprehensive unit test suite that validates all core functions of the content translation module. Tests verify that the queueContentTranslations function correctly creates translation jobs for each supported language. Entity-specific trigger tests confirm that item, article, link, and tag translations are queued with appropriate metadata and priority levels. Source language detection tests validate accurate identification of content language from user preferences, entity data, and default fallback mechanisms. All tests execute in under 5 seconds and provide clear failure messages when behavior deviates from expectations.

### User Impact
Users benefit indirectly through increased system reliability and fewer translation-related bugs reaching production. When translation features fail, developers can quickly identify the root cause through failing tests rather than debugging live user reports.

### Business Value
Reduces time spent on manual QA testing of translation features. Enables confident refactoring and optimization of translation logic without fear of breaking existing functionality. Prevents regression bugs that could cause missing translations for end users. Establishes foundation for continuous integration testing of localization features.

### Acceptance Criteria
- [ ] Unit tests exist for queueContentTranslations function covering items entity type
- [ ] Unit tests exist for queueContentTranslations function covering articles entity type
- [ ] Unit tests exist for queueContentTranslations function covering links entity type
- [ ] Unit tests exist for queueContentTranslations function covering tags entity type
- [ ] Tests verify correct translation job count is created based on number of target languages
- [ ] Tests verify translation jobs include correct entity_id and entity_type values
- [ ] Tests verify translation jobs include correct source_language value
- [ ] Tests verify translation jobs include correct target_language for each supported language
- [ ] Tests verify translation jobs include correct priority levels based on entity type
- [ ] Tests verify entity-specific triggers correctly extract translatable fields from item entities
- [ ] Tests verify entity-specific triggers correctly extract translatable fields from article entities
- [ ] Tests verify entity-specific triggers correctly extract translatable fields from link entities
- [ ] Tests verify entity-specific triggers correctly extract translatable fields from tag entities
- [ ] Tests verify entity-specific triggers handle null or undefined field values without errors
- [ ] Tests verify entity-specific triggers handle entities with minimal required fields only
- [ ] Tests verify source language detection uses user preference when available
- [ ] Tests verify source language detection falls back to system default when user preference is unavailable
- [ ] Tests verify source language detection handles invalid or unsupported language codes gracefully
- [ ] Tests verify source language detection returns consistent results for same input conditions
- [ ] Tests use mocking for database calls to ensure unit tests remain fast and isolated
- [ ] Tests use descriptive test names that clearly indicate what behavior is being validated
- [ ] All tests pass successfully in local development environment
- [ ] Test coverage for content translation module exceeds 80 percent for critical functions
- [ ] Tests include edge cases such as empty strings, special characters, and maximum field lengths



---

## REQ-363: Write Unit Tests for Job Processing Infrastructure

**Date**: 2026-01-19 12:12
**Type**: ENHANCEMENT
**Size**: L

### Summary
The translation job processing infrastructure must have comprehensive unit test coverage to verify that jobs are correctly picked up from the queue, locked to prevent duplicate processing, routed to appropriate entity-specific processors, retry logic handles failures appropriately, and concurrency controls prevent resource exhaustion.

### Current Behavior
The job processing infrastructure exists without automated unit tests. When developers modify job processing logic, there is no systematic way to verify that concurrent job execution behaves correctly. Edge cases such as job locking race conditions, processor failures, retry exhaustion, and concurrency limits cannot be efficiently validated through manual testing. Changes to the job queue implementation risk introducing subtle bugs that only manifest under production load conditions.

### Expected Behavior
Developers can run a comprehensive unit test suite that validates all aspects of the job processing infrastructure. Tests verify that job pickup selects pending jobs in correct priority order and marks them as in-progress with appropriate locking to prevent duplicate processing by concurrent workers. Entity-specific processor tests confirm that items, articles, links, and tags are routed to their respective translation processors with correct field extraction logic. Retry logic tests validate that failed jobs are retried with exponential backoff delays, maximum retry limits are enforced, and permanently failed jobs are marked appropriately. Concurrency control tests verify that the system respects configured maximum parallel job limits and does not spawn excessive workers. All tests execute in isolation using mocks for external dependencies such as translation APIs and database calls.

### User Impact
Users benefit indirectly through more reliable translation processing with fewer stuck jobs, duplicate translations, or processing failures. When translations fail to appear, developers can quickly identify whether the issue lies in job pickup, processor logic, or retry mechanisms rather than spending hours debugging production systems.

### Business Value
Prevents costly production incidents caused by job processing bugs such as duplicate API calls, stuck job queues, or resource exhaustion. Enables confident optimization of job processing throughput without fear of introducing race conditions. Reduces mean time to resolution when translation processing issues occur by providing reproducible test cases that isolate failure modes.

### Acceptance Criteria
- [ ] Unit tests exist for job pickup function that verify pending jobs are selected correctly
- [ ] Tests verify job pickup respects priority ordering when multiple jobs are pending
- [ ] Tests verify job pickup marks selected jobs as in-progress with locked status
- [ ] Tests verify job pickup prevents duplicate pickup of same job by concurrent workers
- [ ] Tests verify job pickup handles database transaction failures gracefully
- [ ] Tests verify job pickup skips jobs that are already locked by another worker
- [ ] Tests verify job pickup includes timestamp when job was locked for stale job detection
- [ ] Unit tests exist for item processor that verify correct field extraction
- [ ] Tests verify item processor correctly translates title field
- [ ] Tests verify item processor correctly translates description field
- [ ] Tests verify item processor correctly translates public notes field
- [ ] Tests verify item processor stores translated content in correct database table
- [ ] Tests verify item processor marks job as completed after successful translation
- [ ] Unit tests exist for article processor that verify correct field extraction
- [ ] Tests verify article processor correctly translates title field
- [ ] Tests verify article processor correctly translates content field
- [ ] Tests verify article processor stores translated content in correct database table
- [ ] Tests verify article processor marks job as completed after successful translation
- [ ] Unit tests exist for link processor that verify correct field extraction
- [ ] Tests verify link processor correctly translates display text or title field
- [ ] Tests verify link processor stores translated content in correct database table
- [ ] Tests verify link processor marks job as completed after successful translation
- [ ] Unit tests exist for tag processor that verify correct field extraction
- [ ] Tests verify tag processor correctly translates display name field
- [ ] Tests verify tag processor stores translated content in correct database table
- [ ] Tests verify tag processor marks job as completed after successful translation
- [ ] Tests verify all processors handle null or undefined field values without crashing
- [ ] Tests verify all processors handle empty string values appropriately
- [ ] Tests verify all processors include source and target language metadata in translations
- [ ] Unit tests exist for retry logic that verify failed jobs are retried
- [ ] Tests verify retry logic increments retry count after each failure
- [ ] Tests verify retry logic applies exponential backoff delay between retries
- [ ] Tests verify retry logic respects maximum retry limit configuration
- [ ] Tests verify retry logic marks jobs as permanently failed after retry exhaustion
- [ ] Tests verify retry logic records error messages from failed translation attempts
- [ ] Tests verify retry logic distinguishes between retryable and non-retryable errors
- [ ] Tests verify retry logic does not retry jobs with invalid configuration such as unsupported language
- [ ] Unit tests exist for concurrency control that verify maximum parallel job limits
- [ ] Tests verify concurrency control prevents spawning more workers than configured limit
- [ ] Tests verify concurrency control allows new workers to start when existing workers complete
- [ ] Tests verify concurrency control accurately tracks number of active workers
- [ ] Tests verify concurrency control handles worker crashes without leaking worker count
- [ ] Tests use mocking for translation API calls to ensure fast isolated execution
- [ ] Tests use mocking for database calls to avoid dependency on test database state
- [ ] Tests use descriptive test names that clearly indicate what behavior is being validated
- [ ] All tests pass successfully in local development environment
- [ ] Test coverage for job processing module exceeds 85 percent for critical functions
- [ ] Tests execute in under 10 seconds total runtime
- [ ] Tests include documentation explaining key test scenarios and edge cases covered


---

## REQ-364: Write Integration Tests for API Endpoints

**Date**: 2026-01-19 14:30
**Type**: ENHANCEMENT
**Size**: L

### Summary
The translation system must have comprehensive integration tests that verify API endpoints correctly trigger translation workflows, report translation status accurately, handle retry operations appropriately, and allow manual translation overrides when needed.

### Current Behavior
API endpoints for content creation and translation management exist without automated integration tests. When items or articles are created through the API, there is no systematic verification that translation jobs are queued correctly. When translation status endpoints are called, there is no validation that the returned status accurately reflects database state. When retry or manual override endpoints are invoked, there is no automated way to confirm these operations have the intended effect on translation jobs and stored translations. Manual testing of these workflows is time-consuming and does not catch edge cases consistently.

### Expected Behavior
Developers can run a comprehensive integration test suite that validates end-to-end translation workflows through actual API calls. Tests verify that creating an item through the API automatically queues translation jobs for all supported languages with correct priority and metadata. Tests verify that creating an article through the API triggers translation jobs that include all translatable fields. Tests verify that the translation status endpoint returns accurate information about job progress including pending, in-progress, completed, and failed states. Tests verify that the retry endpoint re-queues failed translation jobs and resets retry counts appropriately. Tests verify that the manual override endpoint allows administrators to replace machine-generated translations with human-reviewed content and prevents those translations from being overwritten by automated jobs. All tests run against a test database instance and clean up state between test runs.

### User Impact
Users benefit from a translation system that reliably processes content through all supported workflows. When items or articles are created, users can trust that translations will be queued automatically without manual intervention. When translations fail, users can retry them through the API with confidence that the operation will succeed. When administrators provide manual corrections to translations, they can be certain those corrections will not be lost.

### Business Value
Prevents production incidents where content is published without triggering translations, leaving non-English users without access to critical information. Reduces customer support burden by ensuring translation workflows operate reliably across all content types. Enables rapid detection of regressions when API implementations change by providing automated validation of key integration points.

### Acceptance Criteria
- [ ] Integration tests exist for item creation endpoint
- [ ] Tests verify that creating an item through POST endpoint returns success status
- [ ] Tests verify that creating an item automatically creates translation jobs in database
- [ ] Tests verify translation jobs are created for all supported target languages
- [ ] Tests verify translation jobs include correct entity_id referencing the created item
- [ ] Tests verify translation jobs include correct entity_type value of items
- [ ] Tests verify translation jobs include source_language matching user preference or system default
- [ ] Tests verify translation jobs include correct priority level for item entity type
- [ ] Tests verify translation jobs include translatable fields such as title and description
- [ ] Tests verify item creation with minimal required fields triggers translations correctly
- [ ] Tests verify item creation with all optional fields populated triggers translations with full field set
- [ ] Integration tests exist for article creation endpoint
- [ ] Tests verify that creating an article through POST endpoint returns success status
- [ ] Tests verify that creating an article automatically creates translation jobs in database
- [ ] Tests verify translation jobs are created for all supported target languages
- [ ] Tests verify translation jobs include correct entity_id referencing the created article
- [ ] Tests verify translation jobs include correct entity_type value of articles
- [ ] Tests verify translation jobs include source_language matching user preference or system default
- [ ] Tests verify translation jobs include correct priority level for article entity type
- [ ] Tests verify translation jobs include translatable fields such as title and content
- [ ] Tests verify article creation with minimal required fields triggers translations correctly
- [ ] Tests verify article creation with all optional fields populated triggers translations with full field set
- [ ] Integration tests exist for translation status endpoint
- [ ] Tests verify status endpoint returns correct structure with translation job information
- [ ] Tests verify status endpoint shows pending jobs that have not been processed yet
- [ ] Tests verify status endpoint shows in-progress jobs that are currently being translated
- [ ] Tests verify status endpoint shows completed jobs with successful translation storage
- [ ] Tests verify status endpoint shows failed jobs with error message details
- [ ] Tests verify status endpoint includes timestamps for created_at and updated_at fields
- [ ] Tests verify status endpoint includes retry count for jobs that have been retried
- [ ] Tests verify status endpoint filters by entity_id when provided as query parameter
- [ ] Tests verify status endpoint filters by entity_type when provided as query parameter
- [ ] Tests verify status endpoint filters by target_language when provided as query parameter
- [ ] Tests verify status endpoint returns empty array when no matching jobs exist
- [ ] Tests verify status endpoint handles invalid query parameters gracefully with appropriate error response
- [ ] Integration tests exist for retry endpoint
- [ ] Tests verify retry endpoint accepts POST request with job_id parameter
- [ ] Tests verify retry endpoint re-queues failed translation job with pending status
- [ ] Tests verify retry endpoint resets retry count to zero for re-queued job
- [ ] Tests verify retry endpoint clears previous error message from failed job
- [ ] Tests verify retry endpoint returns success response with updated job status
- [ ] Tests verify retry endpoint returns error when attempting to retry non-failed job
- [ ] Tests verify retry endpoint returns error when job_id does not exist
- [ ] Tests verify retry endpoint respects maximum retry limit and rejects jobs that have exhausted retries
- [ ] Tests verify retry endpoint allows bulk retry operation for multiple failed jobs
- [ ] Integration tests exist for manual override endpoint
- [ ] Tests verify manual override endpoint accepts POST request with entity_id, target_language, and translation content
- [ ] Tests verify manual override endpoint stores provided translation in correct database table
- [ ] Tests verify manual override endpoint marks translation with manual flag to prevent overwriting
- [ ] Tests verify manual override endpoint returns success response with stored translation details
- [ ] Tests verify manual override endpoint updates existing translation when one already exists
- [ ] Tests verify manual override endpoint creates new translation when none exists for target language
- [ ] Tests verify manual override endpoint validates target_language is supported before accepting override
- [ ] Tests verify manual override endpoint validates entity_id exists before accepting override
- [ ] Tests verify manual override endpoint validates translation content is not empty before accepting override
- [ ] Tests verify manual override endpoint prevents automated translation jobs from overwriting manual translations
- [ ] Tests verify manual override endpoint allows subsequent manual overrides to update previously manual translations
- [ ] All integration tests run against isolated test database instance
- [ ] Tests include setup hooks that create necessary test data before each test
- [ ] Tests include teardown hooks that clean up created data after each test
- [ ] Tests do not depend on execution order and can run independently
- [ ] Tests use realistic test data that represents actual production content
- [ ] Tests verify response status codes match expected values for success and error cases
- [ ] Tests verify response body structure matches API documentation specifications
- [ ] All tests pass successfully in local development environment
- [ ] Test suite executes in under 60 seconds total runtime
- [ ] Tests include documentation explaining key integration scenarios and edge cases covered


---

## REQ-365: Write End-to-End Tests for Translation Workflows

**Date**: 2026-01-19 15:45
**Type**: ENHANCEMENT
**Size**: L

### Summary
The translation system must have comprehensive end-to-end tests that validate complete translation workflows from content creation through translation processing to final translation storage and status verification.

### Current Behavior
Translation workflows involve multiple components including API endpoints, job queue management, background processing, external translation services, and database storage. Currently these workflows are tested in isolation through unit and integration tests, but there are no automated tests that validate the complete flow from start to finish. When a user creates an item, there is no automated way to verify that translations are queued correctly, processed successfully, stored in the database, and reported accurately through status endpoints. When translation processing fails, there is no automated way to verify that retry operations restore normal workflow operation. Manual testing of these complete workflows is time-consuming and does not consistently catch timing issues, race conditions, or edge cases that only appear when all components interact.

### Expected Behavior
Developers can run end-to-end tests that simulate real user workflows and verify correct system behavior across all translation components. Tests create content through the API and verify that translation jobs are automatically queued with correct metadata. Tests wait for background job processing and verify that queued jobs transition through pending, in-progress, and completed states. Tests verify that translated content is stored correctly in translation tables with appropriate language codes and entity associations. Tests query translation status endpoints and verify that reported status matches actual database state. Tests simulate translation failures and verify that retry operations successfully re-queue failed jobs and result in successful translation on subsequent processing. All tests execute against test instances of external services to avoid consuming production API quotas and to enable predictable test behavior.

### User Impact
Users benefit from a translation system where workflows operate reliably from end to end without manual intervention. When users create content, translations appear automatically without requiring follow-up actions. When translations occasionally fail due to temporary service issues, the system recovers gracefully through retry mechanisms. Users see accurate translation status information that reflects actual processing state.

### Business Value
Prevents production incidents where translation workflows fail silently leaving content untranslated. Enables confident deployment of changes to translation infrastructure by providing automated validation of critical user-facing workflows. Reduces time spent investigating translation issues by quickly identifying which component in the workflow is responsible for unexpected behavior.

### Acceptance Criteria
- [ ] E2E test creates item through API endpoint
- [ ] Test verifies API response indicates successful item creation
- [ ] Test verifies translation jobs are created in database immediately after item creation
- [ ] Test verifies translation jobs exist for all supported target languages
- [ ] Test verifies translation jobs include correct entity_id, entity_type, and translatable field data
- [ ] Test verifies translation jobs have pending status immediately after creation
- [ ] Test waits for background job processor to pick up pending jobs
- [ ] Test verifies translation jobs transition from pending to in-progress status
- [ ] Test verifies translation jobs remain in-progress while external translation API is being called
- [ ] Test verifies translation jobs transition to completed status after successful processing
- [ ] Test verifies completed jobs include translated content in result field
- [ ] Test verifies translated content is stored in item_translations table
- [ ] Test verifies stored translations include correct item_id and language_code associations
- [ ] Test verifies stored translations include translated values for all translatable fields
- [ ] Test queries translation status endpoint after processing completes
- [ ] Test verifies status endpoint returns completed status for all translation jobs
- [ ] Test verifies status endpoint includes timestamps showing when translation completed
- [ ] Test verifies status endpoint includes translated content preview
- [ ] E2E test simulates translation service failure by configuring mock service to return errors
- [ ] Test verifies failed translation jobs have failed status in database
- [ ] Test verifies failed jobs include error message describing failure reason
- [ ] Test verifies failed jobs increment retry_count appropriately
- [ ] Test calls retry endpoint to re-queue failed translation job
- [ ] Test verifies retry endpoint returns success response
- [ ] Test verifies failed job status changes back to pending after retry request
- [ ] Test verifies retry_count is maintained or incremented according to retry policy
- [ ] Test waits for background processor to pick up retried job
- [ ] Test verifies retried job processes successfully on second attempt
- [ ] Test verifies previously failed job now has completed status
- [ ] Test verifies translated content is stored correctly after successful retry
- [ ] E2E test creates article through API endpoint
- [ ] Test verifies article translation workflow follows same pattern as item workflow
- [ ] Test verifies article translations are stored in article_translations table
- [ ] E2E test creates link through API endpoint
- [ ] Test verifies link translation workflow follows same pattern as item workflow
- [ ] Test verifies link translations are stored in link_translations table
- [ ] E2E test creates item with tags
- [ ] Test verifies tag translation jobs are created automatically
- [ ] Test verifies tag translations are stored in tag_translations table
- [ ] Test verifies tag translations are reused across multiple items
- [ ] E2E test verifies translation status during each workflow stage
- [ ] Test queries status endpoint immediately after content creation and verifies pending status
- [ ] Test queries status endpoint during processing and verifies in-progress status
- [ ] Test queries status endpoint after completion and verifies completed status
- [ ] Test queries status endpoint after failure and verifies failed status with error details
- [ ] E2E test verifies batch translation status endpoint
- [ ] Test creates multiple items in quick succession
- [ ] Test queries batch status endpoint with entity_ids parameter
- [ ] Test verifies batch status endpoint returns status for all requested entities
- [ ] Test verifies batch endpoint performs efficiently without N plus 1 query issues
- [ ] All E2E tests run against isolated test environment
- [ ] Tests use mock translation service that provides deterministic responses
- [ ] Tests use test database instance that is reset between test runs
- [ ] Tests include setup that seeds necessary test data such as supported languages
- [ ] Tests include teardown that cleans up all created content and translation jobs
- [ ] Tests handle timing issues gracefully using appropriate wait strategies
- [ ] Tests verify workflow completion using polling with timeout rather than fixed delays
- [ ] Tests fail with clear error messages when expected conditions are not met within timeout
- [ ] Tests do not depend on execution order and can run independently
- [ ] All E2E tests pass successfully in local development environment
- [ ] Test suite executes in under 5 minutes total runtime
- [ ] Tests include documentation explaining complete workflow scenarios being validated
- [ ] Tests include comments describing wait conditions and expected state transitions



---

## REQ-366: Conduct Performance Testing for Translation System

**Date**: 2026-01-19 17:30
**Type**: ENHANCEMENT
**Size**: M

### Summary
The translation system must be validated under realistic production load to ensure it can process large volumes of concurrent translation jobs efficiently within acceptable time constraints while properly enforcing rate limits.

### Current Behavior
The translation system has been implemented with job queue management, background processing, rate limiting, and external API integration, but has not been tested under high load conditions. When content is created under light load with a few items at a time, translations process successfully, but system behavior with 100 or more concurrent translation jobs remains unknown. Job completion times have not been measured systematically. Rate limiting configuration exists but has not been validated to prevent exceeding external translation service quotas. The system may have performance bottlenecks related to database query patterns, job processing concurrency, or external API call patterns that only become apparent under realistic load.

### Expected Behavior
The translation system processes high volumes of concurrent translation jobs efficiently without degradation or failures. When 100 or more translation jobs are queued simultaneously, the background job processor works through the queue steadily until all jobs complete. Individual translation job completion time from creation to final storage remains under 60 seconds on average even under concurrent load. Rate limiting mechanisms actively prevent the system from exceeding configured request limits for external translation APIs. Database queries associated with job processing remain efficient and do not cause connection pool exhaustion or query timeouts. The system recovers gracefully from temporary slowdowns or errors without requiring manual intervention.

### User Impact
Users experience consistent translation performance even during peak usage periods when multiple team members are creating content simultaneously. Users see their content translated within one minute regardless of system load. Users do not experience translation failures caused by rate limit violations on external services.

### Business Value
Validates that the translation system can scale to support planned user growth without requiring immediate infrastructure changes. Identifies performance bottlenecks before they impact production users. Ensures external translation API costs remain predictable and within budget by confirming rate limiting works correctly. Provides confidence that the system will handle real-world usage patterns reliably.

### Acceptance Criteria
- [ ] Performance test suite creates 100 translation jobs simultaneously
- [ ] Test verifies all 100 jobs are created successfully in database
- [ ] Test verifies all jobs have pending status immediately after creation
- [ ] Test starts background job processor with configured concurrency settings
- [ ] Test measures elapsed time from first job creation to last job completion
- [ ] Test verifies average job completion time is under 60 seconds
- [ ] Test verifies 95th percentile completion time is under 90 seconds
- [ ] Test verifies no jobs remain in pending or in-progress state after processing completes
- [ ] Test verifies all 100 jobs transition to completed status successfully
- [ ] Test verifies no jobs transition to failed status due to system errors
- [ ] Test verifies rate limiting prevents exceeding external API request limits
- [ ] Test monitors external API calls during test execution
- [ ] Test verifies number of API calls per minute stays within configured rate limit
- [ ] Test verifies rate limiter introduces appropriate delays between requests
- [ ] Test verifies delayed requests eventually complete successfully
- [ ] Test measures database connection pool usage during peak load
- [ ] Test verifies connection pool does not reach maximum capacity
- [ ] Test verifies no database connection timeout errors occur
- [ ] Test measures database query response times during processing
- [ ] Test verifies query response times remain under 500ms at 95th percentile
- [ ] Test identifies any N plus 1 query patterns in job processing logic
- [ ] Test verifies job queue queries use appropriate indexes
- [ ] Test verifies translation lookup queries use appropriate indexes
- [ ] Test measures memory usage of job processor during peak load
- [ ] Test verifies memory usage remains stable without memory leaks
- [ ] Test measures CPU usage during concurrent job processing
- [ ] Test verifies CPU usage scales appropriately with configured concurrency
- [ ] Performance test creates jobs for different entity types including items, articles, links, and tags
- [ ] Test verifies performance remains consistent across different entity types
- [ ] Test verifies job prioritization still functions correctly under high load
- [ ] Test verifies high-priority jobs complete before lower-priority jobs
- [ ] Performance test simulates sustained load over 10-minute period
- [ ] Test creates new translation jobs continuously throughout test duration
- [ ] Test verifies system processes jobs steadily without degradation over time
- [ ] Test verifies queue depth remains manageable and does not grow unbounded
- [ ] Performance test includes scenarios with mixed success and failure rates
- [ ] Test simulates 10% of translation API calls returning temporary errors
- [ ] Test verifies retry logic handles failures without degrading overall throughput
- [ ] Test verifies failed jobs are retried according to configured retry policy
- [ ] Test verifies retry operations do not cause cascade failures
- [ ] Performance test results are documented in markdown format
- [ ] Documentation includes graphs showing job completion times over test duration
- [ ] Documentation includes percentile breakdown of completion times
- [ ] Documentation includes rate limiting behavior observations
- [ ] Documentation includes database performance metrics
- [ ] Documentation includes memory and CPU usage profiles
- [ ] Documentation identifies any performance bottlenecks discovered
- [ ] Documentation includes recommendations for configuration tuning if needed
- [ ] All performance tests can be executed in isolated test environment
- [ ] Tests use mock translation service that simulates realistic response times
- [ ] Tests use test database instance that matches production database schema
- [ ] Tests clean up all created jobs and translations after execution
- [ ] Performance test suite is documented with setup instructions
- [ ] Performance test suite includes configuration parameters for adjusting load levels
- [ ] Performance test suite can be executed as part of pre-release validation process

