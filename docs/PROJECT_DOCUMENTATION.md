# LayerMap Project Documentation

## 1. Project Overview

**Project Name:** LayerMap (package: `self-admin`)

**Description:** LayerMap is a RPI (Реестр Показателей Индикаторов — Registry of Indicators) mapping management system that enables users to create and manage analytical projects, define data sources (API, DB, FILE, STREAM), create mapping tables with columns, and map columns to RPI indicators (metrics and dimensions). The system provides a workflow-driven approach to building data mappings, with status tracking for approval processes.

**Technology Stack:**

- **Framework:** Vue 3.5.13 with Composition API (`<script setup>`)
- **UI Library:** PrimeVue 4.3.1 with Aura theme
- **State Management:** Pinia v3.0.1
- **Routing:** Vue Router 4.5.0
- **Build Tool:** Vite 6.4.1
- **Styling:** TailwindCSS 3.4.1 with `tailwindcss-primeui` plugin
- **Icons:** PrimeIcons 7.0.0
- **Linting:** ESLint 9.20.1 with `eslint-plugin-vue` and `@vue/eslint-config-prettier`
- **Formatting:** Prettier 3.5.1

**Architecture Summary:**

- **Type:** Single Page Application (SPA)
- **Component Structure:** Component-based architecture with reusable UI components, dialog forms, and layout components
- **Data Flow Pattern:** Unidirectional data flow via Pinia stores; composable functions for reusable logic
- **API Integration:** Custom HTTP client with automatic fallback to mock data when backend unavailable
- **Key Pattern:** camelCase in application ↔ snake_case in API (bidirectional conversion)

**High-Level Component Tree:**

```
App.vue
├── AppLayout.vue
│   ├── AppTopbar.vue (Menubar navigation)
│   ├── ApiStatusIndicator.vue
│   └── router-view
│       ├── HomeView.vue
│       │   ├── KpiCards.vue
│       │   ├── ProjectsTable.vue
│       │   └── QuickActions.vue
│       ├── ProjectsListView.vue
│       ├── ProjectDetailView.vue
│       │   ├── StepIndicator.vue
│       │   └── router-view
│       │       ├── RPIMappingView.vue
│       │       │   ├── RPIMappingHeader.vue
│       │       │   ├── RPIMappingToolbar.vue
│       │       │   ├── RPIMappingTable.vue
│       │       │   └── RPIMappingPanel.vue
│       │       └── SourceDetailView.vue
```

---

## 2. Getting Started

### Prerequisites

- **Node.js:** Version 18.x or higher (tested with Node 20.x)
- **Package Manager:** npm (comes with Node.js) or yarn

### Local Setup

1. **Clone the repository:**

```bash
git clone <repository-url>
cd LayerMap
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment variables:**
   Create a `.env` file in the project root (already provided with default values):

```env
VITE_API_BASE_URL=http://localhost:8000
```

4. **Run development server:**

```bash
npm run dev
```

5. **Access the application:**
   Open `http://localhost:5173` in your browser

### Available Scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build for production                     |
| `npm run preview` | Preview production build locally         |
| `npm run lint`    | Run ESLint with auto-fix                 |
| `npm run format`  | Format code with Prettier                |

### Environment Variables Reference

| Variable            | Required | Default                 | Description                            |
| ------------------- | -------- | ----------------------- | -------------------------------------- |
| `VITE_API_BASE_URL` | No       | `http://localhost:8000` | Backend API base URL for HTTP requests |

---

## 3. Project Structure

### Annotated Directory Tree

```
LayerMap/
├── .env                          # Environment variables (API base URL)
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.mjs               # Vite configuration with PrimeVue resolver
├── tailwind.config.js            # TailwindCSS theme and design tokens
├── postcss.config.js             # PostCSS configuration (Tailwind + Autoprefixer)
├── docs/                         # Project documentation
│   ├── PROJECT_OVERVIEW.md       # High-level project overview
│   ├── OVERVIEW.md               # Additional overview documentation
│   ├── DATA_MODEL.md             # Data model documentation
│   ├── architecture/
│   │   └── ARCHITECTURE.md       # System architecture documentation
│   ├── components/
│   │   └── COMPONENTS.md         # Component documentation
│   ├── stores/
│   │   └── STORES.md             # Store documentation
│   ├── guides/
│   │   └── DEVELOPMENT.md        # Development guidelines
│   └── testing/
│       └── TESTING.md            # Testing documentation
├── public/
│   └── favicon.ico               # Favicon
└── src/
    ├── App.vue                   # Root Vue component
    ├── main.js                   # Application entry point
    ├── api/                      # API service layer
    │   ├── client.js             # Base HTTP client with interceptors
    │   ├── projects.js           # API service definitions
    │   └── projectsWithMock.js   # API with mock data fallback
    ├── assets/                   # Static assets
    │   ├── logo.svg              # Project logo
    │   └── main.css              # Global styles and CSS variables
    ├── components/               # Reusable Vue components
    │   ├── common/               # Shared UI components
    │   │   ├── ApiStatusIndicator.vue    # API connection status indicator
    │   │   ├── CreateSourceDialog.vue    # Source creation dialog
    │   │   ├── CreateMappingTableDialog.vue  # Mapping table creation dialog
    │   │   ├── CreateMappingColumnDialog.vue   # Column creation dialog
    │   │   └── CreateRPIMappingDialog.vue    # RPI mapping creation dialog
    │   ├── home/                 # Home page components
    │   │   ├── KpiCards.vue              # KPI cards display
    │   │   ├── ProjectsTable.vue         # Projects table/card view
    │   │   └── QuickActions.vue          # Quick action buttons
    │   ├── rpi/                  # RPI mapping components
    │   │   ├── RPIMappingHeader.vue      # RPI page header
    │   │   ├── RPIMappingPanel.vue       # RPI form side panel
    │   │   ├── RPIMappingTable.vue       # RPI data table
    │   │   └── RPIMappingToolbar.vue     # RPI filter toolbar
    │   └── workflow/             # Workflow components
    │       └── StepIndicator.vue         # Multi-step workflow indicator
    ├── composables/              # Reusable composition functions
    │   ├── useApiStatus.js       # API availability checking
    │   ├── useProject.js         # Project data loading helper
    │   ├── useRPIFilters.js      # RPI filtering and pagination
    │   └── useRPIMappingForm.js  # RPI form state management
    ├── constants/                # Application constants
    │   ├── resources.js          # Source types, column data types
    │   ├── rpi.js                # RPI form options and empty state
    │   └── workflow.js           # Workflow steps and statuses
    ├── data/                     # Mock data for development
    │   └── mock.js               # Mock projects and RPI data
    ├── layout/                   # Layout components
    │   ├── AppLayout.vue         # Main application layout
    │   └── AppTopbar.vue         # Top navigation bar
    ├── router/                   # Vue Router configuration
    │   └── index.js              # Route definitions
    ├── stores/                   # Pinia stores
    │   ├── projects.js           # Project, source, table, column, RPI state
    │   └── workflow.js           # Workflow state management
    └── utils/                    # Utility functions
        ├── caseConverter.js      # camelCase ↔ snake_case conversion
        ├── format.js             # Date and number formatting
        ├── mapping.js            # Mapping helper functions
        └── status.js             # Status label and severity helpers
```

### Key Files and Responsibilities

| File                                                           | Responsibility                                                        |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`src/main.js`](src/main.js:1)                                 | Application bootstrap, plugin registrations (Pinia, Router, PrimeVue) |
| [`src/App.vue`](src/App.vue:1)                                 | Root Vue component (minimal wrapper)                                  |
| [`src/router/index.js`](src/router/index.js:1)                 | Route definitions and navigation guards                               |
| [`src/stores/projects.js`](src/stores/projects.js:1)           | CRUD operations for projects, sources, tables, columns, RPI mappings  |
| [`src/stores/workflow.js`](src/stores/workflow.js:1)           | Workflow state management with localStorage persistence               |
| [`src/api/client.js`](src/api/client.js:1)                     | Base HTTP client with error handling and key conversion               |
| [`src/api/projectsWithMock.js`](src/api/projectsWithMock.js:1) | API services with automatic mock data fallback                        |
| [`src/assets/main.css`](src/assets/main.css:1)                 | Global CSS variables, theme configuration, PrimeVue overrides         |

---

## 4. Routing Reference

### `/` — Home Dashboard

**Component:** [`HomeView.vue`](src/views/HomeView.vue:1)

**Description:** Dashboard displaying KPI cards (projects count, sources count, RPI records), projects table/card view, and quick action buttons.

**Auth required:** No

**Route params:** None

**Query params:** None

**Guards / middleware:** None

---

### `/projects` — Projects Redirect

**Component:** Redirect to `/projects/list`

**Description:** Redirects to the projects list page.

**Auth required:** No

**Route params:** None

**Query params:** None

**Guards / middleware:** None

---

### `/projects/list` — Projects List

**Component:** [`ProjectsListView.vue`](src/views/ProjectsListView.vue:1)

**Description:** Card-based listing of all projects with status badges and quick actions.

**Auth required:** No

**Route params:** None

**Query params:** None

**Guards / middleware:** None

---

### `/projects/:id` — Project Detail

**Component:** [`ProjectDetailView.vue`](src/views/ProjectDetailView.vue:1)

**Description:** Detailed view of a single project showing sources, mapping tables, and RPI mappings. Includes workflow step indicator.

**Auth required:** No

**Route params:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | String | Project ID |

**Query params:** None

**Guards / middleware:** None

---

### `/projects/:id/mapping` — RPI Mapping Editor

**Component:** [`RPIMappingView.vue`](src/views/RPIMappingView.vue:1)

**Description:** RPI mapping editor with data table, filter toolbar, and side panel form for adding/editing RPI records.

**Auth required:** No

**Route params:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | String | Project ID |

**Query params:** None

**Guards / middleware:** None

---

### `/projects/:id/sources/:sourceId` — Source Detail

**Component:** [`SourceDetailView.vue`](src/views/SourceDetailView.vue:1)

**Description:** Detailed view of a data source showing its columns and mapping configuration.

**Auth required:** No

**Route params:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | String | Project ID |
| `sourceId` | String | Source ID |

**Query params:** None

**Guards / middleware:** None

---

## 5. Pages & Views

### HomeView.vue

**Path:** `src/views/HomeView.vue`

**Purpose:** Dashboard page displaying project statistics and quick navigation.

**Key data:**

- Projects count, sources count, RPI records count
- Last update date
- List of projects with status badges

**API endpoints:**

- `GET /projects` — Fetch all projects

**Emitted events:** None

**Global state mutations:** Reads from `useProjectsStore()`

---

### ProjectsListView.vue

**Path:** `src/views/ProjectsListView.vue`

**Purpose:** Card-based listing of all projects.

**Key data:**

- Project cards with name, description, status
- RPI status counts (approved, review, draft)

**API endpoints:**

- `GET /projects` — Fetch all projects

**Emitted events:** None

**Global state mutations:** Reads from `useProjectsStore()`

---

### ProjectDetailView.vue

**Path:** `src/views/ProjectDetailView.vue`

**Purpose:** Detailed project view with sources, mapping tables, and RPI mappings.

**Key data:**

- Project details (name, description, status)
- Sources list with row counts
- Mapping tables with columns
- RPI mappings table

**API endpoints:**

- `GET /projects/:id` — Fetch project details
- `GET /projects/:id/sources` — Fetch project sources
- `GET /projects/:id/mapping-tables` — Fetch mapping tables
- `GET /projects/:id/rpi-mappings` — Fetch RPI mappings

**Emitted events:**

- `source:create` — Create new source
- `table:create` — Create new mapping table
- `column:create` — Create new column
- `rpi:create` — Create new RPI mapping
- `rpi:update` — Update RPI mapping
- `rpi:delete` — Delete RPI mapping

**Global state mutations:** Reads/writes to `useProjectsStore()`

---

### RPIMappingView.vue

**Path:** `src/views/RPIMappingView.vue`

**Purpose:** RPI mapping editor with table, filters, and form panel.

**Key data:**

- RPI records with filters (status, ownership, measurement type)
- Pagination state
- Active RPI record for editing

**API endpoints:**

- `GET /projects/:id/rpi-mappings` — Fetch RPI mappings
- `POST /projects/:id/rpi-mappings` — Create RPI mapping
- `PUT /rpi-mappings/:id` — Update RPI mapping
- `DELETE /rpi-mappings/:id` — Delete RPI mapping

**Emitted events:** None

**Global state mutations:** Reads/writes to `useProjectsStore()`, uses `useRPIFilters()` composable

---

### SourceDetailView.vue

**Path:** `src/views/SourceDetailView.vue`

**Purpose:** Source detail view with column management.

**Key data:**

- Source details (name, type, row count)
- Mapping columns with types and data types
- RPI mappings linked to source

**API endpoints:**

- `GET /projects/:id/sources/:sourceId` — Fetch source details
- `GET /projects/:id/mapping-tables` — Fetch mapping tables
- `POST /projects/:id/mapping-tables/:tableId/columns` — Create column
- `PUT /mapping-columns/:id` — Update column
- `DELETE /mapping-columns/:id` — Delete column

**Emitted events:**

- `column:create` — Create new column
- `column:update` — Update column
- `column:delete` — Delete column

**Global state mutations:** Reads/writes to `useProjectsStore()`

---

## 6. Component Library

### ApiStatusIndicator.vue

**Path:** `src/components/common/ApiStatusIndicator.vue`

**Description:** Displays API connection status with color-coded indicator (green = connected, yellow = checking, red = disconnected). Includes refresh button.

**Props:** None

**Emits:** None

**Slots:** None

**Usage example:**

```vue
<ApiStatusIndicator />
```

---

### CreateSourceDialog.vue

**Path:** `src/components/common/CreateSourceDialog.vue`

**Description:** Modal dialog for creating a new data source.

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `modelValue` | Boolean | No | `false` | Dialog visibility |
| `projectId` | String\|Number | Yes | — | Project ID |
| `sources` | Array | No | `[]` | List of existing sources |

**Emits:**
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `update:modelValue` | Boolean | Dialog visibility change |
| `create` | Object | New source data with `project_id` |

**Slots:** None

**Usage example:**

```vue
<CreateSourceDialog
  v-model="showSourceDialog"
  :project-id="projectId"
  :sources="sources"
  @create="handleCreateSource"
/>
```

---

### CreateMappingTableDialog.vue

**Path:** `src/components/common/CreateMappingTableDialog.vue`

**Description:** Modal dialog for creating a new mapping table.

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `modelValue` | Boolean | No | `false` | Dialog visibility |
| `projectId` | String\|Number | Yes | — | Project ID |
| `sources` | Array | No | `[]` | List of sources for dropdown |

**Emits:**
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `update:modelValue` | Boolean | Dialog visibility change |
| `create` | Object | New table data with `project_id` |

**Slots:** None

**Usage example:**

```vue
<CreateMappingTableDialog
  v-model="showTableDialog"
  :project-id="projectId"
  :sources="sources"
  @create="handleCreateTable"
/>
```

---

### CreateMappingColumnDialog.vue

**Path:** `src/components/common/CreateMappingColumnDialog.vue`

**Description:** Modal dialog for creating a new mapping column. Supports basic and calculated columns.

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `modelValue` | Boolean | No | `false` | Dialog visibility |
| `projectId` | String\|Number | Yes | — | Project ID |
| `tableId` | String\|Number | No | `null` | Mapping table ID |

**Emits:**
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `update:modelValue` | Boolean | Dialog visibility change |
| `create` | Object | New column data with `mapping_table_id` |

**Slots:** None

**Usage example:**

```vue
<CreateMappingColumnDialog
  v-model="showColumnDialog"
  :project-id="projectId"
  :table-id="tableId"
  @create="handleCreateColumn"
/>
```

---

### CreateRPIMappingDialog.vue

**Path:** `src/components/common/CreateRPIMappingDialog.vue`

**Description:** Modal dialog for creating a new RPI mapping record.

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `modelValue` | Boolean | No | `false` | Dialog visibility |
| `projectId` | String\|Number | Yes | — | Project ID |
| `rpiMappings` | Array | No | `[]` | Existing RPI mappings (for number auto-increment) |
| `columns` | Array | No | `[]` | Available columns for source column selection |

**Emits:**
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `update:modelValue` | Boolean | Dialog visibility change |
| `create` | Object | New RPI mapping data with `project_id` |

**Slots:** None

**Usage example:**

```vue
<CreateRPIMappingDialog
  v-model="showRpiDialog"
  :project-id="projectId"
  :rpi-mappings="rpiMappings"
  :columns="columns"
  @create="handleCreateRpi"
/>
```

---

### KpiCards.vue

**Path:** `src/components/home/KpiCards.vue`

**Description:** Displays animated KPI cards for projects count, sources count, RPI records, and last update date.

**Props:** None

**Emits:** None

**Slots:** None

**Usage example:**

```vue
<KpiCards />
```

---

### ProjectsTable.vue

**Path:** `src/components/home/ProjectsTable.vue`

**Description:** Responsive projects display — cards on mobile, DataTable on desktop.

**Props:** None

**Emits:**
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `row-click` | Object | Row click event with `data` |

**Slots:** None

**Usage example:**

```vue
<ProjectsTable @row-click="handleProjectClick" />
```

---

### QuickActions.vue

**Path:** `src/components/home/QuickActions.vue`

**Description:** Grid of quick action buttons for common tasks.

**Props:** None

**Emits:** None

**Slots:** None

**Usage example:**

```vue
<QuickActions />
```

---

### RPIMappingHeader.vue

**Path:** `src/components/rpi/RPIMappingHeader.vue`

**Description:** Sticky header for RPI mapping page with project name, record counts, and add button.

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projectName` | String | Yes | — | Project name |
| `totalCount` | Number | Yes | — | Total RPI records |
| `approvedCount` | Number | Yes | — | Approved records count |
| `reviewCount` | Number | Yes | — | Review records count |
| `draftCount` | Number | Yes | — | Draft records count |

**Emits:**
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `back` | — | Navigate back |
| `add` | — | Add new RPI record |

**Slots:** None

**Usage example:**

```vue
<RPIMappingHeader
  :project-name="projectName"
  :total-count="totalCount"
  :approved-count="approvedCount"
  :review-count="reviewCount"
  :draft-count="draftCount"
  @back="handleBack"
  @add="handleAdd"
/>
```

---

### RPIMappingPanel.vue

**Path:** `src/components/rpi/RPIMappingPanel.vue`

**Description:** Side panel form for adding/editing RPI records. Includes source selection, field mapping, and validation.

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `panelOpen` | Boolean | No | — | Panel visibility |
| `panelMode` | String | No | — | 'add' or 'edit' |
| `form` | Object | No | `{}` | Form data |
| `formTouched` | Boolean | No | `false` | Form touched state |
| `projectSources` | Array | No | `[]` | Project sources |
| `columnOptions` | Array | No | `[]` | Column options for source |
| `selectedColumn` | Object | No | `null` | Selected column |
| `selectedSourceObj` | Object | No | `null` | Selected source object |
| `projectMappingTables` | Array | No | `[]` | Project mapping tables |

**Emits:**
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `close` | — | Close panel |
| `save` | — | Save form |
| `delete` | — | Delete record |
| `source-change` | String | Source name change |
| `field-change` | Object | Field option change |

**Slots:** None

**Usage example:**

```vue
<RPIMappingPanel
  v-model:panel-open="panelOpen"
  v-model:panel-mode="panelMode"
  v-model:form="form"
  :form-touched="formTouched"
  :project-sources="sources"
  :column-options="columnOptions"
  :selected-column="selectedColumn"
  :selected-source-obj="selectedSourceObj"
  @close="panelOpen = false"
  @save="handleSave"
  @delete="handleDelete"
/>
```

---

### RPIMappingTable.vue

**Path:** `src/components/rpi/RPIMappingTable.vue`

**Description:** PrimeVue DataTable for RPI records with pagination and selection.

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `rows` | Array | Yes | — | RPI records to display |
| `activeRow` | Object | No | `null` | Currently selected row |
| `filteredCount` | Number | Yes | — | Total filtered records |
| `pageFirst` | Number | Yes | — | First row index |
| `pageSize` | Number | Yes | — | Rows per page |
| `projectId` | String | Yes | — | Project ID |
| `mappingTables` | Array | Yes | — | Mapping tables |
| `sources` | Array | Yes | — | Sources |

**Emits:**
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `row-select` | Object | Row selection event |
| `edit` | Object | Edit event with row data |
| `page` | Object | Page change event |
| `reset-filters` | — | Reset filters |

**Slots:** None

**Usage example:**

```vue
<RPIMappingTable
  :rows="paginatedRows"
  :active-row="activeRow"
  :filtered-count="filteredCount"
  :page-first="pageFirst"
  :page-size="pageSize"
  :project-id="projectId"
  :mapping-tables="mappingTables"
  :sources="sources"
  @row-select="handleRowSelect"
  @edit="handleEdit"
  @page="handlePage"
  @reset-filters="handleResetFilters"
/>
```

---

### RPIMappingToolbar.vue

**Path:** `src/components/rpi/RPIMappingToolbar.vue`

**Description:** Filter toolbar for RPI records with search, status, ownership, and type filters.

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `search` | String | No | `''` | Search query |
| `selectedStatus` | String\|null | No | `null` | Selected status |
| `selectedOwnership` | String\|null | No | `null` | Selected ownership |
| `selectedMeasurementType` | String\|null | No | `null` | Selected measurement type |
| `selectedCalculatedType` | String\|null | No | `null` | Selected calculated type |
| `quickFilters` | Array | Yes | — | Quick filter chips |
| `filteredCount` | Number | Yes | — | Filtered count |
| `totalRows` | Number | Yes | — | Total rows |

**Emits:**
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `update:search` | String | Search query change |
| `update:selectedStatus` | String\|null | Status filter change |
| `update:selectedOwnership` | String\|null | Ownership filter change |
| `update:selectedMeasurementType` | String\|null | Measurement type filter change |
| `update:selectedCalculatedType` | String\|null | Calculated type filter change |
| `reset` | — | Reset all filters |

**Slots:** None

**Usage example:**

```vue
<RPIMappingToolbar
  v-model:search="search"
  v-model:selected-status="selectedStatus"
  v-model:selected-ownership="selectedOwnership"
  v-model:selected-measurement-type="selectedMeasurementType"
  v-model:selected-calculated-type="selectedCalculatedType"
  :quick-filters="quickFilters"
  :filtered-count="filteredCount"
  :total-rows="totalRows"
  @reset="handleResetFilters"
/>
```

---

### StepIndicator.vue

**Path:** `src/components/workflow/StepIndicator.vue`

**Description:** Visual indicator for multi-step workflow process with locked/active/completed states.

**Props:**
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `steps` | Array | Yes | — | Array of step objects with `id`, `label`, `status` |
| `currentStep` | String | No | `null` | Current active step ID |
| `locked` | Boolean | No | `false` | Lock navigation |

**Emits:**
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `step-click` | Object | Step click event |

**Slots:** None

**Usage example:**

```vue
<StepIndicator
  :steps="workflowSteps"
  :current-step="currentStep"
  :locked="isLocked"
  @step-click="handleStepClick"
/>
```

---

## 7. State Management

### Pinia Stores

#### projects.js

**Purpose:** Manages CRUD operations for projects, sources, mapping tables, columns, and RPI mappings.

**State Shape:**

```javascript
{
  projects: [],              // Array of project objects
  sources: {},               // projectId → Array of sources
  mappingTables: {},         // projectId → Array of tables
  columns: {},               // projectId → Array of columns
  rpiMappings: {},           // projectId → Array of RPI mappings
  lastUpdateDate: '',        // ISO date string
  apiAvailable: true,        // Backend availability flag
  apiError: null,            // Last API error message
}
```

**Getters / Computed Values:**

- `totalSources` — Total count of all sources across projects
- `totalTables` — Total count of all mapping tables
- `totalColumns` — Total count of all columns
- `totalRpi` — Total count of all RPI mappings
- `lastUpdateDate` — Most recent update timestamp

**Actions:**

| Action                               | Parameters                 | Side Effects                                                           |
| ------------------------------------ | -------------------------- | ---------------------------------------------------------------------- |
| `loadProjects()`                     | None                       | Fetches all projects, populates sources/tables/columns/RPI per project |
| `loadProjectData(projectId)`         | `projectId: string`        | Fetches all data for a specific project                                |
| `createProject(data)`                | `data: object`             | POST to `/projects`, adds to `projects` array                          |
| `updateProject(id, data)`            | `id: string, data: object` | PUT to `/projects/:id`, updates project                                |
| `deleteProject(id)`                  | `id: string`               | DELETE to `/projects/:id`, removes from array                          |
| `createSource(data)`                 | `data: object`             | POST to `/projects/:id/sources`, adds to sources                       |
| `updateSource(id, data)`             | `id: string, data: object` | PUT to `/sources/:id`, updates source                                  |
| `deleteSource(id)`                   | `id: string`               | DELETE to `/sources/:id`, removes from sources                         |
| `createMappingTable(data)`           | `data: object`             | POST to `/projects/:id/mapping-tables`, adds to tables                 |
| `updateMappingTable(id, data)`       | `id: string, data: object` | PUT to `/mapping-tables/:id`, updates table                            |
| `deleteMappingTable(id)`             | `id: string`               | DELETE to `/mapping-tables/:id`, removes from tables                   |
| `createMappingTableColumn(data)`     | `data: object`             | POST to `/mapping-tables/:tableId/columns`, adds to columns            |
| `updateMappingTableColumn(id, data)` | `id: string, data: object` | PUT to `/mapping-columns/:id`, updates column                          |
| `deleteMappingTableColumn(id)`       | `id: string`               | DELETE to `/mapping-columns/:id`, removes from columns                 |
| `createRPIMapping(data)`             | `data: object`             | POST to `/projects/:id/rpi-mappings`, adds to RPI                      |
| `updateRPIMapping(id, data)`         | `id: string, data: object` | PUT to `/rpi-mappings/:id`, updates RPI                                |
| `deleteRPIMapping(id)`               | `id: string`               | DELETE to `/rpi-mappings/:id`, removes from RPI                        |

**Usage example:**

```javascript
import { useProjectsStore } from "@/stores/projects";

const store = useProjectsStore();
await store.loadProjects();
await store.createRPIMapping({
  number: 1,
  ownership: "Аналитика",
  measurement: "Выручка",
  // ...
});
```

---

#### workflow.js

**Purpose:** Manages workflow state with localStorage persistence.

**State Shape:**

```javascript
{
  currentStep: null,         // Current workflow step ID
  completedSteps: [],        // Array of completed step IDs
  projectWorkflow: {},       // projectId → workflow state
}
```

**Getters / Computed Values:**

- `steps` — Computed array of step objects with status

**Actions:**

- `setStep(stepId)` — Set current step
- `completeStep(stepId)` — Mark step as completed
- `resetWorkflow()` — Reset all workflow state
- `loadFromStorage()` — Load from localStorage
- `saveToStorage()` — Save to localStorage

**Usage example:**

```javascript
import { useWorkflowStore } from "@/stores/workflow";

const workflow = useWorkflowStore();
await workflow.loadFromStorage();
workflow.completeStep("rpi_form");
workflow.setStep("tables");
```

---

### Composables

#### useProject.js

**Purpose:** Helper composable for loading project data.

**Returns:**

```javascript
{
  project: ref(null),
  sources: ref([]),
  tables: ref([]),
  columns: ref([]),
  rpiMappings: ref([]),
  loadProject(projectId)
}
```

**Usage example:**

```javascript
import { useProject } from "@/composables/useProject";

const { project, sources, tables, loadProject } = useProject();
await loadProject("123");
```

---

#### useRPIMappingForm.js

**Purpose:** Manages RPI form state and validation.

**Returns:**

```javascript
{
  form: ref(emptyForm),
  formTouched: ref(false),
  selectedColumn: ref(null),
  selectedSourceObj: ref(null),
  resetForm(),
  validateRPIMappingLink()
}
```

**Usage example:**

```javascript
import { useRPIMappingForm } from "@/composables/useRPIMappingForm";

const { form, formTouched, resetForm, validateRPIMappingLink } =
  useRPIMappingForm();
await validateRPIMappingLink();
```

---

#### useRPIFilters.js

**Purpose:** Filtering and pagination for RPI records.

**Parameters:**

- `rows` — Array of RPI records
- `options` — Optional configuration

**Returns:**

```javascript
{
  search: ref(''),
  selectedStatus: ref(null),
  selectedOwnership: ref(null),
  selectedMeasurementType: ref(null),
  selectedCalculatedType: ref(null),
  pageFirst: ref(0),
  pageSize: ref(10),
  filteredRows: computed(...),
  paginatedRows: computed(...),
  resetFilters()
}
```

**Usage example:**

```javascript
import { useRPIFilters } from "@/composables/useRPIFilters";

const filters = useRPIFilters(rpiMappings.value, { pageSize: 20 });
const filtered = filters.filteredRows;
```

---

#### useApiStatus.js

**Purpose:** Checks backend availability and provides status.

**Returns:**

```javascript
{
  status: ref('checking' \| 'available' \| 'error'),
  loading: ref(false),
  available: ref(false),
  error: ref(null),
  refresh()
}
```

**Usage example:**

```javascript
import { useApiStatus } from "@/composables/useApiStatus";

const { status, available, refresh } = useApiStatus();
await refresh();
```

---

## 8. API Integration Layer

### HTTP Client Setup

**File:** [`src/api/client.js`](src/api/client.js:1)

**Base URL:** Configured via `VITE_API_BASE_URL` environment variable (default: `http://localhost:8000`)

**Interceptors:**

- **Request:** Converts camelCase keys to snake_case for API compatibility
- **Response:** Converts snake_case keys to camelCase for application use
- **Error Handling:** Wraps errors in `ApiError` class with status and message

**Key Conversion:**

```javascript
// camelCase → snake_case
{ projectId: '123', rpiMappings: [...] }
// →
// { project_id: '123', rpi_mappings: [...] }

// snake_case → camelCase
{ project_id: '123', rpi_mappings: [...] }
// →
// { projectId: '123', rpiMappings: [...] }
```

---

### API Services

#### projectsWithMock.js

**File:** [`src/api/projectsWithMock.js`](src/api/projectsWithMock.js:1)

**Description:** API service with automatic mock data fallback when backend is unavailable.

**Functions:**

| Function                             | Endpoint                                        | Method | Parameters                           | Response Type          |
| ------------------------------------ | ----------------------------------------------- | ------ | ------------------------------------ | ---------------------- |
| `getProjects()`                      | `/projects`                                     | GET    | None                                 | `Array<Project>`       |
| `getProject(id)`                     | `/projects/:id`                                 | GET    | `id: string`                         | `Project`              |
| `createProject(data)`                | `/projects`                                     | POST   | `data: object`                       | `Project`              |
| `updateProject(id, data)`            | `/projects/:id`                                 | PUT    | `id: string, data: object`           | `Project`              |
| `deleteProject(id)`                  | `/projects/:id`                                 | DELETE | `id: string`                         | `void`                 |
| `getSources(projectId)`              | `/projects/:id/sources`                         | GET    | `projectId: string`                  | `Array<Source>`        |
| `createSource(data)`                 | `/projects/:id/sources`                         | POST   | `data: object`                       | `Source`               |
| `updateSource(id, data)`             | `/sources/:id`                                  | PUT    | `id: string, data: object`           | `Source`               |
| `deleteSource(id)`                   | `/sources/:id`                                  | DELETE | `id: string`                         | `void`                 |
| `getMappingTables(projectId)`        | `/projects/:id/mapping-tables`                  | GET    | `projectId: string`                  | `Array<MappingTable>`  |
| `createMappingTable(data)`           | `/projects/:id/mapping-tables`                  | POST   | `data: object`                       | `MappingTable`         |
| `updateMappingTable(id, data)`       | `/mapping-tables/:id`                           | PUT    | `id: string, data: object`           | `MappingTable`         |
| `deleteMappingTable(id)`             | `/mapping-tables/:id`                           | DELETE | `id: string`                         | `void`                 |
| `getColumns(projectId)`              | `/projects/:id/mapping-tables/:tableId/columns` | GET    | `projectId: string, tableId: string` | `Array<MappingColumn>` |
| `createMappingTableColumn(data)`     | `/mapping-tables/:tableId/columns`              | POST   | `data: object`                       | `MappingColumn`        |
| `updateMappingTableColumn(id, data)` | `/mapping-columns/:id`                          | PUT    | `id: string, data: object`           | `MappingColumn`        |
| `deleteMappingTableColumn(id)`       | `/mapping-columns/:id`                          | DELETE | `id: string`                         | `void`                 |
| `getRpiMappings(projectId)`          | `/projects/:id/rpi-mappings`                    | GET    | `projectId: string`                  | `Array<RPIMapping>`    |
| `createRPIMapping(data)`             | `/projects/:id/rpi-mappings`                    | POST   | `data: object`                       | `RPIMapping`           |
| `updateRPIMapping(id, data)`         | `/rpi-mappings/:id`                             | PUT    | `id: string, data: object`           | `RPIMapping`           |
| `deleteRPIMapping(id)`               | `/rpi-mappings/:id`                             | DELETE | `id: string`                         | `void`                 |

**Error Handling:**

- Catches network errors and returns mock data
- Logs warnings to console for debugging
- Sets `apiAvailable` flag in store

**Usage example:**

```javascript
import { getProjects, createRPIMapping } from "@/api/projects";

const projects = await getProjects();
const newRpi = await createRPIMapping({
  project_id: "123",
  number: 1,
  // ...
});
```

---

## 9. UI & Styling

### UI Component Library

**Library:** PrimeVue 4.3.1

**Theme:** Aura (default PrimeVue theme)

**Key Components Used:**

- `Menubar` — Top navigation
- `Dialog` — Modal dialogs
- `Button` — Action buttons
- `InputText` — Text inputs
- `InputNumber` — Numeric inputs
- `Textarea` — Multi-line text
- `Dropdown` — Select dropdowns
- `Select` — Multi-select / single-select
- `Checkbox` — Boolean checkboxes
- `Calendar` — Date picker
- `DataTable` — Data tables
- `Column` — Table columns
- `Paginator` — Pagination controls
- `Badge` — Status badges
- `Tag` — Status tags
- `Card` — Card containers

---

### Theme / Design Tokens

**File:** [`src/assets/main.css`](src/assets/main.css:1)

**Primary Colors:**

```css
--primary: #01696f;
--primary-hover: #0c4e54;
--primary-active: #0f3638;
--primary-highlight: #cedcd8;
```

**Surface Colors:**

```css
--surface-base: #f7f6f2;
--surface-card: #f9f8f5;
--surface-offset: #f3f0ec;
```

**Content Colors:**

```css
--content-default: #28251d;
--content-muted: #7a7974;
--content-faint: #bab9b4;
```

**Semantic Colors (PrimeVue variables):**

- `--app-success`, `--app-success-bg`, `--app-success-border`, `--app-success-text`
- `--app-warning`, `--app-warning-bg`, `--app-warning-border`, `--app-warning-text`
- `--app-error`, `--app-error-bg`, `--app-error-border`, `--app-error-text`
- `--app-info`, `--app-info-bg`, `--app-info-border`, `--app-info-text`

---

### Global Styles and CSS Architecture

**Approach:** TailwindCSS utility classes with custom CSS variables for semantic colors.

**File Structure:**

- `src/assets/main.css` — Global CSS variables, PrimeVue overrides, custom animations
- `tailwind.config.js` — Tailwind theme configuration with custom colors

**CSS Architecture:**

- **No BEM** — Uses Tailwind utility classes
- **No CSS Modules** — Scoped styles only in component `<style scoped>`
- **No Tailwind JIT** — Uses standard Tailwind with custom config

**Custom Animations:**

```css
/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

/* Side panel animation */
.side-panel-enter-active,
.side-panel-leave-active {
  transition: all 0.3s ease;
}

/* Pulse animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

---

### Breakpoints and Responsive Strategy

**Tailwind Breakpoints:**
| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Small tablets, large phones |
| `md` | 768px | Tablets, desktop |
| `lg` | 1024px | Large desktops |
| `xl` | 1280px | Extra large screens |
| `2xl` | 1536px | Ultra wide screens |

**Responsive Patterns:**

- **Mobile-first:** Base styles for mobile, `md:` and above for desktop
- **ProjectsTable:** Cards on mobile (`< 768px`), DataTable on desktop
- **RPIMappingPanel:** Full width on mobile, sticky side panel on desktop (`md:`)
- **Grid layouts:** `grid-cols-2` on mobile, `md:grid-cols-4` on desktop

---

## 10. Forms & Validation

### Form Libraries

**Approach:** Native Vue forms with PrimeVue components. No external form validation library (e.g., VeeValidate, FormKit) is used.

**Validation Strategy:**

- **Required fields:** Checked via `!form.value.field.trim()`
- **Conditional validation:** e.g., formula required for calculated columns
- **Visual feedback:** `p-invalid` class on invalid fields
- **Error messages:** Small text elements below fields

---

### Form Components

#### CreateSourceDialog.vue

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Yes | `!form.name.trim()` |
| `description` | String | No | — |
| `type` | String | Yes | Dropdown selection |
| `row_count` | Number | No | — |
| `mapping_table_id` | String\|null | No | — |

**Submission flow:**

1. User fills form
2. `handleSubmit()` validates required fields
3. Emits `create` event with form data + `project_id`
4. Parent component handles API call
5. Form resets on success

---

#### CreateMappingTableDialog.vue

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Yes | `!form.name.trim()` |
| `description` | String | No | — |
| `source_id` | String | Yes | Dropdown selection, `sources.length > 0` |

**Submission flow:**

1. User selects source (required)
2. User enters table name (required)
3. `handleSubmit()` validates
4. Emits `create` event with form data + `project_id`

---

#### CreateMappingColumnDialog.vue

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | String | Yes | `!form.name.trim()` |
| `type` | String | Yes | Dropdown (`dimension` \| `metric`) |
| `data_type` | String | Yes | Dropdown (string, integer, number, boolean, date, datetime, text) |
| `description` | String | No | — |
| `is_calculated` | Boolean | No | — |
| `formula` | String | Conditional | Required if `is_calculated === true` |

**Submission flow:**

1. User fills basic fields
2. User toggles "Расчётная колонка" checkbox
3. If checked, formula becomes required
4. `handleSubmit()` validates
5. Emits `create` event with form data + `mapping_table_id`

---

#### CreateRPIMappingDialog.vue

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `number` | Number | Yes | Auto-incremented |
| `ownership` | String | Yes | Dropdown selection |
| `status` | String | Yes | Dropdown (`draft` \| `in_review` \| `approved`) |
| `block` | String | No | — |
| `measurement_type` | String | Yes | Dropdown (`Измерение` \| `Метрика`) |
| `is_calculated` | Boolean | No | — |
| `formula` | String | Conditional | Required if `is_calculated === true` |
| `measurement` | String | Yes | `!form.measurement.trim()` |
| `measurement_description` | String | Yes | `!form.measurement_description.trim()` |
| `source_report` | String | No | — |
| `object_field` | String | Yes | `!form.object_field.trim()` |
| `source_column_id` | String\|null | No | Dropdown selection |
| `date_added` | String | No | Date picker |
| `date_removed` | String\|null | No | — |
| `comment` | String | No | — |
| `verification_file` | String | No | — |

**Submission flow:**

1. User fills required fields
2. If "Расчётный показатель" checked, formula becomes required
3. `handleSubmit()` validates all required fields
4. Emits `create` event with form data + `project_id`

---

## 11. Configuration & Build

### Vite Configuration

**File:** [`vite.config.mjs`](vite.config.mjs:1)

**Highlights:**

```javascript
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      resolvers: [PrimeVueResolver()], // Auto-import PrimeVue components
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)), // @ alias for src/
    },
  },
});
```

**Aliases:**

- `@` → `./src`

**Plugins:**

- `@vitejs/plugin-vue` — Vue SFC support
- `vite-plugin-vue-devtools` — Vue DevTools integration
- `unplugin-vue-components` — Auto-import components
- `@primevue/auto-import-resolver` — PrimeVue component resolver

---

### Linting and Formatting

**ESLint:**

- **Config:** `@eslint/js`, `eslint-plugin-vue`, `@vue/eslint-config-prettier`
- **Script:** `npm run lint` — Runs with `--fix` flag

**Prettier:**

- **Config:** Implicit (uses default Prettier settings)
- **Script:** `npm run format` — Formats `src/` directory

---

### CI/CD Pipeline

**Status:** Not present in codebase

**Note:** No CI/CD configuration files (e.g., `.github/workflows/`, `.gitlab-ci.yml`) are present in the repository.

---

## 12. Testing

### Test Setup

**Status:** Not present in codebase

**Note:** No testing framework (Vitest, Jest, Cypress) is configured in the project.

### How to Run Tests

> N/A — not present in this codebase

---

## 13. Known Limitations & TODOs

### Hard-Coded Values

1. **Ownership options** — Hard-coded in multiple components:

   - `CreateRPIMappingDialog.vue` line 58-63
   - `RPIMappingPanel.vue` line 69
   - Should be moved to `constants/rpi.js`

2. **Status options** — Duplicated across files:

   - `CreateRPIMappingDialog.vue` line 66-70
   - `RPIMappingPanel.vue` line 72-76
   - Should use `RPI_STATUS_OPTIONS` from `constants/rpi.js`

3. **Measurement type options** — Hard-coded in dialogs:
   - Should use `RPI_MEASUREMENT_TYPES` from `constants/rpi.js`

---

### Known Bugs or Edge Cases

1. **Source column type mismatch** — `validateRPIMappingLink()` logs warning but doesn't block save:

   ```javascript
   // src/composables/useRPIMappingForm.js:100-105
   if (selectedColumn.value?.dataType !== expectedType) {
     console.warn("Type mismatch:", { dataType, expectedType });
   }
   ```

2. **Empty source handling** — When no source is selected, `objectField` is manual input:

   - No validation that manual field matches source column types

3. **Mock data fallback** — Always returns mock data on error, no user notification:
   - `src/api/projectsWithMock.js` logs warning but UI shows mock data silently

---

### Planned Improvements (from comments)

1. **Form validation** — Comments indicate need for better validation:

   - `CreateRPIMappingDialog.vue` line 121-128: Manual validation instead of library

2. **Type safety** — JSDoc types used but no TypeScript:

   - Consider migrating to TypeScript for better type safety

3. **API error handling** — Comments suggest improving error UX:
   - `src/api/client.js` line 45-50: Error wrapping could include more context

---

## 14. Glossary

| Term                | Definition                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| **RPI**             | Реестр Показателей Индикаторов (Registry of Indicators) — system for managing analytical metrics and dimensions |
| **РПИ**             | Russian abbreviation for RPI                                                                                    |
| **Маппинг**         | Mapping — process of connecting source columns to RPI indicators                                                |
| **Показатель**      | Indicator / Metric — a measured value in the RPI system                                                         |
| **Измерение**       | Dimension — a categorical attribute for grouping metrics                                                        |
| **Метрика**         | Metric — a quantitative measure                                                                                 |
| **Базовый**         | Basic — a column directly from source data                                                                      |
| **Расчётный**       | Calculated — a column derived from formula                                                                      |
| **Принадлежность**  | Ownership — department/team responsible for an RPI record                                                       |
| **Утверждено**      | Approved — RPI status indicating final approval                                                                 |
| **На проверке**     | In Review — RPI status indicating pending review                                                                |
| **Черновик**        | Draft — RPI status indicating work in progress                                                                  |
| **camelCase**       | JavaScript naming convention (e.g., `projectId`)                                                                |
| **snake_case**      | API naming convention (e.g., `project_id`)                                                                      |
| **Store**           | Pinia store — centralized state management module                                                               |
| **Composable**      | Vue 3 composition function for reusable logic                                                                   |
| **Bounded Context** | Domain-driven design term for a logical boundary of functionality                                               |

---

## Appendix: Data Models

### Project

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "archived";
  sources: Source[];
  rpiRecords: RPIMapping[];
  createdAt: string;
  updatedAt: string;
}
```

### Source

```typescript
interface Source {
  id: string;
  project_id: string;
  name: string;
  description: string;
  type: "API" | "DB" | "FILE" | "STREAM";
  row_count: number;
  last_updated: string;
}
```

### MappingTable

```typescript
interface MappingTable {
  id: string;
  project_id: string;
  name: string;
  description: string;
  source_id: string;
  columns: MappingColumn[];
}
```

### MappingColumn

```typescript
interface MappingColumn {
  id: string;
  mapping_table_id: string;
  name: string;
  type: "metric" | "dimension";
  data_type:
    | "string"
    | "integer"
    | "number"
    | "boolean"
    | "date"
    | "datetime"
    | "text";
  description: string;
  is_calculated: boolean;
  formula: string | null;
}
```

### RPIMapping

```typescript
interface RPIMapping {
  id: string;
  number: number;
  project_id: string;
  ownership: string;
  status: "approved" | "review" | "draft";
  measurement_type: "Измерение" | "Метрика";
  is_calculated: boolean;
  formula: string | null;
  measurement: string;
  measurement_description: string;
  source_report: string;
  object_field: string;
  source_column_id: string | null;
  date_added: string;
  date_removed: string | null;
  comment: string;
  verification_file: string | null;
}
```

---

_Document generated from codebase analysis. Last updated: 2024_
