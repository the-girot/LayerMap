/**
 * Projects Store — CRUD для всех сущностей проекта с API интеграцией.
 * Все данные загружаются и обновляются через backend API.
 *
 * @typedef {Object} Project
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} [status]
 * @property {number} sources
 * @property {number} rpiRecords
 * @property {number} approved
 * @property {number} drafts
 * @property {number} inReview
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} Source
 * @property {number} id
 * @property {number} project_id
 * @property {string} name
 * @property {string} description
 * @property {string} type
 * @property {number} row_count
 * @property {string} last_updated
 * @property {string} created_at
 *
 * @typedef {Object} MappingColumn
 * @property {number} id
 * @property {number} mapping_table_id
 * @property {string} name
 * @property {string} type - 'dimension' | 'metric'
 * @property {string} data_type
 * @property {string} description
 * @property {boolean} is_calculated
 * @property {string|null} formula
 * @property {number|null} [rpi_mapping_id] - ID связанного РПИ маппинга
 * @property {string} created_at
 *
 * @typedef {Object} MappingTable
 * @property {number} id
 * @property {number} project_id
 * @property {string} name
 * @property {string} description
 * @property {number} source_id
 * @property {MappingColumn[]} columns
 * @property {string} created_at
 * @property {string} updated_at
 *
 * @typedef {Object} RPIMapping
 * @property {number} id
 * @property {number} number
 * @property {number} project_id
 * @property {string} ownership
 * @property {string} status
 * @property {string} block
 * @property {string} measurement_type
 * @property {boolean} [is_calculated]
 * @property {string} [formula]
 * @property {string} measurement
 * @property {string} measurement_description
 * @property {string} source_report
 * @property {string} object_field
 * @property {number|null} [source_column_id]
 * @property {string} date_added
 * @property {string|null} date_removed
 * @property {string} [comment]
 * @property {string|null} [verification_file]
 * @property {string} created_at
 * @property {string} updated_at
 */

import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { ProjectsApi } from "@/api/projectsWithMock";
import { ApiError } from "@/api/client";

export const useProjectsStore = defineStore("projects", () => {
  /** @type {import('vue').Ref<Project[]>} */
  const projects = ref([]);
  /** @type {import('vue').Ref<Record<number, Source[]>>} */
  const sources = ref({});
  /** @type {import('vue').Ref<Record<number, MappingTable[]>>} */
  const mappingTables = ref({});
  /** @type {import('vue').Ref<Record<number, RPIMapping[]>>} */
  const rpiMappings = ref({});

  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false);
  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null);

  /** Общее количество источников across all projects */
  const totalSources = computed(() =>
    projects.value.reduce((sum, p) => sum + p.sources, 0),
  );

  /** Общее количество РПИ записей across all projects */
  const totalRpi = computed(() =>
    projects.value.reduce((sum, p) => sum + p.rpiRecords, 0),
  );

  /** Дата последнего обновления среди всех проектов */
  const lastUpdateDate = computed(() => {
    const dates = projects.value.map((p) => {
      const [day, month, year] = p.updatedAt.split(".");
      return new Date(`${year}-${month}-${day}`);
    });
    const maxDate = new Date(Math.max(...dates));
    const day = String(maxDate.getDate()).padStart(2, "0");
    const month = String(maxDate.getMonth() + 1).padStart(2, "0");
    const year = maxDate.getFullYear();
    return `${day}.${month}.${year}`;
  });

  /**
   * Загрузить все проекты
   */
  async function loadProjects() {
    loading.value = true;
    error.value = null;
    try {
      const data = await ProjectsApi.getProjects();
      projects.value = data;
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : "Не удалось загрузить проекты";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Загрузить данные для конкретного проекта
   * @param {number|string} projectId
   */
  async function loadProjectData(projectId) {
    loading.value = true;
    error.value = null;
    try {
      const [project, projectSources, projectTables, projectRpi] =
        await Promise.all([
          ProjectsApi.getProjectById(projectId),
          ProjectsApi.getSources(projectId),
          ProjectsApi.getMappingTables(projectId),
          ProjectsApi.getRPIMappings(projectId),
        ]);

      // Обновляем проект в списке
      const index = projects.value.findIndex((p) => p.id === project.id);
      if (index !== -1) {
        projects.value[index] = project;
      } else {
        projects.value.push(project);
      }

      sources.value[projectId] = projectSources;
      mappingTables.value[projectId] = projectTables;
      rpiMappings.value[projectId] = projectRpi;
    } catch (err) {
      error.value =
        err instanceof ApiError
          ? err.message
          : "Не удалось загрузить данные проекта";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Получить проект по ID.
   * @param {number|string} id
   * @returns {Project|undefined}
   */
  function getProjectById(id) {
    return projects.value.find((p) => p.id === Number(id));
  }

  /**
   * Получить источники проекта.
   * @param {number|string} projectId
   * @returns {Source[]}
   */
  function getSourcesByProjectId(projectId) {
    return sources.value[projectId] || [];
  }

  /**
   * Получить таблицы маппинга проекта.
   * @param {number|string} projectId
   * @returns {MappingTable[]}
   */
  function getMappingTablesByProjectId(projectId) {
    return mappingTables.value[projectId] || [];
  }

  /**
   * Получить РПИ маппинги проекта.
   * @param {number|string} projectId
   * @returns {RPIMapping[]}
   */
  function getRPIMappingsByProjectId(projectId) {
    return rpiMappings.value[projectId] || [];
  }

  /**
   * Создать проект
   * @param {{name: string, description?: string, status?: string}} data
   * @returns {Promise<Project>}
   */
  async function createProject(data) {
    loading.value = true;
    error.value = null;
    try {
      const newProject = await ProjectsApi.createProject(data);
      projects.value.push(newProject);
      return newProject;
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : "Не удалось создать проект";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Обновить проект
   * @param {number|string} projectId
   * @param {{name?: string, description?: string, status?: string}} data
   * @returns {Promise<Project>}
   */
  async function updateProject(projectId, data) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await ProjectsApi.updateProject(projectId, data);
      const index = projects.value.findIndex((p) => p.id === projectId);
      if (index !== -1) {
        projects.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : "Не удалось обновить проект";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Удалить проект
   * @param {number|string} projectId
   * @returns {Promise<void>}
   */
  async function deleteProject(projectId) {
    loading.value = true;
    error.value = null;
    try {
      await ProjectsApi.deleteProject(projectId);
      projects.value = projects.value.filter((p) => p.id !== projectId);
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : "Не удалось удалить проект";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Создать источник
   * @param {number|string} projectId
   * @param {{name: string, description?: string, type: string, row_count?: number, mapping_table_id?: number|null}} data
   * @returns {Promise<Source>}
   */
  async function createSource(projectId, data) {
    loading.value = true;
    error.value = null;
    try {
      const newSource = await ProjectsApi.createSource(projectId, data);
      if (!sources.value[projectId]) {
        sources.value[projectId] = [];
      }
      sources.value[projectId].push(newSource);
      return newSource;
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : "Не удалось создать источник";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Обновить источник
   * @param {number|string} projectId
   * @param {number|string} sourceId
   * @param {{name?: string, description?: string, type?: string, row_count?: number}} data
   * @returns {Promise<Source>}
   */
  async function updateSource(projectId, sourceId, data) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await ProjectsApi.updateSource(projectId, sourceId, data);
      const sourcesList = sources.value[projectId];
      if (sourcesList) {
        const index = sourcesList.findIndex((s) => s.id === sourceId);
        if (index !== -1) {
          sourcesList[index] = updated;
        }
      }
      return updated;
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : "Не удалось обновить источник";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Удалить источник
   * @param {number|string} projectId
   * @param {number|string} sourceId
   * @returns {Promise<void>}
   */
  async function deleteSource(projectId, sourceId) {
    loading.value = true;
    error.value = null;
    try {
      await ProjectsApi.deleteSource(projectId, sourceId);
      const sourcesList = sources.value[projectId];
      if (sourcesList) {
        sources.value[projectId] = sourcesList.filter((s) => s.id !== sourceId);
      }
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : "Не удалось удалить источник";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Создать таблицу маппинга
   * @param {number|string} projectId
   * @param {{name: string, description?: string, source_id: number}} data
   * @returns {Promise<MappingTable>}
   */
  async function createMappingTable(projectId, data) {
    loading.value = true;
    error.value = null;
    try {
      const newTable = await ProjectsApi.createMappingTable(projectId, data);
      if (!mappingTables.value[projectId]) {
        mappingTables.value[projectId] = [];
      }
      mappingTables.value[projectId].push(newTable);
      return newTable;
    } catch (err) {
      error.value =
        err instanceof ApiError
          ? err.message
          : "Не удалось создать таблицу маппинга";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Обновить таблицу маппинга
   * @param {number|string} projectId
   * @param {number|string} tableId
   * @param {{name?: string, description?: string, source_id?: number}} data
   * @returns {Promise<MappingTable>}
   */
  async function updateMappingTable(projectId, tableId, data) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await ProjectsApi.updateMappingTable(
        projectId,
        tableId,
        data,
      );
      const tables = mappingTables.value[projectId];
      if (tables) {
        const index = tables.findIndex((t) => t.id === tableId);
        if (index !== -1) {
          tables[index] = updated;
        }
      }
      return updated;
    } catch (err) {
      error.value =
        err instanceof ApiError
          ? err.message
          : "Не удалось обновить таблицу маппинга";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Удалить таблицу маппинга
   * @param {number|string} projectId
   * @param {number|string} tableId
   * @returns {Promise<void>}
   */
  async function deleteMappingTable(projectId, tableId) {
    loading.value = true;
    error.value = null;
    try {
      await ProjectsApi.deleteMappingTable(projectId, tableId);
      const tables = mappingTables.value[projectId];
      if (tables) {
        mappingTables.value[projectId] = tables.filter((t) => t.id !== tableId);
      }
    } catch (err) {
      error.value =
        err instanceof ApiError
          ? err.message
          : "Не удалось удалить таблицу маппинга";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Создать колонку таблицы маппинга
   * @param {number|string} projectId
   * @param {number|string} tableId
   * @param {{name: string, type: string, data_type: string, description?: string, is_calculated?: boolean, formula?: string|null}} data
   * @returns {Promise<MappingColumn>}
   */
  async function createMappingTableColumn(projectId, tableId, data) {
    loading.value = true;
    error.value = null;
    try {
      const newColumn = await ProjectsApi.createMappingTableColumn(
        projectId,
        tableId,
        data,
      );
      const tables = mappingTables.value[projectId];
      const table = tables?.find((t) => t.id === tableId);
      if (table) {
        table.columns.push(newColumn);
      }
      return newColumn;
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : "Не удалось создать колонку";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Обновить колонку таблицы маппинга
   * @param {number|string} projectId
   * @param {number|string} tableId
   * @param {number|string} columnId
   * @param {{name?: string, type?: string, data_type?: string, description?: string, is_calculated?: boolean, formula?: string|null, rpi_mapping_id?: number|null}} data
   * @returns {Promise<MappingColumn>}
   */
  async function updateMappingTableColumn(projectId, tableId, columnId, data) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await ProjectsApi.updateMappingTableColumn(
        projectId,
        tableId,
        columnId,
        data,
      );
      const tables = mappingTables.value[projectId];
      const table = tables?.find((t) => t.id === tableId);
      if (table) {
        const index = table.columns.findIndex((c) => c.id === columnId);
        if (index !== -1) {
          table.columns[index] = updated;
        }
      }
      return updated;
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : "Не удалось обновить колонку";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Удалить колонку таблицы маппинга
   * @param {number|string} projectId
   * @param {number|string} tableId
   * @param {number|string} columnId
   * @returns {Promise<void>}
   */
  async function deleteMappingTableColumn(projectId, tableId, columnId) {
    loading.value = true;
    error.value = null;
    try {
      await ProjectsApi.deleteMappingTableColumn(projectId, tableId, columnId);
      const tables = mappingTables.value[projectId];
      const table = tables?.find((t) => t.id === tableId);
      if (table) {
        table.columns = table.columns.filter((c) => c.id !== columnId);
      }
    } catch (err) {
      error.value =
        err instanceof ApiError ? err.message : "Не удалось удалить колонку";
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
      const newMapping = await ProjectsApi.createRPIMapping(projectId, data);
      if (!rpiMappings.value[projectId]) {
        rpiMappings.value[projectId] = [];
      }
      rpiMappings.value[projectId].push(newMapping);
      return newMapping;
    } catch (err) {
      error.value =
        err instanceof ApiError
          ? err.message
          : "Не удалось создать РПИ маппинг";
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
        projectId,
        rpiId,
        data,
      );
      const mappings = rpiMappings.value[projectId];
      if (mappings) {
        const index = mappings.findIndex((m) => m.id === rpiId);
        if (index !== -1) {
          mappings[index] = updated;
        }
      }
      return updated;
    } catch (err) {
      error.value =
        err instanceof ApiError
          ? err.message
          : "Не удалось обновить РПИ маппинг";
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
      await ProjectsApi.deleteRPIMapping(projectId, rpiId);
      const mappings = rpiMappings.value[projectId];
      if (mappings) {
        rpiMappings.value[projectId] = mappings.filter((m) => m.id !== rpiId);
      }
    } catch (err) {
      error.value =
        err instanceof ApiError
          ? err.message
          : "Не удалось удалить РПИ маппинг";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Получить источник по ID.
   * @param {number|string} projectId
   * @param {number|string} sourceId
   * @returns {Source|undefined}
   */
  function getSourceById(projectId, sourceId) {
    return getSourcesByProjectId(projectId).find(
      (s) => s.id === Number(sourceId),
    );
  }

  /**
   * Получить источник проекта по имени.
   * @param {number|string} projectId
   * @param {string} sourceName
   * @returns {Source|undefined}
   */
  function getProjectSourceByProjectIdAndName(projectId, sourceName) {
    return getSourcesByProjectId(projectId).find((s) => s.name === sourceName);
  }

  /**
   * Получить РПИ маппинг по ID.
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
   * Получить колонку источника по sourceColumnId.
   * Ищет колонку во всех таблицах маппинга проекта.
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

  /**
   * Проверить целостность связи РПИ с колонкой источника.
   * @param {number|string} projectId
   * @param {RPIMapping} mapping
   * @returns {{valid: boolean, column: MappingColumn|null, table: MappingTable|null, error: string|null}}
   */
  function validateRPIMappingLink(projectId, mapping) {
    if (!mapping.source_column_id) {
      return {
        valid: false,
        column: null,
        table: null,
        error: "Отсутствует связь с полем источника (source_column_id)",
      };
    }
    const { column, table } = getSourceColumnById(
      projectId,
      mapping.source_column_id,
    );
    if (!column) {
      return {
        valid: false,
        column: null,
        table: null,
        error: `Колонка с ID ${mapping.source_column_id} не найдена`,
      };
    }
    // Проверка согласованности типов
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

  /**
   * Получить опции РПИ маппинга для селекта.
   * @param {number|string} projectId
   * @returns {{label: string, value: number, measurementType: string}[]}
   */
  function getRPIMappingOptions(projectId) {
    const mappings = rpiMappings.value[projectId] || [];
    return mappings.map((m) => ({
      label: `${m.number}. ${m.measurement} (${m.object_field})`,
      value: m.id,
      measurementType: m.measurement_type,
    }));
  }

  /**
   * Обновить связь колонки с РПИ маппингом.
   * @param {number|string} projectId
   * @param {number|string} tableId
   * @param {number|string} columnId
   * @param {number|string|null} rpiMappingId - ID РПИ маппинга или null для удаления связи
   * @returns {Promise<void>}
   */
  async function updateColumnRPIMapping(
    projectId,
    tableId,
    columnId,
    rpiMappingId,
  ) {
    loading.value = true;
    error.value = null;
    try {
      // Обновляем колонку, добавляя/удаляя связь с РПИ
      // Примечание: rpiMappingId сохраняется в поле rpi_mapping_id колонки
      const updated = await ProjectsApi.updateMappingTableColumn(
        projectId,
        tableId,
        columnId,
        { rpiMappingId },
      );

      // Обновляем локальное состояние
      const tables = mappingTables.value[projectId];
      const table = tables?.find((t) => t.id === tableId);
      if (table) {
        const index = table.columns.findIndex((c) => c.id === columnId);
        if (index !== -1) {
          table.columns[index] = updated;
        }
      }
    } catch (err) {
      error.value =
        err instanceof ApiError
          ? err.message
          : "Не удалось обновить маппинг колонки";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    projects,
    sources,
    mappingTables,
    rpiMappings,
    loading,
    error,

    // Computed
    totalSources,
    totalRpi,
    lastUpdateDate,

    // Actions
    loadProjects,
    loadProjectData,
    createProject,
    updateProject,
    deleteProject,
    createSource,
    updateSource,
    deleteSource,
    createMappingTable,
    updateMappingTable,
    deleteMappingTable,
    createMappingTableColumn,
    updateMappingTableColumn,
    deleteMappingTableColumn,
    createRPIMapping,
    updateRPIMapping,
    deleteRPIMapping,

    // Getters
    getProjectById,
    getSourcesByProjectId,
    getMappingTablesByProjectId,
    getRPIMappingsByProjectId,
    getSourceById,
    getProjectSourceByProjectIdAndName,
    getRPIMappingById,
    getSourceColumnById,
    validateRPIMappingLink,
    getRPIMappingOptions,
    updateColumnRPIMapping,
  };
});
