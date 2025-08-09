import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export interface Account {
  id: number;
  user_id: number;
  account_type: string;
  account_name: string;
  currency_id: number;
  balance: string;
  is_active: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  currency: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  };
}

interface AccountsState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: AccountsState = {
  accounts: [],
  loading: false,
  error: null,
  lastFetch: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Async thunk to fetch accounts
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (forceRefresh: boolean = false, { getState, rejectWithValue }) => {
    try {
      // Check if we should use cached data
      const state = getState() as { accounts: AccountsState };
      const { accounts, lastFetch } = state.accounts;
      
      if (!forceRefresh && accounts.length > 0 && lastFetch) {
        const now = Date.now();
        if (now - lastFetch < CACHE_DURATION) {
          return accounts; // Return cached data
        }
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to fetch accounts');
    }
  }
);

// Async thunk to create account
export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData: {
    account_type: string;
    account_name: string;
    currency_id: number;
    balance: number;
    description?: string;
  }, { dispatch, rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/accounts`,
        accountData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // Refresh accounts list after creation
      dispatch(fetchAccounts(true));

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to create account');
    }
  }
);

// Async thunk to update account
export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, data }: {
    id: number;
    data: Partial<{
      account_name: string;
      description: string;
      is_active: boolean;
    }>;
  }, { dispatch, rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_BASE_URL}/accounts/${id}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // Refresh accounts list after update
      dispatch(fetchAccounts(true));

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to update account');
    }
  }
);

// Async thunk to delete account
export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`${API_BASE_URL}/accounts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Refresh accounts list after deletion
      dispatch(fetchAccounts(true));

      return id;
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to delete account');
    }
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearAccountsData: (state) => {
      state.accounts = [];
      state.error = null;
      state.lastFetch = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch accounts
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create account
    builder
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update account
    builder
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete account
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAccountsData, setError } = accountsSlice.actions;
export default accountsSlice.reducer;