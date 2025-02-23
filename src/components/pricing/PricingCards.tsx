import { Check, Upload, Mic, MessageSquare } from "lucide-react";
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
    type: "record_realtime",
    whatsappMessages: {
      new: "¡Hola! 👋 Estoy interesado en el Plan Pro de análisis de ventas y me gustaría agendar una consultoría personalizada. 📊💡 ¿Podrías brindarme más información? ¡Gracias! 🙌",
      recurring: "¡Hola de nuevo! 👋 Estoy listo para mi próxima sesión de análisis. ¿Podemos agendar una fecha? 📅✨"
    }
  }
};

const plans = [
  {
    name: "Básico",
    price: "10",
    description: "Sube tu audio y obtén un informe detallado en minutos",
    features: [
      "Subida de archivos de audio (.webm, .mp3)",
      "Informe de análisis básico",
      "Recomendaciones automáticas",
      "Exportación de resultados"
    ],
    icon: Upload,
    buttonText: "Subir Audio",
    buttonColor: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    planType: "BASIC"
  },
  {
    name: "Medio",
    price: "30",
    description: "Graba directamente desde la plataforma y obtén análisis detallados",
    features: [
      "Grabación directa en plataforma",
      "Hasta 50 evaluaciones por mes",
      "Informe detallado con insights",
      "2 minutos por grabación"
    ],
    icon: Mic,
    buttonText: "Grabar y Analizar",
    recommended: true,
    buttonColor: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    planType: "MEDIUM"
  },
  {
    name: "Pro",
    price: "Consultar",
    description: "Análisis en tiempo real + Consultoría personalizada",
    features: [
      "Grabaciones de hasta 10 minutos",
      "Análisis en tiempo real",
      "Feedback durante la llamada",
      "Sesión de consultoría estratégica"
    ],
    icon: MessageSquare,
    buttonText: "Habla con un Asesor",
    buttonColor: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
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
    
    if (planType === 'PRO') {
      const isRecurring = false; // Aquí podrías implementar la lógica para detectar clientes recurrentes
      const message = isRecurring 
        ? planConfig.whatsappMessages.recurring 
        : planConfig.whatsappMessages.new;
      
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/+34123456789?text=${encodedMessage}`, '_blank');
      return;
    }
    
    setSelectedPlan(planType);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name}
            className={`relative p-8 bg-[#1a1f2e] border-0 shadow-xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl ${
              plan.recommended ? 'ring-2 ring-green-500' : ''
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="inline-block bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-1 text-sm font-semibold rounded-full shadow-lg">
                  Recomendado
                </span>
              </div>
            )}
            
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full flex items-center justify-center">
                {plan.icon && <plan.icon className="h-6 w-6 text-blue-500" />}
              </div>
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
              className={`w-full py-6 text-lg font-semibold text-white transition-all duration-300 ${plan.buttonColor} shadow-lg hover:shadow-xl`}
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
