import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import { authLoadingScreenStyles, typographyStyles } from '../styles';
import { colors } from '../styles/colors';
import { apiService } from '../services/api';
import { biometricService } from '../services/biometric';

interface AuthLoadingScreenProps {
  navigation: any;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  navigation,
}) => {
  useEffect(() => {
    checkAuthAndNavigate();
  }, []);

  const checkAuthAndNavigate = async () => {
    try {
      console.log('=== AuthLoadingScreen: Checking auth status ===');
      const storedToken = await apiService.getStoredToken();
      console.log('Stored token:', storedToken ? 'exists' : 'not found');
      
      const isAuthenticated = await apiService.checkAuthStatus();
      console.log('Is authenticated:', isAuthenticated);

      if (!isAuthenticated) {
        // Если пользователь не авторизован, переходим на экран приветствия
        console.log('User not authenticated, navigating to Welcome');
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        }, 1000);
        return;
      }

      // Если пользователь авторизован, проверяем биометрию
      const canUseBiometric = await biometricService.canUseBiometricLogin();

      if (canUseBiometric) {
        // Добавляем дополнительную задержку для показа логотипа
        setTimeout(async () => {
          const biometricAuth =
            await biometricService.authenticateWithBiometrics();

          if (biometricAuth.success) {
            // Биометрия успешна - переходим на главную
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          } else {
            // Биометрия неуспешна - переходим на экран приветствия
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        }, 1500);
      } else {
        // Биометрия не настроена - переходим сразу на главную
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        }, 1000);
      }
    } catch (error) {
      console.error('=== AuthLoadingScreen: Auth check error ===');
      console.error('Error details:', error);
      console.log('Navigating to Welcome due to error');
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }, 1000);
    }
  };
  return (
    <SafeAreaView style={authLoadingScreenStyles.container}>
      <View style={authLoadingScreenStyles.content}>
        <View style={authLoadingScreenStyles.logoContainer}>
          <Text style={authLoadingScreenStyles.logo}>💰</Text>
          <Text style={[typographyStyles.h1, authLoadingScreenStyles.appName]}>
            MySalary
          </Text>
        </View>

        <View style={authLoadingScreenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={authLoadingScreenStyles.loadingText}>Загрузка...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
