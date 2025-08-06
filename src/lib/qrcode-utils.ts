import { getQRDomain, buildQRUrl, validateDomainConfig } from './config';

// Re-export config functions for backward compatibility
export { buildQRUrl } from './config';

/**
 * QR Code Utilities with Domain Configuration
 * Part of REQ-016: Domain Configuration for QR Links and System Admin Back Office
 */

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  domain?: string; // Override domain for this specific QR code
}

export interface QRCodeGenerationResult {
  success: boolean;
  dataUrl?: string;
  url: string;
  error?: string;
  metadata: {
    domain: string;
    domainSource: 'override' | 'config' | 'fallback';
    timestamp: string;
  };
}

/**
 * Generate QR code for an item with domain configuration
 */
export async function generateQRCodeForItem(
  publicId: string, 
  options: QRCodeOptions = {}
): Promise<QRCodeGenerationResult> {
  try {
    // Determine domain to use
    let domain: string;
    let domainSource: 'override' | 'config' | 'fallback';

    if (options.domain) {
      if (!validateDomainConfig(options.domain)) {
        return {
          success: false,
          url: '',
          error: 'Invalid domain configuration provided',
          metadata: {
            domain: '',
            domainSource: 'override',
            timestamp: new Date().toISOString()
          }
        };
      }
      domain = options.domain;
      domainSource = 'override';
    } else {
      domain = getQRDomain();
      domainSource = process.env.NEXT_PUBLIC_QR_DOMAIN_OVERRIDE ? 'config' : 'fallback';
    }

    // Build the full URL
    const fullUrl = `${domain}/item/${publicId}`;
    
    const result: QRCodeGenerationResult = {
      success: true,
      url: fullUrl,
      dataUrl: `data:image/svg+xml;base64,${Buffer.from(createMockQRSVG(fullUrl)).toString('base64')}`,
      metadata: {
        domain,
        domainSource,
        timestamp: new Date().toISOString()
      }
    };

    return result;

  } catch (error) {
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        domain: '',
        domainSource: 'fallback',
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Validate QR code generation configuration
 */
export function validateQRConfiguration(): {
  isValid: boolean;
  issues: string[];
  configuration: {
    domainOverride?: string;
    fallbackDomain: string;
    isSecure: boolean;
  };
} {
  const issues: string[] = [];
  const domainOverride = process.env.NEXT_PUBLIC_QR_DOMAIN_OVERRIDE;
  const fallbackDomain = getQRDomain();

  if (domainOverride && !validateDomainConfig(domainOverride)) {
    issues.push('Domain override is not a valid HTTPS URL');
  }

  const isSecure = fallbackDomain.startsWith('https://');
  if (!isSecure && !fallbackDomain.includes('localhost')) {
    issues.push('Fallback domain is not HTTPS');
  }

  return {
    isValid: issues.length === 0,
    issues,
    configuration: {
      domainOverride: domainOverride || undefined,
      fallbackDomain,
      isSecure
    }
  };
}

/**
 * Create a mock QR code SVG for development/testing
 */
function createMockQRSVG(url: string): string {
  const size = 200;
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#ffffff"/>
    <rect x="20" y="20" width="160" height="160" fill="#000000"/>
    <rect x="30" y="30" width="140" height="140" fill="#ffffff"/>
    <text x="100" y="100" text-anchor="middle" fill="#000000" font-size="8">QR: ${url}</text>
  </svg>`;
}

/**
 * Generate batch QR codes for multiple items
 */
export async function generateBatchQRCodes(
  publicIds: string[],
  options: QRCodeOptions = {}
): Promise<QRCodeGenerationResult[]> {
  const results: QRCodeGenerationResult[] = [];
  
  for (const publicId of publicIds) {
    const result = await generateQRCodeForItem(publicId, options);
    results.push(result);
  }
  
  return results;
}

/**
 * Clear QR cache (placeholder for future caching implementation)
 */
export function clearQRCache(): void {
  console.log('QR cache cleared');
}