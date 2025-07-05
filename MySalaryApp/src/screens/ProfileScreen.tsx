import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typographyStyles } from '../styles';
import { Colors } from '../styles/colors';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadUserAccounts();
  }, []);

  const loadUserData = async () => {
    try {
      // Получаем данные пользователя из глобальной области или AsyncStorage
      let userData = (global as any).currentUser;
      console.log('Global user data:', userData);

      if (!userData) {
        console.log('No global user data, checking AsyncStorage...');
        const storedUserData = await AsyncStorage.getItem('userData');
        console.log('Stored user data from AsyncStorage:', storedUserData);
        if (storedUserData) {
          userData = JSON.parse(storedUserData);
          (global as any).currentUser = userData;
          console.log('Parsed user data from AsyncStorage:', userData);
        }
      }

      setUser(userData);
      console.log('Final user data loaded in ProfileScreen:', userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные пользователя');
    } finally {
      setLoading(false);
    }
  };

  const loadUserAccounts = async () => {
    try {
      const API_BASE_URL =
        (global as any).API_BASE_URL || 'http://localhost:3001/api';
      const token =
        (global as any).userToken || (await AsyncStorage.getItem('userToken'));

      if (!token) {
        console.log('No token found, cannot load accounts');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/accounts`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        console.log('Accounts loaded:', data.accounts);
      } else {
        console.log('Failed to load accounts:', response.status);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Выйти из аккаунта', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          try {
            // Очищаем данные пользователя
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');

            // Очищаем глобальные данные
            (global as any).currentUser = null;
            (global as any).userToken = null;

            // Переходим на экран входа
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[typographyStyles.body1, styles.loadingText]}>
            Загрузка...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={[typographyStyles.body1, styles.errorText]}>
            Данные пользователя не найдены
          </Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Войти заново</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.login ? user.login.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={[typographyStyles.h2, styles.userName]}>
            {user.login || 'Пользователь'}
          </Text>
          <Text style={[typographyStyles.body1, styles.userEmail]}>
            {user.email || 'email@example.com'}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[typographyStyles.h3, styles.sectionTitle]}>
            Информация о пользователе
          </Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>{user.id || 'N/A'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Логин:</Text>
            <Text style={styles.infoValue}>{user.login || 'N/A'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email || 'N/A'}</Text>
          </View>

          {user.phone && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Телефон:</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          )}

          {user.country_id && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Страна ID:</Text>
              <Text style={styles.infoValue}>{user.country_id}</Text>
            </View>
          )}
        </View>

        <View style={styles.accountsContainer}>
          <View style={styles.accountsHeader}>
            <Text style={[typographyStyles.h3, styles.sectionTitle]}>
              Мои счета
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                Alert.alert(
                  'Добавить счет',
                  'Функция добавления счета будет реализована',
                );
              }}>
              <Text style={styles.addButtonText}>+ Добавить</Text>
            </TouchableOpacity>
          </View>

          {accounts.length > 0 ? (
            accounts.map((account, index) => (
              <View key={account.id || index} style={styles.accountItem}>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>
                    {account.name || 'Счет'}
                  </Text>
                  <Text style={styles.accountBalance}>
                    {account.balance
                      ? `${account.balance.toLocaleString()} ₽`
                      : '0 ₽'}
                  </Text>
                </View>
                <Text style={styles.accountCurrency}>
                  {account.currency_code || 'RUB'}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyAccounts}>
              <Text style={styles.emptyAccountsText}>
                У вас пока нет счетов
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Text style={[typographyStyles.h3, styles.sectionTitle]}>
            Статистика
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>142</Text>
              <Text style={styles.statLabel}>Транзакций</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#34C759' }]}>
                ₽ 285,000
              </Text>
              <Text style={styles.statLabel}>Доходы</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF3B30' }]}>
                ₽ 178,500
              </Text>
              <Text style={styles.statLabel}>Расходы</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    color: '#666',
  },
  infoContainer: {
    padding: 20,
  },
  sectionTitle: {
    color: '#000',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  actionsContainer: {
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountsContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  accountsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
    color: '#666',
  },
  accountCurrency: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  emptyAccounts: {
    padding: 20,
    alignItems: 'center',
  },
  emptyAccountsText: {
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
  },
  statsContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
