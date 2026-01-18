# REQ-241: Add Environment Variables - Detailed Task Breakdown

**Document Created:** 2026-01-18 13:45 UTC
**Last Modified:** 2026-01-18 13:45 UTC
**Request Reference:** REQ-241 (Translation Service Environment Configuration)
**Overview Document:** REQ-241-add-environment-variables-overview.md
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.7
**Estimated Size:** XS (Extra Small)

---

## Executive Summary

This document provides granular, step-by-step implementation tasks for adding translation service environment variables to the `.env.example` file. The implementation adds documentation for 3 required variables (`TRANSLATION_PROVIDER`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) and 3 optional tuning variables. Each task is designed to be completable in approximately 1 story point or less.

---

## Prerequisites Checklist

Before starting implementation, verify the following:

| Prerequisite | Status | Verification Command/Action |
|--------------|--------|----------------------------|
| REQ-235 completed | Required | File exists: `/src/lib/translation-service/translation-service.types.ts` |
| REQ-236 completed | Required | File exists: `/src/lib/translation-service/providers/claude-provider.ts` |
| REQ-237 completed | Required | File exists: `/src/lib/translation-service/providers/openai-provider.ts` |
| REQ-240 completed | Required | File exists: `/src/lib/translation-service/translation-service.ts` |
| `.env.example` exists | Required | `ls -la .env.example` |

---

## Task Breakdown

### Task 3.7.1: Add Translation Service Configuration Header Section

**Story Points:** 0.5
**Type:** Documentation
**File:** `/.env.example`

**Description:**
Add a visual section separator and header for the translation service configuration block.

**Implementation Steps:**

1. Open `/.env.example` for editing
2. After the existing content (line 8), add a blank line
3. Add the following section header:

```bash
# =============================================================================
# Translation Service Configuration
# =============================================================================
```

**Acceptance Criteria:**
- [ ] Section header is visually distinct from existing sections
- [ ] Uses same style as could be used for other future sections

**Verification:**
```bash
cat .env.example | grep -A2 "Translation Service"
```

---

### Task 3.7.2: Add TRANSLATION_PROVIDER Variable

**Story Points:** 0.5
**Type:** Documentation
**File:** `/.env.example`
**Dependencies:** Task 3.7.1

**Description:**
Add the primary translation provider selection variable with descriptive comments.

**Implementation Steps:**

1. After the section header from Task 3.7.1, add:

```bash

# Primary translation provider for AI-powered translations
# Options: 'claude' (recommended) or 'openai'
# Default: claude
TRANSLATION_PROVIDER=claude
```

**Variable Specification:**

| Attribute | Value |
|-----------|-------|
| Variable Name | `TRANSLATION_PROVIDER` |
| Type | `string` |
| Valid Values | `'claude'`, `'openai'` |
| Default Value | `claude` |
| Required | No (defaults to claude) |
| Used By | `/src/lib/translation-service/translation-service.ts` |

**Acceptance Criteria:**
- [ ] Comment explains purpose: "Primary translation provider for AI-powered translations"
- [ ] Comment lists valid options: 'claude' and 'openai'
- [ ] Comment indicates recommended option: 'claude'
- [ ] Comment states default value: claude
- [ ] Example value is set to `claude`

**Verification:**
```bash
grep -A3 "TRANSLATION_PROVIDER" .env.example
```

---

### Task 3.7.3: Add ANTHROPIC_API_KEY Variable

**Story Points:** 0.5
**Type:** Documentation
**File:** `/.env.example`
**Dependencies:** Task 3.7.2

**Description:**
Add the Anthropic API key variable for Claude translations with descriptive comments and console link.

**Implementation Steps:**

1. After TRANSLATION_PROVIDER variable, add:

```bash

# Anthropic API key for Claude translations
# Required if TRANSLATION_PROVIDER=claude or for fallback when using OpenAI
# Obtain from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-xxx
```

**Variable Specification:**

| Attribute | Value |
|-----------|-------|
| Variable Name | `ANTHROPIC_API_KEY` |
| Type | `string` |
| Format | Starts with `sk-ant-` |
| Required | Conditional (when using Claude) |
| Used By | `/src/lib/translation-service/providers/claude-provider.ts` |
| Obtain From | https://console.anthropic.com/settings/keys |

**Acceptance Criteria:**
- [ ] Comment explains purpose: "Anthropic API key for Claude translations"
- [ ] Comment explains when required: when using Claude or as fallback
- [ ] Comment includes link to Anthropic console for obtaining key
- [ ] Example value uses clearly fake format: `sk-ant-xxx`

**Verification:**
```bash
grep -A3 "ANTHROPIC_API_KEY" .env.example
```

---

### Task 3.7.4: Add OPENAI_API_KEY Variable

**Story Points:** 0.5
**Type:** Documentation
**File:** `/.env.example`
**Dependencies:** Task 3.7.3

**Description:**
Add the OpenAI API key variable for GPT translations with descriptive comments and platform link.

**Implementation Steps:**

1. After ANTHROPIC_API_KEY variable, add:

```bash

# OpenAI API key for GPT translations
# Required if TRANSLATION_PROVIDER=openai or for fallback when using Claude
# Obtain from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxx
```

**Variable Specification:**

| Attribute | Value |
|-----------|-------|
| Variable Name | `OPENAI_API_KEY` |
| Type | `string` |
| Format | Starts with `sk-` |
| Required | Conditional (when using OpenAI or as fallback) |
| Used By | `/src/lib/translation-service/providers/openai-provider.ts` |
| Obtain From | https://platform.openai.com/api-keys |

**Acceptance Criteria:**
- [ ] Comment explains purpose: "OpenAI API key for GPT translations"
- [ ] Comment explains when required: when using OpenAI or as fallback
- [ ] Comment includes link to OpenAI platform for obtaining key
- [ ] Example value uses clearly fake format: `sk-xxx`

**Verification:**
```bash
grep -A3 "OPENAI_API_KEY" .env.example
```

---

### Task 3.7.5: Add Optional Tuning Section Header

**Story Points:** 0.25
**Type:** Documentation
**File:** `/.env.example`
**Dependencies:** Task 3.7.4

**Description:**
Add a subsection header for optional translation service tuning variables.

**Implementation Steps:**

1. After OPENAI_API_KEY variable, add:

```bash

# =============================================================================
# Translation Service Tuning (Optional)
# =============================================================================
```

**Acceptance Criteria:**
- [ ] Section header clearly indicates these are optional settings
- [ ] Uses same visual style as main configuration header

**Verification:**
```bash
grep "Translation Service Tuning" .env.example
```

---

### Task 3.7.6: Add Optional TRANSLATION_MAX_RETRIES Variable (Commented)

**Story Points:** 0.25
**Type:** Documentation
**File:** `/.env.example`
**Dependencies:** Task 3.7.5

**Description:**
Add the optional max retries variable as a commented example.

**Implementation Steps:**

1. After the optional tuning header, add:

```bash

# Maximum retry attempts for failed translation requests
# Default: 3
# TRANSLATION_MAX_RETRIES=3
```

**Variable Specification:**

| Attribute | Value |
|-----------|-------|
| Variable Name | `TRANSLATION_MAX_RETRIES` |
| Type | `number` |
| Default Value | `3` |
| Required | No |
| Used By | `/src/lib/translation-service/translation-service.ts` |

**Acceptance Criteria:**
- [ ] Variable is commented out (starts with `#`)
- [ ] Comment explains purpose
- [ ] Comment shows default value
- [ ] Example shows default value

**Verification:**
```bash
grep -A2 "TRANSLATION_MAX_RETRIES" .env.example
```

---

### Task 3.7.7: Add Optional TRANSLATION_RATE_LIMIT_PER_MINUTE Variable (Commented)

**Story Points:** 0.25
**Type:** Documentation
**File:** `/.env.example`
**Dependencies:** Task 3.7.6

**Description:**
Add the optional rate limiting variable as a commented example.

**Implementation Steps:**

1. After TRANSLATION_MAX_RETRIES, add:

```bash

# Rate limiting: maximum translation requests per minute per provider
# Default: 60
# TRANSLATION_RATE_LIMIT_PER_MINUTE=60
```

**Variable Specification:**

| Attribute | Value |
|-----------|-------|
| Variable Name | `TRANSLATION_RATE_LIMIT_PER_MINUTE` |
| Type | `number` |
| Default Value | `60` |
| Required | No |
| Used By | `/src/lib/translation-service/utils/rate-limiter.ts` |

**Acceptance Criteria:**
- [ ] Variable is commented out (starts with `#`)
- [ ] Comment explains purpose: rate limiting per provider
- [ ] Comment shows default value
- [ ] Example shows default value

**Verification:**
```bash
grep -A2 "TRANSLATION_RATE_LIMIT_PER_MINUTE" .env.example
```

---

### Task 3.7.8: Add Optional TRANSLATION_JOB_BATCH_SIZE Variable (Commented)

**Story Points:** 0.25
**Type:** Documentation
**File:** `/.env.example`
**Dependencies:** Task 3.7.7

**Description:**
Add the optional job batch size variable as a commented example for Phase 4 usage.

**Implementation Steps:**

1. After TRANSLATION_RATE_LIMIT_PER_MINUTE, add:

```bash

# Translation job batch size for background processing
# Default: 10
# TRANSLATION_JOB_BATCH_SIZE=10
```

**Variable Specification:**

| Attribute | Value |
|-----------|-------|
| Variable Name | `TRANSLATION_JOB_BATCH_SIZE` |
| Type | `number` |
| Default Value | `10` |
| Required | No |
| Used By | `/src/lib/job-queue/translation-jobs.ts` (Phase 4) |

**Acceptance Criteria:**
- [ ] Variable is commented out (starts with `#`)
- [ ] Comment explains purpose: batch size for background job processing
- [ ] Comment shows default value
- [ ] Example shows default value

**Verification:**
```bash
grep -A2 "TRANSLATION_JOB_BATCH_SIZE" .env.example
```

---

### Task 3.7.9: Final Review and Verification

**Story Points:** 0.5
**Type:** Verification
**File:** `/.env.example`
**Dependencies:** Tasks 3.7.1-3.7.8

**Description:**
Perform final review of the complete `.env.example` file to ensure all acceptance criteria are met.

**Implementation Steps:**

1. **Review Complete File Structure:**
   ```bash
   cat .env.example
   ```

2. **Verify All Required Variables Present:**
   ```bash
   echo "Checking required variables..."
   grep "TRANSLATION_PROVIDER" .env.example && echo "✓ TRANSLATION_PROVIDER found"
   grep "ANTHROPIC_API_KEY" .env.example && echo "✓ ANTHROPIC_API_KEY found"
   grep "OPENAI_API_KEY" .env.example && echo "✓ OPENAI_API_KEY found"
   ```

3. **Verify All Comments Exist:**
   ```bash
   # Each variable should have descriptive comments
   grep -B3 "TRANSLATION_PROVIDER=" .env.example
   grep -B3 "ANTHROPIC_API_KEY=" .env.example
   grep -B3 "OPENAI_API_KEY=" .env.example
   ```

4. **Verify Optional Variables are Commented:**
   ```bash
   grep "^# TRANSLATION_MAX_RETRIES" .env.example
   grep "^# TRANSLATION_RATE_LIMIT_PER_MINUTE" .env.example
   grep "^# TRANSLATION_JOB_BATCH_SIZE" .env.example
   ```

5. **Verify No Secrets Committed:**
   ```bash
   # Ensure example values are clearly fake
   grep "sk-ant-xxx" .env.example && echo "✓ Anthropic key is placeholder"
   grep "sk-xxx" .env.example && echo "✓ OpenAI key is placeholder"
   ```

**Acceptance Criteria:**
- [ ] File structure matches expected final output
- [ ] All 3 required variables documented
- [ ] All 3 optional variables documented (commented out)
- [ ] All variables have descriptive comments
- [ ] Console/platform links are included for API keys
- [ ] Example values are clearly fake (not real API keys)
- [ ] File has no syntax errors

**Expected Final File Content:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# QR Code Domain Configuration
NEXT_PUBLIC_QR_DOMAIN_OVERRIDE=https://your-production-domain.com

# =============================================================================
# Translation Service Configuration
# =============================================================================

# Primary translation provider for AI-powered translations
# Options: 'claude' (recommended) or 'openai'
# Default: claude
TRANSLATION_PROVIDER=claude

# Anthropic API key for Claude translations
# Required if TRANSLATION_PROVIDER=claude or for fallback when using OpenAI
# Obtain from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-xxx

# OpenAI API key for GPT translations
# Required if TRANSLATION_PROVIDER=openai or for fallback when using Claude
# Obtain from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxx

# =============================================================================
# Translation Service Tuning (Optional)
# =============================================================================

# Maximum retry attempts for failed translation requests
# Default: 3
# TRANSLATION_MAX_RETRIES=3

# Rate limiting: maximum translation requests per minute per provider
# Default: 60
# TRANSLATION_RATE_LIMIT_PER_MINUTE=60

# Translation job batch size for background processing
# Default: 10
# TRANSLATION_JOB_BATCH_SIZE=10
```

---

## Implementation Summary

### Task Execution Order

| Order | Task ID | Description | Est. Points |
|-------|---------|-------------|-------------|
| 1 | 3.7.1 | Add section header | 0.5 |
| 2 | 3.7.2 | Add TRANSLATION_PROVIDER | 0.5 |
| 3 | 3.7.3 | Add ANTHROPIC_API_KEY | 0.5 |
| 4 | 3.7.4 | Add OPENAI_API_KEY | 0.5 |
| 5 | 3.7.5 | Add optional tuning header | 0.25 |
| 6 | 3.7.6 | Add TRANSLATION_MAX_RETRIES | 0.25 |
| 7 | 3.7.7 | Add TRANSLATION_RATE_LIMIT_PER_MINUTE | 0.25 |
| 8 | 3.7.8 | Add TRANSLATION_JOB_BATCH_SIZE | 0.25 |
| 9 | 3.7.9 | Final review and verification | 0.5 |
| **Total** | | | **3.5 points** |

### Files Modified

| File | Action | Lines Added |
|------|--------|-------------|
| `/.env.example` | Modify | ~35 lines |

### No Files Created

This task only modifies an existing file.

---

## Acceptance Criteria Mapping (from REQ-241)

| Original Criteria | Implementing Task | Verification |
|-------------------|-------------------|--------------|
| Configuration template includes translation provider selection variable | Task 3.7.2 | `grep TRANSLATION_PROVIDER .env.example` |
| Configuration template includes Anthropic API credential variable | Task 3.7.3 | `grep ANTHROPIC_API_KEY .env.example` |
| Configuration template includes OpenAI API credential variable | Task 3.7.4 | `grep OPENAI_API_KEY .env.example` |
| All new variables include descriptive comments explaining their purpose and valid values | Tasks 3.7.2-3.7.8 | Manual review of comments |

---

## Environment Variable Reference

### Required Variables (For Translation Service)

| Variable | Purpose | Type | Default | Provider |
|----------|---------|------|---------|----------|
| `TRANSLATION_PROVIDER` | Select primary AI provider | `'claude' \| 'openai'` | `claude` | Both |
| `ANTHROPIC_API_KEY` | Claude API authentication | `string` | - | Claude |
| `OPENAI_API_KEY` | OpenAI API authentication | `string` | - | OpenAI |

### Optional Variables (Tuning)

| Variable | Purpose | Type | Default | Component |
|----------|---------|------|---------|-----------|
| `TRANSLATION_MAX_RETRIES` | Max retry attempts | `number` | `3` | translation-service.ts |
| `TRANSLATION_RATE_LIMIT_PER_MINUTE` | Rate limit per provider | `number` | `60` | rate-limiter.ts |
| `TRANSLATION_JOB_BATCH_SIZE` | Background job batch size | `number` | `10` | translation-jobs.ts |

---

## Security Considerations

1. **Example Values Must Be Clearly Fake**
   - `sk-ant-xxx` is not a valid Anthropic key format (too short)
   - `sk-xxx` is not a valid OpenAI key format (too short)
   - These patterns prevent accidental usage

2. **No NEXT_PUBLIC_ Prefix**
   - API keys MUST NOT use `NEXT_PUBLIC_` prefix
   - This ensures they are only available server-side

3. **Existing .gitignore Protection**
   - `.env.local` is already in `.gitignore`
   - `.env` is already in `.gitignore`
   - Only `.env.example` is committed (with fake values)

---

## Post-Implementation Verification

After completing all tasks, run this verification script:

```bash
#!/bin/bash
echo "=== REQ-241 Verification ==="

# Check file exists
if [ -f ".env.example" ]; then
  echo "✓ .env.example exists"
else
  echo "✗ .env.example not found"
  exit 1
fi

# Check required variables
echo ""
echo "Checking required variables..."
grep -q "^TRANSLATION_PROVIDER=" .env.example && echo "✓ TRANSLATION_PROVIDER present (uncommented)"
grep -q "^ANTHROPIC_API_KEY=" .env.example && echo "✓ ANTHROPIC_API_KEY present (uncommented)"
grep -q "^OPENAI_API_KEY=" .env.example && echo "✓ OPENAI_API_KEY present (uncommented)"

# Check optional variables are commented
echo ""
echo "Checking optional variables..."
grep -q "^# TRANSLATION_MAX_RETRIES=" .env.example && echo "✓ TRANSLATION_MAX_RETRIES present (commented)"
grep -q "^# TRANSLATION_RATE_LIMIT_PER_MINUTE=" .env.example && echo "✓ TRANSLATION_RATE_LIMIT_PER_MINUTE present (commented)"
grep -q "^# TRANSLATION_JOB_BATCH_SIZE=" .env.example && echo "✓ TRANSLATION_JOB_BATCH_SIZE present (commented)"

# Check for fake API keys
echo ""
echo "Checking API key placeholders..."
grep -q "sk-ant-xxx" .env.example && echo "✓ Anthropic key is placeholder"
grep -q "OPENAI_API_KEY=sk-xxx" .env.example && echo "✓ OpenAI key is placeholder"

# Check for console links
echo ""
echo "Checking documentation links..."
grep -q "console.anthropic.com" .env.example && echo "✓ Anthropic console link present"
grep -q "platform.openai.com" .env.example && echo "✓ OpenAI platform link present"

echo ""
echo "=== Verification Complete ==="
```

---

## Dependencies

### Blocked By (Must Complete First)

| Dependency | File | Status |
|------------|------|--------|
| REQ-235: Translation service types | `/src/lib/translation-service/translation-service.types.ts` | Defines `TranslationProvider` type |
| REQ-236: Claude provider | `/src/lib/translation-service/providers/claude-provider.ts` | Consumes `ANTHROPIC_API_KEY` |
| REQ-237: OpenAI provider | `/src/lib/translation-service/providers/openai-provider.ts` | Consumes `OPENAI_API_KEY` |
| REQ-240: Main translation service | `/src/lib/translation-service/translation-service.ts` | Consumes `TRANSLATION_PROVIDER` |

### Blocks (Require This First)

| Dependent Task | Purpose |
|----------------|---------|
| REQ-242: Manual translation testing API | Needs env vars for API configuration |
| Phase 4: Background job processing | Uses `TRANSLATION_JOB_BATCH_SIZE` |
| Deployment to any environment | Requires env var documentation |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Developer uses example values in production | Low | High | Placeholder values clearly invalid |
| Missing comments cause configuration errors | Low | Medium | Comprehensive comments for each variable |
| Variables not matching actual code | Medium | Medium | Verify against completed REQ-235-240 |

---

## Notes

- This task focuses solely on documentation in `.env.example`
- No code changes are required
- The translation service gracefully handles missing API keys by marking providers unavailable
- Railway environment variables should be configured separately in the Railway dashboard
- Local development requires copying `.env.example` to `.env.local` and filling in real values

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.7*
*Detailed breakdown created: 2026-01-18 13:45 UTC*
