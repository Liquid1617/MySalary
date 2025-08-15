import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const activeAccounts = accounts.filter(account => account.is_active !== false);

  if (activeAccounts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No accounts yet</Text>
        <Text style={styles.emptySubtext}>Add your first account to start tracking finances</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {activeAccounts.map((account, index, arr) => (
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
