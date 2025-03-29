
import { Home, PieChart, Receipt, Lightbulb, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: "dashboard" | "expenses" | "budget" | "insights") => void;
}

const Sidebar = ({ activeView, setActiveView }: SidebarProps) => {
  const navItems = [
    {
      name: "Dashboard",
      icon: Home,
      value: "dashboard",
    },
    {
      name: "Expenses",
      icon: Receipt,
      value: "expenses",
    },
    {
      name: "Budget",
      icon: DollarSign,
      value: "budget",
    },
    {
      name: "Insights",
      icon: Lightbulb,
      value: "insights",
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="flex items-center mb-8">
        <PieChart className="h-8 w-8 text-blue-700" />
        <h1 className="text-xl font-bold ml-2 text-gray-900">FinanceAI</h1>
      </div>

      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.value}>
              <button
                onClick={() => setActiveView(item.value as any)}
                className={cn(
                  "flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors",
                  activeView === item.value
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 mr-3",
                    activeView === item.value ? "text-blue-700" : "text-gray-500"
                  )}
                />
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">AI Assistant</h3>
          <p className="text-xs text-blue-600 mt-1">
            Your expenses are 15% higher than last month. Need help with budgeting?
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
