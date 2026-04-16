# LayerMap — Overview

## Назначение и домен

LayerMap — SPA для управления проектами маппинга данных: связывание полей источников (ClickHouse, BigQuery, PostgreSQL, 1C) с реестром показателей и измерений (РПИ). Домен — аналитические проекты, ETL-маппинг, валидация данных.

## Ключевые сущности

- **Project** — аналитический проект (владелец источников и РПИ)
- **Source** — таблица-источник данных (API/DB, rowCount, lastUpdated)
- **MappingTable** — таблица маппинга внутри проекта (содержит колонки)
- **Column** — колонка таблицы маппинга (name, type: metric|dimension, dataType, rpiMappingId)
- **RPIMapping** — запись реестра показателей (number, ownership, status, source, block, measurementType, measurement, objectField, comment, verificationFile)
- **Workflow** — состояние многошагового процесса (rpi_form → tables → columns)

## Стек технологий

| Категория   | Технология                 | Версия           | Назначение                                                               |
| ----------- | -------------------------- | ---------------- | ------------------------------------------------------------------------ |
| Framework   | Vue 3                      | 3.5.13           | Composition API, `<script setup>`, реактивность                          |
| State       | Pinia                      | 3.0.1            | Reactive stores, computed, actions                                       |
| Router      | Vue Router                 | 4.5.0            | createWebHistory, nested routes                                          |
| UI Library  | PrimeVue                   | 4.3.1            | DataTable, Dialog, Select, Button, Badge, Menubar, Card, Paginator, etc. |
| Theme       | @primeuix/themes           | latest           | Aura preset                                                              |
| Auto-import | unplugin-vue-components    | latest           | PrimeVueResolver для автоматического импорта                             |
| CSS         | Tailwind CSS               | 3.4.1            | Utility-first styling, responsive breakpoints                            |
| CSS Plugin  | tailwindcss-primeui        | 0.4.0            | Интеграция PrimeVue с Tailwind                                           |
| Build       | Vite                       | 6.4.1            | HMR, bundling, alias `@` → `src/`                                        |
| Vue Plugin  | @vitejs/plugin-vue         | 5.2.1            | SFC compilation                                                          |
| DevTools    | vite-plugin-vue-devtools   | 7.7.2            | Vue DevTools integration                                                 |
| Linter      | ESLint + eslint-plugin-vue | 9.x              | Code quality                                                             |
| Formatter   | Prettier                   | 3.5.1            | Code formatting                                                          |
| Charts      | Chart.js + vue-chartjs     | 4.5.1 / 5.3.3    | (dependency, не используется в текущих views)                            |
| Excel       | xlsx-js-style              | 1.2.0            | (dependency, не используется в текущих views)                            |
| PostCSS     | postcss + autoprefixer     | 8.4.31 / 10.4.16 | CSS processing                                                           |

## Критические зависимости

**Внутренние:**

- `projects.js` ↔ `workflow.js` — workflow использует `rpiEntityId` для разблокировки, но не зависит от данных projects
- `RPIMappingView` зависит от `projects.js` (CRUD) и `workflow.js` (константы COLUMN_TYPES)
- `SourceDetailView` зависит от `projects.js` (данные) и `workflow.js` (COLUMN_TYPE_LABELS, COLUMN_TYPE_COLORS)

**Внешние (CDN):**

- `primeicons@7.0.0` — иконки (через unpkg CDN в index.html)

**Нет внешних API:** все данные — mock в `projects.js`. Нет HTTP-клиента, нет axios/fetch.

---

## Документация проекта

- [Архитектура](./architecture/ARCHITECTURE.md)
- [Хранилища состояния (Stores)](./stores/STORES.md)
- [Компоненты и Views](./components/COMPONENTS.md)
- [Модель данных](./DATA_MODEL.md)
- [Разработка и конфигурация](./guides/DEVELOPMENT.md)
- [Тестирование](./testing/TESTING.md)
