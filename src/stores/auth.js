import { defineStore } from 'pinia';
import { login, getMe, logout } from '../api/auth.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    _loadingPromise: null,
  }),

  actions: {
    async login(credentials) {
      await login(credentials.email, credentials.password);
      this.isInitialized = false;
      await this.loadUser();
    },

    async loadUser() {
      // Уже инициализировано — не делаем повторный запрос
      if (this.isInitialized) return;

      // Уже загружается — возвращаем тот же промис вместо нового запроса
      if (this._loadingPromise) return this._loadingPromise;

      this._loadingPromise = (async () => {
        try {
          const data = await getMe();
          this.user = data;
          this.isAuthenticated = true;
        } catch {
          // Любая ошибка (401, сетевая, 500) = не авторизован
          this.user = null;
          this.isAuthenticated = false;
        } finally {
          this.isInitialized = true;
          this._loadingPromise = null;
        }
      })();

      return this._loadingPromise;
    },

    async logout() {
      try {
        await logout();
      } catch {
        // Игнорируем ошибки сети при logout
      }
      this.user = null;
      this.isAuthenticated = false;
      this.isInitialized = false;
      window.location.href = '/login';
    },
  },
});