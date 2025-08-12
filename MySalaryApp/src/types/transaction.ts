export interface Currency {
  id: number;
  symbol: string;
  code: string;
}

export interface Account {
  id: number;
  account_name: string;
  account_type: string;
  balance: string;
  currency: Currency;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  is_system: boolean;
  user_id?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  amount: string;
  description: string;
  transaction_date: string;
  transaction_type: 'income' | 'expense' | 'transfer';
  status?: 'scheduled' | 'posted';
  confirmed_at?: string | null;
  account: {
    id: number;
    account_name: string;
    account_type: string;
    currency?: Currency;
  };
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
    is_system: boolean;
  };
  targetAccount?: {
    id: number;
    account_name: string;
    account_type: string;
    currency?: Currency;
  };
  transfer_to_account?: {
    id: number;
    account_name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionRequest {
  amount: string;
  description: string;
  transaction_date: string;
  transaction_type: 'income' | 'expense' | 'transfer';
  account_id: number;
  category_id?: number;
  transfer_to_account_id?: number;
}

export interface UpdateTransactionRequest {
  amount?: string;
  description?: string;
  transaction_date?: string;
  transaction_type?: 'income' | 'expense' | 'transfer';
  account_id?: number;
  category_id?: number;
  transfer_to_account_id?: number;
}