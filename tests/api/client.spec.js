// tests/api/client.spec.js
// LayerMap Frontend — API Client Tests (httpOnly cookie)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';

// --- Mocks ---
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: vi.fn(), remove: vi.fn(), removeAllGroups: vi.fn() }),
}));

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: () => ({ query: {}, fullPath: '/', path: '/' }),
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  };
});

// --- Setup helpers ---
const originalLocation = window.location;
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  setActivePinia(createPinia());
  delete window.location;
  window.location = { href: '', assign: vi.fn(), replace: vi.fn(), reload: vi.fn() };
});

afterEach(() => {
  window.location = originalLocation;
  vi.clearAllMocks();
});

// Common stubs with proper v-model + disabled support
function getComponentStubs() {
  return {
    InputText: {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    },
    Button: {
      props: ['disabled', 'loading'],
      template: '<button :disabled="disabled || loading"><slot /></button>',
    },
    RouterLink: { template: '<a><slot /></a>' },
  };
}

// ============================================================================
// 1. api/client.js
// ============================================================================

describe('apiClient', async () => {
  const { default: apiClient, isApiAvailable } = await import('../../src/api/client.js');

  it('should have withCredentials enabled', () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it('should NOT have Authorization header by default', () => {
    expect(apiClient.defaults.headers.Authorization).toBeUndefined();
  });

  it('should redirect to /login on 401 response', async () => {
    const error = { response: { status: 401 } };
    const handlers = apiClient.interceptors.response.handlers;
    const rejected = handlers[handlers.length - 1]?.rejected;
    if (rejected) {
      try { await rejected(error); } catch (e) {}
    }
    expect(window.location.href).toBe('/login');
  });

  describe('isApiAvailable', () => {
    it('returns true when /health is healthy', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: { status: 'healthy', redis: true },
      });
      const result = await isApiAvailable();
      expect(result).toBe(true);
      expect(apiClient.get).toHaveBeenCalledWith('/health', { timeout: 5000 });
    });

    it('returns false when /health fails', async () => {
      vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('timeout'));
      const result = await isApiAvailable();
      expect(result).toBe(false);
    });
  });
});
