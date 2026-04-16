<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const quickActions = [
    {
        icon: 'pi pi-plus',
        title: 'Создать проект',
        description: 'Создать новый аналитический проект',
        action: () => router.push({ name: 'ProjectsList' }),
    },
    {
        icon: 'pi pi-list',
        title: 'Открыть РПИ',
        description: 'Перейти к реестру показателей и измерений',
        action: () => router.push({ name: 'RPIMapping', params: { id: '1' } }),
    },
    {
        icon: 'pi pi-arrow-right-arrow-left',
        title: 'Перейти к маппингу',
        description: 'Открыть таблицу маппинга РПИ и источников',
        action: () => router.push({ name: 'RPIMapping', params: { id: '1' } }),
    },
    {
        icon: 'pi pi-table',
        title: 'Добавить источник',
        description: 'Подключить новую таблицу-источник к проекту',
        action: () => router.push({ name: 'ProjectsList' }),
    },
];
</script>

<template>
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div v-for="action in quickActions" :key="action.title"
            class="cursor-pointer rounded-lg border border-app-border bg-surface-card p-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card md:p-4"
            @click="action.action">
            <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-highlight">
                <i :class="[action.icon, 'text-primary']" />
            </div>
            <p class="text-sm font-medium text-content">{{ action.title }}</p>
            <p class="mt-1 text-xs text-content-muted">{{ action.description }}</p>
        </div>
    </div>
</template>
