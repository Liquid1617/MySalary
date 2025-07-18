import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { tokens } from '../../styles/tokens';
import { Snackbar } from '../../components/settings/Snackbar';
import { apiService } from '../../services/api';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser.user);
        setFormData({
          name: currentUser.user.name || '',
          username: currentUser.user.login || '',
          email: currentUser.user.email || '',
        });
      } else {
        const storedUser = await apiService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setFormData({
            name: storedUser.name || '',
            username: storedUser.login || '',
            email: storedUser.email || '',
          });
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

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = async (field: string) => {
    const value = formData[field as keyof typeof formData];
    const originalValue = user?.[field === 'username' ? 'login' : field] || '';
    
    // Skip save if value hasn't changed
    if (value === originalValue) {
      return;
    }

    // Skip save if field is empty
    if (!value.trim()) {
      // Reset to original value
      setFormData(prev => ({ ...prev, [field]: originalValue }));
      return;
    }

    try {
      setSaving(true);
      
      const updateData: any = {};
      if (field === 'username') {
        updateData.login = value.trim();
      } else {
        updateData[field] = value.trim();
      }

      const response = await apiService.updateUserProfile(updateData);
      
      if (response.success) {
        setUser(response.user);
        await apiService.updateStoredUser(response.user);
        showSnackbar('Profile updated');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      // Reset field to original value on error
      setFormData(prev => ({ ...prev, [field]: originalValue }));
      
      const errorMessage = error.response?.data?.message || error.message || 'Update failed';
      showSnackbar(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Change Avatar',
      'Avatar change functionality will be implemented soon',
      [{ text: 'OK' }]
    );
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome5 name="chevron-left" size={20} color={tokens.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handleAvatarPress}>
              {renderUserAvatar()}
              <View style={styles.avatarOverlay}>
                <FontAwesome5 name="camera" size={16} color={tokens.colors.surface} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Full Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={formData.name}
                onChangeText={(value) => handleFieldChange('name', value)}
                onBlur={() => handleFieldBlur('name')}
                placeholder="Enter your full name"
                placeholderTextColor={tokens.colors.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!saving}
              />
            </View>

            {/* Username */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                style={styles.fieldInput}
                value={formData.username}
                onChangeText={(value) => handleFieldChange('username', value)}
                onBlur={() => handleFieldBlur('username')}
                placeholder="Enter your username"
                placeholderTextColor={tokens.colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!saving}
              />
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputDisabled]}
                value={formData.email}
                placeholder="Enter your email"
                placeholderTextColor={tokens.colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                editable={false}
              />
              <Text style={styles.fieldHelper}>
                Email changes require separate verification
              </Text>
            </View>
          </View>
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
    paddingHorizontal: tokens.spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.xxl,
  },
  avatar: {
    width: tokens.heights.avatar,
    height: tokens.heights.avatar,
    borderRadius: tokens.heights.avatar / 2,
  },
  avatarPlaceholder: {
    width: tokens.heights.avatar,
    height: tokens.heights.avatar,
    borderRadius: tokens.heights.avatar / 2,
    backgroundColor: tokens.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: tokens.colors.surface,
    fontSize: 32,
    fontWeight: '600',
  },
  avatarOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tokens.colors.surface,
  },
  formSection: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  fieldContainer: {
    marginBottom: tokens.spacing.xl,
  },
  fieldLabel: {
    ...tokens.typography.fieldLabel,
    marginBottom: tokens.spacing.sm,
  },
  fieldInput: {
    ...tokens.typography.fieldInput,
    borderWidth: 1,
    borderColor: tokens.colors.divider,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    backgroundColor: tokens.colors.surface,
    height: tokens.heights.textField,
  },
  fieldInputDisabled: {
    backgroundColor: '#F8F8F8',
    color: tokens.colors.textSecondary,
  },
  fieldHelper: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    marginTop: tokens.spacing.xs,
  },
});