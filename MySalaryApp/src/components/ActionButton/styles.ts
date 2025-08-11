import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Base button styles
  baseButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Add button (for sections like accounts, transactions)
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 22,
    backgroundColor: '#EEF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#7A7E85',
  },

  // Manage button
  manageButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 22,
    backgroundColor: '#EEF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#7A7E85',
  },

  // View All button
  viewButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 22,
    backgroundColor: '#EEF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#7A7E85',
  },

  // Primary button (main actions)
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#252233',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Secondary button
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#252233',
  },

  // Disabled states
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    opacity: 0.6,
  },
});
