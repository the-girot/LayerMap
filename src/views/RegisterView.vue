<template>
  <div class="register-container">
    <div class="register-card">
      <h1 class="register-title">Регистрация в LayerMap</h1>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="full_name">ФИО</label>
          <InputText
            id="full_name"
            v-model="fullName"
            placeholder="Иванов Иван Иванович"
            :class="{ 'p-invalid': fieldErrors.full_name }"
            autocomplete="name"
            required
          />
          <small v-if="fieldErrors.full_name" class="error-message">{{ fieldErrors.full_name }}</small>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="example@company.com"
            :class="{ 'p-invalid': fieldErrors.email }"
            autocomplete="email"
            required
          />
          <small v-if="fieldErrors.email" class="error-message">{{ fieldErrors.email }}</small>
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <InputText
            id="password"
            v-model="password"
            type="password"
            placeholder="Минимум 8 символов"
            :class="{ 'p-invalid': fieldErrors.password }"
            autocomplete="new-password"
            required
          />
          <small v-if="fieldErrors.password" class="error-message">{{ fieldErrors.password }}</small>
        </div>

        <div v-if="generalError" class="general-error">
          {{ generalError }}
        </div>

        <Button
          type="submit"
          label="Зарегистрироваться"
          icon="pi pi-user-plus"
          :loading="loading"
          class="register-button"
          severity="primary"
          :disabled="loading"
        />

        <div class="form-footer">
          <RouterLink to="/login">Уже есть аккаунт? Войти</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { register } from "../api/auth.js";
import { useAuthStore } from "../stores/auth.js";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const fullName = ref("");
const password = ref("");
const loading = ref(false);
const generalError = ref("");
const fieldErrors = ref({});

// Проверка на уже авторизованного пользователя
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace("/");
  }
});

/**
 * Обработать регистрацию
 */
async function handleRegister() {
  loading.value = true;
  generalError.value = "";
  fieldErrors.value = {};

  try {
    await register({
      email: email.value,
      full_name: fullName.value,
      password: password.value,
    });
    // Авто-логин после регистрации
    await authStore.login({ email: email.value, password: password.value });
    router.replace("/");
  } catch (err) {
    const status = err.response?.status;
    if (status === 409) {
      generalError.value = "Пользователь с таким email уже существует";
    } else if (status === 422) {
      fieldErrors.value = err.response.data.detail || {};
    } else {
      generalError.value = "Ошибка регистрации. Попробуйте позже.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.register-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.register-title {
  margin: 0 0 2rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.error-message {
  font-size: 0.75rem;
  color: #ef4444;
}

.general-error {
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
}

.register-button {
  margin-top: 0.5rem;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer a {
  color: #6366f1;
  font-size: 0.875rem;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
