<script setup>
/**
 * LayerMappingToolbar — панель инструментов для Layer Mapping.
 * Управление режимом (single/full), селектор маппинга, действия.
 */
import { computed } from "vue";
import Button from "primevue/button";
import Select from "primevue/select";
import { VIEW_MODES, VIEW_MODE_LABELS } from "@/utils/layerMapping";

const props = defineProps({
  /** Текущий режим */
  mode: { type: String, default: "single" },
  /** Список маппингов для селектора */
  mappings: { type: Array, default: () => [] },
  /** Выбранный маппинг (id или объект) */
  selectedMappingId: { type: [Number, String, null], default: null },
  /** Загрузка */
  loading: { type: Boolean, default: false },
  /** Кол-во отфильтрованных */
  totalMappings: { type: Number, default: 0 },
});

const emit = defineEmits([
  "update:mode",
  "update:selectedMappingId",
  "create-mapping",
  "delete-mapping",
  "create-table",
  "refresh",
]);

/** Опции для Select — группировка по целевой таблице */
const mappingOptions = computed(() => {
  const groups = {};
  for (const m of props.mappings) {
    const key = m.targetTableName || m.targetTableId || "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  const options = [];
  for (const [tableName, items] of Object.entries(groups)) {
    options.push({
      label: `📦 ${tableName}`,
      value: null,
      disabled: true,
    });
    for (const item of items) {
      options.push({
        label: `  ↳ ${item.sourceTableName || `ID:${item.sourceTableId}`} → ${item.targetTableName || `ID:${item.targetTableId}`}`,
        value: item.id,
      });
    }
  }
  return options;
});

function toggleMode() {
  emit(
    "update:mode",
    props.mode === VIEW_MODES.SINGLE ? VIEW_MODES.FULL : VIEW_MODES.SINGLE,
  );
}
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-app-border bg-app-surface p-4"
  >
    <!-- Left: mode toggle + selector -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Mode switch -->
      <div class="flex overflow-hidden rounded-xl border border-app-border">
        <button
          :class="[
            'px-4 py-2 text-sm font-medium transition',
            mode === 'single'
              ? 'bg-primary text-white'
              : 'bg-app-surface-hover text-app-text-muted hover:bg-app-primary-light',
          ]"
          @click="$emit('update:mode', 'single')"
        >
          {{ VIEW_MODE_LABELS.single }}
        </button>
        <button
          :class="[
            'px-4 py-2 text-sm font-medium transition',
            mode === 'full'
              ? 'bg-primary text-white'
              : 'bg-app-surface-hover text-app-text-muted hover:bg-app-primary-light',
          ]"
          @click="$emit('update:mode', 'full')"
        >
          {{ VIEW_MODE_LABELS.full }}
        </button>
      </div>

      <!-- Mapping selector (only in single mode) -->
      <Select
        v-if="mode === 'single'"
        :model-value="selectedMappingId"
        :options="mappingOptions"
        option-label="label"
        option-value="value"
        placeholder="Выберите маппинг…"
        class="min-w-[280px]"
        size="small"
        :loading="loading"
        :pt="{
          root: { class: '!rounded-xl' },
          label: { class: '!text-sm' },
        }"
        @update:model-value="$emit('update:selectedMappingId', $event)"
      />

      <!-- Stats badge -->
      <span
        v-if="mode === 'full'"
        class="rounded-lg bg-app-primary-light px-3 py-1 text-sm text-primary"
      >
        {{ totalMappings }} маппингов
      </span>
    </div>

    <!-- Right: action buttons -->
    <div class="flex flex-wrap items-center gap-2">
      <Button
        label="Создать таблицу"
        icon="pi pi-plus"
        size="small"
        :pt="{ root: '!rounded-xl !min-h-[36px]' }"
        @click="$emit('create-table')"
      />
      <Button
        label="Создать маппинг"
        icon="pi pi-sitemap"
        size="small"
        severity="secondary"
        :pt="{ root: '!rounded-xl !min-h-[36px]' }"
        @click="$emit('create-mapping')"
      />
      <Button
        v-if="mode === 'single' && selectedMappingId"
        label="Удалить"
        icon="pi pi-trash"
        size="small"
        severity="danger"
        :pt="{ root: '!rounded-xl !min-h-[36px]' }"
        @click="$emit('delete-mapping')"
      />
      <Button
        icon="pi pi-refresh"
        size="small"
        text
        :pt="{ root: '!rounded-xl !min-h-[36px]' }"
        @click="$emit('refresh')"
      />
    </div>
  </div>
</template>
