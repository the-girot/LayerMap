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
    try {
      const [project, projectSources, projectRpi] = await Promise.all([
        ProjectsApi.getProjectById(projectId),
        ProjectsApi.getSources(projectId),
        ProjectsApi.getRPIMappings(projectId),
      ]);

      const index = projects.value.findIndex((p) => p.id === project.id);
      if (index !== -1) {
        projects.value[index] = { ...project, id: Number(project.id) };
      } else {
        projects.value.push({ ...project, id: Number(project.id) });
      }

      // Populate sub-stores
      const sourcesStore = useSourcesStore();
      const tablesStore = useMappingTablesStore();
      const rpiStore = useRPIMappingsStore();

      sourcesStore.sources[projectId] = projectSources;
      rpiStore.rpiMappings[projectId] = projectRpi;

      const tablesPerSource = await Promise.all(
        projectSources.map((source) =>
          ProjectsApi.getMappingTables(projectId, source.id)
            .then((tables) =>
              tables.map((t) => ({ ...t, source_id: source.id })),
            )
            .catch(() => []),
        ),
      );
      tablesStore.mappingTables[projectId] = tablesPerSource.flat();
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
