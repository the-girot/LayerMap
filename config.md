# Конфигурация и сборка

> Конфигурация инструментов сборки, тестирования, стилизации и окружения проекта.

## Расположение в репозитории

- `package.json` — Зависимости, скрипты, метаданные
- `vite.config.mjs` — Конфигурация Vite (плагины, алиасы, proxy)
- `vitest.config.js` — Конфигурация Vitest (окружение, setup, coverage)
- `tailwind.config.js` — Конфигурация Tailwind CSS (цвета, шрифты, тени)
- `postcss.config.js` — PostCSS (Tailwind, Autoprefixer)
- `.env` — Переменные окружения (VITE_API_BASE_URL)
- `index.html` — HTML entry point

## Как устроено

### Vite

`vite.config.mjs` настраивает:

- **Плагины**: `@vitejs/plugin-vue`, `vite-plugin-vue-devtools`, `unplugin-vue-components` (с PrimeVueResolver)
- **Алиас**: `@` → `./src`
- **Proxy** (dev): `/auth`, `/users`, `/projects`, `/health` → `http://localhost:8000` (решает CORS)
- **optimizeDeps.noDiscovery: true** — явное определение зависимостей для оптимизации

### Vitest

`vitest.config.js` настраивает:

- **Окружение**: `jsdom` — эмуляция браузера
- **globals: true** — describe/it/expect/vi без импорта
- **setupFiles**: `./tests/setup.js`
- **Coverage**: v8 provider, text/json/html репортеры
- **include**: `src/**/*.js`, `src/**/*.vue`
- **exclude**: `src/main.js`, `*.mock.js`, `index.js`
- **deps.inline**: `vue-router`, `pinia` — форсирует инлайн для совместимости

### Tailwind CSS

`tailwind.config.js` настраивает:

- **Content**: `index.html`, `./src/**/*.{vue,js,ts,jsx,tsx}`
- **Dark mode**: CSS-селектор `[class="p-dark"]`
- **Кастомные цвета**: Primary палитра, Surface, Content, App-токены (через CSS-переменные), Chart-палитра
- **Шрифт**: Inter (системный fallback)
- **Скругления**: sm=6px, md=8px, lg=12px
- **Тени**: card (0 1px 2px), hover (0 4px 12px)
- **Плагины**: `tailwindcss-primeui` — интеграция с PrimeVue

### Переменные окружения

| Переменная | Обязательная | По умолчанию | Описание |
|-----------|-------------|-------------|----------|
| `VITE_API_BASE_URL` | Нет | `http://localhost:8000` | Базовый URL backend API (используется в production) |

### package.json

**Основные зависимости:**

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `vue` | ^3.5.13 | Фреймворк |
| `pinia` | ^3.0.1 | Состояние |
| `vue-router` | ^4.5.0 | Маршрутизация |
| `primevue` | 4.3.1 | UI-компоненты |
| `@primeuix/themes` | latest | Тема PrimeVue |
| `primeicons` | ^7.0.0 | Иконки |
| `tailwindcss` | ^3.4.1 | CSS-утилиты |
| `tailwindcss-primeui` | ^0.4.0 | Интеграция PrimeVue + Tailwind |
| `axios` | ^1.15.2 | HTTP-клиент |
| `@vue-flow/core` | ^1.48.2 | Графы/диаграммы |
| `@vue-flow/background` | ^1.3.2 | Фон для Vue Flow |
| `@vue-flow/controls` | ^1.1.3 | Элементы управления Vue Flow |
| `@vue-flow/minimap` | ^1.5.4 | Мини-карта Vue Flow |
| `@vitejs/plugin-vue` | ^5.2.1 | Vite плагин Vue |

**Dev-зависимости:**

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `vitest` | ^4.1.5 | Тестовый раннер |
| `@vue/test-utils` | ^2.4.0 | Утилиты тестирования Vue |
| `jsdom` | ^24.0.0 | DOM-окружение для тестов |
| `eslint` | ^9.20.1 | Линтер |
| `prettier` | ^3.5.1 | Форматирование |

## Скрипты

| Скрипт | Команда | Описание |
|--------|---------|----------|
| `dev` | `vite` | Dev-сервер с HMR |
| `build` | `vite build` | Production сборка |
| `preview` | `vite preview` | Preview production сборки |
| `lint` | `eslint . --fix` | Проверка и фикс кода |
| `format` | `prettier --write src/` | Форматирование |
| `test` | `vitest` | Тесты в watch-режиме |
| `test:run` | `vitest run` | Однократный прогон тестов |
| `test:ui` | `vitest --ui` | Тесты с UI |
| `coverage` | `vitest run --coverage` | Покрытие кода |

## Связи с другими доменами

- [api.md](api.md) — Vite proxy для API в dev-режиме
- [tests.md](tests.md) — Vitest конфигурация
- [ui.md](ui.md) — Tailwind, PostCSS, PrimeVue конфигурация
- [layer-mapping.md](layer-mapping.md) — Vue Flow пакеты

## Нюансы и ограничения

- `package.json` содержит дублирующиеся зависимости: `@vitejs/plugin-vue` указан и в `dependencies`, и в `devDependencies`
- Нет конфигурации для `eslint.config.js` и `.prettierrc` — используются defaults
- Vite proxy проксирует только `/auth`, `/users`, `/projects`, `/health` — любые другие API-пути (например, `/layer-mappings`) не будут проксироваться
- `optimizeDeps.noDiscovery: true` может вызывать проблемы при добавлении новых зависимостей — требуется явное указание
