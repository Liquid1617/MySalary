import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { styles } from './styles';

interface BalanceCardData {
  type: 'income' | 'expense';
  amount: string;
  change: number;
  isPositive: boolean;
}

interface BalanceCardsProps {
  incomeData: BalanceCardData;
  expenseData: BalanceCardData;
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
  incomeData,
  expenseData,
}) => {
  return (
    <View style={styles.container}>
      <BalanceCard data={incomeData} />
      <BalanceCard data={expenseData} />
    </View>
  );
};