import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CustomButton } from './CustomButton';
import { FlatList } from 'react-native';
import { apiService } from '../services/api';
import { colors } from '../styles/colors';

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center' as const,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
    justifyContent: 'center' as const,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top' as const,
  },
  buttonContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
};

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  visible,
  onClose,
  onAccountAdded,
}) => {
  const [accountType, setAccountType] = useState('cash');
  const [accountName, setAccountName] = useState('');
  const [balance, setBalance] = useState('0');
  const [description, setDescription] = useState('');
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const accountTypes = [
    { value: 'cash', label: 'Наличные' },
    { value: 'debit_card', label: 'Дебетовая карта' },
    { value: 'credit_card', label: 'Кредитная карта' },
    { value: 'bank_account', label: 'Банковский счет' },
    { value: 'digital_wallet', label: 'Цифровой кошелек' },
  ];

  useEffect(() => {
    if (visible) {
      loadCurrencies();
    }
  }, [visible]);

  const loadCurrencies = async () => {
    try {
      const response = await apiService.get<{ currencies: any[] }>(
        '/currencies',
      );
      const currenciesData = response.currencies || [];
      setCurrencies(currenciesData);
      // Выбираем первую валюту по умолчанию (RUB)
      if (currenciesData.length > 0) {
        const defaultCurrency =
          currenciesData.find(c => c.code === 'RUB') || currenciesData[0];
        setSelectedCurrency(defaultCurrency);
      }
    } catch (error) {
      console.error('Ошибка загрузки валют:', error);
      // Fallback на случай ошибки
      const fallbackCurrencies = [
        { id: 1, code: 'RUB', name: 'Российский рубль', symbol: '₽' },
        { id: 2, code: 'USD', name: 'Доллар США', symbol: '$' },
        { id: 3, code: 'EUR', name: 'Евро', symbol: '€' },
      ];
      setCurrencies(fallbackCurrencies);
      setSelectedCurrency(fallbackCurrencies[0]);
    }
  };

  const handleSubmit = async () => {
    if (!accountName.trim()) {
      Alert.alert('Ошибка', 'Название счета обязательно');
      return;
    }

    if (!selectedCurrency) {
      Alert.alert('Ошибка', 'Выберите валюту');
      return;
    }

    try {
      setLoading(true);

      const accountData = {
        account_type: accountType,
        account_name: accountName.trim(),
        currency_id: selectedCurrency.id,
        balance: parseFloat(balance) || 0,
        description: description.trim(),
      };

      await apiService.post('/accounts', accountData);

      Alert.alert('Успех', 'Счет успешно создан');
      onAccountAdded();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Ошибка создания счета:', error);
      Alert.alert('Ошибка', 'Не удалось создать счет');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAccountType('cash');
    setAccountName('');
    setBalance('0');
    setDescription('');
    // Сбрасываем на рубли или первую валюту
    const defaultCurrency =
      currencies.find(c => c.code === 'RUB') || currencies[0] || null;
    setSelectedCurrency(defaultCurrency);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Добавить счет</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Тип счета</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowTypeModal(true)}>
                <Text style={{ color: '#000' }}>
                  {accountTypes.find(t => t.value === accountType)?.label ||
                    'Выберите тип'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Название счета</Text>
              <TextInput
                style={styles.input}
                value={accountName}
                onChangeText={setAccountName}
                placeholder="Введите название счета"
                maxLength={100}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Валюта</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowCurrencyModal(true)}>
                <Text style={{ color: '#000' }}>
                  {selectedCurrency
                    ? `${selectedCurrency.code} - ${selectedCurrency.name}`
                    : 'Выберите валюту'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Начальный баланс</Text>
              <TextInput
                style={styles.input}
                value={balance}
                onChangeText={setBalance}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Описание (необязательно)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Введите описание"
                multiline
                numberOfLines={3}
                maxLength={255}
              />
            </View>

            <View style={styles.buttonContainer}>
              <CustomButton
                title="Создать счет"
                onPress={handleSubmit}
                disabled={loading}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal для выбора типа счета */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 20,
              width: '80%',
            }}>
            <Text
              style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
              Выберите тип счета
            </Text>
            <FlatList
              data={accountTypes}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                  }}
                  onPress={() => {
                    setAccountType(item.value);
                    setShowTypeModal(false);
                  }}>
                  <Text style={{ fontSize: 16 }}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={{
                marginTop: 15,
                padding: 10,
                backgroundColor: '#007AFF',
                borderRadius: 5,
              }}
              onPress={() => setShowTypeModal(false)}>
              <Text style={{ color: 'white', textAlign: 'center' }}>
                Отмена
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal для выбора валюты */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 20,
              width: '80%',
            }}>
            <Text
              style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
              Выберите валюту
            </Text>
            <FlatList
              data={currencies}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                  }}
                  onPress={() => {
                    setSelectedCurrency(item);
                    setShowCurrencyModal(false);
                  }}>
                  <Text style={{ fontSize: 16 }}>
                    {item.code} - {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={{
                marginTop: 15,
                padding: 10,
                backgroundColor: '#007AFF',
                borderRadius: 5,
              }}
              onPress={() => setShowCurrencyModal(false)}>
              <Text style={{ color: 'white', textAlign: 'center' }}>
                Отмена
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};
