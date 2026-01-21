/**
 * Vitest Setup File
 *
 * Configures global test environment with jest-dom matchers, axe-core
 * accessibility testing, and mock setup.
 *
 * @lastModified 2026-01-10 (REQ-174 Accessibility Audit)
 */

import '@testing-library/jest-dom';
import * as axeMatchers from 'vitest-axe/matchers';
import { expect, vi } from 'vitest';

// Extend vitest expect with axe matchers for accessibility testing
expect.extend(axeMatchers);

// Provide jest-compatible timer/mocking API for legacy tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;

// Mock localStorage for tests
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: function (key: string) {
    return this.store[key] || null;
  },
  setItem: function (key: string, value: string) {
    this.store[key] = value;
  },
  removeItem: function (key: string) {
    delete this.store[key];
  },
  clear: function () {
    this.store = {};
  },
  get length() {
    return Object.keys(this.store).length;
  },
  key: function (index: number) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;

// Mock scrollTo to avoid jsdom "not implemented" errors
if (!window.scrollTo) {
  window.scrollTo = () => {};
}

// Mock canvas APIs used by cropper/video tests
if (!HTMLCanvasElement.prototype.getContext) {
  HTMLCanvasElement.prototype.getContext = () => null;
}

const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (...args: any[]) {
  try {
    const context = originalGetContext?.apply(this, args);
    if (context) {
      return context;
    }
  } catch {
    // Fall through to mock context
  }
  return {
    canvas: this,
    clearRect: () => {},
    drawImage: () => {},
    getImageData: () => ({ data: new Uint8ClampedArray(), width: 0, height: 0 }),
    putImageData: () => {},
    measureText: () => ({ width: 0 }),
    scale: () => {},
    translate: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    rect: () => {},
    clip: () => {},
  } as unknown as CanvasRenderingContext2D;
};

if (!HTMLCanvasElement.prototype.toDataURL) {
  HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
}
