<script setup>
import { ref, onMounted } from 'vue';
import { getProjectKpi } from '@/api/projects';

// KPI values from backend
const kpi = ref({ total: 0, active: 0, draft: 0, archived: 0 });

// Animated values
const totalProjects = ref(0);
const activeProjects = ref(0);
const draftProjects = ref(0);
const archivedProjects = ref(0);

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

onMounted(async () => {
    try {
        const data = await getProjectKpi();
        kpi.value = data;
        animateValue(totalProjects, data.total);
        animateValue(activeProjects, data.active);
        animateValue(draftProjects, data.draft);
        animateValue(archivedProjects, data.archived);
    } catch (err) {
        console.error('Failed to load KPI:', err);
    }
});

const kpiItems = [
    { icon: 'pi pi-folder-open', label: 'Всего проектов', value: totalProjects },
    { icon: 'pi pi-check-circle', label: 'Активные', value: activeProjects },
    { icon: 'pi pi-file', label: 'Черновики', value: draftProjects },
    { icon: 'pi pi-archive', label: 'Архив', value: archivedProjects },
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
