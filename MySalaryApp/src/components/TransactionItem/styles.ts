import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  detailsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  transferContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  accountTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  accountTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  transferArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  singleAccountTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    maxWidth: 120,
    alignSelf: 'flex-start',
  },
  scheduledBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FBBF24',
    marginLeft: 6,
  },
  scheduledText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 0,
    marginRight: 0,
  },
});