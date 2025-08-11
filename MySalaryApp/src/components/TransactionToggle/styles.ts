import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    height: 33,
    width: '100%',
  },
  toggleButton: {
    height: 33,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
  },
  leftButton: {},
  rightButton: {
    // No additional margin for right button
  },
  activeButton: {
    borderBottomWidth: 1,
    borderBottomColor: '#252233',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Commissioner',
    lineHeight: 14,
    color: '#D3D6D7',
  },
  activeText: {
    fontWeight: '500',
    color: '#252233',
  },
});
