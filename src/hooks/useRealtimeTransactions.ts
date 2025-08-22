import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transaction';
import { getTransactions } from '@/utils/storage';

export function useRealtimeTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial transactions
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    const getCurrentUserId = () => {
      const userStr = localStorage.getItem('goldease_user');
      if (!userStr) return null;
      try {
        const user = JSON.parse(userStr);
        return user.id;
      } catch {
        return null;
      }
    };

    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('No user ID found for realtime subscription');
      return;
    }

    console.log('Setting up realtime subscription for user:', userId);

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          const transactionId = (payload.new as any)?.id || (payload.old as any)?.id || 'unknown';
          console.log('Realtime transaction update received:', payload.eventType, transactionId);
          
          // Reload transactions when any change occurs
          try {
            const data = await getTransactions();
            setTransactions(data);
            console.log('Transactions reloaded after realtime update');
          } catch (error) {
            console.error('Failed to reload transactions after realtime update:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  return { transactions, isLoading, refreshTransactions: async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    }
  }};
}