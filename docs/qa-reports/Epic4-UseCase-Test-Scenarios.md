# L10N Epic 4 - Guest Experience
# End-to-End Use Case Test Scenarios

**Generated:** 2026-01-31 01:04:02
**Last Modified:** 2026-01-31 01:04:02
**Epic:** L10N Epic 4 - Guest Experience
**Total Scenarios:** 48

---

## Summary

This document contains comprehensive end-to-end use case test scenarios for validating the L10N Epic 4 - Guest Experience implementation. These scenarios cover all aspects of the guest-facing localization experience including:

- Guest language detection and switching
- QR code scan to translated content flow
- Multi-language property browsing
- Guest preference persistence
- Edge cases and error handling
- Performance and accessibility
- Integration with other system components

### Category Breakdown

- **Edge Case**: 18 scenarios
- **Error Handling**: 5 scenarios
- **Happy Path**: 16 scenarios
- **Integration**: 9 scenarios

---

## Happy Path Scenarios (16)

### UC-E4-001: Guest scans QR code with French browser - displays French content

**Category:** happy-path

**Related Tasks:** 5.1, 5.2, 6.1

**Test Steps:**

1. Guest has browser set to French (fr-FR)
1. Guest scans QR code linking to /item/abc123
1. System detects Accept-Language: fr-FR header
1. Page loads with item content in French
1. TranslationBanner displays 'Translated from English'
1. LanguageIndicator shows French flag and 'Francais'

**Expected Results:**

- Content displays in French when translation exists
- TranslationBanner is visible with source language info
- View Original toggle is available
- FAQBNB_GUEST_LANG cookie is set to 'fr'

---

### UC-E4-002: Guest manually switches language using GuestLanguageSwitcher

**Category:** happy-path

**Related Tasks:** 3.1, 4.1, 5.2

**Test Steps:**

1. Guest is viewing item page in English
1. Guest clicks on GuestLanguageSwitcher dropdown
1. Guest sees all 6 languages (en, fr, es, de, nl, it)
1. Languages with available translations show checkmark
1. Guest selects German (Deutsch)
1. Content updates to German without page reload

**Expected Results:**

- Dropdown shows all 6 languages with flags and native names
- Available translations are marked with checkmark
- Content updates instantly (client-side toggle)
- Cookie is updated to 'de'
- TranslationBanner updates to show 'Translated from English'

---

### UC-E4-003: Guest toggles View Original to see original content

**Category:** happy-path

**Related Tasks:** 3.4, 4.1, 5.2

**Test Steps:**

1. Guest is viewing translated content in French
1. TranslationBanner shows 'Translated from English - View original'
1. Guest clicks 'View original' link in banner
1. Content instantly switches to original English
1. ViewOriginalToggle button shows 'View translation'

**Expected Results:**

- Content switches instantly without page reload
- ViewOriginalToggle shows correct state
- TranslationBanner is hidden when showing original
- Guest can toggle back to translated content

---

### UC-E4-004: Guest accesses shareable link with language parameter

**Category:** happy-path

**Related Tasks:** 5.1, 5.4, 6.1

**Test Steps:**

1. Guest receives shared link /item/abc123?lang=es
1. Guest's browser is set to English
1. Guest opens the shared link
1. System prioritizes URL parameter over browser setting
1. Content displays in Spanish

**Expected Results:**

- URL parameter takes highest priority for language
- Content displays in Spanish despite English browser
- Cookie is updated to 'es' for future visits
- Canonical URL does NOT include ?lang= parameter

---

### UC-E4-005: Guest returns to site with saved language preference

**Category:** happy-path

**Related Tasks:** 1.2, 4.2, 6.1

**Test Steps:**

1. Guest previously selected German as preferred language
1. FAQBNB_GUEST_LANG cookie is set to 'de'
1. Guest scans a different QR code for new item
1. Browser sends cookie with request
1. Middleware detects cookie preference

**Expected Results:**

- Content displays in German (from cookie)
- Cookie preference overrides browser Accept-Language
- Guest's language preference persists across sessions
- Cookie has 1-year expiry

---

### UC-E4-006: Guest views item with translations for all content types

**Category:** happy-path

**Related Tasks:** 2.1, 5.2, 5.3

**Test Steps:**

1. Guest views item page with translations available
1. Item has name, description, articles, links, and tags
1. Guest selects French as display language
1. All content types display in French

**Expected Results:**

- Item name displays in French
- Item description displays in French
- Article titles and descriptions display in French
- Link titles display in French (URLs unchanged)
- Tags display translated values

---

### UC-E4-007: Guest views language availability via API

**Category:** happy-path

**Related Tasks:** 2.3

**Test Steps:**

1. Guest or client app requests /api/public/items/{publicId}/languages
1. API returns language availability information
1. Response includes source language and available translations

**Expected Results:**

- API returns LanguageAvailabilityResponse format
- sourceLanguage field shows original content language
- availableTranslations lists languages with completed translations
- pendingTranslations lists languages in progress
- unavailableTranslations lists remaining languages

---

### UC-E4-008: Guest accesses item via public API with language parameter

**Category:** happy-path

**Related Tasks:** 2.2

**Test Steps:**

1. Client app requests /api/public/items/{publicId}?lang=fr
1. API fetches item with French translation
1. API returns GuestContentResponse format

**Expected Results:**

- API returns translated item content in French
- translationMeta includes requestedLanguage, displayLanguage, sourceLanguage
- translationMeta.isShowingTranslation is true
- translationMeta.availableTranslations lists all available languages

---

### UC-E4-009: Guest views item on mobile device

**Category:** happy-path

**Related Tasks:** 3.1, 7.4

**Test Steps:**

1. Guest opens item page on mobile phone (320px width)
1. GuestLanguageSwitcher displays in compact mode
1. TranslationBanner displays without obscuring content
1. Guest taps language switcher
1. Dropdown opens with touch-friendly target sizes

**Expected Results:**

- Language switcher is responsive and compact on mobile
- Dropdown items have minimum 44x44px touch targets
- Banner does not obscure main content
- All interactive elements are easily tappable

---

### UC-E4-010: Guest experiences fast page load with translation

**Category:** happy-path

**Related Tasks:** 7.5

**Test Steps:**

1. Guest scans QR code for item with translations
1. Measure time for language detection
1. Measure time for content with translation to load
1. Guest switches language
1. Measure time for language switch

**Expected Results:**

- Language detection completes in < 10ms
- Content with translation loads in < 200ms
- Language switch (client-side) completes in < 100ms
- No perceived delay when toggling View Original

---

### UC-E4-011: Guest views SEO-optimized page with translated metadata

**Category:** happy-path

**Related Tasks:** 5.1

**Test Steps:**

1. Search engine crawler accesses /item/abc123 with Accept-Language: de
1. Page generates metadata for SEO
1. Check page title and meta description

**Expected Results:**

- Page title uses translated item name in German
- Meta description uses translated item description
- Canonical URL does NOT include language parameter
- og:title and og:description use translated content

---

### UC-E4-012: Guest views full translation flow across multiple items

**Category:** happy-path

**Related Tasks:** 4.1, 5.1, 6.1

**Test Steps:**

1. Guest scans QR code for Item A, views in French
1. Guest bookmarks Item A
1. Guest scans QR code for Item B (different property)
1. Item B also displays in French (cookie persists)
1. Guest changes to Spanish on Item B
1. Guest returns to Item A bookmark

**Expected Results:**

- Language preference persists across different items
- Cookie updates when guest changes language
- Item A displays in Spanish (new preference) on return
- Consistent language experience across entire site

---

### UC-E4-036: Performance test: 100 concurrent translation requests

**Category:** happy-path

**Related Tasks:** 2.1, 2.2, 7.5

**Test Steps:**

1. Load testing tool sends 100 concurrent requests to /item/abc123?lang=fr
1. Each request hits translation fetch utilities
1. Database handles concurrent reads
1. Measure response time distribution
1. Monitor database connection pool

**Expected Results:**

- P50 response time < 100ms
- P95 response time < 200ms
- P99 response time < 300ms
- No database connection pool exhaustion
- No translation query errors
- All requests return correct French content

---

### UC-E4-040: Translation with HTML/Markdown content preservation

**Category:** happy-path

**Related Tasks:** 2.1, 5.2

**Test Steps:**

1. Item description contains Markdown: '**WiFi**: Connect to _GuestNetwork_'
1. Description is translated to French
1. Guest views French translation
1. LinkCard titles contain special characters

**Expected Results:**

- Markdown formatting is preserved in translation
- Bold and italic styles render correctly
- Special characters (é, ñ, ü) display properly
- No XSS vulnerabilities from translated content
- HTML escaping works correctly

---

### UC-E4-046: Database query optimization for batch translation fetches

**Category:** happy-path

**Related Tasks:** 2.1, 7.5

**Test Steps:**

1. Item has 10 articles, each with 3 links (30 links total)
1. Guest requests page in French
1. System fetches translations for item, 10 articles, 30 links
1. Monitor database query count and execution time

**Expected Results:**

- Maximum 4 database queries: item, articles, links, tags
- No N+1 query problem (not 30 separate link queries)
- Batch fetching uses SQL JOIN or IN clause
- Total query execution time < 50ms
- Efficient use of database indexes on language and IDs

---

### UC-E4-047: Guest switches from translated to original mid-read

**Category:** happy-path

**Related Tasks:** 3.4, 4.1

**Test Steps:**

1. Guest reads French translation of house rules
1. Guest scrolls to 'Noise Policy' section
1. Guest clicks 'View Original' toggle to clarify a term
1. Page scroll position is maintained

**Expected Results:**

- Content switches to English instantly (client-side)
- Scroll position remains at 'Noise Policy' section
- No page reload or flash
- Toggle button updates to 'View Translation'
- Guest can toggle back to French

---

## Edge Case Scenarios (18)

### UC-E4-013: Guest requests unavailable translation

**Category:** edge-case

**Related Tasks:** 2.4, 3.3, 5.2

**Test Steps:**

1. Guest's browser is set to Italian (it-IT)
1. Guest scans QR code for item
1. Item only has English and French translations (no Italian)
1. System detects Italian preference but no translation exists

**Expected Results:**

- MissingTranslationBanner displays: 'Italian translation not available. Showing content in English.'
- Content displays in original language (English)
- GuestLanguageSwitcher shows Italian as grayed out but selectable
- Guest can still select Italian (shows original content)

---

### UC-E4-014: Guest with unsupported language code

**Category:** edge-case

**Related Tasks:** 1.2, 7.3

**Test Steps:**

1. Guest's browser is set to Swahili (sw-KE)
1. Swahili is not in supported languages list
1. Guest scans QR code
1. System attempts to map browser language

**Expected Results:**

- mapToSupportedLanguage returns null for Swahili
- System falls back to content's original language
- No error is displayed to user
- Content displays normally in original language

---

### UC-E4-015: Guest with malformed Accept-Language header

**Category:** edge-case

**Related Tasks:** 1.2, 7.3

**Test Steps:**

1. Request includes malformed Accept-Language: 'xx,,;;;garbage'
1. parseAcceptLanguage function attempts to parse
1. Guest visits item page

**Expected Results:**

- parseAcceptLanguage handles malformed input gracefully
- No exception is thrown
- System falls back to default language
- Page loads successfully with original content

---

### UC-E4-016: Guest with cookies blocked by browser

**Category:** edge-case

**Related Tasks:** 4.2, 7.3

**Test Steps:**

1. Guest has cookies blocked in browser settings
1. Guest scans QR code with French browser
1. Content displays in French (from Accept-Language)
1. Guest selects Spanish
1. Guest navigates away and returns

**Expected Results:**

- Initial visit uses browser Accept-Language correctly
- Language switch works during session
- Cookie set attempt fails silently
- On return, language is re-detected from Accept-Language
- Experience is functional but not persistent

---

### UC-E4-017: Guest with partial translation (some fields missing)

**Category:** edge-case

**Related Tasks:** 2.1, 2.4, 7.3

**Test Steps:**

1. Item has French translation for name only
1. Description translation is missing (null)
1. Guest views item in French

**Expected Results:**

- Name displays in French (translated)
- Description displays in original English (fallback)
- mergeTranslation function handles partial translations
- No error or broken display occurs

---

### UC-E4-018: Guest with complex Accept-Language header

**Category:** edge-case

**Related Tasks:** 1.2

**Test Steps:**

1. Browser sends Accept-Language: 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6'
1. parseAcceptLanguage parses with quality weights
1. System determines best language match

**Expected Results:**

- German (de) is selected as highest priority supported language
- Quality weights are respected
- Language variants (de-DE) map to base language (de)
- Fallback chain works if primary not available

---

### UC-E4-019: Guest accesses item with very long translated content

**Category:** edge-case

**Related Tasks:** 3.2, 7.4

**Test Steps:**

1. Item has German translation (typically 20-30% longer than English)
1. Guest views item in German on mobile
1. Check layout with expanded text

**Expected Results:**

- Layout handles longer German text without breaking
- Text truncates with ellipsis where appropriate
- No horizontal scrolling on mobile
- Banner and buttons remain accessible

---

### UC-E4-020: Guest rapidly toggles between languages

**Category:** edge-case

**Related Tasks:** 4.1, 5.2

**Test Steps:**

1. Guest views item in English
1. Guest rapidly clicks: French -> German -> Spanish -> French
1. Multiple language changes in quick succession

**Expected Results:**

- UI remains responsive during rapid changes
- Final selected language is displayed correctly
- Cookie reflects the last selected language
- No race conditions or stale content

---

### UC-E4-021: Guest uses browser back button after language change

**Category:** edge-case

**Related Tasks:** 4.1, 5.4

**Test Steps:**

1. Guest visits /item/abc123 (shows in French from cookie)
1. Guest changes to Spanish, URL updates to /item/abc123?lang=es
1. Guest clicks browser back button

**Expected Results:**

- URL returns to /item/abc123 (no lang param)
- Content reverts to French (original cookie preference)
- Browser history works correctly
- No broken state after navigation

---

### UC-E4-022: Guest views item with pending translation status

**Category:** edge-case

**Related Tasks:** 2.1, 2.2

**Test Steps:**

1. Item has French translation with status 'pending'
1. Guest requests French translation
1. System checks translation_status column

**Expected Results:**

- Pending translations are NOT shown to guests
- Only 'completed' translations are displayed
- Guest sees original content with MissingTranslationBanner
- Languages API shows French in pendingTranslations array

---

### UC-E4-034: Screen reader accessibility with translation banner

**Category:** edge-case

**Related Tasks:** 3.2, 3.3, 3.5

**Test Steps:**

1. Visually impaired guest uses screen reader (NVDA/JAWS)
1. Guest accesses item page with French translation
1. Screen reader encounters TranslationBanner
1. Screen reader navigates through GuestLanguageSwitcher

**Expected Results:**

- TranslationBanner has proper ARIA labels announcing 'Translated from English'
- GuestLanguageSwitcher is keyboard navigable (Tab, Enter, Arrow keys)
- Language options are announced with native names
- View Original toggle has clear ARIA label and state
- All interactive elements have focus indicators

---

### UC-E4-035: Guest with mixed language preferences (e.g., fr-CA, fr-FR)

**Category:** edge-case

**Related Tasks:** 1.2, 6.2

**Test Steps:**

1. Guest has browser set to fr-CA (Canadian French)
1. System has translations for fr (French)
1. Accept-Language header contains 'fr-CA,fr;q=0.9,en;q=0.8'

**Expected Results:**

- System maps fr-CA to supported language 'fr'
- parseAcceptLanguage correctly parses quality values
- Guest sees French (fr) translation
- No error or fallback to English
- Regional variants map correctly to base language

---

### UC-E4-037: Guest toggles language rapidly (stress test)

**Category:** edge-case

**Related Tasks:** 3.1, 4.1

**Test Steps:**

1. Guest loads item page with English content
1. Guest rapidly clicks language switcher: EN→FR→ES→DE→EN (5 clicks in 3 seconds)
1. Cookie updates triggered for each click
1. UI re-renders for each language change

**Expected Results:**

- UI remains responsive throughout rapid changes
- No race conditions in state updates
- Final language (English) is reflected in cookie
- No memory leaks from rapid re-renders
- Content displays correctly for final language selection

---

### UC-E4-038: Browser incognito mode with no cookie persistence

**Category:** edge-case

**Related Tasks:** 4.2, 6.2

**Test Steps:**

1. Guest opens browser in incognito/private mode
1. Guest scans QR code for item
1. Guest selects German language
1. Guest navigates to another item (new QR scan)
1. Guest closes incognito tab and reopens item

**Expected Results:**

- Step 3: Cookie is set (but will be deleted on close)
- Step 4: German preference carries over via cookie
- Step 5: Language preference is lost (cookie deleted)
- Step 5: Fallback to Accept-Language header detection
- System handles cookie loss gracefully

---

### UC-E4-039: SEO crawler bot accesses item page

**Category:** edge-case

**Related Tasks:** 5.1

**Test Steps:**

1. Google bot crawls /item/abc123
1. Bot has Accept-Language: en-US header
1. Server generates metadata for SEO

**Expected Results:**

- Page serves original English content (canonical)
- Meta tags (title, description) use original language
- No language parameter in canonical URL
- hreflang tags indicate available translations
- No translation banner in bot-rendered HTML

---

### UC-E4-041: Guest with VPN showing mismatched location and language

**Category:** edge-case

**Related Tasks:** 1.2, 6.2

**Test Steps:**

1. Spanish-speaking guest uses VPN set to Germany
1. Browser Accept-Language: es-ES,es;q=0.9
1. VPN IP suggests location in Germany
1. Guest scans QR code

**Expected Results:**

- System respects Accept-Language header (Spanish), not IP geolocation
- Spanish content is displayed
- No conflict between VPN location and language preference
- Guest can manually switch to German if desired

---

### UC-E4-043: Missing translation fallback chain (Italian → Spanish → English)

**Category:** edge-case

**Related Tasks:** 2.4, 3.3

**Test Steps:**

1. Guest prefers Italian, but no Italian translation exists
1. System checks for fallback: Spanish (also missing)
1. System falls back to source language (English)

**Expected Results:**

- MissingTranslationBanner displays: 'Italian translation not available. Showing content in English.'
- Original English content is displayed
- GuestLanguageSwitcher shows Italian as unavailable (grayed)
- No cascading fallback (Italian → Spanish → English); direct to source

---

### UC-E4-045: Guest with JavaScript disabled (progressive enhancement)

**Category:** edge-case

**Related Tasks:** 5.1, 5.2

**Test Steps:**

1. Guest disables JavaScript in browser
1. Guest scans QR code with ?lang=fr
1. Server renders page with French content

**Expected Results:**

- Server-side rendering provides French content
- Static HTML includes translated text
- TranslationBanner displays (no JS required)
- GuestLanguageSwitcher may not be interactive (requires JS)
- View Original toggle may not work (client-side feature)
- Core content remains accessible without JS

---

## Error Handling Scenarios (5)

### UC-E4-023: API returns 404 for non-existent item

**Category:** error-handling

**Related Tasks:** 2.2

**Test Steps:**

1. Guest or client requests /api/public/items/nonexistent123?lang=fr
1. Item with publicId 'nonexistent123' does not exist

**Expected Results:**

- API returns 404 Not Found status
- Response includes appropriate error message
- No translation lookup is attempted
- Error is logged for monitoring

---

### UC-E4-024: Database connection failure during translation fetch

**Category:** error-handling

**Related Tasks:** 2.1, 5.1

**Test Steps:**

1. Guest scans QR code for item
1. Database connection fails during translation fetch
1. fetchTranslatedItem encounters error

**Expected Results:**

- Error is caught and logged
- Graceful fallback to original content
- Guest sees original content (not an error page)
- No translation banner shown (not a translation issue)

---

### UC-E4-025: Invalid language code in URL parameter

**Category:** error-handling

**Related Tasks:** 1.2, 5.4

**Test Steps:**

1. Guest accesses /item/abc123?lang=xx (invalid code)
1. System attempts to validate language parameter
1. 'xx' is not in supported languages

**Expected Results:**

- Invalid language code is ignored
- System falls back to cookie -> Accept-Language -> default
- No error displayed to user
- Page loads normally with detected language

---

### UC-E4-026: Translation API timeout

**Category:** error-handling

**Related Tasks:** 2.2, 2.3

**Test Steps:**

1. Guest requests item with translations
1. Supabase query times out
1. API request exceeds timeout threshold

**Expected Results:**

- Request timeout is handled gracefully
- Guest receives original content as fallback
- Error is logged with timeout details
- Response time does not exceed 200ms for user

---

### UC-E4-027: Concurrent translation requests for same item

**Category:** error-handling

**Related Tasks:** 2.1, 2.2

**Test Steps:**

1. Multiple guests simultaneously request same item
1. Each with different language preference
1. Server handles concurrent database queries

**Expected Results:**

- Each guest receives correct language version
- No data leakage between requests
- Database handles concurrent reads efficiently
- Caching (if implemented) works correctly

---

## Integration Scenarios (9)

### UC-E4-028: End-to-end QR code scan flow

**Category:** integration

**Related Tasks:** 5.1, 5.2, 6.1, 6.2

**Test Steps:**

1. Property owner generates QR code for item
1. QR code links to /item/abc123
1. French-speaking guest scans QR code with phone
1. Phone camera app opens link in mobile browser
1. Guest views translated item content

**Expected Results:**

- QR code URL works without ?lang= parameter
- Browser Accept-Language header is detected
- Page loads with French content
- TranslationBanner and language switcher display correctly
- Guest can share link with ?lang=fr to preserve language

---

### UC-E4-029: Integration with Epic 3 translation pipeline

**Category:** integration

**Related Tasks:** 2.1, 2.2

**Test Steps:**

1. Owner submits item for translation (Epic 3)
1. Translation completes, status set to 'completed'
1. Guest scans QR code for newly translated item

**Expected Results:**

- New translations appear immediately for guests
- No cache invalidation issues
- Guest sees freshly translated content
- Languages API correctly reports new translation

---

### UC-E4-030: Integration with existing item display components

**Category:** integration

**Related Tasks:** 5.2, 5.3

**Test Steps:**

1. Existing ItemDisplay component renders item
1. New translation props are passed from server
1. GuestLanguageSwitcher integrates with header
1. TranslationBanner displays above content

**Expected Results:**

- Existing component functionality unchanged
- Translation features added without breaking existing UI
- Props interface is backwards compatible
- LinkCard component shows translated titles

---

### UC-E4-031: Middleware integration with authentication flow

**Category:** integration

**Related Tasks:** 6.1

**Test Steps:**

1. Guest visits item page (/item/abc123)
1. Middleware handles request
1. Language detection runs alongside auth checks

**Expected Results:**

- Language detection does not interfere with auth
- No redirects occur for /item/* routes
- Language header/cookie is set for downstream use
- Performance impact is minimal (< 10ms)

---

### UC-E4-032: Full user journey: multilingual property exploration

**Category:** integration

**Related Tasks:** 3.1, 4.1, 5.1, 5.2

**Test Steps:**

1. German guest arrives at vacation property
1. Guest scans QR code in property (item: wifi instructions)
1. Views wifi setup in German
1. Guest switches to English to verify technical terms
1. Guest scans another QR code (item: house rules)
1. House rules display in German (saved preference)
1. Guest shares link with ?lang=de to family member

**Expected Results:**

- Seamless multilingual experience throughout stay
- Language preference persists across all items
- Toggle between languages is instant
- Shared links preserve language context
- No login required for full localization experience

---

### UC-E4-033: Multi-device language preference sync via URL

**Category:** integration

**Related Tasks:** 4.2, 5.4

**Test Steps:**

1. Guest views item on mobile phone, sets language to Spanish
1. Guest shares link with ?lang=es to themselves via email
1. Guest opens email on laptop (different browser, no cookies)
1. Guest clicks link with ?lang=es parameter

**Expected Results:**

- Spanish content displays on laptop despite different device
- FAQBNB_GUEST_LANG cookie is set on laptop browser
- Guest's language preference is now active on both devices
- URL parameter successfully bridges multi-device gap

---

### UC-E4-042: Complex user journey: Property staff helping multilingual guests

**Category:** integration

**Related Tasks:** 3.1, 4.1, 5.2

**Test Steps:**

1. Property staff member uses tablet at reception
1. Italian guest arrives, staff helps scan WiFi QR code
1. Staff switches language to Italian on tablet
1. Guest sees WiFi instructions in Italian
1. German guest arrives, staff switches to German
1. Staff scans house rules QR for German guest
1. German content displays instantly

**Expected Results:**

- Language switcher allows rapid switching for staff
- Each language change updates cookie immediately
- Staff can assist multiple guests without page reloads
- Language preference persists for subsequent QR scans
- Tablet remains in last selected language for next guest

---

### UC-E4-044: Guest shares link via social media preview

**Category:** integration

**Related Tasks:** 5.1, 5.4

**Test Steps:**

1. Guest views item in French
1. Guest clicks 'Share' and copies link: /item/abc123?lang=fr
1. Guest pastes link to WhatsApp/Facebook
1. Social media platform fetches Open Graph metadata

**Expected Results:**

- Open Graph tags reflect French translated content
- Preview shows French title and description
- Recipient clicking link sees French content
- Social share includes ?lang=fr parameter

---

### UC-E4-048: Partial translation completion (Epic 3 workflow integration)

**Category:** integration

**Related Tasks:** 2.1, 2.2

**Test Steps:**

1. Owner submits item for German translation (Epic 3)
1. Translation job completes item name and description
1. Article translations still pending (status: 'pending')
1. Guest requests item in German

**Expected Results:**

- Item name and description display in German
- Articles display in original language (English)
- No MissingTranslationBanner (partial translation is available)
- TranslationBanner shows 'Translated from English' (item level)
- Mixed language content is handled gracefully

---

