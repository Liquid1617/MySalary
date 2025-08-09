import { configureStore } from '@reduxjs/toolkit';
import networthReducer from './slices/networthSlice';
import accountsReducer from './slices/accountsSlice';
import transactionsReducer from './slices/transactionsSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    networth: networthReducer,
    accounts: accountsReducer,
    transactions: transactionsReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
