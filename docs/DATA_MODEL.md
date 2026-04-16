# Модель данных

## Project

```ts
{
  id: number,
  name: string,
  description: string,
  sources: number,
  rpiRecords: number,
  approved: number,
  drafts: number,
  inReview: number,
  updatedAt: string
}
```

## Source

```ts
{
  id: number,
  name: string,
  description: string,
  type: string,
  rowCount: number,
  lastUpdated: string
}
```

## MappingTable

```ts
{
  id: number,
  name: string,
  description: string,
  columns: Column[]
}
```

## Column

```ts
{
  id: number,
  name: string,
  type: 'metric' | 'dimension',
  isCalculated: boolean,  // false = базовый, true = расчетный
  formula: string | null,  // формула для расчетных показателей/измерений
  dataType: string,
  description: string,
  rpiMappingId: number | null
}
```

## RPIMapping

```ts
{
  id: number,
  number: number,
  projectId: number,
  ownership: string,
  status: 'approved' | 'review' | 'draft',
  source: string,
  block: string,
  measurementType: 'Измерение' | 'Метрика',
  isCalculated: boolean,   // false = базовый, true = расчетный
  formula: string | null,  // формула для расчетных показателей/измерений
  measurement: string,
  measurementDescription: string,
  sourceReport: string,
  objectField: string,
  sourceColumnId: number | null,  // Жесткая связь с колонкой источника
  dateAdded: string,
  dateRemoved: string | null,
  comment: string,
  verificationFile: string | null
}
```

## WorkflowState

```ts
{
  projectId: number,
  steps: {
    [stepId]: {
      status: 'locked' | 'active' | 'completed',
      completedAt: number | null,
      data: any
    }
  },
  isProjectLocked: boolean,
  rpiEntityId: number | null,
  isSubmitting: boolean,
  validationError: string | null,
  updatedAt: number
}
```

---

[← Назад к компонентам](./components/COMPONENTS.md) | [Разработка →](./guides/DEVELOPMENT.md)
