export type PeriodType = 'month' | 'week' | 'custom';

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  limit_amount: number;
  currency: string;
  period_type: PeriodType;
  start_date: string;
  end_date: string;
  rollover: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  budget_id: string;
  category_id: string;
  category: {
    id: number;
    name: string;
    type: string;
  };
}

export interface CreateBudgetRequest {
  name: string;
  limit_amount: number;
  currency: string;
  period_type: PeriodType;
  categories: string[];
  rollover: boolean;
  /**
   * Required for all period types, not just custom periods.
   * Field name includes "custom" prefix for backend API compatibility.
   */
  custom_start_date: string;
  /**
   * Required for all period types, not just custom periods.
   * Field name includes "custom" prefix for backend API compatibility.
   */
  custom_end_date: string;
}

export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {
  id: string;
}

export interface BudgetResponse extends Budget {
  spent_amount: number;
  spent: number; // For frontend compatibility
  percent: number; // Calculated percentage
}

export interface BudgetAnalyticsEvent {
  event: 'budget_create' | 'budget_exceed' | 'budget_card_click';
  properties: {
    id?: string;
    limit?: number;
    categories?: string[];
    period_type?: PeriodType;
    spent_percent?: number;
  };
}
