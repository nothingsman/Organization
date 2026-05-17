export interface ApiBranch {
  id: string;
  schoolId: string;
  name: string;
  address: string;
  city: string;
  studentCount: number;
  teacherCount: number;
  capacity: number;
  performance: number[];
}

export interface CreateBranchRequest {
  schoolId: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
}

export interface ApiAdmin {
  id: string;
  branchId: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  email: string;
}

export interface CreateAdminRequest {
  branchId: string;
  name: string;
  role: string;
  email: string;
}
