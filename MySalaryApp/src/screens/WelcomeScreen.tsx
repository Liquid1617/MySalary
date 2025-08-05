import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';
import { WelcomeBackground } from '../components/WelcomeBackground';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <WelcomeBackground />
      <View style={styles.content}>
        <Text style={styles.logoText}>tempo</Text>
        <Text style={styles.titleText}>Let's start your journey</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const screenHeight = Dimensions.get('window').height;
const tempoTopDistance = (252 / 932) * screenHeight; // 252px on 932px screen
const titleTopDistance = (338 / 932) * screenHeight; // 338px on 932px screen
const buttonsTopDistance = (412 / 932) * screenHeight; // 412px on 932px screen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  header: {
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#252233',
    position: 'absolute',
    top: tempoTopDistance,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  titleText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#252233',
    position: 'absolute',
    top: titleTopDistance,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    top: buttonsTopDistance,
    left: 40,
    right: 40,
    flexDirection: 'column',
  },
  signUpButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  signUpButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  signInButtonText: {
    color: '#252233',
    fontSize: 16,
    fontWeight: '600',
  },
});
