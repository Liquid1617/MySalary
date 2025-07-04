import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Alert, TouchableOpacity, Text } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { FinancesScreen } from '../screens/FinancesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AuthLoadingScreen } from '../screens/AuthLoadingScreen';
import { Colors } from '../styles/colors';
import { apiService } from '../services/api';
import { biometricService } from '../services/biometric';

export type RootStackParamList = {
  AuthLoading: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  MainTabs: undefined;
};

export type TabParamList = {
  Finances: undefined;
  Chat: undefined;
  Statistics: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabNavigator: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти из аккаунта?', [
      {
        text: 'Отмена',
        style: 'cancel',
      },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await apiService.logout();
            await biometricService.clearBiometricSettings();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Ошибка при выходе:', error);
            Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              marginRight: 16,
              backgroundColor: Colors.secondary,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
            disabled={loading}>
            <Text
              style={{
                color: Colors.primary,
                fontSize: 14,
                fontWeight: '600',
              }}>
              {loading ? 'Выход...' : 'Выйти'}
            </Text>
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="Finances"
        component={FinancesScreen}
        options={{
          title: 'Финансы',
          tabBarLabel: 'Финансы',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>💰</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'ИИ Помощник',
          tabBarLabel: 'ИИ Чат',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🤖</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: 'Статистика',
          tabBarLabel: 'Статистика',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>📊</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
        translucent={false}
      />
      <Stack.Navigator
        initialRouteName="AuthLoading"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen
          name="AuthLoading"
          component={AuthLoadingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Вход',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Регистрация',
            headerShown: true,
            headerBackTitle: 'Назад',
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'MySalary',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
