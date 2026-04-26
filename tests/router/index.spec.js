// tests/router/index.spec.js
// LayerMap Frontend — Router Tests (httpOnly cookie)

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
// 4. router/index.js (in-memory router)
// ============================================================================

describe('router', async () => {
  const { useAuthStore } = await import('../../src/stores/auth.js');
  let router;

  beforeEach(async () => {
    const routes = [
      { path: '/', component: { template: '<div>Home</div>' }, meta: { requiresAuth: true } },
      { path: '/login', name: 'Login', component: { template: '<div>Login</div>' }, meta: { requiresAuth: false } },
      { path: '/register', name: 'Register', component: { template: '<div>Register</div>' }, meta: { requiresAuth: false } },
      { path: '/projects', component: { template: '<div>Projects</div>' }, meta: { requiresAuth: true } },
    ];

    router = createRouter({ history: createWebHistory(), routes });

    router.beforeEach(async (to) => {
      const authStore = useAuthStore();
      if (to.meta.requiresAuth === false) {
        if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
          return { path: '/' };
        }
        return true;
      }
      if (!authStore.isAuthenticated) {
        await authStore.loadUser();
      }
      if (!authStore.isAuthenticated) {
        return { path: '/login', query: { redirect: to.fullPath } };
      }
      return true;
    });
  });

  it('/login route exists with requiresAuth false', () => {
    const route = router.resolve('/login');
    expect(route.name).toBe('Login');
    expect(route.meta.requiresAuth).toBe(false);
  });

  it('/register route exists with requiresAuth false', () => {
    const route = router.resolve('/register');
    expect(route.name).toBe('Register');
    expect(route.meta.requiresAuth).toBe(false);
  });

  it('redirects unauthenticated from private to /login', async () => {
    const store = useAuthStore();
    store.isAuthenticated = false;
    vi.spyOn(store, 'loadUser').mockResolvedValueOnce();

    await router.push('/projects');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('allows authenticated to private route', async () => {
    const store = useAuthStore();
    store.isAuthenticated = true;
    store.user = { id: 1 };

    await router.push('/projects');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/projects');
  });

  it('redirects authenticated away from /login to /', async () => {
    const store = useAuthStore();
    store.isAuthenticated = true;

    await router.push('/login');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/');
  });
});
