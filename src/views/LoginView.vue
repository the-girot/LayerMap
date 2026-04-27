<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Вход в LayerMap</h1>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">username</label>
          <InputText
            id="username"
            v-model="username"
            type="text"
            placeholder="example@company.com"
            :class="{ 'p-invalid': errors.username }"
            autocomplete="username"
            required
          />
          <small v-if="errors.username" class="error-message">{{ errors.username }}</small>
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <InputText
            id="password"
            v-model="password"
            type="password"
            placeholder="Введите пароль"
            :class="{ 'p-invalid': errors.password }"
            autocomplete="current-password"
            required
          />
          <small v-if="errors.password" class="error-message">{{ errors.password }}</small>
        </div>

        <div v-if="generalError" class="general-error">
          {{ generalError }}
        </div>

        <Button
          type="submit"
          label="Войти"
          icon="pi pi-sign-in"
          :loading="loading"
          class="login-button"
          severity="primary"
        />

        <div class="form-footer">
          <RouterLink to="/register">Нет аккаунта? Зарегистрироваться</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const username = ref("");
const password = ref("");
const loading = ref(false);
const generalError = ref("");

const errors = reactive({
  username: "",
  password: "",
});

/**
 * Очистить ошибки формы
 */
function clearErrors() {
  errors.username = "";
  errors.password = "";
  generalError.value = "";
}

/**
 * Обработать вход
 */
async function handleLogin() {
  clearErrors();
  loading.value = true;

  try {
    await authStore.login({ username: username.value, password: password.value });

    toast.add({
      severity: "success",
      summary: "Успешно",
      detail: "Вы успешно вошли в систему",
      life: 3000,
    });

    const redirect = route.query.redirect || "/";
    router.push(redirect);
  } catch (error) {
    if (error.response?.status === 401) {
      generalError.value = "Неверный username или пароль";
    } else if (error.response?.status === 422) {
      // Валидационные ошибки от бэкенда
      const detail = error.response.data?.detail;
      if (Array.isArray(detail)) {
        for (const fieldError of detail) {
          const field = fieldError.loc?.[0];
          const msg = fieldError.msg;
          if (field === "username") errors.username = msg;
          if (field === "password") errors.password = msg;
        }
      }
    } else {
      generalError.value = "Ошибка при входе. Попробуйте позже.";
    }
  } finally {
    loading.value = false;
  }
}

// Проверка на уже авторизованного пользователя
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push("/");
  }
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-title {
  margin: 0 0 2rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.login-form {
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

.login-button {
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
