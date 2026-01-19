/**
 * Unit Tests for OpenAI Translation Provider
 * REQ-237: Alternative AI Translation Provider for Service Resilience
 *
 * @created 2026-01-18
 * @modified 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original env
const originalEnv = { ...process.env };

describe('OpenAITranslationProvider', () => {
  beforeEach(() => {
    // Clear vitest module cache
    vi.resetModules();
    // Reset environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should mark as unavailable when API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      expect(provider.isAvailable()).toBe(false);
    });

    it('should have correct provider name', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      expect(provider.name).toBe('openai');
    });

    it('should use custom rate limit from environment', async () => {
      delete process.env.OPENAI_API_KEY;
      process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE = '30';

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();
      const status = provider.getRateLimitStatus();

      expect(status.limit).toBe(30);
    });

    it('should use default rate limit when not specified', async () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();
      const status = provider.getRateLimitStatus();

      expect(status.limit).toBe(60);
    });

    it('should accept custom model from environment', async () => {
      delete process.env.OPENAI_API_KEY;
      process.env.OPENAI_TRANSLATION_MODEL = 'gpt-4o';

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      // Model is private, but provider should still initialize
      expect(provider.name).toBe('openai');
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return correct initial status', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();
      const status = provider.getRateLimitStatus();

      expect(status.remaining).toBe(60);
      expect(status.limit).toBe(60);
      expect(status.isLimited).toBe(false);
      expect(status.resetInSeconds).toBe(0);
    });

    it('should return correct initial status with custom limit', async () => {
      delete process.env.OPENAI_API_KEY;
      process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE = '100';

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();
      const status = provider.getRateLimitStatus();

      expect(status.remaining).toBe(100);
      expect(status.limit).toBe(100);
      expect(status.isLimited).toBe(false);
    });

    it('should track rate limit status across multiple checks', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      // First check
      const status1 = provider.getRateLimitStatus();
      expect(status1.remaining).toBe(60);

      // Status should remain unchanged without actual requests
      const status2 = provider.getRateLimitStatus();
      expect(status2.remaining).toBe(60);
    });
  });

  describe('translate', () => {
    it('should throw when provider is not available', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      await expect(
        provider.translate({
          text: 'Hello',
          sourceLanguage: 'en',
          targetLanguage: 'fr',
        })
      ).rejects.toThrow('not available');
    });

    it('should include correct error message about configuration', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      await expect(
        provider.translate({
          text: 'Hello',
          sourceLanguage: 'en',
          targetLanguage: 'fr',
        })
      ).rejects.toThrow('OPENAI_API_KEY');
    });
  });

  describe('translateBatch', () => {
    it('should throw when provider is not available', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      await expect(
        provider.translateBatch({
          text: 'Hello',
          sourceLanguage: 'en',
          targetLanguages: ['fr', 'es'],
        })
      ).rejects.toThrow('not available');
    });

    it('should include correct error message about configuration', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      await expect(
        provider.translateBatch({
          text: 'Hello',
          sourceLanguage: 'en',
          targetLanguages: ['fr', 'es'],
        })
      ).rejects.toThrow('OPENAI_API_KEY');
    });
  });

  describe('factory function', () => {
    it('should create a valid provider instance', async () => {
      delete process.env.OPENAI_API_KEY;

      const { createOpenAIProvider, OpenAITranslationProvider } = await import('../openai-provider');
      const provider = createOpenAIProvider();

      expect(provider).toBeInstanceOf(OpenAITranslationProvider);
      expect(provider.name).toBe('openai');
      expect(typeof provider.translate).toBe('function');
      expect(typeof provider.translateBatch).toBe('function');
      expect(typeof provider.isAvailable).toBe('function');
      expect(typeof provider.getRateLimitStatus).toBe('function');
    });

    it('should create instance without API key (unavailable state)', async () => {
      delete process.env.OPENAI_API_KEY;

      const { createOpenAIProvider, OpenAITranslationProvider } = await import('../openai-provider');
      const provider = createOpenAIProvider();

      expect(provider).toBeInstanceOf(OpenAITranslationProvider);
      expect(provider.isAvailable()).toBe(false);
    });
  });

  describe('interface compliance', () => {
    it('should implement ITranslationProvider interface', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      // Check all required interface methods exist
      expect(provider.name).toBe('openai');
      expect(typeof provider.translate).toBe('function');
      expect(typeof provider.translateBatch).toBe('function');
      expect(typeof provider.isAvailable).toBe('function');
      expect(typeof provider.getRateLimitStatus).toBe('function');
    });

    it('should return valid RateLimitStatus structure', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();
      const status = provider.getRateLimitStatus();

      // Verify RateLimitStatus structure
      expect(typeof status.remaining).toBe('number');
      expect(typeof status.limit).toBe('number');
      expect(typeof status.resetInSeconds).toBe('number');
      expect(typeof status.isLimited).toBe('boolean');
    });
  });

  describe('interface parity with Claude provider', () => {
    it('should have name property set to openai (not claude)', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      expect(provider.name).toBe('openai');
      expect(provider.name).not.toBe('claude');
    });

    it('should implement all ITranslationProvider methods', async () => {
      delete process.env.OPENAI_API_KEY;

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      expect(typeof provider.isAvailable).toBe('function');
      expect(typeof provider.getRateLimitStatus).toBe('function');
      expect(typeof provider.translate).toBe('function');
      expect(typeof provider.translateBatch).toBe('function');
    });

    it('should use same rate limit env variable as Claude provider', async () => {
      delete process.env.OPENAI_API_KEY;
      process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE = '45';

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();
      const status = provider.getRateLimitStatus();

      // Both providers should share the same rate limit env variable
      expect(status.limit).toBe(45);
    });
  });

  describe('provider differences from Claude', () => {
    it('should use OPENAI_API_KEY not ANTHROPIC_API_KEY', async () => {
      // Set Anthropic key but not OpenAI key
      delete process.env.OPENAI_API_KEY;
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      // Should be unavailable because OPENAI_API_KEY is missing
      expect(provider.isAvailable()).toBe(false);
    });

    it('should use OPENAI_TRANSLATION_MODEL for model configuration', async () => {
      delete process.env.OPENAI_API_KEY;
      process.env.OPENAI_TRANSLATION_MODEL = 'gpt-4-turbo';

      const { OpenAITranslationProvider } = await import('../openai-provider');
      const provider = new OpenAITranslationProvider();

      // Model is private but provider should initialize without error
      expect(provider.name).toBe('openai');
    });
  });
});
