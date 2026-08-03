export interface DashboardMetric {
  title: string;
  value: number | string;
  trend: number;
  trendLabel?: string;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  recentActivity: any[]; // We can strongly type this later when Activity logic is added
}
