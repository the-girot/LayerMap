/**
 * Pinia store для аутентификации
 */

import { defineStore } from "pinia";
import { login as apiLogin, register as apiRegister, getCurrentUser } from "@/api/projects";
import { apiClient } from "@/api/client";

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} full_name
 */

/**
 * @typedef {Object} AuthState
 * @property {string|null} token
 * @property {User|null} user
 */

export const useAuthStore = defineStore("auth", {
  state: () => ({
    /** @type {string|null} */
    token: localStorage.getItem("access_token"),
    /** @type {User|null} */
    user: null,
  }),

  getters: {
    /**
     * Авторизован ли пользователь
     * @returns {boolean}
     */
    isAuthenticated(state) {
      return !!state.token && !!state.user;
    },

    /**
     * Есть ли токен (даже если пользователь не загружен)
     * @returns {boolean}
     */
    hasToken(state) {
      return !!state.token;
    },
  },

  actions: {
    /**
     * Войти в систему
     * @param {string} email
     * @param {string} password
     * @returns {Promise<void>}
     */
    async login(email, password) {
      const response = await apiLogin(email, password);
      const { access_token, user } = response;

      this.token = access_token;
      this.user = user;

      apiClient.setToken(access_token);
    },

    /**
     * Зарегистрироваться в системе
     * @param {string} email
     * @param {string} password
     * @param {string} full_name
     * @returns {Promise<void>}
     */
    async register(email, password, full_name) {
      const response = await apiRegister(email, password, full_name);
      const { access_token, user } = response;

      this.token = access_token;
      this.user = user;

      apiClient.setToken(access_token);
    },

    /**
     * Загрузить информацию о пользователе из API
     * @returns {Promise<void>}
     */
    async loadUser() {
      if (!this.token) {
        return;
      }

      try {
        const user = await getCurrentUser();
        this.user = user;
      } catch (error) {
        // Если токен невалиден, очистим состояние
        this.logout();
        throw error;
      }
    },

    /**
     * Выйти из системы
     * @returns {void}
     */
    logout() {
      this.token = null;
      this.user = null;
      apiClient.clearToken();
    },

    /**
     * Восстановить сессию при загрузке приложения
     * @returns {Promise<void>}
     */
    async restoreSession() {
      const storedToken = localStorage.getItem("access_token");
      if (storedToken) {
        this.token = storedToken;
        apiClient.setToken(storedToken);
        try {
          await this.loadUser();
        } catch (error) {
          // Токен невалиден, очистим
          this.logout();
        }
      }
    },
  },
});
