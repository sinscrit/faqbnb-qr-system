# REQ-236: Implement Claude Translation Provider - Detailed Task Breakdown

**Document Created:** 2026-01-18 22:45 UTC
**Last Modified:** 2026-01-18 22:45 UTC
**Request Reference:** REQ-236 (AI-Powered Translation Provider with Domain Context)
**Overview Document:** REQ-236-implement-claude-translation-provider-overview.md
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.2

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for implementing the Claude (Anthropic) translation provider. The implementation creates an AI-powered translation service that leverages Claude's language capabilities with vacation rental domain context to ensure accurate, contextually appropriate translations.

---

## Prerequisites

Before starting this implementation, verify the following are complete:

| Prerequisite | Status Check | Notes |
|--------------|--------------|-------|
| REQ-235 completed | Check `/src/lib/translation-service/translation-service.types.ts` exists | Types define `ITranslationProvider`, `TranslationRequest`, `TranslationResponse` interfaces |
| Translation service directory structure | Check `/src/lib/translation-service/` exists | Created in REQ-235 with stub files |
| Node.js environment ready | `node -v` returns v18+ | Required for Anthropic SDK |

---

## Task Breakdown

### Task 3.2.1: Install Anthropic SDK

**Story Points:** 0.5
**Complexity:** Low
**Dependencies:** None

#### Description
Add the official Anthropic TypeScript SDK to the project dependencies.

#### Implementation Steps

1. **Step 1.1:** Run npm install command
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. **Step 1.2:** Verify installation in package.json
   - Open `/package.json`
   - Confirm `@anthropic-ai/sdk` appears in `dependencies` section
   - Expected version: `^0.30.0` or later

3. **Step 1.3:** Verify TypeScript types are available
   - Create a temporary test file or use IDE to check that `import Anthropic from '@anthropic-ai/sdk'` resolves correctly

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/package.json` | Modified | Add `@anthropic-ai/sdk` to dependencies |
| `/package-lock.json` | Modified | Auto-updated by npm |

#### Acceptance Criteria
- [ ] `@anthropic-ai/sdk` appears in package.json dependencies
- [ ] `npm install` completes without errors
- [ ] TypeScript can resolve imports from `@anthropic-ai/sdk`

---

### Task 3.2.2: Add Environment Variables

**Story Points:** 0.5
**Complexity:** Low
**Dependencies:** None (can run parallel with 3.2.1)

#### Description
Add Anthropic API configuration variables to the environment example file.

#### Implementation Steps

1. **Step 2.1:** Open `/.env.example`

2. **Step 2.2:** Add translation service configuration section
   ```bash
   # Translation Service Configuration
   TRANSLATION_PROVIDER=claude
   ANTHROPIC_API_KEY=sk-ant-xxx

   # Translation Service Tuning (optional)
   TRANSLATION_RATE_LIMIT_PER_MINUTE=60
   TRANSLATION_MAX_RETRIES=3
   ```

3. **Step 2.3:** Add to local `.env` file (if exists) with actual test key for development

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/.env.example` | Modified | Add translation service environment variables |

#### Acceptance Criteria
- [ ] `ANTHROPIC_API_KEY` variable documented in .env.example
- [ ] `TRANSLATION_PROVIDER` variable documented with default value
- [ ] Optional tuning variables documented with sensible defaults
- [ ] Comments explain the purpose of each variable

---

### Task 3.2.3: Create Claude Provider Class

**Story Points:** 3
**Complexity:** High
**Dependencies:** 3.2.1, 3.2.2

#### Description
Implement the `ClaudeTranslationProvider` class that satisfies the `ITranslationProvider` interface, including API authentication, rate limiting, domain context prompts, and error handling.

#### Implementation Steps

##### Step 3.1: Add imports and constants
**File:** `/src/lib/translation-service/providers/claude-provider.ts`

Replace the existing stub with:

```typescript
/**
 * Claude Translation Provider
 * REQ-236: AI-Powered Translation Provider with Domain Context
 *
 * Implements ITranslationProvider interface for Anthropic Claude API.
 * Includes vacation rental domain context for accurate translations.
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

// Configuration constants
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
```

##### Step 3.2: Define domain context constant

Add after the LANGUAGE_NAMES constant:

```typescript
/**
 * Domain context for vacation rental translations
 * This context is included in all translation prompts to ensure
 * Claude understands the vacation rental domain and uses appropriate terminology.
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
```

##### Step 3.3: Implement ClaudeTranslationProvider class structure

```typescript
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
```

##### Step 3.4: Implement client initialization method

```typescript
  /**
   * Initialize the Anthropic client
   * Reads API key from environment and creates client instance.
   * Gracefully handles missing configuration.
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
```

##### Step 3.5: Implement isAvailable method

```typescript
  /**
   * Check if the provider is available for use
   * @returns true if API key is configured and client is initialized
   */
  isAvailable(): boolean {
    return this.isConfigured && this.client !== null;
  }
```

##### Step 3.6: Implement rate limit tracking methods

```typescript
  /**
   * Get current rate limit status
   * Uses sliding window algorithm to track requests per minute.
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
   * Record a request for rate limiting
   */
  private recordRequest(): void {
    this.cleanupRateLimitWindow();
    this.rateLimitWindow.push({ timestamp: Date.now(), count: 1 });
  }

  /**
   * Clean up old entries from rate limit window (older than 1 minute)
   */
  private cleanupRateLimitWindow(): void {
    const oneMinuteAgo = Date.now() - 60000;
    this.rateLimitWindow = this.rateLimitWindow.filter(
      entry => entry.timestamp > oneMinuteAgo
    );
  }
```

##### Step 3.7: Implement translate method

```typescript
  /**
   * Translate a single text from source to target language
   * @param request Translation request with text, source, and target language
   * @returns Translation response with translated text and metadata
   * @throws Error if provider unavailable or rate limited
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
```

##### Step 3.8: Implement translateBatch method

```typescript
  /**
   * Translate text to multiple target languages
   * Processes translations sequentially to respect rate limits.
   *
   * @param request Batch translation request
   * @returns Batch response with all translations and any errors
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
```

##### Step 3.9: Implement prompt building methods

```typescript
  /**
   * Build the translation prompt with domain context
   * Constructs a prompt that includes vacation rental context and
   * content-type-specific instructions.
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
    const contexts: Record<NonNullable<TranslationContext['contentType']>, string> = {
      item_name: 'This is the name of a household item or appliance. Keep it concise and use common local terminology.',
      item_description: 'This is a description of a household item. Maintain helpful, instructional tone.',
      article_title: 'This is a title for an instruction article. Keep it clear and action-oriented.',
      article_description: 'This is a description of instructions. Maintain clarity and helpfulness.',
      link_title: 'This is a title for a resource link. Keep it brief and descriptive.',
      tag: 'This is a category tag. Use standard local terminology.',
    };

    return contexts[contentType] || '';
  }
```

##### Step 3.10: Implement response extraction and error handling

```typescript
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
}
```

##### Step 3.11: Add factory function and close class

```typescript
/**
 * Factory function to create a Claude provider instance
 * Use this instead of direct instantiation for better testability.
 */
export function createClaudeProvider(): ClaudeTranslationProvider {
  return new ClaudeTranslationProvider();
}
```

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/lib/translation-service/providers/claude-provider.ts` | Modified | Replace stub with full implementation |

#### Acceptance Criteria
- [ ] Class implements `ITranslationProvider` interface correctly
- [ ] `isAvailable()` returns `false` when API key is missing
- [ ] `isAvailable()` returns `true` when API key is configured
- [ ] `translate()` includes domain context in prompt
- [ ] `translate()` respects rate limits
- [ ] `translateBatch()` translates to multiple languages
- [ ] Error handling provides user-friendly messages
- [ ] Factory function creates valid provider instance

---

### Task 3.2.4: Update Module Exports

**Story Points:** 0.5
**Complexity:** Low
**Dependencies:** 3.2.3

#### Description
Update the translation service barrel file to export the Claude provider class and factory function.

#### Implementation Steps

1. **Step 4.1:** Open `/src/lib/translation-service/index.ts`

2. **Step 4.2:** Add Claude provider exports
   ```typescript
   // Export Claude provider
   export { ClaudeTranslationProvider, createClaudeProvider } from './providers/claude-provider';
   ```

3. **Step 4.3:** Verify exports don't conflict with existing exports

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/lib/translation-service/index.ts` | Modified | Add Claude provider exports |

#### Acceptance Criteria
- [ ] `ClaudeTranslationProvider` can be imported from `@/lib/translation-service`
- [ ] `createClaudeProvider` can be imported from `@/lib/translation-service`
- [ ] No TypeScript errors in barrel file

---

### Task 3.2.5: Create Unit Tests

**Story Points:** 2
**Complexity:** Medium
**Dependencies:** 3.2.3, 3.2.4

#### Description
Create comprehensive unit tests for the Claude provider to verify initialization, rate limiting, translation, and error handling.

#### Implementation Steps

##### Step 5.1: Create test file structure

**File:** `/src/lib/translation-service/providers/__tests__/claude-provider.test.ts`

```typescript
/**
 * Unit Tests for Claude Translation Provider
 * REQ-236: AI-Powered Translation Provider with Domain Context
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClaudeTranslationProvider, createClaudeProvider } from '../claude-provider';

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn(),
      },
    })),
    APIError: class APIError extends Error {
      status: number;
      constructor(status: number, message: string) {
        super(message);
        this.status = status;
      }
    },
  };
});
```

##### Step 5.2: Add initialization tests

```typescript
describe('ClaudeTranslationProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
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

    it('should have correct provider name', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const provider = createClaudeProvider();
      expect(provider.name).toBe('claude');
    });

    it('should use custom rate limit from environment', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE = '30';
      const provider = createClaudeProvider();
      const status = provider.getRateLimitStatus();
      expect(status.limit).toBe(30);
    });
  });
```

##### Step 5.3: Add rate limit tests

```typescript
  describe('getRateLimitStatus', () => {
    it('should return correct initial status', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const provider = createClaudeProvider();
      const status = provider.getRateLimitStatus();

      expect(status.remaining).toBe(60);
      expect(status.limit).toBe(60);
      expect(status.isLimited).toBe(false);
      expect(status.resetInSeconds).toBe(0);
    });

    it('should track rate limit status across multiple checks', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const provider = createClaudeProvider();

      // First check
      const status1 = provider.getRateLimitStatus();
      expect(status1.remaining).toBe(60);

      // Status should remain unchanged without actual requests
      const status2 = provider.getRateLimitStatus();
      expect(status2.remaining).toBe(60);
    });
  });
```

##### Step 5.4: Add translate method tests

```typescript
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

    it('should successfully translate text when configured', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const provider = createClaudeProvider();

      // Mock the Anthropic client response
      const mockResponse = {
        content: [{ type: 'text', text: 'Bonjour' }],
        usage: { input_tokens: 10, output_tokens: 5 },
      };

      // Access the mock and set return value
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (Anthropic as any).mockImplementation(() => ({
        messages: { create: mockCreate },
      }));

      // Re-create provider with mocked SDK
      const freshProvider = createClaudeProvider();

      const result = await freshProvider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(result.translatedText).toBe('Bonjour');
      expect(result.provider).toBe('claude');
      expect(result.tokensUsed).toBe(15);
    });

    it('should include domain context in translation request', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      const provider = createClaudeProvider();

      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const mockCreate = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Translated' }],
        usage: { input_tokens: 10, output_tokens: 5 },
      });
      (Anthropic as any).mockImplementation(() => ({
        messages: { create: mockCreate },
      }));

      const freshProvider = createClaudeProvider();

      await freshProvider.translate({
        text: 'Check-in time is 3 PM',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
        context: {
          contentType: 'article_description',
        },
      });

      // Verify the prompt includes domain context
      expect(mockCreate).toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('vacation rental');
    });
  });
```

##### Step 5.5: Add batch translation tests

```typescript
  describe('translateBatch', () => {
    it('should throw when provider is not available', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      const provider = createClaudeProvider();

      await expect(provider.translateBatch({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguages: ['fr', 'es'],
      })).rejects.toThrow('not available');
    });

    it('should skip translation when target equals source', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const mockCreate = vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Hola' }],
        usage: { input_tokens: 10, output_tokens: 5 },
      });
      (Anthropic as any).mockImplementation(() => ({
        messages: { create: mockCreate },
      }));

      const provider = createClaudeProvider();

      const result = await provider.translateBatch({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguages: ['en', 'es'],
      });

      // Source language should return original text without API call
      expect(result.translations.en).toBe('Hello');
      expect(result.translations.es).toBe('Hola');

      // Only one API call should be made (for Spanish)
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should collect errors for failed translations', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const mockCreate = vi.fn()
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: 'Bonjour' }],
          usage: { input_tokens: 10, output_tokens: 5 },
        })
        .mockRejectedValueOnce(new Error('API Error'));

      (Anthropic as any).mockImplementation(() => ({
        messages: { create: mockCreate },
      }));

      const provider = createClaudeProvider();

      const result = await provider.translateBatch({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguages: ['fr', 'es'],
      });

      expect(result.translations.fr).toBe('Bonjour');
      expect(result.errors?.es).toBeDefined();
    });
  });
```

##### Step 5.6: Add error handling tests

```typescript
  describe('error handling', () => {
    it('should handle 401 authentication errors', async () => {
      process.env.ANTHROPIC_API_KEY = 'invalid-key';

      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const { APIError } = await import('@anthropic-ai/sdk');

      const mockCreate = vi.fn().mockRejectedValue(
        new (APIError as any)(401, 'Unauthorized')
      );
      (Anthropic as any).mockImplementation(() => ({
        messages: { create: mockCreate },
      }));

      const provider = createClaudeProvider();

      await expect(provider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow('authentication failed');
    });

    it('should handle 429 rate limit errors', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const { APIError } = await import('@anthropic-ai/sdk');

      const mockCreate = vi.fn().mockRejectedValue(
        new (APIError as any)(429, 'Rate limited')
      );
      (Anthropic as any).mockImplementation(() => ({
        messages: { create: mockCreate },
      }));

      const provider = createClaudeProvider();

      await expect(provider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow('rate limit exceeded');
    });

    it('should handle 5xx server errors', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const { APIError } = await import('@anthropic-ai/sdk');

      const mockCreate = vi.fn().mockRejectedValue(
        new (APIError as any)(503, 'Service unavailable')
      );
      (Anthropic as any).mockImplementation(() => ({
        messages: { create: mockCreate },
      }));

      const provider = createClaudeProvider();

      await expect(provider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow('temporarily unavailable');
    });
  });
});
```

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/lib/translation-service/providers/__tests__/claude-provider.test.ts` | Created | Unit tests for Claude provider |

#### Acceptance Criteria
- [ ] Tests cover provider initialization scenarios
- [ ] Tests verify rate limit tracking
- [ ] Tests verify successful translation flow
- [ ] Tests verify batch translation behavior
- [ ] Tests verify error handling for all API error types
- [ ] All tests pass with `npm test`

---

## Implementation Order Summary

| Order | Task | Description | Est. Time | Dependencies |
|-------|------|-------------|-----------|--------------|
| 1 | 3.2.1 | Install Anthropic SDK | 10 min | None |
| 2 | 3.2.2 | Add environment variables | 10 min | None |
| 3 | 3.2.3 | Implement Claude provider class | 2 hours | 3.2.1, 3.2.2 |
| 4 | 3.2.4 | Update module exports | 10 min | 3.2.3 |
| 5 | 3.2.5 | Create unit tests | 1 hour | 3.2.3, 3.2.4 |

**Total Estimated Time:** 3-4 hours

---

## Verification Checklist

After completing all tasks, verify the following:

### Code Quality
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All unit tests pass (`npm test`)

### Functionality
- [ ] Provider initializes correctly with valid API key
- [ ] Provider reports unavailable when API key missing
- [ ] Rate limiting tracks requests correctly
- [ ] Translation returns correct format
- [ ] Batch translation handles multiple languages
- [ ] Domain context included in all prompts
- [ ] Error messages are user-friendly

### Security
- [ ] API key never logged or exposed
- [ ] API key only read from environment variables
- [ ] No sensitive data in error messages

### Documentation
- [ ] Environment variables documented in .env.example
- [ ] Code comments explain non-obvious logic

---

## Integration Testing Notes

After unit tests pass, perform manual integration testing with a valid Anthropic API key:

1. **Simple Translation Test**
   ```typescript
   const provider = createClaudeProvider();
   const result = await provider.translate({
     text: 'Coffee Machine',
     sourceLanguage: 'en',
     targetLanguage: 'fr',
   });
   // Expected: "Machine à café" or similar
   ```

2. **Domain Context Test**
   ```typescript
   const result = await provider.translate({
     text: 'Check-in time is 3 PM. Early check-in available upon request.',
     sourceLanguage: 'en',
     targetLanguage: 'de',
     context: { contentType: 'article_description' },
   });
   // Verify German uses appropriate rental terminology
   ```

3. **Batch Translation Test**
   ```typescript
   const result = await provider.translateBatch({
     text: 'Kitchen',
     sourceLanguage: 'en',
     targetLanguages: ['fr', 'es', 'de', 'nl', 'it'],
   });
   // Verify all 5 translations returned
   ```

---

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate:** Set `TRANSLATION_PROVIDER=none` to disable translation
2. **Code Rollback:** Revert changes to `claude-provider.ts` to stub state
3. **Dependencies:** `npm uninstall @anthropic-ai/sdk` if SDK causes issues

---

## Related Documents

- [REQ-236 Overview](./REQ-236-implement-claude-translation-provider-overview.md)
- [Plan-110 Implementation Plan](./prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-235 Translation Service Module](./REQ-235-create-translation-service-module-structure-detailed.md)
- [REQ-237 OpenAI Provider (Fallback)](./REQ-237-implement-openai-translation-provider-fallback-overview.md)

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.2*
*Detailed breakdown ready for implementation by AI coding agent or junior developer*
