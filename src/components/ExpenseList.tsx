
import { useMemo } from "react";
import { Expense, Category } from "@/types/finance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistance } from "date-fns";

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  limit?: number;
}

const ExpenseList = ({ expenses, categories, limit }: ExpenseListProps) => {
  const sortedExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [expenses, limit]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || "#888888";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateDistance = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedExpenses.length > 0 ? (
          <div className="space-y-4">
            {sortedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: getCategoryColor(expense.categoryId) }}
                  >
                    {getCategoryName(expense.categoryId).charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {expense.description || getCategoryName(expense.categoryId)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateDistance(expense.date)} • {expense.paymentMethod}
                    </p>
                  </div>
                </div>
                <span className="font-semibold">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No expenses recorded yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseList;
