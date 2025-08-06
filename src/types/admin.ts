// Admin Dashboard Types for REQ-016: System Admin Back Office

export interface UserAnalytics {
  id: string;
  email: string;
  fullName: string;
  ownedAccounts: {
    count: number;
    totalItems: number;
    totalVisits: number;
  };
  accessAccounts: {
    count: number;
    totalItems: number;
    totalVisits: number;
  };
}

export interface AccessRequest {
  id: string;
  requester_email: string;
  requester_name?: string;
  account_id: string;
  request_date: string;
  approval_date?: string;
  approved_by?: string;
  access_code?: string;
  registration_date?: string;
  status: 'pending' | 'approved' | 'denied' | 'registered';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserFilters {
  email?: string;
  hasOwnedAccounts?: boolean;
  hasAccessAccounts?: boolean;
  minVisits?: number;
  maxVisits?: number;
}

export interface AccessRequestFilters {
  status?: 'pending' | 'approved' | 'denied' | 'registered';
  email?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalAccounts: number;
  totalItems: number;
  totalVisits: number;
  pendingAccessRequests: number;
  recentRegistrations24h: number;
}

export interface AccessRequestWithAccount extends AccessRequest {
  account: {
    id: string;
    name: string;
    owner_email: string;
  };
}

export interface UserAccountDetails {
  userId: string;
  email: string;
  fullName: string;
  ownedAccounts: Array<{
    id: string;
    name: string;
    itemCount: number;
    visitCount: number;
    createdAt: string;
  }>;
  accessAccounts: Array<{
    id: string;
    name: string;
    role: string;
    itemCount: number;
    visitCount: number;
    accessGrantedAt: string;
  }>;
  accessRequests: AccessRequest[];
  totalActivity: {
    totalItems: number;
    totalVisits: number;
    accountsOwned: number;
    accountsAccess: number;
  };
}

export interface EmailTemplate {
  subject: string;
  body: string;
  variables: Record<string, string>;
}

// Additional Admin interfaces for comprehensive functionality
export interface AccessApprovalRequest {
  requestId: string;
  approvedBy: string;
  approvalNotes?: string;
  accessCode: string;
  emailTemplate?: EmailTemplate;
}

export interface BackOfficeUser extends UserAnalytics {
  isSystemAdmin: boolean;
  lastLoginDate?: string;
  registrationDate: string;
  accountCreationCount: number;
  totalSystemActivity: number;
}

export interface UserAccountMetrics {
  userId: string;
  ownedAccountsMetrics: {
    totalAccounts: number;
    totalItems: number;
    totalVisits: number;
    averageItemsPerAccount: number;
    mostActiveAccount: {
      id: string;
      name: string;
      visitCount: number;
    };
  };
  accessAccountsMetrics: {
    totalAccounts: number;
    totalItems: number;
    totalVisits: number;
    roles: Record<string, number>; // role -> count
    mostRecentAccess: {
      accountId: string;
      accountName: string;
      accessDate: string;
    };
  };
}

export interface VisitSummary {
  totalVisits: number;
  uniqueItems: number;
  averageVisitsPerItem: number;
  recentVisits24h: number;
  visitTrends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  topVisitedItems: Array<{
    itemId: string;
    itemName: string;
    visitCount: number;
  }>;
}

export interface AccessStatistics {
  pendingRequests: number;
  approvedRequests: number;
  registeredUsers: number;
  averageApprovalTime: number; // in days
  requestTrends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  approvalRates: {
    approved: number;
    denied: number;
    pending: number;
  };
}

// Enums for better type safety
export enum AccessRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied',
  REGISTERED = 'registered'
}

export enum EmailTemplateType {
  ACCESS_GRANTED = 'access_granted',
  ACCESS_DENIED = 'access_denied',
  WELCOME = 'welcome',
  REMINDER = 'reminder'
}

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin', 
  MEMBER = 'member',
  VIEWER = 'viewer'
}