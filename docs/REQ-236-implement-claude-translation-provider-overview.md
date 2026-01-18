# REQ-236: Implement Claude Translation Provider - Implementation Overview

**Document Created:** 2026-01-18 22:15 UTC
**Last Modified:** 2026-01-18 22:15 UTC
**Request Reference:** REQ-236 (AI-Powered Translation Provider with Domain Context)
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.2

---

## Summary

Implement the Claude (Anthropic) translation provider that leverages AI to translate vacation rental content with domain-specific context. This provider will handle API authentication, rate limiting, and include domain context in prompts to ensure accurate translations of rental-specific terminology like "check-in", "amenities", "house rules", etc.

---

## Technical Context

### Existing Patterns in Codebase

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Service Provider Pattern | `/src/lib/email-service.ts:23-28` | Interface + Implementation + Factory pattern with mock/production variants |
| Error Handling | `/src/lib/error-utils.ts` | User-friendly error translation and classification |
| Type Definitions | `/src/lib/translation-service/translation-service.types.ts` | Pre-defined interfaces for `ITranslationProvider`, `TranslationRequest`, `TranslationResponse` |
| Configuration Pattern | `/src/lib/config.ts` | Environment variable handling with fallbacks |
| API Route Pattern | `/src/app/api/admin/items/route.ts` | Request validation, authentication, error handling |

### Dependencies

#### New Dependency Required

| Library | Version | Purpose | Installation |
|---------|---------|---------|--------------|
| `@anthropic-ai/sdk` | `^0.30.0` | Official Anthropic Claude SDK for TypeScript | `npm install @anthropic-ai/sdk` |

#### Existing Dependencies Used

- TypeScript types from `/src/lib/translation-service/translation-service.types.ts` (created in REQ-235)

### Target File Location

**File:** `/src/lib/translation-service/providers/claude-provider.ts`

This file currently contains a placeholder stub created in REQ-235:

```typescript
/**
 * Claude Translation Provider
 * Part of REQ-235: Translation Service Module Infrastructure
 * Implementation: Task 3.2
 *
 * @module translation-service/providers/claude
 */

// TODO: Implement in Task 3.2
// This file will contain the Anthropic Claude translation provider implementation
```

---

## Implementation Tasks

### Task 3.2.1: Install Anthropic SDK

Add the Anthropic SDK dependency to the project.

**Actions:**
1. Run `npm install @anthropic-ai/sdk`
2. Verify installation in `package.json`

**Dependencies affected:**
- `package.json` - Add `@anthropic-ai/sdk`
- `package-lock.json` - Updated automatically

### Task 3.2.2: Add Environment Variables

Add Anthropic API configuration to environment files.

**File:** `/.env.example` (modify)

**Add variables:**
```bash
# Translation Service Configuration
TRANSLATION_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-xxx

# Translation Service Tuning (optional)
TRANSLATION_RATE_LIMIT_PER_MINUTE=60
TRANSLATION_MAX_RETRIES=3
```

### Task 3.2.3: Implement Claude Provider Class

Implement the `ClaudeTranslationProvider` class that satisfies the `ITranslationProvider` interface.

**File:** `/src/lib/translation-service/providers/claude-provider.ts`

**Implementation Requirements:**

1. **API Authentication**
   - Read `ANTHROPIC_API_KEY` from environment variables
   - Validate API key presence on initialization
   - Handle authentication errors gracefully

2. **Rate Limiting Integration**
   - Track requests per minute using sliding window
   - Implement `getRateLimitStatus()` method
   - Respect Anthropic's rate limits (configurable via env)

3. **Domain Context Prompts**
   - Include vacation rental domain context in all translation requests
   - Support different content types (item names, descriptions, article titles, etc.)
   - Maintain consistent terminology translation

4. **Error Handling**
   - Handle API errors (rate limits, auth failures, timeouts)
   - Provide meaningful error messages
   - Support retry integration (will call rate-limiter from utils)

**Class Structure:**

```typescript
/**
 * Claude Translation Provider
 * REQ-236: AI-Powered Translation Provider with Domain Context
 *
 * @module translation-service/providers/claude
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  ITranslationProvider,
  TranslationProvider,
  TranslationRequest,
  TranslationResponse,
  BatchTranslationRequest,
  BatchTranslationResponse,
  RateLimitStatus,
  TranslationContext,
  SupportedLanguage,
} from '../translation-service.types';

// Constants
const CLAUDE_MODEL = 'claude-3-haiku-20240307'; // Cost-effective for translations
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_RATE_LIMIT_PER_MINUTE = 60;

// Language display names for prompts
const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  nl: 'Dutch',
  it: 'Italian',
};

/**
 * Domain context for vacation rental translations
 */
const DOMAIN_CONTEXT = `You are a professional translator specializing in vacation rental and property management content.
You understand terminology specific to short-term rentals, including:
- Check-in/check-out procedures
- Amenities and facilities
- House rules and policies
- Appliance and equipment instructions
- Safety information
- Guest communication

Translate naturally while maintaining the original meaning and tone. Use appropriate local terminology for the target language.`;

export class ClaudeTranslationProvider implements ITranslationProvider {
  readonly name: TranslationProvider = 'claude';

  private client: Anthropic | null = null;
  private rateLimitWindow: { timestamp: number; count: number }[] = [];
  private rateLimitPerMinute: number;
  private isConfigured: boolean = false;

  constructor() {
    this.rateLimitPerMinute = parseInt(
      process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE || String(DEFAULT_RATE_LIMIT_PER_MINUTE)
    );
    this.initializeClient();
  }

  /**
   * Initialize the Anthropic client
   */
  private initializeClient(): void {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY not configured - Claude translation provider unavailable');
      this.isConfigured = false;
      return;
    }

    try {
      this.client = new Anthropic({ apiKey });
      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to initialize Anthropic client:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Check if the provider is available
   */
  isAvailable(): boolean {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): RateLimitStatus {
    this.cleanupRateLimitWindow();

    const remaining = Math.max(0, this.rateLimitPerMinute - this.rateLimitWindow.length);
    const oldestRequest = this.rateLimitWindow[0];
    const resetInSeconds = oldestRequest
      ? Math.ceil((60000 - (Date.now() - oldestRequest.timestamp)) / 1000)
      : 0;

    return {
      remaining,
      limit: this.rateLimitPerMinute,
      resetInSeconds: Math.max(0, resetInSeconds),
      isLimited: remaining === 0,
    };
  }

  /**
   * Translate a single text
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    if (!this.isAvailable()) {
      throw new Error('Claude translation provider is not available. Check ANTHROPIC_API_KEY configuration.');
    }

    // Check rate limit
    const rateLimitStatus = this.getRateLimitStatus();
    if (rateLimitStatus.isLimited) {
      throw new Error(`Rate limit exceeded. Try again in ${rateLimitStatus.resetInSeconds} seconds.`);
    }

    // Record this request for rate limiting
    this.recordRequest();

    const startTime = Date.now();
    const prompt = this.buildTranslationPrompt(request);

    try {
      const response = await this.client!.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: request.context?.maxLength || DEFAULT_MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      });

      const translatedText = this.extractTranslation(response);
      const durationMs = Date.now() - startTime;

      return {
        translatedText,
        provider: 'claude',
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
        durationMs,
      };
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Translate text to multiple languages
   */
  async translateBatch(request: BatchTranslationRequest): Promise<BatchTranslationResponse> {
    if (!this.isAvailable()) {
      throw new Error('Claude translation provider is not available. Check ANTHROPIC_API_KEY configuration.');
    }

    const startTime = Date.now();
    const translations: Partial<Record<SupportedLanguage, string>> = {};
    const errors: Partial<Record<SupportedLanguage, string>> = {};
    let totalTokensUsed = 0;

    // Translate to each target language
    for (const targetLanguage of request.targetLanguages) {
      // Skip if target is same as source
      if (targetLanguage === request.sourceLanguage) {
        translations[targetLanguage] = request.text;
        continue;
      }

      try {
        const result = await this.translate({
          text: request.text,
          sourceLanguage: request.sourceLanguage,
          targetLanguage,
          context: request.context,
        });

        translations[targetLanguage] = result.translatedText;
        totalTokensUsed += result.tokensUsed || 0;
      } catch (error) {
        errors[targetLanguage] = error instanceof Error ? error.message : 'Translation failed';
      }
    }

    return {
      translations,
      provider: 'claude',
      totalTokensUsed,
      totalDurationMs: Date.now() - startTime,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  }

  /**
   * Build the translation prompt with domain context
   */
  private buildTranslationPrompt(request: TranslationRequest): string {
    const { text, sourceLanguage, targetLanguage, context } = request;

    const sourceLang = LANGUAGE_NAMES[sourceLanguage];
    const targetLang = LANGUAGE_NAMES[targetLanguage];

    let prompt = DOMAIN_CONTEXT + '\n\n';

    // Add content type context
    if (context?.contentType) {
      const contentTypeContext = this.getContentTypeContext(context.contentType);
      prompt += contentTypeContext + '\n\n';
    }

    // Add custom domain context if provided
    if (context?.domainContext) {
      prompt += `Additional context: ${context.domainContext}\n\n`;
    }

    // Add tone guidance
    if (context?.tone) {
      prompt += `Tone: ${context.tone}\n\n`;
    }

    // Add max length constraint
    if (context?.maxLength) {
      prompt += `Maximum length: ${context.maxLength} characters\n\n`;
    }

    // The actual translation request
    prompt += `Translate the following text from ${sourceLang} to ${targetLang}.\n`;
    prompt += `Return ONLY the translated text, with no explanations or additional text.\n\n`;
    prompt += `Text to translate:\n${text}`;

    return prompt;
  }

  /**
   * Get context-specific instructions based on content type
   */
  private getContentTypeContext(contentType: TranslationContext['contentType']): string {
    const contexts: Record<TranslationContext['contentType'], string> = {
      item_name: 'This is the name of a household item or appliance. Keep it concise and use common local terminology.',
      item_description: 'This is a description of a household item. Maintain helpful, instructional tone.',
      article_title: 'This is a title for an instruction article. Keep it clear and action-oriented.',
      article_description: 'This is a description of instructions. Maintain clarity and helpfulness.',
      link_title: 'This is a title for a resource link. Keep it brief and descriptive.',
      tag: 'This is a category tag. Use standard local terminology.',
    };

    return contexts[contentType] || '';
  }

  /**
   * Extract translation from API response
   */
  private extractTranslation(response: Anthropic.Message): string {
    const content = response.content[0];

    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude API');
    }

    return content.text.trim();
  }

  /**
   * Handle API errors and convert to user-friendly messages
   */
  private handleApiError(error: unknown): Error {
    if (error instanceof Anthropic.APIError) {
      switch (error.status) {
        case 401:
          return new Error('Translation service authentication failed. Please check API configuration.');
        case 429:
          return new Error('Translation service rate limit exceeded. Please try again later.');
        case 500:
        case 502:
        case 503:
          return new Error('Translation service temporarily unavailable. Please try again later.');
        default:
          return new Error(`Translation failed: ${error.message}`);
      }
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('An unexpected error occurred during translation.');
  }

  /**
   * Record a request for rate limiting
   */
  private recordRequest(): void {
    this.cleanupRateLimitWindow();
    this.rateLimitWindow.push({ timestamp: Date.now(), count: 1 });
  }

  /**
   * Clean up old entries from rate limit window
   */
  private cleanupRateLimitWindow(): void {
    const oneMinuteAgo = Date.now() - 60000;
    this.rateLimitWindow = this.rateLimitWindow.filter(
      entry => entry.timestamp > oneMinuteAgo
    );
  }
}

/**
 * Factory function to create a Claude provider instance
 */
export function createClaudeProvider(): ClaudeTranslationProvider {
  return new ClaudeTranslationProvider();
}
```

### Task 3.2.4: Update Module Exports

Update the translation service barrel file to export the Claude provider.

**File:** `/src/lib/translation-service/index.ts` (modify)

**Changes:**
```typescript
// Export Claude provider
export { ClaudeTranslationProvider, createClaudeProvider } from './providers/claude-provider';
```

### Task 3.2.5: Create Unit Tests

Create unit tests for the Claude provider.

**File:** `/src/lib/translation-service/providers/__tests__/claude-provider.test.ts`

**Test Cases:**
1. Provider initialization with valid API key
2. Provider initialization without API key (should mark as unavailable)
3. `isAvailable()` returns correct status
4. `getRateLimitStatus()` tracks requests correctly
5. `translate()` succeeds with valid request
6. `translate()` handles rate limit exceeded
7. `translateBatch()` translates to multiple languages
8. Error handling for API failures
9. Domain context inclusion in prompts
10. Content type context variation

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-service/providers/__tests__/claude-provider.test.ts` | Unit tests for Claude provider |

### Existing Files to Modify

| File Path | Function/Section | Modification |
|-----------|------------------|--------------|
| `/src/lib/translation-service/providers/claude-provider.ts` | Entire file | Replace stub with full implementation |
| `/src/lib/translation-service/index.ts` | Exports | Add Claude provider exports |
| `/.env.example` | Environment variables | Add `ANTHROPIC_API_KEY` and translation config vars |
| `/package.json` | dependencies | Add `@anthropic-ai/sdk` |

### Files NOT to Modify

- `/src/lib/translation-service/translation-service.types.ts` - Types already defined
- `/src/lib/translation-service/providers/openai-provider.ts` - Separate task (3.3)
- `/src/lib/translation-service/utils/rate-limiter.ts` - Separate task (3.4)
- `/src/lib/translation-service/utils/retry.ts` - Separate task (3.5)

---

## Implementation Order

1. **Install SDK** (Task 3.2.1) - Add `@anthropic-ai/sdk` dependency
2. **Add env vars** (Task 3.2.2) - Update `.env.example`
3. **Implement provider** (Task 3.2.3) - Replace stub with full implementation
4. **Update exports** (Task 3.2.4) - Add to barrel file
5. **Write tests** (Task 3.2.5) - Create unit test file

---

## Acceptance Criteria Verification

| Criteria (from REQ-236) | Implementation Verification |
|-------------------------|----------------------------|
| System successfully authenticates with the translation service using secure credentials | `initializeClient()` reads `ANTHROPIC_API_KEY` from env, validates presence |
| Translations incorporate vacation rental domain context | `DOMAIN_CONTEXT` constant and `buildTranslationPrompt()` include rental-specific instructions |
| System respects rate limits and prevents service overuse | `rateLimitWindow[]` tracking with sliding window, `getRateLimitStatus()` method |
| When rate limits are approached or exceeded, users receive clear feedback | `translate()` throws error with seconds until reset when limited |
| Translation requests that fail return meaningful error messages | `handleApiError()` maps API errors to user-friendly messages |
| Credentials and API keys are never exposed in client-side code or responses | API key read server-side only via `process.env.ANTHROPIC_API_KEY` |

---

## Dependencies

### Depends On (Completed First)

- **REQ-235** (Task 3.1): Translation service module structure and type definitions
  - `/src/lib/translation-service/translation-service.types.ts` must exist with `ITranslationProvider` interface

### Blocks (Requires This First)

- **Task 3.6**: Main translation service wrapper (uses providers)
- **Task 3.8**: API endpoint for manual translation testing

---

## Testing Strategy

### Unit Tests

```typescript
// /src/lib/translation-service/providers/__tests__/claude-provider.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClaudeTranslationProvider, createClaudeProvider } from '../claude-provider';

describe('ClaudeTranslationProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('initialization', () => {
    it('should mark as unavailable when API key is missing', () => {
      delete process.env.ANTHROPIC_API_KEY;
      const provider = createClaudeProvider();
      expect(provider.isAvailable()).toBe(false);
    });

    it('should mark as available when API key is present', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const provider = createClaudeProvider();
      expect(provider.isAvailable()).toBe(true);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return correct initial status', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const provider = createClaudeProvider();
      const status = provider.getRateLimitStatus();

      expect(status.remaining).toBe(60);
      expect(status.limit).toBe(60);
      expect(status.isLimited).toBe(false);
    });
  });

  describe('translate', () => {
    it('should throw when provider is not available', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      const provider = createClaudeProvider();

      await expect(provider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow('not available');
    });
  });
});
```

### Integration Testing

Integration tests should be performed manually or in a staging environment with a valid API key:

1. Translate a simple item name (e.g., "Coffee Machine" -> French)
2. Translate with domain context (e.g., check-in instructions)
3. Batch translate to all 5 target languages
4. Verify rate limiting behavior under load

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API key exposed in logs | Low | High | Never log API key; use environment variables only |
| Rate limit handling insufficient | Medium | Medium | Configurable limit via env; clear error messages |
| Claude model updates break compatibility | Low | Medium | Pin to specific model version; test on updates |
| Translation quality varies by language | Medium | Low | Domain context improves quality; manual review option in later epics |
| SDK version incompatibility | Low | Low | Pin SDK version in package.json |

---

## Estimated Effort

**Complexity:** Medium
**Estimated Time:** 3-4 hours

| Sub-task | Time |
|----------|------|
| Install SDK and env vars | 15 min |
| Implement provider class | 2 hours |
| Update exports | 10 min |
| Write unit tests | 1 hour |
| Manual integration testing | 30 min |

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | - | Anthropic API key for Claude access |
| `TRANSLATION_PROVIDER` | No | `claude` | Primary translation provider |
| `TRANSLATION_RATE_LIMIT_PER_MINUTE` | No | `60` | Max translation requests per minute |
| `TRANSLATION_MAX_RETRIES` | No | `3` | Max retry attempts for failed requests |

---

## Notes

- The implementation uses Claude 3 Haiku model (`claude-3-haiku-20240307`) for cost-effectiveness in translation tasks
- Rate limiting is implemented in-process using a sliding window; for production at scale, consider Redis-based distributed rate limiting
- The provider is designed to be used with the retry utility (Task 3.5) for exponential backoff on transient failures
- Domain context is included in every prompt to ensure consistent vacation rental terminology

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.2*
