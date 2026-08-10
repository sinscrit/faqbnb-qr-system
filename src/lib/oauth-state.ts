import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const OAUTH_STATE_COOKIE = 'faqbnb_oauth_state';
export const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;
const VERSION = 'v1';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function secret(): string {
  const value = process.env.AUTH_OAUTH_STATE_SECRET;
  if (!value || Buffer.byteLength(value, 'utf8') < 32) {
    throw new Error('OAuth state secret is not configured safely');
  }
  return value;
}

function sign(timestamp: string, nonce: string): string {
  return createHmac('sha256', secret())
    .update(`${VERSION}\n${timestamp}\n${nonce}`)
    .digest('hex');
}

export function createOAuthState(nowMs = Date.now(), nonce = randomUUID()): string {
  if (!UUID_PATTERN.test(nonce)) throw new Error('OAuth state nonce is invalid');
  const timestamp = Math.floor(nowMs / 1000).toString();
  return `${VERSION}.${timestamp}.${nonce}.${sign(timestamp, nonce)}`;
}

export function isOAuthState(value: string | undefined, nowMs = Date.now()): boolean {
  if (!value) return false;
  const [version, timestamp, nonce, receivedSignature, ...extra] = value.split('.');
  if (
    extra.length ||
    version !== VERSION ||
    !/^\d{10}$/.test(timestamp || '') ||
    !UUID_PATTERN.test(nonce || '') ||
    !/^[0-9a-f]{64}$/.test(receivedSignature || '')
  ) {
    return false;
  }
  const issuedAt = Number(timestamp);
  const now = Math.floor(nowMs / 1000);
  if (issuedAt > now + 30 || now - issuedAt > OAUTH_STATE_MAX_AGE_SECONDS) return false;
  const expected = Buffer.from(sign(timestamp, nonce), 'hex');
  const received = Buffer.from(receivedSignature, 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}
