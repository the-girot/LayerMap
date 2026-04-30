<script setup>
/**
 * FullLineageCanvas — граф lineage по слоям STG → ODS → DDS → DM.
 * Фиксированная колонковая раскладка с zoom, fitView, minimap, controls.
 */
import { computed, ref } from "vue";
import { VueFlow } from "@vue-flow/core";
import { Controls, ControlButton } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { Background, BackgroundVariant } from "@vue-flow/background";
import ERTableNode from "./ERTableNode.vue";

const props = defineProps({
  /** { nodes, edges } из lineageToFlowData */
  flowData: {
    type: Object,
    default: () => ({ nodes: [], edges: [] }),
  },
  /** Загрузка */
  loading: { type: Boolean, default: false },
  /** Показать мини-карту */
  showMinimap: { type: Boolean, default: false },
  /** Уровень зума */
  zoomLevel: { type: Number, default: 1 },
});

const emit = defineEmits([
  "edge-click",
  "node-click",
  "viewport-change",
  "zoom-in",
  "zoom-out",
  "fit-view",
  "toggle-minimap",
]);

const nodeTypes = {
  erTable: ERTableNode,
};

const hasData = computed(
  () => props.flowData.nodes?.length > 0 && !props.loading,
);

const flowRef = ref(null);

function onFitView() {
  emit("fit-view");
}
</script>

<template>
  <div
    class="relative h-full min-h-[500px] w-full overflow-hidden rounded-2xl border border-app-border bg-app-surface"
  >
    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 z-20 flex items-center justify-center bg-white/60"
    >
      <i class="pi pi-spin pi-spinner text-3xl text-primary" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!hasData"
      class="flex h-full flex-col items-center justify-center gap-3 text-app-text-muted"
    >
      <i class="pi pi-sitemap text-5xl opacity-30" />
      <div class="text-sm">Нет данных lineage для проекта</div>
      <div class="text-xs opacity-60">Создайте маппинги между таблицами слоёв</div>
    </div>

    <!-- Vue Flow canvas -->
    <VueFlow
      v-else
      ref="flowRef"
      :nodes="flowData.nodes"
      :edges="flowData.edges"
      :node-types="nodeTypes"
      :fit-view-on-init="true"
      :min-zoom="0.1"
      :max-zoom="4"
      :default-viewport="{ zoom: 0.8 }"
      class="h-full w-full"
      @edge-click="(e) => emit('edge-click', e)"
      @node-click="(e) => emit('node-click', e)"
      @viewport-change="(v) => emit('viewport-change', v)"
    >
      <Background :variant="BackgroundVariant.Dots" :gap="20" :size="1" />

      <Controls position="top-right" show-interactive="false">
        <ControlButton
          title="Fit View"
          @click="onFitView"
        >
          <i class="pi pi-expand text-xs" />
        </ControlButton>
        <ControlButton
          :title="showMinimap ? 'Hide Minimap' : 'Show Minimap'"
          @click="$emit('toggle-minimap')"
        >
          <i class="pi pi-map text-xs" />
        </ControlButton>
      </Controls>

      <MiniMap
        v-if="showMinimap"
        :node-color="(n) => {
          const colors = { stg: '#DBEAFE', ods: '#DCFCE7', dds: '#F3E8FF', dm: '#FEF3C7' };
          return colors[n.data?.layer] || '#e5e7eb';
        }"
        :mask-color="'rgba(99, 102, 241, 0.1)'"
        :style="{ width: 180, height: 120 }"
        position="bottom-left"
      />

      <!-- Layer legend overlay -->
      <div class="absolute left-4 top-4 z-10 flex flex-col gap-1 rounded-xl bg-white/95 p-3 shadow-sm">
        <div class="mb-1 text-xs font-semibold text-app-text-muted">Слои</div>
        <div v-for="item in [
          { label: 'STG', color: '#DBEAFE', text: '#1E40AF' },
          { label: 'ODS', color: '#DCFCE7', text: '#166534' },
          { label: 'DDS', color: '#F3E8FF', text: '#6B21A8' },
          { label: 'DM', color: '#FEF3C7', text: '#92400E' },
        ]" :key="item.label" class="flex items-center gap-2 text-xs">
          <span
            class="inline-block h-3 w-3 rounded-sm"
            :style="{ backgroundColor: item.color }"
          />
          <span :style="{ color: item.text }">{{ item.label }}</span>
        </div>
      </div>
    </VueFlow>
  </div>
</template>

<style scoped>
.vue-flow__node {
  cursor: pointer;
}
</style>
