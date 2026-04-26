import { defineStore } from 'pinia';
import { login, getMe, logout } from '../api/auth.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,           // { id, email, full_name } | null
    isAuthenticated: false,
  }),

  actions: {
    async login(credentials) {
      await login(credentials.email, credentials.password);
      await this.loadUser();
    },

    async loadUser() {
      try {
        const data = await getMe();
        this.user = data;
        this.isAuthenticated = true;
      } catch (error) {
        if (error.response?.status === 401) {
          this.user = null;
          this.isAuthenticated = false;
        } else {
          throw error;
        }
      }
    },

    async logout() {
      try {
        await logout();
      } catch (e) {
        // Игнорируем ошибки сети при logout
      }
      this.user = null;
      this.isAuthenticated = false;
      window.location.href = '/login';
    },
  },
});
