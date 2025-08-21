import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  total_users: number;
  total_businesses: number;
  total_transactions: number;
  today_transactions: number;
}

interface BusinessAnalytics {
  business_name: string;
  user_id: string;
  business_created: string;
  transaction_count: number;
  total_amount: number;
  last_transaction: string;
}

export function useAdminData() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [businesses, setBusinesses] = useState<BusinessAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminStats = async () => {
    try {
      // Fetch basic stats
      const [usersResult, businessesResult, transactionsResult, todayTransactionsResult] = await Promise.all([
        supabase.auth.admin.listUsers(),
        supabase.from('business_profiles').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('transactions').select('*').gte('created_at', new Date().toISOString().split('T')[0])
      ]);

      const adminStats: AdminStats = {
        total_users: usersResult.data?.users?.length || 0,
        total_businesses: businessesResult.data?.length || 0,
        total_transactions: transactionsResult.data?.length || 0,
        today_transactions: todayTransactionsResult.data?.length || 0,
      };

      setStats(adminStats);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to fetch admin statistics');
    }
  };

  const fetchBusinessAnalytics = async () => {
    try {
      const { data: businessProfiles, error: businessError } = await supabase
        .from('business_profiles')
        .select('*');

      if (businessError) throw businessError;

      const analyticsData: BusinessAnalytics[] = [];

      for (const business of businessProfiles || []) {
        const { data: transactions, error: transError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', business.user_id);

        if (transError) {
          console.error('Error fetching transactions for business:', transError);
          continue;
        }

        const totalAmount = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        const lastTransaction = transactions?.length > 0 
          ? Math.max(...transactions.map(t => new Date(t.created_at).getTime()))
          : null;

        analyticsData.push({
          business_name: business.name || 'Unnamed Business',
          user_id: business.user_id,
          business_created: business.created_at,
          transaction_count: transactions?.length || 0,
          total_amount: totalAmount,
          last_transaction: lastTransaction ? new Date(lastTransaction).toISOString() : '',
        });
      }

      setBusinesses(analyticsData);
    } catch (err) {
      console.error('Error fetching business analytics:', err);
      setError('Failed to fetch business analytics');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      fetchAdminStats(),
      fetchBusinessAnalytics()
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    stats,
    businesses,
    loading,
    error,
    refreshData: fetchData,
  };
}