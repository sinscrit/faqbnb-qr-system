/**
 * Shared Constants for Job Queue Integration Tests
 *
 * Defines constants and configuration values used across test files.
 *
 * @module job-queue/__tests__/helpers/constants
 * @lastModified 2026-01-18
 */

import type { EntityType, SupportedLanguage, JobStatus } from '../../translation-jobs.types';

/**
 * All entity types supported by the translation system.
 */
export const TEST_ENTITY_TYPES: readonly EntityType[] = [
  'article',
  'item',
  'link',
  'tag',
] as const;

/**
 * All supported languages for testing.
 */
export const TEST_LANGUAGES: readonly SupportedLanguage[] = [
  'en',
  'fr',
  'es',
  'de',
  'nl',
  'it',
] as const;

/**
 * All possible job statuses.
 */
export const TEST_JOB_STATUSES: readonly JobStatus[] = [
  'queued',
  'processing',
  'completed',
  'failed',
] as const;

/**
 * Default configuration values for tests.
 */
export const TEST_DEFAULTS = {
  LOCK_TIMEOUT_MINUTES: 5,
  MAX_RETRIES: 3,
  POLLING_INTERVAL_MS: 100,
  TEST_TIMEOUT_MS: 5000,
  CONCURRENT_WORKERS: 5,
  BATCH_SIZE: 10,
} as const;

/**
 * Table names for database operations.
 */
export const TABLE_NAMES = {
  TRANSLATION_JOBS: 'translation_jobs',
  ARTICLE_TRANSLATIONS: 'article_translations',
  ITEM_TRANSLATIONS: 'item_translations',
  LINK_TRANSLATIONS: 'link_translations',
  TAG_TRANSLATIONS: 'tag_translations',
  ITEM_ARTICLES: 'item_articles',
  ITEMS: 'items',
  ITEM_LINKS: 'item_links',
} as const;

/**
 * Mock translation responses for different languages.
 */
export const MOCK_TRANSLATIONS: Record<SupportedLanguage, { title: string; description: string }> = {
  en: { title: 'Test Title', description: 'Test Description' },
  fr: { title: 'Titre de Test', description: 'Description de Test' },
  es: { title: 'Titulo de Prueba', description: 'Descripcion de Prueba' },
  de: { title: 'Testtitel', description: 'Testbeschreibung' },
  nl: { title: 'Testtitel', description: 'Testbeschrijving' },
  it: { title: 'Titolo di Test', description: 'Descrizione di Test' },
};

/**
 * Error messages for test assertions.
 */
export const ERROR_MESSAGES = {
  JOB_NOT_FOUND: 'Translation job not found',
  INVALID_STATUS_TRANSITION: 'Invalid job status transition',
  LOCK_ACQUISITION_FAILED: 'Failed to acquire job lock',
  MAX_RETRIES_EXCEEDED: 'Maximum retry attempts exceeded',
  TRANSLATION_FAILED: 'Translation service failed',
  DUPLICATE_JOB: 'Duplicate translation job exists',
} as const;
