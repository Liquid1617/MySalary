import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getAccountTypeIcon } from '../utils/accountTypeIcon';
import { colors } from '../styles';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency_symbol: string;
}

interface AccountCardProps {
  account: Account;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  selected,
  onPress,
  disabled = false,
}) => {
  const iconData = getAccountTypeIcon(account.type);

  const formatBalance = (balance: number, currencySymbol: string) => {
    const absBalance = Math.abs(balance);
    if (absBalance >= 1000000) {
      return `${currencySymbol}${(balance / 1000000).toFixed(1)}M`;
    } else if (absBalance >= 1000) {
      return `${currencySymbol}${(balance / 1000).toFixed(1)}K`;
    }
    return `${currencySymbol}${balance.toFixed(2)}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && {
          borderColor: iconData.color,
          backgroundColor: iconData.backgroundColor,
        },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <View style={styles.iconContainer}>
        <FontAwesome5
          name={iconData.icon}
          size={16}
          color={iconData.color}
          solid
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.accountName} numberOfLines={1}>
          {account.name}
        </Text>
        <Text style={styles.balance}>
          {formatBalance(account.balance, account.currency_symbol)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 120,
    maxWidth: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  content: {
    alignItems: 'center',
  },
  accountName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  balance: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default AccountCard;
