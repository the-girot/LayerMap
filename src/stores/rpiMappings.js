/**
 * RPI Mappings Store — CRUD РПИ маппингов с API интеграцией.
 *
 * @typedef {import('./projects').RPIMapping} RPIMapping
 * @typedef {import('./projects').MappingColumn} MappingColumn
 * @typedef {import('./projects').MappingTable} MappingTable
 */

import { ref } from "vue";
import { defineStore } from "pinia";
import { ProjectsApi } from "@/api/projects";
import { useAuthStore } from "@/stores/auth";

function handleApiError(errorRef, err) {
  errorRef.value = err.message;

  if (err.status === 401) {
    const authStore = useAuthStore();
    authStore.logout();
    throw new Error("Session expired. Please login again.");
  }

  if (err.status === 403) {
    errorRef.value = "Нет прав доступа";
  }

  if (err.status === 409) {
    errorRef.value = "Ресурс уже существует";
  }

  if (err.status === 422) {
    errorRef.value = "Ошибка валидации";
  }

  if (err.status === 0 || err.status >= 500) {
    errorRef.value = "Сервер недоступен, попробуйте позже";
  }
}

export const useRPIMappingsStore = defineStore("rpiMappings", () => {
  /** @type {import('vue').Ref<Record<number, RPIMapping[]>>} */
  const rpiMappings = ref({});

  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false);

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null);

  // ─── Internal helpers ───────────────────────────────────────────

  /**
   * @param {number|string} projectId
   * @returns {RPIMapping[]}
   */
  function getRPIMappingsByProjectId(projectId) {
    return rpiMappings.value[projectId] || [];
  }

  /**
   * @param {number|string} projectId
   * @param {number|string} mappingId
   * @returns {RPIMapping|undefined}
   */
  function getRPIMappingById(projectId, mappingId) {
    return getRPIMappingsByProjectId(projectId).find(
      (m) => m.id === Number(mappingId),
    );
  }

  /**
   * Получить опции РПИ маппинга для селекта.
   * @param {number|string} projectId
   * @returns {{label: string, value: number, measurement_type: string}[]}
   */
  function getRPIMappingOptions(projectId) {
    const mappings = rpiMappings.value[projectId] || [];
    return mappings.map((m) => ({
      label: `${m.number}. ${m.measurement} (${m.object_field})`,
      value: m.id,
      measurement_type: m.measurement_type,
    }));
  }

  /**
   * Проверить целостность связи РПИ с колонкой источника.
   * @param {number|string} projectId
   * @param {RPIMapping} mapping
   * @param {import('./tables').useMappingTablesStore} [tablesStore]
   * @returns {{valid: boolean, column: MappingColumn|null, table: MappingTable|null, error: string|null}}
   */
  function validateRPIMappingLink(projectId, mapping, tablesStore) {
    if (!mapping.source_column_id) {
      return {
        valid: false,
        column: null,
        table: null,
        error: "Отсутствует связь с полем источника (source_column_id)",
      };
    }

    let column, table;

    if (tablesStore) {
      const result = tablesStore.getSourceColumnById(
        projectId,
        mapping.source_column_id,
      );
      column = result.column;
      table = result.table;
    }

    if (!column) {
      return {
        valid: false,
        column: null,
        table: null,
        error: `Колонка с ID ${mapping.source_column_id} не найдена`,
      };
    }

    const expectedType =
      mapping.measurement_type === "Метрика" ? "metric" : "dimension";
    if (column.type !== expectedType) {
      return {
        valid: false,
        column,
        table,
        error: `Несоответствие типа: РПИ="${mapping.measurement_type}", колонка="${column.type}"`,
      };
    }

    if (column.is_calculated !== mapping.is_calculated) {
      return {
        valid: false,
        column,
        table,
        error: `Несоответствие calculated: РПИ=${mapping.is_calculated}, колонка=${column.is_calculated}`,
      };
    }

    return { valid: true, column, table, error: null };
  }

  // ─── Actions ────────────────────────────────────────────────────

  /**
   * Загрузить РПИ маппинги проекта
   * @param {number|string} projectId
   */
  async function loadRPIMappings(projectId) {
    loading.value = true;
    error.value = null;
    try {
      const data = await ProjectsApi.getRPIMappings(projectId);
      rpiMappings.value[projectId] = data;
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Создать RPI маппинг
   * @param {number|string} projectId
   * @param {Omit<RPIMapping, 'id' | 'created_at' | 'updated_at'>} data
   * @returns {Promise<RPIMapping>}
   */
  async function createRPIMapping(projectId, data) {
    loading.value = true;
    error.value = null;
    try {
      const newMapping = await ProjectsApi.createRPIMapping(parseInt(projectId), data);
      const projectId = newMapping.project_id;
      if (projectId) {
        if (!rpiMappings.value[projectId]) {
          rpiMappings.value[projectId] = [];
        }
        rpiMappings.value[projectId].push(newMapping);
      }
      return newMapping;
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Обновить RPI маппинг
   * @param {number|string} projectId
   * @param {number|string} rpiId
   * @param {Partial<RPIMapping>} data
   * @returns {Promise<RPIMapping>}
   */
  async function updateRPIMapping(projectId, rpiId, data) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await ProjectsApi.updateRPIMapping(
        parseInt(projectId),
        parseInt(rpiId),
        data,
      );
      Object.keys(rpiMappings.value).forEach((projectId) => {
        const mappings = rpiMappings.value[projectId];
        if (mappings) {
          const index = mappings.findIndex((m) => m.id === parseInt(rpiId));
          if (index !== -1) {
            mappings[index] = updated;
          }
        }
      });
      return updated;
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Удалить RPI маппинг
   * @param {number|string} projectId
   * @param {number|string} rpiId
   * @returns {Promise<void>}
   */
  async function deleteRPIMapping(projectId, rpiId) {
    loading.value = true;
    error.value = null;
    try {
      await ProjectsApi.deleteRPIMapping(parseInt(projectId), parseInt(rpiId));
      Object.keys(rpiMappings.value).forEach((projectId) => {
        const mappings = rpiMappings.value[projectId];
        if (mappings) {
          rpiMappings.value[projectId] = mappings.filter(
            (m) => m.id !== parseInt(rpiId),
          );
        }
      });
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    rpiMappings,
    loading,
    error,

    // Getters
    getRPIMappingsByProjectId,
    getRPIMappingById,
    getRPIMappingOptions,
    validateRPIMappingLink,

    // Actions
    loadRPIMappings,
    createRPIMapping,
    updateRPIMapping,
    deleteRPIMapping,
  };
});
