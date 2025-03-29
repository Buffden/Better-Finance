
import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import Sidebar from "@/components/Sidebar";
import AddExpenseModal from "@/components/AddExpenseModal";
import { Expense, Category, Budget } from "@/types/finance";
import { useToast } from "@/components/ui/use-toast";
import { initialCategories, initialExpenses } from "@/data/sampleData";

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [categories] = useState<Category[]>(initialCategories);
  const [budgets, setBudgets] = useState<Budget[]>(
    initialCategories.map((category) => ({
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
    // In a real app, we would process the invoice with Gemini API here
    toast({
      title: "Processing invoice",
      description: "Your invoice is being processed...",
    });

    // Simulate AI processing with a timeout
    setTimeout(() => {
      const mockExpense: Expense = {
        id: `exp-${Date.now()}`,
        amount: Math.floor(Math.random() * 100) + 10,
        categoryId: "food",
        date: new Date().toISOString(),
        description: `Invoice: ${file.name}`,
        paymentMethod: "card",
      };

      setExpenses([...expenses, mockExpense]);
      toast({
        title: "Invoice processed",
        description: `Expense of $${mockExpense.amount.toFixed(2)} added from invoice`,
      });
    }, 2000);
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
