/**
 * Sources Store — CRUD источников данных с API интеграцией.
 *
 * @typedef {import('./projects').Source} Source
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

export const useSourcesStore = defineStore("sources", () => {
  /** @type {import('vue').Ref<Record<number, import('./projects').Source[]>>} */
  const sources = ref({});

  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false);

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null);

  // ─── Internal helpers ───────────────────────────────────────────

  /**
   * @param {number|string} projectId
   * @returns {import('./projects').Source[]}
   */
  function getSourcesByProjectId(projectId) {
    return sources.value[projectId] || [];
  }

  /**
   * @param {number|string} projectId
   * @param {number|string} sourceId
   * @returns {import('./projects').Source|undefined}
   */
  function getSourceById(projectId, sourceId) {
    return getSourcesByProjectId(projectId).find(
      (s) => s.id === Number(sourceId),
    );
  }

  /**
   * @param {number|string} projectId
   * @param {string} sourceName
   * @returns {import('./projects').Source|undefined}
   */
  function getProjectSourceByProjectIdAndName(projectId, sourceName) {
    return getSourcesByProjectId(projectId).find((s) => s.name === sourceName);
  }

  // ─── Actions ────────────────────────────────────────────────────

  /**
   * Загрузить источники проекта
   * @param {number|string} projectId
   */
  async function loadSources(projectId) {
    loading.value = true;
    error.value = null;
    try {
      const data = await ProjectsApi.getSources(projectId);
      sources.value[projectId] = data;
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Создать источник
   * @param {number|string} projectId
   * @param {{name: string, description?: string, type: string, row_count?: number, mapping_table_id?: number|null}} data
   * @returns {Promise<import('./projects').Source>}
   */
  async function createSource(projectId, data) {
    loading.value = true;
    error.value = null;
    try {
      const newSource = await ProjectsApi.createSource(
        parseInt(projectId),
        data,
      );
      if (!sources.value[projectId]) {
        sources.value[projectId] = [];
      }
      sources.value[projectId].push(newSource);
      return newSource;
    } catch (err) {
      handleApiError(error, err);
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
   * @returns {Promise<import('./projects').Source>}
   */
  async function updateSource(projectId, sourceId, data) {
    loading.value = true;
    error.value = null;
    try {
      const updated = await ProjectsApi.updateSource(
        parseInt(projectId),
        parseInt(sourceId),
        data,
      );
      const sourcesList = sources.value[projectId];
      if (sourcesList) {
        const index = sourcesList.findIndex((s) => s.id === parseInt(sourceId));
        if (index !== -1) {
          sourcesList[index] = updated;
        }
      }
      return updated;
    } catch (err) {
      handleApiError(error, err);
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
      await ProjectsApi.deleteSource(parseInt(projectId), parseInt(sourceId));
      const sourcesList = sources.value[projectId];
      if (sourcesList) {
        sources.value[projectId] = sourcesList.filter(
          (s) => s.id !== parseInt(sourceId),
        );
      }
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    sources,
    loading,
    error,

    // Getters
    getSourcesByProjectId,
    getSourceById,
    getProjectSourceByProjectIdAndName,

    // Actions
    loadSources,
    createSource,
    updateSource,
    deleteSource,
  };
});
