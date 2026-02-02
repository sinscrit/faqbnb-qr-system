# L10N Epic 4 - Guest Experience
# QA Testing Checklist

**Generated:** 2026-01-31 01:04:34
**Last Modified:** 2026-01-31 01:04:34
**Total Test Cases:** 48

---

## How to Use This Checklist

This checklist provides a quick reference for QA testing of the L10N Epic 4 - Guest Experience implementation. For detailed test steps and expected results, refer to the full use case document: `Epic4-UseCase-Test-Scenarios.md`

Mark each test as:
- ✅ PASS
- ❌ FAIL (with issue reference)
- ⏭️ SKIP (with reason)
- 🔄 RETEST (after fix)

---

## Critical Path Testing (Must Pass)

These scenarios represent the core guest experience and must all pass before release:

- [ ] **UC-E4-001**: Guest scans QR code with French browser - displays French content
- [ ] **UC-E4-002**: Guest manually switches language using GuestLanguageSwitcher
- [ ] **UC-E4-003**: Guest toggles View Original to see original content
- [ ] **UC-E4-004**: Guest accesses shareable link with language parameter
- [ ] **UC-E4-005**: Guest returns to site with saved language preference
- [ ] **UC-E4-006**: Guest views item with translations for all content types
- [ ] **UC-E4-007**: Guest views language availability via API
- [ ] **UC-E4-008**: Guest accesses item via public API with language parameter
- [ ] **UC-E4-009**: Guest views item on mobile device
- [ ] **UC-E4-010**: Guest experiences fast page load with translation
- [ ] **UC-E4-011**: Guest views SEO-optimized page with translated metadata
- [ ] **UC-E4-012**: Guest views full translation flow across multiple items
- [ ] **UC-E4-036**: Performance test: 100 concurrent translation requests
- [ ] **UC-E4-040**: Translation with HTML/Markdown content preservation
- [ ] **UC-E4-046**: Database query optimization for batch translation fetches
- [ ] **UC-E4-047**: Guest switches from translated to original mid-read

---

## Edge Case Testing

These scenarios test boundary conditions and unusual but valid user behaviors:

- [ ] **UC-E4-013**: Guest requests unavailable translation
- [ ] **UC-E4-014**: Guest with unsupported language code
- [ ] **UC-E4-015**: Guest with malformed Accept-Language header
- [ ] **UC-E4-016**: Guest with cookies blocked by browser
- [ ] **UC-E4-017**: Guest with partial translation (some fields missing)
- [ ] **UC-E4-018**: Guest with complex Accept-Language header
- [ ] **UC-E4-019**: Guest accesses item with very long translated content
- [ ] **UC-E4-020**: Guest rapidly toggles between languages
- [ ] **UC-E4-021**: Guest uses browser back button after language change
- [ ] **UC-E4-022**: Guest views item with pending translation status
- [ ] **UC-E4-034**: Screen reader accessibility with translation banner
- [ ] **UC-E4-035**: Guest with mixed language preferences (e.g., fr-CA, fr-FR)
- [ ] **UC-E4-037**: Guest toggles language rapidly (stress test)
- [ ] **UC-E4-038**: Browser incognito mode with no cookie persistence
- [ ] **UC-E4-039**: SEO crawler bot accesses item page
- [ ] **UC-E4-041**: Guest with VPN showing mismatched location and language
- [ ] **UC-E4-043**: Missing translation fallback chain (Italian → Spanish → English)
- [ ] **UC-E4-045**: Guest with JavaScript disabled (progressive enhancement)

---

## Error Handling Testing

These scenarios test system behavior under error conditions:

- [ ] **UC-E4-023**: API returns 404 for non-existent item
- [ ] **UC-E4-024**: Database connection failure during translation fetch
- [ ] **UC-E4-025**: Invalid language code in URL parameter
- [ ] **UC-E4-026**: Translation API timeout
- [ ] **UC-E4-027**: Concurrent translation requests for same item

---

## Integration Testing

These scenarios test integration with other system components:

- [ ] **UC-E4-028**: End-to-end QR code scan flow
- [ ] **UC-E4-029**: Integration with Epic 3 translation pipeline
- [ ] **UC-E4-030**: Integration with existing item display components
- [ ] **UC-E4-031**: Middleware integration with authentication flow
- [ ] **UC-E4-032**: Full user journey: multilingual property exploration
- [ ] **UC-E4-033**: Multi-device language preference sync via URL
- [ ] **UC-E4-042**: Complex user journey: Property staff helping multilingual guests
- [ ] **UC-E4-044**: Guest shares link via social media preview
- [ ] **UC-E4-048**: Partial translation completion (Epic 3 workflow integration)

---

## Testing Environments

### Required Test Environments

- [ ] **Desktop Browsers**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)

- [ ] **Mobile Browsers**
  - [ ] iOS Safari
  - [ ] Android Chrome
  - [ ] Android Firefox

- [ ] **Devices**
  - [ ] Desktop (1920x1080)
  - [ ] Tablet (iPad, 768x1024)
  - [ ] Mobile (iPhone, 375x667)
  - [ ] Mobile (Android, 360x640)

- [ ] **Special Modes**
  - [ ] Incognito/Private browsing
  - [ ] With cookies blocked
  - [ ] With JavaScript disabled
  - [ ] With screen reader (NVDA/JAWS)

---

## Pre-Flight Checks

Before starting testing, verify:

- [ ] Development/staging environment is deployed with latest Epic 4 code
- [ ] Database has sample items with translations in all 6 languages (en, fr, es, de, nl, it)
- [ ] At least one item has partial translations (some languages missing)
- [ ] At least one item has no translations (original only)
- [ ] QR codes are generated for test items
- [ ] Test devices can scan QR codes
- [ ] Browser language settings can be modified
- [ ] Network inspector tools are available for performance testing

---

## Performance Benchmarks

Document performance metrics during testing:

### Language Detection
- [ ] Language detection: < 10ms
- [ ] Cookie read/write: < 5ms

### Page Load
- [ ] Initial page load (with translation): < 200ms
- [ ] Translation fetch from database: < 100ms
- [ ] Client-side language switch: < 100ms

### Concurrent Load
- [ ] 100 concurrent requests: P95 < 200ms
- [ ] Database connection pool: No exhaustion
- [ ] Memory usage: Stable (no leaks)

---

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible (Tab, Enter, Arrows)
- [ ] Focus indicators visible on all focusable elements
- [ ] ARIA labels present on TranslationBanner, GuestLanguageSwitcher
- [ ] Screen reader announces language changes
- [ ] Color contrast meets WCAG AA standards
- [ ] Text remains readable when zoomed to 200%

---

## Known Issues / Expected Behavior

Document any known limitations:

1. **Translation availability**: Some items may not have all languages
   - Expected: MissingTranslationBanner displays, original content shown
   
2. **Cookie persistence in incognito**: Preferences lost on tab close
   - Expected: Behavior documented, no error shown to user
   
3. **JavaScript disabled**: Language switcher not interactive
   - Expected: Server-rendered content works, switcher is static HTML

---

## Sign-Off

- [ ] All critical path tests passed
- [ ] All edge case tests completed (with issues documented)
- [ ] All error handling tests passed
- [ ] All integration tests passed
- [ ] Performance benchmarks met
- [ ] Accessibility requirements met
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness verified

**Tested By:** ___________________  
**Date:** ___________________  
**Build/Version:** ___________________  
**Sign-Off:** ___________________  

---

*For detailed test steps and expected results, see: `Epic4-UseCase-Test-Scenarios.md`*
