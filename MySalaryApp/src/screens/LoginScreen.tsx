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
import { loginScreenStyles, layoutStyles, typographyStyles } from '../styles';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { apiService } from '../services/api';
import { biometricService } from '../services/biometric';

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
      await apiService.login({
        email,
        password,
      });

      // Проверяем, доступна ли биометрия и не настроена ли уже
      const capability = await biometricService.checkBiometricCapability();
      const isAlreadyEnabled = await biometricService.isBiometricEnabled();

      console.log('Biometric capability:', capability);
      console.log('Biometric already enabled:', isAlreadyEnabled);

      // Временный диагностический алерт
      const diagnosticMessage = `Доступна: ${capability.available}
Тип: ${capability.biometryType || 'Нет'}
Включена: ${isAlreadyEnabled}
Ошибка: ${capability.error || 'Нет'}`;

      Alert.alert('Диагностика биометрии', diagnosticMessage, [{ text: 'OK' }]);

      if (capability.available && !isAlreadyEnabled) {
        // Предлагаем настроить биометрию
        Alert.alert(
          'Настройка входа',
          `Хотите настроить вход по ${biometricService.getBiometryDisplayName(
            capability.biometryType,
          )} для быстрого доступа к приложению?`,
          [
            {
              text: 'Не сейчас',
              style: 'cancel',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              },
            },
            {
              text: 'Настроить',
              onPress: async () => {
                const authResult =
                  await biometricService.authenticateWithBiometrics(
                    'Подтвердите настройку биометрической аутентификации',
                  );

                if (authResult.success) {
                  await biometricService.setBiometricEnabled(true);
                  Alert.alert(
                    'Успех!',
                    `${biometricService.getBiometryDisplayName(
                      capability.biometryType,
                    )} настроен. Теперь вы можете входить в приложение быстрее!`,
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainTabs' }],
                          });
                        },
                      },
                    ],
                  );
                } else {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                  });
                }
              },
            },
          ],
        );
      } else {
        // Сразу перенаправляем на главную страницу
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
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
                isPassword
              />
            </View>

            <TouchableOpacity style={loginScreenStyles.forgotPassword}>
              <Text
                style={[
                  typographyStyles.body2,
                  loginScreenStyles.forgotPasswordText,
                ]}>
                Забыли пароль?
              </Text>
            </TouchableOpacity>

            <View style={loginScreenStyles.buttonSpacing}>
              <CustomButton
                title="Войти"
                onPress={handleLogin}
                loading={loading}
              />
            </View>

            <CustomButton
              title="Создать аккаунт"
              variant="secondary"
              onPress={navigateToRegister}
            />

            <View style={loginScreenStyles.footer}>
              <Text
                style={[typographyStyles.body2, loginScreenStyles.footerText]}>
                Нет аккаунта?
              </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text
                  style={[
                    typographyStyles.body2,
                    loginScreenStyles.registerLink,
                  ]}>
                  Зарегистрироваться
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
