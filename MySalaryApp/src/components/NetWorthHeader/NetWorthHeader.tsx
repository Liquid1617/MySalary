import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { formatCurrencyAmount } from '../../utils/formatCurrency';
import { styles } from './styles';

interface NetWorthHeaderProps {
  netWorth: string;
  currency: string;
  netChange: number;
  isNetChangePositive: boolean;
  primaryCurrency?: {
    symbol: string;
  };
}

export const NetWorthHeader: React.FC<NetWorthHeaderProps> = ({
  netWorth,
  currency,
  netChange,
  isNetChangePositive,
  primaryCurrency,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.label}>Net Worth</Text>
          <Text style={styles.amount}>{netWorth}</Text>
          <View style={styles.changeContainer}>
            <FontAwesome5
              name={isNetChangePositive ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={isNetChangePositive ? '#22C55E' : '#EF4444'}
              style={styles.changeIcon}
            />
            <Text
              style={[
                styles.changeText,
                {
                  color: isNetChangePositive ? '#22C55E' : '#EF4444',
                },
              ]}>
              {formatCurrencyAmount(Math.abs(netChange), primaryCurrency)}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.addButton}>
            <FontAwesome5 name="plus" size={18} color="#A0F5A0" />
          </View>
          <Text style={styles.addText}>Add</Text>
          <Text style={styles.currencyText}>{currency}</Text>
        </View>
      </View>
    </View>
  );
};