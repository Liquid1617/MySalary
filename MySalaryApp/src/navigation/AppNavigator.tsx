import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, TouchableOpacity, Text, View, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { FinancesScreen } from '../screens/FinancesScreen';
import { ChatModal } from '../components/ChatModal';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AuthLoadingScreen } from '../screens/AuthLoadingScreen';
import { NewDiscoverScreen } from '../screens/NewDiscoverScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AccountDetailsScreen } from '../screens/AccountDetailsScreen';
import { AllTransactionsScreen } from '../screens/AllTransactionsScreen';
import { BudgetDetailScreen } from '../screens/BudgetDetailScreen';
import { BudgetEditScreen } from '../screens/BudgetEditScreen';
import { ProfileScreen as SettingsProfileScreen } from '../screens/settings/ProfileScreen';
import { PreferencesScreen } from '../screens/settings/PreferencesScreen';
import { SecurityScreen } from '../screens/settings/SecurityScreen';
import { NotificationsScreen } from '../screens/settings/NotificationsScreen';
import { CurrencyBottomSheet } from '../screens/settings/CurrencyBottomSheet';
import { Colors } from '../styles/colors';
// import { ChatModal } from '../components/ChatModal';

export type RootStackParamList = {
  AuthLoading: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  MainTabs: undefined;
  Profile: undefined;
  AccountDetails: { account: any };
  AllTransactions: undefined;
  BudgetDetail: { budgetId: string };
  BudgetEdit: { budget: any };
  'Settings/Profile': undefined;
  'Settings/Preferences': { selectedCurrency?: any } | undefined;
  'Settings/Security': undefined;
  'Settings/Notifications': undefined;
  'CurrencyPicker': undefined;
};

export type TabParamList = {
  Home: undefined;
  Analytics: { segment?: 'analytics' | 'budgets' } | undefined;
  ChatButton: undefined;
  Discover: undefined;
  Settings: undefined;
};

// FontAwesome иконки навигации
const HomeIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <FontAwesome5 name="home" size={size} color={color} solid />
);

const AnalyticsIcon = ({
  color,
  size = 24,
}: {
  color: string;
  size?: number;
}) => <FontAwesome5 name="chart-bar" size={size} color={color} solid />;

const DiscoverIcon = ({
  color,
  size = 24,
}: {
  color: string;
  size?: number;
}) => <FontAwesome5 name="compass" size={size} color={color} />;

const SettingsIcon = ({
  color,
  size = 24,
}: {
  color: string;
  size?: number;
}) => <FontAwesome5 name="cog" size={size} color={color} solid />;

const ChatIcon = ({
  focused,
  size = 24,
}: {
  focused: boolean;
  size?: number;
}) => (
  <LinearGradient
    colors={['#D1CCFF', '#8CE6F3', '#7AF0C4', '#C7FB33']}
    start={{ x: 0, y: 1 }}
    end={{ x: 1, y: 0 }}
    useAngle={true}
    angle={30}
    style={{
      width: size + 22,
      height: size + 22,
      borderRadius: (size + 22) / 2,
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
    <FontAwesome5 name="comment" size={size - 2} color="#000" />
  </LinearGradient>
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabNavigator: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isChatModalVisible, setIsChatModalVisible] = React.useState(false);
  return (
    <>
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
            paddingBottom: 20,
            paddingTop: 8,
            paddingHorizontal: 30, // Добавляем горизонтальные отступы для сжатия иконок к центру
            height: 78,
          },
          tabBarActiveTintColor: '#000000', // Черный как в референсе
          tabBarInactiveTintColor: '#C7C7CC', // Серый для неактивных
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: -2,
            marginBottom: 2,
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
          tabBarItemStyle: {
            marginHorizontal: -5, // Уменьшаем отрицательный margin между иконками
            paddingHorizontal: 8, // Уменьшаем внутренние отступы каждой иконки
          },
        }}>
        <Tab.Screen
          name="Home"
          component={FinancesScreen}
          options={{
            title: '',
            headerTransparent: true,
            headerStyle: {
              backgroundColor: 'transparent',
            },
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />,
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={StatisticsScreen}
          options={{
            title: '',
            headerTransparent: true,
            headerStyle: {
              backgroundColor: 'transparent',
            },
            tabBarLabel: 'Analytics',
            tabBarIcon: ({ color }) => (
              <AnalyticsIcon color={color} size={24} />
            ),
          }}
        />
        <Tab.Screen
          name="ChatButton"
          component={View} // Dummy component, won't be rendered
          options={{
            title: 'AI Assistant',
            tabBarLabel: '', // Убираем подпись для центральной кнопки
            tabBarIcon: ({ focused }) => (
              <ChatIcon focused={focused} size={24} />
            ),
            tabBarIconStyle: { marginTop: 6, marginBottom: -1 }, // Опускаем кнопку еще ниже для идеальной центровки
          }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              setIsChatModalVisible(true);
            },
          }}
        />
        <Tab.Screen
          name="Discover"
          component={NewDiscoverScreen}
          options={{
            headerShown: false,
            title: 'Discover',
            tabBarLabel: 'Discover',
            tabBarIcon: ({ color }) => <DiscoverIcon color={color} size={24} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={ProfileScreen}
          options={{
            title: '',
            headerTransparent: true,
            headerStyle: {
              backgroundColor: 'transparent',
            },
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color }) => <SettingsIcon color={color} size={24} />,
          }}
        />
      </Tab.Navigator>

      <ChatModal
        visible={isChatModalVisible}
        onClose={() => setIsChatModalVisible(false)}
      />
    </>
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
          name="Welcome"
          component={WelcomeScreen}
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
            headerShown: false,
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
          name="AccountDetails"
          component={AccountDetailsScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="AllTransactions"
          component={AllTransactionsScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="BudgetDetail"
          component={BudgetDetailScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="BudgetEdit"
          component={BudgetEditScreen}
          options={{
            headerShown: false,
          }}
        />
        
        {/* Settings Screens */}
        <Stack.Screen
          name="Settings/Profile"
          component={SettingsProfileScreen}
          options={{
            title: 'Profile',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Settings/Preferences"
          component={PreferencesScreen}
          options={{
            title: 'Preferences',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Settings/Security"
          component={SecurityScreen}
          options={{
            title: 'Security',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Settings/Notifications"
          component={NotificationsScreen}
          options={{
            title: 'Notifications',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CurrencyPicker"
          component={CurrencyBottomSheet}
          options={{
            title: 'Select Currency',
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
