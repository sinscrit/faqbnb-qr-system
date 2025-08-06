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