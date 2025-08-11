import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    height: 296,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 28,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#252233',
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 14,
    color: '#A0F5A0',
    fontWeight: '500',
    fontFamily: 'Commissioner-Medium',
    lineHeight: 14,
    textAlign: 'center',
  },
  dayText: {
    fontSize: 18,
    color: '#A0F5A0',
    fontWeight: '600',
    fontFamily: 'Commissioner-SemiBold',
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 2,
  },
  netWorthContainer: {
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 12,
  },
  netWorthHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 6,
  },
  netWorthLabel: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  netWorthAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeIcon: {
    marginRight: 6,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '400',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#000',
    fontSize: 14,
  },
});