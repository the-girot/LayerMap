# Таблицы маппинга и колонки

> Управление таблицами маппинга и их колонками: CRUD, типы колонок (dimension/metric), связь с РПИ-маппингами.

## Расположение в репозитории

- `src/api/projects.js` — API-функции: CRUD таблиц (`getMappingTables`, `createMappingTable`) и колонок (`getMappingTableColumns`, `createMappingTableColumn`, `updateMappingTableColumn`, `deleteMappingTableColumn`)
- `src/stores/tables.js` — Pinia store: состояние таблиц и колонок, `updateColumnRPIMapping`
- `src/views/TableDetailView.vue` — Детальный просмотр таблицы с колонками
- `src/components/common/CreateMappingTableDialog.vue` — Диалог создания таблицы
- `src/components/common/CreateMappingColumnDialog.vue` — Диалог создания/редактирования колонки
- `src/constants/resources.js` — Типы колонок, типы данных

## Как устроено

Таблицы маппинга — это сущности, группирующие колонки источника. Колонки бывают двух типов:

- **dimension** (Измерение) — аналитические разрезы
- **metric** (Метрика/Показатель) — числовые значения

Колонки могут быть:
- **обычными** — прямые маппинги из источника
- **расчётными** (`is_calculated = true`) — с формулой (`formula`)

**Связь с РПИ**: каждая колонка может быть привязана к РПИ-маппингу через `rpi_mapping_id`. Эта связь устанавливается через `updateColumnRPIMapping`.

Состояние в store: `Record<projectId, MappingTable[]>` с вложенным массивом `table.columns`.

## Ключевые сущности

| Сущность | Файл | Назначение |
|----------|------|------------|
| `useMappingTablesStore` | `stores/tables.js:39` | Store: CRUD таблиц и колонок |
| `loadTables(projectId, sources)` | `stores/tables.js:81` | Загрузка таблиц для всех источников проекта |
| `createMappingTable(projectId, data)` | `stores/tables.js:107` | Создание таблицы маппинга |
| `createMappingTableColumn(...)` | `stores/tables.js:189` | Создание колонки |
| `updateColumnRPIMapping(...)` | `stores/tables.js:307` | Привязка колонки к РПИ-маппингу |
| `getSourceColumnById(projectId, columnId)` | `stores/tables.js:65` | Поиск колонки по ID среди всех таблиц проекта |
| `COLUMN_TYPE_OPTIONS` | `constants/resources.js:52` | Измерение / Метрика |
| `COLUMN_DATA_TYPE_OPTIONS` | `constants/resources.js:41` | string, integer, number, boolean, date, datetime, text |

## Как использовать / запустить

```javascript
import { useMappingTablesStore } from '@/stores/tables';

const tablesStore = useMappingTablesStore();

// Создание таблицы
await tablesStore.createMappingTable(42, { source_id: 1, name: 'sales_orders' });

// Создание колонки
await tablesStore.createMappingTableColumn(42, 1, 5, {
  name: 'order_amount',
  type: 'metric',
  data_type: 'number',
});

// Привязка колонки к РПИ
await tablesStore.updateColumnRPIMapping(42, 1, 5, 10, 100, 'rpi_metric_id');

// Поиск колонки по ID
const { column, table } = tablesStore.getSourceColumnById(42, 10);
```

## Связи с другими доменами

- [sources.md](sources.md) — таблицы привязаны к source_id
- [rpi-mappings.md](rpi-mappings.md) — РПИ-маппинги валидируются через `getSourceColumnById` и `validateRPIMappingLink`
- [projects.md](projects.md) — TablesStore заполняется через `loadProjectData`
- [api.md](api.md) — использует API функции из `projects.js`

## Нюансы и ограничения

- `loadTables` загружает таблицы для ВСЕХ источников проекта через `Promise.all` — ошибка в одном источнике не блокирует остальные
- `updateColumnRPIMapping` обновляет одно поле за раз (`rpi_dimension_id` или `rpi_metric_id`)
- Поиск колонки (`getSourceColumnById`) — O(n*m) по всем таблицам и их колонкам; при большом количестве данных может быть медленным
- API-функции таблиц используют путь `/projects/{projectId}/sources/{sourceId}/tables` и его вариации
