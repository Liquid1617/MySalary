import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {},
  title: {},
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
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
