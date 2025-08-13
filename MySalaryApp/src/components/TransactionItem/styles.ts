import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 61,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  content: {
    flex: 1,
    paddingLeft: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#252233',
    lineHeight: 14,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  transferContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  accountTag: {
    borderRadius: 22,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 8,
    paddingRight: 8,
    minHeight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTagText: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 10,
  },
  transferArrow: {
    marginHorizontal: 6,
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
    fontSize: 10,
    lineHeight: 10,
    color: '#7A7E85',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 0,
    marginRight: 0,
  },
});
