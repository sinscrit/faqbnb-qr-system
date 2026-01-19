# L10N E2E Pre-Test Environment Checklist

**Document Version:** 1.0
**Created:** 2026-01-18
**Last Modified:** 2026-01-18

---

## Purpose

This checklist must be completed before executing the L10N E2E Test Protocol. It ensures all prerequisites are met and the testing environment is properly configured.

---

## Checklist Date: ________

## Verified By: ________

---

## Section 1: Staging Deployment Verification

### 1.1 Application Accessibility

- [ ] **Staging URL accessible:** https://faqbnb-staging.up.railway.app
  - Response: ______

- [ ] **Version API returns valid response:**
  ```bash
  curl https://faqbnb-staging.up.railway.app/api/version
  ```
  - Version: ______

### 1.2 L10N Component Deployment

Verify these components are deployed by checking for their presence:

- [ ] **LanguageSwitcher component exists:**
  - Check: Navigate to /dashboard2 and look for language dropdown

- [ ] **Translation files deployed:**
  - Check: Change language and verify text changes

- [ ] **Translation API accessible:**
  ```bash
  curl -X GET "https://faqbnb-staging.up.railway.app/api/admin/translation-jobs" \
    -H "Authorization: Bearer [TOKEN]"
  ```
  - Response status: ______

---

## Section 2: Database Verification

### 2.1 Translation Tables Exist

Verify via Supabase Studio or SQL:

- [ ] `article_translations` table exists
- [ ] `item_translations` table exists
- [ ] `link_translations` table exists
- [ ] `tag_translations` table exists
- [ ] `translation_jobs` table exists

### 2.2 User Preference Columns

- [ ] `users.preferred_language` column exists
- [ ] `accounts.preferred_language` column exists

### 2.3 Source Language Columns

- [ ] `items.source_language` column exists
- [ ] `item_articles.source_language` column exists
- [ ] `item_links.source_language` column exists

---

## Section 3: Test Account Setup

### 3.1 Admin Test Account

- [ ] Admin account created/available
  - Email: ______
  - Has admin privileges: [ ] Yes

### 3.2 Regular Test Account

- [ ] Regular user account created/available
  - Email: ______
  - Can access dashboard: [ ] Yes

---

## Section 4: Browser/Device Preparation

### 4.1 Desktop Browsers Installed

- [ ] Chrome (Latest): Version ______
- [ ] Firefox (Latest): Version ______
- [ ] Safari (Latest): Version ______
- [ ] Edge (Latest): Version ______

### 4.2 Mobile Devices Available

- [ ] iOS device or simulator available
  - Device/Version: ______

- [ ] Android device or emulator available
  - Device/Version: ______

### 4.3 Browser Configuration

- [ ] All cookies cleared for staging domain
- [ ] Browser cache cleared
- [ ] No browser extensions that might interfere (ad blockers, etc.)

---

## Section 5: Network and Connectivity

- [ ] Stable internet connection
- [ ] No VPN that might affect locale detection
- [ ] Can access Supabase Studio for verification queries

---

## Section 6: Documentation Ready

- [ ] Test Protocol document available: `docs/testing/L10N-E2E-Test-Protocol.md`
- [ ] Test Results template ready: `docs/testing/L10N-E2E-Test-Results-Template.md`
- [ ] Defect Report template ready: `docs/testing/L10N-E2E-Defect-Report-Template.md`
- [ ] Screenshot folder created for evidence

---

## Section 7: Prerequisites Pass/Fail

### Critical Prerequisites (Must Pass)

| Prerequisite | Status |
|--------------|--------|
| Staging accessible | |
| LanguageSwitcher visible | |
| Admin account available | |
| Translation tables exist | |
| At least one browser ready | |

### Overall Status

- [ ] **READY** - All critical prerequisites pass, testing can begin
- [ ] **NOT READY** - One or more critical items failed, cannot proceed

### Blocker Notes (if not ready)

[Document what's blocking test execution]

---

## Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Tester | | | Ready / Blocked |

---

*Document created for REQ-256: Manual E2E Validation - L10N Epic 1 Foundation*
