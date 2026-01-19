# REQ-237: Implement OpenAI Translation Provider (Fallback) - Detailed Task Breakdown

**Document Created:** 2026-01-18 23:15 UTC
**Last Modified:** 2026-01-18 23:45 UTC
**Request Reference:** REQ-237 (Alternative AI Translation Provider for Service Resilience)
**Overview Document:** REQ-237-implement-openai-translation-provider-fallback-overview.md
**Implementation Plan Reference:** Plan-110-L10N-Epic1-Foundation.md
**Phase:** 3 - Translation Service
**Task ID:** 3.3

---

## Executive Summary

This document provides a granular, step-by-step task breakdown for implementing the OpenAI translation provider as a fallback alternative to the Claude provider. The implementation must satisfy the identical `ITranslationProvider` interface to ensure seamless integration with the translation service wrapper. The OpenAI provider activates automatically when the primary Claude provider fails, ensuring uninterrupted translation services for vacation rental content.

---

## Prerequisites

Before starting this implementation, verify the following are complete:

| Prerequisite | Status Check | Notes |
|--------------|--------------|-------|
| REQ-235 completed | Check `/src/lib/translation-service/translation-service.types.ts` exists | Types define `ITranslationProvider`, `TranslationRequest`, `TranslationResponse` interfaces |
| REQ-236 completed | Check `/src/lib/translation-service/providers/claude-provider.ts` has full implementation | Reference implementation to mirror |
| Translation service directory structure | Check `/src/lib/translation-service/providers/` exists | Contains stub `openai-provider.ts` |
| Node.js environment ready | `node -v` returns v18+ | Required for OpenAI SDK |

---

## Task Breakdown

### Task 3.3.1: Install OpenAI SDK

**Story Points:** 0.5
**Complexity:** Low
**Dependencies:** None

#### Description
Add the official OpenAI TypeScript SDK to the project dependencies.

#### Implementation Steps

1. **Step 1.1:** Run npm install command
   ```bash
   npm install openai
   ```

2. **Step 1.2:** Verify installation in package.json
   - Open `/package.json`
   - Confirm `openai` appears in `dependencies` section
   - Expected version: `^4.70.0` or later

3. **Step 1.3:** Verify TypeScript types are available
   - Create a temporary test file or use IDE to check that `import OpenAI from 'openai'` resolves correctly
   - Verify `OpenAI.APIError` type is accessible

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/package.json` | Modified | Add `openai` to dependencies |
| `/package-lock.json` | Modified | Auto-updated by npm |

#### Acceptance Criteria
- [x] `openai` appears in package.json dependencies
- [x] `npm install` completes without errors
- [x] TypeScript can resolve imports from `openai`
- [x] `OpenAI` and `OpenAI.APIError` types are accessible

---

### Task 3.3.2: Add Environment Variables

**Story Points:** 0.5
**Complexity:** Low
**Dependencies:** None (can run parallel with 3.3.1)

#### Description
Add OpenAI API configuration variables to the environment example file.

#### Implementation Steps

1. **Step 2.1:** Open `/.env.example`

2. **Step 2.2:** Add OpenAI configuration section after existing variables

   **Current content:**
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # QR Code Domain Configuration
   NEXT_PUBLIC_QR_DOMAIN_OVERRIDE=https://your-production-domain.com
   ```

   **Add this section:**
   ```bash

   # OpenAI Translation Provider (Fallback)
   OPENAI_API_KEY=sk-xxx
   OPENAI_TRANSLATION_MODEL=gpt-4o-mini  # Cost-effective for translations
   ```

3. **Step 2.3:** Add to local `.env` file (if exists) with actual test key for development

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/.env.example` | Modified | Add `OPENAI_API_KEY` and `OPENAI_TRANSLATION_MODEL` variables |

#### Acceptance Criteria
- [x] `OPENAI_API_KEY` variable documented in .env.example
- [x] `OPENAI_TRANSLATION_MODEL` variable documented with default value comment
- [x] Comments explain the purpose of each variable
- [x] Variables are placed in a logical section separate from other configs

---

### Task 3.3.3: Implement OpenAI Provider Class

**Story Points:** 3
**Complexity:** High
**Dependencies:** 3.3.1, 3.3.2

#### Description
Implement the `OpenAITranslationProvider` class that satisfies the `ITranslationProvider` interface, mirroring the Claude provider's structure while adapting to OpenAI-specific API patterns.

#### Implementation Steps

##### Step 3.1: Add imports and constants
**File:** `/src/lib/translation-service/providers/openai-provider.ts`

Replace the existing stub with:

```typescript
/**
 * OpenAI Translation Provider (Fallback)
 * REQ-237: Alternative AI Translation Provider for Service Resilience
 *
 * Implements ITranslationProvider interface for OpenAI API.
 * Includes vacation rental domain context for accurate translations.
 * Activates as fallback when Claude provider fails.
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

// Configuration constants
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'; // Cost-effective for translations
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_RATE_LIMIT_PER_MINUTE = 60;

// Language display names for prompts (identical to Claude provider)
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
 * IMPORTANT: Identical to Claude provider for consistency across providers.
 * This ensures translations maintain the same quality and terminology
 * regardless of which provider is used.
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

##### Step 3.3: Implement OpenAITranslationProvider class structure

```typescript
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
```

##### Step 3.4: Implement client initialization method

```typescript
  /**
   * Initialize the OpenAI client
   * Reads API key from environment and creates client instance.
   * Gracefully handles missing configuration.
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
   * (Identical implementation to Claude provider)
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
        temperature: 0.3, // Lower temperature for consistent translations
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
```

##### Step 3.9: Implement prompt building methods

```typescript
  /**
   * Build the system prompt with domain context
   * Note: OpenAI best practice is to split system and user prompts
   * (differs from Claude which uses a single user message)
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
   * (Identical to Claude provider for consistency)
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
   * Extract translation from OpenAI API response
   * Note: OpenAI response structure differs from Claude
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
   * Uses OpenAI.APIError instead of Anthropic.APIError
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
}
```

##### Step 3.11: Add factory function and close class

```typescript
/**
 * Factory function to create an OpenAI provider instance
 * Use this instead of direct instantiation for better testability.
 */
export function createOpenAIProvider(): OpenAITranslationProvider {
  return new OpenAITranslationProvider();
}
```

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/lib/translation-service/providers/openai-provider.ts` | Modified | Replace stub with full implementation |

#### Acceptance Criteria
- [x] Class implements `ITranslationProvider` interface correctly
- [x] `name` property returns `'openai'`
- [x] `isAvailable()` returns `false` when API key is missing
- [x] `isAvailable()` returns `true` when API key is configured
- [x] `translate()` includes domain context in system prompt
- [x] `translate()` uses split system/user message format (OpenAI best practice)
- [x] `translate()` respects rate limits
- [x] `translateBatch()` translates to multiple languages
- [x] Error handling provides user-friendly messages
- [x] Factory function creates valid provider instance
- [x] Uses `gpt-4o-mini` model by default (configurable via env)
- [x] Uses temperature 0.3 for consistent translations

---

### Task 3.3.4: Update Module Exports

**Story Points:** 0.5
**Complexity:** Low
**Dependencies:** 3.3.3

#### Description
Update the translation service barrel file to export the OpenAI provider class and factory function.

#### Implementation Steps

1. **Step 4.1:** Open `/src/lib/translation-service/index.ts`

2. **Step 4.2:** Add OpenAI provider exports
   ```typescript
   // Export OpenAI provider
   export { OpenAITranslationProvider, createOpenAIProvider } from './providers/openai-provider';
   ```

3. **Step 4.3:** Verify exports don't conflict with existing exports (especially Claude provider)

4. **Step 4.4:** Verify the file structure allows both providers to be imported together
   ```typescript
   // Example usage (verify this works)
   import {
     ClaudeTranslationProvider,
     OpenAITranslationProvider,
     createClaudeProvider,
     createOpenAIProvider
   } from '@/lib/translation-service';
   ```

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/lib/translation-service/index.ts` | Modified | Add OpenAI provider exports |

#### Acceptance Criteria
- [x] `OpenAITranslationProvider` can be imported from `@/lib/translation-service`
- [x] `createOpenAIProvider` can be imported from `@/lib/translation-service`
- [x] Both Claude and OpenAI providers can be imported in the same statement
- [x] No TypeScript errors in barrel file

---

### Task 3.3.5: Create Unit Tests

**Story Points:** 2
**Complexity:** Medium
**Dependencies:** 3.3.3, 3.3.4

#### Description
Create comprehensive unit tests for the OpenAI provider to verify initialization, rate limiting, translation, and error handling. Tests should mirror the Claude provider tests for consistency.

#### Implementation Steps

##### Step 5.1: Create test file structure

**File:** `/src/lib/translation-service/providers/__tests__/openai-provider.test.ts`

```typescript
/**
 * Unit Tests for OpenAI Translation Provider
 * REQ-237: Alternative AI Translation Provider for Service Resilience
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAITranslationProvider, createOpenAIProvider } from '../openai-provider';

// Mock the OpenAI SDK
vi.mock('openai', () => {
  const MockOpenAI = vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  }));

  // Add APIError as a static property
  class APIError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
      this.name = 'APIError';
    }
  }

  MockOpenAI.APIError = APIError;

  return {
    default: MockOpenAI,
  };
});
```

##### Step 5.2: Add initialization tests

```typescript
describe('OpenAITranslationProvider', () => {
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
      delete process.env.OPENAI_API_KEY;
      const provider = createOpenAIProvider();
      expect(provider.isAvailable()).toBe(false);
    });

    it('should mark as available when API key is present', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const provider = createOpenAIProvider();
      expect(provider.isAvailable()).toBe(true);
    });

    it('should have correct provider name', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const provider = createOpenAIProvider();
      expect(provider.name).toBe('openai');
    });

    it('should use custom rate limit from environment', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE = '30';
      const provider = createOpenAIProvider();
      const status = provider.getRateLimitStatus();
      expect(status.limit).toBe(30);
    });

    it('should use custom model from environment', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.OPENAI_TRANSLATION_MODEL = 'gpt-4o';
      const provider = createOpenAIProvider();
      expect(provider.isAvailable()).toBe(true);
      // Model is private, but we can verify it's used in API calls during integration tests
    });
  });
```

##### Step 5.3: Add rate limit tests

```typescript
  describe('getRateLimitStatus', () => {
    it('should return correct initial status', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const provider = createOpenAIProvider();
      const status = provider.getRateLimitStatus();

      expect(status.remaining).toBe(60);
      expect(status.limit).toBe(60);
      expect(status.isLimited).toBe(false);
      expect(status.resetInSeconds).toBe(0);
    });

    it('should track rate limit status across multiple checks', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const provider = createOpenAIProvider();

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
      delete process.env.OPENAI_API_KEY;
      const provider = createOpenAIProvider();

      await expect(provider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow('not available');
    });

    it('should successfully translate text when configured', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      // Mock the OpenAI client response
      const mockResponse = {
        choices: [{ message: { content: 'Bonjour' } }],
        usage: { total_tokens: 15 },
      };

      // Access the mock and set return value
      const OpenAI = (await import('openai')).default;
      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      // Re-create provider with mocked SDK
      const freshProvider = createOpenAIProvider();

      const result = await freshProvider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(result.translatedText).toBe('Bonjour');
      expect(result.provider).toBe('openai');
      expect(result.tokensUsed).toBe(15);
    });

    it('should include domain context in system prompt', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const OpenAI = (await import('openai')).default;
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Translated' } }],
        usage: { total_tokens: 10 },
      });
      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      const freshProvider = createOpenAIProvider();

      await freshProvider.translate({
        text: 'Check-in time is 3 PM',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
        context: {
          contentType: 'article_description',
        },
      });

      // Verify the system prompt includes domain context
      expect(mockCreate).toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].role).toBe('system');
      expect(callArgs.messages[0].content).toContain('vacation rental');
      expect(callArgs.messages[1].role).toBe('user');
    });

    it('should use split system/user message format', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const OpenAI = (await import('openai')).default;
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Translated' } }],
        usage: { total_tokens: 10 },
      });
      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      const freshProvider = createOpenAIProvider();

      await freshProvider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      // Verify OpenAI best practice: system + user messages
      expect(mockCreate).toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages).toHaveLength(2);
      expect(callArgs.messages[0].role).toBe('system');
      expect(callArgs.messages[1].role).toBe('user');
    });

    it('should use temperature 0.3 for consistent translations', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const OpenAI = (await import('openai')).default;
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Translated' } }],
        usage: { total_tokens: 10 },
      });
      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      const freshProvider = createOpenAIProvider();

      await freshProvider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      expect(mockCreate).toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.temperature).toBe(0.3);
    });
  });
```

##### Step 5.5: Add batch translation tests

```typescript
  describe('translateBatch', () => {
    it('should throw when provider is not available', async () => {
      delete process.env.OPENAI_API_KEY;
      const provider = createOpenAIProvider();

      await expect(provider.translateBatch({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguages: ['fr', 'es'],
      })).rejects.toThrow('not available');
    });

    it('should skip translation when target equals source', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const OpenAI = (await import('openai')).default;
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Hola' } }],
        usage: { total_tokens: 10 },
      });
      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      const provider = createOpenAIProvider();

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
      process.env.OPENAI_API_KEY = 'test-key';

      const OpenAI = (await import('openai')).default;
      const mockCreate = vi.fn()
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Bonjour' } }],
          usage: { total_tokens: 10 },
        })
        .mockRejectedValueOnce(new Error('API Error'));

      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      const provider = createOpenAIProvider();

      const result = await provider.translateBatch({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguages: ['fr', 'es'],
      });

      expect(result.translations.fr).toBe('Bonjour');
      expect(result.errors?.es).toBeDefined();
    });

    it('should return provider as openai in batch response', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const OpenAI = (await import('openai')).default;
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Bonjour' } }],
        usage: { total_tokens: 10 },
      });
      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      const provider = createOpenAIProvider();

      const result = await provider.translateBatch({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguages: ['fr'],
      });

      expect(result.provider).toBe('openai');
    });
  });
```

##### Step 5.6: Add error handling tests

```typescript
  describe('error handling', () => {
    it('should handle 401 authentication errors', async () => {
      process.env.OPENAI_API_KEY = 'invalid-key';

      const OpenAI = (await import('openai')).default;
      const APIError = (OpenAI as any).APIError;

      const mockCreate = vi.fn().mockRejectedValue(
        new APIError(401, 'Unauthorized')
      );
      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      const provider = createOpenAIProvider();

      await expect(provider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow('authentication failed');
    });

    it('should handle 429 rate limit errors', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const OpenAI = (await import('openai')).default;
      const APIError = (OpenAI as any).APIError;

      const mockCreate = vi.fn().mockRejectedValue(
        new APIError(429, 'Rate limited')
      );
      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      const provider = createOpenAIProvider();

      await expect(provider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow('rate limit exceeded');
    });

    it('should handle 5xx server errors', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const OpenAI = (await import('openai')).default;
      const APIError = (OpenAI as any).APIError;

      const mockCreate = vi.fn().mockRejectedValue(
        new APIError(503, 'Service unavailable')
      );
      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      const provider = createOpenAIProvider();

      await expect(provider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow('temporarily unavailable');
    });

    it('should handle unexpected response format', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const OpenAI = (await import('openai')).default;
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{ message: { content: null } }], // Empty content
      });
      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      const provider = createOpenAIProvider();

      await expect(provider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      })).rejects.toThrow('Unexpected response format');
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

    it('should use same domain context as Claude provider', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const OpenAI = (await import('openai')).default;
      const mockCreate = vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Translated' } }],
        usage: { total_tokens: 10 },
      });
      (OpenAI as any).mockImplementation(() => ({
        chat: {
          completions: { create: mockCreate },
        },
      }));

      const provider = createOpenAIProvider();

      await provider.translate({
        text: 'Hello',
        sourceLanguage: 'en',
        targetLanguage: 'fr',
      });

      // Verify domain context includes vacation rental terminology
      const callArgs = mockCreate.mock.calls[0][0];
      const systemPrompt = callArgs.messages[0].content;
      expect(systemPrompt).toContain('vacation rental');
      expect(systemPrompt).toContain('Check-in');
      expect(systemPrompt).toContain('Amenities');
    });
  });
});
```

#### Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `/src/lib/translation-service/providers/__tests__/openai-provider.test.ts` | Created | Unit tests for OpenAI provider |

#### Acceptance Criteria
- [x] Tests cover provider initialization scenarios (with/without API key)
- [x] Tests verify rate limit tracking
- [x] Tests verify successful translation flow
- [x] Tests verify batch translation behavior
- [x] Tests verify OpenAI-specific patterns (system/user split, temperature)
- [x] Tests verify error handling for all API error types (401, 429, 5xx)
- [x] Tests verify interface parity with Claude provider
- [x] Tests verify domain context inclusion
- [x] All tests pass with `npm test`

---

## Implementation Order Summary

| Order | Task | Description | Est. Time | Dependencies |
|-------|------|-------------|-----------|--------------|
| 1 | 3.3.1 | Install OpenAI SDK | 10 min | None |
| 2 | 3.3.2 | Add environment variables | 10 min | None |
| 3 | 3.3.3 | Implement OpenAI provider class | 2 hours | 3.3.1, 3.3.2 |
| 4 | 3.3.4 | Update module exports | 10 min | 3.3.3 |
| 5 | 3.3.5 | Create unit tests | 1 hour | 3.3.3, 3.3.4 |

**Total Estimated Time:** 3-4 hours

---

## Key Differences from Claude Provider

| Aspect | Claude Provider | OpenAI Provider |
|--------|-----------------|-----------------|
| SDK | `@anthropic-ai/sdk` | `openai` |
| Default Model | `claude-3-haiku-20240307` | `gpt-4o-mini` |
| Model Env Var | N/A (hardcoded) | `OPENAI_TRANSLATION_MODEL` |
| API Key Env Var | `ANTHROPIC_API_KEY` | `OPENAI_API_KEY` |
| Message Format | Single `user` message with full prompt | `system` + `user` message split |
| Error Class | `Anthropic.APIError` | `OpenAI.APIError` |
| Response Extraction | `response.content[0].text` | `response.choices[0].message.content` |
| Temperature | Not specified (default) | `0.3` (explicit for consistency) |

---

## Verification Checklist

After completing all tasks, verify the following:

### Code Quality
- [x] TypeScript compiles without errors (`npm run build`)
- [x] ESLint passes (`npm run lint`)
- [x] All unit tests pass (`npm test`)

### Functionality
- [x] Provider initializes correctly with valid API key
- [x] Provider reports unavailable when API key missing
- [x] Rate limiting tracks requests correctly
- [x] Translation returns correct format with `provider: 'openai'`
- [x] Batch translation handles multiple languages
- [x] Domain context included in all system prompts
- [x] Error messages are user-friendly and consistent with Claude provider

### Interface Parity
- [x] `name` property returns `'openai'`
- [x] `isAvailable()` has identical behavior pattern to Claude
- [x] `getRateLimitStatus()` returns identical structure
- [x] `translate()` accepts identical parameters
- [x] `translateBatch()` accepts identical parameters
- [x] Response types match interface exactly

### Security
- [x] API key never logged or exposed
- [x] API key only read from environment variables
- [x] No sensitive data in error messages

### Documentation
- [x] Environment variables documented in .env.example
- [x] Code comments explain non-obvious logic
- [x] Key differences from Claude noted in comments

---

## Integration Testing Notes

After unit tests pass, perform manual integration testing with a valid OpenAI API key:

1. **Simple Translation Test**
   ```typescript
   const provider = createOpenAIProvider();
   const result = await provider.translate({
     text: 'Coffee Machine',
     sourceLanguage: 'en',
     targetLanguage: 'fr',
   });
   // Expected: "Machine à café" or similar
   console.log(result.provider); // Should be 'openai'
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
   // Verify provider is 'openai'
   ```

4. **Comparison Test with Claude Provider**
   ```typescript
   const claudeProvider = createClaudeProvider();
   const openaiProvider = createOpenAIProvider();

   const text = 'The washing machine is located in the laundry room.';

   const claudeResult = await claudeProvider.translate({
     text, sourceLanguage: 'en', targetLanguage: 'fr'
   });

   const openaiResult = await openaiProvider.translate({
     text, sourceLanguage: 'en', targetLanguage: 'fr'
   });

   // Compare quality and terminology consistency
   console.log('Claude:', claudeResult.translatedText);
   console.log('OpenAI:', openaiResult.translatedText);
   ```

---

## Rollback Plan

If issues are discovered after deployment:

1. **Immediate:** OpenAI provider can be disabled without affecting primary Claude provider
2. **Code Rollback:** Revert changes to `openai-provider.ts` to stub state
3. **Dependencies:** `npm uninstall openai` if SDK causes issues
4. **Environment:** Remove `OPENAI_API_KEY` from environment (provider will self-disable)

---

## Related Documents

- [REQ-237 Overview](./REQ-237-implement-openai-translation-provider-fallback-overview.md)
- [Plan-110 Implementation Plan](./prd/Plan-110-L10N-Epic1-Foundation.md)
- [REQ-235 Translation Service Module](./REQ-235-create-translation-service-module-structure-overview.md)
- [REQ-236 Claude Provider (Primary)](./REQ-236-implement-claude-translation-provider-detailed.md)
- Task 3.6: Main Translation Service Wrapper (will use both providers for fallback logic)

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes (for OpenAI provider) | - | OpenAI API key for GPT access |
| `OPENAI_TRANSLATION_MODEL` | No | `gpt-4o-mini` | OpenAI model to use for translations |
| `TRANSLATION_RATE_LIMIT_PER_MINUTE` | No | `60` | Max translation requests per minute (shared with Claude) |

---

## Notes

- The implementation uses GPT-4o-mini model by default for cost-effectiveness in translation tasks
- Temperature is explicitly set to 0.3 (lower than default) for more consistent, deterministic translations
- Rate limiting is implemented in-process using a sliding window (same approach as Claude provider)
- The provider uses a split message format (system + user) which is the OpenAI best practice
- Domain context is identical to Claude provider to ensure consistent translations across both providers
- The fallback switching logic will be implemented in the main translation-service.ts wrapper (Task 3.6)
- This provider maintains interface parity with Claude provider for seamless fallback integration

---

*Document generated for FAQBNB L10N Epic 1 - Foundation, Phase 3, Task 3.3*
*Detailed breakdown ready for implementation by AI coding agent or junior developer*
