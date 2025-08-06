// Domain Configuration Utilities for QR Code Generation
// Part of REQ-016: Domain Configuration for QR Links and System Admin Back Office

/**
 * Get the domain override from environment variables
 * @returns Domain override URL or null if not set
 */
export function getDomainOverride(): string | null {
  return process.env.NEXT_PUBLIC_QR_DOMAIN_OVERRIDE || null;
}

/**
 * Get the QR domain for QR code generation
 * Falls back to window.location.origin if no override is set
 * @returns Domain URL for QR code generation
 */
export function getQRDomain(): string {
  const override = getDomainOverride();
  
  if (override) {
    return override;
  }
  
  // Fallback to current origin in browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side fallback (should not happen in production)
  return 'https://localhost:3000';
}

/**
 * Validate domain configuration
 * @param domain Domain to validate
 * @returns true if domain is valid, false otherwise
 */
export function validateDomainConfig(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false;
  }
  
  try {
    const url = new URL(domain);
    // Require HTTPS protocol for security
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Build QR code URL for an item
 * @param publicId Public ID of the item
 * @returns Full URL for the QR code
 */
export function buildQRUrl(publicId: string): string {
  const domain = getQRDomain();
  return `${domain}/item/${publicId}`;
}