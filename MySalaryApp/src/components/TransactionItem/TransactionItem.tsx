import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { formatCurrencyAmountShort } from '../../utils/formatCurrency';
import { formatTransactionDate } from '../../utils/dateUtils';
import { SwipeableTransactionRow } from '../SwipeableTransactionRow';
import { styles } from './styles';

interface TransactionItemProps {
  transaction: {
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
  };
  onPress: () => void;
  onConfirm?: (transaction: any) => void;
  showSeparator?: boolean;
}

const getCategoryIcon = (categoryName: string, categoryType: string) => {
  // Map categories to icons
  const iconMap: { [key: string]: { icon: string; color: string } } = {
    'Salary': { icon: 'money-check-alt', color: '#10B981' },
    'Food': { icon: 'utensils', color: '#EF4444' },
    'Transportation': { icon: 'car', color: '#6366F1' },
    'Entertainment': { icon: 'film', color: '#8B5CF6' },
    'Shopping': { icon: 'shopping-bag', color: '#EC4899' },
    'Health': { icon: 'heartbeat', color: '#14B8A6' },
    'Bills': { icon: 'receipt', color: '#F59E0B' },
  };

  return iconMap[categoryName] || { icon: 'circle', color: '#6B7280' };
};

const getAccountTypeIcon = (accountType: string) => {
  switch (accountType) {
    case 'checking':
      return { icon: 'university', color: '#4F46E5' };
    case 'savings':
      return { icon: 'piggy-bank', color: '#059669' };
    case 'credit_card':
      return { icon: 'credit-card', color: '#DC2626' };
    default:
      return { icon: 'wallet', color: '#6B7280' };
  }
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onConfirm,
  showSeparator = true,
}) => {
  const isTransfer = transaction.transaction_type === 'transfer';
  const isScheduled = transaction.status === 'scheduled';
  
  // Get icon and color based on transaction type
  const iconData = isTransfer
    ? { icon: 'exchange-alt', color: '#6B7280' }
    : getCategoryIcon(
        transaction.category?.category_name || '',
        transaction.category?.category_type || '',
      );

  // Parse transfer info from description if available
  const getTransferDisplayInfo = (transaction: any) => {
    if (transaction.transaction_type !== 'transfer') return null;
    
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

  const renderTransactionContent = () => (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      
      {/* Category/Transfer Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${iconData.color}15` },
        ]}>
        <FontAwesome5
          name={iconData.icon}
          size={18}
          color={iconData.color}
        />
      </View>

      {/* Transaction Details */}
      <View style={styles.content}>
        <Text style={styles.categoryName}>
          {isTransfer
            ? 'Transfer'
            : transaction.category?.category_name || 'Category'}
        </Text>
        
        <View style={styles.detailsContainer}>
          {isTransfer ? (
            <View style={styles.transferContainer}>
              {/* From Account */}
              <View style={styles.accountTag}>
                <Text style={styles.accountTagText}>
                  {transaction.account?.account_name || 'Unknown'}
                </Text>
              </View>

              {/* Arrow + To Account */}
              <View style={styles.transferArrow}>
                <FontAwesome5
                  name="arrow-right"
                  size={12}
                  color="#6B7280"
                />
                <View style={styles.accountTag}>
                  <Text style={styles.accountTagText}>
                    {transaction.targetAccount?.account_name || 'Unknown'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.singleAccountTag}>
              <Text style={styles.accountTagText}>
                {transaction.account?.account_name || 'Unknown'}
              </Text>
            </View>
          )}

          {isScheduled && (
            <View style={styles.scheduledBadge}>
              <Text style={styles.scheduledText}>Scheduled</Text>
            </View>
          )}
        </View>
      </View>

      {/* Amount and Date */}
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            {
              color: isTransfer
                ? '#F59E0B'
                : transaction.transaction_type === 'income'
                  ? '#10B981'
                  : '#EF4444',
            },
          ]}>
          {isTransfer
            ? transferInfo
              ? `${transferInfo.toAmount} ${transferInfo.toCurrency}`
              : `${formatCurrencyAmountShort(
                  parseFloat(transaction.amount),
                  transaction.account?.currency as any
                )}`
            : `${transaction.transaction_type === 'income' ? '+' : '-'}${formatCurrencyAmountShort(
                parseFloat(transaction.amount),
                transaction.account?.currency as any
              )}`}
        </Text>
        <Text style={styles.date}>
          {formatTransactionDate(transaction.transaction_date)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View>
      {onConfirm ? (
        <SwipeableTransactionRow
          transaction={transaction}
          onConfirm={onConfirm}
          isScheduled={isScheduled}>
          {renderTransactionContent()}
        </SwipeableTransactionRow>
      ) : (
        renderTransactionContent()
      )}

      {showSeparator && (
        <View style={styles.separator} />
      )}
    </View>
  );
};