
import { Check } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useState } from "react";
import { AudioFeedback } from "../AudioFeedback";

const plans = [
  {
    name: "Básico",
    price: "10",
    description: "Para comenzar con el análisis de ventas",
    features: [
      "Subida de archivos de audio (.webm, .mp3)",
      "Informe de análisis básico",
      "Recomendaciones automáticas",
      "Exportación de resultados"
    ],
    color: "bg-green-500",
    buttonText: "Sube tu audio y obtén el informe"
  },
  {
    name: "Medio",
    price: "30",
    description: "Ideal para equipos en crecimiento",
    features: [
      "Grabación directa en plataforma",
      "Hasta 50 evaluaciones por mes",
      "Informe detallado con insights",
      "2 minutos por grabación"
    ],
    color: "bg-yellow-500",
    buttonText: "Graba y recibe análisis instantáneo",
    recommended: true
  },
  {
    name: "Pro",
    price: "Consultar",
    description: "Consultoría personalizada",
    features: [
      "Grabaciones de hasta 10 minutos",
      "Análisis en tiempo real",
      "Feedback durante la llamada",
      "Sesión de consultoría estratégica"
    ],
    color: "bg-red-500",
    buttonText: "Agenda tu consultoría"
  }
];

export const PricingCards = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name}
            className={`relative p-8 bg-white dark:bg-gray-800 shadow-xl transition-all duration-200 hover:scale-105 ${
              plan.recommended ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {plan.recommended && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="inline-block bg-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-full shadow-lg">
                  Recomendado
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                {plan.name !== "Pro" && <span className="text-gray-600 dark:text-gray-400">/mes</span>}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-gray-600 dark:text-gray-400">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button 
              className="w-full py-6 text-lg font-semibold transition-colors duration-200"
              onClick={() => setSelectedPlan(plan.name)}
            >
              {plan.buttonText}
            </Button>
          </Card>
        ))}
      </div>

      {selectedPlan && (
        <div className="mt-12 animate-fade-in">
          <AudioFeedback />
        </div>
      )}
    </div>
  );
};
