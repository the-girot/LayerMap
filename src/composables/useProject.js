/**
 * Composable для получения проекта и projectId из route и store.
 * Устраняет дублирование логики во всех views.
 */
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useProjectsStore } from "@/stores/projects";

/**
 * @returns {{ projectId: import('vue').ComputedRef<string>, project: import('vue').ComputedRef<object|undefined>, loadProjectData: Function, loading: import('vue').Ref<boolean>, error: import('vue').Ref<string|null> }}
 */
export function useProject() {
  const route = useRoute();
  const projectsStore = useProjectsStore();

  const projectId = computed(() => route.params.id);
  const project = computed(() => projectsStore.getProjectById(projectId.value));
  const loading = computed(() => projectsStore.loading);
  const error = computed(() => projectsStore.error);

  /**
   * Загрузить данные проекта из API
   */
  async function loadProjectData() {
    if (!projectId.value) return;
    await projectsStore.loadProjectData(projectId.value);
  }

  return {
    projectId,
    project,
    loadProjectData,
    loading,
    error,
  };
}
