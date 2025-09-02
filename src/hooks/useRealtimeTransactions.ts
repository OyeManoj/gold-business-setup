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
    const setupRealtime = async () => {
      // Get user ID from custom auth
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) {
        console.warn('No authenticated user found for realtime subscription');
        return;
      }
      
      let customUserId;
      try {
        const userData = JSON.parse(storedUser);
        customUserId = userData.user_id; // 4-digit custom user ID
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        return;
      }

      console.log('Setting up realtime subscription for custom user:', customUserId);

      const channel = supabase
        .channel('transactions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${customUserId}`
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
    };

    setupRealtime();
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