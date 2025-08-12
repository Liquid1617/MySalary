import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { formatCurrencyAmountShort } from '../../utils/formatCurrency';
import { SwipeableTransactionRow } from '../SwipeableTransactionRow';
import { styles } from './styles';

interface FutureTransactionItemProps {
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
  isFirst?: boolean;
  isLast?: boolean;
}


// Функция получения цвета плашки аккаунта (такие же как в Recent)
const getAccountTagColor = (accountType: string): { backgroundColor: string; textColor: string } => {
  return { backgroundColor: '#EEF1F2', textColor: '#7A7E85' };
};

// Функция форматирования времени до транзакции
const formatTimeUntilTransaction = (transactionDate: string): string => {
  const now = new Date();
  const targetDate = new Date(transactionDate);
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'from 1 day';
  } else {
    return `from ${diffDays} days`;
  }
};

// Компонент точки с встроенной линией
interface DotWithLineProps {
  isFirst: boolean;
  isLast: boolean;
}

const DotWithLine: React.FC<DotWithLineProps> = ({ isFirst, isLast }) => {
  return (
    <Svg width={24} height={65} viewBox="0 0 24 65">
      {/* Линия сверху (полная для средних элементов, хвостик для первого) */}
      {isFirst ? (
        // Короткий хвостик сверху для первого элемента
        <Line
          x1="12"
          y1="16"
          x2="12"
          y2="32.5"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      ) : (
        // Полная линия сверху для не первых элементов
        <Line
          x1="12"
          y1="0"
          x2="12"
          y2="32.5"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      )}
      
      {/* Линия снизу (полная для средних элементов, хвостик для последнего) */}
      {isLast ? (
        // Короткий хвостик снизу для последнего элемента
        <Line
          x1="12"
          y1="32.5"
          x2="12"
          y2="49"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      ) : (
        // Полная линия снизу для не последних элементов
        <Line
          x1="12"
          y1="32.5"
          x2="12"
          y2="65"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      )}
      
      {/* Точка */}
      <Circle
        cx="12"
        cy="32.5"
        r="4"
        fill="#9D97E9"
      />
    </Svg>
  );
};

export const FutureTransactionItem: React.FC<FutureTransactionItemProps> = ({
  transaction,
  onPress,
  onConfirm,
  showSeparator = true,
  isFirst = false,
  isLast = false,
}) => {
  const isTransfer = transaction.transaction_type === 'transfer';
  const isScheduled = transaction.status === 'scheduled';

  const accountColors = getAccountTagColor(transaction.account?.account_type || 'cash');

  const renderTransactionContent = () => (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      
      {/* Dot with embedded line */}
      <View style={styles.dotContainer}>
        <DotWithLine 
          isFirst={isFirst}
          isLast={isLast}
        />
      </View>

      {/* Transaction Details */}
      <View style={styles.content}>
        <Text style={styles.categoryName}>
          {isTransfer
            ? 'Transfer'
            : transaction.category?.category_name || 'Category'}
        </Text>

        <View style={styles.accountContainer}>
          {isTransfer ? (
            <View style={styles.transferContainer}>
              {/* From Account */}
              <View
                style={[
                  styles.accountTag,
                  { backgroundColor: accountColors.backgroundColor }
                ]}>
                <Text
                  style={[
                    styles.accountTagText,
                    { color: accountColors.textColor }
                  ]}>
                  {transaction.account?.account_name || 'Unknown'}
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.accountTag,
                { backgroundColor: accountColors.backgroundColor }
              ]}>
              <Text
                style={[
                  styles.accountTagText,
                  { color: accountColors.textColor }
                ]}>
                {transaction.account?.account_name || 'Unknown'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Amount and Time */}
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>
          {isTransfer
            ? `${formatCurrencyAmountShort(
                parseFloat(transaction.amount),
                transaction.account?.currency as any,
              )}`
            : `${formatCurrencyAmountShort(
                parseFloat(transaction.amount),
                transaction.account?.currency as any,
              )}`}
        </Text>
        <Text style={styles.timeText}>
          {formatTimeUntilTransaction(transaction.transaction_date)}
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

    </View>
  );
};