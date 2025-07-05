import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typographyStyles, layoutStyles } from '../styles';

interface AuthLoadingScreenProps {
  navigation: any;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  navigation,
}) => {
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Проверяем, есть ли сохраненный токен и данные пользователя
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        // Пользователь авторизован, переходим на главную
        const user = JSON.parse(userData);
        console.log('User already logged in:', user);

        // Устанавливаем глобальные данные пользователя
        (global as any).currentUser = user;
        (global as any).userToken = token;

        navigation.replace('MainTabs');
      } else {
        // Пользователь не авторизован, переходим на экран входа
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // В случае ошибки переходим на экран входа
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={[typographyStyles.body1, styles.loadingText]}>
        Загрузка...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
});
