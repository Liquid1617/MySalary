import { StyleSheet } from 'react-native';
import { colors } from '../colors';

export const layoutStyles = StyleSheet.create({
  // Основные контейнеры
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Отступы
  paddingHorizontal: {
    paddingHorizontal: 24,
  },
  paddingVertical: {
    paddingVertical: 24,
  },
  padding: {
    padding: 24,
  },
  paddingSmall: {
    padding: 16,
  },
  paddingLarge: {
    padding: 32,
  },

  // Маргины
  marginBottom: {
    marginBottom: 16,
  },
  marginBottomSmall: {
    marginBottom: 8,
  },
  marginBottomLarge: {
    marginBottom: 24,
  },
  marginTop: {
    marginTop: 16,
  },
  marginTopSmall: {
    marginTop: 8,
  },
  marginTopLarge: {
    marginTop: 24,
  },

  // Flexbox
  row: {
    flexDirection: 'row',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Размеры
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
  flex1: {
    flex: 1,
  },

  // Тени
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadowSmall: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  shadowLarge: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },

  // Границы
  borderRadius: {
    borderRadius: 12,
  },
  borderRadiusSmall: {
    borderRadius: 8,
  },
  borderRadiusLarge: {
    borderRadius: 16,
  },

  // Разделители
  divider: {
    height: 1,
    backgroundColor: colors.gray,
    marginVertical: 16,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.gray,
    marginHorizontal: 16,
  },
});
