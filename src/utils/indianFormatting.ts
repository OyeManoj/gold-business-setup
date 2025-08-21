/**
 * Formats numbers according to Indian numbering system
 * Uses lakhs and crores with proper comma placement
 */
export function formatIndianNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formats currency in Indian format with ₹ symbol
 */
export function formatIndianCurrency(amount: number): string {
  return `₹${formatIndianNumber(amount, 2)}`;
}

/**
 * Formats rates (₹/g) in Indian format
 */
export function formatIndianRate(rate: number): string {
  return `₹${formatIndianNumber(rate, 2)}/g`;
}

/**
 * Formats weight with proper decimal places
 */
export function formatWeight(weight: number): string {
  return formatIndianNumber(weight, 3);
}

/**
 * Formats percentage with proper decimal places
 */
export function formatPercentage(percentage: number): string {
  return formatIndianNumber(percentage, 2);
}