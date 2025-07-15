import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { profileScreenStyles, layoutStyles, typographyStyles } from '../styles';
import { apiService, type Currency } from '../services/api';
import { biometricService } from '../services/biometric';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Load user profile from API to get latest currency info
      const currentUser = await apiService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser.user);
        // Update stored user with latest data
        await apiService.updateStoredUser(currentUser.user);
      } else {
        // Fallback to stored user
        const storedUser = await apiService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }

      // Load currencies list
      setCurrenciesLoading(true);
      const currenciesResponse = await apiService.getCurrencies();
      console.log('Loaded currencies:', currenciesResponse.currencies); // Debug log
      setCurrencies(currenciesResponse.currencies);
      setCurrenciesLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
      setCurrenciesLoading(false);
    }
  };

  const handleCurrencyChange = async (currencyId: number) => {
    try {
      setUpdating(true);
      setShowCurrencyModal(false);
      
      const response = await apiService.updateUserProfile({ primary_currency_id: currencyId });
      setUser(response.user);
      
      Alert.alert('Success', 'Currency updated successfully');
      
      // Optionally trigger a refresh of financial data or navigation
      // navigation.navigate('Home'); // or other refresh logic
    } catch (error) {
      console.error('Error updating currency:', error);
      Alert.alert('Error', 'Failed to update currency. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти из аккаунта?', [
      {
        text: 'Отмена',
        style: 'cancel',
      },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.logout();
            await biometricService.clearBiometricSettings();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Ошибка при выходе:', error);
            Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={profileScreenStyles.container}>
        <View style={profileScreenStyles.content}>
          <Text style={typographyStyles.body1}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={profileScreenStyles.container}>
      <ScrollView style={profileScreenStyles.content}>

        <View style={profileScreenStyles.avatarContainer}>
          <View style={profileScreenStyles.avatarWrapper}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={profileScreenStyles.avatar} />
            ) : (
              <View style={profileScreenStyles.avatarPlaceholder}>
                <Text style={profileScreenStyles.avatarText}>
                  {user?.login ? user.login.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={profileScreenStyles.infoContainer}>
          <View style={profileScreenStyles.infoCard}>
            <Text style={profileScreenStyles.infoLabel}>Username</Text>
            <Text style={profileScreenStyles.infoValue}>
              {user?.login || 'Not specified'}
            </Text>
          </View>

          <View style={profileScreenStyles.infoCard}>
            <Text style={profileScreenStyles.infoLabel}>Email</Text>
            <Text style={profileScreenStyles.infoValue}>
              {user?.email || 'Not specified'}
            </Text>
          </View>

          <TouchableOpacity 
            style={profileScreenStyles.infoCard}
            onPress={() => setShowCurrencyModal(true)}
            disabled={updating || currenciesLoading}
          >
            <Text style={profileScreenStyles.infoLabel}>Primary Currency</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={profileScreenStyles.infoValue}>
                {user?.primaryCurrency 
                  ? `${user.primaryCurrency.name} (${user.primaryCurrency.code}) ${user.primaryCurrency.symbol}`
                  : 'Not specified'
                }
              </Text>
              {updating ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={{ color: '#007AFF', fontSize: 14 }}>Change</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>


        {/* Logout Button */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 40,
          paddingBottom: 60,
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#DC3545',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '600',
            }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            margin: 20,
            maxWidth: 350,
            width: '90%',
            maxHeight: '70%',
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#000',
              marginBottom: 20,
              textAlign: 'center',
            }}>
              Select Currency
            </Text>
            
            <ScrollView style={{ maxHeight: 400 }}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 15,
                    paddingHorizontal: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                  }}
                  onPress={() => handleCurrencyChange(currency.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: '#000',
                      marginBottom: 2,
                    }}>
                      {currency.name}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: '#666',
                    }}>
                      {currency.code} • {currency.symbol}
                    </Text>
                  </View>
                  {user?.primary_currency_id === currency.id && (
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: '#007AFF',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={{
                marginTop: 20,
                paddingVertical: 12,
                alignItems: 'center',
              }}
              onPress={() => setShowCurrencyModal(false)}
            >
              <Text style={{ color: '#666', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}; 