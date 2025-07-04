import { StyleSheet } from 'react-native';
import { colors } from '../colors';

export const customSelectStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: colors.text.primary,
    marginBottom: 8,
    fontWeight: '500',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background.secondary,
    minHeight: 52,
  },
  selectButtonError: {
    borderColor: colors.error.primary,
  },
  selectButtonDisabled: {
    backgroundColor: colors.background.disabled,
    opacity: 0.6,
  },
  selectButtonText: {
    color: colors.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: colors.text.placeholder,
  },
  arrow: {
    color: colors.text.secondary,
    fontSize: 12,
    marginLeft: 8,
  },
  error: {
    color: colors.error.primary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    color: colors.text.primary,
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  closeButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  optionsList: {
    padding: 0,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.secondary,
    backgroundColor: colors.background.primary,
  },
  optionText: {
    color: colors.text.primary,
    fontSize: 16,
  },
});
