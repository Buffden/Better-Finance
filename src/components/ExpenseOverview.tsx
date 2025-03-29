import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Expense, Category } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseOverviewProps {
  expenses: Expense[];
  categories: Category[];
}

const ExpenseOverview = ({ expenses, categories }: ExpenseOverviewProps) => {
  const chartData = useMemo(() => {
    // Separate credits and debits
    const credits = expenses.filter(exp => exp.amount > 0);
    const debits = expenses.filter(exp => exp.amount < 0);

    // Calculate category totals for debits (expenses)
    const categoryTotals = debits.reduce((acc, expense) => {
      const categoryId = expense.categoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      acc[categoryId] += Math.abs(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    // Calculate total income
    const totalIncome = credits.reduce((sum, expense) => sum + expense.amount, 0);

    // Create data for expenses by category
    const expenseData = categories.map((category) => ({
      name: category.name,
      value: categoryTotals[category.id] || 0,
      color: category.color,
      id: category.id,
      type: 'expense'
    })).filter(item => item.value > 0);

    // Add income data if there is any
    if (totalIncome > 0) {
      expenseData.push({
        name: 'Income',
        value: totalIncome,
        color: '#22c55e', // Green color for income
        id: 'income',
        type: 'income'
      });
    }

    return expenseData;
  }, [expenses, categories]);

  const totalAmount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            {formatCurrency(data.value)} ({((data.value / totalAmount) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No transactions recorded yet
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {chartData.map((category) => (
            <div key={category.id} className="flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: category.color }}
              ></span>
              <span className="text-sm text-gray-600 mr-2">{category.name}</span>
              <span className="text-sm font-medium ml-auto">
                {formatCurrency(category.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseOverview;
