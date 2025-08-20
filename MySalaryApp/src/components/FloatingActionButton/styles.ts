import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    // Градиентный фон (будет реализован через LinearGradient в компоненте)
    backgroundColor: 'transparent',
    // Тень
    shadowColor: '#000000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.06, // 0F в hex = 15/255 ≈ 0.06
    shadowRadius: 6,
    elevation: 6,
  },
  containerRelative: {
    position: 'relative',
    width: 54,
    height: 54,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    // Тень
    shadowColor: '#000000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 6,
  },
  gradient: {
    width: 54,
    height: 54,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});