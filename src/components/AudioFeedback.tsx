import { useState, useRef } from "react";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "@11labs/react";
import { RecordButton } from "./audio/RecordButton";
import { ExtraRecordButton } from "./audio/ExtraRecordButton";
import { UploadButton } from "./audio/UploadButton";
import { FeedbackDisplay } from "./audio/FeedbackDisplay";
import { useSalesAnalysis } from "../hooks/use-sales-analysis";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { FileDown } from "lucide-react";

export const AudioFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingExtra, setIsRecordingExtra] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const progressInterval = useRef<NodeJS.Timeout>();
  const timeInterval = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { feedback, setFeedback, analyzeSalesStage, analyzeFeedback } = useSalesAnalysis();

  const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/fdfea2uux2sa7todteplybdudo45qpwm';

  const conversation = useConversation({
    onMessage: (message) => {
      console.log("Mensaje recibido:", message);
      
      if (message.type === "agent_response") {
        try {
          const analysis = JSON.parse(message.content);
          analyzeSalesStage(analysis);
        } catch (e) {
          analyzeFeedback(message.content);
        }
      }
    },
    onError: (error) => {
      console.error("Error en la conversación:", error);
      toast({
        title: "Error",
        description: "❌ Error de conexión",
        variant: "destructive",
      });
    },
    onConnect: () => {
      console.log("Conexión establecida");
      setFeedback({
        type: "positive",
        message: "Conectado ✅",
      });
    },
    onDisconnect: () => {
      console.log("Desconectado");
      stopProgressAndTime();
      setIsRecording(false);
      setFeedback({
        type: "neutral",
        message: "Fin 👋",
      });
    }
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startProgressAndTime = () => {
    setProgressValue(0);
    setRecordingTime(0);
    
    progressInterval.current = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    timeInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopProgressAndTime = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    if (timeInterval.current) {
      clearInterval(timeInterval.current);
    }
    setProgressValue(100);
  };

  const handleStartRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      startProgressAndTime();
      setFeedback({
        type: "neutral",
        message: "Iniciando... 🎤",
      });
      
      conversation.startSession({
        agentId: "DnScXfRTfQyBlJMBhfKb",
      });
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      toast({
        title: "Error",
        description: "No hay micrófono ❌",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    stopProgressAndTime();
    setIsRecording(false);
    conversation.endSession();
    // Simulamos la recepción del PDF después de 2 segundos
    setTimeout(() => {
      setAnalysisResult("analysis_result.pdf");
      toast({
        title: "¡Análisis completado!",
        description: "PDF generado y listo para descargar ✅",
      });
    }, 2000);
  };

  const handleFileUpload = async (file: File) => {
    try {
      startProgressAndTime();
      const formData = new FormData();
      formData.append('audio', file);
      
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        stopProgressAndTime();
        // Simulamos la recepción del PDF después de 2 segundos
        setTimeout(() => {
          setAnalysisResult("analysis_result.pdf");
          toast({
            title: "¡Análisis completado!",
            description: "PDF generado y listo para descargar ✅",
          });
        }, 2000);
      } else {
        throw new Error('Error al enviar el archivo');
      }
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      stopProgressAndTime();
      toast({
        title: "Error",
        description: "Error al enviar el archivo a Make ❌",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    // Aquí simularemos la descarga del PDF
    toast({
      title: "Descargando PDF",
      description: "Iniciando descarga del análisis...",
    });
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-10 shadow-lg bg-white dark:bg-gray-800">
      <div className="space-y-6">
        <div className="flex justify-center gap-4">
          <RecordButton 
            isRecording={isRecording}
            onToggleRecording={isRecording ? handleStopRecording : handleStartRecording}
          />
          <UploadButton onFileUpload={handleFileUpload} />
        </div>

        {(isRecording) && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Grabando...</span>
              <span>{formatTime(recordingTime)}</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        )}

        <FeedbackDisplay 
          type={feedback.type}
          message={feedback.message}
          stage={feedback.stage}
        />

        {/* Zona de descarga del PDF */}
        {analysisResult && (
          <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileDown className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {analysisResult}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2"
              >
                <FileDown className="h-4 w-4" />
                <span>Descargar</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
