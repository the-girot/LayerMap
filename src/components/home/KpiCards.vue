<script setup>
import { ref, onMounted } from 'vue';
import { useProjectsStore } from '@/stores/projects';

const store = useProjectsStore();

// Animated values
const projectsCount = ref(0);
const sourcesCount = ref(0);
const rpiCount = ref(0);
const lastUpdate = ref('');

// Count-up animation using requestAnimationFrame
function animateValue(targetRef, targetValue, duration = 700) {
    const start = performance.now();

    function step(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        targetRef.value = Math.round(eased * targetValue);
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

onMounted(() => {
    animateValue(projectsCount, store.projects.length);
    animateValue(sourcesCount, store.totalSources);
    animateValue(rpiCount, store.totalRpi);
    lastUpdate.value = store.lastUpdateDate;
});

const kpiItems = [
    { icon: 'pi pi-folder-open', label: 'Проекты', value: projectsCount },
    { icon: 'pi pi-database', label: 'Таблиц-источников', value: sourcesCount },
    { icon: 'pi pi-list', label: 'Записей РПИ', value: rpiCount },
    { icon: 'pi pi-calendar', label: 'Последнее обновление', value: lastUpdate, isDate: true },
];
</script>

<template>
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div v-for="item in kpiItems" :key="item.label"
            class="flex items-center gap-3 rounded-lg border border-app-border bg-surface-card p-3 md:p-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-highlight">
                <i :class="[item.icon, 'text-lg text-primary']" />
            </div>
            <div class="flex min-w-0 flex-col">
                <span class="text-lg font-semibold text-app-text md:text-xl">
                    {{ item.value }}
                </span>
                <span class="mt-0.5 text-xs text-app-text-muted">{{ item.label }}</span>
            </div>
        </div>
    </div>
</template>
