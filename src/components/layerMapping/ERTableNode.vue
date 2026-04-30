<script setup>
/**
 * ERTableNode — кастомная нода Vue Flow для отображения DWH-таблицы.
 * Показывает название слоя, имя таблицы и список колонок.
 */
import { computed } from "vue";
import { Handle, Position } from "@vue-flow/core";
import { LAYER_COLORS, LAYER_LABELS } from "@/utils/layerMapping";

const props = defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    default: () => ({
      label: "",
      layer: "stg",
      columns: [],
      description: "",
    }),
  },
  selected: { type: Boolean, default: false },
});

const layerStyle = computed(() => {
  const colors = LAYER_COLORS[props.data.layer] || LAYER_COLORS.stg;
  return {
    borderColor: colors.hex,
    backgroundColor: colors.bg,
    ...(props.selected ? { ring: "2px solid #6366f1" } : {}),
  };
});

const layerLabel = computed(
  () => LAYER_LABELS[props.data.layer] || props.data.layer,
);
</script>

<template>
  <div
    class="min-w-[200px] max-w-[280px] overflow-hidden rounded-xl border-2 bg-white shadow-md transition-shadow hover:shadow-lg"
    :style="layerStyle"
  >
    <!-- Header: layer badge + table name -->
    <div
      class="flex items-center justify-between border-b px-3 py-2"
      :class="[layerStyle.backgroundColor, layerStyle.borderColor]"
    >
      <span class="text-xs font-semibold uppercase tracking-wider" :class="layerStyle.borderColor">
        {{ layerLabel }}
      </span>
      <span class="text-xs font-medium text-app-text-muted">{{ data.columns?.length || 0 }} кол.</span>
    </div>

    <!-- Table name -->
    <div class="border-b bg-white px-3 py-2">
      <div class="text-sm font-semibold text-app-text">
        {{ data.label }}
      </div>
      <div
        v-if="data.description"
        class="mt-0.5 truncate text-xs text-app-text-muted"
        :title="data.description"
      >
        {{ data.description }}
      </div>
    </div>

    <!-- Columns list -->
    <div v-if="data.columns?.length" class="max-h-[200px] overflow-y-auto bg-white px-3 py-1">
      <div
        v-for="(col, idx) in data.columns.slice(0, 8)"
        :key="col.id || idx"
        class="flex items-center gap-2 border-b border-gray-50 py-1 last:border-0"
      >
        <span
          class="h-1.5 w-1.5 flex-shrink-0 rounded-full"
          :class="col.type === 'metric' ? 'bg-indigo-400' : 'bg-emerald-400'"
        />
        <span class="truncate text-xs font-mono text-app-text">
          {{ col.name || col.label || `col_${idx}` }}
        </span>
        <span
          v-if="col.data_type"
          class="ml-auto flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500"
        >
          {{ col.data_type }}
        </span>
      </div>
      <div
        v-if="data.columns.length > 8"
        class="py-1 text-center text-[10px] text-app-text-muted"
      >
        + еще {{ data.columns.length - 8 }}
      </div>
    </div>

    <div v-else class="px-3 py-2 text-xs text-app-text-muted">
      Нет колонок
    </div>

    <!-- Vue Flow handles -->
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" />
  </div>
</template>
