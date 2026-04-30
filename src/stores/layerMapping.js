/**
 * Layer Mapping Store — управление DWH-таблицами, маппингами слоёв и lineage.
 *
 * Состояние:
 * - tables: Record<projectId, DWHTable[]> — DWH-таблицы по проекту
 * - mappings: Record<projectId, LayerMapping[]> — маппинги по проекту
 * - lineage: Record<projectId, {nodes, edges}> — lineage граф
 * - selectedMapping: LayerMapping|null — текущий выбранный маппинг для single-view
 * - mode: 'single' | 'full' — режим отображения
 * - loading, error — общее состояние загрузки
 */

import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { LayerMappingApi } from "@/api/layerMapping";
import { useAuthStore } from "@/stores/auth";
import { lineageToFlowData, singleMappingToFlowData, LAYER_ORDER } from "@/utils/layerMapping";

// ─── Error handling (единый паттерн проекта) ─────────────────────
function handleApiError(errorRef, err) {
  errorRef.value = err?.message || err?.response?.data?.detail || "Неизвестная ошибка";

  if (err?.status === 401) {
    const authStore = useAuthStore();
    authStore.logout();
    throw new Error("Session expired. Please login again.");
  }

  if (err?.status === 403) {
    errorRef.value = "Нет прав доступа";
  }

  if (err?.status === 409) {
    errorRef.value = "Ресурс уже существует";
  }

  if (err?.status === 422) {
    errorRef.value = "Ошибка валидации";
  }

  if (!err?.status || err?.status >= 500) {
    errorRef.value = "Сервер недоступен, попробуйте позже";
  }
}

/** Валидационные ошибки полей (из 422 responses) */
function extractFieldErrors(err) {
  if (!err?.response?.data?.detail) return {};
  const detail = err.response.data.detail;
  if (Array.isArray(detail)) {
    const errors = {};
    for (const d of detail) {
      if (d.loc && d.msg) {
        const field = d.loc[d.loc.length - 1];
        if (!errors[field]) errors[field] = [];
        errors[field].push(d.msg);
      }
    }
    return errors;
  }
  return {};
}

export const useLayerMappingStore = defineStore("layerMapping", () => {
  // ─── State ──────────────────────────────────────────────────────

  /** @type {import('vue').Ref<Record<string|number, Array>>} */
  const tables = ref({});

  /** @type {import('vue').Ref<Record<string|number, Array>>} */
  const mappings = ref({});

  /** @type {import('vue').Ref<Record<string|number, {nodes: Array, edges: Array}>>} */
  const lineage = ref({});

  /** @type {import('vue').Ref<Object|null>} */
  const selectedMapping = ref(null);

  /** @type {import('vue').Ref<'single'|'full'>} */
  const mode = ref("single");

  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false);

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null);

  /** @type {import('vue').Ref<Object>} */
  const fieldErrors = ref({});

  /** @type {import('vue').Ref<boolean>} */
  const dirty = ref(false);

  /** @type {import('vue').Ref<boolean>} */
  const saving = ref(false);

  // ─── Computed / Getters ─────────────────────────────────────────

  /**
   * DWH-таблицы для указанного проекта.
   * @param {number|string} projectId
   * @returns {Array}
   */
  function getTablesByProjectId(projectId) {
    return tables.value[projectId] || [];
  }

  /**
   * Таблицы, отфильтрованные по слою.
   * @param {number|string} projectId
   * @param {string} layer - 'stg' | 'ods' | 'dds' | 'dm'
   * @returns {import('vue').ComputedRef<Array>}
   */
  function tablesByLayer(projectId, layer) {
    return computed(() => {
      const all = getTablesByProjectId(projectId);
      return all.filter((t) => t.layer === layer);
    });
  }

  /**
   * Маппинги для указанного проекта.
   * @param {number|string} projectId
   * @returns {Array}
   */
  function getMappingsByProjectId(projectId) {
    return mappings.value[projectId] || [];
  }

  /**
   * Маппинги, отфильтрованные по целевой таблице.
   * @param {number|string} projectId
   * @param {number|string} targetTableId
   * @returns {import('vue').ComputedRef<Array>}
   */
  function mappingsByTargetTable(projectId, targetTableId) {
    return computed(() => {
      const all = getMappingsByProjectId(projectId);
      return all.filter((m) => m.targetTableId === Number(targetTableId));
    });
  }

  /**
   * Данные для single-view canvas (две ноды + одна связь).
   * @returns {import('vue').ComputedRef<{nodes: Array, edges: Array}>}
   */
  const singleMappingFlow = computed(() => {
    return singleMappingToFlowData(selectedMapping.value);
  });

  /**
   * Данные для full lineage canvas (все слои).
   * @param {number|string} projectId
   * @returns {import('vue').ComputedRef<{nodes: Array, edges: Array}>}
   */
  function fullLineageFlow(projectId) {
    return computed(() => {
      const data = lineage.value[projectId];
      return data ? lineageToFlowData(data) : { nodes: [], edges: [] };
    });
  }

  // ─── Actions ────────────────────────────────────────────────────

  /**
   * Установить режим отображения.
   * @param {'single'|'full'} newMode
   */
  function setMode(newMode) {
    mode.value = newMode;
    if (newMode === "single" && !selectedMapping.value) {
      // По умолчанию выбираем первый маппинг, если нет выбранного
      const projectTables = Object.values(mappings.value).flat();
      if (projectTables.length > 0) {
        selectedMapping.value = projectTables[0];
      }
    }
  }

  /**
   * Выбрать маппинг для single-view.
   * @param {Object} mapping
   */
  function selectMapping(mapping) {
    selectedMapping.value = mapping;
    mode.value = "single";
    dirty.value = false;
    fieldErrors.value = {};
  }

  /**
   * Сбросить ошибки.
   */
  function resetError() {
    error.value = null;
    fieldErrors.value = {};
  }

  /**
   * Загрузить lineage (полный граф) для проекта.
   * @param {number|string} projectId
   */
  async function loadLineage(projectId) {
    loading.value = true;
    error.value = null;
    try {
      const data = await LayerMappingApi.getLineage(projectId);
      lineage.value[projectId] = data;
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Загрузить список маппингов слоёв.
   * @param {number|string} projectId
   * @param {Object} [params]
   */
  async function loadMappings(projectId, params = {}) {
    loading.value = true;
    error.value = null;
    try {
      const result = await LayerMappingApi.getLayerMappings(projectId, params);
      mappings.value[projectId] = result.data || result;
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Сохранить transformation/algorithm выбранного маппинга.
   * @param {number|string} projectId
   * @param {Object} data - { transformation, algorithm }
   */
  async function saveTransformation(projectId, data) {
    if (!selectedMapping.value?.id) return;

    saving.value = true;
    error.value = null;
    fieldErrors.value = {};

    try {
      const updated = await LayerMappingApi.updateLayerMapping(
        projectId,
        selectedMapping.value.id,
        data,
      );

      // Обновить в локальном состоянии
      Object.assign(selectedMapping.value, updated);

      // Также обновить в массиве mappings
      const projectMappings = mappings.value[projectId];
      if (projectMappings) {
        const idx = projectMappings.findIndex((m) => m.id === updated.id);
        if (idx !== -1) {
          projectMappings[idx] = updated;
        }
      }

      dirty.value = false;
    } catch (err) {
      handleApiError(error, err);
      fieldErrors.value = extractFieldErrors(err);
      throw err;
    } finally {
      saving.value = false;
    }
  }

  /**
   * Создать новую DWH-таблицу.
   * @param {number|string} projectId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async function createTable(projectId, data) {
    loading.value = true;
    error.value = null;
    fieldErrors.value = {};

    try {
      const newTable = await LayerMappingApi.createDWHTable(projectId, data);

      if (!tables.value[projectId]) tables.value[projectId] = [];
      tables.value[projectId].push(newTable);

      return newTable;
    } catch (err) {
      handleApiError(error, err);
      fieldErrors.value = extractFieldErrors(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Создать новый маппинг между слоями.
   * @param {number|string} projectId
   * @param {Object} data - { sourceTableId, targetTableId, transformation?, algorithm? }
   * @returns {Promise<Object>}
   */
  async function createMapping(projectId, data) {
    loading.value = true;
    error.value = null;
    fieldErrors.value = {};

    try {
      const newMapping = await LayerMappingApi.createLayerMapping(projectId, data);

      if (!mappings.value[projectId]) mappings.value[projectId] = [];
      mappings.value[projectId].push(newMapping);

      return newMapping;
    } catch (err) {
      handleApiError(error, err);
      fieldErrors.value = extractFieldErrors(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Удалить маппинг.
   * @param {number|string} projectId
   * @param {number|string} mappingId
   */
  async function deleteMapping(projectId, mappingId) {
    loading.value = true;
    error.value = null;

    try {
      await LayerMappingApi.deleteLayerMapping(projectId, mappingId);

      const projectMappings = mappings.value[projectId];
      if (projectMappings) {
        mappings.value[projectId] = projectMappings.filter(
          (m) => m.id !== Number(mappingId),
        );
      }

      if (selectedMapping.value?.id === Number(mappingId)) {
        selectedMapping.value = null;
      }
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Загрузить DWH-таблицы.
   * @param {number|string} projectId
   */
  async function loadTables(projectId) {
    loading.value = true;
    error.value = null;

    try {
      const data = await LayerMappingApi.getDWHTables(projectId);
      tables.value[projectId] = data;
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    tables,
    mappings,
    lineage,
    selectedMapping,
    mode,
    loading,
    error,
    fieldErrors,
    dirty,
    saving,

    // Getters
    getTablesByProjectId,
    tablesByLayer,
    getMappingsByProjectId,
    mappingsByTargetTable,
    singleMappingFlow,
    fullLineageFlow,

    // Actions
    setMode,
    selectMapping,
    resetError,
    loadLineage,
    loadMappings,
    loadTables,
    saveTransformation,
    createTable,
    createMapping,
    deleteMapping,
  };
});
