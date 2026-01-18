import { supabase } from '@/lib/supabase';

// Analytics Types
export interface UserAccountMetrics {
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

export interface VisitSummary {
  totalVisits: number;
  uniqueItems: number;
  averageVisitsPerItem: number;
  recentVisits24h: number;
}

export interface AccessStatistics {
  pendingRequests: number;
  approvedRequests: number;
  registeredUsers: number;
  averageApprovalTime: number; // in days
}

export interface AnalyticsReport {
  totalUsers: number;
  totalAccounts: number;
  totalItems: number;
  totalVisits: number;
  userMetrics: {
    usersWithOwnedAccounts: number;
    usersWithAccessAccounts: number;
    avgAccountsPerUser: number;
  };
  visitMetrics: VisitSummary;
  accessMetrics: AccessStatistics;
}

/**
 * Calculate account metrics for a specific user
 * Part of REQ-016: System Admin Back Office Analytics
 */
export async function calculateUserAccountMetrics(userId: string): Promise<UserAccountMetrics> {
  try {
    // Get owned accounts
    const { data: ownedAccounts, error: ownedError } = await supabase
      .from('accounts')
      .select('id')
      .eq('owner_id', userId);

    if (ownedError) {
      console.error('Error fetching owned accounts:', ownedError);
      throw new Error('Failed to fetch owned accounts');
    }

    // Get access accounts (not owned)
    const { data: accessAccounts, error: accessError } = await supabase
      .from('account_users')
      .select(`
        account:accounts!inner(
          id,
          owner_id
        )
      `)
      .eq('user_id', userId)
      .neq('account.owner_id', userId);

    if (accessError) {
      console.error('Error fetching access accounts:', accessError);
      throw new Error('Failed to fetch access accounts');
    }

    // Calculate owned account metrics
    const ownedAccountIds = ownedAccounts?.map(acc => acc.id) || [];
    const ownedStats = await aggregateVisitData(ownedAccountIds);

    // Calculate access account metrics
    const accessAccountIds = accessAccounts?.map((item: any) => item.account.id) || [];
    const accessStats = await aggregateVisitData(accessAccountIds);

    return {
      ownedAccounts: {
        count: ownedAccounts?.length || 0,
        totalItems: ownedStats.uniqueItems,
        totalVisits: ownedStats.totalVisits
      },
      accessAccounts: {
        count: accessAccounts?.length || 0,
        totalItems: accessStats.uniqueItems,
        totalVisits: accessStats.totalVisits
      }
    };
  } catch (error) {
    console.error('Error calculating user account metrics:', error);
    throw error;
  }
}

/**
 * Aggregate visit data for specified accounts
 * Part of REQ-016: System Admin Back Office Analytics
 */
export async function aggregateVisitData(accountIds: string[]): Promise<VisitSummary> {
  try {
    if (accountIds.length === 0) {
      return {
        totalVisits: 0,
        uniqueItems: 0,
        averageVisitsPerItem: 0,
        recentVisits24h: 0
      };
    }

    // Get items for these accounts
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id')
      .in('account_id', accountIds);

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      throw new Error('Failed to fetch items');
    }

    const itemIds = items?.map(item => item.id) || [];

    if (itemIds.length === 0) {
      return {
        totalVisits: 0,
        uniqueItems: 0,
        averageVisitsPerItem: 0,
        recentVisits24h: 0
      };
    }

    // Get visit counts
    const { data: visits, error: visitsError } = await supabase
      .from('item_visits')
      .select('id, visited_at')
      .in('item_id', itemIds);

    if (visitsError) {
      console.error('Error fetching visits:', visitsError);
      throw new Error('Failed to fetch visits');
    }

    const totalVisits = visits?.length || 0;
    const uniqueItems = itemIds.length;

    // Calculate recent visits (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentVisits24h = visits?.filter(visit => 
      new Date(visit.visited_at) > oneDayAgo
    ).length || 0;

    return {
      totalVisits,
      uniqueItems,
      averageVisitsPerItem: uniqueItems > 0 ? totalVisits / uniqueItems : 0,
      recentVisits24h
    };
  } catch (error) {
    console.error('Error aggregating visit data:', error);
    throw error;
  }
}

/**
 * Compute access request statistics
 * Part of REQ-016: System Admin Back Office Analytics
 */
export async function computeAccessStatistics(userId?: string): Promise<AccessStatistics> {
  try {
    let query = supabase.from('access_requests').select('*');
    
    if (userId) {
      // Get statistics for a specific user's accounts
      const { data: userAccounts } = await supabase
        .from('accounts')
        .select('id')
        .eq('owner_id', userId);
      
      const accountIds = userAccounts?.map(acc => acc.id) || [];
      if (accountIds.length > 0) {
        query = query.in('account_id', accountIds);
      }
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching access requests:', error);
      throw new Error('Failed to fetch access requests');
    }

    const pendingRequests = requests?.filter(req => req.status === 'pending').length || 0;
    const approvedRequests = requests?.filter(req => req.status === 'approved').length || 0;
    const registeredUsers = requests?.filter(req => req.status === 'registered').length || 0;

    // Calculate average approval time
    const approvedWithDates = requests?.filter(req => 
      req.status === 'approved' && req.request_date && req.approval_date
    ) || [];

    let averageApprovalTime = 0;
    if (approvedWithDates.length > 0) {
      const totalApprovalTime = approvedWithDates.reduce((sum, req) => {
        const requestDate = new Date(req.request_date);
        const approvalDate = new Date(req.approval_date);
        const diffTime = approvalDate.getTime() - requestDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return sum + diffDays;
      }, 0);
      
      averageApprovalTime = totalApprovalTime / approvedWithDates.length;
    }

    return {
      pendingRequests,
      approvedRequests,
      registeredUsers,
      averageApprovalTime
    };
  } catch (error) {
    console.error('Error computing access statistics:', error);
    throw error;
  }
}

// Timeline Analytics Types and Functions
export interface RegistrationStatus {
  stage: 'requested' | 'approved' | 'registered' | 'denied';
  daysSinceRequest: number;
  daysToApproval?: number;
  daysToRegistration?: number;
  isOverdue: boolean;
  timeline: Array<{
    event: string;
    date: string;
    daysSinceStart: number;
  }>;
}

/**
 * Calculate days since request was made
 */
export function calculateDaysSinceRequest(requestDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - requestDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days between request and registration
 */
export function calculateDaysBetweenRequestAndRegistration(
  requestDate: Date, 
  registrationDate: Date
): number {
  const diffTime = registrationDate.getTime() - requestDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get comprehensive registration status for access request
 */
export function getRegistrationStatus(request: any): RegistrationStatus {
  const requestDate = new Date(request.request_date);
  const approvalDate = request.approval_date ? new Date(request.approval_date) : null;
  const registrationDate = request.registration_completed_date ? 
    new Date(request.registration_completed_date) : null;

  const daysSinceRequest = calculateDaysSinceRequest(requestDate);
  const daysToApproval = approvalDate ? 
    Math.floor((approvalDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24)) : undefined;
  const daysToRegistration = registrationDate ? 
    calculateDaysBetweenRequestAndRegistration(requestDate, registrationDate) : undefined;

  // Build timeline
  const timeline = [
    {
      event: 'Request Submitted',
      date: request.request_date,
      daysSinceStart: 0
    }
  ];

  if (approvalDate) {
    timeline.push({
      event: 'Request Approved',
      date: request.approval_date,
      daysSinceStart: daysToApproval!
    });
  }

  if (registrationDate) {
    timeline.push({
      event: 'Registration Completed',
      date: request.registration_completed_date,
      daysSinceStart: daysToRegistration!
    });
  }

  // Determine if overdue based on status and time elapsed
  let isOverdue = false;
  if (request.status === 'pending' && daysSinceRequest > 7) {
    isOverdue = true;
  } else if (request.status === 'approved' && approvalDate) {
    const daysSinceApproval = Math.floor((new Date().getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceApproval > 14) { // 14 days to complete registration after approval
      isOverdue = true;
    }
  }

  return {
    stage: request.status,
    daysSinceRequest,
    daysToApproval,
    daysToRegistration,
    isOverdue,
    timeline
  };
}

/**
 * Get timeline analytics for multiple requests
 */
export function analyzeRegistrationTimelines(requests: any[]): {
  averageDaysToApproval: number;
  averageDaysToRegistration: number;
  overdueRequests: number;
  fastestApproval: number;
  slowestApproval: number;
  completionRate: number;
  stageDistribution: Record<string, number>;
} {
  const approvedRequests = requests.filter(r => r.approval_date);
  const registeredRequests = requests.filter(r => r.registration_completed_date);
  
  // Calculate averages
  const averageDaysToApproval = approvedRequests.length > 0 ?
    approvedRequests.reduce((sum, req) => {
      const status = getRegistrationStatus(req);
      return sum + (status.daysToApproval || 0);
    }, 0) / approvedRequests.length : 0;

  const averageDaysToRegistration = registeredRequests.length > 0 ?
    registeredRequests.reduce((sum, req) => {
      const status = getRegistrationStatus(req);
      return sum + (status.daysToRegistration || 0);
    }, 0) / registeredRequests.length : 0;

  // Find fastest and slowest approvals
  const approvalTimes = approvedRequests.map(req => getRegistrationStatus(req).daysToApproval || 0);
  const fastestApproval = approvalTimes.length > 0 ? Math.min(...approvalTimes) : 0;
  const slowestApproval = approvalTimes.length > 0 ? Math.max(...approvalTimes) : 0;

  // Count overdue requests
  const overdueRequests = requests.filter(req => getRegistrationStatus(req).isOverdue).length;

  // Calculate completion rate
  const completionRate = requests.length > 0 ? (registeredRequests.length / requests.length) * 100 : 0;

  // Stage distribution
  const stageDistribution = requests.reduce((dist, req) => {
    const stage = req.status;
    dist[stage] = (dist[stage] || 0) + 1;
    return dist;
  }, {} as Record<string, number>);

  return {
    averageDaysToApproval,
    averageDaysToRegistration,
    overdueRequests,
    fastestApproval,
    slowestApproval,
    completionRate,
    stageDistribution
  };
}

/**
 * Generate comprehensive analytics report
 * Part of REQ-016: System Admin Back Office Analytics
 */
export async function generateAnalyticsReport(userId?: string): Promise<AnalyticsReport> {
  try {
    // Get basic counts
    const [usersResult, accountsResult, itemsResult, visitsResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('accounts').select('id', { count: 'exact' }),
      supabase.from('items').select('id', { count: 'exact' }),
      supabase.from('item_visits').select('id', { count: 'exact' })
    ]);

    const totalUsers = usersResult.count || 0;
    const totalAccounts = accountsResult.count || 0;
    const totalItems = itemsResult.count || 0;
    const totalVisits = visitsResult.count || 0;

    // Get user metrics
    const { data: usersWithOwnedAccounts } = await supabase
      .from('accounts')
      .select('owner_id')
      .not('owner_id', 'is', null);

    const { data: usersWithAccessAccounts } = await supabase
      .from('account_users')
      .select('user_id');

    const uniqueOwnedAccountUsers = new Set(usersWithOwnedAccounts?.map(acc => acc.owner_id)).size;
    const uniqueAccessAccountUsers = new Set(usersWithAccessAccounts?.map(au => au.user_id)).size;

    // Get visit metrics
    const allAccountIds = accountsResult.data?.map(acc => acc.id) || [];
    const visitMetrics = await aggregateVisitData(allAccountIds);

    // Get access metrics
    const accessMetrics = await computeAccessStatistics(userId);

    return {
      totalUsers,
      totalAccounts,
      totalItems,
      totalVisits,
      userMetrics: {
        usersWithOwnedAccounts: uniqueOwnedAccountUsers,
        usersWithAccessAccounts: uniqueAccessAccountUsers,
        avgAccountsPerUser: totalUsers > 0 ? totalAccounts / totalUsers : 0
      },
      visitMetrics,
      accessMetrics
    };
  } catch (error) {
    console.error('Error generating analytics report:', error);
    throw error;
  }
}