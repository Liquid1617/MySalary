import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// Custom hooks for specific slices
export const useNetWorth = () => useAppSelector(state => state.networth);
export const useAccounts = () => useAppSelector(state => state.accounts);
export const useTransactions = () =>
  useAppSelector(state => state.transactions);
export const useAuth = () => useAppSelector(state => state.auth);
