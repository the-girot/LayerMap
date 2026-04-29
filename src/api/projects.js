/**
 * Projects API — сервис для работы с проектами и связанными сущностями.
 * Все методы соответствуют backend API документации.
 */

import { api as apiClient } from "./client";

// ───────────────────────────────────────────────────────────────
// Projects KPI & Filters
// ───────────────────────────────────────────────────────────────

export async function getProjectKpi() {
  return apiClient.get("/projects/kpi");
}

export async function getRecentProjects(limit = 10) {
  return apiClient.get("/projects/recent", { params: { limit } });
}

export async function getProjectsWithFilters({
  status,
  search,
  page = 1,
  size = 10,
  sort_by,
  sort_dir = "asc",
} = {}) {
  const params = {};
  if (status)   params.status   = status;
  if (search)   params.search   = search;
  if (sort_by)  params.sort_by  = sort_by;
  params.page     = page;
  params.size     = size;
  params.sort_dir = sort_dir;
  return apiClient.get("/projects", { params });
}

export async function getProjects() {
  return apiClient.get("/projects");
}

export async function getProjectById(projectId) {
  return apiClient.get(`/projects/${+projectId}`);
}

export async function createProject(data) {
  return apiClient.post("/projects", data);
}

export async function updateProject(projectId, data) {
  return apiClient.patch(`/projects/${+projectId}`, data);
}

export async function deleteProject(projectId) {
  return apiClient.delete(`/projects/${+projectId}`);
}

// ───────────────────────────────────────────────────────────────
// Sources  →  /projects/{project_id}/sources
// ───────────────────────────────────────────────────────────────

export async function getSources(projectId) {
  return apiClient.get(`/projects/${+projectId}/sources`);
}

export async function getSourceById(projectId, sourceId) {
  return apiClient.get(`/projects/${+projectId}/sources/${+sourceId}`);
}

export async function createSource(projectId, data) {
  return apiClient.post(`/projects/${+projectId}/sources`, data);
}

export async function updateSource(projectId, sourceId, data) {
  return apiClient.patch(`/projects/${+projectId}/sources/${+sourceId}`, data);
}

export async function deleteSource(projectId, sourceId) {
  return apiClient.delete(`/projects/${+projectId}/sources/${+sourceId}`);
}

// ───────────────────────────────────────────────────────────────
// Source Tables  →  /projects/{project_id}/sources/{source_id}/tables
// ───────────────────────────────────────────────────────────────

export async function getMappingTables(projectId, sourceId) {
  return apiClient.get(`/projects/${+projectId}/sources/${+sourceId}/tables`);
}

// алиас для обратной совместимости
export const getSourceMappingTables = getMappingTables;

export async function getMappingTableById(projectId, sourceId, tableId) {
  return apiClient.get(`/projects/${+projectId}/sources/${+sourceId}/tables/${+tableId}`);
}

export async function createMappingTable(projectId, sourceId, data) {
  return apiClient.post(`/projects/${+projectId}/sources/${+sourceId}/tables`, data);
}

export async function updateMappingTable(projectId, sourceId, tableId, data) {
  return apiClient.patch(`/projects/${+projectId}/sources/${+sourceId}/tables/${+tableId}`, data);
}

export async function deleteMappingTable(projectId, sourceId, tableId) {
  return apiClient.delete(`/projects/${+projectId}/sources/${+sourceId}/tables/${+tableId}`);
}

// ───────────────────────────────────────────────────────────────
// Columns  →  /projects/{project_id}/sources/{source_id}/tables/{table_id}/columns
// ───────────────────────────────────────────────────────────────

export async function getMappingTableColumns(projectId, sourceId, tableId) {
  return apiClient.get(`/projects/${+projectId}/sources/${+sourceId}/tables/${+tableId}/columns`);
}

// алиас для обратной совместимости
export const getMappingTableColumnById = (projectId, sourceId, tableId, columnId) =>
  apiClient.get(`/projects/${+projectId}/sources/${+sourceId}/tables/${+tableId}/columns/${+columnId}`);

export async function createMappingTableColumn(projectId, sourceId, tableId, data) {
  return apiClient.post(
    `/projects/${+projectId}/sources/${+sourceId}/tables/${+tableId}/columns`,
    data,
  );
}

export async function updateMappingTableColumn(projectId, sourceId, tableId, columnId, data) {
  return apiClient.patch(
    `/projects/${+projectId}/sources/${+sourceId}/tables/${+tableId}/columns/${+columnId}`,
    data,
  );
}

export async function deleteMappingTableColumn(projectId, sourceId, tableId, columnId) {
  return apiClient.delete(
    `/projects/${+projectId}/sources/${+sourceId}/tables/${+tableId}/columns/${+columnId}`,
  );
}

// ───────────────────────────────────────────────────────────────
// RPI Mappings  →  /projects/{project_id}/rpi-mappings
// ───────────────────────────────────────────────────────────────

export async function getRPIMappings(projectId, params = {}) {
  return apiClient.get(`/projects/${+projectId}/rpi-mappings`, { params });
}

export async function getRPIMappingsStats(projectId) {
  return apiClient.get(`/projects/${+projectId}/rpi-mappings/stats`);
}

export async function getRPIMappingById(projectId, rpiId) {
  return apiClient.get(`/projects/${+projectId}/rpi-mappings/${+rpiId}`);
}

export async function createRPIMapping(projectId, data) {
  return apiClient.post(`/projects/${+projectId}/rpi-mappings`, data);
}

export async function updateRPIMapping(projectId, rpiId, data) {
  return apiClient.patch(`/projects/${+projectId}/rpi-mappings/${+rpiId}`, data);
}

export async function deleteRPIMapping(projectId, rpiId) {
  return apiClient.delete(`/projects/${+projectId}/rpi-mappings/${+rpiId}`);
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
  getProjectKpi,
  getRecentProjects,
  getProjectsWithFilters,
  getSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource,
  getSourceMappingTables,
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