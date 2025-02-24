
import { useState, useRef } from "react";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { PricingCard } from "./PricingCard";
import { UploadModal } from "./modals/UploadModal";
import { AgentModal } from "./modals/AgentModal";
import { plans, PLAN_HANDLERS } from "@/config/planConfig";
import { setConversationId } from "@/utils/conversationState";

interface SessionResponse {
  conversation_id: string;
}

export const PricingCards = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const processingInterval = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Array<{
    text: string;
    isAgent: boolean;
    feedback?: { emoji: string; phrase: string };
  }>>([]);

  const feedbacks = [
    { emoji: "👍", phrase: "¡Buen tono de voz!" },
    { emoji: "🎯", phrase: "Excelente explicación" },
    { emoji: "💡", phrase: "Punto clave identificado" }
  ];

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
      if (message.source === "ai") {
        setMessages(prev => [...prev, {
          text: message.message,
          isAgent: true,
          feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)]
        }]);
      } else if (message.source === "user") {
        setMessages(prev => [...prev, {
          text: message.message,
          isAgent: false
        }]);
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
      setMessages([{
        text: "¡Hola! Soy tu agente de análisis. ¿En qué puedo ayudarte?",
        isAgent: true
      }]);
    },
  });

  const startProcessingCountdown = () => {
    setProgressValue(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setProgressValue(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        handleBackendReady();
      }
    }, 100);
  };

  const handleBackendReady = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }
    toast({
      title: "¡Análisis completado!",
      description: "Procesamiento finalizado correctamente",
    });
  };

  const handleFileUpload = (file: File) => {
    if (file && (file.type === "audio/mpeg" || file.type === "audio/mp3" || file.type === "audio/webm")) {
      console.log("Iniciando proceso de subida de archivo:", file.name);
      
      toast({
        title: "Archivo recibido",
        description: "Procesando el archivo de audio...",
      });
      
      startProcessingCountdown();
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
      const conversationId = await conversation.startSession({
        agentId: "0gLnzcbTHPrgMkiYcNFr",
      });
      
      const session: SessionResponse = {
        conversation_id: conversationId
      };
      
      setConversationId(session.conversation_id);
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
          <PricingCard
            key={plan.name}
            {...plan}
            onSelect={handlePlanSelection}
          />
        ))}
      </div>

      <UploadModal 
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onFileUpload={handleFileUpload}
      />

      <AgentModal 
        isOpen={isAgentModalOpen}
        onOpenChange={setIsAgentModalOpen}
        messages={messages}
        onStop={handleStopAgent}
      />
    </div>
  );
};
