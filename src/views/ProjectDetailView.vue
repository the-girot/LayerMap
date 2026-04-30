<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import Button from 'primevue/button';
import { useProjectsStore } from '@/stores/projects';
import { useSourcesStore } from '@/stores/sources';
import { useMappingTablesStore } from '@/stores/tables';
import { useRPIMappingsStore } from '@/stores/rpiMappings';
import { formatDate } from '@/utils/format';
import CreateSourceDialog from '@/components/common/CreateSourceDialog.vue';
import CreateMappingTableDialog from '@/components/common/CreateMappingTableDialog.vue';
import CreateRPIMappingDialog from '@/components/common/CreateRPIMappingDialog.vue';

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();
const sourcesStore = useSourcesStore();
const tablesStore = useMappingTablesStore();
const rpiStore = useRPIMappingsStore();

const projectId = computed(() => {
    const id = Number(route.params.id);
    return Number.isNaN(id) ? null : id;
});

const showSourceDialog = ref(false);
const showTableDialog = ref(false);
const showRpiDialog = ref(false);
const isLoading = ref(true);
const expandedSources = ref([]);

onMounted(async () => {
    if (projectId.value === null) {
        router.push({ name: 'ProjectsList' });
        return;
    }
    try {
        await projectsStore.loadProjectData(projectId.value);
    } finally {
        isLoading.value = false;
    }
});

const project = computed(() => projectsStore.getProjectById(projectId.value));
const sources = computed(() => sourcesStore.getSourcesByProjectId(projectId.value));
const mappingTables = computed(() => tablesStore.getMappingTablesByProjectId(projectId.value));
const rpiMappings = computed(() => rpiStore.getRPIMappingsByProjectId(projectId.value));

const tablesBySource = computed(() => {
    return mappingTables.value.reduce((acc, table) => {
        const sourceId = table.source_id;
        if (!acc[sourceId]) acc[sourceId] = [];
        acc[sourceId].push(table);
        return acc;
    }, {});
});

watch(sources, (list) => {
    expandedSources.value = list.map((s) => s.id);
}, { immediate: true });

const totalSources = computed(() => sources.value.length);
const totalTables = computed(() => mappingTables.value.length);

const lastUpdate = computed(() => {
    const dates = [
        project.value?.updated_at,
        ...sources.value.map((s) => s.last_updated),
        ...mappingTables.value.map((t) => t.updated_at || t.created_at),
    ].filter(Boolean);
    if (!dates.length) return '—';
    const timestamps = dates.map((d) => new Date(d).getTime()).filter((n) => !Number.isNaN(n));
    if (!timestamps.length) return '—';
    return formatDate(new Date(Math.max(...timestamps)).toISOString());
});

function toggleSource(sourceId) {
    expandedSources.value = expandedSources.value.includes(sourceId)
        ? expandedSources.value.filter((id) => id !== sourceId)
        : [...expandedSources.value, sourceId];
}

function isExpanded(sourceId) {
    return expandedSources.value.includes(sourceId);
}

function getSourceIcon(type) {
    const normalized = (type || '').toLowerCase();
    if (normalized.includes('db') || normalized.includes('sql') ||
        normalized.includes('database') || normalized.includes('postgres') ||
        normalized.includes('mysql')) return 'pi pi-server';
    if (normalized.includes('json') || normalized.includes('api')) return 'pi pi-file';
    if (normalized.includes('csv') || normalized.includes('excel') ||
        normalized.includes('xlsx')) return 'pi pi-table';
    return 'pi pi-database';
}

function openRpiMapping() {
    if (projectId.value === null) return;
    router.push({ name: 'RPIMapping', params: { id: projectId.value } });
}

function openLayerMapping() {
    if (projectId.value === null) return;
    router.push({ name: 'LayerMapping', params: { id: projectId.value } });
}

function openSource(sourceId) {
    if (projectId.value === null) return;
    router.push({ name: 'SourceDetail', params: { id: projectId.value, sourceId } });
}

// ← НОВАЯ функция
function openTable(sourceId, tableId) {
    if (projectId.value === null) return;
    router.push({
        name: 'TableDetail',
        params: { id: projectId.value, sourceId, tableId },
    });
}

async function handleCreateSource(data) {
    try {
        await sourcesStore.createSource(projectId.value, data);
        showSourceDialog.value = false;
    } catch (err) {
        console.error('Ошибка создания источника:', err);
    }
}

async function handleCreateTable(data) {
    try {
        await tablesStore.createMappingTable(projectId.value, data);
        showTableDialog.value = false;
    } catch (err) {
        console.error('Ошибка создания таблицы:', err);
    }
}

async function handleCreateRpi(data) {
    try {
        await rpiStore.createRPIMapping(projectId.value, data);
        showRpiDialog.value = false;
    } catch (err) {
        console.error('Ошибка создания РПИ:', err);
    }
}
</script>

<template>
    <div class="min-h-screen bg-app-bg">
        <main class="p-4 md:p-6 lg:p-8">
            <template v-if="isLoading">
                <div class="flex h-[60vh] items-center justify-center">
                    <i class="pi pi-spin pi-spinner text-3xl text-primary" />
                </div>
            </template>
            <template v-else>
                <!-- Error banner -->
                <div v-if="projectsStore.error"
                    class="mb-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <i class="pi pi-exclamation-triangle text-lg" />
                    <span>{{ projectsStore.error }}</span>
                </div>

                <!-- Breadcrumbs -->
                <div class="mb-4 flex items-center gap-2 text-sm">
                    <i class="pi pi-home text-primary" />
                    <RouterLink :to="{ name: 'ProjectsList' }" class="text-primary hover:underline">
                        Проекты
                    </RouterLink>
                    <span class="text-app-text-muted">›</span>
                    <span class="text-app-text-muted">{{ project?.name || 'Проект' }}</span>
                </div>

                <!-- Project header -->
                <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex items-start gap-4">
                        <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-primary-light">
                            <i class="pi pi-database text-2xl text-primary" />
                        </div>
                        <div>
                            <h1 class="text-2xl font-semibold text-app-text">
                                {{ project?.name || 'Загрузка проекта…' }}
                            </h1>
                            <p class="mt-1 text-sm text-app-text-muted">
                                {{ project?.description || 'Управление источниками и таблицами маппинга проекта' }}
                            </p>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <Button label="Layer Mapping" icon="pi pi-sitemap"
                            :pt="{ root: 'rounded-xl min-h-[44px]' }" @click="openLayerMapping" />
                        <Button label="Открыть таблицу РПИ" icon="pi pi-users"
                            :pt="{ root: 'rounded-xl min-h-[44px]' }" @click="openRpiMapping" />
                    </div>
                </div>

                <!-- Stats cards -->
                <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div class="rounded-2xl border border-app-border bg-app-surface p-5">
                        <div class="flex items-center gap-3">
                            <i class="pi pi-database text-2xl text-primary" />
                            <div>
                                <div class="text-3xl font-semibold text-app-text">{{ totalSources }}</div>
                                <div class="text-sm text-app-text-muted">Источников</div>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-2xl border border-app-border bg-app-surface p-5">
                        <div class="flex items-center gap-3">
                            <i class="pi pi-table text-2xl text-primary" />
                            <div>
                                <div class="text-3xl font-semibold text-app-text">{{ totalTables }}</div>
                                <div class="text-sm text-app-text-muted">Таблиц маппинга</div>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-2xl border border-app-border bg-app-surface p-5">
                        <div class="flex items-center gap-3">
                            <i class="pi pi-calendar text-2xl text-primary" />
                            <div>
                                <div class="text-lg font-semibold text-app-text">{{ lastUpdate }}</div>
                                <div class="text-sm text-app-text-muted">Последнее обновление</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sources section -->
                <section class="rounded-2xl border border-app-border bg-app-surface p-6">
                    <div class="mb-6 flex items-center justify-between gap-4">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-database text-primary" />
                            <h2 class="text-lg font-semibold text-app-text">Источники данных</h2>
                        </div>
                        <Button label="Источник" icon="pi pi-plus" :pt="{ root: 'rounded-xl min-h-[44px]' }"
                            @click="showSourceDialog = true" />
                    </div>

                    <div v-if="!sources.length" class="py-12 text-center text-app-text-muted">
                        Нет источников данных
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="source in sources" :key="source.id"
                            class="overflow-hidden rounded-2xl border border-app-border">

                            <!-- Source header -->
                            <div class="flex cursor-pointer items-center justify-between bg-app-surface-hover p-4 transition hover:bg-app-primary-light"
                                @click="toggleSource(source.id)">
                                <div class="flex items-center gap-3">
                                    <i :class="isExpanded(source.id) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                                        class="text-app-text-muted" />
                                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                                        <i :class="getSourceIcon(source.type)" class="text-primary" />
                                    </div>
                                    <div>
                                        <div class="font-medium text-app-text">{{ source.name }}</div>
                                        <div class="text-sm text-app-text-muted">
                                            {{ source.type || 'Источник' }} •
                                            {{ (tablesBySource[source.id] || []).length }}
                                            {{ (tablesBySource[source.id] || []).length === 1 ? 'таблица' : 'таблиц' }}
                                        </div>
                                    </div>
                                </div>
                                <Button label="Открыть" text :pt="{ root: 'rounded-lg min-h-[40px]' }"
                                    @click.stop="openSource(source.id)" />
                            </div>

                            <!-- Expanded tables -->
                            <div v-if="isExpanded(source.id)" class="bg-white">
                                <div v-if="!(tablesBySource[source.id] || []).length"
                                    class="px-6 py-5 text-sm text-app-text-muted">
                                    Для этого источника ещё нет таблиц маппинга
                                </div>

                                <div v-else class="overflow-x-auto">
                                    <table class="w-full">
                                        <thead class="border-t border-app-border bg-app-surface-hover">
                                            <tr>
                                                <th class="px-6 py-3 text-left text-sm font-medium text-app-text-muted">
                                                    Имя таблицы
                                                </th>
                                                <th class="px-6 py-3 text-left text-sm font-medium text-app-text-muted">
                                                    Описание
                                                </th>
                                                <th class="px-6 py-3 text-left text-sm font-medium text-app-text-muted">
                                                    Обновлена
                                                </th>
                                                <th class="px-6 py-3 w-[120px]" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="table in tablesBySource[source.id]" :key="table.id"
                                                class="border-t border-app-border hover:bg-app-surface-hover">
                                                <td class="px-6 py-4 text-app-text">{{ table.name }}</td>
                                                <td class="px-6 py-4 text-sm text-app-text-muted">
                                                    {{ table.description || '—' }}
                                                </td>
                                                <td class="px-6 py-4 text-sm text-app-text-muted">
                                                    {{ formatDate(table.updated_at || table.created_at) }}
                                                </td>
                                                <!-- ← КНОПКА ПЕРЕЙТИ -->
                                                <td class="px-6 py-3 text-right">
                                                    <button
                                                        class="inline-flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-app-primary-light"
                                                        @click.stop="openTable(source.id, table.id)"
                                                    >
                                                        Перейти
                                                        <i class="pi pi-arrow-right text-xs" />
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div class="border-t border-app-border bg-app-surface-hover p-4">
                                    <button class="flex items-center gap-2 text-sm text-primary hover:opacity-80"
                                        @click.stop="showTableDialog = true">
                                        <i class="pi pi-plus" />
                                        Добавить таблицу
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Dialogs -->
                <CreateSourceDialog v-model="showSourceDialog" :project-id="projectId" :sources="sources"
                    @create="handleCreateSource" />
                <CreateMappingTableDialog v-model="showTableDialog" :project-id="projectId" :sources="sources"
                    @create="handleCreateTable" />
                <CreateRPIMappingDialog v-model="showRpiDialog" :project-id="projectId" :rpi-mappings="rpiMappings"
                    :columns="mappingTables.flatMap((t) => t.columns || [])" @create="handleCreateRpi" />
            </template>
        </main>
    </div>
</template>