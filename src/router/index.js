import AppLayout from "@/layout/AppLayout.vue";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ProjectsListView from "@/views/ProjectsListView.vue";
import ProjectDetailView from "@/views/ProjectDetailView.vue";
import RPIMappingView from "@/views/RPIMappingView.vue";
import SourceDetailView from "@/views/SourceDetailView.vue";

/**
 * Фабрика роутера без маршрутных защитников.
 *
 * Все страницы проекта доступны свободно — РПИ и источники данных
 * являются независимыми страницами без блокировок.
 *
 * @returns {import('vue-router').Router}
 */
export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory("/"),
    routes: [
      {
        path: "/",
        name: "home",
        component: AppLayout,
        children: [
          {
            path: "",
            name: "Home",
            component: HomeView,
          },
        ],
      },
      {
        path: "/projects",
        name: "projects",
        component: AppLayout,
        redirect: "/projects/list",
        children: [
          {
            path: "list",
            name: "ProjectsList",
            component: ProjectsListView,
          },
          {
            path: ":id",
            name: "ProjectDetail",
            component: ProjectDetailView,
          },
          {
            path: ":id/mapping",
            name: "RPIMapping",
            component: RPIMappingView,
          },
          {
            path: ":id/sources/:sourceId",
            name: "SourceDetail",
            component: SourceDetailView,
          },
        ],
      },
    ],
  });

  return router;
}
