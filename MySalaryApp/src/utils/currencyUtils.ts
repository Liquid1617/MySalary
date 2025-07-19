/**
 * Get currency symbol for a given currency code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'RUB': '₽',
    'JPY': '¥',
    'CNY': '¥',
    'KZT': '₸',
    'BYN': 'Br',
    'UAH': '₴',
  };
  return currencySymbols[currencyCode] || currencyCode;
};

/**
 * Format currency amount with the budget's currency symbol
 */
export const formatBudgetCurrency = (
  amount: number, 
  budgetCurrency: string,
  formatCurrency: (amount: number, symbol?: string) => string
): string => {
  if (!budgetCurrency) return formatCurrency(amount);
  const symbol = getCurrencySymbol(budgetCurrency);
  return formatCurrency(amount, symbol);
};