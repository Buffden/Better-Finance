import { Category } from "@/types/finance";

export const defaultCategories: Category[] = [
  { id: "food", name: "Food & Dining", color: "#ef4444", defaultBudget: 500 },
  { id: "rent", name: "Housing & Rent", color: "#3b82f6", defaultBudget: 1200 },
  { id: "transport", name: "Transportation", color: "#22c55e", defaultBudget: 300 },
  { id: "utilities", name: "Utilities", color: "#f59e0b", defaultBudget: 200 },
  { id: "entertainment", name: "Entertainment", color: "#8b5cf6", defaultBudget: 150 },
  { id: "health", name: "Healthcare", color: "#ec4899", defaultBudget: 100 },
  { id: "shopping", name: "Shopping", color: "#06b6d4", defaultBudget: 200 },
  { id: "travel", name: "Travel", color: "#14b8a6", defaultBudget: 300 },
  { id: "education", name: "Education", color: "#f97316", defaultBudget: 100 },
  { id: "other", name: "Other", color: "#6b7280", defaultBudget: 100 },
]; 