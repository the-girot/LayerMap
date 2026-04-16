<script setup>
/**
 * ProjectDetailView - страница детального просмотра проекта.
 *
 * Страница доступна без блокировок — РПИ и источники данных
 * являются независимыми страницами.
 */
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectsStore } from "@/stores/projects";
import { useWorkflowStore } from "@/stores/workflow";
import { formatDate, formatNumber } from "@/utils/format";
import { getSourceTypeSeverity } from "@/utils/status";
import Card from "primevue/card";
import Badge from "primevue/badge";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();
const workflowStore = useWorkflowStore();

const projectId = computed(() => route.params.id);
const project = computed(() => projectsStore.getProjectById(projectId.value));
const sources = computed(() =>
    projectsStore.getSourcesByProjectId(projectId.value)
);

// Получаем ID сохранённой РПИ для отображения статуса
const rpiEntityId = computed(() => {
    if (!projectId.value) return null;
    return workflowStore.getRPIEntityId(Number(projectId.value));
});

function navigateToMapping() {
    router.push({
        name: "RPIMapping",
        params: { id: projectId.value },
    });
}

function navigateToSource(sourceId) {
    router.push({
        name: "SourceDetail",
        params: { id: projectId.value, sourceId },
    });
}

function goBack() {
    router.push({ name: "ProjectsList" });
}
</script>

<template>
    <div v-if="project" class="p-4 md:p-6">
        <!-- Breadcrumbs -->
        <nav class="mb-6 flex items-center gap-2 text-sm">
            <router-link :to="{ name: 'ProjectsList' }"
                class="flex items-center gap-1 text-primary transition-colors hover:text-primary-hover">
                <i class="pi pi-home text-xs"></i>
                <span>Проекты</span>
            </router-link>
            <i class="pi pi-chevron-right text-[10px] text-content-faint"></i>
            <span class="font-medium text-content-secondary">{{ project.name }}</span>
        </nav>

        <!-- Project header -->
        <header
            class="mb-6 flex flex-col gap-4 border-b border-app-border pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-3">
                <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-app-primary-light text-primary">
                    <i class="pi pi-database text-xl"></i>
                </div>
                <div class="flex flex-col">
                    <h1 class="text-xl font-bold text-content">{{ project.name }}</h1>
                    <p class="mt-1 text-sm text-content-muted">{{ project.description }}</p>
                    <!-- Индикатор сохранённой РПИ -->
                    <div v-if="rpiEntityId" class="mt-1 flex items-center gap-1.5">
                        <i class="pi pi-check-circle text-xs text-app-success" />
                        <span class="text-xs text-app-success">РПИ сохранена (ID: {{ rpiEntityId }})</span>
                    </div>
                    <div v-else class="mt-1 flex items-center gap-1.5">
                        <i class="pi pi-info-circle text-xs text-app-text-muted" />
                        <span class="text-xs text-app-text-muted">РПИ ещё не настроена</span>
                    </div>
                </div>
            </div>
            <div class="flex gap-2">
                <Button label="Источники данных" icon="pi pi-table" size="small" outlined
                    :pt="{ root: 'rounded-lg min-h-[44px]' }" @click="navigateToSource(sources[0]?.id)" />
                <Button label="Маппинг РПИ" icon="pi pi-sitemap" size="small" :pt="{ root: 'rounded-lg min-h-[44px]' }"
                    @click="navigateToMapping" />
            </div>
        </header>

        <!-- Project stats -->
        <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div class="flex items-center gap-3 rounded-lg border border-app-border bg-surface-card p-4">
                <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-app-primary-light text-primary">
                    <i class="pi pi-table"></i>
                </div>
                <div class="flex flex-col">
                    <span class="text-xl font-bold text-content">{{ sources.length }}</span>
                    <span class="text-xs text-content-muted">Источников</span>
                </div>
            </div>
            <div class="flex items-center gap-3 rounded-lg border border-app-border bg-surface-card p-4">
                <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-app-info-bg text-app-info">
                    <i class="pi pi-list"></i>
                </div>
                <div class="flex flex-col">
                    <span class="text-xl font-bold text-content">
                        {{ projectsStore.getRPIMappingsByProjectId(projectId).length }}
                    </span>
                    <span class="text-xs text-content-muted">Записей РПИ</span>
                </div>
            </div>
            <div
                class="flex items-center gap-3 rounded-lg border border-app-border bg-surface-card p-4 sm:col-span-2 lg:col-span-1">
                <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-app-success-bg text-app-success">
                    <i class="pi pi-calendar"></i>
                </div>
                <div class="flex flex-col">
                    <span class="text-lg font-bold text-content">{{ formatDate(project.updatedAt) }}</span>
                    <span class="text-xs text-content-muted">Последнее обновление</span>
                </div>
            </div>
        </div>

        <!-- Sources section -->
        <section class="mb-6">
            <div class="mb-4 flex items-center gap-2">
                <h2 class="flex items-center gap-2 text-base font-semibold text-content">
                    <i class="pi pi-database text-primary"></i>
                    Таблицы-источники
                </h2>
            </div>

            <div class="overflow-hidden rounded-lg border border-app-border">
                <DataTable :value="sources" class="w-full" responsiveLayout="scroll" :paginator="sources.length > 10"
                    :rows="10" :rowsPerPageOptions="[5, 10, 20]"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    emptyMessage="Нет таблиц-источников">
                    <Column field="name" header="Имя таблицы" style="min-width: 180px">
                        <template #body="{ data }">
                            <div class="flex items-center gap-3">
                                <div
                                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-surface-hover text-content-muted">
                                    <i class="pi pi-table text-xs"></i>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-semibold text-content">{{ data.name }}</span>
                                    <span class="text-xs text-content-muted">{{ data.description }}</span>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column field="type" header="Тип" style="min-width: 120px">
                        <template #body="{ data }">
                            <Badge :value="data.type" :severity="getSourceTypeSeverity(data.type)" />
                        </template>
                    </Column>

                    <Column field="rowCount" header="Строк" style="min-width: 120px">
                        <template #body="{ data }">
                            <span class="font-mono text-sm text-content-secondary">{{ formatNumber(data.rowCount)
                            }}</span>
                        </template>
                    </Column>

                    <Column field="lastUpdated" header="Обновлён" style="min-width: 130px">
                        <template #body="{ data }">
                            <span class="text-sm text-content-muted">{{ formatDate(data.lastUpdated) }}</span>
                        </template>
                    </Column>

                    <Column style="width: 100px">
                        <template #body="{ data }">
                            <Button label="Открыть" icon="pi pi-arrow-right" iconPos="right" size="small" text
                                :pt="{ root: '!rounded-lg min-h-[44px]' }" @click="navigateToSource(data.id)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </section>

        <!-- Quick actions -->
        <section>
            <div class="mb-4 flex items-center gap-2">
                <h2 class="flex items-center gap-2 text-base font-semibold text-content">
                    <i class="pi pi-bolt text-primary"></i>
                    Быстрые действия
                </h2>
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card
                    class="cursor-pointer border border-app-border transition-all hover:border-primary hover:shadow-card"
                    :pt="{ body: '!p-4', content: '!p-0' }" @click="navigateToMapping">
                    <template #content>
                        <div class="flex items-center gap-4">
                            <div
                                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-app-primary-light text-primary">
                                <i class="pi pi-sitemap"></i>
                            </div>
                            <div>
                                <h3 class="text-sm font-semibold text-content">Маппинг РПИ</h3>
                                <p class="mt-0.5 text-xs text-content-muted">
                                    Открыть таблицу маппинга РПИ для этого проекта
                                </p>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </section>
    </div>

    <!-- Project not found -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-center">
        <i class="pi pi-exclamation-circle text-5xl text-content-faint"></i>
        <h2 class="mt-4 text-xl font-semibold text-content">Проект не найден</h2>
        <Button label="К списку проектов" icon="pi pi-arrow-left" class="mt-4 !rounded-lg"
            :pt="{ root: 'min-h-[44px]' }" @click="goBack" />
    </div>
</template>
