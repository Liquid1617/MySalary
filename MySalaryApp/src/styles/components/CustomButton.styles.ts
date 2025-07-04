import { StyleSheet } from 'react-native';
import { colors } from '../colors';

export const customButtonStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  disabled: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.darkGray,
  },
});
