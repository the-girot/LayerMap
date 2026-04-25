import AppLayout from "@/layout/AppLayout.vue";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ProjectsListView from "@/views/ProjectsListView.vue";
import ProjectDetailView from "@/views/ProjectDetailView.vue";
import RPIMappingView from "@/views/RPIMappingView.vue";
import SourceDetailView from "@/views/SourceDetailView.vue";

/**
 * Фабрика роутера с маршрутными защитниками.
 *
 * Все страницы проекта защищены — требуется аутентификация.
 *
 * @returns {import('vue-router').Router}
 */
export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory("/"),
    routes: [
      {
        path: "/login",
        name: "Login",
        component: () => import("@/views/LoginView.vue"),
      },
      {
        path: "/register",
        name: "Register",
        component: () => import("@/views/RegisterView.vue"),
      },
      {
        path: "/",
        name: "home",
        component: AppLayout,
        children: [
          {
            path: "",
            name: "Home",
            component: HomeView,
            meta: { requiresAuth: true },
          },
        ],
      },
      {
        path: "/projects",
        name: "projects",
        component: AppLayout,
        redirect: "/projects/list",
        meta: { requiresAuth: true },
        children: [
          {
            path: "list",
            name: "ProjectsList",
            component: ProjectsListView,
            meta: { requiresAuth: true },
          },
          {
            path: ":id",
            name: "ProjectDetail",
            component: ProjectDetailView,
            meta: { requiresAuth: true },
          },
          {
            path: ":id/mapping",
            name: "RPIMapping",
            component: RPIMappingView,
            meta: { requiresAuth: true },
          },
          {
            path: ":id/sources/:sourceId",
            name: "SourceDetail",
            component: SourceDetailView,
            meta: { requiresAuth: true },
          },
        ],
      },
    ],
  });

  /**
   * Глобальный guard для защиты маршрутов
   */
  router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("access_token");

    if (to.meta.requiresAuth && !token) {
      next({ name: "Login" });
    } else if ((to.name === "Login" || to.name === "Register") && token) {
      next({ name: "Home" });
    } else {
      next();
    }
  });

  return router;
}
