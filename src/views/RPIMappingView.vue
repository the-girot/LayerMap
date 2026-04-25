<script setup>
/**
 * RPIMappingView - независимая страница редактирования РПИ.
 *
 * Все секции доступны сразу без пошагового workflow:
 * - Таблицы маппинга (создание и редактирование)
 * - Колонки таблиц (с выбором типа: Показатель или Измерение)
 * - Основная таблица записей РПИ
 */
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProjectsStore } from "@/stores/projects";
import { useProject } from "@/composables/useProject";
import { useRPIFilters } from "@/composables/useRPIFilters";
import { useRPIMappingForm } from "@/composables/useRPIMappingForm";
import RPIMappingHeader from "@/components/rpi/RPIMappingHeader.vue";
import RPIMappingToolbar from "@/components/rpi/RPIMappingToolbar.vue";
import RPIMappingTable from "@/components/rpi/RPIMappingTable.vue";
import RPIMappingPanel from "@/components/rpi/RPIMappingPanel.vue";
import Button from "primevue/button";

const router = useRouter();
const projectsStore = useProjectsStore();
const { projectId, project, loadProjectData, loading, error } = useProject();

// ── Data ───────────────────────────────────────────────────────
const rows = computed(() => projectsStore.getRPIMappingsByProjectId(projectId.value));

// Загрузка данных при монтировании компонента
onMounted(async () => {
    if (projectId.value) {
        await loadProjectData();
    }
});

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
    const tableId = selectedSourceObj.value.mappingTableId;
    if (!tableId) return [];
    const table = projectMappingTables.value.find((t) => t.id === tableId);
    return table?.columns || [];
});

const columnOptions = computed(() => {
    const options = availableColumns.value.map((col) => {
        // Guard: проверяем форму данных колонки
        if (!col.name || !col.dataType) {
            console.warn('[RPIMappingView] Колонка имеет неправильную форму:', col);
        }
        return {
            label: `${col.name} (${col.dataType})`,
            value: col.name,
            id: col.id,
            dataType: col.dataType,
            description: col.description,
            type: col.type,
            is_calculated: col.isCalculated,
            formula: col.formula,
        };
    });
    // Guard: логируем если columnOptions пустой после выбора источника
    if (selectedSourceObj.value && options.length === 0) {
        console.warn('[RPIMappingView] columnOptions пуст после выбора источника:', selectedSourceObj.value.name);
    }
    return options;
});

/** Выбранная колонка по sourceColumnId */
const selectedColumn = computed(() => {
    if (!form.source_column_id) return null;
    return availableColumns.value.find((c) => c.id === form.source_column_id) || null;
});

/** Обработчик выбора поля - автоматически заполняет связанные поля */
function onObjectFieldChange(option) {
    if (!option) return;
    const column = availableColumns.value.find((c) => c.id === option.id);
    if (column) {
        fillFormFromColumn(column);
    }
}

function goBack() {
    router.push({ name: "ProjectDetail", params: { id: projectId.value } });
}

// ── Props для компонентов ──────────────────────────────────────
const headerProps = computed(() => ({
    projectName: project.value?.name || '',
    totalCount: rows.value.length,
    approvedCount: approvedCount.value,
    reviewCount: reviewCount.value,
    draftCount: draftCount.value,
}));

const tableProps = computed(() => ({
    rows: paginatedRows.value,
    filteredCount: filteredRows.value.length,
    pageFirst: pageFirst.value,
    pageSize: pageSize.value,
    projectId: projectId.value,
    mappingTables: projectMappingTables.value,
    sources: projectSources.value,
    activeRow: activeRow.value,  // ← добавить
}));

const panelProps = computed(() => ({
    panelOpen: panelOpen.value,
    panelMode: panelMode.value,
    form: form,
    formTouched: formTouched.value,
    projectSources: projectSources.value,
    columnOptions: columnOptions.value,
    selectedColumn: selectedColumn.value,
    selectedSourceObj: selectedSourceObj.value,
    projectMappingTables: projectMappingTables.value,
}));
</script>

<template>
    <!-- Loading state -->
    <div v-if="loading" class="flex min-h-screen items-center justify-center">
        <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex min-h-screen flex-col items-center justify-center py-16 text-center">
        <i class="pi pi-exclamation-circle text-5xl text-app-error"></i>
        <h2 class="mt-4 text-xl font-semibold text-app-text">Ошибка загрузки</h2>
        <p class="mt-2 text-sm text-app-text-muted">{{ error }}</p>
        <Button label="Обновить" icon="pi pi-refresh" class="mt-4 !rounded-lg" :pt="{ root: 'min-h-[44px]' }"
            @click="loadProjectData" />
    </div>

    <!-- RPI Mapping view -->
    <div v-else-if="project" class="flex min-h-screen flex-col">
        <RPIMappingHeader v-bind="headerProps" @back="goBack" @add="openAddPanel" />
        <RPIMappingToolbar v-model:search="search" v-model:selectedStatus="selectedStatus"
            v-model:selectedOwnership="selectedOwnership" v-model:selectedMeasurementType="selectedMeasurementType"
            v-model:selectedCalculatedType="selectedCalculatedType" :quick-filters="quickFilters"
            :filtered-count="filteredRows.length" :total-rows="rows.length" @reset="resetFilters" />
        <div class="flex flex-1 flex-col md:flex-row">
            <RPIMappingTable v-bind="tableProps" @row-select="activeRow = $event" @edit="openEditPanel"
                @page="onPage" />
            <RPIMappingPanel v-bind="panelProps" @close="closePanel" @save="saveRule" @delete="deleteRule"
                @source-change="(value) => {
                    form.source = value;
                    if (!value) {
                        // При очистке источника сбрасываем привязку к колонке,
                        // но сохраняем object_field если он был введен вручную
                        form.source_column_id = null;
                    } else {
                        // При выборе источника сбрасываем поле для выбора из новых опций
                        form.object_field = null;
                        form.source_column_id = null;
                    }
                }" @field-change="onObjectFieldChange" />
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

<style>
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
