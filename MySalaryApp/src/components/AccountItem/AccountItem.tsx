import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getAccountIcon } from '../icons/getAccountIcon';
import { getAccountTypeIcon } from '../../utils/accountTypeIcon';
import { formatCurrencyAmount } from '../../utils/formatCurrency';
import { styles } from './styles';

interface AccountItemProps {
  account: {
    id: number;
    account_name: string;
    account_type: string;
    balance: string;
    currency?: {
      symbol: string;
    };
    is_active?: boolean;
  };
  onPress: () => void;
}

export const AccountItem: React.FC<
  AccountItemProps & { showSeparator?: boolean }
> = ({ account, onPress, showSeparator = true }) => {
  const meta = getAccountTypeIcon(account.account_type);
  const isDeactivated = account.is_active === false;
  const balance = parseFloat(account.balance);
  const isNegativeCredit =
    account.account_type === 'credit_card' && balance > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getAccountIcon({
            accountType: account.account_type,
            size: 16,
            color: meta.color,
          })}
        </View>

        <View style={styles.info}>
          <Text style={styles.accountName} numberOfLines={1}>
            {account.account_name}
          </Text>
          <Text style={[styles.accountType, { color: meta.color }]} numberOfLines={1}>
            {meta.name}
          </Text>
        </View>

        <Text
          style={[
            styles.balance,
            {
              color: isNegativeCredit ? '#EF4444' : '#252233',
            },
          ]}>
          {formatCurrencyAmount(balance, account.currency)}
        </Text>
      </View>

      {!isDeactivated && showSeparator && <View style={styles.separator} />}
    </TouchableOpacity>
  );
};
