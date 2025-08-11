import React from 'react';
import { View, Text } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { styles } from './styles';

interface BalanceCardData {
  type: 'income' | 'expense';
  amount: string;
  change: number;
  isPositive: boolean;
}

interface BalanceCardsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  incomePercentChange: number;
  expensesPercentChange: number;
  userCurrency: any;
}

const BalanceCard: React.FC<{ data: BalanceCardData }> = ({ data }) => {
  const isIncome = data.type === 'income';
  const iconColor = isIncome ? '#53EFAE' : '#FCA1A2';
  const iconBackground = isIncome ? '#53EFAE33' : '#FCA1A233';
  const icon = isIncome ? 'arrow-up' : 'arrow-down';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: iconBackground }]}>
          <FontAwesome5 name={icon} size={14} color={iconColor} />
        </View>
        <View style={styles.changeIndicator}>
          <Text style={[styles.changeText, { color: iconColor }]}>
            {data.change > 0 ? '+' : ''}{data.change}%
          </Text>
          <FontAwesome5 
            name={data.isPositive ? 'chevron-up' : 'chevron-down'} 
            size={8} 
            color={iconColor}
            style={styles.changeIcon}
          />
        </View>
      </View>
      <Text style={styles.cardLabel}>
        {isIncome ? 'Income' : 'Expense'}
      </Text>
      <Text style={styles.cardAmount}>{data.amount}</Text>
    </View>
  );
};

export const BalanceCards: React.FC<BalanceCardsProps> = ({
  monthlyIncome,
  monthlyExpenses,
  incomePercentChange,
  expensesPercentChange,
  userCurrency,
}) => {
  const incomeData: BalanceCardData = {
    type: 'income',
    amount: `+${monthlyIncome.toLocaleString()}`,
    change: Math.abs(incomePercentChange),
    isPositive: incomePercentChange >= 0,
  };

  const expenseData: BalanceCardData = {
    type: 'expense',
    amount: `-${monthlyExpenses.toLocaleString()}`,
    change: Math.abs(expensesPercentChange),
    isPositive: expensesPercentChange >= 0,
  };

  return (
    <View style={styles.container}>
      <BalanceCard data={incomeData} />
      <BalanceCard data={expenseData} />
    </View>
  );
};