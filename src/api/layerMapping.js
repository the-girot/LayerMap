/**
 * Layer Mapping API — сервис для работы с DWH-таблицами, слоями и связями lineage.
 * Все методы соответствуют backend API в формате camelCase.
 *
 * @module api/layerMapping
 */

import { api } from "./client";

// ───────────────────────────────────────────────────────────────
// DWH Tables  →  /projects/{projectId}/dwh-tables
// ───────────────────────────────────────────────────────────────

/**
 * Получить все DWH-таблицы проекта.
 * @param {number|string} projectId
 * @returns {Promise<Array>}
 */
export async function getDWHTables(projectId) {
  return api.get(`/projects/${+projectId}/dwh-tables`);
}

/**
 * Создать новую DWH-таблицу в проекте.
 * @param {number|string} projectId
 * @param {Object} data - { name, layer, schema?, description? }
 * @returns {Promise<Object>}
 */
export async function createDWHTable(projectId, data) {
  return api.post(`/projects/${+projectId}/dwh-tables`, data);
}

/**
 * Обновить DWH-таблицу.
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateDWHTable(projectId, tableId, data) {
  return api.patch(`/projects/${+projectId}/dwh-tables/${+tableId}`, data);
}

/**
 * Удалить DWH-таблицу.
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @returns {Promise<void>}
 */
export async function deleteDWHTable(projectId, tableId) {
  return api.delete(`/projects/${+projectId}/dwh-tables/${+tableId}`);
}

// ───────────────────────────────────────────────────────────────
// DWH Columns  →  /projects/{projectId}/dwh-tables/{tableId}/columns
// ───────────────────────────────────────────────────────────────

/**
 * Получить колонки DWH-таблицы.
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @returns {Promise<Array>}
 */
export async function getDWHColumns(projectId, tableId) {
  return api.get(`/projects/${+projectId}/dwh-tables/${+tableId}/columns`);
}

/**
 * Создать колонку в DWH-таблице.
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createDWHColumn(projectId, tableId, data) {
  return api.post(`/projects/${+projectId}/dwh-tables/${+tableId}/columns`, data);
}

// ───────────────────────────────────────────────────────────────
// Layer Mappings  →  /projects/{projectId}/layer-mappings
// ───────────────────────────────────────────────────────────────

/**
 * Получить список маппингов между слоями.
 * @param {number|string} projectId
 * @param {Object} [params] - query params (layer, targetTableId, page, size)
 * @returns {Promise<{data: Array, total: number}>}
 */
export async function getLayerMappings(projectId, params = {}) {
  return api.get(`/projects/${+projectId}/layer-mappings`, { params });
}

/**
 * Создать маппинг между DWH-таблицами разных слоёв.
 * @param {number|string} projectId
 * @param {Object} data - { sourceTableId, targetTableId, transformation?, algorithm? }
 * @returns {Promise<Object>}
 */
export async function createLayerMapping(projectId, data) {
  return api.post(`/projects/${+projectId}/layer-mappings`, data);
}

/**
 * Получить один маппинг по ID.
 * @param {number|string} projectId
 * @param {number|string} mappingId
 * @returns {Promise<Object>}
 */
export async function getLayerMapping(projectId, mappingId) {
  return api.get(`/projects/${+projectId}/layer-mappings/${+mappingId}`);
}

/**
 * Обновить маппинг (transformation, algorithm, etc.).
 * @param {number|string} projectId
 * @param {number|string} mappingId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateLayerMapping(projectId, mappingId, data) {
  return api.patch(`/projects/${+projectId}/layer-mappings/${+mappingId}`, data);
}

/**
 * Удалить маппинг между слоями.
 * @param {number|string} projectId
 * @param {number|string} mappingId
 * @returns {Promise<void>}
 */
export async function deleteLayerMapping(projectId, mappingId) {
  return api.delete(`/projects/${+projectId}/layer-mappings/${+mappingId}`);
}

// ───────────────────────────────────────────────────────────────
// Lineage  →  /projects/{projectId}/lineage
// ───────────────────────────────────────────────────────────────

/**
 * Получить полный граф lineage по проекту (узлы + связи).
 * @param {number|string} projectId
 * @returns {Promise<{nodes: Array, edges: Array}>}
 */
export async function getLineage(projectId) {
  return api.get(`/projects/${+projectId}/lineage`);
}

// ───────────────────────────────────────────────────────────────
// Export all
// ───────────────────────────────────────────────────────────────

export const LayerMappingApi = {
  getDWHTables,
  createDWHTable,
  updateDWHTable,
  deleteDWHTable,
  getDWHColumns,
  createDWHColumn,
  getLayerMappings,
  createLayerMapping,
  getLayerMapping,
  updateLayerMapping,
  deleteLayerMapping,
  getLineage,
};

export default LayerMappingApi;
