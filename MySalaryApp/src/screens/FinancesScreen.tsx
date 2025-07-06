import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { homeScreenStyles, layoutStyles, typographyStyles, profileScreenStyles } from '../styles';
import { biometricService, BiometricCapability } from '../services/biometric';
import { apiService } from '../services/api';

// Минималистичная иконка изменения баланса
const BalanceChangeIcon = ({ size = 32, color = 'default' }: { size?: number; color?: 'default' | 'light' }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ position: 'relative' }}>
      {/* Стрелка вверх (доход) */}
      <View style={{
        position: 'absolute',
        top: -2,
        left: 0,
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color === 'light' ? 'rgba(255, 255, 255, 0.9)' : '#22C55E',
      }} />
      {/* Стрелка вниз (расход) */}
      <View style={{
        position: 'absolute',
        top: 8,
        left: 0,
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: color === 'light' ? 'rgba(255, 255, 255, 0.7)' : '#EF4444',
      }} />
    </View>
  </View>
);

export const FinancesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  const [biometricCapability, setBiometricCapability] =
    useState<BiometricCapability | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [netWorth, setNetWorth] = useState<any>(null);
  const [netWorthLoading, setNetWorthLoading] = useState(false);

  useEffect(() => {
    initializeBiometric();
    loadTransactions();
    loadNetWorth();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
      loadNetWorth();
    }, [])
  );

  const initializeBiometric = async () => {
    try {
      const capability = await biometricService.checkBiometricCapability();
      setBiometricCapability(capability);

      if (capability.available) {
        const isEnabled = await biometricService.isBiometricEnabled();
        setBiometricEnabled(isEnabled);
      }
    } catch (error) {
      console.error('Ошибка инициализации биометрии:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const transactionsData = await apiService.get<any[]>('/transactions');
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Ошибка загрузки транзакций:', error);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadNetWorth = async () => {
    try {
      setNetWorthLoading(true);
      const netWorthData = await apiService.get<any>('/networth');
      setNetWorth(netWorthData);
    } catch (error) {
      console.error('Ошибка загрузки Net Worth:', error);
      setNetWorth(null);
    } finally {
      setNetWorthLoading(false);
    }
  };

  const formatNetWorth = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (categoryName: string, categoryType: string) => {
    if (!categoryName) return '💰';
    
    const name = categoryName.toLowerCase();
    let icon = '💰';
    
    if (name.includes('зарплата')) icon = '💰';
    else if (name.includes('продукты') || name.includes('питание')) icon = '🛒';
    else if (name.includes('транспорт')) icon = '🚗';
    else if (name.includes('коммунальные')) icon = '🏠';
    else if (name.includes('развлечения')) icon = '🎬';
    else if (name.includes('одежда')) icon = '👕';
    else if (name.includes('медицина') || name.includes('здоровье')) icon = '⚕️';
    else if (name.includes('образование')) icon = '📚';
    else if (name.includes('дом') || name.includes('быт')) icon = '🏠';
    else if (name.includes('кредит') || name.includes('займ')) icon = '💳';
    else if (name.includes('спорт') || name.includes('фитнес')) icon = '🏋️';
    else if (name.includes('путешествия')) icon = '✈️';
    else if (name.includes('ресторан') || name.includes('кафе')) icon = '🍽️';
    else if (name.includes('бензин') || name.includes('парковка')) icon = '⛽';
    else if (name.includes('красота') || name.includes('уход')) icon = '💄';
    else if (name.includes('подарки')) icon = '🎁';
    else if (name.includes('прочие')) icon = '💸';
    
    return icon;
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      if (value) {
        const authResult = await biometricService.authenticateWithBiometrics(
          'Confirm biometric authentication setup',
        );

        if (authResult.success) {
          await biometricService.setBiometricEnabled(true);
          setBiometricEnabled(true);
          Alert.alert(
            'Success',
            `${biometricService.getBiometryDisplayName(
              biometricCapability?.biometryType || null,
            )} successfully set up for app login`,
          );
        } else {
          Alert.alert(
            'Error',
            authResult.error || 'Failed to set up biometrics',
          );
        }
      } else {
        await biometricService.setBiometricEnabled(false);
        setBiometricEnabled(false);
        Alert.alert('Biometrics Disabled', 'Biometric login disabled');
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      Alert.alert('Error', 'Failed to change biometric settings');
    }
  };

  return (
    <>
      {/* Устанавливаем светлый статус-бар */}
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      
      <ScrollView 
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Полноэкранный градиентный фон только для верхней части */}
        <LinearGradient
          colors={['#FFAF7B', '#D76D77']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top, // Отступ для статус-бара
            paddingBottom: 30,
          }}
        >
          {/* Net Worth без визуального блока */}
          <View style={{ alignItems: 'center', marginBottom: 32, marginTop: 40, paddingHorizontal: 24 }}>
            <Text style={[typographyStyles.h3, { 
              textAlign: 'center', 
              marginBottom: 16, 
              color: 'white',
              fontWeight: '600' 
            }]}>
              Net Worth
            </Text>
            
            {netWorthLoading ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={[typographyStyles.body1, { color: 'white' }]}>Loading...</Text>
              </View>
            ) : netWorth ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={[typographyStyles.h1, { 
                  fontSize: 36, 
                  fontWeight: 'bold', 
                  color: 'white',
                  marginBottom: 8 
                }]}>
                  {formatNetWorth(netWorth.netWorth)} {netWorth.primaryCurrency?.symbol || '$'}
                </Text>
                <Text style={[typographyStyles.body2, { 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  textAlign: 'center',
                  marginBottom: 8 
                }]}>
                  in {netWorth.primaryCurrency?.name || 'USD'}
                </Text>
                <Text style={[typographyStyles.caption, { 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  textAlign: 'center' 
                }]}>
                  {netWorth.message}
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Text style={[typographyStyles.body1, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                  Failed to load data
                </Text>
                <TouchableOpacity 
                  onPress={loadNetWorth}
                  style={{
                    marginTop: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 14 }}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Balance Change на полупрозрачном белом блоке */}
          <View style={{ paddingHorizontal: 24 }}>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
              onPress={() => navigation.navigate('BalanceChange')}>
            <View style={{ marginBottom: 8 }}>
              <BalanceChangeIcon size={32} color="light" />
            </View>
            <Text style={[homeScreenStyles.featureTitle, { color: 'white', fontWeight: '600' }]}>
              Balance Change
            </Text>
            <Text style={[homeScreenStyles.featureDescription, { color: 'rgba(255, 255, 255, 0.8)' }]}>
              Income and Expenses
            </Text>
          </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Transaction History секция НА БЕЛОМ ФОНЕ */}
        <View style={{ backgroundColor: '#F8F9FA', paddingBottom: 24, paddingHorizontal: 24 }}>
          <View style={[homeScreenStyles.mainContent, { marginTop: 24, gap: 10 }]}>
            <View style={profileScreenStyles.sectionHeader}>
              <Text style={[typographyStyles.h3, profileScreenStyles.sectionTitle, { color: '#000000' }]}>
                Transaction History
              </Text>
            </View>

          {transactionsLoading ? (
            <View style={profileScreenStyles.infoCard}>
              <Text style={typographyStyles.body1}>Loading transactions...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={profileScreenStyles.infoCard}>
              <Text style={typographyStyles.body1}>No transactions yet</Text>
              <Text style={typographyStyles.caption}>
                Transactions will appear here after creation
              </Text>
            </View>
          ) : (
            <View style={profileScreenStyles.infoCard}>
              {transactions.slice(0, 10).map((transaction, index) => (
                <View key={transaction.id}>
                  <View style={profileScreenStyles.transactionHeader}>
                    <View style={profileScreenStyles.transactionInfo}>
                      <Text style={profileScreenStyles.transactionCategory}>
                        {getCategoryIcon(
                          transaction.category?.category_name || '', 
                          transaction.category?.category_type || ''
                        )} {transaction.category?.category_name || 'Category'}
                      </Text>
                                              <Text style={profileScreenStyles.transactionAccount}>
                        {transaction.account?.account_name || 'Account'}
                      </Text>
                      <Text style={profileScreenStyles.transactionDate}>
                        {formatTransactionDate(transaction.transaction_date)}
                      </Text>
                    </View>
                    <View style={profileScreenStyles.transactionAmount}>
                      <Text 
                        style={[
                          profileScreenStyles.transactionAmountText,
                          { 
                            color: transaction.transaction_type === 'income' ? '#28a745' : '#dc3545' 
                          }
                        ]}
                      >
                        {transaction.transaction_type === 'income' ? '+' : '-'}
                        {transaction.amount} {transaction.account?.currency?.symbol || ''}
                      </Text>
                    </View>
                  </View>
                  {transaction.description && (
                    <Text style={profileScreenStyles.transactionDescription}>
                      {transaction.description}
                    </Text>
                  )}
                  {index < transactions.slice(0, 10).length - 1 && (
                    <View style={{
                      height: 1,
                      backgroundColor: '#E5E5EA',
                      marginTop: 12,
                      marginBottom: 12,
                    }} />
                  )}
                </View>
              ))}
            </View>
          )}

          {transactions.length > 10 && (
            <View style={[profileScreenStyles.infoCard, { marginTop: 12 }]}>
              <Text style={typographyStyles.caption}>
                Showing last 10 transactions
              </Text>
            </View>
          )}
        </View>
        </View>

        <View style={[homeScreenStyles.footer, { paddingHorizontal: 24 }]}>
          {biometricCapability?.available && (
            <View style={homeScreenStyles.biometricContainer}>
              <TouchableOpacity
                style={homeScreenStyles.biometricRow}
                onPress={() => handleBiometricToggle(!biometricEnabled)}>
                <View style={homeScreenStyles.biometricInfo}>
                  <Text style={homeScreenStyles.biometricTitle}>
                    Sign in with{' '}
                    {biometricService.getBiometryDisplayName(
                      biometricCapability.biometryType,
                    )}
                  </Text>
                  <Text style={homeScreenStyles.biometricDescription}>
                    Fast and secure authentication
                  </Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                  thumbColor={biometricEnabled ? '#FFFFFF' : '#FFFFFF'}
                  ios_backgroundColor="#E5E5EA"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
};
