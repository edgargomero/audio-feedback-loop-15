
import { AudioFeedback } from "@/components/AudioFeedback";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { PricingCards } from "@/components/pricing/PricingCards";

const Index = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Análisis de Ventas en Tiempo Real
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Feedback instantáneo para optimizar tu proceso de ventas
          </p>
          <Button 
            size="lg" 
            className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 hover:scale-105"
          >
            Elige tu nivel y mejora tus resultados
          </Button>
        </div>

        {/* Pricing Section */}
        <PricingCards />
      </div>
    </div>
  );
};

export default Index;
