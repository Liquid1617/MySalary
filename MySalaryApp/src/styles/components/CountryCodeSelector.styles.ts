import { StyleSheet } from 'react-native';
import { colors } from '../colors';

export const countryCodeSelectorStyles = StyleSheet.create({
  loadingContainer: {
    width: 80,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  selector: {
    width: 80,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  selectorLoading: {
    opacity: 0.6,
  },

  selectedFlag: {
    width: 20,
    height: 15,
    marginRight: 4,
  },

  selectedCode: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },

  placeholder: {
    fontSize: 14,
    color: colors.placeholder,
    flex: 1,
  },

  arrow: {
    fontSize: 10,
    color: colors.placeholder,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  closeButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },

  countryList: {
    flex: 1,
    paddingHorizontal: 20,
  },

  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },

  flagImage: {
    width: 24,
    height: 18,
    marginRight: 12,
  },

  countryName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },

  dialCode: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'right',
  },
});
