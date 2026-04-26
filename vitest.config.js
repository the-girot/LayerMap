import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Use jsdom for DOM testing (Vue components)
    environment: 'jsdom',

    // Enable global APIs (describe, it, expect, vi) without imports
    globals: true,

    // Setup files run before each test file
    setupFiles: ['./tests/setup.js'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.js', 'src/**/*.vue'],
      exclude: [
        'src/main.js',
        'src/**/*.mock.js',
        'src/**/index.js',
      ],
    },

    // Mock static assets
    deps: {
      inline: [/vue-router/, /pinia/],
    },
  },
});