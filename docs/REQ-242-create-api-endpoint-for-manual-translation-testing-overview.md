# Implementation Overview: REQ-242 - Create API Endpoint for Manual Translation Testing

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18
**Request ID:** REQ-242
**Size:** S (Small)
**Phase:** 3 - Translation Service
**Task ID:** 3.8
**Implementation Plan Reference:** [Plan-110-L10N-Epic1-Foundation.md](prd/Plan-110-L10N-Epic1-Foundation.md)

---

## Summary

Create an admin-only API endpoint that allows administrators to manually test translation functionality by submitting text and receiving translations. This endpoint serves as a diagnostic tool for verifying translation service configuration, testing language pairs, and debugging translation quality issues.

---

## Current State

- No translation testing endpoint exists in the codebase
- The translation service module (`/src/lib/translation-service/`) is being built as part of Phase 3 tasks
- Admin API authentication patterns are well-established using `validateAdminAuth()` from `/src/lib/auth-server.ts`
- No translation-related API endpoints currently exist under `/src/app/api/admin/`

---

## Target State

An authenticated admin endpoint at `/api/admin/translate` that:
- Accepts POST requests with text, source language, and target language(s)
- Returns translated text with metadata (provider used, diagnostics)
- Enforces admin-only access using existing authentication patterns
- Provides informative error messages for debugging translation issues

---

## Technical Approach

### Architecture Decision

This endpoint follows the existing admin API route patterns observed in:
- `/src/app/api/admin/check-sysadmin/route.ts` - Authentication pattern
- `/src/app/api/admin/generate-pdf/route.ts` - POST handler with validation
- `/src/app/api/admin/items/route.ts` - Request body parsing and response structure

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| HTTP Method | POST | Sending translation request data in body |
| Authentication | `validateAdminAuth()` | Consistent with other admin endpoints |
| Authorization | Admin or SysAdmin required | Prevents unauthorized API usage/costs |
| Response Format | JSON with success/error pattern | Consistent with other admin endpoints |
| Provider Selection | Auto-detect from env or explicit | Supports testing specific providers |

---

## Integration Contract

### Request Interface

```typescript
// POST /api/admin/translate

interface TranslateTestRequest {
  /** Text to translate */
  text: string;
  /** Source language code (e.g., 'en', 'fr', 'es') */
  sourceLanguage: SupportedLanguage;
  /** Target language(s) - single or multiple */
  targetLanguages: SupportedLanguage[];
  /** Optional: Force specific provider for testing */
  provider?: 'claude' | 'openai';
  /** Optional: Content type context for better translations */
  contentType?: 'item_name' | 'item_description' | 'article_title' | 'article_description' | 'link_title' | 'tag';
  /** Optional: Domain context hint */
  domainContext?: string;
}

type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

### Response Interface

```typescript
interface TranslateTestResponse {
  success: boolean;
  data?: {
    /** Original text submitted */
    originalText: string;
    /** Source language */
    sourceLanguage: SupportedLanguage;
    /** Translation results by target language */
    translations: Record<SupportedLanguage, {
      text: string;
      provider: 'claude' | 'openai';
      /** Processing time in milliseconds */
      durationMs?: number;
    }>;
    /** Total tokens used (if available from provider) */
    totalTokensUsed?: number;
    /** Total processing time in milliseconds */
    totalDurationMs: number;
  };
  error?: string;
  code?: string;
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_REQUEST` | Missing required fields or invalid language codes |
| 401 | `UNAUTHORIZED` | User not authenticated |
| 403 | `FORBIDDEN` | User is not an admin |
| 500 | `TRANSLATION_FAILED` | Translation service error |
| 503 | `SERVICE_UNAVAILABLE` | Translation provider unavailable |

---

## Dependencies

### Required Prerequisites (from Phase 3)

This endpoint depends on the following tasks from the L10N Epic 1 implementation plan:

| Task | File | Status | Blocking |
|------|------|--------|----------|
| 3.1 | `/src/lib/translation-service/translation-service.types.ts` | Required | Yes |
| 3.6 | `/src/lib/translation-service/translation-service.ts` | Required | Yes |
| 3.2 | `/src/lib/translation-service/providers/claude-provider.ts` | Required | Yes |
| 3.3 | `/src/lib/translation-service/providers/openai-provider.ts` | Optional | No |
| 3.7 | `.env.example` (translation env vars) | Required | Yes |

### Existing Dependencies

| File | Purpose |
|------|---------|
| `/src/lib/auth-server.ts` | Admin authentication with `validateAdminAuth()` |
| `next/server` | `NextRequest`, `NextResponse` |

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/app/api/admin/translate/route.ts` | Admin translation testing API endpoint |

### Files to Modify (if needed)

| File Path | Modification |
|-----------|--------------|
| `/src/lib/translation-service/index.ts` | Ensure `translateText` and/or `translateToAllLanguages` are exported |
| `/src/lib/translation-service/translation-service.types.ts` | Add `TranslateTestRequest` and `TranslateTestResponse` types if not already present |

### Functions to Implement

| Function | Location | Description |
|----------|----------|-------------|
| `POST()` | `/src/app/api/admin/translate/route.ts` | Main endpoint handler |
| `validateTranslationRequest()` | `/src/app/api/admin/translate/route.ts` | Request validation helper |

### Existing Functions to Use

| Function | Location | Purpose |
|----------|----------|---------|
| `validateAdminAuth()` | `/src/lib/auth-server.ts` | Authenticate and authorize admin users |
| `translateText()` | `/src/lib/translation-service/translation-service.ts` | Single translation |
| `translateToAllLanguages()` | `/src/lib/translation-service/translation-service.ts` | Batch translation |

---

## Implementation Tasks

### Task 1: Create Translation Test Endpoint

**File:** `/src/app/api/admin/translate/route.ts`

```typescript
// Structure to implement:
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { translateText } from '@/lib/translation-service';
import type { SupportedLanguage, TranslationContext } from '@/lib/translation-service/translation-service.types';

export async function POST(request: NextRequest) {
  // 1. Authenticate admin user
  // 2. Parse and validate request body
  // 3. Execute translation(s)
  // 4. Return results with timing metrics
}
```

**Subtasks:**
1. Import dependencies and types
2. Implement admin authentication check
3. Implement request body parsing and validation
4. Implement translation execution with timing
5. Implement error handling
6. Return formatted response

### Task 2: Validate and Test Integration

- Verify endpoint returns 401 for unauthenticated requests
- Verify endpoint returns 403 for non-admin users
- Test single language translation
- Test multi-language batch translation
- Test error handling when translation service fails
- Test with different content types and domain contexts

---

## Acceptance Criteria Mapping

| PRD Criteria | Implementation |
|--------------|----------------|
| Only authenticated administrators can access the translation testing endpoint | `validateAdminAuth()` check returns 401/403 for unauthorized users |
| Administrators can specify source text, source language, and target language(s) | Request body accepts `text`, `sourceLanguage`, `targetLanguages` fields |
| The response includes the translated text for each requested target language | Response `translations` object contains results keyed by language code |
| The response indicates which translation provider handled the request | Each translation result includes `provider` field |
| Unauthorized users receive an appropriate error when attempting to access the endpoint | Returns 401/403 with clear error codes and messages |
| The endpoint handles errors gracefully and returns informative messages when translation fails | Try/catch with specific error codes (`TRANSLATION_FAILED`, `SERVICE_UNAVAILABLE`) |

---

## Testing Approach

### Manual Testing

```bash
# Test without authentication (expect 401)
curl -X POST http://localhost:3000/api/admin/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "sourceLanguage": "en", "targetLanguages": ["fr"]}'

# Test with authenticated admin (expect 200)
curl -X POST http://localhost:3000/api/admin/translate \
  -H "Content-Type: application/json" \
  -H "Cookie: [session_cookie]" \
  -d '{
    "text": "How to use the coffee machine",
    "sourceLanguage": "en",
    "targetLanguages": ["fr", "es", "de"],
    "contentType": "article_title",
    "domainContext": "household appliance instructions"
  }'
```

### Expected Response (Success)

```json
{
  "success": true,
  "data": {
    "originalText": "How to use the coffee machine",
    "sourceLanguage": "en",
    "translations": {
      "fr": {
        "text": "Comment utiliser la machine a cafe",
        "provider": "claude",
        "durationMs": 450
      },
      "es": {
        "text": "Como usar la cafetera",
        "provider": "claude",
        "durationMs": 380
      },
      "de": {
        "text": "Wie man die Kaffeemaschine benutzt",
        "provider": "claude",
        "durationMs": 420
      }
    },
    "totalTokensUsed": 245,
    "totalDurationMs": 1250
  }
}
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation service not ready (blocking deps) | Medium | High | Implement endpoint with graceful fallback when service unavailable |
| API key exposure in logs | Low | High | Never log API keys; use redacted logging |
| Rate limit abuse by admins | Low | Medium | Add internal rate limiting or daily quota logging |
| Large text submissions | Low | Medium | Implement text length validation (e.g., max 5000 chars) |

---

## Out of Scope

- UI for translation testing (future Epic)
- Persistent storage of test translations
- Translation cost tracking/billing
- Non-admin access to translation testing
- Real-time translation streaming

---

## References

- [Plan-110-L10N-Epic1-Foundation.md](prd/Plan-110-L10N-Epic1-Foundation.md) - Phase 3, Task 3.8
- [PRD_L10N_Epic1_Foundation.md](prd/PRD_L10N_Epic1_Foundation.md) - Epic requirements
- `/src/app/api/admin/generate-pdf/route.ts` - Reference POST handler pattern
- `/src/lib/auth-server.ts` - Admin authentication reference
