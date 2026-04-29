<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Message from 'primevue/message'

import { useProjectsStore } from '@/stores/projects'
import { useSourcesStore } from '@/stores/sources'
import { useMappingTablesStore } from '@/stores/tables'
import { useRPIMappingsStore } from '@/stores/rpiMappings'
import { useProject } from '@/composables/useProject'
import { formatDate } from '@/utils/format'
import { MEASUREMENT_TYPE_MAP } from '@/constants/rpi'

const route  = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const sourcesStore  = useSourcesStore()
const tablesStore   = useMappingTablesStore()
const rpiStore      = useRPIMappingsStore()

const { projectId, project, loadProjectData, loading, error } = useProject()

const sourceId = computed(() => route.params.sourceId ? Number(route.params.sourceId) : null)
const tableId  = computed(() => route.params.tableId  ? Number(route.params.tableId)  : null)

// ─── Data ────────────────────────────────────────────────────────
const source = computed(() =>
  sourcesStore.getSourcesByProjectId?.(projectId.value)?.find(s => s.id === sourceId.value) ?? null
)
const mappingTables = computed(() =>
  tablesStore.getMappingTablesByProjectId?.(projectId.value) ?? []
)
const table   = computed(() => mappingTables.value.find(t => t.id === tableId.value) ?? null)
const columns = computed(() => table.value?.columns ?? [])
const rpiMappings = computed(() =>
  rpiStore.getRPIMappingsByProjectId?.(projectId.value) ?? []
)
const tableRpiMappings = computed(() => {
  const rpiIds = new Set([
    ...columns.value.map(c => c.rpi_dimension_id),
    ...columns.value.map(c => c.rpi_metric_id),
  ])
  rpiIds.delete(null)
  rpiIds.delete(undefined)
  return rpiMappings.value.filter(r => rpiIds.has(r.id))
})

// ─── Stats ───────────────────────────────────────────────────────
const mappedCount    = computed(() => columns.value.filter(c => c.rpi_dimension_id || c.rpi_metric_id).length)
const indicatorCount = computed(() => tableRpiMappings.value.filter(r => r.measurement_type === 'metric').length)

// ─── Edit column dialog ──────────────────────────────────────────
const showEditDialog = ref(false)
const editingColumn  = ref(null)
const editForm = ref({ name: '', type: 'dimension', data_type: '', description: '', is_calculated: false, formula: null })

const DATA_TYPES = [
  { label: 'Строка (string)',         value: 'string' },
  { label: 'Целое (integer)',         value: 'integer' },
  { label: 'Дробное (float)',         value: 'float' },
  { label: 'Да/Нет (boolean)',        value: 'boolean' },
  { label: 'Дата (date)',             value: 'date' },
  { label: 'Дата и время (datetime)', value: 'datetime' },
]

const COLUMN_TYPES = [
  { label: 'Измерение',  value: 'dimension' },
  { label: 'Показатель', value: 'metric' },
]

function openEditColumn(col) {
  editingColumn.value = col
  editForm.value = {
    name:          col.name          ?? '',
    type:          col.type          ?? 'dimension',
    data_type:     col.data_type     ?? '',
    description:   col.description   ?? '',
    is_calculated: col.is_calculated ?? false,
    formula:       col.formula       ?? null,
  }
  showEditDialog.value = true
}

async function saveColumn() {
  if (!editingColumn.value || !tableId.value) return
  const payload = {
    name:          editForm.value.name,
    type:          editForm.value.type,
    data_type:     editForm.value.data_type,
    description:   editForm.value.description,
    is_calculated: editForm.value.is_calculated,
    formula:       editForm.value.is_calculated ? editForm.value.formula : null,
  }
  await tablesStore.updateMappingTableColumn(projectId.value, sourceId.value, tableId.value, editingColumn.value.id, payload)
  showEditDialog.value = false
}

// ─── Add column dialog ───────────────────────────────────────────
const showAddDialog = ref(false)
const addForm    = ref({ name: '', data_type: '', description: '', is_calculated: false })
const addLoading = ref(false)

async function addColumn() {
  if (!addForm.value.name || !tableId.value) return
  addLoading.value = true
  try {
    await tablesStore.createMappingTableColumn(projectId.value, sourceId.value, tableId.value, {
      name:          addForm.value.name,
      type:          'dimension',
      data_type:     addForm.value.data_type,
      description:   addForm.value.description,
      is_calculated: addForm.value.is_calculated,
      formula:       null,
    })
    showAddDialog.value = false
    addForm.value = { name: '', data_type: '', description: '', is_calculated: false }
  } finally {
    addLoading.value = false
  }
}

// ─── RPI inline select ───────────────────────────────────────────
const rpiOptions = computed(() =>
  rpiStore.getRPIMappingOptions?.(projectId.value) ?? []
)

const metricRpiOptions = computed(() =>
  rpiOptions.value.filter(o => o.measurement_type === 'metric')
)

const dimensionRpiOptions = computed(() =>
  rpiOptions.value.filter(o => o.measurement_type === 'dimension')
)

function onColumnMappingChange(column, newValue, field) {
  tablesStore.updateColumnRPIMapping?.(projectId.value, sourceId.value, tableId.value, column.id, newValue, field)
}

function getRPIInfo(rpiMappingId) {
  return rpiMappings.value.find(m => m.id === rpiMappingId) ?? null
}

// ─── Delete column ───────────────────────────────────────────────
async function deleteColumn(col) {
  if (!tableId.value) return
  await tablesStore.deleteMappingTableColumn(projectId.value, sourceId.value, tableId.value, col.id)
}

// ─── Navigation ──────────────────────────────────────────────────
function goBack() {
  if (sourceId.value) {
    router.push({ name: 'SourceDetail', params: { id: projectId.value, sourceId: sourceId.value } })
  } else {
    router.push({ name: 'ProjectDetail', params: { id: projectId.value } })
  }
}

onMounted(async () => {
  if (projectId.value) await loadProjectData()
})
</script>

<template>
  <div class="p-0 pe-4">

    <!-- Loading -->
    <div v-if="loading" class="flex min-h-screen items-center justify-center bg-gray-50">
      <i class="pi pi-spin pi-spinner text-4xl text-teal-500" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-16 text-center">
      <i class="pi pi-exclamation-circle text-5xl text-red-400" />
      <h2 class="mt-4 text-xl font-semibold text-gray-800">Ошибка загрузки</h2>
      <p class="mt-2 text-sm text-gray-500">{{ error }}</p>
      <Button
        label="Повторить"
        icon="pi pi-refresh"
        class="mt-4 !rounded-lg !bg-teal-500 !border-teal-500 hover:!bg-teal-600 hover:!border-teal-600"
        @click="loadProjectData"
      />
    </div>

    <!-- Main -->
    <div v-else-if="table && project" class="min-h-screen bg-gray-50 p-4 md:p-6">

      <!-- Breadcrumbs -->
      <nav class="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <router-link
          :to="{ name: 'ProjectsList' }"
          class="flex items-center gap-1 text-teal-600 transition-colors hover:text-teal-700"
        >
          <i class="pi pi-home text-xs" />
          <span>Проекты</span>
        </router-link>
        <span>&gt;</span>
        <router-link
          :to="{ name: 'ProjectDetail', params: { id: projectId } }"
          class="text-teal-600 transition-colors hover:text-teal-700"
        >
          {{ project.name }}
        </router-link>
        <template v-if="source">
          <span>&gt;</span>
          <router-link
            :to="{ name: 'SourceDetail', params: { id: projectId, sourceId } }"
            class="text-teal-600 transition-colors hover:text-teal-700"
          >
            {{ source.name }}
          </router-link>
        </template>
        <span>&gt;</span>
        <span class="font-medium text-gray-900">{{ table.name }}</span>
      </nav>

      <!-- Stats Cards -->
      <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div class="rounded-lg bg-white p-4 shadow-sm">
          <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Всего колонок</div>
          <div class="text-2xl font-semibold text-gray-900">{{ columns.length }}</div>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm">
          <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Привязано к РПИ</div>
          <div class="text-2xl font-semibold text-gray-900">{{ mappedCount }}</div>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm">
          <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Показателей</div>
          <div class="text-2xl font-semibold text-gray-900">{{ indicatorCount }}</div>
        </div>
        <div class="rounded-lg bg-white p-4 shadow-sm">
          <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Создана</div>
          <div class="text-lg font-semibold text-gray-900">{{ formatDate(table.created_at) }}</div>
          <div v-if="table.updated_at" class="mt-0.5 text-xs text-gray-400">
            обн. {{ formatDate(table.updated_at) }}
          </div>
        </div>
      </div>

      <!-- Columns Section -->
      <section class="rounded-lg bg-white p-6 shadow-sm">

        <!-- Section Header -->
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="pi pi-bars text-lg text-gray-600" />
            <h2 class="text-lg font-medium text-gray-900">Колонки и маппинг показателей</h2>
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-xs text-white">
              {{ columns.length }}
            </span>
          </div>
          <Button
            label="Добавить колонку"
            icon="pi pi-plus"
            class="!rounded-lg !bg-teal-500 !border-teal-500 hover:!bg-teal-600 hover:!border-teal-600"
            @click="showAddDialog = true"
          />
        </div>

        <Message v-if="columns.length === 0" severity="info" :closable="false">
          У этой таблицы пока нет колонок. Добавьте первую, чтобы настроить маппинг с РПИ.
        </Message>

        <div v-else class="overflow-hidden rounded-lg border border-gray-100">
          <DataTable
            :value="columns"
            class="w-full"
            responsive-layout="scroll"
            :paginator="columns.length > 15"
            :rows="15"
            :rows-per-page-options="[10, 15, 25, 50]"
            empty-message="Нет колонок"
          >
            <!-- № -->
            <Column header="№" style="width: 52px">
              <template #body="{ index }">
                <span class="text-sm text-gray-500">{{ index + 1 }}</span>
              </template>
            </Column>

            <!-- Название -->
            <Column field="name" header="Название" style="min-width: 180px">
              <template #body="{ data }">
                <div class="font-mono text-sm font-semibold text-gray-900">{{ data.name || '—' }}</div>
              </template>
            </Column>

            <!-- Тип данных -->
            <Column field="data_type" header="Тип данных" style="min-width: 180px">
              <template #body="{ data }">
                <Select
                  v-model="data.data_type"
                  :options="DATA_TYPES"
                  option-label="label"
                  option-value="value"
                  placeholder="—"
                  show-clear
                  size="small"
                  class="w-full"
                  :pt="{
                    root: { class: '!rounded-lg' },
                    label: { class: '!text-sm !text-gray-600' },
                  }"
                  editable
                />
              </template>
            </Column>

            <!-- Описание -->
            <Column field="description" header="Описание" style="min-width: 180px">
              <template #body="{ data }">
                <span class="text-sm text-gray-400">{{ data.description || '—' }}</span>
              </template>
            </Column>

            <!-- Измерение (dimension) -->
            <Column header="Измерение РПИ" style="min-width: 220px">
              <template #body="{ data }">
                <Select
                  v-model="data.rpi_dimension_id"
                  :options="dimensionRpiOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Не выбрано…"
                  show-clear
                  filter
                  size="small"
                  class="w-full"
                  :pt="{
                    root: { class: '!rounded-lg' },
                    label: { class: '!text-sm !text-gray-600' },
                  }"
                  @change="onColumnMappingChange(data, $event.value, 'rpi_dimension_id')"
                />
              </template>
            </Column>

            <!-- Показатель (metric) -->
            <Column header="Показатель РПИ" style="min-width: 220px">
              <template #body="{ data }">
                <Select
                  v-model="data.rpi_metric_id"
                  :options="metricRpiOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Не выбрано…"
                  show-clear
                  filter
                  size="small"
                  class="w-full"
                  :pt="{
                    root: { class: '!rounded-lg' },
                    label: { class: '!text-sm !text-gray-600' },
                  }"
                  @change="onColumnMappingChange(data, $event.value, 'rpi_metric_id')"
                />
              </template>
            </Column>

            <!-- Действия -->
            <Column style="width: 80px">
              <template #body="{ data }">
                <div class="flex items-center gap-1">
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    severity="secondary"
                    size="small"
                    title="Редактировать"
                    @click="openEditColumn(data)"
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    size="small"
                    title="Удалить"
                    @click="deleteColumn(data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </section>

      <!-- RPI Mappings Section -->
      <section v-if="tableRpiMappings.length > 0" class="mt-6 rounded-lg bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center gap-2">
          <i class="pi pi-sitemap text-lg text-gray-600" />
          <h2 class="text-lg font-medium text-gray-900">РПИ маппинги таблицы</h2>
          <span class="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-xs text-white">
            {{ tableRpiMappings.length }}
          </span>
        </div>

        <div class="overflow-hidden rounded-lg border border-gray-100">
          <DataTable
            :value="tableRpiMappings"
            class="w-full"
            responsive-layout="scroll"
            :paginator="tableRpiMappings.length > 10"
            :rows="10"
            :rows-per-page-options="[5, 10, 20]"
            empty-message="Нет маппингов"
          >
            <Column field="number" header="№ РПИ" style="min-width: 80px">
              <template #body="{ data }">
                <span class="font-mono text-sm font-bold text-teal-600">{{ data.number }}</span>
              </template>
            </Column>

            <Column field="measurement" header="Показатель" style="min-width: 180px">
              <template #body="{ data }">
                <span class="text-sm font-medium text-gray-900">{{ data.measurement }}</span>
              </template>
            </Column>

            <Column field="measurement_type" header="Тип" style="min-width: 110px">
              <template #body="{ data }">
                <Badge
                  :value="MEASUREMENT_TYPE_MAP[data.measurement_type] ?? data.measurement_type"
                  :severity="data.measurement_type === 'metric' ? 'info' : 'success'"
                  :pt="{ root: 'text-[10px]' }"
                />
              </template>
            </Column>

            <Column field="object_field" header="Поле объекта" style="min-width: 160px">
              <template #body="{ data }">
                <span class="font-mono text-sm font-bold text-teal-600">{{ data.object_field }}</span>
              </template>
            </Column>

            <Column field="status" header="Статус" style="min-width: 120px">
              <template #body="{ data }">
                <span :class="[
                  'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold',
                  data.status === 'approved' ? 'border border-green-200 bg-green-50 text-green-700'
                  : data.status === 'review'  ? 'border border-yellow-200 bg-yellow-50 text-yellow-700'
                  : 'border border-gray-200 bg-gray-50 text-gray-500'
                ]">
                  <span :class="[
                    'h-1 w-1 rounded-full',
                    data.status === 'approved' ? 'bg-green-500'
                    : data.status === 'review' ? 'bg-yellow-500' : 'bg-gray-400'
                  ]" />
                  {{ data.status === 'approved' ? 'Утверждён' : data.status === 'review' ? 'На проверке' : 'Черновик' }}
                </span>
              </template>
            </Column>

            <Column field="comment" header="Комментарий" style="min-width: 180px">
              <template #body="{ data }">
                <span class="text-xs text-gray-400">{{ data.comment || '—' }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </section>
    </div>

    <!-- Not found -->
    <div v-else class="flex flex-col items-center justify-center bg-gray-50 py-16 text-center">
      <i class="pi pi-exclamation-circle text-5xl text-gray-300" />
      <h2 class="mt-4 text-xl font-semibold text-gray-800">Таблица не найдена</h2>
      <Button
        label="Назад"
        icon="pi pi-arrow-left"
        class="mt-4 !rounded-lg !bg-teal-500 !border-teal-500 hover:!bg-teal-600 hover:!border-teal-600"
        @click="goBack"
      />
    </div>

    <!-- Edit Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      header="Редактирование колонки"
      modal
      :style="{ width: '520px' }"
      :pt="{
        root: '!rounded-2xl',
        header: 'border-b border-gray-100',
        footer: 'border-t border-gray-100',
      }"
    >
      <div class="space-y-4 py-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Название</label>
          <InputText
            v-model="editForm.name"
            placeholder="column_name"
            class="w-full rounded-lg font-mono"
            size="small"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Тип колонки</label>
          <Select
            v-model="editForm.type"
            :options="COLUMN_TYPES"
            option-label="label"
            option-value="value"
            class="w-full rounded-lg"
            size="small"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Тип данных</label>
          <Select
            v-model="editForm.data_type"
            :options="DATA_TYPES"
            option-label="label"
            option-value="value"
            placeholder="Выберите тип…"
            class="w-full rounded-lg"
            size="small"
            editable
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Описание</label>
          <Textarea
            v-model="editForm.description"
            placeholder="Описание колонки"
            class="w-full rounded-lg"
            :rows="3"
            auto-resize
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 py-2">
          <Button
            label="Отмена"
            severity="secondary"
            :pt="{ root: 'rounded-lg min-h-[40px]' }"
            @click="showEditDialog = false"
          />
          <Button
            label="Сохранить"
            icon="pi pi-check"
            class="!rounded-lg !bg-teal-500 !border-teal-500 hover:!bg-teal-600 hover:!border-teal-600"
            :pt="{ root: 'min-h-[40px]' }"
            @click="saveColumn"
          />
        </div>
      </template>
    </Dialog>

    <!-- Add Dialog -->
    <Dialog
      v-model:visible="showAddDialog"
      header="Добавить колонку"
      modal
      :style="{ width: '520px' }"
      :pt="{
        root: '!rounded-2xl',
        header: 'border-b border-gray-100',
        footer: 'border-t border-gray-100',
      }"
    >
      <div class="space-y-4 py-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">
            Название <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="addForm.name"
            placeholder="column_name"
            class="w-full rounded-lg font-mono"
            size="small"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Тип данных</label>
          <Select
            v-model="addForm.data_type"
            :options="DATA_TYPES"
            option-label="label"
            option-value="value"
            placeholder="Выберите тип…"
            class="w-full rounded-lg"
            size="small"
            editable
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Описание</label>
          <Textarea
            v-model="addForm.description"
            placeholder="Краткое описание"
            class="w-full rounded-lg"
            :rows="2"
            auto-resize
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 py-2">
          <Button
            label="Отмена"
            severity="secondary"
            :pt="{ root: 'rounded-lg min-h-[40px]' }"
            @click="showAddDialog = false"
          />
          <Button
            label="Добавить"
            icon="pi pi-plus"
            :loading="addLoading"
            :disabled="!addForm.name"
            class="!rounded-lg !bg-teal-500 !border-teal-500 hover:!bg-teal-600 hover:!border-teal-600 disabled:!opacity-50"
            :pt="{ root: 'min-h-[40px]' }"
            @click="addColumn"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>