/**
 * Translation Storage Module Exports
 * Part of REQ-E03-005: Implement Translation Storage Utilities
 * Part of REQ-E03-006: Implement Translation Status Utilities
 *
 * @module content-translation/storage
 * @created 2026-01-21
 * @modified 2026-01-21
 */

// Export types from storage
export type {
  TranslationStorageResult,
  ItemTranslationData,
  ArticleTranslationData,
  LinkTranslationData,
} from './translation-storage';

// Export storage functions
export {
  storeItemTranslation,
  storeArticleTranslation,
  storeLinkTranslation,
  storeTagTranslation,
  deleteEntityTranslations,
} from './translation-storage';

// Export types from status utilities (REQ-E03-006)
export type {
  LanguageStatus,
  OverallStatus,
  LanguageTranslationStatus,
  TranslationStatusResult,
  StatusQueryResult,
} from './translation-status';

// Export status functions (REQ-E03-006)
export {
  getEntityTranslationStatus,
  getBatchTranslationStatus,
} from './translation-status';
