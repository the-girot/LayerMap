# Тестирование

> Unit-тесты для API-слоя, Pinia-сторов, Vue-компонентов и роутера. Используется Vitest + jsdom + @vue/test-utils.

## Расположение в репозитории

- `vitest.config.js` — Конфигурация тест-раннера
- `tests/setup.js` — Глобальный setup (Pinia, window.location mock)
- `tests/api/client.spec.js` — Тесты HTTP-клиента
- `tests/api/auth.spec.js` — Тесты API аутентификации
- `tests/api/projects.spec.js` — Тесты API проектов
- `tests/stores/auth.spec.js` — Тесты AuthStore
- `tests/router/index.spec.js` — Тесты роутера (guard)
- `tests/views/LoginView.spec.js` — Тесты LoginView
- `tests/views/RegisterView.spec.js` — Тесты RegisterView

## Как устроено

### Конфигурация (`vitest.config.js`)

```javascript
{
  plugins: [vue()],
  resolve: { alias: { '@': './src' } },
  test: {
    environment: 'jsdom',         // DOM-окружение
    globals: true,                // describe, it, expect без импорта
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js', 'src/**/*.vue'],
      exclude: ['src/main.js', 'src/**/*.mock.js', 'src/**/index.js'],
    },
    deps: { inline: [/vue-router/, /pinia/] },  // Инлайн зависимостей
  },
}
```

### Setup (`tests/setup.js`)

```javascript
// Инициализация Pinia перед каждым тестом
beforeEach(() => {
  setActivePinia(createPinia());
  // Mock window.location для тестов redirect
  window.location = { href: '', assign: vi.fn(), replace: vi.fn(), reload: vi.fn() };
});

// Хелпер для flush promises
export function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Глобальные стабы
config.global.stubs = { 'router-link': true, 'router-view': true };
```

### Структура тестов

```
tests/
 ├── setup.js                     # Инициализация, хелперы
 ├── api/
 │   ├── client.spec.js           # Тесты Axios-клиента и перехватчиков
 │   ├── auth.spec.js             # Тесты API-функций аутентификации
 │   └── projects.spec.js         # Тесты API-функций проектов
 ├── stores/
 │   └── auth.spec.js             # Тесты AuthStore
 ├── router/
 │   └── index.spec.js            # Тесты route guards
 └── views/
     ├── LoginView.spec.js        # Тесты страницы входа
     └── RegisterView.spec.js     # Тесты страницы регистрации
```

### Паттерны тестирования

**API тесты** (`tests/api/`):
- Используют `vi.mock('axios')` для мока HTTP-запросов
- Тестируют формирование URL, параметров, headers
- Проверяют обработку ответов и ошибок

**Store тесты** (`tests/stores/`):
- Инициализируют Pinia через `setActivePinia`
- Тестируют actions и state mutations
- Мокают API-вызовы на уровне store

**View тесты** (`tests/views/`):
- Используют `mount()` или `shallowMount()` из `@vue/test-utils`
- Стабят router-link и router-view глобально
- Тестируют рендеринг, взаимодействие, submit формы

**Router тесты** (`tests/router/`):
- Тестируют `router.beforeEach` guard
- Проверяют редиректы для неавторизованных пользователей
- Проверяют редиректы авторизованных с /login

## Ключевые сущности

- **`flushPromises()`** — хелпер для ожидания асинхронных операций в Vue
- **`setActivePinia(createPinia())`** — изоляция store между тестами
- **`vi.mock('axios')`** — мок HTTP-клиента
- **`config.global.stubs`** — глобальные стабы компонентов Vue Router

## Как использовать / запустить

```bash
# Watch mode (для разработки)
npm run test

# Однократный прогон
npm run test:run

# UI-режим
npm run test:ui

# С отчётом о покрытии
npm run coverage
```

## Связи с другими доменами

- [config.md](config.md) — Vitest-конфигурация, скрипты package.json
- [auth.md](auth.md) — тесты аутентификации (api, store, router, views)
- [api.md](api.md) — тесты HTTP-клиента и эндпоинтов

## Нюансы и ограничения

- Покрытие тестами ограничено: протестированы auth (api, store, router, login/register views), но **нет тестов** для:
  - Projects Store, Sources Store, Tables Store, RPI Mappings Store
  - Workflow Store
  - Компонентов (KpiCards, ProjectsTable, RPI-компоненты, диалоги)
  - HomeView, ProjectDetailView, SourceDetailView, RPIMappingView, TableDetailView
  - Composables (useProject, useRPIFilters, useRPIMappingForm, useApiStatus)
- В конфигурации coverage исключены `src/main.js`, `src/**/*.mock.js`, `src/**/index.js`.
- `deps.inline` настроен на `vue-router` и `pinia` для корректной работы в jsdom.
