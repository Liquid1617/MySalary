import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { apiService } from '../services/api';
import { layoutStyles, typographyStyles } from '../styles';
import { Colors } from '../styles/colors';
import { useDebounce } from '../utils/useDebounce';

interface Account {
  id: number;
  account_name: string;
  account_type: string;
  balance: string;
  currency: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  };
}

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

interface TransactionData {
  account_id: number;
  category_id: number;
  amount: number;
  transaction_type: 'income' | 'expense';
  description: string;
}

export const BalanceChangeScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    'income',
  );
  const [loading, setLoading] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);

  // Debounce для проверки баланса
  const debouncedAmount = useDebounce(amount, 800);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Проверка баланса при изменении суммы для расходов
  useEffect(() => {
    if (transactionType === 'expense' && selectedAccount && debouncedAmount) {
      checkBalance();
    } else {
      setBalanceError(null);
    }
  }, [debouncedAmount, selectedAccount, transactionType]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [accountsResponse, categoriesResponse] = await Promise.all([
        apiService.get('/accounts'),
        apiService.get('/categories'),
      ]);

      // apiService.get() возвращает данные напрямую, не обернутые в объект data
      console.log('Accounts response:', accountsResponse);
      console.log('Categories response:', categoriesResponse);

      setAccounts(Array.isArray(accountsResponse) ? accountsResponse : []);
      setCategories(
        Array.isArray(categoriesResponse) ? categoriesResponse : [],
      );
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      Alert.alert('Error', 'Failed to load data');
      // Устанавливаем пустые массивы в случае ошибки
      setAccounts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBalance = async () => {
    if (!selectedAccount || !debouncedAmount) return;

    const numericAmount = parseFloat(debouncedAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setBalanceError(null);
      return;
    }

    try {
      setCheckingBalance(true);
      const response = await apiService.getAccountBalance(selectedAccount.id);
      const currentBalance = parseFloat(response.balance.toString());

      if (numericAmount > currentBalance) {
        setBalanceError(
          `Insufficient funds. Available: ${currentBalance.toFixed(2)} ${
            response.currency.symbol
          }`,
        );
      } else {
        setBalanceError(null);
      }
    } catch (error) {
      console.error('Ошибка проверки баланса:', error);
      setBalanceError('Balance check error');
    } finally {
      setCheckingBalance(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAccount || !selectedCategory || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const transactionData: TransactionData = {
        account_id: selectedAccount.id,
        category_id: selectedCategory.id,
        amount: numericAmount,
        transaction_type: transactionType,
        description: description || '',
      };

      await apiService.post('/transactions', transactionData);

      Alert.alert('Success', 'Transaction added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Ошибка создания транзакции:', error);
      Alert.alert('Error', 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      cash: 'Cash',
      debit_card: 'Debit Card',
      credit_card: 'Credit Card',
      bank_account: 'Bank Account',
      digital_wallet: 'Digital Wallet',
    };
    return types[type] || type;
  };

  const filteredCategories = categories
    ? categories.filter(category => category.type === transactionType)
    : [];

  if (isLoading) {
    return (
      <SafeAreaView
        style={[layoutStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text
          style={[
            typographyStyles.body1,
            { textAlign: 'center', marginTop: 16 },
          ]}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={layoutStyles.container}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* Переключатель типа транзакции */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[typographyStyles.h3, { marginBottom: 8 }]}>
              Transaction Type
            </Text>
            <View
              style={{
                flexDirection: 'row',
                borderRadius: 8,
                overflow: 'hidden',
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor:
                    transactionType === 'income'
                      ? Colors.primary
                      : Colors.secondary,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setTransactionType('income');
                  setSelectedCategory(null);
                  setBalanceError(null);
                }}>
                <Text
                  style={{
                    color:
                      transactionType === 'income' ? Colors.white : Colors.text,
                    fontWeight: '600',
                  }}>
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor:
                    transactionType === 'expense'
                      ? Colors.primary
                      : Colors.secondary,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setTransactionType('expense');
                  setSelectedCategory(null);
                  setBalanceError(null);
                }}>
                <Text
                  style={{
                    color:
                      transactionType === 'expense'
                        ? Colors.white
                        : Colors.text,
                    fontWeight: '600',
                  }}>
                  Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Выбор счета */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[typographyStyles.h3, { marginBottom: 8 }]}>
              Account
            </Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 8,
                padding: 12,
                backgroundColor: Colors.background,
              }}
              onPress={() => setShowAccountModal(true)}>
              <Text
                style={{
                  color: selectedAccount ? Colors.text : Colors.textSecondary,
                  fontSize: 16,
                }}>
                {selectedAccount
                  ? `${selectedAccount.account_name} (${getAccountTypeLabel(
                      selectedAccount.account_type,
                    )})`
                  : 'Select Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Выбор категории */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[typographyStyles.h3, { marginBottom: 8 }]}>
              Category
            </Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 8,
                padding: 12,
                backgroundColor: Colors.background,
              }}
              onPress={() => setShowCategoryModal(true)}>
              <Text
                style={{
                  color: selectedCategory ? Colors.text : Colors.textSecondary,
                  fontSize: 16,
                }}>
                {selectedCategory ? selectedCategory.name : 'Select Category'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Сумма */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[typographyStyles.h3, { marginBottom: 8 }]}>
              Amount
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: balanceError ? Colors.error : Colors.border,
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: Colors.background,
                  fontSize: 16,
                  paddingRight: checkingBalance ? 40 : 12,
                }}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
              />
              {checkingBalance && (
                <ActivityIndicator
                  size="small"
                  color={Colors.primary}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 14,
                  }}
                />
              )}
            </View>
            {balanceError && (
              <Text
                style={{
                  color: Colors.error,
                  fontSize: 14,
                  marginTop: 4,
                }}>
                {balanceError}
              </Text>
            )}
          </View>

          {/* Описание */}
          <View style={{ marginBottom: 32 }}>
            <Text style={[typographyStyles.h3, { marginBottom: 8 }]}>
              Description (optional)
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 8,
                padding: 12,
                backgroundColor: Colors.background,
                fontSize: 16,
                minHeight: 80,
              }}
              value={description}
              onChangeText={setDescription}
              placeholder="Add description..."
              multiline
              textAlignVertical="top"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {/* Кнопка сохранения */}
          <TouchableOpacity
            style={{
              backgroundColor:
                loading || balanceError ? Colors.disabled : Colors.primary,
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 20,
            }}
            onPress={handleSubmit}
            disabled={loading || !!balanceError}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text
                style={{
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Модальное окно выбора счета */}
      <Modal
        visible={showAccountModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ padding: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
              <Text style={[typographyStyles.h1]}>Select Account</Text>
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                <Text style={{ color: Colors.primary, fontSize: 16 }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {accounts && accounts.length > 0 ? (
                accounts.map(account => (
                  <TouchableOpacity
                    key={account.id}
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.border,
                    }}
                    onPress={() => {
                      setSelectedAccount(account);
                      setShowAccountModal(false);
                      setBalanceError(null);
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        marginBottom: 4,
                      }}>
                      {account.account_name}
                    </Text>
                    <Text
                      style={{ color: Colors.textSecondary, marginBottom: 4 }}>
                      {getAccountTypeLabel(account.account_type)}
                    </Text>
                    <Text style={{ color: Colors.primary }}>
                      {account.balance} {account.currency.symbol}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: Colors.textSecondary }}>
                    No accounts available
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Модальное окно выбора категории */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ padding: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
              <Text style={[typographyStyles.h1]}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={{ color: Colors.primary, fontSize: 16 }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.border,
                    }}
                    onPress={() => {
                      setSelectedCategory(category);
                      setShowCategoryModal(false);
                    }}>
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>
                      {category.icon} {category.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: Colors.textSecondary }}>
                    No categories available for selected transaction type
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};
