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
import { biometricService } from '../services/biometric';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const insets = useSafeAreaInsets();

  // Get screen height and calculate proportional distances
  const screenHeight = Dimensions.get('window').height;
  // Subtract safe area insets from positions since we're inside SafeAreaView
  const tempoTopDistance = (252 / 932) * screenHeight - insets.top; // 252px on 932px screen
  const contentTopDistance = (338 / 932) * screenHeight - insets.top; // 338px on 932px screen

  // Reset errors when leaving the screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setUsernameError('');
        setPasswordError('');
        setLoginError('');
      };
    }, [])
  );

  const validateUsername = (usernameValue: string): boolean => {
    if (!usernameValue) {
      setUsernameError('Required field');
      return false;
    }
    if (usernameValue.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }
    if (usernameValue.length > 100) {
      setUsernameError('Username must be no more than 100 characters');
      return false;
    }

    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9._]+$/;

    if (!emailRegex.test(usernameValue) && !usernameRegex.test(usernameValue)) {
      setUsernameError('Enter a valid username or email address');
      return false;
    }

    setUsernameError('');
    return true;
  };

  const validatePassword = (passwordValue: string): boolean => {
    if (!passwordValue) {
      setPasswordError('Required field');
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
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);

    if (!isUsernameValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    setLoginError('');

    try {
      await apiService.login({
        username,
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
      // Show validation error for any login failure
      setLoginError('Incorrect password or email');
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <WelcomeBackground />
      <View style={{ flex: 1, position: 'relative' }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#252233',
            position: 'absolute',
            top: tempoTopDistance,
            left: 0,
            right: 0,
            textAlign: 'center',
          }}>
          tempo
        </Text>

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
                paddingTop: contentTopDistance,
              }}>
              {/* Logo */}
              <View style={{ alignItems: 'center', marginBottom: 60 }}>
                <Text
                  style={{
                    fontSize: 24,
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
                {/* Username Input */}
                <View style={{ marginBottom: 20 }}>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: usernameError || loginError ? '#FCA1A2' : '#E5E5EA',
                      borderRadius: 8,
                      paddingHorizontal: 20,
                      paddingVertical: 18,
                      fontSize: 16,
                      fontFamily: 'Commissioner-Regular',
                      backgroundColor: '#FFFFFF',
                      color: loginError ? '#FCA1A2' : '#252234',
                    }}
                    value={username}
                    onChangeText={text => {
                      setUsername(text);
                      if (usernameError) {
                        validateUsername(text);
                      }
                      if (loginError) {
                        setLoginError('');
                      }
                    }}
                    placeholder="Username or Email"
                    placeholderTextColor="#999999"
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="username"
                  />
                  {usernameError ? (
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
                      {usernameError}
                    </Text>
                  ) : null}
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: 32 }}>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: passwordError || loginError ? '#FCA1A2' : '#E5E5EA',
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
                        color: loginError ? '#FCA1A2' : '#252234',
                      }}
                      value={password}
                      onChangeText={text => {
                        setPassword(text);
                        if (passwordError) {
                          validatePassword(text);
                        }
                        if (loginError) {
                          setLoginError('');
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

                {/* Forgot Password Link */}
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    marginTop: 20,
                  }}
                  onPress={() => {
                    // Заглушка
                    Alert.alert(
                      'Forgot Password',
                      'This feature is coming soon!',
                    );
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Commissioner-Regular',
                      fontWeight: '400',
                      fontSize: 14,
                      lineHeight: 14,
                      letterSpacing: 0,
                      textAlign: 'center',
                      color: '#7A7E85',
                    }}>
                    Forgot your password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Spacer to push footer to bottom */}
              <View style={{ flex: 1 }} />

              {/* Footer */}
              <View style={{ alignItems: 'center', paddingBottom: 32 }}>
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
      </View>
    </View>
  );
};
