import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { colors } from '../styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Transaction } from '../types/transaction';
import { SwipeableTransactionRow } from '../components/SwipeableTransactionRow';
import { SnackBar } from '../components/SnackBar';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { getAccountTypeIcon } from '../utils/accountTypeIcon';


export const AllTransactionsScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const queryClient = useQueryClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackBarVisible, setSnackBarVisible] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [undoAction, setUndoAction] = useState<(() => void) | null>(null);
  const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const transactionsData = await apiService.get<Transaction[]>(
        '/transactions',
      );
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, []),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time to compare dates only
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    const dateTime = dateOnly.getTime();
    const todayTime = todayOnly.getTime();
    const yesterdayTime = yesterdayOnly.getTime();
    
    if (dateTime === todayTime) {
      return 'Today';
    } else if (dateTime === yesterdayTime) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Функция для проверки, является ли транзакция запланированной
  const isTransactionScheduled = (transaction: Transaction) => {
    return transaction.status === 'scheduled';
  };

  // Функция для проверки, является ли транзакция будущей (по дате)
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

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowEditTransactionModal(true);
  };

  const handleConfirmTransaction = async (transaction: Transaction) => {
    try {
      // Store original transaction for undo
      const originalTransaction = { ...transaction };
      
      // Optimistically update UI
      setTransactions(prev => 
        prev.map(t => 
          t.id === transaction.id 
            ? { ...t, status: 'posted' as const, confirmed_at: new Date().toISOString() }
            : t
        )
      );
      
      // Confirm on server
      await apiService.confirmTransaction(transaction.id, 'scheduledDate');
      
      // Invalidate budget cache to refresh spending totals on other screens
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      
      // Show success message with undo
      const dateStr = new Date(transaction.transaction_date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      setSnackBarMessage(`Transaction confirmed for ${dateStr}`);
      setUndoAction(() => () => undoConfirmation(originalTransaction));
      setSnackBarVisible(true);
      
    } catch (error) {
      console.error('Error confirming transaction:', error);
      Alert.alert('Error', 'Failed to confirm transaction');
      // Reload to restore correct state
      loadTransactions();
    }
  };

  const undoConfirmation = async (originalTransaction: Transaction) => {
    try {
      // Revert UI immediately
      setTransactions(prev => 
        prev.map(t => 
          t.id === originalTransaction.id 
            ? originalTransaction
            : t
        )
      );
      
      // Call API to revert transaction status on server
      await apiService.unconfirmTransaction(originalTransaction.id);
      
      // Invalidate budget cache to refresh spending totals on other screens
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      
      console.log('Successfully undid confirmation for transaction:', originalTransaction.id);
      
    } catch (error) {
      console.error('Error undoing confirmation:', error);
      Alert.alert('Error', 'Failed to undo transaction confirmation');
      // Reload to get correct state from server
      loadTransactions();
    }
  };



  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isScheduled = isTransactionScheduled(item);
    const accountIcon = getAccountTypeIcon(item.account?.account_type || '');
    
    // Get proper category icon
    const categoryIconData = item.transaction_type === 'transfer'
      ? { icon: 'exchange-alt', color: '#6B7280' }
      : getCategoryIcon(
          item.category?.category_name || item.category?.name || '',
          item.category?.category_type || item.category?.type || item.transaction_type || '',
        );
    
    const transactionRow = (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}>
        
        {/* Category Icon Circle */}
        <View style={styles.categoryIconCircle}>
          <FontAwesome5
            name={categoryIconData.icon}
            size={20}
            color={categoryIconData.color}
          />
        </View>

        {/* Text Stack */}
        <View style={styles.textStack}>
          <View style={styles.titleRow}>
            <Text style={styles.transactionTitle}>
              {item.category?.category_name || 
               (item.transaction_type === 'transfer' ? 'Transfer' : 'Other')}
            </Text>
            {isScheduled && (
              <View style={styles.scheduledPill}>
                <Text style={styles.scheduledPillText}>Scheduled</Text>
              </View>
            )}
          </View>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 12,
              backgroundColor: `${accountIcon.color}20`,
              maxWidth: 120,
              alignSelf: 'flex-start',
              marginTop: 2,
            }}>
            <Text
              style={{
                fontSize: 12,
                color: accountIcon.color,
                fontWeight: '600',
              }}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.account.account_name}
            </Text>
          </View>
        </View>

        {/* Amount and Date */}
        <View style={styles.amountSection}>
          <Text style={[
            styles.transactionAmount,
            { color: item.transaction_type === 'income' ? '#34C759' : '#FF3B30' }
          ]}>
            {item.transaction_type === 'income' ? '+' : '-'}{item.account.currency?.symbol || '$'}{item.amount}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.transaction_date)}
          </Text>
        </View>
      </TouchableOpacity>
    );

    return (
      <SwipeableTransactionRow
        transaction={item}
        onConfirm={handleConfirmTransaction}
        isScheduled={isScheduled}>
        {transactionRow}
      </SwipeableTransactionRow>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Transactions</Text>
        <View style={styles.headerSpacer} />
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome5 name="receipt" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Transactions</Text>
          <Text style={styles.emptySubtitle}>
            Start by adding your first transaction
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('BalanceChange')}>
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id.toString()}
          renderItem={renderTransaction}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
      
      <SnackBar
        visible={snackBarVisible}
        message={snackBarMessage}
        onUndo={undoAction}
        onDismiss={() => {
          setSnackBarVisible(false);
          setUndoAction(null);
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
          setShowEditTransactionModal(false);
          setSelectedTransaction(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  listContainer: {
    paddingVertical: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 68,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textStack: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scheduledPill: {
    backgroundColor: '#E5F0FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 6,
    height: 20,
    justifyContent: 'center',
  },
  scheduledPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0066FF',
  },
  amountSection: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 13,
    color: '#999999',
    marginTop: 2,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
