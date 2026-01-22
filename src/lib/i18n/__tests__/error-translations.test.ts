/**
 * Unit Tests for Centralized Error Translation Utility
 * REQ-E02-035: Create Centralized Error Message Utility
 *
 * Tests the error translation utility functions for proper behavior,
 * fallback handling, and type-safety.
 *
 * @created 2026-01-22
 * @lastModified 2026-01-22
 */

import { describe, it, expect } from 'vitest';
import {
  getHttpErrorKey,
  getErrorCodeKey,
  getErrorCategory,
  ErrorCode,
} from '../error-translations';

describe('error-translations', () => {
  describe('getHttpErrorKey', () => {
    it('should return correct key for 400 Bad Request', () => {
      expect(getHttpErrorKey(400)).toBe('generic');
    });

    it('should return correct key for 401 Unauthorized', () => {
      expect(getHttpErrorKey(401)).toBe('unauthorized');
    });

    it('should return correct key for 403 Forbidden', () => {
      expect(getHttpErrorKey(403)).toBe('forbidden');
    });

    it('should return correct key for 404 Not Found', () => {
      expect(getHttpErrorKey(404)).toBe('notFound');
    });

    it('should return correct key for 409 Conflict', () => {
      expect(getHttpErrorKey(409)).toBe('conflict');
    });

    it('should return correct key for 429 Too Many Requests', () => {
      expect(getHttpErrorKey(429)).toBe('tooManyRequests');
    });

    it('should return timeout for 408 Request Timeout', () => {
      expect(getHttpErrorKey(408)).toBe('timeout');
    });

    it('should return timeout for 504 Gateway Timeout', () => {
      expect(getHttpErrorKey(504)).toBe('timeout');
    });

    it('should return serverError for 500', () => {
      expect(getHttpErrorKey(500)).toBe('serverError');
    });

    it('should return serverError for 502', () => {
      expect(getHttpErrorKey(502)).toBe('serverError');
    });

    it('should return serverError for 503', () => {
      expect(getHttpErrorKey(503)).toBe('serverError');
    });

    it('should return serverError for unknown status codes', () => {
      expect(getHttpErrorKey(418)).toBe('serverError'); // I'm a teapot
      expect(getHttpErrorKey(999)).toBe('serverError');
    });
  });

  describe('getErrorCodeKey', () => {
    it('should map VALIDATION_FAILED to form.required', () => {
      expect(getErrorCodeKey(ErrorCode.VALIDATION_FAILED)).toBe('form.required');
    });

    it('should map USER_ALREADY_REGISTERED to auth.emailTaken', () => {
      expect(getErrorCodeKey(ErrorCode.USER_ALREADY_REGISTERED)).toBe('auth.emailTaken');
    });

    it('should map INVALID_ACCESS_CODE to auth.invalidAccessCode', () => {
      expect(getErrorCodeKey(ErrorCode.INVALID_ACCESS_CODE)).toBe('auth.invalidAccessCode');
    });

    it('should map EMAIL_MISMATCH to auth.emailMismatch', () => {
      expect(getErrorCodeKey(ErrorCode.EMAIL_MISMATCH)).toBe('auth.emailMismatch');
    });

    it('should map NETWORK_ERROR to network.connectionFailed', () => {
      expect(getErrorCodeKey(ErrorCode.NETWORK_ERROR)).toBe('network.connectionFailed');
    });

    it('should map OAUTH_SESSION_EXPIRED to auth.sessionExpired', () => {
      expect(getErrorCodeKey(ErrorCode.OAUTH_SESSION_EXPIRED)).toBe('auth.sessionExpired');
    });

    it('should map OAUTH_REGISTRATION_CONFLICT to auth.emailTaken', () => {
      expect(getErrorCodeKey(ErrorCode.OAUTH_REGISTRATION_CONFLICT)).toBe('auth.emailTaken');
    });

    it('should map OAUTH_AUTHENTICATION_FAILED to auth.invalidCredentials', () => {
      expect(getErrorCodeKey(ErrorCode.OAUTH_AUTHENTICATION_FAILED)).toBe('auth.invalidCredentials');
    });
  });

  describe('getErrorCategory', () => {
    it('should categorize VALIDATION_FAILED as form', () => {
      expect(getErrorCategory(ErrorCode.VALIDATION_FAILED)).toBe('form');
    });

    it('should categorize auth-related errors as auth', () => {
      expect(getErrorCategory(ErrorCode.USER_ALREADY_REGISTERED)).toBe('auth');
      expect(getErrorCategory(ErrorCode.INVALID_ACCESS_CODE)).toBe('auth');
      expect(getErrorCategory(ErrorCode.EMAIL_MISMATCH)).toBe('auth');
      expect(getErrorCategory(ErrorCode.OAUTH_SESSION_EXPIRED)).toBe('auth');
      expect(getErrorCategory(ErrorCode.OAUTH_REGISTRATION_CONFLICT)).toBe('auth');
      expect(getErrorCategory(ErrorCode.OAUTH_AUTHENTICATION_FAILED)).toBe('auth');
    });

    it('should categorize NETWORK_ERROR as network', () => {
      expect(getErrorCategory(ErrorCode.NETWORK_ERROR)).toBe('network');
    });
  });
});

// Note: Testing useErrorTranslations() and getErrorTranslations() requires
// mocking next-intl which is complex. These tests focus on the pure helper
// functions that don't depend on next-intl context.
//
// For integration testing of the hooks, see:
// - Component tests that render with NextIntlClientProvider
// - API route tests that mock getTranslations
