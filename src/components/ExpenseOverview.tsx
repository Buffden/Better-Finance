import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Expense, Category } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseOverviewProps {
  expenses: Expense[];
  categories: Category[];
}

const ExpenseOverview = ({ expenses, categories }: ExpenseOverviewProps) => {
  console.log('ExpenseOverview rendered with:', { 
    expensesCount: expenses?.length, 
    categoriesCount: categories?.length 
  });

  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      console.log('No expenses provided');
      return [];
    }

    console.log('Processing expenses:', expenses);

    // Calculate category totals for expenses
    const categoryTotals = expenses.reduce((acc, expense) => {
      const categoryId = expense.categoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      // Use absolute value for display
      acc[categoryId] += Math.abs(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    console.log('Category totals:', categoryTotals);

    // Create data for expenses by category
    const expenseData = categories
      .map((category) => {
        const value = categoryTotals[category.id] || 0;
        if (value === 0) return null; // Skip categories with no expenses
        return {
          name: category.name,
          value,
          color: category.color || '#888', // Fallback color
          id: category.id,
          type: 'expense'
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    console.log('Final chart data:', expenseData);
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  minAngle={15}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No transactions recorded yet ({expenses?.length ?? 0} expenses, {categories?.length ?? 0} categories)
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
