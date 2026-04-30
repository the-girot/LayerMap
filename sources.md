# Источники данных

> Управление источниками данных проекта: CRUD, типы источников, связь с таблицами маппинга.

## Расположение в репозитории

- `src/api/projects.js` — API-функции: `getSources`, `getSourceById`, `createSource`, `updateSource`, `deleteSource`
- `src/stores/sources.js` — Pinia store: состояние источников по projectId
- `src/views/ProjectDetailView.vue` — Отображение источников в проекте
- `src/views/SourceDetailView.vue` — Детальный просмотр источника
- `src/components/common/CreateSourceDialog.vue` — Диалог создания/редактирования источника
- `src/constants/resources.js` — `SOURCE_TYPE_OPTIONS`, `createEmptySourceForm`

## Как устроено

Источники данных — это сущности, привязанные к проекту. Каждый источник описывает, откуда берутся данные: база данных, API, файл или поток.

**Состояние в store**: `Record<projectId, Source[]>` — источники сгруппированы по projectId для быстрого доступа.

**Типы источников** (из констант):
- `API` — внешний или внутренний API
- `DB` — реляционная база данных
- `FILE` — файловый источник
- `STREAM` — потоковая обработка

## Ключевые сущности

| Сущность | Файл | Назначение |
|----------|------|------------|
| `useSourcesStore` | `stores/sources.js:38` | Store: CRUD источников |
| `loadSources(projectId)` | `stores/sources.js:84` | Загрузка источников проекта |
| `createSource(projectId, data)` | `stores/sources.js:104` | Создание источника |
| `getSourcesByProjectId(id)` | `stores/sources.js:54` | Getter: источники по проекту |
| `SOURCE_TYPE_OPTIONS` | `constants/resources.js:7` | Опции типов для UI |

## Как использовать / запустить

```javascript
import { useSourcesStore } from '@/stores/sources';

const sourcesStore = useSourcesStore();

// Загрузка источников проекта
await sourcesStore.loadSources(42);

// Создание источника
await sourcesStore.createSource(42, {
  name: 'ClickHouse Analytics',
  type: 'DB',
  description: 'Основная аналитическая БД',
});

// Получение источников проекта
const sources = sourcesStore.getSourcesByProjectId(42);
```

## Связи с другими доменами

- [projects.md](projects.md) — SourcesStore заполняется через `loadProjectData` из ProjectsStore
- [tables.md](tables.md) — для каждого источника загружаются таблицы маппинга
- [api.md](api.md) — использует `ProjectsApi.getSources` и другие функции
- [rpi-mappings.md](rpi-mappings.md) — РПИ-записи ссылаются на source_column_id через таблицы источника

## Нюансы и ограничения

- Store хранит источники как `Record<number, Source[]>`, а не единый массив — осторожно с мутациями
- `handleApiError` идентичен паттерну во всех stores: 401 → logout, 403/409/422 → русские сообщения
- Нет отдельного API-файла для источников — функции находятся в `projects.js`
