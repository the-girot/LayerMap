# Разработка и конфигурация

## Команды запуска

```bash
# Development server (Vite, HMR)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# ESLint fix
npm run lint

# Prettier format
npm run format
```

## Конфигурация окружения

### Файлы конфигурации

| Файл | Назначение |
|------|-----------|
| `vite.config.mjs` | Plugins: vue, vueDevTools, Components(PrimeVueResolver). Alias: `@` → `src/`. optimizeDeps.noDiscovery: true |
| `tailwind.config.js` | Content: `./index.html, ./src/**/*.{vue,js,ts,jsx,tsx}`. Dark mode: `selector '[class="p-dark"]'`. Custom colors через CSS variables (`--app-*`) |
| `postcss.config.js` | Tailwind + Autoprefixer |
| `package.json` | Scripts: dev, build, preview, lint, format |

### Environment variables

Не используются. Нет `.env` файлов.

### Theme tokens

`src/assets/main.css` определяет CSS variables (`--app-bg`, `--app-surface`, `--app-text`, `--app-primary`, `--app-success`, `--app-warning`, `--app-error`, `--app-info`) для light/dark тем, маппинг на PrimeVue Aura variables.

---

## Ограничения и известные особенности

1. **Mock-only:** Все данные захардкожены в `projects.js`. Нет backend API, нет HTTP-запросов.
2. **Нет авторизации:** Все страницы доступны без аутентификации, router guards отсутствуют.
3. **localStorage для workflow:** Состояние workflow персистируется, но данные projects — нет (сбрасываются при перезагрузке).
4. **Нет тестового фреймворка:** Vitest/Vue Test Utils не установлены, тесты отсутствуют.
5. **Chart.js и xlsx-js-style** подключены как зависимости, но не используются в текущих views.
6. **Финансы, About, Dash** — пункты меню в AppTopbar без соответствующих routes (ведут на несуществующие страницы).
7. **Workflow не интегрирован в views:** `completeRPIForm` и другие actions workflow store не вызываются из views напрямую — workflow store существует, но views не блокируют доступ на его основе.

---

[← Назад к модели данных](../DATA_MODEL.md) | [Тестирование →](../testing/TESTING.md)
