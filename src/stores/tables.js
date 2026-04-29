/**
 * Tables Store — CRUD таблиц маппинга и колонок с API интеграцией.
 *
 * @typedef {import('./projects').MappingTable} MappingTable
 * @typedef {import('./projects').MappingColumn} MappingColumn
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

export const useMappingTablesStore = defineStore("mappingTables", () => {
  /** @type {import('vue').Ref<Record<number, MappingTable[]>>} */
  const mappingTables = ref({});

  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false);

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null);

  // ─── Internal helpers ───────────────────────────────────────────

  /**
   * @param {number|string} projectId
   * @returns {MappingTable[]}
   */
  function getMappingTablesByProjectId(projectId) {
    return mappingTables.value[projectId] || [];
  }

  /**
   * Получить колонку источника по sourceColumnId.
   * @param {number|string} projectId
   * @param {number} sourceColumnId
   * @returns {{column: MappingColumn|null, table: MappingTable|null}}
   */
  function getSourceColumnById(projectId, sourceColumnId) {
    const tables = getMappingTablesByProjectId(projectId);
    for (const table of tables) {
      const column = table.columns.find((c) => c.id === sourceColumnId);
      if (column) return { column, table };
    }
    return { column: null, table: null };
  }

  // ─── Actions ────────────────────────────────────────────────────

  /**
   * Загрузить таблицы маппинга для всех источников проекта.
   * @param {number|string} projectId
   * @param {import('./projects').Source[]} sources
   */
  async function loadTables(projectId, sources) {
    loading.value = true;
    error.value = null;
    try {
      const tablesPerSource = await Promise.all(
        sources.map((source) =>
          ProjectsApi.getMappingTables(projectId, source.id)
            .then((tables) => tables.map((t) => ({ ...t, source_id: source.id })))
            .catch(() => []),
        ),
      );
      mappingTables.value[projectId] = tablesPerSource.flat();
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Создать таблицу маппинга
   * @param {number|string} projectId
   * @param {{source_id: number, name: string, description?: string}} data
   * @returns {Promise<MappingTable>}
   */
  async function createMappingTable(projectId, data) {
    const { source_id, ...rest } = data;
    if (!source_id) throw new Error("source_id is required to create a table");

    const newTable = await ProjectsApi.createMappingTable(
      projectId,
      source_id,
      rest,
    );

    if (!mappingTables.value[projectId]) mappingTables.value[projectId] = [];
    mappingTables.value[projectId].push({ ...newTable, source_id });

    return newTable;
  }

  /**
   * Обновить таблицу маппинга
   * @param {number|string} tableId
   * @param {{name?: string, description?: string, source_id?: number}} data
   * @returns {Promise<MappingTable>}
   */
  async function updateMappingTable(tableId, data) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await ProjectsApi.updateMappingTable(
        parseInt(tableId),
        data,
      );
      Object.keys(mappingTables.value).forEach((projectId) => {
        const tables = mappingTables.value[projectId];
        if (tables) {
          const index = tables.findIndex((t) => t.id === parseInt(tableId));
          if (index !== -1) {
            tables[index] = updated;
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
   * Удалить таблицу маппинга
   * @param {number|string} tableId
   * @returns {Promise<void>}
   */
  async function deleteMappingTable(tableId) {
    loading.value = true;
    error.value = null;
    try {
      await ProjectsApi.deleteMappingTable(parseInt(tableId));
      Object.keys(mappingTables.value).forEach((projectId) => {
        const tables = mappingTables.value[projectId];
        if (tables) {
          mappingTables.value[projectId] = tables.filter(
            (t) => t.id !== parseInt(tableId),
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

  /**
   * Создать колонку таблицы маппинга
   * @param {number|string} projectId
   * @param {number|string} sourceId
   * @param {number|string} tableId
   * @param {{name: string, type: string, data_type: string, description?: string, is_calculated?: boolean, formula?: string|null}} data
   * @returns {Promise<MappingColumn>}
   */
  async function createMappingTableColumn(projectId, sourceId, tableId, data) {
    loading.value = true;
    error.value = null;
    try {
      const newColumn = await ProjectsApi.createMappingTableColumn(
        parseInt(projectId),
        parseInt(sourceId),
        parseInt(tableId),
        data,
      );
      Object.keys(mappingTables.value).forEach((projectId) => {
        const tables = mappingTables.value[projectId];
        const table = tables?.find((t) => t.id === parseInt(tableId));
        if (table) {
          table.columns.push(newColumn);
        }
      });
      return newColumn;
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Обновить колонку таблицы маппинга
   * @param {number|string} projectId
   * @param {number|string} sourceId
   * @param {number|string} tableId
   * @param {number|string} columnId
   * @param {{name?: string, type?: string, data_type?: string, description?: string, is_calculated?: boolean, formula?: string|null, rpi_mapping_id?: number|null}} data
   * @returns {Promise<MappingColumn>}
   */
  async function updateMappingTableColumn(
    projectId,
    sourceId,
    tableId,
    columnId,
    data,
  ) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await ProjectsApi.updateMappingTableColumn(
        parseInt(projectId),
        parseInt(sourceId),
        parseInt(tableId),
        parseInt(columnId),
        data,
      );
      Object.keys(mappingTables.value).forEach((pid) => {
        const tables = mappingTables.value[pid];
        const table = tables?.find((t) => t.id === parseInt(tableId));
        if (table) {
          const index = table.columns.findIndex(
            (c) => c.id === parseInt(columnId),
          );
          if (index !== -1) {
            // Merge updated props into existing object to preserve
            // reactivity and any fields the API response might omit
            Object.assign(table.columns[index], updated);
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
   * Удалить колонку таблицы маппинга
   * @param {number|string} projectId
   * @param {number|string} sourceId
   * @param {number|string} tableId
   * @param {number|string} columnId
   * @returns {Promise<void>}
   */
  async function deleteMappingTableColumn(projectId, sourceId, tableId, columnId) {
    loading.value = true;
    error.value = null;
    try {
      await ProjectsApi.deleteMappingTableColumn(
        parseInt(projectId),
        parseInt(sourceId),
        parseInt(tableId),
        parseInt(columnId),
      );
      Object.keys(mappingTables.value).forEach((pid) => {
        const tables = mappingTables.value[pid];
        const table = tables?.find((t) => t.id === parseInt(tableId));
        if (table) {
          table.columns = table.columns.filter((c) => c.id !== parseInt(columnId));
        }
      });
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Обновить связь колонки с РПИ маппингом (измерение или показатель).
   * @param {number|string} projectId
   * @param {number|string} sourceId
   * @param {number|string} tableId
   * @param {number|string} columnId
   * @param {number|string|null} value - ID РПИ-маппинга или null
   * @param {'rpi_dimension_id'|'rpi_metric_id'} [field='rpi_dimension_id'] - какое поле колонки обновляем
   * @returns {Promise<void>}
   */
  async function updateColumnRPIMapping(
    projectId,
    sourceId,
    tableId,
    columnId,
    value,
    field = 'rpi_dimension_id',
  ) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await ProjectsApi.updateMappingTableColumn(
        parseInt(projectId),
        parseInt(sourceId),
        parseInt(tableId),
        parseInt(columnId),
        { [field]: value },
      );

      Object.keys(mappingTables.value).forEach((pid) => {
        const tables = mappingTables.value[pid];
        const table = tables?.find((t) => t.id === parseInt(tableId));
        if (table) {
          const index = table.columns.findIndex(
            (c) => c.id === parseInt(columnId),
          );
          if (index !== -1) {
            Object.assign(table.columns[index], updated);
          }
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
    mappingTables,
    loading,
    error,

    // Getters
    getMappingTablesByProjectId,
    getSourceColumnById,

    // Actions
    loadTables,
    createMappingTable,
    updateMappingTable,
    deleteMappingTable,
    createMappingTableColumn,
    updateMappingTableColumn,
    deleteMappingTableColumn,
    updateColumnRPIMapping,
  };
});
