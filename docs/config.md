# Конфигурация и сборка

> Инструменты сборки, настройки окружения, конфигурационные файлы проекта.

## Расположение в репозитории

- `package.json` — Зависимости и скрипты
- `vite.config.mjs` — Vite-конфигурация (плагины, алиасы, оптимизация)
- `vitest.config.js` — Vitest-конфигурация (окружение, coverage)
- `postcss.config.js` — PostCSS (Tailwind + Autoprefixer)
- `tailwind.config.js` — Tailwind CSS (палитра, тема, плагины)
- `.env` — Переменные окружения
- `.gitignore` — Исключения Git
- `.gitattributes` — Атрибуты Git
- `index.html` — HTML-входная точка

## Как устроено

### Зависимости (`package.json`)

**Production:**
| Пакет | Версия | Назначение |
|-------|--------|------------|
| `vue` | ^3.5.13 | Фреймворк |
| `pinia` | ^3.0.1 | State management |
| `vue-router` | ^4.5.0 | Роутинг |
| `primevue` | 4.3.1 | UI-компоненты |
| `primeicons` | ^7.0.0 | Иконки |
| `@primeuix/themes` | latest | Aura-тема |
| `@primevue/forms` | 4.3.1 | Формы PrimeVue |
| `axios` | ^1.15.2 | HTTP-клиент |
| `tailwindcss` | ^3.4.1 | CSS-утилиты |
| `tailwindcss-primeui` | ^0.4.0 | Плагин PrimeVue для Tailwind |
| `@vue/eslint-config-prettier` | ^10.2.0 | ESLint + Prettier |

**Development:**
| Пакет | Версия | Назначение |
|-------|--------|------------|
| `vite` | ^6.4.1 | Сборщик |
| `@vitejs/plugin-vue` | ^5.2.1 | Vue-плагин Vite |
| `vitest` | ^4.1.5 | Тест-раннер |
| `@vue/test-utils` | ^2.4.0 | Утилиты тестирования Vue |
| `jsdom` | ^24.0.0 | DOM-окружение для тестов |
| `vite-plugin-vue-devtools` | ^7.7.2 | Инструменты разработки Vue |

### Скрипты (`package.json`)

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера Vite |
| `npm run build` | Сборка production |
| `npm run preview` | Preview production сборки |
| `npm run lint` | ESLint с автофиксом |
| `npm run format` | Prettier форматирование `src/` |
| `npm run test` | Vitest в watch-режиме |
| `npm run test:run` | Однократный прогон тестов |
| `npm run test:ui` | Vitest UI |
| `npm run coverage` | Запуск тестов с покрытием |

### Vite (`vite.config.mjs`)

```javascript
// Плагины: vue(), vueDevTools(), Components(PrimeVueResolver)
// Алиас: @ → ./src
// optimizeDeps: noDiscovery: true
```

- `unplugin-vue-components` с `PrimeVueResolver` — авто-импорт PrimeVue-компонентов без ручной регистрации.
- Алиас `@` для удобных импортов (`import Foo from '@/stores/foo'`).

### Vitest (`vitest.config.js`)

```javascript
{
  plugins: [vue()],
  resolve: { alias: { '@': './src' } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js', 'src/**/*.vue'],
      exclude: ['src/main.js'],
    },
    deps: { inline: [/vue-router/, /pinia/] },
  },
}
```

### Tailwind (`tailwind.config.js`)

- `content`: `["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"]`
- `darkMode`: `["selector", '[class="p-dark"]']`
- Кастомные: `primary`, `surface`, `content`, `app-*`, `chart-*` цвета
- `fontFamily`: Inter
- `borderRadius`: 6/8/12px
- `boxShadow`: card, hover
- plugin: `tailwindcss-primeui`

### Окружение (`.env`)

```
VITE_API_BASE_URL=http://localhost:8000
```

## Как использовать / запустить

```bash
# Установка
npm install

# Разработка
npm run dev          # localhost:5173

# Сборка
npm run build        # → dist/

# Тесты
npm run test:run     # однократно
npm run coverage     # с отчётом о покрытии

# Качество кода
npm run lint && npm run format
```

## Связи с другими доменами

- [api.md](api.md) — `VITE_API_BASE_URL` задаёт baseURL для Axios
- [tests.md](tests.md) — `vitest.config.js` определяет настройки тестов
- [ui.md](ui.md) — `tailwind.config.js` управляет всей стилизацией; `vite.config.mjs` — PrimeVue Resolver
- [auth.md](auth.md) — env-переменная для backend URL

## Нюансы и ограничения

- `package.json` содержит и `dependencies`, и `devDependencies` с дублирующимся `@vitejs/plugin-vue` (в обоих секциях).
- `postcss.config.js` использует `module.exports = { ... }` (CJS-синтаксис), в то время как `tailwind.config.js` использует `export default { ... }` (ESM). Это совместимо, но непоследовательно.
- `@primeuix/themes` указан как `latest` — версия не зафиксирована, что может привести к неожиданным обновлениям.
- `optimizeDeps.noDiscovery: true` в Vite — может вызывать проблемы с динамическими импортами.
- `package-lock.json` в `.gitignore` — нестандартная практика, может вызвать расхождения в версиях.
