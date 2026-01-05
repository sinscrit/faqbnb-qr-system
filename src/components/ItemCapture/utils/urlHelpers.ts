/**
 * URL Helper Utilities
 *
 * Functions for URL detection, parsing, and YouTube-specific handling.
 *
 * @module ItemCapture/utils/urlHelpers
 * @lastModified 2026-01-05 (REQ-092 Task 2)
 */

// =============================================================================
// YouTube URL Patterns
// =============================================================================

/**
 * Regular expression patterns for matching various YouTube URL formats.
 */
const YOUTUBE_PATTERNS = {
  standard: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  short: /^(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  embed: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  shorts: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
};

// =============================================================================
// YouTube Detection and Parsing
// =============================================================================

/**
 * Check if a URL is a YouTube video URL.
 *
 * Supports multiple YouTube URL formats:
 * - Standard: https://www.youtube.com/watch?v=VIDEO_ID
 * - Short: https://youtu.be/VIDEO_ID
 * - Embed: https://www.youtube.com/embed/VIDEO_ID
 * - Shorts: https://www.youtube.com/shorts/VIDEO_ID
 *
 * @param url - The URL to check
 * @returns True if the URL matches any YouTube video pattern
 *
 * @example
 * isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // true
 * isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ') // true
 * isYouTubeUrl('https://www.google.com') // false
 */
export function isYouTubeUrl(url: string): boolean {
  return Object.values(YOUTUBE_PATTERNS).some((pattern) => pattern.test(url));
}

/**
 * Extract the YouTube video ID from a URL.
 *
 * Handles all standard YouTube URL formats and returns the 11-character video ID.
 *
 * @param url - The YouTube URL to parse
 * @returns The 11-character video ID, or null if not found
 *
 * @example
 * extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
 * extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
 * extractYouTubeVideoId('https://www.google.com') // null
 */
export function extractYouTubeVideoId(url: string): string | null {
  for (const pattern of Object.values(YOUTUBE_PATTERNS)) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Get the thumbnail URL for a YouTube video.
 *
 * Uses YouTube's public thumbnail API to generate a thumbnail URL.
 * Quality options:
 * - default: 120x90
 * - mq (medium): 320x180
 * - hq (high): 480x360
 * - sd (standard): 640x480
 * - maxres: 1280x720
 *
 * @param videoId - The 11-character YouTube video ID
 * @param quality - The thumbnail quality (default: 'hq')
 * @returns The public YouTube thumbnail URL
 *
 * @example
 * getYouTubeThumbnailUrl('dQw4w9WgXcQ') // 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
 * getYouTubeThumbnailUrl('dQw4w9WgXcQ', 'maxres') // 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'
): string {
  const qualityMap = {
    default: 'default',
    mq: 'mqdefault',
    hq: 'hqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

// =============================================================================
// URL Parsing and Validation
// =============================================================================

/**
 * Extract the domain name from a URL.
 *
 * Removes protocol and www prefix, returning just the domain.
 *
 * @param url - The URL to parse
 * @returns The domain name (e.g., "youtube.com")
 *
 * @example
 * extractDomain('https://www.youtube.com/watch?v=xyz') // 'youtube.com'
 * extractDomain('http://docs.google.com/file') // 'docs.google.com'
 * extractDomain('invalid') // 'invalid'
 */
export function extractDomain(url: string): string {
  try {
    // Normalize URL first to ensure protocol exists
    const normalized = normalizeUrl(url);
    const parsed = new URL(normalized);
    // Remove 'www.' prefix if present
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    // If URL parsing fails, try simple regex extraction
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\?#]+)/);
    return match ? match[1] : url;
  }
}

/**
 * Validate URL format and check for security issues.
 *
 * Checks for:
 * - Valid URL format
 * - Valid protocol (http/https)
 * - Blocked dangerous protocols (javascript:, data:, file:, vbscript:)
 *
 * @param url - The URL to validate
 * @returns Validation result with isValid flag and optional error message
 *
 * @example
 * validateUrlFormat('https://example.com') // { isValid: true }
 * validateUrlFormat('javascript:alert(1)') // { isValid: false, error: 'Blocked protocol: javascript:' }
 * validateUrlFormat('not a url') // { isValid: false, error: 'Invalid URL format' }
 */
export function validateUrlFormat(url: string): { isValid: boolean; error?: string } {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  // Blocked protocols for security
  const blockedProtocols = ['javascript:', 'data:', 'file:', 'vbscript:'];
  const lowerUrl = url.toLowerCase().trim();

  for (const protocol of blockedProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return { isValid: false, error: `Blocked protocol: ${protocol}` };
    }
  }

  // Try to parse as URL
  try {
    const normalized = normalizeUrl(url);
    const parsed = new URL(normalized);

    // Check for valid protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Only http and https URLs are allowed' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Classify a URL into a link type category.
 *
 * Classification is based on URL patterns and optional MIME type.
 *
 * @param url - The URL to classify
 * @param mimeType - Optional MIME type from HTTP response
 * @returns The classified link type
 *
 * @example
 * classifyLinkType('https://www.youtube.com/watch?v=xyz') // 'youtube'
 * classifyLinkType('https://example.com/file.pdf') // 'pdf'
 * classifyLinkType('https://example.com/image.jpg') // 'image'
 * classifyLinkType('https://example.com', 'text/html') // 'text'
 */
export function classifyLinkType(
  url: string,
  mimeType?: string
): 'youtube' | 'pdf' | 'image' | 'text' | 'generic' {
  // Check for YouTube first
  if (isYouTubeUrl(url)) {
    return 'youtube';
  }

  // Check URL extension
  const urlLower = url.toLowerCase();

  if (urlLower.match(/\.pdf(\?|#|$)/)) {
    return 'pdf';
  }

  if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|#|$)/i)) {
    return 'image';
  }

  // Check MIME type if provided
  if (mimeType) {
    if (mimeType.startsWith('application/pdf')) {
      return 'pdf';
    }
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    if (mimeType.startsWith('text/')) {
      return 'text';
    }
  }

  // Default to generic
  return 'generic';
}

/**
 * Normalize a URL by adding https:// if no protocol is present.
 *
 * Also trims whitespace.
 *
 * @param url - The URL to normalize
 * @returns The normalized URL with protocol
 *
 * @example
 * normalizeUrl('example.com') // 'https://example.com'
 * normalizeUrl('  http://example.com  ') // 'http://example.com'
 * normalizeUrl('https://example.com') // 'https://example.com'
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();

  // Check if URL already has a protocol
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return trimmed;
  }

  // Add https:// if no protocol
  return `https://${trimmed}`;
}
