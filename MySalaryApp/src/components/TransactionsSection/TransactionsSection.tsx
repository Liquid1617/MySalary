import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import {
  TransactionToggle,
  TransactionViewType,
} from '../TransactionToggle/TransactionToggle';
import { TransactionItem } from '../TransactionItem/TransactionItem';
import { ActionButton } from '../ActionButton/ActionButton';
import { styles } from './styles';

interface Transaction {
  id: number;
  transaction_type: 'income' | 'expense' | 'transfer';
  amount: string;
  transaction_date: string;
  status: 'posted' | 'scheduled';
  account: {
    account_name: string;
    currency?: {
      symbol: string;
      code: string;
      name?: string;
      id?: number;
    };
  };
  targetAccount?: {
    account_name: string;
    currency?: {
      symbol: string;
      code: string;
      name?: string;
      id?: number;
    };
  };
  category?: {
    category_name: string;
    category_type: string;
  };
  description?: string;
}

interface TransactionsSectionProps {
  transactions: Transaction[];
  isLoading?: boolean;
  activeView: TransactionViewType;
  onViewChange: (view: TransactionViewType) => void;
  onTransactionPress: (transaction: Transaction) => void;
  onConfirmTransaction?: (transaction: Transaction) => void;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions,
  isLoading = false,
  activeView,
  onViewChange,
  onTransactionPress,
  onConfirmTransaction,
}) => {
  // Deduplicate transactions
  const uniqueTransactions = transactions.filter(
    (transaction, index, self) =>
      self.findIndex(t => t.id === transaction.id) === index,
  );

  // Filter transactions based on active view
  const filteredTransactions = uniqueTransactions.filter(transaction => {
    if (activeView === 'recent') {
      return transaction.status === 'posted';
    } else {
      return transaction.status === 'scheduled';
    }
  });

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {activeView === 'recent'
          ? 'No recent transactions'
          : 'No scheduled transactions'}
      </Text>
    </View>
  );

  const renderTransactions = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      );
    }

    if (filteredTransactions.length === 0) {
      return renderEmptyState();
    }

    return (
      <View style={styles.transactionsList}>
        {filteredTransactions.map((transaction, index) => (
          <TransactionItem
            key={`${activeView}-transactions-${transaction.id}-${index}`}
            transaction={transaction}
            onPress={() => onTransactionPress(transaction)}
            onConfirm={
              activeView === 'future' && onConfirmTransaction
                ? onConfirmTransaction
                : undefined
            }
            showSeparator={index < filteredTransactions.length - 1}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TransactionToggle activeView={activeView} onViewChange={onViewChange} />
      {renderTransactions()}
    </View>
  );
};
