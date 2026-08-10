const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function getTrustedAppOrigin(): string {
  const configured = process.env.APP_ORIGIN || process.env.NEXT_PUBLIC_APP_URL;
  if (!configured) throw new Error('Trusted app origin is not configured');

  const url = new URL(configured);
  if (
    !ALLOWED_PROTOCOLS.has(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('Trusted app origin is invalid');
  }
  if (url.protocol === 'http:' && !LOOPBACK_HOSTS.has(url.hostname)) {
    throw new Error('Trusted app origin must use HTTPS outside loopback');
  }
  return url.origin;
}

export function trustedAuthUrl(path: '/auth/confirm'): string {
  return new URL(path, `${getTrustedAppOrigin()}/`).toString();
}

export function isTrustedAuthMutation(request: Request): boolean {
  const rawOrigin = request.headers.get('origin');
  if (!rawOrigin) return false;

  try {
    const origin = new URL(rawOrigin);
    return (
      !origin.username &&
      !origin.password &&
      origin.pathname === '/' &&
      !origin.search &&
      !origin.hash &&
      origin.origin === getTrustedAppOrigin()
    );
  } catch {
    return false;
  }
}

export function googleCompatibilityConfigured(): boolean {
  return Boolean(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.AUTH_OAUTH_STATE_SECRET &&
      Buffer.byteLength(process.env.AUTH_OAUTH_STATE_SECRET, 'utf8') >= 32 &&
      process.env.GOOGLE_EXISTING_USER_ONLY_VERIFIED === 'true'
  );
}
