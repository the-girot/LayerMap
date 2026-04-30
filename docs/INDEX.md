# Документация репозитория: LayerMap

## О проекте

**LayerMap** — одностраничное веб-приложение (SPA) для управления проектами регуляторной отчётности и маппинга РПИ (Регуляторных Показателей Индикаторов). Приложение позволяет создавать проекты, определять источники данных, строить таблицы маппинга между колонками источников и регуляторными показателями, а также управлять РПИ-маппингами с полной валидацией.

Стек: Vue 3 (Composition API) + Pinia + Vue Router + PrimeVue 4 + Tailwind CSS 3 + Axios. Сборка: Vite 6. Тестирование: Vitest + jsdom.

## Карта документации

| Файл | Домен | Краткое описание |
|------|-------|-----------------|
| [auth.md](auth.md) | Аутентификация и авторизация | Login, register, JWT via cookies, auth store, route guards |
| [api.md](api.md) | API-интеграция | HTTP-клиент Axios, interceptors, эндпоинты, обработка ошибок |
| [projects.md](projects.md) | Проекты | CRUD проектов, KPI, фильтрация, пагинация, список проектов |
| [sources.md](sources.md) | Источники данных и таблицы маппинга | CRUD источников, таблиц маппинга, колонок (dimension/metric) |
| [rpi-mappings.md](rpi-mappings.md) | РПИ-маппинги | Основная бизнес-логика: связь показателей с колонками, валидация, фильтрация |
| [workflow.md](workflow.md) | Воркфлоу процесса | Пошаговый процесс создания РПИ: RPI_FORM → TABLES → COLUMNS |
| [ui.md](ui.md) | UI и стилизация | Компоненты, layout, PrimeVue-темизация, CSS-токены, темная тема |
| [config.md](config.md) | Конфигурация и сборка | Vite, Vitest, Tailwind, PostCSS, env, package.json |
| [tests.md](tests.md) | Тестирование | Vitest, jsdom, setup, тесты API/stores/views/router |

## Быстрый старт

```bash
# 1. Установка зависимостей
npm install

# 2. Настройка окружения (уже есть .env)
# VITE_API_BASE_URL=http://localhost:8000

# 3. Запуск dev-сервера
npm run dev

# 4. Сборка для production
npm run build

# 5. Запуск тестов
npm run test:run
```
