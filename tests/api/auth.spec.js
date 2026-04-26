// tests/api/auth.spec.js
// LayerMap Frontend — Auth API Tests (httpOnly cookie)

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
// 2. api/auth.js
// ============================================================================

describe('auth API', async () => {
  const { login, register, getMe, logout } = await import('../../src/api/auth.js');
  const { default: apiClient } = await import('../../src/api/client.js');

  beforeEach(() => vi.clearAllMocks());

  it('login POST /auth/login/json', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { success: true } });
    await login('test@test.com', 'password123');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login/json', {
      email: 'test@test.com',
      password: 'password123',
    });
  });

  it('register POST /auth/register', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { id: 1 } });
    await register({ email: 't@t.com', full_name: 'T', password: 'p' });
    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 't@t.com',
      full_name: 'T',
      password: 'p',
    });
  });

  it('getMe GET /auth/me', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { id: 1, email: 't@t.com', full_name: 'User' },
    });
    const result = await getMe();
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    expect(result.full_name).toBe('User');
  });

  it('logout POST /auth/logout', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { success: true } });
    await logout();
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
  });
});
