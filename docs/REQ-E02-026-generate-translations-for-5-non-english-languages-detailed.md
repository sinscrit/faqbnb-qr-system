# REQ-E02-026: Generate Translations for Email Templates Namespace - Detailed Task Breakdown

## Document Information

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E02-026 |
| **Title** | Generate Translations for Email Templates Namespace |
| **Type** | NEW FEATURE |
| **Size** | M (Medium) |
| **Phase** | 2I (Email Templates) |
| **Task ID** | 2I.8 |
| **Epic** | L10N Epic 2 - Static UI Translation |
| **Sub-Epic** | 2I - Email Templates |
| **Created** | 2026-01-20 |
| **Last Modified** | 2026-01-20 |
| **Overview Document** | REQ-E02-026-generate-translations-for-5-non-english-languages-overview.md |
| **Plan Reference** | Plan-111-L10N-Epic2-Static-UI-Translation.md |

---

## Executive Summary

This document provides granular, implementation-ready tasks for generating translations of the `emails` namespace for five non-English languages: Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it). The task involves translating approximately 110 email-related strings across four email template categories: access approval, access denial, beta access approval, and registration reminder emails.

---

## Prerequisites Verification Checklist

Before starting implementation, verify all prerequisites are complete:

- [ ] **2I.1** - `emails` namespace exists in `/messages/en.json` with complete structure
- [ ] **2I.2** - `getEmailTranslation` utility function is implemented in `/src/lib/i18n/email-translations.ts`
- [ ] **2I.3** - `generateAccessApprovalEmail` function updated to use translation utility
- [ ] **2I.4** - `generateAccessDenialEmail` function updated to use translation utility
- [ ] **2I.5** - `generateBetaAccessApprovalEmail` function updated to use translation utility
- [ ] **2I.6** - `generateRegistrationReminderEmail` function updated to use translation utility
- [ ] **2I.7** - Language parameter added to all email generation functions

---

## Source Files Reference

### Primary Source File
| File | Purpose |
|------|---------|
| `/messages/en.json` | Source English translations with `emails` namespace |

### Target Files to Create/Modify
| File | Purpose |
|------|---------|
| `/messages/es.json` | Spanish translations |
| `/messages/fr.json` | French translations |
| `/messages/de.json` | German translations |
| `/messages/nl.json` | Dutch translations |
| `/messages/it.json` | Italian translations |

### Reference Files (Read-Only)
| File | Purpose |
|------|---------|
| `/src/lib/email-templates.ts` | Source content for email strings |

---

## Email Namespace Structure

The following is the expected structure of the `emails` namespace in `/messages/en.json`. Verify this structure exists before translating:

```json
{
  "emails": {
    "common": {
      "greeting": "Hello {name},",
      "regards": "Best regards,",
      "team": "The FAQBNB Team",
      "footer": "This is an automated message. Please do not reply to this email.",
      "footerSupport": "If you need assistance, please contact support through the FAQBNB platform.",
      "importantNotes": "Important Notes:",
      "accessDetails": "Your Access Details:",
      "toCompleteSetup": "To complete your access setup:"
    },
    "accessApproval": {
      "subject": "Access Granted: {accountName} - Your Access Code",
      "intro": "Great news! Your access request for \"{accountName}\" has been approved.",
      "account": "Account: {accountName}",
      "code": "Access Code: {accessCode}",
      "requestedOn": "Requested on: {date}",
      "step1": "Click this direct registration link: {link}",
      "step1Note": "(This link pre-fills your access code and email for convenience)",
      "step2": "Complete your account registration",
      "step3": "Start exploring the items and resources",
      "yourCode": "Your access code: {accessCode}",
      "directLink": "Direct registration link: {link}",
      "note1": "Keep your access code secure and don't share it with others",
      "note2": "Your access code will remain valid until you complete registration",
      "note3": "If you have any questions, please contact the account owner"
    },
    "accessDenial": {
      "subject": "Access Request Update: {accountName}",
      "intro": "Thank you for your interest in accessing \"{accountName}\".",
      "message": "Unfortunately, we're unable to approve your access request at this time.",
      "reason": "Reason: {reason}",
      "requestDetails": "Request Details:",
      "contactOwner": "If you believe this is an error or have questions about this decision, please contact the account owner directly."
    },
    "betaAccess": {
      "subject": "Welcome to FAQBNB Beta - Access Granted!",
      "congratulations": "Congratulations! Your beta waitlist request has been approved, and you now have exclusive early access to FAQBNB!",
      "detailsTitle": "Your Beta Access Details:",
      "platform": "Platform: {accountName}",
      "accessGranted": "Beta Access Granted: {date}",
      "originalRequest": "Original Request: {date}",
      "gettingStarted": "Getting Started with Your Beta Access:",
      "yourCode": "Your beta access code: {accessCode}",
      "whatToExpect": "What to Expect:",
      "feature1": "Early access to all FAQBNB features",
      "feature2": "QR code generation and management tools",
      "feature3": "Analytics and insights dashboard",
      "feature4": "Priority support during the beta period",
      "feature5": "Direct feedback channel to influence product development",
      "betaNotes": "Important Beta Program Notes:",
      "betaNote1": "Your access code provides full platform access during the beta period",
      "betaNote2": "As a beta user, your feedback is invaluable to us",
      "betaNote3": "Some features may be evolving - please share your experience!",
      "betaNote4": "Keep your access code secure and don't share it with others",
      "betaNote5": "Beta users will receive priority updates on new features",
      "excitement": "We're excited to have you as part of our exclusive beta community!",
      "betaTeam": "The FAQBNB Beta Team",
      "betaFooter": "You're part of something special! Thank you for joining our beta program.",
      "betaSupport": "For beta support or feedback, please contact us through the platform or reply to this email."
    },
    "registrationReminder": {
      "subject": "Reminder: Complete Your {accountName} Access Setup",
      "intro": "This is a friendly reminder that your access to \"{accountName}\" was approved {days} days ago, but you haven't completed your registration yet.",
      "yourCode": "Your Access Code: {accessCode}",
      "alternative": "Alternative: Visit {link} and enter your access code: {code}",
      "codeValid": "Your access code will remain valid, but completing your registration will allow you to start exploring the account's items and resources.",
      "noLongerNeed": "If you no longer need access or have any questions, please let us know."
    }
  }
}
```

---

## Detailed Tasks

### Task 2I.8.1: Verify English Namespace Completeness

**Story Points:** 0.5
**Estimated Time:** 15 minutes

#### Description
Verify that the `emails` namespace in `/messages/en.json` contains all required translation keys with complete, production-ready English content.

#### Steps

1. **Read the English message file**
   ```bash
   # Read /messages/en.json
   ```

2. **Verify namespace structure exists**
   - Confirm `emails` key exists at root level
   - Confirm all sub-namespaces exist: `common`, `accessApproval`, `accessDenial`, `betaAccess`, `registrationReminder`

3. **Verify key completeness against source**
   - Compare keys against `/src/lib/email-templates.ts` content
   - Ensure all hardcoded strings from email templates have corresponding keys

4. **Check interpolation variables**
   - Verify all `{variable}` placeholders are documented and consistent:
     - `{name}` - Recipient name
     - `{accountName}` - Account/property display name
     - `{accessCode}` - Generated access code
     - `{date}` - Various date values
     - `{days}` - Days since approval (for reminders)
     - `{link}` - Registration/access links
     - `{reason}` - Denial reason (optional)

5. **Document any missing keys**
   - If keys are missing, document them for addition before translation

#### Acceptance Criteria
- [ ] `emails` namespace exists in `/messages/en.json`
- [ ] All four email categories have complete key structures
- [ ] All interpolation variables are properly formatted with `{}`
- [ ] No hardcoded strings remain unextracted from email templates

#### Output Verification
```bash
# Verify namespace exists
cat /messages/en.json | grep -A 5 '"emails"'
```

---

### Task 2I.8.2: Create French (fr) Email Translations

**Story Points:** 1
**Estimated Time:** 45 minutes

#### Description
Create complete French translations for all `emails` namespace strings, following formal business email conventions with "vous" address form.

#### Translation Guidelines - French

1. **Formality**: Use formal "vous" for all communication (business correspondence)
2. **Tone**: Professional but warm - maintain friendly approachability
3. **Special Characters**: Preserve French accents (é, è, ê, à, ù, ç, etc.)
4. **Punctuation**: Follow French spacing rules (space before : ; ! ?)

#### Steps

1. **Read existing French translation file**
   ```bash
   # Read /messages/fr.json
   ```

2. **Add emails namespace if not present**
   - Add `"emails": { ... }` object to the JSON structure

3. **Translate common email elements**
   ```json
   "common": {
     "greeting": "Bonjour {name},",
     "regards": "Cordialement,",
     "team": "L'équipe FAQBNB",
     "footer": "Ceci est un message automatique. Veuillez ne pas répondre à cet e-mail.",
     "footerSupport": "Si vous avez besoin d'aide, veuillez contacter l'assistance via la plateforme FAQBNB.",
     "importantNotes": "Notes importantes :",
     "accessDetails": "Vos informations d'accès :",
     "toCompleteSetup": "Pour finaliser la configuration de votre accès :"
   }
   ```

4. **Translate access approval section**
   - Subject: "Accès accordé : {accountName} - Votre code d'accès"
   - Maintain all `{variable}` placeholders exactly as in English

5. **Translate access denial section**
   - Subject: "Mise à jour de votre demande d'accès : {accountName}"
   - Use empathetic, respectful tone for denial messages

6. **Translate beta access section**
   - Subject: "Bienvenue dans la bêta FAQBNB - Accès accordé !"
   - Maintain enthusiastic but professional tone
   - Keep emoji usage if present in English source

7. **Translate registration reminder section**
   - Subject: "Rappel : Finalisez la configuration de votre accès {accountName}"

#### Key French Translations Reference

| English | French |
|---------|--------|
| Great news! | Excellente nouvelle ! |
| Congratulations! | Félicitations ! |
| Unfortunately | Malheureusement |
| Best regards | Cordialement |
| Access Code | Code d'accès |
| Keep secure | Gardez en sécurité |
| Don't share | Ne partagez pas |

#### Acceptance Criteria
- [ ] All `emails.common` keys translated
- [ ] All `emails.accessApproval` keys translated
- [ ] All `emails.accessDenial` keys translated
- [ ] All `emails.betaAccess` keys translated
- [ ] All `emails.registrationReminder` keys translated
- [ ] All `{variable}` placeholders preserved exactly
- [ ] Formal "vous" used throughout
- [ ] French accents and special characters preserved
- [ ] JSON syntax is valid

---

### Task 2I.8.3: Create Spanish (es) Email Translations

**Story Points:** 1
**Estimated Time:** 45 minutes

#### Description
Create complete Spanish translations for all `emails` namespace strings, using Latin American Spanish (neutral) with formal "usted" address form.

#### Translation Guidelines - Spanish

1. **Formality**: Use formal "usted" for business communication
2. **Regional Variant**: Use neutral Latin American Spanish (avoid Spain-specific terms)
3. **Special Characters**: Preserve Spanish accents (á, é, í, ó, ú, ñ, ü)
4. **Punctuation**: Use inverted question/exclamation marks where appropriate

#### Steps

1. **Read existing Spanish translation file**
   ```bash
   # Read /messages/es.json
   ```

2. **Add emails namespace if not present**

3. **Translate common email elements**
   ```json
   "common": {
     "greeting": "Hola {name},",
     "regards": "Atentamente,",
     "team": "El equipo de FAQBNB",
     "footer": "Este es un mensaje automático. Por favor, no responda a este correo electrónico.",
     "footerSupport": "Si necesita ayuda, comuníquese con el soporte a través de la plataforma FAQBNB.",
     "importantNotes": "Notas importantes:",
     "accessDetails": "Sus datos de acceso:",
     "toCompleteSetup": "Para completar la configuración de su acceso:"
   }
   ```

4. **Translate all email sections** following the pattern from French task

#### Key Spanish Translations Reference

| English | Spanish |
|---------|---------|
| Great news! | ¡Excelentes noticias! |
| Congratulations! | ¡Felicitaciones! |
| Unfortunately | Lamentablemente |
| Best regards | Atentamente |
| Access Code | Código de acceso |
| Welcome | Bienvenido/a |

#### Acceptance Criteria
- [ ] All `emails` namespace keys translated
- [ ] All `{variable}` placeholders preserved
- [ ] Formal "usted" used throughout
- [ ] Spanish accents preserved
- [ ] Neutral Latin American Spanish (no regional-specific terms)
- [ ] JSON syntax is valid

---

### Task 2I.8.4: Create German (de) Email Translations

**Story Points:** 1
**Estimated Time:** 45 minutes

#### Description
Create complete German translations for all `emails` namespace strings, using formal "Sie" address form appropriate for business correspondence.

#### Translation Guidelines - German

1. **Formality**: Use formal "Sie" (capitalized) for all communication
2. **Tone**: German business emails tend to be more formal; maintain professional warmth
3. **Special Characters**: Preserve umlauts (ä, ö, ü) and eszett (ß)
4. **Compound Words**: Use proper German compound word formation

#### Steps

1. **Read existing German translation file**
   ```bash
   # Read /messages/de.json
   ```

2. **Add emails namespace**

3. **Translate common email elements**
   ```json
   "common": {
     "greeting": "Hallo {name},",
     "regards": "Mit freundlichen Grüßen,",
     "team": "Das FAQBNB-Team",
     "footer": "Dies ist eine automatische Nachricht. Bitte antworten Sie nicht auf diese E-Mail.",
     "footerSupport": "Wenn Sie Hilfe benötigen, wenden Sie sich bitte über die FAQBNB-Plattform an den Support.",
     "importantNotes": "Wichtige Hinweise:",
     "accessDetails": "Ihre Zugangsdaten:",
     "toCompleteSetup": "Um die Einrichtung Ihres Zugangs abzuschließen:"
   }
   ```

4. **Translate all email sections**

#### Key German Translations Reference

| English | German |
|---------|--------|
| Great news! | Großartige Neuigkeiten! |
| Congratulations! | Herzlichen Glückwunsch! |
| Unfortunately | Leider |
| Best regards | Mit freundlichen Grüßen |
| Access Code | Zugangscode |
| Welcome | Willkommen |

#### Acceptance Criteria
- [ ] All `emails` namespace keys translated
- [ ] All `{variable}` placeholders preserved
- [ ] Formal "Sie" used throughout (capitalized)
- [ ] Umlauts and eszett preserved
- [ ] JSON syntax is valid

---

### Task 2I.8.5: Create Dutch (nl) Email Translations

**Story Points:** 1
**Estimated Time:** 45 minutes

#### Description
Create complete Dutch translations for all `emails` namespace strings, using formal "u" address form.

#### Translation Guidelines - Dutch

1. **Formality**: Use formal "u" for business communication
2. **Tone**: Direct but polite - Dutch communication is typically more concise
3. **Structure**: Dutch tends to have similar sentence structure to German
4. **Special Characters**: Most Dutch uses standard Latin characters

#### Steps

1. **Read existing Dutch translation file**
   ```bash
   # Read /messages/nl.json
   ```

2. **Add emails namespace**

3. **Translate common email elements**
   ```json
   "common": {
     "greeting": "Hallo {name},",
     "regards": "Met vriendelijke groet,",
     "team": "Het FAQBNB-team",
     "footer": "Dit is een automatisch bericht. Gelieve niet te antwoorden op deze e-mail.",
     "footerSupport": "Als u hulp nodig heeft, neem dan contact op met de ondersteuning via het FAQBNB-platform.",
     "importantNotes": "Belangrijke opmerkingen:",
     "accessDetails": "Uw toegangsgegevens:",
     "toCompleteSetup": "Om de instelling van uw toegang te voltooien:"
   }
   ```

4. **Translate all email sections**

#### Key Dutch Translations Reference

| English | Dutch |
|---------|-------|
| Great news! | Geweldig nieuws! |
| Congratulations! | Gefeliciteerd! |
| Unfortunately | Helaas |
| Best regards | Met vriendelijke groet |
| Access Code | Toegangscode |
| Welcome | Welkom |

#### Acceptance Criteria
- [ ] All `emails` namespace keys translated
- [ ] All `{variable}` placeholders preserved
- [ ] Formal "u" used throughout
- [ ] JSON syntax is valid

---

### Task 2I.8.6: Create Italian (it) Email Translations

**Story Points:** 1
**Estimated Time:** 45 minutes

#### Description
Create complete Italian translations for all `emails` namespace strings, using formal "Lei" address form.

#### Translation Guidelines - Italian

1. **Formality**: Use formal "Lei" (capitalized) for business communication
2. **Tone**: Warm and relationship-focused - Italian business communication is typically more expressive
3. **Special Characters**: Preserve Italian accents (à, è, é, ì, ò, ù)
4. **Structure**: Italian sentences may be slightly longer than English

#### Steps

1. **Read existing Italian translation file**
   ```bash
   # Read /messages/it.json
   ```

2. **Add emails namespace**

3. **Translate common email elements**
   ```json
   "common": {
     "greeting": "Salve {name},",
     "regards": "Cordiali saluti,",
     "team": "Il team FAQBNB",
     "footer": "Questo è un messaggio automatico. Si prega di non rispondere a questa e-mail.",
     "footerSupport": "Se ha bisogno di assistenza, contatti il supporto attraverso la piattaforma FAQBNB.",
     "importantNotes": "Note importanti:",
     "accessDetails": "I Suoi dati di accesso:",
     "toCompleteSetup": "Per completare la configurazione del Suo accesso:"
   }
   ```

4. **Translate all email sections**

#### Key Italian Translations Reference

| English | Italian |
|---------|---------|
| Great news! | Ottime notizie! |
| Congratulations! | Congratulazioni! |
| Unfortunately | Purtroppo |
| Best regards | Cordiali saluti |
| Access Code | Codice di accesso |
| Welcome | Benvenuto/a |

#### Acceptance Criteria
- [ ] All `emails` namespace keys translated
- [ ] All `{variable}` placeholders preserved
- [ ] Formal "Lei" used throughout (capitalized)
- [ ] Italian accents preserved
- [ ] JSON syntax is valid

---

### Task 2I.8.7: Verify Interpolation Variables Across All Languages

**Story Points:** 0.5
**Estimated Time:** 15 minutes

#### Description
Verify that all interpolation variables (`{variable}`) are preserved correctly and identically across all six language files.

#### Steps

1. **Create validation script or manual check**

2. **Check each variable across all files:**

   | Variable | Purpose | Appears In |
   |----------|---------|------------|
   | `{name}` | Recipient name | common.greeting |
   | `{accountName}` | Account display name | Multiple keys |
   | `{accessCode}` | Access code | Multiple keys |
   | `{date}` | Various dates | Multiple keys |
   | `{days}` | Days since approval | registrationReminder |
   | `{link}` | Registration link | Multiple keys |
   | `{code}` | Access code (alternate) | registrationReminder.alternative |
   | `{reason}` | Denial reason | accessDenial.reason |

3. **Verify variable format consistency**
   - All variables use `{variableName}` format (curly braces, camelCase)
   - No translated variable names (must remain in English)

4. **Check for typos in variable names**
   - Common errors: `{Name}` vs `{name}`, `{account_name}` vs `{accountName}`

#### Acceptance Criteria
- [ ] All `{variable}` placeholders exist in all 6 language files
- [ ] Variable names are identical across all languages
- [ ] No variables were accidentally translated
- [ ] No typos in variable names

---

### Task 2I.8.8: JSON Syntax Validation

**Story Points:** 0.25
**Estimated Time:** 10 minutes

#### Description
Validate JSON syntax for all modified language files to ensure they parse correctly.

#### Steps

1. **Validate each file**
   ```bash
   # For each language file
   node -e "JSON.parse(require('fs').readFileSync('/messages/en.json'))"
   node -e "JSON.parse(require('fs').readFileSync('/messages/fr.json'))"
   node -e "JSON.parse(require('fs').readFileSync('/messages/es.json'))"
   node -e "JSON.parse(require('fs').readFileSync('/messages/de.json'))"
   node -e "JSON.parse(require('fs').readFileSync('/messages/nl.json'))"
   node -e "JSON.parse(require('fs').readFileSync('/messages/it.json'))"
   ```

2. **Check for common JSON errors:**
   - Missing commas
   - Trailing commas
   - Unescaped quotes within strings
   - Missing closing braces

3. **Fix any syntax errors found**

#### Acceptance Criteria
- [ ] All 6 language files parse as valid JSON
- [ ] No syntax errors reported
- [ ] Build process does not fail due to JSON errors

---

### Task 2I.8.9: Translation Quality Review

**Story Points:** 0.5
**Estimated Time:** 30 minutes

#### Description
Review all translations for quality, consistency, and cultural appropriateness.

#### Review Checklist

1. **Semantic Accuracy**
   - [ ] Translations convey the same meaning as English source
   - [ ] No content has been lost or added
   - [ ] Technical terms are translated correctly

2. **Tone Consistency**
   - [ ] Approval emails maintain positive, welcoming tone
   - [ ] Denial emails maintain respectful, empathetic tone
   - [ ] Beta emails maintain enthusiastic but professional tone
   - [ ] Reminder emails maintain friendly, helpful tone

3. **Formality Levels**
   - [ ] French: "vous" used throughout
   - [ ] Spanish: "usted" used throughout
   - [ ] German: "Sie" (capitalized) used throughout
   - [ ] Dutch: "u" used throughout
   - [ ] Italian: "Lei" (capitalized) used throughout

4. **Email Subject Lines**
   - [ ] Subject lines are concise (suitable for inbox display)
   - [ ] Subject lines clearly convey email purpose
   - [ ] Dynamic content (`{accountName}`) renders correctly

5. **Cultural Appropriateness**
   - [ ] Greetings follow cultural norms
   - [ ] Closings follow cultural norms
   - [ ] Overall message structure is culturally appropriate

6. **Character Encoding**
   - [ ] French accents display correctly (é, è, ê, à, ù, ç)
   - [ ] Spanish characters display correctly (á, é, í, ó, ú, ñ, ü)
   - [ ] German characters display correctly (ä, ö, ü, ß)
   - [ ] Italian accents display correctly (à, è, é, ì, ò, ù)

#### Acceptance Criteria
- [ ] All review checklist items verified
- [ ] No quality issues identified or all issues resolved
- [ ] Translations approved for production use

---

### Task 2I.8.10: Integration Verification

**Story Points:** 0.5
**Estimated Time:** 20 minutes

#### Description
Verify that translations integrate correctly with the email translation utility and email generation functions.

#### Steps

1. **Test `getEmailTranslation` utility**
   ```typescript
   // Test each language
   const testLanguages = ['en', 'fr', 'es', 'de', 'nl', 'it'];

   testLanguages.forEach(lang => {
     const greeting = getEmailTranslation('emails.common.greeting', lang, { name: 'Test User' });
     console.log(`${lang}: ${greeting}`);
   });
   ```

2. **Test email generation with each language**
   - Generate access approval email for each language
   - Generate access denial email for each language
   - Generate beta access email for each language
   - Generate registration reminder for each language

3. **Verify email output**
   - Check that interpolation works correctly
   - Check that full email body renders properly
   - Check that subject line renders correctly

4. **Verify fallback behavior**
   - Test with unsupported language code
   - Verify fallback to English works

#### Acceptance Criteria
- [ ] `getEmailTranslation` returns correct translations for all languages
- [ ] All email generation functions produce properly translated output
- [ ] Variable interpolation works correctly in all languages
- [ ] Fallback to English works for unsupported languages

---

## Implementation Summary

### Task Order
Execute tasks in the following order:

1. **Task 2I.8.1** - Verify English namespace (prerequisite)
2. **Tasks 2I.8.2-2I.8.6** - Create language translations (can be parallelized)
3. **Task 2I.8.7** - Verify interpolation variables
4. **Task 2I.8.8** - JSON syntax validation
5. **Task 2I.8.9** - Translation quality review
6. **Task 2I.8.10** - Integration verification

### Total Effort Estimate

| Task | Story Points | Estimated Time |
|------|-------------|----------------|
| 2I.8.1 - Verify English | 0.5 | 15 min |
| 2I.8.2 - French | 1 | 45 min |
| 2I.8.3 - Spanish | 1 | 45 min |
| 2I.8.4 - German | 1 | 45 min |
| 2I.8.5 - Dutch | 1 | 45 min |
| 2I.8.6 - Italian | 1 | 45 min |
| 2I.8.7 - Verify Variables | 0.5 | 15 min |
| 2I.8.8 - JSON Validation | 0.25 | 10 min |
| 2I.8.9 - Quality Review | 0.5 | 30 min |
| 2I.8.10 - Integration | 0.5 | 20 min |
| **Total** | **7.25** | **~5 hours** |

---

## Files Changed Summary

### Files to Modify

| File | Changes |
|------|---------|
| `/messages/fr.json` | Add `emails` namespace with French translations |
| `/messages/es.json` | Add `emails` namespace with Spanish translations |
| `/messages/de.json` | Add `emails` namespace with German translations |
| `/messages/nl.json` | Add `emails` namespace with Dutch translations |
| `/messages/it.json` | Add `emails` namespace with Italian translations |

### Files to Verify (Read-Only)

| File | Purpose |
|------|---------|
| `/messages/en.json` | Source English translations |
| `/src/lib/i18n/email-translations.ts` | Translation utility function |

---

## Acceptance Criteria Summary

### Translation Completeness
- [ ] French translation file includes complete `emails` namespace
- [ ] Spanish translation file includes complete `emails` namespace
- [ ] German translation file includes complete `emails` namespace
- [ ] Dutch translation file includes complete `emails` namespace
- [ ] Italian translation file includes complete `emails` namespace

### Translation Quality
- [ ] All translations maintain semantic accuracy
- [ ] Email subject lines are concise and clear
- [ ] Appropriate formality levels used in each language
- [ ] Call-to-action text is motivating and clear
- [ ] Sensitive denial messages maintain respectfulness

### Technical Requirements
- [ ] All `{variable}` placeholders preserved correctly
- [ ] Character encoding correct for special characters
- [ ] JSON syntax is valid in all files
- [ ] No English strings remain as placeholders
- [ ] Translations integrate with email utility function

---

## Rollback Plan

If issues are discovered after implementation:

1. **Revert translation files** to pre-implementation state using git
2. **Verify email generation** falls back to English correctly
3. **Document issues** for correction in follow-up task

---

## Related Documentation

- [REQ-E02-026 Overview](REQ-E02-026-generate-translations-for-5-non-english-languages-overview.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Email Templates Source](/src/lib/email-templates.ts)
- [i18n Configuration](/src/lib/i18n/config.ts)

---

*Document generated: 2026-01-20*
*Task breakdown for FAQBNB Localization Epic 2, Sub-Epic 2I, Task 2I.8*
