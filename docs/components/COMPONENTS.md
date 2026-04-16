# Компоненты и Views

## Layout — `src/layout/`

### AppLayout.vue

- `AppTopbar` (Menubar с навигацией + текущая дата/время)
- Sidebar с `v-model:isVisible`, состояние в `localStorage`
- `<router-view>` для контента

### AppTopbar.vue

- PrimeVue Menubar с items: Solara (home), Проекты, Финансы, About, Dash
- Реактивные часы (обновление каждую минуту)

---

## Views — `src/views/`

| View                    | Описание                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `HomeView.vue`          | KpiCards + ProjectsTable + QuickActions                                                                                                                                  |
| `ProjectsListView.vue`  | Сетка карточек проектов (Card), навигация к ProjectDetail/RPIMapping                                                                                                     |
| `ProjectDetailView.vue` | Breadcrumbs, статистика, DataTable источников, quick actions                                                                                                             |
| `RPIMappingView.vue`    | Полнофункциональный редактор РПИ: таблицы маппинга (CRUD), колонки (CRUD с type: metric/dimension), основная таблица РПИ с фильтрами/пагинацией, side-panel для add/edit |
| `SourceDetailView.vue`  | Информация об источнике, таблица колонок с Select для маппинга на РПИ                                                                                                    |

---

## Components — `src/components/`

| Component                    | Описание                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `home/KpiCards.vue`          | 4 KPI-карточки с анимацией count-up (requestAnimationFrame, ease-out quad)    |
| `home/ProjectsTable.vue`     | Адаптивный: DataTable (desktop) / Card grid (mobile < 768px)                  |
| `home/QuickActions.vue`      | 4 action-карточки с навигацией                                                |
| `workflow/StepIndicator.vue` | Визуальный stepper с состояниями locked/active/completed, валидация переходов |

---

## Utilities — `src/utils/`

### `format.js`

| Функция | Описание |
|---------|----------|
| `formatDate(dateStr)` | Форматирование даты → ru-RU locale |
| `formatNumber(n)` | Форматирование чисел → Intl.NumberFormat ru-RU |

### `status.js`

| Функция | Описание |
|---------|----------|
| `getProjectStatusSeverity(status)` | Severity для badge статуса проекта |
| `getProjectStatusLabel(status)` | Локализация статуса проекта |
| `getSourceTypeSeverity(type)` | Severity для типа источника |
| `getMappingStatusLabel(s)` | Локализация статуса маппинга |

---

[← Назад к Stores](../stores/STORES.md) | [Модель данных →](../DATA_MODEL.md)
