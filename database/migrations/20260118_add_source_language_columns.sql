-- ===========================================================
-- Migration: Add source_language columns to content tables
-- File: 20260118_add_source_language_columns.sql
-- Generated: 2026-01-18
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-224 (Plan-110, Task 1.2)
-- ===========================================================
--
-- Purpose: Track original language of content for translation workflows
-- This enables the translation system to know which version is authoritative
--
-- Tables affected:
--   1. items - Track source language for item names and descriptions
--   2. item_articles - Track source language for article content
--   3. item_links - Track source language for link titles
--
-- Supported languages: en, fr, es, de, nl, it
-- Default value: 'en' (English)
--
-- ===========================================================

-- ============================================================
-- SECTION 1: Add source_language to items table
-- ============================================================

-- Add source_language column with default 'en'
-- PostgreSQL 11+ handles DEFAULT efficiently (no table rewrite)
ALTER TABLE items
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';

-- Add CHECK constraint for valid language codes
ALTER TABLE items
ADD CONSTRAINT items_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- ============================================================
-- SECTION 2: Add source_language to item_articles table
-- ============================================================

-- Add source_language column with default 'en'
ALTER TABLE item_articles
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';

-- Add CHECK constraint for valid language codes
ALTER TABLE item_articles
ADD CONSTRAINT item_articles_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- ============================================================
-- SECTION 3: Add source_language to item_links table
-- ============================================================

-- Add source_language column with default 'en'
ALTER TABLE item_links
ADD COLUMN IF NOT EXISTS source_language VARCHAR(5) DEFAULT 'en';

-- Add CHECK constraint for valid language codes
ALTER TABLE item_links
ADD CONSTRAINT item_links_source_language_check
CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it'));

-- ============================================================
-- SECTION 4: Create indexes for source_language columns
-- ============================================================
-- These indexes optimize queries filtering content by source language

CREATE INDEX IF NOT EXISTS idx_items_source_language
ON items(source_language);

CREATE INDEX IF NOT EXISTS idx_item_articles_source_language
ON item_articles(source_language);

CREATE INDEX IF NOT EXISTS idx_item_links_source_language
ON item_links(source_language);

-- ============================================================
-- SECTION 5: Column documentation
-- ============================================================

COMMENT ON COLUMN items.source_language IS
  'Original language code (ISO 639-1) of the item content. Defaults to en. Valid: en, fr, es, de, nl, it.';

COMMENT ON COLUMN item_articles.source_language IS
  'Original language code (ISO 639-1) of the article content. Defaults to en. Valid: en, fr, es, de, nl, it.';

COMMENT ON COLUMN item_links.source_language IS
  'Original language code (ISO 639-1) of the link title. Defaults to en. Valid: en, fr, es, de, nl, it.';

-- ============================================================
-- ROLLBACK SCRIPT (run manually if needed)
-- ============================================================
-- WARNING: This will permanently remove source_language data!
--
-- -- Remove indexes first
-- DROP INDEX IF EXISTS idx_item_links_source_language;
-- DROP INDEX IF EXISTS idx_item_articles_source_language;
-- DROP INDEX IF EXISTS idx_items_source_language;
--
-- -- Remove constraints
-- ALTER TABLE item_links DROP CONSTRAINT IF EXISTS item_links_source_language_check;
-- ALTER TABLE item_articles DROP CONSTRAINT IF EXISTS item_articles_source_language_check;
-- ALTER TABLE items DROP CONSTRAINT IF EXISTS items_source_language_check;
--
-- -- Remove columns
-- ALTER TABLE item_links DROP COLUMN IF EXISTS source_language;
-- ALTER TABLE item_articles DROP COLUMN IF EXISTS source_language;
-- ALTER TABLE items DROP COLUMN IF EXISTS source_language;
--
-- ============================================================
-- END OF MIGRATION
-- ============================================================
