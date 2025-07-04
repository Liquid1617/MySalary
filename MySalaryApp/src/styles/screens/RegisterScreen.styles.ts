import { StyleSheet } from 'react-native';
import { colors } from '../colors';

export const registerScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.gray,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  buttonSpacing: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  validationText: {
    fontSize: 12,
    color: colors.red,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  weak: {
    color: colors.red,
  },
  medium: {
    color: colors.warning,
  },
  strong: {
    color: colors.success,
  },
  strengthIndicator: {
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthWeak: {
    backgroundColor: '#FF3B30',
  },
  strengthMedium: {
    backgroundColor: '#FF9500',
  },
  strengthStrong: {
    backgroundColor: '#34C759',
  },
  phoneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  phoneInputContainer: {
    marginBottom: 0,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneHintContainer: {
    height: 20, // Фиксированная высота для контейнера подсказки
    marginTop: 4,
  },
  phoneHint: {
    fontSize: 12,
    color: colors.red,
    marginLeft: 4,
  },
});
