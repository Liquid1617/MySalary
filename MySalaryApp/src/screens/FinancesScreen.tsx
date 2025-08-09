import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { homeScreenStyles } from '../styles';
import { biometricService, BiometricCapability } from '../services/biometric';
import { apiService, type Currency } from '../services/api';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { AccountsManagementModal } from '../components/AccountsManagementModal';
import { AddAccountModal } from '../components/AddAccountModal';
import { BudgetCard } from '../components/BudgetCard';
import { SwipeableTransactionRow } from '../components/SwipeableTransactionRow';
import { SnackBar } from '../components/SnackBar';
import { BudgetResponse } from '../types/budget';
import { useBudgets, useBudgetActions } from '../hooks/useBudgets';
import { useQueryClient } from '@tanstack/react-query';
import {
  formatCurrencyAmountShort,
  formatCurrencyCompact,
  formatAccountBalance,
} from '../utils/formatCurrency';
import { getAccountTypeIcon } from '../utils/accountTypeIcon';
import { Transaction } from '../types/transaction';

const getCurrentDate = () => {
  const today = new Date();
  let month = today.toLocaleDateString('en-US', { month: 'long' });
  // Truncate month name to 3 characters if longer than 4
  if (month.length > 4) {
    month = month.substring(0, 3);
  }
  const day = today.getDate();
  return { month, day };
};

// Function to convert amount from one currency to another
const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): number => {
  if (fromCurrency === toCurrency) return amount;

  // Exchange rates (approximate, could be fetched from API)
  const exchangeRates: { [key: string]: number } = {
    USD: 1.0,
    RUB: 0.011, // 1 RUB = 0.011 USD (approximately 90 RUB per USD)
    EUR: 1.09, // 1 EUR = 1.09 USD
    GBP: 1.27, // 1 GBP = 1.27 USD
    CNY: 0.14, // 1 CNY = 0.14 USD
    KZT: 0.002, // 1 KZT = 0.002 USD
    BYN: 0.3, // 1 BYN = 0.30 USD
    UAH: 0.025, // 1 UAH = 0.025 USD
  };

  // Convert from source currency to USD, then from USD to target currency
  const fromRate = exchangeRates[fromCurrency?.toUpperCase()] || 1.0;
  const toRate = exchangeRates[toCurrency?.toUpperCase()] || 1.0;

  const amountInUSD = amount * fromRate;
  return amountInUSD / toRate;
};

// Functions to calculate monthly totals from transactions in user's currency
const calculateMonthlyTotals = (
  transactions: Transaction[],
  userCurrency: Currency | undefined,
) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  const targetCurrency = userCurrency?.code || 'USD';

  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.transaction_date);
    if (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear &&
      (transaction.status === 'posted' || !transaction.status) // Include legacy transactions without status
    ) {
      const amount = parseFloat(transaction.amount) || 0;
      const transactionCurrency = transaction.account?.currency?.code || 'USD';
      const convertedAmount = convertCurrency(
        amount,
        transactionCurrency,
        targetCurrency,
      );

      if (transaction.transaction_type === 'income') {
        monthlyIncome += convertedAmount;
      } else if (transaction.transaction_type === 'expense') {
        monthlyExpenses += convertedAmount;
      }
    }
  });

  return { monthlyIncome, monthlyExpenses };
};

// Function to calculate previous month totals for comparison in user's currency
const calculatePreviousMonthTotals = (
  transactions: Transaction[],
  userCurrency: Currency | undefined,
) => {
  const currentDate = new Date();
  const previousMonth =
    currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
  const previousYear =
    currentDate.getMonth() === 0
      ? currentDate.getFullYear() - 1
      : currentDate.getFullYear();

  let previousMonthIncome = 0;
  let previousMonthExpenses = 0;

  const targetCurrency = userCurrency?.code || 'USD';

  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.transaction_date);
    if (
      transactionDate.getMonth() === previousMonth &&
      transactionDate.getFullYear() === previousYear
    ) {
      const amount = parseFloat(transaction.amount) || 0;
      const transactionCurrency = transaction.account?.currency?.code || 'USD';
      const convertedAmount = convertCurrency(
        amount,
        transactionCurrency,
        targetCurrency,
      );

      if (transaction.transaction_type === 'income') {
        previousMonthIncome += convertedAmount;
      } else if (transaction.transaction_type === 'expense') {
        previousMonthExpenses += convertedAmount;
      }
    }
  });

  return { previousMonthIncome, previousMonthExpenses };
};

// Function to calculate net worth change percentage
const calculateNetWorthChange = (
  transactions: Transaction[],
  userCurrency: Currency | undefined,
) => {
  const { monthlyIncome, monthlyExpenses } = calculateMonthlyTotals(
    transactions,
    userCurrency,
  );
  const { previousMonthIncome, previousMonthExpenses } =
    calculatePreviousMonthTotals(transactions, userCurrency);

  const currentNetFlow = monthlyIncome - monthlyExpenses;
  const previousNetFlow = previousMonthIncome - previousMonthExpenses;

  if (previousNetFlow === 0) {
    return {
      change: currentNetFlow > 0 ? 100 : currentNetFlow < 0 ? 100 : 0,
      isPositive: currentNetFlow >= 0,
    };
  }

  const percentChange =
    ((currentNetFlow - previousNetFlow) / Math.abs(previousNetFlow)) * 100;
  return {
    change: percentChange,
    isPositive: percentChange >= 0,
  };
};

// Минималистичная иконка изменения баланса
const BalanceChangeIcon = ({
  size = 32,
  color = 'default',
}: {
  size?: number;
  color?: 'default' | 'light';
}) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <View style={{ position: 'relative' }}>
      {/* Стрелка вверх (доход) */}
      <View
        style={{
          position: 'absolute',
          top: -2,
          left: 0,
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderBottomWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor:
            color === 'light' ? 'rgba(255, 255, 255, 0.9)' : '#22C55E',
        }}
      />
      {/* Стрелка вниз (расход) */}
      <View
        style={{
          position: 'absolute',
          top: 8,
          left: 0,
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor:
            color === 'light' ? 'rgba(255, 255, 255, 0.7)' : '#EF4444',
        }}
      />
    </View>
  </View>
);

export const FinancesScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const [biometricCapability, setBiometricCapability] =
    useState<BiometricCapability | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [netWorth, setNetWorth] = useState<any>(null);
  const [netWorthLoading, setNetWorthLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showEditTransactionModal, setShowEditTransactionModal] =
    useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showAccountsManagementModal, setShowAccountsManagementModal] =
    useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [undoAction, setUndoAction] = useState<(() => void) | null>(null);

  // Budget data
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const { deleteBudget } = useBudgetActions();
  const queryClient = useQueryClient();
  const [userCurrency, setUserCurrency] = useState<Currency | undefined>(
    undefined,
  );
  const [user, setUser] = useState<any>(null);

  // Animation for floating button
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Calculate monthly totals and net worth change
  const { monthlyIncome, monthlyExpenses } = calculateMonthlyTotals(
    transactions,
    userCurrency,
  );
  const { previousMonthIncome, previousMonthExpenses } =
    calculatePreviousMonthTotals(transactions, userCurrency);

  // Calculate percentage changes
  const incomePercentChange =
    previousMonthIncome === 0
      ? monthlyIncome > 0
        ? 100
        : 0
      : ((monthlyIncome - previousMonthIncome) / previousMonthIncome) * 100;

  const expensesPercentChange =
    previousMonthExpenses === 0
      ? monthlyExpenses > 0
        ? 100
        : 0
      : ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) *
      100;

  // Calculate absolute change as income - expenses
  const monthlyNetChange = monthlyIncome - monthlyExpenses;
  const isNetChangePositive = monthlyNetChange >= 0;

  useEffect(() => {
    initializeBiometric();
    loadUserProfile();
    loadTransactions();
    loadNetWorth();
    loadAccounts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      loadTransactions();
      loadNetWorth();
      loadAccounts();
    }, []),
  );

  const initializeBiometric = async () => {
    try {
      const capability = await biometricService.checkBiometricCapability();
      setBiometricCapability(capability);

      if (capability.available) {
        const isEnabled = await biometricService.isBiometricEnabled();
        setBiometricEnabled(isEnabled);
      }
    } catch (error) {
      console.error('Ошибка инициализации биометрии:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      if (currentUser && currentUser.user) {
        setUser(currentUser.user);
        if (currentUser.user.primaryCurrency) {
          setUserCurrency(currentUser.user.primaryCurrency);
        }
      } else if (currentUser) {
        // If response doesn't have nested user object
        setUser(currentUser);
        if (currentUser.primaryCurrency) {
          setUserCurrency(currentUser.primaryCurrency);
        }
      } else {
        // Fallback to stored user
        const storedUser = await apiService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          if (storedUser.primaryCurrency) {
            setUserCurrency(storedUser.primaryCurrency);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Continue without currency, will fallback to USD
    }
  };

  const loadTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const transactionsData = await apiService.get<Transaction[]>(
        '/transactions',
      );
      setTransactions(transactionsData || []);
    } catch (error) {
      // Тихо обрабатываем ошибку без вывода в консоль
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadNetWorth = async () => {
    try {
      setNetWorthLoading(true);
      const netWorthData = await apiService.get<any>('/networth');
      setNetWorth(netWorthData);
    } catch (error) {
      // Тихо обрабатываем ошибку без вывода в консоль
      setNetWorth(null);
    } finally {
      setNetWorthLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setAccountsLoading(true);
      const accountsData = await apiService.get<any[]>('/accounts');
      // Sort accounts by balance in USD equivalent (highest to lowest)
      const sortedAccounts = (accountsData || []).sort((a, b) => {
        const balanceAInUSD = convertCurrency(
          parseFloat(a.balance) || 0,
          a.currency?.code || 'USD',
          'USD',
        );
        const balanceBInUSD = convertCurrency(
          parseFloat(b.balance) || 0,
          b.currency?.code || 'USD',
          'USD',
        );
        return balanceBInUSD - balanceAInUSD;
      });
      setAccounts(sortedAccounts);
    } catch (error) {
      // Тихо обрабатываем ошибку без вывода в консоль
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  };

  // Remove the old formatNetWorth function - we'll use formatCurrencyAmount instead

  const formatTransactionDate = (dateString: string) => {
    const transactionDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare dates only
    const transactionDateOnly = new Date(
      transactionDate.getFullYear(),
      transactionDate.getMonth(),
      transactionDate.getDate(),
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );

    // Проверяем, является ли дата будущей
    const isFuture = transactionDateOnly.getTime() > todayOnly.getTime();

    if (transactionDateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (transactionDateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else if (isFuture) {
      const formatted = transactionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return `📅 ${formatted}`; // Добавляем иконку календаря для будущих дат
    } else {
      return transactionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Функция для проверки, является ли транзакция запланированной
  const isTransactionFuture = (dateString: string) => {
    const transactionDate = new Date(dateString);
    const today = new Date();

    const transactionDateOnly = new Date(
      transactionDate.getFullYear(),
      transactionDate.getMonth(),
      transactionDate.getDate(),
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    return transactionDateOnly.getTime() > todayOnly.getTime();
  };

  const getCategoryIcon = (categoryName: string, categoryType: string) => {
    // Income category icons
    if (categoryType === 'income') {
      switch (categoryName.toLowerCase()) {
        case 'salary':
          return { icon: 'money-bill-wave', color: '#6B7280' };
        case 'bonus & rewards':
          return { icon: 'gift', color: '#6B7280' };
        case 'freelance':
          return { icon: 'laptop', color: '#6B7280' };
        case 'investments':
          return { icon: 'chart-line', color: '#6B7280' };
        case 'sales & trade':
          return { icon: 'handshake', color: '#6B7280' };
        case 'rental income':
          return { icon: 'home', color: '#6B7280' };
        case 'pension & benefits':
          return { icon: 'shield-alt', color: '#6B7280' };
        case 'scholarship':
          return { icon: 'graduation-cap', color: '#6B7280' };
        case 'gifts & inheritance':
          return { icon: 'gift', color: '#6B7280' };
        case 'tax refund':
          return { icon: 'file-invoice-dollar', color: '#6B7280' };
        case 'cashback':
          return { icon: 'credit-card', color: '#6B7280' };
        case 'other income':
          return { icon: 'plus-circle', color: '#6B7280' };
        default:
          return { icon: 'arrow-up', color: '#6B7280' };
      }
    }

    // Expense category icons
    switch (categoryName.toLowerCase()) {
      case 'food & groceries':
        return { icon: 'shopping-cart', color: '#6B7280' };
      case 'transportation':
        return { icon: 'car', color: '#6B7280' };
      case 'utilities':
        return { icon: 'bolt', color: '#6B7280' };
      case 'entertainment':
        return { icon: 'gamepad', color: '#6B7280' };
      case 'clothing & shoes':
        return { icon: 'tshirt', color: '#6B7280' };
      case 'healthcare':
        return { icon: 'heartbeat', color: '#6B7280' };
      case 'education':
        return { icon: 'graduation-cap', color: '#6B7280' };
      case 'home & garden':
        return { icon: 'home', color: '#6B7280' };
      case 'loans & credit':
        return { icon: 'credit-card', color: '#6B7280' };
      case 'sports & fitness':
        return { icon: 'dumbbell', color: '#6B7280' };
      case 'travel':
        return { icon: 'plane', color: '#6B7280' };
      case 'restaurants & cafes':
        return { icon: 'utensils', color: '#6B7280' };
      case 'gas & parking':
        return { icon: 'gas-pump', color: '#6B7280' };
      case 'beauty & care':
        return { icon: 'spa', color: '#6B7280' };
      case 'gifts':
        return { icon: 'gift', color: '#6B7280' };
      case 'other expenses':
        return { icon: 'ellipsis-h', color: '#6B7280' };
      default:
        return { icon: 'arrow-down', color: '#6B7280' };
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      if (value) {
        const authResult = await biometricService.authenticateWithBiometrics(
          'Confirm biometric authentication setup',
        );

        if (authResult.success) {
          await biometricService.setBiometricEnabled(true);
          setBiometricEnabled(true);
          Alert.alert(
            'Success',
            `${biometricService.getBiometryDisplayName(
              biometricCapability?.biometryType || null,
            )} successfully set up for app login`,
          );
        } else {
          Alert.alert(
            'Error',
            authResult.error || 'Failed to set up biometrics',
          );
        }
      } else {
        await biometricService.setBiometricEnabled(false);
        setBiometricEnabled(false);
        Alert.alert('Biometrics Disabled', 'Biometric login disabled');
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      Alert.alert('Error', 'Failed to change biometric settings');
    }
  };

  const handleTransactionPress = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowEditTransactionModal(true);
  };

  const handleConfirmTransaction = async (transaction: Transaction) => {
    try {
      // Store original transaction for undo
      const originalTransaction = { ...transaction };

      // Optimistically update UI - remove from scheduled list
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));

      // Confirm on server
      await apiService.confirmTransaction(transaction.id, 'scheduledDate');

      // Invalidate budget cache to refresh spending totals
      queryClient.invalidateQueries({ queryKey: ['budgets'] });

      // Show success message with undo
      const dateStr = new Date(transaction.transaction_date).toLocaleDateString(
        'en-US',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
      );

      setSnackBarMessage(`Transaction confirmed for ${dateStr}`);
      setUndoAction(() => () => undoConfirmation(originalTransaction));
      setSnackBarVisible(true);

      // Reload transactions after a delay
      setTimeout(() => {
        loadTransactions();
        loadNetWorth();
        loadAccounts();
      }, 500);
    } catch (error) {
      console.error('Error confirming transaction:', error);
      Alert.alert('Error', 'Failed to confirm transaction');
      // Reload to restore correct state
      loadTransactions();
    }
  };

  const undoConfirmation = async (originalTransaction: Transaction) => {
    try {
      // Call API to revert transaction status on server
      await apiService.unconfirmTransaction(originalTransaction.id);

      // Invalidate budget cache
      queryClient.invalidateQueries({ queryKey: ['budgets'] });

      // Reload all data
      loadTransactions();
      loadNetWorth();
      loadAccounts();

      console.log(
        'Successfully undid confirmation for transaction:',
        originalTransaction.id,
      );
    } catch (error) {
      console.error('Error undoing confirmation:', error);
      Alert.alert('Error', 'Failed to undo transaction confirmation');
      // Reload to get correct state from server
      loadTransactions();
    }
  };

  const handleBudgetPress = (budget: BudgetResponse) => {
    // Navigate to BudgetDetailScreen
    navigation.navigate('BudgetDetail', { budgetId: budget.id });
  };

  const handleCreateBudget = () => {
    navigation.navigate('BudgetEdit', {});
  };

  const handleEditBudget = (budget: BudgetResponse) => {
    navigation.navigate('BudgetEdit', { budget });
  };

  const handleDeleteBudget = async (budget: BudgetResponse) => {
    try {
      await deleteBudget.mutateAsync(budget.id);
      console.log('Budget deleted successfully');
    } catch (error) {
      console.error('Error deleting budget:', error);
      Alert.alert('Error', 'Failed to delete budget');
    }
  };

  return (
    <>
      {/* Устанавливаем светлый статус-бар */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: '#F6F7F8' }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
        {/* New header design with gradient background */}
        <LinearGradient
          colors={['#D1CCFF', '#8CE6F3', '#7AF0C4', '#C7FB33']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          useAngle={true}
          angle={30}
          style={{
            height: 296,
            paddingTop: insets.top, // Отступ для статус-бара
            paddingBottom: 20,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}>
          {/* Header with greeting and date */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingHorizontal: 24,
              paddingTop: 16,
              marginBottom: 28,
            }}>
            {/* Left side - Greeting */}
            <View>
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(0, 0, 0, 0.7)',
                  marginBottom: 4,
                }}>
                Hello,
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#000',
                }}>
                {user?.name || 'User'}!
              </Text>
            </View>

            {/* Right side - Date */}
            <View style={{ alignItems: 'flex-end' }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  backgroundColor: '#252233',
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 2,
                    height: 2,
                  },
                  shadowOpacity: 0.17,
                  shadowRadius: 12,
                  elevation: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#A0F5A0',
                    fontWeight: '500',
                    fontFamily: 'Commissioner-Medium',
                    lineHeight: 14,
                    textAlign: 'center',
                  }}>
                  {getCurrentDate().month}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    color: '#A0F5A0',
                    fontWeight: '600',
                    fontFamily: 'Commissioner-SemiBold',
                    lineHeight: 18,
                    textAlign: 'center',
                    marginTop: 2,
                  }}>
                  {getCurrentDate().day}
                </Text>
              </View>
            </View>
          </View>

          {/* Net Worth section */}
          <View
            style={{
              paddingHorizontal: 24,
              marginTop: 10,
              marginBottom: 12,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginBottom: 6,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(0, 0, 0, 0.7)',
                  fontWeight: '500',
                }}>
                Total Net Worth
              </Text>
            </View>

            {netWorthLoading ? (
              <View>
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: '#000',
                  }}>
                  Loading...
                </Text>
              </View>
            ) : netWorth ? (
              <View>
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: 'bold',
                    color: '#000',
                    marginBottom: 8,
                  }}>
                  {formatCurrencyAmountShort(netWorth.netWorth, userCurrency)}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <FontAwesome6
                    name={
                      isNetChangePositive
                        ? 'arrow-trend-up'
                        : 'arrow-trend-down'
                    }
                    size={14}
                    color={isNetChangePositive ? '#22C55E' : '#EF4444'}
                    solid
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      color: isNetChangePositive ? '#22C55E' : '#EF4444',
                      fontWeight: '400',
                    }}>
                    {isNetChangePositive ? '+' : ''}
                    {formatCurrencyCompact(
                      Math.abs(monthlyNetChange),
                      userCurrency,
                    )}{' '}
                    this month
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#000',
                    marginBottom: 8,
                  }}>
                  Failed to load
                </Text>
                <TouchableOpacity
                  onPress={loadNetWorth}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                  }}>
                  <Text style={{ color: '#000', fontSize: 14 }}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Income/Expenses widgets and Transaction History секция НА БЕЛОМ ФОНЕ */}
        <View
          style={{
            backgroundColor: '#FDFDFE',
            paddingBottom: 24,
            paddingHorizontal: 24,
          }}>
          {/* Income and Expenses widgets in a row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 24,
              marginBottom: 16,
              gap: 12,
            }}>
            {/* Income Widget */}
            <View
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000000',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 3,
                borderWidth: 1,
                borderColor: '#F7F7F8',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 16,
                }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 20,
                    backgroundColor: '#53EFAE33',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 4,
                  }}>
                  <FontAwesome6
                    name="arrow-trend-up"
                    size={14}
                    color="#53EFAE"
                    solid
                  />
                </View>
                <View
                  style={{
                    width: 47,
                    height: 23,
                    borderRadius: 12,
                    backgroundColor: '#FAFAFA',
                    padding: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                  }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '500',
                      fontFamily: 'Commissioner-Medium',
                      color: '#53EFAE',
                      lineHeight: 10,
                    }}>
                    {incomePercentChange >= 0 ? '+' : ''}
                    {Math.abs(incomePercentChange).toFixed(0)}%
                  </Text>
                  <View
                    style={{
                      width: 10,
                      height: 6,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: -3,
                    }}>
                    <FontAwesome6
                      name="arrow-trend-up"
                      size={8}
                      color="#53EFAE"
                      solid
                    />
                  </View>
                </View>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '400',
                  fontFamily: 'Commissioner-Regular',
                  color: '#333',
                  lineHeight: 12,
                  marginBottom: 8,
                }}>
                Income
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  fontFamily: 'Commissioner-Bold',
                  color: '#000',
                  lineHeight: 20,
                }}>
                {incomePercentChange >= 0 ? '+' : '-'}
                {formatCurrencyCompact(monthlyIncome, userCurrency)}
              </Text>
            </View>

            {/* Expenses Widget */}
            <View
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000000',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 3,
                borderWidth: 1,
                borderColor: '#F7F7F8',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 16,
                }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 20,
                    backgroundColor: '#FCA1A233',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 4,
                  }}>
                  <FontAwesome6
                    name="arrow-trend-down"
                    size={14}
                    color="#FCA1A2"
                    solid
                  />
                </View>
                <View
                  style={{
                    width: 47,
                    height: 23,
                    borderRadius: 12,
                    backgroundColor: '#FAFAFA',
                    padding: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                  }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '500',
                      fontFamily: 'Commissioner-Medium',
                      color: '#FCA1A2',
                      lineHeight: 10,
                    }}>
                    {expensesPercentChange >= 0 ? '+' : ''}
                    {Math.abs(expensesPercentChange).toFixed(0)}%
                  </Text>
                  <View
                    style={{
                      width: 10,
                      height: 6,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: -3,
                    }}>
                    <FontAwesome6
                      name="arrow-trend-down"
                      size={8}
                      color="#FCA1A2"
                      solid
                    />
                  </View>
                </View>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '400',
                  fontFamily: 'Commissioner-Regular',
                  color: '#333',
                  lineHeight: 12,
                  marginBottom: 8,
                }}>
                Expenses
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  fontFamily: 'Commissioner-Bold',
                  color: '#000',
                  lineHeight: 20,
                }}>
                -{formatCurrencyCompact(monthlyExpenses, userCurrency)}
              </Text>
            </View>
          </View>

          {/* Budget Chips Section */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                paddingHorizontal: 0,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#000',
                }}>
                Budgets
              </Text>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: '#E5E5EA',
                }}
                onPress={handleCreateBudget}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: 'rgba(0, 0, 0, 0.7)',
                  }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            {budgetsLoading ? (
              <View
                style={{
                  height: 140,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: 16,
                  shadowColor: '#000000',
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: '#F7F7F8',
                }}>
                <Text style={{ fontSize: 16, color: '#666' }}>
                  Loading budgets...
                </Text>
              </View>
            ) : budgets.length === 0 ? (
              <View
                style={{
                  height: 140,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: 16,
                  shadowColor: '#000000',
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: '#F7F7F8',
                }}>
                <Text
                  style={{ fontSize: 14, fontWeight: '500', color: '#7A7E85' }}>
                  No budgets yet
                </Text>
                <Text style={{ fontSize: 12, color: '#D3D6D7', marginTop: 4 }}>
                  Create your first budget to get started
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingRight: 24,
                }}
                style={{
                  marginLeft: -24,
                  paddingLeft: 24,
                }}>
                {budgets.map(budget => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    onPress={handleBudgetPress}
                    onEdit={handleEditBudget}
                    onDelete={handleDeleteBudget}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          <View
            style={[homeScreenStyles.mainContent, { marginTop: 0, gap: 10 }]}>
            {/* Accounts Section */}
            <View
              style={{
                marginBottom: 24,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#000',
                  }}>
                  Accounts
                </Text>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: '#E5E5EA',
                  }}
                  onPress={() => setShowAccountsManagementModal(true)}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: 'rgba(0, 0, 0, 0.7)', // Same color as "Total Net Worth" text
                    }}>
                    Manage
                  </Text>
                </TouchableOpacity>
              </View>

              {accountsLoading ? (
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                  <Text style={{ fontSize: 16, color: '#666' }}>
                    Loading accounts...
                  </Text>
                </View>
              ) : accounts.length === 0 ? (
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                  <Text style={{ fontSize: 16, color: '#666' }}>
                    No accounts yet
                  </Text>
                  <Text style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                    Add your first account to get started
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                  {accounts.map((account, index) => {
                    const accountIcon = getAccountTypeIcon(
                      account.account_type,
                    );
                    return (
                      <View key={account.id}>
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 12,
                          }}
                          onPress={() =>
                            navigation.navigate('AccountDetails', { account })
                          }>
                          <View
                            style={{
                              width: 40,
                              height: 40,
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: 12,
                            }}>
                            <FontAwesome5
                              name={accountIcon.icon}
                              size={32}
                              color={accountIcon.color}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: '500',
                                color: '#000',
                                marginBottom: 2,
                              }}>
                              {account.account_name}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: accountIcon.color,
                                fontWeight: '500',
                              }}>
                              {accountIcon.name}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: '600',
                              color:
                                account.account_type === 'credit_card' &&
                                  parseFloat(account.balance) > 0
                                  ? '#EF4444'
                                  : '#000',
                            }}>
                            {account.balance
                              ? formatAccountBalance(
                                parseFloat(account.balance),
                                account.currency,
                                account.account_type,
                              )
                              : formatAccountBalance(
                                0,
                                account.currency,
                                account.account_type,
                              )}
                          </Text>
                        </TouchableOpacity>
                        {index < accounts.length - 1 && (
                          <View
                            style={{
                              height: 1,
                              backgroundColor: '#E5E5EA',
                              marginLeft: 0, // Start from the same position as the icon
                              marginRight: 0, // End at the same position as the balance text
                            }}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Recent Transactions Section */}
            <View
              style={{
                marginBottom: 24,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#000',
                  }}>
                  Future Transactions
                </Text>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: '#E5E5EA',
                  }}
                  onPress={() => navigation.navigate('AllTransactions')}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: 'rgba(0, 0, 0, 0.7)',
                    }}>
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              {transactionsLoading ? (
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                  <Text style={{ fontSize: 16, color: '#666' }}>
                    Loading transactions...
                  </Text>
                </View>
              ) : transactions.filter(t => t.status === 'scheduled').length ===
                0 ? (
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                  <Text style={{ fontSize: 16, color: '#666' }}>
                    No future transactions
                  </Text>
                  <Text style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                    Scheduled transactions will appear here
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                  {transactions
                    .filter(t => t.status === 'scheduled')
                    .slice(0, 10)
                    .map((transaction, index) => {
                      const isTransfer =
                        transaction.transaction_type === 'transfer';

                      // Get icon and color based on transaction type
                      const iconData = isTransfer
                        ? { icon: 'exchange-alt', color: '#6B7280' }
                        : getCategoryIcon(
                          transaction.category?.category_name || '',
                          transaction.category?.category_type || '',
                        );

                      const accountIcon = getAccountTypeIcon(
                        transaction.account?.account_type || '',
                      );

                      // Функция для извлечения информации о конвертации
                      const getTransferDisplayInfo = (transaction: any) => {
                        if (transaction.transaction_type !== 'transfer')
                          return null;

                        if (transaction.description) {
                          const convertMatch = transaction.description.match(
                            /\[Converted: (.+) ([A-Z]{3}) = (.+) ([A-Z]{3})\]/,
                          );
                          if (convertMatch) {
                            return {
                              fromAmount: parseFloat(convertMatch[1]),
                              fromCurrency: convertMatch[2],
                              toAmount: parseFloat(convertMatch[3]),
                              toCurrency: convertMatch[4],
                            };
                          }
                        }
                        return null;
                      };

                      const transferInfo = getTransferDisplayInfo(transaction);

                      // Check if account is deactivated
                      const isAccountDeactivated =
                        !transaction.account?.is_active;
                      const opacity = isAccountDeactivated ? 0.5 : 1.0;
                      const isScheduled = transaction.status === 'scheduled';

                      const transactionRow = (
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 12,
                          }}
                          onPress={() => handleTransactionPress(transaction)}
                          activeOpacity={0.7}>
                          {/* Category/Transfer Icon */}
                          <View
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              backgroundColor: `${iconData.color}15`,
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: 12,
                            }}>
                            <FontAwesome5
                              name={iconData.icon}
                              size={18}
                              color={iconData.color}
                            />
                          </View>

                          {/* Transaction Details */}
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: '500',
                                color: '#000',
                                marginBottom: 2,
                              }}>
                              {isTransfer
                                ? 'Transfer'
                                : transaction.category?.category_name ||
                                'Category'}
                            </Text>
                            <View
                              style={{
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                              }}>
                              {isTransfer ? (
                                <View
                                  style={{
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                  }}>
                                  {/* First Row - From Account */}
                                  <View
                                    style={{
                                      paddingHorizontal: 8,
                                      paddingVertical: 3,
                                      borderRadius: 12,
                                      backgroundColor: `${getAccountTypeIcon(
                                        transaction.account?.account_type ||
                                        '',
                                      ).color
                                        }20`,
                                      marginBottom: 4,
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 11,
                                        color: getAccountTypeIcon(
                                          transaction.account?.account_type ||
                                          '',
                                        ).color,
                                        fontWeight: '600',
                                      }}>
                                      {transaction.account?.account_name ||
                                        'Unknown'}
                                    </Text>
                                  </View>

                                  {/* Second Row - Arrow + To Account */}
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <FontAwesome5
                                      name="arrow-right"
                                      size={12}
                                      color="#6B7280"
                                      style={{ marginRight: 6 }}
                                    />

                                    <View
                                      style={{
                                        paddingHorizontal: 8,
                                        paddingVertical: 3,
                                        borderRadius: 12,
                                        backgroundColor: `${getAccountTypeIcon(
                                          transaction.targetAccount
                                            ?.account_type || '',
                                        ).color
                                          }20`,
                                      }}>
                                      <Text
                                        style={{
                                          fontSize: 11,
                                          color: getAccountTypeIcon(
                                            transaction.targetAccount
                                              ?.account_type || '',
                                          ).color,
                                          fontWeight: '600',
                                        }}>
                                        {transaction.targetAccount
                                          ?.account_name || 'Unknown'}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              ) : (
                                <View
                                  style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    borderRadius: 12,
                                    backgroundColor: `${accountIcon.color}20`,
                                    maxWidth: 120,
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      color: accountIcon.color,
                                      fontWeight: '600',
                                    }}
                                    numberOfLines={1}
                                    ellipsizeMode="tail">
                                    {transaction.account?.account_name ||
                                      'Account'}
                                  </Text>
                                </View>
                              )}
                              {isAccountDeactivated && (
                                <View
                                  style={{
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 8,
                                    backgroundColor: '#FBBF24',
                                    marginLeft: 6,
                                  }}>
                                  <Text
                                    style={{
                                      fontSize: 9,
                                      color: '#FFFFFF',
                                      fontWeight: '600',
                                    }}>
                                    DEACTIVATED
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>

                          {/* Amount and Date */}
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: isTransfer
                                  ? '#F59E0B'
                                  : transaction.transaction_type === 'income'
                                    ? '#10B981'
                                    : '#EF4444',
                                marginBottom: 2,
                              }}>
                              {isTransfer
                                ? transferInfo
                                  ? `${transferInfo.toAmount} ${transferInfo.toCurrency}`
                                  : `${transaction.amount} ${transaction.targetAccount?.currency
                                    ?.symbol || '$'
                                  }`
                                : `${transaction.transaction_type === 'income'
                                  ? '+'
                                  : '-'
                                }${transaction.amount} ${transaction.account.currency?.symbol || '$'
                                }`}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                color: '#666',
                              }}>
                              {formatTransactionDate(
                                transaction.transaction_date,
                              )}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );

                      return (
                        <View
                          key={transaction.id}
                          style={{
                            opacity,
                          }}>
                          <SwipeableTransactionRow
                            transaction={transaction}
                            onConfirm={handleConfirmTransaction}
                            isScheduled={isScheduled}>
                            {transactionRow}
                          </SwipeableTransactionRow>

                          {index <
                            transactions
                              .filter(t => t.status === 'scheduled')
                              .slice(0, 10).length -
                            1 && (
                              <View
                                style={{
                                  height: 1,
                                  backgroundColor: '#E5E5EA',
                                  marginLeft: 0,
                                  marginRight: 0,
                                }}
                              />
                            )}
                        </View>
                      );
                    })}
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={[homeScreenStyles.footer, { paddingHorizontal: 24 }]}>
          {biometricCapability?.available && (
            <View style={homeScreenStyles.biometricContainer}>
              <TouchableOpacity
                style={homeScreenStyles.biometricRow}
                onPress={() => handleBiometricToggle(!biometricEnabled)}>
                <View style={homeScreenStyles.biometricInfo}>
                  <Text style={homeScreenStyles.biometricTitle}>
                    Sign in with{' '}
                    {biometricService.getBiometryDisplayName(
                      biometricCapability.biometryType,
                    )}
                  </Text>
                  <Text style={homeScreenStyles.biometricDescription}>
                    Fast and secure authentication
                  </Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                  thumbColor={biometricEnabled ? '#FFFFFF' : '#FFFFFF'}
                  ios_backgroundColor="#E5E5EA"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <AddTransactionModal
        visible={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        onSuccess={() => {
          loadTransactions();
          loadNetWorth();
          loadAccounts();
          // Инвалидируем кэш бюджетов при создании транзакции
          queryClient.invalidateQueries({ queryKey: ['budgets'] });
        }}
      />

      <EditTransactionModal
        visible={showEditTransactionModal}
        transaction={selectedTransaction}
        onClose={() => {
          setShowEditTransactionModal(false);
          setSelectedTransaction(null);
        }}
        onSuccess={() => {
          loadTransactions();
          loadNetWorth();
          loadAccounts();
          // Инвалидируем кэш бюджетов при редактировании транзакции
          queryClient.invalidateQueries({ queryKey: ['budgets'] });
        }}
      />

      <AccountsManagementModal
        visible={showAccountsManagementModal}
        onClose={() => setShowAccountsManagementModal(false)}
        onAddAccount={() => {
          setShowAccountsManagementModal(false);
          setTimeout(() => setShowAddAccountModal(true), 100);
        }}
        navigation={navigation}
      />

      <AddAccountModal
        visible={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        onAccountAdded={() => {
          setShowAddAccountModal(false);
          loadAccounts(); // Refresh accounts list
          setTimeout(() => setShowAccountsManagementModal(true), 100); // Return to accounts management
        }}
      />

      <SnackBar
        visible={snackBarVisible}
        message={snackBarMessage}
        onDismiss={() => setSnackBarVisible(false)}
        onUndo={undoAction}
      />

      {/* Floating Add Transaction Button */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 24, // Equal spacing with right margin
          right: 24,
          transform: [{ scale: buttonScale }],
        }}>
        <TouchableOpacity
          style={{
            width: 45,
            height: 45,
            borderRadius: 22.5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
            zIndex: 1000,
          }}
          onPress={() => setShowAddTransactionModal(true)}
          activeOpacity={1}
          onPressIn={() => {
            Animated.spring(buttonScale, {
              toValue: 0.9,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(buttonScale, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
          }}>
          <LinearGradient
            colors={['#D1CCFF', '#8CE6F3', '#7AF0C4', '#C7FB33']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            useAngle={true}
            angle={30}
            style={{
              width: 45,
              height: 45,
              borderRadius: 22.5,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: '#000',
                lineHeight: 28,
              }}>
              +
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};
