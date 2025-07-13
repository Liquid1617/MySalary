import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { homeScreenStyles, layoutStyles, typographyStyles } from '../styles';
import { CustomButton } from '../components/CustomButton';
import { apiService } from '../services/api';
import { biometricService, BiometricCapability } from '../services/biometric';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [biometricCapability, setBiometricCapability] =
    useState<BiometricCapability | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    initializeBiometric();
  }, []);

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

  const handleBiometricToggle = async (value: boolean) => {
    try {
      if (value) {
        // Если включаем биометрию, сначала тестируем её
        const authResult = await biometricService.authenticateWithBiometrics(
          'Подтвердите настройку биометрической аутентификации',
        );

        if (authResult.success) {
          await biometricService.setBiometricEnabled(true);
          setBiometricEnabled(true);
          Alert.alert(
            'Успех',
            `${biometricService.getBiometryDisplayName(
              biometricCapability?.biometryType || null,
            )} успешно настроен для входа в приложение`,
          );
        } else {
          Alert.alert(
            'Ошибка',
            authResult.error || 'Не удалось настроить биометрию',
          );
        }
      } else {
        await biometricService.setBiometricEnabled(false);
        setBiometricEnabled(false);
        Alert.alert('Биометрия отключена', 'Вход по биометрии отключен');
      }
    } catch (error) {
      console.error('Ошибка настройки биометрии:', error);
      Alert.alert('Ошибка', 'Не удалось изменить настройки биометрии');
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
            setLoading(true);
            await apiService.logout();
            await biometricService.clearBiometricSettings(); // Очищаем настройки биометрии
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Ошибка при выходе:', error);
            Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[homeScreenStyles.container, { backgroundColor: '#F6F7F8' }]}>
      <View style={[homeScreenStyles.content, { backgroundColor: '#F6F7F8' }]}>
        <View style={homeScreenStyles.header}>
          <Text style={[typographyStyles.h1, homeScreenStyles.welcomeTitle]}>
            Welcome to MySalary! 🎉
          </Text>
          <Text style={[typographyStyles.body1, homeScreenStyles.subtitle]}>
            Now you can manage your finances easily and efficiently
          </Text>
        </View>

        <View style={homeScreenStyles.mainContent}>
          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>💰</Text>
            <Text style={homeScreenStyles.featureTitle}>
              Income Management
            </Text>
            <Text style={homeScreenStyles.featureDescription}>
              Track all your income sources
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>📊</Text>
            <Text style={homeScreenStyles.featureTitle}>
              Expense Analytics
            </Text>
            <Text style={homeScreenStyles.featureDescription}>
              Analyze spending by categories
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>🎯</Text>
            <Text style={homeScreenStyles.featureTitle}>
              Budget Planning
            </Text>
            <Text style={homeScreenStyles.featureDescription}>
              Set goals and achieve them
            </Text>
          </View>
        </View>

        <View style={homeScreenStyles.footer}>
          <CustomButton
            title="Start Managing Finances 💰"
            variant="primary"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Finances' })}
            style={{ marginBottom: 12 }}
          />
          
          <CustomButton
            title="AI Financial Assistant 🤖"
            variant="secondary"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Chat' })}
            style={{ marginBottom: 16 }}
          />

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

          <CustomButton
            title="Sign Out"
            variant="secondary"
            onPress={handleLogout}
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
