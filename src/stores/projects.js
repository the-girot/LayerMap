/**
 * Projects Store — CRUD для всех сущностей проекта.
 * Mock-данные вынесены в src/data/mock.js
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
 * @property {string} name
 * @property {string} description
 * @property {string} type
 * @property {number} rowCount
 * @property {string} lastUpdated
 *
 * @typedef {Object} MappingColumn
 * @property {number} id
 * @property {string} name
 * @property {string} type - 'metric' | 'dimension'
 * @property {boolean} isCalculated
 * @property {string|null} formula
 * @property {string} dataType
 * @property {string} description
 * @property {number|null} rpiMappingId
 *
 * @typedef {Object} MappingTable
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {MappingColumn[]} columns
 *
 * @typedef {Object} RPIMapping
 * @property {number} id
 * @property {number} number
 * @property {number} projectId
 * @property {string} ownership
 * @property {string} status
 * @property {string} source
 * @property {string} block
 * @property {string} measurementType
 * @property {boolean} [isCalculated]
 * @property {string} [formula]
 * @property {string} measurement
 * @property {string} measurementDescription
 * @property {string} sourceReport
 * @property {string} objectField
 * @property {number|null} [sourceColumnId] - Жесткая связь с колонкой источника
 * @property {string} dateAdded
 * @property {string|null} dateRemoved
 * @property {string} comment
 * @property {string|null} verificationFile
 */
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
  mockProjects,
  mockSources,
  mockMappingTables,
  mockRPIMappings,
} from "@/data/mock";

export const useProjectsStore = defineStore("projects", () => {
  /** @type {import('vue').Ref<Project[]>} */
  const projects = ref(mockProjects);
  /** @type {import('vue').Ref<Record<number, Source[]>>} */
  const sources = ref(mockSources);
  /** @type {import('vue').Ref<Record<number, MappingTable[]>>} */
  const mappingTables = ref(mockMappingTables);
  /** @type {import('vue').Ref<Record<number, RPIMapping[]>>} */
  const rpiMappings = ref(mockRPIMappings);

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
   * Добавить таблицу маппинга.
   * @param {number|string} projectId
   * @param {{name: string, description?: string}} table
   */
  function addMappingTable(projectId, table) {
    if (!mappingTables.value[projectId]) {
      mappingTables.value[projectId] = [];
    }
    const newId =
      Math.max(0, ...mappingTables.value[projectId].map((t) => t.id)) + 1;
    mappingTables.value[projectId].push({
      id: newId,
      name: table.name,
      description: table.description || "",
      columns: [],
    });
  }

  /**
   * Обновить таблицу маппинга.
   * @param {number|string} projectId
   * @param {number} tableId
   * @param {Partial<MappingTable>} updates
   */
  function updateMappingTable(projectId, tableId, updates) {
    const tables = mappingTables.value[projectId];
    if (!tables) return;
    const table = tables.find((t) => t.id === tableId);
    if (table) Object.assign(table, updates);
  }

  /**
   * Удалить таблицу маппинга.
   * @param {number|string} projectId
   * @param {number} tableId
   */
  function deleteMappingTable(projectId, tableId) {
    const tables = mappingTables.value[projectId];
    if (!tables) return;
    const index = tables.findIndex((t) => t.id === tableId);
    if (index !== -1) tables.splice(index, 1);
  }

  /**
   * Добавить колонку в таблицу маппинга.
   * @param {number|string} projectId
   * @param {number} tableId
   * @param {{name: string, type: string, isCalculated?: boolean, formula?: string, dataType?: string, description?: string}} column
   */
  function addColumnToTable(projectId, tableId, column) {
    const tables = mappingTables.value[projectId];
    if (!tables) return;
    const table = tables.find((t) => t.id === tableId);
    if (table) {
      const newColId = Math.max(0, ...table.columns.map((c) => c.id)) + 1;
      const validTypes = ["metric", "dimension"];
      const columnType = validTypes.includes(column.type)
        ? column.type
        : "dimension";

      table.columns.push({
        id: newColId,
        name: column.name,
        type: columnType,
        isCalculated: column.isCalculated || false,
        formula: column.isCalculated ? column.formula || "" : null,
        dataType: column.dataType || "",
        description: column.description || "",
        rpiMappingId: null,
      });
    }
  }

  /**
   * Обновить привязку колонки к РПИ.
   * @param {number|string} projectId
   * @param {number} tableId
   * @param {number} columnId
   * @param {number|null} rpiMappingId
   */
  function updateColumnRPIMapping(projectId, tableId, columnId, rpiMappingId) {
    const tables = mappingTables.value[projectId];
    if (!tables) return;
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    const column = table.columns.find((c) => c.id === columnId);
    if (column) column.rpiMappingId = rpiMappingId;
  }

  /**
   * Получить опции РПИ маппинга для селекта.
   * @param {number|string} projectId
   * @returns {{label: string, value: number, measurementType: string}[]}
   */
  function getRPIMappingOptions(projectId) {
    const mappings = rpiMappings.value[projectId] || [];
    return mappings.map((m) => ({
      label: `${m.number}. ${m.measurement} (${m.objectField})`,
      value: m.id,
      measurementType: m.measurementType,
    }));
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
   * Добавить РПИ маппинг.
   * @param {number|string} projectId
   * @param {Omit<RPIMapping, 'id' | 'number' | 'projectId'>} mapping
   */
  function addRPIMapping(projectId, mapping) {
    if (!rpiMappings.value[projectId]) {
      rpiMappings.value[projectId] = [];
    }
    const newId =
      Math.max(0, ...rpiMappings.value[projectId].map((m) => m.id)) + 1;
    const newNumber = rpiMappings.value[projectId].length + 1;
    rpiMappings.value[projectId].push({
      id: newId,
      number: newNumber,
      projectId,
      ...mapping,
    });
  }

  /**
   * Обновить РПИ маппинг.
   * @param {number|string} projectId
   * @param {number} mappingId
   * @param {Partial<RPIMapping>} updates
   */
  function updateRPIMapping(projectId, mappingId, updates) {
    const mappings = rpiMappings.value[projectId];
    if (!mappings) return;
    const mapping = mappings.find((m) => m.id === mappingId);
    if (mapping) Object.assign(mapping, updates);
  }

  /**
   * Удалить РПИ маппинг.
   * @param {number|string} projectId
   * @param {number} mappingId
   */
  function deleteRPIMapping(projectId, mappingId) {
    const mappings = rpiMappings.value[projectId];
    if (!mappings) return;
    const index = mappings.findIndex((m) => m.id === mappingId);
    if (index !== -1) mappings.splice(index, 1);
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
    if (!mapping.sourceColumnId) {
      return {
        valid: false,
        column: null,
        table: null,
        error: "Отсутствует связь с полем источника (sourceColumnId)",
      };
    }
    const { column, table } = getSourceColumnById(
      projectId,
      mapping.sourceColumnId,
    );
    if (!column) {
      return {
        valid: false,
        column: null,
        table: null,
        error: `Колонка с ID ${mapping.sourceColumnId} не найдена`,
      };
    }
    // Проверка согласованности типов
    const expectedType =
      mapping.measurementType === "Метрика" ? "metric" : "dimension";
    if (column.type !== expectedType) {
      return {
        valid: false,
        column,
        table,
        error: `Несоответствие типа: РПИ="${mapping.measurementType}", колонка="${column.type}"`,
      };
    }
    if (column.isCalculated !== mapping.isCalculated) {
      return {
        valid: false,
        column,
        table,
        error: `Несоответствие calculated: РПИ=${mapping.isCalculated}, колонка=${column.isCalculated}`,
      };
    }
    return { valid: true, column, table, error: null };
  }

  return {
    projects,
    sources,
    mappingTables,
    rpiMappings,
    totalSources,
    totalRpi,
    lastUpdateDate,
    getProjectById,
    getSourcesByProjectId,
    getMappingTablesByProjectId,
    addMappingTable,
    updateMappingTable,
    deleteMappingTable,
    addColumnToTable,
    updateColumnRPIMapping,
    getRPIMappingOptions,
    getRPIMappingsByProjectId,
    addRPIMapping,
    updateRPIMapping,
    deleteRPIMapping,
    getSourceById,
    getProjectSourceByProjectIdAndName,
    getRPIMappingById,
    getSourceColumnById,
    validateRPIMappingLink,
  };
});
