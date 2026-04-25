<script setup>
import { computed, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import Badge from 'primevue/badge';
import { getProjectSourceByProjectIdAndName, getColumnTypeBadgeClass, getColumnTypeBadge } from '@/utils/mapping';
import { getStatusPillClass, getStatusDotClass, getMappingStatusLabel } from '@/utils/status';
import { MEASUREMENT_TYPE_MAP } from '@/constants/rpi';


const activeRow = ref(null);
const props = defineProps({
    rows: {
        type: Array,
        required: true
    },
    activeRow: {
        type: Object,
        default: null
    },
    filteredCount: {
        type: Number,
        required: true
    },
    pageFirst: {
        type: Number,
        required: true
    },
    pageSize: {
        type: Number,
        required: true
    },
    projectId: {
        type: String,
        required: true
    },
    mappingTables: {
        type: Array,
        required: true
    },
    sources: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['row-select', 'edit', 'page', 'reset-filters']);

const paginatedRows = computed(() => {
    const start = props.pageFirst;
    const end = start + props.pageSize;
    return props.rows.slice(start, end);
});

function handleRowSelect(event) {
    emit('row-select', event.data);
    emit('edit', event.data);
}

function handlePage(event) {
    emit('page', event);
}

function handleResetFilters() {
    emit('reset-filters');
}

function getSourceType(sourceName) {
    const source = getProjectSourceByProjectIdAndName(props.projectId, sourceName, props.sources);
    return source?.type || 'DATA';
}
</script>

<template>
    <div class="min-w-0 flex-1 overflow-x-auto">
        <DataTable :value="paginatedRows" selectionMode="single" :selection="activeRow"
            @update:selection="emit('row-select', $event); emit('edit', $event)" responsiveLayout="scroll"
            @rowSelect="handleRowSelect" class="mapping-table w-full" scrollable scrollHeight="calc(100vh - 200px)" :pt="{
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
                    <button @click="handleResetFilters" class="mt-3 text-xs font-medium text-primary hover:underline">
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
                        <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                            :class="getSourceType(data.source) === 'API' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                            {{ getSourceType(data.source) === 'API' ? 'A' : 'D' }}
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
            <Column field="measurement_type" header="Тип измерения" style="min-width: 120px">
                <template #body="{ data }">
                    <Badge :value="MEASUREMENT_TYPE_MAP[data.measurement_type] || data.measurement_type"
                        :severity="data.measurement_type === 'metric' ? 'info' : 'success'"
                        :pt="{ root: 'text-[10px]' }" />
                </template>
            </Column>

            <!-- Тип (базовый/расчетный) -->
            <Column field="is_calculated" header="Тип" style="min-width: 90px">
                <template #body="{ data }">
                    <Badge :value="data.is_calculated ? 'Расчетный' : 'Базовый'"
                        :severity="data.is_calculated ? 'warning' : 'contrast'" :pt="{ root: 'text-[10px]' }" />
                </template>
            </Column>

            <!-- Связанное поле источника -->
            <Column field="source_column_id" header="Поле источника" style="min-width: 140px">
                <template #body="{ data }">
                    <div v-if="data.source_column_id" class="flex items-center gap-1.5">
                        <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
                            :class="getColumnTypeBadgeClass(data, projectId, sources, mappingTables)">
                            {{ getColumnTypeBadge(data, projectId, sources, mappingTables) }}
                        </span>
                        <span class="text-xs font-mono text-app-text-secondary">{{ data.object_field }}</span>
                    </div>
                    <span v-else class="text-xs text-content-faint">—</span>
                </template>
            </Column>

            <!-- Формула -->
            <Column field="formula" header="Формула" style="min-width: 200px">
                <template #body="{ data }">
                    <span v-if="data.is_calculated && data.formula" class="text-xs font-mono text-orange-600">{{
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
            <Column field="measurement_description" header="Описание" style="min-width: 220px">
                <template #body="{ data }">
                    <span class="text-xs text-app-text-secondary">{{ data.measurement_description || "—" }}</span>
                </template>
            </Column>

            <!-- Источник (отчёт / справочник) -->
            <Column field="source_report" header="Отчёт / Справочник" style="min-width: 160px">
                <template #body="{ data }">
                    <span class="text-xs text-app-text-secondary">{{ data.source_report || "—" }}</span>
                </template>
            </Column>

            <!-- Объект (поле/столбец) -->
            <Column field="object_field" header="Объект (поле)" style="min-width: 160px">
                <template #body="{ data }">
                    <span class="text-xs font-mono font-bold text-primary">{{ data.object_field }}</span>
                </template>
            </Column>

            <!-- Дата внесения -->
            <Column field="date_added" header="Дата внесения" style="min-width: 110px">
                <template #body="{ data }">
                    <span class="text-xs text-app-text-muted">{{ data.date_added || "—" }}</span>
                </template>
            </Column>

            <!-- Дата выведения -->
            <Column field="date_removed" header="Дата выведения" style="min-width: 110px">
                <template #body="{ data }">
                    <span v-if="data.date_removed" class="text-xs text-app-error">{{ data.date_removed
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
            <Column field="verification_file" header="Файл проверки" style="min-width: 140px">
                <template #body="{ data }">
                    <span v-if="data.verification_file"
                        class="inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
                        <i class="pi pi-file text-[9px]" />
                        {{ data.verification_file }}
                    </span>
                    <span v-else class="text-xs text-content-faint">—</span>
                </template>
            </Column>

            <!-- Actions -->
            <Column style="width: 44px">
                <template #body="{ data }">
                    <div class="flex justify-end pr-1">
                        <button @click.stop="handleRowSelect({ data })"
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
                <span class="font-medium text-app-text-secondary">{{ filteredCount }}</span> записей
            </span>
            <Paginator :first="pageFirst" :rows="pageSize" :totalRecords="filteredCount"
                :rowsPerPageOptions="[10, 20, 50]" @page="handlePage"
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                :pt="{ root: 'bg-transparent p-0' }" />
        </div>
    </div>
</template>
