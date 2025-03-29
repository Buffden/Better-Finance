
import { useState } from "react";
import { Expense, Category, Budget } from "@/types/finance";
import ExpenseOverview from "./ExpenseOverview";
import ExpenseList from "./ExpenseList";
import BudgetManager from "./BudgetManager";
import AIInsights from "./AIInsights";
import { Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  onAddExpense: () => void;
  onUpdateBudget: (budget: Budget) => void;
  onUploadInvoice: (file: File) => void;
  activeView: string;
}

const Dashboard = ({
  expenses,
  categories,
  budgets,
  onAddExpense,
  onUpdateBudget,
  onUploadInvoice,
  activeView,
}: DashboardProps) => {
  const [invoiceUploading, setInvoiceUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceUploading(true);
      onUploadInvoice(file);
      setTimeout(() => setInvoiceUploading(false), 2000);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {activeView === "dashboard" && "Financial Dashboard"}
          {activeView === "expenses" && "Expenses"}
          {activeView === "budget" && "Budget Manager"}
          {activeView === "insights" && "AI Insights"}
        </h1>
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
              className={invoiceUploading ? "opacity-50 pointer-events-none" : ""}
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
        <ExpenseList expenses={expenses} categories={categories} />
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
