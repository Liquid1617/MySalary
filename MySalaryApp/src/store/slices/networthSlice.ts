import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface AccountData {
  id: number;
  name: string;
  type: string;
  originalBalance: number;
  originalCurrency: {
    code: string;
    symbol: string;
  };
  convertedBalance: number;
  exchangeRate: number;
}

interface NetWorthData {
  netWorth: number;
  primaryCurrency: Currency;
  accounts: AccountData[];
  exchangeRatesTimestamp: number;
  message: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

interface NetWorthState {
  data: NetWorthData | null;
  chartData: ChartData | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: NetWorthState = {
  data: null,
  chartData: null,
  loading: false,
  error: null,
  lastFetch: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Async thunk to fetch net worth data
export const fetchNetWorth = createAsyncThunk(
  'networth/fetchNetWorth',
  async (forceRefresh: boolean = false, { getState, rejectWithValue }) => {
    try {
      console.log('🔍 Redux: Fetching net worth, forceRefresh:', forceRefresh);
      
      // Check if we should use cached data
      const state = getState() as { networth: NetWorthState };
      const { data, lastFetch } = state.networth;

      if (!forceRefresh && data && lastFetch) {
        const now = Date.now();
        if (now - lastFetch < CACHE_DURATION) {
          console.log('📦 Redux: Using cached net worth data');
          return data; // Return cached data
        }
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('❌ Redux: No auth token found');
        throw new Error('No authentication token found');
      }

      const fullUrl = `${API_BASE_URL}/networth`;
      console.log('🌐 Redux: Making API request to:', fullUrl);
      console.log('🌐 Redux: API_BASE_URL is:', API_BASE_URL);
      const response = await axios.get(`${API_BASE_URL}/networth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Redux: Net worth data received:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('❌ Redux: Net worth fetch failed:', error.message);
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to fetch net worth');
    }
  },
);

// Async thunk to fetch chart data
export const fetchNetWorthChart = createAsyncThunk(
  'networth/fetchNetWorthChart',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/networth/chart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to fetch chart data');
    }
  },
);

// Async thunk to update primary currency
export const updatePrimaryCurrency = createAsyncThunk(
  'networth/updatePrimaryCurrency',
  async (currencyId: number, { dispatch, rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_BASE_URL}/networth/currency`,
        { currency_id: currencyId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Refresh net worth data after currency update
      dispatch(fetchNetWorth(true));

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      return rejectWithValue(error.message || 'Failed to update currency');
    }
  },
);

const networthSlice = createSlice({
  name: 'networth',
  initialState,
  reducers: {
    clearNetWorthData: state => {
      state.data = null;
      state.chartData = null;
      state.error = null;
      state.lastFetch = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    // Fetch net worth
    builder
      .addCase(fetchNetWorth.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNetWorth.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchNetWorth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch chart data
    builder
      .addCase(fetchNetWorthChart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNetWorthChart.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData = action.payload;
        state.error = null;
      })
      .addCase(fetchNetWorthChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update primary currency
    builder
      .addCase(updatePrimaryCurrency.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrimaryCurrency.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePrimaryCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearNetWorthData, setError } = networthSlice.actions;
export default networthSlice.reducer;
