import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number | null;
  amount: string;
  transaction_type: 'income' | 'expense' | 'transfer';
  transfer_to: number | null;
  description: string | null;
  transaction_date: string;
  status: 'scheduled' | 'posted';
  confirmed_at: string | null;
  createdAt: string;
  updatedAt: string;
  account: {
    id: number;
    account_name: string;
    currency: {
      code: string;
      symbol: string;
    };
  };
  targetAccount?: {
    id: number;
    account_name: string;
    currency: {
      code: string;
      symbol: string;
    };
  };
  category?: {
    id: number;
    category_name: string;
    category_type: string;
    icon: string;
    color: string;
  };
}

interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  hasLoadedInitial: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: TransactionsState = {
  transactions: [],
  loading: false,
  error: null,
  lastFetch: null,
  hasLoadedInitial: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
};

// Cache duration: 3 minutes (shorter for transactions as they change more frequently)
const CACHE_DURATION = 3 * 60 * 1000;

// Async thunk to fetch transactions
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (
    {
      forceRefresh = false,
      page = 1,
      limit = 20,
    }: {
      forceRefresh?: boolean;
      page?: number;
      limit?: number;
    } = {},
    { getState, rejectWithValue },
  ) => {
    try {
      // Check if we should use cached data (only for first page)
      if (page === 1) {
        const state = getState() as { transactions: TransactionsState };
        const { transactions, lastFetch } = state.transactions;

        if (!forceRefresh && transactions.length > 0 && lastFetch) {
          const now = Date.now();
          if (now - lastFetch < CACHE_DURATION) {
            return { transactions, total: transactions.length }; // Return cached data
          }
        }
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { page, limit },
      });

      return {
        transactions: response.data,
        total: response.data.length, // Adjust based on your API response structure
        page,
        limit,
      };
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  },
);

// Async thunk to create transaction
export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (
    transactionData: {
      account_id: number;
      category_id?: number;
      amount: number;
      transaction_type: 'income' | 'expense' | 'transfer';
      transfer_to?: number;
      description?: string;
      transaction_date: string;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/transactions`,
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Refresh transactions list after creation
      dispatch(fetchTransactions({ forceRefresh: true }));

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to create transaction');
    }
  },
);

// Async thunk to update transaction
export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async (
    {
      id,
      data,
    }: {
      id: number;
      data: Partial<{
        category_id: number;
        amount: number;
        description: string;
        transaction_date: string;
      }>;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_BASE_URL}/transactions/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Refresh transactions list after update
      dispatch(fetchTransactions({ forceRefresh: true }));

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to update transaction');
    }
  },
);

// Async thunk to delete transaction
export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`${API_BASE_URL}/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh transactions list after deletion
      dispatch(fetchTransactions({ forceRefresh: true }));

      return id;
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to delete transaction');
    }
  },
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionsData: state => {
      state.transactions = [];
      state.error = null;
      state.lastFetch = null;
      state.hasLoadedInitial = false;
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: true,
      };
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    resetPagination: state => {
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: true,
      };
    },
  },
  extraReducers: builder => {
    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.hasLoadedInitial = true;
        const { transactions, total, page, limit } = action.payload;

        if (page === 1) {
          // Replace all transactions for first page
          state.transactions = transactions;
        } else {
          // Append for subsequent pages
          state.transactions = [...state.transactions, ...transactions];
        }

        state.lastFetch = Date.now();
        state.error = null;
        state.pagination = {
          page: page || 1,
          limit: limit || 20,
          total,
          hasMore: transactions.length === (limit || 20),
        };
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create transaction
    builder
      .addCase(createTransaction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update transaction
    builder
      .addCase(updateTransaction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete transaction
    builder
      .addCase(deleteTransaction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactionsData, setError, resetPagination } =
  transactionsSlice.actions;
export default transactionsSlice.reducer;
