# Stores — Хранилища состояния

## `src/stores/projects.js` — ProjectsStore

**Зона ответственности:** CRUD для всех сущностей проекта. Данные хранятся в mock-объектах, изолированных по `projectId`.

### State

| Ref | Тип | Описание |
|-----|-----|----------|
| `projects` | `ref<MockProject[]>` | Список проектов |
| `sources` | `ref<Record<projectId, MockSource[]>>` | Источники по проекту |
| `mappingTables` | `ref<Record<projectId, MappingTable[]>>` | Таблицы маппинга по проекту |
| `rpiMappings` | `ref<Record<projectId, RPIMapping[]>>` | РПИ-записи по проекту |

### Computed

- `totalSources` — сумма источников всех проектов
- `totalRpi` — сумма РПИ-записей всех проектов
- `lastUpdateDate` — максимальная дата обновления

### Actions (CRUD)

| Метод | Параметры | Описание |
|-------|-----------|----------|
| `getProjectById(id)` | `id: number` | Найти проект |
| `getSourcesByProjectId(projectId)` | `projectId: number` | Источники проекта |
| `getMappingTablesByProjectId(projectId)` | `projectId: number` | Таблицы маппинга |
| `addMappingTable(projectId, table)` | `table: {name, description}` | Создать таблицу |
| `updateMappingTable(projectId, tableId, updates)` | — | Обновить таблицу |
| `deleteMappingTable(projectId, tableId)` | — | Удалить таблицу |
| `addColumnToTable(projectId, tableId, column)` | `column: {name, type, dataType, description}` | Добавить колонку (type: metric\|dimension) |
| `updateColumnRPIMapping(projectId, tableId, columnId, rpiMappingId)` | — | Связать колонку с РПИ |
| `getRPIMappingOptions(projectId)` | — | Опции для dropdown маппинга |
| `getRPIMappingsByProjectId(projectId)` | — | Все РПИ-записи проекта |
| `addRPIMapping(projectId, mapping)` | `mapping: RPIMapping` | Создать РПИ-запись |
| `updateRPIMapping(projectId, mappingId, updates)` | — | Обновить РПИ-запись |
| `deleteRPIMapping(projectId, mappingId)` | — | Удалить РПИ-запись |
| `getSourceById(projectId, sourceId)` | — | Найти источник в контексте проекта |
| `getRPIMappingById(projectId, mappingId)` | — | Найти РПИ-запись в контексте проекта |

---

## `src/stores/workflow.js` — WorkflowStore

**Зона ответственности:** Управление многошаговым процессом (RPI Form → Tables → Columns). Состояние персистируется в `localStorage`.

### Константы

```
WORKFLOW_STEPS = { RPI_FORM, TABLES, COLUMNS }
STEP_STATUS = { LOCKED, ACTIVE, COMPLETED }
COLUMN_TYPES = { METRIC: 'metric', DIMENSION: 'dimension' }
```

### State

`workflows: ref<Record<projectId, WorkflowState>>`

### WorkflowState

```ts
{
  projectId: number,
  steps: { [stepId]: { status, completedAt, data } },
  isProjectLocked: boolean,
  rpiEntityId: number | null,
  isSubmitting: boolean,
  validationError: string | null,
  updatedAt: number
}
```

### Actions

| Метод | Описание |
|-------|----------|
| `completeRPIForm(projectId, rpiData)` | Завершить шаг 1, разблокировать проект и шаг 2 |
| `completeTablesStep(projectId, tablesData)` | Завершить шаг 2, разблокировать шаг 3 |
| `completeColumnsStep(projectId, columnsData)` | Завершить шаг 3 |
| `resetWorkflow(projectId)` | Сбросить состояние |
| `clearValidationError(projectId)` | Очистить ошибку |
| `initializeWorkflow(projectId)` | Загрузить из localStorage |

### Computed-функции

- `getWorkflow(projectId)` — ленивая инициализация
- `isProjectUnlocked(projectId)` — доступ разрешён
- `getCurrentStep(projectId)` — текущий активный шаг
- `getStepStatus(projectId, stepId)` — статус конкретного шага
- `isRPIFormCompleted(projectId)` — шаг 1 завершён
- `getRPIEntityId(projectId)` — ID сохранённой РПИ
- `isSubmitting(projectId)` — идёт отправка
- `getValidationError(projectId)` — ошибка валидации

---

[← Назад к архитектуре](../architecture/ARCHITECTURE.md) | [Компоненты →](../components/COMPONENTS.md)
