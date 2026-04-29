<script setup>
/**
 * SourceDetailView - независимая страница работы с источником данных.
 *
 * Отображает:
 * - Информацию об источнике
 * - Таблицу колонок с возможностью для каждой выбрать показатель или измерение из РПИ
 */
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectsStore } from "@/stores/projects";
import { useSourcesStore } from "@/stores/sources";
import { useMappingTablesStore } from "@/stores/tables";
import { useRPIMappingsStore } from "@/stores/rpiMappings";
import { useProject } from "@/composables/useProject";
import { COLUMN_TYPE_LABELS, COLUMN_TYPE_COLORS } from "@/stores/workflow";
import { formatDate, formatNumber } from "@/utils/format";
import { getSourceTypeSeverity } from "@/utils/status";
import { MEASUREMENT_TYPE_MAP } from "@/constants/rpi";
import Button from "primevue/button";
import Badge from "primevue/badge";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Select from "primevue/select";
import Message from "primevue/message";

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();
const sourcesStore = useSourcesStore();
const tablesStore = useMappingTablesStore();
const rpiStore = useRPIMappingsStore();
const { projectId, project, loadProjectData, loading, error } = useProject();

const sourceId = computed(() => route.params.sourceId);
const source = computed(() =>
    sourcesStore.getSourceById(projectId.value, sourceId.value)
);

// Загрузка данных при монтировании компонента
onMounted(async () => {
    if (projectId.value) {
        await loadProjectData();
    }
});

// Получаем таблицы маппинга проекта для отображения колонок
const mappingTables = computed(() =>
    tablesStore.getMappingTablesByProjectId(projectId.value)
);

// Получаем все колонки из всех таблиц маппинга
const allColumns = computed(() => {
    const columns = [];
    for (const table of mappingTables.value) {
        for (const col of (table.columns || [])) {
            columns.push({
                ...col,
                tableName: table.name,
                tableId: table.id,
            });
        }
    }
    return columns;
});

// Получаем опции РПИ для маппинга
const rpiOptions = computed(() =>
    rpiStore.getRPIMappingOptions(projectId.value)
);

// Получаем информацию о выбранном РПИ для колонки
function getRPIMappingInfo(rpiMappingId) {
    if (!rpiMappingId) return null;
    const mappings = rpiStore.getRPIMappingsByProjectId(projectId.value);
    return mappings.find((m) => m.id === rpiMappingId);
}

// Обработчик изменения маппинга колонки
function onColumnMappingChange(column, newRpiMappingId) {
    tablesStore.updateColumnRPIMapping(
        projectId.value,
        sourceId.value,
        column.tableId,
        column.id,
        newRpiMappingId
    );
}

// Получить цвет для типа колонки
function getColumnColorClasses(type) {
    return COLUMN_TYPE_COLORS[type] || COLUMN_TYPE_COLORS.dimension;
}

function goBack() {
    router.push({ name: "ProjectDetail", params: { id: projectId.value } });
}

function navigateToMapping() {
    router.push({
        name: "RPIMapping",
        params: { id: projectId.value },
    });
}
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

    <!-- Source detail -->
    <div v-else-if="source && project" class="p-4 md:p-6">
        <!-- Breadcrumbs -->
        <nav class="mb-6 flex flex-wrap items-center gap-2 text-sm">
            <router-link :to="{ name: 'ProjectsList' }"
                class="flex items-center gap-1 text-primary transition-colors hover:text-primary-hover">
                <i class="pi pi-home text-xs"></i>
                <span>Проекты</span>
            </router-link>
            <i class="pi pi-chevron-right text-[10px] text-content-faint"></i>
            <router-link :to="{ name: 'ProjectDetail', params: { id: projectId } }"
                class="text-primary transition-colors hover:text-primary-hover">
                <span>{{ project.name }}</span>
            </router-link>
            <i class="pi pi-chevron-right text-[10px] text-content-faint"></i>
            <span class="font-medium text-content-secondary">{{ source.name }}</span>
        </nav>

        <!-- Source header -->
        <header
            class="mb-6 flex flex-col gap-4 border-b border-app-border pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-3">
                <button @click="goBack"
                    class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-app-surface-hover">
                    <i class="pi pi-arrow-left text-sm" />
                </button>
                <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-app-primary-light text-primary">
                    <i class="pi pi-table text-xl"></i>
                </div>
                <div class="flex flex-col">
                    <h1 class="text-xl font-bold font-mono text-content">{{ source.name }}</h1>
                    <p class="mt-1 text-sm text-content-muted">{{ source.description }}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <Button label="К маппингу РПИ" icon="pi pi-sitemap" size="small" outlined
                    :pt="{ root: 'rounded-lg min-h-[44px]' }" @click="navigateToMapping" />
            </div>
        </header>

        <!-- Source info cards -->
        <div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div class="rounded-lg border border-app-border bg-surface-card p-4">
                <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-content-muted">Тип источника</div>
                <Badge :value="source.type" :severity="getSourceTypeSeverity(source.type)" :pt="{ root: 'text-sm' }" />
            </div>
            <div class="rounded-lg border border-app-border bg-surface-card p-4">
                <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-content-muted">Количество строк
                </div>
                <div class="text-lg font-semibold text-content">{{ formatNumber(source.row_count) }}</div>
            </div>
            <div class="rounded-lg border border-app-border bg-surface-card p-4">
                <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-content-muted">Последнее обновление
                </div>
                <div class="text-lg font-semibold text-content">{{ formatDate(source.last_updated) }}</div>
            </div>
            <div class="rounded-lg border border-app-border bg-surface-card p-4">
                <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-content-muted">Проект</div>
                <div class="text-lg font-semibold text-content">{{ project.name }}</div>
            </div>
        </div>

        <!-- Columns mapping section -->
        <section>
            <div class="mb-4 flex items-center gap-2">
                <h2 class="flex items-center gap-2 text-base font-semibold text-content">
                    <i class="pi pi-list text-primary"></i>
                    Колонки и маппинг показателей
                </h2>
                <Badge :value="allColumns.length" severity="info" :pt="{ root: 'text-xs' }" />
            </div>

            <!-- Сообщение если нет колонок -->
            <Message v-if="allColumns.length === 0" severity="info" :closable="false">
                <div class="flex flex-col gap-2">
                    <span>Нет настроенных колонок. Добавьте колонки через страницу маппинга РПИ.</span>
                    <Button label="Перейти к маппингу РПИ" icon="pi pi-arrow-right" size="small"
                        :pt="{ root: 'rounded-lg text-xs min-h-[44px] w-fit' }" @click="navigateToMapping" />
                </div>
            </Message>

            <!-- Таблица колонок с выбором показателя/измерения -->
            <div v-else class="overflow-hidden rounded-lg border border-app-border">
                <DataTable :value="allColumns" class="w-full" responsiveLayout="scroll"
                    :paginator="allColumns.length > 10" :rows="15" :rowsPerPageOptions="[10, 15, 25, 50]"
                    emptyMessage="Нет колонок для отображения">

                    <!-- Имя колонки -->
                    <Column field="name" header="Колонка" style="min-width: 160px">
                        <template #body="{ data }">
                            <div class="flex flex-col">
                                <span class="text-sm font-mono font-semibold text-content">{{ data.name }}</span>
                                <span v-if="data.data_type" class="text-[10px] font-mono text-content-muted">{{
                                    data.data_type }}</span>
                            </div>
                        </template>
                    </Column>

                    <!-- Тип колонки (metric/dimension) -->
                    <Column field="type" header="Тип" style="min-width: 120px">
                        <template #body="{ data }">
                            <Badge v-if="data.type" :value="COLUMN_TYPE_LABELS[data.type] || data.type"
                                :severity="COLUMN_TYPE_COLORS[data.type]?.badge || 'info'"
                                :pt="{ root: 'text-[10px]' }" />
                            <span v-else class="text-xs text-content-muted">—</span>
                        </template>
                    </Column>

                    <!-- Описание колонки -->
                    <Column field="description" header="Описание" style="min-width: 200px">
                        <template #body="{ data }">
                            <span class="text-xs text-content-secondary">{{ data.description || "—" }}</span>
                        </template>
                    </Column>

                    <!-- Таблица источник -->
                    <Column field="tableName" header="Таблица" style="min-width: 130px">
                        <template #body="{ data }">
                            <span class="text-xs font-mono text-content-muted">{{ data.tableName }}</span>
                        </template>
                    </Column>

                    <!-- Маппинг на РПИ (выбор показателя/измерения) -->
                    <Column header="Показатель / Измерение РПИ" style="min-width: 280px">
                        <template #body="{ data }">
                            <div class="flex flex-col gap-1">
                                <Select v-model="data.rpiMappingId" :options="rpiOptions" optionLabel="label"
                                    optionValue="value" placeholder="Выберите показатель или измерение..."
                                    :pt="{ root: 'rounded-lg text-xs w-full' }" size="small"
                                    @change="onColumnMappingChange(data, $event.value)" />
                                <!-- Информация о выбранном РПИ -->
                                <div v-if="data.rpiMappingId" class="flex items-center gap-1.5">
                                    <Badge
                                        :value="MEASUREMENT_TYPE_MAP[getRPIMappingInfo(data.rpiMappingId)?.measurement_type] || getRPIMappingInfo(data.rpiMappingId)?.measurement_type || ''"
                                        :severity="getRPIMappingInfo(data.rpiMappingId)?.measurement_type === 'metric' ? 'info' : 'success'"
                                        :pt="{ root: 'text-[9px]' }" />
                                    <span class="text-[10px] text-content-muted">
                                        №{{ getRPIMappingInfo(data.rpiMappingId)?.number }}
                                    </span>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <!-- Статус маппинга -->
                    <Column header="Статус" style="min-width: 100px">
                        <template #body="{ data }">
                            <div v-if="data.rpiMappingId" class="flex items-center gap-1">
                                <i class="pi pi-check-circle text-xs text-app-success" />
                                <span class="text-xs text-app-success">Связано</span>
                            </div>
                            <div v-else class="flex items-center gap-1">
                                <i class="pi pi-minus-circle text-xs text-content-faint" />
                                <span class="text-xs text-content-faint">Не связано</span>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </section>

        <!-- RPI mappings for this source -->
        <section class="mt-6">
            <div class="mb-4 flex items-center gap-2">
                <h2 class="flex items-center gap-2 text-base font-semibold text-content">
                    <i class="pi pi-sitemap text-primary"></i>
                    Маппинг РПИ для этого источника
                </h2>
            </div>

            <div class="overflow-hidden rounded-lg border border-app-border">
                <DataTable
                    :value="projectsStore.getRPIMappingsByProjectId(projectId).filter(m => m.source === source.name)"
                    class="w-full" responsiveLayout="scroll" :paginator="true" :rows="10"
                    :rowsPerPageOptions="[5, 10, 20]" emptyMessage="Нет записей маппинга для этого источника">
                    <Column field="number" header="№" style="min-width: 50px" />

                    <Column field="measurement" header="Измерение" style="min-width: 180px">
                        <template #body="{ data }">
                            <span class="text-sm font-medium text-content">{{ data.measurement }}</span>
                        </template>
                    </Column>

                    <Column field="measurement_type" header="Тип" style="min-width: 100px">
                        <template #body="{ data }">
                            <Badge :value="MEASUREMENT_TYPE_MAP[data.measurement_type] || data.measurement_type"
                                :severity="data.measurement_type === 'metric' ? 'info' : 'success'"
                                :pt="{ root: 'text-[10px]' }" />
                        </template>
                    </Column>

                    <Column field="object_field" header="Объект (поле)" style="min-width: 160px">
                        <template #body="{ data }">
                            <span class="text-sm font-mono font-bold text-primary">{{ data.object_field }}</span>
                        </template>
                    </Column>

                    <Column field="status" header="Статус" style="min-width: 120px">
                        <template #body="{ data }">
                            <span :class="[
                                'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold',
                                data.status === 'approved'
                                    ? 'bg-app-success-bg text-app-success-text border border-app-success-border'
                                    : data.status === 'review'
                                        ? 'bg-app-warning-bg text-app-warning-text border border-app-warning-border'
                                        : 'bg-app-surface-hover text-app-text-muted'
                            ]">
                                <span :class="[
                                    'h-1 w-1 rounded-full',
                                    data.status === 'approved'
                                        ? 'bg-app-success'
                                        : data.status === 'review'
                                            ? 'bg-app-warning'
                                            : 'bg-content-faint'
                                ]" />
                                {{ data.status === 'approved' ? 'Утв.' : data.status === 'review' ? 'Проверка' :
                                    'Черновик' }}
                            </span>
                        </template>
                    </Column>

                    <Column field="comment" header="Комментарий" style="min-width: 180px">
                        <template #body="{ data }">
                            <span class="text-xs text-content-secondary">{{ data.comment || "—" }}</span>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </section>
    </div>

    <!-- Source not found -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-center">
        <i class="pi pi-exclamation-circle text-5xl text-content-faint"></i>
        <h2 class="mt-4 text-xl font-semibold text-content">Источник не найден</h2>
        <Button label="Назад к проекту" icon="pi pi-arrow-left" class="mt-4 !rounded-lg" :pt="{ root: 'min-h-[44px]' }"
            @click="goBack" />
    </div>
</template>
