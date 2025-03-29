
import { Category, Expense } from "@/types/finance";

export const initialCategories: Category[] = [
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

// Generate dates for the past month
const getRandomDate = () => {
  const now = new Date();
  const pastMonth = new Date(now);
  pastMonth.setMonth(now.getMonth() - 1);
  
  const randomTime = pastMonth.getTime() + Math.random() * (now.getTime() - pastMonth.getTime());
  return new Date(randomTime).toISOString();
};

export const initialExpenses: Expense[] = [
  {
    id: "exp-1",
    categoryId: "food",
    amount: 45.50,
    description: "Grocery shopping",
    date: getRandomDate(),
    paymentMethod: "card",
  },
  {
    id: "exp-2",
    categoryId: "food",
    amount: 28.75,
    description: "Restaurant dinner",
    date: getRandomDate(),
    paymentMethod: "card",
  },
  {
    id: "exp-3",
    categoryId: "rent",
    amount: 1100.00,
    description: "Monthly rent",
    date: getRandomDate(),
    paymentMethod: "bank",
  },
  {
    id: "exp-4",
    categoryId: "transport",
    amount: 35.00,
    description: "Gas",
    date: getRandomDate(),
    paymentMethod: "card",
  },
  {
    id: "exp-5",
    categoryId: "entertainment",
    amount: 12.99,
    description: "Movie tickets",
    date: getRandomDate(),
    paymentMethod: "card",
  },
  {
    id: "exp-6",
    categoryId: "utilities",
    amount: 85.40,
    description: "Electricity bill",
    date: getRandomDate(),
    paymentMethod: "bank",
  },
  {
    id: "exp-7",
    categoryId: "health",
    amount: 20.00,
    description: "Pharmacy",
    date: getRandomDate(),
    paymentMethod: "card",
  },
  {
    id: "exp-8",
    categoryId: "shopping",
    amount: 65.99,
    description: "New shirt",
    date: getRandomDate(),
    paymentMethod: "card",
  },
  {
    id: "exp-9",
    categoryId: "food",
    amount: 32.45,
    description: "Lunch with friends",
    date: getRandomDate(),
    paymentMethod: "cash",
  },
  {
    id: "exp-10",
    categoryId: "transport",
    amount: 25.00,
    description: "Rideshare",
    date: getRandomDate(),
    paymentMethod: "card",
  },
];
