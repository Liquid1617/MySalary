import React, { useState, useEffect } from 'react';
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
import TransactionTypeTabs from './TransactionTypeTabs';
import AddCategoryModal from './AddCategoryModal';
import { Account, Category } from '../types/transaction';

interface AccountForCard {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency_symbol: string;
}

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [transactionType, setTransactionType] = useState<
    'income' | 'expense' | 'transfer'
  >('income');
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
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
      resetForm();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      console.log('Loading accounts and categories...');

      const accountsData = await apiService.get<Account[]>('/accounts');
      console.log('Accounts loaded:', accountsData);
      setAccounts(accountsData || []);

      const categoriesData = await apiService.get<Category[]>('/categories');
      console.log('Categories loaded:', categoriesData);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Error',
        `Failed to load data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  };

  const handleCategoryAdded = () => {
    // Перезагружаем категории после добавления новой
    loadData();
  };

  const resetForm = () => {
    setTransactionType('income');
    setSelectedAccount(null);
    setSelectedToAccount(null);
    setSelectedCategory(null);
    setAmount('');
    setDescription('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async () => {
    if (transactionType === 'transfer') {
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

      if (transactionType === 'transfer') {
        console.log('Creating transfer transaction:', {
          account_id: selectedAccount!.id,
          transfer_to: selectedToAccount!.id,
          amount: numericAmount,
          transaction_type: 'transfer',
          description: description || '',
        });

        await apiService.post('/transactions', {
          account_id: selectedAccount!.id,
          transfer_to: selectedToAccount!.id,
          amount: numericAmount,
          transaction_type: 'transfer',
          description: description || '',
          transaction_date: transactionDate,
        });

        console.log('Transfer completed successfully');
      } else {
        console.log('Creating transaction with data:', {
          account_id: selectedAccount!.id,
          category_id: selectedCategory!.id,
          amount: numericAmount,
          transaction_type: transactionType,
          description: description || '',
        });

        await apiService.post('/transactions', {
          account_id: selectedAccount!.id,
          category_id: selectedCategory!.id,
          amount: numericAmount,
          transaction_type: transactionType,
          description: description || '',
          transaction_date: transactionDate,
        });
      }

      Alert.alert(
        'Success',
        transactionType === 'transfer'
          ? 'Transfer completed successfully'
          : 'Transaction added successfully',
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Error',
        `Failed to create transaction: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    category => category.type === transactionType,
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
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome5 name="times" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Transaction Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Type</Text>
            <TransactionTypeTabs
              value={transactionType}
              onChange={type => {
                setTransactionType(type as 'income' | 'expense' | 'transfer');
                setSelectedCategory(null);
              }}
            />
          </View>

          {/* From Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {transactionType === 'transfer' ? 'From Account' : 'Account'}
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
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* To Account (for transfers) */}
          {transactionType === 'transfer' && (
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
                      />
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Category (not for transfers) */}
          {transactionType !== 'transfer' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowCategoryModal(true)}>
                {selectedCategory ? (
                  <View style={styles.selectedCategoryDisplay}>
                    <FontAwesome5
                      name={selectedCategory.icon}
                      size={16}
                      color={selectedCategory.color}
                      solid
                    />
                    <Text style={styles.selectorText}>
                      {selectedCategory.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.selectorText, styles.selectorPlaceholder]}>
                    Select Category
                  </Text>
                )}
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

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                Add{' '}
                {transactionType === 'transfer' ? 'Transfer' : 'Transaction'}
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
              {/* Add Category Button */}
              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={() => {
                  console.log('Add Category button pressed');
                  setShowCategoryModal(false);
                  setShowAddCategoryModal(true);
                }}>
                <FontAwesome5 name="plus" size={16} color={colors.primary} />
                <Text style={styles.addCategoryText}>
                  Add New Category
                </Text>
              </TouchableOpacity>

              {/* Existing Categories */}
              {filteredCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.listItem}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategoryModal(false);
                  }}>
                  <View style={styles.categoryItem}>
                    <FontAwesome5
                      name={category.icon}
                      size={20}
                      color={category.color}
                      solid
                    />
                    <Text style={styles.listItemTitle}>
                      {category.name}
                    </Text>
                    {!category.is_system && (
                      <Text style={styles.customBadge}>Custom</Text>
                    )}
                  </View>
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

        {/* Add Category Modal */}
        <AddCategoryModal
          visible={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          onCategoryAdded={handleCategoryAdded}
          categoryType={transactionType === 'transfer' ? 'expense' : transactionType}
        />
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
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addCategoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  customBadge: {
    fontSize: 12,
    color: '#8B5CF6',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 'auto',
    fontWeight: '500',
  },
  selectedCategoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
});
