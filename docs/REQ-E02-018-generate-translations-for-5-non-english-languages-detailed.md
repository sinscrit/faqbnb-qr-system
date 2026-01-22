# REQ-E02-018: Generate Translations for 5 Non-English Languages - Detailed Task Breakdown

**Document Created:** 2026-01-22 23:45
**Last Modified:** 2026-01-22 23:45
**Request ID:** REQ-E02-018
**Epic:** Epic 2 - Localization (L10N)
**Sub-Epic:** 2G - Settings & Account
**Task ID:** 2G.6
**Title:** Generate translations for 5 non-English languages
**Overview Document:** `/docs/REQ-E02-018-generate-translations-for-5-non-english-languages-overview.md`

---

## Build & Test Commands

```bash
# JSON syntax validation
node -e "require('./messages/fr.json')"
node -e "require('./messages/es.json')"
node -e "require('./messages/de.json')"
node -e "require('./messages/nl.json')"
node -e "require('./messages/it.json')"

# Type checking
npm run typecheck

# Linting
npm run lint

# Build verification
npm run build

# Run development server for manual testing
npm run dev
# Then test each language at: http://localhost:3000/{locale}/dashboard2/settings
# Where {locale} is: fr, es, de, nl, it

# Run tests (if applicable)
npm test
```

---

## Summary

This document provides detailed implementation tasks for generating professional translations for the `settings.*` namespace in 5 non-English languages: French (Français), Spanish (Español), German (Deutsch), Dutch (Nederlands), and Italian (Italiano). The work involves translating approximately 150 keys covering account settings, profile, preferences, notifications, security, and comprehensive help content.

**Critical Requirements:**
- Professional-quality translations appropriate for native speakers
- Use formal address forms (vous, usted, Sie, u, Lei)
- Maintain ICU message format syntax for plurals and variables
- Follow language-specific conventions (capitalization, accents, CLDR plural rules)
- Ensure cultural appropriateness and contextual accuracy

**Total Effort Estimate:** ~16-24 hours (Large)

---

## Dependencies

- **REQ-E02-013** (Task 2G.1: Create settings namespace structure) - MUST be completed first
  - Translation keys must exist in `/messages/en.json` at lines 3374-3638
  - Namespace: `settings.*` with ~150 keys
- **REQ-E02-014** (Task 2G.2: Update account settings components) - Should be completed for context
- **REQ-E02-015** (Task 2G.3: Update profile components) - Should be completed for context
- **REQ-E02-016** (Task 2G.4: Update preferences components) - Should be completed for context
- **REQ-E02-017** (Task 2G.5: Update help page) - Should be completed for context
- **Epic 1 - L10N Foundation** - Provides next-intl setup and language switching

---

## Authorized Files for Modification

### Translation Files to Update

1. `/messages/fr.json` (180KB, 4274 lines, settings at ~lines 3348-3638)
   - Replace English placeholders with French translations (~150 keys)

2. `/messages/es.json` (176KB, 4274 lines, settings at ~lines 3348-3638)
   - Replace English placeholders with Spanish translations (~150 keys)

3. `/messages/de.json` (177KB, 4274 lines, settings at ~lines 3348-3638)
   - Replace English placeholders with German translations (~150 keys)

4. `/messages/nl.json` (170KB, 4274 lines, settings at ~lines 3348-3638)
   - Replace English placeholders with Dutch translations (~150 keys)

5. `/messages/it.json` (170KB, 4274 lines, settings at ~lines 3348-3638)
   - Replace English placeholders with Italian translations (~150 keys)

### Reference Files (No Modifications)

- `/messages/en.json` (lines 3374-3638) - English source content (reference only, DO NOT MODIFY)

---

## Tasks

### Task 1: Prepare Translation Workflow and Resources

**Effort:** 2-3 hours (M)

Set up translation resources, create terminology glossary, and prepare quality validation tools.

**Subtasks:**

- [ ] **1.1** Read the English source content from `/messages/en.json` lines 3374-3638 to understand full context
- [ ] **1.2** Create a translation glossary with consistent terms for all 5 languages (Account, Settings, Profile, Password, Email, Property, Save, Delete, etc.)
- [ ] **1.3** Document language-specific requirements (formal address forms, capitalization rules, accent marks)
- [ ] **1.4** Note sections requiring special care (security warnings, help instructions, accessibility strings)
- [ ] **1.5** Prepare JSON syntax validation script for all 5 language files
- [ ] **1.6** Create ICU format validation checklist (variables preserved: {email}, {date}, {count}; plural forms correct)
- [ ] **1.7** Set up structure consistency validation (all files match en.json key structure)

**Translation Glossary Reference:**
| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Account | Compte | Cuenta | Konto | Account | Account |
| Settings | Paramètres | Configuración | Einstellungen | Instellingen | Impostazioni |
| Profile | Profil | Perfil | Profil | Profiel | Profilo |
| Email | E-mail | Correo electrónico | E-Mail | E-mail | E-mail |
| Password | Mot de passe | Contraseña | Passwort | Wachtwoord | Password |
| Property | Propriété | Propiedad | Immobilie | Accommodatie | Proprietà |
| Save | Enregistrer | Guardar | Speichern | Opslaan | Salva |
| Delete | Supprimer | Eliminar | Löschen | Verwijderen | Elimina |

**Acceptance Criteria:**
- English source content reviewed and understood
- Translation glossary created with consistent terminology
- Language-specific requirements documented
- Validation tools prepared

---

### Task 2: Translate French (Français) - Account Settings Section

**Effort:** 1 hour (S)

Translate 20 keys in the Account Settings section to French.

**Subtasks:**

- [ ] **2.1** Locate the `settings.account.*` namespace in `/messages/fr.json` (lines 3348-3400 approximately)
- [ ] **2.2** Translate page-level keys: `title`, `subtitle` (use formal "vous" form)
- [ ] **2.3** Translate email section keys: `email`, `emailDescription`, `emailInputAriaLabel`, `changeEmail`, `changeEmailButtonAriaLabel`, `emailUpdated`
- [ ] **2.4** Translate password section keys: `currentPassword`, `newPassword`, `confirmPassword`, `changePassword`, `passwordUpdated`
- [ ] **2.5** Translate account deletion keys: `deleteAccount`, `deleteAccountButtonAriaLabel`, `deleteWarning`, `deleteConfirmation`
- [ ] **2.6** Translate ICU format keys with proper French CLDR plural rules (one, many, other): `sessionsActive`, `lastLogin`, `accountCreated`
- [ ] **2.7** Verify all variable placeholders preserved: {email}, {date}, {time}, {count}
- [ ] **2.8** Check formal "vous" form used throughout (not "tu")
- [ ] **2.9** Verify French quotation marks (« guillemets ») used where appropriate
- [ ] **2.10** Run JSON syntax validation: `node -e "require('./messages/fr.json')"`

**Key Considerations:**
- Use formal "vous" form throughout
- French CLDR plurals: one, many, other
- Accents: é, è, ê, à, ô
- Example: "Paramètres du compte", "Adresse e-mail", "Modifier le mot de passe"

**Acceptance Criteria:**
- All 20 Account Settings keys translated professionally
- Formal address form used consistently
- ICU format syntax preserved
- JSON syntax valid

---

### Task 3: Translate French (Français) - Profile Settings Section

**Effort:** 45 minutes (S)

Translate 15 keys in the Profile Settings section to French.

**Subtasks:**

- [ ] **3.1** Locate the `settings.profile.*` namespace in `/messages/fr.json`
- [ ] **3.2** Translate page-level keys: `title`, `subtitle`
- [ ] **3.3** Translate display name keys: `displayName`, `displayNamePlaceholder`, `displayNameAriaLabel`
- [ ] **3.4** Translate bio keys: `bio`, `bioPlaceholder`, `bioMaxLength` (maintain character count: 500)
- [ ] **3.5** Translate avatar keys: `avatar`, `uploadAvatar`, `uploadAvatarAriaLabel`, `removeAvatar`, `removeAvatarAriaLabel`, `avatarUpdated`, `avatarRemoved`
- [ ] **3.6** Translate action keys: `saveChanges`, `savingChanges`, `profileUpdated`
- [ ] **3.7** Verify gender-neutral language where possible
- [ ] **3.8** Run JSON syntax validation: `node -e "require('./messages/fr.json')"`

**Example Translations:**
- "Nom d'affichage", "Biographie", "Télécharger une photo", "Profil mis à jour avec succès"

**Acceptance Criteria:**
- All 15 Profile Settings keys translated
- Clear, professional language
- JSON syntax valid

---

### Task 4: Translate French (Français) - Preferences Section

**Effort:** 1 hour (S)

Translate 25 keys in the Preferences section to French.

**Subtasks:**

- [ ] **4.1** Locate the `settings.preferences.*` namespace in `/messages/fr.json`
- [ ] **4.2** Translate page-level keys: `title`, `subtitle`
- [ ] **4.3** Translate language keys: `language`, `languageDescription`, `languageSelectorAriaLabel`, `languageUpdated`
- [ ] **4.4** Translate language names in native form: `supportedLanguages.en` = "English", `supportedLanguages.fr` = "Français", `supportedLanguages.es` = "Español", etc.
- [ ] **4.5** Translate theme keys: `theme`, `themeDescription`, `themeSelectorAriaLabel`, `themeUpdated`
- [ ] **4.6** Translate theme options: `themeOptions.light` = "Clair", `themeOptions.dark` = "Sombre", `themeOptions.system` = "Système"
- [ ] **4.7** Translate timezone keys: `timezone`, `timezoneDescription`, `timezoneSelectorAriaLabel`, `timezoneUpdated`
- [ ] **4.8** Translate format keys: `dateFormat`, `timeFormat`, `preferencesUpdated`
- [ ] **4.9** Verify ICU variable syntax preserved: {language}
- [ ] **4.10** Run JSON syntax validation: `node -e "require('./messages/fr.json')"`

**Acceptance Criteria:**
- All 25 Preferences keys translated
- Language names in native form
- Theme options translated appropriately
- JSON syntax valid

---

### Task 5: Translate French (Français) - Notifications and Security Sections

**Effort:** 1 hour (S)

Translate 35 keys in the Notifications (20 keys) and Security (15 keys) sections to French.

**Subtasks:**

- [ ] **5.1** Locate the `settings.notifications.*` namespace in `/messages/fr.json`
- [ ] **5.2** Translate notification page keys: `title`, `subtitle`
- [ ] **5.3** Translate notification type keys: `emailNotifications`, `emailNotificationsDescription`, `pushNotifications`, `pushNotificationsDescription`
- [ ] **5.4** Translate notification category keys: `itemUpdates`, `itemUpdatesDescription`, `propertyUpdates`, `propertyUpdatesDescription`, `systemAnnouncements`, `systemAnnouncementsDescription`, `weeklyDigest`, `weeklyDigestDescription`
- [ ] **5.5** Translate notification action keys with ICU plurals: `unreadCount`, `markAllRead`, `notificationsUpdated`
- [ ] **5.6** Locate the `settings.security.*` namespace in `/messages/fr.json`
- [ ] **5.7** Translate security page keys: `title`, `subtitle`
- [ ] **5.8** Translate 2FA keys: `twoFactorAuth`, `twoFactorAuthDescription`, `enable2FA`, `disable2FA`, `twoFactorEnabled`, `twoFactorDisabled`
- [ ] **5.9** Translate session keys: `activeSessions`, `activeSessionsDescription`, `sessionsActive` (ICU plural), `revokeSession`, `revokeAllOther`, `currentDevice`, `lastActive` (ICU), `securityUpdated`
- [ ] **5.10** Verify ICU plural forms use French CLDR rules (one, many, other)
- [ ] **5.11** Verify security-focused language is clear and formal
- [ ] **5.12** Run JSON syntax validation: `node -e "require('./messages/fr.json')"`

**Acceptance Criteria:**
- All 35 Notifications and Security keys translated
- ICU plurals follow French CLDR rules
- Security language clear and formal
- JSON syntax valid

---

### Task 6: Translate French (Français) - Help Content Section

**Effort:** 2-3 hours (M)

Translate 50+ keys in the Help section to French with clear, instructional language.

**Subtasks:**

- [ ] **6.1** Locate the `settings.help.*` namespace in `/messages/fr.json`
- [ ] **6.2** Translate page-level keys (8 keys): `page.title`, `page.subtitle`, `page.createItemButton`, `page.quickLinksTitle`, `page.footerTitle`, `page.footerText`, `page.contactButton`, `page.loadingAriaLabel`
- [ ] **6.3** Translate section label keys (5 keys): `sections.gettingStarted`, `sections.propertyManagement`, `sections.itemCreation`, `sections.qrCodes`, `sections.itemManagement`
- [ ] **6.4** Translate Getting Started section (~9 keys): `gettingStarted.title`, `gettingStarted.description`, step1-3 with nested keys (`title`, `content`, optional `tip`, optional `linkLabel`)
- [ ] **6.5** Translate Property Management section (~8 keys): title, description, step1-3
- [ ] **6.6** Translate Item Creation section (~16 keys): title, description, step1-6 (6 steps with multiple nested keys)
- [ ] **6.7** Translate QR Codes section (~11 keys): title, description, step1-4
- [ ] **6.8** Translate Item Management section (~8 keys): title, description, step1-4
- [ ] **6.9** Ensure instructional content is clear and step-by-step
- [ ] **6.10** Verify instructions use imperative form (command form appropriate for instructions)
- [ ] **6.11** Check that technical terms (QR code, property, item) translated consistently
- [ ] **6.12** Run JSON syntax validation: `node -e "require('./messages/fr.json')"`

**Example Help Translation:**
```json
"gettingStarted": {
  "step1": {
    "title": "Créez votre première propriété",
    "content": "Après vous être connecté, accédez à Propriétés et cliquez sur « Ajouter une propriété » pour créer votre première location de vacances."
  }
}
```

**Acceptance Criteria:**
- All 50+ Help content keys translated
- Instructions clear and actionable
- Consistent terminology throughout
- JSON syntax valid

---

### Task 7: Translate Spanish (Español) - All Settings Sections

**Effort:** 4-5 hours (L)

Translate all ~150 keys in the settings namespace to Spanish.

**Subtasks:**

- [ ] **7.1** Locate the `settings.*` namespace in `/messages/es.json` (lines 3348-3638 approximately)
- [ ] **7.2** Translate Account Settings section (20 keys) - use formal "usted" form, security-focused language
- [ ] **7.3** Translate Profile Settings section (15 keys) - clear, professional language
- [ ] **7.4** Translate Preferences section (25 keys) - include language names in native form, theme options in Spanish
- [ ] **7.5** Translate Notifications section (20 keys) - descriptive toggle labels
- [ ] **7.6** Translate Security section (15 keys) - formal, security-focused language with ICU plurals
- [ ] **7.7** Translate Help Content section (50+ keys) - clear, instructional step-by-step content
- [ ] **7.8** Verify formal "usted" form used throughout (not "tú")
- [ ] **7.9** Verify Latin American Spanish (neutral dialect, avoid regional slang)
- [ ] **7.10** Check Spanish CLDR plural rules (one, many, other): `{count, plural, one {# sesión activa} other {# sesiones activas}}`
- [ ] **7.11** Verify accent marks correct: á, é, í, ó, ú, ñ
- [ ] **7.12** Verify inverted question marks where appropriate: ¿?
- [ ] **7.13** Check all variable placeholders preserved: {email}, {date}, {time}, {count}, {language}
- [ ] **7.14** Run JSON syntax validation: `node -e "require('./messages/es.json')"`

**Key Spanish Terms:**
- Account → Cuenta
- Settings → Configuración
- Profile → Perfil
- Password → Contraseña
- Email → Correo electrónico
- Property → Propiedad
- Save → Guardar
- Delete → Eliminar

**Acceptance Criteria:**
- All ~150 settings keys translated to Spanish
- Formal "usted" form used consistently
- Latin American neutral dialect
- ICU format syntax preserved
- JSON syntax valid

---

### Task 8: Translate German (Deutsch) - All Settings Sections

**Effort:** 4-5 hours (L)

Translate all ~150 keys in the settings namespace to German.

**Subtasks:**

- [ ] **8.1** Locate the `settings.*` namespace in `/messages/de.json` (lines 3348-3638 approximately)
- [ ] **8.2** Translate Account Settings section (20 keys) - use formal "Sie" form, capitalize all nouns
- [ ] **8.3** Translate Profile Settings section (15 keys) - capitalize nouns (Profil, Anzeigename, etc.)
- [ ] **8.4** Translate Preferences section (25 keys) - capitalize nouns (Einstellungen, Sprache, Design)
- [ ] **8.5** Translate Notifications section (20 keys) - capitalize nouns (Benachrichtigungen)
- [ ] **8.6** Translate Security section (15 keys) - capitalize nouns (Sicherheit, Sitzung, Authentifizierung)
- [ ] **8.7** Translate Help Content section (50+ keys) - capitalize all nouns, clear instructions
- [ ] **8.8** Verify formal "Sie" form used throughout (not "du")
- [ ] **8.9** Verify ALL nouns capitalized (Konto, Einstellungen, Passwort, E-Mail, Immobilie, etc.)
- [ ] **8.10** Check German CLDR plural rules (one, other - simpler than French/Spanish): `{count, plural, one {# aktive Sitzung} other {# aktive Sitzungen}}`
- [ ] **8.11** Verify umlauts correct: ä, ö, ü, ß
- [ ] **8.12** Check compound words (Kontoeinstellungen, Benutzereinstellungen)
- [ ] **8.13** Check all variable placeholders preserved
- [ ] **8.14** Run JSON syntax validation: `node -e "require('./messages/de.json')"`

**Key German Terms:**
- Account → Konto
- Settings → Einstellungen
- Profile → Profil
- Password → Passwort
- Email → E-Mail
- Property → Immobilie
- Save → Speichern
- Delete → Löschen

**CRITICAL:** All nouns MUST be capitalized in German (this is a fundamental grammar rule).

**Acceptance Criteria:**
- All ~150 settings keys translated to German
- Formal "Sie" form used consistently
- ALL nouns capitalized
- Compound words correct
- ICU format syntax preserved
- JSON syntax valid

---

### Task 9: Translate Dutch (Nederlands) - All Settings Sections

**Effort:** 4-5 hours (L)

Translate all ~150 keys in the settings namespace to Dutch.

**Subtasks:**

- [ ] **9.1** Locate the `settings.*` namespace in `/messages/nl.json` (lines 3348-3638 approximately)
- [ ] **9.2** Translate Account Settings section (20 keys) - use formal "u" form
- [ ] **9.3** Translate Profile Settings section (15 keys) - clear, professional language
- [ ] **9.4** Translate Preferences section (25 keys) - include language names in native form
- [ ] **9.5** Translate Notifications section (20 keys) - descriptive labels
- [ ] **9.6** Translate Security section (15 keys) - formal language with ICU plurals
- [ ] **9.7** Translate Help Content section (50+ keys) - clear, instructional content
- [ ] **9.8** Verify formal "u" form used throughout (not "je")
- [ ] **9.9** Verify sentence-initial capitalization only (unlike German - don't capitalize all nouns)
- [ ] **9.10** Check Dutch CLDR plural rules (one, other): `{count, plural, one {# actieve sessie} other {# actieve sessies}}`
- [ ] **9.11** Check compound words (less common than German but still present)
- [ ] **9.12** Check all variable placeholders preserved
- [ ] **9.13** Run JSON syntax validation: `node -e "require('./messages/nl.json')"`

**Key Dutch Terms:**
- Account → Account
- Settings → Instellingen
- Profile → Profiel
- Password → Wachtwoord
- Email → E-mail
- Property → Accommodatie
- Save → Opslaan
- Delete → Verwijderen

**Acceptance Criteria:**
- All ~150 settings keys translated to Dutch
- Formal "u" form used consistently
- Sentence-initial capitalization only
- ICU format syntax preserved
- JSON syntax valid

---

### Task 10: Translate Italian (Italiano) - All Settings Sections

**Effort:** 4-5 hours (L)

Translate all ~150 keys in the settings namespace to Italian.

**Subtasks:**

- [ ] **10.1** Locate the `settings.*` namespace in `/messages/it.json` (lines 3348-3638 approximately)
- [ ] **10.2** Translate Account Settings section (20 keys) - use formal "Lei" form
- [ ] **10.3** Translate Profile Settings section (15 keys) - clear, professional language with gender agreement
- [ ] **10.4** Translate Preferences section (25 keys) - include language names in native form
- [ ] **10.5** Translate Notifications section (20 keys) - descriptive labels
- [ ] **10.6** Translate Security section (15 keys) - formal language with ICU plurals
- [ ] **10.7** Translate Help Content section (50+ keys) - clear, instructional content
- [ ] **10.8** Verify formal "Lei" form used throughout (not "tu")
- [ ] **10.9** Check Italian CLDR plural rules (one, many, other): `{count, plural, one {# sessione attiva} other {# sessioni attive}}`
- [ ] **10.10** Verify accent marks correct: à, è, é, ì, ò, ù
- [ ] **10.11** Check gender agreement (l'account, la password, il profilo)
- [ ] **10.12** Check all variable placeholders preserved
- [ ] **10.13** Run JSON syntax validation: `node -e "require('./messages/it.json')"`

**Key Italian Terms:**
- Account → Account
- Settings → Impostazioni
- Profile → Profilo
- Password → Password
- Email → E-mail
- Property → Proprietà
- Save → Salva
- Delete → Elimina

**Acceptance Criteria:**
- All ~150 settings keys translated to Italian
- Formal "Lei" form used consistently
- Gender agreement correct
- ICU format syntax preserved
- JSON syntax valid

---

### Task 11: Validate All Translation Files

**Effort:** 2-3 hours (M)

Run comprehensive validation checks on all 5 language files to ensure quality and completeness.

**Subtasks:**

- [ ] **11.1** Run JSON syntax validation for all 5 files:
  ```bash
  for lang in fr es de nl it; do
    node -e "require('./messages/${lang}.json')"
  done
  ```
- [ ] **11.2** Verify structure consistency - all files have matching key structure to en.json
- [ ] **11.3** Check for English placeholders in non-English files (search for common English words like "Account Settings", "Email Address", "Change Password")
- [ ] **11.4** Validate ICU format syntax - check plural forms use correct CLDR categories for each language
- [ ] **11.5** Verify all variable placeholders preserved: {email}, {date}, {time}, {count}, {language}
- [ ] **11.6** Count translated keys per language - verify all sections present (account, profile, preferences, notifications, security, help)
- [ ] **11.7** Check accessibility strings (aria-labels) are descriptive and translated
- [ ] **11.8** Verify formal address forms used consistently in each language (vous, usted, Sie, u, Lei)
- [ ] **11.9** Check language-specific requirements: French accents, German capitalization, Spanish accents, Dutch capitalization, Italian accents
- [ ] **11.10** Verify no truncated content or incomplete translations
- [ ] **11.11** Run `npm run typecheck` to ensure no TypeScript errors
- [ ] **11.12** Run `npm run lint` to check for any linting issues

**Validation Scripts:**

**Structure Consistency Check:**
```bash
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
"
```

**English Placeholder Check:**
```bash
for lang in fr es de nl it; do
  echo "Checking messages/${lang}.json for English placeholders..."
  grep -A 300 '"settings": {' messages/${lang}.json | \
    grep -i '"Account Settings"\|"Email Address"\|"Change Password"' | \
    head -5
done
```

**Acceptance Criteria:**
- All 5 files pass JSON syntax validation
- Structure matches en.json (same keys)
- No English placeholders remain
- ICU format syntax correct
- All aria-labels translated
- No TypeScript or linting errors

---

### Task 12: Manual Quality Review

**Effort:** 2-3 hours (M)

Human review of translations for quality, accuracy, and naturalness.

**Subtasks:**

- [ ] **12.1** Review French translations for contextual accuracy and natural language flow
- [ ] **12.2** Check French formal "vous" form used consistently, terminology consistent
- [ ] **12.3** Review Spanish translations for contextual accuracy and Latin American neutral dialect
- [ ] **12.4** Check Spanish formal "usted" form used consistently, terminology consistent
- [ ] **12.5** Review German translations for contextual accuracy, verify ALL nouns capitalized
- [ ] **12.6** Check German formal "Sie" form used consistently, compound words correct
- [ ] **12.7** Review Dutch translations for contextual accuracy and natural language flow
- [ ] **12.8** Check Dutch formal "u" form used consistently, capitalization correct (sentence-initial only)
- [ ] **12.9** Review Italian translations for contextual accuracy and gender agreement
- [ ] **12.10** Check Italian formal "Lei" form used consistently, terminology consistent
- [ ] **12.11** Review help content (all languages) for instructional clarity - ensure step-by-step instructions are clear
- [ ] **12.12** Check security/privacy language is respectful, clear, and appropriately formal
- [ ] **12.13** Verify technical terms (QR code, email, authentication) accurate and consistent
- [ ] **12.14** Check for cultural appropriateness - no idioms or expressions that don't translate well
- [ ] **12.15** Document any issues found for revision

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

**Acceptance Criteria:**
- All languages reviewed for quality
- Issues documented and fixed
- Translations read naturally to native speakers
- Help content clear and actionable

---

### Task 13: Testing in Application UI

**Effort:** 2-3 hours (M)

Test translations in the actual application UI to verify correct display and functionality.

**Subtasks:**

- [ ] **13.1** Start development server: `npm run dev`
- [ ] **13.2** Test language switching - switch to each of 5 languages (fr, es, de, nl, it) and verify app language changes
- [ ] **13.3** Test Account Settings page in all 5 languages:
  - Verify labels, buttons, messages display translated
  - Test form validation messages
  - Check success/error messages
  - Verify aria-labels work with screen reader
- [ ] **13.4** Test Profile page in all 5 languages:
  - Check display name, bio, avatar labels
  - Test character counter (500 chars)
  - Verify upload/remove buttons
  - Check success messages
- [ ] **13.5** Test Preferences page in all 5 languages:
  - Verify language selector shows native names (Français, Español, Deutsch, etc.)
  - Check theme selector options (Light/Dark/System)
  - Verify timezone dropdown
  - Test notification toggles
  - Check success messages
- [ ] **13.6** Test Security page in all 5 languages:
  - Verify 2FA section labels
  - Check active sessions list
  - Test session count plurals with different counts (0, 1, 2, 5)
  - Verify revoke buttons
- [ ] **13.7** Test Help page in all 5 languages:
  - Check page title and subtitle
  - Verify all 5 section titles
  - Test expand/collapse functionality
  - Read through instruction steps (clarity check)
  - Check link labels
  - Verify footer text
- [ ] **13.8** Test layout and text overflow:
  - Check that German text (typically longer) fits in buttons without overflow
  - Verify no text truncation
  - Test responsive layouts (desktop, tablet, mobile)
  - Check wrapping behavior
- [ ] **13.9** Test ICU format functionality:
  - Test plural forms with different counts (0, 1, 2, 5, 100)
  - Verify date/time formatting with ICU variables
  - Check variable interpolation works ({email}, {date}, {count})
- [ ] **13.10** Verify no English fallbacks visible (except for untranslated sections outside settings)
- [ ] **13.11** Check browser console for errors (no translation errors or warnings)
- [ ] **13.12** Verify navigation and functionality unchanged - translations don't break features
- [ ] **13.13** Check performance acceptable (no slowdown from larger translation files)
- [ ] **13.14** Document any display issues or errors found

**Testing URLs:**
- French: `http://localhost:3000/fr/dashboard2/settings`
- Spanish: `http://localhost:3000/es/dashboard2/settings`
- German: `http://localhost:3000/de/dashboard2/settings`
- Dutch: `http://localhost:3000/nl/dashboard2/settings`
- Italian: `http://localhost:3000/it/dashboard2/settings`

**Acceptance Criteria:**
- All 5 languages load without errors
- No English fallbacks visible in settings section
- Text fits in UI elements (no overflow/truncation)
- Plurals work correctly with different counts
- Variable interpolation works correctly
- Navigation and functionality unchanged
- No console errors

---

## Translation Keys Summary

**Total Translation Keys:** ~150 keys across 6 categories

### Account Settings (20 keys)
- Page: title, subtitle
- Email: email, emailDescription, emailInputAriaLabel, changeEmail, changeEmailButtonAriaLabel, emailUpdated
- Password: currentPassword, newPassword, confirmPassword, changePassword, passwordUpdated
- Deletion: deleteAccount, deleteAccountButtonAriaLabel, deleteWarning, deleteConfirmation
- ICU format: sessionsActive, lastLogin, accountCreated, manageSubscription

### Profile Settings (15 keys)
- Page: title, subtitle
- Display name: displayName, displayNamePlaceholder, displayNameAriaLabel
- Bio: bio, bioPlaceholder, bioMaxLength
- Avatar: avatar, uploadAvatar, uploadAvatarAriaLabel, removeAvatar, removeAvatarAriaLabel, avatarUpdated, avatarRemoved
- Actions: saveChanges, savingChanges, profileUpdated

### Preferences (25 keys)
- Page: title, subtitle
- Language: language, languageDescription, languageSelectorAriaLabel, languageUpdated
- Language names: supportedLanguages.* (6 languages in native form)
- Theme: theme, themeDescription, themeSelectorAriaLabel, themeUpdated
- Theme options: themeOptions.* (light, dark, system)
- Other: timezone, timezoneDescription, timezoneSelectorAriaLabel, timezoneUpdated, dateFormat, timeFormat, preferencesUpdated

### Notifications (20 keys)
- Page: title, subtitle
- Types: emailNotifications, emailNotificationsDescription, pushNotifications, pushNotificationsDescription
- Categories: itemUpdates, itemUpdatesDescription, propertyUpdates, propertyUpdatesDescription, systemAnnouncements, systemAnnouncementsDescription, weeklyDigest, weeklyDigestDescription
- Actions: unreadCount (ICU), markAllRead, notificationsUpdated

### Security (15 keys)
- Page: title, subtitle
- 2FA: twoFactorAuth, twoFactorAuthDescription, enable2FA, disable2FA, twoFactorEnabled, twoFactorDisabled
- Sessions: activeSessions, activeSessionsDescription, sessionsActive (ICU), revokeSession, revokeAllOther, currentDevice, lastActive (ICU), securityUpdated

### Help Content (50+ keys)
- Page-level: page.* (8 keys)
- Section labels: sections.* (5 keys)
- Getting Started: gettingStarted.* (~9 keys)
- Property Management: propertyManagement.* (~8 keys)
- Item Creation: itemCreation.* (~16 keys)
- QR Codes: qrCodes.* (~11 keys)
- Item Management: itemManagement.* (~8 keys)

---

## Language-Specific Requirements

### French (Français)
- **Formal address:** Use "vous" (not "tu")
- **CLDR plurals:** one, many, other
- **Quotation marks:** « guillemets »
- **Accents:** é, è, ê, à, ô
- **Gender agreement:** la propriété, le compte
- **Example:** "Paramètres du compte", "Gérer vos préférences"

### Spanish (Español)
- **Formal address:** Use "usted" (not "tú")
- **Dialect:** Latin American Spanish (neutral, avoid regional slang)
- **CLDR plurals:** one, many, other
- **Punctuation:** Inverted question marks ¿?
- **Accents:** á, é, í, ó, ú, ñ
- **Example:** "Configuración de la cuenta", "Gestionar sus preferencias"

### German (Deutsch)
- **Formal address:** Use "Sie" (not "du")
- **CLDR plurals:** one, other (simpler)
- **Capitalization:** ALL nouns MUST be capitalized
- **Compound words:** Kontoeinstellungen, Benutzereinstellungen
- **Umlauts:** ä, ö, ü, ß
- **Example:** "Kontoeinstellungen", "Ihre Einstellungen verwalten"

### Dutch (Nederlands)
- **Formal address:** Use "u" (not "je")
- **CLDR plurals:** one, other
- **Capitalization:** Sentence-initial only (unlike German)
- **Compound words:** Less common than German but present
- **Example:** "Accountinstellingen", "Uw voorkeuren beheren"

### Italian (Italiano)
- **Formal address:** Use "Lei" (not "tu")
- **CLDR plurals:** one, many, other
- **Accents:** à, è, é, ì, ò, ù
- **Gender agreement:** l'account, la password, il profilo
- **Example:** "Impostazioni dell'account", "Gestisci le tue preferenze"

---

## ICU Message Format Examples

### Variable Interpolation
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

### Plural Forms (CLDR Rules)

**French (one, many, other):**
```json
"sessionsActive": "{count, plural, one {# session active} many {# sessions actives} other {# sessions actives}}"
```

**Spanish (one, other):**
```json
"sessionsActive": "{count, plural, one {# sesión activa} other {# sesiones activas}}"
```

**German (one, other):**
```json
"sessionsActive": "{count, plural, one {# aktive Sitzung} other {# aktive Sitzungen}}"
```

**Dutch (one, other):**
```json
"sessionsActive": "{count, plural, one {# actieve sessie} other {# actieve sessies}}"
```

**Italian (one, other):**
```json
"sessionsActive": "{count, plural, one {# sessione attiva} other {# sessioni attive}}"
```

---

## Quality Standards

**Translation Quality Requirements:**
1. **Professional Level:** Translations should read naturally to native speakers
2. **Contextual Accuracy:** Understand UI context (buttons, labels, instructions)
3. **Consistency:** Use consistent terminology throughout
4. **Formal Tone:** Maintain professional, formal address
5. **Cultural Appropriateness:** Respect cultural norms and conventions
6. **Technical Accuracy:** Preserve meaning of technical terms

**Common Pitfalls to Avoid:**
- ❌ Machine translation without human review
- ❌ Mixing formal and informal address
- ❌ Literal word-for-word translation
- ❌ Breaking ICU message format syntax
- ❌ Inconsistent terminology
- ❌ Overly technical jargon

---

## Notes

1. **Translation Method:** Professional translators or native speaker contractors with UI/UX experience are strongly recommended over machine translation alone.

2. **ICU Format Critical:** Carefully preserve ICU message format syntax. Variables must use exact same names: {email}, {date}, {count}. Plural forms must follow CLDR rules for each language.

3. **German Capitalization:** ALL nouns must be capitalized in German (Konto, Einstellungen, Passwort, Immobilie, etc.). This is a fundamental grammar rule and errors will make translations look unprofessional.

4. **Text Length:** German translations are typically 30% longer than English. Test in UI to ensure text fits without overflow.

5. **Language Names:** Use native form for language names (Français, not "French" in French).

6. **Help Content:** Instructions should be clear, actionable, and step-by-step. Maintain instructional tone appropriate for user documentation.

7. **Context Access:** If using professional translators, provide UI screenshots and context for better translation quality.

8. **Review Process:** Native speaker review highly recommended for each language, particularly for help content clarity.

---

## End of Document

---

*Document generated: 2026-01-22 23:45*
