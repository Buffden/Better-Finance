import { useState } from "react";
import { Expense, Category, Budget } from "@/types/finance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface BudgetManagerProps {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  onUpdateBudget: (budget: Budget) => void;
}

const BudgetManager = ({
  expenses,
  categories,
  budgets,
  onUpdateBudget,
}: BudgetManagerProps) => {
  const [editingBudgets, setEditingBudgets] = useState<Record<string, number>>(
    Object.fromEntries(budgets.map((b) => [b.categoryId, b.amount]))
  );

  const calculateCategoryTotal = (categoryId: string) => {
    // Only consider expenses (negative amounts) for budget tracking
    return Math.abs(expenses
      .filter((expense) => expense.categoryId === categoryId && expense.amount < 0)
      .reduce((total, expense) => total + expense.amount, 0));
  };

  const handleBudgetChange = (categoryId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setEditingBudgets({ ...editingBudgets, [categoryId]: amount });
  };

  const handleSaveBudget = (categoryId: string) => {
    onUpdateBudget({
      categoryId,
      amount: editingBudgets[categoryId] || 0,
    });
  };

  const getBudgetAmount = (categoryId: string) => {
    return budgets.find((b) => b.categoryId === categoryId)?.amount || 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare chart data
  const chartData = categories.map((category) => {
    const spent = calculateCategoryTotal(category.id);
    const budget = getBudgetAmount(category.id);
    const remaining = budget - spent;
    
    return {
      name: category.name,
      spent: spent,
      budget: budget,
      remaining: remaining > 0 ? remaining : 0,
      overspent: remaining < 0 ? Math.abs(remaining) : 0,
      id: category.id,
      color: category.color,
    };
  }).filter(item => item.budget > 0 || item.spent > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isOverspent = data.spent > data.budget;
      
      return (
        <div className="bg-white p-3 shadow-md rounded-md border">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">Budget: {formatCurrency(data.budget)}</p>
          <p className="text-sm">Spent: {formatCurrency(data.spent)}</p>
          {isOverspent ? (
            <p className="text-sm text-red-500">
              Overspent: {formatCurrency(data.overspent)}
            </p>
          ) : (
            <p className="text-sm text-green-500">
              Remaining: {formatCurrency(data.remaining)}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {((data.spent / data.budget) * 100).toFixed(1)}% of budget used
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget vs. Spending</CardTitle>
          <CardDescription>
            Compare your budgeted amounts with actual spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="spent" name="Spent">
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.spent > entry.budget ? "#ef4444" : entry.color} 
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="budget" name="Budget" fill="#94a3b8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No budgets set yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Set Budgets</CardTitle>
          <CardDescription>
            Manage your monthly spending limits by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category) => {
              const spent = calculateCategoryTotal(category.id);
              const budget = getBudgetAmount(category.id);
              const percentage = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      ></span>
                      <span>{category.name}</span>
                    </div>
                    <span
                      className={cn(
                        "font-medium transition-colors duration-300",
                        percentage > 100 && "text-red-500",
                        percentage > 90 && percentage <= 100 && "text-red-400",
                        percentage > 75 && percentage <= 90 && "text-orange-400",
                        percentage > 50 && percentage <= 75 && "text-yellow-600",
                        percentage <= 50 && "text-green-500"
                      )}
                    >
                      {formatCurrency(spent)} / {formatCurrency(budget)}
                    </span>
                  </div>
                  
                  <Progress
                    value={percentage}
                    className={cn(
                      "transition-colors duration-500",
                      percentage > 100 && "bg-red-100 animate-pulse",
                      percentage > 90 && percentage <= 100 && "bg-red-50",
                      percentage > 75 && percentage <= 90 && "bg-orange-50",
                      percentage > 50 && percentage <= 75 && "bg-yellow-50",
                      percentage <= 50 && "bg-green-50"
                    )}
                    indicatorClassName={cn(
                      "transition-colors duration-500",
                      percentage > 100 && "bg-red-500 animate-pulse",
                      percentage > 90 && percentage <= 100 && "bg-red-400",
                      percentage > 75 && percentage <= 90 && "bg-orange-400",
                      percentage > 50 && percentage <= 75 && "bg-yellow-400",
                      percentage <= 50 && "bg-green-400",
                      "shadow-sm"
                    )}
                  />

                  <div className="flex gap-2 pt-1">
                    <Input
                      type="number"
                      placeholder="Set budget"
                      value={editingBudgets[category.id] || ""}
                      onChange={(e) =>
                        handleBudgetChange(category.id, e.target.value)
                      }
                      className="max-w-[180px]"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveBudget(category.id)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetManager;
