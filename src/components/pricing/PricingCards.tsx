
import { Check } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useState } from "react";
import { AudioFeedback } from "../AudioFeedback";

// Configuración de la funcionalidad de cada plan
const PLAN_HANDLERS = {
  BASIC: {
    name: "Básico",
    description: "Sube un archivo de audio y recibe un análisis detallado",
    handler: "MAKE_WEBHOOK", // Indica que usa el webhook de Make
    maxDuration: null, // Sin límite de duración para archivos
    type: "upload"
  },
  MEDIUM: {
    name: "Medio",
    description: "Graba directamente y recibe feedback instantáneo",
    handler: "ELEVEN_LABS", // Indica que usa ElevenLabs
    maxDuration: 120, // 2 minutos en segundos
    type: "record"
  },
  PRO: {
    name: "Pro",
    description: "Análisis en tiempo real con consultoría personalizada",
    handler: "ELEVEN_LABS", // Usa ElevenLabs con configuración especial
    maxDuration: 600, // 10 minutos en segundos
    type: "record_realtime"
  }
};

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
    color: "bg-[#10B981]",
    buttonText: "Sube tu audio y obtén el informe",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    planType: "BASIC"
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
    color: "bg-[#FBBF24]",
    buttonText: "Graba y recibe análisis instantáneo",
    recommended: true,
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    planType: "MEDIUM"
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
    color: "bg-[#EF4444]",
    buttonText: "Agenda tu consultoría",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    planType: "PRO"
  }
];

export const PricingCards = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelection = (planType: string) => {
    const planConfig = PLAN_HANDLERS[planType as keyof typeof PLAN_HANDLERS];
    console.log(`Plan seleccionado: ${planConfig.name}`);
    console.log(`Tipo de handler: ${planConfig.handler}`);
    console.log(`Duración máxima: ${planConfig.maxDuration || 'Sin límite'}`);
    console.log(`Tipo de interacción: ${planConfig.type}`);
    
    setSelectedPlan(planType);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name}
            className={`relative p-8 bg-[#1a1f2e] border-0 shadow-xl transition-all duration-200 hover:scale-105 ${
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
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                {plan.name !== "Pro" && <span className="text-gray-400">/mes</span>}
              </div>
              <p className="text-gray-400 mb-6">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start text-gray-300">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              className={`w-full py-6 text-lg font-semibold ${plan.buttonColor} text-white transition-all duration-200`}
              onClick={() => handlePlanSelection(plan.planType)}
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
