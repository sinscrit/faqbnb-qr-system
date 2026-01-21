/**
 * Test Data Factory for E2E Tests
 *
 * Provides factory functions for creating realistic test data.
 *
 * @module content-translation/__tests__/e2e/helpers/test-data-factory
 * @lastModified 2026-01-21
 */

import type { TestItem, TestArticle, TestLink, TestProperty } from './e2e-test-utils';
import type { TranslationJob, SupportedLanguage, EntityType } from '@/lib/job-queue/translation-jobs.types';

/**
 * Creates a test item with default values.
 */
export function createTestItem(overrides?: Partial<TestItem>): TestItem {
  const id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    publicId: `test-${id.slice(-6)}`,
    name: 'Test Coffee Machine',
    description: 'A high-quality espresso machine for making delicious coffee.',
    propertyId: `property-${Date.now()}`,
    sourceLanguage: 'en',
    tags: ['kitchen', 'appliance'],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Creates a test article with default values.
 */
export function createTestArticle(overrides?: Partial<TestArticle>): TestArticle {
  const id = `article-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    itemId: overrides?.itemId || `item-${Date.now()}`,
    title: 'How to Use the Coffee Machine',
    description: 'Step-by-step instructions for brewing the perfect cup of coffee.',
    sourceLanguage: 'en',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Creates a test link with default values.
 */
export function createTestLink(overrides?: Partial<TestLink>): TestLink {
  const id = `link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    itemId: overrides?.itemId || `item-${Date.now()}`,
    title: 'Coffee Machine User Manual',
    url: 'https://example.com/manual.pdf',
    sourceLanguage: 'en',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Creates a test tag entry.
 */
export function createTestTag(overrides?: Partial<{
  key: string;
  value: string;
  sourceLanguage: string;
}>) {
  return {
    key: overrides?.key || `tag-${Date.now()}`,
    value: overrides?.value || 'Kitchen Appliance',
    sourceLanguage: overrides?.sourceLanguage || 'en',
  };
}

/**
 * Creates a test property with default values.
 */
export function createTestProperty(overrides?: Partial<TestProperty>): TestProperty {
  const id = `property-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    name: 'Beach House Rental',
    accountId: `account-${Date.now()}`,
    ...overrides,
  };
}

/**
 * Creates a test translation job with default values.
 */
export function createTestTranslationJob(overrides?: Partial<TranslationJob>): TranslationJob {
  const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    entityType: 'item',
    entityId: `entity-${Date.now()}`,
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    status: 'queued',
    priority: 50,
    attempts: 0,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    lockedBy: null,
    lockedAt: null,
    ...overrides,
  };
}

/**
 * Creates a batch of translation jobs for an entity (all 5 target languages).
 */
export function createTestTranslationJobBatch(
  entityType: EntityType,
  entityId: string,
  sourceLanguage: SupportedLanguage = 'en'
): TranslationJob[] {
  const targetLanguages: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
  const targets = targetLanguages.filter(lang => lang !== sourceLanguage);

  return targets.map(targetLanguage =>
    createTestTranslationJob({
      entityType,
      entityId,
      sourceLanguage,
      targetLanguage,
    })
  );
}

/**
 * Creates realistic test data in different languages.
 */
export const MULTILINGUAL_TEST_DATA = {
  en: {
    itemName: 'Coffee Machine',
    itemDescription: 'Premium espresso maker for your morning coffee',
    articleTitle: 'How to Use the Coffee Machine',
    articleDescription: 'Step-by-step brewing instructions',
    linkTitle: 'User Manual PDF',
  },
  fr: {
    itemName: 'Machine à café',
    itemDescription: 'Machine à espresso premium pour votre café du matin',
    articleTitle: 'Comment utiliser la machine à café',
    articleDescription: 'Instructions de préparation étape par étape',
    linkTitle: 'Manuel utilisateur PDF',
  },
  es: {
    itemName: 'Cafetera',
    itemDescription: 'Cafetera espresso premium para tu café de la mañana',
    articleTitle: 'Cómo usar la cafetera',
    articleDescription: 'Instrucciones de preparación paso a paso',
    linkTitle: 'Manual del usuario PDF',
  },
  de: {
    itemName: 'Kaffeemaschine',
    itemDescription: 'Premium-Espressomaschine für Ihren Morgenkaffee',
    articleTitle: 'So verwenden Sie die Kaffeemaschine',
    articleDescription: 'Schritt-für-Schritt-Brühanleitung',
    linkTitle: 'Benutzerhandbuch PDF',
  },
  nl: {
    itemName: 'Koffiezetapparaat',
    itemDescription: 'Premium espressomachine voor uw ochtendkoffie',
    articleTitle: 'Hoe de koffiemachine te gebruiken',
    articleDescription: 'Stap-voor-stap zetinstructies',
    linkTitle: 'Gebruikershandleiding PDF',
  },
  it: {
    itemName: 'Macchina del caffè',
    itemDescription: 'Macchina espresso premium per il caffè del mattino',
    articleTitle: 'Come usare la macchina del caffè',
    articleDescription: 'Istruzioni di preparazione passo dopo passo',
    linkTitle: 'Manuale utente PDF',
  },
} as const;
