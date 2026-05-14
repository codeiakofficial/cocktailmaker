import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => { cleanup() });

// Browser APIs not available in jsdom but required by Embla Carousel
global.ResizeObserver = vi.fn().mockImplementation(function () {
  this.observe = vi.fn()
  this.unobserve = vi.fn()
  this.disconnect = vi.fn()
})

global.IntersectionObserver = vi.fn().mockImplementation(function () {
  this.observe = vi.fn()
  this.unobserve = vi.fn()
  this.disconnect = vi.fn()
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
