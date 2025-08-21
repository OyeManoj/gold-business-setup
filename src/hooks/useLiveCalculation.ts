import { useState, useEffect, useMemo } from 'react';
import { TransactionType } from '@/types/transaction';
import { calculateTransaction } from '@/utils/calculations';
import { FormData } from '@/utils/formValidation';
import { supabase } from '@/integrations/supabase/client';

export function useLiveCalculation(formData: FormData, transactionType: TransactionType) {
  const [liveCalculation, setLiveCalculation] = useState<any>(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);

  const calculation = useMemo(() => {
    const weight = parseFloat(formData.weight) || 0;
    const purity = transactionType === 'SALE' ? 100 : (parseFloat(formData.purity) || 0);
    const rate = parseFloat(formData.rate) || 0;
    const reduction = transactionType === 'EXCHANGE' ? (parseFloat(formData.reduction) || 0) : 0;

    try {
      // Show live calculation with any input data
      if (transactionType === 'EXCHANGE') {
        // For Exchange: show calculation with any weight or purity
        if (weight > 0 && purity > 0) {
          return calculateTransaction(transactionType, weight, purity, 1, reduction);
        }
      } else {
        // For Purchase/Sale: show calculation with weight and rate
        if (weight > 0 && rate > 0 && (transactionType === 'SALE' || purity > 0)) {
          return calculateTransaction(transactionType, weight, purity, rate, reduction);
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [formData, transactionType]);

  // Real-time updates for calculation changes
  useEffect(() => {
    const channel = supabase
      .channel('calculation-updates')
      .on('presence', { event: 'sync' }, () => {
        setIsRealTimeActive(true);
      })
      .on('presence', { event: 'join' }, () => {
        setIsRealTimeActive(true);
      })
      .on('presence', { event: 'leave' }, () => {
        setIsRealTimeActive(false);
      })
      .subscribe();

    // Track calculation state for live updates
    if (calculation) {
      channel.track({
        calculation,
        timestamp: new Date().toISOString(),
        transactionType
      });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [calculation, transactionType]);

  useEffect(() => {
    // Immediate calculation updates with visual feedback
    const timer = setTimeout(() => {
      setLiveCalculation({
        ...calculation,
        isLive: isRealTimeActive,
        lastUpdate: new Date().toISOString()
      });
    }, 50); // Faster response for live feel
    
    return () => clearTimeout(timer);
  }, [calculation, isRealTimeActive]);

  return liveCalculation;
}