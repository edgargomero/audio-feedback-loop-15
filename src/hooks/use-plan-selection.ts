
import { useState, useRef } from "react";
import { useToast } from "./use-toast";
import { PLAN_HANDLERS } from "@/config/planConfig";

export const usePlanSelection = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const processingInterval = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

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

  const handlePlanSelection = async (planType: string, onStartAgent?: () => Promise<boolean>) => {
    const planConfig = PLAN_HANDLERS[planType];
    console.log(`Plan seleccionado: ${planConfig.name}`);
    
    if (planType === 'BASIC') {
      setIsUploadModalOpen(true);
      return;
    }
    
    if (planType === 'MEDIUM') {
      if (onStartAgent) {
        const success = await onStartAgent();
        if (success) {
          setIsAgentModalOpen(true);
        }
      }
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

  return {
    selectedPlan,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isAgentModalOpen,
    setIsAgentModalOpen,
    progressValue,
    handleFileUpload,
    handlePlanSelection
  };
};
