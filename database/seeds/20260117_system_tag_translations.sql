-- ===========================================================
-- System Tag Translations Seed Data
-- File: /database/seeds/20260117_system_tag_translations.sql
-- ===========================================================
--
-- Generated: 2026-01-17
-- Last Modified: 2026-01-18
-- Purpose: Pre-populate standard tag translations for L10N support
-- Epic: L10N Epic 1 - Foundation
-- Reference: REQ-228, Plan-110 Task 1.6
--
-- This seed creates translations for:
-- - 8 Room tags: kitchen, laundry, bedroom, bathroom, living-room, garage, outdoor, general
-- - 2 Item type tags: appliance, room-item
-- - 7 Purpose tags: instructions, cleaning, troubleshooting, safety, maintenance, features, info
-- Total: 17 tags x 6 languages = 102 translation records
--
-- Languages: en (English), fr (French), es (Spanish), de (German), nl (Dutch), it (Italian)
--
-- This seed is idempotent and can be run multiple times safely.
-- Uses ON CONFLICT ... DO UPDATE to handle re-runs gracefully.
-- ===========================================================

-- ============ ROOM TAGS (Part 1) ============

-- kitchen (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('kitchen', 'en', 'Kitchen', true),
  ('kitchen', 'fr', 'Cuisine', true),
  ('kitchen', 'es', 'Cocina', true),
  ('kitchen', 'de', 'Küche', true),
  ('kitchen', 'nl', 'Keuken', true),
  ('kitchen', 'it', 'Cucina', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- laundry (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('laundry', 'en', 'Laundry', true),
  ('laundry', 'fr', 'Buanderie', true),
  ('laundry', 'es', 'Lavandería', true),
  ('laundry', 'de', 'Waschraum', true),
  ('laundry', 'nl', 'Wasruimte', true),
  ('laundry', 'it', 'Lavanderia', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- bedroom (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('bedroom', 'en', 'Bedroom', true),
  ('bedroom', 'fr', 'Chambre', true),
  ('bedroom', 'es', 'Dormitorio', true),
  ('bedroom', 'de', 'Schlafzimmer', true),
  ('bedroom', 'nl', 'Slaapkamer', true),
  ('bedroom', 'it', 'Camera da letto', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- bathroom (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('bathroom', 'en', 'Bathroom', true),
  ('bathroom', 'fr', 'Salle de bain', true),
  ('bathroom', 'es', 'Baño', true),
  ('bathroom', 'de', 'Badezimmer', true),
  ('bathroom', 'nl', 'Badkamer', true),
  ('bathroom', 'it', 'Bagno', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- ============ ROOM TAGS (Part 2) ============

-- living-room (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('living-room', 'en', 'Living Room', true),
  ('living-room', 'fr', 'Salon', true),
  ('living-room', 'es', 'Sala de estar', true),
  ('living-room', 'de', 'Wohnzimmer', true),
  ('living-room', 'nl', 'Woonkamer', true),
  ('living-room', 'it', 'Soggiorno', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- garage (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('garage', 'en', 'Garage', true),
  ('garage', 'fr', 'Garage', true),
  ('garage', 'es', 'Garaje', true),
  ('garage', 'de', 'Garage', true),
  ('garage', 'nl', 'Garage', true),
  ('garage', 'it', 'Garage', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- outdoor (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('outdoor', 'en', 'Outdoor', true),
  ('outdoor', 'fr', 'Extérieur', true),
  ('outdoor', 'es', 'Exterior', true),
  ('outdoor', 'de', 'Außenbereich', true),
  ('outdoor', 'nl', 'Buiten', true),
  ('outdoor', 'it', 'Esterno', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- general (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('general', 'en', 'General', true),
  ('general', 'fr', 'Général', true),
  ('general', 'es', 'General', true),
  ('general', 'de', 'Allgemein', true),
  ('general', 'nl', 'Algemeen', true),
  ('general', 'it', 'Generale', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- ============ ITEM TYPE TAGS ============

-- appliance (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('appliance', 'en', 'Appliance', true),
  ('appliance', 'fr', 'Appareil', true),
  ('appliance', 'es', 'Electrodoméstico', true),
  ('appliance', 'de', 'Gerät', true),
  ('appliance', 'nl', 'Apparaat', true),
  ('appliance', 'it', 'Elettrodomestico', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- room-item (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('room-item', 'en', 'Room Item', true),
  ('room-item', 'fr', 'Objet', true),
  ('room-item', 'es', 'Artículo', true),
  ('room-item', 'de', 'Raumgegenstand', true),
  ('room-item', 'nl', 'Kamerobject', true),
  ('room-item', 'it', 'Oggetto', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- ============ PURPOSE TAGS (Part 1) ============

-- instructions (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('instructions', 'en', 'Instructions', true),
  ('instructions', 'fr', 'Instructions', true),
  ('instructions', 'es', 'Instrucciones', true),
  ('instructions', 'de', 'Anleitung', true),
  ('instructions', 'nl', 'Instructies', true),
  ('instructions', 'it', 'Istruzioni', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- cleaning (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('cleaning', 'en', 'Cleaning', true),
  ('cleaning', 'fr', 'Nettoyage', true),
  ('cleaning', 'es', 'Limpieza', true),
  ('cleaning', 'de', 'Reinigung', true),
  ('cleaning', 'nl', 'Schoonmaken', true),
  ('cleaning', 'it', 'Pulizia', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- troubleshooting (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('troubleshooting', 'en', 'Troubleshooting', true),
  ('troubleshooting', 'fr', 'Dépannage', true),
  ('troubleshooting', 'es', 'Solución de problemas', true),
  ('troubleshooting', 'de', 'Fehlerbehebung', true),
  ('troubleshooting', 'nl', 'Probleemoplossing', true),
  ('troubleshooting', 'it', 'Risoluzione problemi', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- safety (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('safety', 'en', 'Safety', true),
  ('safety', 'fr', 'Sécurité', true),
  ('safety', 'es', 'Seguridad', true),
  ('safety', 'de', 'Sicherheit', true),
  ('safety', 'nl', 'Veiligheid', true),
  ('safety', 'it', 'Sicurezza', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- ============ PURPOSE TAGS (Part 2) ============

-- maintenance (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('maintenance', 'en', 'Maintenance', true),
  ('maintenance', 'fr', 'Entretien', true),
  ('maintenance', 'es', 'Mantenimiento', true),
  ('maintenance', 'de', 'Wartung', true),
  ('maintenance', 'nl', 'Onderhoud', true),
  ('maintenance', 'it', 'Manutenzione', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- features (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('features', 'en', 'Features', true),
  ('features', 'fr', 'Fonctions', true),
  ('features', 'es', 'Funciones', true),
  ('features', 'de', 'Funktionen', true),
  ('features', 'nl', 'Functies', true),
  ('features', 'it', 'Funzioni', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- info (6 languages)
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('info', 'en', 'Info', true),
  ('info', 'fr', 'Info', true),
  ('info', 'es', 'Info', true),
  ('info', 'de', 'Info', true),
  ('info', 'nl', 'Info', true),
  ('info', 'it', 'Info', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- ============ VERIFICATION QUERIES ============
-- Run these queries after seed execution to verify success

-- Verification 1: Count by language (should show 17 per language)
-- SELECT language, COUNT(*) as tag_count
-- FROM tag_translations
-- WHERE is_system_tag = true
-- GROUP BY language
-- ORDER BY language;

-- Verification 2: Total system tags (should be 102)
-- SELECT COUNT(*) as total_system_tags
-- FROM tag_translations
-- WHERE is_system_tag = true;

-- Verification 3: Count by tag category
-- Room tags: 8, Item type tags: 2, Purpose tags: 7
-- SELECT
--   CASE
--     WHEN tag_key IN ('kitchen', 'laundry', 'bedroom', 'bathroom', 'living-room', 'garage', 'outdoor', 'general') THEN 'room'
--     WHEN tag_key IN ('appliance', 'room-item') THEN 'item_type'
--     ELSE 'purpose'
--   END as category,
--   COUNT(DISTINCT tag_key) as unique_tags,
--   COUNT(*) as total_translations
-- FROM tag_translations
-- WHERE is_system_tag = true
-- GROUP BY 1
-- ORDER BY 1;

-- Verification 4: List all system tags (spot check)
-- SELECT tag_key, language, translated_value
-- FROM tag_translations
-- WHERE is_system_tag = true
-- ORDER BY tag_key, language;

-- Verification 5: Check for any missing translations (should return 0 rows)
-- WITH expected AS (
--   SELECT tag_key, lang
--   FROM (VALUES
--     ('kitchen'), ('laundry'), ('bedroom'), ('bathroom'), ('living-room'),
--     ('garage'), ('outdoor'), ('general'), ('appliance'), ('room-item'),
--     ('instructions'), ('cleaning'), ('troubleshooting'), ('safety'),
--     ('maintenance'), ('features'), ('info')
--   ) AS t(tag_key)
--   CROSS JOIN (VALUES ('en'), ('fr'), ('es'), ('de'), ('nl'), ('it')) AS l(lang)
-- )
-- SELECT e.tag_key, e.lang as missing_language
-- FROM expected e
-- LEFT JOIN tag_translations tt ON e.tag_key = tt.tag_key AND e.lang = tt.language
-- WHERE tt.id IS NULL;
