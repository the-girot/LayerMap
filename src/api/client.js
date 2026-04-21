/**
 * API Client — базовый класс для работы с backend API.
 * Обеспечивает централизованную обработку запросов, ошибок и токенов.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export class ApiClient {
  /**
   * Выполнить HTTP запрос
   * @param {string} method - HTTP метод
   * @param {string} endpoint - Endpoint без BASE_URL
   * @param {object} [options] - Дополнительные опции
   * @param {object} [options.body] - Тело запроса (будет JSON-stringified)
   * @param {object} [options.headers] - Дополнительные заголовки
   * @param {boolean} [options.json=true] - Автоматически парсить JSON ответ
   * @param {boolean} [options.throwOnError=true] - Бросать ошибку при статусе != 2xx
   * @returns {Promise<any>}
   */
  async request(method, endpoint, options = {}) {
    const {
      body,
      headers: extraHeaders = {},
      json = true,
      throwOnError = true,
    } = options;

    const url = `${BASE_URL}${endpoint}`;
    const config = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...extraHeaders,
      },
    };

    if (body !== undefined && body !== null) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      const responseData = json ? await response.json() : await response.text();

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
export default apiClient;
