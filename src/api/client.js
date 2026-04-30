import axios from 'axios';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * In dev mode, the Vite dev server proxies API requests (see vite.config.mjs),
 * so we use relative URLs (same origin) to avoid CORS issues.
 * In production, use the configured API base URL.
 */
const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // ← обязательно: отправляет cookie в каждом запросе
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Response interceptor ────────────────────────────────────────────────────

const AUTH_ENDPOINTS = ['/auth/jwt/login', '/auth/register', '/auth/logout'];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 403) {
      return Promise.reject(new ApiError(403, 'Нет прав доступа'));
    }

    if (status === 409) {
      return Promise.reject(new ApiError(409, 'Ресурс уже существует'));
    }

    return Promise.reject(error); // 401 просто пробрасываем
  }
);

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

export const api = {
  get:    (url, config) => apiClient.get(url, config).then((r) => r.data),
  post:   (url, data, config) => apiClient.post(url, data, config).then((r) => r.data),
  put:    (url, data, config) => apiClient.put(url, data, config).then((r) => r.data),
  patch:  (url, data, config) => apiClient.patch(url, data, config).then((r) => r.data),
  delete: (url, config) => apiClient.delete(url, config).then((r) => r.data),
};