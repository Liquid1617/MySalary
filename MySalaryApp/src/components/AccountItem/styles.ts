import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#252233',
    marginBottom: 2,
  },
  accountType: {
    fontFamily: 'Commissioner',
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 12,
    letterSpacing: 0,
  },
  balance: {
    fontSize: 14,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 0,
    marginRight: 0,
  },
});