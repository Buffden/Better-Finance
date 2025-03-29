import { useMemo, useState } from "react";
import { Expense, Category } from "@/types/finance";

interface ExpenseOverviewProps {
  expenses: Expense[];
  categories: Category[];
}

export default function ExpenseOverview({ expenses, categories }: ExpenseOverviewProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const expensesByCategory = useMemo(() => {
    // Filter out income transactions and only include expenses
    const expensesOnly = expenses.filter(expense => expense.amount < 0);
    
    return expensesOnly.reduce((acc, expense) => {
      const categoryId = expense.categoryId;
      if (categoryId === 'income') return acc; // Skip income category
      
      acc[categoryId] = (acc[categoryId] || 0) + Math.abs(expense.amount);
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  const sortedExpenses = useMemo(() => {
    return Object.entries(expensesByCategory)
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        category: categories.find(c => c.id === categoryId)
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expensesByCategory, categories]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
      <div className="flex flex-col items-center gap-8">
        <div className="relative" onMouseMove={handleMouseMove}>
          <div className="w-64 h-64">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {sortedExpenses.map((item, index, array) => {
                const total = array.reduce((sum, curr) => sum + curr.amount, 0);
                const percentage = (item.amount / total) * 100;
                
                // Calculate the stroke-dasharray and stroke-dashoffset
                const circumference = 2 * Math.PI * 25;
                const strokeDasharray = circumference;
                const strokeDashoffset = circumference * (1 - percentage / 100);
                
                // Calculate rotation based on previous segments
                const previousPercentage = array
                  .slice(0, index)
                  .reduce((sum, curr) => sum + (curr.amount / total) * 100, 0);
                const rotation = (previousPercentage / 100) * 360;
                
                return (
                  <circle
                    key={item.categoryId}
                    cx="50"
                    cy="50"
                    r="25"
                    fill="none"
                    stroke={item.category?.color || '#gray'}
                    strokeWidth="25"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: '50% 50%',
                      opacity: hoveredCategory === null || hoveredCategory === item.categoryId ? 1 : 0.5,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={() => setHoveredCategory(item.categoryId)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Tooltip */}
          {hoveredCategory && (
            <div 
              className="absolute bg-white p-3 rounded-lg shadow-lg border text-center min-w-[150px] z-10 pointer-events-none"
              style={{
                left: `${mousePos.x}px`,
                top: `${mousePos.y - 80}px`
              }}
            >
              <p className="font-semibold">{categories.find(c => c.id === hoveredCategory)?.name}</p>
              <p className="text-sm text-gray-600">
                {formatCurrency(expensesByCategory[hoveredCategory])}
                {' '}
                ({((expensesByCategory[hoveredCategory] / Object.values(expensesByCategory).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)
              </p>
            </div>
          )}
        </div>

        {/* Legends below the chart */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          {sortedExpenses.map((item) => (
            <div 
              key={item.categoryId} 
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              onMouseEnter={() => setHoveredCategory(item.categoryId)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{
                opacity: hoveredCategory === null || hoveredCategory === item.categoryId ? 1 : 0.5,
                transition: 'opacity 0.2s',
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.category?.color }}
              />
              <span className="font-medium flex-1">{item.category?.name || 'Other'}</span>
              <span className="text-gray-600">{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
