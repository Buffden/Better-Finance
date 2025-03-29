
export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description?: string;
  date: string;
  paymentMethod: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  defaultBudget?: number;
}

export interface Budget {
  categoryId: string;
  amount: number;
}
