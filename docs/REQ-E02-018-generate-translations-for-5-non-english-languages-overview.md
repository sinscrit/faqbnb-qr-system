# Implementation Overview: Generate Translations for 5 Non-English Languages

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-018 |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | Not specified |
| Breakdown Created | 2026-01-22 22:29 |
| Sub-Epic | 2G - Settings & Account |
| Task | 2G.6 |
| T-shirt Size | Large |
| Estimated Effort | 16-24 hours |
| Status | PENDING |

---

## Executive Summary

This task generates professional translations for the `settings.*` namespace in 5 non-English languages: French, Spanish, German, Dutch, and Italian. The work involves translating approximately 150 keys covering account settings, user profile, preferences, notifications, security settings, and comprehensive help content. This is the final task in Sub-Epic 2G and completes the internationalization of the Settings & Account section.

**Current State:**
- English source content exists in `/messages/en.json` lines 3374-3638 (~150 keys)
- Non-English files have settings namespace structure with English placeholder text
- Files ready for translation: `fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`
- All UI components from Tasks 2G.1-2G.5 are ready and using translation keys
- Tasks 2G.2 (Account), 2G.3 (Profile), 2G.4 (Preferences), 2G.5 (Help) completed

**Target State:**
- Professional translations in 5 languages for all ~150 settings keys
- Translations follow language-specific conventions (formal address, cultural norms)
- ICU message format properly translated (plurals, variables)
- All aria-labels and accessibility strings translated
- Help content translated with clear, instructional language

**Scope:**
- Translate ~150 keys × 5 languages = ~750 individual translations
- Languages: French (Français), Spanish (Español), German (Deutsch), Dutch (Nederlands), Italian (Italiano)
- Namespaces: account, profile, preferences, notifications, security, help (5 sections)
- Update 5 non-English translation files
- Maintain ICU message format syntax
- Follow cultural and linguistic conventions for each language

**Out of Scope:**
- Translating content outside settings namespace
- Creating new translation keys
- Modifying English source content
- Adding new languages beyond the 5 specified
- Machine translation without human review (quality requirement)

---

## Goals

### Primary Objectives

1. **Translate Account Settings (20 keys)**
   - Email management, password change, account deletion
   - Formal address forms (vous, usted, Sie, u, Lei)
   - ICU format for dates and counts
   - Security-focused language

2. **Translate Profile Settings (15 keys)**
   - Display name, bio, profile photo
   - Character limit messages
   - Upload/remove actions
   - Success/error messages

3. **Translate Preferences (25 keys)**
   - Language names in native form
   - Theme options (light/dark/system)
   - Timezone descriptions
   - Date/time format preferences

4. **Translate Notifications (20 keys)**
   - Notification types and descriptions
   - Toggle labels
   - ICU plural forms for counts
   - Update confirmations

5. **Translate Security Settings (15 keys)**
   - Two-factor authentication
   - Active sessions management
   - ICU plurals for session counts
   - Security-focused language

6. **Translate Help Content (50+ keys)**
   - Getting Started (3 steps, ~9 keys)
   - Property Management (3 steps, ~8 keys)
   - Item Creation (6 steps, ~16 keys)
   - QR Codes (4 steps, ~11 keys)
   - Item Management (4 steps, ~8 keys)
   - Instructional, clear language
   - Maintain step-by-step structure

### Language-Specific Requirements

**French (Français):**
- Use formal "vous" form throughout
- Maintain gender-neutral language where possible
- Follow French quotation marks: « guillemets »
- CLDR plurals: one, many, other
- Example: "Paramètres du compte", "Gérer vos préférences"

**Spanish (Español):**
- Use formal "usted" form throughout
- Consider Latin American Spanish (neutral dialect)
- Inverted punctuation where appropriate (¿?)
- CLDR plurals: one, many, other
- Example: "Configuración de la cuenta", "Gestionar sus preferencias"

**German (Deutsch):**
- Use formal "Sie" form throughout
- Capitalize all nouns (fundamental German rule)
- Compound words where appropriate
- CLDR plurals: one, other
- Example: "Kontoeinstellungen", "Ihre Einstellungen verwalten"

**Dutch (Nederlands):**
- Use formal "u" form throughout
- Follow Dutch capitalization (only sentence-initial)
- CLDR plurals: one, other
- Example: "Accountinstellingen", "Uw voorkeuren beheren"

**Italian (Italiano):**
- Use formal "Lei" form throughout
- Follow Italian capitalization
- CLDR plurals: one, many, other
- Example: "Impostazioni dell'account", "Gestisci le tue preferenze"

### Success Criteria

- ✅ All ~150 keys translated professionally in 5 languages
- ✅ Translations culturally appropriate and contextually accurate
- ✅ ICU message format syntax preserved
- ✅ Formal address forms used consistently
- ✅ Language names in native form (Français, Español, etc.)
- ✅ CLDR plural rules followed for each language
- ✅ Accessibility strings (aria-labels) translated clearly
- ✅ Help content clear and instructional
- ✅ JSON syntax valid in all files
- ✅ No English placeholders remain

---

## Technical Context

### Translation File Structure

**Files to Update:**
- `/messages/fr.json` (180KB, 4274 lines)
- `/messages/es.json` (176KB, 4274 lines)
- `/messages/de.json` (177KB, 4274 lines)
- `/messages/nl.json` (170KB, 4274 lines)
- `/messages/it.json` (170KB, 4274 lines)

**Settings Namespace Location:** Lines 3348-3638 (approximately)

**Current State:** English placeholder text in all non-English files

### ICU Message Format Requirements

**Variable Interpolation:**
```json
// English
"emailUpdated": "Email updated to {email}"
"lastLogin": "Last login: {date} at {time}"
"languageUpdated": "Language updated to {language}"

// French
"emailUpdated": "E-mail mis à jour à {email}"
"lastLogin": "Dernière connexion : {date} à {time}"
"languageUpdated": "Langue mise à jour : {language}"
```

**Plural Forms (CLDR Rules):**

**French (one, many, other):**
```json
"sessionsActive": "{count, plural, one {# session active} many {# sessions actives} other {# sessions actives}}"
```

**Spanish (one, many, other):**
```json
"sessionsActive": "{count, plural, one {# sesión activa} many {# sesiones activas} other {# sesiones activas}}"
```

**German (one, other):**
```json
"sessionsActive": "{count, plural, one {# aktive Sitzung} other {# aktive Sitzungen}}"
```

**Dutch (one, other):**
```json
"sessionsActive": "{count, plural, one {# actieve sessie} other {# actieve sessies}}"
```

**Italian (one, many, other):**
```json
"sessionsActive": "{count, plural, one {# sessione attiva} many {# sessioni attive} other {# sessioni attive}}"
```

### Translation Examples by Namespace

**Account Settings:**
```json
// English
{
  "title": "Account Settings",
  "email": "Email Address",
  "changePassword": "Change Password",
  "deleteAccount": "Delete Account",
  "deleteWarning": "This action is permanent and cannot be undone."
}

// French
{
  "title": "Paramètres du compte",
  "email": "Adresse e-mail",
  "changePassword": "Modifier le mot de passe",
  "deleteAccount": "Supprimer le compte",
  "deleteWarning": "Cette action est permanente et ne peut pas être annulée."
}

// Spanish
{
  "title": "Configuración de la cuenta",
  "email": "Dirección de correo electrónico",
  "changePassword": "Cambiar contraseña",
  "deleteAccount": "Eliminar cuenta",
  "deleteWarning": "Esta acción es permanente y no se puede deshacer."
}

// German
{
  "title": "Kontoeinstellungen",
  "email": "E-Mail-Adresse",
  "changePassword": "Passwort ändern",
  "deleteAccount": "Konto löschen",
  "deleteWarning": "Diese Aktion ist dauerhaft und kann nicht rückgängig gemacht werden."
}
```

**Profile Settings:**
```json
// English
{
  "displayName": "Display Name",
  "bio": "Bio",
  "bioMaxLength": "Bio must be 500 characters or less",
  "uploadAvatar": "Upload Photo",
  "profileUpdated": "Profile updated successfully"
}

// French
{
  "displayName": "Nom d'affichage",
  "bio": "Biographie",
  "bioMaxLength": "La biographie doit contenir 500 caractères ou moins",
  "uploadAvatar": "Télécharger une photo",
  "profileUpdated": "Profil mis à jour avec succès"
}
```

**Preferences (Language Names):**
```json
// All languages - language names in native form
{
  "supportedLanguages": {
    "en": "English",
    "fr": "Français",      // Native form
    "es": "Español",       // Native form
    "de": "Deutsch",       // Native form
    "nl": "Nederlands",    // Native form
    "it": "Italiano"       // Native form
  }
}
```

**Theme Options:**
```json
// English
{
  "themeOptions": {
    "light": "Light",
    "dark": "Dark",
    "system": "System"
  }
}

// French
{
  "themeOptions": {
    "light": "Clair",
    "dark": "Sombre",
    "system": "Système"
  }
}

// Spanish
{
  "themeOptions": {
    "light": "Claro",
    "dark": "Oscuro",
    "system": "Sistema"
  }
}

// German
{
  "themeOptions": {
    "light": "Hell",
    "dark": "Dunkel",
    "system": "System"
  }
}
```

**Help Content (Instructional):**
```json
// English
{
  "gettingStarted": {
    "step1": {
      "title": "Create Your First Property",
      "content": "After signing in, navigate to Properties and click \"Add Property\" to create your first vacation rental or property."
    }
  }
}

// French (clear, instructional)
{
  "gettingStarted": {
    "step1": {
      "title": "Créez votre première propriété",
      "content": "Après vous être connecté, accédez à Propriétés et cliquez sur « Ajouter une propriété » pour créer votre première location de vacances."
    }
  }
}

// German (capitalized nouns, clear instructions)
{
  "gettingStarted": {
    "step1": {
      "title": "Erstellen Sie Ihre erste Immobilie",
      "content": "Nach der Anmeldung navigieren Sie zu Immobilien und klicken Sie auf „Immobilie hinzufügen", um Ihre erste Ferienunterkunft zu erstellen."
    }
  }
}
```

### Quality Standards

**Translation Quality Requirements:**
1. **Professional Level:** Translations should read naturally to native speakers
2. **Contextual Accuracy:** Understand UI context (buttons, labels, instructions)
3. **Consistency:** Use consistent terminology throughout (e.g., "property" = "propriété" in all French strings)
4. **Formal Tone:** Maintain professional, formal address (vous, usted, Sie, u, Lei)
5. **Cultural Appropriateness:** Respect cultural norms and conventions
6. **Technical Accuracy:** Preserve meaning of technical terms (QR code, email, password)

**Common Pitfalls to Avoid:**
- ❌ Machine translation without human review
- ❌ Mixing formal and informal address
- ❌ Literal word-for-word translation (translate meaning, not words)
- ❌ Breaking ICU message format syntax
- ❌ Inconsistent terminology (using different words for same concept)
- ❌ Overly technical jargon (keep language accessible)

---

## Implementation Plan

### Step 1: Prepare Translation Workflow
**Description:** Set up translation process, create glossary, establish quality checks
**Rationale:** Ensures consistency and quality across all translations
**Estimated Effort:** Medium (2-3 hours)

**Implementation Details:**
1. **Create Translation Glossary:**
   - Extract key terms that appear frequently:
     - Account, Profile, Settings, Preferences, Notifications, Security
     - Email, Password, Property, Item, QR Code
     - Save, Cancel, Delete, Upload, Remove
   - Define consistent translations for each term in all 5 languages
   - Document in `/docs/translation-glossary.md` (optional)

2. **Set Up Quality Checklist:**
   - JSON syntax validation script
   - ICU format validation
   - Consistency checker (same term → same translation)
   - Completeness checker (no English placeholders)

3. **Review Translation Context:**
   - Read through English source to understand full context
   - Identify sections that need extra care (security, help instructions)
   - Note any cultural sensitivities

**Glossary Example:**
```markdown
| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Account | Compte | Cuenta | Konto | Account | Account |
| Settings | Paramètres | Configuración | Einstellungen | Instellingen | Impostazioni |
| Profile | Profil | Perfil | Profil | Profiel | Profilo |
| Email | E-mail | Correo electrónico | E-Mail | E-mail | E-mail |
| Password | Mot de passe | Contraseña | Passwort | Wachtwoord | Password |
| Property | Propriété | Propiedad | Immobilie | Accommodatie | Proprietà |
| Save | Enregistrer | Guardar | Speichern | Opslaan | Salva |
```

---

### Step 2: Translate French (Français) - All Sections
**Description:** Complete all translations for French language
**Rationale:** First language translation establishes patterns
**Estimated Effort:** Large (4-5 hours)

**Implementation Details:**
- File: `/messages/fr.json`
- Lines: 3348-3638 (approximately)
- Keys to translate: ~150

**Sub-sections:**
1. **Account Settings (20 keys)** - Use "vous" form, formal tone
2. **Profile Settings (15 keys)** - Clear, professional language
3. **Preferences (25 keys)** - Technical accuracy for theme/timezone terms
4. **Notifications (20 keys)** - Descriptive, clear toggles
5. **Security (15 keys)** - Security-focused, formal language
6. **Help Content (50+ keys)** - Instructional, step-by-step clarity

**Key Considerations for French:**
- Use formal "vous" throughout (not "tu")
- French quotation marks: « guillemets »
- Accents: é, è, ê, à, ô, etc.
- Gender agreement (la propriété, le compte)
- CLDR plural forms: one, many, other

**Validation:**
- Check JSON syntax: `node -e "require('./messages/fr.json')"`
- Verify ICU format syntax
- Check for English placeholders
- Review with native speaker (if available)

---

### Step 3: Translate Spanish (Español) - All Sections
**Description:** Complete all translations for Spanish language
**Rationale:** Second language, establish Latin American neutral dialect
**Estimated Effort:** Large (4-5 hours)

**Implementation Details:**
- File: `/messages/es.json`
- Keys to translate: ~150

**Key Considerations for Spanish:**
- Use formal "usted" form (not "tú")
- Latin American Spanish (neutral dialect, avoid regional slang)
- Inverted question marks where appropriate: ¿?
- Accents: á, é, í, ó, ú, ñ
- CLDR plural forms: one, many, other

**Common Terms:**
- Account → Cuenta
- Settings → Configuración
- Password → Contraseña
- Email → Correo electrónico
- Save → Guardar
- Delete → Eliminar

**Validation:**
- Check JSON syntax
- Verify accent marks render correctly
- Confirm formal address throughout
- Check ICU plural forms

---

### Step 4: Translate German (Deutsch) - All Sections
**Description:** Complete all translations for German language
**Rationale:** Third language, unique grammar rules (capitalized nouns)
**Estimated Effort:** Large (4-5 hours)

**Implementation Details:**
- File: `/messages/de.json`
- Keys to translate: ~150

**Key Considerations for German:**
- Use formal "Sie" form (not "du")
- **Capitalize ALL nouns** (Konto, Einstellungen, Passwort, etc.)
- Compound words common: Kontoeinstellungen, Benutzereinstellungen
- Umlauts: ä, ö, ü, ß
- CLDR plural forms: one, other (simpler than French/Spanish)
- Longer words expected (German words tend to be longer)

**Common Terms:**
- Account → Konto
- Settings → Einstellungen
- Profile → Profil
- Password → Passwort
- Email → E-Mail
- Save → Speichern
- Delete → Löschen

**Validation:**
- Check JSON syntax
- Verify all nouns capitalized
- Check compound words correct
- Verify "Sie" form used throughout

---

### Step 5: Translate Dutch (Nederlands) - All Sections
**Description:** Complete all translations for Dutch language
**Rationale:** Fourth language, similar to German but distinct
**Estimated Effort:** Large (4-5 hours)

**Implementation Details:**
- File: `/messages/nl.json`
- Keys to translate: ~150

**Key Considerations for Dutch:**
- Use formal "u" form (not "je")
- Sentence-initial capitalization only (unlike German)
- CLDR plural forms: one, other
- Compound words (less common than German but still present)

**Common Terms:**
- Account → Account
- Settings → Instellingen
- Profile → Profiel
- Password → Wachtwoord
- Email → E-mail
- Save → Opslaan
- Delete → Verwijderen

**Validation:**
- Check JSON syntax
- Verify "u" form used throughout
- Check capitalization (only sentence-initial)
- Verify compound words

---

### Step 6: Translate Italian (Italiano) - All Sections
**Description:** Complete all translations for Italian language
**Rationale:** Fifth and final language
**Estimated Effort:** Large (4-5 hours)

**Implementation Details:**
- File: `/messages/it.json`
- Keys to translate: ~150

**Key Considerations for Italian:**
- Use formal "Lei" form (not "tu")
- Italian capitalization rules
- Accents: à, è, é, ì, ò, ù
- CLDR plural forms: one, many, other
- Gender agreement (l'account, la password, il profilo)

**Common Terms:**
- Account → Account
- Settings → Impostazioni
- Profile → Profilo
- Password → Password
- Email → E-mail
- Save → Salva
- Delete → Elimina

**Validation:**
- Check JSON syntax
- Verify "Lei" form used throughout
- Check accent marks
- Verify gender agreement

---

### Step 7: Validate All Translation Files
**Description:** Run comprehensive validation checks on all 5 language files
**Rationale:** Ensure quality and completeness before deployment
**Estimated Effort:** Medium (2-3 hours)

**Validation Steps:**

1. **JSON Syntax Validation:**
```bash
for lang in fr es de nl it; do
  echo "Validating messages/${lang}.json..."
  node -e "require('./messages/${lang}.json')"
  if [ $? -eq 0 ]; then
    echo "✓ ${lang}.json is valid JSON"
  else
    echo "✗ ${lang}.json has syntax errors"
  fi
done
```

2. **Structure Consistency Check:**
```bash
# Verify all files have matching key structure
node -e "
const en = require('./messages/en.json');
const fr = require('./messages/fr.json');
const getKeys = (obj, prefix = '') => {
  const keys = [];
  for (const key in obj) {
    const path = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getKeys(obj[key], path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
};
const enKeys = getKeys(en.settings);
const frKeys = getKeys(fr.settings);
console.log('EN settings keys:', enKeys.length);
console.log('FR settings keys:', frKeys.length);
console.log('Match:', enKeys.length === frKeys.length);
console.log('Missing in FR:', enKeys.filter(k => !frKeys.includes(k)));
"
```

3. **English Placeholder Check:**
```bash
# Search for common English words in non-English files (within settings namespace)
for lang in fr es de nl it; do
  echo "Checking messages/${lang}.json for English placeholders..."
  # Extract settings namespace and check for English
  # (This is a simple check - manual review still needed)
  grep -A 300 '"settings": {' messages/${lang}.json | \
    grep -i '"Account Settings"\|"Email Address"\|"Change Password"\|"Display Name"' | \
    head -5
done
```

4. **ICU Format Validation:**
   - Manually review ICU format strings
   - Check plural forms use correct CLDR categories
   - Verify variable names preserved: {email}, {date}, {count}
   - Test with next-intl ICU parser (if available)

5. **Completeness Check:**
   - Count translated keys per language
   - Verify all sections present (account, profile, preferences, notifications, security, help)
   - Check no truncated content

6. **Accessibility String Check:**
   - Verify all aria-labels translated
   - Check screen reader text makes sense
   - Ensure accessibility strings are descriptive

---

### Step 8: Manual Quality Review
**Description:** Human review of translations for quality and accuracy
**Rationale:** Catch nuances that automated checks miss
**Estimated Effort:** Medium (2-3 hours)

**Review Process:**

1. **Contextual Review:**
   - Review translations in UI context (if components available)
   - Check that button labels, form fields, messages read naturally
   - Verify instructional content (help section) is clear

2. **Consistency Review:**
   - Check terminology consistent within each language
   - Verify formal address used throughout
   - Ensure tone remains professional and friendly

3. **Cultural Review:**
   - Check for cultural appropriateness
   - Verify no idioms or expressions that don't translate well
   - Ensure security/privacy language respectful and clear

4. **Technical Review:**
   - Verify technical terms accurate (QR code, email, authentication)
   - Check that feature names consistent
   - Ensure no functionality implied that doesn't exist

5. **Native Speaker Review (Ideal):**
   - If possible, have native speakers review each language
   - Particularly important for help content (instructional clarity)
   - Get feedback on naturalness and professionalism

**Review Checklist per Language:**
- [ ] JSON syntax valid
- [ ] All keys translated (no English placeholders)
- [ ] ICU format syntax correct
- [ ] Formal address used consistently
- [ ] Terminology consistent
- [ ] Capitalization correct (esp. German nouns)
- [ ] Accents/special characters correct
- [ ] Plural forms follow CLDR rules
- [ ] Reads naturally to native speakers
- [ ] Help content clear and instructional

---

### Step 9: Testing in Application
**Description:** Test translations in actual application UI
**Rationale:** Verify translations display correctly and fit in UI elements
**Estimated Effort:** Medium (2-3 hours)

**Testing Steps:**

1. **Language Switching Test:**
   - Switch language to each of 5 languages
   - Verify app language changes immediately
   - Check all pages load correctly

2. **Account Settings Page:**
   - Verify all labels, buttons, messages display translated
   - Test form validation messages
   - Check success/error messages
   - Verify aria-labels (use screen reader)

3. **Profile Page:**
   - Check display name, bio, avatar labels
   - Test character counter (500 chars)
   - Verify upload/remove buttons
   - Check success messages

4. **Preferences Page:**
   - Verify language selector shows native names
   - Check theme selector options
   - Verify timezone dropdown
   - Test notification toggles
   - Check success messages

5. **Security Page:**
   - Verify 2FA section labels
   - Check active sessions list
   - Test session count plurals
   - Verify revoke buttons

6. **Help Page:**
   - Check page title and subtitle
   - Verify all 5 section titles
   - Test expand/collapse functionality
   - Read through instruction steps (clarity check)
   - Check link labels
   - Verify footer text

7. **Layout and Overflow Testing:**
   - Check that German text (typically longer) fits in buttons
   - Verify no text overflow or truncation
   - Test responsive layouts (mobile, tablet)
   - Check wrapping behavior

8. **ICU Format Testing:**
   - Test plural forms with different counts (0, 1, 2, 5, 100)
   - Verify date formatting with ICU variables
   - Check that variable interpolation works

**Testing Checklist:**
- [ ] All 5 languages load without errors
- [ ] No English fallbacks visible (except for untranslated sections)
- [ ] Text fits in UI elements (buttons, labels)
- [ ] No overflow or truncation
- [ ] Plurals work correctly with different counts
- [ ] Variable interpolation works (dates, emails, names)
- [ ] Navigation and functionality unchanged
- [ ] Performance acceptable (no slowdown)

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Translation Files to Modify

| File | Lines | Target | Modification |
|------|-------|--------|--------------|
| `/messages/fr.json` | 3348-3638 | `settings` namespace | Replace English placeholders with French translations (~150 keys) |
| `/messages/es.json` | 3348-3638 | `settings` namespace | Replace English placeholders with Spanish translations (~150 keys) |
| `/messages/de.json` | 3348-3638 | `settings` namespace | Replace English placeholders with German translations (~150 keys) |
| `/messages/nl.json` | 3348-3638 | `settings` namespace | Replace English placeholders with Dutch translations (~150 keys) |
| `/messages/it.json` | 3348-3638 | `settings` namespace | Replace English placeholders with Italian translations (~150 keys) |

### Reference Files (No Modifications)

| File | Lines | Purpose | Modification |
|------|-------|---------|--------------|
| `/messages/en.json` | 3374-3638 | English source content | Reference only (DO NOT MODIFY) |

### Optional Documentation Files

| File | Purpose | Modification |
|------|---------|--------------|
| `/docs/translation-glossary.md` | Term consistency reference | Create (optional) |

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-013** (Task 2G.1): Create `settings` namespace structure
  - **Status:** MUST be completed first
  - **Provides:** Namespace structure with English content
  - **Reason:** Need source content to translate

- **REQ-E02-014** (Task 2G.2): Update account settings components
  - **Status:** Should be completed first
  - **Provides:** Account settings UI using translation keys
  - **Reason:** Context for understanding account translations

- **REQ-E02-015** (Task 2G.3): Update profile components
  - **Status:** Should be completed first
  - **Provides:** Profile UI using translation keys
  - **Reason:** Context for understanding profile translations

- **REQ-E02-016** (Task 2G.4): Update preferences components
  - **Status:** Should be completed first
  - **Provides:** Preferences UI using translation keys
  - **Reason:** Context for understanding preferences translations

- **REQ-E02-017** (Task 2G.5): Update help page
  - **Status:** Should be completed first
  - **Provides:** Help page UI using translation keys
  - **Reason:** Context for understanding help content translations

- **Epic 1 - L10N Foundation**
  - **Status:** Completed
  - **Provides:** next-intl setup, language switching, ICU format support
  - **Reason:** Infrastructure for displaying translations

### Blocks (Requires This First)

**NONE** - This is the final task in Sub-Epic 2G. No other tasks depend on it.

### Parallel Safety

**Files Modified by This Task:**
- `/messages/fr.json` (lines 3348-3638)
- `/messages/es.json` (lines 3348-3638)
- `/messages/de.json` (lines 3348-3638)
- `/messages/nl.json` (lines 3348-3638)
- `/messages/it.json` (lines 3348-3638)

**Conflicts With:**
- **NONE** - This task only modifies translation files
- No other tasks should be modifying the `settings.*` namespace in non-English files

**Safe to Parallelize With:**
- Any tasks working on different namespaces in translation files
- Any tasks not touching translation files

**Recommendation:** This task can run independently once Tasks 2G.1-2G.5 are complete.

### External Dependencies

- **Translation Resources:**
  - Professional translator (preferred) or
  - Native speaker reviewers for each language
  - Translation memory tools (optional)
  - Glossary and style guides

- **Development Tools:**
  - Node.js (for JSON validation)
  - Text editor with JSON support
  - Git (for version control)

- **Language-Specific:**
  - CLDR plural rules documentation
  - ICU message format documentation
  - Language-specific style guides

---

## Risks and Considerations

### Potential Side Effects

1. **Text Length Variations**
   - **Risk:** German translations typically 30% longer, may cause UI overflow
   - **Mitigation:** Test in UI, ensure flex layouts accommodate longer text
   - **Impact:** Medium (may require CSS adjustments)

2. **Translation Quality**
   - **Risk:** Poor translations damage user experience and brand perception
   - **Mitigation:** Professional translators or thorough native speaker review
   - **Impact:** High (affects all users in those languages)

3. **ICU Format Errors**
   - **Risk:** Syntax errors in plural forms break translation display
   - **Mitigation:** Careful validation, test with different counts
   - **Impact:** Medium (causes display errors or fallback to English)

4. **Cultural Mismatches**
   - **Risk:** Translations culturally inappropriate or confusing
   - **Mitigation:** Native speaker review, cultural awareness
   - **Impact:** Medium (affects user trust and comprehension)

5. **Inconsistent Terminology**
   - **Risk:** Same concept translated differently in different places
   - **Mitigation:** Create glossary, consistent terminology throughout
   - **Impact:** Low-Medium (confuses users)

### Testing Requirements

1. **Automated Testing:**
   - JSON syntax validation (all 5 files)
   - Structure consistency check (all files match en.json structure)
   - ICU format syntax validation
   - English placeholder detection

2. **Manual Testing:**
   - UI display in all 5 languages
   - Text overflow/truncation check
   - Plural forms with different counts
   - Variable interpolation (dates, names, emails)
   - Accessibility (screen reader in each language)

3. **Quality Assurance:**
   - Native speaker review (ideal for each language)
   - Contextual accuracy check
   - Consistency check (same term → same translation)
   - Cultural appropriateness review

4. **Regression Testing:**
   - Verify language switching still works
   - Check that existing translations (outside settings) unaffected
   - Test performance with larger translation files

### Open Questions

1. **Translation Method**
   - [ ] Use professional translation service?
   - [ ] Use native speaker contractors?
   - [ ] Use machine translation with human review?
   - **Recommendation:** Professional translators or native speakers with UI/UX experience

2. **Review Process**
   - [ ] How many reviewers per language?
   - [ ] What's the approval process?
   - [ ] Who has final authority on translations?
   - **Recommendation:** At least one native speaker review per language

3. **Help Content Translation**
   - [ ] Should instructions be adapted culturally or translated literally?
   - [ ] Are UI element names (Properties, Items) translated or kept in English?
   - **Recommendation:** Translate instructions clearly; keep UI element names consistent with app translation

4. **Language Variants**
   - [ ] Should we use European Spanish or Latin American Spanish?
   - [ ] European Portuguese vs. Brazilian Portuguese (if added later)?
   - **Recommendation:** Latin American Spanish (broader audience)

5. **Update Frequency**
   - [ ] How often will translations be updated?
   - [ ] What's the process for fixing translation errors post-launch?
   - **Recommendation:** Establish translation update workflow for future content

---

## Out of Scope

The following items are explicitly **NOT** included in this task:

### Content Outside Settings Namespace
- Common translations (already translated)
- Dashboard translations (already translated)
- Item/Property/Article translations (already translated)
- Authentication translations (already translated)
- Any namespace outside `settings.*`

### New Languages
- Portuguese (Brazilian or European)
- Chinese (Simplified or Traditional)
- Japanese
- Russian
- Arabic
- Any languages beyond the 5 specified (French, Spanish, German, Dutch, Italian)

### Language Variants
- Canadian French vs. European French
- Latin American Spanish variants (Mexican, Colombian, etc.)
- Swiss German vs. Standard German
- Flemish vs. Dutch

### Translation Infrastructure
- Translation management system (TMS)
- Continuous localization pipeline
- Translation memory database
- Automatic translation updates
- Crowdsourced translation platform

### Content Modifications
- Changing English source content
- Adding new translation keys
- Removing translation keys
- Reorganizing namespace structure

### Advanced Localization
- Right-to-left (RTL) language support
- Date/number formatting per locale (beyond ICU format)
- Currency formatting
- Measurement unit conversion
- Time zone display localization

---

## Success Metrics

### Quantitative Metrics

1. **Translation Completeness**
   - Target: 100% of ~150 keys translated in all 5 languages
   - Measurement: Key count per language, English placeholder detection

2. **Translation Accuracy**
   - Target: < 5% of translations require revision post-review
   - Measurement: Number of translation corrections / total translations

3. **JSON Validity**
   - Target: 100% of files pass JSON syntax validation
   - Measurement: `node -e "require('./messages/{lang}.json')"` exit code

4. **Structure Consistency**
   - Target: 100% key structure match across all languages
   - Measurement: Automated structure comparison script

5. **ICU Format Validity**
   - Target: 100% of ICU message formats syntactically correct
   - Measurement: next-intl parser validation (if available)

### Qualitative Metrics

1. **Translation Quality**
   - Reads naturally to native speakers
   - Contextually appropriate for UI
   - Professional and friendly tone
   - Technically accurate

2. **Consistency**
   - Same terms translated consistently
   - Formal address used throughout
   - Terminology matches rest of app

3. **Cultural Appropriateness**
   - Respectful of cultural norms
   - No offensive or confusing content
   - Idioms and expressions localized

4. **User Experience**
   - Text fits in UI elements
   - Instructions clear and actionable
   - Help content easy to understand
   - No confusion from poor translations

5. **Accessibility**
   - Aria-labels clear and descriptive
   - Screen reader text makes sense
   - Assistive technology friendly

---

## Notes and Context

### Design Rationale

1. **Why Professional Translations?**
   - Machine translation often misses context
   - UI strings require special expertise
   - Quality directly impacts user experience and brand perception
   - Help content needs instructional clarity

2. **Why Formal Address Forms?**
   - Professional application for business use
   - Appropriate for financial/property management context
   - Respectful and universally acceptable
   - Consistent with enterprise software conventions

3. **Why Language-Specific CLDR Plurals?**
   - Different languages have different plural rules
   - French: one, many, other
   - German/Dutch: one, other (simpler)
   - English: one, other
   - ICU format handles this automatically

4. **Why This Task Last in Sub-Epic 2G?**
   - Need to see translations in UI context
   - Components must be ready to use translation keys
   - Easier to translate with full context
   - Allows testing translations in actual UI

### Historical Context

- **Epic 1 (L10N Foundation):** Established next-intl setup, 6 languages
- **Sub-Epics 2A-2F:** Translated 260+ components, ~3,000+ keys
- **Task 2G.1 (REQ-E02-013):** Created settings namespace structure (~150 keys)
- **Tasks 2G.2-2G.5:** Built UI components using settings translations
- **Current Task (2G.6):** Final step - translate settings content

### Future Considerations

1. **Translation Workflow**
   - Implement translation management system (TMS)
   - Set up continuous localization pipeline
   - Create process for translation updates
   - Establish translator access to context

2. **Additional Languages**
   - Portuguese (Brazilian) - large market
   - Chinese (Simplified) - growing market
   - Japanese - vacation rental market
   - More European languages

3. **Translation Quality**
   - A/B test different translations
   - Collect user feedback on translations
   - Track which languages have most support requests (may indicate poor translations)
   - Continuous improvement process

4. **Localization Beyond Translation**
   - Date/time formatting per locale
   - Currency formatting
   - Number formatting (decimal separators)
   - Address formatting
   - Phone number formatting

### Related Documentation

- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md (lines 1099-1171)
- **Sub-Epic 2G Overview:** REQ-E02-013 (Task 2G.1)
- **Account Settings:** REQ-E02-014 (Task 2G.2)
- **Profile:** REQ-E02-015 (Task 2G.3)
- **Preferences:** REQ-E02-016 (Task 2G.4)
- **Help Page:** REQ-E02-017 (Task 2G.5)
- **Translation Files:** `/messages/*.json`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/
- **CLDR Plural Rules:** https://cldr.unicode.org/index/cldr-spec/plural-rules

---

## Appendix

### A. Translation Key Count by Section

**Account Settings (20 keys):**
- title, subtitle, email, emailDescription, emailInputAriaLabel
- changeEmail, changeEmailButtonAriaLabel, emailUpdated
- currentPassword, newPassword, confirmPassword, changePassword, passwordUpdated
- deleteAccount, deleteAccountButtonAriaLabel, deleteWarning, deleteConfirmation
- sessionsActive (ICU), lastLogin (ICU), accountCreated (ICU), manageSubscription

**Profile Settings (15 keys):**
- title, subtitle, displayName, displayNamePlaceholder, displayNameAriaLabel
- bio, bioPlaceholder, bioMaxLength
- avatar, uploadAvatar, uploadAvatarAriaLabel, removeAvatar, removeAvatarAriaLabel
- avatarUpdated, avatarRemoved, saveChanges, savingChanges, profileUpdated

**Preferences (25 keys):**
- title, subtitle, language, languageDescription, languageSelectorAriaLabel, languageUpdated
- supportedLanguages.* (6 language names)
- theme, themeDescription, themeSelectorAriaLabel, themeUpdated
- themeOptions.* (3 options: light, dark, system)
- timezone, timezoneDescription, timezoneSelectorAriaLabel, timezoneUpdated
- dateFormat, timeFormat, preferencesUpdated

**Notifications (20 keys):**
- title, subtitle
- emailNotifications, emailNotificationsDescription
- pushNotifications, pushNotificationsDescription
- itemUpdates, itemUpdatesDescription
- propertyUpdates, propertyUpdatesDescription
- systemAnnouncements, systemAnnouncementsDescription
- weeklyDigest, weeklyDigestDescription
- unreadCount (ICU), markAllRead, notificationsUpdated

**Security (15 keys):**
- title, subtitle, twoFactorAuth, twoFactorAuthDescription
- enable2FA, disable2FA, twoFactorEnabled, twoFactorDisabled
- activeSessions, activeSessionsDescription, sessionsActive (ICU)
- revokeSession, revokeAllOther, currentDevice, lastActive (ICU), securityUpdated

**Help Content (50+ keys):**
- page.* (8 keys): title, subtitle, createItemButton, quickLinksTitle, footerTitle, footerText, contactButton, loadingAriaLabel
- sections.* (5 keys): gettingStarted, propertyManagement, itemCreation, qrCodes, itemManagement
- gettingStarted.* (~9 keys): title, description, step1-3 (title, content, optional tip/linkLabel)
- propertyManagement.* (~8 keys): title, description, step1-3
- itemCreation.* (~16 keys): title, description, step1-6
- qrCodes.* (~11 keys): title, description, step1-4
- itemManagement.* (~8 keys): title, description, step1-4

**Total:** ~150 keys

### B. CLDR Plural Rules Reference

**French:**
- Categories: one, many, other
- Rules: one = 0 or 1; many = n % 1000000 = 0 and n != 0; other = everything else
- Example: "0 session active", "1 session active", "2 sessions actives"

**Spanish:**
- Categories: one, many, other (but many rarely used)
- Rules: one = 1; other = everything else
- Example: "1 sesión activa", "2 sesiones activas"

**German:**
- Categories: one, other
- Rules: one = 1; other = everything else
- Example: "1 aktive Sitzung", "2 aktive Sitzungen"

**Dutch:**
- Categories: one, other
- Rules: one = 1; other = everything else
- Example: "1 actieve sessie", "2 actieve sessies"

**Italian:**
- Categories: one, many, other (but many rarely used)
- Rules: one = 1; other = everything else
- Example: "1 sessione attiva", "2 sessioni attive"

### C. Common Translation Glossary

| English | French | Spanish | German | Dutch | Italian | Notes |
|---------|--------|---------|--------|-------|---------|-------|
| Account | Compte | Cuenta | Konto | Account | Account | |
| Settings | Paramètres | Configuración | Einstellungen | Instellingen | Impostazioni | |
| Profile | Profil | Perfil | Profil | Profiel | Profilo | |
| Email | E-mail | Correo electrónico | E-Mail | E-mail | E-mail | Note hyphen in some |
| Password | Mot de passe | Contraseña | Passwort | Wachtwoord | Password | |
| Property | Propriété | Propiedad | Immobilie | Accommodatie | Proprietà | Context: vacation rental |
| Item | Article | Artículo | Artikel | Item | Articolo | Context: item in property |
| Save | Enregistrer | Guardar | Speichern | Opslaan | Salva | Button action |
| Cancel | Annuler | Cancelar | Abbrechen | Annuleren | Annulla | Button action |
| Delete | Supprimer | Eliminar | Löschen | Verwijderen | Elimina | Button action |
| Upload | Télécharger | Cargar | Hochladen | Uploaden | Carica | File upload |
| Remove | Supprimer | Quitar | Entfernen | Verwijderen | Rimuovi | Remove item |
| Edit | Modifier | Editar | Bearbeiten | Bewerken | Modifica | Edit action |
| Create | Créer | Crear | Erstellen | Aanmaken | Crea | Create new |
| Preferences | Préférences | Preferencias | Einstellungen | Voorkeuren | Preferenze | User preferences |
| Theme | Thème | Tema | Design | Thema | Tema | UI theme |
| Language | Langue | Idioma | Sprache | Taal | Lingua | Interface language |
| Help | Aide | Ayuda | Hilfe | Help | Aiuto | Help/support |

---

**End of Document**

---

*Document generated: 2026-01-22 22:29*
