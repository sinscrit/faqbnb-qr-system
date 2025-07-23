export interface VisitAnalytics {
  itemId: string;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
  last365Days: number;
  allTime: number;
}

export interface VisitEntry {
  id: string;
  itemId: string;
  visitedAt: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  referrer?: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: VisitAnalytics;
  error?: string;
} 