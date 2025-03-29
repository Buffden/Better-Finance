import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Sidebar from "@/components/Sidebar";
import AddExpenseModal from "@/components/AddExpenseModal";
import { Expense, Category, Budget } from "@/types/finance";
import { useToast } from "@/components/ui/use-toast";
import { defaultCategories } from "@/data/defaultCategories";
import { processInvoiceWithGemini } from "@/lib/gemini";

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  onAddExpense: () => void;
  onUpdateBudget: (budget: Budget) => void;
  onUploadInvoice: (file: File) => Promise<void>;
  onUpdateExpense?: (expenseId: string, updates: Partial<Expense>) => void;
  activeView: string;
  isProcessing: boolean;
}

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories] = useState<Category[]>(defaultCategories);
  const [budgets, setBudgets] = useState<Budget[]>(
    defaultCategories.map((category) => ({
      categoryId: category.id,
      amount: category.defaultBudget || 0,
    }))
  );
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<"dashboard" | "expenses" | "budget" | "insights">("dashboard");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const addExpense = (expense: Expense) => {
    setExpenses([...expenses, { ...expense, id: `exp-${Date.now()}` }]);
    toast({
      title: "Expense added",
      description: `$${Math.abs(expense.amount).toFixed(2)} added to ${
        categories.find((c) => c.id === expense.categoryId)?.name
      }`,
    });
  };

  const updateExpense = (expenseId: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(expense => {
      if (expense.id === expenseId) {
        const updatedExpense = { ...expense, ...updates };
        if (updates.categoryId) {
          toast({
            title: "Category updated",
            description: `Transaction categorized as ${
              categories.find((c) => c.id === updates.categoryId)?.name
            }`,
          });
        }
        return updatedExpense;
      }
      return expense;
    }));
  };

  const addBudget = (budget: Budget) => {
    const existingBudgetIndex = budgets.findIndex(
      (b) => b.categoryId === budget.categoryId
    );

    if (existingBudgetIndex >= 0) {
      const updatedBudgets = [...budgets];
      updatedBudgets[existingBudgetIndex] = budget;
      setBudgets(updatedBudgets);
    } else {
      setBudgets([...budgets, budget]);
    }

    toast({
      title: "Budget updated",
      description: `Budget for ${
        categories.find((c) => c.id === budget.categoryId)?.name
      } set to $${budget.amount.toFixed(2)}`,
    });
  };

  const processReceipt = async (file: File) => {
    try {
      setIsProcessing(true);
      toast({
        title: "Processing statement",
        description: "Your bank statement is being analyzed with AI...",
      });

      // Process the bank statement with Gemini AI
      const transactions = await processInvoiceWithGemini(file);
      
      // Create a new array of expenses
      const newExpenses = transactions.map((transaction, index) => ({
        id: `exp-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        amount: transaction.amount,
        categoryId: transaction.categoryId || categories[0].id,
        description: transaction.description || "Bank transaction",
        date: transaction.date || new Date().toISOString(),
        paymentMethod: transaction.paymentMethod || "bank",
      }));

      // Add all new expenses at once
      setExpenses(prevExpenses => [...prevExpenses, ...newExpenses]);
      
      // Show success toast
      toast({
        title: "Statement processed successfully",
        description: `Added ${newExpenses.length} transactions`,
      });
    } catch (error) {
      console.error('Error processing statement:', error);
      toast({
        title: "Error processing statement",
        description: error instanceof Error ? error.message : "Failed to process statement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 overflow-auto">
        <Dashboard
          expenses={expenses}
          categories={categories}
          budgets={budgets}
          onAddExpense={() => setIsAddExpenseModalOpen(true)}
          onUpdateBudget={addBudget}
          onUploadInvoice={processReceipt}
          onUpdateExpense={updateExpense}
          activeView={activeView}
          isProcessing={isProcessing}
        />
      </div>

      <AddExpenseModal
        open={isAddExpenseModalOpen}
        onOpenChange={setIsAddExpenseModalOpen}
        categories={categories}
        onAddExpense={addExpense}
        onProcessReceipt={processReceipt}
      />
    </div>
  );
};

export default Index;
