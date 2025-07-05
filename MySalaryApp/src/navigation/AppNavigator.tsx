import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Alert, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Импорт экранов
import { AuthLoadingScreen } from '../screens/AuthLoadingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { FinancesScreen } from '../screens/FinancesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

import { Colors } from '../styles/colors';

export type RootStackParamList = {
  AuthLoading: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  AddTransaction: undefined;
  Profile: undefined;
};

export type TabParamList = {
  Home: undefined;
  Finances: undefined;
  Chat: undefined;
  Statistics: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabNavigator: React.FC<{ navigation: any }> = ({ navigation }) => {
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
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Главная',
          tabBarLabel: 'Главная',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🏠</Text>
          ),
        }}
      />
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
          name="MainTabs"
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{
            title: 'Добавить транзакцию',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Личный кабинет',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#000',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
