
import { AudioFeedback } from "@/components/AudioFeedback";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Users, LineChart, Timer, CheckCircle2, ArrowUp } from "lucide-react";
import { useTheme } from "next-themes";
import { PricingCards } from "@/components/pricing/PricingCards";
import { TestimonialsAndStats } from "@/components/TestimonialsAndStats";
import { FAQ } from "@/components/FAQ";
import { useRef } from "react";

const Index = () => {
  const { theme, setTheme } = useTheme();
  const pricingRef = useRef<HTMLDivElement>(null);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            onClick={scrollToPricing}
          >
            ¡Optimiza tus Ventas Ahora!
            <LineChart className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Testimonials and Stats Section */}
        <TestimonialsAndStats />

        {/* Pricing Section */}
        <div ref={pricingRef}>
          <PricingCards />
        </div>

        {/* FAQ Section */}
        <FAQ />
      </div>

      {/* Botón flotante para volver arriba */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-8 right-8 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 animate-fade-in"
        onClick={scrollToTop}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default Index;
