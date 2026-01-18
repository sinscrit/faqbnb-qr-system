# REQ-241: Add Environment Variables for Translation Service - Implementation Overview

**Document Created:** 2026-01-18 12:30 UTC
**Last Modified:** 2026-01-18 12:30 UTC
**Request Reference:** REQ-241 (Translation Service Environment Configuration)
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.7

---

## Summary

Update the `.env.example` file to document the environment variables required for the translation service. This includes the translation provider selection variable (`TRANSLATION_PROVIDER`), the Anthropic API key for Claude translations (`ANTHROPIC_API_KEY`), and the OpenAI API key for fallback translations (`OPENAI_API_KEY`). Each variable must include descriptive comments explaining its purpose and valid values.

---

## Technical Context

### Existing Patterns in Codebase

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Environment Variables | `/.env.example:1-8` | Existing structure with grouped variables and comments |
| Supabase Configuration | `/.env.example:1-4` | Example of required credentials documentation |
| QR Domain Override | `/.env.example:6-7` | Example of optional configuration with description |

### Current `.env.example` Content

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# QR Code Domain Configuration
NEXT_PUBLIC_QR_DOMAIN_OVERRIDE=https://your-production-domain.com
```

### Dependencies

#### Prerequisites (Must Exist First)

| Task | File | Purpose |
|------|------|---------|
| REQ-235 (Task 3.1) | `/src/lib/translation-service/translation-service.types.ts` | Type definitions including `TranslationProvider` |
| REQ-236 (Task 3.2) | `/src/lib/translation-service/providers/claude-provider.ts` | Claude provider that reads `ANTHROPIC_API_KEY` |
| REQ-237 (Task 3.3) | `/src/lib/translation-service/providers/openai-provider.ts` | OpenAI provider that reads `OPENAI_API_KEY` |
| REQ-240 (Task 3.6) | `/src/lib/translation-service/translation-service.ts` | Main service that reads `TRANSLATION_PROVIDER` |

#### No New External Dependencies Required

This task only modifies documentation files.

### Target File Location

**File:** `/.env.example`

---

## Implementation Tasks

### Task 3.7.1: Add Translation Service Configuration Section

Update `.env.example` to include the translation service environment variables with clear documentation.

**File:** `/.env.example` (modify)

**Changes:**

Add a new section after the existing configuration with the following content:

```bash
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

### Task 3.7.2: Verify Environment Variable Usage

Document which files consume these environment variables to help developers understand the configuration flow.

**Environment Variable Usage Map:**

| Variable | Used By | Location |
|----------|---------|----------|
| `TRANSLATION_PROVIDER` | `TranslationService` | `/src/lib/translation-service/translation-service.ts` |
| `ANTHROPIC_API_KEY` | `ClaudeTranslationProvider` | `/src/lib/translation-service/providers/claude-provider.ts` |
| `OPENAI_API_KEY` | `OpenAITranslationProvider` | `/src/lib/translation-service/providers/openai-provider.ts` |
| `TRANSLATION_MAX_RETRIES` | `TranslationService` | `/src/lib/translation-service/translation-service.ts` |
| `TRANSLATION_RATE_LIMIT_PER_MINUTE` | `RateLimiter` | `/src/lib/translation-service/utils/rate-limiter.ts` |
| `TRANSLATION_JOB_BATCH_SIZE` | `TranslationJobProcessor` | `/src/lib/job-queue/translation-jobs.ts` (Phase 4) |

---

## Authorized Files and Functions for Modification

### Files to Modify

| File Path | Section | Modification |
|-----------|---------|--------------|
| `/.env.example` | End of file | Add Translation Service Configuration section |

### Files NOT to Modify

- `/.env.local` - Contains actual secrets, should never be committed
- `/.env.railway` - Railway-specific configuration, managed separately
- Any source code files - This task only documents configuration

---

## Implementation Order

1. **Add translation service section** (Task 3.7.1) - Add environment variables to `.env.example`
2. **Verify documentation** (Task 3.7.2) - Ensure usage documentation is accurate

---

## Acceptance Criteria Verification

| Criteria (from REQ-241) | Implementation Verification |
|-------------------------|----------------------------|
| Configuration template includes translation provider selection variable | `TRANSLATION_PROVIDER=claude` with valid options documented |
| Configuration template includes Anthropic API credential variable | `ANTHROPIC_API_KEY=sk-ant-xxx` with link to console |
| Configuration template includes OpenAI API credential variable | `OPENAI_API_KEY=sk-xxx` with link to platform |
| All new variables include descriptive comments explaining their purpose and valid values | Each variable preceded by comment explaining purpose, valid values, and defaults |

---

## Dependencies

### Depends On (Must Be Completed First)

- **REQ-235** (Task 3.1): Translation service types (defines `TranslationProvider` type)
- **REQ-236** (Task 3.2): Claude provider (consumes `ANTHROPIC_API_KEY`)
- **REQ-237** (Task 3.3): OpenAI provider (consumes `OPENAI_API_KEY`)
- **REQ-240** (Task 3.6): Main translation service (consumes `TRANSLATION_PROVIDER`)

### Blocks (Require This First)

- **Task 3.8**: API endpoint for manual translation testing (needs env vars configured)
- **Phase 4**: Background job processing (uses `TRANSLATION_JOB_BATCH_SIZE`)
- **Deployment**: Any environment that runs translation features

---

## Expected Final `.env.example` Content

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

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Developers forget to update `.env.local` | Medium | Low | Clear comments explaining each variable's purpose |
| API keys committed accidentally | Low | High | `.env.local` already in `.gitignore`; example values are clearly fake |
| Incorrect provider name entered | Low | Low | Service defaults to 'claude' if invalid; validation in code |
| Missing API key for configured provider | Medium | Medium | Providers check availability; service falls back to alternative |

---

## Estimated Effort

**Complexity:** XS (Extra Small)
**Estimated Time:** 15-20 minutes

| Sub-task | Time |
|----------|------|
| Add environment variables section | 10 min |
| Add comments and documentation | 5 min |
| Review and verify | 5 min |

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Variable naming | `TRANSLATION_PROVIDER` | Clear, descriptive, follows existing conventions |
| Default provider | claude | Better context understanding for domain-specific translations |
| Optional variables commented out | Yes | Shows available options without requiring configuration |
| Include tuning section | Yes | Provides visibility into configurable behavior |
| Links to API console | Yes | Helps developers quickly obtain credentials |

---

## Testing Strategy

### Manual Verification

1. Copy `.env.example` to `.env.local`
2. Fill in actual API keys
3. Run application
4. Verify translation service initializes without errors
5. Verify Claude provider is active when `TRANSLATION_PROVIDER=claude`
6. Verify OpenAI provider is active when `TRANSLATION_PROVIDER=openai`

### Configuration Validation

```bash
# Verify environment variables are read
echo "Testing translation service configuration..."
node -e "
  console.log('TRANSLATION_PROVIDER:', process.env.TRANSLATION_PROVIDER || 'claude (default)');
  console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET');
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
"
```

---

## Environment Variables Reference

| Variable | Required | Default | Type | Description |
|----------|----------|---------|------|-------------|
| `TRANSLATION_PROVIDER` | No | `claude` | `'claude' \| 'openai'` | Primary translation provider selection |
| `ANTHROPIC_API_KEY` | Conditional | - | `string` | Anthropic API key (required if using Claude) |
| `OPENAI_API_KEY` | Conditional | - | `string` | OpenAI API key (required if using OpenAI or fallback) |
| `TRANSLATION_MAX_RETRIES` | No | `3` | `number` | Maximum retry attempts for failed requests |
| `TRANSLATION_RATE_LIMIT_PER_MINUTE` | No | `60` | `number` | Rate limit per provider per minute |
| `TRANSLATION_JOB_BATCH_SIZE` | No | `10` | `number` | Batch size for background job processing |

---

## Security Considerations

1. **API keys are secrets** - Never commit actual API keys to version control
2. **`.env.example` contains placeholders only** - Values like `sk-ant-xxx` and `sk-xxx` are clearly fake
3. **`.gitignore` protection** - `.env.local` and `.env` are already in `.gitignore`
4. **Railway secrets** - Production credentials should be configured in Railway dashboard, not in files
5. **Minimal exposure** - API keys are only exposed to server-side code, not client-side

---

## Notes

- The translation service gracefully handles missing API keys by marking providers as unavailable
- When the primary provider's key is missing, the service automatically uses the fallback provider
- Optional tuning variables are commented out to show available options without requiring configuration
- The `NEXT_PUBLIC_` prefix is intentionally NOT used for these variables as they contain secrets

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.7*
