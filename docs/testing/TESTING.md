# Тестирование

## Unit (не реализовано, нет test framework)

- `projects.js`: CRUD операции (add/update/delete MappingTable, Column, RPIMapping)
- `workflow.js`: completeRPIForm → isProjectUnlocked = true, completeTablesStep → COLUMNS = ACTIVE
- `format.js`: formatDate(null) → "—", formatNumber(1000) → "1 000"
- `status.js`: getMappingStatusLabel('approved') → "Утверждено"

## Integration (ручные сценарии)

### 1. Создание РПИ-записи

RPIMappingView → "Добавить запись" → заполнить form → "Сохранить" → запись появляется в DataTable

### 2. Создание таблицы маппинга

RPIMappingView → "Добавить таблицу" → Dialog → имя + описание → "Создать" → таблица появляется в списке

### 3. Добавление колонки

Кнопка "+" на таблице → Dialog → имя + type (metric/dimension) + dataType → "Добавить" → колонка появляется с цветным badge

### 4. Маппинг колонки на РПИ

SourceDetailView → Select → выбор РПИ → статус меняется на "Связано"

### 5. Фильтрация РПИ

RPIMappingView → search input → фильтрация по measurement/objectField/source → quick filter chips (Метрики/Измерения)

### 6. Пагинация

RPIMappingView → Paginator → переключение страниц, rowsPerPageOptions [10, 20, 50]

### 7. Workflow

completeRPIForm → разблокировка tables step → completeTablesStep → разблокировка columns step

### 8. localStorage persistence

Перезагрузка страницы → workflow state восстанавливается из localStorage

### 9. Responsive

Mobile < 768px → ProjectsTable переключается на Card grid

### 10. Dark mode

Добавление класса `p-dark` на `<html>` → переключение CSS variables

---

[← Назад к разработке](../guides/DEVELOPMENT.md)
