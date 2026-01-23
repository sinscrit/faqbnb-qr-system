/**
 * Language Detection Integration Tests
 * End-to-end tests for guest language detection flow.
 *
 * REQ-E04-022: Test Language Detection Scenarios
 *
 * @module lib/i18n/__tests__/guest-language.integration.test
 * @created 2026-01-23
 * @lastModified 2026-01-23
 */

import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  detectGuestLanguage,
  setGuestLanguageCookie,
  GUEST_LANG_COOKIE_NAME,
} from '../guest-language';

describe('Language Detection - Integration', () => {
  it('complete detection cycle with URL parameter', () => {
    const req = new NextRequest('http://localhost:3000/item/abc?lang=fr');
    const urlParam = req.nextUrl.searchParams.get('lang');

    const detectedLang = detectGuestLanguage(req, urlParam ?? undefined);

    expect(detectedLang).toBe('fr');
  });

  it('middleware-style usage pattern', () => {
    // Simulate first-time guest with no preferences
    const req = new NextRequest('http://localhost:3000/item/abc', {
      headers: { 'Accept-Language': 'es-ES,es;q=0.9' },
    });

    const res = NextResponse.next();
    const urlParam = req.nextUrl.searchParams.get('lang');
    const guestLang = detectGuestLanguage(req, urlParam ?? undefined);

    setGuestLanguageCookie(guestLang, res);

    expect(guestLang).toBe('es');
    expect(res.cookies.get(GUEST_LANG_COOKIE_NAME)?.value).toBe('es');
  });

  it('shareable link with language parameter overrides existing preferences', () => {
    // Scenario: Returning guest with cookie clicks shareable link
    const req = new NextRequest('http://localhost:3000/item/abc?lang=fr', {
      headers: { 'Accept-Language': 'de-DE,de;q=0.9' },
    });
    req.cookies.set(GUEST_LANG_COOKIE_NAME, 'es'); // Has Spanish preference

    const urlParam = req.nextUrl.searchParams.get('lang');
    const detectedLang = detectGuestLanguage(req, urlParam ?? undefined);

    expect(detectedLang).toBe('fr'); // URL wins over all
  });

  it('cookie persistence across multiple requests', () => {
    // First request: No preferences, uses header
    const req1 = new NextRequest('http://localhost:3000/item/abc', {
      headers: { 'Accept-Language': 'it-IT,it;q=0.9' },
    });

    const res1 = NextResponse.next();
    const lang1 = detectGuestLanguage(req1);
    setGuestLanguageCookie(lang1, res1);

    expect(lang1).toBe('it');

    // Second request: Cookie now set
    const req2 = new NextRequest('http://localhost:3000/item/xyz');
    req2.cookies.set(GUEST_LANG_COOKIE_NAME, 'it');

    const lang2 = detectGuestLanguage(req2);
    expect(lang2).toBe('it'); // Cookie persists
  });

  it('realistic multi-source scenario', () => {
    // Complex scenario: All sources present
    const req = new NextRequest('http://localhost:3000/item/abc', {
      headers: { 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8' },
    });
    req.cookies.set(GUEST_LANG_COOKIE_NAME, 'es');

    // Cookie should win (no URL param)
    const result = detectGuestLanguage(req);
    expect(result).toBe('es');
  });

  it('language switch via URL parameter updates preference', () => {
    // User has existing preference but clicks link with different language
    const req = new NextRequest('http://localhost:3000/item/abc?lang=nl');
    req.cookies.set(GUEST_LANG_COOKIE_NAME, 'fr');

    const urlParam = req.nextUrl.searchParams.get('lang');
    const detectedLang = detectGuestLanguage(req, urlParam ?? undefined);

    // URL parameter takes precedence
    expect(detectedLang).toBe('nl');

    // In real scenario, middleware would update cookie
    const res = NextResponse.next();
    setGuestLanguageCookie(detectedLang, res);
    expect(res.cookies.get(GUEST_LANG_COOKIE_NAME)?.value).toBe('nl');
  });

  it('handles invalid URL parameter gracefully with fallback', () => {
    const req = new NextRequest('http://localhost:3000/item/abc?lang=xyz');
    req.cookies.set(GUEST_LANG_COOKIE_NAME, 'de');

    const urlParam = req.nextUrl.searchParams.get('lang');
    const detectedLang = detectGuestLanguage(req, urlParam ?? undefined);

    // Invalid URL param, falls to cookie
    expect(detectedLang).toBe('de');
  });

  it('first-time visitor gets default language', () => {
    // No URL param, no cookie, no Accept-Language
    const req = new NextRequest('http://localhost:3000/item/abc');

    const detectedLang = detectGuestLanguage(req);

    expect(detectedLang).toBe('en');
  });

  it('browser language detection for new visitor', () => {
    // No URL param, no cookie, but has Accept-Language
    const req = new NextRequest('http://localhost:3000/item/abc', {
      headers: { 'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8' },
    });

    const detectedLang = detectGuestLanguage(req);

    expect(detectedLang).toBe('nl');
  });
});

describe('Acceptance Criteria - Integration Verification', () => {
  it('Test: Browser Accept-Language header "fr-FR,fr;q=0.9,en;q=0.8" correctly detects French', () => {
    const req = new NextRequest('http://localhost:3000/item/test', {
      headers: { 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8' },
    });

    expect(detectGuestLanguage(req)).toBe('fr');
  });

  it('Test: Browser Accept-Language with unsupported language falls back to English', () => {
    const req = new NextRequest('http://localhost:3000/item/test', {
      headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' },
    });

    expect(detectGuestLanguage(req)).toBe('en');
  });

  it('Test: Cookie "FAQBNB_GUEST_LANG=es" overrides browser language "fr-FR"', () => {
    const req = new NextRequest('http://localhost:3000/item/test', {
      headers: { 'Accept-Language': 'fr-FR' },
    });
    req.cookies.set(GUEST_LANG_COOKIE_NAME, 'es');

    expect(detectGuestLanguage(req)).toBe('es');
  });

  it('Test: URL parameter "?lang=de" overrides cookie "FAQBNB_GUEST_LANG=es"', () => {
    const req = new NextRequest('http://localhost:3000/item/test?lang=de');
    req.cookies.set(GUEST_LANG_COOKIE_NAME, 'es');

    const urlParam = req.nextUrl.searchParams.get('lang');
    expect(detectGuestLanguage(req, urlParam ?? undefined)).toBe('de');
  });

  it('Test: Invalid URL parameter "?lang=invalid" falls back to next detection method', () => {
    const req = new NextRequest('http://localhost:3000/item/test?lang=invalid');
    req.cookies.set(GUEST_LANG_COOKIE_NAME, 'it');

    const urlParam = req.nextUrl.searchParams.get('lang');
    expect(detectGuestLanguage(req, urlParam ?? undefined)).toBe('it');
  });

  it('Test: No preferences at all defaults to English', () => {
    const req = new NextRequest('http://localhost:3000/item/test');

    expect(detectGuestLanguage(req)).toBe('en');
  });

  it('Test: Malformed Accept-Language header handled gracefully', () => {
    const req = new NextRequest('http://localhost:3000/item/test', {
      headers: { 'Accept-Language': ';;;garbage;;;' },
    });

    expect(detectGuestLanguage(req)).toBe('en');
  });

  it('Test: Empty cookie value handled gracefully', () => {
    const req = new NextRequest('http://localhost:3000/item/test');
    req.cookies.set(GUEST_LANG_COOKIE_NAME, '');

    expect(detectGuestLanguage(req)).toBe('en');
  });
});
