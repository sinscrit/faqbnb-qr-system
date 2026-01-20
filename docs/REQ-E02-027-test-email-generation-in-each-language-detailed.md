# REQ-E02-027: Test Email Generation in All Supported Languages - Detailed Task Breakdown

## Document Information

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E02-027 |
| **Title** | Test Email Generation in All Supported Languages |
| **Type** | ENHANCEMENT |
| **Size** | M (Medium) |
| **Phase** | 2I (Email Templates) |
| **Task ID** | 2I.9 |
| **Epic** | L10N Epic 2 - Static UI Translation |
| **Sub-Epic** | 2I - Email Templates |
| **Created** | 2026-01-20 |
| **Last Modified** | 2026-01-20 18:30:00 UTC |
| **Overview Document** | REQ-E02-027-test-email-generation-in-each-language-overview.md |
| **Plan Reference** | Plan-111-L10N-Epic2-Static-UI-Translation.md |
| **Requests File** | docs/gen_requests_epic2.md (Request #27) |

---

## Executive Summary

This detailed task breakdown document specifies the implementation steps for creating a comprehensive test suite that validates email localization across all six supported languages (English, Spanish, French, German, Dutch, Italian). The task validates that email generation functions from previous tasks (2I.1-2I.8) correctly generate translated emails, including proper translation key resolution, dynamic content interpolation, and fallback behavior.

---

## Prerequisites Verification

Before starting this task, confirm these dependencies are complete:

| Task ID | Description | Verification Method |
|---------|-------------|---------------------|
| 2I.1 | Create emails namespace and translation structure | Check `/messages/en.json` contains `emails` namespace |
| 2I.2 | Create `getEmailTranslation` utility function | Verify function exists and exports from `/src/lib/` |
| 2I.3 | Update `generateAccessApprovalEmail` function | Function accepts `language` parameter |
| 2I.4 | Update `generateAccessDenialEmail` function | Function accepts `language` parameter |
| 2I.5 | Update `generateBetaAccessApprovalEmail` function | Function accepts `language` parameter |
| 2I.6 | Update `generateRegistrationReminderEmail` function | Function accepts `language` parameter |
| 2I.7 | Add language parameter to all email generation functions | All functions have consistent language param |
| 2I.8 | Generate translations for 5 non-English languages | All `/messages/*.json` files contain email translations |

---

## Task Breakdown

### Task 1: Set Up Test File Structure and Imports
**Complexity:** Low (1 story point)
**Estimated Effort:** 15 minutes

#### Description
Create the test file structure with all necessary imports, mock configurations, and test utilities.

#### Implementation Steps

1. **Create test file at `/src/__tests__/email-localization.test.ts`**

2. **Add imports:**
   ```typescript
   import { describe, test, expect, beforeEach, vi, beforeAll } from 'vitest';
   import {
     generateAccessApprovalEmail,
     generateAccessDenialEmail,
     generateBetaAccessApprovalEmail,
     generateRegistrationReminderEmail,
     renderEmailHTML,
     validateEmailTemplate
   } from '@/lib/email-templates';
   import { getEmailTranslation } from '@/lib/i18n/email-translations';
   import { AccessRequest, AccessRequestSource, AccessRequestStatus } from '@/types/admin';
   ```

3. **Define supported languages constant:**
   ```typescript
   const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'nl', 'it'] as const;
   type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
   ```

4. **Create mock data factory:**
   ```typescript
   const createMockAccessRequest = (overrides?: Partial<AccessRequest>): AccessRequest => ({
     id: 'test-request-123',
     requester_email: 'test@example.com',
     requester_name: 'Test User',
     account_id: 'account-456',
     request_date: '2026-01-15T10:00:00Z',
     status: AccessRequestStatus.APPROVED,
     source: AccessRequestSource.DIRECT_REQUEST,
     created_at: '2026-01-15T10:00:00Z',
     updated_at: '2026-01-20T14:00:00Z',
     ...overrides
   });
   ```

5. **Set up mock environment variables:**
   ```typescript
   beforeAll(() => {
     process.env.NEXT_PUBLIC_APP_URL = 'https://faqbnb-test.com';
   });
   ```

#### Files to Create/Modify

| File | Action |
|------|--------|
| `/src/__tests__/email-localization.test.ts` | Create |

#### Acceptance Criteria
- [ ] Test file created with correct path
- [ ] All required imports present and valid
- [ ] Mock data factory function works correctly
- [ ] Environment variables configured for tests

---

### Task 2: Write Language Parameter Acceptance Tests
**Complexity:** Low (1 story point)
**Estimated Effort:** 30 minutes

#### Description
Write tests verifying each email generation function accepts and correctly uses the language parameter.

#### Implementation Steps

1. **Create test suite for parameter acceptance:**
   ```typescript
   describe('Language Parameter Acceptance', () => {
     const mockRequest = createMockAccessRequest();
     const accessCode = 'TEST123456AB';
     const accountName = 'Test Property';

     describe('Parameter Signature Tests', () => {
       test.each(SUPPORTED_LANGUAGES)(
         'generateAccessApprovalEmail accepts language parameter: %s',
         (lang) => {
           expect(() =>
             generateAccessApprovalEmail(mockRequest, accessCode, accountName, undefined, lang)
           ).not.toThrow();
         }
       );

       // Similar tests for other email functions
     });
   });
   ```

2. **Add default language behavior tests:**
   ```typescript
   describe('Default Language Behavior', () => {
     test('defaults to English when no language specified', () => {
       const template = generateAccessApprovalEmail(mockRequest, accessCode, accountName);
       // Verify English content
       expect(template.subject).toContain('Access Granted');
     });

     test('defaults to English for invalid language code', () => {
       const template = generateAccessApprovalEmail(
         mockRequest, accessCode, accountName, undefined, 'xx' as SupportedLanguage
       );
       expect(template.subject).toContain('Access Granted');
     });
   });
   ```

3. **Add tests for each email function:**
   - `generateAccessApprovalEmail`
   - `generateAccessDenialEmail`
   - `generateBetaAccessApprovalEmail`
   - `generateRegistrationReminderEmail`

#### Expected Test Count: 24+ tests

#### Acceptance Criteria
- [ ] All four email functions tested for language parameter acceptance
- [ ] Tests verify each of the six languages works
- [ ] Default language behavior verified
- [ ] Invalid language code handling verified

---

### Task 3: Write generateAccessApprovalEmail Localization Tests
**Complexity:** Medium (2 story points)
**Estimated Effort:** 45 minutes

#### Description
Comprehensive tests for the access approval email in all six languages.

#### Implementation Steps

1. **Create language-specific test data:**
   ```typescript
   const expectedTranslations = {
     en: {
       subjectContains: 'Access Granted',
       greetingContains: 'Hello',
       bodyContains: ['approved', 'Access Code', 'registration']
     },
     es: {
       subjectContains: 'Acceso Concedido',
       greetingContains: 'Hola',
       bodyContains: ['aprobada', 'Código de Acceso', 'registro']
     },
     fr: {
       subjectContains: 'Accès Accordé',
       greetingContains: 'Bonjour',
       bodyContains: ['approuvée', "Code d'Accès", 'inscription']
     },
     de: {
       subjectContains: 'Zugang Gewährt',
       greetingContains: 'Hallo',
       bodyContains: ['genehmigt', 'Zugangscode', 'Registrierung']
     },
     nl: {
       subjectContains: 'Toegang Verleend',
       greetingContains: 'Hallo',
       bodyContains: ['goedgekeurd', 'Toegangscode', 'registratie']
     },
     it: {
       subjectContains: 'Accesso Concesso',
       greetingContains: 'Ciao',
       bodyContains: ['approvata', 'Codice di Accesso', 'registrazione']
     }
   };
   ```

2. **Write language-specific test suite:**
   ```typescript
   describe('generateAccessApprovalEmail - All Languages', () => {
     const mockRequest = createMockAccessRequest();
     const accessCode = 'APPR123456AB';
     const accountName = 'Beach House';

     SUPPORTED_LANGUAGES.forEach((lang) => {
       describe(`${lang.toUpperCase()} - ${getLanguageName(lang)}`, () => {
         let template: EmailTemplate;

         beforeEach(() => {
           template = generateAccessApprovalEmail(
             mockRequest, accessCode, accountName, undefined, lang
           );
         });

         test('subject line is in correct language', () => {
           expect(template.subject).toContain(expectedTranslations[lang].subjectContains);
         });

         test('greeting is in correct language', () => {
           expect(template.body).toContain(expectedTranslations[lang].greetingContains);
         });

         test('body content is in correct language', () => {
           expectedTranslations[lang].bodyContains.forEach((phrase) => {
             expect(template.body.toLowerCase()).toContain(phrase.toLowerCase());
           });
         });

         test('access code appears in generated email', () => {
           expect(template.body).toContain(accessCode);
         });

         test('account name appears in generated email', () => {
           expect(template.body).toContain(accountName);
         });

         test('variables are populated correctly', () => {
           expect(template.variables.accessCode).toBe(accessCode);
           expect(template.variables.accountName).toBe(accountName);
           expect(template.variables.requesterName).toBe(mockRequest.requester_name);
         });
       });
     });
   });
   ```

3. **Add interpolation verification tests:**
   ```typescript
   describe('Dynamic Content Interpolation', () => {
     test.each(SUPPORTED_LANGUAGES)(
       'interpolates {requesterName} correctly in %s',
       (lang) => {
         const template = generateAccessApprovalEmail(
           createMockAccessRequest({ requester_name: 'María García' }),
           'CODE123', 'Test', undefined, lang
         );
         expect(template.body).toContain('María García');
       }
     );
   });
   ```

#### Expected Test Count: 42+ tests (7 tests × 6 languages)

#### Acceptance Criteria
- [ ] Subject line tested in all six languages
- [ ] Body content tested in all six languages
- [ ] Greeting text verified per language
- [ ] Access code interpolation verified
- [ ] Account name interpolation verified
- [ ] Requester name interpolation verified
- [ ] Variables object contains all expected values

---

### Task 4: Write generateAccessDenialEmail Localization Tests
**Complexity:** Medium (2 story points)
**Estimated Effort:** 45 minutes

#### Description
Comprehensive tests for the access denial email in all six languages.

#### Implementation Steps

1. **Create denial-specific expected translations:**
   ```typescript
   const denialExpectedTranslations = {
     en: {
       subjectContains: 'Access Request Update',
       bodyContains: ['unable to approve', 'Unfortunately']
     },
     es: {
       subjectContains: 'Actualización de Solicitud',
       bodyContains: ['no podemos aprobar', 'Desafortunadamente']
     },
     fr: {
       subjectContains: 'Mise à jour de la Demande',
       bodyContains: ["n'avons pas pu approuver", 'Malheureusement']
     },
     de: {
       subjectContains: 'Aktualisierung der Zugriffsanfrage',
       bodyContains: ['können nicht genehmigen', 'Leider']
     },
     nl: {
       subjectContains: 'Update Toegangsverzoek',
       bodyContains: ['kunnen niet goedkeuren', 'Helaas']
     },
     it: {
       subjectContains: 'Aggiornamento Richiesta',
       bodyContains: ['non possiamo approvare', 'Purtroppo']
     }
   };
   ```

2. **Write test suite following same pattern as Task 3**

3. **Add denial-specific tests:**
   ```typescript
   describe('Denial Reason Interpolation', () => {
     test.each(SUPPORTED_LANGUAGES)(
       'includes denial reason when provided in %s',
       (lang) => {
         const reason = 'Account capacity reached';
         const template = generateAccessDenialEmail(
           createMockAccessRequest(), reason, 'Test Account', lang
         );
         expect(template.body).toContain(reason);
       }
     );

     test.each(SUPPORTED_LANGUAGES)(
       'handles missing denial reason gracefully in %s',
       (lang) => {
         const template = generateAccessDenialEmail(
           createMockAccessRequest(), undefined, 'Test Account', lang
         );
         expect(template.body).not.toContain('undefined');
         expect(template.body).not.toContain('null');
       }
     );
   });
   ```

4. **Test tone appropriateness:**
   ```typescript
   describe('Tone Verification', () => {
     test.each(SUPPORTED_LANGUAGES)(
       'maintains respectful tone in denial email for %s',
       (lang) => {
         const template = generateAccessDenialEmail(
           createMockAccessRequest(), 'Test reason', 'Test', lang
         );
         // Verify professional, respectful language
         expect(template.body).not.toMatch(/denied|rejected|refused/i);
       }
     );
   });
   ```

#### Expected Test Count: 42+ tests

#### Acceptance Criteria
- [ ] Subject line tested in all six languages
- [ ] Body content tested in all six languages
- [ ] Denial reason interpolation tested
- [ ] Missing reason handled gracefully
- [ ] Tone remains respectful in all languages

---

### Task 5: Write generateBetaAccessApprovalEmail Localization Tests
**Complexity:** Medium (2 story points)
**Estimated Effort:** 45 minutes

#### Description
Comprehensive tests for the beta access approval email in all six languages.

#### Implementation Steps

1. **Create beta-specific expected translations:**
   ```typescript
   const betaExpectedTranslations = {
     en: {
       subjectContains: 'Welcome to FAQBNB Beta',
       bodyContains: ['Congratulations', 'beta', 'early access']
     },
     es: {
       subjectContains: 'Bienvenido a FAQBNB Beta',
       bodyContains: ['Felicitaciones', 'beta', 'acceso anticipado']
     },
     fr: {
       subjectContains: 'Bienvenue dans la Bêta FAQBNB',
       bodyContains: ['Félicitations', 'bêta', 'accès anticipé']
     },
     de: {
       subjectContains: 'Willkommen bei FAQBNB Beta',
       bodyContains: ['Herzlichen Glückwunsch', 'Beta', 'frühzeitiger Zugang']
     },
     nl: {
       subjectContains: 'Welkom bij FAQBNB Beta',
       bodyContains: ['Gefeliciteerd', 'beta', 'vroege toegang']
     },
     it: {
       subjectContains: 'Benvenuto nella Beta di FAQBNB',
       bodyContains: ['Congratulazioni', 'beta', 'accesso anticipato']
     }
   };
   ```

2. **Write test suite following established pattern**

3. **Test beta-specific features:**
   ```typescript
   describe('Beta Email Features', () => {
     test.each(SUPPORTED_LANGUAGES)(
       'includes feature list in %s',
       (lang) => {
         const template = generateBetaAccessApprovalEmail(
           createMockAccessRequest({ source: AccessRequestSource.BETA_WAITLIST }),
           'BETA123456AB', undefined, undefined, lang
         );
         // Check for feature-related content
         expect(template.body).toMatch(/QR code|analytics|dashboard|support/i);
       }
     );

     test.each(SUPPORTED_LANGUAGES)(
       'maintains enthusiastic tone in %s',
       (lang) => {
         const template = generateBetaAccessApprovalEmail(
           createMockAccessRequest({ source: AccessRequestSource.BETA_WAITLIST }),
           'BETA123', undefined, undefined, lang
         );
         // Beta emails should have celebratory elements
         expect(template.subject).toMatch(/🚀|!/);
       }
     );
   });
   ```

#### Expected Test Count: 36+ tests (6 tests × 6 languages)

#### Acceptance Criteria
- [ ] Subject line tested in all six languages
- [ ] Welcome message tested in all six languages
- [ ] Feature list appears in appropriate language
- [ ] Enthusiastic tone maintained
- [ ] All beta-specific variables populated

---

### Task 6: Write generateRegistrationReminderEmail Localization Tests
**Complexity:** Medium (2 story points)
**Estimated Effort:** 45 minutes

#### Description
Comprehensive tests for the registration reminder email in all six languages.

#### Implementation Steps

1. **Create reminder-specific expected translations:**
   ```typescript
   const reminderExpectedTranslations = {
     en: {
       subjectContains: 'Reminder: Complete Your',
       bodyContains: ['friendly reminder', 'approved', 'days ago']
     },
     es: {
       subjectContains: 'Recordatorio: Complete Su',
       bodyContains: ['recordatorio amistoso', 'aprobado', 'días']
     },
     fr: {
       subjectContains: 'Rappel: Complétez Votre',
       bodyContains: ['rappel amical', 'approuvé', 'jours']
     },
     de: {
       subjectContains: 'Erinnerung: Vervollständigen Sie',
       bodyContains: ['freundliche Erinnerung', 'genehmigt', 'Tage']
     },
     nl: {
       subjectContains: 'Herinnering: Voltooi Uw',
       bodyContains: ['vriendelijke herinnering', 'goedgekeurd', 'dagen']
     },
     it: {
       subjectContains: 'Promemoria: Completa Il Tuo',
       bodyContains: ['promemoria amichevole', 'approvato', 'giorni']
     }
   };
   ```

2. **Write test suite following established pattern**

3. **Test days interpolation:**
   ```typescript
   describe('Days Since Approval Interpolation', () => {
     const testCases = [1, 3, 7, 14, 30];

     testCases.forEach((days) => {
       test.each(SUPPORTED_LANGUAGES)(
         `correctly shows ${days} day(s) in %s`,
         (lang) => {
           const template = generateRegistrationReminderEmail(
             createMockAccessRequest(),
             'REMIND123456',
             days,
             'Test Account',
             undefined,
             lang
           );
           expect(template.body).toContain(days.toString());
         }
       );
     });
   });
   ```

#### Expected Test Count: 42+ tests

#### Acceptance Criteria
- [ ] Subject line tested in all six languages
- [ ] Body content tested in all six languages
- [ ] Days since approval interpolates correctly
- [ ] Registration link appears in all languages
- [ ] Friendly tone maintained across languages

---

### Task 7: Write Dynamic Content Interpolation Tests
**Complexity:** Medium (2 story points)
**Estimated Effort:** 30 minutes

#### Description
Test that all dynamic content variables interpolate correctly across all languages.

#### Implementation Steps

1. **Test each interpolation variable:**
   ```typescript
   describe('Dynamic Content Interpolation - All Languages', () => {
     const testVariables = {
       requesterName: 'María García-Rodríguez',
       accountName: 'Côte d\'Azur Villa',
       accessCode: 'CODE123456AB',
       directRegistrationLink: 'https://faqbnb.com/register?code=CODE123'
     };

     describe('Requester Name Interpolation', () => {
       test.each(SUPPORTED_LANGUAGES)(
         'interpolates special characters in requester name for %s',
         (lang) => {
           const template = generateAccessApprovalEmail(
             createMockAccessRequest({ requester_name: testVariables.requesterName }),
             testVariables.accessCode,
             testVariables.accountName,
             undefined,
             lang
           );
           expect(template.body).toContain(testVariables.requesterName);
         }
       );
     });

     describe('Account Name with Special Characters', () => {
       test.each(SUPPORTED_LANGUAGES)(
         'interpolates account name with accents correctly for %s',
         (lang) => {
           const template = generateAccessApprovalEmail(
             createMockAccessRequest(),
             testVariables.accessCode,
             testVariables.accountName,
             undefined,
             lang
           );
           expect(template.body).toContain(testVariables.accountName);
         }
       );
     });

     describe('URL Interpolation', () => {
       test.each(SUPPORTED_LANGUAGES)(
         'includes valid registration URL for %s',
         (lang) => {
           const template = generateAccessApprovalEmail(
             createMockAccessRequest(),
             testVariables.accessCode,
             'Test',
             undefined,
             lang
           );
           expect(template.variables.directRegistrationLink).toMatch(/^https?:\/\//);
         }
       );
     });
   });
   ```

2. **Test date formatting:**
   ```typescript
   describe('Date Formatting', () => {
     test.each(SUPPORTED_LANGUAGES)(
       'formats request date appropriately for %s',
       (lang) => {
         const template = generateAccessApprovalEmail(
           createMockAccessRequest({ request_date: '2026-01-15T10:00:00Z' }),
           'CODE123', 'Test', undefined, lang
         );
         // Date should appear in some formatted form
         expect(template.body).toMatch(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+ \d{1,2}, \d{4}/);
       }
     );
   });
   ```

#### Expected Test Count: 30+ tests

#### Acceptance Criteria
- [ ] Requester name interpolates with special characters
- [ ] Account name interpolates with accents
- [ ] Access code appears unchanged
- [ ] URLs are valid and complete
- [ ] Dates format appropriately

---

### Task 8: Write Fallback Behavior Tests
**Complexity:** Low (1 story point)
**Estimated Effort:** 30 minutes

#### Description
Test that the system gracefully falls back to English when translations are missing or invalid.

#### Implementation Steps

1. **Test fallback scenarios:**
   ```typescript
   describe('Fallback Behavior', () => {
     describe('Invalid Language Code Handling', () => {
       test('falls back to English for invalid language code', () => {
         const template = generateAccessApprovalEmail(
           createMockAccessRequest(),
           'CODE123',
           'Test Account',
           undefined,
           'xyz' as any
         );
         expect(template.subject).toContain('Access Granted');
       });

       test('falls back to English for empty language code', () => {
         const template = generateAccessApprovalEmail(
           createMockAccessRequest(),
           'CODE123',
           'Test Account',
           undefined,
           '' as any
         );
         expect(template.subject).toContain('Access Granted');
       });

       test('falls back to English for null language', () => {
         const template = generateAccessApprovalEmail(
           createMockAccessRequest(),
           'CODE123',
           'Test Account',
           undefined,
           null as any
         );
         expect(template.subject).toContain('Access Granted');
       });
     });

     describe('Fallback Does Not Cause Failures', () => {
       const invalidLanguages = ['xyz', '', null, undefined, '123', 'english', 'EN'];

       test.each(invalidLanguages)(
         'does not throw for invalid language: %s',
         (invalidLang) => {
           expect(() => {
             generateAccessApprovalEmail(
               createMockAccessRequest(),
               'CODE123',
               'Test',
               undefined,
               invalidLang as any
             );
           }).not.toThrow();
         }
       );

       test.each(invalidLanguages)(
         'produces valid email template for invalid language: %s',
         (invalidLang) => {
           const template = generateAccessApprovalEmail(
             createMockAccessRequest(),
             'CODE123',
             'Test',
             undefined,
             invalidLang as any
           );
           expect(template.subject).toBeTruthy();
           expect(template.body).toBeTruthy();
           expect(template.variables).toBeDefined();
         }
       );
     });
   });
   ```

2. **Test all email functions for fallback:**
   ```typescript
   describe('Fallback Consistency Across All Email Functions', () => {
     const emailFunctions = [
       {
         name: 'generateAccessApprovalEmail',
         fn: (lang: any) => generateAccessApprovalEmail(
           createMockAccessRequest(), 'CODE', 'Test', undefined, lang
         )
       },
       {
         name: 'generateAccessDenialEmail',
         fn: (lang: any) => generateAccessDenialEmail(
           createMockAccessRequest(), 'reason', 'Test', lang
         )
       },
       {
         name: 'generateBetaAccessApprovalEmail',
         fn: (lang: any) => generateBetaAccessApprovalEmail(
           createMockAccessRequest({ source: AccessRequestSource.BETA_WAITLIST }),
           'BETA', 'Test', undefined, lang
         )
       },
       {
         name: 'generateRegistrationReminderEmail',
         fn: (lang: any) => generateRegistrationReminderEmail(
           createMockAccessRequest(), 'REMIND', 7, 'Test', undefined, lang
         )
       }
     ];

     emailFunctions.forEach(({ name, fn }) => {
       test(`${name} handles invalid language without error`, () => {
         expect(() => fn('invalid')).not.toThrow();
         const template = fn('invalid');
         expect(validateEmailTemplate(template).isValid).toBe(true);
       });
     });
   });
   ```

#### Expected Test Count: 20+ tests

#### Acceptance Criteria
- [ ] Invalid language codes fall back to English
- [ ] Empty language codes handled gracefully
- [ ] Null/undefined language codes handled
- [ ] No exceptions thrown for invalid input
- [ ] Valid email templates produced despite invalid language

---

### Task 9: Write Character Encoding Tests
**Complexity:** Medium (2 story points)
**Estimated Effort:** 30 minutes

#### Description
Verify that special characters for each language render correctly in generated emails.

#### Implementation Steps

1. **Create character encoding test data:**
   ```typescript
   const specialCharacterTests = {
     fr: {
       name: 'French',
       testName: 'Amélie Côté',
       testAccount: "Château d'été",
       expectedChars: ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'ÿ', 'œ', 'æ']
     },
     es: {
       name: 'Spanish',
       testName: 'José Muñoz',
       testAccount: 'Año Nuevo',
       expectedChars: ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡']
     },
     de: {
       name: 'German',
       testName: 'Müller Günther',
       testAccount: 'Größe Straße',
       expectedChars: ['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', 'ß']
     },
     nl: {
       name: 'Dutch',
       testName: 'Jürgen Müller',
       testAccount: 'Café Coöperatie',
       expectedChars: ['é', 'ë', 'ï', 'ö', 'ü']
     },
     it: {
       name: 'Italian',
       testName: 'Nicolò Città',
       testAccount: 'Perché Già',
       expectedChars: ['à', 'è', 'é', 'ì', 'ò', 'ù']
     }
   };
   ```

2. **Write encoding tests:**
   ```typescript
   describe('Character Encoding Tests', () => {
     Object.entries(specialCharacterTests).forEach(([lang, data]) => {
       describe(`${data.name} (${lang})`, () => {
         test('preserves special characters in requester name', () => {
           const template = generateAccessApprovalEmail(
             createMockAccessRequest({ requester_name: data.testName }),
             'CODE123',
             'Test',
             undefined,
             lang as SupportedLanguage
           );
           expect(template.body).toContain(data.testName);
           expect(template.variables.requesterName).toBe(data.testName);
         });

         test('preserves special characters in account name', () => {
           const template = generateAccessApprovalEmail(
             createMockAccessRequest(),
             'CODE123',
             data.testAccount,
             undefined,
             lang as SupportedLanguage
           );
           expect(template.body).toContain(data.testAccount);
           expect(template.variables.accountName).toBe(data.testAccount);
         });

         test('translated content contains expected special characters', () => {
           const template = generateAccessApprovalEmail(
             createMockAccessRequest(),
             'CODE123',
             'Test',
             undefined,
             lang as SupportedLanguage
           );

           // Verify at least one language-specific character appears
           const hasSpecialChar = data.expectedChars.some(char =>
             template.body.includes(char) || template.subject.includes(char)
           );
           // This may not always be true depending on translations
           // Mark as skipped if translations don't contain these chars
         });
       });
     });
   });
   ```

3. **Test HTML encoding:**
   ```typescript
   describe('HTML Encoding', () => {
     test.each(Object.entries(specialCharacterTests))(
       'HTML rendering preserves special characters for %s',
       (lang, data) => {
         const template = generateAccessApprovalEmail(
           createMockAccessRequest({ requester_name: data.testName }),
           'CODE123',
           data.testAccount,
           undefined,
           lang as SupportedLanguage
         );
         const html = renderEmailHTML(template);

         // HTML should contain the characters (possibly encoded)
         expect(html).toMatch(new RegExp(data.testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
       }
     );
   });
   ```

#### Expected Test Count: 25+ tests

#### Acceptance Criteria
- [ ] French accents display correctly
- [ ] Spanish accents and ñ display correctly
- [ ] German umlauts and ß display correctly
- [ ] Dutch special characters display correctly
- [ ] Italian accents display correctly
- [ ] HTML rendering preserves all special characters

---

### Task 10: Write HTML Rendering Tests
**Complexity:** Low (1 story point)
**Estimated Effort:** 30 minutes

#### Description
Test that HTML email rendering works correctly with translated content.

#### Implementation Steps

1. **Write HTML structure tests:**
   ```typescript
   describe('HTML Email Rendering', () => {
     describe('HTML Structure Validation', () => {
       test.each(SUPPORTED_LANGUAGES)(
         'produces valid HTML structure for %s',
         (lang) => {
           const template = generateAccessApprovalEmail(
             createMockAccessRequest(),
             'CODE123',
             'Test Account',
             undefined,
             lang
           );
           const html = renderEmailHTML(template);

           expect(html).toContain('<!DOCTYPE html>');
           expect(html).toContain('<html>');
           expect(html).toContain('</html>');
           expect(html).toContain('<head>');
           expect(html).toContain('</head>');
           expect(html).toContain('<body>');
           expect(html).toContain('</body>');
         }
       );
     });

     describe('Content Preservation', () => {
       test.each(SUPPORTED_LANGUAGES)(
         'translated content appears in HTML body for %s',
         (lang) => {
           const template = generateAccessApprovalEmail(
             createMockAccessRequest(),
             'CODE123',
             'Test Account',
             undefined,
             lang
           );
           const html = renderEmailHTML(template);

           // Subject should appear in title
           expect(html).toContain(template.subject);
           // Access code should appear in body
           expect(html).toContain('CODE123');
         }
       );
     });

     describe('Styling Consistency', () => {
       test.each(SUPPORTED_LANGUAGES)(
         'includes email styling for %s',
         (lang) => {
           const template = generateAccessApprovalEmail(
             createMockAccessRequest(),
             'CODE123',
             'Test',
             undefined,
             lang
           );
           const html = renderEmailHTML(template);

           expect(html).toContain('<style>');
           expect(html).toContain('font-family');
         }
       );
     });
   });
   ```

2. **Test email template validation with translated content:**
   ```typescript
   describe('Template Validation with Translations', () => {
     test.each(SUPPORTED_LANGUAGES)(
       'validateEmailTemplate passes for %s email',
       (lang) => {
         const template = generateAccessApprovalEmail(
           createMockAccessRequest(),
           'CODE123',
           'Test',
           undefined,
           lang
         );
         const validation = validateEmailTemplate(template);

         expect(validation.isValid).toBe(true);
         expect(validation.errors).toHaveLength(0);
       }
     );
   });
   ```

#### Expected Test Count: 24+ tests

#### Acceptance Criteria
- [ ] HTML structure is valid for all languages
- [ ] Translated content appears in HTML output
- [ ] Styling is consistent across languages
- [ ] Template validation passes for all languages
- [ ] Meta charset is correctly set for Unicode

---

### Task 11: Run Full Test Suite and Document Results
**Complexity:** Low (1 story point)
**Estimated Effort:** 30 minutes

#### Description
Execute the complete test suite, document results, and identify any issues.

#### Implementation Steps

1. **Run the test suite:**
   ```bash
   # Run all email localization tests
   npm test -- src/__tests__/email-localization.test.ts

   # Run with verbose output
   npm test -- --reporter=verbose src/__tests__/email-localization.test.ts

   # Run with coverage
   npm test -- --coverage src/__tests__/email-localization.test.ts
   ```

2. **Create test results documentation:**
   Create a file `test-results-email-localization.md` in `/docs/testing/`:
   ```markdown
   # Email Localization Test Results

   ## Test Run Summary
   - Date: [DATE]
   - Total Tests: [COUNT]
   - Passed: [COUNT]
   - Failed: [COUNT]
   - Skipped: [COUNT]

   ## Coverage Report
   - email-templates.ts: XX%
   - email-translations.ts: XX%

   ## Language-Specific Results
   | Language | Tests | Passed | Failed |
   |----------|-------|--------|--------|
   | English  | XX    | XX     | XX     |
   | Spanish  | XX    | XX     | XX     |
   | French   | XX    | XX     | XX     |
   | German   | XX    | XX     | XX     |
   | Dutch    | XX    | XX     | XX     |
   | Italian  | XX    | XX     | XX     |

   ## Issues Found
   1. [Issue description if any]

   ## Recommendations
   1. [Recommendations based on test results]
   ```

3. **Verify test counts meet requirements:**
   - Minimum 42 test cases as specified in overview
   - All 6 languages covered
   - All 4 email functions tested

#### Acceptance Criteria
- [ ] All tests executed successfully
- [ ] Coverage report generated
- [ ] Results documented
- [ ] Any issues identified and recorded
- [ ] Test count meets minimum requirements (≥42)

---

### Task 12: Fix Identified Issues and Re-test
**Complexity:** Variable
**Estimated Effort:** Variable (depends on issues found)

#### Description
Address any issues found during testing and re-run the test suite to verify fixes.

#### Implementation Steps

1. **Categorize issues by severity:**
   - Critical: Tests failing due to missing translations
   - High: Character encoding issues
   - Medium: Minor translation inconsistencies
   - Low: Style/formatting issues

2. **For each issue:**
   - Document the issue
   - Identify root cause
   - Implement fix (update translations or code)
   - Write additional test if needed
   - Re-run affected tests

3. **Common fixes:**
   - Missing translation keys: Add to `/messages/*.json`
   - Encoding issues: Ensure UTF-8 encoding in all files
   - Interpolation failures: Fix translation string format

4. **Re-run full suite after fixes:**
   ```bash
   npm test -- src/__tests__/email-localization.test.ts
   ```

#### Acceptance Criteria
- [ ] All identified issues documented
- [ ] Fixes implemented for all critical/high issues
- [ ] All tests pass after fixes
- [ ] No regression in other tests

---

## Test Execution Commands Summary

```bash
# Run all email localization tests
npm test -- src/__tests__/email-localization.test.ts

# Run with coverage report
npm test -- --coverage src/__tests__/email-localization.test.ts

# Run specific language tests
npm test -- src/__tests__/email-localization.test.ts -t "French"
npm test -- src/__tests__/email-localization.test.ts -t "Spanish"

# Run specific email function tests
npm test -- src/__tests__/email-localization.test.ts -t "generateAccessApprovalEmail"

# Run in watch mode during development
npm test -- --watch src/__tests__/email-localization.test.ts

# Run with verbose output
npm test -- --reporter=verbose src/__tests__/email-localization.test.ts

# Run and show only failed tests
npm test -- --reporter=verbose --diff src/__tests__/email-localization.test.ts
```

---

## Files to Create/Modify

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/src/__tests__/email-localization.test.ts` | Create | Main test suite |
| `/docs/testing/test-results-email-localization.md` | Create | Test results documentation |

---

## Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `/src/lib/email-templates.ts` | Email generation functions |
| `/src/lib/i18n/email-translations.ts` | Email translation utility |
| `/messages/en.json` | English translations |
| `/messages/es.json` | Spanish translations |
| `/messages/fr.json` | French translations |
| `/messages/de.json` | German translations |
| `/messages/nl.json` | Dutch translations |
| `/messages/it.json` | Italian translations |
| `/src/types/admin.ts` | Type definitions |
| `/src/__tests__/beta-access-requests.test.ts` | Existing test patterns |

---

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Total test cases | ≥42 | Count from test runner output |
| Test pass rate | 100% | Test runner results |
| Languages covered | 6/6 | Verify tests exist for all languages |
| Email functions covered | 4/4 | Verify all functions tested |
| Code coverage for email-templates.ts | ≥90% | Coverage report |
| Character encoding issues found | 0 | Test results |
| Interpolation failures found | 0 | Test results |

---

## Rollback Plan

If critical issues are discovered:

1. Document the issue in detail
2. Create a bug report referencing this task
3. If translations are incomplete, mark task as blocked on 2I.8
4. If code changes are needed, create follow-up task

---

## Definition of Done

- [ ] All 12 tasks completed
- [ ] Test file created at `/src/__tests__/email-localization.test.ts`
- [ ] All four email generation functions tested in all six languages
- [ ] Subject lines verified in correct language
- [ ] Body content verified in correct language
- [ ] Dynamic content interpolation verified
- [ ] Fallback behavior tested
- [ ] Character encoding tested
- [ ] HTML rendering tested
- [ ] All tests pass (100% pass rate)
- [ ] Coverage ≥90% for email-templates.ts
- [ ] Test results documented
- [ ] All identified issues resolved or documented with remediation plans

---

## Notes

- This is the final task in the Email Templates sub-epic (2I), serving as validation for all previous work
- Tests should be maintained as documentation for expected email behavior
- Consider adding snapshot tests for email content if translations are stable
- Test results may reveal gaps in translations that should be reported back to Task 2I.8
- Integration with CI/CD should run these tests on every commit affecting email templates or translations
