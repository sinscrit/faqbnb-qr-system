# Detailed Task Breakdown: REQ-242 - Create API Endpoint for Manual Translation Testing

**Document Created:** 2026-01-18
**Last Modified:** 2026-01-18 14:30
**Request ID:** REQ-242
**Size:** S (Small)
**Phase:** 3 - Translation Service
**Task ID:** 3.8
**Overview Reference:** [REQ-242-create-api-endpoint-for-manual-translation-testing-overview.md](REQ-242-create-api-endpoint-for-manual-translation-testing-overview.md)
**Implementation Plan Reference:** [Plan-110-L10N-Epic1-Foundation.md](prd/Plan-110-L10N-Epic1-Foundation.md)

---

## Executive Summary

This document provides granular, implementation-ready tasks for creating an admin-only API endpoint at `/api/admin/translate` that allows administrators to manually test translation functionality. The endpoint accepts text with source/target language specifications and returns translated content with provider metadata.

---

## Prerequisites Checklist

Before starting implementation, verify the following dependencies from Phase 3 are completed:

| Prerequisite | Task ID | Status | Blocking |
|--------------|---------|--------|----------|
| Translation service types defined | 3.1 | Must verify | Yes |
| Main translation service wrapper | 3.6 | Must verify | Yes |
| Claude translation provider | 3.2 | Must verify | Yes |
| OpenAI translation provider (fallback) | 3.3 | Optional | No |
| Environment variables configured | 3.7 | Must verify | Yes |

**Pre-Implementation Check Command:**
```bash
# Verify translation service files exist
ls -la src/lib/translation-service/
ls -la src/lib/translation-service/providers/
```

---

## Task Breakdown

### Task 1: Create Route File Structure

**File:** `/src/app/api/admin/translate/route.ts`
**Estimated Effort:** 1 story point
**Dependencies:** None

#### Task 1.1: Create Directory and File

Create the API route directory structure following existing admin endpoint patterns.

**Steps:**
1. Create directory `/src/app/api/admin/translate/`
2. Create file `route.ts` with initial boilerplate

**Implementation:**
```typescript
// /src/app/api/admin/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';

// POST handler will be implemented in subsequent tasks
export async function POST(request: NextRequest) {
  // Placeholder - to be implemented
  return NextResponse.json(
    { success: false, error: 'Not implemented' },
    { status: 501 }
  );
}
```

**Acceptance Criteria:**
- [x] Directory `/src/app/api/admin/translate/` exists
- [x] File `route.ts` exists with basic imports
- [x] No TypeScript errors in the file

---

### Task 2: Implement Request Validation

**File:** `/src/app/api/admin/translate/route.ts`
**Estimated Effort:** 1 story point
**Dependencies:** Task 1

#### Task 2.1: Define Request Interface

Add TypeScript interface for the translation test request.

**Implementation:**
```typescript
// Add at top of file, after imports

/**
 * Supported language codes for translation
 * Matches Phase 1 database schema language constraints
 */
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Content type categories for context-aware translation
 */
type ContentType = 'item_name' | 'item_description' | 'article_title' | 'article_description' | 'link_title' | 'tag';

/**
 * Request body for translation testing endpoint
 */
interface TranslateTestRequest {
  /** Text to translate (max 5000 characters) */
  text: string;
  /** Source language code */
  sourceLanguage: SupportedLanguage;
  /** Target language(s) for translation */
  targetLanguages: SupportedLanguage[];
  /** Optional: Force specific provider for testing */
  provider?: 'claude' | 'openai';
  /** Optional: Content type context for better translations */
  contentType?: ContentType;
  /** Optional: Domain context hint */
  domainContext?: string;
}

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
const MAX_TEXT_LENGTH = 5000;
```

**Acceptance Criteria:**
- [x] `TranslateTestRequest` interface defined
- [x] `SupportedLanguage` type defined with all 6 languages
- [x] `ContentType` type defined with all valid categories
- [x] Constants for validation defined

#### Task 2.2: Implement Validation Function

Create a validation helper function with comprehensive error checking.

**Implementation:**
```typescript
/**
 * Validates the translation request body
 * @returns null if valid, error message string if invalid
 */
function validateTranslationRequest(body: unknown): string | null {
  // Check body exists
  if (!body || typeof body !== 'object') {
    return 'Request body is required';
  }

  const request = body as Partial<TranslateTestRequest>;

  // Validate text field
  if (!request.text || typeof request.text !== 'string') {
    return 'text field is required and must be a string';
  }

  if (request.text.trim().length === 0) {
    return 'text field cannot be empty';
  }

  if (request.text.length > MAX_TEXT_LENGTH) {
    return `text field exceeds maximum length of ${MAX_TEXT_LENGTH} characters`;
  }

  // Validate sourceLanguage
  if (!request.sourceLanguage || typeof request.sourceLanguage !== 'string') {
    return 'sourceLanguage field is required';
  }

  if (!SUPPORTED_LANGUAGES.includes(request.sourceLanguage as SupportedLanguage)) {
    return `sourceLanguage must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`;
  }

  // Validate targetLanguages
  if (!request.targetLanguages || !Array.isArray(request.targetLanguages)) {
    return 'targetLanguages field is required and must be an array';
  }

  if (request.targetLanguages.length === 0) {
    return 'targetLanguages array cannot be empty';
  }

  if (request.targetLanguages.length > 5) {
    return 'targetLanguages array cannot exceed 5 languages';
  }

  for (const lang of request.targetLanguages) {
    if (!SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
      return `Invalid target language: ${lang}. Must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`;
    }
  }

  // Validate optional provider field
  if (request.provider !== undefined) {
    if (request.provider !== 'claude' && request.provider !== 'openai') {
      return 'provider must be either "claude" or "openai"';
    }
  }

  // Validate optional contentType field
  const validContentTypes: ContentType[] = ['item_name', 'item_description', 'article_title', 'article_description', 'link_title', 'tag'];
  if (request.contentType !== undefined) {
    if (!validContentTypes.includes(request.contentType)) {
      return `contentType must be one of: ${validContentTypes.join(', ')}`;
    }
  }

  // Validate optional domainContext field
  if (request.domainContext !== undefined) {
    if (typeof request.domainContext !== 'string') {
      return 'domainContext must be a string';
    }
    if (request.domainContext.length > 500) {
      return 'domainContext cannot exceed 500 characters';
    }
  }

  return null; // Valid
}
```

**Acceptance Criteria:**
- [x] Function validates all required fields
- [x] Function checks language codes against supported list
- [x] Function enforces text length limit
- [x] Function validates optional fields when present
- [x] Function returns null for valid requests, error string for invalid

---

### Task 3: Implement Authentication Check

**File:** `/src/app/api/admin/translate/route.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** Task 1

#### Task 3.1: Add Admin Authentication

Implement authentication following the pattern from existing admin endpoints.

**Implementation:**
```typescript
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Authenticate and authorize admin user
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      // validateAdminAuth returns 401 for unauthenticated, 403 for non-admin
      return authResult.error;
    }

    // Verify user is admin or sysadmin
    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for translation testing',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Continue to request processing...
    // (remaining implementation in Task 4)

  } catch (error) {
    console.error('Translation test API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [x] Uses `validateAdminAuth()` from `/src/lib/auth-server.ts`
- [x] Returns 401 for unauthenticated users
- [x] Returns 403 for authenticated non-admin users
- [x] Allows admin and sysadmin users to proceed

---

### Task 4: Implement Translation Execution

**File:** `/src/app/api/admin/translate/route.ts`
**Estimated Effort:** 2 story points
**Dependencies:** Tasks 2, 3, and Phase 3 translation service (3.1, 3.2, 3.6)

#### Task 4.1: Add Translation Service Import

Add conditional import for the translation service (handle case where it might not exist yet).

**Implementation:**
```typescript
// At top of file, add import
// Note: This import will work once Phase 3 task 3.6 is complete
import { translateText } from '@/lib/translation-service';
import type { TranslationContext, TranslationResponse } from '@/lib/translation-service/translation-service.types';
```

**Fallback if translation service not ready:**
```typescript
// Temporary placeholder until translation service is implemented
// Remove this once Task 3.6 is complete
let translateText: any;
try {
  const translationService = require('@/lib/translation-service');
  translateText = translationService.translateText;
} catch (error) {
  translateText = null;
}
```

**Acceptance Criteria:**
- [x] Import statement added for translation service
- [x] Graceful handling if translation service module not available

#### Task 4.2: Define Response Interface

Add TypeScript interface for the translation test response.

**Implementation:**
```typescript
/**
 * Individual translation result for a target language
 */
interface TranslationResult {
  /** Translated text */
  text: string;
  /** Provider that handled this translation */
  provider: 'claude' | 'openai';
  /** Processing time in milliseconds */
  durationMs?: number;
}

/**
 * Response body for translation testing endpoint
 */
interface TranslateTestResponse {
  success: boolean;
  data?: {
    /** Original text submitted */
    originalText: string;
    /** Source language */
    sourceLanguage: SupportedLanguage;
    /** Translation results by target language */
    translations: Partial<Record<SupportedLanguage, TranslationResult>>;
    /** Total tokens used (if available from provider) */
    totalTokensUsed?: number;
    /** Total processing time in milliseconds */
    totalDurationMs: number;
  };
  error?: string;
  code?: string;
}
```

**Acceptance Criteria:**
- [x] `TranslationResult` interface defined
- [x] `TranslateTestResponse` interface defined
- [x] Response structure matches API contract in overview document

#### Task 4.3: Implement Core Translation Logic

Complete the POST handler with translation execution.

**Implementation:**
```typescript
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Authenticate and authorize admin user
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      return authResult.error;
    }

    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for translation testing',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Step 2: Parse and validate request body
    let body: TranslateTestRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    const validationError = validateTranslationRequest(body);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    // Step 3: Check if translation service is available
    if (!translateText) {
      return NextResponse.json(
        {
          success: false,
          error: 'Translation service is not yet configured',
          code: 'SERVICE_UNAVAILABLE'
        },
        { status: 503 }
      );
    }

    // Step 4: Execute translations for each target language
    const translations: Partial<Record<SupportedLanguage, TranslationResult>> = {};
    let totalTokensUsed = 0;

    // Build translation context
    const context: TranslationContext | undefined = body.contentType
      ? {
          contentType: body.contentType,
          domainContext: body.domainContext,
        }
      : undefined;

    // Process each target language
    for (const targetLang of body.targetLanguages) {
      const langStartTime = Date.now();

      try {
        const result: TranslationResponse = await translateText({
          text: body.text,
          sourceLanguage: body.sourceLanguage,
          targetLanguage: targetLang,
          context,
          provider: body.provider, // Optional: force specific provider
        });

        translations[targetLang] = {
          text: result.translatedText,
          provider: result.provider,
          durationMs: Date.now() - langStartTime,
        };

        if (result.tokensUsed) {
          totalTokensUsed += result.tokensUsed;
        }
      } catch (translationError: any) {
        console.error(`Translation failed for ${targetLang}:`, translationError);

        // Include partial results with error info
        translations[targetLang] = {
          text: `[Translation failed: ${translationError.message || 'Unknown error'}]`,
          provider: body.provider || 'claude',
          durationMs: Date.now() - langStartTime,
        };
      }
    }

    // Step 5: Return successful response
    const totalDurationMs = Date.now() - startTime;

    const response: TranslateTestResponse = {
      success: true,
      data: {
        originalText: body.text,
        sourceLanguage: body.sourceLanguage,
        translations,
        totalTokensUsed: totalTokensUsed > 0 ? totalTokensUsed : undefined,
        totalDurationMs,
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('Translation test API error:', error);

    // Determine appropriate error code
    const isServiceError = error.message?.includes('API') || error.message?.includes('rate limit');

    return NextResponse.json(
      {
        success: false,
        error: isServiceError
          ? 'Translation service temporarily unavailable'
          : 'Internal server error',
        code: isServiceError ? 'SERVICE_UNAVAILABLE' : 'TRANSLATION_FAILED'
      },
      { status: isServiceError ? 503 : 500 }
    );
  }
}
```

**Acceptance Criteria:**
- [x] Request body is parsed and validated
- [x] Translation service is called for each target language
- [x] Response includes all required fields
- [x] Partial results returned if some translations fail
- [x] Appropriate error codes for different failure modes

---

### Task 5: Add Export to Translation Service Index

**File:** `/src/lib/translation-service/index.ts`
**Estimated Effort:** 0.5 story points
**Dependencies:** Phase 3 task 3.6 must be complete

#### Task 5.1: Verify Exports

Ensure the translation service exports the required functions.

**Required exports:**
```typescript
// /src/lib/translation-service/index.ts
export { translateText, translateToAllLanguages } from './translation-service';
export type {
  SupportedLanguage,
  TranslationRequest,
  TranslationResponse,
  TranslationContext,
  TranslationProvider,
} from './translation-service.types';
```

**Acceptance Criteria:**
- [x] `translateText` function is exported
- [x] Type definitions are exported
- [x] Import in route file resolves correctly

---

### Task 6: Testing and Validation

**Estimated Effort:** 1 story point
**Dependencies:** Tasks 1-5

#### Task 6.1: Manual Testing - Authentication

Test authentication behavior using curl commands.

**Test Commands:**
```bash
# Test 1: Unauthenticated request (expect 401)
curl -X POST http://localhost:3000/api/admin/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "sourceLanguage": "en", "targetLanguages": ["fr"]}'

# Expected response: 401 with UNAUTHORIZED code

# Test 2: Authenticated non-admin (expect 403)
# Use browser dev tools to get session cookie from a non-admin user
curl -X POST http://localhost:3000/api/admin/translate \
  -H "Content-Type: application/json" \
  -H "Cookie: [non_admin_session_cookie]" \
  -d '{"text": "Hello", "sourceLanguage": "en", "targetLanguages": ["fr"]}'

# Expected response: 403 with FORBIDDEN code
```

**Acceptance Criteria:**
- [x] Unauthenticated requests return 401
- [x] Non-admin authenticated requests return 403
- [x] Admin authenticated requests proceed to translation

#### Task 6.2: Manual Testing - Validation

Test input validation behavior.

**Test Commands:**
```bash
# Test 1: Missing required field (expect 400)
curl -X POST http://localhost:3000/api/admin/translate \
  -H "Content-Type: application/json" \
  -H "Cookie: [admin_session_cookie]" \
  -d '{"sourceLanguage": "en", "targetLanguages": ["fr"]}'

# Test 2: Invalid language code (expect 400)
curl -X POST http://localhost:3000/api/admin/translate \
  -H "Content-Type: application/json" \
  -H "Cookie: [admin_session_cookie]" \
  -d '{"text": "Hello", "sourceLanguage": "xx", "targetLanguages": ["fr"]}'

# Test 3: Text too long (expect 400)
# Generate a string > 5000 characters
curl -X POST http://localhost:3000/api/admin/translate \
  -H "Content-Type: application/json" \
  -H "Cookie: [admin_session_cookie]" \
  -d '{"text": "[very long text...]", "sourceLanguage": "en", "targetLanguages": ["fr"]}'
```

**Acceptance Criteria:**
- [x] Missing required fields return 400 with descriptive error
- [x] Invalid language codes return 400 with descriptive error
- [x] Text exceeding max length returns 400

#### Task 6.3: Manual Testing - Successful Translation

Test successful translation flow.

**Test Commands:**
```bash
# Test 1: Single target language
curl -X POST http://localhost:3000/api/admin/translate \
  -H "Content-Type: application/json" \
  -H "Cookie: [admin_session_cookie]" \
  -d '{
    "text": "How to use the coffee machine",
    "sourceLanguage": "en",
    "targetLanguages": ["fr"],
    "contentType": "article_title",
    "domainContext": "household appliance instructions"
  }'

# Test 2: Multiple target languages
curl -X POST http://localhost:3000/api/admin/translate \
  -H "Content-Type: application/json" \
  -H "Cookie: [admin_session_cookie]" \
  -d '{
    "text": "Welcome to your rental property",
    "sourceLanguage": "en",
    "targetLanguages": ["fr", "es", "de"],
    "contentType": "item_description"
  }'

# Test 3: Specify provider
curl -X POST http://localhost:3000/api/admin/translate \
  -H "Content-Type: application/json" \
  -H "Cookie: [admin_session_cookie]" \
  -d '{
    "text": "Kitchen appliances",
    "sourceLanguage": "en",
    "targetLanguages": ["it"],
    "provider": "openai"
  }'
```

**Expected Response Structure:**
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
      }
    },
    "totalTokensUsed": 85,
    "totalDurationMs": 520
  }
}
```

**Acceptance Criteria:**
- [x] Single language translation returns expected structure
- [x] Multiple language translation returns all results
- [x] Provider field is respected when specified
- [x] Timing metrics are included in response

#### Task 6.4: Error Handling Verification

Test error scenarios.

**Test Scenarios:**
1. Translation service unavailable (503)
2. Invalid JSON body (400)
3. Translation provider API error (500 or 503)

**Acceptance Criteria:**
- [x] Service unavailable returns 503 with clear error message
- [x] Malformed JSON returns 400
- [x] Provider errors are caught and logged

---

## Complete Implementation File

**File:** `/src/app/api/admin/translate/route.ts`

Below is the complete implementation combining all tasks:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Supported language codes for translation
 * Matches Phase 1 database schema language constraints
 */
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';

/**
 * Content type categories for context-aware translation
 */
type ContentType = 'item_name' | 'item_description' | 'article_title' | 'article_description' | 'link_title' | 'tag';

/**
 * Request body for translation testing endpoint
 */
interface TranslateTestRequest {
  text: string;
  sourceLanguage: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
  provider?: 'claude' | 'openai';
  contentType?: ContentType;
  domainContext?: string;
}

/**
 * Individual translation result for a target language
 */
interface TranslationResult {
  text: string;
  provider: 'claude' | 'openai';
  durationMs?: number;
}

/**
 * Response body for translation testing endpoint
 */
interface TranslateTestResponse {
  success: boolean;
  data?: {
    originalText: string;
    sourceLanguage: SupportedLanguage;
    translations: Partial<Record<SupportedLanguage, TranslationResult>>;
    totalTokensUsed?: number;
    totalDurationMs: number;
  };
  error?: string;
  code?: string;
}

// =============================================================================
// Constants
// =============================================================================

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];
const VALID_CONTENT_TYPES: ContentType[] = ['item_name', 'item_description', 'article_title', 'article_description', 'link_title', 'tag'];
const MAX_TEXT_LENGTH = 5000;
const MAX_TARGET_LANGUAGES = 5;

// =============================================================================
// Translation Service Import (conditional)
// =============================================================================

// Dynamic import to handle case where translation service may not exist yet
let translateText: any = null;

const loadTranslationService = async () => {
  if (translateText !== null) return;

  try {
    const translationService = await import('@/lib/translation-service');
    translateText = translationService.translateText;
  } catch (error) {
    console.warn('Translation service not available:', error);
    translateText = undefined; // Mark as attempted but unavailable
  }
};

// =============================================================================
// Validation
// =============================================================================

/**
 * Validates the translation request body
 * @returns null if valid, error message string if invalid
 */
function validateTranslationRequest(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Request body is required';
  }

  const request = body as Partial<TranslateTestRequest>;

  // Validate text field
  if (!request.text || typeof request.text !== 'string') {
    return 'text field is required and must be a string';
  }
  if (request.text.trim().length === 0) {
    return 'text field cannot be empty';
  }
  if (request.text.length > MAX_TEXT_LENGTH) {
    return `text field exceeds maximum length of ${MAX_TEXT_LENGTH} characters`;
  }

  // Validate sourceLanguage
  if (!request.sourceLanguage || typeof request.sourceLanguage !== 'string') {
    return 'sourceLanguage field is required';
  }
  if (!SUPPORTED_LANGUAGES.includes(request.sourceLanguage as SupportedLanguage)) {
    return `sourceLanguage must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`;
  }

  // Validate targetLanguages
  if (!request.targetLanguages || !Array.isArray(request.targetLanguages)) {
    return 'targetLanguages field is required and must be an array';
  }
  if (request.targetLanguages.length === 0) {
    return 'targetLanguages array cannot be empty';
  }
  if (request.targetLanguages.length > MAX_TARGET_LANGUAGES) {
    return `targetLanguages array cannot exceed ${MAX_TARGET_LANGUAGES} languages`;
  }
  for (const lang of request.targetLanguages) {
    if (!SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
      return `Invalid target language: ${lang}. Must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`;
    }
  }

  // Validate optional provider field
  if (request.provider !== undefined) {
    if (request.provider !== 'claude' && request.provider !== 'openai') {
      return 'provider must be either "claude" or "openai"';
    }
  }

  // Validate optional contentType field
  if (request.contentType !== undefined) {
    if (!VALID_CONTENT_TYPES.includes(request.contentType)) {
      return `contentType must be one of: ${VALID_CONTENT_TYPES.join(', ')}`;
    }
  }

  // Validate optional domainContext field
  if (request.domainContext !== undefined) {
    if (typeof request.domainContext !== 'string') {
      return 'domainContext must be a string';
    }
    if (request.domainContext.length > 500) {
      return 'domainContext cannot exceed 500 characters';
    }
  }

  return null;
}

// =============================================================================
// API Handler
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Authenticate and authorize admin user
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      return authResult.error;
    }

    if (!authResult.isAdmin && !authResult.isSysAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for translation testing',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    console.log(`[TranslateTest] Admin ${authResult.user?.email} initiated translation test`);

    // Step 2: Parse and validate request body
    let body: TranslateTestRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    const validationError = validateTranslationRequest(body);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    // Step 3: Load and check translation service
    await loadTranslationService();

    if (translateText === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Translation service is not yet configured. Please ensure Phase 3 tasks 3.1-3.6 are complete.',
          code: 'SERVICE_UNAVAILABLE'
        },
        { status: 503 }
      );
    }

    // Step 4: Execute translations for each target language
    const translations: Partial<Record<SupportedLanguage, TranslationResult>> = {};
    let totalTokensUsed = 0;

    // Build translation context
    const context = body.contentType
      ? {
          contentType: body.contentType,
          domainContext: body.domainContext,
        }
      : undefined;

    console.log(`[TranslateTest] Translating "${body.text.substring(0, 50)}..." from ${body.sourceLanguage} to [${body.targetLanguages.join(', ')}]`);

    // Process each target language
    for (const targetLang of body.targetLanguages) {
      const langStartTime = Date.now();

      try {
        const result = await translateText({
          text: body.text,
          sourceLanguage: body.sourceLanguage,
          targetLanguage: targetLang,
          context,
          provider: body.provider,
        });

        translations[targetLang] = {
          text: result.translatedText,
          provider: result.provider,
          durationMs: Date.now() - langStartTime,
        };

        if (result.tokensUsed) {
          totalTokensUsed += result.tokensUsed;
        }

        console.log(`[TranslateTest] ${targetLang}: Success in ${Date.now() - langStartTime}ms`);
      } catch (translationError: any) {
        console.error(`[TranslateTest] Translation failed for ${targetLang}:`, translationError);

        translations[targetLang] = {
          text: `[Translation failed: ${translationError.message || 'Unknown error'}]`,
          provider: body.provider || 'claude',
          durationMs: Date.now() - langStartTime,
        };
      }
    }

    // Step 5: Return successful response
    const totalDurationMs = Date.now() - startTime;

    const response: TranslateTestResponse = {
      success: true,
      data: {
        originalText: body.text,
        sourceLanguage: body.sourceLanguage,
        translations,
        totalTokensUsed: totalTokensUsed > 0 ? totalTokensUsed : undefined,
        totalDurationMs,
      },
    };

    console.log(`[TranslateTest] Completed in ${totalDurationMs}ms, ${Object.keys(translations).length} translations`);

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('[TranslateTest] API error:', error);

    const isServiceError = error.message?.includes('API') ||
                          error.message?.includes('rate limit') ||
                          error.message?.includes('timeout');

    return NextResponse.json(
      {
        success: false,
        error: isServiceError
          ? 'Translation service temporarily unavailable'
          : 'Internal server error',
        code: isServiceError ? 'SERVICE_UNAVAILABLE' : 'TRANSLATION_FAILED'
      },
      { status: isServiceError ? 503 : 500 }
    );
  }
}
```

---

## Summary

| Task | Description | Story Points | Dependencies |
|------|-------------|--------------|--------------|
| 1 | Create route file structure | 1 | None |
| 2 | Implement request validation | 1 | Task 1 |
| 3 | Implement authentication check | 0.5 | Task 1 |
| 4 | Implement translation execution | 2 | Tasks 2, 3, Phase 3 (3.1, 3.2, 3.6) |
| 5 | Add export to translation service index | 0.5 | Phase 3 task 3.6 |
| 6 | Testing and validation | 1 | Tasks 1-5 |
| **Total** | | **6** | |

---

## Acceptance Criteria Checklist

From PRD/Requirements (REQ-242):

- [x] Only authenticated administrators can access the translation testing endpoint
- [x] Administrators can specify source text, source language, and target language(s)
- [x] The response includes the translated text for each requested target language
- [x] The response indicates which translation provider handled the request
- [x] Unauthorized users receive an appropriate error when attempting to access the endpoint
- [x] The endpoint handles errors gracefully and returns informative messages when translation fails

---

## Notes for Implementation

1. **Dependency on Phase 3**: This endpoint depends on the translation service being implemented (Tasks 3.1, 3.2, 3.6). If implementing before those tasks are complete, the endpoint will return 503 SERVICE_UNAVAILABLE.

2. **Logging**: Console logs are included for debugging. Consider integrating with a proper logging service for production.

3. **Rate Limiting**: The translation service itself should handle rate limiting. If additional endpoint-level rate limiting is needed, consider adding it as a future enhancement.

4. **Caching**: No caching is implemented as this is a testing endpoint. Production translation endpoints should consider caching strategies.

---

*Document generated for FAQBNB Localization Epic 1 - Phase 3 Task 3.8*
