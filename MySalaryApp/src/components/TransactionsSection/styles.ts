import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  containerEmpty: {
    paddingBottom: 8,
  },
  header: {},
  title: {},
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: 'Commissioner',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 14,
    color: '#7A7E85',
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: 'Commissioner',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    color: '#D3D6D7',
    textAlign: 'center',
  },
  addButtonWrapper: {
    marginTop: 8,
    position: 'relative',
  },
  transactionsList: {
    marginTop: 16,
  },
  futureTransactionsList: {
    marginTop: 16,
    position: 'relative',
  },
  verticalTimeline: {
    position: 'absolute',
    left: 28, // 16 (padding) + 12 (dot center)
    top: 16,
    bottom: 16,
    width: 1,
    backgroundColor: '#E5E7EB',
    zIndex: 1,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
