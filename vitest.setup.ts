/**
 * Vitest Setup File
 *
 * Configures global test environment with jest-dom matchers and mock setup.
 *
 * @lastModified 2026-01-05 (REQ-115)
 */

import '@testing-library/jest-dom';

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
