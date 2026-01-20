# L10N Epic 1 - Foundation: End-to-End Use Case Test Scenarios

**Epic:** L10N Epic 1 - Foundation
**Generated:** 2026-01-19T18:45:00 UTC
**Last Modified:** 2026-01-19T18:45:00 UTC
**Pipeline:** pipeline-l10n-epic1-foundation
**PRD Reference:** Plan-110-L10N-Epic1-Foundation.md
**Request Range:** REQ-223 through REQ-256
**Total Scenarios:** 30

---

## Overview

This document contains comprehensive end-to-end use case test scenarios for the L10N Epic 1 - Foundation implementation. These scenarios validate the core localization infrastructure including:

- Language switching and preference persistence
- AI-powered translation service with Claude/OpenAI providers
- Background job processing for async translations
- UI integration with next-intl framework

### Supported Languages
- English (en) - Default
- French (fr) - Francais
- Spanish (es) - Espanol
- German (de) - Deutsch
- Dutch (nl) - Nederlands
- Italian (it) - Italiano

---

## Category 1: Language Switching & Persistence

### UC-E1-001: Guest Language Switching with Cookie Persistence

**Title:** Guest user can switch language and preference persists via cookie

**Category:** Language Switching & Persistence

**Preconditions:**
- User is not authenticated (guest user)
- No `FAQBNB_LANG` cookie exists
- Browser is in incognito/private mode or cookies cleared

**Steps:**
1. Navigate to the FAQBNB application homepage
2. Locate the LanguageSwitcher component in the navigation header
3. Click the LanguageSwitcher dropdown button
4. Verify all 6 languages are displayed with native names and flags
5. Select "Deutsch" (German) from the dropdown
6. Wait for page reload to complete
7. Open browser DevTools > Application > Cookies
8. Verify `FAQBNB_LANG` cookie exists

**Expected Results:**
- Dropdown displays: English, Nederlands, Francais, Deutsch, Italiano, Espanol
- Each option shows flag emoji (e.g., :de: for German)
- After selection, page reloads
- Cookie `FAQBNB_LANG` is set with value `de`
- Cookie expiry is approximately 1 year (365 days)
- Cookie path is `/`
- No API call made to `/api/user/language` (guest user)

**Verification:**
```javascript
// In browser console
document.cookie.split(';').find(c => c.includes('FAQBNB_LANG'))
// Should return: "FAQBNB_LANG=de"
```

---

### UC-E1-002: Authenticated User Language Switching with DB Persistence

**Title:** Authenticated user's language preference persists to database and cookie

**Category:** Language Switching & Persistence

**Preconditions:**
- User is signed in with valid credentials
- User's current `preferred_language` in database is 'en' or null
- Browser DevTools Network tab is open

**Steps:**
1. Navigate to dashboard page as authenticated user
2. Verify user is authenticated (user name displayed in header)
3. Open browser DevTools Network tab
4. Click the LanguageSwitcher dropdown
5. Select "Francais" (French)
6. Observe network requests in DevTools
7. Wait for page reload
8. Sign out of the application
9. Sign back in with same credentials
10. Check the LanguageSwitcher displays "Francais"

**Expected Results:**
- Network request to `PUT /api/user/language` with body `{"language":"fr"}`
- API returns 200 status with success response
- Cookie `FAQBNB_LANG` set to `fr`
- Database `users.preferred_language` updated to `fr`
- After re-login, French remains selected
- UI text displays in French (where translations exist)

**Verification:**
```sql
-- In Supabase SQL Editor
SELECT preferred_language FROM users WHERE id = '<user-id>';
-- Should return: 'fr'
```

---

### UC-E1-003: Guest Language Preference on Return Visit

**Title:** Guest user's language preference persists across sessions via cookie

**Category:** Language Switching & Persistence

**Preconditions:**
- `FAQBNB_LANG` cookie previously set to `es` (Spanish)
- User not authenticated

**Steps:**
1. Close the browser tab/window
2. Open a new browser tab
3. Navigate to FAQBNB application
4. Observe the initial language displayed
5. Check LanguageSwitcher shows current selection

**Expected Results:**
- Application loads with Spanish language setting
- LanguageSwitcher displays "Espanol" as current selection
- Static UI strings display in Spanish (where translations available)
- Cookie `FAQBNB_LANG` still contains `es`

**Verification:**
- Visual inspection of LanguageSwitcher showing Spanish flag and "Espanol"
- Cookie inspection in DevTools

---

### UC-E1-004: Language Detection Priority - User Preference > Cookie > Accept-Language > Default

**Title:** Language detection follows correct priority cascade

**Category:** Language Switching & Persistence

**Preconditions:**
- Test environment allows modifying HTTP headers
- Browser Accept-Language set to `it-IT, it;q=0.9, en;q=0.8`
- No `FAQBNB_LANG` cookie exists
- User not authenticated

**Steps:**
1. Clear all cookies for the application domain
2. Set browser Accept-Language header to Italian
3. Navigate to application (unauthenticated)
4. Observe detected language (should be Italian from Accept-Language)
5. Manually set cookie: `FAQBNB_LANG=nl`
6. Refresh the page
7. Observe detected language (should be Dutch from cookie, overriding Accept-Language)
8. Sign in as user with `preferred_language='de'` in database
9. Refresh the page
10. Observe detected language (should be German from user preference)

**Expected Results:**
- Step 4: Italian detected (Accept-Language fallback)
- Step 7: Dutch detected (cookie overrides Accept-Language)
- Step 10: German detected (user preference overrides both cookie and Accept-Language)
- Console logs show detection source: `[i18n] Language detected from user preference: de`

**Verification:**
- Check server logs or middleware logs for detection cascade messages
- Visual inspection of LanguageSwitcher selection

---

### UC-E1-005: Accept-Language Header Parsing with Quality Values

**Title:** Accept-Language header correctly parsed with quality values

**Category:** Language Switching & Persistence

**Preconditions:**
- No cookie or user preference set
- Ability to set custom Accept-Language header

**Steps:**
1. Clear cookies and sign out
2. Set Accept-Language header to: `zh-CN, zh;q=0.9, fr;q=0.8, en;q=0.7, de;q=0.6`
3. Navigate to application
4. Observe detected language

**Expected Results:**
- Chinese (zh) is not supported, skipped
- French (fr) is first supported language with highest quality
- Application loads with French language
- LanguageSwitcher shows "Francais"
- Log message: `[i18n] Language detected from Accept-Language header: fr`

**Verification:**
- LanguageSwitcher displays French
- Server logs show Accept-Language parsing

---

### UC-E1-006: Language Preference API Endpoint Validation

**Title:** PUT /api/user/language endpoint validates input and updates preference

**Category:** Language Switching & Persistence

**Preconditions:**
- User is authenticated
- API testing tool (curl, Postman, or browser DevTools)

**Steps:**
1. Make PUT request with valid language:
   ```bash
   curl -X PUT /api/user/language \
     -H "Content-Type: application/json" \
     -H "Cookie: <auth-cookie>" \
     -d '{"language": "nl"}'
   ```
2. Verify success response
3. Make PUT request with invalid language:
   ```bash
   curl -X PUT /api/user/language \
     -H "Content-Type: application/json" \
     -H "Cookie: <auth-cookie>" \
     -d '{"language": "jp"}'
   ```
4. Verify error response
5. Make PUT request without authentication:
   ```bash
   curl -X PUT /api/user/language \
     -H "Content-Type: application/json" \
     -d '{"language": "de"}'
   ```
6. Verify unauthorized response

**Expected Results:**
- Step 2: 200 OK with `{"success": true}`
- Step 4: 400 Bad Request with error message about unsupported language
- Step 6: 401 Unauthorized

**Verification:**
- HTTP response status codes
- Response body content
- Database state after valid request

---

### UC-E1-007: LanguageSwitcher Keyboard Navigation

**Title:** LanguageSwitcher supports full keyboard navigation

**Category:** Language Switching & Persistence

**Preconditions:**
- LanguageSwitcher component is visible on page
- Keyboard accessible

**Steps:**
1. Tab to focus the LanguageSwitcher button
2. Press Enter or Space to open dropdown
3. Press ArrowDown to navigate to next option
4. Press ArrowUp to navigate to previous option
5. Press Home to jump to first option (English)
6. Press End to jump to last option (Spanish)
7. Press Enter to select focused option
8. Tab away to close dropdown
9. Reopen with Enter
10. Press Escape to close without selection

**Expected Results:**
- Step 2: Dropdown opens, first option focused
- Steps 3-6: Focus moves correctly through options
- Step 7: Selected option is applied, page reloads
- Step 8: Dropdown closes, selection maintained
- Step 10: Dropdown closes without changing selection

**Verification:**
- Visual inspection of focus indicators
- ARIA attributes update correctly (`aria-activedescendant`)

---

## Category 2: Translation Service

### UC-E1-010: Claude Provider Translation Flow

**Title:** Translation request successfully processed by Claude provider

**Category:** Translation Service

**Preconditions:**
- Valid `ANTHROPIC_API_KEY` configured in environment
- `TRANSLATION_PROVIDER=claude` in environment
- User is admin (has access to translation endpoint)

**Steps:**
1. Make translation request to admin endpoint:
   ```bash
   curl -X POST /api/admin/translate \
     -H "Content-Type: application/json" \
     -H "Cookie: <admin-auth-cookie>" \
     -d '{
       "text": "Welcome to your vacation rental",
       "sourceLanguage": "en",
       "targetLanguage": "fr",
       "context": {
         "contentType": "item_description",
         "domainContext": "property rental hospitality"
       }
     }'
   ```
2. Wait for response
3. Verify translated text

**Expected Results:**
- Response status: 200 OK
- Response body includes:
  - `translatedText`: French translation (e.g., "Bienvenue dans votre location de vacances")
  - `provider`: "claude"
  - `tokensUsed`: number (if available)
  - `confidence`: number (optional)
- Translation maintains hospitality context
- No placeholder or untranslated text

**Verification:**
- Response body inspection
- Translation quality check (manual or automated)

---

### UC-E1-011: OpenAI Fallback When Claude Fails

**Title:** Translation service falls back to OpenAI when Claude is unavailable

**Category:** Translation Service

**Preconditions:**
- Valid `OPENAI_API_KEY` configured
- Claude API key invalid or rate limited (simulate with bad key)
- Translation service configured for fallback

**Steps:**
1. Temporarily invalidate Claude API key in environment
2. Make translation request:
   ```bash
   curl -X POST /api/admin/translate \
     -H "Content-Type: application/json" \
     -d '{
       "text": "The coffee machine is in the kitchen",
       "sourceLanguage": "en",
       "targetLanguage": "de"
     }'
   ```
3. Observe response provider field
4. Restore valid Claude API key

**Expected Results:**
- Translation completes successfully
- Response `provider` field is "openai"
- Translation is accurate: "Die Kaffeemaschine ist in der Kuche"
- Console logs show Claude failure and OpenAI fallback

**Verification:**
- Response body `provider` field
- Server logs showing fallback sequence

---

### UC-E1-012: Rate Limiting Behavior

**Title:** Rate limiter prevents API abuse with configurable limits

**Category:** Translation Service

**Preconditions:**
- Rate limiter configured with low limit for testing (e.g., 5 requests/minute)
- Stopwatch or timing tool available

**Steps:**
1. Make 5 rapid translation requests in quick succession (< 10 seconds)
2. Observe all 5 succeed
3. Immediately make 6th request
4. Observe rate limiting behavior
5. Wait for rate limit window to reset (1 minute)
6. Make another request
7. Verify request succeeds

**Expected Results:**
- Steps 1-2: All 5 requests return 200 OK with translations
- Step 4: Either:
  - Request queued (if queue strategy) - returns 202 Accepted
  - Request rejected (if reject strategy) - returns 429 Too Many Requests
- Rate limit headers present in response:
  - `X-RateLimit-Remaining: 0`
  - `X-RateLimit-Reset: <timestamp>`
- Step 7: Request succeeds after window reset

**Verification:**
- HTTP response status codes
- Rate limit headers
- Console logs showing rate limit status

---

### UC-E1-013: Retry with Exponential Backoff on Transient Failures

**Title:** Retry logic applies exponential backoff with jitter

**Category:** Translation Service

**Preconditions:**
- Translation provider configured to simulate failures
- Logging enabled for retry attempts
- Console/logs accessible

**Steps:**
1. Configure provider to fail first 2 attempts (simulate network error)
2. Make translation request:
   ```bash
   curl -X POST /api/admin/translate \
     -H "Content-Type: application/json" \
     -d '{
       "text": "Good morning",
       "sourceLanguage": "en",
       "targetLanguage": "es"
     }'
   ```
3. Observe console logs for retry attempts
4. Wait for final result

**Expected Results:**
- Attempt 1: Fails with network error
- Log: `[retry] Attempt 1/4 failed. Retrying in ~1000ms. Error: <message>`
- Delay ~1000ms (with jitter +/-25%)
- Attempt 2: Fails again
- Log: `[retry] Attempt 2/4 failed. Retrying in ~2000ms. Error: <message>`
- Delay ~2000ms (with jitter)
- Attempt 3: Succeeds
- Response returns: `{"translatedText": "Buenos dias", "success": true}`
- Total attempts: 3

**Verification:**
- Console log timestamps show exponential delay pattern
- Delays vary slightly due to jitter (not exactly 1000ms, 2000ms)
- Final response successful

---

### UC-E1-014: Retry Logic Stops on Non-Retryable Errors

**Title:** Non-retryable errors fail immediately without retry

**Category:** Translation Service

**Preconditions:**
- Translation service configured
- Logging enabled

**Steps:**
1. Make translation request with invalid parameters:
   ```bash
   curl -X POST /api/admin/translate \
     -H "Content-Type: application/json" \
     -d '{
       "text": "",
       "sourceLanguage": "en",
       "targetLanguage": "fr"
     }'
   ```
2. Observe response time (should be fast)
3. Check logs for retry attempts

**Expected Results:**
- Response is immediate (< 1 second)
- No retry attempts logged
- Error code indicates bad request (400 or validation error)
- Log: `[retry] Attempt 1/4 failed with non-retryable error: <message>`
- Single attempt made

**Verification:**
- Fast response time
- No retry delay logs
- Error response body

---

### UC-E1-015: Batch Translation to All Languages

**Title:** Batch translation request translates to all 5 target languages

**Category:** Translation Service

**Preconditions:**
- Valid API keys configured
- Admin access

**Steps:**
1. Make batch translation request:
   ```bash
   curl -X POST /api/admin/translate \
     -H "Content-Type: application/json" \
     -d '{
       "text": "Welcome to our property",
       "sourceLanguage": "en",
       "targetLanguages": ["fr", "es", "de", "nl", "it"],
       "context": {
         "contentType": "item_name",
         "domainContext": "vacation rental property"
       }
     }'
   ```
2. Verify response contains all translations

**Expected Results:**
- Response status: 200 OK
- Response body `translations` object contains:
  - `fr`: "Bienvenue dans notre propriete"
  - `es`: "Bienvenido a nuestra propiedad"
  - `de`: "Willkommen in unserem Anwesen"
  - `nl`: "Welkom bij ons pand"
  - `it`: "Benvenuto nella nostra proprieta"
- All translations contextually appropriate for property rental

**Verification:**
- Response structure validation
- Translation quality spot check

---

## Category 3: Background Job Processing

### UC-E1-020: Job Queue Insertion

**Title:** Translation job is correctly inserted into queue

**Category:** Background Job Processing

**Preconditions:**
- Database accessible
- `translation_jobs` table exists

**Steps:**
1. Create translation job via internal function or API:
   ```javascript
   // Using createTranslationJob
   await createTranslationJob({
     entityType: 'article',
     entityId: 'test-article-123',
     sourceLanguage: 'en',
     targetLanguage: 'fr'
   });
   ```
2. Query the translation_jobs table
3. Verify job record exists

**Expected Results:**
- Job inserted with:
  - `status`: 'queued'
  - `attempts`: 0
  - `entity_type`: 'article'
  - `entity_id`: 'test-article-123'
  - `source_language`: 'en'
  - `target_language`: 'fr'
  - `created_at`: current timestamp
  - `locked_by`: null
  - `locked_at`: null

**Verification:**
```sql
SELECT * FROM translation_jobs
WHERE entity_type = 'article' AND entity_id = 'test-article-123';
```

---

### UC-E1-021: Job Processing Lifecycle

**Title:** Job progresses through complete lifecycle: queued -> processing -> completed

**Category:** Background Job Processing

**Preconditions:**
- Job exists in queue with status 'queued'
- Job processor can be triggered

**Steps:**
1. Insert test job in queued status
2. Trigger job processor:
   ```bash
   curl -X POST /api/admin/process-translations \
     -H "Cookie: <admin-auth-cookie>"
   ```
3. Query job status during processing
4. Wait for completion
5. Query final job status

**Expected Results:**
- Step 3 (during processing):
  - `status`: 'processing'
  - `locked_by`: worker ID
  - `locked_at`: timestamp
  - `started_at`: timestamp
- Step 5 (after completion):
  - `status`: 'completed'
  - `completed_at`: timestamp
  - `locked_by`: null
  - `locked_at`: null
- Processing API returns stats: `{"processed": 1, "succeeded": 1, "failed": 0}`

**Verification:**
- Database queries at each step
- API response body

---

### UC-E1-022: Concurrent Job Handling - No Duplicate Processing

**Title:** Multiple workers do not process the same job

**Category:** Background Job Processing

**Preconditions:**
- Multiple jobs in queue
- Ability to simulate concurrent workers

**Steps:**
1. Insert 5 test jobs in queue
2. Trigger job processor from two concurrent sessions:
   ```bash
   # Terminal 1
   curl -X POST /api/admin/process-translations?limit=5

   # Terminal 2 (immediately after)
   curl -X POST /api/admin/process-translations?limit=5
   ```
3. Wait for both to complete
4. Check job records for any duplicates

**Expected Results:**
- Each job processed exactly once
- No job has multiple `started_at` timestamps
- Total processed across both workers equals 5
- Atomic locking prevents race conditions
- Console logs show lock acquisition and SKIP LOCKED behavior

**Verification:**
- Count completed jobs = 5
- Check `attempts` column = 1 for each job
- No error logs about lock conflicts

---

### UC-E1-023: Failed Job Retry

**Title:** Failed jobs increment attempt counter and can be retried

**Category:** Background Job Processing

**Preconditions:**
- Job configured to fail on first attempt
- Max retry attempts configured (e.g., 3)

**Steps:**
1. Create job that will fail (e.g., invalid entity reference)
2. Trigger job processing
3. Check job status and attempts
4. Fix the issue causing failure
5. Retrigger job processing
6. Verify job completes

**Expected Results:**
- After step 3:
  - `status`: 'failed'
  - `attempts`: 1
  - `error_message`: populated with failure reason
  - `locked_by`: null (lock released)
- After step 6:
  - `status`: 'completed'
  - `attempts`: 2

**Verification:**
- Database queries
- Error message inspection

---

### UC-E1-024: Stale Lock Cleanup

**Title:** Stale processing locks are cleaned up after timeout

**Category:** Background Job Processing

**Preconditions:**
- Job in 'processing' status with old `locked_at` timestamp
- Cleanup timeout configured (default 5 minutes)

**Steps:**
1. Manually create stale job:
   ```sql
   INSERT INTO translation_jobs (
     entity_type, entity_id, source_language, target_language,
     status, locked_by, locked_at
   ) VALUES (
     'item', 'stale-test-123', 'en', 'fr',
     'processing', 'old-worker', NOW() - INTERVAL '10 minutes'
   );
   ```
2. Trigger stale lock cleanup:
   ```bash
   curl -X POST /api/admin/process-translations?cleanupStale=true
   ```
3. Query job status

**Expected Results:**
- Job status reset to 'queued'
- `locked_by`: null
- `locked_at`: null
- Job available for processing again
- Log: `JOB_QUEUE: Stale locks cleaned up { count: 1 }`

**Verification:**
```sql
SELECT status, locked_by, locked_at
FROM translation_jobs WHERE entity_id = 'stale-test-123';
-- status = 'queued', locked_by = null
```

---

### UC-E1-025: Job Status API Endpoint

**Title:** Job status API returns jobs filtered by status and entity

**Category:** Background Job Processing

**Preconditions:**
- Multiple jobs in various states (queued, processing, completed, failed)

**Steps:**
1. Query all jobs:
   ```bash
   curl -X GET /api/admin/translation-jobs \
     -H "Cookie: <admin-auth-cookie>"
   ```
2. Query jobs by status:
   ```bash
   curl -X GET "/api/admin/translation-jobs?status=queued"
   ```
3. Query jobs by entity:
   ```bash
   curl -X GET "/api/admin/translation-jobs?entityType=article&entityId=123"
   ```

**Expected Results:**
- Step 1: Returns all jobs with pagination
- Step 2: Returns only queued jobs
- Step 3: Returns jobs for specific article
- Each job includes: id, entityType, entityId, status, attempts, createdAt, etc.

**Verification:**
- Response filtering matches query parameters
- Job structure is complete

---

## Category 4: UI Integration

### UC-E1-030: LanguageSwitcher Displays All 6 Languages with Native Names

**Title:** LanguageSwitcher shows all supported languages correctly

**Category:** UI Integration

**Preconditions:**
- Dashboard or any page with LanguageSwitcher visible

**Steps:**
1. Navigate to dashboard page
2. Locate LanguageSwitcher in header/navigation
3. Click to open dropdown
4. Inspect all options

**Expected Results:**
- Dropdown displays 6 options in order:
  1. :gb: English (English)
  2. :nl: Nederlands (Dutch)
  3. :fr: Francais (French)
  4. :de: Deutsch (German)
  5. :it: Italiano (Italian)
  6. :es: Espanol (Spanish)
- Native name is prominent (e.g., "Deutsch")
- English name shown as subtitle (e.g., "German")
- Current selection has checkmark icon
- Hover highlights options with brand color (#FF385C)

**Verification:**
- Visual inspection
- DOM inspection for correct structure

---

### UC-E1-031: next-intl t() Function in Components

**Title:** Components correctly render translated strings via t() function

**Category:** UI Integration

**Preconditions:**
- next-intl configured with message files
- Component using `useTranslations()` hook exists

**Steps:**
1. Set language to English (default)
2. Navigate to a component using translations (e.g., Dashboard)
3. Verify English strings display
4. Switch language to French
5. Verify French strings display
6. Switch to German
7. Verify German strings display

**Expected Results:**
- English: "Dashboard", "Settings", "Sign Out", etc.
- French: "Tableau de bord", "Parametres", "Deconnexion", etc.
- German: "Dashboard", "Einstellungen", "Abmelden", etc.
- No missing translation warnings in console
- Hot reload works during development (strings update without full page refresh in dev mode)

**Verification:**
- Visual text inspection
- Browser console for missing translation warnings

---

### UC-E1-032: Locale-Specific Date Formatting

**Title:** Dates display in locale-appropriate format

**Category:** UI Integration

**Preconditions:**
- Application displays dates (e.g., "Created at" timestamps)
- next-intl date formatting configured

**Steps:**
1. Set language to English (US)
2. Observe date format on page
3. Switch to German
4. Observe date format
5. Switch to French
6. Observe date format

**Expected Results:**
- English: "January 19, 2026" or "1/19/2026"
- German: "19. Januar 2026" or "19.01.2026"
- French: "19 janvier 2026" or "19/01/2026"
- Time formats also locale-appropriate (12h vs 24h)

**Verification:**
- Visual date format inspection
- Consistency across all date displays

---

### UC-E1-033: LanguageSwitcher in Mobile Viewport

**Title:** LanguageSwitcher is accessible and usable on mobile devices

**Category:** UI Integration

**Preconditions:**
- Mobile viewport (< 768px width)
- Touch-capable device or DevTools mobile emulation

**Steps:**
1. Set viewport to mobile size (375px width)
2. Locate LanguageSwitcher (may be in hamburger menu)
3. Tap to open dropdown
4. Scroll through options if needed
5. Select a language
6. Verify selection applies

**Expected Results:**
- Component is accessible in mobile layout
- Dropdown opens on tap
- Touch targets are minimum 44x44px
- Scrollable if options overflow viewport
- Selection works correctly via touch
- Page reloads with new language

**Verification:**
- Mobile emulator testing
- Touch interaction works

---

### UC-E1-034: Translation Tables RLS Policies

**Title:** RLS policies correctly restrict translation table access

**Category:** UI Integration (Security)

**Preconditions:**
- Multiple users with different content ownership
- RLS enabled on translation tables

**Steps:**
1. Sign in as User A who owns Item 1
2. Query item_translations for Item 1
3. Verify access granted
4. Sign in as User B who does NOT own Item 1
5. Query item_translations for Item 1
6. Verify access denied or empty result
7. Use service role key
8. Query any translation
9. Verify full access

**Expected Results:**
- Step 3: User A can read translations for their items
- Step 6: User B cannot read translations for User A's items
- Step 9: Service role has unrestricted access
- Write operations similarly restricted to content owners

**Verification:**
- Supabase query results
- RLS policy testing queries

---

### UC-E1-035: Admin Translation Testing Endpoint

**Title:** Admin can test translations via API endpoint

**Category:** UI Integration

**Preconditions:**
- User has admin role
- API keys configured

**Steps:**
1. Sign in as admin user
2. Make test translation request:
   ```bash
   curl -X POST /api/admin/translate \
     -H "Content-Type: application/json" \
     -H "Cookie: <admin-cookie>" \
     -d '{
       "text": "Washing Machine",
       "sourceLanguage": "en",
       "targetLanguage": "de",
       "context": {
         "contentType": "item_name",
         "domainContext": "household appliance in rental property"
       }
     }'
   ```
3. Verify response

**Expected Results:**
- Response 200 OK
- Body contains:
  ```json
  {
    "translatedText": "Waschmaschine",
    "provider": "claude",
    "tokensUsed": <number>,
    "success": true
  }
  ```
- Context helps translation accuracy (hospitality domain)

**Verification:**
- Response inspection
- Translation appropriateness

---

### UC-E1-036: Non-Admin Cannot Access Translation Endpoint

**Title:** Translation testing endpoint rejects non-admin users

**Category:** UI Integration (Security)

**Preconditions:**
- User with regular (non-admin) role

**Steps:**
1. Sign in as regular user
2. Attempt translation request:
   ```bash
   curl -X POST /api/admin/translate \
     -H "Content-Type: application/json" \
     -H "Cookie: <regular-user-cookie>" \
     -d '{"text": "Hello", "sourceLanguage": "en", "targetLanguage": "fr"}'
   ```
3. Verify rejection

**Expected Results:**
- Response 403 Forbidden or 401 Unauthorized
- Error message indicates insufficient permissions
- No translation performed

**Verification:**
- HTTP status code
- Error response body

---

### UC-E1-037: Middleware Language Context Setting

**Title:** Middleware correctly sets language context from detection

**Category:** UI Integration

**Preconditions:**
- Accept-Language header set to Spanish
- No cookies set
- User not authenticated

**Steps:**
1. Clear all cookies
2. Set browser language preference to Spanish
3. Make request to any page
4. Inspect response cookies
5. Verify language context applied

**Expected Results:**
- Middleware detects Spanish from Accept-Language
- Sets `FAQBNB_LANG` cookie to `es`
- Response includes Set-Cookie header
- Subsequent requests use Spanish locale context
- Static UI shows Spanish translations

**Verification:**
- Response Set-Cookie header
- Next request uses Spanish

---

### UC-E1-038: next-intl Missing Translation Handling

**Title:** Missing translations fall back gracefully without errors

**Category:** UI Integration

**Preconditions:**
- Translation file with some missing keys
- Console visible

**Steps:**
1. Create a component using a translation key that doesn't exist:
   ```tsx
   const t = useTranslations('test');
   return <span>{t('nonexistent.key')}</span>;
   ```
2. Render the component
3. Check console for warnings
4. Verify fallback behavior

**Expected Results:**
- No application crash
- Console shows warning about missing translation
- Fallback text displays (either key name or empty string)
- Application continues functioning

**Verification:**
- Console warning inspection
- UI renders without crash

---

### UC-E1-039: System Tag Translations Seeded

**Title:** System tags have pre-seeded translations for all languages

**Category:** UI Integration

**Preconditions:**
- Database migration applied
- tag_translations table populated

**Steps:**
1. Query tag_translations for system tags:
   ```sql
   SELECT * FROM tag_translations WHERE is_system_tag = true;
   ```
2. Verify room tags exist (kitchen, bathroom, bedroom, laundry)
3. Verify each has all 6 language translations
4. Test display in UI

**Expected Results:**
- System tags seeded:
  - `#room.kitchen`: Kitchen, Cuisine, Cocina, Kuche, Keuken, Cucina
  - `#room.bathroom`: Bathroom, Salle de bain, Bano, Badezimmer, Badkamer, Bagno
  - `#room.bedroom`: Bedroom, Chambre, Dormitorio, Schlafzimmer, Slaapkamer, Camera da letto
  - `#room.laundry`: Laundry, Buanderie, Lavanderia, Waschkuche, Wasruimte, Lavanderia
- All 6 languages present for each tag

**Verification:**
```sql
SELECT tag_key, COUNT(DISTINCT language) as lang_count
FROM tag_translations
WHERE is_system_tag = true
GROUP BY tag_key;
-- Each tag_key should have lang_count = 6
```

---

### UC-E1-040: Complete User Journey - Property Owner Multilingual Experience

**Title:** Property owner can create item and see it available in multiple languages

**Category:** End-to-End Integration

**Preconditions:**
- User signed in as property owner
- Property exists with items
- Translation jobs enabled

**Steps:**
1. Sign in as property owner
2. Create new item "Coffee Maker" with description "Automatic drip coffee maker in kitchen"
3. Trigger translations for the item (or wait for automatic)
4. View item in English - verify original text
5. Switch language to French
6. View same item - verify French translation
7. Switch language to German
8. View same item - verify German translation
9. Switch back to English
10. Verify original text restored

**Expected Results:**
- Step 4: "Coffee Maker" - "Automatic drip coffee maker in kitchen"
- Step 6: "Cafetiere" - "Cafetiere automatique a filtre dans la cuisine"
- Step 8: "Kaffeemaschine" - "Automatische Filterkaffeemaschine in der Kuche"
- Step 10: Back to English original
- All transitions seamless with page reload
- User preference persisted

**Verification:**
- Visual content inspection at each step
- Database translation records

---

## Summary

| Category | Use Cases | Coverage |
|----------|-----------|----------|
| Language Switching & Persistence | UC-E1-001 to UC-E1-007 | 7 scenarios |
| Translation Service | UC-E1-010 to UC-E1-015 | 6 scenarios |
| Background Job Processing | UC-E1-020 to UC-E1-025 | 6 scenarios |
| UI Integration | UC-E1-030 to UC-E1-040 | 11 scenarios |
| **Total** | **UC-E1-001 to UC-E1-040** | **30 scenarios** |

### Key Coverage Areas

1. **Language Detection Priority**: Tests the cascade of user preference > cookie > Accept-Language > default
2. **Persistence Mechanisms**: Cookie for guests, database for authenticated users
3. **Translation Providers**: Claude primary, OpenAI fallback
4. **Resilience**: Rate limiting, retry logic, exponential backoff
5. **Concurrency**: Job locking, stale lock cleanup, duplicate prevention
6. **Security**: RLS policies, admin-only endpoints
7. **Accessibility**: Keyboard navigation, mobile support
8. **Integration**: next-intl framework, middleware, UI components

---

*Use case document generated for L10N Epic 1 - Foundation implementation verification*
