import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import {
  TransactionToggle,
  TransactionViewType,
} from '../TransactionToggle/TransactionToggle';
import { TransactionItem } from '../TransactionItem/TransactionItem';
import { FutureTransactionItem } from '../FutureTransactionItem/FutureTransactionItem';
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
    account_type: string;
    currency?: {
      symbol: string;
      code: string;
      name?: string;
      id?: number;
    };
  };
  targetAccount?: {
    account_name: string;
    account_type: string;
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
  const filteredTransactions = uniqueTransactions
    .filter(transaction => {
      if (activeView === 'recent') {
        return transaction.status === 'posted';
      } else {
        return transaction.status === 'scheduled';
      }
    })
    .sort((a, b) => {
      // Сортировка только для будущих транзакций (по дате - более скорые первыми)
      if (activeView === 'future') {
        return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      }
      return 0; // Для recent транзакций сохраняем исходный порядок
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
        {filteredTransactions.map((transaction, index) => 
          activeView === 'future' ? (
            <FutureTransactionItem
              key={`${activeView}-transactions-${transaction.id}-${index}`}
              transaction={transaction}
              onPress={() => onTransactionPress(transaction)}
              onConfirm={onConfirmTransaction}
              showSeparator={index < filteredTransactions.length - 1}
              isFirst={index === 0}
              isLast={index === filteredTransactions.length - 1}
            />
          ) : (
            <TransactionItem
              key={`${activeView}-transactions-${transaction.id}-${index}`}
              transaction={transaction}
              onPress={() => onTransactionPress(transaction)}
              onConfirm={undefined}
              showSeparator={index < filteredTransactions.length - 1}
            />
          )
        )}
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
