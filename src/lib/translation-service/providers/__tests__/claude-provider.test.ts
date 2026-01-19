/**
 * Unit Tests for Claude Translation Provider
 * REQ-236: AI-Powered Translation Provider with Domain Context
 *
 * @created 2026-01-18
 * @modified 2026-01-18
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original env
const originalEnv = { ...process.env };

describe('ClaudeTranslationProvider', () => {
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
      delete process.env.ANTHROPIC_API_KEY;

      const { ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = new ClaudeTranslationProvider();

      expect(provider.isAvailable()).toBe(false);
    });

    it('should have correct provider name', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const { ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = new ClaudeTranslationProvider();

      expect(provider.name).toBe('claude');
    });

    it('should use custom rate limit from environment', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE = '30';

      const { ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = new ClaudeTranslationProvider();
      const status = provider.getRateLimitStatus();

      expect(status.limit).toBe(30);
    });

    it('should use default rate limit when not specified', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE;

      const { ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = new ClaudeTranslationProvider();
      const status = provider.getRateLimitStatus();

      expect(status.limit).toBe(60);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return correct initial status', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const { ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = new ClaudeTranslationProvider();
      const status = provider.getRateLimitStatus();

      expect(status.remaining).toBe(60);
      expect(status.limit).toBe(60);
      expect(status.isLimited).toBe(false);
      expect(status.resetInSeconds).toBe(0);
    });

    it('should return correct initial status with custom limit', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      process.env.TRANSLATION_RATE_LIMIT_PER_MINUTE = '100';

      const { ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = new ClaudeTranslationProvider();
      const status = provider.getRateLimitStatus();

      expect(status.remaining).toBe(100);
      expect(status.limit).toBe(100);
      expect(status.isLimited).toBe(false);
    });
  });

  describe('translate', () => {
    it('should throw when provider is not available', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const { ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = new ClaudeTranslationProvider();

      await expect(
        provider.translate({
          text: 'Hello',
          sourceLanguage: 'en',
          targetLanguage: 'fr',
        })
      ).rejects.toThrow('not available');
    });
  });

  describe('translateBatch', () => {
    it('should throw when provider is not available', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const { ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = new ClaudeTranslationProvider();

      await expect(
        provider.translateBatch({
          text: 'Hello',
          sourceLanguage: 'en',
          targetLanguages: ['fr', 'es'],
        })
      ).rejects.toThrow('not available');
    });
  });

  describe('factory function', () => {
    it('should create a valid provider instance', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const { createClaudeProvider, ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = createClaudeProvider();

      expect(provider).toBeInstanceOf(ClaudeTranslationProvider);
      expect(provider.name).toBe('claude');
      expect(typeof provider.translate).toBe('function');
      expect(typeof provider.translateBatch).toBe('function');
      expect(typeof provider.isAvailable).toBe('function');
      expect(typeof provider.getRateLimitStatus).toBe('function');
    });

    it('should create instance without API key (unavailable state)', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const { createClaudeProvider, ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = createClaudeProvider();

      expect(provider).toBeInstanceOf(ClaudeTranslationProvider);
      expect(provider.isAvailable()).toBe(false);
    });
  });

  describe('interface compliance', () => {
    it('should implement ITranslationProvider interface', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const { ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = new ClaudeTranslationProvider();

      // Check all required interface methods exist
      expect(provider.name).toBe('claude');
      expect(typeof provider.translate).toBe('function');
      expect(typeof provider.translateBatch).toBe('function');
      expect(typeof provider.isAvailable).toBe('function');
      expect(typeof provider.getRateLimitStatus).toBe('function');
    });

    it('should return valid RateLimitStatus structure', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const { ClaudeTranslationProvider } = await import('../claude-provider');
      const provider = new ClaudeTranslationProvider();
      const status = provider.getRateLimitStatus();

      // Verify RateLimitStatus structure
      expect(typeof status.remaining).toBe('number');
      expect(typeof status.limit).toBe('number');
      expect(typeof status.resetInSeconds).toBe('number');
      expect(typeof status.isLimited).toBe('boolean');
    });
  });
});
