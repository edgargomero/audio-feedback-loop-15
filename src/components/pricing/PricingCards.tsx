
import { useState } from "react";
import { AudioFeedback } from "../AudioFeedback";
import { useConversation } from "@11labs/react";
import { uploadToSupabase } from "@/utils/uploadUtils";
import { MAKE_WEBHOOK_URL } from "@/utils/constants";
import { toast } from "@/components/ui/use-toast";
import { UploadModal } from "./modals/UploadModal";
import { AgentModal } from "./modals/AgentModal";
import { PricingCard } from "./PricingCard";
import { plans, PLAN_HANDLERS } from "@/config/planConfig";

export const PricingCards = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "audio/mpeg" || file.type === "audio/mp3" || file.type === "audio/webm") {
        console.log("Iniciando proceso de subida de archivo:", file.name);
        
        toast({
          title: "Archivo recibido",
          description: "Procesando el archivo de audio...",
        });
        
        const audioBlob = new Blob([file], { type: file.type });
        uploadToSupabase(audioBlob)
          .then((publicUrl) => {
            if (publicUrl) {
              console.log("Archivo subido exitosamente:", publicUrl);
              const formData = new FormData();
              formData.append('audioUrl', publicUrl);
              
              return fetch(MAKE_WEBHOOK_URL, {
                method: 'POST',
                body: formData
              });
            } else {
              throw new Error('Error al subir el archivo a Supabase');
            }
          })
          .then(response => {
            if (!response?.ok) {
              throw new Error('Error al procesar el audio en Make');
            }
            toast({
              title: "¡Éxito!",
              description: "Audio procesado correctamente ✅",
            });
          })
          .catch((error) => {
            console.error("Error en el proceso:", error);
            toast({
              title: "Error",
              description: "Error al procesar el archivo ❌",
              variant: "destructive",
            });
          });
      } else {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de audio válido (MP3 o WebM)",
          variant: "destructive",
        });
      }
    }
    setIsUploadModalOpen(false);
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
        onStopAgent={handleStopAgent}
      />

      {selectedPlan && selectedPlan !== 'BASIC' && !isAgentModalOpen && (
        <div className="mt-12 animate-fade-in">
          <AudioFeedback />
        </div>
      )}
    </div>
  );
};
