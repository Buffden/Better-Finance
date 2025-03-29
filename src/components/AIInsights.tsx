import { useMemo } from "react";
import { Expense, Category, Budget } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpCircle, 
  ArrowDownCircle,
  PiggyBank,
  ShoppingCart,
  Utensils,
  Car,
  Home,
  Heart,
  GraduationCap,
  Plane,
  Gamepad,
  ShoppingBag,
  DollarSign,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightsProps {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
}

const trustedSources = {
  savings: "https://www.investopedia.com/articles/personal-finance/100516/importance-saving-money/",
  investing: "https://www.nerdwallet.com/article/investing/how-to-start-investing",
  budgeting: "https://www.mint.com/budgeting-3/50-30-20-budget-rule",
  foodSavings: "https://www.consumer.gov/articles/1002-making-food-dollars-stretch",
  transportSavings: "https://www.consumer.gov/articles/1002-saving-money-on-transportation",
  emergencyFund: "https://www.nerdwallet.com/article/banking/emergency-fund-how-much-to-build",
  creditScore: "https://www.consumerfinance.gov/about-us/blog/how-to-improve-your-credit-score/",
  debtManagement: "https://www.nerdwallet.com/article/finance/debt-management-strategies",
  retirement: "https://www.investopedia.com/retirement-planning-4689695"
};

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

    // Investment opportunities (prioritized)
    if (totalIncome > totalExpenses) {
      const savings = totalIncome - totalExpenses;
      if (savings > 100) {
        result.push({
          title: "Investment Opportunity",
          message: `You have $${savings.toFixed(2)} in monthly savings. Consider:
          • Opening a high-yield savings account
          • Starting a retirement fund
          • Investing in index funds
          • Building an emergency fund`,
          icon: PiggyBank,
          color: "text-blue-500",
          source: trustedSources.investing,
          priority: true
        });
      }
    }

    // Income vs Expenses Overview
    result.push({
      title: "Financial Health Overview",
      message: `Your total income is $${totalIncome.toFixed(2)} and total expenses are $${totalExpenses.toFixed(2)}. ${
        totalIncome > totalExpenses 
          ? `You're saving $${(totalIncome - totalExpenses).toFixed(2)} (${((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)}% of income)`
          : `You're overspending by $${(totalExpenses - totalIncome).toFixed(2)}`
      }`,
      icon: totalIncome > totalExpenses ? ArrowUpCircle : ArrowDownCircle,
      color: totalIncome > totalExpenses ? "text-green-500" : "text-red-500",
      source: trustedSources.savings
    });

    // Savings Rate Analysis
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
      result.push({
        title: "Savings Rate Analysis",
        message: savingsRate >= 20
          ? "Excellent! You're following the 50/30/20 rule. Consider investing your savings for long-term growth."
          : savingsRate >= 10
          ? "You're saving 10-20% of your income. Try to increase it to 20% for better financial security."
          : "Consider reducing discretionary spending to increase your savings rate to at least 20%.",
        icon: PiggyBank,
        color: savingsRate >= 20 ? "text-green-500" : savingsRate >= 10 ? "text-amber-500" : "text-red-500",
        source: trustedSources.budgeting
      });
    }

    // Category-specific insights and recommendations
    const categoryIcons: Record<string, React.ElementType> = {
      food: Utensils,
      transport: Car,
      rent: Home,
      health: Heart,
      education: GraduationCap,
      travel: Plane,
      entertainment: Gamepad,
      shopping: ShoppingBag,
      utilities: DollarSign,
    };

    // Analyze each category for potential savings
    Object.entries(categoryTotals).forEach(([categoryId, spent]) => {
      const budget = getBudget(categoryId);
      const categoryName = getCategoryName(categoryId);
      const Icon = categoryIcons[categoryId] || ShoppingCart;

      if (budget > 0) {
        const percentageOfBudget = (spent / budget) * 100;
        
        if (percentageOfBudget > 100) {
          result.push({
            title: `Budget Alert: ${categoryName}`,
            message: `You've exceeded your ${categoryName} budget by $${(spent - budget).toFixed(2)}. ${
              categoryId === 'food' 
                ? "Consider meal planning and cooking at home to reduce expenses."
                : categoryId === 'transport'
                ? "Look into carpooling or public transport options to save on commuting costs."
                : categoryId === 'entertainment'
                ? "Try free or low-cost entertainment options like local events or streaming services."
                : categoryId === 'shopping'
                ? "Wait for sales or use cashback apps for better deals."
                : "Review your spending in this category and identify non-essential expenses."
            }`,
            icon: Icon,
            color: "text-red-500",
            source: categoryId === 'food' ? trustedSources.foodSavings : 
                    categoryId === 'transport' ? trustedSources.transportSavings : 
                    trustedSources.budgeting
          });
        } else if (percentageOfBudget > 80) {
          result.push({
            title: `Approaching Budget Limit: ${categoryName}`,
            message: `You've used ${percentageOfBudget.toFixed(1)}% of your ${categoryName} budget. Consider reviewing your spending to stay within limits.`,
            icon: Icon,
            color: "text-amber-500",
            source: trustedSources.budgeting
          });
        }
      }
    });

    // Monthly spending patterns
    const monthlyExpenses = debits.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'long' });
      if (!acc[month]) acc[month] = 0;
      acc[month] += Math.abs(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    const months = Object.entries(monthlyExpenses);
    if (months.length > 1) {
      const currentMonth = months[months.length - 1];
      const previousMonth = months[months.length - 2];
      const change = ((currentMonth[1] - previousMonth[1]) / previousMonth[1]) * 100;

      if (Math.abs(change) > 10) {
        result.push({
          title: "Monthly Spending Trend",
          message: `Your spending has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% compared to last month. ${
            change > 0 
              ? "Review your recent expenses to identify any unnecessary spending."
              : "Great job! Keep up the good work on managing your expenses."
          }`,
          icon: change > 0 ? TrendingUp : TrendingDown,
          color: change > 0 ? "text-red-500" : "text-green-500",
          source: trustedSources.budgeting
        });
      }
    }

    // Smart savings suggestions based on spending patterns
    if (categoryTotals['food'] > 200) {
      result.push({
        title: "Food & Dining Savings",
        message: `You've spent $${categoryTotals['food'].toFixed(2)} on food. Consider:
        • Meal prepping for the week
        • Using grocery delivery services for better deals
        • Taking advantage of restaurant loyalty programs
        • Cooking at home more often`,
        icon: Utensils,
        color: "text-green-500",
        source: trustedSources.foodSavings
      });
    }

    if (categoryTotals['transport'] > 100) {
      result.push({
        title: "Transportation Savings",
        message: `You've spent $${categoryTotals['transport'].toFixed(2)} on transport. Consider:
        • Using public transport or carpooling
        • Maintaining your vehicle regularly to prevent costly repairs
        • Using fuel rewards programs
        • Walking or cycling for short distances`,
        icon: Car,
        color: "text-green-500",
        source: trustedSources.transportSavings
      });
    }

    // Add personalized AI advice card
    const generatePersonalizedAdvice = () => {
      const credits = expenses.filter(exp => exp.amount > 0);
      const debits = expenses.filter(exp => exp.amount < 0);
      const totalIncome = credits.reduce((sum, exp) => sum + exp.amount, 0);
      const totalExpenses = Math.abs(debits.reduce((sum, exp) => sum + exp.amount, 0));
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
      
      const categoryTotals = debits.reduce((acc, expense) => {
        const categoryId = expense.categoryId;
        if (!acc[categoryId]) acc[categoryId] = 0;
        acc[categoryId] += Math.abs(expense.amount);
        return acc;
      }, {} as Record<string, number>);

      const overBudgetCategories = Object.entries(categoryTotals)
        .filter(([categoryId, spent]) => {
          const budget = budgets.find(b => b.categoryId === categoryId)?.amount || 0;
          return budget > 0 && spent > budget;
        })
        .map(([categoryId]) => categories.find(c => c.id === categoryId)?.name);

      const advice = [];

      // Savings Rate Advice
      if (savingsRate < 20) {
        advice.push({
          title: "Increase Your Savings",
          tip: "Try to save at least 20% of your income. Consider automating your savings by setting up automatic transfers to a savings account.",
          source: trustedSources.savings
        });
      }

      // Emergency Fund Advice
      if (totalIncome > 0) {
        advice.push({
          title: "Build Emergency Fund",
          tip: "Aim to save 3-6 months of living expenses in an easily accessible emergency fund.",
          source: trustedSources.emergencyFund
        });
      }

      // Budget Management
      if (overBudgetCategories.length > 0) {
        advice.push({
          title: "Budget Management",
          tip: `You're over budget in ${overBudgetCategories.join(", ")}. Review these categories and look for ways to reduce spending.`,
          source: trustedSources.budgeting
        });
      }

      // Investment Advice
      if (savingsRate > 20) {
        advice.push({
          title: "Investment Opportunities",
          tip: "Consider investing your extra savings in a diversified portfolio. Look into index funds or retirement accounts for long-term growth.",
          source: trustedSources.investing
        });
      }

      // Debt Management
      const hasHighExpenses = totalExpenses > totalIncome * 0.7;
      if (hasHighExpenses) {
        advice.push({
          title: "Debt Management",
          tip: "Your expenses are high relative to income. Consider debt consolidation or creating a debt repayment plan.",
          source: trustedSources.debtManagement
        });
      }

      // Retirement Planning
      if (totalIncome > totalExpenses) {
        advice.push({
          title: "Retirement Planning",
          tip: "Make sure you're contributing to retirement accounts. Consider increasing contributions if you're saving more than 20% of income.",
          source: trustedSources.retirement
        });
      }

      return advice;
    };

    const personalizedAdvice = generatePersonalizedAdvice();
    
    if (personalizedAdvice.length > 0) {
      result.push({
        title: "Your Personal Finance Advisor",
        message: "Based on your spending patterns and financial goals, here are some personalized recommendations:",
        icon: Lightbulb,
        color: "text-purple-500",
        advice: personalizedAdvice,
        priority: true
      });
    }

    return result;
  }, [expenses, categories, budgets]);

  // Sort insights to prioritize investment opportunity and advice
  const sortedInsights = [...insights].sort((a, b) => {
    if (a.priority) return -1;
    if (b.priority) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {sortedInsights.map((insight, index) => (
        <Card 
          key={index}
          className={cn(
            "transition-all duration-200 hover:shadow-md",
            insight.color === "text-red-500" && "border-red-100",
            insight.color === "text-green-500" && "border-green-100",
            insight.color === "text-amber-500" && "border-amber-100",
            insight.color === "text-blue-500" && "border-blue-100",
            insight.color === "text-purple-500" && "border-purple-100",
            insight.priority && "border-2 border-purple-500 shadow-lg bg-gradient-to-br from-purple-50 to-white"
          )}
        >
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-2",
            insight.priority && "border-b border-purple-200"
          )}>
            <CardTitle className={cn(
              "text-sm font-medium flex items-center gap-2",
              insight.priority && "text-purple-900 text-base"
            )}>
              <insight.icon className={cn("h-4 w-4", insight.color, insight.priority && "h-5 w-5")} />
              {insight.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-sm text-gray-600 whitespace-pre-line leading-relaxed",
              insight.priority && "text-gray-700"
            )}>
              {insight.message}
              
              {insight.advice && (
                <div className="mt-4 space-y-4">
                  {insight.advice.map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 border border-purple-100">
                      <h4 className="font-semibold text-purple-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 mb-2">{item.tip}</p>
                      <a
                        href={item.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      >
                        Learn more <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AIInsights;
