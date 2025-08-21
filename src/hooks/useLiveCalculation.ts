import { useState, useEffect, useMemo } from 'react';
import { TransactionType } from '@/types/transaction';
import { calculateTransaction } from '@/utils/calculations';
import { FormData } from '@/utils/formValidation';

export function useLiveCalculation(formData: FormData, transactionType: TransactionType) {
  const [liveCalculation, setLiveCalculation] = useState<any>(null);

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

  useEffect(() => {
    // Immediate calculation updates as form changes
    setLiveCalculation(calculation);
  }, [calculation]);

  return liveCalculation;
}