import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { tokens } from '../../styles/tokens';
import { ListSection } from '../../components/settings/ListSection';
import { ListItem } from '../../components/settings/ListItem';
import { Snackbar } from '../../components/settings/Snackbar';
import { apiService } from '../../services/api';

interface NotificationsScreenProps {
  navigation: any;
}

interface NotificationSettings {
  pushNotifications: boolean;
  transactionAlerts: boolean;
  budgetReminders: boolean;
  weeklyReports: boolean;
  marketUpdates: boolean;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    transactionAlerts: true,
    budgetReminders: true,
    weeklyReports: false,
    marketUpdates: false,
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      // In a real app, you would load these from an API
      // const response = await apiService.getNotificationSettings();
      // setSettings(response.settings);
      
      // For now, using default settings
      setLoading(false);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      setLoading(false);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbar({ visible: true, message });
  };

  const handleSettingChange = async (setting: keyof NotificationSettings, value: boolean) => {
    // Optimistic update
    setSettings(prev => ({ ...prev, [setting]: value }));
    
    try {
      // In a real app, you would make an API call here
      // await apiService.updateNotificationSettings({ [setting]: value });
      
      const settingLabel = setting.replace(/([A-Z])/g, ' $1').toLowerCase();
      showSnackbar(`${settingLabel} ${value ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating notification setting:', error);
      
      // Revert optimistic update on error
      setSettings(prev => ({ ...prev, [setting]: !value }));
      showSnackbar('Failed to update setting. Please try again.');
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
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* General Notifications */}
        <ListSection title="General">
          <ListItem
            label="Push notifications"
            showSwitch
            switchValue={settings.pushNotifications}
            onSwitchChange={(value) => handleSettingChange('pushNotifications', value)}
          />
        </ListSection>

        {/* Financial Notifications */}
        <ListSection title="Financial">
          <ListItem
            label="Transaction alerts"
            showSwitch
            switchValue={settings.transactionAlerts}
            onSwitchChange={(value) => handleSettingChange('transactionAlerts', value)}
            disabled={!settings.pushNotifications}
          />
          <ListItem
            label="Budget reminders"
            showSwitch
            switchValue={settings.budgetReminders}
            onSwitchChange={(value) => handleSettingChange('budgetReminders', value)}
            disabled={!settings.pushNotifications}
          />
          <ListItem
            label="Weekly reports"
            showSwitch
            switchValue={settings.weeklyReports}
            onSwitchChange={(value) => handleSettingChange('weeklyReports', value)}
            disabled={!settings.pushNotifications}
          />
        </ListSection>

        {/* Market Notifications */}
        <ListSection title="Market">
          <ListItem
            label="Market updates"
            showSwitch
            switchValue={settings.marketUpdates}
            onSwitchChange={(value) => handleSettingChange('marketUpdates', value)}
            disabled={!settings.pushNotifications}
          />
        </ListSection>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Notifications help you stay on top of your finances. You can always change these settings later.
          </Text>
        </View>
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
  infoSection: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginTop: tokens.spacing.lg,
  },
  infoText: {
    fontSize: 14,
    color: tokens.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});