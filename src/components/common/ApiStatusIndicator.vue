<template>
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm" :class="statusClass">
        <!-- Индикатор статуса -->
        <span class="w-2 h-2 rounded-full" :class="indicatorClass"></span>

        <!-- Текст статуса -->
        <span class="font-medium">{{ statusText }}</span>

        <!-- Кнопка обновления -->
        <button v-if="!loading && !available" @click="handleRefresh"
            class="ml-1 p-0.5 hover:opacity-80 transition-opacity" :title="'Обновить статус'">
            <i class="pi pi-refresh"></i>
        </button>
    </div>
</template>

<script setup>
import { useApiStatus } from "@/composables/useApiStatus";
import { ref, computed } from 'vue';
const { status, loading, available, error, refresh } = useApiStatus();

const statusClass = computed(() => ({
    "bg-green-100 text-green-800 border border-green-200":
        !loading.value && available.value,
    "bg-yellow-100 text-yellow-800 border border-yellow-200":
        loading.value,
    "bg-red-100 text-red-800 border border-red-200":
        !loading.value && !available.value,
}));

const indicatorClass = computed(() => ({
    "bg-green-500": !loading.value && available.value,
    "bg-yellow-500 animate-pulse": loading.value,
    "bg-red-500": !loading.value && !available.value,
}));

const statusText = computed(() => {
    if (loading.value) return "Проверка подключения...";
    if (available.value) return "API подключен";
    if (error.value) return `Ошибка: ${error.value}`;
    return "Не подключен";
});

const handleRefresh = async () => {
    await refresh();
};
</script>

<style scoped>
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}
</style>
