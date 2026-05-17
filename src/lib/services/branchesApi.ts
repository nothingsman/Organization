import { apiRequest } from '../api/client';
import type { ApiBranch, ApiAdmin, CreateBranchRequest, CreateAdminRequest } from '../types/branches';

export const branchesApi = {
  async listBySchool(schoolId: string): Promise<ApiBranch[]> {
    const res = await apiRequest<ApiBranch[]>({
      method: 'GET',
      path: `/schools/${schoolId}/branches`,
    });
    return res.data;
  },

  async create(data: CreateBranchRequest): Promise<ApiBranch> {
    const res = await apiRequest<ApiBranch>({
      method: 'POST',
      path: `/schools/${data.schoolId}/branches`,
      body: data,
    });
    return res.data;
  },

  async listAdmins(branchId: string): Promise<ApiAdmin[]> {
    const res = await apiRequest<ApiAdmin[]>({
      method: 'GET',
      path: `/branches/${branchId}/admins`,
    });
    return res.data;
  },

  async createAdmin(data: CreateAdminRequest): Promise<ApiAdmin> {
    const res = await apiRequest<ApiAdmin>({
      method: 'POST',
      path: `/branches/${data.branchId}/admins`,
      body: data,
    });
    return res.data;
  },

  async deleteAdmin(branchId: string, adminId: string): Promise<void> {
    await apiRequest<void>({
      method: 'DELETE',
      path: `/branches/${branchId}/admins/${adminId}`,
    });
  },
};
