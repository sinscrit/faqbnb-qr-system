/**
 * OpenAI Translation Provider (Fallback)
 * REQ-237: Alternative AI Translation Provider for Service Resilience
 *
 * Implements ITranslationProvider interface for OpenAI API.
 * Includes vacation rental domain context for accurate translations.
 * Activates as fallback when Claude provider fails.
 *
 * @module translation-service/providers/openai
 * @created 2026-01-18
 * @modified 2026-01-18
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
  ProviderConfig,
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

/**
 * OpenAI provider configuration type.
 * Extends ProviderConfig with OpenAI-specific options.
 */
export interface OpenAIProviderConfig extends ProviderConfig {
  /** OpenAI model to use (default: 'gpt-4o-mini') */
  model?: string;
}

/**
 * OpenAI Translation Provider
 *
 * Implements the ITranslationProvider interface using OpenAI's API.
 * Features:
 * - Vacation rental domain context for accurate translations
 * - Rate limiting with sliding window algorithm
 * - Content-type specific prompts
 * - Comprehensive error handling
 * - Split system/user message format (OpenAI best practice)
 *
 * @example
 * ```typescript
 * const provider = createOpenAIProvider();
 * if (provider.isAvailable()) {
 *   const result = await provider.translate({
 *     text: 'Check-in time is 3 PM',
 *     sourceLanguage: 'en',
 *     targetLanguage: 'fr',
 *   });
 *   console.log(result.translatedText); // "L'heure d'arrivée est 15h"
 * }
 * ```
 */
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

  /**
   * Check if the provider is available for use
   * @returns true if API key is configured and client is initialized
   */
  isAvailable(): boolean {
    return this.isConfigured && this.client !== null;
  }

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

/**
 * Factory function to create an OpenAI provider instance
 * Use this instead of direct instantiation for better testability.
 */
export function createOpenAIProvider(): OpenAITranslationProvider {
  return new OpenAITranslationProvider();
}
