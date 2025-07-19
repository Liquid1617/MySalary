import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { BudgetResponse } from '../types/budget';
import { useBudgets } from '../hooks/useBudgets';
import { apiService } from '../services/api';
import { useUserCurrency } from '../hooks/useUserCurrency';
import { formatBudgetCurrency as formatBudgetCurrencyUtil } from '../utils/currencyUtils';

interface BudgetDetailScreenProps {
  route: {
    params: {
      budgetId: string;
    };
  };
  navigation: any;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_date: string;
  category: {
    category_name: string;
    category_type: string;
  };
  account: {
    account_name: string;
    currency: {
      symbol: string;
    };
  };
}

export const BudgetDetailScreen: React.FC<BudgetDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { budgetId } = route.params;
  const { data: budgets = [] } = useBudgets();
  const { formatCurrency } = useUserCurrency();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const budget = budgets.find((b) => b.id === budgetId);

  const formatBudgetCurrency = (amount: number) => {
    if (!budget?.currency) return formatCurrency(amount);
    return formatBudgetCurrencyUtil(amount, budget.currency, formatCurrency);
  };

  useEffect(() => {
    if (budget) {
      loadRecentTransactions();
    }
  }, [budget]);

  const loadRecentTransactions = async () => {
    if (!budget) return;
    
    try {
      setLoadingTransactions(true);
      // Get transactions for this budget's categories
      const categoryIds = budget.categories.map(c => c.category_id);
      const transactions = await apiService.get<Transaction[]>('/transactions');
      
      // Filter transactions for budget categories and time period
      const budgetTransactions = (transactions || []).filter(t => {
        const isInBudgetCategories = categoryIds.includes(t.category?.id?.toString());
        const transactionDate = new Date(t.transaction_date);
        const budgetStart = new Date(budget.custom_start_date);
        const budgetEnd = new Date(budget.custom_end_date);
        
        return isInBudgetCategories && 
               transactionDate >= budgetStart && 
               transactionDate <= budgetEnd &&
               t.transaction_type === 'expense';
      });

      // Sort by date (newest first) and take only the 10 most recent
      const sortedTransactions = budgetTransactions
        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
        .slice(0, 10);

      setRecentTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error loading budget transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getTimeProgress = () => {
    if (!budget) return 0;
    
    const now = new Date();
    const start = new Date(budget.custom_start_date);
    const end = new Date(budget.custom_end_date);
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(Math.max(elapsed / totalDuration, 0), 1);
  };

  if (!budget) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Budget not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = Math.min(budget.percent || 0, 100);
  const isOverBudget = (budget.percent || 0) > 100;
  const timeProgress = getTimeProgress();
  
  // Progress colors
  const getProgressColor = (percent: number) => {
    if (percent > 100) return '#E74C3C'; // Red for over budget
    if (percent >= 80) return '#F1C40F'; // Yellow for 80-100%
    return '#2ECC71'; // Green for 0-80%
  };

  const progressColor = getProgressColor(progress);

  // Hero donut calculations (160pt diameter)
  const donutSize = 160;
  const strokeWidth = 20;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const daysLeft = () => {
    const end = new Date(budget.custom_end_date);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome5 name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {budget.name}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('BudgetEdit', { budget })}
          >
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        {/* Hero Donut */}
        <View style={styles.heroSection}>
          <View style={styles.donutContainer}>
            <Svg width={donutSize} height={donutSize}>
              {/* Background circle */}
              <Circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={radius}
                stroke="#E5E5EA"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
              <Circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={radius}
                stroke={progressColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform={`rotate(-90 ${donutSize / 2} ${donutSize / 2})`}
              />
            </Svg>
            {/* Center content */}
            <View style={styles.donutCenter}>
              <Text style={[styles.percentageText, { color: progressColor }]}>
                {Math.round(progress)}%
              </Text>
              <Text style={styles.percentageSubtext}>spent</Text>
            </View>
          </View>
          
          <Text style={styles.budgetAmount}>
            {formatBudgetCurrency(budget.spent || 0)} / {formatBudgetCurrency(budget.limit_amount)}
          </Text>
        </View>

        {/* KPI Cards Row */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Remaining</Text>
            <Text style={[styles.kpiValue, { color: isOverBudget ? '#E74C3C' : '#2ECC71' }]}>
              {formatBudgetCurrency(Math.abs(budget.limit_amount - (budget.spent || 0)))}
            </Text>
          </View>
          
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Days Left</Text>
            <Text style={styles.kpiValue}>{daysLeft()}</Text>
          </View>
        </View>

        {/* Time Progress Bar */}
        <View style={styles.timeProgressSection}>
          <Text style={styles.timeProgressTitle}>Period Progress</Text>
          <View style={styles.timeProgressBar}>
            <View 
              style={[
                styles.timeProgressFill, 
                { width: `${timeProgress * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.timeProgressLabels}>
            <Text style={styles.timeProgressLabel}>
              {new Date(budget.custom_start_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.timeProgressLabel}>
              {new Date(budget.custom_end_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          {loadingTransactions ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : recentTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Transactions in this budget will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction, index) => (
                <View key={transaction.id}>
                  <View style={styles.transactionItem}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionCategory} numberOfLines={1}>
                        {transaction.category?.category_name || 'Unknown'}
                      </Text>
                      <Text style={styles.transactionAccount} numberOfLines={1}>
                        {transaction.account?.account_name || 'Unknown'}
                      </Text>
                    </View>
                    <View style={styles.transactionAmountContainer}>
                      <Text style={styles.transactionAmount}>
                        -{formatBudgetCurrency(transaction.amount)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.transaction_date)}
                      </Text>
                    </View>
                  </View>
                  {index < recentTransactions.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  editButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E9AFE',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  donutContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  donutCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '700',
  },
  percentageSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  timeProgressSection: {
    marginBottom: 24,
  },
  timeProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  timeProgressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 8,
  },
  timeProgressFill: {
    height: '100%',
    backgroundColor: '#2E9AFE',
    borderRadius: 2,
  },
  timeProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeProgressLabel: {
    fontSize: 12,
    color: '#666',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  transactionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  transactionAccount: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#2E9AFE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});