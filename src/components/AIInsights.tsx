import { useMemo } from "react";
import { Expense, Category, Budget } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface AIInsightsProps {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
}

const AIInsights = ({ expenses, categories, budgets }: AIInsightsProps) => {
  const insights = useMemo(() => {
    if (!expenses.length) return [];

    // Separate credits and debits
    const credits = expenses.filter(exp => exp.amount > 0);
    const debits = expenses.filter(exp => exp.amount < 0);
    
    const totalIncome = credits.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = Math.abs(debits.reduce((sum, exp) => sum + exp.amount, 0));
    
    const categoryTotals = debits.reduce((acc, expense) => {
      const categoryId = expense.categoryId;
      if (!acc[categoryId]) acc[categoryId] = 0;
      acc[categoryId] += Math.abs(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    const getBudget = (categoryId: string) => {
      return budgets.find(b => b.categoryId === categoryId)?.amount || 0;
    };

    const getCategoryName = (categoryId: string) => {
      return categories.find(c => c.id === categoryId)?.name || "Unknown";
    };

    const result = [];

    // Income vs Expenses Overview
    result.push({
      title: "Income vs Expenses",
      message: `Your total income is $${totalIncome.toFixed(2)} and total expenses are $${totalExpenses.toFixed(2)}. ${
        totalIncome > totalExpenses 
          ? `You're saving $${(totalIncome - totalExpenses).toFixed(2)} (${((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)}% of income)`
          : `You're overspending by $${(totalExpenses - totalIncome).toFixed(2)}`
      }`,
      icon: totalIncome > totalExpenses ? ArrowUpCircle : ArrowDownCircle,
      color: totalIncome > totalExpenses ? "text-green-500" : "text-red-500",
    });

    // Find highest expense category
    const highestCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (highestCategory) {
      result.push({
        title: "Highest Expense Category",
        message: `Your highest spending is in ${getCategoryName(highestCategory[0])} at $${highestCategory[1].toFixed(2)}, which is ${((highestCategory[1] / totalExpenses) * 100).toFixed(1)}% of your total expenses.`,
        icon: TrendingUp,
        color: "text-amber-500",
      });
    }

    // Check for budget overruns
    const overBudget = Object.entries(categoryTotals)
      .filter(([categoryId, spent]) => {
        const budget = getBudget(categoryId);
        return budget > 0 && spent > budget;
      })
      .map(([categoryId, spent]) => ({
        category: getCategoryName(categoryId),
        spent,
        budget: getBudget(categoryId),
        overage: spent - getBudget(categoryId),
      }))
      .sort((a, b) => b.overage - a.overage);

    if (overBudget.length > 0) {
      result.push({
        title: "Budget Alert",
        message: `You've exceeded your budget in ${overBudget[0].category} by $${overBudget[0].overage.toFixed(2)}. Consider reviewing your spending in this category.`,
        icon: AlertTriangle,
        color: "text-red-500",
      });
    }

    // Savings opportunities based on actual spending patterns
    const foodExpenses = categoryTotals['food'] || 0;
    const transportExpenses = categoryTotals['transport'] || 0;

    if (foodExpenses > 200) {
      result.push({
        title: "Food Savings Opportunity",
        message: `You've spent $${foodExpenses.toFixed(2)} on food. Consider meal prepping or cooking at home more often to reduce expenses.`,
        icon: TrendingDown,
        color: "text-green-500",
      });
    }

    if (transportExpenses > 100) {
      result.push({
        title: "Transport Savings Opportunity",
        message: `You've spent $${transportExpenses.toFixed(2)} on transport. Consider using public transport or carpooling to reduce costs.`,
        icon: TrendingDown,
        color: "text-green-500",
      });
    }

    // Financial Health Tip
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
      result.push({
        title: "Financial Health Tip",
        message: savingsRate >= 20
          ? "Great job! You're saving more than 20% of your income. Consider investing your savings for long-term growth."
          : "Aim to save at least 20% of your income. Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.",
        icon: Lightbulb,
        color: "text-blue-500",
      });
    }

    return result;
  }, [expenses, categories, budgets]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-6">
              {insights.map((insight, index) => (
                <div key={index} className="flex border rounded-lg p-4 bg-white">
                  <div className={`${insight.color} mr-4 mt-1`}>
                    <insight.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{insight.title}</h3>
                    <p className="text-gray-600 mt-1">{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Add transactions to generate AI insights
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ask AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50 text-center">
            <p className="text-gray-600 mb-4">
              In a real application, this section would allow users to ask questions about their finances and get AI-powered responses from Gemini API.
            </p>
            <div className="flex items-center border rounded-lg bg-white p-3">
              <input
                type="text"
                placeholder="Ask a question about your finances..."
                className="flex-1 border-0 focus:outline-none bg-transparent"
                disabled
              />
              <Button variant="ghost" className="ml-2" disabled>
                Ask AI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;
