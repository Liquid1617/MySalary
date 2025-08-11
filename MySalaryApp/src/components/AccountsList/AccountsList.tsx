import React from 'react';
import { View } from 'react-native';
import { AccountItem } from '../AccountItem/AccountItem';
import { styles } from './styles';

interface Account {
  id: number;
  account_name: string;
  account_type: string;
  balance: string;
  currency?: {
    symbol: string;
  };
  is_active?: boolean;
}

interface AccountsListProps {
  accounts: Account[];
  loading: boolean;
  onAccountPress: (account: Account) => void;
}

export const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  loading,
  onAccountPress,
}) => {
  if (loading) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {accounts
          .filter(account => account.is_active !== false)
          .map((account, index, arr) => (
            <AccountItem
              key={account.id}
              account={account}
              onPress={() => onAccountPress(account)}
              showSeparator={index < arr.length - 1}
            />
          ))}
      </View>
    </View>
  );
};
