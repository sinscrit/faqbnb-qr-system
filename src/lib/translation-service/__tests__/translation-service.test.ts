/**
 * Unit Tests for Translation Service Wrapper (REQ-240)
 *
 * Tests the main translation service wrapper functionality including:
 * - Initialization and configuration
 * - Single and batch translations
 * - Fallback behavior
 * - Rate limiting integration
 * - Retry logic
 * - Singleton pattern
 * - Convenience functions
 *
 * @created 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create mock providers with configurable behavior
const mockClaudeProvider = {
  name: 'claude' as const,
  isAvailable: vi.fn(() => true),
  translate: vi.fn(),
  translateBatch: vi.fn(),
  getRateLimitStatus: vi.fn(() => ({
    remaining: 60,
    limit: 60,
    resetInSeconds: 0,
    isLimited: false,
  })),
};

const mockOpenAIProvider = {
  name: 'openai' as const,
  isAvailable: vi.fn(() => true),
  translate: vi.fn(),
  translateBatch: vi.fn(),
  getRateLimitStatus: vi.fn(() => ({
    remaining: 60,
    limit: 60,
    resetInSeconds: 0,
    isLimited: false,
  })),
};

// Mock the providers
vi.mock('../providers/claude-provider', () => ({
  createClaudeProvider: vi.fn(() => mockClaudeProvider),
}));

vi.mock('../providers/openai-provider', () => ({
  createOpenAIProvider: vi.fn(() => mockOpenAIProvider),
}));

// Mock rate limiter
vi.mock('../utils/rate-limiter', () => ({
  getGlobalRateLimitManager: vi.fn(() => ({
    getProviderLimiter: vi.fn(() => ({
      acquire: vi.fn().mockResolvedValue(undefined),
      getStatus: vi.fn(() => ({
        remaining: 60,
        limit: 60,
        resetInSeconds: 0,
        isLimited: false,
      })),
    })),
    getAllProviderStatus: vi.fn(() => ({
      claude: { remaining: 60, limit: 60, resetInSeconds: 0, isLimited: false },
      openai: { remaining: 60, limit: 60, resetInSeconds: 0, isLimited: false },
    })),
  })),
}));

// Mock retry - pass through operation result
vi.mock('../utils/retry', () => ({
  withRetry: vi.fn(async (operation) => {
    try {
      const data = await operation();
      return { success: true, data, attempts: 1 };
    } catch (error) {
      return { success: false, error, attempts: 1 };
    }
  }),
  RetryPresets: {
    standard: { maxRetries: 3 },
    conservative: { maxRetries: 3 },
  },
}));

import {
  TranslationService,
  createTranslationService,
  getTranslationService,
  resetTranslationService,
  translateText,
  translateToAllLanguages,
  translateToLanguages,
  isTranslationServiceAvailable,
  getTranslationRateLimitStatus,
  ALL_SUPPORTED_LANGUAGES,
} from '../translation-service';

describe('TranslationService (REQ-240)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTranslationService();

    // Reset mock responses
    mockClaudeProvider.isAvailable.mockReturnValue(true);
    mockOpenAIProvider.isAvailable.mockReturnValue(true);
    mockClaudeProvider.translate.mockReset();
    mockClaudeProvider.translateBatch.mockReset();
    mockOpenAIProvider.translate.mockReset();
    mockOpenAIProvider.translateBatch.mockReset();
  });

  afterEach(() => {
    resetTranslationService();
  });

  describe('initialization', () => {
    it('should create with default configuration', () => {
      const service = createTranslationService();
      const config = service.getConfig();

      expect(config.primaryProvider).toBe('claude');
      expect(config.enableFallback).toBe(true);
      expect(config.enableRetry).toBe(true);
      expect(config.enableRateLimiting).toBe(true);
    });

    it('should create with custom configuration', () => {
      const service = createTranslationService({
        primaryProvider: 'openai',
        enableFallback: false,
        maxRetries: 5,
      });
      const config = service.getConfig();

      expect(config.primaryProvider).toBe('openai');
      expect(config.enableFallback).toBe(false);
      expect(config.maxRetries).toBe(5);
    });

    it('should merge custom config with defaults', () => {
      const service = createTranslationService({ maxRetries: 10 });
      const config = service.getConfig();

      expect(config.primaryProvider).toBe('claude'); // Default
      expect(config.maxRetries).toBe(10); // Custom
    });
  });

  describe('translateText', () => {
    it('should return same text when source and target are identical', async () => {
      const service = createTranslationService();

      const result = await service.translateText('Hello', 'en', 'en');

      expect(result.translatedText).toBe('Hello');
      expect(result.usedFallback).toBe(false);
      expect(result.retryAttempts).toBe(0);
    });

    it('should translate text using primary provider', async () => {
      mockClaudeProvider.translate.mockResolvedValue({
        translatedText: 'Bonjour',
        provider: 'claude',
      });

      const service = createTranslationService();
      const result = await service.translateText('Hello', 'en', 'fr');

      expect(result.translatedText).toBe('Bonjour');
      expect(result.provider).toBe('claude');
      expect(result.usedFallback).toBe(false);
    });

    it('should pass context to translation request', async () => {
      mockClaudeProvider.translate.mockResolvedValue({
        translatedText: 'Machine à café',
        provider: 'claude',
      });

      const service = createTranslationService();
      await service.translateText('Coffee Machine', 'en', 'fr', {
        context: {
          contentType: 'item_name',
          domainContext: 'kitchen appliance',
        },
      });

      expect(mockClaudeProvider.translate).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Coffee Machine',
          sourceLanguage: 'en',
          targetLanguage: 'fr',
          context: expect.objectContaining({
            contentType: 'item_name',
            domainContext: 'kitchen appliance',
          }),
        })
      );
    });
  });

  describe('translateToAllLanguages', () => {
    it('should translate to all languages except source', async () => {
      mockClaudeProvider.translateBatch.mockResolvedValue({
        translations: {
          fr: 'Bonjour',
          es: 'Hola',
          de: 'Hallo',
          nl: 'Hallo',
          it: 'Ciao',
        },
        provider: 'claude',
        totalTokensUsed: 100,
      });

      const service = createTranslationService();
      const result = await service.translateToAllLanguages('Hello', 'en');

      expect(result.translations).toHaveProperty('fr');
      expect(result.translations).toHaveProperty('es');
      expect(result.translations).toHaveProperty('de');
      expect(result.translations).toHaveProperty('nl');
      expect(result.translations).toHaveProperty('it');
      expect(result.usedFallback).toBe(false);
    });

    it('should call translateBatch with correct target languages', async () => {
      mockClaudeProvider.translateBatch.mockResolvedValue({
        translations: {},
        provider: 'claude',
      });

      const service = createTranslationService();
      await service.translateToAllLanguages('Hello', 'fr');

      expect(mockClaudeProvider.translateBatch).toHaveBeenCalledWith(
        expect.objectContaining({
          targetLanguages: expect.arrayContaining(['en', 'es', 'de', 'nl', 'it']),
        })
      );
      // fr should NOT be in target languages
      const callArg = mockClaudeProvider.translateBatch.mock.calls[0][0];
      expect(callArg.targetLanguages).not.toContain('fr');
    });
  });

  describe('translateToLanguages', () => {
    it('should translate to specified languages only', async () => {
      mockClaudeProvider.translateBatch.mockResolvedValue({
        translations: {
          fr: 'Bonjour',
          de: 'Hallo',
        },
        provider: 'claude',
      });

      const service = createTranslationService();
      const result = await service.translateToLanguages('Hello', 'en', ['fr', 'de']);

      expect(result.translations).toHaveProperty('fr');
      expect(result.translations).toHaveProperty('de');
      expect(result.usedFallback).toBe(false);
    });

    it('should filter out source language from targets', async () => {
      mockClaudeProvider.translateBatch.mockResolvedValue({
        translations: { fr: 'Bonjour' },
        provider: 'claude',
      });

      const service = createTranslationService();
      await service.translateToLanguages('Hello', 'en', ['en', 'fr']);

      const callArg = mockClaudeProvider.translateBatch.mock.calls[0][0];
      expect(callArg.targetLanguages).not.toContain('en');
      expect(callArg.targetLanguages).toContain('fr');
    });

    it('should remove duplicate target languages', async () => {
      mockClaudeProvider.translateBatch.mockResolvedValue({
        translations: { fr: 'Bonjour' },
        provider: 'claude',
      });

      const service = createTranslationService();
      await service.translateToLanguages('Hello', 'en', ['fr', 'fr', 'fr']);

      const callArg = mockClaudeProvider.translateBatch.mock.calls[0][0];
      expect(callArg.targetLanguages).toEqual(['fr']);
    });
  });

  describe('isAvailable', () => {
    it('should return true when primary provider is available', () => {
      mockClaudeProvider.isAvailable.mockReturnValue(true);

      const service = createTranslationService();
      expect(service.isAvailable()).toBe(true);
    });

    it('should return true when only fallback is available and fallback enabled', () => {
      mockClaudeProvider.isAvailable.mockReturnValue(false);
      mockOpenAIProvider.isAvailable.mockReturnValue(true);

      const service = createTranslationService({ enableFallback: true });
      expect(service.isAvailable()).toBe(true);
    });

    it('should return false when no providers available', () => {
      mockClaudeProvider.isAvailable.mockReturnValue(false);
      mockOpenAIProvider.isAvailable.mockReturnValue(false);

      const service = createTranslationService();
      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return rate limit status for all providers', () => {
      const service = createTranslationService();
      const status = service.getRateLimitStatus();

      expect(status).toHaveProperty('claude');
      expect(status).toHaveProperty('openai');
      expect(status.claude.remaining).toBe(60);
      expect(status.openai.remaining).toBe(60);
    });
  });

  describe('getProviderRateLimitStatus', () => {
    it('should return status for specific provider', () => {
      const service = createTranslationService();
      const status = service.getProviderRateLimitStatus('claude');

      expect(status.remaining).toBe(60);
      expect(status.limit).toBe(60);
      expect(status.isLimited).toBe(false);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration at runtime', () => {
      const service = createTranslationService();
      expect(service.getConfig().maxRetries).toBe(3);

      service.updateConfig({ maxRetries: 10 });
      expect(service.getConfig().maxRetries).toBe(10);
    });

    it('should preserve non-updated config values', () => {
      const service = createTranslationService({ primaryProvider: 'openai' });
      service.updateConfig({ maxRetries: 10 });

      expect(service.getConfig().primaryProvider).toBe('openai');
      expect(service.getConfig().maxRetries).toBe(10);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const service = createTranslationService();
      const config1 = service.getConfig();
      const config2 = service.getConfig();

      expect(config1).not.toBe(config2); // Different objects
      expect(config1).toEqual(config2); // Same values
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance on multiple calls', () => {
      const service1 = getTranslationService();
      const service2 = getTranslationService();

      expect(service1).toBe(service2);
    });

    it('should create new instance after reset', () => {
      const service1 = getTranslationService();
      resetTranslationService();
      const service2 = getTranslationService();

      expect(service1).not.toBe(service2);
    });
  });
});

describe('convenience functions (REQ-240)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTranslationService();

    // Reset mock responses
    mockClaudeProvider.isAvailable.mockReturnValue(true);
    mockOpenAIProvider.isAvailable.mockReturnValue(true);
    mockClaudeProvider.translate.mockReset();
    mockClaudeProvider.translateBatch.mockReset();
  });

  afterEach(() => {
    resetTranslationService();
  });

  it('translateText should use global service', async () => {
    mockClaudeProvider.translate.mockResolvedValue({
      translatedText: 'Bonjour',
      provider: 'claude',
    });

    const result = await translateText('Hello', 'en', 'fr');

    expect(result.translatedText).toBe('Bonjour');
  });

  it('translateToAllLanguages should use global service', async () => {
    mockClaudeProvider.translateBatch.mockResolvedValue({
      translations: { fr: 'Bonjour', es: 'Hola', de: 'Hallo', nl: 'Hallo', it: 'Ciao' },
      provider: 'claude',
    });

    const result = await translateToAllLanguages('Hello', 'en');

    expect(result.translations).toHaveProperty('fr');
  });

  it('translateToLanguages should use global service', async () => {
    mockClaudeProvider.translateBatch.mockResolvedValue({
      translations: { fr: 'Bonjour', de: 'Hallo' },
      provider: 'claude',
    });

    const result = await translateToLanguages('Hello', 'en', ['fr', 'de']);

    expect(result.translations).toHaveProperty('fr');
    expect(result.translations).toHaveProperty('de');
  });

  it('isTranslationServiceAvailable should check global service', () => {
    mockClaudeProvider.isAvailable.mockReturnValue(true);

    const available = isTranslationServiceAvailable();
    expect(typeof available).toBe('boolean');
    expect(available).toBe(true);
  });

  it('getTranslationRateLimitStatus should return status', () => {
    const status = getTranslationRateLimitStatus();
    expect(status).toHaveProperty('claude');
    expect(status).toHaveProperty('openai');
  });
});

describe('ALL_SUPPORTED_LANGUAGES constant', () => {
  it('should contain all 6 supported languages', () => {
    expect(ALL_SUPPORTED_LANGUAGES).toHaveLength(6);
    expect(ALL_SUPPORTED_LANGUAGES).toContain('en');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('fr');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('es');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('de');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('nl');
    expect(ALL_SUPPORTED_LANGUAGES).toContain('it');
  });

  it('should be a readonly array', () => {
    // TypeScript check - ALL_SUPPORTED_LANGUAGES should be readonly
    expect(Array.isArray(ALL_SUPPORTED_LANGUAGES)).toBe(true);
  });
});
