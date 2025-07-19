import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { tokens } from '../../styles/tokens';
import { ListSection } from '../../components/settings/ListSection';
import { ListItem } from '../../components/settings/ListItem';
import { Snackbar } from '../../components/settings/Snackbar';
import { apiService } from '../../services/api';

interface PreferencesScreenProps {
  navigation: any;
  route: any;
}

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ navigation, route }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
    loadUserData();
  }, []);

  // Handle currency selection from CurrencyPicker
  useEffect(() => {
    if (route.params?.selectedCurrency) {
      handleCurrencyChange(route.params.selectedCurrency);
      // Clear the param to prevent re-triggering
      navigation.setParams({ selectedCurrency: undefined });
    }
  }, [route.params?.selectedCurrency]);

  const loadUserData = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser.user);
      } else {
        const storedUser = await apiService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbar({ visible: true, message });
  };

  const handleCurrencyPress = () => {
    navigation.navigate('CurrencyPicker');
  };

  const handleCurrencyChange = async (currency: any) => {
    try {
      const response = await apiService.updateUserProfile({
        primary_currency_id: currency.id,
      });
      
      if (response.user) {
        setUser(response.user);
        await apiService.updateStoredUser(response.user);
        showSnackbar(`Currency changed to ${currency.code}`);
      } else {
        throw new Error(response.message || 'Failed to update currency');
      }
    } catch (error: any) {
      console.error('Currency update error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      showSnackbar(errorMessage);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="chevron-left" size={20} color={tokens.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Currency Section */}
        <ListSection title="Currency">
          <ListItem
            label="Primary currency"
            value={user?.primaryCurrency ? 
              `${user.primaryCurrency.code} - ${user.primaryCurrency.name}` : 
              'USD - US Dollar'
            }
            onPress={handleCurrencyPress}
            showChevron
          />
        </ListSection>

        {/* Additional preferences can be added here */}
      </View>

      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...tokens.typography.listItemLabel,
    color: tokens.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.divider,
  },
  title: {
    ...tokens.typography.h1,
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.lg,
  },
});