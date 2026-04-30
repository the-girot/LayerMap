# Источники данных и таблицы маппинга

> Управление источниками данных проектов, таблицами маппинга и их колонками (измерения/показатели).

## Расположение в репозитории

- `src/stores/sources.js` — Pinia-стор для CRUD источников
- `src/stores/tables.js` — Pinia-стор для CRUD таблиц маппинга и колонок
- `src/views/SourceDetailView.vue` — Страница детального просмотра источника
- `src/views/TableDetailView.vue` — Страница детального просмотра таблицы с колонками
- `src/components/common/CreateSourceDialog.vue` — Диалог создания источника
- `src/components/common/CreateMappingTableDialog.vue` — Диалог создания таблицы маппинга
- `src/components/common/CreateMappingColumnDialog.vue` — Диалог создания колонки
- `src/constants/resources.js` — Константы: типы источников, типы данных колонок, начальные формы

## Как устроено

### Иерархия

```
Project
 └── Source (источник данных: API / DB / FILE / STREAM)
      └── Mapping Table (таблица маппинга)
           └── Column (колонка: dimension / metric)
                ├── source_column_id → RPIMapping
                └── rpi_mapping_id → RPIMapping
```

### Sources Store (`src/stores/sources.js`)

**Состояние:** `sources` — `Record<projectId, Source[]>`

**Геттеры:**
- `getSourcesByProjectId(projectId)` — получить источники проекта
- `getSourceById(projectId, sourceId)` — получить источник по ID
- `getProjectSourceByProjectIdAndName(projectId, sourceName)` — поиск по имени

**Actions:** `loadSources`, `createSource`, `updateSource`, `deleteSource`

### Mapping Tables Store (`src/stores/tables.js`)

**Состояние:** `mappingTables` — `Record<projectId, MappingTable[]>`

**Геттеры:**
- `getMappingTablesByProjectId(projectId)` — таблицы проекта
- `getSourceColumnById(projectId, sourceColumnId)` — поиск колонки по всем таблицам

**Actions для таблиц:** `loadTables`, `createMappingTable`, `updateMappingTable`, `deleteMappingTable`

**Actions для колонок:** `createMappingTableColumn`, `updateMappingTableColumn`, `deleteMappingTableColumn`, `updateColumnRPIMapping`

### SourceDetailView (`src/views/SourceDetailView.vue`)

Независимая страница работы с источником данных:
- Информация об источнике
- Таблица колонок с возможностью для каждой выбрать показатель или измерение из РПИ
- Интеграция с RPIMappingsStore для выбора РПИ-связей

### TableDetailView (`src/views/TableDetailView.vue`)

Детальный просмотр таблицы маппинга с управлением колонками:
- Список колонок с типами (dimension/metric)
- CRUD-операции для колонок
- Связь колонок с РПИ-маппингами

### Константы источников (`src/constants/resources.js`)

```javascript
SOURCE_TYPE_OPTIONS = [
  { label: "API", value: "API" },
  { label: "DB", value: "DB" },
  { label: "FILE", value: "FILE" },
  { label: "STREAM", value: "STREAM" },
];

COLUMN_DATA_TYPE_OPTIONS = [
  "string", "integer", "number", "boolean", "date", "datetime", "text"
];

COLUMN_TYPE_OPTIONS = [
  { label: "Измерение", value: "dimension" },
  { label: "Метрика", value: "metric" },
];
```

## Ключевые сущности

**Source** (из JSDoc):
```javascript
{ id, project_id, name, description, type, row_count, last_updated, created_at }
```

**MappingTable** (из JSDoc):
```javascript
{ id, project_id, name, description, source_id, columns[], created_at, updated_at }
```

**MappingColumn** (из JSDoc):
```javascript
{ id, mapping_table_id, name, type: 'dimension'|'metric', data_type, description,
  is_calculated, formula, rpi_mapping_id, created_at }
```

## Как использовать / запустить

```javascript
import { useSourcesStore } from '@/stores/sources';
import { useMappingTablesStore } from '@/stores/tables';

const sourcesStore = useSourcesStore();
await sourcesStore.loadSources(projectId);
console.log(sourcesStore.getSourcesByProjectId(projectId));

const tablesStore = useMappingTablesStore();
await tablesStore.loadTables(projectId, sources);
console.log(tablesStore.getMappingTablesByProjectId(projectId));
```

## Связи с другими доменами

- [projects.md](projects.md) — `loadProjectData` оркестрирует загрузку источников и таблиц
- [rpi-mappings.md](rpi-mappings.md) — колонки связываются с РПИ-записями через `source_column_id`; `updateColumnRPIMapping` обновляет эту связь
- [api.md](api.md) — все CRUD-операции через API-слой
- [ui.md](ui.md) — диалоги создания (CreateSourceDialog, CreateMappingTableDialog, CreateMappingColumnDialog)

## Нюансы и ограничения

- `updateMappingTable` передаёт `tableId` как первый аргумент, но API требует также `sourceId` — потенциальная ошибка.
- При `createMappingTable` требуется `source_id` в данных, иначе выбрасывается исключение.
- При `createMappingTableColumn` и других операциях используется `parseInt()` для всех ID, хотя route params могут содержать строки.
- `handleApiError` дублируется между stores/sources.js и stores/tables.js.
