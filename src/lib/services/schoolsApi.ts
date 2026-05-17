import { apiRequest } from '../api/client';
import type { ApiSchool, CreateSchoolRequest, SchoolsListResponse } from '../types/schools';

export const schoolsApi = {
  async list(): Promise<ApiSchool[]> {
    const res = await apiRequest<SchoolsListResponse>({
      method: 'GET',
      path: '/schools',
    });
    return res.data.schools;
  },

  async get(schoolId: string): Promise<ApiSchool> {
    const res = await apiRequest<ApiSchool>({
      method: 'GET',
      path: `/schools/${schoolId}`,
    });
    return res.data;
  },

  async create(data: CreateSchoolRequest): Promise<ApiSchool> {
    const res = await apiRequest<ApiSchool>({
      method: 'POST',
      path: '/schools',
      body: data,
    });
    return res.data;
  },

  async update(schoolId: string, data: Partial<CreateSchoolRequest>): Promise<ApiSchool> {
    const res = await apiRequest<ApiSchool>({
      method: 'PUT',
      path: `/schools/${schoolId}`,
      body: data,
    });
    return res.data;
  },

  async delete(schoolId: string): Promise<void> {
    await apiRequest<void>({
      method: 'DELETE',
      path: `/schools/${schoolId}`,
    });
  },
};
