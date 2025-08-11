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
        color: '#32C4DE',
        name: 'Debit Card',
        backgroundColor: '#E5F7FA',
      };
    case 'credit_card':
      return {
        icon: 'credit-card',
        color: '#9D97E9',
        name: 'Credit Card',
        backgroundColor: '#F0EFFC',
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
        color: '#F0BF54',
        name: 'Cash',
        backgroundColor: '#FDF7E8',
      };
    case 'digital_wallet':
      return {
        icon: 'mobile-alt',
        color: '#93C90A',
        name: 'Digital Wallet',
        backgroundColor: '#F7FCE5',
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
