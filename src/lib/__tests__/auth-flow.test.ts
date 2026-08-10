import { describe, expect, it } from 'vitest';
import {
  AUTH_BODY_LIMIT_BYTES,
  PASSWORD_RULE_MESSAGE,
  parseJsonRequest,
  passwordSchema,
  registerRequestSchema,
} from '@/lib/auth-flow';
import { getTrustedAppOrigin, isTrustedAuthMutation } from '@/lib/auth-origin';
import { createRecoveryIntent, isRecoveryIntent, RECOVERY_INTENT_MAX_AGE_SECONDS } from '@/lib/recovery-intent';
import { createOAuthState, isOAuthState, OAUTH_STATE_MAX_AGE_SECONDS } from '@/lib/oauth-state';

describe('canonical auth validation', () => {
  it('applies one understandable password rule on client and server schemas', () => {
    expect(passwordSchema.safeParse('short1').success).toBe(false);
    expect(passwordSchema.safeParse('letters-only-password').success).toBe(false);
    expect(passwordSchema.safeParse('host-guide-2026').success).toBe(true);
    expect(PASSWORD_RULE_MESSAGE).toContain('10 to 128');
    expect(registerRequestSchema.safeParse({
      displayName: '  Example   Host ', email: 'HOST@EXAMPLE.TEST',
      password: 'host-guide-2026', confirmPassword: 'host-guide-2026',
    })).toMatchObject({ success: true, data: { displayName: 'Example Host', email: 'host@example.test' } });
  });

  it('rejects mismatched passwords, extra authority fields, malformed and oversized JSON', async () => {
    expect(registerRequestSchema.safeParse({
      email: 'host@example.test', password: 'host-guide-2026', confirmPassword: 'different-2026', role: 'admin',
    }).success).toBe(false);
    expect((await parseJsonRequest(new Request('http://local', { method: 'POST', body: '{' }), registerRequestSchema)).success).toBe(false);
    expect((await parseJsonRequest(new Request('http://local', {
      method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}',
    }), registerRequestSchema)).success).toBe(false);
    const oversized = JSON.stringify({ value: 'x'.repeat(AUTH_BODY_LIMIT_BYTES) });
    expect((await parseJsonRequest(new Request('http://local', { method: 'POST', body: oversized }), registerRequestSchema)).success).toBe(false);
  });

  it('requires the configured same origin for browser auth mutations', () => {
    const original = process.env.APP_ORIGIN;
    process.env.APP_ORIGIN = 'https://app.example.test';
    expect(isTrustedAuthMutation(new Request('https://internal/api', {
      headers: { origin: 'https://app.example.test' },
    }))).toBe(true);
    for (const origin of ['', 'null', 'https://evil.example', 'https://user:pass@app.example.test']) {
      const headers = origin ? { origin } : undefined;
      expect(isTrustedAuthMutation(new Request('https://internal/api', { headers }))).toBe(false);
    }
    if (original === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = original;
  });

  it('authenticates, binds, expires, and rejects tampered recovery proofs', () => {
    const original = process.env.AUTH_RECOVERY_PROOF_SECRET;
    process.env.AUTH_RECOVERY_PROOF_SECRET = 'test-only-recovery-proof-secret-with-at-least-32-bytes';
    const now = 1_800_000_000_000;
    const userId = '10000000-0000-4000-8000-000000000001';
    const proof = createRecoveryIntent(userId, now, '30000000-0000-4000-8000-000000000001');
    expect(isRecoveryIntent(proof, userId, now)).toBe(true);
    expect(isRecoveryIntent(proof, '10000000-0000-4000-8000-000000000002', now)).toBe(false);
    const replacement = proof.endsWith('0') ? '1' : '0';
    expect(isRecoveryIntent(`${proof.slice(0, -1)}${replacement}`, userId, now)).toBe(false);
    expect(isRecoveryIntent(proof, userId, now + (RECOVERY_INTENT_MAX_AGE_SECONDS + 1) * 1000)).toBe(false);
    process.env.AUTH_RECOVERY_PROOF_SECRET = 'too-short';
    expect(() => isRecoveryIntent(proof, userId, now)).toThrow();
    expect(() => createRecoveryIntent(userId, now)).toThrow();
    if (original === undefined) delete process.env.AUTH_RECOVERY_PROOF_SECRET;
    else process.env.AUTH_RECOVERY_PROOF_SECRET = original;
  });

  it('authenticates and expires OAuth state instead of trusting a UUID-shaped cookie', () => {
    const original = process.env.AUTH_OAUTH_STATE_SECRET;
    process.env.AUTH_OAUTH_STATE_SECRET = 'test-only-oauth-state-secret-with-at-least-32-bytes';
    const now = 1_800_000_000_000;
    const state = createOAuthState(now, '40000000-0000-4000-8000-000000000001');
    expect(isOAuthState(state, now)).toBe(true);
    expect(isOAuthState('40000000-0000-4000-8000-000000000001', now)).toBe(false);
    expect(isOAuthState(state, now + (OAUTH_STATE_MAX_AGE_SECONDS + 1) * 1000)).toBe(false);
    const replacement = state.endsWith('0') ? '1' : '0';
    expect(isOAuthState(`${state.slice(0, -1)}${replacement}`, now)).toBe(false);
    process.env.AUTH_OAUTH_STATE_SECRET = 'short';
    expect(() => isOAuthState(state, now)).toThrow();
    if (original === undefined) delete process.env.AUTH_OAUTH_STATE_SECRET;
    else process.env.AUTH_OAUTH_STATE_SECRET = original;
  });

  it('accepts only a configured origin without redirect-bearing parts', () => {
    const original = process.env.APP_ORIGIN;
    process.env.APP_ORIGIN = 'https://app.example.test';
    expect(getTrustedAppOrigin()).toBe('https://app.example.test');
    for (const unsafe of [
      'https://user:pass@app.example.test',
      'https://app.example.test/redirect',
      'https://app.example.test?next=evil',
      'https://app.example.test#fragment',
      'http://app.example.test',
    ]) {
      process.env.APP_ORIGIN = unsafe;
      expect(() => getTrustedAppOrigin()).toThrow();
    }
    process.env.APP_ORIGIN = 'http://localhost:3000';
    expect(getTrustedAppOrigin()).toBe('http://localhost:3000');
    if (original === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = original;
  });
});
