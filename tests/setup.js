import { config } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { vi } from 'vitest';

// Global mock for window.location in redirect tests
const originalLocation = window.location;

beforeEach(() => {
  // Reset Pinia for each test
  setActivePinia(createPinia());

  // Reset window.location mock
  delete window.location;
  window.location = {
    href: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  };
});

afterEach(() => {
  // Restore window.location
  window.location = originalLocation;
  vi.clearAllMocks();
});

// Helper to flush pending promises in Vue tests
export function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Global test utilities
config.global.stubs = {
  // Stub RouterLink in component tests by default
  'router-link': true,
  'router-view': true,
};