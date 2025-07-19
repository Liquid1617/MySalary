import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../styles';
import { apiService } from '../services/api';
import AccountCard from './AccountCard';
import { Transaction, Account, Category } from '../types/transaction';

interface AccountForCard {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency_symbol: string;
}

interface EditTransactionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  visible,
  transaction,
  onClose,
  onSuccess,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedToAccount, setSelectedToAccount] = useState<Account | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const populateForm = useCallback(() => {
    if (!transaction) return;

    setAmount(transaction.amount);
    setDescription(transaction.description || '');
    setTransactionDate(transaction.transaction_date || new Date().toISOString().split('T')[0]);

    // Will be set once accounts/categories are loaded in useEffect below
  }, [transaction]);

  useEffect(() => {
    if (visible && transaction) {
      loadData();
      populateForm();
    }
  }, [visible, transaction, populateForm]);

  const loadData = async () => {
    try {
      const [accountsData, categoriesData] = await Promise.all([
        apiService.get<Account[]>('/accounts'),
        apiService.get<Category[]>('/categories'),
      ]);
      setAccounts(accountsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Set selected items once data is loaded
  useEffect(() => {
    if (transaction && accounts.length > 0) {
      const account = accounts.find(acc => acc.id === transaction.account.id);
      setSelectedAccount(account || null);

      if (transaction.transfer_to_account) {
        const toAccount = accounts.find(
          acc => acc.id === transaction.transfer_to_account?.id,
        );
        setSelectedToAccount(toAccount || null);
      }
    }
  }, [transaction, accounts]);

  useEffect(() => {
    if (transaction && categories.length > 0 && transaction.category) {
      const category = categories.find(
        cat => cat.id === transaction.category?.id,
      );
      setSelectedCategory(category || null);
    }
  }, [transaction, categories]);

  const handleUpdate = async () => {
    if (!transaction) return;

    if (transaction.transaction_type === 'transfer') {
      if (!selectedAccount || !selectedToAccount || !amount) {
        Alert.alert('Error', 'Please fill in all required fields for transfer');
        return;
      }
      if (selectedAccount.id === selectedToAccount.id) {
        Alert.alert('Error', 'Cannot transfer to the same account');
        return;
      }
    } else {
      if (!selectedAccount || !selectedCategory || !amount) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);

      // For now, transfers cannot be edited - they would need special handling
      // as they are stored as two separate transactions
      if (transaction.transaction_type === 'transfer') {
        Alert.alert(
          'Info',
          'Transfer editing is not supported yet. Please delete and create a new transfer.',
        );
        return;
      }

      await apiService.put(`/transactions/${transaction.id}`, {
        account_id: selectedAccount!.id,
        category_id: selectedCategory!.id,
        amount: numericAmount,
        transaction_type: transaction.transaction_type,
        description: description || '',
        transaction_date: transactionDate,
      });

      Alert.alert('Success', 'Transaction updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;

    try {
      setLoading(true);
      await apiService.delete(`/transactions/${transaction.id}`);
      Alert.alert('Success', 'Transaction deleted successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Error', 'Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ],
    );
  };

  if (!transaction) return null;

  const isTransfer = transaction.transaction_type === 'transfer';
  const filteredCategories = categories.filter(
    category => (category.category_type || category.type) === transaction.transaction_type,
  );
  const availableToAccounts = accounts.filter(
    account => account.id !== selectedAccount?.id,
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Edit {isTransfer ? 'Transfer' : 'Transaction'}
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={confirmDelete}>
              <FontAwesome5 name="trash" size={16} color={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome5 name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Transaction Type Display */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Type</Text>
            <View
              style={[
                styles.typeDisplay,
                {
                  backgroundColor:
                    transaction.transaction_type === 'expense'
                      ? colors.error
                      : transaction.transaction_type === 'income'
                      ? colors.success
                      : transaction.transaction_type === 'transfer'
                      ? colors.accent
                      : colors.primary,
                },
              ]}>
              <Text style={[styles.typeDisplayText, { color: colors.white }]}>
                {transaction.transaction_type.charAt(0).toUpperCase() +
                  transaction.transaction_type.slice(1)}
              </Text>
            </View>
          </View>

          {/* From Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isTransfer ? 'From Account' : 'Account'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.accountScrollView}>
              <View style={styles.accountCardsContainer}>
                {accounts.map(account => {
                  const accountForCard: AccountForCard = {
                    id: account.id.toString(),
                    name: account.account_name,
                    type: account.account_type,
                    balance: parseFloat(account.balance),
                    currency_symbol: account.currency.symbol,
                  };
                  return (
                    <AccountCard
                      key={account.id}
                      account={accountForCard}
                      selected={selectedAccount?.id === account.id}
                      onPress={() => setSelectedAccount(account)}
                      disabled={isTransfer}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* To Account (for transfers) */}
          {isTransfer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>To Account</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.accountScrollView}>
                <View style={styles.accountCardsContainer}>
                  {availableToAccounts.map(account => {
                    const accountForCard: AccountForCard = {
                      id: account.id.toString(),
                      name: account.account_name,
                      type: account.account_type,
                      balance: parseFloat(account.balance),
                      currency_symbol: account.currency.symbol,
                    };
                    return (
                      <AccountCard
                        key={account.id}
                        account={accountForCard}
                        selected={selectedToAccount?.id === account.id}
                        onPress={() => setSelectedToAccount(account)}
                        disabled={true}
                      />
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Category (not for transfers) */}
          {!isTransfer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowCategoryModal(true)}>
                <Text
                  style={[
                    styles.selectorText,
                    !selectedCategory && styles.selectorPlaceholder,
                  ]}>
                  {selectedCategory
                    ? `${selectedCategory.icon} ${
                        selectedCategory.category_name || selectedCategory.name || ''
                      }`
                    : 'Select Category'}
                </Text>
                <FontAwesome5
                  name="chevron-right"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter description"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.selectorText}>
                <FontAwesome5 name="calendar" size={16} color={colors.text} />{'  '}
                {new Date(transactionDate).toLocaleDateString()}
              </Text>
              <FontAwesome5
                name="chevron-right"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleUpdate}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                Update {isTransfer ? 'Transfer' : 'Transaction'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Category Selection Modal */}
        <Modal
          visible={showCategoryModal}
          animationType="slide"
          presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {filteredCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.listItem}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategoryModal(false);
                  }}>
                  <Text style={styles.listItemTitle}>
                    {category.icon} {category.category_name || category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <Modal
            visible={showDatePicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowDatePicker(false)}>
            <TouchableOpacity 
              style={styles.datePickerOverlay} 
              activeOpacity={1} 
              onPress={() => setShowDatePicker(false)}>
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalClose}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>Select Date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalClose}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={new Date(transactionDate)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setTransactionDate(selectedDate.toISOString().split('T')[0]);
                    }
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                    }
                  }}
                  minimumDate={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 3)} // 3 года назад
                  maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 год вперед
                />
              </View>
            </TouchableOpacity>
          </Modal>
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
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  typeDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeDisplayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountScrollView: {
    flexGrow: 0,
  },
  accountCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  selectorText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  selectorPlaceholder: {
    color: colors.textSecondary,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalClose: {
    fontSize: 16,
    color: colors.primary,
  },
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});
