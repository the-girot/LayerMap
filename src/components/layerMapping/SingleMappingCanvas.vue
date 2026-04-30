<script setup>
/**
 * SingleMappingCanvas — показывает две ER-таблицы и одну связь выбранного маппинга.
 * Позволяет пользователю сфокусироваться на одном преобразовании.
 */
import { computed } from "vue";
import { VueFlow } from "@vue-flow/core";
import ERTableNode from "./ERTableNode.vue";

const props = defineProps({
  /** { nodes, edges } из singleMappingToFlowData */
  flowData: {
    type: Object,
    default: () => ({ nodes: [], edges: [] }),
  },
  /** Загрузка */
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["edge-click", "node-click", "viewport-change"]);

const nodeTypes = {
  erTable: ERTableNode,
};

const hasData = computed(
  () => props.flowData.nodes?.length > 0 && !props.loading,
);
</script>

<template>
  <div
    class="relative h-full min-h-[400px] w-full overflow-hidden rounded-2xl border border-app-border bg-app-surface"
  >
    <!-- Empty state -->
    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white/60"
    >
      <i class="pi pi-spin pi-spinner text-3xl text-primary" />
    </div>

    <div
      v-else-if="!hasData"
      class="flex h-full flex-col items-center justify-center gap-3 text-app-text-muted"
    >
      <i class="pi pi-sitemap text-5xl opacity-30" />
      <div class="text-sm">Выберите маппинг для просмотра</div>
    </div>

    <VueFlow
      v-else
      :nodes="flowData.nodes"
      :edges="flowData.edges"
      :node-types="nodeTypes"
      :fit-view-on-init="true"
      :min-zoom="0.1"
      :max-zoom="4"
      :default-viewport="{ zoom: 1 }"
      class="h-full w-full"
      @edge-click="(e) => emit('edge-click', e)"
      @node-click="(e) => emit('node-click', e)"
      @viewport-change="(v) => emit('viewport-change', v)"
    >
      <!-- Controls overlay -->
      <template #default>
        <div class="absolute bottom-4 right-4 z-10 flex gap-1">
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow hover:bg-gray-50"
            title="Fit view"
            @click="(e) => {
              const flow = e.target.closest('.vue-flow')?.__vueFlow__;
              flow?.fitView({ padding: 0.2 });
            }"
          >
            <i class="pi pi-expand text-xs" />
          </button>
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.vue-flow__node {
  cursor: pointer;
}
</style>
