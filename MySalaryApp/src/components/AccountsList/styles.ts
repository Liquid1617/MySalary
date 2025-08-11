import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F7F7F8',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F7F7F8',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7A7E85',
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#D3D6D7',
    marginTop: 4,
  },
  accountsContainer: {
    paddingRight: 24,
    paddingBottom: 8,
  },
  scrollContainer: {
    marginLeft: -24,
    paddingLeft: 24,
  },
  scrollContent: {
    paddingRight: 24,
  },
  accountItemWrapper: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F7F7F8',
    minWidth: 200,
  },
});