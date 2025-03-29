import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Sidebar from "@/components/Sidebar";
import AddExpenseModal from "@/components/AddExpenseModal";
import { Expense, Category, Budget } from "@/types/finance";
import { useToast } from "@/components/ui/use-toast";
import { defaultCategories } from "@/data/defaultCategories";
import { processInvoiceWithGemini } from "@/lib/gemini";

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
  const { toast } = useToast();

  const addExpense = (expense: Expense) => {
    setExpenses([...expenses, { ...expense, id: `exp-${Date.now()}` }]);
    toast({
      title: "Expense added",
      description: `$${expense.amount.toFixed(2)} added to ${
        categories.find((c) => c.id === expense.categoryId)?.name
      }`,
    });
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

  const uploadInvoice = async (file: File) => {
    try {
      toast({
        title: "Processing bank statement",
        description: "Your statement is being processed with AI...",
      });

      // Process the bank statement with Gemini AI
      const processedTransactions = await processInvoiceWithGemini(file);
      
      // Add each transaction as an expense
      const newExpenses = processedTransactions.map(transaction => ({
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...transaction
      }));

      setExpenses(prevExpenses => [...prevExpenses, ...newExpenses]);
      
      toast({
        title: "Statement processed successfully",
        description: `Added ${newExpenses.length} transactions from your bank statement`,
      });
    } catch (error) {
      toast({
        title: "Error processing statement",
        description: error instanceof Error ? error.message : "Failed to process statement",
        variant: "destructive",
      });
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
          onUploadInvoice={uploadInvoice}
          activeView={activeView}
        />
      </div>

      <AddExpenseModal
        open={isAddExpenseModalOpen}
        onOpenChange={setIsAddExpenseModalOpen}
        categories={categories}
        onAddExpense={addExpense}
      />
    </div>
  );
};

export default Index;
