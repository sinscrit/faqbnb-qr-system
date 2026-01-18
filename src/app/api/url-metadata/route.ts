/**
 * URL Metadata API Route
 *
 * Server-side endpoint for fetching URL metadata to avoid CORS issues.
 * Extracts Open Graph tags, title, description, favicon, and thumbnail.
 *
 * @module api/url-metadata
 * @lastModified 2026-01-05 (REQ-092 Task 4)
 */

import { NextRequest, NextResponse } from 'next/server';
import type { UrlMetadata } from '@/components/ItemCapture/ItemCapture.types';
import {
  isYouTubeUrl,
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  extractDomain,
  classifyLinkType,
} from '@/components/ItemCapture/utils/urlHelpers';
import { URL_CONSTRAINTS } from '@/components/ItemCapture/utils/constants';

// =============================================================================
// Validation Helper
// =============================================================================

/**
 * Validate URL format and check for security issues (SSRF prevention).
 */
function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  if (url.length > URL_CONSTRAINTS.maxUrlLength) {
    return { isValid: false, error: `URL exceeds ${URL_CONSTRAINTS.maxUrlLength} character limit` };
  }

  // Check for blocked protocols
  const lowerUrl = url.toLowerCase().trim();
  for (const protocol of URL_CONSTRAINTS.blockedProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return { isValid: false, error: `Blocked protocol: ${protocol}` };
    }
  }

  // Parse URL to ensure it's valid
  try {
    const parsed = new URL(url);

    // Check if protocol is allowed
    if (!URL_CONSTRAINTS.allowedProtocols.includes(parsed.protocol as any)) {
      return { isValid: false, error: 'Only http and https URLs are allowed' };
    }

    // Block localhost/private IPs for SSRF prevention
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.includes('local')
    ) {
      return { isValid: false, error: 'Local and private IP addresses are not allowed' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

// =============================================================================
// HTML Parsing Helpers
// =============================================================================

/**
 * Extract Open Graph tags from HTML.
 */
function parseOpenGraphTags(html: string): {
  title?: string;
  description?: string;
  image?: string;
} {
  const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
  const ogDescription = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
  const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);

  return {
    title: ogTitle?.[1],
    description: ogDescription?.[1],
    image: ogImage?.[1],
  };
}

/**
 * Extract title from HTML <title> tag.
 */
function extractTitle(html: string): string | undefined {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch?.[1]?.trim();
}

/**
 * Extract description from meta tags.
 */
function extractDescription(html: string): string | undefined {
  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
  return descMatch?.[1];
}

/**
 * Extract favicon from link tags or default to /favicon.ico.
 */
function extractFavicon(html: string, baseUrl: string): string {
  // Try to find favicon in link tags
  const faviconMatch = html.match(/<link[^>]*rel="(?:shortcut )?icon"[^>]*href="([^"]*)"[^>]*>/i);

  if (faviconMatch?.[1]) {
    const href = faviconMatch[1];
    // If absolute URL, return as-is
    if (href.startsWith('http')) {
      return href;
    }
    // If protocol-relative URL
    if (href.startsWith('//')) {
      return `https:${href}`;
    }
    // If relative URL, make absolute
    try {
      const base = new URL(baseUrl);
      return new URL(href, base.origin).toString();
    } catch {
      return `${baseUrl}/favicon.ico`;
    }
  }

  // Default to /favicon.ico
  try {
    const base = new URL(baseUrl);
    return `${base.origin}/favicon.ico`;
  } catch {
    return `${baseUrl}/favicon.ico`;
  }
}

// =============================================================================
// POST Handler
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { url } = body;

    // Validate URL
    const validation = validateUrl(url);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Special handling for YouTube URLs
    if (isYouTubeUrl(url)) {
      const videoId = extractYouTubeVideoId(url);
      if (videoId) {
        const metadata: UrlMetadata = {
          url,
          title: 'YouTube Video',
          domain: 'youtube.com',
          linkType: 'youtube',
          thumbnailUrl: getYouTubeThumbnailUrl(videoId, 'hq'),
          faviconUrl: 'https://www.youtube.com/favicon.ico',
          youtubeVideoId: videoId,
        };

        return NextResponse.json({ success: true, data: metadata });
      }
    }

    // Fetch URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), URL_CONSTRAINTS.fetchTimeout);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FAQBnB/1.0; +https://faqbnb.com)',
        },
        redirect: 'follow',
      });
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timeout - URL took too long to respond' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch URL' },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';

    // Handle non-HTML content
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      const domain = extractDomain(url);
      const linkType = classifyLinkType(url, contentType);

      const metadata: UrlMetadata = {
        url,
        title: domain,
        domain,
        linkType,
      };

      return NextResponse.json({ success: true, data: metadata });
    }

    // Parse HTML
    const html = await response.text();

    // Extract metadata
    const ogTags = parseOpenGraphTags(html);
    const title = ogTags.title || extractTitle(html) || extractDomain(url);
    const description = ogTags.description || extractDescription(html);
    const thumbnailUrl = ogTags.image;
    const domain = extractDomain(url);
    const faviconUrl = extractFavicon(html, url);
    const linkType = classifyLinkType(url, contentType);

    const metadata: UrlMetadata = {
      url,
      title,
      description,
      thumbnailUrl,
      faviconUrl,
      domain,
      linkType,
    };

    return NextResponse.json({ success: true, data: metadata });
  } catch (error: any) {
    console.error('URL metadata extraction error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
