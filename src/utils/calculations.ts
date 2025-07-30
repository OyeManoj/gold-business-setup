import { CalculationResult, TransactionType } from '@/types/transaction';

export function calculateExchange(
  weight: number, 
  purity: number, 
  reduction: number, 
  rate: number
): CalculationResult {
  const fineGold = weight * (purity - reduction) / 100;
  const amount = fineGold * rate;
  
  return { 
    fineGold: Number(fineGold.toFixed(3)), 
    amount: Number(amount.toFixed(2))
  };
}

export function calculatePurchase(
  weight: number, 
  purity: number, 
  rate: number
): CalculationResult {
  const fineGold = weight * purity / 100;
  const amount = fineGold * rate;
  
  return { 
    fineGold: Number(fineGold.toFixed(3)), 
    amount: Number(amount.toFixed(2)) 
  };
}

export function calculateSale(
  weight: number, 
  rate: number
): CalculationResult {
  const amount = weight * rate;
  
  return { 
    fineGold: weight, 
    amount: Number(amount.toFixed(2)) 
  };
}

export function calculateTransaction(
  type: TransactionType,
  weight: number,
  purity: number,
  rate: number,
  reduction?: number
): CalculationResult {
  switch (type) {
    case 'EXCHANGE':
      return calculateExchange(weight, purity, reduction || 0, rate);
    case 'PURCHASE':
      return calculatePurchase(weight, purity, rate);
    case 'SALE':
      return calculateSale(weight, rate);
    default:
      throw new Error('Invalid transaction type');
  }
}