import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { 
  Budget, 
  BudgetResponse, 
  CreateBudgetRequest, 
  UpdateBudgetRequest 
} from '../types/budget';

const BUDGETS_QUERY_KEY = ['budgets'];

export const useBudgets = () => {
  return useQuery<BudgetResponse[]>({
    queryKey: BUDGETS_QUERY_KEY,
    queryFn: async () => {
      const response = await apiService.get<BudgetResponse[]>('/budgets');
      return response || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Normal retry since endpoint now exists
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Budget, Error, CreateBudgetRequest>({
    mutationFn: async (budgetData: CreateBudgetRequest) => {
      const response = await apiService.post<Budget>('/budgets', budgetData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Budget, Error, UpdateBudgetRequest>({
    mutationFn: async (budgetData: UpdateBudgetRequest) => {
      const { id, ...data } = budgetData;
      const response = await apiService.put<Budget>(`/budgets/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string | number>({
    mutationFn: async (budgetId: string | number) => {
      console.log('=== DELETING BUDGET ===');
      console.log('Budget ID:', budgetId, typeof budgetId);
      await apiService.delete(`/budgets/${budgetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    },
  });
};

export const useBudgetActions = () => {
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  
  return {
    createBudget,
    updateBudget,
    deleteBudget,
    isLoading: createBudget.isPending || updateBudget.isPending || deleteBudget.isPending,
  };
};