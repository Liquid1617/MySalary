import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { formatCurrencyAmountShort } from '../../utils/formatCurrency';
import { formatTransactionDate } from '../../utils/dateUtils';
import { SwipeableTransactionRow } from '../SwipeableTransactionRow';
import { getCategoryIcon } from '../icons/getCategoryIcon';
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
  };
  onPress: () => void;
  onConfirm?: (transaction: any) => void;
  showSeparator?: boolean;
}


// Account-type colors for account tag background/text
const accountTypeColorMap: { [key: string]: string } = {
  debit_card: '#3B82F6',
  credit_card: '#8B5CF6',
  bank_account: '#10B981',
  cash: '#F59E0B',
  digital_wallet: '#EF4444',
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onConfirm,
  showSeparator = true,
}) => {
  const isTransfer = transaction.transaction_type === 'transfer';
  const isScheduled = transaction.status === 'scheduled';

  // Get icon component based on transaction type and account type
  const categoryIcon = isTransfer ? null : getCategoryIcon({
    categoryName: transaction.category?.category_name || '',
    accountType: transaction.account?.account_type || 'cash',
    width: 40,
    height: 40,
  });

  // Fallback for transfers - use FontAwesome5 icon
  const transferIconColor = '#6B7280';

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
      {isTransfer ? (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${transferIconColor}15` },
          ]}>
          <FontAwesome5 name="exchange-alt" size={18} color={transferIconColor} />
        </View>
      ) : (
        categoryIcon
      )}

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
              <View
                style={[styles.accountTag, { backgroundColor: '#EEF1F2' }]}>
                <Text
                  style={[
                    styles.accountTagText,
                    {
                      color: '#7A7E85',
                    },
                  ]}>
                  {transaction.account?.account_name || 'Unknown'}
                </Text>
              </View>

              {/* Arrow + To Account */}
              <View style={styles.transferArrow}>
                <FontAwesome5 name="arrow-right" size={12} color="#6B7280" />
                <View
                  style={[styles.accountTag, { backgroundColor: '#EEF1F2' }]}>
                  <Text
                    style={[
                      styles.accountTagText,
                      {
                        color: '#7A7E85',
                      },
                    ]}>
                    {transaction.targetAccount?.account_name || 'Unknown'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.singleAccountTag,
                { backgroundColor: '#EEF1F2' },
              ]}>
              <Text
                style={[
                  styles.accountTagText,
                  {
                    color: '#7A7E85',
                  },
                ]}>
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
                ? '#F0BF54'
                : transaction.transaction_type === 'income'
                  ? '#10B981'
                  : '#252233',
            },
          ]}>
          {isTransfer
            ? transferInfo
              ? `${transferInfo.toAmount} ${transferInfo.toCurrency}`
              : `${formatCurrencyAmountShort(
                parseFloat(transaction.amount),
                transaction.account?.currency as any,
              )}`
            : `${transaction.transaction_type === 'income' ? '+' : '-'
            }${formatCurrencyAmountShort(
              parseFloat(transaction.amount),
              transaction.account?.currency as any,
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
          transaction={transaction as any}
          onConfirm={onConfirm}
          isScheduled={isScheduled}>
          {renderTransactionContent()}
        </SwipeableTransactionRow>
      ) : (
        renderTransactionContent()
      )}

      {showSeparator && <View style={styles.separator} />}
    </View>
  );
};
