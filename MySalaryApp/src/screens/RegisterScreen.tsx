import React, { useState, useEffect } from 'react';
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
import {
  registerScreenStyles,
  layoutStyles,
  typographyStyles,
} from '../styles';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { CustomSelect } from '../components/CustomSelect';
import CountryCodeSelector from '../components/CountryCodeSelector';
import { apiService, type Country } from '../services/api';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}) => {
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+7');
  const [_selectedCountryIso, setSelectedCountryIso] = useState('RU');
  const [selectedCountry, setSelectedCountry] = useState<number | undefined>();
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loginError, setLoginError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneInputHint, setPhoneInputHint] = useState('');

  const [loading, setLoading] = useState(false);
  const [loginChecking, setLoginChecking] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  // Загружаем страны при монтировании компонента
  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setCountriesLoading(true);
      const response = await apiService.getCountries();
      setCountries(response.countries);
    } catch (error) {
      console.error('Ошибка загрузки стран:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список стран');
    } finally {
      setCountriesLoading(false);
    }
  };

  const validateLogin = (loginValue: string): boolean => {
    if (!loginValue.trim()) {
      setLoginError('Логин обязателен');
      return false;
    }
    if (loginValue.trim().length < 3) {
      setLoginError('Логин должен быть не менее 3 символов');
      return false;
    }
    if (loginValue.trim().length > 50) {
      setLoginError('Логин должен быть не более 50 символов');
      return false;
    }

    const loginRegex = /^[a-zA-Z0-9._]+$/;
    if (!loginRegex.test(loginValue.trim())) {
      setLoginError(
        'Логин может содержать только буквы, цифры, точки и подчеркивания',
      );
      return false;
    }

    setLoginError('');
    return true;
  };

  const checkLoginAvailability = async (loginValue: string) => {
    if (!validateLogin(loginValue)) {
      return;
    }

    try {
      setLoginChecking(true);
      await apiService.checkLoginAvailability(loginValue.trim());
      setLoginError(''); // Логин доступен
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('Ошибка проверки логина');
      }
    } finally {
      setLoginChecking(false);
    }
  };

  const checkEmailAvailability = async (emailValue: string) => {
    if (!validateEmail(emailValue)) {
      return;
    }

    try {
      setEmailChecking(true);
      await apiService.checkEmailAvailability(emailValue.trim());
      setEmailError(''); // Email доступен
    } catch (error) {
      if (error instanceof Error) {
        setEmailError(error.message);
      } else {
        setEmailError('Ошибка проверки email');
      }
    } finally {
      setEmailChecking(false);
    }
  };

  const validateEmail = (mail: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!mail) {
      setEmailError('Email обязателен');
      return false;
    }
    if (!emailRegex.test(mail)) {
      setEmailError('Введите корректный email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const checkPhoneAvailability = async (phoneValue: string) => {
    if (!validatePhone(phoneValue)) {
      return;
    }

    // Если поле пустое, не проверяем (телефон необязательный)
    if (!phoneValue.trim()) {
      return;
    }

    try {
      setPhoneChecking(true);
      const fullPhoneNumber = `${selectedCountryCode}${phoneValue.trim()}`;
      await apiService.checkPhoneAvailability(fullPhoneNumber);
      setPhoneError(''); // Телефон доступен
    } catch (error) {
      if (error instanceof Error) {
        setPhoneError(error.message);
      } else {
        setPhoneError('Ошибка проверки номера телефона');
      }
    } finally {
      setPhoneChecking(false);
    }
  };

  const handlePhoneInput = (text: string): string => {
    // Фильтруем только цифры
    const numbersOnly = text.replace(/[^0-9]/g, '');

    // Если пользователь пытался ввести нецифровой символ, показываем подсказку
    if (text !== numbersOnly) {
      setPhoneInputHint('Доступны только цифры');
      // Скрываем подсказку через 2 секунды
      setTimeout(() => {
        setPhoneInputHint('');
      }, 2000);
    }

    return numbersOnly;
  };

  const validatePhone = (phoneNumber: string): boolean => {
    if (!phoneNumber.trim()) {
      setPhoneError('');
      return true; // Телефон необязательный
    }

    // Проверка на формат локального номера (без кода страны)
    const phoneRegex = /^[0-9]{6,15}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setPhoneError(
        'Введите корректный номер телефона (только цифры, 6-15 символов)',
      );
      return false;
    }

    setPhoneError('');
    return true;
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) {
      return { strength: 'none', color: '', width: 0 };
    }
    if (pass.length < 6) {
      return { strength: 'weak', color: 'red', width: 33 };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pass)) {
      return { strength: 'medium', color: 'orange', width: 66 };
    }
    return { strength: 'strong', color: 'green', width: 100 };
  };

  const validatePassword = (pass: string): boolean => {
    if (!pass) {
      setPasswordError('Пароль обязателен');
      return false;
    }
    if (pass.length < 6) {
      setPasswordError('Пароль должен быть не менее 6 символов');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pass)) {
      setPasswordError(
        'Пароль должен содержать заглавную букву, строчную букву и цифру',
      );
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPass: string): boolean => {
    if (!confirmPass) {
      setConfirmPasswordError('Подтверждение пароля обязательно');
      return false;
    }
    if (confirmPass !== password) {
      setConfirmPasswordError('Пароли не совпадают');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleRegister = async () => {
    const isLoginValid = validateLogin(login);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    const isPhoneValid = validatePhone(phone);

    if (!acceptTerms) {
      Alert.alert('Ошибка', 'Необходимо принять условия использования');
      return;
    }

    if (
      !isLoginValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid ||
      !isPhoneValid
    ) {
      return;
    }

    setLoading(true);

    try {
      const fullPhoneNumber = phone.trim()
        ? `${selectedCountryCode}${phone.trim()}`
        : '';
      const registerData = {
        login: login.trim(),
        email,
        password,
        ...(fullPhoneNumber && { phone: fullPhoneNumber }),
        ...(selectedCountry && { country_id: selectedCountry }),
      };

      // Получаем authAPI из App.tsx через глобальную переменную
      const authAPI = (global as any).authAPI;

      if (!authAPI) {
        throw new Error('API сервис недоступен');
      }

      const result = await authAPI.register(registerData);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Сохраняем данные пользователя и токен
      if (result.data.token) {
        await AsyncStorage.setItem('userToken', result.data.token);
      }
      await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));

      // Устанавливаем глобальные данные пользователя
      (global as any).currentUser = result.data.user;
      (global as any).userToken = result.data.token;

      console.log('Registration successful, user data:', result.data.user);

      Alert.alert('Успех', result.message, [
        {
          text: 'OK',
          onPress: () => {
            // Сразу перенаправляем на главную страницу после успешной регистрации
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          },
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Не удалось создать аккаунт. Попробуйте позже.';
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const getPasswordStrengthStyle = () => {
    let colorStyle;
    if (passwordStrength.strength === 'weak') {
      colorStyle = registerScreenStyles.strengthWeak;
    } else if (passwordStrength.strength === 'medium') {
      colorStyle = registerScreenStyles.strengthMedium;
    } else {
      colorStyle = registerScreenStyles.strengthStrong;
    }

    return [
      registerScreenStyles.strengthFill,
      { width: `${passwordStrength.width}%` as any },
      colorStyle,
    ];
  };

  const getPasswordStrengthTextStyle = () => {
    let colorStyle;
    if (passwordStrength.strength === 'weak') {
      colorStyle = registerScreenStyles.weak;
    } else if (passwordStrength.strength === 'medium') {
      colorStyle = registerScreenStyles.medium;
    } else {
      colorStyle = registerScreenStyles.strong;
    }

    return [registerScreenStyles.passwordStrengthText, colorStyle];
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength.strength === 'weak') {
      return 'Слабый';
    } else if (passwordStrength.strength === 'medium') {
      return 'Средний';
    } else {
      return 'Сильный';
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <SafeAreaView style={registerScreenStyles.container}>
      <KeyboardAvoidingView
        style={layoutStyles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={registerScreenStyles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={registerScreenStyles.content}>
            <View style={registerScreenStyles.header}>
              <Text style={[typographyStyles.h1, registerScreenStyles.title]}>
                Создать аккаунт
              </Text>
              <Text
                style={[typographyStyles.body1, registerScreenStyles.subtitle]}>
                Присоединяйтесь к MySalary и управляйте своими финансами
              </Text>
            </View>

            <View style={registerScreenStyles.form}>
              <CustomInput
                label="Логин"
                value={login}
                onChangeText={text => {
                  setLogin(text);
                  if (loginError && !loginChecking) {
                    validateLogin(text);
                  }
                }}
                onBlur={() => {
                  if (login.trim()) {
                    checkLoginAvailability(login);
                  }
                }}
                error={loginError}
                placeholder="Введите логин"
                loading={loginChecking}
              />

              <CustomInput
                label="Email"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (emailError && !emailChecking) {
                    validateEmail(text);
                  }
                }}
                onBlur={() => {
                  if (email.trim()) {
                    checkEmailAvailability(email);
                  }
                }}
                error={emailError}
                placeholder="Введите ваш email"
                keyboardType="email-address"
                loading={emailChecking}
              />

              <View>
                <Text style={registerScreenStyles.phoneLabel}>
                  Телефон (необязательно)
                </Text>
                <View style={registerScreenStyles.phoneContainer}>
                  <CountryCodeSelector
                    selectedCountryCode={selectedCountryCode}
                    onCountryCodeChange={(dialCode, isoCode) => {
                      setSelectedCountryCode(dialCode);
                      setSelectedCountryIso(isoCode);
                    }}
                  />
                  <CustomInput
                    label=""
                    value={phone}
                    onChangeText={text => {
                      const filteredText = handlePhoneInput(text);
                      setPhone(filteredText);
                      if (phoneError && !phoneChecking) {
                        validatePhone(filteredText);
                      }
                    }}
                    onBlur={() => {
                      if (phone.trim()) {
                        checkPhoneAvailability(phone);
                      }
                    }}
                    error={phoneError}
                    placeholder="Введите номер телефона"
                    keyboardType="phone-pad"
                    loading={phoneChecking}
                    style={registerScreenStyles.phoneInput}
                  />
                </View>
                <View style={registerScreenStyles.phoneHintContainer}>
                  <Text style={registerScreenStyles.phoneHint}>
                    {phoneInputHint}
                  </Text>
                </View>
              </View>

              <CustomSelect
                label="Страна (необязательно)"
                value={selectedCountry}
                options={countries.map(country => ({
                  id: country.id,
                  name: country.name,
                  code: country.code,
                }))}
                onSelect={option => setSelectedCountry(option.id as number)}
                placeholder="Выберите страну"
                disabled={countriesLoading}
              />

              <View>
                <CustomInput
                  label="Пароль"
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    if (passwordError) {
                      validatePassword(text);
                    }
                    if (confirmPassword && confirmPasswordError) {
                      validateConfirmPassword(confirmPassword);
                    }
                  }}
                  error={passwordError}
                  placeholder="Создайте пароль"
                  isPassword
                />
                {password.length > 0 && (
                  <View style={registerScreenStyles.passwordStrengthContainer}>
                    <Text style={getPasswordStrengthTextStyle()}>
                      Надежность: {getPasswordStrengthLabel()}
                    </Text>
                    <View style={registerScreenStyles.strengthIndicator}>
                      <View style={getPasswordStrengthStyle()} />
                    </View>
                  </View>
                )}
              </View>

              <CustomInput
                label="Подтвердите пароль"
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) {
                    validateConfirmPassword(text);
                  }
                }}
                error={confirmPasswordError}
                placeholder="Повторите пароль"
                isPassword
              />
            </View>

            <View style={registerScreenStyles.termsContainer}>
              <TouchableOpacity
                style={[
                  registerScreenStyles.checkbox,
                  acceptTerms && registerScreenStyles.checkboxChecked,
                ]}
                onPress={() => setAcceptTerms(!acceptTerms)}>
                {acceptTerms && (
                  <Text style={registerScreenStyles.checkboxText}>✓</Text>
                )}
              </TouchableOpacity>
              <Text
                style={[
                  typographyStyles.body2,
                  registerScreenStyles.termsText,
                ]}>
                Я принимаю{' '}
                <Text style={registerScreenStyles.termsLink}>
                  Условия использования
                </Text>{' '}
                и{' '}
                <Text style={registerScreenStyles.termsLink}>
                  Политику конфиденциальности
                </Text>
              </Text>
            </View>

            <View style={registerScreenStyles.buttonSpacing}>
              <CustomButton
                title="Создать аккаунт"
                onPress={handleRegister}
                loading={loading}
                disabled={
                  !acceptTerms ||
                  countriesLoading ||
                  loginChecking ||
                  emailChecking ||
                  phoneChecking
                }
              />
            </View>

            <CustomButton
              title="Уже есть аккаунт? Войти"
              variant="secondary"
              onPress={navigateToLogin}
            />

            <View style={registerScreenStyles.footer}>
              <Text
                style={[
                  typographyStyles.body2,
                  registerScreenStyles.footerText,
                ]}>
                Уже есть аккаунт?
              </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text
                  style={[
                    typographyStyles.body2,
                    registerScreenStyles.loginLink,
                  ]}>
                  Войти
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
