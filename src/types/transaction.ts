export type TransactionType = 'EXCHANGE' | 'PURCHASE' | 'SALE';

export interface Transaction {
  id: string;
  type: TransactionType;
  weight: number;
  purity: number;
  reduction?: number;
  rate: number;
  
  fineGold: number;
  amount: number;
  profit?: number; // For exchange transactions
  remainingFineGold?: number;
  date: Date;
}

export interface CalculationResult {
  fineGold: number;
  amount: number;
  profit?: number; // For exchange transactions
  remainingFineGold?: number;
}