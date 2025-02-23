
import { Upload, Mic, MessageSquare } from "lucide-react";

interface WhatsappMessages {
  new: string;
  recurring: string;
}

export interface PlanConfig {
  name: string;
  description: string;
  handler: string;
  maxDuration: number | null;
  type: string;
  whatsappMessages?: WhatsappMessages;
}

type PlanHandlers = {
  [key: string]: PlanConfig;
};

export const PLAN_HANDLERS: PlanHandlers = {
  BASIC: {
    name: "Básico",
    description: "Sube un archivo de audio y recibe un análisis detallado",
    handler: "MAKE_WEBHOOK",
    maxDuration: null,
    type: "upload"
  },
  MEDIUM: {
    name: "Medio",
    description: "Graba directamente y recibe feedback instantáneo",
    handler: "ELEVEN_LABS",
    maxDuration: 120,
    type: "record"
  },
  PRO: {
    name: "Pro",
    description: "Análisis en tiempo real con consultoría personalizada",
    handler: "ELEVEN_LABS",
    maxDuration: 600,
    type: "record_realtime",
    whatsappMessages: {
      new: "¡Hola! 👋 Estoy interesado en el Plan Pro de análisis de ventas y me gustaría agendar una consultoría personalizada. 📊💡 ¿Podrías brindarme más información? ¡Gracias! 🙌",
      recurring: "¡Hola de nuevo! 👋 Estoy listo para mi próxima sesión de análisis. ¿Podemos agendar una fecha? 📅✨"
    }
  }
};

export const plans = [
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
