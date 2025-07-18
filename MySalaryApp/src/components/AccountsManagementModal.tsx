import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../styles';
import { apiService } from '../services/api';
import { getAccountTypeIcon } from '../utils/accountTypeIcon';

interface Account {
  id: number;
  account_name: string;
  account_type: string;
  balance: string;
  is_active: boolean;
  currency: {
    symbol: string;
    code: string;
    name: string;
  };
}

interface AccountsManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onAddAccount: () => void;
  navigation: any;
}

export const AccountsManagementModal: React.FC<
  AccountsManagementModalProps
> = ({ visible, onClose, onAddAccount, navigation }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAccounts();
    }
  }, [visible]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accountsData = await apiService.get<Account[]>('/accounts');
      setAccounts(accountsData || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      Alert.alert('Error', 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeLabel = (accountType: string) => {
    const labelMap: { [key: string]: string } = {
      cash: 'Cash',
      debit_card: 'Debit Card',
      credit_card: 'Credit Card',
      bank_account: 'Bank Account',
      digital_wallet: 'Digital Wallet',
    };
    return labelMap[accountType] || accountType;
  };

  const handleAccountPress = (account: Account) => {
    onClose();
    navigation.navigate('AccountDetails', { account });
  };

  const formatBalance = (balance: string, symbol: string) => {
    const numBalance = parseFloat(balance);
    if (numBalance >= 1000000) {
      return `${symbol}${(numBalance / 1000000).toFixed(1)}M`;
    } else if (numBalance >= 1000) {
      return `${symbol}${(numBalance / 1000).toFixed(1)}K`;
    }
    return `${symbol}${numBalance.toFixed(2)}`;
  };

  const getTotalNetWorth = () => {
    return accounts.reduce((total, account) => {
      if (account.is_active) {
        return total + parseFloat(account.balance);
      }
      return total;
    }, 0);
  };

  const activeAccounts = accounts.filter(account => account.is_active);
  const inactiveAccounts = accounts.filter(account => !account.is_active);
  const totalNetWorth = getTotalNetWorth();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Accounts</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.addButton} onPress={onAddAccount}>
              <FontAwesome5 name="plus" size={16} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading accounts...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {/* Net Worth Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Total Net Worth</Text>
              <Text style={styles.summaryAmount}>
                $
                {totalNetWorth.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text style={styles.summarySubtitle}>
                {activeAccounts.length} active account
                {activeAccounts.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Active Accounts */}
            {activeAccounts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Accounts</Text>
                {activeAccounts.map(account => {
                  const iconData = getAccountTypeIcon(account.account_type);
                  return (
                    <TouchableOpacity
                      key={account.id}
                      style={styles.accountItem}
                      onPress={() => handleAccountPress(account)}>
                      <View style={styles.accountIcon}>
                        <FontAwesome5
                          name={iconData.icon}
                          size={20}
                          color={iconData.color}
                        />
                      </View>
                      <View style={styles.accountDetails}>
                        <Text style={styles.accountName}>
                          {account.account_name}
                        </Text>
                        <Text style={styles.accountType}>
                          {getAccountTypeLabel(account.account_type)} •{' '}
                          {account.currency.code}
                        </Text>
                      </View>
                      <View style={styles.accountRight}>
                        <Text style={styles.accountBalance}>
                          {formatBalance(
                            account.balance,
                            account.currency.symbol,
                          )}
                        </Text>
                        <FontAwesome5
                          name="chevron-right"
                          size={14}
                          color={colors.textSecondary}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Inactive Accounts */}
            {inactiveAccounts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Inactive Accounts</Text>
                {inactiveAccounts.map(account => {
                  const iconData = getAccountTypeIcon(account.account_type);
                  return (
                    <TouchableOpacity
                      key={account.id}
                      style={[styles.accountItem, styles.inactiveAccountItem]}
                      onPress={() => handleAccountPress(account)}>
                      <View
                        style={[
                          styles.accountIcon,
                          styles.inactiveAccountIcon,
                        ]}>
                        <FontAwesome5
                          name={iconData.icon}
                          size={20}
                          color={colors.textSecondary}
                        />
                      </View>
                      <View style={styles.accountDetails}>
                        <Text
                          style={[
                            styles.accountName,
                            styles.inactiveAccountName,
                          ]}>
                          {account.account_name}
                        </Text>
                        <Text style={styles.accountType}>
                          {getAccountTypeLabel(account.account_type)} • Inactive
                        </Text>
                      </View>
                      <View style={styles.accountRight}>
                        <Text
                          style={[
                            styles.accountBalance,
                            styles.inactiveAccountBalance,
                          ]}>
                          {formatBalance(
                            account.balance,
                            account.currency.symbol,
                          )}
                        </Text>
                        <FontAwesome5
                          name="chevron-right"
                          size={14}
                          color={colors.textSecondary}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Empty State */}
            {accounts.length === 0 && (
              <View style={styles.emptyState}>
                <FontAwesome5
                  name="wallet"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyTitle}>No Accounts</Text>
                <Text style={styles.emptySubtitle}>
                  Add your first account to start tracking your finances
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={onAddAccount}>
                  <Text style={styles.emptyButtonText}>Add Account</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Tips */}
            {accounts.length > 0 && (
              <View style={styles.tipsSection}>
                <Text style={styles.tipsTitle}>💡 Tips</Text>
                <Text style={styles.tipsText}>
                  • Tap on any account to view details and transactions{'\n'}•
                  Inactive accounts won't appear in transaction selectors{'\n'}•
                  You can reactivate accounts from their detail page
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: colors.primary + '15',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 4,
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inactiveAccountItem: {
    opacity: 0.7,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inactiveAccountIcon: {
    backgroundColor: colors.border,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  inactiveAccountName: {
    color: colors.textSecondary,
  },
  accountType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  accountRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  inactiveAccountBalance: {
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
