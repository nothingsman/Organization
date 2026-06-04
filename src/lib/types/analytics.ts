export interface OrganizationAnalyticsTotals {
  students: number;
  branch_admins: number;
  teachers: number;
  parents: number;
}

export interface OrganizationAnalyticsYearPoint {
  year: number;
  count: number;
}

export interface OrganizationAnalyticsResponse {
  organization_id: string;
  totals: OrganizationAnalyticsTotals;
  student_enrollment_growth: OrganizationAnalyticsYearPoint[];
  parent_engagement: OrganizationAnalyticsYearPoint[];
}
