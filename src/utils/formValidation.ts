import { TransactionType } from '@/types/transaction';

export interface FormData {
  weight: string;
  purity: string;
  reduction: string;
  rate: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateTransactionForm(
  formData: FormData,
  transactionType: TransactionType
): ValidationErrors {
  const errors: ValidationErrors = {};
  
  // Weight validation
  if (!formData.weight || parseFloat(formData.weight) <= 0) {
    errors.weight = 'Weight must be greater than 0';
  }
  
  // Purity validation (not for Sale)
  if (transactionType !== 'SALE') {
    if (!formData.purity || parseFloat(formData.purity) <= 0 || parseFloat(formData.purity) > 100) {
      errors.purity = 'Purity must be between 1-100%';
    }
  }
  
  // Reduction validation (only for Exchange)
  if (transactionType === 'EXCHANGE') {
    if (!formData.reduction || parseFloat(formData.reduction) < 0) {
      errors.reduction = 'Reduction cannot be negative';
    }
  }
  
  // Rate validation (not for Exchange)
  if (transactionType !== 'EXCHANGE') {
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      errors.rate = 'Rate must be greater than 0';
    }
  }

  return errors;
}

export function isFormValid(
  formData: FormData,
  transactionType: TransactionType
): boolean {
  const errors = validateTransactionForm(formData, transactionType);
  return Object.keys(errors).length === 0;
}