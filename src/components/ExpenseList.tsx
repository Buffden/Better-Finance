import { useMemo } from "react";
import { Expense, Category } from "@/types/finance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistance } from "date-fns";
import { cn } from "@/lib/utils";
import { Wallet } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  limit?: number;
  showCategorySelect?: boolean;
  onUpdateCategory?: (expenseId: string, categoryId: string) => void;
}

const ExpenseList = ({ 
  expenses, 
  categories, 
  limit,
  showCategorySelect = false,
  onUpdateCategory,
}: ExpenseListProps) => {
  const displayExpenses = limit ? expenses.slice(0, limit) : expenses;

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || "#888888";
  };

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'never',
    }).format(Math.abs(amount));
    
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const formatDateDistance = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {limit ? "Recent Transactions" : "All Expenses"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayExpenses.length > 0 ? (
          <div className="space-y-4">
            {displayExpenses.map((expense) => {
              const category = categories.find(c => c.id === expense.categoryId);
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                      category?.color || 'bg-gray-500'
                    }`}>
                      {expense.categoryId === 'income' ? (
                        <Wallet className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 text-center">
                          {category?.name.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(expense.date || '').toLocaleDateString()} • {expense.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {showCategorySelect && (
                      <Select
                        value={expense.categoryId}
                        onValueChange={(value) => onUpdateCategory?.(expense.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <span className={`font-medium ${expense.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {expense.amount > 0 ? '+' : '-'}${Math.abs(expense.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No transactions recorded yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseList;
