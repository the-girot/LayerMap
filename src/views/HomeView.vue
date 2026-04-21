<script setup>
import { onMounted } from 'vue';
import { useProjectsStore } from '@/stores/projects';
import KpiCards from '@/components/home/KpiCards.vue';
import ProjectsTable from '@/components/home/ProjectsTable.vue';
import QuickActions from '@/components/home/QuickActions.vue';
import Button from 'primevue/button';

const projectsStore = useProjectsStore();

// Загрузка проектов при монтировании компонента
onMounted(async () => {
    await projectsStore.loadProjects();
});
</script>

<template>
    <div class="p-4 md:p-6 lg:p-8">
        <!-- Page header -->
        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-xl font-semibold text-content">Проекты</h1>
                <p class="mt-1 text-sm text-content-muted">
                    Управление проектами, источниками и реестром показателей
                </p>
            </div>
            <Button label="Создать проект" icon="pi pi-plus" :pt="{
                root: 'bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors min-h-[44px]',
                icon: 'mr-2',
            }" />
        </div>

        <!-- KPI Cards -->
        <section class="mb-6">
            <KpiCards />
        </section>

        <!-- Projects Table -->
        <section class="mb-6">
            <ProjectsTable />
        </section>

        <!-- Quick Actions -->
        <section>
            <QuickActions />
        </section>
    </div>
</template>
