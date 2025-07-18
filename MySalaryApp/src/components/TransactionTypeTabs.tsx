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
          backgroundColor: isActive ? colors.error : colors.white,
          textColor: isActive ? colors.white : colors.error,
          borderColor: colors.error,
        };
      case 'income':
        return {
          backgroundColor: isActive ? colors.success : colors.white,
          textColor: isActive ? colors.white : colors.success,
          borderColor: colors.success,
        };
      case 'transfer':
        return {
          backgroundColor: isActive ? colors.accent : colors.white,
          textColor: isActive ? colors.white : colors.accent,
          borderColor: colors.accent,
        };
      default:
        return {
          backgroundColor: isActive ? colors.primary : colors.white,
          textColor: isActive ? colors.white : colors.primary,
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
            borderColor: tabColors.borderColor,
          },
          isActive && styles.activeTab,
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
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default TransactionTypeTabs;
