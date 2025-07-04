import { StyleSheet } from 'react-native';
import { colors } from '../colors';

export const customInputStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: colors.black,
  },
  loadingContainer: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    padding: 4,
  },
  eyeIconText: {
    fontSize: 18,
    color: colors.darkGray,
  },
  error: {
    borderColor: colors.red,
  },
  focused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: colors.red,
    marginTop: 4,
    marginLeft: 4,
  },
});
