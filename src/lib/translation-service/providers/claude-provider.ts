/**
 * Claude Translation Provider
 * REQ-236: AI-Powered Translation Provider with Domain Context
 *
 * Implements ITranslationProvider interface for Anthropic Claude API.
 * Includes vacation rental domain context for accurate translations.
 *
 * @module translation-service/providers/claude
 * @created 2026-01-18
 * @modified 2026-01-18
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
  ProviderConfig,
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

/**
 * Claude provider configuration type.
 * Extends ProviderConfig with Claude-specific options.
 */
export interface ClaudeProviderConfig extends ProviderConfig {
  /** Claude model to use (default: 'claude-3-haiku-20240307') */
  model?: string;
}

/**
 * Claude Translation Provider
 *
 * Implements the ITranslationProvider interface using Anthropic's Claude API.
 * Features:
 * - Vacation rental domain context for accurate translations
 * - Rate limiting with sliding window algorithm
 * - Content-type specific prompts
 * - Comprehensive error handling
 *
 * @example
 * ```typescript
 * const provider = createClaudeProvider();
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
        tokensUsed: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
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

/**
 * Factory function to create a Claude provider instance
 * Use this instead of direct instantiation for better testability.
 */
export function createClaudeProvider(): ClaudeTranslationProvider {
  return new ClaudeTranslationProvider();
}
