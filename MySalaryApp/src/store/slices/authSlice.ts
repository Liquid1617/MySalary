import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface User {
  id: number;
  name: string;
  login: string;
  email: string;
  phone?: string;
  primary_currency_id?: number;
  primaryCurrency?: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunk to login
export const login = createAsyncThunk(
  'auth/login',
  async ({ login, password }: { login: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        login,
        password,
      });

      const { token, user } = response.data;
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('token', token);

      // Clear all cached data from previous user
      dispatch({ type: 'networth/clearNetWorthData' });
      dispatch({ type: 'accounts/clearAccountsData' });
      dispatch({ type: 'transactions/clearTransactionsData' });

      return { token, user };
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Async thunk to register
export const register = createAsyncThunk(
  'auth/register',
  async ({ 
    name, 
    login, 
    email, 
    password 
  }: { 
    name: string; 
    login: string; 
    email: string; 
    password: string; 
  }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        login,
        email,
        password,
      });

      const { token, user } = response.data;
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('token', token);

      // Clear all cached data from previous user (if any)
      dispatch({ type: 'networth/clearNetWorthData' });
      dispatch({ type: 'accounts/clearAccountsData' });
      dispatch({ type: 'transactions/clearTransactionsData' });

      return { token, user };
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Async thunk to get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      // Clear token if it's invalid
      await AsyncStorage.removeItem('token');
      
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to get user info');
    }
  }
);

// Async thunk to restore authentication from storage
export const restoreAuth = createAsyncThunk(
  'auth/restoreAuth',
  async (_, { dispatch }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return null;
      }

      // Try to get user data with the stored token
      const userResult = await dispatch(getCurrentUser());
      if (getCurrentUser.fulfilled.match(userResult)) {
        return { token, user: userResult.payload };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
);

// Async thunk to logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Remove token from AsyncStorage
      await AsyncStorage.removeItem('token');
      
      // Clear all other data slices
      dispatch({ type: 'networth/clearNetWorthData' });
      dispatch({ type: 'accounts/clearAccountsData' });
      dispatch({ type: 'transactions/clearTransactionsData' });
      
      return null;
    } catch (error) {
      console.error('Error during logout:', error);
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Restore auth
    builder
      .addCase(restoreAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;