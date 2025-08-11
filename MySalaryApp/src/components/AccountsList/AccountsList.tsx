import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { AccountItem } from '../AccountItem/AccountItem';
import { ActionButton } from '../ActionButton/ActionButton';
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
  onAddPress?: () => void;
  onManagePress?: () => void;
}

export const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  loading,
  onAccountPress,
  onAddPress,
  onManagePress,
}) => {
  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Accounts</Text>
        <View style={styles.actionButtons}>
          {onAddPress && (
            <ActionButton
              title="Add"
              variant="add"
              onPress={onAddPress}
            />
          )}
          {onManagePress && (
            <ActionButton
              title="Manage"
              variant="manage"
              onPress={onManagePress}
            />
          )}
        </View>
      </View>

      {accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No accounts found</Text>
          <Text style={styles.emptyStateSubtext}>
            Add your first account to get started
          </Text>
        </View>
      ) : (
        <View style={styles.accountsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}>
            {accounts
              .filter(account => account.is_active !== false)
              .slice(0, 10)
              .map((account) => (
                <View key={account.id} style={styles.accountItemWrapper}>
                  <AccountItem
                    account={account}
                    onPress={() => onAccountPress(account)}
                  />
                </View>
              ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};