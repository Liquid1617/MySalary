import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, TouchableOpacity, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { FinancesScreen } from '../screens/FinancesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AuthLoadingScreen } from '../screens/AuthLoadingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BalanceChangeScreen } from '../screens/BalanceChangeScreen';
import { Colors } from '../styles/colors';

export type RootStackParamList = {
  AuthLoading: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  MainTabs: undefined;
  Profile: undefined;
  BalanceChange: undefined;
};

export type TabParamList = {
  Finances: undefined;
  Chat: undefined;
  Statistics: undefined;
};

// Кастомные минималистичные иконки
const FinanceIcon = ({
  color,
  size = 24,
}: {
  color: string;
  size?: number;
}) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <View
      style={{
        width: size - 2,
        height: size - 2,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={{ fontSize: size - 10, color, fontWeight: '600' }}>$</Text>
    </View>
  </View>
);

const AnalyticsIcon = ({
  color,
  size = 24,
}: {
  color: string;
  size?: number;
}) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      <View
        style={{
          width: 3,
          height: 12,
          backgroundColor: color,
          borderRadius: 1.5,
        }}
      />
      <View
        style={{
          width: 3,
          height: 18,
          backgroundColor: color,
          borderRadius: 1.5,
        }}
      />
      <View
        style={{
          width: 3,
          height: 10,
          backgroundColor: color,
          borderRadius: 1.5,
        }}
      />
      <View
        style={{
          width: 3,
          height: 16,
          backgroundColor: color,
          borderRadius: 1.5,
        }}
      />
    </View>
  </View>
);

const ChatIcon = ({
  focused,
  size = 24,
}: {
  focused: boolean;
  size?: number;
}) => (
  <LinearGradient
    colors={['#FFAF7B', '#D76D77']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      width: size + 20,
      height: size + 20,
      borderRadius: (size + 20) / 2,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: focused ? 0.4 : 0.3,
      shadowRadius: focused ? 5.65 : 4.65,
      elevation: focused ? 10 : 8,
    }}>
    <View
      style={{
        width: size - 6,
        height: size - 8,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: 'white',
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: 8,
          height: 1.5,
          backgroundColor: 'white',
          borderRadius: 0.75,
        }}
      />
    </View>
  </LinearGradient>
);

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
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={{
              marginRight: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: Colors.white,
                fontSize: 16,
                fontWeight: '600',
              }}>
              U
            </Text>
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 8,
          paddingTop: 3,
          height: 80,
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: -8,
        },
      }}>
      <Tab.Screen
        name="Finances"
        component={FinancesScreen}
        options={{
          title: '',
          headerTransparent: true,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={{
                marginRight: 16,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                U
              </Text>
            </TouchableOpacity>
          ),
          tabBarLabel: 'Finances',
          tabBarIcon: ({ color }) => <FinanceIcon color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'AI Assistant',
          tabBarLabel: '', // Убираем подпись для центральной кнопки
          tabBarIcon: ({ focused }) => <ChatIcon focused={focused} size={24} />,
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: '',
          headerTransparent: true,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={{
                marginRight: 16,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                U
              </Text>
            </TouchableOpacity>
          ),
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color }) => <AnalyticsIcon color={color} size={24} />,
        }}
      />
    </Tab.Navigator>
  );
};

const MainTabsWrapper: React.FC<{ navigation: any }> = ({ navigation }) => {
  return <MainTabNavigator navigation={navigation} />;
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
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
            title: 'Login',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Register',
            headerShown: true,
            headerBackTitle: 'Back',
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
          component={MainTabsWrapper}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profile',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BalanceChange"
          component={BalanceChangeScreen}
          options={{
            title: 'Balance Change',
            headerShown: true,
            headerBackTitle: 'Back',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
