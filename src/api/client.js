/**
 * API Client — базовый класс для работы с backend API.
 * Обеспечивает централизованную обработку запросов, ошибок и токенов.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY = "access_token";

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export class ApiClient {
  constructor() {
    this.interceptors = {
      request: [],
      response: [],
    };
  }

  /**
   * Добавить request interceptor
   * @param {Function} handler
   */
  onRequest(handler) {
    this.interceptors.request.push(handler);
  }

  /**
   * Добавить response interceptor
   * @param {Function} handler
   */
  onResponse(handler) {
    this.interceptors.response.push(handler);
  }

  /**
   * Получить токен из localStorage
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Сохранить токен в localStorage
   * @param {string} token
   */
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Удалить токен из localStorage
   */
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Выполнить HTTP запрос
   * @param {string} method - HTTP метод
   * @param {string} endpoint - Endpoint без BASE_URL
   * @param {object} [options] - Дополнительные опции
   * @param {object} [options.body] - Тело запроса (будет JSON-stringified)
   * @param {object} [options.headers] - Дополнительные заголовки
   * @param {boolean} [options.json=true] - Автоматически парсить JSON ответ
   * @param {boolean} [options.throwOnError=true] - Бросать ошибку при статусе != 2xx
   * @param {boolean} [options.form=false] - Отправлять данные как form-data
   * @returns {Promise<any>}
   */
  async request(method, endpoint, options = {}) {
    const {
      body,
      headers: extraHeaders = {},
      json = true,
      throwOnError = true,
      form = false,
      formData = false,
    } = options;

    const url = `${BASE_URL}${endpoint}`;

    // Apply request interceptors
    let config = {
      method,
      headers: {
        Accept: "application/json",
        ...extraHeaders,
      },
    };

    // Add token to request headers
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (body !== undefined && body !== null) {
      if (formData) {
        // Отправляем как multipart/form-data
        const formDataInstance = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataInstance.append(key, String(value));
          }
        });
        config.body = formDataInstance;
        // Не устанавливаем Content-Type, браузер сделает это автоматически с boundary
      } else if (form) {
        // Отправляем как application/x-www-form-urlencoded
        const urlSearchParams = new URLSearchParams();
        Object.entries(body).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            urlSearchParams.append(key, String(value));
          }
        });
        config.body = urlSearchParams.toString();
        config.headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else {
        // Проверяем, не является ли body уже строкой
        if (typeof body === "string") {
          config.body = body;
        } else {
          config.body = JSON.stringify(body);
        }
      }
    }

    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      config = (await interceptor(config, endpoint)) || config;
    }

    try {
      const response = await fetch(url, config);
      const responseData = json ? await response.json() : await response.text();

      // Apply response interceptors
      for (const interceptor of this.interceptors.response) {
        await interceptor({ response, data: responseData }, endpoint);
      }

      if (!response.ok && throwOnError) {
        throw new ApiError(
          response.status,
          responseData.detail || `HTTP ${response.status}`,
          responseData,
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, "Network error", { error: error.message });
    }
  }

  /**
   * GET запрос
   */
  async get(endpoint, options = {}) {
    return this.request("GET", endpoint, options);
  }

  /**
   * POST запрос
   * @param {string} endpoint - Endpoint
   * @param {any} body - Тело запроса
   * @param {Object} [options] - Опции
   * @param {boolean} [options.formData=false] - Отправлять как multipart/form-data
   */
  async post(endpoint, body, options = {}) {
    return this.request("POST", endpoint, { ...options, body });
  }

  /**
   * PATCH запрос
   */
  async patch(endpoint, body, options = {}) {
    return this.request("PATCH", endpoint, { ...options, body });
  }

  /**
   * DELETE запрос
   */
  async delete(endpoint, options = {}) {
    return this.request("DELETE", endpoint, options);
  }
}
export const apiClient = new ApiClient();
// Глобальный response interceptor для обработки 401 ошибок
apiClient.onResponse(async ({ response }, endpoint) => {
  if (response.status === 401) {
    // Токен невалиден или истёк — очистим его
    apiClient.clearToken();
    // В реальном приложении здесь можно было бы вызвать router.push('/login')
    // но роутер должен быть доступен из api/client.js, что создаёт циклическую зависимость
    // Поэтому перенаправление происходит в router guard
  }
});

export default apiClient;

