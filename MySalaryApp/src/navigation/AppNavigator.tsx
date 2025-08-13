import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View } from 'react-native';
import Svg, {
  G,
  ClipPath,
  Rect,
  Path,
  Defs,
  Filter,
  FeFlood,
  FeColorMatrix,
  FeOffset,
  FeGaussianBlur,
  FeComposite,
  FeBlend,
  RadialGradient,
  Stop,
} from 'react-native-svg';
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
import { HomeIcon } from '../components/icons/HomeIcon';
import { AnalyticsIcon } from '../components/icons/AnalyticsIcon';
import { DiscoverIcon } from '../components/icons/DiscoverIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { ChatIcon } from '../components/icons/ChatIcon';

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
  CurrencyPicker: undefined;
};

export type TabParamList = {
  Home: undefined;
  Analytics: { segment?: 'analytics' | 'budgets' } | undefined;
  ChatButton: undefined;
  Discover: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabNavigator: React.FC<{ navigation: any }> = () => {
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
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            shadowColor: '#000000',
            shadowOffset: {
              width: 1,
              height: 1,
            },
            shadowOpacity: 0.03,
            shadowRadius: 8,
            elevation: 8,
            borderTopWidth: 0,
            paddingBottom: 20,
            paddingTop: 8,
            paddingHorizontal: 30,
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
            tabBarIcon: ({ color }) => <HomeIcon color={color} />,
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
            tabBarIcon: ({ color }) => <AnalyticsIcon color={color} />,
          }}
        />
        <Tab.Screen
          name="ChatButton"
          component={View} // Dummy component, won't be rendered
          options={{
            title: 'AI Assistant',
            tabBarLabel: '', // Убираем подпись для центральной кнопки
            tabBarIcon: () => <ChatIcon />,
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
            title: '',
            tabBarIcon: ({ color }) => <DiscoverIcon color={color} />,
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
            tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
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
