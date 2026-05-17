export interface ApiSchool {
  id: string;
  name: string;
  logo: string;
  location: string;
  studentCount: number;
  staffCount: number;
  description?: string;
  website?: string;
}

export interface CreateSchoolRequest {
  name: string;
  location: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  phoneNumber?: string;
}

export interface UpdateSchoolRequest extends Partial<CreateSchoolRequest> {}

export interface SchoolsListResponse {
  schools: ApiSchool[];
  total: number;
}
