// tests/stores/layerMapping.spec.js
// Store tests for layerMapping.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useLayerMappingStore } from "../../src/stores/layerMapping";

// Mock the API module
vi.mock("../../src/api/layerMapping", () => ({
  LayerMappingApi: {
    getLineage: vi.fn(),
    getLayerMappings: vi.fn(),
    getDWHTables: vi.fn(),
    createDWHTable: vi.fn(),
    createLayerMapping: vi.fn(),
    deleteLayerMapping: vi.fn(),
    updateLayerMapping: vi.fn(),
  },
}));

import { LayerMappingApi } from "../../src/api/layerMapping";

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("useLayerMappingStore", () => {
  it("initializes with default state", () => {
    const store = useLayerMappingStore();

    expect(store.tables).toEqual({});
    expect(store.mappings).toEqual({});
    expect(store.lineage).toEqual({});
    expect(store.selectedMapping).toBeNull();
    expect(store.mode).toBe("single");
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.dirty).toBe(false);
    expect(store.saving).toBe(false);
    expect(store.fieldErrors).toEqual({});
  });

  describe("setMode", () => {
    it("sets mode to full", () => {
      const store = useLayerMappingStore();
      store.setMode("full");
      expect(store.mode).toBe("full");
    });

    it("sets mode to single", () => {
      const store = useLayerMappingStore();
      store.setMode("single");
      expect(store.mode).toBe("single");
    });
  });

  describe("selectMapping", () => {
    it("selects a mapping and switches to single mode", () => {
      const store = useLayerMappingStore();
      const mapping = { id: 1, sourceTableId: 1, targetTableId: 2 };

      store.selectMapping(mapping);

      expect(store.selectedMapping).toEqual(mapping);
      expect(store.mode).toBe("single");
      expect(store.dirty).toBe(false);
    });
  });

  describe("loadLineage", () => {
    it("loads and stores lineage data", async () => {
      const mockLineage = {
        nodes: [{ id: 1, label: "A", layer: "stg" }],
        edges: [{ id: 1, source: 1, target: 2 }],
      };
      LayerMappingApi.getLineage.mockResolvedValueOnce(mockLineage);

      const store = useLayerMappingStore();
      await store.loadLineage(42);

      expect(LayerMappingApi.getLineage).toHaveBeenCalledWith(42);
      expect(store.lineage[42]).toEqual(mockLineage);
      expect(store.loading).toBe(false);
    });

    it("sets error on failure", async () => {
      LayerMappingApi.getLineage.mockRejectedValueOnce({
        status: 500,
        message: "Server error",
      });

      const store = useLayerMappingStore();
      await expect(store.loadLineage(42)).rejects.toThrow();
      expect(store.error).toBe("Сервер недоступен, попробуйте позже");
    });
  });

  describe("loadMappings", () => {
    it("loads and stores mappings", async () => {
      const mockMappings = [{ id: 1, sourceTableId: 1, targetTableId: 2 }];
      LayerMappingApi.getLayerMappings.mockResolvedValueOnce({
        data: mockMappings,
        total: 1,
      });

      const store = useLayerMappingStore();
      await store.loadMappings(42);

      expect(LayerMappingApi.getLayerMappings).toHaveBeenCalledWith(42, {});
      expect(store.mappings[42]).toEqual(mockMappings);
    });
  });

  describe("saveTransformation", () => {
    it("calls updateLayerMapping and updates local state", async () => {
      const updated = {
        id: 1,
        transformation: "SELECT *",
        algorithm: "full_load",
      };
      LayerMappingApi.updateLayerMapping.mockResolvedValueOnce(updated);

      const store = useLayerMappingStore();
      store.selectedMapping = { id: 1, transformation: "", algorithm: "" };
      store.mappings[42] = [{ id: 1, transformation: "", algorithm: "" }];

      await store.saveTransformation(42, {
        transformation: "SELECT *",
        algorithm: "full_load",
      });

      expect(LayerMappingApi.updateLayerMapping).toHaveBeenCalledWith(42, 1, {
        transformation: "SELECT *",
        algorithm: "full_load",
      });
      expect(store.selectedMapping.transformation).toBe("SELECT *");
      expect(store.dirty).toBe(false);
    });

    it("does nothing if no mapping selected", async () => {
      const store = useLayerMappingStore();
      store.selectedMapping = null;

      await store.saveTransformation(42, { transformation: "x" });

      expect(LayerMappingApi.updateLayerMapping).not.toHaveBeenCalled();
    });
  });

  describe("createTable", () => {
    it("creates DWH table and adds to state", async () => {
      const newTable = { id: 10, name: "test_table", layer: "stg" };
      LayerMappingApi.createDWHTable.mockResolvedValueOnce(newTable);

      const store = useLayerMappingStore();
      const result = await store.createTable(42, {
        name: "test_table",
        layer: "stg",
      });

      expect(LayerMappingApi.createDWHTable).toHaveBeenCalledWith(42, {
        name: "test_table",
        layer: "stg",
      });
      expect(store.tables[42]).toContainEqual(newTable);
      expect(result).toEqual(newTable);
    });
  });

  describe("createMapping", () => {
    it("creates mapping and adds to state", async () => {
      const newMapping = {
        id: 5,
        sourceTableId: 1,
        targetTableId: 2,
      };
      LayerMappingApi.createLayerMapping.mockResolvedValueOnce(newMapping);

      const store = useLayerMappingStore();
      const result = await store.createMapping(42, {
        sourceTableId: 1,
        targetTableId: 2,
      });

      expect(LayerMappingApi.createLayerMapping).toHaveBeenCalledWith(42, {
        sourceTableId: 1,
        targetTableId: 2,
      });
      expect(store.mappings[42]).toContainEqual(newMapping);
      expect(result).toEqual(newMapping);
    });
  });

  describe("deleteMapping", () => {
    it("deletes mapping and removes from state", async () => {
      LayerMappingApi.deleteLayerMapping.mockResolvedValueOnce(undefined);

      const store = useLayerMappingStore();
      store.mappings[42] = [
        { id: 1, sourceTableId: 1 },
        { id: 2, sourceTableId: 2 },
      ];
      store.selectedMapping = { id: 1 };

      await store.deleteMapping(42, 1);

      expect(LayerMappingApi.deleteLayerMapping).toHaveBeenCalledWith(42, 1);
      expect(store.mappings[42]).toHaveLength(1);
      expect(store.mappings[42][0].id).toBe(2);
      expect(store.selectedMapping).toBeNull();
    });

    it("leaves selectedMapping if it was not the deleted one", async () => {
      LayerMappingApi.deleteLayerMapping.mockResolvedValueOnce(undefined);

      const store = useLayerMappingStore();
      store.mappings[42] = [
        { id: 1 },
        { id: 2 },
      ];
      store.selectedMapping = { id: 2 };

      await store.deleteMapping(42, 1);

      expect(store.selectedMapping).toEqual({ id: 2 });
    });
  });

  describe("getTablesByProjectId", () => {
    it("returns empty array for unknown project", () => {
      const store = useLayerMappingStore();
      expect(store.getTablesByProjectId(999)).toEqual([]);
    });

    it("returns tables for known project", () => {
      const store = useLayerMappingStore();
      store.tables[42] = [{ id: 1, name: "t1", layer: "stg" }];

      expect(store.getTablesByProjectId(42)).toHaveLength(1);
    });
  });

  describe("resetError", () => {
    it("clears error and fieldErrors", () => {
      const store = useLayerMappingStore();
      store.error = "Some error";
      store.fieldErrors = { name: ["required"] };

      store.resetError();

      expect(store.error).toBeNull();
      expect(store.fieldErrors).toEqual({});
    });
  });
});
