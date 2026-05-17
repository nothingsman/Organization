export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
}

export interface AnalyticsDataPoint {
  name: string;
  students: number;
  revenue: number;
}

export interface AnalyticsSummary {
  totalStudents: number;
  totalStaff: number;
  activeSessions: number;
  monthlyRevenue: number;
  studentsTrend: number;
  staffTrend: number;
  revenueTrend: number;
}

export interface AnalyticsResponse {
  dataPoints: AnalyticsDataPoint[];
  summary: AnalyticsSummary;
}
