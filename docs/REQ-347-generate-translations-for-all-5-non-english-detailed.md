# REQ-347: Generate Translations for All 5 Non-English Languages - Detailed Task Breakdown

*Generated: 2026-01-19 UTC*
*Last Modified: 2026-01-19 UTC*

## Reference Information

| Field | Value |
|-------|-------|
| **Request ID** | REQ-347 |
| **Title** | Generate Translations for All Static UI Strings Across Five Non-English Languages |
| **Epic** | 2 - Static UI Translation |
| **Sub-Epic** | 2H - Common & Shared Components |
| **Task ID** | 2H.10 |
| **Type** | New Feature |
| **Size** | XL (Extra Large) |
| **Overview Document** | docs/REQ-347-generate-translations-for-all-5-non-english-overview.md |
| **Implementation Plan** | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| **Requirements** | docs/gen_requests_epic2.md (Request #347) |

---

## Executive Summary

This task generates complete, production-ready translations for all static UI strings in the FAQBNB application across five non-English languages: Spanish (es), French (fr), German (de), Italian (it), and Dutch (nl). The current `/messages/en.json` file contains approximately 121 translation keys across 6 namespaces. This task ensures 100% translation coverage with consistent terminology, appropriate formality registers, and proper character encoding for each language.

---

## Prerequisites

Before starting this task, verify the following are complete:

- [x] Epic 1 Foundation complete (next-intl installed and configured)
- [x] English source file `/messages/en.json` contains all extracted strings
- [x] Translation service infrastructure operational (`/src/lib/translation-service/`)
- [x] All non-English translation files exist with base structure
- [x] i18n config supports all 6 locales (`/src/lib/i18n/config.ts`)

---

## Current State Analysis

### English Source File Structure

**File:** `/messages/en.json`
**Current Keys:** ~121 (as of Epic 1 completion)

| Namespace | Key Count | Description |
|-----------|-----------|-------------|
| `common` | 33 | Shared UI elements (save, cancel, loading, etc.) |
| `auth` | 18 | Authentication flows (sign in, sign out, etc.) |
| `dashboard` | 17 | Dashboard and navigation labels |
| `items` | 26 | Item management strings |
| `errors` | 17 | Error and validation messages |
| `language` | 10 | Language selector strings |
| **Total** | **121** | |

### Non-English File Status (Pre-Task)

| Language | File | Status | Quality Issues |
|----------|------|--------|----------------|
| Spanish | `/messages/es.json` | 121 keys present | Missing accents (á, é, í, ó, ú, ñ) |
| French | `/messages/fr.json` | 121 keys present | Missing accents (é, è, ê, ë, à, etc.) |
| German | `/messages/de.json` | 121 keys present | Missing umlauts (ä, ö, ü, ß) |
| Italian | `/messages/it.json` | 121 keys present | Verify accent marks (à, è, é, ì, ò, ù) |
| Dutch | `/messages/nl.json` | 121 keys present | Verify spelling conventions |

---

## Detailed Tasks

### Task 2H.10.1: Audit Current Translation Files

**Description:** Analyze current state of all translation files to identify quality issues and gaps.

**Story Points:** 1

**Acceptance Criteria:**
- [ ] Read all 6 translation files (en, es, fr, de, it, nl)
- [ ] Generate key parity report showing any missing keys
- [ ] Document accent/diacritical issues in each file
- [ ] Document formality register used in each language
- [ ] Create list of ICU message format strings requiring pluralization

**Files to Read:**
- `/messages/en.json` (source of truth)
- `/messages/es.json`
- `/messages/fr.json`
- `/messages/de.json`
- `/messages/it.json`
- `/messages/nl.json`

**Output:** Audit report documenting current state and issues

---

### Task 2H.10.2: Update Spanish (es.json) Translations

**Description:** Review and fix all Spanish translations for accuracy, proper accents, and consistency.

**Story Points:** 2

**Acceptance Criteria:**
- [ ] 100% key parity with en.json
- [ ] All accent marks correct: á, é, í, ó, ú, ñ, ü
- [ ] Consistent informal "tú" register throughout
- [ ] Inverted punctuation where needed: ¿, ¡
- [ ] Gender agreement verified
- [ ] All ICU placeholders preserved exactly

**File to Modify:** `/messages/es.json`

**Language-Specific Guidelines:**
- Use Latin American neutral Spanish (avoid regional idioms)
- Informal "tú" register (standard for tech applications)
- Proper accent placement on words like: atrás, rápido, información
- Use "Código QR" for QR Code
- Use "Artículo" for Item consistently

**Key Translations to Verify:**
```json
{
  "common.back": "Atrás",
  "common.success": "Éxito",
  "auth.forgotPassword": "¿Olvidaste tu contraseña?",
  "auth.noAccount": "¿No tienes una cuenta?",
  "items.createNew": "Nuevo código QR",
  "errors.required": "Este campo es requerido"
}
```

---

### Task 2H.10.3: Update French (fr.json) Translations

**Description:** Review and fix all French translations for accuracy, proper accents, and consistency.

**Story Points:** 2

**Acceptance Criteria:**
- [ ] 100% key parity with en.json
- [ ] All accent marks correct: é, è, ê, ë, à, â, ç, ô, î, û, ù
- [ ] Consistent formal "vous" register throughout
- [ ] Proper French quotation marks «» where applicable
- [ ] Gender agreement for past participles and adjectives
- [ ] All ICU placeholders preserved exactly

**File to Modify:** `/messages/fr.json`

**Language-Specific Guidelines:**
- Formal "vous" register (professional context)
- Proper accent marks: créer, propriété, activité, récent
- Use "Code QR" for QR Code
- Use "Article" for Item
- Watch for masculine/feminine agreement

**Key Translations to Verify:**
```json
{
  "common.create": "Créer",
  "common.success": "Succès",
  "auth.forgotPassword": "Mot de passe oublié ?",
  "dashboard.recentActivity": "Activité récente",
  "items.selectProperty": "Sélectionner une propriété",
  "errors.validationFailed": "Échec de la validation. Veuillez vérifier vos données."
}
```

---

### Task 2H.10.4: Update German (de.json) Translations

**Description:** Review and fix all German translations for accuracy, proper umlauts, and consistency.

**Story Points:** 2

**Acceptance Criteria:**
- [ ] 100% key parity with en.json
- [ ] All umlauts and Eszett correct: ä, ö, ü, ß
- [ ] All nouns capitalized (German convention)
- [ ] Consistent formal "Sie" register throughout
- [ ] Compound words formed appropriately
- [ ] All ICU placeholders preserved exactly

**File to Modify:** `/messages/de.json`

**Language-Specific Guidelines:**
- Formal "Sie" register (professional context)
- Capitalize ALL nouns: Artikel, Eigenschaft, Fehler
- Use "QR-Code" for QR Code (with hyphen)
- Watch for compound word formations
- Use ß where appropriate (groß, Passwort)

**Key Translations to Verify:**
```json
{
  "common.loading": "Wird geladen...",
  "common.required": "Erforderlich",
  "auth.password": "Passwort",
  "auth.forgotPassword": "Passwort vergessen?",
  "dashboard.properties": "Eigenschaften",
  "errors.fileTooLarge": "Datei ist zu groß"
}
```

---

### Task 2H.10.5: Update Italian (it.json) Translations

**Description:** Review and fix all Italian translations for accuracy, proper accents, and consistency.

**Story Points:** 2

**Acceptance Criteria:**
- [ ] 100% key parity with en.json
- [ ] All accent marks correct: à, è, é, ì, ò, ù
- [ ] Consistent formal "Lei" register throughout
- [ ] Gender agreement for nouns and adjectives
- [ ] Proper preposition contractions (nell', dell', etc.)
- [ ] All ICU placeholders preserved exactly

**File to Modify:** `/messages/it.json`

**Language-Specific Guidelines:**
- Formal "Lei" register (professional context)
- Proper accent placement: proprietà, attività, già
- Use "Codice QR" for QR Code
- Use "Articolo" for Item
- Watch for masculine/feminine agreement

**Key Translations to Verify:**
```json
{
  "common.success": "Successo",
  "common.required": "Obbligatorio",
  "auth.forgotPassword": "Hai dimenticato la password?",
  "dashboard.recentActivity": "Attività recente",
  "items.selectProperty": "Seleziona proprietà",
  "errors.sessionExpired": "La sessione è scaduta. Effettua nuovamente l'accesso."
}
```

---

### Task 2H.10.6: Update Dutch (nl.json) Translations

**Description:** Review and fix all Dutch translations for accuracy and consistency.

**Story Points:** 2

**Acceptance Criteria:**
- [ ] 100% key parity with en.json
- [ ] Dutch spelling conventions (ij digraph, compound words)
- [ ] Consistent formal "u" register throughout
- [ ] Correct de/het article usage
- [ ] All ICU placeholders preserved exactly

**File to Modify:** `/messages/nl.json`

**Language-Specific Guidelines:**
- Formal "u" register (professional context)
- Use "QR-code" for QR Code
- Watch for compound word formation rules
- Proper de/het article agreement
- Dutch-specific: "item" is commonly used as-is

**Key Translations to Verify:**
```json
{
  "common.loading": "Laden...",
  "common.required": "Verplicht",
  "auth.forgotPassword": "Wachtwoord vergeten?",
  "auth.continueWithGoogle": "Doorgaan met Google",
  "dashboard.properties": "Eigenschappen",
  "errors.networkError": "Netwerkfout. Probeer het opnieuw."
}
```

---

### Task 2H.10.7: Validate Key Parity Across All Files

**Description:** Run automated validation to ensure all translation files have identical key structures.

**Story Points:** 1

**Acceptance Criteria:**
- [ ] All 6 files have identical nested key structure
- [ ] No missing keys in any non-English file
- [ ] No extra/orphaned keys in any file
- [ ] JSON syntax valid in all files

**Validation Script:**
```bash
# Compare key structures
node -e "
const en = require('./messages/en.json');
const langs = ['es', 'fr', 'de', 'it', 'nl'];

function flattenKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return [...acc, ...flattenKeys(obj[key], newKey)];
    }
    return [...acc, newKey];
  }, []);
}

const enKeys = flattenKeys(en).sort();
console.log('English keys:', enKeys.length);

langs.forEach(lang => {
  const file = require(\`./messages/\${lang}.json\`);
  const keys = flattenKeys(file).sort();
  const missing = enKeys.filter(k => !keys.includes(k));
  const extra = keys.filter(k => !enKeys.includes(k));
  console.log(\`\${lang}: \${keys.length} keys, missing: \${missing.length}, extra: \${extra.length}\`);
  if (missing.length) console.log('  Missing:', missing);
  if (extra.length) console.log('  Extra:', extra);
});
"
```

---

### Task 2H.10.8: Validate ICU Placeholder Preservation

**Description:** Verify all variable interpolation placeholders are preserved correctly in translations.

**Story Points:** 1

**Acceptance Criteria:**
- [ ] All `{variable}` placeholders present in translations
- [ ] All `{count, plural, ...}` patterns preserved
- [ ] No modified or corrupted placeholder syntax
- [ ] Placeholder names match exactly (case-sensitive)

**Placeholder Patterns to Check:**
```
{name} - User name interpolation
{count} - Numeric count for pluralization
{current} / {total} - Pagination values
{start} / {end} - Range values
{min} / {max} - Validation limits
```

---

### Task 2H.10.9: Character Encoding Verification

**Description:** Verify UTF-8 encoding and special characters render correctly.

**Story Points:** 1

**Acceptance Criteria:**
- [ ] All files saved as UTF-8 without BOM
- [ ] Spanish: á, é, í, ó, ú, ñ, ü, ¿, ¡ render correctly
- [ ] French: é, è, ê, ë, à, â, ç, ô, î, û, ù, «, » render correctly
- [ ] German: ä, ö, ü, ß render correctly
- [ ] Italian: à, è, é, ì, ò, ù render correctly
- [ ] No mojibake (garbled characters) in any file

**Verification Command:**
```bash
# Check file encoding
file -I messages/*.json

# Verify specific characters are present
grep -l "ñ" messages/es.json
grep -l "ß" messages/de.json
grep -l "ç" messages/fr.json
```

---

### Task 2H.10.10: Application Build Verification

**Description:** Verify the application builds successfully with updated translation files.

**Story Points:** 1

**Acceptance Criteria:**
- [ ] `npm run build` completes without errors
- [ ] No translation-related warnings in build output
- [ ] Application starts successfully in dev mode
- [ ] Language switching works on test page

**Commands:**
```bash
npm run build
npm run dev
```

---

### Task 2H.10.11: Visual Language Verification

**Description:** Manually verify each language displays correctly in the UI.

**Story Points:** 2

**Acceptance Criteria:**
- [ ] Spanish UI displays all translations without English fallback
- [ ] French UI displays all translations without English fallback
- [ ] German UI displays all translations without English fallback
- [ ] Italian UI displays all translations without English fallback
- [ ] Dutch UI displays all translations without English fallback
- [ ] No text overflow or layout breaks in any language
- [ ] Accents and special characters render correctly in browser

**Test Pages:**
1. Login page (`/login`)
2. Dashboard (`/dashboard2`)
3. Items list (if accessible)
4. Language switcher component

---

### Task 2H.10.12: Document Translation Metadata

**Description:** Document the translation process, sources, and quality assurance status.

**Story Points:** 1

**Acceptance Criteria:**
- [ ] Translation source documented (manual review/AI-assisted)
- [ ] Generation date recorded
- [ ] Quality review status noted per language
- [ ] Known issues or limitations documented
- [ ] Terminology glossary updated

**Documentation to Update:**
- Add metadata comment or separate changelog
- Update any existing i18n documentation

---

## File Change Summary

### Files to Modify

| File | Action | Key Changes |
|------|--------|-------------|
| `/messages/es.json` | Update | Add proper accents, verify consistency |
| `/messages/fr.json` | Update | Add proper accents, formal register |
| `/messages/de.json` | Update | Add umlauts/Eszett, capitalize nouns |
| `/messages/it.json` | Update | Add proper accents, formal register |
| `/messages/nl.json` | Update | Verify spelling, formal register |

### Files to Read (Reference Only)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source of truth for all keys |
| `/src/lib/i18n/config.ts` | Locale configuration reference |
| `/src/lib/translation-service/` | Translation service for future automated use |

---

## Terminology Glossary

Maintain consistent translations for key terms:

| English | Spanish | French | German | Italian | Dutch |
|---------|---------|--------|--------|---------|-------|
| Property | Propiedad | Propriété | Eigenschaft | Proprietà | Eigendom |
| Item | Artículo | Article | Artikel | Articolo | Item |
| QR Code | Código QR | Code QR | QR-Code | Codice QR | QR-code |
| Dashboard | Panel de control | Tableau de bord | Dashboard | Dashboard | Dashboard |
| Tag | Etiqueta | Étiquette | Tag | Tag | Tag |
| Room | Habitación | Pièce | Raum | Stanza | Kamer |
| Scan | Escaneo | Scan | Scan | Scansione | Scan |
| Upload | Subir | Envoyer | Hochladen | Caricare | Uploaden |
| Download | Descargar | Télécharger | Herunterladen | Scaricare | Downloaden |
| Settings | Configuración | Paramètres | Einstellungen | Impostazioni | Instellingen |

---

## Formality Register Reference

| Language | Register | Form | Example |
|----------|----------|------|---------|
| Spanish | Informal | tú | "¿No tienes una cuenta?" |
| French | Formal | vous | "Vous n'avez pas de compte ?" |
| German | Formal | Sie | "Haben Sie kein Konto?" |
| Italian | Formal | Lei | "Non hai un account?" |
| Dutch | Formal | u | "Heeft u geen account?" |

---

## Success Criteria Summary

- [ ] All 5 non-English translation files updated
- [ ] 100% key parity with English source
- [ ] All accents and diacritical marks correct
- [ ] Consistent formality register per language
- [ ] All ICU placeholders preserved
- [ ] UTF-8 encoding verified
- [ ] Application builds without errors
- [ ] Visual verification in browser complete
- [ ] No English fallback strings visible
- [ ] Translation metadata documented

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing accents/diacriticals | High | Low | Character-by-character review |
| Inconsistent formality | Medium | Medium | Document and enforce register rules |
| ICU syntax broken | Low | High | Automated placeholder validation |
| Build failures | Low | High | Run build after each file update |
| Browser rendering issues | Low | Medium | Test in multiple browsers |

---

## Estimated Effort

| Task | Story Points | Estimate |
|------|--------------|----------|
| 2H.10.1: Audit | 1 | 30 min |
| 2H.10.2: Spanish | 2 | 1 hour |
| 2H.10.3: French | 2 | 1 hour |
| 2H.10.4: German | 2 | 1 hour |
| 2H.10.5: Italian | 2 | 1 hour |
| 2H.10.6: Dutch | 2 | 1 hour |
| 2H.10.7: Key Parity | 1 | 30 min |
| 2H.10.8: Placeholder | 1 | 30 min |
| 2H.10.9: Encoding | 1 | 15 min |
| 2H.10.10: Build | 1 | 30 min |
| 2H.10.11: Visual | 2 | 1 hour |
| 2H.10.12: Document | 1 | 30 min |
| **Total** | **18** | **~8-9 hours** |

---

## Dependencies

### Predecessor Tasks
- All Epic 2 string extraction tasks (2A-2J extraction phases)
- REQ-346: Common namespace translation (subset - may overlap)

### Parallel Tasks
- None - this is a translation finalization task

### Successor Tasks
- Visual QA across all pages
- Native speaker review (if planned)
- Production deployment

---

## Notes

### Translation Quality Guidelines

1. **Accuracy**: Translations must convey exact meaning of source
2. **Consistency**: Same term translates identically throughout
3. **Context**: UI context preserved (button labels concise, error messages helpful)
4. **Tone**: Professional but approachable
5. **Grammar**: Correct gender, plurals, conjugations

### Future Maintenance

As new strings are added to `en.json`:
1. Add corresponding keys to all 5 non-English files
2. Follow established terminology glossary
3. Maintain formality register
4. Run key parity validation before deployment

---

*Document generated for FAQBNB REQ-347 - Epic 2H.10 Translation Generation Task*
