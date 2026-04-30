<script setup>
/**
 * LayerMappingView — оркестрационный экран для управления маппингом слоёв DWH.
 *
 * Режимы:
 * - single: показывает один маппинг (две таблицы + связь)
 * - full: полный граф lineage по слоям STG → ODS → DDS → DM
 *
 * Соответствует подходу проекта: оркестрация данных из store,
 * передача пропсов в подкомпоненты.
 */
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useProject } from "@/composables/useProject";
import { useLayerMappingStore } from "@/stores/layerMapping";
import { useLayerMappingCanvas } from "@/composables/useLayerMappingCanvas";
import { useLayerMappingForm } from "@/composables/useLayerMappingForm";
import { VIEW_MODES, LAYER_ORDER } from "@/utils/layerMapping";

import LayerMappingToolbar from "@/components/layerMapping/LayerMappingToolbar.vue";
import SingleMappingCanvas from "@/components/layerMapping/SingleMappingCanvas.vue";
import FullLineageCanvas from "@/components/layerMapping/FullLineageCanvas.vue";
import TransformationModal from "@/components/layerMapping/TransformationModal.vue";
import CreateDWHTableDialog from "@/components/layerMapping/CreateDWHTableDialog.vue";
import Button from "primevue/button";

const router = useRouter();
const { projectId, project, loadProjectData, loading: projectLoading } = useProject();
const store = useLayerMappingStore();

// ─── Data ───────────────────────────────────────────────────────
const showCreateTableDialog = ref(false);
const showCreateMappingDialog = ref(false);

// ─── Composed state ─────────────────────────────────────────────
const mappings = computed(() => store.getMappingsByProjectId(projectId.value));
const tables = computed(() => store.getTablesByProjectId(projectId.value));

const singleFlowData = computed(() => store.singleMappingFlow.value);
const fullFlowData = computed(
  () => store.fullLineageFlow(projectId.value)?.value || { nodes: [], edges: [] },
);

// ─── Canvas composable ─────────────────────────────────────────
function onEdgeClick(edgeData) {
  // Находим маппинг по mappingId из edge data
  if (edgeData.mappingId) {
    const mapping = mappings.value.find((m) => m.id === edgeData.mappingId);
    if (mapping) {
      store.selectMapping(mapping);
      formComposable.openModal();
    }
  }
}

function onNodeClick(nodeData) {
  // Задел на будущее: открыть side panel / dialog с данными таблицы
  console.log("[LayerMapping] Node clicked:", nodeData);
}

const canvasComposable = useLayerMappingCanvas(
  computed(() => store.mode),
  onEdgeClick,
  onNodeClick,
);

// ─── Form composable (TransformationModal) ────────────────────
const formComposable = useLayerMappingForm(
  computed(() => store.selectedMapping),
  store.saveTransformation,
  projectId,
);

// ─── Computed for toolbar ──────────────────────────────────────
const selectedMappingId = computed(() => store.selectedMapping?.id ?? null);

// ─── Actions ───────────────────────────────────────────────────
async function init() {
  if (!projectId.value) return;

  try {
    await loadProjectData();

    // Параллельная загрузка данных для layer mapping
    await Promise.all([
      store.loadTables(projectId.value),
      store.loadMappings(projectId.value),
      store.loadLineage(projectId.value),
    ]);

    // Автовыбор первого маппинга для single режима
    const projectMappings = store.getMappingsByProjectId(projectId.value);
    if (projectMappings.length > 0 && !store.selectedMapping) {
      store.selectMapping(projectMappings[0]);
    }
  } catch (err) {
    console.error("[LayerMapping] Init error:", err);
  }
}

function handleSelectMapping(mappingId) {
  const mapping = mappings.value.find((m) => m.id === mappingId);
  if (mapping) {
    store.selectMapping(mapping);
  }
}

async function handleCreateTable(data) {
  try {
    await store.createTable(projectId.value, data);
    showCreateTableDialog.value = false;
  } catch (err) {
    // Ошибка уже в store.error / fieldErrors
    console.error("[LayerMapping] Create table error:", err);
  }
}

async function handleCreateMapping(data) {
  try {
    await store.createMapping(projectId.value, data);
    showCreateMappingDialog.value = false;
    // Перезагрузить lineage после создания
    await store.loadLineage(projectId.value);
  } catch (err) {
    console.error("[LayerMapping] Create mapping error:", err);
  }
}

async function handleDeleteMapping() {
  if (!store.selectedMapping?.id) return;
  try {
    await store.deleteMapping(projectId.value, store.selectedMapping.id);
  } catch (err) {
    console.error("[LayerMapping] Delete mapping error:", err);
  }
}

async function handleRefresh() {
  if (!projectId.value) return;
  await Promise.all([
    store.loadTables(projectId.value),
    store.loadMappings(projectId.value),
    store.loadLineage(projectId.value),
  ]);
}

function goBack() {
  router.push({ name: "ProjectDetail", params: { id: projectId.value } });
}

// ─── Lifecycle ─────────────────────────────────────────────────
onMounted(() => {
  init();
});
</script>

<template>
  <div class="min-h-screen bg-app-bg">
    <!-- Loading state -->
    <div
      v-if="projectLoading && !project"
      class="flex h-screen items-center justify-center"
    >
      <i class="pi pi-spin pi-spinner text-4xl text-primary" />
    </div>

    <!-- Error state -->
    <div
      v-else-if="store.error && !tables.length"
      class="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <i class="pi pi-exclamation-circle text-5xl text-red-400" />
      <h2 class="text-xl font-semibold text-app-text">Ошибка загрузки</h2>
      <p class="text-sm text-app-text-muted">{{ store.error }}</p>
      <Button
        label="Повторить"
        icon="pi pi-refresh"
        :pt="{ root: '!rounded-xl !min-h-[44px]' }"
        @click="handleRefresh"
      />
    </div>

    <!-- Main content -->
    <template v-else>
      <main class="flex h-screen flex-col p-4 md:p-6 lg:p-8">
        <!-- Header / Breadcrumbs -->
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <Button
              icon="pi pi-arrow-left"
              text
              size="small"
              :pt="{ root: '!rounded-xl' }"
              @click="goBack"
            />
            <span class="text-app-text-muted">/</span>
            <span class="font-medium text-app-text">
              Layer Mapping — {{ project?.name || "Загрузка…" }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs text-app-text-muted">
            <i class="pi pi-database" />
            {{ tables.length }} таблиц
            <span class="mx-1">•</span>
            <i class="pi pi-sitemap" />
            {{ mappings.length }} маппингов
          </div>
        </div>

        <!-- Toolbar -->
        <LayerMappingToolbar
          :mode="store.mode"
          :mappings="mappings"
          :selected-mapping-id="selectedMappingId"
          :loading="store.loading"
          :total-mappings="mappings.length"
          @update:mode="store.setMode"
          @update:selected-mapping-id="handleSelectMapping"
          @create-mapping="showCreateMappingDialog = true"
          @delete-mapping="handleDeleteMapping"
          @create-table="showCreateTableDialog = true"
          @refresh="handleRefresh"
        />

        <!-- Error banner -->
        <div
          v-if="store.error"
          class="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
        >
          <i class="pi pi-exclamation-triangle" />
          <span>{{ store.error }}</span>
          <button
            class="ml-auto text-red-500 hover:text-red-700"
            @click="store.resetError"
          >
            <i class="pi pi-times" />
          </button>
        </div>

        <!-- Canvas area -->
        <div class="mt-4 flex-1">
          <!-- Single Mode -->
          <SingleMappingCanvas
            v-if="store.mode === 'single'"
            :flow-data="singleFlowData"
            :loading="store.loading"
            @edge-click="canvasComposable.handleEdgeClick"
            @node-click="canvasComposable.handleNodeClick"
            @viewport-change="canvasComposable.onViewportChange"
          />

          <!-- Full Lineage Mode -->
          <FullLineageCanvas
            v-else
            :flow-data="fullFlowData"
            :loading="store.loading"
            :show-minimap="canvasComposable.showMinimap.value"
            :zoom-level="canvasComposable.zoomLevel.value"
            @edge-click="canvasComposable.handleEdgeClick"
            @node-click="canvasComposable.handleNodeClick"
            @viewport-change="canvasComposable.onViewportChange"
            @zoom-in="canvasComposable.zoomIn"
            @zoom-out="canvasComposable.zoomOut"
            @fit-view="canvasComposable.fitView"
            @toggle-minimap="canvasComposable.toggleMinimap"
          />
        </div>
      </main>

      <!-- Transformation Modal -->
      <TransformationModal
        :visible="formComposable.modalOpen.value"
        :mapping="store.selectedMapping"
        :form="formComposable.form"
        :form-touched="formComposable.formTouched.value"
        :saving="formComposable.saving.value"
        :field-errors="formComposable.fieldErrors.value"
        @update:visible="(v) => { if (!v) formComposable.closeModal(); }"
        @save="formComposable.saveForm"
        @close="formComposable.closeModal"
      />

      <!-- Create DWH Table Dialog -->
      <CreateDWHTableDialog
        v-model="showCreateTableDialog"
        :field-errors="store.fieldErrors"
        @create="handleCreateTable"
      />
    </template>
  </div>
</template>
