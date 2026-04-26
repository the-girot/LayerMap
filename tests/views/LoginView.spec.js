// tests/views/LoginView.spec.js
// LayerMap Frontend — Login View Tests (httpOnly cookie)

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
// 5. views/LoginView.vue
// ============================================================================

describe('LoginView', async () => {
  const LoginView = (await import('../../src/views/LoginView.vue')).default;
  const { useAuthStore } = await import('../../src/stores/auth.js');

  it('renders email and password inputs', () => {
    const wrapper = mount(LoginView, { global: { stubs: getComponentStubs() } });
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
  });

  it('calls authStore.login on submit', async () => {
    const store = useAuthStore();
    vi.spyOn(store, 'login').mockResolvedValueOnce();
    const wrapper = mount(LoginView, { global: { stubs: getComponentStubs() } });

    await wrapper.find('input[type="email"]').setValue('test@test.com');
    await wrapper.find('input[type="password"]').setValue('password');
    await wrapper.find('form').trigger('submit');

    expect(store.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password',
    });
  });

  it('shows error on 401', async () => {
    const store = useAuthStore();
    vi.spyOn(store, 'login').mockRejectedValueOnce({ response: { status: 401 } });
    const wrapper = mount(LoginView, { global: { stubs: getComponentStubs() } });

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Неверный email или пароль');
  });

  it('shows loading state during request', async () => {
    const store = useAuthStore();
    let resolveLogin;
    vi.spyOn(store, 'login').mockImplementation(() => new Promise((r) => { resolveLogin = r; }));
    const wrapper = mount(LoginView, { global: { stubs: getComponentStubs() } });

    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();

    resolveLogin();
    await flushPromises();
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined();
  });
});
