<template>
    <div class="register-container">
        <div class="register-card">
            <h1 class="register-title">Регистрация в LayerMap</h1>

            <form @submit.prevent="handleRegister" class="register-form">
                <div class="form-group">
                    <label for="full_name">ФИО</label>
                    <InputText id="full_name" v-model="full_name" placeholder="Иванов Иван Иванович"
                        :class="{ 'p-invalid': errors.full_name }" autocomplete="name" required />
                    <small v-if="errors.full_name" class="error-message">{{ errors.full_name }}</small>
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <InputText id="email" v-model="email" type="email" placeholder="example@company.com"
                        :class="{ 'p-invalid': errors.email }" autocomplete="email" required />
                    <small v-if="errors.email" class="error-message">{{ errors.email }}</small>
                </div>

                <div class="form-group">
                    <label for="password">Пароль</label>
                    <InputText id="password" v-model="password" type="password" placeholder="Минимум 8 символов"
                        :class="{ 'p-invalid': errors.password }" autocomplete="new-password" required />
                    <small v-if="errors.password" class="error-message">{{ errors.password }}</small>
                </div>

                <div class="form-group">
                    <label for="confirm_password">Подтвердите пароль</label>
                    <InputText id="confirm_password" v-model="confirmPassword" type="password"
                        placeholder="Повторите пароль" :class="{ 'p-invalid': errors.confirm_password }"
                        autocomplete="new-password" required />
                    <small v-if="errors.confirm_password" class="error-message">{{ errors.confirm_password }}</small>
                </div>

                <div v-if="generalError" class="general-error">
                    {{ generalError }}
                </div>

                <Button type="submit" label="Зарегистрироваться" icon="pi pi-user-plus" :loading="loading"
                    class="register-button" severity="primary" />

                <div class="form-footer">
                    <RouterLink to="/login">Уже есть аккаунт? Войти</RouterLink>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const full_name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const generalError = ref("");

const errors = reactive({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
});

/**
 * Очистить ошибки формы
 */
function clearErrors() {
    errors.full_name = "";
    errors.email = "";
    errors.password = "";
    errors.confirm_password = "";
    generalError.value = "";
}

/**
 * Валидация формы
 */
function validateForm() {
    let isValid = true;

    if (!full_name.value || full_name.value.trim().length < 2) {
        errors.full_name = "ФИО должно содержать минимум 2 символа";
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        errors.email = "Введите корректный email";
        isValid = false;
    }

    if (password.value.length < 8) {
        errors.password = "Пароль должен содержать минимум 8 символов";
        isValid = false;
    }

    if (password.value !== confirmPassword.value) {
        errors.confirm_password = "Пароли не совпадают";
        isValid = false;
    }

    return isValid;
}

/**
 * Обработать регистрацию
 */
async function handleRegister() {
    clearErrors();

    if (!validateForm()) {
        return;
    }

    loading.value = true;

    try {
        await authStore.register(email.value, password.value, full_name.value);

        toast.add({
            severity: "success",
            summary: "Успешно",
            detail: "Аккаунт создан. Вы авторизованы.",
            life: 3000,
        });

        router.push({ name: "Home" });
    } catch (error) {
        if (error.status === 409) {
            // Ресурс уже существует (email или имя заняты)
            if (error.details?.detail) {
                const detail = error.details.detail;
                if (Array.isArray(detail)) {
                    for (const fieldError of detail) {
                        const field = fieldError.loc?.[0];
                        const msg = fieldError.msg;
                        if (field === "email") errors.email = msg;
                        if (field === "full_name") errors.full_name = msg;
                    }
                }
            }
        } else if (error.status === 422) {
            // Валидационные ошибки от бэкенда
            if (error.details?.detail) {
                const detail = error.details.detail;
                if (Array.isArray(detail)) {
                    for (const fieldError of detail) {
                        const field = fieldError.loc?.[0];
                        const msg = fieldError.msg;
                        if (field === "email") errors.email = msg;
                        if (field === "password") errors.password = msg;
                        if (field === "full_name") errors.full_name = msg;
                    }
                }
            }
        } else {
            generalError.value = "Ошибка при регистрации. Попробуйте позже.";
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
    max-width: 450px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.register-title {
    margin: 0 0 2rem;
    font-size: 1.75rem;
    font-weight: 600;
    color: #1a1a2e;
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

.form-group input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.p-invalid {
    border-color: #ef4444;
}

.error-message {
    font-size: 0.75rem;
    color: #ef4444;
}

.general-error {
    padding: 0.75rem;
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #dc2626;
    font-size: 0.875rem;
}

.register-button {
    width: 100%;
    padding: 0.875rem;
    font-size: 1rem;
    font-weight: 500;
    margin-top: 0.5rem;
}

.form-footer {
    text-align: center;
    margin-top: 1rem;
}

.form-footer a {
    color: #667eea;
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.2s;
}

.form-footer a:hover {
    color: #5a67d8;
    text-decoration: underline;
}
</style>
