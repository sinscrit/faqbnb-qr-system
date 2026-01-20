/**
 * Content Translation Triggers Barrel Export
 * Part of REQ-E03-003: Implement Entity-Specific Translation Triggers
 *
 * This module exports all entity-specific translation trigger functions
 * for convenient importing throughout the application.
 *
 * @module content-translation/triggers
 * @created 2026-01-20
 */

export { triggerItemTranslation } from './item-trigger';
export { triggerArticleTranslation } from './article-trigger';
export { triggerLinkTranslation } from './link-trigger';
export { triggerTagTranslation } from './tag-trigger';
