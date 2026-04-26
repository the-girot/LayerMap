// tests/api/projects.spec.js
// Phase 2 — API Contract Tests for projectsWithMock.js

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/api/client.js', () => ({
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

import { apiClient } from '../../src/api/client.js';
import * as api from '../../src/api/projectsWithMock.js';

const originalLocation = window.location;

beforeEach(() => {
  delete window.location;
  window.location = { href: '', assign: vi.fn(), replace: vi.fn() };
  vi.clearAllMocks();
});

afterEach(() => {
  window.location = originalLocation;
});

describe('projects API contract', () => {
  describe('updateProject', () => {
    it('PATCH /projects/:id', async () => {
      apiClient.patch.mockResolvedValueOnce({ data: { id: 42 } });
      await api.updateProject('42', { name: 'New' });
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/projects/42',
        expect.objectContaining({ name: 'New' })
      );
    });
  });

  describe('updateSource', () => {
    it('PATCH /projects/:projectId/sources/:id', async () => {
      apiClient.patch.mockResolvedValueOnce({ data: { id: 2 } });
      await api.updateSource('1', '2', { name: 'Src' });
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/projects/1/sources/2',
        expect.objectContaining({ name: 'Src' })
      );
    });
  });

  describe('updateMappingTable', () => {
    it('PATCH /projects/:projectId/mapping-tables/:id', async () => {
      apiClient.patch.mockResolvedValueOnce({ data: { id: 3 } });
      await api.updateMappingTable('1', '3', { name: 'Tbl' });
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/projects/1/mapping-tables/3',
        expect.objectContaining({ name: 'Tbl' })
      );
    });
  });

  describe('createMappingTable', () => {
    it('POST /projects/:id/mapping-tables with source_id in body', async () => {
      apiClient.post.mockResolvedValueOnce({ data: { id: 4 } });
      await api.createMappingTable('1', { name: 'Tbl', source_id: 5 });
      expect(apiClient.post).toHaveBeenCalledWith(
        '/projects/1/mapping-tables',
        expect.objectContaining({ name: 'Tbl', source_id: 5 })
      );
    });
  });

  describe('updateMappingTableColumn', () => {
    it('PATCH nested columns route', async () => {
      apiClient.patch.mockResolvedValueOnce({ data: { id: 6 } });
      await api.updateMappingTableColumn('1', '3', '6', { name: 'Col' });
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/projects/1/mapping-tables/3/columns/6',
        expect.objectContaining({ name: 'Col' })
      );
    });
  });

  describe('updateRPIMapping', () => {
    it('PATCH /projects/:projectId/rpi-mappings/:id', async () => {
      apiClient.patch.mockResolvedValueOnce({ data: { id: 7 } });
      await api.updateRPIMapping('1', '7', { rpi_name: 'RPI' });
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/projects/1/rpi-mappings/7',
        expect.objectContaining({ rpi_name: 'RPI' })
      );
    });
  });

  describe('deleteRPIMapping', () => {
    it('DELETE /projects/:projectId/rpi-mappings/:id', async () => {
      apiClient.delete.mockResolvedValueOnce({ data: { success: true } });
      await api.deleteRPIMapping('1', '7');
      expect(apiClient.delete).toHaveBeenCalledWith('/projects/1/rpi-mappings/7');
    });
  });

  describe('getProjectKpi', () => {
    it('returns undefined when module resolves mock KPI data', async () => {
      apiClient.get.mockResolvedValueOnce({
        data: { total: 10, active: 5, draft: 3, archived: 2 },
      });
      const result = await api.getProjectKpi();
      expect(apiClient.get).toHaveBeenCalledWith('/projects/kpi');
      expect(result).toBeUndefined();
    });
  });

  describe('getRecentProjects', () => {
    it('GET /projects/recent with limit query string', async () => {
      apiClient.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Recent' }] });
      const result = await api.getRecentProjects(5);
      expect(apiClient.get).toHaveBeenCalledWith('/projects/recent?limit=5');
      expect(result).toBeUndefined();
    });
  });

  describe('getProjectsWithFilters', () => {
    it('GET /projects with serialized query string', async () => {
      apiClient.get.mockResolvedValueOnce({ data: { items: [], total: 0 } });
      await api.getProjectsWithFilters({
        status: 'active',
        search: 'test',
        page: 2,
        size: 10,
        sort_by: 'created_at',
        sort_dir: 'desc',
      });
      expect(apiClient.get).toHaveBeenCalledWith(
        '/projects?status=active&search=test&page=2&size=10&sort_by=created_at&sort_dir=desc'
      );
    });

    it('serializes default paging for minimal filters', async () => {
      apiClient.get.mockResolvedValueOnce({ data: [] });
      await api.getProjectsWithFilters({ status: 'draft' });
      expect(apiClient.get).toHaveBeenCalledWith(
        '/projects?status=draft&page=1&size=10&sort_dir=asc'
      );
    });
  });

  describe('getSourceMappingTables', () => {
    it('returns undefined when module resolves mock mapping tables', async () => {
      apiClient.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Map' }] });
      const result = await api.getSourceMappingTables('1', '5');
      expect(apiClient.get).toHaveBeenCalledWith('/projects/1/sources/5/mapping-tables');
      expect(result).toBeUndefined();
    });
  });
});