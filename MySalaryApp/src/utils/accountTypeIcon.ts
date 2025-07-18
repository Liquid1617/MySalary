interface AccountTypeIconData {
  icon: string;
  color: string;
  name: string;
  backgroundColor: string;
}

export const getAccountTypeIcon = (
  accountType: string,
): AccountTypeIconData => {
  switch (accountType) {
    case 'debit_card':
      return {
        icon: 'credit-card',
        color: '#3B82F6',
        name: 'Debit Card',
        backgroundColor: '#EFF6FF',
      };
    case 'credit_card':
      return {
        icon: 'credit-card',
        color: '#8B5CF6',
        name: 'Credit Card',
        backgroundColor: '#F3E8FF',
      };
    case 'bank_account':
      return {
        icon: 'university',
        color: '#10B981',
        name: 'Bank Account',
        backgroundColor: '#ECFDF5',
      };
    case 'cash':
      return {
        icon: 'wallet',
        color: '#F59E0B',
        name: 'Cash',
        backgroundColor: '#FEF3E0',
      };
    case 'digital_wallet':
      return {
        icon: 'mobile-alt',
        color: '#EF4444',
        name: 'Digital Wallet',
        backgroundColor: '#FEF2F2',
      };
    default:
      return {
        icon: 'piggy-bank',
        color: '#6B7280',
        name: 'Account',
        backgroundColor: '#F9FAFB',
      };
  }
};
