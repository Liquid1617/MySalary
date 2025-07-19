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
  TextInput,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { loginScreenStyles, layoutStyles, typographyStyles } from '../styles';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { BackgroundCurve } from '../components/BackgroundCurve';
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
  const [showPassword, setShowPassword] = useState(false);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <BackgroundCurve />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 32, paddingVertical: 40 }}>
            {/* Logo */}
            <View style={{ alignItems: 'center', marginBottom: 60 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  fontFamily: 'Commissioner-Bold',
                  color: '#252234',
                  marginBottom: 32,
                }}>
                tempo
              </Text>

              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  fontFamily: 'Commissioner-Bold',
                  color: '#333333',
                  marginBottom: 8,
                  textAlign: 'center',
                }}>
                Sign in to your account
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Commissioner-Regular',
                  color: '#666666',
                  textAlign: 'center',
                }}>
                Achieve financial wellness with AI
              </Text>
            </View>

            {/* Form */}
            <View style={{ marginBottom: 32 }}>
              {/* Email Input */}
              <View style={{ marginBottom: 20 }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: emailError ? '#EF4444' : '#E5E5EA',
                    borderRadius: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 18,
                    fontSize: 16,
                    fontFamily: 'Commissioner-Regular',
                    backgroundColor: '#FFFFFF',
                    color: '#252234',
                  }}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (emailError) {
                      validateEmail(text);
                    }
                  }}
                  placeholder="Email"
                  placeholderTextColor="#999999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                />
                {emailError ? (
                  <Text
                    style={{
                      color: '#EF4444',
                      fontSize: 14,
                      fontFamily: 'Commissioner-Regular',
                      marginTop: 8,
                      marginLeft: 4,
                    }}>
                    {emailError}
                  </Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: 32 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: passwordError ? '#EF4444' : '#E5E5EA',
                    borderRadius: 16,
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
                      color: '#252234',
                    }}
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      if (passwordError) {
                        validatePassword(text);
                      }
                    }}
                    placeholder="Password"
                    placeholderTextColor="#999999"
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
                      color: '#EF4444',
                      fontSize: 14,
                      fontFamily: 'Commissioner-Regular',
                      marginTop: 8,
                      marginLeft: 4,
                    }}>
                    {passwordError}
                  </Text>
                ) : null}
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#252234',
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  marginBottom: 24,
                  opacity: loading ? 0.7 : 1,
                }}
                onPress={handleLogin}
                disabled={loading}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 18,
                    fontWeight: '600',
                    fontFamily: 'Commissioner-SemiBold',
                  }}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#666666',
                    marginRight: 8,
                  }}>
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={navigateToRegister}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#252234',
                      fontWeight: '600',
                      fontFamily: 'Commissioner-SemiBold',
                    }}>
                    Sign up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
