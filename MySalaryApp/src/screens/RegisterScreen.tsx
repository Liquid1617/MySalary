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
      console.error('Error loading countries:', error);
      Alert.alert('Error', 'Failed to load countries list');
    } finally {
      setCountriesLoading(false);
    }
  };

  const validateLogin = (loginValue: string): boolean => {
    if (!loginValue.trim()) {
      setLoginError('Username is required');
      return false;
    }
    if (loginValue.trim().length < 3) {
      setLoginError('Username must be at least 3 characters');
      return false;
    }
    if (loginValue.trim().length > 50) {
      setLoginError('Username must be no more than 50 characters');
      return false;
    }

    const loginRegex = /^[a-zA-Z0-9._]+$/;
    if (!loginRegex.test(loginValue.trim())) {
      setLoginError(
        'Username can only contain letters, numbers, dots and underscores',
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
      setLoginError(''); // Username available
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('Error checking username');
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
      setEmailError(''); // Email available
    } catch (error) {
      if (error instanceof Error) {
        setEmailError(error.message);
      } else {
        setEmailError('Error checking email');
      }
    } finally {
      setEmailChecking(false);
    }
  };

  const validateEmail = (mail: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!mail) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(mail)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const checkPhoneAvailability = async (phoneValue: string) => {
    if (!validatePhone(phoneValue)) {
      return;
    }

    // If field is empty, don't check (phone is optional)
    if (!phoneValue.trim()) {
      return;
    }

    try {
      setPhoneChecking(true);
      const fullPhoneNumber = `${selectedCountryCode}${phoneValue.trim()}`;
      await apiService.checkPhoneAvailability(fullPhoneNumber);
      setPhoneError(''); // Phone available
    } catch (error) {
      if (error instanceof Error) {
        setPhoneError(error.message);
      } else {
        setPhoneError('Error checking phone number');
      }
    } finally {
      setPhoneChecking(false);
    }
  };

  const handlePhoneInput = (text: string): string => {
    // Filter only digits
    const numbersOnly = text.replace(/[^0-9]/g, '');

    // If user tried to enter non-digit character, show hint
    if (text !== numbersOnly) {
      setPhoneInputHint('Only digits are allowed');
      // Hide hint after 2 seconds
      setTimeout(() => {
        setPhoneInputHint('');
      }, 2000);
    }

    return numbersOnly;
  };

  const validatePhone = (phoneNumber: string): boolean => {
    if (!phoneNumber.trim()) {
      setPhoneError('');
      return true; // Phone is optional
    }

    // Check local number format (without country code)
    const phoneRegex = /^[0-9]{6,15}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setPhoneError(
        'Enter a valid phone number (digits only, 6-15 characters)',
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
      setPasswordError('Password is required');
      return false;
    }
    if (pass.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pass)) {
      setPasswordError(
        'Password must contain uppercase letter, lowercase letter and digit',
      );
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPass: string): boolean => {
    if (!confirmPass) {
      setConfirmPasswordError('Password confirmation is required');
      return false;
    }
    if (confirmPass !== password) {
      setConfirmPasswordError('Passwords do not match');
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
      Alert.alert('Error', 'You must accept the terms of service');
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

      await apiService.register(registerData);

      // Redirect to main screen immediately after successful registration
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create account. Please try again later.';
      Alert.alert('Error', errorMessage);
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
      return 'Weak';
    } else if (passwordStrength.strength === 'medium') {
      return 'Medium';
    } else {
      return 'Strong';
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
                Create Account
              </Text>
              <Text
                style={[typographyStyles.body1, registerScreenStyles.subtitle]}>
                Join MySalary and manage your finances
              </Text>
            </View>

            <View style={registerScreenStyles.form}>
              <CustomInput
                label="Username"
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
                placeholder="Enter username"
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
                placeholder="Enter your email"
                keyboardType="email-address"
                loading={emailChecking}
              />

              <View>
                <Text style={registerScreenStyles.phoneLabel}>
                  Phone (optional)
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
                    placeholder="Enter phone number"
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
                label="Country (optional)"
                value={selectedCountry}
                options={countries.map(country => ({
                  id: country.id,
                  name: country.name,
                  code: country.code,
                }))}
                onSelect={option => setSelectedCountry(option.id as number)}
                placeholder="Select country"
                disabled={countriesLoading}
              />

              <View>
                <CustomInput
                  label="Password"
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
                  placeholder="Create password"
                  isPassword
                />
                {password.length > 0 && (
                  <View style={registerScreenStyles.passwordStrengthContainer}>
                    <Text style={getPasswordStrengthTextStyle()}>
                      Strength: {getPasswordStrengthLabel()}
                    </Text>
                    <View style={registerScreenStyles.strengthIndicator}>
                      <View style={getPasswordStrengthStyle()} />
                    </View>
                  </View>
                )}
              </View>

              <CustomInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) {
                    validateConfirmPassword(text);
                  }
                }}
                error={confirmPasswordError}
                placeholder="Repeat password"
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
                I accept the{' '}
                <Text style={registerScreenStyles.termsLink}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={registerScreenStyles.termsLink}>
                  Privacy Policy
                </Text>
              </Text>
            </View>

            <View style={registerScreenStyles.buttonSpacing}>
              <CustomButton
                title="Create Account"
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
              title="Already have an account? Sign In"
              variant="secondary"
              onPress={navigateToLogin}
            />

            <View style={registerScreenStyles.footer}>
              <Text
                style={[
                  typographyStyles.body2,
                  registerScreenStyles.footerText,
                ]}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text
                  style={[
                    typographyStyles.body2,
                    registerScreenStyles.loginLink,
                  ]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
