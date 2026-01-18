# REQ-237: Implement OpenAI Translation Provider (Fallback) - Implementation Overview

**Document Created:** 2026-01-18 22:45 UTC
**Last Modified:** 2026-01-18 22:45 UTC
**Request Reference:** REQ-237 (Alternative AI Translation Provider for Service Resilience)
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.3

---

## Summary

Implement the OpenAI translation provider as a fallback alternative to the Claude provider. This provider must implement the identical `ITranslationProvider` interface to ensure seamless integration with the translation service wrapper. The OpenAI provider activates automatically when the primary Claude provider fails, ensuring uninterrupted translation services for vacation rental content.

---

## Technical Context

### Existing Patterns in Codebase

| Pattern | Location | Relevance |
|---------|----------|-----------|
| Provider Interface | `/src/lib/translation-service/translation-service.types.ts` | `ITranslationProvider` interface contract (created in REQ-235) |
| Claude Provider | `/src/lib/translation-service/providers/claude-provider.ts` | Reference implementation to mirror (created in REQ-236) |
| Service Provider Pattern | `/src/lib/email-service.ts:23-28` | Interface + Implementation + Factory pattern with mock/production variants |
| Error Handling | `/src/lib/error-utils.ts` | User-friendly error translation and classification |
| Configuration Pattern | `/src/lib/config.ts` | Environment variable handling with fallbacks |

### Dependencies

#### New Dependency Required

| Library | Version | Purpose | Installation |
|---------|---------|---------|--------------|
| `openai` | `^4.70.0` | Official OpenAI SDK for TypeScript | `npm install openai` |

#### Existing Dependencies Used

- TypeScript types from `/src/lib/translation-service/translation-service.types.ts` (REQ-235)
- Interface patterns from `/src/lib/translation-service/providers/claude-provider.ts` (REQ-236)

### Target File Location

**File:** `/src/lib/translation-service/providers/openai-provider.ts`

This file currently contains a placeholder stub created in REQ-235:

```typescript
/**
 * OpenAI Translation Provider
 * Part of REQ-235: Translation Service Module Infrastructure
 * Implementation: Task 3.3
 *
 * @module translation-service/providers/openai
 */

// TODO: Implement in Task 3.3
// This file will contain the OpenAI translation provider implementation
```

---

## Implementation Tasks

### Task 3.3.1: Install OpenAI SDK

Add the OpenAI SDK dependency to the project.

**Actions:**
1. Run `npm install openai`
2. Verify installation in `package.json`

**Dependencies affected:**
- `package.json` - Add `openai`
- `package-lock.json` - Updated automatically

### Task 3.3.2: Add Environment Variables

Add OpenAI API configuration to environment files.

**File:** `/.env.example` (modify)

**Add variables:**
```bash
# OpenAI Translation Provider (Fallback)
OPENAI_API_KEY=sk-xxx
OPENAI_TRANSLATION_MODEL=gpt-4o-mini  # Cost-effective for translations
```

### Task 3.3.3: Implement OpenAI Provider Class

Implement the `OpenAITranslationProvider` class that satisfies the `ITranslationProvider` interface, mirroring the Claude provider's structure.

**File:** `/src/lib/translation-service/providers/openai-provider.ts`

**Implementation Requirements:**

1. **API Authentication**
   - Read `OPENAI_API_KEY` from environment variables
   - Validate API key presence on initialization
   - Handle authentication errors gracefully

2. **Rate Limiting Integration**
   - Track requests per minute using sliding window (same as Claude provider)
   - Implement `getRateLimitStatus()` method
   - Respect OpenAI's rate limits (configurable via env)

3. **Domain Context Prompts**
   - Use identical vacation rental domain context as Claude provider
   - Support different content types (item names, descriptions, article titles, etc.)
   - Maintain consistent terminology translation

4. **Error Handling**
   - Handle OpenAI-specific API errors (rate limits, auth failures, timeouts)
   - Provide meaningful error messages consistent with Claude provider
   - Support retry integration

**Class Structure:**

```typescript
/**
 * OpenAI Translation Provider (Fallback)
 * REQ-237: Alternative AI Translation Provider for Service Resilience
 *
 * @module translation-service/providers/openai
 */

import OpenAI from 'openai';
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
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'; // Cost-effective for translations
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_RATE_LIMIT_PER_MINUTE = 60;

// Language display names for prompts (shared with Claude provider)
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
 * (Identical to Claude provider for consistency)
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

export class OpenAITranslationProvider implements ITranslationProvider {
  readonly name: TranslationProvider = 'openai';

  private client: OpenAI | null = null;
  private rateLimitWindow: { timestamp: number; count: number }[] = [];
  private rateLimitPerMinute: number;
  private isConfigured: boolean = false;
  private model: string;

  constructor() {
    this.rateLimitPerMinute = parseInt(
      process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE || String(DEFAULT_RATE_LIMIT_PER_MINUTE)
    );
    this.model = process.env.OPENAI_TRANSLATION_MODEL || DEFAULT_OPENAI_MODEL;
    this.initializeClient();
  }

  /**
   * Initialize the OpenAI client
   */
  private initializeClient(): void {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('OPENAI_API_KEY not configured - OpenAI translation provider unavailable');
      this.isConfigured = false;
      return;
    }

    try {
      this.client = new OpenAI({ apiKey });
      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
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
      throw new Error('OpenAI translation provider is not available. Check OPENAI_API_KEY configuration.');
    }

    // Check rate limit
    const rateLimitStatus = this.getRateLimitStatus();
    if (rateLimitStatus.isLimited) {
      throw new Error(`Rate limit exceeded. Try again in ${rateLimitStatus.resetInSeconds} seconds.`);
    }

    // Record this request for rate limiting
    this.recordRequest();

    const startTime = Date.now();
    const systemPrompt = this.buildSystemPrompt(request.context);
    const userPrompt = this.buildUserPrompt(request);

    try {
      const response = await this.client!.chat.completions.create({
        model: this.model,
        max_tokens: request.context?.maxLength || DEFAULT_MAX_TOKENS,
        temperature: 0.3, // Lower temperature for more consistent translations
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const translatedText = this.extractTranslation(response);
      const durationMs = Date.now() - startTime;

      return {
        translatedText,
        provider: 'openai',
        tokensUsed: response.usage?.total_tokens,
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
      throw new Error('OpenAI translation provider is not available. Check OPENAI_API_KEY configuration.');
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
      provider: 'openai',
      totalTokensUsed,
      totalDurationMs: Date.now() - startTime,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  }

  /**
   * Build the system prompt with domain context
   */
  private buildSystemPrompt(context?: TranslationContext): string {
    let prompt = DOMAIN_CONTEXT;

    // Add content type context
    if (context?.contentType) {
      const contentTypeContext = this.getContentTypeContext(context.contentType);
      prompt += '\n\n' + contentTypeContext;
    }

    // Add custom domain context if provided
    if (context?.domainContext) {
      prompt += `\n\nAdditional context: ${context.domainContext}`;
    }

    // Add tone guidance
    if (context?.tone) {
      prompt += `\n\nTone: ${context.tone}`;
    }

    // Add max length constraint
    if (context?.maxLength) {
      prompt += `\n\nMaximum length: ${context.maxLength} characters`;
    }

    prompt += '\n\nReturn ONLY the translated text, with no explanations or additional text.';

    return prompt;
  }

  /**
   * Build the user prompt for translation
   */
  private buildUserPrompt(request: TranslationRequest): string {
    const { text, sourceLanguage, targetLanguage } = request;
    const sourceLang = LANGUAGE_NAMES[sourceLanguage];
    const targetLang = LANGUAGE_NAMES[targetLanguage];

    return `Translate the following text from ${sourceLang} to ${targetLang}:\n\n${text}`;
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
  private extractTranslation(response: OpenAI.Chat.Completions.ChatCompletion): string {
    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Unexpected response format from OpenAI API');
    }

    return content.trim();
  }

  /**
   * Handle API errors and convert to user-friendly messages
   */
  private handleApiError(error: unknown): Error {
    if (error instanceof OpenAI.APIError) {
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
 * Factory function to create an OpenAI provider instance
 */
export function createOpenAIProvider(): OpenAITranslationProvider {
  return new OpenAITranslationProvider();
}
```

### Task 3.3.4: Update Module Exports

Update the translation service barrel file to export the OpenAI provider.

**File:** `/src/lib/translation-service/index.ts` (modify)

**Changes:**
```typescript
// Export OpenAI provider
export { OpenAITranslationProvider, createOpenAIProvider } from './providers/openai-provider';
```

### Task 3.3.5: Create Unit Tests

Create unit tests for the OpenAI provider.

**File:** `/src/lib/translation-service/providers/__tests__/openai-provider.test.ts`

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
| `/src/lib/translation-service/providers/__tests__/openai-provider.test.ts` | Unit tests for OpenAI provider |

### Existing Files to Modify

| File Path | Function/Section | Modification |
|-----------|------------------|--------------|
| `/src/lib/translation-service/providers/openai-provider.ts` | Entire file | Replace stub with full implementation |
| `/src/lib/translation-service/index.ts` | Exports | Add OpenAI provider exports |
| `/.env.example` | Environment variables | Add `OPENAI_API_KEY` and `OPENAI_TRANSLATION_MODEL` |
| `/package.json` | dependencies | Add `openai` |

### Files NOT to Modify

- `/src/lib/translation-service/translation-service.types.ts` - Types already defined
- `/src/lib/translation-service/providers/claude-provider.ts` - Separate task (3.2), already implemented
- `/src/lib/translation-service/utils/rate-limiter.ts` - Separate task (3.4)
- `/src/lib/translation-service/utils/retry.ts` - Separate task (3.5)
- `/src/lib/translation-service/translation-service.ts` - Separate task (3.6)

---

## Implementation Order

1. **Install SDK** (Task 3.3.1) - Add `openai` dependency
2. **Add env vars** (Task 3.3.2) - Update `.env.example`
3. **Implement provider** (Task 3.3.3) - Replace stub with full implementation
4. **Update exports** (Task 3.3.4) - Add to barrel file
5. **Write tests** (Task 3.3.5) - Create unit test file

---

## Interface Parity with Claude Provider

The OpenAI provider must implement the identical `ITranslationProvider` interface:

| Method | Signature | Behavior |
|--------|-----------|----------|
| `name` | `readonly name: TranslationProvider` | Returns `'openai'` |
| `isAvailable()` | `isAvailable(): boolean` | Checks `OPENAI_API_KEY` presence and client initialization |
| `getRateLimitStatus()` | `getRateLimitStatus(): RateLimitStatus` | Returns sliding window rate limit status |
| `translate()` | `translate(request: TranslationRequest): Promise<TranslationResponse>` | Translates single text |
| `translateBatch()` | `translateBatch(request: BatchTranslationRequest): Promise<BatchTranslationResponse>` | Translates to multiple languages |

### Key Differences from Claude Provider

| Aspect | Claude Provider | OpenAI Provider |
|--------|-----------------|-----------------|
| SDK | `@anthropic-ai/sdk` | `openai` |
| Default Model | `claude-3-haiku-20240307` | `gpt-4o-mini` |
| API Key Env Var | `ANTHROPIC_API_KEY` | `OPENAI_API_KEY` |
| Message Format | Single `user` message with full prompt | `system` + `user` message split |
| Error Class | `Anthropic.APIError` | `OpenAI.APIError` |
| Response Extraction | `response.content[0].text` | `response.choices[0].message.content` |

---

## Acceptance Criteria Verification

| Criteria (from REQ-237) | Implementation Verification |
|-------------------------|----------------------------|
| Alternative translation service integrates seamlessly with existing translation architecture | Implements `ITranslationProvider` interface identically to Claude provider |
| Both translation providers implement identical interface contracts for consistent behavior | Same interface, same method signatures, same return types |
| System automatically switches to fallback provider when primary service fails | Provider selection handled by translation-service.ts wrapper (Task 3.6) |
| Translation quality from fallback provider meets minimum accuracy standards | Uses GPT-4o-mini with low temperature (0.3) for consistent translations |
| Fallback provider handles vacation rental terminology appropriately | Uses identical `DOMAIN_CONTEXT` as Claude provider |
| Each provider manages its own authentication and rate limiting independently | Separate `initializeClient()`, separate `rateLimitWindow[]` |
| System logs which provider was used for each translation request | `TranslationResponse.provider` field returns `'openai'` |

---

## Dependencies

### Depends On (Completed First)

- **REQ-235** (Task 3.1): Translation service module structure and type definitions
  - `/src/lib/translation-service/translation-service.types.ts` must exist with `ITranslationProvider` interface
- **REQ-236** (Task 3.2): Claude translation provider implementation (reference implementation)

### Blocks (Requires This First)

- **Task 3.6**: Main translation service wrapper (uses both providers for fallback)
- **Task 3.8**: API endpoint for manual translation testing

---

## Testing Strategy

### Unit Tests

```typescript
// /src/lib/translation-service/providers/__tests__/openai-provider.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAITranslationProvider, createOpenAIProvider } from '../openai-provider';

describe('OpenAITranslationProvider', () => {
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
      delete process.env.OPENAI_API_KEY;
      const provider = createOpenAIProvider();
      expect(provider.isAvailable()).toBe(false);
    });

    it('should mark as available when API key is present', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const provider = createOpenAIProvider();
      expect(provider.isAvailable()).toBe(true);
    });

    it('should use custom model when specified', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.OPENAI_TRANSLATION_MODEL = 'gpt-4o';
      const provider = createOpenAIProvider();
      expect(provider.isAvailable()).toBe(true);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return correct initial status', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const provider = createOpenAIProvider();
      const status = provider.getRateLimitStatus();

      expect(status.remaining).toBe(60);
      expect(status.limit).toBe(60);
      expect(status.isLimited).toBe(false);
    });
  });

  describe('translate', () => {
    it('should throw when provider is not available', async () => {
      delete process.env.OPENAI_API_KEY;
      const provider = createOpenAIProvider();

      await expect(provider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow('not available');
    });
  });

  describe('interface parity with Claude provider', () => {
    it('should have name property set to openai', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const provider = createOpenAIProvider();
      expect(provider.name).toBe('openai');
    });

    it('should implement all ITranslationProvider methods', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const provider = createOpenAIProvider();

      expect(typeof provider.isAvailable).toBe('function');
      expect(typeof provider.getRateLimitStatus).toBe('function');
      expect(typeof provider.translate).toBe('function');
      expect(typeof provider.translateBatch).toBe('function');
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
5. Compare translation quality with Claude provider for same inputs

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API key exposed in logs | Low | High | Never log API key; use environment variables only |
| Rate limit handling insufficient | Medium | Medium | Configurable limit via env; clear error messages |
| OpenAI model updates break compatibility | Low | Medium | Pin to specific model version; test on updates |
| Translation quality differs from Claude | Medium | Low | Same domain context; manual review option in later epics |
| SDK version incompatibility | Low | Low | Pin SDK version in package.json |
| Cost differences between providers | Low | Medium | GPT-4o-mini is cost-effective; monitor usage |

---

## Estimated Effort

**Complexity:** Medium
**Estimated Time:** 2-3 hours

| Sub-task | Time |
|----------|------|
| Install SDK and env vars | 15 min |
| Implement provider class | 1.5 hours |
| Update exports | 10 min |
| Write unit tests | 45 min |
| Manual integration testing | 30 min |

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key for GPT access |
| `OPENAI_TRANSLATION_MODEL` | No | `gpt-4o-mini` | OpenAI model to use for translations |
| `TRANSLATION_RATE_LIMIT_PER_MINUTE` | No | `60` | Max translation requests per minute (shared with Claude) |

---

## Notes

- The implementation uses GPT-4o-mini model by default for cost-effectiveness in translation tasks
- Temperature is set to 0.3 (lower than default) for more consistent, deterministic translations
- Rate limiting is implemented in-process using a sliding window (same approach as Claude provider)
- The provider uses a split message format (system + user) which is the OpenAI best practice
- Domain context is identical to Claude provider to ensure consistent translations across both providers
- The fallback switching logic will be implemented in the main translation-service.ts wrapper (Task 3.6)

---

## OpenAI vs Claude Model Selection

| Use Case | OpenAI Model | Rationale |
|----------|--------------|-----------|
| Default translations | `gpt-4o-mini` | Cost-effective, fast, good quality for straightforward translations |
| Complex/nuanced content | `gpt-4o` | Better context understanding for marketing or legal text |
| Highest quality | `gpt-4o` | Premium option when translation accuracy is critical |

The model can be configured via `OPENAI_TRANSLATION_MODEL` environment variable to allow flexibility based on cost/quality tradeoffs.

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.3*
