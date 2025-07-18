import { Currency } from '../services/api';

/**
 * Formats a currency amount with the provided currency object
 * @param amount - The amount to format
 * @param currency - The currency object containing symbol and formatting info
 * @returns Formatted currency string
 */
export function formatCurrencyAmount(
  amount: number,
  currency?: Currency,
): string {
  if (!currency) {
    // Fallback to USD if no currency provided
    return (
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + ' $'
    );
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formattedAmount} ${currency.symbol}`;
}

/**
 * Formats a currency amount for short display (like in widgets)
 * @param amount - The amount to format
 * @param currency - The currency object containing symbol and formatting info
 * @returns Formatted currency string with K/M/B abbreviations
 */
export function formatCurrencyAmountShort(
  amount: number,
  currency?: Currency,
): string {
  const absValue = Math.abs(amount);
  const rounded = Math.round(amount);

  // If less than 1000, show full amount
  if (absValue < 1000) {
    return formatCurrencyAmount(rounded, currency);
  }

  const symbol = currency?.symbol || '$';

  // Use abbreviations for larger amounts
  if (absValue >= 1000000000) {
    const formatted = (amount / 1000000000).toFixed(2);
    return `${formatted}B ${symbol}`.replace('.00B', 'B');
  } else if (absValue >= 1000000) {
    const formatted = (amount / 1000000).toFixed(2);
    return `${formatted}M ${symbol}`.replace('.00M', 'M');
  } else if (absValue >= 1000) {
    const formatted = (amount / 1000).toFixed(2);
    return `${formatted}K ${symbol}`.replace('.00K', 'K');
  } else {
    return `${rounded.toLocaleString('en-US')} ${symbol}`;
  }
}

/**
 * Formats a currency amount for Income/Expenses cards with max 6 characters
 * @param amount - The amount to format
 * @param currency - The currency object containing symbol and formatting info
 * @returns Formatted currency string (max 6 chars including symbol)
 */
export function formatCurrencyCompact(
  amount: number,
  currency?: Currency,
): string {
  const absValue = Math.abs(amount);
  const symbol = currency?.symbol || '$';
  const isNegative = amount < 0;

  // For very small amounts (< 1), show 0
  if (absValue < 1) {
    return `0${symbol}`;
  }

  // Rules for different ranges to stay under 6 characters total:

  // 1-999: show full amount (e.g., "123$", "99₽")
  if (absValue < 1000) {
    const rounded = Math.round(absValue);
    return `${isNegative ? '-' : ''}${rounded}${symbol}`;
  }

  // 1K-9.9K: show one decimal (e.g., "1.2K$", "9.9K₽")
  if (absValue < 10000) {
    const formatted = (absValue / 1000).toFixed(1);
    return `${isNegative ? '-' : ''}${formatted}K${symbol}`;
  }

  // 10K-99K: show whole number (e.g., "12K$", "99K₽")
  if (absValue < 100000) {
    const formatted = Math.round(absValue / 1000);
    return `${isNegative ? '-' : ''}${formatted}K${symbol}`;
  }

  // 100K-999K: show whole number (e.g., "123K$", "999K₽")
  if (absValue < 1000000) {
    const formatted = Math.round(absValue / 1000);
    return `${isNegative ? '-' : ''}${formatted}K${symbol}`;
  }

  // 1M-9.9M: show one decimal (e.g., "1.2M$", "9.9M₽")
  if (absValue < 10000000) {
    const formatted = (absValue / 1000000).toFixed(1);
    return `${isNegative ? '-' : ''}${formatted}M${symbol}`;
  }

  // 10M-99M: show whole number (e.g., "12M$", "99M₽")
  if (absValue < 100000000) {
    const formatted = Math.round(absValue / 1000000);
    return `${isNegative ? '-' : ''}${formatted}M${symbol}`;
  }

  // 100M-999M: show whole number (e.g., "123M$", "999M₽")
  if (absValue < 1000000000) {
    const formatted = Math.round(absValue / 1000000);
    return `${isNegative ? '-' : ''}${formatted}M${symbol}`;
  }

  // 1B+: show one decimal (e.g., "1.2B$", "9.9B₽")
  const formatted = (absValue / 1000000000).toFixed(1);
  return `${isNegative ? '-' : ''}${formatted}B${symbol}`;
}

export default formatCurrencyAmount;
