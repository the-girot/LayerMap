# Документация репозитория: LayerMap

## О проекте

**LayerMap** — одностраничное веб-приложение (SPA) на Vue 3 для управления проектами регуляторной отчётности и маппинга данных. Приложение позволяет создавать проекты, определять источники данных, строить таблицы маппинга между колонками источников и регуляторными показателями (РПИ), управлять DWH-слоями данных (STG, ODS, DDS, DM) и визуализировать lineage-графы с помощью Vue Flow.

**Целевая аудитория**: compliance-офицеры, аналитики данных, менеджеры проектов, инженеры данных.

**Стек**: Vue 3 (Composition API + `<script setup>`) / Pinia / Vue Router 4 / PrimeVue 4 / Tailwind CSS 3 / Axios / Vue Flow / Vite 6 / Vitest + jsdom.

## Карта документации

| Файл | Домен | Краткое описание |
|------|-------|-----------------|
| [auth.md](auth.md) | Аутентификация и авторизация | Login/register/logout, JWT via cookies, auth store, route guards |
| [api.md](api.md) | API-интеграция | HTTP-клиент Axios, interceptors, все эндпоинты, обработка ошибок |
| [projects.md](projects.md) | Проекты | CRUD проектов, KPI, фильтрация, пагинация, project store |
| [sources.md](sources.md) | Источники данных | CRUD источников, source store |
| [tables.md](tables.md) | Таблицы маппинга и колонки | CRUD таблиц маппинга и колонок, tables store, связь с РПИ |
| [rpi-mappings.md](rpi-mappings.md) | РПИ-маппинги | Основная бизнес-логика: связь показателей с колонками, валидация, фильтрация, CRUD |
| [layer-mapping.md](layer-mapping.md) | DWH-слои и lineage | DWH-таблицы, маппинги между слоями (STG/ODS/DDS/DM), lineage-графы, Vue Flow canvas |
| [workflow.md](workflow.md) | Воркфлоу процесса | Пошаговый процесс создания РПИ: RPI_FORM → TABLES → COLUMNS |
| [ui.md](ui.md) | UI-компоненты и стилизация | Компоненты, layout, PrimeVue-темизация, CSS-токены, Tailwind |
| [config.md](config.md) | Конфигурация и сборка | Vite, Vitest, Tailwind, PostCSS, env, package.json |
| [tests.md](tests.md) | Тестирование | Vitest, jsdom, setup, структура тестов по доменам |

## Быстрый старт

```bash
# 1. Установка зависимостей
npm install

# 2. Настройка окружения (файл .env уже присутствует)
# VITE_API_BASE_URL=http://localhost:8000

# 3. Запуск dev-сервера (Vite проксирует /auth, /users, /projects, /health на backend)
npm run dev

# 4. Сборка для production
npm run build

# 5. Запуск тестов
npm run test:run
```
