import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export const useUserCurrency = () => {
  const [userCurrency, setUserCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserCurrency();
  }, []);

  const loadUserCurrency = async () => {
    try {
      setLoading(true);
      
      // Try to get current user data first
      const currentUser = await apiService.getCurrentUser();
      if (currentUser?.user?.primaryCurrency) {
        setUserCurrency(currentUser.user.primaryCurrency);
        return;
      }
      
      // Fallback to stored user data
      const storedUser = await apiService.getStoredUser();
      if (storedUser?.primaryCurrency) {
        setUserCurrency(storedUser.primaryCurrency);
        return;
      }
      
      // Default fallback
      setUserCurrency({
        id: 1,
        code: 'USD',
        name: 'US Dollar',
        symbol: '$'
      });
    } catch (error) {
      console.error('Error loading user currency:', error);
      // Default fallback on error
      setUserCurrency({
        id: 1,
        code: 'USD',
        name: 'US Dollar',
        symbol: '$'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currencyOverride?: string) => {
    const currency = currencyOverride || userCurrency?.symbol || '$';
    return `${amount.toLocaleString('ro-MD', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })} ${currency}`;
  };

  return {
    userCurrency,
    loading,
    formatCurrency,
    refreshUserCurrency: loadUserCurrency,
  };
};