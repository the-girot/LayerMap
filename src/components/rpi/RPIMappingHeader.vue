<script setup>
import Button from 'primevue/button';

const props = defineProps({
    projectName: {
        type: String,
        required: true
    },
    totalCount: {
        type: Number,
        required: true
    },
    approvedCount: {
        type: Number,
        required: true
    },
    reviewCount: {
        type: Number,
        required: true
    },
    draftCount: {
        type: Number,
        required: true
    }
});

const emit = defineEmits(['back', 'add']);

function handleBack() {
    emit('back');
}

function handleAdd() {
    emit('add');
}
</script>

<template>
    <header
        class="sticky top-0 z-20 flex shrink-0 flex-col gap-3 border-b border-app-border bg-surface-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div class="flex items-center gap-3">
            <button @click="handleBack"
                class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition-colors hover:bg-app-surface-hover">
                <i class="pi pi-arrow-left text-sm text-app-text-muted" />
            </button>
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-primary-light text-primary">
                <i class="pi pi-sitemap text-sm" />
            </div>
            <div>
                <h1 class="text-sm font-semibold text-app-text">
                    РПИ: {{ projectName }}
                </h1>
                <p class="text-[11px] text-app-text-muted">
                    {{ totalCount }} записей · Маппинг измерений и метрик
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
                :pt="{ root: 'rounded-lg text-xs min-h-[44px]' }" @click="handleAdd" />
        </div>
    </header>
</template>
