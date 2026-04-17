<script setup>
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { RPI_STATUS_OPTIONS, RPI_OWNERSHIP_OPTIONS } from '@/constants/rpi';

const props = defineProps({
    search: {
        type: String,
        default: ''
    },
    selectedStatus: {
        type: [String, null],
        default: null
    },
    selectedOwnership: {
        type: [String, null],
        default: null
    },
    selectedMeasurementType: {
        type: [String, null],
        default: null
    },
    selectedCalculatedType: {
        type: [String, null],
        default: null
    },
    quickFilters: {
        type: Array,
        required: true
    },
    filteredCount: {
        type: Number,
        required: true
    },
    totalRows: {
        type: Number,
        required: true
    }
});

const emit = defineEmits([
    'update:search',
    'update:selectedStatus',
    'update:selectedOwnership',
    'update:selectedMeasurementType',
    'update:selectedCalculatedType',
    'reset'
]);

function handleReset() {
    emit('reset');
}
</script>

<template>
    <div
        class="sticky top-[53px] z-10 flex shrink-0 flex-wrap items-center gap-2 border-b border-app-border bg-surface-card px-4 py-2 md:px-6">
        <!-- Search -->
        <div class="relative w-full sm:w-56">
            <i class="pi pi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-app-text-muted" />
            <InputText :model-value="search" @update:model-value="$emit('update:search', $event)"
                placeholder="Поиск полей, кодов..." :pt="{ root: 'w-full rounded-lg text-xs pl-7' }" size="small" />
        </div>

        <!-- Status -->
        <Select :model-value="selectedStatus" @update:model-value="$emit('update:selectedStatus', $event)"
            :options="RPI_STATUS_OPTIONS" optionLabel="label" optionValue="value" placeholder="Статус"
            :pt="{ root: 'rounded-lg text-xs w-full sm:w-36' }" size="small" />

        <!-- Ownership -->
        <Select :model-value="selectedOwnership" @update:model-value="$emit('update:selectedOwnership', $event)"
            :options="RPI_OWNERSHIP_OPTIONS" optionLabel="label" optionValue="value" placeholder="Принадлежность"
            :pt="{ root: 'rounded-lg text-xs w-full sm:w-36' }" size="small" />

        <div class="hidden h-4 w-px bg-app-border sm:block" />

        <!-- Quick filter chips -->
        <div class="flex flex-wrap items-center gap-1">
            <button v-for="qf in quickFilters" :key="qf.value ?? 'all'"
                @click="$emit('update:selectedMeasurementType', qf.value)" :class="[
                    'rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all min-h-[44px] flex items-center',
                    selectedMeasurementType === qf.value
                        ? 'bg-primary text-white shadow-card'
                        : 'text-app-text-muted hover:bg-app-surface-hover',
                ]">
                {{ qf.label }}
                <span :class="[
                    'ml-0.5 text-[10px]',
                    selectedMeasurementType === qf.value ? 'text-primary-highlight' : 'text-content-faint',
                ]">{{ qf.count }}</span>
            </button>
        </div>

        <!-- Базовый / Расчетный фильтры -->
        <div class="flex items-center gap-1">
            <div class="h-4 w-px bg-app-border" />
            <button @click="$emit('update:selectedCalculatedType', selectedCalculatedType === 'basic' ? null : 'basic')"
                :class="[
                    'rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all min-h-[44px] flex items-center',
                    selectedCalculatedType === 'basic'
                        ? 'border-purple-300 bg-purple-50 text-purple-700 border'
                        : 'text-app-text-muted hover:bg-app-surface-hover',
                ]">
                Базовые
                <span class="ml-0.5 text-[10px]">{{ totalRows - filteredCount }}</span>
            </button>
            <button
                @click="$emit('update:selectedCalculatedType', selectedCalculatedType === 'calculated' ? null : 'calculated')"
                :class="[
                    'rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all min-h-[44px] flex items-center',
                    selectedCalculatedType === 'calculated'
                        ? 'border-orange-300 bg-orange-50 text-orange-700 border'
                        : 'text-app-text-muted hover:bg-app-surface-hover',
                ]">
                Расчетные
                <span class="ml-0.5 text-[10px]">{{ filteredCount }}</span>
            </button>
        </div>

        <!-- Right: count + clear -->
        <div class="ml-auto flex items-center gap-2">
            <span class="text-[11px] tabular-nums text-app-text-muted">
                <span class="font-medium text-app-text-secondary">{{ filteredCount }}</span>
                результатов
            </span>
            <Transition name="fade">
                <button
                    v-if="search || selectedStatus || selectedOwnership || selectedMeasurementType || selectedCalculatedType"
                    @click="handleReset"
                    class="flex min-h-[44px] items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors hover:bg-app-surface-hover text-app-text-muted">
                    <i class="pi pi-times text-[9px]" /> Сбросить
                </button>
            </Transition>
        </div>
    </div>
</template>
