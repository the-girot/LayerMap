// tests/stores/auth.spec.js
// LayerMap Frontend — Auth Store Tests (httpOnly cookie)

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
// 3. stores/auth.js
// ============================================================================

describe('authStore', async () => {
  const { useAuthStore } = await import('../../src/stores/auth.js');
  const authApi = await import('../../src/api/auth.js');

  it('initial state: user null, not authenticated', () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('login calls API login and loadUser', async () => {
    const store = useAuthStore();
    vi.spyOn(authApi, 'login').mockResolvedValueOnce();
    vi.spyOn(authApi, 'getMe').mockResolvedValueOnce({
      id: 1, email: 't@t.com', full_name: 'Test',
    });

    await store.login({ email: 't@t.com', password: 'pass' });

    expect(authApi.login).toHaveBeenCalledWith('t@t.com', 'pass');
    expect(authApi.getMe).toHaveBeenCalled();
    expect(store.user.full_name).toBe('Test');
    expect(store.isAuthenticated).toBe(true);
  });

  it('loadUser sets user on 200', async () => {
    const store = useAuthStore();
    vi.spyOn(authApi, 'getMe').mockResolvedValueOnce({ id: 1, email: 'a@b.c' });
    await store.loadUser();
    expect(store.isAuthenticated).toBe(true);
    expect(store.user.email).toBe('a@b.c');
  });

  it('loadUser clears state on 401', async () => {
    const store = useAuthStore();
    vi.spyOn(authApi, 'getMe').mockRejectedValueOnce({ response: { status: 401 } });
    await store.loadUser();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
  });

  it('logout calls API and clears state', async () => {
    const store = useAuthStore();
    store.user = { id: 1 };
    store.isAuthenticated = true;
    vi.spyOn(authApi, 'logout').mockResolvedValueOnce();

    await store.logout();

    expect(authApi.logout).toHaveBeenCalled();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });
});
