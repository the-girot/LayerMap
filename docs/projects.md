# Проекты

> Управление проектами регуляторной отчётности: CRUD, KPI-метрики, фильтрация и пагинация, оркестрация загрузки связанных данных.

## Расположение в репозитории

- `src/api/projects.js` — API-методы для проектов (+ getProjectKpi, getRecentProjects, getProjectsWithFilters)
- `src/stores/projects.js` — Pinia-стор с CRUD, KPI, пагинацией
- `src/composables/useProject.js` — Composable для получения projectId из route
- `src/views/HomeView.vue` — Дашборд с KPI и таблицей проектов
- `src/views/ProjectsListView.vue` — Список проектов (детальный)
- `src/views/ProjectDetailView.vue` — Детальный просмотр одного проекта
- `src/components/home/KpiCards.vue` — Карточки KPI
- `src/components/home/ProjectsTable.vue` — Таблица проектов
- `src/components/home/QuickActions.vue` — Быстрые действия
- `src/components/common/CreateProjectDialog.vue` — Диалог создания проекта

## Как устроено

### Иерархия данных

```
Project
 ├── Sources (источники данных)
 │    └── Mapping Tables (таблицы маппинга)
 │         └── Columns (колонки: dimension/metric)
 └── RPI Mappings (регуляторные показатели)
```

### Store (`src/stores/projects.js`)

**Состояние:**
```javascript
{
  projects: [],              // Список проектов
  loading: false,            // Флаг загрузки
  error: null,               // Сообщение об ошибке
  projectKpi: {},            // KPI по projectId
  projectPagination: {       // Пагинация
    total: 0, page: 1, size: 10
  },
}
```

**Вычисляемые свойства:**
- `totalSources` — сумма `p.sources` по всем проектам
- `totalRpi` — сумма `p.rpiRecords` по всем проектам
- `lastUpdateDate` — максимальная `updated_at` среди всех проектов

**Ключевые actions:**

| Action | Описание | Вызовы API |
|--------|----------|------------|
| `loadProjects` | Загружает проекты с фильтрацией | `GET /projects` |
| `loadProjectKpi` | Загружает KPI для проекта | `GET /projects/kpi` |
| `loadProjectData` | Оркестрирует загрузку: проект + источники + таблицы + РПИ | 4 параллельных запроса |
| `createProject` | Создаёт проект | `POST /projects` |
| `updateProject` | Обновляет проект | `PATCH /projects/:id` |
| `deleteProject` | Удаляет проект | `DELETE /projects/:id` |

### Оркестрация `loadProjectData` (`src/stores/projects.js:223-267`)

```javascript
async function loadProjectData(projectId) {
  const [project, projectSources, projectRpi] = await Promise.all([
    ProjectsApi.getProjectById(projectId),
    ProjectsApi.getSources(projectId),
    ProjectsApi.getRPIMappings(projectId),
  ]);
  // ... обновление в sub-stores: sourcesStore, tablesStore, rpiStore
}
```

### Фильтрация проектов (`src/api/projects.js:20-36`)

Параметры: `status`, `search`, `page`, `size`, `sort_by`, `sort_dir`.

## Ключевые сущности

**Project** (из JSDoc в `src/stores/projects.js`):
```javascript
{
  id: number, name: string, description: string,
  status: string, sources: number, rpiRecords: number,
  approved: number, drafts: number, inReview: number,
  created_at: string, updated_at: string
}
```

## Как использовать / запустить

```javascript
import { useProjectsStore } from '@/stores/projects';
import { useProject } from '@/composables/useProject';

const store = useProjectsStore();
await store.loadProjects({ status: 'active', page: 1, size: 10 });
console.log(store.projects);

// Composable для view
const { projectId, project, loadProjectData, loading } = useProject();
await loadProjectData();
```

## Связи с другими доменами

- [api.md](api.md) — использует `ProjectsApi` для HTTP-запросов
- [sources.md](sources.md) — `loadProjectData` оркестрирует загрузку источников и таблиц
- [rpi-mappings.md](rpi-mappings.md) — `loadProjectData` оркестрирует загрузку РПИ
- [workflow.md](workflow.md) — воркфлоу блокирует доступ к проекту до заполнения РПИ-формы
- [ui.md](ui.md) — `KpiCards`, `ProjectsTable`, `QuickActions` отображают данные проектов

## Нюансы и ограничения

- `loadProjectKpi` принимает `projectId` как аргумент, но `GET /projects/kpi` не использует параметры пути — это потенциально несоответствие API.
- `handleApiError` дублируется в сторах проектов, источников, таблиц и РПИ.
- `getProjectById` — геттер, а не computed — вызывается как метод `store.getProjectById(id)`.
