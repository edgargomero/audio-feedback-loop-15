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

        {/* Banner de cierre */}
        <div className="mt-20 relative overflow-hidden rounded-2xl">
          <div 
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d')",
              filter: "brightness(0.3)"
            }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 py-16 bg-gradient-to-r from-blue-900/80 to-transparent">
            <div className="text-white max-w-2xl mb-8 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Potencia tu Equipo Ahora y Lleva tus Ventas al Siguiente Nivel
              </h2>
              <p className="text-lg md:text-xl text-gray-200 mb-6">
                Únete a los equipos que ya están transformando sus conversaciones en ventas exitosas con análisis inteligente en tiempo real.
              </p>
              <div className="flex gap-4 items-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  onClick={scrollToPricing}
                >
                  Comenzar Ahora
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>14 días de prueba gratis</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                alt="Equipo trabajando"
                className="w-80 h-80 object-cover rounded-lg shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
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
