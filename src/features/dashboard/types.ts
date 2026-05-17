export interface School {
  id: string;
  name: string;
  logo: string;
  location: string;
  studentCount: number;
  staffCount: number;
  description?: string;
  website?: string;
}

export interface Branch {
  id: string;
  schoolId: string;
  name: string;
  address: string;
  city: string;
  studentCount: number;
  teacherCount: number;
  capacity: number;
  performance: number[]; // Academic performance over time
}

export interface Admin {
  id: string;
  branchId: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  email: string;
}
