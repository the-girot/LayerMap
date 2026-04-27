import axios from 'axios';

/**
 * Класс ошибки API
 */
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Эндпоинты где 401 — ожидаемое поведение, редирект не нужен
const AUTH_ENDPOINTS = ['/auth/me', '/auth/login', '/auth/register'];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => url.includes(ep));

    if (status === 401 && !isAuthEndpoint) {
      // Сессия истекла во время работы — редирект на логин
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 403) {
      return Promise.reject(
        Object.assign(new Error('Нет прав доступа'), { status: 403 })
      );
    }

    if (status === 409) {
      return Promise.reject(
        Object.assign(new Error('Ресурс уже существует'), { status: 409 })
      );
    }

    return Promise.reject(error);
  }
);

/**
 * Проверить доступность API через /health
 * @returns {Promise<boolean>}
 */
export async function isApiAvailable() {
  try {
    const { data } = await apiClient.get('/health', { timeout: 5000 });
    return data.status === 'healthy';
  } catch {
    return false;
  }
}

export { apiClient };
export default apiClient;

// Обёртка над apiClient с автоматическим извлечением data
export const api = {
  get:    (url, config) => apiClient.get(url, config).then(r => r.data),
  post:   (url, data, config) => apiClient.post(url, data, config).then(r => r.data),
  patch:  (url, data, config) => apiClient.patch(url, data, config).then(r => r.data),
  delete: (url, config) => apiClient.delete(url, config).then(r => r.data),
};