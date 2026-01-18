# REQ-228: Seed System Tag Translations - Implementation Overview

**Generated:** 2026-01-17 23:55:00 UTC
**Last Modified:** 2026-01-17 23:55:00 UTC
**Request Reference:** REQ-228 - System Tag Translation Data Seeding
**Plan Reference:** Plan-110-L10N-Epic1-Foundation.md (Phase 1, Task 1.6)
**Status:** Ready for Implementation

---

## 1. Request Summary

Pre-populate the `tag_translations` table with standard room and appliance tag translations across all six supported languages (en, fr, es, de, nl, it). This seed data provides immediate multilingual support for common property features, eliminating the need for property owners to manually translate standard tags that are universally applicable across all properties.

### Business Context

System tags represent common property categories (rooms, appliances, content purposes) that apply universally across all FAQBNB properties. By seeding these translations:

1. **Immediate Value**: International guests see properly localized tags from day one
2. **Reduced Friction**: Property owners don't waste time translating common terms
3. **Consistency**: Standard terminology across all properties in each language
4. **Quality Assurance**: Professional translations for public-facing content

---

## 2. Current State Analysis

### Existing Tag System

Based on `/src/components/ItemCreationWorkflow/utils/constants.ts`:

**17 Available Tags (AVAILABLE_TAGS constant):**

| Category | Tags |
|----------|------|
| Room Tags | `kitchen`, `laundry`, `bedroom`, `bathroom`, `living-room`, `garage`, `outdoor`, `general` |
| Item Type Tags | `appliance`, `room-item` |
| Purpose Tags | `instructions`, `cleaning`, `troubleshooting`, `safety`, `maintenance`, `features`, `info` |

**Current English Labels (TAG_LABELS constant):**

```typescript
{
  kitchen: 'Kitchen',
  laundry: 'Laundry',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  'living-room': 'Living Room',
  garage: 'Garage',
  outdoor: 'Outdoor',
  general: 'General',
  appliance: 'Appliance',
  'room-item': 'Room Item',
  instructions: 'Instructions',
  cleaning: 'Cleaning',
  troubleshooting: 'Troubleshooting',
  safety: 'Safety',
  maintenance: 'Maintenance',
  features: 'Features',
  info: 'Info',
}
```

### Target Table Structure

Per Plan-110 and REQ-223, the `tag_translations` table schema:

```sql
CREATE TABLE tag_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_key VARCHAR(100) NOT NULL,
  language VARCHAR(5) NOT NULL CHECK (language IN ('en', 'fr', 'es', 'de', 'nl', 'it')),
  translated_value VARCHAR(255) NOT NULL,
  is_system_tag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tag_key, language)
);
```

### Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `fr` | French | Francais |
| `es` | Spanish | Espanol |
| `de` | German | Deutsch |
| `nl` | Dutch | Nederlands |
| `it` | Italian | Italiano |

---

## 3. Technical Approach

### Seed Data Structure

Each system tag requires 6 rows (one per supported language):

```
17 tags x 6 languages = 102 translation records
```

### Translation Quality Requirements

1. **Semantic Accuracy**: Translations must convey the same meaning as the English source
2. **Cultural Appropriateness**: Use standard terminology for each locale
3. **Conciseness**: Keep translations brief for UI display (single words or short phrases)
4. **Consistency**: Maintain consistent terminology across related tags

### Idempotency Strategy

The seed operation must be safely re-runnable:

```sql
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES (...)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;
```

This approach:
- Inserts new translations if they don't exist
- Updates existing translations if they do (correcting any manual overrides to system values)
- Always marks as `is_system_tag = true`

---

## 4. System Tag Translation Seed Data

### Room Tags

| tag_key | en | fr | es | de | nl | it |
|---------|----|----|----|----|----|----|
| `kitchen` | Kitchen | Cuisine | Cocina | Kuche | Keuken | Cucina |
| `laundry` | Laundry | Buanderie | Lavanderia | Waschraum | Wasruimte | Lavanderia |
| `bedroom` | Bedroom | Chambre | Dormitorio | Schlafzimmer | Slaapkamer | Camera da letto |
| `bathroom` | Bathroom | Salle de bain | Bano | Badezimmer | Badkamer | Bagno |
| `living-room` | Living Room | Salon | Sala de estar | Wohnzimmer | Woonkamer | Soggiorno |
| `garage` | Garage | Garage | Garaje | Garage | Garage | Garage |
| `outdoor` | Outdoor | Exterieur | Exterior | Aussenbereich | Buiten | Esterno |
| `general` | General | General | General | Allgemein | Algemeen | Generale |

### Item Type Tags

| tag_key | en | fr | es | de | nl | it |
|---------|----|----|----|----|----|----|
| `appliance` | Appliance | Appareil | Electrodomestico | Gerat | Apparaat | Elettrodomestico |
| `room-item` | Room Item | Objet | Articulo | Raumgegenstand | Kamerobject | Oggetto |

### Purpose Tags

| tag_key | en | fr | es | de | nl | it |
|---------|----|----|----|----|----|----|
| `instructions` | Instructions | Instructions | Instrucciones | Anleitung | Instructies | Istruzioni |
| `cleaning` | Cleaning | Nettoyage | Limpieza | Reinigung | Schoonmaken | Pulizia |
| `troubleshooting` | Troubleshooting | Depannage | Solucion de problemas | Fehlerbehebung | Probleemoplossing | Risoluzione problemi |
| `safety` | Safety | Securite | Seguridad | Sicherheit | Veiligheid | Sicurezza |
| `maintenance` | Maintenance | Entretien | Mantenimiento | Wartung | Onderhoud | Manutenzione |
| `features` | Features | Fonctions | Funciones | Funktionen | Functies | Funzioni |
| `info` | Info | Info | Info | Info | Info | Info |

---

## 5. Implementation Tasks

### Task 1.6.1: Create seed data SQL file

**Action:** Create new file
**File:** `/database/seeds/20260117_system_tag_translations.sql`

Content structure:
```sql
-- System Tag Translations Seed Data
-- Generated: 2026-01-17
-- Purpose: Pre-populate standard tag translations for L10N support
-- Reference: REQ-228, Plan-110 Task 1.6

-- This seed creates translations for:
-- - 8 Room tags (kitchen, laundry, bedroom, bathroom, living-room, garage, outdoor, general)
-- - 2 Item type tags (appliance, room-item)
-- - 7 Purpose tags (instructions, cleaning, troubleshooting, safety, maintenance, features, info)
-- Total: 17 tags x 6 languages = 102 translation records
```

Subtasks:
- [ ] Create `/database/seeds/` directory if it doesn't exist
- [ ] Create seed file with header documentation
- [ ] Add INSERT statements with ON CONFLICT handling

### Task 1.6.2: Add room tag translations

**Action:** Add INSERT statements for room tags
**File:** `/database/seeds/20260117_system_tag_translations.sql`

Add 48 rows (8 room tags x 6 languages) with translations as specified in Section 4.

### Task 1.6.3: Add item type tag translations

**Action:** Add INSERT statements for item type tags
**File:** `/database/seeds/20260117_system_tag_translations.sql`

Add 12 rows (2 item type tags x 6 languages) with translations as specified in Section 4.

### Task 1.6.4: Add purpose tag translations

**Action:** Add INSERT statements for purpose tags
**File:** `/database/seeds/20260117_system_tag_translations.sql`

Add 42 rows (7 purpose tags x 6 languages) with translations as specified in Section 4.

### Task 1.6.5: Add verification queries

**Action:** Add SELECT statements for verification
**File:** `/database/seeds/20260117_system_tag_translations.sql`

Add queries to verify seed success:
```sql
-- Verification: Count by language
SELECT language, COUNT(*) as tag_count
FROM tag_translations
WHERE is_system_tag = true
GROUP BY language
ORDER BY language;
-- Expected: 17 rows per language

-- Verification: Count total system tags
SELECT COUNT(*) as total_system_tags
FROM tag_translations
WHERE is_system_tag = true;
-- Expected: 102 rows
```

### Task 1.6.6: Apply seed to staging environment

**Action:** Execute seed SQL via Supabase
**Target:** Staging environment

Subtasks:
- [ ] Connect to staging Supabase instance
- [ ] Execute seed SQL via SQL Editor
- [ ] Run verification queries
- [ ] Confirm 102 rows created with `is_system_tag = true`

### Task 1.6.7: Document seed data in codebase

**Action:** Update constants file with seed reference
**File:** `/src/components/ItemCreationWorkflow/utils/constants.ts`

Add comment noting database translations:
```typescript
/**
 * Available tags for item categorization.
 * ...
 *
 * NOTE: System tag translations are pre-seeded in the database
 * via /database/seeds/20260117_system_tag_translations.sql
 * for all 6 supported languages (en, fr, es, de, nl, it).
 *
 * @see REQ-228 for seed data specification
 */
```

---

## 6. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Description |
|-----------|-------------|
| `/database/seeds/` | New seeds directory (if not exists) |
| `/database/seeds/20260117_system_tag_translations.sql` | System tag translation seed data |

### Files to MODIFY

| File Path | Changes |
|-----------|---------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Add documentation comment referencing seed data |

### Files to READ (Reference Only)

| File Path | Purpose |
|-----------|---------|
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Source of truth for tag_key values and English labels |
| `/docs/prd/Plan-110-L10N-Epic1-Foundation.md` | Implementation plan reference |
| `/docs/REQ-223-create-migration-file-with-all-translation-tables-overview.md` | tag_translations table schema |

---

## 7. Dependencies

### Database Dependencies

| Table | Dependency Type | Notes |
|-------|-----------------|-------|
| `tag_translations` | Target Table | Must exist before seed can run |

The `tag_translations` table is created by the migration in Task 1.1 (REQ-223). This seed task (Task 1.6) must run AFTER that migration is applied.

### Task Dependencies

| Dependency | Task ID | Description |
|------------|---------|-------------|
| REQ-223 | Task 1.1 | Create tag_translations table (must complete first) |

---

## 8. Complete Seed SQL File

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
-- ===========================================================

-- ============ ROOM TAGS ============

-- kitchen
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('kitchen', 'en', 'Kitchen', true),
  ('kitchen', 'fr', 'Cuisine', true),
  ('kitchen', 'es', 'Cocina', true),
  ('kitchen', 'de', 'Kuche', true),
  ('kitchen', 'nl', 'Keuken', true),
  ('kitchen', 'it', 'Cucina', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- laundry
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('laundry', 'en', 'Laundry', true),
  ('laundry', 'fr', 'Buanderie', true),
  ('laundry', 'es', 'Lavanderia', true),
  ('laundry', 'de', 'Waschraum', true),
  ('laundry', 'nl', 'Wasruimte', true),
  ('laundry', 'it', 'Lavanderia', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- bedroom
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

-- bathroom
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('bathroom', 'en', 'Bathroom', true),
  ('bathroom', 'fr', 'Salle de bain', true),
  ('bathroom', 'es', 'Bano', true),
  ('bathroom', 'de', 'Badezimmer', true),
  ('bathroom', 'nl', 'Badkamer', true),
  ('bathroom', 'it', 'Bagno', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- living-room
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

-- garage
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

-- outdoor
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('outdoor', 'en', 'Outdoor', true),
  ('outdoor', 'fr', 'Exterieur', true),
  ('outdoor', 'es', 'Exterior', true),
  ('outdoor', 'de', 'Aussenbereich', true),
  ('outdoor', 'nl', 'Buiten', true),
  ('outdoor', 'it', 'Esterno', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- general
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('general', 'en', 'General', true),
  ('general', 'fr', 'General', true),
  ('general', 'es', 'General', true),
  ('general', 'de', 'Allgemein', true),
  ('general', 'nl', 'Algemeen', true),
  ('general', 'it', 'Generale', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- ============ ITEM TYPE TAGS ============

-- appliance
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('appliance', 'en', 'Appliance', true),
  ('appliance', 'fr', 'Appareil', true),
  ('appliance', 'es', 'Electrodomestico', true),
  ('appliance', 'de', 'Gerat', true),
  ('appliance', 'nl', 'Apparaat', true),
  ('appliance', 'it', 'Elettrodomestico', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- room-item
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('room-item', 'en', 'Room Item', true),
  ('room-item', 'fr', 'Objet', true),
  ('room-item', 'es', 'Articulo', true),
  ('room-item', 'de', 'Raumgegenstand', true),
  ('room-item', 'nl', 'Kamerobject', true),
  ('room-item', 'it', 'Oggetto', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- ============ PURPOSE TAGS ============

-- instructions
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

-- cleaning
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

-- troubleshooting
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('troubleshooting', 'en', 'Troubleshooting', true),
  ('troubleshooting', 'fr', 'Depannage', true),
  ('troubleshooting', 'es', 'Solucion de problemas', true),
  ('troubleshooting', 'de', 'Fehlerbehebung', true),
  ('troubleshooting', 'nl', 'Probleemoplossing', true),
  ('troubleshooting', 'it', 'Risoluzione problemi', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- safety
INSERT INTO tag_translations (tag_key, language, translated_value, is_system_tag)
VALUES
  ('safety', 'en', 'Safety', true),
  ('safety', 'fr', 'Securite', true),
  ('safety', 'es', 'Seguridad', true),
  ('safety', 'de', 'Sicherheit', true),
  ('safety', 'nl', 'Veiligheid', true),
  ('safety', 'it', 'Sicurezza', true)
ON CONFLICT (tag_key, language) DO UPDATE SET
  translated_value = EXCLUDED.translated_value,
  is_system_tag = true;

-- maintenance
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

-- features
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

-- info
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

-- Verification: Count by language (should show 17 per language)
-- SELECT language, COUNT(*) as tag_count
-- FROM tag_translations
-- WHERE is_system_tag = true
-- GROUP BY language
-- ORDER BY language;

-- Verification: Total system tags (should be 102)
-- SELECT COUNT(*) as total_system_tags
-- FROM tag_translations
-- WHERE is_system_tag = true;

-- Verification: List all system tags
-- SELECT tag_key, language, translated_value
-- FROM tag_translations
-- WHERE is_system_tag = true
-- ORDER BY tag_key, language;
```

---

## 9. Acceptance Criteria

From REQ-228:

- [ ] Standard room type tags are available in all supported languages (8 tags x 6 languages = 48 records)
- [ ] Standard appliance/item type tags are available in all supported languages (2 tags x 6 languages = 12 records)
- [ ] Standard purpose tags are available in all supported languages (7 tags x 6 languages = 42 records)
- [ ] Translations are semantically accurate and culturally appropriate for each language
- [ ] System can identify which tags are system-defined versus user-created (`is_system_tag = true`)
- [ ] Seed data operation is idempotent and can be safely run multiple times (ON CONFLICT handling)
- [ ] Total of 102 translation records created successfully

---

## 10. Testing Strategy

### Pre-Deployment Verification

1. **Syntax Check:**
   ```bash
   # Validate SQL syntax against local PostgreSQL
   psql -h localhost -d faqbnb_test -f database/seeds/20260117_system_tag_translations.sql --echo-errors
   ```

2. **Idempotency Test:**
   - Run seed twice on test environment
   - Verify no duplicate key errors
   - Verify same 102 records exist after both runs

### Post-Deployment Verification

3. **Record Count Verification:**
   ```sql
   SELECT COUNT(*) FROM tag_translations WHERE is_system_tag = true;
   -- Expected: 102
   ```

4. **Language Distribution:**
   ```sql
   SELECT language, COUNT(*) as count
   FROM tag_translations
   WHERE is_system_tag = true
   GROUP BY language
   ORDER BY language;
   -- Expected: 17 per language (en, fr, es, de, nl, it)
   ```

5. **Tag Coverage:**
   ```sql
   SELECT tag_key, COUNT(*) as language_count
   FROM tag_translations
   WHERE is_system_tag = true
   GROUP BY tag_key
   ORDER BY tag_key;
   -- Expected: 6 per tag (one for each language)
   ```

6. **Sample Spot Checks:**
   ```sql
   SELECT * FROM tag_translations WHERE tag_key = 'kitchen' ORDER BY language;
   -- Verify: Kitchen, Cuisine, Cocina, Kuche, Keuken, Cucina

   SELECT * FROM tag_translations WHERE tag_key = 'troubleshooting' ORDER BY language;
   -- Verify: Troubleshooting, Depannage, Solucion de problemas, Fehlerbehebung, Probleemoplossing, Risoluzione problemi
   ```

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| tag_translations table doesn't exist | Low | High | Verify REQ-223 migration applied first |
| Translation quality issues | Medium | Low | Review translations with native speakers if time permits; can update later |
| Special characters encoding | Low | Medium | Use UTF-8 throughout; test accented characters |
| Seed runs before migration | Low | High | Document dependency; check table existence before insert |

---

## 12. Estimated Effort

| Task | Estimate |
|------|----------|
| Create seeds directory | 1 min |
| Write seed SQL file | 30 min |
| Review translations | 15 min |
| Apply to staging | 5 min |
| Run verification queries | 5 min |
| Update constants documentation | 5 min |
| **Total** | **~60 min** |

---

## 13. Notes on Translation Quality

The translations provided are standard terms commonly used in property rental and hospitality contexts. However, some notes:

1. **German Characters**: Using standard ASCII equivalents (e.g., "Kuche" instead of "Kuche" with umlaut) for maximum compatibility. Consider updating to proper Unicode if display supports it.

2. **Spanish Characters**: Using standard ASCII equivalents (e.g., "Bano" instead of "Bano" with tilde). Consider updating to proper Unicode.

3. **Italian Multi-Word Tags**: Some Italian translations are multi-word (e.g., "Camera da letto" for bedroom, "Risoluzione problemi" for troubleshooting). These are semantically accurate.

4. **Internationalized "Info"**: The word "Info" is widely understood in all six languages as an abbreviation for "Information" and is kept consistent.

5. **Future Enhancement**: Consider engaging professional translators or native speakers to review and refine translations before production deployment.

---

## 14. Next Steps After Implementation

After completing Task 1.6 (this task):

1. **Phase 2**: i18n Framework Integration (next-intl setup)
2. **Phase 3**: Translation Service (AI translation provider)
3. **Phase 4**: Background Job Processing
4. **Phase 5**: Language Switching Infrastructure

The seeded system tags will be used by the language switching infrastructure (Phase 5) to display localized tag labels in the UI.

---

## References

- [PRD: L10N Epic 1 - Foundation](/docs/prd/PRD_L10N_Epic1_Foundation.md)
- [Implementation Plan](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)
- [Tag Constants](/src/components/ItemCreationWorkflow/utils/constants.ts)
- [REQ-223: Translation Tables Migration](/docs/REQ-223-create-migration-file-with-all-translation-tables-overview.md)
