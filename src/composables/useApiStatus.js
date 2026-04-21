/**
 * Composable для отслеживания состояния подключения к API
 */

import { ref, computed } from "vue";
import { apiClient } from "@/api/client";

/**
 * @typedef {Object} ApiStatus
 * @property {boolean} loading - Идёт проверка подключения
 * @property {boolean} available - API доступен
 * @property {string|null} error - Ошибка подключения или null
 */

/**
 * @type {import('vue').Ref<ApiStatus>}
 */
const status = ref({
  loading: true,
  available: false,
  error: null,
});

/**
 * Проверить доступность API
 * @returns {Promise<boolean>}
 */
async function checkApiAvailability() {
  status.value = { loading: true, available: false, error: null };

  try {
    // Пытаемся сделать простой запрос к бэкенду
    await apiClient.get("/projects", {
      throwOnError: false,
      json: false,
    });

    // Если запрос прошёл (даже с ошибкой 4xx/5xx), значит бэкенд доступен
    status.value = { loading: false, available: true, error: null };
    return true;
  } catch (error) {
    // CORS ошибка или сетевая ошибка
    status.value = {
      loading: false,
      available: false,
      error:
        error instanceof Error ? error.message : "Не удалось проверить API",
    };
    return false;
  }
}

/**
 * Перепроверить доступность API
 */
async function refreshStatus() {
  await checkApiAvailability();
}

// Автоматическая проверка при инициализации
checkApiAvailability();

export const useApiStatus = () => {
  return {
    status: computed(() => status.value),
    loading: computed(() => status.value.loading),
    available: computed(() => status.value.available),
    error: computed(() => status.value.error),
    refresh: refreshStatus,
  };
};

export default useApiStatus;
