<<<<<<< HEAD

import { Check, Upload, Mic, MessageSquare } from "lucide-react";
=======
import { Check, Upload, Mic, MessageSquare, FileDown } from "lucide-react";
>>>>>>> frontend/main
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useState, useRef, useEffect } from "react";
import { AudioFeedback } from "../AudioFeedback";
<<<<<<< HEAD
=======
import { ChatMessage } from "../chat/ChatMessage";
>>>>>>> frontend/main
import { useConversation } from "@11labs/react";
import { uploadToSupabase } from "@/utils/uploadUtils";
import { MAKE_WEBHOOK_URL } from "@/utils/constants";
import { toast } from "@/components/ui/use-toast";
import { useConversation } from "@11labs/react";
<<<<<<< HEAD
=======
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { UploadButton } from "../audio/UploadButton";
import { RecordButton } from "../audio/RecordButton";
import { ProcessingCountdown } from "../audio/ProcessingCountdown";
import { ScrollArea } from "@/components/ui/scroll-area";
>>>>>>> frontend/main

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
import { UploadModal } from "./modals/UploadModal";
import { AgentModal } from "./modals/AgentModal";
import { PricingCard } from "./PricingCard";
import { plans, PLAN_HANDLERS } from "@/config/planConfig";

export const PricingCards = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
<<<<<<< HEAD
=======
  const [isRecording, setIsRecording] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTimeLeft, setProcessingTimeLeft] = useState(120);
  const processingInterval = useRef<NodeJS.Timeout>();
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Array<{
    text: string;
    isAgent: boolean;
    feedback?: { emoji: string; phrase: string };
  }>>([]);

  // Ejemplo de feedbacks para prueba
  const feedbacks = [
    { emoji: "👍", phrase: "¡Buen tono de voz!" },
    { emoji: "🎯", phrase: "Excelente explicación" },
    { emoji: "💡", phrase: "Punto clave identificado" }
  ];

  const startProcessingCountdown = () => {
    setIsProcessing(true);
    setProcessingTimeLeft(15); // Cambiado a 15 segundos
    setPdfReady(false);
    setPdfUrl(null);

    processingInterval.current = setInterval(() => {
      setProcessingTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(processingInterval.current);
          setIsProcessing(false);
          setPdfReady(true);
          setPdfUrl('https://ejemplo.com/analisis.pdf');
          toast({
            title: "¡Análisis completado!",
            description: "PDF listo para descargar",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
>>>>>>> frontend/main

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
<<<<<<< HEAD
      if (message.type === "agent_response") {
        toast({
          title: "Respuesta del agente",
          description: message.content,
        });
=======
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
>>>>>>> frontend/main
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
<<<<<<< HEAD
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
=======
      setMessages([{
        text: "¡Hola! Soy tu agente de análisis. ¿En qué puedo ayudarte?",
        isAgent: true
      }]);
    },
  });

  const handleBackendReady = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }
    setIsProcessing(false);
    setPdfReady(true);
    setPdfUrl('https://ejemplo.com/analisis.pdf');
    toast({
      title: "¡Análisis completado!",
      description: "PDF generado correctamente",
    });
  };

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      // Aquí iría la lógica real de descarga del PDF
      toast({
        title: "Descargando PDF",
        description: "Tu análisis se está descargando...",
      });
    }
  };

  const cancelProcessing = () => {
    if (processingInterval.current) {
      clearInterval(processingInterval.current);
    }
    setIsProcessing(false);
    setProgressValue(0);
    setProcessingTimeLeft(120);
    setPdfReady(false);
    setPdfUrl(null);
    toast({
      title: "Procesamiento cancelado",
      description: "Se ha cancelado el procesamiento del audio",
    });
  };

  useEffect(() => {
    return () => {
      if (processingInterval.current) {
        clearInterval(processingInterval.current);
      }
    };
  }, []);

  const handleFileUpload = (file: File) => {
    if (file && (file.type === "audio/mpeg" || file.type === "audio/mp3" || file.type === "audio/webm")) {
>>>>>>> frontend/main
        console.log("Iniciando proceso de subida de archivo:", file.name);
        
        toast({
          title: "Archivo recibido",
          description: "Procesando el archivo de audio...",
        });
<<<<<<< HEAD
        
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
=======
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setProgressValue(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          startProcessingCountdown();
        }
      }, 100);
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de audio válido (MP3 o WebM)",
>>>>>>> frontend/main
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
<<<<<<< HEAD
=======

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
      // No cerramos el modal aquí
      toast({
        title: "Grabación finalizada",
        description: "Procesando audio...",
      });
    }
  };
>>>>>>> frontend/main

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

<<<<<<< HEAD
      {/* Modal de Subir Audio */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir Archivo de Audio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="audio-file" className="sr-only">
                Seleccionar archivo
              </label>
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <label 
                    htmlFor="audio-file" 
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      Arrastra tu archivo aquí o haz click para seleccionar
                    </span>
                  </label>
                  <Input
                    id="audio-file"
                    type="file"
                    accept="audio/mpeg,audio/mp3"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  Formatos soportados: MP3 (máximo 10MB)
                </span>
              </div>
            </div>
=======
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
            
            {isProcessing && (
              <div className="space-y-4">
                <ProcessingCountdown
                  timeLeft={processingTimeLeft}
                  onCancel={cancelProcessing}
                />
              </div>
            )}

            {pdfReady && pdfUrl && (
              <div className="flex flex-col items-center gap-4 pt-4">
                <p className="text-sm text-green-600 font-medium">
                  ¡Tu análisis está listo!
                </p>
                <Button
                  onClick={handleDownloadPDF}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>
            )}
>>>>>>> frontend/main
          </div>
        </DialogContent>
      </Dialog>

<<<<<<< HEAD
      {/* Modal del Agente */}
=======
>>>>>>> frontend/main
      <Dialog open={isAgentModalOpen} onOpenChange={(open) => {
        if (!open) handleStopAgent();
        setIsAgentModalOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conversación con el Agente</DialogTitle>
          </DialogHeader>
<<<<<<< HEAD
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                El agente está escuchando. Habla para interactuar.
              </p>
              <Button 
                onClick={handleStopAgent}
                variant="destructive"
=======
          <div className="flex flex-col gap-6">
            <ScrollArea className="h-[400px] p-4 rounded-md border">
              <div className="flex flex-col gap-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message.text}
                    isAgent={message.isAgent}
                    feedback={message.feedback}
                  />
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-center">
              <Button 
                onClick={handleStopAgent}
                variant="destructive"
                className="w-full max-w-xs"
>>>>>>> frontend/main
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
