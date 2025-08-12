import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 65,
    backgroundColor: 'transparent',
    paddingHorizontal: 5,
    position: 'relative',
  },
  dotContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  // Линия от центра вниз (для всех кроме последнего)
  lineDown: {
    position: 'absolute',
    left: 11.5,
    top: 28, // Ближе к центру точки
    height: 37, // До конца контейнера
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  // Линия от начала контейнера до центра (для всех кроме первого)
  lineUp: {
    position: 'absolute',
    left: 11.5,
    top: 0, // От начала контейнера
    height: 28, // До центра точки
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9D97E9',
    zIndex: 2,
  },
  content: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#252233',
    lineHeight: 20,
    marginBottom: 6,
  },
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  transferContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountTag: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF1F2',
  },
  accountTagText: {
    fontFamily: 'Commissioner',
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 10, // 100% line height
    letterSpacing: 0,
    color: '#7A7E85',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#252233',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    lineHeight: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 56, // Отступ от dotContainer (24) + marginRight (16) + padding (16)
    marginRight: 16,
  },
});