import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  BarChart2,
  Brain,
  Upload,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface LandingPageProps {
  onUploadInvoice: (file: File) => void;
}

const LandingPage = ({ onUploadInvoice }: LandingPageProps) => {
  const features = [
    {
      title: "Smart Expense Tracking",
      description: "Automatically categorize and track your expenses with AI-powered intelligence",
      icon: PieChart,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Budget Management",
      description: "Set and monitor budgets with interactive visualizations and real-time alerts",
      icon: BarChart2,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "AI-Powered Insights",
      description: "Get personalized financial advice and spending pattern analysis",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      title: "Secure Processing",
      description: "Your financial data is processed securely with state-of-the-art encryption",
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-50"
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadInvoice(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Transform Your Finances with AI
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Upload your invoices and let our AI analyze your spending patterns, provide personalized insights,
            and help you make better financial decisions.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <div className="relative">
              <input
                type="file"
                id="invoice-upload"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl flex items-center gap-2 text-lg group"
              >
                <Upload className="h-5 w-5" />
                Upload Invoice
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">98%</div>
              <div className="mt-2 text-gray-600">Accuracy in expense categorization</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">30%</div>
              <div className="mt-2 text-gray-600">Average savings for users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">24/7</div>
              <div className="mt-2 text-gray-600">AI-powered financial insights</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <Card className="bg-blue-600 text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold mb-4">
                Start Your Financial Journey Today
              </h2>
              <p className="text-blue-100 mb-6">
                Join thousands of users who have transformed their financial habits with FinanceFlow
              </p>
              <div className="relative inline-block">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8"
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Get Started Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 