# Implementation Overview: Generate Email Translations for 5 Non-English Languages

**Document Created:** 2026-01-23 02:55
**Last Modified:** 2026-01-23 02:55

---

## Header

| Field | Value |
|-------|-------|
| Task Reference | Task 2I.8 (Sub-Epic 2I: Email Templates) |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Implementation Plan | Epic 2 - L10N Static UI Translation |
| Original Plan Date | Not specified |
| Breakdown Created | 2026-01-23 02:55 |
| T-shirt Size | Medium |
| Estimated Effort | 2-3 hours |
| Status | PENDING |

---

## Executive Summary

This task generates translations for the `emails` namespace in all 5 non-English language files. The English source translations are complete in `/messages/en.json` (Task 2I.1), and the email generation functions now support language parameters (Task 2I.7). This task populates the translations for French, Spanish, German, Dutch, and Italian.

**Key Deliverable:** Complete translations for ~85 email-related strings across 5 target languages, enabling the system to generate emails in all 6 supported languages.

**Target Languages:**
- French (fr) - `/messages/fr.json`
- Spanish (es) - `/messages/es.json`
- German (de) - `/messages/de.json`
- Dutch (nl) - `/messages/nl.json`
- Italian (it) - `/messages/it.json`

**Email Namespaces to Translate:**
- `emails.accessApproval` - 19 strings
- `emails.accessDenial` - 11 strings
- `emails.betaAccess` - 32 strings
- `emails.registrationReminder` - 12 strings
- `emails.common` - 7 strings

**Total Strings per Language:** ~81 strings
**Total Translation Entries:** ~405 strings (81 × 5 languages)

---

## Goals

### Primary Objectives

1. **Translate all `emails` namespace strings** to French, Spanish, German, Dutch, and Italian
2. **Preserve variable placeholders** exactly as they appear in English (`{accountName}`, `{accessCode}`, etc.)
3. **Preserve emoji characters** in translations (🚀, 🎉, ✨, 📱, 📊, 🛠️, 💌)
4. **Maintain JSON structure** - keys must match English exactly
5. **Use professional, formal tone** appropriate for business emails
6. **Ensure grammatical correctness** in each target language
7. **Validate JSON syntax** after each file modification

### Success Criteria

- [ ] All 81 email strings translated in `/messages/fr.json`
- [ ] All 81 email strings translated in `/messages/es.json`
- [ ] All 81 email strings translated in `/messages/de.json`
- [ ] All 81 email strings translated in `/messages/nl.json`
- [ ] All 81 email strings translated in `/messages/it.json`
- [ ] All variable placeholders preserved exactly (case-sensitive)
- [ ] All emoji characters preserved in translations
- [ ] JSON files remain valid (parseable)
- [ ] No English strings remain in `emails` namespace of target files
- [ ] Build passes without i18n-related errors

### Assumptions & Clarifications

- **Assumption 1:** English translations in Task 2I.1 are complete and final
- **Assumption 2:** AI/machine translation is acceptable for this task (per implementation plan)
- **Assumption 3:** Professional review of critical strings may be done separately
- **Assumption 4:** Variable placeholders must NOT be translated or modified
- **Assumption 5:** Formal "you" form should be used (vous/usted/Sie/u/Lei)
- **Clarification:** Emojis are universal and should be preserved as-is in translations

---

## Technical Context

### Current State

**English Source (Complete - Task 2I.1):**
```
/messages/en.json - emails namespace at line 4252
├── accessApproval (19 strings)
├── accessDenial (11 strings)
├── betaAccess (32 strings)
├── registrationReminder (12 strings)
└── common (7 strings)
```

**Non-English Files (Partial - Mostly English fallback):**
```
/messages/fr.json - emails namespace at line 4171 (mostly untranslated)
/messages/es.json - emails namespace at line 4171 (mostly untranslated)
/messages/de.json - emails namespace at line 4171 (mostly untranslated)
/messages/nl.json - emails namespace at line 4171 (mostly untranslated)
/messages/it.json - emails namespace at line 4157 (mostly untranslated)
```

Investigation shows that the `emails` namespace exists in all files but contains mostly English text copied as placeholders. Only a few strings have been partially translated (e.g., `step1Note`, `accessCodeLabel`, `directLinkLabel`, `footerSupport` in French).

### Translation Key Reference

**`emails.accessApproval` (19 strings):**
| Key | Variables | Notes |
|-----|-----------|-------|
| subject | {accountName} | Email subject line |
| greeting | {name} | Opening salutation |
| intro | {accountName} | Approval announcement |
| accessDetails | - | Section header |
| account | {accountName} | Account info |
| accessCode | {accessCode} | Code display |
| requestedOn | {date} | Date info |
| instructions | - | Section header |
| step1 | {link} | Registration link |
| step1Note | - | Parenthetical note |
| step2 | - | Instruction step |
| step3 | - | Instruction step |
| notes | - | Section header |
| note1 | - | Security note |
| note2 | - | Validity note |
| note3 | - | Contact note |
| accessCodeLabel | {accessCode} | Code reminder |
| directLinkLabel | {link} | Link reminder |

**`emails.accessDenial` (11 strings):**
| Key | Variables | Notes |
|-----|-----------|-------|
| subject | {accountName} | Email subject |
| greeting | {name} | Opening salutation |
| intro | {accountName} | Thank you message |
| message | - | Denial message |
| reason | {reason} | Optional reason |
| requestDetails | - | Section header |
| account | {accountName} | Account info |
| requestedOn | {date} | Date info |
| contact | - | Contact instructions |

**`emails.betaAccess` (32 strings):**
| Key | Variables | Notes |
|-----|-----------|-------|
| subject | - | Has 🚀 emoji |
| greeting | {name} | Opening |
| congratulations | - | Has 🎉 emoji |
| accessDetails | - | Section header |
| platform | {accountName} | Platform info |
| accessCode | {accessCode} | Code display |
| betaAccessGranted | {approvalDate} | Date info |
| originalRequest | {requestDate} | Date info |
| gettingStarted | - | Section header |
| step1 | {link} | Link step |
| step1Note | - | Parenthetical |
| step2 | - | Step 2 |
| step3 | - | Step 3 |
| accessCodeLabel | {accessCode} | Code reminder |
| directLinkLabel | {link} | Link reminder |
| whatToExpect | - | Section header |
| feature1-5 | - | Has emojis (✨📱📊🛠️💌) |
| betaNotes | - | Section header |
| note1-5 | - | Beta notes |
| excited | - | Closing excitement |
| team | - | Team signature |
| footer | - | Has 🚀 emoji, multiline |

**`emails.registrationReminder` (12 strings):**
| Key | Variables | Notes |
|-----|-----------|-------|
| subject | {accountName} | Email subject |
| greeting | {name} | Opening |
| message | {accountName}, {days} | Main reminder |
| accessCodeLabel | {accessCode} | Code display |
| instructions | - | Section header |
| step1 | {link} | Link step |
| step1Note | - | Parenthetical |
| step2 | - | Step 2 |
| alternative | {registrationLink}, {accessCode} | Alt method |
| closing | - | Closing paragraph |
| questions | - | Questions line |

**`emails.common` (7 strings):**
| Key | Variables | Notes |
|-----|-----------|-------|
| regards | - | Closing salutation |
| team | - | Team name |
| footer | - | Auto-message note |
| accountLabel | {accountName} | Account display |
| accessCodeLabel | {accessCode} | Code display |
| requestedOnLabel | {date} | Date display |
| footerSupport | - | Support contact |

---

## Implementation Plan

### Step 1: Translate French (fr.json)
**Description:** Generate French translations for all 81 email strings
**Rationale:** French is a major European language; good starting point
**Estimated Effort:** 25 minutes (Medium)

**Translation Guidelines for French:**
- Use formal "vous" form (not "tu")
- Preserve all `{variable}` placeholders exactly
- Keep emojis in same position as English
- "FAQBNB" is a proper noun - don't translate
- "Beta" can remain as "Beta" or use "Bêta"

**File:** `/messages/fr.json`
**Location:** Lines 4171-4257 (`emails` namespace)

**Sample Translations:**
```json
"emails.accessApproval.subject": "Accès Accordé : {accountName} - Votre Code d'Accès",
"emails.accessApproval.greeting": "Bonjour {name},",
"emails.accessApproval.intro": "Bonne nouvelle ! Votre demande d'accès pour « {accountName} » a été approuvée.",
"emails.common.regards": "Cordialement,",
"emails.common.team": "L'équipe FAQBNB"
```

### Step 2: Translate Spanish (es.json)
**Description:** Generate Spanish translations for all 81 email strings
**Rationale:** Spanish is widely spoken; second language to translate
**Estimated Effort:** 25 minutes (Medium)

**Translation Guidelines for Spanish:**
- Use formal "usted" form (not "tú")
- Preserve all `{variable}` placeholders exactly
- Keep emojis in same position as English
- Use Latin American neutral Spanish where possible

**File:** `/messages/es.json`
**Location:** Lines 4171-4257 (`emails` namespace)

**Sample Translations:**
```json
"emails.accessApproval.subject": "Acceso Concedido: {accountName} - Su Código de Acceso",
"emails.accessApproval.greeting": "Hola {name},",
"emails.accessApproval.intro": "¡Buenas noticias! Su solicitud de acceso para \"{accountName}\" ha sido aprobada.",
"emails.common.regards": "Atentamente,",
"emails.common.team": "El equipo de FAQBNB"
```

### Step 3: Translate German (de.json)
**Description:** Generate German translations for all 81 email strings
**Rationale:** German is a major European language
**Estimated Effort:** 25 minutes (Medium)

**Translation Guidelines for German:**
- Use formal "Sie" form (not "du")
- Preserve all `{variable}` placeholders exactly
- Keep emojis in same position as English
- Compound nouns should follow German conventions

**File:** `/messages/de.json`
**Location:** Lines 4171-4257 (`emails` namespace)

**Sample Translations:**
```json
"emails.accessApproval.subject": "Zugang Gewährt: {accountName} - Ihr Zugangscode",
"emails.accessApproval.greeting": "Hallo {name},",
"emails.accessApproval.intro": "Gute Nachrichten! Ihre Zugriffsanfrage für „{accountName}" wurde genehmigt.",
"emails.common.regards": "Mit freundlichen Grüßen,",
"emails.common.team": "Das FAQBNB-Team"
```

### Step 4: Translate Dutch (nl.json)
**Description:** Generate Dutch translations for all 81 email strings
**Rationale:** Dutch is spoken in Netherlands and Belgium
**Estimated Effort:** 25 minutes (Medium)

**Translation Guidelines for Dutch:**
- Use formal "u" form (not "je/jij")
- Preserve all `{variable}` placeholders exactly
- Keep emojis in same position as English

**File:** `/messages/nl.json`
**Location:** Lines 4171-4257 (`emails` namespace)

**Sample Translations:**
```json
"emails.accessApproval.subject": "Toegang Verleend: {accountName} - Uw Toegangscode",
"emails.accessApproval.greeting": "Hallo {name},",
"emails.accessApproval.intro": "Goed nieuws! Uw toegangsverzoek voor \"{accountName}\" is goedgekeurd.",
"emails.common.regards": "Met vriendelijke groet,",
"emails.common.team": "Het FAQBNB-team"
```

### Step 5: Translate Italian (it.json)
**Description:** Generate Italian translations for all 81 email strings
**Rationale:** Italian is a major European language; last to translate
**Estimated Effort:** 25 minutes (Medium)

**Translation Guidelines for Italian:**
- Use formal "Lei" form (not "tu")
- Preserve all `{variable}` placeholders exactly
- Keep emojis in same position as English

**File:** `/messages/it.json`
**Location:** Lines 4157-4243 (`emails` namespace)

**Sample Translations:**
```json
"emails.accessApproval.subject": "Accesso Concesso: {accountName} - Il Tuo Codice di Accesso",
"emails.accessApproval.greeting": "Ciao {name},",
"emails.accessApproval.intro": "Ottime notizie! La tua richiesta di accesso per \"{accountName}\" è stata approvata.",
"emails.common.regards": "Cordiali saluti,",
"emails.common.team": "Il team FAQBNB"
```

### Step 6: Validate JSON Files
**Description:** Verify all JSON files are valid and parseable
**Rationale:** Invalid JSON breaks the build
**Estimated Effort:** 10 minutes (Small)

**Validation Steps:**
1. Parse each file with `JSON.parse()` or `jq`
2. Verify all keys exist in all files
3. Check for missing or extra translations
4. Verify variable placeholders preserved

**Commands:**
```bash
# Validate JSON syntax
for file in messages/*.json; do
  jq . "$file" > /dev/null && echo "$file: Valid" || echo "$file: INVALID"
done

# Count email translation keys
for file in messages/*.json; do
  echo "$file: $(jq '.emails | .. | strings | length' "$file" 2>/dev/null | wc -l) strings"
done
```

### Step 7: Run Build Verification
**Description:** Run typecheck and build to verify translations work
**Rationale:** Ensure no breaking changes
**Estimated Effort:** 10 minutes (Small)

**Commands:**
```bash
npm run typecheck
npm run build
```

**Expected Results:**
- TypeScript compiles without errors
- Build completes successfully
- No missing translation warnings

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Translation Files (MODIFY)

| File | Target | Type | Lines | Purpose |
|------|--------|------|-------|---------|
| `/messages/fr.json` | `emails` namespace | Modify | 4171-4257 | French translations |
| `/messages/es.json` | `emails` namespace | Modify | 4171-4257 | Spanish translations |
| `/messages/de.json` | `emails` namespace | Modify | 4171-4257 | German translations |
| `/messages/nl.json` | `emails` namespace | Modify | 4171-4257 | Dutch translations |
| `/messages/it.json` | `emails` namespace | Modify | 4157-4243 | Italian translations |

### Files NOT Modified

| File | Reason |
|------|--------|
| `/messages/en.json` | Source of truth; already complete (Task 2I.1) |
| `/src/lib/email-templates.ts` | Already updated (Tasks 2I.3-2I.7) |
| `/src/lib/email-translations.ts` | Already implemented (Task 2I.2) |
| Any component files | Only translation files modified in this task |

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-019** (Task 2I.1): Create `emails` namespace and translation structure
  - **What it provides:** English source translations for all 81 strings
  - **Why critical:** Cannot translate without source strings

- **REQ-E02-020** (Task 2I.2): Create `getEmailTranslation` utility function
  - **What it provides:** Translation lookup mechanism
  - **Why critical:** Translations must be in correct format

- **REQ-E02-025** (Task 2I.7): Add language parameter to all email functions
  - **What it provides:** Ability to generate emails in target languages
  - **Why critical:** Translations useless without parameter support

### Blocks (Requires This First)

- **REQ-E02-027** (Task 2I.9): Test email generation in each language
  - **What we provide:** Complete translations for all 5 non-English languages
  - **Blocking reason:** Cannot test languages without translations

### Parallel Safety

**Files touched by this task:**
- `/messages/fr.json` (emails namespace only)
- `/messages/es.json` (emails namespace only)
- `/messages/de.json` (emails namespace only)
- `/messages/nl.json` (emails namespace only)
- `/messages/it.json` (emails namespace only)

**Conflicts with:**
- Any other task modifying `emails` namespace in translation files
- Other Epic 2 sub-epic translation tasks that touch same files (different namespaces)

**Safe to parallelize with:**
- Tasks modifying `/src/lib/email-templates.ts`
- Tasks modifying other namespaces in translation files (different JSON paths)
- Any tasks not touching `/messages/*.json` files

**Recommendation:** This task modifies 5 large JSON files. Sequential execution within this task is recommended to avoid merge conflicts. However, safe to run parallel with Tasks 2I.9 preparation.

### External Dependencies

**Translation Resources:**
- AI/Machine translation service (Claude, GPT, DeepL)
- Language expertise for review (optional)

**Build Dependencies:**
- next-intl for translation loading
- JSON parser for validation

---

## Risks and Considerations

### Potential Side Effects

1. **JSON Syntax Errors:**
   - **Risk:** Invalid JSON breaks build
   - **Impact:** Application won't start
   - **Mitigation:** Validate JSON after each file modification
   - **Severity:** High (but easily caught)

2. **Variable Placeholder Corruption:**
   - **Risk:** Translating or modifying `{variable}` placeholders
   - **Impact:** Emails display literal `{accountName}` instead of values
   - **Mitigation:** Explicit instruction to preserve placeholders; verification step
   - **Severity:** Medium

3. **Emoji Corruption:**
   - **Risk:** Emojis removed or changed during translation
   - **Impact:** Inconsistent email appearance
   - **Mitigation:** Explicit instruction to preserve emojis
   - **Severity:** Low (cosmetic)

4. **Tone Inconsistency:**
   - **Risk:** Formal/informal tone mismatch across languages
   - **Impact:** Unprofessional appearance in some languages
   - **Mitigation:** Use formal form (vous/usted/Sie/u/Lei) consistently
   - **Severity:** Low

5. **Large File Merge Conflicts:**
   - **Risk:** Translation files are large (~4000+ lines)
   - **Impact:** Difficult merge resolution
   - **Mitigation:** Sequential execution; isolated namespace modifications
   - **Severity:** Medium

6. **Translation Quality:**
   - **Risk:** Machine translation may have errors
   - **Impact:** Awkward or incorrect phrasing
   - **Mitigation:** Review critical strings; future native speaker review
   - **Severity:** Low (can be improved later)

### Testing Requirements

**Unit Tests:**
- [ ] JSON files parse correctly
- [ ] All 81 keys exist in each file
- [ ] Variable placeholders preserved exactly
- [ ] No English text remains in target files

**Integration Tests:**
- [ ] `getEmailTranslation()` returns correct translations
- [ ] Email generation works for all 6 languages
- [ ] Fallback to English works if key missing

**Manual Testing:**
- [ ] Generate sample email in French - verify translation
- [ ] Generate sample email in Spanish - verify translation
- [ ] Generate sample email in German - verify translation
- [ ] Generate sample email in Dutch - verify translation
- [ ] Generate sample email in Italian - verify translation
- [ ] Verify emojis display correctly in all languages

### Open Questions

- [ ] **Q1:** Should "FAQBNB" be translated or remain as-is?
  - **Recommendation:** Keep as "FAQBNB" - it's a proper noun/brand name

- [ ] **Q2:** Should "Beta" be translated?
  - **Options:** "Beta" (universal), "Bêta" (French), "Versión Beta" (Spanish)
  - **Recommendation:** Keep as "Beta" for consistency; widely understood

- [ ] **Q3:** Should professional translation review be scheduled?
  - **Recommendation:** Yes, for critical strings; flag for future sprint

- [ ] **Q4:** Should we add a glossary for consistent term translation?
  - **Recommendation:** Create `/docs/i18n/email-glossary.md` for reference

---

## Out of Scope

**Explicitly NOT included in this task:**

1. **Modifying English translations** - Task 2I.1 already complete
2. **Updating email generation functions** - Tasks 2I.3-2I.7 complete
3. **Testing all email templates** - Task 2I.9
4. **Professional translation review** - Future enhancement
5. **Adding new languages** - Only 5 non-English languages specified
6. **Translating other namespaces** - Only `emails` namespace
7. **UI components for language selection** - Different sub-epic
8. **Email sending logic** - Out of scope for translation
9. **Creating translation glossary** - Optional enhancement

---

## Success Metrics

### Quantitative Metrics

1. **Strings Translated:** 81 strings × 5 languages = 405 total
2. **Files Modified:** 5 translation files
3. **Build Status:** Passes without errors
4. **JSON Validity:** 100% of files parse correctly
5. **Variable Preservation:** 100% of placeholders intact
6. **Emoji Preservation:** 100% of emojis intact

### Acceptance Criteria

**Task is complete when:**
- ✅ `/messages/fr.json` has all 81 email strings translated
- ✅ `/messages/es.json` has all 81 email strings translated
- ✅ `/messages/de.json` has all 81 email strings translated
- ✅ `/messages/nl.json` has all 81 email strings translated
- ✅ `/messages/it.json` has all 81 email strings translated
- ✅ All JSON files are valid and parseable
- ✅ All variable placeholders preserved exactly
- ✅ All emojis preserved in translations
- ✅ No English text remains in `emails` namespace of target files
- ✅ Build completes without errors
- ✅ Git commit created: "[REQ-E02-026] Generate translations for 5 non-English languages"

---

## Appendix A: Complete String List by Namespace

### `emails.accessApproval` (19 strings)

| # | Key | English Source |
|---|-----|----------------|
| 1 | subject | "Access Granted: {accountName} - Your Access Code" |
| 2 | greeting | "Hello {name}," |
| 3 | intro | "Great news! Your access request for \"{accountName}\" has been approved." |
| 4 | accessDetails | "Your Access Details:" |
| 5 | account | "Account: {accountName}" |
| 6 | accessCode | "Access Code: {accessCode}" |
| 7 | requestedOn | "Requested on: {date}" |
| 8 | instructions | "To complete your access setup:" |
| 9 | step1 | "Click this direct registration link: {link}" |
| 10 | step1Note | "(This link pre-fills your access code and email for convenience)" |
| 11 | step2 | "Complete your account registration" |
| 12 | step3 | "Start exploring the items and resources" |
| 13 | notes | "Important Notes:" |
| 14 | note1 | "Keep your access code secure and don't share it with others" |
| 15 | note2 | "Your access code will remain valid until you complete registration" |
| 16 | note3 | "If you have any questions, please contact the account owner" |
| 17 | accessCodeLabel | "Your access code: {accessCode}" |
| 18 | directLinkLabel | "Direct registration link: {link}" |

### `emails.accessDenial` (11 strings)

| # | Key | English Source |
|---|-----|----------------|
| 1 | subject | "Access Request Update: {accountName}" |
| 2 | greeting | "Hello {name}," |
| 3 | intro | "Thank you for your interest in accessing \"{accountName}\"." |
| 4 | message | "Unfortunately, we're unable to approve your access request at this time." |
| 5 | reason | "Reason: {reason}" |
| 6 | requestDetails | "Request Details:" |
| 7 | account | "Account: {accountName}" |
| 8 | requestedOn | "Requested on: {date}" |
| 9 | contact | "If you believe this is an error or have questions about this decision, please contact the account owner directly." |

### `emails.betaAccess` (32 strings)

| # | Key | English Source |
|---|-----|----------------|
| 1 | subject | "🚀 Welcome to FAQBNB Beta - Access Granted!" |
| 2 | greeting | "Hello {name}," |
| 3 | congratulations | "🎉 Congratulations! Your beta waitlist request has been approved..." |
| 4 | accessDetails | "Your Beta Access Details:" |
| 5 | platform | "Platform: {accountName}" |
| 6 | accessCode | "Access Code: {accessCode}" |
| 7 | betaAccessGranted | "Beta Access Granted: {approvalDate}" |
| 8 | originalRequest | "Original Request: {requestDate}" |
| 9 | gettingStarted | "Getting Started with Your Beta Access:" |
| 10 | step1 | "Click this direct registration link: {link}" |
| 11 | step1Note | "(This link pre-fills your access code and email for convenience)" |
| 12 | step2 | "Complete your account registration" |
| 13 | step3 | "Start exploring the platform features and capabilities" |
| 14 | accessCodeLabel | "Your beta access code: {accessCode}" |
| 15 | directLinkLabel | "Direct registration link: {link}" |
| 16 | whatToExpect | "What to Expect:" |
| 17 | feature1 | "✨ Early access to all FAQBNB features" |
| 18 | feature2 | "📱 QR code generation and management tools" |
| 19 | feature3 | "📊 Analytics and insights dashboard" |
| 20 | feature4 | "🛠️ Priority support during the beta period" |
| 21 | feature5 | "💌 Direct feedback channel to influence product development" |
| 22 | betaNotes | "Important Beta Program Notes:" |
| 23 | note1 | "Your access code provides full platform access during the beta period" |
| 24 | note2 | "As a beta user, your feedback is invaluable to us" |
| 25 | note3 | "Some features may be evolving - please share your experience!" |
| 26 | note4 | "Keep your access code secure and don't share it with others" |
| 27 | note5 | "Beta users will receive priority updates on new features" |
| 28 | excited | "We're excited to have you as part of our exclusive beta community!" |
| 29 | team | "The FAQBNB Beta Team" |
| 30 | footer | "🚀 You're part of something special!..." |

### `emails.registrationReminder` (12 strings)

| # | Key | English Source |
|---|-----|----------------|
| 1 | subject | "Reminder: Complete Your {accountName} Access Setup" |
| 2 | greeting | "Hello {name}," |
| 3 | message | "This is a friendly reminder that your access to \"{accountName}\" was approved {days} days ago..." |
| 4 | accessCodeLabel | "Your Access Code: {accessCode}" |
| 5 | instructions | "To complete your access setup:" |
| 6 | step1 | "Click this direct registration link: {link}" |
| 7 | step1Note | "(This link pre-fills your access code and email for convenience)" |
| 8 | step2 | "Complete your account registration" |
| 9 | alternative | "Alternative: Visit {registrationLink} and enter your access code: {accessCode}" |
| 10 | closing | "Your access code will remain valid, but completing your registration..." |
| 11 | questions | "If you no longer need access or have any questions, please let us know." |

### `emails.common` (7 strings)

| # | Key | English Source |
|---|-----|----------------|
| 1 | regards | "Best regards," |
| 2 | team | "The FAQBNB Team" |
| 3 | footer | "This is an automated message. Please do not reply to this email." |
| 4 | accountLabel | "Account: {accountName}" |
| 5 | accessCodeLabel | "Access Code: {accessCode}" |
| 6 | requestedOnLabel | "Requested on: {date}" |
| 7 | footerSupport | "If you need assistance, please contact support through the FAQBNB platform." |

---

## Appendix B: Translation Glossary

| English Term | French | Spanish | German | Dutch | Italian |
|--------------|--------|---------|--------|-------|---------|
| Access | Accès | Acceso | Zugang | Toegang | Accesso |
| Access Code | Code d'accès | Código de acceso | Zugangscode | Toegangscode | Codice di accesso |
| Account | Compte | Cuenta | Konto | Account | Account |
| Approved | Approuvé | Aprobado | Genehmigt | Goedgekeurd | Approvato |
| Beta | Beta/Bêta | Beta | Beta | Bèta | Beta |
| Registration | Inscription | Registro | Registrierung | Registratie | Registrazione |
| Reminder | Rappel | Recordatorio | Erinnerung | Herinnering | Promemoria |
| Request | Demande | Solicitud | Anfrage | Verzoek | Richiesta |
| Team | Équipe | Equipo | Team | Team | Team |

---

**End of Document**

*Generated by Technical Lead Agent 02 for Epic 2 L10N - Sub-Epic 2I: Email Templates*
