/**
 * Composable для получения проекта и projectId из route и store.
 * Устраняет дублирование логики во всех views.
 */
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useProjectsStore } from "@/stores/projects";

/**
 * @returns {{ projectId: import('vue').ComputedRef<string>, project: import('vue').ComputedRef<object|undefined> }}
 */
export function useProject() {
  const route = useRoute();
  const projectsStore = useProjectsStore();

  const projectId = computed(() => route.params.id);
  const project = computed(() => projectsStore.getProjectById(projectId.value));

  return { projectId, project };
}
