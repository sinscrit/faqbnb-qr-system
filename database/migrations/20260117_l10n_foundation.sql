-- ===========================================================
-- L10N Foundation Migration
-- File: /database/migrations/20260117_l10n_foundation.sql
-- Generated: 2026-01-17
-- Last Modified: 2026-01-18
-- ===========================================================
-- Purpose: Create translation tables for multi-language support
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-223
--
-- This migration creates:
-- 1. article_translations - Translated article content
-- 2. item_translations - Translated item names/descriptions
-- 3. link_translations - Translated link titles
-- 4. tag_translations - Translated tag values
-- 5. translation_jobs - Translation job queue metadata
--
-- Supported Languages: en, fr, es, de, nl, it
-- ===========================================================

-- ============================================================
-- TABLE: article_translations
-- Stores translated versions of item_articles content
-- ============================================================
CREATE TABLE article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES item_articles(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT article_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  CONSTRAINT article_translations_status_check
    CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed', 'manual')),
  UNIQUE(article_id, language)
);

-- ============================================================
-- TABLE: item_translations
-- Stores translated versions of items content (name, description)
-- ============================================================
CREATE TABLE item_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT item_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  CONSTRAINT item_translations_status_check
    CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed', 'manual')),
  UNIQUE(item_id, language)
);

-- ============================================================
-- TABLE: link_translations
-- Stores translated versions of item_links titles
-- ============================================================
CREATE TABLE link_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES item_links(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  translation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  translated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT link_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  CONSTRAINT link_translations_status_check
    CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed', 'manual')),
  UNIQUE(link_id, language)
);

-- ============================================================
-- TABLE: tag_translations
-- Stores translated tag values (room tags, category tags, etc.)
-- ============================================================
CREATE TABLE tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_key VARCHAR(100) NOT NULL,
  language VARCHAR(5) NOT NULL,
  translated_value VARCHAR(255) NOT NULL,
  is_system_tag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tag_translations_language_check
    CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  UNIQUE(tag_key, language)
);

-- ============================================================
-- TABLE: translation_jobs
-- Tracks translation job metadata for async processing
-- ============================================================
CREATE TABLE translation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  source_language VARCHAR(5) NOT NULL DEFAULT 'en',
  target_language VARCHAR(5) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CONSTRAINT translation_jobs_entity_type_check
    CHECK (entity_type IN ('article', 'item', 'link', 'tag')),
  CONSTRAINT translation_jobs_source_language_check
    CHECK (source_language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  CONSTRAINT translation_jobs_target_language_check
    CHECK (target_language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  CONSTRAINT translation_jobs_status_check
    CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  UNIQUE(entity_type, entity_id, target_language)
);

-- ============================================================
-- INDEXES
-- Performance optimization indexes for translation tables
-- ============================================================

-- article_translations indexes
CREATE INDEX idx_article_trans_article_lang ON article_translations(article_id, language);
CREATE INDEX idx_article_trans_language ON article_translations(language);
CREATE INDEX idx_article_trans_status ON article_translations(translation_status);

-- item_translations indexes
CREATE INDEX idx_item_trans_item_lang ON item_translations(item_id, language);
CREATE INDEX idx_item_trans_language ON item_translations(language);
CREATE INDEX idx_item_trans_status ON item_translations(translation_status);

-- link_translations indexes
CREATE INDEX idx_link_trans_link_lang ON link_translations(link_id, language);
CREATE INDEX idx_link_trans_language ON link_translations(language);

-- tag_translations indexes
CREATE INDEX idx_tag_trans_key_lang ON tag_translations(tag_key, language);
CREATE INDEX idx_tag_trans_language ON tag_translations(language);
CREATE INDEX idx_tag_trans_system ON tag_translations(is_system_tag);

-- translation_jobs indexes
CREATE INDEX idx_trans_jobs_status ON translation_jobs(status);
CREATE INDEX idx_trans_jobs_entity ON translation_jobs(entity_type, entity_id);
CREATE INDEX idx_trans_jobs_target ON translation_jobs(target_language);
CREATE INDEX idx_trans_jobs_created ON translation_jobs(created_at);

-- ============================================================
-- TRIGGERS
-- Automatically update updated_at timestamps
-- Uses existing update_updated_at_column() function from schema.sql
-- ============================================================

CREATE TRIGGER update_article_translations_updated_at
  BEFORE UPDATE ON article_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_translations_updated_at
  BEFORE UPDATE ON item_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_link_translations_updated_at
  BEFORE UPDATE ON link_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMMENTS
-- Documentation for tables and key columns
-- ============================================================

-- Table comments
COMMENT ON TABLE article_translations IS 'Stores translated versions of item_articles content (title, description) - L10N Epic 1';
COMMENT ON TABLE item_translations IS 'Stores translated versions of items content (name, description) - L10N Epic 1';
COMMENT ON TABLE link_translations IS 'Stores translated versions of item_links titles - L10N Epic 1';
COMMENT ON TABLE tag_translations IS 'Stores translated tag values for rooms, categories, and custom tags - L10N Epic 1';
COMMENT ON TABLE translation_jobs IS 'Tracks translation job metadata for async background processing - L10N Epic 1';

-- Column comments for translation_status
COMMENT ON COLUMN article_translations.translation_status IS 'Translation lifecycle: pending (not started), processing (in progress), completed (done), failed (error), manual (human-translated)';
COMMENT ON COLUMN item_translations.translation_status IS 'Translation lifecycle: pending (not started), processing (in progress), completed (done), failed (error), manual (human-translated)';
COMMENT ON COLUMN link_translations.translation_status IS 'Translation lifecycle: pending (not started), processing (in progress), completed (done), failed (error), manual (human-translated)';

-- Column comments for tag_translations
COMMENT ON COLUMN tag_translations.tag_key IS 'Original tag identifier, may include prefix like #room. for namespacing';
COMMENT ON COLUMN tag_translations.is_system_tag IS 'True for pre-defined system tags (rooms, categories), false for user-created tags';

-- Column comments for translation_jobs
COMMENT ON COLUMN translation_jobs.entity_type IS 'Type of content being translated: article, item, link, or tag';
COMMENT ON COLUMN translation_jobs.attempts IS 'Number of processing attempts, incremented on each retry';
COMMENT ON COLUMN translation_jobs.status IS 'Job status: queued (waiting), processing (active), completed (success), failed (error)';

-- ============================================================
-- ROLLBACK SCRIPT (commented)
-- Run manually to reverse this migration if needed
-- Execute in this order to respect foreign key dependencies
-- ============================================================
--
-- DROP TRIGGER IF EXISTS update_link_translations_updated_at ON link_translations;
-- DROP TRIGGER IF EXISTS update_item_translations_updated_at ON item_translations;
-- DROP TRIGGER IF EXISTS update_article_translations_updated_at ON article_translations;
--
-- DROP TABLE IF EXISTS translation_jobs CASCADE;
-- DROP TABLE IF EXISTS tag_translations CASCADE;
-- DROP TABLE IF EXISTS link_translations CASCADE;
-- DROP TABLE IF EXISTS item_translations CASCADE;
-- DROP TABLE IF EXISTS article_translations CASCADE;
--
-- Note: Indexes are automatically dropped with their tables
-- Note: The update_updated_at_column() function is shared and should NOT be dropped
