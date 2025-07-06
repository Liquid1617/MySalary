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
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (passwordValue: string): boolean => {
    if (!passwordValue) {
      setPasswordError('Password is required');
      return false;
    }
    if (passwordValue.length < 6) {
      setPasswordError('Password must be at least 6 characters');
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

      // Temporary diagnostic alert
      const diagnosticMessage = `Available: ${capability.available}
Type: ${capability.biometryType || 'None'}
Enabled: ${isAlreadyEnabled}
Error: ${capability.error || 'None'}`;

      Alert.alert('Biometric Diagnostics', diagnosticMessage, [{ text: 'OK' }]);

      if (capability.available && !isAlreadyEnabled) {
        // Suggest setting up biometrics
        Alert.alert(
          'Setup Biometric Login',
          `Would you like to set up ${biometricService.getBiometryDisplayName(
            capability.biometryType,
          )} for quick access to the app?`,
          [
            {
              text: 'Not now',
              style: 'cancel',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              },
            },
            {
              text: 'Set up',
              onPress: async () => {
                const authResult =
                  await biometricService.authenticateWithBiometrics(
                    'Confirm biometric authentication setup',
                  );

                if (authResult.success) {
                  await biometricService.setBiometricEnabled(true);
                  Alert.alert(
                    'Success!',
                    `${biometricService.getBiometryDisplayName(
                      capability.biometryType,
                    )} is now set up. You can now sign in faster!`,
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
        // Redirect to main screen immediately
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Authentication error';
      Alert.alert('Error', errorMessage);
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
                Welcome!
              </Text>
              <Text
                style={[typographyStyles.body1, loginScreenStyles.subtitle]}>
                Sign in to your MySalary account
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
                placeholder="Enter your email"
                keyboardType="email-address"
              />

              <CustomInput
                label="Password"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (passwordError) {
                    validatePassword(text);
                  }
                }}
                error={passwordError}
                placeholder="Enter your password"
                isPassword
              />
            </View>

            <TouchableOpacity style={loginScreenStyles.forgotPassword}>
              <Text
                style={[
                  typographyStyles.body2,
                  loginScreenStyles.forgotPasswordText,
                ]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <View style={loginScreenStyles.buttonSpacing}>
              <CustomButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
              />
            </View>

            <CustomButton
              title="Create Account"
              variant="secondary"
              onPress={navigateToRegister}
            />

            <View style={loginScreenStyles.footer}>
              <Text
                style={[typographyStyles.body2, loginScreenStyles.footerText]}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text
                  style={[
                    typographyStyles.body2,
                    loginScreenStyles.registerLink,
                  ]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
