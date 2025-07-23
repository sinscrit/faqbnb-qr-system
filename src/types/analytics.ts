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

export interface SystemAnalyticsResponse {
  success: boolean;
  data?: {
    overview: {
      totalItems: number;
      totalVisits: number;
      totalReactions: number;
      activeItems: number; // Items with visits in last 30 days
    };
    timeBasedVisits: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
      last365Days: number;
    };
    topItems: Array<{
      id: string;
      publicId: string;
      name: string;
      visitCount: number;
      reactionCount: number;
    }>;
    reactionTrends: {
      like: number;
      dislike: number;
      love: number;
      confused: number;
      total: number;
    };
    pagination?: {
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
  code?: string;
} 