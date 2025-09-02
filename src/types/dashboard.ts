// Dashboard-specific type definitions for REQ-022

export interface KPICardData {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface PropertiesMetricsData {
  totalProperties: number;
  totalVisits: number;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
  averageItemsPerProperty: number;
  activeItems: number;
}

export interface AccountAccessData {
  ownedAccounts: Array<{
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
    created_at: string;
  }>;
  accessibleAccounts: Array<{
    id: string;
    name: string;
    description: string | null;
    userRole: string;
    ownerName: string;
    memberCount: number;
    created_at: string;
  }>;
  usersWithAccess: Array<{
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    accountId: string;
    accountName: string;
    userRoleInAccount: string;
    joinedAt: string;
  }>;
  summary: {
    totalOwnedAccounts: number;
    totalAccessibleAccounts: number;
    totalUsersWithAccess: number;
    totalMemberAccounts: number;
  };
}

export interface RecentActivityData {
  mostActiveProperties: Array<{
    id: string;
    name: string;
    visitCount: number;
    lastVisit: string;
  }>;
  topViewedItems: Array<{
    id: string;
    name: string;
    publicId: string;
    visitCount: number;
  }>;
}

export interface DashboardData {
  analytics: {
    overview: {
      totalItems: number;
      totalProperties: number;
      totalVisits: number;
      totalReactions: number;
      activeItems: number;
      averageItemsPerProperty: number;
    };
    timeBasedVisits: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
      last365Days: number;
    };
    recentActivity: RecentActivityData;
  };
  userAccess: AccountAccessData;
}

export interface DashboardProps {
  onRefresh?: () => void;
  className?: string;
}

export interface DashboardLoadingState {
  analytics: boolean;
  userAccess: boolean;
  overall: boolean;
}

export interface DashboardErrorState {
  analytics?: string;
  userAccess?: string;
  overall?: string;
}
