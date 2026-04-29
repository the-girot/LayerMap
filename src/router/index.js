import AppLayout from "@/layout/AppLayout.vue";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ProjectsListView from "@/views/ProjectsListView.vue";
import ProjectDetailView from "@/views/ProjectDetailView.vue";
import RPIMappingView from "@/views/RPIMappingView.vue";

import TableDetailView from '@/views/TableDetailView.vue';
import { useAuthStore } from "../stores/auth.js";

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
        meta: { requiresAuth: false, public: true },
      },
      {
        path: "/register",
        name: "Register",
        component: () => import("@/views/RegisterView.vue"),
        meta: { requiresAuth: false },
      },
      {
        path: "/",
        component: AppLayout,
        children: [
          {
            path: "",
            name: "Home",
            component: HomeView,
            meta: { requiresAuth: true },
          },
          {
            path: "projects",
            redirect: { name: "ProjectsList" },
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
                meta: { requiresAuth: true },
                children:[
                  {
                    path: 'tables/:tableId',
                    name: 'TableDetail',
                    component: TableDetailView,
                    meta: { requiresAuth: true },
                  }
                ]
              },
            ],
          },
        ],
      },
    ],
  });

  /**
   * Глобальный guard для защиты маршрутов
   */
  router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    // Ждём инициализации, если loadUser ещё не завершился
    if (!authStore.isInitialized) {
      await authStore.loadUser();
    }

    const isPublic = to.name === "Login" || to.name === "Register";

    // Авторизованный пользователь не должен попадать на login/register
    if (isPublic) {
      return authStore.isAuthenticated ? { name: "Home" } : true;
    }

    // Защищённый маршрут — редирект на login если не авторизован
    if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
      return { path: "/login", query: { redirect: to.fullPath } };
    }

    return true;
  });

  return router;
}
