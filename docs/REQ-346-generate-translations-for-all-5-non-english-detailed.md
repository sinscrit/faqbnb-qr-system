# REQ-346: Generate Translations for All 5 Non-English Languages - Detailed Task Breakdown

*Generated: 2026-01-19 21:45:00 UTC*
*Last Modified: 2026-01-19 21:45:00 UTC*

## Reference

- **Request**: REQ-346 (Generate Translations for All Non-English Common Namespace Keys)
- **Overview Document**: docs/REQ-346-generate-translations-for-all-5-non-english-overview.md
- **Source Requirements**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature (Translation Generation)
- **Epic**: 2 - Static UI Translation
- **Sub-Epic**: 2H - Common & Shared Components
- **Task ID**: 2H.10
- **Size**: L (Large)
- **Priority**: Foundation Completion Task

---

## Executive Summary

This task generates complete, high-quality translations for all keys in the common namespace structure across 5 target languages: Spanish (es), French (fr), German (de), Italian (it), and Dutch (nl). The English source (`/messages/en.json`) contains approximately 123 keys across 6 namespaces (common, auth, dashboard, items, errors, language) that must be translated with accuracy, cultural appropriateness, and consistent formality.

---

## Prerequisites

Before starting this task, verify the following:

- [x] `/messages/en.json` contains complete English source strings (~123 keys)
- [x] Non-English translation files exist: `es.json`, `fr.json`, `de.json`, `it.json`, `nl.json`
- [x] Translation service infrastructure available at `/src/lib/translation-service/`
- [x] i18n configuration complete at `/src/lib/i18n/config.ts`
- [x] Tasks 2H.1-2H.9 complete (string extraction to common namespace)

---

## Current State Analysis

### English Source Keys Structure

| Namespace | Key Count | Categories |
|-----------|-----------|------------|
| `common` | 33 | Action buttons, status, UI labels |
| `auth` | 19 | Login, logout, registration |
| `dashboard` | 18 | Navigation, statistics, actions |
| `items` | 26 | Item management, QR codes |
| `errors` | 17 | Validation, API, network errors |
| `language` | 10 | Language selection, names |
| **Total** | **123** | |

### Current Non-English File Status

Based on codebase inspection, translation files have partial translations but need quality review:

| Language | File | Current State | Quality Issues |
|----------|------|---------------|----------------|
| Spanish | `es.json` | ~123 keys exist | Missing proper accents (á, é, í, ó, ú, ñ) |
| French | `fr.json` | ~123 keys exist | Missing accents (é, è, ê, ç, à), formality inconsistent |
| German | `de.json` | ~123 keys exist | Missing umlauts (ä, ö, ü, ß), capitalization issues |
| Italian | `it.json` | ~123 keys exist | Missing accents (à, è, é, ì, ò, ù) |
| Dutch | `nl.json` | ~123 keys exist | Minor spelling/convention issues |

---

## Task Breakdown

### Task 1: Audit English Source and Create Translation Glossary
**Size**: S (Small) | **Estimated Effort**: 30 minutes

#### Description
Audit all keys in `/messages/en.json` and create a terminology glossary to ensure consistent translations across languages.

#### Steps
1. Read and catalog all keys in `/messages/en.json`
2. Identify domain-specific terms requiring consistent translation
3. Create glossary mapping for key terms across all 6 languages
4. Document formality level decisions for each language

#### Files to Modify
- None (read-only audit)

#### Files to Create
- None (glossary documented in this task output)

#### Acceptance Criteria
- [ ] All 123 English keys cataloged by namespace
- [ ] Domain terminology glossary defined (Property, Item, QR Code, Dashboard, Tag, Scan)
- [ ] Formality decisions documented (formal: fr-vous, de-Sie, it-Lei, nl-u; informal: es-tú)

#### Verification
```bash
# Count total keys in en.json
cat messages/en.json | jq 'paths(scalars) | length'
# Expected: 123 (approximately)
```

#### Glossary (for reference during translation)

| English | Spanish (es) | French (fr) | German (de) | Italian (it) | Dutch (nl) |
|---------|--------------|-------------|-------------|--------------|------------|
| Property | Propiedad | Propriété | Immobilie | Proprietà | Eigendom |
| Item | Artículo | Article | Artikel | Articolo | Item |
| QR Code | Código QR | Code QR | QR-Code | Codice QR | QR-code |
| Dashboard | Panel de control | Tableau de bord | Dashboard | Dashboard | Dashboard |
| Tag | Etiqueta | Étiquette | Tag | Tag | Tag |
| Scan | Escaneo | Scan | Scan | Scansione | Scan |
| Settings | Configuración | Paramètres | Einstellungen | Impostazioni | Instellingen |
| Sign In | Iniciar sesión | Se connecter | Anmelden | Accedi | Inloggen |
| Sign Out | Cerrar sesión | Se déconnecter | Abmelden | Esci | Uitloggen |

---

### Task 2: Generate Spanish (es.json) Translations with Quality Review
**Size**: M (Medium) | **Estimated Effort**: 45 minutes

#### Description
Review and correct all translations in `/messages/es.json`, ensuring proper accents, consistent informal register (tú), and accurate terminology.

#### Steps
1. Read current `/messages/es.json` content
2. Review each key for:
   - Correct accent marks (á, é, í, ó, ú, ñ, ü)
   - Consistent informal register (tú/tu/te forms)
   - Latin American neutral Spanish (understood across regions)
   - Domain terminology consistency per glossary
3. Correct any missing or incorrect translations
4. Validate JSON syntax

#### Files to Modify
- `/messages/es.json`

#### Key Translation Standards for Spanish
- **Register**: Informal "tú" (standard in tech applications)
- **Character Set**: Full UTF-8 with accents: á, é, í, ó, ú, ñ, ü
- **Regional Variant**: Latin American neutral

#### Translation Corrections Required
Based on current file analysis:

| Key | Current Value | Corrected Value |
|-----|--------------|-----------------|
| `common.success` | "Exito" | "Éxito" |
| `common.back` | "Atras" | "Atrás" |
| `common.yes` | "Si" | "Sí" |
| `common.more` | "Mas" | "Más" |
| `auth.email` | "Correo electronico" | "Correo electrónico" |
| `auth.password` | "Contrasena" | "Contraseña" |
| `auth.forgotPassword` | "Olvidaste tu contrasena?" | "¿Olvidaste tu contraseña?" |
| `dashboard.analytics` | "Analiticas" | "Analíticas" |
| `dashboard.settings` | "Configuracion" | "Configuración" |
| `dashboard.quickActions` | "Acciones rapidas" | "Acciones rápidas" |
| `items.description` | "Descripcion" | "Descripción" |
| `items.room` | "Habitacion" | "Habitación" |
| `errors.invalidEmail` | (check) | "Dirección de correo electrónico inválida" |

#### Acceptance Criteria
- [ ] All 123 keys have Spanish translations
- [ ] All accent marks present (á, é, í, ó, ú, ñ)
- [ ] Question marks properly inverted (¿...?)
- [ ] Consistent informal register (tú)
- [ ] JSON file validates without syntax errors

#### Verification
```bash
# Validate JSON syntax
cat messages/es.json | jq . > /dev/null && echo "Valid JSON"

# Check for missing accents (sample check)
grep -E '"[^"]*[aeiou][^"]*"' messages/es.json | grep -v '[áéíóúñü]'
```

---

### Task 3: Generate French (fr.json) Translations with Quality Review
**Size**: M (Medium) | **Estimated Effort**: 45 minutes

#### Description
Review and correct all translations in `/messages/fr.json`, ensuring proper accents, formal register (vous), and correct gender agreement.

#### Steps
1. Read current `/messages/fr.json` content
2. Review each key for:
   - Correct accent marks (é, è, ê, ë, à, â, ç, ô, î, û, ù)
   - Consistent formal register (vous/votre/vos)
   - Proper gender agreement for adjectives
   - French spacing rules (space before : ; ? !)
3. Correct any missing or incorrect translations
4. Validate JSON syntax

#### Files to Modify
- `/messages/fr.json`

#### Key Translation Standards for French
- **Register**: Formal "vous" (professional application context)
- **Character Set**: Full UTF-8 with accents: é, è, ê, ë, à, â, ç, ô, î, û, ù
- **Punctuation**: French spacing (thin space before : ; ? !)
- **Gender**: Verify adjective agreement

#### Translation Reference

| Key | English | French |
|-----|---------|--------|
| `common.save` | Save | Enregistrer |
| `common.cancel` | Cancel | Annuler |
| `common.delete` | Delete | Supprimer |
| `common.edit` | Edit | Modifier |
| `common.create` | Create | Créer |
| `common.loading` | Loading... | Chargement... |
| `common.error` | Error | Erreur |
| `common.success` | Success | Succès |
| `common.confirm` | Confirm | Confirmer |
| `common.search` | Search | Rechercher |
| `auth.signIn` | Sign In | Se connecter |
| `auth.signOut` | Sign Out | Se déconnecter |
| `auth.forgotPassword` | Forgot Password? | Mot de passe oublié ? |
| `auth.confirmSignOutMessage` | Are you sure you want to sign out? | Êtes-vous sûr de vouloir vous déconnecter ? |
| `dashboard.title` | Dashboard | Tableau de bord |
| `dashboard.welcome` | Welcome back | Bienvenue |
| `errors.required` | This field is required | Ce champ est obligatoire |
| `errors.invalidEmail` | Invalid email address | Adresse e-mail invalide |

#### Acceptance Criteria
- [ ] All 123 keys have French translations
- [ ] All accent marks present (é, è, ê, ç, à, etc.)
- [ ] Consistent formal register (vous)
- [ ] French punctuation spacing applied
- [ ] Gender agreement correct
- [ ] JSON file validates without syntax errors

#### Verification
```bash
# Validate JSON syntax
cat messages/fr.json | jq . > /dev/null && echo "Valid JSON"

# Check key count matches en.json
EN_KEYS=$(cat messages/en.json | jq 'paths(scalars) | length')
FR_KEYS=$(cat messages/fr.json | jq 'paths(scalars) | length')
[ "$EN_KEYS" -eq "$FR_KEYS" ] && echo "Key counts match"
```

---

### Task 4: Generate German (de.json) Translations with Quality Review
**Size**: M (Medium) | **Estimated Effort**: 45 minutes

#### Description
Review and correct all translations in `/messages/de.json`, ensuring proper umlauts, formal register (Sie), and correct noun capitalization.

#### Steps
1. Read current `/messages/de.json` content
2. Review each key for:
   - Correct umlauts and eszett (ä, ö, ü, ß)
   - Consistent formal register (Sie/Ihr/Ihnen)
   - Proper noun capitalization (all nouns capitalized in German)
   - Compound word formation where appropriate
3. Correct any missing or incorrect translations
4. Validate JSON syntax

#### Files to Modify
- `/messages/de.json`

#### Key Translation Standards for German
- **Register**: Formal "Sie" (professional application context)
- **Character Set**: Full UTF-8 with umlauts: ä, ö, ü, ß
- **Capitalization**: All nouns capitalized
- **Compounds**: Compound words where grammatically correct

#### Translation Reference

| Key | English | German |
|-----|---------|--------|
| `common.save` | Save | Speichern |
| `common.cancel` | Cancel | Abbrechen |
| `common.delete` | Delete | Löschen |
| `common.edit` | Edit | Bearbeiten |
| `common.create` | Create | Erstellen |
| `common.loading` | Loading... | Wird geladen... |
| `common.error` | Error | Fehler |
| `common.success` | Success | Erfolg |
| `common.confirm` | Confirm | Bestätigen |
| `common.search` | Search | Suchen |
| `common.required` | Required | Erforderlich |
| `common.optional` | Optional | Optional |
| `auth.signIn` | Sign In | Anmelden |
| `auth.signOut` | Sign Out | Abmelden |
| `auth.email` | Email | E-Mail |
| `auth.password` | Password | Passwort |
| `auth.forgotPassword` | Forgot Password? | Passwort vergessen? |
| `auth.confirmSignOutMessage` | Are you sure you want to sign out? | Sind Sie sicher, dass Sie sich abmelden möchten? |
| `dashboard.title` | Dashboard | Dashboard |
| `dashboard.welcome` | Welcome back | Willkommen zurück |
| `dashboard.settings` | Settings | Einstellungen |
| `dashboard.properties` | Properties | Immobilien |
| `items.qrCode` | QR Code | QR-Code |
| `errors.required` | This field is required | Dieses Feld ist erforderlich |
| `errors.invalidEmail` | Invalid email address | Ungültige E-Mail-Adresse |
| `errors.sessionExpired` | Your session has expired. Please sign in again. | Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an. |

#### Acceptance Criteria
- [ ] All 123 keys have German translations
- [ ] All umlauts present (ä, ö, ü, ß)
- [ ] Consistent formal register (Sie)
- [ ] All nouns properly capitalized
- [ ] Compound words correctly formed
- [ ] JSON file validates without syntax errors

#### Verification
```bash
# Validate JSON syntax
cat messages/de.json | jq . > /dev/null && echo "Valid JSON"

# Check for proper umlaut usage
grep -E 'ü|ö|ä|ß' messages/de.json | wc -l
```

---

### Task 5: Generate Italian (it.json) Translations with Quality Review
**Size**: M (Medium) | **Estimated Effort**: 45 minutes

#### Description
Review and correct all translations in `/messages/it.json`, ensuring proper accents, formal register (Lei), and correct gender agreement.

#### Steps
1. Read current `/messages/it.json` content
2. Review each key for:
   - Correct accent marks (à, è, é, ì, ò, ù)
   - Consistent formal register (Lei/Suo/Sua)
   - Proper gender agreement for articles and adjectives
   - Natural Italian phrasing
3. Correct any missing or incorrect translations
4. Validate JSON syntax

#### Files to Modify
- `/messages/it.json`

#### Key Translation Standards for Italian
- **Register**: Formal "Lei" (professional application context)
- **Character Set**: Full UTF-8 with accents: à, è, é, ì, ò, ù
- **Gender**: Verify article and adjective agreement
- **Articles**: Proper use of definite/indefinite articles

#### Translation Reference

| Key | English | Italian |
|-----|---------|---------|
| `common.save` | Save | Salva |
| `common.cancel` | Cancel | Annulla |
| `common.delete` | Delete | Elimina |
| `common.edit` | Edit | Modifica |
| `common.create` | Create | Crea |
| `common.loading` | Loading... | Caricamento... |
| `common.error` | Error | Errore |
| `common.success` | Success | Successo |
| `common.confirm` | Confirm | Conferma |
| `common.search` | Search | Cerca |
| `common.yes` | Yes | Sì |
| `common.no` | No | No |
| `auth.signIn` | Sign In | Accedi |
| `auth.signOut` | Sign Out | Esci |
| `auth.email` | Email | E-mail |
| `auth.password` | Password | Password |
| `auth.forgotPassword` | Forgot Password? | Password dimenticata? |
| `auth.confirmSignOutMessage` | Are you sure you want to sign out? | È sicuro di voler uscire? |
| `dashboard.title` | Dashboard | Dashboard |
| `dashboard.welcome` | Welcome back | Bentornato |
| `dashboard.settings` | Settings | Impostazioni |
| `dashboard.properties` | Properties | Proprietà |
| `items.qrCode` | QR Code | Codice QR |
| `errors.required` | This field is required | Questo campo è obbligatorio |
| `errors.invalidEmail` | Invalid email address | Indirizzo e-mail non valido |

#### Acceptance Criteria
- [ ] All 123 keys have Italian translations
- [ ] All accent marks present (à, è, é, ì, ò, ù)
- [ ] Consistent formal register (Lei)
- [ ] Gender agreement correct
- [ ] JSON file validates without syntax errors

#### Verification
```bash
# Validate JSON syntax
cat messages/it.json | jq . > /dev/null && echo "Valid JSON"

# Check for proper accent usage
grep -E 'à|è|é|ì|ò|ù' messages/it.json | wc -l
```

---

### Task 6: Generate Dutch (nl.json) Translations with Quality Review
**Size**: M (Medium) | **Estimated Effort**: 45 minutes

#### Description
Review and correct all translations in `/messages/nl.json`, ensuring proper spelling, formal register (u), and Dutch conventions.

#### Steps
1. Read current `/messages/nl.json` content
2. Review each key for:
   - Correct Dutch spelling conventions (ij digraph, etc.)
   - Consistent formal register (u/uw)
   - Proper compound word formation
   - Natural Dutch phrasing
3. Correct any missing or incorrect translations
4. Validate JSON syntax

#### Files to Modify
- `/messages/nl.json`

#### Key Translation Standards for Dutch
- **Register**: Formal "u" (professional application context)
- **Character Set**: Standard ASCII plus Dutch conventions
- **Compounds**: Compound words written as single words
- **ij Digraph**: Proper use of ij (sometimes capitalized as IJ)

#### Translation Reference

| Key | English | Dutch |
|-----|---------|-------|
| `common.save` | Save | Opslaan |
| `common.cancel` | Cancel | Annuleren |
| `common.delete` | Delete | Verwijderen |
| `common.edit` | Edit | Bewerken |
| `common.create` | Create | Aanmaken |
| `common.loading` | Loading... | Laden... |
| `common.error` | Error | Fout |
| `common.success` | Success | Succes |
| `common.confirm` | Confirm | Bevestigen |
| `common.search` | Search | Zoeken |
| `common.yes` | Yes | Ja |
| `common.no` | No | Nee |
| `common.back` | Back | Terug |
| `common.next` | Next | Volgende |
| `auth.signIn` | Sign In | Inloggen |
| `auth.signOut` | Sign Out | Uitloggen |
| `auth.email` | Email | E-mail |
| `auth.password` | Password | Wachtwoord |
| `auth.forgotPassword` | Forgot Password? | Wachtwoord vergeten? |
| `auth.confirmSignOutMessage` | Are you sure you want to sign out? | Weet u zeker dat u wilt uitloggen? |
| `dashboard.title` | Dashboard | Dashboard |
| `dashboard.welcome` | Welcome back | Welkom terug |
| `dashboard.settings` | Settings | Instellingen |
| `dashboard.properties` | Properties | Eigendommen |
| `items.qrCode` | QR Code | QR-code |
| `errors.required` | This field is required | Dit veld is verplicht |
| `errors.invalidEmail` | Invalid email address | Ongeldig e-mailadres |

#### Acceptance Criteria
- [ ] All 123 keys have Dutch translations
- [ ] Consistent formal register (u)
- [ ] Dutch spelling conventions followed
- [ ] Compound words correctly formed
- [ ] JSON file validates without syntax errors

#### Verification
```bash
# Validate JSON syntax
cat messages/nl.json | jq . > /dev/null && echo "Valid JSON"

# Verify key count matches English
EN_KEYS=$(cat messages/en.json | jq 'paths(scalars) | length')
NL_KEYS=$(cat messages/nl.json | jq 'paths(scalars) | length')
[ "$EN_KEYS" -eq "$NL_KEYS" ] && echo "Key counts match"
```

---

### Task 7: Cross-Language Validation and Key Parity Check
**Size**: S (Small) | **Estimated Effort**: 30 minutes

#### Description
Validate that all 6 language files have identical key structures and proper JSON formatting.

#### Steps
1. Extract all keys from each language file
2. Compare key sets to identify missing or extra keys
3. Validate JSON syntax for all files
4. Verify character encoding (UTF-8) is correct

#### Files to Validate (Read-Only)
- `/messages/en.json`
- `/messages/es.json`
- `/messages/fr.json`
- `/messages/de.json`
- `/messages/it.json`
- `/messages/nl.json`

#### Validation Script
```bash
#!/bin/bash
# Validate all translation files

LANGS=("en" "es" "fr" "de" "it" "nl")
BASE_KEYS=$(cat messages/en.json | jq -r 'paths(scalars) | join(".")' | sort)
BASE_COUNT=$(echo "$BASE_KEYS" | wc -l)

echo "English (source): $BASE_COUNT keys"
echo "---"

for lang in "${LANGS[@]}"; do
  if [ "$lang" != "en" ]; then
    # Validate JSON
    if ! cat "messages/$lang.json" | jq . > /dev/null 2>&1; then
      echo "❌ $lang.json: Invalid JSON syntax"
      continue
    fi

    # Count keys
    LANG_KEYS=$(cat "messages/$lang.json" | jq -r 'paths(scalars) | join(".")' | sort)
    LANG_COUNT=$(echo "$LANG_KEYS" | wc -l)

    # Find missing keys
    MISSING=$(comm -23 <(echo "$BASE_KEYS") <(echo "$LANG_KEYS"))
    MISSING_COUNT=$(echo "$MISSING" | grep -c . || echo 0)

    # Find extra keys
    EXTRA=$(comm -13 <(echo "$BASE_KEYS") <(echo "$LANG_KEYS"))
    EXTRA_COUNT=$(echo "$EXTRA" | grep -c . || echo 0)

    if [ "$MISSING_COUNT" -eq 0 ] && [ "$EXTRA_COUNT" -eq 0 ]; then
      echo "✅ $lang.json: $LANG_COUNT keys (match)"
    else
      echo "⚠️  $lang.json: $LANG_COUNT keys (missing: $MISSING_COUNT, extra: $EXTRA_COUNT)"
      if [ "$MISSING_COUNT" -gt 0 ]; then
        echo "   Missing: $MISSING"
      fi
    fi
  fi
done
```

#### Acceptance Criteria
- [ ] All 6 JSON files have valid syntax
- [ ] All 5 non-English files have exactly the same keys as en.json
- [ ] No extra keys exist in any non-English file
- [ ] No missing keys exist in any non-English file
- [ ] All files use UTF-8 encoding

#### Verification
```bash
# Quick key count comparison
for f in messages/*.json; do echo "$f: $(jq 'paths(scalars) | length' $f) keys"; done
```

---

### Task 8: Placeholder and ICU Format Validation
**Size**: S (Small) | **Estimated Effort**: 20 minutes

#### Description
Validate that all variable placeholders and ICU format patterns are preserved correctly in translations.

#### Steps
1. Extract all placeholder patterns from English source
2. Verify identical placeholders exist in all translations
3. Check ICU pluralization syntax is preserved
4. Verify no placeholders were translated or modified

#### Placeholder Patterns to Validate
- Variable interpolation: `{variable}` format
- Pluralization: `{count, plural, one {...} other {...}}`
- Select: `{gender, select, male {...} female {...} other {...}}`

#### Files to Validate (Read-Only)
- All `/messages/*.json` files

#### Validation Logic
```typescript
// Pseudo-code for placeholder validation
function extractPlaceholders(text: string): string[] {
  return text.match(/\{[^}]+\}/g) || [];
}

function validatePlaceholders(en: string, translated: string): boolean {
  const enPlaceholders = extractPlaceholders(en).sort();
  const translatedPlaceholders = extractPlaceholders(translated).sort();
  return JSON.stringify(enPlaceholders) === JSON.stringify(translatedPlaceholders);
}
```

#### Acceptance Criteria
- [ ] All `{variable}` placeholders preserved in translations
- [ ] ICU pluralization patterns (`{count, plural, ...}`) preserved
- [ ] No placeholders accidentally translated
- [ ] Placeholder names match exactly between languages

---

### Task 9: Character Encoding and Diacritical Mark Validation
**Size**: S (Small) | **Estimated Effort**: 15 minutes

#### Description
Validate proper UTF-8 encoding and presence of required diacritical marks in each language.

#### Steps
1. Check UTF-8 encoding declaration
2. Verify presence of language-specific characters
3. Ensure no encoding artifacts (mojibake)

#### Expected Characters by Language

| Language | Required Characters |
|----------|---------------------|
| Spanish | á, é, í, ó, ú, ñ, ü, ¿, ¡ |
| French | é, è, ê, ë, à, â, ç, ô, î, û, ù, œ, æ |
| German | ä, ö, ü, ß |
| Italian | à, è, é, ì, ò, ù |
| Dutch | Standard ASCII (ij digraph) |

#### Validation Commands
```bash
# Check file encoding
file -i messages/*.json

# Check for Spanish accents
grep -oE '[áéíóúñü¿¡]' messages/es.json | sort | uniq -c

# Check for French accents
grep -oE '[éèêëàâçôîûùœæ]' messages/fr.json | sort | uniq -c

# Check for German umlauts
grep -oE '[äöüß]' messages/de.json | sort | uniq -c

# Check for Italian accents
grep -oE '[àèéìòù]' messages/it.json | sort | uniq -c
```

#### Acceptance Criteria
- [ ] All files encoded as UTF-8
- [ ] Spanish file contains required accents (á, é, í, ó, ú, ñ)
- [ ] French file contains required accents (é, è, ê, ç, à)
- [ ] German file contains umlauts (ä, ö, ü) and eszett (ß)
- [ ] Italian file contains required accents (à, è, é, ì, ò, ù)
- [ ] No encoding artifacts or corrupted characters

---

### Task 10: Functional Application Testing
**Size**: M (Medium) | **Estimated Effort**: 30 minutes

#### Description
Test the application loads and displays translations correctly for each language.

#### Steps
1. Start application in development mode
2. Switch to each supported language
3. Verify common UI elements display correctly
4. Check for missing translation warnings in console
5. Verify no layout overflow issues from longer translations

#### Test Pages
- `/login` - Login page with auth translations
- `/dashboard2` - Dashboard with dashboard/items translations
- Language switcher component

#### Test Scenarios

| Scenario | Languages | Expected Outcome |
|----------|-----------|------------------|
| Login page loads | All 6 | No missing translation warnings |
| Sign Out button displays | All 6 | Correct translation shown |
| Dashboard stats display | All 6 | Numbers + translated labels |
| Error messages display | All 6 | Translated error text |
| Language switcher | All 6 | Language names in native form |

#### Console Check
```bash
# Run dev server and check for translation warnings
npm run dev 2>&1 | grep -i "translation\|missing\|intl"
```

#### Acceptance Criteria
- [ ] Application starts without i18n-related errors
- [ ] No "missing translation" warnings in browser console
- [ ] All common UI elements display translated text
- [ ] Language switching works correctly
- [ ] No UI layout breaks from text length differences

---

## Summary Checklist

### Translation Completeness
- [ ] All 123 keys in en.json have translations in es.json
- [ ] All 123 keys in en.json have translations in fr.json
- [ ] All 123 keys in en.json have translations in de.json
- [ ] All 123 keys in en.json have translations in it.json
- [ ] All 123 keys in en.json have translations in nl.json

### Translation Quality
- [ ] Spanish: Proper accents, informal register (tú)
- [ ] French: Proper accents, formal register (vous), gender agreement
- [ ] German: Proper umlauts, formal register (Sie), noun capitalization
- [ ] Italian: Proper accents, formal register (Lei), gender agreement
- [ ] Dutch: Proper spelling, formal register (u), compound words

### Technical Validation
- [ ] All 6 JSON files have valid syntax
- [ ] All placeholder variables preserved
- [ ] All ICU format patterns preserved
- [ ] UTF-8 encoding verified for all files
- [ ] Key parity verified across all languages

### Functional Verification
- [ ] Application loads translations without errors
- [ ] No missing translation console warnings
- [ ] Language switching displays correct translations
- [ ] UI renders correctly without layout overflow

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing accents in existing translations | High | Medium | Systematic review with character validation |
| Inconsistent formality register | Medium | Medium | Establish and document formality rules per language |
| Placeholder corruption during translation | Low | High | Automated placeholder validation script |
| JSON syntax errors | Low | High | JSON validation after each edit |
| Layout breaks from longer translations | Medium | Low | Visual spot-check during testing |

---

## Files Modified Summary

| File | Action | Key Changes |
|------|--------|-------------|
| `/messages/es.json` | Modify | Fix accents, verify 123 keys |
| `/messages/fr.json` | Modify | Fix accents, verify 123 keys |
| `/messages/de.json` | Modify | Fix umlauts, verify 123 keys |
| `/messages/it.json` | Modify | Fix accents, verify 123 keys |
| `/messages/nl.json` | Modify | Verify spelling, verify 123 keys |

---

## Dependencies

- **Upstream**: Tasks 2H.1-2H.9 (common namespace string extraction complete)
- **Downstream**: Task 2H.11 (optional useCommonTranslations hook), other Epic 2 sub-epic translation tasks

---

## Notes

- This task focuses on common namespace translations only
- Similar translation generation tasks exist for other namespaces (auth, dashboard, etc.)
- Translation service at `/src/lib/translation-service/` can be used for automated translation assistance
- Consider native speaker review for critical customer-facing strings

---

*Document generated for FAQBNB Localization Epic 2 - Task 2H.10*
