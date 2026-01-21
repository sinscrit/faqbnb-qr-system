/**
 * Content Translation Module
 * Part of REQ-E03-001: Create Content Translation Module Structure
 *
 * This module provides content-specific translation functionality for
 * FAQBNB, building on the translation-service infrastructure from Epic 1.
 * It handles queueing translations when content is created or updated.
 *
 * @module content-translation
 * @created 2026-01-20
 *
 * @example
 * ```typescript
 * import {
 *   EntityType,
 *   ContentToTranslate,
 *   QueueTranslationOptions,
 *   TRANSLATION_CONTEXTS,
 * } from '@/lib/content-translation';
 * ```
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Core types
  EntityType,
  TranslationTrigger,
  // Content interfaces
  TranslatableField,
  ContentToTranslate,
  // Queue interfaces
  QueueTranslationOptions,
  QueueTranslationResult,
  // Status interfaces
  LanguageTranslationStatus,
  TranslationStatusResult,
  EntityTranslationStatus,
  // Utility types
  TranslationContextKey,
} from './content-translation.types';

// ============================================================================
// Constant Exports
// ============================================================================

export { TRANSLATION_CONTEXTS } from './content-translation.types';

// ============================================================================
// Future Function Exports (Tasks 1.2-1.6)
// ============================================================================

// Task 1.2: Main orchestrator
export { queueContentTranslations } from './content-translation';

// Task 1.3: Entity triggers
export {
  triggerItemTranslation,
  triggerArticleTranslation,
  triggerLinkTranslation,
  triggerTagTranslation,
} from './triggers';

// Task 1.5: Storage utilities
export {
  storeItemTranslation,
  storeArticleTranslation,
  storeLinkTranslation,
  storeTagTranslation,
  deleteEntityTranslations,
} from './storage';

// Task 1.5: Storage types
export type {
  TranslationStorageResult,
  ItemTranslationData,
  ArticleTranslationData,
  LinkTranslationData,
} from './storage';

// Task 1.6: Status utilities (REQ-E03-006)
export {
  getEntityTranslationStatus,
  getBatchTranslationStatus,
} from './storage/translation-status';

// Task 1.6: Status types (REQ-E03-006)
export type {
  LanguageStatus,
  OverallStatus,
  LanguageTranslationStatus as StatusLanguageTranslationStatus,
  TranslationStatusResult as StatusTranslationStatusResult,
  StatusQueryResult,
} from './storage/translation-status';

// ============================================================================
// Source Language Detection (REQ-E03-007)
// ============================================================================

export {
  detectSourceLanguage,
  detectSourceLanguageFromContext,
} from './source-language';

export type {
  UserForLanguageDetection,
  AccountForLanguageDetection,
  DetectSourceLanguageOptions,
} from './source-language';
