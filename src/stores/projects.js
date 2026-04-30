/**
 * Projects Store — CRUD проектов, KPI и оркестрация загрузки всех данных проекта.
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
 * @property {string} created_at
 * @property {string} updated_at
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
 * @property {number|null} [rpi_mapping_id]
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
import { ProjectsApi } from "@/api/projects";
import { ApiError } from "@/api/client";
import { useAuthStore } from "@/stores/auth";
import { useSourcesStore } from "@/stores/sources";
import { useMappingTablesStore } from "@/stores/tables";
import { useRPIMappingsStore } from "@/stores/rpiMappings";

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

export const useProjectsStore = defineStore("projects", () => {
  /** @type {import('vue').Ref<Project[]>} */
  const projects = ref([]);

  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false);

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null);

  /** KPI проектов (ключи по projectId) */
  const projectKpi = ref({});

  /** Пагинация проектов */
  const projectPagination = ref({ total: 0, page: 1, size: 10 });

  // ─── Computed ──────────────────────────────────────────────────

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
    if (!projects.value.length) return "—";
    const dates = projects.value.map((p) => new Date(p.updated_at));
    const maxDate = new Date(Math.max(...dates));
    if (isNaN(maxDate.getTime())) return "—";
    return maxDate.toLocaleDateString("ru-RU");
  });

  // ─── Getters ───────────────────────────────────────────────────

  /**
   * Получить проект по ID.
   * @param {number|string} id
   * @returns {Project|undefined}
   */
  function getProjectById(id) {
    return projects.value.find((p) => p.id === Number(id));
  }

  // ─── Actions ───────────────────────────────────────────────────

  /**
   * Загрузить все проекты с фильтрами и пагинацией
   * @param {Object} [options]
   * @param {string} [options.status]
   * @param {string} [options.search]
   * @param {number} [options.page=1]
   * @param {number} [options.size=10]
   * @param {string} [options.sort_by]
   * @param {'asc'|'desc'} [options.sort_dir='asc']
   */
  async function loadProjects({
    status,
    search,
    page = 1,
    size = 10,
    sort_by,
    sort_dir = "asc",
  } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const data = await ProjectsApi.getProjectsWithFilters({
        status,
        search,
        page,
        size,
        sort_by,
        sort_dir,
      });
      projects.value = data.data || data;
      projectPagination.value = {
        total: data.total || projects.value.length,
        page: data.page || page,
        size: data.size || size,
      };
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Загрузить KPI проекта
   * @param {number|string} projectId
   */
  async function loadProjectKpi(projectId) {
    loading.value = true;
    error.value = null;
    try {
      const kpiData = await ProjectsApi.getProjectKpi(parseInt(projectId));
      projectKpi.value[projectId] = kpiData;
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Загрузить данные для конкретного проекта (проект + источники + таблицы + РПИ).
   * Оркестрирует вызовы в sub-stores.
   * @param {number|string} projectId
   */
  async function loadProjectData(projectId) {
    loading.value = true;
    error.value = null;
    const errors = [];

    // Load each resource independently so a single 500 doesn't kill the whole page
    let project = null;
    let projectSources = [];
    let projectRpi = [];

    try {
      project = await ProjectsApi.getProjectById(projectId);
    } catch (err) {
      errors.push({ resource: 'project', err });
    }

    try {
      projectSources = await ProjectsApi.getSources(projectId);
    } catch (err) {
      errors.push({ resource: 'sources', err });
    }

    try {
      projectRpi = await ProjectsApi.getRPIMappings(projectId);
    } catch (err) {
      errors.push({ resource: 'rpi-mappings', err });
    }

    // Populate project store if we got project data
    if (project) {
      const index = projects.value.findIndex((p) => p.id === project.id);
      if (index !== -1) {
        projects.value[index] = { ...project, id: Number(project.id) };
      } else {
        projects.value.push({ ...project, id: Number(project.id) });
      }
    }

    // Populate sub-stores with whatever we managed to load
    const sourcesStore = useSourcesStore();
    const tablesStore = useMappingTablesStore();
    const rpiStore = useRPIMappingsStore();

    if (projectSources.length) {
      sourcesStore.sources[projectId] = projectSources;
    }

    if (projectRpi.length) {
      rpiStore.rpiMappings[projectId] = projectRpi;
    }

    // Load mapping tables for each source independently
    const tableResults = await Promise.allSettled(
      projectSources.map((source) =>
        ProjectsApi.getMappingTables(projectId, source.id),
      ),
    );
    const allTables = [];
    tableResults.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        result.value.forEach((t) =>
          allTables.push({ ...t, source_id: projectSources[i].id }),
        );
      } else {
        errors.push({ resource: `tables/source/${projectSources[i].id}`, err: result.reason });
      }
    });
    if (allTables.length) {
      tablesStore.mappingTables[projectId] = allTables;
    }

    // If all critical resources failed, show an error
    if (!project && !projectSources.length) {
      error.value = "Не удалось загрузить данные проекта";
    }

    // Log errors to console for debugging
    if (errors.length) {
      console.warn(`[loadProjectData] ${errors.length} sub-request(s) failed:`,
        errors.map((e) => `${e.resource}: ${e.err.message || e.err}`));
    }

    loading.value = false;
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
      projects.value.push({ ...newProject, id: Number(newProject.id) });
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
      const updated = await ProjectsApi.updateProject(
        parseInt(projectId),
        data,
      );
      const index = projects.value.findIndex(
        (p) => p.id === parseInt(projectId),
      );
      if (index !== -1) {
        projects.value[index] = updated;
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
   * Удалить проект
   * @param {number|string} projectId
   * @returns {Promise<void>}
   */
  async function deleteProject(projectId) {
    loading.value = true;
    error.value = null;
    try {
      await ProjectsApi.deleteProject(parseInt(projectId));
      projects.value = projects.value.filter(
        (p) => p.id !== parseInt(projectId),
      );
    } catch (err) {
      handleApiError(error, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    projects,
    loading,
    error,
    projectKpi,
    projectPagination,

    // Computed
    totalSources,
    totalRpi,
    lastUpdateDate,

    // Getters
    getProjectById,

    // Actions
    loadProjects,
    loadProjectKpi,
    loadProjectData,
    createProject,
    updateProject,
    deleteProject,
  };
});
