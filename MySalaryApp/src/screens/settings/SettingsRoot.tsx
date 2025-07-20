import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { tokens } from '../../styles/tokens';
import { ListSection } from '../../components/settings/ListSection';
import { ListItem } from '../../components/settings/ListItem';
import { Snackbar } from '../../components/settings/Snackbar';
import { apiService } from '../../services/api';
import { biometricService } from '../../services/biometric';

interface SettingsRootProps {
  navigation: any;
}

export const SettingsRoot: React.FC<SettingsRootProps> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [preferences, setPreferences] = useState({
    theme: 'System',
    notifications: true,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  // Reload user data when screen comes into focus to ensure fresh currency data
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      // Always try to get fresh data from server first
      const currentUser = await apiService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser.user);
        // Update stored user data to ensure consistency
        await apiService.updateStoredUser(currentUser.user);
      } else {
        const storedUser = await apiService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to stored data if server request fails
      try {
        const storedUser = await apiService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (storageError) {
        console.error('Error loading stored user data:', storageError);
      }
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbar({ visible: true, message });
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.logout();
            await biometricService.clearBiometricSettings();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const handleThemeToggle = (value: boolean) => {
    const newTheme = value ? 'Dark' : 'Light';
    setPreferences(prev => ({ ...prev, theme: newTheme }));
    showSnackbar(`Theme changed to ${newTheme}`);
  };

  const handleNotificationsToggle = (value: boolean) => {
    setPreferences(prev => ({ ...prev, notifications: value }));
    showSnackbar(`Notifications ${value ? 'enabled' : 'disabled'}`);
  };

  const renderUserAvatar = () => {
    if (user?.avatar) {
      return (
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
      );
    }
    
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>
          {user?.login ? user.login.charAt(0).toUpperCase() : 'U'}
        </Text>
      </View>
    );
  };

  const getAppVersion = () => {
    // In a real app, you would get this from package.json or native modules
    return '1.0.0 (100)';
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.content}>
          {/* Profile Section */}
          <ListSection title="Profile">
            <ListItem
              label={user?.name || user?.login || 'User'}
              value={user?.email || 'No email'}
              avatar={renderUserAvatar()}
              onPress={() => navigation.navigate('Settings/Profile')}
              showChevron
            />
          </ListSection>

          {/* Preferences Section */}
          <ListSection title="Preferences">
            <ListItem
              label="Currency"
              value={user?.primaryCurrency?.code || 'USD'}
              onPress={() => navigation.navigate('Settings/Preferences')}
              showChevron
            />
            <ListItem
              label="Theme"
              value={preferences.theme}
              showSwitch
              switchValue={preferences.theme === 'Dark'}
              onSwitchChange={handleThemeToggle}
            />
          </ListSection>

          {/* Security Section */}
          <ListSection title="Security">
            <ListItem
              label="Change password"
              onPress={() => navigation.navigate('Settings/Security')}
              showChevron
            />
          </ListSection>

          {/* Notifications Section */}
          <ListSection title="Notifications">
            <ListItem
              label="Push notifications"
              showSwitch
              switchValue={preferences.notifications}
              onSwitchChange={handleNotificationsToggle}
            />
          </ListSection>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.appVersion}>
            Version {getAppVersion()}
          </Text>
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
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
    paddingHorizontal: tokens.spacing.lg,
    paddingTop: tokens.spacing.md,
    paddingBottom: tokens.spacing.lg,
  },
  title: {
    ...tokens.typography.h1,
  },
  content: {
    paddingHorizontal: tokens.spacing.lg,
  },
  avatar: {
    width: tokens.heights.avatarSmall,
    height: tokens.heights.avatarSmall,
    borderRadius: tokens.heights.avatarSmall / 2,
  },
  avatarPlaceholder: {
    width: tokens.heights.avatarSmall,
    height: tokens.heights.avatarSmall,
    borderRadius: tokens.heights.avatarSmall / 2,
    backgroundColor: tokens.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: tokens.colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    marginTop: tokens.spacing.xxl,
    marginBottom: tokens.spacing.lg,
    height: tokens.heights.button,
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: tokens.colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  appVersion: {
    ...tokens.typography.appVersion,
    textAlign: 'center',
    marginBottom: tokens.spacing.xxl,
  },
});