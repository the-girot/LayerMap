# API-интеграция

> Прослойка для взаимодействия с backend API: HTTP-клиент, перехватчики, типизированные методы для каждого эндпоинта, централизованная обработка ошибок.

## Расположение в репозитории

- `src/api/client.js` — Axios-клиент, перехватчики, вспомогательный объект `api`
- `src/api/auth.js` — Методы аутентификации
- `src/api/projects.js` — Все CRUD-методы для проектов, источников, таблиц, колонок, РПИ
- `src/composables/useApiStatus.js` — Мониторинг доступности API через `/health`

## Как устроено

### Архитектура API-слоя

```
Компонент/View
    ↓
Pinia Store (actions)
    ↓
API Service (src/api/*.js)
    ↓
apiClient (axios instance)  ←  response interceptor
    ↓
Backend API
```

### HTTP-клиент (`src/api/client.js`)

```javascript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
```

**Вспомогательный объект `api`** — обёртка, автоматически извлекающая `response.data`:

```javascript
export const api = {
  get:    (url, config) => apiClient.get(url, config).then((r) => r.data),
  post:   (url, data, config) => apiClient.post(url, data, config).then((r) => r.data),
  put:    (url, data, config) => apiClient.put(url, data, config).then((r) => r.data),
  patch:  (url, data, config) => apiClient.patch(url, data, config).then((r) => r.data),
  delete: (url, config) => apiClient.delete(url, config).then((r) => r.data),
};
```

### Перехватчики (`src/api/client.js:21-38`)

| Код | Обработка |
|-----|-----------|
| 403 | Пробрасывается как `ApiError(403, 'Нет прав доступа')` |
| 409 | Пробрасывается как `ApiError(409, 'Ресурс уже существует')` |
| 401 | Пробрасывается без изменений (обрабатывается в store) |
| прочие | Пробрасываются как есть |

### Класс `ApiError`

```javascript
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
```

### Эндпоинты (`src/api/projects.js`)

**Проекты:**
| Функция | Эндпоинт | Метод |
|---------|----------|-------|
| `getProjectsWithFilters` | `/projects` | GET (с query-параметрами) |
| `getProjectById` | `/projects/:id` | GET |
| `createProject` | `/projects` | POST |
| `updateProject` | `/projects/:id` | PATCH |
| `deleteProject` | `/projects/:id` | DELETE |
| `getProjectKpi` | `/projects/kpi` | GET |
| `getRecentProjects` | `/projects/recent` | GET |

**Источники данных (`/projects/:projectId/sources`):**
| Функция | Эндпоинт | Метод |
|---------|----------|-------|
| `getSources` | `/projects/:pid/sources` | GET |
| `getSourceById` | `/projects/:pid/sources/:sid` | GET |
| `createSource` | `/projects/:pid/sources` | POST |
| `updateSource` | `/projects/:pid/sources/:sid` | PATCH |
| `deleteSource` | `/projects/:pid/sources/:sid` | DELETE |

**Таблицы маппинга (`/projects/:pid/sources/:sid/tables`):**
| Функция | Эндпоинт | Метод |
|---------|----------|-------|
| `getMappingTables` | `/projects/:pid/sources/:sid/tables` | GET |
| `getMappingTableById` | `/projects/:pid/sources/:sid/tables/:tid` | GET |
| `createMappingTable` | `/projects/:pid/sources/:sid/tables` | POST |
| `updateMappingTable` | `/projects/:pid/sources/:sid/tables/:tid` | PATCH |
| `deleteMappingTable` | `/projects/:pid/sources/:sid/tables/:tid` | DELETE |

**Колонки (`/projects/:pid/sources/:sid/tables/:tid/columns`):**
| Функция | Эндпоинт | Метод |
|---------|----------|-------|
| `getMappingTableColumns` | `/projects/:pid/sources/:sid/tables/:tid/columns` | GET |
| `createMappingTableColumn` | `/projects/:pid/sources/:sid/tables/:tid/columns` | POST |
| `updateMappingTableColumn` | `/projects/:pid/sources/:sid/tables/:tid/columns/:cid` | PATCH |
| `deleteMappingTableColumn` | `/projects/:pid/sources/:sid/tables/:tid/columns/:cid` | DELETE |

**РПИ-маппинги (`/projects/:pid/rpi-mappings`):**
| Функция | Эндпоинт | Метод |
|---------|----------|-------|
| `getRPIMappings` | `/projects/:pid/rpi-mappings` | GET |
| `getRPIMappingsStats` | `/projects/:pid/rpi-mappings/stats` | GET |
| `getRPIMappingById` | `/projects/:pid/rpi-mappings/:rid` | GET |
| `createRPIMapping` | `/projects/:pid/rpi-mappings` | POST |
| `updateRPIMapping` | `/projects/:pid/rpi-mappings/:rid` | PATCH |
| `deleteRPIMapping` | `/projects/:pid/rpi-mappings/:rid` | DELETE |

### Мониторинг здоровья (`src/composables/useApiStatus.js`)

- Проверяет `GET /health` при инициализации
- Ожидает ответ `{ status: "healthy" }`
- Предоставляет реактивный статус для `ApiStatusIndicator.vue`

### Обработка ошибок в stores

Каждый store содержит функцию `handleApiError`, которая:
- При `401` вызывает `authStore.logout()`
- При `403/409/422` устанавливает человекочитаемое сообщение
- При `0/500+` устанавливает сообщение "Сервер недоступен"

## Ключевые сущности

- **`apiClient`** — сконфигурированный экземпляр Axios
- **`api`** — обёртка для автоматического извлечения `response.data`
- **`ApiError`** — кастомный класс ошибки с полем `status`
- **`ProjectsApi`** — объект, объединяющий все экспортированные функции для проектов

## Как использовать / запустить

```javascript
import { apiClient } from '@/api/client';
import { ProjectsApi } from '@/api/projects';

// Прямой вызов client
const { data } = await apiClient.get('/health');

// Через ProjectsApi
const projects = await ProjectsApi.getProjectsWithFilters({ status: 'active' });
const newProject = await ProjectsApi.createProject({ name: 'Test' });
```

## Связи с другими доменами

- [auth.md](auth.md) — использует `apiClient` с `withCredentials` для аутентификации
- [projects.md](projects.md) — использует `ProjectsApi` для CRUD проектов
- [sources.md](sources.md) — использует методы API для источников, таблиц и колонок
- [rpi-mappings.md](rpi-mappings.md) — использует методы API для РПИ-маппингов
- [ui.md](ui.md) — `ApiStatusIndicator.vue` использует `useApiStatus`
- [config.md](config.md) — `VITE_API_BASE_URL` задаёт базовый URL

## Нюансы и ограничения

- Нет перехватчика запросов (request interceptor) — токен не добавляется вручную, т.к. используется cookie-аутентификация.
- Нет моков или fallback-данных — приложение требует работающий backend.
- `getSources` в `auth.js:16` имеет конфликт имён: деструктурирует `data` из ответа Axios, в отличие от других методов где используется `apiClient.get().then(r => r.data)`.
- В сторах дублируется функция `handleApiError` (в `projects.js`, `tables.js`, `sources.js`, `rpiMappings.js`) — кандидат на вынесение в общий модуль.
