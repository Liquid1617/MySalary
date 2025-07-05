import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { homeScreenStyles } from '../styles/screens/HomeScreen.styles';
import { typographyStyles } from '../styles';
import { Colors } from '../styles/colors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Получаем данные пользователя из глобальной области или AsyncStorage
      let userData = (global as any).currentUser;
      console.log('HomeScreen - Global user data:', userData);

      if (!userData) {
        const storedUserData = await AsyncStorage.getItem('userData');
        console.log('HomeScreen - Stored user data:', storedUserData);
        if (storedUserData) {
          userData = JSON.parse(storedUserData);
          (global as any).currentUser = userData;
        }
      }

      setUser(userData);
      console.log('HomeScreen - Final user data:', userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  return (
    <SafeAreaView style={homeScreenStyles.container}>
      {/* Заголовок с информацией о пользователе */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={[typographyStyles.h2, styles.welcomeText]}>
            Добро пожаловать!
          </Text>
          {user && (
            <Text style={[typographyStyles.body1, styles.userText]}>
              {user.login || user.email}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileButtonText}>
            {user?.login ? user.login.charAt(0).toUpperCase() : '?'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={homeScreenStyles.content}>
        <Text style={styles.subtitle}>
          Управляйте своими финансами легко и удобно
        </Text>

        {/* Быстрые действия */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddTransaction')}>
            <Text style={styles.actionButtonIcon}>💰</Text>
            <Text style={styles.actionButtonText}>Добавить транзакцию</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.actionButtonIcon}>👤</Text>
            <Text style={styles.actionButtonText}>Личный кабинет</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Плавающая кнопка добавления */}
      <TouchableOpacity
        style={homeScreenStyles.addButton}
        onPress={() => navigation.navigate('AddTransaction')}>
        <Text style={homeScreenStyles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    color: '#000',
    marginBottom: 4,
  },
  userText: {
    color: '#666',
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});
