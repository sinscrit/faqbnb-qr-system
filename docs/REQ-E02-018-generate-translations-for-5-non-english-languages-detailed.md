# REQ-E02-018: Generate Translations for Settings and Account Namespace - Detailed Task Breakdown

*Generated: 2026-01-20 15:30:00 UTC*
*Last Modified: 2026-01-20 15:30:00 UTC*

## Reference

- **Request**: REQ-E02-018 (Generate Translations for Settings and Account Namespace)
- **Source**: docs/gen_requests_epic2.md
- **Overview Document**: docs/REQ-E02-018-generate-translations-for-5-non-english-languages-overview.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature
- **Phase**: 2G (Settings & Account)
- **Task ID**: 2G.6
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-013 (Task 2G.1 - Settings namespace structure created)
  - REQ-E02-014 (Task 2G.2 - Account settings components updated)
  - REQ-E02-015 (Task 2G.3 - Profile components updated)
  - REQ-E02-016 (Task 2G.4 - Preferences components updated)
  - REQ-E02-017 (Task 2G.5 - Help page updated)

---

## Summary

Generate translation files for all Settings and Account namespace strings (~137 strings) in the five supported non-English languages: Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it). This task translates the complete `settings` namespace including account management, profile settings, user preferences, and comprehensive help/user guide content.

---

## Prerequisites

Before starting this task, ensure:
1. Tasks 2G.1 through 2G.5 are complete - `settings` namespace fully populated in `/messages/en.json`
2. Epic 1 foundation is in place - `next-intl` is installed and configured
3. All 5 non-English language files exist in `/messages/`

---

## Detailed Tasks

### Task 1: Verify and Document English Source Strings
**Estimate**: 1 story point
**Priority**: P0 - Must do first

#### Description
Extract and document all `settings` namespace strings from `/messages/en.json` to serve as the translation source. Create a reference checklist for translator validation.

#### Steps
1. Read the complete `settings` namespace from `/messages/en.json`
2. Document total string count by category
3. Identify strings with variables (`{variable}`)
4. Identify strings with ICU pluralization patterns
5. Flag strings requiring special translation attention (help content, security warnings)

#### Expected String Categories

| Category | Estimated Count | Notes |
|----------|-----------------|-------|
| Top-level labels | 2 | Page title, subtitle |
| Section labels | 5 | Tab/navigation sections |
| Account settings | 18 | Email, access, roles, dates |
| Profile settings | 7 | Name, avatar management |
| Preferences | 12 | Language, theme, dashboard |
| Help - headers | 5 | Main page elements |
| Help - sections | 25 | 5 section titles/descriptions |
| Help - steps | 44 | 22 step titles + content |
| Help - tips | 8 | Contextual tips |
| Help - links | 4 | Action link labels |
| Help - support | 3 | Footer support section |
| Navigation | 4 | Nav labels |
| **Total** | **~137** | |

#### Acceptance Criteria
- [ ] Complete `settings` namespace documented
- [ ] All variable placeholders identified (`{date}`, `{count}`, `{tip}`)
- [ ] All ICU format strings identified
- [ ] String count verified against overview document (~137)

#### Verification Commands
```bash
# Count keys in settings namespace (approximate)
cat messages/en.json | grep -c '"settings'

# Find all variable interpolations
grep -o '{[^}]*}' messages/en.json | sort | uniq
```

---

### Task 2: Generate French (fr) Translations
**Estimate**: 1 story point
**Priority**: P0 - High-usage language

#### Description
Translate all `settings` namespace strings to French, using formal address ("vous").

#### Translation Guidelines for French
- **Formal Address**: Use "vous" consistently (not "tu")
- **Technical Terms**: Use standard French equivalents where available
- **Product Names**: Keep "FAQBNB" and "QR Code" as-is
- **Interpolation**: Preserve all `{variable}` placeholders exactly
- **ICU Format**: Maintain correct pluralization syntax

#### Key Translations Reference

| English | French |
|---------|--------|
| Settings | Parametres |
| Account | Compte |
| Profile | Profil |
| Preferences | Preferences |
| Language | Langue |
| Theme | Theme |
| Help | Aide |
| Owner | Proprietaire |
| Admin | Administrateur |
| Member | Membre |
| Light | Clair |
| Dark | Sombre |
| System | Systeme |

#### Sample Translations

```json
{
  "settings": {
    "title": "Parametres",
    "subtitle": "Gerez les parametres de votre compte",
    "sections": {
      "account": "Compte",
      "profile": "Profil",
      "preferences": "Preferences",
      "notifications": "Notifications",
      "security": "Securite"
    },
    "account": {
      "email": "Adresse e-mail",
      "emailDescription": "L'adresse e-mail de votre compte",
      "membersCount": "{count, plural, one {# membre} other {# membres}}",
      "createdOn": "Cree le {date}",
      "owner": "Proprietaire",
      "admin": "Administrateur",
      "member": "Membre"
    },
    "preferences": {
      "language": "Langue",
      "languageDescription": "Choisissez votre langue preferee",
      "theme": "Theme",
      "themeOptions": {
        "light": "Clair",
        "dark": "Sombre",
        "system": "Systeme"
      }
    },
    "help": {
      "title": "Aide et guide d'utilisation",
      "subtitle": "Apprenez a utiliser FAQBNB pour creer et gerer les articles de votre propriete",
      "quickLinks": "Liens rapides",
      "stillNeedHelp": "Besoin d'aide supplementaire ?",
      "contactSupport": "Contacter le support",
      "tip": "Conseil : {tip}"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All ~137 strings translated to French
- [ ] Formal "vous" used consistently
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization syntax correct for French
- [ ] Help content maintains instructional tone
- [ ] JSON is valid after edit

#### Files to Modify
| File | Action |
|------|--------|
| `/messages/fr.json` | Add complete French `settings` namespace |

---

### Task 3: Generate Spanish (es) Translations
**Estimate**: 1 story point
**Priority**: P0 - High-usage language

#### Description
Translate all `settings` namespace strings to Spanish, using formal/neutral address.

#### Translation Guidelines for Spanish
- **Formal Address**: Use formal constructions or neutral phrasing (avoid "tu")
- **Regional Neutrality**: Use neutral Latin American/Iberian Spanish where possible
- **Technical Terms**: Use standard Spanish equivalents
- **Interpolation**: Preserve all `{variable}` placeholders exactly

#### Key Translations Reference

| English | Spanish |
|---------|---------|
| Settings | Configuracion |
| Account | Cuenta |
| Profile | Perfil |
| Preferences | Preferencias |
| Language | Idioma |
| Theme | Tema |
| Help | Ayuda |
| Owner | Propietario |
| Admin | Administrador |
| Member | Miembro |
| Light | Claro |
| Dark | Oscuro |
| System | Sistema |

#### Sample Translations

```json
{
  "settings": {
    "title": "Configuracion",
    "subtitle": "Administre la configuracion de su cuenta",
    "sections": {
      "account": "Cuenta",
      "profile": "Perfil",
      "preferences": "Preferencias",
      "notifications": "Notificaciones",
      "security": "Seguridad"
    },
    "account": {
      "email": "Direccion de correo electronico",
      "emailDescription": "La direccion de correo electronico de su cuenta",
      "membersCount": "{count, plural, one {# miembro} other {# miembros}}",
      "createdOn": "Creado el {date}",
      "owner": "Propietario",
      "admin": "Administrador",
      "member": "Miembro"
    },
    "preferences": {
      "language": "Idioma",
      "languageDescription": "Elija su idioma preferido",
      "theme": "Tema",
      "themeOptions": {
        "light": "Claro",
        "dark": "Oscuro",
        "system": "Sistema"
      }
    },
    "help": {
      "title": "Ayuda y guia del usuario",
      "subtitle": "Aprenda a usar FAQBNB para crear y administrar los articulos de su propiedad",
      "quickLinks": "Enlaces rapidos",
      "stillNeedHelp": "Aun necesita ayuda?",
      "contactSupport": "Contactar soporte",
      "tip": "Consejo: {tip}"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All ~137 strings translated to Spanish
- [ ] Formal/neutral address used consistently
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization syntax correct for Spanish
- [ ] Help content maintains instructional clarity
- [ ] JSON is valid after edit

#### Files to Modify
| File | Action |
|------|--------|
| `/messages/es.json` | Add complete Spanish `settings` namespace |

---

### Task 4: Generate German (de) Translations
**Estimate**: 1 story point
**Priority**: P0 - High-usage language

#### Description
Translate all `settings` namespace strings to German, using formal address ("Sie").

#### Translation Guidelines for German
- **Formal Address**: Use "Sie" consistently (capitalized)
- **Compound Words**: Proper German compound word formation
- **Text Expansion**: German translations may be 20-30% longer
- **Technical Terms**: Use standard German equivalents where available

#### Key Translations Reference

| English | German |
|---------|--------|
| Settings | Einstellungen |
| Account | Konto |
| Profile | Profil |
| Preferences | Einstellungen |
| Language | Sprache |
| Theme | Design |
| Help | Hilfe |
| Owner | Eigentumer |
| Admin | Administrator |
| Member | Mitglied |
| Light | Hell |
| Dark | Dunkel |
| System | System |

#### Sample Translations

```json
{
  "settings": {
    "title": "Einstellungen",
    "subtitle": "Verwalten Sie Ihre Kontoeinstellungen",
    "sections": {
      "account": "Konto",
      "profile": "Profil",
      "preferences": "Einstellungen",
      "notifications": "Benachrichtigungen",
      "security": "Sicherheit"
    },
    "account": {
      "email": "E-Mail-Adresse",
      "emailDescription": "Die E-Mail-Adresse Ihres Kontos",
      "membersCount": "{count, plural, one {# Mitglied} other {# Mitglieder}}",
      "createdOn": "Erstellt am {date}",
      "owner": "Eigentumer",
      "admin": "Administrator",
      "member": "Mitglied"
    },
    "preferences": {
      "language": "Sprache",
      "languageDescription": "Wahlen Sie Ihre bevorzugte Sprache",
      "theme": "Design",
      "themeOptions": {
        "light": "Hell",
        "dark": "Dunkel",
        "system": "System"
      }
    },
    "help": {
      "title": "Hilfe & Benutzerhandbuch",
      "subtitle": "Erfahren Sie, wie Sie FAQBNB verwenden, um Ihre Immobilienartikel zu erstellen und zu verwalten",
      "quickLinks": "Schnellzugriff",
      "stillNeedHelp": "Noch Fragen?",
      "contactSupport": "Support kontaktieren",
      "tip": "Tipp: {tip}"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All ~137 strings translated to German
- [ ] Formal "Sie" used consistently (capitalized)
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization syntax correct for German
- [ ] Compound words properly formed
- [ ] JSON is valid after edit

#### Files to Modify
| File | Action |
|------|--------|
| `/messages/de.json` | Add complete German `settings` namespace |

---

### Task 5: Generate Dutch (nl) Translations
**Estimate**: 1 story point
**Priority**: P1 - Regional language

#### Description
Translate all `settings` namespace strings to Dutch, using formal address ("u").

#### Translation Guidelines for Dutch
- **Formal Address**: Use "u" consistently (not "je")
- **Technical Terms**: Use standard Dutch equivalents
- **Anglicisms**: Some English terms are commonly used in Dutch tech contexts

#### Key Translations Reference

| English | Dutch |
|---------|-------|
| Settings | Instellingen |
| Account | Account |
| Profile | Profiel |
| Preferences | Voorkeuren |
| Language | Taal |
| Theme | Thema |
| Help | Help |
| Owner | Eigenaar |
| Admin | Beheerder |
| Member | Lid |
| Light | Licht |
| Dark | Donker |
| System | Systeem |

#### Sample Translations

```json
{
  "settings": {
    "title": "Instellingen",
    "subtitle": "Beheer uw accountinstellingen",
    "sections": {
      "account": "Account",
      "profile": "Profiel",
      "preferences": "Voorkeuren",
      "notifications": "Meldingen",
      "security": "Beveiliging"
    },
    "account": {
      "email": "E-mailadres",
      "emailDescription": "Het e-mailadres van uw account",
      "membersCount": "{count, plural, one {# lid} other {# leden}}",
      "createdOn": "Aangemaakt op {date}",
      "owner": "Eigenaar",
      "admin": "Beheerder",
      "member": "Lid"
    },
    "preferences": {
      "language": "Taal",
      "languageDescription": "Kies uw voorkeurstaal",
      "theme": "Thema",
      "themeOptions": {
        "light": "Licht",
        "dark": "Donker",
        "system": "Systeem"
      }
    },
    "help": {
      "title": "Help & Gebruikershandleiding",
      "subtitle": "Leer hoe u FAQBNB gebruikt om uw vastgoedartikelen te maken en te beheren",
      "quickLinks": "Snelle links",
      "stillNeedHelp": "Nog steeds hulp nodig?",
      "contactSupport": "Contact opnemen met support",
      "tip": "Tip: {tip}"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All ~137 strings translated to Dutch
- [ ] Formal "u" used consistently
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization syntax correct for Dutch
- [ ] JSON is valid after edit

#### Files to Modify
| File | Action |
|------|--------|
| `/messages/nl.json` | Add complete Dutch `settings` namespace |

---

### Task 6: Generate Italian (it) Translations
**Estimate**: 1 story point
**Priority**: P1 - Regional language

#### Description
Translate all `settings` namespace strings to Italian, using formal address ("Lei").

#### Translation Guidelines for Italian
- **Formal Address**: Use "Lei" form consistently (not "tu")
- **Technical Terms**: Use standard Italian equivalents
- **Gender Agreement**: Pay attention to masculine/feminine forms

#### Key Translations Reference

| English | Italian |
|---------|---------|
| Settings | Impostazioni |
| Account | Account |
| Profile | Profilo |
| Preferences | Preferenze |
| Language | Lingua |
| Theme | Tema |
| Help | Aiuto |
| Owner | Proprietario |
| Admin | Amministratore |
| Member | Membro |
| Light | Chiaro |
| Dark | Scuro |
| System | Sistema |

#### Sample Translations

```json
{
  "settings": {
    "title": "Impostazioni",
    "subtitle": "Gestisci le impostazioni del tuo account",
    "sections": {
      "account": "Account",
      "profile": "Profilo",
      "preferences": "Preferenze",
      "notifications": "Notifiche",
      "security": "Sicurezza"
    },
    "account": {
      "email": "Indirizzo e-mail",
      "emailDescription": "L'indirizzo e-mail del tuo account",
      "membersCount": "{count, plural, one {# membro} other {# membri}}",
      "createdOn": "Creato il {date}",
      "owner": "Proprietario",
      "admin": "Amministratore",
      "member": "Membro"
    },
    "preferences": {
      "language": "Lingua",
      "languageDescription": "Scegli la tua lingua preferita",
      "theme": "Tema",
      "themeOptions": {
        "light": "Chiaro",
        "dark": "Scuro",
        "system": "Sistema"
      }
    },
    "help": {
      "title": "Aiuto & Guida utente",
      "subtitle": "Scopri come usare FAQBNB per creare e gestire gli articoli della tua proprieta",
      "quickLinks": "Link rapidi",
      "stillNeedHelp": "Hai ancora bisogno di aiuto?",
      "contactSupport": "Contatta il supporto",
      "tip": "Suggerimento: {tip}"
    }
  }
}
```

#### Acceptance Criteria
- [ ] All ~137 strings translated to Italian
- [ ] Formal address used consistently
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization syntax correct for Italian
- [ ] Gender agreement correct where applicable
- [ ] JSON is valid after edit

#### Files to Modify
| File | Action |
|------|--------|
| `/messages/it.json` | Add complete Italian `settings` namespace |

---

### Task 7: Help Section Translations - All Languages
**Estimate**: 2 story points
**Priority**: P0 - Largest content section

#### Description
The help section contains ~80 strings and requires special attention for instructional clarity across all 5 languages.

#### Help Section Structure

The help section follows this nested structure:
```json
{
  "settings": {
    "help": {
      "title": "...",
      "subtitle": "...",
      "quickLinks": "...",
      "stillNeedHelp": "...",
      "stillNeedHelpDescription": "...",
      "contactSupport": "...",
      "tip": "Tip: {tip}",
      "sections": {
        "gettingStarted": {
          "title": "...",
          "description": "...",
          "step1Title": "...",
          "step1Content": "...",
          "step1Tip": "...",
          "step2Title": "...",
          "step2Content": "...",
          "step3Title": "...",
          "step3Content": "..."
        },
        "propertyManagement": { /* similar structure */ },
        "itemCreation": { /* similar structure, 6 steps */ },
        "qrCodes": { /* similar structure */ },
        "itemManagement": { /* similar structure */ }
      },
      "links": {
        "gettingStarted": "...",
        "propertyManagement": "...",
        "itemCreation": "...",
        "qrCodes": "..."
      }
    }
  }
}
```

#### Instructional Tone Guidelines

| Aspect | English Example | Translation Guidance |
|--------|-----------------|---------------------|
| Action verbs | "Click", "Navigate", "Enter" | Use imperative forms |
| Feature references | "Properties page" | Translate page names |
| Step sequences | "Step 1:", "First," | Use language-appropriate sequencing |
| Tips | "Tip: You can..." | Maintain helpful, encouraging tone |
| Product terms | "QR Code", "FAQBNB" | Keep as-is or use standard local equivalent |

#### Sample Help Section Translations

**Section: Getting Started (gettingStarted)**

| Key | English | French | Spanish | German | Dutch | Italian |
|-----|---------|--------|---------|--------|-------|---------|
| title | Getting Started | Pour commencer | Primeros pasos | Erste Schritte | Aan de slag | Per iniziare |
| description | Learn the basics of FAQBNB | Apprenez les bases de FAQBNB | Aprenda lo basico de FAQBNB | Lernen Sie die Grundlagen von FAQBNB | Leer de basis van FAQBNB | Impara le basi di FAQBNB |
| step1Title | Create Your Property | Creez votre propriete | Cree su propiedad | Erstellen Sie Ihre Immobilie | Maak uw eigendom aan | Crea la tua proprieta |

#### Acceptance Criteria
- [ ] All 5 help sections translated in all 5 languages
- [ ] Step instructions maintain clear, actionable language
- [ ] Tips are helpful and encouraging in all languages
- [ ] Navigation links are accurately translated
- [ ] Support section is complete in all languages

---

### Task 8: Validate Translation File Structure
**Estimate**: 1 story point
**Priority**: P0 - Must complete before merge

#### Description
Verify all translation files have identical key structures and no missing translations.

#### Validation Steps

1. **JSON Syntax Validation**
```bash
# Validate all JSON files
for file in messages/*.json; do
  echo "Validating $file..."
  npx jsonlint "$file" --quiet
done
```

2. **Key Structure Comparison**
```bash
# Extract keys from English file
cat messages/en.json | jq -r '.. | objects | keys[]' | sort | uniq > /tmp/en-keys.txt

# Compare with each language file
for lang in fr es de nl it; do
  cat messages/${lang}.json | jq -r '.. | objects | keys[]' | sort | uniq > /tmp/${lang}-keys.txt
  diff /tmp/en-keys.txt /tmp/${lang}-keys.txt || echo "Differences found in ${lang}.json"
done
```

3. **Variable Placeholder Verification**
```bash
# Ensure all {variable} patterns exist in translations
grep -o '{[a-zA-Z]*}' messages/en.json | sort | uniq > /tmp/en-vars.txt

for lang in fr es de nl it; do
  grep -o '{[a-zA-Z]*}' messages/${lang}.json | sort | uniq > /tmp/${lang}-vars.txt
  diff /tmp/en-vars.txt /tmp/${lang}-vars.txt || echo "Variable mismatch in ${lang}.json"
done
```

4. **ICU Format Validation**
```bash
# Check pluralization syntax
grep -E 'plural,' messages/*.json
```

#### Acceptance Criteria
- [ ] All 6 JSON files pass syntax validation
- [ ] All files have identical key structures
- [ ] All variable placeholders preserved in all languages
- [ ] ICU pluralization syntax valid in all languages
- [ ] No empty string values

---

### Task 9: Build Verification and Testing
**Estimate**: 1 story point
**Priority**: P0 - Final validation

#### Description
Run build and perform manual verification that translations load correctly.

#### Build Verification
```bash
# Run TypeScript compilation
npm run build

# Check for i18n-related errors
npm run build 2>&1 | grep -i "translation\|i18n\|intl"
```

#### Manual Testing Checklist

**For each language (fr, es, de, nl, it):**

1. **Settings Page**
   - [ ] Page title displays correctly
   - [ ] Section tabs display correctly
   - [ ] No text truncation or overflow

2. **Account Settings**
   - [ ] Email label displays correctly
   - [ ] Role badges display correctly (Owner, Admin, Member)
   - [ ] Date formatting works with `{date}` interpolation
   - [ ] Member count pluralizes correctly ("1 member" vs "5 members")

3. **Profile Section**
   - [ ] Display name label translates
   - [ ] Avatar management labels translate
   - [ ] Upload/remove photo buttons translate

4. **Preferences Section**
   - [ ] Language dropdown label translates
   - [ ] Theme options translate (Light/Dark/System)
   - [ ] Dashboard preferences translate

5. **Help Page**
   - [ ] Page title and subtitle display correctly
   - [ ] Quick links header translates
   - [ ] All 5 section titles display correctly
   - [ ] Step instructions are readable and clear
   - [ ] Tips display with `{tip}` interpolation
   - [ ] Support section translates
   - [ ] Contact support link text translates

#### Console Verification
```bash
# Start dev server and check console
npm run dev

# Look for missing translation warnings
# No "[Missing translation]" or "[key]" raw outputs should appear
```

#### Acceptance Criteria
- [ ] `npm run build` succeeds without errors
- [ ] No TypeScript type errors related to translations
- [ ] No console warnings about missing translation keys
- [ ] All settings pages render correctly in all 5 languages
- [ ] Help content is readable and instructional in all languages
- [ ] No English strings appear as fallback in non-English locales

---

## Files Summary

### Translation Files to Modify (5 files)

| File | Action |
|------|--------|
| `/messages/fr.json` | Add complete French `settings` namespace |
| `/messages/es.json` | Add complete Spanish `settings` namespace |
| `/messages/de.json` | Add complete German `settings` namespace |
| `/messages/nl.json` | Add complete Dutch `settings` namespace |
| `/messages/it.json` | Add complete Italian `settings` namespace |

### Reference Files (Read Only)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source English translations (do not modify) |
| `/src/lib/i18n/config.ts` | Locale configuration reference |

### Files NOT to Modify

- `/messages/en.json` - English source should already be complete
- `/src/components/*.tsx` - Component files are not in scope
- `/src/app/**/*.tsx` - Page files are not in scope
- Any TypeScript/JavaScript source files
- Database migrations
- API routes

---

## Story Points Summary

| Task | Description | Story Points |
|------|-------------|--------------|
| Task 1 | Verify and document English source strings | 1 |
| Task 2 | Generate French translations | 1 |
| Task 3 | Generate Spanish translations | 1 |
| Task 4 | Generate German translations | 1 |
| Task 5 | Generate Dutch translations | 1 |
| Task 6 | Generate Italian translations | 1 |
| Task 7 | Help section translations (all languages) | 2 |
| Task 8 | Validate translation file structure | 1 |
| Task 9 | Build verification and testing | 1 |
| **Total** | | **10 SP** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation quality issues | Medium | Medium | Use professional terminology, review critical text |
| Missing interpolation variables | Low | High | Automated validation script in Task 8 |
| Incorrect pluralization syntax | Medium | Medium | Test with different count values (0, 1, 5) |
| Character encoding issues | Low | Medium | Ensure UTF-8 encoding, test accented characters |
| Inconsistent terminology across sections | Medium | Low | Use terminology glossary for consistency |
| JSON syntax errors | Low | High | Validate JSON before each commit |
| Help content clarity loss | Medium | Medium | Review instructional tone in all languages |
| Text overflow in UI | Medium | Low | Test with German (longest text) |

---

## Terminology Glossary

To ensure consistent translations across the settings namespace:

### Core Terms

| English | Spanish | French | German | Dutch | Italian |
|---------|---------|--------|--------|-------|---------|
| Settings | Configuracion | Parametres | Einstellungen | Instellingen | Impostazioni |
| Account | Cuenta | Compte | Konto | Account | Account |
| Profile | Perfil | Profil | Profil | Profiel | Profilo |
| Preferences | Preferencias | Preferences | Einstellungen | Voorkeuren | Preferenze |
| Security | Seguridad | Securite | Sicherheit | Beveiliging | Sicurezza |
| Notifications | Notificaciones | Notifications | Benachrichtigungen | Meldingen | Notifiche |

### Role Terms

| English | Spanish | French | German | Dutch | Italian |
|---------|---------|--------|--------|-------|---------|
| Owner | Propietario | Proprietaire | Eigentumer | Eigenaar | Proprietario |
| Admin | Administrador | Administrateur | Administrator | Beheerder | Amministratore |
| Member | Miembro | Membre | Mitglied | Lid | Membro |

### Theme Terms

| English | Spanish | French | German | Dutch | Italian |
|---------|---------|--------|--------|-------|---------|
| Light | Claro | Clair | Hell | Licht | Chiaro |
| Dark | Oscuro | Sombre | Dunkel | Donker | Scuro |
| System | Sistema | Systeme | System | Systeem | Sistema |

### Help Terms

| English | Spanish | French | German | Dutch | Italian |
|---------|---------|--------|--------|-------|---------|
| Getting Started | Primeros pasos | Pour commencer | Erste Schritte | Aan de slag | Per iniziare |
| Quick Links | Enlaces rapidos | Liens rapides | Schnellzugriff | Snelle links | Link rapidi |
| Contact Support | Contactar soporte | Contacter le support | Support kontaktieren | Contact opnemen met support | Contatta il supporto |
| Tip | Consejo | Conseil | Tipp | Tip | Suggerimento |

---

## Success Criteria

### Translation Completeness
- [ ] All ~137 English strings have translations in all 5 languages
- [ ] No empty string values in any translation file
- [ ] No English fallback text appearing in non-English locales

### Translation Quality
- [ ] Formal address used consistently in each language
- [ ] Terminology consistent within each language file
- [ ] Help content maintains instructional clarity
- [ ] Security warnings convey appropriate urgency
- [ ] Role labels are culturally appropriate

### Technical Correctness
- [ ] All `{variable}` placeholders preserved exactly
- [ ] ICU pluralization patterns syntactically correct
- [ ] JSON files valid and properly formatted
- [ ] UTF-8 encoding correct for all accented characters

### Verification
- [ ] `npm run build` passes without errors
- [ ] No missing translation warnings in console
- [ ] Manual testing completed for all 5 languages
- [ ] All settings UI areas verified (account, profile, preferences, help)

---

## Dependencies

### Required (Must be complete before starting)
- REQ-E02-013 (Task 2G.1): Settings namespace structure in en.json
- REQ-E02-014 (Task 2G.2): Account settings strings in en.json
- REQ-E02-015 (Task 2G.3): Profile strings in en.json
- REQ-E02-016 (Task 2G.4): Preferences strings in en.json
- REQ-E02-017 (Task 2G.5): Help page strings in en.json
- Epic 1: next-intl foundation complete

### Enables (After this task completes)
- Settings pages display in all 6 supported languages
- Help page accessible to international users
- Account management fully localized
- Sub-Epic 2G is complete

---

## Post-Completion Notes

After completing this task:
1. All settings-related UI will display in user's selected language
2. Help documentation is accessible to non-English speakers
3. Account management flows work in all 6 languages
4. This completes Sub-Epic 2G (Settings & Account)

Recommended follow-up:
- Monitor for user-reported translation issues
- Consider professional translation review for help content
- Update translations as new settings features are added

---

*End of Detailed Task Breakdown*
