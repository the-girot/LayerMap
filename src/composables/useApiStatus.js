/**
 * Composable для отслеживания состояния подключения к API
 */

import { ref, computed } from "vue";
import { apiClient } from "@/api/client";

/**
 * @typedef {Object} HealthStatus
 * @property {string} status - "healthy" или "unhealthy"
 * @property {boolean} redis - состояние Redis
 */

/**
 * @typedef {Object} ApiStatus
 * @property {boolean} loading - Идёт проверка подключения
 * @property {boolean} available - API доступен
 * @property {HealthStatus|null} health - статус здоровья API или null
 * @property {string|null} error - Ошибка подключения или null
 */

/**
 * @type {import('vue').Ref<ApiStatus>}
 */
const status = ref({
  loading: true,
  available: false,
  health: null,
  error: null,
});

/**
 * Проверить доступность API через /health endpoint
 * @returns {Promise<boolean>}
 */
async function checkApiAvailability() {
  status.value = { loading: true, available: false, health: null, error: null };

  try {
    const health = await apiClient.get("/health", {
      throwOnError: false,
      json: true,
    });

    // Ожидаем { status: "healthy", redis: true }
    if (health && health.status === "healthy") {
      status.value = {
        loading: false,
        available: true,
        health: health,
        error: null,
      };
      return true;
    }

    // Если статус не "healthy", считаем API недоступным
    status.value = {
      loading: false,
      available: false,
      health: health,
      error: "API возвращает unhealthy статус",
    };
    return false;
  } catch (error) {
    // CORS ошибка или сетевая ошибка
    status.value = {
      loading: false,
      available: false,
      health: null,
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
