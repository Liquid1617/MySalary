import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { tokens } from '../../styles/tokens';
import { apiService } from '../../services/api';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.updateUserProfile({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });

      if (response.success) {
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setErrors({});
        onSuccess();
      } else {
        throw new Error(response.message || 'Failed to update password');
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      
      if (error.response?.data?.message) {
        // Handle specific field errors
        if (error.response.data.message.includes('current password')) {
          setErrors({ currentPassword: 'Current password is incorrect' });
        } else {
          onError(error.response.data.message);
        }
      } else {
        onError(error.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const renderPasswordInput = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    passwordField: 'current' | 'new' | 'confirm'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, errors[field] && styles.inputError]}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.textSecondary}
          secureTextEntry={!showPasswords[passwordField]}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => togglePasswordVisibility(passwordField)}>
          <FontAwesome5
            name={showPasswords[passwordField] ? 'eye-slash' : 'eye'}
            size={16}
            color={tokens.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const isFormValid = () => {
    return formData.currentPassword && 
           formData.newPassword && 
           formData.confirmPassword &&
           formData.newPassword === formData.confirmPassword &&
           formData.newPassword.length >= 6;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <FontAwesome5 name="times" size={20} color={tokens.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Change Password</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            {/* Form */}
            <View style={styles.form}>
              {renderPasswordInput(
                'currentPassword',
                'Current Password',
                'Enter your current password',
                'current'
              )}
              
              {renderPasswordInput(
                'newPassword',
                'New Password',
                'Enter new password (min 6 characters)',
                'new'
              )}
              
              {renderPasswordInput(
                'confirmPassword',
                'Confirm New Password',
                'Confirm your new password',
                'confirm'
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid() || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid() || loading}>
              {loading ? (
                <ActivityIndicator size="small" color={tokens.colors.surface} />
              ) : (
                <Text style={styles.submitButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <FontAwesome5 name="shield-alt" size={16} color={tokens.colors.primary} />
              <Text style={styles.securityNoteText}>
                Your password is encrypted and secure. Choose a strong password with at least 6 characters.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  },
  form: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    marginTop: tokens.spacing.lg,
  },
  inputContainer: {
    marginBottom: tokens.spacing.xl,
  },
  label: {
    ...tokens.typography.fieldLabel,
    marginBottom: tokens.spacing.sm,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    ...tokens.typography.fieldInput,
    borderWidth: 1,
    borderColor: tokens.colors.divider,
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.md,
    paddingRight: 48,
    backgroundColor: tokens.colors.surface,
    height: tokens.heights.textField,
  },
  inputError: {
    borderColor: tokens.colors.error,
  },
  eyeIcon: {
    position: 'absolute',
    right: tokens.spacing.md,
    top: tokens.spacing.md,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: tokens.colors.error,
    marginTop: tokens.spacing.xs,
  },
  submitButton: {
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.sm,
    paddingVertical: tokens.spacing.md,
    alignItems: 'center',
    marginTop: tokens.spacing.xl,
    height: tokens.heights.button,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: tokens.colors.divider,
  },
  submitButtonText: {
    color: tokens.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.sm,
    marginTop: tokens.spacing.xl,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.textSecondary,
    marginLeft: tokens.spacing.md,
    lineHeight: 20,
  },
});