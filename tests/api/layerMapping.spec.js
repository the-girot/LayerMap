// tests/api/layerMapping.spec.js
// API Contract Tests for layerMapping.js

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../src/api/client.js", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), handlers: [] },
      response: { use: vi.fn(), handlers: [] },
    },
    defaults: { headers: {}, withCredentials: true },
  },
}));

import { api } from "../../src/api/client.js";
import * as layerMappingApi from "../../src/api/layerMapping.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("layerMapping API contract", () => {
  describe("DWH Tables", () => {
    it("getDWHTables — GET /projects/:id/dwh-tables", async () => {
      const mockData = [{ id: 1, name: "table1", layer: "stg" }];
      api.get.mockResolvedValueOnce(mockData);

      const result = await layerMappingApi.getDWHTables(42);
      expect(api.get).toHaveBeenCalledWith("/projects/42/dwh-tables");
      expect(result).toEqual(mockData);
    });

    it("createDWHTable — POST /projects/:id/dwh-tables", async () => {
      const payload = { name: "new_table", layer: "ods" };
      api.post.mockResolvedValueOnce({ id: 2, ...payload });

      const result = await layerMappingApi.createDWHTable(42, payload);
      expect(api.post).toHaveBeenCalledWith("/projects/42/dwh-tables", payload);
      expect(result.id).toBe(2);
    });

    it("updateDWHTable — PATCH /projects/:id/dwh-tables/:tableId", async () => {
      api.patch.mockResolvedValueOnce({ id: 1, name: "updated" });

      const result = await layerMappingApi.updateDWHTable(42, 1, {
        name: "updated",
      });
      expect(api.patch).toHaveBeenCalledWith("/projects/42/dwh-tables/1", {
        name: "updated",
      });
      expect(result.name).toBe("updated");
    });

    it("deleteDWHTable — DELETE /projects/:id/dwh-tables/:tableId", async () => {
      api.delete.mockResolvedValueOnce(undefined);

      await layerMappingApi.deleteDWHTable(42, 1);
      expect(api.delete).toHaveBeenCalledWith("/projects/42/dwh-tables/1");
    });
  });

  describe("DWH Columns", () => {
    it("getDWHColumns — GET /projects/:id/dwh-tables/:tableId/columns", async () => {
      const mockColumns = [
        { id: 1, name: "col1", data_type: "string" },
      ];
      api.get.mockResolvedValueOnce(mockColumns);

      const result = await layerMappingApi.getDWHColumns(42, 1);
      expect(api.get).toHaveBeenCalledWith(
        "/projects/42/dwh-tables/1/columns",
      );
      expect(result).toEqual(mockColumns);
    });

    it("createDWHColumn — POST /projects/:id/dwh-tables/:tableId/columns", async () => {
      const payload = { name: "col1", data_type: "integer" };
      api.post.mockResolvedValueOnce({ id: 10, ...payload });

      const result = await layerMappingApi.createDWHColumn(42, 1, payload);
      expect(api.post).toHaveBeenCalledWith(
        "/projects/42/dwh-tables/1/columns",
        payload,
      );
      expect(result.id).toBe(10);
    });
  });

  describe("Layer Mappings", () => {
    it("getLayerMappings — GET /projects/:id/layer-mappings", async () => {
      const mockData = { data: [{ id: 1 }], total: 1 };
      api.get.mockResolvedValueOnce(mockData);

      const result = await layerMappingApi.getLayerMappings(42, {
        layer: "stg",
      });
      expect(api.get).toHaveBeenCalledWith("/projects/42/layer-mappings", {
        params: { layer: "stg" },
      });
      expect(result.total).toBe(1);
    });

    it("createLayerMapping — POST /projects/:id/layer-mappings", async () => {
      const payload = {
        sourceTableId: 1,
        targetTableId: 2,
        transformation: "SELECT *",
      };
      api.post.mockResolvedValueOnce({ id: 5, ...payload });

      const result = await layerMappingApi.createLayerMapping(42, payload);
      expect(api.post).toHaveBeenCalledWith(
        "/projects/42/layer-mappings",
        payload,
      );
      expect(result.id).toBe(5);
    });

    it("getLayerMapping — GET /projects/:id/layer-mappings/:mappingId", async () => {
      api.get.mockResolvedValueOnce({ id: 5 });

      const result = await layerMappingApi.getLayerMapping(42, 5);
      expect(api.get).toHaveBeenCalledWith("/projects/42/layer-mappings/5");
      expect(result.id).toBe(5);
    });

    it("updateLayerMapping — PATCH /projects/:id/layer-mappings/:mappingId", async () => {
      api.patch.mockResolvedValueOnce({ id: 5, transformation: "UPDATED" });

      const result = await layerMappingApi.updateLayerMapping(42, 5, {
        transformation: "UPDATED",
      });
      expect(api.patch).toHaveBeenCalledWith(
        "/projects/42/layer-mappings/5",
        { transformation: "UPDATED" },
      );
      expect(result.transformation).toBe("UPDATED");
    });

    it("deleteLayerMapping — DELETE /projects/:id/layer-mappings/:mappingId", async () => {
      api.delete.mockResolvedValueOnce(undefined);

      await layerMappingApi.deleteLayerMapping(42, 5);
      expect(api.delete).toHaveBeenCalledWith("/projects/42/layer-mappings/5");
    });
  });

  describe("Lineage", () => {
    it("getLineage — GET /projects/:id/lineage", async () => {
      const mockLineage = {
        nodes: [{ id: 1, label: "Table A", layer: "stg" }],
        edges: [{ id: 1, source: 1, target: 2 }],
      };
      api.get.mockResolvedValueOnce(mockLineage);

      const result = await layerMappingApi.getLineage(42);
      expect(api.get).toHaveBeenCalledWith("/projects/42/lineage");
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(1);
    });
  });
});
