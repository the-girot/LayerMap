<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { useProjectsStore } from '@/stores/projects';

const router = useRouter();
const store = useProjectsStore();

// Breakpoint: show cards on mobile, table on md+
const isMobile = ref(window.innerWidth < 768);

window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768;
});

function handleRowClick({ data }) {
    router.push({ name: 'ProjectDetail', params: { id: data.id } });
}
</script>

<template>
    <!-- Mobile: card view -->
    <div v-if="isMobile" class="grid grid-cols-1 gap-3">
        <Card v-for="project in store.projects" :key="project.id"
            class="cursor-pointer border border-app-border transition-shadow hover:shadow-card" :pt="{
                body: '!p-4',
                content: '!p-0',
            }" @click="handleRowClick({ data: project })">
            <template #content>
                <div class="flex flex-col gap-3">
                    <div>
                        <span class="text-sm font-semibold text-content">{{ project.name }}</span>
                        <p class="mt-0.5 text-xs text-content-muted">{{ project.description }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <Tag v-if="project.approved > 0" :value="`Утв. ${project.approved}`" severity="success"
                            :pt="{ root: '!bg-[#cedcd8] !text-[#01696f] !text-xs' }" />
                        <Tag v-if="project.drafts > 0" :value="`Чернов. ${project.drafts}`" severity="secondary"
                            :pt="{ root: '!text-xs' }" />
                        <Tag v-if="project.inReview > 0" :value="`На проверке ${project.inReview}`" severity="warn"
                            :pt="{ root: '!text-xs' }" />
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-content-muted">Обновлён: {{ project.updated_at }}</span>
                        <Button label="Открыть" icon="pi pi-arrow-right" iconPos="right" text :pt="{
                            root: '!text-primary hover:!bg-primary-highlight/30 min-h-[44px]',
                            label: '!text-sm',
                        }" @click.stop="handleRowClick({ data: project })" />
                    </div>
                </div>
            </template>
        </Card>
    </div>

    <!-- Desktop: DataTable -->
    <div v-else class="w-full overflow-x-auto">
        <DataTable :value="store.projects" stripedRows :paginator="false" @row-click="handleRowClick" class="w-full"
            table-class="text-sm">
            <Column header="Имя проекта" class="min-w-[200px]">
                <template #body="{ data }">
                    <div class="flex flex-col">
                        <span class="font-semibold text-content">{{ data.name }}</span>
                        <span class="mt-0.5 text-xs text-content-muted">{{ data.description }}</span>
                    </div>
                </template>
            </Column>

            <Column header="Источников" class="text-center">
                <template #body="{ data }">
                    <span class="text-center block">{{ data.sources }}</span>
                </template>
            </Column>

            <Column header="Записей РПИ" class="text-center">
                <template #body="{ data }">
                    <span class="text-center block">{{ data.rpiRecords }}</span>
                </template>
            </Column>

            <Column header="Статусы">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <Tag v-if="data.approved > 0" :value="`Утв. ${data.approved}`" severity="success"
                            class="!bg-[#cedcd8] !text-[#01696f]" />
                        <Tag v-if="data.drafts > 0" :value="`Чернов. ${data.drafts}`" severity="secondary" />
                        <Tag v-if="data.inReview > 0" :value="`На проверке ${data.inReview}`" severity="warn" />
                    </div>
                </template>
            </Column>

            <Column header="Обновлён">
                <template #body="{ data }">
                    <span class="text-content-muted text-sm">{{ data.updated_at }}</span>
                </template>
            </Column>

            <Column header="Действие">
                <template #body="{ data }">
                    <Button label="Открыть" icon="pi pi-arrow-right" iconPos="right" text
                        @click.stop="handleRowClick({ data })" class="!text-primary hover:!text-primary-hover" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
