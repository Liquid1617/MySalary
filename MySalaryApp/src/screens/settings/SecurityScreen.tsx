import React, { useState } from 'react';
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
import { ChangePasswordModal } from '../../components/settings/ChangePasswordModal';

interface SecurityScreenProps {
  navigation: any;
}

export const SecurityScreen: React.FC<SecurityScreenProps> = ({ navigation }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showSnackbar = (message: string) => {
    setSnackbar({ visible: true, message });
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordModal(false);
    showSnackbar('Password updated');
  };

  const handlePasswordChangeError = (error: string) => {
    showSnackbar(error);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="chevron-left" size={20} color={tokens.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Security</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Password Section */}
        <ListSection title="Password">
          <ListItem
            label="Change password"
            onPress={() => setShowPasswordModal(true)}
            showChevron
          />
        </ListSection>

        {/* Future security options can be added here */}
        {/* 
        <ListSection title="Two-Factor Authentication">
          <ListItem
            label="Enable 2FA"
            showSwitch
            switchValue={false}
            onSwitchChange={() => {}}
          />
        </ListSection>
        */}
      </View>

      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordChangeSuccess}
        onError={handlePasswordChangeError}
      />

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