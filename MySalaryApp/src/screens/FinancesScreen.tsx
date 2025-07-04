import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { homeScreenStyles, layoutStyles, typographyStyles } from '../styles';
import { biometricService, BiometricCapability } from '../services/biometric';

export const FinancesScreen: React.FC = () => {
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

  return (
    <SafeAreaView style={homeScreenStyles.container}>
      <ScrollView style={homeScreenStyles.content}>
        <View style={homeScreenStyles.header}>
          <Text style={[typographyStyles.h1, homeScreenStyles.welcomeTitle]}>
            Добро пожаловать в MySalary! 💰
          </Text>
          <Text style={[typographyStyles.body1, homeScreenStyles.subtitle]}>
            Управляйте своими финансами легко и эффективно
          </Text>
        </View>

        <View style={homeScreenStyles.mainContent}>
          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>📥</Text>
            <Text style={homeScreenStyles.featureTitle}>Добавить доход</Text>
            <Text style={homeScreenStyles.featureDescription}>
              Зарплата, премии, подработки
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>📤</Text>
            <Text style={homeScreenStyles.featureTitle}>Добавить расход</Text>
            <Text style={homeScreenStyles.featureDescription}>
              Покупки, счета, развлечения
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>💳</Text>
            <Text style={homeScreenStyles.featureTitle}>
              Управление счетами
            </Text>
            <Text style={homeScreenStyles.featureDescription}>
              Карты, наличные, депозиты
            </Text>
          </View>
        </View>

        <View style={homeScreenStyles.footer}>
          <Text style={homeScreenStyles.comingSoonText}>
            Функционал находится в разработке...
          </Text>

          {biometricCapability?.available && (
            <View style={homeScreenStyles.biometricContainer}>
              <TouchableOpacity
                style={homeScreenStyles.biometricRow}
                onPress={() => handleBiometricToggle(!biometricEnabled)}>
                <View style={homeScreenStyles.biometricInfo}>
                  <Text style={homeScreenStyles.biometricTitle}>
                    Вход по{' '}
                    {biometricService.getBiometryDisplayName(
                      biometricCapability.biometryType,
                    )}
                  </Text>
                  <Text style={homeScreenStyles.biometricDescription}>
                    Быстрая и безопасная аутентификация
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
    </SafeAreaView>
  );
};
