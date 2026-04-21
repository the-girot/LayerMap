/**
 * Projects API — сервис для работы с проектами и связанными сущностями.
 * Все методы соответствуют backend API документации.
 */

import { apiClient } from "./client";

/**
 * @typedef {Object} Project
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} [status]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Source
 * @property {number} id
 * @property {number} project_id
 * @property {string} name
 * @property {string} description
 * @property {string} type
 * @property {number} row_count
 * @property {string} last_updated
 * @property {string} created_at
 */

/**
 * @typedef {Object} MappingColumn
 * @property {number} id
 * @property {number} mapping_table_id
 * @property {string} name
 * @property {string} type - 'dimension' | 'metric'
 * @property {string} data_type
 * @property {string} description
 * @property {boolean} is_calculated
 * @property {string|null} formula
 * @property {string} created_at
 */

/**
 * @typedef {Object} MappingTable
 * @property {number} id
 * @property {number} project_id
 * @property {string} name
 * @property {string} description
 * @property {number} source_id
 * @property {MappingColumn[]} columns
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} RPIMapping
 * @property {number} id
 * @property {number} number
 * @property {number} project_id
 * @property {string} ownership
 * @property {string} status
 * @property {string} block
 * @property {string} measurement_type
 * @property {boolean} [is_calculated]
 * @property {string|null} [formula]
 * @property {string} measurement
 * @property {string} measurement_description
 * @property {string} source_report
 * @property {string} object_field
 * @property {number|null} source_column_id
 * @property {string} date_added
 * @property {string|null} date_removed
 * @property {string|null} comment
 * @property {string|null} verification_file
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * Получить список всех проектов
 * @returns {Promise<Project[]>}
 */
export async function getProjects() {
  return apiClient.get("/projects");
}

/**
 * Получить проект по ID
 * @param {number|string} projectId
 * @returns {Promise<Project>}
 */
export async function getProjectById(projectId) {
  return apiClient.get(`/projects/${projectId}`);
}

/**
 * Создать проект
 * @param {{name: string, description?: string, status?: string}} data
 * @returns {Promise<Project>}
 */
export async function createProject(data) {
  return apiClient.post("/projects", data);
}

/**
 * Обновить проект
 * @param {number|string} projectId
 * @param {{name?: string, description?: string, status?: string}} data
 * @returns {Promise<Project>}
 */
export async function updateProject(projectId, data) {
  return apiClient.patch(`/projects/${projectId}`, data);
}

/**
 * Удалить проект
 * @param {number|string} projectId
 * @returns {Promise<void>}
 */
export async function deleteProject(projectId) {
  return apiClient.delete(`/projects/${projectId}`);
}

// ───────────────────────────────────────────────────────────────
// Sources
// ───────────────────────────────────────────────────────────────

/**
 * Получить список источников проекта
 * @param {number|string} projectId
 * @returns {Promise<Source[]>}
 */
export async function getSources(projectId) {
  return apiClient.get(`/projects/${projectId}/sources`);
}

/**
 * Получить источник по ID
 * @param {number|string} projectId
 * @param {number|string} sourceId
 * @returns {Promise<Source>}
 */
export async function getSourceById(projectId, sourceId) {
  return apiClient.get(`/projects/${projectId}/sources/${sourceId}`);
}

/**
 * Создать источник
 * @param {number|string} projectId
 * @param {{name: string, description?: string, type: string, row_count?: number, mapping_table_id?: number|null}} data
 * @returns {Promise<Source>}
 */
export async function createSource(projectId, data) {
  return apiClient.post(`/projects/${projectId}/sources`, data);
}

/**
 * Обновить источник
 * @param {number|string} projectId
 * @param {number|string} sourceId
 * @param {{name?: string, description?: string, type?: string, row_count?: number}} data
 * @returns {Promise<Source>}
 */
export async function updateSource(projectId, sourceId, data) {
  return apiClient.patch(`/projects/${projectId}/sources/${sourceId}`, data);
}

/**
 * Удалить источник
 * @param {number|string} projectId
 * @param {number|string} sourceId
 * @returns {Promise<void>}
 */
export async function deleteSource(projectId, sourceId) {
  return apiClient.delete(`/projects/${projectId}/sources/${sourceId}`);
}

// ───────────────────────────────────────────────────────────────
// Mapping Tables
// ───────────────────────────────────────────────────────────────

/**
 * Получить список таблиц маппинга проекта
 * @param {number|string} projectId
 * @returns {Promise<MappingTable[]>}
 */
export async function getMappingTables(projectId) {
  return apiClient.get(`/projects/${projectId}/mapping-tables`);
}

/**
 * Получить таблицу маппинга по ID
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @returns {Promise<MappingTable>}
 */
export async function getMappingTableById(projectId, tableId) {
  return apiClient.get(`/projects/${projectId}/mapping-tables/${tableId}`);
}

/**
 * Создать таблицу маппинга
 * @param {number|string} projectId
 * @param {{name: string, description?: string, source_id: number}} data
 * @returns {Promise<MappingTable>}
 */
export async function createMappingTable(projectId, data) {
  return apiClient.post(`/projects/${projectId}/mapping-tables`, data);
}

/**
 * Обновить таблицу маппинга
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @param {{name?: string, description?: string, source_id?: number}} data
 * @returns {Promise<MappingTable>}
 */
export async function updateMappingTable(projectId, tableId, data) {
  return apiClient.patch(
    `/projects/${projectId}/mapping-tables/${tableId}`,
    data,
  );
}

/**
 * Удалить таблицу маппинга
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @returns {Promise<void>}
 */
export async function deleteMappingTable(projectId, tableId) {
  return apiClient.delete(`/projects/${projectId}/mapping-tables/${tableId}`);
}

// ───────────────────────────────────────────────────────────────
// Mapping Columns
// ───────────────────────────────────────────────────────────────

/**
 * Получить список колонок таблицы маппинга
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @returns {Promise<MappingColumn[]>}
 */
export async function getMappingTableColumns(projectId, tableId) {
  return apiClient.get(
    `/projects/${projectId}/mapping-tables/${tableId}/columns`,
  );
}

/**
 * Получить колонку по ID
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @param {number|string} columnId
 * @returns {Promise<MappingColumn>}
 */
export async function getMappingTableColumnById(projectId, tableId, columnId) {
  return apiClient.get(
    `/projects/${projectId}/mapping-tables/${tableId}/columns/${columnId}`,
  );
}

/**
 * Создать колонку
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @param {{name: string, type: string, data_type: string, description?: string, is_calculated?: boolean, formula?: string|null}} data
 * @returns {Promise<MappingColumn>}
 */
export async function createMappingTableColumn(projectId, tableId, data) {
  return apiClient.post(
    `/projects/${projectId}/mapping-tables/${tableId}/columns`,
    data,
  );
}

/**
 * Обновить колонку
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @param {number|string} columnId
 * @param {{name?: string, type?: string, data_type?: string, description?: string, is_calculated?: boolean, formula?: string|null}} data
 * @returns {Promise<MappingColumn>}
 */
export async function updateMappingTableColumn(
  projectId,
  tableId,
  columnId,
  data,
) {
  return apiClient.patch(
    `/projects/${projectId}/mapping-tables/${tableId}/columns/${columnId}`,
    data,
  );
}

/**
 * Удалить колонку
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @param {number|string} columnId
 * @returns {Promise<void>}
 */
export async function deleteMappingTableColumn(projectId, tableId, columnId) {
  return apiClient.delete(
    `/projects/${projectId}/mapping-tables/${tableId}/columns/${columnId}`,
  );
}

// ───────────────────────────────────────────────────────────────
// RPI Mappings
// ───────────────────────────────────────────────────────────────

/**
 * Получить список RPI маппингов проекта
 * @param {number|string} projectId
 * @param {{skip?: number, limit?: number, status?: string, ownership?: string, measurement_type?: string, is_calculated?: boolean, search?: string}} [params]
 * @returns {Promise<RPIMapping[]>}
 */
export async function getRPIMappings(projectId, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString
    ? `/projects/${projectId}/rpi-mappings?${queryString}`
    : `/projects/${projectId}/rpi-mappings`;
  return apiClient.get(endpoint);
}

/**
 * Получить статистику RPI маппингов
 * @param {number|string} projectId
 * @returns {Promise<{total: number, approved: number, in_review: number, draft: number}>}
 */
export async function getRPIMappingsStats(projectId) {
  return apiClient.get(`/projects/${projectId}/rpi-mappings/stats`);
}

/**
 * Получить RPI маппинг по ID
 * @param {number|string} projectId
 * @param {number|string} rpiId
 * @returns {Promise<RPIMapping>}
 */
export async function getRPIMappingById(projectId, rpiId) {
  return apiClient.get(`/projects/${projectId}/rpi-mappings/${rpiId}`);
}

/**
 * Создать RPI маппинг
 * @param {number|string} projectId
 * @param {{number: number, ownership: string, status: string, block: string, measurement_type: string, is_calculated?: boolean, formula?: string|null, measurement: string, measurement_description: string, source_report: string, object_field: string, source_column_id?: number|null, date_added: string, date_removed?: string|null, comment?: string|null, verification_file?: string|null}} data
 * @returns {Promise<RPIMapping>}
 */
export async function createRPIMapping(projectId, data) {
  return apiClient.post(`/projects/${projectId}/rpi-mappings`, data);
}

/**
 * Обновить RPI маппинг
 * @param {number|string} projectId
 * @param {number|string} rpiId
 * @param {{number?: number, ownership?: string, status?: string, block?: string, measurement_type?: string, is_calculated?: boolean, formula?: string|null, measurement?: string, measurement_description?: string, source_report?: string, object_field?: string, source_column_id?: number|null, date_added?: string, date_removed?: string|null, comment?: string|null, verification_file?: string|null}} data
 * @returns {Promise<RPIMapping>}
 */
export async function updateRPIMapping(projectId, rpiId, data) {
  return apiClient.patch(`/projects/${projectId}/rpi-mappings/${rpiId}`, data);
}

/**
 * Удалить RPI маппинг
 * @param {number|string} projectId
 * @param {number|string} rpiId
 * @returns {Promise<void>}
 */
export async function deleteRPIMapping(projectId, rpiId) {
  return apiClient.delete(`/projects/${projectId}/rpi-mappings/${rpiId}`);
}

// ───────────────────────────────────────────────────────────────
// Export all
// ───────────────────────────────────────────────────────────────

export const ProjectsApi = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource,
  getMappingTables,
  getMappingTableById,
  createMappingTable,
  updateMappingTable,
  deleteMappingTable,
  getMappingTableColumns,
  getMappingTableColumnById,
  createMappingTableColumn,
  updateMappingTableColumn,
  deleteMappingTableColumn,
  getRPIMappings,
  getRPIMappingsStats,
  getRPIMappingById,
  createRPIMapping,
  updateRPIMapping,
  deleteRPIMapping,
};

export default ProjectsApi;
