import { Check, Upload, Mic, MessageSquare } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useState, useRef } from "react";
import { AudioFeedback } from "../AudioFeedback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useConversation } from "@11labs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { UploadButton } from "../audio/UploadButton";
import { RecordButton } from "../audio/RecordButton";

interface WhatsappMessages {
  new: string;
  recurring: string;
}

interface PlanConfig {
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

// Configuración de la funcionalidad de cada plan
const PLAN_HANDLERS: PlanHandlers = {
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
    buttonColor: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700", // Cambiado a verde
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
      if (message.type === "agent_response") {
        toast({
          title: "Respuesta del agente",
          description: message.content,
        });
      }
    },
    onError: (error) => {
      console.error("Error en la conversación:", error);
      toast({
        title: "Error",
        description: "Error de conexión con el agente",
        variant: "destructive",
      });
    },
    onConnect: () => {
      console.log("Conexión establecida");
      toast({
        title: "Conectado",
        description: "Conexión establecida con el agente",
      });
    },
  });

  const handleFileUpload = (file: File) => {
    if (file && (file.type === "audio/mpeg" || file.type === "audio/mp3" || file.type === "audio/webm")) {
      toast({
        title: "Archivo recibido",
        description: "Procesando el archivo de audio...",
      });
      
      // Simular proceso de carga
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setProgressValue(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          // Simular respuesta del servidor
          setTimeout(() => {
            toast({
              title: "¡Análisis completado!",
              description: "PDF generado correctamente",
            });
          }, 1000);
        }
      }, 500);
      
      setIsUploadModalOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de audio válido (MP3 o WebM)",
        variant: "destructive",
      });
    }
  };

  const handleStartAgent = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      conversation.startSession({
        agentId: "DnScXfRTfQyBlJMBhfKb",
      });
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
    }
  };

  const handleStopAgent = () => {
    conversation.endSession();
    setIsAgentModalOpen(false);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        handleFileUpload(file);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: "Grabación iniciada",
        description: "Hablando...",
      });
    } catch (error) {
      console.error("Error al iniciar la grabación:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la grabación",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast({
        title: "Grabación finalizada",
        description: "Procesando audio...",
      });
    }
  };

  const handlePlanSelection = (planType: string) => {
    const planConfig = PLAN_HANDLERS[planType];
    console.log(`Plan seleccionado: ${planConfig.name}`);
    
    if (planType === 'BASIC') {
      setIsUploadModalOpen(true);
      return;
    }
    
    if (planType === 'MEDIUM') {
      setIsAgentModalOpen(true);
      handleStartAgent();
      return;
    }
    
    if (planType === 'PRO' && planConfig.whatsappMessages) {
      const isRecurring = false;
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

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir o Grabar Audio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
                <TabsTrigger value="record">Grabar Audio</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-4">
                <UploadButton onFileUpload={handleFileUpload} />
              </TabsContent>
              <TabsContent value="record" className="mt-4">
                <div className="flex flex-col items-center gap-4">
                  <RecordButton
                    isRecording={isRecording}
                    onToggleRecording={isRecording ? handleStopRecording : handleStartRecording}
                  />
                  <p className="text-sm text-gray-500">
                    {isRecording ? "Haz click para detener" : "Haz click para empezar a grabar"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            {progressValue > 0 && progressValue < 100 && (
              <div className="space-y-2">
                <Progress value={progressValue} />
                <p className="text-sm text-center text-gray-500">
                  Procesando audio... {progressValue}%
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal del Agente */}
      <Dialog open={isAgentModalOpen} onOpenChange={(open) => {
        if (!open) handleStopAgent();
        setIsAgentModalOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conversación con el Agente</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                El agente está escuchando. Habla para interactuar.
              </p>
              <Button 
                onClick={handleStopAgent}
                variant="destructive"
              >
                Finalizar Conversación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedPlan && selectedPlan !== 'BASIC' && !isAgentModalOpen && (
        <div className="mt-12 animate-fade-in">
          <AudioFeedback />
        </div>
      )}
    </div>
  );
};
