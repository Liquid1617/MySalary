import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginScreenStyles, layoutStyles, typographyStyles } from '../styles';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      setEmailError('Email обязателен');
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setEmailError('Введите корректный email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (passwordValue: string): boolean => {
    if (!passwordValue) {
      setPasswordError('Пароль обязателен');
      return false;
    }
    if (passwordValue.length < 6) {
      setPasswordError('Пароль должен быть не менее 6 символов');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      // Получаем authAPI из глобальной области
      const authAPI = (global as any).authAPI;

      if (!authAPI) {
        throw new Error('API сервис недоступен');
      }

      const result = await authAPI.login(email, password);

      if (!result.success) {
        throw new Error(result.message);
      }

      console.log('Login API response:', result);
      console.log('User data from API:', result.data.user);

      // Сохраняем данные пользователя и токен
      if (result.data.token) {
        await AsyncStorage.setItem('userToken', result.data.token);
        console.log('Token saved to AsyncStorage');
      }
      await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
      console.log(
        'User data saved to AsyncStorage:',
        JSON.stringify(result.data.user),
      );

      // Устанавливаем глобальные данные пользователя
      (global as any).currentUser = result.data.user;
      (global as any).userToken = result.data.token;

      console.log('Global user data set:', (global as any).currentUser);

      // Переходим на главную страницу
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Ошибка авторизации';
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={loginScreenStyles.container}>
      <KeyboardAvoidingView
        style={layoutStyles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={loginScreenStyles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={loginScreenStyles.content}>
            <View style={loginScreenStyles.header}>
              <Text style={[typographyStyles.h1, loginScreenStyles.title]}>
                Добро пожаловать!
              </Text>
              <Text
                style={[typographyStyles.body1, loginScreenStyles.subtitle]}>
                Войдите в свой аккаунт MySalary
              </Text>
            </View>

            <View style={loginScreenStyles.form}>
              <CustomInput
                label="Email"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (emailError) {
                    validateEmail(text);
                  }
                }}
                error={emailError}
                placeholder="Введите ваш email"
                keyboardType="email-address"
              />

              <CustomInput
                label="Пароль"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (passwordError) {
                    validatePassword(text);
                  }
                }}
                error={passwordError}
                placeholder="Введите ваш пароль"
                secureTextEntry
              />

              <CustomButton
                title={loading ? 'Вход...' : 'Войти'}
                onPress={handleLogin}
                loading={loading}
                style={loginScreenStyles.loginButton}
              />

              <TouchableOpacity
                style={loginScreenStyles.registerButton}
                onPress={navigateToRegister}>
                <Text style={loginScreenStyles.registerButtonText}>
                  Нет аккаунта? Зарегистрироваться
                </Text>
              </TouchableOpacity>

              <View style={loginScreenStyles.demoContainer}>
                <Text style={loginScreenStyles.demoTitle}>
                  Тестовые аккаунты:
                </Text>
                <Text style={loginScreenStyles.demoText}>
                  • demo@example.com / demo123
                </Text>
                <Text style={loginScreenStyles.demoText}>
                  • test@test.com / 123456 (fallback)
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
