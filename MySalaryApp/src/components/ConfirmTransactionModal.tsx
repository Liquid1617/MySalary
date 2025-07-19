import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { colors } from '../styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

interface ConfirmTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  transactionDate: string;
  transactionDescription: string;
  onConfirmToday: () => void;
  onConfirmScheduled: () => void;
}

export const ConfirmTransactionModal: React.FC<ConfirmTransactionModalProps> = ({
  visible,
  onClose,
  transactionDate,
  transactionDescription,
  onConfirmToday,
  onConfirmScheduled,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = () => {
    const transactionDateObj = new Date(transactionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    transactionDateObj.setHours(0, 0, 0, 0);
    return transactionDateObj.getTime() < today.getTime();
  };

  const isDueToday = () => {
    const transactionDateObj = new Date(transactionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    transactionDateObj.setHours(0, 0, 0, 0);
    return transactionDateObj.getTime() === today.getTime();
  };

  const getDialogTitle = () => {
    if (isOverdue()) return 'Confirm Overdue Transaction';
    if (isDueToday()) return 'Confirm Transaction';
    return 'Confirm Future Transaction';
  };

  const getDialogMessage = () => {
    if (isOverdue() || isDueToday()) {
      return 'Would you like to confirm this transaction?';
    }
    return 'Would you like to confirm this transaction today or keep it scheduled?';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <FontAwesome5 name="calendar-check" size={24} color={colors.primary} />
            <Text style={styles.title}>{getDialogTitle()}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>{transactionDescription}</Text>
            <Text style={styles.dateText}>
              Scheduled for: {formatDate(transactionDate)}
            </Text>
            <Text style={styles.message}>{getDialogMessage()}</Text>
          </View>

          <View style={styles.buttons}>
            {(!isOverdue() && !isDueToday()) && (
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={onConfirmToday}>
                <FontAwesome5 name="check" size={16} color="white" />
                <Text style={styles.primaryButtonText}>Confirm Today</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={onConfirmScheduled}>
              <FontAwesome5 name="calendar" size={16} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>
                {isOverdue() || isDueToday() ? 'Confirm' : `Confirm on ${formatDate(transactionDate).split(',')[0]}`}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  content: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  buttons: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 16,
  },
});