import { useMemo, useState } from "react";
import { Expense, Category, Budget } from "@/types/finance";
import ExpenseOverview from "./ExpenseOverview";
import ExpenseList from "./ExpenseList";
import BudgetManager from "./BudgetManager";
import AIInsights from "./AIInsights";
import { Upload, Plus, Loader2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  onAddExpense: () => void;
  onUpdateBudget: (budget: Budget) => void;
  onUploadInvoice: (file: File) => void;
  onUpdateExpense?: (expenseId: string, updates: Partial<Expense>) => void;
  activeView: string;
  isProcessing: boolean;
  onUpdateCategory: (expenseId: string, categoryId: string) => void;
}

const Dashboard = ({
  expenses,
  categories,
  budgets,
  onAddExpense,
  onUpdateBudget,
  onUploadInvoice,
  onUpdateExpense,
  activeView,
  isProcessing,
  onUpdateCategory,
}: DashboardProps) => {
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [editedIncome, setEditedIncome] = useState("0");

  const totalExpenses = expenses
    .filter(expense => expense.amount < 0)
    .reduce((total, expense) => total + Math.abs(expense.amount), 0);

  const totalIncome = expenses
    .filter(expense => expense.amount > 0)
    .reduce((total, expense) => total + expense.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadInvoice(file);
    }
  };

  const handleUpdateCategory = (expenseId: string, newCategoryId: string) => {
    if (onUpdateExpense) {
      onUpdateExpense(expenseId, { categoryId: newCategoryId });
    }
  };

  const handleIncomeEdit = () => {
    setEditedIncome(totalIncome.toString());
    setIsEditingIncome(true);
  };

  const handleIncomeSave = () => {
    const newIncome = parseFloat(editedIncome);
    if (!isNaN(newIncome)) {
      // Update the income in expenses
      const incomeExpense = expenses.find(e => e.categoryId === 'income');
      if (incomeExpense) {
        incomeExpense.amount = newIncome;
      }
    }
    setIsEditingIncome(false);
  };

  const handleIncomeCancel = () => {
    setIsEditingIncome(false);
  };

  return (
    <div className="p-6 relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-white shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Processing your statement...</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeView === "dashboard" && "Financial Dashboard"}
            {activeView === "expenses" && "Expenses"}
            {activeView === "budget" && "Budget Manager"}
            {activeView === "insights" && "AI Insights"}
          </h1>
          {activeView === "dashboard" && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-lg text-gray-600">
                  Total Income: {!isEditingIncome ? (
                    <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
                  ) : (
                    <div className="inline-flex items-center gap-2">
                      <Input
                        type="number"
                        value={editedIncome}
                        onChange={(e) => setEditedIncome(e.target.value)}
                        className="w-32 h-8"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleIncomeSave}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleIncomeCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </p>
                {!isEditingIncome && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleIncomeEdit}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-lg text-gray-600">
                Total Expenses: <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onAddExpense}
            className="bg-blue-700 hover:bg-blue-800"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Expense
          </Button>

          <div className="relative">
            <input
              type="file"
              id="invoice-upload"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.png,.jpg,.jpeg"
            />
            <Button
              variant="outline"
              className={isProcessing ? "opacity-50 pointer-events-none" : ""}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Invoice
            </Button>
          </div>
        </div>
      </div>

      {activeView === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseOverview expenses={expenses} categories={categories} />
          <ExpenseList expenses={expenses} categories={categories} limit={5} />
        </div>
      )}

      {activeView === "expenses" && (
        <ExpenseList 
          expenses={expenses} 
          categories={categories}
          onUpdateCategory={handleUpdateCategory}
          showCategorySelect={true}
        />
      )}

      {activeView === "budget" && (
        <BudgetManager
          expenses={expenses}
          categories={categories}
          budgets={budgets}
          onUpdateBudget={onUpdateBudget}
        />
      )}

      {activeView === "insights" && (
        <AIInsights expenses={expenses} categories={categories} budgets={budgets} />
      )}
    </div>
  );
};

export default Dashboard;
