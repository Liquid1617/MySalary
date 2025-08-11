import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    height: 296,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 28,
  },
  leftSection: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  changeIcon: {
    marginRight: 6,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '400',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#252233',
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.17,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 14,
    color: '#A0F5A0',
    fontWeight: '500',
    fontFamily: 'Commissioner-Medium',
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  currencyText: {
    fontSize: 18,
    color: '#A0F5A0',
    fontWeight: '600',
    fontFamily: 'Commissioner-SemiBold',
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 2,
  },
});