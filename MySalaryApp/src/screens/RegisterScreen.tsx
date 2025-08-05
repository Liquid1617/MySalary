import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { WelcomeBackground } from '../components/WelcomeBackground';
import { apiService } from '../services/api';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}) => {
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [nameError, setNameError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [loading, setLoading] = useState(false);
  const [loginChecking, setLoginChecking] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states for inputs
  const [nameFocused, setNameFocused] = useState(false);
  const [loginFocused, setLoginFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const insets = useSafeAreaInsets();

  // Get screen height and calculate proportional distances
  const screenHeight = Dimensions.get('window').height;
  // Subtract safe area insets from positions since we're inside SafeAreaView
  const tempoTopDistance = (145 / 932) * screenHeight - insets.top; // 252px on 932px screen

  // Reset errors when leaving the screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setNameError('');
        setLoginError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
      };
    }, []),
  );

  const validateName = (nameValue: string): boolean => {
    if (!nameValue.trim()) {
      setNameError('Required field');
      return false;
    }
    if (nameValue.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    if (nameValue.trim().length > 50) {
      setNameError('Name must be no more than 50 characters');
      return false;
    }

    setNameError('');
    return true;
  };

  const validateLogin = (loginValue: string): boolean => {
    if (!loginValue.trim()) {
      setLoginError('Required field');
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
      setLoginError('');
    } catch (error) {
      if (error instanceof Error) {
        // Translate Russian server errors to English
        let errorMessage = error.message;
        if (
          errorMessage.includes('уже существует') ||
          errorMessage.includes('уже зарегистрирован')
        ) {
          errorMessage = 'User with this login already exists';
        } else if (errorMessage.includes('недоступен')) {
          errorMessage = 'This login is not available';
        }
        setLoginError(errorMessage);
      } else {
        setLoginError('Error checking login');
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
        // Translate Russian server errors to English
        let errorMessage = error.message;
        if (
          errorMessage.includes('уже существует') ||
          errorMessage.includes('уже зарегистрирован')
        ) {
          errorMessage = 'User with this email already exists';
        } else if (errorMessage.includes('недоступен')) {
          errorMessage = 'This email is not available';
        }
        setEmailError(errorMessage);
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
      setEmailError('Required field');
      return false;
    }
    if (!emailRegex.test(mail)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) {
      return { strength: 'none', color: '', width: 0 };
    }
    if (pass.length < 6) {
      return { strength: 'weak', color: '#FCA1A2', width: 33 };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pass)) {
      return { strength: 'medium', color: 'orange', width: 66 };
    }
    return { strength: 'strong', color: '#53EFAE', width: 100 };
  };

  const validatePassword = (pass: string): boolean => {
    if (!pass) {
      setPasswordError('Required field');
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
      setConfirmPasswordError('Required field');
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
    const isNameValid = validateName(name);
    const isLoginValid = validateLogin(login);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!acceptTerms) {
      Alert.alert('Error', 'You must accept the terms of service');
      return;
    }

    if (
      !isNameValid ||
      !isLoginValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid
    ) {
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        name: name.trim(),
        login: login.trim(),
        email: email.trim(),
        password,
      };

      await apiService.register(registerData);

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      let errorMessage = 'Failed to create account. Please try again later.';

      if (error instanceof Error) {
        // Translate Russian server errors to English
        if (
          error.message.includes('уже существует') ||
          error.message.includes('уже зарегистрирован')
        ) {
          errorMessage = 'User with this email or login already exists';
        } else if (error.message.includes('недоступен')) {
          errorMessage = 'Email or login is not available';
        } else if (
          error.message.includes('неверный') ||
          error.message.includes('неправильный')
        ) {
          errorMessage = 'Invalid data provided';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const getBorderColor = (hasError: boolean, isFocused: boolean) => {
    if (hasError) return '#FCA1A2';
    if (isFocused) return '#53EFAE';
    return '#E5E5EA';
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
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <WelcomeBackground />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 32,
              paddingTop: tempoTopDistance,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#252233',
                textAlign: 'center',
                marginBottom: 40,
              }}>
              tempo
            </Text>
            {/* Logo */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  fontFamily: 'Commissioner-Bold',
                  color: '#333333',
                  marginBottom: 8,
                  textAlign: 'center',
                }}>
                Create Account
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Commissioner-Regular',
                  color: '#666666',
                  textAlign: 'center',
                }}>
                Achieve financial wellness with AI
              </Text>
            </View>

            {/* Form */}
            <View style={{ marginBottom: 32 }}>
              {/* Name Input */}
              <View style={{ marginBottom: 20 }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: getBorderColor(!!nameError, nameFocused),
                    borderRadius: 8,
                    paddingHorizontal: 20,
                    paddingVertical: 18,
                    fontSize: 16,
                    fontFamily: 'Commissioner-Regular',
                    backgroundColor: '#FFFFFF',
                    color: nameError ? '#FCA1A2' : '#252234',
                  }}
                  value={name}
                  onChangeText={text => {
                    setName(text);
                    if (nameError) {
                      validateName(text);
                    }
                  }}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="Name"
                  placeholderTextColor="#999999"
                  selectionColor="#53EFAE"
                  keyboardType="default"
                  autoCapitalize="words"
                  autoCorrect={false}
                  textContentType="name"
                />
                {nameError ? (
                  <Text
                    style={{
                      color: '#FCA1A2',
                      fontSize: 11,
                      fontFamily: 'Commissioner',
                      fontWeight: '400',
                      lineHeight: 11,
                      letterSpacing: 0,
                      marginTop: 8,
                      marginLeft: 4,
                    }}>
                    {nameError}
                  </Text>
                ) : null}
              </View>

              {/* Login Input */}
              <View style={{ marginBottom: 20 }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: getBorderColor(!!loginError, loginFocused),
                    borderRadius: 8,
                    paddingHorizontal: 20,
                    paddingVertical: 18,
                    fontSize: 16,
                    fontFamily: 'Commissioner-Regular',
                    backgroundColor: '#FFFFFF',
                    color: loginError ? '#FCA1A2' : '#252234',
                  }}
                  value={login}
                  onChangeText={text => {
                    setLogin(text);
                    if (loginError && !loginChecking) {
                      validateLogin(text);
                    }
                  }}
                  onFocus={() => setLoginFocused(true)}
                  onBlur={() => {
                    setLoginFocused(false);
                    if (login.trim()) {
                      checkLoginAvailability(login);
                    }
                  }}
                  placeholder="Login"
                  placeholderTextColor="#999999"
                  selectionColor="#53EFAE"
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                />
                {loginError ? (
                  <Text
                    style={{
                      color: '#FCA1A2',
                      fontSize: 11,
                      fontFamily: 'Commissioner',
                      fontWeight: '400',
                      lineHeight: 11,
                      letterSpacing: 0,
                      marginTop: 8,
                      marginLeft: 4,
                    }}>
                    {loginError}
                  </Text>
                ) : null}
              </View>

              {/* Email Input */}
              <View style={{ marginBottom: 20 }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: getBorderColor(!!emailError, emailFocused),
                    borderRadius: 8,
                    paddingHorizontal: 20,
                    paddingVertical: 18,
                    fontSize: 16,
                    fontFamily: 'Commissioner-Regular',
                    backgroundColor: '#FFFFFF',
                    color: emailError ? '#FCA1A2' : '#252234',
                  }}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (emailError && !emailChecking) {
                      validateEmail(text);
                    }
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => {
                    setEmailFocused(false);
                    if (email.trim()) {
                      checkEmailAvailability(email);
                    }
                  }}
                  placeholder="Email"
                  placeholderTextColor="#999999"
                  selectionColor="#53EFAE"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                />
                {emailError ? (
                  <Text
                    style={{
                      color: '#FCA1A2',
                      fontSize: 11,
                      fontFamily: 'Commissioner',
                      fontWeight: '400',
                      lineHeight: 11,
                      letterSpacing: 0,
                      marginTop: 8,
                      marginLeft: 4,
                    }}>
                    {emailError}
                  </Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: getBorderColor(
                      !!passwordError,
                      passwordFocused,
                    ),
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <TextInput
                    style={{
                      flex: 1,
                      paddingHorizontal: 20,
                      paddingVertical: 18,
                      fontSize: 16,
                      fontFamily: 'Commissioner-Regular',
                      color: passwordError ? '#FCA1A2' : '#252234',
                    }}
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
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="Password"
                    placeholderTextColor="#999999"
                    selectionColor="#53EFAE"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                  />
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 18,
                    }}
                    onPress={() => setShowPassword(!showPassword)}>
                    <FontAwesome5
                      name={showPassword ? 'eye-slash' : 'eye'}
                      size={20}
                      color="#999999"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text
                    style={{
                      color: '#FCA1A2',
                      fontSize: 11,
                      fontFamily: 'Commissioner',
                      fontWeight: '400',
                      lineHeight: 11,
                      letterSpacing: 0,
                      marginTop: 8,
                      marginLeft: 4,
                    }}>
                    {passwordError}
                  </Text>
                ) : null}
                {password.length > 0 && (
                  <View style={{ marginTop: 8, marginLeft: 4 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: 'Commissioner',
                        fontWeight: '400',
                        color:
                          passwordStrength.strength === 'weak'
                            ? '#FCA1A2'
                            : passwordStrength.strength === 'medium'
                              ? '#FFA500'
                              : '#53EFAE',
                      }}>
                      Strength: {getPasswordStrengthLabel()}
                    </Text>
                    <View
                      style={{
                        height: 4,
                        backgroundColor: '#E5E5EA',
                        borderRadius: 2,
                        marginTop: 4,
                      }}>
                      <View
                        style={{
                          height: 4,
                          width: `${passwordStrength.width}%`,
                          backgroundColor:
                            passwordStrength.strength === 'weak'
                              ? '#FCA1A2'
                              : passwordStrength.strength === 'medium'
                                ? '#FFA500'
                                : '#53EFAE',
                          borderRadius: 2,
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={{ marginBottom: 32 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: getBorderColor(
                      !!confirmPasswordError,
                      confirmPasswordFocused,
                    ),
                    borderRadius: 8,
                    backgroundColor: '#FFFFFF',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <TextInput
                    style={{
                      flex: 1,
                      paddingHorizontal: 20,
                      paddingVertical: 18,
                      fontSize: 16,
                      fontFamily: 'Commissioner-Regular',
                      color: confirmPasswordError ? '#FCA1A2' : '#252234',
                    }}
                    value={confirmPassword}
                    onChangeText={text => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) {
                        validateConfirmPassword(text);
                      }
                    }}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999999"
                    selectionColor="#53EFAE"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                  />
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 18,
                    }}
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }>
                    <FontAwesome5
                      name={showConfirmPassword ? 'eye-slash' : 'eye'}
                      size={20}
                      color="#999999"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? (
                  <Text
                    style={{
                      color: '#FCA1A2',
                      fontSize: 11,
                      fontFamily: 'Commissioner',
                      fontWeight: '400',
                      lineHeight: 11,
                      letterSpacing: 0,
                      marginTop: 8,
                      marginLeft: 4,
                    }}>
                    {confirmPasswordError}
                  </Text>
                ) : null}
              </View>
              {/* Terms checkbox */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: 32,
                }}>
                <TouchableOpacity
                  style={{
                    width: 20,
                    height: 20,
                    borderWidth: 1,
                    borderColor: acceptTerms ? '#252234' : '#E5E5EA',
                    borderRadius: 4,
                    backgroundColor: acceptTerms ? '#252234' : '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    marginTop: 2,
                  }}
                  onPress={() => setAcceptTerms(!acceptTerms)}>
                  {acceptTerms && (
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Commissioner-Regular',
                    color: '#666666',
                    flex: 1,
                    lineHeight: 20,
                  }}>
                  I accept the{' '}
                  <Text style={{ color: '#252234', fontWeight: '600' }}>
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text style={{ color: '#252234', fontWeight: '600' }}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#252234',
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  marginBottom: 24,
                  opacity:
                    loading || !acceptTerms || loginChecking || emailChecking
                      ? 0.7
                      : 1,
                }}
                onPress={handleRegister}
                disabled={
                  loading || !acceptTerms || loginChecking || emailChecking
                }>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 18,
                    fontWeight: '600',
                    fontFamily: 'Commissioner-SemiBold',
                  }}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Spacer to push footer to bottom */}
            <View style={{ flex: 1 }} />

            {/* Footer */}
            <View style={{ alignItems: 'center', paddingBottom: 50 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#666666',
                    marginRight: 8,
                  }}>
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#252234',
                      fontWeight: '600',
                      fontFamily: 'Commissioner-SemiBold',
                    }}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
