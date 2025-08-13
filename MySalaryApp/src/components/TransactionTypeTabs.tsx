import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles';

interface TransactionTypeTabsProps {
  value: string;
  onChange: (type: string) => void;
  disabled?: boolean;
}

const TransactionTypeTabs: React.FC<TransactionTypeTabsProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const getTabColors = (type: string) => {
    const isActive = value === type;

    switch (type) {
      case 'expense':
        return {
          backgroundColor: isActive ? colors.error : 'transparent',
          textColor: isActive ? colors.white : '#7A7E85',
          borderColor: colors.error,
        };
      case 'income':
        return {
          backgroundColor: isActive ? colors.success : 'transparent',
          textColor: isActive ? colors.white : '#7A7E85',
          borderColor: colors.success,
        };
      case 'transfer':
        return {
          backgroundColor: isActive ? colors.accent : 'transparent',
          textColor: isActive ? colors.white : '#7A7E85',
          borderColor: colors.accent,
        };
      default:
        return {
          backgroundColor: isActive ? colors.primary : 'transparent',
          textColor: isActive ? colors.white : '#7A7E85',
          borderColor: colors.primary,
        };
    }
  };

  const renderTab = (type: string, label: string) => {
    const tabColors = getTabColors(type);
    const isActive = value === type;

    return (
      <TouchableOpacity
        key={type}
        style={[
          styles.tab,
          {
            backgroundColor: tabColors.backgroundColor,
          },
          disabled && styles.disabled,
        ]}
        onPress={() => onChange(type)}
        disabled={disabled}>
        <Text style={[styles.tabText, { color: tabColors.textColor }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderTab('expense', 'Expense')}
      {renderTab('income', 'Income')}
      {renderTab('transfer', 'Transfer')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: 353,
    height: 48,
    backgroundColor: '#EEF1F2',
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: 'Commissioner',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default TransactionTypeTabs;
