# UI и стилизация

> Полный слой пользовательского интерфейса: компоненты PrimeVue, кастомные стили, CSS-токены, поддержка тёмной темы, layout-структура.

## Расположение в репозитории

- `src/assets/main.css` — Глобальные стили, CSS-переменные, тёмная тема
- `tailwind.config.js` — Tailwind-конфигурация с кастомной палитрой
- `postcss.config.js` — PostCSS с Tailwind и Autoprefixer
- `index.html` — HTML-вход с PrimeIcons CDN
- `src/layout/AppLayout.vue` — Основной layout приложения
- `src/layout/AppTopbar.vue` — Верхняя навигационная панель
- `src/components/` — Все компоненты (common/, home/, rpi/, workflow/)
- `src/views/` — Все страницы
- `src/main.js` — Инициализация PrimeVue с Aura-темой

## Как устроено

### Тематическая система

```
PrimeVue Aura (JS preset)
    │
    ▼
CSS-переменные :root (var(--p-*))
    │
    ▼
Semantic aliases (var(--app-*)) в main.css
    │
    ▼
Tailwind utilities (bg-app-surface, text-app-text, ...)
```

### Дизайн-токены (`src/assets/main.css`)

**Светлая тема (по умолчанию):**
```css
:root {
  --app-bg: var(--p-surface-50);
  --app-surface: var(--p-surface-0);
  --app-text: var(--p-surface-900);
  --app-primary: var(--p-primary-600);
  --app-success: var(--p-green-600);
  --app-warning: var(--p-amber-500);
  --app-error: var(--p-red-500);
  --app-info: var(--p-sky-600);
  /* ... ~20 переменных */
}
```

**Тёмная тема (`.p-dark`):**
```css
:root[class="p-dark"] {
  --app-bg: var(--p-surface-950);
  --app-surface: var(--p-surface-900);
  --app-text: var(--p-surface-0);
  /* ... inverted palette */
}
```

### Tailwind-кастомизация (`tailwind.config.js`)

- **Цвета:** `primary`, `surface`, `content`, `app-*` (semantic), `chart-1..5`
- **Шрифт:** `Inter`, `system-ui`, `sans-serif`
- **Скругления:** `sm: 6px`, `md: 8px`, `lg: 12px`
- **Тени:** `card: 0 1px 2px rgba(0,0,0,0.06)`, `hover: 0 4px 12px rgba(0,0,0,0.08)`
- **Плагин:** `tailwindcss-primeui` для PrimeVue-совместимости
- **Dark mode:** `["selector", '[class="p-dark"]']`

### Layout

```
App.vue
 └── Loading screen (если !authStore.isInitialized)
      └── RouterView
           ├── /login → LoginView (без AppLayout)
           ├── /register → RegisterView (без AppLayout)
           └── / → AppLayout
                ├── AppTopbar (Menubar + user info + date)
                └── RouterView (child routes)
```

**AppLayout (`src/layout/AppLayout.vue`):**
- Flex-контейнер с topbar и router-view
- Sidebar visibility сохраняется в localStorage
- `style="height: 90vh"` для основного контента

**AppTopbar (`src/layout/AppTopbar.vue`):**
- PrimeVue `Menubar` с пунктами: Solara, Проекты, Финансы, About, Dash
- Отображение `authStore.user.full_name`
- Кнопки "Войти"/"Выйти"/"Регистрация"
- Часы с обновлением каждую минуту

### Компоненты PrimeVue

| Компонент | Использование |
|-----------|---------------|
| `Menubar` | Верхняя навигация |
| `Button` | Кнопки действий |
| `DataTable` + `Column` | Таблицы данных (проекты, РПИ, колонки) |
| `Dialog` | Модальные окна создания/редактирования |
| `Select` | Выпадающие списки |
| `InputText` | Текстовые поля |
| `Textarea` | Многострочный ввод |
| `Badge` | Статусные бейджи |
| `Message` | Сообщения об ошибках |
| `Toast` | Уведомления |
| `Panel` | Боковые панели |

### Диалоги (диаграмма)

```mermaid
graph TD
    A[CreateProjectDialog] -->|@saved| B[HomeView]
    C[CreateSourceDialog] -->|@saved| D[ProjectDetailView]
    E[CreateMappingTableDialog] -->|@saved| D
    F[CreateMappingColumnDialog] -->|@saved| G[SourceDetailView]
    H[CreateRPIMappingDialog] -->|@saved| G
    I[RPIMappingPanel] -->|@saved| J[RPIMappingView]
```

## Ключевые сущности

- **`main.css`** — ~165 строк CSS-переменных, стили скроллбара, базовый сброс
- **`tailwind.config.js`** — полная конфигурация темы (~114 строк)
- **`index.html`** — CDN-подключение PrimeIcons 7.0.0
- **`AppLayout.vue`** — основной layout (topbar + content)
- **`AppTopbar.vue`** — навигация и пользовательский интерфейс

## Как использовать / запустить

```bash
# Стили применяются автоматически через main.css (импорт в main.js)
# PrimeVue-компоненты регистрируются через unplugin-vue-components

# Пример использования семантических цветов в компоненте:
```
```vue
<div class="bg-app-surface border border-app-border rounded-lg p-4">
  <p class="text-app-text">Контент</p>
  <p class="text-app-text-muted">Второстепенный текст</p>
</div>
```

## Связи с другими доменами

- [auth.md](auth.md) — AppTopbar отображает/скрывает элементы в зависимости от `authStore.isAuthenticated`
- [api.md](api.md) — `ApiStatusIndicator.vue` использует `useApiStatus` композабл
- [projects.md](projects.md) — компоненты KpiCards, ProjectsTable, QuickActions отображают данные проектов
- [sources.md](sources.md) — компоненты создания источников, таблиц, колонок
- [rpi-mappings.md](rpi-mappings.md) — компоненты RPIMappingHeader/Toolbar/Table/Panel
- [workflow.md](workflow.md) — StepIndicator.vue отображает прогресс воркфлоу
- [config.md](config.md) — Vite-конфигурация, плагин PrimeVue Resolver

## Нюансы и ограничения

- PrimeIcons подключаются через CDN в `index.html` — есть внешняя зависимость от `unpkg.com`.
- Используется `@primeuix/themes` (Aura) — это тема следующего поколения, не путать с PrimeVue 3 themes.
- `tailwind.config.js` содержит маппинги `var(--app-*)` для Tailwind v3 — при обновлении до v4 потребуется миграция.
- Скроллбар стилизован через `::-webkit-scrollbar` и `scrollbar-width: thin` — на Firefox будет выглядеть иначе.
- `Sidebar visibility` сохраняется в `localStorage` — может быть неожиданностью для пользователя.
