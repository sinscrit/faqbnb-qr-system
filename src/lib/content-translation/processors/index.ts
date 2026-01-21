/**
 * Content Translation Processors
 * Barrel export for all entity-specific translation processors
 *
 * @module content-translation/processors
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

export { processItemTranslation } from './item-processor';
export type { ItemProcessingResult } from './item-processor';

export { processArticleTranslation } from './article-processor';
export type { ArticleProcessingResult } from './article-processor';

// Future processors will be exported here:
// export { processLinkTranslation } from './link-processor';
// export { processTagTranslation } from './tag-processor';
