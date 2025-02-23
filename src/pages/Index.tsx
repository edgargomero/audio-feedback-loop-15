
import { AudioFeedback } from "@/components/AudioFeedback";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Users, LineChart, Timer, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { PricingCards } from "@/components/pricing/PricingCards";
import { ActionButtons } from "@/components/ActionButtons";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const { theme, setTheme } = useTheme();

  const handleRecordClick = () => {
    toast({
      title: "Inicializando grabación",
      description: "Preparando el sistema de grabación de audio...",
    });
    // Aquí iría la lógica de grabación
  };

  const handleAnalysisClick = () => {
    toast({
      title: "Análisis en Tiempo Real",
      description: "Conectando con el sistema de análisis...",
    });
    // Aquí iría la lógica de análisis
  };

  const handleConsultingClick = () => {
    window.open('https://wa.me/+34123456789?text=Hola,%20me%20interesa%20agendar%20una%20consultoría', '_blank');
  };

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
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Convierte Más Ventas con Análisis Inteligente en Tiempo Real
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Feedback inmediato, informes claros y asesoría personalizada para que cierres más negocios
          </p>

          {/* Metrics/Badges Section */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-2 shadow-lg">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-gray-800 dark:text-white font-semibold">+100 Equipos Felices</span>
            </div>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-2 shadow-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-800 dark:text-white font-semibold">90% de Precisión</span>
            </div>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-2 shadow-lg">
              <Timer className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-gray-800 dark:text-white font-semibold">Resultados en Tiempo Real</span>
            </div>
          </div>

          <Button 
            size="lg" 
            className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-6 rounded-lg text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl group"
          >
            ¡Optimiza tus Ventas Ahora!
            <LineChart className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Pricing Section */}
        <PricingCards />

        {/* Action Buttons Section */}
        <ActionButtons 
          onRecordClick={handleRecordClick}
          onAnalysisClick={handleAnalysisClick}
          onConsultingClick={handleConsultingClick}
        />
      </div>
    </div>
  );
};

export default Index;
