// tests/views/RegisterView.spec.js
// LayerMap Frontend — Register View Tests (httpOnly cookie)

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
// 6. views/RegisterView.vue
// ============================================================================

describe('RegisterView', async () => {
  const RegisterView = (await import('../../src/views/RegisterView.vue')).default;
  const authApi = await import('../../src/api/auth.js');
  const { useAuthStore } = await import('../../src/stores/auth.js');

  it('renders all required inputs', () => {
    const wrapper = mount(RegisterView, { global: { stubs: getComponentStubs() } });
    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(3);
    // Проверяем наличие email и password по типу
    const emailInput = inputs.find(i => i.element.getAttribute('type') === 'email');
    const passwordInput = inputs.find(i => i.element.getAttribute('type') === 'password');
    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
  });

  it('calls register and auto-login on submit', async () => {
    vi.spyOn(authApi, 'register').mockResolvedValueOnce({});
    const store = useAuthStore();
    vi.spyOn(store, 'login').mockResolvedValueOnce();

    const wrapper = mount(RegisterView, { global: { stubs: getComponentStubs() } });
    const inputs = wrapper.findAll('input');

    // Порядок полей в RegisterView: full_name, email, password
    await inputs[0].setValue('New User');        // full_name
    await inputs[1].setValue('new@test.com');     // email
    await inputs[2].setValue('password');          // password
    await wrapper.find('form').trigger('submit');

    expect(authApi.register).toHaveBeenCalledWith({
      email: 'new@test.com',
      full_name: 'New User',
      password: 'password',
    });
    expect(store.login).toHaveBeenCalledWith({
      email: 'new@test.com',
      password: 'password',
    });
  });

  it('shows 409 error for duplicate email', async () => {
    vi.spyOn(authApi, 'register').mockRejectedValueOnce({
      response: { status: 409, data: { detail: 'Email exists' } },
    });
    const wrapper = mount(RegisterView, { global: { stubs: getComponentStubs() } });
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Пользователь с таким email уже существует');
  });
});
