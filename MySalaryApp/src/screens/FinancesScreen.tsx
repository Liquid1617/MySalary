import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { homeScreenStyles } from '../styles';
import { biometricService, BiometricCapability } from '../services/biometric';
import { apiService, type Currency } from '../services/api';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { AccountsManagementModal } from '../components/AccountsManagementModal';
import { AddAccountModal } from '../components/AddAccountModal';
import { BudgetCard } from '../components/BudgetCard';
import { SnackBar } from '../components/SnackBar';
import { NetWorthHeader } from '../components/NetWorthHeader';
import { BalanceCards } from '../components/BalanceCards';
import { ActionButton } from '../components/ActionButton';
import { AccountsList } from '../components/AccountsList';
import { TransactionsSection } from '../components/TransactionsSection';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { TransactionViewType } from '../components/TransactionToggle/TransactionToggle';
import { BudgetResponse } from '../types/budget';
import { useBudgets, useBudgetActions } from '../hooks/useBudgets';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAppDispatch,
  useNetWorth,
  useTransactions,
  useAccounts,
} from '../store/hooks';
import { fetchNetWorth } from '../store/slices/networthSlice';
import { fetchTransactions, updateTransactionStatus } from '../store/slices/transactionsSlice';
import { fetchAccounts } from '../store/slices/accountsSlice';
import { Transaction } from '../types/transaction';

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

export const FinancesScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const netWorthData = useNetWorth();
  const transactionsData = useTransactions();
  const accountsData = useAccounts();

  const [biometricCapability, setBiometricCapability] =
    useState<BiometricCapability | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
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
  const [transactionView, setTransactionView] =
    useState<TransactionViewType>('recent');

  // Budget data
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const { deleteBudget } = useBudgetActions();
  const queryClient = useQueryClient();
  const [userCurrency, setUserCurrency] = useState<Currency | undefined>(
    undefined,
  );
  const [user, setUser] = useState<any>(null);

  // Calculate monthly totals and net worth change
  const { monthlyIncome, monthlyExpenses } = calculateMonthlyTotals(
    transactionsData.transactions as any[],
    userCurrency,
  );
  const { previousMonthIncome, previousMonthExpenses } =
    calculatePreviousMonthTotals(
      transactionsData.transactions as any[],
      userCurrency,
    );

  // Calculate percentage changes
  const incomePercentChange =
    previousMonthIncome === 0
      ? monthlyIncome > 0
        ? 100
        : 0
      : ((monthlyIncome - previousMonthIncome) / previousMonthIncome) * 100;

  const expensesChangeRatio =
    previousMonthExpenses === 0
      ? 0
      : (monthlyExpenses - previousMonthExpenses) / previousMonthExpenses;

  const expensesPercentChange =
    previousMonthExpenses === 0
      ? monthlyExpenses > 0
        ? 100
        : 0
      : expensesChangeRatio * 100;

  // Calculate absolute change as income - expenses
  const monthlyNetChange = monthlyIncome - monthlyExpenses;
  const isNetChangePositive = monthlyNetChange >= 0;

  useEffect(() => {
    console.log('🚀 FinancesScreen: useEffect triggered');
    initializeBiometric();
    loadUserProfile();
    console.log('📡 FinancesScreen: Dispatching Redux actions');
    dispatch(fetchTransactions({}));
    dispatch(fetchNetWorth(false));
    dispatch(fetchAccounts(false));
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      // Only fetch if we don't have data or if there are errors
      if (!netWorthData.data && !netWorthData.loading) {
        console.log('📡 useFocusEffect: Fetching net worth (no data)');
        dispatch(fetchNetWorth(false));
      }
      if (
        !transactionsData.hasLoadedInitial &&
        !transactionsData.loading
      ) {
        console.log('📡 useFocusEffect: Fetching transactions (no initial load)');
        dispatch(fetchTransactions({}));
      }
      if (!accountsData.hasLoadedInitial && !accountsData.loading) {
        console.log('📡 useFocusEffect: Fetching accounts (no initial load)');
        dispatch(fetchAccounts(false));
      }
    }, [
      dispatch,
      netWorthData.data,
      netWorthData.loading,
      transactionsData.transactions.length,
      transactionsData.loading,
      accountsData.accounts.length,
      accountsData.loading,
    ]),
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
      if (currentUser && (currentUser as any).user) {
        setUser((currentUser as any).user);
        if ((currentUser as any).user.primaryCurrency) {
          setUserCurrency((currentUser as any).user.primaryCurrency);
        }
      } else if (currentUser) {
        // If response doesn't have nested user object
        setUser(currentUser);
        if ((currentUser as any).primaryCurrency) {
          setUserCurrency((currentUser as any).primaryCurrency);
        }
      } else {
        // Fallback to stored user
        const storedUser = await apiService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          if ((storedUser as any).primaryCurrency) {
            setUserCurrency((storedUser as any).primaryCurrency);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Continue without currency, will fallback to USD
    }
  };

  // Remove the old formatNetWorth function - we'll use formatCurrencyAmount instead

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

      // Optimistically update transaction status to 'posted'
      if (transaction.status === 'scheduled') {
        dispatch(updateTransactionStatus({ id: transaction.id, status: 'posted' }));
      }

      // Confirm on server - use 'today' mode to set current date for future transactions
      await apiService.confirmTransaction(transaction.id, 'today');

      // Invalidate budget cache to refresh spending totals
      queryClient.invalidateQueries({ queryKey: ['budgets'] });

      // Update net worth and accounts data
      dispatch(fetchNetWorth(true));
      dispatch(fetchAccounts(true));

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
    } catch (error) {
      console.error('Error confirming transaction:', error);
      Alert.alert('Error', 'Failed to confirm transaction');
      // Reload to restore correct state
      dispatch(fetchTransactions({ forceRefresh: true }));
    }
  };

  const undoConfirmation = async (originalTransaction: Transaction) => {
    try {
      // Call API to revert transaction status on server
      await apiService.unconfirmTransaction(originalTransaction.id);

      // Invalidate budget cache
      queryClient.invalidateQueries({ queryKey: ['budgets'] });

      // Reload all data
      dispatch(fetchTransactions({ forceRefresh: true }));
      dispatch(fetchNetWorth(true));
      dispatch(fetchAccounts(true));

      console.log(
        'Successfully undid confirmation for transaction:',
        originalTransaction.id,
      );
    } catch (error) {
      console.error('Error undoing confirmation:', error);
      Alert.alert('Error', 'Failed to undo transaction confirmation');
      // Reload to get correct state from server
      dispatch(fetchTransactions({ forceRefresh: true }));
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
        <NetWorthHeader
          user={user}
          netWorthData={{
            loading: netWorthData.loading,
            data: netWorthData.data
              ? { netWorth: netWorthData.data.netWorth }
              : undefined,
            error: netWorthData.error,
          }}
          userCurrency={userCurrency}
          monthlyNetChange={monthlyNetChange}
          isNetChangePositive={isNetChangePositive}
          onRetry={() => dispatch(fetchNetWorth(true))}
          insets={insets}
        />

        {/* Income/Expenses widgets and Transaction History секция НА БЕЛОМ ФОНЕ */}
        <View
          style={{
            backgroundColor: '#FDFDFE',
            paddingBottom: 24,
            paddingHorizontal: 24,
          }}>
          <BalanceCards
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            incomePercentChange={incomePercentChange}
            expensesPercentChange={expensesPercentChange}
            userCurrency={userCurrency}
          />

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
              <ActionButton
                variant="add"
                size="small"
                onPress={handleCreateBudget}
              />
            </View>

            {budgetsLoading ? (
              <View
                style={{
                  height: 140,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
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
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}>
                <Text
                  style={{ 
                    fontFamily: 'Commissioner',
                    fontSize: 14, 
                    fontWeight: '700', 
                    lineHeight: 14,
                    color: '#7A7E85' 
                  }}>
                  No Budgets yet
                </Text>
                <Text style={{ 
                  fontFamily: 'Commissioner',
                  fontSize: 14, 
                  fontWeight: '400',
                  lineHeight: 14,
                  color: '#D3D6D7', 
                  marginTop: 8 
                }}>
                  Add your first Budget to get started
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingRight: 24,
                  paddingBottom: 8, // Add bottom padding for shadow
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
            style={[homeScreenStyles.mainContent, { marginTop: 0 }]}>
            {/* Accounts Section */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                <Text
                  style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>
                  Accounts
                </Text>
                <ActionButton
                  variant="manage"
                  size="small"
                  onPress={() => setShowAccountsManagementModal(true)}
                />
              </View>

              <AccountsList
                accounts={accountsData.accounts}
                loading={accountsData.loading}
                onAccountPress={account =>
                  navigation.navigate('AccountDetails', { account })
                }
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                <Text
                  style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>
                  Transactions
                </Text>
                <ActionButton
                  variant="view"
                  size="small"
                  onPress={() => navigation.navigate('AllTransactions')}
                />
              </View>
              <TransactionsSection
                transactions={transactionsData.transactions as any[]}
                isLoading={transactionsData.loading}
                activeView={transactionView}
                onViewChange={setTransactionView}
                onTransactionPress={handleTransactionPress}
                onConfirmTransaction={handleConfirmTransaction as any}
                onAddPress={() => setShowAddTransactionModal(true)}
              />
            </View>
          </View>
        </View>

        <View style={homeScreenStyles.footer}>
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
          // fetchTransactions уже вызывается в createTransaction action
          dispatch(fetchNetWorth(true));
          dispatch(fetchAccounts(true));
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
          dispatch(fetchTransactions({ forceRefresh: true }));
          dispatch(fetchNetWorth(true));
          dispatch(fetchAccounts(true));
          // Инвалидируем кэш бюджетов при редактировании транзакции
          queryClient.invalidateQueries({ queryKey: ['budgets'] });
        }}
      />

      <AccountsManagementModal
        visible={showAccountsManagementModal}
        onClose={() => {
          setShowAccountsManagementModal(false);
          // Refresh data when closing accounts management
          dispatch(fetchAccounts(true));
          dispatch(fetchNetWorth(true));
        }}
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
          dispatch(fetchAccounts(true)); // Refresh accounts list
          dispatch(fetchNetWorth(true)); // Refresh net worth
          setTimeout(() => setShowAccountsManagementModal(true), 100); // Return to accounts management
        }}
      />

      <SnackBar
        visible={snackBarVisible}
        message={snackBarMessage}
        onDismiss={() => setSnackBarVisible(false)}
        onUndo={undoAction || undefined}
      />

      <FloatingActionButton onPress={() => setShowAddTransactionModal(true)} />
    </>
  );
};
