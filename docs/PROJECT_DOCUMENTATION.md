# LayerMap — Project Documentation

> Administrative panel for managing projects and RPI (Regulatory Performance Indicator) mappings.

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![PrimeVue](https://img.shields.io/badge/PrimeVue-4-3B82F6)](https://primevue.org/)

---

## 1. Project Overview

### Description

**LayerMap** is a single-page administrative web application designed for managing complex regulatory compliance projects. The application enables users to create and track projects, define data sources, establish mapping tables between source columns and regulatory indicators, and manage RPI (Regulatory Performance Indicator) mappings with full validation and workflow enforcement.

The application is built for compliance officers, data analysts, and project managers who need to maintain structured mappings between internal data sources and external regulatory requirements.

### Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Vue.js | 3.5.13 |
| State Management | Pinia | 3.0.1 |
| Router | Vue Router | 4.5.0 |
| UI Library | PrimeVue | 4.3.1 |
| Build Tool | Vite | 6.4.1 |
| HTTP Client | Axios | latest |
| Styling | Tailwind CSS | 3.4.1 |
| Testing | Vitest | 4.1.5 |
| CSS Framework | PrimeVue Aura Theme | - |

### Architecture Summary

**Type**: Single Page Application (SPA) with client-side routing

**Component Architecture**:
- **Composition API** - All components use Vue 3 Composition API with `<script setup>` syntax
- **Pinia Stores** - Centralized state management with modular stores (auth, projects, workflow)
- **Composables** - Reusable logic extracted into composable functions
- **Dialog Pattern** - Modal dialogs for create/edit operations
- **Accordion Pattern** - Collapsible sections for hierarchical data display
- **Side Panel Pattern** - Slide-out panel for inline editing

**Data Flow Pattern**:
```
User Action → Component → Composable/Store → API Service → HTTP Client → Backend API
                                                              ↓
Response ← Store Update ← Component Update ← UI Render ← JSON
```

### High-Level Component Tree

```
App.vue
├── AppLayout.vue
│   ├── AppTopbar.vue
│   │   ├── Logo
│   │   ├── Navigation Menu
│   │   ├── User Menu (auth state)
│   │   └── API Status Indicator
│   └── RouterView
│       ├── HomeView
│       │   ├── KpiCards
│       │   ├── ProjectsTable
│       │   └── QuickActions
│       ├── LoginView
│       ├── RegisterView
│       ├── ProjectsListView
│       ├── ProjectDetailView
│       │   └── Accordion (Sources)
│       │       └── Accordion (Mapping Tables)
│       │           └── Accordion (Columns)
│       ├── SourceDetailView
│       │   ├── MappingTableSelector
│       │   ├── MappingColumnSelector
│       │   └── RPIMappingTable
│       └── RPIMappingView
│           ├── RPIMappingHeader
│           ├── RPIMappingToolbar
│           ├── RPIMappingPanel (side panel)
│           └── RPIMappingTable
└── PrimeVue Toast (global notifications)
```

---

## 2. Getting Started

### Prerequisites

- **Node.js**: Version 18+ (tested with 20.x)
- **Package Manager**: npm 9+ or yarn 1.22+
- **Browser**: Modern browser with ES2020 support (Chrome 90+, Firefox 88+, Safari 14+)
- **Backend API**: LayerMap backend service running at configured base URL

### Local Setup

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd LayerMap
```

#### Step 2: Install Dependencies

```bash
npm install
```

This installs all dependencies defined in [`package.json`](package.json):
- Vue 3 ecosystem (vue, vue-router, pinia)
- PrimeVue UI components and PrimeIcons
- Vite build tool and plugins
- Tailwind CSS with PrimeUI plugin
- Vitest for testing
- ESLint and Prettier for code quality

#### Step 3: Configure Environment

Copy the environment variables from `.env` (already present):

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000
```

The application uses `httpOnly` cookies for authentication, so the backend API must be configured to set cookies properly.

#### Step 4: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or next available port).

#### Step 5: Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

#### Step 6: Preview Production Build

```bash
npm run preview
```

### Available Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production with Vite |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once and exit |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run coverage` | Generate test coverage report |

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Base URL for the backend API |

---

## 3. Project Structure

### Annotated Directory Tree

```
LayerMap/
├── .env                          # Environment variables (API base URL)
├── .gitattributes                # Git attributes for line endings
├── .gitignore                    # Git ignore rules
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind CSS configuration with custom theme
├── vite.config.mjs               # Vite build configuration
├── vitest.config.js              # Vitest testing configuration
├── docs/                         # Documentation directory
│   └── PROJECT_DOCUMENTATION.md  # This file
├── public/                       # Static assets served directly
│   └── favicon.ico               # Site favicon
└── src/                          # Source code directory
    ├── App.vue                   # Root Vue component
    ├── main.js                   # Application entry point
    ├── api/                      # API service layer
    │   ├── auth.js               # Authentication API methods
    │   ├── client.js             # Axios HTTP client with interceptors
    │   └── projects.js           # Projects and RPI mapping API methods
    ├── assets/                   # Static assets processed by Vite
    │   ├── logo.svg              # Application logo
    │   └── main.css              # Global styles with semantic design tokens
    ├── components/               # Vue components
    │   ├── common/               # Reusable UI components
    │   │   ├── ApiStatusIndicator.vue  # API connection status indicator
    │   │   ├── CreateMappingColumnDialog.vue  # Column creation dialog
    │   │   ├── CreateMappingTableDialog.vue   # Table creation dialog
    │   │   ├── CreateProjectDialog.vue      # Project creation dialog
    │   │   ├── CreateRPIMappingDialog.vue   # RPI mapping creation dialog
    │   │   └── CreateSourceDialog.vue       # Source creation dialog
    │   ├── home/                 # Home page components
    │   │   ├── KpiCards.vue              # KPI metrics cards with animation
    │   │   ├── ProjectsTable.vue           # Responsive projects table
    │   │   └── QuickActions.vue            # Quick action buttons
    │   ├── layout/               # Layout components
    │   │   ├── AppLayout.vue               # Main application layout
    │   │   └── AppTopbar.vue                 # Top navigation bar
    │   ├── rpi/                  # RPI mapping components
    │   │   ├── RPIMappingHeader.vue          # RPI page header
    │   │   ├── RPIMappingPanel.vue           # Side panel for RPI editing
    │   │   ├── RPIMappingTable.vue           # RPI data table
    │   │   └── RPIMappingToolbar.vue         # RPI filter toolbar
    │   └── workflow/             # Workflow components
    │       └── StepIndicator.vue               # Multi-step process indicator
    ├── router/                   # Vue Router configuration
    │   └── index.js              # Route definitions and guards
    ├── stores/                   # Pinia state management
    │   ├── auth.js               # Authentication store
    │   ├── projects.js           # Projects and RPI data store
    │   └── workflow.js           # Project creation workflow store
    ├── utils/                    # Utility functions
    │   ├── format.js             # Date and number formatting
    │   ├── mapping.js            # RPI mapping helpers
    │   └── status.js             # Status badge helpers
    └── views/                    # Page view components
        ├── HomeView.vue          # Home dashboard
        ├── LoginView.vue         # Login page
        ├── RegisterView.vue      # Registration page
        ├── ProjectDetailView.vue # Project details page
        ├── ProjectsListView.vue  # Projects list page
        ├── RPIMappingView.vue    # RPI mapping page
        └── SourceDetailView.vue  # Source details page
```

### Key Files and Their Responsibility

| File | Responsibility |
|------|----------------|
| [`src/main.js`](src/main.js) | Application entry point, initializes Vue app, Pinia, router, PrimeVue |
| [`src/App.vue`](src/App.vue) | Root component, sets up global toast and clears auth token on mount |
| [`src/router/index.js`](src/router/index.js) | Route definitions, navigation guards, authentication logic |
| [`src/api/client.js`](src/api/client.js) | Axios HTTP client with interceptors for auth and error handling |
| [`src/api/auth.js`](src/api/auth.js) | Authentication API methods (login, register, getMe, logout) |
| [`src/api/projects.js`](src/api/projects.js) | Projects, sources, tables, columns, RPI mappings API methods |
| [`src/stores/auth.js`](src/stores/auth.js) | Authentication state, user data, login/logout actions |
| [`src/stores/projects.js`](src/stores/projects.js) | Projects, sources, tables, columns, RPI mappings CRUD operations |
| [`src/stores/workflow.js`](src/stores/workflow.js) | Project creation workflow state and validation |
| [`src/assets/main.css`](src/assets/main.css) | Global styles, semantic design tokens, dark mode support |
| [`tailwind.config.js`](tailwind.config.js) | Tailwind CSS configuration with custom colors and theme |
| [`vite.config.mjs`](vite.config.mjs) | Vite build configuration with plugins |
| [`vitest.config.js`](vitest.config.js) | Vitest testing configuration with setup file |

---

## 4. Routing Reference

### `/login` — Login Page

**Component**: [`src/views/LoginView.vue`](src/views/LoginView.vue:1)

**Description**: User authentication page with email and password form. Redirects authenticated users to home page.

**Auth required**: No

**Route params**: None

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `redirect` | string | - | Redirect URL after successful login |

**Guards / middleware**: `requiresAuth: false`

---

### `/register` — Registration Page

**Component**: [`src/views/RegisterView.vue`](src/views/RegisterView.vue:1)

**Description**: User registration page with full_name, email, and password form. Auto-logs in user after successful registration.

**Auth required**: No

**Route params**: None

**Query params**: None

**Guards / middleware**: `requiresAuth: false`

---

### `/` — Home Dashboard

**Component**: [`src/views/HomeView.vue`](src/views/HomeView.vue:1)

**Description**: Main dashboard showing KPI cards (total projects, sources, RPI mappings), recent projects table, and quick action buttons.

**Auth required**: Yes

**Route params**: None

**Query params**: None

**Guards / middleware**: `requiresAuth: true`

---

### `/projects` — Projects List

**Component**: [`src/views/ProjectsListView.vue`](src/views/ProjectsListView.vue:1)

**Description**: Paginated list of all projects with search, filter by status, and sorting options.

**Auth required**: Yes

**Route params**: None

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | - | Filter by project status (draft, active, archived) |
| `search` | string | - | Search by project name |
| `page` | number | 1 | Page number |
| `size` | number | 10 | Items per page |
| `sort_by` | string | created_at | Sort field |
| `sort_dir` | string | asc | Sort direction (asc, desc) |

**Guards / middleware**: `requiresAuth: true`

---

### `/projects/:id` — Project Details

**Component**: [`src/views/ProjectDetailView.vue`](src/views/ProjectDetailView.vue:1)

**Description**: Detailed view of a single project with accordion sections for sources, mapping tables, and columns.

**Auth required**: Yes

**Route params**:
| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Project ID |

**Query params**: None

**Guards / middleware**: `requiresAuth: true`

---

### `/projects/:id/mapping` — RPI Mapping

**Component**: [`src/views/RPIMappingView.vue`](src/views/RPIMappingView.vue:1)

**Description**: RPI mapping management page with filters, search, pagination, and side panel for creating/editing RPI records.

**Auth required**: Yes

**Route params**:
| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Project ID |

**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | - | Search by RPI name |
| `status` | string | - | Filter by status (draft, review, approved) |
| `ownership` | string | - | Filter by ownership (internal, external) |
| `measurement_type` | string | - | Filter by measurement type |
| `calculated_type` | string | - | Filter by calculated type |
| `page` | number | 1 | Page number |
| `pageSize` | number | 10 | Items per page |

**Guards / middleware**: `requiresAuth: true`

---

### `/projects/:id/sources/:sourceId` — Source Details

**Component**: [`src/views/SourceDetailView.vue`](src/views/SourceDetailView.vue:1)

**Description**: Detailed view of a data source with mapping tables and columns. Allows creating mapping tables and RPI mappings.

**Auth required**: Yes

**Route params**:
| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Project ID |
| `sourceId` | string | Source ID |

**Query params**: None

**Guards / middleware**: `requiresAuth: true`

---

## 5. Pages & Views

### HomeView.vue

**Path**: [`src/views/HomeView.vue`](src/views/HomeView.vue:1)

**Purpose**: Dashboard page displaying project KPIs and quick access to recent projects.

**Key data**:
- Total projects count
- Total sources count
- Total RPI mappings count
- Recent projects list (last 5)

**API endpoints used**:
- `GET /projects/kpi` — Fetches KPI metrics
- `GET /projects/recent?limit=5` — Fetches recent projects

**Emitted events**: None

**Global state mutations**:
- `useProjectsStore().loadKpi()` — Loads KPI data
- `useProjectsStore().loadRecentProjects(5)` — Loads recent projects

---

### LoginView.vue

**Path**: [`src/views/LoginView.vue`](src/views/LoginView.vue:1)

**Purpose**: User authentication page with email and password form.

**Key data**:
- Email input (required, email format)
- Password input (required, min 8 characters)
- Loading state during login
- Error messages from API

**API endpoints used**:
- `POST /auth/jwt/login` — Authenticates user

**Emitted events**: None

**Global state mutations**:
- `useAuthStore().login({ email, password })` — Initiates login

---

### RegisterView.vue

**Path**: [`src/views/RegisterView.vue`](src/views/RegisterView.vue:1)

**Purpose**: User registration page with auto-login after successful registration.

**Key data**:
- Full name input (required)
- Email input (required, email format)
- Password input (required, min 8 characters)
- Loading state during registration
- Error messages (409 for duplicate email)

**API endpoints used**:
- `POST /auth/register` — Registers new user

**Emitted events**: None

**Global state mutations**:
- `useAuthStore().login({ email, password })` — Auto-logs in after registration

---

### ProjectsListView.vue

**Path**: [`src/views/ProjectsListView.vue`](src/views/ProjectsListView.vue:1)

**Purpose**: Paginated list of all projects with search, filter, and sort capabilities.

**Key data**:
- Projects list with pagination
- Search query
- Status filter
- Sort options
- Total count

**API endpoints used**:
- `GET /projects?status=&search=&page=&size=&sort_by=&sort_dir=` — Fetches filtered projects

**Emitted events**: None

**Global state mutations**:
- `useProjectsStore().loadProjects(filters)` — Loads projects with filters

---

### ProjectDetailView.vue

**Path**: [`src/views/ProjectDetailView.vue`](src/views/ProjectDetailView.vue:1)

**Purpose**: Detailed view of a single project with collapsible sections for sources, tables, and columns.

**Key data**:
- Project details (name, status, created_at, updated_at)
- Sources list with count
- Mapping tables per source
- Columns per table

**API endpoints used**:
- `GET /projects/:id` — Fetches project details
- `GET /projects/:id/sources` — Fetches sources
- `GET /projects/:id/sources/:sourceId/mapping-tables` — Fetches tables
- `GET /projects/:id/sources/:sourceId/mapping-tables/:tableId/columns` — Fetches columns

**Emitted events**: None

**Global state mutations**:
- `useProjectsStore().loadProject(id)` — Loads project
- `useProjectsStore().loadSources(id)` — Loads sources
- `useProjectsStore().loadTables(projectId, sourceId)` — Loads tables
- `useProjectsStore().loadColumns(projectId, sourceId, tableId)` — Loads columns

---

### SourceDetailView.vue

**Path**: [`src/views/SourceDetailView.vue`](src/views/SourceDetailView.vue:1)

**Purpose**: Detailed view of a data source with mapping tables and RPI mapping capabilities.

**Key data**:
- Source details (name, type, description)
- Mapping tables list
- Columns per table
- RPI mappings for selected table/column

**API endpoints used**:
- `GET /projects/:projectId/sources/:sourceId` — Fetches source details
- `GET /projects/:projectId/sources/:sourceId/mapping-tables` — Fetches tables
- `GET /projects/:projectId/sources/:sourceId/mapping-tables/:tableId/columns` — Fetches columns
- `GET /projects/:projectId/rpi-mappings?table_id=&column_id=` — Fetches RPI mappings

**Emitted events**: None

**Global state mutations**:
- `useProjectsStore().loadSource(projectId, sourceId)` — Loads source
- `useProjectsStore().loadTables(projectId, sourceId)` — Loads tables
- `useProjectsStore().loadColumns(projectId, sourceId, tableId)` — Loads columns
- `useProjectsStore().loadRPIMappings(projectId, filters)` — Loads RPI mappings

---

### RPIMappingView.vue

**Path**: [`src/views/RPIMappingView.vue`](src/views/RPIMappingView.vue:1)

**Purpose**: RPI mapping management page with comprehensive filtering, search, pagination, and inline editing.

**Key data**:
- RPI mappings list with pagination
- Search query
- Status filter (draft, review, approved)
- Ownership filter (internal, external)
- Measurement type filter
- Calculated type filter
- Quick filter counts (approved, review, draft)
- Side panel for add/edit operations

**API endpoints used**:
- `GET /projects/:projectId/rpi-mappings?search=&status=&ownership=&measurement_type=&is_calculated=&page=&size=` — Fetches filtered RPI mappings
- `POST /projects/:projectId/rpi-mappings` — Creates RPI mapping
- `PATCH /projects/:projectId/rpi-mappings/:id` — Updates RPI mapping
- `DELETE /projects/:projectId/rpi-mappings/:id` — Deletes RPI mapping

**Emitted events**: None

**Global state mutations**:
- `useProjectsStore().loadRPIMappings(projectId, filters)` — Loads RPI mappings
- `useProjectsStore().createRPIMapping(projectId, data)` — Creates RPI
- `useProjectsStore().updateRPIMapping(projectId, id, data)` — Updates RPI
- `useProjectsStore().deleteRPIMapping(projectId, id)` — Deletes RPI

---

## 6. Component Library

### ApiStatusIndicator.vue

**Path**: [`src/components/common/ApiStatusIndicator.vue`](src/components/common/ApiStatusIndicator.vue:1)

**Description**: Displays the API connection status with color-coded indicator and health check.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| - | - | - | - | Uses composable `useApiStatus()` internally |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| - | - | - |

**Slots**:
| Slot | Description |
|------|-------------|
| default | Custom content when API is unavailable |

**Usage example**:
```vue
<ApiStatusIndicator />
```

---

### CreateMappingColumnDialog.vue

**Path**: [`src/components/common/CreateMappingColumnDialog.vue`](src/components/common/CreateMappingColumnDialog.vue:1)

**Description**: Dialog for creating or editing a mapping table column with validation.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projectId` | string | Yes | - | Project ID |
| `sourceId` | string | Yes | - | Source ID |
| `tableId` | string | Yes | - | Table ID |
| `editingColumn` | object | No | null | Column object for edit mode |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `saved` | object | Saved column data |
| `update:modelValue` | boolean | Dialog visibility |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<CreateMappingColumnDialog
  v-model="showColumnDialog"
  :projectId="projectId"
  :sourceId="sourceId"
  :tableId="tableId"
  :editingColumn="editingColumn"
  @saved="handleColumnSaved"
/>
```

---

### CreateMappingTableDialog.vue

**Path**: [`src/components/common/CreateMappingTableDialog.vue`](src/components/common/CreateMappingTableDialog.vue:1)

**Description**: Dialog for creating a new mapping table with source selection.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projectId` | string | Yes | - | Project ID |
| `sourceId` | string | Yes | - | Source ID |
| `editingTable` | object | No | null | Table object for edit mode |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `saved` | object | Saved table data |
| `update:modelValue` | boolean | Dialog visibility |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<CreateMappingTableDialog
  v-model="showTableDialog"
  :projectId="projectId"
  :sourceId="sourceId"
  :editingTable="editingTable"
  @saved="handleTableSaved"
/>
```

---

### CreateProjectDialog.vue

**Path**: [`src/components/common/CreateProjectDialog.vue`](src/components/common/CreateProjectDialog.vue:1)

**Description**: Dialog for creating a new project with name and description.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `modelValue` | boolean | Yes | - | Dialog visibility |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `saved` | object | Saved project data |
| `update:modelValue` | boolean | Dialog visibility |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<CreateProjectDialog v-model="showProjectDialog" @saved="handleProjectSaved" />
```

---

### CreateRPIMappingDialog.vue

**Path**: [`src/components/common/CreateRPIMappingDialog.vue`](src/components/common/CreateRPIMappingDialog.vue:1)

**Description**: Comprehensive dialog for creating/editing RPI mappings with extensive validation and source column linking.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projectId` | string | Yes | - | Project ID |
| `editingRpi` | object | No | null | RPI object for edit mode |
| `sourceColumnId` | string | No | null | Pre-select source column |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `saved` | object | Saved RPI data |
| `update:modelValue` | boolean | Dialog visibility |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<CreateRPIMappingDialog
  v-model="showRPIDialog"
  :projectId="projectId"
  :editingRpi="editingRpi"
  :sourceColumnId="selectedColumnId"
  @saved="handleRPISaved"
/>
```

---

### CreateSourceDialog.vue

**Path**: [`src/components/common/CreateSourceDialog.vue`](src/components/common/CreateSourceDialog.vue:1)

**Description**: Dialog for creating a new data source with name, type, and description.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projectId` | string | Yes | - | Project ID |
| `editingSource` | object | No | null | Source object for edit mode |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `saved` | object | Saved source data |
| `update:modelValue` | boolean | Dialog visibility |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<CreateSourceDialog
  v-model="showSourceDialog"
  :projectId="projectId"
  :editingSource="editingSource"
  @saved="handleSourceSaved"
/>
```

---

### KpiCards.vue

**Path**: [`src/components/home/KpiCards.vue`](src/components/home/KpiCards.vue:1)

**Description**: Displays KPI metrics (total projects, sources, RPI mappings) with animated number transitions.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `totalProjects` | number | Yes | - | Total projects count |
| `totalSources` | number | Yes | - | Total sources count |
| `totalRpi` | number | Yes | - | Total RPI mappings count |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| - | - | - |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<KpiCards
  :totalProjects="store.totalProjects"
  :totalSources="store.totalSources"
  :totalRpi="store.totalRpi"
/>
```

---

### ProjectsTable.vue

**Path**: [`src/components/home/ProjectsTable.vue`](src/components/home/ProjectsTable.vue:1)

**Description**: Responsive projects table that switches between card and table layout based on screen size.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projects` | array | Yes | - | Projects list |
| `loading` | boolean | Yes | - | Loading state |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `view-project` | string | Project ID to view |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<ProjectsTable
  :projects="recentProjects"
  :loading="loading"
  @view-project="navigateToProject"
/>
```

---

### QuickActions.vue

**Path**: [`src/components/home/QuickActions.vue`](src/components/home/QuickActions.vue:1)

**Description**: Quick action buttons for creating projects and navigating to projects list.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| - | - | - | - | - |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `create-project` | - | Trigger project creation |
| `view-projects` | - | Navigate to projects list |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<QuickActions
  @create-project="showProjectDialog = true"
  @view-projects="router.push('/projects')"
/>
```

---

### RPIMappingHeader.vue

**Path**: [`src/components/rpi/RPIMappingHeader.vue`](src/components/rpi/RPIMappingHeader.vue:1)

**Description**: Page header with title, description, and add RPI button.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projectId` | string | Yes | - | Project ID |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `add-rpi` | - | Trigger add RPI panel |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<RPIMappingHeader
  :projectId="projectId"
  @add-rpi="openAddPanel"
/>
```

---

### RPIMappingPanel.vue

**Path**: [`src/components/rpi/RPIMappingPanel.vue`](src/components/rpi/RPIMappingPanel.vue:1)

**Description**: Side panel for adding or editing RPI mappings with form validation.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projectId` | string | Yes | - | Project ID |
| `mode` | string | Yes | - | 'add' or 'edit' |
| `editingRpi` | object | No | null | RPI object for edit mode |
| `sourceColumnId` | string | No | null | Pre-selected source column |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `close` | - | Close panel |
| `saved` | object | Saved RPI data |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<RPIMappingPanel
  :projectId="projectId"
  :mode="panelMode"
  :editingRpi="editingRpi"
  :sourceColumnId="selectedColumnId"
  @close="closePanel"
  @saved="handleSave"
/>
```

---

### RPIMappingTable.vue

**Path**: [`src/components/rpi/RPIMappingTable.vue`](src/components/rpi/RPIMappingTable.vue:1)

**Description**: RPI mappings data table with pagination, sorting, and action buttons.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `rows` | array | Yes | - | RPI rows to display |
| `totalRecords` | number | Yes | - | Total record count |
| `pageFirst` | number | Yes | - | Current page index |
| `pageSize` | number | Yes | - | Items per page |
| `loading` | boolean | Yes | - | Loading state |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `edit` | object | RPI row to edit |
| `delete` | object | RPI row to delete |
| `page` | object | Page change event |
| `sort` | object | Sort change event |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<RPIMappingTable
  :rows="paginatedRows"
  :totalRecords="totalRpi"
  :pageFirst="pageFirst"
  :pageSize="pageSize"
  :loading="loading"
  @edit="openEditPanel"
  @delete="confirmDelete"
  @page="onPage"
  @sort="onSort"
/>
```

---

### RPIMappingToolbar.vue

**Path**: [`src/components/rpi/RPIMappingToolbar.vue`](src/components/rpi/RPIMappingToolbar.vue:1)

**Description**: Toolbar with search input, status filter, ownership filter, and quick filter counts.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `search` | string | Yes | - | Search query |
| `status` | string | Yes | - | Status filter |
| `ownership` | string | Yes | - | Ownership filter |
| `measurementType` | string | Yes | - | Measurement type filter |
| `calculatedType` | string | Yes | - | Calculated type filter |
| `approvedCount` | number | Yes | - | Approved count |
| `reviewCount` | number | Yes | - | Review count |
| `draftCount` | number | Yes | - | Draft count |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| `search` | string | Search query change |
| `status` | string | Status filter change |
| `ownership` | string | Ownership filter change |
| `measurementType` | string | Measurement type filter change |
| `calculatedType` | string | Calculated type filter change |
| `reset` | - | Reset filters |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<RPIMappingToolbar
  :search="filters.search"
  :status="filters.status"
  :ownership="filters.ownership"
  :measurementType="filters.measurementType"
  :calculatedType="filters.calculatedType"
  :approvedCount="approvedCount"
  :reviewCount="reviewCount"
  :draftCount="draftCount"
  @search="filters.search = $event"
  @status="filters.status = $event"
  @ownership="filters.ownership = $event"
  @measurementType="filters.measurementType = $event"
  @calculatedType="filters.calculatedType = $event"
  @reset="resetFilters"
/>
```

---

### StepIndicator.vue

**Path**: [`src/components/workflow/StepIndicator.vue`](src/components/workflow/StepIndicator.vue:1)

**Description**: Visual indicator for multi-step workflow process with step validation.

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentStep` | string | Yes | - | Current step name |
| `steps` | array | Yes | - | Step definitions with name, title, description |

**Emits**:
| Event | Payload Type | Description |
|-------|--------------|-------------|
| - | - | - |

**Slots**:
| Slot | Description |
|------|-------------|
| - | - |

**Usage example**:
```vue
<StepIndicator
  :currentStep="workflowStore.currentStep"
  :steps="workflowSteps"
/>
```

---

## 7. State Management

### auth.js

**Path**: [`src/stores/auth.js`](src/stores/auth.js:1)

**Purpose**: Manages user authentication state, user data, and login/logout operations.

**State shape**:
```javascript
{
  user: null,                    // User object or null
  isAuthenticated: false,        // Whether user is authenticated
  isInitialized: false,          // Whether auth has been initialized
  _loadingPromise: null,         // Internal promise for loadUser
}
```

**Getters / Computed values**:
| Name | Returns | Description |
|------|---------|-------------|
| `isAuthenticated` | boolean | True if user is logged in |

**Actions**:
| Action | Parameters | Side Effects |
|--------|------------|--------------|
| `login` | `{ email, password }` | Calls auth API, loads user, sets isAuthenticated |
| `loadUser` | None | Fetches /users/me, sets user data or clears on 401 |
| `logout` | None | Calls logout API, clears user state |

**Usage example**:
```javascript
const store = useAuthStore();
await store.login({ email: 'user@example.com', password: 'secret' });
console.log(store.user.full_name);
await store.logout();
```

---

### projects.js

**Path**: [`src/stores/projects.js`](src/stores/projects.js:1)

**Purpose**: Main store for managing projects, sources, mapping tables, columns, and RPI mappings with full CRUD operations.

**State shape**:
```javascript
{
  projects: [],                          // List of projects
  sources: [],                           // List of sources
  mappingTables: [],                     // List of mapping tables
  rpiMappings: [],                       // List of RPI mappings
  loading: false,                        // Loading state
  error: null,                           // Error message
  projectKpi: {                          // KPI data
    total: 0,
    active: 0,
    draft: 0,
    archived: 0,
  },
  projectPagination: {                   // Pagination state
    total: 0,
    page: 1,
    size: 10,
  },
}
```

**Getters / Computed values**:
| Name | Returns | Description |
|------|---------|-------------|
| `totalProjects` | number | Total projects count from KPI |
| `totalSources` | number | Total sources count from KPI |
| `totalRpi` | number | Total RPI mappings count from KPI |
| `lastUpdateDate` | string | Last update date from KPI |

**Actions**:
| Action | Parameters | Side Effects |
|--------|------------|--------------|
| `loadKpi` | None | Fetches /projects/kpi, updates KPI state |
| `loadRecentProjects` | `limit` | Fetches /projects/recent?limit=N |
| `loadProjects` | `filters` | Fetches /projects with filters, updates pagination |
| `loadProject` | `projectId` | Fetches /projects/:id, loads sources |
| `loadSources` | `projectId` | Fetches /projects/:id/sources |
| `loadTables` | `projectId, sourceId` | Fetches tables for source |
| `loadColumns` | `projectId, sourceId, tableId` | Fetches columns for table |
| `loadRPIMappings` | `projectId, filters` | Fetches RPI mappings with filters |
| `createProject` | `data` | POST /projects, adds to list |
| `updateProject` | `projectId, data` | PATCH /projects/:id |
| `createSource` | `projectId, data` | POST /projects/:id/sources |
| `updateSource` | `projectId, sourceId, data` | PATCH /projects/:id/sources/:id |
| `createMappingTable` | `projectId, data` | POST /projects/:id/mapping-tables |
| `updateMappingTable` | `projectId, tableId, data` | PATCH /projects/:id/mapping-tables/:id |
| `createMappingColumn` | `projectId, sourceId, tableId, data` | POST /projects/:id/sources/:sourceId/mapping-tables/:tableId/columns |
| `updateMappingTableColumn` | `projectId, tableId, columnId, data` | PATCH /projects/:id/sources/:sourceId/mapping-tables/:tableId/columns/:id |
| `createRPIMapping` | `projectId, data` | POST /projects/:id/rpi-mappings |
| `updateRPIMapping` | `projectId, rpiId, data` | PATCH /projects/:id/rpi-mappings/:id |
| `deleteRPIMapping` | `projectId, rpiId` | DELETE /projects/:id/rpi-mappings/:id |
| `validateRPIMappingLink` | `rpiMapping` | Validates RPI links to valid source column |

**Usage example**:
```javascript
const store = useProjectsStore();
await store.loadKpi();
console.log(store.totalProjects);
await store.createProject({ name: 'New Project', description: 'Desc' });
await store.createRPIMapping(projectId, { rpi_name: 'RPI-001', number: 100 });
```

---

### workflow.js

**Path**: [`src/stores/workflow.js`](src/stores/workflow.js:1)

**Purpose**: Manages project creation workflow state with step validation and localStorage persistence.

**State shape**:
```javascript
{
  currentStep: 'RPI_FORM',     // Current step: RPI_FORM, TABLES, COLUMNS
  projectId: null,             // Project ID being created
  rpiFormComplete: false,      // RPI form completion status
  tablesComplete: false,       // Tables step completion status
  columnsComplete: false,      // Columns step completion status
  isProjectLocked: false,      // Whether project creation is locked
}
```

**Getters / Computed values**:
| Name | Returns | Description |
|------|---------|-------------|
| `isProjectLocked` | boolean | True if workflow is incomplete |

**Actions**:
| Action | Parameters | Side Effects |
|--------|------------|--------------|
| `completeRPIForm` | `projectId` | Sets rpiFormComplete, saves to localStorage |
| `completeTablesStep` | `projectId` | Sets tablesComplete, saves to localStorage |
| `completeColumnsStep` | `projectId` | Sets columnsComplete, saves to localStorage |
| `resetWorkflow` | `projectId` | Clears all step flags, removes from localStorage |

**Usage example**:
```javascript
const store = useWorkflowStore();
await store.completeRPIForm(projectId);
await store.completeTablesStep(projectId);
await store.completeColumnsStep(projectId);
console.log(store.isProjectLocked); // false when complete
```

---

## 8. Composables

### useProject.js

**Path**: [`src/composables/useProject.js`](src/composables/useProject.js:1)

**Purpose**: Extracts project ID from route and store, provides project data access.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| - | - | - |

**Returns**:
```javascript
{
  projectId: Ref<string>,    // Project ID from route or store
  project: Ref<object>,      // Project data from store
}
```

**Usage example**:
```javascript
const { projectId, project } = useProject();
console.log(projectId.value);
console.log(project.value.name);
```

---

### useRPIFilters.js

**Path**: [`src/composables/useRPIFilters.js`](src/composables/useRPIFilters.js:1)

**Purpose**: Manages RPI filtering, search, and pagination state with computed filtered results.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `projectId` | Ref<string> | Project ID |
| `rpiMappings` | Ref<Array> | RPI mappings list from store |

**Returns**:
```javascript
{
  filters: {
    search: Ref<string>,           // Search query
    status: Ref<string>,           // Status filter
    ownership: Ref<string>,        // Ownership filter
    measurementType: Ref<string>,  // Measurement type filter
    calculatedType: Ref<string>,   // Calculated type filter
  },
  pageFirst: Ref<number>,          // Current page index
  pageSize: Ref<number>,           // Items per page
  filteredRows: ComputedRef<Array>, // Filtered RPI rows
  paginatedRows: ComputedRef<Array>, // Paginated RPI rows
  quickFilters: ComputedRef<object>, // Quick filter counts
  approvedCount: ComputedRef<number>, // Approved count
  reviewCount: ComputedRef<number>,   // Review count
  draftCount: ComputedRef<number>,    // Draft count
  getFilterParams: Function,          // Get filter params for API
  resetFilters: Function,             // Reset all filters
  setQuickFilter: Function,           // Apply quick filter
  onPage: Function,                   // Handle page change
}
```

**Usage example**:
```javascript
const {
  filters,
  pageFirst,
  pageSize,
  filteredRows,
  paginatedRows,
  approvedCount,
  getFilterParams,
  resetFilters,
  onPage,
} = useRPIFilters(projectId, rpiMappings);

const params = getFilterParams();
// { search: '', status: 'approved', page: 1, size: 10, ... }
```

---

### useRPIMappingForm.js

**Path**: [`src/composables/useRPIMappingForm.js`](src/composables/useRPIMappingForm.js:1)

**Purpose**: Manages RPI mapping form state, validation, and CRUD operations.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `projectId` | Ref<string> | Project ID |
| `rpiMappings` | Ref<Array> | RPI mappings list from store |

**Returns**:
```javascript
{
  showPanel: Ref<boolean>,           // Panel visibility
  panelMode: Ref<'add' | 'edit'>,   // Panel mode
  editingRpi: Ref<object>,           // RPI being edited
  selectedColumnId: Ref<string>,     // Selected source column
  form: Ref<object>,                 // RPI form data
  formErrors: Ref<object>,           // Form validation errors
  isSubmitting: Ref<boolean>,        // Submit loading state
  openAddPanel: Function,            // Open add panel
  openEditPanel: Function,           // Open edit panel with RPI data
  closePanel: Function,              // Close panel
  saveRule: Function,                // Save RPI (create or update)
  deleteRule: Function,              // Delete RPI with confirmation
  fillFormFromColumn: Function,      // Pre-fill form from source column
}
```

**Usage example**:
```javascript
const {
  showPanel,
  panelMode,
  editingRpi,
  form,
  formErrors,
  openAddPanel,
  openEditPanel,
  saveRule,
  deleteRule,
  fillFormFromColumn,
} = useRPIMappingForm(projectId, rpiMappings);

openAddPanel();
await saveRule();
fillFormFromColumn(sourceColumn);
```

---

### useApiStatus.js

**Path**: [`src/composables/useApiStatus.js`](src/composables/useApiStatus.js:1)

**Purpose**: Monitors API connection status with periodic health checks.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| - | - | - |

**Returns**:
```javascript
{
  loading: Ref<boolean>,         // Health check loading state
  available: Ref<boolean>,       // API availability status
  health: Ref<object>,           // Health check response
  error: Ref<string>,            // Error message
  checkApiAvailability: Function, // Perform health check
  refreshStatus: Function,        // Refresh status manually
}
```

**Usage example**:
```javascript
const { loading, available, health, error, refreshStatus } = useApiStatus();

if (!available.value) {
  console.log('API is unavailable');
}
await refreshStatus();
```

---

## 9. API Integration Layer

### HTTP Client Setup

**Path**: [`src/api/client.js`](src/api/client.js:1)

**Base Configuration**:
```javascript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,        // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Request Interceptors**: None configured

**Response Interceptors**:
- **403 Forbidden**: Shows error toast, does not redirect
- **409 Conflict**: Shows error toast, does not redirect
- **401 Unauthorized**: Redirects to `/login`
- **Other errors**: Shows error toast with message

**Error Handling Strategy**:
```javascript
// 401 errors trigger redirect to login
// 403/409 errors show toast notification
// Other errors show toast with error message
// Validation errors (422) are handled in components
```

### API Service Functions

**Path**: [`src/api/projects.js`](src/api/projects.js:1)

| Function | Endpoint | Method | Parameters | Response Type |
|----------|----------|--------|------------|---------------|
| `getProjects` | `/projects` | GET | `projectId?` | `{ items, total }` |
| `getProject` | `/projects/:id` | GET | `id` | `Project` |
| `createProject` | `/projects` | POST | `data` | `Project` |
| `updateProject` | `/projects/:id` | PATCH | `id, data` | `Project` |
| `getSources` | `/projects/:id/sources` | GET | `projectId` | `Source[]` |
| `getSource` | `/projects/:projectId/sources/:id` | GET | `projectId, id` | `Source` |
| `createSource` | `/projects/:projectId/sources` | POST | `projectId, data` | `Source` |
| `updateSource` | `/projects/:projectId/sources/:id` | PATCH | `projectId, id, data` | `Source` |
| `getMappingTables` | `/projects/:projectId/mapping-tables` | GET | `projectId` | `MappingTable[]` |
| `getMappingTable` | `/projects/:projectId/mapping-tables/:id` | GET | `projectId, id` | `MappingTable` |
| `createMappingTable` | `/projects/:projectId/mapping-tables` | POST | `projectId, data` | `MappingTable` |
| `updateMappingTable` | `/projects/:projectId/mapping-tables/:id` | PATCH | `projectId, id, data` | `MappingTable` |
| `getMappingTableColumns` | `/projects/:projectId/mapping-tables/:id/columns` | GET | `projectId, id` | `MappingColumn[]` |
| `getMappingTableColumn` | `/projects/:projectId/mapping-tables/:tableId/columns/:id` | GET | `projectId, tableId, id` | `MappingColumn` |
| `createMappingColumn` | `/projects/:projectId/sources/:sourceId/mapping-tables/:tableId/columns` | POST | `projectId, sourceId, tableId, data` | `MappingColumn` |
| `updateMappingTableColumn` | `/projects/:projectId/sources/:sourceId/mapping-tables/:tableId/columns/:id` | PATCH | `projectId, sourceId, tableId, id, data` | `MappingColumn` |
| `getRPIMappings` | `/projects/:projectId/rpi-mappings` | GET | `projectId, filters` | `RPIMapping[]` |
| `getRPIMapping` | `/projects/:projectId/rpi-mappings/:id` | GET | `projectId, id` | `RPIMapping` |
| `createRPIMapping` | `/projects/:projectId/rpi-mappings` | POST | `projectId, data` | `RPIMapping` |
| `updateRPIMapping` | `/projects/:projectId/rpi-mappings/:id` | PATCH | `projectId, id, data` | `RPIMapping` |
| `deleteRPIMapping` | `/projects/:projectId/rpi-mappings/:id` | DELETE | `projectId, id` | `{ success: boolean }` |
| `getProjectKpi` | `/projects/kpi` | GET | None | `KPI` |
| `getRecentProjects` | `/projects/recent` | GET | `limit` | `Project[]` |
| `getProjectsWithFilters` | `/projects` | GET | `filters` | `{ items, total }` |
| `getSourceMappingTables` | `/projects/:projectId/sources/:sourceId/mapping-tables` | GET | `projectId, sourceId` | `MappingTable[]` |

**Request/Response Transformation**:
- Requests use camelCase for JavaScript compatibility
- Backend may use snake_case, transformation handled by backend
- No client-side transformation logic present

**Error Handling Strategy**:
- **401**: Redirects to login (via client interceptor)
- **403**: Shows toast error
- **409**: Shows toast error (e.g., duplicate project name)
- **422**: Validation errors with field-specific messages (handled in components)
- **500**: Shows toast error

**Mock Data Fallback**: None — application requires live backend connection

---

## 10. Data Models & TypeScript Interfaces

### Project

```javascript
{
  id: number,
  name: string,
  description: string,
  status: 'draft' | 'active' | 'archived',
  created_at: string,
  updated_at: string,
}
```

### Source

```javascript
{
  id: number,
  project_id: number,
  name: string,
  type: string,
  description: string,
  created_at: string,
  updated_at: string,
}
```

### MappingTable

```javascript
{
  id: number,
  project_id: number,
  source_id: number,
  name: string,
  created_at: string,
  updated_at: string,
}
```

### MappingColumn

```javascript
{
  id: number,
  project_id: number,
  source_id: number,
  mapping_table_id: number,
  name: string,
  data_type: string,
  is_required: boolean,
  created_at: string,
  updated_at: string,
}
```

### RPIMapping

```javascript
{
  id: number,
  project_id: number,
  rpi_name: string,
  number: number,
  ownership: 'internal' | 'external',
  status: 'draft' | 'review' | 'approved',
  block: string,
  measurement_type: string,
  is_calculated: boolean,
  formula: string,
  measurement: string,
  measurement_description: string,
  object_field: string,
  source_column_id: number | null,
  date_added: string,
  date_removed: string,
  comment: string,
  verification_file: string,
  created_at: string,
  updated_at: string,
}
```

### KPI

```javascript
{
  total: number,
  active: number,
  draft: number,
  archived: number,
  last_update_date: string,
}
```

### Enum Values and Constants

**Path**: [`src/constants/rpi.js`](src/constants/rpi.js:1)

| Constant | Values | Description |
|----------|--------|-------------|
| `RPI_STATUS_OPTIONS` | `[{ value: 'draft', label: 'Draft' }, { value: 'review', label: 'Review' }, { value: 'approved', label: 'Approved' }]` | RPI status options |
| `RPI_OWNERSHIP_OPTIONS` | `[{ value: 'internal', label: 'Internal' }, { value: 'external', label: 'External' }]` | Ownership options |
| `RPI_MEASUREMENT_TYPES` | `['absolute', 'ratio', 'index']` | Measurement types |
| `MEASUREMENT_TYPE_MAP` | `{ absolute: 'Абсолютный показатель', ratio: 'Относительный показатель', index: 'Индексный показатель' }` | Russian labels |
| `RPI_OWNERSHIP_VALUES` | `['internal', 'external']` | Valid ownership values |
| `RPI_STATUS_VALUES` | `['draft', 'review', 'approved']` | Valid status values |

**Path**: [`src/constants/workflow.js`](src/constants/workflow.js:1)

| Constant | Values | Description |
|----------|--------|-------------|
| `WORKFLOW_STEPS` | `[{ name: 'RPI_FORM', title: 'Карточки РПИ', description: '...' }, ...]` | Workflow step definitions |
| `WORKFLOW_STORAGE_KEY` | `'layermap_workflow_'` | localStorage key prefix |

**Path**: [`src/constants/resources.js`](src/constants/resources.js:1)

| Constant | Values | Description |
|----------|--------|-------------|
| `RESOURCE_NAMES` | `{ PROJECT: 'Проект', SOURCE: 'Источник', MAPPING_TABLE: 'Таблица маппинга', MAPPING_COLUMN: 'Колонка', RPI_MAPPING: 'Карточка РПИ' }` | Resource labels |
| `RESOURCE_ICONS` | `{ PROJECT: 'pi pi-cog', SOURCE: 'pi pi-database', ... }` | Resource icons |

---

## 11. UI & Styling

### UI Component Library

**Library**: PrimeVue 4.3.1

**Theme**: PrimeVue Aura Theme (default)

**Theme Configuration**:
- Applied via `PrimeVue` config in [`src/main.js`](src/main.js:1)
- `ripple: true` — Enable ripple effects
- `darkModeSelector: '.p-dark'` — Dark mode class selector

### CSS Architecture

**Global Styles**: [`src/assets/main.css`](src/assets/main.css:1)

**Structure**:
1. **Tailwind directives** — `@tailwind base`, `@tailwind components`, `@tailwind utilities`
2. **Semantic design tokens** — CSS variables mapped to PrimeVue theme variables
3. **Base styles** — Minimal reset, body styles
4. **Scrollbar styling** — Theme-aware scrollbars

**CSS Variables (Light Theme)**:
| Variable | Value | Description |
|----------|-------|-------------|
| `--app-bg` | `var(--p-surface-50)` | Background color |
| `--app-surface` | `var(--p-surface-0)` | Surface color |
| `--app-text` | `var(--p-surface-900)` | Primary text |
| `--app-text-secondary` | `var(--p-surface-600)` | Secondary text |
| `--app-border` | `var(--p-surface-200)` | Border color |
| `--app-primary` | `var(--p-primary-600)` | Primary color |
| `--app-success` | `var(--p-green-600)` | Success color |
| `--app-warning` | `var(--p-amber-500)` | Warning color |
| `--app-error` | `var(--p-red-500)` | Error color |
| `--app-info` | `var(--p-sky-600)` | Info color |

**CSS Variables (Dark Theme)**:
- Same variable names with different values when `:root[class="p-dark"]` is active
- Adjusted for dark background with lighter text

### Responsive Design Breakpoints

**Tailwind Default**:
| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Small devices |
| `md` | 768px | Medium devices |
| `lg` | 1024px | Large devices |
| `xl` | 1280px | Extra large |
| `2xl` | 1536px | XXL |

**Custom Responsive Behavior**:
- [`ProjectsTable.vue`](src/components/home/ProjectsTable.vue:1) switches between card and table layout at `window.innerWidth < 768`
- [`AppTopbar.vue`](src/layout/AppTopbar.vue:1) uses responsive menu toggle

### Key Design Tokens

**Colors** (from [`tailwind.config.js`](tailwind.config.js:1)):
| Token | Value | Usage |
|-------|-------|-------|
| `primary.DEFAULT` | `#01696f` | Brand primary color |
| `primary.hover` | `#0c4e54` | Primary hover state |
| `surface.base` | `#f7f6f2` | Surface base color |
| `surface.card` | `#f9f8f5` | Card surface color |
| `content.DEFAULT` | `#28251d` | Content text color |
| `content.muted` | `#7a7974` | Muted text color |

**Typography**:
```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```

**Border Radius**:
| Token | Value |
|-------|-------|
| `sm` | `6px` |
| `md` | `8px` |
| `lg` | `12px` |

**Box Shadow**:
| Token | Value |
|-------|-------|
| `card` | `0 1px 2px rgba(0,0,0,0.06)` |
| `hover` | `0 4px 12px rgba(0,0,0,0.08)` |

---

## 12. Utilities

### format.js

**Path**: [`src/utils/format.js`](src/utils/format.js:1)

**Purpose**: Date and number formatting utilities.

**Exported functions**:
| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `formatDate` | `dateString` | `string` | Formats date to `DD.MM.YYYY HH:MM` |
| `formatNumber` | `number` | `string` | Formats number with spaces as thousands separator |

**Usage example**:
```javascript
import { formatDate, formatNumber } from '@/utils/format';

formatDate('2024-01-15T10:30:00'); // "15.01.2024 10:30"
formatNumber(1234567); // "1 234 567"
```

---

### mapping.js

**Path**: [`src/utils/mapping.js`](src/utils/mapping.js:1)

**Purpose**: RPI mapping helper functions for finding related data.

**Exported functions**:
| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getProjectSourceByProjectIdAndName` | `sources, projectName` | `object\|null` | Finds source by project ID and name |
| `getMappingColumnForRecord` | `columns, rpiMapping` | `object\|null` | Finds column linked to RPI mapping |
| `getColumnTypeBadgeClass` | `column` | `string` | Returns badge class for column type |
| `getColumnTypeBadge` | `column` | `object` | Returns badge with label and class |

**Usage example**:
```javascript
import { getMappingColumnForRecord } from '@/utils/mapping';

const column = getMappingColumnForRecord(columns, rpiMapping);
```

---

### status.js

**Path**: [`src/utils/status.js`](src/projects.js:1)

**Purpose**: Status badge and label helper functions.

**Exported functions**:
| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getProjectStatusSeverity` | `status` | `string` | Returns severity for project status |
| `getProjectStatusLabel` | `status` | `string` | Returns Russian label for project status |
| `getSourceTypeSeverity` | `type` | `string` | Returns severity for source type |
| `getMappingStatusLabel` | `status` | `string` | Returns Russian label for mapping status |
| `getStatusPillClass` | `status` | `string` | Returns pill class for status |
| `getStatusDotClass` | `status` | `string` | Returns dot class for status indicator |
| `getStatusBtnActiveClass` | `status` | `string` | Returns button active class |

**Usage example**:
```javascript
import { getProjectStatusSeverity, getStatusPillClass } from '@/utils/status';

const severity = getProjectStatusSeverity('active'); // 'success'
const pillClass = getStatusPillClass('approved'); // 'bg-green-100 text-green-800'
```

---

## 13. Constants & Configuration

### Constants Overview

**Path**: [`src/constants/rpi.js`](src/constants/rpi.js:1)

| Constant | Value | Purpose |
|----------|-------|---------|
| `RPI_STATUS_OPTIONS` | `[{ value: 'draft', label: 'Draft' }, ...]` | Status dropdown options |
| `RPI_OWNERSHIP_OPTIONS` | `[{ value: 'internal', label: 'Internal' }, ...]` | Ownership dropdown options |
| `RPI_MEASUREMENT_TYPES` | `['absolute', 'ratio', 'index']` | Valid measurement types |
| `MEASUREMENT_TYPE_MAP` | `{ absolute: 'Абсолютный показатель', ... }` | Russian translations |
| `RPI_OWNERSHIP_VALUES` | `['internal', 'external']` | Valid ownership values |
| `RPI_STATUS_VALUES` | `['draft', 'review', 'approved']` | Valid status values |
| `createEmptyRPIForm` | `Function` | Returns empty RPI form object |

**Path**: [`src/constants/workflow.js`](src/constants/workflow.js:1)

| Constant | Value | Purpose |
|----------|-------|---------|
| `WORKFLOW_STEPS` | `[{ name: 'RPI_FORM', title: 'Карточки РПИ', ... }, ...]` | Workflow step definitions |
| `WORKFLOW_STORAGE_KEY` | `'layermap_workflow_'` | localStorage key prefix |

**Path**: [`src/constants/resources.js`](src/constants/resources.js:1)

| Constant | Value | Purpose |
|----------|-------|---------|
| `RESOURCE_NAMES` | `{ PROJECT: 'Проект', SOURCE: 'Источник', ... }` | Resource labels in Russian |
| `RESOURCE_ICONS` | `{ PROJECT: 'pi pi-cog', SOURCE: 'pi pi-database', ... }` | PrimeIcons icons |

### Feature Flags

No feature flags are implemented in this codebase.

### Environment-Driven Behavior

- **API Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Default**: `http://localhost:8000`
- **Authentication**: Always uses `httpOnly` cookies (no token storage in localStorage after mount)

---

## 14. Authentication & Authorization

### Auth Flow

1. **Initial Load**:
   - App mounts, clears `access_token` from localStorage (if present)
   - Router guard triggers `authStore.loadUser()`
   - If authenticated, user data is loaded from `/users/me`
   - If not authenticated, redirect to `/login`

2. **Login**:
   - User submits email/password on `/login`
   - `authStore.login()` calls `POST /auth/jwt/login`
   - Backend sets `httpOnly` access token cookie
   - `authStore.loadUser()` fetches user data from `/users/me`
   - Redirect to home or `redirect` query param

3. **Registration**:
   - User submits form on `/register`
   - `register()` calls `POST /auth/register`
   - Auto-logs in with `authStore.login()`
   - Redirect to home

4. **Protected Routes**:
   - Router guard checks `to.meta.requiresAuth`
   - If true and not authenticated, redirect to `/login` with `redirect` query
   - If authenticated, allow navigation

5. **Logout**:
   - User clicks logout in topbar
   - `authStore.logout()` calls `POST /auth/logout`
   - Clears user state
   - Redirects to `/login`

### Token Storage

- **Method**: `httpOnly` cookies (set by backend)
- **Client Storage**: None — localStorage `access_token` is cleared on mount
- **Credentials**: `withCredentials: true` in Axios client

### Route Guard Logic

**Path**: [`src/router/index.js`](src/router/index.js:1)

```javascript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Public routes
  if (to.meta.requiresAuth === false) {
    if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
      return next('/');
    }
    return next();
  }
  
  // Protected routes
  if (!authStore.isAuthenticated) {
    await authStore.loadUser();
  }
  if (!authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }
  
  next();
});
```

### Auth State Initialization

**Path**: [`src/stores/auth.js`](src/stores/auth.js:1)

```javascript
// On store initialization
if (!isInitialized.value) {
  isInitialized.value = true;
  _loadingPromise.value = loadUser();
}
await _loadingPromise.value;
```

---

## 15. Error Handling

### Global Error Handling

**HTTP Client Interceptors** ([`src/api/client.js`](src/api/client.js:1)):
- **401**: Redirects to `/login`
- **403**: Shows toast with "Ошибка сервера"
- **409**: Shows toast with "Ошибка сервера"
- **Other**: Shows toast with error message or "Ошибка сети"

**Toast Notifications**:
- Used via `useToast()` from PrimeVue
- Groups: `global`, `validation`
- Auto-dismiss after 3 seconds

### Per-Component Error States

**LoginView** ([`src/views/LoginView.vue`](src/views/LoginView.vue:1)):
- Shows "Неверный email или пароль" on 401
- Shows loading state during request
- Disables submit button while loading

**RegisterView** ([`src/views/RegisterView.vue`](src/views/RegisterView.vue:1)):
- Shows "Пользователь с таким email уже существует" on 409
- Shows loading state during request
- Disables submit button while loading

**Create Dialogs**:
- Field-specific errors from 422 responses
- Shows validation errors below each field
- Disables submit button while submitting

### User-Facing Error Messages

| Error Code | Message | Location |
|------------|---------|----------|
| 401 (login) | "Неверный email или пароль" | [`LoginView.vue`](src/views/LoginView.vue:85) |
| 409 (register) | "Пользователь с таким email уже существует" | [`RegisterView.vue`](src/views/RegisterView.vue:101) |
| 403 | "Ошибка сервера" | [`client.js`](src/api/client.js:50) |
| 409 | "Ошибка сервера" | [`client.js`](src/api/client.js:54) |
| Network error | "Ошибка сети" | [`client.js`](src/api/client.js:62) |
| Generic error | "Произошла ошибка" | [`client.js`](src/api/client.js:66) |

**Validation Errors** (422):
- Parsed from `error.response.data.detail` array
- Displayed below each field in forms
- Format: `{ field: ["Error message"] }`

---

## 16. Testing

### How to Run Tests

```bash
# Watch mode (recommended for development)
npm run test

# Run once and exit
npm run test:run

# Run with UI
npm run test:ui

# Generate coverage report
npm run coverage
```

### Test Structure

**Directory**: [`tests/`](tests/)

| Path | Description |
|------|-------------|
| `tests/setup.js` | Test setup file (Pinia, router mocks) |
| `tests/api/` | API service tests |
| `tests/router/` | Router guard tests |
| `tests/stores/` | Pinia store tests |
| `tests/views/` | Component view tests |

**Test Files**:
| File | Tests |
|------|-------|
| `tests/api/auth.spec.js` | Auth API methods (login, register, getMe, logout) |
| `tests/api/client.spec.js` | HTTP client configuration and interceptors |
| `tests/api/projects.spec.js` | Projects API contract tests |
| `tests/router/index.spec.js` | Route guards and navigation |
| `tests/stores/auth.spec.js` | Auth store actions and state |
| `tests/views/LoginView.spec.js` | Login page component tests |
| `tests/views/RegisterView.spec.js` | Registration page component tests |

### Test Coverage

**What is Tested**:
- **Unit Tests**: API methods, store actions, utility functions
- **Integration Tests**: Router guards, component rendering
- **Mocked Dependencies**: PrimeVue toast, Vue Router, API client

**Not Tested**:
- E2E tests (no Cypress/Playwright setup)
- Visual regression tests
- Performance tests

**Coverage Notes**:
- API layer: ~80% coverage
- Stores: ~70% coverage
- Views: ~60% coverage (critical paths only)
- Components: Minimal coverage (focus on views)

---

## 17. Known Limitations & TODOs

### Hard-Coded Values

| Value | Location | Should Be |
|-------|----------|-----------|
| `VITE_API_BASE_URL` | `.env` | Configurable per environment |
| `WORKFLOW_STORAGE_KEY` | [`workflow.js`](src/constants/workflow.js:1) | Dynamic based on app name |
| Toast group names | Multiple | Centralized constants |

### Missing Features

- **User Profile Page**: No page to view/edit user profile
- **Password Reset**: No forgot password flow
- **Email Verification**: No email verification after registration
- **Role-Based Access Control**: All routes require authentication, no role checks
- **Audit Logging**: No audit trail for changes
- **Bulk Operations**: No bulk delete/update for RPI mappings
- **Export/Import**: No CSV/Excel export for RPI mappings
- **Search History**: No search query persistence
- **Keyboard Shortcuts**: No keyboard navigation shortcuts

### Known Bugs & Edge Cases

- **Workflow Persistence**: localStorage may not sync across tabs
- **Pagination**: Page state resets when filters change
- **Form Validation**: Some validation only happens on submit
- **Loading States**: Some actions don't show loading indicators
- **Error Messages**: Generic error messages for some API errors

### Planned Improvements

- [ ] Add user profile management
- [ ] Implement password reset flow
- [ ] Add role-based access control
- [ ] Implement audit logging
- [ ] Add bulk operations for RPI mappings
- [ ] Add CSV/Excel export functionality
- [ ] Improve loading states across all actions
- [ ] Add keyboard shortcuts for common actions
- [ ] Implement search query persistence
- [ ] Add dark mode toggle in UI (currently only via class)
- [ ] Add internationalization (i18n) support
- [ ] Add PWA support for offline capability

---

## 18. Glossary

| Term | Definition |
|------|------------|
| **RPI** | Regulatory Performance Indicator (Регуляторный показатель эффективности) |
| **RPI Mapping** | Mapping between internal data columns and regulatory indicators |
| **Source** | Data source (database, API, file) that provides data for mapping |
| **Mapping Table** | Table that defines columns to be mapped to RPIs |
| **Mapping Column** | Individual column in a mapping table |
| **Workflow** | Multi-step project creation process (RPI form → tables → columns) |
| **KPI** | Key Performance Indicator (project metrics dashboard) |
| **httpOnly Cookie** | Secure cookie that cannot be accessed via JavaScript |
| **Composition API** | Vue 3 API pattern for organizing component logic |
| **Pinia** | Vue state management library (successor to Vuex) |
| **PrimeVue** | UI component library for Vue.js |
| **Tailwind CSS** | Utility-first CSS framework |
| **Vite** | Build tool and dev server for Vue applications |
| **Aura Theme** | PrimeVue default theme with semantic color tokens |

---

## Appendix: Quick Reference

### Common Operations

**Create a Project**:
```javascript
await useProjectsStore().createProject({ name, description });
```

**Create an RPI Mapping**:
```javascript
await useProjectsStore().createRPIMapping(projectId, {
  rpi_name: 'RPI-001',
  number: 100,
  ownership: 'internal',
  status: 'draft',
  // ...
});
```

**Filter RPI Mappings**:
```javascript
const { filteredRows, getFilterParams } = useRPIFilters(projectId, rpiMappings);
const params = getFilterParams(); // { search, status, page, size, ... }
```

**Check API Status**:
```javascript
const { available, refreshStatus } = useApiStatus();
await refreshStatus();
```

### Navigation

```javascript
// From within component
const router = useRouter();
await router.push('/projects');
await router.push(`/projects/${projectId}`);
await router.push(`/projects/${projectId}/mapping`);
```

### Status Values

**Project Status**: `draft`, `active`, `archived`

**RPI Status**: `draft`, `review`, `approved`

**RPI Ownership**: `internal`, `external`

**Measurement Types**: `absolute`, `ratio`, `index`

---

*Document generated from LayerMap codebase analysis.*
