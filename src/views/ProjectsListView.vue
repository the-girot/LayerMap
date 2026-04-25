<script setup>
/**
 * ProjectsListView — список проектов в виде карточек.
 */
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useProjectsStore } from "@/stores/projects";
import { formatDate } from "@/utils/format";
import { getProjectStatusSeverity, getProjectStatusLabel } from "@/utils/status";
import Card from "primevue/card";
import Badge from "primevue/badge";
import Button from "primevue/button";
import CreateProjectDialog from "@/components/common/CreateProjectDialog.vue";

const router = useRouter();
const projectsStore = useProjectsStore();
const showCreateProjectDialog = ref(false);

const projects = computed(() => projectsStore.projects);

// Загрузка проектов при монтировании компонента
onMounted(async () => {
    await projectsStore.loadProjects();
});

function navigateToProject(project) {
    router.push({ name: "ProjectDetail", params: { id: project.id } });
}

function navigateToRPIMapping(project) {
    router.push({ name: "RPIMapping", params: { id: project.id } });
}

function getPluralForm(n) {
    if (n === 1) return "проект";
    if (n < 5) return "проекта";
    return "проектов";
}

async function handleCreateProject(data) {
    await projectsStore.createProject(data);
    showCreateProjectDialog.value = false;
}
</script>

<template>
    <div class="p-4 md:p-6">
        <!-- Page header -->
        <header class="mb-6 flex flex-row items-center justify-between gap-4 border-b border-app-border pb-4">
            <div class="flex items-center gap-3">
                <i class="pi pi-folder text-xl text-primary"></i>
                <div>
                    <h1 class="text-xl font-bold text-app-text">Проекты маппинга</h1>
                    <p class="mt-0.5 text-sm text-app-text-muted">
                        {{ projects.length }} {{ getPluralForm(projects.length) }}
                    </p>
                </div>
            </div>
            <div>
                <Button label="Новый проект" icon="pi pi-plus" size="small" :pt="{ root: 'rounded-lg min-h-[30px]' }"
                    @click="showCreateProjectDialog = true" />
            </div>
        </header>

        <!-- Projects grid -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card v-for="project in projects" :key="project.id"
                class="cursor-pointer border border-app-border transition-all hover:border-primary hover:shadow-hover hover:-translate-y-0.5"
                :pt="{ body: '!p-4', content: '!p-0' }" @click="navigateToProject(project)">
                <template #content>
                    <div class="flex flex-col gap-4">
                        <!-- Project header -->
                        <div class="flex items-start gap-3">
                            <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-app-primary-light">
                                <i class="pi pi-database text-primary"></i>
                            </div>
                            <div class="flex min-w-0 flex-1 flex-col">
                                <h3 class="truncate text-base font-semibold text-app-text">{{ project.name }}</h3>
                                <Badge :value="getProjectStatusLabel(project.status)"
                                    :severity="getProjectStatusSeverity(project.status)"
                                    :pt="{ root: 'mt-1 w-fit text-xs' }" />
                            </div>
                        </div>

                        <!-- Description -->
                        <p class="text-sm leading-relaxed text-app-text-muted">{{ project.description }}</p>

                        <!-- Meta info -->
                        <div class="flex flex-col gap-2 rounded-lg bg-app-surface-hover p-3">
                            <div class="flex items-center gap-2 text-sm text-app-text-muted">
                                <i class="pi pi-calendar text-xs text-content-faint"></i>
                                <span>Создан: {{ formatDate(project.createdAt) }}</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm text-app-text-muted">
                                <i class="pi pi-clock text-xs text-content-faint"></i>
                                <span>Обновлён: {{ formatDate(project.updatedAt) }}</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm text-app-text-muted">
                                <i class="pi pi-table text-xs text-content-faint"></i>
                                <span>
                                    Источников:
                                    {{ projectsStore.getSourcesByProjectId(project.id).length }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2 text-sm text-app-text-muted">
                                <i class="pi pi-list text-xs text-content-faint"></i>
                                <span>
                                    РПИ записей:
                                    {{ projectsStore.getRPIMappingsByProjectId(project.id).length }}
                                </span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2 border-t border-app-border pt-3">
                            <Button label="Открыть" icon="pi pi-arrow-right" iconPos="right" size="small" text
                                :pt="{ root: '!rounded-lg min-h-[44px]' }" @click.stop="navigateToProject(project)" />
                            <Button label="Маппинг РПИ" icon="pi pi-sitemap" size="small" outlined
                                :pt="{ root: '!rounded-lg min-h-[44px]' }"
                                @click.stop="navigateToRPIMapping(project)" />
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Empty state -->
        <div v-if="projects.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <i class="pi pi-folder-open text-5xl text-content-faint"></i>
            <h3 class="mt-4 text-xl font-semibold text-app-text">Нет проектов</h3>
            <p class="mt-2 text-sm text-app-text-muted">
                Создайте первый проект для начала маппинга РПИ
            </p>
            <Button label="Создать проект" icon="pi pi-plus" class="mt-4 !rounded-lg" :pt="{ root: 'min-h-[44px]' }"
                @click="showCreateProjectDialog = true" />
        </div>

        <!-- Create Project Dialog -->
        <CreateProjectDialog v-model="showCreateProjectDialog" @create="handleCreateProject" />
    </div>
</template>
