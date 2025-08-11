import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
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

const getAccountTypeIcon = (accountType: string) => {
  switch (accountType) {
    case 'checking':
      return { icon: 'university', color: '#4F46E5' };
    case 'savings':
      return { icon: 'piggy-bank', color: '#059669' };
    case 'credit_card':
      return { icon: 'credit-card', color: '#DC2626' };
    case 'investment':
      return { icon: 'chart-line', color: '#7C3AED' };
    case 'cash':
      return { icon: 'wallet', color: '#EA580C' };
    default:
      return { icon: 'university', color: '#6B7280' };
  }
};

export const AccountItem: React.FC<AccountItemProps> = ({
  account,
  onPress,
}) => {
  const { icon, color } = getAccountTypeIcon(account.account_type);
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
          <FontAwesome5 name={icon} size={16} color={color} />
        </View>

        <View style={styles.info}>
          <Text style={styles.accountName} numberOfLines={1}>
            {account.account_name}
          </Text>
          <Text style={styles.accountType} numberOfLines={1}>
            {account.account_type.replace('_', ' ').toUpperCase()}
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

      {!isDeactivated && <View style={styles.separator} />}
    </TouchableOpacity>
  );
};
