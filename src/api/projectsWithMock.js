/**
 * Projects API — сервис для работы с проектами с fallback на mock-данные.
 * При недоступности бэкенда автоматически используются mock-данные.
 */

import { apiClient, ApiError } from "./client";
import { convertKeysToSnake, convertKeysToCamel } from "../utils/caseConverter";
import {
  mockProjects,
  mockSources,
  mockMappingTables,
  mockRPIMappings,
} from "../data/mock";

/**
 * Проверить доступность бэкенда
 * @returns {Promise<boolean>}
 */
async function checkBackendAvailability() {
  try {
    await apiClient.get("/projects", { throwOnError: false, json: false });
    return true;
  } catch {
    return false;
  }
}

// Кэш состояния бэкенда
let backendAvailable = null;
let backendCheckPromise = null;

/**
 * Получить статус доступности бэкенда с кэшированием
 * @returns {Promise<boolean>}
 */
async function isBackendAvailable() {
  if (backendAvailable !== null) {
    return backendAvailable;
  }

  if (backendCheckPromise) {
    return backendCheckPromise;
  }

  backendCheckPromise = checkBackendAvailability()
    .then((result) => {
      backendAvailable = result;
      backendCheckPromise = null;
      return result;
    })
    .catch(() => {
      backendAvailable = false;
      backendCheckPromise = null;
      return false;
    });

  return backendCheckPromise;
}

/**
 * Получить список всех проектов
 * @returns {Promise<Project[]>}
 */
export async function getProjects() {
  const available = await isBackendAvailable();
  if (!available) {
    console.warn("Backend unavailable, using mock data");
    return mockProjects;
  }
  try {
    const data = await apiClient.get("/projects");
    return convertKeysToCamel(data);
  } catch (error) {
    console.warn("Backend request failed, using mock data:", error);
    return mockProjects;
  }
}

/**
 * Получить проект по ID
 * @param {number|string} projectId
 * @returns {Promise<Project>}
 */
export async function getProjectById(projectId) {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      const project = mockProjects.find((p) => p.id === Number(projectId));
      if (!project) {
        throw new ApiError(404, `Project ${projectId} not found`);
      }
      return project;
    }
    const data = await apiClient.get(`/projects/${projectId}`);
    return convertKeysToCamel(data);
  } catch (error) {
    console.warn("Backend request failed, using mock data:", error);
    const project = mockProjects.find((p) => p.id === Number(projectId));
    if (!project) {
      throw new ApiError(404, `Project ${projectId} not found`);
    }
    return project;
  }
}

/**
 * Создать проект
 * @param {{name: string, description?: string, status?: string}} data
 * @returns {Promise<Project>}
 */
export async function createProject(data) {
  const snakeData = convertKeysToSnake(data);
  const result = await apiClient.post("/projects", snakeData);
  return convertKeysToCamel(result);
}

/**
 * Обновить проект
 * @param {number|string} projectId
 * @param {{name?: string, description?: string, status?: string}} data
 * @returns {Promise<Project>}
 */
export async function updateProject(projectId, data) {
  const snakeData = convertKeysToSnake(data);
  const result = await apiClient.patch(`/projects/${projectId}`, snakeData);
  return convertKeysToCamel(result);
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
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return mockSources[Number(projectId)] || [];
    }
    const data = await apiClient.get(`/projects/${projectId}/sources`);
    return convertKeysToCamel(data);
  } catch (error) {
    console.warn("Backend request failed, using mock data:", error);
    return mockSources[Number(projectId)] || [];
  }
}

/**
 * Получить источник по ID
 * @param {number|string} projectId
 * @param {number|string} sourceId
 * @returns {Promise<Source>}
 */
export async function getSourceById(projectId, sourceId) {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      const sources = mockSources[Number(projectId)] || [];
      const source = sources.find((s) => s.id === Number(sourceId));
      if (!source) {
        throw new ApiError(404, `Source ${sourceId} not found`);
      }
      return source;
    }
    const data = await apiClient.get(
      `/projects/${projectId}/sources/${sourceId}`,
    );
    return convertKeysToCamel(data);
  } catch (error) {
    console.warn("Backend request failed, using mock data:", error);
    const sources = mockSources[Number(projectId)] || [];
    const source = sources.find((s) => s.id === Number(sourceId));
    if (!source) {
      throw new ApiError(404, `Source ${sourceId} not found`);
    }
    return source;
  }
}

/**
 * Создать источник
 * @param {number|string} projectId
 * @param {{name: string, description?: string, type: string, row_count?: number, mapping_table_id?: number|null}} data
 * @returns {Promise<Source>}
 */
export async function createSource(projectId, data) {
  const snakeData = convertKeysToSnake(data);
  const result = await apiClient.post(
    `/projects/${projectId}/sources`,
    snakeData,
  );
  return convertKeysToCamel(result);
}

/**
 * Обновить источник
 * @param {number|string} projectId
 * @param {number|string} sourceId
 * @param {{name?: string, description?: string, type?: string, row_count?: number}} data
 * @returns {Promise<Source>}
 */
export async function updateSource(projectId, sourceId, data) {
  const snakeData = convertKeysToSnake(data);
  const result = await apiClient.patch(
    `/projects/${projectId}/sources/${sourceId}`,
    snakeData,
  );
  return convertKeysToCamel(result);
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
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return mockMappingTables[Number(projectId)] || [];
    }
    const data = await apiClient.get(`/projects/${projectId}/mapping-tables`);
    return convertKeysToCamel(data);
  } catch (error) {
    console.warn("Backend request failed, using mock data:", error);
    return mockMappingTables[Number(projectId)] || [];
  }
}

/**
 * Получить таблицу маппинга по ID
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @returns {Promise<MappingTable>}
 */
export async function getMappingTableById(projectId, tableId) {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      const tables = mockMappingTables[Number(projectId)] || [];
      const table = tables.find((t) => t.id === Number(tableId));
      if (!table) {
        throw new ApiError(404, `Mapping table ${tableId} not found`);
      }
      return table;
    }
    const data = await apiClient.get(
      `/projects/${projectId}/mapping-tables/${tableId}`,
    );
    return convertKeysToCamel(data);
  } catch (error) {
    console.warn("Backend request failed, using mock data:", error);
    const tables = mockMappingTables[Number(projectId)] || [];
    const table = tables.find((t) => t.id === Number(tableId));
    if (!table) {
      throw new ApiError(404, `Mapping table ${tableId} not found`);
    }
    return table;
  }
}

/**
 * Создать таблицу маппинга
 * @param {number|string} projectId
 * @param {{name: string, description?: string, source_id: number}} data
 * @returns {Promise<MappingTable>}
 */
export async function createMappingTable(projectId, data) {
  const snakeData = convertKeysToSnake(data);
  const result = await apiClient.post(
    `/projects/${projectId}/mapping-tables`,
    snakeData,
  );
  return convertKeysToCamel(result);
}

/**
 * Обновить таблицу маппинга
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @param {{name?: string, description?: string, source_id?: number}} data
 * @returns {Promise<MappingTable>}
 */
export async function updateMappingTable(projectId, tableId, data) {
  const snakeData = convertKeysToSnake(data);
  const result = await apiClient.patch(
    `/projects/${projectId}/mapping-tables/${tableId}`,
    snakeData,
  );
  return convertKeysToCamel(result);
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
  try {
    const available = await isBackendAvailable();
    if (!available) {
      const tables = mockMappingTables[Number(projectId)] || [];
      const table = tables.find((t) => t.id === Number(tableId));
      return table?.columns || [];
    }
    const data = await apiClient.get(
      `/projects/${projectId}/mapping-tables/${tableId}/columns`,
    );
    return convertKeysToCamel(data);
  } catch (error) {
    console.warn("Backend request failed, using mock data:", error);
    const tables = mockMappingTables[Number(projectId)] || [];
    const table = tables.find((t) => t.id === Number(tableId));
    return table?.columns || [];
  }
}

/**
 * Получить колонку по ID
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @param {number|string} columnId
 * @returns {Promise<MappingColumn>}
 */
export async function getMappingTableColumnById(projectId, tableId, columnId) {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      const tables = mockMappingTables[Number(projectId)] || [];
      const table = tables.find((t) => t.id === Number(tableId));
      const column = table?.columns?.find((c) => c.id === Number(columnId));
      if (!column) {
        throw new ApiError(404, `Column ${columnId} not found`);
      }
      return column;
    }
    const data = await apiClient.get(
      `/projects/${projectId}/mapping-tables/${tableId}/columns/${columnId}`,
    );
    return convertKeysToCamel(data);
  } catch (error) {
    console.warn("Backend request failed, using mock data:", error);
    const tables = mockMappingTables[Number(projectId)] || [];
    const table = tables.find((t) => t.id === Number(tableId));
    const column = table?.columns?.find((c) => c.id === Number(columnId));
    if (!column) {
      throw new ApiError(404, `Column ${columnId} not found`);
    }
    return column;
  }
}

/**
 * Создать колонку
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @param {{name: string, type: string, data_type: string, description?: string, is_calculated?: boolean, formula?: string|null}} data
 * @returns {Promise<MappingColumn>}
 */
export async function createMappingTableColumn(projectId, tableId, data) {
  const snakeData = convertKeysToSnake(data);
  const result = await apiClient.post(
    `/projects/${projectId}/mapping-tables/${tableId}/columns`,
    snakeData,
  );
  return convertKeysToCamel(result);
}

/**
 * Обновить колонку
 * @param {number|string} projectId
 * @param {number|string} tableId
 * @param {number|string} columnId
 * @param {{name?: string, type?: string, data_type?: string, description?: string, is_calculated?: boolean, formula?: string|null, rpi_mapping_id?: number|null}} data
 * @returns {Promise<MappingColumn>}
 */
export async function updateMappingTableColumn(
  projectId,
  tableId,
  columnId,
  data,
) {
  const snakeData = convertKeysToSnake(data);
  const result = await apiClient.patch(
    `/projects/${projectId}/mapping-tables/${tableId}/columns/${columnId}`,
    snakeData,
  );
  return convertKeysToCamel(result);
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
  try {
    const available = await isBackendAvailable();
    if (!available) {
      return mockRPIMappings[Number(projectId)] || [];
    }
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/projects/${projectId}/rpi-mappings?${queryString}`
      : `/projects/${projectId}/rpi-mappings`;
    const data = await apiClient.get(endpoint);
    return convertKeysToCamel(data);
  } catch (error) {
    console.warn("Backend request failed, using mock data:", error);
    return mockRPIMappings[Number(projectId)] || [];
  }
}

/**
 * Получить статистику RPI маппингов
 * @param {number|string} projectId
 * @returns {Promise<{total: number, approved: number, in_review: number, draft: number}>}
 */
export async function getRPIMappingsStats(projectId) {
  const data = await apiClient.get(`/projects/${projectId}/rpi-mappings/stats`);
  return convertKeysToCamel(data);
}

/**
 * Получить RPI маппинг по ID
 * @param {number|string} projectId
 * @param {number|string} rpiId
 * @returns {Promise<RPIMapping>}
 */
export async function getRPIMappingById(projectId, rpiId) {
  try {
    const available = await isBackendAvailable();
    if (!available) {
      const mappings = mockRPIMappings[Number(projectId)] || [];
      const mapping = mappings.find((m) => m.id === Number(rpiId));
      if (!mapping) {
        throw new ApiError(404, `RPI mapping ${rpiId} not found`);
      }
      return mapping;
    }
    const data = await apiClient.get(
      `/projects/${projectId}/rpi-mappings/${rpiId}`,
    );
    return convertKeysToCamel(data);
  } catch (error) {
    console.warn("Backend request failed, using mock data:", error);
    const mappings = mockRPIMappings[Number(projectId)] || [];
    const mapping = mappings.find((m) => m.id === Number(rpiId));
    if (!mapping) {
      throw new ApiError(404, `RPI mapping ${rpiId} not found`);
    }
    return mapping;
  }
}

/**
 * Создать RPI маппинг
 * @param {number|string} projectId
 * @param {{number: number, ownership: string, status: string, block: string, measurement_type: string, is_calculated?: boolean, formula?: string|null, measurement: string, measurement_description: string, source_report: string, object_field: string, source_column_id?: number|null, date_added: string, date_removed?: string|null, comment?: string|null, verification_file?: string|null}} data
 * @returns {Promise<RPIMapping>}
 */
export async function createRPIMapping(projectId, data) {
  const snakeData = convertKeysToSnake(data);
  const result = await apiClient.post(
    `/projects/${projectId}/rpi-mappings`,
    snakeData,
  );
  return convertKeysToCamel(result);
}

/**
 * Обновить RPI маппинг
 * @param {number|string} projectId
 * @param {number|string} rpiId
 * @param {{number?: number, ownership?: string, status?: string, block?: string, measurement_type?: string, is_calculated?: boolean, formula?: string|null, measurement?: string, measurement_description?: string, source_report?: string, object_field?: string, source_column_id?: number|null, date_added?: string, date_removed?: string|null, comment?: string|null, verification_file?: string|null}} data
 * @returns {Promise<RPIMapping>}
 */
export async function updateRPIMapping(projectId, rpiId, data) {
  const snakeData = convertKeysToSnake(data);
  const result = await apiClient.patch(
    `/projects/${projectId}/rpi-mappings/${rpiId}`,
    snakeData,
  );
  return convertKeysToCamel(result);
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
