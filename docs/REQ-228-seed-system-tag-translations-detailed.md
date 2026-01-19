# REQ-228: Seed System Tag Translations - Detailed Task Breakdown

**Generated:** 2026-01-18 00:15:00 UTC
**Last Modified:** 2026-01-18 06:48:00 UTC
**Request Reference:** REQ-228 - System Tag Translation Data Seeding
**Overview Document:** REQ-228-seed-system-tag-translations-overview.md
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 1, Task 1.6)
**Status:** Partially Complete (9/11 tasks done, 2 require manual DB execution)

---

## Executive Summary

This document provides granular, implementation-ready tasks for seeding the `tag_translations` table with 102 system-defined tag translations (17 tags × 6 languages). Each task is scoped to approximately 1 story point and can be executed sequentially by an AI coding agent or junior developer.

---

## Prerequisites

Before starting implementation:

- [ ] **REQ-223 COMPLETE**: Migration creating `tag_translations` table must be applied
- [ ] **Database Access**: Supabase staging credentials available
- [ ] **Verify Table Exists**: Confirm `tag_translations` table schema matches expected structure

### Verification Query
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tag_translations'
ORDER BY ordinal_position;
```

Expected columns:
- `id` (uuid)
- `tag_key` (varchar)
- `language` (varchar)
- `translated_value` (varchar)
- `is_system_tag` (boolean)
- `created_at` (timestamp with time zone)

---

## Task Breakdown

### Task 1.6.1: Create database seeds directory structure

**Story Points:** 0.5
**Action:** Create directory if not exists
**Target:** `/database/seeds/`

#### Steps

1. Check if `/database/seeds/` directory exists
2. If not, create the directory
3. Verify directory creation

#### Verification
```bash
ls -la database/seeds/
```

#### Files Changed
| File/Directory | Action |
|----------------|--------|
| `/database/seeds/` | CREATE (directory) |

---

### Task 1.6.2: Create seed file with header documentation

**Story Points:** 0.5
**Action:** Create new file
**Target:** `/database/seeds/20260117_system_tag_translations.sql`

#### Steps

1. Create new SQL file at `/database/seeds/20260117_system_tag_translations.sql`
2. Add comprehensive header documentation block

#### Implementation

```sql
-- ===========================================================
-- System Tag Translations Seed Data
-- File: /database/seeds/20260117_system_tag_translations.sql
-- ===========================================================
--
-- Generated: 2026-01-17
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

-- Seed content will be added in subsequent tasks

```

#### Verification
- File exists at specified path
- Header comments are present and accurate

#### Files Changed
| File | Action |
|------|--------|
| `/database/seeds/20260117_system_tag_translations.sql` | CREATE |

---

### Task 1.6.3: Add room tag translations (Part 1: kitchen, laundry, bedroom, bathroom)

**Story Points:** 1
**Action:** Add INSERT statements
**Target:** `/database/seeds/20260117_system_tag_translations.sql`

#### Steps

1. Append room tag section header comment
2. Add INSERT statements for first 4 room tags with ON CONFLICT handling

#### Implementation

Append to the seed file:

```sql
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

```

#### Translation Reference Table
| tag_key | en | fr | es | de | nl | it |
|---------|----|----|----|----|----|----|
| kitchen | Kitchen | Cuisine | Cocina | Küche | Keuken | Cucina |
| laundry | Laundry | Buanderie | Lavandería | Waschraum | Wasruimte | Lavanderia |
| bedroom | Bedroom | Chambre | Dormitorio | Schlafzimmer | Slaapkamer | Camera da letto |
| bathroom | Bathroom | Salle de bain | Baño | Badezimmer | Badkamer | Bagno |

#### Verification
- 4 INSERT statements with 6 VALUES each (24 rows when executed)
- ON CONFLICT clause present on each INSERT

#### Files Changed
| File | Action |
|------|--------|
| `/database/seeds/20260117_system_tag_translations.sql` | MODIFY |

---

### Task 1.6.4: Add room tag translations (Part 2: living-room, garage, outdoor, general)

**Story Points:** 1
**Action:** Add INSERT statements
**Target:** `/database/seeds/20260117_system_tag_translations.sql`

#### Steps

1. Add section comment for Part 2 room tags
2. Add INSERT statements for remaining 4 room tags with ON CONFLICT handling

#### Implementation

Append to the seed file:

```sql
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

```

#### Translation Reference Table
| tag_key | en | fr | es | de | nl | it |
|---------|----|----|----|----|----|----|
| living-room | Living Room | Salon | Sala de estar | Wohnzimmer | Woonkamer | Soggiorno |
| garage | Garage | Garage | Garaje | Garage | Garage | Garage |
| outdoor | Outdoor | Extérieur | Exterior | Außenbereich | Buiten | Esterno |
| general | General | Général | General | Allgemein | Algemeen | Generale |

#### Verification
- 4 INSERT statements with 6 VALUES each (24 rows when executed)
- Total room tags: 8 tags × 6 languages = 48 rows

#### Files Changed
| File | Action |
|------|--------|
| `/database/seeds/20260117_system_tag_translations.sql` | MODIFY |

---

### Task 1.6.5: Add item type tag translations

**Story Points:** 0.5
**Action:** Add INSERT statements
**Target:** `/database/seeds/20260117_system_tag_translations.sql`

#### Steps

1. Add item type tags section header comment
2. Add INSERT statements for 2 item type tags with ON CONFLICT handling

#### Implementation

Append to the seed file:

```sql
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

```

#### Translation Reference Table
| tag_key | en | fr | es | de | nl | it |
|---------|----|----|----|----|----|----|
| appliance | Appliance | Appareil | Electrodoméstico | Gerät | Apparaat | Elettrodomestico |
| room-item | Room Item | Objet | Artículo | Raumgegenstand | Kamerobject | Oggetto |

#### Verification
- 2 INSERT statements with 6 VALUES each (12 rows when executed)

#### Files Changed
| File | Action |
|------|--------|
| `/database/seeds/20260117_system_tag_translations.sql` | MODIFY |

---

### Task 1.6.6: Add purpose tag translations (Part 1: instructions, cleaning, troubleshooting, safety)

**Story Points:** 1
**Action:** Add INSERT statements
**Target:** `/database/seeds/20260117_system_tag_translations.sql`

#### Steps

1. Add purpose tags section header comment
2. Add INSERT statements for first 4 purpose tags with ON CONFLICT handling

#### Implementation

Append to the seed file:

```sql
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

```

#### Translation Reference Table
| tag_key | en | fr | es | de | nl | it |
|---------|----|----|----|----|----|----|
| instructions | Instructions | Instructions | Instrucciones | Anleitung | Instructies | Istruzioni |
| cleaning | Cleaning | Nettoyage | Limpieza | Reinigung | Schoonmaken | Pulizia |
| troubleshooting | Troubleshooting | Dépannage | Solución de problemas | Fehlerbehebung | Probleemoplossing | Risoluzione problemi |
| safety | Safety | Sécurité | Seguridad | Sicherheit | Veiligheid | Sicurezza |

#### Verification
- 4 INSERT statements with 6 VALUES each (24 rows when executed)

#### Files Changed
| File | Action |
|------|--------|
| `/database/seeds/20260117_system_tag_translations.sql` | MODIFY |

---

### Task 1.6.7: Add purpose tag translations (Part 2: maintenance, features, info)

**Story Points:** 1
**Action:** Add INSERT statements
**Target:** `/database/seeds/20260117_system_tag_translations.sql`

#### Steps

1. Add section comment for Part 2 purpose tags
2. Add INSERT statements for remaining 3 purpose tags with ON CONFLICT handling

#### Implementation

Append to the seed file:

```sql
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

```

#### Translation Reference Table
| tag_key | en | fr | es | de | nl | it |
|---------|----|----|----|----|----|----|
| maintenance | Maintenance | Entretien | Mantenimiento | Wartung | Onderhoud | Manutenzione |
| features | Features | Fonctions | Funciones | Funktionen | Functies | Funzioni |
| info | Info | Info | Info | Info | Info | Info |

#### Verification
- 3 INSERT statements with 6 VALUES each (18 rows when executed)
- Total purpose tags: 7 tags × 6 languages = 42 rows

#### Files Changed
| File | Action |
|------|--------|
| `/database/seeds/20260117_system_tag_translations.sql` | MODIFY |

---

### Task 1.6.8: Add verification queries to seed file

**Story Points:** 0.5
**Action:** Add SQL verification queries (commented)
**Target:** `/database/seeds/20260117_system_tag_translations.sql`

#### Steps

1. Add verification section header
2. Add commented SQL queries for post-execution verification

#### Implementation

Append to the seed file:

```sql
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

```

#### Verification
- All queries are commented out (for manual execution)
- Expected results documented in comments

#### Files Changed
| File | Action |
|------|--------|
| `/database/seeds/20260117_system_tag_translations.sql` | MODIFY |

---

### Task 1.6.9: Apply seed to staging environment

**Story Points:** 1
**Action:** Execute seed SQL via Supabase SQL Editor
**Target:** Staging environment

#### Steps

1. Connect to staging Supabase instance
2. Open SQL Editor in Supabase Dashboard
3. Copy contents of `/database/seeds/20260117_system_tag_translations.sql`
4. Execute the seed SQL
5. Run verification queries (uncomment and execute)
6. Confirm expected results

#### Verification Checklist

Execute each verification query and confirm:

| Query | Expected Result | Actual Result |
|-------|-----------------|---------------|
| Count by language | 17 rows per language (en, fr, es, de, nl, it) | [ ] Pass |
| Total system tags | 102 rows | [ ] Pass |
| Room tags count | 8 unique tags, 48 translations | [ ] Pass |
| Item type tags count | 2 unique tags, 12 translations | [ ] Pass |
| Purpose tags count | 7 unique tags, 42 translations | [ ] Pass |
| Missing translations | 0 rows | [ ] Pass |

#### Sample Spot Checks

```sql
-- Verify kitchen translations
SELECT * FROM tag_translations
WHERE tag_key = 'kitchen'
ORDER BY language;
-- Expected: Kitchen, Cuisine, Cocina, Küche, Keuken, Cucina

-- Verify troubleshooting translations
SELECT * FROM tag_translations
WHERE tag_key = 'troubleshooting'
ORDER BY language;
-- Expected: Troubleshooting, Dépannage, Solución de problemas, Fehlerbehebung, Probleemoplossing, Risoluzione problemi
```

#### Rollback Procedure (if needed)

```sql
-- Remove all seeded system tags (use with caution)
DELETE FROM tag_translations WHERE is_system_tag = true;
```

#### Files Changed
| File | Action |
|------|--------|
| N/A (database operation) | - |

---

### Task 1.6.10: Update constants file with seed documentation reference

**Story Points:** 0.5
**Action:** Add documentation comment
**Target:** `/src/components/ItemCreationWorkflow/utils/constants.ts`

#### Steps

1. Read the constants file
2. Locate the `AVAILABLE_TAGS` constant definition
3. Add a documentation note referencing the database seed

#### Implementation

Update the JSDoc comment above `AVAILABLE_TAGS` constant (around line 330-345):

**Current:**
```typescript
/**
 * Available tags for item categorization.
 * Tags are auto-generated based on room, item type, and purpose selections,
 * and can be manually edited by users in the PreviewSaveStep.
 *
 * Tag Categories:
 * - Room tags: kitchen, laundry, bedroom, bathroom, living-room, garage, outdoor
 * - General tags: general
 * - Item type tags: appliance, room-item
 * - Purpose tags: instructions, cleaning, troubleshooting, safety, maintenance, features, info
 *
 * @see tagMapper.ts for auto-generation logic
 * @see TagsEditor component for UI implementation
 * @created 2026-01-10 (REQ-177 Intelligent Pre-filling)
 */
```

**Updated:**
```typescript
/**
 * Available tags for item categorization.
 * Tags are auto-generated based on room, item type, and purpose selections,
 * and can be manually edited by users in the PreviewSaveStep.
 *
 * Tag Categories:
 * - Room tags: kitchen, laundry, bedroom, bathroom, living-room, garage, outdoor
 * - General tags: general
 * - Item type tags: appliance, room-item
 * - Purpose tags: instructions, cleaning, troubleshooting, safety, maintenance, features, info
 *
 * NOTE: System tag translations are pre-seeded in the database
 * via /database/seeds/20260117_system_tag_translations.sql
 * for all 6 supported languages (en, fr, es, de, nl, it).
 *
 * @see tagMapper.ts for auto-generation logic
 * @see TagsEditor component for UI implementation
 * @see REQ-228 for seed data specification
 * @created 2026-01-10 (REQ-177 Intelligent Pre-filling)
 * @modified 2026-01-18 (REQ-228 L10N seed documentation)
 */
```

#### Verification
- Comment correctly references seed file path
- Languages listed match seed data
- REQ-228 reference added

#### Files Changed
| File | Action |
|------|--------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | MODIFY |

---

### Task 1.6.11: Run idempotency test

**Story Points:** 0.5
**Action:** Re-run seed to verify idempotency
**Target:** Staging environment

#### Steps

1. Execute the seed SQL a second time
2. Verify no errors occur (ON CONFLICT handles duplicates)
3. Verify row count remains at 102

#### Verification

```sql
-- After running seed twice, count should still be 102
SELECT COUNT(*) FROM tag_translations WHERE is_system_tag = true;
-- Expected: 102

-- No duplicate key errors should occur
```

#### Success Criteria
- [ ] Second execution completes without errors
- [ ] Row count remains exactly 102
- [ ] No duplicate entries created

#### Files Changed
| File | Action |
|------|--------|
| N/A (verification only) | - |

---

## Complete Task Summary

| Task ID | Description | Story Points | Files | Status |
|---------|-------------|--------------|-------|--------|
| 1.6.1 | Create seeds directory | 0.5 | `/database/seeds/` (create) | [x] DONE |
| 1.6.2 | Create seed file with header | 0.5 | `20260117_system_tag_translations.sql` (create) | [x] DONE |
| 1.6.3 | Add room tags Part 1 | 1.0 | `20260117_system_tag_translations.sql` | [x] DONE |
| 1.6.4 | Add room tags Part 2 | 1.0 | `20260117_system_tag_translations.sql` | [x] DONE |
| 1.6.5 | Add item type tags | 0.5 | `20260117_system_tag_translations.sql` | [x] DONE |
| 1.6.6 | Add purpose tags Part 1 | 1.0 | `20260117_system_tag_translations.sql` | [x] DONE |
| 1.6.7 | Add purpose tags Part 2 | 1.0 | `20260117_system_tag_translations.sql` | [x] DONE |
| 1.6.8 | Add verification queries | 0.5 | `20260117_system_tag_translations.sql` | [x] DONE |
| 1.6.9 | Apply seed to staging | 1.0 | N/A (database) | [ ] MANUAL - Execute via Supabase SQL Editor |
| 1.6.10 | Update constants documentation | 0.5 | `constants.ts` | [x] DONE |
| 1.6.11 | Run idempotency test | 0.5 | N/A (verification) | [ ] MANUAL - Execute after Task 1.6.9 |
| **TOTAL** | | **8.0** | | **9/11 Completed** |

### Implementation Notes (2026-01-18)

- **Tasks 1.6.1-1.6.8, 1.6.10**: Completed programmatically. All seed file content created with 17 tags x 6 languages = 102 translation records.
- **Task 1.6.9**: Requires manual execution in Supabase SQL Editor. Copy contents of `/database/seeds/20260117_system_tag_translations.sql` and execute.
- **Task 1.6.11**: Requires manual re-execution of seed to verify idempotency (should complete without errors, count should remain 102).
- **Build verification**: `npm run build` completed successfully.
- **Type check**: Pre-existing TypeScript errors in codebase (not related to this task).

---

## Acceptance Criteria Checklist

From REQ-228:

- [x] Standard room type tags are available in all supported languages (8 tags × 6 languages = 48 records) - **SEED READY, pending DB execution**
- [x] Standard appliance/item type tags are available in all supported languages (2 tags × 6 languages = 12 records) - **SEED READY, pending DB execution**
- [x] Standard purpose tags are available in all supported languages (7 tags × 6 languages = 42 records) - **SEED READY, pending DB execution**
- [x] Translations are semantically accurate and culturally appropriate for each language - **Verified in seed file**
- [x] System can identify which tags are system-defined versus user-created (`is_system_tag = true`) - **All entries have is_system_tag = true**
- [x] Seed data operation is idempotent and can be safely run multiple times (ON CONFLICT handling) - **ON CONFLICT clauses implemented**
- [ ] Total of 102 translation records created successfully - **Pending DB execution (Task 1.6.9)**

---

## Complete Translation Reference

### Room Tags (8 tags × 6 languages = 48 records)

| tag_key | en | fr | es | de | nl | it |
|---------|----|----|----|----|----|----|
| kitchen | Kitchen | Cuisine | Cocina | Küche | Keuken | Cucina |
| laundry | Laundry | Buanderie | Lavandería | Waschraum | Wasruimte | Lavanderia |
| bedroom | Bedroom | Chambre | Dormitorio | Schlafzimmer | Slaapkamer | Camera da letto |
| bathroom | Bathroom | Salle de bain | Baño | Badezimmer | Badkamer | Bagno |
| living-room | Living Room | Salon | Sala de estar | Wohnzimmer | Woonkamer | Soggiorno |
| garage | Garage | Garage | Garaje | Garage | Garage | Garage |
| outdoor | Outdoor | Extérieur | Exterior | Außenbereich | Buiten | Esterno |
| general | General | Général | General | Allgemein | Algemeen | Generale |

### Item Type Tags (2 tags × 6 languages = 12 records)

| tag_key | en | fr | es | de | nl | it |
|---------|----|----|----|----|----|----|
| appliance | Appliance | Appareil | Electrodoméstico | Gerät | Apparaat | Elettrodomestico |
| room-item | Room Item | Objet | Artículo | Raumgegenstand | Kamerobject | Oggetto |

### Purpose Tags (7 tags × 6 languages = 42 records)

| tag_key | en | fr | es | de | nl | it |
|---------|----|----|----|----|----|----|
| instructions | Instructions | Instructions | Instrucciones | Anleitung | Instructies | Istruzioni |
| cleaning | Cleaning | Nettoyage | Limpieza | Reinigung | Schoonmaken | Pulizia |
| troubleshooting | Troubleshooting | Dépannage | Solución de problemas | Fehlerbehebung | Probleemoplossing | Risoluzione problemi |
| safety | Safety | Sécurité | Seguridad | Sicherheit | Veiligheid | Sicurezza |
| maintenance | Maintenance | Entretien | Mantenimiento | Wartung | Onderhoud | Manutenzione |
| features | Features | Fonctions | Funciones | Funktionen | Functies | Funzioni |
| info | Info | Info | Info | Info | Info | Info |

---

## Dependencies

### Blocking Dependencies (Must Complete Before Starting)

| Dependency | REQ ID | Description | Status |
|------------|--------|-------------|--------|
| Translation Tables Migration | REQ-223 | Create `tag_translations` table | Required |

### Dependent Tasks (Blocked Until This Completes)

| Task | Description |
|------|-------------|
| Phase 5 Language Switching | Uses seeded tags for localized display |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `tag_translations` table doesn't exist | Low | High | Verify REQ-223 complete before starting |
| Unicode encoding issues | Low | Medium | Verify UTF-8 throughout; test accented characters |
| Translation quality concerns | Medium | Low | Can update later; these are simple terms |
| Seed runs before migration | Low | High | Check table exists at start of Task 1.6.9 |

---

## Notes on Translation Quality

1. **German Characters**: Using proper Unicode (ü, ö, ß) for accurate display. Database must support UTF-8.

2. **Spanish Characters**: Using proper Unicode (ñ, é, í, ó, ú) for accurate display.

3. **French Characters**: Using proper Unicode (é, è, ê, ë, ï, ô, û, ç) for accurate display.

4. **Multi-Word Translations**: Some translations are multi-word phrases which is linguistically correct:
   - Italian: "Camera da letto", "Sala de estar", "Risoluzione problemi"
   - Spanish: "Solución de problemas", "Sala de estar"

5. **Internationalized "Info"**: The abbreviation "Info" is widely understood across all six languages and kept consistent.

---

## References

- [Overview Document](/docs/REQ-228-seed-system-tag-translations-overview.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Tag Constants](/src/components/ItemCreationWorkflow/utils/constants.ts)
- [REQ-223: Translation Tables Migration](/docs/REQ-223-create-migration-file-with-all-translation-tables-overview.md)
- [gen_requests.md - REQ-228](/docs/gen_requests.md)
