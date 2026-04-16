# Архитектура LayerMap

## Архитектурный паттерн

**Vue 3 SPA + Pinia (state) + Vue Router (routing) + PrimeVue (UI)**

```
┌─────────────────────────────────────────────────────────┐
│                        App.vue                          │
│                    <router-view />                      │
├─────────────────────────────────────────────────────────┤
│  Router (createWebHistory)                              │
│  ┌─────────────┬──────────────────────────────────────┐ │
│  │ AppLayout   │  children: HomeView                  │ │
│  │ (topbar +   ├──────────────────────────────────────┤ │
│  │  content)   │  /projects → AppLayout               │ │
│  │             │    children: ProjectsListView        │ │
│  │             │              ProjectDetailView       │ │
│  │             │              RPIMappingView          │ │
│  │             │              SourceDetailView        │ │
│  └─────────────┴──────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  Pinia Stores                                           │
│  ┌──────────────────────┬─────────────────────────────┐ │
│  │ projects.js          │ workflow.js                 │ │
│  │ - mockProjects       │ - workflows (per projectId) │ │
│  │ - mockSources        │ - STEP_ORDER                │ │
│  │ - mockMappingTables  │ - completeRPIForm()         │ │
│  │ - mockRPIMappings    │ - completeTablesStep()      │ │
│  │ - CRUD actions       │ - completeColumnsStep()     │ │
│  └──────────────────────┴─────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  UI Layer: PrimeVue 4.3.1 (Aura theme) + Tailwind CSS  │
│  Components: DataTable, Dialog, Select, Button, Badge   │
│  Auto-import via unplugin-vue-components + PrimeVueRes. │
└─────────────────────────────────────────────────────────┘
```

## Точки входа

| Файл                  | Описание                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `index.html`          | HTML shell, `<script type="module" src="/src/main.js">`                                              |
| `src/main.js`         | createApp(App) → use(Pinia) → use(Router) → use(PrimeVue, Aura) → use(DialogService) → mount('#app') |
| `src/App.vue`         | `<router-view />` — корневой компонент                                                               |
| `src/router/index.js` | `createAppRouter()` — фабрика роутера, экспортируется                                                |

## Router

**Base path:** `/` (createWebHistory)

| Route                             | Name          | Component                     | Описание                                          |
| --------------------------------- | ------------- | ----------------------------- | ------------------------------------------------- |
| `/`                               | Home          | AppLayout → HomeView          | Дашборд (KPI, таблица проектов, быстрые действия) |
| `/projects`                       | projects      | AppLayout                     | Redirect → `/projects/list`                       |
| `/projects/list`                  | ProjectsList  | AppLayout → ProjectsListView  | Карточки проектов                                 |
| `/projects/:id`                   | ProjectDetail | AppLayout → ProjectDetailView | Детали проекта                                    |
| `/projects/:id/mapping`           | RPIMapping    | AppLayout → RPIMappingView    | Редактирование РПИ                                |
| `/projects/:id/sources/:sourceId` | SourceDetail  | AppLayout → SourceDetailView  | Детали источника                                  |

**Guards:** отсутствуют — все страницы доступны свободно.

## Схема взаимодействия и потоки данных

### Поток: Создание РПИ-записи

```
User → RPIMappingView.openAddPanel()
  → form reactive object populated
  → User fills form → saveRule()
    → validation (measurement, objectField required)
    → projectsStore.addRPIMapping(projectId, form)
      → rpiMappings[projectId].push({id, number, ...form})
    → closePanel() → UI re-renders via computed filteredRows
```

### Поток: Создание таблицы маппинга + колонки

```
User → RPIMappingView.openAddTableDialog()
  → tableForm reactive → saveTable()
    → projectsStore.addMappingTable(projectId, {name, description})
      → mappingTables[projectId].push({id, name, description, columns: []})
  → User → openAddColumnDialog(table)
    → columnForm reactive (type defaults to DIMENSION)
    → saveColumn()
      → projectsStore.addColumnToTable(projectId, tableId, {name, type, dataType, description})
        → table.columns.push({id, name, type, dataType, description, rpiMappingId: null})
```

### Поток: Маппинг колонки на РПИ

```
User → SourceDetailView → Select v-model="column.rpiMappingId"
  → onColumnMappingChange(column, newRpiMappingId)
    → projectsStore.updateColumnRPIMapping(projectId, tableId, columnId, rpiMappingId)
      → column.rpiMappingId = rpiMappingId (reactive update)
```

### Поток: Workflow (RPI Form → Tables → Columns)

```
User completes RPI form → completeRPIForm(projectId, rpiData)
  → validation: rpiData.name required, step must be ACTIVE, not submitting
  → steps[RPI_FORM].status = COMPLETED
  → rpiEntityId = Date.now()
  → isProjectLocked = false
  → steps[TABLES].status = ACTIVE
  → saveWorkflowState(projectId, workflow) → localStorage

User completes tables → completeTablesStep(projectId, tablesData)
  → validation: RPI form COMPLETED, at least 1 table
  → steps[TABLES].status = COMPLETED
  → steps[COLUMNS].status = ACTIVE

User completes columns → completeColumnsStep(projectId, columnsData)
  → validation: tables COMPLETED
  → steps[COLUMNS].status = COMPLETED
```

## Реактивные связи

```
Pinia Store (reactive ref)
  → computed() in views (auto-tracking)
    → PrimeVue components (DataTable, Select, etc.)
      → User interaction (click, change)
        → Store action (mutates ref)
          → computed re-evaluates
            → DOM updates (Vue reactivity)
```

---

[← На главную](../OVERVIEW.md) | [Stores →](../stores/STORES.md)
