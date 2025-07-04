import { StyleSheet } from 'react-native';
import { colors } from '../colors';

export const typographyStyles = StyleSheet.create({
  // Заголовки
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.black,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.black,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    lineHeight: 22,
  },

  // Основной текст
  body1: {
    fontSize: 16,
    color: colors.black,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
  body3: {
    fontSize: 12,
    color: colors.black,
    lineHeight: 16,
  },

  // Подписи и дополнительный текст
  caption: {
    fontSize: 12,
    color: colors.darkGray,
    lineHeight: 16,
  },
  overline: {
    fontSize: 10,
    color: colors.darkGray,
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Цвета текста
  textPrimary: {
    color: colors.primary,
  },
  textSecondary: {
    color: colors.darkGray,
  },
  textSuccess: {
    color: colors.success,
  },
  textWarning: {
    color: colors.warning,
  },
  textError: {
    color: colors.red,
  },
  textWhite: {
    color: colors.white,
  },
  textBlack: {
    color: colors.black,
  },
  textGray: {
    color: colors.gray,
  },

  // Выравнивание
  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  textJustify: {
    textAlign: 'justify',
  },

  // Стили шрифта
  fontThin: {
    fontWeight: '100',
  },
  fontLight: {
    fontWeight: '300',
  },
  fontRegular: {
    fontWeight: '400',
  },
  fontMedium: {
    fontWeight: '500',
  },
  fontSemiBold: {
    fontWeight: '600',
  },
  fontBold: {
    fontWeight: '700',
  },
  fontExtraBold: {
    fontWeight: '800',
  },
  fontBlack: {
    fontWeight: '900',
  },

  // Дополнительные стили
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  lowercase: {
    textTransform: 'lowercase',
  },
  capitalize: {
    textTransform: 'capitalize',
  },

  // Ссылки
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  linkPressed: {
    color: colors.primaryDark,
    opacity: 0.8,
  },
});
