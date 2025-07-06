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

export const BalanceChangeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [loading, setLoading] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

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
      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
      // Устанавливаем пустые массивы в случае ошибки
      setAccounts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAccount || !selectedCategory || !amount) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
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
      
      Alert.alert('Успех', 'Транзакция добавлена успешно', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Ошибка создания транзакции:', error);
      Alert.alert('Ошибка', 'Не удалось создать транзакцию');
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      cash: 'Наличные',
      debit_card: 'Дебетовая карта',
      credit_card: 'Кредитная карта',
      bank_account: 'Банковский счет',
      digital_wallet: 'Цифровой кошелек',
    };
    return types[type] || type;
  };

  const filteredCategories = categories ? categories.filter(category => category.type === transactionType) : [];

  if (isLoading) {
    return (
      <SafeAreaView style={[layoutStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[typographyStyles.body1, { textAlign: 'center', marginTop: 16 }]}>
          Загрузка данных...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={layoutStyles.container}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Text style={[typographyStyles.h1, { marginBottom: 24 }]}>
            Изменение баланса
          </Text>

          {/* Переключатель типа транзакции */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[typographyStyles.h3, { marginBottom: 8 }]}>
              Тип операции
            </Text>
            <View style={{ flexDirection: 'row', borderRadius: 8, overflow: 'hidden' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: transactionType === 'income' ? Colors.primary : Colors.secondary,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setTransactionType('income');
                  setSelectedCategory(null);
                }}>
                <Text style={{
                  color: transactionType === 'income' ? Colors.white : Colors.text,
                  fontWeight: '600',
                }}>
                  Доход
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: transactionType === 'expense' ? Colors.primary : Colors.secondary,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setTransactionType('expense');
                  setSelectedCategory(null);
                }}>
                <Text style={{
                  color: transactionType === 'expense' ? Colors.white : Colors.text,
                  fontWeight: '600',
                }}>
                  Расход
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Выбор счета */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[typographyStyles.h3, { marginBottom: 8 }]}>
              Счет
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
              <Text style={{
                color: selectedAccount ? Colors.text : Colors.textSecondary,
                fontSize: 16,
              }}>
                {selectedAccount 
                  ? `${selectedAccount.account_name} (${getAccountTypeLabel(selectedAccount.account_type)})`
                  : 'Выберите счет'
                }
              </Text>
            </TouchableOpacity>
          </View>

          {/* Выбор категории */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[typographyStyles.h3, { marginBottom: 8 }]}>
              Категория
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
              <Text style={{
                color: selectedCategory ? Colors.text : Colors.textSecondary,
                fontSize: 16,
              }}>
                {selectedCategory ? selectedCategory.name : 'Выберите категорию'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Сумма */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[typographyStyles.h3, { marginBottom: 8 }]}>
              Сумма
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 8,
                padding: 12,
                backgroundColor: Colors.background,
                fontSize: 16,
              }}
              value={amount}
              onChangeText={setAmount}
              placeholder="Введите сумму"
              keyboardType="numeric"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {/* Описание */}
          <View style={{ marginBottom: 32 }}>
            <Text style={[typographyStyles.h3, { marginBottom: 8 }]}>
              Описание (опционально)
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
              placeholder="Добавьте описание..."
              multiline
              textAlignVertical="top"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {/* Кнопка сохранения */}
          <TouchableOpacity
            style={{
              backgroundColor: Colors.primary,
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 20,
            }}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={{
                color: Colors.white,
                fontSize: 16,
                fontWeight: '600',
              }}>
                Сохранить
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[typographyStyles.h1]}>Выберите счет</Text>
              <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                <Text style={{ color: Colors.primary, fontSize: 16 }}>Закрыть</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {accounts && accounts.length > 0 ? accounts.map((account) => (
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
                  }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                    {account.account_name}
                  </Text>
                  <Text style={{ color: Colors.textSecondary, marginBottom: 4 }}>
                    {getAccountTypeLabel(account.account_type)}
                  </Text>
                  <Text style={{ color: Colors.primary }}>
                    {account.balance} {account.currency.symbol}
                  </Text>
                </TouchableOpacity>
              )) : (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: Colors.textSecondary }}>
                    Нет доступных счетов
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[typographyStyles.h1]}>Выберите категорию</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={{ color: Colors.primary, fontSize: 16 }}>Закрыть</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {filteredCategories.length > 0 ? filteredCategories.map((category) => (
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
              )) : (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: Colors.textSecondary }}>
                    Нет категорий для выбранного типа операции
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