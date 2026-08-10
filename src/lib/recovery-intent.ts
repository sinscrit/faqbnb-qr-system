import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const RECOVERY_INTENT_COOKIE = 'faqbnb_recovery_intent';
export const RECOVERY_INTENT_MAX_AGE_SECONDS = 10 * 60;
const RECOVERY_INTENT_VERSION = 'v1';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SIGNATURE_PATTERN = /^[0-9a-f]{64}$/;

function getRecoveryProofSecret(): string {
  const secret = process.env.AUTH_RECOVERY_PROOF_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('Recovery proof secret is not configured safely');
  }
  return secret;
}

function signature(timestamp: string, nonce: string, userId: string): string {
  return createHmac('sha256', getRecoveryProofSecret())
    .update(`${RECOVERY_INTENT_VERSION}\n${timestamp}\n${nonce}\n${userId}`)
    .digest('hex');
}

export function createRecoveryIntent(
  userId: string,
  nowMs = Date.now(),
  nonce = randomUUID()
): string {
  if (!UUID_PATTERN.test(userId) || !UUID_PATTERN.test(nonce)) {
    throw new Error('Recovery proof inputs are invalid');
  }
  const timestamp = Math.floor(nowMs / 1000).toString();
  return `${RECOVERY_INTENT_VERSION}.${timestamp}.${nonce}.${signature(timestamp, nonce, userId)}`;
}

export function isRecoveryIntent(
  value: string | undefined,
  userId: string,
  nowMs = Date.now()
): boolean {
  if (!value || !UUID_PATTERN.test(userId)) return false;
  const [version, timestamp, nonce, receivedSignature, ...extra] = value.split('.');
  if (
    extra.length ||
    version !== RECOVERY_INTENT_VERSION ||
    !/^\d{10}$/.test(timestamp || '') ||
    !UUID_PATTERN.test(nonce || '') ||
    !SIGNATURE_PATTERN.test(receivedSignature || '')
  ) {
    return false;
  }

  const issuedAt = Number(timestamp);
  const now = Math.floor(nowMs / 1000);
  if (issuedAt > now + 30 || now - issuedAt > RECOVERY_INTENT_MAX_AGE_SECONDS) {
    return false;
  }

  const expected = Buffer.from(signature(timestamp, nonce, userId), 'hex');
  const received = Buffer.from(receivedSignature, 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}
