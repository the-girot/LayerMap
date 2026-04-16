<script setup>
/**
 * RPIMappingView - независимая страница редактирования РПИ.
 *
 * Все секции доступны сразу без пошагового workflow:
 * - Таблицы маппинга (создание и редактирование)
 * - Колонки таблиц (с выбором типа: Показатель или Измерение)
 * - Основная таблица записей РПИ
 */
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useProjectsStore } from "@/stores/projects";
import { useProject } from "@/composables/useProject";
import { useRPIFilters } from "@/composables/useRPIFilters";
import { useRPIMappingForm } from "@/composables/useRPIMappingForm";
import { getMappingStatusLabel, getStatusPillClass, getStatusDotClass, getStatusBtnActiveClass } from "@/utils/status";
import { RPI_STATUS_OPTIONS, RPI_OWNERSHIP_OPTIONS } from "@/constants/rpi";
import Button from "primevue/button";
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Paginator from "primevue/paginator";
import Badge from "primevue/badge";

const router = useRouter();
const projectsStore = useProjectsStore();
const { projectId, project } = useProject();

// ── Data ───────────────────────────────────────────────────────
const rows = computed(() => projectsStore.getRPIMappingsByProjectId(projectId.value));

// ── Filters (composable) ──────────────────────────────────────
const {
    search, selectedStatus, selectedOwnership, selectedMeasurementType, selectedCalculatedType,
    pageFirst, pageSize, filteredRows, paginatedRows, quickFilters,
    approvedCount, reviewCount, draftCount,
    resetFilters, setQuickFilter, onPage,
} = useRPIFilters(rows);

// ── Form (composable) ─────────────────────────────────────────
const {
    panelOpen, panelMode, activeRow, formTouched, form,
    openAddPanel, openEditPanel, closePanel, saveRule, deleteRule,
    fillFormFromColumn,
} = useRPIMappingForm(rows, projectsStore, projectId);

// ── Source & Field dropdowns (isolated per project) ───────────
const projectSources = computed(() => {
    if (!projectId.value) return [];
    return projectsStore.getSourcesByProjectId(projectId.value) || [];
});

const projectMappingTables = computed(() => {
    if (!projectId.value) return [];
    return projectsStore.getMappingTablesByProjectId(projectId.value) || [];
});

const selectedSourceObj = computed(() =>
    projectSources.value.find((s) => s.name === form.source) || null
);

const availableColumns = computed(() => {
    if (!selectedSourceObj.value) return [];
    const table = projectMappingTables.value.find((t) => t.name === selectedSourceObj.value.name);
    return table?.columns || [];
});

const columnOptions = computed(() =>
    availableColumns.value.map((col) => ({
        label: `${col.name} (${col.dataType})`,
        value: col.name,
        id: col.id,
        dataType: col.dataType,
        description: col.description,
        type: col.type,
        isCalculated: col.isCalculated,
        formula: col.formula,
    }))
);

/** Выбранная колонка по sourceColumnId */
const selectedColumn = computed(() => {
    if (!form.sourceColumnId) return null;
    return availableColumns.value.find((c) => c.id === form.sourceColumnId) || null;
});

/** Обработчик выбора поля - автоматически заполняет связанные поля */
function onObjectFieldChange(option) {
    if (!option) return;
    const column = availableColumns.value.find((c) => c.id === option.id);
    if (column) {
        fillFormFromColumn(column);
    }
}

// ── Constants for template ────────────────────────────────────
const statusOptions = RPI_STATUS_OPTIONS;
const ownershipOptions = RPI_OWNERSHIP_OPTIONS;

function getProjectSourceByProjectIdAndName(pid, name) {
    if (!pid || !name) return null;
    return projectsStore.getSourcesByProjectId(pid)?.find(s => s.name === name) || null;
}

/** Получить колонку по sourceColumnId для записи */
function getMappingColumnForRecord(data) {
    if (!data.sourceColumnId || !data.source) return null;
    const source = getProjectSourceByProjectIdAndName(projectId.value, data.source);
    if (!source) return null;
    const table = projectMappingTables.value.find((t) => t.name === source.name);
    return table?.columns.find((c) => c.id === data.sourceColumnId) || null;
}

/** Получить класс бейджа типа колонки */
function getColumnTypeBadgeClass(data) {
    const col = getMappingColumnForRecord(data);
    if (!col) return 'bg-gray-100 text-gray-700';
    if (col.isCalculated) return 'bg-orange-100 text-orange-700';
    if (col.type === 'metric') return 'bg-indigo-100 text-indigo-700';
    return 'bg-emerald-100 text-emerald-700';
}

/** Получить букву бейджа типа колонки */
function getColumnTypeBadge(data) {
    const col = getMappingColumnForRecord(data);
    if (!col) return '?';
    if (col.isCalculated) return 'P';
    if (col.type === 'metric') return 'M';
    return 'D';
}

function goBack() {
    router.push({ name: "ProjectDetail", params: { id: projectId.value } });
}
</script>

<template>
    <div v-if="project" class="flex min-h-screen flex-col">
        <!-- ── Page header ── -->
        <header
            class="sticky top-0 z-20 flex shrink-0 flex-col gap-3 border-b border-app-border bg-surface-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div class="flex items-center gap-3">
                <button @click="goBack"
                    class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition-colors hover:bg-app-surface-hover">
                    <i class="pi pi-arrow-left text-sm text-app-text-muted" />
                </button>
                <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-primary-light text-primary">
                    <i class="pi pi-sitemap text-sm" />
                </div>
                <div>
                    <h1 class="text-sm font-semibold text-app-text">
                        РПИ: {{ project.name }}
                    </h1>
                    <p class="text-[11px] text-app-text-muted">
                        {{ rows.length }} записей · Маппинг измерений и метрик
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-3 sm:gap-4">
                <!-- Inline stats -->
                <div
                    class="hidden items-center divide-x divide-app-border rounded-lg border border-app-border text-[11px] sm:flex">
                    <span class="flex items-center gap-1.5 px-3 py-1.5 text-app-success">
                        <span class="h-1.5 w-1.5 rounded-full bg-app-success" />
                        {{ approvedCount }} утв.
                    </span>
                    <span class="flex items-center gap-1.5 px-3 py-1.5 text-app-warning">
                        <span class="h-1.5 w-1.5 rounded-full bg-app-warning" />
                        {{ reviewCount }} провер.
                    </span>
                    <span class="flex items-center gap-1.5 px-3 py-1.5 text-app-text-muted">
                        <span class="h-1.5 w-1.5 rounded-full bg-content-faint" />
                        {{ draftCount }} черн.
                    </span>
                </div>
                <Button icon="pi pi-plus" label="Добавить запись" size="small"
                    :pt="{ root: 'rounded-lg text-xs min-h-[44px]' }" @click="openAddPanel" />
            </div>
        </header>

        <!-- ── Toolbar ── -->
        <div
            class="sticky top-[53px] z-10 flex shrink-0 flex-wrap items-center gap-2 border-b border-app-border bg-surface-card px-4 py-2 md:px-6">
            <!-- Search -->
            <div class="relative w-full sm:w-56">
                <i class="pi pi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-app-text-muted" />
                <InputText v-model="search" placeholder="Поиск полей, кодов..."
                    :pt="{ root: 'w-full rounded-lg text-xs pl-7' }" size="small" />
            </div>

            <!-- Status -->
            <Select v-model="selectedStatus" :options="statusOptions" optionLabel="label" optionValue="value"
                placeholder="Статус" :pt="{ root: 'rounded-lg text-xs w-full sm:w-36' }" size="small" />

            <!-- Ownership -->
            <Select v-model="selectedOwnership" :options="ownershipOptions" optionLabel="label" optionValue="value"
                placeholder="Принадлежность" :pt="{ root: 'rounded-lg text-xs w-full sm:w-36' }" size="small" />

            <div class="hidden h-4 w-px bg-app-border sm:block" />

            <!-- Quick filter chips -->
            <div class="flex flex-wrap items-center gap-1">
                <button v-for="qf in quickFilters" :key="qf.value ?? 'all'" @click="setQuickFilter(qf.value)" :class="[
                    'rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all min-h-[44px] flex items-center',
                    selectedMeasurementType === qf.value
                        ? 'bg-primary text-white shadow-card'
                        : 'text-app-text-muted hover:bg-app-surface-hover',
                ]">
                    {{ qf.label }}
                    <span :class="[
                        'ml-0.5 text-[10px]',
                        selectedMeasurementType === qf.value ? 'text-primary-highlight' : 'text-content-faint',
                    ]">{{ qf.count }}</span>
                </button>
            </div>

            <!-- Базовый / Расчетный фильтры -->
            <div class="flex items-center gap-1">
                <div class="h-4 w-px bg-app-border" />
                <button @click="selectedCalculatedType = selectedCalculatedType === 'basic' ? null : 'basic'" :class="[
                    'rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all min-h-[44px] flex items-center',
                    selectedCalculatedType === 'basic'
                        ? 'border-purple-300 bg-purple-50 text-purple-700 border'
                        : 'text-app-text-muted hover:bg-app-surface-hover',
                ]">
                    Базовые
                    <span class="ml-0.5 text-[10px]">{{rows.filter(r => !r.isCalculated).length}}</span>
                </button>
                <button @click="selectedCalculatedType = selectedCalculatedType === 'calculated' ? null : 'calculated'"
                    :class="[
                        'rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all min-h-[44px] flex items-center',
                        selectedCalculatedType === 'calculated'
                            ? 'border-orange-300 bg-orange-50 text-orange-700 border'
                            : 'text-app-text-muted hover:bg-app-surface-hover',
                    ]">
                    Расчетные
                    <span class="ml-0.5 text-[10px]">{{rows.filter(r => r.isCalculated).length}}</span>
                </button>
            </div>

            <!-- Right: count + clear -->
            <div class="ml-auto flex items-center gap-2">
                <span class="text-[11px] tabular-nums text-app-text-muted">
                    <span class="font-medium text-app-text-secondary">{{ filteredRows.length }}</span>
                    результатов
                </span>
                <Transition name="fade">
                    <button
                        v-if="search || selectedStatus || selectedOwnership || selectedMeasurementType || selectedCalculatedType"
                        @click="resetFilters"
                        class="flex min-h-[44px] items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors hover:bg-app-surface-hover text-app-text-muted">
                        <i class="pi pi-times text-[9px]" /> Сбросить
                    </button>
                </Transition>
            </div>
        </div>

        <!-- ── Body: table + side panel ── -->
        <div class="flex flex-1 flex-col md:flex-row">
            <!-- Table column -->
            <div class="min-w-0 flex-1 overflow-x-auto">
                <DataTable :value="paginatedRows" responsiveLayout="scroll" selectionMode="single"
                    v-model:selection="activeRow" @rowSelect="(e) => openEditPanel(e.data)" class="mapping-table w-full"
                    scrollable scrollHeight="calc(100vh - 200px)" :pt="{
                        root: 'text-sm',
                    }">
                    <template #empty>
                        <div class="py-20 text-center">
                            <i class="pi pi-inbox text-4xl text-content-faint" />
                            <p class="mt-3 text-sm font-medium text-app-text-muted">
                                Нет записей
                            </p>
                            <p class="mt-1 text-xs text-app-text-muted">
                                Попробуйте изменить фильтры или добавьте новую запись
                            </p>
                            <button @click="resetFilters" class="mt-3 text-xs font-medium text-primary hover:underline">
                                Сбросить фильтры
                            </button>
                        </div>
                    </template>

                    <!-- № -->
                    <Column field="number" header="№" style="min-width: 50px">
                        <template #body="{ data }">
                            <span class="text-xs font-mono font-bold text-app-text-secondary">
                                {{ data.number }}
                            </span>
                        </template>
                    </Column>

                    <!-- Принадлежность -->
                    <Column field="ownership" header="Принадлежность" style="min-width: 120px">
                        <template #body="{ data }">
                            <span class="text-xs text-app-text-secondary">{{ data.ownership }}</span>
                        </template>
                    </Column>

                    <!-- Статус -->
                    <Column field="status" header="Статус" style="min-width: 120px">
                        <template #body="{ data }">
                            <span
                                :class="['inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold', getStatusPillClass(data.status)]">
                                <span :class="['h-1 w-1 rounded-full', getStatusDotClass(data.status)]" />
                                {{ getMappingStatusLabel(data.status) }}
                            </span>
                        </template>
                    </Column>

                    <!-- Источник -->
                    <Column field="source" header="Источник" style="min-width: 160px">
                        <template #body="{ data }">
                            <div v-if="data.source" class="flex items-center gap-1.5">
                                <span
                                    class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                                    :class="getProjectSourceByProjectIdAndName(projectId, data.source)?.type === 'API' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                                    {{ getProjectSourceByProjectIdAndName(projectId, data.source)?.type === 'API' ? 'A'
                                        : 'D' }}
                                </span>
                                <span class="text-xs font-mono text-app-text-secondary">{{ data.source }}</span>
                            </div>
                            <span v-else class="text-xs text-content-faint">—</span>
                        </template>
                    </Column>

                    <!-- Блок -->
                    <Column field="block" header="Блок" style="min-width: 100px">
                        <template #body="{ data }">
                            <span class="text-xs text-app-text-secondary">{{ data.block }}</span>
                        </template>
                    </Column>

                    <!-- Тип измерения -->
                    <Column field="measurementType" header="Тип измерения" style="min-width: 120px">
                        <template #body="{ data }">
                            <Badge :value="data.measurementType"
                                :severity="data.measurementType === 'Метрика' ? 'info' : 'success'"
                                :pt="{ root: 'text-[10px]' }" />
                        </template>
                    </Column>

                    <!-- Тип (базовый/расчетный) -->
                    <Column field="isCalculated" header="Тип" style="min-width: 90px">
                        <template #body="{ data }">
                            <Badge :value="data.isCalculated ? 'Расчетный' : 'Базовый'"
                                :severity="data.isCalculated ? 'warning' : 'contrast'" :pt="{ root: 'text-[10px]' }" />
                        </template>
                    </Column>

                    <!-- Связанное поле источника -->
                    <Column field="sourceColumnId" header="Поле источника" style="min-width: 140px">
                        <template #body="{ data }">
                            <div v-if="data.sourceColumnId" class="flex items-center gap-1.5">
                                <span
                                    class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                                    :class="getColumnTypeBadgeClass(data)">
                                    {{ getColumnTypeBadge(data) }}
                                </span>
                                <span class="text-xs font-mono text-app-text-secondary">{{ data.objectField }}</span>
                            </div>
                            <span v-else class="text-xs text-content-faint">—</span>
                        </template>
                    </Column>

                    <!-- Формула -->
                    <Column field="formula" header="Формула" style="min-width: 200px">
                        <template #body="{ data }">
                            <span v-if="data.isCalculated && data.formula" class="text-xs font-mono text-orange-600">{{
                                data.formula }}</span>
                            <span v-else class="text-xs text-content-faint">—</span>
                        </template>
                    </Column>

                    <!-- Измерение -->
                    <Column field="measurement" header="Измерение" style="min-width: 180px">
                        <template #body="{ data }">
                            <span class="text-xs font-medium text-app-text">{{ data.measurement }}</span>
                        </template>
                    </Column>

                    <!-- Описание измерения -->
                    <Column field="measurementDescription" header="Описание" style="min-width: 220px">
                        <template #body="{ data }">
                            <span class="text-xs text-app-text-secondary">{{ data.measurementDescription || "—"
                            }}</span>
                        </template>
                    </Column>

                    <!-- Источник (отчёт / справочник) -->
                    <Column field="sourceReport" header="Отчёт / Справочник" style="min-width: 160px">
                        <template #body="{ data }">
                            <span class="text-xs text-app-text-secondary">{{ data.sourceReport || "—" }}</span>
                        </template>
                    </Column>

                    <!-- Объект (поле/столбец) -->
                    <Column field="objectField" header="Объект (поле)" style="min-width: 160px">
                        <template #body="{ data }">
                            <span class="text-xs font-mono font-bold text-primary">{{ data.objectField }}</span>
                        </template>
                    </Column>

                    <!-- Дата внесения -->
                    <Column field="dateAdded" header="Дата внесения" style="min-width: 110px">
                        <template #body="{ data }">
                            <span class="text-xs text-app-text-muted">{{ data.dateAdded || "—" }}</span>
                        </template>
                    </Column>

                    <!-- Дата выведения -->
                    <Column field="dateRemoved" header="Дата выведения" style="min-width: 110px">
                        <template #body="{ data }">
                            <span v-if="data.dateRemoved" class="text-xs text-app-error">{{ data.dateRemoved
                            }}</span>
                            <span v-else class="text-xs text-content-faint">—</span>
                        </template>
                    </Column>

                    <!-- Комментарий -->
                    <Column field="comment" header="Комментарий" style="min-width: 180px">
                        <template #body="{ data }">
                            <span class="text-xs text-app-text-secondary">{{ data.comment || "—" }}</span>
                        </template>
                    </Column>

                    <!-- Файл для проверки -->
                    <Column field="verificationFile" header="Файл проверки" style="min-width: 140px">
                        <template #body="{ data }">
                            <span v-if="data.verificationFile"
                                class="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
                                <i class="pi pi-file text-[9px]" />
                                {{ data.verificationFile }}
                            </span>
                            <span v-else class="text-xs text-content-faint">—</span>
                        </template>
                    </Column>

                    <!-- Actions -->
                    <Column style="width: 44px">
                        <template #body="{ data }">
                            <div class="flex justify-end pr-1">
                                <button @click.stop="openEditPanel(data)"
                                    class="flex min-h-[32px] min-w-[32px] items-center justify-center rounded transition-all text-content-faint hover:bg-app-surface-hover hover:text-app-text-secondary">
                                    <i class="pi pi-pencil text-[9px]" />
                                </button>
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <!-- Paginator footer -->
                <div
                    class="flex flex-col gap-3 border-t border-app-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
                    <span class="text-[11px] tabular-nums text-app-text-muted">
                        <span class="font-medium text-app-text-secondary">{{ paginatedRows.length }}</span> из
                        <span class="font-medium text-app-text-secondary">{{ filteredRows.length }}</span> записей
                    </span>
                    <Paginator v-model:first="pageFirst" :rows="pageSize" :totalRecords="filteredRows.length"
                        :rowsPerPageOptions="[10, 20, 50]" @page="onPage"
                        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                        :pt="{ root: 'bg-transparent p-0' }" />
                </div>
            </div>

            <!-- ── Side panel ── -->
            <Transition name="side-panel">
                <div v-if="panelOpen"
                    class="flex h-auto w-full shrink-0 flex-col overflow-hidden border-t border-l border-app-border md:sticky md:top-[97px] md:h-[calc(100vh-97px)] md:w-[420px] md:border-t-0">
                    <!-- Panel header -->
                    <div class="flex shrink-0 items-center justify-between border-b border-app-divider px-5 py-3.5">
                        <div>
                            <div class="flex items-center gap-2">
                                <h2 class="text-sm font-semibold text-app-text">
                                    {{ panelMode === "add" ? "Новая запись РПИ" : "Редактировать запись" }}
                                </h2>
                                <span :class="[
                                    'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
                                    panelMode === 'add' ? 'bg-app-primary-light text-primary' : 'bg-app-surface-hover text-app-text-muted',
                                ]">{{ panelMode }}</span>
                            </div>
                            <p v-if="panelMode === 'edit' && form.objectField"
                                class="mt-0.5 truncate font-mono text-[10px] text-app-text-muted">
                                {{ form.objectField }}
                            </p>
                        </div>
                        <button @click="closePanel"
                            class="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg transition-colors hover:bg-app-surface-hover">
                            <i class="pi pi-times text-xs text-app-text-muted" />
                        </button>
                    </div>

                    <!-- Panel body -->
                    <div class="flex-1 overflow-y-auto px-5 py-5">
                        <div class="space-y-4">
                            <!-- Number -->
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    №
                                </label>
                                <InputText v-model="form.number" type="number"
                                    :pt="{ root: 'w-full rounded-lg text-xs' }" />
                            </div>

                            <!-- Ownership -->
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Принадлежность
                                </label>
                                <Select v-model="form.ownership"
                                    :options="['Аналитика', 'Маркетинг', 'Гео', 'Техническое']" placeholder="Выберите"
                                    :pt="{ root: 'w-full rounded-lg text-xs' }" />
                            </div>

                            <!-- Status -->
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Статус
                                </label>
                                <div class="flex gap-2">
                                    <button v-for="s in [
                                        { value: 'approved', label: 'Утв.' },
                                        { value: 'review', label: 'Проверка' },
                                        { value: 'draft', label: 'Черновик' },
                                    ]" :key="s.value" @click="form.status = s.value" :class="[
                                        'flex-1 rounded-lg border py-2.5 text-[10px] font-semibold transition-all min-h-[44px]',
                                        form.status === s.value ? getStatusBtnActiveClass(s.value) : 'border-app-border text-app-text-muted hover:border-app-border-hover hover:text-app-text-secondary',
                                    ]">
                                        {{ s.label }}
                                    </button>
                                </div>
                            </div>

                            <!-- Source -->
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Источник данных
                                </label>
                                <Select v-model="form.source" :options="projectSources" optionLabel="name"
                                    optionValue="name" placeholder="Выберите источник"
                                    :pt="{ root: 'w-full rounded-lg text-xs' }">
                                    <template #option="slotProps">
                                        <div class="flex items-center gap-2">
                                            <span
                                                class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                                                :class="slotProps.option.type === 'API' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                                                {{ slotProps.option.type === 'API' ? 'A' : 'D' }}
                                            </span>
                                            <div>
                                                <span class="text-xs font-medium">{{ slotProps.option.name }}</span>
                                                <span class="ml-1.5 text-[10px] text-app-text-muted">{{
                                                    slotProps.option.description }}</span>
                                            </div>
                                        </div>
                                    </template>
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value" class="flex items-center gap-2">
                                            <span
                                                class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                                                :class="selectedSourceObj?.type === 'API' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                                                {{ selectedSourceObj?.type === 'API' ? 'A' : 'D' }}
                                            </span>
                                            <span class="text-xs font-medium">{{ slotProps.value }}</span>
                                        </div>
                                        <span v-else class="text-app-text-muted">{{ slotProps.placeholder }}</span>
                                    </template>
                                </Select>
                            </div>

                            <!-- Block -->
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Блок
                                </label>
                                <InputText v-model="form.block" placeholder="Сессии"
                                    :pt="{ root: 'w-full rounded-lg text-xs' }" />
                            </div>

                            <!-- Measurement type -->
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Тип измерения
                                </label>
                                <Select v-model="form.measurementType" :options="['Измерение', 'Метрика']"
                                    placeholder="Выберите" :pt="{ root: 'w-full rounded-lg text-xs' }" />
                            </div>

                            <!-- Базовый / Расчетный (readonly при связанной колонке) -->
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Тип показателя / измерения
                                </label>
                                <div class="flex gap-2">
                                    <button @click="!selectedColumn && (form.isCalculated = false)"
                                        :disabled="!!selectedColumn" :class="[
                                            'flex-1 rounded-lg border py-2.5 text-[10px] font-semibold transition-all min-h-[44px]',
                                            !form.isCalculated
                                                ? 'border-purple-300 bg-purple-50 text-purple-700'
                                                : 'border-app-border text-app-text-muted hover:border-app-border-hover hover:text-app-text-secondary',
                                            selectedColumn ? 'opacity-60 cursor-not-allowed' : '',
                                        ]">
                                        Базовый
                                    </button>
                                    <button @click="!selectedColumn && (form.isCalculated = true)"
                                        :disabled="!!selectedColumn" :class="[
                                            'flex-1 rounded-lg border py-2.5 text-[10px] font-semibold transition-all min-h-[44px]',
                                            form.isCalculated
                                                ? 'border-orange-300 bg-orange-50 text-orange-700'
                                                : 'border-app-border text-app-text-muted hover:border-app-border-hover hover:text-app-text-secondary',
                                            selectedColumn ? 'opacity-60 cursor-not-allowed' : '',
                                        ]">
                                        Расчетный
                                    </button>
                                </div>
                                <p v-if="selectedColumn" class="text-[10px] text-app-text-muted">
                                    <i class="pi pi-lock text-[8px] mr-1" />
                                    Тип определяется полем "{{ selectedColumn.name }}"
                                </p>
                            </div>

                            <!-- Formula (только для расчетных) -->
                            <div v-if="form.isCalculated" class="space-y-1.5">
                                <label
                                    class="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Формула <span class="text-app-error text-[10px] font-normal">req.</span>
                                </label>
                                <InputText v-model="form.formula" placeholder="[Показатель 1] + [Показатель 2] / 100"
                                    :pt="{ root: 'w-full rounded-lg font-mono text-xs' }"
                                    :class="{ 'border-app-error': formTouched && form.isCalculated && !form.formula }" />
                                <p class="text-[10px] text-app-text-muted">
                                    Используйте [Имя поля] для ссылки на другие показатели
                                </p>
                            </div>

                            <!-- Measurement -->
                            <div class="space-y-1.5">
                                <label
                                    class="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Измерение <span class="text-app-error text-[10px] font-normal">req.</span>
                                </label>
                                <InputText v-model="form.measurement" placeholder="Идентификатор визита"
                                    :pt="{ root: 'w-full rounded-lg text-xs' }"
                                    :class="{ 'border-app-error': formTouched && !form.measurement }" />
                                <p v-if="selectedColumn" class="text-[10px] text-app-text-muted">
                                    <i class="pi pi-link text-[8px] mr-1" />
                                    Связано с полем: <span class="font-mono font-bold text-primary">{{
                                        selectedColumn.name }}</span>
                                    <span class="ml-1">({{ selectedColumn.dataType }})</span>
                                </p>
                            </div>

                            <!-- Description -->
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Описание
                                </label>
                                <InputText v-model="form.measurementDescription"
                                    placeholder="Что представляет это измерение?"
                                    :pt="{ root: 'w-full rounded-lg text-xs' }" />
                            </div>

                            <!-- Source report -->
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Отчёт / Справочник
                                </label>
                                <InputText v-model="form.sourceReport" placeholder="Отчёт по визитам"
                                    :pt="{ root: 'w-full rounded-lg text-xs' }" />
                            </div>

                            <!-- Object field -->
                            <div class="space-y-1.5">
                                <label
                                    class="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Поле источника <span class="text-app-error text-[10px] font-normal">req.</span>
                                </label>
                                <Select v-model="form.objectField" :options="columnOptions" optionLabel="label"
                                    optionValue="value" placeholder="Сначала выберите источник" :disabled="!form.source"
                                    :pt="{ root: 'w-full rounded-lg text-xs' }"
                                    :class="{ 'border-app-error': formTouched && !form.objectField }"
                                    @change="(e) => onObjectFieldChange(e.value)">
                                    <template #option="slotProps">
                                        <div class="flex items-center gap-2 py-1">
                                            <!-- Type badge -->
                                            <span
                                                class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                                                :class="slotProps.option.isCalculated
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : slotProps.option.type === 'metric'
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-emerald-100 text-emerald-700'">
                                                {{ slotProps.option.isCalculated ? 'P' : slotProps.option.type ===
                                                    'metric' ? 'M' : 'D' }}
                                            </span>
                                            <div class="flex-1">
                                                <span class="text-xs font-mono font-medium">{{ slotProps.option.value
                                                    }}</span>
                                                <span class="ml-1.5 text-[10px] text-app-text-muted">{{
                                                    slotProps.option.dataType }}</span>
                                            </div>
                                        </div>
                                        <p v-if="slotProps.option.description"
                                            class="ml-7 mt-0.5 text-[10px] text-app-text-muted">
                                            {{ slotProps.option.description }}
                                        </p>
                                    </template>
                                    <template #value="slotProps">
                                        <div v-if="slotProps.value" class="flex items-center gap-2">
                                            <span class="text-xs font-mono font-bold text-primary">{{ slotProps.value
                                                }}</span>
                                            <span v-if="selectedColumn" class="text-[10px] text-app-text-muted">
                                                ({{ selectedColumn.isCalculated ? 'расчетный' : 'базовый' }})
                                            </span>
                                        </div>
                                        <span v-else class="text-app-text-muted">
                                            {{ form.source ? 'Выберите поле' : 'Сначала выберите источник' }}
                                        </span>
                                    </template>
                                </Select>
                                <!-- Source indicator -->
                                <div v-if="form.source"
                                    class="flex items-center gap-1.5 rounded-md bg-app-surface-hover px-2 py-1">
                                    <span
                                        class="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[8px] font-bold"
                                        :class="selectedSourceObj?.type === 'API' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                                        {{ selectedSourceObj?.type === 'API' ? 'A' : 'D' }}
                                    </span>
                                    <span class="text-[10px] text-app-text-muted">Поля из:</span>
                                    <span class="text-[10px] font-semibold text-app-text-secondary">{{
                                        selectedSourceObj?.name ||
                                        form.source }}</span>
                                    <span class="ml-auto text-[10px] text-content-faint">{{ columnOptions.length }}
                                        полей</span>
                                </div>
                            </div>

                            <!-- Comment -->
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Комментарий
                                </label>
                                <InputText v-model="form.comment" placeholder="Дополнительные заметки"
                                    :pt="{ root: 'w-full rounded-lg text-xs' }" />
                            </div>

                            <!-- Verification file -->
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                                    Файл для проверки
                                </label>
                                <InputText v-model="form.verificationFile" placeholder="mapping.xlsx"
                                    :pt="{ root: 'w-full rounded-lg font-mono text-xs' }" />
                            </div>
                        </div>
                    </div>

                    <!-- Panel footer -->
                    <div class="flex shrink-0 items-center gap-2 border-t border-app-divider px-5 py-3.5">
                        <button @click="closePanel"
                            class="min-h-[44px] text-xs text-app-text-muted transition-colors hover:bg-app-surface-hover px-3 rounded">
                            Отмена
                        </button>
                        <div class="flex-1" />
                        <Button v-if="panelMode === 'edit'" label="Удалить" severity="danger" size="small"
                            :pt="{ root: 'rounded-lg px-4 text-xs min-h-[44px]' }" @click="deleteRule" />
                        <Button :label="panelMode === 'add' ? 'Сохранить' : 'Обновить'" size="small"
                            :pt="{ root: 'rounded-lg px-4 text-xs min-h-[44px]' }" @click="saveRule" />
                    </div>
                </div>
            </Transition>
        </div>
    </div>

    <!-- Project not found -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-center">
        <i class="pi pi-exclamation-circle text-5xl text-content-faint"></i>
        <h2 class="mt-4 text-xl font-semibold text-app-text">Проект не найден</h2>
        <Button label="К списку проектов" icon="pi pi-arrow-left" class="mt-4 !rounded-lg"
            :pt="{ root: 'min-h-[44px]' }" @click="goBack" />
    </div>

</template>

<style scoped>
/* ── Side panel slide transition ── */
.side-panel-enter-active,
.side-panel-leave-active {
    transition: width 220ms cubic-bezier(0.16, 1, 0.3, 1),
        opacity 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

.side-panel-enter-from,
.side-panel-leave-to {
    width: 0 !important;
    opacity: 0;
}

/* ── Filter clear fade ── */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 150ms;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
