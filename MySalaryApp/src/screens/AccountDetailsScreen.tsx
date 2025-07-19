import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { apiService } from '../services/api';
import { Colors } from '../styles/colors';
import { getAccountTypeIcon } from '../utils/accountTypeIcon';
import { Transaction, Account } from '../types/transaction';


// Function to get category icon and color for transactions
const getCategoryIcon = (categoryName: string, categoryType: string) => {
  // Income category icons
  if (categoryType === 'income') {
    switch (categoryName.toLowerCase()) {
      case 'salary':
        return { icon: 'money-bill-wave', color: '#6B7280' };
      case 'bonus & rewards':
        return { icon: 'gift', color: '#6B7280' };
      case 'freelance':
        return { icon: 'laptop', color: '#6B7280' };
      case 'investments':
        return { icon: 'chart-line', color: '#6B7280' };
      case 'sales & trade':
        return { icon: 'handshake', color: '#6B7280' };
      case 'rental income':
        return { icon: 'home', color: '#6B7280' };
      case 'pension & benefits':
        return { icon: 'shield-alt', color: '#6B7280' };
      case 'scholarship':
        return { icon: 'graduation-cap', color: '#6B7280' };
      case 'gifts & inheritance':
        return { icon: 'gift', color: '#6B7280' };
      case 'tax refund':
        return { icon: 'file-invoice-dollar', color: '#6B7280' };
      case 'cashback':
        return { icon: 'credit-card', color: '#6B7280' };
      case 'other income':
        return { icon: 'plus-circle', color: '#6B7280' };
      default:
        return { icon: 'arrow-up', color: '#6B7280' };
    }
  }

  // Expense category icons
  switch (categoryName.toLowerCase()) {
    case 'food & groceries':
      return { icon: 'shopping-cart', color: '#6B7280' };
    case 'transportation':
      return { icon: 'car', color: '#6B7280' };
    case 'utilities':
      return { icon: 'bolt', color: '#6B7280' };
    case 'entertainment':
      return { icon: 'gamepad', color: '#6B7280' };
    case 'clothing & shoes':
      return { icon: 'tshirt', color: '#6B7280' };
    case 'healthcare':
      return { icon: 'heartbeat', color: '#6B7280' };
    case 'education':
      return { icon: 'graduation-cap', color: '#6B7280' };
    case 'home & garden':
      return { icon: 'home', color: '#6B7280' };
    case 'loans & credit':
      return { icon: 'credit-card', color: '#6B7280' };
    case 'sports & fitness':
      return { icon: 'dumbbell', color: '#6B7280' };
    case 'travel':
      return { icon: 'plane', color: '#6B7280' };
    case 'restaurants & cafes':
      return { icon: 'utensils', color: '#6B7280' };
    case 'gas & parking':
      return { icon: 'gas-pump', color: '#6B7280' };
    case 'beauty & care':
      return { icon: 'spa', color: '#6B7280' };
    case 'gifts':
      return { icon: 'gift', color: '#6B7280' };
    case 'other expenses':
      return { icon: 'ellipsis-h', color: '#6B7280' };
    default:
      return { icon: 'arrow-down', color: '#6B7280' };
  }
};

export const AccountDetailsScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { account: initialAccount } = route.params;

  const [account, setAccount] = useState(initialAccount);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const accountIcon = getAccountTypeIcon(account.account_type);

  useEffect(() => {
    loadAccountTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccountTransactions();
    }, []),
  );

  const loadAccountTransactions = async () => {
    try {
      setLoading(true);
      const allTransactionsData = await apiService.get<Transaction[]>(
        '/transactions',
      );
      // Filter transactions for this specific account
      // Include both transactions from this account and transfers to this account
      const accountTransactions = (allTransactionsData || []).filter(
        transaction =>
          transaction.account.id === account.id || // Normal transactions from this account
          (transaction.transaction_type === 'transfer' &&
            transaction.targetAccount?.id === account.id), // Transfers to this account
      );
      setTransactions(accountTransactions);
    } catch (error) {
      console.error('Error loading account transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameAccount = async () => {
    const trimmedName = newAccountName.trim();

    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a valid account name');
      return;
    }

    if (trimmedName === account.account_name) {
      setShowRenameModal(false);
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert('Error', 'Account name must be at least 2 characters long');
      return;
    }

    try {
      setUpdating(true);
      const updatedAccount = await apiService.put(`/accounts/${account.id}`, {
        account_name: trimmedName,
      });

      setAccount(updatedAccount);
      setShowRenameModal(false);
      setNewAccountName('');
      Alert.alert('Success', 'Account name updated successfully');
    } catch (error) {
      console.error('Error updating account name:', error);
      Alert.alert('Error', 'Failed to update account name. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const openRenameModal = () => {
    setNewAccountName(account.account_name);
    setShowRenameModal(true);
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);

      // Permanently delete account and all transactions
      console.log('Permanently deleting account and transactions:', account.id);
      await apiService.delete(`/accounts/${account.id}/permanently`);
      console.log('Account and transactions permanently deleted');

      setShowDeleteModal(false);
      Alert.alert(
        'Success',
        'Account and all transactions deleted permanently',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Error deleting account:', error);
      setShowDeleteModal(false);

      // Provide more specific error messages
      let errorMessage = 'Failed to delete account. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('Server error (500)')) {
          errorMessage =
            'Server error occurred. The account may have been deleted. Please refresh the app.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Account not found. It may have already been deleted.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Error', errorMessage, [
        {
          text: 'OK',
          onPress: () => {
            // Try to go back anyway in case the account was actually deleted
            navigation.goBack();
          },
        },
      ]);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleReactivateAccount = async () => {
    try {
      Alert.alert(
        'Reactivate Account',
        `Are you sure you want to reactivate "${account.account_name}"? The account will become visible in your active accounts list again.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Reactivate',
            style: 'default',
            onPress: async () => {
              try {
                setUpdating(true);
                const updatedAccount = await apiService.put(
                  `/accounts/${account.id}`,
                  {
                    is_active: true,
                  },
                );

                setAccount(updatedAccount);
                Alert.alert('Success', 'Account reactivated successfully');
              } catch (error) {
                console.error('Error reactivating account:', error);
                Alert.alert(
                  'Error',
                  'Failed to reactivate account. Please try again.',
                );
              } finally {
                setUpdating(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error in reactivate account:', error);
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      Alert.alert(
        'Deactivate Account',
        `Are you sure you want to deactivate "${account.account_name}"? The account will be hidden from your active accounts list, but all transactions will be preserved.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Deactivate',
            style: 'destructive',
            onPress: async () => {
              try {
                setUpdating(true);
                const updatedAccount = await apiService.put(
                  `/accounts/${account.id}`,
                  {
                    is_active: false,
                  },
                );

                setAccount(updatedAccount);
                Alert.alert('Success', 'Account deactivated successfully');
              } catch (error) {
                console.error('Error deactivating account:', error);
                Alert.alert(
                  'Error',
                  'Failed to deactivate account. Please try again.',
                );
              } finally {
                setUpdating(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error in deactivate account:', error);
    }
  };

  const formatBalance = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const formatTransactionDate = (dateString: string) => {
    const transactionDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const transactionDateOnly = new Date(
      transactionDate.getFullYear(),
      transactionDate.getMonth(),
      transactionDate.getDate(),
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );

    if (transactionDateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (transactionDateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      return transactionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Функция для извлечения конвертированной суммы из описания трансфера
  const getConvertedAmount = (
    transaction: Transaction,
    viewingAccountId: number,
  ) => {
    if (transaction.transaction_type !== 'transfer') return null;

    // Если это счет-получатель трансфера
    const isRecipientAccount =
      transaction.targetAccount?.id === viewingAccountId;

    if (isRecipientAccount && transaction.description) {
      // Ищем паттерн [Converted: X USD = Y RUB] в описании
      const convertMatch = transaction.description.match(
        /\[Converted: .+ = (.+) ([A-Z]{3})\]/,
      );
      if (convertMatch) {
        return {
          amount: parseFloat(convertMatch[1]),
          currency: convertMatch[2],
        };
      }
    }

    return null;
  };

  const renderTransaction = (transaction: Transaction, index: number) => {
    const isTransfer = transaction.transaction_type === 'transfer';

    // Get icon and color based on transaction type
    const iconData = isTransfer
      ? { icon: 'exchange-alt', color: '#6B7280' }
      : getCategoryIcon(
          transaction.category?.category_name || '',
          transaction.category?.category_type || '',
        );

    const isIncome = transaction.transaction_type === 'income';
    const isLastItem = index === transactions.length - 1;

    // Получаем конвертированную сумму для трансферов
    const convertedAmount = getConvertedAmount(transaction, account.id);

    return (
      <View key={transaction.id}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
          }}>
          {/* Category/Transfer Icon */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${iconData.color}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
            <FontAwesome5
              name={iconData.icon}
              size={18}
              color={iconData.color}
            />
          </View>

          {/* Transaction Details */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#000',
                marginBottom: 2,
              }}>
              {isTransfer
                ? 'Transfer'
                : transaction.category?.category_name || 'Category'}
            </Text>
            {isTransfer && (
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  alignSelf: 'flex-start',
                }}>
                {/* First Row - From Account */}
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 12,
                    backgroundColor: `${
                      getAccountTypeIcon(
                        transaction.account?.account_type || '',
                      ).color
                    }20`,
                    marginBottom: 4,
                  }}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: getAccountTypeIcon(
                        transaction.account?.account_type || '',
                      ).color,
                      fontWeight: '600',
                    }}>
                    {transaction.account?.account_name || 'Unknown'}
                  </Text>
                </View>

                {/* Second Row - Arrow + To Account */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <FontAwesome5
                    name="arrow-right"
                    size={12}
                    color="#6B7280"
                    style={{ marginRight: 6 }}
                  />

                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 12,
                      backgroundColor: `${
                        getAccountTypeIcon(
                          transaction.targetAccount?.account_type || '',
                        ).color
                      }20`,
                    }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: getAccountTypeIcon(
                          transaction.targetAccount?.account_type || '',
                        ).color,
                        fontWeight: '600',
                      }}>
                      {transaction.targetAccount?.account_name || 'Unknown'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Amount and Date */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: isTransfer
                  ? '#F59E0B'
                  : isIncome
                  ? '#10B981'
                  : '#EF4444',
                marginBottom: 2,
              }}>
              {isTransfer
                ? convertedAmount
                  ? `${formatBalance(convertedAmount.amount.toString())} ${
                      account.currency?.symbol || '$'
                    }`
                  : `${formatBalance(transaction.amount)} ${
                      account.currency?.symbol || '$'
                    }`
                : `${isIncome ? '+' : '-'}${formatBalance(
                    transaction.amount,
                  )} ${account.currency?.symbol || '$'}`}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
              }}>
              {formatTransactionDate(transaction.transaction_date)}
            </Text>
          </View>
        </View>

        {!isLastItem && (
          <View
            style={{
              height: 1,
              backgroundColor: '#E5E5EA',
              marginLeft: 0,
              marginRight: 0,
            }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F7F8' }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={accountIcon.backgroundColor}
      />

      {/* Header with colored background */}
      <View
        style={{
          backgroundColor: accountIcon.backgroundColor,
          paddingTop: insets.top,
          paddingBottom: 30,
          position: 'relative',
          overflow: 'hidden',
        }}>
        {/* Background icon - centered vertically in the content area */}
        <View
          style={{
            position: 'absolute',
            right: -60,
            top: insets.top + 60,
            bottom: 30,
            width: 200,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <FontAwesome5
            name={accountIcon.icon}
            size={160}
            color={accountIcon.color}
            style={{ opacity: 0.3 }}
          />
        </View>

        {/* Back button positioned at the top */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 20,
            marginBottom: 40,
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}>
            <FontAwesome5 name="arrow-left" size={18} color="#333" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#333',
              flex: 1,
            }}
            numberOfLines={1}>
            {account.account_name}
          </Text>
        </View>

        {/* Account info section */}
        <View
          style={{
            paddingHorizontal: 24,
            marginBottom: 32,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#333',
                marginRight: 12,
              }}>
              {account.account_name}
            </Text>
            {!account.is_active && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  backgroundColor: '#FBBF24',
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: '#FFFFFF',
                    fontWeight: '600',
                  }}>
                  DEACTIVATED
                </Text>
              </View>
            )}
          </View>

          <Text
            style={{
              fontSize: 18,
              fontWeight: '500',
              color: accountIcon.color,
              marginBottom: 16,
            }}>
            {accountIcon.name}
          </Text>

          <Text
            style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: '#333',
            }}>
            {formatBalance(account.balance)} {account.currency?.symbol || '$'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: '#F6F7F8' }}
        showsVerticalScrollIndicator={false}>
        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 24,
            marginHorizontal: 20,
            marginTop: 20,
            marginBottom: 24,
          }}>
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#3B82F6',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                marginBottom: 8,
              }}
              onPress={openRenameModal}>
              <FontAwesome5 name="edit" size={20} color="white" />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: '#666',
                textAlign: 'center',
              }}>
              Rename
            </Text>
          </View>

          {!account.is_active ? (
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#10B981',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                  marginBottom: 8,
                }}
                onPress={handleReactivateAccount}>
                <FontAwesome5 name="undo" size={20} color="white" />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: '#666',
                  textAlign: 'center',
                }}>
                Reactivate
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#F59E0B',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                  marginBottom: 8,
                }}
                onPress={handleDeactivateAccount}>
                <FontAwesome5 name="archive" size={20} color="white" />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: '#666',
                  textAlign: 'center',
                }}>
                Deactivate
              </Text>
            </View>
          )}

          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#EF4444',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                marginBottom: 8,
              }}
              onPress={openDeleteModal}>
              <FontAwesome5 name="trash" size={20} color="white" />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: '#666',
                textAlign: 'center',
              }}>
              Delete
            </Text>
          </View>
        </View>

        {/* Transactions Section */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 20,
          }}>
          {/* Title outside the block */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#000',
              marginBottom: 16,
            }}>
            Transactions
          </Text>

          {loading ? (
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" color={accountIcon.color} />
            </View>
          ) : transactions.length > 0 ? (
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}>
              {transactions.map((transaction, index) =>
                renderTransaction(transaction, index),
              )}
            </View>
          ) : (
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                alignItems: 'center',
              }}>
              <FontAwesome5
                name="receipt"
                size={32}
                color="#D1D5DB"
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  color: '#6B7280',
                  textAlign: 'center',
                }}>
                No transactions yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 24,
              width: '80%',
              maxWidth: 320,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#333',
                marginBottom: 16,
                textAlign: 'center',
              }}>
              Rename Account
            </Text>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#E5E5EA',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 20,
              }}
              value={newAccountName}
              onChangeText={setNewAccountName}
              placeholder="Enter new account name"
              autoFocus={true}
              selectTextOnFocus={true}
              onSubmitEditing={handleRenameAccount}
              returnKeyType="done"
              maxLength={50}
            />

            <View
              style={{
                flexDirection: 'row',
                gap: 12,
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                }}
                onPress={() => setShowRenameModal(false)}
                disabled={updating}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#666',
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor:
                    updating ||
                    !newAccountName.trim() ||
                    newAccountName.trim() === account.account_name
                      ? '#D1D5DB'
                      : '#3B82F6',
                  alignItems: 'center',
                }}
                onPress={handleRenameAccount}
                disabled={
                  updating ||
                  !newAccountName.trim() ||
                  newAccountName.trim() === account.account_name
                }>
                {updating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: 'white',
                    }}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 24,
              width: '85%',
              maxWidth: 350,
            }}>
            <View
              style={{
                alignItems: 'center',
                marginBottom: 16,
              }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: '#FEE8E8',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                <FontAwesome5
                  name="exclamation-triangle"
                  size={24}
                  color="#EF4444"
                />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#333',
                  textAlign: 'center',
                }}>
                Delete Account
              </Text>
            </View>

            <Text
              style={{
                fontSize: 16,
                color: '#666',
                textAlign: 'center',
                marginBottom: 8,
              }}>
              Are you sure you want to permanently delete "
              {account.account_name}"?
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: '#EF4444',
                textAlign: 'center',
                marginBottom: 20,
                fontWeight: '500',
              }}>
              {transactions.length > 0
                ? `This will permanently delete the account and all ${
                    transactions.length
                  } transaction${
                    transactions.length !== 1 ? 's' : ''
                  }. This action cannot be undone.`
                : 'This will permanently delete the account. This action cannot be undone.'}
            </Text>

            <View
              style={{
                gap: 12,
              }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                }}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: '#666',
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: deleting ? '#D1D5DB' : '#EF4444',
                  alignItems: 'center',
                }}
                onPress={handleDeleteAccount}
                disabled={deleting}>
                {deleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: 'white',
                    }}>
                    Delete Permanently
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
