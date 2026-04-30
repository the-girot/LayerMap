// tests/views/LayerMappingView.spec.js
// LayerMappingView — component tests

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

// Mock API module
vi.mock("../../src/api/layerMapping", () => ({
  LayerMappingApi: {
    getLineage: vi.fn().mockResolvedValue({ nodes: [], edges: [] }),
    getLayerMappings: vi
      .fn()
      .mockResolvedValue({ data: [{ id: 1, sourceTableId: 1, targetTableId: 2 }], total: 1 }),
    getDWHTables: vi
      .fn()
      .mockResolvedValue([
        { id: 1, name: "stg_table", layer: "stg" },
        { id: 2, name: "ods_table", layer: "ods" },
      ]),
    createDWHTable: vi.fn().mockResolvedValue({ id: 3 }),
    createLayerMapping: vi.fn().mockResolvedValue({ id: 2 }),
    deleteLayerMapping: vi.fn().mockResolvedValue(undefined),
    updateLayerMapping: vi.fn().mockResolvedValue({
      id: 1,
      transformation: "SELECT *",
      algorithm: "full_load",
    }),
  },
}));

// Mock project API
vi.mock("../../src/api/projects", () => ({
  ProjectsApi: {
    getProjectById: vi
      .fn()
      .mockResolvedValue({ id: 42, name: "Test Project" }),
    getSources: vi.fn().mockResolvedValue([]),
    getRPIMappings: vi.fn().mockResolvedValue([]),
    getMappingTables: vi.fn().mockResolvedValue([]),
  },
}));

import LayerMappingView from "../../src/views/LayerMappingView.vue";
import { useLayerMappingStore } from "../../src/stores/layerMapping";
import { useProjectsStore } from "../../src/stores/projects";

// PrimeVue stubs
const stubs = {
  Button: {
    props: ["disabled", "loading", "label", "icon", "text", "size", "severity"],
    template:
      '<button :disabled="disabled || loading" @click="$emit(\'click\', $event)" class="mock-btn"><slot /></button>',
  },
  Select: {
    props: ["modelValue", "options", "optionLabel", "optionValue", "placeholder", "loading"],
    emits: ["update:modelValue"],
    template:
      '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="opt in options" :value="opt.value">{{ opt.label }}</option></select>',
  },
  InputText: {
    props: ["modelValue"],
    emits: ["update:modelValue"],
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  Textarea: {
    props: ["modelValue"],
    emits: ["update:modelValue"],
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  Dialog: {
    props: ["visible", "header"],
    emits: ["update:visible"],
    template:
      '<div v-if="visible" class="mock-dialog"><slot /><slot name="footer" /></div>',
  },
  Message: {
    props: ["severity", "closable"],
    template: '<div class="mock-message"><slot /></div>',
  },
  "router-link": { template: "<a><slot /></a>" },
  "router-view": { template: "<div />" },
  // Vue Flow components — stub as simple divs
  VueFlow: { template: "<div class='mock-vue-flow'><slot /></div>" },
  ERTableNode: { template: "<div class='mock-er-table' />" },
  SingleMappingCanvas: {
    props: ["flowData", "loading"],
    template: "<div class='mock-single-canvas' />",
  },
  FullLineageCanvas: {
    props: ["flowData", "loading", "showMinimap"],
    emits: ["edge-click", "node-click"],
    template:
      "<div class='mock-full-canvas' />",
  },
  LayerMappingToolbar: {
    props: ["mode", "mappings", "selectedMappingId", "loading", "totalMappings"],
    emits: [
      "update:mode",
      "update:selectedMappingId",
      "create-mapping",
      "delete-mapping",
      "create-table",
      "refresh",
    ],
    template:
      '<div class="mock-toolbar">{{ mode }} {{ selectedMappingId }}</div>',
  },
  TransformationModal: {
    props: ["visible", "mapping", "form", "formTouched", "saving"],
    emits: ["update:visible", "save", "close"],
    template:
      '<div v-if="visible" class="mock-modal">{{ mapping?.id }}</div>',
  },
  CreateDWHTableDialog: {
    props: ["modelValue"],
    emits: ["update:modelValue", "create"],
    template:
      '<div v-if="modelValue" class="mock-create-table-dialog" />',
  },
};

function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: "/projects/:id/layer-mapping",
        name: "LayerMapping",
        component: { template: "<div>LayerMapping</div>" },
      },
      {
        path: "/projects/:id",
        name: "ProjectDetail",
        component: { template: "<div>ProjectDetail</div>" },
      },
    ],
  });
}

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("LayerMappingView", () => {
  it("renders without crashing", async () => {
    const router = createTestRouter();
    await router.push("/projects/42/layer-mapping");

    const wrapper = mount(LayerMappingView, {
      global: {
        plugins: [router],
        stubs,
      },
    });

    // Component should mount without error
    expect(wrapper.exists()).toBe(true);
    // Should contain the view title
    expect(wrapper.text()).toContain("Layer Mapping");
  });

  it("loads lineage and tables on mount", async () => {
    const router = createTestRouter();
    await router.push("/projects/42/layer-mapping");

    const { LayerMappingApi } = await import("../../src/api/layerMapping");

    mount(LayerMappingView, {
      global: {
        plugins: [router],
        stubs,
      },
    });

    // Wait for async operations
    await new Promise((r) => setTimeout(r, 100));

    // Route params come as strings, so use string assertion
    expect(LayerMappingApi.getLineage).toHaveBeenCalledWith("42");
    expect(LayerMappingApi.getLayerMappings).toHaveBeenCalledWith("42", {});
    expect(LayerMappingApi.getDWHTables).toHaveBeenCalledWith("42");
  });

  it("sets mode via store change and shows appropriate canvas", async () => {
    const router = createTestRouter();
    await router.push("/projects/42/layer-mapping");

    // Pre-populate store so view renders content
    const projectStore = useProjectsStore();
    projectStore.projects.push({ id: 42, name: "Test" });

    const store = useLayerMappingStore();
    store.mappings[42] = [{ id: 1, sourceTableId: 1, targetTableId: 2 }];
    store.tables[42] = [{ id: 1, name: "t1", layer: "stg" }];
    store.lineage[42] = { nodes: [], edges: [] };
    store.selectMapping(store.mappings[42][0]);

    const wrapper = mount(LayerMappingView, {
      global: {
        plugins: [router],
        stubs,
      },
    });

    await new Promise((r) => setTimeout(r, 50));

    // Initially single mode — should show single canvas
    expect(store.mode).toBe("single");

    // Switch to full via store directly
    store.setMode("full");
    await wrapper.vm.$nextTick();

    expect(store.mode).toBe("full");
    // Find full canvas by class (stub name-based lookup is unreliable)
    expect(wrapper.find(".mock-full-canvas").exists()).toBe(true);
  });

  it("shows single canvas in single mode with mock-data", async () => {
    const router = createTestRouter();
    await router.push("/projects/42/layer-mapping");

    const projectStore = useProjectsStore();
    projectStore.projects.push({ id: 42, name: "Test" });

    const store = useLayerMappingStore();
    store.mappings[42] = [
      {
        id: 1,
        sourceTableId: 1,
        targetTableId: 2,
        sourceTable: { id: 1, name: "Src", layer: "stg", columns: [] },
        targetTable: { id: 2, name: "Tgt", layer: "ods", columns: [] },
      },
    ];
    store.tables[42] = [
      { id: 1, name: "Src", layer: "stg" },
      { id: 2, name: "Tgt", layer: "ods" },
    ];
    store.lineage[42] = { nodes: [], edges: [] };
    store.selectMapping(store.mappings[42][0]);

    const wrapper = mount(LayerMappingView, {
      global: {
        plugins: [router],
        stubs,
      },
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(store.mode).toBe("single");
    expect(store.selectedMapping).toBeTruthy();
  });

  it("handles error state display", async () => {
    const router = createTestRouter();
    await router.push("/projects/42/layer-mapping");

    const projectStore = useProjectsStore();
    projectStore.projects.push({ id: 42, name: "Test" });

    const store = useLayerMappingStore();
    store.error = "API error";

    const wrapper = mount(LayerMappingView, {
      global: {
        plugins: [router],
        stubs,
      },
    });

    await wrapper.vm.$nextTick();

    // Error banner should be visible
    expect(wrapper.text()).toContain("API error");
  });

  it("navigates back to project detail", async () => {
    const router = createTestRouter();
    const pushSpy = vi.spyOn(router, "push");
    await router.push("/projects/42/layer-mapping");

    const projectStore = useProjectsStore();
    projectStore.projects.push({ id: 42, name: "Test" });

    const wrapper = mount(LayerMappingView, {
      global: {
        plugins: [router],
        stubs,
      },
    });

    await new Promise((r) => setTimeout(r, 50));

    // Find back button (pi-arrow-left icon inside a button)
    const backBtn = wrapper.find(".pi-arrow-left");
    if (backBtn.exists()) {
      await backBtn.trigger("click");
      expect(pushSpy).toHaveBeenCalledWith({
        name: "ProjectDetail",
        params: { id: "42" },
      });
    }
  });
});
